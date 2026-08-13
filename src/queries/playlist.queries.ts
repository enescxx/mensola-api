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
    }
};
