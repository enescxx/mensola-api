import { MESSAGES } from "@/constants/messages";

type ErrorCode = keyof typeof MESSAGES.ERRORS;

export class ApiError extends Error {
    public statusCode: number;
    public code: ErrorCode;

    constructor(code: ErrorCode, statusCode = 400, customMessage?: string) {
        const defaultMessage = MESSAGES.ERRORS[code];
        const message =
            typeof defaultMessage === "function" ? customMessage || code : defaultMessage || customMessage || code;

        super(message);
        this.name = "ApiError";
        this.code = code;
        this.statusCode = statusCode;
    }
}
