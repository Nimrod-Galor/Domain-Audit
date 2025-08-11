/**
 * Simple audit test to verify the fixes are working
 */
import { AuditExecutor } from './web/lib/audit-executor.js';
import jobQueue from './web/lib/jobQueue.js';
import { Audit } from './web/models/index.js';
import tierService from './web/services/tierService.js';

async function testAuditJob() {
  console.log('🧪 Testing audit job execution...');
  
  // Set up like the controller does
  const auditExecutor = new AuditExecutor();
  const activeSessions = new Map();
  
  // Inject dependencies
  jobQueue.injectDependencies({ auditExecutor, activeSessions, Audit, tierService });
  
  // Create a test session
  const sessionId = 'test-' + Date.now();
  activeSessions.set(sessionId, {
    status: 'waiting',
    url: 'https://www.stefanbakery.com',
    timestamp: new Date().toISOString()
  });
  
  console.log(`[DEBUG] Session created: ${sessionId}. Total sessions: ${activeSessions.size}`);
  
  // Try to add a job to the queue
  try {
    const jobId = jobQueue.add('runAudit', {
      url: 'https://www.stefanbakery.com',
      reportType: 'simple',
      maxPages: 5, // Small number for testing
      priority: 'normal',
      sessionId: sessionId,
      req: null, // Simplified for test
      userId: null,
      userLimits: {
        isRegistered: false,
        maxExternalLinks: 10,
        maxPagesPerAudit: 25,
        tierName: 'freemium'
      }
    });
    
    console.log(`✅ Job added to queue with ID: ${jobId}`);
    
    // Wait a moment to see if the job starts processing
    setTimeout(() => {
      const jobStats = jobQueue.getJobStats();
      console.log('📊 Job queue stats:', jobStats);
      
      const session = activeSessions.get(sessionId);
      console.log('📋 Session status:', session?.status);
      
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Job execution failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testAuditJob();
