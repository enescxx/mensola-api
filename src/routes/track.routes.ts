import { Router } from "express";

import {
    getLikedTracksList,
    getTrackDetails,
    likeTrackHandler,
    unlikeTrackHandler,
    getTrackInteractionsList,
    createTrackInteraction,
} from "@/controllers/track";

import { extractUser, verifyToken } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import {
    trackPaginationQuerySchema,
    trackParamSchema,
    createTrackInteractionSchema,
} from "@/validations/track.validation";

const router = Router();

router.get("/likes", extractUser, validate(trackPaginationQuerySchema), getLikedTracksList);
router.get("/:trackId", extractUser, validate(trackParamSchema), getTrackDetails);
router.get("/:trackId/interactions", extractUser, validate(trackParamSchema), getTrackInteractionsList);
router.post("/:trackId/interactions", verifyToken, validate(createTrackInteractionSchema), createTrackInteraction);
router.post("/:trackId/like", verifyToken, validate(trackParamSchema), likeTrackHandler);
router.delete("/:trackId/like", verifyToken, validate(trackParamSchema), unlikeTrackHandler);

export default router;
