import request from "supertest";
import app from "../src/app";
import pool from "../src/config/db";

describe("User endpoints", () => {
    let token = "";

    const testUser = {
        email: "test_user@mensola.com",
        username: "testuser123",
        password: "password123"
    };

    beforeAll(async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        token = response.body.data.accessToken;
    });

    describe("GET /api/users/me", () => {
        it("should return authenticated user's own profile successfully and remove irrelevant relational fields (200)", async () => {
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

        it(" fail with 403 Unauthorized when an invalid or expired access token is provided (403)", async () => {
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

    describe("GET /api/users/:userId", () => {
        let targetUserId = "";

        const targetUser = {
            email: "target_user@mensola.com",
            username: "targetuser",
            password: "password123"
        };

        beforeAll(async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(targetUser);

            targetUserId = response.body.data.user.id;
        });

        it("should return user profile with mutual followers and follow status for authenticated user (200)", async () => {
            const response = await request(app)
                .get(`/api/users/${targetUserId}`)
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

            expect(typeof profile.isFollowingByMe).toBe("boolean");
            expect(Array.isArray(profile.mutualFollowers)).toBe(true);

            expect(Array.isArray(profile.favoriteMovies)).toBe(true);
            expect(Array.isArray(profile.favoriteTracks)).toBe(true);
        });

        it("should return user profile without mutual followers and follow status for guest user (200)", async () => {
            const response = await request(app).get(
                `/api/users/${targetUserId}`
            );

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

        it("should return 403 error if token is sent but invalid or expired (403)", async () => {
            const response = await request(app)
                .get(`/api/users/${targetUserId}`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(
                /Invalid or expired token/i
            );
        });
    });

    describe("PUT /api/users/me", () => {
        it("should update profile fields successfully and return only updated basic user data (200)", async () => {
            const updateData = {
                fullname: "Updated John Doe",
                bio: "This is my updated biography.",
                avatar: "https://example.com/avatar.jpg"
            };

            const response = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${token}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(
                /Profile updated successfully/i
            );

            const updatedUser = response.body.data?.user;

            expect(updatedUser).toHaveProperty("id");
            expect(updatedUser).toHaveProperty("username");
            expect(updatedUser.fullname).toBe(updateData.fullname);
            expect(updatedUser.bio).toBe(updateData.bio);
            expect(updatedUser.avatar).toBe(updateData.avatar);
        });

        it("should return a clean message without making changes if request body is empty (200)", async () => {
            const response = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/No changes performed/i);
            expect(response.body.data).toBeNull();
        });

        it("should fail with 403 Unauthorized when attempting to update profile without a valid token (403)", async () => {
            const response = await request(app)
                .put("/api/users/me")
                .set("Authorization", "Bearer invalid-token")
                .send({ fullname: "John Doe" });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(
                /Invalid or expired token/i
            );
        });
    });
});
