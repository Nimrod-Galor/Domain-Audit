/**
 * ============================================================================
 * NETWORK UTILITIES MODULE
 * ============================================================================
 * 
 * This module handles all network-related functionality including fetching,
 * timeouts, retries, redirect checking, and external link validation.
 * 
 * Features:
 * - Timeout-based fetching with AbortController
 * - Automatic retry mechanisms
 * - Redirect chain analysis
 * - External link status checking
 * - Rate limiting and throttling
 * 
 * @author Domain Link Audit Team
 * @version 1.0.0
 */

import fetch from 'node-fetch';

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

/**
 * Network operation configuration
 */
export const NETWORK_CONFIG = {
  DEFAULT_TIMEOUT: 30000,        // 30 seconds default timeout
  MAX_REDIRECTS: 5,              // Maximum redirects to follow
  MAX_RETRIES: 3,                // Maximum retry attempts
  RETRY_DELAY: 1000,             // Base retry delay (ms)
  MAX_CONTENT_LENGTH: 10 * 1024 * 1024, // 10MB max content
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  RATE_LIMIT_DELAY: 100          // Minimum delay between requests (ms)
};

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Simple rate limiter to prevent overwhelming servers
 */
class RateLimiter {
  constructor(delayMs = NETWORK_CONFIG.RATE_LIMIT_DELAY) {
    this.delayMs = delayMs;
    this.lastRequestTime = 0;
  }

  /**
   * Wait for rate limit if needed
   * @returns {Promise<void>}
   */
  async wait() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    
    if (elapsed < this.delayMs) {
      const waitTime = this.delayMs - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter();

// ============================================================================
// CORE FETCH UTILITIES
// ============================================================================

/**
 * Fetch with timeout capability
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} Response status and headers
 */
export async function fetchWithTimeout(url, timeout = NETWORK_CONFIG.DEFAULT_TIMEOUT, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Apply rate limiting
    await globalRateLimiter.wait();

    const defaultOptions = {
      method: 'GET', // Use GET instead of HEAD for better compatibility
      signal: controller.signal,
      headers: {
        'User-Agent': NETWORK_CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'close', // Force connection close to prevent hanging
        'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1'
      },
      ...options
    };

    const response = await fetch(url, defaultOptions);
    clearTimeout(timeoutId);
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
      redirected: response.redirected,
      ok: response.ok
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { 
        status: 'TIMEOUT', 
        statusText: 'Request timed out',
        headers: {},
        error: 'timeout'
      };
    }
    
    return { 
      status: 'FETCH_ERROR', 
      statusText: error.message,
      headers: {},
      error: error.name || 'unknown'
    };
  }
}

/**
 * Fetch full content with timeout and size limits
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} Response with content
 */
export async function fetchContent(url, timeout = NETWORK_CONFIG.DEFAULT_TIMEOUT, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Apply rate limiting
    await globalRateLimiter.wait();

    const defaultOptions = {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': NETWORK_CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache'
      },
      ...options
    };

    const response = await fetch(url, defaultOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        content: null,
        error: `HTTP ${response.status}`
      };
    }

    // Check content length before reading
    const contentLength = parseInt(response.headers.get('content-length')) || 0;
    if (contentLength > NETWORK_CONFIG.MAX_CONTENT_LENGTH) {
      return {
        status: 'TOO_LARGE',
        statusText: `Content too large: ${contentLength} bytes`,
        headers: Object.fromEntries(response.headers.entries()),
        content: null,
        error: 'content_too_large'
      };
    }

    // Read content with streaming and size checking
    const chunks = [];
    const decoder = new TextDecoder();
    let totalSize = 0;

    for await (const chunk of response.body) {
      totalSize += chunk.length;
      
      if (totalSize > NETWORK_CONFIG.MAX_CONTENT_LENGTH) {
        return {
          status: 'TOO_LARGE',
          statusText: `Content exceeded size limit during streaming: ${totalSize} bytes`,
          headers: Object.fromEntries(response.headers.entries()),
          content: null,
          error: 'content_too_large'
        };
      }
      
      chunks.push(decoder.decode(chunk, { stream: true }));
    }
    
    chunks.push(decoder.decode()); // Final decode
    const content = chunks.join('');

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      content,
      size: totalSize,
      url: response.url,
      redirected: response.redirected
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { 
        status: 'TIMEOUT', 
        statusText: 'Request timed out',
        headers: {},
        content: null,
        error: 'timeout'
      };
    }
    
    return { 
      status: 'FETCH_ERROR', 
      statusText: error.message,
      headers: {},
      content: null,
      error: error.name || 'unknown'
    };
  }
}

// ============================================================================
// RETRY MECHANISMS
// ============================================================================

/**
 * Fetch with retry mechanism
 * @param {string} url - URL to fetch
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} timeout - Timeout per attempt
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response result
 */
export async function fetchWithRetry(url, maxRetries = NETWORK_CONFIG.MAX_RETRIES, timeout = NETWORK_CONFIG.DEFAULT_TIMEOUT, options = {}) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fetchWithTimeout(url, timeout, options);
      
      // If successful or not worth retrying, return
      if (result.status !== 'FETCH_ERROR' && result.status !== 'TIMEOUT') {
        return {
          ...result,
          attempts: attempt + 1,
          retried: attempt > 0
        };
      }
      
      lastError = result;
      
      // If this was the last attempt, return the error
      if (attempt === maxRetries) {
        return {
          ...result,
          attempts: attempt + 1,
          retried: attempt > 0,
          maxRetriesReached: true
        };
      }
      
      // Wait before retrying (exponential backoff)
      const delay = NETWORK_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        return {
          status: 'FETCH_ERROR',
          statusText: error.message,
          headers: {},
          error: error.name || 'unknown',
          attempts: attempt + 1,
          retried: attempt > 0,
          maxRetriesReached: true
        };
      }
    }
  }
  
  return lastError;
}

// ============================================================================
// REDIRECT ANALYSIS
// ============================================================================

/**
 * Check redirect chain for a URL
 * @param {string} url - URL to check
 * @param {number} maxRedirects - Maximum redirects to follow
 * @param {number} timeout - Timeout per request
 * @returns {Promise<Object>} Redirect chain information
 */
export async function checkRedirectChain(url, maxRedirects = NETWORK_CONFIG.MAX_REDIRECTS, timeout = NETWORK_CONFIG.DEFAULT_TIMEOUT) {
  const redirectChain = [];
  let currentUrl = url;
  let redirectCount = 0;
  const visitedUrls = new Set();
  
  while (redirectCount < maxRedirects) {
    try {
      // Check for loops
      if (visitedUrls.has(currentUrl)) {
        redirectChain.push({ 
          url: currentUrl, 
          status: 'LOOP_DETECTED', 
          headers: {},
          timestamp: new Date().toISOString()
        });
        break;
      }
      
      visitedUrls.add(currentUrl);
      
      const response = await fetch(currentUrl, { 
        method: 'GET', 
        redirect: 'manual',
        headers: {
          'User-Agent': NETWORK_CONFIG.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'close', // Force connection close to prevent hanging
          'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(timeout)
      });
      
      const redirectEntry = {
        url: currentUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      };
      
      redirectChain.push(redirectEntry);
      
      // Check if this is a redirect
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          redirectEntry.error = 'Missing location header';
          break;
        }
        
        // Resolve relative URLs
        try {
          currentUrl = new URL(location, currentUrl).toString();
          redirectCount++;
        } catch (error) {
          redirectEntry.error = `Invalid location header: ${location}`;
          break;
        }
      } else {
        // Not a redirect, we're done
        break;
      }
    } catch (error) {
      redirectChain.push({ 
        url: currentUrl, 
        status: 'FETCH_ERROR', 
        statusText: error.message,
        headers: {},
        error: error.name || 'unknown',
        timestamp: new Date().toISOString()
      });
      break;
    }
  }
  
  const finalUrl = redirectChain.length > 0 ? 
    redirectChain[redirectChain.length - 1].url : url;
  
  return {
    originalUrl: url,
    finalUrl,
    chain: redirectChain,
    redirectCount,
    hasLoop: redirectChain.some(entry => entry.status === 'LOOP_DETECTED'),
    maxRedirectsReached: redirectCount >= maxRedirects,
    isSuccessful: redirectChain.length > 0 && 
      redirectChain[redirectChain.length - 1].status >= 200 && 
      redirectChain[redirectChain.length - 1].status < 300
  };
}

// ============================================================================
// EXTERNAL LINK CHECKING
// ============================================================================

/**
 * Check external link status with comprehensive analysis
 * @param {string} url - URL to check
 * @param {string} sourceUrl - Source page URL
 * @param {Object} options - Check options
 * @returns {Promise<Object>} Link check result
 */
export async function checkExternalLink(url, sourceUrl, options = {}) {
  const {
    maxRetries = NETWORK_CONFIG.MAX_RETRIES,
    timeout = NETWORK_CONFIG.DEFAULT_TIMEOUT,
    checkRedirects = true,
    checkContent = false
  } = options;

  const startTime = Date.now();
  
  try {
    // Basic status check
    const statusResult = await fetchWithRetry(url, maxRetries, timeout);
    
    // Redirect analysis if requested and successful
    let redirectInfo = null;
    if (checkRedirects && statusResult.status !== 'FETCH_ERROR' && statusResult.status !== 'TIMEOUT') {
      redirectInfo = await checkRedirectChain(url, 3, timeout); // Limit to 3 for external links
    }
    
    // Content analysis if requested and successful
    let contentInfo = null;
    if (checkContent && statusResult.ok) {
      try {
        const contentResult = await fetchContent(url, timeout);
        if (contentResult.content) {
          contentInfo = {
            size: contentResult.size,
            contentType: contentResult.headers['content-type'] || 'unknown',
            hasContent: contentResult.content.length > 0,
            encoding: contentResult.headers['content-encoding'] || 'none'
          };
        }
      } catch (error) {
        // Content check failed, but don't fail the whole check
        contentInfo = { error: error.message };
      }
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      sourceUrl,
      status: statusResult.status,
      statusText: statusResult.statusText,
      headers: statusResult.headers,
      responseTime,
      attempts: statusResult.attempts || 1,
      retried: statusResult.retried || false,
      redirectInfo,
      contentInfo,
      timestamp: new Date().toISOString(),
      isSuccessful: statusResult.ok || (statusResult.status >= 200 && statusResult.status < 400),
      error: statusResult.error
    };
    
  } catch (error) {
    return {
      url,
      sourceUrl,
      status: 'CHECK_ERROR',
      statusText: error.message,
      headers: {},
      responseTime: Date.now() - startTime,
      error: error.name || 'unknown',
      timestamp: new Date().toISOString(),
      isSuccessful: false
    };
  }
}

/**
 * Batch check multiple external links with concurrency control
 * @param {Array} links - Array of {url, sourceUrl} objects
 * @param {number} concurrency - Maximum concurrent checks
 * @param {Object} options - Check options
 * @returns {Promise<Array>} Array of check results
 */
export async function batchCheckExternalLinks(links, concurrency = 5, options = {}) {
  const results = [];
  let i = 0;

  /**
   * Worker function for processing links
   * @returns {Promise<void>}
   */
  async function worker() {
    while (i < links.length) {
      const index = i++;
      const { url, sourceUrl } = links[index];
      
      try {
        const result = await checkExternalLink(url, sourceUrl, options);
        results[index] = result;
      } catch (error) {
        results[index] = {
          url,
          sourceUrl,
          status: 'WORKER_ERROR',
          statusText: error.message,
          error: error.name || 'unknown',
          timestamp: new Date().toISOString(),
          isSuccessful: false
        };
      }
    }
  }

  // Start workers
  const workers = Array.from({ length: Math.min(concurrency, links.length) }, worker);
  await Promise.all(workers);

  return results.filter(Boolean); // Remove any undefined results
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if URL is reachable (simple connectivity test)
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} True if reachable
 */
export async function isUrlReachable(url, timeout = 5000) {
  try {
    const result = await fetchWithTimeout(url, timeout);
    return result.status !== 'FETCH_ERROR' && result.status !== 'TIMEOUT';
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * @param {string} url - URL to parse
 * @returns {string|null} Domain or null if invalid
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL for comparison
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash from pathname (except root)
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    // Sort search parameters
    urlObj.searchParams.sort();
    return urlObj.toString();
  } catch {
    return url;
  }
}

// ============================================================================
// NETWORK STATISTICS
// ============================================================================

/**
 * Network statistics tracker
 */
export class NetworkStats {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.timeouts = 0;
    this.retries = 0;
    this.totalResponseTime = 0;
    this.requestsByStatus = new Map();
    this.domainStats = new Map();
  }

  recordRequest(result) {
    this.totalRequests++;
    
    if (result.isSuccessful) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
    
    if (result.error === 'timeout') {
      this.timeouts++;
    }
    
    if (result.retried) {
      this.retries++;
    }
    
    if (result.responseTime) {
      this.totalResponseTime += result.responseTime;
    }
    
    // Track status codes
    const status = result.status;
    this.requestsByStatus.set(status, (this.requestsByStatus.get(status) || 0) + 1);
    
    // Track domain stats
    const domain = extractDomain(result.url);
    if (domain) {
      const domainStat = this.domainStats.get(domain) || { 
        requests: 0, 
        successful: 0, 
        failed: 0,
        avgResponseTime: 0,
        totalResponseTime: 0
      };
      
      domainStat.requests++;
      if (result.isSuccessful) domainStat.successful++;
      else domainStat.failed++;
      
      if (result.responseTime) {
        domainStat.totalResponseTime += result.responseTime;
        domainStat.avgResponseTime = domainStat.totalResponseTime / domainStat.requests;
      }
      
      this.domainStats.set(domain, domainStat);
    }
  }

  getStats() {
    const avgResponseTime = this.totalRequests > 0 ? 
      Math.round(this.totalResponseTime / this.totalRequests) : 0;
    
    return {
      total: this.totalRequests,
      successful: this.successfulRequests,
      failed: this.failedRequests,
      successRate: this.totalRequests > 0 ? 
        Math.round((this.successfulRequests / this.totalRequests) * 100) : 0,
      timeouts: this.timeouts,
      retries: this.retries,
      avgResponseTime,
      statusCodes: Object.fromEntries(this.requestsByStatus),
      topDomains: Array.from(this.domainStats.entries())
        .sort((a, b) => b[1].requests - a[1].requests)
        .slice(0, 10)
        .map(([domain, stats]) => ({ domain, ...stats }))
    };
  }
}

// Export singleton instance
export const networkStats = new NetworkStats();
