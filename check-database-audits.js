/**
 * Check if there are any audits in the database and test PDF generation with existing data
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

// Load environment variables from web/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'web', '.env') });

console.log('🔍 Loading environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

console.log('🔍 Checking database for existing audits...\n');

async function checkAudits() {
  try {
    // Check if we can connect to database
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check for any completed audits
    const result = await client.query(`
      SELECT id, url, status, created_at, 
             CASE WHEN report_data IS NOT NULL THEN 'has_data' ELSE 'no_data' END as report_status
      FROM audits 
      WHERE status = 'completed' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log(`\nFound ${result.rows.length} completed audits:`);
    
    if (result.rows.length === 0) {
      console.log('❌ No completed audits found in database');
      console.log('This means the PDF route will try to run a fresh audit for httpbin.org');
      console.log('If the fresh audit fails, the PDF generation will fail too');
    } else {
      result.rows.forEach(row => {
        console.log(`- ID: ${row.id}, URL: ${row.url}, Status: ${row.status}, Report: ${row.report_status}, Date: ${row.created_at}`);
      });
      
      // Check if httpbin.org specifically has an audit
      const httpbinResult = await client.query(`
        SELECT id, url, status, created_at, 
               CASE WHEN report_data IS NOT NULL THEN 'has_data' ELSE 'no_data' END as report_status
        FROM audits 
        WHERE url LIKE '%httpbin.org%' AND status = 'completed'
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      if (httpbinResult.rows.length > 0) {
        console.log(`\n✅ Found existing audit for httpbin.org:`, httpbinResult.rows[0]);
      } else {
        console.log(`\n❌ No existing audit found for httpbin.org - will need fresh audit`);
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\nPossible issues:');
    console.log('- Database not running');
    console.log('- Wrong database credentials');
    console.log('- Database connection issues');
  } finally {
    await pool.end();
  }
}

checkAudits();
