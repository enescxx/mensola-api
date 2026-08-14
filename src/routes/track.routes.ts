import { Router } from "express";

import { getLikedTracksList, getTrackDetails } from "@/controllers/track";

import { extractUser } from "@/middlewares/auth";
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

export default router;
