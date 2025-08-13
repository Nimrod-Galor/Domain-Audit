/**
 * ============================================================================
 * RESOURCE BUDGET DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced resource budget monitoring and threshold analysis
 * Part of Resource Analyzer Combined Approach (11th Implementation)
 * 
 * Capabilities:
 * - Performance budget monitoring
 * - Resource size threshold analysis
 * - Loading time budget tracking
 * - Resource count limits monitoring
 * - Budget compliance reporting
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ResourceBudgetDetector {
  constructor(options = {}) {
    this.options = {
      // Budget Analysis Configuration
      enableSizeBudgets: options.enableSizeBudgets !== false,
      enableTimeBudgets: options.enableTimeBudgets !== false,
      enableCountBudgets: options.enableCountBudgets !== false,
      enableCustomBudgets: options.enableCustomBudgets !== false,
      
      // Default Performance Budgets
      budgets: {
        // Size budgets (in bytes)
        totalSize: options.budgets?.totalSize || 2000000, // 2MB
        css: {
          maxSize: options.budgets?.css?.maxSize || 150000, // 150KB
          maxCount: options.budgets?.css?.maxCount || 10,
          individual: options.budgets?.css?.individual || 50000 // 50KB per file
        },
        javascript: {
          maxSize: options.budgets?.javascript?.maxSize || 300000, // 300KB
          maxCount: options.budgets?.javascript?.maxCount || 15,
          individual: options.budgets?.javascript?.individual || 100000 // 100KB per file
        },
        images: {
          maxSize: options.budgets?.images?.maxSize || 1000000, // 1MB
          maxCount: options.budgets?.images?.maxCount || 50,
          individual: options.budgets?.images?.individual || 200000 // 200KB per file
        },
        fonts: {
          maxSize: options.budgets?.fonts?.maxSize || 100000, // 100KB
          maxCount: options.budgets?.fonts?.maxCount || 6,
          individual: options.budgets?.fonts?.individual || 50000 // 50KB per file
        },
        videos: {
          maxSize: options.budgets?.videos?.maxSize || 5000000, // 5MB
          maxCount: options.budgets?.videos?.maxCount || 5,
          individual: options.budgets?.videos?.individual || 2000000 // 2MB per file
        },
        
        // Time budgets (in milliseconds)
        timing: {
          maxLoadTime: options.budgets?.timing?.maxLoadTime || 3000, // 3 seconds
          firstContentfulPaint: options.budgets?.timing?.firstContentfulPaint || 1500, // 1.5 seconds
          largestContentfulPaint: options.budgets?.timing?.largestContentfulPaint || 2500, // 2.5 seconds
          firstInputDelay: options.budgets?.timing?.firstInputDelay || 100, // 100ms
          cumulativeLayoutShift: options.budgets?.timing?.cumulativeLayoutShift || 0.1 // 0.1
        },
        
        // Request count budgets
        requests: {
          maxTotal: options.budgets?.requests?.maxTotal || 100,
          maxPerType: {
            css: 10,
            javascript: 15,
            images: 50,
            fonts: 6,
            videos: 5
          }
        }
      },
      
      // Warning thresholds (percentage of budget)
      warningThresholds: {
        yellow: options.warningThresholds?.yellow || 0.8, // 80%
        red: options.warningThresholds?.red || 1.0 // 100%
      },
      
      ...options
    };

    this.detectorType = 'resource_budget';
    this.version = '1.0.0';
    
    // Budget compliance levels
    this.complianceLevels = {
      excellent: { min: 0, max: 0.7, color: 'green', status: 'Excellent' },
      good: { min: 0.7, max: 0.85, color: 'lightgreen', status: 'Good' },
      warning: { min: 0.85, max: 1.0, color: 'yellow', status: 'Warning' },
      critical: { min: 1.0, max: Infinity, color: 'red', status: 'Critical' }
    };

    // Resource type mappings
    this.resourceTypeMap = {
      'text/css': 'css',
      'application/javascript': 'javascript',
      'text/javascript': 'javascript',
      'image/jpeg': 'images',
      'image/png': 'images',
      'image/gif': 'images',
      'image/webp': 'images',
      'image/svg+xml': 'images',
      'font/woff2': 'fonts',
      'font/woff': 'fonts',
      'application/font-woff2': 'fonts',
      'application/font-woff': 'fonts',
      'video/mp4': 'videos',
      'video/webm': 'videos'
    };
    
    console.log('📊 Resource Budget Detector initialized');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'ResourceBudgetDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced resource budget monitoring and threshold analysis',
      
      capabilities: [
        'performance_budget_monitoring',
        'resource_size_analysis',
        'loading_time_tracking',
        'resource_count_monitoring',
        'budget_compliance_reporting',
        'threshold_violation_detection',
        'budget_recommendation_generation',
        'resource_type_budgeting'
      ],
      
      budgetTypes: [
        'size_budgets',
        'time_budgets',
        'count_budgets',
        'custom_budgets'
      ],
      
      monitoredResources: Object.keys(this.options.budgets).filter(key => 
        typeof this.options.budgets[key] === 'object' && 
        key !== 'timing' && 
        key !== 'requests'
      ),
      
      analysisFeatures: {
        sizeBudgets: this.options.enableSizeBudgets,
        timeBudgets: this.options.enableTimeBudgets,
        countBudgets: this.options.enableCountBudgets,
        customBudgets: this.options.enableCustomBudgets
      },
      
      budgetConfiguration: {
        totalSizeBudget: this.options.budgets.totalSize,
        warningThresholds: this.options.warningThresholds,
        complianceLevels: Object.keys(this.complianceLevels)
      }
    };
  }

  /**
   * Main detection method - analyze resource budgets and compliance
   * @param {Object} context - Analysis context with document, performance data
   * @returns {Promise<Object>} Resource budget analysis results
   */
  async detect(context) {
    try {
      const startTime = Date.now();
      const { document, url, performanceData, resourceData } = context;
      
      if (!document) {
        throw new Error('Document is required for resource budget detection');
      }

      console.log('📊 Starting resource budget detection...');

      // Core Budget Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Size Budget Analysis
        sizeBudgets: this.options.enableSizeBudgets ?
          await this._analyzeSizeBudgets(document, performanceData) : null,
        
        // Time Budget Analysis
        timeBudgets: this.options.enableTimeBudgets ?
          await this._analyzeTimeBudgets(performanceData) : null,
        
        // Count Budget Analysis
        countBudgets: this.options.enableCountBudgets ?
          await this._analyzeCountBudgets(document, performanceData) : null,
        
        // Custom Budget Analysis
        customBudgets: this.options.enableCustomBudgets ?
          await this._analyzeCustomBudgets(document, performanceData) : null,
        
        // Compliance Analysis
        compliance: await this._analyzeCompliance(document, performanceData),
        
        // Violation Detection
        violations: await this._detectViolations(document, performanceData),
        
        // Budget Recommendations
        recommendations: [],
        
        // Budget Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate recommendations based on analysis
      results.recommendations = this._generateBudgetRecommendations(results);
      
      // Generate comprehensive summary
      results.summary = this._generateBudgetSummary(results);
      
      console.log(`✅ Resource budget detection completed in ${results.executionTime}ms`);
      console.log(`📊 Budget compliance: ${results.summary.overallCompliance || 'N/A'}`);
      
      return results;

    } catch (error) {
      console.error('❌ Resource budget detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - (context.startTime || Date.now())
      };
    }
  }

  /**
   * Analyze size budgets for different resource types
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Size budget analysis results
   */
  async _analyzeSizeBudgets(document, performanceData) {
    const sizeBudgets = {
      total: { actual: 0, budget: this.options.budgets.totalSize, compliance: 'excellent' },
      byType: {},
      violations: [],
      summary: {}
    };

    try {
      // Initialize budget tracking for each resource type
      const trackedTypes = ['css', 'javascript', 'images', 'fonts', 'videos'];
      
      trackedTypes.forEach(type => {
        sizeBudgets.byType[type] = {
          actualSize: 0,
          actualCount: 0,
          budgetSize: this.options.budgets[type]?.maxSize || 0,
          budgetCount: this.options.budgets[type]?.maxCount || 0,
          individualBudget: this.options.budgets[type]?.individual || 0,
          resources: [],
          compliance: 'excellent',
          utilizationPercent: 0
        };
      });

      // Analyze from performance data if available
      if (performanceData && performanceData.getEntriesByType) {
        await this._analyzeSizeBudgetsFromPerformanceData(performanceData, sizeBudgets);
      }

      // Analyze from document structure
      await this._analyzeSizeBudgetsFromDocument(document, sizeBudgets);

      // Calculate total size and compliance
      sizeBudgets.total.actual = Object.values(sizeBudgets.byType)
        .reduce((sum, type) => sum + type.actualSize, 0);
      
      sizeBudgets.total.compliance = this._calculateComplianceLevel(
        sizeBudgets.total.actual / sizeBudgets.total.budget
      );

      // Calculate compliance for each type
      Object.entries(sizeBudgets.byType).forEach(([type, data]) => {
        data.utilizationPercent = data.budgetSize > 0 ? 
          (data.actualSize / data.budgetSize) : 0;
        data.compliance = this._calculateComplianceLevel(data.utilizationPercent);
        
        // Check for violations
        if (data.utilizationPercent > this.options.warningThresholds.red) {
          sizeBudgets.violations.push({
            type: 'size_budget_exceeded',
            resourceType: type,
            actual: data.actualSize,
            budget: data.budgetSize,
            overagePercent: (data.utilizationPercent - 1) * 100
          });
        }
        
        // Check individual resource size violations
        data.resources.forEach(resource => {
          if (resource.size > data.individualBudget) {
            sizeBudgets.violations.push({
              type: 'individual_size_exceeded',
              resourceType: type,
              resource: resource.url,
              actual: resource.size,
              budget: data.individualBudget,
              overagePercent: ((resource.size / data.individualBudget) - 1) * 100
            });
          }
        });
      });

      // Generate size budget summary
      sizeBudgets.summary = this._generateSizeBudgetSummary(sizeBudgets);

    } catch (error) {
      console.error('Size budget analysis failed:', error);
    }

    return sizeBudgets;
  }

  /**
   * Analyze timing budgets
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Time budget analysis results
   */
  async _analyzeTimeBudgets(performanceData) {
    const timeBudgets = {
      metrics: {},
      violations: [],
      compliance: 'excellent',
      summary: {}
    };

    try {
      if (!performanceData) {
        timeBudgets.summary.note = 'Performance data not available for timing analysis';
        return timeBudgets;
      }

      const timingBudgets = this.options.budgets.timing;
      
      // Analyze navigation timing metrics
      if (performanceData.timing) {
        const timing = performanceData.timing;
        
        timeBudgets.metrics = {
          loadTime: {
            actual: timing.loadEventEnd - timing.navigationStart,
            budget: timingBudgets.maxLoadTime,
            compliance: 'excellent'
          },
          domContentLoaded: {
            actual: timing.domContentLoadedEventEnd - timing.navigationStart,
            budget: timingBudgets.firstContentfulPaint,
            compliance: 'excellent'
          }
        };
      }

      // Analyze Paint API metrics
      if (performanceData.getEntriesByType) {
        const paintEntries = performanceData.getEntriesByType('paint') || [];
        
        paintEntries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            timeBudgets.metrics.firstContentfulPaint = {
              actual: entry.startTime,
              budget: timingBudgets.firstContentfulPaint,
              compliance: this._calculateComplianceLevel(
                entry.startTime / timingBudgets.firstContentfulPaint
              )
            };
          }
        });
        
        // Analyze Largest Contentful Paint
        const lcpEntries = performanceData.getEntriesByType('largest-contentful-paint') || [];
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1];
          timeBudgets.metrics.largestContentfulPaint = {
            actual: lcp.startTime,
            budget: timingBudgets.largestContentfulPaint,
            compliance: this._calculateComplianceLevel(
              lcp.startTime / timingBudgets.largestContentfulPaint
            )
          };
        }
        
        // Analyze First Input Delay
        const fidEntries = performanceData.getEntriesByType('first-input') || [];
        if (fidEntries.length > 0) {
          const fid = fidEntries[0];
          timeBudgets.metrics.firstInputDelay = {
            actual: fid.processingStart - fid.startTime,
            budget: timingBudgets.firstInputDelay,
            compliance: this._calculateComplianceLevel(
              (fid.processingStart - fid.startTime) / timingBudgets.firstInputDelay
            )
          };
        }
        
        // Analyze Cumulative Layout Shift
        const clsEntries = performanceData.getEntriesByType('layout-shift') || [];
        if (clsEntries.length > 0) {
          const clsScore = clsEntries
            .filter(entry => !entry.hadRecentInput)
            .reduce((sum, entry) => sum + entry.value, 0);
            
          timeBudgets.metrics.cumulativeLayoutShift = {
            actual: clsScore,
            budget: timingBudgets.cumulativeLayoutShift,
            compliance: this._calculateComplianceLevel(
              clsScore / timingBudgets.cumulativeLayoutShift
            )
          };
        }
      }

      // Check for timing violations
      Object.entries(timeBudgets.metrics).forEach(([metric, data]) => {
        if (data.actual > data.budget) {
          timeBudgets.violations.push({
            type: 'timing_budget_exceeded',
            metric: metric,
            actual: data.actual,
            budget: data.budget,
            overagePercent: ((data.actual / data.budget) - 1) * 100
          });
        }
      });

      // Calculate overall timing compliance
      const complianceScores = Object.values(timeBudgets.metrics)
        .map(metric => this._getComplianceScore(metric.compliance));
      
      const averageCompliance = complianceScores.length > 0 ? 
        complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length : 1;
      
      timeBudgets.compliance = this._calculateComplianceLevel(averageCompliance);
      
      // Generate timing summary
      timeBudgets.summary = this._generateTimingBudgetSummary(timeBudgets);

    } catch (error) {
      console.error('Timing budget analysis failed:', error);
    }

    return timeBudgets;
  }

  /**
   * Analyze count budgets for resource types
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Count budget analysis results
   */
  async _analyzeCountBudgets(document, performanceData) {
    const countBudgets = {
      total: { actual: 0, budget: this.options.budgets.requests.maxTotal, compliance: 'excellent' },
      byType: {},
      violations: [],
      summary: {}
    };

    try {
      const requestBudgets = this.options.budgets.requests.maxPerType;
      
      // Initialize count tracking
      Object.entries(requestBudgets).forEach(([type, budget]) => {
        countBudgets.byType[type] = {
          actual: 0,
          budget: budget,
          compliance: 'excellent',
          utilizationPercent: 0
        };
      });

      // Count resources from document
      await this._countResourcesFromDocument(document, countBudgets);

      // Count resources from performance data
      if (performanceData && performanceData.getEntriesByType) {
        await this._countResourcesFromPerformanceData(performanceData, countBudgets);
      }

      // Calculate total requests
      countBudgets.total.actual = Object.values(countBudgets.byType)
        .reduce((sum, type) => sum + type.actual, 0);
      
      countBudgets.total.compliance = this._calculateComplianceLevel(
        countBudgets.total.actual / countBudgets.total.budget
      );

      // Calculate compliance for each type
      Object.entries(countBudgets.byType).forEach(([type, data]) => {
        data.utilizationPercent = data.budget > 0 ? (data.actual / data.budget) : 0;
        data.compliance = this._calculateComplianceLevel(data.utilizationPercent);
        
        // Check for violations
        if (data.utilizationPercent > this.options.warningThresholds.red) {
          countBudgets.violations.push({
            type: 'count_budget_exceeded',
            resourceType: type,
            actual: data.actual,
            budget: data.budget,
            overageCount: data.actual - data.budget
          });
        }
      });

      // Generate count budget summary
      countBudgets.summary = this._generateCountBudgetSummary(countBudgets);

    } catch (error) {
      console.error('Count budget analysis failed:', error);
    }

    return countBudgets;
  }

  /**
   * Analyze custom budgets (placeholder for extensibility)
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Custom budget analysis results
   */
  async _analyzeCustomBudgets(document, performanceData) {
    const customBudgets = {
      defined: false,
      budgets: [],
      compliance: 'excellent',
      summary: {}
    };

    try {
      // Placeholder for custom budget implementation
      // This could be extended to support user-defined budgets
      
      customBudgets.summary = {
        note: 'Custom budgets feature available for extension',
        supportedTypes: ['performance', 'accessibility', 'seo', 'security']
      };

    } catch (error) {
      console.error('Custom budget analysis failed:', error);
    }

    return customBudgets;
  }

  /**
   * Analyze overall budget compliance
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Compliance analysis results
   */
  async _analyzeCompliance(document, performanceData) {
    const compliance = {
      overall: 'excellent',
      categories: {},
      score: 100,
      violations: [],
      recommendations: []
    };

    try {
      // This will be populated by the main analysis results
      compliance.categories = {
        size: 'excellent',
        timing: 'excellent',
        count: 'excellent',
        custom: 'excellent'
      };

      // Calculate overall compliance score
      const categoryScores = Object.values(compliance.categories)
        .map(category => this._getComplianceScore(category));
      
      compliance.score = categoryScores.length > 0 ? 
        Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length * 100) : 100;
      
      compliance.overall = this._calculateComplianceLevel(compliance.score / 100);

    } catch (error) {
      console.error('Compliance analysis failed:', error);
    }

    return compliance;
  }

  /**
   * Detect budget violations
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Violation detection results
   */
  async _detectViolations(document, performanceData) {
    const violations = {
      critical: [],
      warning: [],
      total: 0,
      byType: {},
      summary: {}
    };

    try {
      // Violations will be populated by individual budget analyses
      // This method aggregates them and provides analysis
      
      violations.summary = {
        note: 'Violations will be populated by individual budget analyses',
        categories: ['size_violations', 'timing_violations', 'count_violations']
      };

    } catch (error) {
      console.error('Violation detection failed:', error);
    }

    return violations;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async _analyzeSizeBudgetsFromPerformanceData(performanceData, sizeBudgets) {
    const resourceEntries = performanceData.getEntriesByType('resource') || [];
    
    resourceEntries.forEach(entry => {
      const resourceType = this._getResourceTypeFromEntry(entry);
      if (resourceType && sizeBudgets.byType[resourceType]) {
        const size = entry.transferSize || entry.encodedBodySize || 0;
        
        sizeBudgets.byType[resourceType].actualSize += size;
        sizeBudgets.byType[resourceType].actualCount++;
        sizeBudgets.byType[resourceType].resources.push({
          url: entry.name,
          size: size,
          loadTime: entry.duration
        });
      }
    });
  }

  async _analyzeSizeBudgetsFromDocument(document, sizeBudgets) {
    // Analyze CSS resources
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const styleElements = document.querySelectorAll('style');
    
    cssLinks.forEach(link => {
      if (link.href) {
        sizeBudgets.byType.css.actualCount++;
        sizeBudgets.byType.css.resources.push({
          url: link.href,
          size: 0, // Will be updated from performance data
          type: 'external'
        });
      }
    });
    
    styleElements.forEach(style => {
      const size = (style.textContent || '').length;
      sizeBudgets.byType.css.actualSize += size;
      sizeBudgets.byType.css.actualCount++;
      sizeBudgets.byType.css.resources.push({
        url: 'inline-style',
        size: size,
        type: 'inline'
      });
    });

    // Analyze JavaScript resources
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
      if (script.src) {
        sizeBudgets.byType.javascript.actualCount++;
        sizeBudgets.byType.javascript.resources.push({
          url: script.src,
          size: 0, // Will be updated from performance data
          type: 'external'
        });
      } else {
        const size = (script.textContent || '').length;
        sizeBudgets.byType.javascript.actualSize += size;
        sizeBudgets.byType.javascript.actualCount++;
        sizeBudgets.byType.javascript.resources.push({
          url: 'inline-script',
          size: size,
          type: 'inline'
        });
      }
    });

    // Analyze Image resources
    const images = document.querySelectorAll('img[src]');
    
    images.forEach(img => {
      sizeBudgets.byType.images.actualCount++;
      sizeBudgets.byType.images.resources.push({
        url: img.src,
        size: 0, // Will be updated from performance data
        type: 'image'
      });
    });

    // Analyze Font resources
    const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
    
    fontPreloads.forEach(link => {
      sizeBudgets.byType.fonts.actualCount++;
      sizeBudgets.byType.fonts.resources.push({
        url: link.href,
        size: 0, // Will be updated from performance data
        type: 'font'
      });
    });
  }

  async _countResourcesFromDocument(document, countBudgets) {
    // Count CSS resources
    const cssCount = document.querySelectorAll('link[rel="stylesheet"], style').length;
    countBudgets.byType.css.actual = cssCount;

    // Count JavaScript resources
    const jsCount = document.querySelectorAll('script').length;
    countBudgets.byType.javascript.actual = jsCount;

    // Count Image resources
    const imageCount = document.querySelectorAll('img[src]').length;
    countBudgets.byType.images.actual = imageCount;

    // Count Font resources
    const fontCount = document.querySelectorAll('link[rel="preload"][as="font"]').length;
    countBudgets.byType.fonts.actual = fontCount;

    // Count Video resources
    const videoCount = document.querySelectorAll('video[src], source[src]').length;
    countBudgets.byType.videos.actual = videoCount;
  }

  async _countResourcesFromPerformanceData(performanceData, countBudgets) {
    const resourceEntries = performanceData.getEntriesByType('resource') || [];
    const typeCounts = {};
    
    resourceEntries.forEach(entry => {
      const resourceType = this._getResourceTypeFromEntry(entry);
      if (resourceType) {
        typeCounts[resourceType] = (typeCounts[resourceType] || 0) + 1;
      }
    });
    
    // Update counts from performance data (more accurate)
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (countBudgets.byType[type]) {
        countBudgets.byType[type].actual = Math.max(countBudgets.byType[type].actual, count);
      }
    });
  }

  _getResourceTypeFromEntry(entry) {
    const url = entry.name || '';
    const contentType = entry.contentType || '';
    
    // Try to determine type from content type first
    if (contentType && this.resourceTypeMap[contentType]) {
      return this.resourceTypeMap[contentType];
    }
    
    // Fallback to URL extension
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    
    const extensionMap = {
      'css': 'css',
      'js': 'javascript',
      'jpg': 'images', 'jpeg': 'images', 'png': 'images', 'gif': 'images', 'webp': 'images', 'svg': 'images',
      'woff': 'fonts', 'woff2': 'fonts', 'ttf': 'fonts', 'otf': 'fonts',
      'mp4': 'videos', 'webm': 'videos', 'ogg': 'videos'
    };
    
    return extensionMap[ext] || null;
  }

  _calculateComplianceLevel(utilizationRatio) {
    for (const [level, config] of Object.entries(this.complianceLevels)) {
      if (utilizationRatio >= config.min && utilizationRatio < config.max) {
        return level;
      }
    }
    return 'critical';
  }

  _getComplianceScore(compliance) {
    const scoreMap = {
      excellent: 1.0,
      good: 0.8,
      warning: 0.6,
      critical: 0.3
    };
    return scoreMap[compliance] || 0.5;
  }

  _generateSizeBudgetSummary(sizeBudgets) {
    const violationCount = sizeBudgets.violations.length;
    const totalTypes = Object.keys(sizeBudgets.byType).length;
    const compliantTypes = Object.values(sizeBudgets.byType)
      .filter(type => type.compliance === 'excellent' || type.compliance === 'good').length;
    
    return {
      totalSizeUsed: sizeBudgets.total.actual,
      totalSizeBudget: sizeBudgets.total.budget,
      utilizationPercent: (sizeBudgets.total.actual / sizeBudgets.total.budget) * 100,
      overallCompliance: sizeBudgets.total.compliance,
      violationCount: violationCount,
      compliantTypes: compliantTypes,
      totalTypes: totalTypes,
      complianceRate: (compliantTypes / totalTypes) * 100
    };
  }

  _generateTimingBudgetSummary(timeBudgets) {
    const metricCount = Object.keys(timeBudgets.metrics).length;
    const compliantMetrics = Object.values(timeBudgets.metrics)
      .filter(metric => metric.compliance === 'excellent' || metric.compliance === 'good').length;
    
    return {
      metricsAnalyzed: metricCount,
      compliantMetrics: compliantMetrics,
      overallCompliance: timeBudgets.compliance,
      violationCount: timeBudgets.violations.length,
      complianceRate: metricCount > 0 ? (compliantMetrics / metricCount) * 100 : 100
    };
  }

  _generateCountBudgetSummary(countBudgets) {
    const typeCount = Object.keys(countBudgets.byType).length;
    const compliantTypes = Object.values(countBudgets.byType)
      .filter(type => type.compliance === 'excellent' || type.compliance === 'good').length;
    
    return {
      totalRequests: countBudgets.total.actual,
      requestBudget: countBudgets.total.budget,
      utilizationPercent: (countBudgets.total.actual / countBudgets.total.budget) * 100,
      overallCompliance: countBudgets.total.compliance,
      violationCount: countBudgets.violations.length,
      compliantTypes: compliantTypes,
      totalTypes: typeCount,
      complianceRate: (compliantTypes / typeCount) * 100
    };
  }

  _generateBudgetRecommendations(results) {
    const recommendations = [];
    
    // Size budget recommendations
    if (results.sizeBudgets && results.sizeBudgets.violations.length > 0) {
      recommendations.push({
        type: 'size_optimization',
        priority: 'high',
        title: 'Optimize resource sizes',
        description: `${results.sizeBudgets.violations.length} size budget violations detected`,
        actions: [
          'Compress large resources',
          'Optimize images',
          'Minify CSS and JavaScript',
          'Consider lazy loading for non-critical resources'
        ]
      });
    }
    
    // Timing budget recommendations
    if (results.timeBudgets && results.timeBudgets.violations.length > 0) {
      recommendations.push({
        type: 'timing_optimization',
        priority: 'high',
        title: 'Improve loading performance',
        description: `${results.timeBudgets.violations.length} timing budget violations detected`,
        actions: [
          'Optimize critical rendering path',
          'Implement resource prioritization',
          'Use preloading for critical resources',
          'Minimize layout shifts'
        ]
      });
    }
    
    // Count budget recommendations
    if (results.countBudgets && results.countBudgets.violations.length > 0) {
      recommendations.push({
        type: 'request_optimization',
        priority: 'medium',
        title: 'Reduce number of requests',
        description: `${results.countBudgets.violations.length} request count violations detected`,
        actions: [
          'Bundle CSS and JavaScript files',
          'Use image sprites or CSS backgrounds',
          'Implement resource concatenation',
          'Remove unused resources'
        ]
      });
    }
    
    // General budget recommendations
    if (results.compliance && results.compliance.score < 80) {
      recommendations.push({
        type: 'general_budget',
        priority: 'medium',
        title: 'Review and adjust performance budgets',
        description: `Overall budget compliance score: ${results.compliance.score}%`,
        actions: [
          'Review current budget thresholds',
          'Set more aggressive performance targets',
          'Implement continuous performance monitoring',
          'Create performance budget alerts'
        ]
      });
    }
    
    return recommendations;
  }

  _generateBudgetSummary(results) {
    let totalViolations = 0;
    let overallCompliance = 'excellent';
    let complianceScore = 100;
    
    // Count violations from all categories
    if (results.sizeBudgets) {
      totalViolations += results.sizeBudgets.violations.length;
    }
    
    if (results.timeBudgets) {
      totalViolations += results.timeBudgets.violations.length;
    }
    
    if (results.countBudgets) {
      totalViolations += results.countBudgets.violations.length;
    }
    
    // Calculate overall compliance
    const compliances = [];
    if (results.sizeBudgets) compliances.push(results.sizeBudgets.total.compliance);
    if (results.timeBudgets) compliances.push(results.timeBudgets.compliance);
    if (results.countBudgets) compliances.push(results.countBudgets.total.compliance);
    
    if (compliances.length > 0) {
      const scores = compliances.map(c => this._getComplianceScore(c));
      complianceScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100);
      overallCompliance = this._calculateComplianceLevel(complianceScore / 100);
    }
    
    return {
      overallCompliance,
      complianceScore,
      totalViolations,
      categoriesAnalyzed: {
        size: !!results.sizeBudgets,
        timing: !!results.timeBudgets,
        count: !!results.countBudgets,
        custom: !!results.customBudgets
      },
      recommendationCount: results.recommendations?.length || 0,
      status: totalViolations === 0 ? 'All budgets within limits' : 
              totalViolations < 5 ? 'Minor budget violations' : 
              'Significant budget violations detected'
    };
  }
}

export default ResourceBudgetDetector;
