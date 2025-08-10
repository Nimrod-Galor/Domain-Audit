/**
 * ============================================================================
 * AUDIT EXECUTOR - DIRECT MODULE INTEGRATION
 * ============================================================================
 * 
 * Direct integration with the domain audit tool using ES6 module imports.
 * Provides real-time progress updates and structured data for EJS templates.
 * 
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { runCrawl } from '../../lib/crawler.js';
import { loadState } from '../../src/core/compressed-state-manager.js';
import { CompressedPageDataManager } from '../../src/storage/compressed-page-data-manager.js';
import { extractMainDomain } from '../../src/utils/core-utils.js';
import path from 'path';
import { EventEmitter } from 'events';
import { auditLogger, errorHandler } from './logger.js';
import { Audit } from '../models/Audit.js';

export class AuditExecutor extends EventEmitter {
  constructor() {
    super();
    this.currentAudit = null;
    this.isRunning = false;
  }

  /**
   * Execute audit with real-time progress updates
   * @param {string} domain - Domain to audit
   * @param {number} maxPages - Maximum pages to crawl (default: 50)
   * @param {boolean} forceNew - Force new audit (default: false)
   * @param {string} sessionId - Optional session ID for tracking
   * @param {Object} userLimits - User-specific limits { isRegistered: boolean, maxExternalLinks: number }
   * @returns {Promise<Object>} Audit results
   */
  async executeAudit(domain, maxPages = 50, forceNew = false, sessionId = null, userLimits = {}) {
    if (this.isRunning) {
      throw new Error('Audit already in progress');
    }

    // Set default limits for unregistered users
    const limits = {
      isRegistered: userLimits.isRegistered || false,
      maxExternalLinks: userLimits.maxExternalLinks || (userLimits.isRegistered ? -1 : 10) // -1 = unlimited, 10 for unregistered
    };

    this.isRunning = true;
    const auditSessionId = sessionId || (Date.now() + '-' + Math.random().toString(36).substr(2, 9));
    
    // Create audit record in database first
    let auditId = null;
    try {
      const auditRecord = await Audit.create({
        url: domain,
        type: 'simple',
        config: {
          maxPages,
          userLimits: limits
        }
      });
      auditId = auditRecord.id;
      console.log(`📝 Created audit record in database: ID ${auditId}`);
    } catch (dbError) {
      console.warn(`⚠️ Could not create audit record in database: ${dbError.message}`);
    }
    
    this.currentAudit = {
      sessionId: auditSessionId,
      domain,
      startTime: Date.now(),
      status: 'starting',
      userLimits: limits,
      auditId: auditId  // Add the database audit ID
    };

    // Log audit start with user limits
    auditLogger.auditStarted(auditSessionId, domain, {
      maxPages,
      forceNew,
      reportType: 'unknown', // Will be set by route
      userLimits: limits
    });

    try {
      // Set environment variable to skip HTML generation
      process.env.SKIP_HTML_REPORT = 'true';

      // Emit progress updates
      this.emit('progress', {
        sessionId: auditSessionId,
        status: 'starting',
        message: `Starting audit for ${domain}`,
        progress: 0
      });

      // Execute the crawl with progress monitoring
      const auditResult = await this.runCrawlWithProgress(domain, maxPages, forceNew);
      
      // Emit analyzing status
      this.emit('progress', {
        sessionId: auditSessionId,
        status: 'analyzing',
        message: 'Analyzing website data...',
        progress: 90,
        currentUrl: null,
        detailedStatus: 'Processing collected data'
      });
      
      // Add delay to ensure files are fully written
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      
      // Load the state data using the normalized domain hostname
      let hostname = domain;
      if (domain.includes('://')) {
        const url = new URL(domain);
        hostname = url.hostname;
      }
      
      // Retry mechanism for loading state data
      let stateData = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!stateData && attempts < maxAttempts) {
        attempts++;
        try {
          stateData = await this.loadAuditState(hostname);
          if (stateData && Object.keys(stateData.stats || {}).length > 0) {
            break; // Successfully loaded valid data
          }
        } catch (error) {
          console.log(`Attempt ${attempts} to load state failed:`, error.message);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
          }
        }
      }
      
      if (!stateData) {
        throw new Error('Failed to load audit state data after multiple attempts');
      }
      
      // Emit finalizing status
      this.emit('progress', {
        sessionId: auditSessionId,
        status: 'finalizing',
        message: 'Generating final report...',
        progress: 95,
        currentUrl: null,
        detailedStatus: 'Compiling results'
      });
      
      // Combine results
      const finalResult = {
        ...auditResult,
        stateData,
        executionTime: Date.now() - this.currentAudit.startTime,
        timestamp: new Date().toISOString(),
        sessionId: auditSessionId
      };

      // Clean up audit files after successful data extraction (database-first approach)
      if (process.env.SKIP_HTML_REPORT === 'true') {
        try {
          await this.cleanupAuditFiles(hostname);
          console.log('🗑️ Audit files cleaned up after database storage');
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup audit files:', cleanupError.message);
          // Don't fail the audit if cleanup fails
        }
      }

      // Log successful completion
      auditLogger.auditCompleted(auditSessionId, domain, {
        duration: finalResult.executionTime,
        pagesAnalyzed: stateData.visited?.length || 0,
        linksFound: Object.keys(stateData.externalLinks || {}).length,
        status: 'success'
      });

      this.emit('progress', {
        sessionId: auditSessionId,
        status: 'completed',
        message: 'Audit completed successfully',
        progress: 100,
        result: finalResult
      });

      return finalResult;

    } catch (error) {
      // Log audit failure
      auditLogger.auditFailed(auditSessionId, domain, error);
      errorHandler.logError(error, {
        sessionId: auditSessionId,
        domain,
        maxPages,
        operation: 'executeAudit'
      });

      this.emit('progress', {
        sessionId: auditSessionId,
        status: 'error',
        message: `Audit failed: ${error.message}`,
        progress: 0,
        error: error.message
      });
      throw error;
    } finally {
      this.isRunning = false;
      this.currentAudit = null;
      delete process.env.SKIP_HTML_REPORT;
      
      // Clean up any hanging connections to prevent resource leaks
      // Don't use setImmediate in server environment as it can cause termination
      this.cleanupConnections();
    }
  }

  /**
   * Execute crawl with progress monitoring
   */
  async runCrawlWithProgress(domain, maxPages, forceNew) {
    // Normalize domain to ensure consistent handling
    let normalizedDomain = domain;
    if (!domain.includes('://')) {
      normalizedDomain = `https://${domain}`;
    }
    
    // Hook into console.log to capture progress
    const originalConsoleLog = console.log;
    let pageCount = 0;
    let totalPages = maxPages;
    let lastProgressMessage = '';
    let lastExternalLinkMessage = '';
    let externalLinksStarted = false;
    let discoveryPhaseCompleted = false;
    let lastProgressTime = Date.now();

    console.log = (...args) => {
      const message = args.join(' ');
      const now = Date.now();
      
      // Prevent duplicate messages within 500ms (reduce aggressive filtering)
      if (message === lastProgressMessage && (now - lastProgressTime) < 500) {
        originalConsoleLog.apply(console, args);
        return;
      }
      
      // Parse different types of progress messages with enhanced URL tracking
      if (message.includes('Processing') && message.includes(':')) {
        pageCount++;
        // Extract URL from message like "[Worker 1] Processing 3 (6 left): https://example.com/page"
        const urlMatch = message.match(/Processing \d+.*?:\s*(https?:\/\/[^\s]+)/);
        const currentUrl = urlMatch ? urlMatch[1] : 'Unknown URL';
        
        // Extract page numbers for better progress calculation
        const numberMatch = message.match(/Processing (\d+) \((\d+) left\)/);
        const currentPageNum = numberMatch ? parseInt(numberMatch[1]) : pageCount;
        const leftCount = numberMatch ? parseInt(numberMatch[2]) : 0;
        
        // More conservative progress calculation to prevent jumps
        const progressBase = Math.min((currentPageNum / Math.max(totalPages, currentPageNum + leftCount)) * 75, 75);
        
        lastProgressMessage = message;
        lastProgressTime = now;
        this.emit('progress', {
          sessionId: this.currentAudit?.sessionId,
          status: 'crawling',
          message: `Processing page ${currentPageNum}/${Math.max(totalPages, currentPageNum + leftCount)}`,
          progress: progressBase,
          currentUrl: currentUrl,
          detailedStatus: `Queued for processing (${leftCount} remaining)`,
          pageCount: currentPageNum,
          totalPages: Math.max(totalPages, currentPageNum + leftCount),
          phase: 'queueing'
        });
      } else if (message.includes('Crawling:')) {
        // Extract URL from message like "Crawling: https://example.com/page"
        const urlMatch = message.match(/Crawling:\s*(https?:\/\/[^\s]+)/);
        const currentUrl = urlMatch ? urlMatch[1] : 'Unknown URL';
        
        lastProgressMessage = message;
        lastProgressTime = now;
        this.emit('progress', {
          sessionId: this.currentAudit?.sessionId,
          status: 'crawling',
          message: `Downloading page content...`,
          progress: Math.min((pageCount / totalPages) * 75, 75),
          currentUrl: currentUrl,
          detailedStatus: 'Downloading HTML content',
          pageCount,
          totalPages,
          phase: 'downloading'
        });
      } else if (message.includes('Analytics:') && message.includes('https://')) {
        // Extract URL from message like "📊 Analytics: A (144/100) - https://example.com"
        const urlMatch = message.match(/Analytics:.*?-\s*(https?:\/\/[^\s]+)/);
        const currentUrl = urlMatch ? urlMatch[1] : 'Unknown URL';
        
        // Extract analytics score if available
        const scoreMatch = message.match(/Analytics:\s*([A-F])\s*\((\d+)\/(\d+)\)/);
        let analyticsInfo = 'Analyzing content';
        if (scoreMatch) {
          const grade = scoreMatch[1];
          const score = scoreMatch[2];
          analyticsInfo = `Analyzing content (Score: ${grade} - ${score}pts)`;
        }
        
        lastProgressMessage = message;
        lastProgressTime = now;
        this.emit('progress', {
          sessionId: this.currentAudit?.sessionId,
          status: 'crawling',
          message: `Analyzing page content...`,
          progress: Math.min((pageCount / totalPages) * 75, 75),
          currentUrl: currentUrl,
          detailedStatus: analyticsInfo,
          pageCount,
          totalPages,
          phase: 'analyzing'
        });
      } else if (message.includes('External Link Check') && message.includes(':')) {
        // Extract external link info from message like "External Link Check (1/50): https://external.com"
        const linkMatch = message.match(/External Link Check \((\d+)\/(\d+)\):\s*(https?:\/\/[^\s]+)/);
        if (linkMatch) {
          const currentLinkNum = parseInt(linkMatch[1]);
          const totalLinks = parseInt(linkMatch[2]);
          const currentUrl = linkMatch[3];
          
          // Extract domain from URL for better display
          let displayDomain = currentUrl;
          try {
            const urlObj = new URL(currentUrl);
            displayDomain = urlObj.hostname;
          } catch (e) {
            // Keep original URL if parsing fails
          }
          
          lastProgressMessage = message;
          lastProgressTime = now;
          this.emit('progress', {
            sessionId: this.currentAudit?.sessionId,
            status: 'external_links',
            message: `Checking external link ${currentLinkNum}/${totalLinks}`,
            progress: 75 + Math.min((currentLinkNum / totalLinks) * 20, 20), // 75-95% for external links
            currentUrl: currentUrl,
            detailedStatus: `Validating link to ${displayDomain}`,
            pageCount: currentLinkNum,
            totalPages: totalLinks,
            phase: 'external_validation'
          });
        }
      } else if ((message.includes('Checking External Links') || message.includes('--- Checking External Links')) && !externalLinksStarted) {
        // Only emit this once when external links checking starts
        externalLinksStarted = true;
        lastProgressMessage = message;
        lastProgressTime = now;
        this.emit('progress', {
          sessionId: this.currentAudit?.sessionId,
          status: 'external_links',
          message: 'Starting external link validation...',
          progress: 75,
          currentUrl: null,
          detailedStatus: 'Preparing external link checks',
          phase: 'external_init'
        });
      } else if (message.includes('External link') && (message.includes('OK') || message.includes('FAILED') || message.includes('TIMEOUT'))) {
        // Extract status from messages like "External link https://example.com: OK (200)" or "External link https://example.com: FAILED (404)"
        const statusMatch = message.match(/External link (https?:\/\/[^\s:]+):\s*(OK|FAILED|TIMEOUT)(?:\s*\((\d+)\))?/);
        if (statusMatch && message !== lastExternalLinkMessage) {
          const linkUrl = statusMatch[1];
          const status = statusMatch[2];
          const statusCode = statusMatch[3];
          
          let statusText = status;
          if (statusCode) {
            statusText = `${status} (${statusCode})`;
          }
          
          lastExternalLinkMessage = message;
          lastProgressTime = now;
          this.emit('progress', {
            sessionId: this.currentAudit?.sessionId,
            status: 'external_links',
            message: `External link validation completed`,
            progress: 85, // Keep progress steady during individual validations
            currentUrl: linkUrl,
            detailedStatus: `Link status: ${statusText}`,
            phase: 'external_result'
          });
        }
      } else if (message.includes('Audit completed') || message.includes('completed successfully')) {
        lastProgressMessage = message;
        lastProgressTime = now;
        this.emit('progress', {
          sessionId: this.currentAudit?.sessionId,
          status: 'finalizing',
          message: 'Finalizing audit results...',
          progress: 95,
          currentUrl: null,
          detailedStatus: 'Generating report',
          phase: 'finalizing'
        });
      } else if (message.includes('Found') && message.includes('pages') && !discoveryPhaseCompleted) {
        // Extract page count from messages like "Found 25 pages to crawl"
        const pageMatch = message.match(/Found (\d+) pages/);
        if (pageMatch) {
          discoveryPhaseCompleted = true;
          const discoveredPages = parseInt(pageMatch[1]);
          totalPages = Math.max(totalPages, discoveredPages);
          lastProgressMessage = message;
          lastProgressTime = now;
          this.emit('progress', {
            sessionId: this.currentAudit?.sessionId,
            status: 'crawling',
            message: `Discovered ${discoveredPages} pages to analyze`,
            progress: 5,
            currentUrl: null,
            detailedStatus: `Found ${discoveredPages} pages to crawl`,
            totalPages: discoveredPages,
            phase: 'discovery'
          });
        }
      } else if (message.includes('Worker') && message.includes('finished')) {
        // Only emit worker completion if it's a different message and not too frequent
        if (message !== lastProgressMessage) {
          lastProgressMessage = message;
          lastProgressTime = now;
          this.emit('progress', {
            sessionId: this.currentAudit?.sessionId,
            status: 'crawling',
            message: 'Worker completed processing...',
            progress: Math.min((pageCount / totalPages) * 75, 75),
            currentUrl: null,
            detailedStatus: 'Worker thread completed',
            pageCount,
            totalPages,
            phase: 'worker_complete'
          });
        }
      }
      
      // Call original console.log
      originalConsoleLog.apply(console, args);
    };

    try {
      // Execute the actual crawl with normalized domain and user limits
      await runCrawl(normalizedDomain, maxPages, forceNew, this.currentAudit?.userLimits || {});
      
      return {
        domain: normalizedDomain,
        maxPages,
        status: 'completed'
      };
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
    }
  }

  /**
   * Load audit state data from compressed files
   */
  async loadAuditState(domain) {
    // Domain should already be normalized at this point (hostname only)
    const mainDomain = extractMainDomain(domain);
    // Use correct path to audits directory
    const auditDir = path.resolve('audits', mainDomain);
    let stateFile;
    
    try {
      console.log(`Domain: ${domain} -> MainDomain: ${mainDomain}`);
      console.log(`Loading audit state from: ${auditDir}`);
      
      // Find the most recent audit directory
      const fs = await import('fs');
      const auditDirs = fs.readdirSync(auditDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('audit-'))
        .map(dirent => dirent.name)
        .sort((a, b) => b.localeCompare(a)); // Sort descending to get most recent first
      
      if (auditDirs.length === 0) {
        throw new Error('No audit directories found');
      }
      
      const latestAuditDir = path.join(auditDir, auditDirs[0]);
      stateFile = path.join(latestAuditDir, `${auditDirs[0]}-crawl-state.json.gz`);
      
      console.log(`Latest audit directory: ${latestAuditDir}`);
      console.log(`State file: ${stateFile}`);
      
      // Initialize containers for state data
      const visited = new Set();
      const queue = new Set();
      const stats = {};
      const badRequests = {};
      const externalLinks = {};
      const mailtoLinks = {};
      const telLinks = {};
      const pageDataManager = new CompressedPageDataManager(latestAuditDir);

      // Load state
      const loaded = loadState(
        stateFile,
        visited,
        queue,
        stats,
        badRequests,
        externalLinks,
        mailtoLinks,
        telLinks,
        pageDataManager
      );

      if (!loaded) {
        throw new Error('Failed to load audit state data');
      }

      return {
        visited: Array.from(visited),
        queue: Array.from(queue),
        stats,
        badRequests,
        externalLinks,
        mailtoLinks,
        telLinks,
        pageDataManager: {
          size: pageDataManager.size,
          compressionStats: pageDataManager.getCompressionStats()
        }
      };
    } catch (error) {
      console.error('Error loading audit state:', error);
      errorHandler.logError(error, {
        domain,
        operation: 'loadAuditState',
        auditDir,
        stateFile: stateFile || 'unknown'
      });
      throw new Error(`Failed to load audit data: ${error.message}`);
    }
  }

  /**
   * Generate simple report data for basic view
   */
  generateSimpleReport(stateData) {
    const { stats, badRequests, externalLinks, mailtoLinks, telLinks, visited } = stateData;
    
    // Calculate basic statistics
    const totalPages = visited.length;
    const totalInternalLinks = Object.keys(stats).length;
    const totalExternalLinks = Object.keys(externalLinks).length;
    const brokenLinks = Object.keys(badRequests).length;
    
    // External link status summary
    let okLinks = 0;
    let brokenExternal = 0;
    let timeoutLinks = 0;
    
    Object.values(externalLinks).forEach(link => {
      if (typeof link.status === 'number' && link.status >= 200 && link.status < 300) {
        okLinks++;
      } else if (link.status === 'TIMEOUT') {
        timeoutLinks++;
      } else {
        brokenExternal++;
      }
    });

    return {
      summary: {
        totalPages,
        totalInternalLinks,
        totalExternalLinks,
        brokenLinks,
        okLinks,
        brokenExternal,
        timeoutLinks
      },
      detailed: {
        allStats: stats,
        allBadRequests: badRequests,
        allExternalLinks: externalLinks,
        mailtoLinks: mailtoLinks,
        telLinks: telLinks
      },
      topIssues: this.extractTopIssues(stateData),
      recentPages: visited.slice(-5) // Last 5 pages crawled
    };
  }

  /**
   * Generate full report data for detailed view
   */
  generateFullReport(stateData) {
    const simpleReport = this.generateSimpleReport(stateData);
    
    return {
      simple: simpleReport,
      detailed: {
        ...simpleReport.detailed,
        compressionInfo: stateData.pageDataManager
      }
    };
  }

  /**
   * Extract top issues for simple report
   */
  extractTopIssues(stateData) {
    const issues = [];
    
    // Top broken internal links
    Object.entries(stateData.badRequests).slice(0, 5).forEach(([url, data]) => {
      issues.push({
        type: 'broken_internal',
        url,
        status: data.status,
        severity: 'high'
      });
    });
    
    // Top broken external links
    Object.entries(stateData.externalLinks)
      .filter(([url, data]) => data.status !== 200 && data.status !== 'TIMEOUT')
      .slice(0, 3)
      .forEach(([url, data]) => {
        issues.push({
          type: 'broken_external',
          url,
          status: data.status,
          severity: 'medium'
        });
      });

    return issues.slice(0, 8); // Top 8 issues
  }

  /**
   * Get current audit status
   */
  getCurrentStatus() {
    return {
      isRunning: this.isRunning,
      currentAudit: this.currentAudit
    };
  }

  /**
   * Clean up audit files after data extraction (database-first approach)
   */
  async cleanupAuditFiles(domain) {
    const mainDomain = extractMainDomain(domain);
    const auditDir = path.resolve('audits', mainDomain);
    
    try {
      const fs = await import('fs');
      const fsPromises = fs.promises;
      
      // Check if audit directory exists
      if (!fs.existsSync(auditDir)) {
        console.log(`📁 No audit directory found for ${mainDomain}, nothing to clean`);
        return;
      }
      
      // Find the most recent audit directory (the one we just used)
      const auditDirs = fs.readdirSync(auditDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('audit-'))
        .map(dirent => dirent.name)
        .sort((a, b) => b.localeCompare(a)); // Sort descending to get most recent first
      
      if (auditDirs.length === 0) {
        console.log(`📁 No audit subdirectories found in ${auditDir}`);
        return;
      }
      
      // Remove the most recent audit directory (the one we just processed)
      const latestAuditDir = path.join(auditDir, auditDirs[0]);
      console.log(`🗑️ Cleaning up audit files from: ${latestAuditDir}`);
      
      // Use fs.rm with recursive option to remove the directory and all its contents
      await fsPromises.rm(latestAuditDir, { recursive: true, force: true });
      
      // Check if there are any remaining audit directories
      try {
        const remainingDirs = fs.readdirSync(auditDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('audit-')).length;
        
        // If this was the only audit directory, remove the parent domain directory too
        if (remainingDirs === 0) {
          console.log(`🗑️ Removing empty domain directory: ${auditDir}`);
          await fsPromises.rm(auditDir, { recursive: true, force: true });
        }
      } catch (dirCheckError) {
        // Ignore errors when checking remaining directories
        console.log(`📁 Could not check remaining directories in ${auditDir}`);
      }
      
      console.log(`✅ Successfully cleaned up audit files for ${mainDomain}`);
      
    } catch (error) {
      console.error(`❌ Error cleaning up audit files for ${mainDomain}:`, error.message);
      throw error;
    }
  }

  /**
   * Clean up any hanging connections or resources after audit completion
   * Prevents script hanging due to keep-alive connections
   */
  cleanupConnections() {
    try {
      // Force close any hanging HTTP connections
      // This prevents the script from hanging due to keep-alive connections
      
      // Get active handles and requests for debugging
      const activeHandles = process._getActiveHandles?.() || [];
      const activeRequests = process._getActiveRequests?.() || [];
      
      if (activeHandles.length > 10 || activeRequests.length > 5) {
        console.log(`🧹 Post-audit cleanup: ${activeHandles.length} active handles, ${activeRequests.length} active requests`);
      }

      // Force cleanup of any hanging timers or sockets
      // Look for HTTP sockets and close them
      activeHandles.forEach(handle => {
        try {
          if (handle && typeof handle.destroy === 'function') {
            // Close sockets that might be keeping the process alive
            if (handle.constructor.name === 'Socket' || 
                handle.constructor.name === 'TLSSocket' ||
                handle.constructor.name === 'ClientRequest') {
              handle.destroy();
            }
          }
        } catch (err) {
          // Ignore cleanup errors for individual handles
        }
      });

      // Clear any remaining timeouts/intervals that might be holding the process
      activeRequests.forEach(req => {
        try {
          if (req && typeof req.abort === 'function') {
            req.abort();
          }
        } catch (err) {
          // Ignore cleanup errors for individual requests
        }
      });

      // Give a small delay for cleanup to complete
      // Skip logging in test environment to avoid Jest warnings
      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => {
          console.log('✅ Audit cleanup completed');
        }, 50);
      }
      
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
  }
}

// Export singleton instance
export const auditExecutor = new AuditExecutor();
