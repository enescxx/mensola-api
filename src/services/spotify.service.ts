import { IAlbum, IArtist, ITrack } from "@/types/music.types";
import { SearchTrackResult } from "@/types/spotify.types";

let spotifyAccessToken = "";
let tokenExpiresAt = 0;

const getAccessToken = async (): Promise<string> => {
    const now = Date.now();

    if (spotifyAccessToken && now < tokenExpiresAt) {
        return spotifyAccessToken;
    }

    const credentials = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString(
        "base64",
    );

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    spotifyAccessToken = data.access_token;

    tokenExpiresAt = now + (data.expires_in - 300) * 1000;

    return spotifyAccessToken;
};

const getAlbumCover = (images?: Array<{ url: string; height: number; width: number }>) => {
    if (!images || images.length === 0) return undefined;

    const mediumImage = images[1] || images[0];
    return mediumImage.url;
};

export const spotifyService = {
    searchTracks: async (query: string, page: number = 1, limit: number = 10) => {
        const offset = (page - 1) * limit;
        const token = await getAccessToken();

        const res = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );

        const searchData = await res.json();
        const searchDataTracks = searchData.tracks as SearchTrackResult;

        const tracks: Omit<ITrack, "id">[] = searchDataTracks.items.map((item) => {
            let album: Omit<IAlbum, "id"> | undefined;
            if (item.album) {
                album = {
                    spotifyId: item.album.id,
                    title: item.album.name,
                };
            }

            let artists: Omit<IArtist, "id">[] | undefined;
            if (item.artists) {
                artists = item.artists.map((itemArtist) => {
                    const artist: Omit<IArtist, "id"> = {
                        spotifyId: itemArtist.id,
                        name: itemArtist.name,
                    };

                    return artist;
                });
            }

            const track: Omit<ITrack, "id"> & { album?: Omit<IAlbum, "id">; artists?: Omit<IArtist, "id">[] } = {
                spotifyId: item.id,
                title: item.name,
                duration: item.duration_ms,
                image: getAlbumCover(item.album?.images),
                album: album,
                artists: artists,
            };

            return track;
        });

        const hasMore = offset + tracks.length < searchDataTracks.total;
        const totalResults = searchDataTracks.total;

        return { items: tracks, page, limit, hasMore, totalResults };
    },
};
