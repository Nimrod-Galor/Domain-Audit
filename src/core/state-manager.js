// State management for domain link audit
import fs from 'fs';

export function serializeMap(mapObj) {
  const out = {};
  for (const [key, value] of Object.entries(mapObj)) {
    out[key] = {
      ...value,
      anchors: value.anchors ? [...value.anchors] : undefined,
      sources: value.sources ? [...value.sources] : undefined
    };
  }
  return out;
}

export function restoreMap(targetMap, savedMap) {
  for (const [key, value] of Object.entries(savedMap)) {
    targetMap[key] = {
      ...value,
      anchors: value.anchors ? new Set(value.anchors) : undefined,
      sources: value.sources ? new Set(value.sources) : undefined
    };
  }
}

export function saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager) {
  if (!fs.existsSync(DOMAIN_FOLDER)) {
    fs.mkdirSync(DOMAIN_FOLDER, { recursive: true });
  }
  const state = {
    visited: [...visited],
    queue: [...queue],
    stats: serializeMap(stats),
    badRequests: serializeMap(badRequests),
    externalLinks: serializeMap(externalLinks),
    mailtoLinks: serializeMap(mailtoLinks),
    telLinks: serializeMap(telLinks),
    // pageData is now handled separately by ChunkedPageDataManager
    pageDataSize: pageDataManager.size
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function loadState(STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager) {
  if (!fs.existsSync(STATE_FILE)) return false;
  const raw = fs.readFileSync(STATE_FILE, 'utf-8');
  const state = JSON.parse(raw);
  
  visited.clear();
  for (const url of state.visited) visited.add(url);
  
  queue.clear();
  for (const url of state.queue) queue.add(url);
  
  restoreMap(stats, state.stats);
  restoreMap(badRequests, state.badRequests);
  restoreMap(externalLinks, state.externalLinks);
  if (state.mailtoLinks) {
    restoreMap(mailtoLinks, state.mailtoLinks);
  }
  if (state.telLinks) {
    restoreMap(telLinks, state.telLinks);
  }
  
  // pageData is now handled by ChunkedPageDataManager
  return true;
}

export function printStats(stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager) {
  console.log('\n--- Internal Link Statistics ---\n');
  for (const [href, data] of Object.entries(stats)) {
    console.log(`URL: ${href}`);
    console.log(`  Occurrences: ${data.count}`);
    console.log(`  Anchors: ${Array.from(data.anchors).join(' | ')}`);
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('\n--- Bad Internal Requests ---\n');
  for (const [href, data] of Object.entries(badRequests)) {
    console.log(`URL: ${href}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Linked from: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('\n--- External Link Status ---\n');

  // Enhanced status display with manual check recommendations
  let countOK = 0, countBroken = 0, countTimeout = 0, countManualCheck = 0;
  
  for (const [href, data] of Object.entries(externalLinks)) {
    const status = data.status;
    
    // Categorize status and identify manual check candidates
    let needsManualCheck = false;
    if (typeof status === 'number' && status >= 200 && status < 300) {
      countOK++;
    } else if (status === 'TIMEOUT') {
      countTimeout++;
    } else {
      countBroken++;
      
      // 403 Forbidden - suggest manual check as it might be bot protection
      if (status === 403) {
        needsManualCheck = true;
        countManualCheck++;
        
        // Additional context for known bot protection patterns
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

    console.log(`URL: ${href}`);
    console.log(`  Status: ${status}`);
    if (needsManualCheck) {
      console.log(`  ⚠️  Manual Check Recommended: May work in browser despite 403 status`);
    }
    console.log(`  Linked from: ${Array.from(data.sources).join(', ')}`);
  }

  console.log('--- External Link Summary ---');
  console.log(`✅ OK: ${countOK}`);
  console.log(`❌ Broken: ${countBroken}`);
  if (countManualCheck > 0) {
    console.log(`⚠️  Manual Check Needed: ${countManualCheck} (403 status may work in browser)`);
  }
  console.log(`⏱ Timeout: ${countTimeout}`);

  console.log('\n--- Email Links (mailto:) ---\n');
  for (const [href, data] of Object.entries(mailtoLinks)) {
    console.log(`EMAIL: ${href}`);
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('\n--- Phone Links (tel:) ---\n');
  for (const [href, data] of Object.entries(telLinks)) {
    console.log(`PHONE: ${href}`);
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  // Display comprehensive page data summary
  if (pageDataManager.size > 0) {
    console.log('\n--- Page Data Summary ---\n');
    
    let totalResponseTime = 0;
    let totalPageSize = 0;
    let pagesWithTitle = 0;
    let pagesWithMetaDesc = 0;
    let totalImages = 0;
    let imagesWithoutAlt = 0;
    let totalWordCount = 0;
    let httpsPages = 0;
    
    // Enhanced data tracking
    let pagesWithRobots = 0;
    let pagesWithLang = 0;
    let pagesWithFavicon = 0;
    let technologiesDetected = new Set();
    let totalRelAttributes = 0;
    let securityHeadersCount = 0;
    
    for (const [url, data] of pageDataManager.entries()) {
      totalResponseTime += data.responseTime || 0;
      totalPageSize += data.pageSize || 0;
      totalWordCount += data.content?.wordCount || 0;
      
      if (data.seo?.title?.text) pagesWithTitle++;
      if (data.seo?.metaDescription?.text) pagesWithMetaDesc++;
      if (data.content?.images) {
        totalImages += data.content.images.total || 0;
        imagesWithoutAlt += data.content.images.withoutAlt || 0;
      }
      if (data.security?.https?.enabled || data.performance?.url?.startsWith('https://')) httpsPages++;
      
      // Enhanced SEO features
      if (data.seo?.robotsDirectives?.directives?.length > 0) pagesWithRobots++;
      if (data.seo?.language?.htmlLang) pagesWithLang++;
      if (data.seo?.favicon?.count > 0) pagesWithFavicon++;
      
      // Technology detection
      if (data.technical?.serverInfo?.technology?.detected) {
        data.technical.serverInfo.technology.detected.forEach(tech => technologiesDetected.add(tech));
      }
      
      // Link rel attributes
      if (data.linkAnalysis?.relAttributes) {
        totalRelAttributes += Object.values(data.linkAnalysis.relAttributes).reduce((sum, count) => sum + count, 0);
      }
      
      // Security headers
      if (data.security?.headers?.total) {
        securityHeadersCount += data.security.headers.total;
      }
    }
    
    const pageCount = pageDataManager.size;
    const avgResponseTime = pageCount > 0 ? Math.round(totalResponseTime / pageCount) : 0;
    const avgPageSize = pageCount > 0 ? Math.round(totalPageSize / pageCount) : 0;
    const avgWordCount = pageCount > 0 ? Math.round(totalWordCount / pageCount) : 0;
    const avgSecurityHeaders = pageCount > 0 ? Math.round(securityHeadersCount / pageCount) : 0;
    
    console.log(`📊 Analyzed ${pageCount} pages:`);
    console.log(`⚡ Average response time: ${avgResponseTime}ms`);
    console.log(`📏 Average page size: ${(avgPageSize / 1024).toFixed(1)}KB`);
    console.log(`📝 Average word count: ${avgWordCount} words`);
    console.log(`🔍 Pages with titles: ${pagesWithTitle}/${pageCount} (${(pagesWithTitle/pageCount*100).toFixed(1)}%)`);
    console.log(`📋 Pages with meta descriptions: ${pagesWithMetaDesc}/${pageCount} (${(pagesWithMetaDesc/pageCount*100).toFixed(1)}%)`);
    console.log(`🖼️  Images without alt text: ${imagesWithoutAlt}/${totalImages} (${totalImages > 0 ? (imagesWithoutAlt/totalImages*100).toFixed(1) : 0}%)`);
    console.log(`🔒 HTTPS pages: ${httpsPages}/${pageCount} (${(httpsPages/pageCount*100).toFixed(1)}%)`);
    
    // Enhanced features summary
    console.log('\n🆕 Enhanced Features Detected:');
    console.log(`🤖 Pages with robots directives: ${pagesWithRobots}/${pageCount} (${(pagesWithRobots/pageCount*100).toFixed(1)}%)`);
    console.log(`🌐 Pages with language attributes: ${pagesWithLang}/${pageCount} (${(pagesWithLang/pageCount*100).toFixed(1)}%)`);
    console.log(`🎯 Pages with favicons: ${pagesWithFavicon}/${pageCount} (${(pagesWithFavicon/pageCount*100).toFixed(1)}%)`);
    console.log(`🛠️  Technologies detected: ${technologiesDetected.size} (${Array.from(technologiesDetected).join(', ') || 'None'})`);
    console.log(`🔗 Total rel attributes found: ${totalRelAttributes}`);
    console.log(`🛡️  Average security headers per page: ${avgSecurityHeaders}`);
    
    console.log('\n💾 Detailed page data saved to state file for analysis');
  }
}
