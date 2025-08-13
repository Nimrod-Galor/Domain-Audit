/**
 * Performance Optimization Analyzer - Combined Approach Heuristics
 * 
 * GPT-5 Style: Heuristics component for performance optimization analysis
 * Analyzes performance data and provides actionable optimization recommendations
 * 
 * @version 1.0.0
 * @author Performance Team
 */

export class PerformanceOptimizationAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableAdvancedAnalysis: options.enableAdvancedAnalysis !== false,
      includeExperimentalMetrics: options.includeExperimentalMetrics !== false,
      trackUserExperience: options.trackUserExperience !== false,
      ...options
    };

    this.thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fcp: { good: 1800, needsImprovement: 3000 },
      ttfb: { good: 800, needsImprovement: 1800 },
      resourceCount: { good: 50, needsImprovement: 100 },
      totalSize: { good: 1000000, needsImprovement: 3000000 }, // 1MB, 3MB
      scriptSize: { good: 300000, needsImprovement: 1000000 }  // 300KB, 1MB
    };
  }

  /**
   * Analyze performance optimization opportunities
   * @param {Object} context - Analysis context with metrics and resources
   * @returns {Object} Performance optimization analysis results
   */
  async analyzePerformance(context) {
    const { metrics, resources } = context;

    const analysis = {
      coreWebVitals: this.analyzeCoreWebVitals(metrics?.coreWebVitals),
      resourceOptimization: this.analyzeResourceOptimization(resources),
      loadingStrategy: this.analyzeLoadingStrategy(resources),
      cacheStrategy: this.analyzeCacheStrategy(resources),
      criticalPath: this.analyzeCriticalRenderingPath(resources),
      thirdParty: this.analyzeThirdPartyImpact(resources?.thirdParty),
      mobilePerformance: this.analyzeMobilePerformance(metrics, resources),
      experimentalMetrics: this.options.includeExperimentalMetrics ? 
        this.analyzeExperimentalMetrics(metrics) : null
    };

    return {
      analysis,
      score: this.calculateOptimizationScore(analysis),
      recommendations: this.generateOptimizationRecommendations(analysis),
      prioritizedActions: this.prioritizeOptimizationActions(analysis),
      estimatedImpact: this.estimatePerformanceImpact(analysis)
    };
  }

  /**
   * Analyze Core Web Vitals performance
   */
  analyzeCoreWebVitals(vitals) {
    if (!vitals) return null;

    // Handle case where vitals exist but individual metrics don't have valid values
    const analysis = {
      lcp: vitals.lcp ? this.analyzeLCP(vitals.lcp) : null,
      fid: vitals.fid ? this.analyzeFID(vitals.fid) : null,
      cls: vitals.cls ? this.analyzeCLS(vitals.cls) : null,
      fcp: vitals.fcp ? this.analyzeFCP(vitals.fcp) : null,
      ttfb: vitals.ttfb ? this.analyzeTTFB(vitals.ttfb) : null,
      inp: vitals.inp ? this.analyzeINP(vitals.inp) : null
    };

    // If no valid metrics, return simulated analysis for testing environments
    const hasValidMetrics = Object.values(analysis).some(metric => 
      metric && metric.value !== null && metric.value !== undefined
    );

    if (!hasValidMetrics) {
      return {
        ...analysis,
        overallStatus: 'not-measurable',
        improvements: [],
        testEnvironment: true,
        note: 'Core Web Vitals cannot be measured outside of browser environment'
      };
    }

    return {
      ...analysis,
      overallStatus: this.assessOverallVitalsStatus(analysis),
      improvements: this.identifyVitalsImprovements(analysis)
    };
  }

  /**
   * Analyze Largest Contentful Paint
   */
  analyzeLCP(lcp) {
    if (!lcp?.value) return null;

    const status = lcp.value <= this.thresholds.lcp.good ? 'good' :
                   lcp.value <= this.thresholds.lcp.needsImprovement ? 'needs-improvement' : 'poor';

    const issues = [];
    const optimizations = [];

    if (status !== 'good') {
      if (lcp.value > 4000) {
        issues.push('LCP element loads too slowly');
        optimizations.push('Optimize LCP element (image/text) loading');
      }
      if (lcp.value > 2500) {
        optimizations.push('Preload LCP resource');
        optimizations.push('Optimize server response time');
      }
    }

    return {
      value: lcp.value,
      status,
      element: lcp.element,
      issues,
      optimizations,
      impact: status === 'poor' ? 'high' : status === 'needs-improvement' ? 'medium' : 'low'
    };
  }

  /**
   * Analyze First Input Delay
   */
  analyzeFID(fid) {
    if (!fid?.value) return null;

    const status = fid.value <= this.thresholds.fid.good ? 'good' :
                   fid.value <= this.thresholds.fid.needsImprovement ? 'needs-improvement' : 'poor';

    const issues = [];
    const optimizations = [];

    if (status !== 'good') {
      issues.push('Slow response to user interactions');
      optimizations.push('Reduce JavaScript execution time');
      optimizations.push('Break up long tasks');
      optimizations.push('Use code splitting');
    }

    return {
      value: fid.value,
      status,
      issues,
      optimizations,
      impact: status === 'poor' ? 'high' : 'medium'
    };
  }

  /**
   * Analyze Cumulative Layout Shift
   */
  analyzeCLS(cls) {
    if (!cls?.value) return null;

    const status = cls.value <= this.thresholds.cls.good ? 'good' :
                   cls.value <= this.thresholds.cls.needsImprovement ? 'needs-improvement' : 'poor';

    const issues = [];
    const optimizations = [];

    if (status !== 'good') {
      issues.push('Unexpected layout shifts during page load');
      optimizations.push('Set explicit dimensions for images and ads');
      optimizations.push('Reserve space for dynamic content');
      optimizations.push('Use font-display: swap properly');
    }

    return {
      value: cls.value,
      status,
      issues,
      optimizations,
      impact: status === 'poor' ? 'high' : 'medium'
    };
  }

  /**
   * Analyze First Contentful Paint
   */
  analyzeFCP(fcp) {
    if (!fcp?.value) return null;

    const status = fcp.value <= this.thresholds.fcp.good ? 'good' :
                   fcp.value <= this.thresholds.fcp.needsImprovement ? 'needs-improvement' : 'poor';

    return {
      value: fcp.value,
      status,
      impact: status === 'poor' ? 'medium' : 'low'
    };
  }

  /**
   * Analyze Time to First Byte
   */
  analyzeTTFB(ttfb) {
    if (!ttfb?.value) return null;

    const status = ttfb.value <= this.thresholds.ttfb.good ? 'good' :
                   ttfb.value <= this.thresholds.ttfb.needsImprovement ? 'needs-improvement' : 'poor';

    const optimizations = [];
    if (status !== 'good') {
      optimizations.push('Optimize server response time');
      optimizations.push('Use CDN for faster content delivery');
      optimizations.push('Implement caching strategies');
    }

    return {
      value: ttfb.value,
      status,
      optimizations,
      impact: status === 'poor' ? 'high' : 'medium'
    };
  }

  /**
   * Analyze Interaction to Next Paint
   */
  analyzeINP(inp) {
    if (!inp?.value) return null;

    return {
      value: inp.value,
      status: inp.value <= 200 ? 'good' : inp.value <= 500 ? 'needs-improvement' : 'poor',
      impact: inp.value > 500 ? 'high' : 'medium'
    };
  }

  /**
   * Analyze resource optimization opportunities
   */
  analyzeResourceOptimization(resources) {
    if (!resources?.resources) return null;

    const analysis = {
      images: this.analyzeImageOptimization(resources.resources.images),
      scripts: this.analyzeScriptOptimization(resources.resources.scripts),
      stylesheets: this.analyzeStylesheetOptimization(resources.resources.stylesheets),
      fonts: this.analyzeFontOptimization(resources.resources.fonts),
      compression: this.analyzeCompressionOpportunities(resources),
      bundling: this.analyzeBundlingOpportunities(resources.resources)
    };

    return {
      ...analysis,
      totalResourceCount: this.getTotalResourceCount(resources.resources),
      totalResourceSize: this.estimateTotalResourceSize(resources.resources),
      optimizationPotential: this.calculateOptimizationPotential(analysis)
    };
  }

  /**
   * Analyze compression opportunities
   */
  analyzeCompressionOpportunities(resources) {
    // Analyze potential for compression improvements
    const opportunities = [];
    
    if (resources?.resources) {
      const uncompressedEstimate = this.estimateTotalResourceSize(resources.resources);
      
      if (uncompressedEstimate > 1000000) { // > 1MB
        opportunities.push('Enable gzip/brotli compression for text resources');
      }
      
      // Check for large resources that could benefit from compression
      Object.values(resources.resources).forEach(resourceArray => {
        if (Array.isArray(resourceArray)) {
          resourceArray.forEach(resource => {
            if (resource.type === 'script' || resource.type === 'stylesheet') {
              opportunities.push('Minify and compress JavaScript/CSS files');
            }
          });
        }
      });
    }

    return {
      opportunities: [...new Set(opportunities)],
      estimatedSavings: '20-30% size reduction',
      impact: opportunities.length > 0 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze bundling opportunities
   */
  analyzeBundlingOpportunities(resources) {
    const opportunities = [];
    
    if (resources?.scripts && resources.scripts.length > 5) {
      opportunities.push('Bundle multiple JavaScript files');
    }
    
    if (resources?.stylesheets && resources.stylesheets.length > 3) {
      opportunities.push('Bundle CSS files');
    }
    
    return {
      opportunities,
      impact: opportunities.length > 0 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze image optimization opportunities
   */
  analyzeImageOptimization(images) {
    if (!images) return null;

    const unoptimized = [];
    const optimizations = [];

    images.forEach(image => {
      if (!image.lazy && image.position === 'below-fold') {
        unoptimized.push({ ...image, issue: 'missing-lazy-loading' });
        optimizations.push('Implement lazy loading for below-fold images');
      }
      
      if (image.format === 'jpg' || image.format === 'png') {
        unoptimized.push({ ...image, issue: 'format-optimization' });
        optimizations.push('Convert images to WebP/AVIF format');
      }

      if (!image.responsive) {
        unoptimized.push({ ...image, issue: 'missing-responsive' });
        optimizations.push('Implement responsive images with srcset');
      }
    });

    return {
      totalImages: images.length,
      unoptimizedImages: unoptimized.length,
      optimizations: [...new Set(optimizations)],
      impact: unoptimized.length > 10 ? 'high' : unoptimized.length > 5 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze script optimization opportunities
   */
  analyzeScriptOptimization(scripts) {
    if (!scripts) return null;

    const blocking = scripts.filter(script => 
      script.src && !script.async && !script.defer
    );
    
    const unoptimized = scripts.filter(script => 
      script.src && !script.module && script.position === 'above-fold'
    );

    const optimizations = [];
    if (blocking.length > 0) {
      optimizations.push('Add async/defer attributes to non-critical scripts');
    }
    if (unoptimized.length > 0) {
      optimizations.push('Convert to ES modules where possible');
    }

    return {
      totalScripts: scripts.length,
      blockingScripts: blocking.length,
      unoptimizedScripts: unoptimized.length,
      optimizations,
      impact: blocking.length > 3 ? 'high' : blocking.length > 1 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze stylesheet optimization opportunities
   */
  analyzeStylesheetOptimization(stylesheets) {
    if (!stylesheets) return null;

    const blocking = stylesheets.filter(css => css.critical);
    const unoptimized = stylesheets.filter(css => 
      css.media === 'all' && css.position === 'above-fold'
    );

    const optimizations = [];
    if (blocking.length > 3) {
      optimizations.push('Inline critical CSS');
      optimizations.push('Load non-critical CSS asynchronously');
    }

    return {
      totalStylesheets: stylesheets.length,
      blockingStylesheets: blocking.length,
      optimizations,
      impact: blocking.length > 5 ? 'high' : 'medium'
    };
  }

  /**
   * Analyze font optimization opportunities
   */
  analyzeFontOptimization(fonts) {
    if (!fonts) return null;

    const unoptimized = fonts.filter(font => !font.preload);
    const optimizations = [];

    if (unoptimized.length > 0) {
      optimizations.push('Preload critical fonts');
    }
    
    const hasOldFormats = fonts.some(font => 
      font.format === 'ttf' || font.format === 'otf'
    );
    
    if (hasOldFormats) {
      optimizations.push('Use WOFF2 format for better compression');
    }

    return {
      totalFonts: fonts.length,
      unoptimizedFonts: unoptimized.length,
      optimizations,
      impact: fonts.length > 6 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze loading strategy
   */
  analyzeLoadingStrategy(resources) {
    if (!resources?.performance) return null;

    const criticalResources = resources.performance.criticalResources || [];
    const blockingResources = resources.performance.blockingResources || [];

    const strategy = {
      critical: {
        count: criticalResources.length,
        optimized: criticalResources.filter(r => 
          r.type === 'script' ? r.async || r.defer : true
        ).length
      },
      blocking: {
        count: blockingResources.length,
        impact: blockingResources.length > 5 ? 'high' : 
                blockingResources.length > 2 ? 'medium' : 'low'
      }
    };

    const recommendations = [];
    if (strategy.blocking.count > 2) {
      recommendations.push('Reduce render-blocking resources');
    }
    if (strategy.critical.optimized / strategy.critical.count < 0.8) {
      recommendations.push('Optimize critical resource loading');
    }

    return {
      ...strategy,
      recommendations,
      score: this.calculateLoadingStrategyScore(strategy)
    };
  }

  /**
   * Analyze cache strategy effectiveness
   */
  analyzeCacheStrategy(resources) {
    // This would typically analyze HTTP headers from resource timing
    // For now, provide general cache recommendations
    
    return {
      staticResources: this.identifyStaticResources(resources),
      dynamicResources: this.identifyDynamicResources(resources),
      recommendations: [
        'Implement long-term caching for static resources',
        'Use ETags for dynamic content',
        'Leverage browser caching with appropriate cache headers',
        'Consider service worker for offline caching'
      ]
    };
  }

  /**
   * Analyze critical rendering path
   */
  analyzeCriticalRenderingPath(resources) {
    if (!resources?.performance) return null;

    const criticalResources = resources.performance.criticalResources || [];
    const aboveFoldResources = Object.values(resources.resources || {})
      .flat()
      .filter(r => r.position === 'above-fold');

    return {
      criticalResourceCount: criticalResources.length,
      aboveFoldResourceCount: aboveFoldResources.length,
      optimizationOpportunities: this.identifyCriticalPathOptimizations(criticalResources),
      recommendations: [
        'Minimize critical resource dependencies',
        'Inline critical CSS',
        'Preload key resources',
        'Eliminate render-blocking JavaScript'
      ]
    };
  }

  /**
   * Analyze third-party performance impact
   */
  analyzeThirdPartyImpact(thirdParty) {
    if (!thirdParty) return null;

    const impact = thirdParty.summary?.impact || 'low';
    const criticalThirdParty = thirdParty.summary?.criticalResources || 0;

    const recommendations = [];
    if (impact === 'high') {
      recommendations.push('Reduce third-party dependencies');
      recommendations.push('Load third-party scripts asynchronously');
    }
    if (criticalThirdParty > 0) {
      recommendations.push('Move third-party scripts to non-critical loading');
    }

    return {
      domains: thirdParty.domains?.length || 0,
      totalResources: thirdParty.summary?.totalResources || 0,
      criticalResources: criticalThirdParty,
      impact,
      recommendations
    };
  }

  /**
   * Analyze mobile performance considerations
   */
  analyzeMobilePerformance(metrics, resources) {
    const mobileFactors = {
      connectionSensitive: this.identifyConnectionSensitiveResources(resources),
      dataPlan: this.estimateDataUsage(resources),
      batteryImpact: this.estimateBatteryImpact(metrics, resources),
      touchInteractions: this.analyzeTouchPerformance(metrics)
    };

    return {
      ...mobileFactors,
      mobileScore: this.calculateMobilePerformanceScore(mobileFactors),
      recommendations: this.generateMobileRecommendations(mobileFactors)
    };
  }

  /**
   * Analyze experimental performance metrics
   */
  analyzeExperimentalMetrics(metrics) {
    return {
      timeToInteractive: this.estimateTimeToInteractive(metrics),
      totalBlockingTime: this.calculateTotalBlockingTime(metrics),
      speedIndex: this.estimateSpeedIndex(metrics)
    };
  }

  // Helper methods for scoring and calculations

  assessOverallVitalsStatus(vitalsAnalysis) {
    const statuses = Object.values(vitalsAnalysis)
      .filter(v => v && v.status)
      .map(v => v.status);
    
    if (statuses.length === 0) return 'not-measurable';
    if (statuses.every(s => s === 'good')) return 'excellent';
    if (statuses.some(s => s === 'poor')) return 'poor';
    if (statuses.some(s => s === 'needs-improvement')) return 'needs-improvement';
    return 'good';
  }

  calculateOptimizationScore(analysis) {
    let score = 100;
    
    // Deduct based on Core Web Vitals
    if (analysis.coreWebVitals?.overallStatus === 'poor') score -= 40;
    else if (analysis.coreWebVitals?.overallStatus === 'needs-improvement') score -= 20;
    
    // Deduct based on resource optimization
    if (analysis.resourceOptimization?.optimizationPotential === 'high') score -= 20;
    else if (analysis.resourceOptimization?.optimizationPotential === 'medium') score -= 10;
    
    // Deduct based on loading strategy
    if (analysis.loadingStrategy?.score < 60) score -= 15;
    
    // Deduct based on third-party impact
    if (analysis.thirdParty?.impact === 'high') score -= 15;
    else if (analysis.thirdParty?.impact === 'medium') score -= 8;

    return Math.max(0, score);
  }

  generateOptimizationRecommendations(analysis) {
    const recommendations = [];
    
    // Add Core Web Vitals recommendations
    Object.values(analysis.coreWebVitals || {}).forEach(vital => {
      if (vital?.optimizations) {
        recommendations.push(...vital.optimizations.map(opt => ({
          type: 'core-web-vitals',
          action: opt,
          priority: vital.impact === 'high' ? 'high' : 'medium'
        })));
      }
    });

    // Add resource optimization recommendations
    Object.values(analysis.resourceOptimization || {}).forEach(resource => {
      if (resource?.optimizations) {
        recommendations.push(...resource.optimizations.map(opt => ({
          type: 'resource-optimization',
          action: opt,
          priority: resource.impact === 'high' ? 'high' : 'medium'
        })));
      }
    });

    return recommendations;
  }

  prioritizeOptimizationActions(analysis) {
    const actions = this.generateOptimizationRecommendations(analysis);
    
    return {
      high: actions.filter(a => a.priority === 'high'),
      medium: actions.filter(a => a.priority === 'medium'),
      low: actions.filter(a => a.priority === 'low')
    };
  }

  estimatePerformanceImpact(analysis) {
    const impacts = {
      coreWebVitals: this.estimateVitalsImprovement(analysis.coreWebVitals),
      resourceOptimization: this.estimateResourceImpact(analysis.resourceOptimization),
      loadingStrategy: this.estimateLoadingImpact(analysis.loadingStrategy)
    };

    return {
      ...impacts,
      overall: this.calculateOverallImpact(impacts)
    };
  }

  // Additional helper methods would be implemented here
  // for specific calculations and assessments

  getTotalResourceCount(resources) {
    return Object.values(resources || {})
      .reduce((total, resourceArray) => 
        total + (Array.isArray(resourceArray) ? resourceArray.length : 0), 0);
  }

  estimateTotalResourceSize(resources) {
    // Estimation based on typical resource sizes
    const estimates = {
      scripts: (resources.scripts?.length || 0) * 50000, // 50KB average
      stylesheets: (resources.stylesheets?.length || 0) * 20000, // 20KB average
      images: (resources.images?.length || 0) * 100000, // 100KB average
      fonts: (resources.fonts?.length || 0) * 30000 // 30KB average
    };

    return Object.values(estimates).reduce((total, size) => total + size, 0);
  }

  calculateOptimizationPotential(analysis) {
    const highImpactItems = Object.values(analysis)
      .filter(item => item?.impact === 'high').length;
    
    return highImpactItems > 3 ? 'high' : 
           highImpactItems > 1 ? 'medium' : 'low';
  }

  calculateLoadingStrategyScore(strategy) {
    let score = 100;
    
    if (strategy.blocking.count > 5) score -= 30;
    else if (strategy.blocking.count > 2) score -= 15;
    
    const optimizationRatio = strategy.critical.optimized / strategy.critical.count;
    if (optimizationRatio < 0.5) score -= 25;
    else if (optimizationRatio < 0.8) score -= 10;

    return Math.max(0, score);
  }

  identifyStaticResources(resources) {
    // Identify resources that should be cached long-term
    return Object.values(resources?.resources || {})
      .flat()
      .filter(resource => 
        resource.type === 'script' || 
        resource.type === 'stylesheet' || 
        resource.type === 'image' ||
        resource.type === 'font'
      );
  }

  identifyDynamicResources(resources) {
    // Identify resources that change frequently
    return Object.values(resources?.resources || {})
      .flat()
      .filter(resource => 
        resource.type === 'iframe' ||
        (resource.src && resource.src.includes('api'))
      );
  }

  identifyCriticalPathOptimizations(criticalResources) {
    return [
      'Minimize critical CSS',
      'Defer non-critical JavaScript',
      'Optimize font loading',
      'Use resource hints (preload, prefetch)'
    ];
  }

  identifyConnectionSensitiveResources(resources) {
    // Resources that heavily impact mobile/slow connections
    return Object.values(resources?.resources || {})
      .flat()
      .filter(resource => 
        resource.type === 'image' || 
        resource.type === 'video' ||
        resource.isThirdParty
      );
  }

  estimateDataUsage(resources) {
    const totalSize = this.estimateTotalResourceSize(resources?.resources);
    return {
      estimated: totalSize,
      impact: totalSize > 3000000 ? 'high' : totalSize > 1000000 ? 'medium' : 'low'
    };
  }

  estimateBatteryImpact(metrics, resources) {
    // Scripts and long tasks impact battery life
    const scriptCount = resources?.resources?.scripts?.length || 0;
    const longTasks = metrics?.longTasks?.count || 0;
    
    return {
      impact: scriptCount > 10 || longTasks > 5 ? 'high' : 'medium'
    };
  }

  analyzeTouchPerformance(metrics) {
    return {
      inputDelay: metrics?.coreWebVitals?.fid?.value || null,
      recommendation: 'Optimize touch event handlers for mobile performance'
    };
  }

  calculateMobilePerformanceScore(factors) {
    let score = 100;
    
    if (factors.dataPlan.impact === 'high') score -= 25;
    if (factors.batteryImpact.impact === 'high') score -= 20;
    
    return Math.max(0, score);
  }

  generateMobileRecommendations(factors) {
    const recommendations = [];
    
    if (factors.dataPlan.impact === 'high') {
      recommendations.push('Reduce total page size for mobile users');
    }
    if (factors.batteryImpact.impact === 'high') {
      recommendations.push('Optimize JavaScript execution for battery life');
    }
    
    return recommendations;
  }

  // Placeholder methods for experimental metrics
  estimateTimeToInteractive(metrics) { return null; }
  calculateTotalBlockingTime(metrics) { return null; }
  estimateSpeedIndex(metrics) { return null; }
  estimateVitalsImprovement(vitals) { return 'medium'; }
  estimateResourceImpact(resources) { return 'medium'; }
  estimateLoadingImpact(loading) { return 'medium'; }
  calculateOverallImpact(impacts) { return 'medium'; }

  identifyVitalsImprovements(analysis) {
    const improvements = [];
    
    Object.entries(analysis).forEach(([metric, data]) => {
      if (data?.status === 'poor' || data?.status === 'needs-improvement') {
        improvements.push({
          metric,
          currentStatus: data.status,
          targetStatus: 'good',
          optimizations: data.optimizations || []
        });
      }
    });

    return improvements;
  }
}

export default PerformanceOptimizationAnalyzer;
