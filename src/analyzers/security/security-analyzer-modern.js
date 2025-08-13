/**
 * ============================================================================
 * SECURITY ANALYZER MODERN - Combined Approach Implementation
 * ============================================================================
 * 
 * Main Security Analyzer implementing the proven Combined Approach pattern
 * that successfully modernized Performance and Content analyzers.
 * 
 * Architecture:
 * - GPT-5 Style Modular Components (Detectors: SSL, Headers, Vulnerabilities)
 * - GPT-5 Style Heuristics (Risk Analysis, Threat Modeling)
 * - GPT-5 Style Rules Engine (Compliance Assessment, Scoring)
 * - Claude Style AI Enhancement (Threat Intelligence, Predictive Analytics)
 * - Centralized Configuration Management
 * - Seamless Integration with Existing SecurityAnalyzer
 * 
 * Features:
 * - Comprehensive security analysis across all major vectors
 * - Multi-framework compliance assessment (OWASP, NIST, ISO27001, PCI DSS)
 * - AI-powered threat intelligence and predictive analytics
 * - Real-time risk assessment and prioritization
 * - Automated compliance scoring and gap analysis
 * - Enterprise-grade security recommendations
 * - Scalable and maintainable modular architecture
 * 
 * @module SecurityAnalyzerModern
 * @version 1.0.0
 * @author AI Assistant (Combined Approach)
 * @created 2025-08-12
 */

// Import Combined Approach Components
import { SSLSecurityDetector } from './detectors/ssl-security-detector.js';
import { SecurityHeadersDetector } from './detectors/security-headers-detector.js';
import { VulnerabilityDetector } from './detectors/vulnerability-detector.js';
import { SecurityRiskAnalyzer } from './heuristics/security-risk-analyzer.js';
import { SecurityComplianceEngine } from './rules/security-compliance-engine.js';
import { SecurityAIEnhancer } from './ai/security-ai-enhancer.js';
import { SecurityConfiguration } from './config/security-configuration.js';

// Import existing components for integration
import { SecurityAnalyzer as LegacySecurityAnalyzer } from '../security-analyzer.js';

/**
 * Security Analyzer Modern Class
 * 
 * Implements the Combined Approach pattern for security analysis:
 * 1. GPT-5 style modular detectors perform initial analysis
 * 2. Heuristic analyzers process detection results with advanced algorithms
 * 3. Rules engine applies compliance frameworks and scoring
 * 4. AI enhancer adds intelligence and predictive capabilities
 * 5. Integration layer ensures compatibility with existing systems
 */
export class SecurityAnalyzerModern {
  constructor(options = {}) {
    // Initialize configuration management
    this.config = new SecurityConfiguration(options);
    const fullConfig = this.config.getConfig();
    
    console.log(`🔐 Security Analyzer Modern: Initializing Combined Approach architecture`);
    console.log(`📊 Environment: ${this.config.environment} | Features: ${this.config.getConfigSummary().featuresEnabled.length}`);
    
    // Initialize GPT-5 style detectors
    this.detectors = {
      ssl: new SSLSecurityDetector(this.config.getDetectorConfig('ssl')),
      headers: new SecurityHeadersDetector(this.config.getDetectorConfig('headers')),
      vulnerabilities: new VulnerabilityDetector(this.config.getDetectorConfig('vulnerabilities'))
    };
    
    // Initialize GPT-5 style heuristics
    this.heuristics = {
      riskAnalyzer: new SecurityRiskAnalyzer(this.config.getHeuristicConfig('risk'))
    };
    
    // Initialize GPT-5 style rules engine
    this.rulesEngine = new SecurityComplianceEngine(this.config.getRulesConfig());
    
    // Initialize Claude style AI enhancer (if enabled)
    this.aiEnhancer = this.config.isFeatureEnabled('ai_enhancement') ? 
      new SecurityAIEnhancer(this.config.getAIConfig()) : null;
    
    // Initialize legacy integration
    this.legacyAnalyzer = new LegacySecurityAnalyzer(options);
    
    // Component metadata
    this.name = 'SecurityAnalyzerModern';
    this.version = '1.0.0';
    this.architecture = 'Combined Approach';
    this.lastAnalysis = null;
    
    console.log(`✅ Security Analyzer Modern initialized successfully`);
  }

  /**
   * Perform Comprehensive Security Analysis
   * 
   * Implements the Complete Combined Approach workflow:
   * 1. Detection Phase - Modular component analysis
   * 2. Heuristic Phase - Advanced algorithmic processing  
   * 3. Rules Phase - Compliance assessment and scoring
   * 4. AI Enhancement Phase - Intelligence and predictions
   * 5. Integration Phase - Legacy compatibility and output formatting
   * 
   * @param {Object} context - Analysis context
   * @param {Document} context.document - DOM document
   * @param {Object} context.headers - HTTP response headers
   * @param {string} context.url - Page URL
   * @param {Object} context.pageData - Additional page data
   * @returns {Object} Comprehensive security analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      console.log(`🔐 Security Analyzer Modern: Starting comprehensive analysis for ${context.url}`);
      
      // Phase 1: Detection - GPT-5 Style Modular Components
      console.log(`🔍 Phase 1: Running detection components...`);
      const detectionResults = await this._runDetectionPhase(context);
      
      // Phase 2: Heuristic Analysis - Advanced Processing
      console.log(`🧠 Phase 2: Running heuristic analysis...`);
      const heuristicResults = await this._runHeuristicPhase(detectionResults, context);
      
      // Phase 3: Rules Engine - Compliance and Scoring
      console.log(`📋 Phase 3: Running compliance assessment...`);
      const rulesResults = await this._runRulesPhase(heuristicResults, context);
      
      // Phase 4: AI Enhancement - Intelligence Layer (if enabled)
      let aiResults = null;
      if (this.aiEnhancer) {
        console.log(`🤖 Phase 4: Running AI enhancement...`);
        aiResults = await this._runAIEnhancementPhase(heuristicResults, context);
      }
      
      // Phase 5: Integration - Legacy Compatibility
      console.log(`🔗 Phase 5: Running legacy integration...`);
      const legacyResults = await this._runLegacyIntegration(context);
      
      // Combine all results using Combined Approach orchestration
      const combinedResults = this._orchestrateResults({
        detection: detectionResults,
        heuristics: heuristicResults,
        rules: rulesResults,
        ai: aiResults,
        legacy: legacyResults,
        context
      });
      
      // Generate final insights and recommendations
      combinedResults.insights = this._generateCombinedInsights(combinedResults);
      combinedResults.recommendations = this._generateCombinedRecommendations(combinedResults);
      
      // Calculate analysis metrics
      const analysisTime = Date.now() - startTime;
      combinedResults.metadata = this._generateAnalysisMetadata(analysisTime, combinedResults);
      
      // Store analysis for future reference
      this.lastAnalysis = combinedResults;
      
      console.log(`✅ Security Analysis complete: ${combinedResults.overallSecurityScore}/100 (${analysisTime}ms)`);
      console.log(`📊 Results: ${combinedResults.insights.length} insights, ${combinedResults.recommendations.length} recommendations`);
      
      return combinedResults;
      
    } catch (error) {
      console.error(`❌ Security Analyzer Modern Error: ${error.message}`);
      return this._generateErrorResponse(error, context);
    }
  }

  /**
   * Phase 1: Run Detection Components
   * 
   * @param {Object} context - Analysis context
   * @returns {Object} Detection results from all components
   * @private
   */
  async _runDetectionPhase(context) {
    const detectionResults = {};
    const detectionPromises = [];

    // Run all detectors in parallel for optimal performance
    if (this.config.isFeatureEnabled('ssl_security_detection')) {
      detectionPromises.push(
        this.detectors.ssl.detect(context)
          .then(result => { detectionResults.ssl = result; })
          .catch(error => { detectionResults.ssl = { error: error.message }; })
      );
    }

    if (this.config.isFeatureEnabled('security_headers_detection')) {
      detectionPromises.push(
        this.detectors.headers.detect(context)
          .then(result => { detectionResults.headers = result; })
          .catch(error => { detectionResults.headers = { error: error.message }; })
      );
    }

    if (this.config.isFeatureEnabled('vulnerability_detection')) {
      detectionPromises.push(
        this.detectors.vulnerabilities.detect(context)
          .then(result => { detectionResults.vulnerabilities = result; })
          .catch(error => { detectionResults.vulnerabilities = { error: error.message }; })
      );
    }

    // Wait for all detectors to complete
    await Promise.all(detectionPromises);

    console.log(`🔍 Detection phase complete: ${Object.keys(detectionResults).length} detectors executed`);
    return detectionResults;
  }

  /**
   * Phase 2: Run Heuristic Analysis
   * 
   * @param {Object} detectionResults - Results from detection phase
   * @param {Object} context - Analysis context
   * @returns {Object} Heuristic analysis results
   * @private
   */
  async _runHeuristicPhase(detectionResults, context) {
    const heuristicResults = {};

    try {
      // Security Risk Analysis - Primary heuristic component
      if (this.config.isFeatureEnabled('security_risk_analysis')) {
        heuristicResults.riskAnalysis = await this.heuristics.riskAnalyzer.analyze(detectionResults);
      }

      console.log(`🧠 Heuristic phase complete: Risk analysis processed`);
      
    } catch (error) {
      heuristicResults.error = error.message;
      console.warn(`⚠️ Heuristic phase error: ${error.message}`);
    }

    return heuristicResults;
  }

  /**
   * Phase 3: Run Rules Engine
   * 
   * @param {Object} heuristicResults - Results from heuristic analysis
   * @param {Object} context - Analysis context
   * @returns {Object} Rules engine results
   * @private
   */
  async _runRulesPhase(heuristicResults, context) {
    const rulesResults = {};

    try {
      // Compliance Assessment - Primary rules component
      if (this.config.isFeatureEnabled('compliance_assessment')) {
        rulesResults.compliance = await this.rulesEngine.assess(heuristicResults);
      }

      console.log(`📋 Rules phase complete: Compliance assessment processed`);
      
    } catch (error) {
      rulesResults.error = error.message;
      console.warn(`⚠️ Rules phase error: ${error.message}`);
    }

    return rulesResults;
  }

  /**
   * Phase 4: Run AI Enhancement
   * 
   * @param {Object} heuristicResults - Results from heuristic analysis
   * @param {Object} context - Analysis context
   * @returns {Object} AI enhancement results
   * @private
   */
  async _runAIEnhancementPhase(heuristicResults, context) {
    const aiResults = {};

    try {
      // AI Enhancement - Intelligence and predictions
      aiResults.enhancement = await this.aiEnhancer.enhance(heuristicResults);
      
      console.log(`🤖 AI enhancement phase complete: Intelligence layer processed`);
      
    } catch (error) {
      aiResults.error = error.message;
      console.warn(`⚠️ AI enhancement phase error: ${error.message}`);
    }

    return aiResults;
  }

  /**
   * Phase 5: Run Legacy Integration
   * 
   * @param {Object} context - Analysis context
   * @returns {Object} Legacy analyzer results
   * @private
   */
  async _runLegacyIntegration(context) {
    const legacyResults = {};

    try {
      // Run legacy analyzer for compatibility and data completeness
      legacyResults.legacy = await this.legacyAnalyzer.analyze(context);
      
      console.log(`🔗 Legacy integration complete: Backward compatibility ensured`);
      
    } catch (error) {
      legacyResults.error = error.message;
      console.warn(`⚠️ Legacy integration error: ${error.message}`);
    }

    return legacyResults;
  }

  /**
   * Orchestrate Combined Results
   * 
   * Combines results from all phases using the Combined Approach methodology
   * 
   * @param {Object} allResults - Results from all analysis phases
   * @returns {Object} Orchestrated combined results
   * @private
   */
  _orchestrateResults(allResults) {
    const { detection, heuristics, rules, ai, legacy, context } = allResults;

    // Primary orchestration using heuristics-first approach
    let primaryResults = heuristics.riskAnalysis?.analysis || {};

    // Enhance with rules engine results
    if (rules.compliance?.assessment) {
      primaryResults.compliance = rules.compliance.assessment;
    }

    // Enhance with AI insights (if available)
    if (ai?.enhancement?.enhancement) {
      primaryResults.aiEnhancement = ai.enhancement.enhancement;
      primaryResults.predictiveAnalytics = ai.enhancement.enhancement.predictiveAnalytics;
    }

    // Integrate legacy results for completeness
    if (legacy.legacy) {
      primaryResults.legacyIntegration = {
        securityScore: legacy.legacy.securityScore,
        complianceScores: legacy.legacy.complianceScores,
        existingData: legacy.legacy
      };
    }

    // Calculate comprehensive security scores
    const securityScoring = this._calculateComprehensiveSecurityScore({
      detection,
      heuristics,
      rules,
      ai,
      legacy
    });

    return {
      // Core analysis results
      analyzer: this.name,
      version: this.version,
      architecture: this.architecture,
      timestamp: new Date().toISOString(),
      
      // Combined approach results
      detectionResults: detection,
      heuristicResults: heuristics,
      rulesResults: rules,
      aiResults: ai,
      legacyResults: legacy,
      
      // Primary analysis output
      securityAnalysis: primaryResults,
      
      // Comprehensive scoring
      overallSecurityScore: securityScoring.overall,
      categoryScores: securityScoring.categories,
      securityGrade: this._calculateSecurityGrade(securityScoring.overall),
      
      // Risk assessment
      riskLevel: this._determineRiskLevel(securityScoring.overall),
      criticalIssues: this._extractCriticalIssues(allResults),
      
      // Analysis context
      analysisContext: {
        url: context.url,
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        featuresEnabled: this.config.getConfigSummary().featuresEnabled
      }
    };
  }

  /**
   * Calculate Comprehensive Security Score
   * 
   * @param {Object} allResults - All analysis results
   * @returns {Object} Comprehensive scoring
   * @private
   */
  _calculateComprehensiveSecurityScore(allResults) {
    const scoring = {
      overall: 0,
      categories: {
        ssl: 0,
        headers: 0,
        vulnerabilities: 0,
        compliance: 0,
        risk: 0
      }
    };

    let totalWeight = 0;
    const weights = {
      ssl: 0.20,
      headers: 0.20,
      vulnerabilities: 0.25,
      compliance: 0.20,
      risk: 0.15
    };

    // SSL Security Score
    if (allResults.detection.ssl?.analysis?.score) {
      scoring.categories.ssl = allResults.detection.ssl.analysis.score;
      scoring.overall += scoring.categories.ssl * weights.ssl;
      totalWeight += weights.ssl;
    }

    // Security Headers Score
    if (allResults.detection.headers?.analysis?.score) {
      scoring.categories.headers = allResults.detection.headers.analysis.score;
      scoring.overall += scoring.categories.headers * weights.headers;
      totalWeight += weights.headers;
    }

    // Vulnerability Score (inverted - fewer vulnerabilities = higher score)
    if (allResults.detection.vulnerabilities?.analysis?.summary) {
      const vulnSummary = allResults.detection.vulnerabilities.analysis.summary;
      const vulnScore = Math.max(0, 100 - (vulnSummary.criticalIssues * 25 + vulnSummary.highIssues * 15 + vulnSummary.mediumIssues * 8));
      scoring.categories.vulnerabilities = vulnScore;
      scoring.overall += vulnScore * weights.vulnerabilities;
      totalWeight += weights.vulnerabilities;
    }

    // Compliance Score
    if (allResults.rules.compliance?.assessment?.overallCompliance?.score) {
      scoring.categories.compliance = allResults.rules.compliance.assessment.overallCompliance.score;
      scoring.overall += scoring.categories.compliance * weights.compliance;
      totalWeight += weights.compliance;
    }

    // Risk Score (inverted - lower risk = higher score)
    if (allResults.heuristics.riskAnalysis?.analysis?.overallRisk?.score) {
      const riskScore = Math.max(0, 100 - allResults.heuristics.riskAnalysis.analysis.overallRisk.score);
      scoring.categories.risk = riskScore;
      scoring.overall += riskScore * weights.risk;
      totalWeight += weights.risk;
    }

    // Normalize overall score
    if (totalWeight > 0) {
      scoring.overall = Math.round(scoring.overall / totalWeight);
    }

    return scoring;
  }

  /**
   * Generate Combined Insights
   * 
   * @param {Object} combinedResults - Combined analysis results
   * @returns {Array} Combined insights from all phases
   * @private
   */
  _generateCombinedInsights(combinedResults) {
    const insights = [];

    try {
      // Extract insights from each phase
      if (combinedResults.detectionResults.ssl?.analysis?.insights) {
        insights.push(...combinedResults.detectionResults.ssl.analysis.insights.map(insight => ({
          ...insight,
          source: 'ssl_detector',
          phase: 'detection'
        })));
      }

      if (combinedResults.detectionResults.headers?.analysis?.insights) {
        insights.push(...combinedResults.detectionResults.headers.analysis.insights.map(insight => ({
          ...insight,
          source: 'headers_detector',
          phase: 'detection'
        })));
      }

      if (combinedResults.heuristicResults.riskAnalysis?.analysis?.insights) {
        insights.push(...combinedResults.heuristicResults.riskAnalysis.analysis.insights.map(insight => ({
          ...insight,
          source: 'risk_analyzer',
          phase: 'heuristics'
        })));
      }

      if (combinedResults.rulesResults.compliance?.assessment?.insights) {
        insights.push(...combinedResults.rulesResults.compliance.assessment.insights.map(insight => ({
          ...insight,
          source: 'compliance_engine',
          phase: 'rules'
        })));
      }

      if (combinedResults.aiResults?.enhancement?.enhancement?.aiInsights) {
        insights.push(...combinedResults.aiResults.enhancement.enhancement.aiInsights.map(insight => ({
          ...insight,
          source: 'ai_enhancer',
          phase: 'ai'
        })));
      }

      // Add overall insights
      insights.push({
        type: 'summary',
        category: 'overall',
        message: `Security analysis complete with overall score of ${combinedResults.overallSecurityScore}/100`,
        importance: combinedResults.overallSecurityScore >= 80 ? 'medium' : 'high',
        source: 'combined_approach',
        phase: 'orchestration'
      });

    } catch (error) {
      insights.push({
        type: 'error',
        category: 'insights',
        message: `Error generating insights: ${error.message}`,
        importance: 'low',
        source: 'orchestrator',
        phase: 'orchestration'
      });
    }

    return insights;
  }

  /**
   * Generate Combined Recommendations
   * 
   * @param {Object} combinedResults - Combined analysis results
   * @returns {Array} Combined recommendations from all phases
   * @private
   */
  _generateCombinedRecommendations(combinedResults) {
    const recommendations = [];

    try {
      // Extract recommendations from each phase
      if (combinedResults.detectionResults.ssl?.analysis?.recommendations) {
        recommendations.push(...combinedResults.detectionResults.ssl.analysis.recommendations.map(rec => ({
          ...rec,
          source: 'ssl_detector',
          phase: 'detection'
        })));
      }

      if (combinedResults.detectionResults.headers?.analysis?.recommendations) {
        recommendations.push(...combinedResults.detectionResults.headers.analysis.recommendations.map(rec => ({
          ...rec,
          source: 'headers_detector',
          phase: 'detection'
        })));
      }

      if (combinedResults.heuristicResults.riskAnalysis?.analysis?.recommendations) {
        recommendations.push(...combinedResults.heuristicResults.riskAnalysis.analysis.recommendations.map(rec => ({
          ...rec,
          source: 'risk_analyzer',
          phase: 'heuristics'
        })));
      }

      if (combinedResults.rulesResults.compliance?.assessment?.recommendations) {
        recommendations.push(...combinedResults.rulesResults.compliance.assessment.recommendations.map(rec => ({
          ...rec,
          source: 'compliance_engine',
          phase: 'rules'
        })));
      }

      if (combinedResults.aiResults?.enhancement?.enhancement?.intelligentRecommendations) {
        recommendations.push(...combinedResults.aiResults.enhancement.enhancement.intelligentRecommendations.map(rec => ({
          ...rec,
          source: 'ai_enhancer',
          phase: 'ai'
        })));
      }

      // Sort recommendations by priority
      recommendations.sort((a, b) => {
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    } catch (error) {
      recommendations.push({
        priority: 'low',
        category: 'error',
        title: 'Recommendation Generation Error',
        description: `Error generating recommendations: ${error.message}`,
        actionItems: ['Review security analyzer configuration', 'Contact security team'],
        source: 'orchestrator',
        phase: 'orchestration'
      });
    }

    return recommendations;
  }

  /**
   * Generate Analysis Metadata
   * 
   * @param {number} analysisTime - Time taken for analysis
   * @param {Object} results - Analysis results
   * @returns {Object} Analysis metadata
   * @private
   */
  _generateAnalysisMetadata(analysisTime, results) {
    return {
      version: this.version,
      architecture: this.architecture,
      analysisTime: `${analysisTime}ms`,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      componentsExecuted: {
        detectors: Object.keys(results.detectionResults).length,
        heuristics: Object.keys(results.heuristicResults).length,
        rules: Object.keys(results.rulesResults).length,
        ai: results.aiResults ? 1 : 0,
        legacy: results.legacyResults ? 1 : 0
      },
      performanceMetrics: {
        analysisTime,
        performanceOptimization: this.config.config.performanceOptimization,
        memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed : 'unknown'
      },
      qualityMetrics: {
        insightsGenerated: results.insights?.length || 0,
        recommendationsGenerated: results.recommendations?.length || 0,
        criticalIssuesFound: results.criticalIssues?.length || 0
      }
    };
  }

  // Helper methods
  _calculateSecurityGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  _determineRiskLevel(score) {
    if (score >= 90) return 'low';
    if (score >= 75) return 'medium';
    if (score >= 60) return 'high';
    return 'critical';
  }

  _extractCriticalIssues(allResults) {
    const criticalIssues = [];
    
    // Extract from vulnerability detection
    if (allResults.detection.vulnerabilities?.analysis?.summary?.criticalIssues > 0) {
      criticalIssues.push(`${allResults.detection.vulnerabilities.analysis.summary.criticalIssues} critical vulnerabilities detected`);
    }
    
    // Extract from compliance assessment
    if (allResults.rules.compliance?.assessment?.gapAnalysis?.criticalGaps?.length > 0) {
      criticalIssues.push(`${allResults.rules.compliance.assessment.gapAnalysis.criticalGaps.length} critical compliance gaps`);
    }
    
    return criticalIssues;
  }

  _generateErrorResponse(error, context) {
    return {
      analyzer: this.name,
      version: this.version,
      error: error.message,
      timestamp: new Date().toISOString(),
      context: {
        url: context.url,
        environment: this.config.environment
      }
    };
  }

  /**
   * Get Metadata
   * 
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      architecture: this.architecture,
      description: 'Modern security analyzer implementing Combined Approach architecture with comprehensive threat detection, compliance assessment, and AI enhancement',
      features: [
        'SSL/TLS security analysis',
        'Security headers evaluation',
        'Vulnerability detection and assessment',
        'Multi-framework compliance assessment',
        'Risk analysis and threat modeling',
        'AI-powered threat intelligence',
        'Predictive security analytics',
        'Behavioral analysis and anomaly detection',
        'Legacy system integration'
      ],
      components: {
        detectors: Object.keys(this.detectors),
        heuristics: Object.keys(this.heuristics),
        rulesEngine: 'SecurityComplianceEngine',
        aiEnhancer: this.aiEnhancer ? 'SecurityAIEnhancer' : null,
        configuration: 'SecurityConfiguration'
      },
      capabilities: {
        realTimeAnalysis: true,
        predictiveAnalytics: this.config.isFeatureEnabled('ai_predictive_analytics'),
        complianceAssessment: true,
        threatIntelligence: this.config.isFeatureEnabled('ai_threat_intelligence'),
        legacyCompatibility: true
      },
      configuration: this.config.getConfigSummary()
    };
  }
}

export default SecurityAnalyzerModern;
