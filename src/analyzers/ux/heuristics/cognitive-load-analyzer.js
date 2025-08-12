/**
 * Cognitive Load Analyzer - GPT-5 Style Heuristic Component
 * 
 * Analyzes cognitive load and mental effort required for users.
 */
export class CognitiveLoadAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  analyze(detectionResults, context) {
    const loadMetrics = {
      informationDensity: this._analyzeInformationDensity(detectionResults),
      visualComplexity: this._analyzeVisualComplexity(detectionResults),
      interactionComplexity: this._analyzeInteractionComplexity(detectionResults),
      decisionLoad: this._analyzeDecisionLoad(detectionResults)
    };

    const overallScore = this._calculateCognitiveLoadScore(loadMetrics);

    return {
      score: overallScore,
      metrics: loadMetrics,
      findings: this._generateCognitiveLoadFindings(loadMetrics),
      recommendations: this._generateCognitiveLoadRecommendations(loadMetrics),
      cognitiveLoadLevel: this._assessCognitiveLoadLevel(overallScore)
    };
  }

  _analyzeInformationDensity(detectionResults) {
    const content = detectionResults.content || {};
    const interaction = detectionResults.interaction || {};
    
    let densityScore = 100;
    
    // Text density analysis
    if (content.content?.text) {
      const { wordCount, characterCount, paragraphs } = content.content.text;
      const wordsPerParagraph = paragraphs > 0 ? wordCount / paragraphs : 0;
      
      // Penalize high word density
      if (wordsPerParagraph > 100) {
        densityScore -= 20;
      } else if (wordsPerParagraph > 50) {
        densityScore -= 10;
      }
    }
    
    // Interactive element density
    const totalInteractive = interaction.analysis?.totalInteractiveElements || 0;
    if (totalInteractive > 50) {
      densityScore -= 15;
    } else if (totalInteractive > 30) {
      densityScore -= 10;
    }
    
    // Heading structure helps reduce cognitive load
    if (content.content?.headings?.length > 0) {
      densityScore += 10;
    }
    
    return {
      score: Math.max(densityScore, 0),
      wordDensity: content.content?.text?.wordCount || 0,
      interactiveDensity: totalInteractive,
      hasGoodStructure: content.content?.headings?.length > 0
    };
  }

  _analyzeVisualComplexity(detectionResults) {
    const content = detectionResults.content || {};
    const interaction = detectionResults.interaction || {};
    const navigation = detectionResults.navigation || {};
    
    let complexityScore = 100;
    
    // Image complexity
    const imageCount = content.content?.images?.length || 0;
    if (imageCount > 20) {
      complexityScore -= 15;
    } else if (imageCount > 10) {
      complexityScore -= 5;
    }
    
    // Navigation complexity
    const navComplexity = navigation.analysis?.navigationComplexity;
    if (navComplexity) {
      if (navComplexity.totalItems > 20) {
        complexityScore -= 20;
      } else if (navComplexity.totalItems > 10) {
        complexityScore -= 10;
      }
    }
    
    // Button variety (too many different button types increase complexity)
    const buttons = interaction.elements?.buttons || [];
    const buttonTypes = new Set(buttons.map(btn => btn.type));
    if (buttonTypes.size > 5) {
      complexityScore -= 10;
    }
    
    return {
      score: Math.max(complexityScore, 0),
      imageComplexity: imageCount,
      navigationComplexity: navComplexity?.totalItems || 0,
      buttonTypeVariety: buttonTypes.size
    };
  }

  _analyzeInteractionComplexity(detectionResults) {
    const interaction = detectionResults.interaction || {};
    const form = detectionResults.form || {};
    const navigation = detectionResults.navigation || {};
    
    let complexityScore = 100;
    
    // Form complexity
    if (form.forms?.length > 0) {
      const avgFormInputs = form.forms.reduce((sum, f) => sum + f.inputs, 0) / form.forms.length;
      if (avgFormInputs > 10) {
        complexityScore -= 25;
      } else if (avgFormInputs > 5) {
        complexityScore -= 10;
      }
    }
    
    // Navigation depth complexity
    const navDepth = navigation.analysis?.navigationDepth || 0;
    if (navDepth > 4) {
      complexityScore -= 20;
    } else if (navDepth > 3) {
      complexityScore -= 10;
    }
    
    // Interaction pattern complexity
    const patterns = interaction.analysis?.interactionPatterns;
    if (patterns?.buttonToLinkRatio > 2 || patterns?.buttonToLinkRatio < 0.5) {
      complexityScore -= 10; // Unbalanced interaction types
    }
    
    return {
      score: Math.max(complexityScore, 0),
      formComplexity: form.forms?.length || 0,
      navigationDepth: navDepth,
      interactionBalance: patterns?.buttonToLinkRatio || 0
    };
  }

  _analyzeDecisionLoad(detectionResults) {
    const interaction = detectionResults.interaction || {};
    const navigation = detectionResults.navigation || {};
    
    let decisionScore = 100;
    
    // Too many choices increase decision load
    const navItems = navigation.navigation?.primary?.elements?.length || 0;
    if (navItems > 9) { // Miller's rule: 7±2
      decisionScore -= 20;
    } else if (navItems > 7) {
      decisionScore -= 10;
    }
    
    // Multiple similar buttons create decision paralysis
    const buttons = interaction.elements?.buttons || [];
    const primaryButtons = buttons.filter(btn => 
      /primary|main|buy|purchase|subscribe/i.test(btn.text) || btn.type === 'submit'
    );
    
    if (primaryButtons.length > 3) {
      decisionScore -= 15;
    } else if (primaryButtons.length === 0) {
      decisionScore -= 10; // No clear primary action
    }
    
    // Clear hierarchical navigation reduces decision load
    if (navigation.navigation?.breadcrumbs?.found) {
      decisionScore += 10;
    }
    
    return {
      score: Math.max(decisionScore, 0),
      navigationChoices: navItems,
      primaryActionChoices: primaryButtons.length,
      hasClearHierarchy: navigation.navigation?.breadcrumbs?.found || false
    };
  }

  _calculateCognitiveLoadScore(metrics) {
    const weights = {
      informationDensity: 0.3,
      visualComplexity: 0.25,
      interactionComplexity: 0.25,
      decisionLoad: 0.2
    };
    
    let totalScore = 0;
    totalScore += metrics.informationDensity.score * weights.informationDensity;
    totalScore += metrics.visualComplexity.score * weights.visualComplexity;
    totalScore += metrics.interactionComplexity.score * weights.interactionComplexity;
    totalScore += metrics.decisionLoad.score * weights.decisionLoad;
    
    return Math.round(totalScore);
  }

  _generateCognitiveLoadFindings(metrics) {
    const findings = [];
    
    if (metrics.informationDensity.score < 60) {
      findings.push({
        category: 'cognitive_load',
        severity: 'medium',
        message: 'High information density may overwhelm users',
        metric: 'informationDensity'
      });
    }
    
    if (metrics.decisionLoad.score < 60) {
      findings.push({
        category: 'cognitive_load',
        severity: 'medium',
        message: 'Too many choices may cause decision paralysis',
        metric: 'decisionLoad'
      });
    }
    
    if (metrics.interactionComplexity.score < 50) {
      findings.push({
        category: 'cognitive_load',
        severity: 'high',
        message: 'Complex interactions require high mental effort',
        metric: 'interactionComplexity'
      });
    }
    
    return findings;
  }

  _generateCognitiveLoadRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.informationDensity.score < 70) {
      recommendations.push({
        category: 'cognitive_load',
        priority: 'medium',
        title: 'Reduce information density',
        description: 'Break up content into smaller chunks and use better formatting',
        metric: 'informationDensity'
      });
    }
    
    if (metrics.decisionLoad.score < 70) {
      recommendations.push({
        category: 'cognitive_load',
        priority: 'high',
        title: 'Simplify decision making',
        description: 'Reduce the number of choices and highlight primary actions',
        metric: 'decisionLoad'
      });
    }
    
    if (metrics.visualComplexity.score < 70) {
      recommendations.push({
        category: 'cognitive_load',
        priority: 'medium',
        title: 'Reduce visual complexity',
        description: 'Simplify the interface and reduce visual clutter',
        metric: 'visualComplexity'
      });
    }
    
    return recommendations;
  }

  _assessCognitiveLoadLevel(score) {
    if (score >= 85) return 'Low'; // Low cognitive load is good
    if (score >= 70) return 'Moderate';
    if (score >= 55) return 'High';
    return 'Very High';
  }
}
