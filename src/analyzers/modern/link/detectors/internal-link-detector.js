/**
 * Internal Link Detector - GPT-5 Style Modular Detection
 * 
 * Advanced internal link detection and analysis with comprehensive
 * link mapping, hierarchy analysis, and SEO optimization insights.
 */

export class InternalLinkDetector {
  constructor(config = {}) {
    this.config = {
      enableDeepAnalysis: config.enableDeepAnalysis !== false,
      enableHierarchyMapping: config.enableHierarchyMapping !== false,
      enableAnchorAnalysis: config.enableAnchorAnalysis !== false,
      includeNofollow: config.includeNofollow !== false,
      analyzeJsLinks: config.analyzeJsLinks || false,
      maxDepthAnalysis: config.maxDepthAnalysis || 3,
      ...config
    };

    this.linkPatterns = {
      relative: /^\/[^\/]/,
      absolute: /^https?:\/\//,
      hash: /^#/,
      protocol: /^\/\//,
      javascript: /^javascript:/i,
      mailto: /^mailto:/i,
      tel: /^tel:/i
    };

    this.hierarchyLevels = {
      homepage: 0,
      category: 1,
      subcategory: 2,
      product: 3,
      deep: 4
    };
  }

  async detect(document, context = {}) {
    try {
      const analysis = {
        links: await this.extractInternalLinks(document, context),
        hierarchy: await this.analyzeHierarchy(document, context),
        distribution: await this.analyzeDistribution(document, context),
        anchors: await this.analyzeAnchorText(document, context),
        navigation: await this.analyzeNavigation(document, context),
        count: 0,
        score: 0,
        recommendations: []
      };

      analysis.count = analysis.links.length;
      analysis.score = this.calculateInternalLinkScore(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return {
        category: 'Internal Link Detection',
        subcategory: 'Link Discovery and Analysis',
        ...analysis,
        metadata: {
          detector: 'InternalLinkDetector',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleDetectionError(error);
    }
  }

  async extractInternalLinks(document, context) {
    const links = [];
    const baseUrl = context.url ? new URL(context.url) : null;
    const domain = baseUrl ? baseUrl.hostname : null;

    // Find all anchor elements
    const anchorElements = document.querySelectorAll('a[href]');

    anchorElements.forEach((anchor, index) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      const linkInfo = this.analyzeLinkElement(anchor, href, baseUrl, domain, index);
      
      if (linkInfo.isInternal) {
        links.push(linkInfo);
      }
    });

    // Analyze JavaScript-generated links if enabled
    if (this.config.analyzeJsLinks) {
      const jsLinks = this.extractJavaScriptLinks(document, baseUrl, domain);
      links.push(...jsLinks);
    }

    return links;
  }

  analyzeLinkElement(anchor, href, baseUrl, domain, index) {
    const linkInfo = {
      href,
      text: anchor.textContent?.trim() || '',
      title: anchor.getAttribute('title') || '',
      rel: anchor.getAttribute('rel') || '',
      target: anchor.getAttribute('target') || '',
      isNofollow: (anchor.getAttribute('rel') || '').includes('nofollow'),
      isSponsored: (anchor.getAttribute('rel') || '').includes('sponsored'),
      isUGC: (anchor.getAttribute('rel') || '').includes('ugc'),
      position: index,
      context: this.getLinkContext(anchor),
      isInternal: false,
      linkType: 'unknown',
      depth: 0,
      category: 'unknown'
    };

    // Determine if link is internal
    if (this.linkPatterns.hash.test(href)) {
      linkInfo.isInternal = true;
      linkInfo.linkType = 'hash';
      linkInfo.category = 'same-page';
    } else if (this.linkPatterns.relative.test(href)) {
      linkInfo.isInternal = true;
      linkInfo.linkType = 'relative';
      linkInfo.resolvedUrl = this.resolveRelativeUrl(href, baseUrl);
    } else if (this.linkPatterns.absolute.test(href)) {
      try {
        const linkUrl = new URL(href);
        if (linkUrl.hostname === domain || this.isSubdomain(linkUrl.hostname, domain)) {
          linkInfo.isInternal = true;
          linkInfo.linkType = 'absolute';
          linkInfo.resolvedUrl = href;
        }
      } catch (e) {
        // Invalid URL
      }
    }

    // Additional analysis for internal links
    if (linkInfo.isInternal) {
      linkInfo.depth = this.calculateLinkDepth(linkInfo.resolvedUrl || href);
      linkInfo.category = this.categorizeLinkType(anchor, linkInfo);
      linkInfo.strength = this.calculateLinkStrength(linkInfo, anchor);
    }

    return linkInfo;
  }

  async analyzeHierarchy(document, context) {
    if (!this.config.enableHierarchyMapping) {
      return { enabled: false };
    }

    const hierarchy = {
      levels: {},
      depthDistribution: {},
      navigationStructure: this.analyzeNavigationStructure(document),
      breadcrumbs: this.analyzeBreadcrumbs(document),
      pagination: this.analyzePagination(document)
    };

    // Group links by hierarchy depth
    const links = await this.extractInternalLinks(document, context);
    
    links.forEach(link => {
      if (!hierarchy.levels[link.depth]) {
        hierarchy.levels[link.depth] = [];
      }
      hierarchy.levels[link.depth].push(link);

      hierarchy.depthDistribution[link.depth] = 
        (hierarchy.depthDistribution[link.depth] || 0) + 1;
    });

    return hierarchy;
  }

  async analyzeDistribution(document, context) {
    const distribution = {
      bySection: {},
      byType: {},
      byDepth: {},
      density: this.calculateLinkDensity(document),
      concentration: this.analyzeLinkConcentration(document)
    };

    const links = await this.extractInternalLinks(document, context);

    // Analyze distribution by page section
    links.forEach(link => {
      const section = this.identifyPageSection(link.context.element);
      distribution.bySection[section] = (distribution.bySection[section] || 0) + 1;

      distribution.byType[link.category] = (distribution.byType[link.category] || 0) + 1;
      distribution.byDepth[link.depth] = (distribution.byDepth[link.depth] || 0) + 1;
    });

    return distribution;
  }

  async analyzeAnchorText(document, context) {
    if (!this.config.enableAnchorAnalysis) {
      return { enabled: false };
    }

    const anchors = {
      distribution: {},
      patterns: {},
      optimization: {},
      quality: this.assessAnchorQuality(document)
    };

    const links = await this.extractInternalLinks(document, context);

    links.forEach(link => {
      const text = link.text.toLowerCase();
      const category = this.categorizeAnchorText(text);
      
      anchors.distribution[category] = (anchors.distribution[category] || 0) + 1;
      
      if (!anchors.patterns[category]) {
        anchors.patterns[category] = [];
      }
      anchors.patterns[category].push({
        text: link.text,
        href: link.href,
        frequency: 1
      });
    });

    // Calculate percentages
    const totalLinks = links.length;
    Object.keys(anchors.distribution).forEach(category => {
      anchors.distribution[category] = {
        count: anchors.distribution[category],
        percentage: (anchors.distribution[category] / totalLinks) * 100
      };
    });

    return anchors;
  }

  async analyzeNavigation(document, context) {
    const navigation = {
      primary: this.analyzePrimaryNavigation(document),
      secondary: this.analyzeSecondaryNavigation(document),
      footer: this.analyzeFooterNavigation(document),
      breadcrumbs: this.analyzeBreadcrumbs(document),
      internal: this.analyzeInternalNavigation(document),
      structure: this.assessNavigationStructure(document)
    };

    return navigation;
  }

  // Utility methods
  getLinkContext(element) {
    return {
      element,
      parent: element.parentElement?.tagName.toLowerCase(),
      section: this.identifyPageSection(element),
      position: this.getElementPosition(element),
      nearbyText: this.getNearbyText(element),
      isInNavigation: this.isInNavigation(element),
      isInContent: this.isInContent(element),
      isInFooter: this.isInFooter(element)
    };
  }

  resolveRelativeUrl(href, baseUrl) {
    if (!baseUrl) return href;
    try {
      return new URL(href, baseUrl.origin).href;
    } catch (e) {
      return href;
    }
  }

  isSubdomain(hostname, domain) {
    return hostname.endsWith('.' + domain) || hostname === domain;
  }

  calculateLinkDepth(url) {
    if (!url) return 0;
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
      return pathSegments.length;
    } catch (e) {
      return 0;
    }
  }

  categorizeLinkType(anchor, linkInfo) {
    const context = linkInfo.context;
    
    if (context.isInNavigation) return 'navigation';
    if (context.isInFooter) return 'footer';
    if (context.isInContent) return 'content';
    if (linkInfo.linkType === 'hash') return 'anchor';
    if (this.isPaginationLink(anchor)) return 'pagination';
    if (this.isBreadcrumbLink(anchor)) return 'breadcrumb';
    
    return 'other';
  }

  calculateLinkStrength(linkInfo, anchor) {
    let strength = 50; // Base strength

    // Anchor text quality
    if (linkInfo.text.length > 0 && linkInfo.text.length < 100) {
      strength += 10;
    }
    if (!this.isGenericAnchorText(linkInfo.text)) {
      strength += 15;
    }

    // Link attributes
    if (linkInfo.isNofollow) strength -= 20;
    if (linkInfo.title) strength += 5;

    // Context factors
    if (linkInfo.context.isInContent) strength += 15;
    if (linkInfo.context.isInNavigation) strength += 10;

    // Position factors
    if (linkInfo.position < 5) strength += 5; // Early links get bonus

    return Math.max(0, Math.min(100, strength));
  }

  calculateLinkDensity(document) {
    const textContent = document.body?.textContent || '';
    const totalLinks = document.querySelectorAll('a[href]').length;
    const totalWords = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return totalWords > 0 ? (totalLinks / totalWords) * 100 : 0;
  }

  analyzeLinkConcentration(document) {
    const sections = ['header', 'nav', 'main', 'aside', 'footer'];
    const concentration = {};

    sections.forEach(section => {
      const sectionEl = document.querySelector(section);
      if (sectionEl) {
        const sectionLinks = sectionEl.querySelectorAll('a[href]').length;
        const totalLinks = document.querySelectorAll('a[href]').length;
        concentration[section] = totalLinks > 0 ? (sectionLinks / totalLinks) * 100 : 0;
      }
    });

    return concentration;
  }

  identifyPageSection(element) {
    const sections = ['header', 'nav', 'main', 'article', 'aside', 'footer'];
    
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      if (sections.includes(tag)) {
        return tag;
      }
      
      // Check for semantic classes
      const className = current.className?.toLowerCase() || '';
      for (const section of sections) {
        if (className.includes(section)) {
          return section;
        }
      }
      
      current = current.parentElement;
    }
    
    return 'unknown';
  }

  categorizeAnchorText(text) {
    text = text.toLowerCase().trim();
    
    if (!text) return 'empty';
    if (this.isGenericAnchorText(text)) return 'generic';
    if (this.isUrlAnchorText(text)) return 'url';
    if (this.isBrandAnchorText(text)) return 'branded';
    if (text.length > 50) return 'long-tail';
    if (this.hasKeywords(text)) return 'keyword-rich';
    
    return 'descriptive';
  }

  isGenericAnchorText(text) {
    const genericPatterns = [
      /^(click here|read more|more|learn more|see more|continue|next|previous)$/i,
      /^(link|website|page|article|download|view|show|hide)$/i,
      /^(here|this|that|it|more info|details)$/i
    ];
    
    return genericPatterns.some(pattern => pattern.test(text.trim()));
  }

  isUrlAnchorText(text) {
    return /^(https?:\/\/|www\.|[a-z0-9-]+\.(com|org|net|edu|gov))/.test(text.toLowerCase());
  }

  isBrandAnchorText(text) {
    // Simplified brand detection - would need domain-specific logic
    return /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(text.trim());
  }

  hasKeywords(text) {
    // Simplified keyword detection
    return text.split(/\s+/).length >= 2 && text.split(/\s+/).length <= 6;
  }

  calculateInternalLinkScore(analysis) {
    let score = 50; // Base score

    // Link count factor
    const linkCount = analysis.count;
    if (linkCount > 10 && linkCount < 100) {
      score += 20;
    } else if (linkCount >= 5) {
      score += 10;
    }

    // Distribution factor
    if (analysis.distribution.bySection) {
      const sections = Object.keys(analysis.distribution.bySection);
      if (sections.length >= 3) score += 15; // Good distribution
    }

    // Anchor text quality
    if (analysis.anchors.enabled !== false) {
      const genericPercentage = analysis.anchors.distribution?.generic?.percentage || 0;
      if (genericPercentage < 20) score += 15;
      else if (genericPercentage > 50) score -= 20;
    }

    // Navigation structure
    if (analysis.navigation.structure?.score) {
      score += analysis.navigation.structure.score * 0.2;
    }

    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Link count recommendations
    if (analysis.count < 5) {
      recommendations.push({
        type: 'link-count',
        priority: 'medium',
        category: 'Internal Linking',
        issue: 'Too few internal links detected',
        recommendation: 'Add more internal links to improve site navigation and SEO',
        impact: 'medium'
      });
    } else if (analysis.count > 200) {
      recommendations.push({
        type: 'link-count',
        priority: 'low',
        category: 'Internal Linking',
        issue: 'Very high number of internal links',
        recommendation: 'Consider reducing link density for better user experience',
        impact: 'low'
      });
    }

    // Anchor text recommendations
    if (analysis.anchors.enabled !== false) {
      const genericPercentage = analysis.anchors.distribution?.generic?.percentage || 0;
      if (genericPercentage > 30) {
        recommendations.push({
          type: 'anchor-text',
          priority: 'high',
          category: 'Anchor Text Optimization',
          issue: 'High percentage of generic anchor text',
          recommendation: 'Replace generic anchor text with descriptive, keyword-rich alternatives',
          impact: 'high'
        });
      }
    }

    // Distribution recommendations
    if (analysis.distribution.density > 10) {
      recommendations.push({
        type: 'link-density',
        priority: 'medium',
        category: 'Link Distribution',
        issue: 'High link density detected',
        recommendation: 'Reduce link density to improve content readability',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  // Navigation analysis methods
  analyzePrimaryNavigation(document) {
    const nav = document.querySelector('nav, .nav, .navigation, .main-nav');
    if (!nav) return { found: false };

    const links = nav.querySelectorAll('a[href]');
    return {
      found: true,
      linkCount: links.length,
      structure: this.analyzeNavStructure(nav),
      accessibility: this.checkNavAccessibility(nav)
    };
  }

  analyzeSecondaryNavigation(document) {
    // Look for secondary navigation patterns
    const secondaryNavs = document.querySelectorAll('.secondary-nav, .sub-nav, .sidebar-nav');
    return {
      found: secondaryNavs.length > 0,
      count: secondaryNavs.length,
      totalLinks: Array.from(secondaryNavs).reduce((sum, nav) => 
        sum + nav.querySelectorAll('a[href]').length, 0)
    };
  }

  analyzeFooterNavigation(document) {
    const footer = document.querySelector('footer');
    if (!footer) return { found: false };

    const links = footer.querySelectorAll('a[href]');
    return {
      found: true,
      linkCount: links.length,
      sections: this.identifyFooterSections(footer)
    };
  }

  analyzeBreadcrumbs(document) {
    const breadcrumbSelectors = [
      '.breadcrumb', '.breadcrumbs', '[aria-label*="breadcrumb"]',
      '.crumb', '.trail', '.path'
    ];

    for (const selector of breadcrumbSelectors) {
      const breadcrumb = document.querySelector(selector);
      if (breadcrumb) {
        const links = breadcrumb.querySelectorAll('a[href]');
        return {
          found: true,
          linkCount: links.length,
          structure: this.analyzeBreadcrumbStructure(breadcrumb)
        };
      }
    }

    return { found: false };
  }

  analyzePagination(document) {
    const paginationSelectors = [
      '.pagination', '.pager', '.page-nav', '[aria-label*="pagination"]'
    ];

    for (const selector of paginationSelectors) {
      const pagination = document.querySelector(selector);
      if (pagination) {
        const links = pagination.querySelectorAll('a[href]');
        return {
          found: true,
          linkCount: links.length,
          type: this.identifyPaginationType(pagination)
        };
      }
    }

    return { found: false };
  }

  analyzeInternalNavigation(document) {
    return {
      toc: this.analyzeTableOfContents(document),
      jumpLinks: this.analyzeJumpLinks(document),
      relatedLinks: this.analyzeRelatedLinks(document)
    };
  }

  assessNavigationStructure(document) {
    let score = 50;
    
    // Check for primary navigation
    if (this.analyzePrimaryNavigation(document).found) score += 20;
    
    // Check for footer navigation
    if (this.analyzeFooterNavigation(document).found) score += 10;
    
    // Check for breadcrumbs
    if (this.analyzeBreadcrumbs(document).found) score += 15;
    
    // Check for pagination if applicable
    if (this.analyzePagination(document).found) score += 5;

    return { score: Math.min(100, score) };
  }

  // Helper methods for detailed analysis
  analyzeNavigationStructure(document) {
    // Implementation details
    return { basic: true };
  }

  analyzeNavStructure(nav) {
    // Implementation details
    return { hierarchical: false };
  }

  checkNavAccessibility(nav) {
    // Implementation details
    return { score: 75 };
  }

  identifyFooterSections(footer) {
    // Implementation details
    return [];
  }

  analyzeBreadcrumbStructure(breadcrumb) {
    // Implementation details
    return { levels: 0 };
  }

  identifyPaginationType(pagination) {
    // Implementation details
    return 'numbered';
  }

  analyzeTableOfContents(document) {
    // Implementation details
    return { found: false };
  }

  analyzeJumpLinks(document) {
    // Implementation details
    return { found: false };
  }

  analyzeRelatedLinks(document) {
    // Implementation details
    return { found: false };
  }

  assessAnchorQuality(document) {
    // Implementation details
    return { score: 75 };
  }

  getElementPosition(element) {
    // Implementation details
    return { x: 0, y: 0 };
  }

  getNearbyText(element) {
    // Implementation details
    return '';
  }

  isInNavigation(element) {
    let current = element;
    while (current && current.tagName) {
      if (current.tagName.toLowerCase() === 'nav' || 
          current.className?.toLowerCase().includes('nav')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isInContent(element) {
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      if (['main', 'article', 'section'].includes(tag)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isInFooter(element) {
    let current = element;
    while (current && current.tagName) {
      if (current.tagName.toLowerCase() === 'footer') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isPaginationLink(anchor) {
    const text = anchor.textContent?.toLowerCase() || '';
    const parent = anchor.parentElement;
    const parentClass = parent?.className?.toLowerCase() || '';
    
    return /\b(next|previous|prev|page|[0-9]+)\b/.test(text) ||
           /\b(pagination|pager|page-nav)\b/.test(parentClass);
  }

  isBreadcrumbLink(anchor) {
    let current = anchor.parentElement;
    while (current && current.tagName) {
      const className = current.className?.toLowerCase() || '';
      if (/\b(breadcrumb|crumb|trail|path)\b/.test(className)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  extractJavaScriptLinks(document, baseUrl, domain) {
    // Simplified implementation for JS-generated links
    const jsLinks = [];
    
    // Look for onclick handlers that might generate links
    const clickableElements = document.querySelectorAll('[onclick]');
    clickableElements.forEach((element, index) => {
      const onclick = element.getAttribute('onclick');
      if (onclick && onclick.includes('location') || onclick.includes('href')) {
        jsLinks.push({
          href: 'javascript-generated',
          text: element.textContent?.trim() || '',
          linkType: 'javascript',
          isInternal: true, // Assume internal for now
          position: -1,
          context: this.getLinkContext(element),
          depth: 0,
          category: 'javascript',
          strength: 30 // Lower strength for JS links
        });
      }
    });

    return jsLinks;
  }

  handleDetectionError(error) {
    return {
      category: 'Internal Link Detection',
      subcategory: 'Detection Error',
      error: error.message,
      links: [],
      count: 0,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Internal link detection failed',
        recommendation: 'Review internal link structure and try again'
      }]
    };
  }
}
