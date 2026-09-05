import { Response, NextFunction } from "express";

// Services
import { getCommentThread, toggleCommentLike } from "@/services/comment.service";

// Utilities
import { sendResponse } from "@/utils/response";

// Types
import { TypedRequest } from "@/types/express.types";
import { CommentId, UserId } from "@/types/common.types";
import { MESSAGES } from "@/constants/messages";

/* ==========================================================================
   Comment Thread Controllers
   ========================================================================== */

/**
 * Retrieves the full paginated comment thread for a given commentId.
 *
 * The entry point is any commentId in the thread. The service resolves
 * the associated interactionId and returns all comments (flat list,
 * chronological order) with user info, likeCount, isLikedByMe, and
 * pagination metadata.
 *
 * Authentication is optional (extractUser middleware): when a user is
 * authenticated, isLikedByMe is computed; otherwise it defaults to false.
 *
 * @route   GET /api/v1/comments/:commentId
 * @access  Public (optional auth for isLikedByMe)
 */
export const getCommentThreadById = async (
    req: TypedRequest<{ commentId: string }, unknown, { page?: string; limit?: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const commentId = req.params.commentId as CommentId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const currentUserId = req.user?.id ?? null;

        const thread = await getCommentThread({ commentId, page, limit, currentUserId });

        sendResponse(res, 200, thread, MESSAGES.SUCCESS.RETRIEVED_SUCCESSFULLY);
    } catch (error) {
        next(error);
    }
};

/* ==========================================================================
   Comment Like Controllers
   ========================================================================== */

/**
 * Toggles the like state of a specific comment for the authenticated user.
 *
 * - If the user has already liked the comment  → removes the like (unlike).
 * - If the user has not yet liked the comment  → adds the like.
 *
 * Returns the resulting isLikedByMe flag and fresh likeCount.
 *
 * @route   POST /api/v1/comments/:commentId/like
 * @access  Private (requires verifyToken middleware)
 */
export const toggleCommentLikeById = async (
    req: TypedRequest<{ commentId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const commentId = req.params.commentId as CommentId;
        const userId = req.user!.id as UserId;

        const result = await toggleCommentLike({ commentId, userId });

        sendResponse(res, 200, result, MESSAGES.SUCCESS.RETRIEVED_SUCCESSFULLY);
    } catch (error) {
        next(error);
    }
};
