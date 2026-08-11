/**
 * Custom Application Error Class
 *
 * Extends the native JavaScript Error class to include HTTP status codes.
 * Designed to be thrown across services/controllers and caught cleanly by the globalErrorHandler.
 */
export class ApiError extends Error {
    /** HTTP status code associated with the error (e.g., 400, 401, 404, 500) */
    public readonly statusCode: number;

    /**
     * Creates an instance of ApiError.
     *
     * @param message - Human-readable error description.
     * @param statusCode - HTTP status code (defaults to 400 Bad Request).
     */
    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;

        // Restore prototype chain for proper 'instanceof' checks in TypeScript
        Object.setPrototypeOf(this, new.target.prototype);

        // Omits the ApiError constructor call itself from the stack trace for cleaner logging
        Error.captureStackTrace(this, this.constructor);
    }
}
