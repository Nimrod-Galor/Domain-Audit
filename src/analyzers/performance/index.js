/**
 * Performance Analyzers Module
 * 
 * Exports all performance-related analyzers
 */

export { ResourceAnalyzer } from './ResourceAnalyzer.js';

// Combined Approach Performance Analyzer (Phase 3 Implementation)
export { default as PerformanceAnalyzer } from './performance-analyzer-modern.js';

// Export components for advanced usage
export { default as ResourceDetector } from './detectors/resource-detector.js';
export { default as MetricsDetector } from './detectors/metrics-detector.js';
export { default as PerformanceOptimizationAnalyzer } from './heuristics/performance-optimization-analyzer.js';
export { default as PerformanceScoringEngine } from './rules/performance-scoring-engine.js';
export { default as PerformanceAIEnhancer } from './ai/performance-ai-enhancer.js';
export { default as PerformanceConfiguration } from './config/performance-configuration.js';
