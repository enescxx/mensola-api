import { Response, NextFunction, Request } from "express";

import { getUserProfile, profileUpdate, getFollowers, getFollowing, follow, unfollow } from "@/services/user.service";

import { sendResponse } from "@/utils/response";

import { TypedRequest, TypedRequestBody, TypedRequestQuery } from "@/types/express.types";
import { ProfileUpdateDto } from "@/types/user.types";
import { UserId } from "@/types/common.types";
import { MESSAGES } from "@/constants/messages";

/**
 * Query parameters contract for paginated list requests
 */
type PaginationQuery = {
    page?: string;
    limit?: string;
    userId?: UserId;
};

/**
 * Fetches the authenticated user's own profile.
 */
const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const profile = await getUserProfile({ targetUserId: userId, viewerId: userId });

        return sendResponse(res, 200, { profile });
    } catch (error) {
        next(error);
    }
};

/**
 * Fetches a target user's profile by URL parameter ID.
 */
const getUserById = async (req: TypedRequest<{ userId: UserId }>, res: Response, next: NextFunction) => {
    try {
        const targetUserId = req.params.userId;
        const viewerId = req.user?.id;

        const profile = await getUserProfile({ targetUserId, viewerId });

        return sendResponse(res, 200, { profile });
    } catch (error) {
        next(error);
    }
};

/**
 * Updates profile fields for the authenticated user.
 */
const updateProfile = async (
    req: TypedRequestBody<ProfileUpdateDto["updateData"]>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;
        const updatedFields = await profileUpdate({
            userId,
            updateData: req.body,
        });

        return sendResponse(res, 200, { user: updatedFields }, MESSAGES.SUCCESS.PROFILE_UPDATED);
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a paginated list of followers for a user.
 */
const getUserFollowers = async (req: TypedRequestQuery<PaginationQuery>, res: Response, next: NextFunction) => {
    try {
        const targetUserId: UserId = (req.query.userId || req.user?.id) as UserId;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const viewerId = req.user?.id;

        const followers = await getFollowers({
            page,
            limit,
            targetUserId,
            viewerId,
        });

        return sendResponse(res, 200, {
            items: followers,
            page,
            limit,
            hasMore: followers.length === limit,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a paginated list of users that a target user is following.
 */
const getUserFollowing = async (req: TypedRequestQuery<PaginationQuery>, res: Response, next: NextFunction) => {
    try {
        const targetUserId = (req.query.userId || req.user?.id) as UserId;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const viewerId = req.user?.id;

        const following = await getFollowing({
            page,
            limit,
            targetUserId,
            viewerId,
        });

        return sendResponse(res, 200, {
            items: following,
            page,
            limit,
            hasMore: following.length === limit,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Creates a follow relationship with the target user.
 */
const followUser = async (req: TypedRequest<{ userId: UserId }>, res: Response, next: NextFunction) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user!.id;

        await follow({ followerId: currentUserId, followingId: targetUserId });

        return sendResponse(res, 201, null, MESSAGES.SUCCESS.USER_FOLLOWED);
    } catch (error) {
        next(error);
    }
};

/**
 * Removes a follow relationship with the target user.
 */
const unfollowUser = async (req: TypedRequest<{ userId: UserId }>, res: Response, next: NextFunction) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user!.id;

        await unfollow({ followerId: currentUserId, followingId: targetUserId });

        return sendResponse(res, 200, null, MESSAGES.SUCCESS.USER_UNFOLLOWED);
    } catch (error) {
        next(error);
    }
};

export { getMe, getUserById, updateProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser };
