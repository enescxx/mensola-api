import { UserId } from "./common.types";

export interface FollowRequestActor {
    id: UserId;
    username: string;
    fullName?: string;
    avatar?: string | null;
}

export interface FollowRequestNotification {
    id: string;
    type: "follow_request";
    actor: FollowRequestActor;
    createdAt: string;
    status: "pending";
}

export interface NotificationsData {
    followRequests: FollowRequestNotification[];
}
