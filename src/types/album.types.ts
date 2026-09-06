import { ArtistSummary, IAlbum } from "@/types/music.types";
import { AlbumId, ArtistId, PaginationQueries, SpotifyTrackId, TrackId, UserId } from "@/types/common.types";
import { CurrentUserInteraction, InteractionItemResponse } from "@/types/interaction.types";

// ==========================================
// DTOs & Payloads
// ==========================================

export type GetLikedAlbumsDto = PaginationQueries & { userId: UserId };
export type GetAlbumDetailsDto = { albumId: AlbumId; currentUserId?: UserId };
export type GetAlbumTracksDto = PaginationQueries & { albumId: AlbumId; currentUserId?: UserId };
export type LikeAlbumDto = { userId: UserId; albumId: AlbumId };
export type UnlikeAlbumDto = LikeAlbumDto;
export type GetAlbumInteractionsDto = PaginationQueries & { albumId: AlbumId; currentUserId?: string };

export type UpsertAlbumInteractionDto = {
    userId: UserId;
    albumId: AlbumId;
    rating?: number | null;
    comment?: string | null;
    isLiked?: boolean;
};

// ==========================================
// API Responses
// ==========================================

export type GetLikedAlbumsResponseItem = IAlbum & { isLiked: boolean };
export type GetLikedAlbumsResponse = GetLikedAlbumsResponseItem[];

export type GetAlbumDetailsResponse = IAlbum & {
    artists: { id: ArtistId; name: string; avatar?: string }[];
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    interactions: InteractionItemResponse[];
    currentUserInteraction?: CurrentUserInteraction;
};

export type AlbumTrackResponseItem = {
    id: TrackId;
    spotifyId: SpotifyTrackId;
    title: string;
    duration: number;
    image?: string;
    albumId?: AlbumId;
    createdAt?: Date | string;
    isLiked?: boolean;
    artists?: ArtistSummary[];
};

export type GetAlbumTracksResponse = AlbumTrackResponseItem[];
export type LikeAlbumResponse = { albumId: AlbumId; isLiked: boolean };
export type UnlikeAlbumResponse = LikeAlbumResponse;
