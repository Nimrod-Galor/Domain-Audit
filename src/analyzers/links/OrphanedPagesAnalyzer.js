/**
 * Orphaned Pages Detector - Site Architecture Analysis
 * Identifies pages with no incoming internal links and analyzes site connectivity
 * 
 * @fileoverview Detects orphaned pages and provides actionable recommendations
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-02
 */

/**
 * Orphan detection configuration
 */
export const ORPHAN_CONFIG = {
  // Pages that are typically linked from external sources
  EXTERNAL_ENTRY_PATTERNS: [
    /\/sitemap/i,
    /\/robots\.txt$/i,
    /\/\.well-known\//i,
    /\/feed/i,
    /\/rss/i,
    /\/api\//i,
    /\/admin/i,
    /\/login/i,
    /\/register/i,
    /\/404/i,
    /\/error/i,
    /\/maintenance/i
  ],

  // Pages that should never be orphaned
  CRITICAL_PAGES: [
    /^\/$/,                    // Homepage
    /\/about/i,                // About page
    /\/contact/i,              // Contact page
    /\/services/i,             // Services
    /\/products/i,             // Products
    /\/privacy/i,              // Privacy policy
    /\/terms/i                 // Terms of service
  ],

  // Page importance by type
  IMPORTANCE_WEIGHTS: {
    HOMEPAGE: 100,
    PRODUCT: 90,
    CATEGORY: 85,
    CONTACT: 80,
    ABOUT: 75,
    BLOG_POST: 60,
    LEGAL: 40,
    UTILITY: 20
  },

  // Thresholds for analysis
  THRESHOLDS: {
    MIN_LINKS_FOR_IMPORTANT: 3,    // Important pages should have at least 3 incoming links
    MAX_ORPHAN_PERCENTAGE: 5,      // Max 5% orphaned pages acceptable
    MIN_CONTENT_LENGTH: 500,       // Pages under 500 chars may be legitimately orphaned
    MAX_DAYS_SINCE_CRAWL: 30       // Consider pages crawled within 30 days
  }
};

/**
 * Orphaned Pages Detector Class
 */
export class OrphanedPagesDetector {
  constructor(siteData = {}) {
    this.siteData = siteData;
    this.linkGraph = this._buildLinkGraph(siteData);
    this.pageMetadata = this._extractPageMetadata(siteData);
  }

  /**
   * Comprehensive orphan analysis for the entire site
   * @returns {Object} Complete orphan analysis with recommendations
   */
  analyzeOrphanedPages() {
    const orphans = this._findOrphanedPages();
    const pseudoOrphans = this._findPseudoOrphanedPages();
    const criticalOrphans = this._findCriticalOrphans(orphans);
    
    const analysis = {
      // Basic statistics
      totalPages: this.linkGraph.size,
      orphanedPages: orphans.length,
      orphanPercentage: this._calculateOrphanPercentage(orphans.length),
      pseudoOrphans: pseudoOrphans.length,
      
      // Detailed orphan data
      orphans: orphans.map(url => this._analyzeOrphanPage(url)),
      pseudoOrphans: pseudoOrphans.map(url => this._analyzeOrphanPage(url)),
      criticalOrphans: criticalOrphans.map(url => this._analyzeOrphanPage(url)),
      
      // Link connectivity analysis
      connectivityAnalysis: this._analyzeConnectivity(),
      
      // Site health metrics
      siteHealthScore: 0,
      issues: [],
      recommendations: []
    };

    // Calculate site health score
    analysis.siteHealthScore = this._calculateSiteHealthScore(analysis);
    
    // Identify issues
    analysis.issues = this._identifyOrphanIssues(analysis);
    
    // Generate recommendations
    analysis.recommendations = this._generateOrphanRecommendations(analysis);
    
    return analysis;
  }

  /**
   * Analyze connectivity for a specific page
   * @param {string} pageUrl - Target page URL
   * @returns {Object} Page connectivity analysis
   */
  analyzePageConnectivity(pageUrl) {
    const incomingLinks = this._getIncomingLinks(pageUrl);
    const outgoingLinks = this._getOutgoingLinks(pageUrl);
    
    const analysis = {
      pageUrl,
      isOrphaned: incomingLinks.length === 0,
      isPseudoOrphaned: this._isPseudoOrphaned(pageUrl),
      isCritical: this._isCriticalPage(pageUrl),
      
      // Link analysis
      incomingLinks: incomingLinks.length,
      outgoingLinks: outgoingLinks.length,
      incomingLinksDetails: incomingLinks.map(link => this._analyzeLinkDetails(link)),
      outgoingLinksDetails: outgoingLinks.map(link => this._analyzeLinkDetails(link)),
      
      // Page characteristics
      pageImportance: this._calculatePageImportance(pageUrl),
      pageType: this._detectPageType(pageUrl),
      contentQuality: this._assessContentQuality(pageUrl),
      
      // Connectivity metrics
      linkDiversity: this._calculateLinkDiversity(incomingLinks),
      linkAuthority: this._calculateLinkAuthority(incomingLinks),
      isolationScore: this._calculateIsolationScore(pageUrl),
      
      // Issues and recommendations
      issues: [],
      recommendations: []
    };

    // Identify page-specific issues
    analysis.issues = this._identifyPageConnectivityIssues(analysis);
    
    // Generate page-specific recommendations
    analysis.recommendations = this._generatePageRecommendations(analysis);
    
    return analysis;
  }

  /**
   * Build comprehensive link graph
   * @private
   */
  _buildLinkGraph(siteData) {
    const linkGraph = new Map();

    if (!siteData.pages || !Array.isArray(siteData.pages)) {
      return linkGraph;
    }

    // Initialize all pages
    siteData.pages.forEach(page => {
      if (page.url) {
        linkGraph.set(page.url, {
          incomingLinks: new Set(),
          outgoingLinks: new Set(),
          pageData: page,
          lastCrawled: page.crawledAt || new Date().toISOString()
        });
      }
    });

    // Build link relationships
    siteData.pages.forEach(page => {
      if (page.url && page.analysis && page.analysis.links) {
        const currentNode = linkGraph.get(page.url);
        
        // Process internal links
        if (page.analysis.links.internal) {
          page.analysis.links.internal.forEach(link => {
            if (link.url && linkGraph.has(link.url)) {
              // Add outgoing link
              currentNode.outgoingLinks.add(link.url);
              
              // Add incoming link to target
              const targetNode = linkGraph.get(link.url);
              targetNode.incomingLinks.add(page.url);
            }
          });
        }
      }
    });

    return linkGraph;
  }

  /**
   * Extract page metadata for analysis
   * @private
   */
  _extractPageMetadata(siteData) {
    const metadata = new Map();

    if (!siteData.pages) return metadata;

    siteData.pages.forEach(page => {
      if (page.url) {
        metadata.set(page.url, {
          title: page.analysis?.seo?.title || '',
          description: page.analysis?.seo?.description || '',
          wordCount: page.analysis?.content?.wordCount || 0,
          headings: page.analysis?.content?.headings || [],
          hasImages: page.analysis?.media?.hasImages || false,
          hasVideo: page.analysis?.media?.hasVideo || false,
          lastModified: page.analysis?.technical?.lastModified || '',
          statusCode: page.statusCode || 200,
          responseTime: page.responseTime || 0,
          pageSize: page.pageSize || 0
        });
      }
    });

    return metadata;
  }

  /**
   * Find pages with no incoming internal links
   * @private
   */
  _findOrphanedPages() {
    const orphans = [];
    
    this.linkGraph.forEach((node, url) => {
      if (node.incomingLinks.size === 0 && !this._isExternalEntryPage(url)) {
        orphans.push(url);
      }
    });
    
    return orphans;
  }

  /**
   * Find pseudo-orphaned pages (very few incoming links)
   * @private
   */
  _findPseudoOrphanedPages() {
    const pseudoOrphans = [];
    
    this.linkGraph.forEach((node, url) => {
      if (this._isPseudoOrphaned(url)) {
        pseudoOrphans.push(url);
      }
    });
    
    return pseudoOrphans;
  }

  /**
   * Check if page is pseudo-orphaned
   * @private
   */
  _isPseudoOrphaned(url) {
    const node = this.linkGraph.get(url);
    if (!node) return false;
    
    const incomingCount = node.incomingLinks.size;
    const pageImportance = this._calculatePageImportance(url);
    
    // Important pages with very few incoming links
    if (pageImportance > 70 && incomingCount < ORPHAN_CONFIG.THRESHOLDS.MIN_LINKS_FOR_IMPORTANT) {
      return true;
    }
    
    // Pages with only 1-2 incoming links from low-authority pages
    if (incomingCount > 0 && incomingCount <= 2) {
      const incomingLinks = Array.from(node.incomingLinks);
      const hasHighAuthorityLink = incomingLinks.some(linkUrl => {
        const linkNode = this.linkGraph.get(linkUrl);
        return linkNode && linkNode.incomingLinks.size > 5; // Source has many incoming links
      });
      
      return !hasHighAuthorityLink;
    }
    
    return false;
  }

  /**
   * Find orphaned pages that are critical
   * @private
   */
  _findCriticalOrphans(orphans) {
    return orphans.filter(url => this._isCriticalPage(url));
  }

  /**
   * Check if page should never be orphaned
   * @private
   */
  _isCriticalPage(url) {
    return ORPHAN_CONFIG.CRITICAL_PAGES.some(pattern => pattern.test(url));
  }

  /**
   * Check if page is typically accessed externally
   * @private
   */
  _isExternalEntryPage(url) {
    return ORPHAN_CONFIG.EXTERNAL_ENTRY_PATTERNS.some(pattern => pattern.test(url));
  }

  /**
   * Analyze individual orphaned page
   * @private
   */
  _analyzeOrphanPage(url) {
    const node = this.linkGraph.get(url);
    const metadata = this.pageMetadata.get(url);
    
    return {
      url,
      pageType: this._detectPageType(url),
      importance: this._calculatePageImportance(url),
      isCritical: this._isCriticalPage(url),
      
      // Content analysis
      contentQuality: this._assessContentQuality(url),
      wordCount: metadata?.wordCount || 0,
      hasRichContent: this._hasRichContent(url),
      
      // Technical details
      statusCode: metadata?.statusCode || 200,
      responseTime: metadata?.responseTime || 0,
      lastCrawled: node?.lastCrawled || '',
      
      // Potential reasons for being orphaned
      possibleReasons: this._analyzePossibleReasons(url),
      
      // Link opportunities
      linkOpportunities: this._findLinkOpportunities(url),
      
      // Recommendations
      priority: this._calculateOrphanPriority(url),
      actions: this._generateOrphanActions(url)
    };
  }

  /**
   * Calculate page importance score
   * @private
   */
  _calculatePageImportance(url) {
    let score = 0;
    
    // Base score from page type
    const pageType = this._detectPageType(url);
    score += ORPHAN_CONFIG.IMPORTANCE_WEIGHTS[pageType.toUpperCase()] || 50;
    
    // Content quality bonus
    const contentQuality = this._assessContentQuality(url);
    score += contentQuality * 0.3;
    
    // URL structure bonus
    const urlDepth = this._calculateUrlDepth(url);
    score += Math.max(0, 20 - (urlDepth * 5));
    
    // Rich content bonus
    if (this._hasRichContent(url)) {
      score += 15;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Detect page type from URL and content
   * @private
   */
  _detectPageType(url) {
    const path = url.toLowerCase();
    
    if (/^\/$/.test(path)) return 'homepage';
    if (/\/product|\/item|\/shop/.test(path)) return 'product';
    if (/\/category|\/collection/.test(path)) return 'category';
    if (/\/blog|\/news|\/article/.test(path)) return 'blog_post';
    if (/\/contact/.test(path)) return 'contact';
    if (/\/about/.test(path)) return 'about';
    if (/\/privacy|\/terms|\/legal/.test(path)) return 'legal';
    if (/\/sitemap|\/search|\/login/.test(path)) return 'utility';
    
    return 'content';
  }

  /**
   * Assess content quality
   * @private
   */
  _assessContentQuality(url) {
    const metadata = this.pageMetadata.get(url);
    if (!metadata) return 50;
    
    let score = 50;
    
    // Word count scoring
    if (metadata.wordCount > 1000) score += 25;
    else if (metadata.wordCount > 500) score += 15;
    else if (metadata.wordCount > 200) score += 5;
    else if (metadata.wordCount < 100) score -= 20;
    
    // Title and description scoring
    if (metadata.title && metadata.title.length > 30) score += 10;
    if (metadata.description && metadata.description.length > 100) score += 10;
    
    // Heading structure
    if (metadata.headings && metadata.headings.length > 0) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Check if page has rich content
   * @private
   */
  _hasRichContent(url) {
    const metadata = this.pageMetadata.get(url);
    if (!metadata) return false;
    
    return metadata.hasImages || metadata.hasVideo || 
           metadata.wordCount > 800 || 
           (metadata.headings && metadata.headings.length > 3);
  }

  /**
   * Calculate URL depth
   * @private
   */
  _calculateUrlDepth(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').filter(segment => segment.length > 0).length;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Analyze possible reasons for orphaning
   * @private
   */
  _analyzePossibleReasons(url) {
    const reasons = [];
    const metadata = this.pageMetadata.get(url);
    
    // Content quality issues
    if (metadata && metadata.wordCount < ORPHAN_CONFIG.THRESHOLDS.MIN_CONTENT_LENGTH) {
      reasons.push({
        reason: 'low-content',
        description: `Low content volume (${metadata.wordCount} words)`,
        severity: 'medium'
      });
    }
    
    // Deep URL structure
    const urlDepth = this._calculateUrlDepth(url);
    if (urlDepth > 4) {
      reasons.push({
        reason: 'deep-url',
        description: `Deep URL structure (${urlDepth} levels)`,
        severity: 'medium'
      });
    }
    
    // Technical issues
    if (metadata && metadata.statusCode !== 200) {
      reasons.push({
        reason: 'technical-issue',
        description: `HTTP ${metadata.statusCode} status code`,
        severity: 'high'
      });
    }
    
    // Recently created
    if (metadata && metadata.lastModified) {
      const lastModified = new Date(metadata.lastModified);
      const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceModified < 7) {
        reasons.push({
          reason: 'recently-created',
          description: 'Page created recently, may not be linked yet',
          severity: 'low'
        });
      }
    }
    
    // Utility or system page
    if (this._isExternalEntryPage(url)) {
      reasons.push({
        reason: 'utility-page',
        description: 'System or utility page not meant for internal linking',
        severity: 'low'
      });
    }
    
    return reasons;
  }

  /**
   * Find potential linking opportunities
   * @private
   */
  _findLinkOpportunities(orphanUrl) {
    const opportunities = [];
    const orphanMetadata = this.pageMetadata.get(orphanUrl);
    const orphanType = this._detectPageType(orphanUrl);
    
    // Find related pages that could link to this orphan
    this.linkGraph.forEach((node, pageUrl) => {
      if (pageUrl === orphanUrl) return;
      
      const pageMetadata = this.pageMetadata.get(pageUrl);
      const pageType = this._detectPageType(pageUrl);
      
      // Skip if source page is also orphaned
      if (node.incomingLinks.size === 0) return;
      
      let relevanceScore = 0;
      let relationshipType = '';
      
      // Type-based relationships
      if (pageType === 'category' && orphanType === 'product') {
        relevanceScore += 40;
        relationshipType = 'category-product';
      } else if (pageType === 'homepage' && this._isCriticalPage(orphanUrl)) {
        relevanceScore += 35;
        relationshipType = 'homepage-critical';
      } else if (pageType === orphanType) {
        relevanceScore += 25;
        relationshipType = 'same-type';
      }
      
      // Content similarity (basic keyword matching)
      if (orphanMetadata && pageMetadata) {
        const orphanKeywords = this._extractKeywords(orphanMetadata.title + ' ' + orphanMetadata.description);
        const pageKeywords = this._extractKeywords(pageMetadata.title + ' ' + pageMetadata.description);
        
        const commonKeywords = orphanKeywords.filter(keyword => pageKeywords.includes(keyword));
        relevanceScore += commonKeywords.length * 5;
        
        if (commonKeywords.length > 0) {
          relationshipType = relationshipType || 'content-related';
        }
      }
      
      // URL structure similarity
      if (this._shareUrlPath(orphanUrl, pageUrl)) {
        relevanceScore += 15;
        relationshipType = relationshipType || 'path-related';
      }
      
      // Page authority (incoming links)
      const authorityBonus = Math.min(20, node.incomingLinks.size * 2);
      relevanceScore += authorityBonus;
      
      if (relevanceScore > 30) {
        opportunities.push({
          sourceUrl: pageUrl,
          relevanceScore,
          relationshipType,
          authority: node.incomingLinks.size,
          reason: this._generateLinkReason(relationshipType, relevanceScore)
        });
      }
    });
    
    // Sort by relevance and return top opportunities
    return opportunities
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }

  /**
   * Extract keywords from text
   * @private
   */
  _extractKeywords(text) {
    if (!text) return [];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this._isStopWord(word))
      .slice(0, 10);
  }

  /**
   * Check if word is a stop word
   * @private
   */
  _isStopWord(word) {
    const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'more', 'what'];
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Check if URLs share path structure
   * @private
   */
  _shareUrlPath(url1, url2) {
    try {
      const path1 = new URL(url1).pathname.split('/').slice(0, -1);
      const path2 = new URL(url2).pathname.split('/').slice(0, -1);
      
      // Check if they share at least 2 path segments
      const commonSegments = path1.filter(segment => path2.includes(segment));
      return commonSegments.length >= 2;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate linking reason
   * @private
   */
  _generateLinkReason(relationshipType, score) {
    const reasons = {
      'category-product': 'Category page should link to related products',
      'homepage-critical': 'Homepage should link to important pages',
      'same-type': 'Related pages of same type can cross-reference',
      'content-related': 'Pages share common topics and keywords',
      'path-related': 'Pages in same URL hierarchy should be connected'
    };
    
    return reasons[relationshipType] || `Relevance score: ${score}`;
  }

  /**
   * Get incoming links for a page
   * @private
   */
  _getIncomingLinks(url) {
    const node = this.linkGraph.get(url);
    return node ? Array.from(node.incomingLinks) : [];
  }

  /**
   * Get outgoing links for a page
   * @private
   */
  _getOutgoingLinks(url) {
    const node = this.linkGraph.get(url);
    return node ? Array.from(node.outgoingLinks) : [];
  }

  /**
   * Analyze link details
   * @private
   */
  _analyzeLinkDetails(linkUrl) {
    const node = this.linkGraph.get(linkUrl);
    const metadata = this.pageMetadata.get(linkUrl);
    
    return {
      url: linkUrl,
      authority: node ? node.incomingLinks.size : 0,
      pageType: this._detectPageType(linkUrl),
      title: metadata?.title || '',
      isOrphaned: node ? node.incomingLinks.size === 0 : true
    };
  }

  /**
   * Calculate link diversity score
   * @private
   */
  _calculateLinkDiversity(incomingLinks) {
    if (incomingLinks.length === 0) return 0;
    
    const linkTypes = incomingLinks.map(url => this._detectPageType(url));
    const uniqueTypes = new Set(linkTypes);
    
    return Math.min(100, (uniqueTypes.size / linkTypes.length) * 100);
  }

  /**
   * Calculate link authority score
   * @private
   */
  _calculateLinkAuthority(incomingLinks) {
    if (incomingLinks.length === 0) return 0;
    
    let totalAuthority = 0;
    
    incomingLinks.forEach(url => {
      const node = this.linkGraph.get(url);
      const linkAuthority = node ? node.incomingLinks.size : 0;
      totalAuthority += Math.min(20, linkAuthority); // Cap individual link authority
    });
    
    return Math.min(100, totalAuthority);
  }

  /**
   * Calculate isolation score
   * @private
   */
  _calculateIsolationScore(url) {
    const incomingLinks = this._getIncomingLinks(url);
    const outgoingLinks = this._getOutgoingLinks(url);
    
    let isolationScore = 100;
    
    // Reduce score based on connections
    isolationScore -= incomingLinks.length * 10;
    isolationScore -= outgoingLinks.length * 5;
    
    // Bonus reduction for high-quality connections
    const highQualityIncoming = incomingLinks.filter(linkUrl => {
      const node = this.linkGraph.get(linkUrl);
      return node && node.incomingLinks.size > 3;
    });
    
    isolationScore -= highQualityIncoming.length * 15;
    
    return Math.max(0, isolationScore);
  }

  /**
   * Analyze overall site connectivity
   * @private
   */
  _analyzeConnectivity() {
    const totalPages = this.linkGraph.size;
    let totalIncomingLinks = 0;
    let totalOutgoingLinks = 0;
    let connectedComponents = 0;
    let isolatedPages = 0;
    
    const linkDistribution = {};
    
    this.linkGraph.forEach((node, url) => {
      const incomingCount = node.incomingLinks.size;
      const outgoingCount = node.outgoingLinks.size;
      
      totalIncomingLinks += incomingCount;
      totalOutgoingLinks += outgoingCount;
      
      // Track link distribution
      linkDistribution[incomingCount] = (linkDistribution[incomingCount] || 0) + 1;
      
      // Count isolated pages
      if (incomingCount === 0 && outgoingCount === 0) {
        isolatedPages++;
      }
    });
    
    return {
      totalPages,
      averageIncomingLinks: totalIncomingLinks / totalPages,
      averageOutgoingLinks: totalOutgoingLinks / totalPages,
      linkDistribution,
      isolatedPages,
      connectivityRatio: (totalPages - isolatedPages) / totalPages,
      linkDensity: totalIncomingLinks / (totalPages * (totalPages - 1)) // Directed graph density
    };
  }

  /**
   * Calculate orphan percentage
   * @private
   */
  _calculateOrphanPercentage(orphanCount) {
    return Math.round((orphanCount / this.linkGraph.size) * 100);
  }

  /**
   * Calculate site health score
   * @private
   */
  _calculateSiteHealthScore(analysis) {
    let score = 100;
    
    // Orphan percentage penalty
    score -= analysis.orphanPercentage * 2;
    
    // Critical orphan penalty
    score -= analysis.criticalOrphans.length * 10;
    
    // Pseudo-orphan penalty
    score -= analysis.pseudoOrphans.length * 3;
    
    // Connectivity bonus/penalty
    const connectivity = analysis.connectivityAnalysis;
    if (connectivity.connectivityRatio < 0.9) {
      score -= 20;
    }
    
    if (connectivity.averageIncomingLinks < 2) {
      score -= 15;
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Identify orphan-related issues
   * @private
   */
  _identifyOrphanIssues(analysis) {
    const issues = [];
    
    // High orphan percentage
    if (analysis.orphanPercentage > ORPHAN_CONFIG.THRESHOLDS.MAX_ORPHAN_PERCENTAGE) {
      issues.push({
        type: 'high-orphan-percentage',
        severity: 'high',
        message: `${analysis.orphanPercentage}% of pages are orphaned (max recommended: ${ORPHAN_CONFIG.THRESHOLDS.MAX_ORPHAN_PERCENTAGE}%)`,
        count: analysis.orphanedPages,
        impact: 'Many pages are not discoverable through site navigation'
      });
    }
    
    // Critical pages orphaned
    if (analysis.criticalOrphans.length > 0) {
      issues.push({
        type: 'critical-pages-orphaned',
        severity: 'critical',
        message: `${analysis.criticalOrphans.length} critical pages are orphaned`,
        pages: analysis.criticalOrphans.slice(0, 5),
        impact: 'Important pages are not accessible to users or search engines'
      });
    }
    
    // Poor connectivity
    if (analysis.connectivityAnalysis.averageIncomingLinks < 2) {
      issues.push({
        type: 'poor-internal-linking',
        severity: 'medium',
        message: `Average ${analysis.connectivityAnalysis.averageIncomingLinks.toFixed(1)} incoming links per page`,
        impact: 'Weak internal linking structure affects SEO and user navigation'
      });
    }
    
    // High isolation
    if (analysis.connectivityAnalysis.isolatedPages > 0) {
      issues.push({
        type: 'isolated-pages',
        severity: 'high',
        message: `${analysis.connectivityAnalysis.isolatedPages} completely isolated pages`,
        impact: 'Pages have no internal links in either direction'
      });
    }
    
    // Many pseudo-orphans
    if (analysis.pseudoOrphans.length > analysis.totalPages * 0.1) {
      issues.push({
        type: 'many-pseudo-orphans',
        severity: 'medium',
        message: `${analysis.pseudoOrphans.length} pages are under-linked`,
        impact: 'Important content has insufficient internal linking'
      });
    }
    
    return issues;
  }

  /**
   * Generate orphan-specific recommendations
   * @private
   */
  _generateOrphanRecommendations(analysis) {
    const recommendations = [];
    
    // Address critical orphans first
    if (analysis.criticalOrphans.length > 0) {
      recommendations.push({
        category: 'critical-fixes',
        priority: 'critical',
        title: 'Fix Critical Orphaned Pages',
        description: `${analysis.criticalOrphans.length} critical pages need immediate attention`,
        actions: [
          'Add links from homepage to critical pages',
          'Include critical pages in main navigation',
          'Add footer links to important pages',
          'Create dedicated landing pages if needed'
        ],
        pages: analysis.criticalOrphans.slice(0, 3)
      });
    }
    
    // Improve overall linking strategy
    if (analysis.orphanPercentage > 10) {
      recommendations.push({
        category: 'internal-linking-strategy',
        priority: 'high',
        title: 'Implement Comprehensive Internal Linking Strategy',
        description: 'High number of orphaned pages indicates systemic linking issues',
        actions: [
          'Audit all orphaned pages for value and relevance',
          'Create category/hub pages to organize content',
          'Implement breadcrumb navigation',
          'Add "related content" sections to pages',
          'Use automated internal linking tools',
          'Regular content audit to identify linking opportunities'
        ]
      });
    }
    
    // Address pseudo-orphans
    if (analysis.pseudoOrphans.length > 0) {
      recommendations.push({
        category: 'link-equity-distribution',
        priority: 'medium',
        title: 'Improve Link Equity Distribution',
        description: 'Important pages have insufficient incoming links',
        actions: [
          'Identify high-value, under-linked content',
          'Add contextual links from related articles',
          'Feature important content in homepage sections',
          'Create topic clusters with hub pages',
          'Review and optimize existing link anchor text'
        ]
      });
    }
    
    // Site architecture improvements
    if (analysis.connectivityAnalysis.averageIncomingLinks < 3) {
      recommendations.push({
        category: 'site-architecture',
        priority: 'medium',
        title: 'Strengthen Site Architecture',
        description: 'Overall internal linking structure needs improvement',
        actions: [
          'Design clear information hierarchy',
          'Implement consistent navigation patterns',
          'Create pillar content with supporting pages',
          'Use faceted navigation for large content sets',
          'Implement tag-based content organization'
        ]
      });
    }
    
    // Content strategy recommendations
    recommendations.push({
      category: 'content-strategy',
      priority: 'low',
      title: 'Optimize Content for Discoverability',
      description: 'Prevent future orphaning through better content planning',
      actions: [
        'Plan internal linking during content creation',
        'Create content clusters around topics',
        'Regularly audit new content for linking opportunities',
        'Train content creators on internal linking best practices',
        'Use content templates that include related content sections'
      ]
    });
    
    return recommendations;
  }

  /**
   * Identify page-specific connectivity issues
   * @private
   */
  _identifyPageConnectivityIssues(analysis) {
    const issues = [];
    
    if (analysis.isOrphaned) {
      issues.push({
        type: 'orphaned',
        severity: analysis.isCritical ? 'critical' : 'high',
        message: 'Page has no incoming internal links'
      });
    }
    
    if (analysis.isPseudoOrphaned) {
      issues.push({
        type: 'pseudo-orphaned',
        severity: 'medium',
        message: 'Page has insufficient incoming links for its importance'
      });
    }
    
    if (analysis.linkDiversity < 30) {
      issues.push({
        type: 'low-link-diversity',
        severity: 'low',
        message: 'Incoming links come from similar page types'
      });
    }
    
    if (analysis.isolationScore > 70) {
      issues.push({
        type: 'highly-isolated',
        severity: 'medium',
        message: 'Page is poorly connected to the rest of the site'
      });
    }
    
    return issues;
  }

  /**
   * Generate page-specific recommendations
   * @private
   */
  _generatePageRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.isOrphaned || analysis.isPseudoOrphaned) {
      recommendations.push({
        category: 'link-building',
        priority: analysis.isCritical ? 'critical' : 'high',
        title: 'Add Internal Links',
        description: 'Page needs incoming internal links for discoverability',
        specificActions: analysis.linkOpportunities.map(opp => ({
          action: `Add link from ${opp.sourceUrl}`,
          reason: opp.reason,
          relevance: opp.relevanceScore
        }))
      });
    }
    
    if (analysis.contentQuality < 60) {
      recommendations.push({
        category: 'content-improvement',
        priority: 'medium',
        title: 'Improve Content Quality',
        description: 'Higher quality content attracts more internal links',
        actions: [
          'Expand content with more detailed information',
          'Add images, videos, or interactive elements',
          'Improve content structure with headings',
          'Optimize for target keywords',
          'Add examples and case studies'
        ]
      });
    }
    
    if (analysis.outgoingLinks < 3) {
      recommendations.push({
        category: 'internal-linking',
        priority: 'low',
        title: 'Add Outgoing Links',
        description: 'Link to related content to improve site connectivity',
        actions: [
          'Link to related articles or pages',
          'Add links to category or tag pages',
          'Reference authoritative internal sources',
          'Create "see also" sections'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate orphan priority for action
   * @private
   */
  _calculateOrphanPriority(url) {
    const importance = this._calculatePageImportance(url);
    const isCritical = this._isCriticalPage(url);
    const contentQuality = this._assessContentQuality(url);
    
    if (isCritical) return 'critical';
    if (importance > 80 || contentQuality > 80) return 'high';
    if (importance > 60 || contentQuality > 60) return 'medium';
    return 'low';
  }

  /**
   * Generate specific actions for orphaned page
   * @private
   */
  _generateOrphanActions(url) {
    const actions = [];
    const pageType = this._detectPageType(url);
    const importance = this._calculatePageImportance(url);
    
    // Type-specific actions
    if (pageType === 'product') {
      actions.push('Add to relevant category pages');
      actions.push('Include in product comparison tables');
      actions.push('Feature in related product sections');
    } else if (pageType === 'blog_post') {
      actions.push('Add to blog archive/category pages');
      actions.push('Include in "related articles" sections');
      actions.push('Link from newer posts on similar topics');
    } else if (this._isCriticalPage(url)) {
      actions.push('Add to main navigation menu');
      actions.push('Include in header or footer');
      actions.push('Feature prominently on homepage');
    }
    
    // General actions
    if (importance > 70) {
      actions.push('Add breadcrumb navigation');
      actions.push('Create dedicated landing page mentions');
    }
    
    actions.push('Review content for natural linking opportunities');
    actions.push('Consider if page should be merged with related content');
    
    return actions;
  }
}
