/**
 * SEO Scoring Engine - GPT-5 Style Rules Engine
 * 
 * Implements weighted scoring algorithms for comprehensive SEO assessment
 * Combines detection results and heuristic analysis into actionable scores
 */

export class SEOScoringEngine {
  constructor(options = {}) {
    this.options = {
      enableWeightedScoring: options.enableWeightedScoring !== false,
      enableGradeCalculation: options.enableGradeCalculation !== false,
      enableRecommendationPrioritization: options.enableRecommendationPrioritization !== false,
      enableCompetitiveAnalysis: options.enableCompetitiveAnalysis !== false,
      
      // Scoring weights configuration
      weights: {
        technical: options.weights?.technical || 0.25,      // 25%
        content: options.weights?.content || 0.30,          // 30%
        keywords: options.weights?.keywords || 0.20,        // 20%
        performance: options.weights?.performance || 0.15,  // 15%
        structure: options.weights?.structure || 0.10       // 10%
      },
      
      // Grade thresholds
      gradeThresholds: {
        A: options.gradeThresholds?.A || 90,
        B: options.gradeThresholds?.B || 80,
        C: options.gradeThresholds?.C || 70,
        D: options.gradeThresholds?.D || 60
      },
      
      // Priority scoring factors
      priorityFactors: {
        high: options.priorityFactors?.high || 3.0,
        medium: options.priorityFactors?.medium || 2.0,
        low: options.priorityFactors?.low || 1.0
      },
      
      ...options
    };
  }

  /**
   * Calculate comprehensive SEO score from all analysis results
   * @param {Object} analysisResults - Combined analysis results from all components
   * @returns {Object} Comprehensive scoring results
   */
  async calculateScore(analysisResults) {
    try {
      const results = {
        success: true,
        overall: this._calculateOverallScore(analysisResults),
        components: this._calculateComponentScores(analysisResults),
        weights: this.options.weights,
        grade: '',
        recommendations: this.options.enableRecommendationPrioritization ?
          this._prioritizeRecommendations(analysisResults) : null,
        competitiveInsights: this.options.enableCompetitiveAnalysis ?
          this._generateCompetitiveInsights(analysisResults) : null,
        actionPlan: this._generateActionPlan(analysisResults),
        trends: this._analyzeTrends(analysisResults),
        riskAssessment: this._assessRisks(analysisResults),
        opportunityMatrix: this._createOpportunityMatrix(analysisResults),
        timestamp: new Date().toISOString()
      };

      // Calculate grade from overall score
      if (this.options.enableGradeCalculation) {
        results.grade = this._calculateGrade(results.overall.score);
      }

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate overall weighted SEO score
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Overall score calculation
   * @private
   */
  _calculateOverallScore(analysisResults) {
    const componentScores = this._calculateComponentScores(analysisResults);
    let weightedSum = 0;
    let totalWeight = 0;

    // Apply weights to component scores
    Object.entries(this.options.weights).forEach(([component, weight]) => {
      if (componentScores[component]?.score !== undefined) {
        weightedSum += componentScores[component].score * weight;
        totalWeight += weight;
      }
    });

    const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    return {
      score: finalScore,
      maxScore: 100,
      percentage: `${finalScore}%`,
      calculation: {
        weightedSum,
        totalWeight,
        components: componentScores
      },
      interpretation: this._interpretScore(finalScore),
      benchmark: this._getBenchmarkComparison(finalScore)
    };
  }

  /**
   * Calculate individual component scores
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Component-wise scores
   * @private
   */
  _calculateComponentScores(analysisResults) {
    const scores = {};

    // Technical SEO score
    if (analysisResults.technicalSEO) {
      scores.technical = {
        score: analysisResults.technicalSEO.score || 0,
        grade: analysisResults.technicalSEO.grade || 'F',
        factors: this._getTechnicalFactors(analysisResults.technicalSEO),
        weight: this.options.weights.technical
      };
    }

    // Content quality score
    if (analysisResults.contentQuality) {
      scores.content = {
        score: analysisResults.contentQuality.score || 0,
        grade: analysisResults.contentQuality.grade || 'F',
        factors: this._getContentFactors(analysisResults.contentQuality),
        weight: this.options.weights.content
      };
    }

    // Keyword optimization score
    if (analysisResults.keywords) {
      scores.keywords = {
        score: analysisResults.keywords.score || 0,
        grade: analysisResults.keywords.grade || 'F',
        factors: this._getKeywordFactors(analysisResults.keywords),
        weight: this.options.weights.keywords
      };
    }

    // Performance score
    if (analysisResults.performance) {
      scores.performance = {
        score: analysisResults.performance.score || 0,
        grade: analysisResults.performance.grade || 'F',
        factors: this._getPerformanceFactors(analysisResults.performance),
        weight: this.options.weights.performance
      };
    }

    // Structure score (headings, links, etc.)
    if (analysisResults.structure) {
      scores.structure = {
        score: analysisResults.structure.score || 0,
        grade: analysisResults.structure.grade || 'F',
        factors: this._getStructureFactors(analysisResults.structure),
        weight: this.options.weights.structure
      };
    }

    return scores;
  }

  /**
   * Prioritize recommendations based on impact and effort
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Prioritized recommendations
   * @private
   */
  _prioritizeRecommendations(analysisResults) {
    const allRecommendations = this._collectAllRecommendations(analysisResults);
    
    // Sort by priority score (impact vs effort)
    const prioritized = allRecommendations
      .map(rec => ({
        ...rec,
        priorityScore: this._calculateRecommendationPriority(rec)
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      critical: prioritized.filter(r => r.priorityScore >= 80),
      high: prioritized.filter(r => r.priorityScore >= 60 && r.priorityScore < 80),
      medium: prioritized.filter(r => r.priorityScore >= 40 && r.priorityScore < 60),
      low: prioritized.filter(r => r.priorityScore < 40),
      quickWins: this._identifyQuickWins(prioritized),
      longTerm: this._identifyLongTermGoals(prioritized)
    };
  }

  /**
   * Generate competitive insights
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Competitive analysis
   * @private
   */
  _generateCompetitiveInsights(analysisResults) {
    const overallScore = this._calculateOverallScore(analysisResults).score;
    
    return {
      marketPosition: this._assessMarketPosition(overallScore),
      competitiveAdvantages: this._identifyCompetitiveAdvantages(analysisResults),
      vulnerabilities: this._identifyVulnerabilities(analysisResults),
      benchmarkComparison: this._getBenchmarkComparison(overallScore),
      industryStandards: this._getIndustryStandards(analysisResults),
      differentiators: this._identifyDifferentiators(analysisResults)
    };
  }

  /**
   * Generate actionable SEO plan
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Action plan
   * @private
   */
  _generateActionPlan(analysisResults) {
    const issues = this._collectAllIssues(analysisResults);
    const opportunities = this._collectAllOpportunities(analysisResults);
    
    return {
      immediate: this._createImmediateActions(issues, opportunities),
      shortTerm: this._createShortTermActions(issues, opportunities),
      longTerm: this._createLongTermActions(issues, opportunities),
      resourceRequirements: this._estimateResourceRequirements(issues, opportunities),
      timeline: this._createImplementationTimeline(issues, opportunities),
      success_metrics: this._defineSuccessMetrics(analysisResults)
    };
  }

  /**
   * Analyze SEO trends and patterns
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Trend analysis
   * @private
   */
  _analyzeTrends(analysisResults) {
    return {
      strengthAreas: this._identifyStrengthAreas(analysisResults),
      improvementAreas: this._identifyImprovementAreas(analysisResults),
      emergingOpportunities: this._identifyEmergingOpportunities(analysisResults),
      riskFactors: this._identifyRiskFactors(analysisResults),
      trendingFactors: this._identifyTrendingFactors(analysisResults),
      futureConsiderations: this._getFutureConsiderations(analysisResults)
    };
  }

  /**
   * Assess SEO risks
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Risk assessment
   * @private
   */
  _assessRisks(analysisResults) {
    const issues = this._collectAllIssues(analysisResults);
    
    return {
      critical: issues.filter(issue => issue.severity === 'critical'),
      high: issues.filter(issue => issue.severity === 'high'),
      medium: issues.filter(issue => issue.severity === 'medium'),
      low: issues.filter(issue => issue.severity === 'low'),
      riskMatrix: this._createRiskMatrix(issues),
      mitigationStrategies: this._createMitigationStrategies(issues),
      monitoringRecommendations: this._createMonitoringRecommendations(issues)
    };
  }

  /**
   * Create opportunity matrix
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Opportunity matrix
   * @private
   */
  _createOpportunityMatrix(analysisResults) {
    const opportunities = this._collectAllOpportunities(analysisResults);
    
    return {
      highImpactLowEffort: opportunities.filter(opp => 
        opp.impact === 'high' && opp.effort === 'low'),
      highImpactMediumEffort: opportunities.filter(opp => 
        opp.impact === 'high' && opp.effort === 'medium'),
      highImpactHighEffort: opportunities.filter(opp => 
        opp.impact === 'high' && opp.effort === 'high'),
      mediumImpact: opportunities.filter(opp => opp.impact === 'medium'),
      lowImpact: opportunities.filter(opp => opp.impact === 'low'),
      priorityMatrix: this._createPriorityMatrix(opportunities)
    };
  }

  /**
   * Calculate grade from score
   * @param {number} score - Numeric score
   * @returns {string} Letter grade A-F
   * @private
   */
  _calculateGrade(score) {
    const thresholds = this.options.gradeThresholds;
    
    if (score >= thresholds.A) return 'A';
    if (score >= thresholds.B) return 'B';
    if (score >= thresholds.C) return 'C';
    if (score >= thresholds.D) return 'D';
    return 'F';
  }

  /**
   * Interpret score with contextual meaning
   * @param {number} score - Numeric score
   * @returns {Object} Score interpretation
   * @private
   */
  _interpretScore(score) {
    if (score >= 90) {
      return {
        level: 'excellent',
        message: 'Outstanding SEO implementation with minor optimization opportunities',
        focus: 'maintenance and monitoring'
      };
    } else if (score >= 80) {
      return {
        level: 'good',
        message: 'Strong SEO foundation with some areas for improvement',
        focus: 'optimization and enhancement'
      };
    } else if (score >= 70) {
      return {
        level: 'fair',
        message: 'Adequate SEO implementation with significant improvement potential',
        focus: 'systematic improvements'
      };
    } else if (score >= 60) {
      return {
        level: 'poor',
        message: 'Basic SEO implementation with major gaps to address',
        focus: 'fundamental fixes'
      };
    } else {
      return {
        level: 'critical',
        message: 'Critical SEO issues requiring immediate attention',
        focus: 'emergency optimization'
      };
    }
  }

  // Helper methods for detailed calculations

  /**
   * Collect all recommendations from analysis results
   * @param {Object} analysisResults - Analysis results
   * @returns {Array} All recommendations
   * @private
   */
  _collectAllRecommendations(analysisResults) {
    const recommendations = [];
    
    // Collect from all analysis components
    Object.values(analysisResults).forEach(component => {
      if (component.recommendations) {
        if (Array.isArray(component.recommendations)) {
          recommendations.push(...component.recommendations);
        } else if (typeof component.recommendations === 'object') {
          Object.values(component.recommendations).forEach(recList => {
            if (Array.isArray(recList)) {
              recommendations.push(...recList);
            }
          });
        }
      }
    });
    
    return recommendations;
  }

  /**
   * Calculate recommendation priority score
   * @param {Object} recommendation - Single recommendation
   * @returns {number} Priority score 0-100
   * @private
   */
  _calculateRecommendationPriority(recommendation) {
    const impactScore = this._getImpactScore(recommendation.impact);
    const effortScore = this._getEffortScore(recommendation.effort);
    const urgencyScore = this._getUrgencyScore(recommendation.severity || recommendation.priority);
    
    // Higher impact, lower effort, higher urgency = higher priority
    return Math.round((impactScore * 0.4) + ((100 - effortScore) * 0.3) + (urgencyScore * 0.3));
  }

  /**
   * Get benchmark comparison
   * @param {number} score - Current score
   * @returns {Object} Benchmark comparison
   * @private
   */
  _getBenchmarkComparison(score) {
    return {
      industry: {
        average: 65,
        percentile: score > 65 ? Math.min(95, Math.round(50 + (score - 65) * 1.5)) : Math.round(score * 0.7),
        comparison: score > 65 ? 'above average' : 'below average'
      },
      competitive: {
        leaders: 85,
        followers: 70,
        laggards: 55,
        position: score >= 85 ? 'leader' : score >= 70 ? 'follower' : 'laggard'
      }
    };
  }

  // Placeholder methods for detailed implementations
  _getTechnicalFactors() { return ['Meta tags', 'URL structure', 'Robots directives', 'Structured data']; }
  _getContentFactors() { return ['Content quality', 'Keyword usage', 'Text length', 'Readability']; }
  _getKeywordFactors() { return ['Keyword density', 'LSI keywords', 'Keyword placement', 'Semantic relevance']; }
  _getPerformanceFactors() { return ['Core Web Vitals', 'Page speed', 'Mobile performance', 'Resource optimization']; }
  _getStructureFactors() { return ['Heading hierarchy', 'Internal linking', 'URL structure', 'Navigation']; }
  _collectAllIssues() { return []; }
  _collectAllOpportunities() { return []; }
  _identifyQuickWins() { return []; }
  _identifyLongTermGoals() { return []; }
  _assessMarketPosition() { return { position: 'competitive' }; }
  _identifyCompetitiveAdvantages() { return []; }
  _identifyVulnerabilities() { return []; }
  _getIndustryStandards() { return {}; }
  _identifyDifferentiators() { return []; }
  _createImmediateActions() { return []; }
  _createShortTermActions() { return []; }
  _createLongTermActions() { return []; }
  _estimateResourceRequirements() { return {}; }
  _createImplementationTimeline() { return {}; }
  _defineSuccessMetrics() { return []; }
  _identifyStrengthAreas() { return []; }
  _identifyImprovementAreas() { return []; }
  _identifyEmergingOpportunities() { return []; }
  _identifyRiskFactors() { return []; }
  _identifyTrendingFactors() { return []; }
  _getFutureConsiderations() { return []; }
  _createRiskMatrix() { return {}; }
  _createMitigationStrategies() { return []; }
  _createMonitoringRecommendations() { return []; }
  _createPriorityMatrix() { return {}; }
  _getImpactScore(impact) { 
    return impact === 'high' ? 90 : impact === 'medium' ? 60 : 30; 
  }
  _getEffortScore(effort) { 
    return effort === 'high' ? 90 : effort === 'medium' ? 60 : 30; 
  }
  _getUrgencyScore(urgency) { 
    return urgency === 'critical' ? 95 : urgency === 'high' ? 80 : 
           urgency === 'medium' ? 60 : 40; 
  }
}

export default SEOScoringEngine;
