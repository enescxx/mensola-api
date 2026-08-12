import { Router } from "express";

import { getUserPlaylistsList } from "@/controllers/playlist";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { playlistPaginationQuerySchema } from "@/validations/playlist";

const router = Router();

router.get("/", extractUser, validate(playlistPaginationQuerySchema), getUserPlaylistsList);

export default router;
