import request from "supertest";
import app from "@/app";

import { IUser } from "@/types/user";
import { createTestUser } from "./helpers/auth.helper";
import { createTestPlaylist } from "./helpers/db.helper";
import { IPlaylist } from "@/types/music.types";

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
            testUserAPlaylist2 = await createTestPlaylist(testUserA.id, { title: "User A Playlist 2", isPrivate: true });

            testUserBPrivatePlaylist = await createTestPlaylist(testUserB.id, { title: "User B Private Playlist", isPrivate: true });
            testUserBPublicPlaylist = await createTestPlaylist(testUserB.id, { title: "User B Public Playlist", isPrivate: false });
        });

        it("should return the current user's playlists including private ones when no userId is provided", async () => {
            const response = await request(app)
                .get("/api/playlists")
                .set("Authorization", `Bearer ${testUserAToken}`);

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
            const response = await request(app)
                .get(`/api/playlists?userId=${testUserA.id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe("User A Playlist 1");
        });

        it("should return 400 if userId is invalid format", async () => {
            const response = await request(app)
                .get("/api/playlists?userId=invalid-uuid");

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
    });
});
