-- Migration 004: Add Email Verification Tokens
-- Run date: 2025-08-04

ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN verification_sent_at TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX idx_users_verification_token ON users(verification_token);

-- Update migration status
INSERT INTO migration_status (migration_name, applied_at) 
VALUES ('004_add_verification_tokens', NOW());
