import { z } from "zod";

const registerSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .email("Please enter a valid email address."),

    username: z
        .string({ message: "Username is required." })
        .min(3, "The username must be at least 3 characters long.")
        .max(20, "The username can be a maximum of 20 characters."),

    password: z
        .string({ message: "Password is required." })
        .min(6, "The password must be at least 6 characters long.")
});

const loginSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .email("Please enter a valid email address."),

    password: z
        .string({ message: "Password is required." })
        .min(6, "The password must be at least 6 characters long.")
});

const refreshTokenSchema = z.object({
    refreshToken: z.string({ message: "Refresh token is required." })
});

const forgotPasswordSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .email("Please enter a valid email address.")
});

const verifyResetCodeSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .email("Please enter a valid email address."),
    code: z
        .string({ message: "A verification code is required." })
        .length(6, "The code must be 6 digits long.")
});

const resetPasswordSchema = z.object({
    ticket: z.string({ message: "Ticket is required." }),
    newPassword: z
        .string({ message: "A new password is required." })
        .min(6, "The new password must be at least 6 characters long.")
});

export {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    verifyResetCodeSchema,
    resetPasswordSchema
};
