/**
 * ============================================================================
 * TECHNICAL INFRASTRUCTURE DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced technical infrastructure detection for comprehensive website analysis
 * Part of the Combined Approach Technical Analyzer (9th Implementation)
 * 
 * Features:
 * - Viewport configuration analysis
 * - Character encoding validation
 * - Resource loading optimization
 * - Server technology detection
 * - DOCTYPE and HTML standards compliance
 * - Technical metadata analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class TechnicalInfrastructureDetector {
  constructor(config = {}) {
    this.config = {
      enableViewportAnalysis: config.enableViewportAnalysis !== false,
      enableResourceAnalysis: config.enableResourceAnalysis !== false,
      enableServerAnalysis: config.enableServerAnalysis !== false,
      enableStandardsAnalysis: config.enableStandardsAnalysis !== false,
      maxResourceAnalysis: config.maxResourceAnalysis || 100,
      detailedAnalysis: config.detailedAnalysis !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'technical_infrastructure';
    
    // Technical standards and requirements
    this.standards = {
      viewport: {
        requiredAttributes: ['width=device-width', 'initial-scale=1'],
        recommendedAttributes: ['user-scalable=no', 'viewport-fit=cover'],
        deprecatedAttributes: ['target-densitydpi']
      },
      charset: {
        preferred: ['utf-8', 'utf8'],
        acceptable: ['iso-8859-1', 'windows-1252'],
        deprecated: ['ascii', 'us-ascii']
      },
      doctype: {
        html5: '<!doctype html>',
        xhtml: ['<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML'],
        html4: ['<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01']
      },
      resources: {
        maxRenderBlocking: 5,
        maxExternalResources: 20,
        maxInlineScripts: 3,
        maxCSSFiles: 10
      }
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'TechnicalInfrastructureDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Detects and analyzes technical infrastructure components for optimization',
      capabilities: [
        'viewport_analysis',
        'charset_validation',
        'resource_optimization',
        'server_technology_detection',
        'doctype_compliance',
        'technical_metadata_analysis'
      ],
      standards: Object.keys(this.standards),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect technical infrastructure components
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Infrastructure detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for infrastructure analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Viewport configuration analysis
      const viewportAnalysis = this._analyzeViewport(document);

      // Phase 2: Character encoding analysis
      const charsetAnalysis = this._analyzeCharset(document);

      // Phase 3: Resource loading analysis
      const resourceAnalysis = this._analyzeResources(document);

      // Phase 4: Server technology analysis
      const serverAnalysis = this._analyzeServerTechnology(pageData?.headers || {});

      // Phase 5: DOCTYPE and standards analysis
      const standardsAnalysis = this._analyzeStandards(document);

      // Phase 6: Technical metadata analysis
      const metadataAnalysis = this._analyzeTechnicalMetadata(document);

      // Calculate overall infrastructure score
      const overallScore = this._calculateInfrastructureScore({
        viewport: viewportAnalysis,
        charset: charsetAnalysis,
        resources: resourceAnalysis,
        server: serverAnalysis,
        standards: standardsAnalysis,
        metadata: metadataAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        viewport: viewportAnalysis,
        charset: charsetAnalysis,
        resources: resourceAnalysis,
        server: serverAnalysis,
        standards: standardsAnalysis,
        metadata: metadataAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        
        // Strategic insights
        insights: this._generateInfrastructureInsights({
          viewport: viewportAnalysis,
          charset: charsetAnalysis,
          resources: resourceAnalysis,
          server: serverAnalysis,
          standards: standardsAnalysis,
          metadata: metadataAnalysis
        }),
        
        recommendations: this._generateInfrastructureRecommendations({
          viewport: viewportAnalysis,
          charset: charsetAnalysis,
          resources: resourceAnalysis,
          server: serverAnalysis,
          standards: standardsAnalysis,
          metadata: metadataAnalysis
        }),
        
        // Performance metrics
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Infrastructure detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze viewport configuration
   * @param {Document} document - DOM document
   * @returns {Object} Viewport analysis results
   */
  _analyzeViewport(document) {
    const analysis = {
      hasViewport: false,
      content: null,
      attributes: {},
      compliance: {},
      issues: [],
      recommendations: []
    };

    try {
      // Find viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      if (!viewportMeta) {
        analysis.issues.push('Missing viewport meta tag');
        analysis.recommendations.push('Add viewport meta tag for responsive design');
        return { ...analysis, score: 0, grade: 'F' };
      }

      analysis.hasViewport = true;
      analysis.content = viewportMeta.getAttribute('content') || '';

      // Parse viewport attributes
      const attributes = this._parseViewportContent(analysis.content);
      analysis.attributes = attributes;

      // Check compliance with standards
      analysis.compliance = this._checkViewportCompliance(attributes);

      // Generate specific recommendations
      if (!attributes.width || attributes.width !== 'device-width') {
        analysis.issues.push('Viewport width should be set to device-width');
        analysis.recommendations.push('Set viewport width to device-width');
      }

      if (!attributes['initial-scale'] || parseFloat(attributes['initial-scale']) !== 1) {
        analysis.issues.push('Initial scale should be set to 1');
        analysis.recommendations.push('Set initial-scale to 1');
      }

      if (attributes['user-scalable'] === 'no') {
        analysis.issues.push('User scaling is disabled (accessibility concern)');
        analysis.recommendations.push('Consider allowing user scaling for accessibility');
      }

      // Check for deprecated attributes
      if (attributes['target-densitydpi']) {
        analysis.issues.push('Deprecated target-densitydpi attribute found');
        analysis.recommendations.push('Remove deprecated target-densitydpi attribute');
      }

      // Calculate viewport score
      const score = this._calculateViewportScore(analysis.compliance, analysis.issues);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze character encoding
   * @param {Document} document - DOM document
   * @returns {Object} Charset analysis results
   */
  _analyzeCharset(document) {
    const analysis = {
      hasCharset: false,
      charset: null,
      method: null,
      compliance: {},
      issues: [],
      recommendations: []
    };

    try {
      // Check for charset in multiple ways
      let charset = null;
      let method = null;

      // Method 1: HTML5 meta charset
      const charsetMeta = document.querySelector('meta[charset]');
      if (charsetMeta) {
        charset = charsetMeta.getAttribute('charset');
        method = 'html5_meta';
      }

      // Method 2: HTTP-EQUIV content-type
      if (!charset) {
        const contentTypeMeta = document.querySelector('meta[http-equiv="content-type"]');
        if (contentTypeMeta) {
          const content = contentTypeMeta.getAttribute('content') || '';
          const charsetMatch = content.match(/charset=([^;]+)/i);
          if (charsetMatch) {
            charset = charsetMatch[1];
            method = 'http_equiv';
          }
        }
      }

      if (!charset) {
        analysis.issues.push('No character encoding specified');
        analysis.recommendations.push('Add charset meta tag in document head');
        return { ...analysis, score: 0, grade: 'F' };
      }

      analysis.hasCharset = true;
      analysis.charset = charset.toLowerCase();
      analysis.method = method;

      // Check charset compliance
      analysis.compliance = this._checkCharsetCompliance(analysis.charset);

      // Generate recommendations based on charset
      if (!this.standards.charset.preferred.includes(analysis.charset)) {
        if (this.standards.charset.acceptable.includes(analysis.charset)) {
          analysis.recommendations.push('Consider using UTF-8 for better internationalization');
        } else {
          analysis.issues.push(`Non-standard charset: ${charset}`);
          analysis.recommendations.push('Use UTF-8 charset for better compatibility');
        }
      }

      // Check charset position (should be early in head)
      const headChildren = Array.from(document.head?.children || []);
      const charsetIndex = headChildren.findIndex(child => 
        child.hasAttribute('charset') || 
        (child.getAttribute('http-equiv') === 'content-type')
      );
      
      if (charsetIndex > 3) {
        analysis.issues.push('Charset declaration should be earlier in document head');
        analysis.recommendations.push('Move charset declaration to beginning of head section');
      }

      // Calculate charset score
      const score = this._calculateCharsetScore(analysis.compliance, analysis.issues);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze resource loading
   * @param {Document} document - DOM document
   * @returns {Object} Resource analysis results
   */
  _analyzeResources(document) {
    const analysis = {
      scripts: { total: 0, external: 0, inline: 0, blocking: 0 },
      stylesheets: { total: 0, external: 0, inline: 0, blocking: 0 },
      images: { total: 0, optimized: 0, lazy: 0 },
      other: { total: 0, preloaded: 0, prefetched: 0 },
      issues: [],
      recommendations: []
    };

    try {
      // Analyze scripts
      const scripts = document.querySelectorAll('script');
      analysis.scripts.total = scripts.length;

      scripts.forEach(script => {
        if (script.src) {
          analysis.scripts.external++;
          if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
            analysis.scripts.blocking++;
          }
        } else {
          analysis.scripts.inline++;
        }
      });

      // Analyze stylesheets
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
      analysis.stylesheets.total = stylesheets.length;

      stylesheets.forEach(style => {
        if (style.tagName === 'LINK') {
          analysis.stylesheets.external++;
          if (!style.hasAttribute('media') || style.getAttribute('media') === 'all') {
            analysis.stylesheets.blocking++;
          }
        } else {
          analysis.stylesheets.inline++;
        }
      });

      // Analyze images
      const images = document.querySelectorAll('img, picture source');
      analysis.images.total = images.length;

      images.forEach(img => {
        if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
          analysis.images.lazy++;
        }
        if (img.hasAttribute('srcset') || img.tagName === 'SOURCE') {
          analysis.images.optimized++;
        }
      });

      // Analyze other resources
      const preloads = document.querySelectorAll('link[rel="preload"]');
      const prefetches = document.querySelectorAll('link[rel="prefetch"]');
      analysis.other.preloaded = preloads.length;
      analysis.other.prefetched = prefetches.length;
      analysis.other.total = preloads.length + prefetches.length;

      // Generate issues and recommendations
      if (analysis.scripts.blocking > this.standards.resources.maxRenderBlocking) {
        analysis.issues.push(`${analysis.scripts.blocking} render-blocking scripts found`);
        analysis.recommendations.push('Add async or defer attributes to non-critical scripts');
      }

      if (analysis.stylesheets.blocking > this.standards.resources.maxRenderBlocking) {
        analysis.issues.push(`${analysis.stylesheets.blocking} render-blocking stylesheets found`);
        analysis.recommendations.push('Consider critical CSS inlining or media queries');
      }

      if (analysis.scripts.total > this.standards.resources.maxExternalResources) {
        analysis.issues.push('High number of script resources');
        analysis.recommendations.push('Consider script bundling and optimization');
      }

      if (analysis.images.lazy === 0 && analysis.images.total > 5) {
        analysis.recommendations.push('Consider implementing lazy loading for images');
      }

      // Calculate resource score
      const score = this._calculateResourceScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze server technology
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Server analysis results
   */
  _analyzeServerTechnology(headers) {
    const analysis = {
      server: null,
      technology: [],
      frameworks: [],
      cdn: null,
      compression: false,
      caching: {},
      security: {},
      issues: [],
      recommendations: []
    };

    try {
      // Detect server
      const serverHeader = headers['server'] || headers['Server'];
      if (serverHeader) {
        analysis.server = serverHeader;
        analysis.technology.push({ type: 'server', name: serverHeader });
      }

      // Detect CDN
      const cdnHeaders = ['cf-ray', 'x-amz-cf-id', 'x-fastly-request-id', 'x-akamai-request-id'];
      cdnHeaders.forEach(header => {
        if (headers[header]) {
          const cdnName = this._identifyCDN(header);
          if (cdnName) {
            analysis.cdn = cdnName;
            analysis.technology.push({ type: 'cdn', name: cdnName });
          }
        }
      });

      // Check compression
      const contentEncoding = headers['content-encoding'] || headers['Content-Encoding'];
      if (contentEncoding) {
        analysis.compression = true;
        analysis.technology.push({ type: 'compression', name: contentEncoding });
      }

      // Analyze caching headers
      analysis.caching = this._analyzeCachingHeaders(headers);

      // Analyze security headers
      analysis.security = this._analyzeSecurityHeaders(headers);

      // Generate recommendations
      if (!analysis.compression) {
        analysis.recommendations.push('Enable compression (gzip/brotli) for better performance');
      }

      if (!analysis.caching.hasCache) {
        analysis.recommendations.push('Implement proper caching headers');
      }

      if (analysis.security.missing.length > 0) {
        analysis.recommendations.push('Add missing security headers');
      }

      // Calculate server score
      const score = this._calculateServerScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze DOCTYPE and HTML standards
   * @param {Document} document - DOM document
   * @returns {Object} Standards analysis results
   */
  _analyzeStandards(document) {
    const analysis = {
      doctype: null,
      htmlVersion: null,
      isValid: false,
      standards: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze DOCTYPE
      const doctype = document.doctype;
      if (doctype) {
        analysis.doctype = doctype.name;
        analysis.htmlVersion = this._identifyHTMLVersion(doctype);
      } else {
        analysis.issues.push('Missing DOCTYPE declaration');
        analysis.recommendations.push('Add HTML5 DOCTYPE declaration');
        return { ...analysis, score: 0, grade: 'F' };
      }

      // Check if HTML5
      analysis.isValid = analysis.htmlVersion === 'HTML5';
      
      if (!analysis.isValid) {
        analysis.issues.push(`Using ${analysis.htmlVersion} instead of HTML5`);
        analysis.recommendations.push('Upgrade to HTML5 DOCTYPE');
      }

      // Check HTML lang attribute
      const htmlElement = document.documentElement;
      if (!htmlElement.hasAttribute('lang')) {
        analysis.issues.push('Missing lang attribute on html element');
        analysis.recommendations.push('Add lang attribute to html element for accessibility');
      }

      // Calculate standards score
      const score = this._calculateStandardsScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze technical metadata
   * @param {Document} document - DOM document
   * @returns {Object} Metadata analysis results
   */
  _analyzeTechnicalMetadata(document) {
    const analysis = {
      generator: null,
      format: null,
      robots: null,
      canonical: null,
      hreflang: [],
      issues: [],
      recommendations: []
    };

    try {
      // Check generator meta tag
      const generator = document.querySelector('meta[name="generator"]');
      if (generator) {
        analysis.generator = generator.getAttribute('content');
      }

      // Check format detection
      const formatDetection = document.querySelector('meta[name="format-detection"]');
      if (formatDetection) {
        analysis.format = formatDetection.getAttribute('content');
      }

      // Check robots meta tag
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) {
        analysis.robots = robots.getAttribute('content');
      }

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        analysis.canonical = canonical.getAttribute('href');
      }

      // Check hreflang tags
      const hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
      hreflangs.forEach(link => {
        analysis.hreflang.push({
          lang: link.getAttribute('hreflang'),
          href: link.getAttribute('href')
        });
      });

      // Generate recommendations
      if (!analysis.canonical) {
        analysis.recommendations.push('Consider adding canonical URL for SEO');
      }

      if (!analysis.robots) {
        analysis.recommendations.push('Consider adding robots meta tag for search engine control');
      }

      // Calculate metadata score
      const score = this._calculateMetadataScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _parseViewportContent(content) {
    const attributes = {};
    const parts = content.split(',').map(part => part.trim());
    
    parts.forEach(part => {
      const [key, value] = part.split('=').map(s => s.trim());
      if (key && value) {
        attributes[key] = value;
      }
    });
    
    return attributes;
  }

  _checkViewportCompliance(attributes) {
    return {
      hasDeviceWidth: attributes.width === 'device-width',
      hasInitialScale: attributes['initial-scale'] === '1',
      allowsUserScaling: attributes['user-scalable'] !== 'no',
      noDeprecated: !attributes['target-densitydpi']
    };
  }

  _checkCharsetCompliance(charset) {
    return {
      isPreferred: this.standards.charset.preferred.includes(charset),
      isAcceptable: this.standards.charset.acceptable.includes(charset),
      isDeprecated: this.standards.charset.deprecated.includes(charset)
    };
  }

  _identifyCDN(header) {
    const cdnMap = {
      'cf-ray': 'Cloudflare',
      'x-amz-cf-id': 'Amazon CloudFront',
      'x-fastly-request-id': 'Fastly',
      'x-akamai-request-id': 'Akamai'
    };
    return cdnMap[header] || null;
  }

  _analyzeCachingHeaders(headers) {
    return {
      hasCache: !!(headers['cache-control'] || headers['Cache-Control']),
      hasEtag: !!(headers['etag'] || headers['ETag']),
      hasLastModified: !!(headers['last-modified'] || headers['Last-Modified']),
      cacheControl: headers['cache-control'] || headers['Cache-Control']
    };
  }

  _analyzeSecurityHeaders(headers) {
    const securityHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy'
    ];
    
    const present = [];
    const missing = [];
    
    securityHeaders.forEach(header => {
      if (headers[header] || headers[header.split('-').map(p => 
        p.charAt(0).toUpperCase() + p.slice(1)).join('-')]) {
        present.push(header);
      } else {
        missing.push(header);
      }
    });
    
    return { present, missing };
  }

  _identifyHTMLVersion(doctype) {
    const doctypeString = `<!DOCTYPE ${doctype.name}>`.toLowerCase();
    
    if (doctypeString === '<!doctype html>') {
      return 'HTML5';
    } else if (doctypeString.includes('xhtml')) {
      return 'XHTML';
    } else if (doctypeString.includes('html 4')) {
      return 'HTML4';
    } else {
      return 'Unknown';
    }
  }

  _calculateInfrastructureScore(components) {
    const weights = {
      viewport: 0.20,
      charset: 0.15,
      resources: 0.25,
      server: 0.15,
      standards: 0.15,
      metadata: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([component, weight]) => {
      if (components[component] && components[component].score !== undefined) {
        totalScore += components[component].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level };
  }

  _calculateViewportScore(compliance, issues) {
    let score = 100;
    
    if (!compliance.hasDeviceWidth) score -= 30;
    if (!compliance.hasInitialScale) score -= 20;
    if (!compliance.allowsUserScaling) score -= 10;
    if (!compliance.noDeprecated) score -= 15;
    
    score -= issues.length * 5;
    
    return Math.max(0, score);
  }

  _calculateCharsetScore(compliance, issues) {
    let score = 100;
    
    if (!compliance.isPreferred) {
      if (compliance.isAcceptable) {
        score -= 20;
      } else {
        score -= 40;
      }
    }
    
    if (compliance.isDeprecated) score -= 50;
    score -= issues.length * 10;
    
    return Math.max(0, score);
  }

  _calculateResourceScore(analysis) {
    let score = 100;
    
    // Penalize blocking resources
    score -= Math.max(0, analysis.scripts.blocking - 2) * 10;
    score -= Math.max(0, analysis.stylesheets.blocking - 2) * 10;
    
    // Penalize too many resources
    if (analysis.scripts.total > 10) score -= 15;
    if (analysis.stylesheets.total > 5) score -= 10;
    
    // Reward optimization
    if (analysis.images.lazy > 0) score += 5;
    if (analysis.other.preloaded > 0) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateServerScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.compression) score += 15;
    if (analysis.cdn) score += 10;
    if (analysis.caching.hasCache) score += 10;
    if (analysis.security.missing.length === 0) score += 15;
    
    score -= analysis.security.missing.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateStandardsScore(analysis) {
    let score = analysis.isValid ? 90 : 50;
    score -= analysis.issues.length * 10;
    return Math.max(0, score);
  }

  _calculateMetadataScore(analysis) {
    let score = 60; // Base score
    
    if (analysis.canonical) score += 15;
    if (analysis.robots) score += 10;
    if (analysis.hreflang.length > 0) score += 10;
    if (analysis.format) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _generateInfrastructureInsights(components) {
    const insights = [];
    
    // Viewport insights
    if (components.viewport.score >= 90) {
      insights.push({
        type: 'positive',
        category: 'viewport',
        message: 'Viewport configuration is optimized for mobile devices',
        impact: 'high'
      });
    }
    
    // Resource insights
    if (components.resources.scripts.blocking === 0) {
      insights.push({
        type: 'positive',
        category: 'performance',
        message: 'No render-blocking scripts detected',
        impact: 'high'
      });
    }
    
    // Server insights
    if (components.server.compression) {
      insights.push({
        type: 'positive',
        category: 'performance',
        message: 'Content compression is enabled',
        impact: 'medium'
      });
    }
    
    return insights;
  }

  _generateInfrastructureRecommendations(components) {
    const recommendations = [];
    
    // Collect all component recommendations
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: component.constructor?.name || 'infrastructure',
          priority: 'medium',
          complexity: 'low'
        })));
      }
    });
    
    return recommendations.slice(0, 10); // Limit recommendations
  }

  _calculateGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  }

  _categorizeLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  _generateCacheKey(url) {
    return btoa(url || 'unknown').slice(0, 20);
  }
}

export default TechnicalInfrastructureDetector;
