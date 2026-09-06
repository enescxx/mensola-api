import { Router } from "express";

// Controllers
import { getCommentThreadById, toggleCommentLikeById, createReplyToComment } from "@/controllers/v1/comment.controller";

// Middlewares
import { verifyToken, extractUser } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

// Validations
import { getCommentThreadSchema, commentIdParamSchema, createReplySchema } from "@/validations/comment.validation";

const router = Router();

/* ==========================================================================
   Comment Thread Routes
   ========================================================================== */

/**
 * GET /v1/comments/:commentId
 *
 * Returns the full paginated thread (flat comment list + pagination metadata)
 * for the interaction that the given commentId belongs to.
 *
 * Each comment includes likeCount and isLiked (requires optional auth).
 *
 * Query params:
 *   - page  (optional, default: 1)
 *   - limit (optional, default: 20, max: 100)
 *
 * Access: Public with optional auth (isLiked computed when token present)
 */
router.get("/:commentId", extractUser, validate(getCommentThreadSchema), getCommentThreadById);

/* ==========================================================================
   Comment Like Routes
   ========================================================================== */

/**
 * POST /v1/comments/:commentId/like
 *
 * Toggles the like state for the given comment.
 *   - Already liked  → removes the like (unlike).
 *   - Not yet liked  → adds the like.
 *
 * Response: { commentId, isLiked, likeCount }
 *
 * Access: Private (requires valid JWT)
 */
router.post("/:commentId/like", verifyToken, validate(commentIdParamSchema), toggleCommentLikeById);

/* ==========================================================================
   Comment Reply Routes
   ========================================================================== */

/**
 * POST /v1/comments/:commentId/replies
 *
 * Adds a reply to the target comment within the same interaction chain.
 *
 * Request body:
 *   - content (string, min 1, max 2000, required)
 *
 * Response: 201 Created with newly created CommentThreadItem
 *   {
 *     id,
 *     interactionId,
 *     parentId,
 *     content,
 *     createdAt,
 *     user: { id, username, avatar },
 *     likeCount: 0,
 *     isLiked: false
 *   }
 *
 * Access: Private (requires valid JWT)
 */
router.post("/:commentId/replies", verifyToken, validate(createReplySchema), createReplyToComment);

export default router;
