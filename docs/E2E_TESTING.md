# E2E Testing with Playwright

This document describes the end-to-end (E2E) testing setup using Playwright, which is completely separated from the Jest unit and integration tests.

## Overview

The E2E tests are designed to test the complete user workflows in a real browser environment. They are separated from other tests to:

- ✅ **Independent Execution**: Run separately from unit/integration tests
- ✅ **Real Browser Testing**: Test actual user interactions
- ✅ **Cross-Browser Support**: Test on Chrome, Firefox, Safari, and mobile
- ✅ **Visual Testing**: Screenshots and videos on failures
- ✅ **Performance Testing**: Page load times and core web vitals

## Test Structure

```
tests/e2e/
├── helpers/
│   └── E2EHelpers.js          # Common E2E utilities
├── global-setup.js            # Runs once before all tests
├── global-teardown.js         # Runs once after all tests
├── *.spec.js                  # Individual test files
└── user-registration-flow.spec.js  # Example comprehensive test
```

## Configuration Files

- **`playwright.config.js`** - Main Playwright configuration
- **`.env.e2e`** - E2E-specific environment variables
- **`.env.e2e.example`** - Template for environment setup

## Available Commands

### Basic E2E Testing

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with browser UI visible
npm run test:e2e:headed

# Debug E2E tests (step-by-step)
npm run test:e2e:debug

# Interactive UI mode
npm run test:e2e:ui
```

### Browser-Specific Testing

```bash
# Chrome only
npm run test:e2e:chrome

# Firefox only
npm run test:e2e:firefox

# Safari/WebKit only
npm run test:e2e:webkit
```

### Test Reports and Results

```bash
# Show test report in browser
npm run test:e2e:report

# Install required browsers
npm run test:e2e:install
```

### Combined Testing

```bash
# Run all tests including E2E
npm run test:all

# Run all tests except E2E (faster for development)
npm run test:all:no-e2e

# CI pipeline with E2E
npm run test:ci

# CI pipeline without E2E
npm run test:ci:no-e2e
```

## Setup Instructions

### 1. Install Playwright Browsers

```bash
npm run test:e2e:install
```

### 2. Configure Environment

Copy the example environment file and update values:

```bash
cp .env.e2e.example .env.e2e
```

Edit `.env.e2e` with your specific configuration:

- Database connection string
- Application base URL
- Test user credentials

### 3. Start Your Application

E2E tests require the application to be running:

```bash
# Start the web application
npm run web:start

# Or in development mode
npm run web:dev
```

### 4. Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Or with visible browser for debugging
npm run test:e2e:headed
```

## Writing E2E Tests

### Basic Test Structure

```javascript
import { test, expect } from "@playwright/test";
import { E2EHelpers } from "./helpers/E2EHelpers.js";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
    await E2EHelpers.mockExternalAPIs(page);
  });

  test("should test specific workflow", async ({ page, request }) => {
    // Test implementation
    await page.goto("/");
    await expect(page).toHaveTitle(/Expected Title/);

    // Use helpers for common operations
    await E2EHelpers.loginAsUser(page);
    await E2EHelpers.waitForPageLoad(page);
  });
});
```

### Using E2E Helpers

The `E2EHelpers` class provides common utilities:

```javascript
// User authentication
await E2EHelpers.loginAsUser(page, "user@example.com", "password");
await E2EHelpers.loginAsAdmin(page);

// Data management
const user = await E2EHelpers.createTestUser(request);
await E2EHelpers.cleanupTestData(request);

// UI interactions
await E2EHelpers.waitForStableElement(page, '[data-testid="button"]');
await E2EHelpers.fillForm(page, { email: "test@example.com" });

// API testing
await E2EHelpers.waitForAPIResponse(page, "/api/endpoint");

// Performance and quality
await E2EHelpers.assertNoConsoleErrors(page);
await E2EHelpers.assertPerformance(page);
```

### Data Test IDs

Use `data-testid` attributes for reliable element selection:

```html
<!-- Good: Stable selector -->
<button data-testid="submit-button">Submit</button>

<!-- Avoid: Fragile selectors -->
<button class="btn btn-primary">Submit</button>
```

```javascript
// In tests
await page.click('[data-testid="submit-button"]');
```

## Best Practices

### 1. Test Independence

- Each test should be able to run independently
- Use `test.beforeEach()` for setup
- Clean up test data after each test

### 2. Reliable Selectors

- Prefer `data-testid` attributes
- Avoid CSS class selectors that might change
- Use semantic selectors when possible

### 3. Wait Strategies

```javascript
// Good: Wait for specific conditions
await page.waitForSelector('[data-testid="results"]', { state: "visible" });
await page.waitForLoadState("networkidle");

// Avoid: Fixed timeouts
await page.waitForTimeout(5000); // Only as last resort
```

### 4. Error Handling

```javascript
test("should handle errors gracefully", async ({ page }) => {
  // Mock error responses
  await page.route("/api/data", (route) =>
    route.fulfill({
      status: 500,
      body: "Server Error",
    })
  );

  await page.goto("/");
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

### 5. Performance Testing

```javascript
test("should load quickly", async ({ page }) => {
  const startTime = Date.now();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000);
});
```

## Debugging

### 1. Visual Debugging

```bash
# Run with browser UI visible
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# Interactive UI mode
npm run test:e2e:ui
```

### 2. Screenshots and Videos

- Automatic screenshots on test failures
- Videos recorded for failed tests
- Traces available for debugging

### 3. Console Logs

```javascript
// In tests, check for console errors
await E2EHelpers.assertNoConsoleErrors(page);

// Or capture manually
page.on("console", (msg) => console.log(msg.text()));
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: npm run test:e2e:install

- name: Run E2E tests
  run: npm run test:e2e
  env:
    E2E_BASE_URL: ${{ secrets.E2E_BASE_URL }}
    TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

- name: Upload test reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Separation from Jest Tests

The E2E tests are completely separate from Jest unit/integration tests:

| Aspect            | Jest Tests                          | Playwright E2E Tests      |
| ----------------- | ----------------------------------- | ------------------------- |
| **Purpose**       | Unit/Integration testing            | End-to-end user workflows |
| **Environment**   | Node.js                             | Real browsers             |
| **Test Files**    | `*.test.js`                         | `*.spec.js`               |
| **Location**      | `tests/unit/`, `tests/integration/` | `tests/e2e/`              |
| **Configuration** | `jest.config.js`                    | `playwright.config.js`    |
| **Commands**      | `npm test`                          | `npm run test:e2e`        |
| **Dependencies**  | Application modules                 | Running application       |

## Troubleshooting

### Common Issues

1. **Application not running**

   ```bash
   # Start the application first
   npm run web:start
   ```

2. **Browsers not installed**

   ```bash
   npm run test:e2e:install
   ```

3. **Port conflicts**

   - Check if port 3000 is available
   - Update `E2E_BASE_URL` in `.env.e2e` if needed

4. **Database connection issues**

   - Verify `TEST_DATABASE_URL` in `.env.e2e`
   - Ensure test database is accessible

5. **Test timeouts**
   - Increase timeouts in `playwright.config.js`
   - Check network connectivity
   - Verify application performance

### Getting Help

- Check Playwright documentation: https://playwright.dev/
- Review test reports in `playwright-report/`
- Use debug mode to step through tests
- Check application logs for backend issues

## Conclusion

This separated E2E testing setup provides:

- ✅ Complete isolation from unit tests
- ✅ Real browser testing capabilities
- ✅ Cross-platform compatibility
- ✅ Comprehensive debugging tools
- ✅ CI/CD ready configuration

You can now run unit tests and E2E tests independently, making your development workflow more efficient and reliable.
