import { Request, Response } from "express";
import {
    fetchAndFormatUserProfile,
    updateFieldsUserProfile,
    fetchFollowers,
    fetchFollowing
} from "../services/user.service";
import pool from "../config/db";

const getMe = async (req: any, res: Response) => {
    const userId = req.user.id;

    try {
        const profile = await fetchAndFormatUserProfile(userId, userId);

        if (!profile) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ success: true, data: { profile } });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getUserById = async (req: any, res: Response) => {
    const targetUserId = req.params.userId;
    const viewerId = req.user ? req.user.id : null;

    try {
        const profile = await fetchAndFormatUserProfile(targetUserId, viewerId);

        if (!profile) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ success: true, data: { profile } });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const updateProfile = async (req: any, res: Response) => {
    const userId = req.user.id;
    const { fullname, bio, avatar } = req.body;

    try {
        const updatedFields = await updateFieldsUserProfile(userId, {
            fullname,
            bio,
            avatar
        });

        if (!updatedFields) {
            return res.status(200).json({
                success: true,
                message: "No changes performed.",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                user: updatedFields
            }
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getUserFollowers = async (req: any, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const targetUserId = req.params.userId;
    const viewerId = req.user ? req.user.id : null;

    try {
        const followers = await fetchFollowers(
            page,
            limit,
            targetUserId,
            viewerId
        );

        return res.status(200).json({
            success: true,
            data: followers,
            page: page,
            limit: limit,
            hasMore: followers.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

const getUserFollowing = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const targetUserId = req.params.userId;
    const viewerId = req.user ? req.user.id : null;

    try {
        const following = await fetchFollowing(
            page,
            limit,
            targetUserId,
            viewerId
        );

        return res.status(200).json({
            success: true,
            data: following,
            page: page,
            limit: limit,
            hasMore: following.length === limit
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, error: { message: "Server Error." } });
    }
};

export {
    getMe,
    getUserById,
    updateProfile,
    getUserFollowers,
    getUserFollowing
};
