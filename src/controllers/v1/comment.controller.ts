import { Response, NextFunction } from "express";

// Services
import { getCommentThread } from "@/services/comment.service";

// Utilities
import { sendResponse } from "@/utils/response";

// Types
import { TypedRequest } from "@/types/express.types";
import { CommentId } from "@/types/common.types";
import { MESSAGES } from "@/constants/messages";

/* ==========================================================================
   Comment Thread Controllers
   ========================================================================== */

/**
 * Retrieves the full paginated comment thread for a given commentId.
 *
 * The entry point is any commentId in the thread. The service resolves
 * the associated interactionId and returns all comments (flat list,
 * chronological order) with user info and pagination metadata.
 *
 * @route   GET /api/v1/comments/:commentId
 * @access  Public
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

        const thread = await getCommentThread({ commentId, page, limit });

        sendResponse(res, 200, thread, MESSAGES.SUCCESS.RETRIEVED_SUCCESSFULLY);
    } catch (error) {
        next(error);
    }
};
