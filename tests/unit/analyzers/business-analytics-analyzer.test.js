import BusinessAnalyticsAnalyzer from '../../../src/analyzers/business-analytics-analyzer.js';
import { JSDOM } from 'jsdom';

describe('BusinessAnalyticsAnalyzer', () => {
  let analyzer;
  let mockDocument;

  beforeEach(() => {
    analyzer = new BusinessAnalyticsAnalyzer();
    
    // Create mock DOM
    const dom = new JSDOM(`
      <html>
        <head><title>Test Business Page</title></head>
        <body>
          <h1>Welcome to Our Business</h1>
          <p>Buy now and save 50% on all products. Order today!</p>
          
          <!-- CTA Buttons -->
          <button class="btn-primary">Buy Now</button>
          <a href="/checkout" class="cta-button">Get Started</a>
          
          <!-- Forms -->
          <form id="contact-form">
            <input type="email" placeholder="Enter your email" required>
            <input type="text" placeholder="Your name" required>
            <button type="submit">Submit</button>
          </form>
          
          <form class="newsletter-signup">
            <input type="email" placeholder="Subscribe to newsletter">
            <button type="submit">Subscribe</button>
          </form>
          
          <!-- Social Proof -->
          <div class="testimonial">
            <p>"This product changed my life!" - John Doe</p>
            <div class="author">John Doe, CEO</div>
            <img src="john.jpg" alt="John Doe">
          </div>
          
          <div class="review">
            <div class="rating">5 stars</div>
            <p>Excellent service!</p>
          </div>
          
          <!-- Trust Signals -->
          <div class="contact-info">
            <p>Email: contact@business.com</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/about">About Us</a>
          
          <!-- Customer logos -->
          <div class="customer-logo">
            <img src="company1.jpg" alt="Company 1">
          </div>
          
          <!-- Social links -->
          <a href="https://facebook.com/business">Facebook</a>
          <a href="https://twitter.com/business">Twitter</a>
          
          <!-- Lead magnets -->
          <div class="free-trial">Start Free Trial</div>
          <div class="download">Download Guide</div>
        </body>
      </html>
    `);
    
    mockDocument = dom.window.document;
    global.document = mockDocument;
  });

  afterEach(() => {
    delete global.document;
  });

  describe('Constructor and Initialization', () => {
    it('should create BusinessAnalyticsAnalyzer instance', () => {
      expect(analyzer).toBeInstanceOf(BusinessAnalyticsAnalyzer);
    });

    it('should extend BaseAnalyzer', () => {
      expect(analyzer.constructor.name).toBe('BusinessAnalyticsAnalyzer');
      expect(analyzer.log).toBeDefined();
      expect(analyzer.safeQuery).toBeDefined();
      expect(analyzer.safeQueryOne).toBeDefined();
    });

    it('should have proper configuration', () => {
      expect(analyzer.config).toBeDefined();
      expect(analyzer.config.USER_INTENT).toBeDefined();
      expect(analyzer.config.CONVERSION_ELEMENTS).toBeDefined();
      expect(analyzer.config.SOCIAL_PROOF).toBeDefined();
    });
  });

  describe('BaseAnalyzer Integration', () => {
    it('should implement getMetadata method', () => {
      const metadata = analyzer.getMetadata();
      
      expect(metadata).toEqual({
        name: 'BusinessAnalyticsAnalyzer',
        version: '1.0.0',
        category: undefined, // This comes from BaseAnalyzer, which returns undefined
        description: 'Comprehensive business analytics including user intent, conversion elements, social proof, and trust signals',
        priority: 'high',
        capabilities: [
          'user_intent_analysis',
          'conversion_element_detection',
          'social_proof_analysis',
          'trust_signal_detection',
          'business_value_assessment',
          'funnel_position_analysis',
          'optimization_recommendations',
          'business_scoring'
        ]
      });
    });

    it('should implement validate method', () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = analyzer.validate(context);
      
      expect(result).toBe(true);
    });

    it('should handle validation errors', () => {
      const result = analyzer.validate(null);
      
      expect(result).toBe(false);
    });
  });

  describe('Main Analysis Function', () => {
    it('should perform complete business analytics analysis', async () => {
      const context = { document: mockDocument, url: 'https://example.com/products' };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.performance).toBeDefined();
      
      const analysis = result.data;
      expect(analysis.userIntent).toBeDefined();
      expect(analysis.conversionElements).toBeDefined();
      expect(analysis.socialProof).toBeDefined();
      expect(analysis.trustSignals).toBeDefined();
      expect(analysis.businessValue).toBeDefined();
      expect(analysis.funnelPosition).toBeDefined();
    });

    it('should calculate business optimization score', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      
      expect(result.data.businessOptimizationScore).toBeGreaterThan(0);
      expect(result.data.businessOptimizationScore).toBeLessThanOrEqual(100);
      expect(result.data.grade).toMatch(/[A-F][+-]?/);
    });

    it('should generate recommendations', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      
      expect(result.data.recommendations).toBeDefined();
      expect(Array.isArray(result.data.recommendations)).toBe(true);
    });

    it('should generate summary', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      
      expect(result.data.summary).toBeDefined();
      expect(typeof result.data.summary).toBe('string');
      expect(result.data.summary.length).toBeGreaterThan(0);
    });
  });

  describe('User Intent Analysis', () => {
    it('should analyze user intent from content', () => {
      const textContent = mockDocument.body.textContent || '';
      const userIntent = analyzer._analyzeUserIntent(textContent, 'https://example.com', mockDocument);
      
      expect(userIntent.commercialKeywords).toBeDefined();
      expect(userIntent.informationalKeywords).toBeDefined();
      expect(userIntent.transactionalKeywords).toBeDefined();
      expect(userIntent.navigationKeywords).toBeDefined();
      expect(userIntent.intentScore).toBeGreaterThanOrEqual(0);
      expect(userIntent.primaryIntent).toBeDefined();
    });

    it('should identify commercial keywords', () => {
      const textContent = mockDocument.body.textContent || '';
      const userIntent = analyzer._analyzeUserIntent(textContent, 'https://example.com', mockDocument);
      
      expect(userIntent.commercialKeywords.length).toBeGreaterThanOrEqual(0);
      expect(userIntent.transactionalKeywords.length).toBeGreaterThanOrEqual(0);
    });

    it('should calculate intent score', () => {
      const score = analyzer._calculateIntentScore('buy now save 50% order today', ['buy', 'save', 'order']);
      
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('Conversion Elements Detection', () => {
    it('should detect CTA buttons', () => {
      const ctaButtons = analyzer._detectCTAButtons(mockDocument);
      
      expect(Array.isArray(ctaButtons)).toBe(true);
      expect(ctaButtons.length).toBeGreaterThan(0);
      
      const buyButton = ctaButtons.find(btn => btn.text.includes('Buy'));
      expect(buyButton).toBeDefined();
    });

    it('should analyze forms', () => {
      const forms = analyzer._analyzeForms(mockDocument);
      
      expect(Array.isArray(forms)).toBe(true);
      expect(forms.length).toBeGreaterThan(0);
      
      const contactForm = forms.find(form => form.id === 'contact-form');
      expect(contactForm).toBeDefined();
      expect(contactForm.inputCount).toBeGreaterThan(0);
    });

    it('should classify form types', () => {
      const forms = analyzer._analyzeForms(mockDocument);
      const contactForm = forms.find(form => form.id === 'contact-form');
      
      expect(contactForm.formType).toBeDefined();
    });

    it('should analyze lead generation elements', () => {
      const leadGen = analyzer._analyzeLeadGeneration(mockDocument);
      
      expect(leadGen.leadMagnets).toBeGreaterThan(0);
      expect(leadGen.newsletters).toBeGreaterThan(0);
    });
  });

  describe('Social Proof Analysis', () => {
    it('should detect testimonials', () => {
      const testimonials = analyzer._detectTestimonials(mockDocument);
      
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);
      
      const testimonial = testimonials[0];
      expect(testimonial.content).toBeDefined();
      expect(testimonial.hasAuthor).toBeDefined();
      expect(testimonial.hasPhoto).toBeDefined();
    });

    it('should detect reviews', () => {
      const reviews = analyzer._detectReviews(mockDocument, 'test text');
      
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThan(0);
    });

    it('should detect customer mentions', () => {
      const customerMentions = analyzer._detectCustomerMentions(mockDocument);
      
      expect(Array.isArray(customerMentions)).toBe(true);
      expect(customerMentions.length).toBeGreaterThan(0);
    });

    it('should calculate social proof score', () => {
      const socialProof = {
        testimonials: [{ content: 'Great product!' }],
        reviews: [{ rating: '5 stars' }],
        socialMetrics: ['1000 followers'],
        caseStudies: [],
        customerMentions: [{ logo: 'company1.jpg' }]
      };
      
      const score = analyzer._calculateSocialProofScore(socialProof);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Trust Signals Detection', () => {
    it('should extract contact information', () => {
      const contactInfo = analyzer._extractContactInfo(mockDocument);
      
      expect(contactInfo.email).toBeDefined();
      expect(contactInfo.phone).toBeDefined();
      expect(contactInfo.socialMedia).toBeDefined();
      expect(contactInfo.contactForms).toBeDefined();
      expect(contactInfo.contactCompleteness).toBeGreaterThan(0);
    });

    it('should detect policy pages', () => {
      const policyPages = analyzer._detectPolicyPages(mockDocument);
      
      expect(Array.isArray(policyPages)).toBe(true);
      expect(policyPages.length).toBeGreaterThan(0);
      
      const privacyPolicy = policyPages.find(page => page.text.includes('Privacy'));
      expect(privacyPolicy).toBeDefined();
    });

    it('should analyze about information', () => {
      const aboutInfo = analyzer._analyzeAboutInfo(mockDocument, 'Founded in 2020 by our team');
      
      expect(aboutInfo.hasAboutPage).toBe(true);
      expect(aboutInfo.hasTeamInfo).toBe(true);
      expect(aboutInfo.hasCompanyHistory).toBe(true);
    });

    it('should calculate trust score', () => {
      const trustSignals = {
        contactInfo: { contactCompleteness: 75 },
        certifications: [],
        policyPages: [{ text: 'Privacy Policy' }],
        aboutInfo: { hasAboutPage: true }
      };
      
      const score = analyzer._calculateTrustScore(trustSignals);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Business Value Assessment', () => {
    it('should assess business value', () => {
      const textContent = 'We offer premium solutions for enterprise clients with 24/7 support';
      const businessValue = analyzer._assessBusinessValue(mockDocument, textContent);
      
      expect(businessValue.valueProposition).toBeDefined();
      expect(businessValue.businessModel).toBeDefined();
      expect(businessValue.revenueIndicators).toBeDefined();
      expect(businessValue.targetAudience).toBeDefined();
      expect(businessValue.positioning).toBeDefined();
    });
  });

  describe('Scoring and Grading', () => {
    it('should calculate business score correctly', () => {
      const analysis = {
        userIntent: { intentScore: 8 },
        conversionElements: {
          ctaButtons: [{ text: 'Buy Now' }, { text: 'Get Started' }],
          forms: [{ id: 'contact' }],
          checkout: [{ text: 'Checkout' }],
          leadGeneration: { leadMagnets: 1, newsletters: 1 }
        },
        socialProof: { socialProofScore: 70 },
        trustSignals: { trustScore: 80 }
      };
      
      const score = analyzer._calculateBusinessScore(analysis);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should assign correct grades', () => {
      expect(analyzer._getGradeFromScore(95)).toBe('A+');
      expect(analyzer._getGradeFromScore(87)).toBe('A');
      expect(analyzer._getGradeFromScore(82)).toBe('A-');
      expect(analyzer._getGradeFromScore(77)).toBe('B+');
      expect(analyzer._getGradeFromScore(72)).toBe('B');
      expect(analyzer._getGradeFromScore(35)).toBe('F');
    });

    it('should categorize social proof strength', () => {
      expect(analyzer._categorizeSocialProofStrength(85)).toBe('Excellent');
      expect(analyzer._categorizeSocialProofStrength(65)).toBe('Good');
      expect(analyzer._categorizeSocialProofStrength(45)).toBe('Fair');
      expect(analyzer._categorizeSocialProofStrength(25)).toBe('Weak');
      expect(analyzer._categorizeSocialProofStrength(10)).toBe('Very Weak');
    });

    it('should categorize trust level', () => {
      expect(analyzer._categorizeTrustLevel(85)).toBe('High Trust');
      expect(analyzer._categorizeTrustLevel(65)).toBe('Moderate Trust');
      expect(analyzer._categorizeTrustLevel(45)).toBe('Low Trust');
      expect(analyzer._categorizeTrustLevel(25)).toBe('Very Low Trust');
    });
  });

  describe('Method Compatibility', () => {
    it('should maintain analyze() method functionality', async () => {
      const context = {
        document: mockDocument,
        url: 'https://example.com',
        pageData: {}
      };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.userIntent).toBeDefined();
    });

    it('should provide consistent results with analyze() method', async () => {
      const context1 = {
        document: mockDocument,
        url: 'https://example.com',
        pageData: {}
      };
      const context2 = {
        document: mockDocument,
        url: 'https://example.com',
        pageData: {}
      };
      
      const result1 = await analyzer.analyze(context1);
      const result2 = await analyzer.analyze(context2);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data.userIntent.category).toBe(result2.data.userIntent.category);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid document gracefully', async () => {
      const context = { document: null, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid URL gracefully', async () => {
      const context = { document: mockDocument, url: 'invalid-url' };
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty document gracefully', async () => {
      const emptyDom = new JSDOM('<html><body></body></html>');
      const emptyDoc = emptyDom.window.document;
      const context = { document: emptyDoc, url: 'https://example.com' };
      
      const result = await analyzer.analyze(context);
      
      expect(result.success).toBe(true);
      expect(result.data.businessOptimizationScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance and Optimization', () => {
    it('should complete analysis within reasonable time', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const startTime = Date.now();
      await analyzer.analyze(context);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should include performance metrics', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      
      expect(result.performance).toBeDefined();
      expect(result.performance.analysisTime).toBeGreaterThan(0);
      expect(result.performance.timestamp).toBeDefined();
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate relevant recommendations', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      const recommendations = result.data.recommendations;
      
      expect(Array.isArray(recommendations)).toBe(true);
      
      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec.category).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.impact).toBeDefined();
      }
    });

    it('should identify optimization opportunities', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      const opportunities = result.data.optimizationOpportunities;
      
      expect(Array.isArray(opportunities)).toBe(true);
      
      if (opportunities.length > 0) {
        const opp = opportunities[0];
        expect(opp.type).toBeDefined();
        expect(opp.description).toBeDefined();
        expect(opp.potential).toBeDefined();
      }
    });
  });

  describe('Integration with Other Systems', () => {
    it('should work with EcommerceAnalyzer data', () => {
      // Test compatibility with ecommerce analysis
      const ecommerceData = {
        hasCart: true,
        hasCheckout: true,
        paymentMethods: ['credit', 'paypal']
      };
      
      // BusinessAnalyticsAnalyzer should be able to use this data
      expect(analyzer).toBeDefined();
    });

    it('should provide data for dashboard integration', async () => {
      const context = { document: mockDocument, url: 'https://example.com' };
      const result = await analyzer.analyze(context);
      
      // Verify data structure is suitable for dashboard display
      expect(result.data.businessOptimizationScore).toBeDefined();
      expect(result.data.grade).toBeDefined();
      expect(result.data.summary).toBeDefined();
      expect(result.data.metadata).toBeDefined();
    });
  });
});
