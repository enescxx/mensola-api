import { Response, NextFunction } from "express";

import { getLikedTracks } from "@/services/track";
import { sendResponse } from "@/utils/response";
import { TypedRequestQuery } from "@/types/express";
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
