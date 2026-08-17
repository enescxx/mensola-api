import { Response, NextFunction } from "express";
import { TypedRequestQuery, TypedRequestBody } from "@/types/express.types";
import { toggleBookmark, getUserBookmarks, BookmarkTargetType } from "@/services/bookmark.service";
import { sendResponse } from "@/utils/response";
import { ApiError } from "@/utils/error";
import { MovieListId, PlaylistId, UserId } from "@/types/common.types";

interface ToggleBookmarkBody {
    targetId: string;
    targetType: BookmarkTargetType;
}

interface GetBookmarksQuery {
    targetType?: BookmarkTargetType;
    page?: string;
    limit?: string;
}

/**
 * Handles toggling a bookmark (save / unsave) for a playlist, album, or movieList.
 */
export const toggleBookmarkHandler = async (
    req: TypedRequestBody<ToggleBookmarkBody>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;

        const { targetId, targetType } = req.body;
        if (!targetId || !targetType) {
            throw new ApiError("INVALID_TARGET_TYPE", 400);
        }

        const result = await toggleBookmark({
            userId: userId as UserId,
            targetId: targetId as PlaylistId | MovieListId,
            targetType,
        });

        return sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching bookmarked items for the logged-in user.
 */
export const getUserBookmarksHandler = async (
    req: TypedRequestQuery<GetBookmarksQuery>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;

        const { targetType, page, limit } = req.query;

        const bookmarks = await getUserBookmarks({
            userId: userId as UserId,
            targetType,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });

        return sendResponse(res, 200, bookmarks);
    } catch (error) {
        next(error);
    }
};
