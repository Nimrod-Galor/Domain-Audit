-- Migration 009: Align tier definitions with improved-tier-system.md source of truth
-- Update tier definitions to exactly match the source of truth requirements

BEGIN;

-- Update tier definitions to match improved-tier-system.md exactly
UPDATE tier_definitions SET
  audits_per_month = 30,  -- 1 audit per day = ~30 per month
  data_retention_days = 0  -- No history tracking for freemium
WHERE tier_name = 'freemium';

-- Ensure Starter tier matches source of truth
UPDATE tier_definitions SET
  audits_per_month = 3,
  max_internal_pages = 100,
  max_external_links = 50,
  data_retention_days = 30
WHERE tier_name = 'starter';

-- Ensure Professional tier matches source of truth  
UPDATE tier_definitions SET
  audits_per_month = -1,  -- Unlimited
  max_internal_pages = 1000,
  max_external_links = 200,
  price_annual = 29,  -- $29/month when paid annually (26% off $39)
  data_retention_days = 365
WHERE tier_name = 'professional';

-- Ensure Enterprise tier matches source of truth
UPDATE tier_definitions SET
  audits_per_month = -1,  -- Unlimited
  max_internal_pages = -1,  -- Unlimited
  max_external_links = -1,  -- Unlimited
  price_annual = 79,  -- $79/month when paid annually (20% off $99)
  data_retention_days = 730,
  team_members = 10
WHERE tier_name = 'enterprise';

-- Add any missing columns or update schema if needed
-- (This would go here if database schema needs changes)

COMMIT;
