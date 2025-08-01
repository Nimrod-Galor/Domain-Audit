import { JSDOM, VirtualConsole } from 'jsdom';
import fetch from 'node-fetch';
import { CustomResourceLoader } from './resource-loader.js';
import * as analyzers from '../analyzers/index.js';

export class PageCrawler {
    constructor(config) {
        this.config = config;
        this.virtualConsole = this._createVirtualConsole();
    }

    _createVirtualConsole() {
        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", (err) => {
            if (err.includes('critical') || err.includes('fatal')) {
                console.error(`Critical JSDOM error:`, err);
            }
        });
        return virtualConsole;
    }

    async processInternalLinks({ state, storage, baseUrl, domain, config }) {
        const queue = state.getQueue();
        const visited = state.getVisited();
        let processedCount = 0;
        let activeWorkers = 0;

        const processUrl = async (url, workerId) => {
            const normalizedUrl = this._normalizeUrl(url);
            if (visited.has(normalizedUrl)) return;
            visited.add(normalizedUrl);
            
            // Log worker activity
            console.log(`🔍 Worker ${workerId} | Crawling: ${normalizedUrl} | Progress: ${processedCount + 1} | Queue: ${queue.size} remaining`);
            
            try {
                const pageData = await this.crawlPage(normalizedUrl);
                storage.savePageData(normalizedUrl, pageData);
                
                // Log discovered links for debugging
                console.log(`🔗 Worker ${workerId} | Found ${pageData.links.discoveredUrls.length} total links on ${normalizedUrl}`);
                
                let internalLinksFound = 0;
                let alreadyVisited = 0;
                let newLinksAdded = 0;
                
                // Process discovered links
                for (const link of pageData.links.discoveredUrls) {
                    const normalizedLink = this._normalizeUrl(link);
                    
                    if (this._isInternalLink(normalizedLink, baseUrl)) {
                        internalLinksFound++;
                        if (!visited.has(normalizedLink)) {
                            queue.add(normalizedLink);
                            newLinksAdded++;
                            console.log(`  ➕ Added to queue: ${normalizedLink}`);
                        } else {
                            alreadyVisited++;
                        }
                    } else {
                        state.addExternalLink(normalizedLink);
                    }
                }
                
                console.log(`📊 Worker ${workerId} | Internal: ${internalLinksFound}, Already visited: ${alreadyVisited}, New added: ${newLinksAdded}`);

                processedCount++;
                console.log(`✅ Worker ${workerId} | Completed: ${normalizedUrl} | Total processed: ${processedCount} | Queue: ${queue.size} remaining`);

                // Save state periodically
                if (processedCount % config.saveStateInterval === 0) {
                    state.saveState();
                }
            } catch (error) {
                console.error(`❌ Worker ${workerId} | Error processing ${url}:`, error);
                state.addFailedUrl(url, error.message);
            }
        };

        // Process queue with worker pool
        const workers = new Array(config.maxParallelCrawl).fill(null)
            .map((_, index) => this._createWorker(queue, processUrl, index + 1));

        await Promise.all(workers);
    }

    _normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove trailing slash and normalize to https if possible
            let normalized = urlObj.origin + urlObj.pathname.replace(/\/$/, '');
            if (urlObj.search) {
                normalized += urlObj.search;
            }
            return normalized;
        } catch (e) {
            return url; // Return original if invalid URL
        }
    }

    async crawlPage(url) {
        const html = await this._fetchPage(url);
        const dom = this._createDOM(html);
        
        return {
            url,
            timestamp: new Date().toISOString(),
            seo: analyzers.seoAnalyzer.analyze(dom),
            content: analyzers.contentAnalyzer.analyze(dom, html),
            links: analyzers.linkAnalyzer.analyze(dom, url),
            technical: analyzers.technicalAnalyzer.analyze(dom),
            security: analyzers.securityAnalyzer.analyze(dom),
            accessibility: analyzers.accessibilityAnalyzer.analyze(dom),
            mobile: analyzers.mobileAnalyzer.analyze(dom)
        };
    }

    _createDOM(html) {
        return new JSDOM(html, {
            resources: new CustomResourceLoader(),
            runScripts: "outside-only",
            pretendToBeVisual: false,
            virtualConsole: this.virtualConsole,
            includeNodeLocations: false
        });
    }

    async _fetchPage(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
    }

    _isInternalLink(url, baseUrl) {
        try {
            const urlObj = new URL(url);
            const baseObj = new URL(baseUrl);
            return urlObj.hostname === baseObj.hostname;
        } catch {
            return false;
        }
    }

    async _createWorker(queue, processUrl, workerId) {
        console.log(`🚀 Worker ${workerId} started`);
        
        while (queue.size > 0) {
            const url = Array.from(queue)[0];
            queue.delete(url);
            await processUrl(url, workerId);
        }
        
        console.log(`🏁 Worker ${workerId} finished`);
    }
}
