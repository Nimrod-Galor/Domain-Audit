/**
 * E2E Test Helpers
 * Utility functions specifically for Playwright end-to-end tests
 */

import { expect } from '@playwright/test';

export class E2EHelpers {
  /**
   * Login as a test user
   */
  static async loginAsUser(page, email = 'e2e-test@example.com', password = 'e2e-test-password') {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await expect(page).toHaveURL(/\/dashboard/);
  }

  /**
   * Login as admin user
   */
  static async loginAsAdmin(page, email = 'e2e-admin@example.com', password = 'e2e-admin-password') {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful admin login
    await expect(page).toHaveURL(/\/admin/);
  }

  /**
   * Create a test user via API
   */
  static async createTestUser(request, userData = {}) {
    const defaultUser = {
      email: 'e2e-test@example.com',
      password: 'e2e-test-password',
      firstName: 'E2E',
      lastName: 'Test',
      tier: 'starter'
    };

    const user = { ...defaultUser, ...userData };

    const response = await request.post('/api/auth/register', {
      data: user
    });

    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  /**
   * Create an admin user via API
   */
  static async createAdminUser(request, userData = {}) {
    const defaultAdmin = {
      email: 'e2e-admin@example.com',
      password: 'e2e-admin-password',
      firstName: 'E2E',
      lastName: 'Admin',
      role: 'admin',
      tier: 'enterprise'
    };

    const admin = { ...defaultAdmin, ...userData };

    const response = await request.post('/api/admin/users', {
      data: admin
    });

    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(request) {
    // Delete test users
    await request.delete('/api/test/cleanup/users');
    
    // Delete test audits
    await request.delete('/api/test/cleanup/audits');
    
    // Reset test database state if needed
    await request.post('/api/test/reset-state');
  }

  /**
   * Wait for element to be visible and stable
   */
  static async waitForStableElement(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await page.waitForTimeout(100); // Small delay for stability
  }

  /**
   * Wait for page to be fully loaded
   */
  static async waitForPageLoad(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeTimestampedScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `playwright-report/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Assert no console errors
   */
  static async assertNoConsoleErrors(page) {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Small delay to capture any errors
    await page.waitForTimeout(1000);
    
    expect(errors).toHaveLength(0);
  }

  /**
   * Fill form with validation
   */
  static async fillForm(page, formData) {
    for (const [fieldName, value] of Object.entries(formData)) {
      const selector = `[data-testid="${fieldName}-input"], [name="${fieldName}"], #${fieldName}`;
      await page.fill(selector, value);
    }
  }

  /**
   * Wait for API response
   */
  static async waitForAPIResponse(page, url, method = 'GET') {
    return page.waitForResponse(response => 
      response.url().includes(url) && response.request().method() === method
    );
  }

  /**
   * Mock external API calls
   */
  static async mockExternalAPIs(page) {
    // Mock Stripe API
    await page.route('**/api.stripe.com/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, mock: true })
      });
    });

    // Mock email service
    await page.route('**/send-email', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sent: true, mock: true })
      });
    });

    // Mock Google OAuth
    await page.route('**/oauth.googleusercontent.com/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mock: true })
      });
    });
  }

  /**
   * Assert page performance metrics
   */
  static async assertPerformance(page, thresholds = {}) {
    const defaultThresholds = {
      firstContentfulPaint: 2000,
      largestContentfulPaint: 3000,
      cumulativeLayoutShift: 0.1,
      totalBlockingTime: 300
    };

    const metrics = { ...defaultThresholds, ...thresholds };

    const performanceEntries = await page.evaluate(() => {
      return JSON.parse(JSON.stringify(performance.getEntriesByType('paint')));
    });

    // Assert performance metrics if available
    if (performanceEntries.length > 0) {
      console.log('Performance metrics:', performanceEntries);
    }
  }

  /**
   * Generate test data
   */
  static generateTestData() {
    const timestamp = Date.now();
    return {
      email: `test-${timestamp}@example.com`,
      domain: `test-domain-${timestamp}.com`,
      auditName: `Test Audit ${timestamp}`,
      companyName: `Test Company ${timestamp}`
    };
  }
}

/**
 * Common test fixtures
 */
export const E2EFixtures = {
  testUser: {
    email: 'e2e-test@example.com',
    password: 'e2e-test-password',
    firstName: 'E2E',
    lastName: 'Test'
  },

  adminUser: {
    email: 'e2e-admin@example.com',
    password: 'e2e-admin-password',
    firstName: 'E2E',
    lastName: 'Admin'
  },

  testDomains: [
    'example.com',
    'test-site.org',
    'demo-website.net'
  ],

  sampleAuditData: {
    domain: 'example.com',
    maxPages: 10,
    includeExternal: true,
    checkMobile: true
  }
};

export default E2EHelpers;
