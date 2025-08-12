/**
 * UX Analysis Weights Configuration
 * 
 * Defines scoring weights for different UX analysis components.
 * Allows for customizable prioritization based on business context.
 */

export class UXWeights {
  constructor(context = 'default') {
    this.context = context;
    this.weights = this._getWeightsByContext(context);
    this.customWeights = {};
  }

  /**
   * Get weights based on business context
   * @param {string} context - Business context (default, ecommerce, saas, lead-generation, content, mobile-first)
   * @returns {Object} Weight configuration
   */
  _getWeightsByContext(context) {
    const weightConfigs = {
      default: this._getDefaultWeights(),
      ecommerce: this._getEcommerceWeights(),
      saas: this._getSaaSWeights(),
      'lead-generation': this._getLeadGenerationWeights(),
      content: this._getContentWeights(),
      'mobile-first': this._getMobileFirstWeights(),
      accessibility: this._getAccessibilityWeights(),
      conversion: this._getConversionWeights()
    };

    return weightConfigs[context] || weightConfigs.default;
  }

  /**
   * Default balanced weights for general websites
   */
  _getDefaultWeights() {
    return {
      // Main heuristic area weights (should sum to 1.0)
      heuristicAreas: {
        usability: 0.30,        // Nielsen's usability principles
        conversionPath: 0.25,   // Conversion optimization
        cognitiveLoad: 0.25,    // Information processing ease
        trust: 0.20             // Credibility and trust signals
      },

      // Usability sub-component weights
      usability: {
        visibility: 0.25,       // System status visibility
        userControl: 0.25,      // User control and freedom
        consistency: 0.25,      // Consistency and standards
        errorPrevention: 0.25   // Error prevention and recovery
      },

      // Conversion path sub-component weights
      conversionPath: {
        conversionElements: 0.30,    // Presence of conversion elements
        pathClarity: 0.25,           // Clear conversion path
        frictionPoints: 0.25,        // Friction identification and impact
        callToActions: 0.20          // CTA effectiveness
      },

      // Cognitive load sub-component weights
      cognitiveLoad: {
        informationDensity: 0.30,    // Information density management
        visualComplexity: 0.25,      // Visual hierarchy and simplicity
        interactionComplexity: 0.25, // Interaction complexity
        decisionLoad: 0.20           // Decision-making burden
      },

      // Trust sub-component weights
      trust: {
        credibilitySignals: 0.30,    // Professional credibility indicators
        transparency: 0.25,          // Transparency in policies and operations
        socialProof: 0.25,           // Social proof and testimonials
        securityIndicators: 0.20     // Security and privacy indicators
      },

      // Detection importance weights (for feature presence scoring)
      detections: {
        interaction: 0.25,      // Interactive element quality
        navigation: 0.25,       // Navigation structure
        forms: 0.20,           // Form usability
        content: 0.15,         // Content structure
        trustSignals: 0.15     // Trust signal presence
      },

      // AI enhancement weights (when AI is enabled)
      aiEnhancement: {
        patterns: 0.30,        // Pattern analysis contribution
        predictions: 0.25,     // Predictive insights weight
        recommendations: 0.25, // AI recommendation quality
        confidence: 0.20       // AI confidence in analysis
      },

      // Quality factors for final scoring
      qualityFactors: {
        completeness: 0.25,    // Analysis completeness
        confidence: 0.25,      // Overall confidence in results
        actionability: 0.25,   // Actionability of recommendations
        impact: 0.25          // Potential impact of changes
      }
    };
  }

  /**
   * E-commerce optimized weights (focus on conversion)
   */
  _getEcommerceWeights() {
    return {
      heuristicAreas: {
        conversionPath: 0.35,   // Higher emphasis on conversion
        trust: 0.30,           // Trust crucial for purchases
        usability: 0.20,       // Basic usability
        cognitiveLoad: 0.15    // Simplicity important but not primary
      },

      usability: {
        userControl: 0.30,     // Shopping cart, wishlist control
        errorPrevention: 0.30, // Prevent purchase errors
        consistency: 0.25,     // Consistent shopping experience
        visibility: 0.15       // Status during checkout
      },

      conversionPath: {
        conversionElements: 0.35,  // Product pages, checkout
        frictionPoints: 0.30,      // Reduce shopping friction
        callToActions: 0.25,       // Clear purchase CTAs
        pathClarity: 0.10          // Shopping flow clarity
      },

      trust: {
        securityIndicators: 0.35,  // Payment security crucial
        credibilitySignals: 0.25,  // Company credibility
        socialProof: 0.25,         // Reviews and ratings
        transparency: 0.15         // Pricing, policies
      },

      cognitiveLoad: {
        decisionLoad: 0.35,        // Product choice complexity
        informationDensity: 0.25,  // Product information
        visualComplexity: 0.25,    // Clean product display
        interactionComplexity: 0.15 // Simple interactions
      }
    };
  }

  /**
   * SaaS platform weights (focus on usability and onboarding)
   */
  _getSaaSWeights() {
    return {
      heuristicAreas: {
        usability: 0.35,       // Core application usability
        cognitiveLoad: 0.30,   // Complex interfaces need simplicity
        conversionPath: 0.20,  // Trial/signup conversion
        trust: 0.15           // Important but less critical for trials
      },

      usability: {
        userControl: 0.35,     // Feature control and customization
        consistency: 0.30,     // Interface consistency crucial
        visibility: 0.20,      // System status for complex operations
        errorPrevention: 0.15  // Error prevention in workflows
      },

      cognitiveLoad: {
        interactionComplexity: 0.35, // Complex feature interactions
        informationDensity: 0.30,    // Dashboard information density
        visualComplexity: 0.20,      // Clean interface design
        decisionLoad: 0.15           // Feature choice complexity
      },

      conversionPath: {
        pathClarity: 0.35,     // Clear onboarding path
        frictionPoints: 0.30,  // Reduce onboarding friction
        conversionElements: 0.20, // Trial/signup elements
        callToActions: 0.15    // Upgrade CTAs
      }
    };
  }

  /**
   * Lead generation focused weights
   */
  _getLeadGenerationWeights() {
    return {
      heuristicAreas: {
        conversionPath: 0.40,  // Form conversion is primary
        trust: 0.25,          // Trust before providing info
        cognitiveLoad: 0.20,   // Simple lead capture
        usability: 0.15       // Basic usability
      },

      conversionPath: {
        frictionPoints: 0.40,     // Minimize form friction
        conversionElements: 0.30, // Lead capture forms
        callToActions: 0.20,      // Clear lead CTAs
        pathClarity: 0.10         // Simple lead path
      },

      trust: {
        transparency: 0.35,       // Clear about data use
        credibilitySignals: 0.30, // Company credibility
        securityIndicators: 0.20, // Data security
        socialProof: 0.15        // Social validation
      }
    };
  }

  /**
   * Content-focused website weights
   */
  _getContentWeights() {
    return {
      heuristicAreas: {
        cognitiveLoad: 0.35,   // Readability and comprehension
        usability: 0.30,       // Navigation and findability
        trust: 0.20,          // Content credibility
        conversionPath: 0.15   // Newsletter, engagement
      },

      cognitiveLoad: {
        informationDensity: 0.35,    // Content density
        visualComplexity: 0.30,      // Reading layout
        interactionComplexity: 0.20, // Simple content interaction
        decisionLoad: 0.15          // Content choice complexity
      },

      usability: {
        visibility: 0.35,      // Content status and progress
        consistency: 0.30,     // Consistent content structure
        userControl: 0.20,     // Content personalization
        errorPrevention: 0.15  // Search and navigation errors
      }
    };
  }

  /**
   * Mobile-first optimized weights
   */
  _getMobileFirstWeights() {
    return {
      heuristicAreas: {
        usability: 0.35,       // Touch interactions crucial
        cognitiveLoad: 0.30,   // Limited screen space
        conversionPath: 0.20,  // Mobile conversion
        trust: 0.15           // Trust signals on mobile
      },

      usability: {
        userControl: 0.35,     // Touch control precision
        consistency: 0.30,     // Cross-device consistency
        visibility: 0.20,      // Limited screen feedback
        errorPrevention: 0.15  // Touch error prevention
      },

      cognitiveLoad: {
        visualComplexity: 0.35,      // Screen space optimization
        interactionComplexity: 0.30, // Touch interaction simplicity
        informationDensity: 0.25,    // Information prioritization
        decisionLoad: 0.10          // Simplified choices
      },

      // Mobile-specific detection weights
      detections: {
        interaction: 0.40,     // Touch-friendly interactions
        navigation: 0.30,      // Mobile navigation
        forms: 0.20,          // Mobile form usability
        content: 0.10,        // Content adaptation
        trustSignals: 0.05    // Minimal trust signals
      }
    };
  }

  /**
   * Accessibility-focused weights
   */
  _getAccessibilityWeights() {
    return {
      heuristicAreas: {
        usability: 0.40,       // Accessible usability
        cognitiveLoad: 0.30,   // Cognitive accessibility
        trust: 0.20,          // Accessible trust indicators
        conversionPath: 0.10   // Accessible conversion
      },

      usability: {
        visibility: 0.35,      // Screen reader visibility
        userControl: 0.30,     // Keyboard control
        consistency: 0.25,     // Predictable interactions
        errorPrevention: 0.10  // Accessible error handling
      },

      cognitiveLoad: {
        interactionComplexity: 0.35, // Simple accessible interactions
        informationDensity: 0.30,    // Clear information structure
        visualComplexity: 0.25,      // Visual accessibility
        decisionLoad: 0.10          // Simplified decision making
      }
    };
  }

  /**
   * Conversion-optimized weights
   */
  _getConversionWeights() {
    return {
      heuristicAreas: {
        conversionPath: 0.45,  // Primary focus on conversion
        trust: 0.25,          // Trust enables conversion
        cognitiveLoad: 0.20,   // Remove conversion barriers
        usability: 0.10       // Basic usability baseline
      },

      conversionPath: {
        frictionPoints: 0.40,     // Eliminate conversion friction
        conversionElements: 0.30, // Optimize conversion elements
        callToActions: 0.20,      // Strong CTAs
        pathClarity: 0.10         // Clear conversion flow
      },

      trust: {
        securityIndicators: 0.35, // Security for conversion
        socialProof: 0.30,        // Social validation
        credibilitySignals: 0.25, // Company credibility
        transparency: 0.10        // Clear policies
      }
    };
  }

  /**
   * Set custom weights for specific components
   * @param {Object} customWeights - Custom weight overrides
   */
  setCustomWeights(customWeights) {
    this.customWeights = { ...this.customWeights, ...customWeights };
  }

  /**
   * Get weight for specific component
   * @param {string} category - Weight category (heuristicAreas, usability, etc.)
   * @param {string} component - Specific component within category
   * @returns {number} Weight value
   */
  getWeight(category, component = null) {
    // Check for custom weights first
    const customPath = component ? `${category}.${component}` : category;
    if (this.customWeights[customPath] !== undefined) {
      return this.customWeights[customPath];
    }

    // Return standard weights
    if (component) {
      return this.weights[category]?.[component] || 0;
    }
    return this.weights[category] || {};
  }

  /**
   * Get all weights for a category
   * @param {string} category - Weight category
   * @returns {Object} All weights in category
   */
  getCategoryWeights(category) {
    const baseWeights = this.weights[category] || {};
    const customOverrides = {};
    
    // Apply custom overrides
    Object.keys(this.customWeights).forEach(key => {
      if (key.startsWith(`${category}.`)) {
        const component = key.split('.')[1];
        customOverrides[component] = this.customWeights[key];
      }
    });

    return { ...baseWeights, ...customOverrides };
  }

  /**
   * Validate that weights in a category sum to 1.0 (approximately)
   * @param {string} category - Category to validate
   * @returns {Object} Validation result
   */
  validateWeights(category) {
    const weights = this.getCategoryWeights(category);
    const sum = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
    const isValid = Math.abs(sum - 1.0) < 0.01; // Allow small floating point errors

    return {
      valid: isValid,
      sum: sum,
      difference: sum - 1.0,
      weights: weights
    };
  }

  /**
   * Normalize weights in a category to sum to 1.0
   * @param {string} category - Category to normalize
   * @returns {Object} Normalized weights
   */
  normalizeWeights(category) {
    const weights = this.getCategoryWeights(category);
    const sum = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
    
    if (sum === 0) return weights;

    const normalized = {};
    Object.entries(weights).forEach(([key, weight]) => {
      normalized[key] = weight / sum;
    });

    return normalized;
  }

  /**
   * Get context information about current weight configuration
   * @returns {Object} Context information
   */
  getContextInfo() {
    return {
      context: this.context,
      customWeights: Object.keys(this.customWeights).length,
      description: this._getContextDescription(this.context),
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Get description for weight context
   * @param {string} context - Weight context
   * @returns {string} Context description
   */
  _getContextDescription(context) {
    const descriptions = {
      default: 'Balanced weights suitable for general websites and applications',
      ecommerce: 'Optimized for e-commerce sites with focus on conversion and trust',
      saas: 'Tailored for SaaS applications emphasizing usability and complexity management',
      'lead-generation': 'Focused on lead capture with emphasis on conversion path optimization',
      content: 'Optimized for content sites prioritizing readability and navigation',
      'mobile-first': 'Mobile-optimized weights focusing on touch interactions and screen constraints',
      accessibility: 'Accessibility-focused weights emphasizing inclusive design principles',
      conversion: 'Maximum conversion optimization with strong focus on eliminating friction'
    };

    return descriptions[context] || 'Custom weight configuration';
  }

  /**
   * Export current weight configuration
   * @returns {Object} Complete weight configuration
   */
  exportConfiguration() {
    return {
      context: this.context,
      weights: this.weights,
      customWeights: this.customWeights,
      contextInfo: this.getContextInfo(),
      validation: this._validateAllCategories()
    };
  }

  /**
   * Validate all weight categories
   * @returns {Object} Validation results for all categories
   * @private
   */
  _validateAllCategories() {
    const categories = Object.keys(this.weights);
    const results = {};

    categories.forEach(category => {
      results[category] = this.validateWeights(category);
    });

    return results;
  }
}
