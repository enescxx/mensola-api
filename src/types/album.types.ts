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

export type GetAlbumTracksDto = PaginationQueries & {
    albumId: string;
    currentUserId?: UserId;
};

export type AlbumTrackResponseItem = {
    id: string;
    spotifyId: string;
    title: string;
    duration: number;
    image?: string;
    albumId?: string;
    createdAt?: Date | string;
    isLiked?: boolean;
    artists?: { id: string; name: string }[];
};

export type GetAlbumTracksResponse = AlbumTrackResponseItem[];

export type LikeAlbumDto = {
    userId: UserId;
    albumId: string;
};

export type UnlikeAlbumDto = LikeAlbumDto;

export type LikeAlbumResponse = {
    albumId: string;
    isLiked: boolean;
};

export type UnlikeAlbumResponse = LikeAlbumResponse;

export type GetAlbumInteractionsDto = PaginationQueries & {
    albumId: string;
};

export type UpsertAlbumInteractionDto = {
    userId: UserId;
    albumId: string;
    rating?: number | null;
    comment?: string | null;
    isLiked?: boolean;
};
