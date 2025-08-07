/**
 * Mock Database for Testing
 * Provides an in-memory database simulation when PostgreSQL is not available
 */

export class MockDatabase {
  constructor() {
    this.data = {
      users: new Map(),
      audits: new Map(),
      tiers: new Map(),
      notifications: new Map(),
      sessions: new Map()
    };
    
    // Initialize with default tiers
    this.data.tiers.set(1, {
      id: 1,
      name: 'Freemium',
      audits_per_month: 3,
      max_pages_per_audit: 50,
      max_external_links: 20,
      can_access_full_reports: false,
      price_monthly: 0
    });
    
    this.data.tiers.set(2, {
      id: 2,
      name: 'Professional',
      audits_per_month: 100,
      max_pages_per_audit: 200,
      max_external_links: -1,
      can_access_full_reports: true,
      price_monthly: 2999
    });
    
    this.data.tiers.set(3, {
      id: 3,
      name: 'Enterprise',
      audits_per_month: -1,
      max_pages_per_audit: -1,
      max_external_links: -1,
      can_access_full_reports: true,
      price_monthly: 9999
    });
    
    this.nextId = 1000;
  }

  async connect() {
    return new MockClient(this);
  }

  async end() {
    // Mock cleanup
    console.log('📋 Mock database disconnected');
  }

  getNextId() {
    return this.nextId++;
  }

  clear() {
    this.data.users.clear();
    this.data.audits.clear();
    this.data.notifications.clear();
    this.data.sessions.clear();
    // Keep tiers
    console.log('🧹 Mock database cleared');
  }
}

export class MockClient {
  constructor(database) {
    this.db = database;
    this.inTransaction = false;
  }

  async query(text, params = []) {
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, 1));
    
    // Parse common SQL operations
    const sql = text.toLowerCase().trim();
    
    if (sql.startsWith('begin')) {
      this.inTransaction = true;
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.startsWith('commit')) {
      this.inTransaction = false;
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.startsWith('rollback')) {
      this.inTransaction = false;
      return { rows: [], rowCount: 0 };
    }

    // Handle SELECT queries
    if (sql.includes('select')) {
      return this.handleSelect(sql, params);
    }

    // Handle INSERT queries
    if (sql.includes('insert')) {
      return this.handleInsert(sql, params);
    }

    // Handle UPDATE queries
    if (sql.includes('update')) {
      return this.handleUpdate(sql, params);
    }

    // Handle DELETE queries
    if (sql.includes('delete')) {
      return this.handleDelete(sql, params);
    }

    // Default response
    return { rows: [], rowCount: 0 };
  }

  handleSelect(sql, params) {
    // Handle specific common queries
    if (sql.includes('current_time') || sql.includes('version')) {
      return {
        rows: [{
          current_time: new Date(),
          version: 'PostgreSQL 14.0 (Mock Database)'
        }],
        rowCount: 1
      };
    }

    if (sql.includes('users')) {
      const users = Array.from(this.db.data.users.values());
      return { rows: users, rowCount: users.length };
    }

    if (sql.includes('audits')) {
      const audits = Array.from(this.db.data.audits.values());
      return { rows: audits, rowCount: audits.length };
    }

    if (sql.includes('tiers')) {
      const tiers = Array.from(this.db.data.tiers.values());
      return { rows: tiers, rowCount: tiers.length };
    }

    if (sql.includes('notifications')) {
      const notifications = Array.from(this.db.data.notifications.values());
      return { rows: notifications, rowCount: notifications.length };
    }

    // Default empty result
    return { rows: [], rowCount: 0 };
  }

  handleInsert(sql, params) {
    const id = this.db.getNextId();
    
    if (sql.includes('users')) {
      const user = {
        id,
        email: params[0] || 'test@example.com',
        password_hash: params[1] || 'hashed',
        first_name: params[2] || 'Test',
        last_name: params[3] || 'User',
        tier_id: params[4] || 1,
        verified: params[5] !== undefined ? params[5] : true,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.db.data.users.set(id, user);
      return { rows: [user], rowCount: 1 };
    }

    if (sql.includes('audits')) {
      const audit = {
        id,
        user_id: params[0] || null,
        url: params[1] || 'https://example.com',
        status: params[2] || 'completed',
        report_data: params[3] || null,
        pages_scanned: params[4] || 0,
        external_links_checked: params[5] || 0,
        score: params[6] || null,
        duration_ms: params[7] || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.db.data.audits.set(id, audit);
      return { rows: [audit], rowCount: 1 };
    }

    if (sql.includes('notifications')) {
      const notification = {
        id,
        user_id: params[0] || 1,
        type: params[1] || 'info',
        title: params[2] || 'Test Notification',
        message: params[3] || 'Test message',
        read: params[4] !== undefined ? params[4] : false,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.db.data.notifications.set(id, notification);
      return { rows: [notification], rowCount: 1 };
    }

    // Default insert response
    return { rows: [{ id }], rowCount: 1 };
  }

  handleUpdate(sql, params) {
    // Mock update operation
    return { rows: [], rowCount: 1 };
  }

  handleDelete(sql, params) {
    // Mock delete operation
    return { rows: [], rowCount: 1 };
  }

  release() {
    // Mock client release
  }
}

// Export singleton instance
export const mockDatabase = new MockDatabase();
