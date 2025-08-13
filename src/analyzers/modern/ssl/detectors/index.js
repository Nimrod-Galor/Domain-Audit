/**
 * SSL Detectors Index - Comprehensive SSL/TLS Detection Components
 * 
 * Exports all specialized SSL detection modules implementing
 * the GPT-5 style modular detector architecture.
 */

// Core SSL Detection Components
export { CertificateChainDetector } from './certificate-chain-detector.js';
export { ExpirationDetector } from './expiration-detector.js';
export { SecurityProtocolDetector } from './security-protocol-detector.js';
export { CertificateAuthorityDetector } from './certificate-authority-detector.js';
export { MixedContentDetector } from './mixed-content-detector.js';
export { SecurityHeadersDetector as SecurityHeaderDetector } from './security-headers-detector.js';
export { HSTSDetector } from './hsts-detector.js';
export { CertificateTransparencyDetector as TransparencyDetector } from './certificate-transparency-detector.js';
export { PerformanceDetector } from './performance-detector.js';
export { ComplianceDetector } from './compliance-detector.js';

// Detector Registry with Configurations
export const SSL_DETECTOR_REGISTRY = {
  certificateChain: {
    name: 'Certificate Chain Detector',
    description: 'Validates SSL certificate chain integrity and trust path',
    category: 'Certificate Validation',
    priority: 'critical',
    dependencies: [],
    configurable: true,
    defaultConfig: {
      validateFullChain: true,
      checkIntermediateCerts: true,
      validateRootCA: true,
      checkChainOrder: true,
      verifySignatures: true,
      maxChainLength: 10,
      allowSelfSigned: false,
      strictValidation: true
    }
  },
  
  expiration: {
    name: 'Certificate Expiration Detector',
    description: 'Monitors certificate expiration dates and renewal requirements',
    category: 'Certificate Lifecycle',
    priority: 'high',
    dependencies: ['certificateChain'],
    configurable: true,
    defaultConfig: {
      warningThresholdDays: 30,
      criticalThresholdDays: 7,
      checkRenewalWindow: true,
      validateNotBefore: true,
      validateNotAfter: true,
      trackRenewalHistory: false,
      alerting: {
        enabled: true,
        methods: ['email', 'webhook'],
        frequency: 'daily'
      }
    }
  },
  
  securityProtocol: {
    name: 'Security Protocol Detector',
    description: 'Analyzes TLS versions, cipher suites, and protocol security',
    category: 'Protocol Security',
    priority: 'high',
    dependencies: [],
    configurable: true,
    defaultConfig: {
      minimumTLSVersion: '1.2',
      preferredTLSVersion: '1.3',
      allowedCipherSuites: 'secure',
      checkProtocolDowngrade: true,
      validateKeyExchange: true,
      assessPerfectForwardSecrecy: true,
      checkSessionResumption: true,
      evaluateOCSPStapling: true
    }
  },
  
  certificateAuthority: {
    name: 'Certificate Authority Detector',
    description: 'Validates CA trust, reputation, and compliance status',
    category: 'Trust Assessment',
    priority: 'medium',
    dependencies: ['certificateChain'],
    configurable: true,
    defaultConfig: {
      trustedCAList: 'browser-default',
      checkCARevocation: true,
      validateCAConstraints: true,
      assessCAReputation: true,
      checkCACompliance: true,
      evaluateCAHistory: false,
      crossCertificationCheck: true
    }
  },
  
  mixedContent: {
    name: 'Mixed Content Detector',
    description: 'Identifies and analyzes mixed HTTP/HTTPS content issues',
    category: 'Content Security',
    priority: 'medium',
    dependencies: [],
    configurable: true,
    defaultConfig: {
      scanDepth: 'surface',
      checkImages: true,
      checkScripts: true,
      checkStylesheets: true,
      checkForms: true,
      checkFrames: true,
      checkWebSocket: true,
      reportPassiveMixed: true,
      reportActiveMixed: true
    }
  },
  
  securityHeaders: {
    name: 'Security Header Detector',
    description: 'Analyzes HTTP security headers and their implementation',
    category: 'Header Security',
    priority: 'medium',
    dependencies: [],
    configurable: true,
    defaultConfig: {
      requiredHeaders: [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy'
      ],
      validateHeaderValues: true,
      checkHeaderSyntax: true,
      assessHeaderEffectiveness: true,
      reportMissingHeaders: true,
      reportWeakHeaders: true
    }
  },
  
  hsts: {
    name: 'HSTS Policy Detector',
    description: 'Evaluates HTTP Strict Transport Security implementation',
    category: 'Transport Security',
    priority: 'medium',
    dependencies: ['securityHeaders'],
    configurable: true,
    defaultConfig: {
      minimumMaxAge: 31536000, // 1 year
      requireIncludeSubDomains: true,
      checkPreloadList: true,
      validateHSTSHeader: true,
      assessImplementation: true,
      checkHSTSPreload: false,
      reportHSTSIssues: true
    }
  },
  
  transparency: {
    name: 'Certificate Transparency Detector',
    description: 'Monitors certificate transparency logs and compliance',
    category: 'Transparency & Monitoring',
    priority: 'low',
    dependencies: ['certificateChain'],
    configurable: true,
    defaultConfig: {
      checkCTLogs: true,
      requiredSCTs: 2,
      validateSCTSignatures: true,
      monitorCTLogs: false,
      checkCTCompliance: true,
      assessCTCoverage: true,
      reportCTIssues: true
    }
  },
  
  performance: {
    name: 'SSL Performance Detector',
    description: 'Analyzes SSL/TLS performance impact and optimization opportunities',
    category: 'Performance Optimization',
    priority: 'low',
    dependencies: ['securityProtocol'],
    configurable: true,
    defaultConfig: {
      measureHandshakeTime: true,
      assessSessionReuse: true,
      checkOCSPPerformance: true,
      evaluateCompressionImpact: false,
      measureThroughput: false,
      checkKeepAlive: true,
      reportPerformanceIssues: true
    }
  },
  
  compliance: {
    name: 'SSL Compliance Detector',
    description: 'Validates compliance with security standards and regulations',
    category: 'Compliance Assessment',
    priority: 'medium',
    dependencies: ['certificateChain', 'securityProtocol'],
    configurable: true,
    defaultConfig: {
      standards: ['PCI-DSS', 'SOC-2', 'ISO-27001', 'NIST'],
      checkPCIDSS: true,
      checkSOC2: true,
      checkISO27001: false,
      checkNIST: false,
      validateCompliance: true,
      generateComplianceReport: true,
      reportViolations: true
    }
  }
};

// Detector Capabilities Matrix
export const SSL_DETECTOR_CAPABILITIES = {
  analysis_types: [
    'certificate_validation',
    'chain_verification',
    'expiration_monitoring',
    'protocol_security',
    'trust_assessment',
    'content_security',
    'header_analysis',
    'transport_security',
    'transparency_monitoring',
    'performance_analysis',
    'compliance_validation'
  ],
  
  security_standards: [
    'TLS 1.2/1.3',
    'X.509 PKI',
    'RFC 5280',
    'RFC 6125',
    'RFC 6797 (HSTS)',
    'CT RFC 6962',
    'PCI DSS',
    'SOC 2',
    'ISO 27001'
  ],
  
  detection_patterns: {
    certificate_issues: [
      'expired_certificates',
      'invalid_chains',
      'weak_signatures',
      'untrusted_cas',
      'hostname_mismatches',
      'self_signed_certificates'
    ],
    protocol_vulnerabilities: [
      'weak_ciphers',
      'protocol_downgrade',
      'missing_forward_secrecy',
      'weak_key_exchange',
      'compression_attacks',
      'session_vulnerabilities'
    ],
    implementation_flaws: [
      'missing_security_headers',
      'weak_hsts_policies',
      'mixed_content',
      'improper_redirects',
      'certificate_pinning_issues',
      'ocsp_failures'
    ],
    compliance_gaps: [
      'pci_dss_violations',
      'regulatory_non_compliance',
      'policy_violations',
      'standard_deviations',
      'audit_failures',
      'certification_gaps'
    ]
  },
  
  assessment_categories: [
    'critical_security_issues',
    'high_priority_warnings',
    'medium_risk_findings',
    'low_impact_optimizations',
    'informational_notices',
    'best_practice_recommendations'
  ]
};

// Helper Functions for Detector Management
export function getDetectorMetadata(detectorName) {
  return SSL_DETECTOR_REGISTRY[detectorName] || null;
}

export function getAllDetectorNames() {
  return Object.keys(SSL_DETECTOR_REGISTRY);
}

export function getDetectorsByCategory(category) {
  return Object.entries(SSL_DETECTOR_REGISTRY)
    .filter(([_, config]) => config.category === category)
    .map(([name, _]) => name);
}

export function getDetectorsByPriority(priority) {
  return Object.entries(SSL_DETECTOR_REGISTRY)
    .filter(([_, config]) => config.priority === priority)
    .map(([name, _]) => name);
}

export function validateDetectorConfig(detectorName, config) {
  const detectorMeta = SSL_DETECTOR_REGISTRY[detectorName];
  if (!detectorMeta) {
    return { valid: false, error: 'Unknown detector' };
  }
  
  // Basic validation - can be extended
  return { valid: true };
}

export function getDetectorDependencies(detectorName) {
  const detectorMeta = SSL_DETECTOR_REGISTRY[detectorName];
  return detectorMeta?.dependencies || [];
}

export function optimizeDetectorOrder(detectorNames) {
  // Sort detectors based on dependencies and priority
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return detectorNames.sort((a, b) => {
    const aConfig = SSL_DETECTOR_REGISTRY[a];
    const bConfig = SSL_DETECTOR_REGISTRY[b];
    
    if (!aConfig || !bConfig) return 0;
    
    // First sort by dependency (detectors with no dependencies first)
    const aDeps = aConfig.dependencies?.length || 0;
    const bDeps = bConfig.dependencies?.length || 0;
    
    if (aDeps !== bDeps) return aDeps - bDeps;
    
    // Then sort by priority
    const aPriority = priorityOrder[aConfig.priority] || 0;
    const bPriority = priorityOrder[bConfig.priority] || 0;
    
    return bPriority - aPriority;
  });
}
