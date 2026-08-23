import { Router } from "express";

import {
    getLikedTracksList,
    getTrackDetails,
    likeTrackHandler,
    unlikeTrackHandler,
    getTrackInteractionsList,
    createTrackInteraction,
    getOrFetchSpotifyTrack,
} from "@/controllers/v1/track.controller";

import { extractUser, verifyToken } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

import {
    trackPaginationQuerySchema,
    trackParamSchema,
    createTrackInteractionSchema,
    spotifyIdParamSchema,
} from "@/validations/track.validation";
import { requiredUserId } from "@/middlewares/requiredId.middleware";

const router = Router();

router.get("/by-spotify/:spotifyId", extractUser, validate(spotifyIdParamSchema), getOrFetchSpotifyTrack);
router.get("/likes", extractUser, validate(trackPaginationQuerySchema), requiredUserId, getLikedTracksList);
router.get("/:trackId", extractUser, validate(trackParamSchema), getTrackDetails);
router.get("/:trackId/interactions", extractUser, validate(trackParamSchema), getTrackInteractionsList);
router.post("/:trackId/interactions", verifyToken, validate(createTrackInteractionSchema), createTrackInteraction);
router.post("/:trackId/like", verifyToken, validate(trackParamSchema), likeTrackHandler);
router.delete("/:trackId/like", verifyToken, validate(trackParamSchema), unlikeTrackHandler);

export default router;
