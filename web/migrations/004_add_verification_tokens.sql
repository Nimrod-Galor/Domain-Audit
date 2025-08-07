-- Migration 004: Add Email Verification Tokens
-- Run date: 2025-08-04

ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_status (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update migration status
INSERT INTO migration_status (migration_name, applied_at) 
VALUES ('004_add_verification_tokens', NOW())
ON CONFLICT (migration_name) DO NOTHING;
