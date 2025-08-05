#!/usr/bin/env node

/**
 * Migration Runner Script
 * Run database migrations from command line
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { runMigrations, getMigrationStatus } from '../models/migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'migrate':
        console.log('🔄 Running database migrations...');
        await runMigrations();
        console.log('✅ All migrations completed successfully');
        break;
        
      case 'status':
        console.log('📊 Checking migration status...');
        const status = await getMigrationStatus();
        
        if (status.length === 0) {
          console.log('📋 No migrations found');
        } else {
          console.log('📋 Migration Status:');
          status.forEach(migration => {
            const status = migration.executed_at ? '✅ Applied' : '⏳ Pending';
            const date = migration.executed_at ? new Date(migration.executed_at).toLocaleString() : 'Not applied';
            console.log(`  ${migration.name}: ${status} (${date})`);
          });
        }
        break;
        
      case 'help':
      case '--help':
      case '-h':
        console.log(`
📖 Migration Commands:

  migrate     Run all pending migrations
  status      Show migration status
  help        Show this help message

Usage:
  node scripts/migrate.js <command>

Examples:
  node scripts/migrate.js migrate
  node scripts/migrate.js status
        `);
        break;
        
      default:
        console.log('❌ Unknown command. Use "help" to see available commands.');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

main();
