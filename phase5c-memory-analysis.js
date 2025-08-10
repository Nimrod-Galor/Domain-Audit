// Phase 5C: Performance Optimization - Memory Usage Analysis
// Measures memory usage of modern vs legacy calling patterns

import { ThirdPartyAnalyzer } from './src/analyzers/third-party/ThirdPartyAnalyzer.js';
import { SocialMediaAnalyzer } from './src/analyzers/content/SocialMediaAnalyzer.js';
import { ContentQualityAnalyzer } from './src/analyzers/content-quality-analyzer.js';
import { JSDOM } from 'jsdom';

class PerformanceProfiler {
  constructor() {
    this.measurements = [];
  }

  measureMemory(testName, iterations = 100) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const initialMemory = process.memoryUsage();
    const startTime = performance.now();

    return {
      start: () => {
        this.startMemory = process.memoryUsage();
        this.startTime = performance.now();
      },
      
      end: () => {
        const endTime = performance.now();
        const endMemory = process.memoryUsage();
        
        const memoryDelta = {
          heapUsed: endMemory.heapUsed - this.startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - this.startMemory.heapTotal,
          external: endMemory.external - this.startMemory.external,
          rss: endMemory.rss - this.startMemory.rss
        };

        const result = {
          testName,
          iterations,
          executionTime: endTime - this.startTime,
          memoryDelta,
          memoryPerIteration: {
            heapUsed: memoryDelta.heapUsed / iterations,
            heapTotal: memoryDelta.heapTotal / iterations,
            external: memoryDelta.external / iterations,
            rss: memoryDelta.rss / iterations
          }
        };

        this.measurements.push(result);
        return result;
      }
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printResults() {
    console.log('\n📊 PHASE 5C: MEMORY USAGE ANALYSIS RESULTS\n');
    
    this.measurements.forEach(measurement => {
      console.log(`🔍 ${measurement.testName}`);
      console.log(`   Iterations: ${measurement.iterations}`);
      console.log(`   Total Time: ${measurement.executionTime.toFixed(2)}ms`);
      console.log(`   Avg Time/Iteration: ${(measurement.executionTime / measurement.iterations).toFixed(2)}ms`);
      console.log(`   Memory Delta:`);
      console.log(`     Heap Used: ${this.formatBytes(measurement.memoryDelta.heapUsed)}`);
      console.log(`     Heap Total: ${this.formatBytes(measurement.memoryDelta.heapTotal)}`);
      console.log(`     External: ${this.formatBytes(measurement.memoryDelta.external)}`);
      console.log(`     RSS: ${this.formatBytes(measurement.memoryDelta.rss)}`);
      console.log(`   Memory Per Iteration:`);
      console.log(`     Heap Used: ${this.formatBytes(measurement.memoryPerIteration.heapUsed)}`);
      console.log(`     External: ${this.formatBytes(measurement.memoryPerIteration.external)}`);
      console.log('');
    });
  }

  compareResults(test1Name, test2Name) {
    const test1 = this.measurements.find(m => m.testName === test1Name);
    const test2 = this.measurements.find(m => m.testName === test2Name);
    
    if (!test1 || !test2) {
      console.log('❌ Cannot compare - tests not found');
      return;
    }

    console.log(`\n🔄 COMPARISON: ${test1Name} vs ${test2Name}\n`);
    
    const timeDiff = ((test2.executionTime - test1.executionTime) / test1.executionTime) * 100;
    const memoryDiff = ((test2.memoryDelta.heapUsed - test1.memoryDelta.heapUsed) / Math.abs(test1.memoryDelta.heapUsed)) * 100;
    
    console.log(`   ⏱️  Time Difference: ${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(2)}%`);
    console.log(`   🧠 Memory Difference: ${memoryDiff > 0 ? '+' : ''}${memoryDiff.toFixed(2)}%`);
    
    if (Math.abs(timeDiff) < 5) {
      console.log('   ✅ Performance impact: NEGLIGIBLE');
    } else if (Math.abs(timeDiff) < 15) {
      console.log('   ⚠️  Performance impact: MODERATE');
    } else {
      console.log('   ❌ Performance impact: SIGNIFICANT');
    }
  }
}

async function testModernCallingPattern(profiler, iterations = 100) {
  const html = `
    <html>
      <head>
        <title>Performance Test Page</title>
        <script src="https://www.google-analytics.com/analytics.js"></script>
        <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
        <meta property="og:title" content="Performance Test">
        <meta property="og:description" content="Testing modern calling patterns">
      </head>
      <body>
        <h1>Performance Test Content</h1>
        <p>This page is designed for performance testing of analyzer calling patterns.</p>
        <div class="fb-like" data-href="https://example.com"></div>
        <script>
          // Google Analytics
          gtag('config', 'GA_MEASUREMENT_ID');
          
          // Facebook Pixel
          fbq('init', 'FB_PIXEL_ID');
          fbq('track', 'PageView');
        </script>
      </body>
    </html>
  `;

  const measurement = profiler.measureMemory('Modern Context Pattern', iterations);
  measurement.start();

  for (let i = 0; i < iterations; i++) {
    const dom = new JSDOM(html);
    const context = {
      document: dom.window.document,
      url: 'https://example.com/performance-test',
      pageData: { 
        title: 'Performance Test Page',
        description: 'Testing modern patterns'
      }
    };

    // Test all modernized analyzers
    const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
    const socialMediaAnalyzer = new SocialMediaAnalyzer();
    const contentQualityAnalyzer = new ContentQualityAnalyzer();

    await thirdPartyAnalyzer.analyze(context);
    await socialMediaAnalyzer.analyze(context);
    
    // ContentQualityAnalyzer uses different context structure
    const contentContext = { 
      dom, 
      pageData: context.pageData, 
      rawHTML: html 
    };
    await contentQualityAnalyzer.analyze(contentContext);

    // Cleanup to prevent memory leaks
    dom.window.close();
  }

  return measurement.end();
}

async function testLegacyCallingPattern(profiler, iterations = 100) {
  const html = `
    <html>
      <head>
        <title>Performance Test Page</title>
        <script src="https://www.google-analytics.com/analytics.js"></script>
        <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
        <meta property="og:title" content="Performance Test">
        <meta property="og:description" content="Testing legacy calling patterns">
      </head>
      <body>
        <h1>Performance Test Content</h1>
        <p>This page is designed for performance testing of analyzer calling patterns.</p>
        <div class="fb-like" data-href="https://example.com"></div>
      </body>
    </html>
  `;

  const measurement = profiler.measureMemory('Legacy Compatibility Pattern', iterations);
  measurement.start();

  for (let i = 0; i < iterations; i++) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const url = 'https://example.com/performance-test';

    // Test legacy calling format (should trigger compatibility mode)
    const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
    const socialMediaAnalyzer = new SocialMediaAnalyzer();

    await thirdPartyAnalyzer.analyze(document, url);
    await socialMediaAnalyzer.analyze(document, url);

    // Cleanup
    dom.window.close();
  }

  return measurement.end();
}

async function testBaseAnalyzerOverhead(profiler, iterations = 100) {
  const html = `<html><body><h1>Minimal Test</h1></body></html>`;

  const measurement = profiler.measureMemory('BaseAnalyzer Overhead', iterations);
  measurement.start();

  for (let i = 0; i < iterations; i++) {
    const dom = new JSDOM(html);
    const context = {
      document: dom.window.document,
      url: 'https://example.com/minimal',
      pageData: {}
    };

    // Create analyzer instances to measure BaseAnalyzer overhead
    const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
    
    // Measure just the BaseAnalyzer pattern overhead (validation, context handling)
    const result = await thirdPartyAnalyzer.analyze(context);
    
    dom.window.close();
  }

  return measurement.end();
}

async function runMemoryAnalysis() {
  console.log('🚀 Starting Phase 5C: Memory Usage Analysis...\n');
  
  // Check if garbage collection is available
  if (!global.gc) {
    console.log('⚠️  Note: Running without --expose-gc flag. Memory measurements may be less accurate.\n');
  }

  const profiler = new PerformanceProfiler();
  const iterations = 50; // Reduced for quicker testing, increase for production analysis

  try {
    console.log('🔍 Testing Modern Context Pattern...');
    await testModernCallingPattern(profiler, iterations);

    console.log('🔍 Testing Legacy Compatibility Pattern...');
    await testLegacyCallingPattern(profiler, iterations);

    console.log('🔍 Testing BaseAnalyzer Overhead...');
    await testBaseAnalyzerOverhead(profiler, iterations);

    // Print all results
    profiler.printResults();

    // Compare modern vs legacy
    profiler.compareResults('Modern Context Pattern', 'Legacy Compatibility Pattern');

    // Analyze BaseAnalyzer overhead
    console.log('\n📋 ANALYSIS SUMMARY:\n');
    
    const modernTest = profiler.measurements.find(m => m.testName === 'Modern Context Pattern');
    const legacyTest = profiler.measurements.find(m => m.testName === 'Legacy Compatibility Pattern');
    const overheadTest = profiler.measurements.find(m => m.testName === 'BaseAnalyzer Overhead');

    console.log('✅ Modern Pattern Performance:');
    console.log(`   - Average execution time: ${(modernTest.executionTime / modernTest.iterations).toFixed(2)}ms per analyzer`);
    console.log(`   - Memory per iteration: ${profiler.formatBytes(modernTest.memoryPerIteration.heapUsed)}`);

    console.log('\n🔄 Legacy Compatibility Cost:');
    const legacyOverhead = ((legacyTest.executionTime - modernTest.executionTime) / modernTest.executionTime) * 100;
    console.log(`   - Performance overhead: ${legacyOverhead > 0 ? '+' : ''}${legacyOverhead.toFixed(2)}%`);
    
    const memoryOverhead = ((legacyTest.memoryDelta.heapUsed - modernTest.memoryDelta.heapUsed) / Math.abs(modernTest.memoryDelta.heapUsed)) * 100;
    console.log(`   - Memory overhead: ${memoryOverhead > 0 ? '+' : ''}${memoryOverhead.toFixed(2)}%`);

    console.log('\n🎯 RECOMMENDATIONS:');
    if (Math.abs(legacyOverhead) < 5) {
      console.log('✅ Legacy compatibility has minimal performance impact - safe to maintain for Phase 6 planning');
    } else if (Math.abs(legacyOverhead) < 15) {
      console.log('⚠️  Legacy compatibility has moderate impact - consider prioritizing Phase 6 (complete removal)');
    } else {
      console.log('❌ Legacy compatibility has significant impact - Phase 6 should be high priority');
    }

    console.log('\n📊 Next Steps for Phase 5C:');
    console.log('1. ✅ Memory analysis completed');
    console.log('2. 🔄 Run execution time profiling');
    console.log('3. 🔄 Analyze error handling performance');
    console.log('4. 🔄 Create optimization recommendations');

  } catch (error) {
    console.error('❌ Memory analysis failed:', error.message);
    console.error(error.stack);
  }
}

// Run the analysis
runMemoryAnalysis();
