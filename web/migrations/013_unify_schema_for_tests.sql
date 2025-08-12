-- Migration 013: Unify DB schema with test expectations
-- Adds missing columns and tables referenced by tests and aligns certain constraints

BEGIN;

-- 1) Audits: add queued_at and started_at timestamps if missing
ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS queued_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL;

-- Ensure status check allows only valid statuses used in code/tests
-- Attempt to drop an existing status check constraint if named
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_status_check;
ALTER TABLE audits
  ADD CONSTRAINT audits_status_check
  CHECK (status IN ('pending','running','completed','failed'));

-- 2) Notifications: add legacy 'read' flag and sync with is_read
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION sync_notifications_read_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- unify read flags
  NEW.read := COALESCE(NEW.read, NEW.is_read, FALSE);
  NEW.is_read := COALESCE(NEW.is_read, NEW.read, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_notifications_read_flags ON notifications;
CREATE TRIGGER trg_sync_notifications_read_flags
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION sync_notifications_read_flags();

-- Expand allowed notification types to include values used in tests
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('info','success','warning','error','message','alert','critical'));

-- 3) User sessions table referenced by tests
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

COMMIT;
