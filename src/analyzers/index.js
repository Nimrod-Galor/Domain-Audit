/**
 * Main Analyzer Module Index
 * 
 * Central export point for all analyzer modules organized by category.
 * This provides a clean, organized interface for importing analyzers.
 */

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

// Performance analyzers
export { ResourceAnalyzer } from './performance/index.js';

// SEO analyzers (placeholder for future migration)
export * as SEOAnalyzers from './seo/index.js';

// Accessibility analyzers (placeholder for future migration)
export * as AccessibilityAnalyzers from './accessibility/index.js';

// Security analyzers
export { SSLAnalyzer } from './security/index.js';

// Content analyzers
export { 
  ContentIntelligenceAnalyzer, 
  ContentQualityAnalyzer,
  SocialMediaAnalyzer
} from './content/index.js';

// Technical analyzers
export { CDNAnalyzer } from './technical/index.js';
export { TechnicalAnalyzer } from './technical-analyzer.js';

// Import classes for legacy compatibility
import { TechnicalAnalyzer } from './technical-analyzer.js';

// Link analyzers
export { 
  AdvancedLinkAnalyzer, 
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
