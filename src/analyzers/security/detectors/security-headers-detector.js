/**
 * ============================================================================
 * SECURITY HEADERS DETECTOR - GPT-5 Style Modular Component
 * ============================================================================
 * 
 * Advanced security headers detection component implementing GPT-5 style
 * modular architecture for comprehensive HTTP security headers analysis.
 * 
 * Features:
 * - Comprehensive security headers detection and validation
 * - Content Security Policy (CSP) detailed analysis
 * - X-Frame-Options and clickjacking protection
 * - Cross-site scripting (XSS) protection headers
 * - Content type sniffing protection
 * - Referrer policy analysis
 * - Permissions policy evaluation
 * - Security headers scoring and compliance assessment
 * 
 * @module SecurityHeadersDetector
 * @version 1.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-12
 */

/**
 * Security Headers Standards and Configuration
 */
const SECURITY_HEADERS_STANDARDS = {
  REQUIRED_HEADERS: [
    'strict-transport-security',
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options'
  ],
  RECOMMENDED_HEADERS: [
    'referrer-policy',
    'permissions-policy',
    'x-xss-protection',
    'expect-ct',
    'cross-origin-opener-policy',
    'cross-origin-embedder-policy'
  ],
  CSP_DIRECTIVES: {
    REQUIRED: ['default-src', 'script-src', 'style-src'],
    SECURITY_CRITICAL: ['script-src', 'object-src', 'frame-src'],
    UNSAFE_VALUES: ['unsafe-inline', 'unsafe-eval', '*', 'data:'],
    SECURE_VALUES: ['self', 'none', 'strict-dynamic', 'nonce-', 'sha256-']
  },
  HEADER_VALUES: {
    X_FRAME_OPTIONS: ['DENY', 'SAMEORIGIN', 'ALLOW-FROM'],
    X_CONTENT_TYPE_OPTIONS: ['nosniff'],
    REFERRER_POLICY: ['strict-origin-when-cross-origin', 'same-origin', 'strict-origin'],
    CROSS_ORIGIN_OPENER_POLICY: ['same-origin', 'same-origin-allow-popups']
  },
  SCORING: {
    REQUIRED_HEADER: 15,
    RECOMMENDED_HEADER: 10,
    PROPER_VALUE: 5,
    SECURE_CSP_DIRECTIVE: 8,
    UNSAFE_CSP_PENALTY: -20
  }
};

/**
 * Security Headers Detector Class
 * 
 * Implements comprehensive security headers detection and analysis
 * following GPT-5 style modular component architecture.
 */
export class SecurityHeadersDetector {
  constructor(options = {}) {
    this.options = {
      strictMode: options.strictMode || false,
      analyzeCSP: options.analyzeCSP !== false,
      checkDeprecatedHeaders: options.checkDeprecatedHeaders !== false,
      validateHeaderValues: options.validateHeaderValues !== false,
      complianceLevel: options.complianceLevel || 'standard', // basic, standard, strict
      ...options
    };
    
    this.name = 'SecurityHeadersDetector';
    this.version = '1.0.0';
  }

  /**
   * Detect Security Headers Configuration
   * 
   * Performs comprehensive security headers analysis including presence,
   * validation, configuration assessment, and compliance scoring.
   * 
   * @param {Object} context - Analysis context
   * @param {Object} context.headers - HTTP response headers
   * @param {Document} context.document - DOM document
   * @param {string} context.url - Page URL
   * @returns {Object} Security headers detection results
   */
  async detect(context) {
    try {
      const { headers = {}, document, url } = context;
      
      console.log(`🛡️ Security Headers Detector: Analyzing headers for ${url}`);
      
      const headersAnalysis = {
        // Core security headers analysis
        present: this._analyzeHeadersPresence(headers),
        validation: this._validateHeaderValues(headers),
        
        // Detailed analysis of specific headers
        csp: this._analyzeCSP(headers),
        frameOptions: this._analyzeFrameOptions(headers),
        contentTypeOptions: this._analyzeContentTypeOptions(headers),
        xssProtection: this._analyzeXSSProtection(headers),
        referrerPolicy: this._analyzeReferrerPolicy(headers),
        permissionsPolicy: this._analyzePermissionsPolicy(headers),
        
        // Cross-origin policies
        crossOrigin: this._analyzeCrossOriginPolicies(headers),
        
        // HSTS analysis (if not covered by SSL detector)
        hsts: this._analyzeHSTSHeader(headers),
        
        // Deprecated and legacy headers
        deprecated: this._analyzeDeprecatedHeaders(headers),
        
        // Information disclosure headers
        informationDisclosure: this._analyzeInformationDisclosure(headers)
      };
      
      // Calculate security headers score
      headersAnalysis.score = this._calculateHeadersScore(headersAnalysis);
      headersAnalysis.grade = this._getHeadersGrade(headersAnalysis.score);
      
      // Generate compliance assessment
      headersAnalysis.compliance = this._assessCompliance(headersAnalysis);
      
      // Generate insights and recommendations
      headersAnalysis.insights = this._generateHeadersInsights(headersAnalysis);
      headersAnalysis.recommendations = this._generateHeadersRecommendations(headersAnalysis);
      
      console.log(`🛡️ Security Headers Analysis complete: ${headersAnalysis.grade} grade (${headersAnalysis.score}/100)`);
      
      return {
        detector: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        analysis: headersAnalysis,
        metadata: {
          complianceLevel: this.options.complianceLevel,
          featuresEnabled: Object.keys(this.options).filter(key => this.options[key] === true)
        }
      };
      
    } catch (error) {
      console.error(`❌ Security Headers Detector Error: ${error.message}`);
      return {
        detector: this.name,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze Security Headers Presence
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Headers presence analysis
   * @private
   */
  _analyzeHeadersPresence(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    
    const analysis = {
      total: 0,
      required: 0,
      recommended: 0,
      missing: [],
      present: [],
      coverage: 0
    };

    // Check required headers
    SECURITY_HEADERS_STANDARDS.REQUIRED_HEADERS.forEach(header => {
      if (normalizedHeaders[header]) {
        analysis.required++;
        analysis.present.push({
          name: header,
          type: 'required',
          value: normalizedHeaders[header]
        });
      } else {
        analysis.missing.push({
          name: header,
          type: 'required',
          importance: 'high'
        });
      }
    });

    // Check recommended headers
    SECURITY_HEADERS_STANDARDS.RECOMMENDED_HEADERS.forEach(header => {
      if (normalizedHeaders[header]) {
        analysis.recommended++;
        analysis.present.push({
          name: header,
          type: 'recommended',
          value: normalizedHeaders[header]
        });
      } else {
        analysis.missing.push({
          name: header,
          type: 'recommended',
          importance: 'medium'
        });
      }
    });

    analysis.total = analysis.required + analysis.recommended;
    const totalPossible = SECURITY_HEADERS_STANDARDS.REQUIRED_HEADERS.length + 
                         SECURITY_HEADERS_STANDARDS.RECOMMENDED_HEADERS.length;
    analysis.coverage = Math.round((analysis.total / totalPossible) * 100);

    return analysis;
  }

  /**
   * Validate Security Header Values
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Header values validation results
   * @private
   */
  _validateHeaderValues(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const validation = {
      valid: 0,
      invalid: 0,
      warnings: 0,
      results: []
    };

    // Validate each present header
    Object.keys(normalizedHeaders).forEach(headerName => {
      const value = normalizedHeaders[headerName];
      const result = this._validateSingleHeader(headerName, value);
      
      if (result) {
        validation.results.push(result);
        
        switch (result.status) {
          case 'valid':
            validation.valid++;
            break;
          case 'invalid':
            validation.invalid++;
            break;
          case 'warning':
            validation.warnings++;
            break;
        }
      }
    });

    return validation;
  }

  /**
   * Analyze Content Security Policy
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} CSP analysis results
   * @private
   */
  _analyzeCSP(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const cspHeader = normalizedHeaders['content-security-policy'];
    
    const cspAnalysis = {
      present: !!cspHeader,
      header: cspHeader,
      directives: {},
      violations: [],
      score: 0,
      level: 'none'
    };

    if (!cspHeader) {
      return cspAnalysis;
    }

    try {
      // Parse CSP directives
      cspAnalysis.directives = this._parseCSPDirectives(cspHeader);
      
      // Analyze directive security
      cspAnalysis.directiveAnalysis = this._analyzeCSPDirectives(cspAnalysis.directives);
      
      // Detect security violations
      cspAnalysis.violations = this._detectCSPViolations(cspAnalysis.directives);
      
      // Calculate CSP score
      cspAnalysis.score = this._calculateCSPScore(cspAnalysis);
      cspAnalysis.level = this._getCSPSecurityLevel(cspAnalysis.score);
      
    } catch (error) {
      cspAnalysis.error = error.message;
    }

    return cspAnalysis;
  }

  /**
   * Analyze X-Frame-Options Header
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} X-Frame-Options analysis
   * @private
   */
  _analyzeFrameOptions(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const frameOptions = normalizedHeaders['x-frame-options'];
    
    return {
      present: !!frameOptions,
      value: frameOptions,
      valid: frameOptions && SECURITY_HEADERS_STANDARDS.HEADER_VALUES.X_FRAME_OPTIONS.includes(frameOptions.toUpperCase()),
      protection: this._getFrameProtectionLevel(frameOptions),
      recommendation: this._getFrameOptionsRecommendation(frameOptions)
    };
  }

  /**
   * Analyze X-Content-Type-Options Header
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} X-Content-Type-Options analysis
   * @private
   */
  _analyzeContentTypeOptions(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const contentTypeOptions = normalizedHeaders['x-content-type-options'];
    
    return {
      present: !!contentTypeOptions,
      value: contentTypeOptions,
      valid: contentTypeOptions && contentTypeOptions.toLowerCase() === 'nosniff',
      protection: contentTypeOptions ? 'enabled' : 'disabled'
    };
  }

  /**
   * Analyze X-XSS-Protection Header
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} X-XSS-Protection analysis
   * @private
   */
  _analyzeXSSProtection(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const xssProtection = normalizedHeaders['x-xss-protection'];
    
    const analysis = {
      present: !!xssProtection,
      value: xssProtection,
      enabled: false,
      mode: null,
      deprecated: true // This header is deprecated in favor of CSP
    };

    if (xssProtection) {
      analysis.enabled = xssProtection.includes('1');
      if (xssProtection.includes('mode=block')) {
        analysis.mode = 'block';
      }
    }

    return analysis;
  }

  /**
   * Analyze Referrer Policy Header
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Referrer Policy analysis
   * @private
   */
  _analyzeReferrerPolicy(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const referrerPolicy = normalizedHeaders['referrer-policy'];
    
    return {
      present: !!referrerPolicy,
      value: referrerPolicy,
      valid: referrerPolicy && SECURITY_HEADERS_STANDARDS.HEADER_VALUES.REFERRER_POLICY.includes(referrerPolicy),
      privacyLevel: this._getReferrerPrivacyLevel(referrerPolicy)
    };
  }

  /**
   * Analyze Permissions Policy Header
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Permissions Policy analysis
   * @private
   */
  _analyzePermissionsPolicy(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const permissionsPolicy = normalizedHeaders['permissions-policy'];
    
    const analysis = {
      present: !!permissionsPolicy,
      header: permissionsPolicy,
      directives: {},
      restrictedFeatures: 0
    };

    if (permissionsPolicy) {
      analysis.directives = this._parsePermissionsPolicy(permissionsPolicy);
      analysis.restrictedFeatures = Object.keys(analysis.directives).length;
    }

    return analysis;
  }

  /**
   * Analyze Cross-Origin Policies
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Cross-origin policies analysis
   * @private
   */
  _analyzeCrossOriginPolicies(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    
    return {
      openerPolicy: {
        present: !!normalizedHeaders['cross-origin-opener-policy'],
        value: normalizedHeaders['cross-origin-opener-policy'],
        valid: normalizedHeaders['cross-origin-opener-policy'] && 
               SECURITY_HEADERS_STANDARDS.HEADER_VALUES.CROSS_ORIGIN_OPENER_POLICY.includes(
                 normalizedHeaders['cross-origin-opener-policy']
               )
      },
      embedderPolicy: {
        present: !!normalizedHeaders['cross-origin-embedder-policy'],
        value: normalizedHeaders['cross-origin-embedder-policy']
      },
      resourcePolicy: {
        present: !!normalizedHeaders['cross-origin-resource-policy'],
        value: normalizedHeaders['cross-origin-resource-policy']
      }
    };
  }

  /**
   * Analyze HSTS Header
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} HSTS analysis
   * @private
   */
  _analyzeHSTSHeader(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const hstsHeader = normalizedHeaders['strict-transport-security'];
    
    const analysis = {
      present: !!hstsHeader,
      header: hstsHeader,
      maxAge: null,
      includeSubDomains: false,
      preload: false
    };

    if (hstsHeader) {
      const directives = hstsHeader.split(';').map(d => d.trim());
      
      // Extract max-age
      const maxAgeMatch = directives.find(d => d.startsWith('max-age='));
      if (maxAgeMatch) {
        analysis.maxAge = parseInt(maxAgeMatch.split('=')[1]);
      }
      
      analysis.includeSubDomains = directives.includes('includeSubDomains');
      analysis.preload = directives.includes('preload');
    }

    return analysis;
  }

  /**
   * Analyze Deprecated Security Headers
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Deprecated headers analysis
   * @private
   */
  _analyzeDeprecatedHeaders(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const deprecatedHeaders = [
      'x-xss-protection',
      'public-key-pins',
      'public-key-pins-report-only'
    ];

    const analysis = {
      found: [],
      count: 0,
      recommendations: []
    };

    deprecatedHeaders.forEach(header => {
      if (normalizedHeaders[header]) {
        analysis.found.push({
          name: header,
          value: normalizedHeaders[header],
          reason: this._getDeprecationReason(header)
        });
        analysis.count++;
      }
    });

    return analysis;
  }

  /**
   * Analyze Information Disclosure Headers
   * 
   * @param {Object} headers - HTTP response headers
   * @returns {Object} Information disclosure analysis
   * @private
   */
  _analyzeInformationDisclosure(headers) {
    const normalizedHeaders = this._normalizeHeaders(headers);
    const sensitiveHeaders = [
      'server',
      'x-powered-by',
      'x-aspnet-version',
      'x-generator'
    ];

    const analysis = {
      exposed: [],
      count: 0,
      riskLevel: 'low'
    };

    sensitiveHeaders.forEach(header => {
      if (normalizedHeaders[header]) {
        analysis.exposed.push({
          name: header,
          value: normalizedHeaders[header],
          risk: 'information_disclosure'
        });
        analysis.count++;
      }
    });

    analysis.riskLevel = analysis.count > 2 ? 'medium' : 'low';

    return analysis;
  }

  /**
   * Calculate Security Headers Score
   * 
   * @param {Object} headersAnalysis - Complete headers analysis
   * @returns {number} Security headers score (0-100)
   * @private
   */
  _calculateHeadersScore(headersAnalysis) {
    let score = 0;
    const standards = SECURITY_HEADERS_STANDARDS.SCORING;

    // Score for required headers
    score += headersAnalysis.present.required * standards.REQUIRED_HEADER;
    
    // Score for recommended headers
    score += headersAnalysis.present.recommended * standards.RECOMMENDED_HEADER;
    
    // Score for proper values
    score += headersAnalysis.validation.valid * standards.PROPER_VALUE;
    
    // CSP score contribution
    if (headersAnalysis.csp.present) {
      score += headersAnalysis.csp.score * 0.3; // 30% weight for CSP
    }
    
    // Penalties for issues
    score -= headersAnalysis.validation.invalid * 10;
    score -= headersAnalysis.deprecated.count * 5;
    score -= headersAnalysis.informationDisclosure.count * 3;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get Security Headers Grade
   * 
   * @param {number} score - Security headers score
   * @returns {string} Security headers grade (A+ to F)
   * @private
   */
  _getHeadersGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Generate Security Headers Insights
   * 
   * @param {Object} headersAnalysis - Headers analysis results
   * @returns {Array} Security headers insights
   * @private
   */
  _generateHeadersInsights(headersAnalysis) {
    const insights = [];

    if (headersAnalysis.present.required === SECURITY_HEADERS_STANDARDS.REQUIRED_HEADERS.length) {
      insights.push({
        type: 'positive',
        category: 'coverage',
        message: 'All required security headers are present',
        importance: 'high'
      });
    } else {
      const missing = SECURITY_HEADERS_STANDARDS.REQUIRED_HEADERS.length - headersAnalysis.present.required;
      insights.push({
        type: 'negative',
        category: 'coverage',
        message: `${missing} required security headers are missing`,
        importance: 'critical'
      });
    }

    if (headersAnalysis.csp.present && headersAnalysis.csp.score > 80) {
      insights.push({
        type: 'positive',
        category: 'csp',
        message: 'Content Security Policy is well-configured',
        importance: 'high'
      });
    }

    if (headersAnalysis.deprecated.count > 0) {
      insights.push({
        type: 'warning',
        category: 'deprecated',
        message: `${headersAnalysis.deprecated.count} deprecated security headers detected`,
        importance: 'medium'
      });
    }

    return insights;
  }

  /**
   * Generate Security Headers Recommendations
   * 
   * @param {Object} headersAnalysis - Headers analysis results
   * @returns {Array} Security headers recommendations
   * @private
   */
  _generateHeadersRecommendations(headersAnalysis) {
    const recommendations = [];

    // Missing required headers
    headersAnalysis.present.missing
      .filter(header => header.type === 'required')
      .forEach(header => {
        recommendations.push({
          priority: 'high',
          category: 'missing-headers',
          title: `Add ${header.name} header`,
          description: `Implement ${header.name} security header`,
          actionItems: this._getHeaderImplementationSteps(header.name)
        });
      });

    // CSP recommendations
    if (!headersAnalysis.csp.present) {
      recommendations.push({
        priority: 'high',
        category: 'csp',
        title: 'Implement Content Security Policy',
        description: 'Add CSP header to prevent XSS and injection attacks',
        actionItems: [
          'Start with a restrictive CSP policy',
          'Use nonce or hash for inline scripts',
          'Avoid unsafe-inline and unsafe-eval',
          'Test thoroughly and monitor CSP reports'
        ]
      });
    }

    return recommendations;
  }

  // Helper methods (placeholder implementations)
  _normalizeHeaders(headers) {
    const normalized = {};
    Object.keys(headers).forEach(key => {
      normalized[key.toLowerCase()] = headers[key];
    });
    return normalized;
  }

  _validateSingleHeader(name, value) {
    // Placeholder implementation
    return { name, value, status: 'valid' };
  }

  _parseCSPDirectives(cspHeader) {
    const directives = {};
    cspHeader.split(';').forEach(directive => {
      const [name, ...values] = directive.trim().split(/\s+/);
      if (name) {
        directives[name] = values;
      }
    });
    return directives;
  }

  _analyzeCSPDirectives(directives) { return {}; }
  _detectCSPViolations(directives) { return []; }
  _calculateCSPScore(cspAnalysis) { return 70; }
  _getCSPSecurityLevel(score) { return score > 80 ? 'high' : score > 60 ? 'medium' : 'low'; }
  _getFrameProtectionLevel(value) { return value ? 'protected' : 'vulnerable'; }
  _getFrameOptionsRecommendation(value) { return value ? null : 'Add X-Frame-Options header'; }
  _getReferrerPrivacyLevel(policy) { return policy ? 'good' : 'poor'; }
  _parsePermissionsPolicy(header) { return {}; }
  _getDeprecationReason(header) { return 'Header is deprecated and should be replaced'; }
  _assessCompliance(analysis) { return { level: 'partial', score: 70 }; }
  _getHeaderImplementationSteps(headerName) {
    return [`Configure web server to send ${headerName} header`, 'Test implementation'];
  }
}

export default SecurityHeadersDetector;
