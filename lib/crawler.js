// Orchestrator for domain link audit
import path from 'path';
import { fileURLToPath } from 'url';
import { extractMainDomain } from '../src/utils/core-utils.js';
import { saveState, loadState, printStats } from '../src/core/compressed-state-manager.js';
import { saveHtmlReport } from '../src/reporting/compressed-html-report-manager.js';
import { runInternalCrawl, runExternalChecks } from './crawler-core.js';
import { CompressedPageDataManager } from '../src/storage/compressed-page-data-manager.js';
import { getAuditManager } from '../src/core/audit-manager.js';
import logger from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCrawl(rawDomain, maxInternalLinksArg, forceNew = false, userLimits = {}, options = {}) {
  // Configuration constants
  const MAX_RETRIES = 3;
  const MAX_PARALLEL_CHECKS = 5; // external links check concurrency
  const MAX_PARALLEL_CRAWL = 2; // internal links crawl concurrency
  const TIMEOUT_MS = 5000;
  let MAX_INTERNAL_LINKS = 50; // Default max internal links (reasonable for most audits)
  
  // External link limits
  const MAX_EXTERNAL_LINKS = userLimits.maxExternalLinks || (userLimits.isRegistered ? -1 : 10); // -1 = unlimited, 10 for unregistered
  
  // Override max internal links if provided
  if (maxInternalLinksArg !== undefined && !isNaN(maxInternalLinksArg) && maxInternalLinksArg >= 0) {
    MAX_INTERNAL_LINKS = maxInternalLinksArg;
  }

  logger.info(`📊 Audit Configuration:`);
  logger.info(`  - Max Internal Links: ${MAX_INTERNAL_LINKS}`);
  logger.info(`  - Max External Links: ${MAX_EXTERNAL_LINKS === -1 ? 'Unlimited' : MAX_EXTERNAL_LINKS}`);
  logger.info(`  - User Registered: ${userLimits.isRegistered ? 'Yes' : 'No'}`);

  // Clean the domain input - remove protocol if present
  const DOMAIN = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const BASE_URL = `https://${DOMAIN}`;

  // Create domain-specific folder for files
  const HOSTNAME = new URL(BASE_URL).hostname;
  
  // Extract just the main domain name using the utility function
  const DOMAIN_NAME = extractMainDomain(DOMAIN);
  const DOMAIN_FOLDER_NAME = DOMAIN_NAME.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Initialize audit manager
  const auditManager = getAuditManager(DOMAIN_FOLDER_NAME);
  
  // Create or resume audit
  const auditPaths = auditManager.createOrResumeAudit(forceNew);
  const { auditId, auditDir, stateFile, reportFile, pageDataDir } = auditPaths;

  logger.info(`📁 Using audit directory: ${auditDir}`);
  logger.info(`🆔 Audit ID: ${auditId}`);

  // Legacy paths for backward compatibility
  const DOMAIN_FOLDER = auditDir;
  const STATE_FILE = stateFile;
  const REPORT_FILE = reportFile;

  // Initialize state containers
  const visited = new Set();
  const queue = new Set();
  const stats = {};
  const badRequests = {};
  const externalLinks = {};
  const mailtoLinks = {};
  const telLinks = {};
  const pageDataManager = new CompressedPageDataManager(DOMAIN_FOLDER);

  const crawlStartTime = Date.now();

  async function crawl(startUrl) {
    try {
      if (!loadState(STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager)) {
        queue.add(startUrl);
      } else {
  logger.info('✅ Loaded previous crawl state, resuming...');
      }

    const pendingExternalLinks = new Set();

    // Process internal links with concurrency
    await runInternalCrawl(pendingExternalLinks, {
      visited,
      queue,
      stats,
      badRequests,
      externalLinks,
      mailtoLinks,
      telLinks,
      pageDataManager,
      BASE_URL,
      DOMAIN,
      DOMAIN_FOLDER,
      STATE_FILE,
      MAX_PARALLEL_CRAWL,
      MAX_INTERNAL_LINKS
    });

  logger.info('\n--- Checking External Links (Parallel)...\n');
    await runExternalChecks(pendingExternalLinks, externalLinks, MAX_PARALLEL_CHECKS, MAX_RETRIES, TIMEOUT_MS, MAX_EXTERNAL_LINKS);
    saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager);

    printStats(stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager);
    
    const crawlEndTime = Date.now();
    const durationSec = Math.round((crawlEndTime - crawlStartTime) / 1000);
    const timestamp = new Date(crawlEndTime).toLocaleString();
    
    saveHtmlReport({
      filename: REPORT_FILE,
      DOMAIN,
      stats,
      badRequests,
      externalLinks,
      mailtoLinks,
      telLinks,
      timestamp,
      durationSec
    });

    // Mark audit as completed
    auditManager.completeAudit(auditId, {
      duration: durationSec,
      pagesAnalyzed: pageDataManager.size,
      linksChecked: Object.keys(externalLinks).length + Object.keys(stats).length
    });

  logger.info(`\n🎉 Audit completed successfully!`);
  logger.info(`📁 Report saved: ${REPORT_FILE}`);
  logger.info(`📊 Data saved: ${auditDir}`);
    
  } catch (error) {
  logger.error(`\n❌ Audit failed: ${error.message}`);
    auditManager.failAudit(auditId, error);
    throw error;
  }
}

  // Start crawling
  await crawl(BASE_URL);
  
  // Determine if we're running in a web server context or as a module
  // Multiple detection methods to ensure we don't exit in web server mode
  const mode = options.mode || (process.env.WEB_SERVER_MODE === 'true' ? 'server' : 'cli');
  logger.info(`🔍 Execution context: ${mode === 'server' ? 'WEB_SERVER' : 'CLI'} mode`);

  if (mode === 'cli') {
    logger.info('🏁 CLI mode detected - exiting gracefully');
    setTimeout(() => process.exit(0), 100);
  } else {
    // In server mode we don’t forcefully cleanup private handles or exit.
    if (options.cleanupConnections) {
      logger.info('🧹 Server mode: cleanupConnections requested (noop in core)');
    }
  }
}
