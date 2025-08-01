// Orchestrator for domain link audit
import path from 'path';
import { fileURLToPath } from 'url';
import { extractMainDomain } from './utils.js';
import { saveState, loadState, printStats } from './state.js';
import { saveHtmlReport } from './report.js';
import { runInternalCrawl, runExternalChecks } from './crawlerCore.js';
import { ChunkedPageDataManager } from './pageDataManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCrawl(rawDomain, maxInternalLinksArg) {
  // Configuration constants
  const MAX_RETRIES = 3;
  const MAX_PARALLEL_CHECKS = 5; // external links check concurrency
  const MAX_PARALLEL_CRAWL = 2; // internal links crawl concurrency
  const TIMEOUT_MS = 5000;
  let MAX_INTERNAL_LINKS = 50; // Default max internal links (reasonable for most audits)
  
  // Override max internal links if provided
  if (maxInternalLinksArg !== undefined && !isNaN(maxInternalLinksArg) && maxInternalLinksArg >= 0) {
    MAX_INTERNAL_LINKS = maxInternalLinksArg;
  }

  // Clean the domain input - remove protocol if present
  const DOMAIN = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const BASE_URL = `https://${DOMAIN}`;

  // Create domain-specific folder for files
  const HOSTNAME = new URL(BASE_URL).hostname;
  const MAIN_DOMAIN = extractMainDomain(HOSTNAME);
  const DOMAIN_FOLDER_NAME = MAIN_DOMAIN.replace(/[^a-zA-Z0-9.-]/g, '_');
  const DOMAIN_FOLDER = path.resolve(__dirname, DOMAIN_FOLDER_NAME);
  const STATE_FILE = path.resolve(DOMAIN_FOLDER, 'crawl-state.json');
  const REPORT_FILE = path.resolve(DOMAIN_FOLDER, 'crawl-report.html');

  // Initialize state containers
  const visited = new Set();
  const queue = new Set();
  const stats = {};
  const badRequests = {};
  const externalLinks = {};
  const mailtoLinks = {};
  const telLinks = {};
  const pageDataManager = new ChunkedPageDataManager(DOMAIN_FOLDER); // Memory-efficient page data storage

  const crawlStartTime = Date.now();

  async function crawl(startUrl) {
    if (!loadState(STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager)) {
      queue.add(startUrl);
    } else {
      console.log('✅ Loaded previous crawl state, resuming...');
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

    console.log('\n--- Checking External Links (Parallel)...\n');
    await runExternalChecks(pendingExternalLinks, externalLinks, MAX_PARALLEL_CHECKS, MAX_RETRIES, TIMEOUT_MS);
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
  }

  // Start crawling
  await crawl(BASE_URL);
}
