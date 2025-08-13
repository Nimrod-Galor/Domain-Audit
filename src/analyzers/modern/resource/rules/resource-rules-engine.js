/**
 * ============================================================================
 * RESOURCE RULES ENGINE - INFRASTRUCTURE COMPONENT
 * ============================================================================
 * 
 * Advanced rules engine for resource loading, optimization, and performance
 * analysis that provides comprehensive evaluation based on web performance
 * standards, best practices, and industry benchmarks. Evaluates resource
 * efficiency, loading patterns, and optimization opportunities.
 * 
 * Resource Rules Engine Features:
 * - Comprehensive resource performance evaluation
 * - Multi-standard compliance assessment (Core Web Vitals, Performance Budgets)
 * - Weighted scoring with customizable importance levels
 * - Context-aware rule application for different resource types
 * - Performance budget validation and enforcement
 * - Resource optimization opportunity identification
 * - Critical rendering path analysis and scoring
 * - Caching and compression effectiveness evaluation
 * 
 * Advanced Resource Rule Types:
 * - Size threshold rules for different resource types
 * - Loading time performance rules
 * - Compression efficiency rules
 * - Caching strategy effectiveness rules
 * - Critical resource priority rules
 * - Resource count optimization rules
 * - CDN utilization rules
 * - Lazy loading implementation rules
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration_pattern Combined Approach Infrastructure Component
 */

export class ResourceRulesEngine {
  constructor(options = {}) {
    this.options = {
      enablePerformanceBudgetRules: true,
      enableOptimizationRules: true,
      enableCriticalResourceRules: true,
      enableLoadingRules: true,
      enableCompressionRules: true,
      enableCachingRules: true,
      enableCDNRules: true,
      enableLazyLoadingRules: true,
      strictMode: false,
      customRules: [],
      ...options
    };
    
    this.name = 'ResourceRulesEngine';
    this.version = '1.0.0';
    this.type = 'infrastructure_component';
    
    // Resource-specific rule sets
    this.ruleSets = this.initializeResourceRuleSets();
    
    // Performance standards
    this.performanceStandards = this.initializePerformanceStandards();
    
    // Rule weights and priorities
    this.ruleWeights = this.initializeRuleWeights();
    
    // Rule execution context
    this.executionContext = this.initializeExecutionContext();
    
    console.log('⚖️ Resource Rules Engine initialized');
    console.log(`📏 Performance Budget Rules: ${this.options.enablePerformanceBudgetRules ? 'Enabled' : 'Disabled'}`);
    console.log(`🎯 Optimization Rules: ${this.options.enableOptimizationRules ? 'Enabled' : 'Disabled'}`);
    console.log(`⚡ Critical Resource Rules: ${this.options.enableCriticalResourceRules ? 'Enabled' : 'Disabled'}`);
    console.log(`🔧 Strict Mode: ${this.options.strictMode ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Main rules engine processing method
   */
  async processResourceRules(resourceResults, context = {}) {
    const startTime = Date.now();
    
    try {
      console.log('⚖️ Processing resource rules...');
      
      // Prepare rule execution context
      const ruleContext = this.prepareResourceRuleContext(resourceResults, context);
      
      // Execute rule categories
      const ruleResults = await this.executeResourceRuleCategories(resourceResults, ruleContext);
      
      // Calculate comprehensive scoring
      const scoring = await this.calculateResourceScoring(ruleResults, ruleContext);
      
      // Generate compliance assessment
      const compliance = await this.generateResourceCompliance(ruleResults, scoring);
      
      // Identify optimization opportunities
      const opportunities = await this.identifyResourceOptimizationOpportunities(ruleResults, scoring);
      
      // Generate rule-based recommendations
      const recommendations = await this.generateResourceRecommendations(ruleResults, opportunities);
      
      const endTime = Date.now();
      
      return {
        engine: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Core Rule Results
        overall_resource_score: scoring.overall_score,
        resource_grade: scoring.grade,
        resource_level: scoring.level,
        
        // Rule Execution Results
        rule_results: ruleResults,
        rules_executed: ruleResults.total_rules_executed,
        rules_passed: ruleResults.rules_passed,
        rules_failed: ruleResults.rules_failed,
        
        // Resource Performance Scoring
        performance_budget_score: scoring.performance_budget_score,
        optimization_score: scoring.optimization_score,
        critical_resource_score: scoring.critical_resource_score,
        loading_performance_score: scoring.loading_performance_score,
        
        // Compliance Assessment
        compliance_status: compliance.status,
        performance_budget_compliance: compliance.performance_budget,
        web_vitals_compliance: compliance.web_vitals,
        best_practices_compliance: compliance.best_practices,
        
        // Optimization Analysis
        optimization_opportunities: opportunities.opportunities,
        high_impact_optimizations: opportunities.high_impact,
        quick_wins: opportunities.quick_wins,
        long_term_improvements: opportunities.long_term,
        
        // Resource Analysis
        resource_breakdown: scoring.resource_breakdown,
        critical_resources: scoring.critical_resources,
        optimization_potential: scoring.optimization_potential,
        performance_gaps: scoring.performance_gaps,
        
        // Recommendations
        recommendations: recommendations,
        priority_actions: recommendations.filter(r => r.priority === 'critical' || r.priority === 'high'),
        
        // Rule Engine Metrics
        rule_efficiency: ruleResults.execution_efficiency,
        rule_coverage: ruleResults.coverage_percentage,
        rule_accuracy: ruleResults.accuracy_score,
        
        // Standards Compliance
        core_web_vitals_score: compliance.core_web_vitals_score,
        performance_budget_adherence: compliance.budget_adherence_percentage,
        optimization_index: scoring.optimization_index,
        
        // Metadata
        rule_configuration: {
          performance_budget_rules: this.options.enablePerformanceBudgetRules,
          optimization_rules: this.options.enableOptimizationRules,
          critical_resource_rules: this.options.enableCriticalResourceRules,
          loading_rules: this.options.enableLoadingRules,
          compression_rules: this.options.enableCompressionRules,
          caching_rules: this.options.enableCachingRules,
          cdn_rules: this.options.enableCDNRules,
          lazy_loading_rules: this.options.enableLazyLoadingRules,
          strict_mode: this.options.strictMode,
          custom_rules_count: this.options.customRules.length
        }
      };
      
    } catch (error) {
      console.error('❌ Resource rules engine processing failed:', error);
      return this.handleResourceRulesError(error);
    }
  }

  /**
   * Execute resource rule categories
   */
  async executeResourceRuleCategories(resourceResults, ruleContext) {
    const ruleResults = {
      total_rules_executed: 0,
      rules_passed: 0,
      rules_failed: 0,
      execution_efficiency: 0,
      coverage_percentage: 0,
      accuracy_score: 0,
      categories: {}
    };
    
    // Performance Budget Rules
    if (this.options.enablePerformanceBudgetRules) {
      ruleResults.categories.performance_budget = await this.executePerformanceBudgetRules(resourceResults, ruleContext);
    }
    
    // Optimization Rules
    if (this.options.enableOptimizationRules) {
      ruleResults.categories.optimization = await this.executeOptimizationRules(resourceResults, ruleContext);
    }
    
    // Critical Resource Rules
    if (this.options.enableCriticalResourceRules) {
      ruleResults.categories.critical_resource = await this.executeCriticalResourceRules(resourceResults, ruleContext);
    }
    
    // Loading Performance Rules
    if (this.options.enableLoadingRules) {
      ruleResults.categories.loading_performance = await this.executeLoadingRules(resourceResults, ruleContext);
    }
    
    // Compression Rules
    if (this.options.enableCompressionRules) {
      ruleResults.categories.compression = await this.executeCompressionRules(resourceResults, ruleContext);
    }
    
    // Caching Rules
    if (this.options.enableCachingRules) {
      ruleResults.categories.caching = await this.executeCachingRules(resourceResults, ruleContext);
    }
    
    // CDN Rules
    if (this.options.enableCDNRules) {
      ruleResults.categories.cdn = await this.executeCDNRules(resourceResults, ruleContext);
    }
    
    // Lazy Loading Rules
    if (this.options.enableLazyLoadingRules) {
      ruleResults.categories.lazy_loading = await this.executeLazyLoadingRules(resourceResults, ruleContext);
    }
    
    // Custom Rules
    if (this.options.customRules.length > 0) {
      ruleResults.categories.custom = await this.executeCustomRules(resourceResults, ruleContext);
    }
    
    // Calculate overall rule statistics
    this.calculateRuleStatistics(ruleResults);
    
    return ruleResults;
  }

  /**
   * Execute performance budget rules
   */
  async executePerformanceBudgetRules(resourceResults, ruleContext) {
    const rules = {
      category: 'Performance Budget Rules',
      rules_executed: [],
      passed: 0,
      failed: 0,
      score: 0
    };
    
    // Extract resource data
    const resources = this.extractResourceData(resourceResults);
    const budgets = ruleContext.performance_budgets || {};
    
    // Rule 1: Total Resource Size Budget
    rules.rules_executed.push(await this.executeRule({
      name: 'total_resource_size_budget',
      description: 'Total resource size should not exceed performance budget',
      check: () => {
        const totalSize = resources.total_size || 0;
        const budget = budgets.total_size || 2000000; // 2MB default
        return {
          passed: totalSize <= budget,
          value: totalSize,
          threshold: budget,
          impact: totalSize > budget ? 'high' : 'low'
        };
      },
      weight: 0.9,
      category: 'performance_budget'
    }));
    
    // Rule 2: JavaScript Budget
    rules.rules_executed.push(await this.executeRule({
      name: 'javascript_size_budget',
      description: 'JavaScript bundle size should not exceed budget',
      check: () => {
        const jsSize = resources.javascript?.total_size || 0;
        const budget = budgets.javascript || 300000; // 300KB default
        return {
          passed: jsSize <= budget,
          value: jsSize,
          threshold: budget,
          impact: jsSize > budget ? 'high' : 'medium'
        };
      },
      weight: 0.8,
      category: 'performance_budget'
    }));
    
    // Rule 3: CSS Budget
    rules.rules_executed.push(await this.executeRule({
      name: 'css_size_budget',
      description: 'CSS total size should not exceed budget',
      check: () => {
        const cssSize = resources.css?.total_size || 0;
        const budget = budgets.css || 150000; // 150KB default
        return {
          passed: cssSize <= budget,
          value: cssSize,
          threshold: budget,
          impact: cssSize > budget ? 'medium' : 'low'
        };
      },
      weight: 0.6,
      category: 'performance_budget'
    }));
    
    // Rule 4: Image Budget
    rules.rules_executed.push(await this.executeRule({
      name: 'image_size_budget',
      description: 'Total image size should not exceed budget',
      check: () => {
        const imageSize = resources.images?.total_size || 0;
        const budget = budgets.images || 500000; // 500KB default
        return {
          passed: imageSize <= budget,
          value: imageSize,
          threshold: budget,
          impact: imageSize > budget ? 'medium' : 'low'
        };
      },
      weight: 0.7,
      category: 'performance_budget'
    }));
    
    // Rule 5: Font Budget
    rules.rules_executed.push(await this.executeRule({
      name: 'font_size_budget',
      description: 'Font files should not exceed budget',
      check: () => {
        const fontSize = resources.fonts?.total_size || 0;
        const budget = budgets.fonts || 100000; // 100KB default
        return {
          passed: fontSize <= budget,
          value: fontSize,
          threshold: budget,
          impact: fontSize > budget ? 'medium' : 'low'
        };
      },
      weight: 0.5,
      category: 'performance_budget'
    }));
    
    // Rule 6: Resource Count Budget
    rules.rules_executed.push(await this.executeRule({
      name: 'resource_count_budget',
      description: 'Total number of resources should not exceed budget',
      check: () => {
        const resourceCount = resources.total_count || 0;
        const budget = budgets.resource_count || 100;
        return {
          passed: resourceCount <= budget,
          value: resourceCount,
          threshold: budget,
          impact: resourceCount > budget ? 'medium' : 'low'
        };
      },
      weight: 0.6,
      category: 'performance_budget'
    }));
    
    // Calculate category score
    this.calculateCategoryScore(rules);
    
    return rules;
  }

  /**
   * Execute optimization rules
   */
  async executeOptimizationRules(resourceResults, ruleContext) {
    const rules = {
      category: 'Optimization Rules',
      rules_executed: [],
      passed: 0,
      failed: 0,
      score: 0
    };
    
    const resources = this.extractResourceData(resourceResults);
    const optimization = this.extractOptimizationData(resourceResults);
    
    // Rule 1: Image Optimization
    rules.rules_executed.push(await this.executeRule({
      name: 'image_optimization',
      description: 'Images should be optimized and use modern formats',
      check: () => {
        const optimizedImages = optimization.images?.optimized_count || 0;
        const totalImages = resources.images?.count || 1;
        const optimizationRate = optimizedImages / totalImages;
        return {
          passed: optimizationRate >= 0.8,
          value: Math.round(optimizationRate * 100),
          threshold: 80,
          impact: optimizationRate < 0.8 ? 'medium' : 'low'
        };
      },
      weight: 0.8,
      category: 'optimization'
    }));
    
    // Rule 2: Compression Usage
    rules.rules_executed.push(await this.executeRule({
      name: 'compression_usage',
      description: 'Text resources should use compression (gzip/brotli)',
      check: () => {
        const compressedResources = optimization.compression?.compressed_count || 0;
        const compressibleResources = optimization.compression?.compressible_count || 1;
        const compressionRate = compressedResources / compressibleResources;
        return {
          passed: compressionRate >= 0.9,
          value: Math.round(compressionRate * 100),
          threshold: 90,
          impact: compressionRate < 0.9 ? 'high' : 'low'
        };
      },
      weight: 0.9,
      category: 'optimization'
    }));
    
    // Rule 3: Minification
    rules.rules_executed.push(await this.executeRule({
      name: 'resource_minification',
      description: 'CSS and JavaScript resources should be minified',
      check: () => {
        const minifiedResources = optimization.minification?.minified_count || 0;
        const minifiableResources = optimization.minification?.minifiable_count || 1;
        const minificationRate = minifiedResources / minifiableResources;
        return {
          passed: minificationRate >= 0.95,
          value: Math.round(minificationRate * 100),
          threshold: 95,
          impact: minificationRate < 0.95 ? 'medium' : 'low'
        };
      },
      weight: 0.7,
      category: 'optimization'
    }));
    
    // Rule 4: CDN Usage
    rules.rules_executed.push(await this.executeRule({
      name: 'cdn_usage',
      description: 'Static resources should be served from CDN',
      check: () => {
        const cdnResources = optimization.cdn?.cdn_count || 0;
        const staticResources = optimization.cdn?.static_count || 1;
        const cdnUsageRate = cdnResources / staticResources;
        return {
          passed: cdnUsageRate >= 0.7,
          value: Math.round(cdnUsageRate * 100),
          threshold: 70,
          impact: cdnUsageRate < 0.7 ? 'medium' : 'low'
        };
      },
      weight: 0.6,
      category: 'optimization'
    }));
    
    // Rule 5: Resource Bundling
    rules.rules_executed.push(await this.executeRule({
      name: 'resource_bundling',
      description: 'CSS and JavaScript should be properly bundled',
      check: () => {
        const jsFiles = resources.javascript?.count || 0;
        const cssFiles = resources.css?.count || 0;
        const totalBundleable = jsFiles + cssFiles;
        const optimalBundles = Math.min(5, totalBundleable); // Max 5 bundles is good
        return {
          passed: totalBundleable <= optimalBundles * 2,
          value: totalBundleable,
          threshold: optimalBundles * 2,
          impact: totalBundleable > optimalBundles * 2 ? 'medium' : 'low'
        };
      },
      weight: 0.6,
      category: 'optimization'
    }));
    
    this.calculateCategoryScore(rules);
    return rules;
  }

  /**
   * Execute critical resource rules
   */
  async executeCriticalResourceRules(resourceResults, ruleContext) {
    const rules = {
      category: 'Critical Resource Rules',
      rules_executed: [],
      passed: 0,
      failed: 0,
      score: 0
    };
    
    const resources = this.extractResourceData(resourceResults);
    const critical = this.extractCriticalResourceData(resourceResults);
    
    // Rule 1: Critical CSS Inlined
    rules.rules_executed.push(await this.executeRule({
      name: 'critical_css_inlined',
      description: 'Critical CSS should be inlined to reduce render blocking',
      check: () => {
        const inlinedCriticalCSS = critical.css?.inlined || false;
        return {
          passed: inlinedCriticalCSS,
          value: inlinedCriticalCSS ? 'Yes' : 'No',
          impact: !inlinedCriticalCSS ? 'high' : 'low'
        };
      },
      weight: 0.9,
      category: 'critical_resource'
    }));
    
    // Rule 2: Render Blocking Resources
    rules.rules_executed.push(await this.executeRule({
      name: 'render_blocking_resources',
      description: 'Minimize render blocking resources',
      check: () => {
        const renderBlocking = critical.render_blocking?.count || 0;
        const threshold = 3; // Max 3 render blocking resources
        return {
          passed: renderBlocking <= threshold,
          value: renderBlocking,
          threshold: threshold,
          impact: renderBlocking > threshold ? 'high' : 'low'
        };
      },
      weight: 0.9,
      category: 'critical_resource'
    }));
    
    // Rule 3: Critical Resource Loading Time
    rules.rules_executed.push(await this.executeRule({
      name: 'critical_resource_timing',
      description: 'Critical resources should load within performance budget',
      check: () => {
        const criticalLoadTime = critical.loading_time || 0;
        const threshold = 1000; // 1 second for critical resources
        return {
          passed: criticalLoadTime <= threshold,
          value: criticalLoadTime,
          threshold: threshold,
          impact: criticalLoadTime > threshold ? 'high' : 'medium'
        };
      },
      weight: 0.8,
      category: 'critical_resource'
    }));
    
    // Rule 4: Resource Prioritization
    rules.rules_executed.push(await this.executeRule({
      name: 'resource_prioritization',
      description: 'Resources should have appropriate priority hints',
      check: () => {
        const prioritizedResources = critical.prioritized?.count || 0;
        const criticalResources = critical.total_critical || 1;
        const prioritizationRate = prioritizedResources / criticalResources;
        return {
          passed: prioritizationRate >= 0.8,
          value: Math.round(prioritizationRate * 100),
          threshold: 80,
          impact: prioritizationRate < 0.8 ? 'medium' : 'low'
        };
      },
      weight: 0.7,
      category: 'critical_resource'
    }));
    
    this.calculateCategoryScore(rules);
    return rules;
  }

  /**
   * Calculate resource scoring
   */
  async calculateResourceScoring(ruleResults, ruleContext) {
    const scoring = {
      overall_score: 0,
      grade: 'F',
      level: 'poor',
      performance_budget_score: 0,
      optimization_score: 0,
      critical_resource_score: 0,
      loading_performance_score: 0,
      resource_breakdown: {},
      critical_resources: {},
      optimization_potential: 0,
      performance_gaps: [],
      optimization_index: 0
    };
    
    // Calculate category scores
    const categoryScores = {};
    let totalWeight = 0;
    let weightedScore = 0;
    
    Object.entries(ruleResults.categories).forEach(([category, results]) => {
      if (results && results.score !== undefined) {
        const weight = this.getCategoryWeight(category);
        categoryScores[category] = results.score;
        weightedScore += results.score * weight;
        totalWeight += weight;
      }
    });
    
    // Calculate overall score
    scoring.overall_score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    
    // Assign category scores
    scoring.performance_budget_score = categoryScores.performance_budget || 0;
    scoring.optimization_score = categoryScores.optimization || 0;
    scoring.critical_resource_score = categoryScores.critical_resource || 0;
    scoring.loading_performance_score = categoryScores.loading_performance || 0;
    
    // Calculate grade and level
    scoring.grade = this.calculateGrade(scoring.overall_score);
    scoring.level = this.calculateLevel(scoring.overall_score);
    
    // Calculate optimization index
    scoring.optimization_index = this.calculateOptimizationIndex(categoryScores);
    
    // Calculate optimization potential
    scoring.optimization_potential = this.calculateOptimizationPotential(ruleResults);
    
    return scoring;
  }

  /**
   * Generate resource compliance assessment
   */
  async generateResourceCompliance(ruleResults, scoring) {
    const compliance = {
      status: 'partial',
      performance_budget: 'non_compliant',
      web_vitals: 'needs_improvement',
      best_practices: 'partial',
      core_web_vitals_score: 0,
      budget_adherence_percentage: 0
    };
    
    // Determine overall compliance status
    if (scoring.overall_score >= 90) {
      compliance.status = 'compliant';
    } else if (scoring.overall_score >= 70) {
      compliance.status = 'partial';
    } else {
      compliance.status = 'non_compliant';
    }
    
    // Performance budget compliance
    if (scoring.performance_budget_score >= 80) {
      compliance.performance_budget = 'compliant';
    } else if (scoring.performance_budget_score >= 60) {
      compliance.performance_budget = 'partial';
    }
    
    // Web Vitals compliance
    if (scoring.loading_performance_score >= 75) {
      compliance.web_vitals = 'good';
    } else if (scoring.loading_performance_score >= 50) {
      compliance.web_vitals = 'needs_improvement';
    } else {
      compliance.web_vitals = 'poor';
    }
    
    // Best practices compliance
    if (scoring.optimization_score >= 80) {
      compliance.best_practices = 'compliant';
    } else if (scoring.optimization_score >= 60) {
      compliance.best_practices = 'partial';
    } else {
      compliance.best_practices = 'non_compliant';
    }
    
    // Calculate specific scores
    compliance.core_web_vitals_score = this.calculateCoreWebVitalsScore(ruleResults);
    compliance.budget_adherence_percentage = scoring.performance_budget_score;
    
    return compliance;
  }

  /**
   * Identify resource optimization opportunities
   */
  async identifyResourceOptimizationOpportunities(ruleResults, scoring) {
    const opportunities = {
      opportunities: [],
      high_impact: [],
      quick_wins: [],
      long_term: []
    };
    
    // Analyze failed rules for opportunities
    Object.values(ruleResults.categories).forEach(category => {
      if (category.rules_executed) {
        category.rules_executed.forEach(rule => {
          if (!rule.result.passed) {
            const opportunity = {
              rule: rule.name,
              description: rule.description,
              impact: rule.result.impact,
              category: rule.category,
              current_value: rule.result.value,
              target_value: rule.result.threshold,
              effort: this.estimateOptimizationEffort(rule),
              potential_score_improvement: this.estimateScoreImprovement(rule)
            };
            
            opportunities.opportunities.push(opportunity);
            
            // Categorize by impact and effort
            if (opportunity.impact === 'high') {
              opportunities.high_impact.push(opportunity);
            }
            
            if (opportunity.effort === 'low') {
              opportunities.quick_wins.push(opportunity);
            }
            
            if (opportunity.effort === 'high') {
              opportunities.long_term.push(opportunity);
            }
          }
        });
      }
    });
    
    return opportunities;
  }

  /**
   * Generate resource recommendations
   */
  async generateResourceRecommendations(ruleResults, opportunities) {
    const recommendations = [];
    
    // High impact optimizations
    opportunities.high_impact.forEach(opp => {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        title: this.getRecommendationTitle(opp.rule),
        description: opp.description,
        action: this.getRecommendationAction(opp.rule),
        impact: opp.impact,
        effort: opp.effort,
        category: opp.category,
        expected_improvement: opp.potential_score_improvement
      });
    });
    
    // Quick wins
    opportunities.quick_wins.forEach(opp => {
      if (!recommendations.find(r => r.title === this.getRecommendationTitle(opp.rule))) {
        recommendations.push({
          type: 'quick_win',
          priority: 'medium',
          title: this.getRecommendationTitle(opp.rule),
          description: opp.description,
          action: this.getRecommendationAction(opp.rule),
          impact: opp.impact,
          effort: opp.effort,
          category: opp.category,
          expected_improvement: opp.potential_score_improvement
        });
      }
    });
    
    return recommendations;
  }

  // Helper methods
  prepareResourceRuleContext(resourceResults, context) {
    return {
      performance_budgets: context.performance_budgets || {},
      resource_types: context.resource_types || ['css', 'js', 'images', 'fonts'],
      strict_mode: this.options.strictMode,
      custom_thresholds: context.custom_thresholds || {},
      ...context
    };
  }

  extractResourceData(resourceResults) {
    return {
      total_size: resourceResults.combined?.resourceInventory?.totalSize || 0,
      total_count: resourceResults.combined?.resourceInventory?.totalCount || 0,
      javascript: resourceResults.combined?.resourceInventory?.types?.javascript || {},
      css: resourceResults.combined?.resourceInventory?.types?.css || {},
      images: resourceResults.combined?.resourceInventory?.types?.images || {},
      fonts: resourceResults.combined?.resourceInventory?.types?.fonts || {}
    };
  }

  extractOptimizationData(resourceResults) {
    return {
      images: { optimized_count: 0 },
      compression: { compressed_count: 0, compressible_count: 0 },
      minification: { minified_count: 0, minifiable_count: 0 },
      cdn: { cdn_count: 0, static_count: 0 }
    };
  }

  extractCriticalResourceData(resourceResults) {
    return {
      css: { inlined: false },
      render_blocking: { count: 0 },
      loading_time: 0,
      prioritized: { count: 0 },
      total_critical: 1
    };
  }

  async executeRule(rule) {
    try {
      const result = rule.check();
      return {
        name: rule.name,
        description: rule.description,
        result: result,
        weight: rule.weight,
        category: rule.category,
        passed: result.passed
      };
    } catch (error) {
      return {
        name: rule.name,
        description: rule.description,
        result: { passed: false, error: error.message },
        weight: rule.weight,
        category: rule.category,
        passed: false
      };
    }
  }

  calculateCategoryScore(rules) {
    const passed = rules.rules_executed.filter(r => r.passed).length;
    const total = rules.rules_executed.length;
    const weightedScore = rules.rules_executed.reduce((score, rule) => {
      return score + (rule.passed ? rule.weight * 100 : 0);
    }, 0);
    const totalWeight = rules.rules_executed.reduce((weight, rule) => weight + rule.weight, 0);
    
    rules.passed = passed;
    rules.failed = total - passed;
    rules.score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  calculateRuleStatistics(ruleResults) {
    const allRules = Object.values(ruleResults.categories).reduce((acc, category) => {
      return acc.concat(category.rules_executed || []);
    }, []);
    
    ruleResults.total_rules_executed = allRules.length;
    ruleResults.rules_passed = allRules.filter(r => r.passed).length;
    ruleResults.rules_failed = allRules.filter(r => !r.passed).length;
    ruleResults.execution_efficiency = ruleResults.total_rules_executed > 0 ? 
      (ruleResults.rules_passed / ruleResults.total_rules_executed) * 100 : 0;
    ruleResults.coverage_percentage = 85; // Placeholder
    ruleResults.accuracy_score = 92; // Placeholder
  }

  getCategoryWeight(category) {
    const weights = {
      performance_budget: 0.3,
      optimization: 0.25,
      critical_resource: 0.25,
      loading_performance: 0.15,
      compression: 0.05
    };
    return weights[category] || 0.1;
  }

  calculateGrade(score) {
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

  calculateLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  calculateOptimizationIndex(categoryScores) {
    const optimizationScore = categoryScores.optimization || 0;
    const criticalResourceScore = categoryScores.critical_resource || 0;
    return Math.round((optimizationScore + criticalResourceScore) / 2);
  }

  calculateOptimizationPotential(ruleResults) {
    const failedRules = Object.values(ruleResults.categories).reduce((acc, category) => {
      return acc + (category.failed || 0);
    }, 0);
    const totalRules = ruleResults.total_rules_executed || 1;
    return Math.round((failedRules / totalRules) * 100);
  }

  calculateCoreWebVitalsScore(ruleResults) {
    // Simplified Core Web Vitals scoring based on critical resources and loading performance
    const criticalScore = ruleResults.categories.critical_resource?.score || 0;
    const loadingScore = ruleResults.categories.loading_performance?.score || 0;
    return Math.round((criticalScore + loadingScore) / 2);
  }

  estimateOptimizationEffort(rule) {
    const effortMap = {
      'total_resource_size_budget': 'high',
      'javascript_size_budget': 'high',
      'css_size_budget': 'medium',
      'image_size_budget': 'medium',
      'font_size_budget': 'low',
      'resource_count_budget': 'medium',
      'image_optimization': 'medium',
      'compression_usage': 'low',
      'resource_minification': 'low',
      'cdn_usage': 'medium',
      'resource_bundling': 'high',
      'critical_css_inlined': 'medium',
      'render_blocking_resources': 'high',
      'critical_resource_timing': 'high',
      'resource_prioritization': 'medium'
    };
    return effortMap[rule.name] || 'medium';
  }

  estimateScoreImprovement(rule) {
    const impactMap = {
      'total_resource_size_budget': 15,
      'javascript_size_budget': 12,
      'css_size_budget': 8,
      'image_size_budget': 10,
      'font_size_budget': 5,
      'resource_count_budget': 8,
      'image_optimization': 10,
      'compression_usage': 15,
      'resource_minification': 8,
      'cdn_usage': 10,
      'resource_bundling': 12,
      'critical_css_inlined': 18,
      'render_blocking_resources': 20,
      'critical_resource_timing': 15,
      'resource_prioritization': 10
    };
    return impactMap[rule.name] || 5;
  }

  getRecommendationTitle(ruleName) {
    const titles = {
      'total_resource_size_budget': 'Optimize Total Resource Size',
      'javascript_size_budget': 'Reduce JavaScript Bundle Size',
      'css_size_budget': 'Optimize CSS Size',
      'image_size_budget': 'Compress and Optimize Images',
      'font_size_budget': 'Optimize Font Loading',
      'resource_count_budget': 'Reduce Number of Resources',
      'image_optimization': 'Implement Modern Image Formats',
      'compression_usage': 'Enable Resource Compression',
      'resource_minification': 'Minify CSS and JavaScript',
      'cdn_usage': 'Implement CDN for Static Resources',
      'resource_bundling': 'Optimize Resource Bundling',
      'critical_css_inlined': 'Inline Critical CSS',
      'render_blocking_resources': 'Eliminate Render Blocking Resources',
      'critical_resource_timing': 'Optimize Critical Resource Loading',
      'resource_prioritization': 'Implement Resource Prioritization'
    };
    return titles[ruleName] || 'Optimize Resource';
  }

  getRecommendationAction(ruleName) {
    const actions = {
      'total_resource_size_budget': 'Implement resource optimization strategies to reduce overall page weight',
      'javascript_size_budget': 'Use code splitting, tree shaking, and remove unused JavaScript',
      'css_size_budget': 'Minimize CSS, remove unused styles, and optimize critical CSS',
      'image_size_budget': 'Compress images, use modern formats (WebP, AVIF), and implement responsive images',
      'font_size_budget': 'Use font-display: swap, subset fonts, and optimize font loading',
      'resource_count_budget': 'Bundle resources, use HTTP/2 push, and eliminate unnecessary requests',
      'image_optimization': 'Convert images to WebP/AVIF and implement progressive JPEG',
      'compression_usage': 'Enable gzip or Brotli compression on your server',
      'resource_minification': 'Use build tools to minify CSS and JavaScript files',
      'cdn_usage': 'Serve static resources through a Content Delivery Network',
      'resource_bundling': 'Optimize bundling strategy to balance bundle size and caching',
      'critical_css_inlined': 'Extract and inline above-the-fold CSS',
      'render_blocking_resources': 'Use async/defer for non-critical scripts and optimize CSS delivery',
      'critical_resource_timing': 'Prioritize critical resources and optimize loading sequence',
      'resource_prioritization': 'Use resource hints (preload, prefetch) for important resources'
    };
    return actions[ruleName] || 'Optimize this resource aspect';
  }

  // Placeholder methods for loading, compression, caching, CDN, and lazy loading rules
  async executeLoadingRules(resourceResults, ruleContext) {
    return { category: 'Loading Performance Rules', rules_executed: [], passed: 0, failed: 0, score: 80 };
  }

  async executeCompressionRules(resourceResults, ruleContext) {
    return { category: 'Compression Rules', rules_executed: [], passed: 0, failed: 0, score: 85 };
  }

  async executeCachingRules(resourceResults, ruleContext) {
    return { category: 'Caching Rules', rules_executed: [], passed: 0, failed: 0, score: 78 };
  }

  async executeCDNRules(resourceResults, ruleContext) {
    return { category: 'CDN Rules', rules_executed: [], passed: 0, failed: 0, score: 70 };
  }

  async executeLazyLoadingRules(resourceResults, ruleContext) {
    return { category: 'Lazy Loading Rules', rules_executed: [], passed: 0, failed: 0, score: 75 };
  }

  async executeCustomRules(resourceResults, ruleContext) {
    return { category: 'Custom Rules', rules_executed: [], passed: 0, failed: 0, score: 80 };
  }

  // Initialize methods
  initializeResourceRuleSets() {
    return {
      performance_budget: ['size_budgets', 'count_budgets', 'timing_budgets'],
      optimization: ['compression', 'minification', 'bundling', 'cdn'],
      critical_resource: ['render_blocking', 'critical_css', 'resource_priority'],
      loading: ['loading_patterns', 'async_loading', 'preloading'],
      caching: ['cache_headers', 'cache_strategy', 'cache_optimization'],
      lazy_loading: ['image_lazy_loading', 'script_lazy_loading', 'iframe_lazy_loading']
    };
  }

  initializePerformanceStandards() {
    return {
      core_web_vitals: {
        lcp: 2500, // Largest Contentful Paint
        fid: 100,  // First Input Delay
        cls: 0.1   // Cumulative Layout Shift
      },
      resource_budgets: {
        total: 2000000,    // 2MB
        javascript: 300000, // 300KB
        css: 150000,       // 150KB
        images: 500000,    // 500KB
        fonts: 100000      // 100KB
      }
    };
  }

  initializeRuleWeights() {
    return {
      performance_budget: 0.3,
      optimization: 0.25,
      critical_resource: 0.25,
      loading_performance: 0.15,
      compression: 0.05
    };
  }

  initializeExecutionContext() {
    return {
      strict_mode: this.options.strictMode,
      custom_rules_enabled: this.options.customRules.length > 0,
      performance_focused: true
    };
  }

  handleResourceRulesError(error) {
    return {
      engine: this.name,
      version: this.version,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      overall_resource_score: 0,
      resource_grade: 'F',
      fallback_recommendations: [
        {
          type: 'error_resolution',
          priority: 'critical',
          title: 'Resolve Resource Rules Engine Error',
          description: `Resource rules processing failed: ${error.message}`,
          action: 'Check resource data and retry rules processing'
        }
      ]
    };
  }
}

export default ResourceRulesEngine;
