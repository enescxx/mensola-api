import { Router } from "express";

import { tmdbSearchMovie } from "@/controllers/v1/tmdb.controller";

import { verifyToken } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { searchMovieSchema } from "@/validations/tmdb.validation";

const router = Router();

router.get("/search/movie", verifyToken, validate(searchMovieSchema), tmdbSearchMovie);

export default router;
