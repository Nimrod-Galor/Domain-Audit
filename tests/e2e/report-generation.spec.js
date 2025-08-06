/**
 * End-to-End Tests: Report Generation & Analysis
 * Tests complete report viewing and interaction workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Report Generation & Analysis', () => {
  const sampleAuditId = 'sample-audit-123';

  test.beforeEach(async ({ page }) => {
    // Login and navigate to a completed audit
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to sample completed audit
    await page.goto(`/audit/${sampleAuditId}`);
    await expect(page.locator('[data-testid="audit-status"]')).toContainText('Completed');
  });

  test('should display comprehensive audit overview', async ({ page }) => {
    // Should show overall score prominently
    const overallScore = page.locator('[data-testid="overall-score"]');
    await expect(overallScore).toBeVisible();
    
    const scoreValue = await overallScore.textContent();
    const score = parseInt(scoreValue);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);

    // Should show category scores
    await expect(page.locator('[data-testid="seo-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="accessibility-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="technical-score"]')).toBeVisible();

    // Should show audit metadata
    await expect(page.locator('[data-testid="audit-url"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="pages-analyzed"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-duration"]')).toBeVisible();
  });

  test('should provide detailed SEO analysis', async ({ page }) => {
    // Navigate to SEO section
    await page.click('[data-testid="seo-section-tab"]');
    
    // Should show SEO score breakdown
    await expect(page.locator('[data-testid="title-tags-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="meta-descriptions-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="headings-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="internal-links-score"]')).toBeVisible();

    // Should show specific issues found
    await expect(page.locator('[data-testid="seo-issues"]')).toBeVisible();
    
    // Should show recommendations
    const recommendations = page.locator('[data-testid="seo-recommendations"]');
    await expect(recommendations).toBeVisible();
    
    // Each recommendation should have priority and description
    const firstRecommendation = recommendations.locator('[data-testid="recommendation-item"]').first();
    await expect(firstRecommendation.locator('[data-testid="priority"]')).toBeVisible();
    await expect(firstRecommendation.locator('[data-testid="description"]')).toBeVisible();
  });

  test('should show performance metrics and analysis', async ({ page }) => {
    await page.click('[data-testid="performance-section-tab"]');
    
    // Should show Core Web Vitals
    await expect(page.locator('[data-testid="lcp-score"]')).toBeVisible(); // Largest Contentful Paint
    await expect(page.locator('[data-testid="fid-score"]')).toBeVisible(); // First Input Delay
    await expect(page.locator('[data-testid="cls-score"]')).toBeVisible(); // Cumulative Layout Shift

    // Should show additional performance metrics
    await expect(page.locator('[data-testid="load-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-size"]')).toBeVisible();
    await expect(page.locator('[data-testid="requests-count"]')).toBeVisible();

    // Should show performance opportunities
    await expect(page.locator('[data-testid="performance-opportunities"]')).toBeVisible();
    
    // Should show resource breakdown
    await expect(page.locator('[data-testid="resource-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="images-size"]')).toBeVisible();
    await expect(page.locator('[data-testid="scripts-size"]')).toBeVisible();
    await expect(page.locator('[data-testid="styles-size"]')).toBeVisible();
  });

  test('should display accessibility audit results', async ({ page }) => {
    await page.click('[data-testid="accessibility-section-tab"]');
    
    // Should show accessibility score
    await expect(page.locator('[data-testid="a11y-score"]')).toBeVisible();
    
    // Should show WCAG compliance level
    await expect(page.locator('[data-testid="wcag-level"]')).toBeVisible();
    
    // Should show accessibility violations
    await expect(page.locator('[data-testid="a11y-violations"]')).toBeVisible();
    
    // Should categorize issues by severity
    await expect(page.locator('[data-testid="critical-issues"]')).toBeVisible();
    await expect(page.locator('[data-testid="serious-issues"]')).toBeVisible();
    await expect(page.locator('[data-testid="moderate-issues"]')).toBeVisible();
    
    // Should show specific violation details
    const violations = page.locator('[data-testid="violation-item"]');
    if (await violations.count() > 0) {
      const firstViolation = violations.first();
      await expect(firstViolation.locator('[data-testid="violation-rule"]')).toBeVisible();
      await expect(firstViolation.locator('[data-testid="violation-description"]')).toBeVisible();
      await expect(firstViolation.locator('[data-testid="affected-elements"]')).toBeVisible();
    }
  });

  test('should show technical analysis details', async ({ page }) => {
    await page.click('[data-testid="technical-section-tab"]');
    
    // Should show HTML validation results
    await expect(page.locator('[data-testid="html-validation"]')).toBeVisible();
    
    // Should show mobile responsiveness
    await expect(page.locator('[data-testid="mobile-responsive"]')).toBeVisible();
    
    // Should show security features
    await expect(page.locator('[data-testid="https-enabled"]')).toBeVisible();
    await expect(page.locator('[data-testid="security-headers"]')).toBeVisible();
    
    // Should show crawlability info
    await expect(page.locator('[data-testid="robots-txt"]')).toBeVisible();
    await expect(page.locator('[data-testid="sitemap-xml"]')).toBeVisible();
    
    // Should show meta tags analysis
    await expect(page.locator('[data-testid="meta-tags-analysis"]')).toBeVisible();
  });

  test('should allow filtering and sorting of issues', async ({ page }) => {
    await page.click('[data-testid="all-issues-tab"]');
    
    // Should show filter options
    await expect(page.locator('[data-testid="severity-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-options"]')).toBeVisible();
    
    // Test severity filtering
    await page.selectOption('[data-testid="severity-filter"]', 'critical');
    
    // Should only show critical issues
    const issueItems = page.locator('[data-testid="issue-item"]');
    const count = await issueItems.count();
    for (let i = 0; i < count; i++) {
      const severity = issueItems.nth(i).locator('[data-testid="issue-severity"]');
      await expect(severity).toContainText('Critical');
    }
    
    // Test category filtering
    await page.selectOption('[data-testid="category-filter"]', 'seo');
    
    // Should only show SEO issues
    const seoIssues = page.locator('[data-testid="issue-item"]');
    const seoCount = await seoIssues.count();
    for (let i = 0; i < seoCount; i++) {
      const category = seoIssues.nth(i).locator('[data-testid="issue-category"]');
      await expect(category).toContainText('SEO');
    }
  });

  test('should provide export functionality', async ({ page }) => {
    // Test PDF export
    const pdfDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-button"]');
    const pdfDownload = await pdfDownloadPromise;
    
    expect(pdfDownload.suggestedFilename()).toMatch(/audit-report.*\.pdf$/);
    
    // Test CSV export
    const csvDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv-button"]');
    const csvDownload = await csvDownloadPromise;
    
    expect(csvDownload.suggestedFilename()).toMatch(/audit-data.*\.csv$/);
    
    // Test Excel export (if available)
    if (await page.locator('[data-testid="export-excel-button"]').isVisible()) {
      const excelDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-excel-button"]');
      const excelDownload = await excelDownloadPromise;
      
      expect(excelDownload.suggestedFilename()).toMatch(/audit-data.*\.xlsx$/);
    }
  });

  test('should show historical comparison when available', async ({ page }) => {
    // Navigate to comparison view
    await page.click('[data-testid="compare-button"]');
    
    // Should show previous audit selection
    await expect(page.locator('[data-testid="previous-audit-selector"]')).toBeVisible();
    
    // Select a previous audit
    await page.selectOption('[data-testid="previous-audit-selector"]', 'audit-456');
    
    // Should show comparison view
    await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible();
    
    // Should show score changes
    await expect(page.locator('[data-testid="score-change"]')).toBeVisible();
    
    // Should highlight improvements and regressions
    await expect(page.locator('[data-testid="improvements"]')).toBeVisible();
    await expect(page.locator('[data-testid="regressions"]')).toBeVisible();
    
    // Should show timeline chart
    await expect(page.locator('[data-testid="score-timeline"]')).toBeVisible();
  });

  test('should display page-level details for multi-page audits', async ({ page }) => {
    // Assuming this is a multi-page audit
    await page.click('[data-testid="page-details-tab"]');
    
    // Should show list of analyzed pages
    await expect(page.locator('[data-testid="pages-list"]')).toBeVisible();
    
    const pageItems = page.locator('[data-testid="page-item"]');
    await expect(pageItems).toHaveCountGreaterThan(0);
    
    // Click on first page for details
    await pageItems.first().click();
    
    // Should show page-specific analysis
    await expect(page.locator('[data-testid="page-url"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-issues"]')).toBeVisible();
    
    // Should show page-specific recommendations
    await expect(page.locator('[data-testid="page-recommendations"]')).toBeVisible();
  });

  test('should handle large reports efficiently', async ({ page }) => {
    // Navigate to a large audit (100+ pages)
    await page.goto('/audit/large-audit-789');
    
    // Should implement pagination or virtual scrolling
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    
    // Should show loading states for heavy sections
    await page.click('[data-testid="detailed-analysis-tab"]');
    
    // May show loading spinner for complex calculations
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    if (await loadingSpinner.isVisible()) {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
    
    // Should lazy load content sections
    await page.scrollIntoViewIfNeeded('[data-testid="recommendations-section"]');
    await expect(page.locator('[data-testid="recommendations-section"]')).toBeVisible();
  });

  test('should provide sharing functionality', async ({ page }) => {
    // Test public link sharing
    await page.click('[data-testid="share-button"]');
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    
    // Should generate shareable link
    await page.click('[data-testid="generate-link-button"]');
    
    const shareableLink = page.locator('[data-testid="shareable-link"]');
    await expect(shareableLink).toBeVisible();
    
    // Should be able to copy link
    await page.click('[data-testid="copy-link-button"]');
    await expect(page.locator('text=Link copied')).toBeVisible();
    
    // Test email sharing
    await page.click('[data-testid="email-share-tab"]');
    await page.fill('[data-testid="recipient-email"]', 'colleague@example.com');
    await page.fill('[data-testid="share-message"]', 'Please review this audit report');
    
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('text=Email sent successfully')).toBeVisible();
  });

  test('should handle mobile report viewing', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should adapt layout for mobile
    await expect(page.locator('[data-testid="mobile-score-card"]')).toBeVisible();
    
    // Should use collapsible sections
    await expect(page.locator('[data-testid="collapsible-section"]')).toBeVisible();
    
    // Should have touch-friendly navigation
    await page.tap('[data-testid="seo-section-tab"]');
    await expect(page.locator('[data-testid="seo-content"]')).toBeVisible();
    
    // Should allow horizontal scrolling for charts
    const chartContainer = page.locator('[data-testid="performance-chart"]');
    if (await chartContainer.isVisible()) {
      await expect(chartContainer).toHaveCSS('overflow-x', 'auto');
    }
  });
});
