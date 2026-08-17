import request from "supertest";
import app from "@/app";
import crypto from "crypto";

import { IUser } from "@/types/user.types";
import { createTestUser } from "../helpers/auth.helper";
import { createTestMovieList, createTestBookmark } from "../helpers/db.helper";

describe("Bookmark API", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & { password: string };
    let testUserAToken: string;
    let testListId: string;

    beforeEach(async () => {
        ({ user: testUserA, token: testUserAToken } = await createTestUser());
        const testList = await createTestMovieList(testUserA.id);
        testListId = testList.id;
    });

    /* ==========================================================================
       POST /v1/bookmarks/toggle
       ========================================================================== */
    describe("POST /v1/bookmarks/toggle", () => {
        it("should save movie list to bookmarks when not previously saved", async () => {
            const response = await request(app)
                .post("/v1/bookmarks/toggle")
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    targetId: testListId,
                    targetType: "movieList",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isSaved).toBe(true);
        });

        it("should remove movie list from bookmarks when already saved", async () => {
            await createTestBookmark(testUserA.id, testListId, "movieList");

            const response = await request(app)
                .post("/v1/bookmarks/toggle")
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    targetId: testListId,
                    targetType: "movieList",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isSaved).toBe(false);
        });

        it("should support toggling bookmarks for playlist and album target types", async () => {
            const mockPlaylistId = crypto.randomUUID();

            const response = await request(app)
                .post("/v1/bookmarks/toggle")
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    targetId: mockPlaylistId,
                    targetType: "playlist",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isSaved).toBe(true);
        });

        it("should return 401 when token is missing", async () => {
            const response = await request(app).post("/v1/bookmarks/toggle").send({
                targetId: testListId,
                targetType: "movieList",
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 when required fields are missing", async () => {
            const response = await request(app)
                .post("/v1/bookmarks/toggle")
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    targetType: "movieList",
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 when invalid targetType is provided", async () => {
            const response = await request(app)
                .post("/v1/bookmarks/toggle")
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    targetId: testListId,
                    targetType: "invalidType",
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    /* ==========================================================================
       GET /v1/bookmarks
       ========================================================================== */
    describe("GET /v1/bookmarks", () => {
        it("should return list of bookmarks for authenticated user", async () => {
            await createTestBookmark(testUserA.id, testListId, "movieList");

            const response = await request(app).get("/v1/bookmarks").set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].targetId).toBe(testListId);
            expect(response.body.data[0].targetType).toBe("movieList");
        });

        it("should filter bookmarks when targetType query parameter is provided", async () => {
            const playlistId = crypto.randomUUID();
            await createTestBookmark(testUserA.id, testListId, "movieList");
            await createTestBookmark(testUserA.id, playlistId, "playlist");

            const response = await request(app)
                .get("/v1/bookmarks?targetType=movieList")
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].targetType).toBe("movieList");
        });

        it("should return 401 when token is missing", async () => {
            const response = await request(app).get("/v1/bookmarks");

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
