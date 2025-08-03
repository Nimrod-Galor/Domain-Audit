#!/usr/bin/env node
// Comprehensive Data Analyzer for Domain Link Audit
// Usage: node data-analyzer.js <path-to-crawl-state.json> [output.html]

import fs from 'fs';
import path from 'path';

// Safe URL decoder that handles malformed URLs
function safeDecodeURIComponent(url) {
  try {
    return decodeURIComponent(url);
  } catch (e) {
    return url; // Return original if decoding fails
  }
}

// Format bytes to human readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Format time in milliseconds
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Generate compression analysis
function generateCompressionAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let compressionStats = {
    gzip: 0,
    brotli: 0,
    deflate: 0,
    none: 0,
    other: 0
  };
  
  let compressionIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const compression = data.performance?.compression || 'none';
    const pageSize = data.pageSize || 0;
    
    if (compression === 'gzip') {
      compressionStats.gzip++;
    } else if (compression === 'br' || compression === 'brotli') {
      compressionStats.brotli++;
    } else if (compression === 'deflate') {
      compressionStats.deflate++;
    } else if (compression === 'none' || compression === '') {
      compressionStats.none++;
      if (pageSize > 1024) { // Pages larger than 1KB without compression
        compressionIssues.push(`Large uncompressed page (${formatBytes(pageSize)}): ${safeDecodeURIComponent(url)}`);
      }
    } else {
      compressionStats.other++;
    }
  }
  
  const pageCount = Object.keys(pageData).length;
  const compressedPages = pageCount - compressionStats.none;
  const compressionRate = pageCount > 0 ? ((compressedPages / pageCount) * 100).toFixed(1) : 0;
  
  return `
    <div class="analysis-section">
      <h3>🗜️ Compression Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${compressionRate}%</div>
          <div class="stat-label">Pages Using Compression</div>
          <div class="stat-percentage">${compressedPages}/${pageCount} pages</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${compressionStats.gzip}</div>
          <div class="stat-label">Gzip Compressed</div>
          <div class="stat-percentage">${pageCount > 0 ? ((compressionStats.gzip / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${compressionStats.brotli}</div>
          <div class="stat-label">Brotli Compressed</div>
          <div class="stat-percentage">${pageCount > 0 ? ((compressionStats.brotli / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${compressionStats.none}</div>
          <div class="stat-label">Uncompressed Pages</div>
          <div class="stat-percentage">${pageCount > 0 ? ((compressionStats.none / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>
      
      ${compressionIssues.length > 0 ? `
      <div class="compression-issues">
        <h4>⚠️ Compression Issues (${compressionIssues.length} found)</h4>
        <div class="issues-list">
          ${compressionIssues.slice(0, 15).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${compressionIssues.length > 15 ? `<div class="issue-item">... and ${compressionIssues.length - 15} more issues</div>` : ''}
        </div>
      </div>
      ` : '<div class="success-message">✅ No compression issues found!</div>'}
    </div>
  `;
}

// Generate HTTP headers analysis
function generateHeadersAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let headerStats = {
    cacheControl: 0,
    etag: 0,
    lastModified: 0,
    expires: 0,
    contentType: new Map(),
    server: new Map(),
    xPoweredBy: new Map()
  };
  
  let headerIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const headers = data.headers || {};
    
    // Cache headers
    if (headers['cache-control']) headerStats.cacheControl++;
    if (headers['etag']) headerStats.etag++;
    if (headers['last-modified']) headerStats.lastModified++;
    if (headers['expires']) headerStats.expires++;
    
    // Content type analysis
    const contentType = headers['content-type'] || 'unknown';
    const baseContentType = contentType.split(';')[0].trim();
    headerStats.contentType.set(baseContentType, (headerStats.contentType.get(baseContentType) || 0) + 1);
    
    // Server analysis
    const server = headers['server'] || 'unknown';
    headerStats.server.set(server, (headerStats.server.get(server) || 0) + 1);
    
    // X-Powered-By analysis
    const poweredBy = headers['x-powered-by'];
    if (poweredBy) {
      headerStats.xPoweredBy.set(poweredBy, (headerStats.xPoweredBy.get(poweredBy) || 0) + 1);
      headerIssues.push(`X-Powered-By header exposed (${poweredBy}): ${safeDecodeURIComponent(url)}`);
    }
    
    // Check for missing cache headers on static-looking resources
    const isStaticResource = url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/i);
    if (isStaticResource && !headers['cache-control'] && !headers['expires']) {
      headerIssues.push(`Static resource without cache headers: ${safeDecodeURIComponent(url)}`);
    }
    
    // Check for missing content-type
    if (!headers['content-type']) {
      headerIssues.push(`Missing Content-Type header: ${safeDecodeURIComponent(url)}`);
    }
  }
  
  const pageCount = Object.keys(pageData).length;
  
  // Get top content types, servers
  const topContentTypes = Array.from(headerStats.contentType.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const topServers = Array.from(headerStats.server.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const topPoweredBy = Array.from(headerStats.xPoweredBy.entries())
    .sort((a, b) => b[1] - a[1]);
  
  return `
    <div class="analysis-section">
      <h3>📋 HTTP Headers Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${headerStats.cacheControl}/${pageCount}</div>
          <div class="stat-label">Cache-Control Headers</div>
          <div class="stat-percentage">${pageCount > 0 ? ((headerStats.cacheControl / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${headerStats.etag}/${pageCount}</div>
          <div class="stat-label">ETag Headers</div>
          <div class="stat-percentage">${pageCount > 0 ? ((headerStats.etag / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${headerStats.lastModified}/${pageCount}</div>
          <div class="stat-label">Last-Modified Headers</div>
          <div class="stat-percentage">${pageCount > 0 ? ((headerStats.lastModified / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${headerStats.expires}/${pageCount}</div>
          <div class="stat-label">Expires Headers</div>
          <div class="stat-percentage">${pageCount > 0 ? ((headerStats.expires / pageCount) * 100).toFixed(1) : 0}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${topContentTypes.length}</div>
          <div class="stat-label">Content Types Found</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${topServers.length}</div>
          <div class="stat-label">Server Types</div>
        </div>
      </div>
      
      ${topContentTypes.length > 0 ? `
      <div class="content-types-analysis">
        <h4>📄 Content Types Distribution</h4>
        <div class="content-types-list">
          ${topContentTypes.map(([type, count]) => `
            <div class="content-type-item">
              <span class="content-type">${type}</span>
              <span class="content-count">${count} pages (${((count / pageCount) * 100).toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${topServers.length > 0 ? `
      <div class="servers-analysis">
        <h4>🖥️ Server Software Distribution</h4>
        <div class="servers-list">
          ${topServers.map(([server, count]) => `
            <div class="server-item">
              <span class="server-name">${server}</span>
              <span class="server-count">${count} pages (${((count / pageCount) * 100).toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${topPoweredBy.length > 0 ? `
      <div class="powered-by-analysis">
        <h4>⚠️ X-Powered-By Headers (Security Risk)</h4>
        <div class="powered-by-list">
          ${topPoweredBy.map(([poweredBy, count]) => `
            <div class="powered-by-item">
              <span class="powered-by-name">${poweredBy}</span>
              <span class="powered-by-count">${count} pages</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${headerIssues.length > 0 ? `
      <div class="header-issues">
        <h4>⚠️ Header Issues (${headerIssues.length} found)</h4>
        <div class="issues-list">
          ${headerIssues.slice(0, 15).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${headerIssues.length > 15 ? `<div class="issue-item">... and ${headerIssues.length - 15} more issues</div>` : ''}
        </div>
      </div>
      ` : '<div class="success-message">✅ No header issues found!</div>'}
    </div>
  `;
}

// Generate performance insights
function generatePerformanceAnalysis(pageData) {
  if (!pageData || pageData.size === 0) return '';
  
  let totalResponseTime = 0;
  let totalPageSize = 0;
  let slowestPage = { url: '', time: 0 };
  let largestPage = { url: '', size: 0 };
  let fastestPage = { url: '', time: Infinity };
  let smallestPage = { url: '', size: Infinity };
  
  for (const [url, data] of Object.entries(pageData)) {
    const responseTime = data.responseTime || 0;
    const pageSize = data.pageSize || 0;
    
    totalResponseTime += responseTime;
    totalPageSize += pageSize;
    
    if (responseTime > slowestPage.time) {
      slowestPage = { url, time: responseTime };
    }
    if (responseTime < fastestPage.time && responseTime > 0) {
      fastestPage = { url, time: responseTime };
    }
    if (pageSize > largestPage.size) {
      largestPage = { url, size: pageSize };
    }
    if (pageSize < smallestPage.size && pageSize > 0) {
      smallestPage = { url, size: pageSize };
    }
  }
  
  const pageCount = Object.keys(pageData).length;
  const avgResponseTime = pageCount > 0 ? Math.round(totalResponseTime / pageCount) : 0;
  const avgPageSize = pageCount > 0 ? Math.round(totalPageSize / pageCount) : 0;
  
  return `
    <div class="analysis-section">
      <h3>🚀 Performance Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${formatTime(avgResponseTime)}</div>
          <div class="stat-label">Average Response Time</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${formatBytes(avgPageSize)}</div>
          <div class="stat-label">Average Page Size</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${formatBytes(totalPageSize)}</div>
          <div class="stat-label">Total Data Transferred</div>
        </div>
      </div>
      
      <div class="performance-details">
        <div class="performance-item">
          <h4>⚡ Fastest Page</h4>
          <div class="performance-url">${safeDecodeURIComponent(fastestPage.url)}</div>
          <div class="performance-value">${formatTime(fastestPage.time)}</div>
        </div>
        
        <div class="performance-item">
          <h4>🐌 Slowest Page</h4>
          <div class="performance-url">${safeDecodeURIComponent(slowestPage.url)}</div>
          <div class="performance-value">${formatTime(slowestPage.time)}</div>
        </div>
        
        <div class="performance-item">
          <h4>📦 Smallest Page</h4>
          <div class="performance-url">${safeDecodeURIComponent(smallestPage.url)}</div>
          <div class="performance-value">${formatBytes(smallestPage.size)}</div>
        </div>
        
        <div class="performance-item">
          <h4>📊 Largest Page</h4>
          <div class="performance-url">${safeDecodeURIComponent(largestPage.url)}</div>
          <div class="performance-value">${formatBytes(largestPage.size)}</div>
        </div>
      </div>
    </div>
  `;
}

// Generate SEO analysis
function generateSEOAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let pagesWithTitle = 0;
  let pagesWithMetaDesc = 0;
  let pagesWithH1 = 0;
  let pagesWithCanonical = 0;
  let pagesWithOG = 0;
  let avgTitleLength = 0;
  let avgMetaDescLength = 0;
  let totalWordCount = 0;
  let issues = [];
  
  // Track duplicates and keywords
  const titleTracker = new Map(); // title -> [urls]
  const metaDescTracker = new Map(); // description -> [urls]
  const keywordAnalysis = new Map(); // keyword -> count
  const structuredDataTypes = new Map(); // type -> count
  
  for (const [url, data] of Object.entries(pageData)) {
    const seo = data.seo || {};
    const content = data.content || {};
    
    // Title analysis
    if (seo.title?.text) {
      pagesWithTitle++;
      const titleText = seo.title.text.trim();
      avgTitleLength += seo.title.length || 0;
      
      // Track title duplicates
      if (!titleTracker.has(titleText)) {
        titleTracker.set(titleText, []);
      }
      titleTracker.get(titleText).push(url);
      
      // Track title keywords
      if (seo.title.keywords) {
        seo.title.keywords.forEach(keyword => {
          keywordAnalysis.set(keyword, (keywordAnalysis.get(keyword) || 0) + 1);
        });
      }
      
      if (seo.title.length > 60) {
        issues.push(`Long title (${seo.title.length} chars): ${safeDecodeURIComponent(url)}`);
      }
      if (seo.title.length < 30) {
        issues.push(`Short title (${seo.title.length} chars): ${safeDecodeURIComponent(url)}`);
      }
    } else {
      issues.push(`Missing title: ${safeDecodeURIComponent(url)}`);
    }
    
    // Meta description analysis
    if (seo.metaDescription?.text) {
      pagesWithMetaDesc++;
      const metaDescText = seo.metaDescription.text.trim();
      avgMetaDescLength += seo.metaDescription.length || 0;
      
      // Track meta description duplicates
      if (!metaDescTracker.has(metaDescText)) {
        metaDescTracker.set(metaDescText, []);
      }
      metaDescTracker.get(metaDescText).push(url);
      
      if (seo.metaDescription.length > 160) {
        issues.push(`Long meta description (${seo.metaDescription.length} chars): ${safeDecodeURIComponent(url)}`);
      }
    } else {
      issues.push(`Missing meta description: ${safeDecodeURIComponent(url)}`);
    }
    
    // H1 analysis
    if (content.headings?.h1?.length > 0) {
      pagesWithH1++;
      if (content.headings.h1.length > 1) {
        issues.push(`Multiple H1 tags (${content.headings.h1.length}): ${safeDecodeURIComponent(url)}`);
      }
    } else {
      issues.push(`Missing H1: ${safeDecodeURIComponent(url)}`);
    }
    
    // Canonical
    if (seo.canonical) pagesWithCanonical++;
    
    // Open Graph
    if (seo.openGraph?.title) pagesWithOG++;
    
    // Structured Data
    if (seo.structuredData?.types) {
      seo.structuredData.types.forEach(type => {
        structuredDataTypes.set(type, (structuredDataTypes.get(type) || 0) + 1);
      });
    }
    
    // Word count
    totalWordCount += content.wordCount || 0;
    if (content.wordCount && content.wordCount < 300) {
      issues.push(`Low word count (${content.wordCount} words): ${safeDecodeURIComponent(url)}`);
    }
  }
  
  // Identify duplicates
  const duplicateTitles = Array.from(titleTracker.entries()).filter(([title, urls]) => urls.length > 1);
  const duplicateMetaDescs = Array.from(metaDescTracker.entries()).filter(([desc, urls]) => urls.length > 1);
  
  // Add duplicate issues
  duplicateTitles.forEach(([title, urls]) => {
    issues.push(`Duplicate title "${title}" found on ${urls.length} pages: ${urls.slice(0, 3).map(url => safeDecodeURIComponent(url)).join(', ')}${urls.length > 3 ? ` (+${urls.length - 3} more)` : ''}`);
  });
  
  duplicateMetaDescs.forEach(([desc, urls]) => {
    issues.push(`Duplicate meta description found on ${urls.length} pages: ${urls.slice(0, 3).map(url => safeDecodeURIComponent(url)).join(', ')}${urls.length > 3 ? ` (+${urls.length - 3} more)` : ''}`);
  });
  
  // Get top keywords
  const topKeywords = Array.from(keywordAnalysis.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Get structured data types
  const topStructuredDataTypes = Array.from(structuredDataTypes.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const pageCount = Object.keys(pageData).length;
  avgTitleLength = pagesWithTitle > 0 ? Math.round(avgTitleLength / pagesWithTitle) : 0;
  avgMetaDescLength = pagesWithMetaDesc > 0 ? Math.round(avgMetaDescLength / pagesWithMetaDesc) : 0;
  const avgWordCount = pageCount > 0 ? Math.round(totalWordCount / pageCount) : 0;
  
  return `
    <div class="analysis-section">
      <h3>🔍 SEO Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${pagesWithTitle}/${pageCount}</div>
          <div class="stat-label">Pages with Titles</div>
          <div class="stat-percentage">${(pagesWithTitle/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${pagesWithMetaDesc}/${pageCount}</div>
          <div class="stat-label">Pages with Meta Descriptions</div>
          <div class="stat-percentage">${(pagesWithMetaDesc/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${pagesWithH1}/${pageCount}</div>
          <div class="stat-label">Pages with H1</div>
          <div class="stat-percentage">${(pagesWithH1/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${pagesWithCanonical}/${pageCount}</div>
          <div class="stat-label">Pages with Canonical</div>
          <div class="stat-percentage">${(pagesWithCanonical/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${pagesWithOG}/${pageCount}</div>
          <div class="stat-label">Pages with Open Graph</div>
          <div class="stat-percentage">${(pagesWithOG/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgWordCount}</div>
          <div class="stat-label">Average Word Count</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgTitleLength}</div>
          <div class="stat-label">Average Title Length</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgMetaDescLength}</div>
          <div class="stat-label">Average Meta Desc Length</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${duplicateTitles.length}</div>
          <div class="stat-label">Duplicate Titles</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${duplicateMetaDescs.length}</div>
          <div class="stat-label">Duplicate Meta Descriptions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${topStructuredDataTypes.length}</div>
          <div class="stat-label">Structured Data Types</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${topKeywords.length}</div>
          <div class="stat-label">Unique Keywords Found</div>
        </div>
      </div>
      
      ${topKeywords.length > 0 ? `
      <div class="keyword-analysis">
        <h4>🔑 Top Keywords in Titles</h4>
        <div class="keywords-list">
          ${topKeywords.map(([keyword, count]) => `
            <span class="keyword-tag">${keyword} (${count})</span>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${topStructuredDataTypes.length > 0 ? `
      <div class="structured-data-analysis">
        <h4>📋 Structured Data Types</h4>
        <div class="structured-data-list">
          ${topStructuredDataTypes.map(([type, count]) => `
            <div class="structured-data-item">
              <span class="data-type">${type}</span>
              <span class="data-count">${count} pages</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${issues.length > 0 ? `
      <div class="seo-issues">
        <h4>⚠️ SEO Issues (${issues.length} found)</h4>
        <div class="issues-list">
          ${issues.slice(0, 25).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${issues.length > 25 ? `<div class="issue-item">... and ${issues.length - 25} more issues</div>` : ''}
        </div>
      </div>
      ` : '<div class="success-message">✅ No SEO issues found!</div>'}
    </div>
  `;
}

// Generate comprehensive accessibility analysis
function generateAccessibilityAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let totalImages = 0;
  let imagesWithoutAlt = 0;
  let emptyAltImages = 0;
  let decorativeImages = 0;
  let pagesWithLangAttr = 0;
  let totalForms = 0;
  let inputsWithLabels = 0;
  let inputsWithoutLabels = 0;
  let totalHeadings = 0;
  let headingHierarchyIssues = 0;
  let totalAriaElements = 0;
  let contrastTotalChecked = 0;
  let contrastPassAA = 0;
  let contrastPassAAA = 0;
  let contrastFailAA = 0;
  let accessibilityIssues = [];
  let contrastIssues = [];
  let formAccessibilityIssues = [];
  let headingIssues = [];
  let ariaIssues = [];
  let accessibilityScores = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const content = data.content || {};
    const accessibility = data.accessibility || {};
    const forms = content.forms || {};
    
    // Images analysis
    if (content.images) {
      totalImages += content.images.total || 0;
      imagesWithoutAlt += content.images.withoutAlt || 0;
      emptyAltImages += content.images.emptyAlt || 0;
      decorativeImages += content.images.decorativeImages || 0;
      
      if (content.images.withoutAlt > 0) {
        accessibilityIssues.push(`${content.images.withoutAlt} images without alt text: ${safeDecodeURIComponent(url)}`);
      }
      if (content.images.emptyAlt > 0) {
        accessibilityIssues.push(`${content.images.emptyAlt} images with empty alt text: ${safeDecodeURIComponent(url)}`);
      }
    }
    
    // Language attribute
    if (accessibility.hasLangAttribute) {
      pagesWithLangAttr++;
    } else {
      accessibilityIssues.push(`Missing lang attribute: ${safeDecodeURIComponent(url)}`);
    }
    
    // Color contrast analysis
    if (accessibility.colorContrast) {
      const contrast = accessibility.colorContrast;
      contrastTotalChecked += contrast.totalChecked || 0;
      contrastPassAA += contrast.passAA || 0;
      contrastPassAAA += contrast.passAAA || 0;
      contrastFailAA += contrast.failAA || 0;
      
      if (contrast.contrastIssues && contrast.contrastIssues.length > 0) {
        contrast.contrastIssues.forEach(issue => {
          contrastIssues.push({
            url: safeDecodeURIComponent(url),
            ...issue
          });
        });
      }
    }
    
    // Form accessibility analysis
    if (forms.total > 0) {
      totalForms += forms.total;
      const formAccess = accessibility.formAccessibility || {};
      inputsWithLabels += formAccess.withLabels || 0;
      inputsWithoutLabels += formAccess.missingLabels || 0;
      
      if (formAccess.accessibilityIssues && formAccess.accessibilityIssues.length > 0) {
        formAccess.accessibilityIssues.forEach(issue => {
          formAccessibilityIssues.push({
            url: safeDecodeURIComponent(url),
            ...issue
          });
        });
      }
    }
    
    // Heading hierarchy analysis
    if (accessibility.headingHierarchy) {
      const headings = accessibility.headingHierarchy;
      totalHeadings += headings.totalHeadings || 0;
      
      if (headings.issues && headings.issues.length > 0) {
        headingHierarchyIssues += headings.issues.length;
        headings.issues.forEach(issue => {
          headingIssues.push({
            url: safeDecodeURIComponent(url),
            ...issue
          });
        });
      }
    }
    
    // ARIA analysis
    if (accessibility.ariaAnalysis) {
      const aria = accessibility.ariaAnalysis;
      totalAriaElements += aria.totalAriaElements || 0;
      
      if (aria.ariaIssues && aria.ariaIssues.length > 0) {
        aria.ariaIssues.forEach(issue => {
          ariaIssues.push({
            url: safeDecodeURIComponent(url),
            ...issue
          });
        });
      }
    }
    
    // Accessibility score
    if (accessibility.accessibilityScore !== undefined) {
      accessibilityScores.push(accessibility.accessibilityScore);
    }
  }
  
  const pageCount = Object.keys(pageData).length;
  const altTextCoverage = totalImages > 0 ? ((totalImages - imagesWithoutAlt) / totalImages * 100).toFixed(1) : 100;
  const contrastAAPercentage = contrastTotalChecked > 0 ? ((contrastPassAA / contrastTotalChecked) * 100).toFixed(1) : 100;
  const contrastAAAPercentage = contrastTotalChecked > 0 ? ((contrastPassAAA / contrastTotalChecked) * 100).toFixed(1) : 100;
  const formLabelPercentage = (inputsWithLabels + inputsWithoutLabels) > 0 ? 
    ((inputsWithLabels / (inputsWithLabels + inputsWithoutLabels)) * 100).toFixed(1) : 100;
  const averageScore = accessibilityScores.length > 0 ? 
    (accessibilityScores.reduce((sum, score) => sum + score, 0) / accessibilityScores.length).toFixed(1) : 'N/A';
  
  return `
    <div class="analysis-section">
      <h3>♿ Comprehensive Accessibility Analysis</h3>
      
      <div class="accessibility-overview">
        <div class="overview-card ${averageScore >= 80 ? 'good' : averageScore >= 60 ? 'warning' : 'error'}">
          <h4>Overall Accessibility Score</h4>
          <div class="score-large">${averageScore}${averageScore !== 'N/A' ? '/100' : ''}</div>
          <div class="score-description">
            ${averageScore >= 80 ? '✅ Good accessibility compliance' : 
              averageScore >= 60 ? '⚠️ Needs improvement' : 
              averageScore !== 'N/A' ? '❌ Poor accessibility compliance' : 'Unable to calculate score'}
          </div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${totalImages - imagesWithoutAlt}/${totalImages}</div>
          <div class="stat-label">Images with Alt Text</div>
          <div class="stat-percentage ${altTextCoverage >= 95 ? 'good' : altTextCoverage >= 80 ? 'warning' : 'error'}">${altTextCoverage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${contrastPassAA}/${contrastTotalChecked}</div>
          <div class="stat-label">WCAG AA Contrast</div>
          <div class="stat-percentage ${contrastAAPercentage >= 95 ? 'good' : contrastAAPercentage >= 80 ? 'warning' : 'error'}">${contrastAAPercentage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${contrastPassAAA}/${contrastTotalChecked}</div>
          <div class="stat-label">WCAG AAA Contrast</div>
          <div class="stat-percentage ${contrastAAAPercentage >= 90 ? 'good' : contrastAAAPercentage >= 70 ? 'warning' : 'error'}">${contrastAAAPercentage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${inputsWithLabels}/${inputsWithLabels + inputsWithoutLabels}</div>
          <div class="stat-label">Form Inputs with Labels</div>
          <div class="stat-percentage ${formLabelPercentage >= 95 ? 'good' : formLabelPercentage >= 80 ? 'warning' : 'error'}">${formLabelPercentage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${pagesWithLangAttr}/${pageCount}</div>
          <div class="stat-label">Pages with Lang Attribute</div>
          <div class="stat-percentage ${(pagesWithLangAttr/pageCount*100) >= 95 ? 'good' : (pagesWithLangAttr/pageCount*100) >= 80 ? 'warning' : 'error'}">${(pagesWithLangAttr/pageCount*100).toFixed(1)}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${totalAriaElements}</div>
          <div class="stat-label">ARIA Elements Found</div>
          <div class="stat-percentage">${totalAriaElements > 0 ? 'Present' : 'None'}</div>
        </div>
      </div>
      
      ${contrastIssues.length > 0 ? `
      <div class="accessibility-issues contrast-issues">
        <h4>🎨 Color Contrast Issues (${contrastIssues.length} found)</h4>
        <div class="issues-list">
          ${contrastIssues.slice(0, 10).map(issue => `
            <div class="issue-item contrast-issue ${issue.severity}">
              <div class="issue-header">
                <span class="element-tag">${issue.element}</span>
                <span class="contrast-ratio">${issue.contrast}:1</span>
                <span class="severity-badge ${issue.severity}">${issue.severity}</span>
              </div>
              <div class="issue-text">"${issue.text}"</div>
              <div class="color-info">
                <span class="color-sample" style="background: ${issue.foreground}; color: ${issue.background};">Aa</span>
                Foreground: ${issue.foreground} | Background: ${issue.background}
              </div>
              <div class="requirements">
                Required: AA ${issue.aaRequirement}:1, AAA ${issue.aaaRequirement}:1
                ${issue.isLargeText ? '(Large text)' : '(Normal text)'}
              </div>
              <div class="issue-url">${issue.url}</div>
            </div>
          `).join('')}
          ${contrastIssues.length > 10 ? `<div class="issue-item">... and ${contrastIssues.length - 10} more contrast issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${formAccessibilityIssues.length > 0 ? `
      <div class="accessibility-issues form-issues">
        <h4>📝 Form Accessibility Issues (${formAccessibilityIssues.length} found)</h4>
        <div class="issues-list">
          ${formAccessibilityIssues.slice(0, 10).map(issue => `
            <div class="issue-item form-issue">
              <span class="element-tag">${issue.element}${issue.inputType ? `[type="${issue.inputType}"]` : ''}</span>
              ${issue.issue}
              <div class="issue-url">${issue.url}</div>
            </div>
          `).join('')}
          ${formAccessibilityIssues.length > 10 ? `<div class="issue-item">... and ${formAccessibilityIssues.length - 10} more form issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${headingIssues.length > 0 ? `
      <div class="accessibility-issues heading-issues">
        <h4>📋 Heading Structure Issues (${headingIssues.length} found)</h4>
        <div class="issues-list">
          ${headingIssues.slice(0, 8).map(issue => `
            <div class="issue-item heading-issue">
              <span class="heading-level">H${issue.level}</span>
              ${issue.heading ? `"${issue.heading}"` : ''}
              ${issue.issue}
              <div class="issue-url">${issue.url}</div>
            </div>
          `).join('')}
          ${headingIssues.length > 8 ? `<div class="issue-item">... and ${headingIssues.length - 8} more heading issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${ariaIssues.length > 0 ? `
      <div class="accessibility-issues aria-issues">
        <h4>🎭 ARIA Issues (${ariaIssues.length} found)</h4>
        <div class="issues-list">
          ${ariaIssues.slice(0, 8).map(issue => `
            <div class="issue-item aria-issue">
              <span class="element-tag">${issue.element}</span>
              ${issue.issue}
              <div class="issue-url">${issue.url}</div>
            </div>
          `).join('')}
          ${ariaIssues.length > 8 ? `<div class="issue-item">... and ${ariaIssues.length - 8} more ARIA issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${accessibilityIssues.length > 0 ? `
      <div class="accessibility-issues general-issues">
        <h4>⚠️ General Accessibility Issues (${accessibilityIssues.length} found)</h4>
        <div class="issues-list">
          ${accessibilityIssues.slice(0, 10).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${accessibilityIssues.length > 10 ? `<div class="issue-item">... and ${accessibilityIssues.length - 10} more issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${(accessibilityIssues.length === 0 && contrastIssues.length === 0 && formAccessibilityIssues.length === 0 && headingIssues.length === 0 && ariaIssues.length === 0) ? 
        '<div class="success-message">✅ No major accessibility issues found!</div>' : ''}
    </div>
  `;
}

// Generate comprehensive UX elements analysis
function generateUXElementsAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let totalCTAs = 0;
  let ctaDetails = [];
  let contactMethods = {
    phone: 0,
    email: 0,
    form: 0,
    social: 0,
    address: 0,
    liveChat: 0,
    map: 0
  };
  let searchFeatures = {
    basic: 0,
    advanced: 0,
    filters: 0,
    suggestions: 0
  };
  let newsletterSignups = {
    forms: 0,
    elements: 0,
    incentives: 0
  };
  let uxIssues = [];
  let bestPractices = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const ux = data.uxElements || {};
    
    // CTA Analysis
    if (ux.callToAction) {
      const cta = ux.callToAction;
      totalCTAs += cta.totalCTAs || 0;
      
      if (cta.ctaElements && cta.ctaElements.length > 0) {
        cta.ctaElements.slice(0, 3).forEach(element => {
          ctaDetails.push({
            url: safeDecodeURIComponent(url),
            text: element.text,
            position: element.position?.section || 'unknown',
            priority: element.priority || 0,
            isAboveFold: element.position?.isAboveFold || false
          });
        });
      }
      
      if (!cta.hasAboveFold) {
        uxIssues.push(`No above-fold CTAs found: ${safeDecodeURIComponent(url)}`);
      }
      
      if (!cta.hasPrimaryCTA) {
        uxIssues.push(`No primary CTA identified: ${safeDecodeURIComponent(url)}`);
      }
    }
    
    // Contact Information Analysis
    if (ux.contactInformation) {
      const contact = ux.contactInformation;
      const methods = contact.contactMethods || {};
      
      if (methods.hasPhone) contactMethods.phone++;
      if (methods.hasEmail) contactMethods.email++;
      if (methods.hasContactForm) contactMethods.form++;
      if (methods.hasSocialMedia) contactMethods.social++;
      if (methods.hasAddress) contactMethods.address++;
      if (methods.hasLiveChat) contactMethods.liveChat++;
      if (methods.hasMap) contactMethods.map++;
      
      // Check for contact method availability
      const availableMethods = Object.values(methods).filter(Boolean).length;
      if (availableMethods === 0) {
        uxIssues.push(`No contact methods found: ${safeDecodeURIComponent(url)}`);
      } else if (availableMethods === 1) {
        uxIssues.push(`Limited contact options (only 1 method): ${safeDecodeURIComponent(url)}`);
      }
    }
    
    // Search Functionality Analysis
    if (ux.searchFunctionality) {
      const search = ux.searchFunctionality;
      const features = search.searchFeatures || {};
      
      if (features.hasBasicSearch) searchFeatures.basic++;
      if (features.hasAdvancedSearch) searchFeatures.advanced++;
      if (features.hasSearchFilters) searchFeatures.filters++;
      if (features.hasSearchSuggestions) searchFeatures.suggestions++;
      
      if (search.totalSearchInputs > 1) {
        bestPractices.push(`Multiple search options available: ${safeDecodeURIComponent(url)}`);
      }
    }
    
    // Newsletter Signup Analysis
    if (ux.newsletterSignups) {
      const newsletter = ux.newsletterSignups;
      
      newsletterSignups.forms += newsletter.totalSignupForms || 0;
      newsletterSignups.elements += newsletter.totalSignupElements || 0;
      newsletterSignups.incentives += newsletter.incentives?.length || 0;
      
      if (newsletter.features?.hasIncentives) {
        bestPractices.push(`Newsletter incentives offered: ${safeDecodeURIComponent(url)}`);
      }
      
      if (newsletter.placements && newsletter.placements.includes('modal')) {
        uxIssues.push(`Newsletter popup detected (potential UX issue): ${safeDecodeURIComponent(url)}`);
      }
    }
  }
  
  const pageCount = Object.keys(pageData).length;
  const ctaPerPage = pageCount > 0 ? (totalCTAs / pageCount).toFixed(1) : 0;
  const contactCoverage = pageCount > 0 ? ((contactMethods.phone + contactMethods.email + contactMethods.form) / pageCount * 100).toFixed(1) : 0;
  const searchCoverage = pageCount > 0 ? (searchFeatures.basic / pageCount * 100).toFixed(1) : 0;
  const newsletterCoverage = pageCount > 0 ? (newsletterSignups.forms / pageCount * 100).toFixed(1) : 0;
  
  // Sort CTA details by priority
  ctaDetails.sort((a, b) => b.priority - a.priority);
  
  return `
    <div class="analysis-section">
      <h3>🎯 UX Elements Analysis</h3>
      
      <div class="ux-overview">
        <div class="overview-card ${ctaPerPage >= 3 ? 'good' : ctaPerPage >= 1 ? 'warning' : 'error'}">
          <h4>Call-to-Action Effectiveness</h4>
          <div class="score-large">${ctaPerPage}</div>
          <div class="score-description">Average CTAs per page</div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${totalCTAs}</div>
          <div class="stat-label">Total CTAs Found</div>
          <div class="stat-percentage">${ctaPerPage} per page</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${contactMethods.phone + contactMethods.email + contactMethods.form}</div>
          <div class="stat-label">Pages with Contact Info</div>
          <div class="stat-percentage ${contactCoverage >= 80 ? 'good' : contactCoverage >= 50 ? 'warning' : 'error'}">${contactCoverage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${searchFeatures.basic}</div>
          <div class="stat-label">Pages with Search</div>
          <div class="stat-percentage ${searchCoverage >= 70 ? 'good' : searchCoverage >= 30 ? 'warning' : 'error'}">${searchCoverage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${newsletterSignups.forms + newsletterSignups.elements}</div>
          <div class="stat-label">Newsletter Signups</div>
          <div class="stat-percentage ${newsletterCoverage >= 50 ? 'good' : newsletterCoverage >= 20 ? 'warning' : 'error'}">${newsletterCoverage}%</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${Object.values(contactMethods).reduce((sum, count) => sum + count, 0)}</div>
          <div class="stat-label">Contact Methods Available</div>
          <div class="stat-percentage">Phone: ${contactMethods.phone} | Email: ${contactMethods.email} | Forms: ${contactMethods.form}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-value">${searchFeatures.advanced + searchFeatures.filters + searchFeatures.suggestions}</div>
          <div class="stat-label">Advanced Search Features</div>
          <div class="stat-percentage">Filters: ${searchFeatures.filters} | Suggestions: ${searchFeatures.suggestions}</div>
        </div>
      </div>
      
      ${ctaDetails.length > 0 ? `
      <div class="ux-details cta-details">
        <h4>🎯 Top Call-to-Action Elements</h4>
        <div class="cta-list">
          ${ctaDetails.slice(0, 10).map(cta => `
            <div class="cta-item ${cta.priority >= 8 ? 'high-priority' : cta.priority >= 5 ? 'medium-priority' : 'low-priority'}">
              <div class="cta-header">
                <span class="cta-text">"${cta.text}"</span>
                <span class="priority-badge priority-${cta.priority >= 8 ? 'high' : cta.priority >= 5 ? 'medium' : 'low'}">
                  Priority: ${cta.priority}
                </span>
              </div>
              <div class="cta-meta">
                <span class="position-tag">${cta.position}</span>
                ${cta.isAboveFold ? '<span class="above-fold-tag">Above Fold</span>' : '<span class="below-fold-tag">Below Fold</span>'}
              </div>
              <div class="cta-url">${cta.url}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="ux-breakdown">
        <div class="breakdown-section">
          <h4>📞 Contact Information Breakdown</h4>
          <div class="contact-stats">
            <div class="contact-method">
              <span class="method-icon">📱</span>
              <span class="method-name">Phone Numbers</span>
              <span class="method-count">${contactMethods.phone} pages</span>
            </div>
            <div class="contact-method">
              <span class="method-icon">📧</span>
              <span class="method-name">Email Addresses</span>
              <span class="method-count">${contactMethods.email} pages</span>
            </div>
            <div class="contact-method">
              <span class="method-icon">📝</span>
              <span class="method-name">Contact Forms</span>
              <span class="method-count">${contactMethods.form} pages</span>
            </div>
            <div class="contact-method">
              <span class="method-icon">🌐</span>
              <span class="method-name">Social Media</span>
              <span class="method-count">${contactMethods.social} pages</span>
            </div>
            <div class="contact-method">
              <span class="method-icon">📍</span>
              <span class="method-name">Physical Address</span>
              <span class="method-count">${contactMethods.address} pages</span>
            </div>
            <div class="contact-method">
              <span class="method-icon">💬</span>
              <span class="method-name">Live Chat</span>
              <span class="method-count">${contactMethods.liveChat} pages</span>
            </div>
            <div class="contact-method">
              <span class="method-icon">🗺️</span>
              <span class="method-name">Maps</span>
              <span class="method-count">${contactMethods.map} pages</span>
            </div>
          </div>
        </div>
        
        <div class="breakdown-section">
          <h4>🔍 Search Functionality Breakdown</h4>
          <div class="search-stats">
            <div class="search-feature">
              <span class="feature-name">Basic Search</span>
              <span class="feature-count">${searchFeatures.basic} pages</span>
            </div>
            <div class="search-feature">
              <span class="feature-name">Advanced Search</span>
              <span class="feature-count">${searchFeatures.advanced} pages</span>
            </div>
            <div class="search-feature">
              <span class="feature-name">Search Filters</span>
              <span class="feature-count">${searchFeatures.filters} pages</span>
            </div>
            <div class="search-feature">
              <span class="feature-name">Search Suggestions</span>
              <span class="feature-count">${searchFeatures.suggestions} pages</span>
            </div>
          </div>
        </div>
        
        <div class="breakdown-section">
          <h4>📬 Newsletter Signup Breakdown</h4>
          <div class="newsletter-stats">
            <div class="newsletter-metric">
              <span class="metric-name">Signup Forms</span>
              <span class="metric-count">${newsletterSignups.forms} total</span>
            </div>
            <div class="newsletter-metric">
              <span class="metric-name">Signup Elements</span>
              <span class="metric-count">${newsletterSignups.elements} total</span>
            </div>
            <div class="newsletter-metric">
              <span class="metric-name">Incentives Offered</span>
              <span class="metric-count">${newsletterSignups.incentives} found</span>
            </div>
          </div>
        </div>
      </div>
      
      ${bestPractices.length > 0 ? `
      <div class="ux-issues best-practices">
        <h4>✅ UX Best Practices Found (${bestPractices.length})</h4>
        <div class="issues-list">
          ${bestPractices.slice(0, 8).map(practice => `<div class="issue-item best-practice">${practice}</div>`).join('')}
          ${bestPractices.length > 8 ? `<div class="issue-item">... and ${bestPractices.length - 8} more best practices</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${uxIssues.length > 0 ? `
      <div class="ux-issues ux-problems">
        <h4>⚠️ UX Issues Found (${uxIssues.length})</h4>
        <div class="issues-list">
          ${uxIssues.slice(0, 10).map(issue => `<div class="issue-item ux-issue">${issue}</div>`).join('')}
          ${uxIssues.length > 10 ? `<div class="issue-item">... and ${uxIssues.length - 10} more UX issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${(uxIssues.length === 0 && bestPractices.length > 0) ? 
        '<div class="success-message">🎉 Excellent UX implementation with no major issues found!</div>' : 
        uxIssues.length === 0 ? '<div class="success-message">✅ No major UX issues found!</div>' : ''}
    </div>
  `;
}

// Generate security analysis
function generateSecurityAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let httpsPages = 0;
  let pagesWithSecurityHeaders = 0;
  let securityIssues = [];
  let mixedContentIssues = [];
  let cookieIssues = [];
  
  let headerStats = {
    hsts: 0,
    csp: 0,
    xfo: 0,
    xss: 0,
    referrer: 0
  };
  
  let mixedContentStats = {
    none: 0,
    low: 0,
    medium: 0,
    high: 0
  };
  
  let cookieStats = {
    total: 0,
    secure: 0,
    httpOnly: 0,
    sameSite: 0,
    withPolicy: 0,
    withBanner: 0,
    withConsent: 0
  };
  
  for (const [url, data] of Object.entries(pageData)) {
    const security = data.security || {};
    
    // HTTPS Analysis
    if (security.isHTTPS) {
      httpsPages++;
    } else {
      securityIssues.push(`Non-HTTPS page: ${safeDecodeURIComponent(url)}`);
    }
    
    // Security Headers Analysis
    if (security.hasSecurityHeaders) {
      pagesWithSecurityHeaders++;
    } else {
      securityIssues.push(`Missing security headers: ${safeDecodeURIComponent(url)}`);
    }
    
    // Count individual security headers
    const headers = security.securityHeaders || {};
    if (headers.hsts) headerStats.hsts++;
    if (headers.csp) headerStats.csp++;
    if (headers.xfo) headerStats.xfo++;
    if (headers.xss) headerStats.xss++;
    if (headers.referrer) headerStats.referrer++;
    
    // Mixed Content Analysis
    const mixedContent = security.mixedContent || {};
    if (mixedContent.riskLevel) {
      mixedContentStats[mixedContent.riskLevel]++;
      
      if (mixedContent.hasMixedContent) {
        mixedContentIssues.push({
          url: safeDecodeURIComponent(url),
          riskLevel: mixedContent.riskLevel,
          totalIssues: mixedContent.totalIssues,
          summary: mixedContent.summary
        });
      }
    }
    
    // Cookie Compliance Analysis
    const cookies = security.cookies || {};
    if (cookies.hasCookies) {
      cookieStats.total++;
      if (cookies.secureFlags > 0) cookieStats.secure++;
      if (cookies.httpOnlyFlags > 0) cookieStats.httpOnly++;
      if (cookies.sameSiteFlags > 0) cookieStats.sameSite++;
      if (cookies.hasCookiePolicy) cookieStats.withPolicy++;
      if (cookies.hasCookieBanner) cookieStats.withBanner++;
      if (cookies.hasConsentMechanism) cookieStats.withConsent++;
      
      if (cookies.complianceScore < 70) {
        cookieIssues.push({
          url: safeDecodeURIComponent(url),
          score: cookies.complianceScore,
          cookieCount: cookies.cookieCount,
          issues: []
        });
        
        if (cookies.secureFlags < cookies.cookieCount) {
          cookieIssues[cookieIssues.length - 1].issues.push('Missing Secure flags');
        }
        if (cookies.httpOnlyFlags < cookies.cookieCount) {
          cookieIssues[cookieIssues.length - 1].issues.push('Missing HttpOnly flags');
        }
        if (!cookies.hasCookiePolicy) {
          cookieIssues[cookieIssues.length - 1].issues.push('No cookie policy');
        }
        if (!cookies.hasCookieBanner) {
          cookieIssues[cookieIssues.length - 1].issues.push('No cookie banner');
        }
      }
    }
  }
  
  const pageCount = Object.keys(pageData).length;
  const httpsPageCount = Object.values(pageData).filter(data => data.security?.isHTTPS).length;
  
  return `
    <div class="analysis-section">
      <h3>🔒 Security Analysis</h3>
      
      <!-- Core Security Stats -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${httpsPages}/${pageCount}</div>
          <div class="stat-label">HTTPS Pages</div>
          <div class="stat-percentage">${(httpsPages/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${pagesWithSecurityHeaders}/${pageCount}</div>
          <div class="stat-label">Pages with Security Headers</div>
          <div class="stat-percentage">${(pagesWithSecurityHeaders/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${headerStats.hsts}/${pageCount}</div>
          <div class="stat-label">HSTS Headers</div>
          <div class="stat-percentage">${(headerStats.hsts/pageCount*100).toFixed(1)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${headerStats.csp}/${pageCount}</div>
          <div class="stat-label">CSP Headers</div>
          <div class="stat-percentage">${(headerStats.csp/pageCount*100).toFixed(1)}%</div>
        </div>
      </div>
      
      <!-- Mixed Content Analysis -->
      <div class="mixed-content-analysis">
        <h4>🔀 Mixed Content Analysis</h4>
        <div class="stats-grid">
          <div class="stat-item ${mixedContentStats.none === httpsPageCount ? 'success' : ''}">
            <div class="stat-value">${mixedContentStats.none}</div>
            <div class="stat-label">Clean Pages</div>
            <div class="stat-percentage">${httpsPageCount > 0 ? (mixedContentStats.none/httpsPageCount*100).toFixed(1) : 0}%</div>
          </div>
          <div class="stat-item ${mixedContentStats.high > 0 ? 'danger' : ''}">
            <div class="stat-value">${mixedContentStats.high}</div>
            <div class="stat-label">High Risk</div>
            <div class="stat-note">Active mixed content</div>
          </div>
          <div class="stat-item ${mixedContentStats.medium > 0 ? 'warning' : ''}">
            <div class="stat-value">${mixedContentStats.medium}</div>
            <div class="stat-label">Medium Risk</div>
            <div class="stat-note">Passive mixed content</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${mixedContentStats.low}</div>
            <div class="stat-label">Low Risk</div>
            <div class="stat-note">HTTP links</div>
          </div>
        </div>
      </div>
      
      <!-- Cookie Compliance Analysis -->
      <div class="cookie-compliance-analysis">
        <h4>🍪 Cookie Policy Compliance</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${cookieStats.total}</div>
            <div class="stat-label">Pages with Cookies</div>
            <div class="stat-percentage">${(cookieStats.total/pageCount*100).toFixed(1)}%</div>
          </div>
          <div class="stat-item ${cookieStats.secure === cookieStats.total && cookieStats.total > 0 ? 'success' : cookieStats.total > 0 ? 'warning' : ''}">
            <div class="stat-value">${cookieStats.secure}/${cookieStats.total}</div>
            <div class="stat-label">Secure Cookies</div>
            <div class="stat-percentage">${cookieStats.total > 0 ? (cookieStats.secure/cookieStats.total*100).toFixed(1) : 0}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${cookieStats.withPolicy}</div>
            <div class="stat-label">Cookie Policies</div>
            <div class="stat-percentage">${(cookieStats.withPolicy/pageCount*100).toFixed(1)}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${cookieStats.withConsent}</div>
            <div class="stat-label">Consent Mechanisms</div>
            <div class="stat-percentage">${(cookieStats.withConsent/pageCount*100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
      
      <!-- Security Issues -->
      ${securityIssues.length > 0 ? `
      <div class="security-issues">
        <h4>⚠️ General Security Issues (${securityIssues.length} found)</h4>
        <div class="issues-list">
          ${securityIssues.slice(0, 10).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${securityIssues.length > 10 ? `<div class="issue-item">... and ${securityIssues.length - 10} more issues</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      <!-- Mixed Content Issues -->
      ${mixedContentIssues.length > 0 ? `
      <div class="mixed-content-issues">
        <h4>🔀 Mixed Content Issues (${mixedContentIssues.length} pages affected)</h4>
        <div class="issues-list">
          ${mixedContentIssues.slice(0, 10).map(issue => `
            <div class="issue-item ${issue.riskLevel}">
              <strong>${issue.url}</strong><br>
              <span class="risk-badge risk-${issue.riskLevel}">${issue.riskLevel.toUpperCase()} RISK</span>
              ${issue.summary}
            </div>
          `).join('')}
          ${mixedContentIssues.length > 10 ? `<div class="issue-item">... and ${mixedContentIssues.length - 10} more pages with mixed content</div>` : ''}
        </div>
      </div>
      ` : httpsPageCount > 0 ? '<div class="success-message">✅ No mixed content issues found!</div>' : ''}
      
      <!-- Cookie Compliance Issues -->
      ${cookieIssues.length > 0 ? `
      <div class="cookie-issues">
        <h4>🍪 Cookie Compliance Issues (${cookieIssues.length} pages)</h4>
        <div class="issues-list">
          ${cookieIssues.slice(0, 10).map(issue => `
            <div class="issue-item">
              <strong>${issue.url}</strong><br>
              <span class="compliance-score">Compliance Score: ${issue.score}/100</span><br>
              Issues: ${issue.issues.join(', ')}
            </div>
          `).join('')}
          ${cookieIssues.length > 10 ? `<div class="issue-item">... and ${cookieIssues.length - 10} more pages with cookie issues</div>` : ''}
        </div>
      </div>
      ` : cookieStats.total > 0 ? '<div class="success-message">✅ All cookies are compliant!</div>' : ''}
      
      ${securityIssues.length === 0 && mixedContentIssues.length === 0 && cookieIssues.length === 0 ? 
        '<div class="success-message">✅ No security issues found!</div>' : ''}
    </div>
  `;
}

// Generate page type analysis
function generatePageTypeAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';

  const pageTypeStats = {};
  const typeConfidenceStats = {};
  const typeIndicators = {};
  const pageTypeExamples = {};
  
  // Analyze page types
  for (const [url, data] of Object.entries(pageData)) {
    const pageType = data.pageType || {};
    const primaryType = pageType.primaryType || 'general';
    const confidence = pageType.confidence || 0;
    const indicators = pageType.indicators || {};
    
    // Count page types
    pageTypeStats[primaryType] = (pageTypeStats[primaryType] || 0) + 1;
    
    // Track confidence levels
    if (!typeConfidenceStats[primaryType]) {
      typeConfidenceStats[primaryType] = [];
    }
    typeConfidenceStats[primaryType].push(confidence);
    
    // Collect page type indicators
    Object.entries(indicators).forEach(([indicator, present]) => {
      if (present) {
        if (!typeIndicators[indicator]) typeIndicators[indicator] = {};
        typeIndicators[indicator][primaryType] = (typeIndicators[indicator][primaryType] || 0) + 1;
      }
    });
    
    // Store examples (limit to 3 per type)
    if (!pageTypeExamples[primaryType]) pageTypeExamples[primaryType] = [];
    if (pageTypeExamples[primaryType].length < 3) {
      pageTypeExamples[primaryType].push({
        url,
        confidence: Math.round(confidence * 100),
        indicators: Object.entries(indicators).filter(([, present]) => present).map(([indicator]) => indicator)
      });
    }
  }
  
  const totalPages = Object.keys(pageData).length;
  
  // Calculate average confidence for each type
  const avgConfidence = {};
  Object.entries(typeConfidenceStats).forEach(([type, confidences]) => {
    avgConfidence[type] = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  });
  
  // Sort page types by frequency
  const sortedTypes = Object.entries(pageTypeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  // Get top indicators
  const topIndicators = Object.entries(typeIndicators)
    .map(([indicator, types]) => ({
      indicator,
      total: Object.values(types).reduce((sum, count) => sum + count, 0),
      types
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return `
    <div class="analysis-section">
      <h3>📄 Page Type Classification</h3>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${Object.keys(pageTypeStats).length}</div>
          <div class="stat-label">Distinct Page Types</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${totalPages}</div>
          <div class="stat-label">Total Pages Analyzed</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${Math.round(Object.values(avgConfidence).reduce((sum, conf) => sum + conf, 0) / Object.keys(avgConfidence).length * 100) || 0}%</div>
          <div class="stat-label">Average Classification Confidence</div>
        </div>
      </div>
      
      <div class="sub-section">
        <h4>📊 Page Type Distribution</h4>
        <div class="type-distribution">
          ${sortedTypes.map(([type, count]) => {
            const percentage = ((count / totalPages) * 100).toFixed(1);
            const confidence = Math.round((avgConfidence[type] || 0) * 100);
            return `
              <div class="type-bar">
                <div class="type-info">
                  <span class="type-label">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  <span class="type-stats">${count} pages (${percentage}%)</span>
                  <span class="confidence-badge confidence-${confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low'}">${confidence}% confidence</span>
                </div>
                <div class="type-meter">
                  <div class="type-fill" style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      ${topIndicators.length > 0 ? `
        <div class="sub-section">
          <h4>🔍 Common Page Indicators</h4>
          <div class="indicators-grid">
            ${topIndicators.map(({ indicator, total, types }) => `
              <div class="indicator-card">
                <div class="indicator-name">${indicator.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                <div class="indicator-count">${total} pages</div>
                <div class="indicator-types">
                  ${Object.entries(types).slice(0, 3).map(([type, count]) => 
                    `<span class="type-tag">${type} (${count})</span>`
                  ).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="sub-section">
        <h4>📋 Page Type Examples</h4>
        <div class="type-examples">
          ${Object.entries(pageTypeExamples).slice(0, 6).map(([type, examples]) => `
            <div class="type-example-group">
              <h5>${type.charAt(0).toUpperCase() + type.slice(1)} Pages</h5>
              ${examples.map(({ url, confidence, indicators }) => `
                <div class="example-item">
                  <div class="example-url">
                    <a href="${url}" target="_blank">${safeDecodeURIComponent(url)}</a>
                    <span class="confidence-score">${confidence}%</span>
                  </div>
                  ${indicators.length > 0 ? `
                    <div class="example-indicators">
                      ${indicators.slice(0, 4).map(indicator => 
                        `<span class="indicator-chip">${indicator.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>`
                      ).join('')}
                      ${indicators.length > 4 ? `<span class="indicator-chip">+${indicators.length - 4} more</span>` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Generate link analysis summary
function generateLinkAnalysis(stats, externalLinks, badRequests, mailtoLinks, telLinks) {
  const internalLinksCount = Object.keys(stats).length;
  const externalLinksCount = Object.keys(externalLinks).length;
  const badRequestsCount = Object.keys(badRequests).length;
  const mailtoLinksCount = Object.keys(mailtoLinks).length;
  const telLinksCount = Object.keys(telLinks).length;
  
  // Analyze external link status
  let externalOK = 0, externalBroken = 0, externalTimeout = 0;
  let workingExternal = [], brokenExternal = [], timeoutExternal = [];
  
  for (const [url, data] of Object.entries(externalLinks)) {
    const status = data.status;
    if (typeof status === 'number' && status >= 200 && status < 300) {
      externalOK++;
      workingExternal.push({ url, status, sources: data.sources });
    } else if (status === 'TIMEOUT') {
      externalTimeout++;
      timeoutExternal.push({ url, status, sources: data.sources });
    } else {
      externalBroken++;
      brokenExternal.push({ url, status, sources: data.sources });
    }
  }
  
  // Generate internal links list
  const internalLinksList = Object.entries(stats).map(([url, data]) => `
    <div class="link-item">
      <div class="link-url">
        <a href="${url}" target="_blank">${safeDecodeURIComponent(url)}</a>
      </div>
      <div class="link-details">
        <span class="link-count">Found ${data.count} times</span>
        <div class="link-anchors">Anchors: ${Array.from(data.anchors).join(', ')}</div>
        <div class="link-sources">Sources: ${Array.from(data.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${data.sources.size > 3 ? ` (+${data.sources.size - 3} more)` : ''}</div>
      </div>
    </div>
  `).join('');

  // Generate broken internal links list
  const brokenInternalList = Object.entries(badRequests).map(([url, data]) => `
    <div class="link-item error">
      <div class="link-url">
        <span class="broken-url">${safeDecodeURIComponent(url)}</span>
        <span class="status-badge error">Status: ${data.status}</span>
      </div>
      <div class="link-sources">Found in: ${Array.from(data.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${data.sources.size > 3 ? ` (+${data.sources.size - 3} more)` : ''}</div>
    </div>
  `).join('');

  // Generate working external links list
  const workingExternalList = workingExternal.slice(0, 20).map(link => `
    <div class="link-item success">
      <div class="link-url">
        <a href="${link.url}" target="_blank">${safeDecodeURIComponent(link.url)}</a>
        <span class="status-badge success">Status: ${link.status}</span>
      </div>
      <div class="link-sources">Found in: ${Array.from(link.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${link.sources.size > 3 ? ` (+${link.sources.size - 3} more)` : ''}</div>
    </div>
  `).join('');

  // Generate broken external links list
  const brokenExternalList = brokenExternal.slice(0, 20).map(link => `
    <div class="link-item error">
      <div class="link-url">
        <span class="broken-url">${safeDecodeURIComponent(link.url)}</span>
        <span class="status-badge error">Status: ${link.status}</span>
      </div>
      <div class="link-sources">Found in: ${Array.from(link.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${link.sources.size > 3 ? ` (+${link.sources.size - 3} more)` : ''}</div>
    </div>
  `).join('');

  // Generate timeout external links list
  const timeoutExternalList = timeoutExternal.slice(0, 20).map(link => `
    <div class="link-item warning">
      <div class="link-url">
        <span class="timeout-url">${safeDecodeURIComponent(link.url)}</span>
        <span class="status-badge warning">Status: TIMEOUT</span>
      </div>
      <div class="link-sources">Found in: ${Array.from(link.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${link.sources.size > 3 ? ` (+${link.sources.size - 3} more)` : ''}</div>
    </div>
  `).join('');

  // Generate email links list
  const emailLinksList = Object.entries(mailtoLinks).map(([email, data]) => `
    <div class="link-item">
      <div class="link-url">
        <a href="${email}">${email.replace('mailto:', '')}</a>
      </div>
      <div class="link-sources">Found in: ${Array.from(data.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${data.sources.size > 3 ? ` (+${data.sources.size - 3} more)` : ''}</div>
    </div>
  `).join('');

  // Generate phone links list
  const phoneLinksList = Object.entries(telLinks).map(([phone, data]) => `
    <div class="link-item">
      <div class="link-url">
        <a href="${phone}">${phone.replace('tel:', '')}</a>
      </div>
      <div class="link-sources">Found in: ${Array.from(data.sources).slice(0, 3).map(src => safeDecodeURIComponent(src)).join(', ')}${data.sources.size > 3 ? ` (+${data.sources.size - 3} more)` : ''}</div>
    </div>
  `).join('');
  
  return `
    <div class="analysis-section">
      <h3>🔗 Link Analysis Summary</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${internalLinksCount}</div>
          <div class="stat-label">Internal Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${externalLinksCount}</div>
          <div class="stat-label">External Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${badRequestsCount}</div>
          <div class="stat-label">Broken Internal Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${externalOK}</div>
          <div class="stat-label">Working External Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${externalBroken}</div>
          <div class="stat-label">Broken External Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${externalTimeout}</div>
          <div class="stat-label">Timeout External Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${mailtoLinksCount}</div>
          <div class="stat-label">Email Links</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${telLinksCount}</div>
          <div class="stat-label">Phone Links</div>
        </div>
      </div>
      
      ${internalLinksCount > 0 ? `
      <div class="link-details-section">
        <h4>📄 Internal Links (${internalLinksCount})</h4>
        <div class="links-list">
          ${internalLinksList}
        </div>
      </div>
      ` : ''}
      
      ${badRequestsCount > 0 ? `
      <div class="link-details-section">
        <h4>❌ Broken Internal Links (${badRequestsCount})</h4>
        <div class="links-list">
          ${brokenInternalList}
        </div>
      </div>
      ` : ''}
      
      ${externalOK > 0 ? `
      <div class="link-details-section">
        <h4>✅ Working External Links (${externalOK})</h4>
        <div class="links-list">
          ${workingExternalList}
          ${workingExternal.length > 20 ? `<div class="show-more">... and ${workingExternal.length - 20} more working external links</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${externalBroken > 0 ? `
      <div class="link-details-section">
        <h4>💔 Broken External Links (${externalBroken})</h4>
        <div class="links-list">
          ${brokenExternalList}
          ${brokenExternal.length > 20 ? `<div class="show-more">... and ${brokenExternal.length - 20} more broken external links</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${externalTimeout > 0 ? `
      <div class="link-details-section">
        <h4>⏱️ Timeout External Links (${externalTimeout})</h4>
        <div class="links-list">
          ${timeoutExternalList}
          ${timeoutExternal.length > 20 ? `<div class="show-more">... and ${timeoutExternal.length - 20} more timeout external links</div>` : ''}
        </div>
      </div>
      ` : ''}
      
      ${mailtoLinksCount > 0 ? `
      <div class="link-details-section">
        <h4>📧 Email Links (${mailtoLinksCount})</h4>
        <div class="links-list">
          ${emailLinksList}
        </div>
      </div>
      ` : ''}
      
      ${telLinksCount > 0 ? `
      <div class="link-details-section">
        <h4>📞 Phone Links (${telLinksCount})</h4>
        <div class="links-list">
          ${phoneLinksList}
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

// Generate readability analysis
function generateReadabilityAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let totalFleschScore = 0;
  let totalGradeLevel = 0;
  let totalSentenceLength = 0;
  let totalSyllablesPerWord = 0;
  let totalComplexWordPercentage = 0;
  let pagesWithReadabilityData = 0;
  
  const readabilityLevels = {
    'Very Easy (5th grade)': 0,
    'Easy (6th grade)': 0,
    'Fairly Easy (7th grade)': 0,
    'Standard (8th-9th grade)': 0,
    'Fairly Difficult (10th-12th grade)': 0,
    'Difficult (College level)': 0,
    'Very Difficult (Graduate level)': 0
  };
  
  let readabilityIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const readability = data.content?.readability;
    
    if (readability && readability.wordCount > 0) {
      pagesWithReadabilityData++;
      totalFleschScore += readability.fleschReadingEase;
      totalGradeLevel += readability.fleschKincaidGradeLevel;
      totalSentenceLength += readability.averageSentenceLength;
      totalSyllablesPerWord += readability.averageSyllablesPerWord;
      totalComplexWordPercentage += readability.complexWordPercentage;
      
      // Track reading level distribution
      if (readabilityLevels.hasOwnProperty(readability.readingLevel)) {
        readabilityLevels[readability.readingLevel]++;
      }
      
      // Identify readability issues
      if (readability.fleschReadingEase < 30) {
        readabilityIssues.push(`Very difficult to read (${readability.fleschReadingEase} Flesch score): ${safeDecodeURIComponent(url)}`);
      } else if (readability.fleschKincaidGradeLevel > 16) {
        readabilityIssues.push(`Graduate-level reading required (Grade ${readability.fleschKincaidGradeLevel}): ${safeDecodeURIComponent(url)}`);
      } else if (readability.averageSentenceLength > 25) {
        readabilityIssues.push(`Very long sentences (${readability.averageSentenceLength} words avg): ${safeDecodeURIComponent(url)}`);
      } else if (readability.complexWordPercentage > 20) {
        readabilityIssues.push(`High complex word usage (${readability.complexWordPercentage}%): ${safeDecodeURIComponent(url)}`);
      }
    }
  }
  
  if (pagesWithReadabilityData === 0) {
    return `
      <div class="analysis-section">
        <h3>📖 Readability Analysis</h3>
        <div class="no-data-message">No readability data available</div>
      </div>
    `;
  }
  
  const avgFleschScore = (totalFleschScore / pagesWithReadabilityData).toFixed(1);
  const avgGradeLevel = (totalGradeLevel / pagesWithReadabilityData).toFixed(1);
  const avgSentenceLength = (totalSentenceLength / pagesWithReadabilityData).toFixed(1);
  const avgSyllablesPerWord = (totalSyllablesPerWord / pagesWithReadabilityData).toFixed(2);
  const avgComplexWordPercentage = (totalComplexWordPercentage / pagesWithReadabilityData).toFixed(1);
  
  // Determine overall reading level
  let overallReadingLevel;
  if (avgFleschScore >= 90) overallReadingLevel = 'Very Easy (5th grade)';
  else if (avgFleschScore >= 80) overallReadingLevel = 'Easy (6th grade)';
  else if (avgFleschScore >= 70) overallReadingLevel = 'Fairly Easy (7th grade)';
  else if (avgFleschScore >= 60) overallReadingLevel = 'Standard (8th-9th grade)';
  else if (avgFleschScore >= 50) overallReadingLevel = 'Fairly Difficult (10th-12th grade)';
  else if (avgFleschScore >= 30) overallReadingLevel = 'Difficult (College level)';
  else overallReadingLevel = 'Very Difficult (Graduate level)';
  
  return `
    <div class="analysis-section">
      <h3>📖 Readability Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${avgFleschScore}</div>
          <div class="stat-label">Average Flesch Reading Ease</div>
          <div class="stat-percentage">${overallReadingLevel}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgGradeLevel}</div>
          <div class="stat-label">Average Grade Level</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgSentenceLength}</div>
          <div class="stat-label">Average Sentence Length</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgSyllablesPerWord}</div>
          <div class="stat-label">Average Syllables per Word</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgComplexWordPercentage}%</div>
          <div class="stat-label">Complex Words</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${pagesWithReadabilityData}</div>
          <div class="stat-label">Pages Analyzed</div>
        </div>
      </div>
      
      <div class="readability-distribution">
        <h4>📊 Reading Level Distribution</h4>
        <div class="distribution-list">
          ${Object.entries(readabilityLevels).map(([level, count]) => {
            if (count === 0) return '';
            const percentage = ((count / pagesWithReadabilityData) * 100).toFixed(1);
            return `
              <div class="distribution-item">
                <span class="level-name">${level}</span>
                <span class="level-count">${count} pages (${percentage}%)</span>
              </div>
            `;
          }).filter(Boolean).join('')}
        </div>
      </div>
      
      ${readabilityIssues.length > 0 ? `
      <div class="readability-issues">
        <h4>⚠️ Readability Issues (${readabilityIssues.length} found)</h4>
        <div class="issues-list">
          ${readabilityIssues.slice(0, 15).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${readabilityIssues.length > 15 ? `<div class="issue-item">... and ${readabilityIssues.length - 15} more issues</div>` : ''}
        </div>
      </div>
      ` : '<div class="success-message">✅ No significant readability issues found!</div>'}
    </div>
  `;
}

// Generate page details table
function generatePageDetailsTable(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  const rows = Object.entries(pageData).map(([url, data]) => {
    const title = data.seo?.title?.text || 'No Title';
    const wordCount = data.content?.wordCount || 0;
    const responseTime = formatTime(data.responseTime || 0);
    const pageSize = formatBytes(data.pageSize || 0);
    const status = data.statusCode || 'Unknown';
    const isHTTPS = data.security?.isHTTPS ? '🔒' : '🔓';
    
    return `
      <tr>
        <td><a href="${url}" target="_blank">${safeDecodeURIComponent(url)}</a></td>
        <td>${title}</td>
        <td>${status}</td>
        <td>${responseTime}</td>
        <td>${pageSize}</td>
        <td>${wordCount}</td>
        <td>${isHTTPS}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div class="analysis-section">
      <h3>📋 Page Details</h3>
      <div class="table-container">
        <table class="page-details-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>Size</th>
              <th>Words</th>
              <th>HTTPS</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Generate HTTP status code distribution analysis
function generateStatusCodeAnalysis(pageData, externalLinks, badRequests) {
  const statusCodes = {};
  let totalPages = 0;
  
  // Analyze internal pages
  if (pageData) {
    for (const [url, data] of Object.entries(pageData)) {
      const status = data.statusCode || 'Unknown';
      statusCodes[status] = (statusCodes[status] || 0) + 1;
      totalPages++;
    }
  }
  
  // Analyze bad requests
  if (badRequests) {
    for (const [url, data] of Object.entries(badRequests)) {
      const status = data.status || 'Unknown';
      statusCodes[status] = (statusCodes[status] || 0) + 1;
      totalPages++;
    }
  }
  
  // Analyze external links
  if (externalLinks) {
    for (const [url, data] of Object.entries(externalLinks)) {
      const status = data.status || 'Unknown';
      statusCodes[status] = (statusCodes[status] || 0) + 1;
      totalPages++;
    }
  }
  
  if (totalPages === 0) {
    return `
      <div class="analysis-section">
        <h3>📊 HTTP Status Code Distribution</h3>
        <p class="no-data">No status code data available</p>
      </div>
    `;
  }
  
  // Categorize status codes
  const successCodes = Object.entries(statusCodes).filter(([code]) => code >= 200 && code < 300);
  const redirectCodes = Object.entries(statusCodes).filter(([code]) => code >= 300 && code < 400);
  const clientErrorCodes = Object.entries(statusCodes).filter(([code]) => code >= 400 && code < 500);
  const serverErrorCodes = Object.entries(statusCodes).filter(([code]) => code >= 500 && code < 600);
  const otherCodes = Object.entries(statusCodes).filter(([code]) => isNaN(code) || code < 200);
  
  const generateStatusCodeRows = (codes, category) => {
    return codes.map(([code, count]) => {
      const percentage = ((count / totalPages) * 100).toFixed(1);
      return `
        <tr>
          <td>${code}</td>
          <td>${count}</td>
          <td>${percentage}%</td>
          <td><span class="status-${category}">${category}</span></td>
        </tr>
      `;
    }).join('');
  };
  
  return `
    <div class="analysis-section">
      <h3>📊 HTTP Status Code Distribution</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Responses</div>
          <div class="metric-value">${totalPages}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Success (2xx)</div>
          <div class="metric-value">${successCodes.reduce((sum, [, count]) => sum + count, 0)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Redirects (3xx)</div>
          <div class="metric-value">${redirectCodes.reduce((sum, [, count]) => sum + count, 0)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Client Errors (4xx)</div>
          <div class="metric-value">${clientErrorCodes.reduce((sum, [, count]) => sum + count, 0)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Server Errors (5xx)</div>
          <div class="metric-value">${serverErrorCodes.reduce((sum, [, count]) => sum + count, 0)}</div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Status Code</th>
              <th>Count</th>
              <th>Percentage</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${generateStatusCodeRows(successCodes, 'success')}
            ${generateStatusCodeRows(redirectCodes, 'redirect')}
            ${generateStatusCodeRows(clientErrorCodes, 'client-error')}
            ${generateStatusCodeRows(serverErrorCodes, 'server-error')}
            ${generateStatusCodeRows(otherCodes, 'other')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Generate redirect chain analysis
function generateRedirectAnalysis(externalLinks) {
  if (!externalLinks) {
    return `
      <div class="analysis-section">
        <h3>🔄 Redirect Chain Analysis</h3>
        <p class="no-data">No external link data available</p>
      </div>
    `;
  }
  
  const redirectChains = [];
  const redirectLoops = [];
  let totalRedirects = 0;
  let maxRedirectLength = 0;
  
  for (const [url, data] of Object.entries(externalLinks)) {
    if (data.redirectChain && data.redirectChain.chain && data.redirectChain.chain.length > 1) {
      const chain = data.redirectChain;
      totalRedirects++;
      
      if (chain.redirectCount > maxRedirectLength) {
        maxRedirectLength = chain.redirectCount;
      }
      
      if (chain.hasLoop) {
        redirectLoops.push({
          url,
          chain: chain.chain,
          redirectCount: chain.redirectCount
        });
      } else {
        redirectChains.push({
          url,
          chain: chain.chain,
          redirectCount: chain.redirectCount,
          finalUrl: chain.finalUrl
        });
      }
    }
  }
  
  const generateChainRows = (chains) => {
    return chains.slice(0, 10).map(item => {
      const chainDisplay = item.chain.map((step, index) => 
        `${index + 1}. ${step.url} (${step.status})`
      ).join('<br>');
      
      return `
        <tr>
          <td>${safeDecodeURIComponent(item.url)}</td>
          <td>${item.redirectCount}</td>
          <td class="chain-detail">${chainDisplay}</td>
          <td>${item.finalUrl ? safeDecodeURIComponent(item.finalUrl) : 'Loop detected'}</td>
        </tr>
      `;
    }).join('');
  };
  
  return `
    <div class="analysis-section">
      <h3>🔄 Redirect Chain Analysis</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Redirects</div>
          <div class="metric-value">${totalRedirects}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Redirect Loops</div>
          <div class="metric-value ${redirectLoops.length > 0 ? 'warning' : ''}">${redirectLoops.length}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Max Chain Length</div>
          <div class="metric-value">${maxRedirectLength}</div>
        </div>
      </div>
      
      ${redirectLoops.length > 0 ? `
        <div class="issues-section">
          <h4>🔄 Redirect Loops Detected</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Redirects</th>
                  <th>Chain Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${generateChainRows(redirectLoops)}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${redirectChains.length > 0 ? `
        <div class="table-container">
          <h4>🔗 Redirect Chains (Top 10)</h4>
          <table>
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Redirects</th>
                <th>Chain Details</th>
                <th>Final URL</th>
              </tr>
            </thead>
            <tbody>
              ${generateChainRows(redirectChains)}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

// Generate mobile-friendliness analysis
function generateMobileFriendlinessAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) {
    return `
      <div class="analysis-section">
        <h3>📱 Mobile-Friendliness Analysis</h3>
        <p class="no-data">No page data available for mobile analysis</p>
      </div>
    `;
  }
  
  const mobileMetrics = {
    totalPages: 0,
    responsiveViewport: 0,
    hasTouchIcons: 0,
    hasMediaQueries: 0,
    hasFlexboxCSS: 0,
    hasResponsiveImages: 0,
    hasFlashContent: 0,
    hasFixedWidthTables: 0,
    hasSmallText: 0,
    averageMobileScore: 0,
    fontSizeIssues: 0,
    touchTargetIssues: 0
  };
  
  let totalMobileScore = 0;
  const mobileIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    if (data.mobileFriendliness) {
      const mobile = data.mobileFriendliness;
      mobileMetrics.totalPages++;
      
      if (mobile.viewport && mobile.viewport.isResponsive) mobileMetrics.responsiveViewport++;
      if (mobile.mobileFeatures && mobile.mobileFeatures.hasTouchIcons) mobileMetrics.hasTouchIcons++;
      if (mobile.responsive && mobile.responsive.hasMediaQueries) mobileMetrics.hasMediaQueries++;
      if (mobile.responsive && mobile.responsive.hasFlexbox) mobileMetrics.hasFlexboxCSS++;
      if (mobile.responsive && mobile.responsive.hasResponsiveImages) mobileMetrics.hasResponsiveImages++;
      
      // Check for mobile unfriendly features (if available)
      if (mobile.mobileUnfriendly) {
        if (mobile.mobileUnfriendly.hasFlashContent) {
          mobileMetrics.hasFlashContent++;
          mobileIssues.push({ url, issue: 'Flash content detected' });
        }
        if (mobile.mobileUnfriendly.hasFixedWidthTables) {
          mobileMetrics.hasFixedWidthTables++;
          mobileIssues.push({ url, issue: 'Fixed-width tables detected' });
        }
        if (mobile.mobileUnfriendly.hasSmallText) {
          mobileMetrics.hasSmallText++;
          mobileIssues.push({ url, issue: 'Small text detected' });
        }
      }
      
      // Check font size and touch target analysis (if available)
      if (mobile.fontSizeAnalysis && mobile.fontSizeAnalysis.smallTextPercentage > 30) {
        mobileMetrics.fontSizeIssues++;
        mobileIssues.push({ url, issue: `${mobile.fontSizeAnalysis.smallTextPercentage.toFixed(1)}% small text` });
      }
      
      if (mobile.touchTargetAnalysis && mobile.touchTargetAnalysis.smallTargetsPercentage > 30) {
        mobileMetrics.touchTargetIssues++;
        mobileIssues.push({ url, issue: `${mobile.touchTargetAnalysis.smallTargetsPercentage.toFixed(1)}% small touch targets` });
      }
      
      totalMobileScore += mobile.mobileScore || 0;
    }
  }
  
  mobileMetrics.averageMobileScore = mobileMetrics.totalPages > 0 ? 
    (totalMobileScore / mobileMetrics.totalPages).toFixed(1) : 0;
  
  const responsivePercentage = mobileMetrics.totalPages > 0 ? 
    ((mobileMetrics.responsiveViewport / mobileMetrics.totalPages) * 100).toFixed(1) : 0;
  
  const getScoreClass = (score) => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'error';
  };
  
  return `
    <div class="analysis-section">
      <h3>📱 Mobile-Friendliness Analysis</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Average Mobile Score</div>
          <div class="metric-value ${getScoreClass(mobileMetrics.averageMobileScore)}">${mobileMetrics.averageMobileScore}/100</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Responsive Viewport</div>
          <div class="metric-value">${mobileMetrics.responsiveViewport}/${mobileMetrics.totalPages} (${responsivePercentage}%)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Media Queries</div>
          <div class="metric-value">${mobileMetrics.hasMediaQueries}/${mobileMetrics.totalPages}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Touch Icons</div>
          <div class="metric-value">${mobileMetrics.hasTouchIcons}/${mobileMetrics.totalPages}</div>
        </div>
      </div>
      
      <div class="sub-metrics">
        <h4>Mobile Features</h4>
        <div class="metrics-row">
          <span>Responsive Images: ${mobileMetrics.hasResponsiveImages}/${mobileMetrics.totalPages}</span>
          <span>Flexbox CSS: ${mobileMetrics.hasFlexboxCSS}/${mobileMetrics.totalPages}</span>
        </div>
      </div>
      
      ${mobileIssues.length > 0 ? `
        <div class="issues-section">
          <h4>🚨 Mobile-Unfriendly Issues</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Issue</th>
                </tr>
              </thead>
              <tbody>
                ${mobileIssues.slice(0, 20).map(item => `
                  <tr>
                    <td><a href="${item.url}" target="_blank">${safeDecodeURIComponent(item.url)}</a></td>
                    <td>${item.issue}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Generate URL architecture analysis
function generateUrlArchitectureAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) {
    return `
      <div class="analysis-section">
        <h3>🏗️ URL Architecture Analysis</h3>
        <p class="no-data">No page data available for URL analysis</p>
      </div>
    `;
  }
  
  const urlMetrics = {
    totalPages: 0,
    averageDepth: 0,
    averageLength: 0,
    maxDepth: 0,
    maxLength: 0,
    minDepth: Infinity,
    minLength: Infinity,
    withParameters: 0,
    withSpecialChars: 0,
    withTrailingSlash: 0,
    complexityDistribution: { Simple: 0, Moderate: 0, Complex: 0, 'Very Complex': 0 },
    namingIssues: [],
    restfulPages: 0,
    redundancyIssues: []
  };
  
  let totalDepth = 0;
  let totalLength = 0;
  
  for (const [url, data] of Object.entries(pageData)) {
    urlMetrics.totalPages++;
    
    let urlDepth = 0;
    let urlLength = 0;
    
    if (data.architecture && data.architecture.url) {
      const arch = data.architecture.url;
      // Use architecture data if available
      urlDepth = isNaN(arch.depth) ? 0 : (arch.depth || 0);
      urlLength = isNaN(arch.length) ? 0 : (arch.length || 0);
    } else {
      // Fallback: calculate from URL directly
      try {
        const urlObj = new URL(url);
        urlLength = url.length;
        urlDepth = urlObj.pathname.split('/').filter(segment => segment.length > 0).length;
      } catch (e) {
        urlLength = url.length;
        urlDepth = (url.match(/\//g) || []).length - 2; // Subtract protocol slashes
        if (urlDepth < 0) urlDepth = 0;
      }
    }
    
    totalDepth += urlDepth;
    totalLength += urlLength;
    
    urlMetrics.maxDepth = Math.max(urlMetrics.maxDepth, urlDepth);
    urlMetrics.maxLength = Math.max(urlMetrics.maxLength, urlLength);
    urlMetrics.minDepth = Math.min(urlMetrics.minDepth, urlDepth);
    urlMetrics.minLength = Math.min(urlMetrics.minLength, urlLength);
    
    // Continue with other analysis only if architecture data exists
    if (data.architecture) {
      const arch = data.architecture;
      
      // Pattern analysis
      if (arch.hasParameters) urlMetrics.withParameters++;
      if (arch.hasSpecialCharacters) urlMetrics.withSpecialChars++;
      if (arch.hasTrailingSlash) urlMetrics.withTrailingSlash++;
      
      // Complexity distribution
      if (arch.urlComplexity && arch.urlComplexity.level) {
        urlMetrics.complexityDistribution[arch.urlComplexity.level]++;
      }
      
      // RESTful pattern analysis
      if (arch.urlPatterns && arch.urlPatterns.followsRestfulPattern && arch.urlPatterns.followsRestfulPattern.isRestful) {
        urlMetrics.restfulPages++;
      }
      
      // Naming consistency issues
      if (arch.urlPatterns && arch.urlPatterns.hasConsistentNaming && !arch.urlPatterns.hasConsistentNaming.isConsistent) {
        urlMetrics.namingIssues.push({
          url: url,
          issues: arch.urlPatterns.hasConsistentNaming.issues
        });
      }
      
      // Redundancy issues
      if (arch.urlPatterns && arch.urlPatterns.hasRedundantSegments && arch.urlPatterns.hasRedundantSegments.hasRedundancy) {
        urlMetrics.redundancyIssues.push({
          url: url,
          redundancies: arch.urlPatterns.hasRedundantSegments.redundantSegments
        });
      }
    }
  }
  
  urlMetrics.averageDepth = urlMetrics.totalPages > 0 ? (totalDepth / urlMetrics.totalPages).toFixed(1) : '0.0';
  urlMetrics.averageLength = urlMetrics.totalPages > 0 ? Math.round(totalLength / urlMetrics.totalPages) : 0;
  
  // Ensure no NaN values
  if (isNaN(urlMetrics.averageDepth)) urlMetrics.averageDepth = '0.0';
  if (isNaN(urlMetrics.averageLength)) urlMetrics.averageLength = 0;
  if (isNaN(urlMetrics.maxDepth)) urlMetrics.maxDepth = 0;
  if (isNaN(urlMetrics.maxLength)) urlMetrics.maxLength = 0;
  
  if (urlMetrics.minDepth === Infinity) urlMetrics.minDepth = 0;
  if (urlMetrics.minLength === Infinity) urlMetrics.minLength = 0;
  
  const getDepthClass = (depth) => {
    if (depth <= 3) return 'good';
    if (depth <= 5) return 'warning';
    return 'error';
  };
  
  const getLengthClass = (length) => {
    if (length <= 60) return 'good';
    if (length <= 100) return 'warning';
    return 'error';
  };
  
  return `
    <div class="analysis-section">
      <h3>🏗️ URL Architecture Analysis</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Average URL Depth</div>
          <div class="metric-value ${getDepthClass(parseFloat(urlMetrics.averageDepth))}">${urlMetrics.averageDepth} levels</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Average URL Length</div>
          <div class="metric-value ${getLengthClass(urlMetrics.averageLength)}">${urlMetrics.averageLength} chars</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Max Depth</div>
          <div class="metric-value ${getDepthClass(urlMetrics.maxDepth)}">${urlMetrics.maxDepth} levels</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">URLs with Parameters</div>
          <div class="metric-value">${urlMetrics.withParameters}/${urlMetrics.totalPages}</div>
        </div>
      </div>
      
      <div class="sub-metrics">
        <h4>URL Structure Patterns</h4>
        <div class="metrics-row">
          <span>RESTful URLs: ${urlMetrics.restfulPages}/${urlMetrics.totalPages} (${((urlMetrics.restfulPages/urlMetrics.totalPages)*100).toFixed(1)}%)</span>
          <span>Special Characters: ${urlMetrics.withSpecialChars}/${urlMetrics.totalPages}</span>
          <span>Trailing Slashes: ${urlMetrics.withTrailingSlash}/${urlMetrics.totalPages}</span>
        </div>
      </div>
      
      <div class="sub-metrics">
        <h4>URL Complexity Distribution</h4>
        <div class="complexity-chart">
          ${Object.entries(urlMetrics.complexityDistribution).map(([level, count]) => `
            <div class="complexity-bar">
              <span class="complexity-label">${level}</span>
              <div class="complexity-meter">
                <div class="complexity-fill complexity-${level.toLowerCase().replace(' ', '-')}" 
                     style="width: ${urlMetrics.totalPages > 0 ? (count / urlMetrics.totalPages * 100) : 0}%"></div>
              </div>
              <span class="complexity-count">${count}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${urlMetrics.namingIssues.length > 0 ? `
        <div class="issues-section">
          <h4>🚨 URL Naming Consistency Issues</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                ${urlMetrics.namingIssues.slice(0, 10).map(item => `
                  <tr>
                    <td><a href="${item.url}" target="_blank">${safeDecodeURIComponent(item.url)}</a></td>
                    <td>${item.issues.join(', ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${urlMetrics.redundancyIssues.length > 0 ? `
        <div class="issues-section">
          <h4>🔄 URL Redundancy Issues</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Redundant Segments</th>
                </tr>
              </thead>
              <tbody>
                ${urlMetrics.redundancyIssues.slice(0, 10).map(item => `
                  <tr>
                    <td><a href="${item.url}" target="_blank">${safeDecodeURIComponent(item.url)}</a></td>
                    <td>${item.redundancies.map(r => `${r.segment} (${r.description})`).join(', ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      <div class="sub-metrics">
        <h4>URL Length Distribution</h4>
        <div class="metrics-row">
          <span>Shortest: ${urlMetrics.minLength} chars</span>
          <span>Longest: ${urlMetrics.maxLength} chars</span>
          <span>Range: ${urlMetrics.maxLength - urlMetrics.minLength} chars</span>
        </div>
      </div>
    </div>
  `;
}

// Generate Core Web Vitals Analysis
function generateWebVitalsAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let vitalsStats = {
    excellent: 0,
    needsImprovement: 0,
    poor: 0,
    totalLCP: 0,
    totalFID: 0,
    totalCLS: 0,
    totalFCP: 0,
    totalTTFB: 0,
    count: 0
  };
  
  let vitalsIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const vitals = data.enhanced?.webVitals;
    if (!vitals) continue;
    
    vitalsStats.count++;
    vitalsStats.totalLCP += vitals.metrics.lcp || 0;
    vitalsStats.totalFID += vitals.metrics.fid || 0;
    vitalsStats.totalCLS += vitals.metrics.cls || 0;
    vitalsStats.totalFCP += vitals.metrics.fcp || 0;
    vitalsStats.totalTTFB += vitals.metrics.ttfb || 0;
    
    if (vitals.performance.overall === 'excellent') {
      vitalsStats.excellent++;
    } else if (vitals.performance.overall === 'needs-improvement') {
      vitalsStats.needsImprovement++;
    } else {
      vitalsStats.poor++;
      vitalsIssues.push(`Poor Web Vitals (${vitals.performance.overall}): ${safeDecodeURIComponent(url)}`);
    }
  }
  
  if (vitalsStats.count === 0) return '';
  
  const avgLCP = (vitalsStats.totalLCP / vitalsStats.count).toFixed(0);
  const avgFID = (vitalsStats.totalFID / vitalsStats.count).toFixed(0);
  const avgCLS = (vitalsStats.totalCLS / vitalsStats.count).toFixed(3);
  const avgFCP = (vitalsStats.totalFCP / vitalsStats.count).toFixed(0);
  const avgTTFB = (vitalsStats.totalTTFB / vitalsStats.count).toFixed(0);
  const excellentRate = ((vitalsStats.excellent / vitalsStats.count) * 100).toFixed(1);
  
  return `
    <div class="analysis-section">
      <h3>⚡ Core Web Vitals Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${excellentRate}%</div>
          <div class="stat-label">Excellent Performance</div>
          <div class="stat-percentage">${vitalsStats.excellent}/${vitalsStats.count} pages</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgLCP}ms</div>
          <div class="stat-label">Avg LCP (Largest Contentful Paint)</div>
          <div class="stat-percentage">${avgLCP < 2500 ? '✅ Good' : avgLCP < 4000 ? '⚠️ Needs Improvement' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgFID}ms</div>
          <div class="stat-label">Avg FID (First Input Delay)</div>
          <div class="stat-percentage">${avgFID < 100 ? '✅ Good' : avgFID < 300 ? '⚠️ Needs Improvement' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgCLS}</div>
          <div class="stat-label">Avg CLS (Cumulative Layout Shift)</div>
          <div class="stat-percentage">${avgCLS < 0.1 ? '✅ Good' : avgCLS < 0.25 ? '⚠️ Needs Improvement' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgFCP}ms</div>
          <div class="stat-label">Avg FCP (First Contentful Paint)</div>
          <div class="stat-percentage">${avgFCP < 1800 ? '✅ Good' : avgFCP < 3000 ? '⚠️ Needs Improvement' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgTTFB}ms</div>
          <div class="stat-label">Avg TTFB (Time to First Byte)</div>
          <div class="stat-percentage">${avgTTFB < 800 ? '✅ Good' : avgTTFB < 1800 ? '⚠️ Needs Improvement' : '❌ Poor'}</div>
        </div>
      </div>
      
      ${vitalsIssues.length > 0 ? `
      <div class="web-vitals-issues">
        <h4>⚠️ Web Vitals Issues (${vitalsIssues.length} found)</h4>
        <div class="issues-list">
          ${vitalsIssues.slice(0, 10).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${vitalsIssues.length > 10 ? `<div class="issue-item">... and ${vitalsIssues.length - 10} more issues</div>` : ''}
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

// Generate Advanced Accessibility Analysis
function generateAdvancedAccessibilityAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let accessibilityStats = {
    wcagCompliant: 0,
    colorContrastIssues: 0,
    missingAria: 0,
    keyboardInaccessible: 0,
    totalColorContrast: 0,
    totalAriaScore: 0,
    totalKeyboardScore: 0,
    count: 0
  };
  
  let accessibilityIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const accessibility = data.enhanced?.accessibility;
    if (!accessibility) continue;
    
    accessibilityStats.count++;
    
    if (accessibility.wcagCompliance.overall === 'AA') {
      accessibilityStats.wcagCompliant++;
    }
    
    if (accessibility.colorContrast.issues.length > 0) {
      accessibilityStats.colorContrastIssues++;
      accessibilityIssues.push(`Color contrast issues (${accessibility.colorContrast.issues.length}): ${safeDecodeURIComponent(url)}`);
    }
    
    if (accessibility.ariaAttributes.score < 80) {
      accessibilityStats.missingAria++;
      accessibilityIssues.push(`Missing ARIA attributes (${accessibility.ariaAttributes.score}%): ${safeDecodeURIComponent(url)}`);
    }
    
    if (accessibility.keyboardNavigation.score < 80) {
      accessibilityStats.keyboardInaccessible++;
      accessibilityIssues.push(`Poor keyboard navigation (${accessibility.keyboardNavigation.score}%): ${safeDecodeURIComponent(url)}`);
    }
    
    accessibilityStats.totalColorContrast += accessibility.colorContrast.score || 0;
    accessibilityStats.totalAriaScore += accessibility.ariaAttributes.score || 0;
    accessibilityStats.totalKeyboardScore += accessibility.keyboardNavigation.score || 0;
  }
  
  if (accessibilityStats.count === 0) return '';
  
  const wcagComplianceRate = ((accessibilityStats.wcagCompliant / accessibilityStats.count) * 100).toFixed(1);
  const avgColorContrast = (accessibilityStats.totalColorContrast / accessibilityStats.count).toFixed(1);
  const avgAriaScore = (accessibilityStats.totalAriaScore / accessibilityStats.count).toFixed(1);
  const avgKeyboardScore = (accessibilityStats.totalKeyboardScore / accessibilityStats.count).toFixed(1);
  
  return `
    <div class="analysis-section">
      <h3>♿ Advanced Accessibility Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${wcagComplianceRate}%</div>
          <div class="stat-label">WCAG 2.1 AA Compliance</div>
          <div class="stat-percentage">${accessibilityStats.wcagCompliant}/${accessibilityStats.count} pages</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgColorContrast}%</div>
          <div class="stat-label">Color Contrast Score</div>
          <div class="stat-percentage">${avgColorContrast >= 90 ? '✅ Excellent' : avgColorContrast >= 70 ? '⚠️ Good' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgAriaScore}%</div>
          <div class="stat-label">ARIA Attributes Score</div>
          <div class="stat-percentage">${avgAriaScore >= 90 ? '✅ Excellent' : avgAriaScore >= 70 ? '⚠️ Good' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgKeyboardScore}%</div>
          <div class="stat-label">Keyboard Navigation Score</div>
          <div class="stat-percentage">${avgKeyboardScore >= 90 ? '✅ Excellent' : avgKeyboardScore >= 70 ? '⚠️ Good' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${accessibilityStats.colorContrastIssues}</div>
          <div class="stat-label">Color Contrast Issues</div>
          <div class="stat-percentage">${((accessibilityStats.colorContrastIssues / accessibilityStats.count) * 100).toFixed(1)}% of pages</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${accessibilityStats.missingAria}</div>
          <div class="stat-label">Missing ARIA Issues</div>
          <div class="stat-percentage">${((accessibilityStats.missingAria / accessibilityStats.count) * 100).toFixed(1)}% of pages</div>
        </div>
      </div>
      
      ${accessibilityIssues.length > 0 ? `
      <div class="accessibility-issues">
        <h4>⚠️ Accessibility Issues (${accessibilityIssues.length} found)</h4>
        <div class="issues-list">
          ${accessibilityIssues.slice(0, 10).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${accessibilityIssues.length > 10 ? `<div class="issue-item">... and ${accessibilityIssues.length - 10} more issues</div>` : ''}
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

// Generate Content Quality Analysis
function generateContentQualityAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let contentStats = {
    excellentReadability: 0,
    highKeywordDensity: 0,
    goodContentRatio: 0,
    totalReadability: 0,
    totalKeywordDensity: 0,
    totalContentRatio: 0,
    totalUniqueness: 0,
    count: 0
  };
  
  let contentIssues = [];
  
  for (const [url, data] of Object.entries(pageData)) {
    const content = data.enhanced?.contentQuality;
    if (!content) continue;
    
    contentStats.count++;
    
    const readabilityScore = content.readability?.fleschScore || 0;
    const keywordDensity = content.keywordAnalysis?.topKeywords?.[0]?.density || 0;
    const contentRatio = content.contentStructure?.contentToCodeRatio || 0;
    const uniqueness = content.uniqueness?.score || 0;
    
    contentStats.totalReadability += readabilityScore;
    contentStats.totalKeywordDensity += keywordDensity;
    contentStats.totalContentRatio += contentRatio;
    contentStats.totalUniqueness += uniqueness;
    
    if (readabilityScore >= 60) {
      contentStats.excellentReadability++;
    } else {
      contentIssues.push(`Poor readability (${readabilityScore.toFixed(1)}): ${safeDecodeURIComponent(url)}`);
    }
    
    if (keywordDensity > 5) {
      contentStats.highKeywordDensity++;
      contentIssues.push(`High keyword density (${keywordDensity.toFixed(1)}%): ${safeDecodeURIComponent(url)}`);
    }
    
    if (contentRatio >= 0.2) {
      contentStats.goodContentRatio++;
    } else {
      contentIssues.push(`Low content ratio (${(contentRatio * 100).toFixed(1)}%): ${safeDecodeURIComponent(url)}`);
    }
  }
  
  if (contentStats.count === 0) return '';
  
  const avgReadability = (contentStats.totalReadability / contentStats.count).toFixed(1);
  const avgKeywordDensity = (contentStats.totalKeywordDensity / contentStats.count).toFixed(1);
  const avgContentRatio = ((contentStats.totalContentRatio / contentStats.count) * 100).toFixed(1);
  const avgUniqueness = (contentStats.totalUniqueness / contentStats.count).toFixed(1);
  const readabilityRate = ((contentStats.excellentReadability / contentStats.count) * 100).toFixed(1);
  const contentRatioRate = ((contentStats.goodContentRatio / contentStats.count) * 100).toFixed(1);
  
  return `
    <div class="analysis-section">
      <h3>📝 Content Quality Analysis</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${avgReadability}</div>
          <div class="stat-label">Avg Flesch Reading Ease</div>
          <div class="stat-percentage">${avgReadability >= 60 ? '✅ Easy to read' : avgReadability >= 30 ? '⚠️ Fairly difficult' : '❌ Very difficult'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${readabilityRate}%</div>
          <div class="stat-label">Pages with Good Readability</div>
          <div class="stat-percentage">${contentStats.excellentReadability}/${contentStats.count} pages</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgKeywordDensity}%</div>
          <div class="stat-label">Avg Keyword Density</div>
          <div class="stat-percentage">${avgKeywordDensity <= 3 ? '✅ Optimal' : avgKeywordDensity <= 5 ? '⚠️ High' : '❌ Too high'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgContentRatio}%</div>
          <div class="stat-label">Avg Content-to-Code Ratio</div>
          <div class="stat-percentage">${avgContentRatio >= 20 ? '✅ Good' : avgContentRatio >= 10 ? '⚠️ Fair' : '❌ Poor'}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${contentRatioRate}%</div>
          <div class="stat-label">Pages with Good Content Ratio</div>
          <div class="stat-percentage">${contentStats.goodContentRatio}/${contentStats.count} pages</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${avgUniqueness}%</div>
          <div class="stat-label">Avg Content Uniqueness</div>
          <div class="stat-percentage">${avgUniqueness >= 80 ? '✅ Unique' : avgUniqueness >= 60 ? '⚠️ Mostly unique' : '❌ Low uniqueness'}</div>
        </div>
      </div>
      
      ${contentIssues.length > 0 ? `
      <div class="content-issues">
        <h4>⚠️ Content Quality Issues (${contentIssues.length} found)</h4>
        <div class="issues-list">
          ${contentIssues.slice(0, 10).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${contentIssues.length > 10 ? `<div class="issue-item">... and ${contentIssues.length - 10} more issues</div>` : ''}
        </div>
      </div>
      ` : ''}
    </div>
  `;
}

// Generate SSL Certificate Analysis
function generateSSLCertificateAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) {
    return `
      <div class="analysis-section">
        <h3>🔒 SSL Certificate Analysis</h3>
        <p class="no-data">No page data available for SSL certificate analysis</p>
      </div>
    `;
  }
  
  const sslMetrics = {
    totalPages: 0,
    httpsPages: 0,
    validCertificates: 0,
    expiredCertificates: 0,
    selfSignedCertificates: 0,
    weakEncryption: 0,
    certificateIssues: [],
    certificateDetails: [],
    securityProtocols: {},
    cipherSuites: {},
    certificateAuthorities: {}
  };
  
  for (const [url, data] of Object.entries(pageData)) {
    sslMetrics.totalPages++;
    
    // Check if HTTPS is enabled
    if (data.security && data.security.https && data.security.https.enabled) {
      sslMetrics.httpsPages++;
    }
    
    // Check for SSL certificate data in enhanced section
    if (data.enhanced && data.enhanced.sslCertificate) {
      const ssl = data.enhanced.sslCertificate;
      
      if (ssl.enabled && ssl.status === 'available') {
        // SSL certificate analysis is available but needs to be extracted
        // For now, we'll use available security data
        if (data.security && data.security.transport) {
          const transport = data.security.transport;
          
          if (transport.isHTTPS) {
            sslMetrics.validCertificates++;
            
            // Extract certificate details if available
            sslMetrics.certificateDetails.push({
              url: url,
              https: transport.isHTTPS,
              hsts: transport.hasHSTS,
              hstsMaxAge: transport.hstsMaxAge || 0,
              hstsIncludeSubdomains: transport.hstsIncludeSubdomains || false,
              hstsPreload: transport.hstsPreload || false
            });
          }
        }
      }
    } else if (data.security && data.security.transport) {
      // Fallback to basic security transport data
      const transport = data.security.transport;
      
      if (transport.isHTTPS) {
        sslMetrics.validCertificates++;
        
        sslMetrics.certificateDetails.push({
          url: url,
          https: transport.isHTTPS,
          hsts: transport.hasHSTS,
          hstsMaxAge: transport.hstsMaxAge || 0,
          hstsIncludeSubdomains: transport.hstsIncludeSubdomains || false,
          hstsPreload: transport.hstsPreload || false
        });
      }
    }
    
    // Check for SSL/TLS related security headers
    if (data.security && data.security.headers) {
      const headers = data.security.headers;
      
      if (!headers.hasHSTS && sslMetrics.httpsPages > 0) {
        sslMetrics.certificateIssues.push({
          url: url,
          issue: 'Missing HSTS header',
          severity: 'medium',
          description: 'HTTPS enabled but no HTTP Strict Transport Security header found'
        });
      }
    }
  }
  
  const httpsPercentage = sslMetrics.totalPages > 0 ? 
    ((sslMetrics.httpsPages / sslMetrics.totalPages) * 100).toFixed(1) : 0;
  
  const validCertPercentage = sslMetrics.httpsPages > 0 ? 
    ((sslMetrics.validCertificates / sslMetrics.httpsPages) * 100).toFixed(1) : 0;
  
  const hstsEnabledPages = sslMetrics.certificateDetails.filter(cert => cert.hsts).length;
  const hstsPercentage = sslMetrics.httpsPages > 0 ? 
    ((hstsEnabledPages / sslMetrics.httpsPages) * 100).toFixed(1) : 0;
  
  const getSecurityClass = (percentage) => {
    if (percentage >= 90) return 'good';
    if (percentage >= 70) return 'warning';
    return 'error';
  };
  
  return `
    <div class="analysis-section">
      <h3>🔒 SSL Certificate Analysis</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">HTTPS Enabled</div>
          <div class="metric-value ${getSecurityClass(httpsPercentage)}">${sslMetrics.httpsPages}/${sslMetrics.totalPages} (${httpsPercentage}%)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Valid Certificates</div>
          <div class="metric-value ${getSecurityClass(validCertPercentage)}">${sslMetrics.validCertificates}/${sslMetrics.httpsPages} (${validCertPercentage}%)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">HSTS Enabled</div>
          <div class="metric-value ${getSecurityClass(hstsPercentage)}">${hstsEnabledPages}/${sslMetrics.httpsPages} (${hstsPercentage}%)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Certificate Issues</div>
          <div class="metric-value ${sslMetrics.certificateIssues.length > 0 ? 'warning' : 'good'}">${sslMetrics.certificateIssues.length}</div>
        </div>
      </div>
      
      ${sslMetrics.certificateDetails.length > 0 ? `
        <div class="sub-section">
          <h4>📋 Certificate Details</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>HTTPS</th>
                  <th>HSTS</th>
                  <th>HSTS Max Age</th>
                  <th>Include Subdomains</th>
                  <th>Preload</th>
                </tr>
              </thead>
              <tbody>
                ${sslMetrics.certificateDetails.map(cert => `
                  <tr>
                    <td><a href="${cert.url}" target="_blank">${safeDecodeURIComponent(cert.url)}</a></td>
                    <td><span class="status-badge ${cert.https ? 'success' : 'error'}">${cert.https ? '✅ Yes' : '❌ No'}</span></td>
                    <td><span class="status-badge ${cert.hsts ? 'success' : 'warning'}">${cert.hsts ? '✅ Yes' : '⚠️ No'}</span></td>
                    <td>${cert.hstsMaxAge > 0 ? formatTime(cert.hstsMaxAge * 1000) : 'N/A'}</td>
                    <td><span class="status-badge ${cert.hstsIncludeSubdomains ? 'success' : 'warning'}">${cert.hstsIncludeSubdomains ? '✅ Yes' : '⚠️ No'}</span></td>
                    <td><span class="status-badge ${cert.hstsPreload ? 'success' : 'info'}">${cert.hstsPreload ? '✅ Yes' : '➖ No'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${sslMetrics.certificateIssues.length > 0 ? `
        <div class="issues-section">
          <h4>⚠️ SSL Certificate Issues (${sslMetrics.certificateIssues.length} found)</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${sslMetrics.certificateIssues.slice(0, 10).map(issue => `
                  <tr>
                    <td><a href="${issue.url}" target="_blank">${safeDecodeURIComponent(issue.url)}</a></td>
                    <td>${issue.issue}</td>
                    <td><span class="severity-badge severity-${issue.severity}">${issue.severity.toUpperCase()}</span></td>
                    <td>${issue.description}</td>
                  </tr>
                `).join('')}
                ${sslMetrics.certificateIssues.length > 10 ? `
                  <tr><td colspan="4">... and ${sslMetrics.certificateIssues.length - 10} more issues</td></tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      ` : sslMetrics.httpsPages > 0 ? '<div class="success-message">✅ No SSL certificate issues found!</div>' : ''}
      
      ${sslMetrics.httpsPages === 0 ? `
        <div class="warning-message">
          ⚠️ No HTTPS pages detected. Consider implementing SSL/TLS encryption for better security.
        </div>
      ` : ''}
      
      ${sslMetrics.httpsPages > 0 && hstsEnabledPages === 0 ? `
        <div class="warning-message">
          ⚠️ HTTPS is enabled but HSTS (HTTP Strict Transport Security) is not configured. Consider adding HSTS headers for enhanced security.
        </div>
      ` : ''}
    </div>
  `;
}

// Generate Third-Party Services Analysis
function generateThirdPartyAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) {
    return `
      <div class="analysis-section">
        <h3>🌐 Third-Party Services Analysis</h3>
        <p class="no-data">No page data available for third-party analysis</p>
      </div>
    `;
  }
  
  const thirdPartyMetrics = {
    totalPages: 0,
    pagesWithThirdParties: 0,
    totalServices: 0,
    servicesByType: {},
    servicesByCategory: {},
    totalRequests: 0,
    totalSize: 0,
    privacyRisks: [],
    performanceImpacts: [],
    securityConcerns: [],
    trackingServices: [],
    advertisingServices: [],
    cdnServices: [],
    analyticsServices: []
  };
  
  for (const [url, data] of Object.entries(pageData)) {
    thirdPartyMetrics.totalPages++;
    
    if (data.enhanced && data.enhanced.thirdPartyAnalysis) {
      const thirdParty = data.enhanced.thirdPartyAnalysis;
      thirdPartyMetrics.pagesWithThirdParties++;
      
      // Service counts
      if (thirdParty.summary) {
        thirdPartyMetrics.totalServices += thirdParty.summary.totalServices || 0;
        thirdPartyMetrics.totalRequests += thirdParty.summary.totalRequests || 0;
        thirdPartyMetrics.totalSize += thirdParty.summary.totalSize || 0;
        
        // Service types
        if (thirdParty.summary.servicesByType) {
          Object.entries(thirdParty.summary.servicesByType).forEach(([type, count]) => {
            thirdPartyMetrics.servicesByType[type] = (thirdPartyMetrics.servicesByType[type] || 0) + count;
          });
        }
        
        // Service categories
        if (thirdParty.summary.servicesByCategory) {
          Object.entries(thirdParty.summary.servicesByCategory).forEach(([category, count]) => {
            thirdPartyMetrics.servicesByCategory[category] = (thirdPartyMetrics.servicesByCategory[category] || 0) + count;
          });
        }
      }
      
      // Privacy analysis
      if (thirdParty.privacyImplications) {
        const privacy = thirdParty.privacyImplications;
        if (privacy.riskLevel && privacy.riskLevel !== 'low') {
          thirdPartyMetrics.privacyRisks.push({
            url: url,
            riskLevel: privacy.riskLevel,
            trackingServices: privacy.trackingServices || 0,
            dataCollection: privacy.dataCollection || [],
            compliance: privacy.compliance || {}
          });
        }
      }
      
      // Performance analysis
      if (thirdParty.performanceImpact) {
        const performance = thirdParty.performanceImpact;
        if (performance.impactScore > 50) {
          thirdPartyMetrics.performanceImpacts.push({
            url: url,
            impactScore: performance.impactScore,
            totalScripts: performance.totalThirdPartyScripts || 0,
            loadTime: performance.estimatedLoadTime || 0,
            blockingScripts: performance.blockingScripts || 0
          });
        }
      }
      
      // Tracking services
      if (thirdParty.tracking) {
        const tracking = thirdParty.tracking;
        ['analytics', 'advertising', 'social'].forEach(type => {
          if (tracking[type] && tracking[type].length > 0) {
            tracking[type].forEach(service => {
              if (type === 'analytics') thirdPartyMetrics.analyticsServices.push({ url, service, type });
              if (type === 'advertising') thirdPartyMetrics.advertisingServices.push({ url, service, type });
            });
          }
        });
      }
    }
    
    // CDN Analysis
    if (data.enhanced && data.enhanced.cdnAnalysis) {
      const cdn = data.enhanced.cdnAnalysis;
      if (cdn.detectedServices) {
        cdn.detectedServices.forEach(service => {
          thirdPartyMetrics.cdnServices.push({
            url: url,
            name: service.name,
            type: service.type,
            category: service.category,
            resourceCount: service.resourceCount || 0,
            totalSize: service.totalSize || 0
          });
        });
      }
    }
  }
  
  const thirdPartyPercentage = thirdPartyMetrics.totalPages > 0 ? 
    ((thirdPartyMetrics.pagesWithThirdParties / thirdPartyMetrics.totalPages) * 100).toFixed(1) : 0;
  
  const avgServicesPerPage = thirdPartyMetrics.pagesWithThirdParties > 0 ? 
    (thirdPartyMetrics.totalServices / thirdPartyMetrics.pagesWithThirdParties).toFixed(1) : 0;
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return `
    <div class="analysis-section">
      <h3>🌐 Third-Party Services Analysis</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Pages with Third-Parties</div>
          <div class="metric-value">${thirdPartyMetrics.pagesWithThirdParties}/${thirdPartyMetrics.totalPages} (${thirdPartyPercentage}%)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Services</div>
          <div class="metric-value">${thirdPartyMetrics.totalServices}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Avg Services per Page</div>
          <div class="metric-value">${avgServicesPerPage}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Data Size</div>
          <div class="metric-value">${formatBytes(thirdPartyMetrics.totalSize)}</div>
        </div>
      </div>
      
      ${Object.keys(thirdPartyMetrics.servicesByType).length > 0 ? `
        <div class="sub-section">
          <h4>📊 Service Types Distribution</h4>
          <div class="service-types">
            ${Object.entries(thirdPartyMetrics.servicesByType).map(([type, count]) => `
              <div class="service-type-item">
                <span class="service-type-name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <span class="service-type-count">${count} services</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${Object.keys(thirdPartyMetrics.servicesByCategory).length > 0 ? `
        <div class="sub-section">
          <h4>🏷️ Service Categories</h4>
          <div class="service-categories">
            ${Object.entries(thirdPartyMetrics.servicesByCategory).map(([category, count]) => `
              <div class="service-category-item">
                <span class="service-category-name">${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span class="service-category-count">${count} services</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${thirdPartyMetrics.cdnServices.length > 0 ? `
        <div class="sub-section">
          <h4>🚀 CDN Services</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Resources</th>
                  <th>Size</th>
                  <th>Used On</th>
                </tr>
              </thead>
              <tbody>
                ${thirdPartyMetrics.cdnServices.slice(0, 10).map(service => `
                  <tr>
                    <td><strong>${service.name}</strong></td>
                    <td><span class="service-badge service-${service.type}">${service.type.toUpperCase()}</span></td>
                    <td>${service.resourceCount}</td>
                    <td>${formatBytes(service.totalSize)}</td>
                    <td><a href="${service.url}" target="_blank">${safeDecodeURIComponent(service.url)}</a></td>
                  </tr>
                `).join('')}
                ${thirdPartyMetrics.cdnServices.length > 10 ? `
                  <tr><td colspan="5">... and ${thirdPartyMetrics.cdnServices.length - 10} more CDN services</td></tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${thirdPartyMetrics.advertisingServices.length > 0 ? `
        <div class="sub-section">
          <h4>📢 Advertising Services</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Used On</th>
                </tr>
              </thead>
              <tbody>
                ${thirdPartyMetrics.advertisingServices.slice(0, 5).map(item => `
                  <tr>
                    <td><strong>${item.service.name || 'Unknown'}</strong></td>
                    <td><span class="service-badge service-advertising">${item.type.toUpperCase()}</span></td>
                    <td><a href="${item.url}" target="_blank">${safeDecodeURIComponent(item.url)}</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${thirdPartyMetrics.privacyRisks.length > 0 ? `
        <div class="issues-section">
          <h4>🔒 Privacy Concerns (${thirdPartyMetrics.privacyRisks.length} pages)</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Risk Level</th>
                  <th>Tracking Services</th>
                  <th>Data Collection</th>
                </tr>
              </thead>
              <tbody>
                ${thirdPartyMetrics.privacyRisks.slice(0, 5).map(risk => `
                  <tr>
                    <td><a href="${risk.url}" target="_blank">${safeDecodeURIComponent(risk.url)}</a></td>
                    <td><span class="risk-badge risk-${risk.riskLevel}">${risk.riskLevel.toUpperCase()}</span></td>
                    <td>${risk.trackingServices}</td>
                    <td>${risk.dataCollection.length} types</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${thirdPartyMetrics.performanceImpacts.length > 0 ? `
        <div class="issues-section">
          <h4>⚡ Performance Impact (${thirdPartyMetrics.performanceImpacts.length} pages)</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Impact Score</th>
                  <th>Scripts</th>
                  <th>Blocking</th>
                  <th>Est. Load Time</th>
                </tr>
              </thead>
              <tbody>
                ${thirdPartyMetrics.performanceImpacts.slice(0, 5).map(impact => `
                  <tr>
                    <td><a href="${impact.url}" target="_blank">${safeDecodeURIComponent(impact.url)}</a></td>
                    <td><span class="impact-score impact-${impact.impactScore > 75 ? 'high' : impact.impactScore > 50 ? 'medium' : 'low'}">${impact.impactScore}/100</span></td>
                    <td>${impact.totalScripts}</td>
                    <td>${impact.blockingScripts}</td>
                    <td>${impact.loadTime}ms</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${thirdPartyMetrics.totalServices === 0 ? 
        '<div class="success-message">✅ No third-party services detected - excellent for privacy and performance!</div>' : 
        thirdPartyMetrics.privacyRisks.length === 0 && thirdPartyMetrics.performanceImpacts.length === 0 ? 
        '<div class="success-message">✅ Third-party services are well-optimized with minimal privacy and performance impact!</div>' : ''}
    </div>
  `;
}

// Generate Content Intelligence Analysis
function generateContentIntelligenceAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) {
    return `
      <div class="analysis-section">
        <h3>🧠 Content Intelligence Analysis</h3>
        <p class="no-data">No page data available for content intelligence analysis</p>
      </div>
    `;
  }
  
  const intelligenceMetrics = {
    totalPages: 0,
    pagesAnalyzed: 0,
    averageUniqueness: 0,
    averageOriginality: 0,
    totalContentLength: 0,
    uniquenessDistribution: { 'Very Low': 0, 'Low': 0, 'Medium': 0, 'High': 0, 'Very High': 0 },
    duplicateContent: [],
    plagiarismRisks: [],
    contentFingerprints: [],
    similarityIssues: [],
    qualityIssues: []
  };
  
  for (const [url, data] of Object.entries(pageData)) {
    intelligenceMetrics.totalPages++;
    
    if (data.enhanced && data.enhanced.contentIntelligence) {
      const intelligence = data.enhanced.contentIntelligence;
      intelligenceMetrics.pagesAnalyzed++;
      
      // Uniqueness analysis
      if (intelligence.uniquenessAnalysis) {
        const uniqueness = intelligence.uniquenessAnalysis;
        intelligenceMetrics.averageUniqueness += uniqueness.overallUniquenessScore || 0;
        
        // Categorize uniqueness
        const score = uniqueness.overallUniquenessScore || 0;
        if (score >= 80) intelligenceMetrics.uniquenessDistribution['Very High']++;
        else if (score >= 60) intelligenceMetrics.uniquenessDistribution['High']++;
        else if (score >= 40) intelligenceMetrics.uniquenessDistribution['Medium']++;
        else if (score >= 20) intelligenceMetrics.uniquenessDistribution['Low']++;
        else intelligenceMetrics.uniquenessDistribution['Very Low']++;
      }
      
      // Originality analysis
      if (intelligence.originalityScore) {
        intelligenceMetrics.averageOriginality += intelligence.originalityScore;
      }
      
      // Content length
      if (intelligence.contentLength) {
        intelligenceMetrics.totalContentLength += intelligence.contentLength;
      }
      
      // Plagiarism risk
      if (intelligence.plagiarismRisk) {
        const plagiarism = intelligence.plagiarismRisk;
        if (plagiarism.riskLevel && plagiarism.riskLevel !== 'very-low') {
          intelligenceMetrics.plagiarismRisks.push({
            url: url,
            riskLevel: plagiarism.riskLevel,
            riskScore: plagiarism.riskScore,
            confidence: plagiarism.confidence,
            riskFactors: plagiarism.riskFactors || []
          });
        }
      }
      
      // Duplicate detection
      if (intelligence.duplicateDetection) {
        const duplicate = intelligence.duplicateDetection;
        if (duplicate.duplicateCount > 0 || duplicate.nearDuplicateCount > 0) {
          intelligenceMetrics.duplicateContent.push({
            url: url,
            exactDuplicates: duplicate.duplicateCount,
            nearDuplicates: duplicate.nearDuplicateCount,
            uniquenessRatio: duplicate.uniquenessRatio
          });
        }
      }
      
      // Content fingerprint
      if (intelligence.contentFingerprint) {
        intelligenceMetrics.contentFingerprints.push({
          url: url,
          hash: intelligence.contentFingerprint.contentHash,
          shingleCount: intelligence.contentFingerprint.shingleCount,
          method: intelligence.contentFingerprint.fingerprintMethod
        });
      }
      
      // Similarity analysis
      if (intelligence.similarityAnalysis && intelligence.similarityAnalysis.similarPages && intelligence.similarityAnalysis.similarPages.length > 0) {
        intelligenceMetrics.similarityIssues.push({
          url: url,
          similarPages: intelligence.similarityAnalysis.similarPages.length,
          averageSimilarity: intelligence.similarityAnalysis.averageSitewideSimilarity
        });
      }
    }
  }
  
  if (intelligenceMetrics.pagesAnalyzed === 0) {
    return `
      <div class="analysis-section">
        <h3>🧠 Content Intelligence Analysis</h3>
        <div class="no-data-message">No content intelligence data available for analysis</div>
      </div>
    `;
  }
  
  intelligenceMetrics.averageUniqueness = (intelligenceMetrics.averageUniqueness / intelligenceMetrics.pagesAnalyzed).toFixed(1);
  intelligenceMetrics.averageOriginality = (intelligenceMetrics.averageOriginality / intelligenceMetrics.pagesAnalyzed).toFixed(1);
  const averageContentLength = Math.round(intelligenceMetrics.totalContentLength / intelligenceMetrics.pagesAnalyzed);
  
  const getUniquenessClass = (score) => {
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'error';
  };
  
  return `
    <div class="analysis-section">
      <h3>🧠 Content Intelligence Analysis</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Average Uniqueness Score</div>
          <div class="metric-value ${getUniquenessClass(intelligenceMetrics.averageUniqueness)}">${intelligenceMetrics.averageUniqueness}/100</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Average Originality Score</div>
          <div class="metric-value ${getUniquenessClass(intelligenceMetrics.averageOriginality)}">${intelligenceMetrics.averageOriginality}/100</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Average Content Length</div>
          <div class="metric-value">${averageContentLength} chars</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Pages Analyzed</div>
          <div class="metric-value">${intelligenceMetrics.pagesAnalyzed}/${intelligenceMetrics.totalPages}</div>
        </div>
      </div>
      
      <div class="sub-section">
        <h4>📊 Content Uniqueness Distribution</h4>
        <div class="uniqueness-distribution">
          ${Object.entries(intelligenceMetrics.uniquenessDistribution).map(([level, count]) => {
            if (count === 0) return '';
            const percentage = ((count / intelligenceMetrics.pagesAnalyzed) * 100).toFixed(1);
            return `
              <div class="uniqueness-item">
                <span class="uniqueness-level">${level} Uniqueness</span>
                <span class="uniqueness-count">${count} pages (${percentage}%)</span>
                <div class="uniqueness-bar">
                  <div class="uniqueness-fill uniqueness-${level.toLowerCase().replace(' ', '-')}" 
                       style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          }).filter(Boolean).join('')}
        </div>
      </div>
      
      ${intelligenceMetrics.contentFingerprints.length > 0 ? `
        <div class="sub-section">
          <h4>🔍 Content Fingerprints</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Content Hash</th>
                  <th>Shingles</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                ${intelligenceMetrics.contentFingerprints.slice(0, 10).map(fingerprint => `
                  <tr>
                    <td><a href="${fingerprint.url}" target="_blank">${safeDecodeURIComponent(fingerprint.url)}</a></td>
                    <td><code>${fingerprint.hash.substring(0, 16)}...</code></td>
                    <td>${fingerprint.shingleCount}</td>
                    <td>${fingerprint.method}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${intelligenceMetrics.plagiarismRisks.length > 0 ? `
        <div class="issues-section">
          <h4>⚠️ Plagiarism Risk Detection (${intelligenceMetrics.plagiarismRisks.length} pages)</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Confidence</th>
                  <th>Risk Factors</th>
                </tr>
              </thead>
              <tbody>
                ${intelligenceMetrics.plagiarismRisks.slice(0, 5).map(risk => `
                  <tr>
                    <td><a href="${risk.url}" target="_blank">${safeDecodeURIComponent(risk.url)}</a></td>
                    <td><span class="risk-badge risk-${risk.riskLevel}">${risk.riskLevel.replace('-', ' ').toUpperCase()}</span></td>
                    <td>${risk.riskScore}/100</td>
                    <td>${(risk.confidence * 100).toFixed(1)}%</td>
                    <td>${risk.riskFactors.length} factors</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${intelligenceMetrics.duplicateContent.length > 0 ? `
        <div class="issues-section">
          <h4>📝 Duplicate Content Detection (${intelligenceMetrics.duplicateContent.length} pages)</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Exact Duplicates</th>
                  <th>Near Duplicates</th>
                  <th>Uniqueness Ratio</th>
                </tr>
              </thead>
              <tbody>
                ${intelligenceMetrics.duplicateContent.slice(0, 5).map(duplicate => `
                  <tr>
                    <td><a href="${duplicate.url}" target="_blank">${safeDecodeURIComponent(duplicate.url)}</a></td>
                    <td>${duplicate.exactDuplicates}</td>
                    <td>${duplicate.nearDuplicates}</td>
                    <td>${(duplicate.uniquenessRatio * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${intelligenceMetrics.similarityIssues.length > 0 ? `
        <div class="issues-section">
          <h4>🔄 Content Similarity Issues (${intelligenceMetrics.similarityIssues.length} pages)</h4>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Similar Pages</th>
                  <th>Average Similarity</th>
                </tr>
              </thead>
              <tbody>
                ${intelligenceMetrics.similarityIssues.slice(0, 5).map(similarity => `
                  <tr>
                    <td><a href="${similarity.url}" target="_blank">${safeDecodeURIComponent(similarity.url)}</a></td>
                    <td>${similarity.similarPages}</td>
                    <td>${(similarity.averageSimilarity * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
      
      ${intelligenceMetrics.plagiarismRisks.length === 0 && intelligenceMetrics.duplicateContent.length === 0 && intelligenceMetrics.similarityIssues.length === 0 ? 
        '<div class="success-message">✅ Excellent content originality! No plagiarism risks or duplicate content detected.</div>' : ''}
    </div>
  `;
}

// Generate the complete HTML report
function generateHTMLReport(data, filename) {
  const { stats, externalLinks, badRequests, mailtoLinks, telLinks, pageData, visited } = data;
  const domain = visited && visited.length > 0 ? new URL(visited[0]).hostname : 'Unknown Domain';
  const crawlDate = new Date().toLocaleDateString();
  
  const performanceAnalysis = generatePerformanceAnalysis(pageData);
  const compressionAnalysis = generateCompressionAnalysis(pageData);
  const headersAnalysis = generateHeadersAnalysis(pageData);
  const seoAnalysis = generateSEOAnalysis(pageData);
  const enhancedSEOAnalysis = generateEnhancedSEOAnalysis(pageData);
  const enhancedLinkAnalysis = generateEnhancedLinkAnalysis(pageData);
  const enhancedSecurityAnalysis = generateEnhancedSecurityAnalysis(pageData);
  const accessibilityAnalysis = generateAccessibilityAnalysis(pageData);
  const securityAnalysis = generateSecurityAnalysis(pageData);
  const uxElementsAnalysis = generateUXElementsAnalysis(pageData);
  const linkAnalysis = generateLinkAnalysis(stats, externalLinks, badRequests, mailtoLinks, telLinks);
  const pageDetailsTable = generatePageDetailsTable(pageData);
  const readabilityAnalysis = generateReadabilityAnalysis(pageData);
  const statusCodeAnalysis = generateStatusCodeAnalysis(pageData, externalLinks, badRequests);
  const redirectAnalysis = generateRedirectAnalysis(externalLinks);
  const mobileFriendlinessAnalysis = generateMobileFriendlinessAnalysis(pageData);
  const urlArchitectureAnalysis = generateUrlArchitectureAnalysis(pageData);
  const navigationAnalysis = generateNavigationAnalysis(pageData);
  const mediaContentAnalysis = generateMediaContentAnalysis(pageData);
  const pageTypeAnalysis = generatePageTypeAnalysis(pageData);
  
  // Enhanced features (medium-priority)
  const webVitalsAnalysis = generateWebVitalsAnalysis(pageData);
  const advancedAccessibilityAnalysis = generateAdvancedAccessibilityAnalysis(pageData);
  const contentQualityAnalysis = generateContentQualityAnalysis(pageData);
  const sslCertificateAnalysis = generateSSLCertificateAnalysis(pageData);
  const thirdPartyAnalysis = generateThirdPartyAnalysis(pageData);
  const contentIntelligenceAnalysis = generateContentIntelligenceAnalysis(pageData);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Analysis Report - ${domain}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .analysis-section {
            background: white;
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .analysis-section h3 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-item {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        
        .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.25rem;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            font-weight: 500;
        }
        
        .stat-percentage {
            font-size: 0.8rem;
            color: #888;
            margin-top: 0.25rem;
        }
        
        .performance-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .performance-item {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        
        .performance-item h4 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .performance-url {
            font-size: 0.85rem;
            color: #666;
            word-break: break-all;
            margin-bottom: 0.25rem;
        }
        
        .performance-value {
            font-weight: bold;
            color: #28a745;
        }
        
        .issues-list {
            max-height: 300px;
            overflow-y: auto;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .issue-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #dee2e6;
            font-size: 0.9rem;
            color: #dc3545;
        }
        
        .issue-item:last-child {
            border-bottom: none;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            text-align: center;
            font-weight: 500;
        }
        
        .seo-issues, .accessibility-issues, .security-issues, .mixed-content-issues, .cookie-issues {
            margin-top: 1.5rem;
        }
        
        .seo-issues h4, .accessibility-issues h4, .security-issues h4, .mixed-content-issues h4, .cookie-issues h4 {
            color: #dc3545;
            margin-bottom: 1rem;
        }
        
        .mixed-content-analysis, .cookie-compliance-analysis {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .mixed-content-analysis h4, .cookie-compliance-analysis h4 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .stat-item.success {
            background: #d4edda;
            border-color: #c3e6cb;
        }
        
        .stat-item.warning {
            background: #fff3cd;
            border-color: #ffeaa7;
        }
        
        .stat-item.danger {
            background: #f8d7da;
            border-color: #f5c6cb;
        }
        
        .stat-note {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: 0.25rem;
        }
        
        .risk-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-right: 0.5rem;
        }
        
        .risk-high {
            background: #dc3545;
            color: white;
        }
        
        .risk-medium {
            background: #ffc107;
            color: #212529;
        }
        
        .risk-low {
            background: #6c757d;
            color: white;
        }
        
        .compliance-score {
            font-size: 0.9rem;
            color: #495057;
            font-weight: 600;
        }
        
        .issue-item.high {
            border-left: 4px solid #dc3545;
        }
        
        .issue-item.medium {
            border-left: 4px solid #ffc107;
        }
        
        .issue-item.low {
            border-left: 4px solid #6c757d;
        }
        
        /* Enhanced Accessibility Styles */
        .accessibility-overview {
            margin-bottom: 2rem;
        }
        
        .overview-card {
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            border: 2px solid;
        }
        
        .overview-card.good {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        
        .overview-card.warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        
        .overview-card.error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        
        .score-large {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 0.5rem 0;
        }
        
        .score-description {
            font-size: 1rem;
            font-weight: 500;
        }
        
        .stat-percentage.good {
            color: #28a745;
            font-weight: 600;
        }
        
        .stat-percentage.warning {
            color: #ffc107;
            font-weight: 600;
        }
        
        .stat-percentage.error {
            color: #dc3545;
            font-weight: 600;
        }
        
        .contrast-issue {
            border-left: 4px solid #dc3545;
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .contrast-issue.high {
            border-left-color: #dc3545;
            background: #fff5f5;
        }
        
        .contrast-issue.medium {
            border-left-color: #ffc107;
            background: #fffbf0;
        }
        
        .contrast-issue.low {
            border-left-color: #6c757d;
            background: #f8f9fa;
        }
        
        .issue-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        
        .element-tag {
            background: #e9ecef;
            color: #495057;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        .contrast-ratio {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .severity-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .severity-badge.high {
            background: #dc3545;
            color: white;
        }
        
        .severity-badge.medium {
            background: #ffc107;
            color: #212529;
        }
        
        .severity-badge.low {
            background: #6c757d;
            color: white;
        }
        
        .issue-text {
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #495057;
        }
        
        .color-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .color-sample {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            font-weight: bold;
            min-width: 2rem;
            text-align: center;
        }
        
        .requirements {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 0.5rem;
        }
        
        .issue-url {
            font-size: 0.8rem;
            color: #868e96;
            word-break: break-all;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #e9ecef;
        }
        
        .form-issue, .heading-issue, .aria-issue {
            border-left: 4px solid #ffc107;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            background: #fffbf0;
            border-radius: 4px;
        }
        
        .heading-level {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-right: 0.5rem;
        }
        
        .contrast-issues, .form-issues, .heading-issues, .aria-issues, .general-issues {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .contrast-issues h4 {
            color: #dc3545;
            margin-bottom: 1rem;
        }
        
        .form-issues h4, .heading-issues h4, .aria-issues h4 {
            color: #ffc107;
            margin-bottom: 1rem;
        }
        
        .general-issues h4 {
            color: #dc3545;
            margin-bottom: 1rem;
        }
        
        /* UX Elements Analysis Styles */
        .ux-overview {
            margin-bottom: 2rem;
        }
        
        .ux-details {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .cta-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .cta-item {
            padding: 1rem;
            background: white;
            border-radius: 6px;
            border-left: 4px solid;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .cta-item.high-priority {
            border-left-color: #28a745;
            background: #f8fff9;
        }
        
        .cta-item.medium-priority {
            border-left-color: #ffc107;
            background: #fffdf5;
        }
        
        .cta-item.low-priority {
            border-left-color: #6c757d;
            background: #f8f9fa;
        }
        
        .cta-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .cta-text {
            font-weight: 600;
            color: #495057;
            font-size: 1rem;
        }
        
        .priority-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .priority-badge.priority-high {
            background: #28a745;
            color: white;
        }
        
        .priority-badge.priority-medium {
            background: #ffc107;
            color: #212529;
        }
        
        .priority-badge.priority-low {
            background: #6c757d;
            color: white;
        }
        
        .cta-meta {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        
        .position-tag, .above-fold-tag, .below-fold-tag {
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .position-tag {
            background: #e9ecef;
            color: #495057;
        }
        
        .above-fold-tag {
            background: #d4edda;
            color: #155724;
        }
        
        .below-fold-tag {
            background: #f8d7da;
            color: #721c24;
        }
        
        .cta-url {
            font-size: 0.8rem;
            color: #6c757d;
            word-break: break-all;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #e9ecef;
        }
        
        .ux-breakdown {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .breakdown-section {
            padding: 1.5rem;
            background: #fff;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .breakdown-section h4 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .contact-stats, .search-stats, .newsletter-stats {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .contact-method, .search-feature, .newsletter-metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #667eea;
        }
        
        .method-icon {
            font-size: 1.2rem;
            margin-right: 0.5rem;
        }
        
        .method-name, .feature-name, .metric-name {
            font-weight: 500;
            color: #495057;
            flex: 1;
        }
        
        .method-count, .feature-count, .metric-count {
            font-weight: 600;
            color: #667eea;
            background: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .best-practices {
            background: #d4edda;
            border-left-color: #28a745;
        }
        
        .best-practices h4 {
            color: #155724;
        }
        
        .best-practice {
            border-left-color: #28a745;
            background: #f8fff9;
        }
        
        .ux-problems {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        
        .ux-problems h4 {
            color: #856404;
        }
        
        .ux-issue {
            border-left-color: #ffc107;
            background: #fffdf5;
        }
        
        .keyword-analysis, .structured-data-analysis {
            margin-top: 1.5rem;
        }
        
        .keyword-analysis h4, .structured-data-analysis h4 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .keywords-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .keyword-tag {
            background: #e3f2fd;
            color: #1565c0;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .structured-data-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .structured-data-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .structured-data-item:last-child {
            border-bottom: none;
        }
        
        .data-type {
            font-weight: 600;
            color: #495057;
        }
        
        .data-count {
            font-size: 0.9rem;
            color: #6c757d;
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
        }
        
        .readability-distribution, .readability-issues {
            margin-top: 1.5rem;
        }
        
        .readability-distribution h4, .readability-issues h4 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .distribution-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .distribution-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        .distribution-item:last-child {
            border-bottom: none;
        }
        
        .level-name {
            font-weight: 600;
            color: #495057;
        }
        
        .level-count {
            font-size: 0.9rem;
            color: #6c757d;
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
        }
        
        .no-data-message {
            text-align: center;
            padding: 2rem;
            color: #6c757d;
            font-style: italic;
        }
        
        .table-container {
            overflow-x: auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .page-details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .page-details-table th,
        .page-details-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        .page-details-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        .page-details-table tr:hover {
            background: #f8f9fa;
        }
        
        .page-details-table a {
            color: #667eea;
            text-decoration: none;
            word-break: break-all;
        }
        
        .page-details-table a:hover {
            text-decoration: underline;
        }
        
        .link-details-section {
            margin-top: 2rem;
        }
        
        .link-details-section h4 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.2rem;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 0.5rem;
        }
        
        .links-list {
            max-height: 400px;
            overflow-y: auto;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .link-item {
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #667eea;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .link-item.error {
            border-left-color: #dc3545;
        }
        
        .link-item.warning {
            border-left-color: #ffc107;
        }
        
        .link-item.success {
            border-left-color: #28a745;
        }
        
        .link-item:last-child {
            margin-bottom: 0;
        }
        
        .link-url {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        
        .link-url a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
            flex: 1;
            min-width: 200px;
        }
        
        .link-url a:hover {
            text-decoration: underline;
        }
        
        .broken-url, .timeout-url {
            color: #dc3545;
            font-weight: 500;
            word-break: break-all;
            flex: 1;
            min-width: 200px;
        }
        
        .timeout-url {
            color: #856404;
        }
        
        .status-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-weight: 600;
            text-transform: uppercase;
            white-space: nowrap;
        }
        
        .status-badge.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-badge.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-badge.success {
            background: #d4edda;
            color: #155724;
        }
        
        .link-details {
            font-size: 0.9rem;
            color: #666;
        }
        
        .link-count {
            font-weight: 600;
            color: #495057;
            margin-right: 1rem;
        }
        
        .link-anchors, .link-sources {
            margin-top: 0.25rem;
            line-height: 1.4;
        }
        
        .link-anchors {
            color: #6c757d;
            font-style: italic;
        }
        
        .link-sources {
            color: #6c757d;
        }
        
        .show-more {
            text-align: center;
            padding: 1rem;
            color: #6c757d;
            font-style: italic;
            background: white;
            border-radius: 6px;
            margin-top: 0.75rem;
        }
        
        .compression-issues {
            margin-top: 1.5rem;
        }
        
        .compression-issues h4 {
            color: #dc3545;
            margin-bottom: 1rem;
        }
        
        .header-issues {
            margin-top: 1.5rem;
        }
        
        .header-issues h4 {
            color: #dc3545;
            margin-bottom: 1rem;
        }
        
        .content-types-analysis, .servers-analysis, .powered-by-analysis {
            margin-top: 1.5rem;
        }
        
        .content-types-analysis h4, .servers-analysis h4, .powered-by-analysis h4 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .powered-by-analysis h4 {
            color: #dc3545;
        }
        
        .content-types-list, .servers-list, .powered-by-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .content-type-item, .server-item, .powered-by-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #dee2e6;
        }
        
        /* Status code analysis styles */
        .status-success { 
            color: #28a745; 
            font-weight: bold; 
        }
        .status-redirect { 
            color: #ffc107; 
            font-weight: bold; 
        }
        .status-client-error { 
            color: #dc3545; 
            font-weight: bold; 
        }
        .status-server-error { 
            color: #6f42c1; 
            font-weight: bold; 
        }
        .status-other { 
            color: #6c757d; 
            font-weight: bold; 
        }
        
        /* Redirect chain analysis styles */
        .chain-detail {
            font-family: monospace;
            font-size: 0.85rem;
            max-width: 400px;
            word-break: break-all;
        }
        
        /* Mobile analysis styles */
        .sub-metrics {
            margin: 1.5rem 0;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .sub-metrics h4 {
            margin-bottom: 0.5rem;
            color: #495057;
        }
        
        .metrics-row {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .metrics-row span {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        /* URL Architecture analysis styles */
        .complexity-chart {
            margin: 1rem 0;
        }
        
        .complexity-bar {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            gap: 1rem;
        }
        
        .complexity-label {
            min-width: 100px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .complexity-meter {
            flex: 1;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .complexity-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .complexity-simple { background: #28a745; }
        .complexity-moderate { background: #ffc107; }
        .complexity-complex { background: #fd7e14; }
        .complexity-very-complex { background: #dc3545; }
        
        .complexity-count {
            min-width: 30px;
            text-align: right;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .content-type-item:last-child, .server-item:last-child, .powered-by-item:last-child {
            border-bottom: none;
        }
        
        .content-type, .server-name, .powered-by-name {
            font-weight: 600;
            color: #495057;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        
        .content-count, .server-count, .powered-by-count {
            font-size: 0.9rem;
            color: #6c757d;
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
        }
        
        /* Navigation Analysis Styles */
        .navigation-overview {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .nav-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .nav-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .nav-item:hover {
            border-color: #007bff;
            transform: translateY(-2px);
        }
        
        .nav-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .nav-title {
            font-weight: 600;
            font-size: 1rem;
            color: #495057;
            margin-bottom: 0.5rem;
        }
        
        .nav-stat {
            font-size: 1.5rem;
            font-weight: 700;
            color: #007bff;
            margin-bottom: 0.25rem;
        }
        
        .nav-coverage {
            font-size: 0.9rem;
            color: #6c757d;
            margin-bottom: 0.25rem;
        }
        
        .nav-detail {
            font-size: 0.8rem;
            color: #6c757d;
        }
        
        .navigation-details {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .nav-detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .nav-detail-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            border-left: 4px solid #007bff;
        }
        
        .nav-detail-card h4 {
            margin: 0 0 1rem 0;
            color: #495057;
            font-size: 1.1rem;
        }
        
        .nav-metrics {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .metric-value {
            font-weight: 600;
            color: #495057;
        }
        
        .metric-value.success {
            color: #28a745;
        }
        
        .metric-value.warning {
            color: #ffc107;
        }
        
        .navigation-issues {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
        }
        
        .navigation-issues h4 {
            margin: 0 0 0.75rem 0;
            color: #856404;
        }
        
        /* Media Content Analysis Styles */
        .media-overview {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
        }
        
        .media-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .media-item:hover {
            border-color: #007bff;
            transform: translateY(-2px);
        }
        
        .media-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .media-title {
            font-weight: 600;
            font-size: 0.9rem;
            color: #495057;
            margin-bottom: 0.5rem;
        }
        
        .media-stat {
            font-size: 1.5rem;
            font-weight: 700;
            color: #007bff;
            margin-bottom: 0.25rem;
        }
        
        .media-detail {
            font-size: 0.8rem;
            color: #6c757d;
            margin-bottom: 0.25rem;
        }
        
        .media-details {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .media-detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .media-detail-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            border-left: 4px solid #007bff;
        }
        
        .media-detail-card h4 {
            margin: 0 0 1rem 0;
            color: #495057;
            font-size: 1.1rem;
        }
        
        .media-metrics {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .extension-tags, .platform-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .extension-tag, .platform-tag {
            background: #e9ecef;
            color: #495057;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .platform-tag {
            background: #007bff;
            color: white;
        }
        
        .metric-value.error {
            color: #dc3545;
        }
        
        .media-issues {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
        }
        
        .media-issues h4 {
            margin: 0 0 0.75rem 0;
            color: #856404;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
            
            .performance-details {
                grid-template-columns: 1fr;
            }
            
            .nav-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
            
            .nav-detail-grid {
                grid-template-columns: 1fr;
            }
        }
        
        /* Page Type Analysis Styles */
        .type-distribution {
            margin: 1rem 0;
        }
        
        .type-bar {
            margin-bottom: 0.8rem;
        }
        
        .type-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.3rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .type-label {
            font-weight: 600;
            color: #333;
        }
        
        .type-stats {
            color: #666;
            font-size: 0.9rem;
        }
        
        .confidence-badge {
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .confidence-high {
            background-color: #d4edda;
            color: #155724;
        }
        
        .confidence-medium {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .confidence-low {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .type-meter {
            width: 100%;
            height: 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .type-fill {
            height: 100%;
            background: linear-gradient(45deg, #007bff, #0056b3);
            transition: width 0.3s ease;
        }
        
        .indicators-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .indicator-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .indicator-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
            text-transform: capitalize;
        }
        
        .indicator-count {
            font-size: 1.2rem;
            color: #007bff;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .indicator-types {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
            justify-content: center;
        }
        
        .type-tag {
            background-color: #e9ecef;
            color: #495057;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .type-examples {
            margin: 1rem 0;
        }
        
        .type-example-group {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .type-example-group h5 {
            color: #333;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #007bff;
        }
        
        .example-item {
            margin-bottom: 1rem;
            padding: 0.8rem;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #007bff;
        }
        
        .example-url {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .example-url a {
            color: #007bff;
            text-decoration: none;
            word-break: break-all;
            flex: 1;
            min-width: 200px;
        }
        
        .example-url a:hover {
            text-decoration: underline;
        }
        
        .confidence-score {
            background-color: #e9ecef;
            color: #495057;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .example-indicators {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
        }
        
        .indicator-chip {
            background-color: #007bff;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            text-transform: capitalize;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Data Analysis Report</h1>
            <p><strong>Domain:</strong> ${domain} | <strong>Generated:</strong> ${crawlDate} | <strong>Source:</strong> ${filename}</p>
        </div>
        
        ${linkAnalysis}
        ${performanceAnalysis}
        ${webVitalsAnalysis}
        ${compressionAnalysis}
        ${headersAnalysis}
        ${statusCodeAnalysis}
        ${redirectAnalysis}
        ${seoAnalysis}
        ${enhancedSEOAnalysis}
        ${enhancedLinkAnalysis}
        ${readabilityAnalysis}
        ${contentQualityAnalysis}
        ${accessibilityAnalysis}
        ${advancedAccessibilityAnalysis}
        ${uxElementsAnalysis}
        ${mobileFriendlinessAnalysis}
        ${urlArchitectureAnalysis}
        ${navigationAnalysis}
        ${mediaContentAnalysis}
        ${pageTypeAnalysis}
        ${securityAnalysis}
        ${enhancedSecurityAnalysis}
        ${sslCertificateAnalysis}
        ${thirdPartyAnalysis}
        ${contentIntelligenceAnalysis}
        ${pageDetailsTable}
    </div>
</body>
</html>`;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node data-analyzer.js <path-to-crawl-state.json> [output.html]');
    console.log('');
    console.log('Examples:');
    console.log('  node data-analyzer.js ./httpbin/crawl-state.json');
    console.log('    (saves to ./httpbin/crawl-state-analysis.html)');
    console.log('  node data-analyzer.js ./culinar-co/crawl-state.json custom-report.html');
    console.log('    (saves to ./custom-report.html)');
    console.log('  node data-analyzer.js ./eldan/crawl-state.json');
    console.log('    (saves to ./eldan/crawl-state-analysis.html)');
    process.exit(1);
  }
  
  const inputFile = args[0];
  
  // Resolve to absolute path to ensure correct directory handling
  const absoluteInputFile = path.resolve(inputFile);
  
  let outputFile;
  if (args[1]) {
    // If custom output filename is provided
    if (path.isAbsolute(args[1])) {
      // Absolute path - use as-is
      outputFile = args[1];
    } else {
      // Relative path - resolve relative to input file's directory
      const inputDir = path.dirname(absoluteInputFile);
      outputFile = path.resolve(inputDir, args[1]);
    }
  } else {
    // Generate default output filename in the same directory as input file
    const inputDir = path.dirname(absoluteInputFile);
    const inputBasename = path.basename(absoluteInputFile, '.json');
    outputFile = path.join(inputDir, `${inputBasename}-analysis.html`);
  }
  
  if (!fs.existsSync(absoluteInputFile)) {
    console.error(`Error: File ${inputFile} does not exist.`);
    process.exit(1);
  }
  
  try {
    console.log(`📖 Reading data from ${inputFile}...`);
    const rawData = fs.readFileSync(absoluteInputFile, 'utf-8');
    const data = JSON.parse(rawData);
    
    // Load page data from separate files
    const inputDir = path.dirname(absoluteInputFile);
    const pageDataDir = path.join(inputDir, 'page-data');
    const pageData = {};
    
    if (fs.existsSync(pageDataDir)) {
      const pageDataFiles = fs.readdirSync(pageDataDir);
      for (const file of pageDataFiles) {
        if (file.endsWith('.json')) {
          try {
            const pageDataPath = path.join(pageDataDir, file);
            const pageDataContent = fs.readFileSync(pageDataPath, 'utf-8');
            const pageDataObj = JSON.parse(pageDataContent);
            if (pageDataObj.url) {
              pageData[pageDataObj.url] = pageDataObj;
            }
          } catch (error) {
            console.warn(`⚠️  Failed to load page data from ${file}: ${error.message}`);
          }
        }
      }
    }
    
    // Add page data to main data object
    data.pageData = pageData;
    
    console.log(`📊 Analyzing data...`);
    console.log(`   - ${data.visited?.length || 0} pages visited`);
    console.log(`   - ${Object.keys(data.stats || {}).length} internal links`);
    console.log(`   - ${Object.keys(data.externalLinks || {}).length} external links`);
    console.log(`   - ${Object.keys(data.pageData || {}).length} pages with detailed data`);
    
    const htmlReport = generateHTMLReport(data, path.basename(absoluteInputFile));
    
    console.log(`💾 Generating report ${outputFile}...`);
    fs.writeFileSync(outputFile, htmlReport);
    
    console.log(`✅ Analysis complete! Report saved to ${outputFile}`);
    console.log(`🔗 Open ${outputFile} in your browser to view the full analysis.`);
    
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    process.exit(1);
  }
}


// Generate navigation analysis
function generateNavigationAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let navigationStats = {
    breadcrumbs: { present: 0, accessible: 0, totalDepth: 0 },
    mainNav: { present: 0, hierarchical: 0, totalLinks: 0, accessible: 0 },
    footer: { present: 0, columnar: 0, totalLinks: 0, hasSocial: 0, hasLegal: 0 },
    pagination: { present: 0, accessible: 0, numbered: 0, infiniteScroll: 0 },
    secondary: { present: 0, totalNavs: 0 }
  };
  
  let navigationIssues = [];
  let pageCount = 0;
  
  Object.entries(pageData).forEach(([url, data]) => {
    if (!data.navigationData) return;
    pageCount++;
    
    const nav = data.navigationData;
    
    // Breadcrumb analysis
    if (nav.breadcrumbs?.present) {
      navigationStats.breadcrumbs.present++;
      if (nav.breadcrumbs.isAccessible) navigationStats.breadcrumbs.accessible++;
      navigationStats.breadcrumbs.totalDepth += nav.breadcrumbs.depth || 0;
      
      if (!nav.breadcrumbs.isAccessible) {
        navigationIssues.push(`${url}: Breadcrumbs lack accessibility attributes`);
      }
      if (!nav.breadcrumbs.currentPageInBreadcrumb) {
        navigationIssues.push(`${url}: Current page not indicated in breadcrumbs`);
      }
    }
    
    // Main navigation analysis
    if (nav.mainNav?.present) {
      navigationStats.mainNav.present++;
      if (nav.mainNav.structure === 'hierarchical') navigationStats.mainNav.hierarchical++;
      if (nav.mainNav.hasAriaLabels) navigationStats.mainNav.accessible++;
      navigationStats.mainNav.totalLinks += nav.mainNav.linkCount || 0;
      
      if (nav.mainNav.hasDropdowns && !nav.mainNav.hasAriaLabels) {
        navigationIssues.push(`${url}: Dropdown navigation lacks ARIA labels`);
      }
      if (!nav.mainNav.hasKeyboardSupport) {
        navigationIssues.push(`${url}: Main navigation may lack keyboard support`);
      }
    }
    
    // Footer navigation analysis
    if (nav.footer?.present) {
      navigationStats.footer.present++;
      if (nav.footer.structure === 'columnar') navigationStats.footer.columnar++;
      if (nav.footer.hasSocialLinks) navigationStats.footer.hasSocial++;
      if (nav.footer.hasLegalLinks) navigationStats.footer.hasLegal++;
      navigationStats.footer.totalLinks += nav.footer.linkCount || 0;
      
      if (!nav.footer.patterns?.hasPrivacyPolicy) {
        navigationIssues.push(`${url}: Footer missing privacy policy link`);
      }
    }
    
    // Pagination analysis
    if (nav.pagination?.present) {
      navigationStats.pagination.present++;
      if (nav.pagination.isAccessible) navigationStats.pagination.accessible++;
      if (nav.pagination.type === 'numbered') navigationStats.pagination.numbered++;
      if (nav.pagination.hasInfiniteScroll) navigationStats.pagination.infiniteScroll++;
      
      if (!nav.pagination.isAccessible) {
        navigationIssues.push(`${url}: Pagination lacks accessibility attributes`);
      }
    }
    
    // Secondary navigation analysis
    if (nav.secondary?.present) {
      navigationStats.secondary.present++;
      navigationStats.secondary.totalNavs += nav.secondary.count || 0;
    }
  });
  
  const breadcrumbCoverage = pageCount > 0 ? ((navigationStats.breadcrumbs.present / pageCount) * 100).toFixed(1) : 0;
  const mainNavCoverage = pageCount > 0 ? ((navigationStats.mainNav.present / pageCount) * 100).toFixed(1) : 0;
  const footerCoverage = pageCount > 0 ? ((navigationStats.footer.present / pageCount) * 100).toFixed(1) : 0;
  const paginationCoverage = pageCount > 0 ? ((navigationStats.pagination.present / pageCount) * 100).toFixed(1) : 0;
  
  const averageBreadcrumbDepth = navigationStats.breadcrumbs.present > 0 ? 
    (navigationStats.breadcrumbs.totalDepth / navigationStats.breadcrumbs.present).toFixed(1) : 0;
  
  const averageMainNavLinks = navigationStats.mainNav.present > 0 ? 
    (navigationStats.mainNav.totalLinks / navigationStats.mainNav.present).toFixed(1) : 0;
  
  const averageFooterLinks = navigationStats.footer.present > 0 ? 
    (navigationStats.footer.totalLinks / navigationStats.footer.present).toFixed(1) : 0;
  
  return `
    <div class="analysis-section">
      <h2>🧭 Navigation Structure Analysis</h2>
      
      <div class="navigation-overview">
        <div class="nav-grid">
          <div class="nav-item">
            <div class="nav-icon">🍞</div>
            <div class="nav-title">Breadcrumbs</div>
            <div class="nav-stat">${navigationStats.breadcrumbs.present}/${pageCount}</div>
            <div class="nav-coverage">${breadcrumbCoverage}% coverage</div>
            <div class="nav-detail">Avg depth: ${averageBreadcrumbDepth}</div>
          </div>
          
          <div class="nav-item">
            <div class="nav-icon">📱</div>
            <div class="nav-title">Main Navigation</div>
            <div class="nav-stat">${navigationStats.mainNav.present}/${pageCount}</div>
            <div class="nav-coverage">${mainNavCoverage}% coverage</div>
            <div class="nav-detail">Avg links: ${averageMainNavLinks}</div>
          </div>
          
          <div class="nav-item">
            <div class="nav-icon">👣</div>
            <div class="nav-title">Footer Navigation</div>
            <div class="nav-stat">${navigationStats.footer.present}/${pageCount}</div>
            <div class="nav-coverage">${footerCoverage}% coverage</div>
            <div class="nav-detail">Avg links: ${averageFooterLinks}</div>
          </div>
          
          <div class="nav-item">
            <div class="nav-icon">📄</div>
            <div class="nav-title">Pagination</div>
            <div class="nav-stat">${navigationStats.pagination.present}/${pageCount}</div>
            <div class="nav-coverage">${paginationCoverage}% coverage</div>
            <div class="nav-detail">${navigationStats.pagination.numbered} numbered</div>
          </div>
        </div>
      </div>
      
      <div class="navigation-details">
        <div class="nav-detail-grid">
          <div class="nav-detail-card">
            <h4>Breadcrumb Analysis</h4>
            <div class="nav-metrics">
              <div class="metric">
                <span class="metric-label">Pages with breadcrumbs:</span>
                <span class="metric-value">${navigationStats.breadcrumbs.present}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Accessible breadcrumbs:</span>
                <span class="metric-value ${navigationStats.breadcrumbs.accessible === navigationStats.breadcrumbs.present ? 'success' : 'warning'}">${navigationStats.breadcrumbs.accessible}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Average depth:</span>
                <span class="metric-value">${averageBreadcrumbDepth} levels</span>
              </div>
            </div>
          </div>
          
          <div class="nav-detail-card">
            <h4>Main Navigation Analysis</h4>
            <div class="nav-metrics">
              <div class="metric">
                <span class="metric-label">Pages with main nav:</span>
                <span class="metric-value">${navigationStats.mainNav.present}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Hierarchical structure:</span>
                <span class="metric-value">${navigationStats.mainNav.hierarchical}</span>
              </div>
              <div class="metric">
                <span class="metric-label">With ARIA labels:</span>
                <span class="metric-value ${navigationStats.mainNav.accessible === navigationStats.mainNav.present ? 'success' : 'warning'}">${navigationStats.mainNav.accessible}</span>
              </div>
            </div>
          </div>
          
          <div class="nav-detail-card">
            <h4>Footer Navigation Analysis</h4>
            <div class="nav-metrics">
              <div class="metric">
                <span class="metric-label">Pages with footer nav:</span>
                <span class="metric-value">${navigationStats.footer.present}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Columnar layout:</span>
                <span class="metric-value">${navigationStats.footer.columnar}</span>
              </div>
              <div class="metric">
                <span class="metric-label">With social links:</span>
                <span class="metric-value">${navigationStats.footer.hasSocial}</span>
              </div>
              <div class="metric">
                <span class="metric-label">With legal links:</span>
                <span class="metric-value">${navigationStats.footer.hasLegal}</span>
              </div>
            </div>
          </div>
          
          <div class="nav-detail-card">
            <h4>Pagination Analysis</h4>
            <div class="nav-metrics">
              <div class="metric">
                <span class="metric-label">Pages with pagination:</span>
                <span class="metric-value">${navigationStats.pagination.present}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Numbered pagination:</span>
                <span class="metric-value">${navigationStats.pagination.numbered}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Infinite scroll:</span>
                <span class="metric-value">${navigationStats.pagination.infiniteScroll}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Accessible:</span>
                <span class="metric-value ${navigationStats.pagination.accessible === navigationStats.pagination.present ? 'success' : 'warning'}">${navigationStats.pagination.accessible}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      ${navigationIssues.length > 0 ? `
      <div class="navigation-issues">
        <h4>⚠️ Navigation Issues (${navigationIssues.length} found)</h4>
        <div class="issues-list">
          ${navigationIssues.slice(0, 15).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${navigationIssues.length > 15 ? `<div class="issue-item">... and ${navigationIssues.length - 15} more issues</div>` : ''}
        </div>
      </div>
      ` : '<div class="success-message">✅ No navigation issues found!</div>'}
    </div>
  `;
}

// Generate media content analysis
function generateMediaContentAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let mediaStats = {
    images: { total: 0, withAlt: 0, missingAlt: 0, responsive: 0, lazyLoaded: 0, modernFormat: 0 },
    videos: { total: 0, withControls: 0, withCaptions: 0, missingCaptions: 0 },
    audios: { total: 0, withControls: 0, withTranscripts: 0, missingTranscripts: 0 },
    downloads: { total: 0, categories: {}, extensions: {} },
    embeds: { total: 0, platforms: [], accessible: 0 },
    thirdParty: { totalDomains: 0, analytics: 0, advertising: 0, social: 0 }
  };
  
  let mediaIssues = [];
  let pageCount = 0;
  
  Object.entries(pageData).forEach(([url, data]) => {
    if (!data.mediaContent) return;
    pageCount++;
    
    const media = data.mediaContent;
    
    // Image analysis
    if (media.images) {
      mediaStats.images.total += media.images.total || 0;
      mediaStats.images.withAlt += media.images.withAlt || 0;
      mediaStats.images.missingAlt += media.images.missingAlt || 0;
      mediaStats.images.responsive += media.images.responsive || 0;
      mediaStats.images.lazyLoaded += media.images.lazyLoaded || 0;
      mediaStats.images.modernFormat += media.images.modernFormat || 0;
      
      if (media.images.missingAlt > 0) {
        mediaIssues.push(`${url}: ${media.images.missingAlt} images missing alt text`);
      }
      if (media.images.responsive === 0 && media.images.total > 0) {
        mediaIssues.push(`${url}: No responsive images detected`);
      }
    }
    
    // Video analysis
    if (media.videos) {
      mediaStats.videos.total += media.videos.total || 0;
      mediaStats.videos.withControls += media.videos.withControls || 0;
      mediaStats.videos.withCaptions += media.videos.withCaptions || 0;
      mediaStats.videos.missingCaptions += media.videos.missingCaptions || 0;
      
      if (media.videos.missingCaptions > 0) {
        mediaIssues.push(`${url}: ${media.videos.missingCaptions} videos missing captions`);
      }
      if (media.videos.withoutControls > 0) {
        mediaIssues.push(`${url}: ${media.videos.withoutControls} videos without controls`);
      }
    }
    
    // Audio analysis
    if (media.audios) {
      mediaStats.audios.total += media.audios.total || 0;
      mediaStats.audios.withControls += media.audios.withControls || 0;
      mediaStats.audios.withTranscripts += media.audios.withTranscripts || 0;
      mediaStats.audios.missingTranscripts += media.audios.missingTranscripts || 0;
      
      if (media.audios.missingTranscripts > 0) {
        mediaIssues.push(`${url}: ${media.audios.missingTranscripts} audio files missing transcripts`);
      }
    }
    
    // Downloads analysis
    if (media.downloads) {
      mediaStats.downloads.total += media.downloads.total || 0;
      
      // Merge categories and extensions
      Object.entries(media.downloads.categories || {}).forEach(([category, count]) => {
        mediaStats.downloads.categories[category] = (mediaStats.downloads.categories[category] || 0) + count;
      });
      
      Object.entries(media.downloads.extensions || {}).forEach(([ext, count]) => {
        mediaStats.downloads.extensions[ext] = (mediaStats.downloads.extensions[ext] || 0) + count;
      });
    }
    
    // Embeds analysis
    if (media.embeds) {
      mediaStats.embeds.total += media.embeds.total || 0;
      mediaStats.embeds.accessible += media.embeds.accessibleEmbeds || 0;
      
      if (media.embeds.platforms) {
        media.embeds.platforms.forEach(platform => {
          if (!mediaStats.embeds.platforms.includes(platform)) {
            mediaStats.embeds.platforms.push(platform);
          }
        });
      }
      
      if (media.embeds.total > 0 && media.embeds.accessibilityScore < 100) {
        mediaIssues.push(`${url}: Social embeds lack accessibility features`);
      }
    }
    
    // Third-party analysis
    if (media.thirdParty) {
      mediaStats.thirdParty.totalDomains += media.thirdParty.totalDomains || 0;
      mediaStats.thirdParty.analytics += media.thirdParty.summary?.analytics || 0;
      mediaStats.thirdParty.advertising += media.thirdParty.summary?.advertising || 0;
      mediaStats.thirdParty.social += media.thirdParty.summary?.social || 0;
    }
  });
  
  // Calculate percentages
  const imageAccessibilityRate = mediaStats.images.total > 0 ? 
    ((mediaStats.images.withAlt / mediaStats.images.total) * 100).toFixed(1) : 100;
  
  const videoAccessibilityRate = mediaStats.videos.total > 0 ? 
    ((mediaStats.videos.withCaptions / mediaStats.videos.total) * 100).toFixed(1) : 100;
  
  const audioAccessibilityRate = mediaStats.audios.total > 0 ? 
    ((mediaStats.audios.withTranscripts / mediaStats.audios.total) * 100).toFixed(1) : 100;
  
  const responsiveImageRate = mediaStats.images.total > 0 ? 
    ((mediaStats.images.responsive / mediaStats.images.total) * 100).toFixed(1) : 0;
  
  const modernFormatRate = mediaStats.images.total > 0 ? 
    ((mediaStats.images.modernFormat / mediaStats.images.total) * 100).toFixed(1) : 0;
  
  // Top download categories and extensions
  const topCategories = Object.entries(mediaStats.downloads.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const topExtensions = Object.entries(mediaStats.downloads.extensions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);
  
  return `
    <div class="analysis-section">
      <h2>🎬 Media Content & Downloads Analysis</h2>
      
      <div class="media-overview">
        <div class="media-grid">
          <div class="media-item">
            <div class="media-icon">🖼️</div>
            <div class="media-title">Images</div>
            <div class="media-stat">${mediaStats.images.total}</div>
            <div class="media-detail">${imageAccessibilityRate}% with alt text</div>
            <div class="media-detail">${responsiveImageRate}% responsive</div>
          </div>
          
          <div class="media-item">
            <div class="media-icon">🎥</div>
            <div class="media-title">Videos</div>
            <div class="media-stat">${mediaStats.videos.total}</div>
            <div class="media-detail">${videoAccessibilityRate}% with captions</div>
            <div class="media-detail">${mediaStats.videos.withControls} with controls</div>
          </div>
          
          <div class="media-item">
            <div class="media-icon">🎵</div>
            <div class="media-title">Audio Files</div>
            <div class="media-stat">${mediaStats.audios.total}</div>
            <div class="media-detail">${audioAccessibilityRate}% with transcripts</div>
            <div class="media-detail">${mediaStats.audios.withControls} with controls</div>
          </div>
          
          <div class="media-item">
            <div class="media-icon">📥</div>
            <div class="media-title">Downloads</div>
            <div class="media-stat">${mediaStats.downloads.total}</div>
            <div class="media-detail">${Object.keys(mediaStats.downloads.categories).length} categories</div>
            <div class="media-detail">${Object.keys(mediaStats.downloads.extensions).length} file types</div>
          </div>
          
          <div class="media-item">
            <div class="media-icon">📱</div>
            <div class="media-title">Social Embeds</div>
            <div class="media-stat">${mediaStats.embeds.total}</div>
            <div class="media-detail">${mediaStats.embeds.platforms.length} platforms</div>
            <div class="media-detail">${mediaStats.embeds.accessible} accessible</div>
          </div>
          
          <div class="media-item">
            <div class="media-icon">🌐</div>
            <div class="media-title">3rd Party</div>
            <div class="media-stat">${mediaStats.thirdParty.totalDomains}</div>
            <div class="media-detail">${mediaStats.thirdParty.analytics} analytics</div>
            <div class="media-detail">${mediaStats.thirdParty.advertising} ads</div>
          </div>
        </div>
      </div>
      
      <div class="media-details">
        <div class="media-detail-grid">
          <div class="media-detail-card">
            <h4>Image Analysis</h4>
            <div class="media-metrics">
              <div class="metric">
                <span class="metric-label">Total images:</span>
                <span class="metric-value">${mediaStats.images.total}</span>
              </div>
              <div class="metric">
                <span class="metric-label">With alt text:</span>
                <span class="metric-value ${parseFloat(imageAccessibilityRate) >= 95 ? 'success' : parseFloat(imageAccessibilityRate) >= 80 ? 'warning' : 'error'}">${mediaStats.images.withAlt} (${imageAccessibilityRate}%)</span>
              </div>
              <div class="metric">
                <span class="metric-label">Responsive images:</span>
                <span class="metric-value">${mediaStats.images.responsive} (${responsiveImageRate}%)</span>
              </div>
              <div class="metric">
                <span class="metric-label">Modern formats:</span>
                <span class="metric-value">${mediaStats.images.modernFormat} (${modernFormatRate}%)</span>
              </div>
              <div class="metric">
                <span class="metric-label">Lazy loaded:</span>
                <span class="metric-value">${mediaStats.images.lazyLoaded}</span>
              </div>
            </div>
          </div>
          
          <div class="media-detail-card">
            <h4>Video & Audio Analysis</h4>
            <div class="media-metrics">
              <div class="metric">
                <span class="metric-label">Videos total:</span>
                <span class="metric-value">${mediaStats.videos.total}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Videos with captions:</span>
                <span class="metric-value ${parseFloat(videoAccessibilityRate) >= 95 ? 'success' : 'warning'}">${mediaStats.videos.withCaptions} (${videoAccessibilityRate}%)</span>
              </div>
              <div class="metric">
                <span class="metric-label">Audio files total:</span>
                <span class="metric-value">${mediaStats.audios.total}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Audio with transcripts:</span>
                <span class="metric-value ${parseFloat(audioAccessibilityRate) >= 95 ? 'success' : 'warning'}">${mediaStats.audios.withTranscripts} (${audioAccessibilityRate}%)</span>
              </div>
            </div>
          </div>
          
          <div class="media-detail-card">
            <h4>Download Links</h4>
            <div class="media-metrics">
              <div class="metric">
                <span class="metric-label">Total downloads:</span>
                <span class="metric-value">${mediaStats.downloads.total}</span>
              </div>
              ${topCategories.slice(0, 4).map(([category, count]) => `
                <div class="metric">
                  <span class="metric-label">${category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                  <span class="metric-value">${count}</span>
                </div>
              `).join('')}
            </div>
            ${topExtensions.length > 0 ? `
            <div class="extension-tags">
              ${topExtensions.map(([ext, count]) => `
                <span class="extension-tag">.${ext} (${count})</span>
              `).join('')}
            </div>
            ` : ''}
          </div>
          
          <div class="media-detail-card">
            <h4>Social Media & Embeds</h4>
            <div class="media-metrics">
              <div class="metric">
                <span class="metric-label">Total embeds:</span>
                <span class="metric-value">${mediaStats.embeds.total}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Platforms detected:</span>
                <span class="metric-value">${mediaStats.embeds.platforms.length}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Accessible embeds:</span>
                <span class="metric-value ${mediaStats.embeds.total > 0 && mediaStats.embeds.accessible === mediaStats.embeds.total ? 'success' : 'warning'}">${mediaStats.embeds.accessible}</span>
              </div>
              <div class="metric">
                <span class="metric-label">3rd party domains:</span>
                <span class="metric-value">${mediaStats.thirdParty.totalDomains}</span>
              </div>
            </div>
            ${mediaStats.embeds.platforms.length > 0 ? `
            <div class="platform-tags">
              ${mediaStats.embeds.platforms.map(platform => `
                <span class="platform-tag">${platform}</span>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      ${mediaIssues.length > 0 ? `
      <div class="media-issues">
        <h4>⚠️ Media Accessibility Issues (${mediaIssues.length} found)</h4>
        <div class="issues-list">
          ${mediaIssues.slice(0, 15).map(issue => `<div class="issue-item">${issue}</div>`).join('')}
          ${mediaIssues.length > 15 ? `<div class="issue-item">... and ${mediaIssues.length - 15} more issues</div>` : ''}
        </div>
      </div>
      ` : '<div class="success-message">✅ No media accessibility issues found!</div>'}
    </div>
  `;
}

// NEW ENHANCED ANALYSIS FUNCTIONS

function generateEnhancedSEOAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let robotsAnalysis = { pages: 0, noindex: 0, nofollow: 0, withDirectives: 0 };
  let languageAnalysis = { pagesWithLang: 0, languages: new Set(), hreflangPages: 0 };
  let faviconAnalysis = { pagesWithFavicon: 0, totalFavicons: 0, appleTouch: 0 };
  let keywordsAnalysis = { pagesWithKeywords: 0, totalKeywords: 0 };
  
  for (const [url, data] of Object.entries(pageData)) {
    const seo = data.seo || {};
    
    // Robots analysis
    if (seo.robotsDirectives) {
      robotsAnalysis.pages++;
      if (seo.robotsDirectives.analysis) {
        if (!seo.robotsDirectives.analysis.allowsIndexing) robotsAnalysis.noindex++;
        if (!seo.robotsDirectives.analysis.allowsFollowing) robotsAnalysis.nofollow++;
        if (seo.robotsDirectives.directives?.length > 0) robotsAnalysis.withDirectives++;
      }
    }
    
    // Language analysis
    if (seo.language) {
      if (seo.language.htmlLang) {
        languageAnalysis.pagesWithLang++;
        languageAnalysis.languages.add(seo.language.htmlLang);
      }
      if (seo.language.hreflangLinks?.length > 0) {
        languageAnalysis.hreflangPages++;
      }
    }
    
    // Favicon analysis
    if (seo.favicon) {
      if (seo.favicon.count > 0) {
        faviconAnalysis.pagesWithFavicon++;
        faviconAnalysis.totalFavicons += seo.favicon.count;
      }
      if (seo.favicon.hasAppleTouchIcon) faviconAnalysis.appleTouch++;
    }
    
    // Keywords analysis
    if (seo.metaKeywords) {
      keywordsAnalysis.pagesWithKeywords++;
      keywordsAnalysis.totalKeywords += seo.metaKeywords.split(',').length;
    }
  }
  
  const totalPages = Object.keys(pageData).length;
  
  return `
    <div class="analysis-section">
      <h3>🆕 Enhanced SEO Analysis</h3>
      <div class="grid-2">
        <div class="stat-card">
          <h4>🤖 Robots Meta Tags</h4>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${robotsAnalysis.pages}</span>
              <span class="stat-label">Pages with robots tags</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${robotsAnalysis.noindex}</span>
              <span class="stat-label">Noindex pages</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${robotsAnalysis.nofollow}</span>
              <span class="stat-label">Nofollow pages</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${robotsAnalysis.withDirectives}</span>
              <span class="stat-label">With directives</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>🌐 Language & Internationalization</h4>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${languageAnalysis.pagesWithLang}</span>
              <span class="stat-label">Pages with lang attribute</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${languageAnalysis.languages.size}</span>
              <span class="stat-label">Unique languages</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${languageAnalysis.hreflangPages}</span>
              <span class="stat-label">Pages with hreflang</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${Math.round((languageAnalysis.pagesWithLang/totalPages)*100)}%</span>
              <span class="stat-label">Lang coverage</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>🎯 Favicon Analysis</h4>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${faviconAnalysis.pagesWithFavicon}</span>
              <span class="stat-label">Pages with favicon</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${faviconAnalysis.totalFavicons}</span>
              <span class="stat-label">Total favicon files</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${faviconAnalysis.appleTouch}</span>
              <span class="stat-label">Apple touch icons</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${Math.round((faviconAnalysis.pagesWithFavicon/totalPages)*100)}%</span>
              <span class="stat-label">Favicon coverage</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>🔑 Meta Keywords (Legacy)</h4>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${keywordsAnalysis.pagesWithKeywords}</span>
              <span class="stat-label">Pages with keywords</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${keywordsAnalysis.totalKeywords}</span>
              <span class="stat-label">Total keywords</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${keywordsAnalysis.pagesWithKeywords > 0 ? Math.round(keywordsAnalysis.totalKeywords/keywordsAnalysis.pagesWithKeywords) : 0}</span>
              <span class="stat-label">Avg per page</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${Math.round((keywordsAnalysis.pagesWithKeywords/totalPages)*100)}%</span>
              <span class="stat-label">Usage rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateEnhancedLinkAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let relAnalysis = {
    nofollow: 0, sponsored: 0, ugc: 0, noopener: 0, noreferrer: 0,
    external: 0, help: 0, license: 0, next: 0, prev: 0, bookmark: 0, tag: 0
  };
  let totalPagesWithRel = 0;
  
  for (const [url, data] of Object.entries(pageData)) {
    const linkAnalysis = data.linkAnalysis || {};
    
    if (linkAnalysis.relAttributes) {
      let hasRel = false;
      Object.keys(relAnalysis).forEach(relType => {
        if (linkAnalysis.relAttributes[relType] > 0) {
          relAnalysis[relType] += linkAnalysis.relAttributes[relType];
          hasRel = true;
        }
      });
      if (hasRel) totalPagesWithRel++;
    }
  }
  
  const seoRelTypes = ['nofollow', 'sponsored', 'ugc'];
  const securityRelTypes = ['noopener', 'noreferrer'];
  const semanticRelTypes = ['external', 'help', 'license'];
  const navigationRelTypes = ['next', 'prev', 'bookmark', 'tag'];
  
  return `
    <div class="analysis-section">
      <h3>🆕 Enhanced Link Rel Attributes</h3>
      <div class="grid-2">
        <div class="stat-card">
          <h4>🔍 SEO-Critical Rel Attributes</h4>
          <div class="stat-grid">
            ${seoRelTypes.map(rel => `
            <div class="stat-item">
              <span class="stat-value">${relAnalysis[rel]}</span>
              <span class="stat-label">rel="${rel}"</span>
            </div>
            `).join('')}
            <div class="stat-item">
              <span class="stat-value">${seoRelTypes.reduce((sum, rel) => sum + relAnalysis[rel], 0)}</span>
              <span class="stat-label">Total SEO rels</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>🔒 Security Rel Attributes</h4>
          <div class="stat-grid">
            ${securityRelTypes.map(rel => `
            <div class="stat-item">
              <span class="stat-value">${relAnalysis[rel]}</span>
              <span class="stat-label">rel="${rel}"</span>
            </div>
            `).join('')}
            <div class="stat-item">
              <span class="stat-value">${securityRelTypes.reduce((sum, rel) => sum + relAnalysis[rel], 0)}</span>
              <span class="stat-label">Total security rels</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>📖 Semantic Rel Attributes</h4>
          <div class="stat-grid">
            ${semanticRelTypes.map(rel => `
            <div class="stat-item">
              <span class="stat-value">${relAnalysis[rel]}</span>
              <span class="stat-label">rel="${rel}"</span>
            </div>
            `).join('')}
            <div class="stat-item">
              <span class="stat-value">${semanticRelTypes.reduce((sum, rel) => sum + relAnalysis[rel], 0)}</span>
              <span class="stat-label">Total semantic rels</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>🧭 Navigation Rel Attributes</h4>
          <div class="stat-grid">
            ${navigationRelTypes.map(rel => `
            <div class="stat-item">
              <span class="stat-value">${relAnalysis[rel]}</span>
              <span class="stat-label">rel="${rel}"</span>
            </div>
            `).join('')}
            <div class="stat-item">
              <span class="stat-value">${navigationRelTypes.reduce((sum, rel) => sum + relAnalysis[rel], 0)}</span>
              <span class="stat-label">Total nav rels</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateEnhancedSecurityAnalysis(pageData) {
  if (!pageData || Object.keys(pageData).length === 0) return '';
  
  let serverTech = { technologies: new Map(), servers: new Map(), frameworks: new Map() };
  let securityHeaders = { csp: 0, hsts: 0, xfo: 0, xcto: 0, total: 0 };
  let technologyCounts = new Map();
  
  for (const [url, data] of Object.entries(pageData)) {
    const security = data.security || {};
    const technical = data.technical || {};
    
    // Server technology analysis
    if (technical.serverInfo?.technology) {
      const tech = technical.serverInfo.technology;
      if (tech.detected) {
        tech.detected.forEach(t => {
          technologyCounts.set(t, (technologyCounts.get(t) || 0) + 1);
        });
      }
      if (tech.server) serverTech.servers.set(tech.server, (serverTech.servers.get(tech.server) || 0) + 1);
    }
    
    // Security headers analysis
    if (security.headers) {
      if (security.headers.hasCSP) securityHeaders.csp++;
      if (security.headers.hasHSTS) securityHeaders.hsts++;
      if (security.headers.hasXFO) securityHeaders.xfo++;
      if (security.headers.hasXCTO) securityHeaders.xcto++;
      securityHeaders.total += security.headers.total || 0;
    }
  }
  
  const totalPages = Object.keys(pageData).length;
  const topTechnologies = Array.from(technologyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  return `
    <div class="analysis-section">
      <h3>🆕 Enhanced Security & Technology Analysis</h3>
      <div class="grid-2">
        <div class="stat-card">
          <h4>🛠️ Technology Stack Detection</h4>
          <div class="tech-list">
            ${topTechnologies.length > 0 ? 
              topTechnologies.map(([tech, count]) => `
                <div class="tech-item">
                  <span class="tech-name">${tech}</span>
                  <span class="tech-count">${count} page${count > 1 ? 's' : ''}</span>
                </div>
              `).join('') : 
              '<div class="no-data">No specific technologies detected</div>'
            }
          </div>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${technologyCounts.size}</span>
              <span class="stat-label">Unique technologies</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${serverTech.servers.size}</span>
              <span class="stat-label">Server types</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <h4>🔐 Advanced Security Headers</h4>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${securityHeaders.csp}</span>
              <span class="stat-label">CSP headers</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${securityHeaders.hsts}</span>
              <span class="stat-label">HSTS headers</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${securityHeaders.xfo}</span>
              <span class="stat-label">X-Frame-Options</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${securityHeaders.xcto}</span>
              <span class="stat-label">X-Content-Type</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${Math.round(securityHeaders.total/totalPages)}</span>
              <span class="stat-label">Avg headers/page</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${Math.round(((securityHeaders.csp + securityHeaders.hsts + securityHeaders.xfo + securityHeaders.xcto)/(totalPages*4))*100)}%</span>
              <span class="stat-label">Security coverage</span>
            </div>
          </div>
        </div>
      </div>
      <style>
        .tech-list {
          margin-bottom: 15px;
        }
        .tech-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          margin: 4px 0;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 3px solid #007bff;
        }
        .tech-name {
          font-weight: 600;
          color: #2c3e50;
        }
        .tech-count {
          font-size: 0.9em;
          color: #6c757d;
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .no-data {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          padding: 20px;
        }
      </style>
    </div>
  `;
}


// Run if called directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename || process.argv[1].endsWith('data-analyzer.js')) {
    console.log('🔍 Starting Data Analyzer...');
    main();
}
