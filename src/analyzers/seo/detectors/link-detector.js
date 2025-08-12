/**
 * Link Detector - GPT-5 Style Pure Detection
 * 
 * Detects and extracts all link-related elements from the DOM
 * No business logic - pure detection and extraction
 */

export class LinkDetector {
  constructor(options = {}) {
    this.options = {
      analyzeAnchors: options.analyzeAnchors !== false,
      detectExternal: options.detectExternal !== false,
      checkAccessibility: options.checkAccessibility !== false,
      extractStructure: options.extractStructure !== false,
      analyzeLinkText: options.analyzeLinkText !== false,
      ...options
    };
  }

  /**
   * Detect all link-related elements
   * @param {Document} document - DOM document
   * @param {string} url - Page URL for context
   * @returns {Object} Link detection results
   */
  async detect(document, url) {
    try {
      const baseHost = url ? new URL(url).hostname : null;
      
      const results = {
        success: true,
        url,
        anchors: this.options.analyzeAnchors ? this._detectAnchorLinks(document, baseHost) : null,
        navigation: this._detectNavigationLinks(document, baseHost),
        external: this.options.detectExternal ? this._detectExternalLinks(document, baseHost) : null,
        accessibility: this.options.checkAccessibility ? this._detectAccessibilityFeatures(document) : null,
        structure: this.options.extractStructure ? this._detectLinkStructure(document) : null,
        statistics: {}
      };

      // Calculate statistics
      results.statistics = this._calculateStatistics(results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        url,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detect anchor links and their properties
   * @param {Document} document - DOM document
   * @param {string} baseHost - Base hostname for context
   * @returns {Object} Anchor link data
   * @private
   */
  _detectAnchorLinks(document, baseHost) {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    
    const anchorData = {
      count: anchors.length,
      links: anchors.map((anchor, index) => {
        const href = anchor.getAttribute('href');
        const text = anchor.textContent.trim();
        const title = anchor.getAttribute('title');
        
        return {
          href,
          text,
          textLength: text.length,
          title,
          hasTitle: !!title,
          isEmpty: text.length === 0,
          isExternal: this._isExternalLink(href, baseHost),
          isEmail: this._isEmailLink(href),
          isTel: this._isTelLink(href),
          isHash: this._isHashLink(href),
          isProtocol: this._hasProtocol(href),
          target: anchor.getAttribute('target'),
          rel: anchor.getAttribute('rel'),
          position: index + 1,
          hasImage: anchor.querySelector('img') !== null,
          attributes: this._extractLinkAttributes(anchor)
        };
      })
    };

    // Categorize links
    anchorData.categories = this._categorizeLinks(anchorData.links);

    return anchorData;
  }

  /**
   * Detect navigation-specific links
   * @param {Document} document - DOM document
   * @param {string} baseHost - Base hostname
   * @returns {Object} Navigation link data
   * @private
   */
  _detectNavigationLinks(document, baseHost) {
    const navigationElements = document.querySelectorAll('nav, [role="navigation"]');
    const breadcrumbs = document.querySelectorAll('[role="breadcrumb"], .breadcrumb, .breadcrumbs');
    const menus = document.querySelectorAll('[role="menu"], [role="menubar"]');
    
    return {
      navigation: {
        count: navigationElements.length,
        elements: Array.from(navigationElements).map(nav => ({
          tagName: nav.tagName.toLowerCase(),
          role: nav.getAttribute('role'),
          linkCount: nav.querySelectorAll('a[href]').length,
          hasLabel: !!nav.getAttribute('aria-label') || !!nav.getAttribute('aria-labelledby')
        }))
      },
      breadcrumbs: {
        count: breadcrumbs.length,
        elements: Array.from(breadcrumbs).map(breadcrumb => ({
          linkCount: breadcrumb.querySelectorAll('a[href]').length,
          hasStructuredData: breadcrumb.querySelector('[typeof*="BreadcrumbList"]') !== null
        }))
      },
      menus: {
        count: menus.length,
        elements: Array.from(menus).map(menu => ({
          role: menu.getAttribute('role'),
          linkCount: menu.querySelectorAll('a[href]').length,
          hasSubmenu: menu.querySelector('[role="menu"]') !== null
        }))
      }
    };
  }

  /**
   * Detect external links and their properties
   * @param {Document} document - DOM document
   * @param {string} baseHost - Base hostname
   * @returns {Object} External link data
   * @private
   */
  _detectExternalLinks(document, baseHost) {
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const externalLinks = allLinks.filter(link => 
      this._isExternalLink(link.getAttribute('href'), baseHost)
    );

    return {
      count: externalLinks.length,
      totalLinks: allLinks.length,
      percentage: allLinks.length > 0 ? 
        Math.round((externalLinks.length / allLinks.length) * 100) : 0,
      links: externalLinks.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim(),
        domain: this._extractDomain(link.getAttribute('href')),
        hasNofollow: this._hasNofollow(link),
        hasNoopener: this._hasNoopener(link),
        hasNoreferrer: this._hasNoreferrer(link),
        target: link.getAttribute('target'),
        isSecure: this._isSecureLink(link.getAttribute('href'))
      })),
      domains: this._groupByDomain(externalLinks),
      security: this._analyzeExternalLinkSecurity(externalLinks)
    };
  }

  /**
   * Detect accessibility features of links
   * @param {Document} document - DOM document
   * @returns {Object} Accessibility data
   * @private
   */
  _detectAccessibilityFeatures(document) {
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    
    return {
      withAriaLabel: allLinks.filter(link => link.getAttribute('aria-label')).length,
      withTitle: allLinks.filter(link => link.getAttribute('title')).length,
      withDescribedBy: allLinks.filter(link => link.getAttribute('aria-describedby')).length,
      emptyText: allLinks.filter(link => link.textContent.trim().length === 0).length,
      imageOnly: allLinks.filter(link => 
        link.textContent.trim().length === 0 && link.querySelector('img')
      ).length,
      skipLinks: document.querySelectorAll('a[href^="#"]:first-child').length,
      focusable: allLinks.filter(link => link.getAttribute('tabindex') !== '-1').length,
      keyboard: {
        accessible: allLinks.filter(link => 
          !link.getAttribute('tabindex') || link.getAttribute('tabindex') !== '-1'
        ).length,
        customTabIndex: allLinks.filter(link => 
          link.getAttribute('tabindex') && link.getAttribute('tabindex') !== '0'
        ).length
      }
    };
  }

  /**
   * Detect link structure and organization
   * @param {Document} document - DOM document
   * @returns {Object} Link structure data
   * @private
   */
  _detectLinkStructure(document) {
    const headerLinks = document.querySelectorAll('header a[href]');
    const footerLinks = document.querySelectorAll('footer a[href]');
    const mainLinks = document.querySelectorAll('main a[href], [role="main"] a[href]');
    const sidebarLinks = document.querySelectorAll('aside a[href], .sidebar a[href]');
    
    return {
      header: {
        count: headerLinks.length,
        present: headerLinks.length > 0
      },
      footer: {
        count: footerLinks.length,
        present: footerLinks.length > 0
      },
      main: {
        count: mainLinks.length,
        present: mainLinks.length > 0
      },
      sidebar: {
        count: sidebarLinks.length,
        present: sidebarLinks.length > 0
      },
      distribution: this._analyzeLinkDistribution(document)
    };
  }

  // Helper methods

  /**
   * Check if link is external
   * @param {string} href - Link href
   * @param {string} baseHost - Base hostname
   * @returns {boolean} True if external
   * @private
   */
  _isExternalLink(href, baseHost) {
    if (!href || !baseHost) return false;
    
    try {
      // Handle relative links
      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
        return false;
      }
      
      // Handle protocol-relative links
      if (href.startsWith('//')) {
        href = 'https:' + href;
      }
      
      // Handle mailto, tel, etc.
      if (href.includes(':') && !href.startsWith('http')) {
        return true; // mailto, tel, etc. are considered external
      }
      
      const url = new URL(href, `https://${baseHost}`);
      return url.hostname !== baseHost;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if link is email
   * @param {string} href - Link href
   * @returns {boolean} True if email link
   * @private
   */
  _isEmailLink(href) {
    return href && href.startsWith('mailto:');
  }

  /**
   * Check if link is telephone
   * @param {string} href - Link href
   * @returns {boolean} True if tel link
   * @private
   */
  _isTelLink(href) {
    return href && href.startsWith('tel:');
  }

  /**
   * Check if link is hash/anchor
   * @param {string} href - Link href
   * @returns {boolean} True if hash link
   * @private
   */
  _isHashLink(href) {
    return href && href.startsWith('#');
  }

  /**
   * Check if link has protocol
   * @param {string} href - Link href
   * @returns {boolean} True if has protocol
   * @private
   */
  _hasProtocol(href) {
    return href && /^[a-z][a-z0-9+.-]*:/i.test(href);
  }

  /**
   * Extract link attributes
   * @param {Element} anchor - Anchor element
   * @returns {Object} Link attributes
   * @private
   */
  _extractLinkAttributes(anchor) {
    const attributes = {};
    
    // Important attributes to extract
    const importantAttrs = [
      'id', 'class', 'role', 'aria-label', 'aria-describedby',
      'tabindex', 'download', 'hreflang', 'type'
    ];
    
    importantAttrs.forEach(attr => {
      const value = anchor.getAttribute(attr);
      if (value !== null) {
        attributes[attr] = value;
      }
    });

    return attributes;
  }

  /**
   * Categorize links by type
   * @param {Array} links - Array of link data
   * @returns {Object} Categorized links
   * @private
   */
  _categorizeLinks(links) {
    return {
      external: links.filter(link => link.isExternal).length,
      internal: links.filter(link => !link.isExternal && !link.isEmail && !link.isTel).length,
      email: links.filter(link => link.isEmail).length,
      telephone: links.filter(link => link.isTel).length,
      hash: links.filter(link => link.isHash).length,
      empty: links.filter(link => link.isEmpty).length,
      withImages: links.filter(link => link.hasImage).length,
      withTitles: links.filter(link => link.hasTitle).length,
      newWindow: links.filter(link => link.target === '_blank').length
    };
  }

  /**
   * Extract domain from URL
   * @param {string} href - Link href
   * @returns {string|null} Domain
   * @private
   */
  _extractDomain(href) {
    try {
      const url = new URL(href);
      return url.hostname;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if link has nofollow
   * @param {Element} link - Link element
   * @returns {boolean} True if has nofollow
   * @private
   */
  _hasNofollow(link) {
    const rel = link.getAttribute('rel');
    return rel && rel.includes('nofollow');
  }

  /**
   * Check if link has noopener
   * @param {Element} link - Link element
   * @returns {boolean} True if has noopener
   * @private
   */
  _hasNoopener(link) {
    const rel = link.getAttribute('rel');
    return rel && rel.includes('noopener');
  }

  /**
   * Check if link has noreferrer
   * @param {Element} link - Link element
   * @returns {boolean} True if has noreferrer
   * @private
   */
  _hasNoreferrer(link) {
    const rel = link.getAttribute('rel');
    return rel && rel.includes('noreferrer');
  }

  /**
   * Check if link is secure (HTTPS)
   * @param {string} href - Link href
   * @returns {boolean} True if secure
   * @private
   */
  _isSecureLink(href) {
    return href && href.startsWith('https://');
  }

  /**
   * Group external links by domain
   * @param {Array} externalLinks - Array of external link elements
   * @returns {Object} Links grouped by domain
   * @private
   */
  _groupByDomain(externalLinks) {
    const domains = {};
    
    externalLinks.forEach(link => {
      const href = link.getAttribute('href');
      const domain = this._extractDomain(href);
      
      if (domain) {
        if (!domains[domain]) {
          domains[domain] = [];
        }
        domains[domain].push({
          href,
          text: link.textContent.trim()
        });
      }
    });

    return domains;
  }

  /**
   * Analyze security of external links
   * @param {Array} externalLinks - Array of external link elements
   * @returns {Object} Security analysis
   * @private
   */
  _analyzeExternalLinkSecurity(externalLinks) {
    const security = {
      withNofollow: 0,
      withNoopener: 0,
      withNoreferrer: 0,
      withAllSecurity: 0,
      secure: 0,
      insecure: 0
    };

    externalLinks.forEach(link => {
      const hasNofollow = this._hasNofollow(link);
      const hasNoopener = this._hasNoopener(link);
      const hasNoreferrer = this._hasNoreferrer(link);
      const isSecure = this._isSecureLink(link.getAttribute('href'));

      if (hasNofollow) security.withNofollow++;
      if (hasNoopener) security.withNoopener++;
      if (hasNoreferrer) security.withNoreferrer++;
      if (hasNofollow && hasNoopener && hasNoreferrer) security.withAllSecurity++;
      if (isSecure) security.secure++;
      else security.insecure++;
    });

    return security;
  }

  /**
   * Analyze link distribution across page sections
   * @param {Document} document - DOM document
   * @returns {Object} Distribution analysis
   * @private
   */
  _analyzeLinkDistribution(document) {
    const allLinks = document.querySelectorAll('a[href]');
    const contentLinks = document.querySelectorAll('main a[href], article a[href], .content a[href]');
    
    return {
      total: allLinks.length,
      inContent: contentLinks.length,
      contentPercentage: allLinks.length > 0 ? 
        Math.round((contentLinks.length / allLinks.length) * 100) : 0,
      density: this._calculateLinkDensity(document)
    };
  }

  /**
   * Calculate link density
   * @param {Document} document - DOM document
   * @returns {Object} Link density metrics
   * @private
   */
  _calculateLinkDensity(document) {
    const body = document.body || document.documentElement;
    const totalText = body.textContent.trim();
    const links = document.querySelectorAll('a[href]');
    
    let linkText = '';
    links.forEach(link => {
      linkText += link.textContent.trim() + ' ';
    });

    const totalWords = totalText.split(/\s+/).filter(word => word.length > 0).length;
    const linkWords = linkText.split(/\s+/).filter(word => word.length > 0).length;

    return {
      linkToTextRatio: totalWords > 0 ? Math.round((linkWords / totalWords) * 100) : 0,
      averageLinksPerPage: links.length,
      averageWordsPerLink: links.length > 0 ? Math.round(linkWords / links.length) : 0
    };
  }

  /**
   * Calculate overall statistics
   * @param {Object} results - Detection results
   * @returns {Object} Statistics
   * @private
   */
  _calculateStatistics(results) {
    const stats = {
      total: 0,
      categories: {},
      accessibility: {},
      security: {}
    };

    if (results.anchors) {
      stats.total = results.anchors.count;
      stats.categories = results.anchors.categories;
    }

    if (results.accessibility) {
      stats.accessibility = {
        emptyLinks: results.accessibility.emptyText,
        withAriaLabels: results.accessibility.withAriaLabel,
        accessibilityScore: this._calculateAccessibilityScore(results.accessibility)
      };
    }

    if (results.external) {
      stats.security = {
        externalCount: results.external.count,
        secureExternal: results.external.security.secure,
        securityScore: this._calculateSecurityScore(results.external.security)
      };
    }

    return stats;
  }

  /**
   * Calculate accessibility score
   * @param {Object} accessibility - Accessibility data
   * @returns {number} Accessibility score 0-100
   * @private
   */
  _calculateAccessibilityScore(accessibility) {
    const totalLinks = accessibility.focusable || 1;
    const issuePoints = accessibility.emptyText + accessibility.imageOnly;
    const positivePoints = accessibility.withAriaLabel + accessibility.withTitle;
    
    const score = Math.max(0, 100 - (issuePoints / totalLinks * 50) + (positivePoints / totalLinks * 25));
    return Math.round(score);
  }

  /**
   * Calculate security score for external links
   * @param {Object} security - Security data
   * @returns {number} Security score 0-100
   * @private
   */
  _calculateSecurityScore(security) {
    const total = security.withNofollow + security.withNoopener + security.withNoreferrer;
    if (total === 0) return 100; // No external links
    
    const secureCount = security.secure + security.withAllSecurity;
    return Math.round((secureCount / total) * 100);
  }
}

export default LinkDetector;
