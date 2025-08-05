/**
 * ============================================================================
 * EXPRESS LOGGING MIDDLEWARE
 * ============================================================================
 * 
 * Automatic request/response logging middleware with performance tracking
 * and error handling integration.
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { webLogger, errorHandler } from '../logger.js';

/**
 * Request logging middleware
 * Logs all HTTP requests with response times and status codes
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response time
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log the request
    webLogger.request(req, res, responseTime);
    
    // Call original end
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Error logging middleware
 * Captures and logs all application errors
 */
export const errorLogger = (err, req, res, next) => {
  // Log the error with request context
  errorHandler.logError(err, {
    url: req.originalUrl,
    method: req.method,
    body: req.method === 'POST' ? req.body : undefined,
    query: req.query,
    params: req.params,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.session?.user?.id || null
  });
  
  next(err);
};

/**
 * 404 logging middleware
 * Logs all 404 errors for monitoring
 */
export const notFoundLogger = (req, res, next) => {
  webLogger.securityEvent('404_not_found', req, {
    requestedUrl: req.originalUrl
  });
  
  next();
};

/**
 * Rate limit logging middleware
 * Logs when users hit rate limits
 */
export const rateLimitLogger = (req, res, next) => {
  if (req.rateLimit?.remaining === 0) {
    webLogger.rateLimited(req);
  }
  next();
};
