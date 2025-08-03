/**
 * ============================================================================
 * COMPRESSED PAGE DATA MANAGER
 * ============================================================================
 * 
 * Enhanced chunked page data manager with automatic compression for large JSON files.
 * Uses gzip compression to reduce disk space while maintaining full compatibility
 * with existing audit tools.
 * 
 * Features:
 * - Automatic compression/decompression for .json.gz files
 * - Backward compatibility with uncompressed .json files
 * - Transparent compression based on file size threshold
 * - Memory caching for performance optimization
 * - Batch migration tools for existing page-data files
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Configuration
const COMPRESSION_THRESHOLD = 10 * 1024; // 10KB - compress files larger than this
const COMPRESSION_LEVEL = 6; // zlib compression level (1-9, 6 is good balance)

export class CompressedPageDataManager {
    /**
     * Creates a CompressedPageDataManager instance
     * @param {string} domainFolder - The audit/domain folder path (NOT the page-data folder itself)
     * @param {number} maxItemsInMemory - Maximum items to keep in memory cache
     */
    constructor(domainFolder, maxItemsInMemory = 100) {
        this.domainFolder = domainFolder;
        this.maxItemsInMemory = maxItemsInMemory;
        this.pageDataFolder = path.join(domainFolder, 'page-data');
        this.memoryCache = new Map();
        this.compressionStats = { saved: 0, total: 0 };
        this.initStorage();
    }

    initStorage() {
        if (!fs.existsSync(this.pageDataFolder)) {
            fs.mkdirSync(this.pageDataFolder, { recursive: true });
        }
    }

    /**
     * Get file paths for both compressed and uncompressed versions
     */
    getFilePaths(url) {
        const safeName = Buffer.from(url).toString('base64url');
        const basePath = path.join(this.pageDataFolder, safeName);
        return {
            compressed: `${basePath}.json.gz`,
            uncompressed: `${basePath}.json`
        };
    }

    /**
     * Determine if content should be compressed based on size
     */
    shouldCompress(jsonString) {
        return Buffer.byteLength(jsonString, 'utf8') > COMPRESSION_THRESHOLD;
    }

    /**
     * Save page data with automatic compression
     */
    set(url, data) {
        const jsonString = JSON.stringify(data);
        const { compressed, uncompressed } = this.getFilePaths(url);

        try {
            if (this.shouldCompress(jsonString)) {
                // Save compressed version
                const compressedData = zlib.gzipSync(Buffer.from(jsonString, 'utf8'), {
                    level: COMPRESSION_LEVEL,
                    chunkSize: 16 * 1024 // 16KB chunks for page data
                });
                
                fs.writeFileSync(compressed, compressedData);
                
                // Clean up old uncompressed file if it exists
                if (fs.existsSync(uncompressed)) {
                    fs.unlinkSync(uncompressed);
                }
                
                // Track compression statistics
                const originalSize = Buffer.byteLength(jsonString, 'utf8');
                const saved = originalSize - compressedData.length;
                this.compressionStats.saved += saved;
                this.compressionStats.total += originalSize;
                
            } else {
                // Save uncompressed for smaller files
                fs.writeFileSync(uncompressed, jsonString);
                
                // Clean up old compressed file if it exists
                if (fs.existsSync(compressed)) {
                    fs.unlinkSync(compressed);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Failed to save compressed page data for ${url}, falling back to uncompressed: ${error.message}`);
            fs.writeFileSync(uncompressed, jsonString);
        }

        // Update memory cache
        this.memoryCache.set(url, data);
        
        // Clean up memory if needed
        if (this.memoryCache.size > this.maxItemsInMemory) {
            const [firstKey] = this.memoryCache.keys();
            this.memoryCache.delete(firstKey);
        }
    }

    /**
     * Load page data with automatic decompression
     */
    get(url) {
        // Try memory cache first
        if (this.memoryCache.has(url)) {
            return this.memoryCache.get(url);
        }

        const { compressed, uncompressed } = this.getFilePaths(url);
        let data = null;

        try {
            // Try compressed file first
            if (fs.existsSync(compressed)) {
                const compressedData = fs.readFileSync(compressed);
                const jsonString = zlib.gunzipSync(compressedData).toString('utf8');
                data = JSON.parse(jsonString);
            }
            // Fall back to uncompressed file
            else if (fs.existsSync(uncompressed)) {
                const jsonString = fs.readFileSync(uncompressed, 'utf-8');
                data = JSON.parse(jsonString);
            }
            else {
                return null;
            }
        } catch (error) {
            console.warn(`⚠️  Failed to load page data for ${url}: ${error.message}`);
            
            // Try the other format as backup
            try {
                if (fs.existsSync(uncompressed)) {
                    const jsonString = fs.readFileSync(uncompressed, 'utf-8');
                    data = JSON.parse(jsonString);
                } else if (fs.existsSync(compressed)) {
                    const compressedData = fs.readFileSync(compressed);
                    const jsonString = zlib.gunzipSync(compressedData).toString('utf8');
                    data = JSON.parse(jsonString);
                }
            } catch (backupError) {
                console.error(`❌ Failed to load page data for ${url}: ${backupError.message}`);
                return null;
            }
        }

        if (data) {
            // Add to memory cache
            this.memoryCache.set(url, data);
            
            // Clean up memory if needed
            if (this.memoryCache.size > this.maxItemsInMemory) {
                const [firstKey] = this.memoryCache.keys();
                this.memoryCache.delete(firstKey);
            }
        }

        return data;
    }

    has(url) {
        if (this.memoryCache.has(url)) {
            return true;
        }
        
        const { compressed, uncompressed } = this.getFilePaths(url);
        return fs.existsSync(compressed) || fs.existsSync(uncompressed);
    }

    delete(url) {
        this.memoryCache.delete(url);
        const { compressed, uncompressed } = this.getFilePaths(url);
        
        if (fs.existsSync(compressed)) {
            fs.unlinkSync(compressed);
        }
        if (fs.existsSync(uncompressed)) {
            fs.unlinkSync(uncompressed);
        }
    }

    *[Symbol.iterator]() {
        // First yield memory cache entries
        for (const [url, data] of this.memoryCache) {
            yield [url, data];
        }

        // Then read files from disk that aren't in memory
        if (!fs.existsSync(this.pageDataFolder)) {
            return;
        }

        const files = fs.readdirSync(this.pageDataFolder);
        for (const file of files) {
            const filePath = path.join(this.pageDataFolder, file);
            
            // Skip directories and non-relevant files
            if (!fs.statSync(filePath).isFile() || 
                (!file.endsWith('.json') && !file.endsWith('.json.gz'))) {
                continue;
            }
            
            // Extract URL from filename (remove .json or .json.gz extension)
            const baseName = file.replace(/\.json(\.gz)?$/, '');
            const url = Buffer.from(baseName, 'base64url').toString();
            
            if (!this.memoryCache.has(url)) {
                try {
                    let data;
                    if (file.endsWith('.json.gz')) {
                        const compressedData = fs.readFileSync(filePath);
                        const jsonString = zlib.gunzipSync(compressedData).toString('utf8');
                        data = JSON.parse(jsonString);
                    } else {
                        const jsonString = fs.readFileSync(filePath, 'utf-8');
                        data = JSON.parse(jsonString);
                    }
                    yield [url, data];
                } catch (error) {
                    console.warn(`⚠️  Failed to read page data file ${file}: ${error.message}`);
                }
            }
        }
    }

    clear() {
        this.memoryCache.clear();
        this.compressionStats = { saved: 0, total: 0 };
        if (fs.existsSync(this.pageDataFolder)) {
            fs.rmSync(this.pageDataFolder, { recursive: true });
        }
        this.initStorage();
    }

    /**
     * Get the total size of stored page data
     */
    get size() {
        let totalSize = 0;
        
        if (!fs.existsSync(this.pageDataFolder)) {
            return totalSize;
        }

        const files = fs.readdirSync(this.pageDataFolder);
        for (const file of files) {
            const filePath = path.join(this.pageDataFolder, file);
            if (fs.statSync(filePath).isFile()) {
                if (file.endsWith('.json.gz')) {
                    // For compressed files, estimate uncompressed size (roughly 4x compressed size)
                    totalSize += fs.statSync(filePath).size * 4;
                } else if (file.endsWith('.json')) {
                    totalSize += fs.statSync(filePath).size;
                }
            }
        }
        
        return totalSize;
    }

    /**
     * Get compression statistics
     */
    getCompressionStats() {
        if (!fs.existsSync(this.pageDataFolder)) {
            return { compressed: 0, uncompressed: 0, totalSaved: 0, compressionRatio: 0 };
        }

        let compressedCount = 0;
        let uncompressedCount = 0;
        let compressedSize = 0;
        let uncompressedSize = 0;

        const files = fs.readdirSync(this.pageDataFolder);
        for (const file of files) {
            const filePath = path.join(this.pageDataFolder, file);
            if (fs.statSync(filePath).isFile()) {
                const fileSize = fs.statSync(filePath).size;
                
                if (file.endsWith('.json.gz')) {
                    compressedCount++;
                    compressedSize += fileSize;
                } else if (file.endsWith('.json')) {
                    uncompressedCount++;
                    uncompressedSize += fileSize;
                }
            }
        }

        const totalSaved = this.compressionStats.saved;
        const compressionRatio = this.compressionStats.total > 0 
            ? ((this.compressionStats.saved / this.compressionStats.total) * 100).toFixed(1)
            : 0;

        return {
            compressed: compressedCount,
            uncompressed: uncompressedCount,
            compressedSize,
            uncompressedSize,
            totalSaved,
            compressionRatio
        };
    }

    /**
     * Migrate existing uncompressed page data files to compressed format
     */
    migrateToCompressed() {
        if (!fs.existsSync(this.pageDataFolder)) {
            return { migrated: 0, errors: 0, totalSaved: 0 };
        }

        const jsonFiles = fs.readdirSync(this.pageDataFolder)
            .filter(file => file.endsWith('.json') && !file.endsWith('.json.gz'))
            .map(file => path.join(this.pageDataFolder, file));

        let migrated = 0;
        let errors = 0;
        let totalSaved = 0;

        console.log(`🔄 Migrating ${jsonFiles.length} page-data files to compressed format...`);

        for (const filePath of jsonFiles) {
            try {
                const jsonString = fs.readFileSync(filePath, 'utf-8');
                
                if (this.shouldCompress(jsonString)) {
                    const originalSize = Buffer.byteLength(jsonString, 'utf8');
                    const compressedData = zlib.gzipSync(Buffer.from(jsonString, 'utf8'), {
                        level: COMPRESSION_LEVEL,
                        chunkSize: 16 * 1024
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
            console.log(`🎉 Page-data migration complete: ${migrated} files migrated, ${(totalSaved/1024).toFixed(1)}KB total saved`);
        }

        return { migrated, errors, totalSaved };
    }

    /**
     * Print compression statistics
     */
    printCompressionStats() {
        const stats = this.getCompressionStats();
        
        console.log('\n📊 Page Data Compression Statistics');
        console.log('═'.repeat(40));
        console.log(`Compressed files: ${stats.compressed} (${(stats.compressedSize/1024).toFixed(1)}KB)`);
        console.log(`Uncompressed files: ${stats.uncompressed} (${(stats.uncompressedSize/1024).toFixed(1)}KB)`);
        
        if (stats.totalSaved > 0) {
            console.log(`Total space saved: ${(stats.totalSaved/1024).toFixed(1)}KB (${stats.compressionRatio}% compression)`);
        }
        
        if (stats.uncompressed > 0) {
            const potentialSavings = stats.uncompressedSize * 0.75; // Estimate 75% savings
            console.log(`Potential additional savings: ${(potentialSavings/1024).toFixed(1)}KB`);
            console.log(`💡 Run migrateToCompressed() to compress remaining files`);
        }
    }
}

// Export the original class as well for backward compatibility
export { ChunkedPageDataManager } from '../../legacy/page-data-manager.js';
