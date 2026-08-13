import { Router } from "express";

import { getUserPlaylistsList, getLikedPlaylistsList, getPlaylistItemsList } from "@/controllers/playlist.controller";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { playlistPaginationQuerySchema, playlistIdParamSchema } from "@/validations/playlist.validation";

const router = Router();

router.get("/likes", extractUser, validate(playlistPaginationQuerySchema), getLikedPlaylistsList);
router.get("/:playlistId/items", extractUser, validate(playlistIdParamSchema), getPlaylistItemsList);
router.get("/", extractUser, validate(playlistPaginationQuerySchema), getUserPlaylistsList);

export default router;

