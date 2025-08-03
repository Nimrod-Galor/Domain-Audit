/**
 * ============================================================================
 * CHUNKED PAGE DATA MANAGER
 * ============================================================================
 * 
 * Manages chunked storage of page data to reduce memory usage.
 * Provides efficient caching and file-based storage for large datasets.
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

// Manages chunked storage of page data to reduce memory usage
import fs from 'fs';
import path from 'path';

export class ChunkedPageDataManager {
    /**
     * Creates a ChunkedPageDataManager instance
     * @param {string} domainFolder - The audit/domain folder path (NOT the page-data folder itself)
     * @param {number} maxItemsInMemory - Maximum items to keep in memory cache
     */
    constructor(domainFolder, maxItemsInMemory = 100) {
        this.domainFolder = domainFolder;
        this.maxItemsInMemory = maxItemsInMemory;
        this.pageDataFolder = path.join(domainFolder, 'page-data');
        this.memoryCache = new Map();
        this.initStorage();
    }

    initStorage() {
        if (!fs.existsSync(this.pageDataFolder)) {
            fs.mkdirSync(this.pageDataFolder, { recursive: true });
        }
    }

    getFilePath(url) {
        // Create a safe filename from the URL
        const safeName = Buffer.from(url).toString('base64url');
        return path.join(this.pageDataFolder, `${safeName}.json`);
    }

    set(url, data) {
        // Write to disk
        const filePath = this.getFilePath(url);
        fs.writeFileSync(filePath, JSON.stringify(data));
        
        // Update memory cache
        this.memoryCache.set(url, data);
        
        // Clean up memory if needed
        if (this.memoryCache.size > this.maxItemsInMemory) {
            const [firstKey] = this.memoryCache.keys();
            this.memoryCache.delete(firstKey);
        }
    }

    get(url) {
        // Try memory cache first
        if (this.memoryCache.has(url)) {
            return this.memoryCache.get(url);
        }

        // Try reading from disk
        const filePath = this.getFilePath(url);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            
            // Add to memory cache
            this.memoryCache.set(url, data);
            
            // Clean up memory if needed
            if (this.memoryCache.size > this.maxItemsInMemory) {
                const [firstKey] = this.memoryCache.keys();
                this.memoryCache.delete(firstKey);
            }
            
            return data;
        }

        return null;
    }

    has(url) {
        return this.memoryCache.has(url) || fs.existsSync(this.getFilePath(url));
    }

    delete(url) {
        this.memoryCache.delete(url);
        const filePath = this.getFilePath(url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    get size() {
        // Count memory cache plus files on disk that aren't in memory
        let totalSize = this.memoryCache.size;
        
        if (fs.existsSync(this.pageDataFolder)) {
            const files = fs.readdirSync(this.pageDataFolder);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const url = Buffer.from(file.replace('.json', ''), 'base64url').toString();
                    if (!this.memoryCache.has(url)) {
                        totalSize++;
                    }
                }
            }
        }
        
        return totalSize;
    }

    entries() {
        return this[Symbol.iterator]();
    }

    *[Symbol.iterator]() {
        // First yield memory cache entries
        for (const [url, data] of this.memoryCache) {
            yield [url, data];
        }

        // Then read files from disk that aren't in memory
        if (fs.existsSync(this.pageDataFolder)) {
            const files = fs.readdirSync(this.pageDataFolder);
            for (const file of files) {
                const filePath = path.join(this.pageDataFolder, file);
                
                // Skip directories and non-JSON files
                if (!fs.statSync(filePath).isFile() || !file.endsWith('.json')) {
                    continue;
                }
                
                const url = Buffer.from(file.replace('.json', ''), 'base64url').toString();
                
                if (!this.memoryCache.has(url)) {
                    try {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        yield [url, data];
                    } catch (error) {
                        console.warn(`⚠️  Failed to read page data file ${file}: ${error.message}`);
                    }
                }
            }
        }
    }

    clear() {
        this.memoryCache.clear();
        if (fs.existsSync(this.pageDataFolder)) {
            fs.rmSync(this.pageDataFolder, { recursive: true });
        }
        this.initStorage();
    }
}