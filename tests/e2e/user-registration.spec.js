/**
 * End-to-End Tests: User Registration Flow
 * Tests complete user registration and authentication workflows
 */

import { test, expect } from '@playwright/test';

test.describe('User Registration & Authentication', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    name: 'Test User'
  };

  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('should complete full registration workflow', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.fill('[data-testid="name-input"]', testUser.name);

    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Should show success message or redirect to verification
    await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
    
    // Should receive verification email (check for confirmation)
    await expect(page.locator('text=verification email')).toBeVisible();
  });

  test('should validate registration form inputs', async ({ page }) => {
    await page.click('text=Sign Up');
    
    // Try to submit empty form
    await page.click('[data-testid="register-button"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('text=Invalid email format')).toBeVisible();

    // Test weak password
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();

    // Test password mismatch
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', 'different-password');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should handle duplicate email registration', async ({ page }) => {
    await page.click('text=Sign Up');
    
    // Try to register with an email that already exists
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.fill('[data-testid="name-input"]', testUser.name);
    
    await page.click('[data-testid="register-button"]');
    
    // Should show appropriate error message
    await expect(page.locator('text=Email already registered')).toBeVisible();
  });

  test('should complete login workflow', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    // Fill login form with test credentials
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');

    // Submit login
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    
    // Try invalid credentials
    await page.fill('[data-testid="login-email"]', 'wrong@example.com');
    await page.fill('[data-testid="login-password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Should redirect to homepage
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should implement password reset flow', async ({ page }) => {
    await page.click('text=Login');
    
    // Click forgot password
    await page.click('text=Forgot Password');
    await expect(page).toHaveURL(/.*forgot-password/);
    
    // Enter email for reset
    await page.fill('[data-testid="reset-email"]', 'test@example.com');
    await page.click('[data-testid="reset-button"]');
    
    // Should show confirmation message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('text=Please log in to continue')).toBeVisible();
  });

  test('should handle session expiry', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Simulate session expiry by clearing cookies
    await page.context().clearCookies();
    
    // Try to access protected resource
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should implement Google OAuth flow', async ({ page }) => {
    await page.click('text=Login');
    
    // Click Google OAuth button
    const googleButton = page.locator('[data-testid="google-oauth"]');
    await expect(googleButton).toBeVisible();
    
    // Note: In a real test, you'd need to handle OAuth flow
    // For now, verify the button leads to Google OAuth
    await googleButton.click();
    
    // Should navigate to Google OAuth (or show OAuth popup)
    // This would require additional setup for OAuth testing
    await page.waitForTimeout(1000);
  });
});
