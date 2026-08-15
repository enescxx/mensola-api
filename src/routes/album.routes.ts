import { Router } from "express";

import {
    getLikedAlbumsList,
    getAlbumDetails,
    getAlbumTracksList,
    likeAlbum,
    unlikeAlbum,
    getAlbumInteractionsList,
    createAlbumInteraction,
} from "@/controllers/album.controller";

import { extractUser, verifyToken } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import {
    albumPaginationQuerySchema,
    albumIdParamSchema,
    createAlbumInteractionSchema,
} from "@/validations/album.validation";

const router = Router();

router.get("/likes", extractUser, validate(albumPaginationQuerySchema), getLikedAlbumsList);
router.get("/:albumId/tracks", extractUser, validate(albumIdParamSchema), getAlbumTracksList);
router.get("/:albumId/interactions", extractUser, validate(albumIdParamSchema), getAlbumInteractionsList);
router.post(
    "/:albumId/interactions",
    verifyToken,
    validate(createAlbumInteractionSchema),
    createAlbumInteraction,
);
router.post("/:albumId/like", verifyToken, validate(albumIdParamSchema), likeAlbum);
router.delete("/:albumId/like", verifyToken, validate(albumIdParamSchema), unlikeAlbum);
router.get("/:albumId", extractUser, validate(albumIdParamSchema), getAlbumDetails);

export default router;
