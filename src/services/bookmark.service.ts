import pool from "@/config/db";
import { bookmarkQueries } from "@/queries/bookmark.queries";
import { MovieListId, PlaylistId, UserId } from "@/types/common";
import { ApiError } from "@/utils/error";

export type BookmarkTargetType = "playlist" | "movieList";

export interface ToggleBookmarkDto {
    userId: UserId;
    targetId: PlaylistId | MovieListId;
    targetType: BookmarkTargetType;
}

export interface GetUserBookmarksDto {
    userId: UserId;
    targetType?: BookmarkTargetType;
    page?: number;
    limit?: number;
}

/**
 * Toggles a bookmark for a target item (playlist, album, or movieList).
 * If already bookmarked, it removes it. If not, it creates it.
 */
export const toggleBookmark = async (dto: ToggleBookmarkDto): Promise<{ isSaved: boolean }> => {
    const { userId, targetId, targetType } = dto;

    if (!["playlist", "album", "movieList"].includes(targetType)) {
        throw new ApiError("INVALID_TARGET_TYPE", 400);
    }

    const checkResult = await pool.query(bookmarkQueries.exists, [userId, targetId, targetType]);
    const isCurrentlySaved = checkResult.rows[0]?.isSaved || false;

    if (isCurrentlySaved) {
        await pool.query(bookmarkQueries.remove, [userId, targetId, targetType]);
        return { isSaved: false };
    } else {
        await pool.query(bookmarkQueries.add, [userId, targetId, targetType]);
        return { isSaved: true };
    }
};

/**
 * Retrieves bookmarked items for a user.
 */
export const getUserBookmarks = async (dto: GetUserBookmarksDto) => {
    const { userId, targetType, page = 1, limit = 20 } = dto;
    const offset = (page - 1) * limit;

    const result = await pool.query(bookmarkQueries.getByUser, [userId, targetType || null, limit, offset]);

    return result.rows;
};
