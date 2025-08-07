import validator from 'validator';
import crypto from 'crypto';
import { XSSProtection } from './enterprise-security.js';

/**
 * Validate URL format and accessibility
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Basic URL validation
  if (!validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  })) {
    return false;
  }
  
  // Check for common issues
  const cleanUrl = url.trim().toLowerCase();
  
  // Block localhost and private/link-local IPs for security
  if (cleanUrl.includes('localhost') || 
      cleanUrl.includes('127.0.0.1') || 
      cleanUrl.includes('192.168.') ||
      cleanUrl.includes('10.0.') ||
      cleanUrl.includes('172.16.') ||
      cleanUrl.includes('169.254.')) {  // Link-local (AWS metadata, etc.)
    return false;
  }
  
  return true;
}

/**
 * Sanitize URL for safe processing
 */
export function sanitizeURL(url) {
  if (!url) return '';
  
  let cleanUrl = url.trim();
  
  // Add protocol if missing
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  return cleanUrl;
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validate password strength with enhanced security requirements
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Minimum length requirement
  if (password.length < 8) {
    return false;
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return false;
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Use the enterprise XSS protection for better sanitization
  return XSSProtection.sanitizeHTML(html);
}

/**
 * Validate and sanitize user input for database queries
 */
export function sanitizeInput(input) {
  if (!input) return '';
  
  if (typeof input === 'string') {
    // Use the enterprise XSS protection
    let sanitized = XSSProtection.sanitizeInput(input);
    
    // Additional SQL injection protection
    sanitized = sanitized
      .replace(/['";\\]/g, '') // Remove quotes and backslashes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .trim();
      
    return sanitized;
  }
  
  return input;
}

/**
 * Generate secure random token for CSRF protection
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionToken, requestToken) {
  if (!sessionToken || !requestToken) {
    return false;
  }
  
  // Use crypto.timingSafeEqual to prevent timing attacks
  if (sessionToken.length !== requestToken.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(sessionToken),
      Buffer.from(requestToken)
    );
  } catch (error) {
    return false;
  }
}

/**
 * CSRF Protection middleware factory
 */
export function csrfProtection(options = {}) {
  return (req, res, next) => {
    // Generate token if it doesn't exist
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCSRFToken();
    }
    
    // Skip validation for safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Get token from various sources
    const requestToken = req.headers['x-csrf-token'] || 
                        req.body._token || 
                        req.query._token;
    
    // Validate token
    if (!validateCSRFToken(req.session.csrfToken, requestToken)) {
      return res.status(403).json({
        error: 'Invalid CSRF token'
      });
    }
    
    next();
  };
}

/**
 * Generate CSRF token for forms
 */
export function generateCSRF() {
  return generateCSRFToken();
}

/**
 * Add CSRF token to response locals for templates
 */
export function addCSRFToResponse(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

// Export all functions for compatibility
export default {
  validateURL,
  sanitizeURL,
  validateEmail,
  validatePassword,
  sanitizeHTML,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  csrfProtection,
  generateCSRF,
  addCSRFToResponse
};
