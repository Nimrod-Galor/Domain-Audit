/**
 * Mobile UX Analyzer - Claude AI Style Heuristic Analysis
 * 
 * Advanced mobile user experience pattern analysis with sophisticated
 * heuristic evaluation of mobile-specific UX principles and patterns.
 */

export class MobileUXAnalyzer {
  constructor(config = {}) {
    this.config = {
      strictMode: false,
      includeAdvanced: true,
      scoreThreshold: 0.7,
      ...config
    };

    this.uxPatterns = {
      thumbZone: {
        pattern: /bottom.*nav|nav.*bottom|thumb.*friendly/i,
        weight: 0.25,
        description: 'Thumb-zone accessible navigation'
      },
      touchFeedback: {
        pattern: /:active|:hover|transition.*transform|ripple|feedback/i,
        weight: 0.2,
        description: 'Visual touch feedback mechanisms'
      },
      swipeGestures: {
        pattern: /swipe|gesture|touch.*move|pan.*gesture/i,
        weight: 0.15,
        description: 'Swipe gesture support'
      },
      loadingStates: {
        pattern: /loading|spinner|skeleton|progressive/i,
        weight: 0.2,
        description: 'Progressive loading indicators'
      },
      errorHandling: {
        pattern: /error.*state|fallback|retry|offline.*mode/i,
        weight: 0.2,
        description: 'Graceful error handling'
      }
    };

    this.uxHeuristics = {
      consistency: 'Interface consistency across screens',
      feedback: 'Immediate visual feedback for interactions',
      simplicity: 'Simplified navigation and content hierarchy',
      context: 'Context-aware content presentation',
      efficiency: 'Efficient task completion paths'
    };
  }

  async analyze(document, context = {}) {
    try {
      const analysis = {
        patterns: await this.analyzeUXPatterns(document),
        heuristics: await this.evaluateUXHeuristics(document),
        interactions: await this.analyzeInteractionPatterns(document),
        navigation: await this.analyzeNavigationUX(document),
        content: await this.analyzeContentUX(document),
        score: 0,
        recommendations: []
      };

      analysis.score = this.calculateUXScore(analysis);
      analysis.recommendations = this.generateUXRecommendations(analysis);

      return {
        category: 'Mobile UX Analysis',
        subcategory: 'User Experience Heuristics',
        ...analysis,
        metadata: {
          analyzer: 'MobileUXAnalyzer',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleAnalysisError(error);
    }
  }

  async analyzeUXPatterns(document) {
    const patterns = {};
    const content = document.documentElement.outerHTML;
    const styles = this.extractStyleContent(document);

    for (const [patternName, config] of Object.entries(this.uxPatterns)) {
      patterns[patternName] = {
        detected: config.pattern.test(content) || config.pattern.test(styles),
        confidence: this.calculatePatternConfidence(patternName, document),
        implementation: this.analyzePatternImplementation(patternName, document),
        weight: config.weight,
        description: config.description
      };
    }

    return patterns;
  }

  async evaluateUXHeuristics(document) {
    const heuristics = {};

    for (const [heuristic, description] of Object.entries(this.uxHeuristics)) {
      heuristics[heuristic] = {
        score: await this.evaluateHeuristic(heuristic, document),
        description,
        findings: await this.getHeuristicFindings(heuristic, document),
        priority: this.getHeuristicPriority(heuristic)
      };
    }

    return heuristics;
  }

  async analyzeInteractionPatterns(document) {
    const interactions = {
      touchTargets: this.analyzeTouchTargets(document),
      gestures: this.analyzeGestureSupport(document),
      feedback: this.analyzeFeedbackMechanisms(document),
      transitions: this.analyzeTransitions(document)
    };

    return interactions;
  }

  async analyzeNavigationUX(document) {
    const navigation = {
      structure: this.analyzeNavigationStructure(document),
      accessibility: this.analyzeNavigationAccessibility(document),
      efficiency: this.analyzeNavigationEfficiency(document),
      thumbFriendly: this.analyzeThumbFriendliness(document)
    };

    return navigation;
  }

  async analyzeContentUX(document) {
    const content = {
      hierarchy: this.analyzeContentHierarchy(document),
      readability: this.analyzeContentReadability(document),
      scannability: this.analyzeContentScannability(document),
      priority: this.analyzeContentPriority(document)
    };

    return content;
  }

  analyzeTouchTargets(document) {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"]');
    const issues = [];
    let compliantTargets = 0;

    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // WCAG recommended minimum
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push({
          element: element.tagName.toLowerCase(),
          size: { width: rect.width, height: rect.height },
          selector: this.generateSelector(element),
          severity: 'high'
        });
      } else {
        compliantTargets++;
      }
    });

    return {
      total: interactiveElements.length,
      compliant: compliantTargets,
      complianceRate: interactiveElements.length > 0 ? compliantTargets / interactiveElements.length : 1,
      issues,
      recommendation: issues.length > 0 ? 'Increase touch target sizes to minimum 44px' : 'Touch targets meet accessibility guidelines'
    };
  }

  analyzeGestureSupport(document) {
    const content = document.documentElement.outerHTML;
    const styles = this.extractStyleContent(document);
    
    const gestureIndicators = [
      /touch.*action|user.*select.*none/i,
      /swipe|pan|pinch|zoom/i,
      /gesture|touch.*move/i,
      /overflow.*scroll|scrollable/i
    ];

    const support = gestureIndicators.map(pattern => 
      pattern.test(content) || pattern.test(styles)
    );

    return {
      touchAction: support[0],
      swipeGestures: support[1],
      customGestures: support[2],
      scrollOptimization: support[3],
      overallSupport: support.filter(Boolean).length / support.length,
      recommendation: this.getGestureRecommendation(support)
    };
  }

  analyzeFeedbackMechanisms(document) {
    const styles = this.extractStyleContent(document);
    const feedbackPatterns = {
      hover: /:hover/g,
      active: /:active/g,
      focus: /:focus/g,
      transition: /transition/g,
      transform: /transform/g
    };

    const feedback = {};
    for (const [type, pattern] of Object.entries(feedbackPatterns)) {
      const matches = styles.match(pattern) || [];
      feedback[type] = {
        count: matches.length,
        present: matches.length > 0
      };
    }

    const overallScore = Object.values(feedback).filter(f => f.present).length / Object.keys(feedback).length;

    return {
      ...feedback,
      overallScore,
      recommendation: overallScore < 0.6 ? 'Add more visual feedback for user interactions' : 'Good feedback implementation detected'
    };
  }

  analyzeTransitions(document) {
    const styles = this.extractStyleContent(document);
    const transitionPatterns = [
      /transition.*duration/i,
      /animation.*duration/i,
      /ease.*in.*out|ease|linear/i,
      /transform.*translate|scale|rotate/i
    ];

    const transitions = transitionPatterns.map(pattern => pattern.test(styles));
    const score = transitions.filter(Boolean).length / transitions.length;

    return {
      duration: transitions[0],
      animations: transitions[1],
      easing: transitions[2],
      transforms: transitions[3],
      score,
      recommendation: score < 0.5 ? 'Implement smooth transitions for better UX' : 'Good transition implementation'
    };
  }

  async evaluateHeuristic(heuristic, document) {
    const evaluators = {
      consistency: () => this.evaluateConsistency(document),
      feedback: () => this.evaluateFeedback(document),
      simplicity: () => this.evaluateSimplicity(document),
      context: () => this.evaluateContext(document),
      efficiency: () => this.evaluateEfficiency(document)
    };

    return evaluators[heuristic] ? evaluators[heuristic]() : 0.5;
  }

  evaluateConsistency(document) {
    // Analyze consistency in navigation, styling, and interaction patterns
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    const buttons = document.querySelectorAll('button, .button, [role="button"]');
    
    let consistencyScore = 0.8; // Base score
    
    // Check navigation consistency
    if (navElements.length > 1) {
      const navStyles = Array.from(navElements).map(nav => this.getElementStyles(nav));
      const consistency = this.calculateStyleConsistency(navStyles);
      consistencyScore *= consistency;
    }

    return Math.max(0, Math.min(1, consistencyScore));
  }

  evaluateFeedback(document) {
    const interactiveElements = document.querySelectorAll('button, a, input, [onclick]');
    const styles = this.extractStyleContent(document);
    
    const feedbackIndicators = [
      /:hover/.test(styles),
      /:active/.test(styles),
      /:focus/.test(styles),
      /transition/.test(styles)
    ];

    return feedbackIndicators.filter(Boolean).length / feedbackIndicators.length;
  }

  evaluateSimplicity(document) {
    const navItems = document.querySelectorAll('nav a, nav button, .nav-item');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Penalize excessive navigation items and complex hierarchies
    const navComplexity = navItems.length > 7 ? 0.6 : 0.9;
    const headingComplexity = headings.length > 10 ? 0.7 : 0.9;
    
    return (navComplexity + headingComplexity) / 2;
  }

  evaluateContext(document) {
    // Look for context-aware features
    const contextIndicators = [
      document.querySelector('[data-current], .current, .active'),
      document.querySelector('breadcrumb, .breadcrumb'),
      document.querySelector('.location, .path'),
      document.querySelector('progress, .progress')
    ];

    return contextIndicators.filter(Boolean).length / contextIndicators.length;
  }

  evaluateEfficiency(document) {
    // Analyze task completion efficiency
    const forms = document.querySelectorAll('form');
    const shortcuts = document.querySelectorAll('[accesskey], .shortcut');
    const quickActions = document.querySelectorAll('.quick-action, .cta, [data-action]');
    
    let efficiencyScore = 0.5;
    
    if (forms.length > 0) {
      const avgFormComplexity = Array.from(forms).reduce((acc, form) => {
        const fields = form.querySelectorAll('input, select, textarea');
        return acc + fields.length;
      }, 0) / forms.length;
      
      efficiencyScore += avgFormComplexity <= 5 ? 0.2 : 0.1;
    }
    
    if (shortcuts.length > 0) efficiencyScore += 0.15;
    if (quickActions.length > 0) efficiencyScore += 0.15;
    
    return Math.min(1, efficiencyScore);
  }

  calculateUXScore(analysis) {
    const patternScore = this.calculatePatternScore(analysis.patterns);
    const heuristicScore = this.calculateHeuristicScore(analysis.heuristics);
    const interactionScore = this.calculateInteractionScore(analysis.interactions);
    
    return (patternScore * 0.4 + heuristicScore * 0.4 + interactionScore * 0.2);
  }

  calculatePatternScore(patterns) {
    let totalWeight = 0;
    let weightedScore = 0;

    for (const pattern of Object.values(patterns)) {
      totalWeight += pattern.weight;
      weightedScore += pattern.detected ? pattern.confidence * pattern.weight : 0;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  calculateHeuristicScore(heuristics) {
    const scores = Object.values(heuristics).map(h => h.score);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  calculateInteractionScore(interactions) {
    const scores = [
      interactions.touchTargets.complianceRate,
      interactions.gestures.overallSupport,
      interactions.feedback.overallScore,
      interactions.transitions.score
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  generateUXRecommendations(analysis) {
    const recommendations = [];

    // Pattern-based recommendations
    for (const [patternName, pattern] of Object.entries(analysis.patterns)) {
      if (!pattern.detected) {
        recommendations.push({
          type: 'pattern',
          priority: 'medium',
          category: 'UX Pattern',
          issue: `Missing ${pattern.description}`,
          recommendation: this.getPatternRecommendation(patternName),
          impact: 'medium'
        });
      }
    }

    // Touch target recommendations
    if (analysis.interactions.touchTargets.complianceRate < 0.8) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        category: 'Touch Targets',
        issue: 'Touch targets below recommended size',
        recommendation: 'Increase touch target sizes to minimum 44x44px',
        impact: 'high'
      });
    }

    // Feedback recommendations
    if (analysis.interactions.feedback.overallScore < 0.6) {
      recommendations.push({
        type: 'interaction',
        priority: 'medium',
        category: 'User Feedback',
        issue: 'Limited visual feedback for interactions',
        recommendation: 'Add hover, active, and focus states for interactive elements',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  // Utility methods
  extractStyleContent(document) {
    const styles = document.querySelectorAll('style');
    return Array.from(styles).map(style => style.textContent).join('\n');
  }

  calculatePatternConfidence(patternName, document) {
    // Calculate confidence based on multiple indicators
    return 0.8; // Simplified for now
  }

  analyzePatternImplementation(patternName, document) {
    return 'detected'; // Simplified for now
  }

  async getHeuristicFindings(heuristic, document) {
    return []; // Simplified for now
  }

  getHeuristicPriority(heuristic) {
    const priorities = {
      consistency: 'high',
      feedback: 'high',
      simplicity: 'medium',
      context: 'medium',
      efficiency: 'low'
    };
    return priorities[heuristic] || 'medium';
  }

  generateSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  getGestureRecommendation(support) {
    const supportLevel = support.filter(Boolean).length / support.length;
    if (supportLevel < 0.5) return 'Implement touch gesture support for better mobile UX';
    if (supportLevel < 0.8) return 'Enhance gesture support for optimal mobile experience';
    return 'Good gesture support implementation';
  }

  getElementStyles(element) {
    return window.getComputedStyle ? window.getComputedStyle(element) : {};
  }

  calculateStyleConsistency(styles) {
    return 0.8; // Simplified calculation
  }

  getPatternRecommendation(patternName) {
    const recommendations = {
      thumbZone: 'Implement bottom navigation or ensure important controls are within thumb reach',
      touchFeedback: 'Add visual feedback for touch interactions (ripple effects, state changes)',
      swipeGestures: 'Implement swipe gestures for navigation and content interaction',
      loadingStates: 'Add loading indicators and skeleton screens for better perceived performance',
      errorHandling: 'Implement graceful error handling with retry mechanisms'
    };
    return recommendations[patternName] || 'Implement this UX pattern for better mobile experience';
  }

  handleAnalysisError(error) {
    return {
      category: 'Mobile UX Analysis',
      subcategory: 'Analysis Error',
      error: error.message,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Analysis failed',
        recommendation: 'Review mobile UX implementation'
      }]
    };
  }
}
