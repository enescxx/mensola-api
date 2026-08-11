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
                EXISTS (
                    SELECT 1 FROM "MovieListItem" mli
                    WHERE mli."movieListId" = ml.id AND ($5::uuid IS NOT NULL AND mli."movieId" = $5::uuid)
                ) AS "containsMovie",
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
            WHERE ml."creatorId" = $1 
                AND ml."listType" = 'custom' 
                AND (ml."isPrivate" = false OR $1 = $2)
            GROUP BY ml.id
            ORDER BY ml."createdAt" DESC
            LIMIT $3 OFFSET $4;`,

        /**
         * Fetches a specific custom movie list by its ID, including list metadata,
         * top 3 preview movies, list owners, and up to 3 recent top-level comments.
         */
        getById: `
            SELECT 
                ml.*,
                COALESCE(list_owners.owners, '[]'::json) AS "owners",
                COALESCE(preview_movies.movies, '[]'::json) AS "previewMovies",
                COALESCE(latest_comments.comments, '[]'::json) AS "latestComments"
            FROM "MovieList" ml

            LEFT JOIN LATERAL (
                SELECT json_agg(ml_owners) AS owners
                FROM (
                    SELECT 
                        u.id AS "id",
                        u.username AS "username",
                        u.fullname AS "fullname",
                        u.avatar AS "avatar"
                    FROM "MovieListOwner" mlo
                    JOIN "User" u ON u.id = mlo."userId"
                    WHERE mlo."movieListId" = ml.id
                ) ml_owners
            ) list_owners ON true
            
            LEFT JOIN LATERAL (
                SELECT json_agg(pm) AS movies
                FROM (
                    SELECT
                        m.id AS "id",
                        m.title AS "title",
                        m.poster AS "poster"
                    FROM "MovieListItem" mli
                    JOIN "Movie" m ON m.id = mli."movieId"
                    WHERE mli."movieListId" = ml.id
                    ORDER BY mli."addedAt" DESC
                    LIMIT 3
                ) pm
            ) preview_movies ON true
            
            LEFT JOIN LATERAL (
                SELECT json_agg(
                    json_build_object(
                        'commentId', lc."commentId",
                        'content', lc.content,
                        'date', lc."createdAt",
                        'interactionId', lc."interactionId",
                        'rating', lc."rating",
                        'isLiked', lc."isLiked",
                        'user', json_build_object(
                            'id', lc."userId",
                            'username', lc.username,
                            'fullname', lc.fullname,
                            'avatar', lc.avatar
                        )
                    )
                ) AS comments
                FROM (
                    SELECT 
                        c.id AS "commentId",
                        c.content, 
                        c."createdAt",
                        m_int.id AS "interactionId", 
                        m_int."rating", 
                        COALESCE(m_int."isLiked", false) AS "isLiked",
                        int_u.id AS "userId", 
                        int_u.username, 
                        int_u.fullname, 
                        int_u.avatar
                    FROM "Comment" c
                    JOIN "Interaction" m_int ON c."interactionId" = m_int.id
                    JOIN "User" int_u ON int_u.id = m_int."userId" 
                    WHERE m_int."targetId" = ml.id 
                    AND m_int."targetType" = 'movieList'
                    AND c."parentId" IS NULL
                    ORDER BY c."createdAt" DESC
                    LIMIT 3
                ) lc
            ) latest_comments ON true

            WHERE ml.id = $1 
                AND ml."listType" = 'custom'
                AND (
                    ml."isPrivate" = false 
                    OR ($2::uuid IS NOT NULL AND (
                        ml."creatorId" = $2 
                        OR EXISTS (
                            SELECT 1 FROM "MovieListOwner" mlo 
                            WHERE mlo."movieListId" = ml.id AND mlo."userId" = $2
                        )
                    ))
                );`,

        /**
         * Inserts a new custom movie list into the database and returns created record.
         */
        create: `
            INSERT INTO "MovieList" (id, title, description, image, "isPrivate","creatorId") 
            VALUES (gen_random_uuid(), $1, $2, $3, COALESCE($4, false), $5) 
            RETURNING id, title, description, image, "isPrivate","creatorId";`,

        /**
         * Updates an existing custom movie list, allowing for modification of its title, description, image, and privacy status.
         * Returns the updated record.
         */
        update: `
            UPDATE "MovieList" ml
            SET 
                title = COALESCE($1, ml.title),
                description = COALESCE($2, ml.description),
                image = COALESCE($3, ml.image),
                "isPrivate" = COALESCE($4, ml."isPrivate")
            WHERE ml.id = $5 
              AND ml."listType" = 'custom'
              AND (
                  ml."creatorId" = $6 
                  OR EXISTS (
                      SELECT 1 FROM "MovieListOwner" mlo 
                      WHERE mlo."movieListId" = ml.id AND mlo."userId" = $6
                  )
              )
            RETURNING ml.*;`,

        /**
         * Completely removes a custom movie list by deleting the associated record
         * in the MovieList table, ensuring that only the list creator or an owner can perform this action.
         */
        delete: `
            DELETE FROM "MovieList" ml
            WHERE ml.id = $1 
              AND ml."listType" = 'custom'
              AND ml."creatorId" = $2
            RETURNING *;`,

        items: {
            /**
             * Fetches all movies contained in a specific custom movie list, including
             * user's interaction details (rating, like status, review existence).
             */
            getMovies: `
                SELECT
                    m.id,
                    m.title,
                    m.poster
                FROM "MovieList" ml
                JOIN "MovieListItem" mli ON ml.id = mli."movieListId"
                JOIN "Movie" m ON mli."movieId" = m.id
                WHERE ml.id = $1
                    AND ml."listType" = 'custom'
                    AND (
                        ml."isPrivate" = false 
                        OR ($2::uuid IS NOT NULL AND (
                            ml."creatorId" = $2 
                            OR EXISTS (
                                SELECT 1 FROM "MovieListOwner" mlo 
                                WHERE mlo."movieListId" = ml.id AND mlo."userId" = $2
                            )
                        ))
                    )
                LIMIT $3 OFFSET $4;`,

            /**
             * Inserts a new record into the MovieListItem table to add a movie to a specific custom movie list.
             * Returns the newly created row.
             */
            addMovie: `
                INSERT INTO "MovieListItem" ("movieListId", "movieId", "addedBy")
                SELECT $1, $2, $3
                FROM "MovieList" ml
                WHERE ml.id = $1 
                AND (
                    ml."creatorId" = $3 
                    OR EXISTS (
                        SELECT 1 FROM "MovieListOwner" mlo 
                        WHERE mlo."movieListId" = ml.id AND mlo."userId" = $3
                    )
                )
                ON CONFLICT ("movieListId", "movieId") DO NOTHING
                RETURNING "movieListId", "movieId", "addedBy", "addedAt";`,

            /**
             * Completely removes a movie from a specific custom movie list by deleting the associated record
             * in the MovieListItem table, ensuring that only the list creator or an owner can perform this action.
             */
            removeMovie: `
                DELETE FROM "MovieListItem"
                WHERE "movieListId" = $1 
                  AND "movieId" = $2
                  AND EXISTS (
                      SELECT 1 FROM "MovieList" ml
                      WHERE ml.id = $1 AND (
                          ml."creatorId" = $3 
                          OR EXISTS (
                              SELECT 1 FROM "MovieListOwner" mlo 
                              WHERE mlo."movieListId" = ml.id AND mlo."userId" = $3
                          )
                      )
                  )
                RETURNING *;`,
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
                WHERE ml_int."targetType" = 'movieList' 
                    AND ml_int."userId" = $1 
                    AND ml_int."isLiked" = true
                    AND (ml."isPrivate" = false OR ml."creatorId" = $2)
                GROUP BY ml.id
                LIMIT $3 OFFSET $4;`,

            /**
             * Inserts a new record into the Interaction table to mark a custom movie list as liked by the user.
             * If the user has already liked the list, it updates the existing record to ensure isLiked is true.
             */
            add: `
                INSERT INTO "Interaction" ("userId", "targetId", "targetType", "isLiked")
                SELECT $1, ml.id, 'movieList', true
                FROM "MovieList" ml
                WHERE ml.id = $2
                    AND (ml."isPrivate" = false OR ml."creatorId" = $1)
                    ON CONFLICT ("userId", "targetId", "targetType") 
                DO UPDATE SET "isLiked" = true
                RETURNING "targetId" AS "listId", "isLiked";`,

            /**
             * Updates the Interaction table to mark a custom movie list as unliked by the user.
             * If the user has not liked the list before, it does nothing.
             */
            remove: `
                UPDATE "Interaction"
                SET "isLiked" = false
                WHERE "userId" = $1 AND "targetId" = $2 AND "targetType" = 'movieList'
                RETURNING "targetId" AS "listId", "isLiked";`,
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
                EXISTS (SELECT 1 FROM "WatchedMovie" wm WHERE wm."movieId" = m.id AND wm."userId" = $2::uuid) AS "isWatched",
                EXISTS (
                    SELECT 1 FROM "MovieListItem" mli
                    JOIN "MovieList" ml ON ml.id = mli."movieListId"
                    WHERE mli."movieId" = m.id AND ml."creatorId" = $2::uuid
                ) AS "isInList",
                EXISTS (
                    SELECT 1 FROM "MovieListItem" mli
                    JOIN "MovieList" ml ON ml.id = mli."movieListId"
                    WHERE mli."movieId" = m.id AND ml."creatorId" = $2::uuid AND ml."listType" = 'watchlist'
                ) AS "isWatchlisted",
                (SELECT COUNT(*)::int FROM "Interaction" i WHERE i."targetId" = m.id AND i."targetType" = 'movie' AND i."isLiked" = true) AS "likesCount",
                (SELECT COUNT(*)::int FROM "Comment" c JOIN "Interaction" i ON c."interactionId" = i.id WHERE i."targetId" = m.id AND i."targetType" = 'movie') AS "commentsCount",
                COALESCE(interactions_data.interactions, '[]') AS interactions,
                user_int.user_interaction AS "currentUserInteraction"
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
                            'date', int_data."createdAt"
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
                        c."createdAt",
                        u.id AS uid, 
                        u.username, 
                        u.fullname, 
                        u.avatar
                    FROM "Interaction" m_int
                    JOIN "Comment" c ON c."interactionId" = m_int.id AND c."parentId" IS NULL
                    LEFT JOIN "User" u ON u.id = m_int."userId"
                    WHERE m_int."targetId" = m.id AND m_int."targetType" = 'movie'
                    ORDER BY c."createdAt" DESC
                    LIMIT 3
                ) int_data
            ) interactions_data ON true

            LEFT JOIN LATERAL (
                SELECT json_build_object(
                    'id', cu_int.id,
                    'rating', cu_int."rating",
                    'isLiked', COALESCE(cu_int."isLiked", false),
                    'comment', (
                        SELECT json_build_object(
                            'id', c.id,
                            'content', c.content,
                            'date', c."createdAt"
                        )
                        FROM "Comment" c
                        WHERE c."interactionId" = cu_int.id AND c."parentId" IS NULL
                        LIMIT 1
                    )
                ) AS user_interaction
                FROM "Interaction" cu_int
                WHERE cu_int."targetId" = m.id
                    AND cu_int."targetType" = 'movie'
                    AND cu_int."userId" = $2::uuid
            ) user_int ON ($2::uuid IS NOT NULL)
                           
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
                INSERT INTO "MovieListItem" ("movieListId", "movieId", "addedBy", "addedAt")
                VALUES ((SELECT id FROM "MovieList" WHERE "listType" = 'watchlist' AND "creatorId" = $1 ORDER BY "createdAt" ASC LIMIT 1), $2, $1, NOW())
                ON CONFLICT ("movieListId", "movieId") DO NOTHING
                RETURNING *;`,

            /**
             * Completely removes a movie from the user's watchlist by deleting all associated records
             * for that specific movie in the MovieListItem table.
             */
            remove: `
                DELETE FROM "MovieListItem"
                WHERE "movieListId" IN (SELECT id FROM "MovieList" WHERE "listType" = 'watchlist' AND "creatorId" = $1) AND "movieId" = $2
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
                INSERT INTO "MovieListItem" ("movieListId", "movieId", "addedBy", "addedAt")
                VALUES ((SELECT id FROM "MovieList" WHERE "listType" = 'favorites' AND "creatorId" = $1 ORDER BY "createdAt" ASC LIMIT 1), $2, $1, NOW())
                RETURNING *;`,

            /**
             * Completely removes a movie from the user's favorites list by deleting all associated records
             * for that specific movie in the MovieListItem table.
             */
            remove: `
                DELETE FROM "MovieListItem"
                WHERE "movieListId" IN (SELECT id FROM "MovieList" WHERE "listType" = 'favorites' AND "creatorId" = $1) AND "movieId" = $2
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

            /**
             * Inserts a new record into the Interaction table to mark a movie as liked by the user.
             * If the user has already liked the movie, it updates the existing record to ensure isLiked is true.
             */
            add: `
                INSERT INTO "Interaction" ("userId", "targetId", "targetType", "isLiked")
                VALUES ($1, $2, 'movie', true)
                ON CONFLICT ("userId", "targetId", "targetType") DO UPDATE SET "isLiked" = true
                RETURNING "targetId" AS "movieId", "isLiked";`,

            /**
             * Removes a movie from the user's liked movies.
             * If the interaction has no rating or comments, the interaction row is deleted.
             * If it has a rating or comments, isLiked is set to false to preserve the interaction.
             */
            remove: `
                WITH target_interaction AS (
                    SELECT i.id, i.rating,
                           EXISTS (SELECT 1 FROM "Comment" c WHERE c."interactionId" = i.id) AS has_comment
                    FROM "Interaction" i
                    WHERE i."userId" = $1 AND i."targetId" = $2 AND i."targetType" = 'movie'
                ),
                deleted AS (
                    DELETE FROM "Interaction" i
                    USING target_interaction ti
                    WHERE i.id = ti.id
                      AND ti.rating IS NULL
                      AND NOT ti.has_comment
                    RETURNING i."targetId" AS "movieId", false AS "isLiked"
                ),
                updated AS (
                    UPDATE "Interaction" i
                    SET "isLiked" = false
                    FROM target_interaction ti
                    WHERE i.id = ti.id
                      AND (ti.rating IS NOT NULL OR ti.has_comment)
                    RETURNING i."targetId" AS "movieId", i."isLiked"
                )
                SELECT * FROM deleted
                UNION ALL
                SELECT * FROM updated;`,
        },

        /**
         * Full movie interaction (rating, comment, isLiked)
         */
        interaction: {
            upsert: `
                INSERT INTO "Interaction" ("userId", "targetId", "targetType", "rating", "isLiked", "updatedAt")
                VALUES ($1, $2, 'movie', $3, COALESCE($4, false), NOW())
                ON CONFLICT ("userId", "targetId", "targetType") DO UPDATE
                SET "rating" = EXCLUDED."rating",
                    "isLiked" = COALESCE($4, "Interaction"."isLiked"),
                    "updatedAt" = NOW()
                RETURNING id, "userId", "targetId", "targetType", "rating", "isLiked", "interactedAt", "updatedAt";`,

            /**
             * Inserts or updates a top-level review/comment for an interaction.
             */
            upsertComment: `
                WITH existing AS (
                    SELECT id FROM "Comment" WHERE "interactionId" = $1 AND "parentId" IS NULL
                ),
                updated AS (
                    UPDATE "Comment"
                    SET "content" = $2
                    WHERE "interactionId" = $1 AND "parentId" IS NULL
                    RETURNING id, "userId", "interactionId", "content", "createdAt"
                )
                INSERT INTO "Comment" (id, "userId", "interactionId", "content", "createdAt")
                SELECT gen_random_uuid(), $3, $1, $2, NOW()
                WHERE NOT EXISTS (SELECT 1 FROM existing)
                UNION ALL
                SELECT id, "userId", "interactionId", "content", "createdAt" FROM updated;`,

            /**
             * Deletes top-level review/comment for an interaction.
             */
            deleteComment: `
                DELETE FROM "Comment"
                WHERE "interactionId" = $1 AND "parentId" IS NULL;`,

            /**
             * Cleans up empty interaction records.
             */
            cleanupEmpty: `
                DELETE FROM "Interaction"
                WHERE id = $1
                  AND "rating" IS NULL
                  AND "isLiked" = false
                  AND NOT EXISTS (SELECT 1 FROM "Comment" WHERE "interactionId" = $1);`,
        },
    },
};
