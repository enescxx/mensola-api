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
    GetMovieResponse,
    UpdateMovieListDto,
    DeleteListDto,
    GetListByIdDto,
    GetListByIdResponse,
    GetListItemsResponse,
    GetListItemsDto,
    MovieSummary,
    MovieListItemDto,
    LikeMovieListDto,
    LikeMovieListResponse,
    UnlikeMovieListDto,
    UnlikeMovieListResponse,
    LikeMovieDto,
    LikeMovieResponse,
    UnlikeMovieDto,
    UnlikeMovieResponse,
} from "@/types/movie";
import { upsertInteractionComment } from "@/utils/interaction";

/**
 * Retrieves a paginated list of favorite movies for a given user.
 *
 * @param dto - Data transfer object containing userId, page, and limit.
 * @returns Array of favorite movie items.
 * @throws {ApiError} 400 Bad Request if userId is missing.
 */
export const getFavorites = async (dto: GetFavoritesDto): Promise<GetFavoritesResponse> => {
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
    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<MovieSummary>(movieQueries.movies.watchlist.get, [dto.userId, dto.limit, offset]);

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
    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<GetUserListsResponseItem>(movieQueries.lists.getUserLists, [
        dto.userId,
        dto.currentUserId || null,
        dto.limit,
        offset,
        dto.movieId || null,
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
    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<GetLikedListsResponseItem>(movieQueries.lists.likes.get, [
        dto.userId,
        dto.currentUserId || null,
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
    const values = [dto.title, dto.description ?? null, dto.image ?? null, dto.isPrivate ?? null, dto.creatorId];
    const result = await pool.query<IMovieList>(movieQueries.lists.create, values);

    const movieList = result.rows[0];

    if (!movieList) {
        throw new ApiError("ACTION_FAILED_NO_PERMISSION", 500);
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
    const result = await pool.query<GetMovieResponse>(movieQueries.movies.getById, [
        dto.movieId,
        dto.currentUserId || null,
    ]);
    return result.rows[0];
};

/**
 * Adds a specific movie to the authenticated user's watchlist.
 *
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The newly created MovieListItem record representing the watchlist entry.
 */
export const addToWatchlist = async (dto: UserMovieActionDto): Promise<IMovieListItem> => {
    const result = await pool.query<IMovieListItem>(movieQueries.movies.watchlist.add, [dto.userId, dto.movieId]);
    return result.rows[0];
};

/**
 * Completely removes a specific movie from the authenticated user's watchlist.
 * This operation deletes all associated records for that movie in the MovieListItem table.
 *
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The deleted MovieListItem record or null if the movie was not in the watchlist.
 */
export const removeFromWatchlist = async (dto: UserMovieActionDto): Promise<IMovieListItem[]> => {
    const result = await pool.query<IMovieListItem>(movieQueries.movies.watchlist.remove, [dto.userId, dto.movieId]);
    return result.rows;
};

/**
 * Adds a specific movie to the authenticated user's favorites list.
 *
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The newly created MovieListItem record representing the favorite entry.
 */
export const addToFavorites = async (dto: UserMovieActionDto): Promise<IMovieListItem> => {
    const result = await pool.query<IMovieListItem>(movieQueries.movies.favorites.add, [dto.userId, dto.movieId]);
    return result.rows[0];
};

/**
 * Completely removes a specific movie from the authenticated user's favorites list.
 *
 * @param dto - Data transfer object containing userId and movieId.
 * @returns The deleted MovieListItem record or null if the movie was not in the favorites list.
 */
export const removeFromFavorites = async (dto: UserMovieActionDto): Promise<IMovieListItem[]> => {
    const result = await pool.query<IMovieListItem>(movieQueries.movies.favorites.remove, [dto.userId, dto.movieId]);
    return result.rows;
};

/**
 * Updates the details of an existing movie list.
 *
 * @param dto - Data transfer object containing the movie list ID and updated details.
 * @returns The updated MovieList record.
 * @throws {ApiError} 404 Not Found if the movie list does not exist.
 */
export const updateList = async (dto: UpdateMovieListDto): Promise<IMovieList> => {
    const { listId, userId, title, description, image, isPrivate } = dto;

    const result = await pool.query<IMovieList>(movieQueries.lists.update, [
        title ?? null,
        description ?? null,
        image ?? null,
        isPrivate ?? null,
        listId,
        userId,
    ]);
    const updatedList = result.rows[0];

    if (!updatedList) {
        throw new ApiError("NOT_FOUND_OR_NO_PERMISSION", 404);
    }

    return updatedList;
};

/**
 * Deletes a movie list and all associated items.
 *
 * @param dto - Data transfer object containing the movie list ID and user ID.
 * @returns void
 * @throws {ApiError} 404 Not Found if the movie list does not exist or the user is not the creator.
 */
export const deleteList = async (dto: DeleteListDto): Promise<void> => {
    const { listId, userId } = dto;

    const result = await pool.query<IMovieList>(movieQueries.lists.delete, [listId, userId]);
    const deletedList = result.rows[0];

    if (!deletedList) {
        throw new ApiError("NOT_FOUND_OR_NO_PERMISSION", 404);
    }
};

/**
 * Retrieves a movie list by its ID, including owners, preview movies, and latest comments.
 *
 * @param dto - Data transfer object containing the movie list ID and optional user ID for permission checks.
 * @returns The movie list details along with owners, preview movies, and latest comments.
 * @throws {ApiError} 404 Not Found if the movie list does not exist or the user does not have permission to access it.
 */
export const getListById = async (dto: GetListByIdDto): Promise<GetListByIdResponse> => {
    const { listId, userId } = dto;

    const result = await pool.query<GetListByIdResponse>(movieQueries.lists.getById, [listId, userId ?? null]);
    const movieList = result.rows[0];

    if (!movieList) {
        throw new ApiError("NOT_FOUND_OR_NO_PERMISSION", 404);
    }

    return movieList;
};

/**
 * Retrieves all movies within a specific movie list, including their interactions.
 *
 * @param dto - Data transfer object containing the movie list ID and optional user ID for context.
 * @returns An array of movie summary items with interaction details.
 * @throws {ApiError} 404 Not Found if the movie list does not exist or the user does not have permission to access it.
 */
export const getListItems = async (dto: GetListItemsDto): Promise<GetListItemsResponse> => {
    const { listId, userId, page, limit } = dto;

    const offset = (page - 1) * limit;

    const accessResult = await pool.query<{ id: string; hasAccess: boolean }>(movieQueries.lists.checkAccess, [
        listId,
        userId,
    ]);

    if (accessResult.rows.length === 0) {
        throw new ApiError("NOT_FOUND", 404);
    }

    if (!accessResult.rows[0].hasAccess) {
        throw new ApiError("NOT_FOUND_OR_NO_PERMISSION", 404);
    }

    const result = await pool.query<MovieSummary>(movieQueries.lists.items.getMovies, [
        listId,
        userId ?? null,
        limit,
        offset,
    ]);

    return result.rows;
};

/**
 * Retrieves all interactions/comments for a specific movie list.
 */
export const getListInteractions = async (dto: GetListItemsDto) => {
    const { listId, page, limit } = dto;
    const offset = (page - 1) * limit;

    const result = await pool.query(movieQueries.lists.items.getInteractions, [listId, limit, offset]);

    return result.rows;
};

/**
 * Adds a specific movie to a custom movie list.
 *
 * @param dto - Data transfer object containing the movie list ID, movie ID, and user ID of the person adding the movie.
 * @returns The newly created MovieListItem record representing the added movie.
 * @throws {ApiError} 404 Not Found if the movie list does not exist, the movie already exists in the list, or the user does not have permission to modify it.
 */
export const addItemToList = async (dto: MovieListItemDto): Promise<IMovieListItem> => {
    const { listId, movieId, userId } = dto;

    const result = await pool.query<IMovieListItem>(movieQueries.lists.items.addMovie, [listId, movieId, userId]);
    const addedItem = result.rows[0];

    if (!addedItem) {
        throw new ApiError("NOT_FOUND_OR_NO_PERMISSION", 404);
    }

    return addedItem;
};

/**
 * Removes a specific movie from a custom movie list.
 *
 * @param dto - Data transfer object containing the movie list ID, movie ID, and user ID of the person removing the movie.
 * @returns void
 * @throws {ApiError} 404 Not Found if the movie list does not exist, the movie is not in the list, or the user does not have permission to modify it.
 */
export const removeItemFromList = async (dto: MovieListItemDto): Promise<void> => {
    const { listId, movieId, userId } = dto;

    const result = await pool.query<IMovieListItem>(movieQueries.lists.items.removeMovie, [listId, movieId, userId]);
    const removedItems = result.rows;

    if (removedItems.length === 0) {
        throw new ApiError("NOT_FOUND_OR_NO_PERMISSION", 404);
    }
};

/**
 * Likes a specific movie list for the authenticated user.
 *
 * @param dto - Data transfer object containing the userId and listId.
 * @returns An object containing the listId and isLiked status.
 * @throws {ApiError} 404 Not Found if the movie list does not exist or the user does not have permission to like it.
 */
export const likeList = async (dto: LikeMovieListDto): Promise<LikeMovieListResponse> => {
    const { userId, listId } = dto;
    const result = await pool.query<LikeMovieListResponse>(movieQueries.lists.likes.add, [userId, listId]);

    if (result.rowCount === 0) {
        throw new ApiError("ACTION_FAILED_NO_PERMISSION", 404);
    }

    return result.rows[0];
};

/**
 * Unlikes a specific movie list for the authenticated user.
 *
 * @param dto - Data transfer object containing the userId and listId.
 * @returns An object containing the listId and isLiked status.
 * @throws {ApiError} 404 Not Found if the movie list does not exist or the user does not have permission to unlike it.
 */
export const unlikeList = async (dto: UnlikeMovieListDto): Promise<UnlikeMovieListResponse> => {
    const { userId, listId } = dto;
    const result = await pool.query<UnlikeMovieListResponse>(movieQueries.lists.likes.remove, [userId, listId]);

    if (result.rowCount === 0) {
        throw new ApiError("ACTION_FAILED_NO_PERMISSION", 404);
    }

    return result.rows[0];
};

/**
 * Likes a specific movie for the authenticated user.
 *
 * @param dto - Data transfer object containing the userId and movieId.
 * @returns An object containing the movieId and isLiked status.
 * @throws {ApiError} 404 Not Found if the movie does not exist or the user does not have permission to like it.
 */
export const likeMovie = async (dto: LikeMovieDto): Promise<LikeMovieResponse> => {
    const { userId, movieId } = dto;
    const result = await pool.query<LikeMovieResponse>(movieQueries.movies.likes.add, [userId, movieId]);

    if (result.rowCount === 0) {
        throw new ApiError("ACTION_FAILED_NO_PERMISSION", 404);
    }

    return result.rows[0];
};

/**
 * Unlikes a specific movie for the authenticated user.
 *
 * @param dto - Data transfer object containing the userId and movieId.
 * @returns An object containing the movieId and isLiked status.
 * @throws {ApiError} 404 Not Found if the movie does not exist or the user does not have permission to unlike it.
 */
export const unlikeMovie = async (dto: UnlikeMovieDto): Promise<UnlikeMovieResponse> => {
    const { userId, movieId } = dto;
    const result = await pool.query<UnlikeMovieResponse>(movieQueries.movies.likes.remove, [userId, movieId]);

    if (result.rowCount === 0) {
        throw new ApiError("ACTION_FAILED_NO_PERMISSION", 404);
    }

    return result.rows[0];
};

export interface UpsertMovieInteractionDto {
    userId: string;
    movieId: string;
    targetType?: string;
    rating?: number | null;
    comment?: string | null;
    isLiked?: boolean;
}

export const upsertMovieInteraction = async (dto: UpsertMovieInteractionDto) => {
    const { userId, movieId, targetType, rating, comment, isLiked } = dto;
    const ratingVal = typeof rating === "number" && rating >= 0 ? rating : null;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const interactionResult = await client.query(movieQueries.movies.interaction.upsert, [
            userId,
            movieId,
            ratingVal,
            isLiked ?? false,
            targetType || "movie",
        ]);
        const interaction = interactionResult.rows[0];

        const commentData = await upsertInteractionComment(client, interaction.id, userId, comment);

        await client.query(movieQueries.movies.interaction.cleanupEmpty, [interaction.id]);

        await client.query("COMMIT");

        return {
            id: interaction.id,
            movieId,
            rating: interaction.rating,
            isLiked: interaction.isLiked,
            comment: commentData
                ? { id: commentData.id, content: commentData.content, date: commentData.createdAt }
                : null,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};
