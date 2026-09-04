import { MESSAGES, translateMessage } from "@/constants/messages";
import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/**
 * Global Error Handling Middleware
 *
 * Intercepts all unhandled errors passed via next(err) across the application.
 * Normalizes error responses, handles specific database error codes (e.g., PostgreSQL unique constraint violations),
 * and formats the error payload consistently using the standard ApiError structure.
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const lang = res.locals?.language || (req.headers["accept-language"]?.toString().toLowerCase().startsWith("en") ? "en" : "tr");

    // Default to custom statusCode/message or fallback to 500 Internal Server Error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
        return res.status(403).json({
            success: false,
            error: {
                message: translateMessage(MESSAGES.ERRORS.INVALID_TOKEN, lang),
            },
        });
    }

    // Handle PostgreSQL unique constraint violation (e.g., duplicate email/username)
    if (err.code === "23505") {
        statusCode = 400;
        message = MESSAGES.ERRORS.EMAIL_USERNAME_IN_USE;
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || statusCode,
            message: translateMessage(message, lang),
        },
    });
};
