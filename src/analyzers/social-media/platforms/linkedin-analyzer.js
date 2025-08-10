/**
 * Enhanced LinkedIn Analyzer
 * Comprehensive analysis of LinkedIn professional meta tags optimization with BaseAnalyzer integration
 * 
 * @extends BaseAnalyzer
 * @version 1.0.0
 * @author Nimrod Galor
 * @date 2025-08-08
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class LinkedInAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('LinkedInAnalyzer', {
      enableProfessionalOptimization: options.enableProfessionalOptimization !== false,
      enableContentAnalysis: options.enableContentAnalysis !== false,
      enableIndustryValidation: options.enableIndustryValidation !== false,
      enableBusinessAnalysis: options.enableBusinessAnalysis !== false,
      strictValidation: options.strictValidation || false,
      validateImageDimensions: options.validateImageDimensions !== false,
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    });

    this.version = '1.0.0';
    this.category = AnalyzerCategories.CONTENT;
    
    this.linkedInTags = [
      'og:title', 'og:description', 'og:image', 'og:url',
      'article:author', 'article:published_time'
    ];
    
    this.linkedInLimits = {
      title: 120,
      description: 300,
      imageWidth: 1200,
      imageHeight: 627
    };
    
    this.requiredMetaTags = ['og:title', 'og:description', 'og:image'];
    this.recommendedMetaTags = ['og:url', 'article:author', 'article:published_time'];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'LinkedInAnalyzer',
      version: '1.0.0',
      description: 'Comprehensive LinkedIn professional meta tags optimization and business analysis',
      category: AnalyzerCategories.CONTENT,
      priority: 'high',
      capabilities: [
        'professional_optimization',
        'business_content_analysis',
        'industry_validation',
        'linkedin_sharing_optimization',
        'professional_networking_enhancement',
        'content_quality_assessment',
        'recommendation_generation'
      ]
    };
  }

  /**
   * Validate analysis context
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether context is valid
   */
  validate(context) {
    try {
      if (!context || typeof context !== 'object') {
        return false;
      }

      const { document } = context;
      if (!document || !document.querySelector) {
        this.log('LinkedIn analysis requires a valid DOM document', 'warn');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError('Error validating LinkedIn analysis context', error);
      return false;
    }
  }

  /**
   * Perform comprehensive LinkedIn analysis with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing DOM and page data
   * @returns {Promise<Object>} LinkedIn analysis results
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting LinkedIn analysis', 'info');

      // Validate context
      if (!this.validate(context)) {
        return this.handleError('Invalid context for LinkedIn analysis', new Error('Context validation failed'), {
          hasLinkedInOptimization: false,
          score: 0,
          grade: 'F'
        });
      }

      const { document, url = '', pageData = {} } = context;

      // Perform LinkedIn analysis
      const linkedinData = await this._performLinkedInAnalysis(document, url);
      
      // Calculate comprehensive score
      const score = this._calculateComprehensiveScore(linkedinData);
      const grade = this._getGradeFromScore ? this._getGradeFromScore(score) : this._calculateGrade(score);
      
      // Generate recommendations
      const recommendations = this._generateLinkedInRecommendations(linkedinData);
      
      // Generate summary
      const summary = this._generateLinkedInSummary(linkedinData, score);

      const result = {
        success: true,
        data: {
          ...linkedinData,
          score,
          grade,
          recommendations,
          summary,
          metadata: this.getMetadata()
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.log(`LinkedIn analysis completed in ${result.executionTime}ms with score ${score}`, 'info');
      return result;

    } catch (error) {
      return this.handleError('LinkedIn analysis failed', error, {
        hasLinkedInOptimization: false,
        score: 0,
        grade: 'F',
        summary: 'LinkedIn analysis encountered an error'
      });
    }
  }



  /**
   * Internal method to perform LinkedIn analysis
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} LinkedIn analysis results
   */
  async _performLinkedInAnalysis(document, url) {
    try {
      this.log('Analyzing LinkedIn professional optimization', 'info');
      
      const professional = this._analyzeProfessionalTags(document);
      const content = this._analyzeContentOptimization(document);
      const validation = this._validateLinkedInTags(document);
      const industry = this._analyzeIndustrySpecific(document);

      const score = this._calculateLinkedInScore(professional, content, validation);

      return {
        professional,
        content,
        validation,
        industry,
        score,
        recommendations: this._generateLinkedInRecommendationsLegacy(professional, content, validation),
        hasLinkedInOptimization: professional.completeness > 50 || content.isOptimized,
        completeness: this._calculateLinkedInCompleteness(professional, content, validation)
      };
    } catch (error) {
      throw new Error(`LinkedIn analysis failed: ${error.message}`);
    }
    const professional = this._analyzeProfessionalTags(document);
    const content = this._analyzeContentOptimization(document);
    const validation = this._validateLinkedInTags(document);
    const industry = this._analyzeIndustrySpecific(document);

    const score = this._calculateLinkedInScore(professional, content, validation);

    return {
      professional,
      content,
      validation,
      industry,
      score,
      recommendations: this._generateLinkedInRecommendations(professional, content, validation),
    };
  }

  _analyzeProfessionalTags(document) {
    const tags = {};
    
    this.linkedInTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      tags[tag] = element ? element.getAttribute('content') : null;
    });

    return {
      tags,
      hasAuthor: !!tags['article:author'],
      hasPublishedTime: !!tags['article:published_time'],
      hasBusinessInfo: this._hasBusinessInfo(document),
      completeness: this._calculateProfessionalCompleteness(tags),
    };
  }

  _analyzeContentOptimization(document) {
    const title = document.querySelector('meta[property="og:title"]');
    const description = document.querySelector('meta[property="og:description"]');
    const image = document.querySelector('meta[property="og:image"]');

    return {
      titleOptimized: this._isLinkedInTitleOptimized(title),
      descriptionOptimized: this._isLinkedInDescriptionOptimized(description),
      imageOptimized: this._isLinkedInImageOptimized(image),
      professionalTone: this._assessProfessionalTone(document),
    };
  }

  _validateLinkedInTags(document) {
    const validation = {
      errors: [],
      warnings: [],
      passed: [],
    };

    // LinkedIn primarily uses Open Graph tags
    const requiredTags = ['og:title', 'og:description', 'og:image'];
    
    requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.errors.push(`Missing ${tag} (required for LinkedIn sharing)`);
      } else {
        const content = element.getAttribute('content');
        if (!content || content.trim() === '') {
          validation.errors.push(`Empty content for ${tag}`);
        } else {
          validation.passed.push(`Valid ${tag}`);
        }
      }
    });

    // Check professional-specific tags
    const professionalTags = ['article:author', 'article:published_time'];
    professionalTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) {
        validation.warnings.push(`Missing ${tag} (recommended for professional content)`);
      } else {
        validation.passed.push(`Present ${tag}`);
      }
    });

    return validation;
  }

  _analyzeIndustrySpecific(document) {
    const industryKeywords = this._detectIndustryKeywords(document);
    const professionalCertifications = this._detectProfessionalCertifications(document);
    const companyInfo = this._detectCompanyInfo(document);

    return {
      industry: industryKeywords,
      certifications: professionalCertifications,
      companyInfo,
      isProfessionalContent: industryKeywords.length > 0 || professionalCertifications.length > 0,
    };
  }

  _hasBusinessInfo(document) {
    const businessSelectors = [
      '.company-info', '.business-info', '.corporate',
      '[itemtype*="Organization"]', '[itemtype*="Corporation"]'
    ];

    return businessSelectors.some(selector => 
      document.querySelector(selector)
    );
  }

  _isLinkedInTitleOptimized(titleElement) {
    if (!titleElement) return false;
    
    const title = titleElement.getAttribute('content');
    if (!title) return false;

    return {
      present: true,
      length: title.length,
      optimized: title.length >= 10 && title.length <= 60,
      isProfessional: this._isProfessionalTitle(title),
    };
  }

  _isLinkedInDescriptionOptimized(descElement) {
    if (!descElement) return false;

    const description = descElement.getAttribute('content');
    if (!description) return false;

    return {
      present: true,
      length: description.length,
      optimized: description.length >= 50 && description.length <= 160,
      isProfessional: this._isProfessionalDescription(description),
    };
  }

  _isLinkedInImageOptimized(imageElement) {
    if (!imageElement) return false;

    const imageUrl = imageElement.getAttribute('content');
    if (!imageUrl) return false;

    return {
      present: true,
      url: imageUrl,
      isHighQuality: this._isHighQualityImage(imageUrl),
      isProfessional: this._isProfessionalImage(imageUrl),
    };
  }

  _assessProfessionalTone(document) {
    const textContent = document.body.textContent.toLowerCase();
    
    const professionalKeywords = [
      'professional', 'business', 'industry', 'corporate',
      'executive', 'leadership', 'expertise', 'experience',
      'skills', 'qualifications', 'achievements', 'results'
    ];

    const casualKeywords = [
      'awesome', 'cool', 'fun', 'crazy', 'weird',
      'lol', 'omg', 'literally', 'amazing'
    ];

    const professionalCount = professionalKeywords.filter(keyword => 
      textContent.includes(keyword)
    ).length;

    const casualCount = casualKeywords.filter(keyword => 
      textContent.includes(keyword)
    ).length;

    return {
      professionalKeywords: professionalCount,
      casualKeywords: casualCount,
      tone: professionalCount > casualCount ? 'professional' : 
            casualCount > professionalCount ? 'casual' : 'neutral',
      score: Math.max(0, professionalCount - casualCount),
    };
  }

  _detectIndustryKeywords(document) {
    const textContent = document.body.textContent.toLowerCase();
    
    const industries = {
      technology: ['software', 'tech', 'digital', 'ai', 'machine learning', 'cloud'],
      finance: ['finance', 'banking', 'investment', 'financial', 'trading'],
      healthcare: ['healthcare', 'medical', 'health', 'pharmaceutical', 'clinical'],
      consulting: ['consulting', 'advisory', 'strategy', 'management consulting'],
      marketing: ['marketing', 'advertising', 'branding', 'digital marketing'],
      education: ['education', 'learning', 'training', 'academic', 'university'],
      manufacturing: ['manufacturing', 'industrial', 'production', 'operations'],
      retail: ['retail', 'ecommerce', 'consumer', 'sales', 'customer'],
    };

    const detectedIndustries = [];

    Object.entries(industries).forEach(([industry, keywords]) => {
      const matches = keywords.filter(keyword => textContent.includes(keyword));
      if (matches.length > 0) {
        detectedIndustries.push({
          industry,
          matches,
          relevance: matches.length,
        });
      }
    });

    return detectedIndustries.sort((a, b) => b.relevance - a.relevance);
  }

  _detectProfessionalCertifications(document) {
    const textContent = document.body.textContent;
    
    const certificationPatterns = [
      /PMP/gi, /CPA/gi, /MBA/gi, /PhD/gi, /MD/gi,
      /certified\s+\w+/gi, /certification/gi,
      /license[ds]?\s+\w+/gi, /accredited/gi,
      /chartered\s+\w+/gi, /fellow\s+of/gi
    ];

    const certifications = [];

    certificationPatterns.forEach(pattern => {
      const matches = textContent.match(pattern);
      if (matches) {
        certifications.push(...matches);
      }
    });

    return [...new Set(certifications)]; // Remove duplicates
  }

  _detectCompanyInfo(document) {
    const companyElements = document.querySelectorAll('[itemtype*="Organization"]');
    const companyInfo = {
      hasStructuredData: companyElements.length > 0,
      companyName: null,
      industry: null,
      size: null,
    };

    if (companyElements.length > 0) {
      const org = companyElements[0];
      const nameElement = org.querySelector('[itemprop="name"]');
      const industryElement = org.querySelector('[itemprop="industry"]');
      
      if (nameElement) companyInfo.companyName = nameElement.textContent.trim();
      if (industryElement) companyInfo.industry = industryElement.textContent.trim();
    }

    return companyInfo;
  }

  _isProfessionalTitle(title) {
    const professionalIndicators = [
      'CEO', 'CTO', 'VP', 'Director', 'Manager', 'Lead',
      'Senior', 'Principal', 'Executive', 'President',
      'Consultant', 'Analyst', 'Specialist', 'Expert'
    ];

    return professionalIndicators.some(indicator => 
      title.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  _isProfessionalDescription(description) {
    const professionalPhrases = [
      'years of experience', 'expertise in', 'specialized in',
      'proven track record', 'industry leader', 'professional background'
    ];

    return professionalPhrases.some(phrase => 
      description.toLowerCase().includes(phrase)
    );
  }

  _isHighQualityImage(imageUrl) {
    // Basic check for professional image indicators
    const professionalIndicators = [
      'headshot', 'professional', 'corporate', 'business',
      'team', 'office', 'company', 'logo'
    ];

    return professionalIndicators.some(indicator => 
      imageUrl.toLowerCase().includes(indicator)
    );
  }

  _isProfessionalImage(imageUrl) {
    // Check if image URL suggests professional content
    const unprofessionalIndicators = [
      'meme', 'funny', 'casual', 'party', 'vacation'
    ];

    return !unprofessionalIndicators.some(indicator => 
      imageUrl.toLowerCase().includes(indicator)
    );
  }

  _calculateProfessionalCompleteness(tags) {
    const presentTags = Object.values(tags).filter(Boolean).length;
    return Math.round((presentTags / this.linkedInTags.length) * 100);
  }

  _calculateLinkedInScore(professional, content, validation) {
    let score = professional.completeness * 0.4;

    // Content optimization scoring
    if (content.titleOptimized?.optimized) score += 15;
    if (content.descriptionOptimized?.optimized) score += 15;
    if (content.imageOptimized?.present) score += 10;

    // Professional tone bonus
    if (content.professionalTone?.tone === 'professional') score += 10;

    // Penalty for errors
    score -= validation.errors.length * 10;

    // Minor penalty for warnings
    score -= validation.warnings.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  _generateLinkedInRecommendations(professional, content, validation) {
    const recommendations = [];

    // Error-based recommendations
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix LinkedIn Sharing Issue',
        description: error,
        impact: 'professional-sharing',
      });
    });

    // Content optimization recommendations
    if (!content.titleOptimized?.optimized) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Title for LinkedIn',
        description: 'Create a professional title (10-60 characters) for better LinkedIn sharing',
        impact: 'professional-sharing',
      });
    }

    if (!content.descriptionOptimized?.optimized) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Optimize Description for LinkedIn',
        description: 'Write a professional description (50-160 characters) highlighting expertise',
        impact: 'professional-sharing',
      });
    }

    if (content.professionalTone?.tone !== 'professional') {
      recommendations.push({
        type: 'content',
        priority: 'low',
        title: 'Enhance Professional Tone',
        description: 'Use more professional language to improve LinkedIn engagement',
        impact: 'professional-credibility',
      });
    }

    // Professional enhancement recommendations
    if (!professional.hasAuthor) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        title: 'Add Author Information',
        description: 'Include article:author meta tag for professional attribution',
        impact: 'professional-credibility',
      });
    }

    return recommendations;
  }

  // ============================================================================
  // BaseAnalyzer Integration Helper Methods
  // ============================================================================

  /**
   * Calculate comprehensive LinkedIn score
   * @param {Object} linkedinData - Complete LinkedIn analysis data
   * @returns {number} Score (0-100)
   */
  _calculateComprehensiveScore(linkedinData) {
    const weights = {
      professional: 0.4,
      content: 0.3,
      validation: 0.2,
      industry: 0.1
    };
    
    // Professional score
    const professionalScore = linkedinData.professional.completeness || 0;
    
    // Content score
    let contentScore = 0;
    if (linkedinData.content.isOptimized) contentScore += 40;
    if (linkedinData.content.titleAnalysis?.optimized) contentScore += 30;
    if (linkedinData.content.descriptionAnalysis?.optimized) contentScore += 30;
    
    // Validation score
    const validationScore = linkedinData.validation.errors.length === 0 ? 100 : 
      Math.max(0, 100 - (linkedinData.validation.errors.length * 25));
    
    // Industry score
    const industryScore = linkedinData.industry.detectedIndustries?.length > 0 ? 100 : 0;
    
    const totalScore = Math.round(
      (professionalScore * weights.professional) +
      (contentScore * weights.content) +
      (validationScore * weights.validation) +
      (industryScore * weights.industry)
    );
    
    return Math.min(100, Math.max(0, totalScore));
  }

  /**
   * Generate comprehensive LinkedIn recommendations
   * @param {Object} linkedinData - Complete LinkedIn analysis data
   * @returns {Array} Array of recommendation objects
   */
  _generateLinkedInRecommendations(linkedinData) {
    const recommendations = [];
    
    // Professional optimization recommendations
    if (linkedinData.professional.completeness < 70) {
      recommendations.push({
        category: 'critical',
        title: 'Improve Professional Meta Tags',
        description: 'Add missing professional meta tags for optimal LinkedIn sharing',
        impact: 'high',
        implementation: 'Add og:title, og:description, og:image, and article:author meta tags'
      });
    }
    
    // Content optimization
    if (!linkedinData.content.isOptimized) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Content for LinkedIn',
        description: 'Enhance content structure and professional tone for LinkedIn audience',
        impact: 'medium',
        implementation: 'Improve content length, professional keywords, and readability'
      });
    }
    
    // Title optimization
    if (!linkedinData.content.titleAnalysis?.optimized) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Title Length',
        description: `Keep title under ${this.linkedInLimits.title} characters for optimal LinkedIn preview`,
        impact: 'medium',
        implementation: 'Shorten og:title to 120 characters or less'
      });
    }
    
    // Description optimization
    if (!linkedinData.content.descriptionAnalysis?.optimized) {
      recommendations.push({
        category: 'optimization',
        title: 'Optimize Description Length',
        description: `Keep description under ${this.linkedInLimits.description} characters for optimal LinkedIn preview`,
        impact: 'medium',
        implementation: 'Optimize og:description to 300 characters or less'
      });
    }
    
    // Validation error recommendations
    linkedinData.validation.errors.forEach(error => {
      recommendations.push({
        category: 'error',
        title: 'Fix LinkedIn Issue',
        description: error,
        impact: 'high',
        implementation: 'Review and fix the mentioned LinkedIn optimization issue'
      });
    });
    
    // Business enhancement recommendations
    if (!linkedinData.professional.hasBusinessInfo) {
      recommendations.push({
        category: 'enhancement',
        title: 'Add Business Information',
        description: 'Include business-specific meta tags for professional networking',
        impact: 'medium',
        implementation: 'Add business name, industry, and professional contact information'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate LinkedIn analysis summary
   * @param {Object} linkedinData - Complete LinkedIn analysis data
   * @param {number} score - Overall score
   * @returns {string} Analysis summary
   */
  _generateLinkedInSummary(linkedinData, score) {
    const { professional, content, validation, industry } = linkedinData;
    
    if (validation.errors.length > 0) {
      return `LinkedIn optimization has ${validation.errors.length} critical issue(s) that affect professional sharing functionality.`;
    }
    
    if (professional.completeness < 50) {
      return `LinkedIn professional optimization incomplete. Add essential meta tags for better professional networking.`;
    }
    
    const completeness = linkedinData.completeness.percentage;
    
    if (score >= 90) {
      return `Excellent LinkedIn optimization with ${completeness}% completeness and strong professional networking setup.`;
    } else if (score >= 70) {
      return `Good LinkedIn setup with ${completeness}% completeness but could benefit from professional content optimization.`;
    } else if (score >= 50) {
      return `Basic LinkedIn optimization detected. Focus on professional meta tags and content enhancement.`;
    } else {
      return `Limited LinkedIn optimization. Implement professional meta tags and enhance content for business networking.`;
    }
  }

  /**
   * Calculate LinkedIn completeness percentage
   * @param {Object} professional - Professional analysis
   * @param {Object} content - Content analysis
   * @param {Object} validation - Validation results
   * @returns {Object} Completeness analysis
   */
  _calculateLinkedInCompleteness(professional, content, validation) {
    const factors = [
      { name: 'Professional Title', weight: 25, present: !!professional.tags['og:title'] },
      { name: 'Professional Description', weight: 25, present: !!professional.tags['og:description'] },
      { name: 'Professional Image', weight: 20, present: !!professional.tags['og:image'] },
      { name: 'Author Information', weight: 15, present: professional.hasAuthor },
      { name: 'Content Optimization', weight: 10, present: content.isOptimized },
      { name: 'No Validation Errors', weight: 5, present: validation.errors.length === 0 }
    ];
    
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const achievedWeight = factors.reduce((sum, factor) => sum + (factor.present ? factor.weight : 0), 0);
    
    return {
      percentage: Math.round((achievedWeight / totalWeight) * 100),
      factors: factors,
      achieved: achievedWeight,
      total: totalWeight
    };
  }

  /**
   * Legacy LinkedIn recommendations method for backward compatibility
   * @param {Object} professional - Professional analysis
   * @param {Object} content - Content analysis
   * @param {Object} validation - Validation results
   * @returns {Array} Array of recommendation objects
   */
  _generateLinkedInRecommendationsLegacy(professional, content, validation) {
    const recommendations = [];

    // Error-based recommendations
    validation.errors.forEach(error => {
      recommendations.push({
        type: 'error',
        priority: 'high',
        title: 'Fix LinkedIn Professional Issue',
        description: error,
        impact: 'professional-sharing',
      });
    });

    // Professional optimization recommendations
    if (professional.completeness < 70) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        title: 'Enhance Professional Optimization',
        description: 'Add missing professional meta tags for LinkedIn sharing',
        impact: 'professional-sharing',
      });
    }

    if (!content.isOptimized) {
      recommendations.push({
        type: 'content',
        priority: 'medium',
        title: 'Optimize Content for Professional Audience',
        description: 'Improve content structure and tone for LinkedIn professionals',
        impact: 'professional-engagement',
      });
    }

    if (!professional.hasAuthor) {
      recommendations.push({
        type: 'enhancement',
        priority: 'medium',
        title: 'Add Author Information',
        description: 'Include article:author meta tag for professional attribution',
        impact: 'professional-credibility',
      });
    }

    return recommendations;
  }

  /**
   * Calculate grade from score (fallback method)
   * @param {number} score - Score (0-100)
   * @returns {string} Grade letter
   */
  _calculateGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }
}
