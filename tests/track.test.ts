import request from "supertest";
import app from "@/app";
import pool from "@/config/db";

import { IUser } from "@/types/user";
import { createTestUser } from "./helpers/auth.helper";
import { createTestTrack, createTestArtist, createTestTrackArtist, createTestInteraction } from "./helpers/db.helper";
import { ITrack } from "@/types/music.types";

describe("Track API", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & { password: string };
    let testUserAToken: string;
    let testUserB: Pick<IUser, "id" | "email" | "username"> & { password: string };
    let testUserBToken: string;

    beforeEach(async () => {
        ({ user: testUserA, token: testUserAToken } = await createTestUser());
        ({ user: testUserB, token: testUserBToken } = await createTestUser());
    });

    describe("GET /api/tracks/likes", () => {
        let testTrack1: ITrack;
        let testTrack2: ITrack;
        let testTrack3: ITrack;

        beforeEach(async () => {
            // Create tracks
            testTrack1 = await createTestTrack({ title: "Track 1" });
            testTrack2 = await createTestTrack({ title: "Track 2" });
            testTrack3 = await createTestTrack({ title: "Track 3" });

            // Create artists
            const artist1 = await createTestArtist({ name: "Artist 1" });
            const artist2 = await createTestArtist({ name: "Artist 2" });

            // Associate artists with tracks
            await createTestTrackArtist(testTrack1.id, artist1.id);
            await createTestTrackArtist(testTrack2.id, artist2.id);
            // track3 has no artists

            // User A likes track 1 and track 2
            await createTestInteraction(testUserA.id, testTrack1.id, { isLiked: true, targetType: "track" });
            await createTestInteraction(testUserA.id, testTrack2.id, { isLiked: true, targetType: "track" });

            // User B likes track 3
            await createTestInteraction(testUserB.id, testTrack3.id, { isLiked: true, targetType: "track" });
        });

        it("should return the current user's liked tracks when no userId is provided", async () => {
            const response = await request(app)
                .get("/api/tracks/likes")
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(2);
            expect(response.body.data.totalItems).toBe(2);
            
            const titles = response.body.data.items.map((t: any) => t.title);
            expect(titles).toContain("Track 1");
            expect(titles).toContain("Track 2");

            // Verify artists array exists and has correct data
            const track1Res = response.body.data.items.find((t: any) => t.title === "Track 1");
            expect(track1Res.artists).toBeDefined();
            expect(track1Res.artists[0].name).toBe("Artist 1");
        });

        it("should return another user's liked tracks when userId is provided", async () => {
            const response = await request(app)
                .get(`/api/tracks/likes?userId=${testUserB.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("Track 3");
            
            // track 3 has no artists, so it should be an empty array
            expect(response.body.data.items[0].artists).toEqual([]);
        });

        it("should return 400 if userId is invalid format", async () => {
            const response = await request(app)
                .get("/api/tracks/likes?userId=invalid-uuid");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it("should paginate the results correctly", async () => {
            const response = await request(app)
                .get("/api/tracks/likes?limit=1")
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.page).toBe(1);
            expect(response.body.data.limit).toBe(1);
            expect(response.body.data.totalItems).toBe(1);
        });
    });

    describe("GET /api/tracks/:trackId", () => {
        let testTrack: ITrack;

        beforeEach(async () => {
            testTrack = await createTestTrack({ title: "Test Details Track" });
            const artist = await createTestArtist({ name: "Detail Artist" });
            await createTestTrackArtist(testTrack.id, artist.id);

            // Add some interactions
            await createTestInteraction(testUserA.id, testTrack.id, { isLiked: true, targetType: "track" });
        });

        it("should return track details including artist and counts", async () => {
            const response = await request(app).get(`/api/tracks/${testTrack.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testTrack.id);
            expect(response.body.data.title).toBe("Test Details Track");
            expect(response.body.data.artists).toHaveLength(1);
            expect(response.body.data.artists[0].name).toBe("Detail Artist");
            expect(response.body.data.likesCount).toBe(1);
            expect(response.body.data.commentsCount).toBe(0);
        });

        it("should return current user interactions if token is provided", async () => {
            const response = await request(app)
                .get(`/api/tracks/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isLiked).toBe(true);
            expect(response.body.data.currentUserInteraction).toBeDefined();
            expect(response.body.data.currentUserInteraction.isLiked).toBe(true);
        });

        it("should return 404 if track does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app).get(`/api/tracks/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/tracks/:trackId/like", () => {
        let testTrack: ITrack;

        beforeEach(async () => {
            testTrack = await createTestTrack({ title: "Like Track" });
        });

        it("should allow a user to like a track", async () => {
            const response = await request(app)
                .post(`/api/tracks/${testTrack.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isLiked).toBe(true);
        });

        it("should return 401 if unauthenticated", async () => {
            const response = await request(app).post(`/api/tracks/${testTrack.id}/like`);
            expect(response.status).toBe(401);
        });

        it("should return 404 if track does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/tracks/${fakeId}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/tracks/:trackId/like", () => {
        let testTrack: ITrack;

        beforeEach(async () => {
            testTrack = await createTestTrack({ title: "Unlike Track" });
            await createTestInteraction(testUserA.id, testTrack.id, { isLiked: true, targetType: "track" });
        });

        it("should allow a user to unlike a track", async () => {
            const response = await request(app)
                .delete(`/api/tracks/${testTrack.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isLiked).toBe(false);
        });

        it("should return 401 if unauthenticated", async () => {
            const response = await request(app).delete(`/api/tracks/${testTrack.id}/like`);
            expect(response.status).toBe(401);
        });

        it("should handle unliking a track that isn't liked", async () => {
            const response = await request(app)
                .delete(`/api/tracks/${testTrack.id}/like`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isLiked).toBe(false);
        });
    });

    describe("GET /api/tracks/:trackId/interactions", () => {
        let testTrack: ITrack;

        beforeEach(async () => {
            testTrack = await createTestTrack({ title: "Interactions Track" });

            // User A adds a rating and a comment
            const intA = await createTestInteraction(testUserA.id, testTrack.id, { rating: 4, targetType: "track" });
            await pool.query(
                `INSERT INTO "Comment" (id, "userId", "interactionId", "content", "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
                [testUserA.id, intA.id, "Great track!"]
            );

            // User B adds a comment
            const intB = await createTestInteraction(testUserB.id, testTrack.id, { isLiked: true, targetType: "track" });
            await pool.query(
                `INSERT INTO "Comment" (id, "userId", "interactionId", "content", "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW() - interval '1 hour')`,
                [testUserB.id, intB.id, "Awesome!"]
            );
        });

        it("should return a list of interactions with comments for a track", async () => {
            const response = await request(app).get(`/api/tracks/${testTrack.id}/interactions`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(2);
            
            // Should be ordered by createdAt DESC by default in the query
            expect(response.body.data.items[0].user.id).toBe(testUserA.id);
            expect(response.body.data.items[0].comment.content).toBe("Great track!");
            expect(response.body.data.items[0].rating).toBe(4);

            expect(response.body.data.items[1].user.id).toBe(testUserB.id);
            expect(response.body.data.items[1].comment.content).toBe("Awesome!");
            expect(response.body.data.items[1].isLiked).toBe(true);
        });

        it("should return empty items array for a track with no interactions", async () => {
            const emptyTrack = await createTestTrack({ title: "Empty Interactions Track" });
            const response = await request(app).get(`/api/tracks/${emptyTrack.id}/interactions`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toEqual([]);
        });
    });

    describe("POST /api/tracks/:trackId/interactions", () => {
        let testTrack: ITrack;

        beforeEach(async () => {
            testTrack = await createTestTrack({ title: "Post Interaction Track" });
        });

        it("should create a new interaction with rating and comment", async () => {
            const response = await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 5,
                    comment: "Amazing track!",
                    isLiked: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.rating).toBe(5);
            expect(response.body.data.isLiked).toBe(true);
            expect(response.body.data.comment.content).toBe("Amazing track!");
        });

        it("should update an existing interaction", async () => {
            // First create an interaction
            await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 4,
                    comment: "Good track",
                });

            // Update the interaction
            const updateResponse = await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 5,
                    comment: "Changed my mind, amazing track!",
                    isLiked: true,
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.success).toBe(true);
            expect(updateResponse.body.data.rating).toBe(5);
            expect(updateResponse.body.data.isLiked).toBe(true);
            expect(updateResponse.body.data.comment.content).toBe("Changed my mind, amazing track!");
        });

        it("should delete comment when passing empty string", async () => {
            // First create an interaction with comment
            await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 4,
                    comment: "Good track",
                });

            // Update with empty comment
            const updateResponse = await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 4,
                    comment: "",
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.success).toBe(true);
            expect(updateResponse.body.data.rating).toBe(4);
            expect(updateResponse.body.data.comment).toBeNull();
        });

        it("should clean up empty interaction when removing all values", async () => {
            // First create an interaction
            const createRes = await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 4,
                    comment: "Good track",
                });
            
            const interactionId = createRes.body.data.id;

            // Remove rating and comment
            const updateResponse = await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: null,
                    comment: "",
                    isLiked: false,
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.success).toBe(true);

            // Verify it was deleted from db
            const checkDb = await pool.query(`SELECT id FROM "Interaction" WHERE id = $1`, [interactionId]);
            expect(checkDb.rows.length).toBe(0);
        });

        it("should return 401 if unauthenticated", async () => {
            const response = await request(app)
                .post(`/api/tracks/${testTrack.id}/interactions`)
                .send({ rating: 5 });
            
            expect(response.status).toBe(401);
        });

        it("should return 404 if track does not exist", async () => {
            const fakeId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/tracks/${fakeId}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({ rating: 5 });
            
            expect(response.status).toBe(404);
        });
    });
});
