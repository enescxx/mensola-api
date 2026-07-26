import pool from "../config/db";
import {
    getFavoritesQuery,
    getWatchlistQuery,
    getWatchedQuery,
    getLikedMoviesQuery,
    getMovieListsQuery,
    getLikedListsQuery,
    createListQuery
} from "../queries/movie.queries";

import { IMovieList } from "../types/movie";

const fetchFavorites = async (userId: string, limit: number, page: number) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(getFavoritesQuery, [userId, limit, offset]);

    const favorites = result.rows || [];

    return favorites;
};

const fetchWatchlist = async (userId: string, limit: number, page: number) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(getWatchlistQuery, [userId, limit, offset]);

    const watchlist = result.rows || [];

    return watchlist;
};

const fetchWatched = async (userId: string, limit: number, page: number) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(getWatchedQuery, [userId, limit, offset]);

    const watched = result.rows || [];

    return watched;
};

const fetchLikedMovies = async (
    userId: string,
    limit: number,
    page: number
) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(getLikedMoviesQuery, [
        userId,
        limit,
        offset
    ]);

    const liked = result.rows || [];

    return liked;
};

const fetchLists = async (userId: string, limit: number, page: number) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(getMovieListsQuery, [
        userId,
        limit,
        offset
    ]);

    const lists = result.rows || [];

    return lists;
};

const fetchLikedLists = async (userId: string, limit: number, page: number) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(getLikedListsQuery, [
        userId,
        limit,
        offset
    ]);

    const likedLists = result.rows || [];

    return likedLists;
};

type CreateMovieListDto = Omit<IMovieList, "id">;
const createList = async ({
    title,
    description,
    image,
    isPrivate,
    creatorId
}: CreateMovieListDto): Promise<IMovieList> => {
    const values = [title, description, image, isPrivate, creatorId];
    const result = await pool.query<IMovieList>(createListQuery, values);

    const movieList = result.rows[0];

    return movieList;
};

export {
    fetchFavorites,
    fetchWatchlist,
    fetchWatched,
    fetchLikedMovies,
    fetchLists,
    fetchLikedLists,
    createList
};
