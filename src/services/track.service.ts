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
