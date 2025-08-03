import fetch from 'node-fetch';
import { DOMProcessor } from './src/dom/dom-processor.js';

async function testStefanBakery() {
  try {
    console.log('🧪 Testing stefanbakery.com DOM processing...');
    
    // Fetch the actual HTML
    console.log('📡 Fetching HTML from stefanbakery.com...');
    const response = await fetch('https://www.stefanbakery.com');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Fetched ${html.length} characters of HTML`);
    
    // Test DOM processing
    console.log('🔄 Creating DOM processor...');
    const processor = new DOMProcessor();
    
    console.log('🏗️ Processing HTML with Cheerio...');
    const result = await processor.createDOM(html, 'https://www.stefanbakery.com');
    
    if (result.error) {
      console.error('❌ DOM processing error:', result.error);
    } else {
      console.log('✅ DOM created successfully!');
      console.log('📄 Title:', result.document.title);
      console.log('🔗 Links found:', result.document.querySelectorAll('a').length);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStefanBakery();
