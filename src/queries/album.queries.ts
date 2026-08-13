export const albumQueries = {
    likes: {
        get: `
            SELECT 
                al."id", 
                al."spotifyId", 
                al."title", 
                al."image", 
                al."releaseDate", 
                al."songCount", 
                al."createdAt",
                true AS "isLiked",
                COALESCE(
                    (
                        SELECT json_agg(json_build_object('id', a."id", 'name', a."name"))
                        FROM "AlbumArtist" aa
                        JOIN "Artist" a ON aa."artistId" = a."id"
                        WHERE aa."albumId" = al."id"
                    ), 
                    '[]'::json
                ) AS "artists"
            FROM "Interaction" i
            JOIN "Album" al ON i."targetId" = al."id"
            WHERE i."userId" = $1 AND i."targetType" = 'album' AND i."isLiked" = true
            ORDER BY i."interactedAt" DESC
            LIMIT $2 OFFSET $3;
        `,
    },
};
