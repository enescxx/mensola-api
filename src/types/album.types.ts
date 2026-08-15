import { IAlbum } from "@/types/music";
import { PaginationQueries } from "@/types/common";
import { UserId } from "@/types/user";

export type GetLikedAlbumsDto = PaginationQueries & {
    userId: UserId;
};

export type GetLikedAlbumsResponseItem = IAlbum & {
    isLiked: boolean;
};

export type GetLikedAlbumsResponse = GetLikedAlbumsResponseItem[];

export type GetAlbumDetailsDto = {
    albumId: string;
    currentUserId?: UserId;
};

export type GetAlbumDetailsResponse = IAlbum & {
    artists: { id: string; name: string; avatar?: string }[];
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    interactions: {
        id: string;
        user: { id: string; username: string; fullname?: string; avatar?: string };
        rating?: number | null;
        isLiked?: boolean;
        comment: { id: string; content: string; date: string };
    }[];
    currentUserInteraction?: {
        id: string;
        rating?: number | null;
        isLiked?: boolean;
        comment?: { id: string; content: string; date: string } | null;
    } | null;
};
