/**
 * ============================================================================
 * CONTENT ENGAGEMENT DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced content engagement analysis and optimization detection
 * Part of Content Analyzer Combined Approach (21st Implementation)
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ContentEngagementDetector {
  constructor(options = {}) {
    this.options = {
      enableInteractivityAnalysis: options.enableInteractivityAnalysis !== false,
      enableSocialAnalysis: options.enableSocialAnalysis !== false,
      enableCTAAnalysis: options.enableCTAAnalysis !== false,
      enableFormAnalysis: options.enableFormAnalysis !== false,
      enableNavigationAnalysis: options.enableNavigationAnalysis !== false,
      enablePersonalizationAnalysis: options.enablePersonalizationAnalysis !== false,
      ...options
    };

    this.detectorType = 'content_engagement';
    this.version = '1.0.0';
    
    // Engagement patterns
    this.engagementPatterns = {
      cta_patterns: /\b(click|buy|download|subscribe|learn|get|start|try|join|sign up|register)\b/i,
      social_patterns: /\b(share|like|follow|tweet|post|comment|review|rate)\b/i,
      interactive_patterns: /\b(quiz|poll|survey|calculator|tool|demo|preview)\b/i,
      urgency_patterns: /\b(now|today|limited|exclusive|urgent|hurry|act fast)\b/i
    };

    // Engagement scoring weights
    this.engagementWeights = {
      interactivity: 25,
      social_features: 20,
      call_to_action: 20,
      forms: 15,
      navigation: 10,
      personalization: 10
    };

    console.log('🎯 Content Engagement Detector initialized');
  }

  /**
   * Main detection method for content engagement analysis
   */
  async detect(context, configuration) {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Analyzing content engagement...');
      
      const { document } = context;
      if (!document) {
        throw new Error('Document is required for engagement analysis');
      }

      // Phase 1: Interactive Elements Analysis
      const interactivityAnalysis = await this.analyzeInteractivity(document);
      
      // Phase 2: Social Features Analysis
      const socialAnalysis = await this.analyzeSocialFeatures(document);
      
      // Phase 3: Call-to-Action Analysis
      const ctaAnalysis = await this.analyzeCTAs(document);
      
      // Phase 4: Form Engagement Analysis
      const formAnalysis = await this.analyzeForms(document);
      
      // Phase 5: Navigation Engagement Analysis
      const navigationAnalysis = await this.analyzeNavigation(document);
      
      // Phase 6: Personalization Analysis
      const personalizationAnalysis = await this.analyzePersonalization(document);
      
      // Phase 7: Overall Engagement Assessment
      const engagementAssessment = await this.assessOverallEngagement({
        interactivity: interactivityAnalysis,
        social: socialAnalysis,
        cta: ctaAnalysis,
        forms: formAnalysis,
        navigation: navigationAnalysis,
        personalization: personalizationAnalysis
      });
      
      const endTime = Date.now();
      
      return {
        detector: this.detectorType,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Engagement Analysis Results
        interactivity_analysis: interactivityAnalysis,
        social_analysis: socialAnalysis,
        cta_analysis: ctaAnalysis,
        form_analysis: formAnalysis,
        navigation_analysis: navigationAnalysis,
        personalization_analysis: personalizationAnalysis,
        
        // Overall Assessment
        engagement_assessment: engagementAssessment,
        engagement_score: engagementAssessment.overall_score,
        
        // Key Metrics
        engagement_metrics: {
          total_interactive_elements: interactivityAnalysis.total_interactive,
          total_ctas: ctaAnalysis.total_ctas,
          total_forms: formAnalysis.total_forms,
          social_features: socialAnalysis.social_feature_count,
          engagement_opportunities: engagementAssessment.engagement_opportunities,
          conversion_potential: engagementAssessment.conversion_potential
        },
        
        // Insights and Recommendations
        engagement_insights: this.generateEngagementInsights(engagementAssessment),
        optimization_recommendations: this.generateOptimizationRecommendations(engagementAssessment)
      };
      
    } catch (error) {
      console.error('❌ Content engagement detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Phase 1: Analyze interactive elements
   */
  async analyzeInteractivity(document) {
    const analysis = {
      category: 'Interactivity',
      interactive_elements: [],
      engagement_types: {}
    };
    
    try {
      // Find interactive elements
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
      const links = document.querySelectorAll('a[href]');
      const inputs = document.querySelectorAll('input, select, textarea');
      const clickables = document.querySelectorAll('[onclick], [data-action], .clickable');
      
      analysis.total_interactive = buttons.length + links.length + inputs.length + clickables.length;
      
      // Categorize engagement types
      analysis.engagement_types = {
        buttons: buttons.length,
        links: links.length,
        form_inputs: inputs.length,
        custom_interactive: clickables.length,
        
        // Specific interactive features
        dropdowns: document.querySelectorAll('select, .dropdown').length,
        tabs: document.querySelectorAll('.tab, [role="tab"]').length,
        accordions: document.querySelectorAll('.accordion, details').length,
        modals: document.querySelectorAll('.modal, dialog').length,
        tooltips: document.querySelectorAll('[title], .tooltip').length
      };
      
      // Interactive content analysis
      analysis.interactive_content = this.analyzeInteractiveContent(document);
      
      // Calculate interactivity score
      analysis.interactivity_score = this.calculateInteractivityScore(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 2: Analyze social features
   */
  async analyzeSocialFeatures(document) {
    const analysis = {
      category: 'Social Features',
      social_buttons: {},
      sharing_options: {},
      community_features: {}
    };
    
    try {
      // Social sharing buttons
      analysis.social_buttons = {
        facebook: document.querySelectorAll('[href*="facebook.com/share"], .fb-share, [class*="facebook"]').length,
        twitter: document.querySelectorAll('[href*="twitter.com/intent"], .twitter-share, [class*="twitter"]').length,
        linkedin: document.querySelectorAll('[href*="linkedin.com/share"], [class*="linkedin"]').length,
        instagram: document.querySelectorAll('[href*="instagram.com"], [class*="instagram"]').length,
        youtube: document.querySelectorAll('[href*="youtube.com"], [class*="youtube"]').length,
        generic_share: document.querySelectorAll('.share, [data-share], .social-share').length
      };
      
      // Community features
      analysis.community_features = {
        comments: document.querySelectorAll('.comment, .review, [class*="comment"]').length,
        ratings: document.querySelectorAll('.rating, .stars, [data-rating]').length,
        testimonials: document.querySelectorAll('.testimonial, .review, .feedback').length,
        user_generated: document.querySelectorAll('.user-content, .ugc').length
      };
      
      // Social proof elements
      analysis.social_proof = this.analyzeSocialProof(document);
      
      analysis.social_feature_count = Object.values(analysis.social_buttons).reduce((a, b) => a + b, 0) +
                                     Object.values(analysis.community_features).reduce((a, b) => a + b, 0);
      
      analysis.social_score = this.calculateSocialScore(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 3: Analyze call-to-action elements
   */
  async analyzeCTAs(document) {
    const analysis = {
      category: 'Call-to-Action',
      cta_elements: [],
      cta_types: {},
      cta_quality: {}
    };
    
    try {
      // Find CTA elements
      const buttons = document.querySelectorAll('button, .btn, .cta, input[type="submit"]');
      const ctaLinks = document.querySelectorAll('a.cta, a.button, a[class*="btn"]');
      
      analysis.total_ctas = buttons.length + ctaLinks.length;
      
      // Analyze CTA text and positioning
      analysis.cta_elements = this.analyzeCTAElements([...buttons, ...ctaLinks]);
      
      // CTA types analysis
      analysis.cta_types = this.categorizeCTAs(analysis.cta_elements);
      
      // CTA quality assessment
      analysis.cta_quality = this.assessCTAQuality(analysis.cta_elements);
      
      analysis.cta_score = this.calculateCTAScore(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 4: Analyze form engagement
   */
  async analyzeForms(document) {
    const analysis = {
      category: 'Form Engagement',
      form_inventory: [],
      form_optimization: {},
      user_experience: {}
    };
    
    try {
      const forms = document.querySelectorAll('form');
      analysis.total_forms = forms.length;
      
      // Analyze each form
      forms.forEach((form, index) => {
        const formData = this.analyzeForm(form, index);
        analysis.form_inventory.push(formData);
      });
      
      // Form optimization features
      analysis.form_optimization = this.analyzeFormOptimization(forms);
      
      // User experience factors
      analysis.user_experience = this.analyzeFormUX(forms);
      
      analysis.form_score = this.calculateFormScore(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 5: Analyze navigation engagement
   */
  async analyzeNavigation(document) {
    const analysis = {
      category: 'Navigation Engagement',
      navigation_elements: {},
      user_guidance: {},
      discovery_features: {}
    };
    
    try {
      // Navigation elements
      analysis.navigation_elements = {
        main_nav: document.querySelectorAll('nav, .navigation, .menu').length,
        breadcrumbs: document.querySelectorAll('.breadcrumb, .breadcrumbs').length,
        pagination: document.querySelectorAll('.pagination, .pager').length,
        search: document.querySelectorAll('input[type="search"], .search').length,
        filters: document.querySelectorAll('.filter, .filters, select[data-filter]').length
      };
      
      // User guidance features
      analysis.user_guidance = this.analyzeUserGuidance(document);
      
      // Content discovery features
      analysis.discovery_features = this.analyzeDiscoveryFeatures(document);
      
      analysis.navigation_score = this.calculateNavigationScore(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 6: Analyze personalization features
   */
  async analyzePersonalization(document) {
    const analysis = {
      category: 'Personalization',
      personalization_features: {},
      adaptive_content: {},
      user_preferences: {}
    };
    
    try {
      // Personalization indicators
      analysis.personalization_features = {
        login_areas: document.querySelectorAll('.login, .signin, .account').length,
        user_profiles: document.querySelectorAll('.profile, .user-info').length,
        preferences: document.querySelectorAll('.preferences, .settings').length,
        recommendations: document.querySelectorAll('.recommended, .suggestions').length,
        recently_viewed: document.querySelectorAll('.recent, .history').length
      };
      
      // Adaptive content features
      analysis.adaptive_content = this.analyzeAdaptiveContent(document);
      
      analysis.personalization_score = this.calculatePersonalizationScore(analysis);
      
    } catch (error) {
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 7: Assess overall engagement
   */
  async assessOverallEngagement(analyses) {
    const assessment = {
      category: 'Overall Engagement Assessment',
      component_scores: {},
      engagement_health: {},
      conversion_optimization: {}
    };
    
    try {
      // Component scores
      assessment.component_scores = {
        interactivity: analyses.interactivity?.interactivity_score || 0,
        social: analyses.social?.social_score || 0,
        cta: analyses.cta?.cta_score || 0,
        forms: analyses.forms?.form_score || 0,
        navigation: analyses.navigation?.navigation_score || 0,
        personalization: analyses.personalization?.personalization_score || 0
      };
      
      // Calculate weighted overall score
      assessment.overall_score = this.calculateWeightedEngagementScore(assessment.component_scores);
      
      // Engagement opportunities
      assessment.engagement_opportunities = this.identifyEngagementOpportunities(assessment.component_scores);
      
      // Conversion potential
      assessment.conversion_potential = this.assessConversionPotential(analyses);
      
      // Engagement classification
      assessment.engagement_classification = this.classifyEngagementLevel(assessment.overall_score);
      
    } catch (error) {
      assessment.error = error.message;
    }
    
    return assessment;
  }

  // Helper methods for analysis (condensed implementations)
  
  analyzeInteractiveContent(document) {
    return {
      quiz_elements: document.querySelectorAll('.quiz, [data-quiz]').length,
      polls: document.querySelectorAll('.poll, [data-poll]').length,
      calculators: document.querySelectorAll('.calculator, [data-calc]').length,
      interactive_media: document.querySelectorAll('video[controls], audio[controls]').length
    };
  }

  calculateInteractivityScore(analysis) {
    const baseScore = 50;
    const interactiveRatio = Math.min(1, analysis.total_interactive / 10);
    const varietyBonus = Object.values(analysis.engagement_types).filter(count => count > 0).length * 5;
    return Math.min(100, baseScore + (interactiveRatio * 30) + varietyBonus);
  }

  analyzeSocialProof(document) {
    const text = document.body.textContent.toLowerCase();
    return {
      testimonial_count: (text.match(/testimonial|review|feedback/g) || []).length,
      trust_indicators: document.querySelectorAll('.trust, .verified, .secure, .badge').length,
      social_numbers: (text.match(/\d+[km]?\s*(users|customers|downloads|reviews)/g) || []).length
    };
  }

  calculateSocialScore(analysis) {
    const baseScore = 60;
    const socialFeatures = analysis.social_feature_count;
    const socialBonus = Math.min(25, socialFeatures * 3);
    const proofBonus = Math.min(15, analysis.social_proof.trust_indicators * 5);
    return Math.min(100, baseScore + socialBonus + proofBonus);
  }

  analyzeCTAElements(elements) {
    return Array.from(elements).map((element, index) => ({
      index,
      text: (element.textContent || element.value || '').trim().substring(0, 50),
      type: this.categorizeCTAType(element.textContent || element.value || ''),
      position: this.getCTAPosition(element),
      styling: this.analyzeCTAStyling(element)
    }));
  }

  categorizeCTAType(text) {
    const lowerText = text.toLowerCase();
    if (this.engagementPatterns.cta_patterns.test(lowerText)) return 'action';
    if (lowerText.includes('learn') || lowerText.includes('more')) return 'informational';
    if (lowerText.includes('buy') || lowerText.includes('purchase')) return 'transactional';
    return 'generic';
  }

  getCTAPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      above_fold: rect.top < window.innerHeight,
      visible: rect.width > 0 && rect.height > 0
    };
  }

  analyzeCTAStyling(element) {
    const style = window.getComputedStyle(element);
    return {
      has_background_color: style.backgroundColor !== 'rgba(0, 0, 0, 0)',
      has_border: style.border !== 'none',
      is_prominent: element.classList.contains('primary') || element.classList.contains('prominent')
    };
  }

  categorizeCTAs(elements) {
    const types = { action: 0, informational: 0, transactional: 0, generic: 0 };
    elements.forEach(element => {
      types[element.type]++;
    });
    return types;
  }

  assessCTAQuality(elements) {
    return {
      clear_action_words: elements.filter(el => this.engagementPatterns.cta_patterns.test(el.text)).length,
      urgency_indicators: elements.filter(el => this.engagementPatterns.urgency_patterns.test(el.text)).length,
      prominent_styling: elements.filter(el => el.styling.is_prominent).length,
      above_fold: elements.filter(el => el.position.above_fold).length
    };
  }

  calculateCTAScore(analysis) {
    if (analysis.total_ctas === 0) return 70;
    
    const baseScore = 60;
    const qualityRatio = (analysis.cta_quality.clear_action_words / analysis.total_ctas) * 20;
    const prominenceRatio = (analysis.cta_quality.prominent_styling / analysis.total_ctas) * 15;
    const positionRatio = (analysis.cta_quality.above_fold / analysis.total_ctas) * 10;
    
    return Math.min(100, baseScore + qualityRatio + prominenceRatio + positionRatio);
  }

  analyzeForm(form, index) {
    const inputs = form.querySelectorAll('input, select, textarea');
    return {
      index,
      field_count: inputs.length,
      required_fields: form.querySelectorAll('[required]').length,
      has_labels: form.querySelectorAll('label').length >= inputs.length,
      has_validation: form.querySelector('[pattern], [minlength], [maxlength]') !== null,
      has_submit_button: form.querySelector('input[type="submit"], button[type="submit"]') !== null
    };
  }

  analyzeFormOptimization(forms) {
    let totalFields = 0;
    let formsWithValidation = 0;
    let formsWithLabels = 0;
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      totalFields += inputs.length;
      
      if (form.querySelectorAll('label').length >= inputs.length) formsWithLabels++;
      if (form.querySelector('[pattern], [required]')) formsWithValidation++;
    });
    
    return {
      average_fields: forms.length > 0 ? Math.round(totalFields / forms.length) : 0,
      forms_with_validation: formsWithValidation,
      forms_with_labels: formsWithLabels,
      optimization_ratio: forms.length > 0 ? (formsWithValidation + formsWithLabels) / (forms.length * 2) : 0
    };
  }

  analyzeFormUX(forms) {
    return {
      short_forms: Array.from(forms).filter(form => 
        form.querySelectorAll('input, select, textarea').length <= 5
      ).length,
      has_progress_indicators: document.querySelectorAll('.progress, .step-indicator').length,
      has_help_text: document.querySelectorAll('.help-text, .form-help').length
    };
  }

  calculateFormScore(analysis) {
    if (analysis.total_forms === 0) return 75;
    
    const baseScore = 65;
    const optimizationBonus = analysis.form_optimization.optimization_ratio * 20;
    const uxBonus = Math.min(15, analysis.user_experience.short_forms * 3);
    
    return Math.min(100, baseScore + optimizationBonus + uxBonus);
  }

  analyzeUserGuidance(document) {
    return {
      help_sections: document.querySelectorAll('.help, .faq, .guide').length,
      tooltips: document.querySelectorAll('[title], .tooltip').length,
      progress_indicators: document.querySelectorAll('.progress, .step').length,
      error_messages: document.querySelectorAll('.error, .warning, .alert').length
    };
  }

  analyzeDiscoveryFeatures(document) {
    return {
      related_content: document.querySelectorAll('.related, .similar, .you-might-like').length,
      tags: document.querySelectorAll('.tag, .category, .label').length,
      content_recommendations: document.querySelectorAll('.recommended, .popular').length
    };
  }

  calculateNavigationScore(analysis) {
    const baseScore = 70;
    const navigationElements = Object.values(analysis.navigation_elements).reduce((a, b) => a + b, 0);
    const guidanceElements = Object.values(analysis.user_guidance).reduce((a, b) => a + b, 0);
    
    const navigationBonus = Math.min(15, navigationElements * 2);
    const guidanceBonus = Math.min(15, guidanceElements);
    
    return Math.min(100, baseScore + navigationBonus + guidanceBonus);
  }

  analyzeAdaptiveContent(document) {
    return {
      dynamic_content: document.querySelectorAll('[data-dynamic], .dynamic').length,
      conditional_content: document.querySelectorAll('[data-if], .conditional').length,
      user_specific: document.querySelectorAll('.user-specific, .personalized').length
    };
  }

  calculatePersonalizationScore(analysis) {
    const baseScore = 60;
    const personalizationFeatures = Object.values(analysis.personalization_features).reduce((a, b) => a + b, 0);
    const adaptiveFeatures = Object.values(analysis.adaptive_content).reduce((a, b) => a + b, 0);
    
    const personalizationBonus = Math.min(25, personalizationFeatures * 5);
    const adaptiveBonus = Math.min(15, adaptiveFeatures * 3);
    
    return Math.min(100, baseScore + personalizationBonus + adaptiveBonus);
  }

  calculateWeightedEngagementScore(scores) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(this.engagementWeights).forEach(([component, weight]) => {
      if (scores[component] !== undefined) {
        weightedSum += scores[component] * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  identifyEngagementOpportunities(scores) {
    return Object.entries(scores)
      .filter(([_, score]) => score < 80)
      .map(([component, score]) => ({
        component,
        current_score: score,
        improvement_potential: 80 - score,
        priority: score < 50 ? 'high' : score < 70 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.improvement_potential - a.improvement_potential);
  }

  assessConversionPotential(analyses) {
    const ctaScore = analyses.cta?.cta_score || 0;
    const formScore = analyses.forms?.form_score || 0;
    const socialScore = analyses.social?.social_score || 0;
    
    const conversionScore = (ctaScore * 0.4) + (formScore * 0.4) + (socialScore * 0.2);
    
    return {
      score: Math.round(conversionScore),
      level: conversionScore >= 80 ? 'high' : conversionScore >= 60 ? 'medium' : 'low',
      key_factors: {
        cta_effectiveness: ctaScore,
        form_optimization: formScore,
        social_proof: socialScore
      }
    };
  }

  classifyEngagementLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very_poor';
  }

  generateEngagementInsights(assessment) {
    const insights = [];
    
    if (assessment.overall_score >= 85) {
      insights.push({
        type: 'positive',
        message: 'Excellent engagement optimization with strong conversion potential',
        impact: 'high'
      });
    }
    
    if (assessment.conversion_potential.level === 'low') {
      insights.push({
        type: 'critical',
        message: 'Low conversion potential - focus on CTA and form optimization',
        impact: 'high'
      });
    }
    
    return insights;
  }

  generateOptimizationRecommendations(assessment) {
    const recommendations = [];
    
    assessment.engagement_opportunities.forEach(opportunity => {
      recommendations.push({
        category: opportunity.component,
        priority: opportunity.priority,
        current_score: opportunity.current_score,
        target_score: Math.min(100, opportunity.current_score + 20),
        actions: this.getEngagementActions(opportunity.component),
        expected_impact: opportunity.improvement_potential > 20 ? 'high' : 'medium'
      });
    });
    
    return recommendations;
  }

  getEngagementActions(component) {
    const actions = {
      interactivity: ['Add interactive elements', 'Implement hover effects', 'Create engaging animations'],
      social: ['Add social sharing buttons', 'Include testimonials', 'Display social proof'],
      cta: ['Improve CTA text clarity', 'Enhance button styling', 'Add urgency indicators'],
      forms: ['Reduce form fields', 'Add validation', 'Improve form labels'],
      navigation: ['Add breadcrumbs', 'Improve search functionality', 'Include filters'],
      personalization: ['Add user accounts', 'Implement recommendations', 'Create user preferences']
    };
    
    return actions[component] || ['Review and optimize engagement features'];
  }

  handleDetectionError(error) {
    return {
      success: false,
      error: error.message,
      detector: this.detectorType,
      version: this.version,
      timestamp: new Date().toISOString(),
      fallback_data: {
        engagement_score: 0,
        engagement_metrics: {
          total_interactive_elements: 0,
          total_ctas: 0,
          total_forms: 0,
          social_features: 0,
          engagement_opportunities: 0,
          conversion_potential: 'unknown'
        }
      }
    };
  }
}

export default ContentEngagementDetector;
