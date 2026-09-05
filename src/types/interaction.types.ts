import {
    AlbumId,
    CommentId,
    InteractionId,
    MovieId,
    MovieListId,
    PlaylistId,
    TrackId,
    UserId,
} from "@/types/common.types";
import { UserSummary } from "@/types/user.types";

// ==========================================
// Core Entities & Action Models
// ==========================================

export interface IInteraction {
    id: InteractionId;
    userId: UserId;
    targetId: MovieId | TrackId | PlaylistId | AlbumId | MovieListId;
    targetType: "movie" | "track" | "playlist" | "album" | "movieList";
    isLiked: boolean;
    rating?: number;
    interactedAt?: Date | string;
    updatedAt?: Date | string;
}
export interface IComment {
    id: CommentId;
    userId: UserId;
    interactionId: InteractionId;
    parentId?: CommentId;
    content: string;
    createdAt?: Date | string;
}
export interface ICommentLike {
    userId: UserId;
    commentId: CommentId;
}

// ==========================================
// Shared Projections (DTO / Response Items)
// ==========================================

export type InteractionCommentItem = Pick<IComment, "id" | "content"> & {
    date: IComment["createdAt"];
};
export type CurrentUserInteraction =
    | (Pick<IInteraction, "id" | "rating"> & {
          isLiked?: boolean;
          comment?: InteractionCommentItem | null;
      })
    | null;
export type InteractionItemResponse = Pick<IInteraction, "id" | "rating" | "isLiked"> & {
    user: UserSummary;
    comment: InteractionCommentItem;
};

// ==========================================
// Comment Thread DTOs & Response Types
// ==========================================

/** Query params for fetching a comment thread */
export type GetCommentThreadDto = {
    commentId: CommentId;
    page: number;
    limit: number;
};

/** A single flattened comment item returned in a thread */
export type CommentThreadItem = {
    id: CommentId;
    interactionId: InteractionId;
    parentId: CommentId | null;
    content: string;
    createdAt: Date | string;
    user: Pick<UserSummary, "id" | "username" | "avatar">;
};

/** Pagination metadata included in the thread response */
export type CommentThreadPagination = {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
};

/** Full response payload for GET /comments/:commentId */
export type CommentThreadResponse = {
    interactionId: InteractionId;
    comments: CommentThreadItem[];
    pagination: CommentThreadPagination;
};
