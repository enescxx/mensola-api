import { Response, NextFunction } from "express";

import { getLikedAlbums, getAlbumById, getAlbumTracks } from "@/services/album.service";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express";
import { GetLikedAlbumsDto } from "@/types/album.types";
import { PaginationQueries } from "@/types/track";
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

/**
 * Retrieves tracks/songs for a specific album.
 *
 * @route   GET /api/albums/:albumId/tracks
 * @access  Public / Optional Auth
 */
export const getAlbumTracksList = async (
    req: TypedRequest<{ albumId: string }, {}, Partial<PaginationQueries>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const currentUserId = req.user?.id;
        const albumId = req.params.albumId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 30;

        const tracks = await getAlbumTracks({ albumId, currentUserId, limit, page });

        return sendResponse(
            res,
            200,
            {
                items: tracks,
                page,
                limit,
                totalItems: tracks.length,
                hasMore: tracks.length === limit,
            },
            "Album tracks retrieved successfully.",
        );
    } catch (error) {
        next(error);
    }
};
