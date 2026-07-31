import { Response, NextFunction } from "express";

// Services
import {
    getFavorites,
    getWatchlist,
    getWatched,
    getLikedMovies,
    getUserLists,
    getLikedLists,
    createList
} from "@/services/movie";

// Utilities
import { sendResponse } from "@/utils/response";

// Types
import { TypedRequestBody, TypedRequestQuery } from "@/types/express";
import {
    GetFavoritesDto,
    GetWatchlistDto,
    GetWatchedMoviesDto,
    GetLikedMoviesDto,
    GetUserListsDto,
    GetLikedListsDto,
    CreateMovieListDto
} from "@/types/movie";

/* ==========================================================================
   Movie Library Controllers
   ========================================================================== */

/**
 * Retrieves a paginated list of favorite movies for a target user (or current user).
 *
 * @route   GET /api/movies/favorites
 * @access  Public / Optional Auth
 */
const getFavoriteMovies = async (
    req: TypedRequestQuery<Partial<GetFavoritesDto>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.query.userId as string) || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        // Service katmanı userId kontrolünü zaten yapıyor
        const favoriteMovies = await getFavorites({ userId, limit, page });

        return sendResponse(res, 200, {
            items: favoriteMovies,
            page,
            limit,
            hasMore: favoriteMovies.length === limit
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a paginated watchlist of movies for a target user (or current user).
 *
 * @route   GET /api/movies/watchlist
 * @access  Public / Optional Auth
 */
const getWatchlistMovies = async (
    req: TypedRequestQuery<Partial<GetWatchlistDto>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.query.userId as string) || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const watchlist = await getWatchlist({ userId, limit, page });

        return sendResponse(res, 200, {
            items: watchlist,
            page,
            limit,
            hasMore: watchlist.length === limit
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a paginated list of watched movies for a target user (or current user).
 *
 * @route   GET /api/movies/watched
 * @access  Public / Optional Auth
 */
const getWatchedMovies = async (
    req: TypedRequestQuery<Partial<GetWatchedMoviesDto>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.query.userId as string) || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const watchedMovies = await getWatched({ userId, limit, page });

        return sendResponse(res, 200, {
            items: watchedMovies,
            page,
            limit,
            hasMore: watchedMovies.length === limit
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a paginated list of liked movies for a target user (or current user).
 *
 * @route   GET /api/movies/likes
 * @access  Public / Optional Auth
 */
const getLikedMoviesList = async (
    req: TypedRequestQuery<Partial<GetLikedMoviesDto>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.query.userId as string) || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 18;

        const likedMovies = await getLikedMovies({ userId, limit, page });

        return sendResponse(res, 200, {
            items: likedMovies,
            page,
            limit,
            hasMore: likedMovies.length === limit
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================================================
   Custom Movie Lists Controllers
   ========================================================================== */

/**
 * Retrieves custom movie lists created by a target user with preview items.
 *
 * @route   GET /api/movies/lists
 * @access  Public / Optional Auth
 */
const getMovieLists = async (req: TypedRequestQuery<Partial<GetUserListsDto>>, res: Response, next: NextFunction) => {
    try {
        const userId = (req.query.userId as string) || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const lists = await getUserLists({ userId, limit, page });

        return sendResponse(res, 200, {
            items: lists,
            page,
            limit,
            hasMore: lists.length === limit
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves custom movie lists liked by a target user.
 *
 * @route   GET /api/movies/lists/likes
 * @access  Public / Optional Auth
 */
const getLikedMovieLists = async (
    req: TypedRequestQuery<Partial<GetLikedListsDto>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req.query.userId as string) || req.user?.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const likedLists = await getLikedLists({ userId, limit, page });

        return sendResponse(res, 200, {
            items: likedLists,
            page,
            limit,
            hasMore: likedLists.length === limit
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Creates a new custom movie list for the authenticated user.
 *
 * @route   POST /api/movies/lists
 * @access  Private (Requires Access Token)
 */
const createMovieList = async (
    req: TypedRequestBody<Omit<CreateMovieListDto, "creatorId">>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, description, image, isPrivate } = req.body;
        const creatorId = req.user!.id;

        const newMovieList = await createList({
            title,
            description,
            image,
            isPrivate,
            creatorId
        });

        return sendResponse(res, 201, newMovieList, "Movie list created successfully.");
    } catch (error) {
        next(error);
    }
};

/* ==========================================================================
   Exports
   ========================================================================== */

export {
    getFavoriteMovies,
    getWatchlistMovies,
    getWatchedMovies,
    getLikedMoviesList,
    getMovieLists,
    getLikedMovieLists,
    createMovieList
};
