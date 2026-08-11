/**
 * Generic API Response Wrapper
 *
 * Defines the standardized JSON structure returned by all API endpoints.
 * Ensures consistent response format across both success and error payloads.
 *
 * @template T - The type of the data object returned in successful responses.
 */
export type ApiResponse<T = any> = {
    /** Indicates whether the API request was processed successfully */
    success: boolean;

    /** Payload containing the requested data (present only on success) */
    data?: T;

    /** Optional human-readable message describing the result (e.g., "Logged out successfully.") */
    message?: string;

    /** Error details container (present only when success is false) */
    error?: {
        /** HTTP status code or application error code */
        code: number;
        /** Detailed description of the error */
        message: string;
    };
};
