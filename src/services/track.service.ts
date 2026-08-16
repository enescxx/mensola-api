import pool from "@/config/db";
import { trackQueries } from "@/queries/track";
import {
    GetLikedTracksDto,
    GetLikedTracksResponse,
    GetLikedTracksResponseItem,
    GetTrackInteractionsDto,
    UpsertTrackInteractionDto,
} from "@/types/track.types";
import { ApiError } from "@/utils/error";
import { upsertInteractionComment } from "@/utils/interaction";

/**
 * Retrieves a paginated list of liked tracks for a user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns A promise that resolves to a paginated list of liked tracks.
 */
export const getLikedTracks = async (dto: GetLikedTracksDto): Promise<GetLikedTracksResponse> => {
    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<GetLikedTracksResponseItem>(trackQueries.likes.get, [
        dto.userId,
        dto.limit,
        offset,
    ]);

    return result.rows;
};

/**
 * Retrieves track details by its ID, optionally including the current user's interactions.
 *
 * @param trackId - The ID of the track to retrieve.
 * @param userId - Optional ID of the user requesting the track to include their interactions.
 * @returns A promise that resolves to the track details.
 */
export const getTrackById = async (trackId: string, userId?: string) => {
    const result = await pool.query(trackQueries.getById, [trackId, userId || null]);
    if (result.rows.length === 0) {
        throw new ApiError("Track not found", 404);
    }
    return result.rows[0];
};

/**
 * Likes a track for the authenticated user.
 *
 * @param trackId - The ID of the track to like.
 * @param userId - The ID of the user.
 * @returns An object containing trackId and isLiked status.
 */
export const likeTrack = async (trackId: string, userId: string) => {
    // Check if the track exists
    const trackCheck = await pool.query(`SELECT id FROM "Track" WHERE id = $1`, [trackId]);
    if (trackCheck.rows.length === 0) {
        throw new ApiError("Track not found", 404);
    }

    const result = await pool.query(trackQueries.likes.add, [userId, trackId]);
    return result.rows[0];
};

/**
 * Unlikes a track for the authenticated user.
 *
 * @param trackId - The ID of the track to unlike.
 * @param userId - The ID of the user.
 * @returns An object containing trackId and isLiked status.
 */
export const unlikeTrack = async (trackId: string, userId: string) => {
    // Check if the track exists
    const trackCheck = await pool.query(`SELECT id FROM "Track" WHERE id = $1`, [trackId]);
    if (trackCheck.rows.length === 0) {
        throw new ApiError("Track not found", 404);
    }

    const result = await pool.query(trackQueries.likes.remove, [userId, trackId]);
    return result.rows[0] || { trackId, isLiked: false };
};

/**
 * Retrieves all interactions/comments for a specific track.
 *
 * @param dto - Data transfer object containing trackId, page, and limit.
 * @returns A promise that resolves to a list of interactions with comments.
 */
export const getTrackInteractions = async (dto: GetTrackInteractionsDto) => {
    const { trackId, page, limit } = dto;
    const offset = (page - 1) * limit;

    const result = await pool.query(trackQueries.items.getInteractions, [trackId, limit, offset]);

    return result.rows;
};

/**
 * Upserts a user interaction (rating, comment, isLiked) for a track.
 *
 * @param dto - Data transfer object containing userId, trackId, rating, comment, isLiked.
 * @returns A promise that resolves to the saved interaction details.
 */
export const upsertTrackInteraction = async (dto: UpsertTrackInteractionDto) => {
    const { userId, trackId, rating, comment, isLiked } = dto;
    const ratingVal = typeof rating === "number" && rating >= 0 ? rating : null;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const trackCheck = await client.query(`SELECT id FROM "Track" WHERE id = $1`, [trackId]);
        if (trackCheck.rows.length === 0) {
            throw new ApiError("Track not found.", 404);
        }

        const interactionResult = await client.query(trackQueries.interaction.upsert, [
            userId,
            trackId,
            ratingVal,
            isLiked ?? false,
        ]);
        const interaction = interactionResult.rows[0];

        const commentData = await upsertInteractionComment(client, interaction.id, userId, comment);

        await client.query(trackQueries.interaction.cleanupEmpty, [interaction.id]);

        await client.query("COMMIT");

        return {
            id: interaction.id,
            trackId,
            rating: interaction.rating,
            isLiked: interaction.isLiked,
            comment: commentData
                ? { id: commentData.id, content: commentData.content, date: commentData.createdAt }
                : null,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};
