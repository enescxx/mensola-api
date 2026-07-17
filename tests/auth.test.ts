import request from "supertest";
import app from "../src/index";
import pool from "../src/config/db";

jest.mock("../src/utils/email", () => ({
    sendPasswordResetEmail: jest.fn()
}));

describe("Auth Endpoints", () => {
    let testRefreshToken = "";
    let resetTicket = "";
    let otpCode = "";

    const testUser = {
        email: "test_user@mensola.com",
        username: "testuser123",
        password: "password123"
    };

    const newPassword = "newpassword456";

    beforeAll(async () => {
        await pool.query('DELETE FROM "User" WHERE email = $1', [
            testUser.email
        ]);
    });

    afterAll(async () => {
        await pool.end();
    });

    describe("1. POST /api/auth/register", () => {
        it("Should successfully register a new user (201)", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("accessToken");
            expect(response.body.data.user).toHaveProperty(
                "email",
                testUser.email
            );
        });

        it("Should not allow registration with an existing email (400)", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/already in use/i);
        });
    });

    describe("2. POST /api/auth/login", () => {
        it("Should login successfully with correct credentials (200)", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: testUser.email,
                password: testUser.password
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("accessToken");
            expect(response.body.data).toHaveProperty("refreshToken");

            testRefreshToken = response.body.data.refreshToken;
        });

        it("Should fail to login with an incorrect password (401)", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: testUser.email,
                password: "wrongpassword"
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/Invalid email or password/i);
        });
    });

    describe("3. POST /api/auth/refresh", () => {
        it("Should return a new access token with a valid refresh token (200)", async () => {
            const response = await request(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: testRefreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("accessToken");
        });

        it("Should reject an invalid refresh token (401)", async () => {
            const response = await request(app)
                .post("/api/auth/refresh")
                .send({ refreshToken: "invalid-token-123" });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("4. POST /api/auth/logout", () => {
        it("Should logout successfully with a valid refresh token (200)", async () => {
            const response = await request(app)
                .post("/api/auth/logout")
                .send({ refreshToken: testRefreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.message).toMatch(
                /log out is successful/i
            );
        });
    });

    describe("5. Password Reset Flow", () => {
        it("Step 1: Should generate a password reset code for a registered email (200)", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: testUser.email });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const dbResult = await pool.query(
                'SELECT "resetToken" FROM "User" WHERE email = $1',
                [testUser.email]
            );
            otpCode = dbResult.rows[0].resetToken;
            expect(otpCode).toBeDefined();
        });

        it("Step 2: Should return a secure ticket with a correct OTP code (200)", async () => {
            const response = await request(app)
                .post("/api/auth/verify-reset-code")
                .send({
                    email: testUser.email,
                    code: otpCode
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("ticket");

            resetTicket = response.body.data.ticket;
        });

        it("Step 3: Should successfully update the password with a valid ticket (200)", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    ticket: resetTicket,
                    newPassword: newPassword
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.message).toMatch(/successfully updated/i);
        });

        it("Step 4: Should login successfully with the new password (200)", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: testUser.email,
                password: newPassword
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
