import { UserId } from "@/types/user";

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
    albumId?: IAlbum["id"];
    createdAt?: Date | string;
    artists?: Pick<IArtist, "id" | "name">[];
}

interface IPlaylist {
    id: string;
    title: string;
    description?: string;
    image?: string;
    isPrivate: boolean;
    listType?: "custom" | "favorites";
    creatorId: UserId;
}

interface ITrackArtist {
    trackId: ITrack["id"];
    artistId: IArtist["id"];
}

interface IAlbumArtist {
    albumId: IAlbum["id"];
    artistId: IArtist["id"];
}

interface IPlaylistItem {
    playlistId: IPlaylist["id"];
    trackId: ITrack["id"];
    addedBy: UserId;
    addedAt: Date | string;
}

interface IPlaylistOwner {
    playlistId: IPlaylist["id"];
    userId: UserId;
}

export { IArtist, IAlbum, ITrack, IPlaylist, ITrackArtist, IAlbumArtist, IPlaylistItem, IPlaylistOwner };
