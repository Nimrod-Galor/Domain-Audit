/**
 * Usability Analyzer - GPT-5 Style Heuristic Component
 * 
 * Analyzes usability based on detection results using established UX heuristics.
 */
export class UsabilityAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.heuristics = {
      visibility: { weight: 0.2 },
      userControl: { weight: 0.15 },
      consistency: { weight: 0.15 },
      errorPrevention: { weight: 0.15 },
      recognition: { weight: 0.1 },
      flexibility: { weight: 0.1 },
      aesthetics: { weight: 0.1 },
      help: { weight: 0.05 }
    };
  }

  analyze(detectionResults, context) {
    const usabilityMetrics = {
      visibility: this._analyzeVisibility(detectionResults),
      userControl: this._analyzeUserControl(detectionResults),
      consistency: this._analyzeConsistency(detectionResults),
      errorPrevention: this._analyzeErrorPrevention(detectionResults),
      recognition: this._analyzeRecognition(detectionResults),
      flexibility: this._analyzeFlexibility(detectionResults),
      aesthetics: this._analyzeAesthetics(detectionResults),
      help: this._analyzeHelp(detectionResults)
    };

    const overallScore = this._calculateOverallUsabilityScore(usabilityMetrics);

    return {
      score: overallScore,
      metrics: usabilityMetrics,
      findings: this._generateUsabilityFindings(usabilityMetrics),
      recommendations: this._generateUsabilityRecommendations(usabilityMetrics),
      grade: this._getUsabilityGrade(overallScore)
    };
  }

  _analyzeVisibility(detectionResults) {
    const interaction = detectionResults.interaction || {};
    const navigation = detectionResults.navigation || {};
    
    let score = 50; // Base score
    
    // Check for clear navigation
    if (navigation.navigation?.primary?.elements?.length > 0) {
      score += 15;
    }
    
    // Check for accessible interactive elements
    if (interaction.analysis?.accessibilityFeatures) {
      const accessFeatures = interaction.analysis.accessibilityFeatures;
      score += Math.min((accessFeatures.ariaLabels + accessFeatures.altTexts) * 2, 20);
    }
    
    // Check for clear feedback elements
    if (interaction.elements?.buttons?.length > 0) {
      const visibleButtons = interaction.elements.buttons.filter(btn => btn.visible);
      score += Math.min(visibleButtons.length * 2, 15);
    }
    
    return Math.min(score, 100);
  }

  _analyzeUserControl(detectionResults) {
    const interaction = detectionResults.interaction || {};
    const navigation = detectionResults.navigation || {};
    
    let score = 40; // Base score
    
    // Check for navigation controls
    if (navigation.navigation?.breadcrumbs?.found) {
      score += 15;
    }
    
    // Check for search functionality
    if (navigation.analysis?.searchFunctionality?.found) {
      score += 20;
    }
    
    // Check for interactive elements that give user control
    if (interaction.analysis?.interactionPatterns) {
      const patterns = interaction.analysis.interactionPatterns;
      if (patterns.primaryActions?.length > 0) {
        score += 15;
      }
      if (patterns.secondaryActions?.length > 0) {
        score += 10;
      }
    }
    
    return Math.min(score, 100);
  }

  _analyzeConsistency(detectionResults) {
    const interaction = detectionResults.interaction || {};
    const navigation = detectionResults.navigation || {};
    
    let score = 60; // Base score for minimal consistency
    
    // Check navigation consistency
    if (navigation.navigation?.primary?.structure) {
      const structure = navigation.navigation.primary.structure;
      if (structure.listBased) score += 10;
      if (structure.levels <= 3) score += 10; // Not too deep
    }
    
    // Check button consistency
    if (interaction.elements?.buttons?.length > 1) {
      const buttons = interaction.elements.buttons;
      const consistentSizing = this._checkConsistentSizing(buttons);
      if (consistentSizing) score += 15;
    }
    
    // Check link consistency
    if (interaction.elements?.links?.length > 0) {
      const links = interaction.elements.links;
      const consistentStyling = this._checkConsistentLinkStyling(links);
      if (consistentStyling) score += 5;
    }
    
    return Math.min(score, 100);
  }

  _analyzeErrorPrevention(detectionResults) {
    const form = detectionResults.form || {};
    const interaction = detectionResults.interaction || {};
    
    let score = 70; // Base score
    
    // Check form validation
    if (form.forms?.length > 0) {
      const formsWithValidation = form.forms.filter(f => f.validation?.hasValidation);
      if (formsWithValidation.length > 0) {
        score += 20;
      } else {
        score -= 20; // Penalty for forms without validation
      }
    }
    
    // Check for required field indicators
    if (form.forms?.some(f => f.required > 0)) {
      score += 10;
    }
    
    return Math.max(0, Math.min(score, 100));
  }

  _analyzeRecognition(detectionResults) {
    const content = detectionResults.content || {};
    const interaction = detectionResults.interaction || {};
    
    let score = 50; // Base score
    
    // Check for clear content structure
    if (content.content?.headings?.length > 0) {
      score += 20;
    }
    
    // Check for recognizable interactive elements
    if (interaction.elements?.buttons?.length > 0) {
      const buttonsWithText = interaction.elements.buttons.filter(btn => btn.text);
      score += Math.min(buttonsWithText.length * 5, 20);
    }
    
    // Check for alt text on images
    if (content.content?.images?.length > 0) {
      const imagesWithAlt = content.content.images.filter(img => img.hasAlt);
      const altPercentage = (imagesWithAlt.length / content.content.images.length) * 100;
      score += Math.min(altPercentage / 5, 10);
    }
    
    return Math.min(score, 100);
  }

  _analyzeFlexibility(detectionResults) {
    const navigation = detectionResults.navigation || {};
    const interaction = detectionResults.interaction || {};
    
    let score = 60; // Base score
    
    // Check for multiple navigation paths
    if (navigation.navigation?.secondary?.elements?.length > 0) {
      score += 15;
    }
    
    // Check for search functionality
    if (navigation.analysis?.searchFunctionality?.found) {
      score += 15;
    }
    
    // Check for keyboard navigation
    if (navigation.analysis?.accessibilityFeatures?.keyboardNavigation) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  _analyzeAesthetics(detectionResults) {
    const content = detectionResults.content || {};
    const interaction = detectionResults.interaction || {};
    
    let score = 70; // Base aesthetic score
    
    // Check content organization
    if (content.content?.headings?.length > 0) {
      const headingStructure = this._analyzeHeadingStructure(content.content.headings);
      if (headingStructure.isWellStructured) {
        score += 15;
      }
    }
    
    // Check visual hierarchy in buttons
    if (interaction.elements?.buttons?.length > 0) {
      const hasVisualHierarchy = this._checkButtonHierarchy(interaction.elements.buttons);
      if (hasVisualHierarchy) {
        score += 10;
      }
    }
    
    // Check for consistent spacing
    const hasConsistentSpacing = this._checkConsistentSpacing(detectionResults);
    if (hasConsistentSpacing) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }

  _analyzeHelp(detectionResults) {
    const navigation = detectionResults.navigation || {};
    const content = detectionResults.content || {};
    const trustSignal = detectionResults.trustSignal || {};
    
    let score = 50; // Base score
    
    // Check for help links
    if (navigation.navigation?.primary?.elements?.some(item => 
      /help|support|faq|contact/i.test(item.text))) {
      score += 25;
    }
    
    // Check for contact information
    if (trustSignal.signals?.contact?.found) {
      score += 20;
    }
    
    // Check for error help
    if (content.content?.text?.wordCount > 0) {
      score += 5; // Basic content availability
    }
    
    return Math.min(score, 100);
  }

  _calculateOverallUsabilityScore(metrics) {
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [heuristic, weight] of Object.entries(this.heuristics)) {
      if (metrics[heuristic] !== undefined) {
        totalScore += metrics[heuristic] * weight.weight;
        totalWeight += weight.weight;
      }
    }
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  _generateUsabilityFindings(metrics) {
    const findings = [];
    
    Object.entries(metrics).forEach(([heuristic, score]) => {
      if (score < 60) {
        findings.push({
          category: 'usability',
          heuristic,
          severity: score < 40 ? 'high' : 'medium',
          message: `${heuristic} needs improvement (score: ${score}/100)`,
          score
        });
      } else if (score >= 85) {
        findings.push({
          category: 'usability',
          heuristic,
          severity: 'positive',
          message: `Excellent ${heuristic} implementation (score: ${score}/100)`,
          score
        });
      }
    });
    
    return findings;
  }

  _generateUsabilityRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.visibility < 70) {
      recommendations.push({
        category: 'usability',
        priority: 'high',
        title: 'Improve system status visibility',
        description: 'Add clear feedback for user actions and system state',
        heuristic: 'visibility'
      });
    }
    
    if (metrics.userControl < 70) {
      recommendations.push({
        category: 'usability',
        priority: 'high',
        title: 'Enhance user control and freedom',
        description: 'Provide clear navigation paths and user control options',
        heuristic: 'userControl'
      });
    }
    
    if (metrics.errorPrevention < 70) {
      recommendations.push({
        category: 'usability',
        priority: 'medium',
        title: 'Implement error prevention measures',
        description: 'Add form validation and clear error messages',
        heuristic: 'errorPrevention'
      });
    }
    
    return recommendations;
  }

  _getUsabilityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  }

  // Helper methods
  _checkConsistentSizing(buttons) {
    if (buttons.length < 2) return true;
    
    const sizes = buttons.map(btn => btn.size?.height || 0);
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    
    return variance < 100; // Low variance indicates consistency
  }

  _checkConsistentLinkStyling(links) {
    // Simplified check - would need more sophisticated analysis in production
    return links.length > 0;
  }

  _analyzeHeadingStructure(headings) {
    const levels = headings.map(h => h.level);
    const hasH1 = levels.includes(1);
    const isSequential = this._isSequentialHeadings(levels);
    
    return {
      isWellStructured: hasH1 && isSequential,
      hasH1,
      isSequential
    };
  }

  _isSequentialHeadings(levels) {
    // Check if headings follow a logical sequence (no big jumps)
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i-1] > 1) {
        return false;
      }
    }
    return true;
  }

  _checkButtonHierarchy(buttons) {
    // Check if there's a clear primary/secondary button distinction
    const primaryButtons = buttons.filter(btn => 
      btn.type === 'submit' || 
      /primary|main|buy|purchase/i.test(btn.text)
    );
    
    return primaryButtons.length > 0 && primaryButtons.length < buttons.length;
  }

  _checkConsistentSpacing(detectionResults) {
    // Simplified spacing check - would need layout analysis in production
    return true;
  }
}
