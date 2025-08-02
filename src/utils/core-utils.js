// Utility functions for domain link audit
import fs from 'fs';
import path from 'path';

export function extractMainDomain(hostname) {
  const parts = hostname.replace(/^www\./, '').split('.');
  
  // If it's a standard domain (e.g., example.com, blog.example.com)
  if (parts.length >= 2) {
    // For subdomains, include both subdomain and main domain
    if (parts.length > 2) {
      return `${parts[0]}-${parts[parts.length - 2]}`;  // e.g., blog-example
    }
    // For regular domains, just use the main part
    return parts[0];  // e.g., example
  }
  
  // Fallback to first part if something unusual
  return parts[0];
}

export function isInternalLink(href, BASE_URL, DOMAIN) {
  try {
    const parsed = new URL(href, BASE_URL);
    const cleanHostname = parsed.hostname.replace(/^www\./, '');
    const cleanDomain = DOMAIN.replace(/^www\./, '');
    return cleanHostname === cleanDomain;
  } catch {
    return false;
  }
}

export function isNonFetchableLink(href) {
  // Filter out links that can't be fetched via HTTP
  const nonFetchableProtocols = ['javascript:', 'ftp:', 'file:'];
  return nonFetchableProtocols.some(protocol => href.toLowerCase().startsWith(protocol));
}

export function isFunctionalLink(href) {
  // Links that are functional but not HTTP-fetchable (but we want to track)
  const functionalProtocols = ['mailto:', 'tel:'];
  return functionalProtocols.some(protocol => href.toLowerCase().startsWith(protocol));
}

export function normalizeUrl(url) {
  // Remove trailing slash unless it's the root path
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

export function recordFunctionalLink(href, source, mailtoLinks, telLinks) {
  if (href.toLowerCase().startsWith('mailto:')) {
    if (!mailtoLinks[href]) {
      mailtoLinks[href] = {
        sources: new Set()
      };
    }
    mailtoLinks[href].sources.add(source);
  } else if (href.toLowerCase().startsWith('tel:')) {
    if (!telLinks[href]) {
      telLinks[href] = {
        sources: new Set()
      };
    }
    telLinks[href].sources.add(source);
  }
}

export function addToStats(href, anchor, source, stats) {
  if (!stats[href]) {
    stats[href] = {
      count: 0,
      anchors: new Set(),
      sources: new Set()
    };
  }
  stats[href].count++;
  stats[href].anchors.add(anchor);
  stats[href].sources.add(source);
}

export function recordBadRequest(href, status, source, badRequests) {
  if (!badRequests[href]) {
    badRequests[href] = {
      status,
      sources: new Set()
    };
  }
  badRequests[href].sources.add(source);
}

export function recordExternalLink(href, status, source, externalLinks, additionalData = {}) {
  if (!externalLinks[href]) {
    externalLinks[href] = {
      status,
      sources: new Set(),
      headers: additionalData.headers || {},
      redirectChain: additionalData.redirectChain || null,
      timestamp: new Date().toISOString()
    };
  }
  externalLinks[href].status = status;
  externalLinks[href].sources.add(source);
  
  // Update additional data if provided
  if (additionalData.headers) {
    externalLinks[href].headers = additionalData.headers;
  }
  if (additionalData.redirectChain) {
    externalLinks[href].redirectChain = additionalData.redirectChain;
  }
}

export function logFailedUrl(DOMAIN_FOLDER, url, reason) {
  // Ensure domain folder exists before writing log
  if (!fs.existsSync(DOMAIN_FOLDER)) {
    fs.mkdirSync(DOMAIN_FOLDER, { recursive: true });
  }
  
  const logPath = path.resolve(DOMAIN_FOLDER, 'failed-urls.log');
  const line = `[${new Date().toISOString()}] ${url} - ${reason}\n`;
  fs.appendFileSync(logPath, line, 'utf-8');
}
