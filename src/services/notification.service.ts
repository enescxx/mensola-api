import pool from "@/config/db";
import { notificationQueries } from "@/queries/notification.queries";
import { NotificationsData } from "@/types/notification.types";
import { UserId } from "@/types/common.types";
import { ApiError } from "@/utils/error";

export const getNotificationsData = async (userId: UserId): Promise<NotificationsData> => {
    const result = await pool.query(notificationQueries.getPendingFollowRequests, [userId]);

    const followRequests = result.rows.map((row) => ({
        id: row.id,
        type: "follow_request" as const,
        actor: {
            id: row.actorId,
            username: row.username,
            fullName: row.fullName,
            avatar: row.avatar,
        },
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
        status: "pending" as const,
    }));

    return {
        followRequests,
    };
};

export const acceptFollowRequest = async (currentUserId: UserId, requesterId: UserId) => {
    const result = await pool.query(notificationQueries.acceptFollowRequest, [requesterId, currentUserId]);
    if (result.rowCount === 0) {
        throw new ApiError("NOT_FOUND", 404, "Follow request not found or already handled");
    }
    return { status: "accepted" as const };
};

export const declineFollowRequest = async (currentUserId: UserId, requesterId: UserId) => {
    const result = await pool.query(notificationQueries.declineFollowRequest, [requesterId, currentUserId]);
    if (result.rowCount === 0) {
        throw new ApiError("NOT_FOUND", 404, "Follow request not found or already handled");
    }
    return { status: "declined" as const };
};
