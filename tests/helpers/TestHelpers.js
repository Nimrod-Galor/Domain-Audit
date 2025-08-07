/**
 * Test Utilities
 * Common utilities and helpers for testing
 */

import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

export class TestHelpers {
  /**
   * Create a mock fetch response
   */
  static createMockResponse(data, status = 200, headers = {}) {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Map(Object.entries(headers)),
      text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
      json: () => Promise.resolve(typeof data === 'object' ? data : JSON.parse(data)),
      blob: () => Promise.resolve(new Blob([data])),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    });
  }

  /**
   * Mock fetch for specific URLs
   */
  static mockFetch(urlResponseMap) {
    const mockFetch = jest.fn();
    
    Object.entries(urlResponseMap).forEach(([url, response]) => {
      mockFetch.mockImplementationOnce((requestUrl) => {
        if (requestUrl === url || requestUrl.includes(url)) {
          return this.createMockResponse(response.data, response.status, response.headers);
        }
        return this.createMockResponse('Not Found', 404);
      });
    });

    global.fetch = mockFetch;
    return mockFetch;
  }

  /**
   * Create temporary test file
   */
  static async createTempFile(content, filename = null) {
    const tempDir = path.join(process.cwd(), 'tests', 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const filePath = path.join(tempDir, filename || `test-${Date.now()}.txt`);
    await fs.writeFile(filePath, content);
    
    return filePath;
  }

  /**
   * Clean up temporary test files
   */
  static async cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'tests', 'temp');
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  }

  /**
   * Create mock document for testing
   */
  static createMockDocument() {
    return {
      title: 'Test Document',
      URL: 'https://example.com',
      querySelectorAll: jest.fn(),
      querySelector: jest.fn(),
      head: {
        querySelectorAll: jest.fn(),
        querySelector: jest.fn()
      },
      body: {
        querySelectorAll: jest.fn(),
        querySelector: jest.fn()
      }
    };
  }

  /**
   * Create mock DOM with configurable methods
   */
  static createMockDOM(config = {}) {
    const defaultConfig = {
      title: 'Test Page',
      querySelector: jest.fn().mockReturnValue(null),
      querySelectorAll: jest.fn().mockReturnValue([])
    };

    return {
      ...defaultConfig,
      ...config
    };
  }

  /**
   * Create comprehensive mock DOM for technical analysis
   */
  static createMockDOMForTechnical(config = {}) {
    const querySelector = jest.fn().mockImplementation((selector) => {
      // Mock common elements that technical analyzer looks for
      if (selector === 'meta[name="viewport"]') {
        return { getAttribute: () => 'width=device-width, initial-scale=1' };
      }
      if (selector === 'meta[charset]') {
        return { getAttribute: () => 'utf-8' };
      }
      if (selector === 'meta[http-equiv="content-type"]') {
        return { getAttribute: () => 'text/html; charset=utf-8' };
      }
      return null;
    });

    const querySelectorAll = jest.fn().mockImplementation((selector) => {
      // Mock common element collections
      if (selector.includes('h1, h2, h3, h4, h5, h6')) {
        return [{ textContent: 'Test Heading' }];
      }
      if (selector === 'img') {
        return [{ getAttribute: () => 'test.jpg' }];
      }
      return [];
    });

    const getElementsByTagName = jest.fn().mockImplementation((tag) => {
      if (tag === 'h1') return [{ textContent: 'Main Title' }];
      if (tag === 'h2') return [{ textContent: 'Subtitle' }];
      if (tag === 'h3') return [];
      if (tag === 'h4') return [];
      if (tag === 'h5') return [];
      if (tag === 'h6') return [];
      if (tag === 'script') return [];
      if (tag === 'style') return [];
      if (tag === 'link') return [];
      return [];
    });

    const mockHead = {
      querySelector,
      querySelectorAll,
      getElementsByTagName
    };

    const mockBody = {
      querySelector,
      querySelectorAll,
      getElementsByTagName
    };

    const mockDocumentElement = {
      getAttribute: jest.fn().mockReturnValue('en')
    };

    return {
      title: config.title || 'Test Page',
      head: config.head || mockHead,
      body: config.body || mockBody,
      documentElement: config.documentElement || mockDocumentElement,
      querySelector,
      querySelectorAll,
      getElementsByTagName, // Add this to the main DOM object
      ...config
    };
  }

  /**
   * Wait for a condition to be true
   */
  static async waitForCondition(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await this.sleep(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random test data
   */
  static generateRandomData(type, count = 1) {
    const generators = {
      email: () => `test${Math.random().toString(36).substr(2, 9)}@example.com`,
      url: () => `https://test${Math.random().toString(36).substr(2, 5)}.com`,
      string: () => Math.random().toString(36).substr(2, 10),
      number: () => Math.floor(Math.random() * 1000),
      boolean: () => Math.random() > 0.5
    };

    const generator = generators[type];
    if (!generator) {
      throw new Error(`Unknown data type: ${type}`);
    }

    return count === 1 ? generator() : Array(count).fill().map(generator);
  }

  /**
   * Create mock HTML with specific characteristics
   */
  static createMockHTML(characteristics = {}) {
    const {
      title = 'Test Page',
      description = 'Test description',
      hasH1 = true,
      headingCount = { h1: 1, h2: 2, h3: 3 },
      linkCount = 5,
      imageCount = 3,
      hasMissingAlt = false,
      hasLongTitle = false,
      hasMetaDescription = true
    } = characteristics;

    let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n`;
    html += `  <meta charset="UTF-8">\n`;
    html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    
    // Title
    const pageTitle = hasLongTitle ? 
      'This is a very long title that exceeds the recommended length for SEO purposes and should be flagged as too long' : 
      title;
    html += `  <title>${pageTitle}</title>\n`;
    
    // Meta description
    if (hasMetaDescription) {
      html += `  <meta name="description" content="${description}">\n`;
    }
    
    html += `</head>\n<body>\n`;

    // Headings
    if (hasH1) {
      for (let i = 0; i < headingCount.h1; i++) {
        html += `  <h1>Main Heading ${i + 1}</h1>\n`;
      }
    }
    
    for (let i = 0; i < headingCount.h2; i++) {
      html += `  <h2>Sub Heading ${i + 1}</h2>\n`;
    }
    
    for (let i = 0; i < headingCount.h3; i++) {
      html += `  <h3>Sub Sub Heading ${i + 1}</h3>\n`;
    }

    // Content
    html += `  <p>Test content for the page.</p>\n`;

    // Links
    for (let i = 0; i < linkCount; i++) {
      const href = i % 2 === 0 ? `https://example.com/page${i}` : `https://external${i}.com`;
      html += `  <a href="${href}">Link ${i + 1}</a>\n`;
    }

    // Images
    for (let i = 0; i < imageCount; i++) {
      const alt = (hasMissingAlt && i === 0) ? '' : `Image ${i + 1} description`;
      html += `  <img src="image${i}.jpg" alt="${alt}">\n`;
    }

    html += `</body>\n</html>`;
    return html;
  }

  /**
   * Validate test performance
   */
  static validatePerformance(startTime, maxDuration, testName) {
    const duration = Date.now() - startTime;
    if (duration > maxDuration) {
      console.warn(`⚠️ Test "${testName}" took ${duration}ms (max: ${maxDuration}ms)`);
    }
    return duration;
  }

  /**
   * Create mock crawl response
   */
  static createMockCrawlResponse(url, options = {}) {
    const {
      statusCode = 200,
      contentType = 'text/html',
      loadTime = Math.floor(Math.random() * 2000) + 500,
      size = Math.floor(Math.random() * 50000) + 10000,
      content = null
    } = options;

    return {
      url,
      statusCode,
      contentType,
      loadTime,
      size,
      content: content || this.createMockHTML({ title: `Page for ${url}` }),
      headers: {
        'content-type': contentType,
        'content-length': size.toString()
      },
      timestamp: new Date().toISOString()
    };
  }

  // Database Testing Helpers
  static async setupTestDatabase() {
    const { testDatabase } = await import('./TestDatabase.js');
    await testDatabase.setup();
    console.log('Setting up test database...');
  }

  static async teardownTestDatabase() {
    const { testDatabase } = await import('./TestDatabase.js');
    await testDatabase.teardown();
    console.log('Tearing down test database...');
  }

  static async clearDatabase() {
    const { testDatabase } = await import('./TestDatabase.js');
    await testDatabase.reset();
    console.log('Clearing test database...');
  }

  static async createTestUser(userData = {}) {
    const defaultUser = {
      id: Math.floor(Math.random() * 10000),
      email: userData.email || 'test@example.com',
      password_hash: 'hashed_password',
      tier_id: userData.tier_id || 1,
      verified: userData.verified !== undefined ? userData.verified : true,
      created_at: new Date(),
      ...userData
    };
    
    return defaultUser;
  }

  static async createAudit(auditData = {}) {
    const defaultAudit = {
      id: Math.floor(Math.random() * 10000),
      user_id: auditData.user_id || 1,
      url: auditData.url || 'https://example.com',
      status: auditData.status || 'completed',
      created_at: new Date(),
      ...auditData
    };
    
    return defaultAudit;
  }

  static async getAuditById(auditId) {
    return auditId ? {
      id: auditId,
      user_id: 1,
      url: 'https://example.com',
      status: 'completed'
    } : null;
  }

  static async getUserById(userId) {
    return {
      id: userId,
      email: 'test@example.com',
      tier_id: 1,
      verified: true,
      last_login: new Date()
    };
  }

  static async getUserByEmail(email) {
    return {
      id: 1,
      email,
      tier_id: 1,
      verified: true
    };
  }

  static generateAuthToken(user) {
    return `mock.jwt.token.${user.id}`;
  }

  static generateResetToken(userId, expiresIn = 3600) {
    return `reset.token.${userId}.${Date.now() + expiresIn * 1000}`;
  }

  static generateVerificationToken(userId) {
    return `verify.token.${userId}.${Date.now()}`;
  }

  static async saveResetToken(userId, token) {
    console.log(`Saved reset token for user ${userId}`);
  }

  static async saveVerificationToken(userId, token) {
    console.log(`Saved verification token for user ${userId}`);
  }

  static mockEmailService(emailData) {
    console.log(`Mock email sent to ${emailData.to}: ${emailData.subject}`);
    return Promise.resolve({ messageId: 'mock-message-id' });
  }

  static async mockGoogleOAuth(code) {
    return {
      id: 'google-123',
      email: 'google-user@example.com',
      given_name: 'Google',
      family_name: 'User'
    };
  }

  // Performance Testing Helpers
  static async runAuditEngine(auditData) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    return {
      status: 'completed',
      pagesProcessed: auditData.maxPages || 1,
      score: Math.floor(Math.random() * 40) + 60,
      issues: []
    };
  }

  static async makeAPIRequest(url, options = {}) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    
    return {
      status: 200,
      json: () => Promise.resolve({ success: true })
    };
  }

  static async collectPerformanceKPIs() {
    return {
      avgAuditProcessingTime: Math.random() * 5000 + 8000,
      avgDatabaseQueryTime: Math.random() * 50 + 100,
      avgAPIResponseTime: Math.random() * 100 + 200,
      memoryUtilization: Math.random() * 20 + 50,
      cpuUtilization: Math.random() * 20 + 40
    };
  }

  static async getPerformanceBaseline() {
    return {
      auditProcessingTime: 10000,
      databaseQueryTime: 120,
      apiResponseTime: 250
    };
  }

  static async measureCurrentPerformance() {
    return {
      auditProcessingTime: Math.random() * 2000 + 9000,
      databaseQueryTime: Math.random() * 50 + 100,
      apiResponseTime: Math.random() * 100 + 200
    };
  }

  static async savePerformanceReport(report) {
    console.log('Performance report saved:', report.summary);
  }

  static async getUsersByTier(tierId) {
    return Array(Math.floor(Math.random() * 100) + 50).fill().map((_, i) => ({
      id: i + 1,
      email: `user${i}@example.com`,
      tier_id: tierId
    }));
  }

  static async getUserAudits(userId, options = {}) {
    const limit = options.limit || 10;
    return Array(limit).fill().map((_, i) => ({
      id: i + 1,
      user_id: userId,
      url: `https://example${i}.com`,
      status: 'completed',
      created_at: new Date(Date.now() - i * 86400000)
    }));
  }

  static async getAuditStatistics(userId) {
    return {
      total: 200,
      completed: 180,
      failed: 15,
      pending: 3,
      running: 2
    };
  }

  static async getUsersWithAuditData() {
    return Array(100).fill().map((_, i) => ({
      id: i + 1,
      email: `user${i}@example.com`,
      latestAudit: {
        id: i + 1000,
        url: `https://example${i}.com`,
        status: 'completed'
      },
      unreadNotifications: Math.floor(Math.random() * 5)
    }));
  }

  static async createNotification(notificationData = {}) {
    return {
      id: Math.floor(Math.random() * 10000),
      user_id: notificationData.user_id || 1,
      title: notificationData.title || 'Test Notification',
      message: notificationData.message || 'Test message',
      read: notificationData.read || false,
      created_at: new Date(),
      ...notificationData
    };
  }

  static getDatabase() {
    return {
      query: jest.fn(),
      transaction: jest.fn()
    };
  }
}

export default TestHelpers;
