import { IUser, UserId } from "@/types/user";
import { IInteraction, IComment } from "@/types/interaction";

/* ==========================================================================
   Database Model Interfaces (Entities)
   ========================================================================== */

/**
 * Represents a core Movie entity in the database.
 */
interface IMovie {
    id: string;
    tmdbId: string;
    title: string;
    poster: string;
    releaseDate?: Date | string;
    rating?: number;
    genres?: string[];
    duration?: number;
    createdAt?: Date | string;
}

/**
 * Represents a custom or system-generated Movie List entity.
 */
interface IMovieList {
    id: string;
    title: string;
    description?: string;
    image?: string;
    isPrivate: boolean;
    listType?: "custom" | "favorites" | "watchlist";
    creatorId: string;
}

/**
 * Junction record representing a movie item inside a specific MovieList.
 */
interface IMovieListItem {
    movieListId: string;
    movieId: string;
    addedBy: string;
    addedAt?: Date | string;
}

/**
 * Junction record representing ownership/collaboration permissions for a MovieList.
 */
interface IMovieListOwner {
    movieListId: string;
    userId: string;
}

/**
 * Represents a record of a user having watched a specific movie.
 */
interface IWatchedMovie {
    id: string;
    userId: string;
    movieId: string;
    watchedAt: Date | string;
}

/* ==========================================================================
   Data Transfer Objects (DTOs)
   ========================================================================== */

/**
 * Base query DTO for user-related movie queries with pagination.
 * Note: userId is optional as it can be derived from the auth token or query params.
 */
type BaseUserQueryDto = {
    userId?: UserId;
    page: number;
    limit: number;
};

// Aliases for domain specificity & backward compatibility
type GetFavoritesDto = BaseUserQueryDto;
type GetWatchlistDto = BaseUserQueryDto;
type GetWatchedMoviesDto = BaseUserQueryDto;
type GetLikedMoviesDto = BaseUserQueryDto;
type GetUserListsDto = BaseUserQueryDto;
type GetLikedListsDto = BaseUserQueryDto;

/**
 * Body payload DTO for creating a new custom movie list.
 */
type CreateMovieListDto = Omit<IMovieList, "id">;

/**
 * Data Transfer Object for user-movie interactions.
 * Used for actions like marking as watched, adding to favorites, or liking a movie.
 */
type UserMovieActionDto = {
    userId: UserId;
    movieId: IMovie["id"];
};

/**
 * Data Transfer Object for fetching a specific movie.
 */
type GetMovieDto = {
    movieId: IMovie["id"];
};

/**
 * Data Transfer Object for updating an existing movie list.
 */
type UpdateMovieListDto = Omit<IMovieList, "id" | "creatorId" | "listType"> & {
    listId: IMovieList["id"];
    userId: UserId;
};

/**
 * Data Transfer Object for deleting a specific movie list.
 */
type DeleteListDto = {
    userId: UserId;
    listId: IMovieList["id"];
};

/**
 * Data Transfer Object for fetching a specific movie list by its ID.
 */
type GetListByIdDto = {
    listId: IMovieList["id"];
    userId?: UserId;
};

/* ==========================================================================
   Response Types & Payload Items
   ========================================================================== */

/**
 * Base item structure for user movie library responses (Favorites, Likes, etc.).
 */
type MovieResponseItem = Pick<IMovie, "id" | "title" | "poster"> & {
    rating?: number;
    isLiked?: boolean;
    hasReview?: boolean;
    addedAt?: Date | string;
};

/**
 * Individual item structure for GetFavoritesResponse & GetLikedMoviesResponse payloads.
 */
type GetFavoritesResponseItem = MovieResponseItem;
type GetLikedMoviesResponseItem = MovieResponseItem;

/**
 * Paginated array responses for user favorite & liked movies.
 */
type GetFavoritesResponse = GetFavoritesResponseItem[];
type GetLikedMoviesResponse = GetLikedMoviesResponseItem[];

/**
 * Individual item structure for GetWatchlistResponse payload.
 */
type GetWatchlistResponseItem = Pick<IMovie, "id" | "title" | "poster">;

/**
 * Paginated array response for user watchlist movies.
 */
type GetWatchlistResponse = GetWatchlistResponseItem[];

/**
 * Individual item structure for GetWatchedMoviesResponse payload.
 */
type GetWatchedMoviesResponseItem = Pick<IMovie, "id" | "title" | "poster"> & {
    rating?: number;
    isLiked?: boolean;
    hasReview?: boolean;
    watchedAt?: Date | string;
};

/**
 * Paginated array response for user watched movies history.
 */
type GetWatchedMoviesResponse = GetWatchedMoviesResponseItem[];

/**
 * Preview item structure for movies embedded inside list previews.
 */
type PreviewMoviesItem = Pick<IMovie, "id" | "title" | "poster"> & {
    rating?: number;
    isLiked?: boolean;
};

/**
 * Common item structure for Movie List response payloads (User Lists & Liked Lists).
 */
type MovieListResponseItem = {
    listId: IMovieList["id"];
    listTitle: IMovieList["title"];
    previewMovies: PreviewMoviesItem[];
};

type GetUserListsResponseItem = MovieListResponseItem;
type GetLikedListsResponseItem = MovieListResponseItem;

/**
 * Paginated array responses for custom movie lists.
 */
type GetUserListsResponse = GetUserListsResponseItem[];
type GetLikedListsResponse = GetLikedListsResponseItem[];

/**
 * Represents a user's interaction with a movie, specifically containing their review/comment.
 */
type GetMovieInteractionsItem = Pick<IInteraction, "id" | "isLiked" | "rating"> & {
    user: Pick<IUser, "id" | "username" | "fullname" | "avatar">;
    comment: Pick<IComment, "id" | "content"> & { date: IComment["createdAt"] };
};

/**
 * The response structure for a movie detail request, containing movie data and its recent commented interactions.
 */
type GetMovieResponse = IMovie & {
    interactions: GetMovieInteractionsItem[];
};

/**
 * Represents a simplified comment item with user details and interaction data,
 * used for recent comment previews on a movie list.
 */
type MovieListLatestCommentItem = {
    commentId: string;
    content: string;
    date: Date | string;
    interactionId: string;
    rating: number | null;
    isLiked: boolean;
    user: {
        id: UserId;
        username: string;
        fullname: string;
        avatar: string | null;
    };
};

/**
 * Detailed custom movie list response type returned by the getById query.
 * Extends base IMovieList with populated JSON aggregated fields.
 */
type GetListByIdResponse = IMovieList & {
    owners: Pick<IUser, "id" | "username" | "fullname" | "avatar">[];
    previewMovies: Pick<IMovie, "id" | "title" | "poster">[];
    latestComments: MovieListLatestCommentItem[];
};

/* ==========================================================================
   Exports
   ========================================================================== */

export {
    // Entities
    IMovie,
    IMovieList,
    IMovieListItem,
    IMovieListOwner,
    IWatchedMovie,

    // DTOs
    BaseUserQueryDto,
    CreateMovieListDto,
    GetFavoritesDto,
    GetLikedListsDto,
    GetLikedMoviesDto,
    GetUserListsDto,
    GetWatchedMoviesDto,
    GetWatchlistDto,
    UserMovieActionDto,
    GetMovieDto,
    UpdateMovieListDto,
    DeleteListDto,
    GetListByIdDto,

    // Response Contracts & Payload Items
    MovieResponseItem,
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
    PreviewMoviesItem,
    GetMovieInteractionsItem,
    GetMovieResponse,
    MovieListLatestCommentItem,
    GetListByIdResponse,
};
