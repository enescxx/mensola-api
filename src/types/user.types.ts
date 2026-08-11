import { IMovie } from "@/types/movie";
import { ITrack } from "@/types/music";

/*
==========================================================================
                    Core User Entities & Primitives
==========================================================================
*/

/** Core User Domain Model */
interface IUser {
    id: string;
    email: string;
    username: string;
    fullname?: string;
    password?: string;
    bio?: string;
    avatar?: string;
    resetToken?: string;
    resetTokenExpires?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/** Type alias for User ID to maintain a single source of truth */
type UserId = IUser["id"];

/** User Authentication Session Model */
interface ISession {
    id: string;
    userId: UserId;
    refreshToken: string;
    createdAt?: Date | string;
}

/** User Follow Relationship Model */
interface IFollow {
    followerId: UserId;
    followingId: UserId;
    followedAt?: Date | string;
}

/** Aggregated User Statistics & Profile Favorites */
interface IStats {
    movieListCount: number;
    playlistCount: number;
    watchlistMoviesCount: number;
    watchedMoviesCount: number;
    likedMoviesCount: number;
    likedTracksCount: number;
    likedPlaylistsCount: number;
    likedMovieListsCount: number;
    likedAlbumsCount: number;
    followerCount: number;
    followingCount: number;
    favoriteTracks?: ITrack[];
    favoriteMovies?: IMovie[];
}

/*==========================================================================
                    Profile DTOs & Response Contracts
==========================================================================
*/

/** Input parameters for fetching a user profile */
type GetUserProfileDto = {
    targetUserId: UserId;
    viewerId?: UserId;
};

/** Full User Profile Response structure including stats and relationship flags */
type GetUserProfileResponse = IUser &
    IStats & {
        mutualFollowers?: Pick<IUser, "id" | "username" | "fullname">[];
        isFollowingByMe?: boolean;
    };

/** Input payload for updating customizable user profile fields */
type ProfileUpdateDto = {
    userId: UserId;
    updateData: Partial<Pick<IUser, "fullname" | "bio" | "avatar">>;
};

/** Response contract after updating profile fields */
type ProfileUpdateResponse = Pick<IUser, "id" | "username" | "fullname" | "bio" | "avatar">;

/*    
==========================================================================
                    Followers & Following DTOs & Responses
==========================================================================
*/

/** Input parameters for paginated follower/following list queries */
type GetFollowersDto = {
    page: number;
    limit: number;
    targetUserId: UserId;
    viewerId?: UserId;
};

/** Single item representation in a followers list */
type GetFollowersResponseItem = Pick<IUser, "id" | "username" | "fullname" | "avatar"> & {
    isFollowing: boolean;
    isFollower: boolean;
};

/** Array response for followers query */
type GetFollowersResponse = GetFollowersResponseItem[];

/** Input parameters for fetching following list (Identical to GetFollowersDto) */
type GetFollowingDto = GetFollowersDto;

/** Single item representation in a following list */
type GetFollowingResponseItem = GetFollowersResponseItem;

/** Array response for following query */
type GetFollowingResponse = GetFollowingResponseItem[];

/*
==========================================================================
                    Social Action DTOs (Follow / Unfollow)
==========================================================================
*/

/** Payload for initiating a follow relationship */
type FollowDto = {
    followerId: UserId;
    followingId: UserId;
};

/** Payload for removing a follow relationship */
type UnfollowDto = {
    followerId: UserId;
    followingId: UserId;
};

/*
==========================================================================
   Exports
==========================================================================
*/
export {
    // Entities
    IUser,
    UserId,
    ISession,
    IFollow,
    IStats,

    // Profile Contracts
    GetUserProfileDto,
    GetUserProfileResponse,
    ProfileUpdateDto,
    ProfileUpdateResponse,

    // Relation Contracts
    GetFollowersDto,
    GetFollowersResponseItem,
    GetFollowersResponse,
    GetFollowingDto,
    GetFollowingResponseItem,
    GetFollowingResponse,

    // Action Contracts
    FollowDto,
    UnfollowDto
};
