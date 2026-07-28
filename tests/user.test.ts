import request from "supertest";
import app from "../src/app";
import pool from "../src/config/db";

describe("User endpoints", () => {
    let userAToken = "";
    let userAId = "";

    const userA = {
        email: "userA@mensola.com",
        username: "usernameA",
        password: "password123"
    };

    let userBId = "";
    let userBToken = "";

    const userB = {
        email: "userB@mensola.com",
        username: "usernameB",
        password: "password123"
    };

    let userCId = "";
    let userCToken = "";

    const userC = {
        email: "userC@mensola.com",
        username: "usernameC",
        password: "password123"
    };

    beforeAll(async () => {
        const userAResponse = await request(app).post("/api/auth/register").send(userA);

        userAId = userAResponse.body.data.user.id;
        userAToken = userAResponse.body.data.accessToken;

        const userBResponse = await request(app).post("/api/auth/register").send(userB);

        userBId = userBResponse.body.data.user.id;
        userBToken = userBResponse.body.data.accessToken;

        const userCResponse = await request(app).post("/api/auth/register").send(userC);

        userCId = userCResponse.body.data.user.id;
        userCToken = userCResponse.body.data.accessToken;

        await request(app).post(`/api/users/${userBId}/follow`).set("Authorization", `Bearer ${userCToken}`);

        await request(app).post(`/api/users/${userCId}/follow`).set("Authorization", `Bearer ${userAToken}`);
    });

    describe("GET /api/users/me", () => {
        it("should return authenticated user's own profile successfully and remove irrelevant relational fields (200)", async () => {
            const response = await request(app).get("/api/users/me").set("Authorization", `Bearer ${userAToken}`);

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
            const response = await request(app).get("/api/users/me").set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Invalid or expired token/i);
        });
    });

    describe("GET /api/users/:userId", () => {
        it("should return user profile with mutual followers and follow status for authenticated user (200)", async () => {
            const response = await request(app)
                .get(`/api/users/${userBId}`)
                .set("Authorization", `Bearer ${userAToken}`);

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
            const response = await request(app).get(`/api/users/${userBId}`);

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
                .get(`/api/users/${userBId}`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Invalid or expired token/i);
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
                .set("Authorization", `Bearer ${userAToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/Profile updated successfully/i);

            const updatedUser = response.body.data?.user;

            expect(updatedUser).toHaveProperty("id");
            expect(updatedUser).toHaveProperty("username");
            expect(updatedUser.fullname).toBe(updateData.fullname);
            expect(updatedUser.bio).toBe(updateData.bio);
            expect(updatedUser.avatar).toBe(updateData.avatar);
        });

        it("should return 400 if request body is empty", async () => {
            const response = await request(app)
                .put("/api/users/me")
                .set("Authorization", `Bearer ${userAToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/at least one field/i);
        });

        it("should fail with 403 Unauthorized when attempting to update profile without a valid token (403)", async () => {
            const response = await request(app)
                .put("/api/users/me")
                .set("Authorization", "Bearer invalid-token")
                .send({ fullname: "John Doe" });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Invalid or expired token/i);
        });
    });

    describe("GET /api/users/followers", () => {
        it("should return followers list with isFollowing: true for authenticated user", async () => {
            const response = await request(app)
                .get("/api/users/followers")
                .set("Authorization", `Bearer ${userAToken}`)
                .query({
                    userId: userBId,
                    limit: 20,
                    page: 1
                });

            expect(response.body.success).toBe(true);

            const followers = response.body.data.items;

            expect(followers.length).toBe(1);
            expect(followers[0].isFollowing).toBe(true);
            expect(followers[0].isFollower).toBe(false);
            expect(followers[0].username).toBeTruthy();
        });

        it("should return isFollowing as false for unauthenticated (guest) user", async () => {
            const response = await request(app).get("/api/users/followers").query({
                userId: userBId,
                limit: 20,
                page: 1
            });

            expect(response.body.success).toBe(true);

            const followers = response.body.data.items;

            expect(followers.length).toBe(1);
            expect(followers[0].isFollowing).toBe(false);
            expect(followers[0].isFollower).toBe(false);
            expect(followers[0].username).toBeTruthy();
        });

        it("should return hasMore: true when additional pages are available", async () => {
            const response = await request(app).get("/api/users/followers").query({
                userId: userBId,
                limit: 1,
                page: 1
            });

            expect(response.body.success).toBe(true);
            expect(response.body.data.hasMore).toBe(true);
        });

        it("should return 400 when userId query parameter is missing", async () => {
            const response = await request(app).get("/api/users/followers");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Target user ID is required/i);
        });
    });

    describe("GET /api/users/following", () => {
        it("should return following list with isFollower: true for authenticated user", async () => {
            const response = await request(app)
                .get("/api/users/following")
                .set("Authorization", `Bearer ${userBToken}`)
                .query({
                    userId: userAId,
                    limit: 20,
                    page: 1
                });

            expect(response.body.success).toBe(true);

            const following = response.body.data.items;

            expect(following.length).toBe(1);
            expect(following[0].isFollowing).toBe(false);
            expect(following[0].isFollower).toBe(true);
            expect(following[0].username).toBeTruthy();
        });

        it("should return isFollower as false for unauthenticated (guest) user", async () => {
            const response = await request(app).get("/api/users/following").query({
                userId: userAId,
                limit: 20,
                page: 1
            });

            expect(response.body.success).toBe(true);

            const following = response.body.data.items;

            expect(following.length).toBe(1);
            expect(following[0].isFollowing).toBe(false);
            expect(following[0].isFollower).toBe(false);
            expect(following[0].username).toBeTruthy();
        });

        it("should return hasMore: true when additional pages are available", async () => {
            const response = await request(app).get("/api/users/following").query({
                userId: userAId,
                limit: 1,
                page: 1
            });

            expect(response.body.success).toBe(true);
            expect(response.body.data.hasMore).toBe(true);
        });

        it("should return 400 when userId query parameter is missing", async () => {
            const response = await request(app).get("/api/users/following");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Target user ID is required/i);
        });
    });

    describe("POST /api/users/:userId/follow", () => {
        it("should allow a user to follow another user successfully (200)", async () => {
            const response = await request(app)
                .post(`/api/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        it("should handle duplicate follow requests gracefully (ON CONFLICT)", async () => {
            const response = await request(app)
                .post(`/api/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        it("should prevent a user from following themselves (400)", async () => {
            const response = await request(app)
                .post(`/api/users/${userBId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/cannot follow yourself/i);
        });

        it("should return 403 Forbidden when no authentication token is provided", async () => {
            const response = await request(app)
                .post(`/api/users/${userAId}/follow`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Invalid or expired token/i);
        });
    });

    describe("DELETE /api/users/:userId/follow", () => {
        it("should allow a user to unfollow someone they currently follow (200)", async () => {
            await request(app).post(`/api/users/${userAId}/follow`).set("Authorization", `Bearer ${userBToken}`);

            const response = await request(app)
                .delete(`/api/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it("should handle unfollowing a user who is not being followed gracefully (Idempotent - 200)", async () => {
            const response = await request(app)
                .delete(`/api/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it("should prevent a user from unfollowing themselves (400)", async () => {
            const response = await request(app)
                .delete(`/api/users/${userBId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/cannot unfollow yourself/i);
        });

        it("should return 403 Forbidden when no authentication token is provided", async () => {
            const response = await request(app)
                .delete(`/api/users/${userAId}/follow`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toMatch(/Invalid or expired token/i);
        });
    });
});
