import request from "supertest";
import { MESSAGES } from "@/constants/messages";
import app from "@/app";

describe("User endpoints", () => {
    // Shared authentication tokens and user IDs for test suite setup
    let userAToken = "";
    let userAId = "";

    const userA = {
        email: "userA@mensola.com",
        username: "usernameA",
        password: "password123",
    };

    let userBId = "";
    let userBToken = "";

    const userB = {
        email: "userB@mensola.com",
        username: "usernameB",
        password: "password123",
    };

    let userCId = "";
    let userCToken = "";

    const userC = {
        email: "userC@mensola.com",
        username: "usernameC",
        password: "password123",
    };

    /**
     * Test Suite Setup
     * Registers three test users and seeds initial follow relationships to establish mutual/following states.
     */
    beforeAll(async () => {
        // Register User A
        const userAResponse = await request(app).post("/v1/auth/register").send(userA);
        userAId = userAResponse.body.data.user.id;
        userAToken = userAResponse.body.data.accessToken;

        // Register User B
        const userBResponse = await request(app).post("/v1/auth/register").send(userB);
        userBId = userBResponse.body.data.user.id;
        userBToken = userBResponse.body.data.accessToken;

        // Register User C
        const userCResponse = await request(app).post("/v1/auth/register").send(userC);
        userCId = userCResponse.body.data.user.id;
        userCToken = userCResponse.body.data.accessToken;

        // Seed social graph: User C follows User B, User A follows User C
        await request(app).post(`/v1/users/${userBId}/follow`).set("Authorization", `Bearer ${userCToken}`);
        await request(app).post(`/v1/users/${userCId}/follow`).set("Authorization", `Bearer ${userAToken}`);
    });

    /* ==========================================================================
       GET /v1/users/me Tests
       ========================================================================== */
    describe("GET /v1/users/me", () => {
        /**
         * @test Ensures authenticated users can retrieve their full profile with counts & arrays
         */
        it("should return authenticated user's own profile successfully and remove irrelevant relational fields (200)", async () => {
            const response = await request(app).get("/v1/users/me").set("Authorization", `Bearer ${userAToken}`);

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

        /**
         * @test Ensures request fails with 403 when an invalid Bearer token is provided
         */
        it(" fail with 403 Unauthorized when an invalid or expired access token is provided (403)", async () => {
            const response = await request(app).get("/v1/users/me").set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_TOKEN);
        });
    });

    /* ==========================================================================
       GET /v1/users/:userId Tests
       ========================================================================== */
    describe("GET /v1/users/:userId", () => {
        /**
         * @test Validates public profile retrieval including relational fields (isFollowingByMe, mutualFollowers) for auth users
         */
        it("should return user profile with mutual followers and follow status for authenticated user (200)", async () => {
            const response = await request(app)
                .get(`/v1/users/${userBId}`)
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

        /**
         * @test Validates guest user profile viewing (relational fields like mutualFollowers should be excluded/neutralized)
         */
        it("should return user profile without mutual followers and follow status for guest user (200)", async () => {
            const response = await request(app).get(`/v1/users/${userBId}`);

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

        /**
         * @test Ensures request fails with 403 if an invalid token is explicitly provided
         */
        it("should return 403 error if token is sent but invalid or expired (403)", async () => {
            const response = await request(app)
                .get(`/v1/users/${userBId}`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_TOKEN);
        });
    });

    /* ==========================================================================
       PUT /v1/users/me Tests
       ========================================================================== */
    describe("PUT /v1/users/me", () => {
        /**
         * @test Validates successful update of allowed profile fields (fullname, bio, avatar)
         */
        it("should update profile fields successfully and return only updated basic user data (200)", async () => {
            const updateData = {
                fullname: "Updated John Doe",
                bio: "This is my updated biography.",
                avatar: "https://example.com/avatar.jpg",
            };

            const response = await request(app)
                .put("/v1/users/me")
                .set("Authorization", `Bearer ${userAToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(MESSAGES.SUCCESS.PROFILE_UPDATED);

            const updatedUser = response.body.data?.user;

            expect(updatedUser).toHaveProperty("id");
            expect(updatedUser).toHaveProperty("username");
            expect(updatedUser.fullname).toBe(updateData.fullname);
            expect(updatedUser.bio).toBe(updateData.bio);
            expect(updatedUser.avatar).toBe(updateData.avatar);
        });

        /**
         * @test Ensures Zod/Controller rejects empty request body updates with 400 Bad Request
         */
        it("should return 400 if request body is empty", async () => {
            const response = await request(app)
                .put("/v1/users/me")
                .set("Authorization", `Bearer ${userAToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.AT_LEAST_ONE_FIELD_REQUIRED);
        });

        /**
         * @test Ensures unauthenticated users cannot update profile data
         */
        it("should fail with 403 Unauthorized when attempting to update profile without a valid token (403)", async () => {
            const response = await request(app)
                .put("/v1/users/me")
                .set("Authorization", "Bearer invalid-token")
                .send({ fullname: "John Doe" });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_TOKEN);
        });
    });

    /* ==========================================================================
       GET /v1/users/followers Tests
       ========================================================================== */
    describe("GET /v1/users/followers", () => {
        /**
         * @test Verifies followers list includes contextual 'isFollowing' flag when requested by auth user
         */
        it("should return followers list with isFollowing: true for authenticated user", async () => {
            const response = await request(app)
                .get("/v1/users/followers")
                .set("Authorization", `Bearer ${userAToken}`)
                .query({
                    userId: userBId,
                    limit: 20,
                    page: 1,
                });

            expect(response.body.success).toBe(true);

            const followers = response.body.data.items;

            expect(followers.length).toBe(1);
            expect(followers[0].isFollowing).toBe(true);
            expect(followers[0].isFollower).toBe(false);
            expect(followers[0].username).toBeTruthy();
        });

        /**
         * @test Verifies followers list sets 'isFollowing' to false when requested by guest
         */
        it("should return isFollowing as false for unauthenticated (guest) user", async () => {
            const response = await request(app).get("/v1/users/followers").query({
                userId: userBId,
                limit: 20,
                page: 1,
            });

            expect(response.body.success).toBe(true);

            const followers = response.body.data.items;

            expect(followers.length).toBe(1);
            expect(followers[0].isFollowing).toBe(false);
            expect(followers[0].isFollower).toBe(false);
            expect(followers[0].username).toBeTruthy();
        });

        /**
         * @test Verifies pagination calculation sets 'hasMore: true' when limit is met
         */
        it("should return hasMore: true when additional pages are available", async () => {
            const response = await request(app).get("/v1/users/followers").query({
                userId: userBId,
                limit: 1,
                page: 1,
            });

            expect(response.body.success).toBe(true);
            expect(response.body.data.hasMore).toBe(true);
        });

        /**
         * @test Ensures missing target userId query parameter returns 400 Bad Request
         */
        it("should return 400 when userId query parameter is missing", async () => {
            const response = await request(app).get("/v1/users/followers");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_USER_ID);
        });
    });

    /* ==========================================================================
       GET /v1/users/following Tests
       ========================================================================== */
    describe("GET /v1/users/following", () => {
        /**
         * @test Verifies following list includes contextual 'isFollower' flag for auth user
         */
        it("should return following list with isFollower: true for authenticated user", async () => {
            const response = await request(app)
                .get("/v1/users/following")
                .set("Authorization", `Bearer ${userBToken}`)
                .query({
                    userId: userAId,
                    limit: 20,
                    page: 1,
                });

            expect(response.body.success).toBe(true);

            const following = response.body.data.items;

            expect(following.length).toBe(1);
            expect(following[0].isFollowing).toBe(false);
            expect(following[0].isFollower).toBe(true);
            expect(following[0].username).toBeTruthy();
        });

        /**
         * @test Verifies following list sets 'isFollower' to false for guest users
         */
        it("should return isFollower as false for unauthenticated (guest) user", async () => {
            const response = await request(app).get("/v1/users/following").query({
                userId: userAId,
                limit: 20,
                page: 1,
            });

            expect(response.body.success).toBe(true);

            const following = response.body.data.items;

            expect(following.length).toBe(1);
            expect(following[0].isFollowing).toBe(false);
            expect(following[0].isFollower).toBe(false);
            expect(following[0].username).toBeTruthy();
        });

        /**
         * @test Verifies pagination calculations for following list
         */
        it("should return hasMore: true when additional pages are available", async () => {
            const response = await request(app).get("/v1/users/following").query({
                userId: userAId,
                limit: 1,
                page: 1,
            });

            expect(response.body.success).toBe(true);
            expect(response.body.data.hasMore).toBe(true);
        });

        /**
         * @test Ensures missing target userId query parameter returns 400 Bad Request
         */
        it("should return 400 when userId query parameter is missing", async () => {
            const response = await request(app).get("/v1/users/following");

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_USER_ID);
        });
    });

    /* ==========================================================================
       POST /v1/users/:userId/follow Tests
       ========================================================================== */
    describe("POST /v1/users/:userId/follow", () => {
        /**
         * @test Verifies creating a new follow relationship (201 Created)
         */
        it("should allow a user to follow another user successfully (200)", async () => {
            const response = await request(app)
                .post(`/v1/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        /**
         * @test Ensures idempotent behavior when trying to follow an already followed user
         */
        it("should handle duplicate follow requests gracefully (ON CONFLICT)", async () => {
            const response = await request(app)
                .post(`/v1/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        /**
         * @test Ensures business logic prevents self-following (400 Bad Request)
         */
        it("should prevent a user from following themselves (400)", async () => {
            const response = await request(app)
                .post(`/v1/users/${userBId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.CANNOT_FOLLOW_SELF);
        });

        /**
         * @test Ensures unauthenticated requests are rejected with 403 Forbidden
         */
        it("should return 403 Forbidden when no authentication token is provided", async () => {
            const response = await request(app)
                .post(`/v1/users/${userAId}/follow`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_TOKEN);
        });
    });

    /* ==========================================================================
       DELETE /v1/users/:userId/follow Tests
       ========================================================================== */
    describe("DELETE /v1/users/:userId/follow", () => {
        /**
         * @test Verifies removing an existing follow relationship (200 OK)
         */
        it("should allow a user to unfollow someone they currently follow (200)", async () => {
            await request(app).post(`/v1/users/${userAId}/follow`).set("Authorization", `Bearer ${userBToken}`);

            const response = await request(app)
                .delete(`/v1/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        /**
         * @test Ensures unfollowing a non-followed user behaves idempotently (200 OK)
         */
        it("should handle unfollowing a user who is not being followed gracefully (Idempotent - 200)", async () => {
            const response = await request(app)
                .delete(`/v1/users/${userAId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        /**
         * @test Ensures business logic prevents self-unfollowing (400 Bad Request)
         */
        it("should prevent a user from unfollowing themselves (400)", async () => {
            const response = await request(app)
                .delete(`/v1/users/${userBId}/follow`)
                .set("Authorization", `Bearer ${userBToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.CANNOT_UNFOLLOW_SELF);
        });

        /**
         * @test Ensures unauthenticated requests are rejected with 403 Forbidden
         */
        it("should return 403 Forbidden when no authentication token is provided", async () => {
            const response = await request(app)
                .delete(`/v1/users/${userAId}/follow`)
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe(MESSAGES.ERRORS.INVALID_TOKEN);
        });
    });
});
