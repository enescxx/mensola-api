import pool from "@/config/db";
import { movieQueries } from "@/queries/movie";
import { ApiError } from "@/utils/error";

// Types & Interfaces
import {
  // Entity Models
  IMovieList,
  IWatchedMovie,
  IMovieListItem,

  // Data Transfer Objects (DTOs)
  CreateMovieListDto,
  GetFavoritesDto,
  GetLikedListsDto,
  GetLikedMoviesDto,
  GetUserListsDto,
  GetWatchedMoviesDto,
  GetWatchlistDto,
  UserMovieActionDto,
  GetMovieDto,

  // Response Contracts & Items
  GetFavoritesResponse,
  GetFavoritesResponseItem,
  GetLikedListsResponse,
  GetLikedListsResponseItem,
  GetLikedMoviesResponse,
  GetLikedMoviesResponseItem,
  GetUserListsResponse,
  GetUserListsResponseItem,
  GetWatchedMoviesResponse,
  GetWatchedMoviesResponseItem,
  GetWatchlistResponse,
  GetWatchlistResponseItem,
  GetMovieResponse,
} from "@/types/movie";

/**
 * Retrieves a paginated list of favorite movies for a given user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of favorite movie items.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getFavorites = async (dto: GetFavoritesDto): Promise<GetFavoritesResponse> => {
  if (!dto.userId) {
    throw new ApiError("userId is invalid", 400);
  }

  const offset = (dto.page - 1) * dto.limit;

  const result = await pool.query<GetFavoritesResponseItem>(movieQueries.movies.favorites.get, [
    dto.userId,
    dto.limit,
    offset,
  ]);

  return result.rows;
};

/**
 * Retrieves a paginated watchlist of movies for a given user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of watchlist movie items.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getWatchlist = async (dto: GetWatchlistDto): Promise<GetWatchlistResponse> => {
  if (!dto.userId) {
    throw new ApiError("userId is invalid", 400);
  }

  const offset = (dto.page - 1) * dto.limit;

  const result = await pool.query<GetWatchlistResponseItem>(movieQueries.movies.watchlist.get, [
    dto.userId,
    dto.limit,
    offset,
  ]);

  return result.rows;
};

/**
 * Retrieves a paginated history of movies watched by a given user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of watched movie items with rating and review state.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getWatched = async (dto: GetWatchedMoviesDto): Promise<GetWatchedMoviesResponse> => {
  if (!dto.userId) {
    throw new ApiError("userId is invalid", 400);
  }

  const offset = (dto.page - 1) * dto.limit;

  const result = await pool.query<GetWatchedMoviesResponseItem>(movieQueries.movies.watched.get, [
    dto.userId,
    dto.limit,
    offset,
  ]);

  return result.rows;
};

/**
 * Retrieves a paginated list of movies liked by a given user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of liked movie items.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getLikedMovies = async (dto: GetLikedMoviesDto): Promise<GetLikedMoviesResponse> => {
  if (!dto.userId) {
    throw new ApiError("userId is invalid", 400);
  }

  const offset = (dto.page - 1) * dto.limit;

  const result = await pool.query<GetLikedMoviesResponseItem>(movieQueries.movies.likes.get, [
    dto.userId,
    dto.limit,
    offset,
  ]);

  return result.rows;
};

/**
 * Retrieves custom movie lists created by a specific user with top 3 preview movies.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of custom movie lists with preview items.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getUserLists = async (dto: GetUserListsDto): Promise<GetUserListsResponse> => {
  if (!dto.userId) {
    throw new ApiError("userId is invalid", 400);
  }

  const offset = (dto.page - 1) * dto.limit;

  const result = await pool.query<GetUserListsResponseItem>(movieQueries.lists.getUserLists, [
    dto.userId,
    dto.limit,
    offset,
  ]);

  return result.rows;
};

/**
 * Retrieves custom movie lists that a given user has liked.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of liked movie lists with preview items.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getLikedLists = async (dto: GetLikedListsDto): Promise<GetLikedListsResponse> => {
  if (!dto.userId) {
    throw new ApiError("userId is invalid", 400);
  }

  const offset = (dto.page - 1) * dto.limit;

  const result = await pool.query<GetLikedListsResponseItem>(movieQueries.lists.likes.get, [
    dto.userId,
    dto.limit,
    offset,
  ]);

  return result.rows;
};

/**
 * Creates a new custom movie list for a user.
 *
 * @param dto - Data transfer object containing title, description, image, isPrivate, and creatorId.
 * @returns The newly created MovieList record.
 * @throws {ApiError} 500 Internal Server Error if list creation fails.
 */
export const createList = async (dto: CreateMovieListDto): Promise<IMovieList> => {
  const values = [dto.title, dto.description, dto.image, dto.isPrivate, dto.creatorId];
  const result = await pool.query<IMovieList>(movieQueries.lists.create, values);

  const movieList = result.rows[0];

  if (!movieList) {
    throw new ApiError("Failed to create movie list.", 500);
  }

  return movieList;
};

/**
 * Marks a movie as watched by adding a record to the WatchedMovie table.
 *
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The newly created WatchedMovie record.
 */
export const markAsWatched = async (dto: UserMovieActionDto): Promise<IWatchedMovie> => {
  const result = await pool.query<IWatchedMovie>(movieQueries.movies.watched.add, [dto.userId, dto.movieId]);
  return result.rows[0];
};

/**
 * Completely removes a movie from the user's watched history.
 * If the user has watched the movie multiple times, this will delete all of those records.
 *
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The deleted WatchedMovie record or null if not found.
 */
export const unmarkAsWatched = async (dto: UserMovieActionDto): Promise<IWatchedMovie[]> => {
  const result = await pool.query<IWatchedMovie>(movieQueries.movies.watched.remove, [dto.userId, dto.movieId]);
  return result.rows;
};

/**
 * Fetches detailed information about a movie by its ID, including up to 3 recent user comments.
 *
 * @param {GetMovieDto} dto - Data transfer object containing the movie ID.
 * @returns {<GetMovieResponse>} The movie details along with its recent interactions.
 */
export const getMovie = async (dto: GetMovieDto): Promise<GetMovieResponse> => {
  const result = await pool.query<GetMovieResponse>(movieQueries.movies.getById, [dto.movieId]);
  return result.rows[0];
};

/**
 * Adds a specific movie to the authenticated user's watchlist.
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The newly created MovieListItem record representing the watchlist entry.
 */
export const addToWatchlist = async (dto: UserMovieActionDto): Promise<IMovieListItem> => {
  const result = await pool.query<IMovieListItem>(movieQueries.movies.watchlist.add, [dto.userId, dto.movieId]);
  return result.rows[0];
};
