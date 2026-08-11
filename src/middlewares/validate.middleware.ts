import { Request, Response, NextFunction } from "express";
import { z, ZodIssue, ZodSchema } from "zod";

/**
 * Express Request Validation Middleware
 *
 * Validates incoming request parts (body, query, params) against a provided Zod schema.
 * Formats validation errors into a standardized response structure and sanitizes input data.
 *
 * @param schema - Zod schema expecting { body?, query?, params? } objects.
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Validate request components against the Zod schema
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (!result.success) {
            // Map Zod issues into a clean, field-specific error array
            const errorDetails = result.error.issues.map((issue: ZodIssue) => ({
                // Extracts the field name from path (e.g., ['body', 'email'] -> 'email')
                field: issue.path.length > 1 ? String(issue.path[1]) : String(issue.path[0]) || "unknown",
                message: issue.message,
            }));

            // Use the first validation issue message as the primary error message
            const firstErrorMessage = errorDetails[0]?.message || "Validation failed.";

            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: firstErrorMessage,
                    details: errorDetails,
                },
            });
            return;
        }

        // Cast result.data to 'any' or expected shape to prevent TypeScript 'unknown' object error (TS18046)
        const parsedData = result.data as Record<string, any>;

        // Assign sanitized and parsed values back to the Express request object
        if (parsedData.body) req.body = parsedData.body;
        if (parsedData.query) {
            Object.keys(req.query).forEach((key) => delete req.query[key]);
            Object.assign(req.query, parsedData.query);
        }
        if (parsedData.params) {
            Object.assign(req.params, parsedData.params);
        }

        next();
    };
};
