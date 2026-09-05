import pool from "@/config/db";
import { commentQueries } from "@/queries/comment.queries";
import { ApiError } from "@/utils/error";
import { InteractionId } from "@/types/common.types";
import {
    CommentThreadItem,
    CommentThreadPagination,
    CommentThreadResponse,
    GetCommentThreadDto,
    ToggleCommentLikeDto,
    ToggleCommentLikeResponse,
} from "@/types/interaction.types";

/**
 * Resolves the interactionId associated with a given commentId.
 *
 * This is the first step in building the comment thread: we locate
 * the root interaction so that we can then fetch all sibling / child
 * comments that belong to the same interaction chain.
 *
 * @param commentId - The UUID of the comment used as the entry point.
 * @returns The interactionId of the resolved comment.
 * @throws {ApiError} 404 Not Found if no comment with the given id exists.
 */
const resolveInteractionId = async (commentId: string): Promise<InteractionId> => {
    const result = await pool.query<{ interactionId: InteractionId }>(
        commentQueries.findInteractionIdByCommentId,
        [commentId],
    );

    if (result.rowCount === 0) {
        throw new ApiError("NOT_FOUND", 404);
    }

    return result.rows[0].interactionId;
};

/**
 * Fetches the full paginated comment thread for a given commentId.
 *
 * Workflow:
 *  1. Resolve the interactionId from the provided commentId.
 *  2. Count all comments tied to that interactionId (for pagination metadata).
 *  3. Fetch the paginated, chronologically ordered comment list with user info,
 *     likeCount and isLikedByMe (based on currentUserId).
 *
 * The returned list is **flat** – parentId is included in each item so the
 * mobile client can handle any tree rendering it needs on its end.
 *
 * @param dto - DTO containing the entry commentId, page, limit, and optional currentUserId.
 * @returns A CommentThreadResponse with the flat comment list and pagination metadata.
 * @throws {ApiError} 404 Not Found if the commentId does not exist.
 */
export const getCommentThread = async (
    dto: GetCommentThreadDto,
): Promise<CommentThreadResponse> => {
    const { commentId, page, limit, currentUserId } = dto;
    const offset = (page - 1) * limit;

    // Step 1 – resolve the interactionId from the provided commentId
    const interactionId = await resolveInteractionId(commentId as string);

    // Step 2 – count all comments for this interaction (needed for pagination meta)
    const countResult = await pool.query<{ total: number }>(
        commentQueries.countCommentsByInteractionId,
        [interactionId],
    );
    const total = countResult.rows[0]?.total ?? 0;

    // Step 3 – fetch the paginated, ordered comment list with likeCount + isLikedByMe
    const commentsResult = await pool.query<CommentThreadItem>(
        commentQueries.getCommentsByInteractionId,
        [interactionId, limit, offset, currentUserId ?? null],
    );

    const pagination: CommentThreadPagination = {
        total,
        page,
        limit,
        hasMore: offset + commentsResult.rows.length < total,
    };

    return {
        interactionId,
        comments: commentsResult.rows,
        pagination,
    };
};

/**
 * Toggles the like state of a comment for the requesting user.
 *
 * Idempotent toggle semantics:
 *  - If a CommentLike row already exists for (userId, commentId) → delete it (unlike).
 *  - Otherwise → insert a new row (like).
 *
 * Returns the fresh likeCount and the resulting isLikedByMe state.
 *
 * @param dto - DTO containing the commentId and authenticated userId.
 * @returns ToggleCommentLikeResponse with isLikedByMe and likeCount.
 * @throws {ApiError} 404 Not Found if the comment does not exist.
 */
export const toggleCommentLike = async (
    dto: ToggleCommentLikeDto,
): Promise<ToggleCommentLikeResponse> => {
    const { commentId, userId } = dto;

    // Guard: verify the comment exists before attempting any write
    const commentCheck = await pool.query(commentQueries.checkCommentExists, [commentId]);
    if (commentCheck.rowCount === 0) {
        throw new ApiError("NOT_FOUND", 404);
    }

    // Check for an existing like
    const existing = await pool.query(commentQueries.findCommentLike, [userId, commentId]);
    const isAlreadyLiked = (existing.rowCount ?? 0) > 0;

    if (isAlreadyLiked) {
        // Unlike: remove the row
        await pool.query(commentQueries.removeCommentLike, [userId, commentId]);
    } else {
        // Like: insert a new row
        await pool.query(commentQueries.addCommentLike, [userId, commentId]);
    }

    // Fetch the fresh like count after the toggle
    const countResult = await pool.query<{ likeCount: number }>(
        commentQueries.countCommentLikes,
        [commentId],
    );
    const likeCount = countResult.rows[0]?.likeCount ?? 0;

    return {
        commentId,
        isLikedByMe: !isAlreadyLiked,
        likeCount,
    };
};
