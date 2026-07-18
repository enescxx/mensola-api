import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { hashPassword, comparePassword } from "../utils/hash";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "../utils/jwt";
import { RegisterRequest, LoginRequest } from "../types/user";
import { sendPasswordResetEmail } from "../utils/email";

const register = async (
    req: Request<{}, {}, RegisterRequest>,
    res: Response
): Promise<void> => {
    const { email, username, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);

        const queryText = `
            INSERT INTO "User" (id, email, username, password, "createdAt", "updatedAt") 
            VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) 
            RETURNING id, email, username;
        `;

        const result = await pool.query(queryText, [
            email,
            username,
            hashedPassword
        ]);
        const newUser = result.rows[0];

        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        await pool.query(
            'INSERT INTO "Session" ("userId", "refreshToken") VALUES ($1, $2)',
            [newUser.id, refreshToken]
        );

        res.status(201).json({
            success: true,
            data: { accessToken, refreshToken, user: newUser }
        });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "This email or username is already in use."
                }
            });
            return;
        }

        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error" }
        });
    }
};

const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM "User" WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({
                success: false,
                error: { code: 401, message: "Invalid email or password." }
            });
            return;
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
            return;
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await pool.query(
            'INSERT INTO "Session" ("userId", "refreshToken") VALUES ($1, $2)',
            [user.id, refreshToken]
        );
        delete user.password;

        res.json({ success: true, data: { accessToken, refreshToken, user } });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error" }
        });
    }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    try {
        const decoded = verifyRefreshToken(refreshToken) as { id: string };

        const sessionResult = await pool.query(
            'SELECT * FROM "Session" WHERE "refreshToken" = $1',
            [refreshToken]
        );
        const session = sessionResult.rows[0];

        if (!session) {
            res.status(401).json({
                success: false,
                error: {
                    code: 401,
                    message: "Invalid refresh token. Please log in again."
                }
            });
            return;
        }

        const newAccessToken = generateAccessToken(decoded.id);

        res.json({
            success: true,
            data: { accessToken: newAccessToken }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: { code: 401, message: "Invalid or expired refresh token." }
        });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    try {
        await pool.query('DELETE FROM "Session" WHERE "refreshToken" = $1', [
            refreshToken
        ]);

        res.json({
            success: true,
            data: { message: "The log out is successful." }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error." }
        });
    }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        const result = await pool.query(
            'SELECT id FROM "User" WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: 404,
                    message:
                        "No account was found registered with this email address."
                }
            });
            return;
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            'UPDATE "User" SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE email = $3',
            [otpCode, otpExpires, email]
        );

        await sendPasswordResetEmail(email, otpCode);

        res.json({
            success: true,
            data: {
                message:
                    "If this email address is registered, a reset code has been sent."
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error." }
        });
    }
};

const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;

    try {
        const result = await pool.query(
            'SELECT id FROM "User" WHERE email = $1 AND "resetToken" = $2 AND "resetTokenExpires" > NOW()',
            [email, code]
        );
        const user = result.rows[0];

        if (!user) {
            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Invalid or expired verification code."
                }
            });
            return;
        }

        const secureTicket = crypto.randomBytes(32).toString("hex");
        const ticketExpires = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            'UPDATE "User" SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE id = $3',
            [secureTicket, ticketExpires, user.id]
        );

        res.json({ success: true, data: { ticket: secureTicket } });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error." }
        });
    }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { ticket, newPassword } = req.body;

    try {
        const result = await pool.query(
            'SELECT id FROM "User" WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()',
            [ticket]
        );
        const user = result.rows[0];

        if (!user) {
            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: "Invalid session. Please restart the process."
                }
            });
            return;
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await pool.query(
            'UPDATE "User" SET password = $1, "resetToken" = NULL, "resetTokenExpires" = NULL WHERE id = $2',
            [hashedNewPassword, user.id]
        );

        await pool.query('DELETE FROM "Session" WHERE "userId" = $1', [
            user.id
        ]);

        res.json({
            success: true,
            data: {
                message:
                    "Your password has been successfully updated. Please log in with your new password."
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error." }
        });
    }
};

export {
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    verifyResetCode,
    resetPassword
};
