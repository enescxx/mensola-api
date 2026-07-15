import { Request, Response, NextFunction } from "express";
import { z, ZodIssue } from "zod";

export const validate = (schema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    details: result.error.issues.map((issue: ZodIssue) => ({
                        field: String(issue.path[0]) || "unknown",
                        message: issue.message
                    }))
                }
            });
            return;
        }

        next();
    };
};
