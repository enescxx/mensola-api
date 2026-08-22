import { Router } from "express";

import { verifyToken } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { paginationQuerySchema, searchTrackSchema } from "@/validations/spotify.validation";
import { spotifyGetNewAlbums, spotifySearchTrack } from "@/controllers/v1/spotify.controller";

const router = Router();

router.get("/search/track", verifyToken, validate(searchTrackSchema), spotifySearchTrack);
router.get("/albums/new", verifyToken, validate(paginationQuerySchema), spotifyGetNewAlbums);

export default router;
