import { TmdbId } from "./common.types";

export interface ITmdbMovie {
    id: TmdbId;
    original_title: string;
    overview: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
}

export type SearchMovieResult = {
    page: number;
    results: ITmdbMovie[];
    total_pages: number;
    total_results: number;
};
export type TrendMoviesResult = {
    page: number;
    results: ITmdbMovie[];
    total_pages: number;
    total_results: number;
};
