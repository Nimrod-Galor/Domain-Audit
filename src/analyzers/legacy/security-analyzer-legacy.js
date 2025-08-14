/**
 * ============================================================================
 * SECURITY ANALYZER - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Security Analyzer implementing the Combined Approach pattern.
 * This file serves as the entry point and orchestrates the modern
 * Security Analyzer implementation.
 * 
 * Features:
 * - GPT-5 Style Modular Components (SSL, Headers, Vulnerabilities)
 * - GPT-5 Style Heuristics and Rules (Risk Analysis, Compliance)
 * - Claude Style AI Enhancement (Threat Intelligence, Predictions)
 * - Integration with Existing SecurityAnalyzer
 * - Comprehensive Security Analysis
 * - Multi-framework Compliance Assessment
 * - Enterprise-grade Threat Detection
 * - Predictive Security Analytics
 * 
 * @module SecurityAnalyzer
 * @version 2.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-12
 */

// Import the modern Combined Approach implementation
import { SecurityAnalyzerModern } from './security/security-analyzer-modern.js';
import { BaseAnalyzer } from './core/BaseAnalyzer.js';

/**
 * Security Standards and Configuration
 */
export const SECURITY_STANDARDS = {
  HTTPS: {
    REQUIRED: true,
    HSTS_MIN_AGE: 31536000, // 1 year
    HSTS_INCLUDE_SUBDOMAINS: true
  },
  HEADERS: {
    REQUIRED: [
      'strict-transport-security',
      'content-security-policy', 
      'x-frame-options',
      'x-content-type-options'
    ],
    OPTIONAL: [
      'referrer-policy',
      'permissions-policy',
      'x-xss-protection',
      'expect-ct'
    ]
  },
  CSP: {
    DANGEROUS_DIRECTIVES: ['unsafe-inline', 'unsafe-eval', '*'],
    REQUIRED_DIRECTIVES: ['default-src', 'script-src', 'style-src']
  },
  COOKIES: {
    REQUIRED_FLAGS: ['secure', 'httponly'],
    SAMESITE_OPTIONS: ['strict', 'lax', 'none']
  },
  VULNERABILITIES: {
    XSS_PATTERNS: [
      '<script', 'javascript:', 'onerror=', 'onload=', 'onclick=',
      'eval(', 'document.write', 'innerHTML', 'outerHTML'
    ],
    SENSITIVE_HEADERS: [
      'server', 'x-powered-by', 'x-aspnet-version', 'x-generator'
    ]
  }
};

/**
 * SecurityAnalyzer Class
 * Comprehensive security analysis with BaseAnalyzer integration
 */
export class SecurityAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super(options);
    
    // Initialize the modern Combined Approach implementation
    this.modernAnalyzer = new SecurityAnalyzerModern(options);
    
    this.config = {
      strictMode: options.strictMode || false,
      checkMixedContent: options.checkMixedContent !== false,
      analyzeCookies: options.analyzeCookies !== false,
      checkCSP: options.checkCSP !== false,
      vulnerabilityScanning: options.vulnerabilityScanning !== false,
      complianceLevel: options.complianceLevel || 'standard', // basic, standard, strict
      // Combined Approach configuration
      legacyMode: options.legacyMode || false,
      hybridMode: options.hybridMode !== false, // Default to hybrid
      useModernAnalyzer: options.useModernAnalyzer !== false, // Default to modern
      ...options
    };
    
    this.name = 'SecurityAnalyzer';
    this.version = '2.0.0';
  }

  /**
   * Main analysis entry point - Combined Approach implementation
   * @param {Object} context - Analysis context with DOM, headers, and page data
   * @returns {Object} Comprehensive security analysis results
   */
  async analyze(context) {
    return this.measureTime(async () => {
      try {
        this.logAnalysisStart('Security');

        // Use modern Combined Approach implementation by default
        if (this.config.useModernAnalyzer && !this.config.legacyMode) {
          const modernResults = await this.modernAnalyzer.analyze(context);
          
          // Optionally enhance with legacy compatibility
          if (this.config.hybridMode) {
            try {
              const legacyResults = await this.performLegacyAnalysis(context);
              return this.mergeLegacyAndModern(legacyResults, modernResults);
            } catch (legacyError) {
              this.logError('Legacy analysis failed, using modern results only', legacyError);
              return modernResults;
            }
          }
          
          return modernResults;
        }

        // Fallback to legacy implementation if requested
        return await this.performLegacyAnalysis(context);

      } catch (error) {
        this.logError('Security analysis failed', error);
        throw error;
      }
    });
  }

  /**
   * Legacy security analysis implementation (backward compatibility)
   * @param {Object} context - Analysis context
   * @returns {Object} Legacy security analysis results
   */
  async performLegacyAnalysis(context) {
    try {
      this.log('Starting legacy security analysis', 'info');
      
      const { dom, url, headers = {}, pageData = {} } = context;
      if (!dom || !dom.window || !dom.window.document) {
        throw new Error('Invalid DOM context provided');
      }
      
      const document = dom.window.document;
      const pageUrl = new URL(url);
      const isHTTPS = pageUrl.protocol === 'https:';
      
      this.log(`Analyzing security for ${url}`, 'info');
      
      // Perform comprehensive security analysis
      const analysis = {
        // Core security components
        https: await this._analyzeHTTPS(pageUrl, headers),
        securityHeaders: await this._analyzeSecurityHeaders(headers),
        contentSecurity: await this._analyzeContentSecurity(document, headers),
        mixedContent: await this._analyzeMixedContent(document, isHTTPS),
        cookies: await this._analyzeCookies(document, headers),
        authentication: await this._analyzeAuthentication(document),
        vulnerabilities: await this._analyzeVulnerabilities(document, headers),
        serverSecurity: await this._analyzeServerSecurity(headers),
        
        // Integration with existing data
          existingData: pageData.security || {},
          
          // Analysis metadata
          complianceLevel: this.config.complianceLevel,
          analysisTimestamp: new Date().toISOString(),
          analyzerVersion: this.version,
          isHTTPS
        };

        // Calculate security scores
        analysis.securityScore = this._calculateSecurityScore(analysis);
        analysis.complianceScores = this._calculateComplianceScores(analysis);
        
        // Generate actionable recommendations
        analysis.recommendations = this._generateSecurityRecommendations(analysis);
        
        // Risk assessment
        analysis.riskAssessment = this._assessSecurityRisks(analysis);
        
        // Performance analysis
        analysis.performanceMetrics = this._analyzeSecurityPerformance(analysis);
        
        // Summary statistics
        analysis.summary = this._generateSecuritySummary(analysis);
        
        this.log(`Security analysis completed - Score: ${analysis.securityScore}/100`, 'info');
        
        return {
          success: true,
          data: analysis,
          metadata: this.getMetadata(),
          timestamp: new Date().toISOString(),
          analysisType: 'legacy'
        };
        
      } catch (error) {
        return this.handleError('Legacy security analysis failed', error, {
          https: null,
          securityHeaders: null,
          contentSecurity: null,
          vulnerabilities: null,
          securityScore: 0,
          recommendations: []
        });
      }
  }

  /**
   * Merge legacy and modern analysis results
   * @param {Object} legacyResults - Results from legacy analysis
   * @param {Object} modernResults - Results from modern Combined Approach
   * @returns {Object} Merged analysis results
   */
  mergeLegacyAndModern(legacyResults, modernResults) {
    try {
      return {
        success: true,
        data: {
          // Modern results take precedence
          ...modernResults.data,
          // Legacy compatibility data
          legacy: legacyResults.data,
          // Combined scoring
          securityScore: Math.max(
            legacyResults.data?.securityScore || 0,
            modernResults.data?.overallScore || 0
          ),
          // Merged recommendations
          recommendations: [
            ...(modernResults.data?.recommendations || []),
            ...(legacyResults.data?.recommendations || [])
          ],
          // Analysis metadata
          analysisTypes: ['legacy', 'modern-combined-approach'],
          modernFeatures: modernResults.data?.features || {},
          legacyCompatibility: true
        },
        metadata: {
          ...modernResults.metadata,
          legacyCompatible: true,
          hybridAnalysis: true
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logError('Failed to merge legacy and modern results', error);
      // Return modern results as fallback
      return modernResults;
    }
  }

  /**
   * Analyze HTTPS/TLS security
   */
  async _analyzeHTTPS(pageUrl, headers) {
    try {
      const isHTTPS = pageUrl.protocol === 'https:';
      const hstsHeader = headers['strict-transport-security'] || '';
      
      const analysis = {
        enabled: isHTTPS,
        secure: isHTTPS,
        hsts: {
          enabled: !!hstsHeader,
          maxAge: this._extractHSTSMaxAge(hstsHeader),
          includeSubdomains: hstsHeader.includes('includeSubDomains'),
          preload: hstsHeader.includes('preload'),
          header: hstsHeader
        },
        certificate: {
          // Note: Certificate analysis would require server-side validation
          valid: isHTTPS, // Assume valid if HTTPS
          trusted: isHTTPS,
          expiry: null // Would need certificate inspection
        }
      };
      
      // Calculate HTTPS score
      let score = 0;
      if (analysis.enabled) score += 60;
      if (analysis.hsts.enabled) score += 20;
      if (analysis.hsts.maxAge >= SECURITY_STANDARDS.HTTPS.HSTS_MIN_AGE) score += 10;
      if (analysis.hsts.includeSubdomains) score += 5;
      if (analysis.hsts.preload) score += 5;
      
      analysis.score = score;
      
      return analysis;
    } catch (error) {
      this.log(`HTTPS analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze security headers comprehensively
   */
  async _analyzeSecurityHeaders(headers) {
    try {
      const analysis = {
        headers: {},
        missing: [],
        weak: [],
        total: 0,
        score: 0
      };
      
      // Required security headers
      const requiredHeaders = SECURITY_STANDARDS.HEADERS.REQUIRED;
      const optionalHeaders = SECURITY_STANDARDS.HEADERS.OPTIONAL;
      
      for (const headerName of requiredHeaders) {
        const headerValue = headers[headerName] || '';
        analysis.headers[headerName] = {
          present: !!headerValue,
          value: headerValue,
          secure: this._evaluateHeaderSecurity(headerName, headerValue)
        };
        
        if (headerValue) {
          analysis.total++;
          if (headerName === 'content-security-policy') {
            analysis.headers[headerName].cspAnalysis = this._analyzeCSP(headerValue);
          }
        } else {
          analysis.missing.push(headerName);
        }
      }
      
      // Optional security headers
      for (const headerName of optionalHeaders) {
        const headerValue = headers[headerName] || '';
        if (headerValue) {
          analysis.headers[headerName] = {
            present: true,
            value: headerValue,
            secure: this._evaluateHeaderSecurity(headerName, headerValue)
          };
          analysis.total++;
        }
      }
      
      // Information disclosure headers (security risk)
      const sensitiveHeaders = SECURITY_STANDARDS.VULNERABILITIES.SENSITIVE_HEADERS;
      analysis.informationDisclosure = {};
      
      for (const headerName of sensitiveHeaders) {
        const headerValue = headers[headerName] || '';
        if (headerValue) {
          analysis.informationDisclosure[headerName] = headerValue;
        }
      }
      
      // Calculate score
      const maxScore = 100;
      const requiredScore = (requiredHeaders.length - analysis.missing.length) / requiredHeaders.length * 80;
      const optionalScore = Math.min(20, analysis.total - (requiredHeaders.length - analysis.missing.length) * 5);
      const disclosurePenalty = Object.keys(analysis.informationDisclosure).length * 5;
      
      analysis.score = Math.max(0, requiredScore + optionalScore - disclosurePenalty);
      
      return analysis;
    } catch (error) {
      this.log(`Security headers analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze Content Security Policy
   */
  _analyzeCSP(cspHeader) {
    const directives = cspHeader.split(';').map(d => d.trim()).filter(d => d);
    const analysis = {
      directives: {},
      directiveCount: directives.length,
      dangerous: [],
      missing: [],
      score: 0
    };
    
    // Parse directives
    directives.forEach(directive => {
      const [name, ...values] = directive.split(' ');
      analysis.directives[name] = values;
      
      // Check for dangerous values
      const dangerousValues = values.filter(v => 
        SECURITY_STANDARDS.CSP.DANGEROUS_DIRECTIVES.some(dangerous => v.includes(dangerous))
      );
      
      if (dangerousValues.length > 0) {
        analysis.dangerous.push({
          directive: name,
          values: dangerousValues,
          risk: 'high'
        });
      }
    });
    
    // Check for required directives
    SECURITY_STANDARDS.CSP.REQUIRED_DIRECTIVES.forEach(required => {
      if (!analysis.directives[required]) {
        analysis.missing.push(required);
      }
    });
    
    // Calculate CSP score
    let score = 100;
    score -= analysis.dangerous.length * 20; // Deduct for dangerous directives
    score -= analysis.missing.length * 15;   // Deduct for missing directives
    
    analysis.score = Math.max(0, score);
    
    return analysis;
  }

  /**
   * Analyze content security (mixed content, inline scripts, etc.)
   */
  async _analyzeContentSecurity(document, headers) {
    try {
      const analysis = {
        inlineScripts: 0,
        inlineStyles: 0,
        externalScripts: 0,
        externalStyles: 0,
        unsafeElements: [],
        score: 0
      };
      
      // Analyze inline scripts
      const inlineScripts = Array.from(this.safeQuery(document, 'script:not([src])'));
      analysis.inlineScripts = inlineScripts.length;
      
      inlineScripts.forEach((script, index) => {
        if (script.textContent?.trim()) {
          analysis.unsafeElements.push({
            type: 'inline-script',
            position: `Script ${index + 1}`,
            risk: 'high',
            content: script.textContent.substring(0, 100) + '...'
          });
        }
      });
      
      // Analyze inline styles
      const inlineStyles = Array.from(this.safeQuery(document, 'style, [style]'));
      analysis.inlineStyles = inlineStyles.length;
      
      // Count external resources
      analysis.externalScripts = Array.from(this.safeQuery(document, 'script[src]')).length;
      analysis.externalStyles = Array.from(this.safeQuery(document, 'link[rel="stylesheet"]')).length;
      
      // Check for dangerous elements
      const dangerousElements = Array.from(this.safeQuery(document, 'object, embed, applet, iframe[src*="javascript:"]'));
      dangerousElements.forEach((element, index) => {
        analysis.unsafeElements.push({
          type: element.tagName.toLowerCase(),
          position: `Element ${index + 1}`,
          risk: 'medium',
          src: element.src || element.data || 'No source'
        });
      });
      
      // Calculate content security score
      let score = 100;
      score -= analysis.inlineScripts * 10;     // Deduct for inline scripts
      score -= analysis.inlineStyles * 2;      // Deduct for inline styles  
      score -= dangerousElements.length * 15;  // Deduct for dangerous elements
      
      analysis.score = Math.max(0, score);
      
      return analysis;
    } catch (error) {
      this.log(`Content security analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze mixed content issues
   */
  async _analyzeMixedContent(document, isHTTPS) {
    try {
      const analysis = {
        detected: false,
        issues: [],
        riskLevel: 'none',
        score: 100
      };
      
      if (!isHTTPS) {
        return { ...analysis, score: 0, riskLevel: 'critical', note: 'Page not served over HTTPS' };
      }
      
      // Check for HTTP resources on HTTPS page
      const httpResources = [
        ...Array.from(this.safeQuery(document, 'script[src^="http:"]')),
        ...Array.from(this.safeQuery(document, 'link[href^="http:"]')),
        ...Array.from(this.safeQuery(document, 'img[src^="http:"]')),
        ...Array.from(this.safeQuery(document, 'iframe[src^="http:"]')),
        ...Array.from(this.safeQuery(document, 'object[data^="http:"]')),
        ...Array.from(this.safeQuery(document, 'embed[src^="http:"]'))
      ];
      
      httpResources.forEach((element, index) => {
        const resourceType = element.tagName.toLowerCase();
        const url = element.src || element.href || element.data;
        const risk = this._assessMixedContentRisk(resourceType);
        
        analysis.issues.push({
          type: resourceType,
          url,
          risk,
          position: `${resourceType} ${index + 1}`
        });
      });
      
      if (analysis.issues.length > 0) {
        analysis.detected = true;
        analysis.riskLevel = this._calculateMixedContentRisk(analysis.issues);
        analysis.score = Math.max(0, 100 - analysis.issues.length * 10);
      }
      
      return analysis;
    } catch (error) {
      this.log(`Mixed content analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze cookie security
   */
  async _analyzeCookies(document, headers) {
    try {
      const analysis = {
        total: 0,
        secure: 0,
        httpOnly: 0,
        sameSite: 0,
        issues: [],
        score: 0
      };
      
      // Parse Set-Cookie headers (would need access to all response headers)
      const setCookieHeaders = headers['set-cookie'] || [];
      const cookieHeaders = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders].filter(Boolean);
      
      cookieHeaders.forEach((cookieHeader, index) => {
        if (!cookieHeader) return;
        
        analysis.total++;
        const cookieLower = cookieHeader.toLowerCase();
        
        if (cookieLower.includes('secure')) analysis.secure++;
        if (cookieLower.includes('httponly')) analysis.httpOnly++;
        if (cookieLower.includes('samesite=')) analysis.sameSite++;
        
        // Check for issues
        if (!cookieLower.includes('secure')) {
          analysis.issues.push({
            type: 'insecure-cookie',
            cookie: cookieHeader.split(';')[0],
            risk: 'medium',
            issue: 'Cookie not marked as Secure'
          });
        }
        
        if (!cookieLower.includes('httponly')) {
          analysis.issues.push({
            type: 'accessible-cookie',
            cookie: cookieHeader.split(';')[0],
            risk: 'medium',
            issue: 'Cookie accessible to JavaScript'
          });
        }
      });
      
      // Calculate cookie security score
      if (analysis.total === 0) {
        analysis.score = 100; // No cookies is not a security issue
      } else {
        const secureRatio = analysis.secure / analysis.total;
        const httpOnlyRatio = analysis.httpOnly / analysis.total;
        const sameSiteRatio = analysis.sameSite / analysis.total;
        
        analysis.score = Math.round((secureRatio * 40) + (httpOnlyRatio * 40) + (sameSiteRatio * 20));
      }
      
      return analysis;
    } catch (error) {
      this.log(`Cookie analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze authentication security
   */
  async _analyzeAuthentication(document) {
    try {
      const analysis = {
        formsDetected: 0,
        passwordFields: 0,
        secureLogin: false,
        twoFactorPresent: false,
        issues: [],
        score: 0
      };
      
      // Find forms
      const forms = Array.from(this.safeQuery(document, 'form'));
      analysis.formsDetected = forms.length;
      
      forms.forEach((form, formIndex) => {
        const passwordFields = Array.from(this.safeQuery(form, 'input[type="password"]'));
        analysis.passwordFields += passwordFields.length;
        
        if (passwordFields.length > 0) {
          // Check if form submits over HTTPS
          const action = form.action || '';
          const method = form.method?.toLowerCase() || 'get';
          
          if (action.startsWith('http:')) {
            analysis.issues.push({
              type: 'insecure-form',
              form: `Form ${formIndex + 1}`,
              risk: 'critical',
              issue: 'Password form submits over HTTP'
            });
          }
          
          if (method === 'get') {
            analysis.issues.push({
              type: 'insecure-method',
              form: `Form ${formIndex + 1}`,
              risk: 'high',
              issue: 'Password form uses GET method'
            });
          }
          
          // Check for autocomplete settings
          passwordFields.forEach((field, fieldIndex) => {
            if (field.autocomplete !== 'off' && field.autocomplete !== 'current-password') {
              analysis.issues.push({
                type: 'autocomplete-risk',
                field: `Password field ${fieldIndex + 1}`,
                risk: 'low',
                issue: 'Password field allows autocomplete'
              });
            }
          });
        }
      });
      
      // Check for 2FA indicators
      const twoFactorIndicators = [
        'two-factor', '2fa', 'mfa', 'multi-factor', 'authenticator',
        'verification code', 'security code', 'backup codes'
      ];
      
      const pageText = document.body?.textContent?.toLowerCase() || '';
      analysis.twoFactorPresent = twoFactorIndicators.some(indicator => 
        pageText.includes(indicator)
      );
      
      // Calculate authentication score
      let score = 100;
      if (analysis.passwordFields > 0) {
        score -= analysis.issues.filter(i => i.risk === 'critical').length * 30;
        score -= analysis.issues.filter(i => i.risk === 'high').length * 20;
        score -= analysis.issues.filter(i => i.risk === 'medium').length * 10;
        score -= analysis.issues.filter(i => i.risk === 'low').length * 5;
        
        if (analysis.twoFactorPresent) score += 10; // Bonus for 2FA
      }
      
      analysis.score = Math.max(0, score);
      
      return analysis;
    } catch (error) {
      this.log(`Authentication analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze vulnerabilities (XSS, injection, etc.)
   */
  async _analyzeVulnerabilities(document, headers) {
    try {
      const analysis = {
        xssRisks: [],
        injectionRisks: [],
        clickjackingRisk: false,
        informationDisclosure: [],
        totalRisks: 0,
        score: 0
      };
      
      // Check for XSS vulnerabilities
      const xssPatterns = SECURITY_STANDARDS.VULNERABILITIES.XSS_PATTERNS;
      const pageHTML = document.documentElement?.outerHTML || '';
      
      xssPatterns.forEach(pattern => {
        if (pageHTML.toLowerCase().includes(pattern.toLowerCase())) {
          analysis.xssRisks.push({
            pattern,
            risk: 'high',
            type: 'potential-xss',
            message: `Potentially dangerous pattern found: ${pattern}`
          });
        }
      });
      
      // Check for clickjacking protection
      const xfoHeader = headers['x-frame-options'] || '';
      const cspHeader = headers['content-security-policy'] || '';
      
      analysis.clickjackingRisk = !xfoHeader && !cspHeader.includes('frame-ancestors');
      
      if (analysis.clickjackingRisk) {
        analysis.injectionRisks.push({
          type: 'clickjacking',
          risk: 'medium',
          message: 'Page not protected against clickjacking attacks'
        });
      }
      
      // Check for information disclosure
      const sensitiveHeaders = SECURITY_STANDARDS.VULNERABILITIES.SENSITIVE_HEADERS;
      sensitiveHeaders.forEach(headerName => {
        const headerValue = headers[headerName];
        if (headerValue) {
          analysis.informationDisclosure.push({
            header: headerName,
            value: headerValue,
            risk: 'low',
            message: `Server information disclosed: ${headerName}`
          });
        }
      });
      
      // Calculate total risks
      analysis.totalRisks = analysis.xssRisks.length + 
                           analysis.injectionRisks.length + 
                           analysis.informationDisclosure.length;
      
      // Calculate vulnerability score
      let score = 100;
      score -= analysis.xssRisks.length * 15;
      score -= analysis.injectionRisks.length * 10;
      score -= analysis.informationDisclosure.length * 5;
      
      analysis.score = Math.max(0, score);
      
      return analysis;
    } catch (error) {
      this.log(`Vulnerability analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Analyze server security configuration
   */
  async _analyzeServerSecurity(headers) {
    try {
      const analysis = {
        serverInfo: {},
        hiddenInfo: true,
        technologies: [],
        securityFeatures: [],
        score: 0
      };
      
      // Extract server information
      const serverHeader = headers['server'] || '';
      const poweredBy = headers['x-powered-by'] || '';
      const aspNetVersion = headers['x-aspnet-version'] || '';
      const generator = headers['x-generator'] || '';
      
      if (serverHeader) {
        analysis.serverInfo.server = serverHeader;
        analysis.hiddenInfo = false;
        analysis.technologies.push(`Server: ${serverHeader}`);
      }
      
      if (poweredBy) {
        analysis.serverInfo.poweredBy = poweredBy;
        analysis.hiddenInfo = false;
        analysis.technologies.push(`Powered by: ${poweredBy}`);
      }
      
      if (aspNetVersion) {
        analysis.serverInfo.aspNetVersion = aspNetVersion;
        analysis.hiddenInfo = false;
        analysis.technologies.push(`ASP.NET: ${aspNetVersion}`);
      }
      
      if (generator) {
        analysis.serverInfo.generator = generator;
        analysis.technologies.push(`Generator: ${generator}`);
      }
      
      // Check for security features
      const securityHeaders = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options'
      ];
      
      securityHeaders.forEach(header => {
        if (headers[header]) {
          analysis.securityFeatures.push(header);
        }
      });
      
      // Calculate server security score
      let score = analysis.hiddenInfo ? 80 : 40; // Hidden server info is better
      score += analysis.securityFeatures.length * 5; // Bonus for security headers
      
      analysis.score = Math.min(100, score);
      
      return analysis;
    } catch (error) {
      this.log(`Server security analysis error: ${error.message}`, 'error');
      return { error: error.message, score: 0 };
    }
  }

  /**
   * Helper methods for security analysis
   */
  
  _extractHSTSMaxAge(hstsHeader) {
    const match = hstsHeader.match(/max-age=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  _evaluateHeaderSecurity(headerName, headerValue) {
    if (!headerValue) return false;
    
    switch (headerName) {
      case 'content-security-policy':
        return !headerValue.includes('unsafe-inline') && !headerValue.includes('unsafe-eval');
      case 'x-frame-options':
        return ['DENY', 'SAMEORIGIN'].includes(headerValue.toUpperCase());
      case 'strict-transport-security':
        return this._extractHSTSMaxAge(headerValue) >= 31536000;
      default:
        return true;
    }
  }
  
  _assessMixedContentRisk(resourceType) {
    switch (resourceType) {
      case 'script':
      case 'iframe':
        return 'critical';
      case 'link':
      case 'object':
      case 'embed':
        return 'high';
      case 'img':
        return 'medium';
      default:
        return 'low';
    }
  }
  
  _calculateMixedContentRisk(issues) {
    if (issues.some(i => i.risk === 'critical')) return 'critical';
    if (issues.some(i => i.risk === 'high')) return 'high';
    if (issues.some(i => i.risk === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Calculate overall security score
   */
  _calculateSecurityScore(analysis) {
    const weights = {
      https: 0.25,
      securityHeaders: 0.20,
      contentSecurity: 0.15,
      mixedContent: 0.15,
      cookies: 0.10,
      authentication: 0.05,
      vulnerabilities: 0.05,
      serverSecurity: 0.05
    };
    
    let totalScore = 0;
    let validComponents = 0;
    
    Object.entries(weights).forEach(([component, weight]) => {
      const componentData = analysis[component];
      if (componentData && typeof componentData.score === 'number') {
        totalScore += componentData.score * weight;
        validComponents++;
      }
    });
    
    // Adjust for missing components
    if (validComponents < Object.keys(weights).length) {
      const adjustment = validComponents / Object.keys(weights).length;
      totalScore = totalScore / adjustment;
    }
    
    return Math.round(Math.min(100, Math.max(0, totalScore)));
  }

  /**
   * Calculate compliance scores for different standards
   */
  _calculateComplianceScores(analysis) {
    return {
      owasp: this._calculateOWASPCompliance(analysis),
      nist: this._calculateNISTCompliance(analysis),
      pci: this._calculatePCICompliance(analysis),
      gdpr: this._calculateGDPRCompliance(analysis)
    };
  }

  /**
   * Calculate OWASP compliance score
   */
  _calculateOWASPCompliance(analysis) {
    let score = 0;
    let maxScore = 0;
    
    // A01: Broken Access Control
    maxScore += 15;
    if (analysis.authentication?.score > 80) score += 15;
    else if (analysis.authentication?.score > 60) score += 10;
    else if (analysis.authentication?.score > 40) score += 5;
    
    // A02: Cryptographic Failures
    maxScore += 20;
    if (analysis.https?.enabled) score += 10;
    if (analysis.https?.hsts?.enabled) score += 5;
    if (analysis.cookies?.secure / Math.max(1, analysis.cookies?.total) > 0.8) score += 5;
    
    // A03: Injection
    maxScore += 15;
    if (analysis.vulnerabilities?.xssRisks?.length === 0) score += 10;
    if (analysis.securityHeaders?.headers?.['content-security-policy']?.present) score += 5;
    
    // A04: Insecure Design
    maxScore += 10;
    if (analysis.securityHeaders?.total >= 4) score += 10;
    
    // A05: Security Misconfiguration
    maxScore += 20;
    if (analysis.securityHeaders?.missing?.length === 0) score += 10;
    if (analysis.serverSecurity?.hiddenInfo) score += 5;
    if (analysis.vulnerabilities?.informationDisclosure?.length === 0) score += 5;
    
    // A06: Vulnerable Components
    maxScore += 10;
    if (analysis.vulnerabilities?.totalRisks < 3) score += 10;
    
    // A07: Identification and Authentication Failures
    maxScore += 10;
    if (analysis.authentication?.score > 80) score += 10;
    
    return {
      score: Math.round((score / maxScore) * 100),
      maxScore,
      achievedScore: score,
      level: score / maxScore > 0.8 ? 'high' : score / maxScore > 0.6 ? 'medium' : 'low'
    };
  }

  /**
   * Calculate NIST compliance score
   */
  _calculateNISTCompliance(analysis) {
    let score = 0;
    
    // Identify (20 points)
    if (analysis.serverSecurity?.technologies?.length > 0) score += 20;
    
    // Protect (40 points)
    if (analysis.https?.enabled) score += 15;
    if (analysis.securityHeaders?.total >= 4) score += 15;
    if (analysis.contentSecurity?.score > 80) score += 10;
    
    // Detect (20 points)
    if (analysis.vulnerabilities?.score > 80) score += 20;
    
    // Respond (10 points)
    if (analysis.securityHeaders?.headers?.['content-security-policy']?.present) score += 10;
    
    // Recover (10 points)
    if (analysis.https?.hsts?.enabled) score += 10;
    
    return {
      score,
      level: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
    };
  }

  /**
   * Calculate PCI DSS compliance score
   */
  _calculatePCICompliance(analysis) {
    let score = 0;
    
    // Secure network (25 points)
    if (analysis.https?.enabled) score += 15;
    if (analysis.securityHeaders?.headers?.['x-frame-options']?.present) score += 10;
    
    // Protect cardholder data (25 points)
    if (analysis.https?.enabled && analysis.https?.hsts?.enabled) score += 15;
    if (analysis.cookies?.secure / Math.max(1, analysis.cookies?.total) > 0.9) score += 10;
    
    // Vulnerability management (25 points)
    if (analysis.vulnerabilities?.score > 90) score += 25;
    else if (analysis.vulnerabilities?.score > 70) score += 15;
    
    // Access control (25 points)
    if (analysis.authentication?.score > 80) score += 25;
    else if (analysis.authentication?.score > 60) score += 15;
    
    return {
      score,
      level: score > 85 ? 'compliant' : score > 70 ? 'mostly-compliant' : 'non-compliant'
    };
  }

  /**
   * Calculate GDPR compliance score
   */
  _calculateGDPRCompliance(analysis) {
    let score = 0;
    
    // Data protection by design (30 points)
    if (analysis.https?.enabled) score += 15;
    if (analysis.cookies?.httpOnly > 0) score += 15;
    
    // Security measures (30 points)
    if (analysis.securityHeaders?.total >= 4) score += 15;
    if (analysis.vulnerabilities?.score > 80) score += 15;
    
    // Data minimization (20 points)
    if (analysis.serverSecurity?.hiddenInfo) score += 10;
    if (analysis.vulnerabilities?.informationDisclosure?.length === 0) score += 10;
    
    // Transparency (20 points)
    if (analysis.cookies?.total > 0) score += 20; // Assumes cookie consent is handled
    
    return {
      score,
      level: score > 80 ? 'compliant' : score > 60 ? 'mostly-compliant' : 'non-compliant'
    };
  }

  /**
   * Generate security recommendations
   */
  _generateSecurityRecommendations(analysis) {
    const recommendations = [];
    
    // HTTPS recommendations
    if (!analysis.https?.enabled) {
      recommendations.push({
        type: 'https',
        priority: 'critical',
        title: 'Enable HTTPS',
        description: 'Website is not served over HTTPS',
        impact: 'Critical security vulnerability - data can be intercepted',
        solution: 'Implement SSL/TLS certificate and redirect all HTTP traffic to HTTPS',
        compliance: ['OWASP A02', 'NIST', 'PCI DSS']
      });
    }
    
    if (analysis.https?.enabled && !analysis.https?.hsts?.enabled) {
      recommendations.push({
        type: 'hsts',
        priority: 'high',
        title: 'Implement HSTS',
        description: 'HTTP Strict Transport Security header is missing',
        impact: 'Vulnerable to downgrade attacks and cookie hijacking',
        solution: 'Add Strict-Transport-Security header with max-age of at least 31536000',
        compliance: ['OWASP A05', 'NIST']
      });
    }
    
    // Security headers recommendations
    if (analysis.securityHeaders?.missing?.length > 0) {
      recommendations.push({
        type: 'security-headers',
        priority: 'high',
        title: 'Add Missing Security Headers',
        description: `Missing ${analysis.securityHeaders.missing.length} critical security headers`,
        impact: 'Various security vulnerabilities depending on missing headers',
        solution: `Implement headers: ${analysis.securityHeaders.missing.join(', ')}`,
        compliance: ['OWASP A05', 'NIST']
      });
    }
    
    // Content Security Policy recommendations
    const cspHeader = analysis.securityHeaders?.headers?.['content-security-policy'];
    if (cspHeader?.present && cspHeader?.cspAnalysis?.dangerous?.length > 0) {
      recommendations.push({
        type: 'csp',
        priority: 'high',
        title: 'Fix Content Security Policy',
        description: `CSP contains ${cspHeader.cspAnalysis.dangerous.length} dangerous directives`,
        impact: 'Reduced protection against XSS and injection attacks',
        solution: 'Remove unsafe-inline, unsafe-eval, and wildcard (*) directives',
        compliance: ['OWASP A03']
      });
    }
    
    // Mixed content recommendations
    if (analysis.mixedContent?.detected) {
      recommendations.push({
        type: 'mixed-content',
        priority: analysis.mixedContent.riskLevel === 'critical' ? 'critical' : 'high',
        title: 'Fix Mixed Content Issues',
        description: `${analysis.mixedContent.issues.length} mixed content issues detected`,
        impact: 'Compromises HTTPS security and may cause browser warnings',
        solution: 'Update all HTTP resources to use HTTPS or relative URLs',
        compliance: ['OWASP A02']
      });
    }
    
    // Cookie security recommendations
    if (analysis.cookies?.total > 0 && analysis.cookies?.score < 80) {
      recommendations.push({
        type: 'cookies',
        priority: 'medium',
        title: 'Improve Cookie Security',
        description: 'Cookies not properly secured',
        impact: 'Risk of session hijacking and XSS attacks',
        solution: 'Add Secure, HttpOnly, and SameSite flags to all cookies',
        compliance: ['OWASP A02', 'GDPR']
      });
    }
    
    // Authentication recommendations
    if (analysis.authentication?.issues?.length > 0) {
      recommendations.push({
        type: 'authentication',
        priority: 'high',
        title: 'Fix Authentication Issues',
        description: `${analysis.authentication.issues.length} authentication security issues`,
        impact: 'Risk of credential theft and unauthorized access',
        solution: 'Fix identified authentication vulnerabilities',
        compliance: ['OWASP A01', 'OWASP A07']
      });
    }
    
    // Vulnerability recommendations
    if (analysis.vulnerabilities?.totalRisks > 0) {
      recommendations.push({
        type: 'vulnerabilities',
        priority: 'high',
        title: 'Address Security Vulnerabilities',
        description: `${analysis.vulnerabilities.totalRisks} potential vulnerabilities detected`,
        impact: 'Various security risks including XSS and information disclosure',
        solution: 'Review and fix identified vulnerability patterns',
        compliance: ['OWASP A03', 'OWASP A05']
      });
    }
    
    return recommendations;
  }

  /**
   * Assess security risks
   */
  _assessSecurityRisks(analysis) {
    const risks = [];
    
    // Critical risks
    if (!analysis.https?.enabled) {
      risks.push({
        level: 'critical',
        type: 'no-https',
        impact: 'high',
        likelihood: 'high',
        description: 'Unencrypted data transmission'
      });
    }
    
    if (analysis.mixedContent?.riskLevel === 'critical') {
      risks.push({
        level: 'critical',
        type: 'mixed-content',
        impact: 'high',
        likelihood: 'medium',
        description: 'Critical mixed content vulnerabilities'
      });
    }
    
    // High risks
    if (analysis.securityHeaders?.missing?.includes('content-security-policy')) {
      risks.push({
        level: 'high',
        type: 'no-csp',
        impact: 'high',
        likelihood: 'medium',
        description: 'No protection against XSS attacks'
      });
    }
    
    if (analysis.vulnerabilities?.xssRisks?.length > 0) {
      risks.push({
        level: 'high',
        type: 'xss-vulnerability',
        impact: 'high',
        likelihood: 'medium',
        description: 'Potential XSS vulnerabilities detected'
      });
    }
    
    // Calculate overall risk level
    const criticalCount = risks.filter(r => r.level === 'critical').length;
    const highCount = risks.filter(r => r.level === 'high').length;
    
    let overallRisk = 'low';
    if (criticalCount > 0) overallRisk = 'critical';
    else if (highCount > 2) overallRisk = 'high';
    else if (highCount > 0) overallRisk = 'medium';
    
    return {
      overallRisk,
      totalRisks: risks.length,
      risks,
      riskScore: Math.max(0, 100 - (criticalCount * 30) - (highCount * 15))
    };
  }

  /**
   * Analyze security performance metrics
   */
  _analyzeSecurityPerformance(analysis) {
    return {
      totalElementsAnalyzed: 
        (analysis.contentSecurity?.inlineScripts || 0) +
        (analysis.contentSecurity?.externalScripts || 0) +
        (analysis.authentication?.formsDetected || 0) +
        (analysis.cookies?.total || 0),
      securityHeadersCount: analysis.securityHeaders?.total || 0,
      vulnerabilitiesFound: analysis.vulnerabilities?.totalRisks || 0,
      complianceLevel: this._getOverallComplianceLevel(analysis.complianceScores),
      analysisDepth: 'comprehensive'
    };
  }

  /**
   * Generate security summary
   */
  _generateSecuritySummary(analysis) {
    const criticalIssues = (analysis.recommendations || []).filter(r => r.priority === 'critical').length;
    const highIssues = (analysis.recommendations || []).filter(r => r.priority === 'high').length;
    const mediumIssues = (analysis.recommendations || []).filter(r => r.priority === 'medium').length;
    
    return {
      overallScore: analysis.securityScore,
      securityLevel: this._getSecurityLevel(analysis.securityScore),
      criticalIssues,
      highIssues,
      mediumIssues,
      totalIssues: criticalIssues + highIssues + mediumIssues,
      httpsEnabled: analysis.https?.enabled || false,
      securityHeadersPresent: analysis.securityHeaders?.total || 0,
      complianceScores: analysis.complianceScores,
      topStrengths: this._identifySecurityStrengths(analysis),
      topWeaknesses: this._identifySecurityWeaknesses(analysis),
      riskLevel: analysis.riskAssessment?.overallRisk || 'unknown'
    };
  }

  /**
   * Helper methods for summary generation
   */
  
  _getSecurityLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }
  
  _getOverallComplianceLevel(complianceScores) {
    if (!complianceScores) return 'unknown';
    
    const scores = Object.values(complianceScores).map(c => c.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (avgScore >= 90) return 'high';
    if (avgScore >= 70) return 'medium';
    return 'low';
  }
  
  _identifySecurityStrengths(analysis) {
    const strengths = [];
    
    if (analysis.https?.enabled) strengths.push('HTTPS enabled');
    if (analysis.https?.hsts?.enabled) strengths.push('HSTS implemented');
    if (analysis.securityHeaders?.total >= 4) strengths.push('Good security headers coverage');
    if (analysis.vulnerabilities?.score > 80) strengths.push('Low vulnerability risk');
    if (analysis.serverSecurity?.hiddenInfo) strengths.push('Server information hidden');
    
    return strengths;
  }
  
  _identifySecurityWeaknesses(analysis) {
    const weaknesses = [];
    
    if (!analysis.https?.enabled) weaknesses.push('HTTPS not enabled');
    if (analysis.securityHeaders?.missing?.length > 0) weaknesses.push('Missing security headers');
    if (analysis.mixedContent?.detected) weaknesses.push('Mixed content issues');
    if (analysis.vulnerabilities?.totalRisks > 3) weaknesses.push('Multiple vulnerabilities');
    if (analysis.cookies?.score < 70) weaknesses.push('Insecure cookies');
    
    return weaknesses;
  }

  /**
   * Validate analysis context
   */
  validate(context) {
    const errors = [];
    
    if (!context.dom || !context.dom.window || !context.dom.window.document) {
      errors.push('Valid DOM context is required');
    }
    
    if (!context.url) {
      errors.push('URL is required for security analysis');
    }
    
    if (!context.headers) {
      errors.push('HTTP headers are recommended for comprehensive security analysis');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      description: 'Comprehensive security analyzer with enterprise-grade vulnerability detection',
      features: [
        'HTTPS/TLS analysis',
        'Security headers evaluation',
        'Content Security Policy analysis',
        'Mixed content detection',
        'Cookie security assessment',
        'Authentication security analysis',
        'XSS vulnerability detection',
        'OWASP/NIST compliance scoring',
        'Risk assessment and recommendations'
      ],
      compliance: ['OWASP Top 10', 'NIST Framework', 'PCI DSS', 'GDPR'],
      capabilities: {
        httpsAnalysis: true,
        headerAnalysis: true,
        contentAnalysis: this.config.checkMixedContent,
        cookieAnalysis: this.config.analyzeCookies,
        vulnerabilityScanning: this.config.vulnerabilityScanning,
        complianceScoring: true
      },
      complianceLevel: this.config.complianceLevel
    };
  }
}

export default SecurityAnalyzer;