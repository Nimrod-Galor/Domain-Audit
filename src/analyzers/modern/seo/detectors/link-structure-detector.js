/**
 * ============================================================================
 * LINK STRUCTURE DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced link structure analysis for SEO optimization
 * Part of the Combined Approach SEO Analyzer (8th Implementation)
 * 
 * Features:
 * - Internal/external link analysis
 * - Anchor text optimization
 * - Link authority and relevance
 * - Navigation structure analysis
 * - Link distribution and flow
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Detector Component
 */

export class LinkStructureDetector {
  constructor(config = {}) {
    this.config = {
      includeExternalLinks: config.includeExternalLinks !== false,
      includeAnchorAnalysis: config.includeAnchorAnalysis !== false,
      includeNavigationAnalysis: config.includeNavigationAnalysis !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      maxInternalLinks: config.maxInternalLinks || 150,
      maxExternalLinks: config.maxExternalLinks || 50,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'link_structure';
    
    // Link validation thresholds
    this.thresholds = {
      minInternalLinks: 3,
      maxInternalLinks: 150,
      minExternalLinks: 0,
      maxExternalLinks: 50,
      minAnchorLength: 2,
      maxAnchorLength: 60,
      optimalAnchorLength: { min: 4, max: 40 }
    };

    // Link quality indicators
    this.qualityIndicators = {
      anchorTextVariety: 0.7, // 70% of anchors should be unique
      descriptiveAnchors: 0.8, // 80% should be descriptive
      followRatio: 0.8, // 80% should be follow links
      internalLinkDepth: 3 // Maximum clicks from homepage
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'LinkStructureDetector',
      version: this.version,
      type: this.detectorType,
      description: 'GPT-5 style link structure analysis for SEO optimization',
      capabilities: [
        'internal_external_link_analysis',
        'anchor_text_optimization',
        'link_authority_assessment',
        'navigation_structure_analysis',
        'link_distribution_evaluation',
        'seo_link_optimization'
      ],
      thresholds: this.thresholds,
      qualityIndicators: this.qualityIndicators,
      linkSupport: {
        externalLinks: this.config.includeExternalLinks,
        anchorAnalysis: this.config.includeAnchorAnalysis,
        navigationAnalysis: this.config.includeNavigationAnalysis
      },
      performance: 'High',
      accuracy: 'Comprehensive'
    };
  }

  /**
   * Analyze document link structure
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Link structure analysis results
   */
  async analyze(context) {
    try {
      const { document, url = '', pageData = {} } = context;
      
      if (!document) {
        throw new Error('Document is required for link structure analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(document);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Detect all links
      const linkElements = this._detectAllLinks(document, url);

      // Phase 2: Analyze internal vs external links
      const linkClassification = this._classifyLinks(linkElements, url);

      // Phase 3: Anchor text analysis
      const anchorAnalysis = this._analyzeAnchorText(linkElements);

      // Phase 4: Navigation structure analysis
      const navigationAnalysis = this._analyzeNavigation(document, linkElements);

      // Phase 5: Link quality and SEO analysis
      const qualityAnalysis = this._analyzeLinkQuality(linkElements, linkClassification);

      // Phase 6: Link distribution and flow
      const distributionAnalysis = this._analyzeLinkDistribution(linkElements, document);

      // Phase 7: Validation and scoring
      const validation = this._validateLinkStructure(linkElements, linkClassification, anchorAnalysis);

      // Compile results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core link data
        links: linkElements,
        classification: linkClassification,
        anchors: anchorAnalysis,
        navigation: navigationAnalysis,
        quality: qualityAnalysis,
        distribution: distributionAnalysis,
        validation,
        
        // Summary metrics
        summary: {
          totalLinks: linkElements.all.length,
          internalLinks: linkClassification.internal.length,
          externalLinks: linkClassification.external.length,
          navigationLinks: navigationAnalysis.navigationLinks.length,
          anchorTextScore: anchorAnalysis.score,
          qualityScore: qualityAnalysis.score,
          distributionScore: distributionAnalysis.score,
          overallScore: validation.overallScore,
          optimizationLevel: this._getOptimizationLevel(validation.overallScore)
        },

        // Performance data
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Link structure detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Detect all link elements in the document
   * @param {Document} document - DOM document
   * @param {string} currentUrl - Current page URL
   * @returns {Object} All link elements with metadata
   */
  _detectAllLinks(document, currentUrl) {
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    
    const processedLinks = allLinks.map((link, index) => {
      const href = link.getAttribute('href') || '';
      const absoluteUrl = this._resolveUrl(href, currentUrl);
      
      return {
        element: link,
        index,
        href,
        absoluteUrl,
        text: link.textContent.trim(),
        innerHTML: link.innerHTML,
        title: link.title || link.getAttribute('title') || '',
        
        // Link attributes
        target: link.target || link.getAttribute('target'),
        rel: link.rel || link.getAttribute('rel'),
        download: link.hasAttribute('download'),
        
        // SEO attributes
        nofollow: this._hasNofollow(link),
        noopener: this._hasNoopener(link),
        noreferrer: this._hasNoreferrer(link),
        
        // Link characteristics
        isEmpty: link.textContent.trim().length === 0,
        hasImage: link.querySelector('img') !== null,
        isImageLink: link.querySelector('img') !== null && link.textContent.trim().length === 0,
        isButton: link.getAttribute('role') === 'button' || link.classList.contains('btn'),
        
        // Position and context
        position: this._getLinkPosition(link),
        context: this._getLinkContext(link),
        parentElement: link.parentElement ? link.parentElement.tagName.toLowerCase() : null,
        
        // Measurements
        textLength: link.textContent.trim().length,
        wordCount: this._countWords(link.textContent),
        
        // Accessibility
        accessibility: this._getLinkAccessibility(link)
      };
    });

    // Group links by type
    const imageLinks = processedLinks.filter(link => link.isImageLink);
    const textLinks = processedLinks.filter(link => !link.isImageLink && !link.isEmpty);
    const emptyLinks = processedLinks.filter(link => link.isEmpty);
    const buttonLinks = processedLinks.filter(link => link.isButton);

    return {
      all: processedLinks,
      text: textLinks,
      image: imageLinks,
      empty: emptyLinks,
      button: buttonLinks,
      
      counts: {
        total: processedLinks.length,
        text: textLinks.length,
        image: imageLinks.length,
        empty: emptyLinks.length,
        button: buttonLinks.length
      }
    };
  }

  /**
   * Classify links as internal or external
   * @param {Object} linkElements - All link elements
   * @param {string} currentUrl - Current page URL
   * @returns {Object} Link classification results
   */
  _classifyLinks(linkElements, currentUrl) {
    const { all } = linkElements;
    const currentDomain = this._extractDomain(currentUrl);
    
    const internal = [];
    const external = [];
    const mailto = [];
    const tel = [];
    const other = [];

    all.forEach(link => {
      const { href, absoluteUrl } = link;
      
      if (href.startsWith('mailto:')) {
        mailto.push(link);
      } else if (href.startsWith('tel:')) {
        tel.push(link);
      } else if (href.startsWith('#') || href.startsWith('javascript:') || href === '') {
        other.push(link);
      } else {
        const linkDomain = this._extractDomain(absoluteUrl);
        
        if (linkDomain === currentDomain || !linkDomain) {
          internal.push(link);
        } else {
          external.push(link);
        }
      }
    });

    // Analyze internal link patterns
    const internalAnalysis = this._analyzeInternalLinks(internal, currentUrl);
    
    // Analyze external link patterns
    const externalAnalysis = this._analyzeExternalLinks(external);

    return {
      internal,
      external,
      mailto,
      tel,
      other,
      
      counts: {
        internal: internal.length,
        external: external.length,
        mailto: mailto.length,
        tel: tel.length,
        other: other.length
      },
      
      ratios: {
        internalToExternal: external.length > 0 ? internal.length / external.length : internal.length,
        internalToTotal: all.length > 0 ? internal.length / all.length : 0,
        externalToTotal: all.length > 0 ? external.length / all.length : 0
      },
      
      analysis: {
        internal: internalAnalysis,
        external: externalAnalysis
      }
    };
  }

  /**
   * Analyze anchor text quality and optimization
   * @param {Object} linkElements - All link elements
   * @returns {Object} Anchor text analysis results
   */
  _analyzeAnchorText(linkElements) {
    const { all, text: textLinks } = linkElements;
    
    if (textLinks.length === 0) {
      return {
        score: 0,
        grade: 'F',
        issues: ['No text links found'],
        recommendations: ['Add descriptive anchor text to links']
      };
    }

    let score = 100;
    const issues = [];
    const recommendations = [];
    
    // Analyze anchor text variety and quality
    const anchorTexts = textLinks.map(link => link.text.toLowerCase());
    const uniqueAnchors = new Set(anchorTexts);
    const variety = uniqueAnchors.size / anchorTexts.length;
    
    // Check anchor text variety
    if (variety < this.qualityIndicators.anchorTextVariety) {
      score -= 20;
      issues.push('Low anchor text variety');
      recommendations.push('Use more diverse anchor text');
    }

    // Analyze individual anchor texts
    const anchorAnalysis = textLinks.map(link => this._analyzeIndividualAnchor(link));
    
    // Check for common issues
    const genericAnchors = textLinks.filter(link => 
      this._isGenericAnchor(link.text)
    );
    
    const longAnchors = textLinks.filter(link => 
      link.textLength > this.thresholds.maxAnchorLength
    );
    
    const shortAnchors = textLinks.filter(link => 
      link.textLength < this.thresholds.minAnchorLength
    );

    // Score adjustments
    if (genericAnchors.length > textLinks.length * 0.2) {
      score -= 25;
      issues.push('Too many generic anchor texts');
      recommendations.push('Use more descriptive anchor text');
    }
    
    if (longAnchors.length > 0) {
      score -= longAnchors.length * 2;
      issues.push(`${longAnchors.length} anchor text(s) too long`);
      recommendations.push('Shorten overly long anchor texts');
    }
    
    if (shortAnchors.length > 0) {
      score -= shortAnchors.length * 3;
      issues.push(`${shortAnchors.length} anchor text(s) too short`);
      recommendations.push('Make anchor texts more descriptive');
    }

    // Calculate average scores
    const avgAnchorScore = anchorAnalysis.reduce((sum, a) => sum + a.score, 0) / anchorAnalysis.length;
    score = (score + avgAnchorScore) / 2;

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      variety,
      anchorAnalysis,
      
      patterns: {
        generic: genericAnchors.length,
        long: longAnchors.length,
        short: shortAnchors.length,
        optimal: textLinks.length - genericAnchors.length - longAnchors.length - shortAnchors.length
      },
      
      distribution: {
        uniqueAnchors: uniqueAnchors.size,
        totalAnchors: anchorTexts.length,
        duplicates: anchorTexts.length - uniqueAnchors.size,
        mostCommon: this._getMostCommonAnchors(anchorTexts)
      }
    };
  }

  /**
   * Analyze navigation structure
   * @param {Document} document - DOM document
   * @param {Object} linkElements - All link elements
   * @returns {Object} Navigation analysis results
   */
  _analyzeNavigation(document, linkElements) {
    // Detect navigation elements
    const navElements = Array.from(document.querySelectorAll('nav, .nav, .navigation, #nav, #navigation'));
    const menuElements = Array.from(document.querySelectorAll('.menu, #menu, [role="navigation"]'));
    const allNavElements = [...navElements, ...menuElements];

    // Find navigation links
    const navigationLinks = [];
    allNavElements.forEach(navElement => {
      const links = Array.from(navElement.querySelectorAll('a[href]'));
      links.forEach(link => {
        const linkData = linkElements.all.find(l => l.element === link);
        if (linkData) {
          navigationLinks.push({
            ...linkData,
            navContext: navElement.className || navElement.tagName,
            level: this._getNavigationLevel(link, navElement)
          });
        }
      });
    });

    // Analyze breadcrumbs
    const breadcrumbs = this._detectBreadcrumbs(document);
    
    // Analyze footer navigation
    const footerNav = this._detectFooterNavigation(document);
    
    // Calculate navigation quality
    let score = 100;
    const issues = [];
    const recommendations = [];

    if (navigationLinks.length === 0) {
      score -= 40;
      issues.push('No navigation structure found');
      recommendations.push('Add proper navigation structure');
    } else if (navigationLinks.length < 3) {
      score -= 20;
      issues.push('Limited navigation options');
      recommendations.push('Expand navigation menu');
    }

    if (breadcrumbs.length === 0) {
      score -= 10;
      recommendations.push('Consider adding breadcrumb navigation');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      navigationLinks,
      breadcrumbs,
      footerNav,
      
      structure: {
        hasMainNavigation: navElements.length > 0,
        navigationCount: allNavElements.length,
        navigationLinksCount: navigationLinks.length,
        hasBreadcrumbs: breadcrumbs.length > 0,
        hasFooterNavigation: footerNav.length > 0
      },
      
      analysis: {
        navigationDepth: this._calculateNavigationDepth(navigationLinks),
        navigationFlow: this._analyzeNavigationFlow(navigationLinks),
        accessibility: this._analyzeNavigationAccessibility(allNavElements)
      }
    };
  }

  /**
   * Analyze overall link quality
   * @param {Object} linkElements - All link elements
   * @param {Object} linkClassification - Link classification results
   * @returns {Object} Link quality analysis
   */
  _analyzeLinkQuality(linkElements, linkClassification) {
    const { all } = linkElements;
    const { internal, external } = linkClassification;
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    const optimizations = [];

    // Check link count optimization
    if (all.length < this.thresholds.minInternalLinks) {
      score -= 20;
      issues.push('Too few links');
      recommendations.push('Add more internal links');
    } else if (all.length > this.thresholds.maxInternalLinks + this.thresholds.maxExternalLinks) {
      score -= 15;
      issues.push('Too many links');
      recommendations.push('Reduce number of links');
    }

    // Check internal/external balance
    const internalRatio = internal.length / all.length;
    if (internalRatio < 0.7) {
      score -= 10;
      issues.push('Too few internal links');
      recommendations.push('Add more internal links');
    } else if (internalRatio > 0.95) {
      score -= 5;
      recommendations.push('Consider adding relevant external links');
    }

    // Check for link quality issues
    const nofollowLinks = all.filter(link => link.nofollow);
    const emptyLinks = all.filter(link => link.isEmpty);
    const brokenLinkCandidates = all.filter(link => 
      link.href === '#' || link.href === 'javascript:void(0)'
    );

    if (emptyLinks.length > 0) {
      score -= emptyLinks.length * 5;
      issues.push(`${emptyLinks.length} empty link(s) found`);
      recommendations.push('Add text or alt text to empty links');
    }

    if (brokenLinkCandidates.length > 0) {
      score -= brokenLinkCandidates.length * 3;
      issues.push(`${brokenLinkCandidates.length} potential broken link(s)`);
      recommendations.push('Fix or remove broken links');
    }

    // Identify optimizations
    if (internal.length >= 5) {
      optimizations.push('Good internal linking structure');
    }
    if (nofollowLinks.length / all.length < 0.2) {
      optimizations.push('Good follow link ratio');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      optimizations,
      
      metrics: {
        totalLinks: all.length,
        internalRatio,
        externalRatio: external.length / all.length,
        followRatio: (all.length - nofollowLinks.length) / all.length,
        emptyLinks: emptyLinks.length,
        nofollowLinks: nofollowLinks.length
      },
      
      opportunities: this._identifyLinkOpportunities(linkElements, linkClassification)
    };
  }

  /**
   * Analyze link distribution throughout the page
   * @param {Object} linkElements - All link elements
   * @param {Document} document - DOM document
   * @returns {Object} Link distribution analysis
   */
  _analyzeLinkDistribution(linkElements, document) {
    const { all } = linkElements;
    
    // Analyze links by page section
    const distribution = {
      header: this._countLinksInSection(document, 'header, .header, #header'),
      navigation: this._countLinksInSection(document, 'nav, .nav, .navigation'),
      main: this._countLinksInSection(document, 'main, .main, #main, .content'),
      sidebar: this._countLinksInSection(document, 'aside, .sidebar, .side'),
      footer: this._countLinksInSection(document, 'footer, .footer, #footer')
    };

    // Calculate distribution scores
    let score = 100;
    const issues = [];
    const recommendations = [];

    // Check for balanced distribution
    const mainContentLinks = distribution.main;
    const totalLinks = all.length;
    const mainRatio = mainContentLinks / totalLinks;

    if (mainRatio < 0.4) {
      score -= 15;
      issues.push('Too few links in main content');
      recommendations.push('Add more contextual links in main content');
    } else if (mainRatio > 0.8) {
      score -= 10;
      issues.push('Links too concentrated in main content');
      recommendations.push('Balance link distribution across page sections');
    }

    // Check for navigation presence
    if (distribution.navigation === 0 && distribution.header === 0) {
      score -= 20;
      issues.push('No navigation links found');
      recommendations.push('Add navigation structure');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      distribution,
      ratios: {
        header: distribution.header / totalLinks,
        navigation: distribution.navigation / totalLinks,
        main: distribution.main / totalLinks,
        sidebar: distribution.sidebar / totalLinks,
        footer: distribution.footer / totalLinks
      },
      
      analysis: {
        isBalanced: mainRatio >= 0.4 && mainRatio <= 0.8,
        hasNavigation: distribution.navigation > 0 || distribution.header > 0,
        mainContentFocus: mainRatio,
        totalSections: Object.values(distribution).filter(count => count > 0).length
      }
    };
  }

  /**
   * Validate overall link structure
   * @param {Object} linkElements - All link elements
   * @param {Object} linkClassification - Link classification
   * @param {Object} anchorAnalysis - Anchor text analysis
   * @returns {Object} Link structure validation
   */
  _validateLinkStructure(linkElements, linkClassification, anchorAnalysis) {
    const scores = [
      this._validateLinkCounts(linkElements, linkClassification).score,
      anchorAnalysis.score,
      this._validateLinkQuality(linkElements).score
    ];

    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const grade = this._calculateGrade(overallScore);

    // Critical issues
    const criticalIssues = [];
    if (linkElements.all.length === 0) {
      criticalIssues.push('No links found');
    }
    if (linkClassification.internal.length === 0) {
      criticalIssues.push('No internal links');
    }
    if (linkElements.empty.length > linkElements.all.length * 0.1) {
      criticalIssues.push('Too many empty links');
    }

    return {
      overallScore,
      grade,
      criticalIssues,
      passesValidation: criticalIssues.length === 0 && overallScore >= 70,
      improvementAreas: this._identifyLinkImprovementAreas(linkElements, linkClassification, anchorAnalysis),
      recommendations: this._generateLinkValidationRecommendations(linkElements, linkClassification, anchorAnalysis)
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _resolveUrl(href, baseUrl) {
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
      }
      if (href.startsWith('//')) {
        return 'https:' + href;
      }
      if (href.startsWith('/')) {
        const base = new URL(baseUrl);
        return base.origin + href;
      }
      return new URL(href, baseUrl).href;
    } catch (error) {
      return href;
    }
  }

  _extractDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
      return '';
    }
  }

  _hasNofollow(link) {
    const rel = link.getAttribute('rel') || '';
    return rel.includes('nofollow');
  }

  _hasNoopener(link) {
    const rel = link.getAttribute('rel') || '';
    return rel.includes('noopener');
  }

  _hasNoreferrer(link) {
    const rel = link.getAttribute('rel') || '';
    return rel.includes('noreferrer');
  }

  _getLinkPosition(link) {
    const rect = link.getBoundingClientRect ? link.getBoundingClientRect() : {};
    return {
      top: rect.top || 0,
      left: rect.left || 0,
      width: rect.width || 0,
      height: rect.height || 0
    };
  }

  _getLinkContext(link) {
    const parent = link.parentElement;
    const grandparent = parent ? parent.parentElement : null;
    
    return {
      parent: parent ? parent.tagName.toLowerCase() : null,
      grandparent: grandparent ? grandparent.tagName.toLowerCase() : null,
      isInParagraph: parent && parent.tagName.toLowerCase() === 'p',
      isInList: parent && ['li', 'ul', 'ol'].includes(parent.tagName.toLowerCase()),
      isInNavigation: this._isInNavigation(link)
    };
  }

  _isInNavigation(link) {
    let element = link.parentElement;
    while (element) {
      if (element.tagName.toLowerCase() === 'nav' || 
          element.classList.contains('nav') || 
          element.classList.contains('navigation') ||
          element.getAttribute('role') === 'navigation') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  _getLinkAccessibility(link) {
    return {
      hasTitle: !!link.title,
      hasAriaLabel: !!link.getAttribute('aria-label'),
      hasAriaDescribedBy: !!link.getAttribute('aria-describedby'),
      tabIndex: link.tabIndex,
      isAccessible: !!(link.textContent.trim() || link.title || link.getAttribute('aria-label'))
    };
  }

  _countWords(text) {
    return (text.match(/\b\w+\b/g) || []).length;
  }

  _analyzeInternalLinks(internalLinks, currentUrl) {
    const uniqueUrls = new Set(internalLinks.map(link => link.absoluteUrl));
    const linkDistribution = {};
    
    internalLinks.forEach(link => {
      const url = link.absoluteUrl;
      linkDistribution[url] = (linkDistribution[url] || 0) + 1;
    });

    return {
      uniqueTargets: uniqueUrls.size,
      totalLinks: internalLinks.length,
      averageLinksPerTarget: internalLinks.length / uniqueUrls.size,
      distribution: linkDistribution,
      mostLinkedPages: Object.entries(linkDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  _analyzeExternalLinks(externalLinks) {
    const domains = {};
    externalLinks.forEach(link => {
      const domain = this._extractDomain(link.absoluteUrl);
      domains[domain] = (domains[domain] || 0) + 1;
    });

    const nofollowCount = externalLinks.filter(link => link.nofollow).length;
    
    return {
      uniqueDomains: Object.keys(domains).length,
      totalLinks: externalLinks.length,
      domainDistribution: domains,
      nofollowRatio: nofollowCount / externalLinks.length,
      topDomains: Object.entries(domains)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  _analyzeIndividualAnchor(link) {
    const { text, textLength } = link;
    let score = 100;
    const issues = [];
    
    // Length check
    if (textLength < this.thresholds.minAnchorLength) {
      score -= 30;
      issues.push('Anchor text too short');
    } else if (textLength > this.thresholds.maxAnchorLength) {
      score -= 15;
      issues.push('Anchor text too long');
    }
    
    // Generic text check
    if (this._isGenericAnchor(text)) {
      score -= 25;
      issues.push('Generic anchor text');
    }
    
    // Descriptive check
    if (!this._isDescriptiveAnchor(text)) {
      score -= 20;
      issues.push('Not descriptive enough');
    }
    
    return { score, issues, text, textLength };
  }

  _isGenericAnchor(text) {
    const generic = [
      'click here', 'here', 'read more', 'more', 'link', 'this',
      'continue', 'next', 'previous', 'go', 'visit', 'see'
    ];
    return generic.includes(text.toLowerCase().trim());
  }

  _isDescriptiveAnchor(text) {
    return text.length >= 4 && 
           !this._isGenericAnchor(text) &&
           /\w+/.test(text);
  }

  _getMostCommonAnchors(anchorTexts) {
    const frequency = {};
    anchorTexts.forEach(text => {
      frequency[text] = (frequency[text] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  _detectBreadcrumbs(document) {
    const breadcrumbSelectors = [
      '.breadcrumb', '.breadcrumbs', '#breadcrumb', '#breadcrumbs',
      '[role="navigation"] ol', '.nav-breadcrumb', '.breadcrumb-nav'
    ];
    
    const breadcrumbs = [];
    breadcrumbSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const links = Array.from(element.querySelectorAll('a'));
        if (links.length > 0) {
          breadcrumbs.push({
            element,
            links: links.length,
            text: element.textContent.trim()
          });
        }
      });
    });
    
    return breadcrumbs;
  }

  _detectFooterNavigation(document) {
    const footerElements = document.querySelectorAll('footer, .footer, #footer');
    const footerLinks = [];
    
    footerElements.forEach(footer => {
      const links = Array.from(footer.querySelectorAll('a[href]'));
      footerLinks.push(...links);
    });
    
    return footerLinks;
  }

  _getNavigationLevel(link, navElement) {
    let level = 1;
    let current = link.parentElement;
    
    while (current && current !== navElement) {
      if (current.tagName.toLowerCase() === 'ul' || 
          current.tagName.toLowerCase() === 'ol') {
        level++;
      }
      current = current.parentElement;
    }
    
    return level;
  }

  _calculateNavigationDepth(navigationLinks) {
    const levels = navigationLinks.map(link => link.level || 1);
    return levels.length > 0 ? Math.max(...levels) : 0;
  }

  _analyzeNavigationFlow(navigationLinks) {
    // Simple flow analysis based on link order and grouping
    return {
      totalLinks: navigationLinks.length,
      hasLogicalOrder: true, // Simplified
      score: navigationLinks.length > 0 ? 85 : 0
    };
  }

  _analyzeNavigationAccessibility(navElements) {
    let score = 100;
    const issues = [];
    
    navElements.forEach(nav => {
      if (!nav.getAttribute('aria-label') && !nav.querySelector('h1, h2, h3, h4, h5, h6')) {
        score -= 10;
        issues.push('Navigation missing accessible label');
      }
    });
    
    return { score, issues };
  }

  _countLinksInSection(document, selector) {
    const sections = document.querySelectorAll(selector);
    let count = 0;
    
    sections.forEach(section => {
      count += section.querySelectorAll('a[href]').length;
    });
    
    return count;
  }

  _identifyLinkOpportunities(linkElements, linkClassification) {
    const opportunities = [];
    
    if (linkClassification.internal.length >= 5) {
      opportunities.push('Good internal linking foundation');
    }
    
    if (linkElements.text.length > linkElements.image.length) {
      opportunities.push('Good text link to image link ratio');
    }
    
    if (linkClassification.external.length > 0 && linkClassification.external.length <= 10) {
      opportunities.push('Balanced external linking');
    }
    
    return opportunities;
  }

  _validateLinkCounts(linkElements, linkClassification) {
    let score = 100;
    
    if (linkElements.all.length < 3) {
      score -= 40;
    } else if (linkElements.all.length > 200) {
      score -= 20;
    }
    
    if (linkClassification.internal.length === 0) {
      score -= 30;
    }
    
    return { score };
  }

  _validateLinkQuality(linkElements) {
    let score = 100;
    
    const emptyLinkRatio = linkElements.empty.length / linkElements.all.length;
    if (emptyLinkRatio > 0.1) {
      score -= 30;
    }
    
    return { score };
  }

  _identifyLinkImprovementAreas(linkElements, linkClassification, anchorAnalysis) {
    const areas = [];
    
    if (anchorAnalysis.score < 70) {
      areas.push('anchor_text_optimization');
    }
    
    if (linkClassification.internal.length < 5) {
      areas.push('internal_linking');
    }
    
    if (linkElements.empty.length > 0) {
      areas.push('empty_links');
    }
    
    return areas;
  }

  _generateLinkValidationRecommendations(linkElements, linkClassification, anchorAnalysis) {
    const recommendations = [];
    
    if (linkElements.all.length < 5) {
      recommendations.push('Add more links to improve page connectivity');
    }
    
    if (linkClassification.internal.length < 3) {
      recommendations.push('Add more internal links to related content');
    }
    
    if (anchorAnalysis.score < 70) {
      recommendations.push('Improve anchor text descriptiveness');
    }
    
    if (linkElements.empty.length > 0) {
      recommendations.push('Add text or remove empty links');
    }
    
    return recommendations;
  }

  _calculateGrade(score) {
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

  _getOptimizationLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  _generateCacheKey(document) {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const linkData = links.map(link => link.href + link.textContent).join('');
    return btoa(linkData).slice(0, 20);
  }
}

export default LinkStructureDetector;
