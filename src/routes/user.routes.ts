import { Router } from "express";
import { getMe, getUserById } from "../controllers/user.controller";
import { verifyToken, extractUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", verifyToken, getMe);
router.get("/:userId", extractUser, getUserById);

export default router;
