import { Request, Response, NextFunction } from "express";

import {
    getLikedTracks,
    getFavoriteTracks,
    addTrackToFavorites,
    removeTrackFromFavorites,
    getTrackById,
    likeTrack,
    unlikeTrack,
    getTrackInteractions,
    upsertTrackInteraction,
    findOrFetchSpotifyTrack,
} from "@/services/track.service";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express.types";
import { GetLikedTracksDto, UpsertTrackInteractionDto } from "@/types/track.types";
import { SpotifyId, TrackId, UserId } from "@/types/common.types";
import { MESSAGES } from "@/constants/messages";
import { ApiError } from "@/utils/error";

/**
 * Retrieves a paginated list of liked tracks for a target user (or current user).
 *
 * @route   GET /api/tracks/likes
 * @access  Public / Optional Auth
 */
export const getLikedTracksList = async (
    req: TypedRequestQuery<Partial<GetLikedTracksDto>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.query.userId || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const likedTracks = await getLikedTracks({ userId, limit, page });

        return sendResponse(res, 200, {
            items: likedTracks,
            page,
            limit,
            totalItems: likedTracks.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves detailed information about a specific track.
 *
 * @route   GET /api/tracks/:trackId
 * @access  Public / Optional Auth
 */
export const getTrackDetails = async (req: TypedRequest<{ trackId: TrackId }>, res: Response, next: NextFunction) => {
    try {
        const trackId = req.params.trackId;
        const userId = req.user?.id;

        const trackDetails = await getTrackById(trackId, userId);

        return sendResponse(res, 200, trackDetails);
    } catch (error) {
        next(error);
    }
};

/**
 * Likes a specific track.
 *
 * @route   POST /api/tracks/:trackId/like
 * @access  Private
 */
export const likeTrackHandler = async (req: TypedRequest<{ trackId: TrackId }>, res: Response, next: NextFunction) => {
    try {
        const trackId = req.params.trackId;
        const userId = req.user!.id;

        const result = await likeTrack(trackId, userId);

        return sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Unlikes a specific track.
 *
 * @route   DELETE /api/tracks/:trackId/like
 * @access  Private
 */
export const unlikeTrackHandler = async (
    req: TypedRequest<{ trackId: TrackId }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const trackId = req.params.trackId;
        const userId = req.user!.id;

        const result = await unlikeTrack(trackId, userId);

        return sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves all interactions (comments and ratings) for a specific track.
 *
 * @route   GET /api/tracks/:trackId/interactions
 * @access  Public
 */
export const getTrackInteractionsList = async (
    req: TypedRequest<{ trackId: TrackId }, {}, Partial<{ page: string | number; limit: string | number }>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const trackId = req.params.trackId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const interactions = await getTrackInteractions({ trackId, page, limit });

        return sendResponse(res, 200, {
            items: interactions,
            page,
            limit,
            totalItems: interactions.length, // Or from a separate count query if we implement it later
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Creates or updates a user interaction (rating, comment, like) for a track.
 *
 * @route   POST /api/tracks/:trackId/interactions
 * @access  VerifyToken
 */
export const createTrackInteraction = async (
    req: TypedRequest<{ trackId: TrackId }, UpsertTrackInteractionDto>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;
        const trackId = req.params.trackId;
        const { rating, comment, isLiked } = req.body;

        const result = await upsertTrackInteraction({
            userId,
            trackId,
            rating,
            comment,
            isLiked,
        });

        return sendResponse(res, 200, result, MESSAGES.SUCCESS.INTERACTION_SAVED);
    } catch (error) {
        next(error);
    }
};

export const getOrFetchSpotifyTrack = async (
    req: TypedRequest<{ spotifyId?: SpotifyId }>,
    res: Response,
    next: NextFunction,
) => {
    const spotifyId = req.params.spotifyId;
    const userId = req.user?.id;

    if (!spotifyId) {
        return next(new ApiError("NOT_FOUND"));
    }

    try {
        const result = await findOrFetchSpotifyTrack(spotifyId, userId);
        return sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a paginated list of favorite tracks for a target user (or current user).
 *
 * @route   GET /api/tracks/favorites
 * @access  Public / Optional Auth
 */
export const getFavoriteTracksList = async (
    req: TypedRequestQuery<Partial<GetLikedTracksDto>>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.query.userId || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const favoriteTracks = await getFavoriteTracks({ userId, limit, page });

        return sendResponse(res, 200, {
            items: favoriteTracks,
            page,
            limit,
            totalItems: favoriteTracks.length,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Adds a specific track to the authenticated user's favorites list.
 *
 * @route   POST /api/tracks/:trackId/favorites
 * @access  Private
 */
export const addTrackToFavoritesHandler = async (
    req: TypedRequest<{}, { trackId?: TrackId; spotifyId?: SpotifyId; replaceTrackId?: TrackId }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { trackId, spotifyId, replaceTrackId } = req.body;
        const userId = req.user!.id as UserId;

        const result = await addTrackToFavorites(userId, { trackId, spotifyId, replaceTrackId });

        return sendResponse(res, 201, result);
    } catch (error) {
        next(error);
    }
};

/**
 * Removes a specific track from the authenticated user's favorites list.
 *
 * @route   DELETE /api/tracks/:trackId/favorites
 * @access  Private
 */
export const removeTrackFromFavoritesHandler = async (
    req: TypedRequest<{ trackId: TrackId }>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const trackId = req.params.trackId;
        const userId = req.user!.id;

        const result = await removeTrackFromFavorites(trackId, userId);

        return sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
};
