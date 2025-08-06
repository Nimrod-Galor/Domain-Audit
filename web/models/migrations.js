/**
 * Database Migration Runner
 * Handles running SQL migration files
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initializeDatabase, testConnection } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration files in order
const MIGRATIONS = [
  '001_create_users.sql',
  '002_create_audits.sql',
  '003_add_oauth_support.sql',
  '004_add_verification_tokens.sql',
  '005_create_notifications.sql'
];

/**
 * Create migrations tracking table
 */
const createMigrationsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Migrations table ready');
};

/**
 * Check if migration has been executed
 */
const isMigrationExecuted = async (filename) => {
  const result = await query(
    'SELECT id FROM migrations WHERE filename = $1',
    [filename]
  );
  return result.rows.length > 0;
};

/**
 * Mark migration as executed
 */
const markMigrationExecuted = async (filename) => {
  await query(
    'INSERT INTO migrations (filename) VALUES ($1)',
    [filename]
  );
};

/**
 * Execute a single migration file
 */
const executeMigration = async (filename) => {
  const migrationPath = path.join(__dirname, '..', 'migrations', filename);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${filename}`);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`🔄 Executing migration: ${filename}`);
  
  try {
    await query(sql);
    await markMigrationExecuted(filename);
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    throw error;
  }
};

/**
 * Run all pending migrations
 */
export const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Initialize database connection
    initializeDatabase();
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    // Create migrations table
    await createMigrationsTable();
    
    // Run pending migrations
    let executedCount = 0;
    
    for (const migration of MIGRATIONS) {
      const executed = await isMigrationExecuted(migration);
      
      if (!executed) {
        await executeMigration(migration);
        executedCount++;
      } else {
        console.log(`⏭️  Skipping already executed migration: ${migration}`);
      }
    }
    
    if (executedCount === 0) {
      console.log('✅ All migrations are up to date');
    } else {
      console.log(`✅ Successfully executed ${executedCount} migration(s)`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

/**
 * Get migration status
 */
export const getMigrationStatus = async () => {
  try {
    await createMigrationsTable();
    
    const result = await query('SELECT filename, executed_at FROM migrations ORDER BY executed_at');
    const executedMigrations = result.rows.map(row => row.filename);
    
    console.log('\n📋 Migration Status:');
    console.log('===================');
    
    for (const migration of MIGRATIONS) {
      const status = executedMigrations.includes(migration) ? '✅ EXECUTED' : '⏳ PENDING';
      console.log(`${status} - ${migration}`);
    }
    
    return {
      total: MIGRATIONS.length,
      executed: executedMigrations.length,
      pending: MIGRATIONS.length - executedMigrations.length
    };
    
  } catch (error) {
    console.error('❌ Failed to get migration status:', error.message);
    throw error;
  }
};

// CLI support for running migrations directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'run':
      runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'status':
      getMigrationStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log('Usage:');
      console.log('  node migrations.js run    - Run pending migrations');
      console.log('  node migrations.js status - Show migration status');
      process.exit(1);
  }
}
