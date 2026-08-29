-- Add isPrivate column for profile privacy configuration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPrivate" BOOLEAN DEFAULT false;

-- Add subscriptionTier and subscriptionExpiresAt columns for future Pro tier support
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionTier" VARCHAR(50) DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP WITH TIME ZONE NULL;

-- Add usernameChangedAt column to track last username modification timestamp
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "usernameChangedAt" TIMESTAMP WITH TIME ZONE NULL;

-- Add EmailChangeVerification table for email verification code workflow
CREATE TABLE IF NOT EXISTS "EmailChangeVerification" (
    "userId" UUID PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
    "newEmail" VARCHAR(255) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add deletedAt column to support user account soft deletion
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE NULL;
