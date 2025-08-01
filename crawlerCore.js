
// Core crawling logic for domain link audit
import fetch from 'node-fetch';
import { JSDOM, VirtualConsole, ResourceLoader } from 'jsdom';

// Define NodeFilter constants that we need
const NodeFilter = {
  FILTER_ACCEPT: 1,
  FILTER_REJECT: 2,
  SHOW_ELEMENT: 1
};

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
import { ChunkedPageDataManager } from './pageDataManager.js';

// Custom ResourceLoader that doesn't load any resources
class NoResourceLoader extends ResourceLoader {
  fetch() {
    return null;
  }
}

// HTML content size threshold for cleanup (5MB)
const HTML_CLEANUP_THRESHOLD = 5 * 1024 * 1024;

export async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(id);
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()) };
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') return { status: 'TIMEOUT', headers: {} };
    return { status: 'FETCH_ERROR', headers: {} };
  }
}

export async function checkRedirectChain(url, maxRedirects = 5) {
  const redirectChain = [];
  let currentUrl = url;
  let redirectCount = 0;
  
  while (redirectCount < maxRedirects) {
    try {
      const response = await fetch(currentUrl, { 
        method: 'HEAD', 
        redirect: 'manual'
      });
      
      redirectChain.push({
        url: currentUrl,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        
        // Resolve relative URLs
        currentUrl = new URL(location, currentUrl).toString();
        redirectCount++;
        
        // Check for redirect loops
        if (redirectChain.some(item => item.url === currentUrl)) {
          redirectChain.push({ url: currentUrl, status: 'LOOP_DETECTED', headers: {} });
          break;
        }
      } else {
        break;
      }
    } catch (err) {
      redirectChain.push({ url: currentUrl, status: 'FETCH_ERROR', headers: {} });
      break;
    }
  }
  
  return {
    chain: redirectChain,
    finalUrl: currentUrl,
    redirectCount,
    hasLoop: redirectChain.some(item => item.status === 'LOOP_DETECTED'),
    maxRedirectsReached: redirectCount >= maxRedirects
  };
}

export async function fetchWithRetry(href, retries, TIMEOUT_MS) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fetchWithTimeout(href, TIMEOUT_MS);
    if (result.status !== 'FETCH_ERROR' && result.status !== 'TIMEOUT') {
      return result;
    }
    if (attempt === retries) {
      return result;
    }
  }
}

export async function checkExternalLink(href, source, externalLinks, MAX_RETRIES, TIMEOUT_MS) {
  const result = await fetchWithRetry(href, MAX_RETRIES, TIMEOUT_MS);
  const redirectInfo = await checkRedirectChain(href, 3); // Check up to 3 redirects for external links
  
  recordExternalLink(href, result.status, source, externalLinks, {
    headers: result.headers,
    redirectChain: redirectInfo
  });
}

export async function crawlPage(pageUrl, pendingExternalLinks, {
  visited,
  queue,
  stats,
  badRequests,
  mailtoLinks,
  telLinks,
  pageDataManager,
  BASE_URL,
  DOMAIN,
  DOMAIN_FOLDER
}) {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);

  console.log('Crawling:', pageUrl);

  let html = '';
  let responseTime = 0;
  let pageSize = 0;
  let statusCode = 0;
  let headers = {};

  try {
    const startTime = Date.now();
    const res = await fetch(pageUrl);
    responseTime = Date.now() - startTime;
    statusCode = res.status;
    headers = Object.fromEntries(res.headers.entries());
    
    if (!res.ok) {
      recordBadRequest(pageUrl, res.status, pageUrl, badRequests);
      logFailedUrl(DOMAIN_FOLDER, pageUrl, `HTTP ${res.status}`);
      return;
    }

    // Stream response and check size
    const contentLength = parseInt(headers['content-length']) || 0;
    if (contentLength > HTML_CLEANUP_THRESHOLD) {
      console.log(`Large page detected (${Math.round(contentLength/1024/1024)}MB): ${pageUrl}`);
    }

    // Read the response as a stream
    const chunks = [];
    const decoder = new TextDecoder();
    let processedSize = 0;
    
    for await (const chunk of res.body) {
      chunks.push(decoder.decode(chunk, { stream: true }));
      processedSize += chunk.length;
      
      // Check size threshold during streaming
      if (processedSize > HTML_CLEANUP_THRESHOLD * 2) {
        console.warn(`Page exceeds maximum size threshold (${Math.round(processedSize/1024/1024)}MB): ${pageUrl}`);
        break;
      }
    }
    
    // Final chunk
    chunks.push(decoder.decode());
    html = chunks.join('');
    pageSize = processedSize;
  } catch (err) {
    console.error(`Error fetching ${pageUrl}:`, err.message);
    recordBadRequest(pageUrl, 'FETCH_ERROR', pageUrl, badRequests);
    logFailedUrl(DOMAIN_FOLDER, pageUrl, err.message);
    return;
  }

  // Create a limited virtual console that only logs critical errors
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (err) => {
    if (err.includes('critical') || err.includes('fatal')) {
      console.error(`Critical JSDOM error for ${pageUrl}:`, err);
    }
  });
  
  // Configure JSDOM with memory-optimized settings
  const dom = new JSDOM(html, {
    resources: new NoResourceLoader(), // Use custom resource loader that blocks all resource loading
    runScripts: "outside-only",
    pretendToBeVisual: false,
    virtualConsole: virtualConsole,
    includeNodeLocations: false, // Disable source location tracking
  });
  
  const document = dom.window.document;
  
  // Schedule DOM cleanup
  process.nextTick(() => {
    dom.window.close();
    // Clear large strings
    html = '';
    global.gc?.(); // Suggest garbage collection if available
  });
  
  // Collect comprehensive page data
  const currentPageData = {
    url: pageUrl,
    statusCode,
    responseTime,
    pageSize,
    headers,
    
    // SEO & Content Analysis
    seo: extractSEOData(document),
    content: extractContentData(document, html),
    
    // Link Analysis
    linkAnalysis: extractLinkAnalysis(document, pageUrl),
    
    // Technical Data
    technical: extractTechnicalData(document, headers),
    
    // Navigation Structure
    navigation: extractNavigationData(document, pageUrl),
    
    // Accessibility
    accessibility: extractAccessibilityData(document),
    
    // Mobile-friendliness
    mobileFriendliness: extractMobileFriendlinessData(document, headers),
    
    // Content Media & Downloads
    mediaContent: extractMediaContentData(document, pageUrl),
    
    // Page Type Classification
    pageType: extractPageTypeData(document, pageUrl),
    
    // UX Elements Analysis
    uxElements: extractUXElementsData(document, pageUrl),
    
    // Performance
    performance: {
      responseTime,
      pageSize,
      compression: headers['content-encoding'] || 'none',
      contentType: headers['content-type'] || 'unknown'
    },
    
    // Site Architecture
    architecture: extractArchitectureData(pageUrl, document),
    
    // Security
    security: extractSecurityData(headers, pageUrl, document),
    
    timestamp: new Date().toISOString()
  };
  
  // Store page data using the chunked manager
  pageDataManager.set(pageUrl, currentPageData);
  
  // Use a more memory-efficient link iterator
  const linkIterator = document.createNodeIterator(
    document.body || document,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        return node.tagName === 'A' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  let link;
  while (link = linkIterator.nextNode()) {
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

/**
 * Runs the internal crawl of a website, processing internal links with concurrency and respecting a maximum link limit.
 * Handles state saving, worker concurrency, and queue management.
 *
 * @param {Set} pendingExternalLinks - Set to collect external links for later checking.
 * @param {Object} options - Crawl options and shared state.
 * @param {Set} options.visited - Set of already visited URLs.
 * @param {Set} options.queue - Set of URLs to crawl.
 * @param {Object} options.stats - Statistics object for link and anchor data.
 * @param {Object} options.badRequests - Tracks failed requests.
 * @param {Object} options.externalLinks - Stores external link check results.
 * @param {Object} options.mailtoLinks - Stores mailto: links found.
 * @param {Object} options.telLinks - Stores tel: links found.
 * @param {Map} options.pageData - Map of page URL to extracted data.
 * @param {string} options.BASE_URL - The base URL for the crawl.
 * @param {string} options.DOMAIN - The domain being crawled.
 * @param {string} options.DOMAIN_FOLDER - Output folder for crawl state and reports.
 * @param {string} options.STATE_FILE - Path to the crawl state file.
 * @param {number} options.MAX_PARALLEL_CRAWL - Number of concurrent workers.
 * @param {number} options.MAX_INTERNAL_LINKS - Maximum number of internal links to process (0 = unlimited).
 * @returns {Promise<void>} Resolves when the crawl is complete or the link limit is reached.
 */
export async function runInternalCrawl(pendingExternalLinks, {
  visited,
  queue,
  stats,
  badRequests,
  externalLinks,
  mailtoLinks,
  telLinks,
  pageData,
  BASE_URL,
  DOMAIN,
  DOMAIN_FOLDER,
  STATE_FILE,
  MAX_PARALLEL_CRAWL,
  MAX_INTERNAL_LINKS
}) {
  // Initialize the chunked page data manager
  const pageDataManager = new ChunkedPageDataManager(DOMAIN_FOLDER);
  
  // If there's existing pageData, migrate it to the chunked manager
  if (pageData instanceof Map && pageData.size > 0) {
    for (const [url, data] of pageData.entries()) {
      pageDataManager.set(url, data);
    }
    pageData.clear(); // Clear the in-memory Map after migration
  }
  
  const maxWorkers = MAX_PARALLEL_CRAWL;
  let processedCount = 0;
  let activeWorkers = 0;
  let allWorkersFinished = false;
  
  // Create a promise-based queue manager with waiting capability
  const getNextUrl = async () => {
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
    
    // Check if we've hit the maximum limit BEFORE processing
    if (MAX_INTERNAL_LINKS > 0 && processedCount >= MAX_INTERNAL_LINKS) {
      return null;
    }
    
    const [nextUrl] = queue;
    queue.delete(nextUrl);
    
    // Increment processed count here to ensure atomicity
    processedCount++;
    return { url: nextUrl, count: processedCount };
  };
  
  /**
   * Worker function for processing URLs from the queue.
   * @param {number} workerId - The ID of the worker (for logging).
   * @returns {Promise<void>}
   */
  async function worker(workerId) {
    let workerProcessed = 0;
    
    while (true) {
      const result = await getNextUrl();
      if (!result) break;
      
      const { url: nextUrl, count: currentCount } = result;
      activeWorkers++; // Mark this worker as actively crawling
      workerProcessed++;
        const remaining = queue.size;
        console.log(`[Worker ${workerId}] Processing ${currentCount}${remaining > 0 ? ` (${remaining} left in queue)` : ''}: ${nextUrl}`);
      
      await crawlPage(nextUrl, pendingExternalLinks, {
        visited,
        queue,
        stats,
        badRequests,
        mailtoLinks,
        telLinks,
        pageDataManager,
        BASE_URL,
        DOMAIN,
        DOMAIN_FOLDER
      });
      
      activeWorkers--; // Mark this worker as done with current task
      
      // Save state every X pages processed across all workers to balance performance and safety
        const saveStateEvery = 3; // Save state every 3 pages processed
      if (currentCount % saveStateEvery === 0) {
        saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager);
      }
      
      // Note: Limit checking is now handled in getNextUrl() before processing
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

  for (const i of Array(workerCount_actual).keys()) {
    workers.push(worker(i + 1)); // Pass worker ID (1-based)
  }

  const limitMessage = MAX_INTERNAL_LINKS > 0 ? ` (limited to ${MAX_INTERNAL_LINKS})` : '';
  console.log(`\n--- Starting ${workerCount_actual} workers for ${initialQueueSize} internal links${limitMessage} ---\n`);

  // Wait for all workers to complete
  await Promise.all(workers);

  // Final state save
  saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager);

  const limitReachedMessage = MAX_INTERNAL_LINKS > 0 && processedCount >= MAX_INTERNAL_LINKS ? ' (limit reached)' : '';
  console.log(`\n--- Processed ${processedCount} internal links${limitReachedMessage} ---\n`);

  // Log remaining queue size if limit was reached
  if (MAX_INTERNAL_LINKS > 0 && queue.size > 0) {
    console.log(`⚠️  ${queue.size} internal links remain unprocessed due to limit. Increase MAX_INTERNAL_LINKS or set to 0 for unlimited.`);
  }
}

// SEO Data Extraction
function extractSEOData(document) {
  const title = document.querySelector('title')?.textContent || '';
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  
  // Open Graph data
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content') || '';
  
  // Twitter Card data
  const twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '';
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '';
  const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '';
  
  // Schema.org structured data
  const jsonLdScripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  const structuredData = jsonLdScripts.map(script => {
    try {
      return JSON.parse(script.textContent);
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Extract keywords from title and meta description for analysis
  const extractKeywords = (text) => {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && word.length < 20)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
  };

  const titleKeywords = extractKeywords(title);
  const descriptionKeywords = extractKeywords(metaDescription);

  return {
    title: {
      text: title,
      length: title.length,
      isEmpty: !title.trim(),
      keywords: titleKeywords,
      wordCount: title.trim().split(/\s+/).length
    },
    metaDescription: {
      text: metaDescription,
      length: metaDescription.length,
      isEmpty: !metaDescription.trim(),
      keywords: descriptionKeywords,
      wordCount: metaDescription.trim().split(/\s+/).length
    },
    metaKeywords: metaKeywords,
    canonical,
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      type: ogType,
      url: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
      siteName: document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || ''
    },
    twitterCard: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      image: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '',
      site: document.querySelector('meta[name="twitter:site"]')?.getAttribute('content') || ''
    },
    structuredData: {
      count: structuredData.length,
      types: structuredData.map(data => data['@type'] || data.type || 'Unknown').filter(Boolean),
      data: structuredData
    }
  };
}

// Content Analysis
function extractContentData(document, html) {
  const textContent = document.body?.textContent || '';
  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Heading structure
  const headings = {
    h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
    h2: [...document.querySelectorAll('h2')].map(h => h.textContent.trim()),
    h3: [...document.querySelectorAll('h3')].map(h => h.textContent.trim()),
    h4: [...document.querySelectorAll('h4')].map(h => h.textContent.trim()),
    h5: [...document.querySelectorAll('h5')].map(h => h.textContent.trim()),
    h6: [...document.querySelectorAll('h6')].map(h => h.textContent.trim())
  };
  
  // Images
  const images = [...document.querySelectorAll('img')];
  const imagesData = {
    total: images.length,
    withAlt: images.filter(img => img.getAttribute('alt')).length,
    withoutAlt: images.filter(img => !img.getAttribute('alt')).length,
    emptyAlt: images.filter(img => img.getAttribute('alt') === '').length
  };
  
  // Content to code ratio
  const htmlSize = Buffer.byteLength(html, 'utf8');
  const textSize = Buffer.byteLength(textContent, 'utf8');
  const contentToCodeRatio = htmlSize > 0 ? (textSize / htmlSize * 100).toFixed(2) : 0;

  // Reading level and complexity analysis
  const readabilityScores = calculateReadabilityScores(textContent);

  return {
    wordCount,
    textLength: textContent.length,
    headings,
    images: imagesData,
    contentToCodeRatio: parseFloat(contentToCodeRatio),
    hasVideo: document.querySelector('video') !== null,
    hasAudio: document.querySelector('audio') !== null,
    hasForms: document.querySelector('form') !== null,
    readability: readabilityScores
  };
}

// Link Analysis
function extractLinkAnalysis(document, pageUrl) {
  const allLinks = [...document.querySelectorAll('a[href]')];
  const currentDomain = new URL(pageUrl).hostname;
  
  // Define page sections for position analysis
  const sections = {
    header: document.querySelector('header, [role="banner"], .header, .site-header, .page-header') || 
            document.querySelector('body > *:first-child:not(main):not(article):not(section)'),
    navigation: document.querySelector('nav, [role="navigation"], .nav, .navigation, .menu'),
    main: document.querySelector('main, [role="main"], .main, .content, article, .post'),
    sidebar: document.querySelector('aside, [role="complementary"], .sidebar, .widget-area'),
    footer: document.querySelector('footer, [role="contentinfo"], .footer, .site-footer')
  };
  
  // Function to get surrounding text context
  const getSurroundingText = (element, contextLength = 100) => {
    const parent = element.parentNode;
    if (!parent) return { before: '', after: '' };
    
    const textContent = parent.textContent || '';
    const linkText = element.textContent || '';
    const linkStart = textContent.indexOf(linkText);
    
    if (linkStart === -1) return { before: '', after: '' };
    
    const beforeStart = Math.max(0, linkStart - contextLength);
    const afterEnd = Math.min(textContent.length, linkStart + linkText.length + contextLength);
    
    return {
      before: textContent.substring(beforeStart, linkStart).trim(),
      after: textContent.substring(linkStart + linkText.length, afterEnd).trim()
    };
  };
  
  // Function to determine link position
  const getLinkPosition = (element) => {
    for (const [sectionName, sectionElement] of Object.entries(sections)) {
      if (sectionElement && sectionElement.contains(element)) {
        return sectionName;
      }
    }
    return 'other';
  };
  
  const linkData = allLinks.map((link, index) => {
    const href = link.getAttribute('href');
    let isInternal = false;
    let isExternal = false;
    
    if (href) {
      try {
        // Handle relative URLs
        const resolvedUrl = new URL(href, pageUrl);
        isInternal = resolvedUrl.hostname === currentDomain;
        isExternal = !isInternal && resolvedUrl.protocol.startsWith('http');
      } catch {
        // Handle non-URL hrefs (mailto, tel, javascript, etc.)
        isInternal = href.startsWith('/') || href.startsWith('#') || (!href.includes('://') && !href.startsWith('mailto:') && !href.startsWith('tel:'));
      }
    }
    
    const position = getLinkPosition(link);
    const context = getSurroundingText(link);
    
    return {
      href,
      text: link.textContent.trim(),
      title: link.getAttribute('title') || '',
      rel: link.getAttribute('rel') || '',
      target: link.getAttribute('target') || '',
      ariaLabel: link.getAttribute('aria-label') || '',
      isInternal,
      isExternal,
      position,
      context,
      linkIndex: index
    };
  });
  
  // Calculate position-based metrics
  const positionCounts = {
    header: linkData.filter(link => link.position === 'header').length,
    navigation: linkData.filter(link => link.position === 'navigation').length,
    main: linkData.filter(link => link.position === 'main').length,
    sidebar: linkData.filter(link => link.position === 'sidebar').length,
    footer: linkData.filter(link => link.position === 'footer').length,
    other: linkData.filter(link => link.position === 'other').length
  };
  
  // Calculate link density per section
  const sectionDensity = {};
  Object.entries(sections).forEach(([sectionName, sectionElement]) => {
    if (sectionElement) {
      const sectionText = sectionElement.textContent || '';
      const sectionWordCount = sectionText.trim().split(/\s+/).filter(word => word.length > 0).length;
      const sectionLinkCount = positionCounts[sectionName] || 0;
      
      sectionDensity[sectionName] = {
        linkCount: sectionLinkCount,
        wordCount: sectionWordCount,
        density: sectionWordCount > 0 ? Math.round((sectionLinkCount / sectionWordCount) * 1000) / 10 : 0, // Links per 100 words
        linksPerCharacter: sectionText.length > 0 ? Math.round((sectionLinkCount / sectionText.length) * 10000) / 10 : 0 // Links per 1000 characters
      };
    } else {
      sectionDensity[sectionName] = {
        linkCount: 0,
        wordCount: 0,
        density: 0,
        linksPerCharacter: 0
      };
    }
  });
  
  const internalLinks = linkData.filter(link => link.isInternal);
  const externalLinks = linkData.filter(link => link.isExternal);
  const functionalLinks = linkData.filter(link => !link.isInternal && !link.isExternal);
  
  const relAttributes = {
    nofollow: linkData.filter(link => link.rel.includes('nofollow')).length,
    sponsored: linkData.filter(link => link.rel.includes('sponsored')).length,
    ugc: linkData.filter(link => link.rel.includes('ugc')).length,
    external: linkData.filter(link => link.rel.includes('external')).length
  };
  
  const targetBlank = linkData.filter(link => link.target === '_blank').length;
  
  // Calculate ratios
  const totalValidLinks = internalLinks.length + externalLinks.length;
  const internalRatio = totalValidLinks > 0 ? (internalLinks.length / totalValidLinks * 100) : 0;
  const externalRatio = totalValidLinks > 0 ? (externalLinks.length / totalValidLinks * 100) : 0;
  
  // Position-based link type analysis
  const positionAnalysis = {
    header: {
      internal: linkData.filter(link => link.position === 'header' && link.isInternal).length,
      external: linkData.filter(link => link.position === 'header' && link.isExternal).length,
      functional: linkData.filter(link => link.position === 'header' && !link.isInternal && !link.isExternal).length
    },
    navigation: {
      internal: linkData.filter(link => link.position === 'navigation' && link.isInternal).length,
      external: linkData.filter(link => link.position === 'navigation' && link.isExternal).length,
      functional: linkData.filter(link => link.position === 'navigation' && !link.isInternal && !link.isExternal).length
    },
    main: {
      internal: linkData.filter(link => link.position === 'main' && link.isInternal).length,
      external: linkData.filter(link => link.position === 'main' && link.isExternal).length,
      functional: linkData.filter(link => link.position === 'main' && !link.isInternal && !link.isExternal).length
    },
    sidebar: {
      internal: linkData.filter(link => link.position === 'sidebar' && link.isInternal).length,
      external: linkData.filter(link => link.position === 'sidebar' && link.isExternal).length,
      functional: linkData.filter(link => link.position === 'sidebar' && !link.isInternal && !link.isExternal).length
    },
    footer: {
      internal: linkData.filter(link => link.position === 'footer' && link.isInternal).length,
      external: linkData.filter(link => link.position === 'footer' && link.isExternal).length,
      functional: linkData.filter(link => link.position === 'footer' && !link.isInternal && !link.isExternal).length
    }
  };
  
  return {
    totalLinks: allLinks.length,
    internalLinks: internalLinks.length,
    externalLinks: externalLinks.length,
    functionalLinks: functionalLinks.length,
    linkRatios: {
      internal: Math.round(internalRatio * 10) / 10,
      external: Math.round(externalRatio * 10) / 10,
      totalValidLinks
    },
    relAttributes,
    targetBlank,
    linksWithTitle: linkData.filter(link => link.title).length,
    linksWithAriaLabel: linkData.filter(link => link.ariaLabel).length,
    emptyLinkText: linkData.filter(link => !link.text).length,
    
    // New advanced positioning analysis
    positionCounts,
    positionAnalysis,
    sectionDensity,
    
    // Detailed link data with context (limited to first 20 for performance)
    linkDetails: linkData.slice(0, 20).map(link => ({
      href: link.href,
      text: link.text,
      position: link.position,
      isInternal: link.isInternal,
      isExternal: link.isExternal,
      context: {
        before: link.context.before.substring(0, 50), // Limit context length
        after: link.context.after.substring(0, 50)
      }
    }))
  };
}

// Technical Data Extraction
function extractTechnicalData(document, headers) {
  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
  const charset = document.querySelector('meta[charset]')?.getAttribute('charset') || 
                  document.querySelector('meta[http-equiv="content-type"]')?.getAttribute('content') || '';
  
  // CSS and JS resources
  const cssLinks = [...document.querySelectorAll('link[rel="stylesheet"]')].length;
  const jsScripts = [...document.querySelectorAll('script[src]')].length;
  const inlineStyles = [...document.querySelectorAll('style')].length;
  const inlineScripts = [...document.querySelectorAll('script:not([src])')].length;
  
  // Basic navigation elements (kept for compatibility)
  const hasNavElement = document.querySelector('nav') !== null;
  const hasBreadcrumbs = document.querySelector('[aria-label*="breadcrumb"], .breadcrumb, .breadcrumbs') !== null;
  
  return {
    viewport,
    charset,
    resources: {
      externalCSS: cssLinks,
      externalJS: jsScripts,
      inlineCSS: inlineStyles,
      inlineJS: inlineScripts
    },
    navigation: {
      hasNav: hasNavElement,
      hasBreadcrumbs
    },
    httpVersion: headers['http-version'] || '1.1',
    server: headers['server'] || '',
    poweredBy: headers['x-powered-by'] || ''
  };
}

// Navigation Structure Data Extraction
function extractNavigationData(document, pageUrl) {
  const currentDomain = new URL(pageUrl).hostname;
  
  // Breadcrumb analysis
  const breadcrumbAnalysis = analyzeBreadcrumbs(document, pageUrl);
  
  // Main navigation analysis
  const mainNavigationAnalysis = analyzeMainNavigation(document, currentDomain);
  
  // Footer navigation analysis
  const footerNavigationAnalysis = analyzeFooterNavigation(document, currentDomain);
  
  // Pagination analysis
  const paginationAnalysis = analyzePagination(document, pageUrl);
  
  // Secondary navigation (sidebar, etc.)
  const secondaryNavigationAnalysis = analyzeSecondaryNavigation(document, currentDomain);
  
  return {
    breadcrumbs: breadcrumbAnalysis,
    mainNavigation: mainNavigationAnalysis,
    footerNavigation: footerNavigationAnalysis,
    pagination: paginationAnalysis,
    secondaryNavigation: secondaryNavigationAnalysis,
    
    // Overall navigation metrics
    totalNavigationLinks: (mainNavigationAnalysis.linkCount || 0) + (footerNavigationAnalysis.linkCount || 0),
    navigationDepth: Math.max(
      breadcrumbAnalysis.depth || 0,
      mainNavigationAnalysis.maxDepth || 0,
      footerNavigationAnalysis.maxDepth || 0
    ),
    hasConsistentNavigation: checkNavigationConsistency({
      breadcrumbs: breadcrumbAnalysis,
      mainNav: mainNavigationAnalysis,
      footer: footerNavigationAnalysis
    })
  };
}

// Accessibility Data
function extractAccessibilityData(document) {
  const images = [...document.querySelectorAll('img')];
  const forms = [...document.querySelectorAll('form')];
  const inputs = [...document.querySelectorAll('input, textarea, select')];
  
  // Enhanced color contrast analysis
  const colorContrastAnalysis = analyzeColorContrast(document);
  
  // Enhanced ARIA analysis
  const ariaAnalysis = analyzeAriaAttributes(document);
  
  // Enhanced form accessibility
  const formAccessibility = analyzeFormAccessibility(document, forms, inputs);
  
  return {
    images: {
      total: images.length,
      withAlt: images.filter(img => img.hasAttribute('alt')).length,
      missingAlt: images.filter(img => !img.hasAttribute('alt')).length,
      emptyAlt: images.filter(img => img.getAttribute('alt') === '').length,
      decorativeImages: images.filter(img => img.getAttribute('alt') === '' || img.getAttribute('role') === 'presentation').length
    },
    forms: formAccessibility,
    aria: ariaAnalysis,
    headingStructure: {
      h1Count: document.querySelectorAll('h1').length,
      properOrder: checkHeadingOrder(document),
      headingHierarchy: analyzeHeadingHierarchy(document)
    },
    colorContrast: colorContrastAnalysis,
    accessibilityScore: calculateAccessibilityScore({
      images: images.length,
      imagesWithAlt: images.filter(img => img.hasAttribute('alt')).length,
      forms: forms.length,
      inputsWithLabels: formAccessibility.withLabels,
      contrastIssues: colorContrastAnalysis.totalIssues,
      ariaElements: ariaAnalysis.totalAriaElements
    })
  };
}

// Architecture Data
function extractArchitectureData(pageUrl, document) {
  const url = new URL(pageUrl);
  const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
  
  // Enhanced URL pattern analysis
  const urlPatterns = analyzeUrlPatterns(url, pathSegments);
  
  return {
    urlDepth: pathSegments.length,
    urlLength: pageUrl.length,
    hasParameters: url.search.length > 0,
    parameterCount: new URLSearchParams(url.search).size,
    fileExtension: getFileExtension(url.pathname),
    isHomepage: url.pathname === '/' || url.pathname === '',
    pathSegments,
    
    // Enhanced URL structure analysis
    urlPatterns,
    urlComplexity: calculateUrlComplexity(pageUrl, pathSegments),
    pathDepthFromRoot: pathSegments.length,
    hasTrailingSlash: url.pathname.endsWith('/') && url.pathname !== '/',
    hasSpecialCharacters: /[^a-zA-Z0-9\/\-_.]/.test(url.pathname),
    segmentLengths: pathSegments.map(segment => segment.length),
    averageSegmentLength: pathSegments.length > 0 ? 
      pathSegments.reduce((sum, seg) => sum + seg.length, 0) / pathSegments.length : 0
  };
}

// Security Data
function extractSecurityData(headers, pageUrl, document) {
  const url = new URL(pageUrl);
  const isHTTPS = url.protocol === 'https:';
  
  const securityHeaders = {
    hsts: headers['strict-transport-security'] || '',
    csp: headers['content-security-policy'] || '',
    xfo: headers['x-frame-options'] || '',
    xss: headers['x-xss-protection'] || '',
    contentType: headers['x-content-type-options'] || '',
    referrer: headers['referrer-policy'] || ''
  };
  
  // Enhanced SSL/TLS analysis
  const sslInfo = {
    isHTTPS,
    hasHSTS: !!securityHeaders.hsts,
    hstsMaxAge: securityHeaders.hsts ? extractHSTSMaxAge(securityHeaders.hsts) : 0,
    tlsVersion: headers['tls-version'] || 'unknown',
    cipherSuite: headers['cipher-suite'] || 'unknown'
  };
  
  // Mixed content analysis
  const mixedContentAnalysis = analyzeMixedContent(document, isHTTPS);
  
  // Cookie policy compliance analysis
  const cookieAnalysis = analyzeCookieCompliance(document, headers);
  
  return {
    isHTTPS,
    securityHeaders,
    hasSecurityHeaders: Object.values(securityHeaders).some(value => value !== ''),
    sslInfo,
    mixedContent: mixedContentAnalysis,
    cookies: cookieAnalysis,
    securityScore: calculateSecurityScore(securityHeaders, sslInfo, mixedContentAnalysis, cookieAnalysis)
  };
}

// Mobile-friendliness Data
function extractMobileFriendlinessData(document, headers) {
  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
  
  // Parse viewport settings
  const viewportSettings = parseViewportContent(viewport);
  
  // Check for mobile-specific elements
  const hasTouchIcons = document.querySelector('link[rel*="apple-touch-icon"], link[rel*="icon"]') !== null;
  const hasMediaQueries = checkForMediaQueries(document);
  const hasFlexboxCSS = checkForFlexboxCSS(document);
  const hasResponsiveImages = checkForResponsiveImages(document);
  
  // Check for mobile-unfriendly elements
  const hasFlashContent = document.querySelector('object[type*="flash"], embed[type*="flash"]') !== null;
  const hasFixedWidthTables = checkForFixedWidthTables(document);
  const hasSmallText = checkForSmallText(document);
  
  // Font size analysis
  const fontSizeAnalysis = analyzeFontSizes(document);
  
  // Touch target analysis
  const touchTargetAnalysis = analyzeTouchTargets(document);
  
  return {
    viewport: {
      content: viewport,
      settings: viewportSettings,
      isResponsive: viewportSettings.width === 'device-width' || viewportSettings.initialScale === '1.0'
    },
    mobileFeatures: {
      hasTouchIcons,
      hasMediaQueries,
      hasFlexboxCSS,
      hasResponsiveImages
    },
    mobileUnfriendly: {
      hasFlashContent,
      hasFixedWidthTables,
      hasSmallText
    },
    fontSizeAnalysis,
    touchTargetAnalysis,
    mobileScore: calculateMobileScore({
      viewport: viewportSettings,
      hasTouchIcons,
      hasMediaQueries,
      hasFlexboxCSS,
      hasResponsiveImages,
      hasFlashContent,
      hasFixedWidthTables,
      hasSmallText,
      fontSizeAnalysis,
      touchTargetAnalysis
    })
  };
}

// Helper functions
function checkHeadingOrder(document) {
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  let properOrder = true;
  let lastLevel = 0;
  
  for (const heading of headings) {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      properOrder = false;
      break;
    }
    lastLevel = level;
  }
  
  return properOrder;
}

// Enhanced accessibility analysis functions
function analyzeColorContrast(document) {
  const textElements = [...document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th, button, input, textarea, label')];
  const contrastIssues = [];
  let totalChecked = 0;
  let passAA = 0;
  let passAAA = 0;
  let failAA = 0;
  
  textElements.forEach((element, index) => {
    // Skip elements with no text content
    const textContent = element.textContent?.trim();
    if (!textContent || textContent.length === 0) return;
    
    // Extract colors from inline styles (Node.js limitation)
    const style = element.getAttribute('style') || '';
    const colors = extractColorsFromStyle(style);
    
    if (colors.foreground && colors.background) {
      totalChecked++;
      const contrast = calculateContrastRatio(colors.foreground, colors.background);
      const fontSize = extractFontSizeFromStyle(style) || 16; // Default to 16px
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBoldText(element, style));
      
      // WCAG contrast requirements
      const aaRequirement = isLargeText ? 3.0 : 4.5;
      const aaaRequirement = isLargeText ? 4.5 : 7.0;
      
      const passesAA = contrast >= aaRequirement;
      const passesAAA = contrast >= aaaRequirement;
      
      if (passesAA) passAA++;
      if (passesAAA) passAAA++;
      if (!passesAA) {
        failAA++;
        contrastIssues.push({
          element: element.tagName.toLowerCase(),
          text: textContent.substring(0, 50),
          contrast: Math.round(contrast * 100) / 100,
          foreground: colors.foreground,
          background: colors.background,
          fontSize,
          isLargeText,
          aaRequirement,
          aaaRequirement,
          passesAA,
          passesAAA,
          severity: contrast < 2 ? 'high' : contrast < 3 ? 'medium' : 'low'
        });
      }
    }
  });
  
  // Check for common problematic color combinations in CSS
  const cssColorIssues = analyzeCSSColorCombinations(document);
  
  return {
    totalElements: textElements.length,
    totalChecked,
    passAA,
    passAAA,
    failAA,
    aaPercentage: totalChecked > 0 ? Math.round((passAA / totalChecked) * 100) : 100,
    aaaPercentage: totalChecked > 0 ? Math.round((passAAA / totalChecked) * 100) : 100,
    totalIssues: contrastIssues.length,
    contrastIssues: contrastIssues.slice(0, 20), // Limit for performance
    cssColorIssues,
    summary: totalChecked === 0 ? 
      'No inline color styles found for analysis' : 
      `${failAA} contrast issues found out of ${totalChecked} elements checked`
  };
}

function analyzeAriaAttributes(document) {
  const ariaLabels = [...document.querySelectorAll('[aria-label]')];
  const ariaDescribedBy = [...document.querySelectorAll('[aria-describedby]')];
  const ariaHidden = [...document.querySelectorAll('[aria-hidden]')];
  const ariaExpanded = [...document.querySelectorAll('[aria-expanded]')];
  const ariaLive = [...document.querySelectorAll('[aria-live]')];
  const roleElements = [...document.querySelectorAll('[role]')];
  
  // Analyze landmark roles
  const landmarks = {
    main: document.querySelectorAll('[role="main"], main').length,
    navigation: document.querySelectorAll('[role="navigation"], nav').length,
    banner: document.querySelectorAll('[role="banner"], header').length,
    contentinfo: document.querySelectorAll('[role="contentinfo"], footer').length,
    complementary: document.querySelectorAll('[role="complementary"], aside').length,
    search: document.querySelectorAll('[role="search"]').length,
    form: document.querySelectorAll('[role="form"]').length,
    region: document.querySelectorAll('[role="region"]').length
  };
  
  // Check for problematic ARIA usage
  const ariaIssues = [];
  
  // Check for missing aria-describedby targets
  ariaDescribedBy.forEach(element => {
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const targets = describedBy.split(' ');
      targets.forEach(targetId => {
        if (!document.getElementById(targetId)) {
          ariaIssues.push({
            type: 'missing-target',
            element: element.tagName.toLowerCase(),
            issue: `aria-describedby references non-existent ID: ${targetId}`
          });
        }
      });
    }
  });
  
  // Check for empty aria-label attributes
  ariaLabels.forEach(element => {
    const label = element.getAttribute('aria-label');
    if (!label || label.trim().length === 0) {
      ariaIssues.push({
        type: 'empty-label',
        element: element.tagName.toLowerCase(),
        issue: 'Empty aria-label attribute'
      });
    }
  });
  
  return {
    ariaLabels: ariaLabels.length,
    ariaDescribedBy: ariaDescribedBy.length,
    ariaHidden: ariaHidden.length,
    ariaExpanded: ariaExpanded.length,
    ariaLive: ariaLive.length,
    roleElements: roleElements.length,
    landmarks,
    totalLandmarks: Object.values(landmarks).reduce((sum, count) => sum + count, 0),
    ariaIssues: ariaIssues.slice(0, 10),
    totalAriaElements: ariaLabels.length + ariaDescribedBy.length + ariaHidden.length + ariaExpanded.length + ariaLive.length + roleElements.length
  };
}

function analyzeFormAccessibility(document, forms, inputs) {
  const formAnalysis = {
    total: forms.length,
    withLabels: 0,
    missingLabels: 0,
    withFieldsets: 0,
    withRequiredIndicators: 0,
    withErrorMessages: 0,
    accessibilityIssues: []
  };
  
  // Analyze each input for proper labeling
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const type = input.getAttribute('type') || 'text';
    const tagName = input.tagName.toLowerCase();
    
    // Check for associated label
    let hasLabel = false;
    
    // Method 1: label[for="id"]
    if (id && document.querySelector(`label[for="${id}"]`)) {
      hasLabel = true;
    }
    
    // Method 2: input wrapped in label
    if (!hasLabel && input.closest('label')) {
      hasLabel = true;
    }
    
    // Method 3: aria-label
    if (!hasLabel && input.getAttribute('aria-label')) {
      hasLabel = true;
    }
    
    // Method 4: aria-labelledby
    if (!hasLabel && input.getAttribute('aria-labelledby')) {
      const labelledBy = input.getAttribute('aria-labelledby');
      if (document.getElementById(labelledBy)) {
        hasLabel = true;
      }
    }
    
    if (hasLabel) {
      formAnalysis.withLabels++;
    } else {
      formAnalysis.missingLabels++;
      formAnalysis.accessibilityIssues.push({
        type: 'missing-label',
        element: tagName,
        inputType: type,
        issue: `${tagName}[type="${type}"] missing accessible label`
      });
    }
    
    // Check for required field indicators
    if (input.hasAttribute('required') || input.hasAttribute('aria-required')) {
      formAnalysis.withRequiredIndicators++;
    }
  });
  
  // Analyze forms for fieldsets and legends
  forms.forEach(form => {
    const fieldsets = form.querySelectorAll('fieldset');
    if (fieldsets.length > 0) {
      formAnalysis.withFieldsets++;
      
      // Check if fieldsets have legends
      fieldsets.forEach(fieldset => {
        const legend = fieldset.querySelector('legend');
        if (!legend) {
          formAnalysis.accessibilityIssues.push({
            type: 'missing-legend',
            element: 'fieldset',
            issue: 'Fieldset missing legend element'
          });
        }
      });
    }
  });
  
  // Check for error message associations
  const errorElements = document.querySelectorAll('.error, .error-message, [role="alert"], [aria-live="polite"], [aria-live="assertive"]');
  formAnalysis.withErrorMessages = errorElements.length;
  
  return formAnalysis;
}

function analyzeHeadingHierarchy(document) {
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const hierarchy = [];
  let issues = [];
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent?.trim() || '';
    
    hierarchy.push({
      level,
      text: text.substring(0, 50),
      index
    });
    
    // Check for heading hierarchy issues
    if (index > 0) {
      const prevLevel = hierarchy[index - 1].level;
      if (level > prevLevel + 1) {
        issues.push({
          type: 'skipped-level',
          heading: text.substring(0, 30),
          level,
          previousLevel: prevLevel,
          issue: `Heading level ${level} follows h${prevLevel} (skipped h${prevLevel + 1})`
        });
      }
    }
    
    // Check for empty headings
    if (text.length === 0) {
      issues.push({
        type: 'empty-heading',
        level,
        issue: `Empty h${level} heading`
      });
    }
  });
  
  return {
    totalHeadings: headings.length,
    hierarchy: hierarchy.slice(0, 20), // Limit for performance
    issues: issues.slice(0, 10),
    hasProperHierarchy: issues.filter(issue => issue.type === 'skipped-level').length === 0,
    h1Count: headings.filter(h => h.tagName === 'H1').length
  };
}

// Color analysis helper functions
function extractColorsFromStyle(style) {
  const colors = { foreground: null, background: null };
  
  if (!style) return colors;
  
  // Extract color values
  const colorMatch = style.match(/color:\s*([^;]+)/);
  const backgroundMatch = style.match(/background-color:\s*([^;]+)/);
  const backgroundShortMatch = style.match(/background:\s*([^;]+)/);
  
  if (colorMatch) {
    colors.foreground = parseColor(colorMatch[1].trim());
  }
  
  if (backgroundMatch) {
    colors.background = parseColor(backgroundMatch[1].trim());
  } else if (backgroundShortMatch) {
    // Try to extract color from background shorthand
    const bgValue = backgroundShortMatch[1].trim();
    const colorFromBg = extractColorFromBackground(bgValue);
    if (colorFromBg) {
      colors.background = colorFromBg;
    }
  }
  
  return colors;
}

function parseColor(colorStr) {
  if (!colorStr) return null;
  
  colorStr = colorStr.trim().toLowerCase();
  
  // RGB/RGBA format
  const rgbMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    };
  }
  
  // Hex format
  const hexMatch = colorStr.match(/^#([a-f0-9]{3,8})$/);
  if (hexMatch) {
    return hexToRgb(hexMatch[1]);
  }
  
  // Named colors (basic set)
  const namedColors = {
    black: { r: 0, g: 0, b: 0, a: 1 },
    white: { r: 255, g: 255, b: 255, a: 1 },
    red: { r: 255, g: 0, b: 0, a: 1 },
    green: { r: 0, g: 128, b: 0, a: 1 },
    blue: { r: 0, g: 0, b: 255, a: 1 },
    gray: { r: 128, g: 128, b: 128, a: 1 },
    grey: { r: 128, g: 128, b: 128, a: 1 }
  };
  
  return namedColors[colorStr] || null;
}

function hexToRgb(hex) {
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
    a: 1
  };
  
  if (hex.length === 8) {
    result.a = parseInt(hex.substring(6, 8), 16) / 255;
  }
  
  return result;
}

function extractColorFromBackground(bgValue) {
  // Simple extraction - looks for color values in background shorthand
  const colorPatterns = [
    /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/,
    /#[a-f0-9]{3,8}/i,
    /\b(black|white|red|green|blue|gray|grey)\b/i
  ];
  
  for (const pattern of colorPatterns) {
    const match = bgValue.match(pattern);
    if (match) {
      return parseColor(match[0]);
    }
  }
  
  return null;
}

function calculateContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color) {
  const { r, g, b } = color;
  
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  const rLinear = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const gLinear = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const bLinear = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function extractFontSizeFromStyle(style) {
  if (!style) return null;
  
  const fontSizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)(px|pt|em|rem)/);
  if (fontSizeMatch) {
    const sizeValue = parseFloat(fontSizeMatch[1]);
    const unit = fontSizeMatch[2];
    
    // Convert to px (approximate)
    if (unit === 'pt') return sizeValue * 1.33;
    if (unit === 'em' || unit === 'rem') return sizeValue * 16;
    return sizeValue; // px
  }
  
  return null;
}

function isBoldText(element, style) {
  // Check for bold in inline style
  if (style && /font-weight:\s*(bold|[6-9]\d\d)/i.test(style)) {
    return true;
  }
  
  // Check for bold HTML elements
  const boldTags = ['b', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  return boldTags.includes(element.tagName.toLowerCase());
}

function analyzeCSSColorCombinations(document) {
  // Look for common problematic color combinations in style elements
  const styleElements = [...document.querySelectorAll('style')];
  const issues = [];
  
  styleElements.forEach(styleEl => {
    const cssText = styleEl.textContent || '';
    
    // Look for potentially problematic color combinations
    const problematicCombos = [
      { fg: /red/i, bg: /green/i, issue: 'Red text on green background (colorblind unfriendly)' },
      { fg: /green/i, bg: /red/i, issue: 'Green text on red background (colorblind unfriendly)' },
      { fg: /blue/i, bg: /purple/i, issue: 'Blue text on purple background (low contrast)' },
      { fg: /yellow/i, bg: /white/i, issue: 'Yellow text on white background (poor contrast)' }
    ];
    
    problematicCombos.forEach(combo => {
      if (combo.fg.test(cssText) && combo.bg.test(cssText)) {
        issues.push({
          type: 'css-color-combination',
          issue: combo.issue,
          severity: 'medium'
        });
      }
    });
  });
  
  return issues.slice(0, 5); // Limit for performance
}

function calculateAccessibilityScore(data) {
  let score = 0;
  const maxScore = 100;
  
  // Image alt text (25 points)
  if (data.images > 0) {
    const altPercentage = data.imagesWithAlt / data.images;
    score += altPercentage * 25;
  } else {
    score += 25; // No images = full points
  }
  
  // Form labels (25 points)
  if (data.forms > 0) {
    const labelPercentage = data.inputsWithLabels / (data.inputsWithLabels + (data.forms * 2)); // Approximate inputs per form
    score += labelPercentage * 25;
  } else {
    score += 25; // No forms = full points
  }
  
  // Color contrast (30 points)
  if (data.contrastIssues > 0) {
    const contrastPenalty = Math.min(30, data.contrastIssues * 2);
    score += Math.max(0, 30 - contrastPenalty);
  } else {
    score += 30; // No contrast issues = full points
  }
  
  // ARIA usage (20 points)
  if (data.ariaElements > 0) {
    score += Math.min(20, data.ariaElements * 2);
  }
  
  return Math.min(maxScore, Math.round(score));
}

function getFileExtension(pathname) {
  const lastDot = pathname.lastIndexOf('.');
  const lastSlash = pathname.lastIndexOf('/');
  
  if (lastDot > lastSlash && lastDot !== -1) {
    return pathname.substring(lastDot + 1).toLowerCase();
  }
  return '';
}

// Readability and complexity analysis functions
function calculateReadabilityScores(text) {
  if (!text || text.trim().length === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGradeLevel: 0,
      averageSentenceLength: 0,
      averageSyllablesPerWord: 0,
      complexWordPercentage: 0,
      readingLevel: 'No content'
    };
  }

  // Clean and prepare text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count sentences (improved sentence detection)
  const sentences = cleanText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  
  // Count words
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  if (wordCount === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGradeLevel: 0,
      averageSentenceLength: 0,
      averageSyllablesPerWord: 0,
      complexWordPercentage: 0,
      readingLevel: 'No content'
    };
  }
  
  // Count syllables for each word
  let totalSyllables = 0;
  let complexWords = 0; // Words with 3+ syllables
  
  words.forEach(word => {
    const syllableCount = countSyllables(word);
    totalSyllables += syllableCount;
    if (syllableCount >= 3) {
      complexWords++;
    }
  });
  
  // Calculate metrics
  const averageSentenceLength = wordCount / sentenceCount;
  const averageSyllablesPerWord = totalSyllables / wordCount;
  const complexWordPercentage = (complexWords / wordCount) * 100;
  
  // Flesch Reading Ease Score
  // Formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
  const fleschReadingEase = Math.max(0, Math.min(100, 
    206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord)
  ));
  
  // Flesch-Kincaid Grade Level
  // Formula: (0.39 × ASL) + (11.8 × ASW) - 15.59
  const fleschKincaidGradeLevel = Math.max(0,
    (0.39 * averageSentenceLength) + (11.8 * averageSyllablesPerWord) - 15.59
  );
  
  // Determine reading level based on Flesch Reading Ease
  let readingLevel;
  if (fleschReadingEase >= 90) readingLevel = 'Very Easy (5th grade)';
  else if (fleschReadingEase >= 80) readingLevel = 'Easy (6th grade)';
  else if (fleschReadingEase >= 70) readingLevel = 'Fairly Easy (7th grade)';
  else if (fleschReadingEase >= 60) readingLevel = 'Standard (8th-9th grade)';
  else if (fleschReadingEase >= 50) readingLevel = 'Fairly Difficult (10th-12th grade)';
  else if (fleschReadingEase >= 30) readingLevel = 'Difficult (College level)';
  else readingLevel = 'Very Difficult (Graduate level)';
  
  return {
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGradeLevel: Math.round(fleschKincaidGradeLevel * 10) / 10,
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100,
    complexWordPercentage: Math.round(complexWordPercentage * 10) / 10,
    readingLevel,
    sentenceCount,
    wordCount,
    syllableCount: totalSyllables,
    complexWordCount: complexWords
  };
}

function countSyllables(word) {
  // Remove punctuation and convert to lowercase
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  let syllableCount = 0;
  let previousWasVowel = false;
  const vowels = 'aeiouy';
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e' at the end
  if (word.endsWith('e') && syllableCount > 1) {
    syllableCount--;
  }
  
  // Handle special cases
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    syllableCount++;
  }
  
  // Ensure at least 1 syllable
  return Math.max(1, syllableCount);
}

// Helper functions for mobile-friendliness analysis
function parseViewportContent(viewport) {
  const settings = {};
  if (!viewport) return settings;
  
  const parts = viewport.split(',').map(part => part.trim());
  parts.forEach(part => {
    const [key, value] = part.split('=').map(item => item.trim());
    if (key && value) {
      settings[key] = value;
    }
  });
  
  return settings;
}

function checkForMediaQueries(document) {
  const styleElements = [...document.querySelectorAll('style')];
  const linkElements = [...document.querySelectorAll('link[rel="stylesheet"]')];
  
  // Check inline styles for media queries
  const hasInlineMediaQueries = styleElements.some(style => 
    style.textContent && style.textContent.includes('@media')
  );
  
  // Check for responsive CSS link elements
  const hasResponsiveCSSLinks = linkElements.some(link =>
    link.getAttribute('media') && link.getAttribute('media').includes('screen')
  );
  
  return hasInlineMediaQueries || hasResponsiveCSSLinks;
}

function checkForFlexboxCSS(document) {
  const styleElements = [...document.querySelectorAll('style')];
  return styleElements.some(style => 
    style.textContent && (
      style.textContent.includes('display: flex') ||
      style.textContent.includes('display:flex') ||
      style.textContent.includes('flex-direction') ||
      style.textContent.includes('flex-wrap')
    )
  );
}

function checkForResponsiveImages(document) {
  const images = [...document.querySelectorAll('img')];
  return images.some(img => 
    img.hasAttribute('srcset') || 
    img.hasAttribute('sizes') ||
    img.closest('picture') !== null
  );
}

function checkForFixedWidthTables(document) {
  const tables = [...document.querySelectorAll('table')];
  return tables.some(table => {
    const width = table.getAttribute('width');
    const style = table.getAttribute('style') || '';
    return (width && !width.includes('%')) || 
           (style.includes('width:') && !style.includes('%'));
  });
}

function checkForSmallText(document) {
  const textElements = [...document.querySelectorAll('p, div, span, td, th, li')];
  return textElements.some(element => {
    // In Node.js environment, we can't access getComputedStyle
    // Check for inline styles only
    const style = element.getAttribute('style') || '';
    if (style.includes('font-size')) {
      const fontSizeMatch = style.match(/font-size:\s*(\d+)(px|pt)/);
      if (fontSizeMatch) {
        const sizeValue = parseFloat(fontSizeMatch[1]);
        const unit = fontSizeMatch[2];
        return (unit === 'px' && sizeValue < 12) || (unit === 'pt' && sizeValue < 9);
      }
    }
    return false;
  });
}

function analyzeFontSizes(document) {
  const textElements = [...document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th')];
  const fontSizes = [];
  
  textElements.forEach(element => {
    // In Node.js environment, we can only check inline styles
    const style = element.getAttribute('style') || '';
    if (style.includes('font-size')) {
      const fontSizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)(px|pt|em|rem)/);
      if (fontSizeMatch) {
        const sizeValue = parseFloat(fontSizeMatch[1]);
        if (!isNaN(sizeValue)) {
          // Convert to px for consistency (approximate)
          let pxSize = sizeValue;
          const unit = fontSizeMatch[2];
          if (unit === 'pt') pxSize = sizeValue * 1.33;
          else if (unit === 'em' || unit === 'rem') pxSize = sizeValue * 16;
          
          fontSizes.push(pxSize);
        }
      }
    }
  });
  
  const smallTextCount = fontSizes.filter(size => size < 12).length;
  const averageFontSize = fontSizes.length > 0 ? fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length : 0;
  
  return {
    totalElements: textElements.length,
    analyzedElements: fontSizes.length,
    smallTextCount,
    smallTextPercentage: fontSizes.length > 0 ? (smallTextCount / fontSizes.length * 100) : 0,
    averageFontSize: Math.round(averageFontSize * 10) / 10,
    minFontSize: fontSizes.length > 0 ? Math.min(...fontSizes) : 0,
    maxFontSize: fontSizes.length > 0 ? Math.max(...fontSizes) : 0
  };
}

function analyzeTouchTargets(document) {
  const interactiveElements = [...document.querySelectorAll('a, button, input[type="button"], input[type="submit"], input[type="reset"], [onclick], [role="button"]')];
  
  let smallTargetsCount = 0;
  const targetSizes = [];
  
  interactiveElements.forEach(element => {
    // In Node.js environment, getBoundingClientRect is not available
    // We'll use approximate sizing based on content and attributes
    const style = element.getAttribute('style') || '';
    let width = 0, height = 0;
    
    // Check for explicit width/height in style
    const widthMatch = style.match(/width:\s*(\d+)(px|%)/);
    const heightMatch = style.match(/height:\s*(\d+)(px|%)/);
    
    if (widthMatch && widthMatch[2] === 'px') width = parseFloat(widthMatch[1]);
    if (heightMatch && heightMatch[2] === 'px') height = parseFloat(heightMatch[1]);
    
    // Estimate size based on content if no explicit size
    if (width === 0 || height === 0) {
      const textLength = element.textContent?.trim().length || 0;
      const estimatedWidth = Math.max(textLength * 8, 44); // Rough estimate
      const estimatedHeight = 32; // Default button height estimate
      
      width = width || estimatedWidth;
      height = height || estimatedHeight;
    }
    
    const minDimension = Math.min(width, height);
    targetSizes.push(minDimension);
    
    // Touch targets should be at least 44px (iOS) or 48dp (Android) ≈ 44-48px
    if (minDimension < 44 && minDimension > 0) {
      smallTargetsCount++;
    }
  });
  
  return {
    totalTargets: interactiveElements.length,
    smallTargetsCount,
    smallTargetsPercentage: interactiveElements.length > 0 ? (smallTargetsCount / interactiveElements.length * 100) : 0,
    averageTargetSize: targetSizes.length > 0 ? targetSizes.reduce((a, b) => a + b, 0) / targetSizes.length : 0
  };
}

function calculateMobileScore(data) {
  let score = 0;
  const maxScore = 100;
  
  // Viewport (30 points)
  if (data.viewport.width === 'device-width') score += 20;
  if (data.viewport.initialScale === '1.0' || data.viewport['initial-scale'] === '1') score += 10;
  
  // Mobile features (40 points)
  if (data.hasTouchIcons) score += 5;
  if (data.hasMediaQueries) score += 15;
  if (data.hasFlexboxCSS) score += 10;
  if (data.hasResponsiveImages) score += 10;
  
  // Penalties for mobile-unfriendly elements (up to -30 points)
  if (data.hasFlashContent) score -= 15;
  if (data.hasFixedWidthTables) score -= 10;
  if (data.hasSmallText) score -= 5;
  
  // Font size bonus/penalty (10 points)
  if (data.fontSizeAnalysis.smallTextPercentage < 10) score += 10;
  else if (data.fontSizeAnalysis.smallTextPercentage > 30) score -= 5;
  
  // Touch target bonus/penalty (20 points)
  if (data.touchTargetAnalysis.smallTargetsPercentage < 10) score += 20;
  else if (data.touchTargetAnalysis.smallTargetsPercentage > 30) score -= 10;
  
  return Math.max(0, Math.min(maxScore, score));
}

// Helper functions for security analysis
function extractHSTSMaxAge(hstsHeader) {
  const match = hstsHeader.match(/max-age=(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function calculateSecurityScore(securityHeaders, sslInfo, mixedContent, cookies) {
  let score = 0;
  const maxScore = 100;
  
  // HTTPS (20 points)
  if (sslInfo.isHTTPS) score += 20;
  
  // Security headers (50 points total)
  if (securityHeaders.hsts) score += 10; // HSTS
  if (securityHeaders.csp) score += 10; // Content Security Policy
  if (securityHeaders.xfo) score += 8; // X-Frame-Options
  if (securityHeaders.xss) score += 7; // X-XSS-Protection
  if (securityHeaders.contentType) score += 8; // X-Content-Type-Options
  if (securityHeaders.referrer) score += 7; // Referrer-Policy
  
  // Mixed content scoring (20 points)
  if (mixedContent) {
    if (mixedContent.riskLevel === 'none') score += 20;
    else if (mixedContent.riskLevel === 'low') score += 15;
    else if (mixedContent.riskLevel === 'medium') score += 8;
    else if (mixedContent.riskLevel === 'high') score += 0;
  }
  
  // Cookie compliance scoring (10 points)
  if (cookies) {
    const cookieScore = (cookies.complianceScore / 100) * 10;
    score += cookieScore;
  }
  
  return Math.min(maxScore, score);
}

// Mixed content analysis
function analyzeMixedContent(document, isHTTPS) {
  if (!isHTTPS) {
    return {
      hasMixedContent: false,
      issues: [],
      riskLevel: 'none',
      summary: 'Not applicable - page is not served over HTTPS'
    };
  }
  
  const issues = [];
  const riskLevels = { low: 0, medium: 0, high: 0 };
  
  // Check for HTTP resources in HTTPS page
  const httpImages = [...document.querySelectorAll('img[src^="http://"]')];
  httpImages.forEach((img, index) => {
    issues.push({
      type: 'image',
      element: 'img',
      src: img.src.substring(0, 100),
      risk: 'medium',
      description: 'HTTP image on HTTPS page'
    });
    riskLevels.medium++;
  });
  
  const httpScripts = [...document.querySelectorAll('script[src^="http://"]')];
  httpScripts.forEach((script, index) => {
    issues.push({
      type: 'script',
      element: 'script',
      src: script.src.substring(0, 100),
      risk: 'high',
      description: 'HTTP script on HTTPS page (active mixed content)'
    });
    riskLevels.high++;
  });
  
  const httpStylesheets = [...document.querySelectorAll('link[rel="stylesheet"][href^="http://"]')];
  httpStylesheets.forEach((link, index) => {
    issues.push({
      type: 'stylesheet',
      element: 'link',
      src: link.href.substring(0, 100),
      risk: 'high',
      description: 'HTTP stylesheet on HTTPS page (active mixed content)'
    });
    riskLevels.high++;
  });
  
  const httpIframes = [...document.querySelectorAll('iframe[src^="http://"]')];
  httpIframes.forEach((iframe, index) => {
    issues.push({
      type: 'iframe',
      element: 'iframe',
      src: iframe.src.substring(0, 100),
      risk: 'high',
      description: 'HTTP iframe on HTTPS page (active mixed content)'
    });
    riskLevels.high++;
  });
  
  const httpVideos = [...document.querySelectorAll('video source[src^="http://"], video[src^="http://"]')];
  httpVideos.forEach((video, index) => {
    const src = video.src || video.getAttribute('src') || '';
    issues.push({
      type: 'video',
      element: video.tagName.toLowerCase(),
      src: src.substring(0, 100),
      risk: 'medium',
      description: 'HTTP video on HTTPS page'
    });
    riskLevels.medium++;
  });
  
  const httpAudios = [...document.querySelectorAll('audio source[src^="http://"], audio[src^="http://"]')];
  httpAudios.forEach((audio, index) => {
    const src = audio.src || audio.getAttribute('src') || '';
    issues.push({
      type: 'audio',
      element: audio.tagName.toLowerCase(),
      src: src.substring(0, 100),
      risk: 'medium',
      description: 'HTTP audio on HTTPS page'
    });
    riskLevels.medium++;
  });
  
  // Check for HTTP links (not mixed content but security concern)
  const httpLinks = [...document.querySelectorAll('a[href^="http://"]')];
  httpLinks.forEach((link, index) => {
    if (index < 10) { // Limit to first 10 to avoid performance issues
      issues.push({
        type: 'link',
        element: 'a',
        src: link.href.substring(0, 100),
        risk: 'low',
        description: 'HTTP link on HTTPS page (potential security concern)'
      });
      riskLevels.low++;
    }
  });
  
  // Check for HTTP form actions
  const httpForms = [...document.querySelectorAll('form[action^="http://"]')];
  httpForms.forEach((form, index) => {
    issues.push({
      type: 'form',
      element: 'form',
      src: form.action.substring(0, 100),
      risk: 'high',
      description: 'HTTP form action on HTTPS page (very dangerous)'
    });
    riskLevels.high++;
  });
  
  // Determine overall risk level
  let overallRisk = 'none';
  if (riskLevels.high > 0) overallRisk = 'high';
  else if (riskLevels.medium > 0) overallRisk = 'medium';
  else if (riskLevels.low > 0) overallRisk = 'low';
  
  return {
    hasMixedContent: issues.length > 0,
    totalIssues: issues.length,
    issues: issues.slice(0, 20), // Limit for performance
    riskLevel: overallRisk,
    riskCounts: riskLevels,
    summary: issues.length === 0 ? 
      'No mixed content issues detected' : 
      `${issues.length} mixed content issues found (${riskLevels.high} high risk, ${riskLevels.medium} medium risk, ${riskLevels.low} low risk)`,
    activeMixedContent: riskLevels.high > 0,
    passiveMixedContent: riskLevels.medium > 0 || riskLevels.low > 0
  };
}

// Cookie policy compliance analysis
function analyzeCookieCompliance(document, headers) {
  const cookieAnalysis = {
    hasCookies: false,
    cookieCount: 0,
    secureFlags: 0,
    httpOnlyFlags: 0,
    sameSiteFlags: 0,
    hasCookiePolicy: false,
    hasCookieBanner: false,
    hasConsentMechanism: false,
    gdprCompliance: false,
    cookieDetails: []
  };
  
  // Analyze Set-Cookie headers
  const setCookieHeaders = headers['set-cookie'];
  if (setCookieHeaders) {
    const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    cookieAnalysis.hasCookies = true;
    cookieAnalysis.cookieCount = cookies.length;
    
    cookies.forEach((cookie, index) => {
      const cookieData = parseCookieHeader(cookie);
      cookieAnalysis.cookieDetails.push(cookieData);
      
      if (cookieData.secure) cookieAnalysis.secureFlags++;
      if (cookieData.httpOnly) cookieAnalysis.httpOnlyFlags++;
      if (cookieData.sameSite) cookieAnalysis.sameSiteFlags++;
    });
  }
  
  // Check for cookie policy page/link
  const cookiePolicySelectors = [
    'a[href*="cookie"]', 'a[href*="privacy"]', 
    'a[href*="policy"]', '.cookie-policy', '#cookie-policy'
  ];
  
  for (const selector of cookiePolicySelectors) {
    const elements = [...document.querySelectorAll(selector)];
    if (elements.some(el => /cookie|privacy|policy/i.test(el.textContent))) {
      cookieAnalysis.hasCookiePolicy = true;
      break;
    }
  }
  
  // Check for cookie banner/notice
  const cookieBannerSelectors = [
    '.cookie-banner', '.cookie-notice', '.cookie-bar', 
    '#cookie-banner', '#cookie-notice', '#cookie-bar',
    '[data-cookie]', '[class*="cookie"]', '[id*="cookie"]'
  ];
  
  for (const selector of cookieBannerSelectors) {
    const element = document.querySelector(selector);
    if (element && /cookie|consent|privacy/i.test(element.textContent)) {
      cookieAnalysis.hasCookieBanner = true;
      break;
    }
  }
  
  // Check for consent mechanisms
  const consentSelectors = [
    'button[data-accept]', 'button[data-consent]', '.accept-cookies',
    '.consent-button', '#accept-cookies', 'button[onclick*="cookie"]'
  ];
  
  for (const selector of consentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      cookieAnalysis.hasConsentMechanism = true;
      break;
    }
  }
  
  // Check for GDPR compliance indicators
  const gdprKeywords = ['gdpr', 'general data protection', 'data protection', 'eu privacy'];
  const pageText = document.body.textContent.toLowerCase();
  cookieAnalysis.gdprCompliance = gdprKeywords.some(keyword => pageText.includes(keyword));
  
  // Calculate compliance score
  let complianceScore = 0;
  const maxScore = 100;
  
  if (cookieAnalysis.hasCookies) {
    // Security flags scoring (40 points)
    const securePercentage = cookieAnalysis.secureFlags / cookieAnalysis.cookieCount;
    const httpOnlyPercentage = cookieAnalysis.httpOnlyFlags / cookieAnalysis.cookieCount;
    const sameSitePercentage = cookieAnalysis.sameSiteFlags / cookieAnalysis.cookieCount;
    complianceScore += (securePercentage + httpOnlyPercentage + sameSitePercentage) * 13.33;
    
    // Policy and consent scoring (60 points)
    if (cookieAnalysis.hasCookiePolicy) complianceScore += 20;
    if (cookieAnalysis.hasCookieBanner) complianceScore += 20;
    if (cookieAnalysis.hasConsentMechanism) complianceScore += 15;
    if (cookieAnalysis.gdprCompliance) complianceScore += 5;
  } else {
    // No cookies = perfect compliance
    complianceScore = maxScore;
  }
  
  cookieAnalysis.complianceScore = Math.min(maxScore, Math.round(complianceScore));
  
  return cookieAnalysis;
}

// Parse individual cookie header
function parseCookieHeader(cookieHeader) {
  const parts = cookieHeader.split(';').map(part => part.trim());
  const [nameValue] = parts;
  const [name, value] = nameValue.split('=');
  
  const cookie = {
    name: name || '',
    value: value || '',
    secure: false,
    httpOnly: false,
    sameSite: null,
    maxAge: null,
    expires: null,
    domain: null,
    path: null
  };
  
  parts.slice(1).forEach(part => {
    const [key, val] = part.split('=');
    const lowerKey = key.toLowerCase();
    
    switch (lowerKey) {
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = val || 'true';
        break;
      case 'max-age':
        cookie.maxAge = parseInt(val) || null;
        break;
      case 'expires':
        cookie.expires = val;
        break;
      case 'domain':
        cookie.domain = val;
        break;
      case 'path':
        cookie.path = val;
        break;
    }
  });
  
  return cookie;
}

// URL pattern analysis functions
function analyzeUrlPatterns(url, pathSegments) {
  const patterns = {
    hasNumericSegments: pathSegments.some(segment => /^\d+$/.test(segment)),
    hasDateLikeSegments: pathSegments.some(segment => /^\d{4}$|^\d{2}$|^\d{4}-\d{2}$|^\d{4}-\d{2}-\d{2}$/.test(segment)),
    hasHyphenatedSegments: pathSegments.some(segment => segment.includes('-')),
    hasUnderscoreSegments: pathSegments.some(segment => segment.includes('_')),
    hasCamelCaseSegments: pathSegments.some(segment => /[a-z][A-Z]/.test(segment)),
    hasFileExtensions: pathSegments.some(segment => /\.[a-zA-Z0-9]+$/.test(segment)),
    hasQueryParameters: url.search.length > 0,
    hasFragment: url.hash.length > 0,
    
    // URL structure patterns
    followsRestfulPattern: checkRestfulPattern(pathSegments),
    hasConsistentNaming: checkNamingConsistency(pathSegments),
    hasRedundantSegments: checkRedundantSegments(pathSegments),
    
    // Parameter patterns
    parameterPatterns: analyzeParameterPatterns(url.search)
  };
  
  return patterns;
}

function calculateUrlComplexity(fullUrl, pathSegments) {
  let complexity = 0;
  
  // Base complexity from depth
  complexity += pathSegments.length * 2;
  
  // Length penalty
  if (fullUrl.length > 100) complexity += 3;
  else if (fullUrl.length > 50) complexity += 1;
  
  // Special characters add complexity
  const specialCharCount = (fullUrl.match(/[^a-zA-Z0-9\/\-_.?&=]/g) || []).length;
  complexity += specialCharCount;
  
  // Parameters add complexity
  const params = new URLSearchParams(new URL(fullUrl).search);
  complexity += params.size;
  
  // Mixed case adds complexity
  if (/[a-z]/.test(fullUrl) && /[A-Z]/.test(fullUrl)) complexity += 1;
  
  return {
    score: complexity,
    level: complexity <= 5 ? 'Simple' : complexity <= 10 ? 'Moderate' : complexity <= 15 ? 'Complex' : 'Very Complex'
  };
}

function checkRestfulPattern(pathSegments) {
  if (pathSegments.length === 0) return { isRestful: true, confidence: 'high' };
  
  // Common RESTful patterns
  const restfulPatterns = [
    /^(api|v\d+)$/i,           // API versioning
    /^(users?|posts?|articles?|products?)$/i,  // Resource collections
    /^\d+$/,                   // Resource IDs
    /^(edit|new|create|update|delete)$/i,      // Actions
    /^(admin|dashboard|settings)$/i            // Administrative sections
  ];
  
  let restfulSegments = 0;
  let totalSegments = pathSegments.length;
  
  pathSegments.forEach(segment => {
    if (restfulPatterns.some(pattern => pattern.test(segment))) {
      restfulSegments++;
    }
  });
  
  const ratio = restfulSegments / totalSegments;
  
  return {
    isRestful: ratio >= 0.6,
    confidence: ratio >= 0.8 ? 'high' : ratio >= 0.6 ? 'medium' : 'low',
    ratio: Math.round(ratio * 100) / 100
  };
}

function checkNamingConsistency(pathSegments) {
  if (pathSegments.length <= 1) return { isConsistent: true, issues: [] };
  
  const issues = [];
  const namingStyles = {
    hyphenated: 0,
    underscored: 0,
    camelCase: 0,
    lowercase: 0,
    mixed: 0
  };
  
  pathSegments.forEach(segment => {
    if (segment.includes('-')) namingStyles.hyphenated++;
    else if (segment.includes('_')) namingStyles.underscored++;
    else if (/[a-z][A-Z]/.test(segment)) namingStyles.camelCase++;
    else if (segment === segment.toLowerCase()) namingStyles.lowercase++;
    else namingStyles.mixed++;
  });
  
  // Check for mixed naming conventions
  const usedStyles = Object.entries(namingStyles).filter(([, count]) => count > 0).length;
  
  if (usedStyles > 2) {
    issues.push('Mixed naming conventions detected');
  }
  
  if (namingStyles.mixed > 0) {
    issues.push('Inconsistent capitalization');
  }
  
  return {
    isConsistent: issues.length === 0,
    issues,
    dominantStyle: Object.entries(namingStyles).reduce((a, b) => namingStyles[a[0]] > namingStyles[b[0]] ? a : b)[0],
    styleDistribution: namingStyles
  };
}

function checkRedundantSegments(pathSegments) {
  const redundantPatterns = [
    { pattern: /^(page|p)$/i, description: 'Unnecessary "page" segments' },
    { pattern: /^index$/i, description: 'Unnecessary "index" segments' },
    { pattern: /^default$/i, description: 'Unnecessary "default" segments' },
    { pattern: /^home$/i, description: 'Unnecessary "home" segments in deep URLs' }
  ];
  
  const redundantSegments = [];
  
  pathSegments.forEach((segment, index) => {
    redundantPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(segment)) {
        redundantSegments.push({
          segment,
          position: index,
          description
        });
      }
    });
    
    // Check for duplicate segments
    const duplicateIndex = pathSegments.indexOf(segment, index + 1);
    if (duplicateIndex !== -1) {
      redundantSegments.push({
        segment,
        position: index,
        description: `Duplicate segment found at position ${duplicateIndex}`
      });
    }
  });
  
  return {
    hasRedundancy: redundantSegments.length > 0,
    redundantSegments
  };
}

function analyzeParameterPatterns(queryString) {
  if (!queryString) return { hasParameters: false };
  
  const params = new URLSearchParams(queryString);
  const paramEntries = [...params.entries()];
  
  const patterns = {
    hasParameters: true,
    parameterCount: paramEntries.length,
    hasEmptyValues: paramEntries.some(([, value]) => value === ''),
    hasNumericValues: paramEntries.some(([, value]) => /^\d+$/.test(value)),
    hasSpecialCharacters: paramEntries.some(([key, value]) => 
      /[^a-zA-Z0-9_-]/.test(key) || /[^a-zA-Z0-9_.-]/.test(value)
    ),
    hasLongValues: paramEntries.some(([, value]) => value.length > 50),
    
    // Common parameter patterns
    hasUtmTracking: paramEntries.some(([key]) => key.startsWith('utm_')),
    hasSessionId: paramEntries.some(([key]) => /session|sid|sessid/i.test(key)),
    hasPagination: paramEntries.some(([key]) => /page|offset|limit|start/i.test(key)),
    hasFiltering: paramEntries.some(([key]) => /filter|sort|order|category|tag/i.test(key)),
    
    parameterNames: paramEntries.map(([key]) => key),
    averageValueLength: paramEntries.length > 0 ? 
      paramEntries.reduce((sum, [, value]) => sum + value.length, 0) / paramEntries.length : 0
  };
  
  return patterns;
}

// Navigation analysis helper functions
function analyzeBreadcrumbs(document, pageUrl) {
  // Enhanced breadcrumb selectors
  const breadcrumbSelectors = [
    '[aria-label*="breadcrumb"]',
    '.breadcrumb',
    '.breadcrumbs',
    '[role="navigation"] ol',
    '[role="navigation"] ul',
    '.nav-breadcrumb',
    '.page-breadcrumb',
    'nav[aria-label*="breadcrumb"]'
  ];
  
  let breadcrumbContainer = null;
  for (const selector of breadcrumbSelectors) {
    breadcrumbContainer = document.querySelector(selector);
    if (breadcrumbContainer) break;
  }
  
  if (!breadcrumbContainer) {
    return {
      present: false,
      depth: 0,
      links: [],
      structure: 'none',
      isAccessible: false
    };
  }
  
  // Extract breadcrumb links
  const breadcrumbLinks = [...breadcrumbContainer.querySelectorAll('a, span, li')];
  const links = breadcrumbLinks.map((element, index) => {
    const text = element.textContent?.trim() || '';
    const href = element.getAttribute('href') || '';
    const isClickable = element.tagName.toLowerCase() === 'a' && href;
    
    return {
      text,
      href,
      isClickable,
      position: index,
      isCurrentPage: !isClickable && index === breadcrumbLinks.length - 1
    };
  }).filter(link => link.text.length > 0);
  
  // Analyze breadcrumb structure
  const separators = breadcrumbContainer.textContent?.match(/[>\/\\|→»]/g) || [];
  const hasStructuredData = breadcrumbContainer.querySelector('[typeof="BreadcrumbList"]') !== null;
  const hasAriaLabel = breadcrumbContainer.hasAttribute('aria-label');
  const hasRole = breadcrumbContainer.getAttribute('role') === 'navigation';
  
  return {
    present: true,
    depth: links.length,
    links: links.slice(0, 10), // Limit for performance
    structure: links.length > 1 ? 'hierarchical' : 'single',
    separatorType: separators.length > 0 ? separators[0] : 'none',
    separatorCount: separators.length,
    isAccessible: hasAriaLabel || hasRole,
    hasStructuredData,
    currentPageInBreadcrumb: links.some(link => link.isCurrentPage),
    homeLink: links.length > 0 ? links[0] : null
  };
}

function analyzeMainNavigation(document, currentDomain) {
  // Find main navigation
  const navSelectors = [
    'nav[role="navigation"]:first-of-type',
    'nav:first-of-type',
    '[role="navigation"]:first-of-type',
    '.main-nav',
    '.primary-nav',
    '.navbar',
    'header nav',
    '.navigation'
  ];
  
  let mainNav = null;
  for (const selector of navSelectors) {
    mainNav = document.querySelector(selector);
    if (mainNav) break;
  }
  
  if (!mainNav) {
    return {
      present: false,
      linkCount: 0,
      structure: 'none',
      maxDepth: 0,
      links: []
    };
  }
  
  // Extract navigation links
  const navLinks = [...mainNav.querySelectorAll('a[href]')];
  const links = navLinks.map((link, index) => {
    const text = link.textContent?.trim() || '';
    const href = link.getAttribute('href') || '';
    let isInternal = false;
    
    try {
      const url = new URL(href, document.location.href);
      isInternal = url.hostname === currentDomain;
    } catch {
      isInternal = href.startsWith('/') || href.startsWith('#') || !href.includes('://');
    }
    
    // Determine navigation level/depth
    const parentLi = link.closest('li');
    const depth = parentLi ? getElementDepth(parentLi, mainNav) : 1;
    
    return {
      text,
      href,
      isInternal,
      depth,
      position: index,
      hasSubMenu: parentLi?.querySelector('ul, ol') !== null,
      isDropdown: link.getAttribute('aria-haspopup') === 'true' || 
                 link.getAttribute('data-toggle') === 'dropdown'
    };
  }).filter(link => link.text.length > 0);
  
  // Analyze navigation structure
  const hasDropdowns = links.some(link => link.hasSubMenu || link.isDropdown);
  const maxDepth = links.length > 0 ? Math.max(...links.map(link => link.depth)) : 0;
  const internalLinks = links.filter(link => link.isInternal);
  const externalLinks = links.filter(link => !link.isInternal);
  
  // Check for mega menu
  const hasMegaMenu = mainNav.querySelector('.mega-menu, .dropdown-mega') !== null;
  
  return {
    present: true,
    linkCount: links.length,
    internalLinkCount: internalLinks.length,
    externalLinkCount: externalLinks.length,
    structure: hasDropdowns ? 'hierarchical' : 'flat',
    maxDepth,
    hasDropdowns,
    hasMegaMenu,
    links: links.slice(0, 20), // Limit for performance
    
    // Accessibility features
    hasAriaLabels: navLinks.some(link => link.hasAttribute('aria-label')),
    hasAriaExpanded: navLinks.some(link => link.hasAttribute('aria-expanded')),
    hasKeyboardSupport: mainNav.querySelector('[tabindex]') !== null
  };
}

function analyzeFooterNavigation(document, currentDomain) {
  // Find footer
  const footerSelectors = [
    'footer',
    '[role="contentinfo"]',
    '.footer',
    '.site-footer',
    '.page-footer'
  ];
  
  let footer = null;
  for (const selector of footerSelectors) {
    footer = document.querySelector(selector);
    if (footer) break;
  }
  
  if (!footer) {
    return {
      present: false,
      linkCount: 0,
      structure: 'none',
      categories: []
    };
  }
  
  // Extract footer links
  const footerLinks = [...footer.querySelectorAll('a[href]')];
  const links = footerLinks.map((link, index) => {
    const text = link.textContent?.trim() || '';
    const href = link.getAttribute('href') || '';
    let isInternal = false;
    
    try {
      const url = new URL(href, document.location.href);
      isInternal = url.hostname === currentDomain;
    } catch {
      isInternal = href.startsWith('/') || href.startsWith('#') || !href.includes('://');
    }
    
    // Categorize footer links
    const category = categorizeFooterLink(text, href);
    const parentSection = link.closest('section, div, nav, ul');
    const sectionTitle = parentSection?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim() || '';
    
    return {
      text,
      href,
      isInternal,
      category,
      sectionTitle,
      position: index
    };
  }).filter(link => link.text.length > 0);
  
  // Analyze footer structure
  const categories = [...new Set(links.map(link => link.category))];
  const sections = [...new Set(links.map(link => link.sectionTitle).filter(title => title.length > 0))];
  const internalLinks = links.filter(link => link.isInternal);
  const externalLinks = links.filter(link => !link.isInternal);
  
  // Detect footer patterns
  const hasColumnStructure = footer.querySelectorAll('.col, .column, [class*="col-"]').length > 1;
  const hasSocialLinks = links.some(link => link.category === 'social');
  const hasLegalLinks = links.some(link => link.category === 'legal');
  const hasContactInfo = footer.textContent?.match(/(email|phone|address|contact)/i) !== null;
  
  return {
    present: true,
    linkCount: links.length,
    internalLinkCount: internalLinks.length,
    externalLinkCount: externalLinks.length,
    structure: hasColumnStructure ? 'columnar' : 'linear',
    categories,
    sections,
    maxDepth: sections.length > 0 ? 2 : 1,
    
    // Footer features
    hasColumnStructure,
    hasSocialLinks,
    hasLegalLinks,
    hasContactInfo,
    
    links: links.slice(0, 30), // Limit for performance
    
    // Footer patterns
    patterns: {
      hasCopyright: footer.textContent?.match(/©|\bcopyright\b/i) !== null,
      hasPrivacyPolicy: links.some(link => /privacy/i.test(link.text)),
      hasTermsOfService: links.some(link => /terms|tos/i.test(link.text)),
      hasSitemap: links.some(link => /sitemap/i.test(link.text))
    }
  };
}

function analyzePagination(document, pageUrl) {
  // Pagination selectors
  const paginationSelectors = [
    '.pagination',
    '.pager',
    '.page-navigation',
    '.page-nav',
    '[role="navigation"][aria-label*="page"]',
    '[aria-label*="pagination"]',
    '.wp-pagenavi', // WordPress
    '.nav-links' // Common CMS pattern
  ];
  
  let paginationContainer = null;
  for (const selector of paginationSelectors) {
    paginationContainer = document.querySelector(selector);
    if (paginationContainer) break;
  }
  
  // Also check for individual pagination elements
  const prevLink = document.querySelector('a[rel="prev"], a[aria-label*="previous"], .prev, .previous');
  const nextLink = document.querySelector('a[rel="next"], a[aria-label*="next"], .next, .next-page');
  const pageNumberElements = document.querySelectorAll('a[href*="page="], a[href*="/page/"], .page-number');
  
  const hasPagination = paginationContainer !== null || prevLink !== null || nextLink !== null || pageNumberElements.length > 0;
  
  if (!hasPagination) {
    return {
      present: false,
      type: 'none',
      currentPage: null,
      totalPages: null,
      hasNext: false,
      hasPrevious: false
    };
  }
  
  // Analyze pagination structure
  const paginationLinks = paginationContainer ? 
    [...paginationContainer.querySelectorAll('a, span, button')] : 
    [prevLink, nextLink, ...pageNumberElements].filter(Boolean);
  
  const links = paginationLinks.map(element => {
    const text = element.textContent?.trim() || '';
    const href = element.getAttribute('href') || '';
    const isActive = element.classList.contains('active') || 
                    element.classList.contains('current') ||
                    element.getAttribute('aria-current') === 'page';
    
    return {
      text,
      href,
      isActive,
      type: classifyPaginationLink(text, href, element)
    };
  });
  
  // Determine pagination type
  const hasNumberedPages = links.some(link => link.type === 'number');
  const hasLoadMore = document.querySelector('.load-more, [data-load-more]') !== null;
  const hasInfiniteScroll = document.querySelector('[data-infinite-scroll]') !== null || 
                           document.textContent?.includes('infinite scroll');
  
  let paginationType = 'none';
  if (hasInfiniteScroll) paginationType = 'infinite-scroll';
  else if (hasLoadMore) paginationType = 'load-more';
  else if (hasNumberedPages) paginationType = 'numbered';
  else if (prevLink || nextLink) paginationType = 'prev-next';
  
  // Extract current page and total pages
  const currentPageElement = links.find(link => link.isActive);
  const currentPage = currentPageElement ? parseInt(currentPageElement.text) || null : null;
  const pageNumbers = links.filter(link => link.type === 'number').map(link => parseInt(link.text)).filter(Boolean);
  const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : null;
  
  return {
    present: true,
    type: paginationType,
    currentPage,
    totalPages,
    linkCount: links.length,
    hasNext: nextLink !== null || links.some(link => link.type === 'next'),
    hasPrevious: prevLink !== null || links.some(link => link.type === 'prev'),
    hasFirst: links.some(link => link.type === 'first'),
    hasLast: links.some(link => link.type === 'last'),
    hasNumberedPages,
    hasLoadMore,
    hasInfiniteScroll,
    
    // Accessibility
    isAccessible: paginationContainer?.getAttribute('role') === 'navigation' ||
                 paginationContainer?.hasAttribute('aria-label'),
    
    links: links.slice(0, 10) // Limit for performance
  };
}

function analyzeSecondaryNavigation(document, currentDomain) {
  // Find secondary navigation (sidebar, etc.)
  const secondaryNavSelectors = [
    'aside nav',
    '.sidebar nav',
    '.secondary-nav',
    '.side-nav',
    '.widget-area nav',
    '[role="complementary"] nav'
  ];
  
  const secondaryNavs = [];
  secondaryNavSelectors.forEach(selector => {
    const navs = [...document.querySelectorAll(selector)];
    secondaryNavs.push(...navs);
  });
  
  if (secondaryNavs.length === 0) {
    return {
      present: false,
      count: 0,
      types: []
    };
  }
  
  const analysis = secondaryNavs.map(nav => {
    const links = [...nav.querySelectorAll('a[href]')];
    const navType = classifySecondaryNav(nav);
    
    return {
      type: navType,
      linkCount: links.length,
      hasHeading: nav.querySelector('h1, h2, h3, h4, h5, h6') !== null
    };
  });
  
  return {
    present: true,
    count: secondaryNavs.length,
    types: [...new Set(analysis.map(nav => nav.type))],
    totalLinks: analysis.reduce((sum, nav) => sum + nav.linkCount, 0),
    analysis: analysis.slice(0, 5) // Limit for performance
  };
}

// Helper functions for navigation analysis
function getElementDepth(element, container) {
  let depth = 0;
  let current = element;
  
  while (current && current !== container) {
    if (current.tagName === 'UL' || current.tagName === 'OL') {
      depth++;
    }
    current = current.parentElement;
  }
  
  return Math.max(1, depth);
}

function categorizeFooterLink(text, href) {
  const lowerText = text.toLowerCase();
  const lowerHref = href.toLowerCase();
  
  // Social media
  if (/facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest/.test(lowerHref) || 
      /social|follow|like/.test(lowerText)) {
    return 'social';
  }
  
  // Legal
  if (/privacy|terms|legal|cookie|gdpr|disclaimer|policy/.test(lowerText)) {
    return 'legal';
  }
  
  // Company info
  if (/about|contact|careers|jobs|team|company|location/.test(lowerText)) {
    return 'company';
  }
  
  // Support
  if (/help|support|faq|contact|service|customer/.test(lowerText)) {
    return 'support';
  }
  
  // Products/Services
  if (/product|service|solution|feature/.test(lowerText)) {
    return 'product';
  }
  
  return 'other';
}

function classifyPaginationLink(text, href, element) {
  const lowerText = text.toLowerCase();
  
  if (/prev|previous|←|‹/.test(lowerText) || element.getAttribute('rel') === 'prev') {
    return 'prev';
  }
  if (/next|→|›/.test(lowerText) || element.getAttribute('rel') === 'next') {
    return 'next';
  }
  if (/first|1/.test(lowerText) && text.length <= 5) {
    return 'first';
  }
  if (/last|final/.test(lowerText)) {
    return 'last';
  }
  if (/^\d+$/.test(text)) {
    return 'number';
  }
  if (/\.{3}|…/.test(text)) {
    return 'ellipsis';
  }
  
  return 'other';
}

function classifySecondaryNav(navElement) {
  const classes = navElement.className.toLowerCase();
  const parentClasses = navElement.parentElement?.className.toLowerCase() || '';
  
  if (/tag|label/.test(classes) || /tag|label/.test(parentClasses)) {
    return 'tags';
  }
  if (/categor|topic/.test(classes) || /categor|topic/.test(parentClasses)) {
    return 'categories';
  }
  if (/archive|date/.test(classes) || /archive|date/.test(parentClasses)) {
    return 'archives';
  }
  if (/recent|latest/.test(classes) || /recent|latest/.test(parentClasses)) {
    return 'recent';
  }
  if (/related|similar/.test(classes) || /related|similar/.test(parentClasses)) {
    return 'related';
  }
  
  return 'general';
}

function checkNavigationConsistency(navData) {
  const issues = [];
  
  // Check breadcrumb consistency
  if (navData.breadcrumbs.present && !navData.breadcrumbs.isAccessible) {
    issues.push('Breadcrumbs lack accessibility attributes');
  }
  
  // Check main navigation
  if (navData.mainNav.present && !navData.mainNav.hasAriaLabels && navData.mainNav.hasDropdowns) {
    issues.push('Dropdown navigation lacks ARIA labels');
  }
  
  // Check pagination
  if (navData.pagination && navData.pagination.present && !navData.pagination.isAccessible) {
    issues.push('Pagination lacks accessibility attributes');
  }
  
  return {
    isConsistent: issues.length === 0,
    issues
  };
}

// Media Content and Downloads Analysis
function extractMediaContentData(document, pageUrl) {
  const currentDomain = new URL(pageUrl).hostname;
  
  // Enhanced image analysis
  const images = [...document.querySelectorAll('img')];
  const imageAnalysis = analyzeImages(images, pageUrl);
  
  // Video analysis
  const videos = [...document.querySelectorAll('video')];
  const videoAnalysis = analyzeVideos(videos);
  
  // Audio analysis
  const audios = [...document.querySelectorAll('audio')];
  const audioAnalysis = analyzeAudios(audios);
  
  // File download links analysis
  const downloadLinks = [...document.querySelectorAll('a[href]')];
  const downloadAnalysis = analyzeDownloadLinks(downloadLinks, currentDomain);
  
  // Social media embeds analysis
  const embedAnalysis = analyzeSocialEmbeds(document);
  
  // Third-party content analysis
  const thirdPartyAnalysis = analyzeThirdPartyContent(document, currentDomain);
  
  return {
    images: imageAnalysis,
    videos: videoAnalysis,
    audios: audioAnalysis,
    downloads: downloadAnalysis,
    embeds: embedAnalysis,
    thirdParty: thirdPartyAnalysis,
    
    // Overall media metrics
    totalMediaElements: images.length + videos.length + audios.length,
    hasAccessibilityIssues: imageAnalysis.missingAlt > 0 || videoAnalysis.missingCaptions > 0,
    mediaScore: calculateMediaScore(imageAnalysis, videoAnalysis, audioAnalysis, embedAnalysis)
  };
}

// Enhanced image analysis
function analyzeImages(images, pageUrl) {
  const imageData = images.map((img, index) => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt');
    const title = img.getAttribute('title') || '';
    const loading = img.getAttribute('loading') || '';
    const srcset = img.getAttribute('srcset') || '';
    const sizes = img.getAttribute('sizes') || '';
    
    // Determine if image is decorative or informative
    const isDecorative = alt === '' || img.getAttribute('role') === 'presentation';
    const isInformative = alt && alt.trim().length > 0;
    
    // Check for responsive image techniques
    const isResponsive = srcset !== '' || sizes !== '' || img.closest('picture') !== null;
    
    // Analyze image format from src
    const extension = getFileExtension(src.split('?')[0]);
    const isModernFormat = ['webp', 'avif', 'heic'].includes(extension.toLowerCase());
    
    return {
      src: src.substring(0, 100), // Limit length for performance
      alt,
      title,
      hasAlt: alt !== null,
      hasEmptyAlt: alt === '',
      hasDescriptiveAlt: alt && alt.trim().length > 10,
      isDecorative,
      isInformative,
      isResponsive,
      isModernFormat,
      loading,
      isLazyLoaded: loading === 'lazy',
      extension,
      index
    };
  });
  
  const totalImages = images.length;
  const withAlt = imageData.filter(img => img.hasAlt).length;
  const withoutAlt = imageData.filter(img => !img.hasAlt).length;
  const emptyAlt = imageData.filter(img => img.hasEmptyAlt).length;
  const descriptiveAlt = imageData.filter(img => img.hasDescriptiveAlt).length;
  const responsive = imageData.filter(img => img.isResponsive).length;
  const lazyLoaded = imageData.filter(img => img.isLazyLoaded).length;
  const modernFormat = imageData.filter(img => img.isModernFormat).length;
  
  return {
    total: totalImages,
    withAlt,
    withoutAlt,
    emptyAlt,
    missingAlt: withoutAlt,
    descriptiveAlt,
    decorative: imageData.filter(img => img.isDecorative).length,
    informative: imageData.filter(img => img.isInformative).length,
    responsive,
    lazyLoaded,
    modernFormat,
    
    // Performance metrics
    responsivePercentage: totalImages > 0 ? Math.round((responsive / totalImages) * 100) : 0,
    lazyLoadedPercentage: totalImages > 0 ? Math.round((lazyLoaded / totalImages) * 100) : 0,
    modernFormatPercentage: totalImages > 0 ? Math.round((modernFormat / totalImages) * 100) : 0,
    
    // Accessibility score
    accessibilityScore: totalImages > 0 ? Math.round(((withAlt + emptyAlt) / totalImages) * 100) : 100,
    
    // Sample images (first 10 for analysis)
    sampleImages: imageData.slice(0, 10)
  };
}

// Video analysis
function analyzeVideos(videos) {
  const videoData = videos.map((video, index) => {
    const src = video.getAttribute('src') || '';
    const poster = video.getAttribute('poster') || '';
    const controls = video.hasAttribute('controls');
    const autoplay = video.hasAttribute('autoplay');
    const muted = video.hasAttribute('muted');
    const loop = video.hasAttribute('loop');
    const preload = video.getAttribute('preload') || 'metadata';
    
    // Check for captions/subtitles
    const tracks = [...video.querySelectorAll('track')];
    const hasCaptions = tracks.some(track => 
      track.getAttribute('kind') === 'captions' || 
      track.getAttribute('kind') === 'subtitles'
    );
    
    // Check for multiple sources
    const sources = [...video.querySelectorAll('source')];
    const hasMultipleSources = sources.length > 0;
    
    // Analyze video format
    const mainSource = sources.length > 0 ? sources[0].getAttribute('src') || '' : src;
    const extension = getFileExtension(mainSource.split('?')[0]);
    
    return {
      src: src.substring(0, 100),
      poster: poster.substring(0, 100),
      hasControls: controls,
      hasAutoplay: autoplay,
      isMuted: muted,
      isLooped: loop,
      preload,
      hasCaptions,
      hasMultipleSources,
      sourceCount: sources.length,
      extension,
      index,
      
      // Accessibility features
      hasAccessibleControls: controls && !autoplay,
      captionTracks: tracks.filter(track => 
        track.getAttribute('kind') === 'captions' || 
        track.getAttribute('kind') === 'subtitles'
      ).length
    };
  });
  
  const totalVideos = videos.length;
  const withControls = videoData.filter(v => v.hasControls).length;
  const withCaptions = videoData.filter(v => v.hasCaptions).length;
  const withAutoplay = videoData.filter(v => v.hasAutoplay).length;
  const withPoster = videoData.filter(v => v.poster).length;
  
  return {
    total: totalVideos,
    withControls,
    withoutControls: totalVideos - withControls,
    withCaptions,
    missingCaptions: totalVideos - withCaptions,
    withAutoplay,
    withPoster,
    withMultipleSources: videoData.filter(v => v.hasMultipleSources).length,
    
    // Accessibility metrics
    accessibilityScore: totalVideos > 0 ? Math.round(((withControls + withCaptions) / (totalVideos * 2)) * 100) : 100,
    captionsPercentage: totalVideos > 0 ? Math.round((withCaptions / totalVideos) * 100) : 0,
    controlsPercentage: totalVideos > 0 ? Math.round((withControls / totalVideos) * 100) : 0,
    
    // Sample videos
    sampleVideos: videoData.slice(0, 5)
  };
}

// Audio analysis
function analyzeAudios(audios) {
  const audioData = audios.map((audio, index) => {
    const src = audio.getAttribute('src') || '';
    const controls = audio.hasAttribute('controls');
    const autoplay = audio.hasAttribute('autoplay');
    const muted = audio.hasAttribute('muted');
    const loop = audio.hasAttribute('loop');
    const preload = audio.getAttribute('preload') || 'metadata';
    
    // Check for multiple sources
    const sources = [...audio.querySelectorAll('source')];
    const hasMultipleSources = sources.length > 0;
    
    // Check for transcripts (common patterns)
    const parent = audio.closest('div, section, article') || audio.parentElement;
    const hasTranscript = parent && (
      parent.querySelector('.transcript, .audio-transcript') !== null ||
      parent.textContent.toLowerCase().includes('transcript')
    );
    
    const mainSource = sources.length > 0 ? sources[0].getAttribute('src') || '' : src;
    const extension = getFileExtension(mainSource.split('?')[0]);
    
    return {
      src: src.substring(0, 100),
      hasControls: controls,
      hasAutoplay: autoplay,
      isMuted: muted,
      isLooped: loop,
      preload,
      hasMultipleSources,
      sourceCount: sources.length,
      hasTranscript,
      extension,
      index
    };
  });
  
  const totalAudios = audios.length;
  const withControls = audioData.filter(a => a.hasControls).length;
  const withTranscripts = audioData.filter(a => a.hasTranscript).length;
  const withAutoplay = audioData.filter(a => a.hasAutoplay).length;
  
  return {
    total: totalAudios,
    withControls,
    withoutControls: totalAudios - withControls,
    withTranscripts,
    missingTranscripts: totalAudios - withTranscripts,
    withAutoplay,
    withMultipleSources: audioData.filter(a => a.hasMultipleSources).length,
    
    // Accessibility metrics
    accessibilityScore: totalAudios > 0 ? Math.round(((withControls + withTranscripts) / (totalAudios * 2)) * 100) : 100,
    transcriptsPercentage: totalAudios > 0 ? Math.round((withTranscripts / totalAudios) * 100) : 0,
    controlsPercentage: totalAudios > 0 ? Math.round((withControls / totalAudios) * 100) : 0,
    
    // Sample audios
    sampleAudios: audioData.slice(0, 5)
  };
}

// File download links analysis
function analyzeDownloadLinks(links, currentDomain) {
  const downloadableExtensions = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'rar', '7z', 'tar', 'gz',
    'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv',
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
    'exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm',
    'csv', 'json', 'xml', 'txt', 'rtf'
  ];
  
  const downloadLinks = links.filter(link => {
    const href = link.getAttribute('href') || '';
    const downloadAttr = link.hasAttribute('download');
    
    // Check for download attribute
    if (downloadAttr) return true;
    
    // Check for file extensions
    try {
      const url = new URL(href, window.location.href);
      const pathname = url.pathname.toLowerCase();
      const extension = getFileExtension(pathname);
      return downloadableExtensions.includes(extension);
    } catch {
      // For relative paths
      const extension = getFileExtension(href.toLowerCase());
      return downloadableExtensions.includes(extension);
    }
  });
  
  const downloadData = downloadLinks.map((link, index) => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent?.trim() || '';
    const title = link.getAttribute('title') || '';
    const download = link.getAttribute('download') || '';
    const target = link.getAttribute('target') || '';
    
    let extension = '';
    let fileSize = '';
    let isExternal = false;
    
    try {
      const url = new URL(href, window.location.href);
      extension = getFileExtension(url.pathname.toLowerCase());
      isExternal = url.hostname !== currentDomain;
    } catch {
      extension = getFileExtension(href.toLowerCase());
      isExternal = href.startsWith('http') && !href.includes(currentDomain);
    }
    
    // Extract file size from link text (common patterns)
    const sizeMatch = text.match(/\(([0-9.]+\s?(kb|mb|gb|bytes?))\)/i);
    if (sizeMatch) fileSize = sizeMatch[1];
    
    // Categorize file type
    const category = categorizeFileType(extension);
    
    return {
      href: href.substring(0, 100),
      text: text.substring(0, 100),
      title,
      download,
      extension,
      category,
      fileSize,
      isExternal,
      hasDownloadAttribute: download !== '',
      opensInNewTab: target === '_blank',
      index
    };
  });
  
  // Group by category
  const categories = {};
  downloadData.forEach(file => {
    if (!categories[file.category]) {
      categories[file.category] = 0;
    }
    categories[file.category]++;
  });
  
  // Group by extension
  const extensions = {};
  downloadData.forEach(file => {
    if (!extensions[file.extension]) {
      extensions[file.extension] = 0;
    }
    extensions[file.extension]++;
  });
  
  return {
    total: downloadLinks.length,
    withDownloadAttribute: downloadData.filter(f => f.hasDownloadAttribute).length,
    external: downloadData.filter(f => f.isExternal).length,
    internal: downloadData.filter(f => !f.isExternal).length,
    withFileSize: downloadData.filter(f => f.fileSize).length,
    opensInNewTab: downloadData.filter(f => f.opensInNewTab).length,
    
    // Categories and extensions
    categories,
    extensions,
    topCategories: Object.entries(categories).sort(([,a], [,b]) => b - a).slice(0, 5),
    topExtensions: Object.entries(extensions).sort(([,a], [,b]) => b - a).slice(0, 10),
    
    // Sample downloads
    sampleDownloads: downloadData.slice(0, 10)
  };
}

// Social media embeds analysis
function analyzeSocialEmbeds(document) {
  const embedTypes = {
    youtube: {
      selectors: ['iframe[src*="youtube.com"]', 'iframe[src*="youtu.be"]', 'embed[src*="youtube"]'],
      name: 'YouTube'
    },
    twitter: {
      selectors: ['iframe[src*="twitter.com"]', 'blockquote.twitter-tweet', '.twitter-tweet'],
      name: 'Twitter'
    },
    facebook: {
      selectors: ['iframe[src*="facebook.com"]', '.fb-post', '.fb-video', '.fb-page'],
      name: 'Facebook'
    },
    instagram: {
      selectors: ['iframe[src*="instagram.com"]', 'blockquote.instagram-media'],
      name: 'Instagram'
    },
    linkedin: {
      selectors: ['iframe[src*="linkedin.com"]', '.linkedin-post'],
      name: 'LinkedIn'
    },
    tiktok: {
      selectors: ['iframe[src*="tiktok.com"]', 'blockquote.tiktok-embed'],
      name: 'TikTok'
    },
    vimeo: {
      selectors: ['iframe[src*="vimeo.com"]', 'embed[src*="vimeo"]'],
      name: 'Vimeo'
    },
    pinterest: {
      selectors: ['iframe[src*="pinterest.com"]', '[data-pin-do]'],
      name: 'Pinterest'
    }
  };
  
  const embedData = {};
  let totalEmbeds = 0;
  
  Object.entries(embedTypes).forEach(([platform, config]) => {
    const elements = [];
    config.selectors.forEach(selector => {
      elements.push(...document.querySelectorAll(selector));
    });
    
    const embedInfo = elements.map((element, index) => {
      const src = element.getAttribute('src') || '';
      const isIframe = element.tagName.toLowerCase() === 'iframe';
      const hasTitle = element.hasAttribute('title');
      const hasAriaLabel = element.hasAttribute('aria-label');
      const isAccessible = hasTitle || hasAriaLabel;
      
      return {
        src: src.substring(0, 100),
        isIframe,
        hasTitle,
        hasAriaLabel,
        isAccessible,
        index
      };
    });
    
    embedData[platform] = {
      name: config.name,
      count: elements.length,
      accessible: embedInfo.filter(e => e.isAccessible).length,
      iframes: embedInfo.filter(e => e.isIframe).length,
      samples: embedInfo.slice(0, 3)
    };
    
    totalEmbeds += elements.length;
  });
  
  // Generic embed detection
  const genericIframes = [...document.querySelectorAll('iframe')];
  const knownEmbeds = Object.values(embedData).reduce((sum, platform) => sum + platform.iframes, 0);
  const unknownEmbeds = genericIframes.length - knownEmbeds;
  
  return {
    total: totalEmbeds,
    platforms: Object.keys(embedData).filter(platform => embedData[platform].count > 0),
    platformData: embedData,
    unknownEmbeds,
    totalIframes: genericIframes.length,
    accessibleEmbeds: Object.values(embedData).reduce((sum, platform) => sum + platform.accessible, 0),
    accessibilityScore: totalEmbeds > 0 ? Math.round((Object.values(embedData).reduce((sum, platform) => sum + platform.accessible, 0) / totalEmbeds) * 100) : 100
  };
}

// Third-party content analysis
function analyzeThirdPartyContent(document, currentDomain) {
  const iframes = [...document.querySelectorAll('iframe')];
  const scripts = [...document.querySelectorAll('script[src]')];
  const links = [...document.querySelectorAll('link[href]')];
  const images = [...document.querySelectorAll('img[src]')];
  
  const thirdPartyDomains = new Set();
  const contentTypes = {
    analytics: [],
    advertising: [],
    social: [],
    maps: [],
    payments: [],
    chat: [],
    other: []
  };
  
  // Analyze iframes
  iframes.forEach(iframe => {
    const src = iframe.getAttribute('src') || '';
    try {
      const url = new URL(src);
      if (url.hostname !== currentDomain) {
        thirdPartyDomains.add(url.hostname);
        categorizeThirdParty(url.hostname, url.href, contentTypes);
      }
    } catch {}
  });
  
  // Analyze external scripts
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    try {
      const url = new URL(src, window.location.href);
      if (url.hostname !== currentDomain) {
        thirdPartyDomains.add(url.hostname);
        categorizeThirdParty(url.hostname, url.href, contentTypes);
      }
    } catch {}
  });
  
  // Check for common third-party services in script content
  const inlineScripts = [...document.querySelectorAll('script:not([src])')];
  inlineScripts.forEach(script => {
    const content = script.textContent || '';
    detectInlineThirdParty(content, contentTypes);
  });
  
  return {
    totalDomains: thirdPartyDomains.size,
    domains: Array.from(thirdPartyDomains).slice(0, 20), // Limit for performance
    contentTypes,
    summary: {
      analytics: contentTypes.analytics.length,
      advertising: contentTypes.advertising.length,
      social: contentTypes.social.length,
      maps: contentTypes.maps.length,
      payments: contentTypes.payments.length,
      chat: contentTypes.chat.length,
      other: contentTypes.other.length
    },
    totalIframes: iframes.length,
    externalIframes: iframes.filter(iframe => {
      const src = iframe.getAttribute('src') || '';
      try {
        const url = new URL(src);
        return url.hostname !== currentDomain;
      } catch {
        return false;
      }
    }).length
  };
}

// Helper functions for media analysis
function categorizeFileType(extension) {
  const categories = {
    documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    spreadsheets: ['xls', 'xlsx', 'csv', 'ods'],
    presentations: ['ppt', 'pptx', 'odp'],
    archives: ['zip', 'rar', '7z', 'tar', 'gz'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'],
    videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    executables: ['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm'],
    data: ['json', 'xml', 'yaml', 'sql']
  };
  
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }
  return 'other';
}

function categorizeThirdParty(hostname, url, contentTypes) {
  const analytics = [
    'google-analytics.com', 'googletagmanager.com', 'analytics.google.com',
    'hotjar.com', 'mixpanel.com', 'segment.com', 'amplitude.com'
  ];
  
  const advertising = [
    'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
    'facebook.com/tr', 'adsystem.amazon.com'
  ];
  
  const social = [
    'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
    'youtube.com', 'tiktok.com', 'pinterest.com'
  ];
  
  const maps = ['maps.googleapis.com', 'maps.google.com', 'mapbox.com'];
  const payments = ['stripe.com', 'paypal.com', 'square.com'];
  const chat = ['intercom.io', 'zendesk.com', 'drift.com', 'crisp.chat'];
  
  if (analytics.some(domain => hostname.includes(domain))) {
    contentTypes.analytics.push({ hostname, url: url.substring(0, 100) });
  } else if (advertising.some(domain => hostname.includes(domain))) {
    contentTypes.advertising.push({ hostname, url: url.substring(0, 100) });
  } else if (social.some(domain => hostname.includes(domain))) {
    contentTypes.social.push({ hostname, url: url.substring(0, 100) });
  } else if (maps.some(domain => hostname.includes(domain))) {
    contentTypes.maps.push({ hostname, url: url.substring(0, 100) });
  } else if (payments.some(domain => hostname.includes(domain))) {
    contentTypes.payments.push({ hostname, url: url.substring(0, 100) });
  } else if (chat.some(domain => hostname.includes(domain))) {
    contentTypes.chat.push({ hostname, url: url.substring(0, 100) });
  } else {
    contentTypes.other.push({ hostname, url: url.substring(0, 100) });
  }
}

function detectInlineThirdParty(content, contentTypes) {
  const patterns = {
    analytics: [
      'gtag(', 'ga(', 'Google Analytics', 'googletagmanager',
      'mixpanel', 'hotjar', 'amplitude'
    ],
    advertising: [
      'googletag', 'adsense', 'doubleclick', 'facebook pixel'
    ],
    social: [
      'facebook.com/tr', 'twitter.com/i', 'linkedin.com/in'
    ]
  };
  
  Object.entries(patterns).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        contentTypes[category].push({ 
          type: 'inline-script', 
          keyword,
          url: `inline script containing "${keyword}"`
        });
      }
    });
  });
}

function calculateMediaScore(images, videos, audios, embeds) {
  let score = 0;
  let maxScore = 0;
  
  // Image accessibility (40 points)
  if (images.total > 0) {
    maxScore += 40;
    score += (images.accessibilityScore / 100) * 40;
  }
  
  // Video accessibility (30 points)
  if (videos.total > 0) {
    maxScore += 30;
    score += (videos.accessibilityScore / 100) * 30;
  }
  
  // Audio accessibility (20 points)
  if (audios.total > 0) {
    maxScore += 20;
    score += (audios.accessibilityScore / 100) * 20;
  }
  
  // Embed accessibility (10 points)
  if (embeds.total > 0) {
    maxScore += 10;
    score += (embeds.accessibilityScore / 100) * 10;
  }
  
  // If no media, perfect score
  if (maxScore === 0) return 100;
  
  return Math.round((score / maxScore) * 100);
}

// Page Type Classification Functions

// URL-based page type classification
function classifyByUrl(url, pathSegments) {
  const pathname = url.pathname.toLowerCase();
  const classifications = [];
  
  // Blog/Article patterns
  if (/\/(blog|news|articles?|posts?)\//i.test(pathname) || 
      /\/(blog|news|articles?|posts?)$/i.test(pathname)) {
    classifications.push({ type: 'blog', confidence: 0.8, indicator: 'URL path contains blog/news/article' });
  }
  
  // Product/Shop patterns
  if (/\/(products?|shop|store|catalog)\//i.test(pathname) || 
      /\/(products?|shop|store|catalog)$/i.test(pathname)) {
    classifications.push({ type: 'product', confidence: 0.8, indicator: 'URL path contains product/shop' });
  }
  
  // Contact patterns
  if (/\/(contact|about|team|staff)\//i.test(pathname) || 
      /\/(contact|about|team|staff)$/i.test(pathname)) {
    classifications.push({ type: 'contact', confidence: 0.7, indicator: 'URL path contains contact/about' });
  }
  
  // Search patterns
  if (/\/search\//i.test(pathname) || /\/search$/i.test(pathname) || 
      url.searchParams.has('q') || url.searchParams.has('search') || url.searchParams.has('query')) {
    classifications.push({ type: 'search', confidence: 0.9, indicator: 'URL contains search path or parameters' });
  }
  
  // Landing page patterns
  if (pathname === '/' || pathname === '' || 
      /\/(home|index|welcome)\//i.test(pathname) || 
      /\/(home|index|welcome)$/i.test(pathname)) {
    classifications.push({ type: 'landing', confidence: 0.6, indicator: 'Homepage or landing page URL' });
  }
  
  // Admin/Dashboard patterns
  if (/\/(admin|dashboard|panel|control)\//i.test(pathname)) {
    classifications.push({ type: 'admin', confidence: 0.9, indicator: 'Admin/dashboard URL path' });
  }
  
  // Documentation patterns
  if (/\/(docs?|documentation|help|guide|manual)\//i.test(pathname)) {
    classifications.push({ type: 'documentation', confidence: 0.8, indicator: 'Documentation URL path' });
  }
  
  // Portfolio/Gallery patterns
  if (/\/(portfolio|gallery|work|projects?)\//i.test(pathname)) {
    classifications.push({ type: 'portfolio', confidence: 0.7, indicator: 'Portfolio/gallery URL path' });
  }
  
  return classifications;
}

// Content-based page type classification
function classifyByContent(document, title, bodyText, headings) {
  const classifications = [];
  const allText = `${title} ${bodyText} ${headings.join(' ')}`;
  
  // Blog/Article indicators
  const blogIndicators = [
    'posted on', 'published', 'by author', 'read more', 'comments', 'share this',
    'tags:', 'categories:', 'related posts', 'previous post', 'next post'
  ];
  const blogMatches = blogIndicators.filter(indicator => allText.includes(indicator)).length;
  if (blogMatches >= 2) {
    classifications.push({ 
      type: 'blog', 
      confidence: Math.min(0.9, 0.4 + (blogMatches * 0.1)), 
      indicator: `Blog content indicators: ${blogMatches}` 
    });
  }
  
  // Product page indicators
  const productIndicators = [
    'add to cart', 'buy now', 'price', '$', '€', '£', 'in stock', 'out of stock',
    'product details', 'specifications', 'reviews', 'rating', 'add to wishlist'
  ];
  const productMatches = productIndicators.filter(indicator => 
    allText.includes(indicator) || document.querySelector(`[data-${indicator.replace(/\s+/g, '-')}]`)
  ).length;
  if (productMatches >= 2) {
    classifications.push({ 
      type: 'product', 
      confidence: Math.min(0.9, 0.5 + (productMatches * 0.08)), 
      indicator: `Product indicators: ${productMatches}` 
    });
  }
  
  // Contact page indicators
  const contactIndicators = [
    'contact us', 'get in touch', 'phone:', 'email:', 'address:', 'office hours',
    'send message', 'contact form', 'reach out', 'location'
  ];
  const contactMatches = contactIndicators.filter(indicator => allText.includes(indicator)).length;
  if (contactMatches >= 2) {
    classifications.push({ 
      type: 'contact', 
      confidence: Math.min(0.9, 0.5 + (contactMatches * 0.1)), 
      indicator: `Contact indicators: ${contactMatches}` 
    });
  }
  
  // Search results indicators
  const searchIndicators = [
    'search results', 'results for', 'found', 'matches', 'no results',
    'refine search', 'filter by', 'sort by', 'results per page'
  ];
  const searchMatches = searchIndicators.filter(indicator => allText.includes(indicator)).length;
  if (searchMatches >= 2) {
    classifications.push({ 
      type: 'search', 
      confidence: Math.min(0.9, 0.6 + (searchMatches * 0.1)), 
      indicator: `Search results indicators: ${searchMatches}` 
    });
  }
  
  // Error page indicators
  const errorIndicators = [
    '404', 'not found', 'page not found', 'error', 'sorry', 'broken link',
    'go back', 'return home', 'page missing', 'oops'
  ];
  const errorMatches = errorIndicators.filter(indicator => allText.includes(indicator)).length;
  if (errorMatches >= 2) {
    classifications.push({ 
      type: 'error', 
      confidence: Math.min(0.9, 0.6 + (errorMatches * 0.1)), 
      indicator: `Error page indicators: ${errorMatches}` 
    });
  }
  
  return classifications;
}

// Structure-based classification
function classifyByStructure(document) {
  const classifications = [];
  
  // Check for article structure
  const hasArticle = document.querySelector('article') !== null;
  const hasTimeElement = document.querySelector('time') !== null;
  const hasAuthor = document.querySelector('[rel="author"], .author, .byline') !== null;
  
  if (hasArticle && (hasTimeElement || hasAuthor)) {
    classifications.push({ 
      type: 'blog', 
      confidence: 0.7, 
      indicator: 'Article structure with time/author elements' 
    });
  }
  
  // Check for main content area
  const hasMain = document.querySelector('main') !== null;
  const hasAside = document.querySelector('aside') !== null;
  
  if (hasMain && hasAside) {
    classifications.push({ 
      type: 'content', 
      confidence: 0.5, 
      indicator: 'Main content with sidebar structure' 
    });
  }
  
  // Check for gallery structure
  const imageCount = document.querySelectorAll('img').length;
  const hasGallery = document.querySelector('.gallery, .portfolio, .images') !== null;
  
  if (hasGallery || imageCount > 10) {
    classifications.push({ 
      type: 'portfolio', 
      confidence: 0.6, 
      indicator: `Gallery structure or high image count (${imageCount})` 
    });
  }
  
  return classifications;
}

// Form-based classification
function classifyByForms(document) {
  const classifications = [];
  const forms = [...document.querySelectorAll('form')];
  
  for (const form of forms) {
    // Contact form detection
    const hasNameField = form.querySelector('input[name*="name"], input[id*="name"]') !== null;
    const hasEmailField = form.querySelector('input[type="email"], input[name*="email"]') !== null;
    const hasMessageField = form.querySelector('textarea[name*="message"], textarea[name*="comment"]') !== null;
    
    if (hasNameField && hasEmailField && hasMessageField) {
      classifications.push({ 
        type: 'contact', 
        confidence: 0.8, 
        indicator: 'Contact form with name, email, and message fields' 
      });
    }
    
    // Search form detection
    const hasSearchInput = form.querySelector('input[type="search"], input[name*="search"], input[name*="query"]') !== null;
    if (hasSearchInput) {
      classifications.push({ 
        type: 'search', 
        confidence: 0.7, 
        indicator: 'Search form detected' 
      });
    }
    
    // Newsletter signup
    const hasEmailOnly = hasEmailField && !hasNameField && !hasMessageField;
    const hasSubscribeButton = form.querySelector('button[type="submit"], input[type="submit"]')?.textContent?.toLowerCase().includes('subscribe');
    
    if (hasEmailOnly && hasSubscribeButton) {
      classifications.push({ 
        type: 'newsletter', 
        confidence: 0.6, 
        indicator: 'Newsletter signup form' 
      });
    }
    
    // Login/Registration form
    const hasPasswordField = form.querySelector('input[type="password"]') !== null;
    if (hasEmailField && hasPasswordField) {
      classifications.push({ 
        type: 'auth', 
        confidence: 0.8, 
        indicator: 'Login/registration form' 
      });
    }
  }
  
  return classifications;
}

// E-commerce classification
function classifyByEcommerce(document, title, bodyText) {
  const classifications = [];
  
  // Shopping cart indicators
  const hasCartButton = document.querySelector('[data-cart], .add-to-cart, .cart-button') !== null;
  const hasPriceElements = document.querySelectorAll('.price, [data-price], .cost').length > 0;
  const hasProductImages = document.querySelectorAll('img[alt*="product"], .product-image').length > 0;
  
  if (hasCartButton && hasPriceElements) {
    classifications.push({ 
      type: 'product', 
      confidence: 0.9, 
      indicator: 'E-commerce elements: cart button and pricing' 
    });
  }
  
  // Product listing indicators
  const productGrids = document.querySelectorAll('.products, .product-grid, .product-list').length;
  const multipleProducts = document.querySelectorAll('.product, [data-product]').length > 1;
  
  if (productGrids > 0 || multipleProducts) {
    classifications.push({ 
      type: 'product-listing', 
      confidence: 0.8, 
      indicator: 'Product listing/catalog page' 
    });
  }
  
  // Checkout indicators
  const hasCheckoutElements = document.querySelector('.checkout, #checkout, [data-checkout]') !== null;
  const hasPaymentFields = document.querySelector('input[name*="card"], input[name*="payment"]') !== null;
  
  if (hasCheckoutElements || hasPaymentFields) {
    classifications.push({ 
      type: 'checkout', 
      confidence: 0.9, 
      indicator: 'Checkout/payment page' 
    });
  }
  
  return classifications;
}

// Error page classification
function classifyByErrorPage(document, title, bodyText, url) {
  const classifications = [];
  
  // 404 specific indicators
  const has404InTitle = title.includes('404') || title.includes('not found');
  const has404InContent = bodyText.includes('404') || bodyText.includes('not found');
  const hasErrorMessage = bodyText.includes('page not found') || bodyText.includes('page missing');
  
  if (has404InTitle || (has404InContent && hasErrorMessage)) {
    classifications.push({ 
      type: 'error-404', 
      confidence: 0.9, 
      indicator: '404 error page indicators' 
    });
  }
  
  // General error indicators
  const errorPatterns = [
    'error', 'something went wrong', 'oops', 'broken', 'unavailable',
    'try again', 'go back', 'return home'
  ];
  
  const errorMatches = errorPatterns.filter(pattern => 
    title.includes(pattern) || bodyText.includes(pattern)
  ).length;
  
  if (errorMatches >= 2) {
    classifications.push({ 
      type: 'error', 
      confidence: 0.7, 
      indicator: `General error indicators: ${errorMatches}` 
    });
  }
  
  return classifications;
}

// Determine the primary page type from all classifications
function determinePrimaryPageType(allClassifications) {
  const allTypes = [];
  
  // Collect all classifications
  Object.values(allClassifications).forEach(classifications => {
    allTypes.push(...classifications);
  });
  
  if (allTypes.length === 0) return 'general';
  
  // Group by type and calculate weighted confidence
  const typeScores = {};
  allTypes.forEach(({ type, confidence }) => {
    if (!typeScores[type]) typeScores[type] = [];
    typeScores[type].push(confidence);
  });
  
  // Calculate average confidence for each type
  const typeAverages = Object.entries(typeScores).map(([type, confidences]) => ({
    type,
    avgConfidence: confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length,
    count: confidences.length
  }));
  
  // Sort by confidence and count
  typeAverages.sort((a, b) => {
    if (Math.abs(a.avgConfidence - b.avgConfidence) < 0.1) {
      return b.count - a.count; // If confidence is similar, prefer type with more indicators
    }
    return b.avgConfidence - a.avgConfidence;
  });
  
  return typeAverages[0]?.type || 'general';
}

// Calculate overall classification confidence
function calculateClassificationConfidence(allClassifications, primaryType) {
  const allTypes = [];
  
  Object.values(allClassifications).forEach(classifications => {
    allTypes.push(...classifications);
  });
  
  const primaryTypeScores = allTypes.filter(({ type }) => type === primaryType);
  
  if (primaryTypeScores.length === 0) return 0;
  
  const avgConfidence = primaryTypeScores.reduce((sum, { confidence }) => sum + confidence, 0) / primaryTypeScores.length;
  const indicatorCount = primaryTypeScores.length;
  
  // Boost confidence if multiple indicators agree
  let finalConfidence = avgConfidence;
  if (indicatorCount >= 3) finalConfidence = Math.min(1.0, avgConfidence + 0.1);
  if (indicatorCount >= 5) finalConfidence = Math.min(1.0, avgConfidence + 0.2);
  
  return Math.round(finalConfidence * 100) / 100;
}

// Extract additional page type indicators
function extractPageTypeIndicators(document, pageUrl) {
  return {
    hasCommentSystem: document.querySelector('#disqus_thread, .comments, .comment-form') !== null,
    hasSocialSharing: document.querySelector('.share, .social-share, [data-share]') !== null,
    hasRelatedContent: document.querySelector('.related, .recommended, .similar') !== null,
    hasBreadcrumbs: document.querySelector('[aria-label*="breadcrumb"], .breadcrumb') !== null,
    hasAuthorInfo: document.querySelector('.author, .byline, [rel="author"]') !== null,
    hasPublishDate: document.querySelector('time, .date, .published') !== null,
    hasTableOfContents: document.querySelector('.toc, .table-of-contents, #toc') !== null,
    hasCallToAction: document.querySelector('.cta, .call-to-action, .btn-primary') !== null,
    hasTestimonials: document.querySelector('.testimonial, .review, .feedback') !== null,
    hasFAQ: document.querySelector('.faq, .frequently-asked') !== null,
    hasMap: document.querySelector('.map, #map, iframe[src*="maps"]') !== null,
    hasVideo: document.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]') !== null,
    hasDownloads: document.querySelector('a[href$=".pdf"], a[href$=".doc"], a[href$=".zip"]') !== null,
    hasNewsletter: document.querySelector('[name*="newsletter"], [name*="subscribe"]') !== null,
    hasLiveChat: document.querySelector('[data-chat], .chat-widget, #chat') !== null
  };
}

// Comprehensive UX Elements Analysis
function extractUXElementsData(document, pageUrl) {
  return {
    callToAction: analyzeCallToActionElements(document),
    contactInformation: analyzeContactInformation(document),
    searchFunctionality: analyzeSearchFunctionality(document),
    newsletterSignups: analyzeNewsletterSignups(document)
  };
}

// Page Type Classification
function extractPageTypeData(document, pageUrl) {
  const url = new URL(pageUrl);
  const pathname = url.pathname.toLowerCase();
  const title = document.title?.toLowerCase() || '';
  const textContent = document.body?.textContent?.toLowerCase() || '';
  
  const pageTypes = [];
  let confidence = 0;
  
  // Homepage detection
  if (pathname === '/' || pathname === '' || pathname === '/index.html') {
    pageTypes.push('homepage');
    confidence += 9;
  }
  
  // Product page detection
  if (pathname.includes('/product') || pathname.includes('/item') || 
      title.includes('product') || document.querySelector('.product, #product')) {
    pageTypes.push('product');
    confidence += 8;
  }
  
  // Blog/Article detection
  if (pathname.includes('/blog') || pathname.includes('/article') || pathname.includes('/post') ||
      title.includes('blog') || document.querySelector('article, .post, .blog-post')) {
    pageTypes.push('blog');
    confidence += 7;
  }
  
  // Contact page detection
  if (pathname.includes('/contact') || title.includes('contact') || 
      document.querySelector('form[id*="contact"], form[class*="contact"]')) {
    pageTypes.push('contact');
    confidence += 8;
  }
  
  // About page detection
  if (pathname.includes('/about') || title.includes('about')) {
    pageTypes.push('about');
    confidence += 7;
  }
  
  // Category/Listing page detection
  if (pathname.includes('/category') || pathname.includes('/products') || 
      document.querySelectorAll('.product-item, .listing-item').length > 3) {
    pageTypes.push('category');
    confidence += 6;
  }
  
  // Search results detection
  if (pathname.includes('/search') || url.searchParams.has('q') || url.searchParams.has('search') ||
      title.includes('search results')) {
    pageTypes.push('search-results');
    confidence += 8;
  }
  
  // Error page detection
  if (title.includes('404') || title.includes('not found') || title.includes('error') ||
      textContent.includes('page not found')) {
    pageTypes.push('error');
    confidence += 9;
  }
  
  return {
    types: pageTypes.length > 0 ? pageTypes : ['other'],
    primary: pageTypes[0] || 'other',
    confidence: Math.min(confidence, 10),
    url: pageUrl,
    hasEcommerce: document.querySelector('.cart, .shopping-cart, .add-to-cart, .buy-now') !== null,
    hasForm: document.querySelector('form') !== null,
    hasNavigation: document.querySelector('nav, .navigation, .menu') !== null
  };
}

// Call-to-Action Button Analysis
function analyzeCallToActionElements(document) {
  // Comprehensive CTA selectors
  const ctaSelectors = [
    'button[class*="cta"]', 'a[class*="cta"]', '.call-to-action',
    'button[class*="btn-primary"]', 'a[class*="btn-primary"]', '.btn-primary',
    'button[class*="btn-cta"]', 'a[class*="btn-cta"]', '.btn-cta',
    '.button-primary', '.primary-button', '.main-button',
    'button[class*="action"]', 'a[class*="action"]',
    '.get-started', '.sign-up', '.subscribe', '.download',
    '.buy-now', '.purchase', '.order-now', '.shop-now',
    '.learn-more', '.find-out-more', '.discover',
    '.contact-us', '.get-quote', '.request-demo',
    '.try-free', '.start-trial', '.free-trial',
    'button[data-track*="cta"]', 'a[data-track*="cta"]'
  ];
  
  const ctaElements = [];
  const allCTAs = new Set();
  
  // Collect all CTA elements
  ctaSelectors.forEach(selector => {
    try {
      const elements = [...document.querySelectorAll(selector)];
      elements.forEach(el => allCTAs.add(el));
    } catch (e) {
      // Skip invalid selectors
    }
  });
  
  // Also find buttons/links with CTA-like text
  const ctaKeywords = [
    'get started', 'sign up', 'subscribe', 'download', 'buy now', 'purchase',
    'order now', 'shop now', 'learn more', 'find out more', 'discover',
    'contact us', 'get quote', 'request demo', 'try free', 'start trial',
    'free trial', 'join now', 'register', 'apply now', 'book now',
    'reserve', 'schedule', 'claim', 'unlock', 'access', 'upgrade'
  ];
  
  const potentialCTAs = [...document.querySelectorAll('button, a[href], input[type="submit"], input[type="button"]')];
  potentialCTAs.forEach(el => {
    const text = (el.textContent || el.value || '').toLowerCase().trim();
    const title = (el.getAttribute('title') || '').toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    
    const combinedText = `${text} ${title} ${ariaLabel}`;
    
    if (ctaKeywords.some(keyword => combinedText.includes(keyword))) {
      allCTAs.add(el);
    }
  });
  
  // Analyze each CTA
  [...allCTAs].forEach((cta, index) => {
    if (index >= 20) return; // Limit for performance
    
    const text = (cta.textContent || cta.value || '').trim();
    const href = cta.getAttribute('href');
    const position = getElementPosition(cta, document);
    const styling = getElementStyling(cta);
    
    ctaElements.push({
      tagName: cta.tagName.toLowerCase(),
      text: text.substring(0, 100), // Limit text length
      href: href ? href.substring(0, 200) : null,
      position,
      styling,
      hasIcon: cta.querySelector('i, svg, .icon') !== null,
      isVisible: isElementVisible(cta),
      priority: calculateCTAPriority(cta, text, position)
    });
  });
  
  // Sort by priority
  ctaElements.sort((a, b) => b.priority - a.priority);
  
  return {
    totalCTAs: allCTAs.size,
    ctaElements: ctaElements.slice(0, 15), // Top 15 CTAs
    hasAboveFold: ctaElements.some(cta => cta.position.isAboveFold),
    hasPrimaryCTA: ctaElements.some(cta => cta.priority >= 8),
    ctaTypes: categorizeCTATypes(ctaElements)
  };
}

// Contact Information Analysis
function analyzeContactInformation(document) {
  const contactInfo = {
    phoneNumbers: [],
    emailAddresses: [],
    physicalAddresses: [],
    socialMediaLinks: [],
    contactForms: [],
    contactMethods: {
      hasPhone: false,
      hasEmail: false,
      hasAddress: false,
      hasContactForm: false,
      hasSocialMedia: false,
      hasLiveChat: false,
      hasMap: false
    }
  };
  
  // Phone number patterns
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /(\+?\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /tel:\s*[\+\d\-\(\)\s]+/gi
  ];
  
  // Email patterns
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Extract from text content
  const textContent = document.body.textContent || '';
  
  // Find phone numbers
  phonePatterns.forEach(pattern => {
    const matches = textContent.match(pattern) || [];
    matches.forEach(match => {
      const cleanPhone = match.replace(/[^\d+()-]/g, '');
      if (cleanPhone.length >= 10) {
        contactInfo.phoneNumbers.push({
          original: match.trim(),
          cleaned: cleanPhone,
          context: 'text-content'
        });
      }
    });
  });
  
  // Find tel: links
  const telLinks = [...document.querySelectorAll('a[href^="tel:"]')];
  telLinks.forEach(link => {
    const tel = link.getAttribute('href').replace('tel:', '');
    contactInfo.phoneNumbers.push({
      original: tel,
      cleaned: tel.replace(/[^\d+()-]/g, ''),
      context: 'tel-link',
      linkText: link.textContent.trim()
    });
  });
  
  // Find email addresses
  const emailMatches = textContent.match(emailPattern) || [];
  emailMatches.forEach(email => {
    contactInfo.emailAddresses.push({
      email: email.toLowerCase(),
      context: 'text-content'
    });
  });
  
  // Find mailto: links
  const mailtoLinks = [...document.querySelectorAll('a[href^="mailto:"]')];
  mailtoLinks.forEach(link => {
    const email = link.getAttribute('href').replace('mailto:', '').split('?')[0];
    contactInfo.emailAddresses.push({
      email: email.toLowerCase(),
      context: 'mailto-link',
      linkText: link.textContent.trim()
    });
  });
  
  // Find physical addresses (basic detection)
  const addressPatterns = [
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl)/gi,
    /\d+\s+[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/gi
  ];
  
  addressPatterns.forEach(pattern => {
    const matches = textContent.match(pattern) || [];
    matches.forEach(match => {
      contactInfo.physicalAddresses.push({
        address: match.trim(),
        context: 'text-content'
      });
    });
  });
  
  // Find social media links
  const socialDomains = [
    'facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com',
    'youtube.com', 'tiktok.com', 'pinterest.com', 'snapchat.com',
    'reddit.com', 'discord.com', 'telegram.org', 'whatsapp.com'
  ];
  
  const socialLinks = [...document.querySelectorAll('a[href]')];
  socialLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const domain = socialDomains.find(social => href.includes(social));
    if (domain) {
      contactInfo.socialMediaLinks.push({
        platform: domain.split('.')[0],
        url: href,
        linkText: link.textContent.trim()
      });
    }
  });
  
  // Find contact forms
  const forms = [...document.querySelectorAll('form')];
  forms.forEach((form, index) => {
    const inputs = [...form.querySelectorAll('input, textarea, select')];
    const hasEmailField = inputs.some(input => 
      input.type === 'email' || 
      (input.name || '').toLowerCase().includes('email') ||
      (input.id || '').toLowerCase().includes('email')
    );
    
    const hasNameField = inputs.some(input =>
      (input.name || '').toLowerCase().includes('name') ||
      (input.id || '').toLowerCase().includes('name')
    );
    
    const hasMessageField = inputs.some(input =>
      input.tagName.toLowerCase() === 'textarea' ||
      (input.name || '').toLowerCase().includes('message') ||
      (input.id || '').toLowerCase().includes('message')
    );
    
    if (hasEmailField || (hasNameField && hasMessageField)) {
      contactInfo.contactForms.push({
        formIndex: index,
        hasEmailField,
        hasNameField,
        hasMessageField,
        inputCount: inputs.length,
        action: form.getAttribute('action') || '',
        method: form.getAttribute('method') || 'get'
      });
    }
  });
  
  // Set contact method flags
  contactInfo.contactMethods.hasPhone = contactInfo.phoneNumbers.length > 0;
  contactInfo.contactMethods.hasEmail = contactInfo.emailAddresses.length > 0;
  contactInfo.contactMethods.hasAddress = contactInfo.physicalAddresses.length > 0;
  contactInfo.contactMethods.hasContactForm = contactInfo.contactForms.length > 0;
  contactInfo.contactMethods.hasSocialMedia = contactInfo.socialMediaLinks.length > 0;
  contactInfo.contactMethods.hasLiveChat = document.querySelector('[data-chat], .chat-widget, #chat, .intercom, .zendesk') !== null;
  contactInfo.contactMethods.hasMap = document.querySelector('.map, #map, iframe[src*="maps"], iframe[src*="google.com/maps"]') !== null;
  
  // Remove duplicates and limit results
  contactInfo.phoneNumbers = removeDuplicatesByKey(contactInfo.phoneNumbers, 'cleaned').slice(0, 5);
  contactInfo.emailAddresses = removeDuplicatesByKey(contactInfo.emailAddresses, 'email').slice(0, 5);
  contactInfo.physicalAddresses = removeDuplicatesByKey(contactInfo.physicalAddresses, 'address').slice(0, 3);
  contactInfo.socialMediaLinks = removeDuplicatesByKey(contactInfo.socialMediaLinks, 'url').slice(0, 8);
  
  return contactInfo;
}

// Search Functionality Analysis
function analyzeSearchFunctionality(document) {
  const searchData = {
    searchInputs: [],
    searchForms: [],
    searchFeatures: {
      hasBasicSearch: false,
      hasAdvancedSearch: false,
      hasSearchSuggestions: false,
      hasSearchFilters: false,
      hasVoiceSearch: false,
      hasVisualSearch: false,
      hasAutoComplete: false
    },
    searchTypes: []
  };
  
  // Find search inputs
  const searchSelectors = [
    'input[type="search"]',
    'input[name*="search"]', 'input[id*="search"]', 'input[placeholder*="search" i]',
    'input[name*="query"]', 'input[id*="query"]', 'input[placeholder*="search" i]',
    'input[name="q"]', 'input[id="q"]',
    '.search-input', '.search-field', '#search', '.search-box'
  ];
  
  const foundInputs = new Set();
  
  searchSelectors.forEach(selector => {
    try {
      const elements = [...document.querySelectorAll(selector)];
      elements.forEach(el => foundInputs.add(el));
    } catch (e) {
      // Skip invalid selectors
    }
  });
  
  [...foundInputs].forEach((input, index) => {
    if (index >= 10) return; // Limit for performance
    
    const form = input.closest('form');
    const placeholder = input.getAttribute('placeholder') || '';
    const name = input.getAttribute('name') || '';
    const id = input.getAttribute('id') || '';
    
    searchData.searchInputs.push({
      type: input.getAttribute('type') || 'text',
      placeholder: placeholder.substring(0, 100),
      name,
      id,
      hasForm: form !== null,
      formAction: form ? (form.getAttribute('action') || '') : '',
      formMethod: form ? (form.getAttribute('method') || 'get') : '',
      position: getElementPosition(input, document),
      isVisible: isElementVisible(input)
    });
    
    // Analyze the parent form
    if (form && !searchData.searchForms.some(f => f.element === form)) {
      searchData.searchForms.push(analyzeSearchForm(form));
    }
  });
  
  // Check for search features
  searchData.searchFeatures.hasBasicSearch = foundInputs.size > 0;
  searchData.searchFeatures.hasAdvancedSearch = document.querySelector('.advanced-search, #advanced-search, [data-advanced-search]') !== null;
  searchData.searchFeatures.hasSearchSuggestions = document.querySelector('.search-suggestions, .autocomplete, [data-suggestions]') !== null;
  searchData.searchFeatures.hasSearchFilters = document.querySelector('.search-filters, .filter, [data-filter]') !== null;
  searchData.searchFeatures.hasVoiceSearch = document.querySelector('[data-voice-search], .voice-search, [aria-label*="voice search" i]') !== null;
  searchData.searchFeatures.hasVisualSearch = document.querySelector('[data-visual-search], .visual-search, [aria-label*="visual search" i]') !== null;
  searchData.searchFeatures.hasAutoComplete = [...foundInputs].some(input => 
    input.getAttribute('autocomplete') === 'on' ||
    input.hasAttribute('data-autocomplete') ||
    input.closest('.autocomplete') !== null
  );
  
  // Categorize search types
  if (document.querySelector('.product-search, #product-search') || 
      document.querySelector('input[placeholder*="product" i]')) {
    searchData.searchTypes.push('product');
  }
  
  if (document.querySelector('.site-search, #site-search') ||
      document.querySelector('input[placeholder*="site" i]')) {
    searchData.searchTypes.push('site');
  }
  
  if (document.querySelector('.blog-search, #blog-search') ||
      document.querySelector('input[placeholder*="blog" i]') ||
      document.querySelector('input[placeholder*="article" i]')) {
    searchData.searchTypes.push('content');
  }
  
  if (document.querySelector('.location-search, #location-search') ||
      document.querySelector('input[placeholder*="location" i]') ||
      document.querySelector('input[placeholder*="address" i]')) {
    searchData.searchTypes.push('location');
  }
  
  return {
    ...searchData,
    totalSearchInputs: foundInputs.size,
    totalSearchForms: searchData.searchForms.length,
    isSearchFocused: searchData.searchTypes.length > 0 || foundInputs.size > 1
  };
}

// Newsletter Signup Analysis
function analyzeNewsletterSignups(document) {
  const newsletterData = {
    signupForms: [],
    signupElements: [],
    features: {
      hasEmailSignup: false,
      hasNewsletterCheckbox: false,
      hasSubscriptionOptions: false,
      hasFrequencyControl: false,
      hasIncentives: false,
      hasPrivacyNotice: false,
      hasDoubleOptIn: false
    },
    placements: [],
    incentives: []
  };
  
  // Newsletter-related selectors
  const newsletterSelectors = [
    'form[id*="newsletter"]', 'form[class*="newsletter"]',
    'form[id*="subscribe"]', 'form[class*="subscribe"]',
    'form[id*="signup"]', 'form[class*="signup"]',
    '.newsletter-form', '.subscribe-form', '.email-signup',
    '.subscription-form', '.newsletter-signup', '.email-subscribe'
  ];
  
  const foundForms = new Set();
  
  // Find newsletter forms
  newsletterSelectors.forEach(selector => {
    try {
      const elements = [...document.querySelectorAll(selector)];
      elements.forEach(el => foundForms.add(el));
    } catch (e) {
      // Skip invalid selectors
    }
  });
  
  // Also check forms with email inputs that have newsletter-related attributes
  const emailInputs = [...document.querySelectorAll('input[type="email"]')];
  emailInputs.forEach(input => {
    const form = input.closest('form');
    if (form) {
      const inputName = (input.getAttribute('name') || '').toLowerCase();
      const inputId = (input.getAttribute('id') || '').toLowerCase();
      const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      const labelText = getLabelText(input).toLowerCase();
      
      const newsletterKeywords = ['newsletter', 'subscribe', 'signup', 'updates', 'news'];
      const hasNewsletterKeyword = newsletterKeywords.some(keyword =>
        inputName.includes(keyword) || inputId.includes(keyword) ||
        placeholder.includes(keyword) || labelText.includes(keyword)
      );
      
      if (hasNewsletterKeyword) {
        foundForms.add(form);
      }
    }
  });
  
  // Analyze each newsletter form
  [...foundForms].forEach((form, index) => {
    if (index >= 10) return; // Limit for performance
    
    const analysis = analyzeNewsletterForm(form, document);
    newsletterData.signupForms.push(analysis);
  });
  
  // Find standalone newsletter elements (not in forms)
  const standaloneElements = [
    ...document.querySelectorAll('.newsletter:not(form) input[type="email"]'),
    ...document.querySelectorAll('.subscribe:not(form) input[type="email"]'),
    ...document.querySelectorAll('[data-newsletter] input[type="email"]')
  ];
  
  standaloneElements.forEach((element, index) => {
    if (index >= 5) return; // Limit for performance
    
    newsletterData.signupElements.push({
      tagName: element.tagName.toLowerCase(),
      type: element.getAttribute('type'),
      placeholder: element.getAttribute('placeholder') || '',
      position: getElementPosition(element, document),
      isVisible: isElementVisible(element)
    });
  });
  
  // Analyze features
  newsletterData.features.hasEmailSignup = foundForms.size > 0 || standaloneElements.length > 0;
  
  newsletterData.features.hasNewsletterCheckbox = document.querySelector(
    'input[type="checkbox"][name*="newsletter"], input[type="checkbox"][id*="newsletter"], ' +
    'input[type="checkbox"][name*="subscribe"], input[type="checkbox"][id*="subscribe"]'
  ) !== null;
  
  newsletterData.features.hasSubscriptionOptions = document.querySelector(
    'select[name*="frequency"], select[name*="subscription"], ' +
    'input[type="radio"][name*="frequency"], input[type="radio"][name*="subscription"]'
  ) !== null;
  
  newsletterData.features.hasPrivacyNotice = document.querySelector(
    '.privacy-notice, .privacy-policy-link, a[href*="privacy"]'
  ) !== null;
  
  // Look for incentives
  const incentiveKeywords = [
    'free', 'discount', 'coupon', 'promo', 'exclusive', 'bonus',
    'gift', 'ebook', 'guide', 'download', 'access', 'unlock'
  ];
  
  const textContent = document.body.textContent || '';
  incentiveKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b.*(?:newsletter|subscribe|signup)`, 'gi');
    const matches = textContent.match(regex) || [];
    matches.forEach(match => {
      if (match.length < 200) { // Reasonable length
        newsletterData.incentives.push(match.trim());
      }
    });
  });
  
  newsletterData.features.hasIncentives = newsletterData.incentives.length > 0;
  
  // Determine placements
  [...foundForms].forEach(form => {
    const position = getElementPosition(form, document);
    if (position.isAboveFold) {
      newsletterData.placements.push('above-fold');
    }
    if (form.closest('header')) {
      newsletterData.placements.push('header');
    }
    if (form.closest('footer')) {
      newsletterData.placements.push('footer');
    }
    if (form.closest('aside, .sidebar')) {
      newsletterData.placements.push('sidebar');
    }
    if (form.closest('.modal, .popup, .overlay')) {
      newsletterData.placements.push('modal');
    }
  });
  
  return {
    ...newsletterData,
    totalSignupForms: foundForms.size,
    totalSignupElements: standaloneElements.length,
    hasNewsletterSignup: foundForms.size > 0 || standaloneElements.length > 0,
    placements: [...new Set(newsletterData.placements)], // Remove duplicates
    incentives: newsletterData.incentives.slice(0, 5) // Limit incentives
  };
}

// Helper Functions

function getElementPosition(element, document) {
  // In Node.js/JSDOM environment, we don't have real viewport dimensions
  // So we'll use approximate positioning based on element location in DOM
  const rect = element.getBoundingClientRect?.() || { top: 0, left: 0 };
  const isAboveFold = rect.top < 600; // Approximate fold line at 600px
  const viewportHeight = 800; // Approximate viewport height
  const isInViewport = rect.top >= 0 && rect.top <= viewportHeight;
  
  // Determine section
  let section = 'unknown';
  if (element.closest('header')) section = 'header';
  else if (element.closest('nav')) section = 'navigation';
  else if (element.closest('main, article')) section = 'main';
  else if (element.closest('aside')) section = 'sidebar';
  else if (element.closest('footer')) section = 'footer';
  
  return {
    isAboveFold,
    isInViewport,
    section,
    top: Math.round(rect.top),
    left: Math.round(rect.left)
  };
}

function getElementStyling(element) {
  // Basic styling analysis (limited in Node.js environment)
  const classList = [...(element.classList || [])];
  const style = element.getAttribute('style') || '';
  
  return {
    classes: classList.slice(0, 10), // Limit classes
    hasInlineStyle: style.length > 0,
    isPrimary: classList.some(cls => cls.includes('primary')) || 
               style.includes('primary') ||
               element.getAttribute('data-primary') !== null,
    isSecondary: classList.some(cls => cls.includes('secondary')) ||
                 style.includes('secondary')
  };
}

function isElementVisible(element) {
  // Basic visibility check
  const style = element.getAttribute('style') || '';
  const classList = [...(element.classList || [])];
  
  if (style.includes('display: none') || style.includes('visibility: hidden')) {
    return false;
  }
  
  if (classList.some(cls => cls.includes('hidden') || cls.includes('invisible'))) {
    return false;
  }
  
  return true;
}

function calculateCTAPriority(element, text, position) {
  let priority = 0;
  
  // Text-based priority
  const highPriorityKeywords = ['buy now', 'purchase', 'order', 'get started', 'sign up', 'subscribe'];
  const mediumPriorityKeywords = ['learn more', 'discover', 'explore', 'try free', 'download'];
  
  const lowerText = text.toLowerCase();
  if (highPriorityKeywords.some(keyword => lowerText.includes(keyword))) priority += 5;
  else if (mediumPriorityKeywords.some(keyword => lowerText.includes(keyword))) priority += 3;
  
  // Position-based priority
  if (position.isAboveFold) priority += 3;
  if (position.section === 'main') priority += 2;
  if (position.section === 'header') priority += 1;
  
  // Element-based priority
  const classList = [...(element.classList || [])];
  if (classList.some(cls => cls.includes('primary'))) priority += 2;
  if (element.tagName.toLowerCase() === 'button') priority += 1;
  
  return priority;
}

function categorizeCTATypes(ctaElements) {
  const types = {
    conversion: 0,
    engagement: 0,
    navigation: 0,
    social: 0,
    informational: 0
  };
  
  ctaElements.forEach(cta => {
    const text = cta.text.toLowerCase();
    
    if (text.match(/buy|purchase|order|subscribe|sign up|register|join/)) {
      types.conversion++;
    } else if (text.match(/like|share|follow|comment|rate/)) {
      types.social++;
    } else if (text.match(/learn|read|discover|explore|view|see/)) {
      types.informational++;
    } else if (text.match(/contact|call|email|chat/)) {
      types.engagement++;
    } else {
      types.navigation++;
    }
  });
  
  return types;
}

function analyzeSearchForm(form) {
  const inputs = [...form.querySelectorAll('input, select, textarea')];
  const submitButtons = [...form.querySelectorAll('input[type="submit"], button[type="submit"], button:not([type])')];
  
  return {
    element: form,
    action: form.getAttribute('action') || '',
    method: form.getAttribute('method') || 'get',
    inputCount: inputs.length,
    hasSubmitButton: submitButtons.length > 0,
    hasFilters: inputs.some(input => 
      (input.name || '').includes('filter') || 
      (input.id || '').includes('filter') ||
      input.tagName.toLowerCase() === 'select'
    ),
    isAjax: form.hasAttribute('data-ajax') || 
            form.getAttribute('onsubmit')?.includes('ajax') ||
            form.classList.toString().includes('ajax')
  };
}

function analyzeNewsletterForm(form, document) {
  const inputs = [...form.querySelectorAll('input, textarea, select')];
  const emailInputs = inputs.filter(input => input.type === 'email');
  const checkboxes = inputs.filter(input => input.type === 'checkbox');
  const submitButtons = [...form.querySelectorAll('input[type="submit"], button[type="submit"], button:not([type])')];
  
  return {
    hasEmailInput: emailInputs.length > 0,
    hasNameInput: inputs.some(input => 
      (input.name || '').toLowerCase().includes('name') ||
      (input.id || '').toLowerCase().includes('name')
    ),
    hasCheckboxes: checkboxes.length > 0,
    hasSubmitButton: submitButtons.length > 0,
    submitButtonText: submitButtons.map(btn => (btn.textContent || btn.value || '').trim()).join(', '),
    action: form.getAttribute('action') || '',
    method: form.getAttribute('method') || 'post',
    position: getElementPosition(form, document),
    isVisible: isElementVisible(form),
    inputCount: inputs.length
  };
}

function getLabelText(input) {
  // Find associated label
  const id = input.getAttribute('id');
  if (id) {
    const label = input.ownerDocument.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent || '';
  }
  
  // Check if wrapped in label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent || '';
  
  return '';
}

function removeDuplicatesByKey(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
