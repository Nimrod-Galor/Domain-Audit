import { PerformanceAnalyzer } from './src/analyzers/performance/index.js';
import { JSDOM } from 'jsdom';

console.log('Testing Performance Analyzer directly...');

const html = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Test</h1></body></html>`;
const dom = new JSDOM(html, { url: 'https://example.com/test' });

const context = {
  document: dom.window.document,
  dom: dom.window,
  url: 'https://example.com/test'
};

const analyzer = new PerformanceAnalyzer();
try {
  const results = await analyzer.performHeuristicAnalysis(context);
  console.log('Heuristic analysis structure:');
  console.log('- detection:', !!results.detection);
  console.log('- analysis:', !!results.analysis);
  if (results.analysis) {
    console.log('  - coreWebVitals:', !!results.analysis.coreWebVitals);
    console.log('  - resourceOptimization:', !!results.analysis.resourceOptimization);
    console.log('  - loadingStrategy:', !!results.analysis.loadingStrategy);
    console.log('  - thirdParty:', !!results.analysis.thirdParty);
  }
  console.log('\nFull results:', JSON.stringify(results, null, 2));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
