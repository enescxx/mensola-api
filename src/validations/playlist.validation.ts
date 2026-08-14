import { z } from "zod";

export const playlistPaginationQuerySchema = z.object({
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

export const playlistIdParamSchema = z.object({
    params: z.object({
        playlistId: z
            .string({ message: "Playlist ID is required and must be a string." })
            .uuid("Invalid playlist ID format.")
            .trim(),
    }),
    query: z
        .object({
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
        })
        .optional(),
});
export const createPlaylistInteractionSchema = z.object({
    params: z.object({
        playlistId: z
            .string({ message: "Playlist ID is required and must be a string." })
            .uuid("Invalid playlist ID format.")
            .trim(),
    }),
    body: z.object({
        rating: z
            .number({ message: "Rating must be a number." })
            .min(0, "Rating must be at least 0.")
            .max(10, "Rating cannot exceed 10.")
            .optional()
            .nullable(),
        comment: z
            .string({ message: "Comment must be a string." })
            .trim()
            .max(2000, "Comment cannot exceed 2000 characters.")
            .optional()
            .nullable(),
        isLiked: z.boolean().optional(),
    }),
});
