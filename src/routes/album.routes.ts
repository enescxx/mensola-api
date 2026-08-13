import { Router } from "express";

import { getLikedAlbumsList } from "@/controllers/album.controller";

import { extractUser } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";

import { albumPaginationQuerySchema } from "@/validations/album.validation";

const router = Router();

router.get("/likes", extractUser, validate(albumPaginationQuerySchema), getLikedAlbumsList);

export default router;
