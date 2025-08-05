/**
 * Admin Service
 * Handles administrative operations and analytics
 */

import { query } from '../models/database.js';
import logger from '../lib/logger.js';

export class AdminService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    try {
      const stats = await Promise.all([
        // Total users by tier
        query(`
          SELECT tier, COUNT(*) as count 
          FROM users 
          WHERE tier IS NOT NULL AND is_admin = false
          GROUP BY tier
        `),
        
        // Revenue metrics
        query(`
          SELECT 
            COALESCE(SUM(amount), 0) as total_revenue,
            COUNT(*) as total_subscriptions,
            COALESCE(AVG(amount), 0) as avg_revenue
          FROM subscriptions 
          WHERE status = 'active'
        `),
        
        // Usage metrics (last 30 days)
        query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as audits_count,
            COUNT(DISTINCT user_id) as unique_users
          FROM audits 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `),
        
        // System health (last 24 hours)
        query(`
          SELECT 
            COUNT(*) as total_audits,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_audits,
            COUNT(*) FILTER (WHERE status = 'failed') as failed_audits,
            COUNT(*) FILTER (WHERE status = 'running') as running_audits,
            COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status = 'completed'), 0) as avg_duration
          FROM audits 
          WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        `),

        // Recent activity summary
        query(`
          SELECT 
            COUNT(*) as total_activities,
            COUNT(DISTINCT admin_user_id) as active_admins
          FROM admin_activity_log 
          WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        `)
      ]);

      return {
        usersByTier: stats[0].rows,
        revenue: stats[1].rows[0] || { total_revenue: 0, total_subscriptions: 0, avg_revenue: 0 },
        dailyUsage: stats[2].rows,
        systemHealth: stats[3].rows[0] || { 
          total_audits: 0, 
          completed_audits: 0, 
          failed_audits: 0, 
          running_audits: 0,
          avg_duration: 0 
        },
        recentActivity: stats[4].rows[0] || { total_activities: 0, active_admins: 0 }
      };
    } catch (error) {
      logger.error('Error getting dashboard stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get paginated list of users with filters
   */
  async getAllUsers(page = 1, limit = 50, filters = {}) {
    try {
      let whereClause = "WHERE is_admin = false";
      let params = [];
      let paramIndex = 1;

      if (filters.tier) {
        whereClause += ` AND tier = $${paramIndex}`;
        params.push(filters.tier);
        paramIndex++;
      }

      if (filters.status) {
        whereClause += ` AND subscription_status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.search) {
        whereClause += ` AND (email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex + 1})`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
        paramIndex += 2;
      }

      const offset = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        query(`
          SELECT 
            u.id,
            u.email,
            u.full_name,
            u.tier,
            u.subscription_status,
            u.created_at,
            u.last_login_at,
            u.login_count,
            ul.audits_per_month,
            ul.max_internal_pages,
            s.status as subscription_status_detail,
            s.amount as subscription_amount,
            s.billing_cycle,
            ut.audits_used,
            ut.api_calls_used
          FROM users u
          LEFT JOIN user_limits ul ON u.id = ul.user_id
          LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
          LEFT JOIN usage_tracking ut ON u.id = ut.user_id AND ut.month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
          ${whereClause}
          ORDER BY u.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...params, limit, offset]),
        
        query(`
          SELECT COUNT(*) as total 
          FROM users u 
          ${whereClause}
        `, params)
      ]);

      return {
        users: users.rows,
        totalCount: parseInt(totalCount.rows[0].total),
        totalPages: Math.ceil(totalCount.rows[0].total / limit),
        currentPage: page,
        hasNextPage: page * limit < totalCount.rows[0].total,
        hasPrevPage: page > 1
      };
    } catch (error) {
      logger.error('Error getting users list', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Update user tier (admin action)
   */
  async updateUserTier(userId, newTier, adminId) {
    try {
      // Get current tier for logging
      const currentUser = await query('SELECT tier FROM users WHERE id = $1', [userId]);
      const oldTier = currentUser.rows[0]?.tier;

      // Update user tier
      await query(`
        UPDATE users SET tier = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [newTier, userId]);

      // Update user limits based on new tier
      const tierLimits = await this.getTierLimits(newTier);
      if (tierLimits) {
        await query(`
          INSERT INTO user_limits (
            user_id, tier, audits_per_month, max_internal_pages, 
            max_external_links, max_domains, api_access, white_label,
            scheduled_audits, team_members
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (user_id) DO UPDATE SET
            tier = EXCLUDED.tier,
            audits_per_month = EXCLUDED.audits_per_month,
            max_internal_pages = EXCLUDED.max_internal_pages,
            max_external_links = EXCLUDED.max_external_links,
            max_domains = EXCLUDED.max_domains,
            api_access = EXCLUDED.api_access,
            white_label = EXCLUDED.white_label,
            scheduled_audits = EXCLUDED.scheduled_audits,
            team_members = EXCLUDED.team_members
        `, [
          userId,
          newTier,
          tierLimits.audits_per_month,
          tierLimits.max_internal_pages,
          tierLimits.max_external_links,
          tierLimits.max_domains,
          tierLimits.api_access,
          tierLimits.white_label,
          tierLimits.scheduled_audits,
          tierLimits.team_members
        ]);
      }

      logger.info('User tier updated by admin', {
        userId,
        oldTier,
        newTier,
        adminId
      });

      return true;
    } catch (error) {
      logger.error('Error updating user tier', { 
        error: error.message, 
        userId, 
        newTier, 
        adminId 
      });
      throw error;
    }
  }

  /**
   * Get tier limits from tier_definitions table
   */
  async getTierLimits(tierName) {
    try {
      const result = await query(`
        SELECT * FROM tier_definitions WHERE tier_name = $1
      `, [tierName]);

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting tier limits', { error: error.message, tierName });
      return null;
    }
  }

  /**
   * Get system settings
   */
  async getSystemSettings() {
    try {
      const settings = await query(`
        SELECT setting_key, setting_value, setting_type, description, is_public 
        FROM system_settings 
        ORDER BY setting_key
      `);

      return settings.rows.reduce((acc, setting) => {
        let value = setting.setting_value;
        
        // Parse value based on type
        switch (setting.setting_type) {
          case 'boolean':
            value = value === 'true';
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = setting.setting_value;
            }
            break;
        }

        acc[setting.setting_key] = {
          value,
          type: setting.setting_type,
          description: setting.description,
          isPublic: setting.is_public
        };
        
        return acc;
      }, {});
    } catch (error) {
      logger.error('Error getting system settings', { error: error.message });
      throw error;
    }
  }

  /**
   * Update system setting
   */
  async updateSystemSetting(key, value, adminId) {
    try {
      await query(`
        UPDATE system_settings 
        SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE setting_key = $3
      `, [value.toString(), adminId, key]);

      logger.info('System setting updated', { key, value, adminId });
      return true;
    } catch (error) {
      logger.error('Error updating system setting', { 
        error: error.message, 
        key, 
        value, 
        adminId 
      });
      throw error;
    }
  }

  /**
   * Get audit statistics for a specific period
   */
  async getAuditStats(days = 30) {
    try {
      const stats = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_audits,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          COUNT(*) FILTER (WHERE status = 'running') as running,
          COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status = 'completed'), 0) as avg_duration
        FROM audits 
        WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      return stats.rows;
    } catch (error) {
      logger.error('Error getting audit stats', { error: error.message, days });
      throw error;
    }
  }

  /**
   * Get revenue analytics for different periods
   */
  async getRevenueStats(period = 'monthly') {
    try {
      let dateFormat = 'YYYY-MM';
      let interval = 'month';
      
      if (period === 'daily') {
        dateFormat = 'YYYY-MM-DD';
        interval = 'day';
      } else if (period === 'yearly') {
        dateFormat = 'YYYY';
        interval = 'year';
      }

      const stats = await query(`
        SELECT 
          TO_CHAR(created_at, '${dateFormat}') as period,
          COUNT(*) as new_subscriptions,
          COALESCE(SUM(amount), 0) as revenue,
          COALESCE(AVG(amount), 0) as avg_revenue
        FROM subscriptions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 ${interval}'
        GROUP BY TO_CHAR(created_at, '${dateFormat}')
        ORDER BY period DESC
      `);

      return stats.rows;
    } catch (error) {
      logger.error('Error getting revenue stats', { error: error.message, period });
      throw error;
    }
  }

  /**
   * Get recent admin activity log
   */
  async getRecentActivity(limit = 100) {
    try {
      const activities = await query(`
        SELECT 
          al.*,
          u.email as admin_email,
          u.full_name as admin_name
        FROM admin_activity_log al
        LEFT JOIN users u ON al.admin_user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT $1
      `, [limit]);

      return activities.rows;
    } catch (error) {
      logger.error('Error getting recent activity', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId) {
    try {
      const result = await query(`
        SELECT 
          u.*,
          ul.*,
          s.status as subscription_status_detail,
          s.amount as subscription_amount,
          s.billing_cycle
        FROM users u
        LEFT JOIN user_limits ul ON u.id = ul.user_id
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        WHERE u.id = $1
      `, [userId]);

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting user by ID', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Suspend or unsuspend user account
   */
  async toggleUserSuspension(userId, suspend, adminId) {
    try {
      const status = suspend ? 'suspended' : 'active';
      
      await query(`
        UPDATE users 
        SET subscription_status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [status, userId]);

      logger.info(`User account ${suspend ? 'suspended' : 'reactivated'}`, {
        userId,
        adminId,
        action: suspend ? 'suspend' : 'reactivate'
      });

      return true;
    } catch (error) {
      logger.error('Error toggling user suspension', { 
        error: error.message, 
        userId, 
        suspend, 
        adminId 
      });
      throw error;
    }
  }
}

export const adminService = new AdminService();
