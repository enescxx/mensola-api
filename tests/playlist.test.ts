import request from "supertest";
import app from "@/app";
import crypto from "crypto";

import { IUser } from "@/types/user";
import { createTestUser } from "./helpers/auth.helper";
import {
    createTestPlaylist,
    createTestInteraction,
    createTestTrack,
    createTestArtist,
    createTestTrackArtist,
    addTestTrackToPlaylist,
    createTestBookmark,
} from "./helpers/db.helper";
import { IPlaylist } from "@/types/music";

describe("Playlist API", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & { password: string };
    let testUserAToken: string;
    let testUserB: Pick<IUser, "id" | "email" | "username"> & { password: string };
    let testUserBToken: string;

    beforeEach(async () => {
        ({ user: testUserA, token: testUserAToken } = await createTestUser());
        ({ user: testUserB, token: testUserBToken } = await createTestUser());
    });

    describe("GET /api/playlists", () => {
        let testUserAPlaylist1: IPlaylist;
        let testUserAPlaylist2: IPlaylist;
        let testUserBPrivatePlaylist: IPlaylist;
        let testUserBPublicPlaylist: IPlaylist;

        beforeEach(async () => {
            testUserAPlaylist1 = await createTestPlaylist(testUserA.id, { title: "User A Playlist 1" });
            testUserAPlaylist2 = await createTestPlaylist(testUserA.id, {
                title: "User A Playlist 2",
                isPrivate: true,
            });

            testUserBPrivatePlaylist = await createTestPlaylist(testUserB.id, {
                title: "User B Private Playlist",
                isPrivate: true,
            });
            testUserBPublicPlaylist = await createTestPlaylist(testUserB.id, {
                title: "User B Public Playlist",
                isPrivate: false,
            });
        });

        it("should return the current user's playlists including private ones when no userId is provided", async () => {
            const response = await request(app).get("/api/playlists").set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(2);
            expect(response.body.data.totalItems).toBe(2);

            const titles = response.body.data.items.map((p: any) => p.title);
            expect(titles).toContain("User A Playlist 1");
            expect(titles).toContain("User A Playlist 2");
        });

        it("should return only public playlists when querying another user", async () => {
            const response = await request(app)
                .get(`/api/playlists?userId=${testUserB.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("User B Public Playlist");
        });

        it("should return only public playlists if no auth token is provided for another user", async () => {
            const response = await request(app).get(`/api/playlists?userId=${testUserA.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("User A Playlist 1");
        });

        it("should return 400 if userId is invalid format", async () => {
            const response = await request(app).get("/api/playlists?userId=invalid-uuid");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it("should paginate the results correctly", async () => {
            const response = await request(app)
                .get("/api/playlists?limit=1")
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.page).toBe(1);
            expect(response.body.data.limit).toBe(1);
            // Wait, testUserAToken has 2 playlists. limit=1 should return 1 item.
            expect(response.body.data.totalItems).toBe(1); // the query counts the fetched items (playlists.length)
        });

        it("should return containsTrack=true when trackId is provided and present in playlist", async () => {
            const track = await createTestTrack({ title: "Check Track" });
            await addTestTrackToPlaylist(testUserAPlaylist1.id, track.id, testUserA.id);

            const response = await request(app)
                .get(`/api/playlists?trackId=${track.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const pl1 = response.body.data.items.find((p: any) => p.id === testUserAPlaylist1.id);
            const pl2 = response.body.data.items.find((p: any) => p.id === testUserAPlaylist2.id);

            expect(pl1.containsTrack).toBe(true);
            expect(pl2.containsTrack).toBe(false);
        });
    });

    describe("GET /api/playlists/likes", () => {
        let testUserAPlaylist1: IPlaylist;
        let testUserBPublicPlaylist: IPlaylist;

        let testUserBPrivatePlaylist: IPlaylist;

        beforeEach(async () => {
            testUserAPlaylist1 = await createTestPlaylist(testUserA.id, { title: "User A Playlist 1" });
            testUserBPublicPlaylist = await createTestPlaylist(testUserB.id, {
                title: "User B Public Playlist",
                isPrivate: false,
            });
            testUserBPrivatePlaylist = await createTestPlaylist(testUserB.id, {
                title: "User B Private Playlist",
                isPrivate: true,
            });

            // User A likes B's public playlist
            await createTestInteraction(testUserA.id, testUserBPublicPlaylist.id, {
                targetType: "playlist",
                isLiked: true,
            });

            // User A likes B's private playlist (but shouldn't see it unless they are creator, which they aren't)
            await createTestInteraction(testUserA.id, testUserBPrivatePlaylist.id, {
                targetType: "playlist",
                isLiked: true,
            });
        });

        it("should return the public playlists liked by the current user", async () => {
            const response = await request(app)
                .get("/api/playlists/likes")
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // User A liked both, but only one is public
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("User B Public Playlist");
            expect(response.body.data.items[0].creator.username).toBe(testUserB.username);
        });

        it("should return public liked playlists of another user", async () => {
            const response = await request(app).get(`/api/playlists/likes?userId=${testUserA.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("User B Public Playlist");
        });
    });

    describe("GET /api/playlists/:playlistId/items", () => {
        let publicPlaylist: IPlaylist;
        let privatePlaylist: IPlaylist;
        let track1: any;
        let track2: any;
        let artist: any;

        beforeEach(async () => {
            publicPlaylist = await createTestPlaylist(testUserA.id, {
                title: "User A Public Playlist",
                isPrivate: false,
            });
            privatePlaylist = await createTestPlaylist(testUserA.id, {
                title: "User A Private Playlist",
                isPrivate: true,
            });

            track1 = await createTestTrack({ title: "Track 1", duration: 180 });
            track2 = await createTestTrack({ title: "Track 2", duration: 210 });

            artist = await createTestArtist({ name: "Artist 1" });
            await createTestTrackArtist(track1.id, artist.id);

            // Add tracks to public playlist
            await addTestTrackToPlaylist(publicPlaylist.id, track1.id, testUserA.id);
            await addTestTrackToPlaylist(publicPlaylist.id, track2.id, testUserA.id);

            // Add track1 to private playlist
            await addTestTrackToPlaylist(privatePlaylist.id, track1.id, testUserA.id);

            // User B likes track1
            await createTestInteraction(testUserB.id, track1.id, { targetType: "track", isLiked: true });
        });

        it("should return items of a public playlist", async () => {
            const response = await request(app).get(`/api/playlists/${publicPlaylist.id}/items`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(2);

            const fetchedTrack1 = response.body.data.items.find((item: any) => item.id === track1.id);
            expect(fetchedTrack1).toBeDefined();
            expect(fetchedTrack1.title).toBe("Track 1");
            expect(fetchedTrack1.artists).toEqual([{ id: artist.id, name: "Artist 1" }]);
            expect(fetchedTrack1.isLiked).toBe(false);
        });

        it("should correctly populate isLiked when authenticated user has liked a track", async () => {
            const response = await request(app)
                .get(`/api/playlists/${publicPlaylist.id}/items`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const fetchedTrack1 = response.body.data.items.find((item: any) => item.id === track1.id);
            const fetchedTrack2 = response.body.data.items.find((item: any) => item.id === track2.id);

            expect(fetchedTrack1.isLiked).toBe(true);
            expect(fetchedTrack2.isLiked).toBe(false);
        });

        it("should allow playlist owner to view items of their private playlist", async () => {
            const response = await request(app)
                .get(`/api/playlists/${privatePlaylist.id}/items`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].id).toBe(track1.id);
        });

        it("should return 404 when non-owner tries to view items of a private playlist", async () => {
            const response = await request(app)
                .get(`/api/playlists/${privatePlaylist.id}/items`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return empty array for playlist with no items", async () => {
            const emptyPlaylist = await createTestPlaylist(testUserA.id, { title: "Empty Playlist" });

            const response = await request(app).get(`/api/playlists/${emptyPlaylist.id}/items`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(0);
            expect(response.body.data.totalItems).toBe(0);
        });

        it("should paginate playlist items correctly", async () => {
            const response = await request(app).get(`/api/playlists/${publicPlaylist.id}/items?limit=1&page=1`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.hasMore).toBe(true);
        });

        it("should return 404 for non-existent playlist ID", async () => {
            const fakeId = crypto.randomUUID();
            const response = await request(app).get(`/api/playlists/${fakeId}/items`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 for invalid playlist ID format", async () => {
            const response = await request(app).get("/api/playlists/invalid-uuid/items");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/playlists/:playlistId", () => {
        let publicPlaylist: IPlaylist;
        let privatePlaylist: IPlaylist;
        let track1: any;

        beforeEach(async () => {
            publicPlaylist = await createTestPlaylist(testUserA.id, {
                title: "User A Public Playlist",
                isPrivate: false,
            });
            privatePlaylist = await createTestPlaylist(testUserA.id, {
                title: "User A Private Playlist",
                isPrivate: true,
            });

            track1 = await createTestTrack({ title: "Track 1" });
            await addTestTrackToPlaylist(publicPlaylist.id, track1.id, testUserA.id);

            // User B likes public playlist and saves/bookmarks it
            await createTestInteraction(testUserB.id, publicPlaylist.id, { targetType: "playlist", isLiked: true });
            await createTestBookmark(testUserB.id, publicPlaylist.id, "playlist");
        });

        it("should return details of a public playlist with user interaction context", async () => {
            const response = await request(app)
                .get(`/api/playlists/${publicPlaylist.id}`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(publicPlaylist.id);
            expect(response.body.data.title).toBe("User A Public Playlist");
            expect(response.body.data.songCount).toBe(1);
            expect(response.body.data.creator.id).toBe(testUserA.id);
            expect(response.body.data.creator.username).toBe(testUserA.username);
            expect(response.body.data.isLiked).toBe(true);
            expect(response.body.data.likesCount).toBe(1);
            expect(response.body.data.isSaved).toBe(true);
            expect(response.body.data.savesCount).toBe(1);
        });

        it("should allow creator to view details of their private playlist", async () => {
            const response = await request(app)
                .get(`/api/playlists/${privatePlaylist.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(privatePlaylist.id);
        });

        it("should return 404 when non-owner tries to view details of a private playlist", async () => {
            const response = await request(app)
                .get(`/api/playlists/${privatePlaylist.id}`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent playlist ID", async () => {
            const fakeId = crypto.randomUUID();
            const response = await request(app).get(`/api/playlists/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 for invalid playlist ID format", async () => {
            const response = await request(app).get("/api/playlists/invalid-uuid");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/playlists/:playlistId/interactions", () => {
        let publicPlaylist: IPlaylist;

        beforeEach(async () => {
            publicPlaylist = await createTestPlaylist(testUserA.id, {
                title: "Playlist With Comments",
                isPrivate: false,
            });
        });

        it("should return interactions with comments for a playlist", async () => {
            await createTestInteraction(testUserA.id, publicPlaylist.id, {
                targetType: "playlist",
                rating: 8,
                comment: "Harika playlist!",
                isLiked: true,
            });

            const response = await request(app)
                .get(`/api/playlists/${publicPlaylist.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const items = response.body.data.items;
            expect(Array.isArray(items)).toBe(true);
            expect(items).toHaveLength(1);
            expect(items[0].comment.content).toBe("Harika playlist!");
            expect(items[0].rating).toBe("8.0");
            expect(items[0].isLiked).toBe(true);
            expect(items[0].user.id).toBe(testUserA.id);
            expect(items[0].user.username).toBe(testUserA.username);
            expect(items[0].likeCount).toBe(0);
            expect(items[0].replyCount).toBe(0);
        });

        it("should return empty array when playlist has no comment interactions", async () => {
            // Like without comment should not appear
            await createTestInteraction(testUserA.id, publicPlaylist.id, {
                targetType: "playlist",
                isLiked: true,
            });

            const response = await request(app).get(`/api/playlists/${publicPlaylist.id}/interactions`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(0);
        });

        it("should return multiple interactions ordered by comment date descending", async () => {
            await createTestInteraction(testUserA.id, publicPlaylist.id, {
                targetType: "playlist",
                comment: "First comment",
            });
            await createTestInteraction(testUserB.id, publicPlaylist.id, {
                targetType: "playlist",
                comment: "Second comment",
            });

            const response = await request(app).get(`/api/playlists/${publicPlaylist.id}/interactions`);

            expect(response.status).toBe(200);
            const items = response.body.data.items;
            expect(items).toHaveLength(2);
            // Most recent comment should be first
            expect(items[0].comment.content).toBe("Second comment");
            expect(items[1].comment.content).toBe("First comment");
        });

        it("should paginate interactions correctly", async () => {
            await createTestInteraction(testUserA.id, publicPlaylist.id, {
                targetType: "playlist",
                comment: "Comment A",
            });
            await createTestInteraction(testUserB.id, publicPlaylist.id, {
                targetType: "playlist",
                comment: "Comment B",
            });

            const response = await request(app).get(
                `/api/playlists/${publicPlaylist.id}/interactions?limit=1&page=1`,
            );

            expect(response.status).toBe(200);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.hasMore).toBe(true);
        });

        it("should return 400 for invalid playlist ID format", async () => {
            const response = await request(app).get("/api/playlists/invalid-uuid/interactions");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/playlists/:playlistId/interactions", () => {
        let publicPlaylist: IPlaylist;

        beforeEach(async () => {
            publicPlaylist = await createTestPlaylist(testUserA.id, {
                title: "Playlist To Interact",
                isPrivate: false,
            });
        });

        it("should create a new interaction (rating, comment, isLiked) for a playlist", async () => {
            const response = await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 9,
                    comment: "Mükemmel liste!",
                    isLiked: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.playlistId).toBe(publicPlaylist.id);
            expect(response.body.data.rating).toBe("9.0");
            expect(response.body.data.isLiked).toBe(true);
            expect(response.body.data.comment.content).toBe("Mükemmel liste!");
        });

        it("should update an existing interaction on consecutive request", async () => {
            await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 7,
                    comment: "Eski yorum",
                    isLiked: false,
                });

            const updateResponse = await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    rating: 10,
                    comment: "Güncellenmiş yorum",
                    isLiked: true,
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.success).toBe(true);
            expect(updateResponse.body.data.rating).toBe("10.0");
            expect(updateResponse.body.data.isLiked).toBe(true);
            expect(updateResponse.body.data.comment.content).toBe("Güncellenmiş yorum");
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/interactions`)
                .send({
                    comment: "Unauthorized comment",
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent playlist ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/playlists/${nonExistentId}/interactions`)
                .set("Authorization", `Bearer ${testUserAToken}`)
                .send({
                    comment: "No playlist test",
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/playlists/:playlistId/like", () => {
        let publicPlaylist: IPlaylist;

        beforeEach(async () => {
            publicPlaylist = await createTestPlaylist(testUserA.id, {
                title: "Playlist To Like",
                isPrivate: false,
            });
        });

        it("should like a playlist successfully", async () => {
            const response = await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.playlistId).toBe(publicPlaylist.id);
            expect(response.body.data.isLiked).toBe(true);
        });

        it("should be idempotent when liking an already liked playlist", async () => {
            await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            const secondResponse = await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(secondResponse.status).toBe(200);
            expect(secondResponse.body.success).toBe(true);
            expect(secondResponse.body.data.isLiked).toBe(true);
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app).post(`/api/playlists/${publicPlaylist.id}/like`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent playlist ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/playlists/${nonExistentId}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe("DELETE /api/playlists/:playlistId/like", () => {
        let publicPlaylist: IPlaylist;

        beforeEach(async () => {
            publicPlaylist = await createTestPlaylist(testUserA.id, {
                title: "Playlist To Unlike",
                isPrivate: false,
            });
        });

        it("should unlike a liked playlist successfully", async () => {
            await request(app)
                .post(`/api/playlists/${publicPlaylist.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            const response = await request(app)
                .delete(`/api/playlists/${publicPlaylist.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.playlistId).toBe(publicPlaylist.id);
            expect(response.body.data.isLiked).toBe(false);
        });

        it("should succeed when unliking a playlist that was not previously liked", async () => {
            const response = await request(app)
                .delete(`/api/playlists/${publicPlaylist.id}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isLiked).toBe(false);
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app).delete(`/api/playlists/${publicPlaylist.id}/like`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent playlist ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .delete(`/api/playlists/${nonExistentId}/like`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe("POST /api/playlists/:playlistId/items/:trackId", () => {
        let testPlaylist: IPlaylist;
        let testTrack: any;

        beforeEach(async () => {
            testPlaylist = await createTestPlaylist(testUserA.id, {
                title: "Test Playlist",
                isPrivate: false,
            });
            testTrack = await createTestTrack({ title: "Test Track" });
        });

        it("should add a track to the playlist successfully", async () => {
            const response = await request(app)
                .post(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.playlistId).toBe(testPlaylist.id);
            expect(response.body.data.trackId).toBe(testTrack.id);
            expect(response.body.data.addedBy).toBe(testUserA.id);
        });

        it("should return 404 if track is already in the playlist", async () => {
            await request(app)
                .post(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            const response = await request(app)
                .post(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 if a user tries to add a track to another user's playlist without permission", async () => {
            const response = await request(app)
                .post(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 for non-existent playlist ID", async () => {
            const nonExistentId = "00000000-0000-0000-0000-000000000000";
            const response = await request(app)
                .post(`/api/playlists/${nonExistentId}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app)
                .post(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        
        it("should return 400 for invalid ID format", async () => {
            const response = await request(app)
                .post(`/api/playlists/invalid-id/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("DELETE /api/playlists/:playlistId/items/:trackId", () => {
        let testPlaylist: IPlaylist;
        let testTrack: any;

        beforeEach(async () => {
            testPlaylist = await createTestPlaylist(testUserA.id, {
                title: "Test Playlist",
                isPrivate: false,
            });
            testTrack = await createTestTrack({ title: "Test Track" });

            // Pre-add track to testPlaylist
            await addTestTrackToPlaylist(testPlaylist.id, testTrack.id, testUserA.id);
        });

        it("should remove a track from the playlist successfully", async () => {
            const response = await request(app)
                .delete(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify item is removed
            const itemsResponse = await request(app)
                .get(`/api/playlists/${testPlaylist.id}/items`)
                .set("Authorization", `Bearer ${testUserAToken}`);
            expect(itemsResponse.body.data.items).toHaveLength(0);
        });

        it("should return 404 if track is not in the playlist", async () => {
            const newTrack = await createTestTrack({ title: "Other Track" });
            const response = await request(app)
                .delete(`/api/playlists/${testPlaylist.id}/items/${newTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 404 if a user tries to remove a track from another user's playlist without permission", async () => {
            const response = await request(app)
                .delete(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserBToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it("should return 401 when unauthorized", async () => {
            const response = await request(app)
                .delete(`/api/playlists/${testPlaylist.id}/items/${testTrack.id}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("should return 400 for invalid ID format", async () => {
            const response = await request(app)
                .delete(`/api/playlists/invalid-id/items/${testTrack.id}`)
                .set("Authorization", `Bearer ${testUserAToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});


