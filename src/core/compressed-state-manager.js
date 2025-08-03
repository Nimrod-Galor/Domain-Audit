/**
 * ============================================================================
 * COMPRESSED STATE MANAGER
 * ============================================================================
 * 
 * Enhanced state manager with automatic compression for large JSON state files.
 * Uses gzip compression to reduce disk space while maintaining full compatibility
 * with existing audit tools.
 * 
 * Features:
 * - Automatic compression/decompression for .json.gz files
 * - Backward compatibility with uncompressed .json files
 * - Transparent compression based on file size threshold
 * - Error handling and fallback mechanisms
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Configuration
const COMPRESSION_THRESHOLD = 10 * 1024; // 10KB - compress files larger than this
const COMPRESSION_LEVEL = 6; // zlib compression level (1-9, 6 is good balance)

/**
 * Serialize map objects for JSON storage
 */
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

/**
 * Restore map objects from JSON storage
 */
export function restoreMap(targetMap, savedMap) {
  for (const [key, value] of Object.entries(savedMap)) {
    targetMap[key] = {
      ...value,
      anchors: value.anchors ? new Set(value.anchors) : undefined,
      sources: value.sources ? new Set(value.sources) : undefined
    };
  }
}

/**
 * Determine if file should be compressed based on size
 */
function shouldCompress(jsonString) {
  return Buffer.byteLength(jsonString, 'utf8') > COMPRESSION_THRESHOLD;
}

/**
 * Get compressed and uncompressed file paths
 */
function getFilePaths(stateFile) {
  const basePath = stateFile.replace(/\.json(\.gz)?$/, '');
  return {
    compressed: `${basePath}.json.gz`,
    uncompressed: `${basePath}.json`
  };
}

/**
 * Save state with automatic compression
 */
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
    pageDataSize: pageDataManager.size,
    // Add metadata for compression info
    _compression: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  };

  const jsonString = JSON.stringify(state, null, 2);
  const { compressed, uncompressed } = getFilePaths(STATE_FILE);

  try {
    if (shouldCompress(jsonString)) {
      // Save compressed version
      const compressedData = zlib.gzipSync(Buffer.from(jsonString, 'utf8'), {
        level: COMPRESSION_LEVEL,
        chunkSize: 32 * 1024 // 32KB chunks for better performance
      });
      
      fs.writeFileSync(compressed, compressedData);
      
      // Clean up old uncompressed file if it exists
      if (fs.existsSync(uncompressed)) {
        fs.unlinkSync(uncompressed);
      }
      
      const originalSize = Buffer.byteLength(jsonString, 'utf8');
      const compressedSize = compressedData.length;
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      console.log(`💾 State saved with compression: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${savings}% savings)`);
    } else {
      // Save uncompressed for smaller files
      fs.writeFileSync(uncompressed, jsonString);
      
      // Clean up old compressed file if it exists
      if (fs.existsSync(compressed)) {
        fs.unlinkSync(compressed);
      }
      
      console.log(`💾 State saved uncompressed: ${(Buffer.byteLength(jsonString, 'utf8')/1024).toFixed(1)}KB`);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to save compressed state, falling back to uncompressed: ${error.message}`);
    fs.writeFileSync(uncompressed, jsonString);
  }
}

/**
 * Load state with automatic decompression
 */
export function loadState(STATE_FILE, visited, queue, stats, badRequests, externalLinks, mailtoLinks, telLinks, pageDataManager) {
  const { compressed, uncompressed } = getFilePaths(STATE_FILE);
  
  let jsonString = null;
  let sourceFile = null;

  try {
    // Try to load compressed version first
    if (fs.existsSync(compressed)) {
      const compressedData = fs.readFileSync(compressed);
      jsonString = zlib.gunzipSync(compressedData).toString('utf8');
      sourceFile = compressed;
      console.log(`📂 Loaded compressed state: ${(compressedData.length/1024).toFixed(1)}KB compressed`);
    }
    // Fall back to uncompressed version
    else if (fs.existsSync(uncompressed)) {
      jsonString = fs.readFileSync(uncompressed, 'utf-8');
      sourceFile = uncompressed;
      console.log(`📂 Loaded uncompressed state: ${(Buffer.byteLength(jsonString, 'utf8')/1024).toFixed(1)}KB`);
    }
    // No state file found
    else {
      return false;
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load state from ${sourceFile}: ${error.message}`);
    
    // Try the other file format as backup
    try {
      if (sourceFile === compressed && fs.existsSync(uncompressed)) {
        jsonString = fs.readFileSync(uncompressed, 'utf-8');
        console.log(`📂 Loaded backup uncompressed state: ${(Buffer.byteLength(jsonString, 'utf8')/1024).toFixed(1)}KB`);
      } else if (sourceFile === uncompressed && fs.existsSync(compressed)) {
        const compressedData = fs.readFileSync(compressed);
        jsonString = zlib.gunzipSync(compressedData).toString('utf8');
        console.log(`📂 Loaded backup compressed state: ${(compressedData.length/1024).toFixed(1)}KB compressed`);
      } else {
        return false;
      }
    } catch (backupError) {
      console.error(`❌ Failed to load any state file: ${backupError.message}`);
      return false;
    }
  }

  try {
    const state = JSON.parse(jsonString);
    
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
  } catch (parseError) {
    console.error(`❌ Failed to parse state JSON: ${parseError.message}`);
    return false;
  }
}

/**
 * Migrate existing uncompressed state files to compressed format
 */
export function migrateStateFiles(auditDir) {
  if (!fs.existsSync(auditDir)) {
    return { migrated: 0, errors: 0, totalSaved: 0 };
  }

  const stateFiles = fs.readdirSync(auditDir, { recursive: true })
    .filter(file => file.endsWith('-crawl-state.json') && !file.endsWith('.gz'))
    .map(file => path.resolve(auditDir, file));

  let migrated = 0;
  let errors = 0;
  let totalSaved = 0;

  console.log(`🔄 Migrating ${stateFiles.length} state files to compressed format...`);

  for (const filePath of stateFiles) {
    try {
      const jsonString = fs.readFileSync(filePath, 'utf-8');
      
      if (shouldCompress(jsonString)) {
        const originalSize = Buffer.byteLength(jsonString, 'utf8');
        const compressedData = zlib.gzipSync(Buffer.from(jsonString, 'utf8'), {
          level: COMPRESSION_LEVEL,
          chunkSize: 32 * 1024
        });
        
        const compressedPath = filePath + '.gz';
        fs.writeFileSync(compressedPath, compressedData);
        fs.unlinkSync(filePath); // Remove original
        
        const saved = originalSize - compressedData.length;
        totalSaved += saved;
        migrated++;
        
        console.log(`✅ Migrated: ${path.basename(filePath)} (${(saved/1024).toFixed(1)}KB saved)`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to migrate ${path.basename(filePath)}: ${error.message}`);
      errors++;
    }
  }

  if (migrated > 0) {
    console.log(`🎉 Migration complete: ${migrated} files migrated, ${(totalSaved/1024).toFixed(1)}KB total saved`);
  }

  return { migrated, errors, totalSaved };
}

/**
 * Get compression statistics for audit directories
 */
export function getCompressionStats(auditDir) {
  if (!fs.existsSync(auditDir)) {
    return null;
  }

  const stats = {
    compressed: { count: 0, totalSize: 0 },
    uncompressed: { count: 0, totalSize: 0 },
    potentialSavings: 0
  };

  const files = fs.readdirSync(auditDir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.resolve(auditDir, file);
    const stat = fs.statSync(filePath);
    
    if (file.endsWith('-crawl-state.json.gz')) {
      stats.compressed.count++;
      stats.compressed.totalSize += stat.size;
    } else if (file.endsWith('-crawl-state.json')) {
      stats.uncompressed.count++;
      stats.uncompressed.totalSize += stat.size;
      
      // Estimate potential savings (typically 70-80% for JSON with repetitive data)
      stats.potentialSavings += stat.size * 0.75;
    }
  }

  return stats;
}

/**
 * Print compression statistics
 */
export function printCompressionStats(auditDir) {
  const stats = getCompressionStats(auditDir);
  
  if (!stats) {
    console.log('📊 No audit directory found for compression statistics');
    return;
  }

  console.log('\n📊 Compression Statistics');
  console.log('═'.repeat(50));
  console.log(`Compressed files: ${stats.compressed.count} (${(stats.compressed.totalSize/1024).toFixed(1)}KB)`);
  console.log(`Uncompressed files: ${stats.uncompressed.count} (${(stats.uncompressed.totalSize/1024).toFixed(1)}KB)`);
  
  if (stats.potentialSavings > 0) {
    console.log(`Potential savings: ${(stats.potentialSavings/1024).toFixed(1)}KB`);
    console.log(`💡 Run migration to compress uncompressed files`);
  }
  
  if (stats.compressed.count > 0 && stats.uncompressed.count > 0) {
    const totalCurrent = stats.compressed.totalSize + stats.uncompressed.totalSize;
    const totalIfAllCompressed = stats.compressed.totalSize + (stats.uncompressed.totalSize * 0.25);
    const possibleSavings = ((totalCurrent - totalIfAllCompressed) / totalCurrent * 100).toFixed(1);
    console.log(`Total possible space savings: ${possibleSavings}%`);
  }
}

// Legacy exports for backward compatibility
export { serializeMap as originalSerializeMap, restoreMap as originalRestoreMap };

// Re-export the print function from original state manager
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
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('\n--- External Link Status ---\n');
  for (const [href, data] of Object.entries(externalLinks)) {
    console.log(`URL: ${href}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('\n--- Email Links ---\n');
  for (const [href, data] of Object.entries(mailtoLinks)) {
    console.log(`Email: ${href}`);
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log('\n--- Phone Links ---\n');
  for (const [href, data] of Object.entries(telLinks)) {
    console.log(`Phone: ${href}`);
    console.log(`  Found in: ${Array.from(data.sources).join(', ')}\n`);
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total pages data: ${(pageDataManager.size / 1024).toFixed(2)} KB`);
}
