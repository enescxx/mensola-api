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
