const validator = require('validator');

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
  
  // Block localhost and private IPs for security
  if (cleanUrl.includes('localhost') || 
      cleanUrl.includes('127.0.0.1') || 
      cleanUrl.includes('192.168.') ||
      cleanUrl.includes('10.0.') ||
      cleanUrl.includes('172.16.')) {
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
 * Validate password strength
 */
function validatePassword(password) {
  if (!password || password.length < 6) {
    return false;
  }
  return true;
}

module.exports = {
  validateURL,
  sanitizeURL,
  validateEmail,
  validatePassword
};
