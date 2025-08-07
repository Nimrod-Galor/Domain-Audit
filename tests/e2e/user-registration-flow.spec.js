/**
 * E2E Test: User Registration Flow
 * Complete end-to-end test for user registration and onboarding
 */

import { test, expect } from '@playwright/test';
import { E2EHelpers, E2EFixtures } from './helpers/E2EHelpers.js';

test.describe('User Registration E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock external services for consistent testing
    await E2EHelpers.mockExternalAPIs(page);
  });

  test('complete user registration and first audit', async ({ page, request }) => {
    // Generate unique test data
    const testData = E2EHelpers.generateTestData();
    
    // Step 1: Navigate to registration page
    await page.goto('/register');
    await E2EHelpers.waitForPageLoad(page);
    
    // Verify page loaded correctly
    await expect(page).toHaveTitle(/Register|Sign Up/);
    await expect(page.locator('h1')).toContainText(/Register|Sign Up/);

    // Step 2: Fill registration form
    await E2EHelpers.fillForm(page, {
      'first-name': 'E2E',
      'last-name': 'Test',
      'email': testData.email,
      'password': 'SecurePassword123!',
      'confirm-password': 'SecurePassword123!'
    });

    // Step 3: Submit registration
    const registrationPromise = E2EHelpers.waitForAPIResponse(page, '/api/auth/register', 'POST');
    await page.click('[data-testid="register-button"]');
    
    // Wait for registration API call
    const registrationResponse = await registrationPromise;
    expect(registrationResponse.status()).toBe(201);

    // Step 4: Verify email verification prompt
    await expect(page.locator('[data-testid="email-verification-notice"]')).toBeVisible();
    
    // Simulate email verification (in real test, you'd check email service)
    await page.goto(`/verify-email?token=mock-verification-token&email=${testData.email}`);
    
    // Step 5: Verify successful login redirect
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome');

    // Step 6: Start first audit
    await page.click('[data-testid="create-audit-button"]');
    await E2EHelpers.waitForStableElement(page, '[data-testid="audit-form"]');

    // Fill audit form
    await page.fill('[data-testid="domain-input"]', testData.domain);
    await page.fill('[data-testid="audit-name-input"]', testData.auditName);
    
    // Configure audit settings
    await page.check('[data-testid="include-mobile-check"]');
    await page.selectOption('[data-testid="max-pages-select"]', '25');

    // Step 7: Submit audit
    const auditPromise = E2EHelpers.waitForAPIResponse(page, '/api/audits', 'POST');
    await page.click('[data-testid="start-audit-button"]');
    
    // Wait for audit creation
    const auditResponse = await auditPromise;
    expect(auditResponse.status()).toBe(201);

    // Step 8: Verify audit appears in dashboard
    await E2EHelpers.waitForStableElement(page, '[data-testid="audit-list"]');
    await expect(page.locator('[data-testid="audit-item"]').first()).toContainText(testData.auditName);
    await expect(page.locator('[data-testid="audit-status"]').first()).toContainText(/Running|Pending/);

    // Step 9: Test navigation
    await page.click('[data-testid="profile-menu"]');
    await expect(page.locator('[data-testid="profile-dropdown"]')).toBeVisible();
    
    await page.click('[data-testid="account-settings-link"]');
    await expect(page).toHaveURL(/\/account/);
    
    // Verify user info is displayed correctly
    await expect(page.locator('[data-testid="user-email"]')).toContainText(testData.email);
    await expect(page.locator('[data-testid="user-tier"]')).toContainText('Starter');

    // Step 10: Assert no console errors occurred
    await E2EHelpers.assertNoConsoleErrors(page);

    // Cleanup test data
    await E2EHelpers.cleanupTestData(request);
  });

  test('registration validation errors', async ({ page }) => {
    await page.goto('/register');
    
    // Test empty form submission
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/required|Please enter/);
    await expect(page.locator('[data-testid="password-error"]')).toContainText(/required|Please enter/);

    // Test invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email/);

    // Test weak password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="password-error"]')).toContainText(/strong|characters|uppercase/);

    // Test password mismatch
    await page.fill('[data-testid="password-input"]', 'StrongPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText(/match/);
  });

  test('existing user registration attempt', async ({ page, request }) => {
    // Create existing user first
    const existingUser = await E2EHelpers.createTestUser(request, {
      email: 'existing@example.com'
    });

    // Try to register with same email
    await page.goto('/register');
    
    await E2EHelpers.fillForm(page, {
      'first-name': 'Test',
      'last-name': 'User',
      'email': 'existing@example.com',
      'password': 'SecurePassword123!',
      'confirm-password': 'SecurePassword123!'
    });

    await page.click('[data-testid="register-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/already exists|already registered/);
    
    // Should not redirect to dashboard
    await expect(page).toHaveURL(/\/register/);

    // Cleanup
    await E2EHelpers.cleanupTestData(request);
  });
});

test.describe('User Registration Performance', () => {
  test('registration page loads quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/register');
    await E2EHelpers.waitForPageLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Assert performance metrics
    await E2EHelpers.assertPerformance(page, {
      firstContentfulPaint: 2000,
      largestContentfulPaint: 3000
    });
  });
});
