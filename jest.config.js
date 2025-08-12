export default {
  // Test environment
  testEnvironment: 'node',
  testEnvironmentOptions: {
    // Ensure Node export conditions work under ESM
    customExportConditions: ['node', 'node-addons']
  },
  
  // ES Modules support
  preset: undefined,
  transform: {},
  moduleNameMapper: {
    // Shim fetch if needed in tests that import node-fetch directly
    '^(node-fetch)$': '<rootDir>/tests/shims/node-fetch.cjs'
  },
  
  // Set environment variables for tests
  setupFiles: ['<rootDir>/tests/jest.env.js'],
  
  // Test file patterns with specific timeouts
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  
  // Ignore Playwright tests (run separately)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '\\.spec\\.js$' // Playwright specs
  ],
  
  // Coverage configuration
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: [
    'src/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/bin/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test timeout (for slow network tests)
  testTimeout: process.env.CI ? 90000 : 60000,
  
  // Performance settings
  maxWorkers: process.env.CI ? 2 : '50%',
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Verbose output
  verbose: true
};
