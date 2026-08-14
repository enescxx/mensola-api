export const trackQueries = {
    /**
     * Query to get a track by its ID, optionally resolving current user interactions like rating, likes and comments.
     */
    getById: `
        SELECT 
            t."id", 
            t."spotifyId", 
            t."title", 
            t."duration", 
            t."image", 
            t."albumId", 
            t."createdAt",
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', a."id", 
                            'name', a."name",
                            'avatar', a."image"
                        )
                    )
                    FROM "TrackArtist" ta
                    JOIN "Artist" a ON ta."artistId" = a."id"
                    WHERE ta."trackId" = t."id"
                ), 
                '[]'::json
            ) AS "artists",
            (
                SELECT COUNT(*)::int FROM "Interaction" i
                WHERE i."targetId" = t.id AND i."targetType" = 'track' AND i."isLiked" = true
            ) AS "likesCount",
            (
                SELECT COUNT(*)::int FROM "Interaction" i
                JOIN "Comment" c ON c."interactionId" = i.id
                WHERE i."targetId" = t.id AND i."targetType" = 'track' AND c."parentId" IS NULL
            ) AS "commentsCount",
            CASE WHEN user_int.user_interaction IS NOT NULL THEN (user_int.user_interaction->>'isLiked')::boolean ELSE false END AS "isLiked",
            user_int.user_interaction AS "currentUserInteraction"
        FROM "Track" t
        LEFT JOIN LATERAL (
            SELECT json_build_object(
                'id', cu_int.id,
                'rating', cu_int.rating,
                'isLiked', cu_int."isLiked",
                'comment', (
                    SELECT json_build_object('id', c.id, 'content', c.content, 'date', c."createdAt")
                    FROM "Comment" c
                    WHERE c."interactionId" = cu_int.id AND c."parentId" IS NULL
                    LIMIT 1
                )
            ) AS user_interaction
            FROM "Interaction" cu_int
            WHERE $2::uuid IS NOT NULL AND cu_int."userId" = $2::uuid AND cu_int."targetId" = t.id AND cu_int."targetType" = 'track'
        ) user_int ON true
        WHERE t.id = $1::uuid;
    `,
    likes: {
        get: `
            SELECT 
                t."id", 
                t."spotifyId", 
                t."title", 
                t."duration", 
                t."image", 
                t."albumId", 
                t."createdAt",
                true AS "isLiked",
                COALESCE(
                    (
                        SELECT json_agg(json_build_object('id', a."id", 'name', a."name"))
                        FROM "TrackArtist" ta
                        JOIN "Artist" a ON ta."artistId" = a."id"
                        WHERE ta."trackId" = t."id"
                    ), 
                    '[]'::json
                ) AS "artists"
            FROM "Interaction" i
            JOIN "Track" t ON i."targetId" = t."id"
            WHERE i."userId" = $1 AND i."targetType" = 'track' AND i."isLiked" = true
            ORDER BY i."interactedAt" DESC
            LIMIT $2 OFFSET $3;
        `,
        add: `
            INSERT INTO "Interaction" ("userId", "targetId", "targetType", "isLiked", "updatedAt")
            VALUES ($1, $2, 'track', true, NOW())
            ON CONFLICT ("userId", "targetId", "targetType") DO UPDATE
            SET "isLiked" = true, "updatedAt" = NOW()
            RETURNING "targetId" AS "trackId", "isLiked";
        `,
        remove: `
            WITH target_interaction AS (
                SELECT i.id, i.rating,
                       EXISTS (SELECT 1 FROM "Comment" c WHERE c."interactionId" = i.id) AS has_comment
                FROM "Interaction" i
                WHERE i."userId" = $1 AND i."targetId" = $2 AND i."targetType" = 'track'
            ),
            deleted AS (
                DELETE FROM "Interaction" i
                USING target_interaction ti
                WHERE i.id = ti.id
                  AND ti.rating IS NULL
                  AND NOT ti.has_comment
                RETURNING i."targetId" AS "trackId", false AS "isLiked"
            ),
            updated AS (
                UPDATE "Interaction" i
                SET "isLiked" = false, "updatedAt" = NOW()
                FROM target_interaction ti
                WHERE i.id = ti.id
                  AND (ti.rating IS NOT NULL OR ti.has_comment)
                RETURNING i."targetId" AS "trackId", false AS "isLiked"
            )
            SELECT * FROM deleted
            UNION ALL
            SELECT * FROM updated;
        `,
    },
    items: {
        /**
         * Fetches all user interactions containing a comment for a specific track.
         */
        getInteractions: `
            SELECT
                i.id,
                i."rating"::float,
                COALESCE(i."isLiked", false) AS "isLiked",
                json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'fullname', u.fullname,
                    'avatar', u.avatar
                ) AS "user",
                json_build_object(
                    'id', c.id,
                    'content', c.content,
                    'date', c."createdAt"
                ) AS "comment",
                (SELECT COUNT(*)::int FROM "Interaction" sub_i WHERE sub_i."targetId" = i.id AND sub_i."targetType" = 'interaction' AND sub_i."isLiked" = true) AS "likeCount",
                (SELECT COUNT(*)::int FROM "Comment" sub_c WHERE sub_c."parentId" = c.id) AS "replyCount"
            FROM "Comment" c
            JOIN "Interaction" i ON c."interactionId" = i.id
            JOIN "User" u ON u.id = i."userId"
            WHERE i."targetId" = $1
              AND i."targetType" = 'track'
              AND c."parentId" IS NULL
            ORDER BY c."createdAt" DESC
            LIMIT $2 OFFSET $3;
        `,
    },
    interaction: {
        upsert: `
            INSERT INTO "Interaction" ("userId", "targetId", "targetType", "rating", "isLiked", "updatedAt")
            VALUES ($1, $2, 'track', $3, COALESCE($4, false), NOW())
            ON CONFLICT ("userId", "targetId", "targetType") DO UPDATE
            SET "rating" = EXCLUDED."rating",
                "isLiked" = COALESCE($4, "Interaction"."isLiked"),
                "updatedAt" = NOW()
            RETURNING id, "userId", "targetId", "targetType", "rating"::float, "isLiked", "interactedAt", "updatedAt";
        `,
        cleanupEmpty: `
            DELETE FROM "Interaction"
            WHERE id = $1
              AND "rating" IS NULL
              AND ("isLiked" = false OR "isLiked" IS NULL)
              AND NOT EXISTS (SELECT 1 FROM "Comment" WHERE "interactionId" = $1);
        `,
    },
};
