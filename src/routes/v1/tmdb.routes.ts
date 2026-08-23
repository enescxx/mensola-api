import { Router } from "express";

import { tmdbSearchMovie, tmdbTrendMovies } from "@/controllers/v1/tmdb.controller";

import { verifyToken } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { searchMovieSchema, pageQuerySchema } from "@/validations/tmdb.validation";

const router = Router();

router.get("/search/movie", verifyToken, validate(searchMovieSchema), tmdbSearchMovie);
router.get("/trending/movie", verifyToken, validate(pageQuerySchema), tmdbTrendMovies);

export default router;
