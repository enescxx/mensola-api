import { ArtistSummary, ITrack } from "@/types/music.types";
import { PaginationQueries, TrackId, UserId } from "@/types/common.types";
import { CurrentUserInteraction, InteractionItemResponse } from "@/types/interaction.types";

// ==========================================
// DTOs & Payloads
// ==========================================

export type GetLikedTracksDto = PaginationQueries & { userId?: UserId };
export type GetTrackInteractionsDto = PaginationQueries & { trackId: TrackId; currentUserId?: string };
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
