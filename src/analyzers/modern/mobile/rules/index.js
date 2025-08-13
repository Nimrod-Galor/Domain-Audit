/**
 * Mobile Analyzer Rules Engine - Intelligent Scoring and Recommendation System
 * 
 * Advanced rule-based analysis system for mobile optimization with
 * intelligent scoring algorithms and adaptive recommendation generation.
 */

export class MobileRulesEngine {
  constructor(config = {}) {
    this.config = {
      strictMode: false,
      enableAdaptiveScoring: true,
      weightAdjustment: true,
      contextAwareness: true,
      performanceThreshold: 0.7,
      accessibilityThreshold: 0.8,
      ...config
    };

    this.ruleCategories = {
      RESPONSIVE_DESIGN: {
        weight: 0.25,
        rules: ['mobile-first', 'fluid-layouts', 'breakpoint-strategy', 'responsive-images']
      },
      MOBILE_UX: {
        weight: 0.25,
        rules: ['touch-optimization', 'navigation-patterns', 'thumb-friendly', 'gesture-support']
      },
      PERFORMANCE: {
        weight: 0.2,
        rules: ['core-vitals', 'resource-optimization', 'network-efficiency', 'battery-impact']
      },
      ACCESSIBILITY: {
        weight: 0.2,
        rules: ['touch-targets', 'keyboard-access', 'screen-reader', 'wcag-compliance']
      },
      PWA_FEATURES: {
        weight: 0.1,
        rules: ['manifest', 'service-worker', 'installability', 'offline-support']
      }
    };

    this.scoringAlgorithms = {
      weighted: this.calculateWeightedScore.bind(this),
      exponential: this.calculateExponentialScore.bind(this),
      logarithmic: this.calculateLogarithmicScore.bind(this),
      adaptive: this.calculateAdaptiveScore.bind(this),
      contextual: this.calculateContextualScore.bind(this)
    };

    this.mobileRules = this.initializeMobileRules();
  }

  initializeMobileRules() {
    return {
      // Responsive Design Rules
      'mobile-first': {
        category: 'RESPONSIVE_DESIGN',
        weight: 0.3,
        priority: 'high',
        condition: (analysis) => this.evaluateMobileFirst(analysis),
        threshold: 0.8,
        message: 'Mobile-first approach implementation',
        recommendations: [
          'Implement min-width media queries',
          'Start with mobile layouts and enhance for larger screens',
          'Use progressive enhancement principles'
        ]
      },

      'fluid-layouts': {
        category: 'RESPONSIVE_DESIGN',
        weight: 0.25,
        priority: 'high',
        condition: (analysis) => this.evaluateFluidLayouts(analysis),
        threshold: 0.7,
        message: 'Flexible and adaptive layout systems',
        recommendations: [
          'Use CSS Grid and Flexbox for modern layouts',
          'Implement fluid width containers',
          'Avoid fixed pixel widths for content areas'
        ]
      },

      'breakpoint-strategy': {
        category: 'RESPONSIVE_DESIGN',
        weight: 0.25,
        priority: 'medium',
        condition: (analysis) => this.evaluateBreakpointStrategy(analysis),
        threshold: 0.6,
        message: 'Strategic breakpoint implementation',
        recommendations: [
          'Define content-based breakpoints',
          'Ensure coverage for all device categories',
          'Maintain consistent breakpoint usage'
        ]
      },

      'responsive-images': {
        category: 'RESPONSIVE_DESIGN',
        weight: 0.2,
        priority: 'medium',
        condition: (analysis) => this.evaluateResponsiveImages(analysis),
        threshold: 0.7,
        message: 'Optimized responsive image delivery',
        recommendations: [
          'Implement srcset and sizes attributes',
          'Use picture element for art direction',
          'Consider WebP format for better compression'
        ]
      },

      // Mobile UX Rules
      'touch-optimization': {
        category: 'MOBILE_UX',
        weight: 0.3,
        priority: 'high',
        condition: (analysis) => this.evaluateTouchOptimization(analysis),
        threshold: 0.8,
        message: 'Touch interface optimization',
        recommendations: [
          'Ensure minimum 44px touch targets',
          'Add visual feedback for touch interactions',
          'Optimize for thumb-friendly navigation'
        ]
      },

      'navigation-patterns': {
        category: 'MOBILE_UX',
        weight: 0.25,
        priority: 'high',
        condition: (analysis) => this.evaluateNavigationPatterns(analysis),
        threshold: 0.7,
        message: 'Mobile-optimized navigation patterns',
        recommendations: [
          'Implement hamburger menu for complex navigation',
          'Use bottom navigation for primary actions',
          'Ensure navigation is accessible via keyboard'
        ]
      },

      'thumb-friendly': {
        category: 'MOBILE_UX',
        weight: 0.25,
        priority: 'medium',
        condition: (analysis) => this.evaluateThumbFriendly(analysis),
        threshold: 0.6,
        message: 'Thumb-zone accessible interface',
        recommendations: [
          'Place important controls in thumb reach zone',
          'Consider one-handed usage patterns',
          'Avoid placing critical actions at screen top'
        ]
      },

      'gesture-support': {
        category: 'MOBILE_UX',
        weight: 0.2,
        priority: 'medium',
        condition: (analysis) => this.evaluateGestureSupport(analysis),
        threshold: 0.5,
        message: 'Touch gesture implementation',
        recommendations: [
          'Support swipe gestures for navigation',
          'Implement pinch-to-zoom where appropriate',
          'Provide gesture alternatives for accessibility'
        ]
      },

      // Performance Rules
      'core-vitals': {
        category: 'PERFORMANCE',
        weight: 0.4,
        priority: 'high',
        condition: (analysis) => this.evaluateCoreVitals(analysis),
        threshold: 0.75,
        message: 'Core Web Vitals optimization',
        recommendations: [
          'Optimize Largest Contentful Paint (LCP)',
          'Minimize Cumulative Layout Shift (CLS)',
          'Improve First Input Delay (FID)'
        ]
      },

      'resource-optimization': {
        category: 'PERFORMANCE',
        weight: 0.3,
        priority: 'high',
        condition: (analysis) => this.evaluateResourceOptimization(analysis),
        threshold: 0.7,
        message: 'Mobile resource optimization',
        recommendations: [
          'Compress and minify assets',
          'Implement lazy loading for images',
          'Use efficient image formats'
        ]
      },

      'network-efficiency': {
        category: 'PERFORMANCE',
        weight: 0.2,
        priority: 'medium',
        condition: (analysis) => this.evaluateNetworkEfficiency(analysis),
        threshold: 0.6,
        message: 'Network usage optimization',
        recommendations: [
          'Minimize HTTP requests',
          'Implement effective caching strategies',
          'Use compression for text resources'
        ]
      },

      'battery-impact': {
        category: 'PERFORMANCE',
        weight: 0.1,
        priority: 'low',
        condition: (analysis) => this.evaluateBatteryImpact(analysis),
        threshold: 0.5,
        message: 'Battery consumption optimization',
        recommendations: [
          'Minimize CPU-intensive operations',
          'Reduce background processing',
          'Optimize animation performance'
        ]
      },

      // Accessibility Rules
      'touch-targets': {
        category: 'ACCESSIBILITY',
        weight: 0.3,
        priority: 'high',
        condition: (analysis) => this.evaluateAccessibilityTouchTargets(analysis),
        threshold: 0.9,
        message: 'Accessible touch target sizing',
        recommendations: [
          'Ensure minimum 44x44px touch targets',
          'Provide adequate spacing between targets',
          'Consider motor impairment accommodations'
        ]
      },

      'keyboard-access': {
        category: 'ACCESSIBILITY',
        weight: 0.25,
        priority: 'high',
        condition: (analysis) => this.evaluateKeyboardAccess(analysis),
        threshold: 0.8,
        message: 'Keyboard accessibility support',
        recommendations: [
          'Ensure all interactive elements are focusable',
          'Implement visible focus indicators',
          'Provide skip links for navigation'
        ]
      },

      'screen-reader': {
        category: 'ACCESSIBILITY',
        weight: 0.25,
        priority: 'high',
        condition: (analysis) => this.evaluateScreenReader(analysis),
        threshold: 0.8,
        message: 'Screen reader optimization',
        recommendations: [
          'Use semantic HTML elements',
          'Provide proper ARIA labels and descriptions',
          'Implement logical heading hierarchy'
        ]
      },

      'wcag-compliance': {
        category: 'ACCESSIBILITY',
        weight: 0.2,
        priority: 'medium',
        condition: (analysis) => this.evaluateWCAGCompliance(analysis),
        threshold: 0.75,
        message: 'WCAG guideline compliance',
        recommendations: [
          'Address WCAG 2.1 AA requirements',
          'Test with assistive technologies',
          'Provide alternative content formats'
        ]
      },

      // PWA Features Rules
      'manifest': {
        category: 'PWA_FEATURES',
        weight: 0.3,
        priority: 'medium',
        condition: (analysis) => this.evaluateManifest(analysis),
        threshold: 0.7,
        message: 'Web App Manifest implementation',
        recommendations: [
          'Create comprehensive web app manifest',
          'Define app icons and theme colors',
          'Configure display and orientation settings'
        ]
      },

      'service-worker': {
        category: 'PWA_FEATURES',
        weight: 0.3,
        priority: 'medium',
        condition: (analysis) => this.evaluateServiceWorker(analysis),
        threshold: 0.6,
        message: 'Service Worker implementation',
        recommendations: [
          'Implement service worker for caching',
          'Provide offline functionality',
          'Handle network failures gracefully'
        ]
      },

      'installability': {
        category: 'PWA_FEATURES',
        weight: 0.25,
        priority: 'low',
        condition: (analysis) => this.evaluateInstallability(analysis),
        threshold: 0.5,
        message: 'App installability criteria',
        recommendations: [
          'Meet PWA installability requirements',
          'Provide install prompts',
          'Optimize for app-like experience'
        ]
      },

      'offline-support': {
        category: 'PWA_FEATURES',
        weight: 0.15,
        priority: 'low',
        condition: (analysis) => this.evaluateOfflineSupport(analysis),
        threshold: 0.4,
        message: 'Offline functionality support',
        recommendations: [
          'Cache critical resources for offline use',
          'Provide meaningful offline pages',
          'Implement background sync where appropriate'
        ]
      }
    };
  }

  async analyzeWithRules(analysisResults, context = {}) {
    try {
      const ruleResults = {};
      const categoryScores = {};
      const recommendations = [];
      const violations = [];

      // Evaluate each rule
      for (const [ruleId, rule] of Object.entries(this.mobileRules)) {
        const result = await this.evaluateRule(ruleId, rule, analysisResults);
        ruleResults[ruleId] = result;

        // Collect category scores
        if (!categoryScores[rule.category]) {
          categoryScores[rule.category] = { total: 0, weight: 0, count: 0 };
        }
        categoryScores[rule.category].total += result.score * rule.weight;
        categoryScores[rule.category].weight += rule.weight;
        categoryScores[rule.category].count++;

        // Collect recommendations and violations
        if (result.recommendations.length > 0) {
          recommendations.push(...result.recommendations);
        }
        if (!result.passed) {
          violations.push({
            rule: ruleId,
            category: rule.category,
            priority: rule.priority,
            message: rule.message,
            score: result.score,
            threshold: rule.threshold
          });
        }
      }

      // Calculate final scores
      const finalCategoryScores = {};
      for (const [category, data] of Object.entries(categoryScores)) {
        finalCategoryScores[category] = data.weight > 0 ? data.total / data.weight : 0;
      }

      const overallScore = this.calculateOverallScore(finalCategoryScores, context);

      return {
        overallScore,
        categoryScores: finalCategoryScores,
        ruleResults,
        recommendations: this.prioritizeRecommendations(recommendations),
        violations: this.sortViolations(violations),
        insights: this.generateInsights(ruleResults, context),
        metadata: {
          rulesEvaluated: Object.keys(this.mobileRules).length,
          categoriesAnalyzed: Object.keys(this.ruleCategories).length,
          algorithm: this.config.enableAdaptiveScoring ? 'adaptive' : 'weighted',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return this.handleRulesError(error);
    }
  }

  async evaluateRule(ruleId, rule, analysisResults) {
    try {
      const score = rule.condition(analysisResults);
      const passed = score >= rule.threshold;
      
      const result = {
        score,
        passed,
        threshold: rule.threshold,
        category: rule.category,
        priority: rule.priority,
        message: rule.message,
        recommendations: passed ? [] : rule.recommendations.map(rec => ({
          type: 'rule-based',
          priority: rule.priority,
          category: rule.category,
          rule: ruleId,
          recommendation: rec,
          impact: this.calculateImpact(rule.priority, score, rule.threshold)
        }))
      };

      return result;
    } catch (error) {
      return {
        score: 0,
        passed: false,
        error: error.message,
        recommendations: []
      };
    }
  }

  // Rule evaluation methods
  evaluateMobileFirst(analysis) {
    const responsivePatterns = analysis.detectors?.responsive?.patterns || {};
    const mobileFirstPattern = responsivePatterns.mobileFirst;
    return mobileFirstPattern?.detected ? mobileFirstPattern.confidence : 0;
  }

  evaluateFluidLayouts(analysis) {
    const responsivePatterns = analysis.detectors?.responsive?.patterns || {};
    const fluidPattern = responsivePatterns.fluidLayouts;
    return fluidPattern?.detected ? fluidPattern.confidence : 0;
  }

  evaluateBreakpointStrategy(analysis) {
    const heuristics = analysis.heuristics?.responsiveness?.breakpoints;
    return heuristics?.coverage?.score || 0;
  }

  evaluateResponsiveImages(analysis) {
    const images = analysis.heuristics?.responsiveness?.images;
    return images?.responsivePercentage || 0;
  }

  evaluateTouchOptimization(analysis) {
    const touchDetector = analysis.detectors?.touchOptimization;
    if (!touchDetector) return 0;
    
    const scores = [
      touchDetector.targetSizing?.score || 0,
      touchDetector.touchFeedback?.score || 0,
      touchDetector.gestureSupport?.score || 0
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  evaluateNavigationPatterns(analysis) {
    const navDetector = analysis.detectors?.mobileNavigation;
    return navDetector?.patterns?.score || 0;
  }

  evaluateThumbFriendly(analysis) {
    const uxHeuristics = analysis.heuristics?.ux;
    return uxHeuristics?.patterns?.thumbZone?.detected ? 
           uxHeuristics.patterns.thumbZone.confidence : 0;
  }

  evaluateGestureSupport(analysis) {
    const uxHeuristics = analysis.heuristics?.ux;
    return uxHeuristics?.interactions?.gestures?.overallSupport || 0;
  }

  evaluateCoreVitals(analysis) {
    const performance = analysis.detectors?.mobilePerformance?.coreVitals;
    if (!performance) return 0.5;
    
    const scores = [
      performance.lcp?.score || 0,
      performance.fid?.score || 0,
      performance.cls?.score || 0
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  evaluateResourceOptimization(analysis) {
    const performance = analysis.detectors?.mobilePerformance?.resourceOptimization;
    return performance?.score || 0;
  }

  evaluateNetworkEfficiency(analysis) {
    const performance = analysis.detectors?.mobilePerformance?.networkOptimization;
    return performance?.score || 0;
  }

  evaluateBatteryImpact(analysis) {
    const performance = analysis.detectors?.mobilePerformance?.batteryOptimization;
    return performance?.score || 0.7; // Default to good if not available
  }

  evaluateAccessibilityTouchTargets(analysis) {
    const accessibility = analysis.heuristics?.accessibility?.touchTargets;
    return accessibility?.complianceRate || 0;
  }

  evaluateKeyboardAccess(analysis) {
    const accessibility = analysis.heuristics?.accessibility?.keyboard;
    return this.calculateKeyboardScore(accessibility) || 0;
  }

  evaluateScreenReader(analysis) {
    const accessibility = analysis.heuristics?.accessibility?.screenReader;
    return this.calculateScreenReaderScore(accessibility) || 0;
  }

  evaluateWCAGCompliance(analysis) {
    const accessibility = analysis.heuristics?.accessibility?.wcagCompliance;
    return accessibility?.score || 0;
  }

  evaluateManifest(analysis) {
    const pwaDetector = analysis.detectors?.pwa?.manifest;
    return pwaDetector?.completeness || 0;
  }

  evaluateServiceWorker(analysis) {
    const pwaDetector = analysis.detectors?.pwa?.serviceWorker;
    return pwaDetector?.implementation || 0;
  }

  evaluateInstallability(analysis) {
    const pwaDetector = analysis.detectors?.pwa?.installability;
    return pwaDetector?.criteria || 0;
  }

  evaluateOfflineSupport(analysis) {
    const pwaDetector = analysis.detectors?.pwa?.offlineSupport;
    return pwaDetector?.coverage || 0;
  }

  // Scoring algorithms
  calculateWeightedScore(categoryScores) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [category, weight] of Object.entries(this.ruleCategories)) {
      if (categoryScores[category] !== undefined) {
        totalScore += categoryScores[category] * weight.weight;
        totalWeight += weight.weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  calculateExponentialScore(categoryScores) {
    const weightedScore = this.calculateWeightedScore(categoryScores);
    // Apply exponential curve to penalize low scores more heavily
    return Math.pow(weightedScore, 1.5);
  }

  calculateLogarithmicScore(categoryScores) {
    const weightedScore = this.calculateWeightedScore(categoryScores);
    // Apply logarithmic curve to be more forgiving of low scores
    return Math.log(1 + weightedScore) / Math.log(2);
  }

  calculateAdaptiveScore(categoryScores, context = {}) {
    const baseScore = this.calculateWeightedScore(categoryScores);
    
    // Adaptive adjustments based on context
    let adjustmentFactor = 1.0;
    
    // Boost performance if mobile-first site
    if (context.isMobileFirst && categoryScores.PERFORMANCE > 0.8) {
      adjustmentFactor *= 1.1;
    }
    
    // Penalize if accessibility is very poor
    if (categoryScores.ACCESSIBILITY < 0.5) {
      adjustmentFactor *= 0.9;
    }
    
    // Boost if PWA features are well implemented
    if (categoryScores.PWA_FEATURES > 0.7) {
      adjustmentFactor *= 1.05;
    }
    
    return Math.min(1, baseScore * adjustmentFactor);
  }

  calculateContextualScore(categoryScores, context = {}) {
    // Weight categories differently based on context
    const contextualWeights = { ...this.ruleCategories };
    
    if (context.prioritizeAccessibility) {
      contextualWeights.ACCESSIBILITY.weight *= 1.5;
    }
    
    if (context.prioritizePerformance) {
      contextualWeights.PERFORMANCE.weight *= 1.5;
    }
    
    // Normalize weights
    const totalWeight = Object.values(contextualWeights).reduce((sum, cat) => sum + cat.weight, 0);
    for (const category of Object.values(contextualWeights)) {
      category.weight = category.weight / totalWeight;
    }
    
    return this.calculateWeightedScore(categoryScores);
  }

  calculateOverallScore(categoryScores, context = {}) {
    const algorithm = context.scoringAlgorithm || 
                     (this.config.enableAdaptiveScoring ? 'adaptive' : 'weighted');
    
    const scoringMethod = this.scoringAlgorithms[algorithm] || this.scoringAlgorithms.weighted;
    return scoringMethod(categoryScores, context);
  }

  calculateImpact(priority, score, threshold) {
    const gap = threshold - score;
    
    if (priority === 'high' && gap > 0.3) return 'high';
    if (priority === 'high' || gap > 0.4) return 'medium';
    return 'low';
  }

  prioritizeRecommendations(recommendations) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return recommendations.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by impact
      const impactDiff = priorityOrder[a.impact] - priorityOrder[b.impact];
      return impactDiff;
    });
  }

  sortViolations(violations) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return violations.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by score gap (larger gaps first)
      const gapA = a.threshold - a.score;
      const gapB = b.threshold - b.score;
      return gapB - gapA;
    });
  }

  generateInsights(ruleResults, context = {}) {
    const insights = [];
    
    // Performance insights
    const performanceRules = Object.entries(ruleResults).filter(([id, result]) => 
      this.mobileRules[id].category === 'PERFORMANCE'
    );
    
    const avgPerformanceScore = performanceRules.reduce((sum, [, result]) => 
      sum + result.score, 0) / performanceRules.length;
    
    if (avgPerformanceScore < 0.6) {
      insights.push({
        type: 'performance',
        severity: 'high',
        message: 'Mobile performance needs significant improvement',
        suggestion: 'Focus on Core Web Vitals optimization and resource efficiency'
      });
    }
    
    // Accessibility insights
    const accessibilityRules = Object.entries(ruleResults).filter(([id, result]) => 
      this.mobileRules[id].category === 'ACCESSIBILITY'
    );
    
    const avgAccessibilityScore = accessibilityRules.reduce((sum, [, result]) => 
      sum + result.score, 0) / accessibilityRules.length;
    
    if (avgAccessibilityScore < 0.7) {
      insights.push({
        type: 'accessibility',
        severity: 'high',
        message: 'Mobile accessibility compliance is below standards',
        suggestion: 'Address touch target sizing and keyboard navigation issues'
      });
    }
    
    // Mobile UX insights
    const uxRules = Object.entries(ruleResults).filter(([id, result]) => 
      this.mobileRules[id].category === 'MOBILE_UX'
    );
    
    const avgUXScore = uxRules.reduce((sum, [, result]) => 
      sum + result.score, 0) / uxRules.length;
    
    if (avgUXScore > 0.8) {
      insights.push({
        type: 'ux',
        severity: 'info',
        message: 'Excellent mobile user experience detected',
        suggestion: 'Consider implementing PWA features for enhanced mobile experience'
      });
    }
    
    return insights;
  }

  // Utility methods
  calculateKeyboardScore(keyboard) {
    if (!keyboard) return 0;
    
    const scores = [
      keyboard.focusable?.total > 0 ? 0.8 : 0.2,
      keyboard.navigation?.skipLinks ? 1 : 0.5,
      keyboard.navigation?.hasKeyboardTraps ? 0 : 1
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateScreenReaderScore(screenReader) {
    if (!screenReader) return 0;
    
    const scores = [
      screenReader.landmarks?.hasMain && screenReader.landmarks?.hasNav ? 1 : 0.5,
      screenReader.headings?.hasH1 && screenReader.headings?.logicalOrder ? 1 : 0.6,
      screenReader.labels?.labelingRate || 0,
      screenReader.imageAlt?.complianceRate || 0
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  handleRulesError(error) {
    return {
      overallScore: 0,
      categoryScores: {},
      ruleResults: {},
      recommendations: [],
      violations: [],
      insights: [],
      error: error.message,
      metadata: {
        rulesEvaluated: 0,
        categoriesAnalyzed: 0,
        algorithm: 'error',
        timestamp: new Date().toISOString()
      }
    };
  }
}
