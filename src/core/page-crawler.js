import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as analyzers from '../analyzers/index.js';
import { DOMProcessor } from '../dom/dom-processor.js';

/**
 * PageCrawler - Handles crawling and analysis of web pages
 * 
 * Core responsibilities:
 * - Managing worker pools for parallel crawling
 * - Processing internal links and maintaining crawl state
 * - Fetching and parsing web pages
 * - Coordinating with analyzer modules
 * - Handling errors and logging
 */
export class PageCrawler {
    constructor(config) {
        this.config = config;
        this.virtualConsole = this._createVirtualConsole();
        this.domProcessor = new DOMProcessor();
    }

    // ========== PUBLIC API METHODS ==========

    /**
     * Main entry point for processing internal links with worker pool
     * @param {Object} params - Configuration object containing state, storage, baseUrl, domain, config
     */
    async processInternalLinks({ state, storage, baseUrl, domain, config }) {
        const context = this._createCrawlContext(state, storage, baseUrl, domain, config);
        const workers = this._createWorkerPool(context);
        
        console.log(`🚀 Starting ${config.maxParallelCrawl} workers for internal link processing`);
        await Promise.all(workers);
        console.log(`🏁 All workers completed. Total processed: ${context.processedCount}`);
    }

    /**
     * Crawl a single page and extract all analysis data
     * @param {string} url - The URL to crawl
     * @returns {Object} Complete page analysis data
     */
    async crawlPage(url) {
        const startTime = Date.now();
        const html = await this._fetchPage(url);
        const responseTime = Date.now() - startTime;
        const pageSize = Buffer.byteLength(html, 'utf8');
        const dom = await this._createDOM(html, url);
        
        return this._extractPageData(url, dom, html, responseTime, pageSize);
    }

    // ========== CRAWL CONTEXT & WORKER MANAGEMENT ==========

    /**
     * Create crawl context object with shared state
     */
    _createCrawlContext(state, storage, baseUrl, domain, config) {
        return {
            queue: state.getQueue(),
            visited: state.getVisited(),
            state,
            storage,
            baseUrl,
            domain,
            config,
            processedCount: 0,
            activeWorkers: 0
        };
    }

    /**
     * Create worker pool for parallel processing
     */
    _createWorkerPool(context) {
        return new Array(context.config.maxParallelCrawl)
            .fill(null)
            .map((_, index) => this._createWorker(context, index + 1));
    }

    /**
     * Individual worker that processes URLs from the queue
     */
    async _createWorker(context, workerId) {
        console.log(`🚀 Worker ${workerId} started`);
        
        while (context.queue.size > 0) {
            const url = Array.from(context.queue)[0];
            context.queue.delete(url);
            await this._processUrl(url, workerId, context);
        }
        
        console.log(`🏁 Worker ${workerId} finished`);
    }

    // ========== URL PROCESSING ==========

    /**
     * Process a single URL - main worker task
     */
    async _processUrl(url, workerId, context) {
        const normalizedUrl = this._normalizeUrl(url);
        
        // Skip if already visited
        if (context.visited.has(normalizedUrl)) return;
        context.visited.add(normalizedUrl);
        
        this._logWorkerActivity(workerId, 'crawling', normalizedUrl, context);
        
        try {
            const pageData = await this.crawlPage(normalizedUrl);
            context.storage.savePageData(normalizedUrl, pageData);
            
            const linkStats = this._processDiscoveredLinks(pageData.links.discoveredUrls, workerId, context);
            
            this._logLinkProcessingResults(workerId, linkStats);
            this._logWorkerCompletion(workerId, normalizedUrl, context);
            
            // Save state periodically
            context.processedCount++;
            if (context.processedCount % context.config.saveStateInterval === 0) {
                context.state.saveState();
            }
            
        } catch (error) {
            console.error(`❌ Worker ${workerId} | Error processing ${url}:`, error);
            context.state.addFailedUrl(url, error.message);
        }
    }

    /**
     * Process all discovered links from a page
     */
    _processDiscoveredLinks(discoveredUrls, workerId, context) {
        let internalLinksFound = 0;
        let alreadyVisited = 0;
        let newLinksAdded = 0;
        
        console.log(`🔗 Worker ${workerId} | Found ${discoveredUrls.length} total links`);
        
        for (const link of discoveredUrls) {
            const normalizedLink = this._normalizeUrl(link);
            
            if (this._isInternalLink(normalizedLink, context.baseUrl)) {
                internalLinksFound++;
                
                if (!context.visited.has(normalizedLink)) {
                    context.queue.add(normalizedLink);
                    newLinksAdded++;
                    console.log(`  ➕ Added to queue: ${normalizedLink}`);
                } else {
                    alreadyVisited++;
                }
            } else {
                context.state.addExternalLink(normalizedLink);
            }
        }
        
        return { internalLinksFound, alreadyVisited, newLinksAdded };
    }

    // ========== PAGE DATA EXTRACTION ==========

    /**
     * Extract comprehensive page analysis data
     */
    _extractPageData(url, dom, html, responseTime, pageSize) {
        // Check if DOM creation failed
        if (!dom || dom.error || !dom.document) {
            console.error(`DOM creation failed for ${url}:`, dom?.error || 'Unknown error');
            throw new Error('Failed to create DOM instance');
        }

        const basePageData = {
            url,
            timestamp: new Date().toISOString(),
            seo: analyzers.seoAnalyzer.analyze(dom.document),
            content: analyzers.contentAnalyzer.analyze(dom.document, html),
            links: analyzers.linkAnalyzer.analyze(dom.document, url),
            technical: analyzers.technicalAnalyzer.analyze(dom.document),
            security: analyzers.securityAnalyzer.analyze(dom.document),
            accessibility: analyzers.accessibilityAnalyzer.analyze(dom.document),
            mobile: analyzers.mobileAnalyzer.analyze(dom.document)
        };
        
        // Enhanced features (medium-priority)
        if (analyzers.enhancedExtractors) {
            try {
                const enhancedExtractors = new analyzers.enhancedExtractors();
                console.log('✅ Enhanced extractors instantiated');
                basePageData.enhanced = enhancedExtractors.extractAllEnhancedData(
                    dom.document, 
                    basePageData, 
                    responseTime, 
                    pageSize, 
                    html
                );
                console.log('✅ Enhanced data extracted:', Object.keys(basePageData.enhanced || {}));
            } catch (error) {
                console.error('❌ Enhanced extractors error:', error.message);
                basePageData.enhanced = { error: error.message };
            }
        } else {
            console.log('❌ Enhanced extractors not available');
        }
        
        return basePageData;
    }

    // ========== DOM & FETCH UTILITIES ==========

    /**
     * Create DOM instance using DOMProcessor for proper compatibility
     */
    async _createDOM(html, url = 'https://example.com') {
        try {
            return await this.domProcessor.createDOM(html, url);
        } catch (error) {
            console.error('Error creating DOM:', error.message);
            return {
                $: null,
                document: null,
                window: null,
                cleanup: () => {},
                error: error.message
            };
        }
    }

    /**
     * Create virtual console placeholder for compatibility
     */
    _createVirtualConsole() {
        return {
            on: () => {} // No-op for Cheerio compatibility
        };
    }

    /**
     * Fetch page content with error handling
     */
    async _fetchPage(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
    }

    // ========== URL UTILITIES ==========

    /**
     * Normalize URL for consistent processing
     */
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

    /**
     * Check if URL is internal to the crawled domain
     */
    _isInternalLink(url, baseUrl) {
        try {
            const urlObj = new URL(url);
            const baseObj = new URL(baseUrl);
            return urlObj.hostname === baseObj.hostname;
        } catch {
            return false;
        }
    }

    // ========== LOGGING UTILITIES ==========

    /**
     * Log worker activity with consistent formatting
     */
    _logWorkerActivity(workerId, action, url, context) {
        const progress = context.processedCount + 1;
        const remaining = context.queue.size;
        console.log(`� Worker ${workerId} | Crawling: ${url} | Progress: ${progress} | Queue: ${remaining} remaining`);
    }

    /**
     * Log link processing results
     */
    _logLinkProcessingResults(workerId, { internalLinksFound, alreadyVisited, newLinksAdded }) {
        console.log(`📊 Worker ${workerId} | Internal: ${internalLinksFound}, Already visited: ${alreadyVisited}, New added: ${newLinksAdded}`);
    }

    /**
     * Log worker completion
     */
    _logWorkerCompletion(workerId, url, context) {
        const totalProcessed = context.processedCount + 1;
        const remaining = context.queue.size;
        console.log(`✅ Worker ${workerId} | Completed: ${url} | Total processed: ${totalProcessed} | Queue: ${remaining} remaining`);
    }
}
