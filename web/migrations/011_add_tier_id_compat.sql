-- Migration 011: Add legacy tier_id compatibility column
-- Purpose: Older tests and helper code reference users.tier_id (numeric) while the
-- current schema uses users.tier (text). This migration re-introduces a numeric
-- column and keeps it synchronized with the textual tier for backward compatibility.

BEGIN;

-- 1. Add tier_id column if it does not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier_id INT;

-- 2. Populate tier_id based on current tier values (mapping starter=1, professional=2, enterprise=3, freemium=0)
UPDATE users
SET tier_id = CASE tier
  WHEN 'starter' THEN 1
  WHEN 'professional' THEN 2
  WHEN 'enterprise' THEN 3
  WHEN 'freemium' THEN 0
  ELSE 1
END
WHERE tier_id IS NULL;

-- 3. Ensure tier_id has an index for lookups
CREATE INDEX IF NOT EXISTS idx_users_tier_id ON users(tier_id);

-- 4. Create a helper function to keep tier/tier_id in sync on INSERT/UPDATE
CREATE OR REPLACE FUNCTION sync_user_tier_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If tier_id provided but tier not, derive tier
  IF (NEW.tier IS NULL OR NEW.tier = '') AND NEW.tier_id IS NOT NULL THEN
    NEW.tier = CASE NEW.tier_id
      WHEN 1 THEN 'starter'
      WHEN 2 THEN 'professional'
      WHEN 3 THEN 'enterprise'
      WHEN 0 THEN 'freemium'
      ELSE 'starter'
    END;
  END IF;

  -- If tier provided but tier_id not, derive tier_id
  IF NEW.tier_id IS NULL AND NEW.tier IS NOT NULL THEN
    NEW.tier_id = CASE NEW.tier
      WHEN 'starter' THEN 1
      WHEN 'professional' THEN 2
      WHEN 'enterprise' THEN 3
      WHEN 'freemium' THEN 0
      ELSE 1
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach trigger
DROP TRIGGER IF EXISTS trg_sync_user_tier_id ON users;
CREATE TRIGGER trg_sync_user_tier_id
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_tier_id();

COMMIT;
