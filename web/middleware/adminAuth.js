/**
 * Admin Authentication and Authorization Middleware
 * Handles admin-only access and permission checking
 */

import { query } from '../models/database.js';
import logger from '../lib/logger.js';

/**
 * Middleware to require admin authentication with optional permissions
 * @param {Array} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware function
 */
export const requireAdmin = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is logged in
      if (!req.session?.user?.id) {
        logger.warn('Unauthorized admin access attempt', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          url: req.originalUrl
        });
        
        return res.status(401).render('errors/401', {
          title: 'Authentication Required',
          message: 'You must be logged in to access this area.',
          user: null
        });
      }

      // Get fresh user data to check admin status
      const userResult = await query(
        'SELECT id, email, is_admin, admin_permissions, role FROM users WHERE id = $1',
        [req.session.user.id]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
        logger.warn('Non-admin user attempted admin access', {
          userId: req.session.user.id,
          email: req.session.user.email,
          ip: req.ip,
          url: req.originalUrl
        });
        
        return res.status(403).render('errors/403', {
          title: 'Access Denied',
          message: 'Administrator access required.',
          user: req.session.user
        });
      }

      const user = userResult.rows[0];

      // Check specific permissions if required
      if (requiredPermissions.length > 0) {
        const userPermissions = user.admin_permissions || [];
        const hasPermission = requiredPermissions.some(perm => 
          userPermissions.includes(perm) || 
          userPermissions.includes('*') ||
          user.role === 'super_admin'
        );

        if (!hasPermission) {
          logger.warn('Admin user lacks required permissions', {
            userId: user.id,
            email: user.email,
            requiredPermissions,
            userPermissions,
            url: req.originalUrl
          });
          
          return res.status(403).render('errors/403', {
            title: 'Insufficient Permissions',
            message: `You do not have permission to access this resource. Required: ${requiredPermissions.join(', ')}`,
            user: req.session.user
          });
        }
      }

      // Update session with fresh admin data
      req.session.user = {
        ...req.session.user,
        is_admin: true,
        admin_permissions: user.admin_permissions,
        role: user.role
      };

      // Add admin user to request for use in subsequent middleware
      req.adminUser = user;

      next();
    } catch (error) {
      logger.error('Error in admin authentication middleware', {
        error: error.message,
        stack: error.stack,
        userId: req.session?.user?.id
      });
      
      res.status(500).render('errors/500', {
        title: 'Authentication Error',
        message: 'An error occurred while verifying your permissions.',
        user: req.session?.user || null
      });
    }
  };
};

/**
 * Middleware to log admin activities
 */
export const logAdminActivity = async (req, res, next) => {
  // Store original res.send to intercept response
  const originalSend = res.send;
  const originalJson = res.json;
  const originalRender = res.render;

  // Override response methods to capture successful operations
  const logActivity = async (isSuccess) => {
    if (req.session?.user?.is_admin && isSuccess && res.statusCode < 400) {
      try {
        const action = `${req.method} ${req.route?.path || req.path}`;
        const targetType = req.params.type || extractTargetType(req.path);
        const targetId = req.params.id || req.params.userId || null;
        
        // Filter sensitive data from logging
        const sanitizedBody = sanitizeLogData(req.body);
        const sanitizedQuery = sanitizeLogData(req.query);

        await query(`
          INSERT INTO admin_activity_log (
            admin_user_id, action, target_type, target_id, 
            details, ip_address, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          req.session.user.id,
          action,
          targetType,
          targetId,
          JSON.stringify({ 
            body: sanitizedBody, 
            query: sanitizedQuery,
            params: req.params
          }),
          req.ip,
          req.headers['user-agent']
        ]);

        logger.info('Admin activity logged', {
          adminId: req.session.user.id,
          action,
          targetType,
          targetId,
          ip: req.ip
        });
      } catch (error) {
        logger.error('Failed to log admin activity', {
          error: error.message,
          adminId: req.session?.user?.id,
          action: `${req.method} ${req.path}`
        });
      }
    }
  };

  // Override res.send
  res.send = function(data) {
    logActivity(true);
    originalSend.call(this, data);
  };

  // Override res.json
  res.json = function(data) {
    logActivity(true);
    originalJson.call(this, data);
  };

  // Override res.render
  res.render = function(view, locals, callback) {
    logActivity(true);
    originalRender.call(this, view, locals, callback);
  };

  next();
};

/**
 * Extract target type from request path
 */
function extractTargetType(path) {
  if (path.includes('/users')) return 'user';
  if (path.includes('/subscriptions') || path.includes('/billing')) return 'subscription';
  if (path.includes('/audits')) return 'audit';
  if (path.includes('/settings')) return 'system';
  return 'system';
}

/**
 * Remove sensitive data from logs
 */
function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Middleware to check system maintenance mode
 */
export const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for admin users
    if (req.session?.user?.is_admin) {
      return next();
    }

    const result = await query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'"
    );

    if (result.rows.length > 0 && result.rows[0].setting_value === 'true') {
      return res.status(503).render('maintenance', {
        title: 'System Maintenance',
        message: 'The system is currently under maintenance. Please try again later.',
        user: req.session?.user || null
      });
    }

    next();
  } catch (error) {
    logger.error('Error checking maintenance mode', { error: error.message });
    // If we can't check maintenance mode, allow the request to proceed
    next();
  }
};

/**
 * Get admin user permissions
 */
export const getAdminPermissions = async (userId) => {
  try {
    const result = await query(
      'SELECT admin_permissions, role FROM users WHERE id = $1 AND is_admin = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return [];
    }

    const user = result.rows[0];
    return user.admin_permissions || [];
  } catch (error) {
    logger.error('Error getting admin permissions', { error: error.message, userId });
    return [];
  }
};

/**
 * Check if user has specific admin permission
 */
export const hasAdminPermission = async (userId, permission) => {
  const permissions = await getAdminPermissions(userId);
  return permissions.includes(permission) || permissions.includes('*');
};
