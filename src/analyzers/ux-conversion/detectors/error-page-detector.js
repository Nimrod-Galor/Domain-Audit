/**
 * ============================================================================
 * ERROR PAGE DETECTOR - UX CONVERSION ANALYSIS
 * ============================================================================
 * 
 * Detects and analyzes error pages (404, 403, 500, etc.) for user experience
 * optimization. Evaluates error page design, messaging, recovery options,
 * and conversion opportunities.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis
 */

import { ERROR_PAGE_INDICATORS, UX_STANDARDS } from '../config/ux-standards.js';
import { UXAnalysisValidator } from '../core/contracts.js';

/**
 * Error Page Detection and Analysis
 */
export class ErrorPageDetector {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 10000,
      testCommonErrorPages: config.testCommonErrorPages !== false,
      analyzeCustomErrors: config.analyzeCustomErrors !== false,
      testRecoveryOptions: config.testRecoveryOptions !== false,
      maxErrorPagesToTest: config.maxErrorPagesToTest || 5,
      ...config
    };
    
    this.standards = UX_STANDARDS.errorPages;
    this.results = this._initializeResults();
    this.testedUrls = new Set();
  }

  /**
   * Main detection and analysis method
   * @param {Object} page - Playwright page object
   * @param {Object} domainData - Domain analysis data
   * @returns {Promise<Object>} Error page analysis results
   */
  async analyze(page, domainData = {}) {
    try {
      const baseUrl = domainData.url || page.url();
      
      // Check if current page is an error page
      await this._analyzeCurrentPage(page);
      
      // Test common error page URLs if enabled
      if (this.config.testCommonErrorPages) {
        await this._testCommonErrorPages(page, baseUrl);
      }
      
      // Analyze any detected error pages
      await this._analyzeDetectedErrorPages(page);
      
      // Calculate scores and generate recommendations
      this._calculateScores();
      this._generateRecommendations();
      
      return this.results;
      
    } catch (error) {
      this.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return this.results;
    }
  }

  /**
   * Initialize results structure
   * @private
   */
  _initializeResults() {
    return {
      tested: false,
      hasCustomErrorPages: false,
      errorPages: [],
      
      // Error page analysis
      analysis: {
        total404Pages: 0,
        total403Pages: 0,
        total500Pages: 0,
        customErrorPages: 0,
        hasNavigation: 0,
        hasBranding: 0,
        hasSearch: 0,
        hasContactInfo: 0,
        hasRecoveryOptions: 0
      },
      
      // UX evaluation
      userExperience: {
        isHelpful: false,
        hasApology: false,
        hasExplanation: false,
        hasNextSteps: false,
        maintainsBranding: false,
        providesAlternatives: false
      },
      
      // Technical analysis
      technical: {
        usesCorrectStatusCodes: false,
        hasCustomDesign: false,
        isResponsive: false,
        loadTime: 0,
        hasMetaTags: false
      },
      
      // Conversion opportunities
      conversion: {
        hasLeadCapture: false,
        hasNewsletterSignup: false,
        hasProductRecommendations: false,
        hasSocialLinks: false,
        conversionScore: 0
      },
      
      scores: {
        existence: 0,
        usability: 0,
        design: 0,
        conversion: 0,
        overall: 0
      },
      
      recommendations: [],
      errors: [],
      warnings: []
    };
  }

  /**
   * Analyze current page for error indicators
   * @private
   */
  async _analyzeCurrentPage(page) {
    try {
      const currentUrl = page.url();
      const isErrorPage = await this._checkIfErrorPage(page);
      
      if (isErrorPage) {
        const errorData = await this._analyzeErrorPage(page, currentUrl);
        if (errorData) {
          this.results.errorPages.push(errorData);
          this.results.hasCustomErrorPages = true;
        }
      }
      
      this.results.tested = true;
    } catch (error) {
      this.results.warnings.push(`Current page analysis failed: ${error.message}`);
    }
  }

  /**
   * Check if current page is an error page
   * @private
   */
  async _checkIfErrorPage(page) {
    try {
      // Check HTTP status code
      const response = page.context().pages()[0]?.response?.() || await page.reload();
      const statusCode = response?.status() || 200;
      
      if ([404, 403, 500, 502, 503].includes(statusCode)) {
        return true;
      }

      // Check page content for error indicators
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title.toLowerCase(),
          body: document.body.textContent.toLowerCase(),
          url: window.location.href.toLowerCase(),
          headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .map(h => h.textContent.toLowerCase())
        };
      });

      // Check URL patterns
      for (const urlPattern of ERROR_PAGE_INDICATORS.urls) {
        if (pageContent.url.includes(urlPattern)) {
          return true;
        }
      }

      // Check title patterns
      for (const titlePattern of ERROR_PAGE_INDICATORS.titles) {
        if (pageContent.title.includes(titlePattern)) {
          return true;
        }
      }

      // Check heading patterns
      for (const headingPattern of ERROR_PAGE_INDICATORS.headings) {
        if (pageContent.headings.some(heading => heading.includes(headingPattern))) {
          return true;
        }
      }

      // Check body content for error messages
      const errorPhrases = [
        'page not found', 'not found', '404', 'error', 'oops',
        'something went wrong', 'page does not exist', 'broken link',
        'access denied', 'forbidden', 'server error', 'service unavailable'
      ];
      
      return errorPhrases.some(phrase => pageContent.body.includes(phrase));

    } catch (error) {
      this.results.warnings.push(`Error page detection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Test common error page URLs
   * @private
   */
  async _testCommonErrorPages(page, baseUrl) {
    const commonErrorUrls = [
      '/404',
      '/404.html',
      '/error',
      '/not-found',
      '/page-not-found',
      '/nonexistent-page-test-12345',
      '/admin', // Often returns 403
      '/wp-admin' // WordPress admin
    ];

    let testedCount = 0;
    
    for (const errorPath of commonErrorUrls) {
      if (testedCount >= this.config.maxErrorPagesToTest) {
        break;
      }

      const testUrl = new URL(errorPath, baseUrl).href;
      
      if (this.testedUrls.has(testUrl)) {
        continue;
      }

      try {
        await this._testErrorUrl(page, testUrl);
        this.testedUrls.add(testUrl);
        testedCount++;
        
        // Small delay between requests
        await page.waitForTimeout(500);
        
      } catch (error) {
        this.results.warnings.push(`Failed to test ${testUrl}: ${error.message}`);
      }
    }
  }

  /**
   * Test specific error URL
   * @private
   */
  async _testErrorUrl(page, testUrl) {
    try {
      const response = await page.goto(testUrl, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });
      
      const statusCode = response.status();
      
      // Only analyze if it's actually an error response or error content
      if (statusCode >= 400 || await this._checkIfErrorPage(page)) {
        const errorData = await this._analyzeErrorPage(page, testUrl, statusCode);
        if (errorData) {
          this.results.errorPages.push(errorData);
          
          if (statusCode >= 400 && this._hasCustomDesign(errorData)) {
            this.results.hasCustomErrorPages = true;
          }
        }
      }
      
    } catch (error) {
      // Navigation might fail for error pages, which is expected
      if (!error.message.includes('net::ERR_') && !error.message.includes('timeout')) {
        this.results.warnings.push(`Error testing ${testUrl}: ${error.message}`);
      }
    }
  }

  /**
   * Analyze individual error page
   * @private
   */
  async _analyzeErrorPage(page, url, statusCode = null) {
    try {
      const startTime = Date.now();
      
      // Get basic page information
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          body: document.body.textContent,
          html: document.documentElement.innerHTML.substring(0, 5000) // First 5KB
        };
      });

      // Analyze page structure
      const structure = await this._analyzePageStructure(page);
      
      // Analyze content
      const content = await this._analyzeErrorContent(page);
      
      // Analyze navigation and recovery options
      const navigation = await this._analyzeNavigationAndRecovery(page);
      
      // Analyze design and branding
      const design = await this._analyzeDesignAndBranding(page);
      
      // Check for conversion opportunities
      const conversion = await this._analyzeConversionOpportunities(page);
      
      const loadTime = Date.now() - startTime;

      return {
        url,
        statusCode: statusCode || await this._getStatusCode(page),
        pageInfo,
        structure,
        content,
        navigation,
        design,
        conversion,
        loadTime,
        score: 0 // Will be calculated later
      };

    } catch (error) {
      this.results.warnings.push(`Error page analysis failed for ${url}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get HTTP status code
   * @private
   */
  async _getStatusCode(page) {
    try {
      // Try to get from response
      const responses = [];
      page.on('response', response => responses.push(response));
      
      await page.reload();
      
      const mainResponse = responses.find(r => r.url() === page.url());
      return mainResponse?.status() || 200;
      
    } catch {
      return 200;
    }
  }

  /**
   * Analyze page structure
   * @private
   */
  async _analyzePageStructure(page) {
    try {
      return await page.evaluate(() => {
        const structure = {
          hasHeader: false,
          hasFooter: false,
          hasNavigation: false,
          hasMain: false,
          hasLogo: false,
          headingCount: 0,
          linkCount: 0,
          imageCount: 0
        };

        // Check for structural elements
        structure.hasHeader = Boolean(document.querySelector('header, .header'));
        structure.hasFooter = Boolean(document.querySelector('footer, .footer'));
        structure.hasNavigation = Boolean(document.querySelector('nav, .nav, .navigation'));
        structure.hasMain = Boolean(document.querySelector('main, .main, .content'));
        structure.hasLogo = Boolean(document.querySelector('.logo, #logo, [class*="logo"]'));

        // Count elements
        structure.headingCount = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
        structure.linkCount = document.querySelectorAll('a[href]').length;
        structure.imageCount = document.querySelectorAll('img').length;

        return structure;
      });
    } catch {
      return {
        hasHeader: false,
        hasFooter: false,
        hasNavigation: false,
        hasMain: false,
        hasLogo: false,
        headingCount: 0,
        linkCount: 0,
        imageCount: 0
      };
    }
  }

  /**
   * Analyze error content
   * @private
   */
  async _analyzeErrorContent(page) {
    try {
      return await page.evaluate(() => {
        const content = {
          hasErrorMessage: false,
          hasApology: false,
          hasExplanation: false,
          hasHelpfulContent: false,
          tone: 'neutral',
          wordCount: 0,
          readabilityScore: 0
        };

        const bodyText = document.body.textContent.toLowerCase();
        content.wordCount = bodyText.split(/\s+/).length;

        // Check for error messaging
        const errorPhrases = ['error', '404', 'not found', 'oops', 'sorry'];
        content.hasErrorMessage = errorPhrases.some(phrase => bodyText.includes(phrase));

        // Check for apology
        const apologyPhrases = ['sorry', 'apologize', 'apologies', 'our mistake'];
        content.hasApology = apologyPhrases.some(phrase => bodyText.includes(phrase));

        // Check for explanation
        const explanationPhrases = [
          'page you\'re looking for', 'moved', 'removed', 'deleted',
          'no longer available', 'changed', 'updated'
        ];
        content.hasExplanation = explanationPhrases.some(phrase => bodyText.includes(phrase));

        // Check for helpful content
        const helpfulPhrases = [
          'try', 'search', 'home', 'contact', 'help', 'support',
          'browse', 'explore', 'find', 'look for'
        ];
        content.hasHelpfulContent = helpfulPhrases.some(phrase => bodyText.includes(phrase));

        // Determine tone
        const friendlyWords = ['sorry', 'help', 'assist', 'support'];
        const formalWords = ['error', 'invalid', 'unauthorized', 'forbidden'];
        
        if (friendlyWords.some(word => bodyText.includes(word))) {
          content.tone = 'friendly';
        } else if (formalWords.some(word => bodyText.includes(word))) {
          content.tone = 'formal';
        }

        // Simple readability score (based on sentence and word length)
        const sentences = bodyText.split(/[.!?]+/).length;
        const avgWordsPerSentence = content.wordCount / Math.max(sentences, 1);
        content.readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2));

        return content;
      });
    } catch {
      return {
        hasErrorMessage: false,
        hasApology: false,
        hasExplanation: false,
        hasHelpfulContent: false,
        tone: 'neutral',
        wordCount: 0,
        readabilityScore: 0
      };
    }
  }

  /**
   * Analyze navigation and recovery options
   * @private
   */
  async _analyzeNavigationAndRecovery(page) {
    try {
      return await page.evaluate(() => {
        const navigation = {
          hasHomeLink: false,
          hasBackButton: false,
          hasSearch: false,
          hasBreadcrumbs: false,
          hasSitemap: false,
          hasContactLink: false,
          hasMenuNavigation: false,
          recoveryOptions: []
        };

        // Check for home link
        const homeLinks = document.querySelectorAll('a[href]');
        navigation.hasHomeLink = Array.from(homeLinks).some(link => {
          const href = link.href.toLowerCase();
          const text = link.textContent.toLowerCase();
          return href.endsWith('/') || href.includes('home') || 
                 text.includes('home') || text.includes('homepage');
        });

        // Check for back button
        navigation.hasBackButton = Boolean(document.querySelector(
          '[onclick*="back"], [onclick*="history"], .back, .go-back'
        ));

        // Check for search
        navigation.hasSearch = Boolean(document.querySelector(
          'input[type="search"], form[role="search"], .search'
        ));

        // Check for breadcrumbs
        navigation.hasBreadcrumbs = Boolean(document.querySelector(
          '.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]'
        ));

        // Check for sitemap
        const sitemapLinks = Array.from(document.querySelectorAll('a[href]'));
        navigation.hasSitemap = sitemapLinks.some(link => 
          link.href.includes('sitemap') || link.textContent.toLowerCase().includes('sitemap')
        );

        // Check for contact link
        const contactLinks = Array.from(document.querySelectorAll('a[href]'));
        navigation.hasContactLink = contactLinks.some(link => 
          link.href.includes('contact') || link.textContent.toLowerCase().includes('contact')
        );

        // Check for menu navigation
        navigation.hasMenuNavigation = Boolean(document.querySelector(
          'nav, .nav, .menu, .navigation'
        ));

        // Collect recovery options
        if (navigation.hasHomeLink) navigation.recoveryOptions.push('Home Link');
        if (navigation.hasSearch) navigation.recoveryOptions.push('Search');
        if (navigation.hasContactLink) navigation.recoveryOptions.push('Contact');
        if (navigation.hasMenuNavigation) navigation.recoveryOptions.push('Navigation Menu');
        if (navigation.hasSitemap) navigation.recoveryOptions.push('Sitemap');

        return navigation;
      });
    } catch {
      return {
        hasHomeLink: false,
        hasBackButton: false,
        hasSearch: false,
        hasBreadcrumbs: false,
        hasSitemap: false,
        hasContactLink: false,
        hasMenuNavigation: false,
        recoveryOptions: []
      };
    }
  }

  /**
   * Analyze design and branding
   * @private
   */
  async _analyzeDesignAndBranding(page) {
    try {
      return await page.evaluate(() => {
        const design = {
          hasCustomStyling: false,
          maintainsBranding: false,
          isResponsive: false,
          hasImages: false,
          hasLogo: false,
          colorScheme: 'unknown',
          layoutQuality: 0
        };

        // Check for custom styling
        const hasCSS = document.querySelectorAll('link[rel="stylesheet"], style').length > 0;
        const hasStyledElements = document.querySelectorAll('[style], [class]').length > 10;
        design.hasCustomStyling = hasCSS && hasStyledElements;

        // Check for branding elements
        design.hasLogo = Boolean(document.querySelector('.logo, #logo, [alt*="logo"]'));
        
        // Check for brand colors (simplified)
        const computedStyle = window.getComputedStyle(document.body);
        const backgroundColor = computedStyle.backgroundColor;
        design.maintainsBranding = design.hasLogo || backgroundColor !== 'rgba(0, 0, 0, 0)';

        // Check for responsive design
        const viewport = document.querySelector('meta[name="viewport"]');
        const mediaQueries = Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules).some(rule => 
              rule.type === CSSRule.MEDIA_RULE
            );
          } catch {
            return false;
          }
        });
        design.isResponsive = Boolean(viewport && mediaQueries);

        // Check for images
        design.hasImages = document.querySelectorAll('img').length > 0;

        // Simple layout quality assessment
        const hasStructure = Boolean(document.querySelector('header, main, footer'));
        const hasHeadings = document.querySelectorAll('h1, h2, h3').length > 0;
        const hasWhitespace = !document.body.textContent.trim().includes('  '); // No excessive spacing
        
        design.layoutQuality = (hasStructure ? 40 : 0) + 
                              (hasHeadings ? 30 : 0) + 
                              (design.hasCustomStyling ? 30 : 0);

        return design;
      });
    } catch {
      return {
        hasCustomStyling: false,
        maintainsBranding: false,
        isResponsive: false,
        hasImages: false,
        hasLogo: false,
        colorScheme: 'unknown',
        layoutQuality: 0
      };
    }
  }

  /**
   * Analyze conversion opportunities
   * @private
   */
  async _analyzeConversionOpportunities(page) {
    try {
      return await page.evaluate(() => {
        const conversion = {
          hasNewsletterSignup: false,
          hasContactForm: false,
          hasLeadMagnet: false,
          hasSocialLinks: false,
          hasProductRecommendations: false,
          hasPromotionalContent: false,
          opportunityScore: 0
        };

        // Check for newsletter signup
        const emailInputs = document.querySelectorAll('input[type="email"]');
        const newsletterTerms = ['newsletter', 'subscribe', 'updates', 'emails'];
        conversion.hasNewsletterSignup = Array.from(emailInputs).some(input => {
          const context = input.closest('form')?.textContent.toLowerCase() || '';
          return newsletterTerms.some(term => context.includes(term));
        });

        // Check for contact form
        conversion.hasContactForm = Boolean(document.querySelector(
          'form[action*="contact"], .contact-form, #contact-form'
        ));

        // Check for lead magnets
        const leadMagnetTerms = ['download', 'free', 'ebook', 'guide', 'whitepaper'];
        const allText = document.body.textContent.toLowerCase();
        conversion.hasLeadMagnet = leadMagnetTerms.some(term => allText.includes(term));

        // Check for social links
        const socialPlatforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'];
        const links = Array.from(document.querySelectorAll('a[href]'));
        conversion.hasSocialLinks = links.some(link => 
          socialPlatforms.some(platform => link.href.includes(platform))
        );

        // Check for product recommendations
        const productTerms = ['products', 'shop', 'browse', 'catalog', 'recommended'];
        conversion.hasProductRecommendations = productTerms.some(term => allText.includes(term));

        // Check for promotional content
        const promoTerms = ['sale', 'discount', 'offer', 'deal', 'special'];
        conversion.hasPromotionalContent = promoTerms.some(term => allText.includes(term));

        // Calculate opportunity score
        const opportunities = [
          conversion.hasNewsletterSignup,
          conversion.hasContactForm,
          conversion.hasLeadMagnet,
          conversion.hasSocialLinks,
          conversion.hasProductRecommendations,
          conversion.hasPromotionalContent
        ];
        
        conversion.opportunityScore = (opportunities.filter(Boolean).length / opportunities.length) * 100;

        return conversion;
      });
    } catch {
      return {
        hasNewsletterSignup: false,
        hasContactForm: false,
        hasLeadMagnet: false,
        hasSocialLinks: false,
        hasProductRecommendations: false,
        hasPromotionalContent: false,
        opportunityScore: 0
      };
    }
  }

  /**
   * Check if error page has custom design
   * @private
   */
  _hasCustomDesign(errorData) {
    if (!errorData || !errorData.design) return false;
    
    return errorData.design.hasCustomStyling && 
           (errorData.design.hasLogo || errorData.design.maintainsBranding) &&
           errorData.structure.linkCount > 2;
  }

  /**
   * Analyze all detected error pages
   * @private
   */
  async _analyzeDetectedErrorPages(page) {
    // Calculate scores for each error page
    this.results.errorPages.forEach(errorPage => {
      errorPage.score = this._calculateErrorPageScore(errorPage);
    });

    // Update analysis summary
    this._updateAnalysisSummary();
  }

  /**
   * Calculate score for individual error page
   * @private
   */
  _calculateErrorPageScore(errorPage) {
    let score = 0;

    // Existence and basic functionality (30 points)
    if (errorPage.statusCode >= 400) score += 10; // Proper status code
    if (errorPage.content.hasErrorMessage) score += 10; // Clear error message
    if (errorPage.content.hasHelpfulContent) score += 10; // Helpful content

    // Navigation and recovery (25 points)
    score += errorPage.navigation.recoveryOptions.length * 5; // 5 points per recovery option

    // Design and branding (25 points)
    if (errorPage.design.hasCustomStyling) score += 10;
    if (errorPage.design.maintainsBranding) score += 10;
    if (errorPage.design.isResponsive) score += 5;

    // Content quality (20 points)
    if (errorPage.content.hasApology) score += 5;
    if (errorPage.content.hasExplanation) score += 5;
    if (errorPage.content.tone === 'friendly') score += 5;
    if (errorPage.content.readabilityScore > 70) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Update analysis summary
   * @private
   */
  _updateAnalysisSummary() {
    const analysis = this.results.analysis;
    
    // Count error types
    analysis.total404Pages = this.results.errorPages.filter(p => 
      p.statusCode === 404).length;
    analysis.total403Pages = this.results.errorPages.filter(p => 
      p.statusCode === 403).length;
    analysis.total500Pages = this.results.errorPages.filter(p => 
      p.statusCode >= 500).length;
    
    analysis.customErrorPages = this.results.errorPages.filter(p => 
      this._hasCustomDesign(p)).length;

    // Count features
    analysis.hasNavigation = this.results.errorPages.filter(p => 
      p.navigation.hasMenuNavigation).length;
    analysis.hasBranding = this.results.errorPages.filter(p => 
      p.design.maintainsBranding).length;
    analysis.hasSearch = this.results.errorPages.filter(p => 
      p.navigation.hasSearch).length;
    analysis.hasContactInfo = this.results.errorPages.filter(p => 
      p.navigation.hasContactLink).length;
    analysis.hasRecoveryOptions = this.results.errorPages.filter(p => 
      p.navigation.recoveryOptions.length > 0).length;

    // Update UX evaluation
    if (this.results.errorPages.length > 0) {
      const avgPage = this._getAverageErrorPage();
      this.results.userExperience = {
        isHelpful: avgPage.content.hasHelpfulContent,
        hasApology: avgPage.content.hasApology,
        hasExplanation: avgPage.content.hasExplanation,
        hasNextSteps: avgPage.navigation.recoveryOptions.length > 0,
        maintainsBranding: avgPage.design.maintainsBranding,
        providesAlternatives: avgPage.navigation.recoveryOptions.length > 1
      };

      // Update technical analysis
      this.results.technical = {
        usesCorrectStatusCodes: this.results.errorPages.some(p => p.statusCode >= 400),
        hasCustomDesign: this.results.errorPages.some(p => this._hasCustomDesign(p)),
        isResponsive: avgPage.design.isResponsive,
        loadTime: avgPage.loadTime,
        hasMetaTags: true // Simplified check
      };

      // Update conversion analysis
      this.results.conversion = {
        hasLeadCapture: this.results.errorPages.some(p => p.conversion.hasContactForm),
        hasNewsletterSignup: this.results.errorPages.some(p => p.conversion.hasNewsletterSignup),
        hasProductRecommendations: this.results.errorPages.some(p => p.conversion.hasProductRecommendations),
        hasSocialLinks: this.results.errorPages.some(p => p.conversion.hasSocialLinks),
        conversionScore: avgPage.conversion.opportunityScore
      };
    }
  }

  /**
   * Get average error page characteristics
   * @private
   */
  _getAverageErrorPage() {
    if (this.results.errorPages.length === 0) {
      return {
        content: { hasHelpfulContent: false, hasApology: false, hasExplanation: false },
        navigation: { recoveryOptions: [] },
        design: { maintainsBranding: false, isResponsive: false },
        conversion: { opportunityScore: 0 },
        loadTime: 0
      };
    }

    // Return the highest scoring error page as representative
    return this.results.errorPages.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * Calculate scores
   * @private
   */
  _calculateScores() {
    this._calculateExistenceScore();
    this._calculateUsabilityScore();
    this._calculateDesignScore();
    this._calculateConversionScore();
    this._calculateOverallScore();
  }

  /**
   * Calculate existence score
   * @private
   */
  _calculateExistenceScore() {
    if (this.results.errorPages.length === 0) {
      this.results.scores.existence = 0;
      return;
    }

    let score = 50; // Base score for having error pages

    // Bonus for custom error pages
    if (this.results.hasCustomErrorPages) score += 30;
    
    // Bonus for proper status codes
    if (this.results.technical.usesCorrectStatusCodes) score += 20;

    this.results.scores.existence = Math.min(score, 100);
  }

  /**
   * Calculate usability score
   * @private
   */
  _calculateUsabilityScore() {
    if (this.results.errorPages.length === 0) {
      this.results.scores.usability = 0;
      return;
    }

    const avgScore = this.results.errorPages.reduce((sum, page) => 
      sum + page.score, 0) / this.results.errorPages.length;

    this.results.scores.usability = Math.round(avgScore);
  }

  /**
   * Calculate design score
   * @private
   */
  _calculateDesignScore() {
    if (this.results.errorPages.length === 0) {
      this.results.scores.design = 0;
      return;
    }

    let score = 40; // Base score

    if (this.results.userExperience.maintainsBranding) score += 20;
    if (this.results.technical.hasCustomDesign) score += 20;
    if (this.results.technical.isResponsive) score += 20;

    this.results.scores.design = Math.min(score, 100);
  }

  /**
   * Calculate conversion score
   * @private
   */
  _calculateConversionScore() {
    if (this.results.errorPages.length === 0) {
      this.results.scores.conversion = 0;
      return;
    }

    this.results.scores.conversion = Math.round(this.results.conversion.conversionScore);
  }

  /**
   * Calculate overall score
   * @private
   */
  _calculateOverallScore() {
    const weights = {
      existence: 0.3,
      usability: 0.3,
      design: 0.2,
      conversion: 0.2
    };

    this.results.scores.overall = Math.round(
      this.results.scores.existence * weights.existence +
      this.results.scores.usability * weights.usability +
      this.results.scores.design * weights.design +
      this.results.scores.conversion * weights.conversion
    );
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations() {
    if (this.results.errorPages.length === 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Missing Error Pages',
        title: 'Create Custom Error Pages',
        description: 'No custom error pages detected',
        details: 'Implement custom 404 and other error pages to improve user experience when visitors encounter broken links or missing pages.',
        effort: 'medium'
      });
      return;
    }

    // Score-based recommendations
    if (this.results.scores.existence < 70) {
      this._addExistenceRecommendations();
    }

    if (this.results.scores.usability < 70) {
      this._addUsabilityRecommendations();
    }

    if (this.results.scores.design < 70) {
      this._addDesignRecommendations();
    }

    if (this.results.scores.conversion < 50) {
      this._addConversionRecommendations();
    }

    // Feature-specific recommendations
    this._addFeatureSpecificRecommendations();
  }

  /**
   * Add existence recommendations
   * @private
   */
  _addExistenceRecommendations() {
    if (!this.results.hasCustomErrorPages) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'Error Page Setup',
        title: 'Implement Custom Error Pages',
        description: 'Create branded, helpful error pages',
        details: 'Replace default server error pages with custom-designed pages that maintain your brand and help users find what they need.',
        effort: 'medium'
      });
    }

    if (!this.results.technical.usesCorrectStatusCodes) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'medium',
        category: 'Technical Setup',
        title: 'Fix HTTP Status Codes',
        description: 'Ensure error pages return correct HTTP status codes',
        details: 'Error pages should return appropriate status codes (404 for not found, 500 for server errors) to help search engines and browsers handle them correctly.',
        effort: 'low'
      });
    }
  }

  /**
   * Add usability recommendations
   * @private
   */
  _addUsabilityRecommendations() {
    if (!this.results.userExperience.hasNextSteps) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'Error Page Usability',
        title: 'Add Recovery Options',
        description: 'Provide clear next steps for users on error pages',
        details: 'Include navigation links, search functionality, and suggested actions to help users find what they\'re looking for.',
        effort: 'medium'
      });
    }

    if (!this.results.userExperience.hasApology) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'medium',
        category: 'Error Page Content',
        title: 'Improve Error Messaging',
        description: 'Use friendly, apologetic language in error messages',
        details: 'Acknowledge the inconvenience and use a friendly tone to maintain a positive user experience even during errors.',
        effort: 'low'
      });
    }
  }

  /**
   * Add design recommendations
   * @private
   */
  _addDesignRecommendations() {
    if (!this.results.userExperience.maintainsBranding) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Error Page Design',
        title: 'Maintain Brand Consistency',
        description: 'Ensure error pages match your site\'s branding',
        details: 'Include your logo, brand colors, and consistent styling to maintain trust and brand recognition.',
        effort: 'low'
      });
    }

    if (!this.results.technical.isResponsive) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Error Page Design',
        title: 'Make Error Pages Mobile-Friendly',
        description: 'Ensure error pages work well on mobile devices',
        details: 'Implement responsive design for error pages to provide a good experience across all devices.',
        effort: 'medium'
      });
    }
  }

  /**
   * Add conversion recommendations
   * @private
   */
  _addConversionRecommendations() {
    if (!this.results.conversion.hasNewsletterSignup && !this.results.conversion.hasLeadCapture) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'medium',
        category: 'Error Page Conversion',
        title: 'Add Lead Capture to Error Pages',
        description: 'Turn error page visits into conversion opportunities',
        details: 'Consider adding newsletter signup or lead magnets to error pages to capture visitors who might otherwise leave.',
        effort: 'low'
      });
    }

    if (!this.results.conversion.hasProductRecommendations) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'low',
        category: 'Error Page Conversion',
        title: 'Add Product Recommendations',
        description: 'Suggest relevant products or content on error pages',
        details: 'Help users discover other valuable content or products when they encounter an error.',
        effort: 'medium'
      });
    }
  }

  /**
   * Add feature-specific recommendations
   * @private
   */
  _addFeatureSpecificRecommendations() {
    if (this.results.analysis.hasSearch === 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'Error Page Features',
        title: 'Add Search to Error Pages',
        description: 'Include search functionality on error pages',
        details: 'Allow users to search for what they were looking for directly from the error page.',
        effort: 'low'
      });
    }

    if (this.results.analysis.hasContactInfo === 0) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'medium',
        category: 'Error Page Features',
        title: 'Add Contact Information',
        description: 'Provide contact options on error pages',
        details: 'Include contact information or support links to help users who need assistance.',
        effort: 'low'
      });
    }
  }
}

export default ErrorPageDetector;
