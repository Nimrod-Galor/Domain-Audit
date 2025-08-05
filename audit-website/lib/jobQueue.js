// Simple BullMQ-like in-memory job queue for audits
// Supports job status tracking and retries

class JobQueue {
  constructor() {
    this.jobs = new Map(); // jobId -> job object
    this.queue = [];
    this.processing = false;
    this.jobIdCounter = 1;
    this.listeners = {};
    this.maxConcurrentJobs = 3; // Limit concurrent audit jobs
    this.activeJobs = new Set(); // Track currently running jobs
    this.isPaused = false; // Allow pausing the queue
  }

  add(type, data, opts = {}) {
    const jobId = String(this.jobIdCounter++);
    const job = {
      id: jobId,
      type,
      data,
      status: 'waiting',
      attempts: 0,
      maxAttempts: opts.maxAttempts || 3,
      error: null,
      result: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.jobs.set(jobId, job);
    this.queue.push(jobId);
    this._processQueue();
    return jobId;
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getJobsByStatus(status) {
    return Array.from(this.jobs.values()).filter(j => j.status === status);
  }

  getJobStats() {
    const stats = { 
      waiting: 0, 
      active: 0, 
      completed: 0, 
      failed: 0, 
      total: this.jobs.size,
      activeJobsCount: this.activeJobs.size,
      queueLength: this.queue.length,
      isPaused: this.isPaused,
      maxConcurrentJobs: this.maxConcurrentJobs
    };
    for (const job of this.jobs.values()) {
      stats[job.status] = (stats[job.status] || 0) + 1;
    }
    return stats;
  }

  removeJob(jobId) {
    return this.jobs.delete(jobId);
  }

  clearCompletedJobs() {
    const completedJobs = Array.from(this.jobs.entries())
      .filter(([_, job]) => ['completed', 'failed'].includes(job.status))
      .map(([id]) => id);
    completedJobs.forEach(id => this.jobs.delete(id));
    return completedJobs.length;
  }

  pause() {
    this.isPaused = true;
    console.log('📢 Job queue paused');
  }

  resume() {
    this.isPaused = false;
    console.log('▶️ Job queue resumed');
    this._processQueue();
  }

  setMaxConcurrentJobs(max) {
    if (typeof max === 'number' && max > 0 && max <= 10) {
      this.maxConcurrentJobs = max;
      console.log(`🔧 Max concurrent jobs set to ${max}`);
    }
  }

  // Atomic session update to prevent race conditions
  _updateSession(activeSessions, sessionId, updates) {
    const current = activeSessions.get(sessionId) || {};
    activeSessions.set(sessionId, {
      ...current,
      ...updates,
      timestamp: new Date().toISOString()
    });
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  _emit(event, payload) {
    (this.listeners[event] || []).forEach(fn => fn(payload));
  }

  async _processQueue() {
    if (this.processing || this.isPaused) return;
    this.processing = true;
    
    try {
      // Clean up old completed jobs to prevent memory leaks
      if (this.jobs.size > 100) {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        const oldJobIds = Array.from(this.jobs.entries())
          .filter(([_, job]) => job.updatedAt < cutoff && ['completed', 'failed'].includes(job.status))
          .map(([id]) => id);
        oldJobIds.forEach(id => this.jobs.delete(id));
        if (oldJobIds.length > 0) {
          console.log(`🧹 Cleaned up ${oldJobIds.length} old jobs`);
        }
      }
      
      // Process jobs with concurrency control
      while (this.queue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs && !this.isPaused) {
        const jobId = this.queue.shift();
        const job = this.jobs.get(jobId);
        if (!job || job.status !== 'waiting') continue;
        
        // Mark job as active
        job.status = 'active';
        job.updatedAt = Date.now();
        this.activeJobs.add(jobId);
        this._emit('active', job);
        
        // Process job asynchronously
        this._runJobAsync(jobId, job);
      }
    } finally {
      this.processing = false;
    }
  }

  async _runJobAsync(jobId, job) {
    try {
      // Only audits supported for now
      if (job.type === 'runAudit') {
        job.result = await this._runAuditJob(job.data);
      } else {
        throw new Error('Unknown job type: ' + job.type);
      }
      job.status = 'completed';
      job.updatedAt = Date.now();
      this._emit('completed', job);
    } catch (err) {
      console.error(`❌ Job ${jobId} failed:`, err.message);
      job.attempts++;
      job.error = err.message;
      job.status = job.attempts < job.maxAttempts ? 'waiting' : 'failed';
      job.updatedAt = Date.now();
      this._emit(job.status === 'failed' ? 'failed' : 'retry', job);
      if (job.status === 'waiting') {
        this.queue.push(jobId); // retry
      }
    } finally {
      // Remove from active jobs
      this.activeJobs.delete(jobId);
      
      // Defensive scheduling - prevent any potential termination issues
      try {
        // Only continue processing if we have work and capacity
        if (!this.isPaused && this.queue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
          // Use a minimal delay to prevent event loop issues
          setTimeout(() => {
            // Double-check conditions before processing
            if (!this.processing && !this.isPaused && this.queue.length > 0) {
              this._processQueue().catch(err => {
                console.warn('⚠️ Queue processing error:', err.message);
              });
            }
          }, 10); // Small delay to ensure cleanup completes
        }
      } catch (scheduleError) {
        console.warn('⚠️ Error scheduling next queue processing:', scheduleError.message);
      }
    }
  }

  // Real audit job execution with database-first approach
  async _runAuditJob(data) {
    // Real audit logic integration
    const { auditExecutor, activeSessions, Audit } = this;
    const { url, reportType, maxPages, priority, sessionId, req, userLimits } = data;
    let auditRecord = null;
    let reportData = null;
    let auditMetrics = null;
    let progressHandler = null;
    let timeoutId = null;
    
    try {
      // Set up progress forwarding from auditExecutor to activeSessions
      progressHandler = (progressData) => {
        try {
          if (progressData.sessionId === sessionId) {
            // Use atomic update to prevent race conditions
            this._updateSession(activeSessions, sessionId, {
              status: progressData.status || 'running',
              message: progressData.message || 'Processing...',
              progress: Math.min(100, Math.max(0, progressData.progress || 0)),
              currentUrl: progressData.currentUrl || null,
              detailedStatus: progressData.detailedStatus || null
            });
          }
        } catch (err) {
          console.warn(`⚠️ Progress update failed for session ${sessionId}:`, err.message);
        }
      };

      // Validate inputs
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided for audit');
      }
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Invalid session ID provided for audit');
      }
      if (maxPages && (typeof maxPages !== 'number' || maxPages < 1 || maxPages > 1000)) {
        throw new Error('Invalid maxPages value (must be between 1 and 1000)');
      }

      // Check for recent audit in database (cache lookup)
      let useExistingAudit = false;
      if (Audit && Audit.findMostRecentByDomain) {
        const recentAudit = await Audit.findMostRecentByDomain(url);
        if (recentAudit && recentAudit.created_at) {
          const ageInHours = (Date.now() - new Date(recentAudit.created_at).getTime()) / (1000 * 60 * 60);
          // Use cached result if less than 24 hours old
          if (ageInHours < 24 && recentAudit.report_data) {
            console.log(`🔄 Using cached audit result for ${url} (${ageInHours.toFixed(1)}h old)`);
            
            // Update session with cached result
            this._updateSession(activeSessions, sessionId, {
              status: 'completed',
              result: recentAudit.report_data,
              url,
              reportType,
              maxPages,
              priority,
              auditId: recentAudit.id,
              progress: 100,
              message: 'Using recent audit results from cache'
            });
            
            return { 
              success: true, 
              reportData: recentAudit.report_data, 
              auditMetrics: {
                duration: recentAudit.duration_ms || 0,
                pagesScanned: recentAudit.pages_scanned || 0,
                externalLinksChecked: recentAudit.external_links_checked || 0,
                score: recentAudit.score || 0
              },
              cached: true,
              cacheAge: ageInHours
            };
          }
        }
      }

      // Always create audit record in DB (userId is null for anonymous)
      const userId = req?.session?.user ? req.session.user.id : null;
      if (Audit && Audit.create) {
        auditRecord = await Audit.create({
          userId,
          url: url,  // Use 'url' field consistently
          type: reportType,  // Use 'type' field consistently
          config: { maxPages, priority, sessionId }
        });
        // Update session with audit ID
        const session = activeSessions.get(sessionId);
        if (session) {
          this._updateSession(activeSessions, sessionId, { auditId: auditRecord.id });
        }
      }
      
      // Listen for progress events
      auditExecutor.on('progress', progressHandler);
      
      // Run audit with timeout to prevent hanging
      const auditPromise = auditExecutor.executeAudit(url, maxPages, false, sessionId, userLimits);
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Audit timeout after 10 minutes'));
        }, 10 * 60 * 1000);
      });
      
      const result = await Promise.race([auditPromise, timeoutPromise]);
      
      // Clear timeout if audit completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Defensive null check on result
      if (!result || !result.stateData) {
        throw new Error('Audit completed but returned invalid data');
      }
      
      reportData = auditExecutor.generateSimpleReport(result.stateData);
      auditMetrics = {
        duration: result.executionTime || result.duration || 0,
        pagesScanned: result.stateData?.visited?.length || 0,
        externalLinksChecked: Object.keys(result.stateData?.externalLinks || {}).length,
        score: reportData.summary?.score || reportData.overview?.score || 0
      };
      
      // Update DB record with complete results
      if (auditRecord && Audit && Audit.updateStatus) {
        await Audit.updateStatus(auditRecord.id, 'completed', {
          report_data: reportData,
          score: auditMetrics.score,
          duration_ms: auditMetrics.duration,
          pages_scanned: auditMetrics.pagesScanned,
          external_links_checked: auditMetrics.externalLinksChecked
        });
      }
      
      // Update activeSessions with final result
      this._updateSession(activeSessions, sessionId, {
        status: 'completed',
        result: reportData,
        url,
        reportType,
        maxPages,
        priority,
        auditId: auditRecord ? auditRecord.id : null,
        progress: 100,
        message: 'Audit completed successfully'
      });
      return { success: true, reportData, auditMetrics };
    } catch (error) {
      console.error(`❌ Audit job failed for ${url}:`, error.message);
      
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);
      
      // Update DB record on error
      if (auditRecord && Audit && Audit.updateStatus) {
        await Audit.updateStatus(auditRecord.id, 'failed', {
          error_message: error.message
        });
      }
      
      // Update activeSessions on error
      this._updateSession(activeSessions, sessionId, {
        status: 'error',
        error: error.message,
        url,
        reportType,
        maxPages,
        priority,
        auditId: auditRecord ? auditRecord.id : null,
        progress: 0,
        message: `Audit failed: ${error.message}`
      });
      throw new Error(`Audit failed for ${url}: ${error.message}`);
    } finally {
      // Always clean up progress listener first
      try {
        if (progressHandler && auditExecutor && typeof auditExecutor.removeListener === 'function') {
          auditExecutor.removeListener('progress', progressHandler);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Error removing progress listener:', cleanupError.message);
      }
      
      // Clear any remaining timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Extra safety: ensure audit executor cleanup doesn't cause termination
      try {
        if (auditExecutor && typeof auditExecutor.cleanupConnections === 'function') {
          // Don't await this to prevent hanging
          auditExecutor.cleanupConnections();
        }
      } catch (cleanupError) {
        console.warn('⚠️ Error during audit executor cleanup:', cleanupError.message);
      }
    }
  }
}

// Dependency injection for auditExecutor and activeSessions
let auditExecutorInstance = null;
let activeSessionsInstance = null;
let AuditModel = null;

const jobQueue = new JobQueue();
jobQueue.injectDependencies = ({ auditExecutor, activeSessions, Audit }) => {
  jobQueue.auditExecutor = auditExecutor;
  jobQueue.activeSessions = activeSessions;
  jobQueue.Audit = Audit;
};

export default jobQueue;
