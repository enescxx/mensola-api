import { PaginationQueries } from "@/types/track";
import { UserId } from "@/types/user";
import { IPlaylist } from "@/types/music";

type GetUserPlaylistsDto = PaginationQueries & {
    userId: UserId;
    currentUserId?: UserId;
};

type GetUserPlaylistsResponseItem = IPlaylist & {
    songCount?: number;
    containsTrack?: boolean;
};

type GetUserPlaylistsResponse = GetUserPlaylistsResponseItem[];

type GetLikedPlaylistsDto = PaginationQueries & {
    userId: UserId;
    currentUserId?: UserId;
};

type GetLikedPlaylistsResponseItem = IPlaylist & {
    songCount?: number;
    creator?: {
        id: UserId;
        username: string;
        avatar?: string;
    };
};

type GetLikedPlaylistsResponse = GetLikedPlaylistsResponseItem[];

type GetPlaylistItemsDto = PaginationQueries & {
    playlistId: IPlaylist["id"];
    currentUserId?: UserId;
};

type PlaylistItemResponseItem = {
    id: string;
    spotifyId: string;
    title: string;
    duration: number;
    image?: string;
    albumId?: string;
    createdAt?: Date | string;
    addedAt?: Date | string;
    addedBy?: UserId;
    isLiked?: boolean;
    artists?: { id: string; name: string }[];
};

type GetPlaylistItemsResponse = PlaylistItemResponseItem[];

type GetPlaylistDetailsDto = {
    playlistId: IPlaylist["id"];
    currentUserId?: UserId;
};

type GetPlaylistDetailsResponse = IPlaylist & {
    songCount: number;
    creator: {
        id: UserId;
        username: string;
        fullname?: string;
        avatar?: string;
    };
    owners: {
        id: UserId;
        username: string;
        fullname?: string;
        avatar?: string;
    }[];
    isSaved: boolean;
    savesCount: number;
    isLiked: boolean;
    likesCount: number;
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

type GetPlaylistInteractionsDto = PaginationQueries & {
    playlistId: IPlaylist["id"];
};

type UpsertPlaylistInteractionDto = {
    userId: UserId;
    playlistId: IPlaylist["id"];
    rating?: number | null;
    comment?: string | null;
    isLiked?: boolean;
};

type LikePlaylistDto = {
    userId: UserId;
    playlistId: IPlaylist["id"];
};

type UnlikePlaylistDto = LikePlaylistDto;

type LikePlaylistResponse = {
    playlistId: string;
    isLiked: boolean;
};

type UnlikePlaylistResponse = LikePlaylistResponse;

type AddTrackToPlaylistDto = {
    playlistId: string;
    trackId: string;
    userId: UserId;
};

type RemoveTrackFromPlaylistDto = AddTrackToPlaylistDto;

export {
    GetUserPlaylistsDto,
    GetUserPlaylistsResponseItem,
    GetUserPlaylistsResponse,
    GetLikedPlaylistsDto,
    GetLikedPlaylistsResponseItem,
    GetLikedPlaylistsResponse,
    GetPlaylistItemsDto,
    PlaylistItemResponseItem,
    GetPlaylistItemsResponse,
    GetPlaylistDetailsDto,
    GetPlaylistDetailsResponse,
    GetPlaylistInteractionsDto,
    UpsertPlaylistInteractionDto,
    LikePlaylistDto,
    UnlikePlaylistDto,
    LikePlaylistResponse,
    UnlikePlaylistResponse,
    AddTrackToPlaylistDto,
    RemoveTrackFromPlaylistDto,
};
