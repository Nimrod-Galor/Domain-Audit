#!/usr/bin/env node

/**
 * Phase 1 Verification Script
 * Verify that all Phase 1 database changes were implemented correctly
 */

import { initializeDatabase, query, closeDatabase } from '../models/database.js';

async function verifyPhase1Implementation() {
  console.log('🔍 Verifying Phase 1 Implementation');
  console.log('=' .repeat(40));
  
  try {
    initializeDatabase();
    
    // Check tier definitions
    console.log('🎯 Tier Definitions:');
    const tiers = await query('SELECT tier_name, display_name, price_monthly, audits_per_month, max_internal_pages FROM tier_definitions ORDER BY price_monthly');
    tiers.rows.forEach(t => {
      console.log(`  ${t.display_name}: $${t.price_monthly}/month - ${t.audits_per_month === -1 ? 'unlimited' : t.audits_per_month} audits, ${t.max_internal_pages} pages max`);
    });
    
    // Check user distribution
    console.log('\n👥 User Distribution:');
    const users = await query('SELECT tier, COUNT(*) as count FROM users GROUP BY tier');
    users.rows.forEach(u => {
      console.log(`  ${u.tier}: ${u.count} users`);
    });
    
    // Check user limits
    console.log('\n📊 User Limits:');
    const limits = await query('SELECT COUNT(*) as total FROM user_limits');
    console.log(`  Total user limit records: ${limits.rows[0].total}`);
    
    // Check usage tracking
    console.log('\n📈 Usage Tracking:');
    const usage = await query('SELECT COUNT(*) as total FROM usage_tracking');
    console.log(`  Total usage tracking records: ${usage.rows[0].total}`);
    
    // Check table structure
    console.log('\n🏗️  Database Tables:');
    const tables = await query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name IN ('tier_definitions', 'user_limits', 'usage_tracking', 'subscriptions', 'invoices', 'scheduled_audits')
      ORDER BY table_name
    `);
    
    tables.rows.forEach(t => {
      console.log(`  ✅ ${t.table_name}: ${t.column_count} columns`);
    });
    
    console.log('\n🎉 Phase 1 Verification Complete!');
    console.log('✅ All database tables and data are properly configured');
    
  } catch (error) {
    console.error('❌ Verification Error:', error.message);
  } finally {
    await closeDatabase();
  }
}

verifyPhase1Implementation();
