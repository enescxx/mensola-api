import { AlbumId, CommentId, InteractionId, MovieId, MovieListId, PlaylistId, TrackId, UserId } from "@/types/common";
import { UserSummary } from "@/types/user";

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
