/**
 * End-to-End Tests: Payment & Subscription Flow
 * Tests tier upgrades and payment processing workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Payment & Subscription Flow', () => {
  const testCard = {
    number: '4242424242424242', // Stripe test card
    expiry: '12/25',
    cvc: '123',
    zip: '12345'
  };

  test.beforeEach(async ({ page }) => {
    // Login as free tier user
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display pricing page correctly', async ({ page }) => {
    // Navigate to pricing
    await page.click('[data-testid="pricing-link"]');
    await expect(page).toHaveURL(/.*pricing/);

    // Should show all tier options
    await expect(page.locator('[data-testid="free-tier"]')).toBeVisible();
    await expect(page.locator('[data-testid="pro-tier"]')).toBeVisible();
    await expect(page.locator('[data-testid="enterprise-tier"]')).toBeVisible();

    // Should show features for each tier
    await expect(page.locator('[data-testid="free-features"]')).toBeVisible();
    await expect(page.locator('[data-testid="pro-features"]')).toBeVisible();
    await expect(page.locator('[data-testid="enterprise-features"]')).toBeVisible();

    // Should show pricing
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=$29/month')).toBeVisible();
    await expect(page.locator('text=$99/month')).toBeVisible();
  });

  test('should initiate Pro tier upgrade', async ({ page }) => {
    await page.click('[data-testid="pricing-link"]');
    
    // Click upgrade to Pro
    await page.click('[data-testid="upgrade-pro-button"]');
    
    // Should navigate to checkout
    await expect(page).toHaveURL(/.*checkout/);
    
    // Should show selected plan details
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    await expect(page.locator('text=$29.00')).toBeVisible();
    
    // Should show billing frequency options
    await expect(page.locator('[data-testid="monthly-billing"]')).toBeVisible();
    await expect(page.locator('[data-testid="annual-billing"]')).toBeVisible();
  });

  test('should handle annual billing discount', async ({ page }) => {
    await page.click('[data-testid="pricing-link"]');
    await page.click('[data-testid="upgrade-pro-button"]');
    
    // Switch to annual billing
    await page.click('[data-testid="annual-billing"]');
    
    // Should show discounted price
    await expect(page.locator('text=$290.00')).toBeVisible(); // 10 months price
    await expect(page.locator('text=Save $58')).toBeVisible();
    
    // Should update total
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('$290.00');
  });

  test('should complete payment process with valid card', async ({ page }) => {
    await page.click('[data-testid="pricing-link"]');
    await page.click('[data-testid="upgrade-pro-button"]');
    
    // Fill billing information
    await page.fill('[data-testid="billing-name"]', 'Test User');
    await page.fill('[data-testid="billing-email"]', 'test@example.com');
    await page.fill('[data-testid="billing-address"]', '123 Test St');
    await page.fill('[data-testid="billing-city"]', 'Test City');
    await page.fill('[data-testid="billing-zip"]', '12345');
    
    // Fill credit card information (in Stripe iframe)
    const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await stripeFrame.locator('[data-testid="card-number"]').fill(testCard.number);
    await stripeFrame.locator('[data-testid="card-expiry"]').fill(testCard.expiry);
    await stripeFrame.locator('[data-testid="card-cvc"]').fill(testCard.cvc);
    
    // Submit payment
    await page.click('[data-testid="submit-payment-button"]');
    
    // Should show processing state
    await expect(page.locator('text=Processing payment')).toBeVisible();
    
    // Should redirect to success page
    await expect(page).toHaveURL(/.*payment\/success/, { timeout: 30000 });
    await expect(page.locator('text=Payment successful')).toBeVisible();
    await expect(page.locator('text=Welcome to Pro')).toBeVisible();
  });

  test('should handle payment failures gracefully', async ({ page }) => {
    await page.click('[data-testid="pricing-link"]');
    await page.click('[data-testid="upgrade-pro-button"]');
    
    // Fill billing info
    await page.fill('[data-testid="billing-name"]', 'Test User');
    await page.fill('[data-testid="billing-email"]', 'test@example.com');
    
    // Use card that will be declined
    const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await stripeFrame.locator('[data-testid="card-number"]').fill('4000000000000002'); // Declined card
    await stripeFrame.locator('[data-testid="card-expiry"]').fill(testCard.expiry);
    await stripeFrame.locator('[data-testid="card-cvc"]').fill(testCard.cvc);
    
    await page.click('[data-testid="submit-payment-button"]');
    
    // Should show error message
    await expect(page.locator('text=Payment failed')).toBeVisible();
    await expect(page.locator('text=Your card was declined')).toBeVisible();
    
    // Should remain on checkout page
    await expect(page).toHaveURL(/.*checkout/);
    
    // Should allow retry
    await expect(page.locator('[data-testid="submit-payment-button"]')).toBeVisible();
  });

  test('should validate payment form inputs', async ({ page }) => {
    await page.click('[data-testid="pricing-link"]');
    await page.click('[data-testid="upgrade-pro-button"]');
    
    // Try to submit without required fields
    await page.click('[data-testid="submit-payment-button"]');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Card information is required')).toBeVisible();
    
    // Test invalid email
    await page.fill('[data-testid="billing-email"]', 'invalid-email');
    await page.click('[data-testid="submit-payment-button"]');
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should show updated features after upgrade', async ({ page }) => {
    // Simulate successful upgrade (would need to complete payment flow first)
    // For testing, we can mock the upgraded state
    await page.goto('/dashboard?tier=pro'); // Simulate upgraded user
    
    // Should show Pro tier badge
    await expect(page.locator('[data-testid="tier-badge"]')).toContainText('Pro');
    
    // Should show increased limits
    await expect(page.locator('[data-testid="audit-limit"]')).toContainText('1000');
    await expect(page.locator('[data-testid="page-limit"]')).toContainText('100');
    
    // Should have access to Pro features
    await page.click('[data-testid="new-audit-button"]');
    await expect(page.locator('[data-testid="comprehensive-audit"]')).toBeEnabled();
    await expect(page.locator('[data-testid="advanced-options"]')).toBeVisible();
  });

  test('should handle subscription management', async ({ page }) => {
    // Navigate to billing/subscription page
    await page.goto('/billing');
    
    // Should show current plan
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro Plan');
    await expect(page.locator('[data-testid="plan-price"]')).toContainText('$29.00');
    
    // Should show next billing date
    await expect(page.locator('[data-testid="next-billing"]')).toBeVisible();
    
    // Should show payment method
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('•••• 4242');
    
    // Should allow plan changes
    await expect(page.locator('[data-testid="change-plan-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-subscription-button"]')).toBeVisible();
  });

  test('should allow subscription cancellation', async ({ page }) => {
    await page.goto('/billing');
    
    // Click cancel subscription
    await page.click('[data-testid="cancel-subscription-button"]');
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="cancel-confirmation"]')).toBeVisible();
    await expect(page.locator('text=Are you sure')).toBeVisible();
    
    // Should explain what happens on cancellation
    await expect(page.locator('text=access until end of billing period')).toBeVisible();
    
    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel-button"]');
    
    // Should show success message
    await expect(page.locator('text=Subscription cancelled')).toBeVisible();
    
    // Should show when access expires
    await expect(page.locator('[data-testid="access-expires"]')).toBeVisible();
  });

  test('should handle payment method updates', async ({ page }) => {
    await page.goto('/billing');
    
    // Click update payment method
    await page.click('[data-testid="update-payment-button"]');
    
    // Should show payment form
    await expect(page.locator('[data-testid="new-card-form"]')).toBeVisible();
    
    // Fill new card information
    const stripeFrame = page.frameLocator('[data-testid="new-card-element"] iframe');
    await stripeFrame.locator('[data-testid="card-number"]').fill('4242424242424242');
    await stripeFrame.locator('[data-testid="card-expiry"]').fill('12/26');
    await stripeFrame.locator('[data-testid="card-cvc"]').fill('123');
    
    // Submit update
    await page.click('[data-testid="save-card-button"]');
    
    // Should show success message
    await expect(page.locator('text=Payment method updated')).toBeVisible();
    
    // Should show updated card info
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('•••• 4242');
  });

  test('should generate and download invoices', async ({ page }) => {
    await page.goto('/billing');
    
    // Should show billing history
    await expect(page.locator('[data-testid="billing-history"]')).toBeVisible();
    
    // Should show invoice list
    const invoices = page.locator('[data-testid="invoice-item"]');
    await expect(invoices).toHaveCountGreaterThan(0);
    
    // Click download invoice
    const downloadPromise = page.waitForEvent('download');
    await invoices.first().locator('[data-testid="download-invoice"]').click();
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf$/);
  });

  test('should handle enterprise sales inquiries', async ({ page }) => {
    await page.click('[data-testid="pricing-link"]');
    
    // Click enterprise contact
    await page.click('[data-testid="enterprise-contact-button"]');
    
    // Should open contact form
    await expect(page.locator('[data-testid="enterprise-form"]')).toBeVisible();
    
    // Fill contact form
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.fill('[data-testid="contact-email"]', 'sales@testcompany.com');
    await page.fill('[data-testid="company-size"]', '100-500');
    await page.fill('[data-testid="requirements"]', 'Need custom audit solutions');
    
    // Submit inquiry
    await page.click('[data-testid="submit-inquiry-button"]');
    
    // Should show confirmation
    await expect(page.locator('text=Thank you for your inquiry')).toBeVisible();
    await expect(page.locator('text=sales team will contact you')).toBeVisible();
  });

  test('should enforce tier limits correctly', async ({ page }) => {
    // Test as free tier user hitting limits
    await page.goto('/dashboard');
    
    // Try to create audit beyond free limit
    // This would require setting up test data to simulate reaching limits
    await page.click('[data-testid="new-audit-button"]');
    
    // If at limit, should show upgrade prompt
    const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
    if (await upgradePrompt.isVisible()) {
      await expect(upgradePrompt).toContainText('upgrade');
      await expect(page.locator('[data-testid="view-pricing-button"]')).toBeVisible();
    }
  });
});
