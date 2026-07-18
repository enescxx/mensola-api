import request from "supertest";
import app from "../src/app";
import pool from "../src/config/db";

describe("User endpoints", () => {
    describe("GET /api/users/me", () => {
        let token = "";

        const testUser = {
            email: "test_user2@mensola.com",
            username: "testuser123",
            password: "password123"
        };

        beforeAll(async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            token = response.body.data.accessToken;
        });

        it("should return user's profile successfully (200)", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", `Bearer ${token}`);

            const profile = response.body.data?.profile;

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(profile).toHaveProperty("id");
            expect(profile).toHaveProperty("username");
            expect(profile).toHaveProperty("fullname");
            expect(profile).toHaveProperty("bio");

            expect(typeof profile.movieListCount).toBe("number");
            expect(typeof profile.playlistCount).toBe("number");
            expect(typeof profile.watchlistMoviesCount).toBe("number");
            expect(typeof profile.watchedMoviesCount).toBe("number");
            expect(typeof profile.likedMoviesCount).toBe("number");
            expect(typeof profile.likedTracksCount).toBe("number");
            expect(typeof profile.likedPlaylistsCount).toBe("number");
            expect(typeof profile.likedMovieListsCount).toBe("number");
            expect(typeof profile.likedAlbumsCount).toBe("number");
            expect(typeof profile.followerCount).toBe("number");
            expect(typeof profile.followingCount).toBe("number");

            expect(Array.isArray(profile.favoriteMovies)).toBe(true);
            expect(Array.isArray(profile.favoriteTracks)).toBe(true);
        });

        it("should fail to return profile data with invalid access token (400)", async () => {
            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(
                /Invalid or expired token/i
            );
        });
    });
});
