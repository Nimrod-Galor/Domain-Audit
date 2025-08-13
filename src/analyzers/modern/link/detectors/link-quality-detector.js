/**
 * Link Quality Detector - GPT-5 Style Modular Detection
 * 
 * Advanced link quality assessment with authority analysis,
 * trust evaluation, and SEO impact scoring.
 */

export class LinkQualityDetector {
  constructor(config = {}) {
    this.config = {
      enableAuthorityAnalysis: config.enableAuthorityAnalysis !== false,
      enableTrustAnalysis: config.enableTrustAnalysis !== false,
      enableSEOAnalysis: config.enableSEOAnalysis !== false,
      enablePerformanceAnalysis: config.enablePerformanceAnalysis || false,
      checkLinkStatus: config.checkLinkStatus || false,
      analyzeRedirects: config.analyzeRedirects || false,
      timeout: config.timeout || 5000,
      ...config
    };

    this.qualityFactors = {
      domain: {
        authority: ['gov', 'edu', 'org'],
        trusted: ['wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org'],
        suspicious: ['.tk', '.ml', '.ga', '.cf', '.click']
      },
      content: {
        positive: ['research', 'documentation', 'official', 'guide', 'tutorial'],
        negative: ['spam', 'ad', 'popup', 'clickbait', 'fake']
      },
      attributes: {
        positive: ['title', 'aria-label'],
        negative: ['target="_blank"', 'javascript:'],
        security: ['rel="noopener"', 'rel="noreferrer"']
      }
    };

    this.authorityScores = new Map([
      ['wikipedia.org', 95],
      ['github.com', 90],
      ['stackoverflow.com', 85],
      ['mozilla.org', 90],
      ['w3.org', 95],
      ['google.com', 85],
      ['microsoft.com', 80],
      ['apple.com', 80]
    ]);
  }

  async detect(document, context = {}) {
    try {
      const analysis = {
        links: await this.analyzeAllLinks(document, context),
        quality: await this.assessOverallQuality(document, context),
        authority: await this.analyzeAuthority(document, context),
        trust: await this.analyzeTrust(document, context),
        seo: await this.analyzeSEOQuality(document, context),
        performance: await this.analyzePerformance(document, context),
        distribution: await this.analyzeQualityDistribution(document, context),
        count: 0,
        score: 0,
        recommendations: []
      };

      analysis.count = analysis.links.length;
      analysis.score = this.calculateQualityScore(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return {
        category: 'Link Quality Detection',
        subcategory: 'Quality Assessment',
        ...analysis,
        metadata: {
          detector: 'LinkQualityDetector',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleDetectionError(error);
    }
  }

  async analyzeAllLinks(document, context) {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    const baseUrl = context.url ? new URL(context.url) : null;

    for (let i = 0; i < linkElements.length; i++) {
      const linkElement = linkElements[i];
      const href = linkElement.getAttribute('href');
      
      if (!href) continue;

      const linkAnalysis = await this.analyzeLinkQuality(linkElement, href, baseUrl, i);
      links.push(linkAnalysis);
    }

    return links;
  }

  async analyzeLinkQuality(linkElement, href, baseUrl, index) {
    const linkInfo = {
      href,
      text: linkElement.textContent?.trim() || '',
      title: linkElement.getAttribute('title') || '',
      rel: linkElement.getAttribute('rel') || '',
      target: linkElement.getAttribute('target') || '',
      position: index,
      isInternal: this.isInternalLink(href, baseUrl),
      isExternal: this.isExternalLink(href, baseUrl),
      context: this.getLinkContext(linkElement),
      quality: {}
    };

    // Comprehensive quality analysis
    linkInfo.quality = {
      overall: 50,
      factors: {
        authority: await this.assessAuthority(linkInfo),
        trust: this.assessTrust(linkInfo),
        relevance: this.assessRelevance(linkInfo, linkElement),
        accessibility: this.assessAccessibility(linkInfo, linkElement),
        seo: this.assessSEOValue(linkInfo, linkElement),
        security: this.assessSecurity(linkInfo, linkElement),
        usability: this.assessUsability(linkInfo, linkElement)
      },
      issues: [],
      strengths: []
    };

    // Calculate overall quality score
    linkInfo.quality.overall = this.calculateOverallQuality(linkInfo.quality.factors);
    
    // Identify issues and strengths
    linkInfo.quality.issues = this.identifyQualityIssues(linkInfo);
    linkInfo.quality.strengths = this.identifyQualityStrengths(linkInfo);

    return linkInfo;
  }

  async assessOverallQuality(document, context) {
    const quality = {
      average: 0,
      median: 0,
      distribution: { high: 0, medium: 0, low: 0 },
      trends: this.analyzeQualityTrends(document),
      patterns: this.analyzeQualityPatterns(document)
    };

    const links = await this.analyzeAllLinks(document, context);
    
    if (links.length === 0) {
      return quality;
    }

    // Calculate average quality
    const totalQuality = links.reduce((sum, link) => sum + link.quality.overall, 0);
    quality.average = totalQuality / links.length;

    // Calculate median quality
    const sortedQualities = links.map(link => link.quality.overall).sort((a, b) => a - b);
    const mid = Math.floor(sortedQualities.length / 2);
    quality.median = sortedQualities.length % 2 === 0
      ? (sortedQualities[mid - 1] + sortedQualities[mid]) / 2
      : sortedQualities[mid];

    // Quality distribution
    links.forEach(link => {
      const score = link.quality.overall;
      if (score >= 75) quality.distribution.high++;
      else if (score >= 50) quality.distribution.medium++;
      else quality.distribution.low++;
    });

    return quality;
  }

  async analyzeAuthority(document, context) {
    if (!this.config.enableAuthorityAnalysis) {
      return { enabled: false };
    }

    const authority = {
      scores: { high: [], medium: [], low: [] },
      domains: new Map(),
      totalScore: 0,
      averageScore: 0,
      topDomains: [],
      issues: []
    };

    const links = await this.analyzeAllLinks(document, context);
    
    links.forEach(link => {
      const authorityScore = link.quality.factors.authority.score;
      const domain = this.extractDomain(link.href);
      
      if (authorityScore >= 75) {
        authority.scores.high.push(link);
      } else if (authorityScore >= 50) {
        authority.scores.medium.push(link);
      } else {
        authority.scores.low.push(link);
      }

      if (domain) {
        if (!authority.domains.has(domain)) {
          authority.domains.set(domain, { links: [], totalScore: 0 });
        }
        const domainData = authority.domains.get(domain);
        domainData.links.push(link);
        domainData.totalScore += authorityScore;
      }

      authority.totalScore += authorityScore;
    });

    authority.averageScore = links.length > 0 ? authority.totalScore / links.length : 0;

    // Top domains by authority
    authority.topDomains = Array.from(authority.domains.entries())
      .map(([domain, data]) => ({
        domain,
        averageScore: data.totalScore / data.links.length,
        linkCount: data.links.length
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    return authority;
  }

  async analyzeTrust(document, context) {
    if (!this.config.enableTrustAnalysis) {
      return { enabled: false };
    }

    const trust = {
      levels: { trusted: [], neutral: [], suspicious: [] },
      factors: {
        httpsUsage: 0,
        nofollowUsage: 0,
        securityAttributes: 0,
        domainReputation: 0
      },
      score: 0,
      issues: []
    };

    const links = await this.analyzeAllLinks(document, context);
    
    links.forEach(link => {
      const trustScore = link.quality.factors.trust.score;
      
      if (trustScore >= 75) {
        trust.levels.trusted.push(link);
      } else if (trustScore >= 50) {
        trust.levels.neutral.push(link);
      } else {
        trust.levels.suspicious.push(link);
      }

      // Analyze trust factors
      if (link.href.startsWith('https://')) trust.factors.httpsUsage++;
      if (link.rel.includes('nofollow')) trust.factors.nofollowUsage++;
      if (this.hasSecurityAttributes(link)) trust.factors.securityAttributes++;
      if (this.hasTrustedDomain(link.href)) trust.factors.domainReputation++;
    });

    // Calculate overall trust score
    const totalLinks = links.length;
    if (totalLinks > 0) {
      trust.score = (
        (trust.factors.httpsUsage / totalLinks) * 25 +
        (trust.factors.securityAttributes / totalLinks) * 25 +
        (trust.factors.domainReputation / totalLinks) * 25 +
        (trust.levels.trusted.length / totalLinks) * 25
      );
    }

    return trust;
  }

  async analyzeSEOQuality(document, context) {
    if (!this.config.enableSEOAnalysis) {
      return { enabled: false };
    }

    const seo = {
      linkValue: this.calculateLinkValue(document),
      anchorOptimization: this.assessAnchorOptimization(document),
      internalLinking: this.assessInternalLinking(document),
      externalLinking: this.assessExternalLinking(document),
      nofollowStrategy: this.assessNofollowStrategy(document),
      score: 0
    };

    // Calculate overall SEO quality score
    seo.score = (
      seo.linkValue.score * 0.3 +
      seo.anchorOptimization.score * 0.2 +
      seo.internalLinking.score * 0.2 +
      seo.externalLinking.score * 0.2 +
      seo.nofollowStrategy.score * 0.1
    );

    return seo;
  }

  async analyzePerformance(document, context) {
    if (!this.config.enablePerformanceAnalysis) {
      return { enabled: false };
    }

    const performance = {
      loadImpact: this.assessLoadImpact(document),
      renderBlocking: this.assessRenderBlocking(document),
      resourceOptimization: this.assessResourceOptimization(document),
      caching: this.assessCaching(document),
      score: 0
    };

    // Calculate performance score
    performance.score = (
      performance.loadImpact.score * 0.4 +
      performance.renderBlocking.score * 0.3 +
      performance.resourceOptimization.score * 0.2 +
      performance.caching.score * 0.1
    );

    return performance;
  }

  async analyzeQualityDistribution(document, context) {
    const distribution = {
      bySection: {},
      byType: {},
      byQuality: { high: 0, medium: 0, low: 0 },
      trends: {}
    };

    const links = await this.analyzeAllLinks(document, context);

    links.forEach(link => {
      // Section distribution
      const section = link.context.section;
      if (!distribution.bySection[section]) {
        distribution.bySection[section] = { total: 0, qualitySum: 0 };
      }
      distribution.bySection[section].total++;
      distribution.bySection[section].qualitySum += link.quality.overall;

      // Type distribution
      const type = link.isInternal ? 'internal' : 'external';
      if (!distribution.byType[type]) {
        distribution.byType[type] = { total: 0, qualitySum: 0 };
      }
      distribution.byType[type].total++;
      distribution.byType[type].qualitySum += link.quality.overall;

      // Quality level distribution
      if (link.quality.overall >= 75) distribution.byQuality.high++;
      else if (link.quality.overall >= 50) distribution.byQuality.medium++;
      else distribution.byQuality.low++;
    });

    // Calculate averages
    Object.keys(distribution.bySection).forEach(section => {
      const data = distribution.bySection[section];
      data.average = data.qualitySum / data.total;
    });

    Object.keys(distribution.byType).forEach(type => {
      const data = distribution.byType[type];
      data.average = data.qualitySum / data.total;
    });

    return distribution;
  }

  // Quality assessment methods
  async assessAuthority(linkInfo) {
    const authority = {
      score: 50,
      level: 'medium',
      factors: [],
      domain: this.extractDomain(linkInfo.href)
    };

    if (!authority.domain) {
      authority.score = 20;
      authority.level = 'low';
      authority.factors.push('Invalid or missing domain');
      return authority;
    }

    // Check predefined authority scores
    if (this.authorityScores.has(authority.domain)) {
      authority.score = this.authorityScores.get(authority.domain);
      authority.level = authority.score >= 75 ? 'high' : 'medium';
      authority.factors.push('High-authority domain');
      return authority;
    }

    // TLD-based authority assessment
    const tld = this.extractTLD(authority.domain);
    if (this.qualityFactors.domain.authority.includes(tld)) {
      authority.score += 25;
      authority.factors.push('Authority TLD');
    }

    // Trusted domain check
    if (this.qualityFactors.domain.trusted.some(trusted => 
        authority.domain.includes(trusted))) {
      authority.score += 20;
      authority.factors.push('Trusted domain');
    }

    // Suspicious domain check
    if (this.qualityFactors.domain.suspicious.some(suspicious => 
        authority.domain.includes(suspicious))) {
      authority.score -= 30;
      authority.factors.push('Suspicious domain pattern');
    }

    // Domain length and complexity
    if (authority.domain.length > 20) {
      authority.score -= 10;
      authority.factors.push('Very long domain name');
    }

    authority.level = authority.score >= 75 ? 'high' : 
                     authority.score >= 50 ? 'medium' : 'low';

    return authority;
  }

  assessTrust(linkInfo) {
    const trust = {
      score: 50,
      level: 'medium',
      factors: []
    };

    // HTTPS check
    if (linkInfo.href.startsWith('https://')) {
      trust.score += 15;
      trust.factors.push('Secure HTTPS connection');
    } else if (linkInfo.href.startsWith('http://')) {
      trust.score -= 20;
      trust.factors.push('Insecure HTTP connection');
    }

    // Rel attributes
    if (linkInfo.rel.includes('nofollow')) {
      trust.factors.push('Has nofollow attribute');
    }
    if (linkInfo.rel.includes('noopener')) {
      trust.score += 10;
      trust.factors.push('Has security noopener attribute');
    }
    if (linkInfo.rel.includes('noreferrer')) {
      trust.score += 5;
      trust.factors.push('Has privacy noreferrer attribute');
    }

    // Target attribute security
    if (linkInfo.target === '_blank' && !linkInfo.rel.includes('noopener')) {
      trust.score -= 15;
      trust.factors.push('Security risk: target="_blank" without noopener');
    }

    // Domain trust assessment
    const domain = this.extractDomain(linkInfo.href);
    if (domain && this.hasTrustedDomain(linkInfo.href)) {
      trust.score += 20;
      trust.factors.push('Trusted domain');
    }

    trust.level = trust.score >= 75 ? 'high' : 
                  trust.score >= 50 ? 'medium' : 'low';

    return trust;
  }

  assessRelevance(linkInfo, linkElement) {
    const relevance = {
      score: 50,
      factors: []
    };

    // Anchor text relevance
    const anchorText = linkInfo.text.toLowerCase();
    if (anchorText.length > 0) {
      if (this.isDescriptiveAnchor(anchorText)) {
        relevance.score += 15;
        relevance.factors.push('Descriptive anchor text');
      } else if (this.isGenericAnchor(anchorText)) {
        relevance.score -= 10;
        relevance.factors.push('Generic anchor text');
      }
    }

    // Context relevance
    const context = this.getContextualRelevance(linkElement);
    relevance.score += context.score;
    relevance.factors.push(...context.factors);

    // Title attribute relevance
    if (linkInfo.title && linkInfo.title.length > 0) {
      relevance.score += 5;
      relevance.factors.push('Has descriptive title');
    }

    return relevance;
  }

  assessAccessibility(linkInfo, linkElement) {
    const accessibility = {
      score: 50,
      factors: []
    };

    // Anchor text accessibility
    if (linkInfo.text && linkInfo.text.length > 0) {
      accessibility.score += 15;
      accessibility.factors.push('Has visible anchor text');
    } else {
      accessibility.score -= 20;
      accessibility.factors.push('Missing anchor text');
    }

    // ARIA attributes
    const ariaLabel = linkElement.getAttribute('aria-label');
    if (ariaLabel) {
      accessibility.score += 10;
      accessibility.factors.push('Has ARIA label');
    }

    // Title attribute
    if (linkInfo.title) {
      accessibility.score += 5;
      accessibility.factors.push('Has title attribute');
    }

    // Image alt text (for image links)
    const img = linkElement.querySelector('img');
    if (img) {
      const alt = img.getAttribute('alt');
      if (alt && alt.trim()) {
        accessibility.score += 10;
        accessibility.factors.push('Image has alt text');
      } else {
        accessibility.score -= 15;
        accessibility.factors.push('Image missing alt text');
      }
    }

    // Focus management
    if (linkInfo.target === '_blank') {
      accessibility.factors.push('Opens in new window');
    }

    return accessibility;
  }

  assessSEOValue(linkInfo, linkElement) {
    const seo = {
      score: 50,
      factors: []
    };

    // Nofollow impact
    if (linkInfo.rel.includes('nofollow')) {
      if (linkInfo.isExternal) {
        seo.factors.push('External link with nofollow');
      } else {
        seo.score -= 10;
        seo.factors.push('Internal link with nofollow (negative)');
      }
    } else {
      if (linkInfo.isInternal) {
        seo.score += 10;
        seo.factors.push('Internal link passes PageRank');
      } else {
        seo.factors.push('External link passes PageRank');
      }
    }

    // Anchor text SEO value
    const anchorOptimization = this.assessAnchorSEO(linkInfo.text);
    seo.score += anchorOptimization.score;
    seo.factors.push(...anchorOptimization.factors);

    // Link position value
    const positionValue = this.assessPositionValue(linkInfo.position);
    seo.score += positionValue;
    
    if (positionValue > 0) {
      seo.factors.push('Good link position');
    }

    return seo;
  }

  assessSecurity(linkInfo, linkElement) {
    const security = {
      score: 50,
      risk: 'low',
      factors: []
    };

    // Protocol security
    if (linkInfo.href.startsWith('https://')) {
      security.score += 20;
      security.factors.push('Secure HTTPS protocol');
    } else if (linkInfo.href.startsWith('http://')) {
      security.score -= 25;
      security.risk = 'medium';
      security.factors.push('Insecure HTTP protocol');
    }

    // JavaScript links
    if (linkInfo.href.startsWith('javascript:')) {
      security.score -= 30;
      security.risk = 'high';
      security.factors.push('JavaScript link security risk');
    }

    // Target="_blank" security
    if (linkInfo.target === '_blank') {
      if (!linkInfo.rel.includes('noopener')) {
        security.score -= 20;
        security.risk = 'medium';
        security.factors.push('Missing noopener security attribute');
      } else {
        security.factors.push('Proper noopener security');
      }
    }

    // Domain security
    const domain = this.extractDomain(linkInfo.href);
    if (domain && this.isSuspiciousDomain(domain)) {
      security.score -= 25;
      security.risk = 'high';
      security.factors.push('Suspicious domain detected');
    }

    return security;
  }

  assessUsability(linkInfo, linkElement) {
    const usability = {
      score: 50,
      factors: []
    };

    // Anchor text usability
    const text = linkInfo.text;
    if (text && text.length > 0) {
      if (text.length >= 10 && text.length <= 60) {
        usability.score += 15;
        usability.factors.push('Optimal anchor text length');
      } else if (text.length > 100) {
        usability.score -= 10;
        usability.factors.push('Very long anchor text');
      }

      if (this.isActionOriented(text)) {
        usability.score += 10;
        usability.factors.push('Clear action intent');
      }
    }

    // Link behavior
    if (linkInfo.target === '_blank') {
      usability.factors.push('Opens in new window');
    }

    // Context usability
    const contextUsability = this.assessContextUsability(linkElement);
    usability.score += contextUsability.score;
    usability.factors.push(...contextUsability.factors);

    return usability;
  }

  // Utility methods
  calculateOverallQuality(factors) {
    const weights = {
      authority: 0.25,
      trust: 0.20,
      relevance: 0.15,
      accessibility: 0.15,
      seo: 0.15,
      security: 0.05,
      usability: 0.05
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(factors).forEach(([factor, data]) => {
      if (weights[factor] && data.score !== undefined) {
        weightedSum += data.score * weights[factor];
        totalWeight += weights[factor];
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  }

  identifyQualityIssues(linkInfo) {
    const issues = [];

    Object.entries(linkInfo.quality.factors).forEach(([factor, data]) => {
      if (data.score < 40) {
        issues.push(`Low ${factor} score: ${Math.round(data.score)}`);
      }
    });

    // Specific issue checks
    if (linkInfo.quality.factors.security.risk === 'high') {
      issues.push('High security risk detected');
    }
    if (linkInfo.text === '') {
      issues.push('Missing anchor text');
    }
    if (linkInfo.href.startsWith('javascript:')) {
      issues.push('JavaScript link detected');
    }

    return issues;
  }

  identifyQualityStrengths(linkInfo) {
    const strengths = [];

    Object.entries(linkInfo.quality.factors).forEach(([factor, data]) => {
      if (data.score >= 80) {
        strengths.push(`Excellent ${factor}: ${Math.round(data.score)}`);
      }
    });

    // Specific strength checks
    if (linkInfo.href.startsWith('https://')) {
      strengths.push('Secure HTTPS connection');
    }
    if (linkInfo.rel.includes('noopener')) {
      strengths.push('Proper security attributes');
    }

    return strengths;
  }

  isInternalLink(href, baseUrl) {
    if (!href || !baseUrl) return false;
    
    if (href.startsWith('/') || href.startsWith('#')) return true;
    
    try {
      const url = new URL(href);
      return url.hostname === baseUrl.hostname;
    } catch (e) {
      return false;
    }
  }

  isExternalLink(href, baseUrl) {
    if (!href || !baseUrl) return false;
    
    if (!href.startsWith('http')) return false;
    
    try {
      const url = new URL(href);
      return url.hostname !== baseUrl.hostname;
    } catch (e) {
      return false;
    }
  }

  extractDomain(href) {
    try {
      const url = new URL(href);
      return url.hostname;
    } catch (e) {
      return null;
    }
  }

  extractTLD(domain) {
    if (!domain) return '';
    const parts = domain.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  }

  getLinkContext(element) {
    return {
      element,
      parent: element.parentElement?.tagName.toLowerCase(),
      section: this.identifySection(element),
      isInNavigation: this.isInNavigation(element),
      isInContent: this.isInContent(element),
      isInFooter: this.isInFooter(element)
    };
  }

  // Assessment helper methods
  isDescriptiveAnchor(text) {
    return text.length > 5 && 
           !/^(click here|read more|more|here|this|that)$/i.test(text);
  }

  isGenericAnchor(text) {
    return /^(click here|read more|more|here|this|that|link|website)$/i.test(text);
  }

  isActionOriented(text) {
    return /\b(download|buy|shop|learn|discover|explore|contact|subscribe)\b/i.test(text);
  }

  getContextualRelevance(element) {
    const context = { score: 0, factors: [] };
    
    // Check surrounding text
    const parent = element.parentElement;
    if (parent) {
      const surroundingText = parent.textContent || '';
      if (surroundingText.length > 50) {
        context.score += 10;
        context.factors.push('Rich contextual content');
      }
    }

    // Check section relevance
    const section = this.identifySection(element);
    if (section === 'main' || section === 'article') {
      context.score += 5;
      context.factors.push('In main content area');
    }

    return context;
  }

  assessAnchorSEO(text) {
    const seo = { score: 0, factors: [] };
    
    if (!text) {
      seo.score = -10;
      seo.factors.push('Missing anchor text');
      return seo;
    }

    // Length optimization
    if (text.length >= 10 && text.length <= 60) {
      seo.score += 10;
      seo.factors.push('Optimal anchor length');
    }

    // Keyword density
    const words = text.split(/\s+/);
    if (words.length >= 2 && words.length <= 6) {
      seo.score += 5;
      seo.factors.push('Good keyword phrase length');
    }

    // Avoid generic terms
    if (!this.isGenericAnchor(text.toLowerCase())) {
      seo.score += 5;
      seo.factors.push('Non-generic anchor text');
    }

    return seo;
  }

  assessPositionValue(position) {
    // Earlier links generally have more SEO value
    if (position < 5) return 5;
    if (position < 10) return 3;
    if (position < 20) return 1;
    return 0;
  }

  assessContextUsability(element) {
    const usability = { score: 0, factors: [] };
    
    // Check if link is properly spaced
    const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : null;
    if (computedStyle) {
      const padding = computedStyle.padding;
      if (padding && padding !== '0px') {
        usability.score += 5;
        usability.factors.push('Adequate padding');
      }
    }

    // Check for clear visual distinction
    if (element.style.textDecoration || element.style.color) {
      usability.score += 5;
      usability.factors.push('Visual link styling');
    }

    return usability;
  }

  hasSecurityAttributes(link) {
    return link.rel.includes('noopener') || link.rel.includes('noreferrer');
  }

  hasTrustedDomain(href) {
    const domain = this.extractDomain(href);
    return domain && this.qualityFactors.domain.trusted.some(trusted => 
      domain.includes(trusted));
  }

  isSuspiciousDomain(domain) {
    return this.qualityFactors.domain.suspicious.some(suspicious => 
      domain.includes(suspicious));
  }

  identifySection(element) {
    const sections = ['header', 'nav', 'main', 'article', 'aside', 'footer'];
    
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      if (sections.includes(tag)) {
        return tag;
      }
      current = current.parentElement;
    }
    
    return 'unknown';
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

  // Quality calculation and analysis methods
  calculateLinkValue(document) {
    const links = document.querySelectorAll('a[href]');
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href*="' + 
      (window.location ? window.location.hostname : '') + '"]');
    
    return {
      score: Math.min(100, (internalLinks.length / Math.max(1, links.length)) * 100),
      internal: internalLinks.length,
      total: links.length
    };
  }

  assessAnchorOptimization(document) {
    const anchors = document.querySelectorAll('a[href]');
    let optimized = 0;
    
    anchors.forEach(anchor => {
      const text = anchor.textContent?.trim();
      if (text && text.length >= 10 && text.length <= 60 && 
          !this.isGenericAnchor(text.toLowerCase())) {
        optimized++;
      }
    });
    
    return {
      score: anchors.length > 0 ? (optimized / anchors.length) * 100 : 0,
      optimized,
      total: anchors.length
    };
  }

  assessInternalLinking(document) {
    const internal = document.querySelectorAll('a[href^="/"]').length;
    const total = document.querySelectorAll('a[href]').length;
    
    return {
      score: total > 0 ? Math.min(100, (internal / total) * 150) : 0,
      count: internal,
      percentage: total > 0 ? (internal / total) * 100 : 0
    };
  }

  assessExternalLinking(document) {
    const external = document.querySelectorAll('a[href^="http"]').length;
    const nofollow = document.querySelectorAll('a[href^="http"][rel*="nofollow"]').length;
    
    return {
      score: external > 0 ? (nofollow / external) * 100 : 100,
      external,
      nofollow,
      percentage: external > 0 ? (nofollow / external) * 100 : 0
    };
  }

  assessNofollowStrategy(document) {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    const nofollowLinks = document.querySelectorAll('a[href^="http"][rel*="nofollow"]');
    
    const percentage = externalLinks.length > 0 ? 
      (nofollowLinks.length / externalLinks.length) * 100 : 0;
    
    // Optimal nofollow usage is around 60-80% for external links
    let score = 100;
    if (percentage < 40 || percentage > 90) score = 60;
    else if (percentage >= 60 && percentage <= 80) score = 100;
    else score = 80;
    
    return {
      score,
      percentage,
      external: externalLinks.length,
      nofollow: nofollowLinks.length
    };
  }

  assessLoadImpact(document) {
    const links = document.querySelectorAll('a[href]').length;
    let score = 100;
    
    if (links > 500) score = 40;
    else if (links > 200) score = 60;
    else if (links > 100) score = 80;
    
    return { score, linkCount: links };
  }

  assessRenderBlocking(document) {
    // Simplified render blocking assessment
    const jsLinks = document.querySelectorAll('a[href^="javascript:"]').length;
    return {
      score: jsLinks === 0 ? 100 : Math.max(50, 100 - (jsLinks * 10)),
      jsLinks
    };
  }

  assessResourceOptimization(document) {
    // Check for optimized link structures
    const totalLinks = document.querySelectorAll('a[href]').length;
    const optimizedLinks = document.querySelectorAll('a[href]:not([onclick]):not([href^="javascript:"])').length;
    
    return {
      score: totalLinks > 0 ? (optimizedLinks / totalLinks) * 100 : 100,
      optimized: optimizedLinks,
      total: totalLinks
    };
  }

  assessCaching(document) {
    // Simplified caching assessment
    return { score: 75, status: 'assumed-optimal' };
  }

  analyzeQualityTrends(document) {
    // Placeholder for trend analysis
    return { improving: true, stable: false, declining: false };
  }

  analyzeQualityPatterns(document) {
    // Placeholder for pattern analysis
    return { consistent: true, variable: false };
  }

  calculateQualityScore(analysis) {
    let score = 50;

    // Overall quality factor
    if (analysis.quality.average >= 75) score += 25;
    else if (analysis.quality.average >= 60) score += 15;
    else if (analysis.quality.average < 40) score -= 20;

    // Authority factor
    if (analysis.authority.enabled !== false) {
      score += (analysis.authority.averageScore - 50) * 0.3;
    }

    // Trust factor
    if (analysis.trust.enabled !== false) {
      score += (analysis.trust.score - 50) * 0.2;
    }

    // SEO quality factor
    if (analysis.seo.enabled !== false) {
      score += (analysis.seo.score - 50) * 0.2;
    }

    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Quality recommendations
    if (analysis.quality.average < 60) {
      recommendations.push({
        type: 'quality-improvement',
        priority: 'high',
        category: 'Link Quality',
        issue: 'Below-average link quality detected',
        recommendation: 'Review and improve link authority, trust, and relevance',
        impact: 'high'
      });
    }

    // Security recommendations
    if (analysis.trust.enabled !== false && analysis.trust.score < 50) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        category: 'Link Security',
        issue: 'Security concerns with link configuration',
        recommendation: 'Add proper security attributes and use HTTPS links',
        impact: 'high'
      });
    }

    // Authority recommendations
    if (analysis.authority.enabled !== false && analysis.authority.averageScore < 50) {
      recommendations.push({
        type: 'authority',
        priority: 'medium',
        category: 'Link Authority',
        issue: 'Low average link authority',
        recommendation: 'Focus on linking to higher-authority sources',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  handleDetectionError(error) {
    return {
      category: 'Link Quality Detection',
      subcategory: 'Detection Error',
      error: error.message,
      links: [],
      count: 0,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Link quality detection failed',
        recommendation: 'Review link structure and try again'
      }]
    };
  }
}
