/**
 * Core Web Vitals Analyzer
 * Comprehensive analysis of Core Web Vitals and performance metrics
 * 
 * @fileoverview Advanced performance analysis focusing on Core Web Vitals optimization
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 * 
 * FEATURES:
 * - Core Web Vitals analysis (LCP, FID, CLS)
 * - Additional performance metrics (FCP, TTFB, Speed Index, TBT)
 * - Performance scoring and recommendations
 * - Google Core Web Vitals standards compliance
 * - Server-side performance estimation
 * - Optimization recommendations generation
 */

import { BaseAnalyzer } from '../analyzers/core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../analyzers/core/AnalyzerInterface.js';

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
 * Core Web Vitals Analyzer
 * Provides comprehensive Core Web Vitals and performance metrics analysis
 */
export class WebVitalsAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('WebVitalsAnalyzer', {
      enableEstimation: options.enableEstimation !== false,
      includeServerMetrics: options.includeServerMetrics !== false,
      ...options
    });
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'WebVitalsAnalyzer',
      version: '1.0.0',
      description: 'Analyzes Core Web Vitals and performance metrics for optimal user experience',
      category: AnalyzerCategories.PERFORMANCE,
      priority: 'high'
    };
  }

  /**
   * Analyze Core Web Vitals and performance metrics
   * @param {Document} document - DOM document
   * @param {Object} pageData - Existing page data including response time and size
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Core Web Vitals analysis
   */
  async analyze(document, pageData = {}, url = '') {
    return this.measureTime(async () => {
      try {
        this.log('info', 'Starting Core Web Vitals analysis...');
        
        // Extract performance data from pageData or estimate
        const responseTime = pageData.responseTime || 1000;
        const pageSize = pageData.contentLength || 100000;
        
        return this.analyzeWebVitals(pageData, responseTime, pageSize);
      } catch (error) {
        return this.handleError(error, 'Core Web Vitals analysis');
      }
    }).then(({ result, time }) => {
      if (result.error) {
        return result;
      }
      return this.createSuccessResponse(result, time);
    });
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
      this.log('info', 'Analyzing Core Web Vitals metrics...');

      const analysis = {
        // Core Web Vitals
        coreWebVitals: {
          lcp: this._estimateLCP(pageData, responseTime, pageSize),
          fid: this._estimateFID(pageData),
          cls: this._estimateCLS(pageData)
        },
        
        // Additional Performance Metrics
        additionalMetrics: {
          fcp: this._estimateFCP(responseTime, pageSize),
          ttfb: this._estimateTTFB(responseTime),
          speedIndex: this._estimateSpeedIndex(pageData, responseTime, pageSize),
          tbt: this._estimateTotalBlockingTime(pageData)
        },
        
        // Performance Analysis
        performance: {
          score: 0,
          overall: 'poor',
          passedVitals: 0,
          totalVitals: 3,
          metrics: {}
        },
        
        // Recommendations
        recommendations: [],
        
        // Summary
        summary: {
          issues: [],
          strengths: [],
          optimizationOpportunities: []
        },
        
        // Analysis metadata
        metadata: {
          analysisMethod: 'server-side-estimation',
          timestamp: new Date().toISOString(),
          thresholds: WEB_VITALS_THRESHOLDS
        }
      };

      // Calculate performance metrics and scoring
      this._calculatePerformanceMetrics(analysis);
      
      // Generate recommendations
      analysis.recommendations = this._generateRecommendations(analysis, pageData);
      
      // Generate summary
      this._generateAnalysisSummary(analysis);
      
      this.log('info', `Core Web Vitals analysis completed - Score: ${analysis.performance.score}/100`);
      
      return analysis;
      
    } catch (error) {
      this.log('error', `Core Web Vitals analysis failed: ${error.message}`);
      return this.handleError(error, 'Core Web Vitals analysis');
    }
  }

  /**
   * Estimate Largest Contentful Paint (LCP)
   * Based on response time, page size, and content analysis
   * @param {Object} pageData - Page data
   * @param {number} responseTime - Response time in ms
   * @param {number} pageSize - Page size in bytes
   * @returns {Object} LCP analysis
   * @private
   */
  _estimateLCP(pageData, responseTime, pageSize) {
    let estimatedLCP = responseTime;
    
    // Factor in page size (larger pages typically have slower LCP)
    const sizeFactorMs = Math.min(pageSize / 1024 / 100, 2000); // Cap at 2s
    estimatedLCP += sizeFactorMs;
    
    // Factor in image count (more images = potentially slower LCP)
    const imageCount = this._extractImageCount(pageData);
    if (imageCount > 10) {
      estimatedLCP += Math.min((imageCount - 10) * 50, 1000); // Cap at 1s additional
    }
    
    // Factor in external resources
    const externalResources = this._extractExternalResources(pageData);
    estimatedLCP += externalResources * 100; // 100ms per external CSS
    
    // Factor in compression
    const hasCompression = this._hasCompression(pageData);
    if (!hasCompression && pageSize > 100000) { // 100KB
      estimatedLCP += 500; // Add 500ms penalty for uncompressed large pages
    }
    
    const factors = {
      baseResponseTime: responseTime,
      sizeImpact: Math.round(sizeFactorMs),
      imageImpact: imageCount > 10 ? Math.min((imageCount - 10) * 50, 1000) : 0,
      resourceImpact: externalResources * 100,
      compressionImpact: (!hasCompression && pageSize > 100000) ? 500 : 0
    };
    
    const finalLCP = Math.round(estimatedLCP);
    const rating = this._getRating(finalLCP, WEB_VITALS_THRESHOLDS.LCP);
    
    return {
      value: finalLCP,
      rating,
      unit: 'ms',
      factors,
      threshold: WEB_VITALS_THRESHOLDS.LCP,
      passed: rating === 'good'
    };
  }

  /**
   * Estimate First Input Delay (FID)
   * Based on JavaScript analysis and page complexity
   * @param {Object} pageData - Page data
   * @returns {Object} FID analysis
   * @private
   */
  _estimateFID(pageData) {
    let estimatedFID = 50; // Base FID estimate
    
    // Factor in JavaScript resources
    const jsMetrics = this._extractJavaScriptMetrics(pageData);
    estimatedFID += jsMetrics.external * 20; // 20ms per external JS
    estimatedFID += jsMetrics.inline * 10;   // 10ms per inline JS
    
    // Factor in form complexity
    const formMetrics = this._extractFormMetrics(pageData);
    if (formMetrics.total > 5) {
      estimatedFID += 30;
    }
    
    // Factor in interactive elements
    const interactiveElements = this._extractInteractiveElements(pageData);
    if (interactiveElements > 50) {
      estimatedFID += Math.min((interactiveElements - 50) * 2, 100);
    }
    
    const factors = {
      baseEstimate: 50,
      jsImpact: (jsMetrics.external * 20) + (jsMetrics.inline * 10),
      formImpact: formMetrics.total > 5 ? 30 : 0,
      interactivityImpact: interactiveElements > 50 ? Math.min((interactiveElements - 50) * 2, 100) : 0
    };
    
    const finalFID = Math.round(estimatedFID);
    const rating = this._getRating(finalFID, WEB_VITALS_THRESHOLDS.FID);
    
    return {
      value: finalFID,
      rating,
      unit: 'ms',
      factors,
      threshold: WEB_VITALS_THRESHOLDS.FID,
      passed: rating === 'good'
    };
  }

  /**
   * Estimate Cumulative Layout Shift (CLS)
   * Based on page structure and content analysis
   * @param {Object} pageData - Page data
   * @returns {Object} CLS analysis
   * @private
   */
  _estimateCLS(pageData) {
    let estimatedCLS = 0.05; // Base CLS estimate (good by default)
    
    // Factor in images without dimensions
    const imageMetrics = this._extractImageMetrics(pageData);
    const imageRatio = imageMetrics.withoutAlt / Math.max(imageMetrics.total, 1);
    
    if (imageRatio > 0.3) { // More than 30% images without proper handling
      estimatedCLS += 0.1;
    }
    
    // Factor in external stylesheets (can cause layout shifts)
    const cssMetrics = this._extractCSSMetrics(pageData);
    if (cssMetrics.external > 5) {
      estimatedCLS += Math.min((cssMetrics.external - 5) * 0.02, 0.1);
    }
    
    // Factor in responsive design
    const responsiveMetrics = this._extractResponsiveMetrics(pageData);
    if (!responsiveMetrics.isResponsive) {
      estimatedCLS += 0.1; // Non-responsive sites often have layout shifts
    }
    
    // Factor in form elements without labels
    const accessibilityMetrics = this._extractAccessibilityMetrics(pageData);
    if (accessibilityMetrics.missingLabels > 0) {
      estimatedCLS += Math.min(accessibilityMetrics.missingLabels * 0.01, 0.05);
    }
    
    const factors = {
      baseEstimate: 0.05,
      imageImpact: imageRatio > 0.3 ? 0.1 : 0,
      cssImpact: cssMetrics.external > 5 ? Math.min((cssMetrics.external - 5) * 0.02, 0.1) : 0,
      responsiveImpact: !responsiveMetrics.isResponsive ? 0.1 : 0,
      accessibilityImpact: accessibilityMetrics.missingLabels > 0 ? Math.min(accessibilityMetrics.missingLabels * 0.01, 0.05) : 0
    };
    
    const finalCLS = Math.round(estimatedCLS * 1000) / 1000; // Round to 3 decimal places
    const rating = this._getRating(finalCLS, WEB_VITALS_THRESHOLDS.CLS);
    
    return {
      value: finalCLS,
      rating,
      unit: 'score',
      factors,
      threshold: WEB_VITALS_THRESHOLDS.CLS,
      passed: rating === 'good'
    };
  }

  /**
   * Estimate First Contentful Paint (FCP)
   * @param {number} responseTime - Response time in ms
   * @param {number} pageSize - Page size in bytes
   * @returns {Object} FCP analysis
   * @private
   */
  _estimateFCP(responseTime, pageSize) {
    // FCP is typically faster than LCP, usually around 70% of response time + size factor
    let estimatedFCP = responseTime * 0.7;
    
    // Add size impact (smaller than LCP impact)
    const sizeFactorMs = Math.min(pageSize / 1024 / 200, 1000);
    estimatedFCP += sizeFactorMs;
    
    const finalFCP = Math.round(estimatedFCP);
    const rating = this._getRating(finalFCP, WEB_VITALS_THRESHOLDS.FCP);
    
    return {
      value: finalFCP,
      rating,
      unit: 'ms',
      threshold: WEB_VITALS_THRESHOLDS.FCP,
      passed: rating === 'good'
    };
  }

  /**
   * Estimate Time to First Byte (TTFB)
   * @param {number} responseTime - Response time in ms
   * @returns {Object} TTFB analysis
   * @private
   */
  _estimateTTFB(responseTime) {
    // TTFB is typically 20-30% of total response time
    const estimatedTTFB = responseTime * 0.25;
    
    const finalTTFB = Math.round(estimatedTTFB);
    const rating = this._getRating(finalTTFB, WEB_VITALS_THRESHOLDS.TTFB);
    
    return {
      value: finalTTFB,
      rating,
      unit: 'ms',
      threshold: WEB_VITALS_THRESHOLDS.TTFB,
      passed: rating === 'good'
    };
  }

  /**
   * Estimate Speed Index
   * @param {Object} pageData - Page data
   * @param {number} responseTime - Response time in ms
   * @param {number} pageSize - Page size in bytes
   * @returns {Object} Speed Index analysis
   * @private
   */
  _estimateSpeedIndex(pageData, responseTime, pageSize) {
    // Speed Index estimation based on content and resources
    let estimatedSI = responseTime * 1.2;
    
    // Factor in resource count
    const resourceMetrics = this._extractResourceMetrics(pageData);
    estimatedSI += resourceMetrics.total * 50;
    
    // Factor in image count
    const imageCount = this._extractImageCount(pageData);
    estimatedSI += imageCount * 100;
    
    const rating = estimatedSI <= 3400 ? 'good' : estimatedSI <= 5800 ? 'needs-improvement' : 'poor';
    
    return {
      value: Math.round(estimatedSI),
      rating,
      unit: 'ms',
      passed: rating === 'good'
    };
  }

  /**
   * Estimate Total Blocking Time (TBT)
   * @param {Object} pageData - Page data
   * @returns {Object} TBT analysis
   * @private
   */
  _estimateTotalBlockingTime(pageData) {
    // Estimate based on JavaScript resources
    const jsMetrics = this._extractJavaScriptMetrics(pageData);
    let estimatedTBT = jsMetrics.external * 50 + jsMetrics.inline * 20;
    
    const rating = estimatedTBT <= 200 ? 'good' : estimatedTBT <= 600 ? 'needs-improvement' : 'poor';
    
    return {
      value: Math.round(estimatedTBT),
      rating,
      unit: 'ms',
      passed: rating === 'good'
    };
  }

  /**
   * Calculate performance metrics and scoring
   * @param {Object} analysis - Analysis object to update
   * @private
   */
  _calculatePerformanceMetrics(analysis) {
    const { coreWebVitals, additionalMetrics } = analysis;
    
    // Count passed Core Web Vitals
    const passedVitals = Object.values(coreWebVitals).filter(metric => metric.passed).length;
    
    // Calculate performance score
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
    const allMetrics = { ...coreWebVitals, ...additionalMetrics };
    Object.entries(weights).forEach(([metric, weight]) => {
      const metricData = allMetrics[metric];
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
    
    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    // Determine overall performance
    let overall = 'poor';
    if (passedVitals === 3) overall = 'excellent';
    else if (passedVitals === 2) overall = 'good';
    else if (passedVitals === 1) overall = 'needs-improvement';
    
    // Update performance metrics
    analysis.performance = {
      score: finalScore,
      overall,
      passedVitals,
      totalVitals: 3,
      metrics: {
        lcp: coreWebVitals.lcp.value,
        fid: coreWebVitals.fid.value,
        cls: coreWebVitals.cls.value,
        fcp: additionalMetrics.fcp.value,
        ttfb: additionalMetrics.ttfb.value,
        speedIndex: additionalMetrics.speedIndex.value,
        tbt: additionalMetrics.tbt.value
      }
    };
  }

  /**
   * Generate performance recommendations
   * @param {Object} analysis - Analysis results
   * @param {Object} pageData - Page data
   * @returns {Array} Array of recommendations
   * @private
   */
  _generateRecommendations(analysis, pageData) {
    const recommendations = [];
    const { coreWebVitals, additionalMetrics } = analysis;
    
    // LCP recommendations
    if (coreWebVitals.lcp?.rating === 'poor') {
      recommendations.push({
        type: 'lcp',
        priority: 'high',
        title: 'Improve Largest Contentful Paint',
        description: `LCP is ${coreWebVitals.lcp.value}ms (target: <2500ms)`,
        impact: 'high',
        suggestions: [
          'Optimize server response times',
          'Enable compression (gzip/brotli)',
          'Optimize images and use modern formats (WebP, AVIF)',
          'Remove unused CSS and JavaScript',
          'Use a CDN for faster content delivery',
          'Preload critical resources'
        ]
      });
    }
    
    // FID recommendations
    if (coreWebVitals.fid?.rating === 'poor') {
      recommendations.push({
        type: 'fid',
        priority: 'high',
        title: 'Improve First Input Delay',
        description: `FID is ${coreWebVitals.fid.value}ms (target: <100ms)`,
        impact: 'high',
        suggestions: [
          'Minimize JavaScript execution time',
          'Remove unused JavaScript',
          'Split long-running tasks',
          'Use web workers for heavy computations',
          'Optimize third-party scripts',
          'Defer non-critical JavaScript'
        ]
      });
    }
    
    // CLS recommendations
    if (coreWebVitals.cls?.rating === 'poor') {
      recommendations.push({
        type: 'cls',
        priority: 'high',
        title: 'Improve Cumulative Layout Shift',
        description: `CLS is ${coreWebVitals.cls.value} (target: <0.1)`,
        impact: 'high',
        suggestions: [
          'Set size attributes on images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS aspect ratio for responsive images',
          'Preload fonts to prevent font swapping',
          'Include width and height attributes for media'
        ]
      });
    }
    
    // FCP recommendations
    if (additionalMetrics.fcp?.rating === 'poor') {
      recommendations.push({
        type: 'fcp',
        priority: 'medium',
        title: 'Improve First Contentful Paint',
        description: `FCP is ${additionalMetrics.fcp.value}ms (target: <1800ms)`,
        impact: 'medium',
        suggestions: [
          'Optimize critical rendering path',
          'Inline critical CSS',
          'Minimize render-blocking resources',
          'Optimize server response times'
        ]
      });
    }
    
    // TTFB recommendations
    if (additionalMetrics.ttfb?.rating === 'poor') {
      recommendations.push({
        type: 'ttfb',
        priority: 'medium',
        title: 'Improve Time to First Byte',
        description: `TTFB is ${additionalMetrics.ttfb.value}ms (target: <800ms)`,
        impact: 'medium',
        suggestions: [
          'Optimize server response times',
          'Use a CDN',
          'Enable server-side caching',
          'Optimize database queries',
          'Use a faster hosting provider'
        ]
      });
    }
    
    // Compression recommendation
    const hasCompression = this._hasCompression(pageData);
    if (!hasCompression) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        title: 'Enable Compression',
        description: 'Page is not using gzip or brotli compression',
        impact: 'medium',
        suggestions: [
          'Enable gzip compression on the server',
          'Consider brotli compression for even better results',
          'Compress HTML, CSS, and JavaScript files'
        ]
      });
    }
    
    // Resource optimization recommendation
    const resourceMetrics = this._extractResourceMetrics(pageData);
    if (resourceMetrics.total > 100) {
      recommendations.push({
        type: 'resources',
        priority: 'medium',
        title: 'Optimize Resource Loading',
        description: `Page loads ${resourceMetrics.total} resources`,
        impact: 'medium',
        suggestions: [
          'Combine CSS and JavaScript files',
          'Use resource bundling',
          'Implement lazy loading for images',
          'Remove unused resources',
          'Use HTTP/2 for better multiplexing'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Generate analysis summary
   * @param {Object} analysis - Analysis object to update
   * @private
   */
  _generateAnalysisSummary(analysis) {
    const { coreWebVitals, additionalMetrics, performance } = analysis;
    
    // Identify issues
    const issues = [];
    if (coreWebVitals.lcp.rating === 'poor') {
      issues.push(`Slow Largest Contentful Paint (${coreWebVitals.lcp.value}ms)`);
    }
    if (coreWebVitals.fid.rating === 'poor') {
      issues.push(`High First Input Delay (${coreWebVitals.fid.value}ms)`);
    }
    if (coreWebVitals.cls.rating === 'poor') {
      issues.push(`Poor Cumulative Layout Shift (${coreWebVitals.cls.value})`);
    }
    if (additionalMetrics.ttfb.rating === 'poor') {
      issues.push(`Slow Time to First Byte (${additionalMetrics.ttfb.value}ms)`);
    }
    
    // Identify strengths
    const strengths = [];
    if (coreWebVitals.lcp.rating === 'good') {
      strengths.push('Excellent Largest Contentful Paint');
    }
    if (coreWebVitals.fid.rating === 'good') {
      strengths.push('Good First Input Delay');
    }
    if (coreWebVitals.cls.rating === 'good') {
      strengths.push('Minimal Cumulative Layout Shift');
    }
    if (additionalMetrics.fcp.rating === 'good') {
      strengths.push('Fast First Contentful Paint');
    }
    if (additionalMetrics.ttfb.rating === 'good') {
      strengths.push('Good server response time');
    }
    
    // Optimization opportunities
    const optimizationOpportunities = [];
    if (performance.score < 90) {
      optimizationOpportunities.push('Optimize Core Web Vitals for better user experience');
    }
    if (performance.passedVitals < 3) {
      optimizationOpportunities.push('Focus on failing Core Web Vitals metrics');
    }
    if (additionalMetrics.speedIndex.rating !== 'good') {
      optimizationOpportunities.push('Improve perceived loading speed');
    }
    if (additionalMetrics.tbt.rating !== 'good') {
      optimizationOpportunities.push('Reduce JavaScript blocking time');
    }
    
    analysis.summary = {
      issues,
      strengths,
      optimizationOpportunities
    };
  }

  /**
   * Get rating based on thresholds
   * @param {number} value - Metric value
   * @param {Object} thresholds - Threshold configuration
   * @returns {string} Rating (good/needs-improvement/poor)
   * @private
   */
  _getRating(value, thresholds) {
    if (value <= thresholds.GOOD) return 'good';
    if (value <= thresholds.NEEDS_IMPROVEMENT) return 'needs-improvement';
    return 'poor';
  }

  // Data extraction helper methods
  
  /**
   * Extract image count from page data
   * @param {Object} pageData - Page data
   * @returns {number} Image count
   * @private
   */
  _extractImageCount(pageData) {
    return pageData?.content?.images?.total || 
           pageData?.technical?.images?.total || 
           0;
  }

  /**
   * Extract image metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} Image metrics
   * @private
   */
  _extractImageMetrics(pageData) {
    return {
      total: this._extractImageCount(pageData),
      withoutAlt: pageData?.content?.images?.withoutAlt || 
                 pageData?.accessibility?.images?.withoutAlt || 
                 0
    };
  }

  /**
   * Extract external resources count from page data
   * @param {Object} pageData - Page data
   * @returns {number} External resources count
   * @private
   */
  _extractExternalResources(pageData) {
    return pageData?.technical?.resources?.externalCSS || 
           pageData?.resources?.css?.totalExternal || 
           0;
  }

  /**
   * Extract JavaScript metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} JavaScript metrics
   * @private
   */
  _extractJavaScriptMetrics(pageData) {
    return {
      external: pageData?.technical?.resources?.externalJS || 
               pageData?.resources?.javascript?.totalExternal || 
               0,
      inline: pageData?.technical?.resources?.inlineJS || 
             pageData?.resources?.javascript?.totalInline || 
             0
    };
  }

  /**
   * Extract CSS metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} CSS metrics
   * @private
   */
  _extractCSSMetrics(pageData) {
    return {
      external: pageData?.technical?.resources?.externalCSS || 
               pageData?.resources?.css?.totalExternal || 
               0,
      inline: pageData?.technical?.resources?.inlineCSS || 
             pageData?.resources?.css?.totalInline || 
             0
    };
  }

  /**
   * Extract form metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} Form metrics
   * @private
   */
  _extractFormMetrics(pageData) {
    return {
      total: pageData?.accessibility?.forms?.total || 
            pageData?.content?.forms?.total || 
            0
    };
  }

  /**
   * Extract interactive elements count from page data
   * @param {Object} pageData - Page data
   * @returns {number} Interactive elements count
   * @private
   */
  _extractInteractiveElements(pageData) {
    return pageData?.accessibility?.focus?.focusableElements || 
           pageData?.content?.interactive?.total || 
           0;
  }

  /**
   * Extract responsive metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} Responsive metrics
   * @private
   */
  _extractResponsiveMetrics(pageData) {
    return {
      isResponsive: pageData?.mobileFriendliness?.viewport?.isResponsive ||
                   pageData?.technical?.mobile?.responsive ||
                   false
    };
  }

  /**
   * Extract accessibility metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} Accessibility metrics
   * @private
   */
  _extractAccessibilityMetrics(pageData) {
    return {
      missingLabels: pageData?.accessibility?.forms?.missingLabels || 
                    pageData?.accessibility?.labels?.missing || 
                    0
    };
  }

  /**
   * Extract resource metrics from page data
   * @param {Object} pageData - Page data
   * @returns {Object} Resource metrics
   * @private
   */
  _extractResourceMetrics(pageData) {
    return {
      total: pageData?.technical?.resources?.totalResources || 
            pageData?.resources?.summary?.totalResources || 
            0
    };
  }

  /**
   * Check if compression is enabled
   * @param {Object} pageData - Page data
   * @returns {boolean} Whether compression is enabled
   * @private
   */
  _hasCompression(pageData) {
    const compression = pageData?.performance?.compression || 
                       pageData?.headers?.compression || 
                       'none';
    return compression === 'gzip' || compression === 'brotli';
  }
}

export default WebVitalsAnalyzer;
