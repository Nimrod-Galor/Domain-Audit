/**
 * IndexController Tests - Real Production Functions
 * Testing all 4 critical production functions in IndexController
 */

import { jest } from '@jest/globals';

// Mock dependencies before importing
const mockTierService = {
  getUserTierLimits: jest.fn()
};

jest.unstable_mockModule('../../web/services/tierService.js', () => ({
  default: mockTierService
}));

// Import after mocking
const {
  getHomePage,
  getAboutPage,
  getPricingPage,
  getContactPage
} = await import('../../web/controllers/indexController.js');

const tierService = await import('../../web/services/tierService.js');

describe('IndexController - Critical Production Functions', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Request
    mockReq = {
      session: {
        user: {
          id: 123,
          email: 'test@example.com',
          first_name: 'Test'
        }
      },
      query: {},
      params: {},
      body: {}
    };

    // Mock Response with all methods
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('1. getHomePage - Landing Page Function', () => {
    it('should render homepage with authenticated user', async () => {
      await getHomePage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('index', {
        title: 'SiteScope - Website Audit Tool',
        user: {
          id: 123,
          email: 'test@example.com',
          first_name: 'Test'
        },
        features: expect.arrayContaining([
          expect.objectContaining({
            icon: 'fas fa-tachometer-alt',
            title: 'Performance Analysis',
            description: 'Get detailed performance metrics and optimization recommendations'
          }),
          expect.objectContaining({
            icon: 'fas fa-search',
            title: 'SEO Audit',
            description: 'Comprehensive SEO analysis to improve your search rankings'
          }),
          expect.objectContaining({
            icon: 'fas fa-mobile-alt',
            title: 'Mobile Optimization',
            description: 'Ensure your site works perfectly on all devices'
          }),
          expect.objectContaining({
            icon: 'fas fa-shield-alt',
            title: 'Security Check',
            description: 'Identify potential security vulnerabilities'
          })
        ]),
        pricing: expect.arrayContaining([
          expect.objectContaining({
            name: 'Free',
            price: '$0',
            features: ['3 audits/month', 'Basic reports', 'Email support'],
            highlight: false
          }),
          expect.objectContaining({
            name: 'Professional',
            price: '$15',
            features: ['50 audits/month', 'Advanced reports', 'PDF exports', 'Priority support'],
            highlight: true
          }),
          expect.objectContaining({
            name: 'Business',
            price: '$35',
            features: ['200 audits/month', 'Batch processing', 'API access', 'White-label reports'],
            highlight: false
          })
        ])
      });
    });

    it('should render homepage with null user for unauthenticated visitors', async () => {
      mockReq.session = null;

      await getHomePage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('index', expect.objectContaining({
        title: 'SiteScope - Website Audit Tool',
        user: null,
        features: expect.any(Array),
        pricing: expect.any(Array)
      }));
    });

    it('should include all expected features in correct structure', async () => {
      await getHomePage(mockReq, mockRes);

      const renderCall = mockRes.render.mock.calls[0][1];
      expect(renderCall.features).toHaveLength(4);
      
      // Verify each feature has required properties
      renderCall.features.forEach(feature => {
        expect(feature).toHaveProperty('icon');
        expect(feature).toHaveProperty('title');
        expect(feature).toHaveProperty('description');
        expect(feature.icon).toMatch(/^fas fa-/);
      });
    });

    it('should include all pricing tiers with correct structure', async () => {
      await getHomePage(mockReq, mockRes);

      const renderCall = mockRes.render.mock.calls[0][1];
      expect(renderCall.pricing).toHaveLength(3);
      
      // Verify pricing structure
      renderCall.pricing.forEach(plan => {
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('features');
        expect(plan).toHaveProperty('highlight');
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });
  });

  describe('2. getAboutPage - About Page Function', () => {
    it('should render about page with authenticated user', async () => {
      await getAboutPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('about', {
        title: 'About - SiteScope',
        user: {
          id: 123,
          email: 'test@example.com',
          first_name: 'Test'
        }
      });
    });

    it('should render about page with null user for unauthenticated visitors', async () => {
      mockReq.session = null;

      await getAboutPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('about', {
        title: 'About - SiteScope',
        user: null
      });
    });

    it('should handle missing session gracefully', async () => {
      delete mockReq.session;

      await getAboutPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('about', {
        title: 'About - SiteScope',
        user: null
      });
    });
  });

  describe('3. getPricingPage - Pricing Page with Tier Integration', () => {
    it('should render pricing page with user tier information', async () => {
      tierService.default.getUserTierLimits.mockResolvedValue({
        tierName: 'professional',
        maxAudits: 50,
        maxPages: 500
      });

      await getPricingPage(mockReq, mockRes);

      expect(tierService.default.getUserTierLimits).toHaveBeenCalledWith(123);
      expect(mockRes.render).toHaveBeenCalledWith('pricing', {
        title: 'Pricing - Choose Your Plan',
        user: {
          id: 123,
          email: 'test@example.com',
          first_name: 'Test'
        },
        currentTier: 'professional'
      });
    });

    it('should render pricing page for unauthenticated users', async () => {
      mockReq.session = null;

      await getPricingPage(mockReq, mockRes);

      expect(tierService.default.getUserTierLimits).not.toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith('pricing', {
        title: 'Pricing - Choose Your Plan',
        user: null,
        currentTier: 'none'
      });
    });

    it('should handle tierService errors gracefully', async () => {
      tierService.default.getUserTierLimits.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await getPricingPage(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('Error loading pricing page:', expect.any(Error));
      expect(mockRes.render).toHaveBeenCalledWith('pricing', {
        title: 'Pricing - Choose Your Plan',
        user: {
          id: 123,
          email: 'test@example.com',
          first_name: 'Test'
        },
        currentTier: 'none'
      });

      consoleSpy.mockRestore();
    });

    it('should handle missing user ID in session', async () => {
      mockReq.session.user = { email: 'test@example.com' }; // No ID

      await getPricingPage(mockReq, mockRes);

      expect(tierService.default.getUserTierLimits).not.toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith('pricing', {
        title: 'Pricing - Choose Your Plan',
        user: { email: 'test@example.com' },
        currentTier: 'none'
      });
    });

    it('should default to freemium tier when no tier found', async () => {
      tierService.default.getUserTierLimits.mockResolvedValue({
        tierName: null,
        maxAudits: 3
      });

      await getPricingPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('pricing', expect.objectContaining({
        currentTier: 'none'
      }));
    });
  });

  describe('4. getContactPage - Contact Page Function', () => {
    it('should render contact page with authenticated user', async () => {
      await getContactPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('contact', {
        title: 'Contact - SiteScope',
        user: {
          id: 123,
          email: 'test@example.com',
          first_name: 'Test'
        }
      });
    });

    it('should render contact page with null user for unauthenticated visitors', async () => {
      mockReq.session = null;

      await getContactPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('contact', {
        title: 'Contact - SiteScope',
        user: null
      });
    });

    it('should handle undefined session gracefully', async () => {
      mockReq.session = undefined;

      await getContactPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('contact', {
        title: 'Contact - SiteScope',
        user: null
      });
    });
  });

  describe('Integration Tests - Real Production Workflows', () => {
    it('should handle complete user journey through all pages', async () => {
      // Simulate user visiting homepage
      await getHomePage(mockReq, mockRes);
      expect(mockRes.render).toHaveBeenNthCalledWith(1, 'index', expect.any(Object));

      // Then about page
      await getAboutPage(mockReq, mockRes);
      expect(mockRes.render).toHaveBeenNthCalledWith(2, 'about', expect.any(Object));

      // Then pricing page with tier lookup
      tierService.default.getUserTierLimits.mockResolvedValue({ tierName: 'starter' });
      await getPricingPage(mockReq, mockRes);
      expect(mockRes.render).toHaveBeenNthCalledWith(3, 'pricing', expect.any(Object));

      // Finally contact page
      await getContactPage(mockReq, mockRes);
      expect(mockRes.render).toHaveBeenNthCalledWith(4, 'contact', expect.any(Object));

      expect(mockRes.render).toHaveBeenCalledTimes(4);
    });

    it('should consistently handle session data across all pages', async () => {
      const testUser = { id: 456, email: 'consistent@test.com', first_name: 'Consistent' };
      mockReq.session.user = testUser;

      await getHomePage(mockReq, mockRes);
      await getAboutPage(mockReq, mockRes);
      await getContactPage(mockReq, mockRes);

      // Verify all pages received the same user data
      const homeCall = mockRes.render.mock.calls[0][1];
      const aboutCall = mockRes.render.mock.calls[1][1];
      const contactCall = mockRes.render.mock.calls[2][1];

      expect(homeCall.user).toEqual(testUser);
      expect(aboutCall.user).toEqual(testUser);
      expect(contactCall.user).toEqual(testUser);
    });

    it('should handle anonymous user experience across all pages', async () => {
      mockReq.session = null;

      await getHomePage(mockReq, mockRes);
      await getAboutPage(mockReq, mockRes);
      await getPricingPage(mockReq, mockRes);
      await getContactPage(mockReq, mockRes);

      // Verify all pages received null user
      mockRes.render.mock.calls.forEach(call => {
        expect(call[1].user).toBeNull();
      });
    });

    it('should provide consistent title patterns across pages', async () => {
      await getHomePage(mockReq, mockRes);
      await getAboutPage(mockReq, mockRes);
      await getPricingPage(mockReq, mockRes);
      await getContactPage(mockReq, mockRes);

      const titles = mockRes.render.mock.calls.map(call => call[1].title);
      
      expect(titles[0]).toBe('SiteScope - Website Audit Tool');
      expect(titles[1]).toBe('About - SiteScope');
      expect(titles[2]).toBe('Pricing - Choose Your Plan');
      expect(titles[3]).toBe('Contact - SiteScope');

      // Verify all titles contain SiteScope branding (except pricing)
      expect(titles.filter(title => title.includes('SiteScope'))).toHaveLength(3);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed session objects', async () => {
      mockReq.session = { malformed: true }; // Missing user

      await getHomePage(mockReq, mockRes);
      await getAboutPage(mockReq, mockRes);
      await getContactPage(mockReq, mockRes);

      mockRes.render.mock.calls.forEach(call => {
        expect(call[1].user).toBeNull();
      });
    });

    it('should handle tierService timeout gracefully', async () => {
      tierService.default.getUserTierLimits.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await getPricingPage(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('pricing', expect.objectContaining({
        currentTier: 'none'
      }));

      consoleSpy.mockRestore();
    });

    it('should handle missing session properties gracefully', async () => {
      mockReq.session = { someOtherProperty: 'value' };

      await getPricingPage(mockReq, mockRes);

      expect(tierService.default.getUserTierLimits).not.toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith('pricing', expect.objectContaining({
        user: null,
        currentTier: 'none'
      }));
    });

    it('should handle concurrent requests safely', async () => {
      const promises = [
        getHomePage(mockReq, mockRes),
        getAboutPage(mockReq, mockRes),
        getContactPage(mockReq, mockRes)
      ];

      await Promise.all(promises);

      expect(mockRes.render).toHaveBeenCalledTimes(3);
      // Verify no cross-contamination between calls
      expect(mockRes.render.mock.calls[0][0]).toBe('index');
      expect(mockRes.render.mock.calls[1][0]).toBe('about');
      expect(mockRes.render.mock.calls[2][0]).toBe('contact');
    });
  });
});
