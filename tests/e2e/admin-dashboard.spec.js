/**
 * End-to-End Tests: Admin Dashboard
 * Tests administrative functionality and system management
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'admin@example.com');
    await page.fill('[data-testid="login-password"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to admin dashboard
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('should display system overview metrics', async ({ page }) => {
    // Should show key system metrics
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-audits"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-subscriptions"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-health"]')).toBeVisible();

    // Should show recent activity
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    
    // Should show revenue metrics
    await expect(page.locator('[data-testid="monthly-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('should manage user accounts', async ({ page }) => {
    // Navigate to user management
    await page.click('[data-testid="users-menu"]');
    await expect(page).toHaveURL(/.*admin\/users/);
    
    // Should show user list
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    
    // Should show user search
    await page.fill('[data-testid="user-search"]', 'test@example.com');
    await page.keyboard.press('Enter');
    
    // Should filter users
    const userRows = page.locator('[data-testid="user-row"]');
    await expect(userRows).toHaveCountGreaterThan(0);
    
    // Should show user details
    await userRows.first().click();
    await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-tier"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-status"]')).toBeVisible();
  });

  test('should handle user account actions', async ({ page }) => {
    await page.click('[data-testid="users-menu"]');
    
    // Select a user
    const userRows = page.locator('[data-testid="user-row"]');
    await userRows.first().click();
    
    // Should be able to suspend user
    await page.click('[data-testid="suspend-user-button"]');
    await expect(page.locator('[data-testid="suspend-confirmation"]')).toBeVisible();
    await page.click('[data-testid="confirm-suspend"]');
    
    await expect(page.locator('text=User suspended')).toBeVisible();
    await expect(page.locator('[data-testid="user-status"]')).toContainText('Suspended');
    
    // Should be able to reactivate user
    await page.click('[data-testid="reactivate-user-button"]');
    await expect(page.locator('text=User reactivated')).toBeVisible();
    
    // Should be able to change user tier
    await page.click('[data-testid="change-tier-button"]');
    await page.selectOption('[data-testid="tier-selector"]', 'pro');
    await page.click('[data-testid="confirm-tier-change"]');
    
    await expect(page.locator('text=Tier updated')).toBeVisible();
    await expect(page.locator('[data-testid="user-tier"]')).toContainText('Pro');
  });

  test('should monitor system health', async ({ page }) => {
    // Navigate to system health
    await page.click('[data-testid="system-menu"]');
    await expect(page).toHaveURL(/.*admin\/system/);
    
    // Should show system status indicators
    await expect(page.locator('[data-testid="database-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="queue-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="storage-status"]')).toBeVisible();
    
    // Should show performance metrics
    await expect(page.locator('[data-testid="cpu-usage"]')).toBeVisible();
    await expect(page.locator('[data-testid="memory-usage"]')).toBeVisible();
    await expect(page.locator('[data-testid="disk-usage"]')).toBeVisible();
    
    // Should show error logs
    await expect(page.locator('[data-testid="error-logs"]')).toBeVisible();
    
    // Should allow log filtering
    await page.selectOption('[data-testid="log-level-filter"]', 'error');
    await expect(page.locator('[data-testid="log-entry"]')).toHaveCountGreaterThan(0);
  });

  test('should manage audit queue', async ({ page }) => {
    // Navigate to audit queue
    await page.click('[data-testid="audits-menu"]');
    await expect(page).toHaveURL(/.*admin\/audits/);
    
    // Should show queue status
    await expect(page.locator('[data-testid="queue-length"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-audits"]')).toBeVisible();
    await expect(page.locator('[data-testid="failed-audits"]')).toBeVisible();
    
    // Should show audit list
    await expect(page.locator('[data-testid="audits-table"]')).toBeVisible();
    
    // Should be able to retry failed audits
    const failedAudits = page.locator('[data-testid="failed-audit-row"]');
    if (await failedAudits.count() > 0) {
      await failedAudits.first().locator('[data-testid="retry-button"]').click();
      await expect(page.locator('text=Audit queued for retry')).toBeVisible();
    }
    
    // Should be able to cancel queued audits
    const queuedAudits = page.locator('[data-testid="queued-audit-row"]');
    if (await queuedAudits.count() > 0) {
      await queuedAudits.first().locator('[data-testid="cancel-button"]').click();
      await expect(page.locator('text=Audit cancelled')).toBeVisible();
    }
  });

  test('should handle billing and subscription management', async ({ page }) => {
    // Navigate to billing admin
    await page.click('[data-testid="billing-menu"]');
    await expect(page).toHaveURL(/.*admin\/billing/);
    
    // Should show revenue overview
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="mrr"]')).toBeVisible(); // Monthly Recurring Revenue
    await expect(page.locator('[data-testid="churn-rate"]')).toBeVisible();
    
    // Should show subscription list
    await expect(page.locator('[data-testid="subscriptions-table"]')).toBeVisible();
    
    // Should be able to search subscriptions
    await page.fill('[data-testid="subscription-search"]', 'test@example.com');
    await page.keyboard.press('Enter');
    
    // Should show subscription details
    const subscriptionRows = page.locator('[data-testid="subscription-row"]');
    if (await subscriptionRows.count() > 0) {
      await subscriptionRows.first().click();
      await expect(page.locator('[data-testid="subscription-details"]')).toBeVisible();
    }
  });

  test('should manage failed payments', async ({ page }) => {
    await page.click('[data-testid="billing-menu"]');
    await page.click('[data-testid="failed-payments-tab"]');
    
    // Should show failed payments list
    await expect(page.locator('[data-testid="failed-payments-table"]')).toBeVisible();
    
    const failedPayments = page.locator('[data-testid="failed-payment-row"]');
    if (await failedPayments.count() > 0) {
      // Should be able to retry payment
      await failedPayments.first().locator('[data-testid="retry-payment"]').click();
      await expect(page.locator('text=Payment retry initiated')).toBeVisible();
      
      // Should be able to contact customer
      await failedPayments.first().locator('[data-testid="contact-customer"]').click();
      await expect(page.locator('[data-testid="email-template"]')).toBeVisible();
    }
  });

  test('should generate admin reports', async ({ page }) => {
    // Navigate to reports
    await page.click('[data-testid="reports-menu"]');
    await expect(page).toHaveURL(/.*admin\/reports/);
    
    // Should show report options
    await expect(page.locator('[data-testid="user-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-report"]')).toBeVisible();
    
    // Generate user report
    await page.click('[data-testid="user-report"]');
    await page.selectOption('[data-testid="date-range"]', 'last-30-days');
    await page.click('[data-testid="generate-report"]');
    
    // Should show report generation progress
    await expect(page.locator('[data-testid="report-progress"]')).toBeVisible();
    
    // Should complete and offer download
    await expect(page.locator('[data-testid="download-report"]')).toBeVisible({ timeout: 30000 });
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-report"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/user-report.*\.csv$/);
  });

  test('should configure system settings', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="settings-menu"]');
    await expect(page).toHaveURL(/.*admin\/settings/);
    
    // Should show configuration sections
    await expect(page.locator('[data-testid="audit-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-settings"]')).toBeVisible();
    
    // Test audit configuration
    await page.click('[data-testid="audit-settings"]');
    await page.fill('[data-testid="max-concurrent-audits"]', '5');
    await page.fill('[data-testid="audit-timeout"]', '300');
    await page.click('[data-testid="save-audit-settings"]');
    
    await expect(page.locator('text=Settings saved')).toBeVisible();
    
    // Test email configuration
    await page.click('[data-testid="email-settings"]');
    await page.fill('[data-testid="smtp-host"]', 'smtp.example.com');
    await page.fill('[data-testid="smtp-port"]', '587');
    
    // Test email connection
    await page.click('[data-testid="test-email-button"]');
    await expect(page.locator('text=Email test sent')).toBeVisible();
  });

  test('should handle security alerts', async ({ page }) => {
    // Navigate to security
    await page.click('[data-testid="security-menu"]');
    await expect(page).toHaveURL(/.*admin\/security/);
    
    // Should show security alerts
    await expect(page.locator('[data-testid="security-alerts"]')).toBeVisible();
    
    // Should show failed login attempts
    await expect(page.locator('[data-testid="failed-logins"]')).toBeVisible();
    
    // Should show suspicious activity
    await expect(page.locator('[data-testid="suspicious-activity"]')).toBeVisible();
    
    // Should be able to block IP addresses
    await page.fill('[data-testid="ip-address-input"]', '192.168.1.100');
    await page.click('[data-testid="block-ip-button"]');
    
    await expect(page.locator('text=IP address blocked')).toBeVisible();
    
    // Should show blocked IPs list
    await expect(page.locator('[data-testid="blocked-ips"]')).toBeVisible();
  });

  test('should manage API access and rate limits', async ({ page }) => {
    await page.click('[data-testid="api-menu"]');
    await expect(page).toHaveURL(/.*admin\/api/);
    
    // Should show API usage statistics
    await expect(page.locator('[data-testid="api-requests-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-requests-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="rate-limit-violations"]')).toBeVisible();
    
    // Should show API keys management
    await expect(page.locator('[data-testid="api-keys-table"]')).toBeVisible();
    
    // Should be able to revoke API keys
    const apiKeyRows = page.locator('[data-testid="api-key-row"]');
    if (await apiKeyRows.count() > 0) {
      await apiKeyRows.first().locator('[data-testid="revoke-key"]').click();
      await expect(page.locator('text=API key revoked')).toBeVisible();
    }
    
    // Should be able to adjust rate limits
    await page.fill('[data-testid="default-rate-limit"]', '1000');
    await page.click('[data-testid="save-rate-limits"]');
    
    await expect(page.locator('text=Rate limits updated')).toBeVisible();
  });

  test('should provide system backup functionality', async ({ page }) => {
    await page.click('[data-testid="backup-menu"]');
    await expect(page).toHaveURL(/.*admin\/backup/);
    
    // Should show backup status
    await expect(page.locator('[data-testid="last-backup"]')).toBeVisible();
    await expect(page.locator('[data-testid="backup-size"]')).toBeVisible();
    
    // Should show backup schedule
    await expect(page.locator('[data-testid="backup-schedule"]')).toBeVisible();
    
    // Should be able to create manual backup
    await page.click('[data-testid="create-backup-button"]');
    await expect(page.locator('[data-testid="backup-progress"]')).toBeVisible();
    
    // Should complete backup
    await expect(page.locator('text=Backup completed')).toBeVisible({ timeout: 60000 });
    
    // Should show backup in list
    await expect(page.locator('[data-testid="backup-list"]')).toBeVisible();
    
    // Should be able to download backup
    const backupRows = page.locator('[data-testid="backup-row"]');
    if (await backupRows.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      await backupRows.first().locator('[data-testid="download-backup"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toMatch(/backup.*\.sql$/);
    }
  });
});
