import { JSDOM } from 'jsdom';
import AboutPageAnalyzer from './src/analyzers/business-intelligence/about/about-page-analyzer.js';

// Create a test DOM with minimal about content
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div class="about">
    <h1>About Us</h1>
    <p>We are a company that does things.</p>
  </div>
</body>
</html>
`);

global.document = dom.window.document;

const analyzer = new AboutPageAnalyzer('https://test.com');
console.log('Testing AboutPageAnalyzer...');

analyzer.analyze().then(result => {
  console.log('SUCCESS! Result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('ERROR:', error.message);
  console.error('Stack:', error.stack);
});
