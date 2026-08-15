import { Response, NextFunction } from "express";

import {
    getUserPlaylists,
    getLikedPlaylists,
    getPlaylistItems,
    addTrackToPlaylist as addTrackToPlaylistService,
    removeTrackFromPlaylist as removeTrackFromPlaylistService,
    getPlaylistDetails,
    getPlaylistInteractions,
    upsertPlaylistInteraction,
    likePlaylist as likePlaylistService,
    unlikePlaylist as unlikePlaylistService,
} from "@/services/playlist";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express";
import {
    GetUserPlaylistsDto,
    GetLikedPlaylistsDto,
    UpsertPlaylistInteractionDto,
    LikePlaylistDto,
    UnlikePlaylistDto,
} from "@/types/playlist";
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
 * Adds a specific track to a custom playlist for the authenticated user.
 *
 * @route   POST /api/playlists/:playlistId/items/:trackId
 * @desc    Adds a track to a specific playlist.
 * @access  VerifyToken (Requires valid Access Token)
 */
export const addTrackToPlaylist = async (
    req: TypedRequest<{ playlistId: string; trackId: string }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { playlistId, trackId } = req.params;
        const userId = req.user!.id;

        const addedItem = await addTrackToPlaylistService({ playlistId, trackId, userId });
        return sendResponse(res, 201, addedItem, "Track has been added to the playlist successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Removes a specific track from a custom playlist for the authenticated user.
 *
 * @route   DELETE /api/playlists/:playlistId/items/:trackId
 * @desc    Removes a track from a specific playlist.
 * @access  VerifyToken (Requires valid Access Token)
 */
export const removeTrackFromPlaylist = async (
    req: TypedRequest<{ playlistId: string; trackId: string }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { playlistId, trackId } = req.params;
        const userId = req.user!.id;

        await removeTrackFromPlaylistService({ playlistId, trackId, userId });
        return sendResponse(res, 200, null, "Track has been removed from the playlist successfully.");
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

/**
 * Retrieves interactions/comments for a specific playlist.
 *
 * @route   GET /api/playlists/:playlistId/interactions
 * @access  Public / Optional Auth
 */
export const getPlaylistInteractionsList = async (
    req: TypedRequest<{ playlistId: string }, {}, Partial<PaginationQueries>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const playlistId = req.params.playlistId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const interactions = await getPlaylistInteractions({ playlistId, limit, page });

        return sendResponse(
            res,
            200,
            { items: interactions, page, limit, hasMore: interactions.length === limit },
            "Playlist interactions retrieved successfully.",
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Creates or updates a user interaction (rating, comment, like) for a playlist.
 *
 * @route   POST /api/playlists/:playlistId/interactions
 * @access  VerifyToken
 */
export const createPlaylistInteraction = async (
    req: TypedRequest<{ playlistId: string }, UpsertPlaylistInteractionDto>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;
        const playlistId = req.params.playlistId;
        const { rating, comment, isLiked } = req.body;

        const result = await upsertPlaylistInteraction({
            userId,
            playlistId,
            rating,
            comment,
            isLiked,
        });

        return sendResponse(res, 200, result, "Playlist interaction saved successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Likes a specific playlist for the authenticated user.
 *
 * @route   POST /api/playlists/:playlistId/like
 * @access  VerifyToken
 */
export const likePlaylist = async (req: TypedRequest<{ playlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const playlistId = req.params.playlistId;

        const result = await likePlaylistService({ userId, playlistId });

        return sendResponse(res, 200, result, "Playlist liked successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Unlikes a specific playlist for the authenticated user.
 *
 * @route   DELETE /api/playlists/:playlistId/like
 * @access  VerifyToken
 */
export const unlikePlaylist = async (req: TypedRequest<{ playlistId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const playlistId = req.params.playlistId;

        const result = await unlikePlaylistService({ userId, playlistId });

        return sendResponse(res, 200, result, "Playlist unliked successfully.");
    } catch (error) {
        next(error);
    }
};
