interface IInteraction {
    id: string;
    userId: string;
    targetId: string;
    targetType: "movie" | "track" | "playlist" | "album" | "movieList";
    isLiked: boolean;
    rating?: number;
    interactedAt?: Date | string;
}

interface IComment {
    id: string;
    userId: string;
    interactionId: string;
    parentId?: string;
    content: string;
    createdAt?: Date | string;
    // likesCount?: number;
    // isLikedByMe?: boolean;
}

interface ICommentLike {
    userId: string;
    commentId: string;
    // createdAt?: Date | string;
}

export { IInteraction, IComment, ICommentLike };
