/**
 * E2E Test Utilities
 * Helper functions and utilities for Playwright E2E tests
 */

import { expect } from '@playwright/test';

export class E2EHelpers {
  /**
   * Login helper for tests
   */
  static async loginAs(page, userType = 'user') {
    const credentials = {
      user: {
        email: 'test@example.com',
        password: 'TestPassword123!'
      },
      admin: {
        email: 'admin@example.com',
        password: 'AdminPassword123!'
      },
      pro: {
        email: 'pro@example.com',
        password: 'ProPassword123!'
      }
    };

    const creds = credentials[userType];
    
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', creds.email);
    await page.fill('[data-testid="login-password"]', creds.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect
    await expect(page).toHaveURL(/.*dashboard/);
  }

  /**
   * Create a test audit
   */
  static async createTestAudit(page, options = {}) {
    const {
      url = 'https://example.com',
      type = 'simple',
      waitForCompletion = false
    } = options;

    await page.click('[data-testid="new-audit-button"]');
    await page.fill('[data-testid="url-input"]', url);
    
    if (type !== 'simple') {
      await page.selectOption('[data-testid="audit-type"]', type);
    }
    
    await page.click('[data-testid="start-audit-button"]');
    
    // Extract audit ID from URL
    const auditUrl = page.url();
    const auditId = auditUrl.match(/audit\/([a-f0-9-]+)$/)?.[1];
    
    if (waitForCompletion) {
      await expect(page.locator('[data-testid="audit-status"]')).toContainText('Completed', {
        timeout: 60000
      });
    }
    
    return auditId;
  }

  /**
   * Fill Stripe payment form
   */
  static async fillPaymentForm(page, cardDetails = {}) {
    const {
      number = '4242424242424242',
      expiry = '12/25',
      cvc = '123'
    } = cardDetails;

    // Fill billing information
    await page.fill('[data-testid="billing-name"]', 'Test User');
    await page.fill('[data-testid="billing-email"]', 'test@example.com');
    await page.fill('[data-testid="billing-address"]', '123 Test St');
    await page.fill('[data-testid="billing-city"]', 'Test City');
    await page.fill('[data-testid="billing-zip"]', '12345');
    
    // Fill credit card information (in Stripe iframe)
    const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await stripeFrame.locator('[data-testid="card-number"]').fill(number);
    await stripeFrame.locator('[data-testid="card-expiry"]').fill(expiry);
    await stripeFrame.locator('[data-testid="card-cvc"]').fill(cvc);
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  static async waitForElement(page, selector, timeout = 30000) {
    await expect(page.locator(selector)).toBeVisible({ timeout });
  }

  /**
   * Check if element exists without throwing
   */
  static async elementExists(page, selector) {
    try {
      await page.locator(selector).waitFor({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique test email
   */
  static generateTestEmail() {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  /**
   * Generate test user data
   */
  static generateTestUser() {
    return {
      email: this.generateTestEmail(),
      password: 'TestPassword123!',
      name: `Test User ${Math.random().toString(36).substr(2, 5)}`
    };
  }

  /**
   * Take screenshot on failure
   */
  static async takeScreenshotOnFailure(page, testInfo) {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
    }
  }

  /**
   * Clear browser data
   */
  static async clearBrowserData(context) {
    await context.clearCookies();
    await context.clearPermissions();
  }

  /**
   * Mock API responses
   */
  static async mockAPIResponse(page, endpoint, response) {
    await page.route(endpoint, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Simulate network conditions
   */
  static async simulateSlowNetwork(page) {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 200, // 200ms latency
      downloadThroughput: 1000000, // 1Mbps
      uploadThroughput: 500000 // 500kbps
    });
  }

  /**
   * Wait for all network requests to complete
   */
  static async waitForNetworkIdle(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Check for console errors
   */
  static async checkConsoleErrors(page) {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  }

  /**
   * Verify accessibility basics
   */
  static async checkBasicAccessibility(page) {
    // Check for missing alt attributes on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    
    // Check for empty buttons
    const emptyButtons = await page.locator('button:empty').count();
    
    // Check for inputs without labels
    const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    
    return {
      imagesWithoutAlt,
      emptyButtons,
      inputsWithoutLabels
    };
  }

  /**
   * Monitor performance metrics
   */
  static async getPerformanceMetrics(page) {
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
      };
    });
    
    return metrics;
  }

  /**
   * Verify page is responsive
   */
  static async testResponsiveness(page) {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to settle
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      results.push({
        viewport,
        hasHorizontalScroll
      });
    }
    
    return results;
  }

  /**
   * Generate test data for forms
   */
  static getTestFormData() {
    return {
      contact: {
        name: 'Test User',
        email: this.generateTestEmail(),
        company: 'Test Company',
        message: 'This is a test message for form validation.'
      },
      billing: {
        name: 'Test User',
        email: this.generateTestEmail(),
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US'
      }
    };
  }

  /**
   * Database cleanup helper
   */
  static async cleanupTestData(page) {
    // This would typically call a cleanup API endpoint
    await page.request.post('/api/test/cleanup', {
      headers: {
        'Authorization': 'Bearer test-cleanup-token'
      }
    });
  }
}

export default E2EHelpers;
