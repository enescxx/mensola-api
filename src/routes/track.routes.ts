import { Router } from "express";

import { getLikedTracksList, getTrackDetails, likeTrackHandler, unlikeTrackHandler } from "@/controllers/track";

import { extractUser, verifyToken } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { trackPaginationQuerySchema, trackParamSchema } from "@/validations/track.validation";

const router = Router();

router.get("/likes", extractUser, validate(trackPaginationQuerySchema), getLikedTracksList);

router.get(
    "/:trackId",
    extractUser,
    validate(trackParamSchema),
    getTrackDetails,
);

router.post(
    "/:trackId/like",
    verifyToken,
    validate(trackParamSchema),
    likeTrackHandler,
);

router.delete(
    "/:trackId/like",
    verifyToken,
    validate(trackParamSchema),
    unlikeTrackHandler,
);

export default router;
