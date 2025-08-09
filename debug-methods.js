/**
 * Debug individual analysis methods
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';
import { JSDOM } from 'jsdom';

const html = `
<html>
<head><title>Test</title></head>
<body>
  <img src="/ssl-badge.png" alt="SSL Secure">
  <a href="/about">About Us</a>
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

console.log('Testing individual analysis methods...');

try {
  console.log('1. Testing _analyzeTrustSignals...');
  const trustSignals = optimizer._analyzeTrustSignals($, 'https://test.com');
  console.log('Trust signals result:', trustSignals);
} catch (error) {
  console.error('Trust signals error:', error.message);
}

try {
  console.log('2. Testing _analyzeUserExperience...');
  const userExperience = optimizer._analyzeUserExperience($);
  console.log('User experience result:', userExperience);
} catch (error) {
  console.error('User experience error:', error.message);
}

try {
  console.log('3. Testing _analyzeProductPresentation...');
  const productPresentation = optimizer._analyzeProductPresentation($);
  console.log('Product presentation result:', productPresentation);
} catch (error) {
  console.error('Product presentation error:', error.message);
}

try {
  console.log('4. Testing _analyzeCheckoutProcess...');
  const checkoutProcess = optimizer._analyzeCheckoutProcess($);
  console.log('Checkout process result:', checkoutProcess);
} catch (error) {
  console.error('Checkout process error:', error.message);
}

try {
  console.log('5. Testing _analyzeSocialProof...');
  const socialProof = optimizer._analyzeSocialProof($);
  console.log('Social proof result:', socialProof);
} catch (error) {
  console.error('Social proof error:', error.message);
}

try {
  console.log('6. Testing _analyzeMobileOptimization...');
  const mobileOptimization = optimizer._analyzeMobileOptimization($);
  console.log('Mobile optimization result:', mobileOptimization);
} catch (error) {
  console.error('Mobile optimization error:', error.message);
}

try {
  console.log('7. Testing _analyzeLoadingSpeed...');
  const loadingSpeed = optimizer._analyzeLoadingSpeed($, {});
  console.log('Loading speed result:', loadingSpeed);
} catch (error) {
  console.error('Loading speed error:', error.message);
}
