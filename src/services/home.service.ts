import { tmdbService } from "@/services/tmdb.service";
import { spotifyService } from "@/services/spotify.service";
import { HomeResponseData } from "@/types/home.types";

/**
 * Aggregates home screen data from TMDB and Spotify in parallel.
 * Uses Promise.allSettled so a single source failure returns partial results
 * instead of rejecting the entire response.
 */
export const getHomeData = async (): Promise<HomeResponseData> => {
    const [heroResult, nowPlayingResult, newTracksResult] = await Promise.allSettled([
        tmdbService.getTrendingHero(5),
        tmdbService.getNowPlaying(15),
        spotifyService.getNewTracks(10),
    ]);

    return {
        heroMovies: heroResult.status === "fulfilled" ? heroResult.value : [],
        nowPlayingMovies: nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : [],
        newTracks: newTracksResult.status === "fulfilled" ? newTracksResult.value : [],
    };
};
