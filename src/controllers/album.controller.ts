import { Response, NextFunction } from "express";

import { getLikedAlbums } from "@/services/album.service";
import { sendResponse } from "@/utils/response";
import { TypedRequestQuery } from "@/types/express";
import { GetLikedAlbumsDto } from "@/types/album.types";
import { ApiError } from "@/utils/error";

/**
 * Retrieves a paginated list of albums liked by a target user (or current user).
 *
 * @route   GET /api/albums/likes
 * @access  Public / Optional Auth
 */
export const getLikedAlbumsList = async (
    req: TypedRequestQuery<Partial<GetLikedAlbumsDto>>,
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

        const albums = await getLikedAlbums({ userId, limit, page });

        return sendResponse(res, 200, {
            items: albums,
            page,
            limit,
            totalItems: albums.length, 
        });
    } catch (error) {
        next(error);
    }
};
