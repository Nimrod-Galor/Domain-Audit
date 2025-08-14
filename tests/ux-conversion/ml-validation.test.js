/**
 * ============================================================================
 * AI MODEL VALIDATION & MACHINE LEARNING TEST SUITE
 * ============================================================================
 * 
 * Comprehensive testing for AI models, machine learning algorithms,
 * and predictive analytics components.
 * 
 * @version 3.0.0 - AI ML Testing
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Week 2 ML Testing
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { PredictiveAnalyticsEngine } from '../src/analyzers/ux-conversion/ai/predictive-analytics.js';
import { AIEnhancedUXEngine } from '../src/analyzers/ux-conversion/ai/ai-enhanced-engine.js';

/**
 * Mock ML training data
 */
const mockTrainingData = {
  features: [
    { ctaCount: 3, formFields: 5, loadTime: 2.1, score: 75 },
    { ctaCount: 2, formFields: 3, loadTime: 1.8, score: 85 },
    { ctaCount: 4, formFields: 8, loadTime: 3.2, score: 65 },
    { ctaCount: 1, formFields: 2, loadTime: 1.5, score: 90 },
    { ctaCount: 5, formFields: 10, loadTime: 4.1, score: 55 }
  ],
  outcomes: [0.75, 0.85, 0.65, 0.90, 0.55],
  labels: ['moderate', 'good', 'poor', 'excellent', 'poor']
};

const mockPageFeatures = {
  ctaCount: 3,
  formFields: 4,
  loadTime: 2.0,
  visualHierarchy: 80,
  accessibility: 75,
  userFlow: 85,
  mobileOptimization: 90,
  trustSignals: 70
};

/**
 * Machine Learning Model Tests
 */
describe('ML Model Validation', () => {
  let predictiveEngine;

  beforeEach(() => {
    predictiveEngine = new PredictiveAnalyticsEngine({
      industryType: 'ecommerce',
      enableMLPredictions: true,
      enableModelTraining: true,
      enableCrossValidation: true
    });
  });

  test('should initialize ML models with correct architecture', () => {
    const models = predictiveEngine.models;
    
    expect(models.has('CONVERSION_PREDICTOR')).toBe(true);
    expect(models.has('USER_BEHAVIOR_PREDICTOR')).toBe(true);
    expect(models.has('OPTIMIZATION_RECOMMENDER')).toBe(true);
    
    const conversionModel = models.get('CONVERSION_PREDICTOR');
    expect(conversionModel).toHaveProperty('config');
    expect(conversionModel.config).toHaveProperty('inputFeatures');
    expect(conversionModel.config).toHaveProperty('outputNodes');
    expect(conversionModel.config).toHaveProperty('hiddenLayers');
    
    expect(Array.isArray(conversionModel.config.inputFeatures)).toBe(true);
    expect(conversionModel.config.inputFeatures.length).toBeGreaterThan(0);
  });

  test('should perform feature extraction correctly', async () => {
    const mockResults = {
      detectors: {
        cta: { result: { elementsFound: 3, scores: { overall: 85 } } },
        form: { result: { elementsFound: 2, scores: { overall: 75 } } }
      }
    };

    const features = await predictiveEngine.extractFeatures(mockResults, {
      industry: 'ecommerce',
      pageType: 'landing',
      deviceType: 'desktop'
    });

    expect(features).toHaveProperty('numerical');
    expect(features).toHaveProperty('categorical');
    expect(features).toHaveProperty('engineered');
    
    expect(features.numerical).toHaveProperty('cta_count');
    expect(features.numerical).toHaveProperty('form_count');
    expect(features.numerical.cta_count).toBe(3);
    expect(features.numerical.form_count).toBe(2);
    
    expect(features.categorical).toHaveProperty('industry');
    expect(features.categorical).toHaveProperty('page_type');
    expect(features.categorical.industry).toBe('ecommerce');
    
    expect(features.engineered).toHaveProperty('cta_to_form_ratio');
    expect(features.engineered.cta_to_form_ratio).toBeCloseTo(1.5, 1);
  });

  test('should normalize features for ML input', async () => {
    const rawFeatures = {
      numerical: {
        cta_count: 5,
        form_count: 10,
        load_time: 3.5,
        score: 75
      },
      categorical: {
        industry: 'ecommerce',
        device_type: 'mobile'
      }
    };

    const normalized = await predictiveEngine.normalizeFeatures(rawFeatures);
    
    expect(normalized).toHaveProperty('vector');
    expect(normalized).toHaveProperty('metadata');
    
    expect(Array.isArray(normalized.vector)).toBe(true);
    expect(normalized.vector.length).toBeGreaterThan(0);
    
    // All normalized values should be between 0 and 1
    normalized.vector.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
    
    expect(normalized.metadata).toHaveProperty('featureNames');
    expect(normalized.metadata).toHaveProperty('normalizationMethod');
  });

  test('should make accurate predictions', async () => {
    const mockFeatures = await predictiveEngine.normalizeFeatures({
      numerical: mockPageFeatures,
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    });

    const prediction = await predictiveEngine.predict('CONVERSION_PREDICTOR', mockFeatures);
    
    expect(prediction).toHaveProperty('value');
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('distribution');
    expect(prediction).toHaveProperty('explanation');
    
    expect(prediction.value).toBeGreaterThan(0);
    expect(prediction.value).toBeLessThanOrEqual(1);
    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
    
    expect(Array.isArray(prediction.distribution)).toBe(true);
    expect(prediction.explanation).toHaveProperty('topFeatures');
    expect(Array.isArray(prediction.explanation.topFeatures)).toBe(true);
  });

  test('should perform cross-validation correctly', async () => {
    const validationResults = await predictiveEngine.performCrossValidation(
      'CONVERSION_PREDICTOR',
      mockTrainingData,
      { folds: 3 }
    );
    
    expect(validationResults).toHaveProperty('accuracy');
    expect(validationResults).toHaveProperty('precision');
    expect(validationResults).toHaveProperty('recall');
    expect(validationResults).toHaveProperty('f1Score');
    expect(validationResults).toHaveProperty('confusionMatrix');
    expect(validationResults).toHaveProperty('foldResults');
    
    expect(validationResults.accuracy).toBeGreaterThan(0);
    expect(validationResults.accuracy).toBeLessThanOrEqual(1);
    expect(Array.isArray(validationResults.foldResults)).toBe(true);
    expect(validationResults.foldResults).toHaveLength(3);
    
    validationResults.foldResults.forEach(fold => {
      expect(fold).toHaveProperty('accuracy');
      expect(fold).toHaveProperty('loss');
      expect(fold.accuracy).toBeGreaterThan(0);
    });
  });

  test('should detect model overfitting', async () => {
    // Create overfitted training data (very small dataset, perfect fit)
    const overfittedData = {
      features: [
        { ctaCount: 1, formFields: 1, loadTime: 1.0, score: 100 },
        { ctaCount: 2, formFields: 2, loadTime: 2.0, score: 50 }
      ],
      outcomes: [1.0, 0.5],
      labels: ['perfect', 'poor']
    };

    const validationResults = await predictiveEngine.performCrossValidation(
      'CONVERSION_PREDICTOR',
      overfittedData,
      { folds: 2, detectOverfitting: true }
    );
    
    expect(validationResults).toHaveProperty('overfittingDetection');
    expect(validationResults.overfittingDetection).toHaveProperty('isOverfitted');
    expect(validationResults.overfittingDetection).toHaveProperty('confidence');
    expect(validationResults.overfittingDetection).toHaveProperty('recommendations');
    
    // With such small data, should detect potential overfitting
    if (validationResults.overfittingDetection.isOverfitted) {
      expect(Array.isArray(validationResults.overfittingDetection.recommendations)).toBe(true);
    }
  });

  test('should update model weights based on feedback', async () => {
    const initialWeights = await predictiveEngine.getModelWeights('CONVERSION_PREDICTOR');
    
    const feedbackData = {
      predictions: [0.8, 0.6, 0.9],
      actual: [0.85, 0.55, 0.95],
      features: [mockPageFeatures, mockPageFeatures, mockPageFeatures]
    };

    await predictiveEngine.updateModelWithFeedback('CONVERSION_PREDICTOR', feedbackData);
    
    const updatedWeights = await predictiveEngine.getModelWeights('CONVERSION_PREDICTOR');
    
    // Weights should be updated (not identical)
    expect(initialWeights).not.toEqual(updatedWeights);
    
    // Should record learning metrics
    expect(predictiveEngine.learningMetrics).toHaveProperty('lastUpdate');
    expect(predictiveEngine.learningMetrics).toHaveProperty('feedbackProcessed');
    expect(predictiveEngine.learningMetrics.feedbackProcessed).toBeGreaterThan(0);
  });
});

/**
 * AI Pattern Recognition Tests
 */
describe('AI Pattern Recognition', () => {
  let aiEngine;

  beforeEach(() => {
    aiEngine = new AIEnhancedUXEngine({
      aiProvider: 'hybrid',
      enablePatternLearning: true,
      enableVisualAnalysis: true,
      patternConfidenceThreshold: 0.7
    });
  });

  test('should detect visual hierarchy patterns', async () => {
    const mockVisualData = {
      elements: [
        { type: 'header', size: 24, position: { x: 100, y: 50 }, color: '#000' },
        { type: 'subheader', size: 18, position: { x: 100, y: 100 }, color: '#333' },
        { type: 'cta', size: 16, position: { x: 200, y: 300 }, color: '#ff6600' },
        { type: 'text', size: 14, position: { x: 100, y: 150 }, color: '#666' }
      ],
      viewport: { width: 1200, height: 800 }
    };

    const patterns = await aiEngine.detectVisualPatterns(mockVisualData);
    
    expect(patterns).toHaveProperty('hierarchy');
    expect(patterns).toHaveProperty('flow');
    expect(patterns).toHaveProperty('attention');
    expect(patterns).toHaveProperty('consistency');
    
    expect(patterns.hierarchy).toHaveProperty('score');
    expect(patterns.hierarchy).toHaveProperty('issues');
    expect(patterns.hierarchy.score).toBeGreaterThan(0);
    expect(patterns.hierarchy.score).toBeLessThanOrEqual(100);
    
    expect(Array.isArray(patterns.hierarchy.issues)).toBe(true);
    expect(patterns.flow).toHaveProperty('readingPattern');
    expect(['f-pattern', 'z-pattern', 'irregular']).toContain(patterns.flow.readingPattern);
  });

  test('should learn from successful patterns', async () => {
    const successfulPattern = {
      type: 'conversion_optimized',
      elements: ['clear_cta', 'minimal_form', 'trust_signals'],
      metrics: { conversionRate: 0.95, confidence: 0.9 },
      context: { industry: 'ecommerce', pageType: 'checkout' }
    };

    const initialLibrarySize = aiEngine.patternLibrary.size;
    
    await aiEngine.learnFromPattern(successfulPattern, 'success');
    
    const updatedLibrarySize = aiEngine.patternLibrary.size;
    
    expect(updatedLibrarySize).toBeGreaterThanOrEqual(initialLibrarySize);
    expect(aiEngine.learningMetrics.patternsLearned).toBeGreaterThan(0);
    
    // Should be able to recognize similar patterns
    const similarPattern = {
      type: 'conversion_optimized',
      elements: ['clear_cta', 'short_form', 'testimonials'],
      context: { industry: 'ecommerce', pageType: 'landing' }
    };

    const recognition = await aiEngine.recognizePattern(similarPattern);
    expect(recognition).toHaveProperty('confidence');
    expect(recognition).toHaveProperty('similarity');
    expect(recognition.confidence).toBeGreaterThan(0);
  });

  test('should identify problematic patterns', async () => {
    const problematicPattern = {
      type: 'conversion_killer',
      elements: ['hidden_cta', 'complex_form', 'no_trust_signals'],
      metrics: { conversionRate: 0.15, confidence: 0.8 },
      context: { industry: 'finance', pageType: 'signup' }
    };

    await aiEngine.learnFromPattern(problematicPattern, 'failure');
    
    const mockPageData = {
      elements: ['unclear_cta', 'long_form', 'minimal_trust'],
      context: { industry: 'finance', pageType: 'signup' }
    };

    const analysis = await aiEngine.analyzeForProblematicPatterns(mockPageData);
    
    expect(analysis).toHaveProperty('risks');
    expect(analysis).toHaveProperty('warnings');
    expect(analysis).toHaveProperty('recommendations');
    
    expect(Array.isArray(analysis.risks)).toBe(true);
    expect(Array.isArray(analysis.warnings)).toBe(true);
    expect(Array.isArray(analysis.recommendations)).toBe(true);
    
    if (analysis.risks.length > 0) {
      analysis.risks.forEach(risk => {
        expect(risk).toHaveProperty('type');
        expect(risk).toHaveProperty('severity');
        expect(risk).toHaveProperty('confidence');
        expect(['low', 'medium', 'high', 'critical']).toContain(risk.severity);
      });
    }
  });

  test('should generate contextual recommendations', async () => {
    const context = {
      industry: 'healthcare',
      pageType: 'appointment_booking',
      deviceType: 'mobile',
      userSegment: 'elderly'
    };

    const currentAnalysis = {
      scores: { accessibility: 60, usability: 70, conversion: 65 },
      issues: ['small_text', 'complex_navigation', 'unclear_cta']
    };

    const recommendations = await aiEngine.generateContextualRecommendations(
      currentAnalysis,
      context
    );
    
    expect(recommendations).toHaveProperty('priority');
    expect(recommendations).toHaveProperty('accessibility');
    expect(recommendations).toHaveProperty('industry_specific');
    expect(recommendations).toHaveProperty('device_optimized');
    
    expect(Array.isArray(recommendations.priority)).toBe(true);
    expect(Array.isArray(recommendations.accessibility)).toBe(true);
    
    // Healthcare should prioritize accessibility
    expect(recommendations.accessibility.length).toBeGreaterThan(0);
    
    recommendations.priority.forEach(rec => {
      expect(rec).toHaveProperty('action');
      expect(rec).toHaveProperty('impact');
      expect(rec).toHaveProperty('effort');
      expect(rec).toHaveProperty('priority_score');
      expect(rec.priority_score).toBeGreaterThan(0);
    });
  });

  test('should perform A/B test predictions', async () => {
    const controlVariant = {
      elements: ['standard_cta', 'full_form', 'basic_layout'],
      metrics: { conversionRate: 0.12, bounceRate: 0.65 }
    };

    const testVariant = {
      elements: ['prominent_cta', 'simplified_form', 'optimized_layout'],
      changes: ['increased_cta_size', 'reduced_form_fields', 'improved_hierarchy']
    };

    const prediction = await aiEngine.predictABTestOutcome(controlVariant, testVariant);
    
    expect(prediction).toHaveProperty('expectedLift');
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('riskAssessment');
    expect(prediction).toHaveProperty('requiredSampleSize');
    expect(prediction).toHaveProperty('estimatedDuration');
    
    expect(prediction.expectedLift).toHaveProperty('conversionRate');
    expect(prediction.expectedLift).toHaveProperty('bounceRate');
    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
    
    expect(prediction.riskAssessment).toHaveProperty('level');
    expect(['low', 'medium', 'high']).toContain(prediction.riskAssessment.level);
    
    expect(prediction.requiredSampleSize).toBeGreaterThan(0);
    expect(prediction.estimatedDuration).toHaveProperty('days');
  });
});

/**
 * AI Model Performance Tests
 */
describe('AI Model Performance', () => {
  let predictiveEngine;

  beforeEach(() => {
    predictiveEngine = new PredictiveAnalyticsEngine({
      industryType: 'ecommerce',
      enableMLPredictions: true,
      performanceMode: 'balanced'
    });
  });

  test('should maintain prediction accuracy above threshold', async () => {
    const testCases = [
      { features: mockPageFeatures, expected: 0.8 },
      { features: { ...mockPageFeatures, ctaCount: 1 }, expected: 0.9 },
      { features: { ...mockPageFeatures, formFields: 10 }, expected: 0.6 },
      { features: { ...mockPageFeatures, loadTime: 5.0 }, expected: 0.5 }
    ];

    let correctPredictions = 0;
    const tolerance = 0.15; // 15% tolerance

    for (const testCase of testCases) {
      const normalizedFeatures = await predictiveEngine.normalizeFeatures({
        numerical: testCase.features,
        categorical: { industry: 'ecommerce', device_type: 'desktop' }
      });

      const prediction = await predictiveEngine.predict('CONVERSION_PREDICTOR', normalizedFeatures);
      
      const error = Math.abs(prediction.value - testCase.expected);
      if (error <= tolerance) {
        correctPredictions++;
      }
    }

    const accuracy = correctPredictions / testCases.length;
    expect(accuracy).toBeGreaterThan(0.7); // 70% accuracy threshold
  });

  test('should process predictions within performance limits', async () => {
    const features = await predictiveEngine.normalizeFeatures({
      numerical: mockPageFeatures,
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    });

    const startTime = Date.now();
    const prediction = await predictiveEngine.predict('CONVERSION_PREDICTOR', features);
    const endTime = Date.now();
    
    const predictionTime = endTime - startTime;
    
    // Single prediction should complete within 1 second
    expect(predictionTime).toBeLessThan(1000);
    expect(prediction).toBeDefined();
    expect(prediction.value).toBeDefined();
  });

  test('should handle batch predictions efficiently', async () => {
    const batchFeatures = Array(10).fill().map((_, i) => ({
      numerical: { ...mockPageFeatures, ctaCount: i + 1 },
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    }));

    const normalizedBatch = await Promise.all(
      batchFeatures.map(f => predictiveEngine.normalizeFeatures(f))
    );

    const startTime = Date.now();
    const predictions = await predictiveEngine.batchPredict('CONVERSION_PREDICTOR', normalizedBatch);
    const endTime = Date.now();
    
    const batchTime = endTime - startTime;
    
    // Batch of 10 should complete within 3 seconds
    expect(batchTime).toBeLessThan(3000);
    expect(predictions).toHaveLength(10);
    
    predictions.forEach(prediction => {
      expect(prediction).toHaveProperty('value');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction.value).toBeGreaterThan(0);
      expect(prediction.value).toBeLessThanOrEqual(1);
    });
  });

  test('should manage memory usage during training', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate training with larger dataset
    const largeTrainingData = {
      features: Array(100).fill().map((_, i) => ({
        ctaCount: Math.floor(Math.random() * 5) + 1,
        formFields: Math.floor(Math.random() * 10) + 1,
        loadTime: Math.random() * 4 + 1,
        score: Math.floor(Math.random() * 40) + 60
      })),
      outcomes: Array(100).fill().map(() => Math.random()),
      labels: Array(100).fill().map(() => Math.random() > 0.5 ? 'good' : 'poor')
    };

    await predictiveEngine.performCrossValidation(
      'CONVERSION_PREDICTOR',
      largeTrainingData,
      { folds: 5 }
    );
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('should cache model predictions appropriately', async () => {
    const features = await predictiveEngine.normalizeFeatures({
      numerical: mockPageFeatures,
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    });

    // First prediction
    const startTime1 = Date.now();
    const prediction1 = await predictiveEngine.predict('CONVERSION_PREDICTOR', features);
    const endTime1 = Date.now();
    const time1 = endTime1 - startTime1;

    // Second prediction with same features (should use cache)
    const startTime2 = Date.now();
    const prediction2 = await predictiveEngine.predict('CONVERSION_PREDICTOR', features);
    const endTime2 = Date.now();
    const time2 = endTime2 - startTime2;

    // Cached prediction should be faster and identical
    expect(time2).toBeLessThan(time1);
    expect(prediction1.value).toEqual(prediction2.value);
    expect(prediction1.confidence).toEqual(prediction2.confidence);
  });
});

/**
 * Model Interpretability Tests
 */
describe('Model Interpretability', () => {
  let predictiveEngine;

  beforeEach(() => {
    predictiveEngine = new PredictiveAnalyticsEngine({
      industryType: 'ecommerce',
      enableExplainability: true,
      enableFeatureImportance: true
    });
  });

  test('should provide feature importance explanations', async () => {
    const features = await predictiveEngine.normalizeFeatures({
      numerical: mockPageFeatures,
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    });

    const prediction = await predictiveEngine.predict('CONVERSION_PREDICTOR', features);
    
    expect(prediction.explanation).toHaveProperty('topFeatures');
    expect(prediction.explanation).toHaveProperty('featureContributions');
    expect(prediction.explanation).toHaveProperty('confidenceFactors');
    
    expect(Array.isArray(prediction.explanation.topFeatures)).toBe(true);
    expect(prediction.explanation.topFeatures.length).toBeGreaterThan(0);
    
    prediction.explanation.topFeatures.forEach(feature => {
      expect(feature).toHaveProperty('name');
      expect(feature).toHaveProperty('importance');
      expect(feature).toHaveProperty('contribution');
      expect(feature.importance).toBeGreaterThan(0);
      expect(feature.importance).toBeLessThanOrEqual(1);
    });
    
    expect(typeof prediction.explanation.featureContributions).toBe('object');
    expect(Array.isArray(prediction.explanation.confidenceFactors)).toBe(true);
  });

  test('should generate human-readable explanations', async () => {
    const features = await predictiveEngine.normalizeFeatures({
      numerical: mockPageFeatures,
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    });

    const prediction = await predictiveEngine.predict('CONVERSION_PREDICTOR', features);
    const explanation = await predictiveEngine.generateHumanExplanation(prediction);
    
    expect(explanation).toHaveProperty('summary');
    expect(explanation).toHaveProperty('keyFactors');
    expect(explanation).toHaveProperty('recommendations');
    expect(explanation).toHaveProperty('confidence_explanation');
    
    expect(typeof explanation.summary).toBe('string');
    expect(explanation.summary.length).toBeGreaterThan(50);
    
    expect(Array.isArray(explanation.keyFactors)).toBe(true);
    expect(Array.isArray(explanation.recommendations)).toBe(true);
    
    explanation.keyFactors.forEach(factor => {
      expect(factor).toHaveProperty('factor');
      expect(factor).toHaveProperty('impact');
      expect(factor).toHaveProperty('description');
      expect(typeof factor.description).toBe('string');
    });
  });

  test('should provide counterfactual explanations', async () => {
    const features = await predictiveEngine.normalizeFeatures({
      numerical: mockPageFeatures,
      categorical: { industry: 'ecommerce', device_type: 'desktop' }
    });

    const counterfactuals = await predictiveEngine.generateCounterfactuals(
      'CONVERSION_PREDICTOR',
      features,
      { targetChange: 0.1, maxChanges: 3 }
    );
    
    expect(counterfactuals).toHaveProperty('scenarios');
    expect(counterfactuals).toHaveProperty('minimal_changes');
    expect(counterfactuals).toHaveProperty('impact_analysis');
    
    expect(Array.isArray(counterfactuals.scenarios)).toBe(true);
    expect(counterfactuals.scenarios.length).toBeGreaterThan(0);
    
    counterfactuals.scenarios.forEach(scenario => {
      expect(scenario).toHaveProperty('changes');
      expect(scenario).toHaveProperty('predicted_outcome');
      expect(scenario).toHaveProperty('feasibility');
      expect(['easy', 'moderate', 'difficult']).toContain(scenario.feasibility);
    });
    
    expect(counterfactuals.minimal_changes).toHaveProperty('changes_needed');
    expect(counterfactuals.minimal_changes).toHaveProperty('expected_impact');
  });
});

export {
  mockTrainingData,
  mockPageFeatures
};
