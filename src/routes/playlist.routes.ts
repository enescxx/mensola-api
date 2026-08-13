import { Router } from "express";

import { getUserPlaylistsList, getLikedPlaylistsList } from "@/controllers/playlist.controller";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { playlistPaginationQuerySchema } from "@/validations/playlist.validation";

const router = Router();

router.get("/likes", extractUser, validate(playlistPaginationQuerySchema), getLikedPlaylistsList);
router.get("/", extractUser, validate(playlistPaginationQuerySchema), getUserPlaylistsList);

export default router;
