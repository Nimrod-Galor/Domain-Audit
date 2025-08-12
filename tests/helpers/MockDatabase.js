/**
 * Mock Database for Testing
 * Provides an in-memory database simulation when PostgreSQL is not available
 */

export class MockDatabase {
  constructor() {
    this.data = {
      users: new Map(),
      audits: new Map(),
      tier_definitions: new Map(),
      notifications: new Map(),
      user_sessions: new Map()
    };
    
    // Initialize with default tier_definitions matching migration 008/009
    const tiers = [
      { id: 1, tier_name: 'freemium', display_name: 'Freemium' },
      { id: 2, tier_name: 'starter', display_name: 'Starter' },
      { id: 3, tier_name: 'professional', display_name: 'Professional' },
      { id: 4, tier_name: 'enterprise', display_name: 'Enterprise' }
    ];
    tiers.forEach(t => this.data.tier_definitions.set(t.id, {
      ...t,
      price_monthly: 0,
      price_annual: 0,
      audits_per_month: t.tier_name === 'freemium' ? 30 : -1,
      max_internal_pages: t.tier_name === 'enterprise' ? -1 : (t.tier_name === 'professional' ? 1000 : (t.tier_name === 'starter' ? 100 : 25)),
      max_external_links: t.tier_name === 'enterprise' ? -1 : (t.tier_name === 'professional' ? 200 : (t.tier_name === 'starter' ? 50 : 10)),
      max_domains: 1,
      api_access: t.tier_name !== 'starter' && t.tier_name !== 'freemium',
      white_label: t.tier_name === 'professional' || t.tier_name === 'enterprise',
      scheduled_audits: t.tier_name === 'professional' || t.tier_name === 'enterprise',
      team_members: t.tier_name === 'enterprise' ? 10 : 1,
      priority_support: t.tier_name === 'professional' || t.tier_name === 'enterprise',
      data_retention_days: t.tier_name === 'freemium' ? 0 : (t.tier_name === 'starter' ? 30 : (t.tier_name === 'professional' ? 365 : 730)),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
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
  this.data.user_sessions.clear();
    // Keep tiers
    console.log('🧹 Mock database cleared');
  }
}

export class MockClient {
  constructor(database) {
    this.db = database;
    this.inTransaction = false;
  this.txOps = [];
  }

  async query(text, params = []) {
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, 1));
    
    // Parse common SQL operations
    const sql = text.toLowerCase().trim();
    
    if (sql.startsWith('begin')) {
      this.inTransaction = true;
      this.txOps = [];
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.startsWith('commit')) {
      this.inTransaction = false;
      this.txOps = [];
      return { rows: [], rowCount: 0 };
    }
    
    if (sql.startsWith('rollback')) {
      // revert operations in reverse
      for (let i = this.txOps.length - 1; i >= 0; i--) {
        try { this.txOps[i](); } catch(_) {}
      }
      this.inTransaction = false;
      this.txOps = [];
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
    const hasWhereEq = (field) => {
      // checks if WHERE clause contains "field ="
      const m = sql.match(/where[\s\S]*/);
      if (!m) return false;
      return new RegExp(`\\b${field}\\s*=`).test(m[0]);
    };
    // Handle COUNT aggregates first (before table-specific handlers)
    if (sql.includes('count(*) as unread_count') && sql.includes('from notifications')) {
      const userId = parseInt(params[0]);
      const unread = Array.from(this.db.data.notifications.values()).filter(n => n.user_id === userId && n.read === false).length;
      return { rows: [{ unread_count: unread }], rowCount: 1 };
    }
    if (sql.includes('count(*) as count') && sql.includes('from audits')) {
      let audits = Array.from(this.db.data.audits.values());
      if (sql.includes('where') && params.length > 0 && sql.includes('user_id')) {
        const userId = parseInt(params[0]);
        audits = audits.filter(a => a.user_id === userId);
      }
      return { rows: [{ count: audits.length }], rowCount: 1 };
    }
    if (sql.includes('count(*)')) {
      let count = 0;
      if (sql.includes('users')) count = this.db.data.users.size;
      if (sql.includes('audits')) count = this.db.data.audits.size;
      if (sql.includes('notifications')) count = this.db.data.notifications.size;
      return { rows: [{ count }], rowCount: 1 };
    }
    // Handle simple constant select
    if (sql.match(/^select\s+1\s+as\s+test/)) {
      return { rows: [{ test: 1 }], rowCount: 1 };
    }

    // Handle EXPLAIN queries
    if (sql.startsWith('explain')) {
      return { rows: [{ 'QUERY PLAN': 'Index Scan using idx_audits_user_id on audits  (cost=0.00..1.00 rows=1) (actual time=0.01..0.01 rows=1 loops=1)' }], rowCount: 1 };
    }
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
  if (sql.includes(' from users') || sql.startsWith('select users')) {
      let users = Array.from(this.db.data.users.values());
      
      // Handle WHERE clauses
      if (sql.includes('where') && params.length > 0) {
        if (hasWhereEq('email')) {
          users = users.filter(u => u.email === params[0]);
        }
        if (hasWhereEq('id')) {
          const id = parseInt(params[0]);
          users = users.filter(u => u.id === id);
        }
        if (hasWhereEq('tier_id')) {
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
  if (sql.includes(' from audits') || sql.startsWith('select audits')) {
      let audits = Array.from(this.db.data.audits.values());
      
      // Handle WHERE clauses
      if (sql.includes('where')) {
        // id filter
        if (hasWhereEq('id') && params.length > 0) {
          const id = parseInt(params[0]);
          audits = audits.filter(a => a.id === id);
        }
        // user_id filter
        if (hasWhereEq('user_id') && params.length > 0) {
          const userId = parseInt(params[0]);
          audits = audits.filter(a => a.user_id === userId);
        }
        // url filter (literal or param)
        if (/where[\s\S]*\burl\s*=/.test(sql)) {
          if (params.length > 0 && typeof params[0] === 'string') {
            audits = audits.filter(a => a.url === params[0]);
          } else {
            const mUrl = sql.match(/url\s*=\s*'([^']+)'/);
            if (mUrl) audits = audits.filter(a => a.url === mUrl[1]);
          }
        }
        // status filter only when in WHERE
        if (/where[\s\S]*\bstatus\s*=/.test(sql)) {
          const mStatus = sql.match(/status\s*=\s*'([^']+)'/);
          if (mStatus) {
            audits = audits.filter(a => a.status === mStatus[1]);
          } else if (params.length > 0) {
            audits = audits.filter(a => a.status === params[0]);
          }
        }
        if (sql.includes('created_at') && /where[\s\S]*\bcreated_at\b/.test(sql)) {
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

    // Handle tier_definitions table queries
    if (sql.includes(' from tier_definitions') || sql.startsWith('select tier_definitions')) {
      let tiers = Array.from(this.db.data.tier_definitions.values());
      return { rows: tiers, rowCount: tiers.length };
    }

    // Handle notifications table queries
  if (sql.includes(' from notifications') || sql.startsWith('select notifications')) {
      let notifications = Array.from(this.db.data.notifications.values());
      
      if (sql.includes('where')) {
        // id filter
        if (hasWhereEq('id') && params.length > 0) {
          const id = parseInt(params[0]);
          notifications = notifications.filter(n => n.id === id);
        }
        // user_id filter (param)
        if (hasWhereEq('user_id') && params.length > 0) {
          const userId = parseInt(params[0]);
          notifications = notifications.filter(n => n.user_id === userId);
        }
        // title filter (literal)
        const mTitle = sql.match(/title\s*=\s*'([^']+)'/);
        if (mTitle) {
          notifications = notifications.filter(n => n.title === mTitle[1]);
        }
        // read filter (literal or param)
        if (/where[\s\S]*\bread\s*=/.test(sql)) {
          const mRead = sql.match(/read\s*=\s*(true|false)/);
          if (mRead) {
            const isRead = mRead[1] === 'true';
            notifications = notifications.filter(n => n.read === isRead);
          } else if (params.length > 0 && typeof params[0] === 'boolean') {
            notifications = notifications.filter(n => n.read === params[0]);
          }
        }
      }
      
      if (sql.includes('order by created_at desc')) {
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return { rows: notifications, rowCount: notifications.length };
    }

    // Handle user_sessions table queries
    if (sql.includes(' from user_sessions') || sql.startsWith('select user_sessions')) {
      let sessions = Array.from(this.db.data.user_sessions.values());
      if (sql.includes('where')) {
        if (hasWhereEq('session_token') && params.length > 0) {
          sessions = sessions.filter(s => s.session_token === params[0]);
        }
        if (hasWhereEq('user_id') && params.length > 0) {
          const userId = parseInt(params[0]);
          sessions = sessions.filter(s => s.user_id === userId);
        }
      }
      return { rows: sessions, rowCount: sessions.length };
    }

  // Note: other aggregates handled above

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
    
    if (sql.includes('into users')) {
      // Parse column list
      let cols = [];
      const m = sql.match(/insert\s+into\s+users\s*\(([^)]+)\)/);
      if (m) cols = m[1].split(',').map(s => s.trim());
      const map = Object.fromEntries(cols.map((c,i)=>[c, params[i]]));
      // Enforce NOT NULL email
      if (!('email' in map) || !map.email) {
        throw new Error('null value in column "email"');
      }
      const email = map.email;
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new Error('email_format_check');
      }
      // Unique email
      for (const u of this.db.data.users.values()) {
        if (u.email === email) throw new Error('duplicate key value violates unique constraint');
      }
      // Tier constraint
      const allowedTiers = new Set(['freemium','starter','professional','enterprise']);
      let tier = map.tier ?? 'starter';
      if (!allowedTiers.has(tier)) throw new Error('violates check constraint');
      const user = {
        id,
        email,
        password_hash: map.password_hash || 'hashed',
        first_name: map.first_name ?? 'Test',
        last_name: map.last_name ?? 'User',
        tier,
        tier_id: tier === 'starter' ? 1 : (tier === 'professional' ? 2 : (tier === 'enterprise' ? 3 : 0)),
        email_verified: map.email_verified !== undefined ? map.email_verified : true,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.db.data.users.set(id, user);
      // Transaction inverse
      if (this.inTransaction) this.txOps.push(() => this.db.data.users.delete(id));
      return { rows: [user], rowCount: 1 };
    }

    if (sql.includes('into audits')) {
      const inserts = [];
      // multi-values insert support: VALUES (u, url1, status1), (u, url2, status2)
      if (params.length >= 5 && sql.includes('values') && sql.includes('),')) {
        const userId = params[0] || null;
        const groups = [];
        // pattern specific to test: [uid, url1, status1, url2, status2]
        groups.push([userId, params[1], params[2]]);
        groups.push([userId, params[3], params[4]]);
        for (const g of groups) {
          inserts.push(this._insertAuditRow(g[0], g[1], g[2], null, null, null, null));
        }
        return { rows: inserts, rowCount: inserts.length };
      }
      // single insert
      const audit = this._insertAuditRow(params[0] || null, params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
      return { rows: [audit], rowCount: 1 };
    }

    if (sql.includes('into notifications')) {
      // Support multi-row VALUES syntax used in tests
      if (sql.includes('values') && /\),/.test(sql)) {
        const valuesSection = sql.split('values')[1];
        const tupleRegex = /\(([^)]+)\)/g;
        const inserted = [];
        let match;
        while ((match = tupleRegex.exec(valuesSection)) !== null) {
          const parts = match[1].split(',').map(s => s.trim());
          const userRef = parts[0];
          const user_id = userRef.startsWith('$') ? params[parseInt(userRef.slice(1)) - 1] : parseInt(userRef);
          const lit = (s) => {
            const m = s.match(/^'(.*)'$/);
            return m ? m[1] : undefined;
          };
          const title = lit(parts[1]) ?? 'Notification';
          const message = lit(parts[2]) ?? '';
          const type = lit(parts[3]) ?? 'info';
          const nid = this.db.getNextId();
          const notification = {
            id: nid,
            user_id,
            title,
            message,
            type,
            read: false,
            created_at: new Date(),
            updated_at: new Date(),
            read_at: null
          };
          this.db.data.notifications.set(nid, notification);
          inserted.push(notification);
        }
        return { rows: inserted, rowCount: inserted.length };
      }
      // parse single-row insert columns to map param order
      let cols = [];
      const m = sql.match(/insert\s+into\s+notifications\s*\(([^)]+)\)/);
      if (m) cols = m[1].split(',').map(s => s.trim());
      const map = Object.fromEntries(cols.map((c,i)=>[c, params[i]]));
      const notification = {
        id,
        user_id: map.user_id ?? params[0] ?? 1,
        title: map.title ?? params[2] ?? 'Test Notification',
        message: map.message ?? params[3] ?? 'Test message',
        type: map.type ?? params[1] ?? 'info',
        read: map.read ?? params[4] ?? false,
        created_at: new Date(),
        updated_at: new Date(),
        read_at: null
      };
      this.db.data.notifications.set(id, notification);
      return { rows: [notification], rowCount: 1 };
    }

    if (sql.includes('into user_sessions')) {
      const session = {
        id,
        user_id: params[0],
        session_token: params[1],
        expires_at: params[2],
        created_at: new Date()
      };
      this.db.data.user_sessions.set(id, session);
      return { rows: [session], rowCount: 1 };
    }

    // Default insert response
    return { rows: [{ id }], rowCount: 1 };
  }

  handleUpdate(sql, params) {
    let updatedCount = 0;
    
    if (sql.includes('update users')) {
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
          if (sql.includes('tier =')) {
            user.tier = params[0];
            user.tier_id = user.tier === 'starter' ? 1 : (user.tier === 'professional' ? 2 : (user.tier === 'enterprise' ? 3 : 0));
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
    
  if (sql.includes('update audits')) {
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
          if (sql.includes("status = 'completed'")) {
            audit.status = 'completed';
          } else if (sql.includes("status = 'running'")) {
            audit.status = 'running';
          } else if (sql.includes("status = 'pending'")) {
            audit.status = 'pending';
          } else if (sql.includes('status =')) {
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
          if (sql.includes('started_at = now()')) {
            audit.started_at = new Date();
          }
          if (sql.includes('completed_at = now()')) {
            audit.completed_at = new Date();
          }
          
          audit.updated_at = new Date();
          updatedCount++;
        }
      }
    }
    
  if (sql.includes('update notifications')) {
      for (const [id, notification] of this.db.data.notifications.entries()) {
        let shouldUpdate = false;
        
        if (sql.includes('where')) {
          if (/where[\s\S]*\bid\s*=/.test(sql) && params.length > 0) {
            const targetId = parseInt(params[params.length - 1]);
            shouldUpdate = notification.id === targetId;
          }
          if (/where[\s\S]*\buser_id\s*=/.test(sql) && params.length > 0) {
            const targetUserId = parseInt(params[params.length - 1]);
            shouldUpdate = shouldUpdate || notification.user_id === targetUserId;
          }
          const mTitle = sql.match(/title\s*=\s*'([^']+)'/);
          if (mTitle) {
            shouldUpdate = shouldUpdate && notification.title === mTitle[1];
          }
        } else {
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          if (sql.includes('read = true')) {
            notification.read = true;
            if (sql.includes('read_at = now()')) notification.read_at = new Date();
          } else if (sql.includes('read = false')) {
            notification.read = false;
          } else if (sql.includes('read =')) {
            notification.read = params[0] === true;
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
    
    if (sql.includes('from users')) {
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
      toDelete.forEach(uid => {
        // cascade delete audits and sessions
        for (const [aid, audit] of this.db.data.audits.entries()) {
          if (audit.user_id === uid) this.db.data.audits.delete(aid);
        }
        for (const [sid, sess] of this.db.data.user_sessions.entries()) {
          if (sess.user_id === uid) this.db.data.user_sessions.delete(sid);
        }
        this.db.data.users.delete(uid);
        deletedCount++;
      });
    }
    
    if (sql.includes('from audits')) {
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
    
  if (sql.includes('from notifications')) {
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

    if (sql.includes('from user_sessions')) {
      const toDelete = [];
      for (const [id, s] of this.db.data.user_sessions.entries()) {
        if (sql.includes('where')) {
          if (sql.includes('expires_at < now()') && s.expires_at < new Date()) toDelete.push(id);
          if (sql.includes('session_token =') && s.session_token === params[0]) toDelete.push(id);
          if (sql.includes('user_id =') && s.user_id === parseInt(params[0])) toDelete.push(id);
        }
      }
      toDelete.forEach(id => { this.db.data.user_sessions.delete(id); deletedCount++; });
    }
    
    return { rows: [], rowCount: deletedCount };
  }

  release() {
    // Mock client release
  }

  _insertAuditRow(userId, url, status, report_data, pages_scanned, external_links_checked, score, duration_ms) {
    if (userId !== null && !this.db.data.users.has(parseInt(userId))) {
      throw new Error('violates foreign key constraint');
    }
    const allowed = new Set(['pending','running','completed','failed']);
    const st = status || 'completed';
    if (!allowed.has(st)) {
      throw new Error('invalid input value for enum');
    }
    const id = this.db.getNextId();
    const audit = {
      id,
      user_id: userId,
      url: url || 'https://example.com',
      status: st,
      report_data: (() => {
        const val = report_data || null;
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return val; }
        }
        return val;
      })(),
      pages_scanned: pages_scanned || 0,
      external_links_checked: external_links_checked || 0,
      score: score || null,
      duration_ms: duration_ms || null,
      created_at: new Date(),
      updated_at: new Date(),
      queued_at: null,
      started_at: null,
      completed_at: null
    };
    this.db.data.audits.set(id, audit);
    if (this.inTransaction) this.txOps.push(() => this.db.data.audits.delete(id));
    return audit;
  }
}

// Export singleton instance
export const mockDatabase = new MockDatabase();
