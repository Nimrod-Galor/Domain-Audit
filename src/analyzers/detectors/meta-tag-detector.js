/**
 * ============================================================================
 * META TAG DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Comprehensive meta tag analysis and optimization detector
 * Part of the Combined Approach modernization pattern
 * 
 * Features:
 * - Essential meta tags detection and validation
 * - Open Graph and Twitter Cards analysis
 * - Meta tag quality assessment
 * - SEO optimization recommendations
 * - Structured meta data validation
 * 
 * @version 1.0.0
 * @author Development Team
 */

export class MetaTagDetector {
  constructor() {
    this.detectorName = 'MetaTagDetector';
    this.version = '1.0.0';
  }

  /**
   * Detect and analyze meta tags
   * @param {Document} document - The HTML document
   * @param {string} url - Page URL
   * @returns {Object} Meta tag analysis results
   */
  detectMetaTags(document, url) {
    try {
      const metaTags = this._extractMetaTags(document);
      const analysis = this._analyzeMetaTags(metaTags, url);
      
      return {
        success: true,
        metaTags,
        analysis,
        recommendations: this._generateRecommendations(analysis),
        score: this._calculateMetaScore(analysis)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metaTags: {},
        analysis: {},
        recommendations: [],
        score: 0
      };
    }
  }

  /**
   * Extract all meta tags from document
   * @private
   */
  _extractMetaTags(document) {
    const metaTags = {
      title: document.title || '',
      description: '',
      keywords: '',
      robots: '',
      viewport: '',
      charset: '',
      openGraph: {},
      twitterCards: {},
      other: []
    };

    // Extract meta tags
    const metas = document.querySelectorAll('meta');
    metas.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
      const content = meta.getAttribute('content') || '';

      if (name) {
        switch (name.toLowerCase()) {
          case 'description':
            metaTags.description = content;
            break;
          case 'keywords':
            metaTags.keywords = content;
            break;
          case 'robots':
            metaTags.robots = content;
            break;
          case 'viewport':
            metaTags.viewport = content;
            break;
          case 'charset':
          case 'content-type':
            metaTags.charset = content;
            break;
          default:
            if (name.startsWith('og:')) {
              metaTags.openGraph[name] = content;
            } else if (name.startsWith('twitter:')) {
              metaTags.twitterCards[name] = content;
            } else {
              metaTags.other.push({ name, content });
            }
        }
      }
    });

    return metaTags;
  }

  /**
   * Analyze meta tag quality and completeness
   * @private
   */
  _analyzeMetaTags(metaTags, url) {
    return {
      title: this._analyzeTitleTag(metaTags.title),
      description: this._analyzeDescriptionTag(metaTags.description),
      viewport: this._analyzeViewportTag(metaTags.viewport),
      robots: this._analyzeRobotsTag(metaTags.robots),
      openGraph: this._analyzeOpenGraph(metaTags.openGraph),
      twitterCards: this._analyzeTwitterCards(metaTags.twitterCards),
      completeness: this._assessCompleteness(metaTags)
    };
  }

  /**
   * Analyze title tag
   * @private
   */
  _analyzeTitleTag(title) {
    return {
      present: !!title,
      length: title.length,
      optimal: title.length >= 30 && title.length <= 60,
      unique: true, // Would need additional context to determine
      descriptive: title.length > 10,
      issues: this._getTitleIssues(title)
    };
  }

  /**
   * Analyze description meta tag
   * @private
   */
  _analyzeDescriptionTag(description) {
    return {
      present: !!description,
      length: description.length,
      optimal: description.length >= 120 && description.length <= 160,
      descriptive: description.length > 50,
      issues: this._getDescriptionIssues(description)
    };
  }

  /**
   * Analyze viewport meta tag
   * @private
   */
  _analyzeViewportTag(viewport) {
    return {
      present: !!viewport,
      mobileOptimized: viewport.includes('width=device-width'),
      responsive: viewport.includes('initial-scale=1'),
      issues: this._getViewportIssues(viewport)
    };
  }

  /**
   * Analyze robots meta tag
   * @private
   */
  _analyzeRobotsTag(robots) {
    return {
      present: !!robots,
      indexable: !robots.includes('noindex'),
      followable: !robots.includes('nofollow'),
      directives: robots.split(',').map(d => d.trim()),
      issues: this._getRobotsIssues(robots)
    };
  }

  /**
   * Analyze Open Graph tags
   * @private
   */
  _analyzeOpenGraph(openGraph) {
    const requiredTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const present = requiredTags.filter(tag => openGraph[tag]);
    
    return {
      complete: present.length === requiredTags.length,
      present: present.length,
      total: requiredTags.length,
      tags: openGraph,
      issues: this._getOpenGraphIssues(openGraph)
    };
  }

  /**
   * Analyze Twitter Cards
   * @private
   */
  _analyzeTwitterCards(twitterCards) {
    return {
      present: Object.keys(twitterCards).length > 0,
      cardType: twitterCards['twitter:card'] || 'none',
      complete: !!(twitterCards['twitter:title'] && twitterCards['twitter:description']),
      tags: twitterCards,
      issues: this._getTwitterCardsIssues(twitterCards)
    };
  }

  /**
   * Assess overall meta tag completeness
   * @private
   */
  _assessCompleteness(metaTags) {
    const essentialTags = ['title', 'description', 'viewport'];
    const present = essentialTags.filter(tag => metaTags[tag]);
    
    return {
      score: (present.length / essentialTags.length) * 100,
      present: present.length,
      total: essentialTags.length,
      missing: essentialTags.filter(tag => !metaTags[tag])
    };
  }

  /**
   * Get title tag issues
   * @private
   */
  _getTitleIssues(title) {
    const issues = [];
    if (!title) issues.push('Missing title tag');
    if (title.length < 30) issues.push('Title too short');
    if (title.length > 60) issues.push('Title too long');
    return issues;
  }

  /**
   * Get description tag issues
   * @private
   */
  _getDescriptionIssues(description) {
    const issues = [];
    if (!description) issues.push('Missing meta description');
    if (description.length < 120) issues.push('Description too short');
    if (description.length > 160) issues.push('Description too long');
    return issues;
  }

  /**
   * Get viewport tag issues
   * @private
   */
  _getViewportIssues(viewport) {
    const issues = [];
    if (!viewport) issues.push('Missing viewport meta tag');
    if (!viewport.includes('width=device-width')) issues.push('Not mobile optimized');
    return issues;
  }

  /**
   * Get robots tag issues
   * @private
   */
  _getRobotsIssues(robots) {
    const issues = [];
    if (robots.includes('noindex')) issues.push('Page set to noindex');
    if (robots.includes('nofollow')) issues.push('Page set to nofollow');
    return issues;
  }

  /**
   * Get Open Graph issues
   * @private
   */
  _getOpenGraphIssues(openGraph) {
    const issues = [];
    const required = ['og:title', 'og:description', 'og:image', 'og:url'];
    required.forEach(tag => {
      if (!openGraph[tag]) issues.push(`Missing ${tag}`);
    });
    return issues;
  }

  /**
   * Get Twitter Cards issues
   * @private
   */
  _getTwitterCardsIssues(twitterCards) {
    const issues = [];
    if (!twitterCards['twitter:card']) issues.push('Missing twitter:card');
    if (!twitterCards['twitter:title']) issues.push('Missing twitter:title');
    if (!twitterCards['twitter:description']) issues.push('Missing twitter:description');
    return issues;
  }

  /**
   * Generate optimization recommendations
   * @private
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    if (!analysis.title.optimal) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        message: 'Optimize title tag length (30-60 characters)'
      });
    }

    if (!analysis.description.optimal) {
      recommendations.push({
        type: 'description',
        priority: 'high',
        message: 'Optimize meta description length (120-160 characters)'
      });
    }

    if (!analysis.viewport.present) {
      recommendations.push({
        type: 'viewport',
        priority: 'high',
        message: 'Add responsive viewport meta tag'
      });
    }

    if (!analysis.openGraph.complete) {
      recommendations.push({
        type: 'openGraph',
        priority: 'medium',
        message: 'Complete Open Graph tags for social sharing'
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall meta tag score
   * @private
   */
  _calculateMetaScore(analysis) {
    let score = 0;
    let maxScore = 0;

    // Title score (25 points)
    maxScore += 25;
    if (analysis.title.present) score += 10;
    if (analysis.title.optimal) score += 15;

    // Description score (25 points)
    maxScore += 25;
    if (analysis.description.present) score += 10;
    if (analysis.description.optimal) score += 15;

    // Viewport score (20 points)
    maxScore += 20;
    if (analysis.viewport.present) score += 10;
    if (analysis.viewport.mobileOptimized) score += 10;

    // Open Graph score (15 points)
    maxScore += 15;
    score += (analysis.openGraph.present / analysis.openGraph.total) * 15;

    // Twitter Cards score (10 points)
    maxScore += 10;
    if (analysis.twitterCards.present) score += 5;
    if (analysis.twitterCards.complete) score += 5;

    // Robots score (5 points)
    maxScore += 5;
    if (analysis.robots.indexable) score += 5;

    return Math.round((score / maxScore) * 100);
  }
}
