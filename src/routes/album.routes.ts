import { Router } from "express";

import { getLikedAlbumsList, getAlbumDetails, getAlbumTracksList } from "@/controllers/album.controller";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { albumPaginationQuerySchema, albumIdParamSchema } from "@/validations/album.validation";

const router = Router();

router.get("/likes", extractUser, validate(albumPaginationQuerySchema), getLikedAlbumsList);
router.get("/:albumId/tracks", extractUser, validate(albumIdParamSchema), getAlbumTracksList);
router.get("/:albumId", extractUser, validate(albumIdParamSchema), getAlbumDetails);

export default router;
