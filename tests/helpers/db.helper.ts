import pool from "@/config/db";
import crypto from "crypto";

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
