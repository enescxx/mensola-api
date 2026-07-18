import { Request, Response } from "express";
import pool from "../config/db";
import { getUserQuery } from "../queries/user.queries";

const getMe = async (req: any, res: Response) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(getUserQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
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

        res.status(200).json({
            success: true,
            data: {
                profile
            }
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

export { getMe };
