/**
 * AuditController Real Functions Test - MEDIUM PRIORITY Testing
 * Focus on testing the 15 real functions identified in the AuditController
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock all the dependencies before importing the controller
jest.unstable_mockModule('../../web/lib/audit-executor.js', () => ({
  AuditExecutor: jest.fn().mockImplementation(() => ({
    executeAudit: jest.fn(),
    generateSimpleReport: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  }))
}));

jest.unstable_mockModule('../../web/lib/logger.js', () => ({
  auditLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  },
  webLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    validationError: jest.fn(),
    auditRequest: jest.fn(),
    auditComplete: jest.fn()
  },
  errorHandler: {
    logError: jest.fn(),
    handleError: jest.fn()
  },
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

jest.unstable_mockModule('../../web/models/index.js', () => ({
  Audit: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    updateWithReport: jest.fn(),
    getUserAudits: jest.fn(),
    getStats: jest.fn(),
    findMostRecentByDomain: jest.fn()
  }
}));

jest.unstable_mockModule('../../web/controllers/notificationController.js', () => ({
  createNotification: jest.fn()
}));

jest.unstable_mockModule('../../web/services/pdfService.js', () => ({
  default: {
    generatePDF: jest.fn()
  }
}));

jest.unstable_mockModule('../../web/lib/jobQueue.js', () => ({
  default: {
    add: jest.fn(),
    getJob: jest.fn(),
    injectDependencies: jest.fn()
  }
}));

jest.unstable_mockModule('../../web/services/tierService.js', () => ({
  default: {
    canPerformAudit: jest.fn(),
    recordAuditUsage: jest.fn(),
    getCurrentMonthUsage: jest.fn(),
    getCurrentUsage: jest.fn(),
    getUserTierLimits: jest.fn(),
    getUserTier: jest.fn()
  }
}));

// Import the controller after setting up mocks
const auditController = await import('../../web/controllers/auditController.js');

describe('AuditController Real Functions - MEDIUM PRIORITY', () => {
  let app;
  let mockAuditModel;
  let mockTierService;

  beforeEach(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Mock render function to avoid template issues
    app.use((req, res, next) => {
      const originalRender = res.render;
      const originalRedirect = res.redirect;
      res.render = jest.fn((template, data) => {
        res.json({ template, data });
      });
      res.redirect = jest.fn((location) => {
        res.json({ redirect: location });
      });
      next();
    });
    
    // Mock session middleware
    app.use((req, res, next) => {
      req.session = {
        user: { id: 'test-user-123', email: 'test@example.com' },
        save: jest.fn((cb) => cb && cb()),
        destroy: jest.fn((cb) => cb && cb())
      };
      next();
    });

    // Get mocked modules
    const { Audit } = await import('../../web/models/index.js');
    const tierService = (await import('../../web/services/tierService.js')).default;

    mockAuditModel = Audit;
    mockTierService = tierService;

    // Setup essential mocks
    mockTierService.canPerformAudit.mockResolvedValue({ allowed: true });
    mockTierService.getUserTierLimits.mockResolvedValue({
      maxPages: 100,
      maxMonthlyAudits: 10
    });
    mockTierService.getCurrentUsage.mockResolvedValue({
      monthlyAudits: 2,
      totalPages: 25
    });
    
    mockAuditModel.create.mockResolvedValue({ 
      id: 123, 
      url: 'https://example.com' 
    });
    mockAuditModel.getUserAudits.mockResolvedValue([
      { id: 1, url: 'https://example.com', score: 85, created_at: new Date() }
    ]);

    // Setup routes for real functions
    app.get('/audit', auditController.getAuditForm);
    app.post('/audit', auditController.processAudit);
    app.get('/audit/:sessionId/progress', auditController.getAuditProgress);
    app.get('/audit/:sessionId/status', auditController.getAuditStatus);
    app.get('/audit/:sessionId/results', auditController.getAuditResults);
    app.get('/user/audits', auditController.getUserAudits);
  });

  afterEach(() => {
    jest.clearAllMocks();
    auditController.activeSessions.clear();
  });

  describe('Real Function 1: getAuditForm', () => {
    test('should render audit form with correct context', async () => {
      const response = await request(app)
        .get('/audit')
        .expect(200);

      expect(response.body).toMatchObject({
        template: 'audit/form',
        data: {
          title: 'Website Audit',
          user: { id: 'test-user-123', email: 'test@example.com' },
          error: null,
          url: ''
        }
      });
    });

    test('should handle anonymous users', async () => {
      // Override session to be anonymous
      app.use((req, res, next) => {
        req.session = {};
        next();
      });

      const response = await request(app)
        .get('/audit')
        .expect(200);

      expect(response.body.data.user).toBeNull();
    });
  });

  describe('Real Function 2: processAudit', () => {
    test('should process valid audit request', async () => {
      const auditData = {
        url: 'https://example.com',
        reportType: 'simple',
        maxPages: 5
      };

      const response = await request(app)
        .post('/audit')
        .send(auditData)
        .expect(200);

      expect(response.body.template).toBe('audit/loading');
      expect(response.body.data.sessionId).toBeDefined();
      expect(response.body.data.url).toBe('https://example.com');
    });

    test('should validate tier limits', async () => {
      mockTierService.canPerformAudit.mockResolvedValue({
        allowed: false,
        reason: 'Monthly limit exceeded'
      });

      const auditData = {
        url: 'https://example.com',
        reportType: 'simple',
        maxPages: 5
      };

      const response = await request(app)
        .post('/audit')
        .send(auditData)
        .expect(200);

      expect(response.body.template).toBe('audit/form');
      expect(response.body.data.error).toContain('limit');
    });
  });

  describe('Real Function 3: getAuditProgress', () => {
    test('should return progress for active session', async () => {
      const sessionId = 'test-session-123';
      
      // Setup active session
      auditController.activeSessions.set(sessionId, {
        status: 'running',
        progress: 45,
        message: 'Scanning pages...',
        currentUrl: 'https://example.com/page1',
        timestamp: new Date().toISOString()
      });

      const response = await request(app)
        .get(`/audit/${sessionId}/progress`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'running',
        progress: 45,
        message: 'Scanning pages...',
        currentUrl: 'https://example.com/page1'
      });
    });

    test('should handle non-existent session', async () => {
      const response = await request(app)
        .get('/audit/non-existent/progress')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'not_found',
        error: expect.stringContaining('not found')
      });
    });
  });

  describe('Real Function 4: getAuditStatus (SSE)', () => {
    test('should provide SSE endpoint for real-time updates', async () => {
      const sessionId = 'test-session-456';
      
      // Setup active session
      auditController.activeSessions.set(sessionId, {
        status: 'running',
        progress: 25,
        message: 'Processing...'
      });

      const response = await request(app)
        .get(`/audit/${sessionId}/status`)
        .expect(200);

      // Should set SSE headers
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
    });
  });

  describe('Real Function 5: getAuditResults', () => {
    test('should return completed audit results', async () => {
      const sessionId = 'completed-session';
      
      // Setup completed session
      auditController.activeSessions.set(sessionId, {
        status: 'completed',
        progress: 100,
        result: {
          summary: { score: 92 },
          issues: [],
          recommendations: []
        },
        auditId: 123
      });

      const response = await request(app)
        .get(`/audit/${sessionId}/results`)
        .expect(200);

      expect(response.body.template).toBe('audit/results');
      expect(response.body.data.audit.result.summary.score).toBe(92);
    });

    test('should redirect if audit still running', async () => {
      const sessionId = 'running-session';
      
      auditController.activeSessions.set(sessionId, {
        status: 'running',
        progress: 60,
        message: 'Still processing...'
      });

      const response = await request(app)
        .get(`/audit/${sessionId}/results`)
        .expect(200);

      expect(response.body.redirect).toContain(`/audit/${sessionId}/progress`);
    });
  });

  describe('Real Function 6: getUserAudits', () => {
    test('should retrieve user audit history', async () => {
      const response = await request(app)
        .get('/user/audits')
        .expect(200);

      expect(response.body.template).toBe('audit/user-audits');
      expect(response.body.data.audits).toHaveLength(1);
      expect(response.body.data.audits[0]).toMatchObject({
        id: 1,
        url: 'https://example.com',
        score: 85
      });

      // Verify correct database query
      expect(mockAuditModel.getUserAudits).toHaveBeenCalledWith('test-user-123');
    });

    test('should handle anonymous user requests', async () => {
      // Override session to be anonymous
      app.use((req, res, next) => {
        req.session = {};
        next();
      });

      const response = await request(app)
        .get('/user/audits')
        .expect(200);

      expect(response.body.redirect).toBe('/auth/login');
    });
  });

  describe('Real Function Validation', () => {
    test('should validate all exported functions exist', () => {
      const exportedFunctions = [
        'getAuditForm',
        'processAudit', 
        'getAuditProgress',
        'getAuditStatus',
        'getAuditResults',
        'getSimpleReport',
        'getFullReport',
        'getAuditHistory',
        'getUserAudits',
        'getHistoricalSimpleReport',
        'getHistoricalFullReport',
        'validateAuditRequest',
        'validateDomainParam', 
        'downloadPDFReport',
        'downloadHistoricalPDFReport'
      ];

      exportedFunctions.forEach(funcName => {
        expect(auditController[funcName]).toBeDefined();
        expect(typeof auditController[funcName]).toBe('function');
      });
    });

    test('should have activeSessions property for session management', () => {
      expect(auditController.activeSessions).toBeDefined();
      expect(auditController.activeSessions instanceof Map).toBe(true);
    });
  });

  describe('Session Management - Real Functionality', () => {
    test('should generate unique session IDs', async () => {
      const auditData = {
        url: 'https://example.com',
        reportType: 'simple',
        maxPages: 5
      };

      const response1 = await request(app)
        .post('/audit')
        .send(auditData);

      const response2 = await request(app)
        .post('/audit')
        .send(auditData);

      expect(response1.body.data.sessionId).not.toBe(response2.body.data.sessionId);
      expect(response1.body.data.sessionId).toMatch(/^\d+-[a-z0-9]+$/);
      expect(response2.body.data.sessionId).toMatch(/^\d+-[a-z0-9]+$/);
    });

    test('should manage active sessions correctly', () => {
      const sessionId = 'test-session';
      
      // Add session
      auditController.activeSessions.set(sessionId, {
        status: 'running',
        progress: 50
      });

      expect(auditController.activeSessions.has(sessionId)).toBe(true);
      expect(auditController.activeSessions.get(sessionId).status).toBe('running');

      // Clear session
      auditController.activeSessions.delete(sessionId);
      expect(auditController.activeSessions.has(sessionId)).toBe(false);
    });
  });

  describe('Error Handling - Real Functionality', () => {
    test('should handle database errors gracefully', async () => {
      mockAuditModel.create.mockRejectedValue(new Error('Database connection failed'));

      const auditData = {
        url: 'https://example.com',
        reportType: 'simple',
        maxPages: 5
      };

      const response = await request(app)
        .post('/audit')
        .send(auditData)
        .expect(200);

      expect(response.body.template).toBe('audit/form');
      expect(response.body.data.error).toContain('Invalid form data');
    });

    test('should handle tier service errors', async () => {
      mockTierService.canPerformAudit.mockRejectedValue(new Error('Tier service unavailable'));

      const auditData = {
        url: 'https://example.com',
        reportType: 'simple',
        maxPages: 5
      };

      const response = await request(app)
        .post('/audit')
        .send(auditData)
        .expect(200);

      expect(response.body.template).toBe('audit/form');
      expect(response.body.data.error).toContain('Service temporarily unavailable');
    });
  });
});
