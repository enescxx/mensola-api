import pool from "@/config/db";
import { trackQueries } from "@/queries/track";
import { GetLikedTracksDto, GetLikedTracksResponse, GetLikedTracksResponseItem } from "@/types/track.types";
import { ApiError } from "@/utils/error";

/**
 * Retrieves a paginated list of liked tracks for a user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns A promise that resolves to a paginated list of liked tracks.
 */
export const getLikedTracks = async (dto: GetLikedTracksDto): Promise<GetLikedTracksResponse> => {
    if (!dto.userId) {
        throw new ApiError("userId is invalid", 400);
    }

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
