/**
 * User Data Factory
 * Creates test data for user-related tests in the web application
 */

export class UserFactory {
  /**
   * Create a basic user object
   */
  static create(overrides = {}) {
    const timestamp = new Date().toISOString();
    const randomId = Math.floor(Math.random() * 10000);
    
    return {
      id: randomId,
      email: `test${randomId}@example.com`,
      password: '$2a$10$hashedPasswordExample',
      verified: true,
      tier_id: 1,
      created_at: timestamp,
      updated_at: timestamp,
      last_login: timestamp,
      google_id: null,
      stripe_customer_id: null,
      subscription_id: null,
      subscription_status: null,
      ...overrides
    };
  }

  /**
   * Create multiple users
   */
  static createMany(count, overrides = {}) {
    return Array(count).fill().map((_, i) => 
      this.create({ 
        email: `test${Date.now()}-${i}@example.com`,
        ...overrides 
      })
    );
  }

  /**
   * Create user with specific tier
   */
  static createWithTier(tierName, overrides = {}) {
    const tierMap = {
      'freemium': 1,
      'professional': 2,
      'enterprise': 3
    };

    return this.create({
      tier_id: tierMap[tierName] || 1,
      ...overrides
    });
  }

  /**
   * Create authenticated user session data
   */
  static createSession(user = null, overrides = {}) {
    const userData = user || this.create();
    
    return {
      user: {
        id: userData.id,
        email: userData.email,
        verified: userData.verified,
        tier_id: userData.tier_id
      },
      ...overrides
    };
  }

  /**
   * Create Google OAuth user
   */
  static createGoogleUser(overrides = {}) {
    return this.create({
      google_id: 'google_' + Math.random().toString(36).substr(2, 15),
      verified: true,
      ...overrides
    });
  }

  /**
   * Create user with subscription
   */
  static createSubscribedUser(overrides = {}) {
    return this.create({
      tier_id: 2, // Professional tier
      stripe_customer_id: 'cus_test_' + Math.random().toString(36).substr(2, 10),
      subscription_id: 'sub_test_' + Math.random().toString(36).substr(2, 10),
      subscription_status: 'active',
      ...overrides
    });
  }
}

/**
 * Audit Record Factory
 * Creates test data for audit database records
 */
export class AuditRecordFactory {
  /**
   * Create a basic audit record
   */
  static create(overrides = {}) {
    const timestamp = new Date().toISOString();
    
    return {
      id: Math.floor(Math.random() * 10000),
      url: 'https://example.com',
      user_id: null,
      status: 'completed',
      report_type: 'simple',
      report_data: {
        summary: { score: 85, issues: 3 },
        pages: 5,
        links: 25
      },
      pages_scanned: 5,
      external_links_checked: 15,
      score: 85,
      duration_ms: 30000,
      created_at: timestamp,
      updated_at: timestamp,
      ...overrides
    };
  }

  /**
   * Create audit record for specific user
   */
  static createForUser(userId, overrides = {}) {
    return this.create({
      user_id: userId,
      ...overrides
    });
  }

  /**
   * Create failed audit record
   */
  static createFailed(overrides = {}) {
    return this.create({
      status: 'failed',
      report_data: null,
      error_message: 'Connection timeout',
      ...overrides
    });
  }

  /**
   * Create audit with specific performance metrics
   */
  static createWithMetrics(metrics, overrides = {}) {
    return this.create({
      pages_scanned: metrics.pages || 10,
      external_links_checked: metrics.links || 25,
      score: metrics.score || 80,
      duration_ms: metrics.duration || 25000,
      report_data: {
        summary: {
          score: metrics.score || 80,
          totalPages: metrics.pages || 10,
          totalLinks: metrics.links || 25
        }
      },
      ...overrides
    });
  }
}

/**
 * Tier System Factory
 * Creates test data for tier and usage tracking
 */
export class TierFactory {
  /**
   * Create tier definition
   */
  static createTier(name, overrides = {}) {
    const tiers = {
      freemium: {
        id: 1,
        name: 'Freemium',
        audits_per_month: 3,
        max_pages_per_audit: 50,
        max_external_links: 20,
        can_access_full_reports: false,
        price_monthly: 0
      },
      professional: {
        id: 2,
        name: 'Professional',
        audits_per_month: 100,
        max_pages_per_audit: 200,
        max_external_links: -1,
        can_access_full_reports: true,
        price_monthly: 2999
      },
      enterprise: {
        id: 3,
        name: 'Enterprise',
        audits_per_month: -1,
        max_pages_per_audit: -1,
        max_external_links: -1,
        can_access_full_reports: true,
        price_monthly: 9999
      }
    };

    return {
      ...tiers[name],
      ...overrides
    };
  }

  /**
   * Create usage record
   */
  static createUsage(userId, overrides = {}) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    return {
      id: Math.floor(Math.random() * 10000),
      user_id: userId,
      month: currentMonth,
      audits_used: 5,
      pages_scanned: 150,
      external_links_checked: 75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };
  }
}

export default { UserFactory, AuditRecordFactory, TierFactory };
