// Quick test to see what SEO analyzer actually returns
import { seoAnalyzer } from './src/analyzers/index.js';

// Create a simple mock DOM
const mockDOM = {
  head: {
    getElementsByTagName: () => [],
    querySelectorAll: () => []
  },
  title: 'Test Title',
  documentElement: {
    getAttribute: () => 'en'
  }
};

console.log('Testing SEO analyzer...');
try {
  const result = seoAnalyzer.analyze(mockDOM);
  console.log('SEO Result Structure:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}
