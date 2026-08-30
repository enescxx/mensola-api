import { Router } from "express";
import { getHome } from "@/controllers/v1/home.controller";

const router = Router();

/**
 * GET /v1/home
 * Public composite feed — no auth required.
 */
router.get("/", getHome);

export default router;
