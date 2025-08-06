/**
 * ============================================================================
 * WINSTON LOGGING CONFIGURATION
 * ============================================================================
 * 
 * Comprehensive logging system with multiple transports, error tracking,
 * and audit trail capabilities.
 * 
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Daily rotating log files
 * - Structured JSON logging
 * - Error tracking with stack traces
 * - Performance monitoring
 * - User action audit trails
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');

// Custom log format with timestamps and colors
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'sitescope-audit' },
  transports: [
    // Console logging for development
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat
    }),

    // Daily rotating error log
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    }),

    // Daily rotating combined log
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    }),

    // Daily rotating audit log for user actions
    new DailyRotateFile({
      filename: path.join(logsDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '10m',
      maxFiles: '90d',
      format: logFormat
    })
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// Specialized logging functions
export const auditLogger = {
  /**
   * Log audit start events
   */
  auditStarted: (sessionId, domain, options = {}) => {
    logger.info('Audit Started', {
      event: 'audit_started',
      sessionId,
      domain,
      reportType: options.reportType,
      maxPages: options.maxPages,
      priority: options.priority,
      userAgent: options.userAgent,
      ip: options.ip
    });
  },

  /**
   * Log audit completion events
   */
  auditCompleted: (sessionId, domain, results = {}) => {
    logger.info('Audit Completed', {
      event: 'audit_completed',
      sessionId,
      domain,
      duration: results.duration,
      pagesAnalyzed: results.pagesAnalyzed,
      linksFound: results.linksFound,
      errors: results.errors || 0,
      status: 'success'
    });
  },

  /**
   * Log audit failures
   */
  auditFailed: (sessionId, domain, error) => {
    logger.error('Audit Failed', {
      event: 'audit_failed',
      sessionId,
      domain,
      error: error.message,
      stack: error.stack,
      status: 'failed'
    });
  },

  /**
   * Log audit cache hits (when returning existing audit data)
   */
  auditCacheHit: (sessionId, domain, cacheInfo = {}) => {
    logger.info('Audit Cache Hit', {
      event: 'audit_cache_hit',
      sessionId,
      domain,
      auditId: cacheInfo.auditId,
      originalDate: cacheInfo.originalDate,
      status: 'cached_result'
    });
  },

  /**
   * Log performance metrics
   */
  performance: (sessionId, metrics) => {
    logger.info('Performance Metrics', {
      event: 'performance',
      sessionId,
      ...metrics
    });
  },

  /**
   * Log user actions
   */
  userAction: (action, user = null, metadata = {}) => {
    logger.info('User Action', {
      event: 'user_action',
      action,
      userId: user?.id || 'anonymous',
      userEmail: user?.email || null,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
};

// Web application logging functions
export const webLogger = {
  /**
   * Log HTTP requests
   */
  request: (req, res, responseTime) => {
    logger.info('HTTP Request', {
      event: 'http_request',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.session?.user?.id || null
    });
  },

  /**
   * Log validation errors
   */
  validationError: (req, errors) => {
    logger.warn('Validation Error', {
      event: 'validation_error',
      url: req.originalUrl,
      method: req.method,
      errors: errors,
      body: req.body,
      ip: req.ip
    });
  },

  /**
   * Log rate limiting events
   */
  rateLimited: (req) => {
    logger.warn('Rate Limited', {
      event: 'rate_limited',
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });
  },

  /**
   * Log security events
   */
  securityEvent: (event, req, details = {}) => {
    logger.warn('Security Event', {
      event: 'security_event',
      type: event,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      ...details
    });
  }
};

// Error handling utilities
export const errorHandler = {
  /**
   * Log application errors with context
   */
  logError: (error, context = {}) => {
    logger.error('Application Error', {
      event: 'application_error',
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  },

  /**
   * Log database errors
   */
  dbError: (error, query = null) => {
    logger.error('Database Error', {
      event: 'database_error',
      message: error.message,
      stack: error.stack,
      query: query,
      code: error.code || null
    });
  },

  /**
   * Log external API errors
   */
  apiError: (error, endpoint, requestData = {}) => {
    logger.error('External API Error', {
      event: 'api_error',
      endpoint,
      message: error.message,
      status: error.status || error.response?.status,
      requestData,
      responseData: error.response?.data
    });
  }
};

// Export main logger
export default logger;
