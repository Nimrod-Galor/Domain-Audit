import { jest } from '@jest/globals';
import pg from 'pg';
import dotenv from 'dotenv';
import { TestHelpers } from '../../helpers/TestHelpers.js';
import { testDatabase } from '../../helpers/TestDatabase.js';
import { UserFactory } from '../../factories/UserFactory.js';
import { AuditFactory } from '../../factories/AuditFactory.js';

// Load test environment
dotenv.config({ path: '.env.test' });

const { Pool } = pg;

describe('Database Integration Tests', () => {
  let testPool;
  let testClient;

  beforeAll(async () => {
    // Setup test database with proper configuration
    await TestHelpers.setupTestDatabase();
    
    testPool = testDatabase.getTestPool();
    
    // Log connection status
    const isNeon = process.env.TEST_DB_HOST?.includes('neon.tech');
    const isMock = testDatabase.useMockDatabase;
    
    if (isMock) {
      console.log('📋 Using mock database for tests');
    } else if (isNeon) {
      console.log('☁️ Using Neon PostgreSQL for tests');
    } else {
      console.log('🐘 Using local PostgreSQL for tests');
    }
  }, 30000); // Longer timeout for Neon connection

  beforeEach(async () => {
    testClient = await testPool.connect();
    await testClient.query('BEGIN');
    await TestHelpers.clearDatabase();
  });

  afterEach(async () => {
    await testClient.query('ROLLBACK');
    testClient.release();
  });

  afterAll(async () => {
    await TestHelpers.teardownTestDatabase();
    await testPool.end();
  });

  describe('User Management', () => {
    test('should create user with all required fields', async () => {
      const userData = UserFactory.create();
      
      const result = await testClient.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, tier, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name,
        userData.tier || 'starter',
        userData.verified || false
      ]);

      expect(result.rows).toHaveLength(1);
      const user = result.rows[0];
      expect(user.email).toBe(userData.email);
      expect(user.tier_id).toBe(userData.tier_id);
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });

    test('should enforce unique email constraint', async () => {
      const userData = UserFactory.create();
      
      // Create first user
      await testClient.query(`
        INSERT INTO users (email, password_hash, tier)
        VALUES ($1, $2, $3)
      `, [userData.email, userData.password_hash, userData.tier || 'starter']);

      // Attempt to create duplicate email
      await expect(
        testClient.query(`
          INSERT INTO users (email, password_hash, tier_id)
          VALUES ($1, $2, $3)
        `, [userData.email, 'different_hash', userData.tier_id])
      ).rejects.toThrow(/duplicate key value violates unique constraint/);
    });

    test('should cascade delete user audits when user is deleted', async () => {
      // Create user
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      const userId = userResult.rows[0].id;

      // Create audits for user
      await testClient.query(`
        INSERT INTO audits (user_id, url, status)
        VALUES ($1, $2, $3), ($1, $4, $5)
      `, [userId, 'https://example1.com', 'completed', 'https://example2.com', 'pending']);

      // Verify audits exist
      const auditsBeforeResult = await testClient.query(
        'SELECT COUNT(*) as count FROM audits WHERE user_id = $1',
        [userId]
      );
      expect(parseInt(auditsBeforeResult.rows[0].count)).toBe(2);

      // Delete user
      await testClient.query('DELETE FROM users WHERE id = $1', [userId]);

      // Verify audits are cascade deleted
      const auditsAfterResult = await testClient.query(
        'SELECT COUNT(*) as count FROM audits WHERE user_id = $1',
        [userId]
      );
      expect(parseInt(auditsAfterResult.rows[0].count)).toBe(0);
    });

    test('should update updated_at timestamp on user updates', async () => {
      // Create user
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id, updated_at
      `, ['test@example.com', 'hash', 1]);
      
      const userId = userResult.rows[0].id;
      const originalUpdatedAt = userResult.rows[0].updated_at;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update user
      await testClient.query(`
        UPDATE users SET first_name = $1 WHERE id = $2
      `, ['Updated Name', userId]);

      // Check updated_at was changed
      const updatedResult = await testClient.query(
        'SELECT updated_at FROM users WHERE id = $1',
        [userId]
      );
      
      const newUpdatedAt = updatedResult.rows[0].updated_at;
      expect(newUpdatedAt).not.toEqual(originalUpdatedAt);
      expect(new Date(newUpdatedAt)).toBeAfter(new Date(originalUpdatedAt));
    });
  });

  describe('Audit Management', () => {
    let testUserId;

    beforeEach(async () => {
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      testUserId = userResult.rows[0].id;
    });

    test('should create audit with proper default values', async () => {
      const auditData = AuditFactory.create({ user_id: testUserId });
      
      const result = await testClient.query(`
        INSERT INTO audits (user_id, url, status, type)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [testUserId, auditData.url, auditData.status, auditData.type]);

      const audit = result.rows[0];
      expect(audit.user_id).toBe(testUserId);
      expect(audit.url).toBe(auditData.url);
      expect(audit.status).toBe(auditData.status);
      expect(audit.created_at).toBeInstanceOf(Date);
      expect(audit.queued_at).toBeNull();
      expect(audit.started_at).toBeNull();
      expect(audit.completed_at).toBeNull();
    });

    test('should store complex JSON data in report_data field', async () => {
      const reportData = {
        score: 85,
        issues: [
          { type: 'warning', message: 'Missing alt text' },
          { type: 'error', message: 'Broken link' }
        ],
        performance: {
          loadTime: 2.5,
          coreWebVitals: {
            lcp: 2100,
            fid: 80,
            cls: 0.05
          }
        },
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '2.1.0'
        }
      };

      const result = await testClient.query(`
        INSERT INTO audits (user_id, url, status, report_data)
        VALUES ($1, $2, $3, $4)
        RETURNING report_data
      `, [testUserId, 'https://example.com', 'completed', JSON.stringify(reportData)]);

      const storedData = result.rows[0].report_data;
      expect(storedData).toEqual(reportData);
      expect(storedData.performance.coreWebVitals.lcp).toBe(2100);
      expect(storedData.issues).toHaveLength(2);
    });

    test('should enforce foreign key constraint on user_id', async () => {
      await expect(
        testClient.query(`
          INSERT INTO audits (user_id, url, status)
          VALUES ($1, $2, $3)
        `, [99999, 'https://example.com', 'pending'])
      ).rejects.toThrow(/violates foreign key constraint/);
    });

    test('should validate status enum values', async () => {
      await expect(
        testClient.query(`
          INSERT INTO audits (user_id, url, status)
          VALUES ($1, $2, $3)
        `, [testUserId, 'https://example.com', 'invalid_status'])
      ).rejects.toThrow(/invalid input value for enum/);
    });

    test('should handle audit status transitions correctly', async () => {
      // Create pending audit
      const auditResult = await testClient.query(`
        INSERT INTO audits (user_id, url, status)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [testUserId, 'https://example.com', 'pending']);
      
      const auditId = auditResult.rows[0].id;

      // Transition to running
      await testClient.query(`
        UPDATE audits 
        SET status = 'running', started_at = NOW()
        WHERE id = $1
      `, [auditId]);

      // Transition to completed
      await testClient.query(`
        UPDATE audits 
        SET status = 'completed', completed_at = NOW()
        WHERE id = $1
      `, [auditId]);

      // Verify final state
      const finalResult = await testClient.query(
        'SELECT status, started_at, completed_at FROM audits WHERE id = $1',
        [auditId]
      );
      
      const audit = finalResult.rows[0];
      expect(audit.status).toBe('completed');
      expect(audit.started_at).toBeInstanceOf(Date);
      expect(audit.completed_at).toBeInstanceOf(Date);
    });
  });

  describe('Tier System', () => {
    test('should have proper tier data with constraints', async () => {
      const tiersResult = await testClient.query('SELECT * FROM tier_definitions ORDER BY id');
      const tiers = tiersResult.rows;

      expect(tiers.length).toBeGreaterThanOrEqual(3); // At least freemium, starter, professional, enterprise
      
      // Check for required tiers
      const tierNames = tiers.map(t => t.tier_name);
      expect(tierNames).toContain('freemium');
      expect(tierNames).toContain('starter');
      expect(tierNames).toContain('professional');
      expect(tierNames).toContain('enterprise');
    });

    test('should enforce tier constraint on users', async () => {
      await expect(
        testClient.query(`
          INSERT INTO users (email, password_hash, tier)
          VALUES ($1, $2, $3)
        `, ['test@example.com', 'hash', 'invalid_tier'])
      ).rejects.toThrow(/violates check constraint/);
    });

    test('should update user tier correctly', async () => {
      // Create user with starter tier
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 'starter']);
      
      const userId = userResult.rows[0].id;

      // Upgrade to professional tier
      await testClient.query(`
        UPDATE users SET tier = $1 WHERE id = $2
      `, ['professional', userId]);

      // Verify tier was updated
      const updatedResult = await testClient.query(
        'SELECT tier FROM users WHERE id = $1',
        [userId]
      );
      
      expect(updatedResult.rows[0].tier).toBe('professional');
    });
  });

  describe('Sessions and Authentication', () => {
    test('should manage user sessions correctly', async () => {
      // Create user
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      const userId = userResult.rows[0].id;

      // Create session
      const sessionToken = 'session_token_123';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await testClient.query(`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)
      `, [userId, sessionToken, expiresAt]);

      // Verify session exists
      const sessionResult = await testClient.query(
        'SELECT * FROM user_sessions WHERE session_token = $1',
        [sessionToken]
      );
      
      expect(sessionResult.rows).toHaveLength(1);
      expect(sessionResult.rows[0].user_id).toBe(userId);
    });

    test('should clean up expired sessions', async () => {
      // Create user
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      const userId = userResult.rows[0].id;

      // Create expired session
      const expiredSession = 'expired_session_123';
      const expiredAt = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      await testClient.query(`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)
      `, [userId, expiredSession, expiredAt]);

      // Clean up expired sessions
      await testClient.query(
        'DELETE FROM user_sessions WHERE expires_at < NOW()'
      );

      // Verify expired session was deleted
      const sessionResult = await testClient.query(
        'SELECT * FROM user_sessions WHERE session_token = $1',
        [expiredSession]
      );
      
      expect(sessionResult.rows).toHaveLength(0);
    });
  });

  describe('Notifications System', () => {
    let testUserId;

    beforeEach(async () => {
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      testUserId = userResult.rows[0].id;
    });

    test('should create and manage notifications', async () => {
      const notificationData = {
        title: 'Audit Completed',
        message: 'Your audit for example.com has been completed.',
        type: 'success'
      };

      const result = await testClient.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [testUserId, notificationData.title, notificationData.message, notificationData.type]);

      const notification = result.rows[0];
      expect(notification.user_id).toBe(testUserId);
      expect(notification.title).toBe(notificationData.title);
      expect(notification.read).toBe(false);
      expect(notification.created_at).toBeInstanceOf(Date);
    });

    test('should mark notifications as read', async () => {
      // Create notification
      const notificationResult = await testClient.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [testUserId, 'Test', 'Test message', 'info']);
      
      const notificationId = notificationResult.rows[0].id;

      // Mark as read
      await testClient.query(`
        UPDATE notifications 
        SET read = true, read_at = NOW()
        WHERE id = $1
      `, [notificationId]);

      // Verify notification is marked as read
      const updatedResult = await testClient.query(
        'SELECT read, read_at FROM notifications WHERE id = $1',
        [notificationId]
      );
      
      const notification = updatedResult.rows[0];
      expect(notification.read).toBe(true);
      expect(notification.read_at).toBeInstanceOf(Date);
    });

    test('should get unread notification count', async () => {
      // Create multiple notifications
      await testClient.query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES 
          ($1, 'Notification 1', 'Message 1', 'info'),
          ($1, 'Notification 2', 'Message 2', 'success'),
          ($1, 'Notification 3', 'Message 3', 'warning')
      `, [testUserId]);

      // Mark one as read
      await testClient.query(`
        UPDATE notifications 
        SET read = true
        WHERE user_id = $1 AND title = 'Notification 1'
      `, [testUserId]);

      // Get unread count
      const countResult = await testClient.query(
        'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND read = false',
        [testUserId]
      );
      
      expect(parseInt(countResult.rows[0].unread_count)).toBe(2);
    });
  });

  describe('Data Integrity and Constraints', () => {
    test('should enforce NOT NULL constraints', async () => {
      await expect(
        testClient.query(`
          INSERT INTO users (password_hash, tier_id)
          VALUES ($1, $2)
        `, ['hash', 1])
      ).rejects.toThrow(/null value in column "email"/);
    });

    test('should validate email format at database level', async () => {
      await expect(
        testClient.query(`
          INSERT INTO users (email, password_hash, tier_id)
          VALUES ($1, $2, $3)
        `, ['invalid-email', 'hash', 1])
      ).rejects.toThrow(/email_format_check|violates check constraint/i);
    });

    test('should handle concurrent user creation with same email', async () => {
      const email = 'concurrent@example.com';
      
      const promises = Array(5).fill().map((_, i) =>
        testClient.query(`
          INSERT INTO users (email, password_hash, tier_id)
          VALUES ($1, $2, $3)
        `, [`${i}_${email}`, 'hash', 1])
      );

      // All should succeed with different emails
      await expect(Promise.all(promises)).resolves.toBeDefined();

      // But same email should fail
      await expect(
        testClient.query(`
          INSERT INTO users (email, password_hash, tier_id)
          VALUES ($1, $2, $3)
        `, ['0_' + email, 'hash', 1])
      ).rejects.toThrow(/duplicate key value/);
    });
  });

  describe('Performance and Indexing', () => {
    test('should efficiently query audits by user_id', async () => {
      // Create user
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      const userId = userResult.rows[0].id;

      // Create many audits
      const auditPromises = Array(100).fill().map((_, i) =>
        testClient.query(`
          INSERT INTO audits (user_id, url, status)
          VALUES ($1, $2, $3)
        `, [userId, `https://example${i}.com`, 'completed'])
      );
      
      await Promise.all(auditPromises);

      // Query with EXPLAIN to check performance
      const explainResult = await testClient.query(`
        EXPLAIN (ANALYZE, BUFFERS) 
        SELECT * FROM audits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
      `, [userId]);

      const queryPlan = explainResult.rows[0]['QUERY PLAN'];
      
      // Should use index scan, not sequential scan
      expect(queryPlan).toContain('Index');
      expect(queryPlan).not.toContain('Seq Scan');
    });

    test('should efficiently query unread notifications', async () => {
      // Create user
      const userResult = await testClient.query(`
        INSERT INTO users (email, password_hash, tier_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `, ['test@example.com', 'hash', 1]);
      
      const userId = userResult.rows[0].id;

      // Create many notifications
      const notificationPromises = Array(50).fill().map((_, i) =>
        testClient.query(`
          INSERT INTO notifications (user_id, title, message, type, read)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, `Title ${i}`, `Message ${i}`, 'info', i % 2 === 0])
      );
      
      await Promise.all(notificationPromises);

      const startTime = Date.now();
      
      const result = await testClient.query(`
        SELECT COUNT(*) as unread_count 
        FROM notifications 
        WHERE user_id = $1 AND read = false
      `, [userId]);

      const queryTime = Date.now() - startTime;
      
      expect(parseInt(result.rows[0].unread_count)).toBe(25);
      expect(queryTime).toBeLessThan(50); // Should be very fast with proper indexing
    });
  });

  describe('Backup and Recovery', () => {
    test('should maintain data consistency across transactions', async () => {
      // Start a transaction that will be rolled back
      await testClient.query('BEGIN');

      try {
        // Create user
        const userResult = await testClient.query(`
          INSERT INTO users (email, password_hash, tier_id)
          VALUES ($1, $2, $3)
          RETURNING id
        `, ['transaction-test@example.com', 'hash', 1]);
        
        const userId = userResult.rows[0].id;

        // Create audit
        await testClient.query(`
          INSERT INTO audits (user_id, url, status)
          VALUES ($1, $2, $3)
        `, [userId, 'https://example.com', 'completed']);

        // Simulate error
        throw new Error('Simulated error');
      } catch (error) {
        await testClient.query('ROLLBACK');
      }

      // Verify no data was committed
      const userResult = await testClient.query(
        'SELECT * FROM users WHERE email = $1',
        ['transaction-test@example.com']
      );
      
      expect(userResult.rows).toHaveLength(0);
    });

    test('should handle database connection recovery', async () => {
      // Simulate connection loss and recovery
      testClient.release();
      
      // Get new connection
      testClient = await testPool.connect();
      await testClient.query('BEGIN');

      // Should be able to perform operations normally
      const result = await testClient.query('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
    });
  });
});
