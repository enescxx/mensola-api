import request from "supertest";

import app from "@/app";
import pool from "@/config/db";
import { MESSAGES } from "@/constants/messages";
import {
    CreateUserDto,
    CreateUserResponse,
    LoginUserResponse,
    TokenRefreshResponse,
    VerifyCodeResponse,
} from "@/types/auth.types";
import { ApiResponse } from "@/types/api";

/**
 * Mocking Utility Modules:
 * Intercepts the email utility to prevent sending actual emails during automated testing.
 */
jest.mock("@/utils/email", () => ({
    sendPasswordResetEmail: jest.fn(),
}));

/**
 * Authentication Endpoints Integration Test Suite
 *
 * Verifies end-to-end integration for registration, login, token refresh,
 * logout, and the password reset flow.
 */
describe("Auth Endpoints", () => {
    // State variables shared across test steps
    let testRefreshToken = "";
    let resetTicket = "";
    let otpCode = "";

    /**
     * Default test user payload for registration and authentication tests.
     * Typed with CreateUserDto to ensure compile-time validity.
     */
    const testUser: CreateUserDto = {
        email: "test_user@mensola.com",
        username: "testuser123",
        password: "password123",
    };

    const newPassword = "newpassword456";

    /* 
    ==========================================================================
                        1. USER REGISTRATION
    ==========================================================================
    */
    describe("1. POST /api/auth/register", () => {
        /**
         * Verifies that a new user can be registered successfully, returning a 201 status
         * and the generated access token along with user details.
         */
        it("Should successfully register a new user (201)", async () => {
            const response = await request(app).post("/api/auth/register").send(testUser);
            const body = response.body as ApiResponse<CreateUserResponse>;

            expect(response.status).toBe(201);
            expect(body.success).toBe(true);
            expect(body.data).toHaveProperty("accessToken");
            expect(body.data?.user).toHaveProperty("email", testUser.email);
        });

        /**
         * Ensures duplicate registration with an already registered email is rejected with 400 Bad Request.
         */
        it("Should not allow registration with an existing email (400)", async () => {
            const response = await request(app).post("/api/auth/register").send(testUser);
            const body = response.body as ApiResponse;

            expect(response.status).toBe(400);
            expect(body.success).toBe(false);
            expect(body.error?.message).toBe(MESSAGES.ERRORS.EMAIL_USERNAME_IN_USE);
        });
    });

    /*
    ==========================================================================
                        2. USER LOGIN
    ========================================================================== 
    */
    describe("2. POST /api/auth/login", () => {
        /**
         * Verifies successful login with valid credentials, storing the returned refresh token.
         */
        it("Should login successfully with correct credentials (200)", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: testUser.email,
                password: testUser.password,
            });
            const body = response.body as ApiResponse<LoginUserResponse>;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data).toHaveProperty("accessToken");
            expect(body.data).toHaveProperty("refreshToken");

            // Store refresh token for subsequent tests
            testRefreshToken = response.body.data.refreshToken;
        });

        /**
         * Verifies that authentication fails with incorrect password, returning 401 Unauthorized.
         */
        it("Should fail to login with an incorrect password (401)", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: testUser.email,
                password: "wrongpassword",
            });
            const body = response.body as ApiResponse;

            expect(response.status).toBe(401);
            expect(body.success).toBe(false);
            expect(body.error?.message).toBe(MESSAGES.ERRORS.INVALID_CREDENTIALS);
        });
    });

    /*
    ==========================================================================
                        3. TOKEN REFRESH
    ========================================================================== 
    */
    describe("3. POST /api/auth/refresh", () => {
        /**
         * Verifies that a new access token is issued when given a valid refresh token.
         */
        it("Should return a new access token with a valid refresh token (200)", async () => {
            const response = await request(app).post("/api/auth/refresh").send({ refreshToken: testRefreshToken });
            const body = response.body as ApiResponse<TokenRefreshResponse>;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data).toHaveProperty("accessToken");
        });

        /**
         * Verifies that an invalid refresh token is rejected with 401 Unauthorized.
         */
        it("Should reject an invalid refresh token (401)", async () => {
            const response = await request(app).post("/api/auth/refresh").send({ refreshToken: "invalid-token-123" });
            const body = response.body as ApiResponse;

            expect(response.status).toBe(401);
            expect(body.success).toBe(false);
        });
    });

    /* 
    ==========================================================================
                        4. USER LOGOUT
    ==========================================================================
    */
    describe("4. POST /api/auth/logout", () => {
        /**
         * Verifies that logging out revokes the session in the database.
         */
        it("Should logout successfully with a valid refresh token (200)", async () => {
            const response = await request(app).post("/api/auth/logout").send({ refreshToken: testRefreshToken });
            const body = response.body as ApiResponse;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.message).toBe(MESSAGES.SUCCESS.LOGOUT_SUCCESS);
        });
    });

    /* 
    ==========================================================================
                        5. PASSWORD RESET FLOW
    ==========================================================================
    */
    describe("5. Password Reset Flow", () => {
        /**
         * Step 1: Initiates password reset for a registered user and retrieves the generated OTP code from DB.
         */
        it("Step 1: Should generate a password reset code for a registered email (200)", async () => {
            const response = await request(app).post("/api/auth/forgot-password").send({ email: testUser.email });
            const body = response.body as ApiResponse;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);

            // Fetch generated reset token directly from database
            const dbResult = await pool.query('SELECT "resetToken" FROM "User" WHERE email = $1', [testUser.email]);
            otpCode = dbResult.rows[0].resetToken;
            expect(otpCode).toBeDefined();
        });

        /**
         * Step 2: Validates the OTP code and returns a single-use secure reset ticket.
         */
        it("Step 2: Should return a secure ticket with a correct OTP code (200)", async () => {
            const response = await request(app).post("/api/auth/verify-reset-code").send({
                email: testUser.email,
                code: otpCode,
            });
            const body = response.body as ApiResponse<VerifyCodeResponse>;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data).toHaveProperty("ticket");

            resetTicket = response.body.data.ticket;
        });

        /**
         * Step 3: Updates the password using the valid ticket and revokes existing sessions.
         */
        it("Step 3: Should successfully update the password with a valid ticket (200)", async () => {
            const response = await request(app).post("/api/auth/reset-password").send({
                ticket: resetTicket,
                newPassword: newPassword,
            });
            const body = response.body as ApiResponse;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.message).toBe(MESSAGES.SUCCESS.PASSWORD_UPDATED);
        });

        /**
         * Step 4: Verifies that the user can log in with the newly updated password.
         */
        it("Step 4: Should login successfully with the new password (200)", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: testUser.email,
                password: newPassword,
            });
            const body = response.body as ApiResponse;

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
        });
    });
});
