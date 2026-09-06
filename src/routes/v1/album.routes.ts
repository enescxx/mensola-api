import { Router } from "express";

import {
    getLikedAlbumsList,
    getAlbumDetails,
    getAlbumTracksList,
    likeAlbum,
    unlikeAlbum,
    getAlbumInteractionsList,
    createAlbumInteraction,
    getOrFetchSpotifyAlbum,
} from "@/controllers/v1/album.controller";

import { extractUser, verifyToken } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

import {
    albumPaginationQuerySchema,
    albumIdParamSchema,
    albumInteractionsParamSchema,
    createAlbumInteractionSchema,
} from "@/validations/album.validation";
import { requiredUserId } from "@/middlewares/requiredId.middleware";

const router = Router();

router.get("/by-spotify/:spotifyId", extractUser, getOrFetchSpotifyAlbum);
router.get("/likes", extractUser, validate(albumPaginationQuerySchema), requiredUserId, getLikedAlbumsList);
router.get("/:albumId/tracks", extractUser, validate(albumIdParamSchema), getAlbumTracksList);
router.get("/:albumId/interactions", extractUser, validate(albumInteractionsParamSchema), getAlbumInteractionsList);
router.post("/:albumId/interactions", verifyToken, validate(createAlbumInteractionSchema), createAlbumInteraction);
router.post("/:albumId/like", verifyToken, validate(albumIdParamSchema), likeAlbum);
router.delete("/:albumId/like", verifyToken, validate(albumIdParamSchema), unlikeAlbum);
router.get("/:albumId", extractUser, validate(albumIdParamSchema), getAlbumDetails);

export default router;
