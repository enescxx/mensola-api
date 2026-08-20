/**
 * Generic Branded Type helper
 */
export type Brand<K, T extends string> = K & { readonly __brand: T };

// --- User & Auth Identifiers ---
export type UserId = Brand<string, "UserId">;
export type SessionId = Brand<string, "SessionId">;

// --- Social & Engagement Identifiers ---
export type CommentId = Brand<string, "CommentId">;
export type InteractionId = Brand<string, "InteractionId">;

// --- Movie Domain Identifiers ---
export type MovieId = Brand<string, "MovieId">;
export type MovieListId = Brand<string, "MovieListId">;
export type WatchedMovieId = Brand<string, "WatchedMovieId">;
export type TmdbId = Brand<number, "TmdbId">;

// --- Music Domain Identifiers ---
export type TrackId = Brand<string, "TrackId">;
export type PlaylistId = Brand<string, "PlaylistId">;
export type AlbumId = Brand<string, "AlbumId">;
export type ArtistId = Brand<string, "ArtistId">;

// --- External Spotify Identifiers ---
export type SpotifyId = Brand<string, "SpotifyId">;
export type SpotifyTrackId = Brand<string, "SpotifyTrackId">;
export type SpotifyAlbumId = Brand<string, "SpotifyAlbumId">;
export type SpotifyArtistId = Brand<string, "SpotifyArtistId">;

// --- Shared Pagination Query ---
export type PaginationQueries = { page: number; limit: number };
