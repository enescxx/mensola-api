import { Response, NextFunction } from "express";

import { getLikedAlbums, getAlbumById } from "@/services/album.service";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express";
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

/**
 * Retrieves detailed information for a specific album.
 *
 * @route   GET /api/albums/:albumId
 * @access  Public / Optional Auth
 */
export const getAlbumDetails = async (req: TypedRequest<{ albumId: string }>, res: Response, next: NextFunction) => {
    try {
        const currentUserId = req.user?.id;
        const albumId = req.params.albumId;

        const album = await getAlbumById({ albumId, currentUserId });

        return sendResponse(res, 200, album, "Album details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};
