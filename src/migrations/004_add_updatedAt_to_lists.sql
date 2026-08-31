ALTER TABLE "MovieList" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();
ALTER TABLE "Playlist" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();

DROP TRIGGER IF EXISTS update_movielist_updated_at ON "MovieList";
CREATE TRIGGER update_movielist_updated_at
BEFORE UPDATE ON "MovieList"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlist_updated_at ON "Playlist";
CREATE TRIGGER update_playlist_updated_at
BEFORE UPDATE ON "Playlist"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
