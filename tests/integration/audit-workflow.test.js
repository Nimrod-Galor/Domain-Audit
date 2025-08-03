// Integration tests for complete audit workflow
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  AuditManager,
  DomainAudit,
  LinkAudit,
  ComprehensiveAudit
} from '../../bin/audit-manager.js';
import { NetworkManager } from '../../src/network/network-manager.js';
import { StorageManager } from '../../src/storage/storage-manager.js';

// Mock external dependencies
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Audit Workflow Integration Tests', () => {
  let auditManager;
  let mockHTML;
  let mockDomain;

  beforeEach(() => {
    auditManager = new AuditManager({
      enableCaching: true,
      maxConcurrentAudits: 3,
      outputFormat: 'json'
    });

    mockDomain = 'example.com';
    mockHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Test description for SEO">
    <meta name="keywords" content="test, seo, keywords">
    <title>Test Page Title</title>
    <link rel="canonical" href="https://example.com/">
    <link rel="stylesheet" href="styles.css">
    <script src="script.js"></script>
</head>
<body>
    <header>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="https://external.com">External Link</a>
        </nav>
    </header>
    <main>
        <h1>Welcome to Test Site</h1>
        <p>This is a test page with some content for analysis.</p>
        <img src="image.jpg" alt="Test image">
        <a href="/internal-page">Internal Link</a>
        <a href="mailto:test@example.com">Email Link</a>
    </main>
    <footer>
        <p>&copy; 2024 Test Site</p>
    </footer>
</body>
</html>`;

    // Mock successful HTTP responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([
        ['content-type', 'text/html'],
        ['content-length', '2048']
      ]),
      text: () => Promise.resolve(mockHTML),
      blob: () => Promise.resolve(new Blob([mockHTML])),
      json: () => Promise.resolve({})
    });

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await auditManager.cleanup();
  });

  describe('complete audit workflow', () => {
    test('should perform end-to-end audit successfully', async () => {
      // Mock a complete, well-optimized webpage response
      const mockHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Test Page - SEO Optimized Title</title>
  <meta name="description" content="This is a comprehensive test page with all the necessary SEO elements and optimization features for testing purposes">
  <link rel="canonical" href="https://test-example.com">
  <meta property="og:title" content="OG Test Title">
  <meta property="og:description" content="OG test description">
  <meta property="og:image" content="https://test-example.com/image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="robots" content="index,follow">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Test Page",
    "description": "Test description"
  }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main>
    <h1>Main Page Heading</h1>
    <h2>Secondary Heading</h2>
    <p>This is substantial content with good readability and proper structure.</p>
    <img src="/image.jpg" alt="Descriptive alt text">
    <a href="https://external-site.com">External Link</a>
    <a href="/internal-page">Internal Link</a>
  </main>
  <footer>
    <p>Footer content</p>
  </footer>
</body>
</html>`;

      // Mock the fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'text/html; charset=utf-8'],
          ['content-length', mockHTML.length.toString()]
        ]),
        text: () => Promise.resolve(mockHTML),
        url: 'https://test-example.com'
      });

      const url = 'https://test-example.com';
      const result = await crawlPageWithAnalytics(url, analyticsEngine);

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.url).toBe(url);
      expect(result.success).toBe(true);
      
      // Verify analytics data exists
      expect(result.analytics).toBeDefined();
      expect(result.analytics.scores).toBeDefined();
      expect(result.analytics.scores.overall).toBeDefined();
      
      // Verify scoring
      expect(typeof result.analytics.scores.overall.score).toBe('number');
      expect(result.analytics.scores.overall.score).toBeGreaterThan(0);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.analytics.scores.overall.grade);

      // Verify SEO data
      expect(result.seo).toBeDefined();
      expect(result.seo.title.text).toBe('Complete Test Page - SEO Optimized Title');
      expect(result.seo.metaDescription.text).toContain('comprehensive test page');

      // Verify technical data
      expect(result.technical).toBeDefined();
      expect(result.technical.httpStatus).toBe(200);

      // Verify content analysis
      expect(result.content).toBeDefined();
      expect(result.content.wordCount).toBeGreaterThan(0);

      // Verify accessibility
      expect(result.accessibility).toBeDefined();
      expect(result.accessibility.images).toBeDefined();
    }, 15000); // Extended timeout for integration test

    test('should handle HTTP errors gracefully', async () => {
      // Mock a 404 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map(),
        text: () => Promise.resolve('Page not found')
      });

      const url = 'https://test-example.com/nonexistent';
      const result = await crawlPageWithAnalytics(url, analyticsEngine);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('404');
    });

    test('should handle network timeouts', async () => {
      // Mock a network timeout
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      const url = 'https://test-example.com/slow';
      const result = await crawlPageWithAnalytics(url, analyticsEngine);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('timeout');
    });

    test('should analyze links correctly', async () => {
      const htmlWithManyLinks = `<!DOCTYPE html>
<html>
<head><title>Link Test</title></head>
<body>
  <a href="https://external1.com">External 1</a>
  <a href="https://external2.com">External 2</a>
  <a href="/internal1">Internal 1</a>
  <a href="/internal2">Internal 2</a>
  <a href="mailto:test@example.com">Email</a>
  <a href="tel:+1234567890">Phone</a>
  <a href="">Empty Link</a>
  <a>No href</a>
</body>
</html>`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html']]),
        text: () => Promise.resolve(htmlWithManyLinks),
        url: 'https://test-example.com'
      });

      const result = await crawlPageWithAnalytics('https://test-example.com', analyticsEngine);

      expect(result.success).toBe(true);
      expect(result.links).toBeDefined();
      expect(result.links.internal).toBeDefined();
      expect(result.links.external).toBeDefined();
      expect(result.links.email).toBeDefined();
      expect(result.links.phone).toBeDefined();
    });
  });

  describe('performance testing', () => {
    test('should complete audit within reasonable time', async () => {
      const standardHTML = createMockHTML('Performance Test', '<p>Content for performance testing</p>');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html']]),
        text: () => Promise.resolve(standardHTML)
      });

      const startTime = Date.now();
      const result = await crawlPageWithAnalytics('https://test-example.com', analyticsEngine);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      // Should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
