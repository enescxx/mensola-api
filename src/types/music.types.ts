import {
    AlbumId,
    ArtistId,
    PlaylistId,
    SpotifyAlbumId,
    SpotifyArtistId,
    SpotifyTrackId,
    TrackId,
    UserId,
} from "@/types/common.types";

// ==========================================
// Core Entities
// ==========================================

export interface IArtist {
    id: ArtistId;
    spotifyId: SpotifyArtistId;
    name: string;
    image?: string;
    followers?: number;
}
export interface IAlbum {
    id: AlbumId;
    spotifyId: SpotifyAlbumId;
    title: string;
    image?: string;
    releaseDate?: Date | string;
    songCount?: number;
    createdAt?: Date | string;
}
export interface ITrack {
    id: TrackId;
    spotifyId: SpotifyTrackId;
    title: string;
    duration: number;
    image?: string;
    albumId?: AlbumId;
    createdAt?: Date | string;
}
export interface IPlaylist {
    id: PlaylistId;
    title: string;
    description?: string;
    image?: string;
    isPrivate: boolean;
    listType?: "custom" | "favorites";
    creatorId: UserId;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// ==========================================
// Relational & Pivot Tables
// ==========================================

export interface ITrackArtist {
    trackId: TrackId;
    artistId: ArtistId;
}
export interface IAlbumArtist {
    albumId: AlbumId;
    artistId: ArtistId;
}
export interface IPlaylistItem {
    playlistId: PlaylistId;
    trackId: TrackId;
    addedBy: UserId;
    addedAt: Date | string;
}
export interface IPlaylistOwner {
    playlistId: PlaylistId;
    userId: UserId;
}

// ==========================================
// Shared Projections
// ==========================================

export type ArtistSummary = Pick<IArtist, "id" | "name"> & { avatar?: string };
export type TrackSummary = Pick<ITrack, "id" | "title" | "duration" | "image" | "albumId" | "spotifyId">;
export type PlaylistSummary = Pick<IPlaylist, "id" | "title" | "image" | "isPrivate" | "creatorId">;
export type AlbumSummary = Pick<IAlbum, "id" | "title" | "image">;
