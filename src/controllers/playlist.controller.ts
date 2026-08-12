import { Response, NextFunction } from "express";

import { getUserPlaylists } from "@/services/playlist";
import { sendResponse } from "@/utils/response";
import { TypedRequestQuery } from "@/types/express";
import { GetUserPlaylistsDto } from "@/types/playlist";
import { ApiError } from "@/utils/error";

/**
 * Retrieves a paginated list of playlists for a target user (or current user).
 *
 * @route   GET /api/playlists
 * @access  Public / Optional Auth
 */
export const getUserPlaylistsList = async (
    req: TypedRequestQuery<Partial<GetUserPlaylistsDto>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const currentUserId = req.user?.id;
        const userId = (req.query.userId as string) || currentUserId;
        if (!userId) {
            throw new ApiError("User ID is required.", 400);
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const playlists = await getUserPlaylists({ userId, currentUserId, limit, page });

        return sendResponse(res, 200, {
            items: playlists,
            page,
            limit,
            totalItems: playlists.length,
        });
    } catch (error) {
        next(error);
    }
};
