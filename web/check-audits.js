import { query } from './models/database.js';

async function checkAudits() {
  try {
    console.log('=== ALL AUDITS IN DATABASE ===');
    const result = await query('SELECT id, user_id, url, status, created_at FROM audits ORDER BY created_at DESC');
    result.rows.forEach((audit, index) => {
      console.log(`${index + 1}. ID: ${audit.id}, User: ${audit.user_id}, URL: "${audit.url}", Status: ${audit.status}`);
    });
    
    console.log('\n=== AUDITS FOR USER 2 ===');
    const userResult = await query('SELECT id, url, status, created_at FROM audits WHERE user_id = 2 ORDER BY created_at DESC');
    userResult.rows.forEach((audit, index) => {
      console.log(`${index + 1}. ID: ${audit.id}, URL: "${audit.url}" (type: ${typeof audit.url}), Status: ${audit.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAudits();
