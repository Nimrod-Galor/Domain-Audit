import { query } from './models/database.js';

async function addVerificationColumns() {
  try {
    console.log('🔄 Starting database migration...');
    
    console.log('📋 Adding verification_token column...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)');
    
    console.log('📋 Adding verification_token_expires column...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP');
    
    console.log('📋 Adding verification_sent_at column...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP');
    
    console.log('✅ Migration completed successfully!');
    
    // Verify columns were added
    const result = await query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name LIKE $2', ['users', '%verification%']);
    console.log('🔍 Verification columns found:');
    result.rows.forEach(row => console.log(`  - ${row.column_name}`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
  
  process.exit(0);
}

addVerificationColumns();
