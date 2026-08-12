export const trackQueries = {
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
