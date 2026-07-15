import { Request, Response } from "express";
import pool from "../config/db";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
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

        const token = generateToken(newUser.id);

        res.status(201).json({ success: true, data: { token, user: newUser } });
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

        const token = generateToken(user.id);

        delete user.password;

        res.json({ success: true, data: { token, user } });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: { code: 500, message: "Server Error" }
        });
    }
};

export { register, login };
