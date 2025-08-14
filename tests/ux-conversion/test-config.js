/**
 * ============================================================================
 * TEST CONFIGURATION & SETUP FOR AI-ENHANCED UX ANALYSIS
 * ============================================================================
 * 
 * Test configuration, utilities, and setup for the AI-enhanced UX & 
 * Conversion Analysis testing suite.
 * 
 * @version 3.0.0 - AI Enhanced Testing Setup
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Week 2 Test Setup
 */

/**
 * Jest Configuration for AI-Enhanced UX Testing
 */
export const testConfig = {
  // Test environment settings
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/ux-conversion/setup.js'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/ux-conversion/**/*.test.js',
    '<rootDir>/tests/ux-conversion/**/*.spec.js'
  ],
  
  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@analyzers/(.*)$': '<rootDir>/src/analyzers/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  
  // Coverage settings
  collectCoverageFrom: [
    'src/analyzers/ux-conversion/**/*.js',
    '!src/analyzers/ux-conversion/**/*.test.js',
    '!src/analyzers/ux-conversion/**/*.spec.js'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/analyzers/ux-conversion/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Timeout settings for AI operations
  testTimeout: 30000,
  
  // Performance settings
  maxWorkers: '50%',
  
  // AI-specific settings
  globals: {
    AI_TESTING_MODE: true,
    ENABLE_AI_MOCKING: true,
    ENABLE_PERFORMANCE_PROFILING: true
  }
};

/**
 * Test Data Factory
 */
export class TestDataFactory {
  static createMockPage(options = {}) {
    const {
      url = 'https://example.com',
      title = 'Test Page',
      viewport = { width: 1920, height: 1080 },
      complexity = 'medium',
      hasErrors = false
    } = options;

    const complexityMap = {
      simple: { elements: 5, loadTime: 100 },
      medium: { elements: 25, loadTime: 300 },
      complex: { elements: 100, loadTime: 800 },
      heavy: { elements: 300, loadTime: 2000 }
    };

    const config = complexityMap[complexity] || complexityMap.medium;

    return {
      url: () => hasErrors ? (() => { throw new Error('Page load failed'); })() : url,
      title: () => title,
      viewportSize: () => viewport,
      screenshot: jest.fn().mockImplementation(() => 
        hasErrors ? 
          Promise.reject(new Error('Screenshot failed')) :
          Promise.resolve(Buffer.alloc(50000, `mock-screenshot-${complexity}`))
      ),
      $$: jest.fn().mockResolvedValue(Array(config.elements).fill({})),
      evaluate: jest.fn().mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve({ 
            elements: config.elements,
            complexity 
          }), config.loadTime)
        )
      ),
      content: jest.fn().mockResolvedValue(`Mock content for ${complexity} page with ${config.elements} elements`)
    };
  }

  static createMockDomainData(options = {}) {
    const {
      industry = 'ecommerce',
      pageType = 'landing',
      complexity = 'medium',
      deviceType = 'desktop',
      trafficSource = 'organic'
    } = options;

    return {
      industry,
      pageType,
      complexity,
      deviceType,
      trafficSource,
      timestamp: Date.now(),
      sessionId: `test-session-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  static createMockAnalysisResults(options = {}) {
    const {
      includeDetectors = true,
      includeHeuristics = true,
      includeRules = true,
      includeAI = true,
      includePredictive = true,
      score = 75
    } = options;

    const result = {
      metadata: {
        timestamp: Date.now(),
        version: '3.0.0',
        industryType: 'ecommerce',
        enhancementLevel: includeAI ? 'ai_powered' : 'standard',
        analysisTime: Math.random() * 2000 + 500
      }
    };

    if (includeDetectors) {
      result.detectors = {
        search: {
          result: {
            elementsFound: Math.floor(Math.random() * 3) + 1,
            scores: { overall: score + Math.random() * 20 - 10 },
            recommendations: ['Improve search functionality']
          }
        },
        form: {
          result: {
            elementsFound: Math.floor(Math.random() * 5) + 1,
            scores: { overall: score + Math.random() * 20 - 10 },
            recommendations: ['Optimize form fields', 'Add validation']
          }
        },
        cta: {
          result: {
            elementsFound: Math.floor(Math.random() * 4) + 2,
            scores: { overall: score + Math.random() * 20 - 10 },
            recommendations: ['Improve CTA visibility']
          }
        }
      };
    }

    if (includeHeuristics) {
      result.heuristics = {
        results: {
          overallScore: score,
          categories: {
            usability: score + Math.random() * 15 - 7,
            accessibility: score + Math.random() * 15 - 7,
            performance: score + Math.random() * 15 - 7
          },
          recommendations: [
            'Improve navigation clarity',
            'Enhance accessibility features',
            'Optimize page load time'
          ]
        }
      };
    }

    if (includeRules) {
      result.rules = {
        results: {
          passed: Math.floor(Math.random() * 10) + 15,
          failed: Math.floor(Math.random() * 5) + 2,
          score: score,
          recommendations: [
            'Fix accessibility violations',
            'Improve mobile responsiveness',
            'Optimize conversion elements'
          ]
        }
      };
    }

    if (includeAI) {
      result.ai = {
        enhancements: {
          visual: {
            hierarchy: { hierarchyScore: score + Math.random() * 10 - 5 },
            userJourney: { journeyScore: score + Math.random() * 10 - 5 },
            accessibility: { accessibilityScore: score + Math.random() * 10 - 5 }
          },
          patterns: {
            successful: ['clear_navigation', 'prominent_cta'],
            problematic: ['cluttered_layout', 'poor_contrast'],
            confidence: 0.8 + Math.random() * 0.2
          },
          predictions: {
            conversionLift: Math.random() * 0.3 + 0.1,
            confidence: 0.7 + Math.random() * 0.3
          }
        },
        summary: {
          overallConfidence: 0.8 + Math.random() * 0.2,
          keyInsights: [
            'Strong visual hierarchy detected',
            'Clear call-to-action placement',
            'Good mobile optimization'
          ]
        }
      };
    }

    if (includePredictive) {
      result.predictive = {
        predictions: {
          conversion: {
            current_estimated_rate: Math.random() * 0.1 + 0.05,
            optimized_predicted_rate: Math.random() * 0.1 + 0.1,
            confidence: 0.75 + Math.random() * 0.25
          },
          behavior: {
            engagement_predictions: {
              bounce_rate: Math.random() * 0.3 + 0.2,
              time_on_page: Math.random() * 180 + 60
            },
            interaction_patterns: ['scroll_to_cta', 'form_abandonment']
          }
        },
        recommendations: {
          high_impact: [
            'Simplify checkout process',
            'Improve CTA visibility'
          ],
          quick_wins: [
            'Fix loading speed',
            'Add trust badges'
          ]
        },
        forecasts: {
          success_probability: 0.7 + Math.random() * 0.3,
          timeline_projections: {
            '1_week': { lift: 0.05 },
            '1_month': { lift: 0.15 },
            '3_months': { lift: 0.25 }
          }
        }
      };
    }

    return result;
  }

  static createMockMLTrainingData(size = 50) {
    const features = [];
    const outcomes = [];
    const labels = [];

    for (let i = 0; i < size; i++) {
      const feature = {
        ctaCount: Math.floor(Math.random() * 5) + 1,
        formFields: Math.floor(Math.random() * 10) + 1,
        loadTime: Math.random() * 4 + 1,
        visualHierarchy: Math.random() * 40 + 60,
        mobileOptimization: Math.random() * 30 + 70,
        trustSignals: Math.random() * 50 + 50
      };

      const outcome = Math.random();
      const label = outcome > 0.7 ? 'excellent' : 
                   outcome > 0.5 ? 'good' : 
                   outcome > 0.3 ? 'moderate' : 'poor';

      features.push(feature);
      outcomes.push(outcome);
      labels.push(label);
    }

    return { features, outcomes, labels };
  }
}

/**
 * AI Mock Provider
 */
export class AIMockProvider {
  constructor() {
    this.callHistory = [];
    this.responseTemplates = new Map();
    this.responseDelay = 200; // Default delay for realistic AI response time
  }

  mockGPTResponse(prompt, context = {}) {
    this.callHistory.push({ type: 'gpt', prompt, context, timestamp: Date.now() });
    
    return new Promise(resolve => {
      setTimeout(() => {
        const response = {
          analysis: {
            visual_hierarchy: {
              score: Math.random() * 30 + 70,
              issues: ['Font sizes need better contrast', 'Heading hierarchy unclear'],
              strengths: ['Good use of whitespace', 'Clear navigation structure']
            },
            user_journey: {
              score: Math.random() * 25 + 75,
              flow_analysis: 'Well-structured user flow with clear CTAs',
              bottlenecks: ['Form complexity might deter users'],
              opportunities: ['Simplify checkout process', 'Add progress indicators']
            },
            accessibility: {
              score: Math.random() * 20 + 60,
              violations: ['Missing alt text on images', 'Insufficient color contrast'],
              recommendations: ['Add ARIA labels', 'Improve keyboard navigation']
            }
          },
          confidence: 0.85 + Math.random() * 0.15,
          processing_time: this.responseDelay
        };
        resolve(response);
      }, this.responseDelay);
    });
  }

  mockClaudeResponse(prompt, context = {}) {
    this.callHistory.push({ type: 'claude', prompt, context, timestamp: Date.now() });
    
    return new Promise(resolve => {
      setTimeout(() => {
        const response = {
          patterns: {
            successful: [
              { pattern: 'clear_cta_placement', confidence: 0.9 },
              { pattern: 'simplified_navigation', confidence: 0.85 },
              { pattern: 'trust_signal_presence', confidence: 0.8 }
            ],
            problematic: [
              { pattern: 'form_complexity', confidence: 0.75 },
              { pattern: 'unclear_value_proposition', confidence: 0.7 }
            ]
          },
          recommendations: {
            immediate: [
              'Reduce form fields from 8 to 4',
              'Increase CTA button size by 20%',
              'Add customer testimonials above the fold'
            ],
            strategic: [
              'Implement progressive disclosure for complex features',
              'A/B test different value proposition headlines'
            ]
          },
          confidence: 0.82 + Math.random() * 0.18
        };
        resolve(response);
      }, this.responseDelay);
    });
  }

  mockPredictiveAnalysis(features, context = {}) {
    this.callHistory.push({ type: 'predictive', features, context, timestamp: Date.now() });
    
    return new Promise(resolve => {
      setTimeout(() => {
        const baseConversion = Math.random() * 0.1 + 0.05;
        const response = {
          conversion_prediction: {
            current_rate: baseConversion,
            optimized_rate: baseConversion * (1.2 + Math.random() * 0.5),
            confidence: 0.75 + Math.random() * 0.25,
            factors: {
              positive: ['Strong CTA placement', 'Clear value proposition'],
              negative: ['Complex form', 'Slow loading time'],
              neutral: ['Standard navigation', 'Typical content layout']
            }
          },
          behavior_prediction: {
            bounce_rate: Math.random() * 0.3 + 0.2,
            engagement_score: Math.random() * 40 + 60,
            conversion_journey: [
              { step: 'landing', completion_rate: 1.0 },
              { step: 'engagement', completion_rate: 0.7 + Math.random() * 0.3 },
              { step: 'consideration', completion_rate: 0.4 + Math.random() * 0.3 },
              { step: 'conversion', completion_rate: baseConversion * 10 }
            ]
          },
          optimization_impact: {
            high_impact: [
              { change: 'Simplify form', expected_lift: 0.15, effort: 'medium' },
              { change: 'Improve CTA visibility', expected_lift: 0.12, effort: 'low' }
            ],
            medium_impact: [
              { change: 'Add trust signals', expected_lift: 0.08, effort: 'low' },
              { change: 'Optimize mobile layout', expected_lift: 0.10, effort: 'high' }
            ]
          }
        };
        resolve(response);
      }, this.responseDelay);
    });
  }

  getCallHistory() {
    return [...this.callHistory];
  }

  clearHistory() {
    this.callHistory = [];
  }

  setResponseDelay(delay) {
    this.responseDelay = delay;
  }
}

/**
 * Performance Testing Utilities
 */
export class TestPerformanceTracker {
  constructor() {
    this.metrics = new Map();
    this.memorySnapshots = [];
    this.thresholds = {
      singleAnalysis: 5000, // 5 seconds
      batchAnalysis: 10000, // 10 seconds
      memoryGrowth: 50 * 1024 * 1024, // 50MB
      aiResponse: 3000, // 3 seconds
      mlPrediction: 1000 // 1 second
    };
  }

  startTracking(label) {
    this.metrics.set(label, {
      startTime: process.hrtime.bigint(),
      startMemory: process.memoryUsage()
    });
  }

  endTracking(label) {
    const metric = this.metrics.get(label);
    if (!metric) return null;

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const result = {
      duration: Number(endTime - metric.startTime) / 1_000_000, // Convert to milliseconds
      memoryDelta: {
        heapUsed: endMemory.heapUsed - metric.startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - metric.startMemory.heapTotal
      },
      withinThreshold: true
    };

    // Check against thresholds
    if (label.includes('single') && result.duration > this.thresholds.singleAnalysis) {
      result.withinThreshold = false;
    } else if (label.includes('batch') && result.duration > this.thresholds.batchAnalysis) {
      result.withinThreshold = false;
    } else if (label.includes('ai') && result.duration > this.thresholds.aiResponse) {
      result.withinThreshold = false;
    } else if (label.includes('ml') && result.duration > this.thresholds.mlPrediction) {
      result.withinThreshold = false;
    }

    if (result.memoryDelta.heapUsed > this.thresholds.memoryGrowth) {
      result.withinThreshold = false;
    }

    this.metrics.delete(label);
    return result;
  }

  takeMemorySnapshot(label = '') {
    const snapshot = {
      label,
      timestamp: Date.now(),
      memory: process.memoryUsage()
    };
    this.memorySnapshots.push(snapshot);
    return snapshot;
  }

  getMemoryTrend() {
    if (this.memorySnapshots.length < 2) return null;

    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];
    
    const timeDiff = last.timestamp - first.timestamp;
    const memoryDiff = last.memory.heapUsed - first.memory.heapUsed;
    
    return {
      totalGrowth: memoryDiff,
      timespan: timeDiff,
      growthRate: timeDiff > 0 ? memoryDiff / timeDiff : 0,
      isHealthy: memoryDiff < this.thresholds.memoryGrowth
    };
  }

  generateReport() {
    const memoryTrend = this.getMemoryTrend();
    
    return {
      memoryTrend,
      snapshots: this.memorySnapshots.length,
      thresholds: this.thresholds,
      timestamp: Date.now()
    };
  }
}

/**
 * Test Assertion Helpers
 */
export const testHelpers = {
  assertValidAnalysisResult(result) {
    expect(result).toBeDefined();
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('timestamp');
    expect(result.metadata).toHaveProperty('version');
    expect(result.metadata).toHaveProperty('industryType');
    
    if (result.detectors) {
      Object.values(result.detectors).forEach(detector => {
        expect(detector).toHaveProperty('result');
        expect(detector.result).toHaveProperty('elementsFound');
        expect(detector.result).toHaveProperty('scores');
      });
    }
    
    if (result.ai) {
      expect(result.ai).toHaveProperty('enhancements');
      expect(result.ai.enhancements).toHaveProperty('visual');
      expect(result.ai.enhancements).toHaveProperty('patterns');
    }
    
    if (result.predictive) {
      expect(result.predictive).toHaveProperty('predictions');
      expect(result.predictive).toHaveProperty('recommendations');
    }
  },

  assertPerformanceMetrics(metrics, thresholds = {}) {
    const defaultThresholds = {
      maxDuration: 5000,
      maxMemoryIncrease: 50 * 1024 * 1024
    };
    
    const finalThresholds = { ...defaultThresholds, ...thresholds };
    
    expect(metrics.duration).toBeLessThan(finalThresholds.maxDuration);
    expect(metrics.memoryDelta.heapUsed).toBeLessThan(finalThresholds.maxMemoryIncrease);
  },

  assertAIResponseQuality(response) {
    expect(response).toBeDefined();
    expect(response).toHaveProperty('confidence');
    expect(response.confidence).toBeGreaterThan(0);
    expect(response.confidence).toBeLessThanOrEqual(1);
    
    if (response.analysis) {
      expect(response.analysis).toHaveProperty('visual_hierarchy');
      expect(response.analysis).toHaveProperty('user_journey');
    }
    
    if (response.patterns) {
      expect(Array.isArray(response.patterns.successful)).toBe(true);
      expect(Array.isArray(response.patterns.problematic)).toBe(true);
    }
  },

  assertMLPredictionQuality(prediction) {
    expect(prediction).toBeDefined();
    expect(prediction).toHaveProperty('value');
    expect(prediction).toHaveProperty('confidence');
    
    expect(prediction.value).toBeGreaterThan(0);
    expect(prediction.value).toBeLessThanOrEqual(1);
    expect(prediction.confidence).toBeGreaterThan(0);
    expect(prediction.confidence).toBeLessThanOrEqual(1);
    
    if (prediction.explanation) {
      expect(prediction.explanation).toHaveProperty('topFeatures');
      expect(Array.isArray(prediction.explanation.topFeatures)).toBe(true);
    }
  }
};

/**
 * Global test setup and teardown
 */
export const setupGlobalMocks = () => {
  // Mock AI providers
  global.mockAIProvider = new AIMockProvider();
  
  // Mock performance tracking
  global.performanceTracker = new TestPerformanceTracker();
  
  // Mock console methods to reduce noise in tests
  global.originalConsole = { ...console };
  console.warn = jest.fn();
  console.error = jest.fn();
  
  // Mock setTimeout for faster tests
  jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
    if (delay > 1000) {
      return originalSetTimeout(fn, Math.min(delay, 100));
    }
    return originalSetTimeout(fn, delay);
  });
};

export const teardownGlobalMocks = () => {
  // Restore console
  console.warn = global.originalConsole.warn;
  console.error = global.originalConsole.error;
  
  // Restore setTimeout
  jest.restoreAllMocks();
  
  // Clear mock history
  global.mockAIProvider?.clearHistory();
  global.performanceTracker = null;
};

// Export test configuration
export default testConfig;
