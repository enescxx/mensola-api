import { Router } from "express";
import { verifyToken } from "@/middlewares/auth.middleware";
import { toggleBookmarkHandler, getUserBookmarksHandler } from "@/controllers/bookmark.controller";

const router = Router();

// Bookmark toggle endpoint (POST /api/bookmarks/toggle)
router.post("/toggle", verifyToken, toggleBookmarkHandler);

// Get user bookmarks endpoint (GET /api/bookmarks)
router.get("/", verifyToken, getUserBookmarksHandler);

export default router;
