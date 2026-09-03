import pool from "@/config/db";
import { tmdbService } from "@/services/tmdb.service";
import { spotifyService } from "@/services/spotify.service";
import { HomeResponseData } from "@/types/home.types";
import { UserId } from "@/types/common.types";

/**
 * Aggregates home screen data from TMDB and Spotify in parallel.
 * Checks for pending follow requests if a user is authenticated.
 * Uses Promise.allSettled so a single source failure returns partial results
 * instead of rejecting the entire response.
 */
export const getHomeData = async (viewerId?: UserId): Promise<HomeResponseData> => {
    const pendingFollowPromise = viewerId
        ? pool.query<{ hasPending: boolean }>(
              `SELECT EXISTS (
                  SELECT 1 FROM "Follow"
                  WHERE "followingId" = $1 AND "status" = 'pending'
              ) AS "hasPending"`,
              [viewerId],
          )
        : Promise.resolve(null);

    const [heroResult, nowPlayingResult, newTracksResult, pendingFollowResult] =
        await Promise.allSettled([
            tmdbService.getTrendingHero(5),
            tmdbService.getNowPlaying(15),
            spotifyService.getNewTracks(10),
            pendingFollowPromise,
        ]);

    const hasPendingFollowRequest =
        pendingFollowResult.status === "fulfilled" &&
        pendingFollowResult.value !== null &&
        Boolean(pendingFollowResult.value.rows[0]?.hasPending);

    return {
        heroMovies: heroResult.status === "fulfilled" ? heroResult.value : [],
        nowPlayingMovies: nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : [],
        newTracks: newTracksResult.status === "fulfilled" ? newTracksResult.value : [],
        hasPendingFollowRequest,
    };
};
