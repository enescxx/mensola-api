import { MESSAGES } from "@/constants/messages";
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 429,
            message: MESSAGES.ERRORS.TOO_MANY_AUTH_ATTEMPTS,
        },
    },
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 429,
            message: MESSAGES.ERRORS.TOO_MANY_RESET_REQUESTS,
        },
    },
});
