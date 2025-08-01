// Manages chunked storage of page data to reduce memory usage
import fs from 'fs';
import path from 'path';

export class ChunkedPageDataManager {
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

    *[Symbol.iterator]() {
        // First yield memory cache entries
        for (const [url, data] of this.memoryCache) {
            yield [url, data];
        }

        // Then read files from disk that aren't in memory
        const files = fs.readdirSync(this.pageDataFolder);
        for (const file of files) {
            const filePath = path.join(this.pageDataFolder, file);
            const url = Buffer.from(file.replace('.json', ''), 'base64url').toString();
            
            if (!this.memoryCache.has(url)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                yield [url, data];
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
