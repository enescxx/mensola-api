import { PaginationQueries } from "@/types/track";
import { UserId } from "@/types/user";
import { IPlaylist } from "@/types/music";

export type GetUserPlaylistsDto = PaginationQueries & {
    userId: UserId;
    currentUserId?: UserId;
};

export type GetUserPlaylistsResponseItem = IPlaylist & {
    // any additional fields like songCount? The schema has it?
    // Wait, the initDb says `songCount` is not in the schema, it's just tracks.
    // wait! initDb for Playlist doesn't have songCount.
    songCount?: number;
    containsTrack?: boolean;
};

export type GetUserPlaylistsResponse = GetUserPlaylistsResponseItem[];

export type GetLikedPlaylistsDto = PaginationQueries & {
    userId: UserId;
    currentUserId?: UserId;
};

export type GetLikedPlaylistsResponseItem = IPlaylist & {
    songCount?: number;
    creator?: {
        id: UserId;
        username: string;
        avatar?: string;
    };
};

export type GetLikedPlaylistsResponse = GetLikedPlaylistsResponseItem[];
