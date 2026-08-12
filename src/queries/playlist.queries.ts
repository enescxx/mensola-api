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
    }
};
