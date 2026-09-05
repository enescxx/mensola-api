-- ======================================================
-- Migration 008: Add CommentLike table
-- ======================================================
-- Rationale: Decouples comment likes from the polymorphic
-- Interaction table. Dedicated table gives us:
--   1. Simpler, faster queries (no targetType filter needed)
--   2. Clean index strategy
--   3. Easy toggle semantics (upsert / delete)
-- ======================================================
 
CREATE TABLE IF NOT EXISTS "CommentLike" (
    "id"        UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID      NOT NULL REFERENCES "User"(id)    ON DELETE CASCADE,
    "commentId" UUID      NOT NULL REFERENCES "Comment"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE ("userId", "commentId")
);

-- Speed up lookups by commentId (used in likeCount subqueries)
CREATE INDEX IF NOT EXISTS "idx_comment_like_comment_id"
    ON "CommentLike" ("commentId");

-- Speed up existence checks per user+comment (used in isLikedByMe checks)
CREATE INDEX IF NOT EXISTS "idx_comment_like_user_comment"
    ON "CommentLike" ("userId", "commentId");
