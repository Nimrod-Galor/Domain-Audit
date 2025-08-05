import { query } from '../models/database.js';

async function addOAuthSupport() {
  try {
    console.log('🔄 Adding OAuth support to users table...');
    
    // Add OAuth columns
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50)');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT');
    
    // Make password optional for OAuth users
    await query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
    
    // Add indexes for performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL');
    await query('CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider) WHERE oauth_provider IS NOT NULL');
    
    console.log('✅ OAuth support added successfully');
  } catch (error) {
    console.error('❌ Error adding OAuth support:', error.message);
  }
  process.exit(0);
}

addOAuthSupport();
