-- Add overview column to Movie table
ALTER TABLE "Movie" ADD COLUMN IF NOT EXISTS "overview" TEXT;
