/**
 * Quick debug test for structure
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';
import { JSDOM } from 'jsdom';

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-commerce Test</title>
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

const dom = new JSDOM(html).window.document;

const $ = (selector) => {
  const elements = Array.from(dom.querySelectorAll(selector));
  return {
    length: elements.length,
    attr: (attrName) => elements[0]?.getAttribute(attrName),
    filter: () => ({ length: 0 })
  };
};
$.html = () => dom.documentElement.outerHTML;

const optimizer = new ConversionOptimizer();
const result = await optimizer.analyze({
  dom: $,
  url: 'https://test.com'
});

console.log('=== RESULT STRUCTURE ===');
console.log('result keys:', Object.keys(result));
console.log('result.result keys:', Object.keys(result.result || {}));

const analysisResult = result.result || result;
console.log('=== ANALYSIS RESULT STRUCTURE ===');
console.log('analysisResult keys:', Object.keys(analysisResult));
console.log('analysisResult.data keys:', Object.keys(analysisResult.data || {}));
console.log('analysisResult.data.factors keys:', Object.keys(analysisResult.data?.factors || {}));
console.log('trustSignals exists:', !!analysisResult.data?.factors?.trustSignals);
console.log('trustSignals structure:', analysisResult.data?.factors?.trustSignals ? Object.keys(analysisResult.data.factors.trustSignals) : 'undefined');
