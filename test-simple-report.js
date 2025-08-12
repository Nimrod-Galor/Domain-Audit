// Test generateSimpleReport method to verify end-to-end flow
import { AuditExecutor } from './web/lib/audit-executor.js';

async function testSimpleReport() {
  try {
    console.log('🚀 Testing generateSimpleReport method...');
    
    const auditExecutor = new AuditExecutor();
    
    const mockStateData = {
      visited: [
        'https://test.com',
        'https://test.com/about',
        'https://test.com/contact'
      ],
      badRequests: {},
      externalLinks: {
        'https://google.com': { status: 200 },
        'https://facebook.com': { status: 301 }
      },
      stats: {
        'https://test.com': { status: 200 },
        'https://test.com/about': { status: 200 },
        'https://test.com/contact': { status: 200 }
      },
      mailtoLinks: {},
      telLinks: {},
      url: 'https://test.com',
      pageDataManager: null
    };
    
    console.log('📊 Generating simple report...');
    const report = await auditExecutor.generateSimpleReport(mockStateData);
    
    console.log('\n📈 Simple Report Result:');
    console.log('- Overall Score:', report.overallScore);
    console.log('- Overall Grade:', report.overallGrade);
    console.log('- Analytics Overall Score:', report.analytics?.overallScore);
    console.log('- Analytics Overall Grade:', report.analytics?.overallGrade);
    console.log('- Legacy Score Path:', report.analytics?.scores?.overall?.score);
    console.log('- Has recommendations:', report.analytics?.recommendations ? 'Yes' : 'No');
    
    if (report.analytics?.recommendations) {
      console.log('\n🎯 Recommendations by Category:');
      Object.keys(report.analytics.recommendations).forEach(category => {
        const recs = report.analytics.recommendations[category];
        console.log(`- ${category}: ${recs ? recs.length : 0} recommendations`);
      });
    }
    
    console.log('\n🔍 Full report keys:', Object.keys(report));
    console.log('🔍 Analytics keys:', report.analytics ? Object.keys(report.analytics) : 'undefined');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleReport();
