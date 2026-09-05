import { Router } from "express";

// Controllers
import { getCommentThreadById, toggleCommentLikeById } from "@/controllers/v1/comment.controller";

// Middlewares
import { verifyToken, extractUser } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

// Validations
import { getCommentThreadSchema, commentIdParamSchema } from "@/validations/comment.validation";

const router = Router();

/* ==========================================================================
   Comment Thread Routes
   ========================================================================== */

/**
 * GET /api/v1/comments/:commentId
 *
 * Returns the full paginated thread (flat comment list + pagination metadata)
 * for the interaction that the given commentId belongs to.
 *
 * Each comment includes likeCount and isLikedByMe (requires optional auth).
 *
 * Query params:
 *   - page  (optional, default: 1)
 *   - limit (optional, default: 20, max: 100)
 *
 * Access: Public with optional auth (isLikedByMe computed when token present)
 */
router.get("/:commentId", extractUser, validate(getCommentThreadSchema), getCommentThreadById);

/* ==========================================================================
   Comment Like Routes
   ========================================================================== */

/**
 * POST /api/v1/comments/:commentId/like
 *
 * Toggles the like state for the given comment.
 *   - Already liked  → removes the like (unlike).
 *   - Not yet liked  → adds the like.
 *
 * Response: { commentId, isLikedByMe, likeCount }
 *
 * Access: Private (requires valid JWT)
 */
router.post("/:commentId/like", verifyToken, validate(commentIdParamSchema), toggleCommentLikeById);

export default router;
