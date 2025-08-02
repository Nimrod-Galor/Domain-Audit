// HTML report generation for domain link audit
import fs from 'fs';

// Safe URL decoder that handles malformed URLs
function safeDecodeURIComponent(url) {
  try {
    return decodeURIComponent(url);
  } catch (e) {
    return url; // Return original if decoding fails
  }
}

// Configuration constants
const ACCORDION_THRESHOLD = 3;

export function generateSummarySection(stats, externalLinks, badRequests, mailtoLinks, telLinks) {
  // Count internal links
  const internalLinksCount = Object.keys(stats).length;
  
  // Count external links
  const externalLinksCount = Object.keys(externalLinks).length;
  
  // Count error links (bad requests + broken/timeout external links)
  const badRequestsCount = Object.keys(badRequests).length;
  let brokenExternalCount = 0;
  for (const data of Object.values(externalLinks)) {
    const status = data.status;
    if (!(typeof status === 'number' && status >= 200 && status < 300)) {
      brokenExternalCount++;
    }
  }
  const totalErrorLinks = badRequestsCount + brokenExternalCount;
  
  // Count mailto and tel links
  const mailtoLinksCount = Object.keys(mailtoLinks).length;
  const telLinksCount = Object.keys(telLinks).length;
  
  return `
    <div class="summary-container">
      <h2 class="summary-title">📊 Link Summary</h2>
      <div class="summary-grid">
        <a href="#internal-links" class="summary-card-link">
          <div class="summary-card summary-card-internal">
            <div class="summary-number summary-number-internal">${internalLinksCount}</div>
            <div class="summary-label">Internal Links</div>
          </div>
        </a>
        <a href="#external-links" class="summary-card-link">
          <div class="summary-card summary-card-external">
            <div class="summary-number summary-number-external">${externalLinksCount}</div>
            <div class="summary-label">External Links</div>
          </div>
        </a>
        <a href="#error-links" class="summary-card-link">
          <div class="summary-card ${totalErrorLinks > 0 ? 'summary-card-error-red' : 'summary-card-error-green'}">
            <div class="summary-number ${totalErrorLinks > 0 ? 'summary-number-error-red' : 'summary-number-error-green'}">${totalErrorLinks}</div>
            <div class="summary-label">Error Links</div>
          </div>
        </a>
        <a href="#email-links" class="summary-card-link">
          <div class="summary-card summary-card-email">
            <div class="summary-number summary-number-email">${mailtoLinksCount}</div>
            <div class="summary-label">Email Links</div>
          </div>
        </a>
        <a href="#phone-links" class="summary-card-link">
          <div class="summary-card summary-card-phone">
            <div class="summary-number summary-number-phone">${telLinksCount}</div>
            <div class="summary-label">Phone Links</div>
          </div>
        </a>
      </div>
    </div>
  `;
}

export function generateInternalLinksTable(stats) {
  let rows = '';
  let rowIndex = 0;
  for (const [href, data] of Object.entries(stats)) {
    const sources = Array.from(data.sources);
    const anchors = Array.from(data.anchors);
    
    // Check if either column needs accordion
    const needsAccordion = sources.length > ACCORDION_THRESHOLD || anchors.length > ACCORDION_THRESHOLD;
    const rowId = `row-${rowIndex}`;
    
    const sourcesHtml = `<div class="accordion-toggle" onclick="toggleRowAccordions('${rowId}')">Show ${sources.length} sources</div>
         <div class="accordion-content" data-row="${rowId}">
           <ul class="source-list">
             ${sources.map(source => `<li><a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a></li>`).join('')}
           </ul>
         </div>`
      
    const anchorsHtml = `<div class="accordion-toggle" onclick="toggleRowAccordions('${rowId}')">Show ${anchors.length} anchors</div>
         <div class="accordion-content" data-row="${rowId}">
           <ul class="source-list">
             ${anchors.map(anchor => `<li>${anchor || '<em>empty</em>'}</li>`).join('')}
           </ul>
         </div>`
      
    rows += `
      <tr>
        <td><a href="${href}" target="_blank" rel="noopener">${safeDecodeURIComponent(href)}</a></td>
        <td>${data.count}</td>
        <td>${anchorsHtml}</td>
        <td>${sourcesHtml}</td>
      </tr>
    `;
    rowIndex++;
  }
  return `<table>
    <thead><tr><th>URL</th><th>Occurrences</th><th>Anchors</th><th>Found In</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function generateBadRequestsTable(badRequests) {
  let rows = '';
  for (const [href, data] of Object.entries(badRequests)) {
    const sources = Array.from(data.sources);
    const sourcesHtml = sources.length > ACCORDION_THRESHOLD 
      ? `<div class="accordion-toggle" onclick="toggleAccordion(this)">Show ${sources.length} sources</div>
         <div class="accordion-content">
           <ul class="source-list">
             ${sources.map(source => `<li><a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a></li>`).join('')}
           </ul>
         </div>`
      : sources.map(source => `<a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a>`).join(', ');
      
    rows += `
      <tr>
        <td><a href="${href}" target="_blank" rel="noopener">${safeDecodeURIComponent(href)}</a></td>
        <td>${data.status}</td>
        <td>${sourcesHtml}</td>
      </tr>
    `;
  }
  return `<table>
    <thead><tr><th>URL</th><th>Status</th><th>Linked From</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function generateExternalLinksTable(externalLinks) {
  let rows = '';
  for (const [href, data] of Object.entries(externalLinks)) {
    let statusClass = '';
    let statusDisplay = data.status;
    let manualCheckNote = '';
    
    if (typeof data.status === 'number' && data.status >= 200 && data.status < 300) {
      statusClass = 'status-ok';
    } else if (data.status === 'TIMEOUT') {
      statusClass = 'status-timeout';
    } else {
      statusClass = 'status-broken';
      
      // Check for bot protection patterns - suggest manual check for all 403s
      if (data.status === 403) {
        manualCheckNote = '<br><span class="manual-check-note">⚠️ Manual check recommended - may work in browser</span>';
        statusClass = 'status-manual-check';
        
        // Additional context for known patterns
        const hasKnownBotProtection = href.includes('twitter.com') || 
                                     href.includes('x.com') || 
                                     href.includes('facebook.com') ||
                                     href.includes('instagram.com') ||
                                     href.includes('linkedin.com') ||
                                     href.includes('discord.com') ||
                                     href.includes('cloudflare') ||
                                     href.includes('help.') ||
                                     href.includes('support.');
      }
    }

    const sources = Array.from(data.sources);
    const sourcesHtml = sources.length > ACCORDION_THRESHOLD 
      ? `<div class="accordion-toggle" onclick="toggleAccordion(this)">Show ${sources.length} sources</div>
         <div class="accordion-content">
           <ul class="source-list">
             ${sources.map(source => `<li><a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a></li>`).join('')}
           </ul>
         </div>`
      : sources.map(source => `<a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a>`).join(', ');

    rows += `
      <tr>
        <td><a href="${href}" target="_blank" rel="noopener">${safeDecodeURIComponent(href)}</a></td>
        <td class="${statusClass}">${statusDisplay}${manualCheckNote}</td>
        <td>${sourcesHtml}</td>
      </tr>
    `;
  }
  return `<table>
    <thead><tr><th>URL</th><th>Status</th><th>Linked From</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function generateExternalSummary(externalLinks) {
  let countOK = 0, countBroken = 0, countTimeout = 0, countManualCheck = 0;

  for (const [href, data] of Object.entries(externalLinks)) {
    const status = data.status;
    if (typeof status === 'number' && status >= 200 && status < 300) {
      countOK++;
    } else if (status === 'TIMEOUT') {
      countTimeout++;
    } else {
      countBroken++;
      
      // Count all 403s as potential manual checks
      if (status === 403) {
        countManualCheck++;
      }
    }
  }

  let summaryHtml = `
    <p>✅ OK: ${countOK}</p>
    <p>❌ Broken: ${countBroken}</p>`;
  
  if (countManualCheck > 0) {
    summaryHtml += `
    <p class="manual-check-summary">⚠️ Manual Check Needed: ${countManualCheck} <small>(403 status may work in browser)</small></p>`;
  }
  
  summaryHtml += `
    <p>⏱ Timeout: ${countTimeout}</p>`;

  return summaryHtml;
}

export function generateMailtoLinksTable(mailtoLinks) {
  let rows = '';
  for (const [href, data] of Object.entries(mailtoLinks)) {
    const sources = Array.from(data.sources);
    const sourcesHtml = sources.length > ACCORDION_THRESHOLD 
      ? `<div class="accordion-toggle" onclick="toggleAccordion(this)">Show ${sources.length} sources</div>
         <div class="accordion-content">
           <ul class="source-list">
             ${sources.map(source => `<li><a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a></li>`).join('')}
           </ul>
         </div>`
      : sources.map(source => `<a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a>`).join(', ');

    rows += `
      <tr>
        <td><a href="${href}" target="_blank" rel="noopener">${safeDecodeURIComponent(href)}</a></td>
        <td>${sourcesHtml}</td>
      </tr>
    `;
  }
  return `<table>
    <thead><tr><th>Email Link</th><th>Found In</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function generateTelLinksTable(telLinks) {
  let rows = '';
  for (const [href, data] of Object.entries(telLinks)) {
    const sources = Array.from(data.sources);
    const sourcesHtml = sources.length > 3 
      ? `<div class="accordion-toggle" onclick="toggleAccordion(this)">Show ${sources.length} sources</div>
         <div class="accordion-content">
           <ul class="source-list">
             ${sources.map(source => `<li><a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a></li>`).join('')}
           </ul>
         </div>`
      : sources.map(source => `<a href="${source}" target="_blank">${safeDecodeURIComponent(source)}</a>`).join(', ');

    rows += `
      <tr>
        <td><a href="${href}" target="_blank" rel="noopener">${safeDecodeURIComponent(href)}</a></td>
        <td>${sourcesHtml}</td>
      </tr>
    `;
  }
  return `<table>
    <thead><tr><th>Phone Link</th><th>Found In</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function saveHtmlReport({
  filename,
  DOMAIN,
  stats,
  badRequests,
  externalLinks,
  mailtoLinks,
  telLinks,
  timestamp,
  durationSec
}) {
  const html = `
    <html>
    <head>
      <title>Crawl Report for ${DOMAIN}</title>
      <link rel="stylesheet" type="text/css" href="../../styles.css">
    </head>
    <body>
      <h1>Crawl Report for ${DOMAIN}</h1>
      
      ${generateSummarySection(stats, externalLinks, badRequests, mailtoLinks, telLinks)}

      <h2 id="internal-links">Internal Link Statistics</h2>
      ${generateInternalLinksTable(stats)}

      <h2 id="error-links">Bad Internal Requests</h2>
      ${generateBadRequestsTable(badRequests)}

      <h2 id="external-links">External Link Status</h2>
      ${generateExternalLinksTable(externalLinks)}

      <h2>External Link Summary</h2>
      ${generateExternalSummary(externalLinks)}
      
      <h2 id="email-links">Email Links (mailto:)</h2>
      ${generateMailtoLinksTable(mailtoLinks)}
      
      <h2 id="phone-links">Phone Links (tel:)</h2>
      ${generateTelLinksTable(telLinks)}
      
      <div class="report-footer">
        Report generated: <b>${timestamp}</b> | Duration: <b>${durationSec}s</b>
      </div>
      
      <script>
        function toggleAccordion(element) {
          const content = element.nextElementSibling;
          const isOpen = content.classList.contains('show');
          
          if (isOpen) {
            content.classList.remove('show');
            element.classList.remove('open');
          } else {
            content.classList.add('show');
            element.classList.add('open');
          }
        }
        
        function toggleRowAccordions(rowId) {
          const accordionContents = document.querySelectorAll('[data-row="' + rowId + '"]');
          const accordionToggles = [];
          
          // Find all toggle buttons for this row
          accordionContents.forEach(content => {
            const toggle = content.previousElementSibling;
            if (toggle && toggle.classList.contains('accordion-toggle')) {
              accordionToggles.push(toggle);
            }
          });
          
          // Check if any are currently open
          const isAnyOpen = Array.from(accordionContents).some(content => 
            content.classList.contains('show')
          );
          
          // Toggle all accordions in this row to the same state
          accordionContents.forEach((content, index) => {
            const toggle = accordionToggles[index];
            if (isAnyOpen) {
              content.classList.remove('show');
              toggle.classList.remove('open');
            } else {
              content.classList.add('show');
              toggle.classList.add('open');
            }
          });
        }
      </script>
    </body>
    </html>
  `;

  fs.writeFileSync(filename, html, 'utf-8');
  console.log(`\n✅ HTML report saved to ${filename}`);
}
