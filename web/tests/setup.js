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

// Clean up after each test
afterEach(async () => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clean up test data if needed
  if (global.cleanupTestData) {
    await global.cleanupTestData();
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
        }),
        update: vi.fn().mockResolvedValue({
          id: 'cus_test123',
          email: 'test@example.com'
        })
      },
      subscriptions: {
        create: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 86400
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'active'
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'active'
        }),
        cancel: vi.fn().mockResolvedValue({
          id: 'sub_test123',
          status: 'canceled'
        })
      },
      prices: {
        list: vi.fn().mockResolvedValue({
          data: [
            { id: 'price_professional_monthly', unit_amount: 2999 },
            { id: 'price_enterprise_monthly', unit_amount: 9999 }
          ]
        })
      },
      webhookEndpoints: {
        create: vi.fn().mockResolvedValue({
          id: 'we_test123',
          url: 'https://test.com/webhook'
        })
      }
    }
  };
});

// Mock email service
vi.mock('../services/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  sendWelcomeEmail: vi.fn().mockResolvedValue(true)
}));

// Mock Google OAuth
vi.mock('passport-google-oauth20', () => ({
  Strategy: vi.fn().mockImplementation((options, verify) => {
    return {
      name: 'google',
      authenticate: vi.fn()
    };
  })
}));

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
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)',
        'x-forwarded-for': '127.0.0.1'
      },
      query: {},
      params: {},
      body: {},
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('localhost'),
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
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      headers: {},
      locals: {}
    };
    return res;
  },

  /**
   * Create test database transaction
   */
  async withTransaction(callback) {
    const { db } = await import('../models/database.js');
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('ROLLBACK'); // Always rollback in tests
      return result;
    } finally {
      client.release();
    }
  },

  /**
   * Create test user in database
   */
  async createTestUser(overrides = {}) {
    const { User } = await import('../models/index.js');
    const userData = {
      email: this.createTestEmail(),
      password: '$2a$10$hashedPasswordExample',
      verified: true,
      tier_id: 1,
      ...overrides
    };
    
    return await User.create(userData);
  },

  /**
   * Create test audit in database
   */
  async createTestAudit(userId = null, overrides = {}) {
    const { Audit } = await import('../models/index.js');
    const auditData = {
      url: 'https://example.com',
      user_id: userId,
      status: 'completed',
      report_type: 'simple',
      report_data: { summary: { score: 85 } },
      pages_scanned: 5,
      external_links_checked: 10,
      score: 85,
      duration_ms: 30000,
      ...overrides
    };
    
    return await Audit.create(auditData);
  },

  /**
   * Clean up test data
   */
  async cleanupTestData() {
    const { db } = await import('../models/database.js');
    
    // Clean up test records
    await db.query(`
      DELETE FROM audits WHERE url LIKE '%example.com%' OR url LIKE '%test%';
      DELETE FROM users WHERE email LIKE '%test%@example.com';
      DELETE FROM user_usage WHERE user_id NOT IN (SELECT id FROM users);
    `);
  }
};

// Global test helpers
global.testUtils = testUtils;

// Set up global cleanup
global.cleanupTestData = testUtils.cleanupTestData;
