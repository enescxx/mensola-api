import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/error";

export const requiredUserId = (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.query.userId as string) || req.user?.id;

    if (!userId) {
        return next(new ApiError("userId is invalid", 400));
    }

    next();
};
