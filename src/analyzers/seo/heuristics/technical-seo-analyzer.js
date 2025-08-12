/**
 * Technical SEO Analyzer - GPT-5 Style Business Logic
 * 
 * Analyzes technical SEO factors from detection results
 * Implements technical optimization heuristics and best practices
 */

export class TechnicalSEOAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableURLAnalysis: options.enableURLAnalysis !== false,
      enableRobotsAnalysis: options.enableRobotsAnalysis !== false,
      enableSchemaValidation: options.enableSchemaValidation !== false,
      enableMobileAnalysis: options.enableMobileAnalysis !== false,
      enableSecurityAnalysis: options.enableSecurityAnalysis !== false,
      urlMaxLength: options.urlMaxLength || 100,
      titleMaxLength: options.titleMaxLength || 60,
      descriptionMaxLength: options.descriptionMaxLength || 160,
      ...options
    };
  }

  /**
   * Analyze technical SEO factors from detection results
   * @param {Object} detections - Detection results from all detectors
   * @returns {Object} Technical SEO analysis results
   */
  async analyze(detections) {
    try {
      const results = {
        success: true,
        url: this.options.enableURLAnalysis ? 
          this._analyzeURLStructure(detections) : null,
        metaTags: this._analyzeMetaTagOptimization(detections),
        headings: this._analyzeHeadingOptimization(detections),
        robots: this.options.enableRobotsAnalysis ? 
          this._analyzeRobotsDirectives(detections) : null,
        structuredData: this.options.enableSchemaValidation ? 
          this._analyzeStructuredDataOptimization(detections) : null,
        mobile: this.options.enableMobileAnalysis ? 
          this._analyzeMobileFriendliness(detections) : null,
        security: this.options.enableSecurityAnalysis ? 
          this._analyzeSecurityFactors(detections) : null,
        canonical: this._analyzeCanonicalImplementation(detections),
        sitemap: this._analyzeSitemapIndicators(detections),
        indexability: this._analyzeIndexabilityFactors(detections),
        issues: this._identifyTechnicalIssues(detections),
        opportunities: this._identifyTechnicalOpportunities(detections),
        score: 0,
        grade: 'F'
      };

      // Calculate overall technical SEO score
      results.score = this._calculateTechnicalSEOScore(results);
      results.grade = this._getTechnicalSEOGrade(results.score);

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze URL structure optimization
   * @param {Object} detections - Detection results
   * @returns {Object} URL analysis
   * @private
   */
  _analyzeURLStructure(detections) {
    const url = detections.url || '';
    
    return {
      url,
      length: url.length,
      isOptimal: url.length <= this.options.urlMaxLength,
      structure: this._analyzeURLComponents(url),
      readability: this._assessURLReadability(url),
      seoFriendliness: this._assessURLSEOFriendliness(url),
      issues: this._identifyURLIssues(url),
      recommendations: this._getURLRecommendations(url),
      score: this._calculateURLScore(url)
    };
  }

  /**
   * Analyze meta tag optimization from technical perspective
   * @param {Object} detections - Detection results
   * @returns {Object} Meta tag technical analysis
   * @private
   */
  _analyzeMetaTagOptimization(detections) {
    const metaTags = detections.metaTags || {};
    const basic = metaTags.basic || {};
    
    const analysis = {
      title: this._analyzeTitleOptimization(basic.title),
      description: this._analyzeDescriptionOptimization(basic.description),
      viewport: this._analyzeViewportOptimization(metaTags.viewport),
      charset: this._analyzeCharsetOptimization(basic.charset),
      language: this._analyzeLanguageOptimization(basic.language),
      openGraph: this._analyzeOpenGraphImplementation(metaTags.openGraph),
      twitterCard: this._analyzeTwitterCardImplementation(metaTags.twitterCard),
      duplicates: this._detectDuplicateMetaTags(metaTags),
      completeness: this._assessMetaTagCompleteness(metaTags),
      score: 0
    };

    analysis.score = this._calculateMetaTagScore(analysis);
    return analysis;
  }

  /**
   * Analyze heading structure from technical perspective
   * @param {Object} detections - Detection results
   * @returns {Object} Heading technical analysis
   * @private
   */
  _analyzeHeadingOptimization(detections) {
    const headings = detections.headings || {};
    const structure = headings.structure || {};
    
    return {
      hierarchy: this._analyzeHeadingHierarchy(headings),
      distribution: this._analyzeHeadingDistribution(headings),
      accessibility: this._analyzeHeadingAccessibility(headings),
      seoOptimization: this._analyzeHeadingSEOFactors(headings),
      structuralIntegrity: this._assessHeadingStructuralIntegrity(structure),
      score: this._calculateHeadingScore(headings)
    };
  }

  /**
   * Analyze robots directives and crawling instructions
   * @param {Object} detections - Detection results
   * @returns {Object} Robots analysis
   * @private
   */
  _analyzeRobotsDirectives(detections) {
    const robots = detections.metaTags?.robots || {};
    
    return {
      meta: this._analyzeRobotsMetaTag(robots.meta),
      httpHeaders: this._analyzeRobotsHeaders(robots.xRobotsTag),
      directives: this._analyzeRobotsDirectives(robots),
      crawlability: this._assessCrawlability(robots),
      indexability: this._assessIndexability(robots),
      conflicts: this._detectRobotsConflicts(robots),
      recommendations: this._getRobotsRecommendations(robots),
      score: this._calculateRobotsScore(robots)
    };
  }

  /**
   * Analyze structured data implementation
   * @param {Object} detections - Detection results
   * @returns {Object} Structured data analysis
   * @private
   */
  _analyzeStructuredDataOptimization(detections) {
    const structuredData = detections.structuredData || {};
    
    return {
      jsonLd: this._analyzeJSONLDImplementation(structuredData.jsonLd),
      microdata: this._analyzeMicrodataImplementation(structuredData.microdata),
      rdfa: this._analyzeRDFaImplementation(structuredData.rdfa),
      validation: this._validateStructuredData(structuredData),
      coverage: this._assessStructuredDataCoverage(structuredData),
      bestPractices: this._checkStructuredDataBestPractices(structuredData),
      score: this._calculateStructuredDataScore(structuredData)
    };
  }

  /**
   * Analyze mobile-friendliness factors
   * @param {Object} detections - Detection results
   * @returns {Object} Mobile analysis
   * @private
   */
  _analyzeMobileFriendliness(detections) {
    const viewport = detections.metaTags?.viewport || {};
    const content = detections.content || {};
    
    return {
      viewport: this._analyzeMobileViewport(viewport),
      responsiveDesign: this._assessResponsiveDesign(detections),
      touchFriendliness: this._assessTouchFriendliness(detections),
      textReadability: this._assessMobileTextReadability(content),
      imageOptimization: this._assessMobileImageOptimization(content.images),
      score: this._calculateMobileScore(detections)
    };
  }

  /**
   * Analyze security factors affecting SEO
   * @param {Object} detections - Detection results
   * @returns {Object} Security analysis
   * @private
   */
  _analyzeSecurityFactors(detections) {
    const links = detections.links || {};
    const url = detections.url || '';
    
    return {
      https: this._analyzeHTTPSImplementation(url),
      externalLinks: this._analyzeExternalLinkSecurity(links.external),
      mixedContent: this._detectMixedContentRisks(detections),
      securityHeaders: this._analyzeSecurityHeaders(detections),
      trustSignals: this._identifyTrustSignals(detections),
      score: this._calculateSecurityScore(detections)
    };
  }

  /**
   * Analyze canonical implementation
   * @param {Object} detections - Detection results
   * @returns {Object} Canonical analysis
   * @private
   */
  _analyzeCanonicalImplementation(detections) {
    const canonical = detections.metaTags?.canonical || {};
    
    return {
      present: canonical.present || false,
      implementation: this._assessCanonicalImplementation(canonical),
      conflicts: this._detectCanonicalConflicts(canonical),
      recommendations: this._getCanonicalRecommendations(canonical),
      score: this._calculateCanonicalScore(canonical)
    };
  }

  /**
   * Analyze sitemap indicators
   * @param {Object} detections - Detection results
   * @returns {Object} Sitemap analysis
   * @private
   */
  _analyzeSitemapIndicators(detections) {
    // This would typically require additional data about sitemap presence
    // For now, we analyze indirect indicators
    
    return {
      robotsTxtIndicators: this._findSitemapInRobotsTxt(detections),
      linkIndicators: this._findSitemapLinks(detections.links),
      structuredDataIndicators: this._findSitemapStructuredData(detections.structuredData),
      recommendations: this._getSitemapRecommendations(),
      score: this._calculateSitemapScore(detections)
    };
  }

  /**
   * Analyze indexability factors
   * @param {Object} detections - Detection results
   * @returns {Object} Indexability analysis
   * @private
   */
  _analyzeIndexabilityFactors(detections) {
    const robots = detections.metaTags?.robots || {};
    const canonical = detections.metaTags?.canonical || {};
    
    return {
      robotsDirectives: this._assessIndexabilityFromRobots(robots),
      canonicalFactors: this._assessIndexabilityFromCanonical(canonical),
      contentQuality: this._assessIndexabilityFromContent(detections.content),
      technicalBarriers: this._identifyIndexabilityBarriers(detections),
      recommendations: this._getIndexabilityRecommendations(detections),
      score: this._calculateIndexabilityScore(detections)
    };
  }

  /**
   * Identify technical SEO issues
   * @param {Object} detections - Detection results
   * @returns {Array} Array of technical issues
   * @private
   */
  _identifyTechnicalIssues(detections) {
    const issues = [];
    
    // Missing or problematic title
    const title = detections.metaTags?.basic?.title;
    if (!title?.present) {
      issues.push({
        type: 'missing_title',
        severity: 'critical',
        message: 'Page is missing a title tag',
        recommendation: 'Add a descriptive title tag with target keywords',
        impact: 'high'
      });
    } else if (title.length > this.options.titleMaxLength) {
      issues.push({
        type: 'title_too_long',
        severity: 'high',
        message: `Title is too long (${title.length} chars, max ${this.options.titleMaxLength})`,
        recommendation: 'Shorten title to improve search result display',
        impact: 'medium'
      });
    }

    // Missing or problematic meta description
    const description = detections.metaTags?.basic?.description;
    if (!description) {
      issues.push({
        type: 'missing_description',
        severity: 'high',
        message: 'Page is missing a meta description',
        recommendation: 'Add a compelling meta description to improve click-through rates',
        impact: 'medium'
      });
    } else if (description.length > this.options.descriptionMaxLength) {
      issues.push({
        type: 'description_too_long',
        severity: 'medium',
        message: `Meta description is too long (${description.length} chars, max ${this.options.descriptionMaxLength})`,
        recommendation: 'Shorten meta description for better search result display',
        impact: 'low'
      });
    }

    // Multiple H1 tags
    const h1Count = detections.headings?.statistics?.byLevel?.h1 || 0;
    if (h1Count > 1) {
      issues.push({
        type: 'multiple_h1',
        severity: 'medium',
        message: `Multiple H1 tags found (${h1Count})`,
        recommendation: 'Use only one H1 tag per page for better semantic structure',
        impact: 'medium'
      });
    } else if (h1Count === 0) {
      issues.push({
        type: 'missing_h1',
        severity: 'high',
        message: 'Page is missing an H1 tag',
        recommendation: 'Add an H1 tag that describes the main topic of the page',
        impact: 'high'
      });
    }

    // Missing viewport tag
    const viewport = detections.metaTags?.viewport;
    if (!viewport?.present) {
      issues.push({
        type: 'missing_viewport',
        severity: 'high',
        message: 'Page is missing a viewport meta tag',
        recommendation: 'Add viewport meta tag for mobile-friendly display',
        impact: 'high'
      });
    }

    // Multiple canonical tags
    const canonical = detections.metaTags?.canonical;
    if (canonical?.multiple) {
      issues.push({
        type: 'multiple_canonical',
        severity: 'high',
        message: `Multiple canonical tags found (${canonical.count})`,
        recommendation: 'Use only one canonical tag per page',
        impact: 'high'
      });
    }

    // Images without alt text
    const images = detections.content?.images;
    if (images?.statistics?.withoutAlt > 0) {
      issues.push({
        type: 'images_missing_alt',
        severity: 'medium',
        message: `${images.statistics.withoutAlt} images missing alt text`,
        recommendation: 'Add descriptive alt text to all images for accessibility and SEO',
        impact: 'medium'
      });
    }

    return issues;
  }

  /**
   * Identify technical SEO opportunities
   * @param {Object} detections - Detection results
   * @returns {Array} Array of opportunities
   * @private
   */
  _identifyTechnicalOpportunities(detections) {
    const opportunities = [];
    
    // Structured data opportunity
    const structuredDataCount = detections.structuredData?.statistics?.totalItems || 0;
    if (structuredDataCount === 0) {
      opportunities.push({
        type: 'add_structured_data',
        priority: 'high',
        message: 'Page lacks structured data markup',
        impact: 'high',
        effort: 'medium'
      });
    }

    // Open Graph opportunity
    const openGraphCount = Object.keys(detections.metaTags?.openGraph || {}).length;
    if (openGraphCount < 4) { // Missing essential OG tags
      opportunities.push({
        type: 'improve_open_graph',
        priority: 'medium',
        message: 'Incomplete Open Graph implementation',
        impact: 'medium',
        effort: 'low'
      });
    }

    // Internal linking opportunity
    const internalLinks = detections.links?.anchors?.categories?.internal || 0;
    const contentLength = detections.content?.text?.wordCount || 0;
    const expectedLinks = Math.floor(contentLength / 200);
    
    if (internalLinks < expectedLinks) {
      opportunities.push({
        type: 'internal_linking',
        priority: 'medium',
        message: 'Opportunity to add more internal links',
        impact: 'medium',
        effort: 'medium'
      });
    }

    // Image optimization opportunity
    const images = detections.content?.images;
    if (images?.count > 0 && images.statistics?.withAlt < images.count) {
      opportunities.push({
        type: 'image_optimization',
        priority: 'medium',
        message: 'Optimize image alt text and accessibility',
        impact: 'medium',
        effort: 'low'
      });
    }

    return opportunities;
  }

  // Helper methods

  /**
   * Analyze URL components
   * @param {string} url - URL to analyze
   * @returns {Object} URL component analysis
   * @private
   */
  _analyzeURLComponents(url) {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        domain: urlObj.hostname,
        path: urlObj.pathname,
        query: urlObj.search,
        fragment: urlObj.hash,
        pathSegments: urlObj.pathname.split('/').filter(segment => segment.length > 0)
      };
    } catch (error) {
      return {
        error: 'Invalid URL format',
        raw: url
      };
    }
  }

  /**
   * Assess URL readability
   * @param {string} url - URL to assess
   * @returns {Object} Readability assessment
   * @private
   */
  _assessURLReadability(url) {
    const hasSpecialChars = /[!@#$%^&*()+=\[\]{};':"|,.<>?]/.test(url);
    const hasNumbers = /\d/.test(url);
    const hasHyphens = url.includes('-');
    const hasUnderscores = url.includes('_');
    
    return {
      hasSpecialChars,
      hasNumbers,
      hasHyphens,
      hasUnderscores,
      isReadable: !hasSpecialChars && hasHyphens && !hasUnderscores,
      score: this._calculateURLReadabilityScore(url)
    };
  }

  /**
   * Calculate technical SEO score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score 0-100
   * @private
   */
  _calculateTechnicalSEOScore(results) {
    let totalScore = 0;
    let weights = 0;

    // Meta tags optimization (30% weight)
    if (results.metaTags?.score !== undefined) {
      totalScore += results.metaTags.score * 0.3;
      weights += 0.3;
    }

    // Heading optimization (20% weight)
    if (results.headings?.score !== undefined) {
      totalScore += results.headings.score * 0.2;
      weights += 0.2;
    }

    // Structured data (15% weight)
    if (results.structuredData?.score !== undefined) {
      totalScore += results.structuredData.score * 0.15;
      weights += 0.15;
    }

    // Mobile friendliness (15% weight)
    if (results.mobile?.score !== undefined) {
      totalScore += results.mobile.score * 0.15;
      weights += 0.15;
    }

    // Security factors (10% weight)
    if (results.security?.score !== undefined) {
      totalScore += results.security.score * 0.1;
      weights += 0.1;
    }

    // Indexability (10% weight)
    if (results.indexability?.score !== undefined) {
      totalScore += results.indexability.score * 0.1;
      weights += 0.1;
    }

    return weights > 0 ? Math.round(totalScore / weights) : 0;
  }

  /**
   * Get technical SEO grade from score
   * @param {number} score - Technical SEO score
   * @returns {string} Grade A-F
   * @private
   */
  _getTechnicalSEOGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Placeholder methods for detailed implementations
  _assessURLSEOFriendliness() { return { score: 75 }; }
  _identifyURLIssues() { return []; }
  _getURLRecommendations() { return []; }
  _calculateURLScore() { return 75; }
  _calculateURLReadabilityScore() { return 75; }
  _analyzeTitleOptimization() { return { score: 80 }; }
  _analyzeDescriptionOptimization() { return { score: 75 }; }
  _analyzeViewportOptimization() { return { score: 85 }; }
  _analyzeCharsetOptimization() { return { score: 90 }; }
  _analyzeLanguageOptimization() { return { score: 80 }; }
  _analyzeOpenGraphImplementation() { return { score: 70 }; }
  _analyzeTwitterCardImplementation() { return { score: 65 }; }
  _detectDuplicateMetaTags() { return []; }
  _assessMetaTagCompleteness() { return { score: 75 }; }
  _calculateMetaTagScore() { return 78; }
  _analyzeHeadingHierarchy() { return { score: 80 }; }
  _analyzeHeadingDistribution() { return { score: 75 }; }
  _analyzeHeadingAccessibility() { return { score: 85 }; }
  _analyzeHeadingSEOFactors() { return { score: 78 }; }
  _assessHeadingStructuralIntegrity() { return { score: 82 }; }
  _calculateHeadingScore() { return 80; }
  _analyzeRobotsMetaTag() { return { score: 85 }; }
  _analyzeRobotsHeaders() { return { score: 80 }; }
  _analyzeRobotsDirectives() { return { score: 85 }; }
  _assessCrawlability() { return { score: 90 }; }
  _assessIndexability() { return { score: 88 }; }
  _detectRobotsConflicts() { return []; }
  _getRobotsRecommendations() { return []; }
  _calculateRobotsScore() { return 86; }
  _analyzeJSONLDImplementation() { return { score: 70 }; }
  _analyzeMicrodataImplementation() { return { score: 60 }; }
  _analyzeRDFaImplementation() { return { score: 55 }; }
  _validateStructuredData() { return { score: 75 }; }
  _assessStructuredDataCoverage() { return { score: 65 }; }
  _checkStructuredDataBestPractices() { return { score: 70 }; }
  _calculateStructuredDataScore() { return 68; }
  _analyzeMobileViewport() { return { score: 85 }; }
  _assessResponsiveDesign() { return { score: 80 }; }
  _assessTouchFriendliness() { return { score: 75 }; }
  _assessMobileTextReadability() { return { score: 80 }; }
  _assessMobileImageOptimization() { return { score: 70 }; }
  _calculateMobileScore() { return 78; }
  _analyzeHTTPSImplementation() { return { score: 95 }; }
  _analyzeExternalLinkSecurity() { return { score: 80 }; }
  _detectMixedContentRisks() { return { score: 90 }; }
  _analyzeSecurityHeaders() { return { score: 75 }; }
  _identifyTrustSignals() { return { score: 70 }; }
  _calculateSecurityScore() { return 82; }
  _assessCanonicalImplementation() { return { score: 85 }; }
  _detectCanonicalConflicts() { return []; }
  _getCanonicalRecommendations() { return []; }
  _calculateCanonicalScore() { return 85; }
  _findSitemapInRobotsTxt() { return { found: false }; }
  _findSitemapLinks() { return { found: false }; }
  _findSitemapStructuredData() { return { found: false }; }
  _getSitemapRecommendations() { return []; }
  _calculateSitemapScore() { return 60; }
  _assessIndexabilityFromRobots() { return { score: 90 }; }
  _assessIndexabilityFromCanonical() { return { score: 85 }; }
  _assessIndexabilityFromContent() { return { score: 75 }; }
  _identifyIndexabilityBarriers() { return []; }
  _getIndexabilityRecommendations() { return []; }
  _calculateIndexabilityScore() { return 83; }
}

export default TechnicalSEOAnalyzer;
