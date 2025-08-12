/**
 * UX Scoring Engine - GPT-5 Style Rules Component
 * 
 * Calculates overall UX scores and generates findings from heuristic analysis.
 */
export class UXScoringEngine {
  constructor(options = {}) {
    this.options = options;
    this.defaultWeights = {
      usability: 0.35,
      conversionPath: 0.25,
      cognitiveLoad: 0.25,
      trust: 0.15
    };
  }

  /**
   * Calculate overall UX score from heuristic results
   * @param {Object} heuristicResults - Results from all heuristic analyzers
   * @param {Object} weights - Custom weights configuration
   * @returns {Object} Scoring results
   */
  calculateUXScore(heuristicResults, weights = null) {
    const activeWeights = weights?.getWeights() || this.defaultWeights;
    
    // Extract scores from heuristic results
    const scores = {
      usability: heuristicResults.usability?.score || 0,
      conversionPath: heuristicResults.conversionPath?.score || 0,
      cognitiveLoad: heuristicResults.cognitiveLoad?.score || 0,
      trust: heuristicResults.trust?.score || 0
    };

    // Calculate weighted overall score
    const overallScore = this._calculateWeightedScore(scores, activeWeights);
    
    // Generate category-specific findings
    const findings = this._consolidateFindings(heuristicResults);
    
    // Generate recommendations
    const recommendations = this._consolidateRecommendations(heuristicResults);
    
    // Calculate grade and performance metrics
    const grade = this._calculateGrade(overallScore);
    const performanceMetrics = this._calculatePerformanceMetrics(scores, overallScore);

    return {
      overallScore: Math.round(overallScore),
      categoryScores: scores,
      grade,
      findings,
      recommendations,
      performanceMetrics,
      weights: activeWeights,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate weighted score
   */
  _calculateWeightedScore(scores, weights) {
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [category, score] of Object.entries(scores)) {
      if (weights[category] && score > 0) {
        totalScore += score * weights[category];
        totalWeight += weights[category];
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Consolidate findings from all heuristic analyzers
   */
  _consolidateFindings(heuristicResults) {
    const allFindings = [];
    
    // Collect findings from each analyzer
    Object.entries(heuristicResults).forEach(([category, results]) => {
      if (results?.findings) {
        results.findings.forEach(finding => {
          allFindings.push({
            ...finding,
            source: category,
            category: finding.category || category
          });
        });
      }
    });

    // Sort by severity and score
    allFindings.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'positive': 0 };
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      
      if (severityDiff !== 0) return severityDiff;
      
      return (b.score || 0) - (a.score || 0);
    });

    // Categorize findings
    const categorizedFindings = {
      critical: allFindings.filter(f => f.severity === 'critical'),
      high: allFindings.filter(f => f.severity === 'high'),
      medium: allFindings.filter(f => f.severity === 'medium'),
      low: allFindings.filter(f => f.severity === 'low'),
      positive: allFindings.filter(f => f.severity === 'positive'),
      all: allFindings
    };

    return categorizedFindings;
  }

  /**
   * Consolidate recommendations from all heuristic analyzers
   */
  _consolidateRecommendations(heuristicResults) {
    const allRecommendations = [];
    
    // Collect recommendations from each analyzer
    Object.entries(heuristicResults).forEach(([category, results]) => {
      if (results?.recommendations) {
        results.recommendations.forEach(recommendation => {
          allRecommendations.push({
            ...recommendation,
            source: category,
            category: recommendation.category || category
          });
        });
      }
    });

    // Sort by priority and expected impact
    allRecommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (impactOrder[b.expectedImpact] || 0) - (impactOrder[a.expectedImpact] || 0);
    });

    // Categorize recommendations
    const categorizedRecommendations = {
      critical: allRecommendations.filter(r => r.priority === 'critical'),
      high: allRecommendations.filter(r => r.priority === 'high'),
      medium: allRecommendations.filter(r => r.priority === 'medium'),
      low: allRecommendations.filter(r => r.priority === 'low'),
      quickWins: this._identifyQuickWins(allRecommendations),
      all: allRecommendations
    };

    return categorizedRecommendations;
  }

  /**
   * Calculate performance grade
   */
  _calculateGrade(score) {
    if (score >= 95) return { letter: 'A+', description: 'Exceptional UX' };
    if (score >= 90) return { letter: 'A', description: 'Excellent UX' };
    if (score >= 85) return { letter: 'A-', description: 'Very Good UX' };
    if (score >= 80) return { letter: 'B+', description: 'Good UX' };
    if (score >= 75) return { letter: 'B', description: 'Above Average UX' };
    if (score >= 70) return { letter: 'B-', description: 'Average UX' };
    if (score >= 65) return { letter: 'C+', description: 'Below Average UX' };
    if (score >= 60) return { letter: 'C', description: 'Poor UX' };
    if (score >= 55) return { letter: 'C-', description: 'Very Poor UX' };
    if (score >= 50) return { letter: 'D', description: 'Critical UX Issues' };
    return { letter: 'F', description: 'Failed UX' };
  }

  /**
   * Calculate detailed performance metrics
   */
  _calculatePerformanceMetrics(scores, overallScore) {
    const metrics = {
      overallScore,
      categoryBreakdown: {},
      strengths: [],
      weaknesses: [],
      improvementPotential: 0,
      balanceScore: 0
    };

    // Category breakdown with analysis
    Object.entries(scores).forEach(([category, score]) => {
      metrics.categoryBreakdown[category] = {
        score,
        grade: this._getCategoryGrade(score),
        status: this._getCategoryStatus(score),
        weight: this.defaultWeights[category] || 0
      };

      // Identify strengths and weaknesses
      if (score >= 80) {
        metrics.strengths.push({
          category,
          score,
          description: this._getCategoryDescription(category, 'strength')
        });
      } else if (score < 60) {
        metrics.weaknesses.push({
          category,
          score,
          description: this._getCategoryDescription(category, 'weakness')
        });
      }
    });

    // Calculate improvement potential (how much score could increase)
    const maxPossibleScore = 100;
    metrics.improvementPotential = maxPossibleScore - overallScore;

    // Calculate balance score (how evenly distributed the scores are)
    const scoreValues = Object.values(scores);
    const average = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
    const variance = scoreValues.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scoreValues.length;
    metrics.balanceScore = Math.max(0, 100 - Math.sqrt(variance));

    return metrics;
  }

  /**
   * Identify quick win recommendations
   */
  _identifyQuickWins(recommendations) {
    return recommendations.filter(rec => {
      const title = rec.title?.toLowerCase() || '';
      const description = rec.description?.toLowerCase() || '';
      
      // Look for indicators of quick wins
      const quickWinIndicators = [
        'add', 'include', 'display', 'show',
        'ssl', 'https', 'contact', 'phone', 'email',
        'alt text', 'label', 'title',
        'button', 'link', 'heading'
      ];
      
      return quickWinIndicators.some(indicator => 
        title.includes(indicator) || description.includes(indicator)
      );
    }).slice(0, 5); // Limit to top 5 quick wins
  }

  /**
   * Get category grade
   */
  _getCategoryGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get category status
   */
  _getCategoryStatus(score) {
    if (score >= 85) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 65) return 'fair';
    if (score >= 50) return 'poor';
    return 'critical';
  }

  /**
   * Get category description
   */
  _getCategoryDescription(category, type) {
    const descriptions = {
      usability: {
        strength: 'Interface follows established usability principles',
        weakness: 'Interface has significant usability issues'
      },
      conversionPath: {
        strength: 'Clear and optimized conversion paths',
        weakness: 'Conversion paths need optimization'
      },
      cognitiveLoad: {
        strength: 'Low cognitive load, easy to process',
        weakness: 'High cognitive load may overwhelm users'
      },
      trust: {
        strength: 'Strong trust signals and credibility',
        weakness: 'Limited trust signals may reduce confidence'
      }
    };

    return descriptions[category]?.[type] || `${category} ${type}`;
  }

  /**
   * Generate summary statistics
   */
  getSummaryStatistics(scoringResults) {
    const { categoryScores, findings, recommendations } = scoringResults;
    
    return {
      scoreDistribution: {
        highest: Math.max(...Object.values(categoryScores)),
        lowest: Math.min(...Object.values(categoryScores)),
        average: Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length,
        range: Math.max(...Object.values(categoryScores)) - Math.min(...Object.values(categoryScores))
      },
      issueDistribution: {
        critical: findings.critical?.length || 0,
        high: findings.high?.length || 0,
        medium: findings.medium?.length || 0,
        low: findings.low?.length || 0,
        total: findings.all?.length || 0
      },
      recommendationDistribution: {
        critical: recommendations.critical?.length || 0,
        high: recommendations.high?.length || 0,
        medium: recommendations.medium?.length || 0,
        low: recommendations.low?.length || 0,
        quickWins: recommendations.quickWins?.length || 0,
        total: recommendations.all?.length || 0
      }
    };
  }
}
