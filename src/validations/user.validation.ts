import { z } from "zod";

/**
 * User Followers & Following Query Schema
 */
export const userListQuerySchema = z.object({
    query: z
        .object({
            page: z.coerce.number().min(1).optional(),
            limit: z.coerce.number().min(1).max(100).optional(),
            userId: z.string().optional()
        })
        .passthrough()
});

/**
 * User ID Params Schema
 */
export const userIdParamSchema = z.object({
    params: z
        .object({
            userId: z.string({ message: "User ID is required." })
        })
        .passthrough()
});

/**
 * Update Profile Body Schema
 */
export const updateProfileSchema = z.object({
    body: z
        .object({
            fullname: z.string().min(2).max(50).optional(),
            bio: z.string().max(160).optional(),
            avatar: z.string().optional()
        })
        .refine(data => Object.keys(data).length > 0, {
            message: "At least one field must be provided for update."
        })
});
