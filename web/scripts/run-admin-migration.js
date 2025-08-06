#!/usr/bin/env node

/**
 * Admin System Migration Script
 * Run this to set up the administrator dashboard tables and data
 */

import { query, testConnection } from '../models/database.js';
import fs from 'fs';
import path from 'path';

async function runAdminMigration() {
  try {
    console.log('🚀 Starting Admin System Migration...');
    
    // Test database connection first
    await testConnection();
    console.log('✅ Database connection verified');
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '007_admin_system.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    // Split migration into individual statements
    // Handle multi-line function definitions properly
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    
    const lines = migration.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if we're entering a function definition
      if (trimmedLine.includes('CREATE OR REPLACE FUNCTION') || 
          trimmedLine.includes('CREATE FUNCTION')) {
        inFunction = true;
      }
      
      // Check if we're exiting a function definition
      if (inFunction && trimmedLine.includes('$$ language')) {
        inFunction = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
        continue;
      }
      
      // If not in a function and line ends with semicolon, it's end of statement
      if (!inFunction && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        await query(statement);
        console.log(`✅ Statement ${i + 1} completed successfully`);
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key')) {
          console.log(`⚠️ Statement ${i + 1} - Already exists, skipping...`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error('Statement was:', statement.substring(0, 100) + '...');
          // Continue with other statements instead of failing completely
        }
      }
    }
    
    // Verify admin tables were created
    console.log('\n🔍 Verifying admin system setup...');
    
    try {
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('admin_activity_log', 'system_settings')
      `);
      
      console.log(`✅ Found ${result.rows.length} admin tables:`, 
                  result.rows.map(r => r.table_name).join(', '));
      
      // Check if admin user exists
      const adminCheck = await query(`
        SELECT email, is_admin 
        FROM users 
        WHERE is_admin = true 
        LIMIT 1
      `);
      
      if (adminCheck.rows.length > 0) {
        console.log(`✅ Admin user found: ${adminCheck.rows[0].email}`);
      } else {
        console.log('⚠️ No admin user found - you may need to manually create one');
      }
      
    } catch (error) {
      console.error('❌ Error verifying setup:', error.message);
    }
    
    console.log('\n🎉 Admin System Migration Completed!');
    console.log('📋 Next steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Access admin dashboard: http://localhost:3000/admin');
    console.log('   3. Update the default admin password');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAdminMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export { runAdminMigration };
