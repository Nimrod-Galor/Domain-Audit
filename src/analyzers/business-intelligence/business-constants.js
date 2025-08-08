/**
 * ============================================================================
 * BUSINESS INTELLIGENCE CONSTANTS MODULE
 * ============================================================================
 *
 * Centralized constants and standards for business intelligence analysis
 * including scoring thresholds, validation rules, and industry standards.
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

// Scoring Thresholds
export const SCORING_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  FAIR: 70,
  POOR: 60,
  FAILING: 0,
};

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
};

// Business Intelligence Weights
export const BUSINESS_INTELLIGENCE_WEIGHTS = {
  TRUST_SIGNALS: 0.25,
  CONTACT_INFORMATION: 0.20,
  ABOUT_PAGE_QUALITY: 0.15,
  CUSTOMER_SUPPORT: 0.15,
  BUSINESS_CREDIBILITY: 0.15,
  LOCATION_DATA: 0.10,
};

// Trust Signal Standards
export const TRUST_SIGNAL_STANDARDS = {
  MINIMUM_CERTIFICATIONS: 3,
  MINIMUM_TESTIMONIALS: 5,
  MINIMUM_TRUST_BADGES: 2,
  SSL_REQUIRED: true,
  PRIVACY_POLICY_REQUIRED: true,
};

// Contact Information Standards
export const CONTACT_STANDARDS = {
  MINIMUM_CONTACT_METHODS: 3,
  PHONE_REQUIRED: true,
  EMAIL_REQUIRED: true,
  FORM_REQUIRED: true,
  RESPONSE_TIME_MENTION: true,
};

// About Page Standards
export const ABOUT_PAGE_STANDARDS = {
  MINIMUM_WORD_COUNT: 300,
  TEAM_SECTION_REQUIRED: true,
  COMPANY_STORY_REQUIRED: true,
  MISSION_STATEMENT_REQUIRED: true,
  MINIMUM_TEAM_MEMBERS: 3,
};

// Support Standards
export const SUPPORT_STANDARDS = {
  FAQ_REQUIRED: true,
  LIVE_CHAT_RECOMMENDED: true,
  DOCUMENTATION_REQUIRED: true,
  MULTIPLE_CHANNELS_REQUIRED: true,
  MINIMUM_FAQ_QUESTIONS: 10,
};

// Location Standards
export const LOCATION_STANDARDS = {
  PHYSICAL_ADDRESS_REQUIRED: true,
  BUSINESS_HOURS_REQUIRED: true,
  SERVICE_AREAS_REQUIRED: true,
  STRUCTURED_DATA_RECOMMENDED: true,
};

// Business Type Classifications
export const BUSINESS_TYPES = {
  LOCAL: 'local',
  REGIONAL: 'regional',
  NATIONAL: 'national',
  INTERNATIONAL: 'international',
  BRICK_AND_MORTAR: 'brick-and-mortar',
  ONLINE_ONLY: 'online-only',
  MULTI_LOCATION: 'multi-location',
  CHAIN: 'chain',
  FRANCHISE: 'franchise',
  SERVICE_BASED: 'service-based',
  PRODUCT_BASED: 'product-based',
  ECOMMERCE: 'ecommerce',
  B2B: 'b2b',
  B2C: 'b2c',
};

// Industry Categories
export const INDUSTRY_CATEGORIES = {
  TECHNOLOGY: 'technology',
  HEALTHCARE: 'healthcare',
  FINANCE: 'finance',
  RETAIL: 'retail',
  EDUCATION: 'education',
  MANUFACTURING: 'manufacturing',
  CONSTRUCTION: 'construction',
  AUTOMOTIVE: 'automotive',
  REAL_ESTATE: 'real-estate',
  HOSPITALITY: 'hospitality',
  LEGAL: 'legal',
  CONSULTING: 'consulting',
  MARKETING: 'marketing',
  NONPROFIT: 'nonprofit',
  GOVERNMENT: 'government',
};

// Trust Badge Types
export const TRUST_BADGE_TYPES = {
  SSL_CERTIFICATES: ['ssl', 'secure', 'https', 'encrypted'],
  SECURITY_BADGES: ['mcafee', 'norton', 'verisign', 'comodo', 'thawte'],
  CERTIFICATIONS: ['iso', 'pci', 'gdpr', 'hipaa', 'soc'],
  AWARDS: ['award', 'winner', 'recognition', 'best-of', 'excellence'],
  MEMBERSHIPS: ['member', 'accredited', 'certified', 'licensed', 'authorized'],
  GOOGLE_BADGES: ['google-certified', 'google-partner', 'google-premier'],
  SOCIAL_PROOF: ['bbb', 'trustpilot', 'yelp', 'facebook-verified'],
};

// Contact Method Types
export const CONTACT_METHODS = {
  PHONE: 'phone',
  EMAIL: 'email',
  CONTACT_FORM: 'contact_form',
  LIVE_CHAT: 'live_chat',
  SOCIAL_MEDIA: 'social_media',
  PHYSICAL_ADDRESS: 'physical_address',
  APPOINTMENT_BOOKING: 'appointment_booking',
  TICKETING_SYSTEM: 'ticketing_system',
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  PINTEREST: 'pinterest',
  WHATSAPP: 'whatsapp',
  TELEGRAM: 'telegram',
};

// Support Channel Types
export const SUPPORT_CHANNELS = {
  LIVE_CHAT: 'live_chat',
  PHONE_SUPPORT: 'phone_support',
  EMAIL_SUPPORT: 'email_support',
  TICKET_SYSTEM: 'ticket_system',
  FAQ: 'faq',
  KNOWLEDGE_BASE: 'knowledge_base',
  DOCUMENTATION: 'documentation',
  VIDEO_TUTORIALS: 'video_tutorials',
  COMMUNITY_FORUM: 'community_forum',
};

// Response Time Standards
export const RESPONSE_TIME_STANDARDS = {
  IMMEDIATE: 0, // Real-time/instant
  WITHIN_HOUR: 1,
  WITHIN_2_HOURS: 2,
  WITHIN_4_HOURS: 4,
  SAME_DAY: 24,
  NEXT_BUSINESS_DAY: 48,
  WITHIN_WEEK: 168,
};

// Geographic Coverage Levels
export const COVERAGE_LEVELS = {
  LOCAL: 'local',
  CITYWIDE: 'citywide',
  REGIONAL: 'regional',
  STATEWIDE: 'statewide',
  NATIONWIDE: 'nationwide',
  INTERNATIONAL: 'international',
};

// Structured Data Types
export const STRUCTURED_DATA_TYPES = {
  LOCAL_BUSINESS: 'LocalBusiness',
  ORGANIZATION: 'Organization',
  POSTAL_ADDRESS: 'PostalAddress',
  CONTACT_POINT: 'ContactPoint',
  OPENING_HOURS: 'OpeningHoursSpecification',
  GEO_COORDINATES: 'GeoCoordinates',
  PLACE: 'Place',
  SERVICE_AREA: 'ServiceArea',
};

// Quality Assessment Criteria
export const QUALITY_CRITERIA = {
  CONTENT_DEPTH: {
    SHALLOW: { min: 0, max: 100 },
    MODERATE: { min: 100, max: 300 },
    GOOD: { min: 300, max: 600 },
    COMPREHENSIVE: { min: 600, max: Infinity },
  },
  READABILITY: {
    POOR: { min: 0, max: 40 },
    FAIR: { min: 40, max: 60 },
    GOOD: { min: 60, max: 80 },
    EXCELLENT: { min: 80, max: 100 },
  },
  ENGAGEMENT: {
    LOW: { min: 0, max: 30 },
    MODERATE: { min: 30, max: 60 },
    HIGH: { min: 60, max: 85 },
    EXCEPTIONAL: { min: 85, max: 100 },
  },
};

// Professional Credentials
export const PROFESSIONAL_CREDENTIALS = {
  MEDICAL: ['md', 'do', 'rn', 'np', 'pa', 'dds', 'dvm'],
  LEGAL: ['jd', 'llm', 'esq'],
  BUSINESS: ['mba', 'cpa', 'cfa', 'pmp', 'cma'],
  TECHNOLOGY: ['cissp', 'cisa', 'cism', 'ccna', 'aws'],
  ENGINEERING: ['pe', 'fe', 'eit'],
  EDUCATION: ['phd', 'edd', 'med', 'ms', 'ma'],
};

// Contact Form Quality Indicators
export const FORM_QUALITY_INDICATORS = {
  REQUIRED_FIELDS: ['name', 'email', 'message'],
  OPTIONAL_FIELDS: ['phone', 'company', 'subject', 'budget'],
  VALIDATION_FEATURES: ['required_validation', 'email_validation', 'spam_protection'],
  USER_EXPERIENCE: ['clear_labels', 'error_messages', 'success_confirmation'],
};

// Business Hours Patterns
export const BUSINESS_HOURS_PATTERNS = {
  STANDARD: { start: 9, end: 17 }, // 9 AM - 5 PM
  EXTENDED: { start: 8, end: 20 }, // 8 AM - 8 PM
  RETAIL: { start: 10, end: 21 }, // 10 AM - 9 PM
  RESTAURANT: { start: 11, end: 22 }, // 11 AM - 10 PM
  TWENTY_FOUR_SEVEN: { start: 0, end: 24 }, // 24/7
};

// Local SEO Keywords
export const LOCAL_SEO_KEYWORDS = [
  'near me',
  'local',
  'nearby',
  'in your area',
  'close to you',
  'around here',
  'in [city]',
  'serving [area]',
];

// Trust Signal Keywords
export const TRUST_KEYWORDS = {
  SECURITY: ['secure', 'safe', 'protected', 'encrypted', 'verified'],
  RELIABILITY: ['trusted', 'reliable', 'dependable', 'established', 'proven'],
  QUALITY: ['certified', 'accredited', 'licensed', 'qualified', 'professional'],
  EXPERIENCE: ['experienced', 'expert', 'specialist', 'years of experience'],
  GUARANTEES: ['guarantee', 'warranty', 'money-back', 'satisfaction'],
};

// Common Business Validation Rules
export const VALIDATION_RULES = {
  PHONE: {
    US: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    INTERNATIONAL: /^\+?[1-9]\d{1,14}$/,
  },
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  ZIP_CODE: {
    US: /^\d{5}(-\d{4})?$/,
    CANADA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
  },
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
};

// Performance Benchmarks
export const PERFORMANCE_BENCHMARKS = {
  ANALYSIS_TIME: {
    TARGET: 2000, // 2 seconds
    WARNING: 5000, // 5 seconds
    CRITICAL: 10000, // 10 seconds
  },
  MEMORY_USAGE: {
    TARGET: 50 * 1024 * 1024, // 50 MB
    WARNING: 100 * 1024 * 1024, // 100 MB
    CRITICAL: 200 * 1024 * 1024, // 200 MB
  },
  ACCURACY: {
    TARGET: 0.95, // 95%
    WARNING: 0.90, // 90%
    CRITICAL: 0.85, // 85%
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_DOCUMENT: 'Invalid or missing document object',
  INVALID_URL: 'Invalid URL provided',
  ANALYSIS_TIMEOUT: 'Analysis timed out',
  INSUFFICIENT_DATA: 'Insufficient data for analysis',
  NETWORK_ERROR: 'Network error during analysis',
  PARSING_ERROR: 'Error parsing document content',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ANALYSIS_COMPLETE: 'Business intelligence analysis completed successfully',
  HIGH_SCORE: 'Excellent business intelligence implementation',
  GOOD_SCORE: 'Good business intelligence foundation',
  IMPROVEMENT_NEEDED: 'Business intelligence needs improvement',
};

// Default Configuration
export const DEFAULT_CONFIG = {
  enableAllAnalyzers: true,
  includeRecommendations: true,
  generateReport: true,
  detailedScoring: true,
  performanceMonitoring: true,
  errorHandling: true,
  timeoutMs: 30000, // 30 seconds
  maxRetries: 3,
};

// Export utility functions
export const BusinessIntelligenceUtils = {
  /**
   * Get grade based on score
   */
  getGrade(score) {
    if (score >= GRADE_THRESHOLDS.A) return 'A';
    if (score >= GRADE_THRESHOLDS.B) return 'B';
    if (score >= GRADE_THRESHOLDS.C) return 'C';
    if (score >= GRADE_THRESHOLDS.D) return 'D';
    return 'F';
  },

  /**
   * Get quality level based on score
   */
  getQualityLevel(score) {
    if (score >= SCORING_THRESHOLDS.EXCELLENT) return 'excellent';
    if (score >= SCORING_THRESHOLDS.GOOD) return 'good';
    if (score >= SCORING_THRESHOLDS.FAIR) return 'fair';
    if (score >= SCORING_THRESHOLDS.POOR) return 'poor';
    return 'failing';
  },

  /**
   * Calculate weighted score
   */
  calculateWeightedScore(scores, weights = BUSINESS_INTELLIGENCE_WEIGHTS) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      const categoryKey = category.toLowerCase().replace(/_/g, '');
      if (scores[categoryKey] !== undefined) {
        totalScore += scores[categoryKey] * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  },

  /**
   * Validate email address
   */
  isValidEmail(email) {
    return VALIDATION_RULES.EMAIL.test(email);
  },

  /**
   * Validate phone number
   */
  isValidPhone(phone, country = 'US') {
    const pattern = VALIDATION_RULES.PHONE[country] || VALIDATION_RULES.PHONE.US;
    return pattern.test(phone);
  },

  /**
   * Validate URL
   */
  isValidURL(url) {
    return VALIDATION_RULES.URL.test(url);
  },

  /**
   * Get business type classification
   */
  classifyBusinessType(indicators) {
    if (indicators.hasMultipleLocations && indicators.isChain) {
      return BUSINESS_TYPES.CHAIN;
    }
    if (indicators.hasMultipleLocations) {
      return BUSINESS_TYPES.MULTI_LOCATION;
    }
    if (indicators.isNational) {
      return BUSINESS_TYPES.NATIONAL;
    }
    if (indicators.isRegional) {
      return BUSINESS_TYPES.REGIONAL;
    }
    if (indicators.hasPhysicalLocation) {
      return BUSINESS_TYPES.BRICK_AND_MORTAR;
    }
    if (indicators.isLocal) {
      return BUSINESS_TYPES.LOCAL;
    }
    return BUSINESS_TYPES.ONLINE_ONLY;
  },

  /**
   * Assess content depth
   */
  assessContentDepth(wordCount) {
    const criteria = QUALITY_CRITERIA.CONTENT_DEPTH;
    
    if (wordCount >= criteria.COMPREHENSIVE.min) return 'comprehensive';
    if (wordCount >= criteria.GOOD.min) return 'good';
    if (wordCount >= criteria.MODERATE.min) return 'moderate';
    return 'shallow';
  },

  /**
   * Generate improvement priority
   */
  getImprovementPriority(score, category) {
    if (score < SCORING_THRESHOLDS.POOR) return 'critical';
    if (score < SCORING_THRESHOLDS.FAIR) return 'high';
    if (score < SCORING_THRESHOLDS.GOOD) return 'medium';
    return 'low';
  },
};
