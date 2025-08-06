/**
 * Audit Data Factory
 * Creates test data for audit-related tests
 */

export class AuditFactory {
  /**
   * Create a basic audit result object
   */
  static createAuditResult(overrides = {}) {
    return {
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      status: 'completed',
      summary: {
        totalPages: 10,
        totalLinks: 50,
        score: 85,
        issues: 3
      },
      pages: [
        {
          url: 'https://example.com',
          title: 'Example Homepage',
          statusCode: 200,
          loadTime: 1200,
          size: 45000
        },
        {
          url: 'https://example.com/about',
          title: 'About Us',
          statusCode: 200,
          loadTime: 800,
          size: 32000
        }
      ],
      seo: {
        metaTitles: {
          missing: 0,
          duplicate: 0,
          tooLong: 1
        },
        metaDescriptions: {
          missing: 1,
          duplicate: 0,
          tooLong: 0
        },
        headings: {
          h1Missing: 0,
          h1Multiple: 1
        }
      },
      performance: {
        averageLoadTime: 1000,
        slowestPage: 'https://example.com',
        largestPage: 'https://example.com',
        totalSize: 77000
      },
      links: {
        internal: 25,
        external: 15,
        broken: 2
      },
      ...overrides
    };
  }

  /**
   * Create crawl state data
   */
  static createCrawlState(overrides = {}) {
    return {
      visited: new Set(['https://example.com', 'https://example.com/about']),
      queue: ['https://example.com/contact'],
      failed: new Map(),
      pageData: new Map([
        ['https://example.com', {
          title: 'Example Homepage',
          statusCode: 200,
          contentType: 'text/html',
          loadTime: 1200,
          size: 45000,
          links: ['https://example.com/about', 'https://example.com/contact']
        }]
      ]),
      externalLinks: {
        'https://google.com': { status: 200, lastChecked: Date.now() },
        'https://broken-link.com': { status: 404, lastChecked: Date.now() }
      },
      ...overrides
    };
  }

  /**
   * Create performance metrics
   */
  static createPerformanceMetrics(overrides = {}) {
    return {
      totalLoadTime: 5000,
      averageLoadTime: 1000,
      slowestPage: {
        url: 'https://example.com/slow',
        loadTime: 3000
      },
      fastestPage: {
        url: 'https://example.com/fast',
        loadTime: 500
      },
      totalSize: 250000,
      averageSize: 50000,
      largestPage: {
        url: 'https://example.com/large',
        size: 100000
      },
      distribution: {
        under1s: 3,
        under3s: 6,
        over3s: 1
      },
      ...overrides
    };
  }

  /**
   * Create SEO analysis results
   */
  static createSEOAnalysis(overrides = {}) {
    return {
      titles: {
        total: 10,
        missing: 1,
        duplicate: 2,
        tooShort: 1,
        tooLong: 1,
        optimal: 5
      },
      descriptions: {
        total: 10,
        missing: 2,
        duplicate: 1,
        tooShort: 2,
        tooLong: 0,
        optimal: 5
      },
      headings: {
        h1: { total: 10, missing: 1, multiple: 2 },
        h2: { total: 25, missing: 0 },
        structure: 'good'
      },
      images: {
        total: 15,
        missingAlt: 3,
        largeSizes: 2
      },
      links: {
        internal: 45,
        external: 12,
        broken: 2,
        redirects: 1
      },
      ...overrides
    };
  }

  /**
   * Create mock HTML content
   */
  static createMockHTML(options = {}) {
    const {
      title = 'Test Page',
      description = 'Test description',
      h1 = 'Main Heading',
      content = '<p>Test content</p>',
      links = [],
      images = []
    } = options;

    const linkElements = links.map(link => 
      `<a href="${link.url}">${link.text || 'Link'}</a>`
    ).join('\n');

    const imageElements = images.map(img => 
      `<img src="${img.src}" alt="${img.alt || ''}" />`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
</head>
<body>
  <h1>${h1}</h1>
  ${content}
  ${linkElements}
  ${imageElements}
</body>
</html>`;
  }

  /**
   * Create simple audit for performance testing
   */
  static createSimpleAudit(overrides = {}) {
    return {
      url: 'https://example.com',
      type: 'simple',
      maxPages: 1,
      timeout: 30000,
      ...overrides
    };
  }

  /**
   * Create medium audit for performance testing
   */
  static createMediumAudit(overrides = {}) {
    return {
      url: 'https://medium-site.com',
      type: 'comprehensive',
      maxPages: 25,
      timeout: 60000,
      ...overrides
    };
  }

  /**
   * Create large audit for performance testing
   */
  static createLargeAudit(overrides = {}) {
    return {
      url: 'https://large-site.com',
      type: 'comprehensive',
      maxPages: 100,
      timeout: 300000,
      ...overrides
    };
  }

  /**
   * Create audit with custom HTML content
   */
  static createAuditWithHTML(htmlContent, overrides = {}) {
    return {
      url: 'https://custom.com',
      type: 'simple',
      maxPages: 1,
      mockHTML: htmlContent,
      ...overrides
    };
  }

  /**
   * Create audit result with specific tier features
   */
  static createWithTierFeatures(tierLevel, overrides = {}) {
    const tierFeatures = {
      1: { // Basic
        maxPages: 25,
        features: ['basic_seo'],
        reportDetails: 'basic'
      },
      2: { // Pro
        maxPages: 100,
        features: ['basic_seo', 'advanced_seo', 'performance_monitoring'],
        reportDetails: 'detailed'
      },
      3: { // Enterprise
        maxPages: -1, // Unlimited
        features: ['basic_seo', 'advanced_seo', 'performance_monitoring', 'api_access', 'white_label'],
        reportDetails: 'comprehensive'
      }
    };

    const tierConfig = tierFeatures[tierLevel] || tierFeatures[1];
    
    return {
      ...this.createAuditResult(),
      tierLevel,
      maxPages: tierConfig.maxPages,
      availableFeatures: tierConfig.features,
      reportDetails: tierConfig.reportDetails,
      ...overrides
    };
  }
}

export default AuditFactory;
