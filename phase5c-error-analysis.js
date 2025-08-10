// Phase 5C: Performance Optimization - Error Handling Performance Analysis
// Analyzes validation and error handling overhead in the modernized system

import { ThirdPartyAnalyzer } from './src/analyzers/third-party/ThirdPartyAnalyzer.js';
import { SocialMediaAnalyzer } from './src/analyzers/content/SocialMediaAnalyzer.js';
import { ContentQualityAnalyzer } from './src/analyzers/content-quality-analyzer.js';
import { JSDOM } from 'jsdom';

class ErrorHandlingProfiler {
  constructor() {
    this.measurements = [];
  }

  async profileValidationPerformance(iterations = 100) {
    console.log('🔍 Testing Validation Performance...\n');
    
    const results = {
      validContext: { totalTime: 0, count: 0 },
      invalidContext: { totalTime: 0, count: 0 },
      legacyFormat: { totalTime: 0, count: 0 },
      malformedInput: { totalTime: 0, count: 0 }
    };

    // Test 1: Valid modern context
    const validHtml = '<html><body><h1>Valid Test</h1></body></html>';
    for (let i = 0; i < iterations; i++) {
      const dom = new JSDOM(validHtml);
      const context = {
        document: dom.window.document,
        url: 'https://example.com/valid',
        pageData: { title: 'Valid Test' }
      };

      const startTime = performance.now();
      const analyzer = new ThirdPartyAnalyzer();
      const result = await analyzer.analyze(context);
      const endTime = performance.now();

      results.validContext.totalTime += (endTime - startTime);
      results.validContext.count++;
      
      dom.window.close();
    }

    // Test 2: Invalid context (missing required fields)
    for (let i = 0; i < iterations; i++) {
      const invalidContext = { /* missing document */ };

      const startTime = performance.now();
      const analyzer = new ThirdPartyAnalyzer();
      const result = await analyzer.analyze(invalidContext);
      const endTime = performance.now();

      results.invalidContext.totalTime += (endTime - startTime);
      results.invalidContext.count++;
    }

    // Test 3: Legacy format detection
    for (let i = 0; i < iterations; i++) {
      const dom = new JSDOM(validHtml);
      const document = dom.window.document;

      const startTime = performance.now();
      const analyzer = new ThirdPartyAnalyzer();
      // Legacy call: analyze(document, url)
      const result = await analyzer.analyze(document, 'https://example.com/legacy');
      const endTime = performance.now();

      results.legacyFormat.totalTime += (endTime - startTime);
      results.legacyFormat.count++;
      
      dom.window.close();
    }

    // Test 4: Malformed input handling
    for (let i = 0; i < iterations; i++) {
      const malformedInputs = [
        null,
        undefined,
        'string instead of object',
        123,
        { document: 'not a document' },
        { document: null, url: 'test' }
      ];

      for (const input of malformedInputs) {
        const startTime = performance.now();
        const analyzer = new ThirdPartyAnalyzer();
        try {
          const result = await analyzer.analyze(input);
        } catch (error) {
          // Expected behavior
        }
        const endTime = performance.now();

        results.malformedInput.totalTime += (endTime - startTime);
        results.malformedInput.count++;
      }
    }

    return results;
  }

  async profileErrorRecoveryPerformance(iterations = 50) {
    console.log('🔍 Testing Error Recovery Performance...\n');
    
    const errorResults = {
      networkErrors: { totalTime: 0, count: 0 },
      parseErrors: { totalTime: 0, count: 0 },
      validationErrors: { totalTime: 0, count: 0 },
      unexpectedErrors: { totalTime: 0, count: 0 }
    };

    // Test network-like errors (missing external resources)
    const networkErrorHtml = `
      <html>
        <head>
          <script src="https://nonexistent.example.com/script.js"></script>
        </head>
        <body><h1>Network Error Test</h1></body>
      </html>
    `;

    for (let i = 0; i < iterations; i++) {
      const dom = new JSDOM(networkErrorHtml);
      const context = {
        document: dom.window.document,
        url: 'https://example.com/network-error',
        pageData: { title: 'Network Error Test' }
      };

      const startTime = performance.now();
      const analyzer = new ThirdPartyAnalyzer();
      const result = await analyzer.analyze(context);
      const endTime = performance.now();

      errorResults.networkErrors.totalTime += (endTime - startTime);
      errorResults.networkErrors.count++;
      
      dom.window.close();
    }

    // Test parse errors (malformed HTML/scripts)
    const parseErrorHtml = `
      <html>
        <head>
          <script>
            // Malformed JavaScript that might cause issues
            var malformed = {
              property: 'value'
              // Missing comma
              another: 'value'
            };
          </script>
        </head>
        <body><h1>Parse Error Test</h1></body>
      </html>
    `;

    for (let i = 0; i < iterations; i++) {
      const dom = new JSDOM(parseErrorHtml);
      const context = {
        document: dom.window.document,
        url: 'https://example.com/parse-error',
        pageData: { title: 'Parse Error Test' }
      };

      const startTime = performance.now();
      const analyzer = new SocialMediaAnalyzer();
      const result = await analyzer.analyze(context);
      const endTime = performance.now();

      errorResults.parseErrors.totalTime += (endTime - startTime);
      errorResults.parseErrors.count++;
      
      dom.window.close();
    }

    return errorResults;
  }

  printValidationResults(results) {
    console.log('📊 VALIDATION PERFORMANCE RESULTS:\n');

    Object.entries(results).forEach(([testType, data]) => {
      const avgTime = data.totalTime / data.count;
      console.log(`🔍 ${testType.replace(/([A-Z])/g, ' $1').toLowerCase()}:`);
      console.log(`   Average time: ${avgTime.toFixed(3)}ms`);
      console.log(`   Total iterations: ${data.count}`);
      console.log(`   Total time: ${data.totalTime.toFixed(2)}ms`);
      console.log('');
    });

    // Compare validation overhead
    const validAvg = results.validContext.totalTime / results.validContext.count;
    const invalidAvg = results.invalidContext.totalTime / results.invalidContext.count;
    const legacyAvg = results.legacyFormat.totalTime / results.legacyFormat.count;
    const malformedAvg = results.malformedInput.totalTime / results.malformedInput.count;

    console.log('🔄 VALIDATION OVERHEAD ANALYSIS:\n');
    
    const invalidOverhead = ((invalidAvg - validAvg) / validAvg) * 100;
    const legacyOverhead = ((legacyAvg - validAvg) / validAvg) * 100;
    const malformedOverhead = ((malformedAvg - validAvg) / validAvg) * 100;

    console.log(`   Invalid context overhead: ${invalidOverhead > 0 ? '+' : ''}${invalidOverhead.toFixed(2)}%`);
    console.log(`   Legacy format overhead: ${legacyOverhead > 0 ? '+' : ''}${legacyOverhead.toFixed(2)}%`);
    console.log(`   Malformed input overhead: ${malformedOverhead > 0 ? '+' : ''}${malformedOverhead.toFixed(2)}%`);

    // Performance classification
    console.log('\n🎯 VALIDATION PERFORMANCE CLASSIFICATION:\n');
    
    if (Math.abs(legacyOverhead) < 5) {
      console.log('✅ Legacy format detection: EFFICIENT (< 5% overhead)');
    } else if (Math.abs(legacyOverhead) < 15) {
      console.log('⚠️  Legacy format detection: MODERATE (5-15% overhead)');
    } else {
      console.log('❌ Legacy format detection: INEFFICIENT (> 15% overhead)');
    }

    if (Math.abs(invalidOverhead) < 10) {
      console.log('✅ Invalid input handling: EFFICIENT (< 10% overhead)');
    } else if (Math.abs(invalidOverhead) < 25) {
      console.log('⚠️  Invalid input handling: MODERATE (10-25% overhead)');
    } else {
      console.log('❌ Invalid input handling: INEFFICIENT (> 25% overhead)');
    }
  }

  printErrorResults(results) {
    console.log('\n🚨 ERROR HANDLING PERFORMANCE RESULTS:\n');

    Object.entries(results).forEach(([errorType, data]) => {
      const avgTime = data.totalTime / data.count;
      console.log(`🔍 ${errorType.replace(/([A-Z])/g, ' $1').toLowerCase()}:`);
      console.log(`   Average time: ${avgTime.toFixed(3)}ms`);
      console.log(`   Total iterations: ${data.count}`);
      console.log(`   Total time: ${data.totalTime.toFixed(2)}ms`);
      console.log('');
    });
  }

  generateOptimizationRecommendations(validationResults, errorResults) {
    console.log('\n🎯 PHASE 5C: ERROR HANDLING OPTIMIZATION RECOMMENDATIONS\n');

    const validAvg = validationResults.validContext.totalTime / validationResults.validContext.count;
    const legacyAvg = validationResults.legacyFormat.totalTime / validationResults.legacyFormat.count;
    const legacyOverhead = ((legacyAvg - validAvg) / validAvg) * 100;

    console.log('📋 IMMEDIATE OPTIMIZATIONS:');
    
    if (Math.abs(legacyOverhead) > 10) {
      console.log('1. ⚠️  HIGH PRIORITY: Legacy format detection has significant overhead');
      console.log('   → Consider caching format detection results');
      console.log('   → Optimize legacy detection logic');
      console.log('   → Accelerate Phase 6 (complete legacy removal)');
    } else {
      console.log('1. ✅ Legacy format detection is acceptably efficient');
      console.log('   → Current implementation is suitable for continued use');
    }

    console.log('\n2. 🔧 VALIDATION OPTIMIZATIONS:');
    console.log('   → Implement early validation returns for common cases');
    console.log('   → Cache validation results for repeated contexts');
    console.log('   → Optimize error message generation');

    console.log('\n3. 🚨 ERROR HANDLING IMPROVEMENTS:');
    console.log('   → Pre-compile error response templates');
    console.log('   → Implement error code classification for faster handling');
    console.log('   → Add circuit breaker pattern for repeated failures');

    console.log('\n📊 PERFORMANCE TARGETS FOR PHASE 6:');
    console.log(`   → Target validation time: < ${(validAvg * 0.8).toFixed(2)}ms (20% improvement)`);
    console.log(`   → Target error handling: < ${(validAvg * 1.5).toFixed(2)}ms (graceful degradation)`);
    console.log('   → Zero legacy compatibility overhead');

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. ✅ Validation performance analysis completed');
    console.log('2. ✅ Error handling performance analyzed');
    console.log('3. 🔄 Implement identified optimizations');
    console.log('4. 🔄 Prepare Phase 6 legacy removal strategy');
  }
}

async function runErrorHandlingAnalysis() {
  console.log('🚨 Starting Phase 5C: Error Handling Performance Analysis...\n');
  
  const profiler = new ErrorHandlingProfiler();
  const iterations = 25; // Sufficient for error handling analysis

  try {
    // Run validation performance tests
    const validationResults = await profiler.profileValidationPerformance(iterations);
    profiler.printValidationResults(validationResults);

    // Run error recovery tests
    const errorResults = await profiler.profileErrorRecoveryPerformance(iterations);
    profiler.printErrorResults(errorResults);

    // Generate optimization recommendations
    profiler.generateOptimizationRecommendations(validationResults, errorResults);

    console.log('\n🎉 Phase 5C Error Handling Analysis Complete!');
    console.log('\n📋 Summary for Migration Plan Update:');
    console.log('   ✅ Memory usage analysis completed');
    console.log('   ✅ Execution time profiling completed');
    console.log('   ✅ Error handling performance analyzed');
    console.log('   🔄 Ready for Phase 5D (Documentation) and Phase 6 planning');

  } catch (error) {
    console.error('❌ Error handling analysis failed:', error.message);
    console.error(error.stack);
  }
}

// Run the analysis
runErrorHandlingAnalysis();
