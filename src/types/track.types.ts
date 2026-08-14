import { ITrack } from "@/types/music";
import { UserId } from "@/types/user";

export type PaginationQueries = {
    page: number;
    limit: number;
};

export type GetLikedTracksDto = PaginationQueries & {
    userId?: UserId;
};

export type TrackResponseItem = ITrack & {
    isLiked?: boolean;
};

export type GetLikedTracksResponseItem = TrackResponseItem;
export type GetLikedTracksResponse = GetLikedTracksResponseItem[];

/**
 * Response type for fetching specific track details.
 */
export type GetTrackDetailsResponse = ITrack & {
    artists: {
        id: string;
        name: string;
        avatar?: string;
    }[];
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    currentUserInteraction?: {
        id: string;
        rating?: number | null;
        isLiked?: boolean;
        comment?: {
            id: string;
            content: string;
            date: string;
        } | null;
    } | null;
};

export type GetTrackInteractionsDto = PaginationQueries & {
    trackId: string;
};

export type UpsertTrackInteractionDto = {
    userId: string;
    trackId: string;
    rating?: number;
    comment?: string;
    isLiked?: boolean;
};
