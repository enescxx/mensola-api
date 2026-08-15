import { ArtistSummary, ITrack } from "@/types/music";
import { PaginationQueries, TrackId, UserId } from "@/types/common";
import { CurrentUserInteraction, InteractionItemResponse } from "@/types/interaction";

// ==========================================
// DTOs & Payloads
// ==========================================

export type GetLikedTracksDto = PaginationQueries & { userId?: UserId };
export type GetTrackInteractionsDto = PaginationQueries & { trackId: TrackId };
export type UpsertTrackInteractionDto = {
    userId: UserId;
    trackId: TrackId;
    rating?: number;
    comment?: string;
    isLiked?: boolean;
};

// ==========================================
// API Responses
// ==========================================

export type TrackResponseItem = ITrack & { isLiked?: boolean };
export type GetLikedTracksResponseItem = TrackResponseItem;
export type GetLikedTracksResponse = GetLikedTracksResponseItem[];
export type GetTrackDetailsResponse = ITrack & {
    artists: ArtistSummary[];
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    currentUserInteraction?: CurrentUserInteraction;
    interactions: InteractionItemResponse[];
};
