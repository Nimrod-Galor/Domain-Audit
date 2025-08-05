// Integration test for BullMQ-like jobQueue audit background jobs
const jobQueue = require('../lib/jobQueue');
const { AuditExecutor } = require('../lib/audit-executor.js');

// Mock activeSessions and Audit model
const activeSessions = new Map();
const mockAuditDB = [];
const Audit = {
  async create(data) {
    const id = mockAuditDB.length + 1;
    const record = { ...data, id, status: 'created', created_at: new Date().toISOString() };
    mockAuditDB.push(record);
    return record;
  },
  async updateStatus(id, status, update) {
    const record = mockAuditDB.find(r => r.id === id);
    if (record) {
      Object.assign(record, update, { status });
    }
    return record;
  }
};

const auditExecutor = new AuditExecutor();
jobQueue.injectDependencies({ auditExecutor, activeSessions, Audit });

describe('jobQueue audit integration', () => {
  it('should process audit jobs, track status, and retry on error', async () => {
    // Add a job
    const jobId = jobQueue.add('runAudit', {
      url: 'https://example.com',
      reportType: 'simple',
      maxPages: 5,
      priority: 'balanced',
      sessionId: 'test-session-1',
      req: { session: { user: { id: 1, email: 'test@example.com' } } },
      userLimits: { isRegistered: true, maxExternalLinks: -1 }
    }, { maxAttempts: 2 });

    // Wait for job to complete
    await new Promise(resolve => {
      jobQueue.on('completed', job => {
        if (job.id === jobId) resolve();
      });
    });

    const job = jobQueue.getJob(jobId);
    expect(job.status).toBe('completed');
    expect(job.result).toBeDefined();
    expect(activeSessions.get('test-session-1').status).toBe('completed');
    expect(mockAuditDB[0].status).toBe('completed');
  });

  it('should retry and fail jobs on error', async () => {
    // Add a job with unknown type to force error
    const jobId = jobQueue.add('unknownType', { sessionId: 'test-session-2' }, { maxAttempts: 2 });
    await new Promise(resolve => {
      jobQueue.on('failed', job => {
        if (job.id === jobId) resolve();
      });
    });
    const job = jobQueue.getJob(jobId);
    expect(job.status).toBe('failed');
    expect(job.attempts).toBe(2);
  });
});
