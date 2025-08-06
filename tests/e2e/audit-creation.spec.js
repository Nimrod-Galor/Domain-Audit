/**
 * End-to-End Tests: Audit Creation & Processing
 * Tests complete audit workflows from creation to report viewing
 */

import { test, expect } from '@playwright/test';

test.describe('Audit Creation & Processing', () => {
  const testUrls = {
    valid: 'https://example.com',
    invalid: 'not-a-valid-url',
    slow: 'https://httpstat.us/200?sleep=3000',
    notFound: 'https://httpstat.us/404'
  };

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create and process a simple audit', async ({ page }) => {
    // Navigate to audit creation
    await page.click('[data-testid="new-audit-button"]');
    await expect(page).toHaveURL(/.*audit\/new/);

    // Fill audit form
    await page.fill('[data-testid="url-input"]', testUrls.valid);
    await page.selectOption('[data-testid="audit-type"]', 'simple');
    
    // Submit audit
    await page.click('[data-testid="start-audit-button"]');

    // Should show audit created message
    await expect(page.locator('text=Audit started successfully')).toBeVisible();
    
    // Should redirect to audit details page
    await expect(page).toHaveURL(/.*audit\/[a-f0-9-]+$/);
    
    // Should show initial status
    await expect(page.locator('[data-testid="audit-status"]')).toContainText('Running');
    
    // Wait for audit completion (with timeout)
    await expect(page.locator('[data-testid="audit-status"]')).toContainText('Completed', {
      timeout: 60000
    });

    // Should show audit results
    await expect(page.locator('[data-testid="audit-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-report"]')).toBeVisible();
  });

  test('should validate URL input', async ({ page }) => {
    await page.click('[data-testid="new-audit-button"]');
    
    // Try to submit without URL
    await page.click('[data-testid="start-audit-button"]');
    await expect(page.locator('text=URL is required')).toBeVisible();

    // Try invalid URL
    await page.fill('[data-testid="url-input"]', testUrls.invalid);
    await page.click('[data-testid="start-audit-button"]');
    await expect(page.locator('text=Please enter a valid URL')).toBeVisible();

    // Try valid URL format
    await page.fill('[data-testid="url-input"]', testUrls.valid);
    await page.click('[data-testid="start-audit-button"]');
    
    // Should proceed without validation error
    await expect(page).toHaveURL(/.*audit\/[a-f0-9-]+$/);
  });

  test('should handle different audit types', async ({ page }) => {
    await page.click('[data-testid="new-audit-button"]');
    
    // Test comprehensive audit
    await page.fill('[data-testid="url-input"]', testUrls.valid);
    await page.selectOption('[data-testid="audit-type"]', 'comprehensive');
    
    // Should show additional options for comprehensive audit
    await expect(page.locator('[data-testid="crawl-depth"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-pages"]')).toBeVisible();
    
    // Set advanced options
    await page.fill('[data-testid="crawl-depth"]', '2');
    await page.fill('[data-testid="max-pages"]', '10');
    
    await page.click('[data-testid="start-audit-button"]');
    
    // Should create comprehensive audit
    await expect(page).toHaveURL(/.*audit\/[a-f0-9-]+$/);
    await expect(page.locator('text=Comprehensive Audit')).toBeVisible();
  });

  test('should enforce tier limits', async ({ page }) => {
    // Assume user is on free tier with limits
    await page.click('[data-testid="new-audit-button"]');
    
    await page.fill('[data-testid="url-input"]', testUrls.valid);
    await page.selectOption('[data-testid="audit-type"]', 'comprehensive');
    
    // Try to set limits beyond free tier
    await page.fill('[data-testid="max-pages"]', '1000');
    await page.click('[data-testid="start-audit-button"]');
    
    // Should show tier limit warning
    await expect(page.locator('text=Upgrade required')).toBeVisible();
    await expect(page.locator('text=Free tier limit')).toBeVisible();
    
    // Should suggest upgrade
    await expect(page.locator('[data-testid="upgrade-button"]')).toBeVisible();
  });

  test('should display audit progress updates', async ({ page }) => {
    await page.click('[data-testid="new-audit-button"]');
    await page.fill('[data-testid="url-input"]', testUrls.valid);
    await page.click('[data-testid="start-audit-button"]');
    
    // Should show progress indicator
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    
    // Should show status updates
    const statusIndicator = page.locator('[data-testid="audit-status"]');
    await expect(statusIndicator).toContainText('Running');
    
    // Should show progress percentage
    const progressText = page.locator('[data-testid="progress-text"]');
    await expect(progressText).toBeVisible();
    
    // Wait for completion
    await expect(statusIndicator).toContainText('Completed', { timeout: 60000 });
    await expect(progressText).toContainText('100%');
  });

  test('should handle audit failures gracefully', async ({ page }) => {
    await page.click('[data-testid="new-audit-button"]');
    await page.fill('[data-testid="url-input"]', testUrls.notFound);
    await page.click('[data-testid="start-audit-button"]');
    
    // Should eventually show failure status
    await expect(page.locator('[data-testid="audit-status"]')).toContainText('Failed', {
      timeout: 30000
    });
    
    // Should show error details
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=404')).toBeVisible();
    
    // Should offer retry option
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should display comprehensive audit results', async ({ page }) => {
    // Create and wait for audit completion
    await page.click('[data-testid="new-audit-button"]');
    await page.fill('[data-testid="url-input"]', testUrls.valid);
    await page.click('[data-testid="start-audit-button"]');
    
    await expect(page.locator('[data-testid="audit-status"]')).toContainText('Completed', {
      timeout: 60000
    });

    // Should show overall score
    const scoreElement = page.locator('[data-testid="audit-score"]');
    await expect(scoreElement).toBeVisible();
    const score = await scoreElement.textContent();
    expect(parseInt(score)).toBeGreaterThanOrEqual(0);
    expect(parseInt(score)).toBeLessThanOrEqual(100);

    // Should show detailed categories
    await expect(page.locator('[data-testid="seo-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="accessibility-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="technical-score"]')).toBeVisible();

    // Should show recommendations
    await expect(page.locator('[data-testid="recommendations"]')).toBeVisible();
    
    // Should show detailed analysis
    await page.click('[data-testid="view-details-button"]');
    await expect(page.locator('[data-testid="detailed-analysis"]')).toBeVisible();
  });

  test('should allow audit report download', async ({ page }) => {
    // Navigate to completed audit
    await page.goto('/audit/sample-completed-audit-id');
    
    // Wait for page load
    await expect(page.locator('[data-testid="audit-score"]')).toBeVisible();
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-report-button"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/audit-report.*\.pdf$/);
    
    // Verify download completed
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should show audit history', async ({ page }) => {
    // Navigate to audit history
    await page.click('[data-testid="audit-history-link"]');
    await expect(page).toHaveURL(/.*audits/);
    
    // Should show list of audits
    await expect(page.locator('[data-testid="audit-list"]')).toBeVisible();
    
    // Should show audit cards with basic info
    const auditCards = page.locator('[data-testid="audit-card"]');
    await expect(auditCards).toHaveCountGreaterThan(0);
    
    // Each card should have required info
    const firstCard = auditCards.first();
    await expect(firstCard.locator('[data-testid="audit-url"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="audit-date"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="audit-status"]')).toBeVisible();
  });

  test('should filter and search audit history', async ({ page }) => {
    await page.click('[data-testid="audit-history-link"]');
    
    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'completed');
    
    // Should only show completed audits
    const auditCards = page.locator('[data-testid="audit-card"]');
    await auditCards.first().waitFor();
    
    const count = await auditCards.count();
    for (let i = 0; i < count; i++) {
      const status = auditCards.nth(i).locator('[data-testid="audit-status"]');
      await expect(status).toContainText('Completed');
    }
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'example.com');
    await page.keyboard.press('Enter');
    
    // Should filter by URL
    const filteredCards = page.locator('[data-testid="audit-card"]');
    const filteredCount = await filteredCards.count();
    for (let i = 0; i < filteredCount; i++) {
      const url = filteredCards.nth(i).locator('[data-testid="audit-url"]');
      await expect(url).toContainText('example.com');
    }
  });

  test('should handle concurrent audits properly', async ({ page }) => {
    // Create multiple audits quickly
    const auditUrls = [
      'https://example.com',
      'https://httpbin.org/delay/1',
      'https://jsonplaceholder.typicode.com'
    ];
    
    const auditIds = [];
    
    for (const url of auditUrls) {
      await page.click('[data-testid="new-audit-button"]');
      await page.fill('[data-testid="url-input"]', url);
      await page.click('[data-testid="start-audit-button"]');
      
      // Extract audit ID from URL
      const currentUrl = page.url();
      const auditId = currentUrl.match(/audit\/([a-f0-9-]+)$/)?.[1];
      if (auditId) auditIds.push(auditId);
      
      // Go back to dashboard
      await page.click('[data-testid="dashboard-link"]');
    }
    
    // Verify all audits are being processed
    await page.click('[data-testid="audit-history-link"]');
    
    for (const auditId of auditIds) {
      const auditCard = page.locator(`[data-audit-id="${auditId}"]`);
      await expect(auditCard).toBeVisible();
    }
  });
});
