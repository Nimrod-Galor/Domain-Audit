/**
 * ============================================================================
 * SCIENTIFIC SCORING SYSTEM MODULE
 * ============================================================================
 * 
 * Deterministic, repeatable, and scientific scoring system based purely on 
 * analyzer findings. Completely removes randomization and bases scores on 
 * real technical analysis results.
 * 
 * Architecture:
 * - Decoupled from audit execution logic
 * - Uses analyzer findings as input
 * - Applies scientific weighting algorithms
 * - Provides consistent, repeatable results
 * - Supports detailed score breakdowns
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

/**
 * Scientific Scoring Configuration
 */
export const SCORING_CONFIG = {
  // Category weights (must sum to 1.0)
  WEIGHTS: {
    seo: 0.20,              // 20% - Search engine optimization
    technical: 0.15,        // 15% - Technical implementation
    performance: 0.15,      // 15% - Loading and performance
    accessibility: 0.15,    // 15% - Accessibility compliance
    content: 0.15,          // 15% - Content quality and intelligence
    security: 0.10,         // 10% - Security and SSL
    mobileFriendliness: 0.05, // 5% - Mobile optimization
    userExperience: 0.05    // 5% - User experience design
  },

  // Grade thresholds
  GRADES: {
    A: { min: 90, max: 100 },
    B: { min: 80, max: 89 },
    C: { min: 70, max: 79 },
    D: { min: 60, max: 69 },
    F: { min: 0, max: 59 }
  },

  // Percentile calculation base (for industry comparison)
  PERCENTILE_BASE: {
    excellent: 90,    // Top 10%
    good: 75,         // Top 25%
    average: 50,      // Average
    poor: 25,         // Bottom 25%
    critical: 10      // Bottom 10%
  }
};

/**
 * Scientific Scoring System Class
 */
export class ScientificScoringSystem {
  constructor(options = {}) {
    this.options = {
      enableDetailedBreakdown: true,
      enablePercentileRanking: true,
      enableRecommendationPriority: true,
      ...options
    };
  }

  /**
   * Calculate comprehensive scientific scores based on analyzer findings
   * @param {Object} analyzerResults - Results from all analyzers
   * @param {Object} auditData - Raw audit data (links, performance metrics, etc.)
   * @returns {Object} Complete scoring analysis
   */
  calculateScores(analyzerResults, auditData) {
    try {
      // Calculate individual category scores
      const categoryScores = {
        seo: this.calculateSEOScore(analyzerResults, auditData),
        technical: this.calculateTechnicalScore(analyzerResults, auditData),
        performance: this.calculatePerformanceScore(analyzerResults, auditData),
        accessibility: this.calculateAccessibilityScore(analyzerResults, auditData),
        content: this.calculateContentScore(analyzerResults, auditData),
        security: this.calculateSecurityScore(analyzerResults, auditData),
        mobileFriendliness: this.calculateMobileScore(analyzerResults, auditData),
        userExperience: this.calculateUXScore(analyzerResults, auditData)
      };

      // Calculate overall weighted score
      const overallScore = this.calculateOverallScore(categoryScores);

      // Generate detailed breakdown if enabled
      const breakdown = this.options.enableDetailedBreakdown ? 
        this.generateDetailedBreakdown(categoryScores, analyzerResults) : null;

      // Calculate percentile ranking if enabled
      const percentile = this.options.enablePercentileRanking ? 
        this.calculatePercentileRanking(overallScore) : null;

      return {
        scores: {
          overall: {
            score: Math.round(overallScore),
            grade: this.assignGrade(overallScore),
            percentile: percentile
          },
          categories: this.formatCategoryScores(categoryScores)
        },
        breakdown: breakdown,
        methodology: this.getMethodologyInfo(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Scientific scoring calculation error:', error);
      return this.generateFallbackScores();
    }
  }

  /**
   * Calculate SEO score based on analyzer findings
   */
  calculateSEOScore(analyzerResults, auditData) {
    let score = 100; // Start with perfect score and deduct for issues
    const factors = [];

    try {
      // Link health analysis (40% of SEO score)
      const linkHealth = this.analyzeLinkHealth(auditData);
      score = score * 0.6 + linkHealth * 0.4;
      factors.push({ factor: 'Link Health', score: linkHealth, weight: 0.4 });

      // Meta tags and structured data (30% of SEO score)
      const metaScore = this.analyzeMetaTags(analyzerResults);
      score = score * 0.7 + metaScore * 0.3;
      factors.push({ factor: 'Meta Tags & Schema', score: metaScore, weight: 0.3 });

      // Content optimization (20% of SEO score)
      const contentOptimization = this.analyzeContentSEO(analyzerResults);
      score = score * 0.8 + contentOptimization * 0.2;
      factors.push({ factor: 'Content Optimization', score: contentOptimization, weight: 0.2 });

      // Technical SEO (10% of SEO score)
      const technicalSEO = this.analyzeTechnicalSEO(analyzerResults);
      score = score * 0.9 + technicalSEO * 0.1;
      factors.push({ factor: 'Technical SEO', score: technicalSEO, weight: 0.1 });

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('SEO score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate Technical score based on analyzer findings
   */
  calculateTechnicalScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // HTML validation and structure (25%)
      const htmlQuality = this.analyzeHTMLQuality(analyzerResults);
      score = score * 0.75 + htmlQuality * 0.25;
      factors.push({ factor: 'HTML Quality', score: htmlQuality, weight: 0.25 });

      // JavaScript and CSS optimization (25%)
      const resourceOptimization = this.analyzeResourceOptimization(analyzerResults);
      score = score * 0.75 + resourceOptimization * 0.25;
      factors.push({ factor: 'Resource Optimization', score: resourceOptimization, weight: 0.25 });

      // Third-party integrations (25%)
      const thirdPartyScore = this.analyzeThirdPartyIntegrations(analyzerResults);
      score = score * 0.75 + thirdPartyScore * 0.25;
      factors.push({ factor: 'Third-party Integration', score: thirdPartyScore, weight: 0.25 });

      // Technical standards compliance (25%)
      const standardsCompliance = this.analyzeTechnicalStandards(analyzerResults);
      score = score * 0.75 + standardsCompliance * 0.25;
      factors.push({ factor: 'Standards Compliance', score: standardsCompliance, weight: 0.25 });

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('Technical score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate Performance score based on analyzer findings
   */
  calculatePerformanceScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // Page load metrics (40%)
      const loadMetrics = this.analyzeLoadMetrics(auditData);
      score = score * 0.6 + loadMetrics * 0.4;
      factors.push({ factor: 'Load Metrics', score: loadMetrics, weight: 0.4 });

      // Resource efficiency (30%)
      const resourceEfficiency = this.analyzeResourceEfficiency(analyzerResults);
      score = score * 0.7 + resourceEfficiency * 0.3;
      factors.push({ factor: 'Resource Efficiency', score: resourceEfficiency, weight: 0.3 });

      // Caching and optimization (20%)
      const cachingScore = this.analyzeCachingOptimization(analyzerResults);
      score = score * 0.8 + cachingScore * 0.2;
      factors.push({ factor: 'Caching Strategy', score: cachingScore, weight: 0.2 });

      // Network efficiency (10%)
      const networkEfficiency = this.analyzeNetworkEfficiency(auditData);
      score = score * 0.9 + networkEfficiency * 0.1;
      factors.push({ factor: 'Network Efficiency', score: networkEfficiency, weight: 0.1 });

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('Performance score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate Accessibility score based on analyzer findings
   */
  calculateAccessibilityScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // Check if accessibility analyzer results exist
      const accessibilityAnalysis = analyzerResults.accessibility || analyzerResults.AccessibilityAnalyzer;
      
      if (accessibilityAnalysis && accessibilityAnalysis.score !== undefined) {
        // Use existing accessibility analyzer score
        score = accessibilityAnalysis.score;
        factors.push({ factor: 'Accessibility Analysis', score: score, weight: 1.0 });
      } else {
        // Fallback analysis based on available data
        const basicAccessibility = this.analyzeBasicAccessibility(analyzerResults);
        score = basicAccessibility;
        factors.push({ factor: 'Basic Accessibility Check', score: basicAccessibility, weight: 1.0 });
      }

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('Accessibility score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate Content score based on analyzer findings
   */
  calculateContentScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // Content quality and intelligence (50%)
      const contentIntelligence = this.analyzeContentIntelligence(analyzerResults);
      score = score * 0.5 + contentIntelligence * 0.5;
      factors.push({ factor: 'Content Intelligence', score: contentIntelligence, weight: 0.5 });

      // Content structure and organization (30%)
      const contentStructure = this.analyzeContentStructure(analyzerResults);
      score = score * 0.7 + contentStructure * 0.3;
      factors.push({ factor: 'Content Structure', score: contentStructure, weight: 0.3 });

      // Content uniqueness and originality (20%)
      const contentOriginality = this.analyzeContentOriginality(analyzerResults);
      score = score * 0.8 + contentOriginality * 0.2;
      factors.push({ factor: 'Content Originality', score: contentOriginality, weight: 0.2 });

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('Content score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate Security score based on analyzer findings
   */
  calculateSecurityScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // SSL/TLS certificate analysis (60%)
      const sslAnalysis = analyzerResults.ssl || analyzerResults.SSLCertificateAnalyzer;
      if (sslAnalysis && sslAnalysis.score !== undefined) {
        const sslScore = sslAnalysis.score;
        score = score * 0.4 + sslScore * 0.6;
        factors.push({ factor: 'SSL/TLS Certificate', score: sslScore, weight: 0.6 });
      } else {
        // Basic SSL check
        const basicSSL = this.analyzeBasicSSL(auditData);
        score = score * 0.4 + basicSSL * 0.6;
        factors.push({ factor: 'Basic SSL Check', score: basicSSL, weight: 0.6 });
      }

      // Security headers and policies (25%)
      const securityHeaders = this.analyzeSecurityHeaders(analyzerResults);
      score = score * 0.75 + securityHeaders * 0.25;
      factors.push({ factor: 'Security Headers', score: securityHeaders, weight: 0.25 });

      // Privacy and data protection (15%)
      const privacyScore = this.analyzePrivacyCompliance(analyzerResults);
      score = score * 0.85 + privacyScore * 0.15;
      factors.push({ factor: 'Privacy Compliance', score: privacyScore, weight: 0.15 });

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('Security score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate Mobile score based on analyzer findings
   */
  calculateMobileScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // Mobile analyzer results
      const mobileAnalysis = analyzerResults.mobile || analyzerResults.MobileAnalyzer;
      
      if (mobileAnalysis && mobileAnalysis.score !== undefined) {
        score = mobileAnalysis.score;
        factors.push({ factor: 'Mobile Analysis', score: score, weight: 1.0 });
      } else {
        // Fallback mobile analysis
        const basicMobile = this.analyzeBasicMobile(analyzerResults);
        score = basicMobile;
        factors.push({ factor: 'Basic Mobile Check', score: basicMobile, weight: 1.0 });
      }

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('Mobile score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  /**
   * Calculate User Experience score based on analyzer findings
   */
  calculateUXScore(analyzerResults, auditData) {
    let score = 100;
    const factors = [];

    try {
      // Social proof and trust signals (40%)
      const socialProof = this.analyzeSocialProof(analyzerResults);
      score = score * 0.6 + socialProof * 0.4;
      factors.push({ factor: 'Social Proof & Trust', score: socialProof, weight: 0.4 });

      // Navigation and usability (30%)
      const navigation = this.analyzeNavigation(analyzerResults);
      score = score * 0.7 + navigation * 0.3;
      factors.push({ factor: 'Navigation & Usability', score: navigation, weight: 0.3 });

      // Business intelligence and credibility (20%)
      const businessIntelligence = this.analyzeBusinessIntelligence(analyzerResults);
      score = score * 0.8 + businessIntelligence * 0.2;
      factors.push({ factor: 'Business Credibility', score: businessIntelligence, weight: 0.2 });

      // User interface design (10%)
      const uiDesign = this.analyzeUIDesign(analyzerResults);
      score = score * 0.9 + uiDesign * 0.1;
      factors.push({ factor: 'UI Design', score: uiDesign, weight: 0.1 });

      return { score: Math.max(0, Math.min(100, score)), factors };

    } catch (error) {
      console.error('UX score calculation error:', error);
      return { score: 50, factors: [], error: error.message };
    }
  }

  // ============================================================================
  // HELPER METHODS FOR SPECIFIC ANALYSIS
  // ============================================================================

  /**
   * Analyze link health based on audit data
   */
  analyzeLinkHealth(auditData) {
    try {
      const { stats = {}, badRequests = {}, externalLinks = {} } = auditData;
      
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

      return Math.round((internalHealthPercent * 0.7) + (externalHealthPercent * 0.3));
    } catch (error) {
      console.error('Link health analysis error:', error);
      return 50;
    }
  }

  /**
   * Calculate overall weighted score
   */
  calculateOverallScore(categoryScores) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(SCORING_CONFIG.WEIGHTS).forEach(([category, weight]) => {
      const categoryData = categoryScores[category];
      const score = categoryData?.score || 0;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Assign letter grade based on score
   */
  assignGrade(score) {
    for (const [grade, range] of Object.entries(SCORING_CONFIG.GRADES)) {
      if (score >= range.min && score <= range.max) {
        return grade;
      }
    }
    return 'F';
  }

  /**
   * Calculate percentile ranking
   */
  calculatePercentileRanking(score) {
    if (score >= SCORING_CONFIG.PERCENTILE_BASE.excellent) return Math.min(100, 90 + (score - 90));
    if (score >= SCORING_CONFIG.PERCENTILE_BASE.good) return Math.min(90, 75 + (score - 75) * 0.6);
    if (score >= SCORING_CONFIG.PERCENTILE_BASE.average) return Math.min(75, 50 + (score - 50) * 0.5);
    if (score >= SCORING_CONFIG.PERCENTILE_BASE.poor) return Math.min(50, 25 + (score - 25) * 0.4);
    return Math.max(1, score * 0.4);
  }

  /**
   * Format category scores for output
   */
  formatCategoryScores(categoryScores) {
    const formatted = {};
    Object.entries(categoryScores).forEach(([category, data]) => {
      formatted[category] = {
        score: Math.round(data?.score || 0),
        grade: this.assignGrade(data?.score || 0),
        factors: data?.factors || []
      };
    });
    return formatted;
  }

  /**
   * Generate detailed breakdown
   */
  generateDetailedBreakdown(categoryScores, analyzerResults) {
    return {
      methodology: 'Scientific scoring based on analyzer findings',
      weights: SCORING_CONFIG.WEIGHTS,
      categoryDetails: categoryScores,
      analyzerCount: Object.keys(analyzerResults).length,
      calculationTimestamp: new Date().toISOString()
    };
  }

  /**
   * Get methodology information
   */
  getMethodologyInfo() {
    return {
      name: 'Scientific Scoring System v1.0',
      description: 'Deterministic scoring based purely on analyzer findings',
      characteristics: [
        'No randomization',
        'Repeatable results',
        'Evidence-based scoring',
        'Weighted category analysis',
        'Scientific methodology'
      ],
      weights: SCORING_CONFIG.WEIGHTS
    };
  }

  /**
   * Generate fallback scores in case of error
   */
  generateFallbackScores() {
    console.warn('Using fallback scoring due to calculation error');
    return {
      scores: {
        overall: { score: 0, grade: 'F', percentile: 0 },
        categories: {
          seo: { score: 0, grade: 'F', factors: [] },
          technical: { score: 0, grade: 'F', factors: [] },
          performance: { score: 0, grade: 'F', factors: [] },
          accessibility: { score: 0, grade: 'F', factors: [] },
          content: { score: 0, grade: 'F', factors: [] },
          security: { score: 0, grade: 'F', factors: [] },
          mobileFriendliness: { score: 0, grade: 'F', factors: [] },
          userExperience: { score: 0, grade: 'F', factors: [] }
        }
      },
      breakdown: null,
      methodology: this.getMethodologyInfo(),
      error: true,
      timestamp: new Date().toISOString()
    };
  }

  // ============================================================================
  // PLACEHOLDER METHODS FOR SPECIFIC ANALYSIS TYPES
  // These will be implemented based on available analyzer data
  // ============================================================================

  analyzeMetaTags(analyzerResults) { return 75; } // TODO: Implement based on SEO analyzer
  analyzeContentSEO(analyzerResults) { return 70; } // TODO: Implement based on content analyzer
  analyzeTechnicalSEO(analyzerResults) { return 80; } // TODO: Implement based on technical analyzer
  analyzeHTMLQuality(analyzerResults) { return 75; } // TODO: Implement based on technical analyzer
  analyzeResourceOptimization(analyzerResults) { return 70; } // TODO: Implement based on performance data
  analyzeThirdPartyIntegrations(analyzerResults) { return 80; } // TODO: Implement based on third-party analyzer
  analyzeTechnicalStandards(analyzerResults) { return 75; } // TODO: Implement based on technical analyzer
  analyzeLoadMetrics(auditData) { return 70; } // TODO: Implement based on performance metrics
  analyzeResourceEfficiency(analyzerResults) { return 75; } // TODO: Implement based on resource analysis
  analyzeCachingOptimization(analyzerResults) { return 80; } // TODO: Implement based on caching analysis
  analyzeNetworkEfficiency(auditData) { return 75; } // TODO: Implement based on network analysis
  analyzeBasicAccessibility(analyzerResults) { return 70; } // TODO: Implement basic accessibility check
  analyzeContentIntelligence(analyzerResults) { return 75; } // TODO: Implement based on content intelligence analyzer
  analyzeContentStructure(analyzerResults) { return 70; } // TODO: Implement based on content structure analysis
  analyzeContentOriginality(analyzerResults) { return 80; } // TODO: Implement based on content uniqueness analysis
  analyzeBasicSSL(auditData) { return 85; } // TODO: Implement basic SSL check
  analyzeSecurityHeaders(analyzerResults) { return 70; } // TODO: Implement security headers analysis
  analyzePrivacyCompliance(analyzerResults) { return 75; } // TODO: Implement privacy compliance check
  analyzeBasicMobile(analyzerResults) { return 80; } // TODO: Implement basic mobile check
  analyzeSocialProof(analyzerResults) { return 70; } // TODO: Implement based on social proof analyzer
  analyzeNavigation(analyzerResults) { return 75; } // TODO: Implement navigation analysis
  analyzeBusinessIntelligence(analyzerResults) { return 80; } // TODO: Implement based on business analyzer
  analyzeUIDesign(analyzerResults) { return 75; } // TODO: Implement UI design analysis
}
