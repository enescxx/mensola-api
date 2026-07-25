import { Router } from "express";
import {
    getMe,
    getUserById,
    updateProfile,
    getUserFollowers,
    getUserFollowing
} from "../controllers/user.controller";
import { verifyToken, extractUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateProfile);
router.get("/followers", extractUser, getUserFollowers);
router.get("/following", extractUser, getUserFollowing);
router.get("/:userId", extractUser, getUserById);

export default router;
