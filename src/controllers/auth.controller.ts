import { Request, Response } from "express";
import pool from "../config/db";
import { hashPassword, comparePassword } from "../utils/hash";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "../utils/jwt";
import { RegisterRequest, LoginRequest } from "../types/user";

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
        console.error("Register Error:", error);

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
        console.log(error);
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

export { register, login, refresh, logout };
