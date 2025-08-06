-- Migration 008: Insert default tier definitions
-- Populate the tier_definitions table with initial data

BEGIN;

-- Insert default tier data
INSERT INTO tier_definitions (
  tier_name, display_name, price_monthly, price_annual, 
  audits_per_month, max_internal_pages, max_external_links, max_domains, 
  api_access, white_label, scheduled_audits, team_members, 
  priority_support, data_retention_days
) VALUES
('freemium', 'Freemium', 0, 0, 1, 25, 10, 1, FALSE, FALSE, FALSE, 1, FALSE, 7),
('starter', 'Starter', 0, 0, 3, 100, 50, 1, FALSE, FALSE, FALSE, 1, FALSE, 30),
('professional', 'Professional', 39, 29, -1, 1000, 200, 1, TRUE, TRUE, TRUE, 1, TRUE, 365),
('enterprise', 'Enterprise', 99, 79, -1, -1, -1, -1, TRUE, TRUE, TRUE, 10, TRUE, 730)
ON CONFLICT (tier_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  audits_per_month = EXCLUDED.audits_per_month,
  max_internal_pages = EXCLUDED.max_internal_pages,
  max_external_links = EXCLUDED.max_external_links,
  max_domains = EXCLUDED.max_domains,
  api_access = EXCLUDED.api_access,
  white_label = EXCLUDED.white_label,
  scheduled_audits = EXCLUDED.scheduled_audits,
  team_members = EXCLUDED.team_members,
  priority_support = EXCLUDED.priority_support,
  data_retention_days = EXCLUDED.data_retention_days,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
