import { Router } from "express";

import {
    getUserPlaylistsList,
    getLikedPlaylistsList,
    getPlaylistItemsList,
    getPlaylistById,
    getPlaylistInteractionsList,
    createPlaylistInteraction,
} from "@/controllers/playlist";

import { extractUser, verifyToken } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import {
    playlistPaginationQuerySchema,
    playlistIdParamSchema,
    createPlaylistInteractionSchema,
} from "@/validations/playlist";

const router = Router();

router.get("/likes", extractUser, validate(playlistPaginationQuerySchema), getLikedPlaylistsList);
router.get("/:playlistId/items", extractUser, validate(playlistIdParamSchema), getPlaylistItemsList);
router.get("/:playlistId/interactions", extractUser, validate(playlistIdParamSchema), getPlaylistInteractionsList);
router.post(
    "/:playlistId/interactions",
    verifyToken,
    validate(createPlaylistInteractionSchema),
    createPlaylistInteraction,
);
router.get("/:playlistId", extractUser, validate(playlistIdParamSchema), getPlaylistById);
router.get("/", extractUser, validate(playlistPaginationQuerySchema), getUserPlaylistsList);

export default router;
