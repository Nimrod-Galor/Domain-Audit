/**
 * ECOMMERCE AUDIT DATA READER
 * Read and analyze audit data from completed audits to test e-commerce functionality
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadState } from './src/core/compressed-state-manager.js';
import { CompressedPageDataManager } from './src/storage/compressed-page-data-manager.js';
import { getAuditManager } from './src/core/audit-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test sites with known e-commerce platforms
const TEST_SITES = [
  {
    name: 'Shopify Demo',
    domain: 'demo.myshopify.com',
    expectedPlatform: 'shopify'
  },
  {
    name: 'Example Commerce',
    domain: 'example.com', // We'll test with whatever's available
    expectedPlatform: 'unknown'
  }
];

async function testEcommerceAuditData() {
  console.log('🔍 TESTING E-COMMERCE AUDIT DATA ANALYSIS');
  console.log('='.repeat(50));
  
  // Find existing audits to test
  const auditDir = path.join(__dirname, 'audits');
  
  try {
    const domains = await fs.readdir(auditDir);
    console.log(`📂 Found ${domains.length} domain(s) with audits`);
    
    for (const domain of domains.slice(0, 3)) { // Test first 3 domains
      await testDomainAudits(domain);
    }
    
  } catch (error) {
    console.error('❌ Error accessing audit directory:', error.message);
    
    // If no existing audits, create a test audit
    console.log('\n🚀 Creating test audit...');
    await createTestAudit();
  }
}

async function testDomainAudits(domain) {
  console.log(`\n🌐 Testing domain: ${domain}`);
  
  try {
    const auditManager = getAuditManager(domain);
    const auditHistory = auditManager.listAudits();
    
    if (auditHistory.length === 0) {
      console.log('   📭 No audits found for this domain');
      return;
    }
    
    // Test the latest audit
    const latestAudit = auditHistory[0];
    console.log(`   📋 Latest audit: ${latestAudit.id}`);
    console.log(`   📅 Created: ${latestAudit.startTime}`);
    
    await analyzeAuditData(domain, latestAudit);
    
  } catch (error) {
    console.error(`   ❌ Error testing domain ${domain}:`, error.message);
  }
}

async function analyzeAuditData(domain, auditInfo) {
  try {
    const auditDir = path.join(__dirname, 'audits', domain, auditInfo.id);
    const stateFile = path.join(auditDir, `${auditInfo.id}-crawl-state.json.gz`);
    const stateFileUncompressed = path.join(auditDir, `${auditInfo.id}-crawl-state.json`);
    const pageDataDir = path.join(auditDir, 'page-data');
    
    // Check which state file exists
    let actualStateFile = stateFile;
    try {
      await fs.access(stateFile);
    } catch {
      try {
        await fs.access(stateFileUncompressed);
        actualStateFile = stateFileUncompressed;
      } catch {
        console.log('   ⚠️  No state file found');
        return;
      }
    }
    
    console.log(`   📄 Loading state from: ${path.basename(actualStateFile)}`);
    
    // Initialize data structures
    const visited = new Map();
    const queue = [];
    const stats = { processed: 0, queue: 0, errors: 0 };
    const badRequests = new Map();
    const externalLinks = new Map();
    const mailtoLinks = new Set();
    const telLinks = new Set();
    const pageDataManager = new CompressedPageDataManager(pageDataDir);
    
    // Load state
    const loadResult = loadState(
      actualStateFile,
      visited,
      queue,
      stats,
      badRequests,
      externalLinks,
      mailtoLinks,
      telLinks,
      pageDataManager
    );
    
    console.log(`   ✅ State loaded successfully`);
    console.log(`   📊 Pages visited: ${visited.size}`);
    console.log(`   📊 External links: ${externalLinks.size}`);
    
    // Analyze each page for e-commerce data
    let ecommercePages = 0;
    let platformsDetected = new Set();
    let featuresFound = new Set();
    
    for (const [url, pageInfo] of visited) {
      if (pageInfo.status === 200) {
        try {
          const pageData = await pageDataManager.loadPageData(url);
          
          if (pageData && pageData.ecommerce) {
            ecommercePages++;
            
            // Analyze e-commerce data
            const ecommerce = pageData.ecommerce;
            console.log(`\n   🛍️  E-COMMERCE DATA FOUND ON: ${url}`);
            
            if (ecommerce.platform && ecommerce.platform.name) {
              platformsDetected.add(ecommerce.platform.name);
              console.log(`      Platform: ${ecommerce.platform.name} (${Math.round((ecommerce.platform.confidence || 0) * 100)}% confidence)`);
            }
            
            if (ecommerce.totalScore) {
              console.log(`      Total Score: ${ecommerce.totalScore}/100`);
            }
            
            // Check individual features
            const features = [
              'cart', 'checkout', 'productSchema', 'payments', 'reviews'
            ];
            
            for (const feature of features) {
              if (ecommerce[feature] && ecommerce[feature].detected) {
                featuresFound.add(feature);
                console.log(`      ✅ ${feature}: Score ${ecommerce[feature].score || 'N/A'}`);
              }
            }
            
            // Platform technologies
            if (ecommerce.platform && ecommerce.platform.technologies) {
              const tech = ecommerce.platform.technologies;
              if (tech.payments && tech.payments.length > 0) {
                console.log(`      💳 Payment Methods: ${tech.payments.join(', ')}`);
              }
              if (tech.analytics && tech.analytics.length > 0) {
                console.log(`      📊 Analytics: ${tech.analytics.join(', ')}`);
              }
            }
            
          }
        } catch (error) {
          // Page data might not exist or be corrupted
        }
      }
    }
    
    // Summary
    console.log(`\n   📋 E-COMMERCE ANALYSIS SUMMARY:`);
    console.log(`      Pages with e-commerce data: ${ecommercePages}`);
    console.log(`      Platforms detected: ${Array.from(platformsDetected).join(', ') || 'None'}`);
    console.log(`      Features found: ${Array.from(featuresFound).join(', ') || 'None'}`);
    
    // Success validation
    const hasEcommerceData = ecommercePages > 0;
    const hasPlatformDetection = platformsDetected.size > 0;
    const hasFeatures = featuresFound.size > 0;
    
    if (hasEcommerceData && hasPlatformDetection && hasFeatures) {
      console.log(`   ✅ E-COMMERCE INTEGRATION: WORKING`);
    } else if (hasEcommerceData) {
      console.log(`   ⚠️  E-COMMERCE INTEGRATION: PARTIAL`);
    } else {
      console.log(`   ❌ E-COMMERCE INTEGRATION: NOT DETECTED`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error analyzing audit data:`, error.message);
  }
}

async function createTestAudit() {
  console.log('🔧 Creating test audit for validation...');
  
  // Import and run a simple audit
  const { runCrawl } = await import('./lib/crawler.js');
  
  try {
    // Test with a known e-commerce site
    await runCrawl('demo.myshopify.com', 1, true);
    console.log('✅ Test audit completed');
    
    // Now analyze the created audit
    await testDomainAudits('myshopify.com');
    
  } catch (error) {
    console.error('❌ Failed to create test audit:', error.message);
  }
}

// Run the test
testEcommerceAuditData().catch(console.error);
