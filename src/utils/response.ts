import { Response } from "express";
import { ApiResponse } from "@/types/api";
import { translateMessage } from "@/constants/messages";

/**
 * Standardized Success Response Helper
 *
 * Formats and sends a successful HTTP response using the unified ApiResponse structure.
 * Automatically sets the HTTP status code and constructs the JSON response body.
 *
 * @template T - The type of the payload data being returned.
 * @param res - Express Response object.
 * @param statusCode - HTTP status code (e.g., 200 OK, 201 Created).
 * @param data - The main payload to return in the response body.
 * @param message - Optional success message describing the outcome.
 * @returns Express Response containing the formatted ApiResponse payload.
 */
export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    data: T,
    message?: string,
): Response<ApiResponse<T>> => {
    const lang = res.locals?.language;
    const localizedMessage = message ? translateMessage(message, lang) : undefined;

    return res.status(statusCode).json({
        success: true,
        ...(localizedMessage && { message: localizedMessage }),
        data,
    });
};
