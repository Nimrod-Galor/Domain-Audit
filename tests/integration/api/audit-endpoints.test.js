import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../web/app.js';
import { TestHelpers } from '../../helpers/TestHelpers.js';
import { UserFactory } from '../../factories/UserFactory.js';
import { AuditFactory } from '../../factories/AuditFactory.js';

describe('Audit API Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await TestHelpers.setupTestDatabase();
  });

  beforeEach(async () => {
    await TestHelpers.clearDatabase();
    testUser = await TestHelpers.createTestUser(UserFactory.create());
    authToken = TestHelpers.generateAuthToken(testUser);
  });

  afterAll(async () => {
    await TestHelpers.teardownTestDatabase();
  });

  describe('POST /api/audit', () => {
    test('should create audit with valid data', async () => {
      const auditData = {
        url: 'https://example.com',
        type: 'comprehensive',
        settings: {
          maxPages: 10,
          includeSubdomains: false
        }
      };

      const response = await request(app)
        .post('/api/audit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(auditData)
        .expect(201);

      expect(response.body).toHaveProperty('auditId');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('url', 'https://example.com');
      expect(response.body).toHaveProperty('type', 'comprehensive');
      expect(response.body).toHaveProperty('createdAt');

      // Verify audit was created in database
      const audit = await TestHelpers.getAuditById(response.body.auditId);
      expect(audit).toBeDefined();
      expect(audit.user_id).toBe(testUser.id);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/audit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'url',
          message: 'URL is required'
        })
      );
    });

    test('should validate URL format', async () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        'http://localhost:3000' // Local URLs should be blocked
      ];

      for (const url of invalidUrls) {
        const response = await request(app)
          .post('/api/audit')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ url })
          .expect(400);

        expect(response.body.errors).toContainEqual(
          expect.objectContaining({
            field: 'url',
            message: expect.stringContaining('Invalid URL')
          })
        );
      }
    });

    test('should enforce tier limits', async () => {
      // Create user with basic tier (5 audit limit)
      const basicUser = await TestHelpers.createTestUser(
        UserFactory.create({ tier_id: 1 })
      );
      const basicToken = TestHelpers.generateAuthToken(basicUser);

      // Create 5 existing audits for this user
      for (let i = 0; i < 5; i++) {
        await TestHelpers.createAudit(
          AuditFactory.create({ user_id: basicUser.id })
        );
      }

      const response = await request(app)
        .post('/api/audit')
        .set('Authorization', `Bearer ${basicToken}`)
        .send({ url: 'https://example.com' })
        .expect(429);

      expect(response.body).toHaveProperty('error', 'Audit limit exceeded');
      expect(response.body).toHaveProperty('limit', 5);
      expect(response.body).toHaveProperty('current', 5);
    });

    test('should enforce page limits per tier', async () => {
      const basicUser = await TestHelpers.createTestUser(
        UserFactory.create({ tier_id: 1 }) // Basic tier: 25 pages max
      );
      const basicToken = TestHelpers.generateAuthToken(basicUser);

      const response = await request(app)
        .post('/api/audit')
        .set('Authorization', `Bearer ${basicToken}`)
        .send({
          url: 'https://example.com',
          settings: { maxPages: 50 }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('exceeds maximum pages');
      expect(response.body).toHaveProperty('maxPages', 25);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/audit')
        .send({ url: 'https://example.com' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    test('should handle invalid auth tokens', async () => {
      const response = await request(app)
        .post('/api/audit')
        .set('Authorization', 'Bearer invalid-token')
        .send({ url: 'https://example.com' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    test('should start audit processing for valid requests', async () => {
      const auditData = {
        url: 'https://example.com',
        type: 'quick'
      };

      const response = await request(app)
        .post('/api/audit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(auditData)
        .expect(201);

      // Verify audit job was queued
      const audit = await TestHelpers.getAuditById(response.body.auditId);
      expect(audit.status).toBe('pending');
      expect(audit.queued_at).toBeDefined();
    });
  });

  describe('GET /api/audit/:id', () => {
    test('should return audit details for owner', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          status: 'completed',
          report_data: { score: 85, issues: [] }
        })
      );

      const response = await request(app)
        .get(`/api/audit/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', audit.id);
      expect(response.body).toHaveProperty('url', audit.url);
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('reportData');
      expect(response.body.reportData).toHaveProperty('score', 85);
    });

    test('should not return audit details for non-owner', async () => {
      const otherUser = await TestHelpers.createTestUser(
        UserFactory.create({ email: 'other@example.com' })
      );
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({ user_id: otherUser.id })
      );

      const response = await request(app)
        .get(`/api/audit/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    test('should return 404 for non-existent audit', async () => {
      const response = await request(app)
        .get('/api/audit/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Audit not found');
    });

    test('should include progress information for running audits', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          status: 'running',
          progress: {
            currentPage: 5,
            totalPages: 10,
            pagesProcessed: 4,
            startedAt: new Date().toISOString()
          }
        })
      );

      const response = await request(app)
        .get(`/api/audit/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('progress');
      expect(response.body.progress).toHaveProperty('currentPage', 5);
      expect(response.body.progress).toHaveProperty('totalPages', 10);
      expect(response.body.progress).toHaveProperty('percentComplete');
    });
  });

  describe('GET /api/audits', () => {
    test('should return user audits with pagination', async () => {
      // Create multiple audits for the user
      const audits = [];
      for (let i = 0; i < 15; i++) {
        audits.push(await TestHelpers.createAudit(
          AuditFactory.create({
            user_id: testUser.id,
            url: `https://example${i}.com`,
            created_at: new Date(Date.now() - i * 86400000) // Different dates
          })
        ));
      }

      const response = await request(app)
        .get('/api/audits?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('audits');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.audits).toHaveLength(10);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      });
    });

    test('should filter audits by status', async () => {
      await TestHelpers.createAudit(
        AuditFactory.create({ user_id: testUser.id, status: 'completed' })
      );
      await TestHelpers.createAudit(
        AuditFactory.create({ user_id: testUser.id, status: 'running' })
      );
      await TestHelpers.createAudit(
        AuditFactory.create({ user_id: testUser.id, status: 'failed' })
      );

      const response = await request(app)
        .get('/api/audits?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits).toHaveLength(1);
      expect(response.body.audits[0]).toHaveProperty('status', 'completed');
    });

    test('should sort audits by creation date (newest first)', async () => {
      const audit1 = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          created_at: new Date('2023-01-01')
        })
      );
      const audit2 = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          created_at: new Date('2023-12-01')
        })
      );

      const response = await request(app)
        .get('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits[0].id).toBe(audit2.id);
      expect(response.body.audits[1].id).toBe(audit1.id);
    });

    test('should only return current user audits', async () => {
      const otherUser = await TestHelpers.createTestUser(
        UserFactory.create({ email: 'other@example.com' })
      );

      await TestHelpers.createAudit(
        AuditFactory.create({ user_id: testUser.id })
      );
      await TestHelpers.createAudit(
        AuditFactory.create({ user_id: otherUser.id })
      );

      const response = await request(app)
        .get('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits).toHaveLength(1);
      expect(response.body.audits[0]).toHaveProperty('userId', testUser.id);
    });
  });

  describe('DELETE /api/audit/:id', () => {
    test('should delete audit for owner', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({ user_id: testUser.id })
      );

      const response = await request(app)
        .delete(`/api/audit/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Audit deleted successfully');

      // Verify audit is deleted
      const deletedAudit = await TestHelpers.getAuditById(audit.id);
      expect(deletedAudit).toBeNull();
    });

    test('should not delete audit for non-owner', async () => {
      const otherUser = await TestHelpers.createTestUser(
        UserFactory.create({ email: 'other@example.com' })
      );
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({ user_id: otherUser.id })
      );

      await request(app)
        .delete(`/api/audit/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      // Verify audit still exists
      const existingAudit = await TestHelpers.getAuditById(audit.id);
      expect(existingAudit).toBeDefined();
    });

    test('should not delete running audits', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          status: 'running'
        })
      );

      const response = await request(app)
        .delete(`/api/audit/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Cannot delete running audit');
    });
  });

  describe('POST /api/audit/:id/cancel', () => {
    test('should cancel pending audit', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          status: 'pending'
        })
      );

      const response = await request(app)
        .post(`/api/audit/${audit.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Audit cancelled successfully');

      // Verify audit status is updated
      const cancelledAudit = await TestHelpers.getAuditById(audit.id);
      expect(cancelledAudit.status).toBe('cancelled');
    });

    test('should cancel running audit', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          status: 'running'
        })
      );

      const response = await request(app)
        .post(`/api/audit/${audit.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Audit cancelled successfully');
    });

    test('should not cancel completed audits', async () => {
      const audit = await TestHelpers.createAudit(
        AuditFactory.create({
          user_id: testUser.id,
          status: 'completed'
        })
      );

      const response = await request(app)
        .post(`/api/audit/${audit.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Cannot cancel completed audit');
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock database failure
      jest.spyOn(TestHelpers, 'getDatabase').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });

    test('should validate audit ID format', async () => {
      const response = await request(app)
        .get('/api/audit/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid audit ID format');
    });

    test('should handle concurrent audit creation requests', async () => {
      const auditData = {
        url: 'https://example.com',
        type: 'quick'
      };

      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/audit')
          .set('Authorization', `Bearer ${authToken}`)
          .send(auditData)
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      expect(responses.every(r => r.status === 201)).toBe(true);

      // All audits should have unique IDs
      const auditIds = responses.map(r => r.body.auditId);
      const uniqueIds = new Set(auditIds);
      expect(uniqueIds.size).toBe(5);
    });
  });
});
