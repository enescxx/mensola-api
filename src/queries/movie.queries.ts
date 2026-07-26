const getFavoritesQuery = `
    SELECT
        m.id,
        m.title,
        m.poster,
        m_int.rating,
        COALESCE(m_int."isLiked", false) AS "isLiked",
        mli."addedAt" AS added_at,
        EXISTS (
            SELECT 1 FROM "Comment" c WHERE c."interactionId" = m_int.id
        ) AS "hasReview"
    FROM "MovieList" ml
    JOIN "MovieListItem" mli ON ml.id = mli."movieListId"
    JOIN "Movie" m ON mli."movieId" = m.id
    LEFT JOIN "Interaction" m_int ON m_int."userId" = ml."creatorId" AND m_int."targetId" = m.id
    WHERE ml."listType" = 'favorites' AND ml."creatorId" = $1
    LIMIT $2 OFFSET $3;`;

const getWatchlistQuery = `
    SELECT
        m.id,
        m.title,
        m.poster
    FROM "MovieList" ml
    JOIN "MovieListItem" mli ON ml.id = mli."movieListId"
    JOIN "Movie" m ON mli."movieId" = m.id
    WHERE ml."listType" = 'watchlist' AND ml."creatorId" = $1
    LIMIT $2 OFFSET $3;`;

const getWatchedQuery = `
    SELECT
        m.id,
        m.title,
        m.poster,
        m_int.rating,
        COALESCE(m_int."isLiked", false) AS "isLiked",
        wm."watchedAt" AS watched_at,
        EXISTS (
            SELECT 1 FROM "Comment" c WHERE c."interactionId" = m_int.id
        ) AS "hasReview"
    FROM "WatchedMovie" wm
    JOIN "Movie" m ON wm."movieId" = m.id
    LEFT JOIN "Interaction" m_int ON m_int."userId" = wm."userId" AND m_int."targetId" = m.id
    WHERE wm."userId" = $1
    LIMIT $2 OFFSET $3;`;

const getLikedMoviesQuery = `
    SELECT 
        m.id,
        m.title,
        m.poster,
        m_int.rating,
        true AS "isLiked",
        EXISTS (
            SELECT 1 FROM "Comment" c WHERE c."interactionId" = m_int.id
        ) AS "hasReview"
    FROM "Interaction" m_int
    JOIN "Movie" m ON m.id = m_int."targetId"
    WHERE m_int."userId" = $1 AND m_int."targetType" = 'movie' AND m_int."isLiked" = true
    LIMIT $2 OFFSET $3;`;

const getMovieListsQuery = `
    SELECT
        ml.id AS "listId",
        ml.title AS "listTitle",
        COALESCE(
            json_agg(
                json_build_object(
                    'id', m.id,
                    'title', m.title,
                    'poster', m.poster,
                    'rating', m_int.rating,
                    'isLiked', COALESCE(m_int."isLiked", false),
                    'hasReview', EXISTS (
                        SELECT 1 FROM "Comment" c WHERE c."interactionId" = m_int.id
                    )
                )
            ) FILTER (WHERE m.id IS NOT NULL), 
            '[]'
        ) AS "previewMovies"
    FROM "MovieList" ml
    LEFT JOIN LATERAL (
        SELECT 
            mli."movieId",
            mli."addedAt"
        FROM "MovieListItem" mli
        WHERE mli."movieListId" = ml.id
        ORDER BY mli."addedAt" DESC
        LIMIT 3
    ) preview_movies ON true
    LEFT JOIN "Movie" m ON m.id = preview_movies."movieId"
    LEFT JOIN "Interaction" m_int ON m_int."targetId" = m.id AND m_int."userId" = ml."creatorId"
    WHERE ml."creatorId" = $1 AND ml."listType" = 'custom'
    GROUP BY ml.id
    LIMIT $2 OFFSET $3;`;

const getLikedListsQuery = `
    SELECT
        ml.id AS "listId",
        ml.title AS "listTitle",
        COALESCE(
            json_agg(
                json_build_object(
                    'id', m.id,
                    'title', m.title,
                    'poster', m.poster,
                    'rating', m_int.rating,
                    'isLiked', COALESCE(m_int."isLiked", false),
                    'hasReview', EXISTS (
                        SELECT 1 FROM "Comment" c WHERE c."interactionId" = m_int.id
                    )
                )
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'
        ) AS "previewMovies"
    FROM "Interaction" ml_int
    JOIN "MovieList" ml ON ml.id = ml_int."targetId"
    LEFT JOIN LATERAL (
        SELECT 
            mli."movieId",
            mli."addedAt"
        FROM "MovieListItem" mli
        WHERE mli."movieListId" = ml.id
        ORDER BY mli."addedAt" DESC
        LIMIT 3
    ) preview_movies ON true
    LEFT JOIN "Movie" m ON m.id = preview_movies."movieId"
    LEFT JOIN "Interaction" m_int ON m_int."userId" = ml_int."userId" AND m_int."targetId" = m.id AND m_int."targetType" = 'movie'
    WHERE ml_int."targetType" = 'movieList' AND ml_int."userId" = $1 AND ml_int."isLiked" = true
    GROUP BY ml.id
    LIMIT $2 OFFSET $3;`;

export {
    getFavoritesQuery,
    getWatchlistQuery,
    getWatchedQuery,
    getLikedMoviesQuery,
    getMovieListsQuery,
    getLikedListsQuery
};
