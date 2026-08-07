import pool from "@/config/db";
import crypto from "crypto";
import { IMovieList, MovieListType } from "@/types/movie.types";

/**
 * Creates a mock movie directly in the database for testing.
 */
export const createTestMovie = async (overrides = {}) => {
  const movie = {
    id: crypto.randomUUID(),
    tmdbId: crypto.randomUUID(),
    title: "Test Movie",
    poster: "https://example.com/test-poster.jpg",
    ...overrides,
  };

  const query = `
        INSERT INTO "Movie" (id, "tmdbId", "title", "poster") 
        VALUES ($1, $2, $3, $4) RETURNING *;
    `;

  const result = await pool.query(query, [
    movie.id,
    movie.tmdbId,
    movie.title,
    movie.poster,
  ]);

  return result.rows[0];
};

export const addTestMovieToWatched = async (
  userId: string,
  movieId: string,
) => {
  const id = crypto.randomUUID();

  const watchedMovie = { id, userId, movieId, watchedAt: new Date() };

  const query = `
        INSERT INTO "WatchedMovie" (id, "userId", "movieId", "watchedAt")
        VALUES ($1, $2, $3, $4) RETURNING *;`;

  const values = [id, userId, movieId, watchedMovie.watchedAt];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const createTestMovieList = async (
  creatorId: string,
  listType?: MovieListType,
  overrides = {},
) => {
  const id = crypto.randomUUID();

  const movieList = {
    id,
    title: "Test Movie List",
    isPrivate: false,
    listType: listType || "custom",
    creatorId,
    ...overrides,
  };

  const query = `
        INSERT INTO "MovieList" (id, title, "isPrivate", "listType", "creatorId")
        VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

  const values = [
    id,
    movieList.title,
    movieList.isPrivate,
    movieList.listType,
    movieList.creatorId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const addTestMovieToList = async (
  userId: string,
  movieId: string,
  listId: string,
) => {
  const query = `
        INSERT INTO "MovieListItem" ("movieListId", "movieId", "addedBy")
        VALUES ($1, $2, $3) RETURNING *;`;

  const values = [listId, movieId, userId];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const addTestMovieToLikes = async (userId: string, movieId: string) => {
  const id = crypto.randomUUID();

  const query = `
        INSERT INTO "Interaction" ("userId", "targetId", "targetType", "isLiked")
        VALUES ($1, $2, 'movie', true) RETURNING *;`;

  const values = [userId, movieId];

  const result = await pool.query(query, values);
  return result.rows[0];
};
