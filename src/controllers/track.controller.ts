import { Request, Response, NextFunction } from "express";

import { getLikedTracks, getTrackById, likeTrack, unlikeTrack, getTrackInteractions } from "@/services/track";
import { sendResponse } from "@/utils/response";
import { TypedRequest, TypedRequestQuery } from "@/types/express";
import { GetLikedTracksDto } from "@/types/track";

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
        const userId = (req.query.userId as string) || req.user?.id;
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
export const getTrackDetails = async (req: TypedRequest<{ trackId: string }>, res: Response, next: NextFunction) => {
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
export const likeTrackHandler = async (req: TypedRequest<{ trackId: string }>, res: Response, next: NextFunction) => {
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
export const unlikeTrackHandler = async (req: TypedRequest<{ trackId: string }>, res: Response, next: NextFunction) => {
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
    req: TypedRequest<{ trackId: string }, {}, Partial<{ page: string | number; limit: string | number }>>,
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
