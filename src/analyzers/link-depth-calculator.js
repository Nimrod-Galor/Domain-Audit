/**
 * Link Depth Calculator - Site Architecture Analysis
 * Calculates page depth using site-wide crawl data and link graph analysis
 * 
 * @fileoverview Determines page depth and site architecture patterns
 * @version 1.0.0
 * @author AI Assistant
 * @date 2025-08-02
 */

/**
 * Link depth analysis configuration
 */
export const DEPTH_CONFIG = {
  // Depth thresholds for analysis
  THRESHOLDS: {
    SHALLOW: 2,         // 0-2 clicks from home
    MEDIUM: 3,          // 3 clicks from home
    DEEP: 4,            // 4-5 clicks from home
    VERY_DEEP: 6        // 6+ clicks from home
  },

  // Page importance indicators
  IMPORTANCE_SIGNALS: {
    IN_MAIN_NAV: 50,        // Page linked from main navigation
    IN_FOOTER: 10,          // Page linked from footer
    MANY_INTERNAL_LINKS: 30, // Page has many incoming links
    HIGH_QUALITY_BACKLINKS: 40, // Page has quality external links
    CONVERSION_PAGE: 60,     // Product, service, or contact page
    CONTENT_HUB: 35         // Blog index, category pages
  },

  // URL patterns for page type detection
  URL_PATTERNS: {
    HOMEPAGE: [/^\/$/, /^\/index\.(html?|php)$/i, /^\/home$/i],
    PRODUCT: [/\/product/i, /\/item/i, /\/shop/i, /\/buy/i],
    CATEGORY: [/\/category/i, /\/collection/i, /\/series/i],
    BLOG: [/\/blog/i, /\/news/i, /\/article/i, /\/post/i],
    CONTACT: [/\/contact/i, /\/get-in-touch/i, /\/reach-us/i],
    ABOUT: [/\/about/i, /\/company/i, /\/team/i],
    LEGAL: [/\/privacy/i, /\/terms/i, /\/legal/i, /\/policy/i]
  }
};

/**
 * Link Depth Calculator Class
 */
export class LinkDepthCalculator {
  constructor(siteData = {}) {
    this.siteData = siteData;
    this.linkGraph = this._buildLinkGraph(siteData);
    this.depthMap = new Map();
    this.homepageUrl = this._findHomepage(siteData);
  }

  /**
   * Calculate depth for all pages using BFS from homepage
   * @returns {Map} Page URL to depth mapping
   */
  calculateAllDepths() {
    if (!this.homepageUrl) {
      console.warn('No homepage found, using URL-based depth calculation');
      return this._calculateUrlBasedDepths();
    }

    return this._calculateBFSDepths();
  }

  /**
   * Get depth analysis for a specific page
   * @param {string} pageUrl - Target page URL
   * @returns {Object} Comprehensive depth analysis
   */
  analyzePageDepth(pageUrl) {
    const allDepths = this.calculateAllDepths();
    const linkDepth = allDepths.get(pageUrl) || null;
    const urlDepth = this._calculateUrlDepth(pageUrl);
    
    const analysis = {
      pageUrl,
      linkDepth,
      urlDepth,
      estimatedDepth: linkDepth !== null ? linkDepth : urlDepth,
      depthCategory: this._categorizeDepth(linkDepth !== null ? linkDepth : urlDepth),
      
      // Path analysis
      pathToPage: this._findShortestPath(pageUrl),
      alternativePaths: this._findAlternativePaths(pageUrl),
      
      // Incoming links analysis
      incomingLinks: this._getIncomingLinks(pageUrl),
      linkAuthority: this._calculateLinkAuthority(pageUrl),
      
      // Page importance indicators
      importanceScore: this._calculateImportanceScore(pageUrl),
      pageType: this._detectPageType(pageUrl),
      
      // Issues and recommendations
      issues: [],
      recommendations: []
    };

    // Identify depth-related issues
    analysis.issues = this._identifyDepthIssues(analysis);
    analysis.recommendations = this._generateDepthRecommendations(analysis);

    return analysis;
  }

  /**
   * Build link graph from site data
   * @private
   */
  _buildLinkGraph(siteData) {
    const linkGraph = new Map();

    if (!siteData.pages || !Array.isArray(siteData.pages)) {
      return linkGraph;
    }

    // Initialize all pages in the graph
    siteData.pages.forEach(page => {
      if (page.url) {
        linkGraph.set(page.url, {
          outgoingLinks: new Set(),
          incomingLinks: new Set(),
          pageData: page
        });
      }
    });

    // Build connections
    siteData.pages.forEach(page => {
      if (page.url && page.analysis && page.analysis.links) {
        const pageNode = linkGraph.get(page.url);
        
        // Add outgoing links
        page.analysis.links.internal.forEach(link => {
          if (link.url && linkGraph.has(link.url)) {
            pageNode.outgoingLinks.add(link.url);
            linkGraph.get(link.url).incomingLinks.add(page.url);
          }
        });
      }
    });

    return linkGraph;
  }

  /**
   * Find the homepage URL
   * @private
   */
  _findHomepage(siteData) {
    if (!siteData.pages) return null;

    // Look for explicit homepage indicators
    const homepage = siteData.pages.find(page => {
      if (!page.url) return false;
      
      const url = new URL(page.url);
      const path = url.pathname;
      
      return DEPTH_CONFIG.URL_PATTERNS.HOMEPAGE.some(pattern => 
        pattern.test(path)
      );
    });

    if (homepage) return homepage.url;

    // Fallback: find page with most incoming links
    let maxIncomingLinks = 0;
    let homepageCandidate = null;

    this.linkGraph.forEach((node, url) => {
      if (node.incomingLinks.size > maxIncomingLinks) {
        maxIncomingLinks = node.incomingLinks.size;
        homepageCandidate = url;
      }
    });

    return homepageCandidate;
  }

  /**
   * Calculate depths using BFS from homepage
   * @private
   */
  _calculateBFSDepths() {
    const depths = new Map();
    const queue = [{ url: this.homepageUrl, depth: 0 }];
    const visited = new Set();

    depths.set(this.homepageUrl, 0);
    visited.add(this.homepageUrl);

    while (queue.length > 0) {
      const { url, depth } = queue.shift();
      const node = this.linkGraph.get(url);

      if (node) {
        // Add all outgoing links to queue
        node.outgoingLinks.forEach(linkedUrl => {
          if (!visited.has(linkedUrl)) {
            visited.add(linkedUrl);
            depths.set(linkedUrl, depth + 1);
            queue.push({ url: linkedUrl, depth: depth + 1 });
          }
        });
      }
    }

    return depths;
  }

  /**
   * Fallback: Calculate depths based on URL structure
   * @private
   */
  _calculateUrlBasedDepths() {
    const depths = new Map();

    this.linkGraph.forEach((node, url) => {
      depths.set(url, this._calculateUrlDepth(url));
    });

    return depths;
  }

  /**
   * Calculate URL-based depth
   * @private
   */
  _calculateUrlDepth(url) {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname
        .split('/')
        .filter(segment => segment.length > 0 && segment !== 'index.html' && segment !== 'index.php');
      
      return pathSegments.length;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Categorize depth level
   * @private
   */
  _categorizeDepth(depth) {
    if (depth <= DEPTH_CONFIG.THRESHOLDS.SHALLOW) return 'shallow';
    if (depth <= DEPTH_CONFIG.THRESHOLDS.MEDIUM) return 'medium';
    if (depth <= DEPTH_CONFIG.THRESHOLDS.DEEP) return 'deep';
    return 'very-deep';
  }

  /**
   * Find shortest path to page from homepage
   * @private
   */
  _findShortestPath(targetUrl) {
    if (!this.homepageUrl || !this.linkGraph.has(targetUrl)) {
      return [];
    }

    const queue = [{ url: this.homepageUrl, path: [this.homepageUrl] }];
    const visited = new Set([this.homepageUrl]);

    while (queue.length > 0) {
      const { url, path } = queue.shift();

      if (url === targetUrl) {
        return path;
      }

      const node = this.linkGraph.get(url);
      if (node) {
        node.outgoingLinks.forEach(linkedUrl => {
          if (!visited.has(linkedUrl)) {
            visited.add(linkedUrl);
            queue.push({
              url: linkedUrl,
              path: [...path, linkedUrl]
            });
          }
        });
      }
    }

    return []; // No path found
  }

  /**
   * Find alternative paths to page
   * @private
   */
  _findAlternativePaths(targetUrl, maxPaths = 3) {
    const allPaths = [];
    const visited = new Set();

    const dfs = (currentUrl, path, targetDepth) => {
      if (allPaths.length >= maxPaths || path.length > targetDepth + 2) {
        return;
      }

      if (currentUrl === targetUrl && path.length > 1) {
        allPaths.push([...path]);
        return;
      }

      const node = this.linkGraph.get(currentUrl);
      if (node) {
        node.outgoingLinks.forEach(linkedUrl => {
          if (!path.includes(linkedUrl)) {
            dfs(linkedUrl, [...path, linkedUrl], targetDepth);
          }
        });
      }
    };

    const shortestPath = this._findShortestPath(targetUrl);
    const targetDepth = shortestPath.length - 1;

    if (this.homepageUrl && targetDepth > 0) {
      dfs(this.homepageUrl, [this.homepageUrl], targetDepth);
    }

    // Remove the shortest path if it's in the results
    return allPaths.filter(path => 
      JSON.stringify(path) !== JSON.stringify(shortestPath)
    );
  }

  /**
   * Get incoming links for a page
   * @private
   */
  _getIncomingLinks(pageUrl) {
    const node = this.linkGraph.get(pageUrl);
    if (!node) return [];

    return Array.from(node.incomingLinks).map(sourceUrl => {
      const sourceNode = this.linkGraph.get(sourceUrl);
      return {
        sourceUrl,
        sourcePageData: sourceNode ? sourceNode.pageData : null,
        linkContext: this._getLinkContext(sourceUrl, pageUrl)
      };
    });
  }

  /**
   * Get link context between two pages
   * @private
   */
  _getLinkContext(sourceUrl, targetUrl) {
    const sourceNode = this.linkGraph.get(sourceUrl);
    if (!sourceNode || !sourceNode.pageData) return null;

    // Try to find the specific link in the page analysis
    const pageAnalysis = sourceNode.pageData.analysis;
    if (pageAnalysis && pageAnalysis.links && pageAnalysis.links.internal) {
      const linkData = pageAnalysis.links.internal.find(link => link.url === targetUrl);
      return linkData || null;
    }

    return null;
  }

  /**
   * Calculate link authority score for a page
   * @private
   */
  _calculateLinkAuthority(pageUrl) {
    const incomingLinks = this._getIncomingLinks(pageUrl);
    
    let authorityScore = 0;
    
    incomingLinks.forEach(link => {
      let linkValue = 10; // Base link value
      
      // Bonus for links from important pages
      const sourceDepth = this.depthMap.get(link.sourceUrl) || 0;
      if (sourceDepth === 0) linkValue += 20; // Homepage link
      else if (sourceDepth === 1) linkValue += 15; // Top-level page
      else if (sourceDepth === 2) linkValue += 10; // Second-level page
      
      // Bonus for descriptive anchor text
      if (link.linkContext && link.linkContext.anchorText) {
        const anchorLength = link.linkContext.anchorText.length;
        if (anchorLength > 10 && anchorLength < 60) linkValue += 5;
      }
      
      // Bonus for links from main content areas
      if (link.linkContext && link.linkContext.section === 'main') {
        linkValue += 5;
      }
      
      authorityScore += linkValue;
    });
    
    // Normalize to 0-100 scale
    return Math.min(100, authorityScore);
  }

  /**
   * Calculate page importance score
   * @private
   */
  _calculateImportanceScore(pageUrl) {
    let score = 0;
    const incomingLinks = this._getIncomingLinks(pageUrl);
    
    // Navigation links bonus
    const navLinks = incomingLinks.filter(link => 
      link.linkContext && link.linkContext.section === 'navigation'
    ).length;
    score += Math.min(navLinks * DEPTH_CONFIG.IMPORTANCE_SIGNALS.IN_MAIN_NAV, 100);
    
    // Footer links bonus
    const footerLinks = incomingLinks.filter(link => 
      link.linkContext && link.linkContext.section === 'footer'
    ).length;
    score += Math.min(footerLinks * DEPTH_CONFIG.IMPORTANCE_SIGNALS.IN_FOOTER, 30);
    
    // Many internal links bonus
    if (incomingLinks.length > 5) {
      score += DEPTH_CONFIG.IMPORTANCE_SIGNALS.MANY_INTERNAL_LINKS;
    }
    
    // Page type bonus
    const pageType = this._detectPageType(pageUrl);
    if (pageType === 'product' || pageType === 'contact') {
      score += DEPTH_CONFIG.IMPORTANCE_SIGNALS.CONVERSION_PAGE;
    } else if (pageType === 'category' || pageType === 'blog-index') {
      score += DEPTH_CONFIG.IMPORTANCE_SIGNALS.CONTENT_HUB;
    }
    
    return Math.min(100, score);
  }

  /**
   * Detect page type from URL patterns
   * @private
   */
  _detectPageType(pageUrl) {
    try {
      const url = new URL(pageUrl);
      const path = url.pathname.toLowerCase();
      
      for (const [type, patterns] of Object.entries(DEPTH_CONFIG.URL_PATTERNS)) {
        if (patterns.some(pattern => pattern.test(path))) {
          return type.toLowerCase();
        }
      }
      
      return 'content'; // Default
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Identify depth-related issues
   * @private
   */
  _identifyDepthIssues(analysis) {
    const issues = [];
    
    // Deep page issues
    if (analysis.estimatedDepth > DEPTH_CONFIG.THRESHOLDS.VERY_DEEP) {
      issues.push({
        type: 'very-deep-page',
        severity: 'high',
        message: `Page is ${analysis.estimatedDepth} clicks from homepage`,
        impact: 'Users and search engines may have difficulty finding this page'
      });
    } else if (analysis.estimatedDepth > DEPTH_CONFIG.THRESHOLDS.DEEP) {
      issues.push({
        type: 'deep-page',
        severity: 'medium',
        message: `Page is ${analysis.estimatedDepth} clicks from homepage`,
        impact: 'May receive less search engine crawling and user traffic'
      });
    }
    
    // Important page buried too deep
    if (analysis.importanceScore > 70 && analysis.estimatedDepth > DEPTH_CONFIG.THRESHOLDS.MEDIUM) {
      issues.push({
        type: 'important-page-deep',
        severity: 'high',
        message: `Important page (score: ${analysis.importanceScore}) is too deep`,
        impact: 'High-value content is not easily accessible'
      });
    }
    
    // Orphaned page (no incoming links)
    if (analysis.incomingLinks.length === 0 && analysis.estimatedDepth > 0) {
      issues.push({
        type: 'orphaned-page',
        severity: 'critical',
        message: 'Page has no incoming internal links',
        impact: 'Page is not discoverable through site navigation'
      });
    }
    
    // URL vs link depth mismatch
    if (Math.abs(analysis.urlDepth - (analysis.linkDepth || 0)) > 2) {
      issues.push({
        type: 'depth-mismatch',
        severity: 'low',
        message: 'URL structure does not match link hierarchy',
        impact: 'Confusing site architecture for users and search engines'
      });
    }
    
    // Few incoming links for depth
    if (analysis.estimatedDepth <= 2 && analysis.incomingLinks.length < 3) {
      issues.push({
        type: 'insufficient-internal-links',
        severity: 'medium',
        message: `Only ${analysis.incomingLinks.length} incoming links for a ${analysis.estimatedDepth}-level page`,
        impact: 'Page may not receive sufficient link equity'
      });
    }
    
    return issues;
  }

  /**
   * Generate depth-specific recommendations
   * @private
   */
  _generateDepthRecommendations(analysis) {
    const recommendations = [];
    
    analysis.issues.forEach(issue => {
      switch (issue.type) {
        case 'very-deep-page':
        case 'deep-page':
          recommendations.push({
            category: 'site-architecture',
            priority: issue.severity,
            title: 'Reduce Page Depth',
            description: issue.message,
            actions: [
              'Add links from higher-level pages',
              'Include in main navigation if important',
              'Create category/hub pages to bridge the gap',
              'Consider URL restructuring'
            ]
          });
          break;
          
        case 'important-page-deep':
          recommendations.push({
            category: 'site-architecture',
            priority: 'high',
            title: 'Promote Important Content',
            description: issue.message,
            actions: [
              'Add to main navigation menu',
              'Feature on homepage',
              'Link from other high-traffic pages',
              'Create dedicated landing pages'
            ]
          });
          break;
          
        case 'orphaned-page':
          recommendations.push({
            category: 'internal-linking',
            priority: 'critical',
            title: 'Fix Orphaned Page',
            description: issue.message,
            actions: [
              'Add internal links from relevant pages',
              'Include in sitemap navigation',
              'Add to related content sections',
              'Consider if page should exist'
            ]
          });
          break;
          
        case 'depth-mismatch':
          recommendations.push({
            category: 'url-structure',
            priority: 'low',
            title: 'Align URL with Site Hierarchy',
            description: issue.message,
            actions: [
              'Restructure URLs to match navigation',
              'Implement breadcrumb navigation',
              'Review internal linking strategy',
              'Consider 301 redirects if changing URLs'
            ]
          });
          break;
          
        case 'insufficient-internal-links':
          recommendations.push({
            category: 'internal-linking',
            priority: 'medium',
            title: 'Increase Internal Linking',
            description: issue.message,
            actions: [
              'Add contextual links from related content',
              'Include in relevant category pages',
              'Add to "related articles" sections',
              'Review content for linking opportunities'
            ]
          });
          break;
      }
    });
    
    // General recommendations based on analysis
    if (analysis.alternativePaths.length === 0 && analysis.estimatedDepth > 1) {
      recommendations.push({
        category: 'site-architecture',
        priority: 'medium',
        title: 'Create Alternative Navigation Paths',
        description: 'Page has only one path from homepage',
        actions: [
          'Add cross-links between related pages',
          'Implement tag/category navigation',
          'Add "you might also like" sections',
          'Create topic clusters with hub pages'
        ]
      });
    }
    
    if (analysis.linkAuthority < 30) {
      recommendations.push({
        category: 'link-equity',
        priority: 'medium',
        title: 'Improve Link Authority',
        description: `Low link authority score: ${analysis.linkAuthority}`,
        actions: [
          'Get links from higher-authority pages',
          'Improve anchor text quality',
          'Increase number of incoming links',
          'Link from main content areas'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Generate site-wide depth analysis
   * @returns {Object} Comprehensive site depth analysis
   */
  generateSiteDepthAnalysis() {
    const allDepths = this.calculateAllDepths();
    
    const analysis = {
      totalPages: allDepths.size,
      homepage: this.homepageUrl,
      depthDistribution: {},
      averageDepth: 0,
      maxDepth: 0,
      orphanedPages: [],
      deepPages: [],
      issues: [],
      recommendations: []
    };

    // Calculate distribution
    const depthCounts = {};
    let totalDepth = 0;
    
    allDepths.forEach((depth, url) => {
      depthCounts[depth] = (depthCounts[depth] || 0) + 1;
      totalDepth += depth;
      analysis.maxDepth = Math.max(analysis.maxDepth, depth);
      
      // Identify problematic pages
      if (depth === 0 && url !== this.homepageUrl) {
        analysis.orphanedPages.push(url);
      } else if (depth > DEPTH_CONFIG.THRESHOLDS.DEEP) {
        analysis.deepPages.push({ url, depth });
      }
    });

    // Calculate percentages
    Object.keys(depthCounts).forEach(depth => {
      analysis.depthDistribution[depth] = {
        count: depthCounts[depth],
        percentage: Math.round((depthCounts[depth] / analysis.totalPages) * 100)
      };
    });

    analysis.averageDepth = totalDepth / analysis.totalPages;

    // Site-wide issues
    if (analysis.orphanedPages.length > 0) {
      analysis.issues.push({
        type: 'site-orphans',
        severity: 'high',
        message: `${analysis.orphanedPages.length} orphaned pages found`,
        pages: analysis.orphanedPages.slice(0, 10)
      });
    }

    if (analysis.deepPages.length > analysis.totalPages * 0.2) {
      analysis.issues.push({
        type: 'many-deep-pages',
        severity: 'medium',
        message: `${analysis.deepPages.length} pages are deeper than ${DEPTH_CONFIG.THRESHOLDS.DEEP} clicks`,
        percentage: Math.round((analysis.deepPages.length / analysis.totalPages) * 100)
      });
    }

    if (analysis.averageDepth > 3) {
      analysis.issues.push({
        type: 'high-average-depth',
        severity: 'medium',
        message: `Average page depth is ${analysis.averageDepth.toFixed(1)} clicks`,
        impact: 'Site content may be difficult to discover'
      });
    }

    return analysis;
  }
}
