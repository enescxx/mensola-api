import { z } from "zod";

/* ==========================================================================
   Query Validations
   ========================================================================== */

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

        // Zod'un coerce özelliği ile URL'den gelen string değerleri otomatik olarak number'a çeviriyoruz
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
            .optional()
    })
});

/* ==========================================================================
   Body Validations
   ========================================================================== */

/**
 * Validation schema for creating a new custom movie list.
 * Validates the `title`, `description`, `image`, and `isPrivate` fields in the request body.
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

        isPrivate: z.boolean({ message: "isPrivate flag is required and must be a boolean (true/false)." })
    })
});

/* ==========================================================================
   Params Validations
   ========================================================================== */

/**
 * Validation schema for endpoints that require a valid `movieId` parameter.
 * Can be used for marking/unmarking watched, adding to favorites, etc.
 */
export const movieIdParamSchema = z.object({
    params: z.object({
        movieId: z
            .string({ message: "Movie ID is required and must be a string." })
            .uuid("Invalid movie ID format.")
            .trim()
    })
});
