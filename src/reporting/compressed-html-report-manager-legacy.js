/**
 * ============================================================================
 * COMPRESSED HTML REPORT MANAGER
 * ============================================================================
 * 
 * Handles compression and decompression of HTML audit report files to save
 * disk space while maintaining full functionality. HTML files are excellent
 * candidates for compression due to their repetitive structure and content.
 * 
 * Features:
 * - Automatic gzip compression for HTML files >5KB
 * - Transparent loading of both .html and .html.gz files
 * - Compression statistics and migration tools
 * - Backward compatibility with existing HTML files
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { 
  generateSummarySection, 
  generateInternalLinksTable, 
  generateBadRequestsTable, 
  generateExternalLinksTable, 
  generateExternalSummary, 
  generateMailtoLinksTable, 
  generateTelLinksTable 
} from './html-report-generator.js';

// Compression threshold - files larger than this will be compressed
const COMPRESSION_THRESHOLD = 5 * 1024; // 5KB

/**
 * Compressed HTML Report Manager
 * Handles saving and loading HTML reports with automatic compression
 */
export class CompressedHtmlReportManager {
  
  /**
   * Save HTML report with automatic compression
   * @param {string} filename - Path where to save the file
   * @param {string} htmlContent - HTML content to save
   * @param {Object} options - Additional options
   * @param {boolean} options.forceCompression - Force compression regardless of size
   * @param {boolean} options.forceUncompressed - Force uncompressed regardless of size
   * @returns {Object} Result with saved filename and compression info
   */
  static saveHtmlReport(filename, htmlContent, options = {}) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const contentSize = Buffer.byteLength(htmlContent, 'utf8');
      const shouldCompress = options.forceCompression || 
                           (!options.forceUncompressed && contentSize > COMPRESSION_THRESHOLD);

      if (shouldCompress) {
        // Compress and save as .html.gz
        const compressed = zlib.gzipSync(htmlContent);
        const compressedFilename = filename.endsWith('.html.gz') ? filename : filename + '.gz';
        
        fs.writeFileSync(compressedFilename, compressed);
        
        const compressionRatio = ((contentSize - compressed.length) / contentSize * 100).toFixed(1);
        
        console.log(`✅ Compressed HTML report saved to ${compressedFilename}`);
        console.log(`📊 Compression: ${(contentSize/1024).toFixed(1)}KB → ${(compressed.length/1024).toFixed(1)}KB (${compressionRatio}% saved)`);
        
        return {
          filename: compressedFilename,
          originalSize: contentSize,
          compressedSize: compressed.length,
          compressionRatio: parseFloat(compressionRatio),
          compressed: true
        };
      } else {
        // Save uncompressed
        const uncompressedFilename = filename.endsWith('.html.gz') ? filename.replace('.html.gz', '.html') : filename;
        
        fs.writeFileSync(uncompressedFilename, htmlContent, 'utf-8');
        
        console.log(`✅ HTML report saved to ${uncompressedFilename}`);
        
        return {
          filename: uncompressedFilename,
          originalSize: contentSize,
          compressedSize: contentSize,
          compressionRatio: 0,
          compressed: false
        };
      }
    } catch (error) {
      console.error('❌ Error saving HTML report:', error);
      throw error;
    }
  }

  /**
   * Load HTML report with automatic decompression
   * @param {string} filename - Path to the HTML file (.html or .html.gz)
   * @returns {string|null} HTML content or null if file doesn't exist
   */
  static loadHtmlReport(filename) {
    try {
      // First try the exact filename
      if (fs.existsSync(filename)) {
        if (filename.endsWith('.gz')) {
          // Decompress gzipped file
          const compressed = fs.readFileSync(filename);
          return zlib.gunzipSync(compressed).toString('utf-8');
        } else {
          // Read uncompressed file
          return fs.readFileSync(filename, 'utf-8');
        }
      }

      // If exact filename doesn't exist, try compressed version
      const compressedFilename = filename.endsWith('.html') ? filename + '.gz' : filename;
      if (fs.existsSync(compressedFilename)) {
        const compressed = fs.readFileSync(compressedFilename);
        return zlib.gunzipSync(compressed).toString('utf-8');
      }

      // Try uncompressed version if we were looking for compressed
      const uncompressedFilename = filename.endsWith('.html.gz') ? filename.replace('.html.gz', '.html') : filename;
      if (fs.existsSync(uncompressedFilename)) {
        return fs.readFileSync(uncompressedFilename, 'utf-8');
      }

      return null;
    } catch (error) {
      console.error('❌ Error loading HTML report:', error);
      return null;
    }
  }

  /**
   * Check if HTML report exists (either compressed or uncompressed)
   * @param {string} filename - Path to check
   * @returns {Object|null} File info or null if not found
   */
  static getReportInfo(filename) {
    try {
      // Check exact filename
      if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename);
        return {
          filename: filename,
          size: stats.size,
          compressed: filename.endsWith('.gz'),
          lastModified: stats.mtime
        };
      }

      // Check compressed version
      const compressedFilename = filename.endsWith('.html') ? filename + '.gz' : filename;
      if (fs.existsSync(compressedFilename)) {
        const stats = fs.statSync(compressedFilename);
        return {
          filename: compressedFilename,
          size: stats.size,
          compressed: true,
          lastModified: stats.mtime
        };
      }

      // Check uncompressed version
      const uncompressedFilename = filename.endsWith('.html.gz') ? filename.replace('.html.gz', '.html') : filename;
      if (fs.existsSync(uncompressedFilename)) {
        const stats = fs.statSync(uncompressedFilename);
        return {
          filename: uncompressedFilename,
          size: stats.size,
          compressed: false,
          lastModified: stats.mtime
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting report info:', error);
      return null;
    }
  }

  /**
   * Migrate existing HTML files to compressed format
   * @param {string} directory - Directory to scan for HTML files
   * @returns {Object} Migration results
   */
  static migrateHtmlFiles(directory) {
    try {
      if (!fs.existsSync(directory)) {
        return { migrated: 0, errors: 0, totalSaved: 0 };
      }

      const results = { migrated: 0, errors: 0, totalSaved: 0 };

      function processDirectory(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          
          if (file.isDirectory()) {
            processDirectory(fullPath);
          } else if (file.isFile() && file.name.endsWith('.html')) {
            // Check if compressed version already exists
            const compressedPath = fullPath + '.gz';
            if (fs.existsSync(compressedPath)) {
              continue; // Already compressed
            }

            try {
              const htmlContent = fs.readFileSync(fullPath, 'utf-8');
              const contentSize = Buffer.byteLength(htmlContent, 'utf8');

              if (contentSize > COMPRESSION_THRESHOLD) {
                const compressed = zlib.gzipSync(htmlContent);
                fs.writeFileSync(compressedPath, compressed);
                
                // Remove original file after successful compression
                fs.unlinkSync(fullPath);
                
                results.migrated++;
                results.totalSaved += (contentSize - compressed.length);
                
                console.log(`📦 Migrated: ${file.name} (${(contentSize/1024).toFixed(1)}KB → ${(compressed.length/1024).toFixed(1)}KB)`);
              }
            } catch (error) {
              console.error(`❌ Error migrating ${file.name}:`, error);
              results.errors++;
            }
          }
        }
      }

      processDirectory(directory);
      
      if (results.migrated > 0) {
        console.log(`\n🎉 HTML Migration Summary:`);
        console.log(`   Files migrated: ${results.migrated}`);
        console.log(`   Space saved: ${(results.totalSaved/1024).toFixed(1)}KB`);
        if (results.errors > 0) {
          console.log(`   Errors: ${results.errors}`);
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Error during HTML migration:', error);
      return { migrated: 0, errors: 1, totalSaved: 0 };
    }
  }

  /**
   * Get compression statistics for HTML files in a directory
   * @param {string} directory - Directory to analyze
   * @returns {Object|null} Compression statistics
   */
  static getCompressionStats(directory) {
    try {
      if (!fs.existsSync(directory)) {
        return null;
      }

      const stats = {
        compressed: { count: 0, totalSize: 0 },
        uncompressed: { count: 0, totalSize: 0 },
        potentialSavings: 0
      };

      function processDirectory(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          
          if (file.isDirectory()) {
            processDirectory(fullPath);
          } else if (file.isFile()) {
            if (file.name.endsWith('.html.gz')) {
              const fileStats = fs.statSync(fullPath);
              stats.compressed.count++;
              stats.compressed.totalSize += fileStats.size;
            } else if (file.name.endsWith('.html')) {
              const fileStats = fs.statSync(fullPath);
              stats.uncompressed.count++;
              stats.uncompressed.totalSize += fileStats.size;
              
              // Estimate potential savings (HTML typically compresses 60-70%)
              if (fileStats.size > COMPRESSION_THRESHOLD) {
                stats.potentialSavings += fileStats.size * 0.65;
              }
            }
          }
        }
      }

      processDirectory(directory);
      return stats;
    } catch (error) {
      console.error('❌ Error getting HTML compression stats:', error);
      return null;
    }
  }

  /**
   * Print compression statistics for HTML files
   * @param {string} directory - Directory to analyze
   */
  static printCompressionStats(directory) {
    const stats = this.getCompressionStats(directory);
    
    if (!stats) {
      console.log('📊 No HTML compression data available');
      return;
    }

    console.log('\n📄 HTML Report Compression Statistics:');
    console.log('═'.repeat(45));
    console.log(`📦 Compressed HTML files: ${stats.compressed.count} (${(stats.compressed.totalSize/1024).toFixed(1)}KB)`);
    console.log(`📄 Uncompressed HTML files: ${stats.uncompressed.count} (${(stats.uncompressed.totalSize/1024).toFixed(1)}KB)`);
    
    if (stats.potentialSavings > 0) {
      console.log(`💾 Potential HTML savings: ${(stats.potentialSavings/1024).toFixed(1)}KB`);
      const totalSize = stats.compressed.totalSize + stats.uncompressed.totalSize;
      const optimizedSize = stats.compressed.totalSize + (stats.uncompressed.totalSize * 0.35);
      const overallSavings = ((totalSize - optimizedSize) / totalSize * 100).toFixed(1);
      console.log(`📈 Potential space savings: ${overallSavings}%`);
    } else {
      console.log('✅ All HTML files are already optimally compressed!');
    }
  }
}

/**
 * Enhanced saveHtmlReport function with compression support
 * Drop-in replacement for the original saveHtmlReport function
 */
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
  // Generate the same HTML content as the original function
  const html = generateHtmlContent({
    DOMAIN,
    stats,
    badRequests,
    externalLinks,
    mailtoLinks,
    telLinks,
    timestamp,
    durationSec
  });

  // Save with compression
  return CompressedHtmlReportManager.saveHtmlReport(filename, html);
}

/**
 * Generate HTML content (extracted from original saveHtmlReport for reuse)
 */
function generateHtmlContent({
  DOMAIN,
  stats,
  badRequests,
  externalLinks,
  mailtoLinks,
  telLinks,
  timestamp,
  durationSec
}) {

  return `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Domain Link Audit Report - ${DOMAIN}</title>
      <link rel="stylesheet" href="../../styles.css">
    </head>
    <body>
      <header class="report-header">
        <h1>🔍 Domain Link Audit Report</h1>
        <div class="domain-info">
          <h2>📊 ${DOMAIN}</h2>
          <p class="audit-meta">
            Generated on: <strong>${timestamp}</strong><br>
            Duration: <strong>${durationSec.toFixed(1)} seconds</strong>
          </p>
        </div>
      </header>

      <main class="report-content">
        ${generateSummarySection(stats, externalLinks, badRequests, mailtoLinks, telLinks)}
        ${generateInternalLinksTable(stats)}
        ${generateBadRequestsTable(badRequests)}
        ${generateExternalLinksTable(externalLinks)}
        ${generateExternalSummary(externalLinks)}
        ${generateMailtoLinksTable(mailtoLinks)}
        ${generateTelLinksTable(telLinks)}
      </main>

      <footer class="report-footer">
        <p>Report generated by Domain Link Audit Tool v2.0</p>
        <p class="timestamp">Generated: ${timestamp}</p>
      </footer>

      <script>
        // Enhanced accordion functionality
        document.addEventListener('DOMContentLoaded', function() {
          const accordions = document.querySelectorAll('.accordion');
          
          accordions.forEach(accordion => {
            const toggle = accordion.querySelector('.accordion-toggle');
            const content = accordion.querySelector('.accordion-content');
            
            if (toggle && content) {
              toggle.addEventListener('click', function() {
                const isOpen = content.classList.contains('show');
                content.classList.toggle('show', !isOpen);
                toggle.classList.toggle('open', !isOpen);
              });
            }
          });
          
          // Add "Toggle All" functionality
          const toggleAllBtn = document.createElement('button');
          toggleAllBtn.textContent = 'Toggle All Sections';
          toggleAllBtn.className = 'toggle-all-btn';
          toggleAllBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; padding: 10px 15px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer;';
          
          document.body.appendChild(toggleAllBtn);
          
          toggleAllBtn.addEventListener('click', function() {
            const allContents = document.querySelectorAll('.accordion-content');
            const allToggles = document.querySelectorAll('.accordion-toggle');
            
            const isAnyOpen = Array.from(allContents).some(content => content.classList.contains('show'));
            
            allContents.forEach(content => content.classList.toggle('show', !isAnyOpen));
            allToggles.forEach(toggle => toggle.classList.toggle('open', !isAnyOpen));
          });
        });
      </script>
    </body>
    </html>
  `;
}
