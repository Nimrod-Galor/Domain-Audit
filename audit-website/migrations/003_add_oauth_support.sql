-- Migration: Add OAuth support to users table
-- File: migrations/003_add_oauth_support.sql

-- Add OAuth provider columns
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN github_id VARCHAR(255);
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255);
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN profile_photo TEXT;

-- Make password optional for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add indexes for OAuth lookups
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
CREATE INDEX idx_users_oauth_provider ON users(oauth_provider) WHERE oauth_provider IS NOT NULL;

-- Add unique constraints for OAuth IDs
ALTER TABLE users ADD CONSTRAINT uk_users_google_id UNIQUE(google_id);
ALTER TABLE users ADD CONSTRAINT uk_users_github_id UNIQUE(github_id);
