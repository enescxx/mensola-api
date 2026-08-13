import { Router } from "express";

import {
    getUserPlaylistsList,
    getLikedPlaylistsList,
    getPlaylistItemsList,
    getPlaylistById,
    getPlaylistInteractionsList,
} from "@/controllers/playlist";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { playlistPaginationQuerySchema, playlistIdParamSchema } from "@/validations/playlist";

const router = Router();

router.get("/likes", extractUser, validate(playlistPaginationQuerySchema), getLikedPlaylistsList);
router.get("/:playlistId/items", extractUser, validate(playlistIdParamSchema), getPlaylistItemsList);
router.get("/:playlistId/interactions", extractUser, validate(playlistIdParamSchema), getPlaylistInteractionsList);
router.get("/:playlistId", extractUser, validate(playlistIdParamSchema), getPlaylistById);
router.get("/", extractUser, validate(playlistPaginationQuerySchema), getUserPlaylistsList);

export default router;
