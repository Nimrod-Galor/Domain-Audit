/**
 * ============================================================================
 * WEBSITE ARCHITECTURE DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced website architecture analysis for technical optimization
 * Part of the Combined Approach Technical Analyzer (9th Implementation)
 * 
 * Features:
 * - URL structure and architecture analysis
 * - Navigation structure assessment
 * - Document semantic structure evaluation
 * - Link architecture optimization
 * - Information architecture validation
 * - Site hierarchy analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - GPT-5 Style Detector
 */

export class WebsiteArchitectureDetector {
  constructor(config = {}) {
    this.config = {
      enableUrlAnalysis: config.enableUrlAnalysis !== false,
      enableNavigationAnalysis: config.enableNavigationAnalysis !== false,
      enableSemanticAnalysis: config.enableSemanticAnalysis !== false,
      enableLinkAnalysis: config.enableLinkAnalysis !== false,
      maxLinkAnalysis: config.maxLinkAnalysis || 100,
      maxNavigationDepth: config.maxNavigationDepth || 5,
      detailedAnalysis: config.detailedAnalysis !== false,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'website_architecture';
    
    // Architecture standards and best practices
    this.standards = {
      url: {
        maxLength: 100,
        maxDepth: 3,
        recommendedStructure: /^[a-z0-9\-\/]+$/,
        avoidPatterns: ['?', '&', '%', '#'],
        seoFriendly: /^\/[a-z0-9\-\/]*$/
      },
      navigation: {
        maxMainItems: 7,
        maxDepth: 3,
        minBreadcrumbItems: 2,
        requiredElements: ['main navigation', 'footer navigation']
      },
      semantic: {
        requiredElements: ['header', 'main', 'footer'],
        recommendedElements: ['nav', 'article', 'section', 'aside'],
        headingStructure: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      links: {
        maxInternalDepth: 3,
        minInternalLinks: 2,
        maxExternalLinks: 10,
        avoidPatterns: ['javascript:', 'mailto:', 'tel:']
      }
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'WebsiteArchitectureDetector',
      version: this.version,
      type: this.detectorType,
      description: 'Analyzes website architecture for optimization and user experience',
      capabilities: [
        'url_structure_analysis',
        'navigation_assessment',
        'semantic_structure_evaluation',
        'link_architecture_optimization',
        'information_architecture_validation',
        'site_hierarchy_analysis'
      ],
      standards: Object.keys(this.standards),
      performance: 'High',
      accuracy: 'GPT-5 Enhanced'
    };
  }

  /**
   * Detect website architecture components
   * @param {Object} context - Analysis context containing document and metadata
   * @returns {Promise<Object>} Architecture detection results
   */
  async detect(context) {
    try {
      const { document, url, pageData } = context;
      
      if (!document) {
        throw new Error('Document is required for architecture analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(url);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: URL structure analysis
      const urlAnalysis = this._analyzeUrlStructure(url);

      // Phase 2: Navigation structure analysis
      const navigationAnalysis = this._analyzeNavigation(document);

      // Phase 3: Document semantic structure analysis
      const semanticAnalysis = this._analyzeSemanticStructure(document);

      // Phase 4: Link architecture analysis
      const linkAnalysis = this._analyzeLinkArchitecture(document, url);

      // Phase 5: Information architecture analysis
      const informationAnalysis = this._analyzeInformationArchitecture(document);

      // Phase 6: Site hierarchy analysis
      const hierarchyAnalysis = this._analyzeHierarchy(document, url);

      // Calculate overall architecture score
      const overallScore = this._calculateArchitectureScore({
        url: urlAnalysis,
        navigation: navigationAnalysis,
        semantic: semanticAnalysis,
        links: linkAnalysis,
        information: informationAnalysis,
        hierarchy: hierarchyAnalysis
      });

      // Compile comprehensive results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core analysis results
        url: urlAnalysis,
        navigation: navigationAnalysis,
        semantic: semanticAnalysis,
        links: linkAnalysis,
        information: informationAnalysis,
        hierarchy: hierarchyAnalysis,
        
        // Overall assessment
        score: overallScore.score,
        grade: overallScore.grade,
        level: overallScore.level,
        
        // Strategic insights
        insights: this._generateArchitectureInsights({
          url: urlAnalysis,
          navigation: navigationAnalysis,
          semantic: semanticAnalysis,
          links: linkAnalysis,
          information: informationAnalysis,
          hierarchy: hierarchyAnalysis
        }),
        
        recommendations: this._generateArchitectureRecommendations({
          url: urlAnalysis,
          navigation: navigationAnalysis,
          semantic: semanticAnalysis,
          links: linkAnalysis,
          information: informationAnalysis,
          hierarchy: hierarchyAnalysis
        }),
        
        // Performance metrics
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
        error: `Architecture detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Analyze URL structure
   * @param {string} url - Page URL
   * @returns {Object} URL analysis results
   */
  _analyzeUrlStructure(url) {
    const analysis = {
      structure: {},
      seoFriendly: false,
      issues: [],
      recommendations: []
    };

    try {
      if (!url) {
        analysis.issues.push('No URL provided for analysis');
        return { ...analysis, score: 0, grade: 'F' };
      }

      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const params = urlObj.searchParams;

      // Basic URL structure analysis
      analysis.structure = {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: pathname,
        parameters: Array.from(params.entries()),
        depth: pathname.split('/').filter(p => p.length > 0).length,
        length: url.length,
        hasTrailingSlash: pathname.endsWith('/'),
        hasFileExtension: /\.\w+$/.test(pathname)
      };

      // SEO-friendly URL check
      analysis.seoFriendly = this.standards.url.seoFriendly.test(pathname);

      // URL length check
      if (analysis.structure.length > this.standards.url.maxLength) {
        analysis.issues.push(`URL too long (${analysis.structure.length} characters)`);
        analysis.recommendations.push('Shorten URL for better user experience and SEO');
      }

      // URL depth check
      if (analysis.structure.depth > this.standards.url.maxDepth) {
        analysis.issues.push(`URL too deep (${analysis.structure.depth} levels)`);
        analysis.recommendations.push('Flatten URL structure for better navigation');
      }

      // Parameter analysis
      if (analysis.structure.parameters.length > 3) {
        analysis.issues.push('Too many URL parameters');
        analysis.recommendations.push('Minimize URL parameters for cleaner structure');
      }

      // SEO-friendly patterns
      if (!analysis.seoFriendly) {
        analysis.issues.push('URL contains non-SEO-friendly characters');
        analysis.recommendations.push('Use lowercase letters, numbers, and hyphens only');
      }

      // File extension check
      if (analysis.structure.hasFileExtension) {
        analysis.recommendations.push('Consider removing file extensions for cleaner URLs');
      }

      // HTTPS check
      if (analysis.structure.protocol !== 'https:') {
        analysis.issues.push('URL not using HTTPS protocol');
        analysis.recommendations.push('Migrate to HTTPS for security and SEO benefits');
      }

      // Calculate URL score
      const score = this._calculateUrlScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze navigation structure
   * @param {Document} document - DOM document
   * @returns {Object} Navigation analysis results
   */
  _analyzeNavigation(document) {
    const analysis = {
      main: { exists: false, items: [], depth: 0 },
      secondary: { exists: false, items: [], depth: 0 },
      breadcrumbs: { exists: false, items: [] },
      footer: { exists: false, items: [] },
      mobile: { exists: false, toggle: false },
      issues: [],
      recommendations: []
    };

    try {
      // Analyze main navigation
      const mainNav = document.querySelector('nav[role="navigation"], nav:first-of-type, .main-nav, #main-nav');
      if (mainNav) {
        analysis.main.exists = true;
        analysis.main.items = this._extractNavigationItems(mainNav);
        analysis.main.depth = this._calculateNavigationDepth(mainNav);
      } else {
        analysis.issues.push('No main navigation found');
        analysis.recommendations.push('Add clear main navigation structure');
      }

      // Analyze secondary navigation
      const secondaryNav = document.querySelectorAll('nav')[1];
      if (secondaryNav) {
        analysis.secondary.exists = true;
        analysis.secondary.items = this._extractNavigationItems(secondaryNav);
        analysis.secondary.depth = this._calculateNavigationDepth(secondaryNav);
      }

      // Analyze breadcrumbs
      const breadcrumbs = document.querySelector('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]');
      if (breadcrumbs) {
        analysis.breadcrumbs.exists = true;
        analysis.breadcrumbs.items = this._extractBreadcrumbItems(breadcrumbs);
      }

      // Analyze footer navigation
      const footerNav = document.querySelector('footer nav, .footer-nav');
      if (footerNav) {
        analysis.footer.exists = true;
        analysis.footer.items = this._extractNavigationItems(footerNav);
      }

      // Analyze mobile navigation
      const mobileToggle = document.querySelector('.menu-toggle, .nav-toggle, [aria-label*="menu"]');
      if (mobileToggle) {
        analysis.mobile.toggle = true;
        analysis.mobile.exists = true;
      }

      // Generate recommendations
      if (analysis.main.items.length > this.standards.navigation.maxMainItems) {
        analysis.issues.push(`Too many main navigation items (${analysis.main.items.length})`);
        analysis.recommendations.push('Consider grouping navigation items or using submenus');
      }

      if (analysis.main.depth > this.standards.navigation.maxDepth) {
        analysis.issues.push(`Navigation too deep (${analysis.main.depth} levels)`);
        analysis.recommendations.push('Flatten navigation structure for better usability');
      }

      if (!analysis.breadcrumbs.exists && analysis.main.depth > 2) {
        analysis.recommendations.push('Add breadcrumb navigation for complex site structure');
      }

      if (!analysis.mobile.toggle) {
        analysis.recommendations.push('Add mobile navigation toggle for responsive design');
      }

      // Calculate navigation score
      const score = this._calculateNavigationScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze semantic structure
   * @param {Document} document - DOM document
   * @returns {Object} Semantic analysis results
   */
  _analyzeSemanticStructure(document) {
    const analysis = {
      elements: {},
      headings: {},
      landmarks: {},
      microdata: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze semantic HTML5 elements
      this.standards.semantic.requiredElements.forEach(element => {
        const el = document.querySelector(element);
        analysis.elements[element] = {
          exists: !!el,
          count: document.querySelectorAll(element).length
        };
      });

      this.standards.semantic.recommendedElements.forEach(element => {
        const count = document.querySelectorAll(element).length;
        analysis.elements[element] = { exists: count > 0, count };
      });

      // Analyze heading structure
      analysis.headings = this._analyzeHeadingStructure(document);

      // Analyze ARIA landmarks
      analysis.landmarks = this._analyzeLandmarks(document);

      // Analyze microdata/structured data
      analysis.microdata = this._analyzeMicrodata(document);

      // Generate issues and recommendations
      this.standards.semantic.requiredElements.forEach(element => {
        if (!analysis.elements[element]?.exists) {
          analysis.issues.push(`Missing required ${element} element`);
          analysis.recommendations.push(`Add ${element} element for better semantic structure`);
        }
      });

      if (!analysis.headings.hasH1) {
        analysis.issues.push('Missing H1 heading');
        analysis.recommendations.push('Add H1 heading for page title');
      }

      if (analysis.headings.skippedLevels.length > 0) {
        analysis.issues.push('Heading levels skipped');
        analysis.recommendations.push('Use sequential heading levels for proper hierarchy');
      }

      // Calculate semantic score
      const score = this._calculateSemanticScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze link architecture
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Link analysis results
   */
  _analyzeLinkArchitecture(document, url) {
    const analysis = {
      internal: { count: 0, links: [], depth: {} },
      external: { count: 0, links: [], domains: [] },
      navigation: { count: 0, links: [] },
      content: { count: 0, links: [] },
      issues: [],
      recommendations: []
    };

    try {
      const links = document.querySelectorAll('a[href]');
      const baseUrl = new URL(url).origin;

      links.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        if (!href || href.startsWith('#')) return; // Skip anchors

        const linkData = {
          href,
          text,
          title: link.getAttribute('title'),
          rel: link.getAttribute('rel'),
          target: link.getAttribute('target')
        };

        try {
          const linkUrl = new URL(href, url);
          
          if (linkUrl.origin === baseUrl) {
            // Internal link
            analysis.internal.count++;
            analysis.internal.links.push(linkData);
            
            // Calculate depth
            const depth = linkUrl.pathname.split('/').filter(p => p.length > 0).length;
            analysis.internal.depth[depth] = (analysis.internal.depth[depth] || 0) + 1;
          } else {
            // External link
            analysis.external.count++;
            analysis.external.links.push(linkData);
            
            if (!analysis.external.domains.includes(linkUrl.hostname)) {
              analysis.external.domains.push(linkUrl.hostname);
            }
          }

          // Categorize by location
          const isInNav = link.closest('nav, .nav, #nav');
          if (isInNav) {
            analysis.navigation.count++;
            analysis.navigation.links.push(linkData);
          } else {
            analysis.content.count++;
            analysis.content.links.push(linkData);
          }

        } catch (error) {
          // Invalid URL
          analysis.issues.push(`Invalid link URL: ${href}`);
        }
      });

      // Generate recommendations
      if (analysis.internal.count < this.standards.links.minInternalLinks) {
        analysis.recommendations.push('Add more internal links for better site connectivity');
      }

      if (analysis.external.count > this.standards.links.maxExternalLinks) {
        analysis.issues.push(`Too many external links (${analysis.external.count})`);
        analysis.recommendations.push('Consider reducing external links or using nofollow');
      }

      const maxDepth = Math.max(...Object.keys(analysis.internal.depth).map(Number));
      if (maxDepth > this.standards.links.maxInternalDepth) {
        analysis.issues.push(`Links pointing to deep pages (depth ${maxDepth})`);
        analysis.recommendations.push('Consider flattening site structure');
      }

      // Check for empty link text
      const emptyLinks = [...analysis.internal.links, ...analysis.external.links]
        .filter(link => !link.text || link.text.length < 3);
      
      if (emptyLinks.length > 0) {
        analysis.issues.push('Links with insufficient descriptive text');
        analysis.recommendations.push('Add descriptive text to all links');
      }

      // Calculate link score
      const score = this._calculateLinkScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze information architecture
   * @param {Document} document - DOM document
   * @returns {Object} Information architecture analysis
   */
  _analyzeInformationArchitecture(document) {
    const analysis = {
      contentSections: 0,
      contentHierarchy: {},
      contentTypes: {},
      accessibility: {},
      issues: [],
      recommendations: []
    };

    try {
      // Analyze content sections
      const sections = document.querySelectorAll('section, article, .content-section');
      analysis.contentSections = sections.length;

      // Analyze content hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const level = heading.tagName.toLowerCase();
        analysis.contentHierarchy[level] = (analysis.contentHierarchy[level] || 0) + 1;
      });

      // Analyze content types
      analysis.contentTypes = {
        paragraphs: document.querySelectorAll('p').length,
        lists: document.querySelectorAll('ul, ol').length,
        tables: document.querySelectorAll('table').length,
        forms: document.querySelectorAll('form').length,
        images: document.querySelectorAll('img').length,
        videos: document.querySelectorAll('video').length
      };

      // Analyze accessibility features
      analysis.accessibility = {
        altText: this._calculateAltTextCoverage(document),
        labels: this._calculateLabelCoverage(document),
        skipLinks: document.querySelectorAll('a[href="#main"], .skip-link').length > 0,
        landmarks: document.querySelectorAll('[role]').length
      };

      // Generate recommendations
      if (analysis.contentSections === 0) {
        analysis.recommendations.push('Use section or article elements for content organization');
      }

      if (!analysis.contentHierarchy.h1) {
        analysis.issues.push('Missing H1 heading for main content');
        analysis.recommendations.push('Add H1 heading to define main topic');
      }

      if (analysis.accessibility.altText < 0.9) {
        analysis.issues.push('Insufficient alt text coverage for images');
        analysis.recommendations.push('Add alt text to all informative images');
      }

      if (!analysis.accessibility.skipLinks) {
        analysis.recommendations.push('Add skip links for better keyboard navigation');
      }

      // Calculate information architecture score
      const score = this._calculateInformationScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  /**
   * Analyze site hierarchy
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Hierarchy analysis results
   */
  _analyzeHierarchy(document, url) {
    const analysis = {
      pageLevel: 0,
      parentPages: [],
      childPages: [],
      siblings: [],
      breadcrumbPath: [],
      issues: [],
      recommendations: []
    };

    try {
      // Determine page level from URL
      if (url) {
        const urlObj = new URL(url);
        analysis.pageLevel = urlObj.pathname.split('/').filter(p => p.length > 0).length;
      }

      // Analyze breadcrumb path
      const breadcrumbs = document.querySelector('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]');
      if (breadcrumbs) {
        analysis.breadcrumbPath = this._extractBreadcrumbItems(breadcrumbs);
      }

      // Extract potential hierarchy from navigation
      const navLinks = document.querySelectorAll('nav a[href]');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          const depth = href.split('/').filter(p => p.length > 0).length;
          
          if (depth === analysis.pageLevel - 1) {
            analysis.parentPages.push({
              text: link.textContent.trim(),
              href: href
            });
          } else if (depth === analysis.pageLevel + 1) {
            analysis.childPages.push({
              text: link.textContent.trim(),
              href: href
            });
          } else if (depth === analysis.pageLevel) {
            analysis.siblings.push({
              text: link.textContent.trim(),
              href: href
            });
          }
        }
      });

      // Generate recommendations
      if (analysis.pageLevel > 3) {
        analysis.issues.push(`Page is deep in hierarchy (level ${analysis.pageLevel})`);
        analysis.recommendations.push('Consider flattening site structure');
      }

      if (analysis.breadcrumbPath.length === 0 && analysis.pageLevel > 1) {
        analysis.recommendations.push('Add breadcrumb navigation for better orientation');
      }

      if (analysis.parentPages.length === 0 && analysis.pageLevel > 1) {
        analysis.recommendations.push('Ensure parent page links are available');
      }

      // Calculate hierarchy score
      const score = this._calculateHierarchyScore(analysis);
      analysis.score = score;
      analysis.grade = this._calculateGrade(score);

    } catch (error) {
      analysis.error = error.message;
      analysis.score = 0;
      analysis.grade = 'F';
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _extractNavigationItems(nav) {
    const items = [];
    const links = nav.querySelectorAll('a[href]');
    
    links.forEach(link => {
      items.push({
        text: link.textContent.trim(),
        href: link.getAttribute('href'),
        hasSubmenu: !!link.parentElement.querySelector('ul, .submenu')
      });
    });
    
    return items;
  }

  _calculateNavigationDepth(nav) {
    let maxDepth = 1;
    const nestedLists = nav.querySelectorAll('ul ul, ol ol');
    
    nestedLists.forEach(list => {
      let depth = 1;
      let parent = list.parentElement;
      
      while (parent && parent !== nav) {
        if (parent.tagName === 'UL' || parent.tagName === 'OL') {
          depth++;
        }
        parent = parent.parentElement;
      }
      
      maxDepth = Math.max(maxDepth, depth);
    });
    
    return maxDepth;
  }

  _extractBreadcrumbItems(breadcrumb) {
    const items = [];
    const links = breadcrumb.querySelectorAll('a, span');
    
    links.forEach(item => {
      const text = item.textContent.trim();
      if (text) {
        items.push({
          text: text,
          href: item.getAttribute('href'),
          isCurrent: item.hasAttribute('aria-current')
        });
      }
    });
    
    return items;
  }

  _analyzeHeadingStructure(document) {
    const headings = {
      h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0
    };
    
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach(heading => {
      headings[heading.tagName.toLowerCase()]++;
    });
    
    // Check for skipped levels
    const skippedLevels = [];
    const levels = [headings.h1, headings.h2, headings.h3, headings.h4, headings.h5, headings.h6];
    
    let foundFirst = false;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i] > 0) {
        if (!foundFirst) {
          foundFirst = true;
        }
      } else if (foundFirst) {
        // Check if there are headings after this level
        const hasLater = levels.slice(i + 1).some(count => count > 0);
        if (hasLater) {
          skippedLevels.push(`h${i + 1}`);
        }
      }
    }
    
    return {
      ...headings,
      hasH1: headings.h1 > 0,
      multipleH1: headings.h1 > 1,
      skippedLevels
    };
  }

  _analyzeLandmarks(document) {
    const landmarks = {};
    const landmarkElements = document.querySelectorAll('[role]');
    
    landmarkElements.forEach(element => {
      const role = element.getAttribute('role');
      landmarks[role] = (landmarks[role] || 0) + 1;
    });
    
    return landmarks;
  }

  _analyzeMicrodata(document) {
    return {
      hasJsonLd: document.querySelectorAll('script[type="application/ld+json"]').length > 0,
      hasMicrodata: document.querySelectorAll('[itemscope]').length > 0,
      hasRdfa: document.querySelectorAll('[typeof]').length > 0
    };
  }

  _calculateAltTextCoverage(document) {
    const images = document.querySelectorAll('img');
    if (images.length === 0) return 1;
    
    const imagesWithAlt = document.querySelectorAll('img[alt]');
    return imagesWithAlt.length / images.length;
  }

  _calculateLabelCoverage(document) {
    const inputs = document.querySelectorAll('input, select, textarea');
    if (inputs.length === 0) return 1;
    
    let labeledInputs = 0;
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      
      if (hasLabel || hasAriaLabel) {
        labeledInputs++;
      }
    });
    
    return labeledInputs / inputs.length;
  }

  _calculateArchitectureScore(components) {
    const weights = {
      url: 0.20,
      navigation: 0.25,
      semantic: 0.20,
      links: 0.15,
      information: 0.10,
      hierarchy: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([component, weight]) => {
      if (components[component] && components[component].score !== undefined) {
        totalScore += components[component].score * weight;
        totalWeight += weight;
      }
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const grade = this._calculateGrade(score);
    const level = this._categorizeLevel(score);

    return { score, grade, level };
  }

  _calculateUrlScore(analysis) {
    let score = 100;
    
    score -= analysis.issues.length * 15;
    
    if (analysis.seoFriendly) score += 10;
    if (analysis.structure.protocol === 'https:') score += 10;
    if (analysis.structure.depth <= 2) score += 5;
    if (analysis.structure.length <= 60) score += 5;
    
    return Math.max(0, score);
  }

  _calculateNavigationScore(analysis) {
    let score = 80; // Base score
    
    if (analysis.main.exists) score += 20;
    if (analysis.breadcrumbs.exists) score += 10;
    if (analysis.mobile.toggle) score += 10;
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateSemanticScore(analysis) {
    let score = 60; // Base score
    
    // Required elements
    this.standards.semantic.requiredElements.forEach(element => {
      if (analysis.elements[element]?.exists) score += 10;
    });
    
    // Heading structure
    if (analysis.headings.hasH1) score += 10;
    if (analysis.headings.skippedLevels.length === 0) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateLinkScore(analysis) {
    let score = 70; // Base score
    
    if (analysis.internal.count >= 2) score += 15;
    if (analysis.external.count <= 10) score += 10;
    if (Object.keys(analysis.internal.depth).length <= 3) score += 5;
    
    score -= analysis.issues.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateInformationScore(analysis) {
    let score = 60; // Base score
    
    if (analysis.contentSections > 0) score += 15;
    if (analysis.contentHierarchy.h1) score += 10;
    if (analysis.accessibility.altText >= 0.9) score += 10;
    if (analysis.accessibility.skipLinks) score += 5;
    
    score -= analysis.issues.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  _calculateHierarchyScore(analysis) {
    let score = 80; // Base score
    
    if (analysis.pageLevel <= 3) score += 10;
    if (analysis.breadcrumbPath.length > 0) score += 10;
    
    score -= analysis.issues.length * 15;
    
    return Math.max(0, Math.min(100, score));
  }

  _generateArchitectureInsights(components) {
    const insights = [];
    
    // URL insights
    if (components.url.seoFriendly) {
      insights.push({
        type: 'positive',
        category: 'url',
        message: 'URL structure is SEO-friendly',
        impact: 'medium'
      });
    }
    
    // Navigation insights
    if (components.navigation.main.exists && components.navigation.main.items.length <= 7) {
      insights.push({
        type: 'positive',
        category: 'navigation',
        message: 'Main navigation has optimal number of items',
        impact: 'high'
      });
    }
    
    // Semantic insights
    if (components.semantic.elements.main?.exists) {
      insights.push({
        type: 'positive',
        category: 'semantic',
        message: 'Proper semantic HTML structure detected',
        impact: 'high'
      });
    }
    
    return insights;
  }

  _generateArchitectureRecommendations(components) {
    const recommendations = [];
    
    // Collect all component recommendations
    Object.values(components).forEach(component => {
      if (component.recommendations) {
        recommendations.push(...component.recommendations.map(rec => ({
          text: rec,
          category: 'architecture',
          priority: 'medium',
          complexity: 'medium'
        })));
      }
    });
    
    return recommendations.slice(0, 15); // Limit recommendations
  }

  _calculateGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  }

  _categorizeLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }

  _generateCacheKey(url) {
    return btoa(url || 'unknown').slice(0, 20);
  }
}

export default WebsiteArchitectureDetector;
