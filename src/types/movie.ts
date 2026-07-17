interface IMovie {
    id: string;
    tmdbId: string;
    title: string;
    poster: string;
    releaseDate?: Date | string;
    rating?: number;
    genres?: string[];
    duration?: number;
    createdAt?: Date | string;
}

interface IMovieList {
    id: string;
    title: string;
    description?: string;
    image?: string;
    isPrivate: boolean;
    creatorId: string;
}

interface IMovieListItem {
    movieListId: string;
    movieId: string;
    addedBy: string;
    addedAt?: Date | string;
}

export { IMovie, IMovieList, IMovieListItem };
