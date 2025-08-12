-- Migration 012: Add basic email format constraint
-- Adds a lightweight CHECK constraint to enforce rudimentary email format validation
-- (not exhaustive RFC compliance, but good enough for tests.)


BEGIN;

-- Fix any existing users with invalid emails before adding the constraint
UPDATE users
SET email = 'fixed_' || id || '@example.com'
WHERE email IS NULL OR email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';

ALTER TABLE users DROP CONSTRAINT IF EXISTS email_format_check;
ALTER TABLE users
  ADD CONSTRAINT email_format_check
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$') NOT VALID;

COMMIT;
