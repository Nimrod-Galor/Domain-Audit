// Utility functions for domain link audit
import fs from 'fs';
import path from 'path';

export function extractMainDomain(hostname) {
  // Handle null/undefined input
  if (!hostname || typeof hostname !== 'string') {
    return '';
  }
  
  // Clean up the hostname
  let cleanHostname = hostname.toLowerCase().trim();
  
  // Remove protocol if present
  cleanHostname = cleanHostname.replace(/^https?:\/\//, '');
  
  // Remove www prefix
  cleanHostname = cleanHostname.replace(/^www\./, '');
  
  // Remove path, query, or fragment
  cleanHostname = cleanHostname.split('/')[0];
  cleanHostname = cleanHostname.split('?')[0];
  cleanHostname = cleanHostname.split('#')[0];
  
  const parts = cleanHostname.split('.');
  
  // Handle complex TLDs like co.uk, com.au
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    const knownComplexTlds = ['co.uk', 'com.au', 'co.za', 'com.br', 'co.jp'];
    
    if (knownComplexTlds.includes(lastTwo)) {
      // For complex TLD, return domain + complex TLD
      return parts.slice(-3, -2)[0] + '.' + lastTwo;
    }
  }
  
  // For standard domains (example.com, subdomain.example.com)
  if (parts.length >= 2) {
    // Return the last two parts (domain.tld)
    return parts.slice(-2).join('.');
  }
  
  // Fallback for single part
  return cleanHostname;
}

export function isInternalLink(href, baseDomain) {
  // Handle null/undefined inputs
  if (!href || !baseDomain || typeof href !== 'string' || typeof baseDomain !== 'string') {
    return false;
  }
  
  try {
    // Handle relative URLs (they are internal by definition)
    if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
      return true;
    }
    
    // Handle protocol-relative URLs
    if (href.startsWith('//')) {
      href = 'https:' + href;
    }
    
    // Check for malformed URLs with multiple colons (not part of ://)
    if (href.includes('::')) {
      return false;
    }
    
    // Check for functional protocols before relative URL check
    const functionalProtocols = ['mailto:', 'tel:'];
    if (functionalProtocols.some(protocol => href.toLowerCase().startsWith(protocol))) {
      return false;
    }
    
    // Check for non-fetchable protocols before relative URL check
    const nonFetchableProtocols = ['javascript:', 'ftp:', 'file:'];
    if (nonFetchableProtocols.some(protocol => href.toLowerCase().startsWith(protocol))) {
      return false;
    }
    
    // If no protocol, assume it's a relative URL
    if (!href.includes('://')) {
      return true;
    }
    
    // Parse the URL
    const url = new URL(href);
    
    // Only consider HTTP/HTTPS protocols as potentially internal
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    
    const linkDomain = extractMainDomain(url.hostname);
    const cleanBaseDomain = extractMainDomain(baseDomain);
    
    return linkDomain.toLowerCase() === cleanBaseDomain.toLowerCase();
  } catch (error) {
    // If URL parsing fails and it contains ://, treat as external
    if (href.includes('://')) {
      return false;
    }
    // Otherwise assume it's a relative/internal link
    return true;
  }
}

export function isNonFetchableLink(href) {
  // Handle null/undefined/empty input
  if (!href || typeof href !== 'string') {
    return false;
  }
  
  // Filter out links that can't be fetched via HTTP
  const nonFetchableProtocols = ['javascript:', 'ftp:', 'file:'];
  if (nonFetchableProtocols.some(protocol => href.toLowerCase().startsWith(protocol))) {
    return true;
  }
  
  // Filter out file URLs based on file extensions
  const fileExtensions = [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico',
    // Videos
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v',
    // Audio
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    // Fonts
    'ttf', 'otf', 'woff', 'woff2', 'eot',
    // Other files
    'css', 'js', 'json', 'xml', 'exe', 'dmg', 'pkg', 'deb', 'rpm'
  ];
  
  try {
    const url = new URL(href);
    const pathname = url.pathname.toLowerCase();
    
    // Check if the URL ends with a file extension
    const extension = pathname.split('.').pop();
    if (extension && fileExtensions.includes(extension)) {
      return true;
    }
    
    // Also check for common file patterns with query parameters
    // e.g., image.jpg?version=123
    const pathWithoutQuery = pathname.split('?')[0];
    const extensionFromPath = pathWithoutQuery.split('.').pop();
    if (extensionFromPath && fileExtensions.includes(extensionFromPath)) {
      return true;
    }
  } catch (error) {
    // If URL parsing fails, don't filter it out
    return false;
  }
  
  return false;
}

export function isFunctionalLink(href) {
  // Links that are functional but not HTTP-fetchable (but we want to track)
  const functionalProtocols = ['mailto:', 'tel:'];
  return functionalProtocols.some(protocol => href.toLowerCase().startsWith(protocol));
}

export function normalizeUrl(url) {
  // Handle null/undefined input
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Remove trailing slash unless it's the root path
  if (url.endsWith('/') && url.length > 1) {
    return url.slice(0, -1);
  }
  return url;
}

export function recordFunctionalLink(href, source, _, mailtoLinks, telLinks) {
  // Ensure parameters are provided
  if (!href || !source) {
    return;
  }
  
  const lowerHref = href.toLowerCase();
  
  if (lowerHref.startsWith('mailto:')) {
    // Ensure mailtoLinks object exists
    if (!mailtoLinks) {
      return;
    }
    // Use lowercase version for storage
    if (!mailtoLinks[lowerHref]) {
      mailtoLinks[lowerHref] = {
        sources: new Set()
      };
    }
    mailtoLinks[lowerHref].sources.add(source);
  } else if (lowerHref.startsWith('tel:')) {
    // Ensure telLinks object exists
    if (!telLinks) {
      return;
    }
    // Use lowercase version for storage
    if (!telLinks[lowerHref]) {
      telLinks[lowerHref] = {
        sources: new Set()
      };
    }
    telLinks[lowerHref].sources.add(source);
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
