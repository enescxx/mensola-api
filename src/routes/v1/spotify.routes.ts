import { Router } from "express";

import { verifyToken } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { searchTrackSchema } from "@/validations/spotify.validation";
import { spotifySearchTrack } from "@/controllers/v1/spotify.controller";

const router = Router();

router.get("/search/track", verifyToken, validate(searchTrackSchema), spotifySearchTrack);

export default router;
