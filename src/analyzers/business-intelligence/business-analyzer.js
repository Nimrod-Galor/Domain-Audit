/**
 * ============================================================================
 * BUSINESS INTELLIGENCE ANALYZER MODULE
 * ============================================================================
 *
 * Comprehensive business intelligence analysis includi  async _analyzeLocationData(document, $) {
    if (!this.options.enableLocationAnalysis) {
      return { enabled: false };
    }
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

export class BusinessIntelligenceAnalyzer {
  constructor(options = {}) {
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
   * Helper method to abstract DOM queries for both Cheerio and JSDOM
   * @param {string} selector - CSS selector
   * @param {Document} document - JSDOM document (if available)
   * @param {Function} $ - Cheerio function (if available)
   * @returns {Array} Array of elements
   */
  _querySelector(selector, document, $) {
    if ($) {
      // Server-side: Use Cheerio
      const elements = $(selector);
      return elements.toArray ? elements.toArray() : Array.from(elements);
    } else if (document && document.querySelectorAll) {
      // Client-side: Use JSDOM/DOM
      return Array.from(document.querySelectorAll(selector));
    }
    return [];
  }

  /**
   * Helper method to get text content from an element
   * @param {Element} element - DOM element
   * @param {Function} $ - Cheerio function (if available)
   * @returns {string} Text content
   */
  _getTextContent(element, $) {
    if ($) {
      // Server-side: Use Cheerio
      return $(element).text() || '';
    } else {
      // Client-side: Use JSDOM/DOM
      return element.textContent || '';
    }
  }

  /**
   * Helper method to get attribute value
   * @param {Element} element - DOM element
   * @param {string} attribute - Attribute name
   * @param {Function} $ - Cheerio function (if available)
   * @returns {string} Attribute value
   */
  _getAttribute(element, attribute, $) {
    if ($) {
      // Server-side: Use Cheerio
      return $(element).attr(attribute) || '';
    } else {
      // Client-side: Use JSDOM/DOM
      return element.getAttribute(attribute) || '';
    }
  }

  /**
   * Perform comprehensive business intelligence analysis
   * @param {Object|Document} domOrDocument - JSDOM object or DOM document
   * @param {Object|string} pageDataOrUrl - Existing page data or URL string
   * @param {string} url - Page URL (if pageData is provided)
   * @returns {Object} Business intelligence analysis results
   */
  async analyzeBusinessIntelligence(domOrDocument, pageDataOrUrl, url) {
    const analysisStart = Date.now();

    try {
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
        contactInformation: await this._analyzeContactInformation(document, $),
        aboutPageQuality: await this._analyzeAboutPage(document, actualUrl, $),
        customerSupport: await this._analyzeCustomerSupport(document, $),
        businessCredibility: await this._analyzeBusinessCredibility(document, $),
        locationData: await this._analyzeLocationData(document, $),
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
    return this.analyzers.trustSignals.analyze(document, url, $);
  }

  /**
   * Analyze contact information quality
   */
  async _analyzeContactInformation(document, $) {
    if (!this.options.enableContactAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.contact.analyze(document, $);
  }

  /**
   * Analyze about page quality
   */
  async _analyzeAboutPage(document, url, $) {
    if (!this.options.enableContentAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.aboutPage.analyze(document, url, $);
  }

  /**
   * Analyze customer support accessibility
   */
  async _analyzeCustomerSupport(document, $) {
    if (!this.options.enableSupportAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.support.analyze(document, $);
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
  async _analyzeLocationData(document) {
    if (!this.options.enableLocationAnalysis) {
      return { enabled: false };
    }
    return this.analyzers.location.analyze(document);
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
}
