import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                message: "Access denied. No token provided."
            }
        });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error(
                "JWT_SECRET is not defined in environment variables"
            );
        }

        const decoded = jwt.verify(token, secret) as { id: string };

        (req as any).user = { id: decoded.id };

        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            error: {
                message: "Invalid or expired token."
            }
        });
    }
};
