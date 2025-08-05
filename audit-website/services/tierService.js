/**
 * Tier Service
 * Handles all tier management, user limits, and usage tracking
 */

import { query } from '../models/database.js';

export class TierService {
  
  /**
   * Get user's current tier and limits
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User tier limits and configuration
   */
  async getUserTierLimits(userId) {
    try {
      if (!userId) {
        return this.getDefaultLimits('freemium');
      }

      const result = await query(`
        SELECT 
          u.tier,
          u.subscription_status,
          u.stripe_customer_id,
          u.api_key,
          td.display_name,
          td.price_monthly,
          td.price_annual,
          ul.audits_per_month,
          ul.max_internal_pages,
          ul.max_external_links,
          ul.max_domains,
          ul.api_access,
          ul.white_label,
          ul.scheduled_audits,
          ul.team_members,
          ul.priority_support,
          ul.data_retention_days
        FROM users u
        LEFT JOIN tier_definitions td ON u.tier = td.tier_name
        LEFT JOIN user_limits ul ON u.id = ul.user_id
        WHERE u.id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        console.warn(`⚠️ User ${userId} not found, using freemium defaults`);
        return this.getDefaultLimits('freemium');
      }

      const userLimits = result.rows[0];
      
      // If user limits are missing, create them
      if (!userLimits.audits_per_month && userLimits.audits_per_month !== 0) {
        console.log(`📝 Creating missing user limits for user ${userId} with tier ${userLimits.tier}`);
        await this.updateUserLimits(userId, userLimits.tier || 'starter');
        return this.getUserTierLimits(userId); // Recursive call to get the created limits
      }

      return {
        userId,
        tier: userLimits.tier,
        subscription_status: userLimits.subscription_status,
        stripe_customer_id: userLimits.stripe_customer_id,
        api_key: userLimits.api_key,
        display_name: userLimits.display_name,
        price_monthly: parseFloat(userLimits.price_monthly) || 0,
        price_annual: parseFloat(userLimits.price_annual) || 0,
        audits_per_month: parseInt(userLimits.audits_per_month),
        max_internal_pages: parseInt(userLimits.max_internal_pages),
        max_external_links: parseInt(userLimits.max_external_links),
        max_domains: parseInt(userLimits.max_domains),
        api_access: userLimits.api_access,
        white_label: userLimits.white_label,
        scheduled_audits: userLimits.scheduled_audits,
        team_members: parseInt(userLimits.team_members),
        priority_support: userLimits.priority_support,
        data_retention_days: parseInt(userLimits.data_retention_days)
      };
    } catch (error) {
      console.error('❌ Error getting user tier limits:', error.message);
      return this.getDefaultLimits('freemium');
    }
  }

  /**
   * Get default limits for a tier (used for anonymous users or fallback)
   * @param {string} tier - Tier name
   * @returns {Object} Default tier limits
   */
  getDefaultLimits(tier = 'freemium') {
    const defaults = {
      freemium: {
        tier: 'freemium',
        display_name: 'Freemium',
        price_monthly: 0,
        price_annual: 0,
        audits_per_month: 1,
        max_internal_pages: 25,
        max_external_links: 10,
        max_domains: 1,
        api_access: false,
        white_label: false,
        scheduled_audits: false,
        team_members: 1,
        priority_support: false,
        data_retention_days: 7
      },
      starter: {
        tier: 'starter',
        display_name: 'Starter',
        price_monthly: 0,
        price_annual: 0,
        audits_per_month: 3,
        max_internal_pages: 100,
        max_external_links: 50,
        max_domains: 1,
        api_access: false,
        white_label: false,
        scheduled_audits: false,
        team_members: 1,
        priority_support: false,
        data_retention_days: 30
      },
      professional: {
        tier: 'professional',
        display_name: 'Professional',
        price_monthly: 39,
        price_annual: 29,
        audits_per_month: -1, // unlimited
        max_internal_pages: 1000,
        max_external_links: 200,
        max_domains: 1,
        api_access: true,
        white_label: true,
        scheduled_audits: true,
        team_members: 1,
        priority_support: true,
        data_retention_days: 365
      },
      enterprise: {
        tier: 'enterprise',
        display_name: 'Enterprise',
        price_monthly: 99,
        price_annual: 79,
        audits_per_month: -1, // unlimited
        max_internal_pages: -1, // unlimited
        max_external_links: -1, // unlimited
        max_domains: -1, // unlimited
        api_access: true,
        white_label: true,
        scheduled_audits: true,
        team_members: 10,
        priority_support: true,
        data_retention_days: 730
      }
    };

    return defaults[tier] || defaults.freemium;
  }

  /**
   * Check if user can perform an audit
   * @param {number|null} userId - User ID (null for anonymous)
   * @param {number} requestedPages - Number of pages to audit
   * @param {number} requestedExternalLinks - Number of external links to check
   * @returns {Promise<Object>} Audit permission result
   */
  async canPerformAudit(userId, requestedPages = 25, requestedExternalLinks = 10) {
    try {
      const limits = await this.getUserTierLimits(userId);
      
      if (!userId) {
        // Anonymous users get freemium limits
        if (requestedPages > limits.max_internal_pages) {
          return {
            allowed: false,
            reason: `Page limit exceeded. Maximum ${limits.max_internal_pages} pages for anonymous users. Sign up for more!`,
            upgradeRequired: true,
            currentTier: 'freemium',
            suggestedTier: 'starter'
          };
        }

        if (requestedExternalLinks > limits.max_external_links) {
          return {
            allowed: false,
            reason: `External link limit exceeded. Maximum ${limits.max_external_links} external links for anonymous users.`,
            upgradeRequired: true,
            currentTier: 'freemium',
            suggestedTier: 'starter'
          };
        }

        return { allowed: true, tier: 'freemium' };
      }

      const usage = await this.getCurrentMonthUsage(userId);

      // Check monthly audit limit
      if (limits.audits_per_month !== -1 && usage.audits_used >= limits.audits_per_month) {
        return {
          allowed: false,
          reason: `Monthly audit limit exceeded. You've used ${usage.audits_used}/${limits.audits_per_month} audits this month.`,
          upgradeRequired: true,
          currentTier: limits.tier,
          suggestedTier: this.getSuggestedUpgradeTier(limits.tier)
        };
      }

      // Check page limits
      if (limits.max_internal_pages !== -1 && requestedPages > limits.max_internal_pages) {
        return {
          allowed: false,
          reason: `Page limit exceeded. Maximum ${limits.max_internal_pages} pages for ${limits.display_name} tier.`,
          upgradeRequired: true,
          currentTier: limits.tier,
          suggestedTier: this.getSuggestedUpgradeTier(limits.tier)
        };
      }

      // Check external link limits
      if (limits.max_external_links !== -1 && requestedExternalLinks > limits.max_external_links) {
        return {
          allowed: false,
          reason: `External link limit exceeded. Maximum ${limits.max_external_links} external links for ${limits.display_name} tier.`,
          upgradeRequired: true,
          currentTier: limits.tier,
          suggestedTier: this.getSuggestedUpgradeTier(limits.tier)
        };
      }

      return { 
        allowed: true, 
        tier: limits.tier,
        remaining_audits: limits.audits_per_month === -1 ? -1 : limits.audits_per_month - usage.audits_used
      };
    } catch (error) {
      console.error('❌ Error checking audit permissions:', error.message);
      return {
        allowed: false,
        reason: 'Error checking permissions. Please try again.',
        upgradeRequired: false
      };
    }
  }

  /**
   * Get suggested upgrade tier
   * @param {string} currentTier - Current tier name
   * @returns {string} Suggested tier for upgrade
   */
  getSuggestedUpgradeTier(currentTier) {
    const upgradePath = {
      'freemium': 'starter',
      'starter': 'professional',
      'professional': 'enterprise',
      'enterprise': 'enterprise' // Already at top tier
    };
    return upgradePath[currentTier] || 'professional';
  }

  /**
   * Record audit usage
   * @param {number} userId - User ID
   * @param {number} pagesScanned - Number of pages scanned
   * @param {number} externalLinksChecked - Number of external links checked
   * @returns {Promise<boolean>} Success status
   */
  async recordAuditUsage(userId, pagesScanned = 0, externalLinksChecked = 0) {
    if (!userId) {
      return true; // Anonymous users don't track usage
    }

    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format

      await query(`
        INSERT INTO usage_tracking (
          user_id, month_year, audits_used, internal_pages_scanned, external_links_checked
        )
        VALUES ($1, $2, 1, $3, $4)
        ON CONFLICT (user_id, month_year) 
        DO UPDATE SET
          audits_used = usage_tracking.audits_used + 1,
          internal_pages_scanned = usage_tracking.internal_pages_scanned + EXCLUDED.internal_pages_scanned,
          external_links_checked = usage_tracking.external_links_checked + EXCLUDED.external_links_checked,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, currentMonth, pagesScanned, externalLinksChecked]);

      console.log(`📊 Usage recorded for user ${userId}: +1 audit, +${pagesScanned} pages, +${externalLinksChecked} links`);
      return true;
    } catch (error) {
      console.error('❌ Error recording audit usage:', error.message);
      return false;
    }
  }

  /**
   * Record API call usage
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async recordApiUsage(userId) {
    if (!userId) {
      return false;
    }

    try {
      const currentMonth = new Date().toISOString().substring(0, 7);

      await query(`
        INSERT INTO usage_tracking (user_id, month_year, api_calls_used)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET
          api_calls_used = usage_tracking.api_calls_used + 1,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, currentMonth]);

      return true;
    } catch (error) {
      console.error('❌ Error recording API usage:', error.message);
      return false;
    }
  }

  /**
   * Get current month usage for user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Usage statistics
   */
  async getCurrentMonthUsage(userId) {
    if (!userId) {
      return {
        audits_used: 0,
        internal_pages_scanned: 0,
        external_links_checked: 0,
        api_calls_used: 0
      };
    }

    try {
      const currentMonth = new Date().toISOString().substring(0, 7);

      const result = await query(`
        SELECT 
          audits_used,
          internal_pages_scanned,
          external_links_checked,
          api_calls_used
        FROM usage_tracking 
        WHERE user_id = $1 AND month_year = $2
      `, [userId, currentMonth]);

      return result.rows[0] || {
        audits_used: 0,
        internal_pages_scanned: 0,
        external_links_checked: 0,
        api_calls_used: 0
      };
    } catch (error) {
      console.error('❌ Error getting current month usage:', error.message);
      return {
        audits_used: 0,
        internal_pages_scanned: 0,
        external_links_checked: 0,
        api_calls_used: 0
      };
    }
  }

  /**
   * Upgrade user tier
   * @param {number} userId - User ID
   * @param {string} newTier - New tier name
   * @param {Object} subscriptionData - Subscription data (optional)
   * @returns {Promise<boolean>} Success status
   */
  async upgradeUserTier(userId, newTier, subscriptionData = null) {
    try {
      // Update user tier
      await query(`
        UPDATE users SET 
          tier = $1,
          subscription_status = 'active',
          subscription_start_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newTier, userId]);

      // Update user limits based on new tier
      await this.updateUserLimits(userId, newTier);

      // Generate API key for professional/enterprise users
      if (['professional', 'enterprise'].includes(newTier)) {
        await this.generateApiKey(userId);
      }

      console.log(`✅ User ${userId} upgraded to ${newTier} tier`);
      return true;
    } catch (error) {
      console.error('❌ Error upgrading user tier:', error.message);
      return false;
    }
  }

  /**
   * Update user limits based on tier
   * @param {number} userId - User ID
   * @param {string} tier - Tier name
   * @returns {Promise<boolean>} Success status
   */
  async updateUserLimits(userId, tier) {
    try {
      // Get tier definition
      const tierResult = await query(`
        SELECT * FROM tier_definitions WHERE tier_name = $1 AND is_active = true
      `, [tier]);

      if (tierResult.rows.length === 0) {
        console.warn(`⚠️ Tier definition not found for ${tier}, using defaults`);
        const defaults = this.getDefaultLimits(tier);
        
        await query(`
          INSERT INTO user_limits (
            user_id, tier, audits_per_month, max_internal_pages, 
            max_external_links, max_domains, api_access, white_label,
            scheduled_audits, team_members, priority_support, data_retention_days
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (user_id) DO UPDATE SET
            tier = EXCLUDED.tier,
            audits_per_month = EXCLUDED.audits_per_month,
            max_internal_pages = EXCLUDED.max_internal_pages,
            max_external_links = EXCLUDED.max_external_links,
            max_domains = EXCLUDED.max_domains,
            api_access = EXCLUDED.api_access,
            white_label = EXCLUDED.white_label,
            scheduled_audits = EXCLUDED.scheduled_audits,
            team_members = EXCLUDED.team_members,
            priority_support = EXCLUDED.priority_support,
            data_retention_days = EXCLUDED.data_retention_days,
            updated_at = CURRENT_TIMESTAMP
        `, [
          userId, tier, defaults.audits_per_month, defaults.max_internal_pages,
          defaults.max_external_links, defaults.max_domains, defaults.api_access,
          defaults.white_label, defaults.scheduled_audits, defaults.team_members,
          defaults.priority_support, defaults.data_retention_days
        ]);
        
        return true;
      }

      const limits = tierResult.rows[0];

      await query(`
        INSERT INTO user_limits (
          user_id, tier, audits_per_month, max_internal_pages, 
          max_external_links, max_domains, api_access, white_label,
          scheduled_audits, team_members, priority_support, data_retention_days
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id) DO UPDATE SET
          tier = EXCLUDED.tier,
          audits_per_month = EXCLUDED.audits_per_month,
          max_internal_pages = EXCLUDED.max_internal_pages,
          max_external_links = EXCLUDED.max_external_links,
          max_domains = EXCLUDED.max_domains,
          api_access = EXCLUDED.api_access,
          white_label = EXCLUDED.white_label,
          scheduled_audits = EXCLUDED.scheduled_audits,
          team_members = EXCLUDED.team_members,
          priority_support = EXCLUDED.priority_support,
          data_retention_days = EXCLUDED.data_retention_days,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId, tier, limits.audits_per_month, limits.max_internal_pages,
        limits.max_external_links, limits.max_domains, limits.api_access,
        limits.white_label, limits.scheduled_audits, limits.team_members,
        limits.priority_support, limits.data_retention_days
      ]);

      console.log(`✅ User limits updated for user ${userId} with ${tier} tier`);
      return true;
    } catch (error) {
      console.error('❌ Error updating user limits:', error.message);
      return false;
    }
  }

  /**
   * Generate API key for user
   * @param {number} userId - User ID
   * @returns {Promise<string|null>} API key or null if failed
   */
  async generateApiKey(userId) {
    try {
      const crypto = await import('crypto');
      const apiKey = 'sk_' + crypto.randomBytes(24).toString('hex');

      await query(`
        UPDATE users SET api_key = $1 WHERE id = $2
      `, [apiKey, userId]);

      console.log(`🔑 API key generated for user ${userId}`);
      return apiKey;
    } catch (error) {
      console.error('❌ Error generating API key:', error.message);
      return null;
    }
  }

  /**
   * Get all available tiers
   * @returns {Promise<Array>} Array of tier definitions
   */
  async getAvailableTiers() {
    try {
      const result = await query(`
        SELECT * FROM tier_definitions 
        WHERE is_active = true 
        ORDER BY price_monthly ASC
      `);

      return result.rows.map(tier => ({
        tier_name: tier.tier_name,
        display_name: tier.display_name,
        price_monthly: parseFloat(tier.price_monthly),
        price_annual: parseFloat(tier.price_annual),
        audits_per_month: parseInt(tier.audits_per_month),
        max_internal_pages: parseInt(tier.max_internal_pages),
        max_external_links: parseInt(tier.max_external_links),
        max_domains: parseInt(tier.max_domains),
        api_access: tier.api_access,
        white_label: tier.white_label,
        scheduled_audits: tier.scheduled_audits,
        team_members: parseInt(tier.team_members),
        priority_support: tier.priority_support,
        data_retention_days: parseInt(tier.data_retention_days)
      }));
    } catch (error) {
      console.error('❌ Error getting available tiers:', error.message);
      return [];
    }
  }

  /**
   * Check if user has feature access
   * @param {number} userId - User ID
   * @param {string} feature - Feature name (api_access, white_label, scheduled_audits, priority_support)
   * @returns {Promise<boolean>} Feature access status
   */
  async hasFeatureAccess(userId, feature) {
    try {
      const limits = await this.getUserTierLimits(userId);
      return limits[feature] || false;
    } catch (error) {
      console.error(`❌ Error checking feature access for ${feature}:`, error.message);
      return false;
    }
  }

  /**
   * Generate API key for user
   * @param {number} userId - User ID
   * @returns {Promise<string>} Generated API key
   */
  async generateApiKey(userId) {
    try {
      // Check if user has API access
      const limits = await this.getUserTierLimits(userId);
      if (!limits.api_access) {
        throw new Error('User tier does not include API access');
      }

      // Generate secure API key
      const crypto = await import('crypto');
      const apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

      // Update user with new API key
      await query(`
        UPDATE users SET 
          api_key = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [apiKey, userId]);

      return apiKey;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  /**
   * Revoke user's API key
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async revokeApiKey(userId) {
    try {
      await query(`
        UPDATE users SET 
          api_key = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tierService = new TierService();
export default tierService;
