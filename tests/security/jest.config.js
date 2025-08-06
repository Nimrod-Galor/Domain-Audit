/**
 * Security Test Suite Configuration
 * Jest configuration for security-focused testing
 */

module.exports = {
  displayName: 'Security Tests',
  testMatch: ['**/tests/security/**/*.test.js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/security/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    'audit-website/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage/security',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results/security',
      outputName: 'security-results.xml',
      suiteName: 'Security Test Suite'
    }]
  ],
  globals: {
    'security-config': {
      enableSecurityWarnings: true,
      strictValidation: true,
      auditMode: true
    }
  }
};
