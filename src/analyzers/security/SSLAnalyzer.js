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
import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerCategories.js';

export class SSLCertificateAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('SSLCertificateAnalyzer');
    
    this.options = {
      timeout: options.timeout || 10000,
      validateHostname: options.validateHostname !== false,
      validateCA: options.validateCA !== false,
      checkExpiration: options.checkExpiration !== false,
      warningDays: options.warningDays || 30,
      ...options
    };
    
    this.certificateCache = new Map();
  }

  /**
   * Get analyzer metadata for BaseAnalyzer integration
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'SSL Certificate Analyzer',
      category: AnalyzerCategories.SECURITY,
      description: 'Comprehensive SSL certificate validation including chain analysis, expiration monitoring, CA validation, and security strength assessment',
      version: '1.0.0',
      author: 'Nimrod Galor',
      tags: ['ssl', 'certificate', 'security', 'https', 'encryption', 'expiration', 'ca-validation'],
      capabilities: [
        'certificate-chain-analysis',
        'expiration-monitoring',
        'ca-validation',
        'security-strength-assessment',
        'mixed-content-detection',
        'hostname-validation'
      ]
    };
  }

  /**
   * Validate input for SSL certificate analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether input is valid
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return this.handleError('Invalid context provided');
    }

    if (!context.url && !context.hostname) {
      return this.handleError('No URL or hostname provided for SSL certificate analysis');
    }

    return true;
  }

  /**
   * Enhanced analyze method with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing url, pageData, etc.
   * @returns {Object} Enhanced analysis results with BaseAnalyzer structure
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validate(context)) {
        return this.createErrorResult('Validation failed');
      }

      // Extract data from context
      const url = context.url || context.hostname;
      const pageData = context.pageData || {};

      // Perform comprehensive SSL certificate analysis
      const analysisResult = await this.performSSLCertificateAnalysis(url, pageData);

      // Calculate comprehensive score using BaseAnalyzer integration
      const score = this._calculateComprehensiveScore(analysisResult);

      // Generate optimization recommendations
      const recommendations = this._generateSSLRecommendations(analysisResult);

      // Generate analysis summary
      const summary = this._generateSSLSummary(analysisResult);

      // Return enhanced BaseAnalyzer-compatible result
      return {
        success: true,
        analyzer: 'SSLCertificateAnalyzer',
        category: AnalyzerCategories.SECURITY,
        score: score,
        data: {
          ...analysisResult,
          metadata: {
            analysisTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            version: this.getMetadata().version
          }
        },
        recommendations: recommendations,
        summary: summary,
        errors: [],
        warnings: analysisResult.warnings || []
      };

    } catch (error) {
      return this.handleError(`SSL certificate analysis failed: ${error.message}`, {
        analyzer: 'SSLCertificateAnalyzer',
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Perform comprehensive SSL certificate analysis
   * @param {string} url - URL to analyze
   * @param {Object} pageData - Additional page data for mixed content detection
   * @returns {Promise<Object>} SSL certificate analysis results
   */
  async performSSLCertificateAnalysis(url, pageData = {}) {
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
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          return cached.data;
        }
      }

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

      return result;

    } catch (error) {
      return {
        error: true,
        message: error.message,
        analysis: 'Failed to analyze SSL certificate',
        recommendation: 'Check SSL certificate configuration and connectivity'
      };
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

  // ============================================================================
  // BASEANALYZER INTEGRATION HELPER METHODS
  // ============================================================================

  /**
   * Calculate comprehensive SSL certificate score for BaseAnalyzer integration
   * @param {Object} analysis - SSL certificate analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        validity: 0.25,           // 25% - Certificate validity and trust
        expiration: 0.20,         // 20% - Expiration status
        security: 0.25,           // 25% - Security strength and algorithms
        chain: 0.15,              // 15% - Certificate chain integrity
        mixedContent: 0.15        // 15% - Mixed content security
      };

      let totalScore = 0;
      let totalWeight = 0;

      // HTTPS availability check
      if (!analysis.isHTTPS) {
        return 0; // No HTTPS = 0 score
      }

      // Certificate validity score
      if (analysis.chain && analysis.chain.isValid !== undefined) {
        const validityScore = analysis.chain.isValid ? 100 : 20;
        totalScore += validityScore * weights.validity;
        totalWeight += weights.validity;
      }

      // Expiration score
      if (analysis.expiration) {
        let expirationScore = 100;
        const daysUntilExpiration = analysis.expiration.daysUntilExpiration;
        
        if (daysUntilExpiration < 0) {
          expirationScore = 0; // Expired certificate
        } else if (daysUntilExpiration < 7) {
          expirationScore = 20; // Critical - expires within a week
        } else if (daysUntilExpiration < 30) {
          expirationScore = 50; // Warning - expires within a month
        } else if (daysUntilExpiration < 90) {
          expirationScore = 80; // Good - expires within 3 months
        }
        
        totalScore += expirationScore * weights.expiration;
        totalWeight += weights.expiration;
      }

      // Security strength score
      if (analysis.security) {
        let securityScore = 70; // Base score
        
        // Key size scoring
        const keySize = analysis.security.keySize || 0;
        if (keySize >= 4096) securityScore += 20;
        else if (keySize >= 2048) securityScore += 10;
        else if (keySize >= 1024) securityScore -= 20;
        else securityScore -= 40;
        
        // Algorithm scoring
        const algorithm = analysis.security.signatureAlgorithm || '';
        if (algorithm.includes('sha256') || algorithm.includes('sha384') || algorithm.includes('sha512')) {
          securityScore += 10;
        } else if (algorithm.includes('sha1')) {
          securityScore -= 30;
        } else if (algorithm.includes('md5')) {
          securityScore -= 50;
        }
        
        // Vulnerability penalties
        const vulnerabilities = analysis.security.vulnerabilities || [];
        securityScore -= vulnerabilities.length * 15;
        
        totalScore += Math.max(0, Math.min(securityScore, 100)) * weights.security;
        totalWeight += weights.security;
      }

      // Certificate chain score
      if (analysis.chain) {
        let chainScore = 80; // Base score
        
        if (analysis.chain.isValid) chainScore += 20;
        if (analysis.chain.isTrusted) chainScore += 0; // Already covered in validity
        
        // Chain length penalty (too long chains can be problematic)
        const chainLength = analysis.chain.length || 0;
        if (chainLength > 5) chainScore -= 10;
        
        totalScore += Math.min(chainScore, 100) * weights.chain;
        totalWeight += weights.chain;
      }

      // Mixed content score
      if (analysis.mixedContent) {
        let mixedContentScore = 100;
        
        const httpResources = analysis.mixedContent.httpResources?.length || 0;
        const httpLinks = analysis.mixedContent.httpLinks?.length || 0;
        
        // Penalize mixed content
        mixedContentScore -= httpResources * 15; // Resources are more critical
        mixedContentScore -= httpLinks * 5;      // Links are less critical
        
        totalScore += Math.max(0, mixedContentScore) * weights.mixedContent;
        totalWeight += weights.mixedContent;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive SSL optimization recommendations
   * @param {Object} analysis - SSL certificate analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateSSLRecommendations(analysis) {
    const recommendations = [];

    try {
      // HTTPS availability
      if (!analysis.isHTTPS) {
        recommendations.push({
          category: 'https-implementation',
          priority: 'critical',
          title: 'Implement HTTPS',
          description: 'Website is not using HTTPS encryption',
          impact: 'Security vulnerabilities, SEO penalties, and browser warnings',
          actionItems: [
            'Obtain an SSL certificate from a trusted CA',
            'Configure web server to serve content over HTTPS',
            'Redirect all HTTP traffic to HTTPS (301 redirects)',
            'Update all internal links to use HTTPS',
            'Test SSL configuration with SSL testing tools',
            'Update DNS records if necessary'
          ]
        });
        return recommendations; // No point in other SSL recommendations without HTTPS
      }

      // Certificate expiration
      if (analysis.expiration) {
        const daysUntilExpiration = analysis.expiration.daysUntilExpiration;
        
        if (daysUntilExpiration < 0) {
          recommendations.push({
            category: 'certificate-expiration',
            priority: 'critical',
            title: 'Certificate Has Expired',
            description: `SSL certificate expired ${Math.abs(daysUntilExpiration)} days ago`,
            impact: 'Browser warnings, blocked access, and security alerts',
            actionItems: [
              'Renew SSL certificate immediately',
              'Install new certificate on web server',
              'Verify certificate installation and configuration',
              'Set up automatic certificate renewal',
              'Monitor certificate expiration dates',
              'Notify users about security improvements'
            ]
          });
        } else if (daysUntilExpiration < 30) {
          const priority = daysUntilExpiration < 7 ? 'high' : 'medium';
          recommendations.push({
            category: 'certificate-expiration',
            priority: priority,
            title: 'Certificate Expiring Soon',
            description: `SSL certificate expires in ${daysUntilExpiration} days`,
            impact: 'Potential service disruption and security warnings',
            actionItems: [
              'Renew SSL certificate before expiration',
              'Plan certificate installation during maintenance window',
              'Set up automated certificate renewal (Let\'s Encrypt, etc.)',
              'Configure monitoring alerts for certificate expiration',
              'Update certificate renewal procedures',
              'Test new certificate in staging environment'
            ]
          });
        }
      }

      // Security strength issues
      if (analysis.security) {
        const keySize = analysis.security.keySize || 0;
        const algorithm = analysis.security.signatureAlgorithm || '';
        
        if (keySize < 2048) {
          recommendations.push({
            category: 'certificate-strength',
            priority: 'high',
            title: 'Weak Certificate Key Size',
            description: `Certificate uses ${keySize}-bit key, which is below current security standards`,
            impact: 'Vulnerability to cryptographic attacks',
            actionItems: [
              'Generate new certificate with at least 2048-bit RSA key',
              'Consider using 256-bit ECDSA for better performance',
              'Update certificate authority policies',
              'Test new certificate configuration',
              'Monitor for any compatibility issues',
              'Plan gradual rollout of stronger certificates'
            ]
          });
        }
        
        if (algorithm.includes('sha1') || algorithm.includes('md5')) {
          recommendations.push({
            category: 'signature-algorithm',
            priority: 'high',
            title: 'Weak Signature Algorithm',
            description: `Certificate uses ${algorithm} signature algorithm, which is deprecated`,
            impact: 'Vulnerability to hash collision attacks',
            actionItems: [
              'Request new certificate with SHA-256 or higher signature algorithm',
              'Update certificate authority selection criteria',
              'Verify signature algorithm support across target browsers',
              'Replace all certificates using weak algorithms',
              'Update security policies and procedures'
            ]
          });
        }

        const vulnerabilities = analysis.security.vulnerabilities || [];
        if (vulnerabilities.length > 0) {
          recommendations.push({
            category: 'security-vulnerabilities',
            priority: 'high',
            title: 'SSL Security Vulnerabilities Detected',
            description: `${vulnerabilities.length} security vulnerabilities found in SSL configuration`,
            impact: 'Potential security breaches and data compromise',
            actionItems: [
              'Address identified vulnerabilities: ' + vulnerabilities.map(v => v.type).join(', '),
              'Update SSL/TLS configuration on web server',
              'Disable weak cipher suites and protocols',
              'Enable only TLS 1.2 and TLS 1.3',
              'Regular security scanning and vulnerability assessment',
              'Implement SSL security best practices'
            ]
          });
        }
      }

      // Certificate chain issues
      if (analysis.chain && !analysis.chain.isValid) {
        recommendations.push({
          category: 'certificate-chain',
          priority: 'high',
          title: 'Invalid Certificate Chain',
          description: 'SSL certificate chain validation failed',
          impact: 'Browser warnings and trust issues',
          actionItems: [
            'Verify intermediate certificate installation',
            'Ensure proper certificate chain order',
            'Include all necessary intermediate certificates',
            'Test certificate chain with SSL testing tools',
            'Contact certificate authority for chain verification',
            'Update web server SSL configuration'
          ]
        });
      }

      // Mixed content issues
      if (analysis.mixedContent) {
        const httpResources = analysis.mixedContent.httpResources?.length || 0;
        const httpLinks = analysis.mixedContent.httpLinks?.length || 0;
        
        if (httpResources > 0) {
          recommendations.push({
            category: 'mixed-content',
            priority: 'high',
            title: 'Mixed Content - Insecure Resources',
            description: `${httpResources} HTTP resources loaded on HTTPS page`,
            impact: 'Browser warnings, blocked content, and security vulnerabilities',
            actionItems: [
              'Convert all HTTP resource URLs to HTTPS',
              'Update CDN configurations to use HTTPS',
              'Verify HTTPS availability for all external resources',
              'Use protocol-relative URLs where appropriate',
              'Implement Content Security Policy headers',
              'Test all functionality after HTTPS conversion'
            ]
          });
        }
        
        if (httpLinks > 0) {
          recommendations.push({
            category: 'mixed-content',
            priority: 'medium',
            title: 'Mixed Content - HTTP Links',
            description: `${httpLinks} HTTP links found on HTTPS page`,
            impact: 'Inconsistent user experience and potential security warnings',
            actionItems: [
              'Update HTTP links to use HTTPS where possible',
              'Review external link destinations for HTTPS support',
              'Consider removing or replacing non-HTTPS links',
              'Add warnings for external HTTP links',
              'Implement link checking automation',
              'Educate content creators about HTTPS best practices'
            ]
          });
        }
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating SSL recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive SSL analysis summary
   * @param {Object} analysis - SSL certificate analysis results
   * @returns {Object} SSL analysis summary
   */
  _generateSSLSummary(analysis) {
    try {
      const summary = {
        httpsEnabled: false,
        certificateStatus: 'Invalid',
        expirationStatus: 'Unknown',
        securityLevel: 'Poor',
        chainStatus: 'Invalid',
        mixedContentLevel: 'None',
        overallGrade: 'F',
        keyFindings: []
      };

      // HTTPS status
      summary.httpsEnabled = analysis.isHTTPS || false;
      if (!summary.httpsEnabled) {
        summary.keyFindings.push('HTTPS not implemented');
        return summary; // Early return for non-HTTPS sites
      }

      summary.keyFindings.push('HTTPS enabled');

      // Certificate status
      if (analysis.chain && analysis.chain.isValid) {
        summary.certificateStatus = 'Valid';
        summary.keyFindings.push('Valid SSL certificate');
      } else {
        summary.certificateStatus = 'Invalid';
        summary.keyFindings.push('Certificate validation issues');
      }

      // Expiration status
      if (analysis.expiration) {
        const daysUntilExpiration = analysis.expiration.daysUntilExpiration;
        
        if (daysUntilExpiration < 0) {
          summary.expirationStatus = 'Expired';
          summary.keyFindings.push(`Certificate expired ${Math.abs(daysUntilExpiration)} days ago`);
        } else if (daysUntilExpiration < 30) {
          summary.expirationStatus = 'Expiring Soon';
          summary.keyFindings.push(`Certificate expires in ${daysUntilExpiration} days`);
        } else {
          summary.expirationStatus = 'Valid';
          summary.keyFindings.push(`Certificate valid for ${daysUntilExpiration} days`);
        }
      }

      // Security level
      if (analysis.security) {
        const keySize = analysis.security.keySize || 0;
        const vulnerabilities = analysis.security.vulnerabilities || [];
        
        if (vulnerabilities.length === 0 && keySize >= 2048) {
          summary.securityLevel = 'Strong';
        } else if (vulnerabilities.length <= 1 && keySize >= 2048) {
          summary.securityLevel = 'Good';
        } else if (keySize >= 1024) {
          summary.securityLevel = 'Weak';
        } else {
          summary.securityLevel = 'Very Weak';
        }
        
        summary.keyFindings.push(`${keySize}-bit key size`);
        
        if (vulnerabilities.length > 0) {
          summary.keyFindings.push(`${vulnerabilities.length} security vulnerabilities`);
        }
      }

      // Chain status
      if (analysis.chain) {
        summary.chainStatus = analysis.chain.isValid ? 'Valid' : 'Invalid';
      }

      // Mixed content level
      if (analysis.mixedContent) {
        const httpResources = analysis.mixedContent.httpResources?.length || 0;
        const httpLinks = analysis.mixedContent.httpLinks?.length || 0;
        const totalMixed = httpResources + httpLinks;
        
        if (totalMixed === 0) {
          summary.mixedContentLevel = 'None';
        } else if (httpResources === 0 && httpLinks <= 3) {
          summary.mixedContentLevel = 'Low';
        } else if (httpResources <= 2 && totalMixed <= 10) {
          summary.mixedContentLevel = 'Medium';
        } else {
          summary.mixedContentLevel = 'High';
        }
        
        if (totalMixed > 0) {
          summary.keyFindings.push(`${totalMixed} mixed content items`);
        }
      }

      // Overall grade based on comprehensive score
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 90) summary.overallGrade = 'A';
      else if (score >= 80) summary.overallGrade = 'B';
      else if (score >= 70) summary.overallGrade = 'C';
      else if (score >= 60) summary.overallGrade = 'D';
      else summary.overallGrade = 'F';

      return summary;
    } catch (error) {
      this.log('Error generating SSL summary:', error.message);
      return {
        httpsEnabled: false,
        certificateStatus: 'Unknown',
        expirationStatus: 'Unknown',
        securityLevel: 'Unknown',
        chainStatus: 'Unknown',
        mixedContentLevel: 'Unknown',
        overallGrade: 'F',
        keyFindings: ['Analysis error occurred']
      };
    }
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * @deprecated Use analyze() method instead
   * Legacy method for backward compatibility
   */
  analyzeCertificate(url, pageData = {}) {
    console.warn('SSLCertificateAnalyzer.analyzeCertificate(url, pageData) is deprecated. Use analyze(context) method instead.');
    return this.performSSLCertificateAnalysis(url, pageData);
  }
}

export default SSLCertificateAnalyzer;
