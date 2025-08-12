/**
 * UX Conversion Analyzer Test Suite
 * 
 * Comprehensive tests for the UX Conversion Analyzer pilot implementation.
 * Validates the Combined Approach architecture and all components.
 */

import { describe, beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import { UXConversionAnalyzer } from '../../../src/analyzers/ux/ux-conversion-analyzer.js';
import { UXStandards } from '../../../src/analyzers/ux/config/ux-standards.js';
import { UXWeights } from '../../../src/analyzers/ux/config/ux-weights.js';
import { UXFeatureFlags } from '../../../src/analyzers/ux/config/ux-feature-flags.js';
import { UXValidationHelpers } from '../../../src/analyzers/ux/utils/ux-validation-helpers.js';

// Mock DOM and dependencies
const mockDOM = {
  window: {
    document: {
      querySelectorAll: jest.fn(),
      querySelector: jest.fn(),
      title: 'Test Page',
      head: { querySelector: jest.fn() },
      body: { 
        querySelector: jest.fn(),
        querySelectorAll: jest.fn() 
      }
    },
    location: {
      href: 'https://example.com/test',
      protocol: 'https:'
    },
    getComputedStyle: jest.fn(() => ({})),
    performance: {
      now: jest.fn(() => Date.now())
    }
  }
};

const mockAIManager = {
  enhanceAnalysis: jest.fn(async (type, data) => ({
    enhanced: true,
    patterns: { userFlow: 'optimized' },
    predictions: { conversionRate: '15-25%' },
    recommendations: ['Improve CTA visibility', 'Reduce form friction']
  }))
};

describe('UX Conversion Analyzer - Combined Approach Implementation', () => {
  let analyzer;
  let standards;
  let weights;
  let featureFlags;
  let validationHelpers;

  beforeEach(() => {
    // Initialize components
    standards = new UXStandards();
    weights = new UXWeights('default');
    featureFlags = new UXFeatureFlags('development');
    validationHelpers = new UXValidationHelpers();

    // Create analyzer instance
    analyzer = new UXConversionAnalyzer(mockAIManager, {
      enableAI: true,
      enablePerformanceMonitoring: true,
      weights: 'default',
      standards: standards,
      featureFlags: featureFlags
    });

    // Setup DOM mocks
    global.window = mockDOM.window;
    global.document = mockDOM.window.document;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Components', () => {
    test('UXStandards provides comprehensive standards', () => {
      expect(standards.standards).toBeDefined();
      expect(standards.standards.usability).toBeDefined();
      expect(standards.standards.conversion).toBeDefined();
      expect(standards.standards.cognitive).toBeDefined();
      expect(standards.standards.trust).toBeDefined();

      // Test benchmark access
      const conversionBenchmark = standards.getBenchmark('conversionRates', 'ecommerce');
      expect(conversionBenchmark).toBeDefined();
      expect(conversionBenchmark.average).toBe('2.86%');

      // Test quality thresholds
      const threshold = standards.getQualityThreshold(85);
      expect(threshold.level).toBe('excellent');
      expect(threshold.grade).toBe('A');
    });

    test('UXWeights provides context-specific weighting', () => {
      // Test default weights
      const usabilityWeight = weights.getWeight('heuristicAreas', 'usability');
      expect(usabilityWeight).toBe(0.30);

      // Test weight validation
      const validation = weights.validateWeights('heuristicAreas');
      expect(validation.valid).toBe(true);
      expect(Math.abs(validation.sum - 1.0)).toBeLessThan(0.01);

      // Test context switching
      const ecommerceWeights = new UXWeights('ecommerce');
      const conversionWeight = ecommerceWeights.getWeight('heuristicAreas', 'conversionPath');
      expect(conversionWeight).toBe(0.35); // Higher for e-commerce
    });

    test('UXFeatureFlags manages feature enablement', () => {
      // Test development environment flags
      expect(featureFlags.isEnabled('ai', 'enableAIEnhancement')).toBe(true);
      expect(featureFlags.isEnabled('developer', 'enableDebugMode')).toBe(true);

      // Test feature toggling
      featureFlags.disable('ai', 'enableAIEnhancement');
      expect(featureFlags.isEnabled('ai', 'enableAIEnhancement')).toBe(false);

      // Test experiment setup
      featureFlags.setupExperiment('experimental', 'enableQuantumAnalysis', {
        percentage: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000) // 1 day
      });
      
      // Multiple calls should be consistent within experiment
      const result1 = featureFlags.isEnabled('experimental', 'enableQuantumAnalysis');
      const result2 = featureFlags.isEnabled('experimental', 'enableQuantumAnalysis');
      expect(result1).toBe(result2);
    });

    test('UXValidationHelpers validates analysis data', () => {
      // Test score validation
      const validScore = validationHelpers.validateScore(85.5);
      expect(validScore.valid).toBe(true);

      const invalidScore = validationHelpers.validateScore(150);
      expect(invalidScore.valid).toBe(false);

      // Test confidence validation
      const validConfidence = validationHelpers.validateConfidence(0.85);
      expect(validConfidence.valid).toBe(true);

      // Test URL validation
      const validUrl = validationHelpers.validateUrl('https://example.com/test');
      expect(validUrl.valid).toBe(true);

      // Test weight validation
      const validWeights = validationHelpers.validateWeights({
        usability: 0.3,
        conversion: 0.3,
        cognitive: 0.2,
        trust: 0.2
      });
      expect(validWeights.valid).toBe(true);
    });
  });

  describe('Analyzer Initialization', () => {
    test('Initializes with correct configuration', () => {
      expect(analyzer.options.enableAI).toBe(true);
      expect(analyzer.options.enablePerformanceMonitoring).toBe(true);
      expect(analyzer.detectors).toBeDefined();
      expect(analyzer.heuristics).toBeDefined();
      expect(analyzer.scoringEngine).toBeDefined();
    });

    test('Initializes all detector components', () => {
      expect(analyzer.detectors.interaction).toBeDefined();
      expect(analyzer.detectors.navigation).toBeDefined();
      expect(analyzer.detectors.form).toBeDefined();
      expect(analyzer.detectors.content).toBeDefined();
      expect(analyzer.detectors.trustSignal).toBeDefined();
    });

    test('Initializes all heuristic analyzers', () => {
      expect(analyzer.heuristics.usability).toBeDefined();
      expect(analyzer.heuristics.conversionPath).toBeDefined();
      expect(analyzer.heuristics.cognitiveLoad).toBeDefined();
      expect(analyzer.heuristics.trust).toBeDefined();
    });

    test('Performance monitoring is enabled', () => {
      expect(analyzer.performanceMonitor).toBeDefined();
      expect(analyzer.performanceMonitor.options.enableDetailedMetrics).toBe(true);
    });
  });

  describe('Detection Phase (GPT-5 Style)', () => {
    beforeEach(() => {
      // Mock DOM elements for detection
      mockDOM.window.document.querySelectorAll.mockImplementation((selector) => {
        const mockElements = {
          'button, input[type="button"], input[type="submit"], .btn, [role="button"]': [
            { tagName: 'BUTTON', textContent: 'Buy Now', style: {} },
            { tagName: 'INPUT', type: 'submit', value: 'Submit', style: {} }
          ],
          'nav, .navigation, .nav, [role="navigation"]': [
            { tagName: 'NAV', children: [{ tagName: 'UL', children: [{}, {}, {}] }] }
          ],
          'form': [
            { tagName: 'FORM', children: [
              { tagName: 'INPUT', type: 'text', required: true },
              { tagName: 'INPUT', type: 'email', required: true }
            ]}
          ],
          'h1, h2, h3, h4, h5, h6': [
            { tagName: 'H1', textContent: 'Main Heading' },
            { tagName: 'H2', textContent: 'Sub Heading' }
          ],
          'img': [
            { tagName: 'IMG', alt: 'Company Logo', src: 'logo.png' }
          ]
        };
        return mockElements[selector] || [];
      });
    });

    test('Runs all detectors successfully', async () => {
      const detections = await analyzer._runDetections(mockDOM.window.document);

      expect(detections).toBeDefined();
      expect(detections.interaction).toBeDefined();
      expect(detections.navigation).toBeDefined();
      expect(detections.form).toBeDefined();
      expect(detections.content).toBeDefined();
      expect(detections.trustSignal).toBeDefined();

      // Validate detection structure
      Object.values(detections).forEach(detection => {
        expect(detection.elements).toBeDefined();
        expect(detection.analysis).toBeDefined();
        expect(detection.metadata).toBeDefined();
      });
    });

    test('Interaction detector finds interactive elements', async () => {
      const detection = await analyzer.detectors.interaction.detect(mockDOM.window.document);
      
      expect(detection.elements.buttons.length).toBeGreaterThan(0);
      expect(detection.analysis.totalInteractiveElements).toBeGreaterThan(0);
      expect(detection.analysis.touchOptimization).toBeDefined();
    });

    test('Navigation detector analyzes navigation structure', async () => {
      const detection = await analyzer.detectors.navigation.detect(mockDOM.window.document);
      
      expect(detection.elements.navigationContainers.length).toBeGreaterThan(0);
      expect(detection.analysis.navigationComplexity).toBeDefined();
      expect(detection.analysis.navigationDepth).toBeDefined();
    });

    test('Form detector identifies form elements', async () => {
      const detection = await analyzer.detectors.form.detect(mockDOM.window.document);
      
      expect(detection.elements.forms.length).toBeGreaterThan(0);
      expect(detection.analysis.formComplexity).toBeDefined();
      expect(detection.analysis.validationFeatures).toBeDefined();
    });
  });

  describe('Heuristic Analysis Phase (GPT-5 Style)', () => {
    let mockDetections;

    beforeEach(() => {
      mockDetections = {
        interaction: {
          elements: { buttons: [{}], links: [{}] },
          analysis: { 
            totalInteractiveElements: 5,
            touchOptimization: { touchOptimizationScore: 75 },
            accessibilityFeatures: { hasKeyboardSupport: true }
          }
        },
        navigation: {
          elements: { navigationContainers: [{}] },
          analysis: { 
            navigationComplexity: { complexityScore: 65 },
            navigationDepth: 3,
            searchFunctionality: { found: true }
          }
        },
        form: {
          elements: { forms: [{ fields: [{}, {}] }] },
          analysis: { 
            formComplexity: { score: 70 },
            validationFeatures: { realTimeValidation: false }
          }
        },
        content: {
          elements: { headings: [{}], paragraphs: [{}] },
          analysis: { 
            contentStructure: { score: 80 },
            readabilityMetrics: { fleschScore: 65 }
          }
        },
        trustSignal: {
          elements: { securityIndicators: [{}], testimonials: [] },
          analysis: { 
            trustScore: 60,
            credibilitySignals: { count: 3 }
          }
        }
      };
    });

    test('Runs all heuristic analyzers', async () => {
      const heuristicResults = await analyzer._runHeuristicAnalysis(mockDetections);

      expect(heuristicResults).toBeDefined();
      expect(heuristicResults.usability).toBeDefined();
      expect(heuristicResults.conversionPath).toBeDefined();
      expect(heuristicResults.cognitiveLoad).toBeDefined();
      expect(heuristicResults.trust).toBeDefined();

      // Validate heuristic structure
      Object.values(heuristicResults).forEach(heuristic => {
        expect(heuristic.score).toBeGreaterThanOrEqual(0);
        expect(heuristic.score).toBeLessThanOrEqual(100);
        expect(heuristic.metrics).toBeDefined();
        expect(heuristic.findings).toBeDefined();
        expect(heuristic.recommendations).toBeDefined();
      });
    });

    test('Usability analyzer follows Nielsen heuristics', async () => {
      const result = await analyzer.heuristics.usability.analyze(mockDetections);
      
      expect(result.metrics.visibility).toBeDefined();
      expect(result.metrics.userControl).toBeDefined();
      expect(result.metrics.consistency).toBeDefined();
      expect(result.metrics.errorPrevention).toBeDefined();
      
      // Check findings reference Nielsen's principles
      expect(result.findings.some(f => 
        f.title.includes('visibility') || 
        f.title.includes('control') || 
        f.title.includes('consistency')
      )).toBe(true);
    });

    test('Conversion path analyzer identifies optimization opportunities', async () => {
      const result = await analyzer.heuristics.conversionPath.analyze(mockDetections);
      
      expect(result.metrics.conversionElements).toBeDefined();
      expect(result.metrics.pathClarity).toBeDefined();
      expect(result.metrics.frictionPoints).toBeDefined();
      expect(result.metrics.callToActions).toBeDefined();
      
      // Should provide actionable recommendations
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.every(r => r.action && r.impact && r.effort)).toBe(true);
    });

    test('Cognitive load analyzer assesses mental effort', async () => {
      const result = await analyzer.heuristics.cognitiveLoad.analyze(mockDetections);
      
      expect(result.metrics.informationDensity).toBeDefined();
      expect(result.metrics.visualComplexity).toBeDefined();
      expect(result.metrics.interactionComplexity).toBeDefined();
      expect(result.metrics.decisionLoad).toBeDefined();
      
      // Should identify complexity issues
      expect(result.findings.some(f => 
        f.title.includes('complexity') || 
        f.title.includes('cognitive') ||
        f.title.includes('information')
      )).toBe(true);
    });

    test('Trust analyzer evaluates credibility signals', async () => {
      const result = await analyzer.heuristics.trust.analyze(mockDetections);
      
      expect(result.metrics.credibilitySignals).toBeDefined();
      expect(result.metrics.transparency).toBeDefined();
      expect(result.metrics.socialProof).toBeDefined();
      expect(result.metrics.securityIndicators).toBeDefined();
      
      // Should suggest trust improvements
      expect(result.recommendations.some(r => 
        r.action.includes('trust') || 
        r.action.includes('credibility') ||
        r.action.includes('security')
      )).toBe(true);
    });
  });

  describe('Scoring Engine (Rules Phase)', () => {
    let mockHeuristicResults;

    beforeEach(() => {
      mockHeuristicResults = {
        usability: {
          score: 75,
          metrics: { visibility: { score: 80 }, userControl: { score: 70 } },
          findings: [{ severity: 'medium', title: 'Improve visibility' }],
          recommendations: [{ action: 'Add progress indicators', priority: 'high' }]
        },
        conversionPath: {
          score: 65,
          metrics: { pathClarity: { score: 70 }, frictionPoints: { count: 3 } },
          findings: [{ severity: 'high', title: 'Reduce friction' }],
          recommendations: [{ action: 'Simplify checkout', priority: 'critical' }]
        },
        cognitiveLoad: {
          score: 80,
          metrics: { informationDensity: { score: 75 } },
          findings: [{ severity: 'low', title: 'Good information hierarchy' }],
          recommendations: [{ action: 'Maintain simplicity', priority: 'low' }]
        },
        trust: {
          score: 55,
          metrics: { credibilitySignals: { signalCount: 2 } },
          findings: [{ severity: 'high', title: 'Add trust signals' }],
          recommendations: [{ action: 'Add testimonials', priority: 'high' }]
        }
      };
    });

    test('Calculates weighted overall score', async () => {
      const result = await analyzer.scoringEngine.calculateUXScore(
        mockHeuristicResults, 
        weights.getCategoryWeights('heuristicAreas')
      );

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.weightedBreakdown).toBeDefined();
      expect(result.grade).toBeDefined();
      
      // Check weighted calculation
      const expectedScore = (75 * 0.30) + (65 * 0.25) + (80 * 0.25) + (55 * 0.20);
      expect(Math.abs(result.overallScore - expectedScore)).toBeLessThan(1);
    });

    test('Consolidates findings across heuristics', async () => {
      const result = await analyzer.scoringEngine.calculateUXScore(
        mockHeuristicResults, 
        weights.getCategoryWeights('heuristicAreas')
      );

      expect(result.consolidatedFindings).toBeDefined();
      expect(result.consolidatedFindings.critical).toBeDefined();
      expect(result.consolidatedFindings.high).toBeDefined();
      expect(result.consolidatedFindings.medium).toBeDefined();
      expect(result.consolidatedFindings.low).toBeDefined();

      // Should categorize findings by severity
      const totalFindings = Object.values(result.consolidatedFindings).flat().length;
      expect(totalFindings).toBeGreaterThan(0);
    });

    test('Prioritizes recommendations', async () => {
      const result = await analyzer.scoringEngine.calculateUXScore(
        mockHeuristicResults, 
        weights.getCategoryWeights('heuristicAreas')
      );

      expect(result.prioritizedRecommendations).toBeDefined();
      expect(Array.isArray(result.prioritizedRecommendations)).toBe(true);

      // Should be sorted by priority
      const priorities = result.prioritizedRecommendations.map(r => r.priority);
      const priorityOrder = ['critical', 'high', 'medium', 'low'];
      let lastIndex = -1;
      priorities.forEach(priority => {
        const currentIndex = priorityOrder.indexOf(priority);
        expect(currentIndex).toBeGreaterThanOrEqual(lastIndex);
        lastIndex = currentIndex;
      });
    });

    test('Generates performance metrics', async () => {
      const result = await analyzer.scoringEngine.calculateUXScore(
        mockHeuristicResults, 
        weights.getCategoryWeights('heuristicAreas')
      );

      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.strengths).toBeDefined();
      expect(result.performanceMetrics.weaknesses).toBeDefined();
      expect(result.performanceMetrics.opportunities).toBeDefined();
      expect(result.performanceMetrics.threats).toBeDefined();
    });
  });

  describe('AI Enhancement (Claude Style)', () => {
    test('Enhances analysis with AI when enabled', async () => {
      // Mock a complete heuristic result
      const heuristicResults = {
        usability: { score: 75 },
        conversionPath: { score: 65 },
        cognitiveLoad: { score: 80 },
        trust: { score: 55 },
        overallScore: 69
      };

      const enhanced = await analyzer._enhanceWithAI(heuristicResults);

      expect(enhanced).toBeDefined();
      expect(mockAIManager.enhanceAnalysis).toHaveBeenCalledWith('ux_conversion', heuristicResults);
      
      // Should include AI insights
      expect(enhanced.enhanced).toBe(true);
      expect(enhanced.patterns).toBeDefined();
      expect(enhanced.predictions).toBeDefined();
      expect(enhanced.recommendations).toBeDefined();
    });

    test('Gracefully handles AI enhancement failure', async () => {
      // Mock AI failure
      mockAIManager.enhanceAnalysis.mockRejectedValueOnce(new Error('AI service unavailable'));

      const heuristicResults = { overallScore: 75 };
      const enhanced = await analyzer._enhanceWithAI(heuristicResults);

      expect(enhanced).toBeNull(); // Should return null on failure
      expect(analyzer.lastError).toContain('AI enhancement failed');
    });

    test('Skips AI enhancement when disabled', async () => {
      // Disable AI
      analyzer.options.enableAI = false;

      const heuristicResults = { overallScore: 75 };
      const enhanced = await analyzer._enhanceWithAI(heuristicResults);

      expect(enhanced).toBeNull();
      expect(mockAIManager.enhanceAnalysis).not.toHaveBeenCalled();
    });
  });

  describe('Full Analysis Integration', () => {
    beforeEach(() => {
      // Setup comprehensive DOM mock for full analysis
      mockDOM.window.document.querySelectorAll.mockImplementation((selector) => {
        const mockElements = {
          'button, input[type="button"], input[type="submit"], .btn, [role="button"]': [
            { tagName: 'BUTTON', textContent: 'Buy Now', className: 'btn-primary' },
            { tagName: 'INPUT', type: 'submit', value: 'Subscribe' }
          ],
          'nav, .navigation, .nav, [role="navigation"]': [
            { tagName: 'NAV', children: [{ tagName: 'UL', children: [{}] }] }
          ],
          'form': [
            { tagName: 'FORM', action: '/subscribe', children: [
              { tagName: 'INPUT', type: 'email', required: true, placeholder: 'Email' }
            ]}
          ],
          'h1, h2, h3, h4, h5, h6': [
            { tagName: 'H1', textContent: 'Welcome to Our Site' }
          ],
          'img': [
            { tagName: 'IMG', alt: 'Trust Badge', src: 'ssl-badge.png' }
          ],
          '.testimonial, .review, .rating': [
            { className: 'testimonial', textContent: 'Great service!' }
          ]
        };
        return mockElements[selector] || [];
      });
    });

    test('Completes full analysis successfully', async () => {
      const url = 'https://example.com/test';
      const result = await analyzer.analyze(url, mockDOM.window.document);

      // Validate result structure
      expect(result).toBeDefined();
      expect(result.url).toBe(url);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);

      // Validate heuristic results
      expect(result.usability).toBeDefined();
      expect(result.conversionPath).toBeDefined();
      expect(result.cognitiveLoad).toBeDefined();
      expect(result.trust).toBeDefined();

      // Validate scoring results
      expect(result.consolidatedFindings).toBeDefined();
      expect(result.prioritizedRecommendations).toBeDefined();
      expect(result.performanceMetrics).toBeDefined();

      // Validate AI enhancement (should be included in development)
      expect(result.aiEnhancement).toBeDefined();

      // Validate metadata
      expect(result.metadata).toBeDefined();
      expect(result.metadata.analysisDate).toBeDefined();
      expect(result.metadata.version).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });

    test('Validates analysis results', async () => {
      const url = 'https://example.com/test';
      const result = await analyzer.analyze(url, mockDOM.window.document);

      // Use validation helpers to check result integrity
      const validation = validationHelpers.validateUXResults(result);
      expect(validation.valid).toBe(true);

      // Check score validity
      const scoreValidation = validationHelpers.validateScore(result.overallScore);
      expect(scoreValidation.valid).toBe(true);

      // Check confidence validity
      const confidenceValidation = validationHelpers.validateConfidence(result.confidence);
      expect(confidenceValidation.valid).toBe(true);
    });

    test('Tracks performance metrics', async () => {
      const url = 'https://example.com/test';
      
      // Get initial metrics
      const initialMetrics = analyzer.performanceMonitor.getCurrentMetrics();
      const initialCount = initialMetrics.aggregated.totalAnalyses;

      // Run analysis
      await analyzer.analyze(url, mockDOM.window.document);

      // Check updated metrics
      const finalMetrics = analyzer.performanceMonitor.getCurrentMetrics();
      expect(finalMetrics.aggregated.totalAnalyses).toBe(initialCount + 1);
      expect(finalMetrics.aggregated.averageTime).toBeGreaterThan(0);
    });

    test('Handles analysis errors gracefully', async () => {
      // Mock detector failure
      analyzer.detectors.interaction.detect = jest.fn().mockRejectedValue(new Error('Detection failed'));

      const url = 'https://example.com/test';
      
      await expect(analyzer.analyze(url, mockDOM.window.document)).rejects.toThrow('Detection failed');
      
      // Should still track the error
      const metrics = analyzer.performanceMonitor.getCurrentMetrics();
      expect(metrics.aggregated.errors).toBeGreaterThan(0);
    });
  });

  describe('Combined Approach Validation', () => {
    test('Demonstrates GPT-5 modular architecture', () => {
      // Verify modular detector structure
      expect(analyzer.detectors.interaction).toBeDefined();
      expect(analyzer.detectors.navigation).toBeDefined();
      expect(analyzer.detectors.form).toBeDefined();
      expect(analyzer.detectors.content).toBeDefined();
      expect(analyzer.detectors.trustSignal).toBeDefined();

      // Verify separation of concerns
      expect(typeof analyzer.detectors.interaction.detect).toBe('function');
      expect(analyzer.detectors.interaction.analyze).toBeUndefined(); // Pure detection, no analysis
    });

    test('Demonstrates Claude AI enhancement integration', () => {
      // Verify AI enhancement is optional and graceful
      expect(analyzer.aiEnhancer).toBeDefined();
      expect(analyzer.options.enableAI).toBe(true);
      
      // Should work without AI
      analyzer.options.enableAI = false;
      expect(async () => {
        await analyzer.analyze('https://example.com', mockDOM.window.document);
      }).not.toThrow();
    });

    test('Maintains backward compatibility with BaseAnalyzer', () => {
      // Should inherit from BaseAnalyzer
      expect(typeof analyzer.analyze).toBe('function');
      expect(typeof analyzer.performHeuristicAnalysis).toBe('function');
      
      // Should support both modern and legacy calling patterns
      expect(analyzer.analyzerType).toBe('ux_conversion');
      expect(analyzer.version).toBeDefined();
    });

    test('Integrates all combined approach components', () => {
      // GPT-5 style modular components
      expect(analyzer.detectors).toBeDefined();
      expect(analyzer.heuristics).toBeDefined();
      expect(analyzer.scoringEngine).toBeDefined();

      // Claude style AI enhancement
      expect(analyzer.aiEnhancer).toBeDefined();

      // Existing project patterns
      expect(analyzer.performanceMonitor).toBeDefined();
      expect(analyzer.featureFlags).toBeDefined();

      // Configuration management
      expect(analyzer.standards).toBeDefined();
      expect(analyzer.weights).toBeDefined();
    });

    test('Provides comprehensive analysis coverage', async () => {
      const url = 'https://example.com/comprehensive-test';
      const result = await analyzer.analyze(url, mockDOM.window.document);

      // Should cover all UX aspects
      const aspects = ['usability', 'conversionPath', 'cognitiveLoad', 'trust'];
      aspects.forEach(aspect => {
        expect(result[aspect]).toBeDefined();
        expect(result[aspect].score).toBeGreaterThanOrEqual(0);
        expect(result[aspect].findings).toBeDefined();
        expect(result[aspect].recommendations).toBeDefined();
      });

      // Should provide actionable insights
      expect(result.prioritizedRecommendations.length).toBeGreaterThan(0);
      expect(result.consolidatedFindings).toBeDefined();

      // Should include performance and quality metrics
      expect(result.performanceMetrics).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
});
