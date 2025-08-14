/**
 * ============================================================================
 * UX CONVERSION ANALYSIS - TYPE DEFINITIONS & CONTRACTS
 * ============================================================================
 * 
 * Comprehensive type definitions and interfaces for the UX Conversion Analysis module.
 * Following the Combined Approach pattern established in the analyzer modernization.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis
 */

/**
 * Main UX analysis result contract
 * @typedef {Object} UXAnalysisResult
 * @property {boolean} success - Analysis completion status
 * @property {number} analysisTime - Time taken in milliseconds
 * @property {number} overallScore - Overall UX score (0-100)
 * @property {UXCategoryResults} categories - Category-specific results
 * @property {Array<UXFinding>} findings - Detailed findings
 * @property {UXAIInsights} [aiInsights] - Optional AI enhancements
 * @property {UXMetadata} metadata - Analysis metadata
 * @property {string} timestamp - ISO timestamp of analysis
 * @property {string} url - Analyzed URL
 */

/**
 * Category-specific analysis results
 * @typedef {Object} UXCategoryResults
 * @property {CategoryResult} siteSearch - Site search analysis
 * @property {CategoryResult} errorPages - 404/error page analysis
 * @property {CategoryResult} userJourney - User journey analysis
 * @property {CategoryResult} forms - Form usability analysis
 * @property {CategoryResult} ctas - Call-to-action analysis
 * @property {CategoryResult} leadGeneration - Lead generation analysis
 * @property {CategoryResult} newsletter - Newsletter signup analysis
 */

/**
 * Individual category result
 * @typedef {Object} CategoryResult
 * @property {number} score - Category score (0-100)
 * @property {number} weight - Category weight in overall score
 * @property {boolean} analyzed - Whether category was analyzed
 * @property {Array<UXFinding>} findings - Category-specific findings
 * @property {Object} metrics - Raw metrics for this category
 * @property {Array<string>} recommendations - Prioritized recommendations
 * @property {number} confidence - Analysis confidence (0-1)
 * @property {string} status - Analysis status ('success', 'partial', 'failed')
 */

/**
 * Individual UX finding
 * @typedef {Object} UXFinding
 * @property {string} id - Unique finding identifier
 * @property {string} category - Category (search, forms, cta, etc.)
 * @property {'critical'|'high'|'medium'|'low'} severity - Finding severity
 * @property {string} title - Human-readable finding title
 * @property {string} description - Detailed finding description
 * @property {string} recommendation - Actionable recommendation
 * @property {Object} evidence - Supporting evidence (screenshots, etc.)
 * @property {number} confidence - Confidence score (0-1)
 * @property {ConversionImpact} [impact] - Estimated conversion impact
 * @property {Array<string>} tags - Classification tags
 * @property {Object} location - Element location data
 */

/**
 * Estimated conversion impact
 * @typedef {Object} ConversionImpact
 * @property {'low'|'medium'|'high'} level - Impact level
 * @property {number} [conversionLiftPercent] - Estimated conversion lift %
 * @property {number} [frictionReductionPercent] - Estimated friction reduction %
 * @property {string} [businessValue] - Business value description
 * @property {number} [confidenceScore] - Impact confidence (0-1)
 */

/**
 * AI-powered insights (optional enhancement)
 * @typedef {Object} UXAIInsights
 * @property {boolean} enabled - Whether AI analysis was performed
 * @property {Array<AIPattern>} patterns - AI-identified patterns
 * @property {ConversionPrediction} conversionPrediction - AI conversion prediction
 * @property {UserBehaviorInsights} userBehavior - AI user behavior analysis
 * @property {Array<AIRecommendation>} recommendations - AI-generated recommendations
 * @property {number} confidence - Overall AI confidence (0-1)
 * @property {string} model - AI model used for analysis
 * @property {Object} processingMetrics - AI processing performance
 */

/**
 * AI-identified pattern
 * @typedef {Object} AIPattern
 * @property {string} type - Pattern type identifier
 * @property {string} description - Human-readable pattern description
 * @property {number} strength - Pattern strength (0-1)
 * @property {Array<string>} affectedElements - Elements involved in pattern
 * @property {Object} evidence - Supporting evidence for pattern
 * @property {Array<string>} implications - Business implications
 */

/**
 * AI conversion prediction
 * @typedef {Object} ConversionPrediction
 * @property {number} currentRate - Estimated current conversion rate
 * @property {number} potentialRate - Predicted optimized conversion rate
 * @property {number} improvementPercent - Potential improvement percentage
 * @property {Array<PredictionFactor>} factors - Factors affecting conversion
 * @property {number} confidence - Prediction confidence (0-1)
 * @property {string} methodology - Prediction methodology used
 */

/**
 * Prediction factor
 * @typedef {Object} PredictionFactor
 * @property {string} factor - Factor name
 * @property {number} impact - Impact weight (0-1)
 * @property {string} direction - 'positive' or 'negative'
 * @property {string} recommendation - How to optimize this factor
 */

/**
 * User behavior insights
 * @typedef {Object} UserBehaviorInsights
 * @property {Object} journeyAnalysis - User journey patterns
 * @property {Object} interactionPatterns - Common interaction patterns
 * @property {Object} frictionPoints - Identified friction points
 * @property {Object} engagementMetrics - Engagement predictions
 * @property {Array<string>} optimizationOpportunities - Optimization suggestions
 */

/**
 * AI recommendation
 * @typedef {Object} AIRecommendation
 * @property {string} id - Unique recommendation ID
 * @property {'strategic'|'tactical'|'technical'} type - Recommendation type
 * @property {string} title - Recommendation title
 * @property {string} description - Detailed description
 * @property {number} priority - Priority score (0-1)
 * @property {number} expectedImpact - Expected impact (0-1)
 * @property {string} implementation - Implementation guidance
 * @property {Array<string>} dependencies - Implementation dependencies
 */

/**
 * Analysis metadata
 * @typedef {Object} UXMetadata
 * @property {string} analyzerVersion - UX analyzer version
 * @property {string} industryType - Industry classification
 * @property {Object} features - Enabled features for analysis
 * @property {Object} configuration - Analysis configuration used
 * @property {Object} performance - Performance metrics
 * @property {string} userAgent - Browser user agent
 * @property {Object} viewport - Viewport dimensions used
 */

/**
 * Search analysis results
 * @typedef {Object} SearchAnalysisResult
 * @property {boolean} found - Whether search functionality was found
 * @property {number} count - Number of search elements found
 * @property {Array<SearchElement>} elements - Detected search elements
 * @property {SearchFunctionality} functionality - Functionality test results
 * @property {SearchUsability} usability - Usability assessment
 * @property {Array<string>} recommendations - Search-specific recommendations
 */

/**
 * Search element
 * @typedef {Object} SearchElement
 * @property {string} selector - CSS selector for element
 * @property {string} type - Element type (input, form, etc.)
 * @property {Object} position - Element position and dimensions
 * @property {boolean} visible - Whether element is visible
 * @property {Object} styling - Element styling properties
 * @property {boolean} inHeader - Whether in header/navigation
 * @property {boolean} hasLabel - Whether has associated label
 * @property {string} placeholder - Placeholder text if any
 */

/**
 * Search functionality assessment
 * @typedef {Object} SearchFunctionality
 * @property {boolean} functional - Whether search actually works
 * @property {boolean} canType - Whether typing is possible
 * @property {boolean} canSubmit - Whether form can be submitted
 * @property {Object} results - Results page analysis
 * @property {number} responseTime - Search response time
 * @property {Array<string>} issues - Functionality issues found
 */

/**
 * Form analysis results
 * @typedef {Object} FormAnalysisResult
 * @property {boolean} found - Whether forms were found
 * @property {number} count - Number of forms found
 * @property {Array<FormElement>} forms - Detected forms
 * @property {FormUsability} usability - Overall form usability
 * @property {FormAccessibility} accessibility - Accessibility assessment
 * @property {Array<string>} recommendations - Form-specific recommendations
 */

/**
 * Form element
 * @typedef {Object} FormElement
 * @property {string} id - Form ID
 * @property {string} action - Form action URL
 * @property {string} method - Form method (GET/POST)
 * @property {Array<FormField>} fields - Form fields
 * @property {Object} submitButton - Submit button details
 * @property {Object} validation - Form validation assessment
 * @property {Object} accessibility - Accessibility features
 * @property {Object} position - Form position and dimensions
 */

/**
 * Form field
 * @typedef {Object} FormField
 * @property {string} type - Field type
 * @property {string} name - Field name
 * @property {boolean} required - Whether field is required
 * @property {string} label - Associated label text
 * @property {boolean} hasLabel - Whether field has a label
 * @property {Object} validation - Field validation rules
 * @property {Object} accessibility - Accessibility attributes
 * @property {Object} position - Field position and dimensions
 */

/**
 * CTA analysis results
 * @typedef {Object} CTAAnalysisResult
 * @property {boolean} found - Whether CTAs were found
 * @property {number} count - Number of CTAs found
 * @property {Array<CTAElement>} ctas - Detected CTAs
 * @property {CTAHierarchy} hierarchy - CTA hierarchy analysis
 * @property {CTAEffectiveness} effectiveness - Overall effectiveness
 * @property {Array<string>} recommendations - CTA-specific recommendations
 */

/**
 * CTA element
 * @typedef {Object} CTAElement
 * @property {string} text - CTA text content
 * @property {string} tagName - HTML tag name
 * @property {Object} position - Element position and dimensions
 * @property {Object} styling - Visual styling properties
 * @property {Object} accessibility - Accessibility attributes
 * @property {Object} context - Contextual information
 * @property {boolean} aboveFold - Whether CTA is above the fold
 * @property {number} contrastRatio - Color contrast ratio
 */

// Export constants for validation and scoring
export const UX_SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'];
export const UX_CATEGORIES = ['siteSearch', 'errorPages', 'userJourney', 'forms', 'ctas', 'leadGeneration', 'newsletter'];
export const UX_IMPACT_LEVELS = ['low', 'medium', 'high'];
export const UX_RECOMMENDATION_TYPES = ['strategic', 'tactical', 'technical'];

// Validation helpers
export const UXValidators = {
  /**
   * Validate UX analysis result structure
   * @param {Object} result - Analysis result to validate
   * @returns {boolean} Whether result is valid
   */
  validateAnalysisResult(result) {
    if (!result || typeof result !== 'object') return false;
    
    const requiredFields = ['success', 'analysisTime', 'overallScore', 'categories', 'findings', 'metadata', 'timestamp', 'url'];
    return requiredFields.every(field => result.hasOwnProperty(field));
  },

  /**
   * Validate UX finding structure
   * @param {Object} finding - Finding to validate
   * @returns {boolean} Whether finding is valid
   */
  validateFinding(finding) {
    if (!finding || typeof finding !== 'object') return false;
    
    const requiredFields = ['id', 'category', 'severity', 'title', 'description', 'recommendation', 'confidence'];
    const hasRequired = requiredFields.every(field => finding.hasOwnProperty(field));
    const validSeverity = UX_SEVERITY_LEVELS.includes(finding.severity);
    const validCategory = UX_CATEGORIES.includes(finding.category);
    
    return hasRequired && validSeverity && validCategory;
  },

  /**
   * Validate score range
   * @param {number} score - Score to validate
   * @returns {boolean} Whether score is valid
   */
  validateScore(score) {
    return typeof score === 'number' && score >= 0 && score <= 100;
  },

  /**
   * Validate confidence range
   * @param {number} confidence - Confidence to validate
   * @returns {boolean} Whether confidence is valid
   */
  validateConfidence(confidence) {
    return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
  }
};

// Default configuration values
export const UX_DEFAULTS = {
  TIMEOUT: 30000,
  MIN_CONFIDENCE: 0.5,
  DEFAULT_WEIGHTS: {
    siteSearch: 15,
    forms: 20,
    ctas: 20,
    userJourney: 25,
    errorPages: 10,
    leadGeneration: 5,
    newsletter: 5
  },
  SCORING: {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 40,
    CRITICAL: 20
  }
};

export default {
  UX_SEVERITY_LEVELS,
  UX_CATEGORIES,
  UX_IMPACT_LEVELS,
  UX_RECOMMENDATION_TYPES,
  UXValidators,
  UX_DEFAULTS
};
