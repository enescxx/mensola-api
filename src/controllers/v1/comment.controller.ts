import { Response, NextFunction } from "express";

// Services
import { getCommentThread, toggleCommentLike, createReply } from "@/services/comment.service";

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
 * chronological order) with user info, likeCount, isLiked, and
 * pagination metadata.
 *
 * Authentication is optional (extractUser middleware): when a user is
 * authenticated, isLiked is computed; otherwise it defaults to false.
 *
 * @route   GET /v1/comments/:commentId
 * @access  Public (optional auth for isLiked)
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
 * Returns the resulting isLiked flag and fresh likeCount.
 *
 * @route   POST /v1/comments/:commentId/like
 * @access  Private (requires verifyToken middleware)
 */
export const toggleCommentLikeById = async (
    req: TypedRequest<{ commentId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const commentId = req.params.commentId as CommentId;
        const userId = req.user?.id as UserId;

        if (!userId) {
            console.error("Like error: req.user.id is missing or unauthenticated");
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (!commentId) {
            console.error("Like error: commentId is missing in params");
            res.status(400).json({ success: false, message: "commentId is required" });
            return;
        }

        const result = await toggleCommentLike({ commentId, userId });

        res.status(200).json({
            success: true,
            commentId: result.commentId,
            isLiked: result.isLiked,
            likeCount: result.likeCount,
            data: result,
        });
    } catch (error) {
        console.error("Like error:", error);
        next(error);
    }
};

/* ==========================================================================
   Comment Reply Controllers
   ========================================================================== */

/**
 * Creates a reply to a specified comment.
 *
 * Checks that the target comment exists, inherits its interactionId context,
 * inserts the reply with parentId = commentId, and returns 201 Created
 * with the new CommentThreadItem (including joined user details).
 *
 * @route   POST /v1/comments/:commentId/replies
 * @access  Private (requires verifyToken middleware)
 */
export const createReplyToComment = async (
    req: TypedRequest<{ commentId: string }, { content: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const commentId = req.params.commentId as CommentId;
        const userId = req.user!.id as UserId;
        const { content } = req.body;

        const newReply = await createReply({ commentId, userId, content });

        sendResponse(res, 201, newReply, MESSAGES.SUCCESS.CREATED_SUCCESSFULLY);
    } catch (error) {
        next(error);
    }
};
