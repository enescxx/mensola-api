export const movieQueries = {
    /* ==========================================================================
       Custom Movie Lists & List Interactions
       ========================================================================== */
    lists: {
        /**
         * Fetches custom movie lists created by a specific user with top 3 preview movies
         * and user's movie interaction details (rating, like status, review existence).
         */
        getUserLists: `
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
            LIMIT $2 OFFSET $3;`,

        getById: ``,

        /**
         * Inserts a new custom movie list into the database and returns created record.
         */
        create: `
            INSERT INTO "MovieList" (id, title, description, image, "isPrivate","creatorId") 
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) 
            RETURNING id, title, description, image, "isPrivate","creatorId";`,

        update: ``,
        delete: ``,

        items: {
            getMovies: ``,
            addMovie: ``,
            removeMovie: ``,
        },

        likes: {
            /**
             * Fetches custom movie lists that a user has liked, including list metadata,
             * top 3 preview movies, and user's movie interaction states.
             */
            get: `
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
                LIMIT $2 OFFSET $3;`,

            add: ``,
            remove: ``,
        },
    },

    /* ==========================================================================
       Movie Library & User Interactions
       ========================================================================== */
    movies: {
        /**
         * Fetches all details of a specific movie by its ID, including up to 3 recent
         * top-level user interactions that have a comment.
         */
        getById: `
            SELECT 
                m.*,
                COALESCE(interactions_data.interactions, '[]') AS interactions
            FROM "Movie" m
            LEFT JOIN LATERAL (
                SELECT json_agg(
                    json_build_object(
                        'id', int_data.id,
                        'user', json_build_object(
                            'id', int_data.uid,
                            'username', int_data.username,
                            'fullname', int_data.fullname,
                            'avatar', int_data.avatar
                        ),
                        'rating', int_data."rating",
                        'isLiked', COALESCE(int_data."isLiked", false),
                        'comment', json_build_object(
                            'id', int_data.cid,
                            'content', int_data.content,
                            'date', int_data."createdDate"
                        )
                    )
                ) AS interactions
                FROM (
                    SELECT 
                        m_int.id, 
                        m_int."rating", 
                        m_int."isLiked",
                        c.id AS cid, 
                        c.content, 
                        c."createdDate",
                        u.id AS uid, 
                        u.username, 
                        u.fullname, 
                        u.avatar
                    FROM "Interaction" m_int
                    JOIN "Comment" c ON c."interactionId" = m_int.id AND c."parentId" IS NULL
                    LEFT JOIN "User" u ON u.id = m_int."userId"
                    WHERE m_int."targetId" = m.id AND m_int."targetType" = 'movie'
                    ORDER BY c."createdDate" DESC -- En yeni yorumlar gelsin diye ekleyebilirsin
                    LIMIT 3
                ) int_data
            ) interactions_data ON true
            WHERE m.id = $1;`,

        /**
         * Watchlist management (System MovieList where listType = 'watchlist')
         */
        watchlist: {
            /**
             * Retrieves a paginated list of movies from the user's system Watchlist.
             */
            get: `
                SELECT
                    m.id,
                    m.title,
                    m.poster
                FROM "MovieList" ml
                JOIN "MovieListItem" mli ON ml.id = mli."movieListId"
                JOIN "Movie" m ON mli."movieId" = m.id
                WHERE ml."listType" = 'watchlist' AND ml."creatorId" = $1
                LIMIT $2 OFFSET $3;`,

            /**
             * Inserts a new record into the MovieListItem table to add a movie to the user's watchlist.
             * Returns the newly created row.
             */
            add: `
                INSERT INTO "MovieListItem" (id, "movieListId", "movieId", "addedAt")
                VALUES (gen_random_uuid(), (SELECT id FROM "MovieList" WHERE "listType" = 'watchlist' AND "creatorId" = $1), $2, NOW())
                RETURNING *;`,

            /**
             * Completely removes a movie from the user's watchlist by deleting all associated records
             * for that specific movie in the MovieListItem table.
             */
            remove: `
                DELETE FROM "MovieListItem"
                WHERE "movieListId" = (SELECT id FROM "MovieList" WHERE "listType" = 'watchlist' AND "creatorId" = $1) AND "movieId" = $2
                RETURNING *;`,
        },

        /**
         * Watched movies history
         */
        watched: {
            /**
             * Retrieves a paginated list of movies the user has watched, along with
             * watched date, rating, like status, and review existence.
             */
            get: `
                SELECT
                    m.id,
                    m.title,
                    m.poster,
                    m_int.rating,
                    COALESCE(m_int."isLiked", false) AS "isLiked",
                    wm."watchedAt" AS "watchedAt",
                    EXISTS (
                        SELECT 1 FROM "Comment" c WHERE c."interactionId" = m_int.id
                    ) AS "hasReview"
                FROM "WatchedMovie" wm
                JOIN "Movie" m ON wm."movieId" = m.id
                LEFT JOIN "Interaction" m_int ON m_int."userId" = wm."userId" AND m_int."targetId" = m.id
                WHERE wm."userId" = $1
                LIMIT $2 OFFSET $3;`,

            /**
             * Inserts a new record into the WatchedMovie table to mark a movie as watched
             * and returns the newly created row.
             */
            add: `
                INSERT INTO "WatchedMovie" (id, "userId", "movieId", "watchedAt")
                VALUES (gen_random_uuid(), $1, $2, NOW())
                RETURNING *`,

            /**
             * Completely removes a movie from the user's watched history by deleting
             * all associated watch records for that specific movie.
             */
            remove: `
                DELETE FROM "WatchedMovie"
                WHERE "userId" = $1 AND "movieId" = $2
                RETURNING *;`,
        },

        /**
         * Favorite movies (System MovieList where listType = 'favorites')
         */
        favorites: {
            /**
             * Retrieves a paginated list of user's favorite movies from their system Favorites list.
             */
            get: `
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
                LIMIT $2 OFFSET $3;`,

            /**
             * Inserts a new record into the MovieListItem table to add a movie to the user's favorites list.
             * Returns the newly created row.
             */
            add: `
                INSERT INTO "MovieListItem" (id, "movieListId", "movieId", "addedAt")
                VALUES (gen_random_uuid(), (SELECT id FROM "MovieList" WHERE "listType" = 'favorites' AND "creatorId" = $1), $2, NOW())
                RETURNING *;`,

            /**
             * Completely removes a movie from the user's favorites list by deleting all associated records
             * for that specific movie in the MovieListItem table.
             */
            remove: `
                DELETE FROM "MovieListItem"
                WHERE "movieListId" = (SELECT id FROM "MovieList" WHERE "listType" = 'favorites' AND "creatorId" = $1) AND "movieId" = $2
                RETURNING *;`,
        },

        /**
         * Liked movies (Interaction table where targetType = 'movie' and isLiked = true)
         */
        likes: {
            /**
             * Retrieves a paginated list of movies the user has liked via Interaction records.
             */
            get: `
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
                LIMIT $2 OFFSET $3;`,

            add: ``,
            remove: ``,
        },
    },
};
