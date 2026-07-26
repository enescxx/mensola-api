import { Router } from "express";
import {
    getFavorites,
    getWatchlist,
    getWatchedList,
    getLikedMovies,
    getMovieLists,
    getLikedLists,
    createMovieList
} from "../controllers/movie.controller";
import { verifyToken, extractUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/favorites", extractUser, getFavorites);
router.get("/watchlists", extractUser, getWatchlist);
router.get("/watched", extractUser, getWatchedList);
router.get("/liked", extractUser, getLikedMovies);
router.get("/lists", extractUser, getMovieLists);
router.get("/lists/liked", extractUser, getLikedLists);
router.post("/lists", verifyToken, createMovieList);

export default router;
