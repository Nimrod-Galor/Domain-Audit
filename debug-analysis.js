/**
 * Debug the ConversionOptimizer analysis method directly
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';
import { JSDOM } from 'jsdom';

// Mock DOM for testing
const createMockDOM = () => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-commerce Test Site</title>
    </head>
    <body>
      <img src="/ssl-badge.png" alt="SSL Secure">
      <a href="/about">About Us</a>
      <a href="tel:+1234567890">Call Us</a>
      <nav class="navigation">
        <input type="search" placeholder="Search products...">
      </nav>
      <div class="product">
        <h1 class="product-title">Product</h1>
        <img src="/product1.jpg" alt="Product Image">
        <div class="price">$99.99</div>
        <div class="reviews">★★★★★</div>
      </div>
      <a href="/cart">Cart</a>
      <button class="add-to-cart">Add to Cart</button>
    </body>
    </html>
  `;
  
  return new JSDOM(html).window.document;
};

// Create Cheerio-like mock
const createCheerioMock = (document) => {
  const $ = (selector) => {
    const elements = Array.from(document.querySelectorAll(selector));
    
    return {
      length: elements.length,
      attr: (attrName) => elements[0]?.getAttribute(attrName),
      filter: (callback) => {
        if (typeof callback === 'function') {
          return {
            length: elements.filter((el, i) => callback(i, el)).length
          };
        }
        return { length: 0 };
      }
    };
  };

  $.html = () => document.documentElement.outerHTML;
  
  return $;
};

const test = async () => {
  try {
    console.log('Creating optimizer...');
    const optimizer = new ConversionOptimizer();
    
    console.log('Creating mock DOM...');
    const mockDocument = createMockDOM();
    const mockCheerio = createCheerioMock(mockDocument);
    
    console.log('Testing cheerio mock...');
    console.log('HTML length:', mockCheerio.html().length);
    console.log('Title elements:', mockCheerio('title').length);
    console.log('Image elements:', mockCheerio('img').length);
    
    console.log('Running analyze method...');
    const result = await optimizer.analyze({
      dom: mockCheerio,
      url: 'https://example.com/product',
      pageData: { performance: { loadTime: 2.5 } }
    });
    
    console.log('Result received, examining structure...');
    console.log('Has result wrapper:', !!result.result);
    console.log('Has time:', !!result.time);
    
    const analysisResult = result.result || result;
    console.log('Analysis result keys:', Object.keys(analysisResult));
    console.log('Data keys:', Object.keys(analysisResult.data || {}));
    console.log('Factors keys:', Object.keys(analysisResult.data?.factors || {}));
    
    // Test the direct conversion analysis method
    console.log('\nTesting direct _analyzeConversionFactors...');
    const directResult = optimizer._analyzeConversionFactors(mockCheerio, { performance: { loadTime: 2.5 } }, 'https://example.com/product');
    console.log('Direct result keys:', Object.keys(directResult));
    console.log('Direct factors keys:', Object.keys(directResult.factors || {}));
    
    if (directResult.factors && directResult.factors.trustSignals) {
      console.log('Trust signals score:', directResult.factors.trustSignals.score);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

test();
