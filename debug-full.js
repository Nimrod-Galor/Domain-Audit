/**
 * Test with actual factor structure
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';
import { JSDOM } from 'jsdom';

const html = `<html><head><title>Test</title></head><body><img src="/ssl-badge.png" alt="SSL Secure"><a href="/about">About Us</a></body></html>`;
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

console.log('Testing with actual factor analysis...');

// Create factors using actual analysis methods
const factors = {
  trustSignals: optimizer._analyzeTrustSignals($, 'https://test.com'),
  userExperience: optimizer._analyzeUserExperience($),
  productPresentation: optimizer._analyzeProductPresentation($),
  checkoutProcess: optimizer._analyzeCheckoutProcess($),
  socialProof: optimizer._analyzeSocialProof($),
  mobileOptimization: optimizer._analyzeMobileOptimization($),
  loadingSpeed: optimizer._analyzeLoadingSpeed($, {})
};

console.log('Factors created successfully');
console.log('Trust signals missing length:', factors.trustSignals.missing?.length);

try {
  console.log('Testing _identifyOptimizationOpportunities with real factors...');
  const opportunities = optimizer._identifyOptimizationOpportunities(factors);
  console.log('Opportunities result length:', opportunities.length);
  console.log('Success!');
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}

// Now test the full _analyzeConversionFactors method
try {
  console.log('Testing full _analyzeConversionFactors...');
  const fullResult = optimizer._analyzeConversionFactors($, {}, 'https://test.com');
  console.log('Full result keys:', Object.keys(fullResult));
  console.log('Full result factors keys:', Object.keys(fullResult.factors || {}));
  console.log('Full result error:', fullResult.error);
} catch (error) {
  console.error('Full analysis error:', error.message);
}
