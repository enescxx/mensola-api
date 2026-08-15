import pool from "@/config/db";
import { albumQueries } from "@/queries/album.queries";
import {
    GetLikedAlbumsDto,
    GetLikedAlbumsResponse,
    GetLikedAlbumsResponseItem,
    GetAlbumDetailsDto,
    GetAlbumDetailsResponse,
} from "@/types/album.types";
import { ApiError } from "@/utils/error";

/**
 * Retrieves albums liked by a specific user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns A promise that resolves to a paginated list of liked albums.
 */
export const getLikedAlbums = async (dto: GetLikedAlbumsDto): Promise<GetLikedAlbumsResponse> => {
    if (!dto.userId) {
        throw new ApiError("userId is invalid", 400);
    }

    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<GetLikedAlbumsResponseItem>(albumQueries.likes.get, [
        dto.userId,
        dto.limit,
        offset,
    ]);

    return result.rows;
};

/**
 * Retrieves detailed information for a specific album.
 *
 * @param dto - Data transfer object containing albumId and optional currentUserId.
 * @returns A promise that resolves to album details.
 */
export const getAlbumById = async (dto: GetAlbumDetailsDto): Promise<GetAlbumDetailsResponse> => {
    const { albumId, currentUserId = null } = dto;

    const result = await pool.query<GetAlbumDetailsResponse>(albumQueries.getById, [albumId, currentUserId]);

    const album = result.rows[0];

    if (!album) {
        throw new ApiError("Album not found.", 404);
    }

    return album;
};
