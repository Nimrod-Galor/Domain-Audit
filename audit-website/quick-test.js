// Quick test to verify audit creation for registered users
import { getPool, query, initializeDatabase } from './models/database.js';
import { Audit } from './models/Audit.js';

async function quickUserAuditTest() {
  try {
    initializeDatabase();
    console.log('🧪 Testing user audit flow...');
    
    // Simulate creating an audit for a registered user
    const testAudit = await Audit.create({
      userId: 1, // Simulate user ID 1
      domain: 'https://example.com',
      auditType: 'simple',
      config: {
        maxPages: 5,
        priority: 'standard'
      }
    });
    
    console.log('✅ User audit created:', testAudit.id);
    
    // Check total audits in database
    const count = await query('SELECT COUNT(*) as count FROM audits');
    console.log('📊 Total audits in database:', count.rows[0].count);
    
    getPool().end();
    console.log('🎉 User audit test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    getPool().end();
  }
}

quickUserAuditTest();
