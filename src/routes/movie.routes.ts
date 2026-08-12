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
    getMovieListInteractions,
    createMovieListInteraction,
    addMovieToList,
    removeMovieFromList,
    likeMovieList,
    unlikeMovieList,
    likeMovie,
    unlikeMovie,
    createMovieInteraction,
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
    listAndMovieParamsSchema,
    createMovieInteractionSchema,
} from "@/validations/movie";

const router = Router();

/* ==========================================================================
   1. User Library & Collection Routes (Static prefixes)
   ========================================================================== */

router.get("/favorites", extractUser, validate(moviePaginationQuerySchema), getFavoriteMovies);
router.get("/watchlist", extractUser, validate(moviePaginationQuerySchema), getWatchlistMovies);
router.get("/watched", extractUser, validate(moviePaginationQuerySchema), getWatchedMovies);
router.get("/likes", extractUser, validate(moviePaginationQuerySchema), getLikedMoviesList);

/* ==========================================================================
   2. Custom Movie Lists Routes (Static & Dynamic Sub-routes)
   ========================================================================== */

router.get("/lists", extractUser, validate(moviePaginationQuerySchema), getMovieLists);
router.post("/lists", verifyToken, validate(createMovieListSchema), createMovieList);

// List Like/Unlike Operations
router.get("/lists/likes", extractUser, validate(moviePaginationQuerySchema), getLikedMovieLists);
router.post("/lists/:listId/like", verifyToken, validate(listIdParamSchema), likeMovieList);
router.delete("/lists/:listId/like", verifyToken, validate(listIdParamSchema), unlikeMovieList);

// List Items & Interaction Operations
router.get("/lists/:listId/items", extractUser, validate(listIdParamSchema), getMovieListItems);
router.get("/lists/:listId/interactions", extractUser, validate(listIdParamSchema), getMovieListInteractions);
router.post("/lists/:listId/interaction", verifyToken, validate(listIdParamSchema), createMovieListInteraction);
router.post("/lists/:listId/items/:movieId", verifyToken, validate(listAndMovieParamsSchema), addMovieToList);
router.delete("/lists/:listId/items/:movieId", verifyToken, validate(listAndMovieParamsSchema), removeMovieFromList);

// Single List Operations
router.get("/lists/:listId", extractUser, validate(listIdParamSchema), getMovieListById);
router.patch("/lists/:listId", verifyToken, validate(updateMovieListSchema), updateMovieList);
router.delete("/lists/:listId", verifyToken, validate(listIdParamSchema), deleteMovieList);

/* ==========================================================================
   3. Single Movie Interactions & Specific Actions
   ========================================================================== */

// Watched Status
router.post("/:movieId/watched", verifyToken, validate(movieIdParamSchema), markMovieAsWatched);
router.delete("/:movieId/watched", verifyToken, validate(movieIdParamSchema), unmarkMovieAsWatched);

// Watchlist Status
router.post("/:movieId/watchlist", verifyToken, validate(movieIdParamSchema), addMovieToWatchlist);
router.delete("/:movieId/watchlist", verifyToken, validate(movieIdParamSchema), removeMovieFromWatchlist);

// Favorites Status
router.post("/:movieId/favorites", verifyToken, validate(movieIdParamSchema), addMovieToFavorites);
router.delete("/:movieId/favorites", verifyToken, validate(movieIdParamSchema), removeMovieFromFavorites);

// Movie Like Status
router.post("/:movieId/like", verifyToken, validate(movieIdParamSchema), likeMovie);
router.delete("/:movieId/like", verifyToken, validate(movieIdParamSchema), unlikeMovie);

// Full Interaction Status (Rating, Comment, Like)
router.post("/:movieId/interaction", verifyToken, validate(createMovieInteractionSchema), createMovieInteraction);

/* ==========================================================================
   4. Catch-all Single Movie Route (MUST BE AT THE VERY BOTTOM)
   ========================================================================== */

router.get("/:movieId", extractUser, validate(movieIdParamSchema), getMovieById);

export default router;
