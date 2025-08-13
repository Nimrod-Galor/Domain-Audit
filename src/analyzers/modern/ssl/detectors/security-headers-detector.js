/**
 * Security Headers Detector - HTTP Security Headers Analysis
 * 
 * Comprehensive security headers analysis including:
 * - HTTPS security headers detection
 * - Security header validation
 * - Configuration assessment
 * - Best practices evaluation
 * - Missing headers identification
 * - Header effectiveness analysis
 * - Compliance verification
 */

import https from 'https';
import { URL } from 'url';

export class SecurityHeadersDetector {
  constructor(config = {}) {
    this.config = {
      includeRecommendations: config.includeRecommendations !== false,
      checkSubdomains: config.checkSubdomains || false,
      validateValues: config.validateValues !== false,
      checkRedirects: config.checkRedirects !== false,
      maxRedirects: config.maxRedirects || 5,
      timeout: config.timeout || 10000,
      userAgent: config.userAgent || 'SSL-Analyzer-SecurityHeaders/2.0.0',
      ...config
    };
    
    this.version = '2.0.0';
    this.category = 'Security Headers';
    
    // Security headers definitions with criticality and scoring
    this.securityHeaders = {
      'strict-transport-security': {
        name: 'HTTP Strict Transport Security (HSTS)',
        critical: true,
        score_weight: 20,
        required_directives: ['max-age'],
        optional_directives: ['includeSubDomains', 'preload'],
        min_max_age: 31536000, // 1 year
        description: 'Forces HTTPS connections and prevents protocol downgrade attacks'
      },
      'content-security-policy': {
        name: 'Content Security Policy (CSP)',
        critical: true,
        score_weight: 18,
        required_directives: ['default-src'],
        risky_values: ['unsafe-inline', 'unsafe-eval', '*'],
        description: 'Prevents XSS and data injection attacks'
      },
      'x-frame-options': {
        name: 'X-Frame-Options',
        critical: true,
        score_weight: 15,
        valid_values: ['DENY', 'SAMEORIGIN'],
        deprecated_by: 'content-security-policy',
        description: 'Prevents clickjacking attacks'
      },
      'x-content-type-options': {
        name: 'X-Content-Type-Options',
        critical: true,
        score_weight: 12,
        valid_values: ['nosniff'],
        description: 'Prevents MIME type sniffing attacks'
      },
      'referrer-policy': {
        name: 'Referrer Policy',
        critical: false,
        score_weight: 10,
        recommended_values: ['strict-origin-when-cross-origin', 'no-referrer'],
        risky_values: ['unsafe-url', 'origin'],
        description: 'Controls referrer information sent with requests'
      },
      'permissions-policy': {
        name: 'Permissions Policy',
        critical: false,
        score_weight: 8,
        replaces: 'feature-policy',
        description: 'Controls browser feature access'
      },
      'x-xss-protection': {
        name: 'X-XSS-Protection',
        critical: false,
        score_weight: 5,
        valid_values: ['1; mode=block', '0'],
        deprecated: true,
        description: 'Legacy XSS protection (deprecated in favor of CSP)'
      },
      'expect-ct': {
        name: 'Expect-CT',
        critical: false,
        score_weight: 8,
        required_directives: ['max-age'],
        optional_directives: ['enforce', 'report-uri'],
        description: 'Certificate Transparency enforcement'
      },
      'cross-origin-embedder-policy': {
        name: 'Cross-Origin-Embedder-Policy',
        critical: false,
        score_weight: 6,
        valid_values: ['require-corp', 'unsafe-none'],
        description: 'Controls cross-origin resource embedding'
      },
      'cross-origin-opener-policy': {
        name: 'Cross-Origin-Opener-Policy',
        critical: false,
        score_weight: 6,
        valid_values: ['same-origin', 'same-origin-allow-popups', 'unsafe-none'],
        description: 'Controls cross-origin window references'
      },
      'cross-origin-resource-policy': {
        name: 'Cross-Origin-Resource-Policy',
        critical: false,
        score_weight: 6,
        valid_values: ['same-site', 'same-origin', 'cross-origin'],
        description: 'Controls cross-origin resource access'
      }
    };
    
    // Security grade thresholds
    this.gradeThresholds = {
      'A+': 95,
      'A': 85,
      'B': 75,
      'C': 65,
      'D': 50,
      'F': 0
    };
  }

  async detect(context) {
    const startTime = Date.now();
    
    try {
      const { url } = context;
      const urlObj = new URL(url);
      
      // Fetch headers from the URL
      const headerResponse = await this.fetchHeaders(url);
      
      // Analyze security headers
      const headerAnalysis = await this.analyzeSecurityHeaders(headerResponse.headers);
      
      // Validate header configurations
      const validationResults = await this.validateHeaderConfigurations(headerResponse.headers);
      
      // Check for missing critical headers
      const missingHeaders = this.identifyMissingHeaders(headerResponse.headers);
      
      // Assess header effectiveness
      const effectiveness = this.assessHeaderEffectiveness(headerAnalysis, validationResults);
      
      // Generate security recommendations
      const recommendations = this.generateSecurityRecommendations(headerAnalysis, missingHeaders, validationResults);
      
      // Calculate security score and grade
      const securityScore = this.calculateSecurityScore(headerAnalysis, missingHeaders, validationResults);
      const securityGrade = this.calculateSecurityGrade(securityScore);
      
      // Assess compliance with security standards
      const complianceAssessment = this.assessSecurityCompliance(headerAnalysis, missingHeaders);

      return {
        category: 'Security Headers Analysis',
        subcategory: 'HTTP Security Headers Assessment',
        success: true,
        score: securityScore,
        grade: securityGrade,
        findings: this.generateFindings(headerAnalysis, missingHeaders, validationResults, effectiveness),
        
        // Detailed Analysis Results
        header_analysis: headerAnalysis,
        validation_results: validationResults,
        missing_headers: missingHeaders,
        effectiveness_assessment: effectiveness,
        compliance_assessment: complianceAssessment,
        
        // Security Summary
        total_headers_found: Object.keys(headerAnalysis.present_headers).length,
        critical_headers_present: headerAnalysis.critical_headers_count,
        security_issues: validationResults.total_issues,
        configuration_errors: validationResults.configuration_errors,
        
        // Recommendations
        immediate_fixes: recommendations.immediate_fixes,
        security_improvements: recommendations.security_improvements,
        best_practices: recommendations.best_practices,
        implementation_guide: recommendations.implementation_guide,
        
        // Risk Assessment
        security_risks: this.assessSecurityRisks(headerAnalysis, missingHeaders),
        attack_vectors: this.identifyAttackVectors(missingHeaders, validationResults),
        protection_gaps: this.identifyProtectionGaps(headerAnalysis, missingHeaders),
        
        metadata: {
          detector: 'SecurityHeadersDetector',
          version: this.version,
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - startTime,
          url_analyzed: url,
          response_code: headerResponse.statusCode
        }
      };
      
    } catch (error) {
      return this.handleDetectionError(error, context);
    }
  }

  async fetchHeaders(url) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'HEAD',
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': '*/*',
          'Connection': 'close'
        }
      };

      const request = https.request(url, options, (response) => {
        // If configured to check redirects, follow them
        if (this.config.checkRedirects && this.isRedirect(response.statusCode)) {
          const location = response.headers.location;
          if (location && this.config.maxRedirects > 0) {
            this.config.maxRedirects--;
            return this.fetchHeaders(location).then(resolve).catch(reject);
          }
        }
        
        resolve({
          headers: response.headers,
          statusCode: response.statusCode,
          url: url
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
      
      request.setTimeout(this.config.timeout);
      request.end();
    });
  }

  async analyzeSecurityHeaders(headers) {
    const presentHeaders = {};
    const missingHeaders = [];
    let criticalHeadersCount = 0;
    
    // Check each security header
    Object.keys(this.securityHeaders).forEach(headerKey => {
      const headerConfig = this.securityHeaders[headerKey];
      const headerValue = headers[headerKey] || headers[headerKey.toLowerCase()];
      
      if (headerValue) {
        presentHeaders[headerKey] = {
          name: headerConfig.name,
          value: headerValue,
          critical: headerConfig.critical,
          score_weight: headerConfig.score_weight,
          analysis: this.analyzeHeaderValue(headerKey, headerValue, headerConfig)
        };
        
        if (headerConfig.critical) {
          criticalHeadersCount++;
        }
      } else {
        missingHeaders.push({
          header: headerKey,
          name: headerConfig.name,
          critical: headerConfig.critical,
          score_weight: headerConfig.score_weight,
          description: headerConfig.description
        });
      }
    });
    
    return {
      present_headers: presentHeaders,
      missing_headers: missingHeaders,
      critical_headers_count: criticalHeadersCount,
      total_possible_score: this.calculateMaxPossibleScore(),
      header_coverage: this.calculateHeaderCoverage(presentHeaders)
    };
  }

  analyzeHeaderValue(headerKey, headerValue, headerConfig) {
    const analysis = {
      valid: true,
      issues: [],
      recommendations: [],
      security_level: 'good'
    };
    
    switch (headerKey) {
      case 'strict-transport-security':
        return this.analyzeHSTS(headerValue, analysis);
      
      case 'content-security-policy':
        return this.analyzeCSP(headerValue, analysis);
      
      case 'x-frame-options':
        return this.analyzeXFrameOptions(headerValue, analysis);
      
      case 'x-content-type-options':
        return this.analyzeXContentTypeOptions(headerValue, analysis);
      
      case 'referrer-policy':
        return this.analyzeReferrerPolicy(headerValue, analysis);
      
      case 'permissions-policy':
        return this.analyzePermissionsPolicy(headerValue, analysis);
      
      case 'expect-ct':
        return this.analyzeExpectCT(headerValue, analysis);
      
      default:
        return this.analyzeGenericHeader(headerValue, headerConfig, analysis);
    }
  }

  analyzeHSTS(headerValue, analysis) {
    const directives = this.parseDirectives(headerValue);
    
    // Check for max-age directive
    if (!directives['max-age']) {
      analysis.valid = false;
      analysis.issues.push('Missing required max-age directive');
      analysis.security_level = 'poor';
    } else {
      const maxAge = parseInt(directives['max-age']);
      if (maxAge < this.securityHeaders['strict-transport-security'].min_max_age) {
        analysis.issues.push(`max-age value (${maxAge}) is below recommended minimum (${this.securityHeaders['strict-transport-security'].min_max_age})`);
        analysis.security_level = 'moderate';
      }
    }
    
    // Check for includeSubDomains
    if (!directives['includeSubDomains']) {
      analysis.recommendations.push('Consider adding includeSubDomains directive for comprehensive protection');
    }
    
    // Check for preload
    if (!directives['preload']) {
      analysis.recommendations.push('Consider adding preload directive and submitting to HSTS preload list');
    }
    
    return analysis;
  }

  analyzeCSP(headerValue, analysis) {
    const directives = this.parseCSPDirectives(headerValue);
    
    // Check for default-src
    if (!directives['default-src']) {
      analysis.issues.push('Missing default-src directive - provides fallback for other directives');
      analysis.security_level = 'moderate';
    }
    
    // Check for unsafe directives
    Object.keys(directives).forEach(directive => {
      const values = directives[directive];
      if (values.includes('unsafe-inline')) {
        analysis.issues.push(`${directive} contains unsafe-inline - allows inline scripts/styles`);
        analysis.security_level = 'poor';
      }
      if (values.includes('unsafe-eval')) {
        analysis.issues.push(`${directive} contains unsafe-eval - allows eval() function`);
        analysis.security_level = 'poor';
      }
      if (values.includes('*')) {
        analysis.issues.push(`${directive} contains wildcard (*) - allows any source`);
        analysis.security_level = 'poor';
      }
    });
    
    // Check for script-src
    if (!directives['script-src']) {
      analysis.recommendations.push('Consider adding specific script-src directive');
    }
    
    return analysis;
  }

  analyzeXFrameOptions(headerValue, analysis) {
    const value = headerValue.toUpperCase();
    const validValues = this.securityHeaders['x-frame-options'].valid_values;
    
    if (!validValues.includes(value)) {
      analysis.valid = false;
      analysis.issues.push(`Invalid value "${headerValue}". Valid values: ${validValues.join(', ')}`);
      analysis.security_level = 'poor';
    }
    
    // Note about CSP frame-ancestors
    analysis.recommendations.push('Consider migrating to CSP frame-ancestors directive for more granular control');
    
    return analysis;
  }

  analyzeXContentTypeOptions(headerValue, analysis) {
    if (headerValue.toLowerCase() !== 'nosniff') {
      analysis.valid = false;
      analysis.issues.push(`Invalid value "${headerValue}". Should be "nosniff"`);
      analysis.security_level = 'poor';
    }
    
    return analysis;
  }

  analyzeReferrerPolicy(headerValue, analysis) {
    const recommendedValues = this.securityHeaders['referrer-policy'].recommended_values;
    const riskyValues = this.securityHeaders['referrer-policy'].risky_values;
    
    if (riskyValues.includes(headerValue)) {
      analysis.issues.push(`"${headerValue}" may leak sensitive information in referrer`);
      analysis.security_level = 'moderate';
    }
    
    if (!recommendedValues.includes(headerValue)) {
      analysis.recommendations.push(`Consider using: ${recommendedValues.join(' or ')}`);
    }
    
    return analysis;
  }

  analyzePermissionsPolicy(headerValue, analysis) {
    const policies = this.parsePermissionsPolicy(headerValue);
    
    if (policies.length === 0) {
      analysis.recommendations.push('Consider restricting specific browser features like camera, microphone, geolocation');
    }
    
    return analysis;
  }

  analyzeExpectCT(headerValue, analysis) {
    const directives = this.parseDirectives(headerValue);
    
    if (!directives['max-age']) {
      analysis.valid = false;
      analysis.issues.push('Missing required max-age directive');
      analysis.security_level = 'poor';
    }
    
    if (!directives['enforce'] && !directives['report-uri']) {
      analysis.recommendations.push('Consider adding enforce directive or report-uri for monitoring');
    }
    
    return analysis;
  }

  analyzeGenericHeader(headerValue, headerConfig, analysis) {
    if (headerConfig.valid_values && !headerConfig.valid_values.includes(headerValue)) {
      analysis.valid = false;
      analysis.issues.push(`Invalid value "${headerValue}". Valid values: ${headerConfig.valid_values.join(', ')}`);
      analysis.security_level = 'poor';
    }
    
    if (headerConfig.deprecated) {
      analysis.recommendations.push('This header is deprecated. Consider modern alternatives.');
    }
    
    return analysis;
  }

  async validateHeaderConfigurations(headers) {
    const validationResults = {
      total_issues: 0,
      configuration_errors: 0,
      warnings: 0,
      header_validations: {}
    };
    
    Object.keys(headers).forEach(headerName => {
      if (this.securityHeaders[headerName]) {
        const validation = this.validateSingleHeader(headerName, headers[headerName]);
        validationResults.header_validations[headerName] = validation;
        validationResults.total_issues += validation.issues.length;
        validationResults.configuration_errors += validation.errors;
        validationResults.warnings += validation.warnings;
      }
    });
    
    return validationResults;
  }

  validateSingleHeader(headerName, headerValue) {
    const validation = {
      header: headerName,
      value: headerValue,
      valid: true,
      issues: [],
      errors: 0,
      warnings: 0
    };
    
    const headerConfig = this.securityHeaders[headerName];
    if (!headerConfig) return validation;
    
    // Validate syntax and format
    if (headerName === 'content-security-policy') {
      validation.issues.push(...this.validateCSPSyntax(headerValue));
    }
    
    // Count errors and warnings
    validation.issues.forEach(issue => {
      if (issue.severity === 'error') {
        validation.errors++;
      } else if (issue.severity === 'warning') {
        validation.warnings++;
      }
    });
    
    validation.valid = validation.errors === 0;
    
    return validation;
  }

  identifyMissingHeaders(headers) {
    const missing = [];
    
    Object.keys(this.securityHeaders).forEach(headerKey => {
      if (!headers[headerKey] && !headers[headerKey.toLowerCase()]) {
        const headerConfig = this.securityHeaders[headerKey];
        missing.push({
          header: headerKey,
          name: headerConfig.name,
          critical: headerConfig.critical,
          description: headerConfig.description,
          impact: this.assessMissingHeaderImpact(headerKey)
        });
      }
    });
    
    return missing;
  }

  assessHeaderEffectiveness(headerAnalysis, validationResults) {
    const effectiveness = {
      overall_effectiveness: 'moderate',
      protection_coverage: 0,
      configuration_quality: 'good',
      critical_gaps: []
    };
    
    // Calculate protection coverage
    const totalPossibleHeaders = Object.keys(this.securityHeaders).length;
    const presentHeaders = Object.keys(headerAnalysis.present_headers).length;
    effectiveness.protection_coverage = (presentHeaders / totalPossibleHeaders) * 100;
    
    // Assess configuration quality
    if (validationResults.configuration_errors > 0) {
      effectiveness.configuration_quality = 'poor';
    } else if (validationResults.warnings > 2) {
      effectiveness.configuration_quality = 'moderate';
    }
    
    // Identify critical gaps
    headerAnalysis.missing_headers.forEach(missing => {
      if (missing.critical) {
        effectiveness.critical_gaps.push(missing.header);
      }
    });
    
    // Determine overall effectiveness
    if (effectiveness.critical_gaps.length > 0 || effectiveness.configuration_quality === 'poor') {
      effectiveness.overall_effectiveness = 'poor';
    } else if (effectiveness.protection_coverage > 80 && effectiveness.configuration_quality === 'good') {
      effectiveness.overall_effectiveness = 'excellent';
    } else if (effectiveness.protection_coverage > 60) {
      effectiveness.overall_effectiveness = 'good';
    }
    
    return effectiveness;
  }

  generateSecurityRecommendations(headerAnalysis, missingHeaders, validationResults) {
    const recommendations = {
      immediate_fixes: [],
      security_improvements: [],
      best_practices: [],
      implementation_guide: {}
    };
    
    // Immediate fixes for critical missing headers
    missingHeaders.forEach(missing => {
      if (missing.critical) {
        recommendations.immediate_fixes.push({
          action: `Implement ${missing.name}`,
          header: missing.header,
          priority: 'high',
          impact: missing.impact
        });
      }
    });
    
    // Security improvements for existing headers
    Object.keys(headerAnalysis.present_headers).forEach(headerKey => {
      const header = headerAnalysis.present_headers[headerKey];
      if (header.analysis.recommendations.length > 0) {
        recommendations.security_improvements.push({
          header: headerKey,
          suggestions: header.analysis.recommendations
        });
      }
    });
    
    // Best practices
    recommendations.best_practices = [
      'Regularly review and update security headers',
      'Test header configurations in staging environment',
      'Monitor for breaking changes when implementing strict policies',
      'Consider using security header scanners in CI/CD pipeline'
    ];
    
    // Implementation guide for missing headers
    missingHeaders.forEach(missing => {
      recommendations.implementation_guide[missing.header] = this.getImplementationGuide(missing.header);
    });
    
    return recommendations;
  }

  calculateSecurityScore(headerAnalysis, missingHeaders, validationResults) {
    let score = 0;
    const maxScore = this.calculateMaxPossibleScore();
    
    // Add points for present headers
    Object.keys(headerAnalysis.present_headers).forEach(headerKey => {
      const header = headerAnalysis.present_headers[headerKey];
      let headerScore = header.score_weight;
      
      // Reduce score for configuration issues
      if (!header.analysis.valid) {
        headerScore *= 0.5; // 50% penalty for invalid configuration
      } else if (header.analysis.security_level === 'moderate') {
        headerScore *= 0.8; // 20% penalty for moderate security
      } else if (header.analysis.security_level === 'poor') {
        headerScore *= 0.3; // 70% penalty for poor security
      }
      
      score += headerScore;
    });
    
    // Convert to percentage
    return Math.round((score / maxScore) * 100);
  }

  calculateSecurityGrade(score) {
    for (const [grade, threshold] of Object.entries(this.gradeThresholds)) {
      if (score >= threshold) {
        return grade;
      }
    }
    return 'F';
  }

  assessSecurityCompliance(headerAnalysis, missingHeaders) {
    return {
      owasp_compliance: this.assessOWASPCompliance(headerAnalysis, missingHeaders),
      pci_dss_compliance: this.assessPCIDSSCompliance(headerAnalysis, missingHeaders),
      security_standards: this.assessSecurityStandards(headerAnalysis, missingHeaders)
    };
  }

  generateFindings(headerAnalysis, missingHeaders, validationResults, effectiveness) {
    const findings = [];
    
    // Critical missing headers
    missingHeaders.filter(h => h.critical).forEach(missing => {
      findings.push({
        type: 'critical',
        category: 'Missing Security Header',
        message: `Missing critical security header: ${missing.name}`,
        recommendation: `Implement ${missing.header} header`,
        impact: missing.impact
      });
    });
    
    // Configuration errors
    Object.values(validationResults.header_validations).forEach(validation => {
      if (!validation.valid) {
        findings.push({
          type: 'high',
          category: 'Header Configuration Error',
          message: `Invalid configuration for ${validation.header}`,
          recommendation: 'Fix header configuration syntax and values',
          details: validation.issues
        });
      }
    });
    
    // Security improvements
    if (effectiveness.overall_effectiveness === 'poor') {
      findings.push({
        type: 'medium',
        category: 'Security Header Effectiveness',
        message: 'Overall security header protection is inadequate',
        recommendation: 'Implement missing critical headers and fix configuration errors',
        impact: 'Increased vulnerability to various web attacks'
      });
    }
    
    // Positive findings
    if (headerAnalysis.critical_headers_count >= 3 && validationResults.configuration_errors === 0) {
      findings.push({
        type: 'positive',
        category: 'Security Headers',
        message: 'Good security header implementation detected',
        details: `${headerAnalysis.critical_headers_count} critical headers properly configured`
      });
    }
    
    return findings;
  }

  // Helper methods
  parseDirectives(headerValue) {
    const directives = {};
    headerValue.split(';').forEach(part => {
      const [key, value] = part.trim().split('=');
      directives[key.trim()] = value ? value.trim() : true;
    });
    return directives;
  }

  parseCSPDirectives(headerValue) {
    const directives = {};
    headerValue.split(';').forEach(part => {
      const trimmed = part.trim();
      if (trimmed) {
        const [directive, ...values] = trimmed.split(/\s+/);
        directives[directive] = values;
      }
    });
    return directives;
  }

  parsePermissionsPolicy(headerValue) {
    // Simplified parsing
    return headerValue.split(',').map(policy => policy.trim()).filter(p => p);
  }

  isRedirect(statusCode) {
    return statusCode >= 300 && statusCode < 400;
  }

  calculateMaxPossibleScore() {
    return Object.values(this.securityHeaders).reduce((sum, header) => sum + header.score_weight, 0);
  }

  calculateHeaderCoverage(presentHeaders) {
    const totalHeaders = Object.keys(this.securityHeaders).length;
    const presentCount = Object.keys(presentHeaders).length;
    return Math.round((presentCount / totalHeaders) * 100);
  }

  assessMissingHeaderImpact(headerKey) {
    const impacts = {
      'strict-transport-security': 'Susceptible to protocol downgrade attacks',
      'content-security-policy': 'Vulnerable to XSS and data injection attacks',
      'x-frame-options': 'Susceptible to clickjacking attacks',
      'x-content-type-options': 'Vulnerable to MIME type sniffing attacks'
    };
    return impacts[headerKey] || 'Reduced security posture';
  }

  getImplementationGuide(headerKey) {
    const guides = {
      'strict-transport-security': 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
      'content-security-policy': 'Content-Security-Policy: default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'',
      'x-frame-options': 'X-Frame-Options: DENY',
      'x-content-type-options': 'X-Content-Type-Options: nosniff'
    };
    return guides[headerKey] || 'Consult security documentation for implementation';
  }

  validateCSPSyntax(headerValue) {
    const issues = [];
    // Basic CSP validation
    if (!headerValue.includes('-src')) {
      issues.push({ severity: 'warning', message: 'CSP should contain at least one source directive' });
    }
    return issues;
  }

  // Simplified compliance assessments
  assessOWASPCompliance(headerAnalysis, missingHeaders) {
    return { compliant: missingHeaders.filter(h => h.critical).length === 0 };
  }

  assessPCIDSSCompliance(headerAnalysis, missingHeaders) {
    return { compliant: missingHeaders.filter(h => h.critical).length === 0 };
  }

  assessSecurityStandards(headerAnalysis, missingHeaders) {
    return { meets_standards: missingHeaders.filter(h => h.critical).length === 0 };
  }

  assessSecurityRisks(headerAnalysis, missingHeaders) {
    return missingHeaders.filter(h => h.critical).map(h => h.header);
  }

  identifyAttackVectors(missingHeaders, validationResults) {
    const vectors = [];
    if (missingHeaders.some(h => h.header === 'content-security-policy')) {
      vectors.push('XSS attacks');
    }
    if (missingHeaders.some(h => h.header === 'x-frame-options')) {
      vectors.push('Clickjacking attacks');
    }
    return vectors;
  }

  identifyProtectionGaps(headerAnalysis, missingHeaders) {
    return missingHeaders.filter(h => h.critical).map(h => ({
      protection: h.name,
      gap: h.description
    }));
  }

  handleDetectionError(error, context) {
    return {
      category: 'Security Headers Analysis',
      subcategory: 'Detection Error',
      success: false,
      error: error.message,
      score: 0,
      grade: 'F',
      findings: [
        {
          type: 'error',
          category: 'Detection Failure',
          message: `Failed to analyze security headers: ${error.message}`,
          recommendation: 'Check server accessibility and network connectivity'
        }
      ],
      metadata: {
        detector: 'SecurityHeadersDetector',
        version: this.version,
        error: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}
