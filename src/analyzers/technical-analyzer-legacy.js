/**
 * ============================================================================
 * TECHNICAL ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Technical Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Technical Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Infrastructure, Architecture, Mobile, Performance)
 * - GPT-5 Style Heuristics and Rules (Technical Optimization, Compliance, Standards)
 * - Claude Style AI Enhancement (Technical Insights, Infrastructure Recommendations)
 * - Integration with Existing Components
 * - Comprehensive Technical Infrastructure Analysis
 * - Website Architecture Assessment
 * - Mobile Friendliness and Responsive Design Analysis
 * - Performance Optimization Recommendations
 * - Security and Compliance Validation
 * - Technical SEO Optimization
 * 
 * @module TechnicalAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-13
 */

// Import the modern Combined Approach implementation
import { TechnicalAnalyzerModern } from './modern/technical/technical-analyzer-modern.js';

/**
 * Technical Standards and Configuration
 */
export const TECHNICAL_STANDARDS = {
  ACCESSIBILITY: {
    MIN_ALT_TEXT_COVERAGE: 0.9,
    MIN_HEADING_STRUCTURE_SCORE: 80,
    MIN_FORM_LABEL_COVERAGE: 0.95,
    MIN_ARIA_COMPLIANCE: 0.8
  },
  MOBILE: {
    REQUIRED_VIEWPORT_ATTRIBUTES: ['width=device-width', 'initial-scale=1'],
    TOUCH_TARGET_MIN_SIZE: 44,
    RESPONSIVE_BREAKPOINTS: [320, 768, 1024, 1200]
  },
  SECURITY: {
    REQUIRED_HEADERS: ['strict-transport-security', 'content-security-policy', 'x-frame-options'],
    MIN_CSP_DIRECTIVES: 3,
    SECURE_COOKIE_ATTRIBUTES: ['secure', 'httponly', 'samesite']
  },
  PERFORMANCE: {
    MAX_RENDER_BLOCKING_RESOURCES: 5,
    MAX_EXTERNAL_RESOURCES: 20,
    MAX_INLINE_SCRIPTS: 3,
    MAX_CSS_FILES: 10
  }
};

/**
 * Technical Analyzer Class
 * 
 * Exports the modern Combined Approach implementation as the main Technical Analyzer.
 * This maintains compatibility while providing advanced technical analysis capabilities.
 */
export class TechnicalAnalyzer extends TechnicalAnalyzerModern {
  constructor(options = {}) {
    super(options);
    
    // Override name for consistency
    this.name = 'TechnicalAnalyzer';
    
    console.log('🔧 Technical Analyzer initialized with Combined Approach');
    console.log(`📊 Analysis scope: ${Object.entries(this.getMetadata().capabilities).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
    console.log(`⚙️ Features enabled: ${Object.entries(this.getMetadata().features).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  }
}

// Legacy compatibility - export the Combined Approach implementation as default
export default TechnicalAnalyzer; 
            this._analyzeSecurity(document, headers, url) : null,
          performance: this.options.enablePerformanceAnalysis ? 
            this._analyzePerformance(document, url) : null,
          summary: {},
          recommendations: [],
          existingData: pageData.technical || {},
          analysisTimestamp: new Date().toISOString(),
          analyzerVersion: this.version
        };

        // Generate summary statistics
        analysis.summary = this._generateTechnicalSummary(analysis);
        
        // Generate recommendations if enabled
        if (this.options.includeRecommendations) {
          analysis.recommendations = this._generateTechnicalRecommendations(analysis);
        }
        
        // Calculate overall technical score
        analysis.overallScore = this._calculateOverallTechnicalScore(analysis);
        analysis.categoryScores = this._calculateCategoryScores(analysis);
        analysis.technicalMetrics = this._analyzeTechnicalMetrics(analysis);
        
        this.log(`Technical analysis completed - Overall score: ${analysis.overallScore}/100`, 'info');
        
        return {
          success: true,
          data: analysis,
          metadata: this.getMetadata(),
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        return this.handleError('Technical analysis failed', error, {
          infrastructure: null,
          architecture: null,
          accessibility: null,
          mobile: null,
          security: null,
          performance: null,
          summary: {},
          recommendations: [],
          overallScore: 0
        });
      }
    });
  }

  /**
   * Analyze technical infrastructure
   * @param {Document} document - DOM document
   * @param {Object} headers - Response headers
   * @returns {Object} Infrastructure analysis
   * @private
   */
  _analyzeInfrastructure(document, headers) {
    const infrastructure = {
      score: 0,
      elements: {},
      issues: [],
      strengths: []
    };

    try {
      // Viewport analysis
      infrastructure.elements.viewport = this._analyzeViewport(document);
      
      // Character encoding analysis
      infrastructure.elements.charset = this._analyzeCharset(document);
      
      // Resource analysis
      infrastructure.elements.resources = this._analyzeResources(document);
      
      // Server and technology analysis
      infrastructure.elements.server = this._analyzeServerTechnology(headers);
      
      // DOCTYPE analysis
      infrastructure.elements.doctype = this._analyzeDoctype(document);
      
      // Calculate infrastructure score
      infrastructure.score = this._calculateInfrastructureScore(infrastructure.elements);
      
      // Identify issues and strengths
      this._identifyInfrastructureIssues(infrastructure);
      
    } catch (error) {
      this.log(`Infrastructure analysis error: ${error.message}`, 'warn');
      infrastructure.error = error.message;
    }

    return infrastructure;
  }

  /**
   * Analyze website architecture
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Architecture analysis
   * @private
   */
  _analyzeArchitecture(document, url) {
    const architecture = {
      score: 0,
      structure: {},
      issues: [],
      strengths: []
    };

    try {
      // URL structure analysis
      architecture.structure.url = this._analyzeURLStructure(url);
      
      // Navigation structure analysis
      architecture.structure.navigation = this._analyzeNavigation(document);
      
      // Document structure analysis
      architecture.structure.document = this._analyzeDocumentStructure(document);
      
      // Semantic HTML analysis
      architecture.structure.semantics = this._analyzeSemanticHTML(document);
      
      // Link architecture analysis
      architecture.structure.links = this._analyzeLinkArchitecture(document, url);
      
      // Calculate architecture score
      architecture.score = this._calculateArchitectureScore(architecture.structure);
      
      // Identify issues and strengths
      this._identifyArchitectureIssues(architecture);
      
    } catch (error) {
      this.log(`Architecture analysis error: ${error.message}`, 'warn');
      architecture.error = error.message;
    }

    return architecture;
  }

  /**
   * Analyze accessibility compliance
   * @param {Document} document - DOM document
   * @returns {Object} Accessibility analysis
   * @private
   */
  _analyzeAccessibility(document) {
    const accessibility = {
      score: 0,
      wcag: {},
      issues: [],
      strengths: []
    };

    try {
      // Image accessibility
      accessibility.wcag.images = this._analyzeImageAccessibility(document);
      
      // Form accessibility
      accessibility.wcag.forms = this._analyzeFormAccessibility(document);
      
      // Heading structure
      accessibility.wcag.headings = this._analyzeHeadingStructure(document);
      
      // ARIA implementation
      accessibility.wcag.aria = this._analyzeARIAImplementation(document);
      
      // Color contrast (basic analysis)
      accessibility.wcag.contrast = this._analyzeColorContrast(document);
      
      // Keyboard navigation
      accessibility.wcag.keyboard = this._analyzeKeyboardNavigation(document);
      
      // Calculate accessibility score
      accessibility.score = this._calculateAccessibilityScore(accessibility.wcag);
      
      // Identify issues and strengths
      this._identifyAccessibilityIssues(accessibility);
      
    } catch (error) {
      this.log(`Accessibility analysis error: ${error.message}`, 'warn');
      accessibility.error = error.message;
    }

    return accessibility;
  }

  /**
   * Analyze mobile friendliness
   * @param {Document} document - DOM document
   * @param {Object} headers - Response headers
   * @returns {Object} Mobile analysis
   * @private
   */
  _analyzeMobileFriendliness(document, headers) {
    const mobile = {
      score: 0,
      features: {},
      issues: [],
      strengths: []
    };

    try {
      // Responsive design analysis
      mobile.features.responsive = this._analyzeResponsiveDesign(document);
      
      // Touch optimization
      mobile.features.touch = this._analyzeTouchOptimization(document);
      
      // Mobile-specific meta tags
      mobile.features.metaTags = this._analyzeMobileMetaTags(document);
      
      // App manifest analysis
      mobile.features.manifest = this._analyzeAppManifest(document);
      
      // Mobile performance considerations
      mobile.features.performance = this._analyzeMobilePerformance(document);
      
      // Calculate mobile score
      mobile.score = this._calculateMobileScore(mobile.features);
      
      // Identify issues and strengths
      this._identifyMobileIssues(mobile);
      
    } catch (error) {
      this.log(`Mobile analysis error: ${error.message}`, 'warn');
      mobile.error = error.message;
    }

    return mobile;
  }

  /**
   * Analyze security implementation
   * @param {Document} document - DOM document
   * @param {Object} headers - Response headers
   * @param {string} url - Page URL
   * @returns {Object} Security analysis
   * @private
   */
  _analyzeSecurity(document, headers, url) {
    const security = {
      score: 0,
      protocols: {},
      issues: [],
      strengths: []
    };

    try {
      // HTTPS analysis
      security.protocols.https = this._analyzeHTTPS(url, headers);
      
      // Security headers analysis
      security.protocols.headers = this._analyzeSecurityHeaders(headers);
      
      // Content Security Policy analysis
      security.protocols.csp = this._analyzeCSP(headers, document);
      
      // Mixed content analysis
      security.protocols.mixedContent = this._analyzeMixedContent(document, url);
      
      // Cookie security analysis
      security.protocols.cookies = this._analyzeCookieSecurity(headers, document);
      
      // Form security analysis
      security.protocols.forms = this._analyzeFormSecurity(document, url);
      
      // Calculate security score
      security.score = this._calculateSecurityScore(security.protocols);
      
      // Identify issues and strengths
      this._identifySecurityIssues(security);
      
    } catch (error) {
      this.log(`Security analysis error: ${error.message}`, 'warn');
      security.error = error.message;
    }

    return security;
  }

  /**
   * Analyze performance characteristics
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Performance analysis
   * @private
   */
  _analyzePerformance(document, url) {
    const performance = {
      score: 0,
      metrics: {},
      issues: [],
      strengths: []
    };

    try {
      // Resource optimization analysis
      performance.metrics.resources = this._analyzeResourceOptimization(document);
      
      // Render blocking analysis
      performance.metrics.renderBlocking = this._analyzeRenderBlocking(document);
      
      // Compression and caching analysis
      performance.metrics.optimization = this._analyzeOptimization(document);
      
      // Critical path analysis
      performance.metrics.criticalPath = this._analyzeCriticalPath(document);
      
      // Script and style analysis
      performance.metrics.scripts = this._analyzeScriptOptimization(document);
      
      // Calculate performance score
      performance.score = this._calculatePerformanceScore(performance.metrics);
      
      // Identify issues and strengths
      this._identifyPerformanceIssues(performance);
      
    } catch (error) {
      this.log(`Performance analysis error: ${error.message}`, 'warn');
      performance.error = error.message;
    }

    return performance;
  }

  /**
   * Analyze viewport configuration
   * @param {Document} document - DOM document
   * @returns {Object} Viewport analysis
   * @private
   */
  _analyzeViewport(document) {
    const viewport = {
      present: false,
      content: null,
      isResponsive: false,
      attributes: {},
      issues: []
    };

    try {
      const viewportMeta = this.safeQuery(document, 'meta[name="viewport"]')[0];
      
      if (viewportMeta) {
        viewport.present = true;
        viewport.content = viewportMeta.getAttribute('content') || '';
        
        // Parse viewport attributes
        const attributes = viewport.content.split(',').map(attr => attr.trim());
        attributes.forEach(attr => {
          const [key, value] = attr.split('=').map(s => s.trim());
          if (key && value) {
            viewport.attributes[key] = value;
          }
        });
        
        // Check for responsive design indicators
        viewport.isResponsive = 
          viewport.attributes['width'] === 'device-width' ||
          viewport.content.includes('width=device-width');
        
        if (!viewport.isResponsive) {
          viewport.issues.push('Missing device-width for responsive design');
        }
        
        if (!viewport.attributes['initial-scale']) {
          viewport.issues.push('Missing initial-scale attribute');
        }
        
      } else {
        viewport.issues.push('Missing viewport meta tag');
      }
      
    } catch (error) {
      viewport.issues.push(`Viewport analysis error: ${error.message}`);
    }

    return viewport;
  }

  /**
   * Analyze character encoding
   * @param {Document} document - DOM document
   * @returns {Object} Charset analysis
   * @private
   */
  _analyzeCharset(document) {
    const charset = {
      present: false,
      value: null,
      isUTF8: false,
      position: null,
      issues: []
    };

    try {
      // Check for charset meta tag
      const charsetMeta = this.safeQuery(document, 'meta[charset]')[0] ||
                          this.safeQuery(document, 'meta[http-equiv="content-type"]')[0];
      
      if (charsetMeta) {
        charset.present = true;
        
        if (charsetMeta.hasAttribute('charset')) {
          charset.value = charsetMeta.getAttribute('charset').toLowerCase();
        } else {
          const content = charsetMeta.getAttribute('content') || '';
          const match = content.match(/charset=([^;]+)/i);
          if (match) {
            charset.value = match[1].toLowerCase();
          }
        }
        
        charset.isUTF8 = charset.value === 'utf-8';
        
        // Check position in head (should be early)
        const headChildren = Array.from(document.head?.children || []);
        charset.position = headChildren.indexOf(charsetMeta) + 1;
        
        if (charset.position > 5) {
          charset.issues.push('Charset declaration should be earlier in head');
        }
        
        if (!charset.isUTF8) {
          charset.issues.push('Consider using UTF-8 character encoding');
        }
        
      } else {
        charset.issues.push('Missing character encoding declaration');
      }
      
    } catch (error) {
      charset.issues.push(`Charset analysis error: ${error.message}`);
    }

    return charset;
  }

  /**
   * Analyze page resources
   * @param {Document} document - DOM document
   * @returns {Object} Resources analysis
   * @private
   */
  _analyzeResources(document) {
    const resources = {
      total: 0,
      types: {},
      external: 0,
      inline: 0,
      issues: [],
      optimization: {}
    };

    try {
      // Count CSS resources
      const cssLinks = this.safeQuery(document, 'link[rel="stylesheet"]');
      const inlineCSS = this.safeQuery(document, 'style');
      
      resources.types.css = {
        external: cssLinks.length,
        inline: inlineCSS.length,
        total: cssLinks.length + inlineCSS.length
      };
      
      // Count JavaScript resources
      const scripts = this.safeQuery(document, 'script');
      const externalScripts = Array.from(scripts).filter(script => script.src);
      const inlineScripts = Array.from(scripts).filter(script => !script.src && script.textContent?.trim());
      
      resources.types.javascript = {
        external: externalScripts.length,
        inline: inlineScripts.length,
        total: scripts.length,
        async: externalScripts.filter(script => script.async).length,
        defer: externalScripts.filter(script => script.defer).length
      };
      
      // Count images
      const images = this.safeQuery(document, 'img');
      resources.types.images = {
        total: images.length,
        withAlt: Array.from(images).filter(img => img.alt).length,
        lazy: Array.from(images).filter(img => img.loading === 'lazy').length
      };
      
      // Count other resources
      resources.types.fonts = this.safeQuery(document, 'link[rel="preload"][as="font"], link[href*="fonts.googleapis.com"]').length;
      resources.types.favicons = this.safeQuery(document, 'link[rel*="icon"]').length;
      
      // Calculate totals
      resources.total = Object.values(resources.types).reduce((sum, type) => sum + (type.total || type), 0);
      resources.external = resources.types.css.external + resources.types.javascript.external;
      resources.inline = resources.types.css.inline + resources.types.javascript.inline;
      
      // Performance optimization analysis
      resources.optimization = {
        renderBlockingCSS: cssLinks.length,
        renderBlockingJS: externalScripts.filter(script => !script.async && !script.defer).length,
        unoptimizedImages: resources.types.images.total - resources.types.images.lazy,
        missingAltText: resources.types.images.total - resources.types.images.withAlt
      };
      
      // Identify issues
      if (resources.optimization.renderBlockingCSS > this.TECHNICAL_STANDARDS.PERFORMANCE.MAX_CSS_FILES) {
        resources.issues.push(`Too many CSS files (${resources.optimization.renderBlockingCSS})`);
      }
      
      if (resources.optimization.renderBlockingJS > this.TECHNICAL_STANDARDS.PERFORMANCE.MAX_RENDER_BLOCKING_RESOURCES) {
        resources.issues.push(`Too many render-blocking scripts (${resources.optimization.renderBlockingJS})`);
      }
      
      if (resources.optimization.missingAltText > 0) {
        resources.issues.push(`${resources.optimization.missingAltText} images missing alt text`);
      }
      
    } catch (error) {
      resources.issues.push(`Resource analysis error: ${error.message}`);
    }

    return resources;
  }

  /**
   * Generate technical summary
   * @param {Object} analysis - Complete technical analysis
   * @returns {Object} Technical summary
   * @private
   */
  _generateTechnicalSummary(analysis) {
    const summary = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      criticalIssues: 0,
      warnings: 0,
      categoryBreakdown: {},
      topIssues: [],
      strongPoints: []
    };

    try {
      // Analyze each category
      Object.entries(analysis).forEach(([category, data]) => {
        if (data && typeof data === 'object' && data.score !== undefined) {
          summary.categoryBreakdown[category] = {
            score: data.score,
            issues: data.issues?.length || 0,
            strengths: data.strengths?.length || 0
          };
          
          summary.totalChecks += 1;
          if (data.score >= 80) summary.passedChecks += 1;
          else summary.failedChecks += 1;
          
          // Count critical issues and warnings
          if (data.issues) {
            data.issues.forEach(issue => {
              if (typeof issue === 'object' && issue.severity === 'critical') {
                summary.criticalIssues += 1;
              } else {
                summary.warnings += 1;
              }
            });
          }
          
          // Collect top issues
          if (data.issues && data.issues.length > 0) {
            summary.topIssues.push(...data.issues.slice(0, 2));
          }
          
          // Collect strong points
          if (data.strengths && data.strengths.length > 0) {
            summary.strongPoints.push(...data.strengths.slice(0, 2));
          }
        }
      });
      
      // Limit collections
      summary.topIssues = summary.topIssues.slice(0, 5);
      summary.strongPoints = summary.strongPoints.slice(0, 5);
      
    } catch (error) {
      this.log(`Summary generation error: ${error.message}`, 'warn');
    }

    return summary;
  }

  /**
   * Generate technical recommendations
   * @param {Object} analysis - Complete technical analysis
   * @returns {Array} Technical recommendations
   * @private
   */
  _generateTechnicalRecommendations(analysis) {
    const recommendations = [];

    try {
      // Infrastructure recommendations
      if (analysis.infrastructure) {
        if (analysis.infrastructure.score < 80) {
          recommendations.push({
            category: 'infrastructure',
            priority: 'high',
            title: 'Improve Technical Infrastructure',
            description: `Infrastructure score is ${analysis.infrastructure.score}/100`,
            actions: analysis.infrastructure.issues?.slice(0, 3) || []
          });
        }
      }

      // Accessibility recommendations
      if (analysis.accessibility) {
        if (analysis.accessibility.score < 70) {
          recommendations.push({
            category: 'accessibility',
            priority: 'high',
            title: 'Address Accessibility Issues',
            description: `Accessibility score is ${analysis.accessibility.score}/100`,
            actions: analysis.accessibility.issues?.slice(0, 3) || []
          });
        }
      }

      // Mobile recommendations
      if (analysis.mobile) {
        if (analysis.mobile.score < 80) {
          recommendations.push({
            category: 'mobile',
            priority: 'medium',
            title: 'Enhance Mobile Experience',
            description: `Mobile friendliness score is ${analysis.mobile.score}/100`,
            actions: analysis.mobile.issues?.slice(0, 3) || []
          });
        }
      }

      // Security recommendations
      if (analysis.security) {
        if (analysis.security.score < 85) {
          recommendations.push({
            category: 'security',
            priority: 'critical',
            title: 'Strengthen Security Implementation',
            description: `Security score is ${analysis.security.score}/100`,
            actions: analysis.security.issues?.slice(0, 3) || []
          });
        }
      }

      // Performance recommendations
      if (analysis.performance) {
        if (analysis.performance.score < 75) {
          recommendations.push({
            category: 'performance',
            priority: 'medium',
            title: 'Optimize Technical Performance',
            description: `Performance score is ${analysis.performance.score}/100`,
            actions: analysis.performance.issues?.slice(0, 3) || []
          });
        }
      }

    } catch (error) {
      this.log(`Recommendations generation error: ${error.message}`, 'warn');
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  /**
   * Calculate overall technical score
   * @param {Object} analysis - Complete technical analysis
   * @returns {number} Overall technical score (0-100)
   * @private
   */
  _calculateOverallTechnicalScore(analysis) {
    const scores = [];
    const weights = {
      infrastructure: 0.25,
      accessibility: 0.25,
      security: 0.20,
      mobile: 0.15,
      performance: 0.10,
      architecture: 0.05
    };

    try {
      Object.entries(weights).forEach(([category, weight]) => {
        if (analysis[category] && typeof analysis[category].score === 'number') {
          scores.push({
            score: analysis[category].score,
            weight: weight
          });
        }
      });

      if (scores.length === 0) return 0;

      const weightedSum = scores.reduce((sum, { score, weight }) => sum + (score * weight), 0);
      const totalWeight = scores.reduce((sum, { weight }) => sum + weight, 0);

      return Math.round(weightedSum / totalWeight);
    } catch (error) {
      this.log(`Score calculation error: ${error.message}`, 'warn');
      return 0;
    }
  }

  /**
   * Calculate category scores
   * @param {Object} analysis - Complete technical analysis
   * @returns {Object} Category scores
   * @private
   */
  _calculateCategoryScores(analysis) {
    const categoryScores = {};

    try {
      Object.entries(analysis).forEach(([category, data]) => {
        if (data && typeof data === 'object' && typeof data.score === 'number') {
          categoryScores[category] = {
            score: data.score,
            grade: this._getGradeFromScore(data.score),
            status: this._getStatusFromScore(data.score)
          };
        }
      });
    } catch (error) {
      this.log(`Category scores calculation error: ${error.message}`, 'warn');
    }

    return categoryScores;
  }

  /**
   * Analyze technical metrics
   * @param {Object} analysis - Complete technical analysis
   * @returns {Object} Technical metrics
   * @private
   */
  _analyzeTechnicalMetrics(analysis) {
    return {
      totalAnalysisAreas: Object.keys(analysis).filter(key => 
        analysis[key] && typeof analysis[key] === 'object' && analysis[key].score !== undefined
      ).length,
      averageScore: this._calculateOverallTechnicalScore(analysis),
      analysisDepth: 'comprehensive',
      technicalCompliance: 'evaluated',
      standardsAdherence: 'assessed'
    };
  }

  /**
   * Get grade from score
   * @param {number} score - Numeric score
   * @returns {string} Letter grade
   * @private
   */
  _getGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D+';
    if (score >= 55) return 'D';
    return 'F';
  }

  /**
   * Get status from score
   * @param {number} score - Numeric score
   * @returns {string} Status description
   * @private
   */
  _getStatusFromScore(score) {
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 65) return 'fair';
    if (score >= 50) return 'poor';
    return 'critical';
  }

  // Additional helper methods for specific analysis areas would be implemented here
  // (Infrastructure scoring, architecture analysis, accessibility checks, etc.)
  // These are simplified implementations for the migration

  _calculateInfrastructureScore(elements) {
    let score = 100;
    
    if (!elements.viewport?.present) score -= 20;
    if (!elements.viewport?.isResponsive) score -= 15;
    if (!elements.charset?.present) score -= 15;
    if (!elements.charset?.isUTF8) score -= 10;
    if (elements.resources?.optimization?.renderBlockingCSS > 5) score -= 10;
    if (elements.resources?.optimization?.renderBlockingJS > 3) score -= 10;
    
    return Math.max(0, score);
  }

  _calculateArchitectureScore(structure) {
    let score = 100;
    
    if (structure.url?.depth > 5) score -= 15;
    if (structure.url?.hasParameters && structure.url.parameters > 3) score -= 10;
    if (!structure.navigation?.present) score -= 20;
    if (!structure.semantics?.usesSemanticTags) score -= 15;
    
    return Math.max(0, score);
  }

  _calculateAccessibilityScore(wcag) {
    let score = 100;
    
    if (wcag.images?.missingAltText > 0) score -= 20;
    if (wcag.forms?.missingLabels > 0) score -= 20;
    if (wcag.headings?.improperStructure) score -= 15;
    if (!wcag.aria?.implemented) score -= 15;
    
    return Math.max(0, score);
  }

  _calculateMobileScore(features) {
    let score = 100;
    
    if (!features.responsive?.isResponsive) score -= 30;
    if (!features.metaTags?.viewport) score -= 20;
    if (!features.touch?.optimized) score -= 15;
    if (!features.manifest?.present) score -= 10;
    
    return Math.max(0, score);
  }

  _calculateSecurityScore(protocols) {
    let score = 100;
    
    if (!protocols.https?.isHTTPS) score -= 40;
    if (!protocols.headers?.hasHSTS) score -= 15;
    if (!protocols.headers?.hasCSP) score -= 15;
    if (protocols.mixedContent?.hasIssues) score -= 20;
    if (!protocols.cookies?.secure) score -= 10;
    
    return Math.max(0, score);
  }

  _calculatePerformanceScore(metrics) {
    let score = 100;
    
    if (metrics.renderBlocking?.count > 5) score -= 20;
    if (metrics.resources?.unoptimized > 10) score -= 15;
    if (!metrics.optimization?.compression) score -= 15;
    if (metrics.scripts?.inline > 3) score -= 10;
    
    return Math.max(0, score);
  }

  // Simplified implementations for detailed analysis methods
  _analyzeURLStructure(url) {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        domain: urlObj.hostname,
        path: urlObj.pathname,
        depth: urlObj.pathname.split('/').filter(Boolean).length,
        hasParameters: urlObj.search.length > 0,
        parameters: new URLSearchParams(urlObj.search).size
      };
    } catch (e) {
      return { error: 'Invalid URL' };
    }
  }

  _analyzeNavigation(document) {
    const nav = this.safeQuery(document, 'nav')[0];
    return {
      present: !!nav,
      count: this.safeQuery(document, 'nav').length,
      hasAccessibleLabels: nav ? !!nav.getAttribute('aria-label') : false
    };
  }

  _analyzeDocumentStructure(document) {
    return {
      hasMain: this.safeQuery(document, 'main').length > 0,
      hasHeader: this.safeQuery(document, 'header').length > 0,
      hasFooter: this.safeQuery(document, 'footer').length > 0,
      hasAside: this.safeQuery(document, 'aside').length > 0
    };
  }

  _analyzeSemanticHTML(document) {
    const semanticTags = ['main', 'header', 'footer', 'nav', 'article', 'section', 'aside'];
    const foundTags = semanticTags.filter(tag => this.safeQuery(document, tag).length > 0);
    
    return {
      usesSemanticTags: foundTags.length > 0,
      semanticTagsFound: foundTags,
      semanticTagsCount: foundTags.length
    };
  }

  _analyzeLinkArchitecture(document, url) {
    const links = this.safeQuery(document, 'a[href]');
    return {
      totalLinks: links.length,
      internalLinks: Array.from(links).filter(link => {
        try {
          const linkUrl = new URL(link.href, url);
          const pageUrl = new URL(url);
          return linkUrl.hostname === pageUrl.hostname;
        } catch (e) {
          return false;
        }
      }).length,
      externalLinks: Array.from(links).filter(link => {
        try {
          const linkUrl = new URL(link.href, url);
          const pageUrl = new URL(url);
          return linkUrl.hostname !== pageUrl.hostname;
        } catch (e) {
          return false;
        }
      }).length
    };
  }

  _analyzeImageAccessibility(document) {
    const images = this.safeQuery(document, 'img');
    const imagesWithAlt = Array.from(images).filter(img => img.alt);
    
    return {
      totalImages: images.length,
      imagesWithAlt: imagesWithAlt.length,
      missingAltText: images.length - imagesWithAlt.length,
      altTextCoverage: images.length > 0 ? imagesWithAlt.length / images.length : 1
    };
  }

  _analyzeFormAccessibility(document) {
    const inputs = this.safeQuery(document, 'input, textarea, select');
    const inputsWithLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      const label = id ? this.safeQuery(document, `label[for="${id}"]`)[0] : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      return label || ariaLabel || ariaLabelledby;
    });
    
    return {
      totalInputs: inputs.length,
      inputsWithLabels: inputsWithLabels.length,
      missingLabels: inputs.length - inputsWithLabels.length,
      labelCoverage: inputs.length > 0 ? inputsWithLabels.length / inputs.length : 1
    };
  }

  _analyzeHeadingStructure(document) {
    const headings = this.safeQuery(document, 'h1, h2, h3, h4, h5, h6');
    const h1Count = this.safeQuery(document, 'h1').length;
    
    return {
      totalHeadings: headings.length,
      hasH1: h1Count > 0,
      multipleH1: h1Count > 1,
      improperStructure: h1Count !== 1,
      headingLevels: Array.from(headings).map(h => parseInt(h.tagName[1]))
    };
  }

  _analyzeARIAImplementation(document) {
    const ariaElements = this.safeQuery(document, '[aria-label], [aria-labelledby], [aria-describedby], [role]');
    
    return {
      implemented: ariaElements.length > 0,
      elementCount: ariaElements.length,
      hasRoles: this.safeQuery(document, '[role]').length > 0,
      hasLabels: this.safeQuery(document, '[aria-label], [aria-labelledby]').length > 0
    };
  }

  _analyzeColorContrast(document) {
    // Basic implementation - would need more sophisticated color analysis in production
    return {
      analyzed: false,
      method: 'basic',
      note: 'Advanced color contrast analysis requires runtime style computation'
    };
  }

  _analyzeKeyboardNavigation(document) {
    const focusableElements = this.safeQuery(document, 'a, button, input, textarea, select, [tabindex]');
    const elementsWithTabindex = this.safeQuery(document, '[tabindex]');
    
    return {
      focusableElements: focusableElements.length,
      customTabOrder: elementsWithTabindex.length > 0,
      hasSkipLinks: this.safeQuery(document, 'a[href^="#"]').length > 0
    };
  }

  _analyzeResponsiveDesign(document) {
    const viewport = this.safeQuery(document, 'meta[name="viewport"]')[0];
    const mediaQueries = this.safeQuery(document, 'style, link[rel="stylesheet"]');
    
    return {
      hasViewport: !!viewport,
      isResponsive: viewport?.getAttribute('content')?.includes('device-width') || false,
      hasMediaQueries: mediaQueries.length > 0
    };
  }

  _analyzeTouchOptimization(document) {
    const touchIcons = this.safeQuery(document, 'link[rel*="apple-touch-icon"], link[rel*="touch-icon"]');
    
    return {
      optimized: touchIcons.length > 0,
      touchIcons: touchIcons.length,
      hasTouchIconSizes: Array.from(touchIcons).some(icon => icon.getAttribute('sizes'))
    };
  }

  _analyzeMobileMetaTags(document) {
    const viewport = this.safeQuery(document, 'meta[name="viewport"]')[0];
    const appleMobileCapable = this.safeQuery(document, 'meta[name="apple-mobile-web-app-capable"]')[0];
    
    return {
      viewport: !!viewport,
      appleMobileCapable: !!appleMobileCapable,
      hasFormatDetection: this.safeQuery(document, 'meta[name="format-detection"]').length > 0
    };
  }

  _analyzeAppManifest(document) {
    const manifest = this.safeQuery(document, 'link[rel="manifest"]')[0];
    
    return {
      present: !!manifest,
      href: manifest?.href || null
    };
  }

  _analyzeMobilePerformance(document) {
    const images = this.safeQuery(document, 'img');
    const lazyImages = Array.from(images).filter(img => img.loading === 'lazy');
    
    return {
      hasLazyLoading: lazyImages.length > 0,
      lazyLoadingCoverage: images.length > 0 ? lazyImages.length / images.length : 0
    };
  }

  _analyzeHTTPS(url, headers) {
    const isHTTPS = url?.startsWith('https://') || false;
    
    return {
      isHTTPS,
      protocol: isHTTPS ? 'https' : 'http',
      hasHSTS: !!headers['strict-transport-security']
    };
  }

  _analyzeSecurityHeaders(headers) {
    return {
      hasHSTS: !!headers['strict-transport-security'],
      hasCSP: !!headers['content-security-policy'],
      hasXFO: !!headers['x-frame-options'],
      hasXCTO: !!headers['x-content-type-options'],
      hasReferrerPolicy: !!headers['referrer-policy']
    };
  }

  _analyzeCSP(headers, document) {
    const csp = headers['content-security-policy'] || 
                this.safeQuery(document, 'meta[http-equiv="Content-Security-Policy"]')[0]?.getAttribute('content');
    
    return {
      present: !!csp,
      content: csp || null,
      directiveCount: csp ? csp.split(';').length : 0
    };
  }

  _analyzeMixedContent(document, url) {
    if (!url?.startsWith('https://')) {
      return { analyzed: false, reason: 'Not HTTPS page' };
    }
    
    const httpResources = this.safeQuery(document, '[src^="http:"], [href^="http:"]');
    
    return {
      hasIssues: httpResources.length > 0,
      insecureResources: httpResources.length,
      analyzed: true
    };
  }

  _analyzeCookieSecurity(headers, document) {
    const setCookie = headers['set-cookie'] || '';
    
    return {
      analyzed: setCookie.length > 0,
      secure: setCookie.includes('Secure'),
      httpOnly: setCookie.includes('HttpOnly'),
      sameSite: setCookie.includes('SameSite')
    };
  }

  _analyzeFormSecurity(document, url) {
    const forms = this.safeQuery(document, 'form');
    const isHTTPS = url?.startsWith('https://') || false;
    
    return {
      totalForms: forms.length,
      secureContext: isHTTPS,
      formsAnalyzed: forms.length
    };
  }

  _analyzeResourceOptimization(document) {
    const images = this.safeQuery(document, 'img');
    const scripts = this.safeQuery(document, 'script[src]');
    const stylesheets = this.safeQuery(document, 'link[rel="stylesheet"]');
    
    return {
      totalResources: images.length + scripts.length + stylesheets.length,
      images: images.length,
      scripts: scripts.length,
      stylesheets: stylesheets.length,
      unoptimized: images.length + scripts.length + stylesheets.length // Simplified
    };
  }

  _analyzeRenderBlocking(document) {
    const blockingScripts = this.safeQuery(document, 'script[src]:not([async]):not([defer])');
    const blockingCSS = this.safeQuery(document, 'link[rel="stylesheet"]:not([media="print"])');
    
    return {
      count: blockingScripts.length + blockingCSS.length,
      scripts: blockingScripts.length,
      stylesheets: blockingCSS.length
    };
  }

  _analyzeOptimization(document) {
    // Basic optimization analysis
    return {
      compression: false, // Would need server response analysis
      minification: false, // Would need content analysis
      analyzed: true
    };
  }

  _analyzeCriticalPath(document) {
    const aboveFoldResources = this.safeQuery(document, 'link[rel="stylesheet"], script[src]');
    
    return {
      resourcesInPath: aboveFoldResources.length,
      optimized: aboveFoldResources.length <= 5
    };
  }

  _analyzeScriptOptimization(document) {
    const scripts = this.safeQuery(document, 'script');
    const inlineScripts = Array.from(scripts).filter(script => !script.src && script.textContent?.trim());
    const asyncScripts = Array.from(scripts).filter(script => script.async);
    const deferScripts = Array.from(scripts).filter(script => script.defer);
    
    return {
      total: scripts.length,
      inline: inlineScripts.length,
      async: asyncScripts.length,
      defer: deferScripts.length,
      optimized: asyncScripts.length + deferScripts.length
    };
  }

  _analyzeServerTechnology(headers) {
    return {
      server: headers.server || 'unknown',
      poweredBy: headers['x-powered-by'] || null,
      technology: headers.server ? headers.server.split('/')[0] : 'unknown'
    };
  }

  _analyzeDoctype(document) {
    const doctype = document.doctype;
    
    return {
      present: !!doctype,
      isHTML5: doctype?.name === 'html',
      declaration: doctype ? `<!DOCTYPE ${doctype.name}>` : null
    };
  }

  // Helper methods for identifying issues and strengths
  _identifyInfrastructureIssues(infrastructure) {
    if (infrastructure.elements.viewport && !infrastructure.elements.viewport.present) {
      infrastructure.issues.push('Missing viewport meta tag');
    }
    if (infrastructure.elements.charset && !infrastructure.elements.charset.present) {
      infrastructure.issues.push('Missing character encoding declaration');
    }
    if (infrastructure.elements.viewport?.present && infrastructure.elements.viewport.isResponsive) {
      infrastructure.strengths.push('Responsive viewport configuration');
    }
    if (infrastructure.elements.charset?.isUTF8) {
      infrastructure.strengths.push('Using UTF-8 character encoding');
    }
  }

  _identifyArchitectureIssues(architecture) {
    if (architecture.structure.url?.depth > 5) {
      architecture.issues.push('Deep URL structure may impact SEO');
    }
    if (!architecture.structure.navigation?.present) {
      architecture.issues.push('Missing navigation structure');
    }
    if (architecture.structure.semantics?.usesSemanticTags) {
      architecture.strengths.push('Uses semantic HTML tags');
    }
    if (architecture.structure.document?.hasMain) {
      architecture.strengths.push('Proper document structure with main content area');
    }
  }

  _identifyAccessibilityIssues(accessibility) {
    if (accessibility.wcag.images?.missingAltText > 0) {
      accessibility.issues.push(`${accessibility.wcag.images.missingAltText} images missing alt text`);
    }
    if (accessibility.wcag.forms?.missingLabels > 0) {
      accessibility.issues.push(`${accessibility.wcag.forms.missingLabels} form inputs missing labels`);
    }
    if (accessibility.wcag.images?.altTextCoverage === 1) {
      accessibility.strengths.push('All images have alt text');
    }
    if (accessibility.wcag.aria?.implemented) {
      accessibility.strengths.push('ARIA attributes implemented');
    }
  }

  _identifyMobileIssues(mobile) {
    if (!mobile.features.responsive?.isResponsive) {
      mobile.issues.push('Not optimized for mobile devices');
    }
    if (!mobile.features.touch?.optimized) {
      mobile.issues.push('Missing touch optimization');
    }
    if (mobile.features.responsive?.isResponsive) {
      mobile.strengths.push('Responsive design implemented');
    }
    if (mobile.features.manifest?.present) {
      mobile.strengths.push('Web app manifest present');
    }
  }

  _identifySecurityIssues(security) {
    if (!security.protocols.https?.isHTTPS) {
      security.issues.push('Not using HTTPS protocol');
    }
    if (!security.protocols.headers?.hasCSP) {
      security.issues.push('Missing Content Security Policy');
    }
    if (security.protocols.https?.isHTTPS) {
      security.strengths.push('Using secure HTTPS protocol');
    }
    if (security.protocols.headers?.hasHSTS) {
      security.strengths.push('HTTP Strict Transport Security enabled');
    }
  }

  _identifyPerformanceIssues(performance) {
    if (performance.metrics.renderBlocking?.count > 5) {
      performance.issues.push('Too many render-blocking resources');
    }
    if (performance.metrics.scripts?.inline > 3) {
      performance.issues.push('Too many inline scripts');
    }
    if (performance.metrics.scripts?.async > 0) {
      performance.strengths.push('Using asynchronous script loading');
    }
    if (performance.metrics.criticalPath?.optimized) {
      performance.strengths.push('Optimized critical rendering path');
    }
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      description: 'Comprehensive technical infrastructure analysis covering accessibility, mobile friendliness, security, and performance',
      category: AnalyzerCategories.TECHNICAL,
      priority: 'high',
      features: [
        'Technical infrastructure analysis',
        'Website architecture evaluation',
        'WCAG accessibility compliance',
        'Mobile friendliness assessment',
        'Security implementation analysis',
        'Performance optimization analysis',
        'Technical scoring and recommendations'
      ],
      analysisAreas: [
        'Viewport and responsive design',
        'Character encoding and DOCTYPE',
        'Resource optimization',
        'Accessibility compliance',
        'Mobile optimization',
        'Security headers and HTTPS',
        'Performance metrics'
      ],
      standards: [
        'WCAG 2.1 Guidelines',
        'Mobile-First Design',
        'OWASP Security Standards',
        'Web Performance Best Practices',
        'HTML5 Semantic Standards'
      ]
    };
  }
}