/**
 * ============================================================================
 * PERFORMANCE BENCHMARKS & LOAD TESTING SUITE
 * ============================================================================
 * 
 * Comprehensive performance testing for AI-enhanced UX analysis system
 * including load testing, stress testing, and optimization validation.
 * 
 * @version 3.0.0 - Performance Testing
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Week 2 Performance Testing
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { performance } from 'perf_hooks';
import { UXConversionAnalyzer } from '../src/analyzers/ux-conversion/core/ux-analyzer.js';
import { AIEnhancedUXEngine } from '../src/analyzers/ux-conversion/ai/ai-enhanced-engine.js';
import { PredictiveAnalyticsEngine } from '../src/analyzers/ux-conversion/ai/predictive-analytics.js';

/**
 * Performance testing utilities
 */
class PerformanceProfiler {
  constructor() {
    this.measurements = new Map();
    this.memorySnapshots = [];
  }

  startMeasurement(label) {
    this.measurements.set(label, {
      startTime: performance.now(),
      startMemory: process.memoryUsage()
    });
  }

  endMeasurement(label) {
    const measurement = this.measurements.get(label);
    if (!measurement) return null;

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    const result = {
      duration: endTime - measurement.startTime,
      memoryDelta: {
        heapUsed: endMemory.heapUsed - measurement.startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - measurement.startMemory.heapTotal,
        external: endMemory.external - measurement.startMemory.external
      }
    };

    this.measurements.delete(label);
    return result;
  }

  takeMemorySnapshot() {
    const snapshot = {
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
    
    return {
      totalIncrease: last.memory.heapUsed - first.memory.heapUsed,
      timespan: last.timestamp - first.timestamp,
      rate: (last.memory.heapUsed - first.memory.heapUsed) / (last.timestamp - first.timestamp)
    };
  }
}

/**
 * Mock data generators for performance testing
 */
const generateMockPage = (complexity = 'medium') => {
  const complexityLevels = {
    simple: { elements: 10, scriptTime: 50 },
    medium: { elements: 50, scriptTime: 200 },
    complex: { elements: 200, scriptTime: 800 },
    heavy: { elements: 500, scriptTime: 2000 }
  };

  const level = complexityLevels[complexity] || complexityLevels.medium;

  return {
    url: () => `https://example-${complexity}.com`,
    title: () => `Test Page - ${complexity}`,
    viewportSize: () => ({ width: 1920, height: 1080 }),
    screenshot: jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(Buffer.alloc(100000, 'mock-image-data')), level.scriptTime)
      )
    ),
    $$: jest.fn().mockResolvedValue(Array(level.elements).fill({})),
    evaluate: jest.fn().mockImplementation(() =>
      new Promise(resolve => 
        setTimeout(() => resolve({ elements: level.elements }), level.scriptTime / 2)
      )
    ),
    content: jest.fn().mockResolvedValue(`Mock content with ${level.elements} elements`)
  };
};

const generateMockDomainData = (industry = 'ecommerce') => ({
  industry,
  pageType: 'landing',
  complexity: 'medium',
  deviceType: 'desktop',
  trafficSource: 'organic',
  expectedLoad: 'normal'
});

/**
 * Core Performance Tests
 */
describe('Core System Performance', () => {
  let profiler;
  let analyzer;

  beforeEach(() => {
    profiler = new PerformanceProfiler();
    analyzer = new UXConversionAnalyzer({
      industry: 'ecommerce',
      enableAIEnhancement: true,
      enablePredictiveAnalysis: true,
      performanceMode: 'balanced'
    });
  });

  afterEach(() => {
    profiler = null;
  });

  test('should complete single analysis within performance targets', async () => {
    const mockPage = generateMockPage('medium');
    const mockDomain = generateMockDomainData();

    profiler.startMeasurement('single_analysis');
    const result = await analyzer.analyze(mockPage, mockDomain);
    const metrics = profiler.endMeasurement('single_analysis');

    // Performance targets
    expect(metrics.duration).toBeLessThan(5000); // 5 seconds max
    expect(metrics.memoryDelta.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB max increase
    
    expect(result).toBeDefined();
    expect(result.metadata).toHaveProperty('analysisTime');
    expect(result.metadata.analysisTime).toBeLessThan(5000);
  });

  test('should handle concurrent analyses efficiently', async () => {
    const concurrentCount = 5;
    const mockPages = Array(concurrentCount).fill().map(() => generateMockPage('medium'));
    const mockDomain = generateMockDomainData();

    profiler.startMeasurement('concurrent_analyses');
    
    const promises = mockPages.map(page => analyzer.analyze(page, mockDomain));
    const results = await Promise.all(promises);
    
    const metrics = profiler.endMeasurement('concurrent_analyses');

    // Concurrent execution should be more efficient than sequential
    expect(metrics.duration).toBeLessThan(8000); // Should complete in under 8 seconds
    expect(results).toHaveLength(concurrentCount);
    
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    // Memory usage should scale reasonably
    expect(metrics.memoryDelta.heapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB max for 5 analyses
  });

  test('should scale with page complexity', async () => {
    const complexities = ['simple', 'medium', 'complex'];
    const mockDomain = generateMockDomainData();
    const results = {};

    for (const complexity of complexities) {
      const mockPage = generateMockPage(complexity);
      
      profiler.startMeasurement(`analysis_${complexity}`);
      const result = await analyzer.analyze(mockPage, mockDomain);
      const metrics = profiler.endMeasurement(`analysis_${complexity}`);
      
      results[complexity] = {
        result,
        metrics,
        duration: metrics.duration,
        memory: metrics.memoryDelta.heapUsed
      };
    }

    // Simple should be fastest
    expect(results.simple.duration).toBeLessThan(results.medium.duration);
    
    // Complex should take longer but still be within limits
    expect(results.complex.duration).toBeLessThan(10000); // 10 seconds max for complex
    
    // Memory usage should scale reasonably
    expect(results.complex.memory).toBeLessThan(75 * 1024 * 1024); // 75MB max for complex
  });

  test('should maintain performance with repeated analyses', async () => {
    const iterations = 10;
    const mockPage = generateMockPage('medium');
    const mockDomain = generateMockDomainData();
    const durations = [];

    profiler.takeMemorySnapshot(); // Initial memory

    for (let i = 0; i < iterations; i++) {
      profiler.startMeasurement(`iteration_${i}`);
      await analyzer.analyze(mockPage, mockDomain);
      const metrics = profiler.endMeasurement(`iteration_${i}`);
      
      durations.push(metrics.duration);
      profiler.takeMemorySnapshot();
    }

    // Performance should not degrade significantly over iterations
    const firstThree = durations.slice(0, 3);
    const lastThree = durations.slice(-3);
    
    const avgFirst = firstThree.reduce((a, b) => a + b) / firstThree.length;
    const avgLast = lastThree.reduce((a, b) => a + b) / lastThree.length;
    
    // Last iterations should not be more than 50% slower than first
    expect(avgLast).toBeLessThan(avgFirst * 1.5);

    // Memory should not continuously increase (indicating memory leaks)
    const memoryTrend = profiler.getMemoryTrend();
    expect(memoryTrend.rate).toBeLessThan(1024 * 1024); // Less than 1MB/ms growth rate
  });
});

/**
 * AI Engine Performance Tests
 */
describe('AI Engine Performance', () => {
  let profiler;
  let aiEngine;

  beforeEach(() => {
    profiler = new PerformanceProfiler();
    aiEngine = new AIEnhancedUXEngine({
      aiProvider: 'hybrid',
      enablePredictiveAnalysis: true,
      enablePatternLearning: true,
      performanceMode: 'optimized'
    });
  });

  test('should process AI analysis within time limits', async () => {
    const mockPage = {
      screenshot: jest.fn().mockResolvedValue(Buffer.alloc(50000, 'mock-image'))
    };
    
    const mockBaseResults = {
      detectors: {
        cta: { result: { elementsFound: 3, scores: { overall: 85 } } },
        form: { result: { elementsFound: 2, scores: { overall: 75 } } }
      }
    };

    profiler.startMeasurement('ai_analysis');
    const result = await aiEngine.analyzeWithAI(mockPage, mockBaseResults, generateMockDomainData());
    const metrics = profiler.endMeasurement('ai_analysis');

    expect(metrics.duration).toBeLessThan(3000); // 3 seconds max for AI analysis
    expect(result).toHaveProperty('enhancements');
    expect(result.enhancements).toHaveProperty('visual');
    expect(result.enhancements).toHaveProperty('patterns');
  });

  test('should handle batch AI processing efficiently', async () => {
    const batchSize = 5;
    const mockPages = Array(batchSize).fill().map(() => ({
      screenshot: jest.fn().mockResolvedValue(Buffer.alloc(30000, 'mock-image'))
    }));

    const mockBaseResults = {
      detectors: {
        cta: { result: { elementsFound: 3, scores: { overall: 85 } } }
      }
    };

    profiler.startMeasurement('batch_ai_analysis');
    
    const promises = mockPages.map(page => 
      aiEngine.analyzeWithAI(page, mockBaseResults, generateMockDomainData())
    );
    
    const results = await Promise.all(promises);
    const metrics = profiler.endMeasurement('batch_ai_analysis');

    // Batch processing should be efficient
    expect(metrics.duration).toBeLessThan(8000); // 8 seconds for batch of 5
    expect(results).toHaveLength(batchSize);
    
    results.forEach(result => {
      expect(result).toHaveProperty('enhancements');
    });
  });

  test('should cache AI results for performance', async () => {
    const mockPage = {
      screenshot: jest.fn().mockResolvedValue(Buffer.alloc(30000, 'mock-image'))
    };
    
    const mockBaseResults = {
      detectors: {
        cta: { result: { elementsFound: 3, scores: { overall: 85 } } }
      }
    };

    // First analysis
    profiler.startMeasurement('first_ai_call');
    const result1 = await aiEngine.analyzeWithAI(mockPage, mockBaseResults, generateMockDomainData());
    const metrics1 = profiler.endMeasurement('first_ai_call');

    // Second analysis with same context (should use cache)
    profiler.startMeasurement('cached_ai_call');
    const result2 = await aiEngine.analyzeWithAI(mockPage, mockBaseResults, generateMockDomainData());
    const metrics2 = profiler.endMeasurement('cached_ai_call');

    // Cached call should be significantly faster
    expect(metrics2.duration).toBeLessThan(metrics1.duration * 0.5);
    
    // Results should be consistent
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });
});

/**
 * Machine Learning Performance Tests
 */
describe('ML Engine Performance', () => {
  let profiler;
  let predictiveEngine;

  beforeEach(() => {
    profiler = new PerformanceProfiler();
    predictiveEngine = new PredictiveAnalyticsEngine({
      industryType: 'ecommerce',
      enableMLPredictions: true,
      performanceMode: 'optimized'
    });
  });

  test('should complete predictions within time limits', async () => {
    const mockFeatures = {
      numerical: {
        ctaCount: 3,
        formFields: 4,
        loadTime: 2.0,
        visualHierarchy: 80
      },
      categorical: {
        industry: 'ecommerce',
        device_type: 'desktop'
      }
    };

    const normalizedFeatures = await predictiveEngine.normalizeFeatures(mockFeatures);

    profiler.startMeasurement('ml_prediction');
    const prediction = await predictiveEngine.predict('CONVERSION_PREDICTOR', normalizedFeatures);
    const metrics = profiler.endMeasurement('ml_prediction');

    expect(metrics.duration).toBeLessThan(500); // 500ms max for single prediction
    expect(prediction).toHaveProperty('value');
    expect(prediction).toHaveProperty('confidence');
  });

  test('should handle batch predictions efficiently', async () => {
    const batchSize = 20;
    const batchFeatures = Array(batchSize).fill().map((_, i) => ({
      numerical: {
        ctaCount: i % 5 + 1,
        formFields: i % 8 + 2,
        loadTime: (i % 4 + 1) * 0.5,
        visualHierarchy: 60 + (i % 40)
      },
      categorical: {
        industry: 'ecommerce',
        device_type: i % 2 === 0 ? 'desktop' : 'mobile'
      }
    }));

    const normalizedBatch = await Promise.all(
      batchFeatures.map(f => predictiveEngine.normalizeFeatures(f))
    );

    profiler.startMeasurement('batch_ml_prediction');
    const predictions = await predictiveEngine.batchPredict('CONVERSION_PREDICTOR', normalizedBatch);
    const metrics = profiler.endMeasurement('batch_ml_prediction');

    expect(metrics.duration).toBeLessThan(2000); // 2 seconds for batch of 20
    expect(predictions).toHaveLength(batchSize);
    
    predictions.forEach(prediction => {
      expect(prediction).toHaveProperty('value');
      expect(prediction).toHaveProperty('confidence');
    });
  });

  test('should optimize model training performance', async () => {
    const trainingData = {
      features: Array(50).fill().map((_, i) => ({
        ctaCount: Math.floor(Math.random() * 5) + 1,
        formFields: Math.floor(Math.random() * 10) + 1,
        loadTime: Math.random() * 4 + 1,
        score: Math.floor(Math.random() * 40) + 60
      })),
      outcomes: Array(50).fill().map(() => Math.random()),
      labels: Array(50).fill().map(() => Math.random() > 0.5 ? 'good' : 'poor')
    };

    profiler.startMeasurement('model_training');
    const validationResults = await predictiveEngine.performCrossValidation(
      'CONVERSION_PREDICTOR',
      trainingData,
      { folds: 3 }
    );
    const metrics = profiler.endMeasurement('model_training');

    expect(metrics.duration).toBeLessThan(5000); // 5 seconds max for training
    expect(validationResults).toHaveProperty('accuracy');
    expect(validationResults).toHaveProperty('foldResults');
    expect(validationResults.foldResults).toHaveLength(3);
  });
});

/**
 * Load Testing
 */
describe('Load Testing', () => {
  let profiler;

  beforeEach(() => {
    profiler = new PerformanceProfiler();
  });

  test('should handle sustained load', async () => {
    const loadDuration = 10000; // 10 seconds
    const requestInterval = 500; // Every 500ms
    const expectedRequests = Math.floor(loadDuration / requestInterval);
    
    const analyzer = new UXConversionAnalyzer({
      industry: 'ecommerce',
      enableAIEnhancement: true,
      performanceMode: 'optimized'
    });

    const results = [];
    const errors = [];
    
    profiler.startMeasurement('sustained_load');
    profiler.takeMemorySnapshot();

    const loadTest = async () => {
      const startTime = Date.now();
      
      while (Date.now() - startTime < loadDuration) {
        try {
          const mockPage = generateMockPage('simple');
          const mockDomain = generateMockDomainData();
          
          const result = await analyzer.analyze(mockPage, mockDomain);
          results.push(result);
          
          profiler.takeMemorySnapshot();
          
          await new Promise(resolve => setTimeout(resolve, requestInterval));
        } catch (error) {
          errors.push(error);
        }
      }
    };

    await loadTest();
    
    const metrics = profiler.endMeasurement('sustained_load');
    const memoryTrend = profiler.getMemoryTrend();

    // Should handle expected number of requests with minimal errors
    expect(results.length).toBeGreaterThan(expectedRequests * 0.8); // At least 80% success rate
    expect(errors.length).toBeLessThan(expectedRequests * 0.1); // Less than 10% error rate
    
    // Memory should not continuously grow (memory leak detection)
    expect(memoryTrend.rate).toBeLessThan(2 * 1024 * 1024); // Less than 2MB/ms growth rate
    
    // All successful results should be valid
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  }, 15000); // Extended timeout for load test

  test('should recover from high load spikes', async () => {
    const analyzer = new UXConversionAnalyzer({
      industry: 'ecommerce',
      enableAIEnhancement: true,
      performanceMode: 'balanced'
    });

    // Simulate load spike
    const spikeSize = 10;
    const mockPages = Array(spikeSize).fill().map(() => generateMockPage('complex'));
    const mockDomain = generateMockDomainData();

    profiler.startMeasurement('load_spike');
    profiler.takeMemorySnapshot();

    const promises = mockPages.map(page => 
      analyzer.analyze(page, mockDomain).catch(error => ({ error }))
    );
    
    const results = await Promise.all(promises);
    
    const metrics = profiler.endMeasurement('load_spike');
    profiler.takeMemorySnapshot();

    // Should handle most requests even under load
    const successes = results.filter(r => !r.error);
    const failures = results.filter(r => r.error);
    
    expect(successes.length).toBeGreaterThan(spikeSize * 0.7); // At least 70% success
    expect(failures.length).toBeLessThan(spikeSize * 0.3); // Less than 30% failure
    
    // Should complete within reasonable time even under stress
    expect(metrics.duration).toBeLessThan(15000); // 15 seconds max for spike
    
    // Test recovery - single request after spike should be fast
    profiler.startMeasurement('post_spike_recovery');
    const recoveryResult = await analyzer.analyze(generateMockPage('simple'), mockDomain);
    const recoveryMetrics = profiler.endMeasurement('post_spike_recovery');
    
    expect(recoveryResult).toBeDefined();
    expect(recoveryMetrics.duration).toBeLessThan(3000); // Should recover quickly
  }, 20000); // Extended timeout for spike test
});

/**
 * Memory Optimization Tests
 */
describe('Memory Optimization', () => {
  let profiler;

  beforeEach(() => {
    profiler = new PerformanceProfiler();
  });

  test('should manage memory efficiently during analysis', async () => {
    const analyzer = new UXConversionAnalyzer({
      industry: 'ecommerce',
      enableAIEnhancement: true,
      memoryOptimization: true
    });

    profiler.takeMemorySnapshot();
    
    // Perform multiple analyses
    for (let i = 0; i < 15; i++) {
      const mockPage = generateMockPage('medium');
      const mockDomain = generateMockDomainData();
      
      await analyzer.analyze(mockPage, mockDomain);
      profiler.takeMemorySnapshot();
      
      // Force garbage collection periodically
      if (i % 5 === 0 && global.gc) {
        global.gc();
      }
    }

    const memoryTrend = profiler.getMemoryTrend();
    
    // Memory growth should be controlled
    expect(memoryTrend.totalIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB total
    expect(memoryTrend.rate).toBeLessThan(1024 * 1024); // Less than 1MB/ms growth rate
  });

  test('should cleanup resources properly', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create and use analyzer
    {
      const analyzer = new UXConversionAnalyzer({
        industry: 'ecommerce',
        enableAIEnhancement: true
      });

      const mockPage = generateMockPage('medium');
      const mockDomain = generateMockDomainData();
      
      await analyzer.analyze(mockPage, mockDomain);
      
      // Explicitly cleanup if method exists
      if (typeof analyzer.cleanup === 'function') {
        await analyzer.cleanup();
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Allow some time for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal after cleanup
    expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Less than 20MB residual
  });
});

export {
  PerformanceProfiler,
  generateMockPage,
  generateMockDomainData
};
