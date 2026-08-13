import { IAlbum } from "./music.types";
import { PaginationQueries, UserId } from "./common";

export type GetLikedAlbumsDto = PaginationQueries & {
    userId: UserId;
};

export type GetLikedAlbumsResponseItem = IAlbum & {
    isLiked: boolean;
};

export type GetLikedAlbumsResponse = GetLikedAlbumsResponseItem[];
