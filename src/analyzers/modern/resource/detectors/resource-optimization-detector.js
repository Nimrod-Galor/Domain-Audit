/**
 * ============================================================================
 * RESOURCE OPTIMIZATION DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced resource optimization and delivery analysis
 * Part of Resource Analyzer Combined Approach (11th Implementation)
 * 
 * Capabilities:
 * - Compression analysis (Gzip, Brotli)
 * - Caching strategy detection
 * - CDN utilization analysis
 * - Resource bundling assessment
 * - Optimization opportunity identification
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ResourceOptimizationDetector {
  constructor(options = {}) {
    this.options = {
      // Optimization Analysis Configuration
      enableCompressionAnalysis: options.enableCompressionAnalysis !== false,
      enableCachingAnalysis: options.enableCachingAnalysis !== false,
      enableCDNAnalysis: options.enableCDNAnalysis !== false,
      enableBundlingAnalysis: options.enableBundlingAnalysis !== false,
      enableMinificationAnalysis: options.enableMinificationAnalysis !== false,
      
      // Optimization Thresholds
      minCompressionRatio: options.minCompressionRatio || 0.7,
      optimalCacheAge: options.optimalCacheAge || 31536000, // 1 year
      maxBundleSize: options.maxBundleSize || 250000, // 250KB
      compressionThreshold: options.compressionThreshold || 1024, // 1KB
      
      // Resource Optimization Targets
      targetCompressionRatio: options.targetCompressionRatio || 0.8,
      targetCacheHitRate: options.targetCacheHitRate || 0.9,
      maxUnusedBytes: options.maxUnusedBytes || 50000, // 50KB
      
      ...options
    };

    this.detectorType = 'resource_optimization';
    this.version = '1.0.0';
    
    // Compression detection patterns
    this.compressionPatterns = {
      gzip: /content-encoding:\s*gzip/i,
      brotli: /content-encoding:\s*br/i,
      deflate: /content-encoding:\s*deflate/i
    };

    // CDN patterns
    this.cdnPatterns = {
      cloudflare: /cdn\.cloudflare\.|cdnjs\.cloudflare\.com/i,
      amazonaws: /\.amazonaws\.com|cloudfront\.net/i,
      googleapis: /googleapis\.com|gstatic\.com/i,
      jsdelivr: /cdn\.jsdelivr\.net/i,
      unpkg: /unpkg\.com/i,
      maxcdn: /maxcdn\.bootstrapcdn\.com/i,
      fastly: /fastly\.com/i,
      keycdn: /keycdn\.com/i
    };

    // Minification patterns
    this.minificationPatterns = {
      cssMinified: /\.min\.css|minified.*\.css/i,
      jsMinified: /\.min\.js|minified.*\.js/i,
      inlineMinified: /(?:^|\s)[a-z]:\s*[^;]{20,}/i // Minified-style CSS
    };

    // Bundle patterns
    this.bundlePatterns = {
      webpack: /webpack|__webpack_require__|webpackJsonp/i,
      rollup: /rollup|chunk-[a-f0-9]+\.js/i,
      parcel: /parcel-bundler/i,
      esbuild: /esbuild/i,
      vite: /vite|@vite/i
    };
    
    console.log('🔧 Resource Optimization Detector initialized');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'ResourceOptimizationDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced resource optimization and delivery analysis',
      
      capabilities: [
        'compression_analysis',
        'caching_strategy_detection',
        'cdn_utilization_analysis',
        'resource_bundling_assessment',
        'minification_detection',
        'optimization_opportunity_identification',
        'delivery_efficiency_analysis',
        'bandwidth_optimization_analysis'
      ],
      
      optimizationTargets: [
        'compression_ratio',
        'cache_efficiency',
        'cdn_usage',
        'bundle_optimization',
        'minification_coverage',
        'delivery_performance'
      ],
      
      analysisFeatures: {
        compressionAnalysis: this.options.enableCompressionAnalysis,
        cachingAnalysis: this.options.enableCachingAnalysis,
        cdnAnalysis: this.options.enableCDNAnalysis,
        bundlingAnalysis: this.options.enableBundlingAnalysis,
        minificationAnalysis: this.options.enableMinificationAnalysis
      },
      
      thresholds: {
        minCompressionRatio: this.options.minCompressionRatio,
        optimalCacheAge: this.options.optimalCacheAge,
        maxBundleSize: this.options.maxBundleSize,
        compressionThreshold: this.options.compressionThreshold
      }
    };
  }

  /**
   * Main detection method - analyze resource optimization
   * @param {Object} context - Analysis context with document, performance data
   * @returns {Promise<Object>} Resource optimization analysis results
   */
  async detect(context) {
    try {
      const startTime = Date.now();
      const { document, url, performanceData, resourceData } = context;
      
      if (!document) {
        throw new Error('Document is required for resource optimization detection');
      }

      console.log('🔧 Starting resource optimization detection...');

      // Core Optimization Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Compression Analysis
        compression: this.options.enableCompressionAnalysis ?
          await this._analyzeCompression(document, performanceData) : null,
        
        // Caching Analysis
        caching: this.options.enableCachingAnalysis ?
          await this._analyzeCaching(document, performanceData) : null,
        
        // CDN Analysis
        cdn: this.options.enableCDNAnalysis ?
          await this._analyzeCDNUsage(document, performanceData) : null,
        
        // Bundling Analysis
        bundling: this.options.enableBundlingAnalysis ?
          await this._analyzeBundling(document, performanceData) : null,
        
        // Minification Analysis
        minification: this.options.enableMinificationAnalysis ?
          await this._analyzeMinification(document) : null,
        
        // Optimization Opportunities
        opportunities: await this._identifyOptimizationOpportunities(document, performanceData),
        
        // Delivery Analysis
        delivery: await this._analyzeDeliveryEfficiency(document, performanceData),
        
        // Overall Optimization Score
        score: {},
        
        executionTime: Date.now() - startTime
      };

      // Calculate optimization scores
      results.score = this._calculateOptimizationScore(results);
      
      // Generate optimization summary
      results.summary = this._generateOptimizationSummary(results);
      
      console.log(`✅ Resource optimization detection completed in ${results.executionTime}ms`);
      console.log(`📊 Optimization score: ${results.score.overall || 'N/A'}`);
      
      return results;

    } catch (error) {
      console.error('❌ Resource optimization detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - (context.startTime || Date.now())
      };
    }
  }

  /**
   * Analyze compression strategies and effectiveness
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Compression analysis results
   */
  async _analyzeCompression(document, performanceData) {
    const compression = {
      enabled: false,
      types: {},
      coverage: {},
      effectiveness: {},
      recommendations: []
    };

    try {
      // Analyze compression from performance data
      if (performanceData && performanceData.getEntriesByType) {
        const resourceEntries = performanceData.getEntriesByType('resource') || [];
        
        let totalResources = 0;
        let compressedResources = 0;
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        
        resourceEntries.forEach(entry => {
          totalResources++;
          
          const originalSize = entry.decodedBodySize || 0;
          const compressedSize = entry.transferSize || entry.encodedBodySize || 0;
          
          totalOriginalSize += originalSize;
          totalCompressedSize += compressedSize;
          
          if (originalSize > compressedSize && originalSize > this.options.compressionThreshold) {
            compressedResources++;
            
            const compressionRatio = compressedSize / originalSize;
            const resourceType = this._getResourceTypeFromUrl(entry.name);
            
            if (!compression.types[resourceType]) {
              compression.types[resourceType] = {
                total: 0,
                compressed: 0,
                averageRatio: 0,
                totalSavings: 0
              };
            }
            
            compression.types[resourceType].total++;
            compression.types[resourceType].compressed++;
            compression.types[resourceType].totalSavings += (originalSize - compressedSize);
          }
        });
        
        // Calculate overall compression statistics
        compression.enabled = compressedResources > 0;
        compression.coverage = {
          totalResources,
          compressedResources,
          compressionRate: totalResources > 0 ? (compressedResources / totalResources) : 0
        };
        
        compression.effectiveness = {
          totalOriginalSize,
          totalCompressedSize,
          totalSavings: totalOriginalSize - totalCompressedSize,
          overallRatio: totalOriginalSize > 0 ? (totalCompressedSize / totalOriginalSize) : 1,
          averageSavings: compressedResources > 0 ? 
            ((totalOriginalSize - totalCompressedSize) / compressedResources) : 0
        };
      }

      // Analyze compression headers from document (if available)
      await this._analyzeCompressionHeaders(document, compression);
      
      // Generate compression recommendations
      compression.recommendations = this._generateCompressionRecommendations(compression);

    } catch (error) {
      console.error('Compression analysis failed:', error);
    }

    return compression;
  }

  /**
   * Analyze caching strategies and effectiveness
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Caching analysis results
   */
  async _analyzeCaching(document, performanceData) {
    const caching = {
      strategies: {},
      effectiveness: {},
      headers: {},
      recommendations: []
    };

    try {
      // Analyze caching from performance data
      if (performanceData && performanceData.getEntriesByType) {
        const resourceEntries = performanceData.getEntriesByType('resource') || [];
        
        let cacheable = 0;
        let cached = 0;
        let totalResources = resourceEntries.length;
        
        const cacheTypes = {
          longTerm: 0,
          shortTerm: 0,
          noCache: 0,
          browser: 0,
          cdn: 0
        };
        
        resourceEntries.forEach(entry => {
          // Analyze cache timing
          const transferSize = entry.transferSize || 0;
          const encodedBodySize = entry.encodedBodySize || 0;
          
          // Resource likely came from cache if transferSize is much smaller
          if (transferSize < encodedBodySize * 0.1 && encodedBodySize > 0) {
            cached++;
            cacheTypes.browser++;
          }
          
          // Analyze by resource type
          const resourceType = this._getResourceTypeFromUrl(entry.name);
          if (this._isResourceCacheable(resourceType)) {
            cacheable++;
          }
        });
        
        caching.effectiveness = {
          totalResources,
          cacheableResources: cacheable,
          cachedResources: cached,
          cacheHitRate: cacheable > 0 ? (cached / cacheable) : 0,
          browserCacheUtilization: totalResources > 0 ? (cacheTypes.browser / totalResources) : 0
        };
        
        caching.strategies = cacheTypes;
      }

      // Analyze caching headers and meta tags
      await this._analyzeCachingHeaders(document, caching);
      
      // Generate caching recommendations
      caching.recommendations = this._generateCachingRecommendations(caching);

    } catch (error) {
      console.error('Caching analysis failed:', error);
    }

    return caching;
  }

  /**
   * Analyze CDN usage and effectiveness
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} CDN analysis results
   */
  async _analyzeCDNUsage(document, performanceData) {
    const cdn = {
      usage: false,
      providers: {},
      coverage: {},
      performance: {},
      recommendations: []
    };

    try {
      // Analyze CDN usage from resource URLs
      const allResources = this._getAllResourceUrls(document);
      let totalResources = allResources.length;
      let cdnResources = 0;
      
      allResources.forEach(url => {
        Object.entries(this.cdnPatterns).forEach(([provider, pattern]) => {
          if (pattern.test(url)) {
            cdnResources++;
            cdn.usage = true;
            
            if (!cdn.providers[provider]) {
              cdn.providers[provider] = {
                count: 0,
                resources: [],
                types: {}
              };
            }
            
            cdn.providers[provider].count++;
            cdn.providers[provider].resources.push(url);
            
            const resourceType = this._getResourceTypeFromUrl(url);
            cdn.providers[provider].types[resourceType] = 
              (cdn.providers[provider].types[resourceType] || 0) + 1;
          }
        });
      });

      // Calculate CDN coverage
      cdn.coverage = {
        totalResources,
        cdnResources,
        cdnUtilization: totalResources > 0 ? (cdnResources / totalResources) : 0,
        providerCount: Object.keys(cdn.providers).length
      };

      // Analyze CDN performance from timing data
      if (performanceData && performanceData.getEntriesByType) {
        await this._analyzeCDNPerformance(performanceData, cdn);
      }

      // Generate CDN recommendations
      cdn.recommendations = this._generateCDNRecommendations(cdn);

    } catch (error) {
      console.error('CDN analysis failed:', error);
    }

    return cdn;
  }

  /**
   * Analyze resource bundling strategies
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Bundling analysis results
   */
  async _analyzeBundling(document, performanceData) {
    const bundling = {
      detected: false,
      bundlers: {},
      strategies: {},
      effectiveness: {},
      recommendations: []
    };

    try {
      const html = document.documentElement.outerHTML;
      
      // Detect bundling tools
      Object.entries(this.bundlePatterns).forEach(([bundler, pattern]) => {
        if (pattern.test(html)) {
          bundling.detected = true;
          bundling.bundlers[bundler] = {
            detected: true,
            confidence: this._calculateBundlerConfidence(html, pattern)
          };
        }
      });

      // Analyze bundling strategies
      const scripts = document.querySelectorAll('script[src]');
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      
      bundling.strategies = {
        scriptBundles: this._analyzeBundleStrategy(scripts, 'script'),
        styleBundles: this._analyzeBundleStrategy(stylesheets, 'stylesheet'),
        chunkSplitting: this._analyzeChunkSplitting(document),
        treeshaking: this._analyzeTreeshaking(document)
      };

      // Analyze bundling effectiveness
      if (performanceData && performanceData.getEntriesByType) {
        bundling.effectiveness = await this._analyzeBundlingEffectiveness(
          performanceData, bundling.strategies
        );
      }

      // Generate bundling recommendations
      bundling.recommendations = this._generateBundlingRecommendations(bundling);

    } catch (error) {
      console.error('Bundling analysis failed:', error);
    }

    return bundling;
  }

  /**
   * Analyze minification strategies
   * @param {Document} document - Document to analyze
   * @returns {Promise<Object>} Minification analysis results
   */
  async _analyzeMinification(document) {
    const minification = {
      css: {},
      javascript: {},
      html: {},
      overall: {},
      recommendations: []
    };

    try {
      // Analyze CSS minification
      minification.css = await this._analyzeCSSMinification(document);
      
      // Analyze JavaScript minification
      minification.javascript = await this._analyzeJSMinification(document);
      
      // Analyze HTML minification
      minification.html = await this._analyzeHTMLMinification(document);
      
      // Calculate overall minification statistics
      minification.overall = this._calculateOverallMinification(minification);
      
      // Generate minification recommendations
      minification.recommendations = this._generateMinificationRecommendations(minification);

    } catch (error) {
      console.error('Minification analysis failed:', error);
    }

    return minification;
  }

  /**
   * Identify optimization opportunities
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Optimization opportunities
   */
  async _identifyOptimizationOpportunities(document, performanceData) {
    const opportunities = {
      critical: [],
      important: [],
      minor: [],
      totalSavings: 0,
      implementationEffort: {}
    };

    try {
      // Compression opportunities
      const compressionOpps = await this._identifyCompressionOpportunities(document, performanceData);
      opportunities.important.push(...compressionOpps);

      // Caching opportunities
      const cachingOpps = await this._identifyCachingOpportunities(document, performanceData);
      opportunities.important.push(...cachingOpps);

      // CDN opportunities
      const cdnOpps = await this._identifyCDNOpportunities(document, performanceData);
      opportunities.minor.push(...cdnOpps);

      // Bundling opportunities
      const bundlingOpps = await this._identifyBundlingOpportunities(document, performanceData);
      opportunities.critical.push(...bundlingOpps);

      // Minification opportunities
      const minificationOpps = await this._identifyMinificationOpportunities(document);
      opportunities.important.push(...minificationOpps);

      // Calculate total potential savings
      opportunities.totalSavings = this._calculateTotalSavings(opportunities);
      
      // Assess implementation effort
      opportunities.implementationEffort = this._assessImplementationEffort(opportunities);

    } catch (error) {
      console.error('Optimization opportunity identification failed:', error);
    }

    return opportunities;
  }

  /**
   * Analyze delivery efficiency
   * @param {Document} document - Document to analyze
   * @param {Object} performanceData - Performance timing data
   * @returns {Promise<Object>} Delivery efficiency analysis
   */
  async _analyzeDeliveryEfficiency(document, performanceData) {
    const delivery = {
      bandwidth: {},
      latency: {},
      throughput: {},
      efficiency: {},
      bottlenecks: []
    };

    try {
      if (performanceData && performanceData.getEntriesByType) {
        const resourceEntries = performanceData.getEntriesByType('resource') || [];
        
        let totalTransferSize = 0;
        let totalDuration = 0;
        let resourceCount = resourceEntries.length;
        
        resourceEntries.forEach(entry => {
          totalTransferSize += entry.transferSize || 0;
          totalDuration += entry.duration || 0;
        });

        // Calculate delivery metrics
        delivery.bandwidth = {
          totalTransferSize,
          averageResourceSize: resourceCount > 0 ? (totalTransferSize / resourceCount) : 0,
          efficiency: this._calculateBandwidthEfficiency(resourceEntries)
        };

        delivery.latency = {
          averageLatency: resourceCount > 0 ? (totalDuration / resourceCount) : 0,
          highLatencyResources: resourceEntries.filter(entry => 
            entry.duration > this.options.slowResourceThreshold
          ).length
        };

        delivery.throughput = {
          resourcesPerSecond: totalDuration > 0 ? (resourceCount / (totalDuration / 1000)) : 0,
          bytesPerSecond: totalDuration > 0 ? (totalTransferSize / (totalDuration / 1000)) : 0
        };

        // Identify delivery bottlenecks
        delivery.bottlenecks = this._identifyDeliveryBottlenecks(resourceEntries);
      }

      // Calculate overall delivery efficiency
      delivery.efficiency = this._calculateDeliveryEfficiency(delivery);

    } catch (error) {
      console.error('Delivery efficiency analysis failed:', error);
    }

    return delivery;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _getResourceTypeFromUrl(url) {
    const ext = url.split('.').pop().toLowerCase().split('?')[0];
    
    const typeMap = {
      'css': 'stylesheet',
      'js': 'script',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image',
      'woff': 'font', 'woff2': 'font', 'ttf': 'font', 'otf': 'font',
      'mp4': 'video', 'webm': 'video', 'ogg': 'video'
    };
    
    return typeMap[ext] || 'other';
  }

  _getAllResourceUrls(document) {
    const urls = [];
    
    // CSS files
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.href) urls.push(link.href);
    });
    
    // JavaScript files
    document.querySelectorAll('script[src]').forEach(script => {
      if (script.src) urls.push(script.src);
    });
    
    // Images
    document.querySelectorAll('img[src]').forEach(img => {
      if (img.src) urls.push(img.src);
    });
    
    // Fonts
    document.querySelectorAll('link[rel="preload"][as="font"]').forEach(link => {
      if (link.href) urls.push(link.href);
    });
    
    return urls;
  }

  _isResourceCacheable(resourceType) {
    const cacheableTypes = ['stylesheet', 'script', 'image', 'font'];
    return cacheableTypes.includes(resourceType);
  }

  async _analyzeCompressionHeaders(document, compression) {
    // This would analyze response headers if available
    // Placeholder implementation
    compression.headers = {
      gzipSupported: true,
      brotliSupported: false,
      detectedHeaders: []
    };
  }

  async _analyzeCachingHeaders(document, caching) {
    // This would analyze cache headers if available
    // Placeholder implementation
    caching.headers = {
      cacheControl: 'unknown',
      expires: 'unknown',
      etag: 'unknown',
      lastModified: 'unknown'
    };
  }

  async _analyzeCDNPerformance(performanceData, cdn) {
    const resourceEntries = performanceData.getEntriesByType('resource') || [];
    
    let cdnRequests = 0;
    let cdnTotalTime = 0;
    let nonCdnRequests = 0;
    let nonCdnTotalTime = 0;
    
    resourceEntries.forEach(entry => {
      const isCdnResource = Object.values(this.cdnPatterns).some(pattern => 
        pattern.test(entry.name)
      );
      
      if (isCdnResource) {
        cdnRequests++;
        cdnTotalTime += entry.duration || 0;
      } else {
        nonCdnRequests++;
        nonCdnTotalTime += entry.duration || 0;
      }
    });
    
    cdn.performance = {
      cdnAverageTime: cdnRequests > 0 ? (cdnTotalTime / cdnRequests) : 0,
      nonCdnAverageTime: nonCdnRequests > 0 ? (nonCdnTotalTime / nonCdnRequests) : 0,
      performanceImprovement: 0 // Calculate based on comparison
    };
    
    if (cdn.performance.nonCdnAverageTime > 0) {
      cdn.performance.performanceImprovement = 
        (cdn.performance.nonCdnAverageTime - cdn.performance.cdnAverageTime) / 
        cdn.performance.nonCdnAverageTime;
    }
  }

  _calculateBundlerConfidence(html, pattern) {
    const matches = html.match(new RegExp(pattern.source, 'gi')) || [];
    return Math.min(100, matches.length * 20);
  }

  _analyzeBundleStrategy(elements, type) {
    const strategy = {
      totalFiles: elements.length,
      bundledFiles: 0,
      individualFiles: 0,
      averageSize: 0,
      largestBundle: 0
    };
    
    // Simple heuristic: assume fewer files with "bundle" or "chunk" in name are bundled
    elements.forEach(element => {
      const url = element.src || element.href || '';
      if (/bundle|chunk|vendor|main/.test(url)) {
        strategy.bundledFiles++;
      } else {
        strategy.individualFiles++;
      }
    });
    
    return strategy;
  }

  _analyzeChunkSplitting(document) {
    const scripts = document.querySelectorAll('script[src]');
    let chunkCount = 0;
    
    scripts.forEach(script => {
      if (/chunk-[a-f0-9]+|\.chunk\.|vendor\.|main\./.test(script.src || '')) {
        chunkCount++;
      }
    });
    
    return {
      detected: chunkCount > 0,
      chunkCount,
      strategy: chunkCount > 3 ? 'aggressive' : chunkCount > 1 ? 'moderate' : 'minimal'
    };
  }

  _analyzeTreeshaking(document) {
    // Heuristic analysis for tree shaking
    const scripts = document.querySelectorAll('script[src]');
    let potentialTreeshaking = false;
    
    scripts.forEach(script => {
      if (/\.esm\.|\.module\.|type="module"/.test(script.outerHTML)) {
        potentialTreeshaking = true;
      }
    });
    
    return {
      detected: potentialTreeshaking,
      confidence: potentialTreeshaking ? 60 : 20
    };
  }

  async _analyzeBundlingEffectiveness(performanceData, strategies) {
    const effectiveness = {
      requestReduction: 0,
      sizeEfficiency: 0,
      loadingPerformance: 0
    };
    
    // Calculate based on bundle vs individual file strategies
    const totalBundles = strategies.scriptBundles.bundledFiles + strategies.styleBundles.bundledFiles;
    const totalIndividual = strategies.scriptBundles.individualFiles + strategies.styleBundles.individualFiles;
    
    if (totalBundles + totalIndividual > 0) {
      effectiveness.requestReduction = totalBundles / (totalBundles + totalIndividual);
    }
    
    return effectiveness;
  }

  async _analyzeCSSMinification(document) {
    const css = {
      externalFiles: 0,
      minifiedExternal: 0,
      inlineStyles: 0,
      minifiedInline: 0,
      coverage: 0
    };
    
    // External CSS files
    const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
    css.externalFiles = styleLinks.length;
    
    styleLinks.forEach(link => {
      if (this.minificationPatterns.cssMinified.test(link.href || '')) {
        css.minifiedExternal++;
      }
    });
    
    // Inline styles
    const styleElements = document.querySelectorAll('style');
    css.inlineStyles = styleElements.length;
    
    styleElements.forEach(style => {
      const content = style.textContent || '';
      if (this._appearMinified(content, 'css')) {
        css.minifiedInline++;
      }
    });
    
    css.coverage = css.externalFiles + css.inlineStyles > 0 ? 
      (css.minifiedExternal + css.minifiedInline) / (css.externalFiles + css.inlineStyles) : 0;
    
    return css;
  }

  async _analyzeJSMinification(document) {
    const js = {
      externalFiles: 0,
      minifiedExternal: 0,
      inlineScripts: 0,
      minifiedInline: 0,
      coverage: 0
    };
    
    // External JS files
    const scripts = document.querySelectorAll('script[src]');
    js.externalFiles = scripts.length;
    
    scripts.forEach(script => {
      if (this.minificationPatterns.jsMinified.test(script.src || '')) {
        js.minifiedExternal++;
      }
    });
    
    // Inline scripts
    const inlineScripts = document.querySelectorAll('script:not([src])');
    js.inlineScripts = inlineScripts.length;
    
    inlineScripts.forEach(script => {
      const content = script.textContent || '';
      if (this._appearMinified(content, 'js')) {
        js.minifiedInline++;
      }
    });
    
    js.coverage = js.externalFiles + js.inlineScripts > 0 ? 
      (js.minifiedExternal + js.minifiedInline) / (js.externalFiles + js.inlineScripts) : 0;
    
    return js;
  }

  async _analyzeHTMLMinification(document) {
    const html = {
      minified: false,
      whitespaceOptimized: false,
      commentsRemoved: false,
      score: 0
    };
    
    const htmlContent = document.documentElement.outerHTML;
    
    // Check for minification indicators
    const hasExcessiveWhitespace = /\n\s{4,}|\t{2,}/.test(htmlContent);
    const hasComments = /<!--[\s\S]*?-->/.test(htmlContent);
    const averageLineLength = htmlContent.split('\n').reduce((sum, line) => sum + line.length, 0) / 
                             htmlContent.split('\n').length;
    
    html.whitespaceOptimized = !hasExcessiveWhitespace;
    html.commentsRemoved = !hasComments;
    html.minified = html.whitespaceOptimized && html.commentsRemoved && averageLineLength > 80;
    
    html.score = (html.whitespaceOptimized ? 40 : 0) + 
                 (html.commentsRemoved ? 30 : 0) + 
                 (html.minified ? 30 : 0);
    
    return html;
  }

  _appearMinified(content, type) {
    if (!content || content.length < 100) return false;
    
    // Heuristics for minified content
    const avgLineLength = content.split('\n').reduce((sum, line) => sum + line.length, 0) / 
                         content.split('\n').length;
    const hasShortVariableNames = /\b[a-z]\b/.test(content);
    const noExcessiveWhitespace = !/\n\s{4,}/.test(content);
    
    return avgLineLength > 100 && hasShortVariableNames && noExcessiveWhitespace;
  }

  _calculateOverallMinification(minification) {
    const { css, javascript, html } = minification;
    
    return {
      overallCoverage: (css.coverage + javascript.coverage) / 2,
      score: (css.coverage * 100 + javascript.coverage * 100 + html.score) / 3,
      status: this._getMinificationStatus((css.coverage + javascript.coverage) / 2)
    };
  }

  _getMinificationStatus(coverage) {
    if (coverage >= 0.9) return 'excellent';
    if (coverage >= 0.7) return 'good';
    if (coverage >= 0.5) return 'moderate';
    return 'poor';
  }

  async _identifyCompressionOpportunities(document, performanceData) {
    const opportunities = [];
    
    if (performanceData && performanceData.getEntriesByType) {
      const resourceEntries = performanceData.getEntriesByType('resource') || [];
      
      resourceEntries.forEach(entry => {
        const originalSize = entry.decodedBodySize || 0;
        const compressedSize = entry.transferSize || entry.encodedBodySize || 0;
        
        if (originalSize > this.options.compressionThreshold && 
            compressedSize >= originalSize * 0.9) {
          opportunities.push({
            type: 'compression',
            priority: 'important',
            resource: entry.name,
            currentSize: compressedSize,
            potentialSize: Math.floor(originalSize * 0.7),
            potentialSavings: Math.floor(originalSize * 0.3),
            description: 'Enable compression for this resource'
          });
        }
      });
    }
    
    return opportunities;
  }

  async _identifyCachingOpportunities(document, performanceData) {
    const opportunities = [];
    
    // Identify static resources without proper caching
    const staticResources = this._getAllResourceUrls(document);
    
    staticResources.forEach(url => {
      const resourceType = this._getResourceTypeFromUrl(url);
      if (this._isResourceCacheable(resourceType)) {
        opportunities.push({
          type: 'caching',
          priority: 'important',
          resource: url,
          recommendation: 'Set appropriate cache headers',
          potentialImprovement: 'Reduce server requests on repeat visits'
        });
      }
    });
    
    return opportunities.slice(0, 5); // Limit to top 5
  }

  async _identifyCDNOpportunities(document, performanceData) {
    const opportunities = [];
    const resources = this._getAllResourceUrls(document);
    
    let nonCdnResources = 0;
    resources.forEach(url => {
      const isCdn = Object.values(this.cdnPatterns).some(pattern => pattern.test(url));
      if (!isCdn && !url.includes(window.location?.hostname || '')) {
        nonCdnResources++;
      }
    });
    
    if (nonCdnResources > 0) {
      opportunities.push({
        type: 'cdn',
        priority: 'minor',
        count: nonCdnResources,
        recommendation: 'Consider using a CDN for static resources',
        potentialImprovement: 'Faster resource delivery globally'
      });
    }
    
    return opportunities;
  }

  async _identifyBundlingOpportunities(document, performanceData) {
    const opportunities = [];
    
    const scripts = document.querySelectorAll('script[src]').length;
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
    
    if (scripts > 5) {
      opportunities.push({
        type: 'bundling',
        priority: 'critical',
        resource: 'JavaScript files',
        count: scripts,
        recommendation: 'Bundle JavaScript files to reduce HTTP requests',
        potentialSavings: Math.floor(scripts * 0.1) + 'KB header overhead'
      });
    }
    
    if (stylesheets > 3) {
      opportunities.push({
        type: 'bundling',
        priority: 'important',
        resource: 'CSS files',
        count: stylesheets,
        recommendation: 'Bundle CSS files to reduce HTTP requests',
        potentialSavings: Math.floor(stylesheets * 0.1) + 'KB header overhead'
      });
    }
    
    return opportunities;
  }

  async _identifyMinificationOpportunities(document) {
    const opportunities = [];
    
    // Check unminified CSS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    let unminifiedCSS = 0;
    
    cssLinks.forEach(link => {
      if (!this.minificationPatterns.cssMinified.test(link.href || '')) {
        unminifiedCSS++;
      }
    });
    
    if (unminifiedCSS > 0) {
      opportunities.push({
        type: 'minification',
        priority: 'important',
        resource: 'CSS files',
        count: unminifiedCSS,
        recommendation: 'Minify CSS files to reduce file size',
        potentialSavings: '20-30% file size reduction'
      });
    }
    
    // Check unminified JavaScript
    const scripts = document.querySelectorAll('script[src]');
    let unminifiedJS = 0;
    
    scripts.forEach(script => {
      if (!this.minificationPatterns.jsMinified.test(script.src || '')) {
        unminifiedJS++;
      }
    });
    
    if (unminifiedJS > 0) {
      opportunities.push({
        type: 'minification',
        priority: 'important',
        resource: 'JavaScript files',
        count: unminifiedJS,
        recommendation: 'Minify JavaScript files to reduce file size',
        potentialSavings: '25-40% file size reduction'
      });
    }
    
    return opportunities;
  }

  _calculateTotalSavings(opportunities) {
    let totalSavings = 0;
    
    [...opportunities.critical, ...opportunities.important, ...opportunities.minor]
      .forEach(opp => {
        if (opp.potentialSavings && typeof opp.potentialSavings === 'number') {
          totalSavings += opp.potentialSavings;
        }
      });
    
    return totalSavings;
  }

  _assessImplementationEffort(opportunities) {
    return {
      critical: opportunities.critical.length,
      important: opportunities.important.length,
      minor: opportunities.minor.length,
      totalEffort: opportunities.critical.length * 3 + 
                   opportunities.important.length * 2 + 
                   opportunities.minor.length * 1
    };
  }

  _calculateBandwidthEfficiency(resourceEntries) {
    let efficientResources = 0;
    
    resourceEntries.forEach(entry => {
      const transferSize = entry.transferSize || 0;
      const encodedSize = entry.encodedBodySize || 0;
      
      if (transferSize < encodedSize * 0.8 && encodedSize > 1024) {
        efficientResources++;
      }
    });
    
    return resourceEntries.length > 0 ? (efficientResources / resourceEntries.length) : 0;
  }

  _identifyDeliveryBottlenecks(resourceEntries) {
    const bottlenecks = [];
    
    resourceEntries.forEach(entry => {
      if (entry.duration > this.options.slowResourceThreshold) {
        bottlenecks.push({
          resource: entry.name,
          duration: entry.duration,
          size: entry.transferSize || 0,
          type: this._getResourceTypeFromUrl(entry.name),
          severity: entry.duration > this.options.slowResourceThreshold * 2 ? 'critical' : 'moderate'
        });
      }
    });
    
    return bottlenecks.sort((a, b) => b.duration - a.duration).slice(0, 10);
  }

  _calculateDeliveryEfficiency(delivery) {
    let score = 100;
    
    // Penalize high latency
    if (delivery.latency.averageLatency > 1000) {
      score -= 20;
    } else if (delivery.latency.averageLatency > 500) {
      score -= 10;
    }
    
    // Penalize low throughput
    if (delivery.throughput.bytesPerSecond < 100000) { // 100KB/s
      score -= 15;
    }
    
    // Penalize bottlenecks
    score -= delivery.bottlenecks.length * 5;
    
    return {
      score: Math.max(0, score),
      status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'moderate' : 'poor'
    };
  }

  _generateCompressionRecommendations(compression) {
    const recommendations = [];
    
    if (compression.coverage.compressionRate < 0.8) {
      recommendations.push({
        type: 'compression',
        priority: 'high',
        title: 'Enable compression for more resources',
        description: `Only ${Math.round(compression.coverage.compressionRate * 100)}% of resources are compressed`
      });
    }
    
    if (compression.effectiveness.overallRatio > 0.8) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        title: 'Improve compression ratio',
        description: 'Consider using Brotli compression for better compression ratios'
      });
    }
    
    return recommendations;
  }

  _generateCachingRecommendations(caching) {
    const recommendations = [];
    
    if (caching.effectiveness.cacheHitRate < 0.6) {
      recommendations.push({
        type: 'caching',
        priority: 'high',
        title: 'Improve cache utilization',
        description: 'Set appropriate cache headers for static resources'
      });
    }
    
    return recommendations;
  }

  _generateCDNRecommendations(cdn) {
    const recommendations = [];
    
    if (cdn.coverage.cdnUtilization < 0.5) {
      recommendations.push({
        type: 'cdn',
        priority: 'medium',
        title: 'Increase CDN usage',
        description: 'Consider using a CDN for more static resources'
      });
    }
    
    return recommendations;
  }

  _generateBundlingRecommendations(bundling) {
    const recommendations = [];
    
    if (!bundling.detected) {
      recommendations.push({
        type: 'bundling',
        priority: 'high',
        title: 'Implement resource bundling',
        description: 'Bundle JavaScript and CSS files to reduce HTTP requests'
      });
    }
    
    return recommendations;
  }

  _generateMinificationRecommendations(minification) {
    const recommendations = [];
    
    if (minification.overall.score < 70) {
      recommendations.push({
        type: 'minification',
        priority: 'medium',
        title: 'Improve minification coverage',
        description: 'Minify more CSS and JavaScript files'
      });
    }
    
    return recommendations;
  }

  _calculateOptimizationScore(results) {
    let totalScore = 0;
    let components = 0;
    
    if (results.compression) {
      totalScore += (results.compression.coverage.compressionRate || 0) * 100;
      components++;
    }
    
    if (results.caching) {
      totalScore += (results.caching.effectiveness.cacheHitRate || 0) * 100;
      components++;
    }
    
    if (results.cdn) {
      totalScore += (results.cdn.coverage.cdnUtilization || 0) * 100;
      components++;
    }
    
    if (results.minification) {
      totalScore += results.minification.overall.score || 0;
      components++;
    }
    
    const overall = components > 0 ? Math.round(totalScore / components) : 0;
    
    return {
      overall,
      components: {
        compression: results.compression ? Math.round((results.compression.coverage.compressionRate || 0) * 100) : null,
        caching: results.caching ? Math.round((results.caching.effectiveness.cacheHitRate || 0) * 100) : null,
        cdn: results.cdn ? Math.round((results.cdn.coverage.cdnUtilization || 0) * 100) : null,
        minification: results.minification ? Math.round(results.minification.overall.score || 0) : null
      },
      status: overall >= 90 ? 'excellent' : overall >= 75 ? 'good' : overall >= 60 ? 'moderate' : 'poor'
    };
  }

  _generateOptimizationSummary(results) {
    const totalOpportunities = (results.opportunities.critical?.length || 0) +
                              (results.opportunities.important?.length || 0) +
                              (results.opportunities.minor?.length || 0);
    
    return {
      overallScore: results.score.overall || 0,
      totalOpportunities,
      criticalIssues: results.opportunities.critical?.length || 0,
      potentialSavings: results.opportunities.totalSavings || 0,
      compressionEnabled: results.compression?.enabled || false,
      cdnUsage: results.cdn?.usage || false,
      bundlingDetected: results.bundling?.detected || false,
      recommendations: totalOpportunities > 0 ? 'Multiple optimization opportunities identified' : 'Resource optimization is well implemented'
    };
  }
}

export default ResourceOptimizationDetector;
