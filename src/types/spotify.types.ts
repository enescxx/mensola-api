import { SpotifyAlbumId, SpotifyArtistId, SpotifyTrackId } from "./common.types";

export interface ISpotifyArtist {
    id: SpotifyArtistId;
    name: string;
}
export interface ISpotifyAlbum {
    id: SpotifyAlbumId;
    total_tracks?: number;
    images: { url: string; height: number; width: number }[];
    name: string;
    release_date?: string;
    release_date_precision?: string;
    artists?: ISpotifyArtist[];
}
export interface ISpotifyTrack {
    id: SpotifyTrackId;
    name: string;
    duration_ms: number;
    album?: ISpotifyAlbum;
    artists?: ISpotifyArtist[];
}

export type SearchTrackResult = {
    items: ISpotifyTrack[];
    total: number;
    limit?: number;
};
export type GetNewAlbumsResult = {
    items: ISpotifyAlbum[];
    total: number;
    limit?: number;
};
