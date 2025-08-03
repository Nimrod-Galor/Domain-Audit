/**
 * ============================================================================
 * AUDIT MANAGER MODULE
 * ============================================================================
 * 
 * This module provides comprehensive audit lifecycle management including:
 * - Multiple audits per domain with versioning
 * - Resume capability for incomplete audits
 * - Audit history and comparison
 * - Cleanup and archival management
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AuditComparisonReportGenerator from '../reporting/audit-comparison-report-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audit Manager Class
 */
export class AuditManager {
  constructor(domainName) {
    this.domainName = domainName;
    this.baseAuditDir = path.resolve(__dirname, '..', '..', 'audits', domainName);
    this.auditIndexFile = path.resolve(this.baseAuditDir, 'audit-index.json');
    this.comparisonReportGenerator = new AuditComparisonReportGenerator(this);
    this.ensureAuditDirectory();
  }

  /**
   * Ensure audit directory structure exists
   */
  ensureAuditDirectory() {
    if (!fs.existsSync(this.baseAuditDir)) {
      fs.mkdirSync(this.baseAuditDir, { recursive: true });
    }
  }

  /**
   * Generate unique audit ID with timestamp
   */
  generateAuditId() {
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0]; // YYYY-MM-DD
    const timeStr = timestamp.split('T')[1].split('.')[0].replace(/:/g, '-'); // HH-MM-SS
    return `audit-${dateStr}-${timeStr}`;
  }

  /**
   * Create new audit or resume existing incomplete audit
   */
  createOrResumeAudit(forceNew = false) {
    const auditIndex = this.loadAuditIndex();
    
    // Check for incomplete audits that can be resumed
    if (!forceNew) {
      const incompleteAudit = this.findIncompleteAudit(auditIndex);
      if (incompleteAudit) {
        console.log(`📁 Resuming incomplete audit: ${incompleteAudit.id}`);
        console.log(`   Started: ${new Date(incompleteAudit.startTime).toLocaleString()}`);
        console.log(`   Status: ${incompleteAudit.status}`);
        return this.getAuditPaths(incompleteAudit.id);
      }
    }

    // Create new audit
    const auditId = this.generateAuditId();
    const auditRecord = {
      id: auditId,
      startTime: new Date().toISOString(),
      status: 'in-progress',
      version: '1.0.0',
      domain: this.domainName
    };

    auditIndex.audits.push(auditRecord);
    auditIndex.lastAuditId = auditId;
    auditIndex.totalAudits = auditIndex.audits.length;
    
    this.saveAuditIndex(auditIndex);
    
    console.log(`🚀 Created new audit: ${auditId}`);
    console.log(`   Started: ${new Date(auditRecord.startTime).toLocaleString()}`);
    
    return this.getAuditPaths(auditId);
  }

  /**
   * Find incomplete audit that can be resumed
   */
  findIncompleteAudit(auditIndex) {
    return auditIndex.audits
      .filter(audit => audit.status === 'in-progress')
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
  }

  /**
   * Get audit paths for a specific audit ID
   */
  getAuditPaths(auditId) {
    const auditDir = path.resolve(this.baseAuditDir, auditId);
    
    // Ensure audit directory exists
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    return {
      auditId,
      auditDir,
      stateFile: path.resolve(auditDir, `${auditId}-crawl-state.json`),
      reportFile: path.resolve(auditDir, `${auditId}-crawl-report.html`),
      pageDataDir: path.resolve(auditDir, 'page-data')
    };
  }

  /**
   * Mark audit as completed
   */
  completeAudit(auditId, stats = {}) {
    const auditIndex = this.loadAuditIndex();
    const audit = auditIndex.audits.find(a => a.id === auditId);
    
    if (audit) {
      audit.status = 'completed';
      audit.endTime = new Date().toISOString();
      audit.duration = stats.duration || 0;
      audit.pagesAnalyzed = stats.pagesAnalyzed || 0;
      audit.linksChecked = stats.linksChecked || 0;
      
      this.saveAuditIndex(auditIndex);
      
      console.log(`✅ Audit completed: ${auditId}`);
      console.log(`   Duration: ${this.formatDuration(audit.duration)}`);
      console.log(`   Pages: ${audit.pagesAnalyzed}`);
      console.log(`   Links: ${audit.linksChecked}`);
    }
  }

  /**
   * Mark audit as failed
   */
  failAudit(auditId, error) {
    const auditIndex = this.loadAuditIndex();
    const audit = auditIndex.audits.find(a => a.id === auditId);
    
    if (audit) {
      audit.status = 'failed';
      audit.endTime = new Date().toISOString();
      audit.error = error.message || error;
      
      this.saveAuditIndex(auditIndex);
      
      console.log(`❌ Audit failed: ${auditId}`);
      console.log(`   Error: ${audit.error}`);
    }
  }

  /**
   * List all audits for this domain
   */
  listAudits() {
    const auditIndex = this.loadAuditIndex();
    return auditIndex.audits.map(audit => ({
      ...audit,
      formattedStartTime: new Date(audit.startTime).toLocaleString(),
      formattedEndTime: audit.endTime ? new Date(audit.endTime).toLocaleString() : null,
      formattedDuration: audit.duration ? this.formatDuration(audit.duration) : null
    }));
  }

  /**
   * Get audit statistics
   */
  getAuditStats() {
    const auditIndex = this.loadAuditIndex();
    const completed = auditIndex.audits.filter(a => a.status === 'completed');
    const inProgress = auditIndex.audits.filter(a => a.status === 'in-progress');
    const failed = auditIndex.audits.filter(a => a.status === 'failed');

    return {
      total: auditIndex.audits.length,
      completed: completed.length,
      inProgress: inProgress.length,
      failed: failed.length,
      lastAudit: auditIndex.lastAuditId,
      averageDuration: completed.length > 0 
        ? completed.reduce((sum, a) => sum + (a.duration || 0), 0) / completed.length 
        : 0
    };
  }

  /**
   * Clean up old audits (keep last N audits)
   */
  cleanupOldAudits(keepCount = 10) {
    const auditIndex = this.loadAuditIndex();
    const sortedAudits = auditIndex.audits
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    if (sortedAudits.length <= keepCount) {
      console.log(`📁 No cleanup needed. Current audits: ${sortedAudits.length}, Keep: ${keepCount}`);
      return { cleaned: 0, kept: sortedAudits.length };
    }

    const auditsToKeep = sortedAudits.slice(0, keepCount);
    const auditsToRemove = sortedAudits.slice(keepCount);

    let removedCount = 0;
    for (const audit of auditsToRemove) {
      const auditDir = path.resolve(this.baseAuditDir, audit.id);
      if (fs.existsSync(auditDir)) {
        try {
          fs.rmSync(auditDir, { recursive: true, force: true });
          removedCount++;
          console.log(`🗑️  Removed old audit: ${audit.id}`);
        } catch (error) {
          console.warn(`⚠️  Failed to remove audit ${audit.id}: ${error.message}`);
        }
      }
    }

    // Update audit index
    auditIndex.audits = auditsToKeep;
    auditIndex.totalAudits = auditsToKeep.length;
    this.saveAuditIndex(auditIndex);

    console.log(`🧹 Cleanup completed. Removed: ${removedCount}, Kept: ${auditsToKeep.length}`);
    return { cleaned: removedCount, kept: auditsToKeep.length };
  }

  /**
   * Load audit index
   */
  loadAuditIndex() {
    if (!fs.existsSync(this.auditIndexFile)) {
      return {
        domain: this.domainName,
        audits: [],
        totalAudits: 0,
        lastAuditId: null,
        created: new Date().toISOString()
      };
    }

    try {
      const raw = fs.readFileSync(this.auditIndexFile, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`⚠️  Failed to load audit index: ${error.message}`);
      return {
        domain: this.domainName,
        audits: [],
        totalAudits: 0,
        lastAuditId: null,
        created: new Date().toISOString()
      };
    }
  }

  /**
   * Save audit index
   */
  saveAuditIndex(auditIndex) {
    try {
      auditIndex.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.auditIndexFile, JSON.stringify(auditIndex, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save audit index: ${error.message}`);
    }
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  /**
   * Print audit summary
   */
  printAuditSummary() {
    const stats = this.getAuditStats();
    const audits = this.listAudits();

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                              AUDIT HISTORY                                  ║
║                           Domain: ${this.domainName.padEnd(34)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║  📊 Total Audits: ${stats.total.toString().padEnd(58)}║
║  ✅ Completed: ${stats.completed.toString().padEnd(61)}║
║  🔄 In Progress: ${stats.inProgress.toString().padEnd(59)}║
║  ❌ Failed: ${stats.failed.toString().padEnd(64)}║
║  ⏱️  Average Duration: ${this.formatDuration(stats.averageDuration).padEnd(48)}║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    if (audits.length > 0) {
      console.log('\nRecent Audits:');
      const recentAudits = audits.slice(0, 5);
      for (const audit of recentAudits) {
        const statusIcon = audit.status === 'completed' ? '✅' : 
                          audit.status === 'in-progress' ? '🔄' : '❌';
        console.log(`  ${statusIcon} ${audit.id} - ${audit.formattedStartTime} (${audit.status})`);
      }
    }
  }
}

/**
 * Get audit manager for domain
 */
export function getAuditManager(domainName) {
  return new AuditManager(domainName);
}

// Add these methods to the AuditManager class
AuditManager.prototype.generateComparisonReport = async function(auditId1, auditId2, options = {}) {
  return await this.comparisonReportGenerator.generateComparisonReport(auditId1, auditId2, options);
};

AuditManager.prototype.compareAllAudits = async function(options = {}) {
  const audits = this.listAudits();
  if (audits.length < 2) {
    throw new Error('At least 2 audits are required for comparison');
  }

  const comparisons = [];
  for (let i = 1; i < audits.length; i++) {
    const comparison = await this.generateComparisonReport(
      audits[i - 1].id,
      audits[i].id,
      options
    );
    comparisons.push(comparison);
  }

  return comparisons;
};

AuditManager.prototype.getProgressionSummary = async function() {
  try {
    const comparisons = await this.compareAllAudits();
    
    if (comparisons.length === 0) {
      return { message: 'No comparisons available - need at least 2 audits' };
    }

    const summary = {
      totalComparisons: comparisons.length,
      latestProgress: {
        keyImprovements: [],
        keyRegressions: [],
        overallTrend: 'stable'
      },
      overallTrends: {
        totalPages: [],
        totalLinks: [],
        internalLinks: [],
        externalLinks: [],
        brokenLinks: []
      }
    };

    // Basic analysis based on available data
    summary.latestProgress.keyImprovements.push(`Generated ${comparisons.length} audit comparisons`);
    
    return summary;
  } catch (error) {
    return { 
      message: `Unable to generate progression summary: ${error.message}`,
      error: true 
    };
  }
};
