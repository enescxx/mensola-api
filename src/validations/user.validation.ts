import { z } from "zod";
import { limitQueryRule, pageQueryRule, userIdRule } from "./common.validation";
import { MESSAGES } from "../constants/messages/tr";

/**
 * User Followers & Following Query Schema
 */
export const userListQuerySchema = z.object({
    query: z.object({ page: pageQueryRule, limit: limitQueryRule, userId: userIdRule }).passthrough(),
});

/**
 * User ID Params Schema
 */
export const userIdParamSchema = z.object({
    params: z.object({ userId: z.string({ message: MESSAGES.ERRORS.FIELD_REQUIRED(MESSAGES.FIELDS.USER_ID) }) }).passthrough(),
});

/**
 * Update Profile Body Schema
 */
export const updateProfileSchema = z.object({
    body: z
        .object({
            fullname: z.string().min(2, MESSAGES.ERRORS.MIN_LENGTH(MESSAGES.FIELDS.FULL_NAME, 2)).max(50, MESSAGES.ERRORS.MAX_LENGTH(MESSAGES.FIELDS.FULL_NAME, 50)).optional(),
            bio: z.string().max(160, MESSAGES.ERRORS.MAX_LENGTH(MESSAGES.FIELDS.BIO, 160)).optional(),
            avatar: z.string().optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: MESSAGES.ERRORS.AT_LEAST_ONE_FIELD_REQUIRED,
        }),
});
