import pool from "../config/db";
import { getUserQuery } from "../queries/user.queries";

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

export { fetchAndFormatUserProfile };
