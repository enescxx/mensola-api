/**
 * Generic API Response Wrapper
 *
 * Defines the standardized JSON structure returned by all backend API endpoints.
 * Ensures consistent response format across both success and error payloads.
 *
 * @template T - The payload type returned in successful responses.
 */
export type ApiResponse<T = unknown> = {
    /** Indicates whether the API request was processed successfully */
    success: boolean;

    /** Payload containing the requested data (present only on success) */
    data?: T;

    /** Optional human-readable message describing the result */
    message?: string;

    /** Error details container (present only when success is false) */
    error?: {
        /** HTTP status code or domain-specific error code */
        code: number;
        /** Detailed description of the error */
        message: string;
    };
};
