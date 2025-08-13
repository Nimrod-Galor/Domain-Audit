/**
 * Performance Metrics Detector - Combined Approach Component
 * 
 * GPT-5 Style: Focused detection component for Core Web Vitals and performance metrics
 * Detects and measures performance metrics for comprehensive analysis
 * 
 * @version 1.0.0
 * @author Performance Team
 */

export class MetricsDetector {
  constructor(options = {}) {
    this.options = {
      enableRealUserMetrics: options.enableRealUserMetrics !== false,
      trackNavigationTiming: options.trackNavigationTiming !== false,
      measureResourceTiming: options.measureResourceTiming !== false,
      ...options
    };
  }

  /**
   * Detect all performance metrics available in the browser
   * @param {Object} context - Analysis context
   * @returns {Object} Detected performance metrics
   */
  async detectMetrics(context) {
    const metrics = {
      coreWebVitals: await this.detectCoreWebVitals(context),
      navigationTiming: this.options.trackNavigationTiming ? 
        this.detectNavigationTiming() : null,
      resourceTiming: this.options.measureResourceTiming ? 
        this.detectResourceTiming() : null,
      paintMetrics: this.detectPaintMetrics(),
      layoutShift: this.detectLayoutShift(),
      longTasks: this.detectLongTasks(),
      memoryUsage: this.detectMemoryUsage()
    };

    return {
      metrics,
      summary: this.summarizeMetrics(metrics),
      performance: this.calculatePerformanceScore(metrics),
      recommendations: this.generateMetricsRecommendations(metrics)
    };
  }

  /**
   * Detect Core Web Vitals metrics
   */
  async detectCoreWebVitals(context) {
    const vitals = {
      lcp: await this.measureLargestContentfulPaint(context),
      fid: await this.measureFirstInputDelay(),
      cls: await this.measureCumulativeLayoutShift(),
      fcp: await this.measureFirstContentfulPaint(),
      ttfb: await this.measureTimeToFirstByte(),
      inp: await this.measureInteractionToNextPaint()
    };

    return {
      ...vitals,
      scores: this.calculateWebVitalsScores(vitals),
      status: this.assessWebVitalsStatus(vitals)
    };
  }

  /**
   * Measure Largest Contentful Paint (LCP)
   */
  async measureLargestContentfulPaint(context) {
    return new Promise((resolve) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
          resolve({
            value: null,
            element: null,
            timestamp: Date.now(),
            source: 'not-supported'
          });
          return;
        }

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          resolve({
            value: lastEntry ? lastEntry.startTime : null,
            element: lastEntry ? this.describeLCPElement(lastEntry.element) : null,
            timestamp: Date.now(),
            source: 'PerformanceObserver'
          });
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Fallback timeout
        setTimeout(() => {
          resolve({
            value: null,
            element: null,
            timestamp: Date.now(),
            source: 'timeout'
          });
        }, 5000);
      } catch (error) {
        resolve({
          value: null,
          element: null,
          timestamp: Date.now(),
          source: 'error',
          error: error.message
        });
      }
    });
  }

  /**
   * Measure First Input Delay (FID)
   */
  async measureFirstInputDelay() {
    return new Promise((resolve) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
          resolve({
            value: null,
            timestamp: Date.now(),
            source: 'not-supported'
          });
          return;
        }

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          
          resolve({
            value: firstEntry ? firstEntry.processingStart - firstEntry.startTime : null,
            timestamp: Date.now(),
            source: 'PerformanceObserver'
          });
        });

        observer.observe({ type: 'first-input', buffered: true });

        // Set timeout for no interaction
        setTimeout(() => {
          resolve({
            value: null,
            timestamp: Date.now(),
            source: 'no-interaction'
          });
        }, 10000);
      } catch (error) {
        resolve({
          value: null,
          timestamp: Date.now(),
          source: 'error',
          error: error.message
        });
      }
    });
  }

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  async measureCumulativeLayoutShift() {
    return new Promise((resolve) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
          resolve({
            value: null,
            timestamp: Date.now(),
            source: 'not-supported'
          });
          return;
        }

        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        // Measure for a period of time
        setTimeout(() => {
          resolve({
            value: clsValue,
            timestamp: Date.now(),
            source: 'PerformanceObserver'
          });
        }, 5000);
      } catch (error) {
        resolve({
          value: null,
          timestamp: Date.now(),
          source: 'error',
          error: error.message
        });
      }
    });
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  async measureFirstContentfulPaint() {
    try {
      // Check if we're in a browser environment
      if (typeof performance === 'undefined') {
        return {
          value: null,
          timestamp: Date.now(),
          source: 'not-supported'
        };
      }

      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        value: fcpEntry ? fcpEntry.startTime : null,
        timestamp: Date.now(),
        source: 'Performance API'
      };
    } catch (error) {
      return {
        value: null,
        timestamp: Date.now(),
        source: 'error',
        error: error.message
      };
    }
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  async measureTimeToFirstByte() {
    try {
      // Check if we're in a browser environment
      if (typeof performance === 'undefined') {
        return {
          value: null,
          timestamp: Date.now(),
          source: 'not-supported'
        };
      }

      const navigationEntry = performance.getEntriesByType('navigation')[0];
      const ttfb = navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : null;
      
      return {
        value: ttfb,
        timestamp: Date.now(),
        source: 'Navigation Timing API'
      };
    } catch (error) {
      return {
        value: null,
        timestamp: Date.now(),
        source: 'error',
        error: error.message
      };
    }
  }

  /**
   * Measure Interaction to Next Paint (INP)
   */
  async measureInteractionToNextPaint() {
    return new Promise((resolve) => {
      try {
        let maxINP = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const inp = entry.processingEnd - entry.startTime;
            maxINP = Math.max(maxINP, inp);
          }
        });

        observer.observe({ type: 'event', buffered: true });

        setTimeout(() => {
          resolve({
            value: maxINP || null,
            timestamp: Date.now(),
            source: 'PerformanceObserver'
          });
        }, 10000);
      } catch (error) {
        resolve({
          value: null,
          timestamp: Date.now(),
          source: 'error',
          error: error.message
        });
      }
    });
  }

  /**
   * Detect Navigation Timing metrics
   */
  detectNavigationTiming() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) return null;

      return {
        redirectTime: navigation.redirectEnd - navigation.redirectStart,
        dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
        connectTime: navigation.connectEnd - navigation.connectStart,
        requestTime: navigation.responseStart - navigation.requestStart,
        responseTime: navigation.responseEnd - navigation.responseStart,
        domParseTime: navigation.domContentLoadedEventStart - navigation.responseEnd,
        domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.navigationStart
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect Resource Timing metrics
   */
  detectResourceTiming() {
    try {
      const resources = performance.getEntriesByType('resource');
      
      return {
        totalResources: resources.length,
        slowestResources: resources
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 10)
          .map(resource => ({
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize || 0,
            type: this.getResourceType(resource)
          })),
        resourceTypes: this.analyzeResourceTypes(resources),
        averageLoadTime: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect Paint metrics
   */
  detectPaintMetrics() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const metrics = {};
      
      paintEntries.forEach(entry => {
        metrics[entry.name.replace(/-/g, '_')] = entry.startTime;
      });

      return metrics;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect Layout Shift events
   */
  detectLayoutShift() {
    try {
      const layoutShifts = performance.getEntriesByType('layout-shift');
      
      return {
        totalShifts: layoutShifts.length,
        significantShifts: layoutShifts.filter(shift => shift.value > 0.1).length,
        maxShift: Math.max(...layoutShifts.map(shift => shift.value), 0),
        impactedElements: layoutShifts.length > 0 ? 
          layoutShifts[0].sources?.length || 0 : 0
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect Long Tasks
   */
  detectLongTasks() {
    try {
      const longTasks = performance.getEntriesByType('longtask');
      
      return {
        count: longTasks.length,
        totalTime: longTasks.reduce((sum, task) => sum + task.duration, 0),
        maxDuration: Math.max(...longTasks.map(task => task.duration), 0),
        averageDuration: longTasks.length > 0 ? 
          longTasks.reduce((sum, task) => sum + task.duration, 0) / longTasks.length : 0
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect Memory Usage
   */
  detectMemoryUsage() {
    try {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          memoryPressure: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Helper methods

  describeLCPElement(element) {
    if (!element) return null;
    
    return {
      tagName: element.tagName,
      id: element.id || null,
      className: element.className || null,
      src: element.src || null,
      textContent: element.textContent ? element.textContent.substring(0, 100) : null
    };
  }

  calculateWebVitalsScores(vitals) {
    const scores = {};
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (vitals.lcp.value !== null) {
      scores.lcp = vitals.lcp.value <= 2500 ? 'good' : 
                   vitals.lcp.value <= 4000 ? 'needs-improvement' : 'poor';
    }

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (vitals.fid.value !== null) {
      scores.fid = vitals.fid.value <= 100 ? 'good' : 
                   vitals.fid.value <= 300 ? 'needs-improvement' : 'poor';
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (vitals.cls.value !== null) {
      scores.cls = vitals.cls.value <= 0.1 ? 'good' : 
                   vitals.cls.value <= 0.25 ? 'needs-improvement' : 'poor';
    }

    return scores;
  }

  assessWebVitalsStatus(vitals) {
    const scores = this.calculateWebVitalsScores(vitals);
    const values = Object.values(scores);
    
    if (values.every(score => score === 'good')) return 'excellent';
    if (values.some(score => score === 'poor')) return 'poor';
    if (values.some(score => score === 'needs-improvement')) return 'needs-improvement';
    return 'good';
  }

  getResourceType(resource) {
    const url = resource.name.toLowerCase();
    
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    if (url.match(/\.(mp4|webm|mov)$/)) return 'video';
    
    return 'other';
  }

  analyzeResourceTypes(resources) {
    const types = {};
    
    resources.forEach(resource => {
      const type = this.getResourceType(resource);
      types[type] = types[type] || { count: 0, totalSize: 0, totalTime: 0 };
      types[type].count++;
      types[type].totalSize += resource.transferSize || 0;
      types[type].totalTime += resource.duration;
    });

    return types;
  }

  summarizeMetrics(metrics) {
    const summary = {
      coreWebVitalsStatus: metrics.coreWebVitals?.status || 'unknown',
      performanceIssues: [],
      strengths: []
    };

    // Identify performance issues
    if (metrics.coreWebVitals?.scores.lcp === 'poor') {
      summary.performanceIssues.push('Large Contentful Paint is too slow');
    }
    if (metrics.coreWebVitals?.scores.fid === 'poor') {
      summary.performanceIssues.push('First Input Delay is too high');
    }
    if (metrics.coreWebVitals?.scores.cls === 'poor') {
      summary.performanceIssues.push('Cumulative Layout Shift is excessive');
    }

    // Identify strengths
    if (metrics.coreWebVitals?.scores.lcp === 'good') {
      summary.strengths.push('Fast content loading');
    }
    if (metrics.coreWebVitals?.scores.fid === 'good') {
      summary.strengths.push('Responsive user interactions');
    }
    if (metrics.coreWebVitals?.scores.cls === 'good') {
      summary.strengths.push('Stable visual layout');
    }

    return summary;
  }

  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // Deduct points for poor Core Web Vitals
    if (metrics.coreWebVitals?.scores.lcp === 'poor') score -= 25;
    else if (metrics.coreWebVitals?.scores.lcp === 'needs-improvement') score -= 10;
    
    if (metrics.coreWebVitals?.scores.fid === 'poor') score -= 25;
    else if (metrics.coreWebVitals?.scores.fid === 'needs-improvement') score -= 10;
    
    if (metrics.coreWebVitals?.scores.cls === 'poor') score -= 25;
    else if (metrics.coreWebVitals?.scores.cls === 'needs-improvement') score -= 10;

    // Deduct points for long tasks
    if (metrics.longTasks?.count > 5) score -= 10;
    
    // Deduct points for memory pressure
    if (metrics.memoryUsage?.memoryPressure > 0.8) score -= 5;

    return Math.max(0, score);
  }

  generateMetricsRecommendations(metrics) {
    const recommendations = [];

    if (metrics.coreWebVitals?.scores.lcp !== 'good') {
      recommendations.push({
        type: 'lcp-optimization',
        priority: 'high',
        description: 'Optimize Largest Contentful Paint by reducing server response times and optimizing critical resources'
      });
    }

    if (metrics.coreWebVitals?.scores.fid !== 'good') {
      recommendations.push({
        type: 'fid-optimization',
        priority: 'high',
        description: 'Improve First Input Delay by reducing JavaScript execution time and breaking up long tasks'
      });
    }

    if (metrics.coreWebVitals?.scores.cls !== 'good') {
      recommendations.push({
        type: 'cls-optimization',
        priority: 'high',
        description: 'Reduce Cumulative Layout Shift by setting dimensions for images and ads, and avoiding dynamic content insertion'
      });
    }

    if (metrics.longTasks?.count > 3) {
      recommendations.push({
        type: 'long-tasks',
        priority: 'medium',
        description: 'Break up long-running JavaScript tasks to improve responsiveness'
      });
    }

    return recommendations;
  }
}

export default MetricsDetector;
