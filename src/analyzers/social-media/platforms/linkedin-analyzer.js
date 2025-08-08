/**
 * LinkedIn Analyzer
 * Professional meta tags optimization analysis
 */

export class LinkedInAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.linkedInTags = [
      'og:title', 'og:description', 'og:image', 'og:url',
      'article:author', 'article:published_time'
    ];
  }

  async analyze(document, url) {
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
}
