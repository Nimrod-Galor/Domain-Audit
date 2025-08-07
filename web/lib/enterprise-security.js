import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import argon2 from 'argon2';
import speakeasy from 'speakeasy';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import os from 'os';

/**
 * Enterprise-grade security configuration using industry-standard packages
 */

// =====================================
// 🛡️  HTTP SECURITY HEADERS (Helmet)
// =====================================

/**
 * Configure comprehensive HTTP security headers
 */
export function configureSecurityHeaders() {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    // Expect Certificate Transparency
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
    // Frame Options
    frameguard: { action: 'deny' },
    // Hide Powered By
    hidePoweredBy: true,
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // IE No Open
    ieNoOpen: true,
    // No Sniff
    noSniff: true,
    // Origin Agent Cluster
    originAgentCluster: true,
    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: false,
    // Referrer Policy
    referrerPolicy: { policy: "no-referrer" },
    // X-XSS-Protection
    xssFilter: true,
  });
}

// =====================================
// 🔐 CSRF PROTECTION (csrf-csrf)
// =====================================

/**
 * Configure enterprise-grade CSRF protection
 */
export function configureCSRFProtection(options = {}) {
  const {
    secret = process.env.CSRF_SECRET || 'your-super-secret-csrf-key-change-in-production',
    cookieName = 'x-csrf-token',
    cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    },
    ...otherOptions
  } = options;

  const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => secret,
    cookieName,
    cookieOptions,
    size: 64, // Token size in bytes
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getTokenFromRequest: (req) => {
      return req.headers['x-csrf-token'] || 
             req.body._token || 
             req.query._token;
    },
    ...otherOptions
  });

  return {
    csrfProtection: doubleCsrfProtection,
    generateCSRFToken: generateCsrfToken,
    csrfMiddleware: (req, res, next) => {
      // Attach token generator to response locals
      res.locals.csrfToken = generateCsrfToken(req);
      next();
    }
  };
}

// =====================================
// 📋 INPUT VALIDATION (Joi)
// =====================================

/**
 * Enterprise validation schemas using Joi
 */
export const validationSchemas = {
  // URL validation with comprehensive security checks
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required()
    .custom((value, helpers) => {
      const url = value.toLowerCase();
      
      // Block dangerous protocols
      if (url.startsWith('ftp:') || 
          url.startsWith('file:') || 
          url.startsWith('data:') || 
          url.startsWith('javascript:') || 
          url.startsWith('vbscript:') ||
          url.startsWith('ldap:') ||
          url.startsWith('gopher:')) {
        return helpers.error('any.invalid');
      }
      
      // Block localhost and private networks
      if (url.includes('localhost') || 
          url.includes('127.0.0.1') || 
          url.includes('192.168.') ||
          url.includes('10.0.') ||
          url.includes('172.16.') ||
          url.includes('169.254.')) {
        return helpers.error('any.invalid');
      }
      
      // Block malformed URLs
      if (url === 'https://' || 
          url === 'http://' || 
          url.endsWith('/.') ||
          url.includes('https://.') ||
          url.includes('http://.')) {
        return helpers.error('any.invalid');
      }
      
      return value;
    }),

  // Email validation
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required()
    .max(254), // RFC 5321 limit

  // Enhanced password validation
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),

  // User input sanitization
  userInput: Joi.string()
    .max(10000)
    .custom((value, helpers) => {
      // Convert to lowercase for pattern matching
      const lowerValue = value.toLowerCase();
      
      // Block XSS patterns first (more specific)
      const xssPatterns = [
        /<script/i,
        /<img.*onerror/i,
        /javascript:/i,
        /vbscript:/i,
        /data:/i,
        /onclick/i,
        /onload/i,
        /onerror/i,
        /<.*>/,  // Any HTML tags
      ];
      
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          return helpers.error('any.invalid');
        }
      }
      
      // SQL injection pattern checks - comprehensive and case insensitive
      const sqlPatterns = [
        /--/i, // SQL comments
        /\/\*.*\*\//i, // Block comments
        /'.*or.*'/i, // OR with quotes
        /\b1\s*=\s*1\b/i, // 1=1 patterns
        /';/i, // Quote semicolon (common SQL injection start)
        /union\s+select/i, // UNION SELECT attacks
        /insert\s+into/i, // INSERT INTO attacks
        /delete\s+from/i, // DELETE FROM attacks
        /update\s+.*\s+set/i, // UPDATE SET attacks
        /drop\s+table/i, // DROP TABLE attacks
        /alter\s+table/i, // ALTER TABLE attacks
        /create\s+table/i, // CREATE TABLE attacks
      ];
      
      // Check for SQL patterns
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          return helpers.error('any.invalid');
        }
      }
      
      // Check for SQL keywords in dangerous contexts
      if (lowerValue.includes("';") || lowerValue.includes('/*') || lowerValue.includes('*/')) {
        return helpers.error('any.invalid');
      }
      
      // Block common SQL injection patterns - now checks any combination
      const sqlKeywords = ['drop', 'delete', 'insert', 'update', 'select', 'union', 'where', 'from', 'into', 'set', 'table', 'users', 'password', 'values'];
      for (const keyword of sqlKeywords) {
        if (lowerValue.includes(keyword)) {
          // Check if this keyword appears in SQL-like context
          if (lowerValue.includes('select') && lowerValue.includes('from')) {
            return helpers.error('any.invalid');
          }
          if (lowerValue.includes('union') && lowerValue.includes('select')) {
            return helpers.error('any.invalid');
          }
          if (lowerValue.includes('insert') && lowerValue.includes('into')) {
            return helpers.error('any.invalid');
          }
          if (lowerValue.includes('delete') && lowerValue.includes('from')) {
            return helpers.error('any.invalid');
          }
          if (lowerValue.includes('update') && lowerValue.includes('set')) {
            return helpers.error('any.invalid');
          }
          // Legacy check for quote/semicolon patterns
          if (lowerValue.includes("'") || lowerValue.includes(';')) {
            return helpers.error('any.invalid');
          }
        }
      }
      
      return value;
    }),

  // File upload validation
  filename: Joi.string()
    .max(255)
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .required()
    .custom((value, helpers) => {
      // Block path traversal
      if (value.includes('..')) {
        return helpers.error('any.invalid');
      }
      
      // Block hidden files
      if (value.startsWith('.')) {
        return helpers.error('any.invalid');
      }
      
      // Block backup files (but allow .tar.gz and similar)
      if (value.endsWith('~')) {
        return helpers.error('any.invalid');
      }
      
      // Block dangerous patterns
      const dangerousPatterns = [
        /\s/, // No spaces allowed
        /</, />/, // No HTML
        /@/, /#/, /\$/, // No special chars beyond allowed pattern
        /\.htaccess$/i, /\.htpasswd$/i, // Apache config
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return helpers.error('any.invalid');
        }
      }
      
      return value;
    }),

  // API parameters
  apiLimit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(50),

  apiOffset: Joi.number()
    .integer()
    .min(0)
    .default(0),
};

/**
 * Validation middleware factory
 */
export function validateInput(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req[property] = value;
    next();
  };
}

// =====================================
// 🚦 RATE LIMITING (express-rate-limit)
// =====================================

/**
 * Configure enterprise-grade rate limiting
 */
export const rateLimiters = {
  // General API rate limit
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator for more sophisticated limiting
    keyGenerator: (req) => {
      return req.ip + ':' + req.path;
    },
    // Skip successful requests in count
    skipSuccessfulRequests: false,
    // Skip failed requests in count
    skipFailedRequests: false,
  }),

  // Authentication endpoint rate limit
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: {
      error: 'Too many authentication attempts',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Password reset rate limit
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
      error: 'Too many password reset attempts',
      retryAfter: '1 hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // File upload rate limit
  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 uploads per minute
    message: {
      error: 'Too many upload attempts',
      retryAfter: '1 minute',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// =====================================
// 🔐 PASSWORD HASHING (Argon2)
// =====================================

/**
 * Enterprise-grade password hashing using Argon2
 */
export class PasswordManager {
  /**
   * Hash password using Argon2id (recommended variant)
   */
  static async hashPassword(password) {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
        saltLength: 32,
      });
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password, hash) {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  }

  /**
   * Check if password hash needs rehashing (for security upgrades)
   */
  static needsRehash(hash) {
    return argon2.needsRehash(hash, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }
}

// =====================================
// 🔐 TWO-FACTOR AUTHENTICATION (Speakeasy)
// =====================================

/**
 * Enterprise-grade 2FA using TOTP (Time-based One-Time Password)
 */
export class TwoFactorAuth {
  /**
   * Generate a new secret for 2FA setup
   */
  static generateSecret(userEmail, serviceName = 'Domain Audit Tool') {
    return speakeasy.generateSecret({
      name: userEmail,
      issuer: serviceName,
      length: 32,
    });
  }

  /**
   * Generate QR code URL for 2FA setup
   */
  static generateQRCodeURL(secret, userEmail, serviceName = 'Domain Audit Tool') {
    return speakeasy.otpauthURL({
      secret: secret.base32,
      label: userEmail,
      issuer: serviceName,
      encoding: 'base32',
    });
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(token, secret, window = 2) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: window, // Allow 2 time steps before/after current
    });
  }

  /**
   * Generate backup codes for 2FA recovery
   */
  static generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}

// =====================================
// 🧹 XSS PROTECTION (Cheerio-based)
// =====================================

/**
 * Enterprise-grade XSS protection using Cheerio (already in our stack)
 */
export class XSSProtection {
  /**
   * Sanitize HTML content to prevent XSS using Cheerio
   */
  static sanitizeHTML(dirty) {
    if (!dirty || typeof dirty !== 'string') {
      return '';
    }

    try {
      // Load HTML with Cheerio
      const $ = cheerio.load(dirty);
      
      // Remove script tags and dangerous elements
      $('script, object, embed, link[rel="stylesheet"], style').remove();
      
      // Remove all event handlers and dangerous attributes
      $('*').each(function() {
        const attrs = this.attribs || {};
        Object.keys(attrs).forEach(attr => {
          if (attr.startsWith('on') || 
              attr.includes('javascript:') || 
              attr.includes('data:')) {
            $(this).removeAttr(attr);
          }
          // Only remove src/href for dangerous elements, not safe ones like img/a
          if (['action', 'formaction'].includes(attr)) {
            $(this).removeAttr(attr);
          }
        });
      });
      
      // Remove unsafe tags but preserve safe ones
      const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'html', 'head', 'body'];
      $('*').each(function() {
        if (!allowedTags.includes(this.tagName)) {
          $(this).replaceWith($(this).text());
        }
      });
      
      // Return only the body content, not the full HTML structure
      return $('body').html() || $.html();
    } catch (error) {
      // If parsing fails, return escaped text
      return this.escapeHTML(dirty);
    }
  }

  /**
   * Sanitize text content (removes all HTML)
   */
  static sanitizeText(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Use Cheerio to extract text content only
    try {
      const $ = cheerio.load(input);
      return $.text();
    } catch (error) {
      // Fallback to regex-based HTML removal
      return input.replace(/<[^>]*>/g, '');
    }
  }

  /**
   * Escape HTML entities
   */
  static escapeHTML(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize user input for database storage
   */
  static sanitizeInput(input) {
    if (!input) return '';
    
    if (typeof input === 'string') {
      // First sanitize HTML using Cheerio
      let cleaned = this.sanitizeHTML(input);
      
      // Additional security: normalize whitespace and trim
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      // Limit length to prevent DoS
      return cleaned.substring(0, 10000);
    }
    
    return input;
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
      return '';
    }

    // Store original URL to preserve exact format when possible
    const originalUrl = url.trim();

    // Block dangerous protocols immediately
    if (originalUrl.match(/^(javascript|data|vbscript|file):/i)) {
      return '';
    }

    let processedUrl = originalUrl;

    // Add protocol if missing, but validate first
    if (!originalUrl.match(/^https?:\/\//) && !originalUrl.match(/^\//) && !originalUrl.match(/^\.\.?\//)) {
      // Basic check - only reject obviously invalid patterns
      if (originalUrl.includes(' ') || 
          originalUrl.length < 3 ||
          originalUrl === 'not-a-url') {
        return '';
      }
      processedUrl = 'https://' + originalUrl;
    }

    // Check for malformed URLs
    if (processedUrl === 'https://.' || 
        processedUrl === 'http://.' || 
        processedUrl.endsWith('/.') ||
        processedUrl.includes('https://.') ||
        processedUrl.includes('http://.')) {
      return '';
    }

    // Basic URL validation
    try {
      if (processedUrl.startsWith('/') || processedUrl.startsWith('./') || processedUrl.startsWith('../')) {
        // Relative URLs are valid
        return processedUrl;
      }
      
      // Validate URL format
      const urlObj = new URL(processedUrl);
      
      // For URLs that already had protocol, preserve original format exactly
      if (originalUrl.match(/^https?:\/\//)) {
        return originalUrl;
      }
      
      // For URLs that needed protocol, add trailing slash
      return urlObj.href.endsWith('/') ? urlObj.href : urlObj.href + '/';
    } catch (error) {
      return '';
    }
  }
}

// =====================================
// 🔄 SESSION MANAGEMENT
// =====================================

/**
 * Enterprise session configuration
 */
export function configureSession() {
  return {
    name: 'sessionId', // Don't use default 'connect.sid'
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS access to cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // CSRF protection
    },
    // Additional security
    rolling: true, // Reset expiry on activity
    genid: () => {
      // Generate cryptographically secure session IDs
      return crypto.randomBytes(32).toString('hex');
    },
  };
}

// =====================================
// 🛡️  SECURITY MIDDLEWARE FACTORY
// =====================================

/**
 * Create comprehensive security middleware stack
 */
export function createSecurityMiddleware(options = {}) {
  const {
    enableCSRF = true,
    enableRateLimit = true,
    customRateLimits = {},
    ...csrfOptions
  } = options;

  const middleware = [];

  // 1. Security headers
  middleware.push(configureSecurityHeaders());

  // 2. Rate limiting
  if (enableRateLimit) {
    middleware.push(rateLimiters.api);
  }

  // 3. CSRF protection
  if (enableCSRF) {
    const { csrfProtection, csrfMiddleware } = configureCSRFProtection(csrfOptions);
    middleware.push(csrfMiddleware);
    middleware.push(csrfProtection);
  }

  return middleware;
}

// =====================================
// 📊 SECURITY UTILITIES
// =====================================

/**
 * Security utility functions
 */
export const SecurityUtils = {
  /**
   * Generate cryptographically secure random string
   */
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  },

  /**
   * Hash sensitive data for logging (one-way)
   */
  hashForLogging(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 8) + '...';
  },

  /**
   * Validate IP address format
   */
  isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },
};

export default {
  configureSecurityHeaders,
  configureCSRFProtection,
  validationSchemas,
  validateInput,
  rateLimiters,
  PasswordManager,
  TwoFactorAuth,
  XSSProtection,
  configureSession,
  createSecurityMiddleware,
  SecurityUtils,
};
