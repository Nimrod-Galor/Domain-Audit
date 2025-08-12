/**
 * Conversion Path Analyzer - GPT-5 Style Heuristic Component
 * 
 * Analyzes conversion paths and user journey optimization.
 */
export class ConversionPathAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  analyze(detectionResults, context) {
    const pathMetrics = {
      conversionElements: this._analyzeConversionElements(detectionResults),
      pathClarity: this._analyzePathClarity(detectionResults),
      frictionPoints: this._identifyFrictionPoints(detectionResults),
      callToActions: this._analyzeCallToActions(detectionResults)
    };

    const overallScore = this._calculateConversionScore(pathMetrics);

    return {
      score: overallScore,
      metrics: pathMetrics,
      findings: this._generateConversionFindings(pathMetrics),
      recommendations: this._generateConversionRecommendations(pathMetrics),
      conversionPotential: this._assessConversionPotential(overallScore)
    };
  }

  _analyzeConversionElements(detectionResults) {
    const interaction = detectionResults.interaction || {};
    const form = detectionResults.form || {};
    
    const conversionButtons = interaction.elements?.buttons?.filter(btn => 
      /buy|purchase|subscribe|sign.*up|register|add.*cart|checkout/i.test(btn.text)
    ) || [];

    const leadCaptureForms = form.forms?.filter(f => 
      f.inputs >= 2 && f.inputs <= 5 // Optimal form length
    ) || [];

    return {
      conversionButtons: conversionButtons.length,
      leadCaptureForms: leadCaptureForms.length,
      totalConversionElements: conversionButtons.length + leadCaptureForms.length,
      buttonVisibility: conversionButtons.filter(btn => btn.visible).length,
      score: Math.min((conversionButtons.length * 20) + (leadCaptureForms.length * 15), 100)
    };
  }

  _analyzePathClarity(detectionResults) {
    const navigation = detectionResults.navigation || {};
    const content = detectionResults.content || {};
    
    let clarityScore = 50;
    
    // Clear navigation structure
    if (navigation.navigation?.primary?.structure?.levels <= 3) {
      clarityScore += 20;
    }
    
    // Clear content hierarchy
    if (content.content?.headings?.length > 0) {
      clarityScore += 15;
    }
    
    // Search functionality for alternative paths
    if (navigation.analysis?.searchFunctionality?.found) {
      clarityScore += 15;
    }
    
    return {
      score: Math.min(clarityScore, 100),
      navigationClarity: navigation.navigation?.primary?.structure?.levels <= 3,
      contentHierarchy: content.content?.headings?.length > 0,
      searchAvailable: navigation.analysis?.searchFunctionality?.found
    };
  }

  _identifyFrictionPoints(detectionResults) {
    const form = detectionResults.form || {};
    const interaction = detectionResults.interaction || {};
    
    const frictionPoints = [];
    let frictionScore = 100;
    
    // Long forms create friction
    const longForms = form.forms?.filter(f => f.inputs > 8) || [];
    if (longForms.length > 0) {
      frictionPoints.push('Long forms detected');
      frictionScore -= 25;
    }
    
    // Forms without validation create friction
    const unvalidatedForms = form.forms?.filter(f => !f.validation?.hasValidation) || [];
    if (unvalidatedForms.length > 0) {
      frictionPoints.push('Forms without validation');
      frictionScore -= 15;
    }
    
    // Inaccessible buttons create friction
    const inaccessibleButtons = interaction.elements?.buttons?.filter(btn => !btn.accessible) || [];
    if (inaccessibleButtons.length > 0) {
      frictionPoints.push('Inaccessible interactive elements');
      frictionScore -= 20;
    }
    
    // Poor touch optimization creates mobile friction
    if (interaction.analysis?.touchOptimization?.touchOptimizationScore < 70) {
      frictionPoints.push('Poor mobile touch optimization');
      frictionScore -= 20;
    }
    
    return {
      points: frictionPoints,
      score: Math.max(frictionScore, 0),
      count: frictionPoints.length
    };
  }

  _analyzeCallToActions(detectionResults) {
    const interaction = detectionResults.interaction || {};
    
    const ctaButtons = interaction.elements?.buttons?.filter(btn => 
      /get.*started|try.*free|learn.*more|contact|download|request/i.test(btn.text)
    ) || [];

    const primaryCTAs = interaction.elements?.buttons?.filter(btn => 
      /buy|purchase|subscribe|sign.*up/i.test(btn.text)
    ) || [];

    let ctaScore = 40;
    
    // Primary CTAs present
    if (primaryCTAs.length > 0) {
      ctaScore += 30;
    }
    
    // Secondary CTAs for engagement
    if (ctaButtons.length > 0) {
      ctaScore += 20;
    }
    
    // CTAs are visible and accessible
    const visibleCTAs = [...ctaButtons, ...primaryCTAs].filter(btn => btn.visible && btn.accessible);
    if (visibleCTAs.length > 0) {
      ctaScore += 10;
    }
    
    return {
      primaryCTAs: primaryCTAs.length,
      secondaryCTAs: ctaButtons.length,
      totalCTAs: ctaButtons.length + primaryCTAs.length,
      visibleCTAs: visibleCTAs.length,
      score: Math.min(ctaScore, 100)
    };
  }

  _calculateConversionScore(metrics) {
    const weights = {
      conversionElements: 0.3,
      pathClarity: 0.25,
      frictionPoints: 0.25,
      callToActions: 0.2
    };
    
    let totalScore = 0;
    totalScore += metrics.conversionElements.score * weights.conversionElements;
    totalScore += metrics.pathClarity.score * weights.pathClarity;
    totalScore += metrics.frictionPoints.score * weights.frictionPoints;
    totalScore += metrics.callToActions.score * weights.callToActions;
    
    return Math.round(totalScore);
  }

  _generateConversionFindings(metrics) {
    const findings = [];
    
    if (metrics.conversionElements.totalConversionElements === 0) {
      findings.push({
        category: 'conversion',
        severity: 'high',
        message: 'No clear conversion elements found',
        impact: 'Critical for conversion optimization'
      });
    }
    
    if (metrics.frictionPoints.count > 2) {
      findings.push({
        category: 'conversion',
        severity: 'medium',
        message: `${metrics.frictionPoints.count} friction points identified`,
        impact: 'May reduce conversion rates'
      });
    }
    
    if (metrics.callToActions.totalCTAs === 0) {
      findings.push({
        category: 'conversion',
        severity: 'high',
        message: 'No call-to-action elements found',
        impact: 'Users may not know what action to take'
      });
    }
    
    return findings;
  }

  _generateConversionRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.conversionElements.totalConversionElements < 2) {
      recommendations.push({
        category: 'conversion',
        priority: 'high',
        title: 'Add clear conversion elements',
        description: 'Implement prominent buttons and forms for user conversion',
        expectedImpact: 'High'
      });
    }
    
    if (metrics.frictionPoints.count > 1) {
      recommendations.push({
        category: 'conversion',
        priority: 'medium',
        title: 'Reduce friction points',
        description: 'Simplify forms and improve accessibility to reduce user friction',
        expectedImpact: 'Medium'
      });
    }
    
    if (metrics.pathClarity.score < 70) {
      recommendations.push({
        category: 'conversion',
        priority: 'medium',
        title: 'Improve conversion path clarity',
        description: 'Simplify navigation and add clear content hierarchy',
        expectedImpact: 'Medium'
      });
    }
    
    return recommendations;
  }

  _assessConversionPotential(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }
}
