import { z } from "zod";

export const trackPaginationQuerySchema = z.object({
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

/**
 * Schema for validating track ID in URL parameters.
 */
export const trackParamSchema = z.object({
    params: z.object({
        trackId: z.string().uuid("Invalid track ID format. Must be a valid UUID."),
    }),
});

/**
 * Schema for creating/updating a track interaction.
 */
export const createTrackInteractionSchema = z.object({
    params: z.object({
        trackId: z.string().uuid("Invalid track ID format. Must be a valid UUID."),
    }),
    body: z.object({
        rating: z
            .number()
            .min(1, "Rating must be at least 1")
            .max(10, "Rating cannot exceed 10")
            .optional()
            .nullable(),
        comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional().nullable(),
        isLiked: z.boolean().optional().nullable(),
    }),
});
