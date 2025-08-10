/**
 * ============================================================================
 * CONTACT ANALYZER MODULE
 * ============================================================================
 *
 * Analyzes contact information quality and accessibility including:
 * - Contact form presence and quality
 * - Phone numbers and accessibility
 * - Email addresses and responsiveness
 * - Physical address information
 * - Social media presence
 * - Customer support channels
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerInterface, AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class ContactAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ContactAnalyzer');
    
    this.options = {
      enableFormAnalysis: options.enableFormAnalysis !== false,
      enablePhoneAnalysis: options.enablePhoneAnalysis !== false,
      enableEmailAnalysis: options.enableEmailAnalysis !== false,
      enableAddressAnalysis: options.enableAddressAnalysis !== false,
      enableSocialAnalysis: options.enableSocialAnalysis !== false,
      ...options,
    };

    this.phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\+?[0-9]{1,4}[-.\s]?)?(\(?[0-9]{1,4}\)?[-.\s]?){1,4}[0-9]{1,4}/g;
    this.emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    this.socialPlatforms = [
      { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'fb.me'] },
      { name: 'twitter', patterns: ['twitter.com', 't.co'] },
      { name: 'instagram', patterns: ['instagram.com', 'instagr.am'] },
      { name: 'linkedin', patterns: ['linkedin.com', 'lnkd.in'] },
      { name: 'youtube', patterns: ['youtube.com', 'youtu.be'] },
      { name: 'tiktok', patterns: ['tiktok.com'] },
      { name: 'pinterest', patterns: ['pinterest.com', 'pin.it'] },
      { name: 'whatsapp', patterns: ['wa.me', 'whatsapp.com'] },
      { name: 'telegram', patterns: ['t.me', 'telegram.me'] },
    ];

    this.contactSelectors = {
      forms: [
        'form[action*="contact"]', 'form[id*="contact"]', 'form[class*="contact"]',
        '.contact-form', '.contact-us-form', '.inquiry-form', '.get-in-touch',
        'form:has(input[name*="message"]), form:has(textarea[name*="message"])'
      ],
      phone: [
        'a[href^="tel:"]', '.phone', '.telephone', '.phone-number',
        '[class*="phone"]', '[id*="phone"]', '[class*="tel"]'
      ],
      email: [
        'a[href^="mailto:"]', '.email', '.email-address', '.contact-email',
        '[class*="email"]', '[id*="email"]'
      ],
      address: [
        '.address', '.location', '.office-address', '.contact-address',
        '[class*="address"]', '[id*="address"]', '[class*="location"]'
      ],
      social: [
        '.social-media', '.social-links', '.social-icons',
        '[class*="social"]', '[class*="facebook"]', '[class*="twitter"]',
        '[class*="instagram"]', '[class*="linkedin"]'
      ],
    };
  }

  /**
   * Analyze contact information on the page
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Contact analysis results
   */

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      category: AnalyzerCategories.BUSINESS_INTELLIGENCE,
      description: 'Analyzes contact information quality and accessibility including forms, phone numbers, emails, and social media presence',
      version: '1.0.0',
      author: 'Nimrod Galor',
      priority: 'high',
      type: 'business-intelligence',
      capabilities: [
        'contact-form-analysis',
        'phone-number-detection',
        'email-validation',
        'physical-address-analysis',
        'social-media-presence',
        'support-channels-analysis',
        'accessibility-assessment'
      ],
      metrics: [
        'contact_forms_count',
        'phone_numbers_count',
        'email_addresses_count',
        'social_media_platforms',
        'support_channels_count',
        'accessibility_score',
        'overall_contact_score'
      ],
      dependencies: ['cheerio'],
      performanceImpact: 'medium'
    };
  }

  /**
   * Validate input parameters
   * @param {Document} document - The DOM document
   * @param {string} url - The page URL
   * @returns {boolean} True if inputs are valid
   */
  validate(document, url) {
    if (!document) {
      this.handleError('Document is required for contact analysis');
      return false;
    }

    if (!url || typeof url !== 'string') {
      this.handleError('Valid URL is required for contact analysis');
      return false;
    }

    try {
      new URL(url);
    } catch (error) {
      this.handleError(`Invalid URL format: ${url}`);
      return false;
    }

    return true;
  }

  /**
   * Analyzes contact information on a webpage
   * @param {Object} context - Analysis context
   * @param {Document} context.document - The DOM document
   * @param {string} context.url - The page URL
   * @param {Object} context.pageData - Additional page data
   * @returns {Object} Analysis results
   */
  async analyze(context) {
    // Handle legacy calling format for backward compatibility
    if (context && context.nodeType === 9) {
      const document = context;
      const url = arguments[1];
      context = { document, url, pageData: {} };
    }

    if (!this.validate(context)) {
      return this.handleError(new Error('Invalid context provided'), 'validation');
    }

    const { document, url, pageData = {} } = context;

    if (!this.validate(document, url)) {
      return this.handleError(new Error('Validation failed for contact analysis'), 'validation');
    }

    return this.measureTime(async () => {
      try {
        const contactForms = this._analyzeContactForms(document);
        const phoneNumbers = this._analyzePhoneNumbers(document);
        const emailAddresses = this._analyzeEmailAddresses(document);
        const physicalAddress = this._analyzePhysicalAddress(document);
        const socialMedia = this._analyzeSocialMedia(document);
        const supportChannels = this._analyzeSupportChannels(document);
        const accessibility = this._analyzeAccessibility(document);

        const analysis = {
          contactForms,
          phoneNumbers,
          emailAddresses,
          physicalAddress,
          socialMedia,
          supportChannels,
          accessibility,
        };

        const score = this._calculateContactScore(analysis);

        const result = {
          ...analysis,
          score,
          grade: this._assignGrade(score),
          contactChannels: this._countContactChannels(analysis),
          strengths: this._identifyContactStrengths(analysis),
          recommendations: this._generateContactRecommendations(analysis),
          summary: this._generateExecutiveSummary(analysis, score),
          metadata: {
            ...this.getMetadata(),
            analysisDate: new Date().toISOString(),
            url: url
          }
        };

        return this.createSuccessResponse({
          data: result
        });

      } catch (error) {
        return this.handleError(error, 'contact analysis');
      }
    }).then(({result, time}) => {
      if (result.success) {
        result.analysisTime = time;
      }
      return result;
    });
  }

  /**
   * Analyze contact forms
   */
  _analyzeContactForms(document) {
    const forms = [];
    
    this.contactSelectors.forms.forEach((selector) => {
      const formElements = document.querySelectorAll(selector);
      formElements.forEach((form) => {
        const formAnalysis = this._analyzeFormQuality(form);
        forms.push(formAnalysis);
      });
    });

    // Also look for generic forms that might be contact forms
    const allForms = document.querySelectorAll('form');
    allForms.forEach((form) => {
      if (!forms.some(f => f.element === form)) {
        const formAnalysis = this._analyzeFormQuality(form);
        if (formAnalysis.isContactForm) {
          forms.push(formAnalysis);
        }
      }
    });

    return {
      forms,
      count: forms.length,
      averageQuality: forms.length > 0 
        ? forms.reduce((sum, f) => sum + f.quality, 0) / forms.length 
        : 0,
      hasHighQualityForm: forms.some(f => f.quality > 80),
      score: this._calculateFormScore(forms),
    };
  }

  /**
   * Analyze phone numbers
   */
  _analyzePhoneNumbers(document) {
    const phoneNumbers = new Set();
    const phoneElements = [];

    // Find phone links
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach((link) => {
      const number = link.href.replace('tel:', '');
      phoneNumbers.add(number);
      phoneElements.push({
        element: link,
        number,
        text: link.textContent.trim(),
        type: 'link',
        formatted: this._formatPhoneNumber(number),
      });
    });

    // Find phone numbers in text
    const textContent = document.body.textContent;
    const phoneMatches = textContent.match(this.phoneRegex) || [];
    phoneMatches.forEach((match) => {
      if (!phoneNumbers.has(match)) {
        phoneNumbers.add(match);
        phoneElements.push({
          number: match,
          text: match,
          type: 'text',
          formatted: this._formatPhoneNumber(match),
        });
      }
    });

    // Find phone elements with selectors
    this.contactSelectors.phone.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent.trim();
        const phoneMatch = text.match(this.phoneRegex);
        if (phoneMatch && !phoneNumbers.has(phoneMatch[0])) {
          phoneNumbers.add(phoneMatch[0]);
          phoneElements.push({
            element,
            number: phoneMatch[0],
            text,
            type: 'element',
            formatted: this._formatPhoneNumber(phoneMatch[0]),
          });
        }
      });
    });

    return {
      phoneElements,
      uniqueNumbers: Array.from(phoneNumbers),
      count: phoneNumbers.size,
      hasClickablePhone: phoneLinks.length > 0,
      score: this._calculatePhoneScore(phoneElements, phoneLinks.length),
    };
  }

  /**
   * Analyze email addresses
   */
  _analyzeEmailAddresses(document) {
    const emailAddresses = new Set();
    const emailElements = [];

    // Find mailto links
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach((link) => {
      const email = link.href.replace('mailto:', '').split('?')[0];
      emailAddresses.add(email);
      emailElements.push({
        element: link,
        email,
        text: link.textContent.trim(),
        type: 'link',
        domain: email.split('@')[1],
      });
    });

    // Find email addresses in text
    const textContent = document.body.textContent;
    const emailMatches = textContent.match(this.emailRegex) || [];
    emailMatches.forEach((match) => {
      if (!emailAddresses.has(match)) {
        emailAddresses.add(match);
        emailElements.push({
          email: match,
          text: match,
          type: 'text',
          domain: match.split('@')[1],
        });
      }
    });

    // Find email elements with selectors
    this.contactSelectors.email.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent.trim();
        const emailMatch = text.match(this.emailRegex);
        if (emailMatch && !emailAddresses.has(emailMatch[0])) {
          emailAddresses.add(emailMatch[0]);
          emailElements.push({
            element,
            email: emailMatch[0],
            text,
            type: 'element',
            domain: emailMatch[0].split('@')[1],
          });
        }
      });
    });

    return {
      emailElements,
      uniqueEmails: Array.from(emailAddresses),
      count: emailAddresses.size,
      hasClickableEmail: emailLinks.length > 0,
      domains: [...new Set(emailElements.map(e => e.domain))],
      score: this._calculateEmailScore(emailElements, emailLinks.length),
    };
  }

  /**
   * Analyze physical address
   */
  _analyzePhysicalAddress(document) {
    const addresses = [];
    
    // Look for address elements
    this.contactSelectors.address.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const addressText = element.textContent.trim();
        if (addressText.length > 10) {
          const addressAnalysis = this._analyzeAddressQuality(addressText);
          addresses.push({
            element,
            text: addressText,
            ...addressAnalysis,
          });
        }
      });
    });

    // Look for structured data addresses
    const structuredAddresses = this._findStructuredAddresses(document);
    addresses.push(...structuredAddresses);

    // Look for address patterns in text
    const addressPatterns = this._findAddressPatterns(document);
    addresses.push(...addressPatterns);

    return {
      addresses,
      count: addresses.length,
      hasStructuredData: structuredAddresses.length > 0,
      averageQuality: addresses.length > 0 
        ? addresses.reduce((sum, a) => sum + a.quality, 0) / addresses.length 
        : 0,
      score: this._calculateAddressScore(addresses),
    };
  }

  /**
   * Analyze social media presence
   */
  _analyzeSocialMedia(document) {
    const socialLinks = [];
    const platforms = new Set();

    // Find social media links
    const allLinks = document.querySelectorAll('a[href]');
    allLinks.forEach((link) => {
      const href = link.href.toLowerCase();
      
      this.socialPlatforms.forEach((platform) => {
        platform.patterns.forEach((pattern) => {
          if (href.includes(pattern)) {
            platforms.add(platform.name);
            socialLinks.push({
              platform: platform.name,
              url: link.href,
              text: link.textContent.trim(),
              element: link,
            });
          }
        });
      });
    });

    // Find social media icons/elements
    const socialElements = [];
    this.contactSelectors.social.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      socialElements.push(...Array.from(elements));
    });

    return {
      socialLinks,
      platforms: Array.from(platforms),
      platformCount: platforms.size,
      totalLinks: socialLinks.length,
      hasInstagram: platforms.has('instagram'),
      hasFacebook: platforms.has('facebook'),
      hasTwitter: platforms.has('twitter'),
      hasLinkedIn: platforms.has('linkedin'),
      hasYouTube: platforms.has('youtube'),
      score: this._calculateSocialScore(socialLinks, platforms),
    };
  }

  /**
   * Analyze support channels
   */
  _analyzeSupportChannels(document) {
    const channels = [];
    
    // Look for chat widgets
    const chatSelectors = [
      '.chat-widget', '.live-chat', '.support-chat', '.help-chat',
      '[class*="chat"]', '[id*="chat"]', '[class*="intercom"]',
      '[class*="zendesk"]', '[class*="freshchat"]'
    ];
    
    chatSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        channels.push({
          type: 'live_chat',
          count: elements.length,
          available: true,
        });
      }
    });

    // Look for support links
    const supportLinks = document.querySelectorAll('a[href*="support" i], a[href*="help" i], a[href*="contact" i]');
    if (supportLinks.length > 0) {
      channels.push({
        type: 'support_links',
        count: supportLinks.length,
        available: true,
      });
    }

    // Look for FAQ sections
    const faqElements = document.querySelectorAll('[class*="faq" i], [id*="faq" i], a[href*="faq" i]');
    if (faqElements.length > 0) {
      channels.push({
        type: 'faq',
        count: faqElements.length,
        available: true,
      });
    }

    // Look for knowledge base
    const kbElements = document.querySelectorAll('a[href*="knowledge" i], a[href*="docs" i], a[href*="documentation" i]');
    if (kbElements.length > 0) {
      channels.push({
        type: 'knowledge_base',
        count: kbElements.length,
        available: true,
      });
    }

    return {
      channels,
      channelCount: channels.length,
      hasLiveChat: channels.some(c => c.type === 'live_chat'),
      hasFAQ: channels.some(c => c.type === 'faq'),
      hasKnowledgeBase: channels.some(c => c.type === 'knowledge_base'),
      score: this._calculateSupportScore(channels),
    };
  }

  /**
   * Analyze contact accessibility
   */
  _analyzeAccessibility(document) {
    const contactPage = document.querySelector('a[href*="contact" i]');
    const contactSection = document.querySelector('#contact, .contact, [class*="contact"]');
    const headerContact = document.querySelector('header a[href*="contact" i], nav a[href*="contact" i]');
    const footerContact = document.querySelector('footer a[href*="contact" i]');

    return {
      hasContactPage: !!contactPage,
      hasContactSection: !!contactSection,
      inHeader: !!headerContact,
      inFooter: !!footerContact,
      easyToFind: !!(headerContact || footerContact || contactSection),
      score: this._calculateAccessibilityScore({
        hasContactPage: !!contactPage,
        hasContactSection: !!contactSection,
        inHeader: !!headerContact,
        inFooter: !!footerContact,
      }),
    };
  }

  // Helper methods
  _analyzeFormQuality(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    const requiredFields = form.querySelectorAll('[required]');
    const labels = form.querySelectorAll('label');
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

    const hasNameField = Array.from(inputs).some(input => 
      input.name && /name/i.test(input.name)
    );
    const hasEmailField = Array.from(inputs).some(input => 
      input.type === 'email' || (input.name && /email/i.test(input.name))
    );
    const hasMessageField = Array.from(inputs).some(input => 
      input.tagName === 'TEXTAREA' || (input.name && /message|comment|inquiry/i.test(input.name))
    );

    const isContactForm = hasEmailField && (hasMessageField || hasNameField);

    let quality = 0;
    if (hasNameField) quality += 15;
    if (hasEmailField) quality += 20;
    if (hasMessageField) quality += 20;
    if (submitButton) quality += 10;
    if (labels.length > 0) quality += 15;
    if (requiredFields.length > 0) quality += 10;
    if (inputs.length >= 3) quality += 10;

    return {
      element: form,
      isContactForm,
      inputs: inputs.length,
      labels: labels.length,
      requiredFields: requiredFields.length,
      hasNameField,
      hasEmailField,
      hasMessageField,
      hasSubmitButton: !!submitButton,
      quality,
    };
  }

  _formatPhoneNumber(phone) {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  _analyzeAddressQuality(addressText) {
    let quality = 0;
    
    // Check for street number
    if (/\d+/.test(addressText)) quality += 20;
    
    // Check for street name
    if (/\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)\b/i.test(addressText)) quality += 20;
    
    // Check for city
    if (/\b[A-Z][a-z]+\b/.test(addressText)) quality += 15;
    
    // Check for state/province
    if (/\b[A-Z]{2}\b|\b[A-Z][a-z]+\b/.test(addressText)) quality += 15;
    
    // Check for zip code
    if (/\b\d{5}(-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/.test(addressText)) quality += 20;
    
    // Check for country
    if (/\b(USA|US|United States|Canada|CA)\b/i.test(addressText)) quality += 10;

    return {
      quality,
      hasStreetNumber: /\d+/.test(addressText),
      hasStreetName: /\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)\b/i.test(addressText),
      hasZipCode: /\b\d{5}(-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/.test(addressText),
    };
  }

  _findStructuredAddresses(document) {
    const addresses = [];
    
    // Look for schema.org microdata
    const addressElements = document.querySelectorAll('[itemtype*="PostalAddress"]');
    addressElements.forEach((element) => {
      addresses.push({
        text: element.textContent.trim(),
        type: 'structured',
        quality: 90,
        hasStructuredData: true,
      });
    });

    return addresses;
  }

  _findAddressPatterns(document) {
    const addresses = [];
    const textContent = document.body.textContent;
    
    // Simple address pattern matching
    const addressPattern = /\d+\s+[A-Za-z\s,]+\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b[^.]*\b\d{5}\b/gi;
    const matches = textContent.match(addressPattern) || [];
    
    matches.forEach((match) => {
      addresses.push({
        text: match.trim(),
        type: 'pattern',
        quality: 70,
        hasStructuredData: false,
      });
    });

    return addresses;
  }

  _calculateContactScore(analysis) {
    const weights = {
      contactForms: 0.25,
      phoneNumbers: 0.20,
      emailAddresses: 0.20,
      physicalAddress: 0.15,
      socialMedia: 0.10,
      supportChannels: 0.10,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      if (analysis[category] && analysis[category].score !== undefined) {
        totalScore += analysis[category].score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  _calculateFormScore(forms) {
    if (forms.length === 0) return 0;
    
    const qualityScore = forms.reduce((sum, f) => sum + f.quality, 0) / forms.length;
    const quantityBonus = Math.min(forms.length * 10, 30);
    
    return Math.min(qualityScore + quantityBonus, 100);
  }

  _calculatePhoneScore(phoneElements, clickableCount) {
    if (phoneElements.length === 0) return 0;
    
    let score = Math.min(phoneElements.length * 25, 75);
    if (clickableCount > 0) score += 25;
    
    return Math.min(score, 100);
  }

  _calculateEmailScore(emailElements, clickableCount) {
    if (emailElements.length === 0) return 0;
    
    let score = Math.min(emailElements.length * 25, 75);
    if (clickableCount > 0) score += 25;
    
    return Math.min(score, 100);
  }

  _calculateAddressScore(addresses) {
    if (addresses.length === 0) return 0;
    
    const qualityScore = addresses.reduce((sum, a) => sum + a.quality, 0) / addresses.length;
    const quantityBonus = Math.min(addresses.length * 10, 20);
    
    return Math.min(qualityScore + quantityBonus, 100);
  }

  _calculateSocialScore(socialLinks, platforms) {
    let score = 0;
    
    score += Math.min(platforms.size * 15, 60);
    score += Math.min(socialLinks.length * 5, 40);
    
    return Math.min(score, 100);
  }

  _calculateSupportScore(channels) {
    if (channels.length === 0) return 0;
    
    let score = 0;
    channels.forEach((channel) => {
      switch (channel.type) {
        case 'live_chat': score += 40; break;
        case 'support_links': score += 20; break;
        case 'faq': score += 20; break;
        case 'knowledge_base': score += 20; break;
        default: score += 10;
      }
    });
    
    return Math.min(score, 100);
  }

  _calculateAccessibilityScore(accessibility) {
    let score = 0;
    
    if (accessibility.hasContactPage) score += 30;
    if (accessibility.hasContactSection) score += 20;
    if (accessibility.inHeader) score += 25;
    if (accessibility.inFooter) score += 25;
    
    return Math.min(score, 100);
  }

  _countContactChannels(analysis) {
    let channels = 0;
    
    if (analysis.contactForms.count > 0) channels++;
    if (analysis.phoneNumbers.count > 0) channels++;
    if (analysis.emailAddresses.count > 0) channels++;
    if (analysis.physicalAddress.count > 0) channels++;
    if (analysis.socialMedia.platformCount > 0) channels++;
    if (analysis.supportChannels.channelCount > 0) channels++;
    
    return channels;
  }

  _assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _identifyContactStrengths(analysis) {
    const strengths = [];
    
    if (analysis.contactForms.hasHighQualityForm) strengths.push('High-quality contact form available');
    if (analysis.phoneNumbers.hasClickablePhone) strengths.push('Clickable phone numbers');
    if (analysis.emailAddresses.hasClickableEmail) strengths.push('Clickable email addresses');
    if (analysis.physicalAddress.hasStructuredData) strengths.push('Structured address data');
    if (analysis.socialMedia.platformCount > 3) strengths.push('Multiple social media platforms');
    if (analysis.supportChannels.hasLiveChat) strengths.push('Live chat support available');
    if (analysis.accessibility.easyToFind) strengths.push('Contact information easy to find');
    
    return strengths;
  }

  _generateContactRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.contactForms.count === 0) {
      recommendations.push({
        category: 'Contact Forms',
        priority: 'high',
        title: 'Add Contact Form',
        description: 'Include a contact form with name, email, and message fields.',
        impact: 'high',
      });
    }
    
    if (!analysis.phoneNumbers.hasClickablePhone && analysis.phoneNumbers.count > 0) {
      recommendations.push({
        category: 'Phone Numbers',
        priority: 'medium',
        title: 'Make Phone Numbers Clickable',
        description: 'Convert phone numbers to clickable tel: links for mobile users.',
        impact: 'medium',
      });
    }
    
    if (!analysis.emailAddresses.hasClickableEmail && analysis.emailAddresses.count > 0) {
      recommendations.push({
        category: 'Email Addresses',
        priority: 'medium',
        title: 'Make Email Addresses Clickable',
        description: 'Convert email addresses to clickable mailto: links.',
        impact: 'medium',
      });
    }
    
    if (analysis.physicalAddress.count === 0) {
      recommendations.push({
        category: 'Physical Address',
        priority: 'medium',
        title: 'Add Business Address',
        description: 'Include your business address for local credibility.',
        impact: 'medium',
      });
    }
    
    if (!analysis.supportChannels.hasLiveChat) {
      recommendations.push({
        category: 'Customer Support',
        priority: 'low',
        title: 'Consider Live Chat',
        description: 'Add live chat for immediate customer support.',
        impact: 'medium',
      });
    }
    
    return recommendations;
  }

  /**
   * Generate executive summary
   * @param {Object} analysis - Analysis results
   * @param {number} score - Overall score
   * @returns {string} Executive summary
   */
  _generateExecutiveSummary(analysis, score) {
    const contactChannels = this._countContactChannels(analysis);
    const grade = this._assignGrade(score);
    
    let summary = `Contact Information Analysis (Grade: ${grade}, Score: ${score}/100)\n\n`;
    
    summary += `Overall Assessment: `;
    if (score >= 80) {
      summary += `Excellent contact information setup with ${contactChannels} accessible contact channels. `;
    } else if (score >= 60) {
      summary += `Good contact information with ${contactChannels} contact channels, but some improvements needed. `;
    } else if (score >= 40) {
      summary += `Basic contact information present with ${contactChannels} channels, requires enhancement. `;
    } else {
      summary += `Limited contact information available with only ${contactChannels} channels, needs significant improvement. `;
    }
    
    // Contact forms summary
    if (analysis.contactForms.forms.length > 0) {
      summary += `Found ${analysis.contactForms.forms.length} contact form(s) with ${Math.round(analysis.contactForms.averageQuality * 100)}% average quality. `;
    } else {
      summary += `No contact forms detected. `;
    }
    
    // Phone numbers summary
    if (analysis.phoneNumbers.phoneElements.length > 0) {
      summary += `${analysis.phoneNumbers.phoneElements.length} phone number(s) found, ${analysis.phoneNumbers.clickableCount} clickable. `;
    }
    
    // Email addresses summary
    if (analysis.emailAddresses.emailElements.length > 0) {
      summary += `${analysis.emailAddresses.emailElements.length} email address(es) found, ${analysis.emailAddresses.protectedCount} protected. `;
    }
    
    // Social media summary
    if (analysis.socialMedia.platforms.length > 0) {
      summary += `Present on ${analysis.socialMedia.platforms.length} social platform(s). `;
    }
    
    // Support channels summary
    if (analysis.supportChannels.hasLiveChat || analysis.supportChannels.hasFAQ || analysis.supportChannels.hasKnowledgeBase) {
      summary += `Additional support channels available including ${[
        analysis.supportChannels.hasLiveChat && 'live chat',
        analysis.supportChannels.hasFAQ && 'FAQ',
        analysis.supportChannels.hasKnowledgeBase && 'knowledge base'
      ].filter(Boolean).join(', ')}. `;
    }
    
    return summary.trim();
  }

  /**
   * Assign letter grade based on score
   * @param {number} score - Numerical score
   * @returns {string} Letter grade
   */
  _assignGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Count total contact channels
   * @param {Object} analysis - Analysis results
   * @returns {number} Number of contact channels
   */
  _countContactChannels(analysis) {
    let channels = 0;
    
    if (analysis.contactForms?.forms?.length > 0) channels++;
    if (analysis.phoneNumbers?.phoneElements?.length > 0) channels++;
    if (analysis.emailAddresses?.emailElements?.length > 0) channels++;
    if (analysis.physicalAddress?.addresses?.length > 0) channels++;
    if (analysis.socialMedia?.platforms?.length > 0) channels++;
    if (analysis.supportChannels?.hasLiveChat) channels++;
    if (analysis.supportChannels?.hasFAQ) channels++;
    if (analysis.supportChannels?.hasKnowledgeBase) channels++;
    
    return channels;
  }
}
