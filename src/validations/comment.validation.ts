import { z } from "zod";
import { limitQueryRule, pageQueryRule } from "./common.validation";
import { MESSAGES } from "../constants/messages/tr";

/**
 * Validation rule for a comment UUID path parameter.
 * Used in GET /comments/:commentId to validate the entry-point comment id.
 */
export const commentIdRule = z
    .string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.COMMENT) })
    .uuid(MESSAGES.ERRORS.INVALID_UUID("Yorum kimliği (commentId)"))
    .trim();

/**
 * Validation schema for GET /comments/:commentId
 *
 * Validates:
 *  - params.commentId  → required UUID
 *  - query.page        → optional positive integer (defaults to 1 in the controller)
 *  - query.limit       → optional integer 1-100 (defaults to 20 in the controller)
 */
export const getCommentThreadSchema = z.object({
    params: z.object({
        commentId: commentIdRule,
    }),
    query: z.object({
        page: pageQueryRule,
        limit: limitQueryRule,
    }),
});

/**
 * Validation schema for POST /comments/:commentId/like
 *
 * Only validates the commentId path parameter.
 * Body is intentionally empty – toggle semantics require no payload.
 */
export const commentIdParamSchema = z.object({
    params: z.object({
        commentId: commentIdRule,
    }),
});
