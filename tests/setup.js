// Jest test setup file
import { jest } from '@jest/globals';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test utilities
global.createMockHTML = (title = 'Test Page', content = '<p>Test content</p>') => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="Test description">
</head>
<body>
  ${content}
</body>
</html>`;
};

// Mock fetch globally
global.fetch = jest.fn();

// Set environment variables for testing
process.env.NODE_ENV = 'test';
