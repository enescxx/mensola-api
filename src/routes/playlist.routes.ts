import { Router } from "express";

import {
    getUserPlaylistsList,
    getLikedPlaylistsList,
    getPlaylistItemsList,
    getPlaylistById,
    getPlaylistInteractionsList,
    createPlaylistInteraction,
    likePlaylist,
    unlikePlaylist,
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
router.post("/:playlistId/like", verifyToken, validate(playlistIdParamSchema), likePlaylist);
router.delete("/:playlistId/like", verifyToken, validate(playlistIdParamSchema), unlikePlaylist);
router.get("/:playlistId", extractUser, validate(playlistIdParamSchema), getPlaylistById);
router.get("/", extractUser, validate(playlistPaginationQuerySchema), getUserPlaylistsList);

export default router;
