import { query, initializeDatabase } from '../models/database.js';
import fs from 'fs';

async function runTierMigration() {
  try {
    console.log('🔄 Running tier alignment migration...');
    
    // Initialize database
    initializeDatabase();
    
    const migrationSQL = fs.readFileSync('./migrations/009_align_tier_definitions_with_source_of_truth.sql', 'utf8');
    
    await query(migrationSQL);
    console.log('✅ Migration 009 completed successfully');
    
    // Verify the changes
    const result = await query(`
      SELECT tier_name, audits_per_month, max_internal_pages, max_external_links, 
             data_retention_days, price_monthly, price_annual 
      FROM tier_definitions 
      ORDER BY tier_name
    `);
    
    console.log('\n📊 Updated tier definitions:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runTierMigration();
