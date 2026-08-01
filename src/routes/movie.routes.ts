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
    unmarkMovieAsWatched
} from "@/controllers/movie";

// Middlewares
import { verifyToken, extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

// Validation
import { moviePaginationQuerySchema, createMovieListSchema, movieIdParamSchema } from "@/validations/movie";

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
router.get("/watchlists", extractUser, validate(moviePaginationQuerySchema), getWatchlistMovies);

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

export default router;
