import request from "supertest";
import app from "@/app";

import { IUser } from "@/types/user";
import { IMovie, IMovieList } from "@/types/movie";

import { createTestUser } from "./helpers/auth.helper";
import {
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
});
