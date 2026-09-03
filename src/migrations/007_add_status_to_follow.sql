-- Add status column to Follow table ('pending' or 'accepted')
ALTER TABLE "Follow" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'accepted';

-- Ensure existing records have status 'accepted'
UPDATE "Follow" SET "status" = 'accepted' WHERE "status" IS NULL;

-- Add check constraint for valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_follow_status'
    ) THEN
        ALTER TABLE "Follow" ADD CONSTRAINT check_follow_status CHECK ("status" IN ('pending', 'accepted'));
    END IF;
END $$;

-- Add performance indexes on Follow status
CREATE INDEX IF NOT EXISTS idx_follow_status ON "Follow"("status");
CREATE INDEX IF NOT EXISTS idx_follow_following_status ON "Follow"("followingId", "status");
CREATE INDEX IF NOT EXISTS idx_follow_follower_status ON "Follow"("followerId", "status");
