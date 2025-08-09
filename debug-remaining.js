/**
 * Debug the remaining methods in _analyzeConversionFactors
 */

import { ConversionOptimizer } from './src/analyzers/ecommerce/conversion/conversion-optimizer.js';

const optimizer = new ConversionOptimizer();

// Mock factors object
const mockFactors = {
  trustSignals: { score: 50 },
  userExperience: { score: 60 },
  productPresentation: { score: 70 },
  checkoutProcess: { score: 40 },
  socialProof: { score: 30 },
  mobileOptimization: { score: 80 },
  loadingSpeed: { score: 90 }
};

console.log('Testing remaining methods...');

try {
  console.log('1. Testing _calculateOverallScore...');
  const overallScore = optimizer._calculateOverallScore(mockFactors);
  console.log('Overall score result:', overallScore);
} catch (error) {
  console.error('Overall score error:', error.message);
  console.error('Stack:', error.stack);
}

try {
  console.log('2. Testing _generateRecommendations...');
  const recommendations = optimizer._generateRecommendations(mockFactors);
  console.log('Recommendations result length:', recommendations.length);
} catch (error) {
  console.error('Recommendations error:', error.message);
  console.error('Stack:', error.stack);
}

try {
  console.log('3. Testing _identifyOptimizationOpportunities...');
  const opportunities = optimizer._identifyOptimizationOpportunities(mockFactors);
  console.log('Opportunities result length:', opportunities.length);
} catch (error) {
  console.error('Opportunities error:', error.message);
  console.error('Stack:', error.stack);
}

try {
  console.log('4. Testing _identifyCompetitiveAdvantages...');
  const advantages = optimizer._identifyCompetitiveAdvantages(mockFactors);
  console.log('Advantages result length:', advantages.length);
} catch (error) {
  console.error('Advantages error:', error.message);
  console.error('Stack:', error.stack);
}
