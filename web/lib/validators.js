import validator from 'validator';

/**
 * Validate URL format and accessibility
 */
function validateURL(url) {
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
function sanitizeURL(url) {
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
function validateEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validate password strength with enhanced security requirements
 */
function validatePassword(password) {
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
function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Basic HTML entity encoding
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input for database queries
 */
function sanitizeInput(input) {
  if (!input) return '';
  
  if (typeof input === 'string') {
    // Remove potential SQL injection patterns
    return input
      .replace(/['";\\]/g, '') // Remove quotes and backslashes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .trim();
  }
  
  return input;
}

/**
 * Generate secure random token for CSRF protection
 */
function generateCSRFToken() {
  import('crypto').then(crypto => {
    return crypto.randomBytes(32).toString('hex');
  });
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(sessionToken, requestToken) {
  if (!sessionToken || !requestToken) {
    return false;
  }
  
  // Use crypto.timingSafeEqual to prevent timing attacks
  return import('crypto').then(crypto => {
    if (sessionToken.length !== requestToken.length) {
      return false;
    }
    
    try {
      return crypto.default.timingSafeEqual(
        Buffer.from(sessionToken),
        Buffer.from(requestToken)
      );
    } catch (error) {
      return false;
    }
  });
}

export {
  validateURL,
  sanitizeURL,
  validateEmail,
  validatePassword,
  sanitizeHTML,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken
};
