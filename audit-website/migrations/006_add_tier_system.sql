-- Migration 006: Add Tier System Support
-- This migration adds all the necessary tables and columns for the tier system implementation

BEGIN;

-- 1. Update users table with tier-related columns
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'monthly', -- 'monthly' or 'annual'
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS last_billing_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS failed_payment_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_key VARCHAR(64) NULL UNIQUE;

-- Add constraints for tier values
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_tier_values;
ALTER TABLE users ADD CONSTRAINT check_tier_values 
  CHECK (tier IN ('freemium', 'starter', 'professional', 'enterprise'));

-- Add constraints for subscription status
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_subscription_status;
ALTER TABLE users ADD CONSTRAINT check_subscription_status 
  CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- Add constraints for billing cycle
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_billing_cycle;
ALTER TABLE users ADD CONSTRAINT check_billing_cycle 
  CHECK (billing_cycle IN ('monthly', 'annual'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

-- 2. Create user_limits table
CREATE TABLE IF NOT EXISTS user_limits (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  tier VARCHAR(20) NOT NULL,
  audits_per_month INT DEFAULT -1, -- -1 = unlimited
  max_internal_pages INT DEFAULT 25,
  max_external_links INT DEFAULT 10,
  max_domains INT DEFAULT 1,
  api_access BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  scheduled_audits BOOLEAN DEFAULT FALSE,
  team_members INT DEFAULT 1,
  priority_support BOOLEAN DEFAULT FALSE,
  data_retention_days INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id) -- One limit record per user
);

-- Create trigger for user_limits updated_at
DROP TRIGGER IF EXISTS update_user_limits_updated_at ON user_limits;
CREATE TRIGGER update_user_limits_updated_at
  BEFORE UPDATE ON user_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_limits_tier ON user_limits(tier);

-- 3. Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- Format: 2025-08
  audits_used INT DEFAULT 0,
  internal_pages_scanned INT DEFAULT 0,
  external_links_checked INT DEFAULT 0,
  api_calls_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, month_year) -- One record per user per month
);

-- Create trigger for usage_tracking updated_at
DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON usage_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due, trialing, incomplete, incomplete_expired
  billing_cycle VARCHAR(10) DEFAULT 'monthly',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_subscription_id VARCHAR(100) UNIQUE,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP NULL,
  trial_end TIMESTAMP NULL,
  canceled_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add constraints
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_subscription_tier;
ALTER TABLE subscriptions ADD CONSTRAINT check_subscription_tier 
  CHECK (tier IN ('freemium', 'starter', 'professional', 'enterprise'));

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS check_subscription_status_values;
ALTER TABLE subscriptions ADD CONSTRAINT check_subscription_status_values 
  CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- Create trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 5. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT NULL,
  stripe_invoice_id VARCHAR(100) UNIQUE,
  amount_due DECIMAL(10,2),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20), -- draft, open, paid, void, uncollectible
  invoice_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_date TIMESTAMP NULL,
  invoice_pdf_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 6. Create tier_definitions table
CREATE TABLE IF NOT EXISTS tier_definitions (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_annual DECIMAL(10,2) DEFAULT 0,
  audits_per_month INT DEFAULT -1,
  max_internal_pages INT DEFAULT 25,
  max_external_links INT DEFAULT 10,
  max_domains INT DEFAULT 1,
  api_access BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  scheduled_audits BOOLEAN DEFAULT FALSE,
  team_members INT DEFAULT 1,
  priority_support BOOLEAN DEFAULT FALSE,
  data_retention_days INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for tier_definitions updated_at
DROP TRIGGER IF EXISTS update_tier_definitions_updated_at ON tier_definitions;
CREATE TRIGGER update_tier_definitions_updated_at
  BEFORE UPDATE ON tier_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tier_definitions_tier_name ON tier_definitions(tier_name);
CREATE INDEX IF NOT EXISTS idx_tier_definitions_is_active ON tier_definitions(is_active);

COMMIT;
