/**
 * Test Configuration for Vitest
 * Configures testing environment for tier system tests
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test file patterns
    include: [
      'tests/**/*.test.js',
      'tests/**/*.spec.js'
    ],
    
    // Test timeout
    testTimeout: 30000, // 30 seconds for integration tests
    
    // Setup files
    setupFiles: ['./tests/setup.js'],
    
    // Global test settings
    globals: true,
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      include: [
        'services/**/*.js',
        'middleware/**/*.js',
        'controllers/**/*.js',
        'models/**/*.js',
        'lib/**/*.js'
      ],
      exclude: [
        'node_modules/**',
        'tests/**',
        'public/**',
        'views/**',
        'scripts/**',
        'migrations/**'
      ],
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage/tier-system',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Test environment variables
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://localhost/sitescope_test',
      SESSION_SECRET: 'test-session-secret',
      STRIPE_PUBLISHABLE_KEY: 'pk_test_fake_key',
      STRIPE_SECRET_KEY: 'sk_test_fake_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_fake_secret',
      API_RATE_LIMIT_PROFESSIONAL: '1000',
      API_RATE_LIMIT_ENTERPRISE: '10000'
    },
    
    // Test reporters
    reporter: ['verbose', 'html'],
    
    // Test sequencing
    sequence: {
      concurrent: false // Run tests sequentially for database consistency
    },
    
    // Test pools
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true // Use single fork for database tests
      }
    }
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@services': path.resolve(__dirname, './services'),
      '@models': path.resolve(__dirname, './models'),
      '@lib': path.resolve(__dirname, './lib'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
