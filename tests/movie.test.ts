import request from "supertest";
import app from "@/app";

import { IUser } from "@/types/user";
import { IMovie, IMovieList } from "@/types/movie";

import { createTestUser } from "./helpers/auth.helper";
import {
    addTestListToLikes,
    addTestMovieToLikes,
    addTestMovieToList,
    addTestMovieToWatched,
    createTestInteraction,
    createTestMovie,
    createTestMovieList,
} from "./helpers/db.helper";

describe("Movie API", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & {
        password: string;
    };
    let testUserAToken: string;

    let testMovie: Pick<IMovie, "id" | "tmdbId" | "title" | "poster">;

    beforeEach(async () => {
        ({ user: testUserA, token: testUserAToken } = await createTestUser());

        testMovie = await createTestMovie();
    });

    describe("Watched Movies Endpoints", () => {
        /* ==========================================================================
       GET /api/movies/watched
       ========================================================================== */
        describe("GET /api/movies/watched", () => {
            it("should return 200 and watched movies list for authenticated user", async () => {
                const watchedMovie = await addTestMovieToWatched(testUserA.id, testMovie.id);

                const response = await request(app)
                    .get("/api/movies/watched")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 200 and watched movies when userId query parameter is passed", async () => {
                const watchedMovie = await addTestMovieToWatched(testUserA.id, testMovie.id);

                const response = await request(app).get("/api/movies/watched?userId=" + testUserA.id);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 400 when neither token nor valid userId query parameter is provided", async () => {
                const response = await request(app).get("/api/movies/watched");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/userId is invalid/i);
            });
        });

        /* ==========================================================================
       POST /api/movies/:movieId/watched
       ========================================================================== */
        describe("POST /api/movies/:movieId/watched", () => {
            it("should mark movie as watched successfully and return 201", async () => {
                const response = await request(app)
                    .post(`/api/movies/${testMovie.id}/watched`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const watchedMovie = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(watchedMovie.movieId).toBe(testMovie.id);
            });

            it("should return 401 when authorization token is missing", async () => {
                const response = await request(app).post(`/api/movies/${testMovie.id}/watched`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post("/api/movies/invalid-movie-id/watched")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.error.message).toBe("Invalid movie ID format.");
            });
        });

        /* ==========================================================================
       DELETE /api/movies/:movieId/watched
       ========================================================================== */
        describe("DELETE /api/movies/:movieId/watched", () => {
            it("should remove movie from watched history successfully and return 200", async () => {
                await addTestMovieToWatched(testUserA.id, testMovie.id);

                const response = await request(app)
                    .delete(`/api/movies/${testMovie.id}/watched`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toMatch(/Movie has been removed from watched history successfully/i);
            });

            it("should return 401 when authorization token is missing during deletion", async () => {
                const response = await request(app).delete(`/api/movies/${testMovie.id}/watched`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });
    });

    describe("Watchlist Endpoints", () => {
        let watchlistData: Pick<IMovieList, "id" | "title" | "isPrivate" | "listType" | "creatorId">;

        beforeEach(async () => {
            watchlistData = await createTestMovieList(testUserA.id, "watchlist");
        });

        /* ==========================================================================
       GET /api/movies/watchlist
       ========================================================================== */
        describe("GET /api/movies/watchlist", () => {
            it("should return 200 and list watchlist movies for authenticated user", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, watchlistData.id);

                const response = await request(app)
                    .get("/api/movies/watchlist")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 200 and watchlist movies when userId query parameter is provided", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, watchlistData.id);

                const response = await request(app).get("/api/movies/watchlist?userId=" + testUserA.id);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 400 when neither token nor valid userId query parameter is provided", async () => {
                const response = await request(app).get("/api/movies/watchlist");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/userId is invalid/i);
            });
        });

        /* ==========================================================================
       POST /api/movies/:movieId/watchlist
       ========================================================================== */
        describe("POST /api/movies/:movieId/watchlist", () => {
            it("should add movie to watchlist successfully and return 201", async () => {
                const response = await request(app)
                    .post(`/api/movies/${testMovie.id}/watchlist`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(responseData.movieId).toBe(testMovie.id);
                expect(responseData.movieListId).toBe(watchlistData.id);
            });

            it("should return 401 when authorization token is missing", async () => {
                const response = await request(app).post(`/api/movies/${testMovie.id}/watchlist`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post("/api/movies/invalid-movie-id/watchlist")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe("Invalid movie ID format.");
            });
        });

        /* ==========================================================================
       DELETE /api/movies/:movieId/watchlist
       ========================================================================== */
        describe("DELETE /api/movies/:movieId/watchlist", () => {
            it("should remove movie from watchlist successfully and return 200", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, watchlistData.id);

                const response = await request(app)
                    .delete(`/api/movies/${testMovie.id}/watchlist`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toMatch(/Movie has been removed from watchlist successfully./i);
            });

            it("should return 401 when authorization token is missing during deletion", async () => {
                const response = await request(app).delete(`/api/movies/${testMovie.id}/watchlist`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });
    });

    describe("Favorite Movies Endpoints", () => {
        let favoritesData: Pick<IMovieList, "id" | "title" | "isPrivate" | "listType" | "creatorId">;

        beforeEach(async () => {
            favoritesData = await createTestMovieList(testUserA.id, "favorites");
        });

        /* ==========================================================================
       GET /api/movies/favorites
       ========================================================================== */
        describe("GET /api/movies/favorites", () => {
            it("should return 200 and list favorite movies for authenticated user", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, favoritesData.id);

                const response = await request(app)
                    .get("/api/movies/favorites")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 200 and favorite movies when userId query parameter is provided", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, favoritesData.id);

                const response = await request(app).get("/api/movies/favorites?userId=" + testUserA.id);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 400 when neither token nor valid userId query parameter is provided", async () => {
                const response = await request(app).get("/api/movies/favorites");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/userId is invalid/i);
            });
        });

        /* ==========================================================================
       POST /api/movies/:movieId/favorites
       ========================================================================== */
        describe("POST /api/movies/:movieId/favorites", () => {
            it("should add movie to favorites successfully and return 201", async () => {
                const response = await request(app)
                    .post(`/api/movies/${testMovie.id}/favorites`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(responseData.movieId).toBe(testMovie.id);
                expect(responseData.movieListId).toBe(favoritesData.id);
            });

            it("should return 401 when authorization token is missing", async () => {
                const response = await request(app).post(`/api/movies/${testMovie.id}/favorites`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post("/api/movies/invalid-movie-id/favorites")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe("Invalid movie ID format.");
            });
        });

        /* ==========================================================================
       DELETE /api/movies/:movieId/favorites
       ========================================================================== */
        describe("DELETE /api/movies/:movieId/favorites", () => {
            it("should remove movie from favorites successfully and return 200", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, favoritesData.id);

                const response = await request(app)
                    .delete(`/api/movies/${testMovie.id}/favorites`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toMatch(/Movie has been removed from favorites successfully/i);
            });

            it("should return 401 when authorization token is missing during deletion", async () => {
                const response = await request(app).delete(`/api/movies/${testMovie.id}/favorites`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });
    });

    describe("Movie Likes Endpoints", () => {
        /* ==========================================================================
       GET /api/movies/liked
       ========================================================================== */
        describe("GET /api/movies/likes", () => {
            it("should return 200 and list liked movies for authenticated user", async () => {
                const interaction = await addTestMovieToLikes(testUserA.id, testMovie.id);

                const response = await request(app)
                    .get("/api/movies/likes")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items || response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
                expect(responseData[0].isLiked).toBe(true);
            });

            it("should return 200 and liked movies when userId query parameter is provided", async () => {
                const interaction = await addTestMovieToLikes(testUserA.id, testMovie.id);

                const response = await request(app).get("/api/movies/likes?userId=" + testUserA.id);

                const responseData = response.body.data.items || response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
                expect(responseData[0].isLiked).toBe(true);
            });

            it("should return 400 when neither token nor valid userId query parameter is provided", async () => {
                const response = await request(app).get("/api/movies/likes");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/userId is required|userId is invalid/i);
            });
        });

        /* ==========================================================================
       POST /api/movies/:movieId/like
       ========================================================================== */
        describe("POST /api/movies/:movieId/like", () => {
            it("should like movie successfully and return 201", async () => {
                const response = await request(app)
                    .post(`/api/movies/${testMovie.id}/like`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(responseData.movieId).toBe(testMovie.id);
                expect(responseData.isLiked).toBe(true);
                expect(response.body.message).toMatch(/Movie liked successfully./i);
            });

            it("should return 401 when authorization token is missing", async () => {
                const response = await request(app).post(`/api/movies/${testMovie.id}/like`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post("/api/movies/invalid-movie-id/like")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe("Invalid movie ID format.");
            });
        });

        /* ==========================================================================
       DELETE /api/movies/:movieId/like
       ========================================================================== */
        describe("DELETE /api/movies/:movieId/like", () => {
            it("should unlike movie successfully and return 200", async () => {
                const interaction = await addTestMovieToLikes(testUserA.id, testMovie.id);

                const response = await request(app)
                    .delete(`/api/movies/${testMovie.id}/like`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toMatch(/Movie unliked successfully/i);
            });

            it("should return 401 when authorization token is missing during deletion", async () => {
                const response = await request(app).delete(`/api/movies/${testMovie.id}/like`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });
    });

    describe("List Items Operation Endpoints", () => {
        let testUserB: Pick<IUser, "id" | "email" | "username"> & {
            password: string;
        };
        let testUserBToken: string;

        let listData: Pick<IMovieList, "id" | "title" | "isPrivate" | "listType" | "creatorId">;

        beforeEach(async () => {
            ({ user: testUserB, token: testUserBToken } = await createTestUser());

            listData = await createTestMovieList(testUserA.id, "custom");
        });

        /* ==========================================================================
       GET /api/movies/lists/:listId/items
       ========================================================================== */
        describe("GET /api/movies/lists/:listId/items", () => {
            it("should return 200 and list items when accessed by list owner", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, listData.id);

                const response = await request(app)
                    .get(`/api/movies/lists/${listData.id}/items`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 200 and list items for public list when unauthenticated", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, listData.id);

                const response = await request(app).get(`/api/movies/lists/${listData.id}/items`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].id).toBe(testMovie.id);
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app).get("/api/movies/lists/invalid-list-id/items");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/i);
            });

            it("should return 404 when another user tries to access items of a private list", async () => {
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });
                await addTestMovieToList(testUserA.id, testMovie.id, privateList.id);

                const response = await request(app)
                    .get(`/api/movies/lists/${privateList.id}/items`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Movie list not found or you don't have permission to access it/i,
                );
            });
        });

        /* ==========================================================================
       POST /api/movies/lists/:listId/items/:movieId
       ========================================================================== */
        describe("POST /api/movies/lists/:listId/items/:movieId", () => {
            it("should add movie to list successfully and return 201 when called by list owner", async () => {
                const response = await request(app)
                    .post(`/api/movies/lists/${listData.id}/items/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const addedMovie = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(addedMovie.movieId).toBe(testMovie.id);
                expect(addedMovie.movieListId).toBe(listData.id);
            });

            it("should return 404 when non-owner user tries to add a movie to the list", async () => {
                const response = await request(app)
                    .post(`/api/movies/lists/${listData.id}/items/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Movie list not found, movie already exists in the list, or you don't have permission to modify it/i,
                );
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post(`/api/movies/lists/invalid-list-id/items/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post(`/api/movies/lists/${listData.id}/items/invalid-list-id`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid movie ID format/);
            });

            it("should return 401 when authorization token is missing", async () => {
                const response = await request(app).post(`/api/movies/lists/${listData.id}/items/${testMovie.id}`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });

        /* ==========================================================================
       DELETE /api/movies/lists/:listId/items/:movieId
       ========================================================================== */
        describe("DELETE /api/movies/lists/:listId/items/:movieId", () => {
            it("should remove movie from list successfully and return 200 when called by list owner", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, listData.id);

                const response = await request(app)
                    .delete(`/api/movies/lists/${listData.id}/items/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toMatch(/Movie has been removed from the list successfully/i);
            });

            it("should return 404 when non-owner user tries to remove a movie from the list", async () => {
                await addTestMovieToList(testUserA.id, testMovie.id, listData.id);

                const response = await request(app)
                    .delete(`/api/movies/lists/${listData.id}/items/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Movie not found in the list or you don't have permission to modify it/i,
                );
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app)
                    .delete(`/api/movies/lists/invalid-list-id/items/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app)
                    .delete(`/api/movies/lists/${listData.id}/items/invalid-list-id`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid movie ID format/);
            });

            it("should return 401 when authorization token is missing during deletion", async () => {
                const response = await request(app).delete(`/api/movies/lists/${listData.id}/items/${testMovie.id}`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });
    });

    describe("List Operation Endpoints", () => {
        let testUserB: Pick<IUser, "id" | "email" | "username"> & {
            password: string;
        };
        let testUserBToken: string;

        beforeEach(async () => {
            ({ user: testUserB, token: testUserBToken } = await createTestUser());
        });

        /* ==========================================================================
     GET /api/movies/lists
     ========================================================================== */
        describe("GET /api/movies/lists", () => {
            it("should return both public and private lists when requested by list owner", async () => {
                const publicList = await createTestMovieList(testUserA.id, "custom");
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app)
                    .get("/api/movies/lists?userId=" + testUserA.id)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(2);
                expect(responseData[0].listId).toBe(privateList.id);
                expect(responseData[1].listId).toBe(publicList.id);
            });

            it("should return only public lists when requested by another user", async () => {
                const publicList = await createTestMovieList(testUserA.id, "custom");
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app)
                    .get("/api/movies/lists?userId=" + testUserA.id)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].listId).toBe(publicList.id);
            });

            it("should return only public lists when requested without authentication token", async () => {
                const publicList = await createTestMovieList(testUserA.id, "custom");
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app).get("/api/movies/lists?userId=" + testUserA.id);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].listId).toBe(publicList.id);
            });

            it("should return current authenticated user's lists when userId param is omitted", async () => {
                const list = await createTestMovieList(testUserA.id, "custom");

                const response = await request(app)
                    .get("/api/movies/lists")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].listId).toBe(list.id);
            });

            it("should return 400 when userId query parameter is not a valid UUID", async () => {
                const list = await createTestMovieList(testUserA.id, "custom");

                const response = await request(app).get("/api/movies/lists?userId=invalid-user-id");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid user ID format. Must be a valid UUID/);
            });

            it("should return 403 when authorization token is invalid or corrupted", async () => {
                const list = await createTestMovieList(testUserA.id, "custom");

                const response = await request(app)
                    .get("/api/movies/lists?userId=" + testUserA.id)
                    .set("Authorization", "Bearer invalid-user-id");

                expect(response.status).toBe(403);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid or expired token/i);
            });
        });

        /* ==========================================================================
       POST /api/movies/lists
       ========================================================================== */
        describe("POST /api/movies/lists", () => {
            it("should create custom movie list successfully with full payload and return 201", async () => {
                const list = {
                    title: "List Title",
                    description: "Description",
                    image: "https://example.com/image.jpg",
                    isPrivate: false,
                };

                const response = await request(app)
                    .post("/api/movies/lists")
                    .send(list)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(responseData.title).toBe(list.title);
                expect(responseData.isPrivate).toBe(false);
            });

            it("should create list with default values when optional fields are omitted", async () => {
                const list = { title: "List Title" };

                const response = await request(app)
                    .post("/api/movies/lists")
                    .send(list)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(responseData.description).toBe(null);
                expect(responseData.image).toBe(null);
                expect(responseData.isPrivate).toBe(false);
            });

            it("should return 401 when authorization token is missing during list creation", async () => {
                const list = { title: "List Title" };

                const response = await request(app).post("/api/movies/lists").send(list);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when required fields (title) are missing in request body", async () => {
                const list = { description: "Missing title" };

                const response = await request(app)
                    .post("/api/movies/lists")
                    .send(list)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Title is required and must be a string/i);
            });
        });
    });

    describe("Single List Operations", () => {
        let testUserB: Pick<IUser, "id" | "email" | "username"> & {
            password: string;
        };
        let testUserBToken: string;

        beforeEach(async () => {
            ({ user: testUserB, token: testUserBToken } = await createTestUser());
        });

        /* ==========================================================================
       GET /api/movies/lists/:listId
       ========================================================================== */
        describe("GET /api/movies/lists/:listId", () => {
            it("should return public list details when requested by another user", async () => {
                const list = await createTestMovieList(testUserA.id, "custom");

                const response = await request(app)
                    .get(`/api/movies/lists/${list.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.id).toBe(list.id);
            });

            it("should return private list details when requested by list owner", async () => {
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app)
                    .get(`/api/movies/lists/${privateList.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.id).toBe(privateList.id);
            });

            it("should return 404 when non-owner user tries to access a private list", async () => {
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app)
                    .get(`/api/movies/lists/${privateList.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Movie list not found or you don't have permission to access it/i,
                );
            });

            it("should return 404 when unauthenticated user tries to access a private list", async () => {
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app).get(`/api/movies/lists/${privateList.id}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Movie list not found or you don't have permission to access it/i,
                );
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app)
                    .get("/api/movies/lists/invalid-list-id")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/i);
            });
        });

        /* ==========================================================================
       PATCH /api/movies/lists/:listId
       ========================================================================== */
        describe("PATCH /api/movies/lists/:listId", () => {
            it("should update list details successfully when requested by list owner", async () => {
                const list = await createTestMovieList(testUserA.id, "custom", {
                    title: "First Title",
                });

                const changedList = {
                    title: "Changed Title",
                    description: "Description",
                    image: "https://example.com/image.jpg",
                };

                const response = await request(app)
                    .patch(`/api/movies/lists/${list.id}`)
                    .send(changedList)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.id).toBe(list.id);
                expect(responseData.title).toBe(changedList.title);
            });

            it("should return 404 when non-owner user tries to update the list", async () => {
                const list = await createTestMovieList(testUserA.id, "custom", {
                    title: "First Title",
                });

                const changedList = {
                    title: "Changed Title",
                    description: "Description",
                    image: "https://example.com/image.jpg",
                };

                const response = await request(app)
                    .patch(`/api/movies/lists/${list.id}`)
                    .send(changedList)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Movie list not found or you don't have permission to update it/i,
                );
            });

            it("should return 400 when request body is missing", async () => {
                const list = await createTestMovieList(testUserA.id, "custom", {
                    title: "First Title",
                });

                const response = await request(app)
                    .patch(`/api/movies/lists/${list.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Request body is required/i);
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const changedList = {
                    title: "Changed Title",
                    description: "Description",
                    image: "https://example.com/image.jpg",
                };

                const response = await request(app)
                    .patch("/api/movies/lists/invalid-list-id")
                    .send(changedList)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/i);
            });

            it("should return 401 when authorization token is missing", async () => {
                const list = await createTestMovieList(testUserA.id);

                const changedList = {
                    title: "Changed Title",
                    description: "Description",
                    image: "https://example.com/image.jpg",
                };

                const response = await request(app).patch(`/api/movies/lists/${list.id}`).send(changedList);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });

        /* ==========================================================================
       DELETE /api/movies/lists/:listId
       ========================================================================== */
        describe("DELETE /api/movies/lists/:listId", () => {
            it("should delete list successfully when requested by list owner", async () => {
                const list = await createTestMovieList(testUserA.id);

                const response = await request(app)
                    .delete(`/api/movies/lists/${list.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toMatch(/Movie list has been deleted successfully/);
            });

            it("should return 404 when non-owner user tries to delete the list", async () => {
                const list = await createTestMovieList(testUserA.id);

                const response = await request(app)
                    .delete(`/api/movies/lists/${list.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    "Movie list not found or you don't have permission to delete it",
                );
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app)
                    .delete("/api/movies/lists/invalid-list-id")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/i);
            });

            it("should return 401 when authorization token is missing", async () => {
                const list = await createTestMovieList(testUserA.id);

                const response = await request(app).delete(`/api/movies/lists/${list.id}`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });
        });
    });

    describe("List Likes Endpoints", () => {
        let testUserB: Pick<IUser, "id" | "email" | "username"> & {
            password: string;
        };
        let testUserBToken: string;

        let testList: Pick<IMovieList, "id" | "title" | "isPrivate" | "listType" | "creatorId">;

        beforeEach(async () => {
            ({ user: testUserB, token: testUserBToken } = await createTestUser());

            testList = await createTestMovieList(testUserA.id, "custom");
        });

        /* ==========================================================================
       GET /api/movies/lists/likes
       ========================================================================== */
        describe("GET /api/movies/lists/likes", () => {
            it("should return 200 and liked lists when owner accesses their own liked lists", async () => {
                const likedList = await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app)
                    .get(`/api/movies/lists/likes?userId=${testUserA.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].listId).toBe(testList.id);
            });

            it("should return 200 and public liked lists when accessed by another user", async () => {
                await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app)
                    .get(`/api/movies/lists/likes?userId=${testUserA.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].listId).toBe(testList.id);
            });

            it("should return 200 and public liked lists when requested without authentication", async () => {
                await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app).get(`/api/movies/lists/likes?userId=${testUserA.id}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(1);
                expect(responseData[0].listId).toBe(testList.id);
            });

            it("should filter out private lists from liked lists when accessed by another user", async () => {
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                await addTestListToLikes(testUserA.id, privateList.id);

                const response = await request(app)
                    .get(`/api/movies/lists/likes?userId=${testUserA.id}`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                const responseData = response.body.data.items;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.length).toBe(0);
            });

            it("should return 400 when userId query parameter is not a valid UUID", async () => {
                await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app)
                    .get("/api/movies/lists/likes?userId=invalid-user-id")
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid user ID format/i);
            });
        });

        /* ==========================================================================
       POST /api/movies/lists/:listId/like
       ========================================================================== */
        describe("POST /api/movies/lists/:listId/like", () => {
            it("should like movie list successfully and return 201", async () => {
                const response = await request(app)
                    .post(`/api/movies/lists/${testList.id}/like`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(responseData.listId).toBe(testList.id);
                expect(responseData.isLiked).toBe(true);
            });

            it("should return 401 when authorization token is missing", async () => {
                const response = await request(app).post(`/api/movies/lists/${testList.id}/like`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app)
                    .post("/api/movies/lists/invalid-list-id/like")
                    .set("Authorization", `Bearer ${testUserAToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/i);
            });

            it("should return 404 when user tries to like another user's private list", async () => {
                const privateList = await createTestMovieList(testUserA.id, "custom", {
                    isPrivate: true,
                });

                const response = await request(app)
                    .post(`/api/movies/lists/${privateList.id}/like`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Failed to like the movie list. It may not exist or you may not have permission/i,
                );
            });
        });

        /* ==========================================================================
       DELETE /api/movies/lists/:listId/like
       ========================================================================== */
        describe("DELETE /api/movies/lists/:listId/like", () => {
            it("should unlike movie list successfully and return 200", async () => {
                const likedList = await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app)
                    .delete(`/api/movies/lists/${testList.id}/like`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.listId).toBe(testList.id);
                expect(responseData.isLiked).toBe(false);
            });

            it("should return 404 when user tries to unlike a list they have not liked", async () => {
                await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app)
                    .delete(`/api/movies/lists/${testList.id}/like`)
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(
                    /Failed to unlike the movie list. It may not exist or you may not have permission/i,
                );
            });

            it("should return 401 when authorization token is missing during deletion", async () => {
                await addTestListToLikes(testUserA.id, testList.id);

                const response = await request(app).delete(`/api/movies/lists/${testList.id}/like`);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Access denied. No token provided/i);
            });

            it("should return 400 when listId param is not a valid UUID", async () => {
                const response = await request(app)
                    .delete("/api/movies/lists/invalid-list-id/like")
                    .set("Authorization", `Bearer ${testUserBToken}`);

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid list ID format/i);
            });
        });
    });

    describe("Movie Details Endpoints", () => {
        /* ==========================================================================
       GET /api/movies/:movieId
       ========================================================================== */
        describe("GET /api/movies/:movieId", () => {
            it("should return movie details successfully for unauthenticated/guest user", async () => {
                const response = await request(app).get(`/api/movies/${testMovie.id}`);

                const responseData = response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.id).toBe(testMovie.id);
                expect(responseData.currentUserInteraction).toBe(null);
            });

            it("should return movie details along with current user interaction and review when authenticated", async () => {
                const commentContent = "Incredible cinematic masterpiece!";
                await createTestInteraction(testUserA.id, testMovie.id, {
                    isLiked: true,
                    rating: 9,
                    comment: commentContent,
                });

                const response = await request(app)
                    .get(`/api/movies/${testMovie.id}`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const responseData = response.body.data;
                const userInteraction = responseData.currentUserInteraction;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(responseData.id).toBe(testMovie.id);

                expect(userInteraction).not.toBeNull();
                expect(userInteraction.isLiked).toBe(true);
                expect(userInteraction.rating).toBe(9);
                expect(userInteraction.comment).not.toBeNull();
                expect(userInteraction.comment.content).toBe(commentContent);
            });

            it("should return 404 when movie with valid UUID does not exist", async () => {
                const nonExistentMovieId = "00000000-0000-0000-0000-000000000000";

                const response = await request(app).get(`/api/movies/${nonExistentMovieId}`);

                expect(response.status).toBe(404);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/The movie is not found/i);
            });

            it("should return 400 when movieId param is not a valid UUID", async () => {
                const response = await request(app).get("/api/movies/invalid-movie-id");

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toMatch(/Invalid movie ID format/i);
            });
        });
    });

    /* ==========================================================================
       Movie List Interactions Endpoints
       ========================================================================== */
    describe("Movie List Interactions Endpoints", () => {
        describe("POST /api/movies/lists/:listId/interaction", () => {
            it("should create/update list interaction successfully and return 200", async () => {
                const testList = await createTestMovieList(testUserA.id);
                const commentText = "Harika bir film listesi!";

                const response = await request(app)
                    .post(`/api/movies/lists/${testList.id}/interaction`)
                    .set("Authorization", `Bearer ${testUserAToken}`)
                    .send({
                        rating: 9.5,
                        comment: commentText,
                        isLiked: true,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.movieId).toBe(testList.id);
            });

            it("should return 401 when token is missing", async () => {
                const testList = await createTestMovieList(testUserA.id);

                const response = await request(app)
                    .post(`/api/movies/lists/${testList.id}/interaction`)
                    .send({
                        rating: 8,
                        comment: "Test comment",
                    });

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
            });

            it("should return 400 when invalid listId UUID format is provided", async () => {
                const response = await request(app)
                    .post("/api/movies/lists/invalid-list-id/interaction")
                    .set("Authorization", `Bearer ${testUserAToken}`)
                    .send({
                        rating: 8,
                    });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });
        });

        describe("GET /api/movies/lists/:listId/interactions", () => {
            it("should return list interactions and comments list successfully", async () => {
                const testList = await createTestMovieList(testUserA.id);
                await createTestInteraction(testUserA.id, testList.id, {
                    targetType: "movieList",
                    rating: 9,
                    comment: "Harika liste!",
                    isLiked: true,
                });

                const response = await request(app)
                    .get(`/api/movies/lists/${testList.id}/interactions`)
                    .set("Authorization", `Bearer ${testUserAToken}`);

                const items = response.body.data.items || response.body.data;

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(Array.isArray(items)).toBe(true);
                expect(items.length).toBe(1);
                expect(items[0].comment.content).toBe("Harika liste!");
            });

            it("should return 400 when invalid listId UUID format is provided", async () => {
                const response = await request(app).get(
                    "/api/movies/lists/invalid-list-id/interactions",
                );

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });
        });
    });
});
