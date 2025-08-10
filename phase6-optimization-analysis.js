/**
 * Phase 6: Performance Optimization Analysis
 * Testing optimized modern patterns vs legacy baseline
 */

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Import analyzers to test
import { OpenGraphAnalyzer } from './src/analyzers/social-media/platforms/open-graph-analyzer.js';
import { SEOAnalyzer } from './src/analyzers/seo-analyzer.js';
import WebVitalsAnalyzer from './src/performance/web-vitals-analyzer.js';

class Phase6PerformanceAnalyzer {
  constructor() {
    this.testIterations = 50;
    this.results = {
      memory: {},
      execution: {},
      optimizations: {}
    };
  }

  /**
   * Create test DOM document
   */
  createTestDocument() {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page for Performance Analysis</title>
          <meta property="og:title" content="Test OpenGraph Title">
          <meta property="og:description" content="Test OpenGraph Description">
          <meta property="og:image" content="https://example.com/test.jpg">
          <meta name="description" content="Test meta description">
          <meta name="keywords" content="test, performance, optimization">
          <link rel="canonical" href="https://example.com/test">
        </head>
        <body>
          <h1>Test Page</h1>
          <p>Content for performance testing</p>
          <script src="https://cdn.example.com/test.js"></script>
        </body>
      </html>
    `);
    return dom.window.document;
  }

  /**
   * Measure memory usage for analyzer execution
   */
  async measureMemoryUsage(analyzer, context, label) {
    const measurements = [];
    
    for (let i = 0; i < this.testIterations; i++) {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const memBefore = process.memoryUsage();
      const startTime = process.hrtime.bigint();
      
      try {
        await analyzer.analyze(context);
      } catch (error) {
        console.warn(`${label} iteration ${i} failed:`, error.message);
      }
      
      const endTime = process.hrtime.bigint();
      const memAfter = process.memoryUsage();
      
      measurements.push({
        executionTime: Number(endTime - startTime) / 1000000, // Convert to milliseconds
        memoryDelta: memAfter.heapUsed - memBefore.heapUsed,
        heapUsed: memAfter.heapUsed
      });
    }
    
    return this.calculateStats(measurements, label);
  }

  /**
   * Calculate statistics from measurements
   */
  calculateStats(measurements, label) {
    const executionTimes = measurements.map(m => m.executionTime);
    const memoryDeltas = measurements.map(m => m.memoryDelta);
    
    return {
      label,
      execution: {
        avg: this.average(executionTimes),
        min: Math.min(...executionTimes),
        max: Math.max(...executionTimes),
        median: this.median(executionTimes)
      },
      memory: {
        avg: this.average(memoryDeltas),
        min: Math.min(...memoryDeltas),
        max: Math.max(...memoryDeltas),
        avgPerIteration: this.average(memoryDeltas) / 1024 // KB
      },
      iterations: measurements.length
    };
  }

  /**
   * Test optimized property access patterns
   */
  async testOptimizedPatterns() {
    console.log('🔬 Testing optimized property access patterns...');
    
    const document = this.createTestDocument();
    const context = {
      document,
      url: 'https://example.com/test',
      pageData: { responseTime: 500, contentLength: 50000 }
    };

    // Test different property access patterns
    const patterns = {
      destructuring: () => {
        const { document, url, pageData } = context;
        return { document, url, pageData };
      },
      directAccess: () => {
        const document = context.document;
        const url = context.url;
        const pageData = context.pageData;
        return { document, url, pageData };
      },
      cachedAccess: (() => {
        let cached = null;
        return () => {
          if (!cached) {
            cached = {
              document: context.document,
              url: context.url,
              pageData: context.pageData
            };
          }
          return cached;
        };
      })()
    };

    const patternResults = {};
    
    for (const [patternName, patternFn] of Object.entries(patterns)) {
      const measurements = [];
      
      for (let i = 0; i < this.testIterations * 10; i++) {
        const startTime = process.hrtime.bigint();
        patternFn();
        const endTime = process.hrtime.bigint();
        
        measurements.push(Number(endTime - startTime) / 1000); // Convert to microseconds
      }
      
      patternResults[patternName] = {
        avg: this.average(measurements),
        min: Math.min(...measurements),
        max: Math.max(...measurements)
      };
    }

    return patternResults;
  }

  /**
   * Test validation optimization
   */
  async testValidationOptimization() {
    console.log('🔬 Testing validation optimization patterns...');
    
    const context = {
      document: this.createTestDocument(),
      url: 'https://example.com/test',
      pageData: {}
    };

    // Create validation cache
    const validationCache = new WeakMap();
    
    const validationPatterns = {
      standard: (ctx) => {
        return ctx && typeof ctx === 'object' && ctx.document && ctx.document.querySelector;
      },
      cached: (ctx) => {
        if (validationCache.has(ctx)) {
          return validationCache.get(ctx);
        }
        const isValid = ctx && typeof ctx === 'object' && ctx.document && ctx.document.querySelector;
        validationCache.set(ctx, isValid);
        return isValid;
      },
      earlyExit: (ctx) => {
        if (!ctx) return false;
        if (typeof ctx !== 'object') return false;
        if (!ctx.document) return false;
        if (!ctx.document.querySelector) return false;
        return true;
      }
    };

    const validationResults = {};
    
    for (const [patternName, validationFn] of Object.entries(validationPatterns)) {
      const measurements = [];
      
      for (let i = 0; i < this.testIterations * 100; i++) {
        const startTime = process.hrtime.bigint();
        validationFn(context);
        const endTime = process.hrtime.bigint();
        
        measurements.push(Number(endTime - startTime) / 1000); // Convert to microseconds
      }
      
      validationResults[patternName] = {
        avg: this.average(measurements),
        min: Math.min(...measurements),
        max: Math.max(...measurements)
      };
    }

    return validationResults;
  }

  /**
   * Run comprehensive performance analysis
   */
  async runAnalysis() {
    console.log('🚀 Starting Phase 6 Performance Optimization Analysis...');
    console.log(`📊 Running ${this.testIterations} iterations per test...\\n`);

    const document = this.createTestDocument();
    const context = {
      document,
      url: 'https://example.com/test',
      pageData: { responseTime: 500, contentLength: 50000 }
    };

    // Test optimized analyzers
    console.log('🧪 Testing optimized analyzers...');
    
    try {
      const openGraphAnalyzer = new OpenGraphAnalyzer();
      this.results.memory.openGraph = await this.measureMemoryUsage(
        openGraphAnalyzer, 
        context, 
        'OpenGraph (Optimized)'
      );
    } catch (error) {
      console.warn('OpenGraph analyzer test failed:', error.message);
    }

    try {
      const seoAnalyzer = new SEOAnalyzer();
      this.results.memory.seo = await this.measureMemoryUsage(
        seoAnalyzer, 
        context, 
        'SEO (Optimized)'
      );
    } catch (error) {
      console.warn('SEO analyzer test failed:', error.message);
    }

    try {
      const webVitalsAnalyzer = new WebVitalsAnalyzer();
      this.results.memory.webVitals = await this.measureMemoryUsage(
        webVitalsAnalyzer, 
        context, 
        'WebVitals (Optimized)'
      );
    } catch (error) {
      console.warn('WebVitals analyzer test failed:', error.message);
    }

    // Test property access patterns
    this.results.optimizations.propertyAccess = await this.testOptimizedPatterns();
    
    // Test validation patterns
    this.results.optimizations.validation = await this.testValidationOptimization();

    // Generate report
    this.generateReport();
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 6: Legacy Removal + Modern Pattern Optimization',
      summary: this.generateSummary(),
      detailedResults: this.results,
      comparison: this.generateComparison(),
      optimizationRecommendations: this.generateOptimizationRecommendations()
    };

    const reportContent = this.formatReport(report);
    
    // Save to file
    fs.writeFileSync('PHASE6_OPTIMIZATION_RESULTS.md', reportContent);
    console.log('\\n📄 Report saved to PHASE6_OPTIMIZATION_RESULTS.md');
    
    // Print summary to console
    console.log('\\n' + this.formatSummary(report.summary));
  }

  /**
   * Generate performance summary
   */
  generateSummary() {
    const summary = {
      analyzersOptimized: Object.keys(this.results.memory).length,
      propertyAccessOptimization: {},
      validationOptimization: {},
      overallImpact: {}
    };

    // Property access comparison
    if (this.results.optimizations.propertyAccess) {
      const patterns = this.results.optimizations.propertyAccess;
      summary.propertyAccessOptimization = {
        directVsDestructuring: (patterns.destructuring.avg / patterns.directAccess.avg).toFixed(2),
        cachedVsDestructuring: (patterns.destructuring.avg / patterns.cachedAccess.avg).toFixed(2),
        fastestPattern: Object.entries(patterns)
          .reduce((a, b) => a[1].avg < b[1].avg ? a : b)[0]
      };
    }

    // Validation comparison
    if (this.results.optimizations.validation) {
      const validation = this.results.optimizations.validation;
      summary.validationOptimization = {
        cachedVsStandard: (validation.standard.avg / validation.cached.avg).toFixed(2),
        earlyExitVsStandard: (validation.standard.avg / validation.earlyExit.avg).toFixed(2),
        fastestValidation: Object.entries(validation)
          .reduce((a, b) => a[1].avg < b[1].avg ? a : b)[0]
      };
    }

    return summary;
  }

  /**
   * Generate comparison with legacy baseline
   */
  generateComparison() {
    // Legacy baseline from Phase 5C
    const legacyBaseline = {
      executionTime: 4.18, // ms
      memoryUsage: 844.26  // KB
    };

    const comparison = {
      legacyBaseline,
      optimizedResults: {},
      performanceGains: {}
    };

    // Compare each analyzer
    Object.entries(this.results.memory).forEach(([analyzer, results]) => {
      if (results && results.execution && results.memory) {
        comparison.optimizedResults[analyzer] = {
          executionTime: results.execution.avg,
          memoryUsage: results.memory.avgPerIteration
        };
        
        comparison.performanceGains[analyzer] = {
          executionTime: ((legacyBaseline.executionTime - results.execution.avg) / legacyBaseline.executionTime * 100).toFixed(1),
          memoryUsage: ((legacyBaseline.memoryUsage - results.memory.avgPerIteration) / legacyBaseline.memoryUsage * 100).toFixed(1)
        };
      }
    });

    return comparison;
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations() {
    return {
      propertyAccess: 'Use direct property access instead of destructuring for performance-critical paths',
      validation: 'Implement validation caching for repeated context validation',
      memoryManagement: 'Consider object pooling for frequently created context objects',
      earlyExit: 'Use early exit patterns in validation for faster error handling',
      caching: 'Cache expensive operations and reuse results when possible'
    };
  }

  /**
   * Format full report as markdown
   */
  formatReport(report) {
    return `# ${report.phase} - Performance Analysis Report

**Generated:** ${report.timestamp}

## 🎯 Executive Summary

${this.formatSummary(report.summary)}

## 📊 Detailed Results

### Memory Usage Analysis

${Object.entries(report.detailedResults.memory).map(([analyzer, results]) => `
#### ${results.label}
- **Execution Time:** ${results.execution.avg.toFixed(2)}ms avg (${results.execution.min.toFixed(2)}-${results.execution.max.toFixed(2)}ms range)
- **Memory Usage:** ${results.memory.avgPerIteration.toFixed(2)} KB per iteration
- **Iterations:** ${results.iterations}
`).join('')}

### Property Access Optimization

${Object.entries(report.detailedResults.optimizations.propertyAccess || {}).map(([pattern, results]) => `
#### ${pattern}
- **Average:** ${results.avg.toFixed(3)} μs
- **Range:** ${results.min.toFixed(3)}-${results.max.toFixed(3)} μs
`).join('')}

### Validation Optimization

${Object.entries(report.detailedResults.optimizations.validation || {}).map(([pattern, results]) => `
#### ${pattern}
- **Average:** ${results.avg.toFixed(3)} μs
- **Range:** ${results.min.toFixed(3)}-${results.max.toFixed(3)} μs
`).join('')}

## 🔄 Comparison with Legacy Baseline

${Object.entries(report.comparison.performanceGains).map(([analyzer, gains]) => `
### ${analyzer}
- **Execution Time:** ${gains.executionTime}% change from legacy baseline
- **Memory Usage:** ${gains.memoryUsage}% change from legacy baseline
`).join('')}

## 🚀 Optimization Recommendations

${Object.entries(report.optimizationRecommendations).map(([category, recommendation]) => `
### ${category}
${recommendation}
`).join('')}

---

**Analysis complete. Modern pattern optimizations implemented and measured.**
`;
  }

  /**
   * Format summary for console output
   */
  formatSummary(summary) {
    return `
🎯 Performance Optimization Summary:

📈 Property Access Optimization:
   • Direct access is ${summary.propertyAccessOptimization.directVsDestructuring}x faster than destructuring
   • Cached access is ${summary.propertyAccessOptimization.cachedVsDestructuring}x faster than destructuring
   • Fastest pattern: ${summary.propertyAccessOptimization.fastestPattern}

⚡ Validation Optimization:
   • Cached validation is ${summary.validationOptimization.cachedVsStandard}x faster than standard
   • Early exit is ${summary.validationOptimization.earlyExitVsStandard}x faster than standard
   • Fastest validation: ${summary.validationOptimization.fastestValidation}

🔧 Analyzers Optimized: ${summary.analyzersOptimized}
`;
  }

  // Utility methods
  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  median(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[middle - 1] + sorted[middle]) / 2 
      : sorted[middle];
  }
}

// Run the analysis
async function runPhase6Analysis() {
  console.log('🚀 Phase 6: Legacy Removal + Modern Pattern Optimization');
  console.log('====================================================\\n');
  
  const analyzer = new Phase6PerformanceAnalyzer();
  await analyzer.runAnalysis();
}

// Export for use in other modules
export { Phase6PerformanceAnalyzer };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPhase6Analysis().catch(console.error);
}
