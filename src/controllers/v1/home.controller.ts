import { Request, Response, NextFunction } from "express";
import { getHomeData } from "@/services/home.service";
import { sendResponse } from "@/utils/response";

/**
 * GET /v1/home
 *
 * Composite endpoint that aggregates:
 *   - heroMovies       : top 5 trending movies of the day (TMDB)
 *   - nowPlayingMovies : current theatrical releases (TMDB)
 *   - newTracks        : top 10 new release tracks (Spotify year:2026)
 *
 * All external requests run in parallel via Promise.allSettled.
 * A partial failure (e.g. Spotify down) still returns the remaining sections.
 */
export const getHome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getHomeData();
        sendResponse(res, 200, data);
    } catch (error) {
        next(error);
    }
};
