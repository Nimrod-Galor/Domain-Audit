/**
 * Jest Global Setup File
 * Configures global testing environment for domain audit engine
 */

import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.AUDIT_TIMEOUT = '10000'; // Shorter timeout for tests
process.env.MAX_CONCURRENT_AUDITS = '2'; // Limit concurrency in tests

// Global test constants
global.TEST_CONSTANTS = {
  SAMPLE_URLS: {
    VALID: 'https://example.com',
    INVALID: 'not-a-url',
    SLOW: 'https://httpstat.us/200?sleep=5000',
    NOT_FOUND: 'https://httpstat.us/404',
    SERVER_ERROR: 'https://httpstat.us/500'
  },
  TIMEOUTS: {
    UNIT: 5000,
    INTEGRATION: 30000,
    E2E: 60000
  },
  SAMPLE_HTML: {
    BASIC: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page</title>
  <meta name="description" content="Test description">
</head>
<body>
  <h1>Test Heading</h1>
  <p>Test content</p>
</body>
</html>`,
    WITH_ISSUES: `<!DOCTYPE html>
<html>
<head>
  <title>Page with Issues</title>
</head>
<body>
  <h1></h1>
  <img src="test.jpg">
  <a href="">Empty link</a>
</body>
</html>`
  }
};

// Mock timers for consistent testing (only if jest is available)
if (typeof jest !== 'undefined') {
  jest.useFakeTimers({
    doNotFake: ['nextTick', 'setImmediate']
  });
}

// Global cleanup function for tests
global.afterEach = global.afterEach || (() => {});

// Override console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest ? jest.fn() : () => {},
  debug: jest ? jest.fn() : () => {},
  info: jest ? jest.fn() : () => {},
  warn: jest ? jest.fn() : () => {},
  error: jest ? jest.fn() : () => {}
};

// Restore console for debugging if needed
global.restoreConsole = () => {
  global.console = originalConsole;
};
