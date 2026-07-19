import { Request, Response } from "express";
import { fetchAndFormatUserProfile } from "../services/user.service";

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

export { getMe, getUserById };
