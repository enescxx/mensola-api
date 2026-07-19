import { Router } from "express";
import {
    getMe,
    getUserById,
    updateProfile
} from "../controllers/user.controller";
import { verifyToken, extractUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", verifyToken, getMe);
router.get("/:userId", extractUser, getUserById);
router.put("/me", verifyToken, updateProfile);

export default router;
