/**
 * ============================================================================
 * SUPPORT ANALYZER MODULE
 * ============================================================================
 *
 * Analyzes customer support accessibility and quality including:
 * - Support channel availability
 * - Response time expectations
 * - Help documentation
 * - FAQ sections
 * - Live chat functionality
 * - Contact methods for support
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

export class SupportAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableChatAnalysis: options.enableChatAnalysis !== false,
      enableFAQAnalysis: options.enableFAQAnalysis !== false,
      enableDocumentationAnalysis: options.enableDocumentationAnalysis !== false,
      enableResponseTimeAnalysis: options.enableResponseTimeAnalysis !== false,
      ...options,
    };

    this.supportSelectors = {
      chat: [
        '.chat-widget', '.live-chat', '.chat-button', '.support-chat',
        '.help-chat', '.chat-popup', '.webchat', '.livechat',
        '[class*="chat"]', '[id*="chat"]', '[class*="intercom"]',
        '[class*="zendesk"]', '[class*="freshchat"]', '[class*="drift"]',
        '[class*="crisp"]', '[class*="helpdesk"]'
      ],
      faq: [
        '.faq', '.faqs', '.frequently-asked', '.questions',
        '.help-section', '.support-faq', '.common-questions',
        '[class*="faq"]', '[id*="faq"]', 'a[href*="faq" i]'
      ],
      documentation: [
        '.documentation', '.docs', '.help-docs', '.user-guide',
        '.manual', '.knowledge-base', '.help-center',
        '[class*="docs"]', '[class*="documentation"]', '[class*="knowledge"]',
        'a[href*="docs" i]', 'a[href*="help" i]', 'a[href*="support" i]'
      ],
      support: [
        '.support', '.customer-support', '.help', '.assistance',
        '.contact-support', '.get-help', '.support-center',
        '[class*="support"]', '[class*="help"]', 'a[href*="support" i]'
      ],
      ticketing: [
        '.ticket', '.helpdesk', '.support-ticket', '.issue-tracker',
        '[class*="ticket"]', '[class*="helpdesk"]'
      ],
    };

    this.chatProviders = [
      'intercom', 'zendesk', 'freshchat', 'drift', 'crisp',
      'livechat', 'tawk', 'olark', 'userlike', 'smartsupp'
    ];

    this.responseTimeKeywords = [
      'response time', 'reply within', 'respond in', 'answer within',
      'response within', '24 hours', '48 hours', 'same day',
      'immediate', 'instant', 'real-time', 'live support'
    ];

    this.supportChannelKeywords = {
      phone: ['phone', 'call', 'telephone', 'tel:', 'hotline'],
      email: ['email', 'mailto:', 'contact@', 'support@'],
      chat: ['chat', 'live chat', 'webchat', 'message'],
      ticket: ['ticket', 'issue', 'report', 'submit'],
      social: ['facebook', 'twitter', 'instagram', 'linkedin'],
    };
  }

  /**
   * Analyze customer support features and accessibility
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Support analysis results
   */
  analyze(document, url) {
    const liveChatAnalysis = this._analyzeLiveChat(document);
    const faqAnalysis = this._analyzeFAQ(document);
    const documentationAnalysis = this._analyzeDocumentation(document);
    const supportChannels = this._analyzeSupportChannels(document);
    const responseTimeInfo = this._analyzeResponseTime(document);
    const helpAccessibility = this._analyzeHelpAccessibility(document);
    const supportQuality = this._analyzeSupportQuality(document);

    const score = this._calculateSupportScore({
      liveChatAnalysis,
      faqAnalysis,
      documentationAnalysis,
      supportChannels,
      responseTimeInfo,
      helpAccessibility,
      supportQuality,
    });

    return {
      liveChatAnalysis,
      faqAnalysis,
      documentationAnalysis,
      supportChannels,
      responseTimeInfo,
      helpAccessibility,
      supportQuality,
      score,
      grade: this._assignGrade(score),
      availableChannels: this._countAvailableChannels({
        liveChatAnalysis,
        supportChannels,
      }),
      strengths: this._identifySupportStrengths({
        liveChatAnalysis,
        faqAnalysis,
        documentationAnalysis,
        supportChannels,
        responseTimeInfo,
        helpAccessibility,
      }),
      recommendations: this._generateSupportRecommendations({
        liveChatAnalysis,
        faqAnalysis,
        documentationAnalysis,
        supportChannels,
        responseTimeInfo,
        helpAccessibility,
      }),
    };
  }

  /**
   * Analyze live chat functionality
   */
  _analyzeLiveChat(document) {
    const chatElements = [];
    const chatProviders = [];

    // Find chat widgets and elements
    this.supportSelectors.chat.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        chatElements.push({
          selector,
          element,
          visible: this._isElementVisible(element),
          interactive: this._isElementInteractive(element),
          text: element.textContent.trim().substring(0, 100),
        });
      });
    });

    // Identify chat providers
    this.chatProviders.forEach((provider) => {
      const providerElements = document.querySelectorAll(`[class*="${provider}"], [id*="${provider}"]`);
      const providerScripts = document.querySelectorAll(`script[src*="${provider}"]`);
      const providerText = document.body.textContent.toLowerCase().includes(provider);

      if (providerElements.length > 0 || providerScripts.length > 0 || providerText) {
        chatProviders.push({
          provider,
          elements: providerElements.length,
          scripts: providerScripts.length,
          confidence: this._calculateProviderConfidence(providerElements, providerScripts, providerText),
        });
      }
    });

    // Check for chat functionality
    const hasChatButton = chatElements.some(e => 
      e.text.toLowerCase().includes('chat') || 
      e.text.toLowerCase().includes('message') ||
      e.element.tagName === 'BUTTON'
    );

    const hasLiveSupport = document.body.textContent.toLowerCase().includes('live support') ||
                          document.body.textContent.toLowerCase().includes('live chat');

    return {
      chatElements,
      chatProviders,
      elementCount: chatElements.length,
      providerCount: chatProviders.length,
      hasChatWidget: chatElements.length > 0,
      hasChatButton,
      hasLiveSupport,
      isVisible: chatElements.some(e => e.visible),
      isInteractive: chatElements.some(e => e.interactive),
      score: this._calculateChatScore(chatElements, chatProviders, hasChatButton, hasLiveSupport),
    };
  }

  /**
   * Analyze FAQ sections
   */
  _analyzeFAQ(document) {
    const faqSections = [];
    const faqQuestions = [];

    // Find FAQ sections
    this.supportSelectors.faq.forEach((selector) => {
      const sections = document.querySelectorAll(selector);
      sections.forEach((section) => {
        const questions = this._extractFAQQuestions(section);
        faqSections.push({
          selector,
          section,
          questionCount: questions.length,
          wordCount: this._countWords(section.textContent),
          hasStructure: this._hasFAQStructure(section),
          questions,
        });
        faqQuestions.push(...questions);
      });
    });

    // Look for FAQ patterns in content
    const faqPatterns = this._findFAQPatterns(document);
    faqQuestions.push(...faqPatterns);

    return {
      faqSections,
      faqQuestions,
      sectionCount: faqSections.length,
      questionCount: faqQuestions.length,
      hasFAQSection: faqSections.length > 0,
      hasStructuredFAQ: faqSections.some(s => s.hasStructure),
      averageQuestionsPerSection: faqSections.length > 0 
        ? faqSections.reduce((sum, s) => sum + s.questionCount, 0) / faqSections.length 
        : 0,
      score: this._calculateFAQScore(faqSections, faqQuestions),
    };
  }

  /**
   * Analyze help documentation
   */
  _analyzeDocumentation(document) {
    const documentationLinks = [];
    const documentationSections = [];

    // Find documentation links
    this.supportSelectors.documentation.forEach((selector) => {
      if (selector.startsWith('a[')) {
        const links = document.querySelectorAll(selector);
        links.forEach((link) => {
          documentationLinks.push({
            href: link.href,
            text: link.textContent.trim(),
            type: this._classifyDocumentationType(link),
          });
        });
      } else {
        const sections = document.querySelectorAll(selector);
        sections.forEach((section) => {
          documentationSections.push({
            selector,
            wordCount: this._countWords(section.textContent),
            hasImages: section.querySelectorAll('img').length > 0,
            hasVideos: section.querySelectorAll('video').length > 0,
            structure: this._analyzeDocumentationStructure(section),
          });
        });
      }
    });

    // Look for help content indicators
    const helpIndicators = this._findHelpIndicators(document);

    return {
      documentationLinks,
      documentationSections,
      helpIndicators,
      linkCount: documentationLinks.length,
      sectionCount: documentationSections.length,
      hasDocumentation: documentationLinks.length > 0 || documentationSections.length > 0,
      hasUserGuide: documentationLinks.some(l => l.type === 'user_guide'),
      hasKnowledgeBase: documentationLinks.some(l => l.type === 'knowledge_base'),
      hasVideoHelp: documentationSections.some(s => s.hasVideos),
      score: this._calculateDocumentationScore(documentationLinks, documentationSections, helpIndicators),
    };
  }

  /**
   * Analyze support channels
   */
  _analyzeSupportChannels(document) {
    const channels = {};
    const textContent = document.body.textContent.toLowerCase();

    // Analyze each support channel type
    Object.entries(this.supportChannelKeywords).forEach(([channelType, keywords]) => {
      const channelInfo = {
        available: false,
        mentions: 0,
        elements: [],
        keywords: [],
      };

      keywords.forEach((keyword) => {
        if (textContent.includes(keyword.toLowerCase())) {
          channelInfo.available = true;
          channelInfo.mentions++;
          channelInfo.keywords.push(keyword);
        }
      });

      // Find specific elements for each channel
      switch (channelType) {
        case 'phone':
          channelInfo.elements = Array.from(document.querySelectorAll('a[href^="tel:"]'));
          break;
        case 'email':
          channelInfo.elements = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
          break;
        case 'chat':
          channelInfo.elements = Array.from(document.querySelectorAll(this.supportSelectors.chat.join(', ')));
          break;
        case 'ticket':
          channelInfo.elements = Array.from(document.querySelectorAll(this.supportSelectors.ticketing.join(', ')));
          break;
        case 'social':
          channelInfo.elements = Array.from(document.querySelectorAll('a[href*="facebook"], a[href*="twitter"]'));
          break;
      }

      channels[channelType] = channelInfo;
    });

    const availableChannelCount = Object.values(channels).filter(c => c.available).length;

    return {
      channels,
      availableChannelCount,
      hasPhone: channels.phone.available,
      hasEmail: channels.email.available,
      hasChat: channels.chat.available,
      hasTicketing: channels.ticket.available,
      hasSocialSupport: channels.social.available,
      isMultiChannel: availableChannelCount > 2,
      score: this._calculateChannelScore(channels, availableChannelCount),
    };
  }

  /**
   * Analyze response time information
   */
  _analyzeResponseTime(document) {
    const textContent = document.body.textContent.toLowerCase();
    const responseTimeInfo = {
      mentioned: false,
      timeframes: [],
      hasGuarantee: false,
      isImmediate: false,
    };

    // Look for response time mentions
    this.responseTimeKeywords.forEach((keyword) => {
      if (textContent.includes(keyword.toLowerCase())) {
        responseTimeInfo.mentioned = true;
        responseTimeInfo.timeframes.push(keyword);
      }
    });

    // Look for specific time patterns
    const timePatterns = [
      /\b(\d+)\s*(hour|hr)s?\b/gi,
      /\b(\d+)\s*(day|business day)s?\b/gi,
      /\bwithin\s+(\d+)\s*(hour|day)s?\b/gi,
      /\b(same|next)\s+(day|business day)\b/gi,
    ];

    timePatterns.forEach((pattern) => {
      const matches = document.body.textContent.match(pattern) || [];
      responseTimeInfo.timeframes.push(...matches);
    });

    // Check for immediate/real-time support
    const immediateKeywords = ['immediate', 'instant', 'real-time', 'live', 'now'];
    responseTimeInfo.isImmediate = immediateKeywords.some(keyword => 
      textContent.includes(keyword)
    );

    // Check for guarantees
    const guaranteeKeywords = ['guarantee', 'guaranteed', 'promise', 'commit'];
    responseTimeInfo.hasGuarantee = guaranteeKeywords.some(keyword => 
      textContent.includes(keyword)
    );

    return {
      ...responseTimeInfo,
      score: this._calculateResponseTimeScore(responseTimeInfo),
    };
  }

  /**
   * Analyze help accessibility
   */
  _analyzeHelpAccessibility(document) {
    const supportLinks = document.querySelectorAll('a[href*="support" i], a[href*="help" i]');
    const helpSections = document.querySelectorAll(this.supportSelectors.support.join(', '));
    
    const headerSupport = document.querySelector('header a[href*="support" i], nav a[href*="help" i]');
    const footerSupport = document.querySelector('footer a[href*="support" i], footer a[href*="help" i]');
    const sidebarSupport = document.querySelector('aside a[href*="support" i], .sidebar a[href*="help" i]');

    const hasSearchFunction = this._hasSearchFunction(document);
    const hasContactForm = document.querySelector('form[action*="contact"], .contact-form') !== null;

    return {
      supportLinks: Array.from(supportLinks),
      helpSections: Array.from(helpSections),
      linkCount: supportLinks.length,
      sectionCount: helpSections.length,
      inHeader: !!headerSupport,
      inFooter: !!footerSupport,
      inSidebar: !!sidebarSupport,
      hasSearchFunction,
      hasContactForm,
      easyToFind: !!(headerSupport || footerSupport || helpSections.length > 0),
      score: this._calculateAccessibilityScore({
        linkCount: supportLinks.length,
        sectionCount: helpSections.length,
        inHeader: !!headerSupport,
        inFooter: !!footerSupport,
        hasSearchFunction,
        hasContactForm,
      }),
    };
  }

  /**
   * Analyze overall support quality
   */
  _analyzeSupportQuality(document) {
    const supportElements = document.querySelectorAll(this.supportSelectors.support.join(', '));
    let professionalismScore = 0;
    let comprehensivenessScore = 0;
    let clarityScore = 0;

    supportElements.forEach((element) => {
      professionalismScore += this._assessSupportProfessionalism(element.textContent);
      comprehensivenessScore += this._assessSupportComprehensiveness(element);
      clarityScore += this._assessSupportClarity(element.textContent);
    });

    const elementCount = supportElements.length || 1;

    return {
      professionalismScore: professionalismScore / elementCount,
      comprehensivenessScore: comprehensivenessScore / elementCount,
      clarityScore: clarityScore / elementCount,
      overallQuality: (professionalismScore + comprehensivenessScore + clarityScore) / (3 * elementCount),
      score: this._calculateQualityScore(professionalismScore, comprehensivenessScore, clarityScore, elementCount),
    };
  }

  // Helper methods
  _isElementVisible(element) {
    const style = window.getComputedStyle ? window.getComputedStyle(element) : element.style;
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  _isElementInteractive(element) {
    return element.tagName === 'BUTTON' || 
           element.tagName === 'A' || 
           element.onclick !== null ||
           element.getAttribute('role') === 'button';
  }

  _calculateProviderConfidence(elements, scripts, textMention) {
    let confidence = 0;
    if (elements.length > 0) confidence += 0.4;
    if (scripts.length > 0) confidence += 0.5;
    if (textMention) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  _extractFAQQuestions(section) {
    const questions = [];
    
    // Look for common FAQ patterns
    const questionSelectors = [
      'dt', '.question', '.faq-question', '.q', '[class*="question"]',
      'h3', 'h4', 'h5', 'h6'
    ];

    questionSelectors.forEach((selector) => {
      const elements = section.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent.trim();
        if (text.length > 10 && (text.includes('?') || text.toLowerCase().includes('how') || text.toLowerCase().includes('what'))) {
          questions.push({
            question: text,
            hasAnswer: this._hasAnswer(element),
          });
        }
      });
    });

    return questions;
  }

  _hasFAQStructure(section) {
    const hasQuestions = section.querySelectorAll('dt, .question, .faq-question').length > 0;
    const hasAnswers = section.querySelectorAll('dd, .answer, .faq-answer').length > 0;
    const hasHeadings = section.querySelectorAll('h3, h4, h5, h6').length > 2;
    
    return hasQuestions && hasAnswers || hasHeadings;
  }

  _findFAQPatterns(document) {
    const questions = [];
    const questionPatterns = [
      /\bQ:\s*(.+?)\?/gi,
      /\bQuestion:\s*(.+?)\?/gi,
      /\b(How|What|When|Where|Why|Can|Do|Is|Are)\s+.+?\?/gi,
    ];

    const textContent = document.body.textContent;
    questionPatterns.forEach((pattern) => {
      const matches = textContent.match(pattern) || [];
      questions.push(...matches.map(q => ({ question: q.trim(), type: 'pattern' })));
    });

    return questions;
  }

  _classifyDocumentationType(link) {
    const href = link.href.toLowerCase();
    const text = link.textContent.toLowerCase();
    
    if (href.includes('guide') || text.includes('guide')) return 'user_guide';
    if (href.includes('docs') || text.includes('documentation')) return 'documentation';
    if (href.includes('knowledge') || text.includes('knowledge')) return 'knowledge_base';
    if (href.includes('tutorial') || text.includes('tutorial')) return 'tutorial';
    if (href.includes('manual') || text.includes('manual')) return 'manual';
    
    return 'general';
  }

  _analyzeDocumentationStructure(section) {
    return {
      headingCount: section.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      paragraphCount: section.querySelectorAll('p').length,
      listCount: section.querySelectorAll('ul, ol').length,
      linkCount: section.querySelectorAll('a').length,
      imageCount: section.querySelectorAll('img').length,
      hasTableOfContents: section.querySelector('.toc, .table-of-contents, #toc') !== null,
    };
  }

  _findHelpIndicators(document) {
    const indicators = [];
    const helpKeywords = [
      'help center', 'support center', 'user guide', 'tutorial',
      'how to', 'getting started', 'troubleshooting', 'step by step'
    ];

    const textContent = document.body.textContent.toLowerCase();
    helpKeywords.forEach((keyword) => {
      if (textContent.includes(keyword)) {
        indicators.push(keyword);
      }
    });

    return indicators;
  }

  _hasSearchFunction(document) {
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i]');
    const searchForms = document.querySelectorAll('form[action*="search"], .search-form');
    const searchButtons = document.querySelectorAll('button[type="submit"]:has(~ input[type="search"])');
    
    return searchInputs.length > 0 || searchForms.length > 0 || searchButtons.length > 0;
  }

  _hasAnswer(questionElement) {
    const next = questionElement.nextElementSibling;
    if (!next) return false;
    
    const answerSelectors = ['dd', '.answer', '.faq-answer', 'p'];
    return answerSelectors.some(selector => next.matches(selector));
  }

  _countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  _assessSupportProfessionalism(text) {
    let score = 50; // Base score
    
    const professionalWords = ['assist', 'help', 'support', 'resolve', 'solution', 'service'];
    const professionalCount = professionalWords.filter(word => text.toLowerCase().includes(word)).length;
    score += professionalCount * 8;
    
    const unprofessionalWords = ['awesome', 'cool', 'super', 'totally'];
    const unprofessionalCount = unprofessionalWords.filter(word => text.toLowerCase().includes(word)).length;
    score -= unprofessionalCount * 10;
    
    return Math.max(0, Math.min(score, 100));
  }

  _assessSupportComprehensiveness(element) {
    let score = 0;
    
    if (element.querySelectorAll('a').length > 0) score += 20;
    if (element.querySelectorAll('ul, ol').length > 0) score += 25;
    if (element.textContent.length > 200) score += 25;
    if (element.querySelectorAll('img, video').length > 0) score += 15;
    if (element.querySelectorAll('h2, h3, h4').length > 0) score += 15;
    
    return Math.min(score, 100);
  }

  _assessSupportClarity(text) {
    let score = 50; // Base score
    
    // Check for clear language
    const clarityWords = ['simply', 'easily', 'step', 'first', 'next', 'then', 'finally'];
    const clarityCount = clarityWords.filter(word => text.toLowerCase().includes(word)).length;
    score += clarityCount * 5;
    
    // Check sentence length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length || 0;
    
    if (avgWordsPerSentence <= 20) score += 20;
    else if (avgWordsPerSentence <= 30) score += 10;
    
    return Math.max(0, Math.min(score, 100));
  }

  // Scoring methods
  _calculateChatScore(elements, providers, hasButton, hasLiveSupport) {
    let score = 0;
    
    if (elements.length > 0) score += 40;
    if (providers.length > 0) score += 30;
    if (hasButton) score += 15;
    if (hasLiveSupport) score += 15;
    
    return Math.min(score, 100);
  }

  _calculateFAQScore(sections, questions) {
    let score = 0;
    
    if (sections.length > 0) score += 40;
    score += Math.min(questions.length * 3, 30);
    if (sections.some(s => s.hasStructure)) score += 20;
    if (questions.length > 10) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateDocumentationScore(links, sections, indicators) {
    let score = 0;
    
    score += Math.min(links.length * 10, 40);
    score += Math.min(sections.length * 15, 30);
    score += Math.min(indicators.length * 5, 20);
    if (sections.some(s => s.hasVideos)) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateChannelScore(channels, availableCount) {
    let score = 0;
    
    score += Math.min(availableCount * 15, 75);
    if (channels.phone.available) score += 5;
    if (channels.email.available) score += 5;
    if (channels.chat.available) score += 10;
    if (channels.ticket.available) score += 5;
    
    return Math.min(score, 100);
  }

  _calculateResponseTimeScore(responseInfo) {
    let score = 0;
    
    if (responseInfo.mentioned) score += 40;
    if (responseInfo.isImmediate) score += 30;
    if (responseInfo.hasGuarantee) score += 20;
    if (responseInfo.timeframes.length > 1) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateAccessibilityScore(accessibility) {
    let score = 0;
    
    score += Math.min(accessibility.linkCount * 10, 30);
    score += Math.min(accessibility.sectionCount * 15, 30);
    if (accessibility.inHeader) score += 15;
    if (accessibility.inFooter) score += 10;
    if (accessibility.hasSearchFunction) score += 10;
    if (accessibility.hasContactForm) score += 5;
    
    return Math.min(score, 100);
  }

  _calculateQualityScore(professionalism, comprehensiveness, clarity, elementCount) {
    if (elementCount === 0) return 0;
    
    return Math.round((professionalism + comprehensiveness + clarity) / (3 * elementCount));
  }

  _calculateSupportScore(analysis) {
    const weights = {
      liveChatAnalysis: 0.20,
      faqAnalysis: 0.15,
      documentationAnalysis: 0.15,
      supportChannels: 0.20,
      responseTimeInfo: 0.10,
      helpAccessibility: 0.15,
      supportQuality: 0.05,
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

  _countAvailableChannels(analysis) {
    let channels = 0;
    
    if (analysis.liveChatAnalysis.hasChatWidget) channels++;
    if (analysis.supportChannels.hasPhone) channels++;
    if (analysis.supportChannels.hasEmail) channels++;
    if (analysis.supportChannels.hasTicketing) channels++;
    if (analysis.supportChannels.hasSocialSupport) channels++;
    
    return channels;
  }

  _assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _identifySupportStrengths(analysis) {
    const strengths = [];
    
    if (analysis.liveChatAnalysis.hasChatWidget) strengths.push('Live chat support available');
    if (analysis.faqAnalysis.hasStructuredFAQ) strengths.push('Well-structured FAQ section');
    if (analysis.documentationAnalysis.hasKnowledgeBase) strengths.push('Knowledge base available');
    if (analysis.supportChannels.isMultiChannel) strengths.push('Multiple support channels available');
    if (analysis.responseTimeInfo.isImmediate) strengths.push('Immediate response support');
    if (analysis.helpAccessibility.easyToFind) strengths.push('Help information easily accessible');
    
    return strengths;
  }

  _generateSupportRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.liveChatAnalysis.hasChatWidget) {
      recommendations.push({
        category: 'Live Chat',
        priority: 'medium',
        title: 'Add Live Chat Support',
        description: 'Implement live chat for immediate customer assistance.',
        impact: 'high',
      });
    }
    
    if (!analysis.faqAnalysis.hasFAQSection) {
      recommendations.push({
        category: 'FAQ',
        priority: 'high',
        title: 'Create FAQ Section',
        description: 'Add frequently asked questions to reduce support burden.',
        impact: 'medium',
      });
    }
    
    if (!analysis.documentationAnalysis.hasDocumentation) {
      recommendations.push({
        category: 'Documentation',
        priority: 'medium',
        title: 'Add Help Documentation',
        description: 'Create user guides and help documentation.',
        impact: 'medium',
      });
    }
    
    if (!analysis.responseTimeInfo.mentioned) {
      recommendations.push({
        category: 'Response Time',
        priority: 'low',
        title: 'Communicate Response Times',
        description: 'Clearly state expected response times for support requests.',
        impact: 'low',
      });
    }
    
    if (!analysis.helpAccessibility.inHeader) {
      recommendations.push({
        category: 'Accessibility',
        priority: 'medium',
        title: 'Add Support Link to Navigation',
        description: 'Include support or help link in main navigation.',
        impact: 'medium',
      });
    }
    
    return recommendations;
  }
}
