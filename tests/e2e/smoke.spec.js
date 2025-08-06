/**
 * E2E Smoke Test
 * Basic test to verify E2E infrastructure is working
 */

import { test, expect } from '@playwright/test';

test.describe('E2E Infrastructure Smoke Test', () => {
  test('should handle static HTML content', async ({ page }) => {
    // Create a simple HTML page to test basic functionality
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Page</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .button { padding: 10px 20px; background: blue; color: white; border: none; cursor: pointer; }
          .hidden { display: none; }
        </style>
      </head>
      <body>
        <h1>Test Page</h1>
        <p>This is a test page for E2E verification.</p>
        <button class="button" onclick="showMessage()">Click Me</button>
        <div id="message" class="hidden">Button clicked!</div>
        <form id="testForm">
          <input type="text" id="nameInput" placeholder="Enter your name" />
          <input type="email" id="emailInput" placeholder="Enter your email" />
          <button type="submit">Submit</button>
        </form>
        <div id="formResult" class="hidden">Form submitted!</div>
        <script>
          function showMessage() {
            document.getElementById('message').style.display = 'block';
          }
          document.getElementById('testForm').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('formResult').style.display = 'block';
          });
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Verify page loads
    await expect(page).toHaveTitle('Test Page');
    await expect(page.locator('h1')).toContainText('Test Page');
  });

  test('should handle user interactions', async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Interactive Test</title></head>
      <body>
        <button id="testButton">Click Me</button>
        <div id="result" style="display: none;">Clicked!</div>
        <script>
          document.getElementById('testButton').onclick = function() {
            document.getElementById('result').style.display = 'block';
          };
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Test click interaction
    await page.click('#testButton');
    await expect(page.locator('#result')).toBeVisible();
  });

  test('should handle form interactions', async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Form Test</title></head>
      <body>
        <form id="testForm">
          <input type="text" id="name" name="name" placeholder="Name" />
          <input type="email" id="email" name="email" placeholder="Email" />
          <button type="submit">Submit</button>
        </form>
        <div id="success" style="display: none;">Form submitted successfully!</div>
        <script>
          document.getElementById('testForm').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('success').style.display = 'block';
          });
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Fill form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('#success')).toBeVisible();
  });

  test('should capture basic performance metrics', async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Performance Test</title></head>
      <body>
        <h1>Performance Test Page</h1>
        <p>This page is used to test performance measurement.</p>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart
      };
    });
    
    // Verify metrics are reasonable
    expect(metrics.domContentLoaded).toBeGreaterThanOrEqual(0);
    expect(metrics.loadComplete).toBeGreaterThanOrEqual(0);
  });

  test('should work across different viewports', async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Responsive Test</title>
        <style>
          body { margin: 0; padding: 20px; }
          .content { width: 100%; max-width: 600px; }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Responsive Test</h1>
          <p>This tests responsive behavior.</p>
        </div>
      </body>
      </html>
    `;
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setContent(html);
    
    let viewport = page.viewportSize();
    expect(viewport.width).toBe(1920);
    expect(viewport.height).toBe(1080);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    viewport = page.viewportSize();
    expect(viewport.width).toBe(375);
    expect(viewport.height).toBe(667);
    
    // Verify content is still visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle JavaScript execution', async ({ page }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>JavaScript Test</title></head>
      <body>
        <div id="output">Initial content</div>
        <script>
          setTimeout(() => {
            document.getElementById('output').textContent = 'Updated by JavaScript';
          }, 100);
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Wait for JavaScript to execute
    await expect(page.locator('#output')).toContainText('Updated by JavaScript');
  });

  test('should verify browser capabilities', async ({ page, browserName }) => {
    console.log(`Testing on ${browserName}`);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Browser Test</title></head>
      <body>
        <h1>Browser: ${browserName}</h1>
        <div id="userAgent"></div>
        <script>
          document.getElementById('userAgent').textContent = navigator.userAgent;
        </script>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Verify browser-specific behavior
    await expect(page.locator('h1')).toContainText(browserName);
    await expect(page.locator('#userAgent')).not.toBeEmpty();
  });
});
