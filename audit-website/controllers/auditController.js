/**
 * Audit Controller
 * Handles website audit operations and report generation
 */
import { z } from 'zod';
import { AuditExecutor } from '../lib/audit-executor.js';
import { auditLogger, webLogger, errorHandler } from '../lib/logger.js';
import logger from '../lib/logger.js';
import { Audit } from '../models/index.js';
import { createNotification } from './notificationController.js';
import pdfService from '../services/pdfService.js';
import jobQueue from '../lib/jobQueue.js';
import tierService from '../services/tierService.js';

// Create audit executor instance
const auditExecutor = new AuditExecutor();

// Store active audit sessions for Server-Sent Events
const activeSessions = new Map();

// Export for testing/debugging
export { activeSessions };

// Session cleanup configuration
const SESSION_TTL = 60 * 60 * 1000; // 60 minutes in milliseconds (increased from 30)
const CLEANUP_INTERVAL = 10 * 60 * 1000; // Cleanup every 10 minutes (increased from 5)

// Cleanup expired sessions
const cleanupExpiredSessions = () => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    const sessionAge = now - new Date(session.timestamp).getTime();
    
    if (sessionAge > SESSION_TTL) {
      activeSessions.delete(sessionId);
      console.log(`[DEBUG] Session expired and deleted: ${sessionId}. Total sessions: ${activeSessions.size}`);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0 || activeSessions.size > 10) {
    const stats = getSessionStats();
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions. Memory stats:`, stats);
  }
};

// Start periodic cleanup
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);

// Initial cleanup on server start
cleanupExpiredSessions();

// Generate unique session ID
const generateSessionId = () => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Get session memory statistics
const getSessionStats = () => {
  const totalSessions = activeSessions.size;
  let completedSessions = 0;
  let cachedSessions = 0;
  let runningSessions = 0;
  let errorSessions = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    switch (session.status) {
      case 'completed':
        completedSessions++;
        if (session.fromCache) cachedSessions++;
        break;
      case 'running':
        runningSessions++;
        break;
      case 'error':
        errorSessions++;
        break;
    }
  }
  
  return {
    total: totalSessions,
    completed: completedSessions,
    cached: cachedSessions,
    running: runningSessions,
    error: errorSessions,
    estimatedMemoryMB: Math.round((totalSessions * 60) / 1024) // ~60KB per session
  };
};

// Zod validation schemas
const auditRequestSchema = z.object({
  url: z.string()
    .url({ message: 'Please enter a valid URL' })
    .min(1, { message: 'URL is required' })
    .refine(url => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, { message: 'URL must use HTTP or HTTPS protocol' })
});

// Domain validation schema for direct access routes
const domainParamSchema = z.object({
  domain: z.string()
    .min(1, { message: 'Domain is required' })
    .refine(domain => {
      try {
        // Allow domain with or without protocol
        const urlToTest = domain.startsWith('http') ? domain : `https://${domain}`;
        new URL(urlToTest);
        return true;
      } catch {
        return false;
      }
    }, { message: 'Invalid domain format' })
});

/**
 * Display audit form page
 */
export const getAuditForm = (req, res) => {
  res.render('audit/form', {
    title: 'Website Audit',
    user: req.session.user || null,
    error: null,
    url: ''
  });
};

/**
 * Process audit request with validation
 */
export const processAudit = async (req, res) => {
  try {
    // Validate request data
    const validatedData = auditRequestSchema.parse(req.body);
    const { url } = validatedData;
    
    // Get user information
    const userId = req.session?.user?.id || null;
    const userEmail = req.session?.user?.email || null;
    
    // Get user tier limits and check permissions
    const userLimits = await tierService.getUserTierLimits(userId);
    
    // Check if user can perform audit
    const canPerformAudit = await tierService.canPerformAudit(userId);
    
    if (!canPerformAudit.allowed) {
      const upgradeMessage = userId ? 
        'You have reached your audit limit. Please upgrade your plan or wait for your limit to reset.' :
        'Free limit reached. Please sign up for more audits.';
        
      return res.render('audit/form', {
        title: 'Website Audit',
        user: req.session.user || null,
        error: canPerformAudit.reason || upgradeMessage,
        url,
        userLimits: {
          current: canPerformAudit.currentUsage,
          max: canPerformAudit.limit,
          tierName: userLimits.tierName
        }
      });
    }
    
    // Log successful validation
    auditLogger.userAction('form_submitted', req.session.user, {
      domain: url,
      ip: req.ip,
      tierName: userLimits.tierName
    });
    
    // Set default values since form options were removed
    const reportType = 'simple'; // Default to simple report
    const maxPages = Math.min(50, userLimits.maxPagesPerAudit); // Respect tier limits
    const priority = userId ? 'high' : 'normal'; // Registered users get higher priority

    // For unregistered users, check if we have a recent audit for this domain
    if (!userId) {
      try {
        // Look for the most recent completed audit for this domain
        const existingAudit = await Audit.findMostRecentByDomain(url);
        
        if (existingAudit && existingAudit.status === 'completed' && existingAudit.report_data) {
          console.log(`📋 Found existing audit for ${url} (ID: ${existingAudit.id})`);
          
          // Generate session ID for this cached result
          const sessionId = generateSessionId();
          
          // Store the existing audit data in session
          activeSessions.set(sessionId, {
            status: 'completed',
            result: existingAudit.report_data,
            url,
            reportType,
            maxPages,
            priority,
            auditId: existingAudit.id,
            fromCache: true,
            timestamp: new Date().toISOString()
          });
          
          auditLogger.auditCacheHit(sessionId, url, {
            auditId: existingAudit.id,
            originalDate: existingAudit.created_at
          });
          
          // Redirect directly to results
          return res.redirect(`/audit/results/${sessionId}`);
        }
      } catch (error) {
        console.error('❌ Error checking for existing audit:', error.message);
        // Continue with new audit if check fails
      }
    }

    // Daily limit checking for unregistered users (Freemium)
    if (!userId) {
      const today = new Date().toDateString();
      const dailyAudits = req.session.dailyAudits || {};
      const todayAudits = dailyAudits[today] || 0;
      
      if (todayAudits >= 1) {
        return res.render('audit/form', {
          title: 'Website Audit',
          user: req.session.user || null,
          error: 'Daily limit reached (1 audit per day for unregistered users). Sign up for 3 audits per month!',
          url,
          showSignUpPrompt: true
        });
      }
      
      // Track today's audit
      dailyAudits[today] = todayAudits + 1;
      req.session.dailyAudits = dailyAudits;
      
      // Clean up old entries (keep only last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      Object.keys(dailyAudits).forEach(date => {
        if (new Date(date) < sevenDaysAgo) {
          delete dailyAudits[date];
        }
      });
    } else {
      console.log(`Logged-in user: ${userEmail} (Tier: ${userLimits.tierName})`);
    }

    // Generate unique session ID for this audit
    const sessionId = generateSessionId();

    // Store initial session info for progress tracking
    activeSessions.set(sessionId, {
      status: 'running',
      url,
      reportType,
      maxPages,
      priority,
      auditId: null, // Will be updated when audit is created
      timestamp: new Date().toISOString()
    });
    console.log(`[DEBUG] Session created: ${sessionId}. Total sessions: ${activeSessions.size}`);

    console.log(`🚀 Created session ${sessionId} for ${url}:`, {
      status: 'running',
      totalSessions: activeSessions.size,
      isRegistered: !!userId,
      tierName: userLimits.tierName,
      maxPages: maxPages
    });

    auditLogger.auditStarted(sessionId, url, {
      reportType,
      maxPages,
      auditId: null,
      tierName: userLimits.tierName,
      userId
    });
    
    // Get tier information for rendering
    const userTier = await tierService.getUserTier(userId);
    const userUsage = userId ? await tierService.getCurrentUsage(userId) : null;
    
    // Show loading page with progress
    res.render('audit/loading', {
      title: 'Analyzing Website...',
      user: req.session.user || null,
      userTier,
      userUsage,
      url,
      reportType,
      sessionId,
      maxPages,
      priority,
      userLimits: {
        tierName: userLimits.tierName,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        maxExternalLinks: userLimits.maxExternalLinks
      }
    });

    // Start audit in background using jobQueue
    jobQueue.add('runAudit', {
      url,
      reportType,
      maxPages,
      priority,
      sessionId,
      req,
      userId,
      userLimits: {
        isRegistered: !!userId,
        maxExternalLinks: userLimits.maxExternalLinks,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        tierName: userLimits.tierName
      }
    });
// Inject dependencies for jobQueue
jobQueue.injectDependencies({ auditExecutor, activeSessions, Audit, tierService });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation error
      webLogger.validationError(req, error.errors);
      
      const firstError = error.errors[0];
      return res.render('audit/form', {
        title: 'Website Audit',
        user: req.session.user || null,
        error: firstError.message,
        url: req.body.url || ''
      });
    }
    
    // Log unexpected validation error
    errorHandler.logError(error, {
      operation: 'form_validation',
      body: req.body,
      ip: req.ip
    });
    
    return res.render('audit/form', {
      title: 'Website Audit',
      user: req.session.user || null,
      error: 'Invalid form data',
      url: req.body.url || ''
    });
  }
};

/**
 * Get audit progress via Server-Sent Events
 */
export const getAuditProgress = (req, res) => {
  const { sessionId } = req.params;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no' // Disable Nginx buffering
  });

  let connectionClosed = false;
  let intervalId = null;
  let heartbeatId = null;

  // Helper function to safely write to SSE stream
  const safeWrite = (data) => {
    if (connectionClosed || res.destroyed || res.headersSent === false) {
      return false;
    }
    
    try {
      return res.write(data);
    } catch (error) {
      console.warn(`⚠️ SSE write error for session ${sessionId}:`, error.message);
      cleanup();
      return false;
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (connectionClosed) return;
    
    connectionClosed = true;
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    
    if (heartbeatId) {
      clearInterval(heartbeatId);
      heartbeatId = null;
    }
    
    try {
      if (!res.destroyed) {
        res.end();
      }
    } catch (error) {
      console.warn(`⚠️ SSE cleanup error for session ${sessionId}:`, error.message);
    }
  };

  // Send initial connection message
  if (!safeWrite('data: {"type": "connected"}\n\n')) {
    cleanup();
    return;
  }

  const checkProgress = () => {
    if (connectionClosed) {
      cleanup();
      return;
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      safeWrite('data: {"type": "error", "message": "Session not found or expired. Please try again."}\n\n');
      cleanup();
      return;
    }

    // Compose richer progress event
    let progressData = {
      status: session.status,
      message: session.status === 'completed' ? 'Audit complete!' : session.status === 'error' ? session.error : 'Audit in progress...',
      progress: session.progress || (session.status === 'completed' ? 100 : session.status === 'error' ? 0 : 10),
      pageCount: session.pageCount || null,
      totalPages: session.totalPages || null,
      currentUrl: session.currentUrl || null,
      detailedStatus: session.detailedStatus || null,
      phase: session.phase || null
    };

    if (session.status === 'completed') {
      safeWrite(`data: ${JSON.stringify({ ...progressData, type: 'completed', redirectUrl: `/audit/results/${sessionId}` })}\n\n`);
      cleanup();
      return;
    }
    
    if (session.status === 'error') {
      safeWrite(`data: ${JSON.stringify({ ...progressData, type: 'error', message: session.error })}\n\n`);
      cleanup();
      return;
    }
    
    // Send progress update
    safeWrite(`data: ${JSON.stringify(progressData)}\n\n`);
  };

  // Send heartbeat to keep connection alive
  const sendHeartbeat = () => {
    if (connectionClosed) return;
    safeWrite(': heartbeat\n\n');
  };

  // Initial progress check
  checkProgress();
  
  // Set up intervals
  intervalId = setInterval(checkProgress, 2000);
  heartbeatId = setInterval(sendHeartbeat, 30000); // Heartbeat every 30 seconds

  // Handle client disconnect
  req.on('close', () => {
    console.log(`🔌 SSE client disconnected for session: ${sessionId}`);
    cleanup();
  });

  // Handle request abort
  req.on('aborted', () => {
    console.log(`🚫 SSE request aborted for session: ${sessionId}`);
    cleanup();
  });

  // Handle response errors
  res.on('error', (error) => {
    console.warn(`⚠️ SSE response error for session ${sessionId}:`, error.message);
    cleanup();
  });

  // Handle response close
  res.on('close', () => {
    console.log(`📡 SSE response closed for session: ${sessionId}`);
    cleanup();
  });
};

/**
 * Get audit status (fallback for when SSE fails)
 */
export const getAuditStatus = (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired',
        status: 'not_found'
      });
    }

    const statusData = {
      status: session.status,
      message: session.status === 'completed' ? 'Audit complete!' : 
               session.status === 'error' ? session.error : 'Audit in progress...',
      progress: session.progress || (session.status === 'completed' ? 100 : session.status === 'error' ? 0 : 10),
      pageCount: session.pageCount || null,
      totalPages: session.totalPages || null,
      currentUrl: session.currentUrl || null,
      detailedStatus: session.detailedStatus || null,
      phase: session.phase || null,
      timestamp: new Date().toISOString()
    };

    if (session.status === 'error') {
      statusData.error = session.error;
    }

    res.json(statusData);
  } catch (error) {
    console.error('Error getting audit status:', error);
    res.status(500).json({
      error: 'Failed to get audit status',
      status: 'error'
    });
  }
};

/**
 * Display audit results
 */
export const getAuditResults = async (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);

  // Get user information for tier data
  const userId = req.session?.user?.id || null;

  console.log(`🔍 Checking session ${sessionId}:`, {
    sessionExists: !!session,
    sessionStatus: session?.status,
    totalActiveSessions: activeSessions.size,
    sessionKeys: Array.from(activeSessions.keys()).slice(-5) // Show last 5 session IDs
  });

  if (!session) {
    console.log(`❌ Session ${sessionId} not found. Active sessions:`, Array.from(activeSessions.keys()));
    return res.render('audit/error', {
      title: 'Results Not Found',
      user: req.session.user || null,
      error: 'Audit results not found or have expired. Please try running the audit again.'
    });
  }

  if (session.status !== 'completed') {
    if (session.status === 'error') {
      console.log(`❌ Session ${sessionId} has error:`, session.error);
      return res.render('audit/error', {
        title: 'Audit Failed',
        user: req.session.user || null,
        error: `Audit failed: ${session.error || 'Unknown error occurred'}`
      });
    }
    
    console.log(`🔄 Session ${sessionId} is ${session.status}, redirecting to progress page`);
    return res.redirect(`/audit/progress/${sessionId}`);
  }

  // If we have an audit ID, try to get fresh data from database
  if (session.auditId) {
    try {
      const auditRecord = await Audit.findById(session.auditId);
      if (auditRecord && auditRecord.status === 'completed' && auditRecord.report_data) {
        console.log(`📊 Retrieved audit ${session.auditId} from database`);
        // Use database data if available
        session.result = auditRecord.report_data;
      }
    } catch (dbError) {
      console.error('❌ Failed to retrieve audit from database:', dbError.message);
      // Fall back to session data
    }
  }

  // If we have cached results (from cache hit), render directly
  if (session.fromCache && session.result) {
    console.log(`📋 Rendering cached report for ${session.url}`);
    
    // Clean up session after rendering (no longer needed for cache hits)
    setTimeout(() => {
      activeSessions.delete(sessionId);
      console.log(`🧹 Cleaned up cache session ${sessionId}`);
    }, 1000); // Small delay to ensure response is sent
    
    // Get tier information for rendering
    const userTier = await tierService.getUserTier(userId);
    const userUsage = userId ? await tierService.getCurrentUsage(userId) : null;
    
    return res.render('audit/results-simple', {
      title: `Simple Report - ${session.url}`,
      user: req.session.user || null,
      userTier,
      userUsage,
      data: session.result,
      url: session.url,
      fromCache: true,
      auditId: session.auditId,
      timestamp: session.timestamp
    });
  }

  const reportType = session.reportType || 'simple';
  
  if (reportType === 'simple') {
    return res.redirect(`/audit/simple/${encodeURIComponent(session.url)}`);
  } else {
    return res.redirect(`/audit/full/${encodeURIComponent(session.url)}`);
  }
};

/**
 * Display simple audit report
 */
export const getSimpleReport = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    
    // Validate domain
    const validatedData = domainParamSchema.parse({ domain });
    const url = validatedData.domain;
    
    // Get user information and tier limits
    const userId = req.session?.user?.id || null;
    const userLimits = await tierService.getUserTierLimits(userId);
    
    // First, try to get existing audit from database
    let reportData = null;
    let fromDatabase = false;
    let auditId = null;
    let timestamp = new Date().toISOString();
    
    try {
      const existingAudit = await Audit.findMostRecentByDomain(url);
      if (existingAudit && existingAudit.status === 'completed' && existingAudit.report_data) {
        console.log(`📊 Using existing simple report for ${url} (ID: ${existingAudit.id})`);
        reportData = existingAudit.report_data;
        fromDatabase = true;
        auditId = existingAudit.id;
        timestamp = existingAudit.created_at;
      }
    } catch (dbError) {
      console.error('❌ Error checking database for existing audit:', dbError.message);
      // Continue with fresh audit if database check fails
    }
    
    // If no recent audit found, run a fresh audit
    if (!reportData) {
      // Check if user can perform a new audit
      const canPerformAudit = await tierService.canPerformAudit(userId);
      
      if (!canPerformAudit.allowed) {
        return res.render('audit/error', {
          title: 'Audit Limit Reached',
          user: req.session.user || null,
          error: canPerformAudit.reason || 'You have reached your audit limit. Please upgrade your plan.'
        });
      }
      
      console.log(`🔄 Running fresh simple audit for ${url}`);
      const maxPages = Math.min(50, userLimits.maxPagesPerAudit);
      
      const result = await auditExecutor.executeAudit(url, maxPages, false, null, {
        isRegistered: !!userId,
        maxExternalLinks: userLimits.maxExternalLinks,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        tierName: userLimits.tierName
      });
      reportData = auditExecutor.generateSimpleReport(result.stateData);
      
      // Record usage for registered users
      if (userId) {
        try {
          await tierService.recordAuditUsage(userId, {
            pagesScanned: result.stateData?.visited?.length || 0,
            externalLinksChecked: Object.keys(result.stateData?.externalLinks || {}).length,
            score: reportData.summary?.score || reportData.overview?.score || 0,
            url,
            reportType: 'simple',
            duration: result.executionTime || 0
          });
        } catch (tierError) {
          console.error('❌ Failed to record audit usage:', tierError.message);
        }
      }
    }
    
    // Get tier information for rendering
    const userTier = await tierService.getUserTier(userId);
    const userUsage = userId ? await tierService.getCurrentUsage(userId) : null;
    
    res.render('audit/results-simple', {
      title: `Simple Report - ${url}`,
      user: req.session.user || null,
      userTier,
      userUsage,
      url,
      data: reportData,
      timestamp,
      fromDatabase,
      auditId,
      userLimits: {
        tierName: userLimits.tierName,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        maxExternalLinks: userLimits.maxExternalLinks
      }
    });
    
  } catch (error) {
    console.error('Simple report error:', error);
    res.render('audit/error', {
      title: 'Report Error',
      user: req.session.user || null,
      error: 'Unable to generate report. Please try again.'
    });
  }
};

/**
 * Display full audit report
 */
export const getFullReport = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    
    // Validate domain
    const validatedData = domainParamSchema.parse({ domain });
    const url = validatedData.domain;
    
    // Get user information and tier limits
    const userId = req.session?.user?.id || null;
    const userLimits = await tierService.getUserTierLimits(userId);
    
    // Get tier information for rendering
    const userTier = await tierService.getUserTier(userId);
    const userUsage = userId ? await tierService.getCurrentUsage(userId) : null;
    
    // Check if user has access to full reports
    if (!userLimits.canAccessFullReports) {
      return res.redirect('/dashboard/upgrade-required?feature=full-reports');
    }
    
    // First, try to get existing audit from database
    let reportData = null;
    let fromDatabase = false;
    let auditId = null;
    let timestamp = new Date().toISOString();
    
    try {
      const existingAudit = await Audit.findMostRecentByDomain(url);
      if (existingAudit && existingAudit.status === 'completed' && existingAudit.report_data) {
        console.log(`📊 Using existing full report for ${url} (ID: ${existingAudit.id})`);
        reportData = existingAudit.report_data;
        fromDatabase = true;
        auditId = existingAudit.id;
        timestamp = existingAudit.created_at;
      }
    } catch (dbError) {
      console.error('❌ Error checking database for existing audit:', dbError.message);
      // Continue with fresh audit if database check fails
    }
    
    // If no recent audit found, run a fresh audit
    if (!reportData) {
      // Check if user can perform a new audit
      const canPerformAudit = await tierService.canPerformAudit(userId);
      
      if (!canPerformAudit.allowed) {
        return res.render('audit/error', {
          title: 'Audit Limit Reached',
          user: req.session.user || null,
          error: canPerformAudit.reason || 'You have reached your audit limit. Please upgrade your plan.'
        });
      }
      
      console.log(`🔄 Running fresh full audit for ${url}`);
      const maxPages = Math.min(100, userLimits.maxPagesPerAudit); // Full reports can scan more pages
      
      const result = await auditExecutor.executeAudit(url, maxPages, true, null, {
        isRegistered: !!userId,
        maxExternalLinks: userLimits.maxExternalLinks,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        tierName: userLimits.tierName
      });
      reportData = auditExecutor.generateDetailedReport(result.stateData);
      
      // Record usage for registered users
      if (userId) {
        try {
          await tierService.recordAuditUsage(userId, {
            pagesScanned: result.stateData?.visited?.length || 0,
            externalLinksChecked: Object.keys(result.stateData?.externalLinks || {}).length,
            score: reportData.summary?.score || reportData.overview?.score || 0,
            url,
            reportType: 'full',
            duration: result.executionTime || 0
          });
        } catch (tierError) {
          console.error('❌ Failed to record audit usage:', tierError.message);
        }
      }
    }
    
    res.render('audit/results-full', {
      title: `Full Report - ${url}`,
      user: req.session.user || null,
      userTier,
      userUsage,
      url,
      data: reportData,
      timestamp,
      fromDatabase,
      auditId,
      userLimits: {
        tierName: userLimits.tierName,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        maxExternalLinks: userLimits.maxExternalLinks
      }
    });
    
  } catch (error) {
    console.error('Full report error:', error);
    res.render('audit/error', {
      title: 'Report Error',
      user: req.session.user || null,
      error: 'Unable to generate report. Please try again.'
    });
  }
};

/**
 * Display audit history for a domain (protected route)
 */
export const getAuditHistory = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    
    // Fetch real audit history from database using the new method
    let audits = [];
    let pagination = { page: 1, totalPages: 1, hasNext: false, hasPrev: false, totalCount: 0 };
    
    try {
      const result = await Audit.getAuditsByDomain(domain, {
        page,
        limit,
        userId: req.session.user ? req.session.user.id : null,
        status,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      audits = result.audits;
      pagination = result.pagination;
      
      console.log(`📊 Found ${audits.length} audits for domain ${domain}`);
    } catch (dbError) {
      console.error('❌ Error fetching audit history:', dbError.message);
      // Fall back to empty array if database error
    }
    
    res.render('audit/history-list', {
      title: `Audit History - ${domain}`,
      user: req.session.user,
      domain,
      audits: audits.map(audit => ({
        ...audit,
        formatted: new Date(audit.created_at).toLocaleString()
      })),
      pagination,
      currentPage: page,
      currentStatus: status,
      message: audits.length === 0 ? 'No audits found for this domain.' : null
    });
    
  } catch (error) {
    console.error('History error:', error);
    res.render('audit/error', {
      title: 'History Error',
      user: req.session.user || null,
      error: 'Unable to load audit history.'
    });
  }
};

/**
 * Display all user audits (protected route)
 */
export const getUserAudits = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    
    // Fetch user audits from database
    let audits = [];
    let pagination = { page: 1, totalPages: 1, hasNext: false, hasPrev: false, totalCount: 0 };
    
    try {
      const result = await Audit.getUserAudits(req.session.user.id, {
        page,
        limit,
        status,
        sortBy,
        sortOrder
      });
      
      audits = result.audits;
      pagination = result.pagination;
      
      console.log(`📊 Found ${audits.length} audits for user ${req.session.user.id}`);
    } catch (dbError) {
      console.error('❌ Error fetching user audits:', dbError.message);
      // Fall back to empty array if database error
    }
    
    res.render('audit/user-audits', {
      title: 'My Audits',
      user: req.session.user,
      audits,
      pagination,
      currentPage: page,
      currentStatus: status,
      currentSort: { by: sortBy, order: sortOrder }
    });
    
  } catch (error) {
    console.error('User audits error:', error);
    res.render('audit/error', {
      title: 'Audits Error',
      user: req.session.user || null,
      error: 'Unable to load your audits.'
    });
  }
};

/**
 * Display historical simple report (protected route)
 */
export const getHistoricalSimpleReport = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    const auditId = parseInt(req.params.auditId);
    const userId = req.session?.user?.id;

    // Get tier information for rendering
    const userTier = await tierService.getUserTier(userId);
    const userUsage = userId ? await tierService.getCurrentUsage(userId) : null;
    
    if (!auditId || isNaN(auditId)) {
      return res.render('audit/error', {
        title: 'Invalid Audit',
        user: req.session.user || null,
        error: 'Invalid audit ID provided.'
      });
    }
    
    // Fetch specific historical report from database
    let auditRecord = null;
    try {
      auditRecord = await Audit.findById(auditId, req.session.user ? req.session.user.id : null);
      
      if (!auditRecord) {
        return res.render('audit/error', {
          title: 'Audit Not Found',
          user: req.session.user || null,
          error: 'The requested audit was not found or you do not have permission to view it.'
        });
      }
      
      if (auditRecord.status !== 'completed' || !auditRecord.report_data) {
        return res.render('audit/error', {
          title: 'Audit Incomplete',
          user: req.session.user || null,
          error: 'The requested audit is incomplete or failed.'
        });
      }
    } catch (dbError) {
      console.error('❌ Error fetching historical audit:', dbError.message);
      return res.render('audit/error', {
        title: 'Database Error',
        user: req.session.user || null,
        error: 'Unable to retrieve the requested audit report.'
      });
    }
    
    res.render('audit/results-simple', {
      title: `Historical Simple Report - ${domain}`,
      user: req.session.user || null,
      userTier,
      userUsage,
      url: auditRecord.url,
      data: auditRecord.report_data,
      timestamp: auditRecord.created_at,
      fromDatabase: true,
      auditId: auditRecord.id,
      isHistorical: true
    });
    
  } catch (error) {
    console.error('Historical simple report error:', error);
    res.render('audit/error', {
      title: 'Report Error',
      user: req.session.user || null,
      error: 'Unable to load historical report.'
    });
  }
};

/**
 * Display historical full report (protected route)
 */
export const getHistoricalFullReport = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    const auditId = parseInt(req.params.auditId);
    const userId = req.session?.user?.id;

    // Get user information and tier limits
    const userLimits = await tierService.getUserTierLimits(userId);
    
    // Check if user has access to full reports
    if (!userLimits.canAccessFullReports) {
      return res.redirect('/dashboard/upgrade-required?feature=full-reports');
    }

    // Get tier information for rendering
    const userTier = await tierService.getUserTier(userId);
    const userUsage = userId ? await tierService.getCurrentUsage(userId) : null;
    
    if (!auditId || isNaN(auditId)) {
      return res.render('audit/error', {
        title: 'Invalid Audit',
        user: req.session.user || null,
        error: 'Invalid audit ID provided.'
      });
    }
    
    // Fetch specific historical report from database
    let auditRecord = null;
    try {
      auditRecord = await Audit.findById(auditId, req.session.user ? req.session.user.id : null);
      
      if (!auditRecord) {
        return res.render('audit/error', {
          title: 'Audit Not Found',
          user: req.session.user || null,
          error: 'The requested audit was not found or you do not have permission to view it.'
        });
      }
      
      if (auditRecord.status !== 'completed' || !auditRecord.report_data) {
        return res.render('audit/error', {
          title: 'Audit Incomplete',
          user: req.session.user || null,
          error: 'The requested audit is incomplete or failed.'
        });
      }
    } catch (dbError) {
      console.error('❌ Error fetching historical audit:', dbError.message);
      return res.render('audit/error', {
        title: 'Database Error',
        user: req.session.user || null,
        error: 'Unable to retrieve the requested audit report.'
      });
    }
    
    res.render('audit/results-full', {
      title: `Historical Full Report - ${domain}`,
      user: req.session.user || null,
      userTier,
      userUsage,
      url: auditRecord.url,
      data: auditRecord.report_data,
      timestamp: auditRecord.created_at,
      fromDatabase: true,
      auditId: auditRecord.id,
      isHistorical: true
    });
    
  } catch (error) {
    console.error('Historical full report error:', error);
    res.render('audit/error', {
      title: 'Report Error',
      user: req.session.user || null,
      error: 'Unable to load historical report.'
    });
  }
};

/**
 * Validation middleware for audit requests
 */
export const validateAuditRequest = (req, res, next) => {
  try {
    const validatedData = auditRequestSchema.parse(req.body);
    req.validatedData = validatedData;
    
    // Log successful validation
    auditLogger.userAction('form_submitted', req.session.user, {
      domain: validatedData.url,
      ip: req.ip
    });
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation error
      webLogger.validationError(req, error.errors);
      
      const firstError = error.errors[0];
      return res.render('audit/form', {
        title: 'Website Audit',
        user: req.session.user || null,
        error: firstError.message,
        url: req.body.url || ''
      });
    }
    
    // Log unexpected validation error
    errorHandler.logError(error, {
      operation: 'form_validation',
      body: req.body,
      ip: req.ip
    });
    
    return res.render('audit/form', {
      title: 'Website Audit',
      user: req.session.user || null,
      error: 'Invalid form data',
      url: req.body.url || ''
    });
  }
};

/**
 * Validation middleware for domain parameters
 */
export const validateDomainParam = (req, res, next) => {
  try {
    const validatedData = domainParamSchema.parse(req.params);
    req.validatedDomain = validatedData.domain;
    next();
  } catch (error) {
    return res.render('audit/error', {
      title: 'Invalid Domain',
      user: req.session.user || null,
      error: 'Invalid domain format provided'
    });
  }
};

/**
 * Download PDF report for a domain
 */
export const downloadPDFReport = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    
    // Validate domain
    const validatedData = domainParamSchema.parse({ domain });
    const url = validatedData.domain;
    
    // First, try to get existing audit from database
    let reportData = null;
    let auditId = null;
    
    try {
      const existingAudit = await Audit.findMostRecentByDomain(url);
      if (existingAudit && existingAudit.status === 'completed' && existingAudit.report_data) {
        console.log(`📋 Generating PDF for existing audit: ${url} (ID: ${existingAudit.id})`);
        reportData = existingAudit.report_data;
        auditId = existingAudit.id;
      }
    } catch (dbError) {
      console.error('❌ Error checking database for existing audit:', dbError.message);
    }
    
    // If no recent audit found, run a fresh audit
    if (!reportData) {
      console.log(`🔄 Running fresh audit for PDF generation: ${url}`);
      const userLimits = {
        isRegistered: !!(req.session && req.session.user),
        maxExternalLinks: (req.session && req.session.user) ? -1 : 20
      };
      
      const result = await auditExecutor.executeAudit(url, 100, false, null, userLimits);
      reportData = auditExecutor.generateFullReport(result.stateData);
    }
    
    // Generate PDF
    const pdfBuffer = await pdfService.generatePDFFromData(reportData, {
      includeDetailed: true,
      brandColor: '#007bff'
    });
    
    // Clean domain name for filename
    const cleanDomain = url.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `domain-audit-${cleanDomain}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
    console.log(`✅ PDF downloaded successfully for ${url}`);
    
  } catch (error) {
    console.error('❌ PDF download failed:', error);
    
    // Return error page
    res.status(500).render('audit/error', {
      title: 'PDF Generation Failed',
      user: req.session.user || null,
      error: 'Failed to generate PDF report. Please try again later.'
    });
  }
};

/**
 * Download PDF report for historical audit
 */
export const downloadHistoricalPDFReport = async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    const auditId = parseInt(req.params.auditId);
    
    // Validate parameters
    const validatedData = domainParamSchema.parse({ domain });
    const url = validatedData.domain;
    
    if (!auditId || isNaN(auditId)) {
      return res.status(400).render('audit/error', {
        title: 'Invalid Audit ID',
        user: req.session.user || null,
        error: 'Invalid audit ID provided'
      });
    }
    
    // Find the specific historical audit
    const audit = await Audit.findByIdAndDomain(auditId, url);
    
    if (!audit) {
      return res.status(404).render('audit/error', {
        title: 'Audit Not Found',
        user: req.session.user || null,
        error: 'The requested audit could not be found'
      });
    }
    
    if (audit.status !== 'completed' || !audit.report_data) {
      return res.status(400).render('audit/error', {
        title: 'Incomplete Audit',
        user: req.session.user || null,
        error: 'This audit is not complete or has no report data'
      });
    }
    
    console.log(`📋 Generating PDF for historical audit: ${url} (ID: ${auditId})`);
    
    // Generate PDF from historical data
    const pdfBuffer = await pdfService.generatePDFFromData(audit.report_data, {
      includeDetailed: true,
      brandColor: '#007bff'
    });
    
    // Clean domain name for filename
    const cleanDomain = url.replace(/[^a-zA-Z0-9.-]/g, '_');
    const auditDate = new Date(audit.created_at).toISOString().split('T')[0];
    const filename = `domain-audit-${cleanDomain}-${auditDate}-${auditId}.pdf`;
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
    console.log(`✅ Historical PDF downloaded successfully for ${url} (ID: ${auditId})`);
    
  } catch (error) {
    console.error('❌ Historical PDF download failed:', error);
    
    // Return error page
    res.status(500).render('audit/error', {
      title: 'PDF Generation Failed',
      user: req.session.user || null,
      error: 'Failed to generate PDF report. Please try again later.'
    });
  }
};
