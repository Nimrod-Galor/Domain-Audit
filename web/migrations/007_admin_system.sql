-- Migration 007: Administrator Dashboard System
-- This adds admin functionality to the existing tier system

-- 1. Add admin-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions JSON;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- 2. Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'user', 'subscription', 'audit', 'system'
  target_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for admin activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_user_date ON admin_activity_log(admin_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target ON admin_activity_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action);

-- 3. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for system_settings updated_at
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) 
VALUES 
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', FALSE),
('max_concurrent_audits', '50', 'number', 'Maximum concurrent audits allowed', FALSE),
('default_audit_timeout', '900', 'number', 'Default audit timeout in seconds', FALSE),
('email_notifications_enabled', 'true', 'boolean', 'Enable system email notifications', FALSE),
('new_user_registration', 'true', 'boolean', 'Allow new user registrations', TRUE),
('freemium_daily_limit', '1', 'number', 'Daily audit limit for freemium users', TRUE),
('api_rate_limit_professional', '1000', 'number', 'API calls per month for professional tier', FALSE),
('api_rate_limit_enterprise', '10000', 'number', 'API calls per month for enterprise tier', FALSE)
ON CONFLICT (setting_key) DO NOTHING;

-- 5. Create a default admin user (password should be changed immediately)
-- Note: This uses a placeholder password hash that should be updated
INSERT INTO users (email, full_name, role, is_admin, admin_permissions, password_hash, tier, created_at)
VALUES (
  'admin@sitescope.com', 
  'System Administrator', 
  'super_admin', 
  TRUE, 
  '["users", "billing", "audits", "analytics", "system"]'::json, 
  '$2b$12$placeholder.hash.that.needs.to.be.changed.immediately', 
  'enterprise',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE,
  admin_permissions = '["users", "billing", "audits", "analytics", "system"]'::json,
  role = 'super_admin';

-- 6. Add some useful views for admin dashboard
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.tier,
  u.subscription_status,
  u.created_at,
  u.last_login_at,
  u.login_count,
  ul.audits_per_month,
  ul.max_internal_pages,
  s.status as subscription_status_detail,
  s.amount as subscription_amount,
  s.billing_cycle,
  ut.audits_used,
  ut.api_calls_used
FROM users u
LEFT JOIN user_limits ul ON u.id = ul.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN usage_tracking ut ON u.id = ut.user_id AND ut.month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
WHERE u.is_admin = FALSE;

CREATE OR REPLACE VIEW admin_audit_stats AS
SELECT 
  DATE(created_at) as audit_date,
  COUNT(*) as total_audits,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_audits,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_audits,
  COUNT(*) FILTER (WHERE status = 'running') as running_audits,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status = 'completed') as avg_duration_seconds,
  COUNT(DISTINCT user_id) as unique_users
FROM audits 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY audit_date DESC;

-- 7. Create indexes for better admin dashboard performance
CREATE INDEX IF NOT EXISTS idx_users_admin_search ON users(email, full_name) WHERE is_admin = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_tier_status ON users(tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_audits_date_status ON audits(created_at, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_amount ON subscriptions(status, amount);

-- 8. Add audit trigger for user login tracking
CREATE OR REPLACE FUNCTION update_user_login_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would be called when a user logs in
    -- For now, it's just a placeholder
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE admin_activity_log IS 'Tracks all administrative actions for audit purposes';
COMMENT ON TABLE system_settings IS 'Global system configuration settings';
COMMENT ON VIEW admin_user_overview IS 'Comprehensive user data for admin dashboard';
COMMENT ON VIEW admin_audit_stats IS 'Daily audit statistics for monitoring';
