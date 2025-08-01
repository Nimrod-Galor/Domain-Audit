// Core crawling logic for domain link audit
import fetch from 'node-fetch';
import { JSDOM, VirtualConsole } from 'jsdom';
import { 
  isInternalLink, 
  isNonFetchableLink, 
  isFunctionalLink, 
  normalizeUrl,
  recordFunctionalLink,
  addToStats,
  recordBadRequest,
  recordExternalLink,
  logFailedUrl
} from './utils.js';
import { saveState } from './state.js';

export async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(id);
    return res.status;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') return 'TIMEOUT';
    return 'FETCH_ERROR';
  }
}

export async function fetchWithRetry(href, retries, TIMEOUT_MS) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const status = await fetchWithTimeout(href, TIMEOUT_MS);
    if (status !== 'FETCH_ERROR' && status !== 'TIMEOUT') {
      return status;
    }
    if (attempt === retries) {
      return status;
    }
  }
}

export async function checkExternalLink(href, source, externalLinks, MAX_RETRIES, TIMEOUT_MS) {
  const status = await fetchWithRetry(href, MAX_RETRIES, TIMEOUT_MS);
  recordExternalLink(href, status, source, externalLinks);
}

export async function crawlPage(pageUrl, pendingExternalLinks, {
  visited,
  queue,
  stats,
  badRequests,
  mailtoLinks,
  telLinks,
  BASE_URL,
  DOMAIN,
  DOMAIN_FOLDER
}) {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);

  console.log('Crawling:', pageUrl);

  let html = '';

  try {
    const res = await fetch(pageUrl);
    if (!res.ok) {
      recordBadRequest(pageUrl, res.status, pageUrl, badRequests);
      logFailedUrl(DOMAIN_FOLDER, pageUrl, `HTTP ${res.status}`);
      return;
    }

    html = await res.text();
  } catch (err) {
    console.error(`Error fetching ${pageUrl}:`, err.message);
    recordBadRequest(pageUrl, 'FETCH_ERROR', pageUrl, badRequests);
    logFailedUrl(DOMAIN_FOLDER, pageUrl, err.message);
    return;
  }

  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {
    // Ignore CSS parsing errors and other JSDOM errors
  });
  
  const dom = new JSDOM(html, {
    resources: "usable",
    runScripts: "outside-only",
    pretendToBeVisual: false,
    virtualConsole: virtualConsole
  });
  const links = [...dom.window.document.querySelectorAll('a')];

  for (const link of links) {
    const hrefRaw = link.getAttribute('href');
    if (!hrefRaw) continue;

    let resolved;
    try {
      resolved = new URL(hrefRaw, pageUrl).toString();
      resolved = normalizeUrl(resolved);
    } catch {
      continue;
    }

    const anchor = link.textContent.trim();

    if (isInternalLink(resolved, BASE_URL, DOMAIN)) {
      addToStats(resolved, anchor, pageUrl, stats);
      if (!visited.has(resolved)) queue.add(resolved);
    } else if (isFunctionalLink(resolved)) {
      recordFunctionalLink(resolved, pageUrl, mailtoLinks, telLinks);
    } else if (!isNonFetchableLink(resolved)) {
      pendingExternalLinks.add({ href: resolved, source: pageUrl });
    }
  }
}

export async function runExternalChecks(pendingLinksSet, externalLinks, MAX_PARALLEL_CHECKS, MAX_RETRIES, TIMEOUT_MS) {
  const pending = Array.from(pendingLinksSet);
  let i = 0;

  async function worker() {
    while (i < pending.length) {
      const index = i++;
      const { href, source } = pending[index];
      await checkExternalLink(href, source, externalLinks, MAX_RETRIES, TIMEOUT_MS);
    }
  }

  const workers = Array.from({ length: MAX_PARALLEL_CHECKS }, worker);
  await Promise.all(workers);
}

export async function runInternalCrawl(pendingExternalLinks, {
  visited,
  queue,
  stats,
  badRequests,
  externalLinks,
  mailtoLinks,
  telLinks,
  BASE_URL,
  DOMAIN,
  DOMAIN_FOLDER,
  STATE_FILE,
  MAX_PARALLEL_CRAWL,
  MAX_INTERNAL_LINKS
}) {
  const maxWorkers = MAX_PARALLEL_CRAWL;
  let processedCount = 0;
  let activeWorkers = 0;
  let allWorkersFinished = false;
  
  // Create a promise-based queue manager with waiting capability
  const getNextUrl = async () => {
    // Check if we've hit the maximum limit
    if (MAX_INTERNAL_LINKS > 0 && processedCount >= MAX_INTERNAL_LINKS) {
      return null;
    }
    
    // Wait for work to become available or all workers to finish
    while (queue.size === 0 && !allWorkersFinished) {
      // Short wait to allow other workers to add new URLs
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // If no workers are actively crawling and queue is empty, we're done
      if (activeWorkers === 0 && queue.size === 0) {
        allWorkersFinished = true;
        return null;
      }
    }
    
    if (queue.size === 0) return null;
    
    const [nextUrl] = queue;
    queue.delete(nextUrl);
    
    // Increment processed count here to ensure atomicity
    processedCount++;
    return { url: nextUrl, count: processedCount };
  };
  
  async function worker(workerId) {
    let workerProcessed = 0;
    
    while (true) {
      const result = await getNextUrl();
      if (!result) break;
      
      const { url: nextUrl, count: currentCount } = result;
      activeWorkers++; // Mark this worker as actively crawling
      workerProcessed++;
      console.log(`[Worker ${workerId}] Processing ${currentCount}${MAX_INTERNAL_LINKS > 0 ? `/${MAX_INTERNAL_LINKS}` : ''}: ${nextUrl}`);
      
      await crawlPage(nextUrl, pendingExternalLinks, {
        visited,
        queue,
        stats,
        badRequests,
        mailtoLinks,
        telLinks,
        BASE_URL,
        DOMAIN,
        DOMAIN_FOLDER
      });
      
      activeWorkers--; // Mark this worker as done with current task
      
      // Save state every 3 pages processed across all workers to balance performance and safety
      if (currentCount % 3 === 0) {
        saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks);
      }
      
      // Check if we've reached the limit after processing
      if (MAX_INTERNAL_LINKS > 0 && currentCount >= MAX_INTERNAL_LINKS) {
        console.log(`[Worker ${workerId}] Reached maximum internal link limit (${MAX_INTERNAL_LINKS})`);
        break;
      }
    }
    
    console.log(`[Worker ${workerId}] Finished - processed ${workerProcessed} pages`);
  }

  const initialQueueSize = queue.size;
  if (initialQueueSize === 0) {
    console.log('No internal links to process.');
    return;
  }

  // Calculate effective queue size considering the limit
  const effectiveQueueSize = MAX_INTERNAL_LINKS > 0 ? Math.min(initialQueueSize, MAX_INTERNAL_LINKS) : initialQueueSize;
  
  // Start workers (use full parallel capacity, queue grows dynamically)
  const workerCount_actual = maxWorkers; // Always use MAX_PARALLEL_CRAWL workers
  const workers = [];
  
  for (let i = 0; i < workerCount_actual; i++) {
    workers.push(worker(i + 1)); // Pass worker ID (1-based)
  }

  const limitMessage = MAX_INTERNAL_LINKS > 0 ? ` (limited to ${MAX_INTERNAL_LINKS})` : '';
  console.log(`\n--- Starting ${workerCount_actual} workers for ${initialQueueSize} internal links${limitMessage} ---\n`);
  
  // Wait for all workers to complete
  await Promise.all(workers);
  
  // Final state save
  saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks);
  
  const limitReachedMessage = MAX_INTERNAL_LINKS > 0 && processedCount >= MAX_INTERNAL_LINKS ? ' (limit reached)' : '';
  console.log(`\n--- Processed ${processedCount} internal links${limitReachedMessage} ---\n`);
  
  // Log remaining queue size if limit was reached
  if (MAX_INTERNAL_LINKS > 0 && queue.size > 0) {
    console.log(`⚠️  ${queue.size} internal links remain unprocessed due to limit. Increase MAX_INTERNAL_LINKS or set to 0 for unlimited.`);
  }
}
