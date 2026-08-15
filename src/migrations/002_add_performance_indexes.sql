CREATE INDEX IF NOT EXISTS idx_interaction_userid
    ON "Interaction"("userId");

CREATE INDEX IF NOT EXISTS idx_interaction_target
    ON "Interaction"("targetId", "targetType");

CREATE INDEX IF NOT EXISTS idx_interaction_liked
    ON "Interaction"("userId", "targetType")
    WHERE "isLiked" = true;

CREATE INDEX IF NOT EXISTS idx_follow_followingid
    ON "Follow"("followingId");

CREATE INDEX IF NOT EXISTS idx_follow_followerid
    ON "Follow"("followerId");

CREATE INDEX IF NOT EXISTS idx_comment_interactionid
    ON "Comment"("interactionId");

CREATE INDEX IF NOT EXISTS idx_movielistitem_listid_addedat
    ON "MovieListItem"("movieListId", "addedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_playlistitem_playlistid
    ON "PlaylistItem"("playlistId");

CREATE INDEX IF NOT EXISTS idx_session_refreshtoken
    ON "Session"("refreshToken");

CREATE INDEX IF NOT EXISTS idx_watchedmovie_userid
    ON "WatchedMovie"("userId");

CREATE INDEX IF NOT EXISTS idx_movielist_creatorid
    ON "MovieList"("creatorId", "listType");