// Quick test of Business Intelligence integration
import { JSDOM } from 'jsdom';
import { BusinessIntelligenceAnalyzer } from './src/analyzers/business-intelligence/business-analyzer-minimal.js';

console.log('🔧 Testing Business Intelligence analyzer with adapter...');

// Simulate what enhanced extractors does
const html = `
<!DOCTYPE html>
<html>
<head><title>Test Business</title></head>
<body>
<h1>Test Company</h1>
<p>Contact us at info@testcompany.com</p>
<address>123 Main St, Test City</address>
</body>
</html>
`;

const dom = new JSDOM(html);
const document = dom.window.document;

// Create the enhanced adapter like enhanced extractors does
const documentAdapter = {
  querySelectorAll: (selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      // Convert real DOM elements to adapter elements  
      return Array.from(elements).map(el => ({
        textContent: el.textContent,
        getAttribute: (attr) => el.getAttribute(attr),
        innerHTML: el.innerHTML,
        tagName: el.tagName,
        classList: {
          contains: (className) => el.classList.contains(className)
        }
      }));
    } catch (error) {
      console.log('⚠️ Adapter querySelectorAll error:', error.message);
      return [];
    }
  },
  querySelector: (selector) => {
    try {
      const el = document.querySelector(selector);
      if (!el) return null;
      return {
        textContent: el.textContent,
        getAttribute: (attr) => el.getAttribute(attr),
        innerHTML: el.innerHTML,
        tagName: el.tagName,
        classList: {
          contains: (className) => el.classList.contains(className)
        }
      };
    } catch (error) {
      console.log('⚠️ Adapter querySelector error:', error.message);
      return null;
    }
  }
};

const analyzer = new BusinessIntelligenceAnalyzer();

try {
  const context = {
    document: documentAdapter,
    url: 'https://testcompany.com',
    pageData: {}
  };
  const result = await analyzer.analyze(context);
  console.log('✅ Business Intelligence analysis completed!');
  console.log('📊 Result structure:', result.success ? 'Success' : 'Failed');
  if (result.error) {
    console.log('❌ Error found:', result.error);
  } else {
    console.log('📈 Score:', result.data.score);
    console.log('🎯 Grade:', result.data.grade);
  }
} catch (error) {
  console.error('❌ Business Intelligence analysis failed:', error.message);
  console.error('🔍 Error details:', error.stack);
}
