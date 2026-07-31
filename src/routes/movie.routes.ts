import { Router } from "express";

// Controllers
import {
    getFavoriteMovies,
    getWatchlistMovies,
    getWatchedMovies,
    getLikedMoviesList,
    getMovieLists,
    getLikedMovieLists,
    createMovieList
} from "@/controllers/movie";

// Middlewares
import { verifyToken, extractUser } from "@/middlewares/auth";

const router = Router();

/* ==========================================================================
   Movie Library Routes
   ========================================================================== */

/**
 * @route   GET /api/movies/favorites
 * @desc    Get paginated favorite movies for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/favorites", extractUser, getFavoriteMovies);

/**
 * @route   GET /api/movies/watchlists
 * @desc    Get paginated watchlist movies for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/watchlists", extractUser, getWatchlistMovies);

/**
 * @route   GET /api/movies/watched
 * @desc    Get paginated watched movies history for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/watched", extractUser, getWatchedMovies);

/**
 * @route   GET /api/movies/liked
 * @desc    Get paginated liked movies for a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/liked", extractUser, getLikedMoviesList);

/* ==========================================================================
   Custom Movie Lists Routes
   ========================================================================== */

/**
 * @route   GET /api/movies/lists/liked
 * @desc    Get custom movie lists liked by a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 * @note    Must be defined BEFORE GET /lists to prevent static route collision
 */
router.get("/lists/liked", extractUser, getLikedMovieLists);

/**
 * @route   GET /api/movies/lists
 * @desc    Get custom movie lists created by a target user (or authenticated user)
 * @access  Public / Optional Auth (Attaches viewer context if token provided)
 */
router.get("/lists", extractUser, getMovieLists);

/**
 * @route   POST /api/movies/lists
 * @desc    Create a new custom movie list for the authenticated user
 * @access  Private (Requires valid Access Token)
 */
router.post("/lists", verifyToken, createMovieList);

export default router;
