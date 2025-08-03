/**
 * ============================================================================
 * CORE WEB VITALS ANALYZER MODULE
 * ============================================================================
 * 
 * This module analyzes Core Web Vitals and performance metrics for web pages.
 * Since we're running server-side, we simulate some metrics based on available data.
 * 
 * Core Web Vitals:
 * - Largest Contentful Paint (LCP) - Loading performance
 * - First Input Delay (FID) - Interactivity 
 * - Cumulative Layout Shift (CLS) - Visual stability
 * 
 * Additional Performance Metrics:
 * - First Contentful Paint (FCP)
 * - Time to First Byte (TTFB)
 * - Speed Index (estimated)
 * - Total Blocking Time (TBT)
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

/**
 * Core Web Vitals scoring thresholds (Google's standards)
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    GOOD: 2500,      // <= 2.5s
    NEEDS_IMPROVEMENT: 4000  // <= 4.0s, >4.0s is poor
  },
  FID: {
    GOOD: 100,       // <= 100ms
    NEEDS_IMPROVEMENT: 300   // <= 300ms, >300ms is poor
  },
  CLS: {
    GOOD: 0.1,       // <= 0.1
    NEEDS_IMPROVEMENT: 0.25  // <= 0.25, >0.25 is poor
  },
  FCP: {
    GOOD: 1800,      // <= 1.8s
    NEEDS_IMPROVEMENT: 3000  // <= 3.0s, >3.0s is poor
  },
  TTFB: {
    GOOD: 800,       // <= 800ms
    NEEDS_IMPROVEMENT: 1800  // <= 1.8s, >1.8s is poor
  }
};

/**
 * Web Vitals Analyzer Class
 */
export class WebVitalsAnalyzer {
  constructor(options = {}) {
    this.config = {
      enableEstimation: options.enableEstimation !== false,
      includeServerMetrics: options.includeServerMetrics !== false,
      ...options
    };
  }

  /**
   * Analyze Core Web Vitals for a page
   * @param {Object} pageData - Page data including DOM, headers, content
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} pageSize - Page size in bytes
   * @returns {Object} Web vitals analysis
   */
  analyzeWebVitals(pageData, responseTime, pageSize) {
    try {
      const analysis = {
        // Core Web Vitals
        lcp: this._estimateLCP(pageData, responseTime, pageSize),
        fid: this._estimateFID(pageData),
        cls: this._estimateCLS(pageData),
        
        // Additional Performance Metrics
        fcp: this._estimateFCP(responseTime, pageSize),
        ttfb: this._estimateTTFB(responseTime),
        speedIndex: this._estimateSpeedIndex(pageData, responseTime, pageSize),
        tbt: this._estimateTotalBlockingTime(pageData),
        
        // Performance Score
        performanceScore: 0,
        
        // Recommendations
        recommendations: [],
        
        // Analysis metadata
        analysisMethod: 'server-side-estimation',
        timestamp: new Date().toISOString()
      };

      // Calculate overall performance score
      analysis.performanceScore = this._calculatePerformanceScore(analysis);
      
      // Generate recommendations
      analysis.recommendations = this._generateRecommendations(analysis, pageData);
      
      return analysis;
      
    } catch (error) {
      return {
        error: `Web Vitals analysis failed: ${error.message}`,
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        performanceScore: 0,
        recommendations: [],
        analysisMethod: 'failed'
      };
    }
  }

  /**
   * Estimate Largest Contentful Paint (LCP)
   * Based on response time, page size, and content analysis
   */
  _estimateLCP(pageData, responseTime, pageSize) {
    let estimatedLCP = responseTime;
    
    // Factor in page size (larger pages typically have slower LCP)
    const sizeFactorMs = Math.min(pageSize / 1024 / 100, 2000); // Cap at 2s
    estimatedLCP += sizeFactorMs;
    
    // Factor in image count (more images = potentially slower LCP)
    const imageCount = pageData?.content?.images?.total || 0;
    if (imageCount > 10) {
      estimatedLCP += Math.min((imageCount - 10) * 50, 1000); // Cap at 1s additional
    }
    
    // Factor in external resources
    const externalResources = pageData?.technical?.resources?.externalCSS || 0;
    estimatedLCP += externalResources * 100; // 100ms per external CSS
    
    // Factor in compression
    const hasCompression = pageData?.performance?.compression === 'gzip' || 
                          pageData?.performance?.compression === 'brotli';
    if (!hasCompression && pageSize > 100000) { // 100KB
      estimatedLCP += 500; // Add 500ms penalty for uncompressed large pages
    }
    
    return {
      value: Math.round(estimatedLCP),
      rating: this._getRating(estimatedLCP, WEB_VITALS_THRESHOLDS.LCP),
      unit: 'ms',
      factors: {
        baseResponseTime: responseTime,
        sizeImpact: Math.round(sizeFactorMs),
        imageImpact: imageCount > 10 ? Math.min((imageCount - 10) * 50, 1000) : 0,
        resourceImpact: externalResources * 100,
        compressionImpact: (!hasCompression && pageSize > 100000) ? 500 : 0
      }
    };
  }

  /**
   * Estimate First Input Delay (FID)
   * Based on JavaScript analysis and page complexity
   */
  _estimateFID(pageData) {
    let estimatedFID = 50; // Base FID estimate
    
    // Factor in JavaScript resources
    const externalJS = pageData?.technical?.resources?.externalJS || 0;
    const inlineJS = pageData?.technical?.resources?.inlineJS || 0;
    
    estimatedFID += externalJS * 20; // 20ms per external JS
    estimatedFID += inlineJS * 10;   // 10ms per inline JS
    
    // Factor in form complexity
    const hasComplexForms = pageData?.accessibility?.forms?.total > 5;
    if (hasComplexForms) {
      estimatedFID += 30;
    }
    
    // Factor in interactive elements
    const focusableElements = pageData?.accessibility?.focus?.focusableElements || 0;
    if (focusableElements > 50) {
      estimatedFID += Math.min((focusableElements - 50) * 2, 100);
    }
    
    return {
      value: Math.round(estimatedFID),
      rating: this._getRating(estimatedFID, WEB_VITALS_THRESHOLDS.FID),
      unit: 'ms',
      factors: {
        baseEstimate: 50,
        jsImpact: (externalJS * 20) + (inlineJS * 10),
        formImpact: hasComplexForms ? 30 : 0,
        interactivityImpact: focusableElements > 50 ? Math.min((focusableElements - 50) * 2, 100) : 0
      }
    };
  }

  /**
   * Estimate Cumulative Layout Shift (CLS)
   * Based on page structure and content analysis
   */
  _estimateCLS(pageData) {
    let estimatedCLS = 0.05; // Base CLS estimate (good by default)
    
    // Factor in images without dimensions
    const imagesWithoutAlt = pageData?.content?.images?.withoutAlt || 0;
    const totalImages = pageData?.content?.images?.total || 1;
    const imageRatio = imagesWithoutAlt / totalImages;
    
    if (imageRatio > 0.3) { // More than 30% images without proper handling
      estimatedCLS += 0.1;
    }
    
    // Factor in external stylesheets (can cause layout shifts)
    const externalCSS = pageData?.technical?.resources?.externalCSS || 0;
    if (externalCSS > 5) {
      estimatedCLS += Math.min((externalCSS - 5) * 0.02, 0.1);
    }
    
    // Factor in responsive design
    const isResponsive = pageData?.mobileFriendliness?.viewport?.isResponsive;
    if (!isResponsive) {
      estimatedCLS += 0.1; // Non-responsive sites often have layout shifts
    }
    
    // Factor in form elements without labels (accessibility issue that can cause shifts)
    const missingLabels = pageData?.accessibility?.forms?.missingLabels || 0;
    if (missingLabels > 0) {
      estimatedCLS += Math.min(missingLabels * 0.01, 0.05);
    }
    
    return {
      value: Math.round(estimatedCLS * 1000) / 1000, // Round to 3 decimal places
      rating: this._getRating(estimatedCLS, WEB_VITALS_THRESHOLDS.CLS),
      unit: 'score',
      factors: {
        baseEstimate: 0.05,
        imageImpact: imageRatio > 0.3 ? 0.1 : 0,
        cssImpact: externalCSS > 5 ? Math.min((externalCSS - 5) * 0.02, 0.1) : 0,
        responsiveImpact: !isResponsive ? 0.1 : 0,
        accessibilityImpact: missingLabels > 0 ? Math.min(missingLabels * 0.01, 0.05) : 0
      }
    };
  }

  /**
   * Estimate First Contentful Paint (FCP)
   */
  _estimateFCP(responseTime, pageSize) {
    // FCP is typically faster than LCP, usually around 70% of response time + size factor
    let estimatedFCP = responseTime * 0.7;
    
    // Add size impact (smaller than LCP impact)
    const sizeFactorMs = Math.min(pageSize / 1024 / 200, 1000);
    estimatedFCP += sizeFactorMs;
    
    return {
      value: Math.round(estimatedFCP),
      rating: this._getRating(estimatedFCP, WEB_VITALS_THRESHOLDS.FCP),
      unit: 'ms'
    };
  }

  /**
   * Estimate Time to First Byte (TTFB)
   */
  _estimateTTFB(responseTime) {
    // TTFB is typically 20-30% of total response time
    const estimatedTTFB = responseTime * 0.25;
    
    return {
      value: Math.round(estimatedTTFB),
      rating: this._getRating(estimatedTTFB, WEB_VITALS_THRESHOLDS.TTFB),
      unit: 'ms'
    };
  }

  /**
   * Estimate Speed Index
   */
  _estimateSpeedIndex(pageData, responseTime, pageSize) {
    // Speed Index estimation based on content and resources
    let estimatedSI = responseTime * 1.2;
    
    // Factor in resource count
    const totalResources = pageData?.technical?.resources?.totalResources || 0;
    estimatedSI += totalResources * 50;
    
    // Factor in image count
    const imageCount = pageData?.content?.images?.total || 0;
    estimatedSI += imageCount * 100;
    
    return {
      value: Math.round(estimatedSI),
      rating: estimatedSI <= 3400 ? 'good' : estimatedSI <= 5800 ? 'needs-improvement' : 'poor',
      unit: 'ms'
    };
  }

  /**
   * Estimate Total Blocking Time (TBT)
   */
  _estimateTotalBlockingTime(pageData) {
    // Estimate based on JavaScript resources
    const externalJS = pageData?.technical?.resources?.externalJS || 0;
    const inlineJS = pageData?.technical?.resources?.inlineJS || 0;
    
    let estimatedTBT = externalJS * 50 + inlineJS * 20;
    
    return {
      value: Math.round(estimatedTBT),
      rating: estimatedTBT <= 200 ? 'good' : estimatedTBT <= 600 ? 'needs-improvement' : 'poor',
      unit: 'ms'
    };
  }

  /**
   * Calculate overall performance score (0-100)
   */
  _calculatePerformanceScore(analysis) {
    const weights = {
      lcp: 0.25,    // 25%
      fid: 0.25,    // 25%
      cls: 0.25,    // 25%
      fcp: 0.15,    // 15%
      ttfb: 0.10    // 10%
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    // Calculate weighted score for each metric
    Object.entries(weights).forEach(([metric, weight]) => {
      const metricData = analysis[metric];
      if (metricData && metricData.rating) {
        let score = 0;
        switch (metricData.rating) {
          case 'good': score = 90; break;
          case 'needs-improvement': score = 50; break;
          case 'poor': score = 25; break;
        }
        totalScore += score * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Generate performance recommendations
   */
  _generateRecommendations(analysis, pageData) {
    const recommendations = [];
    
    // LCP recommendations
    if (analysis.lcp?.rating === 'poor') {
      recommendations.push({
        type: 'lcp',
        priority: 'high',
        title: 'Improve Largest Contentful Paint',
        description: `LCP is ${analysis.lcp.value}ms (target: <2500ms)`,
        suggestions: [
          'Optimize server response times',
          'Enable compression (gzip/brotli)',
          'Optimize images and use modern formats (WebP, AVIF)',
          'Remove unused CSS and JavaScript',
          'Use a CDN for faster content delivery'
        ]
      });
    }
    
    // FID recommendations
    if (analysis.fid?.rating === 'poor') {
      recommendations.push({
        type: 'fid',
        priority: 'high',
        title: 'Improve First Input Delay',
        description: `FID is ${analysis.fid.value}ms (target: <100ms)`,
        suggestions: [
          'Minimize JavaScript execution time',
          'Remove unused JavaScript',
          'Split long-running tasks',
          'Use web workers for heavy computations',
          'Optimize third-party scripts'
        ]
      });
    }
    
    // CLS recommendations
    if (analysis.cls?.rating === 'poor') {
      recommendations.push({
        type: 'cls',
        priority: 'high',
        title: 'Improve Cumulative Layout Shift',
        description: `CLS is ${analysis.cls.value} (target: <0.1)`,
        suggestions: [
          'Set size attributes on images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS aspect ratio for responsive images',
          'Preload fonts to prevent font swapping'
        ]
      });
    }
    
    // Compression recommendation
    const hasCompression = pageData?.performance?.compression === 'gzip' || 
                          pageData?.performance?.compression === 'brotli';
    if (!hasCompression) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        title: 'Enable Compression',
        description: 'Page is not using gzip or brotli compression',
        suggestions: [
          'Enable gzip compression on the server',
          'Consider brotli compression for even better results',
          'Compress HTML, CSS, and JavaScript files'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Get rating based on thresholds
   */
  _getRating(value, thresholds) {
    if (value <= thresholds.GOOD) return 'good';
    if (value <= thresholds.NEEDS_IMPROVEMENT) return 'needs-improvement';
    return 'poor';
  }
}

export default WebVitalsAnalyzer;
