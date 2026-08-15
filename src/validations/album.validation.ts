import { z } from "zod";

export const albumPaginationQuerySchema = z.object({
    query: z.object({
        userId: z
            .string({ message: "User ID must be a string." })
            .uuid("Invalid user ID format. Must be a valid UUID.")
            .optional(),

        page: z.coerce
            .number({ message: "Page must be a number." })
            .int("Page must be an integer.")
            .min(1, "Page number must be at least 1.")
            .optional(),

        limit: z.coerce
            .number({ message: "Limit must be a number." })
            .int("Limit must be an integer.")
            .min(1, "Limit must be at least 1.")
            .max(100, "Limit cannot exceed 100.")
            .optional(),
    }),
});

export const albumIdParamSchema = z.object({
    params: z.object({
        albumId: z
            .string({ message: "Album ID is required and must be a string." })
            .uuid("Invalid album ID format.")
            .trim(),
    }),
});
