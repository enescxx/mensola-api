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
    getById: `
        SELECT 
            p.*,
            (
                SELECT COUNT(*)::int
                FROM "PlaylistItem" pi
                WHERE pi."playlistId" = p.id
            ) AS "songCount",
            (
                SELECT json_build_object('id', u.id, 'username', u.username, 'fullname', u.fullname, 'avatar', u.avatar)
                FROM "User" u
                WHERE u.id = p."creatorId"
            ) AS "creator",
            COALESCE(
                (
                    SELECT json_agg(json_build_object('id', u.id, 'username', u.username, 'fullname', u.fullname, 'avatar', u.avatar))
                    FROM "PlaylistOwner" po
                    JOIN "User" u ON u.id = po."userId"
                    WHERE po."playlistId" = p.id
                ),
                '[]'::json
            ) AS "owners",
            EXISTS (
                SELECT 1 FROM "Bookmark" b
                WHERE $2::uuid IS NOT NULL AND b."userId" = $2::uuid AND b."targetId" = p.id AND b."targetType" = 'playlist'
            ) AS "isSaved",
            (
                SELECT COUNT(*)::int FROM "Bookmark" b
                WHERE b."targetId" = p.id AND b."targetType" = 'playlist'
            ) AS "savesCount",
            EXISTS (
                SELECT 1 FROM "Interaction" i
                WHERE $2::uuid IS NOT NULL AND i."userId" = $2::uuid AND i."targetId" = p.id AND i."targetType" = 'playlist' AND i."isLiked" = true
            ) AS "isLiked",
            (
                SELECT COUNT(*)::int FROM "Interaction" i
                WHERE i."targetId" = p.id AND i."targetType" = 'playlist' AND i."isLiked" = true
            ) AS "likesCount"
        FROM "Playlist" p
        WHERE p.id = $1::uuid
          AND (
              p."isPrivate" = false 
              OR ($2::uuid IS NOT NULL AND (
                  p."creatorId" = $2::uuid 
                  OR EXISTS (
                      SELECT 1 FROM "PlaylistOwner" po 
                      WHERE po."playlistId" = p.id AND po."userId" = $2::uuid
                  )
              ))
          );
    `,
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
         * Fetches all user interactions containing a comment for a specific playlist.
         */
        getInteractions: `
            SELECT
                i.id,
                i."rating",
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
              AND i."targetType" = 'playlist'
              AND c."parentId" IS NULL
            ORDER BY c."createdAt" DESC
            LIMIT $2 OFFSET $3;
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
    interaction: {
        upsert: `
            INSERT INTO "Interaction" ("userId", "targetId", "targetType", "rating", "isLiked", "updatedAt")
            VALUES ($1, $2, 'playlist', $3, COALESCE($4, false), NOW())
            ON CONFLICT ("userId", "targetId", "targetType") DO UPDATE
            SET "rating" = EXCLUDED."rating",
                "isLiked" = COALESCE($4, "Interaction"."isLiked"),
                "updatedAt" = NOW()
            RETURNING id, "userId", "targetId", "targetType", "rating", "isLiked", "interactedAt", "updatedAt";
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

