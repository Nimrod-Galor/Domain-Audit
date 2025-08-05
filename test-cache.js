// Test the cache functionality
import { getPool, query, initializeDatabase } from './audit-website/models/database.js';
import { Audit } from './audit-website/models/Audit.js';

async function testCacheFeature() {
  try {
    initializeDatabase();
    console.log('🧪 Testing audit cache feature...');
    
    // First, create a completed audit to simulate existing data
    const testDomain = 'https://cache-test-example.com';
    
    const testAudit = await Audit.create({
      userId: null, // Simulate anonymous user who created it
      domain: testDomain,
      auditType: 'simple',
      config: {
        maxPages: 5,
        priority: 'standard'
      }
    });
    
    console.log('✅ Test audit created:', testAudit.id);
    
    // Update it to completed status with fake report data
    await Audit.updateStatus(testAudit.id, 'completed', {
      report_data: {
        overview: {
          score: 85,
          totalPages: 3,
          totalLinks: 25
        },
        internalLinks: [
          { url: testDomain + '/page1', anchor: 'Page 1', found: 'Home Page' },
          { url: testDomain + '/page2', anchor: 'Page 2', found: 'Home Page' }
        ],
        externalLinks: [
          { url: 'https://external1.com', anchor: 'External 1', found: 'Page 1', statusCode: 200 },
          { url: 'https://external2.com', anchor: 'External 2', found: 'Page 2', statusCode: 200 }
        ]
      },
      score: 85,
      duration_ms: 12000,
      pages_scanned: 3,
      external_links_checked: 2
    });
    
    console.log('✅ Test audit completed with fake data');
    
    // Now test the cache lookup
    const cachedAudit = await Audit.findMostRecentByDomain(testDomain);
    
    if (cachedAudit) {
      console.log('✅ Cache lookup successful:', {
        id: cachedAudit.id,
        status: cachedAudit.status,
        score: cachedAudit.score,
        hasReportData: !!cachedAudit.report_data
      });
      
      console.log('📊 Sample report data:', {
        score: cachedAudit.report_data.overview.score,
        totalPages: cachedAudit.report_data.overview.totalPages,
        internalLinksCount: cachedAudit.report_data.internalLinks.length,
        externalLinksCount: cachedAudit.report_data.externalLinks.length
      });
    } else {
      console.log('❌ Cache lookup failed');
    }
    
    getPool().end();
    console.log('🎉 Cache test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    getPool().end();
  }
}

testCacheFeature();
