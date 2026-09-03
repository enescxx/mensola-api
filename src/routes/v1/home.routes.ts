import { Router } from "express";
import { getHome } from "@/controllers/v1/home.controller";
import { extractUser } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * GET /v1/home
 * Public composite feed with optional auth extraction.
 */
router.get("/", extractUser, getHome);

export default router;
