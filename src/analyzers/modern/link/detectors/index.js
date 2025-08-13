/**
 * Link Analyzer Detectors - GPT-5 Style Modular Detection System
 * 
 * Comprehensive link detection and analysis components for the
 * Link Analyzer Combined Approach implementation.
 */

// Import all detector modules
export { InternalLinkDetector } from './internal-link-detector.js';
export { ExternalLinkDetector } from './external-link-detector.js';
export { AnchorTextDetector } from './anchor-text-detector.js';
export { LinkQualityDetector } from './link-quality-detector.js';
export { BrokenLinkDetector } from './broken-link-detector.js';
export { LinkStructureDetector } from './link-structure-detector.js';
export { LinkContextDetector } from './link-context-detector.js';

// Detector registry for dynamic loading
export const LINK_DETECTORS = {
  internal: 'InternalLinkDetector',
  external: 'ExternalLinkDetector',
  anchorText: 'AnchorTextDetector',
  linkQuality: 'LinkQualityDetector',
  brokenLink: 'BrokenLinkDetector',
  linkStructure: 'LinkStructureDetector',
  linkContext: 'LinkContextDetector'
};

// Detection patterns and configurations
export const LINK_DETECTION_PATTERNS = {
  INTERNAL_PATTERNS: {
    SAME_DOMAIN: 'same-domain-links',
    RELATIVE_URLS: 'relative-path-links',
    HASH_LINKS: 'anchor-hash-links',
    PROTOCOL_RELATIVE: 'protocol-relative-links'
  },

  EXTERNAL_PATTERNS: {
    DIFFERENT_DOMAIN: 'external-domain-links',
    SUBDOMAIN: 'subdomain-links',
    SOCIAL_MEDIA: 'social-platform-links',
    CDN_RESOURCES: 'cdn-resource-links'
  },

  ANCHOR_PATTERNS: {
    EXACT_MATCH: 'exact-keyword-match',
    PARTIAL_MATCH: 'partial-keyword-match',
    BRANDED: 'brand-name-anchors',
    GENERIC: 'generic-text-anchors',
    URL_AS_ANCHOR: 'url-as-anchor-text',
    IMAGE_ALT: 'image-alt-anchors'
  },

  QUALITY_INDICATORS: {
    AUTHORITY_SIGNALS: 'domain-authority-indicators',
    RELEVANCE_SIGNALS: 'content-relevance-indicators',
    TRUST_SIGNALS: 'trust-and-safety-indicators',
    SPAM_SIGNALS: 'spam-and-manipulation-indicators'
  }
};

// Link classification schemes
export const LINK_CLASSIFICATIONS = {
  BY_TYPE: {
    NAVIGATIONAL: 'navigation-links',
    CONTENT: 'content-links',
    FOOTER: 'footer-links',
    SIDEBAR: 'sidebar-links',
    BREADCRUMB: 'breadcrumb-links',
    PAGINATION: 'pagination-links'
  },

  BY_PURPOSE: {
    SEO: 'seo-optimization-links',
    UX: 'user-experience-links',
    CONVERSION: 'conversion-focused-links',
    BRANDING: 'brand-building-links',
    SOCIAL: 'social-sharing-links'
  },

  BY_STRENGTH: {
    STRONG: 'high-value-links',
    MEDIUM: 'moderate-value-links',
    WEAK: 'low-value-links',
    HARMFUL: 'potentially-harmful-links'
  }
};

// Analysis thresholds and scoring
export const DETECTION_THRESHOLDS = {
  INTERNAL_LINK_RATIO: {
    OPTIMAL: { min: 0.7, max: 0.9 },
    ACCEPTABLE: { min: 0.5, max: 0.95 },
    WARNING: { min: 0.3, max: 0.97 }
  },

  ANCHOR_TEXT_DISTRIBUTION: {
    EXACT_MATCH: { max: 0.15, warning: 0.1 },
    BRANDED: { min: 0.1, optimal: 0.3 },
    GENERIC: { max: 0.2, warning: 0.15 },
    LONG_TAIL: { min: 0.2, optimal: 0.4 }
  },

  LINK_QUALITY_SCORES: {
    EXCELLENT: { min: 90 },
    GOOD: { min: 70 },
    FAIR: { min: 50 },
    POOR: { max: 49 }
  },

  BROKEN_LINK_TOLERANCE: {
    ACCEPTABLE: { max: 0.02 }, // Max 2% broken links
    WARNING: { max: 0.05 },    // Warning at 5%
    CRITICAL: { min: 0.1 }     // Critical at 10%+
  }
};
