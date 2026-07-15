import { z } from "zod";

export const registerSchema = z.object({
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

export const loginSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .email("Please enter a valid email address."),

    password: z
        .string({ message: "Password is required." })
        .min(6, "The password must be at least 6 characters long.")
});
