import { Router } from "express";

// Controllers
import { getCommentThreadById } from "@/controllers/v1/comment.controller";

// Middlewares
import { validate } from "@/middlewares/validate.middleware";

// Validations
import { getCommentThreadSchema } from "@/validations/comment.validation";

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
 * Query params:
 *   - page  (optional, default: 1)
 *   - limit (optional, default: 20, max: 100)
 *
 * Access: Public (no auth required – comments are visible to all)
 */
router.get("/:commentId", validate(getCommentThreadSchema), getCommentThreadById);

export default router;
