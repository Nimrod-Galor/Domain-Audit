#!/usr/bin/env node

/**
 * Existing Users Migration Script
 * Migrates existing users to the new tier system with appropriate defaults
 */

import { initializeDatabase, query, testConnection, closeDatabase } from '../models/database.js';

/**
 * Migrate existing users to tier system
 */
async function migrateExistingUsers() {
  console.log('🔄 Migrating Existing Users to Tier System');
  console.log('=' .repeat(50));
  
  try {
    // Initialize database
    initializeDatabase();
    await testConnection();
    
    // 1. Get all existing users
    console.log('📊 Analyzing existing users...');
    const usersResult = await query(`
      SELECT id, email, plan, tier, created_at, last_login
      FROM users 
      ORDER BY created_at ASC
    `);
    
    console.log(`Found ${usersResult.rows.length} existing users`);
    
    if (usersResult.rows.length === 0) {
      console.log('✅ No existing users to migrate');
      return;
    }
    
    // 2. Update users without tier information
    console.log('\n🔄 Updating user tiers...');
    
    for (const user of usersResult.rows) {
      let targetTier = 'starter'; // Default tier for existing users
      
      // Map existing plan to new tier structure
      if (user.plan === 'free') {
        targetTier = 'starter';
      } else if (user.plan === 'professional') {
        targetTier = 'professional';
      } else if (user.plan === 'business') {
        targetTier = 'enterprise';
      }
      
      // Override if tier is already set and valid
      if (user.tier && ['freemium', 'starter', 'professional', 'enterprise'].includes(user.tier)) {
        targetTier = user.tier;
      }
      
      // Update user tier
      await query(`
        UPDATE users 
        SET tier = $1, 
            subscription_status = 'active',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [targetTier, user.id]);
      
      console.log(`  ✅ ${user.email}: ${user.plan || 'unknown'} → ${targetTier}`);
    }
    
    // 3. Create user limits for all users
    console.log('\n🎯 Creating user limits...');
    
    const userLimitsResult = await query(`
      INSERT INTO user_limits (
        user_id, tier, audits_per_month, max_internal_pages, 
        max_external_links, max_domains, api_access, white_label,
        scheduled_audits, team_members, priority_support, data_retention_days
      )
      SELECT 
        u.id,
        u.tier,
        td.audits_per_month,
        td.max_internal_pages,
        td.max_external_links,
        td.max_domains,
        td.api_access,
        td.white_label,
        td.scheduled_audits,
        td.team_members,
        td.priority_support,
        td.data_retention_days
      FROM users u
      JOIN tier_definitions td ON u.tier = td.tier_name
      WHERE u.id NOT IN (SELECT user_id FROM user_limits)
      RETURNING user_id, tier
    `);
    
    console.log(`✅ Created limits for ${userLimitsResult.rows.length} users`);
    
    // 4. Initialize usage tracking for current month
    console.log('\n📈 Initializing usage tracking...');
    
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    
    const usageResult = await query(`
      INSERT INTO usage_tracking (user_id, month_year, audits_used, internal_pages_scanned, external_links_checked, api_calls_used)
      SELECT 
        u.id,
        $1::text,
        0,
        0,
        0,
        0
      FROM users u
      WHERE u.id NOT IN (
        SELECT user_id FROM usage_tracking WHERE month_year = $1::text
      )
      RETURNING user_id
    `, [currentMonth]);
    
    console.log(`✅ Initialized usage tracking for ${usageResult.rows.length} users for ${currentMonth}`);
    
    // 5. Update existing audits with tier information
    console.log('\n🔍 Updating audit tier information...');
    
    await query(`
      UPDATE audits 
      SET user_tier = COALESCE(
        (SELECT tier FROM users WHERE users.id = audits.user_id),
        'freemium'
      )
      WHERE user_tier = 'freemium' OR user_tier IS NULL
    `);
    
    const auditUpdateResult = await query(`
      SELECT COUNT(*) as count FROM audits WHERE user_tier != 'freemium'
    `);
    
    console.log(`✅ Updated ${auditUpdateResult.rows[0].count} audits with tier information`);
    
    // 6. Generate API keys for professional and enterprise users
    console.log('\n🔑 Generating API keys for eligible users...');
    
    const eligibleUsers = await query(`
      SELECT id, email, tier FROM users 
      WHERE tier IN ('professional', 'enterprise') 
      AND (api_key IS NULL OR api_key = '')
    `);
    
    let apiKeysGenerated = 0;
    for (const user of eligibleUsers.rows) {
      // Generate a secure API key
      const crypto = await import('crypto');
      const apiKey = 'sk_' + crypto.randomBytes(24).toString('hex');
      
      await query(`
        UPDATE users SET api_key = $1 WHERE id = $2
      `, [apiKey, user.id]);
      
      console.log(`  🔑 Generated API key for ${user.email} (${user.tier})`);
      apiKeysGenerated++;
    }
    
    console.log(`✅ Generated ${apiKeysGenerated} API keys`);
    
    // 7. Final verification
    console.log('\n✅ Migration Summary:');
    console.log('=' .repeat(50));
    
    const summaryResult = await query(`
      SELECT 
        u.tier,
        COUNT(*) as user_count,
        COUNT(ul.user_id) as limits_created,
        COUNT(ut.user_id) as usage_tracking_created
      FROM users u
      LEFT JOIN user_limits ul ON u.id = ul.user_id
      LEFT JOIN usage_tracking ut ON u.id = ut.user_id AND ut.month_year = $1
      GROUP BY u.tier
      ORDER BY 
        CASE u.tier 
          WHEN 'freemium' THEN 1 
          WHEN 'starter' THEN 2 
          WHEN 'professional' THEN 3 
          WHEN 'enterprise' THEN 4 
          ELSE 5 
        END
    `, [currentMonth]);
    
    summaryResult.rows.forEach(row => {
      console.log(`📊 ${row.tier.toUpperCase()}: ${row.user_count} users, ${row.limits_created} limits, ${row.usage_tracking_created} usage records`);
    });
    
    console.log('\n🎉 User Migration Complete!');
    console.log('🎯 All existing users have been migrated to the new tier system');
    console.log('📝 Next steps:');
    console.log('  1. Begin Phase 2: Backend Service Layer');
    console.log('  2. Set up Stripe test environment');
    console.log('  3. Create tier management services');
    
  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExistingUsers();
}

export { migrateExistingUsers };
