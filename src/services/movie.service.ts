import pool from "../config/db";
import {
    getFavoritesQuery,
    getWatchlistQuery,
    getWatchedQuery,
    getLikedMoviesQuery,
    getMovieListsQuery,
    getLikedListsQuery
} from "../queries/movie.queries";

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
export {
    fetchFavorites,
    fetchWatchlist,
    fetchWatched,
    fetchLikedMovies,
    fetchLists,
    fetchLikedLists
};
