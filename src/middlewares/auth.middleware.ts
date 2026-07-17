import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
    req: Request,
    res: Response,
    nextNexFunction
): void => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret) as { id: string };

        req.user = { id: decoded.id };

        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};
