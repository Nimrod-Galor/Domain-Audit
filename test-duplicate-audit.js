// Test to verify single audit record creation
import('./web/models/database.js').then(async (db) => {
  await db.initializeDatabase();
  return import('./web/lib/jobQueue.js');
}).then(async (JobQueueModule) => {
  console.log('🧪 Testing duplicate audit record fix...');
  
  const testUrl = 'test-duplicate-fix.com';
  
  // Check initial count
  const pool = (await import('./web/models/database.js')).getPool();
  const initialResult = await pool.query('SELECT COUNT(*) as count FROM audits WHERE url = $1', [testUrl]);
  const initialCount = parseInt(initialResult.rows[0].count);
  console.log(`📊 Initial audit records for ${testUrl}: ${initialCount}`);
  
  // Clean up any existing records for this test
  if (initialCount > 0) {
    await pool.query('DELETE FROM audits WHERE url = $1', [testUrl]);
    console.log('🧹 Cleaned up existing test records');
  }
  
  // Import dependencies
  const { AuditExecutor } = await import('./web/lib/audit-executor.js');
  const { default: jobQueue } = JobQueueModule;
  const activeSessions = new Map();
  const Audit = (await import('./web/models/Audit.js')).default;
  const tierService = await import('./web/services/tierService.js');
  
  // Inject dependencies
  const auditExecutor = new AuditExecutor();
  jobQueue.injectDependencies({ auditExecutor, activeSessions, Audit, tierService });
  
  // Simulate job queue audit
  console.log('🚀 Adding audit job to queue...');
  const job = await jobQueue.add('runAudit', {
    url: testUrl,
    reportType: 'simple',
    maxPages: 5,
    priority: 'high',
    sessionId: 'test-session-' + Date.now(),
    userLimits: {
      isRegistered: false,
      maxExternalLinks: 10,
      maxPagesPerAudit: 50,
      tierName: 'free'
    }
  });
  
  console.log('⏳ Waiting for job to complete...');
  
  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check final count
  const finalResult = await pool.query('SELECT COUNT(*) as count FROM audits WHERE url = $1', [testUrl]);
  const finalCount = parseInt(finalResult.rows[0].count);
  console.log(`📊 Final audit records for ${testUrl}: ${finalCount}`);
  
  // Get audit details
  const auditRecords = await pool.query('SELECT id, status, created_at FROM audits WHERE url = $1 ORDER BY created_at', [testUrl]);
  console.log('📋 Audit records:');
  auditRecords.rows.forEach((record, i) => {
    console.log(`  ${i + 1}. ID: ${record.id}, Status: ${record.status}, Created: ${record.created_at}`);
  });
  
  if (finalCount === 1) {
    console.log('✅ SUCCESS: Only one audit record created!');
  } else {
    console.log(`❌ FAILED: ${finalCount} audit records created (expected 1)`);
  }
  
  // Clean up
  await pool.query('DELETE FROM audits WHERE url = $1', [testUrl]);
  console.log('🧹 Cleaned up test records');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
