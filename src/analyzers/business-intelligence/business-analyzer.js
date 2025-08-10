/**
 * ============================================================================
 * BUSINESS INTELLIGENCE ANALYZER MODULE
 * ============================================================================
 *
 * Comprehensive business intelligence analysis including:
 * - Trust signal analysis (certifications, awards, badges)
 * - Contact information quality assessment
 * - About page quality evaluation
 * - Customer support accessibility analysis
 * - Business hours and location data validation
 * - Company credibility indicators
 * - Professional association memberships
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerInterface, AnalyzerCategories } from '../core/AnalyzerInterface.js';
import { TrustSignalAnalyzer } from "./trust/trust-signal-analyzer.js";
import { ContactAnalyzer } from "./contact/contact-analyzer.js";
import { AboutPageAnalyzer } from "./about/about-page-analyzer.js";
import { SupportAnalyzer } from "./support/support-analyzer.js";
import { LocationAnalyzer } from "./location/location-analyzer.js";
import { 
  BUSINESS_INTELLIGENCE_WEIGHTS,
  SCORING_THRESHOLDS,
  GRADE_THRESHOLDS,
  BusinessIntelligenceUtils 
} from "./business-constants.js";

export class BusinessIntelligenceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('BusinessIntelligenceAnalyzer');
    
    this.options = {
      enableTrustAnalysis: options.enableTrustAnalysis !== false,
      enableContactAnalysis: options.enableContactAnalysis !== false,
      enableContentAnalysis: options.enableContentAnalysis !== false,
      enableSupportAnalysis: options.enableSupportAnalysis !== false,
      enableCredibilityAnalysis: options.enableCredibilityAnalysis !== false,
      enableLocationAnalysis: options.enableLocationAnalysis !== false,
      ...options,
    };

    // Initialize sub-analyzers
    this.analyzers = {
      trustSignals: new TrustSignalAnalyzer(options),
      contact: new ContactAnalyzer(options),
      aboutPage: new AboutPageAnalyzer(options),
      support: new SupportAnalyzer(options),
      location: new LocationAnalyzer(options),
    };
  }

  /**
   * Get analyzer metadata for BaseAnalyzer integration
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'Business Intelligence Analyzer',
      category: AnalyzerCategories.BUSINESS_INTELLIGENCE,
      description: 'Comprehensive business intelligence analysis including trust signals, contact information, about page quality, support accessibility, and location data',
      version: '1.0.0',
      author: 'Nimrod Galor',
      tags: ['business', 'intelligence', 'trust', 'contact', 'about', 'support', 'location', 'credibility'],
      capabilities: [
        'trust-signal-analysis',
        'contact-information-assessment',
        'about-page-evaluation',
        'support-accessibility-analysis',
        'location-data-validation',
        'credibility-assessment'
      ]
    };
  }

  /**
   * Validate input for business intelligence analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether input is valid
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return this.handleError('Invalid context provided');
    }

    const hasDocument = context.document !== undefined && context.document !== null;
    const hasDom = context.dom !== undefined && context.dom !== null;
    const hasCheerio = context.cheerio !== undefined && context.cheerio !== null;

    if (!hasDocument && !hasDom && !hasCheerio) {
      return this.handleError('No valid document, DOM, or Cheerio function provided for business intelligence analysis');
    }

    return true;
  }

  /**
   * Enhanced analyze method with BaseAnalyzer integration
   * @param {Object} context - Analysis context containing document/dom/cheerio, url, pageData
   * @returns {Object} Enhanced analysis results with BaseAnalyzer structure
   */
  async analyze(context) {
    const startTime = Date.now();
    
    try {
      // Validate input
      const validationResult = this.validate(context);
      if (validationResult !== true) {
        return validationResult; // Return validation error directly
      }

      // Extract data from context
      const domOrDocument = context.document || context.dom || context.cheerio;
      const url = context.url || '';
      const pageData = context.pageData || {};

      // Perform comprehensive business intelligence analysis
      const analysisResult = await this.performBusinessIntelligenceAnalysis(domOrDocument, pageData, url);

      // Calculate comprehensive score using BaseAnalyzer integration
      const score = this._calculateComprehensiveScore(analysisResult);

      // Generate optimization recommendations
      const recommendations = this._generateBusinessIntelligenceRecommendations(analysisResult);

      // Generate analysis summary
      const summary = this._generateBusinessIntelligenceSummary(analysisResult);

      // Return enhanced BaseAnalyzer-compatible result
      return {
        success: true,
        analyzer: 'BusinessIntelligenceAnalyzer',
        category: AnalyzerCategories.BUSINESS_INTELLIGENCE,
        score: score,
        data: {
          ...analysisResult,
          metadata: {
            analysisTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            version: this.getMetadata().version
          }
        },
        recommendations: recommendations,
        summary: summary,
        errors: [],
        warnings: analysisResult.warnings || []
      };

    } catch (error) {
      return this.handleError(`Business intelligence analysis failed: ${error.message}`, {
        analyzer: 'BusinessIntelligenceAnalyzer',
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Perform comprehensive business intelligence analysis
   * @param {Object|Document} domOrDocument - JSDOM object, DOM document, or Cheerio function
   * @param {Object} pageData - Existing page data
   * @param {string} url - Page URL
   * @returns {Object} Business intelligence analysis results
   */
  async performBusinessIntelligenceAnalysis(domOrDocument, pageDataOrUrl, url) {
    const analysisStart = Date.now();

    try {
      // Basic validation
      if (domOrDocument === null || domOrDocument === undefined) {
        return this.createErrorResponse('Invalid document: document cannot be null or undefined', 'validation');
      }
      
      // Handle different call signatures and DOM types
      let document, actualUrl, pageData, $;
      
      console.log('🔧 DEBUG BI: domOrDocument type:', typeof domOrDocument);
      console.log('🔧 DEBUG BI: domOrDocument has window:', !!domOrDocument.window);
      console.log('🔧 DEBUG BI: pageDataOrUrl type:', typeof pageDataOrUrl);
      
      // Check if we received a Cheerio function (server-side) or JSDOM object (client-side)
      if (typeof domOrDocument === 'function') {
        // Server-side: domOrDocument is Cheerio $ function
        $ = domOrDocument;
        document = null; // Not used with Cheerio
        console.log('🔧 DEBUG BI: Using Cheerio (server-side) mode');
      } else if (domOrDocument.window) {
        // Client-side: domOrDocument is JSDOM object
        document = domOrDocument.window.document;
        $ = null; // Not used with JSDOM
        console.log('🔧 DEBUG BI: Using JSDOM (client-side) mode');
      } else {
        // Assume it's already a document
        document = domOrDocument;
        $ = null;
        console.log('🔧 DEBUG BI: Using direct document mode');
      }
      
      if (typeof pageDataOrUrl === 'string') {
        // Called with (document/cheerio, url)
        actualUrl = pageDataOrUrl;
        pageData = {};
        console.log('🔧 DEBUG BI: Using (document, url) signature');
      } else {
        // Called with (dom, pageData, url)
        pageData = pageDataOrUrl || {};
        actualUrl = url;
        console.log('🔧 DEBUG BI: Using (dom, pageData, url) signature');
      }
      
      console.log('🔧 DEBUG BI: Final setup - document:', !!document, '$ function:', !!$);

      // Comprehensive business analysis
      const analysis = {
        trustSignals: await this._analyzeTrustSignals(document, actualUrl, $),
        contactInformation: await this._analyzeContactInformation(document, actualUrl, $),
        aboutPageQuality: await this._analyzeAboutPage(document, actualUrl, $),
        customerSupport: await this._analyzeCustomerSupport(document, actualUrl, $),
        businessCredibility: await this._analyzeBusinessCredibility(document, $),
        locationData: await this._analyzeLocationData(document, actualUrl, $),
        businessHours: await this._analyzeBusinessHours(document, $),
      };

      // Calculate business intelligence score
      const scoreDetails = this._calculateBusinessScore(analysis);
      analysis.score = scoreDetails.overall;
      analysis.scoreBreakdown = scoreDetails.breakdown;

      // Assign grade based on score
      analysis.grade = BusinessIntelligenceUtils.getGrade(analysis.score);

      // Generate business recommendations
      analysis.recommendations = this._generateBusinessRecommendations(analysis);

      // Identify strengths
      analysis.strengths = this._identifyBusinessStrengths(analysis);

      // Business type classification
      analysis.businessType = this._classifyBusinessType(document, analysis);

      // Overall assessment
      analysis.assessment = this._generateBusinessAssessment(analysis);

      analysis.analysisTime = Date.now() - analysisStart;
      analysis.timestamp = new Date().toISOString();

      return analysis;
    } catch (error) {
      return {
        error: `Business intelligence analysis failed: ${error.message}`,
        analysisTime: Date.now() - analysisStart,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Analyze trust signals and credibility indicators
   */
  async _analyzeTrustSignals(document, url, $) {
    if (!this.options.enableTrustAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.trustSignals.analyze({ document, url, pageData: {} });
  }

  /**
   * Analyze contact information quality
   */
  async _analyzeContactInformation(document, url, $) {
    if (!this.options.enableContactAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.contact.analyze({ document, url, pageData: {} });
  }

  /**
   * Analyze about page quality
   */
  async _analyzeAboutPage(document, url, $) {
    if (!this.options.enableContentAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.aboutPage.analyze({ document, url, pageData: {} });
  }

  /**
   * Analyze customer support accessibility
   */
  async _analyzeCustomerSupport(document, url, $) {
    if (!this.options.enableSupportAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.support.analyze({ document, url, pageData: {} });
  }

  /**
   * Analyze business credibility factors
   */
  async _analyzeBusinessCredibility(document, $) {
    if (!this.options.enableCredibilityAnalysis) {
      return { enabled: false };
    }

    const credibilityFactors = {
      businessAge: this._extractBusinessAge(document, $),
      companySize: this._extractCompanySize(document, $),
      industryExperience: this._extractIndustryExperience(document, $),
      clientBase: this._extractClientBase(document, $),
      partnerships: this._extractPartnerships(document, $),
      awards: this._extractAwards(document, $),
      mediaPresence: this._extractMediaPresence(document, $),
      professionalNetwork: this._extractProfessionalNetwork(document, $),
    };

    return {
      factors: credibilityFactors,
      score: this._calculateCredibilityScore(credibilityFactors),
      strengths: this._identifyCredibilityStrengths(credibilityFactors),
      weaknesses: this._identifyCredibilityWeaknesses(credibilityFactors),
    };
  }

  /**
   * Analyze location and business presence data
   */
  async _analyzeLocationData(document, url, $) {
    if (!this.options.enableLocationAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.location.analyze({ document, url, pageData: {} });
  }

  /**
   * Analyze business hours and availability information
   */
  async _analyzeBusinessHours(document) {
    const hoursPatterns = [
      /(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
      /(mon|tue|wed|thu|fri|sat|sun)/gi,
      /(\d{1,2})\s*(am|pm)\s*-\s*(\d{1,2})\s*(am|pm)/gi,
      /24\/7|24\s*hours|always\s*open/gi,
    ];

    const textContent = document.body.textContent;
    const foundHours = [];

    hoursPatterns.forEach(pattern => {
      const matches = textContent.match(pattern);
      if (matches) {
        foundHours.push(...matches);
      }
    });

    return {
      hasBusinessHours: foundHours.length > 0,
      hoursFound: foundHours,
      is24Hours: /24\/7|24\s*hours|always\s*open/gi.test(textContent),
      hoursElements: this._findHoursElements(document),
      structuredData: this._extractHoursStructuredData(document),
    };
  }

  /**
   * Calculate overall business intelligence score
   */
  _calculateBusinessScore(analysis) {
    const weights = {
      trustSignals: 0.25,
      contactInformation: 0.20,
      aboutPageQuality: 0.15,
      customerSupport: 0.15,
      businessCredibility: 0.15,
      locationData: 0.10,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      if (analysis[category] && analysis[category].score !== undefined) {
        totalScore += analysis[category].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      overall: Math.round(score * 10) / 10,
      breakdown: {
        trustSignals: analysis.trustSignals?.score || 0,
        contactInformation: analysis.contactInformation?.score || 0,
        aboutPageQuality: analysis.aboutPageQuality?.score || 0,
        customerSupport: analysis.customerSupport?.score || 0,
        businessCredibility: analysis.businessCredibility?.score || 0,
        locationData: analysis.locationData?.score || 0,
      },
      grade: this._assignGrade(score),
      strengths: this._identifyBusinessStrengths(analysis),
      weaknesses: this._identifyBusinessWeaknesses(analysis),
    };
  }

  /**
   * Generate business intelligence recommendations
   */
  _generateBusinessRecommendations(analysis) {
    const recommendations = [];

    // Trust signals recommendations
    if (analysis.trustSignals?.score < 70) {
      recommendations.push({
        category: 'Trust Signals',
        priority: 'high',
        title: 'Add Security and Trust Badges',
        description: 'Display SSL certificates, security badges, and professional certifications to build customer trust.',
        impact: 'high',
        effort: 'medium',
      });
    }

    // Contact information recommendations
    if (analysis.contactInformation?.score < 80) {
      recommendations.push({
        category: 'Contact Information',
        priority: 'high',
        title: 'Improve Contact Information Visibility',
        description: 'Ensure phone number, email, and physical address are easily accessible on all pages.',
        impact: 'high',
        effort: 'low',
      });
    }

    // About page recommendations
    if (analysis.aboutPageQuality?.score < 75) {
      recommendations.push({
        category: 'About Page',
        priority: 'medium',
        title: 'Enhance About Page Content',
        description: 'Add company history, team information, mission statement, and founder story to build credibility.',
        impact: 'medium',
        effort: 'medium',
      });
    }

    // Customer support recommendations
    if (analysis.customerSupport?.score < 70) {
      recommendations.push({
        category: 'Customer Support',
        priority: 'high',
        title: 'Expand Customer Support Options',
        description: 'Add live chat, FAQ section, or knowledge base to improve customer support accessibility.',
        impact: 'high',
        effort: 'high',
      });
    }

    // Business credibility recommendations
    if (analysis.businessCredibility?.score < 75) {
      recommendations.push({
        category: 'Business Credibility',
        priority: 'medium',
        title: 'Showcase Business Credentials',
        description: 'Display years in business, client testimonials, awards, and industry partnerships.',
        impact: 'medium',
        effort: 'medium',
      });
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  /**
   * Classify business type based on analysis
   */
  _classifyBusinessType(document, analysis) {
    const textContent = document.body.textContent.toLowerCase();
    
    const businessTypes = {
      'E-commerce': ['shop', 'store', 'buy', 'cart', 'product', 'price', 'order'],
      'Professional Services': ['consulting', 'lawyer', 'attorney', 'accounting', 'marketing', 'agency'],
      'Healthcare': ['doctor', 'medical', 'clinic', 'hospital', 'health', 'dental', 'pharmacy'],
      'Technology': ['software', 'app', 'tech', 'digital', 'development', 'programming', 'IT'],
      'Education': ['school', 'university', 'education', 'learning', 'course', 'training'],
      'Real Estate': ['property', 'real estate', 'home', 'house', 'apartment', 'rental'],
      'Financial': ['bank', 'finance', 'investment', 'insurance', 'loan', 'credit'],
      'Restaurant/Food': ['restaurant', 'food', 'menu', 'dining', 'cafe', 'delivery'],
      'Non-profit': ['non-profit', 'charity', 'foundation', 'donation', 'volunteer'],
      'Government': ['government', 'city', 'county', 'state', 'federal', 'public'],
    };

    const scores = {};
    Object.entries(businessTypes).forEach(([type, keywords]) => {
      scores[type] = keywords.reduce((score, keyword) => {
        return score + (textContent.includes(keyword) ? 1 : 0);
      }, 0);
    });

    const topType = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    
    return {
      primary: topType[1] > 0 ? topType[0] : 'General Business',
      confidence: Math.min((topType[1] / businessTypes[topType[0]].length) * 100, 100),
      indicators: scores,
    };
  }

  /**
   * Generate overall business assessment
   */
  _generateBusinessAssessment(analysis) {
    const score = analysis.score?.overall || 0;
    let assessment = '';

    if (score >= 90) {
      assessment = 'Excellent business presence with strong trust signals and comprehensive information.';
    } else if (score >= 80) {
      assessment = 'Good business presence with solid credibility indicators and adequate contact information.';
    } else if (score >= 70) {
      assessment = 'Moderate business presence with some trust signals but room for improvement.';
    } else if (score >= 60) {
      assessment = 'Basic business presence with limited trust signals and contact information.';
    } else {
      assessment = 'Weak business presence requiring significant improvement in trust signals and credibility.';
    }

    return {
      summary: assessment,
      trustLevel: score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low',
      credibilityFactors: this._summarizeCredibilityFactors(analysis),
      improvementAreas: this._identifyImprovementAreas(analysis),
    };
  }

  // Helper methods
  _assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _identifyBusinessStrengths(analysis) {
    const strengths = [];
    
    if (analysis.trustSignals?.score >= 80) strengths.push('Strong trust signals');
    if (analysis.contactInformation?.score >= 80) strengths.push('Comprehensive contact information');
    if (analysis.aboutPageQuality?.score >= 80) strengths.push('High-quality about page');
    if (analysis.customerSupport?.score >= 80) strengths.push('Excellent customer support');
    if (analysis.businessCredibility?.score >= 80) strengths.push('Strong business credibility');
    
    return strengths;
  }

  _identifyBusinessWeaknesses(analysis) {
    const weaknesses = [];
    
    if (analysis.trustSignals?.score < 60) weaknesses.push('Limited trust signals');
    if (analysis.contactInformation?.score < 60) weaknesses.push('Insufficient contact information');
    if (analysis.aboutPageQuality?.score < 60) weaknesses.push('Poor about page quality');
    if (analysis.customerSupport?.score < 60) weaknesses.push('Limited customer support options');
    if (analysis.businessCredibility?.score < 60) weaknesses.push('Weak business credibility indicators');
    
    return weaknesses;
  }

  _extractBusinessAge(document) {
    const textContent = document.body.textContent;
    const agePatterns = [
      /since\s+(\d{4})/gi,
      /established\s+(\d{4})/gi,
      /founded\s+(\d{4})/gi,
      /(\d+)\s+years?\s+of\s+experience/gi,
      /(\d+)\s+years?\s+in\s+business/gi,
    ];

    for (const pattern of agePatterns) {
      const match = textContent.match(pattern);
      if (match) {
        return {
          found: true,
          text: match[0],
          year: match[1],
          yearsInBusiness: new Date().getFullYear() - parseInt(match[1]),
        };
      }
    }

    return { found: false };
  }

  _extractCompanySize(document) {
    const textContent = document.body.textContent;
    const sizePatterns = [
      /(\d+)\s+employees/gi,
      /team\s+of\s+(\d+)/gi,
      /(\d+)\s+staff/gi,
      /fortune\s+(\d+)/gi,
    ];

    for (const pattern of sizePatterns) {
      const match = textContent.match(pattern);
      if (match) {
        return {
          found: true,
          text: match[0],
          size: match[1],
        };
      }
    }

    return { found: false };
  }

  _extractIndustryExperience(document) {
    const textContent = document.body.textContent;
    const experienceKeywords = [
      'expert', 'specialist', 'professional', 'certified', 'experienced',
      'leader', 'pioneer', 'industry leader', 'award-winning'
    ];

    const found = experienceKeywords.filter(keyword => 
      new RegExp(keyword, 'gi').test(textContent)
    );

    return {
      found: found.length > 0,
      keywords: found,
      score: Math.min(found.length * 10, 100),
    };
  }

  _extractClientBase(document) {
    const textContent = document.body.textContent;
    const clientPatterns = [
      /(\d+)\s+clients/gi,
      /(\d+)\s+customers/gi,
      /served\s+(\d+)/gi,
      /trusted\s+by\s+(\d+)/gi,
    ];

    for (const pattern of clientPatterns) {
      const match = textContent.match(pattern);
      if (match) {
        return {
          found: true,
          text: match[0],
          count: match[1],
        };
      }
    }

    return { found: false };
  }

  _extractPartnerships(document) {
    const partnerships = [];
    const partnerKeywords = ['partner', 'partnership', 'alliance', 'collaboration', 'sponsor'];
    
    partnerKeywords.forEach(keyword => {
      const elements = document.querySelectorAll(`[alt*="${keyword}" i], [title*="${keyword}" i]`);
      if (elements.length > 0) {
        partnerships.push({
          type: keyword,
          count: elements.length,
        });
      }
    });

    return {
      found: partnerships.length > 0,
      partnerships,
      score: Math.min(partnerships.length * 15, 100),
    };
  }

  _extractAwards(document) {
    const awardKeywords = ['award', 'winner', 'recognition', 'certificate', 'achievement'];
    const awards = [];
    
    awardKeywords.forEach(keyword => {
      const elements = document.querySelectorAll(`[alt*="${keyword}" i], [title*="${keyword}" i]`);
      if (elements.length > 0) {
        awards.push({
          type: keyword,
          count: elements.length,
        });
      }
    });

    return {
      found: awards.length > 0,
      awards,
      score: Math.min(awards.length * 20, 100),
    };
  }

  _extractMediaPresence(document) {
    const mediaKeywords = ['featured in', 'as seen on', 'press', 'media', 'news'];
    const textContent = document.body.textContent.toLowerCase();
    
    const mentions = mediaKeywords.filter(keyword => textContent.includes(keyword));
    
    return {
      found: mentions.length > 0,
      mentions,
      score: Math.min(mentions.length * 10, 100),
    };
  }

  _extractProfessionalNetwork(document) {
    const professionalKeywords = ['member', 'association', 'certified', 'accredited', 'licensed'];
    const textContent = document.body.textContent.toLowerCase();
    
    const memberships = professionalKeywords.filter(keyword => textContent.includes(keyword));
    
    return {
      found: memberships.length > 0,
      memberships,
      score: Math.min(memberships.length * 15, 100),
    };
  }

  _calculateCredibilityScore(factors) {
    const weights = {
      businessAge: 0.2,
      companySize: 0.15,
      industryExperience: 0.2,
      clientBase: 0.15,
      partnerships: 0.1,
      awards: 0.1,
      mediaPresence: 0.05,
      professionalNetwork: 0.05,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([factor, weight]) => {
      if (factors[factor]?.found) {
        const score = factors[factor].score || (factors[factor].found ? 70 : 0);
        totalScore += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  _identifyCredibilityStrengths(factors) {
    const strengths = [];
    
    if (factors.businessAge?.found) strengths.push('Established business with clear founding date');
    if (factors.companySize?.found) strengths.push('Transparent about company size');
    if (factors.industryExperience?.score > 50) strengths.push('Strong industry expertise demonstrated');
    if (factors.clientBase?.found) strengths.push('Clear client base information');
    if (factors.partnerships?.found) strengths.push('Strategic partnerships established');
    if (factors.awards?.found) strengths.push('Industry recognition and awards');
    if (factors.mediaPresence?.found) strengths.push('Media coverage and press mentions');
    if (factors.professionalNetwork?.found) strengths.push('Professional associations and certifications');
    
    return strengths;
  }

  _identifyCredibilityWeaknesses(factors) {
    const weaknesses = [];
    
    if (!factors.businessAge?.found) weaknesses.push('No clear business founding date or age information');
    if (!factors.companySize?.found) weaknesses.push('No information about company size or team');
    if (factors.industryExperience?.score < 30) weaknesses.push('Limited demonstration of industry expertise');
    if (!factors.clientBase?.found) weaknesses.push('No clear information about client base or customers served');
    if (!factors.partnerships?.found) weaknesses.push('No visible strategic partnerships or alliances');
    if (!factors.awards?.found) weaknesses.push('No industry awards or recognition displayed');
    if (!factors.mediaPresence?.found) weaknesses.push('Limited media coverage or press mentions');
    if (!factors.professionalNetwork?.found) weaknesses.push('No professional associations or certifications mentioned');
    
    return weaknesses;
  }

  _findHoursElements(document) {
    const hoursSelectors = [
      '.hours', '.business-hours', '.opening-hours', '.store-hours',
      '#hours', '#business-hours', '#opening-hours', '#store-hours',
      '[class*="hour"]', '[id*="hour"]'
    ];

    const elements = [];
    hoursSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    });

    return elements.map(element => ({
      tag: element.tagName,
      text: element.textContent.trim(),
      classes: element.className,
      id: element.id,
    }));
  }

  _extractHoursStructuredData(document) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredHours = [];

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data.openingHours || data.openingHoursSpecification) {
          structuredHours.push(data);
        }
      } catch (error) {
        // Invalid JSON-LD
      }
    });

    return structuredHours;
  }

  _summarizeCredibilityFactors(analysis) {
    const factors = [];
    
    if (analysis.trustSignals?.score >= 70) factors.push('Strong trust signals');
    if (analysis.contactInformation?.completeness >= 70) factors.push('Complete contact information');
    if (analysis.aboutPageQuality?.found) factors.push('Quality about page');
    if (analysis.customerSupport?.supportOptions) factors.push('Multiple support channels');
    if (analysis.businessCredibility?.factors?.businessAge?.found) factors.push('Established business');
    
    return factors;
  }

  _identifyImprovementAreas(analysis) {
    const areas = [];
    
    if (analysis.trustSignals?.score < 60) areas.push('Trust signals and security badges');
    if (analysis.contactInformation?.score < 60) areas.push('Contact information accessibility');
    if (analysis.aboutPageQuality?.score < 60) areas.push('About page content quality');
    if (analysis.customerSupport?.score < 60) areas.push('Customer support options');
    if (analysis.businessCredibility?.score < 60) areas.push('Business credibility indicators');
    
    return areas;
  }

  // ============================================================================
  // BASEANALYZER INTEGRATION HELPER METHODS
  // ============================================================================

  /**
   * Calculate comprehensive business intelligence score for BaseAnalyzer integration
   * @param {Object} analysis - Business intelligence analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        trustSignals: 0.25,       // 25% - Trust signals and security
        contact: 0.20,            // 20% - Contact information quality
        aboutPage: 0.15,          // 15% - About page quality
        support: 0.15,            // 15% - Customer support accessibility
        credibility: 0.15,        // 15% - Business credibility
        location: 0.10            // 10% - Location and business data
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Trust signals score
      if (analysis.trustSignals && typeof analysis.trustSignals.score === 'number') {
        totalScore += analysis.trustSignals.score * weights.trustSignals;
        totalWeight += weights.trustSignals;
      }

      // Contact information score
      if (analysis.contactInformation && typeof analysis.contactInformation.score === 'number') {
        totalScore += analysis.contactInformation.score * weights.contact;
        totalWeight += weights.contact;
      }

      // About page quality score
      if (analysis.aboutPageQuality && typeof analysis.aboutPageQuality.score === 'number') {
        totalScore += analysis.aboutPageQuality.score * weights.aboutPage;
        totalWeight += weights.aboutPage;
      }

      // Customer support score
      if (analysis.customerSupport && typeof analysis.customerSupport.score === 'number') {
        totalScore += analysis.customerSupport.score * weights.support;
        totalWeight += weights.support;
      }

      // Business credibility score
      if (analysis.businessCredibility && typeof analysis.businessCredibility.score === 'number') {
        totalScore += analysis.businessCredibility.score * weights.credibility;
        totalWeight += weights.credibility;
      }

      // Location data score
      if (analysis.locationData && typeof analysis.locationData.score === 'number') {
        totalScore += analysis.locationData.score * weights.location;
        totalWeight += weights.location;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive business intelligence optimization recommendations
   * @param {Object} analysis - Business intelligence analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateBusinessIntelligenceRecommendations(analysis) {
    const recommendations = [];

    try {
      // Trust signals recommendations
      if (analysis.trustSignals && analysis.trustSignals.score < 70) {
        recommendations.push({
          category: 'trust-signals',
          priority: 'high',
          title: 'Improve Trust Signals',
          description: `Trust signal score is ${analysis.trustSignals.score}%`,
          impact: 'Customer confidence and conversion rates',
          actionItems: [
            'Add SSL security badges and certificates',
            'Display professional certifications and accreditations',
            'Include customer testimonials with photos',
            'Add industry awards and recognitions',
            'Show third-party validations and endorsements',
            'Implement comprehensive privacy policy'
          ]
        });
      }

      // Contact information recommendations
      if (analysis.contactInformation && analysis.contactInformation.score < 70) {
        const missing = analysis.contactInformation.missing || [];
        recommendations.push({
          category: 'contact-information',
          priority: 'high',
          title: 'Enhance Contact Information',
          description: `Contact information score is ${analysis.contactInformation.score}%`,
          impact: 'Customer accessibility and business credibility',
          actionItems: [
            'Add missing contact methods: ' + missing.join(', '),
            'Include phone number with area code',
            'Add physical business address',
            'Provide multiple contact channels',
            'Include business hours information',
            'Add contact form with validation'
          ]
        });
      }

      // About page recommendations
      if (analysis.aboutPageQuality && analysis.aboutPageQuality.score < 70) {
        recommendations.push({
          category: 'about-page',
          priority: 'medium',
          title: 'Improve About Page Quality',
          description: `About page quality score is ${analysis.aboutPageQuality.score}%`,
          impact: 'Brand trust and customer understanding',
          actionItems: [
            'Add comprehensive company history and mission',
            'Include team member photos and bios',
            'Showcase company values and culture',
            'Add business achievements and milestones',
            'Include industry expertise and experience',
            'Add testimonials and success stories'
          ]
        });
      }

      // Customer support recommendations
      if (analysis.customerSupport && analysis.customerSupport.score < 70) {
        recommendations.push({
          category: 'customer-support',
          priority: 'medium',
          title: 'Enhance Customer Support',
          description: `Customer support score is ${analysis.customerSupport.score}%`,
          impact: 'Customer satisfaction and retention',
          actionItems: [
            'Add multiple support channels (phone, email, chat)',
            'Include FAQ section for common questions',
            'Provide support hours and response times',
            'Add knowledge base or help center',
            'Include support contact form',
            'Consider live chat implementation'
          ]
        });
      }

      // Business credibility recommendations
      if (analysis.businessCredibility && analysis.businessCredibility.score < 70) {
        recommendations.push({
          category: 'business-credibility',
          priority: 'medium',
          title: 'Strengthen Business Credibility',
          description: `Business credibility score is ${analysis.businessCredibility.score}%`,
          impact: 'Professional reputation and authority',
          actionItems: [
            'Add business founding date and history',
            'Include company size and team information',
            'Showcase industry experience and expertise',
            'Display client base and customer success stories',
            'Add strategic partnerships and alliances',
            'Include media coverage and press mentions'
          ]
        });
      }

      // Location data recommendations
      if (analysis.locationData && analysis.locationData.score < 70) {
        recommendations.push({
          category: 'location-data',
          priority: 'low',
          title: 'Improve Location Information',
          description: `Location data score is ${analysis.locationData.score}%`,
          impact: 'Local SEO and customer accessibility',
          actionItems: [
            'Add complete business address with postal code',
            'Include Google Maps integration or directions',
            'Add business hours for each location',
            'Include parking and accessibility information',
            'Add local phone numbers for each location',
            'Optimize for local search and Google My Business'
          ]
        });
      }

      // Overall business intelligence recommendations
      const overallScore = this._calculateComprehensiveScore(analysis);
      if (overallScore < 60) {
        recommendations.push({
          category: 'overall-business-intelligence',
          priority: 'high',
          title: 'Comprehensive Business Intelligence Improvement',
          description: `Overall business intelligence score is ${overallScore}%`,
          impact: 'Overall business credibility and customer trust',
          actionItems: [
            'Conduct comprehensive audit of all business information',
            'Implement consistent branding across all touchpoints',
            'Create comprehensive customer experience strategy',
            'Establish regular review process for business information',
            'Consider professional business consulting',
            'Benchmark against industry leaders'
          ]
        });
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating business intelligence recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive business intelligence analysis summary
   * @param {Object} analysis - Business intelligence analysis results
   * @returns {Object} Business intelligence summary
   */
  _generateBusinessIntelligenceSummary(analysis) {
    try {
      const summary = {
        overallRating: 'Poor',
        trustLevel: 'Low',
        contactQuality: 'Poor',
        contentQuality: 'Poor',
        supportLevel: 'Basic',
        credibilityLevel: 'Low',
        keyStrengths: [],
        keyWeaknesses: []
      };

      // Trust level assessment
      if (analysis.trustSignals) {
        const trustScore = analysis.trustSignals.score || 0;
        if (trustScore >= 80) summary.trustLevel = 'High';
        else if (trustScore >= 60) summary.trustLevel = 'Medium';
        else summary.trustLevel = 'Low';

        if (trustScore > 70) {
          summary.keyStrengths.push('Strong trust signals present');
        } else {
          summary.keyWeaknesses.push('Limited trust signals');
        }
      }

      // Contact quality assessment
      if (analysis.contactInformation) {
        const contactScore = analysis.contactInformation.score || 0;
        if (contactScore >= 80) summary.contactQuality = 'Excellent';
        else if (contactScore >= 60) summary.contactQuality = 'Good';
        else if (contactScore >= 40) summary.contactQuality = 'Fair';
        else summary.contactQuality = 'Poor';

        if (contactScore > 70) {
          summary.keyStrengths.push('Comprehensive contact information');
        } else {
          summary.keyWeaknesses.push('Incomplete contact information');
        }
      }

      // Content quality assessment (About page)
      if (analysis.aboutPageQuality) {
        const contentScore = analysis.aboutPageQuality.score || 0;
        if (contentScore >= 80) summary.contentQuality = 'Excellent';
        else if (contentScore >= 60) summary.contentQuality = 'Good';
        else if (contentScore >= 40) summary.contentQuality = 'Fair';
        else summary.contentQuality = 'Poor';

        if (contentScore > 70) {
          summary.keyStrengths.push('High-quality about page content');
        } else {
          summary.keyWeaknesses.push('About page needs improvement');
        }
      }

      // Support level assessment
      if (analysis.customerSupport) {
        const supportScore = analysis.customerSupport.score || 0;
        if (supportScore >= 80) summary.supportLevel = 'Excellent';
        else if (supportScore >= 60) summary.supportLevel = 'Good';
        else if (supportScore >= 40) summary.supportLevel = 'Basic';
        else summary.supportLevel = 'Limited';

        if (supportScore > 70) {
          summary.keyStrengths.push('Multiple customer support channels');
        } else {
          summary.keyWeaknesses.push('Limited customer support options');
        }
      }

      // Credibility level assessment
      if (analysis.businessCredibility) {
        const credibilityScore = analysis.businessCredibility.score || 0;
        if (credibilityScore >= 80) summary.credibilityLevel = 'High';
        else if (credibilityScore >= 60) summary.credibilityLevel = 'Medium';
        else summary.credibilityLevel = 'Low';

        if (credibilityScore > 70) {
          summary.keyStrengths.push('Strong business credibility indicators');
        } else {
          summary.keyWeaknesses.push('Limited business credibility information');
        }
      }

      // Overall rating based on comprehensive score
      const overallScore = this._calculateComprehensiveScore(analysis);
      if (overallScore >= 80) summary.overallRating = 'Excellent';
      else if (overallScore >= 60) summary.overallRating = 'Good';
      else if (overallScore >= 40) summary.overallRating = 'Fair';
      else summary.overallRating = 'Poor';

      // Additional strengths and weaknesses
      if (analysis.locationData && analysis.locationData.score > 70) {
        summary.keyStrengths.push('Complete location information');
      }

      if (summary.keyStrengths.length === 0) {
        summary.keyWeaknesses.push('No significant business intelligence strengths identified');
      }

      return summary;
    } catch (error) {
      this.log('Error generating business intelligence summary:', error.message);
      return {
        overallRating: 'Unknown',
        trustLevel: 'Unknown',
        contactQuality: 'Unknown',
        contentQuality: 'Unknown',
        supportLevel: 'Unknown',
        credibilityLevel: 'Unknown',
        keyStrengths: [],
        keyWeaknesses: ['Analysis error occurred']
      };
    }
  }

  // ============================================================================
}
