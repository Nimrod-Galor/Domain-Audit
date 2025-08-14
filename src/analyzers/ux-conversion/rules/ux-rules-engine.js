/**
 * ============================================================================
 * UX RULES ENGINE - INTELLIGENT DECISION SYSTEM
 * ============================================================================
 * 
 * Advanced rules engine that processes detector results and heuristics
 * to generate intelligent recommendations, priority scoring, and
 * actionable insights with industry-specific rule adaptation.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis - Days 5-7
 */

import { UXRecommendationUtils, UXScoringUtils } from '../utils/analysis-utils.js';
import { UX_STANDARDS } from '../config/ux-standards.js';

/**
 * Core UX Rules Categories
 */
export const RULE_CATEGORIES = {
  CRITICAL_ISSUES: {
    priority: 'critical',
    weight: 1.0,
    requiresImmediate: true
  },
  ACCESSIBILITY: {
    priority: 'high',
    weight: 0.9,
    requiresImmediate: true
  },
  CONVERSION_BLOCKERS: {
    priority: 'high',
    weight: 0.85,
    requiresImmediate: false
  },
  USABILITY_ISSUES: {
    priority: 'medium',
    weight: 0.7,
    requiresImmediate: false
  },
  PERFORMANCE_ISSUES: {
    priority: 'medium',
    weight: 0.6,
    requiresImmediate: false
  },
  ENHANCEMENT_OPPORTUNITIES: {
    priority: 'low',
    weight: 0.4,
    requiresImmediate: false
  }
};

/**
 * Industry-specific rule sets
 */
export const INDUSTRY_RULE_SETS = {
  ecommerce: {
    name: 'E-commerce',
    criticalPatterns: [
      'missing_search_functionality',
      'complex_checkout_process',
      'unclear_pricing',
      'missing_security_indicators',
      'poor_product_images'
    ],
    conversionFocus: [
      'cart_abandonment_prevention',
      'trust_signal_optimization',
      'product_discovery_enhancement',
      'checkout_flow_optimization'
    ],
    weights: {
      conversion: 0.4,
      trust: 0.3,
      usability: 0.2,
      performance: 0.1
    }
  },
  
  saas: {
    name: 'SaaS/Software',
    criticalPatterns: [
      'unclear_value_proposition',
      'complex_onboarding',
      'missing_trial_options',
      'poor_feature_discoverability'
    ],
    conversionFocus: [
      'trial_conversion_optimization',
      'feature_adoption_enhancement',
      'onboarding_simplification',
      'user_engagement_improvement'
    ],
    weights: {
      onboarding: 0.35,
      feature_discovery: 0.25,
      conversion: 0.25,
      performance: 0.15
    }
  },
  
  healthcare: {
    name: 'Healthcare',
    criticalPatterns: [
      'accessibility_violations',
      'unclear_medical_information',
      'complex_appointment_booking',
      'missing_privacy_indicators'
    ],
    conversionFocus: [
      'appointment_booking_optimization',
      'patient_information_clarity',
      'accessibility_compliance',
      'trust_building_enhancement'
    ],
    weights: {
      accessibility: 0.4,
      trust: 0.3,
      clarity: 0.2,
      usability: 0.1
    }
  },
  
  government: {
    name: 'Government',
    criticalPatterns: [
      'accessibility_violations',
      'complex_service_navigation',
      'unclear_process_steps',
      'poor_mobile_experience'
    ],
    conversionFocus: [
      'service_completion_optimization',
      'accessibility_compliance',
      'process_simplification',
      'mobile_optimization'
    ],
    weights: {
      accessibility: 0.5,
      clarity: 0.25,
      usability: 0.15,
      mobile: 0.1
    }
  }
};

/**
 * Core UX Rules Library
 */
export const UX_RULES_LIBRARY = {
  // Critical Issues Rules
  MISSING_SEARCH: {
    id: 'rule_001',
    category: RULE_CATEGORIES.CRITICAL_ISSUES,
    name: 'Missing Site Search',
    description: 'No search functionality detected on content-heavy site',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const searchResult = detectorResults.search?.result;
      const pageComplexity = context.pageComplexity || 'medium';
      
      return !searchResult?.elementsFound && 
             ['high', 'very_high'].includes(pageComplexity);
    },
    
    recommendation: {
      title: 'Implement Site Search Functionality',
      description: 'Add search capability to help users find content quickly',
      priority: 'critical',
      impact: 'high',
      effort: 'medium',
      details: [
        'Add prominent search box in header',
        'Implement autocomplete suggestions',
        'Ensure search works across all content types',
        'Add filters for search refinement'
      ]
    }
  },
  
  POOR_MOBILE_CTA: {
    id: 'rule_002',
    category: RULE_CATEGORIES.CONVERSION_BLOCKERS,
    name: 'Poor Mobile CTA Experience',
    description: 'CTAs not optimized for mobile touch targets',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const ctaResult = detectorResults.cta?.result;
      const mobileScore = heuristicsResults.modern?.MOBILE_FIRST?.score || 0;
      
      return ctaResult?.elementsFound > 0 && mobileScore < 70;
    },
    
    recommendation: {
      title: 'Optimize CTAs for Mobile Devices',
      description: 'Improve CTA touch targets and mobile usability',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      details: [
        'Increase CTA button size to minimum 44px',
        'Add adequate spacing between touch targets',
        'Ensure CTAs are thumb-friendly positioned',
        'Test on various mobile devices'
      ]
    }
  },
  
  COMPLEX_FORM: {
    id: 'rule_003',
    category: RULE_CATEGORIES.CONVERSION_BLOCKERS,
    name: 'Overly Complex Forms',
    description: 'Forms have too many fields reducing conversion potential',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const formResult = detectorResults.form?.result;
      const formDetails = formResult?.details || [];
      
      return formDetails.some(form => 
        form.fieldCount > 7 && form.purpose === 'lead_generation'
      );
    },
    
    recommendation: {
      title: 'Simplify Form Fields',
      description: 'Reduce form complexity to improve conversion rates',
      priority: 'high',
      impact: 'high',
      effort: 'medium',
      details: [
        'Remove non-essential fields',
        'Use progressive disclosure for optional fields',
        'Implement smart defaults and auto-fill',
        'Consider multi-step forms for complex data collection'
      ]
    }
  },
  
  MISSING_ACCESSIBILITY: {
    id: 'rule_004',
    category: RULE_CATEGORIES.ACCESSIBILITY,
    name: 'Accessibility Violations',
    description: 'Critical accessibility issues detected',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const accessibilityScore = heuristicsResults.modern?.ACCESSIBILITY_FIRST?.score || 0;
      return accessibilityScore < 60;
    },
    
    recommendation: {
      title: 'Address Critical Accessibility Issues',
      description: 'Improve accessibility compliance and user experience',
      priority: 'critical',
      impact: 'high',
      effort: 'medium',
      details: [
        'Add proper ARIA labels and roles',
        'Ensure keyboard navigation works',
        'Improve color contrast ratios',
        'Add alt text to images',
        'Test with screen readers'
      ]
    }
  },
  
  POOR_ERROR_HANDLING: {
    id: 'rule_005',
    category: RULE_CATEGORIES.USABILITY_ISSUES,
    name: 'Poor Error Page Experience',
    description: 'Error pages lack helpful navigation and recovery options',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const errorResult = detectorResults.errorPage?.result;
      const errorScore = errorResult?.scores?.overall || 0;
      
      return errorResult?.elementsFound > 0 && errorScore < 60;
    },
    
    recommendation: {
      title: 'Improve Error Page Experience',
      description: 'Create helpful error pages that assist user recovery',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      details: [
        'Add clear error explanations',
        'Provide helpful navigation options',
        'Include search functionality',
        'Add contact information for assistance',
        'Suggest alternative actions'
      ]
    }
  },
  
  SLOW_LOADING: {
    id: 'rule_006',
    category: RULE_CATEGORIES.PERFORMANCE_ISSUES,
    name: 'Slow Loading Performance',
    description: 'Page loading performance impacts user experience',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const performanceScore = heuristicsResults.modern?.PERFORMANCE_OPTIMIZATION?.score || 0;
      return performanceScore < 70;
    },
    
    recommendation: {
      title: 'Optimize Page Loading Performance',
      description: 'Improve loading speed for better user experience',
      priority: 'medium',
      impact: 'high',
      effort: 'high',
      details: [
        'Optimize images and media files',
        'Implement lazy loading',
        'Minimize HTTP requests',
        'Use content delivery network (CDN)',
        'Enable browser caching'
      ]
    }
  },
  
  MISSING_SOCIAL_PROOF: {
    id: 'rule_007',
    category: RULE_CATEGORIES.ENHANCEMENT_OPPORTUNITIES,
    name: 'Missing Social Proof Elements',
    description: 'Lack of social validation and trust indicators',
    
    condition: (detectorResults, heuristicsResults, context) => {
      const socialScore = heuristicsResults.modern?.SOCIAL_PROOF?.score || 0;
      const trustScore = heuristicsResults.conversion?.TRUST_SIGNALS?.score || 0;
      
      return socialScore < 50 && trustScore < 60;
    },
    
    recommendation: {
      title: 'Add Social Proof Elements',
      description: 'Implement trust indicators and social validation',
      priority: 'low',
      impact: 'medium',
      effort: 'low',
      details: [
        'Add customer testimonials',
        'Display user reviews and ratings',
        'Show usage statistics',
        'Include security badges',
        'Add company logos (if B2B)'
      ]
    }
  }
};

/**
 * Main UX Rules Engine
 */
export class UXRulesEngine {
  constructor(options = {}) {
    this.options = {
      industryType: 'generic',
      enableIndustryRules: true,
      enableCustomRules: true,
      priorityThreshold: 'medium',
      maxRecommendations: 20,
      ...options
    };
    
    this.industryRules = INDUSTRY_RULE_SETS[this.options.industryType] || null;
    this.activeRules = new Map();
    this.executionResults = new Map();
    this.performanceMetrics = {
      startTime: null,
      endTime: null,
      rulesEvaluated: 0,
      rulesTriggered: 0
    };
    
    this._loadRules();
  }

  /**
   * Main rules engine execution
   * @param {Object} detectorResults - Results from core detectors
   * @param {Object} heuristicsResults - Results from heuristics engine
   * @param {Object} context - Additional context data
   * @returns {Promise<Object>} Rules engine results
   */
  async executeRules(detectorResults, heuristicsResults, context = {}) {
    this.performanceMetrics.startTime = Date.now();
    
    try {
      // Phase 1: Rule Evaluation
      const triggeredRules = await this._evaluateRules(
        detectorResults, 
        heuristicsResults, 
        context
      );

      // Phase 2: Priority Scoring
      const prioritizedRules = this._prioritizeRules(triggeredRules, context);

      // Phase 3: Industry-Specific Adjustments
      const industryAdjustedRules = this._applyIndustryAdjustments(
        prioritizedRules, 
        context
      );

      // Phase 4: Recommendation Generation
      const recommendations = this._generateRecommendations(
        industryAdjustedRules,
        context
      );

      // Phase 5: Final Results Compilation
      const finalResults = this._compileResults(
        triggeredRules,
        prioritizedRules,
        industryAdjustedRules,
        recommendations,
        context
      );

      this.performanceMetrics.endTime = Date.now();
      return finalResults;

    } catch (error) {
      return {
        error: error.message,
        analysisTime: Date.now() - this.performanceMetrics.startTime,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Load active rules based on configuration
   * @private
   */
  _loadRules() {
    // Load core UX rules
    Object.entries(UX_RULES_LIBRARY).forEach(([key, rule]) => {
      this.activeRules.set(rule.id, rule);
    });

    // Load industry-specific rules if enabled
    if (this.options.enableIndustryRules && this.industryRules) {
      this._loadIndustryRules();
    }
  }

  /**
   * Load industry-specific rules
   * @private
   */
  _loadIndustryRules() {
    // Industry rules implementation
    // This would extend the core rules with industry-specific patterns
  }

  /**
   * Evaluate all active rules
   * @param {Object} detectorResults - Detector results
   * @param {Object} heuristicsResults - Heuristics results
   * @param {Object} context - Context data
   * @returns {Promise<Array>} Triggered rules
   * @private
   */
  async _evaluateRules(detectorResults, heuristicsResults, context) {
    const triggeredRules = [];

    for (const [ruleId, rule] of this.activeRules) {
      try {
        this.performanceMetrics.rulesEvaluated++;
        
        const isTriggered = await this._evaluateRule(
          rule,
          detectorResults,
          heuristicsResults,
          context
        );

        if (isTriggered) {
          triggeredRules.push({
            ...rule,
            triggeredAt: Date.now(),
            context: this._captureRuleContext(rule, detectorResults, heuristicsResults)
          });
          
          this.performanceMetrics.rulesTriggered++;
        }

      } catch (error) {
        console.warn(`Rule evaluation failed for ${ruleId}:`, error.message);
      }
    }

    return triggeredRules;
  }

  /**
   * Evaluate individual rule
   * @param {Object} rule - Rule definition
   * @param {Object} detectorResults - Detector results
   * @param {Object} heuristicsResults - Heuristics results
   * @param {Object} context - Context data
   * @returns {Promise<boolean>} Whether rule is triggered
   * @private
   */
  async _evaluateRule(rule, detectorResults, heuristicsResults, context) {
    if (typeof rule.condition !== 'function') {
      return false;
    }

    return await rule.condition(detectorResults, heuristicsResults, context);
  }

  /**
   * Capture context for triggered rule
   * @param {Object} rule - Triggered rule
   * @param {Object} detectorResults - Detector results
   * @param {Object} heuristicsResults - Heuristics results
   * @returns {Object} Rule context
   * @private
   */
  _captureRuleContext(rule, detectorResults, heuristicsResults) {
    return {
      detectorData: this._extractRelevantDetectorData(rule, detectorResults),
      heuristicsData: this._extractRelevantHeuristicsData(rule, heuristicsResults),
      ruleCategory: rule.category.priority,
      industryRelevance: this._calculateIndustryRelevance(rule)
    };
  }

  /**
   * Extract relevant detector data for rule
   * @param {Object} rule - Rule definition
   * @param {Object} detectorResults - Detector results
   * @returns {Object} Relevant detector data
   * @private
   */
  _extractRelevantDetectorData(rule, detectorResults) {
    // Extract only the detector data relevant to this rule
    const relevantData = {};
    
    // This would be implemented based on rule dependencies
    Object.keys(detectorResults).forEach(detector => {
      if (this._isDetectorRelevantToRule(rule, detector)) {
        relevantData[detector] = detectorResults[detector];
      }
    });
    
    return relevantData;
  }

  /**
   * Extract relevant heuristics data for rule
   * @param {Object} rule - Rule definition
   * @param {Object} heuristicsResults - Heuristics results
   * @returns {Object} Relevant heuristics data
   * @private
   */
  _extractRelevantHeuristicsData(rule, heuristicsResults) {
    // Extract only the heuristics data relevant to this rule
    return {}; // Implementation would filter relevant heuristics
  }

  /**
   * Check if detector is relevant to rule
   * @param {Object} rule - Rule definition
   * @param {string} detectorName - Detector name
   * @returns {boolean} Whether detector is relevant
   * @private
   */
  _isDetectorRelevantToRule(rule, detectorName) {
    // Implementation would check rule dependencies
    return true; // Simplified for now
  }

  /**
   * Calculate industry relevance for rule
   * @param {Object} rule - Rule definition
   * @returns {number} Industry relevance score
   * @private
   */
  _calculateIndustryRelevance(rule) {
    if (!this.industryRules) return 1.0;
    
    const categoryWeight = this.industryRules.weights[rule.category.name] || 1.0;
    return categoryWeight;
  }

  /**
   * Prioritize triggered rules
   * @param {Array} triggeredRules - Triggered rules
   * @param {Object} context - Context data
   * @returns {Array} Prioritized rules
   * @private
   */
  _prioritizeRules(triggeredRules, context) {
    return triggeredRules
      .map(rule => ({
        ...rule,
        priorityScore: this._calculatePriorityScore(rule, context)
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Calculate priority score for rule
   * @param {Object} rule - Rule with context
   * @param {Object} context - Analysis context
   * @returns {number} Priority score
   * @private
   */
  _calculatePriorityScore(rule, context) {
    let score = rule.category.weight * 100;
    
    // Adjust for industry relevance
    score *= rule.context.industryRelevance;
    
    // Adjust for urgency
    if (rule.category.requiresImmediate) {
      score *= 1.5;
    }
    
    return Math.round(score);
  }

  /**
   * Apply industry-specific adjustments
   * @param {Array} prioritizedRules - Prioritized rules
   * @param {Object} context - Context data
   * @returns {Array} Industry-adjusted rules
   * @private
   */
  _applyIndustryAdjustments(prioritizedRules, context) {
    if (!this.industryRules) return prioritizedRules;

    return prioritizedRules.map(rule => {
      const adjusted = { ...rule };
      
      // Apply industry-specific priority adjustments
      if (this.industryRules.criticalPatterns.includes(rule.id)) {
        adjusted.priorityScore *= 1.3;
        adjusted.recommendation.priority = 'critical';
      }
      
      return adjusted;
    });
  }

  /**
   * Generate recommendations from rules
   * @param {Array} industryAdjustedRules - Industry-adjusted rules
   * @param {Object} context - Context data
   * @returns {Array} Generated recommendations
   * @private
   */
  _generateRecommendations(industryAdjustedRules, context) {
    const recommendations = industryAdjustedRules
      .slice(0, this.options.maxRecommendations)
      .map(rule => ({
        ...rule.recommendation,
        ruleId: rule.id,
        triggerContext: rule.context,
        priorityScore: rule.priorityScore,
        timestamp: Date.now()
      }));

    return UXRecommendationUtils.sortRecommendations(recommendations);
  }

  /**
   * Compile final results
   * @param {Array} triggeredRules - All triggered rules
   * @param {Array} prioritizedRules - Prioritized rules
   * @param {Array} industryAdjustedRules - Industry-adjusted rules
   * @param {Array} recommendations - Final recommendations
   * @param {Object} context - Analysis context
   * @returns {Object} Compiled results
   * @private
   */
  _compileResults(triggeredRules, prioritizedRules, industryAdjustedRules, recommendations, context) {
    const analysisTime = this.performanceMetrics.endTime - this.performanceMetrics.startTime;
    
    return {
      rulesEngine: 'UX Rules Engine',
      version: '2.0.0',
      analysisTime,
      
      execution: {
        rulesEvaluated: this.performanceMetrics.rulesEvaluated,
        rulesTriggered: this.performanceMetrics.rulesTriggered,
        recommendations: recommendations.length
      },
      
      results: {
        triggeredRules: triggeredRules.length,
        prioritizedRules: prioritizedRules.slice(0, 10), // Top 10 for summary
        recommendations,
        industryAdjustments: this.industryRules ? this.industryRules.name : 'Generic'
      },
      
      summary: {
        criticalIssues: recommendations.filter(r => r.priority === 'critical').length,
        highPriorityIssues: recommendations.filter(r => r.priority === 'high').length,
        totalRecommendations: recommendations.length,
        estimatedImpact: this._calculateEstimatedImpact(recommendations)
      },
      
      metadata: {
        industryType: this.options.industryType,
        rulesEngineVersion: '2.0.0',
        timestamp: Date.now()
      }
    };
  }

  /**
   * Calculate estimated impact of recommendations
   * @param {Array} recommendations - Recommendations list
   * @returns {Object} Impact estimation
   * @private
   */
  _calculateEstimatedImpact(recommendations) {
    const impactCounts = {
      high: recommendations.filter(r => r.impact === 'high').length,
      medium: recommendations.filter(r => r.impact === 'medium').length,
      low: recommendations.filter(r => r.impact === 'low').length
    };

    const totalImpactScore = (impactCounts.high * 3) + (impactCounts.medium * 2) + (impactCounts.low * 1);
    const maxPossibleScore = recommendations.length * 3;
    
    return {
      impactCounts,
      overallImpactScore: maxPossibleScore > 0 ? Math.round((totalImpactScore / maxPossibleScore) * 100) : 0,
      estimatedConversionImprovement: this._estimateConversionImprovement(recommendations)
    };
  }

  /**
   * Estimate conversion improvement potential
   * @param {Array} recommendations - Recommendations list
   * @returns {number} Estimated conversion improvement percentage
   * @private
   */
  _estimateConversionImprovement(recommendations) {
    // Simplified estimation based on recommendation types and priorities
    const conversionImpactRules = recommendations.filter(r => 
      r.ruleId && r.ruleId.includes('conversion') || r.category === 'CONVERSION_BLOCKERS'
    );
    
    if (conversionImpactRules.length === 0) return 0;
    
    // Conservative estimation: 2-5% improvement per critical conversion issue
    const criticalConversionIssues = conversionImpactRules.filter(r => r.priority === 'critical').length;
    const highConversionIssues = conversionImpactRules.filter(r => r.priority === 'high').length;
    
    return Math.min((criticalConversionIssues * 5) + (highConversionIssues * 2), 25); // Cap at 25%
  }

  /**
   * Add custom rule to engine
   * @param {Object} rule - Custom rule definition
   */
  addCustomRule(rule) {
    if (!rule.id || !rule.condition || !rule.recommendation) {
      throw new Error('Invalid rule definition');
    }
    
    this.activeRules.set(rule.id, rule);
  }

  /**
   * Remove rule from engine
   * @param {string} ruleId - Rule ID to remove
   */
  removeRule(ruleId) {
    this.activeRules.delete(ruleId);
  }

  /**
   * Get engine statistics
   * @returns {Object} Engine statistics
   */
  getEngineStats() {
    return {
      activeRules: this.activeRules.size,
      industryType: this.options.industryType,
      ...this.performanceMetrics
    };
  }
}

export default UXRulesEngine;
