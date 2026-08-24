import { Router } from "express";
import { verifyToken } from "@/middlewares/auth.middleware";
import { uploadAvatar } from "@/controllers/v1/storage.controller";
import { avatarUploadMiddleware } from "@/middlewares/upload.middleware";

const router = Router();

router.post("/upload/avatar", verifyToken, avatarUploadMiddleware, uploadAvatar);

export default router;
