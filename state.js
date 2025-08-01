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

export function saveState(DOMAIN_FOLDER, STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks) {
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
    telLinks: serializeMap(telLinks)
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function loadState(STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks) {
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
  
  return true;
}

export function printStats(stats, badRequests, externalLinks, mailtoLinks, telLinks) {
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
  let countOK = 0, countBroken = 0, countTimeout = 0;

  for (const [href, data] of Object.entries(externalLinks)) {
    const status = data.status;
    if (typeof status === 'number' && status >= 200 && status < 300) countOK++;
    else if (status === 'TIMEOUT') countTimeout++;
    else countBroken++;

    console.log(`URL: ${href}`);
    console.log(`  Status: ${status}`);
    console.log(`  Linked from: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('--- External Link Summary ---');
  console.log(`✅ OK: ${countOK}`);
  console.log(`❌ Broken: ${countBroken}`);
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
}
