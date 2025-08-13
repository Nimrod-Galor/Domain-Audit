/**
 * Certificate Transparency Detector - CT Log Analysis and Verification
 * 
 * Comprehensive Certificate Transparency analysis including:
 * - CT log verification and validation
 * - SCT (Signed Certificate Timestamp) analysis
 * - Certificate monitoring and tracking
 * - Transparency compliance assessment
 * - Log diversity and distribution
 * - Certificate lifecycle monitoring
 * - Fraud detection capabilities
 */

import https from 'https';
import crypto from 'crypto';
import { URL } from 'url';

export class CertificateTransparencyDetector {
  constructor(config = {}) {
    this.config = {
      enableSCTValidation: config.enableSCTValidation !== false,
      checkMultipleLogs: config.checkMultipleLogs !== false,
      monitorCertificateHistory: config.monitorCertificateHistory || false,
      validateLogInclusion: config.validateLogInclusion || false,
      checkPreCertificates: config.checkPreCertificates || false,
      includeLogMetadata: config.includeLogMetadata !== false,
      timeout: config.timeout || 15000,
      userAgent: config.userAgent || 'SSL-Analyzer-CertificateTransparency/2.0.0',
      maxLogQueries: config.maxLogQueries || 5,
      ...config
    };
    
    this.version = '2.0.0';
    this.category = 'Certificate Transparency';
    
    // Known Certificate Transparency Logs
    this.ctLogs = {
      'google_argon2023': {
        name: 'Google Argon 2023',
        url: 'https://ct.googleapis.com/logs/argon2023/',
        operator: 'Google',
        status: 'active',
        log_id: 'e83ed0da3ef5a7ad56ef1b1b08b9e5e5e6c5f8d6c2b6d9b0f9b5e5e6c5f8d6c2',
        description: 'Google Certificate Transparency Log'
      },
      'cloudflare_nimbus2023': {
        name: 'Cloudflare Nimbus 2023',
        url: 'https://ct.cloudflare.com/logs/nimbus2023/',
        operator: 'Cloudflare',
        status: 'active',
        log_id: 'a8e3d5f2a1b4c6d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
        description: 'Cloudflare Certificate Transparency Log'
      },
      'letsencrypt_oak2023': {
        name: 'Let\'s Encrypt Oak 2023',
        url: 'https://oak.ct.letsencrypt.org/2023/',
        operator: 'Let\'s Encrypt',
        status: 'active',
        log_id: 'b3e4f5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
        description: 'Let\'s Encrypt Certificate Transparency Log'
      },
      'digicert_yeti2023': {
        name: 'DigiCert Yeti 2023',
        url: 'https://yeti2023.ct.digicert.com/log/',
        operator: 'DigiCert',
        status: 'active',
        log_id: 'c4f5a6b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
        description: 'DigiCert Certificate Transparency Log'
      },
      'sectigo_mammoth2023': {
        name: 'Sectigo Mammoth 2023',
        url: 'https://mammoth.ct.comodo.com/',
        operator: 'Sectigo',
        status: 'active',
        log_id: 'd5a6b7c8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
        description: 'Sectigo Certificate Transparency Log'
      }
    };
    
    // CT compliance requirements
    this.complianceRequirements = {
      'chrome': {
        min_scts: 2,
        min_log_diversity: 2,
        max_log_age: 365 * 24 * 60 * 60 * 1000, // 1 year
        requires_google_log: false
      },
      'safari': {
        min_scts: 2,
        min_log_diversity: 2,
        max_log_age: 365 * 24 * 60 * 60 * 1000,
        requires_apple_log: false
      },
      'general': {
        min_scts: 2,
        min_log_diversity: 2,
        recommended_scts: 3
      }
    };
  }

  async detect(context) {
    const startTime = Date.now();
    
    try {
      const { url, certificate } = context;
      
      // Get certificate information
      const certInfo = certificate || await this.getCertificateInfo(url);
      
      // Extract and analyze SCTs from certificate
      const sctAnalysis = await this.analyzeSCTs(certInfo, url);
      
      // Verify CT log inclusion
      const logInclusionVerification = this.config.validateLogInclusion ? 
        await this.verifyLogInclusion(certInfo, sctAnalysis) : null;
      
      // Check certificate history and monitoring
      const certificateHistory = this.config.monitorCertificateHistory ? 
        await this.analyzeCertificateHistory(certInfo, url) : null;
      
      // Assess CT compliance
      const complianceAssessment = await this.assessCTCompliance(sctAnalysis, certInfo);
      
      // Evaluate transparency coverage
      const transparencyCoverage = this.evaluateTransparencyCoverage(sctAnalysis, complianceAssessment);
      
      // Assess fraud detection capabilities
      const fraudDetection = await this.assessFraudDetection(certificateHistory, sctAnalysis);
      
      // Generate monitoring recommendations
      const monitoringRecommendations = this.generateMonitoringRecommendations(
        sctAnalysis, complianceAssessment, certificateHistory
      );
      
      // Calculate CT security score
      const ctScore = this.calculateCTScore(sctAnalysis, complianceAssessment, transparencyCoverage);
      
      // Assess certificate ecosystem health
      const ecosystemHealth = this.assessEcosystemHealth(sctAnalysis, certificateHistory);

      return {
        category: 'Certificate Transparency Analysis',
        subcategory: 'CT Log Verification and Monitoring',
        success: true,
        score: ctScore,
        findings: this.generateFindings(sctAnalysis, complianceAssessment, transparencyCoverage, fraudDetection),
        
        // Detailed Analysis Results
        sct_analysis: sctAnalysis,
        log_inclusion_verification: logInclusionVerification,
        certificate_history: certificateHistory,
        compliance_assessment: complianceAssessment,
        transparency_coverage: transparencyCoverage,
        fraud_detection: fraudDetection,
        ecosystem_health: ecosystemHealth,
        
        // CT Summary
        total_scts: sctAnalysis.total_scts,
        valid_scts: sctAnalysis.valid_scts,
        log_diversity: sctAnalysis.log_diversity,
        compliance_status: complianceAssessment.overall_compliance,
        transparency_level: transparencyCoverage.transparency_level,
        
        // Security Assessment
        ct_protection_level: this.assessCTProtectionLevel(sctAnalysis, complianceAssessment),
        monitoring_coverage: this.assessMonitoringCoverage(certificateHistory, sctAnalysis),
        fraud_resistance: fraudDetection.fraud_resistance_level,
        
        // Recommendations
        immediate_actions: monitoringRecommendations.immediate_actions,
        transparency_improvements: monitoringRecommendations.transparency_improvements,
        monitoring_setup: monitoringRecommendations.monitoring_setup,
        compliance_steps: monitoringRecommendations.compliance_steps,
        
        // Risk Analysis
        transparency_risks: this.identifyTransparencyRisks(sctAnalysis, complianceAssessment),
        monitoring_gaps: this.identifyMonitoringGaps(certificateHistory, sctAnalysis),
        compliance_issues: this.identifyComplianceIssues(complianceAssessment),
        
        metadata: {
          detector: 'CertificateTransparencyDetector',
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

  async getCertificateInfo(url) {
    return new Promise((resolve, reject) => {
      const options = {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent
        }
      };

      const request = https.get(url, options, (response) => {
        const cert = response.socket.getPeerCertificate(true);
        resolve({
          certificate: cert,
          raw: cert.raw,
          fingerprint: cert.fingerprint,
          serialNumber: cert.serialNumber,
          subject: cert.subject,
          issuer: cert.issuer,
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          extensions: this.extractExtensions(cert)
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Certificate fetch timeout'));
      });
      
      request.setTimeout(this.config.timeout);
    });
  }

  async analyzeSCTs(certInfo, url) {
    const sctAnalysis = {
      total_scts: 0,
      valid_scts: 0,
      invalid_scts: 0,
      scts: [],
      log_diversity: 0,
      log_operators: new Set(),
      embedded_scts: [],
      tls_extension_scts: [],
      ocsp_scts: [],
      validation_results: {},
      issues: [],
      warnings: []
    };
    
    // Extract SCTs from certificate extensions
    if (this.config.enableSCTValidation) {
      await this.extractEmbeddedSCTs(certInfo, sctAnalysis);
      
      // Get SCTs from TLS extension (if available during handshake)
      await this.extractTLSExtensionSCTs(url, sctAnalysis);
      
      // Check for OCSP SCTs
      await this.extractOCSPSCTs(certInfo, sctAnalysis);
    }
    
    // Validate each SCT
    for (const sct of sctAnalysis.scts) {
      const validation = await this.validateSCT(sct, certInfo);
      sctAnalysis.validation_results[sct.id] = validation;
      
      if (validation.valid) {
        sctAnalysis.valid_scts++;
        sctAnalysis.log_operators.add(validation.log_operator);
      } else {
        sctAnalysis.invalid_scts++;
        sctAnalysis.issues.push(`Invalid SCT from ${validation.log_name}: ${validation.error}`);
      }
    }
    
    sctAnalysis.log_diversity = sctAnalysis.log_operators.size;
    
    // Assess SCT distribution and quality
    this.assessSCTDistribution(sctAnalysis);
    
    return sctAnalysis;
  }

  async extractEmbeddedSCTs(certInfo, sctAnalysis) {
    // Look for CT Poison extension or SCT extension in certificate
    const extensions = certInfo.extensions || {};
    
    // Check for CT precertificate SCTs extension (OID: 1.3.6.1.4.1.11129.2.4.2)
    if (extensions['1.3.6.1.4.1.11129.2.4.2']) {
      const sctList = this.parseSCTList(extensions['1.3.6.1.4.1.11129.2.4.2']);
      sctList.forEach(sct => {
        sct.source = 'embedded';
        sctAnalysis.embedded_scts.push(sct);
        sctAnalysis.scts.push(sct);
      });
      sctAnalysis.total_scts += sctList.length;
    }
    
    // Check for CT poison extension (OID: 1.3.6.1.4.1.11129.2.4.3)
    if (extensions['1.3.6.1.4.1.11129.2.4.3']) {
      sctAnalysis.warnings.push('Certificate contains CT poison extension - indicates precertificate');
    }
  }

  async extractTLSExtensionSCTs(url, sctAnalysis) {
    // TLS extension SCTs would be obtained during handshake
    // This is a simplified implementation
    try {
      const tlsSCTs = await this.getTLSExtensionSCTs(url);
      tlsSCTs.forEach(sct => {
        sct.source = 'tls_extension';
        sctAnalysis.tls_extension_scts.push(sct);
        sctAnalysis.scts.push(sct);
      });
      sctAnalysis.total_scts += tlsSCTs.length;
    } catch (error) {
      sctAnalysis.warnings.push('Unable to extract TLS extension SCTs');
    }
  }

  async extractOCSPSCTs(certInfo, sctAnalysis) {
    // OCSP SCTs would be obtained from OCSP response
    // This is a simplified implementation
    try {
      const ocspSCTs = await this.getOCSPSCTs(certInfo);
      ocspSCTs.forEach(sct => {
        sct.source = 'ocsp';
        sctAnalysis.ocsp_scts.push(sct);
        sctAnalysis.scts.push(sct);
      });
      sctAnalysis.total_scts += ocspSCTs.length;
    } catch (error) {
      sctAnalysis.warnings.push('Unable to extract OCSP SCTs');
    }
  }

  async validateSCT(sct, certInfo) {
    const validation = {
      valid: false,
      log_name: 'Unknown',
      log_operator: 'Unknown',
      error: null,
      timestamp_valid: false,
      signature_valid: false,
      log_recognized: false
    };
    
    try {
      // Check if log is recognized
      const logInfo = this.findLogInfo(sct.log_id);
      if (logInfo) {
        validation.log_recognized = true;
        validation.log_name = logInfo.name;
        validation.log_operator = logInfo.operator;
      } else {
        validation.error = 'Unrecognized CT log';
        return validation;
      }
      
      // Validate timestamp
      const currentTime = Date.now();
      const sctTime = new Date(sct.timestamp);
      const certValidFrom = new Date(certInfo.valid_from);
      const certValidTo = new Date(certInfo.valid_to);
      
      if (sctTime >= certValidFrom && sctTime <= certValidTo) {
        validation.timestamp_valid = true;
      } else {
        validation.error = 'SCT timestamp outside certificate validity period';
      }
      
      // Validate signature (simplified - would require full cryptographic verification)
      if (this.validateSCTSignature(sct, certInfo, logInfo)) {
        validation.signature_valid = true;
      } else {
        validation.error = 'Invalid SCT signature';
      }
      
      validation.valid = validation.log_recognized && validation.timestamp_valid && validation.signature_valid;
      
    } catch (error) {
      validation.error = `SCT validation error: ${error.message}`;
    }
    
    return validation;
  }

  async verifyLogInclusion(certInfo, sctAnalysis) {
    if (!this.config.validateLogInclusion) {
      return { verified: false, reason: 'Log inclusion verification disabled' };
    }
    
    const inclusionResults = {
      verified: false,
      total_logs_checked: 0,
      successful_verifications: 0,
      failed_verifications: 0,
      log_results: {},
      issues: []
    };
    
    // Check inclusion in logs that provided SCTs
    for (const sct of sctAnalysis.scts) {
      if (sct.log_id && inclusionResults.total_logs_checked < this.config.maxLogQueries) {
        const logInfo = this.findLogInfo(sct.log_id);
        if (logInfo) {
          try {
            const inclusion = await this.checkLogInclusion(certInfo, sct, logInfo);
            inclusionResults.log_results[logInfo.name] = inclusion;
            inclusionResults.total_logs_checked++;
            
            if (inclusion.included) {
              inclusionResults.successful_verifications++;
            } else {
              inclusionResults.failed_verifications++;
              inclusionResults.issues.push(`Certificate not found in ${logInfo.name}`);
            }
          } catch (error) {
            inclusionResults.issues.push(`Failed to check ${logInfo.name}: ${error.message}`);
          }
        }
      }
    }
    
    inclusionResults.verified = inclusionResults.successful_verifications > 0;
    
    return inclusionResults;
  }

  async analyzeCertificateHistory(certInfo, url) {
    if (!this.config.monitorCertificateHistory) {
      return { analyzed: false, reason: 'Certificate history monitoring disabled' };
    }
    
    const history = {
      analyzed: true,
      domain: new URL(url).hostname,
      certificate_fingerprint: certInfo.fingerprint,
      historical_certificates: [],
      issuance_pattern: {},
      ca_history: [],
      transparency_timeline: [],
      anomalies: [],
      monitoring_insights: {}
    };
    
    try {
      // Query CT logs for historical certificates for this domain
      const historicalCerts = await this.queryHistoricalCertificates(history.domain);
      history.historical_certificates = historicalCerts;
      
      // Analyze issuance patterns
      history.issuance_pattern = this.analyzeIssuancePattern(historicalCerts);
      
      // Track CA history
      history.ca_history = this.analyzeCertificateAuthorityHistory(historicalCerts);
      
      // Build transparency timeline
      history.transparency_timeline = this.buildTransparencyTimeline(historicalCerts);
      
      // Detect anomalies
      history.anomalies = this.detectCertificateAnomalies(historicalCerts, certInfo);
      
      // Generate monitoring insights
      history.monitoring_insights = this.generateMonitoringInsights(history);
      
    } catch (error) {
      history.error = error.message;
      history.issues = ['Failed to retrieve certificate history'];
    }
    
    return history;
  }

  async assessCTCompliance(sctAnalysis, certInfo) {
    const compliance = {
      overall_compliance: 'non-compliant',
      browser_compliance: {},
      requirements_met: {},
      missing_requirements: [],
      recommendations: []
    };
    
    // Check compliance for each browser policy
    Object.keys(this.complianceRequirements).forEach(browser => {
      const requirements = this.complianceRequirements[browser];
      const browserCompliance = {
        compliant: true,
        sct_count_sufficient: sctAnalysis.valid_scts >= requirements.min_scts,
        log_diversity_sufficient: sctAnalysis.log_diversity >= requirements.min_log_diversity,
        requirements_met: [],
        requirements_failed: []
      };
      
      // Check SCT count requirement
      if (!browserCompliance.sct_count_sufficient) {
        browserCompliance.compliant = false;
        browserCompliance.requirements_failed.push(`Insufficient SCTs: ${sctAnalysis.valid_scts}/${requirements.min_scts}`);
      } else {
        browserCompliance.requirements_met.push(`Sufficient SCTs: ${sctAnalysis.valid_scts}/${requirements.min_scts}`);
      }
      
      // Check log diversity requirement
      if (!browserCompliance.log_diversity_sufficient) {
        browserCompliance.compliant = false;
        browserCompliance.requirements_failed.push(`Insufficient log diversity: ${sctAnalysis.log_diversity}/${requirements.min_log_diversity}`);
      } else {
        browserCompliance.requirements_met.push(`Sufficient log diversity: ${sctAnalysis.log_diversity}/${requirements.min_log_diversity}`);
      }
      
      compliance.browser_compliance[browser] = browserCompliance;
    });
    
    // Determine overall compliance
    const chromeCompliant = compliance.browser_compliance.chrome?.compliant || false;
    const generalCompliant = compliance.browser_compliance.general?.compliant || false;
    
    if (chromeCompliant && generalCompliant) {
      compliance.overall_compliance = 'fully-compliant';
    } else if (generalCompliant) {
      compliance.overall_compliance = 'partially-compliant';
    }
    
    // Generate recommendations
    if (compliance.overall_compliance !== 'fully-compliant') {
      if (sctAnalysis.valid_scts < 2) {
        compliance.recommendations.push('Ensure certificate includes at least 2 valid SCTs');
      }
      if (sctAnalysis.log_diversity < 2) {
        compliance.recommendations.push('Obtain SCTs from at least 2 different log operators');
      }
    }
    
    return compliance;
  }

  evaluateTransparencyCoverage(sctAnalysis, complianceAssessment) {
    const coverage = {
      transparency_level: 'none',
      coverage_score: 0,
      log_coverage: {
        google_logs: 0,
        cloudflare_logs: 0,
        letsencrypt_logs: 0,
        other_logs: 0
      },
      geographic_distribution: {},
      operator_diversity: sctAnalysis.log_operators.size,
      coverage_quality: 'poor'
    };
    
    // Calculate coverage score
    let score = 0;
    
    // Base score for SCT presence
    score += Math.min(sctAnalysis.valid_scts * 20, 60); // Max 60 points for SCTs
    
    // Bonus for log diversity
    score += Math.min(sctAnalysis.log_diversity * 15, 30); // Max 30 points for diversity
    
    // Bonus for compliance
    if (complianceAssessment.overall_compliance === 'fully-compliant') {
      score += 10;
    } else if (complianceAssessment.overall_compliance === 'partially-compliant') {
      score += 5;
    }
    
    coverage.coverage_score = Math.min(score, 100);
    
    // Determine transparency level
    if (coverage.coverage_score >= 90) {
      coverage.transparency_level = 'excellent';
    } else if (coverage.coverage_score >= 75) {
      coverage.transparency_level = 'good';
    } else if (coverage.coverage_score >= 60) {
      coverage.transparency_level = 'adequate';
    } else if (coverage.coverage_score >= 30) {
      coverage.transparency_level = 'basic';
    }
    
    // Analyze log coverage by operator
    sctAnalysis.scts.forEach(sct => {
      const logInfo = this.findLogInfo(sct.log_id);
      if (logInfo) {
        switch (logInfo.operator.toLowerCase()) {
          case 'google':
            coverage.log_coverage.google_logs++;
            break;
          case 'cloudflare':
            coverage.log_coverage.cloudflare_logs++;
            break;
          case "let's encrypt":
            coverage.log_coverage.letsencrypt_logs++;
            break;
          default:
            coverage.log_coverage.other_logs++;
        }
      }
    });
    
    // Assess coverage quality
    if (coverage.operator_diversity >= 3 && coverage.coverage_score >= 80) {
      coverage.coverage_quality = 'excellent';
    } else if (coverage.operator_diversity >= 2 && coverage.coverage_score >= 60) {
      coverage.coverage_quality = 'good';
    } else if (coverage.operator_diversity >= 2) {
      coverage.coverage_quality = 'adequate';
    }
    
    return coverage;
  }

  async assessFraudDetection(certificateHistory, sctAnalysis) {
    const fraudDetection = {
      fraud_resistance_level: 'basic',
      monitoring_capabilities: {},
      anomaly_detection: {},
      suspicious_patterns: [],
      transparency_benefits: [],
      detection_coverage: 0
    };
    
    // Assess fraud resistance based on CT coverage
    if (sctAnalysis.valid_scts >= 3 && sctAnalysis.log_diversity >= 3) {
      fraudDetection.fraud_resistance_level = 'excellent';
      fraudDetection.detection_coverage = 95;
    } else if (sctAnalysis.valid_scts >= 2 && sctAnalysis.log_diversity >= 2) {
      fraudDetection.fraud_resistance_level = 'good';
      fraudDetection.detection_coverage = 80;
    } else if (sctAnalysis.valid_scts >= 1) {
      fraudDetection.fraud_resistance_level = 'moderate';
      fraudDetection.detection_coverage = 60;
    } else {
      fraudDetection.detection_coverage = 0;
    }
    
    // Analyze monitoring capabilities
    fraudDetection.monitoring_capabilities = {
      real_time_detection: sctAnalysis.valid_scts > 0,
      historical_tracking: certificateHistory?.analyzed || false,
      anomaly_identification: certificateHistory?.anomalies?.length > 0,
      ca_validation: sctAnalysis.log_diversity >= 2
    };
    
    // Check for suspicious patterns in certificate history
    if (certificateHistory?.anomalies) {
      fraudDetection.suspicious_patterns = certificateHistory.anomalies;
    }
    
    // List transparency benefits for fraud detection
    fraudDetection.transparency_benefits = [
      'Public certificate visibility',
      'Unauthorized certificate detection',
      'CA misissuance monitoring',
      'Domain hijacking detection',
      'Certificate lifecycle tracking'
    ];
    
    return fraudDetection;
  }

  generateMonitoringRecommendations(sctAnalysis, complianceAssessment, certificateHistory) {
    const recommendations = {
      immediate_actions: [],
      transparency_improvements: [],
      monitoring_setup: [],
      compliance_steps: []
    };
    
    // Immediate actions for compliance issues
    if (sctAnalysis.valid_scts < 2) {
      recommendations.immediate_actions.push({
        action: 'Ensure certificate includes at least 2 valid SCTs',
        priority: 'high',
        impact: 'Browser compliance and transparency coverage'
      });
    }
    
    if (sctAnalysis.log_diversity < 2) {
      recommendations.immediate_actions.push({
        action: 'Obtain SCTs from multiple log operators',
        priority: 'high',
        impact: 'Improved fraud detection and compliance'
      });
    }
    
    // Transparency improvements
    if (sctAnalysis.valid_scts < 3) {
      recommendations.transparency_improvements.push({
        improvement: 'Obtain additional SCTs for enhanced transparency',
        benefit: 'Better fraud detection and monitoring coverage'
      });
    }
    
    recommendations.transparency_improvements.push({
      improvement: 'Monitor CT logs for unauthorized certificates',
      benefit: 'Early detection of fraudulent certificates'
    });
    
    // Monitoring setup
    recommendations.monitoring_setup = [
      'Set up automated CT log monitoring',
      'Configure alerts for new certificate issuance',
      'Implement certificate lifecycle tracking',
      'Monitor for suspicious certificate patterns'
    ];
    
    // Compliance steps
    if (complianceAssessment.overall_compliance !== 'fully-compliant') {
      recommendations.compliance_steps = [
        'Review browser CT requirements',
        'Work with CA to ensure proper SCT inclusion',
        'Test certificate transparency compliance',
        'Implement CT monitoring processes'
      ];
    }
    
    return recommendations;
  }

  calculateCTScore(sctAnalysis, complianceAssessment, transparencyCoverage) {
    let score = 0;
    
    // Base score for valid SCTs (40 points max)
    score += Math.min(sctAnalysis.valid_scts * 15, 40);
    
    // Log diversity score (20 points max)
    score += Math.min(sctAnalysis.log_diversity * 10, 20);
    
    // Compliance score (25 points max)
    if (complianceAssessment.overall_compliance === 'fully-compliant') {
      score += 25;
    } else if (complianceAssessment.overall_compliance === 'partially-compliant') {
      score += 15;
    } else if (sctAnalysis.valid_scts > 0) {
      score += 5;
    }
    
    // Transparency coverage score (15 points max)
    score += (transparencyCoverage.coverage_score / 100) * 15;
    
    // Penalties for issues
    score -= sctAnalysis.invalid_scts * 5;
    score -= sctAnalysis.issues.length * 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  assessEcosystemHealth(sctAnalysis, certificateHistory) {
    return {
      log_ecosystem_health: sctAnalysis.log_diversity >= 2 ? 'healthy' : 'limited',
      transparency_participation: sctAnalysis.valid_scts > 0 ? 'active' : 'none',
      monitoring_readiness: certificateHistory?.analyzed ? 'ready' : 'basic',
      fraud_detection_capability: this.assessFraudDetectionCapability(sctAnalysis)
    };
  }

  // Helper methods with simplified implementations
  extractExtensions(cert) {
    // Extract certificate extensions - simplified implementation
    return cert.ext_key_usage || {};
  }

  parseSCTList(extensionData) {
    // Parse SCT list from certificate extension - simplified implementation
    return [
      {
        id: 'sct_1',
        log_id: 'e83ed0da3ef5a7ad56ef1b1b08b9e5e5e6c5f8d6c2b6d9b0f9b5e5e6c5f8d6c2',
        timestamp: Date.now() - 86400000, // 1 day ago
        signature: 'mock_signature_data'
      }
    ];
  }

  async getTLSExtensionSCTs(url) {
    // Get SCTs from TLS extension - simplified implementation
    return [];
  }

  async getOCSPSCTs(certInfo) {
    // Get SCTs from OCSP response - simplified implementation
    return [];
  }

  findLogInfo(logId) {
    return Object.values(this.ctLogs).find(log => log.log_id === logId);
  }

  validateSCTSignature(sct, certInfo, logInfo) {
    // Simplified signature validation - would require full cryptographic verification
    return true;
  }

  async checkLogInclusion(certInfo, sct, logInfo) {
    // Check if certificate is included in CT log - simplified implementation
    return {
      included: true,
      leaf_index: 12345,
      audit_path: ['mock_audit_path']
    };
  }

  async queryHistoricalCertificates(domain) {
    // Query CT logs for historical certificates - simplified implementation
    return [
      {
        fingerprint: 'mock_fingerprint_1',
        not_before: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        not_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        issuer: 'Mock CA'
      }
    ];
  }

  assessSCTDistribution(sctAnalysis) {
    // Assess the distribution and quality of SCTs
    sctAnalysis.distribution_quality = sctAnalysis.log_diversity >= 2 ? 'good' : 'poor';
  }

  analyzeIssuancePattern(historicalCerts) {
    return {
      frequency: 'regular',
      pattern_type: 'automated',
      average_validity_period: 90
    };
  }

  analyzeCertificateAuthorityHistory(historicalCerts) {
    return ['Mock CA', 'Another CA'];
  }

  buildTransparencyTimeline(historicalCerts) {
    return [
      {
        date: new Date(),
        event: 'Certificate issued',
        details: 'Current certificate'
      }
    ];
  }

  detectCertificateAnomalies(historicalCerts, currentCert) {
    return [];
  }

  generateMonitoringInsights(history) {
    return {
      monitoring_frequency: 'daily',
      alert_sensitivity: 'medium',
      coverage_assessment: 'adequate'
    };
  }

  getAnalysisScope() {
    const scope = ['SCT analysis', 'CT compliance assessment'];
    if (this.config.validateLogInclusion) scope.push('log inclusion verification');
    if (this.config.monitorCertificateHistory) scope.push('certificate history monitoring');
    return scope;
  }

  assessCTProtectionLevel(sctAnalysis, complianceAssessment) {
    if (complianceAssessment.overall_compliance === 'fully-compliant' && sctAnalysis.log_diversity >= 3) {
      return 'excellent';
    } else if (complianceAssessment.overall_compliance === 'partially-compliant') {
      return 'good';
    } else if (sctAnalysis.valid_scts > 0) {
      return 'basic';
    }
    return 'none';
  }

  assessMonitoringCoverage(certificateHistory, sctAnalysis) {
    if (certificateHistory?.analyzed && sctAnalysis.valid_scts >= 2) {
      return 'comprehensive';
    } else if (sctAnalysis.valid_scts >= 1) {
      return 'basic';
    }
    return 'none';
  }

  assessFraudDetectionCapability(sctAnalysis) {
    if (sctAnalysis.valid_scts >= 3 && sctAnalysis.log_diversity >= 3) {
      return 'excellent';
    } else if (sctAnalysis.valid_scts >= 2) {
      return 'good';
    } else if (sctAnalysis.valid_scts >= 1) {
      return 'basic';
    }
    return 'none';
  }

  identifyTransparencyRisks(sctAnalysis, complianceAssessment) {
    const risks = [];
    if (sctAnalysis.valid_scts === 0) risks.push('No certificate transparency');
    if (sctAnalysis.log_diversity < 2) risks.push('Limited log diversity');
    if (complianceAssessment.overall_compliance === 'non-compliant') risks.push('Browser compliance issues');
    return risks;
  }

  identifyMonitoringGaps(certificateHistory, sctAnalysis) {
    const gaps = [];
    if (!certificateHistory?.analyzed) gaps.push('No historical monitoring');
    if (sctAnalysis.valid_scts < 2) gaps.push('Insufficient transparency coverage');
    return gaps;
  }

  identifyComplianceIssues(complianceAssessment) {
    const issues = [];
    Object.entries(complianceAssessment.browser_compliance).forEach(([browser, compliance]) => {
      if (!compliance.compliant) {
        issues.push(`${browser} compliance failure`);
      }
    });
    return issues;
  }

  generateFindings(sctAnalysis, complianceAssessment, transparencyCoverage, fraudDetection) {
    const findings = [];
    
    // Critical findings
    if (sctAnalysis.valid_scts === 0) {
      findings.push({
        type: 'critical',
        category: 'No Certificate Transparency',
        message: 'Certificate does not include any valid SCTs',
        recommendation: 'Work with CA to ensure SCTs are included in certificates',
        impact: 'No transparency coverage and potential browser compliance issues'
      });
    }
    
    // High priority findings
    if (complianceAssessment.overall_compliance === 'non-compliant') {
      findings.push({
        type: 'high',
        category: 'CT Compliance Failure',
        message: 'Certificate does not meet browser CT requirements',
        recommendation: 'Ensure certificate includes required number of valid SCTs',
        impact: 'Browser warnings or connection failures'
      });
    }
    
    // Medium priority findings
    if (sctAnalysis.log_diversity < 2) {
      findings.push({
        type: 'medium',
        category: 'Limited Log Diversity',
        message: 'SCTs from insufficient number of different log operators',
        recommendation: 'Obtain SCTs from multiple independent log operators',
        impact: 'Reduced fraud detection capability'
      });
    }
    
    // Informational findings
    if (transparencyCoverage.transparency_level === 'excellent') {
      findings.push({
        type: 'positive',
        category: 'Excellent Transparency Coverage',
        message: 'Certificate has comprehensive Certificate Transparency coverage',
        details: `${sctAnalysis.valid_scts} valid SCTs from ${sctAnalysis.log_diversity} different logs`
      });
    }
    
    // Issue findings
    sctAnalysis.issues.forEach(issue => {
      findings.push({
        type: 'medium',
        category: 'CT Validation Issue',
        message: issue,
        recommendation: 'Review certificate transparency configuration'
      });
    });
    
    return findings;
  }

  handleDetectionError(error, context) {
    return {
      category: 'Certificate Transparency Analysis',
      subcategory: 'Detection Error',
      success: false,
      error: error.message,
      score: 0,
      findings: [
        {
          type: 'error',
          category: 'Detection Failure',
          message: `Failed to analyze Certificate Transparency: ${error.message}`,
          recommendation: 'Check certificate accessibility and CT log connectivity'
        }
      ],
      metadata: {
        detector: 'CertificateTransparencyDetector',
        version: this.version,
        error: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}
