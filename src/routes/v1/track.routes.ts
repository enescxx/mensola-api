import { Router } from "express";

import {
    getLikedTracksList,
    getFavoriteTracksList,
    addTrackToFavoritesHandler,
    removeTrackFromFavoritesHandler,
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
    trackInteractionsParamSchema,
    createTrackInteractionSchema,
    spotifyIdParamSchema,
    addFavoriteTrackSchema,
} from "@/validations/track.validation";
import { requiredUserId } from "@/middlewares/requiredId.middleware";

const router = Router();

router.get("/by-spotify/:spotifyId", extractUser, validate(spotifyIdParamSchema), getOrFetchSpotifyTrack);
router.get("/likes", extractUser, validate(trackPaginationQuerySchema), requiredUserId, getLikedTracksList);
router.get("/favorites", extractUser, validate(trackPaginationQuerySchema), requiredUserId, getFavoriteTracksList);
router.post("/favorites", verifyToken, validate(addFavoriteTrackSchema), addTrackToFavoritesHandler);
router.delete("/:trackId/favorites", verifyToken, validate(trackParamSchema), removeTrackFromFavoritesHandler);
router.get("/:trackId/interactions", extractUser, validate(trackInteractionsParamSchema), getTrackInteractionsList);
router.post("/:trackId/interactions", verifyToken, validate(createTrackInteractionSchema), createTrackInteraction);
router.post("/:trackId/interaction", verifyToken, validate(createTrackInteractionSchema), createTrackInteraction);
router.post("/:trackId/like", verifyToken, validate(trackParamSchema), likeTrackHandler);
router.delete("/:trackId/like", verifyToken, validate(trackParamSchema), unlikeTrackHandler);
router.get("/:trackId", extractUser, validate(trackParamSchema), getTrackDetails);

export default router;
