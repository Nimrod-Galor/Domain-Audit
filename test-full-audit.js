// Test a complete audit through the job queue system
import('./web/models/database.js').then(async (db) => {
  await db.initializeDatabase();
  return import('./web/lib/jobQueue.js');
}).then(async (JobQueueModule) => {
  console.log('🚀 Testing complete audit flow...');
  
  const JobQueue = JobQueueModule.default;
  const jobQueue = new JobQueue();
  
  // Add a test audit job
  const testAudit = {
    domain: 'example.com',
    user_id: 'test-user',
    priority: 'high',
    audit_type: 'comprehensive'
  };
  
  console.log('📋 Adding audit job to queue...');
  const job = await jobQueue.addAuditJob(testAudit);
  console.log('✅ Job added with ID:', job.id);
  
  // Process the job
  console.log('⚙️ Processing audit job...');
  const result = await jobQueue.processAuditJob(job);
  console.log('📊 Audit completed. Final score:', result?.overallScore || 'undefined');
  console.log('🎯 Has recommendations:', result?.recommendations ? 'yes' : 'no');
  
  if (result?.recommendations) {
    Object.keys(result.recommendations).forEach(category => {
      const recs = result.recommendations[category];
      console.log(`- ${category}: ${recs ? recs.length : 0} recommendations`);
    });
  }
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
