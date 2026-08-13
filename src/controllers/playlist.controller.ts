import { Response, NextFunction } from "express";

import { getUserPlaylists, getLikedPlaylists, getPlaylistItems, getPlaylistDetails } from "@/services/playlist";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express";
import { GetUserPlaylistsDto, GetLikedPlaylistsDto } from "@/types/playlist.types";
import { PaginationQueries } from "@/types/track";
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

/**
 * Retrieves a paginated list of playlists liked by a target user (or current user).
 *
 * @route   GET /api/playlists/likes
 * @access  Public / Optional Auth
 */
export const getLikedPlaylistsList = async (
    req: TypedRequestQuery<Partial<GetLikedPlaylistsDto>>,
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

        const playlists = await getLikedPlaylists({ userId, currentUserId, limit, page });

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

/**
 * Retrieves items/tracks for a specific playlist.
 *
 * @route   GET /api/playlists/:playlistId/items
 * @access  Public / Optional Auth
 */
export const getPlaylistItemsList = async (
    req: TypedRequest<{ playlistId: string }, {}, Partial<PaginationQueries>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const currentUserId = req.user?.id;
        const playlistId = req.params.playlistId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const items = await getPlaylistItems({ playlistId, currentUserId, limit, page });

        return sendResponse(
            res,
            200,
            {
                items,
                page,
                limit,
                totalItems: items.length,
                hasMore: items.length === limit,
            },
            "Playlist items retrieved successfully.",
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves detailed information for a specific playlist.
 *
 * @route   GET /api/playlists/:playlistId
 * @access  Public / Optional Auth
 */
export const getPlaylistById = async (req: TypedRequest<{ playlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const currentUserId = req.user?.id;
        const playlistId = req.params.playlistId;

        const playlist = await getPlaylistDetails({ playlistId, currentUserId });

        return sendResponse(res, 200, playlist, "Playlist details retrieved successfully.");
    } catch (error) {
        next(error);
    }
};
