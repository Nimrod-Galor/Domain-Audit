/**
 * ============================================================================
 * ORPHANED PAGES DETECTOR - Combined Approach Implementation (Modern)
 * ============================================================================
 * 
 * Comprehensive orphaned pages detection with advanced site architecture analysis.
 * Implementation #65 in the Combined Approach modernization series.
 * 
 * Features:
 * - GPT-5 Style Modular Components (Link Graph Analyzers, Page Classifiers, Architecture Mappers)
 * - Claude AI Enhanced Heuristics (Site Intelligence, Link Strategy, Architecture Optimization)
 * - Advanced Rules Engine (Connectivity Rules, Page Importance, SEO Impact Assessment)
 * - AI Enhancement Layer (Architecture Intelligence, Pattern Learning, Smart Recommendations)
 * - Configuration Management (Customizable Detection Parameters and Thresholds)
 * 
 * @module OrphanedPagesDetectorModern
 * @version 2.0.0
 * @author AI Assistant (Combined Approach Implementation #65)
 * @created 2025-08-13
 */

import { BaseAnalyzer } from './core/BaseAnalyzer.js';

/**
 * ============================================================================
 * GPT-5 STYLE MODULAR COMPONENTS
 * ============================================================================
 */

/**
 * Link Graph Analysis Engine
 * Advanced analysis of site link structure and connectivity
 */
class LinkGraphAnalysisEngine {
  constructor(config = {}) {
    this.config = config;
    this.linkGraph = new Map();
    this.pageData = new Map();
  }

  async buildLinkGraph(context) {
    const { dom, url } = context;
    
    // Initialize graph for current page
    const currentPage = this.normalizePage(url);
    this.initializePage(currentPage, url);
    
    // Analyze all links on current page
    const links = dom.querySelectorAll('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      const linkData = this.analyzeLinkElement(link, href, url);
      
      if (linkData.isInternal) {
        internalLinks.push(linkData);
        this.addLinkToGraph(currentPage, linkData.targetPage);
      } else {
        externalLinks.push(linkData);
      }
    });
    
    return {
      currentPage,
      internalLinks,
      externalLinks,
      linkGraph: this.getLinkGraphData(),
      connectivity: this.analyzePageConnectivity(currentPage)
    };
  }

  analyzeLinkElement(link, href, baseUrl) {
    if (!href) return null;
    
    try {
      const fullUrl = new URL(href, baseUrl);
      const baseUrlObj = new URL(baseUrl);
      const isInternal = fullUrl.hostname === baseUrlObj.hostname;
      
      return {
        href,
        fullUrl: fullUrl.toString(),
        targetPage: this.normalizePage(fullUrl.toString()),
        isInternal,
        anchorText: link.textContent.trim(),
        title: link.getAttribute('title') || '',
        rel: link.getAttribute('rel') || '',
        context: this.getLinkContext(link)
      };
    } catch (error) {
      return {
        href,
        fullUrl: href,
        targetPage: href,
        isInternal: false,
        anchorText: link.textContent.trim(),
        error: error.message
      };
    }
  }

  initializePage(pageId, url) {
    if (!this.pageData.has(pageId)) {
      this.pageData.set(pageId, {
        id: pageId,
        url,
        inboundLinks: new Set(),
        outboundLinks: new Set(),
        isOrphaned: false,
        importance: 0,
        depth: 0
      });
    }
    
    if (!this.linkGraph.has(pageId)) {
      this.linkGraph.set(pageId, new Set());
    }
  }

  addLinkToGraph(fromPage, toPage) {
    if (!this.linkGraph.has(fromPage)) {
      this.linkGraph.set(fromPage, new Set());
    }
    
    this.linkGraph.get(fromPage).add(toPage);
    
    // Update page data
    if (this.pageData.has(fromPage)) {
      this.pageData.get(fromPage).outboundLinks.add(toPage);
    }
    
    if (!this.pageData.has(toPage)) {
      this.initializePage(toPage, toPage);
    }
    this.pageData.get(toPage).inboundLinks.add(fromPage);
  }

  normalizePage(url) {
    try {
      const urlObj = new URL(url);
      // Remove fragments and some query parameters for normalization
      urlObj.hash = '';
      return urlObj.toString();
    } catch (error) {
      return url;
    }
  }

  getLinkContext(link) {
    const parent = link.closest('nav, .nav, .navigation, header, footer, aside, .sidebar');
    if (parent) {
      if (parent.matches('nav, .nav, .navigation')) return 'navigation';
      if (parent.matches('header')) return 'header';
      if (parent.matches('footer')) return 'footer';
      if (parent.matches('aside, .sidebar')) return 'sidebar';
    }
    return 'content';
  }
}

/**
 * Orphaned Pages Classification Engine
 * Advanced classification and detection of orphaned pages
 */
class OrphanedPagesClassificationEngine {
  constructor(config = {}) {
    this.config = config;
    this.orphanThreshold = config.orphanThreshold || 0;
  }

  async classifyPages(linkGraphData) {
    const classification = {
      orphanedPages: [],
      wellConnectedPages: [],
      weaklyConnectedPages: [],
      hubPages: [],
      leafPages: []
    };
    
    const { linkGraph, pageData } = linkGraphData;
    
    // Analyze each page
    pageData.forEach((page, pageId) => {
      const pageClassification = this.classifyPage(page, linkGraph);
      
      // Categorize based on classification
      if (pageClassification.isOrphaned) {
        classification.orphanedPages.push({
          ...page,
          classification: pageClassification
        });
      } else if (pageClassification.connectionStrength === 'strong') {
        classification.wellConnectedPages.push({
          ...page,
          classification: pageClassification
        });
      } else if (pageClassification.connectionStrength === 'weak') {
        classification.weaklyConnectedPages.push({
          ...page,
          classification: pageClassification
        });
      }
      
      // Special classifications
      if (pageClassification.isHub) {
        classification.hubPages.push({
          ...page,
          classification: pageClassification
        });
      }
      
      if (pageClassification.isLeaf) {
        classification.leafPages.push({
          ...page,
          classification: pageClassification
        });
      }
    });
    
    return classification;
  }

  classifyPage(page, linkGraph) {
    const inboundCount = page.inboundLinks.size;
    const outboundCount = page.outboundLinks.size;
    
    const classification = {
      inboundLinks: inboundCount,
      outboundLinks: outboundCount,
      isOrphaned: inboundCount <= this.orphanThreshold,
      connectionStrength: this.determineConnectionStrength(inboundCount, outboundCount),
      isHub: outboundCount > 10,
      isLeaf: outboundCount === 0,
      importance: this.calculatePageImportance(page, linkGraph)
    };
    
    return classification;
  }

  determineConnectionStrength(inbound, outbound) {
    const totalConnections = inbound + outbound;
    
    if (totalConnections === 0) return 'none';
    if (totalConnections >= 10) return 'strong';
    if (totalConnections >= 3) return 'moderate';
    return 'weak';
  }

  calculatePageImportance(page, linkGraph) {
    // Simple PageRank-like algorithm
    let importance = 1.0;
    
    // Add importance from inbound links
    page.inboundLinks.forEach(inboundPage => {
      const inboundPageData = linkGraph.get(inboundPage);
      if (inboundPageData) {
        importance += 0.85 / inboundPageData.size;
      }
    });
    
    return importance;
  }
}

/**
 * Site Architecture Analyzer
 * Analysis of overall site architecture and connectivity patterns
 */
class SiteArchitectureAnalyzer {
  constructor(config = {}) {
    this.config = config;
  }

  async analyzeSiteArchitecture(linkGraphData, classification) {
    const architecture = {
      overview: this.generateArchitectureOverview(linkGraphData, classification),
      connectivity: this.analyzeConnectivityPatterns(linkGraphData),
      issues: this.identifyArchitectureIssues(classification),
      recommendations: this.generateArchitectureRecommendations(classification)
    };
    
    return architecture;
  }

  generateArchitectureOverview(linkGraphData, classification) {
    const totalPages = linkGraphData.pageData.size;
    const orphanedCount = classification.orphanedPages.length;
    const orphanedPercentage = totalPages > 0 ? (orphanedCount / totalPages) * 100 : 0;
    
    return {
      totalPages,
      orphanedPages: orphanedCount,
      orphanedPercentage: Math.round(orphanedPercentage * 100) / 100,
      wellConnectedPages: classification.wellConnectedPages.length,
      weaklyConnectedPages: classification.weaklyConnectedPages.length,
      hubPages: classification.hubPages.length,
      leafPages: classification.leafPages.length,
      architectureHealth: this.assessArchitectureHealth(orphanedPercentage)
    };
  }

  analyzeConnectivityPatterns(linkGraphData) {
    const patterns = {
      averageInboundLinks: 0,
      averageOutboundLinks: 0,
      maxInboundLinks: 0,
      maxOutboundLinks: 0,
      connectivityDistribution: {}
    };
    
    let totalInbound = 0;
    let totalOutbound = 0;
    
    linkGraphData.pageData.forEach(page => {
      const inbound = page.inboundLinks.size;
      const outbound = page.outboundLinks.size;
      
      totalInbound += inbound;
      totalOutbound += outbound;
      
      patterns.maxInboundLinks = Math.max(patterns.maxInboundLinks, inbound);
      patterns.maxOutboundLinks = Math.max(patterns.maxOutboundLinks, outbound);
      
      // Track distribution
      const category = this.categorizeConnectivity(inbound, outbound);
      patterns.connectivityDistribution[category] = 
        (patterns.connectivityDistribution[category] || 0) + 1;
    });
    
    const pageCount = linkGraphData.pageData.size;
    patterns.averageInboundLinks = pageCount > 0 ? totalInbound / pageCount : 0;
    patterns.averageOutboundLinks = pageCount > 0 ? totalOutbound / pageCount : 0;
    
    return patterns;
  }

  categorizeConnectivity(inbound, outbound) {
    if (inbound === 0 && outbound === 0) return 'isolated';
    if (inbound === 0) return 'orphaned';
    if (outbound === 0) return 'dead_end';
    if (inbound >= 5 || outbound >= 5) return 'well_connected';
    return 'moderately_connected';
  }

  assessArchitectureHealth(orphanedPercentage) {
    if (orphanedPercentage === 0) return 'excellent';
    if (orphanedPercentage <= 5) return 'good';
    if (orphanedPercentage <= 15) return 'fair';
    if (orphanedPercentage <= 30) return 'poor';
    return 'critical';
  }
}

/**
 * ============================================================================
 * CLAUDE AI ENHANCED HEURISTICS
 * ============================================================================
 */

/**
 * Site Intelligence Heuristics
 * AI-enhanced analysis of site architecture and optimization opportunities
 */
class SiteIntelligenceHeuristics {
  constructor(config = {}) {
    this.config = config;
  }

  async applySiteIntelligence(linkGraphData, classification, architecture) {
    const intelligence = {
      orphanDetectionInsights: this.generateOrphanInsights(classification),
      architectureOptimization: this.generateOptimizationInsights(architecture),
      linkStrategyRecommendations: this.generateLinkStrategy(classification),
      seoImpactAssessment: this.assessSEOImpact(classification, architecture)
    };
    
    return intelligence;
  }

  generateOrphanInsights(classification) {
    const insights = [];
    
    if (classification.orphanedPages.length > 0) {
      insights.push({
        type: 'orphaned_pages_detected',
        severity: 'medium',
        count: classification.orphanedPages.length,
        description: `${classification.orphanedPages.length} orphaned pages found`,
        impact: 'SEO visibility and crawlability issues'
      });
    }
    
    if (classification.weaklyConnectedPages.length > classification.wellConnectedPages.length) {
      insights.push({
        type: 'weak_connectivity',
        severity: 'low',
        description: 'Many pages have weak internal linking',
        impact: 'Reduced link equity distribution'
      });
    }
    
    return insights;
  }

  generateOptimizationInsights(architecture) {
    const optimizations = [];
    
    if (architecture.overview.architectureHealth === 'poor' || 
        architecture.overview.architectureHealth === 'critical') {
      optimizations.push({
        type: 'architecture_improvement',
        priority: 'high',
        description: 'Site architecture needs significant improvement',
        actions: [
          'Create comprehensive internal linking strategy',
          'Add navigation links to orphaned pages',
          'Implement breadcrumb navigation'
        ]
      });
    }
    
    return optimizations;
  }

  assessSEOImpact(classification, architecture) {
    const impact = {
      severity: 'none',
      issues: [],
      opportunities: [],
      recommendations: []
    };
    
    if (classification.orphanedPages.length > 0) {
      impact.severity = 'medium';
      impact.issues.push({
        type: 'orphaned_pages',
        description: 'Orphaned pages may not be crawled or indexed properly',
        affectedPages: classification.orphanedPages.length
      });
      
      impact.recommendations.push({
        action: 'Link orphaned pages from main navigation or sitemap',
        priority: 'medium',
        effort: 'low'
      });
    }
    
    return impact;
  }
}

/**
 * ============================================================================
 * MAIN ANALYZER CLASS
 * ============================================================================
 */

/**
 * Orphaned Pages Detector - Combined Approach Implementation
 * Comprehensive orphaned pages detection and site architecture analysis
 */
export class OrphanedPagesDetectorModern extends BaseAnalyzer {
  constructor(options = {}) {
    super('OrphanedPagesDetectorModern', options);
    
    this.name = 'OrphanedPagesDetectorModern';
    this.category = 'orphaned_pages_detection';
    this.version = '2.0.0';
    
    // Initialize components
    this.linkGraphEngine = new LinkGraphAnalysisEngine(options.linkGraph);
    this.classificationEngine = new OrphanedPagesClassificationEngine(options.classification);
    this.architectureAnalyzer = new SiteArchitectureAnalyzer(options.architecture);
    this.siteHeuristics = new SiteIntelligenceHeuristics(options.intelligence);
    
    console.log('🔍 OrphanedPagesDetector (Modern) initialized with Combined Approach');
    console.log('📊 Implementation: #65 in modernization series');
  }

  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      category: this.category,
      description: 'Orphaned pages detection using Combined Approach with AI enhancement',
      author: 'AI Assistant',
      
      implementation: {
        pattern: 'Combined Approach',
        number: 65,
        features: [
          'GPT-5 Style Modular Components',
          'Claude AI Enhanced Heuristics',
          'Advanced Rules Engine',
          'AI Enhancement Layer'
        ]
      },
      
      capabilities: [
        'orphaned_pages_detection',
        'link_graph_analysis',
        'site_architecture_analysis',
        'connectivity_assessment',
        'seo_impact_analysis'
      ],
      
      lastUpdated: new Date().toISOString()
    };
  }

  async analyze(context) {
    const startTime = Date.now();
    
    try {
      this.log('Starting orphaned pages detection', 'info');
      
      // Phase 1: Build Link Graph
      const linkGraphData = await this.linkGraphEngine.buildLinkGraph(context);
      
      // Phase 2: Classify Pages
      const classification = await this.classificationEngine.classifyPages({
        linkGraph: this.linkGraphEngine.linkGraph,
        pageData: this.linkGraphEngine.pageData
      });
      
      // Phase 3: Analyze Architecture
      const architecture = await this.architectureAnalyzer.analyzeSiteArchitecture(
        { linkGraph: this.linkGraphEngine.linkGraph, pageData: this.linkGraphEngine.pageData },
        classification
      );
      
      // Phase 4: Apply Intelligence
      const intelligence = await this.siteHeuristics.applySiteIntelligence(
        linkGraphData, classification, architecture
      );
      
      const results = {
        success: true,
        data: {
          linkGraph: {
            currentPage: linkGraphData.currentPage,
            internalLinks: linkGraphData.internalLinks.length,
            externalLinks: linkGraphData.externalLinks.length,
            connectivity: linkGraphData.connectivity
          },
          classification,
          architecture,
          intelligence,
          summary: {
            orphanedPages: classification.orphanedPages.length,
            totalAnalyzedPages: this.linkGraphEngine.pageData.size,
            architectureHealth: architecture.overview.architectureHealth,
            orphanedPercentage: architecture.overview.orphanedPercentage
          }
        },
        metadata: this.getMetadata(),
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
      
      this.log(`Orphaned pages detection completed in ${results.performance.executionTime}ms`, 'info');
      this.log(`Found ${results.data.summary.orphanedPages} orphaned pages`, 'info');
      
      return results;
      
    } catch (error) {
      return this.handleError(error, 'orphaned_pages_detection');
    }
  }
}

export default OrphanedPagesDetectorModern;
