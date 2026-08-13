import pool from "@/config/db";
import { playlistQueries } from "@/queries/playlist";
import { 
    GetUserPlaylistsDto, 
    GetUserPlaylistsResponse, 
    GetUserPlaylistsResponseItem,
    GetLikedPlaylistsDto,
    GetLikedPlaylistsResponse,
    GetLikedPlaylistsResponseItem
} from "@/types/playlist.types";
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
