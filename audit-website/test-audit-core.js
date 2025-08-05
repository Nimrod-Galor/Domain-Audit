/**
 * Quick Audit Test
 * Tests if the audit system can handle a simple domain
 */
import { AuditExecutor } from './lib/audit-executor.js';

async function testSimpleAudit() {
    console.log('🧪 Testing simple audit functionality...');
    
    try {
        const auditExecutor = new AuditExecutor();
        
        // Test with a simple, reliable domain
        const testDomain = 'https://example.com';
        console.log(`🔍 Testing audit for: ${testDomain}`);
        
        const sessionId = 'test-' + Date.now();
        const userLimits = {
            isRegistered: false,
            maxExternalLinks: 5
        };
        
        console.log('⏱️ Starting audit...');
        const startTime = Date.now();
        
        const result = await auditExecutor.executeAudit(testDomain, 5, false, sessionId, userLimits);
        
        const duration = Date.now() - startTime;
        console.log(`⏱️ Audit completed in ${duration}ms`);
        
        // Generate simple report
        const reportData = auditExecutor.generateSimpleReport(result.stateData);
        
        console.log('📊 Audit results:');
        console.log(`- Pages found: ${result.stateData?.visited?.length || 0}`);
        console.log(`- Links found: ${result.stateData?.links?.length || 0}`);
        console.log(`- External links: ${result.stateData?.externalLinks?.length || 0}`);
        console.log(`- Grade: ${reportData.overview?.grade || 'N/A'}`);
        console.log(`- Score: ${reportData.overview?.score || 0}/100`);
        
        console.log('✅ Audit test completed successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Audit test failed:', error);
        console.error('Error details:', error.stack);
        return false;
    }
}

// Run the test
testSimpleAudit()
    .then(success => {
        console.log(success ? '🎉 All tests passed!' : '❌ Tests failed!');
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
