-- Enable the pg_trgm extension if it doesn't already exist
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for fast similarity searches on username and fullname
CREATE INDEX IF NOT EXISTS "idx_user_username_trgm" ON "User" USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_user_fullname_trgm" ON "User" USING gin (fullname gin_trgm_ops);
