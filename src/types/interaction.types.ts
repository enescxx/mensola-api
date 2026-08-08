interface IInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: "movie" | "track" | "playlist" | "album" | "movieList";
  isLiked: boolean;
  rating?: number;
  interactedAt?: Date | string;
  updatedAt?: Date | string;
}

interface IComment {
  id: string;
  userId: string;
  interactionId: string;
  parentId?: string;
  content: string;
  createdAt?: Date | string;
}

interface ICommentLike {
  userId: string;
  commentId: string;
}

export { IInteraction, IComment, ICommentLike };
