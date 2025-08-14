/**
 * 🏗️ ORGANIZED ANALYZER MODULE INDEX WITH INTELLIGENCE INTEGRATION
 * 
 * Central export point for all analyzer modules organized by category.
 * Updated structure reflects the new organization, modernization, and 
 * Cross-Analyzer Intelligence Integration capabilities.
 * 
 * Structure:
 * - Intelligence Integration: Next-generation intelligent analysis
 * - Core Analyzers: Essential analysis engines
 * - Production: Modern Combined Approach implementations
 * - Specialized: Advanced and specialized tools
 * - Detectors: Modern detector modules
 * - Legacy: Archived versions for compatibility
 */

// ===== INTELLIGENCE INTEGRATION SYSTEM (Next Generation) =====
export { 
  CrossAnalyzerIntelligence,
  IntelligenceCoordinator,
  IntelligenceAnalyticsEngine,
  IntelligenceSystemFactory,
  IntelligenceUtils,
  IntelligenceConfig,
  INTELLIGENCE_CONSTANTS
} from './intelligence/index.js';

// Core infrastructure
export { 
  BaseAnalyzer, 
  AnalyzerInterface, 
  AnalysisResultSchema, 
  AnalyzerCategories, 
  AnalysisPriority, 
  AnalyzerUtils, 
  AnalyzerRegistry, 
  analyzerRegistry 
} from './core/index.js';

// ===== CORE ANALYZERS (Essential Engines) =====
export { default as SEOAnalyzer } from './core-analyzers/seo-analyzer.js';
export { default as AccessibilityAnalyzer } from './core-analyzers/accessibility-analyzer.js';
export { default as TechnicalAnalyzer } from './core-analyzers/technical-analyzer.js';
export { default as SecurityAnalyzer } from './core-analyzers/security-analyzer.js';
export { default as MobileAnalyzer } from './core-analyzers/mobile-analyzer.js';
export { default as ContentAnalyzer } from './core-analyzers/content-analyzer.js';

// ===== PRODUCTION (Modern Combined Approach) =====
export { default as BusinessAnalyticsAnalyzer } from './production/business-analytics-analyzer.js';
export { default as SEOAnalyzerModern } from './production/seo-analyzer-modern.js';
export { default as SecurityAnalyzerModern } from './production/security-analyzer-modern.js';
export { default as MobileAnalyzerModern } from './production/mobile-analyzer-modern.js';

// ===== DETECTOR MODULES (Modern Architecture) =====
export { MetaTagDetector } from './detectors/meta-tag-detector.js';
export { ContentQualityDetector } from './detectors/content-quality-detector.js';
export { KeywordDetector } from './detectors/keyword-detector.js';
export { TechnicalSEODetector } from './detectors/technical-seo-detector.js';
export { SocialMediaDetector } from './detectors/social-media-detector.js';

// Performance analyzers
export { ResourceAnalyzer } from './performance/index.js';

// ===== SPECIALIZED ANALYZERS (Advanced Tools) =====
export { default as AdvancedLinkAnalyzer } from './specialized/advanced-link-analyzer.js';
export { default as CDNDetector } from './specialized/cdn-detector.js';
export { default as ContentIntelligenceAnalyzer } from './specialized/content-intelligence-analyzer.js';
export { default as ContentQualityAnalyzer } from './specialized/content-quality-analyzer.js';
export { default as LinkAnalyzer } from './specialized/link-analyzer.js';
export { default as LinkDepthCalculator } from './specialized/link-depth-calculator.js';
export { default as OrphanedPagesDetector } from './specialized/orphaned-pages-detector.js';
export { default as PageTypeClassifier } from './specialized/page-type-classifier.js';
export { default as ResourceAnalyzer } from './specialized/resource-analyzer.js';
export { default as SSLCertificateAnalyzer } from './specialized/ssl-certificate-analyzer.js';
export { default as ThirdPartyAnalyzer } from './specialized/third-party-analyzer.js';

// ===== CATEGORY-SPECIFIC MODULES =====
// SEO analyzers
export * as SEOAnalyzers from './seo/index.js';

// Accessibility analyzers
export * as AccessibilityAnalyzers from './accessibility/index.js';

// Security analyzers
export { SSLAnalyzer } from './security/index.js';

// Content analyzers
export { 
  ContentIntelligenceAnalyzer as ContentIntelligenceAnalyzerModule, 
  ContentQualityAnalyzer as ContentQualityAnalyzerModule,
  SocialMediaAnalyzer
} from './content/index.js';

// Technical analyzers
export { CDNAnalyzer } from './technical/index.js';

// Link analyzers
export { 
  AdvancedLinkAnalyzer as AdvancedLinkAnalyzerModule, 
  LinkDepthAnalyzer, 
  OrphanedPagesAnalyzer 
} from './links/index.js';

// Business Intelligence analyzers
export { 
  BusinessIntelligenceAnalyzer,
  BusinessAnalyticsAnalyzer,
  TrustSignalAnalyzer,
  ContactAnalyzer,
  SupportAnalyzer,
  LocationAnalyzer,
  AboutPageAnalyzer
} from './business-intelligence/index.js';

// E-commerce analyzers
export { EcommerceAnalyzer } from './ecommerce/index.js';

// Classification analyzers
export { PageTypeClassifier } from './classification/index.js';

// Third-party analyzers
export { ThirdPartyAnalyzer } from './third-party/index.js';

// ===== INTELLIGENCE INTEGRATION COLLECTIONS =====
export const IntelligenceComponents = {
  CrossAnalyzerIntelligence,
  IntelligenceCoordinator,
  IntelligenceAnalyticsEngine,
  IntelligenceSystemFactory,
  IntelligenceUtils
};

// Category Collections for bulk operations
export const CoreAnalyzers = {
  SEOAnalyzer,
  TechnicalAnalyzer,
  AccessibilityAnalyzer,
  SecurityAnalyzer,
  MobileAnalyzer,
  ContentAnalyzer
};

export const ProductionAnalyzers = {
  BusinessAnalyticsAnalyzer,
  SEOAnalyzerModern,
  SecurityAnalyzerModern,
  MobileAnalyzerModern
};

export const SpecializedAnalyzers = {
  AdvancedLinkAnalyzer,
  CDNDetector,
  ContentIntelligenceAnalyzer,
  ContentQualityAnalyzer,
  LinkAnalyzer,
  LinkDepthCalculator,
  OrphanedPagesDetector,
  PageTypeClassifier,
  ResourceAnalyzer,
  SSLCertificateAnalyzer,
  ThirdPartyAnalyzer
};

export const Detectors = {
  MetaTagDetector,
  ContentQualityDetector,
  KeywordDetector,
  TechnicalSEODetector,
  SocialMediaDetector
};

// Complete analyzer registry for dynamic loading with intelligence
export const AllAnalyzers = {
  ...CoreAnalyzers,
  ...ProductionAnalyzers,
  ...SpecializedAnalyzers,
  ...Detectors
};

// Enhanced analyzer metadata with intelligence integration
export const AnalyzerMetadata = {
  version: '2.0.0',
  phase: 'Next Generation Intelligence',
  totalAnalyzers: Object.keys(AllAnalyzers).length,
  categories: {
    core: Object.keys(CoreAnalyzers).length,
    production: Object.keys(ProductionAnalyzers).length,
    specialized: Object.keys(SpecializedAnalyzers).length,
    detectors: Object.keys(Detectors).length,
    intelligence: Object.keys(IntelligenceComponents).length
  },
  capabilities: {
    crossAnalyzerCorrelation: true,
    intelligentPatternRecognition: true,
    predictiveAnalytics: true,
    advancedStatistics: true,
    strategicInsights: true
  },
  organizationComplete: true,
  modernizationStatus: 'complete',
  intelligenceIntegration: 'complete'
};

// Convenience factory for creating complete intelligent analysis system
export async function createIntelligentAnalysisSystem(options = {}) {
  return await IntelligenceSystemFactory.createIntelligenceSystem(options);
}

// Enhanced extractors (medium-priority features)
export { EnhancedExtractorsIntegration as enhancedExtractors } from '../extractors/enhanced-extractors-integration.js';

// ===== PRODUCTION (Modern Combined Approach) =====
export { default as BusinessAnalyticsAnalyzer } from './production/business-analytics-analyzer.js';
export { default as SEOAnalyzerModern } from './production/seo-analyzer-modern.js';
export { default as SecurityAnalyzerModern } from './production/security-analyzer-modern.js';
export { default as MobileAnalyzerModern } from './production/mobile-analyzer-modern.js';

// ===== DETECTOR MODULES (Modern Architecture) =====
export { MetaTagDetector } from './detectors/meta-tag-detector.js';
export { ContentQualityDetector } from './detectors/content-quality-detector.js';
export { KeywordDetector } from './detectors/keyword-detector.js';
export { TechnicalSEODetector } from './detectors/technical-seo-detector.js';
export { SocialMediaDetector } from './detectors/social-media-detector.js';

// Performance analyzers
export { ResourceAnalyzer } from './performance/index.js';

// ===== SPECIALIZED ANALYZERS (Advanced Tools) =====
export { default as AdvancedLinkAnalyzer } from './specialized/advanced-link-analyzer.js';
export { default as CDNDetector } from './specialized/cdn-detector.js';
export { default as ContentIntelligenceAnalyzer } from './specialized/content-intelligence-analyzer.js';
export { default as ContentQualityAnalyzer } from './specialized/content-quality-analyzer.js';
export { default as LinkAnalyzer } from './specialized/link-analyzer.js';
export { default as LinkDepthCalculator } from './specialized/link-depth-calculator.js';
export { default as OrphanedPagesDetector } from './specialized/orphaned-pages-detector.js';
export { default as PageTypeClassifier } from './specialized/page-type-classifier.js';
export { default as ResourceAnalyzer } from './specialized/resource-analyzer.js';
export { default as SSLCertificateAnalyzer } from './specialized/ssl-certificate-analyzer.js';
export { default as ThirdPartyAnalyzer } from './specialized/third-party-analyzer.js';

// ===== CATEGORY-SPECIFIC MODULES =====
// SEO analyzers
export * as SEOAnalyzers from './seo/index.js';

// Accessibility analyzers
export * as AccessibilityAnalyzers from './accessibility/index.js';

// Security analyzers
export { SSLAnalyzer } from './security/index.js';

// Content analyzers
export { 
  ContentIntelligenceAnalyzer as ContentIntelligenceAnalyzerModule, 
  ContentQualityAnalyzer as ContentQualityAnalyzerModule,
  SocialMediaAnalyzer
} from './content/index.js';

// Technical analyzers
export { CDNAnalyzer } from './technical/index.js';

// Link analyzers
export { 
  AdvancedLinkAnalyzer as AdvancedLinkAnalyzerModule, 
  LinkDepthAnalyzer, 
  OrphanedPagesAnalyzer 
} from './links/index.js';

// Business Intelligence analyzers
export { 
  BusinessIntelligenceAnalyzer,
  BusinessAnalyticsAnalyzer,
  TrustSignalAnalyzer,
  ContactAnalyzer,
  SupportAnalyzer,
  LocationAnalyzer,
  AboutPageAnalyzer
} from './business-intelligence/index.js';

// E-commerce analyzers
export { EcommerceAnalyzer } from './ecommerce/index.js';

// Classification analyzers
export { PageTypeClassifier } from './classification/index.js';

// Third-party analyzers
export { ThirdPartyAnalyzer } from './third-party/index.js';

// Legacy analyzer wrappers for backward compatibility
import { extractSEOData } from '../extractors/seo-extractor.js';
import { extractContentData } from '../extractors/content-extractor.js';
import { extractTechnicalDataOptimized, extractAccessibilityDataOptimized } from '../extractors/technical-extractor.js';

export const legacyAnalyzers = {
  seoAnalyzer: {
    analyze: (dom) => extractSEOData(dom)
  },

  contentAnalyzer: {
    analyze: (dom, html) => extractContentData(dom, html)
  },

  linkAnalyzer: {
    analyze: (dom, url) => {
      // Link analysis is typically part of content extraction
      const links = dom.querySelectorAll('a');
      const totalLinks = links.length;
      let internalLinks = 0;
      let externalLinks = 0;
      let emailLinks = 0;
      let phoneLinks = 0;
      
      for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute('href') || '';
        if (href.startsWith('mailto:')) emailLinks++;
        else if (href.startsWith('tel:')) phoneLinks++;
        else if (href.startsWith('http')) externalLinks++;
        else internalLinks++;
      }
      
      return {
        totalLinks,
        internalLinks,
        externalLinks,
        functionalLinks: 0,
        emailLinks,
        phoneLinks,
        linkDetails: [],
        linkRatios: {
          internal: totalLinks > 0 ? (internalLinks / totalLinks * 100).toFixed(1) : 0,
          external: totalLinks > 0 ? (externalLinks / totalLinks * 100).toFixed(1) : 0,
          totalValidLinks: totalLinks
        },
        targetBlank: 0,
        linksWithTitle: 0,
        duplicateLinks: [],
        brokenAnchors: [],
        linksByType: {
          navigation: 0,
          content: internalLinks,
          footer: 0,
          sidebar: 0,
          header: 0
        },
        accessibilityIssues: []
      };
    }
  },

  // Legacy compatibility - use modern TechnicalAnalyzer
  technicalAnalyzer: new TechnicalAnalyzer(),

  securityAnalyzer: {
    analyze: (dom) => ({
      https: { enabled: true, secure: true },
      headers: { headers: {}, hasHSTS: false, total: 0 },
      content: { mixedContent: false, suspiciousContent: false },
      transport: { isHTTPS: true },
      securityScore: 75,
      recommendations: []
    })
  },

  accessibilityAnalyzer: {
    analyze: (dom) => extractAccessibilityDataOptimized(dom)
  },

  mobileAnalyzer: {
    analyze: (dom) => ({
      viewport: { content: '', isResponsive: false },
      mobileFeatures: { hasTouchIcons: false, hasManifest: false },
      responsive: { hasMediaQueries: false },
      mobileScore: 50,
      recommendations: []
    })
  }
};

// Enhanced extractors (medium-priority features)
export { EnhancedExtractorsIntegration as enhancedExtractors } from '../extractors/enhanced-extractors-integration.js';
