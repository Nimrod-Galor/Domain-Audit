/**
 * Database Setup Script for Multiple Environments
 * Supports Development, Testing, and Production Neon databases
 */
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : 
                env === 'test' ? '.env.test' : '.env';

dotenv.config({ path: envFile });

const ENVIRONMENTS = {
  development: {
    name: 'Development',
    dbUrl: process.env.DATABASE_URL,
    testUser: { email: 'dev@example.com', password: 'dev123', name: 'Dev User' }
  },
  test: {
    name: 'Testing', 
    dbUrl: process.env.TEST_DATABASE_URL,
    testUser: { email: 'test@example.com', password: 'test123', name: 'Test User' }
  },
  production: {
    name: 'Production',
    dbUrl: process.env.DATABASE_URL,
    testUser: null // No test user for production
  }
};

async function setupDatabase(environment = env) {
  const config = ENVIRONMENTS[environment];
  
  if (!config) {
    console.error(`❌ Unknown environment: ${environment}`);
    process.exit(1);
  }
  
  if (!config.dbUrl) {
    console.error(`❌ No database URL configured for ${config.name} environment`);
    console.log(`   Please update ${envFile} with the correct DATABASE_URL`);
    process.exit(1);
  }
  
  console.log(`🚀 Setting up ${config.name} database...`);
  console.log(`📁 Using config file: ${envFile}`);
  
  const pool = new Pool({
    connectionString: config.dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    console.log(`✅ Connected to ${config.name} Neon database`);
    
    // Create tables
    console.log('📋 Creating database tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        plan VARCHAR(50) DEFAULT 'free',
        tier VARCHAR(50) DEFAULT 'free',
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        google_id VARCHAR(255),
        oauth_provider VARCHAR(50),
        api_key VARCHAR(255)
      );
    `);
    
    // Audits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        domain VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        results JSONB,
        tier VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Database tables created/verified');
    
    // Create test user (only for dev and test environments)
    if (config.testUser && environment !== 'production') {
      console.log(`👤 Creating ${environment} test user...`);
      
      const hashedPassword = await bcrypt.hash(config.testUser.password, 10);
      
      const result = await client.query(`
        INSERT INTO users (
          email, password_hash, first_name, last_name, 
          email_verified, tier, plan, created_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, email, first_name, tier;
      `, [
        config.testUser.email, hashedPassword, 
        config.testUser.name.split(' ')[0], 
        config.testUser.name.split(' ')[1] || '',
        true, 'professional', 'professional'
      ]);
      
      console.log(`✅ Test user created/updated:`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Password: ${config.testUser.password}`);
      console.log(`   Tier: ${result.rows[0].tier}`);
    }
    
    client.release();
    await pool.end();
    
    console.log(`🎉 ${config.name} database setup complete!`);
    
    if (environment === 'development') {
      console.log('🚀 You can now run: npm run web:start');
    } else if (environment === 'test') {
      console.log('🧪 You can now run: npm run test');
    }
    
  } catch (error) {
    console.error(`❌ ${config.name} database setup failed:`, error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tips:');
      console.log('   1. Check your database URL in ' + envFile);
      console.log('   2. Ensure your Neon project is running');
      console.log('   3. Verify network connectivity');
    }
    
    process.exit(1);
  }
}

// Run setup if called directly
if (process.argv[1].endsWith('setup-databases.js')) {
  const targetEnv = process.argv[2] || process.env.NODE_ENV || 'development';
  setupDatabase(targetEnv);
}

export { setupDatabase };
