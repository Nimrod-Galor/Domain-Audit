/**
 * Simple test to verify dependency injection is working
 */
import { AuditExecutor } from './web/lib/audit-executor.js';
import jobQueue from './web/lib/jobQueue.js';
import { Audit } from './web/models/index.js';
import tierService from './web/services/tierService.js';

console.log('Testing dependency injection...');

// Create instances like the controller does
const auditExecutor = new AuditExecutor();
const activeSessions = new Map();

// Test the injection
try {
  jobQueue.injectDependencies({ auditExecutor, activeSessions, Audit, tierService });
  console.log('✅ Dependencies injected successfully');
  
  // Test if dependencies are available
  console.log('🔍 Testing dependency availability:');
  console.log('- auditExecutor:', !!jobQueue.auditExecutor);
  console.log('- activeSessions:', !!jobQueue.activeSessions);
  console.log('- Audit:', !!jobQueue.Audit);
  console.log('- tierService:', !!jobQueue.tierService);
  
  // Test if auditExecutor has the 'on' method
  console.log('- auditExecutor.on method:', typeof jobQueue.auditExecutor.on);
  
  if (typeof jobQueue.auditExecutor.on === 'function') {
    console.log('✅ auditExecutor.on method is available');
  } else {
    console.log('❌ auditExecutor.on method is NOT available');
  }
  
} catch (error) {
  console.error('❌ Dependency injection failed:', error.message);
}

console.log('Test completed.');
