import { UserId } from "@/types/common";
import { ApiError } from "@/utils/error";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next(new ApiError("Access denied. No token provided.", 401));
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new ApiError("JWT_SECRET is not defined in environment variables", 500);
        }

        const decoded = jwt.verify(token, secret) as { id: UserId };

        if (!decoded.id) {
            throw new ApiError("Invalid or expired token.", 403);
        }

        req.user = { id: decoded.id };

        next();
    } catch (error) {
        next(error);
    }
};

const extractUser = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new ApiError("JWT_SECRET is not defined in environment variables", 500);
        }

        const decoded = jwt.verify(token, secret) as { id: UserId };

        if (!decoded.id) {
            req.user = null;
            return next();
        }

        req.user = { id: decoded.id };
        next();
    } catch (error) {
        next(error);
    }
};

export { verifyToken, extractUser };
