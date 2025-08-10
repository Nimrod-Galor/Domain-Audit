import { JSDOM } from 'jsdom';
import { AboutPageAnalyzer } from './src/analyzers/business-intelligence/about/about-page-analyzer.js';

// Create a simple test similar to the actual test
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <nav><a href="/about">About Us</a></nav>
  <div class="about-section">
    <h2>About Our Company</h2>
    <p>We are a professional company founded in 2020.</p>
  </div>
</body>
</html>
`);

const mockDocument = dom.window.document;
const testUrl = 'https://example.com';

const aboutAnalyzer = new AboutPageAnalyzer();

console.log('🔧 Testing AboutPageAnalyzer with test-like setup...');

try {
  const result = await aboutAnalyzer.analyze({document: mockDocument, url: testUrl});
  
  console.log('✅ Full result structure:');
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
