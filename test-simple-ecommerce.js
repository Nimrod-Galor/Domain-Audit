/**
 * SIMPLE E-COMMERCE TESTING
 * Test a single e-commerce site to understand the data structure
 */

import { runCrawl } from './lib/crawler.js';

async function testSingleSite() {
  console.log('🔍 Testing single e-commerce site for data structure analysis...');
  
  try {
    // Test a simple Shopify demo site
    const domain = 'checkout.shopify.com';
    console.log(`Testing: ${domain}`);
    
    const startTime = Date.now();
    const result = await runCrawl(domain, 1, true); // Just 1 page, force new
    const endTime = Date.now();
    
    console.log(`\n⏱️  Execution time: ${endTime - startTime}ms`);
    console.log('\n📊 AUDIT RESULT STRUCTURE:');
    console.log('='.repeat(50));
    
    if (result) {
      console.log('✅ Audit completed successfully');
      console.log('\n🔍 Result type:', typeof result);
      console.log('🔍 Result keys:', Object.keys(result));
      
      // Check for e-commerce specific data
      if (result.ecommerce) {
        console.log('\n🛍️  E-COMMERCE DATA FOUND:');
        console.log('Platform:', result.ecommerce.platform);
        console.log('Total Score:', result.ecommerce.totalScore);
        console.log('Features:', Object.keys(result.ecommerce));
      } else {
        console.log('\n❌ No e-commerce data found in result');
        console.log('Available data sections:', Object.keys(result));
      }
      
      // Check crawl data
      if (result.crawlData) {
        console.log('\n📋 CRAWL DATA:');
        console.log('Pages crawled:', result.crawlData.pages?.length || 'N/A');
        
        if (result.crawlData.pages && result.crawlData.pages.length > 0) {
          const firstPage = result.crawlData.pages[0];
          console.log('\n🏠 FIRST PAGE DATA:');
          console.log('URL:', firstPage.url);
          console.log('Status:', firstPage.status);
          console.log('Available analysis:', Object.keys(firstPage));
          
          // Check for e-commerce analysis in page data
          if (firstPage.ecommerce) {
            console.log('\n🛍️  PAGE E-COMMERCE DATA:');
            console.log(JSON.stringify(firstPage.ecommerce, null, 2));
          }
        }
      }
      
    } else {
      console.log('❌ No result returned from audit');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testSingleSite();
