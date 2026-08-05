import { Router } from "express";

// Controllers
import {
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
    updateMovieList,
    deleteMovieList,
    getMovieListById,
    getMovieListItems,
} from "@/controllers/movie";

// Middlewares
import { verifyToken, extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

// Validation
import {
    moviePaginationQuerySchema,
    createMovieListSchema,
    movieIdParamSchema,
    updateMovieListSchema,
    listIdParamSchema,
} from "@/validations/movie";

const router = Router();

/* ==========================================================================
   Movie Library Routes
   ========================================================================== */

/**
 * @route   GET /api/movies/favorites
 * @desc    Get paginated favorite movies for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/favorites", extractUser, validate(moviePaginationQuerySchema), getFavoriteMovies);

/**
 * @route   GET /api/movies/watchlists
 * @desc    Get paginated watchlist movies for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/watchlist", extractUser, validate(moviePaginationQuerySchema), getWatchlistMovies);

/**
 * @route   GET /api/movies/watched
 * @desc    Get paginated watched movies history for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/watched", extractUser, validate(moviePaginationQuerySchema), getWatchedMovies);

/**
 * @route   GET /api/movies/liked
 * @desc    Get paginated liked movies for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/liked", extractUser, validate(moviePaginationQuerySchema), getLikedMoviesList);

/* ==========================================================================
   Custom Movie Lists Routes
   ========================================================================== */

/**
 * @route   GET /api/movies/lists/liked
 * @desc    Get custom movie lists liked by a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 * @note    Must be defined BEFORE GET /lists to prevent static route collision
 */
router.get("/lists/liked", extractUser, validate(moviePaginationQuerySchema), getLikedMovieLists);

/**
 * @route   GET /api/movies/lists
 * @desc    Get custom movie lists created by a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/lists", extractUser, validate(moviePaginationQuerySchema), getMovieLists);

/**
 * @route   POST /api/movies/lists
 * @desc    Create a new custom movie list for the authenticated user
 * @access  Private (Requires valid Access Token)
 */
router.post("/lists", verifyToken, validate(createMovieListSchema), createMovieList);

/**
 * @route   GET /api/movies/lists/:listId
 * @desc    Fetch a specific movie list by its ID, including owners, preview movies, and latest comments
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/lists/:listId", extractUser, validate(listIdParamSchema), getMovieListById);

/**
 * @route   PATCH /api/movies/lists/:listId
 * @desc    Updates the details of an existing movie list
 * @access  Private (Requires valid Access Token)
 */
router.patch("/lists/:listId", verifyToken, validate(updateMovieListSchema), updateMovieList);

/**
 * @route   DELETE /api/movies/lists/:listId
 * @desc    Deletes a specific movie list for the authenticated user
 * @access  Private (Requires valid Access Token)
 */
router.delete("/lists/:listId", verifyToken, validate(listIdParamSchema), deleteMovieList);

/**
 * @route   GET /api/movies/lists/:listId/items
 * @desc    Fetches all movies contained in a specific movie list
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/lists/:listId/items", extractUser, validate(listIdParamSchema), getMovieListItems);

/**
 * @route   POST /api/movies/:movieId/watched
 * @desc    Mark a movie as watched for the authenticated user
 * @access  Private (Requires valid Access Token)
 */
router.post("/:movieId/watched", verifyToken, validate(movieIdParamSchema), markMovieAsWatched);

/**
 * @route   DELETE /api/movies/:movieId/watched
 * @desc    Completely remove a movie from watched history
 * @access  Private (Requires valid Access Token)
 */
router.delete("/:movieId/watched", verifyToken, validate(movieIdParamSchema), unmarkMovieAsWatched);

/**
 * @route   POST /api/movies/:movieId/watchlist
 * @desc    Add a movie to the authenticated user's watchlist
 * @access  Private (Requires valid Access Token)
 */
router.post("/:movieId/watchlist", verifyToken, validate(movieIdParamSchema), addMovieToWatchlist);

/**
 * @route   DELETE /api/movies/:movieId/watchlist
 * @desc    Completely remove a movie from the authenticated user's watchlist
 * @access  Private (Requires valid Access Token)
 */
router.delete("/:movieId/watchlist", verifyToken, validate(movieIdParamSchema), removeMovieFromWatchlist);

/**
 * @route   POST /api/movies/:movieId/favorites
 * @desc    Add a movie to the authenticated user's favorites list
 * @access  Private (Requires valid Access Token)
 */
router.post("/:movieId/favorites", verifyToken, validate(movieIdParamSchema), addMovieToFavorites);

/**
 * @route   DELETE /api/movies/:movieId/favorites
 * @desc    Completely remove a movie from the authenticated user's favorites list
 * @access  Private (Requires valid Access Token)
 */
router.delete("/:movieId/favorites", verifyToken, validate(movieIdParamSchema), removeMovieFromFavorites);

/**
 * @route   GET /api/movies/:movieId
 * @desc    Fetch movie details along with top user reviews
 * @access  Public
 */
router.get("/:movieId", validate(movieIdParamSchema), getMovieById);

export default router;
