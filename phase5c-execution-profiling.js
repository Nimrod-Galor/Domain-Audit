// Phase 5C: Performance Optimization - Execution Time Profiling
// Detailed analysis of analyzer execution patterns and bottlenecks

import { ThirdPartyAnalyzer } from './src/analyzers/third-party/ThirdPartyAnalyzer.js';
import { SocialMediaAnalyzer } from './src/analyzers/content/SocialMediaAnalyzer.js';
import { ContentQualityAnalyzer } from './src/analyzers/content-quality-analyzer.js';
import { JSDOM } from 'jsdom';

class ExecutionProfiler {
  constructor() {
    this.profiles = new Map();
    this.detailedTiming = [];
  }

  createProfile(name) {
    const profile = {
      name,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      iterations: 0,
      timings: [],
      phases: new Map()
    };
    
    this.profiles.set(name, profile);
    return profile;
  }

  timeExecution(profileName, phaseName = 'main') {
    const profile = this.profiles.get(profileName) || this.createProfile(profileName);
    
    return {
      start: () => {
        this.startTime = performance.now();
        this.currentProfile = profile;
        this.currentPhase = phaseName;
      },
      
      end: () => {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        
        // Update profile stats
        profile.totalTime += duration;
        profile.minTime = Math.min(profile.minTime, duration);
        profile.maxTime = Math.max(profile.maxTime, duration);
        profile.iterations++;
        profile.timings.push(duration);
        
        // Track phase timing
        if (!profile.phases.has(this.currentPhase)) {
          profile.phases.set(this.currentPhase, {
            totalTime: 0,
            count: 0,
            timings: []
          });
        }
        
        const phaseData = profile.phases.get(this.currentPhase);
        phaseData.totalTime += duration;
        phaseData.count++;
        phaseData.timings.push(duration);
        
        this.detailedTiming.push({
          profile: profileName,
          phase: this.currentPhase,
          duration,
          timestamp: endTime
        });
        
        return duration;
      }
    };
  }

  getStatistics(profileName) {
    const profile = this.profiles.get(profileName);
    if (!profile) return null;

    const avgTime = profile.totalTime / profile.iterations;
    const timings = profile.timings.sort((a, b) => a - b);
    const median = timings[Math.floor(timings.length / 2)];
    const p95 = timings[Math.floor(timings.length * 0.95)];
    const p99 = timings[Math.floor(timings.length * 0.99)];

    // Calculate standard deviation
    const variance = profile.timings.reduce((sum, time) => {
      return sum + Math.pow(time - avgTime, 2);
    }, 0) / profile.iterations;
    const stdDev = Math.sqrt(variance);

    return {
      name: profile.name,
      iterations: profile.iterations,
      totalTime: profile.totalTime,
      avgTime,
      minTime: profile.minTime,
      maxTime: profile.maxTime,
      median,
      p95,
      p99,
      stdDev,
      phases: Array.from(profile.phases.entries()).map(([name, data]) => ({
        name,
        avgTime: data.totalTime / data.count,
        totalTime: data.totalTime,
        count: data.count,
        percentage: (data.totalTime / profile.totalTime) * 100
      }))
    };
  }

  printStatistics() {
    console.log('\n⏱️  PHASE 5C: EXECUTION TIME ANALYSIS RESULTS\n');
    
    for (const [profileName, profile] of this.profiles) {
      const stats = this.getStatistics(profileName);
      
      console.log(`🔍 ${stats.name}`);
      console.log(`   Iterations: ${stats.iterations}`);
      console.log(`   Total Time: ${stats.totalTime.toFixed(2)}ms`);
      console.log(`   Average: ${stats.avgTime.toFixed(2)}ms`);
      console.log(`   Median: ${stats.median.toFixed(2)}ms`);
      console.log(`   Min/Max: ${stats.minTime.toFixed(2)}ms / ${stats.maxTime.toFixed(2)}ms`);
      console.log(`   95th Percentile: ${stats.p95.toFixed(2)}ms`);
      console.log(`   99th Percentile: ${stats.p99.toFixed(2)}ms`);
      console.log(`   Std Deviation: ${stats.stdDev.toFixed(2)}ms`);
      
      if (stats.phases.length > 1) {
        console.log(`   Phase Breakdown:`);
        stats.phases.forEach(phase => {
          console.log(`     ${phase.name}: ${phase.avgTime.toFixed(2)}ms (${phase.percentage.toFixed(1)}%)`);
        });
      }
      console.log('');
    }
  }

  compareProfiles(profile1Name, profile2Name) {
    const stats1 = this.getStatistics(profile1Name);
    const stats2 = this.getStatistics(profile2Name);
    
    if (!stats1 || !stats2) {
      console.log('❌ Cannot compare - profiles not found');
      return;
    }

    console.log(`\n🔄 EXECUTION TIME COMPARISON: ${profile1Name} vs ${profile2Name}\n`);
    
    const avgDiff = ((stats2.avgTime - stats1.avgTime) / stats1.avgTime) * 100;
    const medianDiff = ((stats2.median - stats1.median) / stats1.median) * 100;
    const p95Diff = ((stats2.p95 - stats1.p95) / stats1.p95) * 100;
    
    console.log(`   Average Time: ${stats1.avgTime.toFixed(2)}ms → ${stats2.avgTime.toFixed(2)}ms (${avgDiff > 0 ? '+' : ''}${avgDiff.toFixed(2)}%)`);
    console.log(`   Median Time: ${stats1.median.toFixed(2)}ms → ${stats2.median.toFixed(2)}ms (${medianDiff > 0 ? '+' : ''}${medianDiff.toFixed(2)}%)`);
    console.log(`   95th Percentile: ${stats1.p95.toFixed(2)}ms → ${stats2.p95.toFixed(2)}ms (${p95Diff > 0 ? '+' : ''}${p95Diff.toFixed(2)}%)`);
    
    if (Math.abs(avgDiff) < 2) {
      console.log('   ✅ Performance difference: NEGLIGIBLE');
    } else if (Math.abs(avgDiff) < 10) {
      console.log('   ⚠️  Performance difference: MODERATE');
    } else {
      console.log('   ❌ Performance difference: SIGNIFICANT');
    }
  }

  identifyBottlenecks() {
    console.log('\n🎯 BOTTLENECK ANALYSIS:\n');
    
    // Find slowest operations
    const allTimings = this.detailedTiming.sort((a, b) => b.duration - a.duration);
    const slowest = allTimings.slice(0, 10);
    
    console.log('🐌 Slowest Operations:');
    slowest.forEach((timing, index) => {
      console.log(`   ${index + 1}. ${timing.profile}.${timing.phase}: ${timing.duration.toFixed(2)}ms`);
    });
    
    // Analyze profile consistency
    console.log('\n📊 Performance Consistency:');
    for (const [profileName, profile] of this.profiles) {
      const stats = this.getStatistics(profileName);
      const variabilityIndex = (stats.stdDev / stats.avgTime) * 100;
      
      let consistency = 'EXCELLENT';
      if (variabilityIndex > 20) consistency = 'POOR';
      else if (variabilityIndex > 10) consistency = 'MODERATE';
      else if (variabilityIndex > 5) consistency = 'GOOD';
      
      console.log(`   ${profileName}: ${consistency} (variability: ${variabilityIndex.toFixed(1)}%)`);
    });
  }
}

async function profileModernPattern(profiler, iterations = 100) {
  const html = `
    <html>
      <head>
        <title>Execution Profile Test</title>
        <script src="https://www.google-analytics.com/analytics.js"></script>
        <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
        <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXX"></script>
        <meta property="og:title" content="Execution Test">
        <meta property="og:description" content="Testing execution performance">
        <meta property="og:image" content="https://example.com/image.jpg">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Execution Test">
        <meta name="twitter:description" content="Testing execution performance">
      </head>
      <body>
        <h1>Execution Performance Test</h1>
        <p>This page contains multiple third-party scripts and social media metadata for comprehensive testing.</p>
        <div class="fb-like" data-href="https://example.com"></div>
        <div class="twitter-tweet" data-tweet-id="123456789"></div>
        <script>
          // Multiple tracking scripts
          gtag('config', 'GA_MEASUREMENT_ID');
          fbq('init', 'FB_PIXEL_ID');
          fbq('track', 'PageView');
          
          // Additional third-party scripts
          (function() {
            var script = document.createElement('script');
            script.src = 'https://cdn.example.com/analytics.js';
            document.head.appendChild(script);
          })();
        </script>
      </body>
    </html>
  `;

  for (let i = 0; i < iterations; i++) {
    const dom = new JSDOM(html);
    const context = {
      document: dom.window.document,
      url: 'https://example.com/execution-test',
      pageData: { 
        title: 'Execution Performance Test',
        description: 'Comprehensive execution testing'
      }
    };

    // Profile ThirdPartyAnalyzer
    const thirdPartyTimer = profiler.timeExecution('Modern ThirdParty Analyzer', 'analysis');
    thirdPartyTimer.start();
    const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
    await thirdPartyAnalyzer.analyze(context);
    thirdPartyTimer.end();

    // Profile SocialMediaAnalyzer
    const socialTimer = profiler.timeExecution('Modern SocialMedia Analyzer', 'analysis');
    socialTimer.start();
    const socialMediaAnalyzer = new SocialMediaAnalyzer();
    await socialMediaAnalyzer.analyze(context);
    socialTimer.end();

    // Profile ContentQualityAnalyzer
    const contentTimer = profiler.timeExecution('Modern ContentQuality Analyzer', 'analysis');
    contentTimer.start();
    const contentQualityAnalyzer = new ContentQualityAnalyzer();
    const contentContext = { dom, pageData: context.pageData, rawHTML: html };
    await contentQualityAnalyzer.analyze(contentContext);
    contentTimer.end();

    dom.window.close();
  }
}

async function profileLegacyPattern(profiler, iterations = 100) {
  const html = `
    <html>
      <head>
        <title>Legacy Execution Profile Test</title>
        <script src="https://www.google-analytics.com/analytics.js"></script>
        <meta property="og:title" content="Legacy Test">
      </head>
      <body>
        <h1>Legacy Pattern Test</h1>
        <p>Testing legacy calling pattern performance.</p>
      </body>
    </html>
  `;

  for (let i = 0; i < iterations; i++) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const url = 'https://example.com/legacy-test';

    // Profile legacy calling format
    const thirdPartyTimer = profiler.timeExecution('Legacy ThirdParty Analyzer', 'legacy-analysis');
    thirdPartyTimer.start();
    const thirdPartyAnalyzer = new ThirdPartyAnalyzer();
    await thirdPartyAnalyzer.analyze(document, url);
    thirdPartyTimer.end();

    const socialTimer = profiler.timeExecution('Legacy SocialMedia Analyzer', 'legacy-analysis');
    socialTimer.start();
    const socialMediaAnalyzer = new SocialMediaAnalyzer();
    await socialMediaAnalyzer.analyze(document, url);
    socialTimer.end();

    dom.window.close();
  }
}

async function profileValidationOverhead(profiler, iterations = 100) {
  const html = `<html><body><h1>Validation Test</h1></body></html>`;

  for (let i = 0; i < iterations; i++) {
    const dom = new JSDOM(html);
    
    // Test validation overhead with modern pattern
    const validTimer = profiler.timeExecution('Validation Overhead', 'validation');
    validTimer.start();
    
    const context = {
      document: dom.window.document,
      url: 'https://example.com/validation-test',
      pageData: {}
    };
    
    const analyzer = new ThirdPartyAnalyzer();
    // Just validation, minimal analysis
    const isValid = analyzer.validate(context);
    
    validTimer.end();

    dom.window.close();
  }
}

async function runExecutionProfiling() {
  console.log('⚡ Starting Phase 5C: Execution Time Profiling...\n');
  
  const profiler = new ExecutionProfiler();
  const iterations = 30; // Sufficient for statistical significance

  try {
    console.log('🔍 Profiling Modern Context Pattern...');
    await profileModernPattern(profiler, iterations);

    console.log('🔍 Profiling Legacy Compatibility Pattern...');
    await profileLegacyPattern(profiler, iterations);

    console.log('🔍 Profiling Validation Overhead...');
    await profileValidationOverhead(profiler, iterations);

    // Print detailed statistics
    profiler.printStatistics();

    // Compare performance
    profiler.compareProfiles('Modern ThirdParty Analyzer', 'Legacy ThirdParty Analyzer');
    profiler.compareProfiles('Modern SocialMedia Analyzer', 'Legacy SocialMedia Analyzer');

    // Identify bottlenecks
    profiler.identifyBottlenecks();

    console.log('\n📋 EXECUTION ANALYSIS SUMMARY:\n');
    
    const modernThirdParty = profiler.getStatistics('Modern ThirdParty Analyzer');
    const legacyThirdParty = profiler.getStatistics('Legacy ThirdParty Analyzer');
    const modernSocial = profiler.getStatistics('Modern SocialMedia Analyzer');
    const legacySocial = profiler.getStatistics('Legacy SocialMedia Analyzer');

    console.log('✅ Performance Baseline (Modern Pattern):');
    console.log(`   - ThirdParty Analyzer: ${modernThirdParty.avgTime.toFixed(2)}ms avg (±${modernThirdParty.stdDev.toFixed(2)}ms)`);
    console.log(`   - SocialMedia Analyzer: ${modernSocial.avgTime.toFixed(2)}ms avg (±${modernSocial.stdDev.toFixed(2)}ms)`);

    console.log('\n🔄 Legacy Compatibility Impact:');
    const thirdPartyOverhead = ((legacyThirdParty.avgTime - modernThirdParty.avgTime) / modernThirdParty.avgTime) * 100;
    const socialOverhead = ((legacySocial.avgTime - modernSocial.avgTime) / modernSocial.avgTime) * 100;
    
    console.log(`   - ThirdParty overhead: ${thirdPartyOverhead > 0 ? '+' : ''}${thirdPartyOverhead.toFixed(2)}%`);
    console.log(`   - SocialMedia overhead: ${socialOverhead > 0 ? '+' : ''}${socialOverhead.toFixed(2)}%`);

    console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS:');
    
    const avgOverhead = (thirdPartyOverhead + socialOverhead) / 2;
    if (Math.abs(avgOverhead) < 5) {
      console.log('✅ Legacy compatibility overhead is minimal');
      console.log('   → Safe to maintain current approach through Phase 6');
      console.log('   → Focus optimization efforts elsewhere');
    } else if (Math.abs(avgOverhead) < 15) {
      console.log('⚠️  Legacy compatibility has measurable overhead');
      console.log('   → Consider accelerating Phase 6 (complete legacy removal)');
      console.log('   → Monitor performance in production');
    } else {
      console.log('❌ Legacy compatibility has significant overhead');
      console.log('   → Phase 6 should be high priority');
      console.log('   → Consider immediate legacy removal');
    }

    console.log('\n📊 Next Steps for Phase 5C:');
    console.log('1. ✅ Memory analysis completed');
    console.log('2. ✅ Execution time profiling completed');
    console.log('3. 🔄 Analyze error handling performance');
    console.log('4. 🔄 Create comprehensive optimization plan');

  } catch (error) {
    console.error('❌ Execution profiling failed:', error.message);
    console.error(error.stack);
  }
}

// Run the profiling
runExecutionProfiling();
