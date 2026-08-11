import {Request, Response, NextFunction} from "express";
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";

/**
 * Global Error Handling Middleware
 *
 * Intercepts all unhandled errors passed via next(err) across the application.
 * Normalizes error responses, handles specific database error codes (e.g., PostgreSQL unique constraint violations),
 * and formats the error payload consistently using the standard ApiError structure.
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Default to custom statusCode/message or fallback to 500 Internal Server Error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
        return res.status(403).json({
            success: false,
            error: {
                message: "Invalid or expired token."
            }
        });
    }

    // Handle PostgreSQL unique constraint violation (e.g., duplicate email/username)
    if (err.code === "23505") {
        statusCode = 400;
        message = "This email or username is already in use.";
    }

    return res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            message
        }
    });
};
