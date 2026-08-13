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

    const accessResult = await pool.query<{ id: string; hasAccess: boolean }>(
        playlistQueries.items.checkAccess,
        [playlistId, currentUserId],
    );

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

    const result = await pool.query<GetPlaylistDetailsResponse>(playlistQueries.getById, [
        playlistId,
        currentUserId,
    ]);

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
