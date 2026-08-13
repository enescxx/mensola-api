export const playlistQueries = {
    lists: {
        /**
         * Fetches playlists created by a specific user.
         * Shows private playlists only if the requester is the creator.
         */
        getUserPlaylists: `
            SELECT
                p.*,
                (
                    SELECT COUNT(*)::int
                    FROM "PlaylistItem" pi
                    WHERE pi."playlistId" = p.id
                ) AS "songCount"
            FROM "Playlist" p
            WHERE p."creatorId" = $1
              AND p."listType" = 'custom'
              AND (p."isPrivate" = false OR $1 = $2)
            ORDER BY p."createdAt" DESC
            LIMIT $3 OFFSET $4;
        `,
    },
    likes: {
        /**
         * Fetches playlists liked by a specific user.
         * Shows private playlists only if the requester is the creator.
         */
        get: `
            SELECT
                p.*,
                (
                    SELECT COUNT(*)::int
                    FROM "PlaylistItem" pi
                    WHERE pi."playlistId" = p.id
                ) AS "songCount",
                (
                    SELECT json_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar)
                    FROM "User" u
                    WHERE u.id = p."creatorId"
                ) AS "creator"
            FROM "Interaction" i
            JOIN "Playlist" p ON i."targetId" = p.id
            WHERE i."userId" = $1 
              AND i."targetType" = 'playlist' 
              AND i."isLiked" = true
              AND (p."isPrivate" = false OR p."creatorId" = $2)
            ORDER BY i."interactedAt" DESC
            LIMIT $3 OFFSET $4;
        `,
    },
    items: {
        /**
         * Checks whether a playlist exists and if the user has permission to access it.
         */
        checkAccess: `
            SELECT 
                p.id,
                p."isPrivate",
                p."creatorId",
                (
                    p."isPrivate" = false
                    OR ($2::uuid IS NOT NULL AND (
                        p."creatorId" = $2::uuid
                        OR EXISTS (
                            SELECT 1 FROM "PlaylistOwner" po
                            WHERE po."playlistId" = p.id AND po."userId" = $2::uuid
                        )
                    ))
                ) AS "hasAccess"
            FROM "Playlist" p
            WHERE p.id = $1::uuid;
        `,
        /**
         * Fetches tracks inside a playlist.
         */
        getTracks: `
            SELECT 
                t."id", 
                t."spotifyId", 
                t."title", 
                t."duration", 
                t."image", 
                t."albumId", 
                t."createdAt",
                pli."addedAt",
                pli."addedBy",
                COALESCE(
                    i_like."isLiked",
                    false
                ) AS "isLiked",
                COALESCE(
                    (
                        SELECT json_agg(json_build_object('id', a."id", 'name', a."name"))
                        FROM "TrackArtist" ta
                        JOIN "Artist" a ON ta."artistId" = a."id"
                        WHERE ta."trackId" = t."id"
                    ), 
                    '[]'::json
                ) AS "artists"
            FROM "PlaylistItem" pli
            JOIN "Track" t ON pli."trackId" = t.id
            LEFT JOIN "Interaction" i_like ON i_like."userId" = $2::uuid AND i_like."targetId" = t.id AND i_like."targetType" = 'track' AND i_like."isLiked" = true
            WHERE pli."playlistId" = $1::uuid
            ORDER BY pli."addedAt" DESC
            LIMIT $3 OFFSET $4;
        `,
    },
};

