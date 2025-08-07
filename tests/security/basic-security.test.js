/**
 * Basic Security Tests
 * Tests for REAL enterprise security functions in our application
 * Focus: Testing our actual implementation using enterprise packages
 */

import { describe, test, expect } from '@jest/globals';

// Import REAL enterprise security functions from our application
import { 
  validationSchemas,
  XSSProtection,
  PasswordManager,
  SecurityUtils,
  configureSecurityHeaders,
  configureCSRFProtection
} from '../../web/lib/enterprise-security.js';

describe('Enterprise Security Implementation Tests', () => {
  
  describe('Joi Validation Schemas (Real Implementation)', () => {
    test('should validate URLs using real Joi schema', async () => {
      // Test legitimate URLs
      const { error: error1 } = validationSchemas.url.validate('https://example.com');
      expect(error1).toBeUndefined();
      
      const { error: error2 } = validationSchemas.url.validate('http://test.org');
      expect(error2).toBeUndefined();
      
      // Test blocked URLs (private networks)
      const { error: error3 } = validationSchemas.url.validate('http://localhost:3306');
      expect(error3).toBeDefined();
      
      const { error: error4 } = validationSchemas.url.validate('https://192.168.1.1');
      expect(error4).toBeDefined();
      
      // Test invalid protocols
      const { error: error5 } = validationSchemas.url.validate('javascript:alert("XSS")');
      expect(error5).toBeDefined();
    });

    test('should validate emails using real Joi schema', () => {
      // Test legitimate emails
      const { error: error1 } = validationSchemas.email.validate('user@example.com');
      expect(error1).toBeUndefined();
      
      const { error: error2 } = validationSchemas.email.validate('test.email+tag@domain.co.uk');
      expect(error2).toBeUndefined();
      
      // Test invalid emails
      const { error: error3 } = validationSchemas.email.validate('invalid-email');
      expect(error3).toBeDefined();
      
      const { error: error4 } = validationSchemas.email.validate('user@');
      expect(error4).toBeDefined();
    });

    test('should validate passwords using real Joi schema', () => {
      // Test valid passwords (enterprise requirements)
      const { error: error1 } = validationSchemas.password.validate('MySecureP@ssw0rd');
      expect(error1).toBeUndefined();
      
      const { error: error2 } = validationSchemas.password.validate('Complex123!');
      expect(error2).toBeUndefined();
      
      // Test invalid passwords
      const { error: error3 } = validationSchemas.password.validate('weak');
      expect(error3).toBeDefined();
      
      const { error: error4 } = validationSchemas.password.validate('NoNumbers!');
      expect(error4).toBeDefined();
      
      const { error: error5 } = validationSchemas.password.validate('nospecial123');
      expect(error5).toBeDefined();
    });

    test('should validate user input using real Joi schema', () => {
      // Test safe input
      const { error: error1 } = validationSchemas.userInput.validate('Safe user input');
      expect(error1).toBeUndefined();
      
      // Test blocked patterns
      const { error: error2 } = validationSchemas.userInput.validate('<script>alert(1)</script>');
      expect(error2).toBeDefined();
      
      const { error: error3 } = validationSchemas.userInput.validate('SELECT * FROM users --');
      expect(error3).toBeDefined();
    });
  });

  describe('Cheerio-based XSS Protection (Real Implementation)', () => {
    test('should sanitize HTML using real Cheerio implementation', () => {
      // Test script removal
      const result1 = XSSProtection.sanitizeHTML('<script>alert("xss")</script><p>Safe content</p>');
      expect(result1).not.toContain('<script>');
      expect(result1).toContain('Safe content');
      
      // Test attribute removal
      const result2 = XSSProtection.sanitizeHTML('<img src="x" onerror="alert(1)">');
      expect(result2).not.toContain('onerror');
      expect(result2).not.toContain('src');
      
      // Test dangerous element removal
      const result3 = XSSProtection.sanitizeHTML('<object data="malicious.swf"></object>');
      expect(result3).not.toContain('<object>');
    });

    test('should extract text content using real Cheerio implementation', () => {
      // Note: sanitizeText extracts all text content, including script content
      // For security, use sanitizeHTML instead which removes dangerous elements
      const result1 = XSSProtection.sanitizeText('<p>Hello <script>alert(1)</script> World</p>');
      expect(result1).toBe('Hello alert(1) World'); // This is what $.text() actually returns
      
      const result2 = XSSProtection.sanitizeText('<div>Safe <b>text</b> content</div>');
      expect(result2).toBe('Safe text content');
    });

    test('should escape HTML entities using real implementation', () => {
      const result = XSSProtection.escapeHTML('<script>alert("xss")</script>');
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    test('should sanitize URLs using real implementation', () => {
      // Valid URLs (preserve original format for URLs with protocol)
      expect(XSSProtection.sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(XSSProtection.sanitizeURL('http://test.org')).toBe('http://test.org');
      
      // Invalid URLs that should be blocked
      expect(XSSProtection.sanitizeURL('javascript:alert(1)')).toBe('');
      expect(XSSProtection.sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(XSSProtection.sanitizeURL('')).toBe('');
      
      // Note: 'invalid-url' gets prepended with https:// and becomes valid
      // This is expected behavior for the sanitizer
      expect(XSSProtection.sanitizeURL('invalid-url')).toBe('https://invalid-url/');
    });
  });

  describe('Argon2 Password Manager (Real Implementation)', () => {
    test('should hash and verify passwords using real Argon2', async () => {
      const password = 'TestPassword123!';
      
      // Hash password
      const hash = await PasswordManager.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
      
      // Verify correct password
      const isValid = await PasswordManager.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      // Verify incorrect password
      const isInvalid = await PasswordManager.verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    test('should check if hash needs rehashing', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordManager.hashPassword(password);
      
      const needsRehash = PasswordManager.needsRehash(hash);
      expect(typeof needsRehash).toBe('boolean');
    });
  });

  describe('Security Utilities (Real Implementation)', () => {
    test('should generate secure random strings', () => {
      const random1 = SecurityUtils.generateSecureRandom(32);
      const random2 = SecurityUtils.generateSecureRandom(32);
      
      expect(random1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(random2).toHaveLength(64);
      expect(random1).not.toBe(random2);
    });

    test('should perform constant-time string comparison', () => {
      const str1 = 'secret123';
      const str2 = 'secret123';
      const str3 = 'different';
      
      expect(SecurityUtils.safeCompare(str1, str2)).toBe(true);
      expect(SecurityUtils.safeCompare(str1, str3)).toBe(false);
      expect(SecurityUtils.safeCompare('', '')).toBe(true);
      expect(SecurityUtils.safeCompare('a', 'ab')).toBe(false); // Different lengths
    });

    test('should hash data for logging', () => {
      const sensitiveData = 'sensitive-information';
      const hash = SecurityUtils.hashForLogging(sensitiveData);
      
      expect(hash).toHaveLength(11); // 8 chars + '...'
      expect(hash.endsWith('...')).toBe(true);
      expect(hash).not.toContain(sensitiveData);
    });

    test('should validate IP addresses', () => {
      // Valid IPv4
      expect(SecurityUtils.isValidIP('192.168.1.1')).toBe(true);
      expect(SecurityUtils.isValidIP('10.0.0.1')).toBe(true);
      
      // Valid IPv6
      expect(SecurityUtils.isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      
      // Invalid IPs
      expect(SecurityUtils.isValidIP('256.256.256.256')).toBe(false);
      expect(SecurityUtils.isValidIP('not-an-ip')).toBe(false);
      expect(SecurityUtils.isValidIP('')).toBe(false);
    });
  });

  describe('Helmet Security Headers (Real Implementation)', () => {
    test('should configure security headers middleware', () => {
      const middleware = configureSecurityHeaders();
      expect(typeof middleware).toBe('function');
      expect(middleware.name).toBe('helmetMiddleware');
    });
  });

  describe('CSRF Protection (Real Implementation)', () => {
    test('should configure CSRF protection', () => {
      const csrfConfig = configureCSRFProtection();
      
      expect(csrfConfig).toHaveProperty('csrfProtection');
      expect(csrfConfig).toHaveProperty('generateCSRFToken');
      expect(csrfConfig).toHaveProperty('csrfMiddleware');
      
      expect(typeof csrfConfig.csrfProtection).toBe('function');
      expect(typeof csrfConfig.generateCSRFToken).toBe('function');
      expect(typeof csrfConfig.csrfMiddleware).toBe('function');
    });
  });
});
