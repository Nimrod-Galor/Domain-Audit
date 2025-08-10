/**
 * SSL Certificate Analyzer - Certificate Chain and Expiration Analysis
 * Part of the Domain Link Audit Tool - Advanced Security Analysis
 * 
 * Provides comprehensive SSL certificate validation including:
 * - Certificate chain analysis
 * - Expiration date monitoring
 * - Certificate authority validation
 * - Security strength assessment
 * - Mixed content detection
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 * @date August 2, 2025
 */

import https from 'https';
import tls from 'tls';
import { URL } from 'url';
import { BaseAnalyzer } from './core/BaseAnalyzer.js';
import { AnalyzerCategories } from './core/AnalyzerInterface.js';

export class SSLCertificateAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('SSLCertificateAnalyzer', {
      timeout: options.timeout || 10000,
      validateHostname: options.validateHostname !== false,
      validateCA: options.validateCA !== false,
      checkExpiration: options.checkExpiration !== false,
      warningDays: options.warningDays || 30,
      enableCertificateChainAnalysis: options.enableCertificateChainAnalysis !== false,
      enableExpirationAnalysis: options.enableExpirationAnalysis !== false,
      enableSecurityAnalysis: options.enableSecurityAnalysis !== false,
      enableMixedContentDetection: options.enableMixedContentDetection !== false,
      cacheDuration: options.cacheDuration || 300000, // 5 minutes
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.SECURITY;
    this.certificateCache = new Map();
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'SSLCertificateAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive SSL certificate validation including chain analysis, expiration monitoring, and security assessment',
      category: AnalyzerCategories.SECURITY,
      priority: 'high',
      capabilities: [
        'certificate_chain_analysis',
        'expiration_monitoring',
        'security_strength_assessment',
        'certificate_authority_validation',
        'mixed_content_detection',
        'hostname_validation',
        'ssl_configuration_analysis'
      ]
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    try {
      if (!context || typeof context !== 'object') {
        return false;
      }

      const { url } = context;
      if (!url || typeof url !== 'string') {
        this.log('SSL analysis requires a valid URL', 'warn');
        return false;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        this.log(`Invalid URL format: ${url}`, 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating SSL analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive SSL certificate analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing URL and optional page data
   * @returns {Promise<Object>} SSL certificate analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting SSL certificate analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for SSL analysis', new Error('Context validation failed'), {
          hasSSL: false,
          isHTTPS: false,
          score: 0,
          grade: 'F'
        });
      }

      const { url, pageData = {}, document = null } = context;

      // Perform SSL certificate analysis
      const certificateData = await this._performCertificateAnalysis(url, pageData);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(certificateData);
      const grade = this._getGradeFromScore(score);
      
      // Generate recommendations
      const recommendations = this._generateSSLRecommendations(certificateData);
      
      // Generate summary
      const summary = this._generateSSLSummary(certificateData, score);

      const result = {
        success: true,
        data: {
          ...certificateData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`SSL analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('SSL certificate analysis failed', error, {
        hasSSL: false,
        isHTTPS: false,
        score: 0,
        grade: 'F',
        summary: 'SSL certificate analysis encountered an error'
      });
    }
  }



  /**
   * Internal method to perform SSL certificate analysis
   * @param {string} url - URL to analyze
   * @param {Object} pageData - Additional page data for mixed content detection
   * @returns {Promise<Object>} SSL certificate analysis results
   */
  async _performCertificateAnalysis(url, pageData = {}) {
    try {
      const urlObj = new URL(url);
      
      // Only analyze HTTPS URLs
      if (urlObj.protocol !== 'https:') {
        return {
          isHTTPS: false,
          analysis: 'URL is not HTTPS - SSL certificate analysis not applicable',
          recommendation: 'Consider implementing HTTPS for better security'
        };
      }

      const hostname = urlObj.hostname;
      const port = urlObj.port || 443;
      
      // Check cache first
      const cacheKey = `${hostname}:${port}`;
      if (this.certificateCache.has(cacheKey)) {
        const cached = this.certificateCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.options.cacheDuration) {
          this.log(`Using cached SSL data for ${hostname}:${port}`, 'info');
          return cached.data;
        }
      }

      this.log(`Analyzing SSL certificate for ${hostname}:${port}`, 'info');
      
      const certificateInfo = await this._getCertificateInfo(hostname, port);
      const analysis = this._analyzeCertificateChain(certificateInfo);
      const expirationAnalysis = this._analyzeExpiration(certificateInfo);
      const securityAnalysis = this._analyzeSecurityStrength(certificateInfo);
      const mixedContentAnalysis = this._analyzeMixedContent(pageData, url);

      const result = {
        isHTTPS: true,
        hostname,
        port,
        certificate: {
          subject: certificateInfo.subject,
          issuer: certificateInfo.issuer,
          validFrom: certificateInfo.valid_from,
          validTo: certificateInfo.valid_to,
          serialNumber: certificateInfo.serialNumber,
          fingerprint: certificateInfo.fingerprint,
          fingerprintSha256: certificateInfo.fingerprint256
        },
        chain: analysis,
        expiration: expirationAnalysis,
        security: securityAnalysis,
        mixedContent: mixedContentAnalysis,
        overall: this._calculateOverallScore(analysis, expirationAnalysis, securityAnalysis, mixedContentAnalysis),
        timestamp: new Date().toISOString()
      };

      // Cache the result
      this.certificateCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      this.log(`SSL certificate analysis completed for ${hostname}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('SSL certificate analysis failed', error, {
        isHTTPS: false,
        error: error.message,
        recommendation: 'Check SSL certificate configuration and connectivity'
      });
    }
  }

  /**
   * Get certificate information from the server
   * @param {string} hostname - Server hostname
   * @param {number} port - Server port
   * @returns {Promise<Object>} Certificate information
   * @private
   */
  async _getCertificateInfo(hostname, port) {
    return new Promise((resolve, reject) => {
      const options = {
        host: hostname,
        port: port,
        servername: hostname,
        rejectUnauthorized: false, // We want to analyze even invalid certificates
        timeout: this.options.timeout
      };

      const socket = tls.connect(options, () => {
        try {
          const certificate = socket.getPeerCertificate(true);
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();
          
          socket.destroy();
          
          resolve({
            ...certificate,
            cipher,
            protocol,
            authorized: socket.authorized,
            authorizationError: socket.authorizationError
          });
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });

      socket.on('error', reject);
      socket.setTimeout(this.options.timeout, () => {
        socket.destroy();
        reject(new Error('SSL connection timeout'));
      });
    });
  }

  /**
   * Analyze certificate chain
   * @param {Object} certificateInfo - Certificate information
   * @returns {Object} Chain analysis results
   * @private
   */
  _analyzeCertificateChain(certificateInfo) {
    const chain = [];
    let current = certificateInfo;
    
    // Build certificate chain
    while (current) {
      chain.push({
        subject: this._parseSubject(current.subject),
        issuer: this._parseSubject(current.issuer),
        validFrom: current.valid_from,
        validTo: current.valid_to,
        serialNumber: current.serialNumber,
        fingerprint: current.fingerprint
      });
      
      current = current.issuerCertificate;
      
      // Prevent infinite loops
      if (current === certificateInfo || chain.length > 10) {
        break;
      }
    }

    return {
      length: chain.length,
      certificates: chain,
      isComplete: this._isChainComplete(chain),
      rootCA: this._identifyRootCA(chain),
      intermediates: chain.length > 2 ? chain.slice(1, -1) : [],
      validation: {
        authorized: certificateInfo.authorized,
        error: certificateInfo.authorizationError || null
      },
      trustScore: this._calculateChainTrustScore(chain, certificateInfo)
    };
  }

  /**
   * Analyze certificate expiration
   * @param {Object} certificateInfo - Certificate information
   * @returns {Object} Expiration analysis results
   * @private
   */
  _analyzeExpiration(certificateInfo) {
    const now = new Date();
    const validFrom = new Date(certificateInfo.valid_from);
    const validTo = new Date(certificateInfo.valid_to);
    
    const daysUntilExpiration = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
    const totalValidityDays = Math.ceil((validTo - validFrom) / (1000 * 60 * 60 * 24));
    
    const status = this._getExpirationStatus(daysUntilExpiration);
    
    return {
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      daysUntilExpiration,
      totalValidityDays,
      status,
      isExpired: daysUntilExpiration <= 0,
      isExpiringSoon: daysUntilExpiration <= this.options.warningDays,
      recommendation: this._getExpirationRecommendation(daysUntilExpiration),
      renewalWindow: this._calculateRenewalWindow(validTo)
    };
  }

  /**
   * Analyze security strength
   * @param {Object} certificateInfo - Certificate information
   * @returns {Object} Security analysis results
   * @private
   */
  _analyzeSecurityStrength(certificateInfo) {
    const keyAlgorithm = this._extractKeyAlgorithm(certificateInfo);
    const keySize = this._extractKeySize(certificateInfo);
    const signatureAlgorithm = this._extractSignatureAlgorithm(certificateInfo);
    const cipher = certificateInfo.cipher || {};
    const protocol = certificateInfo.protocol;

    return {
      keyAlgorithm,
      keySize,
      signatureAlgorithm,
      cipher: {
        name: cipher.name,
        version: cipher.version,
        bits: cipher.bits
      },
      protocol,
      strength: this._calculateSecurityStrength(keyAlgorithm, keySize, signatureAlgorithm, protocol),
      vulnerabilities: this._checkKnownVulnerabilities(certificateInfo),
      recommendations: this._getSecurityRecommendations(keyAlgorithm, keySize, signatureAlgorithm, protocol)
    };
  }

  /**
   * Analyze mixed content issues
   * @param {Object} pageData - Page data for analysis
   * @param {string} url - Base URL
   * @returns {Object} Mixed content analysis
   * @private
   */
  _analyzeMixedContent(pageData, url) {
    if (!pageData.html && !pageData.resources) {
      return {
        analyzed: false,
        reason: 'No page content available for analysis'
      };
    }

    const mixedContent = {
      analyzed: true,
      httpResources: [],
      httpLinks: [],
      insecureRequests: 0,
      severity: 'none',
      recommendations: []
    };

    // Analyze resources if available
    if (pageData.resources) {
      pageData.resources.forEach(resource => {
        if (resource.url && resource.url.startsWith('http://')) {
          mixedContent.httpResources.push({
            url: resource.url,
            type: resource.type || 'unknown',
            blocked: this._wouldBeBlocked(resource.type)
          });
          mixedContent.insecureRequests++;
        }
      });
    }

    // Analyze HTML content if available
    if (pageData.html) {
      const httpMatches = pageData.html.match(/http:\/\/[^\s"'<>]+/g) || [];
      httpMatches.forEach(match => {
        mixedContent.httpLinks.push(match);
        mixedContent.insecureRequests++;
      });
    }

    mixedContent.severity = this._getMixedContentSeverity(mixedContent.insecureRequests);
    mixedContent.recommendations = this._getMixedContentRecommendations(mixedContent);

    return mixedContent;
  }

  /**
   * Calculate overall SSL score
   * @param {Object} chain - Chain analysis
   * @param {Object} expiration - Expiration analysis
   * @param {Object} security - Security analysis
   * @param {Object} mixedContent - Mixed content analysis
   * @returns {Object} Overall score and grade
   * @private
   */
  _calculateOverallScore(chain, expiration, security, mixedContent) {
    let score = 100;
    const issues = [];
    const recommendations = [];

    // Chain validation (30 points)
    if (!chain.validation.authorized) {
      score -= 30;
      issues.push('Certificate chain validation failed');
      recommendations.push('Fix certificate chain configuration');
    } else if (chain.trustScore < 0.8) {
      score -= 15;
      issues.push('Certificate chain has trust issues');
      recommendations.push('Review certificate chain completeness');
    }

    // Expiration (25 points)
    if (expiration.isExpired) {
      score -= 25;
      issues.push('Certificate is expired');
      recommendations.push('Renew SSL certificate immediately');
    } else if (expiration.isExpiringSoon) {
      score -= 10;
      issues.push('Certificate expires soon');
      recommendations.push('Plan certificate renewal');
    }

    // Security strength (35 points)
    if (security.strength < 0.5) {
      score -= 35;
      issues.push('Weak cryptographic strength');
      recommendations.push('Upgrade to stronger encryption');
    } else if (security.strength < 0.8) {
      score -= 15;
      issues.push('Moderate cryptographic strength');
      recommendations.push('Consider stronger encryption algorithms');
    }

    // Mixed content (10 points)
    if (mixedContent.analyzed && mixedContent.severity !== 'none') {
      const penalty = mixedContent.severity === 'high' ? 10 : 5;
      score -= penalty;
      issues.push('Mixed content detected');
      recommendations.push('Remove HTTP resources from HTTPS pages');
    }

    score = Math.max(0, score);
    const grade = this._calculateGrade(score);

    return {
      score,
      grade,
      issues,
      recommendations,
      summary: this._generateScoreSummary(score, grade, issues.length)
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _parseSubject(subject) {
    if (typeof subject === 'string') return subject;
    if (typeof subject === 'object') {
      return Object.entries(subject)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
    }
    return 'Unknown';
  }

  _isChainComplete(chain) {
    if (chain.length === 0) return false;
    const lastCert = chain[chain.length - 1];
    return lastCert.subject === lastCert.issuer; // Self-signed root
  }

  _identifyRootCA(chain) {
    if (chain.length === 0) return 'Unknown';
    const root = chain[chain.length - 1];
    
    // Common Root CAs
    const caPatterns = {
      'Let\'s Encrypt': /Let's Encrypt|ISRG/i,
      'DigiCert': /DigiCert/i,
      'Comodo': /Comodo|Sectigo/i,
      'GeoTrust': /GeoTrust/i,
      'VeriSign': /VeriSign|Symantec/i,
      'GlobalSign': /GlobalSign/i,
      'Thawte': /Thawte/i,
      'RapidSSL': /RapidSSL/i
    };

    for (const [name, pattern] of Object.entries(caPatterns)) {
      if (pattern.test(root.issuer)) {
        return name;
      }
    }

    return 'Other/Unknown';
  }

  _calculateChainTrustScore(chain, certificateInfo) {
    let score = 1.0;
    
    if (!certificateInfo.authorized) score -= 0.5;
    if (!this._isChainComplete(chain)) score -= 0.2;
    if (chain.length < 2) score -= 0.1;
    if (chain.length > 5) score -= 0.1;
    
    return Math.max(0, score);
  }

  _getExpirationStatus(daysUntilExpiration) {
    if (daysUntilExpiration <= 0) return 'expired';
    if (daysUntilExpiration <= 7) return 'critical';
    if (daysUntilExpiration <= 30) return 'warning';
    if (daysUntilExpiration <= 90) return 'notice';
    return 'valid';
  }

  _getExpirationRecommendation(daysUntilExpiration) {
    if (daysUntilExpiration <= 0) return 'Certificate is expired - renew immediately';
    if (daysUntilExpiration <= 7) return 'Certificate expires very soon - urgent renewal required';
    if (daysUntilExpiration <= 30) return 'Certificate expires soon - plan renewal';
    if (daysUntilExpiration <= 90) return 'Certificate expires within 90 days - consider renewal planning';
    return 'Certificate validity is good';
  }

  _calculateRenewalWindow(validTo) {
    const renewalDate = new Date(validTo);
    renewalDate.setDate(renewalDate.getDate() - 30); // 30 days before expiration
    
    return {
      recommendedRenewalDate: renewalDate.toISOString(),
      daysUntilRenewalWindow: Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24))
    };
  }

  _extractKeyAlgorithm(certificateInfo) {
    // Try to extract from various certificate properties
    if (certificateInfo.pubkey) {
      if (certificateInfo.pubkey.type) return certificateInfo.pubkey.type;
    }
    if (certificateInfo.signatureAlgorithm) {
      return certificateInfo.signatureAlgorithm.split('With')[0] || 'Unknown';
    }
    return 'RSA'; // Default assumption
  }

  _extractKeySize(certificateInfo) {
    if (certificateInfo.pubkey && certificateInfo.pubkey.bits) {
      return certificateInfo.pubkey.bits;
    }
    if (certificateInfo.bits) return certificateInfo.bits;
    return 2048; // Default assumption
  }

  _extractSignatureAlgorithm(certificateInfo) {
    return certificateInfo.signatureAlgorithm || 'sha256WithRSAEncryption';
  }

  _calculateSecurityStrength(keyAlgorithm, keySize, signatureAlgorithm, protocol) {
    let strength = 1.0;
    
    // Key algorithm and size
    if (keyAlgorithm === 'RSA') {
      if (keySize < 2048) strength -= 0.4;
      else if (keySize < 3072) strength -= 0.1;
    } else if (keyAlgorithm === 'ECDSA') {
      if (keySize < 256) strength -= 0.3;
    }
    
    // Signature algorithm
    if (signatureAlgorithm.includes('md5')) strength -= 0.5;
    else if (signatureAlgorithm.includes('sha1')) strength -= 0.3;
    
    // Protocol version
    if (protocol && protocol.includes('1.0')) strength -= 0.3;
    else if (protocol && protocol.includes('1.1')) strength -= 0.2;
    
    return Math.max(0, strength);
  }

  _checkKnownVulnerabilities(certificateInfo) {
    const vulnerabilities = [];
    
    const signatureAlg = certificateInfo.signatureAlgorithm || '';
    if (signatureAlg.includes('md5')) {
      vulnerabilities.push({
        type: 'weak-signature',
        severity: 'high',
        description: 'MD5 signature algorithm is cryptographically broken'
      });
    }
    
    if (signatureAlg.includes('sha1')) {
      vulnerabilities.push({
        type: 'weak-signature',
        severity: 'medium',
        description: 'SHA-1 signature algorithm is deprecated'
      });
    }
    
    const keySize = this._extractKeySize(certificateInfo);
    if (keySize < 2048) {
      vulnerabilities.push({
        type: 'weak-key',
        severity: 'high',
        description: 'Key size less than 2048 bits is considered weak'
      });
    }
    
    return vulnerabilities;
  }

  _getSecurityRecommendations(keyAlgorithm, keySize, signatureAlgorithm, protocol) {
    const recommendations = [];
    
    if (keySize < 2048) {
      recommendations.push('Upgrade to at least 2048-bit RSA or 256-bit ECDSA keys');
    }
    
    if (signatureAlgorithm.includes('sha1') || signatureAlgorithm.includes('md5')) {
      recommendations.push('Use SHA-256 or higher signature algorithms');
    }
    
    if (protocol && (protocol.includes('1.0') || protocol.includes('1.1'))) {
      recommendations.push('Upgrade to TLS 1.2 or TLS 1.3');
    }
    
    return recommendations;
  }

  _wouldBeBlocked(resourceType) {
    // Modern browsers block mixed active content
    const blockedTypes = ['script', 'stylesheet', 'iframe', 'object', 'embed'];
    return blockedTypes.includes(resourceType);
  }

  _getMixedContentSeverity(insecureRequests) {
    if (insecureRequests === 0) return 'none';
    if (insecureRequests <= 3) return 'low';
    if (insecureRequests <= 10) return 'medium';
    return 'high';
  }

  _getMixedContentRecommendations(mixedContent) {
    const recommendations = [];
    
    if (mixedContent.httpResources.length > 0) {
      recommendations.push('Convert HTTP resources to HTTPS');
      recommendations.push('Update absolute URLs to use HTTPS protocol');
    }
    
    if (mixedContent.httpLinks.length > 0) {
      recommendations.push('Review and update HTTP links in content');
      recommendations.push('Use protocol-relative URLs where appropriate');
    }
    
    return recommendations;
  }

  _calculateGrade(score) {
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

  _generateScoreSummary(score, grade, issueCount) {
    if (score >= 90) {
      return 'Excellent SSL configuration with strong security';
    } else if (score >= 80) {
      return 'Good SSL configuration with minor issues';
    } else if (score >= 70) {
      return 'Acceptable SSL configuration that needs improvement';
    } else if (score >= 50) {
      return 'Poor SSL configuration with security concerns';
    } else {
      return 'Critical SSL configuration issues requiring immediate attention';
    }
  }

  /**
   * Generate comprehensive SSL certificate report
   * @param {Object} analysis - Complete analysis results
   * @returns {Object} Formatted report
   */
  generateReport(analysis) {
    if (analysis.error) {
      return {
        status: 'error',
        message: analysis.message,
        recommendations: [analysis.recommendation]
      };
    }

    if (!analysis.isHTTPS) {
      return {
        status: 'not-applicable',
        message: analysis.analysis,
        recommendations: [analysis.recommendation]
      };
    }

    return {
      status: 'analyzed',
      summary: {
        hostname: analysis.hostname,
        grade: analysis.overall.grade,
        score: analysis.overall.score,
        issues: analysis.overall.issues.length,
        expiresDays: analysis.expiration.daysUntilExpiration
      },
      details: {
        certificate: analysis.certificate,
        chain: analysis.chain,
        expiration: analysis.expiration,
        security: analysis.security,
        mixedContent: analysis.mixedContent
      },
      recommendations: analysis.overall.recommendations,
      timestamp: analysis.timestamp
    };
  }

  // BaseAnalyzer integration helper methods

  /**
   * Calculate comprehensive SSL score for BaseAnalyzer integration
   */
  _calculateComprehensiveScore(certificateData) {
    try {
      if (!certificateData || !certificateData.isHTTPS) {
        return 0; // No HTTPS = 0 score
      }

      if (certificateData.error) {
        return 10; // Error in analysis = very low score
      }

      const overall = certificateData.overall;
      if (overall && typeof overall.score === 'number') {
        return Math.round(overall.score);
      }

      // Fallback calculation if overall score not available
      let score = 100;
      
      // Certificate chain issues
      if (certificateData.chain && certificateData.chain.issues) {
        score -= certificateData.chain.issues.length * 10;
      }

      // Expiration issues
      if (certificateData.expiration) {
        if (certificateData.expiration.daysUntilExpiration < 0) {
          score -= 50; // Expired certificate
        } else if (certificateData.expiration.daysUntilExpiration < 30) {
          score -= 20; // Expiring soon
        }
      }

      // Security issues
      if (certificateData.security && certificateData.security.issues) {
        score -= certificateData.security.issues.length * 15;
      }

      // Mixed content issues
      if (certificateData.mixedContent && certificateData.mixedContent.issues) {
        score -= certificateData.mixedContent.issues.length * 5;
      }

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      this.handleError('Error calculating comprehensive SSL score', error);
      return 0;
    }
  }

  /**
   * Get grade from score
   */
  _getGradeFromScore(score) {
    try {
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'A-';
      if (score >= 75) return 'B+';
      if (score >= 70) return 'B';
      if (score >= 65) return 'B-';
      if (score >= 60) return 'C+';
      if (score >= 55) return 'C';
      if (score >= 50) return 'C-';
      if (score >= 40) return 'D';
      return 'F';
    } catch (error) {
      this.handleError('Error calculating SSL grade', error);
      return 'F';
    }
  }

  /**
   * Generate SSL recommendations
   */
  _generateSSLRecommendations(certificateData) {
    try {
      const recommendations = [];

      if (!certificateData.isHTTPS) {
        recommendations.push({
          type: 'critical',
          title: 'Implement HTTPS',
          description: 'Use HTTPS to encrypt data transmission and build user trust',
          priority: 'high',
          impact: 'High - Essential for security and SEO'
        });
        return recommendations;
      }

      if (certificateData.error) {
        recommendations.push({
          type: 'error',
          title: 'Fix SSL Certificate Issues',
          description: 'SSL certificate analysis failed - check certificate configuration',
          priority: 'high',
          impact: 'High - SSL errors prevent secure connections'
        });
        return recommendations;
      }

      // Expiration recommendations
      if (certificateData.expiration) {
        if (certificateData.expiration.daysUntilExpiration < 0) {
          recommendations.push({
            type: 'critical',
            title: 'Renew Expired Certificate',
            description: 'SSL certificate has expired and must be renewed immediately',
            priority: 'critical',
            impact: 'Critical - Site is not secure'
          });
        } else if (certificateData.expiration.daysUntilExpiration < 30) {
          recommendations.push({
            type: 'warning',
            title: 'Certificate Renewal Due Soon',
            description: `SSL certificate expires in ${certificateData.expiration.daysUntilExpiration} days`,
            priority: 'medium',
            impact: 'Medium - Plan renewal to prevent downtime'
          });
        }
      }

      // Chain recommendations
      if (certificateData.chain && certificateData.chain.issues && certificateData.chain.issues.length > 0) {
        recommendations.push({
          type: 'security',
          title: 'Fix Certificate Chain Issues',
          description: `${certificateData.chain.issues.length} certificate chain issues detected`,
          priority: 'medium',
          impact: 'Medium - May cause trust warnings in browsers'
        });
      }

      // Security recommendations
      if (certificateData.security && certificateData.security.issues && certificateData.security.issues.length > 0) {
        recommendations.push({
          type: 'security',
          title: 'Improve SSL Security Configuration',
          description: `${certificateData.security.issues.length} security configuration issues found`,
          priority: 'medium',
          impact: 'Medium - Strengthen SSL security'
        });
      }

      // Mixed content recommendations
      if (certificateData.mixedContent && certificateData.mixedContent.issues && certificateData.mixedContent.issues.length > 0) {
        recommendations.push({
          type: 'mixed-content',
          title: 'Fix Mixed Content Issues',
          description: `${certificateData.mixedContent.issues.length} mixed content issues detected`,
          priority: 'medium',
          impact: 'Medium - Ensure all resources load over HTTPS'
        });
      }

      return recommendations.slice(0, 5); // Limit to top 5 recommendations
    } catch (error) {
      this.handleError('Error generating SSL recommendations', error);
      return [];
    }
  }

  /**
   * Generate SSL summary
   */
  _generateSSLSummary(certificateData, score) {
    try {
      const grade = this._getGradeFromScore(score);
      
      if (!certificateData.isHTTPS) {
        return 'Site does not use HTTPS encryption. Implementing SSL/TLS is strongly recommended for security.';
      }

      if (certificateData.error) {
        return 'SSL certificate analysis encountered errors. Check certificate configuration and server connectivity.';
      }

      let summary = `SSL certificate analysis completed with ${grade} grade (${score}/100 score). `;
      
      if (certificateData.hostname) {
        summary += `Certificate issued for ${certificateData.hostname}. `;
      }

      if (certificateData.expiration && certificateData.expiration.daysUntilExpiration >= 0) {
        summary += `Certificate expires in ${certificateData.expiration.daysUntilExpiration} days. `;
      } else if (certificateData.expiration && certificateData.expiration.daysUntilExpiration < 0) {
        summary += 'Certificate has expired and requires immediate renewal. ';
      }

      // Add issue summary
      const totalIssues = (certificateData.chain?.issues?.length || 0) + 
                         (certificateData.security?.issues?.length || 0) + 
                         (certificateData.mixedContent?.issues?.length || 0);

      if (totalIssues === 0) {
        summary += 'No significant SSL issues detected.';
      } else {
        summary += `${totalIssues} SSL issue${totalIssues > 1 ? 's' : ''} detected requiring attention.`;
      }

      return summary;
    } catch (error) {
      this.handleError('Error generating SSL summary', error);
      return 'SSL certificate analysis completed with errors.';
    }
  }

  /**
   * Create error result for consistency
   */
  createErrorResult(message) {
    return {
      success: false,
      error: message,
      data: {
        hasSSL: false,
        isHTTPS: false,
        score: 0,
        grade: 'F',
        summary: `SSL analysis failed: ${message}`,
        metadata: this.getMetadata()
      }
    };
  }
}

export default SSLCertificateAnalyzer;
