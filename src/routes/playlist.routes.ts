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
    addTrackToPlaylist,
    removeTrackFromPlaylist,
} from "@/controllers/playlist";

import { extractUser, verifyToken } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import {
    playlistPaginationQuerySchema,
    playlistIdParamSchema,
    createPlaylistInteractionSchema,
    addTrackToPlaylistSchema,
} from "@/validations/playlist";
import { requiredUserId } from "@/middlewares/requiredId";

const router = Router();

router.post("/:playlistId/items/:trackId", verifyToken, validate(addTrackToPlaylistSchema), addTrackToPlaylist);
router.delete("/:playlistId/items/:trackId", verifyToken, validate(addTrackToPlaylistSchema), removeTrackFromPlaylist);

router.get("/likes", extractUser, validate(playlistPaginationQuerySchema), requiredUserId, getLikedPlaylistsList);
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
router.get("/", extractUser, validate(playlistPaginationQuerySchema), requiredUserId, getUserPlaylistsList);

export default router;
