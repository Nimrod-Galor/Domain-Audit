/**
 * Performance Analyzer Validation Test (Jest/CommonJS version)
 * 
 * This test validates the complete Combined Approach implementation for the Performance Analyzer.
 * It ensures all GPT-5 style modular components work together correctly.
 */

const { JSDOM } = require('jsdom');

// Mock the ES modules for CommonJS tests
jest.mock('../../src/analyzers/performance/index.js', () => {
  const PerformanceAnalyzer = require('../../src/analyzers/performance/performance-analyzer-modern.js').PerformanceAnalyzer;
  return { PerformanceAnalyzer };
});

/**
 * Create test context for analysis
 */
function createTestContext() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page</title>
        <link rel="stylesheet" href="/styles.css">
        <script src="/app.js" async></script>
      </head>
      <body>
        <h1>Test Performance Page</h1>
        <img src="/image1.jpg" alt="Test Image 1">
        <img src="/image2.png" alt="Test Image 2" loading="lazy">
        <script>
          console.log('Inline script');
        </script>
      </body>
    </html>
  `;

  const dom = new JSDOM(html, { url: 'https://example.com/test' });
  
  return {
    document: dom.window.document,
    dom: dom.window,
    url: 'https://example.com/test',
    pageData: {
      title: 'Test Page',
      meta: {}
    }
  };
}

describe('Performance Analyzer Validation', () => {
  let PerformanceAnalyzer;

  beforeAll(async () => {
    // Import the module dynamically
    const module = require('../../src/analyzers/performance/performance-analyzer-modern.js');
    PerformanceAnalyzer = module.PerformanceAnalyzer;
  });

  describe('Analyzer Initialization', () => {
    test('should initialize analyzer correctly', () => {
      const analyzer = new PerformanceAnalyzer();
      
      expect(analyzer.name).toBe('PerformanceAnalyzer');
      expect(analyzer.detectors).toBeDefined();
      expect(analyzer.heuristics).toBeDefined();
      expect(analyzer.scoringEngine).toBeDefined();
      expect(analyzer.config).toBeDefined();
      
      // Check detectors
      expect(analyzer.detectors.resource).toBeDefined();
      expect(analyzer.detectors.metrics).toBeDefined();
      
      // Check heuristics
      expect(analyzer.heuristics.optimization).toBeDefined();
    });
  });

  describe('Metadata Retrieval', () => {
    test('should return correct metadata', () => {
      const analyzer = new PerformanceAnalyzer();
      const metadata = analyzer.getMetadata();
      
      expect(metadata.name).toBe('PerformanceAnalyzer');
      expect(metadata.version).toBe('2.0.0');
      expect(metadata.approach).toBe('Combined (GPT-5 + Claude + Existing)');
      expect(Array.isArray(metadata.capabilities)).toBe(true);
      expect(metadata.capabilities.length).toBeGreaterThan(0);
      expect(metadata.priority).toBe('high');
    });
  });

  describe('Heuristic Analysis', () => {
    test('should perform heuristic analysis correctly', async () => {
      const analyzer = new PerformanceAnalyzer();
      const context = createTestContext();
      
      const results = await analyzer.performHeuristicAnalysis(context);
      
      // Check results structure
      expect(results.detection).toBeDefined();
      expect(results.analysis).toBeDefined();
      expect(typeof results.score).toBe('number');
      expect(results.metadata).toBeDefined();
      expect(results.metadata.approach).toBe('heuristics');
      
      // Check detection results
      expect(results.detection.resources).toBeDefined();
      expect(results.detection.metrics).toBeDefined();
      
      // Check analysis results
      expect(results.analysis).toBeDefined();
      expect(results.analysis.resourceOptimization).toBeDefined();
    });
  });

  describe('AI Enhancement', () => {
    test('should handle AI enhancement without errors', async () => {
      const analyzer = new PerformanceAnalyzer({ enableAIEnhancement: true });
      const context = createTestContext();
      
      // First get heuristic results
      const heuristicResults = await analyzer.performHeuristicAnalysis(context);
      
      // Then test AI enhancement
      const enhancedResults = await analyzer.performAIEnhancement(heuristicResults, context);
      
      // AI enhancement should either enhance or fallback gracefully
      expect(enhancedResults).toBeDefined();
      expect(enhancedResults.metadata).toBeDefined();
    });
  });

  describe('Scoring Engine', () => {
    test('should calculate performance scores correctly', () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test scoring engine initialization
      expect(analyzer.scoringEngine).toBeDefined();
      
      // Test scoring with mock data
      const mockAnalysisResults = {
        coreWebVitals: {
          lcp: { value: 2000, status: 'good' },
          fid: { value: 80, status: 'good' },
          cls: { value: 0.05, status: 'good' }
        },
        resourceOptimization: {
          images: { unoptimizedImages: 2, impact: 'medium' },
          scripts: { blockingScripts: 1, impact: 'low' }
        },
        loadingStrategy: { score: 85 },
        thirdParty: { impact: 'low', domains: 3 }
      };
      
      const scoringResults = analyzer.scoringEngine.calculatePerformanceScore(mockAnalysisResults);
      
      expect(scoringResults.overall).toBeDefined();
      expect(typeof scoringResults.overall.score).toBe('number');
      expect(scoringResults.overall.grade).toBeDefined();
      expect(scoringResults.breakdown).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    test('should manage configuration correctly', () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test configuration retrieval
      const config = analyzer.getConfiguration();
      expect(config.config).toBeDefined();
      expect(config.validation).toBeDefined();
      
      // Test feature flags
      const featureEnabled = analyzer.isFeatureEnabled('coreWebVitalsV2');
      expect(typeof featureEnabled).toBe('boolean');
      
      // Test configuration updates
      analyzer.updateConfiguration({ 
        features: { testFeature: true }
      });
      
      expect(analyzer.isFeatureEnabled('testFeature')).toBe(true);
    });
  });

  describe('Performance Budgets', () => {
    test('should handle performance budgets correctly', () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test budget retrieval
      const budgets = analyzer.getPerformanceBudgets();
      expect(budgets.overall).toBeDefined();
      expect(budgets.scripts).toBeDefined();
      expect(budgets.images).toBeDefined();
      
      // Test budget compliance assessment
      const mockAnalysisResults = {
        detection: {
          resources: {
            summary: {
              scripts: { count: 5 },
              images: { count: 20 }
            }
          }
        },
        estimatedSize: 1500000 // 1.5MB
      };
      
      const compliance = analyzer.assessBudgetCompliance(mockAnalysisResults);
      expect(compliance).toBeDefined();
    });
  });

  describe('Context Validation', () => {
    test('should validate context correctly', () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test valid context
      const validContext = createTestContext();
      expect(analyzer.validate(validContext)).toBe(true);
      
      // Test invalid contexts
      expect(analyzer.validate(null)).toBe(false);
      expect(analyzer.validate({})).toBe(false);
      expect(analyzer.validate({ document: null })).toBe(false);
    });
  });

  describe('Complete Analysis Flow', () => {
    test('should perform complete analysis correctly', async () => {
      const analyzer = new PerformanceAnalyzer();
      const context = createTestContext();
      
      // Test the full analyze method (inherited from BaseAnalyzer)
      const results = await analyzer.analyze(context);
      
      // Check complete results structure
      expect(results).toBeDefined();
      expect(results.detection).toBeDefined();
      expect(results.analysis).toBeDefined();
      expect(typeof results.score).toBe('number');
      expect(results.metadata).toBeDefined();
      
      // Check that score is reasonable (0-100)
      expect(results.score).toBeGreaterThanOrEqual(0);
      expect(results.score).toBeLessThanOrEqual(100);
    }, 10000); // 10 second timeout for complete analysis
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully', async () => {
      const analyzer = new PerformanceAnalyzer();
      
      // Test with invalid context
      await expect(analyzer.analyze({ invalid: 'context' })).rejects.toThrow();
      
      // Test AI enhancement fallback
      const validContext = createTestContext();
      const heuristicResults = await analyzer.performHeuristicAnalysis(validContext);
      
      // AI enhancement should not throw even if it fails
      const enhancedResults = await analyzer.performAIEnhancement(heuristicResults, validContext);
      expect(enhancedResults).toBeDefined();
    });
  });
});
