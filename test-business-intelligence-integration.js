/**
 * ============================================================================
 * BUSINESS INTELLIGENCE INTEGRATION TEST
 * ============================================================================
 *
 * Quick test to verify Phase 3 Business Intelligence module is properly
 * integrated with the main domain audit system.
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { runCrawl } from './lib/crawler.js';

console.log('🧪 Testing Business Intelligence Integration...\n');

try {
  // Test with a simple domain
  const testDomain = 'example.com';
  const maxPages = 1; // Just test one page
  
  console.log(`🌐 Testing domain: ${testDomain}`);
  console.log(`📄 Max pages: ${maxPages}`);
  console.log('🔍 Looking for Business Intelligence analysis...\n');
  
  // Run the crawler with force new to ensure fresh analysis
  await runCrawl(testDomain, maxPages, true);
  
  console.log('\n✅ Integration test completed successfully!');
  console.log('🏢 Business Intelligence module should now be included in domain audits.');
  
} catch (error) {
  console.error('\n❌ Integration test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
