/**
 * Test Setup File
 * Configures testing environment and utilities
 */

import { vi } from 'vitest';
import { initializeDatabase, closeDatabase } from '../models/database.js';
import logger from '../lib/logger.js';

// Global test setup
beforeAll(async () => {
  // Initialize test database
  try {
    await initializeDatabase();
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
  
  // Suppress logs during testing unless debugging
  if (!process.env.DEBUG_TESTS) {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  }
});

// Global test cleanup
afterAll(async () => {
  try {
    await closeDatabase();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error closing test database:', error);
  }
});

// Mock external services for testing
vi.mock('../services/billingService.js', async () => {
  const actual = await vi.importActual('../services/billingService.js');
  return {
    ...actual,
    stripe: {
      customers: {
        create: vi.fn().mockResolvedValue({
          id: 'cus_test123',
          email: 'test@example.com'
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'cus_test123',
          email: 'test@example.com'
        })
      },
      subscriptions: {
        create: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'active'
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'active'
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'active'
        })
      },
      prices: {
        list: vi.fn().mockResolvedValue({
          data: [
            { id: 'price_professional_monthly', unit_amount: 2999 },
            { id: 'price_enterprise_monthly', unit_amount: 9999 }
          ]
        })
      }
    }
  };
});

// Test utilities
export const testUtils = {
  /**
   * Create a unique test email
   */
  createTestEmail() {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  },

  /**
   * Wait for a specified duration
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random string
   */
  randomString(length = 10) {
    return Math.random().toString(36).substr(2, length);
  },

  /**
   * Create mock request object
   */
  createMockRequest(overrides = {}) {
    return {
      session: {},
      headers: {},
      query: {},
      params: {},
      body: {},
      ...overrides
    };
  },

  /**
   * Create mock response object
   */
  createMockResponse() {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      redirect: vi.fn().mockReturnThis(),
      render: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      headers: {}
    };
    return res;
  }
};

// Global test helpers
global.testUtils = testUtils;
