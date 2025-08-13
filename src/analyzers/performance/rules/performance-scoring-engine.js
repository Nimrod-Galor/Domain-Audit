/**
 * Performance Scoring Engine - Combined Approach Rules
 * 
 * GPT-5 Style: Rules-based scoring system for performance analysis
 * Calculates comprehensive performance scores with weighted algorithms
 * 
 * @version 1.0.0
 * @author Performance Team
 */

export class PerformanceScoringEngine {
  constructor(options = {}) {
    this.options = {
      weightCoreWebVitals: options.weightCoreWebVitals || 0.6,
      weightResourceOptimization: options.weightResourceOptimization || 0.2,
      weightLoadingStrategy: options.weightLoadingStrategy || 0.1,
      weightThirdParty: options.weightThirdParty || 0.1,
      enableGrading: options.enableGrading !== false,
      ...options
    };

    this.weights = {
      coreWebVitals: {
        lcp: 0.35,    // Largest Contentful Paint
        fid: 0.25,    // First Input Delay  
        cls: 0.25,    // Cumulative Layout Shift
        fcp: 0.1,     // First Contentful Paint
        ttfb: 0.05    // Time to First Byte
      },
      resourceOptimization: {
        images: 0.3,
        scripts: 0.3,
        stylesheets: 0.2,
        fonts: 0.1,
        compression: 0.1
      },
      loadingStrategy: {
        critical: 0.4,
        blocking: 0.4,
        async: 0.2
      },
      thirdParty: {
        count: 0.3,
        impact: 0.4,
        critical: 0.3
      }
    };

    this.gradeThresholds = {
      A: 90,
      B: 80,
      C: 70,
      D: 60,
      F: 0
    };
  }

  /**
   * Calculate comprehensive performance score
   * @param {Object} analysisResults - Complete performance analysis results
   * @returns {Object} Detailed scoring results with grades and breakdowns
   */
  calculatePerformanceScore(analysisResults) {
    const scores = {
      coreWebVitals: this.scoreCoreWebVitals(analysisResults.coreWebVitals),
      resourceOptimization: this.scoreResourceOptimization(analysisResults.resourceOptimization),
      loadingStrategy: this.scoreLoadingStrategy(analysisResults.loadingStrategy),
      thirdParty: this.scoreThirdParty(analysisResults.thirdParty),
      mobilePerformance: this.scoreMobilePerformance(analysisResults.mobilePerformance)
    };

    const weightedScore = this.calculateWeightedScore(scores);
    const grade = this.options.enableGrading ? this.calculateGrade(weightedScore) : null;

    return {
      overall: {
        score: Math.round(weightedScore),
        grade,
        status: this.getPerformanceStatus(weightedScore)
      },
      breakdown: scores,
      weights: this.options,
      recommendations: this.generateScoringRecommendations(scores),
      improvements: this.identifyImprovementAreas(scores),
      benchmarks: this.compareToBenchmarks(weightedScore, scores)
    };
  }

  /**
   * Score Core Web Vitals performance
   */
  scoreCoreWebVitals(vitalsData) {
    if (!vitalsData) {
      return { score: 0, details: null, impact: 'No data available' };
    }

    const scores = {};
    let totalScore = 0;
    let totalWeight = 0;

    // Score individual metrics
    Object.entries(this.weights.coreWebVitals).forEach(([metric, weight]) => {
      if (vitalsData[metric]) {
        const metricScore = this.scoreIndividualVital(metric, vitalsData[metric]);
        scores[metric] = metricScore;
        totalScore += metricScore.score * weight;
        totalWeight += weight;
      }
    });

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      score: Math.round(finalScore),
      details: scores,
      overallStatus: vitalsData.overallStatus || 'unknown',
      impact: this.assessVitalsImpact(scores),
      recommendations: this.generateVitalsRecommendations(scores)
    };
  }

  /**
   * Score individual Core Web Vital metric
   */
  scoreIndividualVital(metric, vitalData) {
    if (!vitalData || vitalData.value === null) {
      return { score: 0, status: 'no-data', message: 'No measurement available' };
    }

    let score = 0;
    const { value, status } = vitalData;

    // Score based on thresholds
    switch (status) {
      case 'good':
        score = 100;
        break;
      case 'needs-improvement':
        score = 75;
        break;
      case 'poor':
        score = 25;
        break;
      default:
        score = 0;
    }

    // Fine-tune score based on how close to thresholds
    if (metric === 'lcp') {
      if (value <= 1500) score = 100;
      else if (value <= 2000) score = 95;
      else if (value <= 2500) score = 85;
      else if (value <= 3000) score = 70;
      else if (value <= 4000) score = 50;
      else score = 20;
    }

    if (metric === 'fid') {
      if (value <= 50) score = 100;
      else if (value <= 100) score = 85;
      else if (value <= 200) score = 70;
      else if (value <= 300) score = 50;
      else score = 20;
    }

    if (metric === 'cls') {
      if (value <= 0.05) score = 100;
      else if (value <= 0.1) score = 85;
      else if (value <= 0.15) score = 70;
      else if (value <= 0.25) score = 50;
      else score = 20;
    }

    return {
      score: Math.round(score),
      value,
      status,
      message: this.getVitalMessage(metric, status, value)
    };
  }

  /**
   * Score resource optimization performance
   */
  scoreResourceOptimization(resourceData) {
    if (!resourceData) {
      return { score: 0, details: null, impact: 'No data available' };
    }

    const scores = {};
    let totalScore = 0;
    let totalWeight = 0;

    // Score each resource type
    Object.entries(this.weights.resourceOptimization).forEach(([type, weight]) => {
      if (resourceData[type]) {
        const resourceScore = this.scoreResourceType(type, resourceData[type]);
        scores[type] = resourceScore;
        totalScore += resourceScore.score * weight;
        totalWeight += weight;
      }
    });

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      score: Math.round(finalScore),
      details: scores,
      optimizationPotential: resourceData.optimizationPotential || 'unknown',
      impact: this.assessResourceImpact(scores),
      recommendations: this.generateResourceRecommendations(scores)
    };
  }

  /**
   * Score individual resource type optimization
   */
  scoreResourceType(type, resourceData) {
    if (!resourceData) {
      return { score: 100, status: 'optimal', message: 'No issues detected' };
    }

    let score = 100;
    const issues = [];

    switch (type) {
      case 'images':
        if (resourceData.unoptimizedImages > 0) {
          const penalty = Math.min(50, resourceData.unoptimizedImages * 5);
          score -= penalty;
          issues.push(`${resourceData.unoptimizedImages} unoptimized images`);
        }
        break;

      case 'scripts':
        if (resourceData.blockingScripts > 0) {
          const penalty = Math.min(40, resourceData.blockingScripts * 10);
          score -= penalty;
          issues.push(`${resourceData.blockingScripts} render-blocking scripts`);
        }
        break;

      case 'stylesheets':
        if (resourceData.blockingStylesheets > 3) {
          score -= 25;
          issues.push('Too many render-blocking stylesheets');
        }
        break;

      case 'fonts':
        if (resourceData.unoptimizedFonts > 0) {
          score -= 15;
          issues.push('Font loading not optimized');
        }
        break;

      case 'compression':
        // Would check for compression headers in real implementation
        score -= 0; // Placeholder
        break;
    }

    return {
      score: Math.max(0, Math.round(score)),
      issues,
      impact: resourceData.impact || 'low',
      optimizations: resourceData.optimizations || []
    };
  }

  /**
   * Score loading strategy effectiveness
   */
  scoreLoadingStrategy(loadingData) {
    if (!loadingData) {
      return { score: 75, details: null, impact: 'Limited data available' };
    }

    let score = 100;
    const details = {};

    // Score critical resource handling
    if (loadingData.critical) {
      const criticalScore = this.scoreCriticalResourceHandling(loadingData.critical);
      details.critical = criticalScore;
      score = score * 0.4 + criticalScore.score * 0.4;
    }

    // Score blocking resource management  
    if (loadingData.blocking) {
      const blockingScore = this.scoreBlockingResourceManagement(loadingData.blocking);
      details.blocking = blockingScore;
      score = score * 0.6 + blockingScore.score * 0.4;
    }

    return {
      score: Math.round(score),
      details,
      recommendations: loadingData.recommendations || [],
      impact: this.assessLoadingImpact(score)
    };
  }

  /**
   * Score critical resource handling
   */
  scoreCriticalResourceHandling(criticalData) {
    let score = 100;

    if (criticalData.count > 10) {
      score -= 30; // Too many critical resources
    } else if (criticalData.count > 6) {
      score -= 15;
    }

    const optimizationRatio = criticalData.optimized / criticalData.count;
    if (optimizationRatio < 0.5) {
      score -= 25;
    } else if (optimizationRatio < 0.8) {
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      count: criticalData.count,
      optimized: criticalData.optimized,
      ratio: Math.round(optimizationRatio * 100)
    };
  }

  /**
   * Score blocking resource management
   */
  scoreBlockingResourceManagement(blockingData) {
    let score = 100;

    switch (blockingData.impact) {
      case 'high':
        score -= 40;
        break;
      case 'medium':
        score -= 20;
        break;
      case 'low':
        score -= 5;
        break;
    }

    if (blockingData.count > 5) {
      score -= 20;
    } else if (blockingData.count > 3) {
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      count: blockingData.count,
      impact: blockingData.impact
    };
  }

  /**
   * Score third-party performance impact
   */
  scoreThirdParty(thirdPartyData) {
    if (!thirdPartyData) {
      return { score: 100, details: null, impact: 'No third-party resources detected' };
    }

    let score = 100;
    const details = {};

    // Penalty for too many third-party domains
    if (thirdPartyData.domains > 10) {
      score -= 25;
      details.domainPenalty = 25;
    } else if (thirdPartyData.domains > 5) {
      score -= 15;
      details.domainPenalty = 15;
    }

    // Penalty based on impact level
    switch (thirdPartyData.impact) {
      case 'high':
        score -= 30;
        details.impactPenalty = 30;
        break;
      case 'medium':
        score -= 15;
        details.impactPenalty = 15;
        break;
      case 'low':
        score -= 5;
        details.impactPenalty = 5;
        break;
    }

    // Additional penalty for critical third-party resources
    if (thirdPartyData.criticalResources > 0) {
      score -= thirdPartyData.criticalResources * 10;
      details.criticalPenalty = thirdPartyData.criticalResources * 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      details,
      domains: thirdPartyData.domains,
      impact: thirdPartyData.impact,
      recommendations: thirdPartyData.recommendations || []
    };
  }

  /**
   * Score mobile performance considerations
   */
  scoreMobilePerformance(mobileData) {
    if (!mobileData) {
      return { score: 75, details: null, impact: 'Limited mobile analysis' };
    }

    return {
      score: mobileData.mobileScore || 75,
      details: {
        dataUsage: mobileData.dataPlan?.impact || 'unknown',
        batteryImpact: mobileData.batteryImpact?.impact || 'unknown'
      },
      recommendations: mobileData.recommendations || []
    };
  }

  /**
   * Calculate weighted overall score
   */
  calculateWeightedScore(scores) {
    let totalScore = 0;
    let totalWeight = 0;

    // Apply main category weights
    if (scores.coreWebVitals.score > 0) {
      totalScore += scores.coreWebVitals.score * this.options.weightCoreWebVitals;
      totalWeight += this.options.weightCoreWebVitals;
    }

    if (scores.resourceOptimization.score > 0) {
      totalScore += scores.resourceOptimization.score * this.options.weightResourceOptimization;
      totalWeight += this.options.weightResourceOptimization;
    }

    if (scores.loadingStrategy.score > 0) {
      totalScore += scores.loadingStrategy.score * this.options.weightLoadingStrategy;
      totalWeight += this.options.weightLoadingStrategy;
    }

    if (scores.thirdParty.score > 0) {
      totalScore += scores.thirdParty.score * this.options.weightThirdParty;
      totalWeight += this.options.weightThirdParty;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate letter grade based on score
   */
  calculateGrade(score) {
    if (score >= this.gradeThresholds.A) return 'A';
    if (score >= this.gradeThresholds.B) return 'B';
    if (score >= this.gradeThresholds.C) return 'C';
    if (score >= this.gradeThresholds.D) return 'D';
    return 'F';
  }

  /**
   * Get performance status description
   */
  getPerformanceStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Needs Improvement';
    if (score >= 60) return 'Poor';
    return 'Critical';
  }

  /**
   * Generate scoring-based recommendations
   */
  generateScoringRecommendations(scores) {
    const recommendations = [];

    // Core Web Vitals recommendations
    if (scores.coreWebVitals.score < 80) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'high',
        action: 'Focus on improving LCP, FID, and CLS metrics',
        impact: 'high'
      });
    }

    // Resource optimization recommendations
    if (scores.resourceOptimization.score < 70) {
      recommendations.push({
        category: 'Resource Optimization',
        priority: 'medium',
        action: 'Optimize images, scripts, and stylesheets',
        impact: 'medium'
      });
    }

    // Loading strategy recommendations
    if (scores.loadingStrategy.score < 75) {
      recommendations.push({
        category: 'Loading Strategy',
        priority: 'medium',
        action: 'Improve critical resource handling and reduce blocking',
        impact: 'medium'
      });
    }

    // Third-party recommendations
    if (scores.thirdParty.score < 80) {
      recommendations.push({
        category: 'Third-Party Resources',
        priority: 'low',
        action: 'Reduce third-party dependencies and optimize loading',
        impact: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Identify key improvement areas
   */
  identifyImprovementAreas(scores) {
    const areas = [];

    Object.entries(scores).forEach(([category, scoreData]) => {
      if (scoreData.score < 80) {
        areas.push({
          category,
          currentScore: scoreData.score,
          potential: 100 - scoreData.score,
          priority: scoreData.score < 60 ? 'high' : 'medium'
        });
      }
    });

    return areas.sort((a, b) => a.currentScore - b.currentScore);
  }

  /**
   * Compare to industry benchmarks
   */
  compareToBenchmarks(overallScore, scores) {
    const benchmarks = {
      industry: {
        average: 75,
        good: 85,
        excellent: 95
      },
      coreWebVitals: {
        average: 70,
        good: 80,
        excellent: 90
      },
      resourceOptimization: {
        average: 65,
        good: 80,
        excellent: 95
      }
    };

    return {
      overall: {
        vsAverage: overallScore - benchmarks.industry.average,
        vsGood: overallScore - benchmarks.industry.good,
        vsExcellent: overallScore - benchmarks.industry.excellent,
        percentile: this.calculatePercentile(overallScore)
      },
      categories: {
        coreWebVitals: scores.coreWebVitals.score - benchmarks.coreWebVitals.average,
        resourceOptimization: scores.resourceOptimization.score - benchmarks.resourceOptimization.average
      }
    };
  }

  // Helper methods

  getVitalMessage(metric, status, value) {
    const messages = {
      lcp: {
        good: 'Content loads quickly',
        'needs-improvement': 'Content loading could be faster',
        poor: 'Content loads too slowly'
      },
      fid: {
        good: 'Page responds quickly to interactions',
        'needs-improvement': 'Page response could be faster',
        poor: 'Page is slow to respond to interactions'
      },
      cls: {
        good: 'Visual layout is stable',
        'needs-improvement': 'Some unexpected layout shifts',
        poor: 'Significant layout instability'
      }
    };

    return messages[metric]?.[status] || `${metric.toUpperCase()}: ${value}`;
  }

  assessVitalsImpact(scores) {
    const poorCount = Object.values(scores).filter(s => s.score < 50).length;
    const needsImprovementCount = Object.values(scores).filter(s => s.score >= 50 && s.score < 80).length;

    if (poorCount > 1) return 'high';
    if (poorCount > 0 || needsImprovementCount > 2) return 'medium';
    return 'low';
  }

  assessResourceImpact(scores) {
    const lowScores = Object.values(scores).filter(s => s.score < 70).length;
    return lowScores > 2 ? 'high' : lowScores > 1 ? 'medium' : 'low';
  }

  assessLoadingImpact(score) {
    return score < 60 ? 'high' : score < 80 ? 'medium' : 'low';
  }

  generateVitalsRecommendations(scores) {
    return Object.entries(scores)
      .filter(([_, data]) => data.score < 80)
      .map(([metric, data]) => `Improve ${metric.toUpperCase()}: ${data.message}`);
  }

  generateResourceRecommendations(scores) {
    return Object.entries(scores)
      .filter(([_, data]) => data.score < 80)
      .flatMap(([type, data]) => data.optimizations || []);
  }

  calculatePercentile(score) {
    // Simplified percentile calculation
    return Math.min(99, Math.max(1, Math.round(score * 0.9 + 10)));
  }
}

export default PerformanceScoringEngine;
