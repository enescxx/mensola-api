import pool from "@/config/db";
import { playlistQueries } from "@/queries/playlist";
import {
    GetUserPlaylistsDto,
    GetUserPlaylistsResponse,
    GetUserPlaylistsResponseItem,
    GetLikedPlaylistsDto,
    GetLikedPlaylistsResponse,
    GetLikedPlaylistsResponseItem,
    GetPlaylistItemsDto,
    GetPlaylistItemsResponse,
    PlaylistItemResponseItem,
    GetPlaylistDetailsDto,
    GetPlaylistDetailsResponse,
    GetPlaylistInteractionsDto,
    UpsertPlaylistInteractionDto,
} from "@/types/playlist";
import { ApiError } from "@/utils/error";

/**
 * Retrieves playlists for a specific user.
 *
 * @param dto - Data transfer object containing userId, currentUserId, page, and limit.
 * @returns A promise that resolves to a paginated list of playlists.
 */
export const getUserPlaylists = async (dto: GetUserPlaylistsDto): Promise<GetUserPlaylistsResponse> => {
    const offset = (dto.page - 1) * dto.limit;
    const currentUserId = dto.currentUserId || null;

    const result = await pool.query<GetUserPlaylistsResponseItem>(playlistQueries.lists.getUserPlaylists, [
        dto.userId,
        currentUserId,
        dto.limit,
        offset,
    ]);

    return result.rows;
};

/**
 * Retrieves playlists liked by a specific user.
 *
 * @param dto - Data transfer object containing userId, currentUserId, page, and limit.
 * @returns A promise that resolves to a paginated list of liked playlists.
 */
export const getLikedPlaylists = async (dto: GetLikedPlaylistsDto): Promise<GetLikedPlaylistsResponse> => {
    if (!dto.userId) {
        throw new ApiError("userId is invalid", 400);
    }

    const offset = (dto.page - 1) * dto.limit;
    const currentUserId = dto.currentUserId || null;

    const result = await pool.query<GetLikedPlaylistsResponseItem>(playlistQueries.likes.get, [
        dto.userId,
        currentUserId,
        dto.limit,
        offset,
    ]);

    return result.rows;
};

/**
 * Retrieves tracks/items within a specific playlist.
 *
 * @param dto - Data transfer object containing playlistId, currentUserId, page, and limit.
 * @returns A promise that resolves to a list of playlist track items.
 */
export const getPlaylistItems = async (dto: GetPlaylistItemsDto): Promise<GetPlaylistItemsResponse> => {
    const { playlistId, currentUserId = null, page, limit } = dto;
    const offset = (page - 1) * limit;

    const accessResult = await pool.query<{ id: string; hasAccess: boolean }>(playlistQueries.items.checkAccess, [
        playlistId,
        currentUserId,
    ]);

    if (accessResult.rows.length === 0) {
        throw new ApiError("Playlist not found.", 404);
    }

    if (!accessResult.rows[0].hasAccess) {
        throw new ApiError("Playlist not found or access denied.", 404);
    }

    const itemsResult = await pool.query<PlaylistItemResponseItem>(playlistQueries.items.getTracks, [
        playlistId,
        currentUserId,
        limit,
        offset,
    ]);

    return itemsResult.rows;
};

/**
 * Retrieves details for a specific playlist.
 *
 * @param dto - Data transfer object containing playlistId and optional currentUserId.
 * @returns A promise that resolves to playlist details.
 */
export const getPlaylistDetails = async (dto: GetPlaylistDetailsDto): Promise<GetPlaylistDetailsResponse> => {
    const { playlistId, currentUserId = null } = dto;

    const result = await pool.query<GetPlaylistDetailsResponse>(playlistQueries.getById, [playlistId, currentUserId]);

    const playlist = result.rows[0];

    if (!playlist) {
        throw new ApiError("Playlist not found or access denied.", 404);
    }

    return playlist;
};

/**
 * Retrieves all interactions/comments for a specific playlist.
 *
 * @param dto - Data transfer object containing playlistId, page, and limit.
 * @returns A promise that resolves to a list of interactions with comments.
 */
export const getPlaylistInteractions = async (dto: GetPlaylistInteractionsDto) => {
    const { playlistId, page, limit } = dto;
    const offset = (page - 1) * limit;

    const result = await pool.query(playlistQueries.items.getInteractions, [playlistId, limit, offset]);

    return result.rows;
};

/**
 * Upserts a user interaction (rating, comment, isLiked) for a playlist.
 *
 * @param dto - Data transfer object containing userId, playlistId, rating, comment, isLiked.
 * @returns A promise that resolves to the saved interaction details.
 */
export const upsertPlaylistInteraction = async (dto: UpsertPlaylistInteractionDto) => {
    const { userId, playlistId, rating, comment, isLiked } = dto;

    const accessResult = await pool.query<{ id: string; hasAccess: boolean }>(
        playlistQueries.items.checkAccess,
        [playlistId, userId],
    );

    if (accessResult.rows.length === 0 || !accessResult.rows[0].hasAccess) {
        throw new ApiError("Playlist not found or access denied.", 404);
    }

    const ratingVal = typeof rating === "number" && rating > 0 ? rating : null;

    const interactionResult = await pool.query(playlistQueries.interaction.upsert, [
        userId,
        playlistId,
        ratingVal,
        isLiked ?? null,
    ]);

    const interaction = interactionResult.rows[0];
    let commentData: any = null;

    if (comment !== undefined) {
        const trimmedComment = comment ? comment.trim() : "";
        if (trimmedComment !== "") {
            const existingComment = await pool.query(
                `SELECT id FROM "Comment" WHERE "interactionId" = $1 AND "parentId" IS NULL`,
                [interaction.id],
            );

            if (existingComment.rows.length > 0) {
                const commentResult = await pool.query(
                    `UPDATE "Comment" SET "content" = $1 WHERE id = $2 RETURNING id, "userId", "interactionId", "content", "createdAt"`,
                    [trimmedComment, existingComment.rows[0].id],
                );
                commentData = commentResult.rows[0];
            } else {
                const commentResult = await pool.query(
                    `INSERT INTO "Comment" (id, "userId", "interactionId", "content", "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id, "userId", "interactionId", "content", "createdAt"`,
                    [userId, interaction.id, trimmedComment],
                );
                commentData = commentResult.rows[0];
            }
        } else {
            await pool.query(`DELETE FROM "Comment" WHERE "interactionId" = $1 AND "parentId" IS NULL`, [
                interaction.id,
            ]);
        }
    } else {
        const existingComment = await pool.query(
            `SELECT id, content, "createdAt" FROM "Comment" WHERE "interactionId" = $1 AND "parentId" IS NULL LIMIT 1`,
            [interaction.id],
        );
        if (existingComment.rows.length > 0) {
            commentData = existingComment.rows[0];
        }
    }

    await pool.query(playlistQueries.interaction.cleanupEmpty, [interaction.id]);

    return {
        id: interaction.id,
        playlistId,
        rating: interaction.rating,
        isLiked: interaction.isLiked,
        comment: commentData ? { id: commentData.id, content: commentData.content, date: commentData.createdAt } : null,
    };
};

