/**
 * ============================================================================
 * PERFORMANCE MANAGEMENT MODULE
 * ============================================================================
 * 
 * This module handles all performance-related functionality including caching,
 * memory management, and performance monitoring for the crawler system.
 * 
 * Features:
 * - Analysis result caching with LRU eviction
 * - Memory usage monitoring and management
 * - Performance metrics tracking
 * - Automatic cleanup and garbage collection
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

/**
 * Performance optimization thresholds and configurations
 */
export const PERFORMANCE_CONFIG = {
  HTML_CLEANUP_THRESHOLD: 5 * 1024 * 1024,    // 5MB - HTML cleanup threshold
  ANALYSIS_CACHE_SIZE: 1000,                   // Cache up to 1000 analysis results
  BATCH_SIZE: 50,                             // Process elements in batches
  MAX_CONTENT_LENGTH: 10 * 1024 * 1024,      // 10MB max content length
  MEMORY_WARNING_THRESHOLD: 800,              // 800MB memory warning threshold
  SLOW_PAGE_THRESHOLD: 10000,                 // 10s slow page threshold
  GC_TRIGGER_THRESHOLD: 500,                  // 500MB GC trigger threshold
  CACHE_CLEANUP_BATCH_SIZE: 100               // Number of cache entries to remove at once
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Performance-optimized cache manager with LRU eviction
 */
export class AnalysisCache {
  constructor(maxSize = PERFORMANCE_CONFIG.ANALYSIS_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = new Map(); // Track access order for LRU
    this.accessCounter = 0;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    if (this.cache.has(key)) {
      // Update access order for LRU
      this.accessOrder.set(key, ++this.accessCounter);
      return this.cache.get(key);
    }
    return undefined;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    // If cache is full, remove least recently used items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, value);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  /**
   * Evict least recently used items
   * @private
   */
  evictLRU() {
    const entriesToRemove = Math.max(1, Math.floor(this.maxSize * 0.1)); // Remove 10%
    
    // Sort by access order and remove oldest
    const sortedEntries = Array.from(this.accessOrder.entries())
      .sort((a, b) => a[1] - b[1]) // Sort by access counter (ascending)
      .slice(0, entriesToRemove);

    sortedEntries.forEach(([key]) => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: Math.round((this.cache.size / this.maxSize) * 100),
      accessCount: this.accessCounter
    };
  }
}

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

/**
 * Generate cache key for content-based caching
 * @param {string} operation - The operation type
 * @param {string} content - The content to hash
 * @returns {string} Cache key
 */
export function generateCacheKey(operation, content) {
  // Create a fast hash-like key for content
  const hash = content.length + content.slice(0, 100) + content.slice(-100);
  return `${operation}_${hash.length}_${hash.charCodeAt(0)}_${hash.charCodeAt(hash.length - 1)}`;
}

/**
 * Generate cache key for URL-based operations
 * @param {string} operation - The operation type
 * @param {string} url - The URL
 * @returns {string} Cache key
 */
export function generateURLCacheKey(operation, url) {
  return `${operation}_${url.length}_${url.slice(-50)}`;
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

/**
 * Memory monitor class for tracking memory usage
 */
export class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.maxMeasurements = 100; // Keep last 100 measurements
  }

  /**
   * Get current memory usage in MB
   * @returns {number} Memory usage in MB
   */
  getCurrentUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return Math.round(usage.heapUsed / 1024 / 1024); // MB
    }
    return 0;
  }

  /**
   * Record memory measurement
   * @param {string} operation - Operation being performed
   * @returns {number} Current memory usage
   */
  recordMeasurement(operation) {
    const usage = this.getCurrentUsage();
    const timestamp = Date.now();
    
    this.measurements.push({
      operation,
      usage,
      timestamp
    });

    // Keep only recent measurements
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }

    return usage;
  }

  /**
   * Check if memory usage is above threshold
   * @param {number} threshold - Memory threshold in MB
   * @returns {boolean} True if above threshold
   */
  isAboveThreshold(threshold = PERFORMANCE_CONFIG.MEMORY_WARNING_THRESHOLD) {
    return this.getCurrentUsage() > threshold;
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory statistics
   */
  getStats() {
    if (this.measurements.length === 0) {
      return { current: this.getCurrentUsage(), average: 0, peak: 0, measurements: 0 };
    }

    const current = this.getCurrentUsage();
    const usages = this.measurements.map(m => m.usage);
    const average = Math.round(usages.reduce((a, b) => a + b, 0) / usages.length);
    const peak = Math.max(...usages);

    return {
      current,
      average,
      peak,
      measurements: this.measurements.length,
      trend: this.calculateTrend()
    };
  }

  /**
   * Calculate memory usage trend
   * @returns {string} Trend direction
   * @private
   */
  calculateTrend() {
    if (this.measurements.length < 10) return 'insufficient_data';
    
    const recent = this.measurements.slice(-10);
    const older = this.measurements.slice(-20, -10);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b.usage, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.usage, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Trigger garbage collection if needed
   * @param {boolean} force - Force garbage collection
   * @returns {boolean} True if GC was triggered
   */
  triggerGCIfNeeded(force = false) {
    const currentUsage = this.getCurrentUsage();
    
    if (force || currentUsage > PERFORMANCE_CONFIG.GC_TRIGGER_THRESHOLD) {
      if (typeof global !== 'undefined' && global.gc) {
        console.log(`🗑️  Triggering garbage collection (Memory: ${currentUsage}MB)`);
        global.gc();
        return true;
      }
    }
    return false;
  }
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

/**
 * Performance metrics tracker
 */
export class PerformanceMetrics {
  constructor() {
    this.reset();
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.totalMemoryUsage = 0;
    this.avgProcessingTime = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.pageProcessingTimes = [];
    this.operationCounts = new Map();
    this.startTime = Date.now();
  }

  /**
   * Record cache hit
   */
  recordCacheHit() {
    this.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss() {
    this.cacheMisses++;
  }

  /**
   * Record page processing time
   * @param {number} timeMs - Processing time in milliseconds
   */
  recordPageProcessingTime(timeMs) {
    this.pageProcessingTimes.push(timeMs);
    
    // Update rolling average
    if (this.pageProcessingTimes.length === 1) {
      this.avgProcessingTime = timeMs;
    } else {
      this.avgProcessingTime = (this.avgProcessingTime + timeMs) / 2;
    }
    
    // Keep only recent measurements for memory efficiency
    if (this.pageProcessingTimes.length > 1000) {
      this.pageProcessingTimes.shift();
    }
  }

  /**
   * Record operation count
   * @param {string} operation - Operation name
   */
  recordOperation(operation) {
    this.operationCounts.set(operation, (this.operationCounts.get(operation) || 0) + 1);
  }

  /**
   * Add to total memory usage
   * @param {number} memoryMB - Memory usage in MB
   */
  addMemoryUsage(memoryMB) {
    this.totalMemoryUsage += memoryMB;
  }

  /**
   * Get cache hit rate
   * @returns {number} Hit rate percentage
   */
  getCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? Math.round((this.cacheHits / total) * 100) : 0;
  }

  /**
   * Get comprehensive performance statistics
   * @param {AnalysisCache} cache - Cache instance
   * @returns {Object} Performance statistics
   */
  getStats(cache = null) {
    const now = Date.now();
    const runtimeMs = now - this.startTime;
    
    return {
      runtime: {
        totalMs: runtimeMs,
        totalSeconds: Math.round(runtimeMs / 1000),
        totalMinutes: Math.round(runtimeMs / 60000)
      },
      processing: {
        avgProcessingTime: Math.round(this.avgProcessingTime),
        totalPages: this.pageProcessingTimes.length,
        slowestPage: this.pageProcessingTimes.length > 0 ? Math.max(...this.pageProcessingTimes) : 0,
        fastestPage: this.pageProcessingTimes.length > 0 ? Math.min(...this.pageProcessingTimes) : 0
      },
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: this.getCacheHitRate(),
        size: cache ? cache.size : 0,
        utilization: cache ? Math.round((cache.size / cache.maxSize) * 100) : 0
      },
      memory: {
        totalUsage: Math.round(this.totalMemoryUsage),
        avgPerPage: this.pageProcessingTimes.length > 0 ? 
          Math.round(this.totalMemoryUsage / this.pageProcessingTimes.length) : 0
      },
      operations: Object.fromEntries(this.operationCounts)
    };
  }
}

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

/**
 * Comprehensive performance monitor that ties everything together
 */
export class PerformanceManager {
  constructor(cacheSize = PERFORMANCE_CONFIG.ANALYSIS_CACHE_SIZE) {
    this.cache = new AnalysisCache(cacheSize);
    this.memoryMonitor = new MemoryMonitor();
    this.metrics = new PerformanceMetrics();
  }

  /**
   * Monitor performance of an operation
   * @param {string} operation - Operation name
   * @param {Function} fn - Function to execute
   * @returns {*} Function result
   */
  async monitorOperation(operation, fn) {
    const startTime = Date.now();
    const startMemory = this.memoryMonitor.recordMeasurement(`${operation}_start`);
    
    try {
      const result = await fn();
      
      const endTime = Date.now();
      const endMemory = this.memoryMonitor.recordMeasurement(`${operation}_end`);
      const duration = endTime - startTime;
      const memoryDelta = endMemory - startMemory;
      
      // Update metrics
      this.metrics.recordPageProcessingTime(duration);
      this.metrics.addMemoryUsage(memoryDelta);
      this.metrics.recordOperation(operation);
      
      // Log slow operations
      if (duration > PERFORMANCE_CONFIG.SLOW_PAGE_THRESHOLD) {
        console.warn(`⚠️  Slow ${operation}: ${duration}ms, Memory: ${memoryDelta}MB`);
      }
      
      // Trigger GC if needed
      this.memoryMonitor.triggerGCIfNeeded();
      
      return result;
    } catch (error) {
      console.error(`Error in ${operation}:`, error.message);
      throw error;
    }
  }

  /**
   * Get comprehensive performance report
   * @returns {Object} Performance report
   */
  getPerformanceReport() {
    return {
      metrics: this.metrics.getStats(this.cache),
      memory: this.memoryMonitor.getStats(),
      cache: this.cache.getStats(),
      config: PERFORMANCE_CONFIG
    };
  }

  /**
   * Log performance summary
   */
  logPerformanceSummary() {
    const report = this.getPerformanceReport();
    
    console.log(`\n📊 Performance Summary:`);
    console.log(`   • Average processing time: ${report.metrics.processing.avgProcessingTime}ms per page`);
    console.log(`   • Cache hit rate: ${report.metrics.cache.hitRate}% (${report.metrics.cache.hits} hits, ${report.metrics.cache.misses} misses)`);
    console.log(`   • Memory usage: Current ${report.memory.current}MB, Peak ${report.memory.peak}MB (${report.memory.trend})`);
    console.log(`   • Cache utilization: ${report.cache.utilization}% (${report.cache.size}/${this.cache.maxSize} entries)`);
    console.log(`   • Total runtime: ${report.metrics.runtime.totalMinutes} minutes`);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.cache.clear();
    this.memoryMonitor.triggerGCIfNeeded(true);
  }
}
