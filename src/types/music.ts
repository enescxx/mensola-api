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
    releaseDate?: string;
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
    creatorId: string;
}

interface IPlaylistItem {
    playlistId: string;
    trackId: string;
    addedBy: string;
    addedAt?: Date | string;
}

export { IArtist, IAlbum, ITrack, IPlaylist, IPlaylistItem };
