import { TmdbId, SpotifyId } from "./common.types";

// ─── Hero Movie (Trending — backdrop featured) ───────────────────────────────

export interface HeroMovie {
    tmdbId: TmdbId;
    title: string;
    overview: string;
    backdropUrl: string;
    posterUrl: string;
    rating: number;
}

// ─── Now Playing Movie (Vizyon) ───────────────────────────────────────────────

export interface NowPlayingMovie {
    tmdbId: TmdbId;
    title: string;
    posterUrl: string;
    rating: number;
    releaseDate: string;
}

// ─── New Track (Spotify New Releases) ─────────────────────────────────────────

export interface NewTrack {
    spotifyId: SpotifyId;
    title: string;
    artistName: string;
    albumCoverUrl: string | undefined;
    previewUrl: string | null;
}

// ─── Composite Response ───────────────────────────────────────────────────────

export interface HomeResponseData {
    heroMovies: HeroMovie[];
    nowPlayingMovies: NowPlayingMovie[];
    newTracks: NewTrack[];
}
