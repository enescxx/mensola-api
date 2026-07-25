const getUserQuery = `
    SELECT 
        u.id,
        u.username,
        u.fullname,
        u.bio,
        COALESCE(movie_lists.count, 0) AS "movieListCount",
        COALESCE(playlists.count, 0) AS "playlistCount",
        COALESCE(watchlists.count, 0) AS "watchlistMoviesCount",
        COALESCE(watched_stats.count, 0) AS "watchedMoviesCount",
        
        COALESCE(fav_movies.movies, '[]'::json) AS "favoriteMovies",
        COALESCE(fav_tracks.tracks, '[]'::json) AS "favoriteTracks",
        
        COALESCE(stats.total_liked_movies, 0) AS "likedMoviesCount",
        COALESCE(stats.total_liked_tracks, 0) AS "likedTracksCount",
        COALESCE(stats.total_liked_playlists, 0) AS "likedPlaylistsCount",
        COALESCE(stats.total_liked_movie_lists, 0) AS "likedMovieListsCount",
        COALESCE(stats.total_liked_albums, 0) AS "likedAlbumsCount",
        
        COALESCE(follow_stats.follower_count, 0) AS "followerCount",
        COALESCE(follow_stats.following_count, 0) AS "followingCount",

        CASE 
            WHEN $1 != $2::uuid::uuid 
            THEN COALESCE(mutual_follows.list, '[]'::json)
            ELSE NULL
        END AS "mutualFollowers",

        CASE 
            WHEN $2::uuid IS NOT NULL AND EXISTS (
                SELECT 1
                FROM "Follow"
                WHERE "followerId" = $2::uuid AND "followingId" = u.id
            )
            THEN true
            ELSE false
        END AS "isFollowingByMe"

        
    FROM "User" u
    
    LEFT JOIN (
        SELECT "creatorId" AS creator_id, COUNT(*) as count
        FROM "MovieList" 
        WHERE "listType" = 'custom' AND "creatorId" = $1 
        GROUP BY "creatorId"
    ) movie_lists ON u.id = movie_lists.creator_id

    LEFT JOIN (
        SELECT "creatorId" as creator_id, COUNT(*) as count
        FROM "Playlist"
        WHERE "listType" = 'custom' AND "creatorId" = $1
        GROUP BY "creatorId"
    ) playlists ON u.id = playlists.creator_id
    
    LEFT JOIN (
        SELECT 
            user_favs.creator_id,
            json_agg(
                json_build_object(
                    'id', user_favs.movie_id,
                    'title', user_favs.title,
                    'poster', user_favs.poster,
                    'rating', user_favs.rating,
                    'isLiked', user_favs.is_liked,
                    'hasComment', user_favs.has_comment
                ) ORDER BY user_favs.added_at DESC
            ) AS movies
        FROM (
            SELECT 
                ml."creatorId" AS creator_id,
                m.id AS movie_id,
                m.title,
                m.poster,
                m_int.rating,
                COALESCE(m_int."isLiked", false) AS is_liked,
                mli."addedAt" AS added_at,
                CASE WHEN COUNT(c.id) > 0 THEN true ELSE false END AS has_comment
            FROM "MovieList" ml
            JOIN "MovieListItem" mli ON ml.id = mli."movieListId"
            JOIN "Movie" m ON mli."movieId" = m.id
            LEFT JOIN "Interaction" m_int ON m_int."userId" = ml."creatorId" AND m_int."targetId" = m.id
            LEFT JOIN "Comment" c ON c."interactionId" = m_int.id
            WHERE ml."listType" = 'favorites' AND ml."creatorId" = $1
            GROUP BY ml."creatorId", m.id, mli."addedAt", m_int.id
        ) user_favs
        GROUP BY user_favs.creator_id
    ) fav_movies ON u.id = fav_movies.creator_id
    
    LEFT JOIN (
        SELECT 
            user_favs.creator_id,
            json_agg(
                json_build_object(
                    'id', user_favs.track_id,
                    'title', user_favs.title,
                    'image', user_favs.image,
                    'duration', user_favs.duration,
                    'artists', user_favs.artists_list
                ) ORDER BY user_favs.added_at DESC
            ) AS tracks
        FROM (
            SELECT 
                pl."creatorId" AS creator_id,
                t.id AS track_id,
                t.title,
                t.image,
                t.duration,
                pli."addedAt" AS added_at,
                json_agg(
                    json_build_object(
                        'id', a.id,
                        'name', a.name
                    )
                ) AS artists_list
            FROM "Playlist" pl
            JOIN "PlaylistItem" pli ON pl.id = pli."playlistId"
            JOIN "Track" t ON pli."trackId" = t.id
            JOIN "TrackArtist" ta ON ta."trackId" = t.id
            JOIN "Artist" a ON a.id = ta."artistId"
            WHERE pl."listType" = 'favorites' AND pl."creatorId" = $1
                    
            GROUP BY pl."creatorId", t.id, pli."addedAt"
        ) user_favs
        GROUP BY user_favs.creator_id
    ) fav_tracks ON u.id = fav_tracks.creator_id
    
    LEFT JOIN (
        SELECT 
            "userId",
            COUNT(CASE WHEN "targetType" = 'movie' AND "isLiked" = true THEN 1 END) AS total_liked_movies,
            COUNT(CASE WHEN "targetType" = 'track' AND "isLiked" = true THEN 1 END) AS total_liked_tracks,
            COUNT(CASE WHEN "targetType" = 'playlist' AND "isLiked" = true THEN 1 END) AS total_liked_playlists,
            COUNT(CASE WHEN "targetType" = 'movieList' AND "isLiked" = true THEN 1 END) AS total_liked_movie_lists,
            COUNT(CASE WHEN "targetType" = 'album' AND "isLiked" = true THEN 1 END) AS total_liked_albums
        FROM "Interaction"
        WHERE "userId" = $1 -- Performans için alt sorguda da filtreliyoruz
        GROUP BY "userId"
    ) stats ON u.id = stats."userId"

    LEFT JOIN (
        SELECT 
            u_id,
            SUM(is_follower) AS follower_count,
            SUM(is_following) AS following_count
        FROM (
            SELECT "followingId" AS u_id, COUNT(*) AS is_follower, 0 AS is_following
            FROM "Follow" WHERE "followingId" = $1 
            GROUP BY "followingId"
            UNION ALL
            SELECT "followerId" AS u_id, 0 AS is_follower, COUNT(*) AS is_following
            FROM "Follow" WHERE "followerId" = $1 
            GROUP BY "followerId"
        ) combined_follows
        GROUP BY u_id
    ) follow_stats ON u.id = follow_stats.u_id

    LEFT JOIN (
        SELECT ml."creatorId" as creator_id, COUNT(mli."movieId") as count
        FROM "MovieList" ml
        LEFT JOIN "MovieListItem" mli ON ml.id = mli."movieListId"
        WHERE ml."listType" = 'watchlist' AND ml."creatorId" = $1
        GROUP BY ml."creatorId"
    ) watchlists ON u.id = watchlists.creator_id

    LEFT JOIN (
        SELECT "userId", COUNT(*) AS count
        FROM "WatchedMovie"
        WHERE "userId" = $1
        GROUP BY "userId"
    ) watched_stats ON u.id = watched_stats."userId"

    LEFT JOIN (
        SELECT
            f."followingId" AS target_user_id,
            json_agg(
                json_build_object(
                    'id', u_sub.id,
                    'username', u_sub.username,
                    'fullname', u_sub.fullname
                )
            ) AS list
        FROM "Follow" f
        JOIN "User" u_sub ON f."followerId" = u_sub.id
        WHERE f."followingId" = $1 
            AND $2::uuid IS NOT NULL
            AND $1 != $2::uuid
            AND f."followerId" IN (
                SELECT "followingId"
                FROM "Follow"
                WHERE "followerId" = $2::uuid
            )
        GROUP BY f."followingId"
    ) mutual_follows ON u.id = mutual_follows.target_user_id


    WHERE u.id = $1;`;

const getFollowersQuery = `
    SELECT 
        u.id,
        u.username,
        u.fullname,
        u.avatar,
        EXISTS (
            SELECT 1 FROM "Follow" f1 
            WHERE f1."followerId" = $2 AND f1."followingId" = u.id
        ) AS "isFollowing",
        EXISTS (
            SELECT 1 FROM "Follow" f2 
            WHERE f2."followerId" = u.id AND f2."followingId" = $2
        ) AS "isFollower"
    FROM "Follow" f
    JOIN "User" u ON f."followerId" = u.id
    WHERE f."followingId" = $1
    ORDER BY f."followedAt" DESC
    LIMIT $3 OFFSET $4;`;

const getFollowingQuery = `
    SELECT 
        u.id,
        u.username,
        u.fullname,
        u.avatar,
        EXISTS (
            SELECT 1 FROM "Follow" f1 
            WHERE f1."followerId" = $2 AND f1."followingId" = u.id
        ) AS "isFollowing",
        EXISTS (
            SELECT 1 FROM "Follow" f2 
            WHERE f2."followerId" = u.id AND f2."followingId" = $2
        ) AS "isFollower"
    FROM "Follow" f
    JOIN "User" u ON f."followingId" = u.id
    WHERE f."followerId" = $1
    ORDER BY f."followedAt" DESC
    LIMIT $3 OFFSET $4;`;

export { getUserQuery, getFollowersQuery, getFollowingQuery };
