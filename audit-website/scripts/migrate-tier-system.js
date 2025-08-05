#!/usr/bin/env node

/**
 * Tier System Database Migration Script
 * Runs Phase 1 database migrations for the tier system implementation
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { initializeDatabase, query, testConnection, closeDatabase } from '../models/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of migration files to run for tier system
const tierMigrations = [
  '006_add_tier_system.sql',
  '007_add_audit_tier_tracking.sql', 
  '008_insert_tier_definitions.sql'
];

/**
 * Run a single migration file
 * @param {string} filename - Migration filename
 * @returns {Promise<boolean>} Success status
 */
async function runMigration(filename) {
  try {
    console.log(`📄 Running migration: ${filename}`);
    
    const migrationPath = join(__dirname, '..', 'migrations', filename);
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Check if migration was already applied
 * @param {string} migrationName - Migration name
 * @returns {Promise<boolean>} True if already applied
 */
async function isMigrationApplied(migrationName) {
  try {
    // Create migrations tracking table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS applied_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await query(
      'SELECT COUNT(*) as count FROM applied_migrations WHERE migration_name = $1',
      [migrationName]
    );
    
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.warn(`⚠️ Could not check migration status for ${migrationName}: ${error.message}`);
    return false;
  }
}

/**
 * Mark migration as applied
 * @param {string} migrationName - Migration name
 */
async function markMigrationApplied(migrationName) {
  try {
    await query(
      'INSERT INTO applied_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
      [migrationName]
    );
  } catch (error) {
    console.warn(`⚠️ Could not mark migration as applied: ${migrationName}`);
  }
}

/**
 * Run all tier system migrations
 */
async function runTierSystemMigrations() {
  console.log('🚀 Starting Tier System Database Migration (Phase 1)');
  console.log('=' .repeat(60));
  
  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    initializeDatabase();
    
    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connection established');
    console.log('');
    
    let successCount = 0;
    let skippedCount = 0;
    
    // Run each migration
    for (const migrationFile of tierMigrations) {
      const migrationName = migrationFile.replace('.sql', '');
      
      // Check if already applied
      const alreadyApplied = await isMigrationApplied(migrationName);
      if (alreadyApplied) {
        console.log(`⏭️  Skipping migration (already applied): ${migrationFile}`);
        skippedCount++;
        continue;
      }
      
      // Run the migration
      const success = await runMigration(migrationFile);
      if (success) {
        await markMigrationApplied(migrationName);
        successCount++;
      } else {
        throw new Error(`Migration failed: ${migrationFile}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('=' .repeat(60));
    console.log('🎉 Tier System Migration Completed Successfully!');
    console.log(`✅ Applied: ${successCount} migrations`);
    console.log(`⏭️  Skipped: ${skippedCount} migrations`);
    console.log('');
    
    // Verify tier system tables exist
    console.log('🔍 Verifying tier system tables...');
    const tablesToCheck = [
      'tier_definitions',
      'user_limits', 
      'usage_tracking',
      'subscriptions',
      'invoices',
      'scheduled_audits'
    ];
    
    for (const tableName of tablesToCheck) {
      const exists = await tableExists(tableName);
      if (exists) {
        console.log(`✅ Table exists: ${tableName}`);
      } else {
        console.log(`❌ Table missing: ${tableName}`);
      }
    }
    
    // Check tier definitions
    console.log('');
    console.log('🔍 Checking tier definitions...');
    const tierResult = await query('SELECT tier_name, display_name, price_monthly FROM tier_definitions ORDER BY price_monthly');
    tierResult.rows.forEach(tier => {
      console.log(`✅ ${tier.display_name} tier: $${tier.price_monthly}/month`);
    });
    
    // Check users table columns
    console.log('');
    console.log('🔍 Verifying users table updates...');
    const columnsResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('tier', 'subscription_status', 'stripe_customer_id')
      ORDER BY column_name
    `);
    
    if (columnsResult.rows.length >= 3) {
      console.log('✅ Users table updated with tier columns');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Users table missing tier columns');
    }
    
    console.log('');
    console.log('📊 Phase 1 Database Schema Implementation: COMPLETE');
    console.log('🎯 Next Steps:');
    console.log('  1. Update existing users with default tier limits');
    console.log('  2. Begin Phase 2: Backend Service Layer implementation');
    console.log('  3. Set up Stripe test environment');
    
  } catch (error) {
    console.error('');
    console.error('❌ Migration Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('  1. Check database connection settings');
    console.error('  2. Verify database permissions');
    console.error('  3. Review migration SQL for syntax errors');
    console.error('  4. Check logs for detailed error information');
    
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

/**
 * Check if table exists
 * @param {string} tableName - Table name to check
 * @returns {Promise<boolean>} True if exists
 */
async function tableExists(tableName) {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTierSystemMigrations();
}

export { runTierSystemMigrations };
