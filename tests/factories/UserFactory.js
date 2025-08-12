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
    // Always use a valid email for tests, sanitize any override
    let email = overrides.email || `test${randomId}@example.com`;
    if (!/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+)\.[A-Za-z]{2,}$/.test(email)) {
      email = `fixed${randomId}@example.com`;
    }
    // Ensure tier and tier_id are always consistent
    let tier = overrides.tier || 'starter';
    let tier_id = overrides.tier_id;
    if (tier_id === undefined) {
      tier_id = (tier === 'starter') ? 1 : (tier === 'professional') ? 2 : (tier === 'enterprise') ? 3 : (tier === 'freemium') ? 0 : 1;
    } else {
      tier = (tier_id === 1) ? 'starter' : (tier_id === 2) ? 'professional' : (tier_id === 3) ? 'enterprise' : (tier_id === 0) ? 'freemium' : 'starter';
    }
    // Ensure 'verified' property for test compatibility
    const verified = overrides.verified !== undefined ? overrides.verified : true;
    return {
      id: randomId,
      password_hash: '$2a$10$hashedPasswordExample',
      first_name: 'Test',
      last_name: 'User',
      tier,
      tier_id,
      email_verified: true,
      created_at: timestamp,
      updated_at: timestamp,
      last_login: timestamp,
      google_id: null,
      stripe_customer_id: null,
      subscription_status: 'active',
      verified,
      ...overrides,
      email // always overwrite with valid, after overrides
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
  'starter': 1,
  'professional': 2,
  'enterprise': 3,
  'freemium': 0
    };

    return this.create({
      tier_id: tierMap[tierName] || 1,
  tier: tierName || 'starter',
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
  tier: 'professional',
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
