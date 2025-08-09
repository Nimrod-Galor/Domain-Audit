/**
 * Quick debug test for ConversionOptimizer
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';
import { JSDOM } from 'jsdom';

// Simple test
const testConversionOptimizer = async () => {
  try {
    console.log('Creating ConversionOptimizer...');
    const optimizer = new ConversionOptimizer();
    
    console.log('Optimizer name:', optimizer.name);
    console.log('Optimizer category:', optimizer.category);
    
    const html = `<html><head><title>Test</title></head><body><h1>Test</h1></body></html>`;
    const dom = new JSDOM(html).window.document;
    
    // Create simple cheerio mock
    const $ = (selector) => {
      const elements = Array.from(dom.querySelectorAll(selector));
      return {
        length: elements.length,
        attr: (attrName) => elements[0]?.getAttribute(attrName),
        filter: () => ({ length: 0 })
      };
    };
    $.html = () => dom.documentElement.outerHTML;
    
    console.log('Running analysis...');
    const result = await optimizer.analyze({
      dom: $,
      url: 'https://test.com'
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testConversionOptimizer();
