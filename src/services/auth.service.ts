import crypto from "crypto";
import pool from "@/config/db";

import { ApiError } from "@/utils/error";
import { sendPasswordResetEmail } from "@/utils/email";
import { hashPassword, comparePassword } from "@/utils/hash";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/jwt";

import { authQueries } from "@/queries/auth";

import {
    CreateUserDto,
    LoginUserDto,
    TokenRefreshDto,
    LogoutDto,
    SendResetEmailDto,
    VerifyCodeDto,
    UpdatePasswordDto,
    CreateUserResponse,
    LoginUserResponse,
    TokenRefreshResponse,
    VerifyCodeResponse,
} from "@/types/auth";
import { IUser, ISession } from "@/types/user";

/*
 * Register a new user, hashes their password, and creates an initial session
 */
const createUser = async (dto: CreateUserDto): Promise<CreateUserResponse> => {
    const hashedPassword = await hashPassword(dto.password);

    const values = [dto.email, dto.username, hashedPassword];
    const result = await pool.query<IUser>(authQueries.user.create, values);

    const newUser = result.rows[0];

    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Save refresh token to session table
    await pool.query(authQueries.session.create, [newUser.id, refreshToken]);

    return { user: newUser, accessToken, refreshToken };
};

/*
 * Authenticates user credentials and generates access & refresh tokens
 */
const loginUser = async (dto: LoginUserDto): Promise<LoginUserResponse> => {
    // Fetch user with password
    const result = await pool.query<IUser & { password: string }>(authQueries.user.findByEmail, [dto.email]);

    const dbUser = result.rows[0];
    if (!dbUser) {
        throw new ApiError("Invalid email or password.", 401);
    }

    // Separate password from user object before returning
    const { password, ...user } = dbUser;

    const isValid = await comparePassword(dto.password, password);
    if (!isValid) {
        throw new ApiError("Invalid email or password.", 401);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Create session entry in database
    await pool.query(authQueries.session.create, [user.id, refreshToken]);

    return { user, accessToken, refreshToken };
};

/*
 * Validates existing refresh token and issues a new access token.
 */
const tokenRefresh = async (dto: TokenRefreshDto): Promise<TokenRefreshResponse> => {
    // Verify JWT payload
    let decoded: { id: string };
    try {
        decoded = verifyRefreshToken(dto.refreshToken) as { id: string };
    } catch (error) {
        throw new ApiError("Invalid or expired refresh token. Please log in again.", 401);
    }

    // Check if session exists in DB
    const result = await pool.query<ISession>(authQueries.session.getByToken, [dto.refreshToken]);
    const session = result.rows[0];
    if (!session) {
        throw new ApiError("Invalid refresh token. Please log in again.", 401);
    }

    const newAccessToken = generateAccessToken(decoded.id);

    return { accessToken: newAccessToken };
};

/**
 * Revokes a session by deleting the refresh token from the database.
 */
const userLogout = async (dto: LogoutDto): Promise<boolean> => {
    await pool.query(authQueries.session.deleteByToken, [dto.refreshToken]);
    return true;
};

/**
 * Generates a 6-digit OTP code for password reset and sends it via email.
 */
const sendResetEmail = async (dto: SendResetEmailDto): Promise<boolean> => {
    const result = await pool.query<Pick<IUser, "id">>(authQueries.user.findIdByEmail, [dto.email]);
    const user = result.rows[0];

    if (!user) {
        throw new ApiError("No account was found registered with this email address.", 404);
    }

    // Generate 6-digit numeric OTP code (cryptographically secure)
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(authQueries.token.setByEmail, [otpCode, otpExpires, dto.email]);

    await sendPasswordResetEmail(dto.email, otpCode);

    return true;
};

/**
 * Verifies OTP code and provides a single-use secure reset ticket for password modification.
 */
const verifyCode = async (dto: VerifyCodeDto): Promise<VerifyCodeResponse> => {
    const result = await pool.query<Pick<IUser, "id">>(authQueries.token.verify, [dto.email, dto.code]);
    const user = result.rows[0];

    if (!user) {
        throw new ApiError("Invalid or expired verification code.", 401);
    }

    // Generate secure random ticket for resetting password
    const ticket = crypto.randomBytes(32).toString("hex");
    const ticketExpires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(authQueries.token.setById, [ticket, ticketExpires, user.id]);

    return { ticket };
};

/**
 * Resets user password using valid ticket and revokes all active sessions for security.
 */
const updatePassword = async (dto: UpdatePasswordDto): Promise<boolean> => {
    const result = await pool.query<Pick<IUser, "id">>(authQueries.user.findByTicket, [dto.ticket]);
    const user = result.rows[0];

    if (!user) {
        throw new ApiError("Invalid session. Please restart the process.", 401);
    }

    const hashedNewPassword = await hashPassword(dto.newPassword);

    // Update password & invalidate reset token
    await pool.query(authQueries.user.updatePassword, [hashedNewPassword, user.id]);

    // Revoke all active sessions for safety after password change
    await pool.query(authQueries.session.deleteByUserId, [user.id]);

    return true;
};

export { createUser, loginUser, tokenRefresh, userLogout, sendResetEmail, verifyCode, updatePassword };
