import { Response, NextFunction } from "express";

import {
    getLikedAlbums,
    getAlbumById,
    getAlbumTracks,
    likeAlbum as likeAlbumService,
    unlikeAlbum as unlikeAlbumService,
    getAlbumInteractions,
    upsertAlbumInteraction,
} from "@/services/album.service";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express";
import { GetLikedAlbumsDto, UpsertAlbumInteractionDto } from "@/types/album.types";
import { ApiError } from "@/utils/error";
import { AlbumId, PaginationQueries } from "@/types/common";

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
        const userId = req.query.userId || currentUserId;
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
export const getAlbumDetails = async (req: TypedRequest<{ albumId: AlbumId }>, res: Response, next: NextFunction) => {
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
    req: TypedRequest<{ albumId: AlbumId }, {}, Partial<PaginationQueries>>,
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

/**
 * Likes a specific album for the authenticated user.
 *
 * @route   POST /api/albums/:albumId/like
 * @access  VerifyToken
 */
export const likeAlbum = async (req: TypedRequest<{ albumId: AlbumId }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const albumId = req.params.albumId;

        const result = await likeAlbumService({ userId, albumId });

        return sendResponse(res, 200, result, "Album liked successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Unlikes a specific album for the authenticated user.
 *
 * @route   DELETE /api/albums/:albumId/like
 * @access  VerifyToken
 */
export const unlikeAlbum = async (req: TypedRequest<{ albumId: AlbumId }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const albumId = req.params.albumId;

        const result = await unlikeAlbumService({ userId, albumId });

        return sendResponse(res, 200, result, "Album unliked successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves interactions/comments for a specific album.
 *
 * @route   GET /api/albums/:albumId/interactions
 * @access  Public / Optional Auth
 */
export const getAlbumInteractionsList = async (
    req: TypedRequest<{ albumId: AlbumId }, {}, Partial<PaginationQueries>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const albumId = req.params.albumId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const interactions = await getAlbumInteractions({ albumId, limit, page });

        return sendResponse(
            res,
            200,
            { items: interactions, page, limit, hasMore: interactions.length === limit },
            "Album interactions retrieved successfully.",
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Creates or updates a user interaction (rating, comment, like) for an album.
 *
 * @route   POST /api/albums/:albumId/interactions
 * @access  VerifyToken
 */
export const createAlbumInteraction = async (
    req: TypedRequest<{ albumId: AlbumId }, UpsertAlbumInteractionDto>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;
        const albumId = req.params.albumId;
        const { rating, comment, isLiked } = req.body;

        const result = await upsertAlbumInteraction({
            userId,
            albumId,
            rating,
            comment,
            isLiked,
        });

        return sendResponse(res, 200, result, "Album interaction saved successfully.");
    } catch (error) {
        next(error);
    }
};
