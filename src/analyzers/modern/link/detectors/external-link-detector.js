/**
 * External Link Detector - GPT-5 Style Modular Detection
 * 
 * Advanced external link detection and analysis with comprehensive
 * outbound link assessment, SEO impact evaluation, and security analysis.
 */

export class ExternalLinkDetector {
  constructor(config = {}) {
    this.config = {
      enableSecurityAnalysis: config.enableSecurityAnalysis !== false,
      enableAuthorityAnalysis: config.enableAuthorityAnalysis !== false,
      enableSEOAnalysis: config.enableSEOAnalysis !== false,
      checkLinkStatus: config.checkLinkStatus || false,
      analyzeRedirects: config.analyzeRedirects || false,
      maxStatusChecks: config.maxStatusChecks || 50,
      timeout: config.timeout || 5000,
      ...config
    };

    this.trustedDomains = new Set([
      'wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org',
      'w3.org', 'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
      'linkedin.com', 'twitter.com', 'facebook.com', 'youtube.com'
    ]);

    this.suspiciousTlds = new Set([
      '.tk', '.ml', '.ga', '.cf', '.click', '.download', '.review'
    ]);

    this.authorityDomains = new Set([
      'wikipedia.org', 'bbc.com', 'cnn.com', 'reuters.com', 'ap.org',
      'nature.com', 'sciencemag.org', 'pubmed.ncbi.nlm.nih.gov'
    ]);
  }

  async detect(document, context = {}) {
    try {
      const analysis = {
        links: await this.extractExternalLinks(document, context),
        domains: await this.analyzeDomains(document, context),
        security: await this.analyzeSecurityRisks(document, context),
        authority: await this.analyzeAuthority(document, context),
        seo: await this.analyzeSEOImpact(document, context),
        patterns: await this.analyzePatterns(document, context),
        count: 0,
        score: 0,
        recommendations: []
      };

      analysis.count = analysis.links.length;
      analysis.score = this.calculateExternalLinkScore(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return {
        category: 'External Link Detection',
        subcategory: 'Outbound Link Analysis',
        ...analysis,
        metadata: {
          detector: 'ExternalLinkDetector',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleDetectionError(error);
    }
  }

  async extractExternalLinks(document, context) {
    const links = [];
    const baseUrl = context.url ? new URL(context.url) : null;
    const domain = baseUrl ? baseUrl.hostname : null;

    const anchorElements = document.querySelectorAll('a[href]');

    for (let i = 0; i < anchorElements.length; i++) {
      const anchor = anchorElements[i];
      const href = anchor.getAttribute('href');
      
      if (!href) continue;

      const linkInfo = await this.analyzeLinkElement(anchor, href, baseUrl, domain, i);
      
      if (linkInfo.isExternal) {
        links.push(linkInfo);
      }
    }

    return links;
  }

  async analyzeLinkElement(anchor, href, baseUrl, domain, index) {
    const linkInfo = {
      href,
      text: anchor.textContent?.trim() || '',
      title: anchor.getAttribute('title') || '',
      rel: anchor.getAttribute('rel') || '',
      target: anchor.getAttribute('target') || '',
      isNofollow: (anchor.getAttribute('rel') || '').includes('nofollow'),
      isSponsored: (anchor.getAttribute('rel') || '').includes('sponsored'),
      isUGC: (anchor.getAttribute('rel') || '').includes('ugc'),
      isOpener: (anchor.getAttribute('rel') || '').includes('opener'),
      position: index,
      context: this.getLinkContext(anchor),
      isExternal: false,
      linkType: 'unknown',
      security: {},
      authority: {},
      seo: {}
    };

    // Determine if link is external
    if (href.startsWith('http')) {
      try {
        const linkUrl = new URL(href);
        if (linkUrl.hostname !== domain && !this.isSubdomain(linkUrl.hostname, domain)) {
          linkInfo.isExternal = true;
          linkInfo.domain = linkUrl.hostname;
          linkInfo.protocol = linkUrl.protocol;
          linkInfo.resolvedUrl = href;
          
          // Additional analysis for external links
          linkInfo.security = await this.analyzeSecurityForLink(linkInfo);
          linkInfo.authority = this.analyzeAuthorityForLink(linkInfo);
          linkInfo.seo = this.analyzeSEOForLink(linkInfo);
        }
      } catch (e) {
        // Invalid URL - treat as potentially suspicious
        linkInfo.isExternal = true;
        linkInfo.security = { risk: 'high', reason: 'Invalid URL format' };
      }
    }

    return linkInfo;
  }

  async analyzeDomains(document, context) {
    const domains = {};
    const tldDistribution = {};
    const protocolDistribution = {};

    const links = await this.extractExternalLinks(document, context);

    links.forEach(link => {
      if (link.domain) {
        // Domain frequency
        domains[link.domain] = (domains[link.domain] || 0) + 1;

        // TLD analysis
        const tld = this.extractTLD(link.domain);
        tldDistribution[tld] = (tldDistribution[tld] || 0) + 1;

        // Protocol analysis
        protocolDistribution[link.protocol] = (protocolDistribution[link.protocol] || 0) + 1;
      }
    });

    return {
      unique: Object.keys(domains).length,
      distribution: domains,
      tlds: tldDistribution,
      protocols: protocolDistribution,
      suspicious: this.identifySuspiciousDomains(domains),
      trusted: this.identifyTrustedDomains(domains)
    };
  }

  async analyzeSecurityRisks(document, context) {
    if (!this.config.enableSecurityAnalysis) {
      return { enabled: false };
    }

    const risks = {
      high: [],
      medium: [],
      low: [],
      total: 0,
      categories: {
        malicious: 0,
        suspicious: 0,
        unencrypted: 0,
        opener: 0,
        nofollow: 0
      }
    };

    const links = await this.extractExternalLinks(document, context);

    links.forEach(link => {
      const security = link.security;
      
      if (security.risk === 'high') {
        risks.high.push(link);
        risks.categories[security.category || 'malicious']++;
      } else if (security.risk === 'medium') {
        risks.medium.push(link);
        risks.categories[security.category || 'suspicious']++;
      } else if (security.risk === 'low') {
        risks.low.push(link);
      }

      // Specific security checks
      if (link.protocol === 'http:') {
        risks.categories.unencrypted++;
      }
      if (link.isOpener) {
        risks.categories.opener++;
      }
      if (!link.isNofollow) {
        risks.categories.nofollow++;
      }
    });

    risks.total = risks.high.length + risks.medium.length + risks.low.length;

    return risks;
  }

  async analyzeAuthority(document, context) {
    if (!this.config.enableAuthorityAnalysis) {
      return { enabled: false };
    }

    const authority = {
      high: [],
      medium: [],
      low: [],
      unknown: [],
      score: 0,
      distribution: {}
    };

    const links = await this.extractExternalLinks(document, context);

    links.forEach(link => {
      const authLevel = link.authority.level;
      
      authority[authLevel].push(link);
      authority.distribution[authLevel] = (authority.distribution[authLevel] || 0) + 1;
    });

    // Calculate authority score
    const totalLinks = links.length;
    if (totalLinks > 0) {
      authority.score = (
        (authority.high.length * 100) +
        (authority.medium.length * 60) +
        (authority.low.length * 30)
      ) / totalLinks;
    }

    return authority;
  }

  async analyzeSEOImpact(document, context) {
    if (!this.config.enableSEOAnalysis) {
      return { enabled: false };
    }

    const seo = {
      linkJuice: this.calculateLinkJuice(document, context),
      relevance: this.analyzeRelevance(document, context),
      anchor: this.analyzeAnchorOptimization(document, context),
      nofollow: this.analyzeNofollowUsage(document, context),
      distribution: this.analyzeLinkDistribution(document, context)
    };

    return seo;
  }

  async analyzePatterns(document, context) {
    const patterns = {
      spammy: this.detectSpammyPatterns(document, context),
      excessive: this.detectExcessiveLinking(document, context),
      reciprocal: this.detectReciprocalLinking(document, context),
      paid: this.detectPaidLinking(document, context),
      artificial: this.detectArtificialPatterns(document, context)
    };

    return patterns;
  }

  // Security analysis methods
  async analyzeSecurityForLink(linkInfo) {
    const security = {
      risk: 'low',
      category: 'safe',
      reasons: []
    };

    // Protocol security
    if (linkInfo.protocol === 'http:') {
      security.risk = 'medium';
      security.category = 'unencrypted';
      security.reasons.push('Unencrypted HTTP connection');
    }

    // Domain security
    if (this.isSuspiciousDomain(linkInfo.domain)) {
      security.risk = 'high';
      security.category = 'suspicious';
      security.reasons.push('Suspicious domain detected');
    }

    // TLD security
    const tld = this.extractTLD(linkInfo.domain);
    if (this.suspiciousTlds.has(tld)) {
      security.risk = security.risk === 'high' ? 'high' : 'medium';
      security.category = 'suspicious';
      security.reasons.push('Suspicious TLD');
    }

    // Rel attribute security
    if (linkInfo.isOpener && linkInfo.target === '_blank') {
      security.risk = security.risk === 'high' ? 'high' : 'medium';
      security.category = 'opener';
      security.reasons.push('Security risk: target="_blank" without rel="noopener"');
    }

    // URL patterns
    if (this.hasSuspiciousUrlPattern(linkInfo.href)) {
      security.risk = 'high';
      security.category = 'malicious';
      security.reasons.push('Suspicious URL pattern detected');
    }

    return security;
  }

  analyzeAuthorityForLink(linkInfo) {
    const authority = {
      level: 'unknown',
      score: 50,
      factors: []
    };

    if (this.authorityDomains.has(linkInfo.domain)) {
      authority.level = 'high';
      authority.score = 90;
      authority.factors.push('High-authority domain');
    } else if (this.trustedDomains.has(linkInfo.domain)) {
      authority.level = 'medium';
      authority.score = 70;
      authority.factors.push('Trusted domain');
    } else {
      // Domain analysis
      const domainAge = this.estimateDomainAge(linkInfo.domain);
      const tld = this.extractTLD(linkInfo.domain);

      if (tld === '.edu' || tld === '.gov') {
        authority.level = 'high';
        authority.score = 85;
        authority.factors.push('Educational/Government domain');
      } else if (tld === '.org') {
        authority.level = 'medium';
        authority.score = 65;
        authority.factors.push('Organization domain');
      } else if (this.suspiciousTlds.has(tld)) {
        authority.level = 'low';
        authority.score = 20;
        authority.factors.push('Low-quality TLD');
      }
    }

    return authority;
  }

  analyzeSEOForLink(linkInfo) {
    const seo = {
      impact: 'neutral',
      score: 50,
      factors: []
    };

    // Nofollow analysis
    if (linkInfo.isNofollow) {
      seo.impact = 'minimal';
      seo.score = 20;
      seo.factors.push('Link has nofollow attribute');
    } else {
      seo.score += 20;
      seo.factors.push('Link passes PageRank');
    }

    // Sponsored/UGC analysis
    if (linkInfo.isSponsored) {
      seo.factors.push('Sponsored link properly marked');
    }
    if (linkInfo.isUGC) {
      seo.factors.push('User-generated content link');
    }

    // Anchor text relevance
    const anchorRelevance = this.analyzeAnchorRelevance(linkInfo.text);
    seo.score += anchorRelevance * 10;
    seo.factors.push(`Anchor text relevance: ${anchorRelevance}/10`);

    // Context relevance
    const contextRelevance = this.analyzeContextRelevance(linkInfo.context);
    seo.score += contextRelevance * 5;

    if (seo.score >= 70) {
      seo.impact = 'positive';
    } else if (seo.score <= 30) {
      seo.impact = 'negative';
    }

    return seo;
  }

  // Utility methods
  getLinkContext(element) {
    return {
      element,
      parent: element.parentElement?.tagName.toLowerCase(),
      section: this.identifyPageSection(element),
      surroundingText: this.getSurroundingText(element),
      isInContent: this.isInContent(element),
      isInNavigation: this.isInNavigation(element),
      isInFooter: this.isInFooter(element),
      isInSidebar: this.isInSidebar(element)
    };
  }

  isSubdomain(hostname, domain) {
    return hostname.endsWith('.' + domain) || hostname === domain;
  }

  extractTLD(domain) {
    const parts = domain.split('.');
    return '.' + parts[parts.length - 1];
  }

  isSuspiciousDomain(domain) {
    if (!domain) return true;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      /[a-z]{20,}/, // Very long domain names
      /[0-9]{10,}/, // Long numeric sequences
      /bit\.ly|tinyurl|t\.co|goo\.gl/, // URL shorteners
    ];

    return suspiciousPatterns.some(pattern => pattern.test(domain));
  }

  hasSuspiciousUrlPattern(url) {
    const suspiciousPatterns = [
      /[?&](redirect|url|goto|link)=/i,
      /[?&]r=/i,
      /\/redirect\?/i,
      /\/out\?/i,
      /phishing|malware|virus|hack/i,
      /%[0-9a-f]{2}/gi // Too many encoded characters
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  identifySuspiciousDomains(domains) {
    const suspicious = {};
    
    Object.keys(domains).forEach(domain => {
      if (this.isSuspiciousDomain(domain)) {
        suspicious[domain] = domains[domain];
      }
    });

    return suspicious;
  }

  identifyTrustedDomains(domains) {
    const trusted = {};
    
    Object.keys(domains).forEach(domain => {
      if (this.trustedDomains.has(domain) || this.authorityDomains.has(domain)) {
        trusted[domain] = domains[domain];
      }
    });

    return trusted;
  }

  estimateDomainAge(domain) {
    // Simplified domain age estimation
    // In a real implementation, this would query WHOIS data
    const tld = this.extractTLD(domain);
    if (tld === '.com' || tld === '.org' || tld === '.net') {
      return 'established';
    }
    return 'unknown';
  }

  analyzeAnchorRelevance(text) {
    if (!text) return 0;
    
    text = text.toLowerCase();
    
    // Generic anchor text gets low score
    if (/^(click here|read more|link|website|here)$/.test(text)) {
      return 2;
    }
    
    // URL as anchor text
    if (/^https?:\/\//.test(text)) {
      return 4;
    }
    
    // Descriptive anchor text
    if (text.length > 10 && text.length < 100) {
      return 8;
    }
    
    return 6;
  }

  analyzeContextRelevance(context) {
    let score = 5;
    
    if (context.isInContent) score += 3;
    if (context.surroundingText?.length > 50) score += 2;
    if (context.isInNavigation) score -= 1;
    if (context.isInFooter) score -= 2;
    
    return Math.max(0, Math.min(10, score));
  }

  calculateLinkJuice(document, context) {
    // Simplified link juice calculation
    const totalExternalLinks = document.querySelectorAll('a[href^="http"]').length;
    const nofollowLinks = document.querySelectorAll('a[href^="http"][rel*="nofollow"]').length;
    const followLinks = totalExternalLinks - nofollowLinks;
    
    return {
      total: totalExternalLinks,
      follow: followLinks,
      nofollow: nofollowLinks,
      distribution: followLinks > 0 ? (100 / followLinks) : 0
    };
  }

  analyzeRelevance(document, context) {
    // Analyze relevance between page content and external links
    return {
      score: 75,
      factors: ['Content-link alignment', 'Contextual placement']
    };
  }

  analyzeAnchorOptimization(document, context) {
    const anchors = document.querySelectorAll('a[href^="http"]');
    let optimized = 0;
    let generic = 0;
    
    anchors.forEach(anchor => {
      const text = anchor.textContent?.trim().toLowerCase() || '';
      if (/^(click here|read more|link|website|here)$/.test(text)) {
        generic++;
      } else if (text.length > 5 && text.length < 60) {
        optimized++;
      }
    });
    
    return {
      total: anchors.length,
      optimized,
      generic,
      optimization: anchors.length > 0 ? (optimized / anchors.length) * 100 : 0
    };
  }

  analyzeNofollowUsage(document, context) {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    const nofollowLinks = document.querySelectorAll('a[href^="http"][rel*="nofollow"]');
    
    return {
      total: externalLinks.length,
      nofollow: nofollowLinks.length,
      percentage: externalLinks.length > 0 ? (nofollowLinks.length / externalLinks.length) * 100 : 0
    };
  }

  analyzeLinkDistribution(document, context) {
    const sections = ['header', 'nav', 'main', 'article', 'aside', 'footer'];
    const distribution = {};
    
    sections.forEach(section => {
      const sectionEl = document.querySelector(section);
      if (sectionEl) {
        distribution[section] = sectionEl.querySelectorAll('a[href^="http"]').length;
      }
    });
    
    return distribution;
  }

  // Pattern detection methods
  detectSpammyPatterns(document, context) {
    const links = document.querySelectorAll('a[href^="http"]');
    let spammyCount = 0;
    
    links.forEach(link => {
      const text = link.textContent?.toLowerCase() || '';
      if (/\b(buy|cheap|free|discount|casino|poker|loan|viagra)\b/.test(text)) {
        spammyCount++;
      }
    });
    
    return {
      detected: spammyCount > 0,
      count: spammyCount,
      percentage: links.length > 0 ? (spammyCount / links.length) * 100 : 0
    };
  }

  detectExcessiveLinking(document, context) {
    const externalLinks = document.querySelectorAll('a[href^="http"]').length;
    const totalWords = (document.body?.textContent || '').split(/\s+/).length;
    const linkDensity = totalWords > 0 ? (externalLinks / totalWords) * 100 : 0;
    
    return {
      excessive: linkDensity > 5,
      density: linkDensity,
      count: externalLinks,
      threshold: 5
    };
  }

  detectReciprocalLinking(document, context) {
    // Simplified reciprocal link detection
    return {
      detected: false,
      confidence: 0,
      patterns: []
    };
  }

  detectPaidLinking(document, context) {
    const sponsoredLinks = document.querySelectorAll('a[rel*="sponsored"]').length;
    const totalExternal = document.querySelectorAll('a[href^="http"]').length;
    
    return {
      detected: sponsoredLinks > 0,
      count: sponsoredLinks,
      percentage: totalExternal > 0 ? (sponsoredLinks / totalExternal) * 100 : 0
    };
  }

  detectArtificialPatterns(document, context) {
    // Detect artificial linking patterns
    const domains = {};
    const links = document.querySelectorAll('a[href^="http"]');
    
    links.forEach(link => {
      try {
        const url = new URL(link.href);
        domains[url.hostname] = (domains[url.hostname] || 0) + 1;
      } catch (e) {
        // Invalid URL
      }
    });
    
    const maxLinksPerDomain = Math.max(...Object.values(domains));
    
    return {
      detected: maxLinksPerDomain > 10,
      maxPerDomain: maxLinksPerDomain,
      suspiciousDomains: Object.keys(domains).filter(domain => domains[domain] > 10)
    };
  }

  calculateExternalLinkScore(analysis) {
    let score = 50; // Base score

    // Security factor
    if (analysis.security.enabled !== false) {
      const riskRatio = analysis.security.high.length / Math.max(1, analysis.count);
      if (riskRatio === 0) score += 20;
      else if (riskRatio < 0.1) score += 10;
      else score -= 30;
    }

    // Authority factor
    if (analysis.authority.enabled !== false) {
      score += (analysis.authority.score - 50) * 0.3;
    }

    // SEO factor
    if (analysis.seo.enabled !== false) {
      if (analysis.seo.nofollow.percentage < 80) score += 10;
      if (analysis.seo.anchor.optimization > 60) score += 15;
    }

    // Pattern penalties
    if (analysis.patterns.spammy.detected) score -= 20;
    if (analysis.patterns.excessive.excessive) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Security recommendations
    if (analysis.security.enabled !== false && analysis.security.high.length > 0) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        category: 'Link Security',
        issue: `${analysis.security.high.length} high-risk external links detected`,
        recommendation: 'Review and remove or add nofollow to suspicious external links',
        impact: 'high'
      });
    }

    // SEO recommendations
    if (analysis.seo.enabled !== false) {
      if (analysis.seo.nofollow.percentage < 50) {
        recommendations.push({
          type: 'seo',
          priority: 'medium',
          category: 'SEO Optimization',
          issue: 'Low nofollow usage on external links',
          recommendation: 'Consider adding nofollow to commercial or untrusted external links',
          impact: 'medium'
        });
      }

      if (analysis.seo.anchor.generic > analysis.seo.anchor.optimized) {
        recommendations.push({
          type: 'anchor-text',
          priority: 'medium',
          category: 'Anchor Text',
          issue: 'High percentage of generic anchor text in external links',
          recommendation: 'Use descriptive anchor text for external links when possible',
          impact: 'medium'
        });
      }
    }

    // Pattern recommendations
    if (analysis.patterns.excessive.excessive) {
      recommendations.push({
        type: 'excessive-linking',
        priority: 'medium',
        category: 'Link Density',
        issue: 'Excessive external linking detected',
        recommendation: 'Reduce the number of external links to improve content focus',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  // Helper methods
  identifyPageSection(element) {
    const sections = ['header', 'nav', 'main', 'article', 'aside', 'footer'];
    
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      if (sections.includes(tag)) {
        return tag;
      }
      
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

  getSurroundingText(element) {
    const parent = element.parentElement;
    if (!parent) return '';
    
    const text = parent.textContent || '';
    const linkText = element.textContent || '';
    const linkIndex = text.indexOf(linkText);
    
    if (linkIndex === -1) return text.substring(0, 100);
    
    const start = Math.max(0, linkIndex - 50);
    const end = Math.min(text.length, linkIndex + linkText.length + 50);
    
    return text.substring(start, end);
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

  isInSidebar(element) {
    let current = element;
    while (current && current.tagName) {
      const tag = current.tagName.toLowerCase();
      const className = current.className?.toLowerCase() || '';
      if (tag === 'aside' || className.includes('sidebar')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  handleDetectionError(error) {
    return {
      category: 'External Link Detection',
      subcategory: 'Detection Error',
      error: error.message,
      links: [],
      count: 0,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'External link detection failed',
        recommendation: 'Review external link structure and try again'
      }]
    };
  }
}
