import pool from "@/config/db";
import { ApiError } from "@/utils/error";
import { userQueries } from "@/queries/user";
import {
    GetUserProfileDto,
    GetUserProfileResponse,
    ProfileUpdateDto,
    ProfileUpdateResponse,
    GetFollowersDto,
    GetFollowersResponseItem,
    GetFollowersResponse,
    GetFollowingDto,
    GetFollowingResponseItem,
    GetFollowingResponse,
    FollowDto,
    UnfollowDto
} from "@/types/user";

/**
 * Retrieves full user profile information along with statistics and mutual relationship details.
 * Converts raw PostgreSQL numeric counts to standard JavaScript numbers.
 *
 * @param dto - Contains targetUserId and optional viewerId
 * @returns Formatted user profile object
 * @throws ApiError (404) if the user profile does not exist
 */
export const getUserProfile = async (dto: GetUserProfileDto): Promise<GetUserProfileResponse> => {
    const result = await pool.query<GetUserProfileResponse>(userQueries.profile.get, [
        dto.targetUserId,
        dto.viewerId || null
    ]);

    if (result.rows.length === 0) {
        throw new ApiError("Profile not found.", 404);
    }

    const rawData = result.rows[0];

    const profile: GetUserProfileResponse = {
        ...rawData,
        movieListCount: Number(rawData.movieListCount || 0),
        playlistCount: Number(rawData.playlistCount || 0),
        watchlistMoviesCount: Number(rawData.watchlistMoviesCount || 0),
        watchedMoviesCount: Number(rawData.watchedMoviesCount || 0),
        likedMoviesCount: Number(rawData.likedMoviesCount || 0),
        likedTracksCount: Number(rawData.likedTracksCount || 0),
        likedPlaylistsCount: Number(rawData.likedPlaylistsCount || 0),
        likedMovieListsCount: Number(rawData.likedMovieListsCount || 0),
        likedAlbumsCount: Number(rawData.likedAlbumsCount || 0),
        followerCount: Number(rawData.followerCount || 0),
        followingCount: Number(rawData.followingCount || 0)
    };

    // Remove personal relationship context if viewing own profile or visiting unauthenticated
    if (!dto.viewerId || dto.viewerId === dto.targetUserId) {
        delete profile.mutualFollowers;
        delete profile.isFollowingByMe;
    }

    return profile;
};

/**
 * Dynamically updates profile fields (fullname, bio, avatar) for a specific user.
 *
 * @param dto - Contains userId and the fields to update
 * @returns Updated user profile subset
 * @throws ApiError (400) if no fields are provided for update
 * @throws ApiError (404) if the target user is not found
 */
export const profileUpdate = async (dto: ProfileUpdateDto): Promise<ProfileUpdateResponse> => {
    const fields: string[] = [];
    const values: any[] = [];
    let placeholderIndex = 1;

    if (dto.updateData.fullname !== undefined) {
        fields.push(`"fullname" = $${placeholderIndex}`);
        values.push(dto.updateData.fullname);
        placeholderIndex++;
    }
    if (dto.updateData.bio !== undefined) {
        fields.push(`"bio" = $${placeholderIndex}`);
        values.push(dto.updateData.bio);
        placeholderIndex++;
    }
    if (dto.updateData.avatar !== undefined) {
        fields.push(`"avatar" = $${placeholderIndex}`);
        values.push(dto.updateData.avatar);
        placeholderIndex++;
    }

    if (fields.length === 0) {
        throw new ApiError("At least one field must be provided for update.", 400);
    }

    values.push(dto.userId);

    const query = `
        UPDATE "User"
        SET ${fields.join(", ")}
        WHERE "id" = $${placeholderIndex}
        RETURNING id, username, fullname, bio, avatar;
    `;

    const result = await pool.query<ProfileUpdateResponse>(query, values);

    if (result.rows.length === 0) {
        throw new ApiError("User not found.", 404);
    }

    return result.rows[0];
};

/**
 * Retrieves a paginated list of followers for a given user.
 *
 * @param dto - Pagination settings, target user ID, and viewer context
 * @returns Array of follower items with follow status relative to viewer
 * @throws ApiError (400) if targetUserId is missing
 */
export const getFollowers = async (dto: GetFollowersDto): Promise<GetFollowersResponse> => {
    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<GetFollowersResponseItem>(userQueries.relations.getFollowers, [
        dto.targetUserId,
        dto.viewerId || null,
        dto.limit,
        offset
    ]);

    return result.rows;
};

/**
 * Retrieves a paginated list of users that the target user is following.
 *
 * @param dto - Pagination settings, target user ID, and viewer context
 * @returns Array of followed user items with follow status relative to viewer
 * @throws ApiError (400) if targetUserId is missing
 */
export const getFollowing = async (dto: GetFollowingDto): Promise<GetFollowingResponse> => {
    const offset = (dto.page - 1) * dto.limit;

    const result = await pool.query<GetFollowingResponseItem>(userQueries.relations.getFollowing, [
        dto.targetUserId,
        dto.viewerId || null,
        dto.limit,
        offset
    ]);

    return result.rows;
};

/**
 * Creates a follow relationship between two users.
 *
 * @param dto - Contains followerId and followingId
 * @returns Boolean true indicating success
 * @throws ApiError (400) if a user attempts to follow themselves
 */
export const follow = async (dto: FollowDto): Promise<boolean> => {
    if (dto.followerId === dto.followingId) {
        throw new ApiError("You cannot follow yourself.", 400);
    }

    await pool.query(userQueries.actions.follow, [dto.followerId, dto.followingId]);

    return true;
};

/**
 * Removes a follow relationship between two users.
 *
 * @param dto - Contains followerId and followingId
 * @returns Boolean true indicating success
 * @throws ApiError (400) if a user attempts to unfollow themselves
 */
export const unfollow = async (dto: UnfollowDto): Promise<boolean> => {
    if (dto.followerId === dto.followingId) {
        throw new ApiError("You cannot unfollow yourself.", 400);
    }

    await pool.query(userQueries.actions.unfollow, [dto.followerId, dto.followingId]);

    return true;
};
