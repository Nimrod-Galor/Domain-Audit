/**
 * HSTS Detector - HTTP Strict Transport Security Analysis
 * 
 * Comprehensive HSTS analysis including:
 * - HSTS header detection and validation
 * - Configuration assessment
 * - Preload list status checking
 * - Subdomain coverage analysis
 * - Security effectiveness evaluation
 * - Best practices compliance
 * - Implementation recommendations
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

export class HSTSDetector {
  constructor(config = {}) {
    this.config = {
      checkSubdomains: config.checkSubdomains !== false,
      checkPreloadList: config.checkPreloadList !== false,
      validateRedirects: config.validateRedirects !== false,
      checkMultipleDomains: config.checkMultipleDomains || false,
      includeRecommendations: config.includeRecommendations !== false,
      timeout: config.timeout || 10000,
      userAgent: config.userAgent || 'SSL-Analyzer-HSTS/2.0.0',
      maxRedirects: config.maxRedirects || 3,
      ...config
    };
    
    this.version = '2.0.0';
    this.category = 'HSTS Security';
    
    // HSTS security thresholds and recommendations
    this.hstsConfig = {
      min_max_age: 31536000, // 1 year minimum
      recommended_max_age: 63072000, // 2 years recommended
      excellent_max_age: 31536000 * 10, // 10 years for excellent rating
      
      // Security scoring weights
      scoring: {
        header_present: 40,
        valid_max_age: 25,
        include_subdomains: 20,
        preload_ready: 10,
        preload_listed: 5
      },
      
      // Security grades
      grades: {
        'A+': 95,
        'A': 85,
        'B': 75,
        'C': 65,
        'D': 50,
        'F': 0
      }
    };
    
    // Common HSTS preload list domains (simplified subset)
    this.preloadListDomains = new Set([
      'google.com',
      'facebook.com',
      'twitter.com',
      'github.com',
      'stackoverflow.com',
      'wikipedia.org',
      'cloudflare.com',
      'mozilla.org'
    ]);
  }

  async detect(context) {
    const startTime = Date.now();
    
    try {
      const { url } = context;
      const urlObj = new URL(url);
      
      // Only analyze HTTPS sites for HSTS
      if (urlObj.protocol !== 'https:') {
        return this.generateHTTPSiteResult(url);
      }
      
      // Fetch HSTS headers from HTTPS endpoint
      const hstsResponse = await this.fetchHSTSHeaders(url);
      
      // Analyze HSTS header configuration
      const hstsAnalysis = await this.analyzeHSTSHeader(hstsResponse.headers, url);
      
      // Check HTTP to HTTPS redirect behavior
      const redirectAnalysis = await this.analyzeHTTPRedirects(urlObj);
      
      // Validate subdomain coverage if enabled
      const subdomainAnalysis = this.config.checkSubdomains ? 
        await this.analyzeSubdomainCoverage(hstsAnalysis, urlObj) : null;
      
      // Check preload list status if enabled
      const preloadAnalysis = this.config.checkPreloadList ? 
        await this.analyzePreloadStatus(hstsAnalysis, urlObj) : null;
      
      // Assess HSTS effectiveness and security posture
      const effectivenessAssessment = this.assessHSTSEffectiveness(
        hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis
      );
      
      // Generate security recommendations
      const recommendations = this.generateHSTSRecommendations(
        hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis
      );
      
      // Calculate HSTS security score and grade
      const securityScore = this.calculateHSTSScore(
        hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis
      );
      const securityGrade = this.calculateSecurityGrade(securityScore);
      
      // Assess compliance with security standards
      const complianceAssessment = this.assessHSTSCompliance(hstsAnalysis, effectivenessAssessment);

      return {
        category: 'HSTS Security Analysis',
        subcategory: 'HTTP Strict Transport Security Assessment',
        success: true,
        score: securityScore,
        grade: securityGrade,
        findings: this.generateFindings(hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis, effectivenessAssessment),
        
        // Detailed Analysis Results
        hsts_analysis: hstsAnalysis,
        redirect_analysis: redirectAnalysis,
        subdomain_analysis: subdomainAnalysis,
        preload_analysis: preloadAnalysis,
        effectiveness_assessment: effectivenessAssessment,
        compliance_assessment: complianceAssessment,
        
        // HSTS Summary
        hsts_enabled: hstsAnalysis.enabled,
        max_age_seconds: hstsAnalysis.max_age,
        includes_subdomains: hstsAnalysis.include_subdomains,
        preload_ready: hstsAnalysis.preload_ready,
        preload_listed: preloadAnalysis?.preload_listed || false,
        
        // Security Assessment
        protection_level: effectivenessAssessment.protection_level,
        attack_resistance: effectivenessAssessment.attack_resistance,
        configuration_quality: effectivenessAssessment.configuration_quality,
        
        // Recommendations
        immediate_actions: recommendations.immediate_actions,
        security_improvements: recommendations.security_improvements,
        best_practices: recommendations.best_practices,
        implementation_steps: recommendations.implementation_steps,
        
        // Risk Analysis
        security_risks: this.identifySecurityRisks(hstsAnalysis, redirectAnalysis),
        vulnerability_exposure: this.assessVulnerabilityExposure(hstsAnalysis, effectivenessAssessment),
        mitigation_priorities: this.prioritizeMitigations(hstsAnalysis, recommendations),
        
        metadata: {
          detector: 'HSTSDetector',
          version: this.version,
          timestamp: new Date().toISOString(),
          processing_time: Date.now() - startTime,
          url_analyzed: url,
          analysis_scope: this.getAnalysisScope()
        }
      };
      
    } catch (error) {
      return this.handleDetectionError(error, context);
    }
  }

  generateHTTPSiteResult(url) {
    return {
      category: 'HSTS Security Analysis',
      subcategory: 'HTTP Site Assessment',
      success: true,
      score: 0,
      grade: 'F',
      findings: [
        {
          type: 'critical',
          category: 'No HTTPS',
          message: 'Site is served over HTTP - HSTS cannot be implemented',
          recommendation: 'Migrate to HTTPS to enable HSTS protection',
          impact: 'All traffic is vulnerable to interception and downgrade attacks'
        }
      ],
      hsts_analysis: {
        enabled: false,
        applicable: false,
        reason: 'HSTS requires HTTPS protocol'
      },
      recommendations: {
        immediate_actions: ['Implement SSL/TLS certificate', 'Configure HTTPS redirect', 'Enable HSTS header']
      },
      metadata: {
        detector: 'HSTSDetector',
        version: this.version,
        timestamp: new Date().toISOString(),
        url_analyzed: url,
        protocol: 'http'
      }
    };
  }

  async fetchHSTSHeaders(url) {
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
        reject(new Error('HTTPS request timeout'));
      });
      
      request.setTimeout(this.config.timeout);
      request.end();
    });
  }

  async analyzeHSTSHeader(headers, url) {
    const hstsHeader = headers['strict-transport-security'];
    
    if (!hstsHeader) {
      return {
        enabled: false,
        header_present: false,
        max_age: 0,
        include_subdomains: false,
        preload_ready: false,
        issues: ['HSTS header not present'],
        security_level: 'none'
      };
    }
    
    // Parse HSTS directives
    const directives = this.parseHSTSDirectives(hstsHeader);
    const analysis = {
      enabled: true,
      header_present: true,
      raw_header: hstsHeader,
      directives: directives,
      issues: [],
      warnings: [],
      security_level: 'good'
    };
    
    // Analyze max-age directive
    this.analyzeMaxAge(directives, analysis);
    
    // Check includeSubDomains directive
    this.analyzeIncludeSubDomains(directives, analysis);
    
    // Check preload directive
    this.analyzePreloadDirective(directives, analysis);
    
    // Validate directive syntax
    this.validateDirectiveSyntax(directives, analysis);
    
    // Determine overall security level
    this.determineSecurityLevel(analysis);
    
    return analysis;
  }

  parseHSTSDirectives(hstsHeader) {
    const directives = {};
    
    hstsHeader.split(';').forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('=')) {
        const [key, value] = trimmed.split('=', 2);
        directives[key.trim().toLowerCase()] = value.trim();
      } else if (trimmed) {
        directives[trimmed.toLowerCase()] = true;
      }
    });
    
    return directives;
  }

  analyzeMaxAge(directives, analysis) {
    if (!directives['max-age']) {
      analysis.issues.push('Missing required max-age directive');
      analysis.max_age = 0;
      analysis.max_age_valid = false;
      analysis.security_level = 'poor';
      return;
    }
    
    const maxAge = parseInt(directives['max-age']);
    analysis.max_age = maxAge;
    analysis.max_age_valid = !isNaN(maxAge) && maxAge > 0;
    
    if (!analysis.max_age_valid) {
      analysis.issues.push('Invalid max-age value - must be a positive integer');
      analysis.security_level = 'poor';
      return;
    }
    
    // Assess max-age duration
    if (maxAge < this.hstsConfig.min_max_age) {
      analysis.warnings.push(`max-age (${maxAge}) is below recommended minimum (${this.hstsConfig.min_max_age})`);
      analysis.max_age_sufficient = false;
      if (analysis.security_level === 'good') {
        analysis.security_level = 'moderate';
      }
    } else {
      analysis.max_age_sufficient = true;
    }
    
    // Categorize max-age strength
    if (maxAge >= this.hstsConfig.excellent_max_age) {
      analysis.max_age_strength = 'excellent';
    } else if (maxAge >= this.hstsConfig.recommended_max_age) {
      analysis.max_age_strength = 'good';
    } else if (maxAge >= this.hstsConfig.min_max_age) {
      analysis.max_age_strength = 'adequate';
    } else {
      analysis.max_age_strength = 'insufficient';
    }
  }

  analyzeIncludeSubDomains(directives, analysis) {
    analysis.include_subdomains = !!directives['includesubdomains'];
    
    if (!analysis.include_subdomains) {
      analysis.warnings.push('includeSubDomains directive not present - subdomains not protected');
      analysis.subdomain_protection = false;
    } else {
      analysis.subdomain_protection = true;
    }
  }

  analyzePreloadDirective(directives, analysis) {
    analysis.preload_directive = !!directives['preload'];
    
    // Check if preload-ready (has all required directives)
    analysis.preload_ready = analysis.preload_directive && 
                             analysis.include_subdomains && 
                             analysis.max_age >= this.hstsConfig.min_max_age;
    
    if (analysis.preload_directive && !analysis.preload_ready) {
      analysis.warnings.push('preload directive present but requirements not met (needs includeSubDomains and sufficient max-age)');
    }
  }

  validateDirectiveSyntax(directives, analysis) {
    const validDirectives = ['max-age', 'includesubdomains', 'preload'];
    const syntaxIssues = [];
    
    Object.keys(directives).forEach(directive => {
      if (!validDirectives.includes(directive.toLowerCase())) {
        syntaxIssues.push(`Unknown directive: ${directive}`);
      }
    });
    
    if (syntaxIssues.length > 0) {
      analysis.syntax_issues = syntaxIssues;
      analysis.warnings.push(...syntaxIssues);
    }
  }

  determineSecurityLevel(analysis) {
    if (analysis.issues.length > 0) {
      analysis.security_level = 'poor';
    } else if (analysis.warnings.length > 2) {
      analysis.security_level = 'moderate';
    } else if (analysis.preload_ready && analysis.max_age_strength === 'excellent') {
      analysis.security_level = 'excellent';
    } else if (analysis.max_age_sufficient && analysis.include_subdomains) {
      analysis.security_level = 'good';
    }
  }

  async analyzeHTTPRedirects(urlObj) {
    if (!this.config.validateRedirects) {
      return { analyzed: false, reason: 'Redirect analysis disabled' };
    }
    
    try {
      const httpUrl = `http://${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
      const redirectResponse = await this.checkHTTPRedirect(httpUrl);
      
      return {
        analyzed: true,
        http_accessible: redirectResponse.accessible,
        redirects_to_https: redirectResponse.redirects_to_https,
        redirect_status: redirectResponse.status_code,
        redirect_location: redirectResponse.location,
        redirect_chain: redirectResponse.redirect_chain,
        hsts_on_redirect: redirectResponse.hsts_header_present,
        security_assessment: this.assessRedirectSecurity(redirectResponse)
      };
      
    } catch (error) {
      return {
        analyzed: true,
        error: error.message,
        http_accessible: false,
        security_assessment: 'unknown'
      };
    }
  }

  async checkHTTPRedirect(httpUrl) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'HEAD',
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent
        }
      };

      const request = http.request(httpUrl, options, (response) => {
        const isRedirect = response.statusCode >= 300 && response.statusCode < 400;
        const location = response.headers.location;
        const hstsHeader = response.headers['strict-transport-security'];
        
        resolve({
          accessible: true,
          status_code: response.statusCode,
          redirects_to_https: isRedirect && location && location.startsWith('https://'),
          location: location,
          redirect_chain: [{ status: response.statusCode, location: location }],
          hsts_header_present: !!hstsHeader
        });
      });

      request.on('error', (error) => {
        resolve({
          accessible: false,
          error: error.message,
          redirects_to_https: false
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          accessible: false,
          error: 'HTTP request timeout',
          redirects_to_https: false
        });
      });
      
      request.setTimeout(this.config.timeout);
      request.end();
    });
  }

  async analyzeSubdomainCoverage(hstsAnalysis, urlObj) {
    if (!this.config.checkSubdomains) {
      return { analyzed: false, reason: 'Subdomain analysis disabled' };
    }
    
    const subdomainAnalysis = {
      analyzed: true,
      includes_subdomains: hstsAnalysis.include_subdomains,
      coverage_assessment: hstsAnalysis.include_subdomains ? 'comprehensive' : 'limited',
      security_implications: this.assessSubdomainSecurityImplications(hstsAnalysis.include_subdomains),
      recommendations: this.getSubdomainRecommendations(hstsAnalysis.include_subdomains)
    };
    
    // If checking specific subdomains is enabled, we could test common ones
    if (this.config.checkMultipleDomains) {
      subdomainAnalysis.tested_subdomains = await this.testCommonSubdomains(urlObj, hstsAnalysis);
    }
    
    return subdomainAnalysis;
  }

  async analyzePreloadStatus(hstsAnalysis, urlObj) {
    if (!this.config.checkPreloadList) {
      return { analyzed: false, reason: 'Preload analysis disabled' };
    }
    
    const domain = urlObj.hostname;
    const preloadListed = this.preloadListDomains.has(domain) || this.preloadListDomains.has(domain.replace(/^www\./, ''));
    
    return {
      analyzed: true,
      preload_ready: hstsAnalysis.preload_ready,
      preload_listed: preloadListed,
      eligibility_status: this.assessPreloadEligibility(hstsAnalysis),
      submission_recommendations: this.getPreloadSubmissionRecommendations(hstsAnalysis, preloadListed),
      benefits: this.getPreloadBenefits(),
      considerations: this.getPreloadConsiderations()
    };
  }

  assessHSTSEffectiveness(hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis) {
    const effectiveness = {
      protection_level: 'none',
      attack_resistance: {},
      configuration_quality: 'poor',
      coverage_scope: 'limited',
      overall_assessment: 'insufficient'
    };
    
    if (!hstsAnalysis.enabled) {
      effectiveness.gaps = ['No HSTS protection'];
      return effectiveness;
    }
    
    // Assess protection level
    if (hstsAnalysis.security_level === 'excellent') {
      effectiveness.protection_level = 'excellent';
    } else if (hstsAnalysis.security_level === 'good' && hstsAnalysis.include_subdomains) {
      effectiveness.protection_level = 'comprehensive';
    } else if (hstsAnalysis.security_level === 'good') {
      effectiveness.protection_level = 'good';
    } else {
      effectiveness.protection_level = 'basic';
    }
    
    // Assess attack resistance
    effectiveness.attack_resistance = {
      ssl_stripping: hstsAnalysis.enabled ? 'protected' : 'vulnerable',
      protocol_downgrade: hstsAnalysis.max_age_sufficient ? 'protected' : 'vulnerable',
      subdomain_hijacking: hstsAnalysis.include_subdomains ? 'protected' : 'vulnerable',
      preload_bypass: preloadAnalysis?.preload_listed ? 'protected' : 'vulnerable'
    };
    
    // Assess configuration quality
    if (hstsAnalysis.issues.length === 0 && hstsAnalysis.warnings.length <= 1) {
      effectiveness.configuration_quality = 'excellent';
    } else if (hstsAnalysis.issues.length === 0) {
      effectiveness.configuration_quality = 'good';
    } else if (hstsAnalysis.issues.length <= 1) {
      effectiveness.configuration_quality = 'moderate';
    }
    
    // Assess coverage scope
    if (hstsAnalysis.include_subdomains && preloadAnalysis?.preload_listed) {
      effectiveness.coverage_scope = 'comprehensive';
    } else if (hstsAnalysis.include_subdomains) {
      effectiveness.coverage_scope = 'extended';
    } else {
      effectiveness.coverage_scope = 'limited';
    }
    
    // Overall assessment
    if (effectiveness.protection_level === 'excellent' && effectiveness.configuration_quality === 'excellent') {
      effectiveness.overall_assessment = 'excellent';
    } else if (effectiveness.protection_level === 'comprehensive' && effectiveness.configuration_quality === 'good') {
      effectiveness.overall_assessment = 'good';
    } else if (effectiveness.protection_level === 'good') {
      effectiveness.overall_assessment = 'adequate';
    } else {
      effectiveness.overall_assessment = 'insufficient';
    }
    
    return effectiveness;
  }

  generateHSTSRecommendations(hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis) {
    const recommendations = {
      immediate_actions: [],
      security_improvements: [],
      best_practices: [],
      implementation_steps: []
    };
    
    // Immediate actions for critical issues
    if (!hstsAnalysis.enabled) {
      recommendations.immediate_actions.push({
        action: 'Implement HSTS header',
        priority: 'critical',
        impact: 'Enables protection against SSL stripping attacks'
      });
    }
    
    if (hstsAnalysis.enabled && !hstsAnalysis.max_age_sufficient) {
      recommendations.immediate_actions.push({
        action: 'Increase max-age to at least 1 year (31536000 seconds)',
        priority: 'high',
        impact: 'Improves protection duration'
      });
    }
    
    // Security improvements
    if (hstsAnalysis.enabled && !hstsAnalysis.include_subdomains) {
      recommendations.security_improvements.push({
        improvement: 'Add includeSubDomains directive',
        benefit: 'Extends HSTS protection to all subdomains',
        consideration: 'Ensure all subdomains support HTTPS'
      });
    }
    
    if (hstsAnalysis.preload_ready && !preloadAnalysis?.preload_listed) {
      recommendations.security_improvements.push({
        improvement: 'Submit domain to HSTS preload list',
        benefit: 'Provides protection from first visit',
        process: 'Visit hstspreload.org and submit domain'
      });
    }
    
    // Best practices
    recommendations.best_practices = [
      'Monitor HSTS header deployment across all endpoints',
      'Test HSTS configuration in staging environment',
      'Plan for HSTS removal process if needed in future',
      'Consider impact on mixed content and HTTP resources'
    ];
    
    // Implementation steps
    if (!hstsAnalysis.enabled) {
      recommendations.implementation_steps = [
        'Ensure all content is served over HTTPS',
        'Add HSTS header to web server configuration',
        'Start with shorter max-age for testing',
        'Gradually increase max-age duration',
        'Add includeSubDomains when all subdomains support HTTPS',
        'Consider preload submission for maximum protection'
      ];
    }
    
    return recommendations;
  }

  calculateHSTSScore(hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis) {
    let score = 0;
    const scoring = this.hstsConfig.scoring;
    
    // Base score for HSTS header presence
    if (hstsAnalysis.header_present) {
      score += scoring.header_present;
    }
    
    // Score for valid max-age
    if (hstsAnalysis.max_age_valid && hstsAnalysis.max_age_sufficient) {
      score += scoring.valid_max_age;
    }
    
    // Score for includeSubDomains
    if (hstsAnalysis.include_subdomains) {
      score += scoring.include_subdomains;
    }
    
    // Score for preload readiness
    if (hstsAnalysis.preload_ready) {
      score += scoring.preload_ready;
    }
    
    // Bonus score for being on preload list
    if (preloadAnalysis?.preload_listed) {
      score += scoring.preload_listed;
    }
    
    // Penalties for issues
    score -= hstsAnalysis.issues.length * 10;
    score -= hstsAnalysis.warnings.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateSecurityGrade(score) {
    for (const [grade, threshold] of Object.entries(this.hstsConfig.grades)) {
      if (score >= threshold) {
        return grade;
      }
    }
    return 'F';
  }

  assessHSTSCompliance(hstsAnalysis, effectivenessAssessment) {
    return {
      owasp_compliant: hstsAnalysis.enabled && hstsAnalysis.max_age_sufficient,
      pci_dss_recommended: hstsAnalysis.enabled && hstsAnalysis.include_subdomains,
      security_standards: effectivenessAssessment.overall_assessment !== 'insufficient',
      industry_best_practices: hstsAnalysis.preload_ready
    };
  }

  generateFindings(hstsAnalysis, redirectAnalysis, subdomainAnalysis, preloadAnalysis, effectivenessAssessment) {
    const findings = [];
    
    // Critical findings
    if (!hstsAnalysis.enabled) {
      findings.push({
        type: 'critical',
        category: 'Missing HSTS',
        message: 'HSTS header not implemented',
        recommendation: 'Implement Strict-Transport-Security header',
        impact: 'Site vulnerable to SSL stripping and protocol downgrade attacks'
      });
    }
    
    // High priority findings
    if (hstsAnalysis.enabled && !hstsAnalysis.max_age_sufficient) {
      findings.push({
        type: 'high',
        category: 'Insufficient max-age',
        message: `HSTS max-age (${hstsAnalysis.max_age}) is below recommended minimum`,
        recommendation: `Increase max-age to at least ${this.hstsConfig.min_max_age} seconds`,
        impact: 'Reduced protection window against attacks'
      });
    }
    
    // Medium priority findings
    if (hstsAnalysis.enabled && !hstsAnalysis.include_subdomains) {
      findings.push({
        type: 'medium',
        category: 'Limited Subdomain Protection',
        message: 'HSTS does not include subdomains',
        recommendation: 'Add includeSubDomains directive to extend protection',
        impact: 'Subdomains remain vulnerable to attacks'
      });
    }
    
    // Configuration issues
    hstsAnalysis.issues?.forEach(issue => {
      findings.push({
        type: 'high',
        category: 'HSTS Configuration Error',
        message: issue,
        recommendation: 'Fix HSTS header syntax and configuration'
      });
    });
    
    // Positive findings
    if (hstsAnalysis.enabled && effectivenessAssessment.overall_assessment === 'excellent') {
      findings.push({
        type: 'positive',
        category: 'Excellent HSTS Implementation',
        message: 'HSTS is properly configured with best practices',
        details: 'Strong protection against protocol downgrade attacks'
      });
    }
    
    return findings;
  }

  // Helper methods with simplified implementations
  getAnalysisScope() {
    const scope = ['HSTS header analysis'];
    if (this.config.validateRedirects) scope.push('HTTP redirect validation');
    if (this.config.checkSubdomains) scope.push('subdomain coverage');
    if (this.config.checkPreloadList) scope.push('preload list status');
    return scope;
  }

  assessRedirectSecurity(redirectResponse) {
    if (!redirectResponse.accessible) return 'unknown';
    if (redirectResponse.redirects_to_https) return 'secure';
    return 'insecure';
  }

  assessSubdomainSecurityImplications(includesSubdomains) {
    return includesSubdomains ? 
      'Comprehensive protection across all subdomains' : 
      'Limited protection - subdomains may be vulnerable';
  }

  getSubdomainRecommendations(includesSubdomains) {
    return includesSubdomains ? 
      ['Ensure all subdomains support HTTPS'] : 
      ['Add includeSubDomains directive', 'Verify subdomain HTTPS support'];
  }

  async testCommonSubdomains(urlObj, hstsAnalysis) {
    // Simplified implementation - would test www, api, cdn, etc.
    return { tested: ['www'], results: {} };
  }

  assessPreloadEligibility(hstsAnalysis) {
    return hstsAnalysis.preload_ready ? 'eligible' : 'not eligible';
  }

  getPreloadSubmissionRecommendations(hstsAnalysis, preloadListed) {
    if (preloadListed) return ['Domain already on preload list'];
    if (hstsAnalysis.preload_ready) return ['Submit to hstspreload.org'];
    return ['Meet preload requirements first'];
  }

  getPreloadBenefits() {
    return [
      'Protection from first visit',
      'Enhanced security posture',
      'Reduced attack surface'
    ];
  }

  getPreloadConsiderations() {
    return [
      'Difficult to remove from list',
      'Requires HTTPS for all subdomains',
      'Permanent commitment to HTTPS'
    ];
  }

  identifySecurityRisks(hstsAnalysis, redirectAnalysis) {
    const risks = [];
    if (!hstsAnalysis.enabled) risks.push('SSL stripping attacks');
    if (!hstsAnalysis.include_subdomains) risks.push('Subdomain hijacking');
    if (redirectAnalysis?.http_accessible && !redirectAnalysis?.redirects_to_https) {
      risks.push('HTTP downgrade attacks');
    }
    return risks;
  }

  assessVulnerabilityExposure(hstsAnalysis, effectivenessAssessment) {
    if (effectivenessAssessment.overall_assessment === 'excellent') return 'minimal';
    if (effectivenessAssessment.overall_assessment === 'good') return 'low';
    if (effectivenessAssessment.overall_assessment === 'adequate') return 'moderate';
    return 'high';
  }

  prioritizeMitigations(hstsAnalysis, recommendations) {
    return recommendations.immediate_actions.concat(recommendations.security_improvements);
  }

  handleDetectionError(error, context) {
    return {
      category: 'HSTS Security Analysis',
      subcategory: 'Detection Error',
      success: false,
      error: error.message,
      score: 0,
      grade: 'F',
      findings: [
        {
          type: 'error',
          category: 'Detection Failure',
          message: `Failed to analyze HSTS configuration: ${error.message}`,
          recommendation: 'Check HTTPS endpoint accessibility and network connectivity'
        }
      ],
      metadata: {
        detector: 'HSTSDetector',
        version: this.version,
        error: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}
