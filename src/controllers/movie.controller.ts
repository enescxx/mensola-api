import { Request, Response } from "express";
import {
    fetchFavorites,
    fetchWatchlist,
    fetchWatched,
    fetchLikedMovies,
    fetchLists,
    fetchLikedLists
} from "../services/movie.service";

const getFavorites = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 18;

    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: {
                message: "userId is invalid."
            }
        });
    }

    try {
        const favoriteMovies = await fetchFavorites(userId, limit, page);

        return res.status(200).json({
            success: true,
            data: favoriteMovies,
            page: page,
            limit: limit,
            hasMore: favoriteMovies.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getWatchlist = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 18;

    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: {
                message: "userId is invalid."
            }
        });
    }

    try {
        const watchlist = await fetchWatchlist(userId, limit, page);

        return res.status(200).json({
            success: true,
            data: watchlist,
            page: page,
            limit: limit,
            hasMore: watchlist.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getWatchedList = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 18;

    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: {
                message: "userId is invalid."
            }
        });
    }

    try {
        const watchedList = await fetchWatched(userId, limit, page);

        return res.status(200).json({
            success: true,
            data: watchedList,
            page: page,
            limit: limit,
            hasMore: watchedList.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getLikedMovies = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 18;

    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: {
                message: "userId is invalid."
            }
        });
    }

    try {
        const likedMovies = await fetchLikedMovies(userId, limit, page);

        return res.status(200).json({
            success: true,
            data: likedMovies,
            page: page,
            limit: limit,
            hasMore: likedMovies.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getMovieLists = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: {
                message: "userId is invalid."
            }
        });
    }

    try {
        const lists = await fetchLists(userId, limit, page);

        return res.status(200).json({
            success: true,
            data: lists,
            page: page,
            limit: limit,
            hasMore: lists.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getLikedLists = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: {
                message: "userId is invalid."
            }
        });
    }

    try {
        const likedLists = await fetchLikedLists(userId, limit, page);

        return res.status(200).json({
            success: true,
            data: likedLists,
            page: page,
            limit: limit,
            hasMore: likedLists.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

export {
    getFavorites,
    getWatchlist,
    getWatchedList,
    getLikedMovies,
    getMovieLists,
    getLikedLists
};
