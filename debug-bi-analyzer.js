import { JSDOM } from 'jsdom';
import { BusinessIntelligenceAnalyzer } from './src/analyzers/business-intelligence/business-analyzer-minimal.js';

async function testAnalyzer() {
  console.log('Testing BusinessIntelligenceAnalyzer...');
  
  const analyzer = new BusinessIntelligenceAnalyzer();
  
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Business Website</title>
      </head>
      <body>
        <h1>About Us</h1>
        <p>Contact us at test@example.com</p>
        <a href="/support">Support</a>
      </body>
    </html>
  `);
  
  const context = {
    document: dom.window.document,
    url: 'https://example.com',
    pageData: {}
  };
  
  try {
    const result = await analyzer.analyze(context);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAnalyzer();
