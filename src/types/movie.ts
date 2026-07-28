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
    listType?: "custom" | "favorites" | "watchlist";
    creatorId: string;
}

interface IMovieListItem {
    movieListId: string;
    movieId: string;
    addedBy: string;
    addedAt?: Date | string;
}

interface IMovieListOwner {
    movieListId: string;
    userId: string;
}

interface IWatchedMovie {
    userId: string;
    movieId: string;
    watchedAt: Date | string;
}

export { IMovie, IMovieList, IMovieListItem, IMovieListOwner, IWatchedMovie };
