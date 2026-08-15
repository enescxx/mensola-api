import request from "supertest";
import app from "@/app";

import { IUser } from "@/types/user";
import { createTestUser } from "./helpers/auth.helper";
import { createTestAlbum, createTestInteraction, createTestTrack } from "./helpers/db.helper";
import { IAlbum } from "@/types/music.types";

describe("Album API", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & { password: string };
    let testUserAToken: string;
    let testUserB: Pick<IUser, "id" | "email" | "username"> & { password: string };

    beforeEach(async () => {
        ({ user: testUserA, token: testUserAToken } = await createTestUser());
        ({ user: testUserB } = await createTestUser());
    });

    describe("GET /api/albums/likes", () => {
        let album1: IAlbum;
        let album2: IAlbum;

        beforeEach(async () => {
            album1 = await createTestAlbum({ title: "Album 1" });
            album2 = await createTestAlbum({ title: "Album 2" });

            // User A likes Album 1
            await createTestInteraction(testUserA.id, album1.id, { targetType: "album", isLiked: true });
            
            // User B likes Album 2
            await createTestInteraction(testUserB.id, album2.id, { targetType: "album", isLiked: true });
        });

        it("should return the albums liked by the current user", async () => {
            const response = await request(app)
                .get("/api/albums/likes")
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("Album 1");
            expect(response.body.data.items[0].isLiked).toBe(true);
        });

        it("should return liked albums of another user", async () => {
            const response = await request(app)
                .get(`/api/albums/likes?userId=${testUserB.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("Album 2");
            expect(response.body.data.items[0].isLiked).toBe(true);
        });

        it("should return empty array if the user hasn't liked any albums", async () => {
            // User A liking Album 1 is already handled. Let's test a new user.
            const { user: testUserC } = await createTestUser();
            
            const response = await request(app)
                .get(`/api/albums/likes?userId=${testUserC.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(0);
        });
    });

    describe("GET /api/albums/:albumId", () => {
        let testAlbum: IAlbum;

        beforeEach(async () => {
            testAlbum = await createTestAlbum({ title: "Test Album 101", songCount: 12 });
            await createTestInteraction(testUserA.id, testAlbum.id, {
                targetType: "album",
                isLiked: true,
                rating: 9,
                comment: "Great album!",
            });
        });

        it("should return album details with user interaction context", async () => {
            const response = await request(app)
                .get(`/api/albums/${testAlbum.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testAlbum.id);
            expect(response.body.data.title).toBe("Test Album 101");
            expect(response.body.data.isLiked).toBe(true);
            expect(response.body.data.likesCount).toBe(1);
            expect(response.body.data.commentsCount).toBe(1);
            expect(response.body.data.interactions).toHaveLength(1);
            expect(response.body.data.interactions[0].comment.content).toBe("Great album!");
            expect(response.body.data.currentUserInteraction).toBeDefined();
        });

        it("should return 404 for non-existent album ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app).get(`/api/albums/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 for invalid album ID format", async () => {
            const response = await request(app).get("/api/albums/invalid-id");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/albums/:albumId/tracks", () => {
        let testAlbum: IAlbum;
        let track1: any;
        let track2: any;

        beforeEach(async () => {
            testAlbum = await createTestAlbum({ title: "Tracked Album" });
            track1 = await createTestTrack({ title: "Song 1", albumId: testAlbum.id });
            track2 = await createTestTrack({ title: "Song 2", albumId: testAlbum.id });
        });

        it("should return tracks belonging to the album", async () => {
            const response = await request(app)
                .get(`/api/albums/${testAlbum.id}/tracks`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(2);
            expect(response.body.data.items[0].title).toBe("Song 1");
            expect(response.body.data.items[1].title).toBe("Song 2");
        });

        it("should return 404 for non-existent album ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app).get(`/api/albums/${nonExistentId}/tracks`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 for invalid album ID format", async () => {
            const response = await request(app).get("/api/albums/invalid-id/tracks");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/albums/:albumId/like", () => {
        let testAlbum: IAlbum;

        beforeEach(async () => {
            testAlbum = await createTestAlbum({ title: "Album To Like" });
        });

        it("should like an album successfully", async () => {
            const response = await request(app)
                .post(`/api/albums/${testAlbum.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.albumId).toBe(testAlbum.id);
            expect(response.body.data.isLiked).toBe(true);
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app).post(`/api/albums/${testAlbum.id}/like`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent album ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/albums/${nonExistentId}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe("DELETE /api/albums/:albumId/like", () => {
        let testAlbum: IAlbum;

        beforeEach(async () => {
            testAlbum = await createTestAlbum({ title: "Album To Unlike" });
            await createTestInteraction(testUserA.id, testAlbum.id, { targetType: "album", isLiked: true });
        });

        it("should unlike an album successfully", async () => {
            const response = await request(app)
                .delete(`/api/albums/${testAlbum.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.albumId).toBe(testAlbum.id);
            expect(response.body.data.isLiked).toBe(false);
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app).delete(`/api/albums/${testAlbum.id}/like`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent album ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .delete(`/api/albums/${nonExistentId}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/albums/:albumId/interactions", () => {
        let testAlbum: IAlbum;

        beforeEach(async () => {
            testAlbum = await createTestAlbum({ title: "Album With Interactions" });
            await createTestInteraction(testUserA.id, testAlbum.id, {
                targetType: "album",
                rating: 10,
                comment: "Epic album!",
                isLiked: true,
            });
        });

        it("should return interactions with comments for an album", async () => {
            const response = await request(app).get(`/api/albums/${testAlbum.id}/interactions`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].comment.content).toBe("Epic album!");
            expect(response.body.data.items[0].rating).toBe("10.0");
        });

        it("should return 400 for invalid album ID format", async () => {
            const response = await request(app).get("/api/albums/invalid-id/interactions");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/albums/:albumId/interactions", () => {
        let testAlbum: IAlbum;

        beforeEach(async () => {
            testAlbum = await createTestAlbum({ title: "Album To Post Interaction" });
        });

        it("should create a new interaction (rating, comment, isLiked) for an album", async () => {
            const response = await request(app)
                .post(`/api/albums/${testAlbum.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 9,
                    comment: "Harika albüm!",
                    isLiked: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.albumId).toBe(testAlbum.id);
            expect(response.body.data.rating).toBe("9.0");
            expect(response.body.data.isLiked).toBe(true);
            expect(response.body.data.comment.content).toBe("Harika albüm!");
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app)
                .post(`/api/albums/${testAlbum.id}/interactions`)
                .send({ comment: "Unauthorized comment" });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent album ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/albums/${nonExistentId}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({ comment: "Test comment" });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
