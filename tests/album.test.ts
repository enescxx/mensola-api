import request from "supertest";
import app from "@/app";

import { IUser } from "@/types/user";
import { createTestUser } from "./helpers/auth.helper";
import { createTestAlbum, createTestInteraction } from "./helpers/db.helper";
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
});
