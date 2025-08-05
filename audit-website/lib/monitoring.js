/**
 * Monitoring and Health Check System
 * Provides real-time monitoring capabilities for the tier system
 */

import { query } from "../models/database.js";
import { tierService } from "../services/tierService.js";
import logger from "../lib/logger.js";

export class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.setupHealthChecks();
  }

  /**
   * Setup all health check functions
   */
  setupHealthChecks() {
    this.checks.set('database', this.checkDatabase.bind(this));
    this.checks.set('tierSystem', this.checkTierSystem.bind(this));
    this.checks.set('apiSystem', this.checkApiSystem.bind(this));
    this.checks.set('billingSystem', this.checkBillingSystem.bind(this));
    this.checks.set('usageTracking', this.checkUsageTracking.bind(this));
  }

  /**
   * Run all health checks
   * @returns {Object} Health check results
   */
  async runAllChecks() {
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        total: this.checks.size,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    for (const [name, checkFunction] of this.checks) {
      try {
        const checkResult = await checkFunction();
        results.checks[name] = checkResult;
        
        if (checkResult.status === 'healthy') {
          results.summary.passed++;
        } else if (checkResult.status === 'warning') {
          results.summary.warnings++;
        } else {
          results.summary.failed++;
          results.status = 'unhealthy';
        }
      } catch (error) {
        results.checks[name] = {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        };
        results.summary.failed++;
        results.status = 'unhealthy';
      }
    }

    // Log overall health status
    if (results.status === 'unhealthy') {
      logger.error('Health check failed', results);
    } else if (results.summary.warnings > 0) {
      logger.warn('Health check has warnings', results);
    } else {
      logger.info('Health check passed', { 
        status: results.status, 
        checks: results.summary 
      });
    }

    return results;
  }

  /**
   * Check database connectivity and performance
   */
  async checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await query('SELECT 1 as test');
      
      // Test tier system tables
      const tableChecks = await Promise.all([
        query('SELECT COUNT(*) FROM users LIMIT 1'),
        query('SELECT COUNT(*) FROM tier_definitions LIMIT 1'),
        query('SELECT COUNT(*) FROM user_limits LIMIT 1'),
        query('SELECT COUNT(*) FROM usage_tracking LIMIT 1')
      ]);

      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 100 ? 'healthy' : 'warning',
        message: `Database responsive in ${responseTime}ms`,
        responseTime: responseTime,
        tablesAccessible: tableChecks.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check tier system functionality
   */
  async checkTierSystem() {
    try {
      // Test tier validation
      const freemiumCheck = await tierService.canPerformAudit(null, 25, 10);
      
      // Test tier definitions exist
      const tierDefs = await query('SELECT COUNT(*) FROM tier_definitions');
      const tierCount = parseInt(tierDefs.rows[0].count);

      // Test user limits functionality
      const userLimits = await query('SELECT COUNT(*) FROM user_limits LIMIT 1');
      
      const issues = [];
      if (tierCount < 4) issues.push('Missing tier definitions');
      if (freemiumCheck.allowed !== false) issues.push('Freemium limits not enforced');

      return {
        status: issues.length === 0 ? 'healthy' : 'warning',
        message: issues.length === 0 ? 'Tier system functioning correctly' : `Issues found: ${issues.join(', ')}`,
        tierDefinitions: tierCount,
        freemiumEnforcement: !freemiumCheck.allowed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Tier system check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check API system health
   */
  async checkApiSystem() {
    try {
      // Check for users with API access
      const apiUsers = await query(`
        SELECT COUNT(*) FROM users 
        WHERE tier IN ('professional', 'enterprise') AND api_key IS NOT NULL
      `);
      
      // Check API middleware functionality (simulate)
      const apiUserCount = parseInt(apiUsers.rows[0].count);
      
      // Check rate limiting configuration
      const professionalLimit = process.env.API_RATE_LIMIT_PROFESSIONAL;
      const enterpriseLimit = process.env.API_RATE_LIMIT_ENTERPRISE;
      
      const issues = [];
      if (!professionalLimit) issues.push('Professional rate limit not configured');
      if (!enterpriseLimit) issues.push('Enterprise rate limit not configured');
      
      return {
        status: issues.length === 0 ? 'healthy' : 'warning',
        message: issues.length === 0 ? 'API system healthy' : `Configuration issues: ${issues.join(', ')}`,
        apiUsersCount: apiUserCount,
        rateLimitsConfigured: professionalLimit && enterpriseLimit,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `API system check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check billing system health
   */
  async checkBillingSystem() {
    try {
      // Check Stripe configuration
      const stripeConfigured = !!(
        process.env.STRIPE_PUBLISHABLE_KEY && 
        process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Check for users with Stripe customer IDs
      const stripeUsers = await query(`
        SELECT COUNT(*) FROM users WHERE stripe_customer_id IS NOT NULL
      `);
      
      const stripeUserCount = parseInt(stripeUsers.rows[0].count);
      
      // Check subscription status distribution
      const subscriptions = await query(`
        SELECT subscription_status, COUNT(*) as count 
        FROM users 
        GROUP BY subscription_status
      `);

      return {
        status: stripeConfigured ? 'healthy' : 'warning',
        message: stripeConfigured ? 'Billing system configured' : 'Stripe not fully configured',
        stripeConfigured: stripeConfigured,
        stripeCustomers: stripeUserCount,
        subscriptionDistribution: subscriptions.rows,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Billing system check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check usage tracking system
   */
  async checkUsageTracking() {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      
      // Check current month usage records
      const currentUsage = await query(`
        SELECT COUNT(*) FROM usage_tracking WHERE month_year = $1
      `, [currentMonth]);
      
      // Check for any usage data
      const totalUsage = await query('SELECT COUNT(*) FROM usage_tracking');
      
      // Check for users without usage tracking
      const usersWithoutTracking = await query(`
        SELECT COUNT(*) FROM users u
        LEFT JOIN usage_tracking ut ON u.id = ut.user_id AND ut.month_year = $1
        WHERE ut.user_id IS NULL
      `, [currentMonth]);
      
      const currentUsageCount = parseInt(currentUsage.rows[0].count);
      const totalUsageCount = parseInt(totalUsage.rows[0].count);
      const missingTrackingCount = parseInt(usersWithoutTracking.rows[0].count);
      
      const issues = [];
      if (missingTrackingCount > 0) {
        issues.push(`${missingTrackingCount} users missing current month tracking`);
      }

      return {
        status: issues.length === 0 ? 'healthy' : 'warning',
        message: issues.length === 0 ? 'Usage tracking healthy' : `Issues: ${issues.join(', ')}`,
        currentMonthRecords: currentUsageCount,
        totalUsageRecords: totalUsageCount,
        usersMissingTracking: missingTrackingCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Usage tracking check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        users: {},
        usage: {},
        api: {},
        billing: {}
      };

      // User metrics
      const userStats = await query(`
        SELECT 
          tier,
          COUNT(*) as count,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_last_30_days
        FROM users 
        GROUP BY tier
      `);
      
      metrics.users.byTier = userStats.rows;
      
      // Usage metrics
      const currentMonth = new Date().toISOString().substring(0, 7);
      const usageStats = await query(`
        SELECT 
          SUM(audits_used) as total_audits,
          SUM(internal_pages_scanned) as total_pages,
          SUM(external_links_checked) as total_links,
          AVG(audits_used) as avg_audits_per_user
        FROM usage_tracking 
        WHERE month_year = $1
      `, [currentMonth]);
      
      metrics.usage.currentMonth = usageStats.rows[0];
      
      // API metrics
      const apiStats = await query(`
        SELECT 
          COUNT(CASE WHEN tier = 'professional' THEN 1 END) as professional_api_users,
          COUNT(CASE WHEN tier = 'enterprise' THEN 1 END) as enterprise_api_users,
          COUNT(CASE WHEN api_key IS NOT NULL THEN 1 END) as total_api_keys
        FROM users
      `);
      
      metrics.api = apiStats.rows[0];
      
      // Billing metrics
      const billingStats = await query(`
        SELECT 
          subscription_status,
          COUNT(*) as count
        FROM users 
        WHERE subscription_status IS NOT NULL
        GROUP BY subscription_status
      `);
      
      metrics.billing.subscriptions = billingStats.rows;

      return metrics;
    } catch (error) {
      logger.error('Failed to collect system metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Create health check endpoint handler
   */
  createHealthEndpoint() {
    return async (req, res) => {
      try {
        const health = await this.runAllChecks();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json(health);
      } catch (error) {
        logger.error('Health check endpoint error', { error: error.message });
        res.status(503).json({
          status: 'error',
          message: 'Health check failed',
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  /**
   * Create metrics endpoint handler
   */
  createMetricsEndpoint() {
    return async (req, res) => {
      try {
        const metrics = await this.getSystemMetrics();
        res.json(metrics);
      } catch (error) {
        logger.error('Metrics endpoint error', { error: error.message });
        res.status(500).json({
          error: 'Failed to collect metrics',
          timestamp: new Date().toISOString()
        });
      }
    };
  }
}

// Create singleton instance
export const healthMonitor = new HealthMonitor();

// Export health check functions for use in routes
export const healthCheckHandler = healthMonitor.createHealthEndpoint();
export const metricsHandler = healthMonitor.createMetricsEndpoint();
