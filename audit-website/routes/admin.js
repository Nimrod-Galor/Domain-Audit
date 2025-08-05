/**
 * Admin Routes
 * All routes for the administrator dashboard
 */

import express from 'express';
import { requireAdmin, logAdminActivity } from '../middleware/adminAuth.js';
import { adminService } from '../services/adminService.js';
import { query } from '../models/database.js';
import logger from '../lib/logger.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(requireAdmin());
router.use(logAdminActivity);

/**
 * Admin Dashboard Home
 */
router.get('/', async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.session.user,
      stats,
      layout: 'admin'
    });
  } catch (error) {
    logger.error('Error loading admin dashboard', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).render('errors/500', { 
      title: 'Dashboard Error',
      error: error.message,
      user: req.session.user
    });
  }
});

/**
 * User Management
 */
router.get('/users', requireAdmin(['users']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = {
      tier: req.query.tier,
      status: req.query.status,
      search: req.query.search
    };

    const userdata = await adminService.getAllUsers(page, 50, filters);
    
    res.render('admin/users', {
      title: 'User Management',
      user: req.session.user,
      ...userdata,
      filters,
      layout: 'admin'
    });
  } catch (error) {
    logger.error('Error loading users page', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).render('errors/500', { 
      title: 'User Management Error',
      error: error.message,
      user: req.session.user
    });
  }
});

/**
 * Update User Tier (AJAX)
 */
router.post('/users/:id/tier', requireAdmin(['users']), async (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.params.id;

    if (!tier || !['freemium', 'starter', 'professional', 'enterprise'].includes(tier)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid tier specified' 
      });
    }

    await adminService.updateUserTier(userId, tier, req.session.user.id);
    
    res.json({ 
      success: true, 
      message: 'User tier updated successfully' 
    });
  } catch (error) {
    logger.error('Error updating user tier', { 
      error: error.message, 
      userId: req.params.id,
      tier: req.body.tier,
      adminId: req.session.user.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Suspend/Unsuspend User Account (AJAX)
 */
router.post('/users/:id/suspend', requireAdmin(['users']), async (req, res) => {
  try {
    const { suspend } = req.body;
    const userId = req.params.id;

    await adminService.toggleUserSuspension(userId, suspend, req.session.user.id);
    
    res.json({ 
      success: true, 
      message: `User ${suspend ? 'suspended' : 'reactivated'} successfully` 
    });
  } catch (error) {
    logger.error('Error toggling user suspension', { 
      error: error.message, 
      userId: req.params.id,
      adminId: req.session.user.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get User Details (AJAX)
 */
router.get('/users/:id', requireAdmin(['users']), async (req, res) => {
  try {
    const userId = req.params.id;
    const userDetails = await adminService.getUserById(userId);
    
    if (!userDetails) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: userDetails 
    });
  } catch (error) {
    logger.error('Error getting user details', { 
      error: error.message, 
      userId: req.params.id,
      adminId: req.session.user.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Analytics Dashboard
 */
router.get('/analytics', requireAdmin(['analytics']), async (req, res) => {
  try {
    const period = req.query.period || 'monthly';
    const days = parseInt(req.query.days) || 30;
    
    const [auditStats, revenueStats] = await Promise.all([
      adminService.getAuditStats(days),
      adminService.getRevenueStats(period)
    ]);

    res.render('admin/analytics', {
      title: 'Analytics',
      user: req.session.user,
      auditStats,
      revenueStats,
      period,
      days,
      layout: 'admin'
    });
  } catch (error) {
    logger.error('Error loading analytics page', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).render('errors/500', { 
      title: 'Analytics Error',
      error: error.message,
      user: req.session.user
    });
  }
});

/**
 * System Settings
 */
router.get('/settings', requireAdmin(['system']), async (req, res) => {
  try {
    const settings = await adminService.getSystemSettings();
    
    res.render('admin/settings', {
      title: 'System Settings',
      user: req.session.user,
      settings,
      layout: 'admin'
    });
  } catch (error) {
    logger.error('Error loading settings page', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).render('errors/500', { 
      title: 'Settings Error',
      error: error.message,
      user: req.session.user
    });
  }
});

/**
 * Update System Setting (AJAX)
 */
router.post('/settings/:key', requireAdmin(['system']), async (req, res) => {
  try {
    const { value } = req.body;
    const key = req.params.key;

    await adminService.updateSystemSetting(key, value, req.session.user.id);
    
    res.json({ 
      success: true, 
      message: 'Setting updated successfully' 
    });
  } catch (error) {
    logger.error('Error updating system setting', { 
      error: error.message, 
      key: req.params.key,
      value: req.body.value,
      adminId: req.session.user.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Activity Log
 */
router.get('/activity', requireAdmin(['system']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const activities = await adminService.getRecentActivity(limit);

    res.render('admin/activity', {
      title: 'Activity Log',
      user: req.session.user,
      activities,
      layout: 'admin'
    });
  } catch (error) {
    logger.error('Error loading activity log', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).render('errors/500', { 
      title: 'Activity Log Error',
      error: error.message,
      user: req.session.user
    });
  }
});

/**
 * Audit Management
 */
router.get('/audits', requireAdmin(['audits']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    const filters = {
      status: req.query.status,
      user_id: req.query.user_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (filters.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.user_id) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.date_from) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(filters.date_to + ' 23:59:59');
      paramIndex++;
    }

    const [audits, totalCount] = await Promise.all([
      query(`
        SELECT 
          a.*,
          u.email as user_email,
          u.full_name as user_name,
          u.tier as user_tier
        FROM audits a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]),
      
      query(`
        SELECT COUNT(*) as total 
        FROM audits a 
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
      `, params)
    ]);

    res.render('admin/audits', {
      title: 'Audit Management',
      user: req.session.user,
      audits: audits.rows,
      filters,
      currentPage: page,
      totalPages: Math.ceil(totalCount.rows[0].total / limit),
      totalCount: totalCount.rows[0].total,
      layout: 'admin'
    });
  } catch (error) {
    logger.error('Error loading audits page', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).render('errors/500', { 
      title: 'Audit Management Error',
      error: error.message,
      user: req.session.user
    });
  }
});

/**
 * System Health Check
 */
router.get('/health', requireAdmin(['system']), async (req, res) => {
  try {
    const healthData = {
      database: false,
      server: true,
      timestamp: new Date().toISOString()
    };

    // Test database connection
    try {
      await query('SELECT 1');
      healthData.database = true;
    } catch (dbError) {
      healthData.database = false;
      healthData.databaseError = dbError.message;
    }

    res.json(healthData);
  } catch (error) {
    logger.error('Error checking system health', { 
      error: error.message, 
      adminId: req.session.user.id 
    });
    
    res.status(500).json({ 
      error: error.message 
    });
  }
});

export default router;
