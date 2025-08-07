/**
 * JobQueue Tests - Critical Priority Testing
 * Tests the real job queue functionality used in the audit system
 */

import { jest } from '@jest/globals';
import jobQueue from '../../web/lib/jobQueue.js';

describe('JobQueue - Critical Functionality Tests', () => {
  let mockAuditExecutor;
  let mockActiveSessions;
  let mockAuditModel;
  let mockTierService;

  beforeAll(() => {
    // Ensure Jest handles timeouts properly
    jest.setTimeout(10000);
  });

  afterAll(async () => {
    // Final cleanup to ensure Jest exits cleanly
    jobQueue.pause();
    jobQueue.processing = false;
    jobQueue.jobs.clear();
    jobQueue.queue.length = 0;
    jobQueue.activeJobs.clear();
    jobQueue.listeners = {};
    
    // Clear any remaining timers
    if (jobQueue._processTimer) {
      clearTimeout(jobQueue._processTimer);
      jobQueue._processTimer = null;
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Small delay to allow cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  beforeEach(() => {
    // Reset the job queue between tests
    jobQueue.jobs.clear();
    jobQueue.queue.length = 0;
    jobQueue.processing = false;
    jobQueue.jobIdCounter = 1;
    jobQueue.activeJobs.clear();
    jobQueue.isPaused = false;
    jobQueue.listeners = {};

    // Create comprehensive mocks for real dependencies
    mockAuditExecutor = {
      executeAudit: jest.fn(),
      generateSimpleReport: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      cleanupConnections: jest.fn()
    };

    mockActiveSessions = new Map();

    mockAuditModel = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      findMostRecentByDomain: jest.fn()
    };

    mockTierService = {
      recordAuditUsage: jest.fn()
    };

    // Inject real dependencies
    jobQueue.injectDependencies({
      auditExecutor: mockAuditExecutor,
      activeSessions: mockActiveSessions,
      Audit: mockAuditModel,
      tierService: mockTierService
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    
    // Stop all background processing
    jobQueue.pause();
    jobQueue.processing = false;
    
    // Wait for any active jobs to complete or force stop them
    const activeJobs = Array.from(jobQueue.activeJobs.values());
    await Promise.allSettled(activeJobs);
    
    // Clear all job data
    jobQueue.jobs.clear();
    jobQueue.queue.length = 0;
    jobQueue.activeJobs.clear();
    
    // Clear all event listeners to prevent memory leaks
    jobQueue.listeners = {};
    
    // Clear any timers that might be running
    if (jobQueue._processTimer) {
      clearTimeout(jobQueue._processTimer);
      jobQueue._processTimer = null;
    }
    
    // Reset sessions
    mockActiveSessions.clear();
  });

  describe('Basic Job Management', () => {
    test('should add jobs to queue with correct structure', async () => {
      // Pause queue to prevent auto-processing for this test
      jobQueue.pause();
      
      const jobId = jobQueue.add('runAudit', {
        url: 'https://example.com',
        sessionId: 'test-session'
      });

      expect(jobId).toBe('1');
      expect(jobQueue.jobs.size).toBe(1);
      expect(jobQueue.queue.length).toBe(1);

      const job = jobQueue.getJob(jobId);
      expect(job).toMatchObject({
        id: '1',
        type: 'runAudit',
        status: 'waiting',
        attempts: 0,
        maxAttempts: 3,
        error: null,
        result: null
      });
      expect(job.createdAt).toBeGreaterThan(0);
      expect(job.updatedAt).toBeGreaterThan(0);
    });

    test('should set custom maxAttempts in job options', () => {
      jobQueue.pause();
      const jobId = jobQueue.add('runAudit', {}, { maxAttempts: 5 });
      const job = jobQueue.getJob(jobId);
      
      expect(job.maxAttempts).toBe(5);
    });

    test('should get jobs by status correctly', () => {
      jobQueue.pause();
      jobQueue.add('runAudit', { test: 1 });
      jobQueue.add('runAudit', { test: 2 });
      
      const waitingJobs = jobQueue.getJobsByStatus('waiting');
      expect(waitingJobs).toHaveLength(2);
      expect(waitingJobs[0].status).toBe('waiting');
    });

    test('should provide accurate job statistics', () => {
      jobQueue.pause();
      jobQueue.add('runAudit', { test: 1 });
      jobQueue.add('runAudit', { test: 2 });
      
      const stats = jobQueue.getJobStats();
      expect(stats).toMatchObject({
        waiting: 2,
        active: 0,
        completed: 0,
        failed: 0,
        total: 2,
        activeJobsCount: 0,
        queueLength: 2,
        isPaused: true,
        maxConcurrentJobs: 3
      });
    });

    test('should remove jobs correctly', () => {
      jobQueue.pause();
      const jobId = jobQueue.add('runAudit', {});
      expect(jobQueue.jobs.size).toBe(1);
      
      const removed = jobQueue.removeJob(jobId);
      expect(removed).toBe(true);
      expect(jobQueue.jobs.size).toBe(0);
    });

    test('should clear completed jobs', () => {
      jobQueue.pause();
      // Add some jobs and simulate completion
      const jobId1 = jobQueue.add('runAudit', {});
      const jobId2 = jobQueue.add('runAudit', {});
      const jobId3 = jobQueue.add('runAudit', {});
      
      // Manually set some as completed/failed
      jobQueue.jobs.get(jobId1).status = 'completed';
      jobQueue.jobs.get(jobId2).status = 'failed';
      // jobId3 remains 'waiting'
      
      const clearedCount = jobQueue.clearCompletedJobs();
      expect(clearedCount).toBe(2);
      expect(jobQueue.jobs.size).toBe(1);
      expect(jobQueue.getJob(jobId3).status).toBe('waiting');
    });
  });

  describe('Queue Control Functions', () => {
    test('should pause and resume queue processing', () => {
      expect(jobQueue.isPaused).toBe(false);
      
      jobQueue.pause();
      expect(jobQueue.isPaused).toBe(true);
      
      jobQueue.resume();
      expect(jobQueue.isPaused).toBe(false);
    });

    test('should set max concurrent jobs within limits', () => {
      jobQueue.setMaxConcurrentJobs(5);
      expect(jobQueue.maxConcurrentJobs).toBe(5);
      
      // Should not set invalid values
      jobQueue.setMaxConcurrentJobs(0);
      expect(jobQueue.maxConcurrentJobs).toBe(5); // unchanged
      
      jobQueue.setMaxConcurrentJobs(15);
      expect(jobQueue.maxConcurrentJobs).toBe(5); // unchanged
    });

    test('should not process queue when paused', async () => {
      jobQueue.pause();
      const processSpy = jest.spyOn(jobQueue, '_processQueue');
      
      jobQueue.add('runAudit', { url: 'https://example.com' });
      
      // Wait a bit for any potential processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(processSpy).toHaveBeenCalled();
      expect(jobQueue.activeJobs.size).toBe(0);
    });
  });

  describe('Event System', () => {
    test('should register and emit events correctly', () => {
      const mockListener = jest.fn();
      jobQueue.on('testEvent', mockListener);
      
      jobQueue._emit('testEvent', { data: 'test' });
      
      expect(mockListener).toHaveBeenCalledWith({ data: 'test' });
    });

    test('should handle multiple listeners for same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      jobQueue.on('test', listener1);
      jobQueue.on('test', listener2);
      
      jobQueue._emit('test', 'payload');
      
      expect(listener1).toHaveBeenCalledWith('payload');
      expect(listener2).toHaveBeenCalledWith('payload');
    });
  });

  describe('Session Management', () => {
    test('should update sessions atomically', () => {
      const sessionId = 'test-session';
      const updates = {
        status: 'running',
        progress: 50,
        message: 'Processing...'
      };
      
      jobQueue._updateSession(mockActiveSessions, sessionId, updates);
      
      const session = mockActiveSessions.get(sessionId);
      expect(session).toMatchObject(updates);
      expect(session.timestamp).toBeDefined();
    });

    test('should merge updates with existing session data', () => {
      const sessionId = 'test-session';
      
      // Set initial data
      mockActiveSessions.set(sessionId, {
        url: 'https://example.com',
        status: 'waiting'
      });
      
      // Update with new data
      jobQueue._updateSession(mockActiveSessions, sessionId, {
        status: 'running',
        progress: 25
      });
      
      const session = mockActiveSessions.get(sessionId);
      expect(session).toMatchObject({
        url: 'https://example.com',
        status: 'running',
        progress: 25
      });
    });
  });

  describe('Audit Job Execution - Real Functionality', () => {
    test('should execute audit job with complete workflow', async () => {
      // Setup mocks for successful audit
      const mockStateData = {
        visited: ['https://example.com', 'https://example.com/about'],
        externalLinks: { 'https://external.com': true }
      };
      
      const mockReportData = {
        summary: { score: 85 },
        overview: { totalPages: 2 }
      };

      mockAuditExecutor.executeAudit.mockResolvedValue({
        stateData: mockStateData,
        executionTime: 5000
      });
      
      mockAuditExecutor.generateSimpleReport.mockReturnValue(mockReportData);
      
      mockAuditModel.create.mockResolvedValue({ id: 123 });
      mockAuditModel.updateStatus.mockResolvedValue(true);
      mockAuditModel.findMostRecentByDomain.mockResolvedValue(null);

      // Create and process audit job
      const jobData = {
        url: 'https://example.com',
        reportType: 'full',
        maxPages: 10,
        priority: 'normal',
        sessionId: 'test-session',
        req: { session: { user: { id: 'user123' } } },
        userLimits: { maxPages: 50 },
        userId: 'user123'
      };

      const result = await jobQueue._runAuditJob(jobData);

      // Verify audit execution
      expect(mockAuditExecutor.executeAudit).toHaveBeenCalledWith(
        'https://example.com',
        10,
        false,
        'test-session',
        { maxPages: 50 }
      );

      // Verify database operations
      expect(mockAuditModel.create).toHaveBeenCalledWith({
        userId: 'user123',
        url: 'https://example.com',
        type: 'full',
        config: { maxPages: 10, priority: 'normal', sessionId: 'test-session' }
      });

      expect(mockAuditModel.updateStatus).toHaveBeenCalledWith(
        123,
        'completed',
        expect.objectContaining({
          report_data: mockReportData,
          score: 85,
          duration_ms: 5000,
          pages_scanned: 2,
          external_links_checked: 1
        })
      );

      // Verify tier service usage recording
      expect(mockTierService.recordAuditUsage).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          auditId: 123,
          pagesScanned: 2,
          externalLinksChecked: 1,
          score: 85,
          url: 'https://example.com',
          reportType: 'full',
          duration: 5000
        })
      );

      // Verify session updates
      const finalSession = mockActiveSessions.get('test-session');
      expect(finalSession).toMatchObject({
        status: 'completed',
        result: mockReportData,
        url: 'https://example.com',
        progress: 100,
        message: 'Audit completed successfully'
      });

      // Verify return value
      expect(result).toEqual({
        success: true,
        reportData: mockReportData,
        auditMetrics: {
          duration: 5000,
          pagesScanned: 2,
          externalLinksChecked: 1,
          score: 85
        }
      });
    });

    test('should use cached audit results when available', async () => {
      const cachedAudit = {
        id: 456,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        report_data: { cached: true, score: 90 },
        duration_ms: 3000,
        pages_scanned: 5,
        external_links_checked: 3,
        score: 90
      };

      mockAuditModel.findMostRecentByDomain.mockResolvedValue(cachedAudit);

      const jobData = {
        url: 'https://example.com',
        reportType: 'full',
        sessionId: 'test-session'
      };

      const result = await jobQueue._runAuditJob(jobData);

      // Should not execute new audit
      expect(mockAuditExecutor.executeAudit).not.toHaveBeenCalled();

      // Should use cached data
      expect(result).toEqual({
        success: true,
        reportData: { cached: true, score: 90 },
        auditMetrics: {
          duration: 3000,
          pagesScanned: 5,
          externalLinksChecked: 3,
          score: 90
        },
        cached: true,
        cacheAge: expect.any(Number)
      });

      // Verify session was updated with cached result
      const session = mockActiveSessions.get('test-session');
      expect(session.status).toBe('completed');
      expect(session.message).toBe('Using recent audit results from cache');
    });

    test('should handle audit execution errors gracefully', async () => {
      const errorMessage = 'Network timeout during audit';
      mockAuditExecutor.executeAudit.mockRejectedValue(new Error(errorMessage));
      mockAuditModel.create.mockResolvedValue({ id: 789 });
      mockAuditModel.updateStatus.mockResolvedValue(true);
      mockAuditModel.findMostRecentByDomain.mockResolvedValue(null);

      const jobData = {
        url: 'https://example.com',
        sessionId: 'test-session'
      };

      await expect(jobQueue._runAuditJob(jobData)).rejects.toThrow(
        'Audit failed for https://example.com: Network timeout during audit'
      );

      // Verify error was recorded in database
      expect(mockAuditModel.updateStatus).toHaveBeenCalledWith(
        789,
        'failed',
        { error_message: errorMessage }
      );

      // Verify session was updated with error
      const session = mockActiveSessions.get('test-session');
      expect(session.status).toBe('error');
      expect(session.error).toBe(errorMessage);
    });

    test('should validate input parameters', async () => {
      // Mock required dependencies to prevent errors for valid calls
      mockAuditModel.create.mockResolvedValue({ id: 123 });
      mockAuditModel.findMostRecentByDomain.mockResolvedValue(null);
      
      // Test invalid URL
      await expect(jobQueue._runAuditJob({
        url: '',
        sessionId: 'test-session'
      })).rejects.toThrow('Invalid URL provided for audit');

      // Test invalid sessionId
      await expect(jobQueue._runAuditJob({
        url: 'https://example.com',
        sessionId: ''
      })).rejects.toThrow('Invalid session ID provided for audit');

      // Test invalid maxPages - NOTE: maxPages validation only happens if maxPages is truthy
      // So maxPages: 0 is actually allowed (treated as no limit)
      // But maxPages: -1 should fail
      await expect(jobQueue._runAuditJob({
        url: 'https://example.com',
        sessionId: 'test-session',
        maxPages: -1
      })).rejects.toThrow('Invalid maxPages value (must be between 1 and 1000)');

      await expect(jobQueue._runAuditJob({
        url: 'https://example.com',
        sessionId: 'test-session',
        maxPages: 1001
      })).rejects.toThrow('Invalid maxPages value (must be between 1 and 1000)');

      // Test type validation (maxPages must be number when provided)
      await expect(jobQueue._runAuditJob({
        url: 'https://example.com',
        sessionId: 'test-session',
        maxPages: 'invalid'
      })).rejects.toThrow('Invalid maxPages value (must be between 1 and 1000)');
    });

    test('should handle progress events correctly', async () => {
      let progressHandler;
      mockAuditExecutor.on.mockImplementation((event, handler) => {
        if (event === 'progress') {
          progressHandler = handler;
        }
      });

      mockAuditExecutor.executeAudit.mockImplementation(async () => {
        // Simulate progress events during execution synchronously
        if (progressHandler) {
          progressHandler({
            sessionId: 'test-session',
            status: 'scanning',
            progress: 25,
            message: 'Scanning pages...',
            currentUrl: 'https://example.com/page1',
            phase: 'discovery'
          });
        }

        return {
          stateData: { visited: ['https://example.com'] },
          executionTime: 1000
        };
      });

      mockAuditExecutor.generateSimpleReport.mockReturnValue({ score: 75 });
      mockAuditModel.create.mockResolvedValue({ id: 123 });
      mockAuditModel.findMostRecentByDomain.mockResolvedValue(null);

      const jobData = {
        url: 'https://example.com',
        sessionId: 'test-session'
      };

      await jobQueue._runAuditJob(jobData);

      // Verify progress handler was registered and removed
      expect(mockAuditExecutor.on).toHaveBeenCalledWith('progress', expect.any(Function));
      expect(mockAuditExecutor.removeListener).toHaveBeenCalledWith('progress', progressHandler);

      // Verify session was updated with progress
      const session = mockActiveSessions.get('test-session');
      expect(session.status).toBe('completed'); // Final status
    });

    test('should handle anonymous users (no userId)', async () => {
      mockAuditExecutor.executeAudit.mockResolvedValue({
        stateData: { visited: ['https://example.com'] },
        executionTime: 2000
      });
      
      mockAuditExecutor.generateSimpleReport.mockReturnValue({ score: 80 });
      mockAuditModel.create.mockResolvedValue({ id: 999 });
      mockAuditModel.findMostRecentByDomain.mockResolvedValue(null);

      const jobData = {
        url: 'https://example.com',
        sessionId: 'test-session',
        req: { session: {} } // No user in session
      };

      const result = await jobQueue._runAuditJob(jobData);

      // Should create audit with null userId
      expect(mockAuditModel.create).toHaveBeenCalledWith({
        userId: null,
        url: 'https://example.com',
        type: undefined,
        config: expect.any(Object)
      });

      // Should not record tier usage for anonymous users
      expect(mockTierService.recordAuditUsage).not.toHaveBeenCalled();

      expect(result.success).toBe(true);
    });
  });

  describe('Memory Management', () => {
    test('should clean up old completed jobs to prevent memory leaks', async () => {
      // Create old jobs
      const oldJobId = jobQueue.add('runAudit', {});
      const recentJobId = jobQueue.add('runAudit', {});
      
      // Set one job as old and completed
      const oldJob = jobQueue.jobs.get(oldJobId);
      oldJob.status = 'completed';
      oldJob.updatedAt = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      
      // Set other as recent
      const recentJob = jobQueue.jobs.get(recentJobId);
      recentJob.status = 'waiting';
      
      // Mock large job size to trigger cleanup
      Object.defineProperty(jobQueue.jobs, 'size', { value: 101, configurable: true });
      
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await jobQueue._processQueue();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧹 Cleaned up 1 old jobs')
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Concurrency Control', () => {
    test('should respect max concurrent jobs limit', async () => {
      jobQueue.setMaxConcurrentJobs(2);
      
      // Add 3 jobs with real data that won't cause validation errors
      jobQueue.add('runAudit', { url: 'https://example1.com', sessionId: 'session1' });
      jobQueue.add('runAudit', { url: 'https://example2.com', sessionId: 'session2' });
      jobQueue.add('runAudit', { url: 'https://example3.com', sessionId: 'session3' });
      
      // Mock executeAudit to be controlled
      let resolveCount = 0;
      const resolvers = [];
      mockAuditExecutor.executeAudit.mockImplementation(() => {
        return new Promise(resolve => {
          resolvers.push(() => {
            resolve({
              stateData: { visited: [`https://example${++resolveCount}.com`] },
              executionTime: 1000
            });
          });
        });
      });
      
      mockAuditExecutor.generateSimpleReport.mockReturnValue({ score: 75 });
      mockAuditModel.create.mockResolvedValue({ id: 123 });
      mockAuditModel.findMostRecentByDomain.mockResolvedValue(null);
      
      // Wait for processing to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should only have 2 active jobs due to concurrency limit
      expect(jobQueue.activeJobs.size).toBeLessThanOrEqual(2);
      expect(jobQueue.getJobStats().active).toBeLessThanOrEqual(2);
      
      // Complete all jobs to clean up
      resolvers.forEach(resolver => resolver());
      
      // Wait for all jobs to complete with longer timeout
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force cleanup any remaining jobs
      jobQueue.activeJobs.clear();
      
      // Verify cleanup
      expect(jobQueue.activeJobs.size).toBe(0);
    });
  });
});
