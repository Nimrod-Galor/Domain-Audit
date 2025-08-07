#!/usr/bin/env node

/**
 * Database Setup Script for Tests
 * Sets up PostgreSQL test database and runs migrations
 */

import { testDatabase } from '../tests/helpers/TestDatabase.js';

async function setupDatabase() {
  console.log('🚀 Setting up test database...\n');
  
  try {
    // Setup database
    await testDatabase.setup();
    
    console.log('\n✅ Test database setup completed successfully!');
    console.log('\nYou can now run tests with:');
    console.log('  npm test');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n📋 PostgreSQL Setup Instructions:');
      console.log('');
      console.log('Option 1 - Install PostgreSQL locally:');
      console.log('  Windows: Download from https://www.postgresql.org/download/windows/');
      console.log('  macOS: brew install postgresql');
      console.log('  Linux: sudo apt-get install postgresql');
      console.log('');
      console.log('Option 2 - Use Docker:');
      console.log('  docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres');
      console.log('');
      console.log('After installation, modify .env.test file with your database credentials.');
    }
    
    process.exit(1);
  } finally {
    await testDatabase.close();
  }
}

async function teardownDatabase() {
  console.log('🧹 Tearing down test database...\n');
  
  try {
    await testDatabase.teardown();
    console.log('\n✅ Test database teardown completed successfully!');
  } catch (error) {
    console.error('\n❌ Database teardown failed:', error.message);
    process.exit(1);
  } finally {
    await testDatabase.close();
  }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupDatabase();
    break;
  case 'teardown':
    teardownDatabase();
    break;
  case 'reset':
    console.log('🔄 Resetting test database...\n');
    try {
      await testDatabase.reset();
      console.log('\n✅ Test database reset completed successfully!');
    } catch (error) {
      console.error('\n❌ Database reset failed:', error.message);
      process.exit(1);
    } finally {
      await testDatabase.close();
    }
    break;
  default:
    console.log('Database Management Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/setup-test-db.js setup     - Create and migrate test database');
    console.log('  node scripts/setup-test-db.js teardown - Drop test database');
    console.log('  node scripts/setup-test-db.js reset    - Clear test database data');
    break;
}
