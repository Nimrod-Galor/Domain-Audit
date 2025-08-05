/**
 * Audit Model
 * Handles all audit-related database operations
 */
import { query, transaction } from './database.js';

export const Audit = {
  /**
   * Create a new audit
   * @param {Object} auditData - Audit data
   * @param {number} auditData.userId - User ID (optional for anonymous audits)
   * @param {string} auditData.domain - Domain/URL to audit
   * @param {string} auditData.auditType - Type of audit ('simple', 'full')
   * @param {Object} auditData.config - Audit configuration options
   * @returns {Promise<Object>} Created audit object
   */
  async create(auditData) {
    const { userId, domain, auditType = 'simple', config = {} } = auditData;
    
    try {
      const result = await query(
        `INSERT INTO audits (user_id, url, type, status) 
         VALUES ($1, $2, $3, 'pending') 
         RETURNING *`,
        [userId, domain, auditType]
      );
      
      console.log(`✅ Audit created: ${domain} (ID: ${result.rows[0].id})`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating audit:', error.message);
      throw error;
    }
  },

  /**
   * Find audit by ID
   * @param {number} id - Audit ID
   * @param {number} userId - User ID (optional, for access control)
   * @returns {Promise<Object|null>} Audit object or null
   */
  async findById(id, userId = null) {
    try {
      let queryText = 'SELECT * FROM audits WHERE id = $1';
      let params = [id];
      
      // If userId provided, ensure user has access to this audit
      if (userId) {
        queryText += ' AND (user_id = $2 OR user_id IS NULL)';
        params.push(userId);
      }
      
      const result = await query(queryText, params);
      const audit = result.rows[0] || null;
      
      // Parse JSON fields
      if (audit) {
        audit.config = typeof audit.config === 'string' ? JSON.parse(audit.config) : audit.config;
        audit.results = typeof audit.results === 'string' ? JSON.parse(audit.results) : audit.results;
      }
      
      return audit;
    } catch (error) {
      console.error('❌ Error finding audit by ID:', error.message);
      throw error;
    }
  },

  /**
   * Update audit status
   * @param {number} id - Audit ID
   * @param {string} status - New status ('pending', 'running', 'completed', 'failed')
   * @param {Object} additionalData - Additional data to update (optional)
   * @returns {Promise<Object>} Updated audit object
   */
  async updateStatus(id, status, additionalData = {}) {
    try {
      let setClause = 'status = $2';
      let params = [id, status];
      let paramIndex = 3;
      
      // Add additional fields to update
      Object.entries(additionalData).forEach(([key, value]) => {
        setClause += `, ${key} = $${paramIndex}`;
        params.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      });
      
      // Update completed_at if status is completed
      if (status === 'completed') {
        setClause += `, completed_at = CURRENT_TIMESTAMP`;
      }
      
      const result = await query(
        `UPDATE audits SET ${setClause} WHERE id = $1 RETURNING *`,
        params
      );
      
      if (result.rows.length === 0) {
        throw new Error('Audit not found');
      }
      
      console.log(`✅ Audit status updated: ${id} -> ${status}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating audit status:', error.message);
      throw error;
    }
  },

  /**
   * Save audit results
   * @param {number} id - Audit ID
   * @param {Object} results - Audit results
   * @param {number} score - Overall score (optional)
   * @returns {Promise<Object>} Updated audit object
   */
  async saveResults(id, results, score = null) {
    try {
      const result = await query(
        `UPDATE audits 
         SET results = $2, score = $3, status = 'completed', completed_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id, JSON.stringify(results), score]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Audit not found');
      }
      
      console.log(`✅ Audit results saved: ${id} (Score: ${score})`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error saving audit results:', error.message);
      throw error;
    }
  },

  /**
   * Get user's audits with pagination
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 10)
   * @param {string} options.status - Filter by status (optional)
   * @param {string} options.sortBy - Sort field (default: 'created_at')
   * @param {string} options.sortOrder - Sort order (default: 'DESC')
   * @returns {Promise<Object>} Paginated results
   */
  async getUserAudits(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;
    
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE user_id = $1';
      let params = [userId];
      let paramIndex = 2;
      
      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM audits ${whereClause}`,
        params
      );
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Get paginated results
      const auditsResult = await query(
        `SELECT id, domain, audit_type, status, score, created_at, completed_at 
         FROM audits 
         ${whereClause} 
         ORDER BY ${sortBy} ${sortOrder} 
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );
      
      return {
        audits: auditsResult.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Error getting user audits:', error.message);
      throw error;
    }
  },

  /**
   * Get recent audits across all users (for admin/analytics)
   * @param {number} limit - Number of results (default: 50)
   * @returns {Promise<Array>} Recent audits
   */
  async getRecentAudits(limit = 50) {
    try {
      const result = await query(
        `SELECT a.id, a.domain, a.audit_type, a.status, a.score, a.created_at, a.completed_at,
                u.email as user_email
         FROM audits a 
         LEFT JOIN users u ON a.user_id = u.id 
         ORDER BY a.created_at DESC 
         LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting recent audits:', error.message);
      throw error;
    }
  },

  /**
   * Get audit statistics
   * @param {number} userId - User ID (optional, for user-specific stats)
   * @param {number} days - Days to look back (default: 30)
   * @returns {Promise<Object>} Audit statistics
   */
  async getStats(userId = null, days = 30) {
    try {
      let whereClause = `WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'`;
      let params = [];
      
      if (userId) {
        whereClause += ' AND user_id = $1';
        params.push(userId);
      }
      
      const result = await query(
        `SELECT 
           COUNT(*) as total_audits,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_audits,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_audits,
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_audits,
           COUNT(CASE WHEN status = 'running' THEN 1 END) as running_audits,
           AVG(CASE WHEN score IS NOT NULL THEN score END)::INTEGER as average_score,
           COUNT(DISTINCT domain) as unique_domains
         FROM audits 
         ${whereClause}`,
        params
      );
      
      const stats = result.rows[0];
      return {
        totalAudits: parseInt(stats.total_audits) || 0,
        completedAudits: parseInt(stats.completed_audits) || 0,
        failedAudits: parseInt(stats.failed_audits) || 0,
        pendingAudits: parseInt(stats.pending_audits) || 0,
        runningAudits: parseInt(stats.running_audits) || 0,
        averageScore: stats.average_score || 0,
        uniqueDomains: parseInt(stats.unique_domains) || 0
      };
    } catch (error) {
      console.error('❌ Error getting audit stats:', error.message);
      throw error;
    }
  },

  /**
   * Delete audit
   * @param {number} id - Audit ID
   * @param {number} userId - User ID (for access control)
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, userId = null) {
    try {
      let queryText = 'DELETE FROM audits WHERE id = $1';
      let params = [id];
      
      // If userId provided, ensure user owns this audit
      if (userId) {
        queryText += ' AND user_id = $2';
        params.push(userId);
      }
      
      const result = await query(queryText, params);
      
      if (result.rowCount === 0) {
        throw new Error('Audit not found or access denied');
      }
      
      console.log(`✅ Audit deleted: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting audit:', error.message);
      throw error;
    }
  },

  /**
   * Get audit by domain for user (to check for duplicates)
   * @param {string} domain - Domain name or URL
   * @param {number} userId - User ID (optional)
   * @returns {Promise<Object|null>} Most recent audit for domain
   */
  async findByDomain(domain, userId = null) {
    try {
      let queryText = 'SELECT * FROM audits WHERE url = $1';
      let params = [domain];
      
      if (userId) {
        queryText += ' AND user_id = $2';
        params.push(userId);
      }
      
      queryText += ' ORDER BY created_at DESC LIMIT 1';
      
      const result = await query(queryText, params);
      const audit = result.rows[0] || null;
      
      // Parse JSON fields if they exist
      if (audit && audit.report_data) {
        audit.report_data = typeof audit.report_data === 'string' ? JSON.parse(audit.report_data) : audit.report_data;
      }
      
      return audit;
    } catch (error) {
      console.error('❌ Error finding audit by domain:', error.message);
      throw error;
    }
  },

  /**
   * Find most recent completed audit by domain (for cache lookup)
   * @param {string} domain - Domain name or URL
   * @returns {Promise<Object|null>} Most recent completed audit for domain
   */
  async findMostRecentByDomain(domain) {
    try {
      const result = await query(
        `SELECT * FROM audits 
         WHERE url = $1 AND status = 'completed' AND report_data IS NOT NULL
         ORDER BY created_at DESC 
         LIMIT 1`,
        [domain]
      );
      
      const audit = result.rows[0] || null;
      
      // Parse JSON fields if they exist
      if (audit && audit.report_data) {
        audit.report_data = typeof audit.report_data === 'string' ? JSON.parse(audit.report_data) : audit.report_data;
      }
      
      return audit;
    } catch (error) {
      console.error('❌ Error finding most recent audit by domain:', error.message);
      throw error;
    }
  },

  /**
   * Count user's audits in time period (for rate limiting)
   * @param {number} userId - User ID
   * @param {number} hours - Time period in hours
   * @returns {Promise<number>} Number of audits
   */
  async countUserAuditsInPeriod(userId, hours = 24) {
    try {
      const result = await query(
        `SELECT COUNT(*) 
         FROM audits 
         WHERE user_id = $1 
         AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${hours} hours'`,
        [userId]
      );
      
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('❌ Error counting user audits:', error.message);
      throw error;
    }
  },

  /**
   * Get all audits for a specific domain with pagination
   * @param {string} domain - Domain name or URL
   * @param {Object} options - Pagination and filtering options
   * @returns {Promise<Object>} Paginated audits for domain
   */
  async getAuditsByDomain(domain, options = {}) {
    const {
      page = 1,
      limit = 10,
      userId = null,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;
    
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE (url = $1 OR domain = $1)';
      let params = [domain];
      let paramIndex = 2;
      
      if (userId) {
        whereClause += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }
      
      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM audits ${whereClause}`,
        params
      );
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Get paginated results
      const auditsResult = await query(
        `SELECT id, url, domain, audit_type, status, score, created_at, completed_at, user_id
         FROM audits 
         ${whereClause} 
         ORDER BY ${sortBy} ${sortOrder} 
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );
      
      return {
        audits: auditsResult.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Error getting audits by domain:', error.message);
      throw error;
    }
  }
};
