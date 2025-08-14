/**
 * ============================================================================
 * UX CONVERSION ANALYSIS - STANDARDS & CONFIGURATION
 * ============================================================================
 * 
 * Industry standards, configuration values, and adaptive weights for UX analysis.
 * Based on conversion optimization research and accessibility guidelines.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis
 */

// Core UX standards based on research and best practices
export const UX_STANDARDS = {
  // Form optimization standards (research-backed)
  forms: {
    optimalFieldCount: { min: 3, max: 7, target: 5 },
    requiredFieldThreshold: 3,
    minimumLabelCoverage: 0.9, // 90% of fields should have labels
    mobileTargetSize: { width: 44, height: 44 }, // Apple HIG guidelines
    autoCompleteRecommended: ["name", "email", "phone", "address", "organization"],
    maxFieldsAboveFold: 5,
    recommendedFieldTypes: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[1-9][\d]{0,15}$/,
      url: /^https?:\/\/.+/
    }
  },

  // CTA effectiveness standards
  ctas: {
    minimumContrastRatio: 4.5, // WCAG AA standard
    recommendedContrastRatio: 7.0, // WCAG AAA standard
    recommendedSize: { width: 44, height: 44 },
    maxPrimaryPerPage: 3,
    actionVerbRequired: true,
    aboveFoldRecommended: true,
    minimumPadding: 12, // pixels
    recommendedColors: {
      primary: ['#007cba', '#0073aa', '#005a87'],
      secondary: ['#666666', '#999999'],
      success: ['#46b450', '#00a32a'],
      warning: ['#ffb900', '#f56e28'],
      danger: ['#dc3232', '#b32d2e']
    }
  },

  // Site search standards
  siteSearch: {
    recommendedPlacement: ["header", "navigation", "top"],
    minimumInputWidth: 200,
    recommendedInputWidth: 300,
    suggestionsRecommended: true,
    resultsPageRequired: true,
    maxResponseTime: 3000, // milliseconds
    autocompleteRecommended: true,
    placeholderTextRecommended: true,
    minimumVisibility: 0.8 // 80% visible
  },

  // Error page standards
  errorPages: {
    customPageRequired: true,
    brandingConsistent: true,
    navigationRequired: true,
    searchFunctionality: true,
    helpfulContentRequired: true,
    contactInfoRecommended: true,
    breadcrumbsRecommended: true,
    relatedContentRecommended: true
  },

  // User journey standards
  userJourney: {
    maxClicksToConversion: 3,
    maxPageLoadTime: 3000, // milliseconds
    breadcrumbsRecommended: true,
    clearNavigationRequired: true,
    progressIndicatorsRecommended: true,
    backButtonFunctional: true
  },

  // Accessibility standards (WCAG compliance)
  accessibility: {
    minimumContrastRatio: 4.5, // WCAG AA
    recommendedContrastRatio: 7.0, // WCAG AAA
    minimumTouchTarget: 44, // pixels
    maximumResponseTime: 5000, // milliseconds
    keyboardNavigationRequired: true,
    altTextRequired: true,
    focusIndicatorsRequired: true
  },

  // Mobile optimization standards
  mobile: {
    minimumTouchTarget: 44, // pixels
    recommendedTouchTarget: 48, // pixels
    maximumTapTargetSpacing: 8, // pixels between targets
    viewportMetaRequired: true,
    responsiveDesignRequired: true,
    fastLoadingRequired: true // < 3 seconds
  }
};

// Industry-specific weight adjustments
export const INDUSTRY_WEIGHTS = {
  ecommerce: {
    siteSearch: 20,
    forms: 15,
    ctas: 25,
    userJourney: 20,
    errorPages: 10,
    leadGeneration: 5,
    newsletter: 5
  },
  saas: {
    siteSearch: 15,
    forms: 25, // Higher for signup forms
    ctas: 20,
    userJourney: 25,
    errorPages: 5,
    leadGeneration: 10,
    newsletter: 0
  },
  content: {
    siteSearch: 25, // Critical for content discovery
    forms: 10,
    ctas: 15,
    userJourney: 20,
    errorPages: 15,
    leadGeneration: 10,
    newsletter: 5
  },
  portfolio: {
    siteSearch: 10,
    forms: 20, // Contact forms important
    ctas: 25, // Portfolio CTAs critical
    userJourney: 25,
    errorPages: 5,
    leadGeneration: 15,
    newsletter: 0
  },
  nonprofit: {
    siteSearch: 15,
    forms: 20, // Donation/volunteer forms
    ctas: 25, // Donation CTAs
    userJourney: 20,
    errorPages: 10,
    leadGeneration: 5,
    newsletter: 5
  },
  government: {
    siteSearch: 30, // Critical for government sites
    forms: 25, // Many government forms
    ctas: 10,
    userJourney: 20,
    errorPages: 10,
    leadGeneration: 0,
    newsletter: 5
  },
  healthcare: {
    siteSearch: 20,
    forms: 25, // Patient forms, appointments
    ctas: 15,
    userJourney: 25,
    errorPages: 10,
    leadGeneration: 5,
    newsletter: 0
  },
  education: {
    siteSearch: 25,
    forms: 20, // Application forms
    ctas: 15,
    userJourney: 25,
    errorPages: 10,
    leadGeneration: 5,
    newsletter: 0
  },
  default: {
    siteSearch: 15,
    forms: 20,
    ctas: 20,
    userJourney: 25,
    errorPages: 10,
    leadGeneration: 5,
    newsletter: 5
  }
};

// Feature importance by industry
export const FEATURE_IMPORTANCE = {
  ecommerce: {
    productSearch: 'critical',
    checkoutFlow: 'critical',
    productCTAs: 'critical',
    customerSupport: 'high',
    userReviews: 'high'
  },
  saas: {
    trialSignup: 'critical',
    featureDiscovery: 'critical',
    onboarding: 'critical',
    documentation: 'high',
    support: 'high'
  },
  content: {
    contentDiscovery: 'critical',
    readability: 'critical',
    socialSharing: 'high',
    relatedContent: 'high',
    search: 'critical'
  }
};

// Conversion benchmarks by industry
export const CONVERSION_BENCHMARKS = {
  ecommerce: {
    averageConversionRate: 2.86,
    excellentConversionRate: 5.31,
    cartAbandonmentRate: 69.57,
    mobileConversionRate: 1.53
  },
  saas: {
    averageConversionRate: 7.0,
    excellentConversionRate: 15.0,
    trialToPayingRate: 15.0,
    freemiumToPayingRate: 2.0
  },
  leadGeneration: {
    averageConversionRate: 4.02,
    excellentConversionRate: 11.45,
    landingPageRate: 9.7,
    emailSignupRate: 1.95
  }
};

// UX scoring thresholds
export const SCORING_THRESHOLDS = {
  excellent: { min: 90, max: 100 },
  good: { min: 75, max: 89 },
  fair: { min: 60, max: 74 },
  poor: { min: 40, max: 59 },
  critical: { min: 0, max: 39 }
};

// Action word patterns for CTA detection
export const CTA_ACTION_PATTERNS = {
  primary: [
    'get started', 'start free', 'try free', 'sign up', 'register',
    'join now', 'get access', 'download', 'install', 'buy now',
    'purchase', 'order now', 'add to cart', 'checkout', 'subscribe'
  ],
  secondary: [
    'learn more', 'read more', 'discover', 'explore', 'view',
    'see details', 'find out', 'contact us', 'get info',
    'request demo', 'schedule call', 'book appointment'
  ],
  navigation: [
    'home', 'about', 'services', 'products', 'contact',
    'blog', 'news', 'support', 'help', 'faq'
  ]
};

// Form field patterns for detection
export const FORM_FIELD_PATTERNS = {
  email: {
    names: ['email', 'e-mail', 'mail', 'user-email', 'your-email'],
    types: ['email'],
    patterns: [/email/i, /mail/i]
  },
  name: {
    names: ['name', 'full-name', 'fullname', 'first-name', 'last-name', 'surname'],
    types: ['text'],
    patterns: [/name/i, /nom/i]
  },
  phone: {
    names: ['phone', 'telephone', 'mobile', 'cell', 'tel'],
    types: ['tel', 'phone'],
    patterns: [/phone/i, /tel/i, /mobile/i]
  },
  message: {
    names: ['message', 'comment', 'comments', 'description', 'details'],
    types: ['textarea'],
    patterns: [/message/i, /comment/i, /description/i]
  }
};

// Search element selectors
export const SEARCH_SELECTORS = [
  'input[type="search"]',
  'form[role="search"]',
  '.search-form',
  '.search-box',
  '.search-container',
  '#search',
  '[data-search]',
  'input[name*="search"]',
  'input[placeholder*="search" i]',
  'input[aria-label*="search" i]'
];

// Error page indicators
export const ERROR_PAGE_INDICATORS = {
  titles: ['404', 'not found', 'page not found', 'error', 'oops'],
  headings: ['404', 'not found', 'page not found', 'error'],
  urls: ['/404', '/error', '/not-found', '/page-not-found'],
  statusCodes: [404, 403, 500, 502, 503]
};

// Configuration factory
export class UXConfigurationFactory {
  /**
   * Create configuration for specific industry
   * @param {string} industry - Industry type
   * @param {Object} customOptions - Custom configuration options
   * @returns {Object} Complete configuration
   */
  static createConfiguration(industry = 'default', customOptions = {}) {
    const baseConfig = {
      industry,
      standards: UX_STANDARDS,
      weights: INDUSTRY_WEIGHTS[industry] || INDUSTRY_WEIGHTS.default,
      benchmarks: CONVERSION_BENCHMARKS[industry] || {},
      featureImportance: FEATURE_IMPORTANCE[industry] || {},
      
      // Analysis settings
      timeout: 30000,
      enableAI: false,
      enableScreenshots: true,
      enableDetailedLogging: false,
      
      // Feature flags
      features: {
        siteSearch: true,
        errorPages: true,
        forms: true,
        ctas: true,
        userJourney: true,
        leadGeneration: true,
        newsletter: true
      },
      
      // Performance settings
      maxElementsToAnalyze: 1000,
      screenshotQuality: 80,
      analysisDepth: 'standard', // 'basic', 'standard', 'comprehensive'
      
      // Scoring configuration
      scoringThresholds: SCORING_THRESHOLDS,
      minimumConfidence: 0.5,
      weightAdjustments: {}
    };

    // Apply custom options
    return this._mergeConfigurations(baseConfig, customOptions);
  }

  /**
   * Merge configurations deeply
   * @private
   */
  static _mergeConfigurations(base, custom) {
    const result = { ...base };
    
    Object.keys(custom).forEach(key => {
      if (custom[key] && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = { ...result[key], ...custom[key] };
      } else {
        result[key] = custom[key];
      }
    });
    
    return result;
  }

  /**
   * Get industry-specific recommendations
   * @param {string} industry - Industry type
   * @returns {Object} Industry-specific recommendations
   */
  static getIndustryRecommendations(industry) {
    const recommendations = {
      ecommerce: {
        priorities: ['Product search', 'Checkout optimization', 'Trust signals'],
        focusAreas: ['Conversion funnel', 'Mobile experience', 'Page speed'],
        keyMetrics: ['Conversion rate', 'Cart abandonment', 'Average order value']
      },
      saas: {
        priorities: ['Trial signup', 'Feature discovery', 'Onboarding flow'],
        focusAreas: ['User activation', 'Feature adoption', 'Churn reduction'],
        keyMetrics: ['Trial conversion', 'Time to value', 'Feature adoption']
      },
      content: {
        priorities: ['Content discovery', 'Reading experience', 'Social sharing'],
        focusAreas: ['Search functionality', 'Content organization', 'Engagement'],
        keyMetrics: ['Time on page', 'Bounce rate', 'Social shares']
      }
    };

    return recommendations[industry] || recommendations.default || {
      priorities: ['User experience', 'Conversion optimization', 'Accessibility'],
      focusAreas: ['Navigation', 'Forms', 'Call-to-actions'],
      keyMetrics: ['Conversion rate', 'User satisfaction', 'Task completion']
    };
  }
}

export default {
  UX_STANDARDS,
  INDUSTRY_WEIGHTS,
  FEATURE_IMPORTANCE,
  CONVERSION_BENCHMARKS,
  SCORING_THRESHOLDS,
  CTA_ACTION_PATTERNS,
  FORM_FIELD_PATTERNS,
  SEARCH_SELECTORS,
  ERROR_PAGE_INDICATORS,
  UXConfigurationFactory
};
