import { mapGenreIdsToNames } from "@/constants/tmdb";
import { TmdbId } from "@/types/common.types";
import { IMovie } from "@/types/movie.types";
import { ITmdbMovie, SearchMovieResult, TrendMoviesResult } from "@/types/tmdb.types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN;

export const getTmdbImage = (path: string | null, size: "w342" | "w500" | "w780" | "original" = "w500") => {
    if (!path) return "";
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const tmdbService = {
    searchMovie: async (query: string, page: number = 1) => {
        const res = await fetch(
            `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=tr-TR`,
            { headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" } },
        );

        const searchData = (await res.json()) as SearchMovieResult;

        const movies: Omit<IMovie, "id">[] = searchData.results.map((item: ITmdbMovie) => {
            const movie: Omit<IMovie, "id"> = {
                tmdbId: item.id,
                title: item.original_title,
                poster: getTmdbImage(item.poster_path),
                releaseDate: item.release_date,
                rating: item.vote_average,
                genres: mapGenreIdsToNames(item.genre_ids),
            };

            return movie;
        });

        const hasMore = searchData.page < searchData.total_pages;
        const totalResults = searchData.total_results;

        return { items: movies, page, hasMore, totalResults };
    },

    getTrendMovies: async (page: number) => {
        const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day?language=en-US&page=${page}`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
        });

        const trendMovieData = (await res.json()) as TrendMoviesResult;

        const movies: Omit<IMovie, "id">[] = trendMovieData.results.map((item: ITmdbMovie) => {
            const movie: Omit<IMovie, "id"> = {
                tmdbId: item.id,
                title: item.original_title,
                poster: getTmdbImage(item.poster_path),
                releaseDate: item.release_date,
                rating: item.vote_average,
                genres: mapGenreIdsToNames(item.genre_ids),
            };

            return movie;
        });

        const hasMore = trendMovieData.page < trendMovieData.total_pages;
        const totalResults = trendMovieData.total_results;

        return { items: movies, page, hasMore, totalResults };
    },

    getMovieByTmdbId: async (tmdbId: TmdbId) => {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
        });

        const movieData = (await res.json()) as ITmdbMovie;

        const movie: Omit<IMovie, "id"> = {
            tmdbId: movieData.id,
            title: movieData.original_title,
            poster: getTmdbImage(movieData.poster_path),
            releaseDate: movieData.release_date,
            rating: movieData.vote_average,
            genres: movieData.genres ? movieData.genres.map((g) => g.name) : [],
            duration: movieData.runtime || undefined,
            overview: movieData.overview || undefined,
        };

        return movie;
    },

    /**
     * Returns the top `limit` trending movies of the day enriched with
     * backdrop and overview — used by the /v1/home hero section.
     */
    getTrendingHero: async (limit: number = 5) => {
        const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day?language=en-US&page=1`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
        });

        if (!res.ok) throw new Error(`TMDB trending failed: ${res.status}`);

        const data = (await res.json()) as TrendMoviesResult;

        return data.results.slice(0, limit).map((item: ITmdbMovie) => ({
            tmdbId: item.id as TmdbId,
            title: item.original_title,
            overview: item.overview,
            backdropUrl: getTmdbImage(item.backdrop_path ?? null, "original"),
            posterUrl: getTmdbImage(item.poster_path ?? null, "w342"),
            rating: item.vote_average,
        }));
    },

    /**
     * Returns current theatrical releases — used by the /v1/home now-playing section.
     */
    getNowPlaying: async (limit: number = 15) => {
        const res = await fetch(`${TMDB_BASE_URL}/movie/now_playing?language=en-US&page=1`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
        });

        if (!res.ok) throw new Error(`TMDB now_playing failed: ${res.status}`);

        const data = (await res.json()) as TrendMoviesResult;

        return data.results.slice(0, limit).map((item: ITmdbMovie) => ({
            tmdbId: item.id as TmdbId,
            title: item.original_title,
            posterUrl: getTmdbImage(item.poster_path ?? null, "w342"),
            rating: item.vote_average,
            releaseDate: item.release_date,
        }));
    },
};
