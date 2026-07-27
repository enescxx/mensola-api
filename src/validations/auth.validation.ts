import { z } from "zod";

/**
 * Authentication Request Validation Schemas
 *
 * Defines Zod validation rules for incoming HTTP request parts (body, params, query).
 * Used alongside the validation middleware to sanitize and enforce schema contracts.
 */

/** Schema for validating user registration payloads. */
const registerSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required." }).email("Please enter a valid email address."),

        username: z
            .string({ message: "Username is required." })
            .min(3, "The username must be at least 3 characters long.")
            .max(20, "The username can be a maximum of 20 characters."),

        password: z
            .string({ message: "Password is required." })
            .min(6, "The password must be at least 6 characters long.")
    })
});

/** Schema for validating user login payloads. */
const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required." }).email("Please enter a valid email address."),

        password: z
            .string({ message: "Password is required." })
            .min(6, "The password must be at least 6 characters long.")
    })
});

/** Schema for validating token refresh requests. */
const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string({ message: "Refresh token is required." })
    })
});

/** Schema for validating password reset email requests. */
const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required." }).email("Please enter a valid email address.")
    })
});

/** Schema for validating password reset OTP verification requests. */
const verifyResetCodeSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required." }).email("Please enter a valid email address."),
        code: z.string({ message: "A verification code is required." }).length(6, "The code must be 6 digits long.")
    })
});

/** Schema for validating final password updates using a reset ticket. */
const resetPasswordSchema = z.object({
    body: z.object({
        ticket: z.string({ message: "Ticket is required." }),
        newPassword: z
            .string({ message: "A new password is required." })
            .min(6, "The new password must be at least 6 characters long.")
    })
});

export {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    verifyResetCodeSchema,
    resetPasswordSchema
};
