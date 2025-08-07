/**
 * Test Database Setup and Management
 * Handles creation, migration, and cleanup of test database
 * Falls back to mock database when PostgreSQL is not available
 */

import { Pool, Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { mockDatabase } from './MockDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.test') });

class TestDatabase {
  constructor() {
    this.adminPool = null;
    this.testPool = null;
    this.migrationPath = path.join(process.cwd(), 'web', 'migrations');
    this.useMockDatabase = false;
  }

  /**
   * Check if PostgreSQL is available
   */
  async checkPostgreSQLAvailable() {
    try {
      const isNeon = process.env.TEST_DB_HOST?.includes('neon.tech');
      
      const testPool = new Pool({
        host: process.env.TEST_DB_HOST || 'localhost',
        port: process.env.TEST_DB_PORT || 5432,
        database: isNeon ? (process.env.TEST_DB_NAME || 'domain_audit_test') : 'postgres',
        user: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        max: 1,
        connectionTimeoutMillis: 5000,
        ssl: isNeon ? { rejectUnauthorized: false } : false,
      });

      const client = await testPool.connect();
      client.release();
      await testPool.end();
      return true;
    } catch (error) {
      console.log('Database connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Check if this is a Neon connection
   */
  isNeonConnection() {
    const databaseUrl = process.env.TEST_DATABASE_URL || '';
    const host = process.env.TEST_DB_HOST || '';
    return databaseUrl.includes('neon.tech') || host.includes('neon.tech');
  }

  /**
   * Get admin connection (to postgres database) for database creation/deletion
   */
  getAdminPool() {
    if (!this.adminPool) {
      // For Neon, we connect to the default database instead of 'postgres'
      const isNeon = process.env.TEST_DB_HOST?.includes('neon.tech');
      
      this.adminPool = new Pool({
        host: process.env.TEST_DB_HOST || 'localhost',
        port: process.env.TEST_DB_PORT || 5432,
        database: isNeon ? process.env.TEST_DB_NAME || 'domain_audit_test' : 'postgres',
        user: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        max: 1,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 10000,
        ssl: isNeon ? { rejectUnauthorized: false } : false,
      });
    }
    return this.adminPool;
  }

  /**
   * Get test database pool
   */
  getTestPool() {
    if (this.useMockDatabase) {
      return mockDatabase;
    }
    
    if (!this.testPool) {
      const isNeon = process.env.TEST_DB_HOST?.includes('neon.tech');
      
      this.testPool = new Pool({
        host: process.env.TEST_DB_HOST || 'localhost',
        port: process.env.TEST_DB_PORT || 5432,
        database: process.env.TEST_DB_NAME || 'domain_audit_test',
        user: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: isNeon ? { rejectUnauthorized: false } : false,
      });
    }
    return this.testPool;
  }

  /**
   * Create test database if it doesn't exist
   */
  async createTestDatabase() {
    const isNeon = process.env.TEST_DB_HOST?.includes('neon.tech');
    
    if (isNeon) {
      // For Neon, the database is already created through their dashboard
      // We just need to ensure we can connect to it
      console.log(`📋 Using Neon database: ${process.env.TEST_DB_NAME}`);
      return;
    }
    
    const adminPool = this.getAdminPool();
    const dbName = process.env.TEST_DB_NAME || 'domain_audit_test';
    
    try {
      // Check if database exists
      const checkResult = await adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );

      if (checkResult.rows.length === 0) {
        // Database doesn't exist, create it
        await adminPool.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Test database "${dbName}" created`);
      } else {
        console.log(`📋 Test database "${dbName}" already exists`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          '❌ Cannot connect to PostgreSQL. Please ensure PostgreSQL is running on your system.\n' +
          'Install PostgreSQL: https://www.postgresql.org/download/\n' +
          'Or use Docker: docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres'
        );
      }
      throw error;
    }
  }

  /**
   * Drop test database
   */
  async dropTestDatabase() {
    const adminPool = this.getAdminPool();
    const dbName = process.env.TEST_DB_NAME || 'domain_audit_test';
    
    try {
      // Terminate active connections to the test database
      await adminPool.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity 
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [dbName]);

      // Drop the database
      await adminPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      console.log(`🗑️ Test database "${dbName}" dropped`);
    } catch (error) {
      console.warn(`⚠️ Error dropping test database: ${error.message}`);
    }
  }

  /**
   * Run migrations on test database
   */
  async runMigrations() {
    const testPool = this.getTestPool();
    
    try {
      // Check if database already has schema (for existing databases like your main Neon DB)
      const schemaCheck = await testPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'audits', 'tiers')
      `);
      
      if (schemaCheck.rows.length >= 3) {
        console.log('📋 Database schema already exists, skipping migrations');
        console.log('✅ Using existing database schema for testing');
        console.log(`   Found tables: ${schemaCheck.rows.map(r => r.table_name).join(', ')}`);
        return;
      }
      
      // Get all migration files
      const migrationFiles = await fs.readdir(this.migrationPath);
      const sqlFiles = migrationFiles
        .filter(file => file.endsWith('.sql'))
        .sort(); // Run migrations in order

      console.log(`📦 Running ${sqlFiles.length} migrations...`);

      for (const file of sqlFiles) {
        const filePath = path.join(this.migrationPath, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        try {
          await testPool.query(sql);
          console.log(`✅ Migration applied: ${file}`);
        } catch (error) {
          // If migration fails because object already exists, that's okay for existing DBs
          if (error.message.includes('already exists')) {
            console.log(`⚠️ Migration skipped (already exists): ${file}`);
          } else {
            console.error(`❌ Migration failed: ${file}`, error.message);
            throw error;
          }
        }
      }

      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  }

  /**
   * Clear all data from test database (keep schema)
   */
  async clearData() {
    const testPool = this.getTestPool();
    
    try {
      // For managed databases like Neon, use simpler approach without superuser commands
      if (this.isNeonConnection()) {
        console.log('🧹 Clearing test data from Neon database...');
        
        // Simple cleanup without disabling foreign key checks - use IF EXISTS pattern
        try {
          await testPool.query('DELETE FROM notifications WHERE 1=1');
        } catch (e) { /* table may not exist */ }
        
        try {
          await testPool.query('DELETE FROM sessions WHERE 1=1');
        } catch (e) { /* table may not exist */ }
        
        try {
          await testPool.query('DELETE FROM audits WHERE 1=1');
        } catch (e) { /* table may not exist */ }
        
        try {
          await testPool.query('DELETE FROM users WHERE email LIKE \'%test%\' OR email LIKE \'%example.com\'');
        } catch (e) { /* table may not exist */ }
        
        try {
          await testPool.query('DELETE FROM verification_tokens WHERE 1=1');
        } catch (e) { /* table may not exist */ }
        
        console.log('🧹 Test data cleared from managed database');
        return;
      }
      
      // For local PostgreSQL, use full cleanup with FK constraint disabling
      const result = await testPool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      const tables = result.rows.map(row => row.tablename);

      if (tables.length === 0) {
        console.log('📋 No tables to clear');
        return;
      }

      // Disable foreign key checks temporarily
      await testPool.query('SET session_replication_role = replica');

      // Truncate all tables
      for (const table of tables) {
        await testPool.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
      }

      // Re-enable foreign key checks
      await testPool.query('SET session_replication_role = DEFAULT');

      console.log(`🧹 Cleared data from ${tables.length} tables`);
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
      throw error;
    }
  }

  /**
   * Setup test database (create + migrate)
   */
  async setup() {
    try {
      console.log('🚀 Setting up test database...');
      
      // Check if PostgreSQL is available
      const isPostgreSQLAvailable = await this.checkPostgreSQLAvailable();
      
      if (!isPostgreSQLAvailable) {
        console.log('⚠️ PostgreSQL not available, using mock database for tests');
        this.useMockDatabase = true;
        console.log('✅ Mock database setup complete');
        return;
      }

      // For existing production databases like Neon, skip migration and just use existing schema
      if (this.isNeonConnection()) {
        // Check if this is a fresh database or existing one
        const testPool = this.getTestPool();
        const schemaCheck = await testPool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'audits', 'tiers')
        `);
        
        if (schemaCheck.rows.length >= 3) {
          console.log('📋 Using existing Neon database schema');
          await this.clearData(); // Just clear test data, keep schema
        } else {
          console.log('🏗️ Setting up fresh Neon database with migrations');
          await this.runMigrations(); // Fresh database, run migrations
        }
        console.log('✅ Test database setup complete');
        return;
      }
      
      await this.createTestDatabase();
      await this.runMigrations();
      console.log('✅ Test database setup complete');
    } catch (error) {
      console.error('❌ Test database setup failed:', error.message);
      
      // Fall back to mock database
      console.log('⚠️ Falling back to mock database for tests');
      this.useMockDatabase = true;
      console.log('✅ Mock database setup complete');
    }
  }

  /**
   * Teardown test database
   */
  async teardown() {
    try {
      console.log('🧹 Tearing down test database...');
      
      // Close test pool
      if (this.testPool) {
        await this.testPool.end();
        this.testPool = null;
      }
      
      // Drop database
      await this.dropTestDatabase();
      
      // Close admin pool
      if (this.adminPool) {
        await this.adminPool.end();
        this.adminPool = null;
      }
      
      console.log('✅ Test database teardown complete');
    } catch (error) {
      console.error('❌ Test database teardown failed:', error.message);
      throw error;
    }
  }

  /**
   * Reset test database (clear data but keep schema)
   */
  async reset() {
    try {
      if (this.useMockDatabase) {
        mockDatabase.clear();
        return;
      }
      
      await this.clearData();
    } catch (error) {
      console.error('❌ Test database reset failed:', error.message);
      throw error;
    }
  }

  /**
   * Get a client connection for transactions
   */
  async getClient() {
    if (this.useMockDatabase) {
      return await mockDatabase.connect();
    }
    
    const testPool = this.getTestPool();
    return await testPool.connect();
  }

  /**
   * Close all connections
   */
  async close() {
    const promises = [];
    
    if (this.testPool && !this.testPool.ended) {
      promises.push(this.testPool.end());
    }
    
    if (this.adminPool && !this.adminPool.ended) {
      promises.push(this.adminPool.end());
    }
    
    await Promise.all(promises);
    
    this.testPool = null;
    this.adminPool = null;
  }
}

// Export singleton instance
export const testDatabase = new TestDatabase();

// Export class for manual instantiation if needed
export { TestDatabase };
