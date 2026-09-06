import request from "supertest";
import app from "@/app";

jest.mock("@/utils/email", () => ({
    sendEmailChangeVerificationCode: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendBetaWaitlistEmail: jest.fn(),
}));

describe("Comment Reply Endpoints", () => {
    const validCommentId = "11111111-1111-1111-1111-111111111111";
    let authToken = "";

    beforeAll(async () => {
        const user = {
            email: "replytester@mensola.com",
            username: "replytester",
            password: "password123",
        };
        const res = await request(app).post("/v1/auth/register").send(user);
        if (res.body?.data?.accessToken) {
            authToken = res.body.data.accessToken;
        }
    });

    describe("POST /v1/comments/:commentId/replies", () => {
        it("should return 401 if user is not authenticated", async () => {
            const res = await request(app)
                .post(`/v1/comments/${validCommentId}/replies`)
                .send({ content: "This is a reply" });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if commentId is not a valid UUID", async () => {
            if (!authToken) return;

            const res = await request(app)
                .post("/v1/comments/invalid-uuid/replies")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ content: "This is a reply" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if content is missing or empty", async () => {
            if (!authToken) return;

            const res = await request(app)
                .post(`/v1/comments/${validCommentId}/replies`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ content: "   " });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 if the target comment does not exist", async () => {
            if (!authToken) return;

            const nonExistentCommentId = "99999999-9999-9999-9999-999999999999";
            const res = await request(app)
                .post(`/v1/comments/${nonExistentCommentId}/replies`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ content: "Valid reply content" });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /v1/comments/:commentId/like", () => {
        it("should return 401 if user is not authenticated", async () => {
            const res = await request(app)
                .post(`/v1/comments/${validCommentId}/like`);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 400 if commentId is not a valid UUID", async () => {
            if (!authToken) return;

            const res = await request(app)
                .post("/v1/comments/invalid-uuid/like")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should return 404 if the comment does not exist", async () => {
            if (!authToken) return;

            const nonExistentCommentId = "99999999-9999-9999-9999-999999999999";
            const res = await request(app)
                .post(`/v1/comments/${nonExistentCommentId}/like`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});

