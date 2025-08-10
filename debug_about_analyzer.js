import { JSDOM } from 'jsdom';
import { AboutPageAnalyzer } from './src/analyzers/business-intelligence/about/about-page-analyzer.js';

// Create a test document
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <title>Test Company</title>
</head>
<body>
  <nav>
    <a href="/about">About Us</a>
  </nav>
  <div class="about-section">
    <h2>About Our Company</h2>
    <p>We are a professional company founded in 2020. Our team includes experienced CEO John Doe and CTO Jane Smith.</p>
    <p>Our mission is to provide excellent service to our customers. We believe in quality and customer satisfaction.</p>
  </div>
  <div class="team">
    <div class="team-member">
      <img src="john.jpg" alt="John">
      <h3>John Doe - CEO</h3>
      <p class="bio">John has 15 years of experience in business management.</p>
    </div>
  </div>
</body>
</html>
`);

const document = dom.window.document;
const url = 'https://example.com';

const analyzer = new AboutPageAnalyzer();

console.log('🔍 Testing AboutPageAnalyzer directly...');

try {
  const result = await analyzer.analyze({document, url});
  console.log('✅ Result type:', typeof result);
  console.log('✅ Result keys:', Object.keys(result || {}));
  console.log('✅ Result.success:', result?.success);
  console.log('✅ Result.data keys:', Object.keys(result?.data || {}));
  console.log('✅ Full result structure:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('❌ Stack:', error.stack);
}
