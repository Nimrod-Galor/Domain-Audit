import { PageCrawler } from './src/core/page-crawler.js';

async function debugCrawl() {
  try {
    console.log('🧪 Debug crawling stefanbakery.com...');
    
    const crawler = new PageCrawler({});
    const result = await crawler.crawlPage('https://www.stefanbakery.com');
    
    console.log('✅ Crawl successful!');
    console.log('📄 Title:', result.seo?.title || 'No title');
    console.log('🔗 Links:', result.links?.totalLinks || 0);
    
  } catch (error) {
    console.error('❌ Crawl error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugCrawl();
