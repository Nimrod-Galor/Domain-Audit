/**
 * ============================================================================
 * SCORING SYSTEM INTEGRATION MODULE
 * ============================================================================
 * 
 * Integration layer that connects the Scientific Scoring System with existing
 * audit executor and analyzer results. Handles data transformation and 
 * backward compatibility.
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { ScientificScoringSystem } from './ScientificScoringSystem.js';

/**
 * Scoring System Integration Class
 */
export class ScoringSystemIntegration {
  constructor(options = {}) {
    this.scoringSystem = new ScientificScoringSystem(options);
    this.options = {
      enableLegacyFallback: true,
      enableValidation: true,
      enableLogging: false,
      ...options
    };
  }

  /**
   * Integration method to replace the randomized scoring in audit-executor.js
   * @param {Object} stateData - Audit state data from audit executor
   * @param {Object} analyzerResults - Results from all analyzers (if available)
   * @returns {Object} Scientific scoring results
   */
  generateScientificAnalytics(stateData, analyzerResults = null) {
    try {
      if (this.options.enableLogging) {
        console.log('🧪 Generating scientific analytics...');
      }

      // Transform state data for scientific scoring
      const transformedData = this.transformStateData(stateData);
      
      // Get or mock analyzer results
      const analyzers = analyzerResults || this.mockAnalyzerResults(stateData);

      // Calculate scientific scores
      const scientificScores = this.scoringSystem.calculateScores(analyzers, transformedData);

      // Transform to audit-executor format for backward compatibility
      const compatibleResults = this.transformToCompatibleFormat(scientificScores, stateData);

      if (this.options.enableLogging) {
        console.log('✅ Scientific analytics generated successfully');
        console.log('📊 Overall Score:', compatibleResults.scores.overall.score);
      }

      return compatibleResults;

    } catch (error) {
      console.error('Scientific analytics generation error:', error);
      
      if (this.options.enableLegacyFallback) {
        console.warn('🔄 Falling back to legacy scoring...');
        return this.generateLegacyFallback(stateData);
      }
      
      throw error;
    }
  }

  /**
   * Transform audit state data for scientific scoring
   */
  transformStateData(stateData) {
    return {
      visited: stateData.visited || {},
      badRequests: stateData.badRequests || {},
      externalLinks: stateData.externalLinks || {},
      stats: stateData.stats || {},
      pageDataManager: stateData.pageDataManager || null,
      url: stateData.url || '',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Mock analyzer results when real analyzers aren't available
   * This allows gradual migration to scientific scoring
   */
  mockAnalyzerResults(stateData) {
    const { visited, badRequests, externalLinks } = stateData;
    
    return {
      // Mock SEO analyzer based on available data
      seo: {
        score: this.calculateBasicSEOScore(stateData),
        metaTags: this.extractBasicMetaTags(stateData),
        structuredData: this.checkBasicStructuredData(stateData)
      },

      // Mock technical analyzer
      technical: {
        score: this.calculateBasicTechnicalScore(stateData),
        htmlValidation: this.checkBasicHTMLQuality(stateData),
        resourceOptimization: this.analyzeBasicResources(stateData)
      },

      // Mock accessibility analyzer
      accessibility: {
        score: this.calculateBasicAccessibilityScore(stateData),
        issues: this.identifyBasicAccessibilityIssues(stateData)
      },

      // Mock content analyzer
      content: {
        score: this.calculateBasicContentScore(stateData),
        quality: this.analyzeBasicContentQuality(stateData)
      },

      // Mock security analyzer
      security: {
        score: this.calculateBasicSecurityScore(stateData),
        ssl: this.checkBasicSSLInfo(stateData)
      },

      // Mock mobile analyzer
      mobile: {
        score: this.calculateBasicMobileScore(stateData),
        responsiveness: this.checkBasicResponsiveness(stateData)
      },

      // Mock social proof analyzer
      socialProof: {
        score: this.calculateBasicSocialProofScore(stateData),
        trustSignals: this.identifyBasicTrustSignals(stateData)
      }
    };
  }

  /**
   * Transform scientific scoring results to audit-executor compatible format
   */
  transformToCompatibleFormat(scientificResults, stateData) {
    const scores = scientificResults.scores;
    
    return {
      scores: {
        overall: {
          score: scores.overall.score,
          grade: scores.overall.grade,
          percentile: scores.overall.percentile || this.calculateBasicPercentile(scores.overall.score)
        },
        categories: {
          seo: { 
            score: scores.categories.seo.score, 
            grade: scores.categories.seo.grade 
          },
          technical: { 
            score: scores.categories.technical.score, 
            grade: scores.categories.technical.grade 
          },
          performance: { 
            score: scores.categories.performance.score, 
            grade: scores.categories.performance.grade 
          },
          accessibility: { 
            score: scores.categories.accessibility.score, 
            grade: scores.categories.accessibility.grade 
          },
          content: { 
            score: scores.categories.content.score, 
            grade: scores.categories.content.grade 
          },
          security: { 
            score: scores.categories.security.score, 
            grade: scores.categories.security.grade 
          },
          mobileFriendliness: { 
            score: scores.categories.mobileFriendliness.score, 
            grade: scores.categories.mobileFriendliness.grade 
          },
          userExperience: { 
            score: scores.categories.userExperience.score, 
            grade: scores.categories.userExperience.grade 
          }
        }
      },
      methodology: scientificResults.methodology,
      breakdown: scientificResults.breakdown,
      timestamp: scientificResults.timestamp,
      isScientific: true
    };
  }

  /**
   * Generate legacy fallback scores (deterministic, not random)
   */
  generateLegacyFallback(stateData) {
    const linkHealthScore = this.calculateDeterministicLinkHealth(stateData);
    
    // Deterministic scores based on actual data (no randomization)
    const categoryScores = {
      seo: Math.max(60, linkHealthScore - 10),
      technical: Math.max(40, this.calculateBasicTechnicalScore(stateData)),
      performance: Math.max(45, this.calculateBasicPerformanceScore(stateData)),
      accessibility: Math.max(50, this.calculateBasicAccessibilityScore(stateData)),
      content: Math.max(55, this.calculateBasicContentScore(stateData)),
      security: Math.max(60, this.calculateBasicSecurityScore(stateData)),
      mobileFriendliness: Math.max(65, this.calculateBasicMobileScore(stateData)),
      userExperience: Math.max(60, this.calculateBasicUXScore(stateData))
    };

    // Calculate weighted overall score
    const weights = {
      seo: 0.20, technical: 0.15, performance: 0.15, accessibility: 0.15,
      content: 0.15, security: 0.10, mobileFriendliness: 0.05, userExperience: 0.05
    };

    const overallScore = Object.entries(categoryScores).reduce((total, [category, score]) => {
      return total + (score * weights[category]);
    }, 0);

    return {
      scores: {
        overall: {
          score: Math.round(overallScore),
          grade: this.assignGrade(overallScore),
          percentile: this.calculateBasicPercentile(overallScore)
        },
        categories: this.formatLegacyCategories(categoryScores)
      },
      isScientific: false,
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  // ============================================================================
  // BASIC CALCULATION METHODS (Deterministic, Evidence-Based)
  // ============================================================================

  calculateDeterministicLinkHealth(stateData) {
    const { stats = {}, badRequests = {}, externalLinks = {} } = stateData;
    
    const totalInternalLinks = Object.keys(stats).length;
    const brokenInternalLinks = Object.keys(badRequests).length;
    const totalExternalLinks = Object.keys(externalLinks).length;
    
    let brokenExternalLinks = 0;
    Object.values(externalLinks).forEach(link => {
      if (!(typeof link.status === 'number' && link.status >= 200 && link.status < 400)) {
        brokenExternalLinks++;
      }
    });

    const internalHealthPercent = totalInternalLinks > 0 ? 
      ((totalInternalLinks - brokenInternalLinks) / totalInternalLinks) * 100 : 100;
    
    const externalHealthPercent = totalExternalLinks > 0 ? 
      ((totalExternalLinks - brokenExternalLinks) / totalExternalLinks) * 100 : 100;

    return Math.round((internalHealthPercent * 0.6) + (externalHealthPercent * 0.4));
  }

  calculateBasicSEOScore(stateData) {
    const linkHealth = this.calculateDeterministicLinkHealth(stateData);
    const pageCount = Object.keys(stateData.visited || {}).length;
    
    let score = linkHealth;
    
    // Adjust based on site structure
    if (pageCount > 50) score += 5;      // Larger sites get bonus
    if (pageCount > 100) score += 10;    // Even larger sites get more bonus
    if (pageCount < 5) score -= 10;      // Very small sites get penalty
    
    return Math.max(60, Math.min(100, score));
  }

  calculateBasicTechnicalScore(stateData) {
    const pageCount = Object.keys(stateData.visited || {}).length;
    const errorRate = Object.keys(stateData.badRequests || {}).length / Math.max(1, pageCount);
    
    let score = 80; // Base technical score
    
    // Penalty for high error rates
    if (errorRate > 0.1) score -= 20;     // >10% error rate
    else if (errorRate > 0.05) score -= 10; // >5% error rate
    
    // Bonus for good site structure
    if (pageCount > 20 && errorRate < 0.02) score += 10;
    
    return Math.max(40, Math.min(100, score));
  }

  calculateBasicPerformanceScore(stateData) {
    const pageCount = Object.keys(stateData.visited || {}).length;
    
    let score = 75; // Base performance score
    
    // Performance penalties/bonuses based on site size
    if (pageCount < 10) score += 10;      // Small sites are faster
    else if (pageCount < 50) score += 5;  // Medium sites get small bonus
    else if (pageCount > 200) score -= 15; // Large sites get penalty
    
    return Math.max(45, Math.min(100, score));
  }

  calculateBasicAccessibilityScore(stateData) {
    // Base accessibility score - will be improved with real analyzer integration
    return 75;
  }

  calculateBasicContentScore(stateData) {
    const pageCount = Object.keys(stateData.visited || {}).length;
    
    let score = 70; // Base content score
    
    // More pages generally means more content
    if (pageCount > 20) score += 10;
    if (pageCount > 50) score += 5;
    
    return Math.max(55, Math.min(100, score));
  }

  calculateBasicSecurityScore(stateData) {
    // Check if HTTPS is used
    const isHTTPS = stateData.url && stateData.url.startsWith('https://');
    
    let score = isHTTPS ? 85 : 65; // Base security score
    
    return Math.max(60, Math.min(100, score));
  }

  calculateBasicMobileScore(stateData) {
    // Base mobile score - will be improved with real analyzer integration
    return 80;
  }

  calculateBasicUXScore(stateData) {
    const pageCount = Object.keys(stateData.visited || {}).length;
    const errorRate = Object.keys(stateData.badRequests || {}).length / Math.max(1, pageCount);
    
    let score = 75; // Base UX score
    
    // Good site structure improves UX
    if (pageCount > 10 && errorRate < 0.05) score += 10;
    if (errorRate > 0.1) score -= 15; // High error rate hurts UX
    
    return Math.max(60, Math.min(100, score));
  }

  calculateBasicSocialProofScore(stateData) {
    // Base social proof score - will be improved with real analyzer integration
    return 70;
  }

  // Mock methods for analyzer results
  extractBasicMetaTags(stateData) { return {}; }
  checkBasicStructuredData(stateData) { return {}; }
  checkBasicHTMLQuality(stateData) { return {}; }
  analyzeBasicResources(stateData) { return {}; }
  identifyBasicAccessibilityIssues(stateData) { return []; }
  analyzeBasicContentQuality(stateData) { return {}; }
  checkBasicSSLInfo(stateData) { return {}; }
  checkBasicResponsiveness(stateData) { return {}; }
  identifyBasicTrustSignals(stateData) { return []; }

  // Helper methods
  assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  calculateBasicPercentile(score) {
    if (score >= 90) return Math.min(100, 90 + (score - 90));
    if (score >= 75) return Math.min(90, 75 + (score - 75) * 0.6);
    if (score >= 50) return Math.min(75, 50 + (score - 50) * 0.5);
    if (score >= 25) return Math.min(50, 25 + (score - 25) * 0.4);
    return Math.max(1, score * 0.4);
  }

  formatLegacyCategories(categoryScores) {
    const formatted = {};
    Object.entries(categoryScores).forEach(([category, score]) => {
      formatted[category] = {
        score: Math.round(score),
        grade: this.assignGrade(score)
      };
    });
    return formatted;
  }
}
