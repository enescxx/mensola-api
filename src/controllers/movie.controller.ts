import { Response, NextFunction } from "express";

// Services
import {
    getFavorites,
    getWatchlist,
    getWatched,
    getLikedMovies,
    getUserLists,
    getLikedLists,
    createList,
    markAsWatched,
    unmarkAsWatched,
    getMovie,
    addToWatchlist,
    removeFromWatchlist,
    addToFavorites,
    removeFromFavorites,
} from "@/services/movie";

// Utilities
import { sendResponse } from "@/utils/response";
import { ApiError } from "@/utils/error";

// Types
import { TypedRequestBody, TypedRequestQuery, TypedRequest } from "@/types/express";
import {
    GetFavoritesDto,
    GetWatchlistDto,
    GetWatchedMoviesDto,
    GetLikedMoviesDto,
    GetUserListsDto,
    GetLikedListsDto,
    CreateMovieListDto,
    GetMovieDto,
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
    next: NextFunction,
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
            hasMore: favoriteMovies.length === limit,
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
    next: NextFunction,
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
            hasMore: watchlist.length === limit,
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
    next: NextFunction,
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
            hasMore: watchedMovies.length === limit,
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
    next: NextFunction,
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
            hasMore: likedMovies.length === limit,
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
            hasMore: lists.length === limit,
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
    next: NextFunction,
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
            hasMore: likedLists.length === limit,
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
    next: NextFunction,
) => {
    try {
        const { title, description, image, isPrivate } = req.body;
        const creatorId = req.user!.id;

        const newMovieList = await createList({
            title,
            description,
            image,
            isPrivate,
            creatorId,
        });

        return sendResponse(res, 201, newMovieList, "Movie list created successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Marks a specific movie as watched for the authenticated user.
 *
 * @route   POST /api/movies/:movieId/watched
 * @access  Private (Requires Access Token)
 */
const markMovieAsWatched = async (req: TypedRequest<{ movieId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const movieId = req.params.movieId;

        const watchedMovie = await markAsWatched({ userId, movieId });
        return sendResponse(res, 201, watchedMovie, "Movie has marked as watched successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Removes all watch records of a specific movie for the authenticated user.
 *
 * @route   DELETE /api/movies/:movieId/watched
 * @desc    Completely removes the movie from the user's watched history.
 * @access  Private (Requires Access Token)
 */

const unmarkMovieAsWatched = async (req: TypedRequest<{ movieId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const movieId = req.params.movieId;

        const deletedRecord = await unmarkAsWatched({ userId, movieId });
        if (!deletedRecord) {
            throw new ApiError("Movie is not in your watched history.", 404);
        }

        return sendResponse(res, 201, null, "Movie has been removed from watched history successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a movie's details and its latest interactions by ID.
 *
 * @route   GET /api/movies/:movieId
 * @desc    Get detailed information about a specific movie.
 * @access  Public (or Private depending on your auth setup)
 */
const getMovieById = async (req: TypedRequest<GetMovieDto>, res: Response, next: NextFunction) => {
    try {
        const movieId = req.params.movieId;

        const movie = await getMovie({ movieId });
        if (!movie) {
            throw new ApiError("The movie is not found.", 404);
        }

        return sendResponse(res, 200, movie);
    } catch (error) {
        next(error);
    }
};

/**
 * Adds a specific movie to the authenticated user's watchlist.
 *
 * @route   POST /api/movies/:movieId/watchlist
 * @desc    Add a movie to the authenticated user's watchlist
 * @access  Private (Requires Access Token)
 */
const addMovieToWatchlist = async (req: TypedRequest<{ movieId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const movieId = req.params.movieId;

        const watchlistItem = await addToWatchlist({ userId, movieId });
        return sendResponse(res, 201, watchlistItem, "Movie has been added to watchlist successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Removes a specific movie from the authenticated user's watchlist.
 *
 * @route   DELETE /api/movies/:movieId/watchlist
 * @desc    Completely removes a movie from the user's watchlist.
 * @access  Private (Requires Access Token)
 */
const removeMovieFromWatchlist = async (req: TypedRequest<{ movieId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const movieId = req.params.movieId;

        const deletedRecord = await removeFromWatchlist({ userId, movieId });
        if (!deletedRecord || deletedRecord.length === 0) {
            throw new ApiError("Movie is not in your watchlist.", 404);
        }

        return sendResponse(res, 200, null, "Movie has been removed from watchlist successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Adds a specific movie to the authenticated user's favorites list.
 *
 * @route   POST /api/movies/:movieId/favorites
 * @desc    Add a movie to the authenticated user's favorites list
 * @access  Private (Requires Access Token)
 */
const addMovieToFavorites = async (req: TypedRequest<{ movieId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const movieId = req.params.movieId;

        const favoriteItem = await addToFavorites({ userId, movieId });
        return sendResponse(res, 201, favoriteItem, "Movie has been added to favorites successfully.");
    } catch (error) {
        next(error);
    }
};

/**
 * Removes a specific movie from the authenticated user's favorites list.
 *
 * @route   DELETE /api/movies/:movieId/favorites
 * @desc    Completely removes a movie from the user's favorites list.
 * @access  Private (Requires Access Token)
 */
const removeMovieFromFavorites = async (req: TypedRequest<{ movieId: string }>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const movieId = req.params.movieId;

        const deletedRecord = await removeFromFavorites({ userId, movieId });
        if (!deletedRecord || deletedRecord.length === 0) {
            throw new ApiError("Movie is not in your favorites list.", 404);
        }

        return sendResponse(res, 200, null, "Movie has been removed from favorites successfully.");
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
    createMovieList,
    markMovieAsWatched,
    unmarkMovieAsWatched,
    getMovieById,
    addMovieToWatchlist,
    removeMovieFromWatchlist,
    addMovieToFavorites,
    removeMovieFromFavorites,
};
