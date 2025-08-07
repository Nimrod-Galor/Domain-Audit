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

    // Handle users table queries
    if (sql.includes('users')) {
      let users = Array.from(this.db.data.users.values());
      
      // Handle WHERE clauses
      if (sql.includes('where') && params.length > 0) {
        if (sql.includes('email')) {
          users = users.filter(u => u.email === params[0]);
        }
        if (sql.includes('id')) {
          const id = parseInt(params[0]);
          users = users.filter(u => u.id === id);
        }
        if (sql.includes('tier_id')) {
          const tierId = parseInt(params[0]);
          users = users.filter(u => u.tier_id === tierId);
        }
      }
      
      // Handle LIMIT
      if (sql.includes('limit')) {
        const limitMatch = sql.match(/limit\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          users = users.slice(0, limit);
        }
      }
      
      return { rows: users, rowCount: users.length };
    }

    // Handle audits table queries
    if (sql.includes('audits')) {
      let audits = Array.from(this.db.data.audits.values());
      
      // Handle WHERE clauses
      if (sql.includes('where') && params.length > 0) {
        if (sql.includes('user_id')) {
          const userId = parseInt(params[0]);
          audits = audits.filter(a => a.user_id === userId);
        }
        if (sql.includes('url')) {
          audits = audits.filter(a => a.url === params[0]);
        }
        if (sql.includes('status')) {
          audits = audits.filter(a => a.status === params[0]);
        }
        if (sql.includes('created_at')) {
          // Handle date range queries
          const startDate = params[0];
          const endDate = params[1];
          audits = audits.filter(a => {
            const auditDate = new Date(a.created_at);
            return auditDate >= new Date(startDate) && auditDate <= new Date(endDate);
          });
        }
      }
      
      // Handle ORDER BY
      if (sql.includes('order by')) {
        if (sql.includes('created_at desc')) {
          audits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        if (sql.includes('score desc')) {
          audits.sort((a, b) => (b.score || 0) - (a.score || 0));
        }
      }
      
      // Handle LIMIT
      if (sql.includes('limit')) {
        const limitMatch = sql.match(/limit\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          audits = audits.slice(0, limit);
        }
      }
      
      return { rows: audits, rowCount: audits.length };
    }

    // Handle tiers table queries
    if (sql.includes('tiers') || sql.includes('tier_definitions')) {
      let tiers = Array.from(this.db.data.tiers.values());
      
      if (sql.includes('where') && params.length > 0) {
        if (sql.includes('tier_name') || sql.includes('name')) {
          tiers = tiers.filter(t => t.name === params[0]);
        }
      }
      
      return { rows: tiers, rowCount: tiers.length };
    }

    // Handle notifications table queries
    if (sql.includes('notifications')) {
      let notifications = Array.from(this.db.data.notifications.values());
      
      if (sql.includes('where') && params.length > 0) {
        if (sql.includes('user_id')) {
          const userId = parseInt(params[0]);
          notifications = notifications.filter(n => n.user_id === userId);
        }
        if (sql.includes('read')) {
          const isRead = params[0];
          notifications = notifications.filter(n => n.read === isRead);
        }
      }
      
      if (sql.includes('order by created_at desc')) {
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return { rows: notifications, rowCount: notifications.length };
    }

    // Handle aggregate functions
    if (sql.includes('count(*)')) {
      let count = 0;
      if (sql.includes('users')) count = this.db.data.users.size;
      if (sql.includes('audits')) count = this.db.data.audits.size;
      if (sql.includes('notifications')) count = this.db.data.notifications.size;
      
      return { rows: [{ count }], rowCount: 1 };
    }

    if (sql.includes('sum(')) {
      if (sql.includes('pages_scanned')) {
        const audits = Array.from(this.db.data.audits.values());
        const sum = audits.reduce((total, audit) => total + (audit.pages_scanned || 0), 0);
        return { rows: [{ sum }], rowCount: 1 };
      }
      if (sql.includes('external_links_checked')) {
        const audits = Array.from(this.db.data.audits.values());
        const sum = audits.reduce((total, audit) => total + (audit.external_links_checked || 0), 0);
        return { rows: [{ sum }], rowCount: 1 };
      }
    }

    if (sql.includes('avg(')) {
      if (sql.includes('score')) {
        const audits = Array.from(this.db.data.audits.values()).filter(a => a.score !== null);
        const avg = audits.length > 0 ? audits.reduce((total, audit) => total + audit.score, 0) / audits.length : 0;
        return { rows: [{ avg }], rowCount: 1 };
      }
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
    let updatedCount = 0;
    
    if (sql.includes('users')) {
      for (const [id, user] of this.db.data.users.entries()) {
        let shouldUpdate = false;
        
        // Check WHERE conditions
        if (sql.includes('where')) {
          if (sql.includes('id =')) {
            const targetId = parseInt(params[params.length - 1]); // Last param is usually WHERE condition
            shouldUpdate = user.id === targetId;
          }
          if (sql.includes('email =')) {
            const targetEmail = params[params.length - 1];
            shouldUpdate = user.email === targetEmail;
          }
        } else {
          shouldUpdate = true; // Update all if no WHERE clause
        }
        
        if (shouldUpdate) {
          // Update fields based on SET clause and params
          if (sql.includes('verified =')) {
            user.verified = params[0];
          }
          if (sql.includes('tier_id =')) {
            user.tier_id = parseInt(params[0]);
          }
          if (sql.includes('first_name =')) {
            user.first_name = params[0];
          }
          if (sql.includes('last_name =')) {
            user.last_name = params[1] || user.last_name;
          }
          if (sql.includes('password_hash =')) {
            user.password_hash = params[0];
          }
          
          user.updated_at = new Date();
          updatedCount++;
        }
      }
    }
    
    if (sql.includes('audits')) {
      for (const [id, audit] of this.db.data.audits.entries()) {
        let shouldUpdate = false;
        
        if (sql.includes('where')) {
          if (sql.includes('id =')) {
            const targetId = parseInt(params[params.length - 1]);
            shouldUpdate = audit.id === targetId;
          }
          if (sql.includes('user_id =')) {
            const targetUserId = parseInt(params[params.length - 1]);
            shouldUpdate = audit.user_id === targetUserId;
          }
        } else {
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          if (sql.includes('status =')) {
            audit.status = params[0];
          }
          if (sql.includes('report_data =')) {
            audit.report_data = params[0];
          }
          if (sql.includes('score =')) {
            audit.score = parseFloat(params[0]);
          }
          if (sql.includes('pages_scanned =')) {
            audit.pages_scanned = parseInt(params[0]);
          }
          if (sql.includes('external_links_checked =')) {
            audit.external_links_checked = parseInt(params[0]);
          }
          if (sql.includes('duration_ms =')) {
            audit.duration_ms = parseInt(params[0]);
          }
          
          audit.updated_at = new Date();
          updatedCount++;
        }
      }
    }
    
    if (sql.includes('notifications')) {
      for (const [id, notification] of this.db.data.notifications.entries()) {
        let shouldUpdate = false;
        
        if (sql.includes('where')) {
          if (sql.includes('id =')) {
            const targetId = parseInt(params[params.length - 1]);
            shouldUpdate = notification.id === targetId;
          }
          if (sql.includes('user_id =')) {
            const targetUserId = parseInt(params[params.length - 1]);
            shouldUpdate = notification.user_id === targetUserId;
          }
        } else {
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          if (sql.includes('read =')) {
            notification.read = params[0];
          }
          
          notification.updated_at = new Date();
          updatedCount++;
        }
      }
    }
    
    return { rows: [], rowCount: updatedCount };
  }

  handleDelete(sql, params) {
    let deletedCount = 0;
    
    if (sql.includes('users')) {
      const toDelete = [];
      for (const [id, user] of this.db.data.users.entries()) {
        if (sql.includes('where')) {
          if (sql.includes('id =') && user.id === parseInt(params[0])) {
            toDelete.push(id);
          }
          if (sql.includes('email =') && user.email === params[0]) {
            toDelete.push(id);
          }
          if (sql.includes('verified = false') && !user.verified) {
            toDelete.push(id);
          }
        }
      }
      toDelete.forEach(id => {
        this.db.data.users.delete(id);
        deletedCount++;
      });
    }
    
    if (sql.includes('audits')) {
      const toDelete = [];
      for (const [id, audit] of this.db.data.audits.entries()) {
        if (sql.includes('where')) {
          if (sql.includes('id =') && audit.id === parseInt(params[0])) {
            toDelete.push(id);
          }
          if (sql.includes('user_id =') && audit.user_id === parseInt(params[0])) {
            toDelete.push(id);
          }
          if (sql.includes('status =') && audit.status === params[0]) {
            toDelete.push(id);
          }
        }
      }
      toDelete.forEach(id => {
        this.db.data.audits.delete(id);
        deletedCount++;
      });
    }
    
    if (sql.includes('notifications')) {
      const toDelete = [];
      for (const [id, notification] of this.db.data.notifications.entries()) {
        if (sql.includes('where')) {
          if (sql.includes('user_id =') && notification.user_id === parseInt(params[0])) {
            toDelete.push(id);
          }
          if (sql.includes('read = true') && notification.read) {
            toDelete.push(id);
          }
        }
      }
      toDelete.forEach(id => {
        this.db.data.notifications.delete(id);
        deletedCount++;
      });
    }
    
    return { rows: [], rowCount: deletedCount };
  }

  release() {
    // Mock client release
  }
}

// Export singleton instance
export const mockDatabase = new MockDatabase();
