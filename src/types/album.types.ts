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
