/**
 * Broken Link Detector - GPT-5 Style Modular Detection
 * 
 * Advanced broken link detection with status checking,
 * redirect analysis, and comprehensive link health assessment.
 */

export class BrokenLinkDetector {
  constructor(config = {}) {
    this.config = {
      enableStatusChecking: config.enableStatusChecking || false,
      enableRedirectAnalysis: config.enableRedirectAnalysis || false,
      enableCacheChecking: config.enableCacheChecking || false,
      timeout: config.timeout || 10000,
      maxRedirects: config.maxRedirects || 5,
      batchSize: config.batchSize || 10,
      skipPatterns: config.skipPatterns || [],
      retryAttempts: config.retryAttempts || 2,
      userAgent: config.userAgent || 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
      ...config
    };

    this.statusCodes = {
      success: [200, 201, 202, 203, 204, 205, 206],
      redirect: [300, 301, 302, 303, 304, 307, 308],
      clientError: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 422, 423, 424, 425, 426, 428, 429, 431, 451],
      serverError: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511]
    };

    this.brokenPatterns = {
      obvious: [
        /404/i,
        /not.?found/i,
        /page.?not.?found/i,
        /broken.?link/i,
        /dead.?link/i,
        /invalid.?url/i
      ],
      suspicious: [
        /javascript:void/i,
        /javascript:;/i,
        /^#$/,
        /^mailto:$/,
        /^tel:$/
      ],
      malformed: [
        /^https?:\/\/$/,
        /^\/\/$/,
        /\s/,
        /[<>"`]/
      ]
    };
  }

  async detect(document, context = {}) {
    try {
      const analysis = {
        links: await this.extractAllLinks(document, context),
        broken: [],
        working: [],
        suspicious: [],
        redirects: [],
        status: await this.analyzeStatus(document, context),
        patterns: await this.analyzePatterns(document, context),
        health: await this.assessLinkHealth(document, context),
        count: 0,
        score: 0,
        recommendations: []
      };

      analysis.count = analysis.links.length;
      
      // Categorize links based on analysis
      analysis.links.forEach(link => {
        if (link.status === 'broken') {
          analysis.broken.push(link);
        } else if (link.status === 'working') {
          analysis.working.push(link);
        } else if (link.status === 'suspicious') {
          analysis.suspicious.push(link);
        } else if (link.status === 'redirect') {
          analysis.redirects.push(link);
        }
      });

      analysis.score = this.calculateHealthScore(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return {
        category: 'Broken Link Detection',
        subcategory: 'Link Health Analysis',
        ...analysis,
        metadata: {
          detector: 'BrokenLinkDetector',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          processingTime: context.processingTime || 0
        }
      };
    } catch (error) {
      return this.handleDetectionError(error);
    }
  }

  async extractAllLinks(document, context) {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    const baseUrl = context.url ? new URL(context.url) : null;

    for (let i = 0; i < linkElements.length; i++) {
      const linkElement = linkElements[i];
      const href = linkElement.getAttribute('href');
      
      if (!href || this.shouldSkipLink(href)) continue;

      const linkInfo = await this.analyzeLinkElement(linkElement, href, baseUrl, i);
      links.push(linkInfo);
    }

    return links;
  }

  async analyzeLinkElement(linkElement, href, baseUrl, index) {
    const linkInfo = {
      href,
      originalHref: href,
      text: linkElement.textContent?.trim() || '',
      title: linkElement.getAttribute('title') || '',
      position: index,
      element: linkElement,
      context: this.getLinkContext(linkElement),
      resolvedUrl: this.resolveUrl(href, baseUrl),
      type: this.classifyLinkType(href, baseUrl),
      status: 'unknown',
      statusCode: null,
      statusText: '',
      redirectChain: [],
      responseTime: null,
      lastChecked: null,
      error: null,
      issues: [],
      health: {}
    };

    // Initial pattern-based analysis
    linkInfo.status = this.analyzePatternStatus(href);
    linkInfo.issues = this.identifyPatternIssues(href);

    // Perform status checking if enabled
    if (this.config.enableStatusChecking && linkInfo.status !== 'broken') {
      try {
        const statusResult = await this.checkLinkStatus(linkInfo.resolvedUrl);
        linkInfo.statusCode = statusResult.statusCode;
        linkInfo.statusText = statusResult.statusText;
        linkInfo.responseTime = statusResult.responseTime;
        linkInfo.redirectChain = statusResult.redirectChain;
        linkInfo.lastChecked = new Date().toISOString();
        linkInfo.status = this.determineStatusFromCode(statusResult.statusCode);
        
        if (statusResult.error) {
          linkInfo.error = statusResult.error;
          linkInfo.status = 'broken';
        }
      } catch (error) {
        linkInfo.error = error.message;
        linkInfo.status = 'broken';
      }
    }

    // Health assessment
    linkInfo.health = this.assessLinkHealth(linkInfo);

    return linkInfo;
  }

  async analyzeStatus(document, context) {
    if (!this.config.enableStatusChecking) {
      return { enabled: false };
    }

    const status = {
      total: 0,
      checked: 0,
      working: 0,
      broken: 0,
      redirected: 0,
      timeout: 0,
      error: 0,
      distribution: {},
      averageResponseTime: 0,
      checkDuration: 0
    };

    const startTime = Date.now();
    const links = await this.extractAllLinks(document, context);
    
    status.total = links.length;

    for (const link of links) {
      if (link.statusCode !== null) {
        status.checked++;
        
        if (link.status === 'working') status.working++;
        else if (link.status === 'broken') status.broken++;
        else if (link.status === 'redirect') status.redirected++;
        
        if (link.error) {
          if (link.error.includes('timeout')) status.timeout++;
          else status.error++;
        }

        // Status code distribution
        if (link.statusCode) {
          const codeRange = Math.floor(link.statusCode / 100) * 100;
          status.distribution[codeRange] = (status.distribution[codeRange] || 0) + 1;
        }
      }
    }

    // Calculate average response time
    const responseTimes = links
      .filter(link => link.responseTime !== null)
      .map(link => link.responseTime);
    
    if (responseTimes.length > 0) {
      status.averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    status.checkDuration = Date.now() - startTime;

    return status;
  }

  async analyzePatterns(document, context) {
    const patterns = {
      malformed: this.detectMalformedLinks(document),
      suspicious: this.detectSuspiciousLinks(document),
      javascript: this.detectJavaScriptLinks(document),
      empty: this.detectEmptyLinks(document),
      mailto: this.detectMailtoLinks(document),
      tel: this.detectTelLinks(document),
      anchor: this.detectAnchorLinks(document)
    };

    return patterns;
  }

  async assessLinkHealth(document, context) {
    const health = {
      overall: 0,
      metrics: {
        availability: 0,
        performance: 0,
        reliability: 0,
        maintenance: 0
      },
      issues: {
        critical: [],
        major: [],
        minor: []
      },
      trends: this.analyzeTrends(document),
      maintenance: this.analyzeMaintenanceNeeds(document)
    };

    const links = await this.extractAllLinks(document, context);
    
    if (links.length === 0) {
      return health;
    }

    // Calculate availability
    const workingLinks = links.filter(link => link.status === 'working').length;
    health.metrics.availability = (workingLinks / links.length) * 100;

    // Calculate performance
    const avgResponseTime = this.calculateAverageResponseTime(links);
    health.metrics.performance = Math.max(0, 100 - (avgResponseTime / 100)); // Adjust scale as needed

    // Calculate reliability
    const reliableLinks = links.filter(link => 
      link.status === 'working' && !link.error
    ).length;
    health.metrics.reliability = (reliableLinks / links.length) * 100;

    // Calculate maintenance score
    const maintenanceIssues = links.filter(link => 
      link.issues.length > 0 || link.status === 'suspicious'
    ).length;
    health.metrics.maintenance = Math.max(0, 100 - (maintenanceIssues / links.length) * 100);

    // Overall health score
    health.overall = Object.values(health.metrics).reduce((sum, score) => sum + score, 0) / 4;

    // Categorize issues
    links.forEach(link => {
      if (link.status === 'broken') {
        health.issues.critical.push({
          link: link.href,
          issue: 'Broken link',
          severity: 'critical'
        });
      } else if (link.status === 'suspicious') {
        health.issues.major.push({
          link: link.href,
          issue: 'Suspicious link pattern',
          severity: 'major'
        });
      } else if (link.issues.length > 0) {
        health.issues.minor.push({
          link: link.href,
          issues: link.issues,
          severity: 'minor'
        });
      }
    });

    return health;
  }

  // Status checking methods
  async checkLinkStatus(url) {
    if (!url || !this.isCheckableUrl(url)) {
      return {
        statusCode: null,
        statusText: 'Skipped',
        responseTime: 0,
        redirectChain: [],
        error: 'URL not checkable'
      };
    }

    const startTime = Date.now();
    let redirectChain = [];
    let currentUrl = url;
    let attempts = 0;

    try {
      // Note: In a real browser environment, fetch API has CORS limitations
      // This is a simplified implementation that would need server-side checking
      while (attempts < this.config.maxRedirects) {
        const response = await this.performRequest(currentUrl);
        
        redirectChain.push({
          url: currentUrl,
          status: response.status,
          statusText: response.statusText
        });

        if (this.statusCodes.redirect.includes(response.status)) {
          const location = response.headers.get('location');
          if (location) {
            currentUrl = new URL(location, currentUrl).href;
            attempts++;
            continue;
          }
        }

        return {
          statusCode: response.status,
          statusText: response.statusText,
          responseTime: Date.now() - startTime,
          redirectChain,
          error: null
        };
      }

      return {
        statusCode: null,
        statusText: 'Too many redirects',
        responseTime: Date.now() - startTime,
        redirectChain,
        error: 'Maximum redirects exceeded'
      };

    } catch (error) {
      return {
        statusCode: null,
        statusText: 'Error',
        responseTime: Date.now() - startTime,
        redirectChain,
        error: error.message
      };
    }
  }

  async performRequest(url) {
    // Note: This is a simplified implementation
    // In a real environment, this would need proper error handling for CORS, etc.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to reduce bandwidth
        signal: controller.signal,
        headers: {
          'User-Agent': this.config.userAgent
        },
        mode: 'no-cors' // This limits the response information we can get
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Pattern analysis methods
  analyzePatternStatus(href) {
    // Check for obviously broken patterns
    for (const pattern of this.brokenPatterns.obvious) {
      if (pattern.test(href)) {
        return 'broken';
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.brokenPatterns.suspicious) {
      if (pattern.test(href)) {
        return 'suspicious';
      }
    }

    // Check for malformed patterns
    for (const pattern of this.brokenPatterns.malformed) {
      if (pattern.test(href)) {
        return 'broken';
      }
    }

    return 'unknown';
  }

  identifyPatternIssues(href) {
    const issues = [];

    // Malformed URL issues
    if (/\s/.test(href)) {
      issues.push('Contains whitespace');
    }
    if (/[<>"`]/.test(href)) {
      issues.push('Contains invalid characters');
    }
    if (href.startsWith('https://') && href.length === 8) {
      issues.push('Incomplete HTTPS URL');
    }
    if (href.startsWith('http://') && href.length === 7) {
      issues.push('Incomplete HTTP URL');
    }

    // Suspicious patterns
    if (href === '#') {
      issues.push('Empty anchor link');
    }
    if (href.startsWith('javascript:void')) {
      issues.push('Void JavaScript link');
    }
    if (/mailto:$/.test(href)) {
      issues.push('Empty mailto link');
    }

    // Protocol issues
    if (href.startsWith('http://') && !href.includes('localhost')) {
      issues.push('Insecure HTTP protocol');
    }

    return issues;
  }

  detectMalformedLinks(document) {
    const malformed = [];
    const links = document.querySelectorAll('a[href]');

    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      if (this.brokenPatterns.malformed.some(pattern => pattern.test(href))) {
        malformed.push({
          href,
          element: link,
          position: index,
          issue: 'Malformed URL structure'
        });
      }
    });

    return {
      detected: malformed.length > 0,
      count: malformed.length,
      links: malformed
    };
  }

  detectSuspiciousLinks(document) {
    const suspicious = [];
    const links = document.querySelectorAll('a[href]');

    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      if (this.brokenPatterns.suspicious.some(pattern => pattern.test(href))) {
        suspicious.push({
          href,
          element: link,
          position: index,
          issue: 'Suspicious link pattern'
        });
      }
    });

    return {
      detected: suspicious.length > 0,
      count: suspicious.length,
      links: suspicious
    };
  }

  detectJavaScriptLinks(document) {
    const jsLinks = Array.from(document.querySelectorAll('a[href^="javascript:"]'));
    
    return {
      detected: jsLinks.length > 0,
      count: jsLinks.length,
      links: jsLinks.map((link, index) => ({
        href: link.getAttribute('href'),
        element: link,
        position: index,
        type: this.categorizeJavaScriptLink(link.getAttribute('href'))
      }))
    };
  }

  detectEmptyLinks(document) {
    const emptyLinks = Array.from(document.querySelectorAll('a[href=""], a[href="#"]'));
    
    return {
      detected: emptyLinks.length > 0,
      count: emptyLinks.length,
      links: emptyLinks.map((link, index) => ({
        href: link.getAttribute('href'),
        element: link,
        position: index,
        text: link.textContent?.trim() || ''
      }))
    };
  }

  detectMailtoLinks(document) {
    const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
    
    return {
      detected: mailtoLinks.length > 0,
      count: mailtoLinks.length,
      valid: mailtoLinks.filter(link => this.isValidMailto(link.getAttribute('href'))).length,
      invalid: mailtoLinks.filter(link => !this.isValidMailto(link.getAttribute('href'))).length,
      links: mailtoLinks.map((link, index) => ({
        href: link.getAttribute('href'),
        element: link,
        position: index,
        valid: this.isValidMailto(link.getAttribute('href'))
      }))
    };
  }

  detectTelLinks(document) {
    const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
    
    return {
      detected: telLinks.length > 0,
      count: telLinks.length,
      valid: telLinks.filter(link => this.isValidTel(link.getAttribute('href'))).length,
      invalid: telLinks.filter(link => !this.isValidTel(link.getAttribute('href'))).length,
      links: telLinks.map((link, index) => ({
        href: link.getAttribute('href'),
        element: link,
        position: index,
        valid: this.isValidTel(link.getAttribute('href'))
      }))
    };
  }

  detectAnchorLinks(document) {
    const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    
    return {
      detected: anchorLinks.length > 0,
      count: anchorLinks.length,
      valid: anchorLinks.filter(link => this.isValidAnchor(link.getAttribute('href'), document)).length,
      invalid: anchorLinks.filter(link => !this.isValidAnchor(link.getAttribute('href'), document)).length,
      links: anchorLinks.map((link, index) => ({
        href: link.getAttribute('href'),
        element: link,
        position: index,
        valid: this.isValidAnchor(link.getAttribute('href'), document)
      }))
    };
  }

  // Utility methods
  shouldSkipLink(href) {
    if (!href) return true;
    
    return this.config.skipPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return href.includes(pattern);
      } else if (pattern instanceof RegExp) {
        return pattern.test(href);
      }
      return false;
    });
  }

  classifyLinkType(href, baseUrl) {
    if (!href) return 'unknown';

    if (href.startsWith('#')) return 'anchor';
    if (href.startsWith('mailto:')) return 'mailto';
    if (href.startsWith('tel:')) return 'tel';
    if (href.startsWith('javascript:')) return 'javascript';
    if (href.startsWith('/')) return 'internal';
    
    try {
      const url = new URL(href);
      if (baseUrl && url.hostname === baseUrl.hostname) {
        return 'internal';
      }
      return 'external';
    } catch (e) {
      return 'malformed';
    }
  }

  resolveUrl(href, baseUrl) {
    if (!href || !baseUrl) return href;

    try {
      return new URL(href, baseUrl.href).href;
    } catch (e) {
      return href;
    }
  }

  isCheckableUrl(url) {
    if (!url) return false;
    
    // Skip non-HTTP(S) protocols
    if (!/^https?:\/\//.test(url)) return false;
    
    // Skip localhost and development URLs (optional)
    if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url)) return false;
    
    return true;
  }

  determineStatusFromCode(statusCode) {
    if (!statusCode) return 'broken';
    
    if (this.statusCodes.success.includes(statusCode)) return 'working';
    if (this.statusCodes.redirect.includes(statusCode)) return 'redirect';
    if (this.statusCodes.clientError.includes(statusCode)) return 'broken';
    if (this.statusCodes.serverError.includes(statusCode)) return 'broken';
    
    return 'unknown';
  }

  assessLinkHealth(linkInfo) {
    const health = {
      score: 50,
      status: linkInfo.status,
      factors: [],
      issues: linkInfo.issues || []
    };

    // Status-based scoring
    switch (linkInfo.status) {
      case 'working':
        health.score = 90;
        health.factors.push('Link is working');
        break;
      case 'redirect':
        health.score = 70;
        health.factors.push('Link redirects (check if intentional)');
        break;
      case 'broken':
        health.score = 10;
        health.factors.push('Link is broken');
        break;
      case 'suspicious':
        health.score = 30;
        health.factors.push('Suspicious link pattern');
        break;
    }

    // Response time factor
    if (linkInfo.responseTime !== null) {
      if (linkInfo.responseTime < 1000) {
        health.score += 5;
        health.factors.push('Fast response time');
      } else if (linkInfo.responseTime > 5000) {
        health.score -= 10;
        health.factors.push('Slow response time');
      }
    }

    // Error factor
    if (linkInfo.error) {
      health.score -= 20;
      health.factors.push(`Error: ${linkInfo.error}`);
    }

    // Issues factor
    health.score -= linkInfo.issues.length * 5;

    health.score = Math.max(0, Math.min(100, health.score));
    return health;
  }

  categorizeJavaScriptLink(href) {
    if (href.includes('void(0)') || href.includes('void 0')) return 'void';
    if (href.includes('history.back') || href.includes('history.go')) return 'navigation';
    if (href.includes('window.open')) return 'popup';
    if (href.includes('alert') || href.includes('confirm')) return 'dialog';
    return 'other';
  }

  isValidMailto(href) {
    if (!href.startsWith('mailto:')) return false;
    
    const email = href.substring(7).split('?')[0];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidTel(href) {
    if (!href.startsWith('tel:')) return false;
    
    const number = href.substring(4);
    return /^[\d\-\+\(\)\s]+$/.test(number) && number.length > 0;
  }

  isValidAnchor(href, document) {
    if (!href.startsWith('#')) return false;
    if (href === '#') return false; // Empty anchor
    
    const id = href.substring(1);
    return document.getElementById(id) !== null;
  }

  getLinkContext(element) {
    return {
      element,
      parent: element.parentElement?.tagName.toLowerCase(),
      section: this.identifySection(element),
      text: element.textContent?.trim() || '',
      isVisible: this.isElementVisible(element)
    };
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

  isElementVisible(element) {
    const style = window.getComputedStyle ? window.getComputedStyle(element) : {};
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  calculateAverageResponseTime(links) {
    const responseTimes = links
      .filter(link => link.responseTime !== null && link.responseTime > 0)
      .map(link => link.responseTime);
    
    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
  }

  analyzeTrends(document) {
    // Placeholder for trend analysis
    return {
      improving: false,
      stable: true,
      declining: false,
      lastCheck: null
    };
  }

  analyzeMaintenanceNeeds(document) {
    // Placeholder for maintenance analysis
    return {
      immediate: [],
      scheduled: [],
      monitoring: []
    };
  }

  calculateHealthScore(analysis) {
    let score = 50;

    const totalLinks = analysis.count;
    if (totalLinks === 0) return 100; // No links = perfect score

    // Working links factor
    const workingPercentage = (analysis.working.length / totalLinks) * 100;
    score += (workingPercentage - 50) * 0.8;

    // Broken links penalty
    const brokenPercentage = (analysis.broken.length / totalLinks) * 100;
    score -= brokenPercentage * 2;

    // Suspicious links penalty
    const suspiciousPercentage = (analysis.suspicious.length / totalLinks) * 100;
    score -= suspiciousPercentage * 1.5;

    // Health metrics factor
    if (analysis.health.overall) {
      score += (analysis.health.overall - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Broken links recommendations
    if (analysis.broken.length > 0) {
      recommendations.push({
        type: 'broken-links',
        priority: 'high',
        category: 'Link Health',
        issue: `${analysis.broken.length} broken links detected`,
        recommendation: 'Fix or remove broken links to improve user experience and SEO',
        impact: 'high',
        affected: analysis.broken.length
      });
    }

    // Suspicious links recommendations
    if (analysis.suspicious.length > 0) {
      recommendations.push({
        type: 'suspicious-links',
        priority: 'medium',
        category: 'Link Quality',
        issue: `${analysis.suspicious.length} suspicious links detected`,
        recommendation: 'Review and fix suspicious link patterns',
        impact: 'medium',
        affected: analysis.suspicious.length
      });
    }

    // Pattern-based recommendations
    if (analysis.patterns.malformed.detected) {
      recommendations.push({
        type: 'malformed-links',
        priority: 'high',
        category: 'Link Structure',
        issue: `${analysis.patterns.malformed.count} malformed links detected`,
        recommendation: 'Fix malformed URLs to ensure proper functionality',
        impact: 'high'
      });
    }

    if (analysis.patterns.empty.detected) {
      recommendations.push({
        type: 'empty-links',
        priority: 'medium',
        category: 'Link Content',
        issue: `${analysis.patterns.empty.count} empty links detected`,
        recommendation: 'Add proper destinations to empty links or remove them',
        impact: 'medium'
      });
    }

    // Health-based recommendations
    if (analysis.health.overall < 60) {
      recommendations.push({
        type: 'link-health',
        priority: 'medium',
        category: 'Overall Health',
        issue: 'Overall link health is below optimal',
        recommendation: 'Implement regular link checking and maintenance procedures',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  handleDetectionError(error) {
    return {
      category: 'Broken Link Detection',
      subcategory: 'Detection Error',
      error: error.message,
      links: [],
      broken: [],
      working: [],
      count: 0,
      score: 0,
      recommendations: [{
        type: 'error',
        priority: 'high',
        issue: 'Broken link detection failed',
        recommendation: 'Review link structure and detection configuration'
      }]
    };
  }
}
