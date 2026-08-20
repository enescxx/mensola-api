import { IMovie } from "@/types/movie.types";
import { ITrack } from "@/types/music.types";
import { SessionId, UserId } from "@/types/common.types";

// ==========================================
// Core Models
// ==========================================

export interface IUser {
    id: UserId;
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

export interface ISession {
    id: SessionId;
    userId: UserId;
    refreshToken: string;
    createdAt?: Date | string;
}

export interface IFollow {
    followerId: UserId;
    followingId: UserId;
    followedAt?: Date | string;
}

export interface IStats {
    movieListCount: number;
    playlistCount: number;
    watchlistMoviesCount: number;
    watchedMoviesCount: number;
    likedMoviesCount: number;
    likedTracksCount: number;
    likedPlaylistsCount: number;
    likedMovieListsCount: number;
    likedAlbumsCount: number;
    followersCount: number;
    followingCount: number;
    favoriteTracks?: ITrack[];
    favoriteMovies?: IMovie[];
}

// ==========================================
// DTOs & Payloads
// ==========================================

export type GetUserProfileDto = { targetUserId: UserId; viewerId?: UserId };
export type ProfileUpdateDto = { userId: UserId; updateData: Partial<Pick<IUser, "fullname" | "bio" | "avatar">> };
export type GetFollowersDto = {
    page: number;
    limit: number;
    targetUserId: UserId;
    viewerId?: UserId;
};
export type GetFollowingDto = GetFollowersDto;
export type FollowDto = { followerId: UserId; followingId: UserId };
export type UnfollowDto = { followerId: UserId; followingId: UserId };

// ==========================================
// API Responses
// ==========================================

export type GetUserProfileResponse = IUser &
    IStats & {
        mutualFollowers?: Pick<IUser, "id" | "username" | "fullname">[];
        isFollowingByMe?: boolean;
    };
export type ProfileUpdateResponse = Pick<IUser, "id" | "username" | "fullname" | "bio" | "avatar">;
export type GetFollowersResponseItem = UserSummary & {
    isFollowing: boolean;
    isFollower: boolean;
};
export type GetFollowersResponse = GetFollowersResponseItem[];
export type GetFollowingResponseItem = GetFollowersResponseItem;
export type GetFollowingResponse = GetFollowingResponseItem[];

// ==========================================
// Shared Projections (DTO / Response Items)
// ==========================================

export type UserSummary = Pick<IUser, "id" | "username" | "fullname" | "avatar">;
