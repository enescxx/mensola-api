interface IArtist {
    id: string;
    spotifyId: string;
    name: string;
    image?: string;
    followers?: number;
}

interface IAlbum {
    id: string;
    spotifyId: string;
    title: string;
    image?: string;
    releaseDate?: Date | string;
    songCount?: number;
    createdAt?: Date | string;
}

interface ITrack {
    id: string;
    spotifyId: string;
    title: string;
    duration: number;
    image?: string;
    albumId?: string;
    createdAt?: Date | string;
}

interface IPlaylist {
    id: string;
    title: string;
    description?: string;
    image?: string;
    isPrivate: boolean;
    listType?: "custom" | "favorites";
    creatorId: string;
}

interface ITrackArtist {
    trackId: string;
    artistId: string;
}

interface IAlbumArtist {
    albumId: string;
    artistId: string;
}

interface IPlaylistItem {
    playlistId: string;
    trackId: string;
    addedBy: string;
    addedAt: Date | string;
}

interface IPlaylistOwner {
    playlistId: string;
    userId: string;
}

export { IArtist, IAlbum, ITrack, IPlaylist, ITrackArtist, IAlbumArtist, IPlaylistItem, IPlaylistOwner };
