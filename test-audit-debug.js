// Test audit generation directly to debug recommendation flow
import { AuditExecutor } from './web/lib/audit-executor.js';

async function testAuditDebug() {
  try {
    console.log('🚀 Testing audit executor directly...');
    
    const auditExecutor = new AuditExecutor();
    
    const mockStateData = {
      visited: { 
        'https://test.com': { 
          status: 200,
          response: {
            headers: { 'content-type': 'text/html' },
            body: '<html><head><title>Test</title></head><body><h1>Test Page</h1></body></html>',
            size: 1024
          }
        }
      },
      badRequests: {},
      externalLinks: {},
      stats: {
        totalRequests: 1,
        successfulRequests: 1,
        failedRequests: 0
      },
      url: 'https://test.com'
    };
    
    console.log('📊 Generating analytics with mock data...');
    const result = await auditExecutor.generateAnalyticsSummary(mockStateData);
    
    console.log('\n📈 Audit Result Summary:');
    console.log('- Overall Score:', result.overallScore);
    console.log('- Overall Grade:', result.overallGrade);
    console.log('- Has recommendations:', 'recommendations' in result);
    
    if (result.recommendations) {
      console.log('\n🎯 Recommendations by Category:');
      Object.keys(result.recommendations).forEach(category => {
        const recs = result.recommendations[category];
        console.log(`- ${category}: ${recs ? recs.length : 0} recommendations`);
        if (recs && recs.length > 0) {
          recs.forEach((rec, index) => {
            console.log(`  ${index + 1}. [${rec.priority}] ${rec.title}`);
          });
        }
      });
    } else {
      console.log('❌ No recommendations object found');
    }
    
    console.log('\n🔍 Full result keys:', Object.keys(result));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuditDebug();
