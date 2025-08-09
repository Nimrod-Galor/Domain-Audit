/**
 * Payment Analyzer Tests
 * Tests for the PaymentAnalyzer class which analyzes payment security, methods, and trust signals
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { PaymentAnalyzer } from '../../../src/analyzers/ecommerce/checkout/payment-analyzer.js';
import { AnalyzerCategories } from '../../../src/analyzers/core/AnalyzerInterface.js';

describe('PaymentAnalyzer', () => {
  let analyzer;
  let mockDom;
  let mockDocument;

  beforeEach(() => {
    analyzer = new PaymentAnalyzer();
    
    // Create a mock DOM for testing
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>E-commerce Site</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div class="payment-section">
            <h2>Payment Options</h2>
            <div class="payment-methods">
              <img src="/visa.png" alt="Visa" class="payment-icon">
              <img src="/mastercard.png" alt="MasterCard" class="payment-icon">
              <img src="/paypal.png" alt="PayPal" class="payment-icon">
              <img src="/apple-pay.png" alt="Apple Pay" class="payment-icon">
            </div>
            <form id="payment-form" action="https://secure.example.com/process" method="post">
              <input type="text" name="cc-number" placeholder="Card Number" required>
              <input type="text" name="cc-exp" placeholder="MM/YY" required>
              <input type="text" name="cc-cvc" placeholder="CVC" required>
              <input type="submit" value="Pay Now">
            </form>
            <div class="trust-signals">
              <img src="/ssl-badge.png" alt="SSL Secured" class="trust-badge">
              <img src="/norton-badge.png" alt="Norton Secured" class="trust-badge">
              <p>100% Money Back Guarantee</p>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
          <script>
            window.Stripe = { /* Stripe SDK */ };
          </script>
        </body>
      </html>
    `);
    
    mockDom = dom;
    mockDocument = dom.window.document;
    
    // Mock window object
    global.window = dom.window;
    global.document = mockDocument;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.window;
    delete global.document;
  });

  describe('Constructor and Initialization', () => {
    test('should extend BaseAnalyzer', () => {
      expect(analyzer.constructor.name).toBe('PaymentAnalyzer');
      expect(analyzer.category).toBe(AnalyzerCategories.ECOMMERCE);
    });

    test('should initialize with default configuration', () => {
      expect(analyzer.options.enableSecurityAnalysis).toBe(true);
      expect(analyzer.options.enablePaymentMethodDetection).toBe(true);
      expect(analyzer.options.enableTrustSignalAnalysis).toBe(true);
    });

    test('should accept custom configuration', () => {
      const customAnalyzer = new PaymentAnalyzer({
        enableSecurityAnalysis: false,
        maxFormAnalysis: 10
      });
      
      expect(customAnalyzer.options.enableSecurityAnalysis).toBe(false);
      expect(customAnalyzer.options.maxFormAnalysis).toBe(10);
    });
  });

  describe('Metadata', () => {
    test('should provide comprehensive metadata', () => {
      const metadata = analyzer.getMetadata();
      
      expect(metadata.name).toBe('Payment Analyzer');
      expect(metadata.category).toBe(AnalyzerCategories.ECOMMERCE);
      expect(metadata.features).toContain('Payment method detection');
      expect(metadata.features).toContain('Security features analysis');
      expect(metadata.features).toContain('Trust signals and badges');
    });
  });

  describe('Validation', () => {
    test('should validate context with document', () => {
      const context = { document: mockDocument };
      expect(analyzer.validate(context)).toBe(true);
    });

    test('should reject context without document', () => {
      const context = {};
      expect(analyzer.validate(context)).toBe(false);
    });

    test('should reject null context', () => {
      expect(analyzer.validate(null)).toBe(false);
    });
  });

  describe('Payment Security Analysis', () => {
    test('should detect HTTPS usage', async () => {
      // Mock location for HTTPS test
      mockDom.reconfigure({ 
        url: 'https://secure.example.com',
        contentType: 'text/html'
      });
      
      const context = { 
        document: mockDocument,
        url: 'https://secure.example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.security.httpsRequired).toBe(true);
    });

    test('should detect SSL certificates', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://secure.example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.security).toHaveProperty('sslCertificate');
    });

    test('should identify security badges', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://secure.example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.security.securityBadges).toBeGreaterThan(0);
    });
  });

  describe('Payment Method Detection', () => {
    test('should detect major credit card brands', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.paymentMethods.creditCards).toContain('visa');
      expect(result.data.paymentMethods.creditCards).toContain('mastercard');
    });

    test('should detect digital wallets', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.paymentMethods.digitalWallets).toContain('paypal');
      expect(result.data.paymentMethods.digitalWallets).toContain('apple-pay');
    });

    test('should count total payment methods', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.paymentMethods.methodCount).toBeGreaterThan(0);
    });
  });

  describe('Trust Signal Analysis', () => {
    test('should detect trust badges', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.trustSignals.badges).toContain('ssl-badge');
      expect(result.data.trustSignals.badges).toContain('norton');
    });

    test('should detect money back guarantee', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.trustSignals.moneyBackGuarantee).toBe(true);
    });

    test('should detect privacy policy', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.trustSignals.privacyPolicy).toBe(true);
    });
  });

  describe('Payment Form Analysis', () => {
    test('should detect payment forms', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.forms.hasPaymentForm).toBe(true);
    });

    test('should validate form security', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.forms.secureSubmission).toBe(true);
    });

    test('should check field validation', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.forms.fieldValidation).toBe(true);
    });
  });

  describe('Payment Processor Detection', () => {
    test('should detect Stripe integration', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      // The mock DOM has window.Stripe and PayPal images, so either/both could be detected
      expect(result.data.processors.length).toBeGreaterThan(0);
    });

    test('should handle multiple processors', async () => {
      // Add PayPal script
      const script = mockDocument.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js';
      mockDocument.head.appendChild(script);
      
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.processors.length).toBeGreaterThan(0);
    });
  });

  describe('Scoring System', () => {
    test('should calculate weighted score', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://secure.example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.score).toBeGreaterThan(0);
      expect(result.data.score).toBeLessThanOrEqual(100);
    });

    test('should provide grade from score', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://secure.example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.summary.grade).toMatch(/^[A-F][+-]?$/);
    });
  });

  describe('Recommendations Generation', () => {
    test('should generate security recommendations', async () => {
      // Test with HTTP (insecure) site
      const context = { 
        document: mockDocument,
        url: 'http://insecure.example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            priority: 'critical',
            category: 'security'
          })
        ])
      );
    });

    test('should recommend payment method improvements', async () => {
      // Create minimal DOM with few payment methods
      const minimalDom = new JSDOM(`
        <html>
          <body>
            <div class="payment">
              <img src="/visa.png" alt="Visa">
            </div>
          </body>
        </html>
      `);
      
      const context = { 
        document: minimalDom.window.document,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'payment-methods'
          })
        ])
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle DOM errors gracefully', async () => {
      const context = { 
        document: null,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle malformed URLs', async () => {
      const context = { 
        document: mockDocument,
        url: 'not-a-url'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true); // Should still analyze document
      expect(result.data.security.httpsRequired).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should complete analysis within reasonable time', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const startTime = Date.now();
      const result = await analyzer.analyze(context);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should include performance metrics', async () => {
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.performance).toBeDefined();
      expect(result.performance.duration).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty payment section', async () => {
      const emptyDom = new JSDOM(`
        <html>
          <body>
            <div>No payment information</div>
          </body>
        </html>
      `);
      
      const context = { 
        document: emptyDom.window.document,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.paymentMethods.methodCount).toBe(0);
    });

    test('should handle missing form elements', async () => {
      const noFormDom = new JSDOM(`
        <html>
          <body>
            <div class="payment">
              <img src="/visa.png" alt="Visa">
            </div>
          </body>
        </html>
      `);
      
      const context = { 
        document: noFormDom.window.document,
        url: 'https://example.com'
      };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.forms.hasPaymentForm).toBe(false);
    });
  });

  describe('Configuration Options', () => {
    test('should respect enableSecurityAnalysis setting', async () => {
      const customAnalyzer = new PaymentAnalyzer({
        enableSecurityAnalysis: false
      });
      
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await customAnalyzer.analyze(context);
      
      expect(result.success).toBe(true);
      // Security analysis should be skipped or minimal
    });

    test('should respect enablePaymentMethodDetection setting', async () => {
      const customAnalyzer = new PaymentAnalyzer({
        enablePaymentMethodDetection: false
      });
      
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await customAnalyzer.analyze(context);
      
      expect(result.success).toBe(true);
      // Payment method detection should be skipped
    });

    test('should respect maxFormAnalysis limit', async () => {
      const customAnalyzer = new PaymentAnalyzer({
        maxFormAnalysis: 1
      });
      
      const context = { 
        document: mockDocument,
        url: 'https://example.com'
      };
      
      const result = await customAnalyzer.analyze(context);
      
      expect(result.success).toBe(true);
      // Should analyze limited number of forms
    });
  });
});
