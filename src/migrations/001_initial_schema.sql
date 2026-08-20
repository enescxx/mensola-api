CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    fullname VARCHAR(255),
    password TEXT NOT NULL,
    bio TEXT NULL,
    "avatar" TEXT NULL,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Movie" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tmdbId" INTEGER UNIQUE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "poster" VARCHAR(500) NOT NULL, 
    "releaseDate" DATE NULL, 
    "rating" DECIMAL(3,1) NULL,
    "genres" INTEGER[] NULL, 
    "duration" INTEGER NULL, 
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Artist" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "spotifyId" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(500) NULL,
    "followers" INTEGER NULL
);

CREATE TABLE IF NOT EXISTS "Album" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "spotifyId" VARCHAR(255) UNIQUE NOT NULL, 
    "title" VARCHAR(255) NOT NULL,
    "image" VARCHAR(500) NULL,
    "releaseDate" VARCHAR(50) NULL,
    "songCount" INTEGER NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Track" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "spotifyId" VARCHAR(255) UNIQUE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "duration" INTEGER NOT NULL,
    "image" VARCHAR(500) NULL,
    "albumId" UUID REFERENCES "Album"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Session" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Interaction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "targetId" UUID NOT NULL, 
    "targetType" VARCHAR(50) NOT NULL CHECK ("targetType" IN ('movie', 'track', 'playlist', 'album', 'movieList')),
    "isLiked" BOOLEAN DEFAULT false,
    "rating" DECIMAL(3,1) NULL,
    "interactedAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),

    CONSTRAINT check_rating_limit CHECK ("rating" >= 0.0 AND "rating" <= 10.0),
    UNIQUE("userId", "targetId", "targetType")
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW."updatedAt" = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_interaction_updated_at ON "Interaction";

CREATE TRIGGER update_interaction_updated_at
BEFORE UPDATE ON "Interaction"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS "Comment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "interactionId" UUID NOT NULL REFERENCES "Interaction"(id) ON DELETE CASCADE,
    "parentId" UUID NULL REFERENCES "Comment"(id) ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MovieList" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NULL,
    "image" VARCHAR(500) NULL,
    "isPrivate" BOOLEAN DEFAULT false,
    "listType" VARCHAR(50) DEFAULT 'custom' CHECK ("listType" IN ('custom', 'favorites', 'watchlist')),
    "creatorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Playlist" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NULL,
    "image" VARCHAR(500) NULL,
    "isPrivate" BOOLEAN DEFAULT false,
    "listType" VARCHAR(50) DEFAULT 'custom' CHECK ("listType" IN ('custom', 'favorites')),
    "creatorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TrackArtist" (
    "trackId" UUID REFERENCES "Track"("id") ON DELETE CASCADE,
    "artistId" UUID REFERENCES "Artist"("id") ON DELETE CASCADE,
    PRIMARY KEY ("trackId", "artistId")
);

CREATE TABLE IF NOT EXISTS "AlbumArtist" (
    "albumId" UUID REFERENCES "Album"("id") ON DELETE CASCADE,
    "artistId" UUID REFERENCES "Artist"("id") ON DELETE CASCADE,
    PRIMARY KEY ("albumId", "artistId")
);

CREATE TABLE IF NOT EXISTS "CommentLike" (
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "commentId" UUID NOT NULL REFERENCES "Comment"("id") ON DELETE CASCADE,
    PRIMARY KEY ("userId", "commentId")
);

CREATE TABLE IF NOT EXISTS "PlaylistItem" (
    "playlistId" UUID NOT NULL REFERENCES "Playlist"("id") ON DELETE CASCADE,
    "trackId" UUID NOT NULL REFERENCES "Track"("id") ON DELETE CASCADE,
    "addedBy" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "addedAt" TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY ("playlistId", "trackId")
);

CREATE TABLE IF NOT EXISTS "PlaylistOwner" (
    "playlistId" UUID NOT NULL REFERENCES "Playlist"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    PRIMARY KEY ("playlistId", "userId")
);

CREATE TABLE IF NOT EXISTS "MovieListItem" (
    "movieListId" UUID NOT NULL REFERENCES "MovieList"("id") ON DELETE CASCADE,
    "movieId" UUID NOT NULL REFERENCES "Movie"("id") ON DELETE CASCADE,
    "addedBy" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "addedAt" TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY ("movieListId", "movieId")
);

CREATE TABLE IF NOT EXISTS "MovieListOwner" (
    "movieListId" UUID NOT NULL REFERENCES "MovieList"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    PRIMARY KEY ("movieListId", "userId")
);

CREATE TABLE IF NOT EXISTS "Follow" (
    "followerId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "followingId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "followedAt" TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY ("followerId", "followingId"),
    
    CONSTRAINT check_self_follow CHECK ("followerId" <> "followingId")
);

CREATE TABLE IF NOT EXISTS "WatchedMovie" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "movieId" UUID NOT NULL REFERENCES "Movie"(id) ON DELETE CASCADE,
    "watchedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "targetId" UUID NOT NULL,
    "targetType" VARCHAR(50) NOT NULL CHECK ("targetType" IN ('playlist', 'movieList')),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("userId", "targetId", "targetType")
);