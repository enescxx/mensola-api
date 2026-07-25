import pool from "../config/db";
import {
    getUserQuery,
    getFollowersQuery,
    getFollowingQuery,
    followQuery,
    unfollowQuery
} from "../queries/user.queries";

const fetchAndFormatUserProfile = async (
    targetUserId: string,
    viewerId: string | null = null
) => {
    const result = await pool.query(getUserQuery, [targetUserId, viewerId]);

    if (result.rows.length === 0) {
        return null;
    }

    const rawData = result.rows[0];

    const profile = {
        ...rawData,
        movieListCount: Number(rawData.movieListCount),
        playlistCount: Number(rawData.playlistCount),
        watchlistMoviesCount: Number(rawData.watchlistMoviesCount),
        watchedMoviesCount: Number(rawData.watchedMoviesCount),
        likedMoviesCount: Number(rawData.likedMoviesCount),
        likedTracksCount: Number(rawData.likedTracksCount),
        likedPlaylistsCount: Number(rawData.likedPlaylistsCount),
        likedMovieListsCount: Number(rawData.likedMovieListsCount),
        likedAlbumsCount: Number(rawData.likedAlbumsCount),
        followerCount: Number(rawData.followerCount),
        followingCount: Number(rawData.followingCount)
    };

    if (!viewerId || viewerId === targetUserId) {
        delete profile.mutualFollowers;
        delete profile.isFollowingByMe;
    }

    return profile;
};

const updateFieldsUserProfile = async (
    userId: string,
    updateData: { fullname?: string; bio?: string; avatar?: string }
) => {
    const fields: string[] = [];
    const values: any[] = [];
    let placeholderIndex = 1;

    if (updateData.fullname !== undefined) {
        fields.push(`"fullname" = $${placeholderIndex}`);
        values.push(updateData.fullname);
        placeholderIndex++;
    }
    if (updateData.bio !== undefined) {
        fields.push(`"bio" = $${placeholderIndex}`);
        values.push(updateData.bio);
        placeholderIndex++;
    }
    if (updateData.avatar !== undefined) {
        fields.push(`"avatar" = $${placeholderIndex}`);
        values.push(updateData.avatar);
        placeholderIndex++;
    }

    if (fields.length === 0) {
        return null;
    }

    values.push(userId);

    const query = `
        UPDATE "User"
        SET ${fields.join(", ")}
        WHERE "id" = $${placeholderIndex}
        RETURNING id, username, fullname, bio, avatar;
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

const fetchFollowers = async (
    page: number,
    limit: number,
    targetUserId: string | null = null,
    viewerId: string | null = null
) => {
    const offset = (page - 1) * limit;

    const actualTargetUserId =
        targetUserId && targetUserId !== "me" ? targetUserId : viewerId;

    if (!actualTargetUserId) {
        return [];
    }

    const result = await pool.query(getFollowersQuery, [
        actualTargetUserId,
        viewerId,
        limit,
        offset
    ]);

    return result.rows;
};

const fetchFollowing = async (
    page: number,
    limit: number,
    targetUserId: string | null = null,
    viewerId: string | null = null
) => {
    const offset = (page - 1) * limit;

    const actualTargetUserId =
        targetUserId && targetUserId !== "me" ? targetUserId : viewerId;

    if (!actualTargetUserId) {
        return [];
    }

    const result = await pool.query(getFollowingQuery, [
        actualTargetUserId,
        viewerId,
        limit,
        offset
    ]);

    return result.rows;
};

const follow = async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
        throw new Error("CANNOT_FOLLOW_SELF");
    }

    const result = await pool.query(followQuery, [followerId, followingId]);

    return result.rows[0];
};

const unfollow = async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
        throw new Error("CANNOT_UNFOLLOW_SELF");
    }

    const result = await pool.query(unfollowQuery, [followerId, followingId]);

    return result.rows[0];
};

export {
    fetchAndFormatUserProfile,
    updateFieldsUserProfile,
    fetchFollowers,
    fetchFollowing,
    follow,
    unfollow
};
