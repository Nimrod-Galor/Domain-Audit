/**
 * ============================================================================
 * DEPENDENCY MAPPING DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced dependency mapping and relationship analysis for third-party services
 * Part of Third-Party Analyzer Combined Approach (12th Implementation)
 * 
 * Capabilities:
 * - Service dependency graph construction
 * - Critical path dependency analysis
 * - Circular dependency detection
 * - Version compatibility assessment
 * - Security vulnerability mapping
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class DependencyMappingDetector {
  constructor(options = {}) {
    this.options = {
      // Dependency Analysis Configuration
      analysisDepth: options.analysisDepth || 'comprehensive',
      enableVersionDetection: options.enableVersionDetection !== false,
      enableVulnerabilityCheck: options.enableVulnerabilityCheck !== false,
      enableCriticalPathMapping: options.enableCriticalPathMapping !== false,
      enableCircularDetection: options.enableCircularDetection !== false,
      
      // Mapping Configuration
      maxDepth: options.maxDepth || 5,
      includeIndirectDependencies: options.includeIndirectDependencies !== false,
      trackLoadingOrder: options.trackLoadingOrder !== false,
      
      // Analysis Thresholds
      criticalDependencyThreshold: options.criticalDependencyThreshold || 3,
      maxCircularDepth: options.maxCircularDepth || 10,
      dependencyTimeoutMs: options.dependencyTimeoutMs || 5000,
      
      // Vulnerability Assessment
      enableSecurityScan: options.enableSecurityScan !== false,
      securityDatabases: options.securityDatabases || ['npm-audit', 'snyk', 'github'],
      
      ...options
    };

    this.detectorType = 'dependency_mapping_detector';
    this.version = '1.0.0';
    
    // Known service dependency patterns
    this.dependencyPatterns = {
      // JavaScript Frameworks and Libraries
      frameworks: {
        'React': {
          patterns: [/react\.js|react\.min\.js|react\.development\.js/],
          dependencies: ['react-dom'],
          conflicts: ['angular', 'vue'],
          versions: {
            current: '18.x',
            supported: ['16.x', '17.x', '18.x'],
            deprecated: ['15.x', '14.x']
          }
        },
        'Vue.js': {
          patterns: [/vue\.js|vue\.min\.js|vue\.runtime/],
          dependencies: [],
          conflicts: ['react', 'angular'],
          versions: {
            current: '3.x',
            supported: ['2.x', '3.x'],
            deprecated: ['1.x']
          }
        },
        'Angular': {
          patterns: [/angular\.js|angular\.min\.js|angular\.core/],
          dependencies: ['zone.js', 'rxjs'],
          conflicts: ['react', 'vue'],
          versions: {
            current: '15.x',
            supported: ['12.x', '13.x', '14.x', '15.x'],
            deprecated: ['1.x', '9.x', '10.x', '11.x']
          }
        },
        'jQuery': {
          patterns: [/jquery\.js|jquery\.min\.js|jquery-\d/],
          dependencies: [],
          conflicts: [],
          versions: {
            current: '3.x',
            supported: ['3.x'],
            deprecated: ['1.x', '2.x']
          }
        }
      },

      // Analytics and Tracking
      analytics: {
        'Google Analytics': {
          patterns: [/google-analytics\.com|googletagmanager\.com|gtag/],
          dependencies: [],
          loadOrder: 'early',
          criticalPath: true,
          dataFlow: ['user_behavior', 'page_views', 'conversions']
        },
        'Facebook Pixel': {
          patterns: [/connect\.facebook\.net.*fbevents/],
          dependencies: [],
          loadOrder: 'early',
          criticalPath: false,
          dataFlow: ['conversion_events', 'custom_events']
        },
        'Hotjar': {
          patterns: [/hotjar\.com/],
          dependencies: [],
          loadOrder: 'deferred',
          criticalPath: false,
          dataFlow: ['session_recordings', 'heatmaps']
        }
      },

      // CDN and Infrastructure
      cdn: {
        'Cloudflare': {
          patterns: [/cloudflare\.com|cdnjs\.cloudflare\.com/],
          dependencies: [],
          reliability: 'high',
          geographical: 'global',
          fallbacks: ['jsdelivr', 'unpkg']
        },
        'jsDelivr': {
          patterns: [/jsdelivr\.net/],
          dependencies: [],
          reliability: 'high',
          geographical: 'global',
          fallbacks: ['cdnjs', 'unpkg']
        },
        'Google CDN': {
          patterns: [/googleapis\.com|gstatic\.com/],
          dependencies: [],
          reliability: 'high',
          geographical: 'global',
          fallbacks: []
        }
      },

      // Social Media and Widgets
      social: {
        'YouTube Embed': {
          patterns: [/youtube\.com\/embed|youtu\.be/],
          dependencies: [],
          loadOrder: 'lazy',
          performance: 'heavy',
          alternatives: ['youtube-nocookie.com']
        },
        'Twitter Widget': {
          patterns: [/platform\.twitter\.com|syndication\.twitter\.com/],
          dependencies: [],
          loadOrder: 'deferred',
          performance: 'medium',
          alternatives: []
        }
      }
    };

    // Known vulnerability patterns
    this.vulnerabilityPatterns = {
      'jQuery < 3.0.0': {
        pattern: /jquery-[12]\./,
        severity: 'high',
        cve: ['CVE-2020-11022', 'CVE-2020-11023'],
        description: 'Cross-site scripting vulnerabilities'
      },
      'lodash < 4.17.19': {
        pattern: /lodash\.js|lodash\.min\.js/,
        severity: 'high',
        cve: ['CVE-2020-8203'],
        description: 'Prototype pollution vulnerability'
      },
      'moment.js': {
        pattern: /moment\.js|moment\.min\.js/,
        severity: 'medium',
        cve: [],
        description: 'Legacy library with performance issues'
      }
    };

    // Dependency relationship types
    this.relationshipTypes = {
      REQUIRED: 'required',
      OPTIONAL: 'optional',
      CONFLICTING: 'conflicting',
      ENHANCING: 'enhancing',
      FALLBACK: 'fallback'
    };

    // Loading patterns
    this.loadingPatterns = {
      BLOCKING: 'blocking',
      ASYNC: 'async',
      DEFER: 'defer',
      DYNAMIC: 'dynamic',
      LAZY: 'lazy'
    };
    
    console.log('🔗 Dependency Mapping Detector initialized (GPT-5 Style)');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'DependencyMappingDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced dependency mapping and relationship analysis for third-party services',
      
      capabilities: [
        'dependency_graph_construction',
        'critical_path_analysis',
        'circular_dependency_detection',
        'version_compatibility_assessment',
        'security_vulnerability_mapping',
        'loading_order_analysis',
        'conflict_detection'
      ],
      
      analysisTypes: [
        'service_dependencies',
        'framework_conflicts',
        'version_mismatches',
        'security_vulnerabilities',
        'performance_bottlenecks',
        'single_points_of_failure',
        'optimization_opportunities'
      ],
      
      configuration: {
        analysisDepth: this.options.analysisDepth,
        maxDepth: this.options.maxDepth,
        enableVersionDetection: this.options.enableVersionDetection,
        enableVulnerabilityCheck: this.options.enableVulnerabilityCheck
      },
      
      patterns: {
        dependencyPatterns: Object.keys(this.dependencyPatterns).length,
        vulnerabilityPatterns: Object.keys(this.vulnerabilityPatterns).length,
        relationshipTypes: Object.keys(this.relationshipTypes).length
      },
      
      approach: 'GPT-5 Style Dependency Mapping'
    };
  }

  /**
   * Main dependency mapping analysis method
   * @param {Object} document - Document object to analyze
   * @param {Object} context - Analysis context and configuration
   * @returns {Promise<Object>} Dependency mapping analysis results
   */
  async analyze(document, context = {}) {
    const startTime = Date.now();
    
    try {
      if (!document) {
        throw new Error('Document is required for dependency mapping');
      }

      console.log('🔗 Starting dependency mapping analysis...');

      // Core Dependency Analysis
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Service Discovery
        services: await this._discoverServices(document, context),
        
        // Dependency Graph Construction
        dependencies: await this._constructDependencyGraph(document, context),
        
        // Critical Path Analysis
        criticalPath: this.options.enableCriticalPathMapping ?
          await this._analyzeCriticalPath(document, context) : null,
        
        // Circular Dependency Detection
        circularDependencies: this.options.enableCircularDetection ?
          await this._detectCircularDependencies(document, context) : null,
        
        // Version Analysis
        versions: this.options.enableVersionDetection ?
          await this._analyzeVersions(document, context) : null,
        
        // Vulnerability Assessment
        vulnerabilities: this.options.enableVulnerabilityCheck ?
          await this._assessVulnerabilities(document, context) : null,
        
        // Loading Order Analysis
        loadingOrder: this.options.trackLoadingOrder ?
          await this._analyzeLoadingOrder(document, context) : null,
        
        // Optimization Recommendations
        optimization: await this._generateOptimizationRecommendations(document, context),
        
        // Analysis Summary
        summary: {},
        
        executionTime: Date.now() - startTime
      };

      // Generate dependency summary
      results.summary = this._generateDependencySummary(results);
      
      console.log(`✅ Dependency mapping completed in ${results.executionTime}ms`);
      console.log(`📊 Services mapped: ${results.summary.totalServices || 0}`);
      console.log(`🔗 Dependencies found: ${results.summary.totalDependencies || 0}`);
      
      return results;

    } catch (error) {
      console.error('❌ Dependency mapping failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Discover services and their characteristics
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Service discovery results
   */
  async _discoverServices(document, context) {
    const services = {
      detected: [],
      byCategory: {},
      byLoadingPattern: {},
      total: 0
    };

    try {
      // Discover services from scripts
      const scriptServices = await this._discoverScriptServices(document);
      services.detected.push(...scriptServices);
      
      // Discover services from stylesheets
      const styleServices = await this._discoverStyleServices(document);
      services.detected.push(...styleServices);
      
      // Discover services from other resources
      const otherServices = await this._discoverOtherServices(document);
      services.detected.push(...otherServices);
      
      // Categorize services
      services.byCategory = this._categorizeServices(services.detected);
      services.byLoadingPattern = this._categorizeByLoadingPattern(services.detected);
      services.total = services.detected.length;

    } catch (error) {
      console.error('Service discovery failed:', error);
    }

    return services;
  }

  /**
   * Construct dependency graph
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Dependency graph construction results
   */
  async _constructDependencyGraph(document, context) {
    const graph = {
      nodes: [],
      edges: [],
      clusters: [],
      statistics: {}
    };

    try {
      // Get discovered services
      const services = await this._discoverServices(document, context);
      
      // Create nodes for each service
      graph.nodes = services.detected.map(service => ({
        id: this._generateServiceId(service),
        name: service.name,
        type: service.type,
        url: service.url,
        category: service.category,
        loadingPattern: service.loadingPattern,
        critical: service.critical || false
      }));
      
      // Create edges for dependencies
      graph.edges = await this._identifyDependencyEdges(services.detected);
      
      // Identify service clusters
      graph.clusters = this._identifyServiceClusters(graph.nodes, graph.edges);
      
      // Calculate graph statistics
      graph.statistics = this._calculateGraphStatistics(graph);

    } catch (error) {
      console.error('Dependency graph construction failed:', error);
    }

    return graph;
  }

  /**
   * Analyze critical path dependencies
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Critical path analysis results
   */
  async _analyzeCriticalPath(document, context) {
    const criticalPath = {
      path: [],
      blockingServices: [],
      bottlenecks: [],
      optimization: {}
    };

    try {
      // Identify blocking services
      criticalPath.blockingServices = await this._identifyBlockingServices(document);
      
      // Construct critical path
      criticalPath.path = this._constructCriticalPath(criticalPath.blockingServices);
      
      // Identify bottlenecks
      criticalPath.bottlenecks = this._identifyBottlenecks(criticalPath.path);
      
      // Generate optimization recommendations
      criticalPath.optimization = this._generateCriticalPathOptimization(criticalPath);

    } catch (error) {
      console.error('Critical path analysis failed:', error);
    }

    return criticalPath;
  }

  /**
   * Detect circular dependencies
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Circular dependency detection results
   */
  async _detectCircularDependencies(document, context) {
    const circular = {
      detected: false,
      cycles: [],
      severity: 'none',
      recommendations: []
    };

    try {
      // Get dependency graph
      const graph = await this._constructDependencyGraph(document, context);
      
      // Detect cycles using depth-first search
      circular.cycles = this._detectCyclesInGraph(graph);
      circular.detected = circular.cycles.length > 0;
      
      // Assess severity
      circular.severity = this._assessCircularDependencySeverity(circular.cycles);
      
      // Generate recommendations
      circular.recommendations = this._generateCircularDependencyRecommendations(circular.cycles);

    } catch (error) {
      console.error('Circular dependency detection failed:', error);
    }

    return circular;
  }

  /**
   * Analyze service versions
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Version analysis results
   */
  async _analyzeVersions(document, context) {
    const versions = {
      detected: [],
      outdated: [],
      incompatible: [],
      recommendations: []
    };

    try {
      // Detect service versions
      versions.detected = await this._detectServiceVersions(document);
      
      // Identify outdated versions
      versions.outdated = this._identifyOutdatedVersions(versions.detected);
      
      // Check for incompatibilities
      versions.incompatible = this._checkVersionIncompatibilities(versions.detected);
      
      // Generate version recommendations
      versions.recommendations = this._generateVersionRecommendations(versions);

    } catch (error) {
      console.error('Version analysis failed:', error);
    }

    return versions;
  }

  /**
   * Assess security vulnerabilities
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Vulnerability assessment results
   */
  async _assessVulnerabilities(document, context) {
    const vulnerabilities = {
      detected: [],
      bySeverity: {},
      recommendations: []
    };

    try {
      // Scan for known vulnerabilities
      vulnerabilities.detected = await this._scanForVulnerabilities(document);
      
      // Categorize by severity
      vulnerabilities.bySeverity = this._categorizeVulnerabilitiesBySeverity(vulnerabilities.detected);
      
      // Generate security recommendations
      vulnerabilities.recommendations = this._generateSecurityRecommendations(vulnerabilities.detected);

    } catch (error) {
      console.error('Vulnerability assessment failed:', error);
    }

    return vulnerabilities;
  }

  /**
   * Analyze loading order
   * @param {Object} document - Document to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Loading order analysis results
   */
  async _analyzeLoadingOrder(document, context) {
    const loadingOrder = {
      sequence: [],
      patterns: {},
      optimization: {}
    };

    try {
      // Determine loading sequence
      loadingOrder.sequence = await this._determineLoadingSequence(document);
      
      // Analyze loading patterns
      loadingOrder.patterns = this._analyzeLoadingPatterns(loadingOrder.sequence);
      
      // Generate loading optimization recommendations
      loadingOrder.optimization = this._generateLoadingOptimization(loadingOrder);

    } catch (error) {
      console.error('Loading order analysis failed:', error);
    }

    return loadingOrder;
  }

  // ============================================================================
  // HELPER METHODS - SERVICE DISCOVERY
  // ============================================================================

  async _discoverScriptServices(document) {
    const services = [];

    try {
      const scripts = document.querySelectorAll('script');
      
      scripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        const service = this._identifyServiceFromScript(script, src, index);
        if (service) {
          services.push(service);
        }
      });

    } catch (error) {
      console.error('Script service discovery failed:', error);
    }

    return services;
  }

  async _discoverStyleServices(document) {
    const services = [];

    try {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      
      links.forEach((link, index) => {
        const href = link.getAttribute('href');
        const service = this._identifyServiceFromStylesheet(link, href, index);
        if (service) {
          services.push(service);
        }
      });

    } catch (error) {
      console.error('Style service discovery failed:', error);
    }

    return services;
  }

  async _discoverOtherServices(document) {
    const services = [];

    try {
      // Images
      const images = document.querySelectorAll('img[src]');
      images.forEach((img, index) => {
        const src = img.getAttribute('src');
        const service = this._identifyServiceFromImage(img, src, index);
        if (service) {
          services.push(service);
        }
      });

      // Iframes
      const iframes = document.querySelectorAll('iframe[src]');
      iframes.forEach((iframe, index) => {
        const src = iframe.getAttribute('src');
        const service = this._identifyServiceFromIframe(iframe, src, index);
        if (service) {
          services.push(service);
        }
      });

    } catch (error) {
      console.error('Other service discovery failed:', error);
    }

    return services;
  }

  _identifyServiceFromScript(script, src, index) {
    const service = {
      id: `script_${index}`,
      name: this._extractServiceName(src),
      type: 'script',
      url: src,
      element: script,
      loadingPattern: this._determineScriptLoadingPattern(script),
      category: this._categorizeService(src),
      dependencies: [],
      critical: this._isScriptCritical(script, src)
    };

    // Check against known patterns
    const knownService = this._matchKnownService(src);
    if (knownService) {
      Object.assign(service, knownService);
    }

    return service;
  }

  _identifyServiceFromStylesheet(link, href, index) {
    if (!href || this._isInternalResource(href)) {
      return null;
    }

    return {
      id: `style_${index}`,
      name: this._extractServiceName(href),
      type: 'stylesheet',
      url: href,
      element: link,
      loadingPattern: this._determineStyleLoadingPattern(link),
      category: this._categorizeService(href),
      dependencies: [],
      critical: true // Stylesheets are generally critical
    };
  }

  _identifyServiceFromImage(img, src, index) {
    if (!src || this._isInternalResource(src) || this._isDataUrl(src)) {
      return null;
    }

    return {
      id: `image_${index}`,
      name: this._extractServiceName(src),
      type: 'image',
      url: src,
      element: img,
      loadingPattern: this._determineImageLoadingPattern(img),
      category: this._categorizeService(src),
      dependencies: [],
      critical: false
    };
  }

  _identifyServiceFromIframe(iframe, src, index) {
    if (!src || this._isInternalResource(src)) {
      return null;
    }

    return {
      id: `iframe_${index}`,
      name: this._extractServiceName(src),
      type: 'iframe',
      url: src,
      element: iframe,
      loadingPattern: this._determineIframeLoadingPattern(iframe),
      category: this._categorizeService(src),
      dependencies: [],
      critical: false
    };
  }

  // ============================================================================
  // HELPER METHODS - DEPENDENCY ANALYSIS
  // ============================================================================

  async _identifyDependencyEdges(services) {
    const edges = [];

    try {
      // Analyze each service for dependencies
      services.forEach(service => {
        const dependencies = this._findServiceDependencies(service, services);
        
        dependencies.forEach(dependency => {
          edges.push({
            from: service.id,
            to: dependency.id,
            type: dependency.relationship,
            weight: dependency.weight || 1
          });
        });
      });

    } catch (error) {
      console.error('Dependency edge identification failed:', error);
    }

    return edges;
  }

  _findServiceDependencies(service, allServices) {
    const dependencies = [];

    try {
      // Check known dependency patterns
      const knownDeps = this._getKnownDependencies(service);
      
      knownDeps.forEach(depPattern => {
        const matchingService = allServices.find(s => 
          this._matchesPattern(s.url, depPattern.patterns)
        );
        
        if (matchingService) {
          dependencies.push({
            id: matchingService.id,
            relationship: this.relationshipTypes.REQUIRED,
            weight: 2
          });
        }
      });

      // Check for framework conflicts
      const conflicts = this._findFrameworkConflicts(service, allServices);
      conflicts.forEach(conflict => {
        dependencies.push({
          id: conflict.id,
          relationship: this.relationshipTypes.CONFLICTING,
          weight: -1
        });
      });

    } catch (error) {
      console.error('Service dependency finding failed:', error);
    }

    return dependencies;
  }

  _identifyServiceClusters(nodes, edges) {
    const clusters = [];

    try {
      // Group nodes by category
      const categoryGroups = {};
      
      nodes.forEach(node => {
        const category = node.category || 'other';
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(node.id);
      });

      // Convert groups to clusters
      Object.entries(categoryGroups).forEach(([category, nodeIds]) => {
        if (nodeIds.length > 1) {
          clusters.push({
            id: `cluster_${category}`,
            name: category,
            nodes: nodeIds,
            type: 'category'
          });
        }
      });

      // Identify strongly connected components
      const stronglyConnected = this._findStronglyConnectedComponents(nodes, edges);
      stronglyConnected.forEach((component, index) => {
        if (component.length > 1) {
          clusters.push({
            id: `cluster_connected_${index}`,
            name: `Connected Component ${index + 1}`,
            nodes: component,
            type: 'connected'
          });
        }
      });

    } catch (error) {
      console.error('Service cluster identification failed:', error);
    }

    return clusters;
  }

  // ============================================================================
  // HELPER METHODS - CRITICAL PATH ANALYSIS
  // ============================================================================

  async _identifyBlockingServices(document) {
    const blocking = [];

    try {
      // Blocking scripts
      const blockingScripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      blockingScripts.forEach((script, index) => {
        blocking.push({
          id: `blocking_script_${index}`,
          type: 'script',
          url: script.getAttribute('src'),
          element: script,
          impact: 'high'
        });
      });

      // Blocking stylesheets
      const blockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
      blockingStyles.forEach((link, index) => {
        blocking.push({
          id: `blocking_style_${index}`,
          type: 'stylesheet',
          url: link.getAttribute('href'),
          element: link,
          impact: 'high'
        });
      });

    } catch (error) {
      console.error('Blocking service identification failed:', error);
    }

    return blocking;
  }

  _constructCriticalPath(blockingServices) {
    // Sort by DOM order to determine loading sequence
    return blockingServices.sort((a, b) => {
      const posA = this._getElementPosition(a.element);
      const posB = this._getElementPosition(b.element);
      return posA - posB;
    });
  }

  _identifyBottlenecks(criticalPath) {
    const bottlenecks = [];

    try {
      // Identify services that could cause delays
      criticalPath.forEach(service => {
        if (this._isServiceBottleneck(service)) {
          bottlenecks.push({
            service: service.id,
            type: 'performance',
            reason: 'slow_loading_service',
            impact: 'high'
          });
        }
      });

    } catch (error) {
      console.error('Bottleneck identification failed:', error);
    }

    return bottlenecks;
  }

  // ============================================================================
  // HELPER METHODS - CIRCULAR DEPENDENCY DETECTION
  // ============================================================================

  _detectCyclesInGraph(graph) {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();

    try {
      // Create adjacency list
      const adjacencyList = this._createAdjacencyList(graph);

      // DFS for cycle detection
      const dfs = (node, path) => {
        if (recursionStack.has(node)) {
          // Found a cycle
          const cycleStart = path.indexOf(node);
          cycles.push(path.slice(cycleStart));
          return;
        }

        if (visited.has(node)) {
          return;
        }

        visited.add(node);
        recursionStack.add(node);
        
        const neighbors = adjacencyList[node] || [];
        neighbors.forEach(neighbor => {
          dfs(neighbor, [...path, neighbor]);
        });

        recursionStack.delete(node);
      };

      // Start DFS from each unvisited node
      graph.nodes.forEach(node => {
        if (!visited.has(node.id)) {
          dfs(node.id, [node.id]);
        }
      });

    } catch (error) {
      console.error('Cycle detection failed:', error);
    }

    return cycles;
  }

  _createAdjacencyList(graph) {
    const adjacencyList = {};

    graph.nodes.forEach(node => {
      adjacencyList[node.id] = [];
    });

    graph.edges.forEach(edge => {
      if (adjacencyList[edge.from]) {
        adjacencyList[edge.from].push(edge.to);
      }
    });

    return adjacencyList;
  }

  // ============================================================================
  // HELPER METHODS - VERSION ANALYSIS
  // ============================================================================

  async _detectServiceVersions(document) {
    const versions = [];

    try {
      const scripts = document.querySelectorAll('script[src]');
      
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        const version = this._extractVersionFromUrl(src);
        
        if (version) {
          versions.push({
            service: this._extractServiceName(src),
            version: version.version,
            url: src,
            pattern: version.pattern
          });
        }
      });

    } catch (error) {
      console.error('Version detection failed:', error);
    }

    return versions;
  }

  _extractVersionFromUrl(url) {
    if (!url) return null;

    // Common version patterns in URLs
    const versionPatterns = [
      { pattern: /(\d+\.\d+\.\d+)/, type: 'semver' },
      { pattern: /v(\d+\.\d+)/, type: 'version' },
      { pattern: /(\d+\.\d+)/, type: 'major.minor' },
      { pattern: /@(\d+\.\d+\.\d+)/, type: 'npm_version' }
    ];

    for (const versionPattern of versionPatterns) {
      const match = url.match(versionPattern.pattern);
      if (match) {
        return {
          version: match[1],
          pattern: versionPattern.type
        };
      }
    }

    return null;
  }

  _identifyOutdatedVersions(detectedVersions) {
    const outdated = [];

    try {
      detectedVersions.forEach(versionInfo => {
        const servicePattern = this._findServicePattern(versionInfo.service);
        
        if (servicePattern && servicePattern.versions) {
          const isOutdated = this._isVersionOutdated(
            versionInfo.version, 
            servicePattern.versions
          );
          
          if (isOutdated) {
            outdated.push({
              ...versionInfo,
              currentVersion: servicePattern.versions.current,
              supportedVersions: servicePattern.versions.supported,
              deprecatedVersions: servicePattern.versions.deprecated
            });
          }
        }
      });

    } catch (error) {
      console.error('Outdated version identification failed:', error);
    }

    return outdated;
  }

  // ============================================================================
  // HELPER METHODS - VULNERABILITY ASSESSMENT
  // ============================================================================

  async _scanForVulnerabilities(document) {
    const vulnerabilities = [];

    try {
      const scripts = document.querySelectorAll('script[src]');
      
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        
        Object.entries(this.vulnerabilityPatterns).forEach(([vulnName, vulnInfo]) => {
          if (vulnInfo.pattern.test(src)) {
            vulnerabilities.push({
              service: this._extractServiceName(src),
              vulnerability: vulnName,
              severity: vulnInfo.severity,
              cve: vulnInfo.cve,
              description: vulnInfo.description,
              url: src
            });
          }
        });
      });

    } catch (error) {
      console.error('Vulnerability scanning failed:', error);
    }

    return vulnerabilities;
  }

  _categorizeVulnerabilitiesBySeverity(vulnerabilities) {
    const categories = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    vulnerabilities.forEach(vuln => {
      const severity = vuln.severity || 'medium';
      if (categories[severity]) {
        categories[severity].push(vuln);
      }
    });

    return categories;
  }

  // ============================================================================
  // HELPER METHODS - LOADING ORDER ANALYSIS
  // ============================================================================

  async _determineLoadingSequence(document) {
    const sequence = [];

    try {
      // Get all resources in DOM order
      const allResources = [
        ...Array.from(document.querySelectorAll('script[src]')).map(el => ({ 
          element: el, 
          type: 'script', 
          url: el.getAttribute('src') 
        })),
        ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(el => ({ 
          element: el, 
          type: 'stylesheet', 
          url: el.getAttribute('href') 
        }))
      ];

      // Sort by DOM position
      allResources.sort((a, b) => {
        const posA = this._getElementPosition(a.element);
        const posB = this._getElementPosition(b.element);
        return posA - posB;
      });

      // Add loading characteristics
      allResources.forEach((resource, index) => {
        sequence.push({
          order: index + 1,
          type: resource.type,
          url: resource.url,
          loadingPattern: this._getResourceLoadingPattern(resource.element),
          blocking: this._isResourceBlocking(resource.element)
        });
      });

    } catch (error) {
      console.error('Loading sequence determination failed:', error);
    }

    return sequence;
  }

  // ============================================================================
  // HELPER METHODS - UTILITIES
  // ============================================================================

  _generateServiceId(service) {
    return `${service.type}_${this._hashString(service.url || service.name)}`;
  }

  _extractServiceName(url) {
    if (!url) return 'unknown';
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract filename without extension
      const filename = pathname.split('/').pop();
      const nameWithoutExt = filename.split('.')[0];
      
      return nameWithoutExt || urlObj.hostname;
    } catch (error) {
      return 'unknown';
    }
  }

  _determineScriptLoadingPattern(script) {
    if (script.hasAttribute('async')) return this.loadingPatterns.ASYNC;
    if (script.hasAttribute('defer')) return this.loadingPatterns.DEFER;
    if (script.getAttribute('type') === 'module') return this.loadingPatterns.ASYNC;
    return this.loadingPatterns.BLOCKING;
  }

  _determineStyleLoadingPattern(link) {
    const media = link.getAttribute('media');
    if (media && media !== 'all' && media !== 'screen') {
      return this.loadingPatterns.DEFER;
    }
    return this.loadingPatterns.BLOCKING;
  }

  _determineImageLoadingPattern(img) {
    const loading = img.getAttribute('loading');
    if (loading === 'lazy') return this.loadingPatterns.LAZY;
    return this.loadingPatterns.ASYNC;
  }

  _determineIframeLoadingPattern(iframe) {
    const loading = iframe.getAttribute('loading');
    if (loading === 'lazy') return this.loadingPatterns.LAZY;
    return this.loadingPatterns.ASYNC;
  }

  _categorizeService(url) {
    if (!url) return 'other';

    // Check against known patterns
    for (const [category, services] of Object.entries(this.dependencyPatterns)) {
      for (const service of Object.values(services)) {
        if (service.patterns && this._matchesPattern(url, service.patterns)) {
          return category;
        }
      }
    }

    // Fallback categorization
    if (/cdn|static|assets/.test(url)) return 'cdn';
    if (/analytics|tracking/.test(url)) return 'analytics';
    if (/social|facebook|twitter|youtube/.test(url)) return 'social';
    if (/font/.test(url)) return 'fonts';
    
    return 'other';
  }

  _isScriptCritical(script, src) {
    // Check if script is in head or has critical patterns
    const isInHead = script.closest('head') !== null;
    const hasCriticalPattern = /critical|important|essential/.test(src || '');
    const isBlocking = !script.hasAttribute('async') && !script.hasAttribute('defer');
    
    return isInHead || hasCriticalPattern || isBlocking;
  }

  _isInternalResource(url) {
    if (!url) return true;
    
    // Relative URLs are internal
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    
    // Check if it's the same domain
    try {
      const urlObj = new URL(url);
      // This would need the current domain context
      return false; // Assume external for safety
    } catch (error) {
      return true; // Invalid URL, treat as internal
    }
  }

  _isDataUrl(url) {
    return url && url.startsWith('data:');
  }

  _matchKnownService(url) {
    if (!url) return null;

    // Check all dependency patterns
    for (const [category, services] of Object.entries(this.dependencyPatterns)) {
      for (const [serviceName, config] of Object.entries(services)) {
        if (config.patterns && this._matchesPattern(url, config.patterns)) {
          return {
            name: serviceName,
            category,
            knownService: true,
            ...config
          };
        }
      }
    }

    return null;
  }

  _matchesPattern(url, patterns) {
    if (!patterns || !Array.isArray(patterns)) return false;
    return patterns.some(pattern => pattern.test(url));
  }

  _categorizeServices(services) {
    const categories = {};
    
    services.forEach(service => {
      const category = service.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(service);
    });
    
    return categories;
  }

  _categorizeByLoadingPattern(services) {
    const patterns = {};
    
    services.forEach(service => {
      const pattern = service.loadingPattern || 'unknown';
      if (!patterns[pattern]) {
        patterns[pattern] = [];
      }
      patterns[pattern].push(service);
    });
    
    return patterns;
  }

  _calculateGraphStatistics(graph) {
    return {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      clusterCount: graph.clusters.length,
      averageDegree: graph.nodes.length > 0 ? 
        (graph.edges.length * 2) / graph.nodes.length : 0,
      density: graph.nodes.length > 1 ? 
        graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1)) : 0
    };
  }

  _getKnownDependencies(service) {
    const dependencies = [];
    
    // Check if this is a known service with dependencies
    for (const [category, services] of Object.entries(this.dependencyPatterns)) {
      for (const [serviceName, config] of Object.entries(services)) {
        if (config.patterns && this._matchesPattern(service.url, config.patterns)) {
          if (config.dependencies) {
            config.dependencies.forEach(dep => {
              dependencies.push({
                patterns: [new RegExp(dep, 'i')]
              });
            });
          }
        }
      }
    }
    
    return dependencies;
  }

  _findFrameworkConflicts(service, allServices) {
    const conflicts = [];
    
    // Check known conflicts
    for (const [category, services] of Object.entries(this.dependencyPatterns)) {
      for (const [serviceName, config] of Object.entries(services)) {
        if (config.patterns && this._matchesPattern(service.url, config.patterns)) {
          if (config.conflicts) {
            config.conflicts.forEach(conflictPattern => {
              const conflictingService = allServices.find(s => 
                s.url && s.url.toLowerCase().includes(conflictPattern.toLowerCase())
              );
              
              if (conflictingService) {
                conflicts.push(conflictingService);
              }
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  _findStronglyConnectedComponents(nodes, edges) {
    // Simplified implementation - returns individual nodes for now
    return nodes.map(node => [node.id]);
  }

  _getElementPosition(element) {
    let position = 0;
    let current = element;
    
    while (current && current.previousElementSibling) {
      position++;
      current = current.previousElementSibling;
    }
    
    return position;
  }

  _isServiceBottleneck(service) {
    // Check if service URL suggests it might be slow
    const slowPatterns = [
      /ads/i,
      /tracking/i,
      /analytics.*google/i,
      /facebook.*pixel/i
    ];
    
    return slowPatterns.some(pattern => pattern.test(service.url || ''));
  }

  _findServicePattern(serviceName) {
    for (const [category, services] of Object.entries(this.dependencyPatterns)) {
      for (const [name, config] of Object.entries(services)) {
        if (name.toLowerCase().includes(serviceName.toLowerCase())) {
          return config;
        }
      }
    }
    return null;
  }

  _isVersionOutdated(version, versionInfo) {
    if (!version || !versionInfo) return false;
    
    // Check if version is in deprecated list
    if (versionInfo.deprecated) {
      return versionInfo.deprecated.some(depVer => 
        version.startsWith(depVer.replace('.x', ''))
      );
    }
    
    return false;
  }

  _assessCircularDependencySeverity(cycles) {
    if (cycles.length === 0) return 'none';
    if (cycles.length === 1 && cycles[0].length <= 2) return 'low';
    if (cycles.length <= 2) return 'medium';
    return 'high';
  }

  _generateCircularDependencyRecommendations(cycles) {
    const recommendations = [];
    
    if (cycles.length > 0) {
      recommendations.push({
        type: 'break_circular_dependencies',
        priority: 'high',
        description: `${cycles.length} circular dependencies detected`,
        action: 'Review and restructure service loading order'
      });
    }
    
    return recommendations;
  }

  _generateVersionRecommendations(versions) {
    const recommendations = [];
    
    if (versions.outdated.length > 0) {
      recommendations.push({
        type: 'update_outdated_versions',
        priority: 'medium',
        description: `${versions.outdated.length} outdated versions detected`,
        action: 'Update to latest supported versions'
      });
    }
    
    return recommendations;
  }

  _generateSecurityRecommendations(vulnerabilities) {
    const recommendations = [];
    
    if (vulnerabilities.length > 0) {
      const highSevCount = vulnerabilities.filter(v => v.severity === 'high').length;
      
      recommendations.push({
        type: 'fix_security_vulnerabilities',
        priority: highSevCount > 0 ? 'critical' : 'high',
        description: `${vulnerabilities.length} security vulnerabilities detected`,
        action: 'Update or remove vulnerable services'
      });
    }
    
    return recommendations;
  }

  _getResourceLoadingPattern(element) {
    if (element.tagName.toLowerCase() === 'script') {
      return this._determineScriptLoadingPattern(element);
    } else if (element.tagName.toLowerCase() === 'link') {
      return this._determineStyleLoadingPattern(element);
    }
    return this.loadingPatterns.ASYNC;
  }

  _isResourceBlocking(element) {
    const loadingPattern = this._getResourceLoadingPattern(element);
    return loadingPattern === this.loadingPatterns.BLOCKING;
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async _generateOptimizationRecommendations(document, context) {
    const recommendations = [];

    try {
      // Get basic analysis data
      const services = await this._discoverServices(document, context);
      
      // Check for common optimization opportunities
      if (services.byLoadingPattern.blocking && services.byLoadingPattern.blocking.length > 3) {
        recommendations.push({
          type: 'reduce_blocking_resources',
          priority: 'high',
          description: `${services.byLoadingPattern.blocking.length} blocking resources detected`,
          action: 'Add async/defer attributes to non-critical scripts'
        });
      }
      
      if (services.byCategory.analytics && services.byCategory.analytics.length > 2) {
        recommendations.push({
          type: 'consolidate_analytics',
          priority: 'medium',
          description: `${services.byCategory.analytics.length} analytics services detected`,
          action: 'Consider consolidating analytics services'
        });
      }

    } catch (error) {
      console.error('Optimization recommendation generation failed:', error);
    }

    return recommendations;
  }

  _generateCriticalPathOptimization(criticalPath) {
    const optimization = {
      recommendations: [],
      priorityActions: []
    };

    if (criticalPath.blockingServices.length > 3) {
      optimization.recommendations.push({
        type: 'reduce_blocking_count',
        description: 'Too many blocking resources in critical path',
        action: 'Move non-essential scripts below the fold or make them async'
      });
    }

    if (criticalPath.bottlenecks.length > 0) {
      optimization.priorityActions.push({
        type: 'address_bottlenecks',
        description: 'Performance bottlenecks detected in critical path',
        targets: criticalPath.bottlenecks.map(b => b.service)
      });
    }

    return optimization;
  }

  _analyzeLoadingPatterns(sequence) {
    const patterns = {
      blocking: sequence.filter(s => s.blocking).length,
      async: sequence.filter(s => s.loadingPattern === 'async').length,
      defer: sequence.filter(s => s.loadingPattern === 'defer').length,
      total: sequence.length
    };

    patterns.blockingRatio = patterns.total > 0 ? patterns.blocking / patterns.total : 0;
    patterns.optimization = patterns.blockingRatio < 0.3 ? 'good' : 
                           patterns.blockingRatio < 0.6 ? 'moderate' : 'poor';

    return patterns;
  }

  _generateLoadingOptimization(loadingOrder) {
    const optimization = {
      recommendations: [],
      score: 0
    };

    const blockingRatio = loadingOrder.patterns.blockingRatio || 0;
    optimization.score = Math.max(0, 1 - blockingRatio);

    if (blockingRatio > 0.5) {
      optimization.recommendations.push({
        type: 'improve_loading_pattern',
        priority: 'high',
        description: 'High percentage of blocking resources',
        action: 'Implement async loading for non-critical resources'
      });
    }

    return optimization;
  }

  _generateDependencySummary(results) {
    return {
      totalServices: results.services?.total || 0,
      totalDependencies: results.dependencies?.edges?.length || 0,
      clusters: results.dependencies?.clusters?.length || 0,
      circularDependencies: results.circularDependencies?.cycles?.length || 0,
      vulnerabilities: results.vulnerabilities?.detected?.length || 0,
      outdatedVersions: results.versions?.outdated?.length || 0,
      blockingResources: results.criticalPath?.blockingServices?.length || 0,
      optimizationOpportunities: results.optimization?.length || 0
    };
  }
}

export default DependencyMappingDetector;
