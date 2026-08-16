import { z } from "zod";

/* ==========================================================================
   Shared & Query Validations
   ========================================================================== */

const movieIdRule = z
    .string({ message: "Movie ID is required and must be a string." })
    .uuid("Invalid movie ID format.")
    .trim();

const listIdRule = z.string().uuid("Invalid list ID format.").trim();

/**
 * Validation schema for endpoints that require a valid `movieId` parameter.
 */
export const movieIdParamSchema = z.object({
    params: z.object({
        movieId: movieIdRule,
    }),
});

/**
 * Validation schema for endpoints that require a valid `listId` parameter.
 */
export const listIdParamSchema = z.object({
    params: z.object({
        listId: listIdRule,
    }),
});

/**
 * Validation schema for endpoints that require both `listId` and `movieId` parameters.
 * Ideal for adding or removing a movie from a list.
 */
export const listAndMovieParamsSchema = z.object({
    params: z.object({
        listId: listIdRule,
        movieId: movieIdRule,
    }),
});

/**
 * Validation schema for paginated movie and list endpoints.
 * Validates optional `userId`, `page`, and `limit` query parameters.
 */
export const moviePaginationQuerySchema = z.object({
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
            .max(100, "Limit cannot exceed 100 items per request.")
            .optional(),
    }),
});

/* ==========================================================================
   Movie List Validations (Custom Lists)
   ========================================================================== */

/**
 * Validation schema for creating a new custom movie list.
 */
export const createMovieListSchema = z.object({
    body: z.object({
        title: z
            .string({ message: "Title is required and must be a string." })
            .trim()
            .min(1, "Title cannot be empty.")
            .max(100, "Title cannot exceed 100 characters."),

        description: z
            .string({ message: "Description must be a string." })
            .trim()
            .max(500, "Description cannot exceed 500 characters.")
            .optional(),

        image: z.string({ message: "Image URL must be a string." }).url("Image must be a valid URL.").optional(),

        isPrivate: z
            .boolean({
                message: "isPrivate flag is required and must be a boolean (true/false).",
            })
            .optional(),
    }),
});

/**
 * Validation schema for updating a custom movie list.
 */
export const updateMovieListSchema = z.object({
    params: listIdParamSchema.shape.params,
    body: z.object(
        {
            title: z.string().min(1, "Title cannot be empty.").max(100).trim().optional(),
            description: z.string().max(500).trim().optional(),
            image: z.string().url("Invalid image URL format.").optional().nullable(),
            isPrivate: z.boolean().optional(),
        },
        { message: "Request body is required." },
    ),
});

/**
 * Validation schema for creating or updating a movie interaction (rating, comment, isLiked).
 */
export const createMovieInteractionSchema = z.object({
    params: z.object({
        movieId: movieIdRule,
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
