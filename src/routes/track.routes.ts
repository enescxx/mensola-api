import { Router } from "express";

import { getLikedTracksList } from "@/controllers/track";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { trackPaginationQuerySchema } from "@/validations/track";

const router = Router();

router.get("/likes", extractUser, validate(trackPaginationQuerySchema), getLikedTracksList);

export default router;
