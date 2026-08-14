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
    },
};
