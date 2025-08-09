/**
 * ============================================================================
 * BUSINESS INTELLIGENCE ANALYZER MODULE (Minimal Working Version)
 * ============================================================================
 */

import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';

export class BusinessIntelligenceAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('BusinessIntelligenceAnalyzer', {
      enableTrustAnalysis: options.enableTrustAnalysis !== false,
      enableContactAnalysis: options.enableContactAnalysis !== false,
      enableContentAnalysis: options.enableContentAnalysis !== false,
      enableSupportAnalysis: options.enableSupportAnalysis !== false,
      enableCredibilityAnalysis: options.enableCredibilityAnalysis !== false,
      enableLocationAnalysis: options.enableLocationAnalysis !== false,
      ...options,
    });
  }

  getMetadata() {
    return {
      name: 'BusinessIntelligenceAnalyzer',
      version: '1.0.0',
      description: 'Analyzes business intelligence signals from website content',
      category: AnalyzerCategories.BUSINESS_INTELLIGENCE,
      priority: 'high'
    };
  }

  /**
   * Perform business intelligence analysis
   * @param {Document} document - DOM document
   * @param {Object|string} pageDataOrUrl - Page data object or URL string
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(document, pageDataOrUrl, url) {
    return this.measureTime(async () => {
      try {
        this.log('info', 'Starting Business Intelligence analysis...');
        
        let actualUrl, pageData;
        if (typeof pageDataOrUrl === 'string') {
          actualUrl = pageDataOrUrl;
          pageData = {};
        } else {
          pageData = pageDataOrUrl || {};
          actualUrl = url;
        }

        // Perform basic analysis using document adapter
        const trustSignals = this._analyzeTrustSignals(document, actualUrl);
        const contactInformation = this._analyzeContactInformation(document);
        const aboutPageQuality = this._analyzeAboutPage(document, actualUrl);
        const customerSupport = this._analyzeCustomerSupport(document);
        const businessCredibility = this._analyzeBusinessCredibility(document);
        const locationData = this._analyzeLocationData(document);

        // Calculate basic score
        const analysisComponents = [trustSignals, contactInformation, aboutPageQuality, 
                                  customerSupport, businessCredibility, locationData];
        const validComponents = analysisComponents.filter(c => c.score !== undefined).length;
        const totalScore = analysisComponents.reduce((sum, c) => sum + (c.score || 0), 0);
        const overallScore = validComponents > 0 ? Math.round(totalScore / validComponents) : 0;

        const analysisData = {
          trustSignals,
          contactInformation,
          aboutPageQuality,
          customerSupport,
          businessCredibility,
          locationData,
          score: overallScore,
          grade: this._getGrade(overallScore),
          recommendations: this._generateRecommendations(overallScore),
          strengths: this._identifyStrengths(analysisComponents),
          businessType: 'general'
        };

        this.log('info', `Business Intelligence analysis completed with score: ${overallScore}`);
        return analysisData;

      } catch (error) {
        return this.handleError(error, 'business intelligence analysis');
      }
    }).then(({ result, time }) => {
      if (result.error) {
        return {
          ...result,
          trustSignals: null,
          contactInformation: null,
          aboutPageQuality: null,
          customerSupport: null,
          businessCredibility: null,
          locationData: null,
          score: 0,
          grade: 'F',
          recommendations: ['Fix analysis errors'],
          analysisTime: time
        };
      }
      return this.createSuccessResponse(result, time);
    });
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use analyze() method instead
   */
  async analyzeBusinessIntelligence(document, pageDataOrUrl, url) {
    console.warn('analyzeBusinessIntelligence() is deprecated. Use analyze() method instead.');
    return this.analyze(document, pageDataOrUrl, url);
  }

  _analyzeTrustSignals(document, url) {
    try {
      // Look for trust indicators - use direct querySelectorAll to allow errors to propagate in tests
      const securityElements = document && document.querySelectorAll ? 
        document.querySelectorAll('img[alt*="ssl"], img[alt*="secure"], img[alt*="verified"]') : [];
      const certificationElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="trust"], [class*="cert"], [class*="secure"]') : [];
      
      const trustScore = (securityElements.length * 20) + (certificationElements.length * 15);
      
      return {
        sslPresent: url?.startsWith('https://') || false,
        securityBadges: securityElements.length,
        certifications: certificationElements.length,
        score: Math.min(trustScore, 100),
        grade: this._getGrade(Math.min(trustScore, 100))
      };
    } catch (error) {
      return { score: 0, error: error.message };
    }
  }

  _analyzeContactInformation(document) {
    try {
      // Look for contact information
      const emailElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[href^="mailto:"], [href*="@"]') : [];
      const phoneElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[href^="tel:"], [href*="phone"]') : [];
      const addressElements = document && document.querySelectorAll ? 
        document.querySelectorAll('address, [class*="address"], [class*="location"]') : [];
      
      const contactScore = (emailElements.length * 25) + (phoneElements.length * 25) + (addressElements.length * 30);
      
      return {
        emailFound: emailElements.length > 0,
        phoneFound: phoneElements.length > 0,
        addressFound: addressElements.length > 0,
        score: Math.min(contactScore, 100),
        grade: this._getGrade(Math.min(contactScore, 100))
      };
    } catch (error) {
      return { score: 0, error: error.message };
    }
  }

  _analyzeAboutPage(document, url) {
    try {
      // Look for about page indicators
      const aboutLinks = document && document.querySelectorAll ? 
        document.querySelectorAll('[href*="about"], [href*="company"]') : [];
      const missionElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="mission"], [class*="vision"], [class*="about"]') : [];
      
      const aboutScore = (aboutLinks.length * 30) + (missionElements.length * 20);
      
      return {
        aboutPageLinked: aboutLinks.length > 0,
        missionStatement: missionElements.length > 0,
        score: Math.min(aboutScore, 100),
        grade: this._getGrade(Math.min(aboutScore, 100))
      };
    } catch (error) {
      return { score: 0, error: error.message };
    }
  }

  _analyzeCustomerSupport(document) {
    try {
      // Look for support elements
      const supportLinks = document && document.querySelectorAll ? 
        document.querySelectorAll('[href*="support"], [href*="help"], [href*="contact"]') : [];
      const chatElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="chat"], [class*="support"]') : [];
      
      const supportScore = (supportLinks.length * 30) + (chatElements.length * 25);
      
      return {
        supportPageLinked: supportLinks.length > 0,
        liveChatAvailable: chatElements.length > 0,
        score: Math.min(supportScore, 100),
        grade: this._getGrade(Math.min(supportScore, 100))
      };
    } catch (error) {
      return { score: 0, error: error.message };
    }
  }

  _analyzeBusinessCredibility(document) {
    try {
      // Look for credibility indicators
      const testimonialElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="testimonial"], [class*="review"]') : [];
      const clientElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="client"], [class*="partner"]') : [];
      
      const credibilityScore = (testimonialElements.length * 20) + (clientElements.length * 15);
      
      return {
        testimonialsPresent: testimonialElements.length > 0,
        clientLogosShown: clientElements.length > 0,
        score: Math.min(credibilityScore, 100),
        grade: this._getGrade(Math.min(credibilityScore, 100))
      };
    } catch (error) {
      return { score: 0, error: error.message };
    }
  }

  _analyzeLocationData(document) {
    try {
      // Look for location information
      const mapElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="map"], iframe[src*="maps"]') : [];
      const locationElements = document && document.querySelectorAll ? 
        document.querySelectorAll('[class*="location"], [class*="address"]') : [];
      
      const locationScore = (mapElements.length * 40) + (locationElements.length * 20);
      
      return {
        mapEmbedded: mapElements.length > 0,
        locationInfoPresent: locationElements.length > 0,
        score: Math.min(locationScore, 100),
        grade: this._getGrade(Math.min(locationScore, 100))
      };
    } catch (error) {
      return { score: 0, error: error.message };
    }
  }

  _getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  _generateRecommendations(score) {
    const recommendations = [];
    if (score < 90) recommendations.push('Add SSL security badges');
    if (score < 80) recommendations.push('Include customer testimonials');
    if (score < 70) recommendations.push('Add contact information');
    if (score < 60) recommendations.push('Create about page');
    if (score < 50) recommendations.push('Add location/map information');
    return recommendations;
  }

  _identifyStrengths(components) {
    const strengths = [];
    components.forEach(component => {
      if (component.score > 80) {
        strengths.push('Strong component performance');
      }
    });
    return strengths.length > 0 ? strengths : ['Basic website structure'];
  }
}
