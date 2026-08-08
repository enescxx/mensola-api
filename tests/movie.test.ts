import request from "supertest";
import app from "@/app";

import { IUser } from "@/types/user";
import { IMovie, IMovieList } from "@/types/movie";

import { createTestUser } from "./helpers/auth.helper";
import {
  addTestMovieToLikes,
  addTestMovieToList,
  addTestMovieToWatched,
  createTestMovie,
  createTestMovieList,
} from "./helpers/db.helper";

describe("Movie API", () => {
  describe("Watched Movies Endpoints", () => {
    let testUser: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserToken: string;

    let testMovie: Pick<IMovie, "id" | "tmdbId" | "title" | "poster">;

    beforeEach(async () => {
      ({ user: testUser, token: testUserToken } = await createTestUser());

      testMovie = await createTestMovie();
    });

    /* ==========================================================================
       GET /api/movies/watched
       ========================================================================== */
    describe("GET /api/movies/watched", () => {
      it("should return 200 and watched movies list for authenticated user", async () => {
        const watchedMovie = await addTestMovieToWatched(
          testUser.id,
          testMovie.id,
        );

        const response = await request(app)
          .get("/api/movies/watched")
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data.items;

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(responseData[0].id).toBe(testMovie.id);
      });

      it("should return 200 and watched movies when userId query parameter is passed", async () => {
        const watchedMovie = await addTestMovieToWatched(
          testUser.id,
          testMovie.id,
        );

        const response = await request(app).get(
          "/api/movies/watched?userId=" + testUser.id,
        );

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
          .set("Authorization", `Bearer ${testUserToken}`);

        const watchedMovie = response.body.data;

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(watchedMovie.movieId).toBe(testMovie.id);
      });

      it("should return 401 when authorization token is missing", async () => {
        const response = await request(app).post(
          `/api/movies/${testMovie.id}/watched`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });

      it("should return 400 when movieId param is not a valid UUID", async () => {
        const response = await request(app)
          .post("/api/movies/invalid-movie-id/watched")
          .set("Authorization", `Bearer ${testUserToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe("Invalid movie ID format.");
      });
    });

    /* ==========================================================================
       DELETE /api/movies/:movieId/watched
       ========================================================================== */
    describe("DELETE /api/movies/:movieId/watched", () => {
      it("should remove movie from watched history successfully and return 200", async () => {
        await addTestMovieToWatched(testUser.id, testMovie.id);

        const response = await request(app)
          .delete(`/api/movies/${testMovie.id}/watched`)
          .set("Authorization", `Bearer ${testUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toMatch(
          /Movie has been removed from watched history successfully/i,
        );
      });

      it("should return 401 when authorization token is missing during deletion", async () => {
        const response = await request(app).delete(
          `/api/movies/${testMovie.id}/watched`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });
    });
  });

  describe("Watchlist Endpoints", () => {
    let testUser: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserToken: string;

    let testMovie: Pick<IMovie, "id" | "tmdbId" | "title" | "poster">;

    let watchlistData: Pick<
      IMovieList,
      "id" | "title" | "isPrivate" | "listType" | "creatorId"
    >;

    beforeEach(async () => {
      ({ user: testUser, token: testUserToken } = await createTestUser());

      testMovie = await createTestMovie();
      watchlistData = await createTestMovieList(testUser.id, "watchlist");
    });

    /* ==========================================================================
       GET /api/movies/watchlist
       ========================================================================== */
    describe("GET /api/movies/watchlist", () => {
      it("should return 200 and list watchlist movies for authenticated user", async () => {
        await addTestMovieToList(testUser.id, testMovie.id, watchlistData.id);

        const response = await request(app)
          .get("/api/movies/watchlist")
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data.items;

        expect(response.status).toBe(200);
        expect(responseData.length).toBe(1);
        expect(responseData[0].id).toBe(testMovie.id);
      });

      it("should return 200 and watchlist movies when userId query parameter is provided", async () => {
        await addTestMovieToList(testUser.id, testMovie.id, watchlistData.id);

        const response = await request(app).get(
          "/api/movies/watchlist?userId=" + testUser.id,
        );

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
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data;

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(responseData.movieId).toBe(testMovie.id);
        expect(responseData.movieListId).toBe(watchlistData.id);
      });

      it("should return 401 when authorization token is missing", async () => {
        const response = await request(app).post(
          `/api/movies/${testMovie.id}/watchlist`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });

      it("should return 400 when movieId param is not a valid UUID", async () => {
        const response = await request(app)
          .post("/api/movies/invalid-movie-id/watchlist")
          .set("Authorization", `Bearer ${testUserToken}`);

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
        await addTestMovieToList(testUser.id, testMovie.id, watchlistData.id);

        const response = await request(app)
          .delete(`/api/movies/${testMovie.id}/watchlist`)
          .set("Authorization", `Bearer ${testUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toMatch(
          /Movie has been removed from watchlist successfully./i,
        );
      });

      it("should return 401 when authorization token is missing during deletion", async () => {
        const response = await request(app).delete(
          `/api/movies/${testMovie.id}/watchlist`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });
    });
  });

  describe("Favorite Movies Endpoints", () => {
    let testUser: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserToken: string;

    let testMovie: Pick<IMovie, "id" | "tmdbId" | "title" | "poster">;

    let favoritesData: Pick<
      IMovieList,
      "id" | "title" | "isPrivate" | "listType" | "creatorId"
    >;

    beforeEach(async () => {
      ({ user: testUser, token: testUserToken } = await createTestUser());

      testMovie = await createTestMovie();
      favoritesData = await createTestMovieList(testUser.id, "favorites");
    });

    /* ==========================================================================
       GET /api/movies/favorites
       ========================================================================== */
    describe("GET /api/movies/favorites", () => {
      it("should return 200 and list favorite movies for authenticated user", async () => {
        await addTestMovieToList(testUser.id, testMovie.id, favoritesData.id);

        const response = await request(app)
          .get("/api/movies/favorites")
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data.items;

        expect(response.status).toBe(200);
        expect(responseData.length).toBe(1);
        expect(responseData[0].id).toBe(testMovie.id);
      });

      it("should return 200 and favorite movies when userId query parameter is provided", async () => {
        await addTestMovieToList(testUser.id, testMovie.id, favoritesData.id);

        const response = await request(app).get(
          "/api/movies/favorites?userId=" + testUser.id,
        );

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
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data;

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(responseData.movieId).toBe(testMovie.id);
        expect(responseData.movieListId).toBe(favoritesData.id);
      });

      it("should return 401 when authorization token is missing", async () => {
        const response = await request(app).post(
          `/api/movies/${testMovie.id}/favorites`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });

      it("should return 400 when movieId param is not a valid UUID", async () => {
        const response = await request(app)
          .post("/api/movies/invalid-movie-id/favorites")
          .set("Authorization", `Bearer ${testUserToken}`);

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
        await addTestMovieToList(testUser.id, testMovie.id, favoritesData.id);

        const response = await request(app)
          .delete(`/api/movies/${testMovie.id}/favorites`)
          .set("Authorization", `Bearer ${testUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toMatch(
          /Movie has been removed from favorites successfully/i,
        );
      });

      it("should return 401 when authorization token is missing during deletion", async () => {
        const response = await request(app).delete(
          `/api/movies/${testMovie.id}/favorites`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });
    });
  });

  describe("Movie Likes Endpoints", () => {
    let testUser: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserToken: string;

    let testMovie: Pick<IMovie, "id" | "tmdbId" | "title" | "poster">;

    beforeEach(async () => {
      ({ user: testUser, token: testUserToken } = await createTestUser());

      testMovie = await createTestMovie();
    });

    /* ==========================================================================
       GET /api/movies/liked
       ========================================================================== */
    describe("GET /api/movies/liked", () => {
      it("should return 200 and list liked movies for authenticated user", async () => {
        const interaction = await addTestMovieToLikes(
          testUser.id,
          testMovie.id,
        );

        const response = await request(app)
          .get("/api/movies/liked")
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data.items;

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(responseData.length).toBe(1);
        expect(responseData[0].id).toBe(testMovie.id);
        expect(responseData[0].isLiked).toBe(true);
      });

      it("should return 200 and liked movies when userId query parameter is provided", async () => {
        const interaction = await addTestMovieToLikes(
          testUser.id,
          testMovie.id,
        );

        const response = await request(app).get(
          "/api/movies/liked?userId=" + testUser.id,
        );

        const responseData = response.body.data.items;

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(responseData.length).toBe(1);
        expect(responseData[0].id).toBe(testMovie.id);
        expect(responseData[0].isLiked).toBe(true);
      });

      it("should return 400 when neither token nor valid userId query parameter is provided", async () => {
        const response = await request(app).get("/api/movies/liked");

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(/userId is invalid/i);
      });
    });

    /* ==========================================================================
       POST /api/movies/:movieId/like
       ========================================================================== */
    describe("POST /api/movies/:movieId/like", () => {
      it("should like movie successfully and return 201", async () => {
        const response = await request(app)
          .post(`/api/movies/${testMovie.id}/like`)
          .set("Authorization", `Bearer ${testUserToken}`);

        const responseData = response.body.data;

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(responseData.movieId).toBe(testMovie.id);
        expect(responseData.isLiked).toBe(true);
        expect(response.body.message).toMatch(/Movie liked successfully./i);
      });

      it("should return 401 when authorization token is missing", async () => {
        const response = await request(app).post(
          `/api/movies/${testMovie.id}/like`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });

      it("should return 400 when movieId param is not a valid UUID", async () => {
        const response = await request(app)
          .post("/api/movies/invalid-movie-id/like")
          .set("Authorization", `Bearer ${testUserToken}`);

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
        const interaction = await addTestMovieToLikes(
          testUser.id,
          testMovie.id,
        );

        const response = await request(app)
          .delete(`/api/movies/${testMovie.id}/like`)
          .set("Authorization", `Bearer ${testUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toMatch(/Movie unliked successfully/i);
      });

      it("should return 401 when authorization token is missing during deletion", async () => {
        const response = await request(app).delete(
          `/api/movies/${testMovie.id}/like`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });
    });
  });

  describe("List Items Operation Endpoints", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserAToken: string;

    let testUserB: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserBToken: string;

    let testMovie: Pick<IMovie, "id" | "tmdbId" | "title" | "poster">;

    let listData: Pick<
      IMovieList,
      "id" | "title" | "isPrivate" | "listType" | "creatorId"
    >;

    beforeEach(async () => {
      ({ user: testUserA, token: testUserAToken } = await createTestUser());
      ({ user: testUserB, token: testUserBToken } = await createTestUser());

      testMovie = await createTestMovie();
      listData = await createTestMovieList(testUserA.id, "custom");
    });

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

        const response = await request(app).get(
          `/api/movies/lists/${listData.id}/items`,
        );

        const responseData = response.body.data.items;

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(responseData.length).toBe(1);
        expect(responseData[0].id).toBe(testMovie.id);
      });

      it("should return 400 when listId param is not a valid UUID", async () => {
        const response = await request(app).get(
          "/api/movies/lists/invalid-list-id/items",
        );

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
        const response = await request(app).post(
          `/api/movies/lists/${listData.id}/items/${testMovie.id}`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });
    });

    describe("DELETE /api/movies/lists/:listId/items/:movieId", () => {
      it("should remove movie from list successfully and return 200 when called by list owner", async () => {
        await addTestMovieToList(testUserA.id, testMovie.id, listData.id);

        const response = await request(app)
          .delete(`/api/movies/lists/${listData.id}/items/${testMovie.id}`)
          .set("Authorization", `Bearer ${testUserAToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toMatch(
          /Movie has been removed from the list successfully/i,
        );
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
        const response = await request(app).delete(
          `/api/movies/lists/${listData.id}/items/${testMovie.id}`,
        );

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });
    });
  });

  describe("List Operation Endpoints", () => {
    let testUserA: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserAToken: string;

    let testUserB: Pick<IUser, "id" | "email" | "username"> & {
      password: string;
    };
    let testUserBToken: string;

    beforeEach(async () => {
      ({ user: testUserA, token: testUserAToken } = await createTestUser());
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

        const response = await request(app).get(
          "/api/movies/lists?userId=" + testUserA.id,
        );

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

        const response = await request(app).get(
          "/api/movies/lists?userId=invalid-user-id",
        );

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Invalid user ID format. Must be a valid UUID/,
        );
      });

      it("should return 403 when authorization token is invalid or corrupted", async () => {
        const list = await createTestMovieList(testUserA.id, "custom");

        const response = await request(app)
          .get("/api/movies/lists?userId=" + testUserA.id)
          .set("Authorization", "Bearer invalid-user-id");

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Invalid or expired token/i,
        );
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

        const response = await request(app)
          .post("/api/movies/lists")
          .send(list);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Access denied. No token provided/i,
        );
      });

      it("should return 400 when required fields (title) are missing in request body", async () => {
        const list = { description: "Missing title" };

        const response = await request(app)
          .post("/api/movies/lists")
          .send(list)
          .set("Authorization", `Bearer ${testUserAToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toMatch(
          /Title is required and must be a string/i,
        );
      });
    });
  });
});
