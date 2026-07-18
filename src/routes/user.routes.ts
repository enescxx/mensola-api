import { Router } from "express";
import { getMe } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", verifyToken, getMe);

export default router;
