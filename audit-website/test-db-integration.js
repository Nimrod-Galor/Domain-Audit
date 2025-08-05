import { getPool, query, initializeDatabase } from './models/database.js';
import { Audit } from './models/Audit.js';

async function testDatabaseIntegration() {
  try {
    console.log('🔍 Testing database integration...');
    
    // Initialize database connection
    initializeDatabase();
    console.log('✅ Database initialized');
    
    // Test 1: Check database connection
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection working:', result.rows[0].current_time);
    
    // Test 2: Check if audits table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'audits'
      );
    `);
    console.log('✅ Audits table exists:', tableCheck.rows[0].exists);
    
    // Test 3: Count existing audits
    const auditCount = await query('SELECT COUNT(*) as count FROM audits');
    console.log('📊 Audits in database:', auditCount.rows[0].count);
    
    // Test 4: Test Audit model
    console.log('🧪 Testing Audit model...');
    const testAudit = await Audit.create({
      userId: null, // null for unregistered user
      domain: 'https://test-example.com',
      auditType: 'simple',
      config: {
        maxPages: 1,
        priority: 'standard'
      }
    });
    console.log('✅ Test audit created:', testAudit.id);
    
    // Test 5: Update the test audit
    await Audit.updateStatus(testAudit.id, 'completed', {
      report_data: { test: 'data' },
      score: 85,
      duration_ms: 5000,
      pages_scanned: 1,
      external_links_checked: 5
    });
    console.log('✅ Test audit updated successfully');
    
    // Test 6: Retrieve the test audit
    const retrievedAudit = await Audit.findById(testAudit.id);
    console.log('✅ Test audit retrieved:', {
      id: retrievedAudit.id,
      status: retrievedAudit.status,
      score: retrievedAudit.score
    });
    
    console.log('🎉 Database integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
  } finally {
    const pool = getPool();
    await pool.end();
  }
}

testDatabaseIntegration();
