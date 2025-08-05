-- Migration 007: Update audits table for tier system
-- Add tier-related audit tracking columns

BEGIN;

-- Update audits table with tier-related columns
ALTER TABLE audits 
  ADD COLUMN IF NOT EXISTS user_tier VARCHAR(20) DEFAULT 'freemium',
  ADD COLUMN IF NOT EXISTS pages_limit_applied INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS external_links_limit_applied INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parent_scheduled_audit_id INT NULL,
  ADD COLUMN IF NOT EXISTS audit_type VARCHAR(20) DEFAULT 'manual'; -- manual, scheduled, api

-- Add constraints
ALTER TABLE audits DROP CONSTRAINT IF EXISTS check_audit_user_tier;
ALTER TABLE audits ADD CONSTRAINT check_audit_user_tier 
  CHECK (user_tier IN ('freemium', 'starter', 'professional', 'enterprise'));

ALTER TABLE audits DROP CONSTRAINT IF EXISTS check_audit_type;
ALTER TABLE audits ADD CONSTRAINT check_audit_type 
  CHECK (audit_type IN ('manual', 'scheduled', 'api'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audits_user_tier ON audits(user_tier);
CREATE INDEX IF NOT EXISTS idx_audits_audit_type ON audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_audits_is_scheduled ON audits(is_scheduled);
CREATE INDEX IF NOT EXISTS idx_audits_parent_scheduled_id ON audits(parent_scheduled_audit_id);

-- Create scheduled_audits table
CREATE TABLE IF NOT EXISTS scheduled_audits (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  domain VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
  next_run_date TIMESTAMP NOT NULL,
  last_run_date TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  slack_webhook_url VARCHAR(500) NULL,
  audit_config JSONB NULL, -- Store audit parameters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add constraints
ALTER TABLE scheduled_audits DROP CONSTRAINT IF EXISTS check_frequency;
ALTER TABLE scheduled_audits ADD CONSTRAINT check_frequency 
  CHECK (frequency IN ('daily', 'weekly', 'monthly'));

-- Create trigger for scheduled_audits updated_at
DROP TRIGGER IF EXISTS update_scheduled_audits_updated_at ON scheduled_audits;
CREATE TRIGGER update_scheduled_audits_updated_at
  BEFORE UPDATE ON scheduled_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_audits_user_id ON scheduled_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_audits_next_run ON scheduled_audits(next_run_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_audits_is_active ON scheduled_audits(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_audits_frequency ON scheduled_audits(frequency);

COMMIT;
