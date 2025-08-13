/**
 * ============================================================================
 * CONTENT SEO DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced SEO content analysis and optimization detection
 * Part of Content Analyzer Combined Approach (21st Implementation)
 * 
 * Capabilities:
 * - Keyword density and distribution analysis
 * - Title and meta description optimization
 * - Header tag SEO structure assessment
 * - Internal and external linking analysis
 * - Content length and depth evaluation
 * - Schema markup and structured data detection
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ContentSEODetector {
  constructor(options = {}) {
    this.options = {
      // SEO Analysis Configuration
      enableKeywordAnalysis: options.enableKeywordAnalysis !== false,
      enableTitleOptimization: options.enableTitleOptimization !== false,
      enableMetaAnalysis: options.enableMetaAnalysis !== false,
      enableHeaderAnalysis: options.enableHeaderAnalysis !== false,
      enableLinkAnalysis: options.enableLinkAnalysis !== false,
      enableSchemaAnalysis: options.enableSchemaAnalysis !== false,
      
      // SEO Targets and Thresholds
      idealTitleLength: options.idealTitleLength || 60,
      maxTitleLength: options.maxTitleLength || 70,
      idealMetaLength: options.idealMetaLength || 160,
      maxMetaLength: options.maxMetaLength || 180,
      minWordCount: options.minWordCount || 300,
      idealWordCount: options.idealWordCount || 1000,
      
      // Keyword Analysis Parameters
      targetKeywordDensity: options.targetKeywordDensity || 2,
      maxKeywordDensity: options.maxKeywordDensity || 5,
      minInternalLinks: options.minInternalLinks || 3,
      maxInternalLinks: options.maxInternalLinks || 10,
      
      ...options
    };

    this.detectorType = 'content_seo';
    this.version = '1.0.0';
    
    // SEO analysis patterns
    this.seoPatterns = {
      title_keywords: /\b(how to|what is|why|when|where|best|top|guide|tips|review|vs|comparison)\b/gi,
      long_tail_keywords: /\b\w+\s+\w+\s+\w+\b/g,
      action_words: /\b(get|find|learn|discover|create|build|make|start|stop|avoid|prevent)\b/gi,
      power_words: /\b(amazing|incredible|ultimate|essential|proven|secret|exclusive|guaranteed)\b/gi,
      local_seo: /\b(near me|local|location|address|city|state|zip|phone|contact)\b/gi,
      commercial_intent: /\b(buy|purchase|price|cost|cheap|discount|deal|sale|order|shop)\b/gi
    };
    
    // Schema.org types for structured data detection
    this.schemaTypes = [
      'Article', 'BlogPosting', 'NewsArticle', 'Product', 'Review', 'Organization',
      'Person', 'Event', 'Recipe', 'FAQ', 'HowTo', 'VideoObject', 'ImageObject',
      'LocalBusiness', 'Service', 'Course', 'Book', 'WebPage', 'WebSite'
    ];

    // SEO scoring weights
    this.seoWeights = {
      title_optimization: 20,
      meta_description: 15,
      header_structure: 15,
      keyword_optimization: 20,
      content_length: 10,
      internal_linking: 10,
      external_linking: 5,
      schema_markup: 5
    };

    console.log('🔍 Content SEO Detector initialized');
    console.log(`🎯 Keyword Analysis: ${this.options.enableKeywordAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`📄 Title Optimization: ${this.options.enableTitleOptimization ? 'Enabled' : 'Disabled'}`);
    console.log(`🏷️ Schema Analysis: ${this.options.enableSchemaAnalysis ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Main detection method for SEO content analysis
   */
  async detect(context, configuration) {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Analyzing content SEO...');
      
      const { document } = context;
      if (!document) {
        throw new Error('Document is required for SEO content analysis');
      }

      // Extract content and metadata
      const textContent = this.extractTextContent(document);
      const pageMetadata = this.extractPageMetadata(document);
      
      // Phase 1: Title Tag Optimization Analysis
      const titleAnalysis = await this.analyzeTitleOptimization(document, textContent);
      
      // Phase 2: Meta Description Analysis
      const metaAnalysis = await this.analyzeMetaDescription(document, textContent);
      
      // Phase 3: Header Structure SEO Analysis
      const headerAnalysis = await this.analyzeHeaderStructure(document);
      
      // Phase 4: Keyword Analysis and Optimization
      const keywordAnalysis = await this.analyzeKeywordOptimization(textContent, titleAnalysis, headerAnalysis);
      
      // Phase 5: Internal and External Link Analysis
      const linkAnalysis = await this.analyzeLinkStructure(document, textContent);
      
      // Phase 6: Content Length and Depth Analysis
      const contentAnalysis = await this.analyzeContentLength(textContent, document);
      
      // Phase 7: Schema Markup and Structured Data
      const schemaAnalysis = await this.analyzeSchemaMarkup(document);
      
      // Phase 8: Overall SEO Assessment
      const seoAssessment = await this.assessOverallSEO({
        title: titleAnalysis,
        meta: metaAnalysis,
        headers: headerAnalysis,
        keywords: keywordAnalysis,
        links: linkAnalysis,
        content: contentAnalysis,
        schema: schemaAnalysis,
        metadata: pageMetadata
      });
      
      const endTime = Date.now();
      
      return {
        detector: this.detectorType,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Page Metadata
        page_metadata: pageMetadata,
        
        // SEO Analysis Results
        title_analysis: titleAnalysis,
        meta_analysis: metaAnalysis,
        header_analysis: headerAnalysis,
        keyword_analysis: keywordAnalysis,
        link_analysis: linkAnalysis,
        content_analysis: contentAnalysis,
        schema_analysis: schemaAnalysis,
        
        // Overall SEO Assessment
        seo_assessment: seoAssessment,
        
        // SEO Score
        seo_score: seoAssessment.overall_score,
        
        // SEO Metrics
        seo_metrics: {
          title_length: titleAnalysis.title_length,
          meta_length: metaAnalysis.meta_length,
          word_count: contentAnalysis.word_count,
          header_count: headerAnalysis.total_headers,
          internal_links: linkAnalysis.internal_link_count,
          external_links: linkAnalysis.external_link_count,
          keyword_density: keywordAnalysis.primary_keyword_density,
          schema_types: schemaAnalysis.schema_count
        },
        
        // SEO Insights
        seo_insights: this.generateSEOInsights(seoAssessment),
        
        // Optimization Recommendations
        optimization_recommendations: this.generateOptimizationRecommendations(seoAssessment),
        
        // Technical SEO Issues
        technical_issues: this.identifyTechnicalIssues({
          title: titleAnalysis,
          meta: metaAnalysis,
          headers: headerAnalysis,
          schema: schemaAnalysis
        })
      };
      
    } catch (error) {
      console.error('❌ Content SEO detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Extract clean text content for SEO analysis
   */
  extractTextContent(document) {
    // Remove non-content elements
    const elementsToRemove = document.querySelectorAll('script, style, noscript, nav, header, footer');
    elementsToRemove.forEach(element => element.remove());
    
    // Focus on main content
    const contentSelectors = [
      'main', 'article', '[role="main"]', '.content', '.post-content', 
      '.entry-content', '.article-content', '.page-content'
    ];
    
    let textContent = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        textContent = element.textContent || '';
        break;
      }
    }
    
    // Fallback to body
    if (!textContent && document.body) {
      textContent = document.body.textContent || '';
    }
    
    return textContent.trim().replace(/\s+/g, ' ');
  }

  /**
   * Extract page metadata
   */
  extractPageMetadata(document) {
    const metadata = {
      url: window.location ? window.location.href : '',
      title: document.title || '',
      lang: document.documentElement.lang || 'en',
      charset: document.characterSet || 'UTF-8',
      viewport: '',
      robots: '',
      canonical: ''
    };
    
    // Extract meta tags
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name === 'viewport') metadata.viewport = content;
      if (name === 'robots') metadata.robots = content;
    });
    
    // Extract canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      metadata.canonical = canonical.getAttribute('href');
    }
    
    return metadata;
  }

  /**
   * Phase 1: Analyze title tag optimization
   */
  async analyzeTitleOptimization(document, textContent) {
    const analysis = {
      category: 'Title Tag Optimization',
      title_text: '',
      title_length: 0,
      title_optimization: {},
      keyword_placement: {},
      title_quality: {}
    };
    
    try {
      analysis.title_text = document.title || '';
      analysis.title_length = analysis.title_text.length;
      
      // Title optimization analysis
      analysis.title_optimization = this.assessTitleOptimization(analysis.title_text);
      
      // Keyword placement in title
      analysis.keyword_placement = this.analyzeKeywordPlacement(analysis.title_text, textContent);
      
      // Title quality assessment
      analysis.title_quality = this.assessTitleQuality(analysis.title_text);
      
      // Title score
      analysis.title_score = this.calculateTitleScore(
        analysis.title_optimization,
        analysis.keyword_placement,
        analysis.title_quality
      );
      
    } catch (error) {
      console.error('Title analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 2: Analyze meta description
   */
  async analyzeMetaDescription(document, textContent) {
    const analysis = {
      category: 'Meta Description',
      meta_text: '',
      meta_length: 0,
      meta_optimization: {},
      keyword_usage: {},
      call_to_action: {}
    };
    
    try {
      // Extract meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      analysis.meta_text = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      analysis.meta_length = analysis.meta_text.length;
      
      // Meta optimization analysis
      analysis.meta_optimization = this.assessMetaOptimization(analysis.meta_text);
      
      // Keyword usage in meta
      analysis.keyword_usage = this.analyzeMetaKeywords(analysis.meta_text, textContent);
      
      // Call to action analysis
      analysis.call_to_action = this.analyzeCallToAction(analysis.meta_text);
      
      // Meta score
      analysis.meta_score = this.calculateMetaScore(
        analysis.meta_optimization,
        analysis.keyword_usage,
        analysis.call_to_action
      );
      
    } catch (error) {
      console.error('Meta description analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 3: Analyze header structure for SEO
   */
  async analyzeHeaderStructure(document) {
    const analysis = {
      category: 'Header Structure SEO',
      header_hierarchy: {},
      keyword_distribution: {},
      seo_optimization: {}
    };
    
    try {
      const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Header hierarchy analysis
      analysis.header_hierarchy = this.analyzeHeaderHierarchy(headers);
      
      // Keyword distribution in headers
      analysis.keyword_distribution = this.analyzeHeaderKeywords(headers);
      
      // SEO optimization of headers
      analysis.seo_optimization = this.assessHeaderSEO(headers);
      
      analysis.total_headers = headers.length;
      
      // Header SEO score
      analysis.header_seo_score = this.calculateHeaderScore(
        analysis.header_hierarchy,
        analysis.keyword_distribution,
        analysis.seo_optimization
      );
      
    } catch (error) {
      console.error('Header structure analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 4: Analyze keyword optimization
   */
  async analyzeKeywordOptimization(textContent, titleAnalysis, headerAnalysis) {
    const analysis = {
      category: 'Keyword Optimization',
      keyword_density: {},
      keyword_distribution: {},
      semantic_keywords: {},
      long_tail_analysis: {}
    };
    
    try {
      // Extract potential primary keywords
      const primaryKeywords = this.extractPrimaryKeywords(textContent, titleAnalysis.title_text);
      
      // Keyword density analysis
      analysis.keyword_density = this.calculateKeywordDensity(textContent, primaryKeywords);
      
      // Keyword distribution analysis
      analysis.keyword_distribution = this.analyzeKeywordDistribution(textContent, primaryKeywords);
      
      // Semantic keyword analysis
      analysis.semantic_keywords = this.analyzeSemanticKeywords(textContent);
      
      // Long-tail keyword analysis
      analysis.long_tail_analysis = this.analyzeLongTailKeywords(textContent);
      
      // Primary keyword density
      analysis.primary_keyword_density = analysis.keyword_density.primary_density || 0;
      
      // Keyword optimization score
      analysis.keyword_score = this.calculateKeywordScore(
        analysis.keyword_density,
        analysis.keyword_distribution,
        analysis.semantic_keywords
      );
      
    } catch (error) {
      console.error('Keyword optimization analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 5: Analyze link structure
   */
  async analyzeLinkStructure(document, textContent) {
    const analysis = {
      category: 'Link Structure',
      internal_links: {},
      external_links: {},
      anchor_text: {},
      link_quality: {}
    };
    
    try {
      const links = document.querySelectorAll('a[href]');
      
      // Categorize links
      const { internal, external } = this.categorizeLinks(links);
      
      // Internal link analysis
      analysis.internal_links = this.analyzeInternalLinks(internal);
      
      // External link analysis
      analysis.external_links = this.analyzeExternalLinks(external);
      
      // Anchor text analysis
      analysis.anchor_text = this.analyzeAnchorText(links);
      
      // Link quality assessment
      analysis.link_quality = this.assessLinkQuality(internal, external);
      
      analysis.internal_link_count = internal.length;
      analysis.external_link_count = external.length;
      
      // Link optimization score
      analysis.link_score = this.calculateLinkScore(
        analysis.internal_links,
        analysis.external_links,
        analysis.anchor_text,
        analysis.link_quality
      );
      
    } catch (error) {
      console.error('Link structure analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 6: Analyze content length and depth
   */
  async analyzeContentLength(textContent, document) {
    const analysis = {
      category: 'Content Length and Depth',
      content_metrics: {},
      depth_indicators: {},
      seo_content_quality: {}
    };
    
    try {
      // Basic content metrics
      analysis.content_metrics = this.calculateContentMetrics(textContent);
      
      // Content depth indicators
      analysis.depth_indicators = this.analyzeContentDepth(textContent, document);
      
      // SEO content quality
      analysis.seo_content_quality = this.assessSEOContentQuality(textContent, document);
      
      analysis.word_count = analysis.content_metrics.word_count;
      
      // Content optimization score
      analysis.content_score = this.calculateContentScore(
        analysis.content_metrics,
        analysis.depth_indicators,
        analysis.seo_content_quality
      );
      
    } catch (error) {
      console.error('Content length analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 7: Analyze schema markup and structured data
   */
  async analyzeSchemaMarkup(document) {
    const analysis = {
      category: 'Schema Markup',
      schema_types: [],
      structured_data: {},
      microdata: {},
      json_ld: {}
    };
    
    try {
      // JSON-LD structured data
      analysis.json_ld = this.analyzeJSONLD(document);
      
      // Microdata analysis
      analysis.microdata = this.analyzeMicrodata(document);
      
      // Schema.org types detection
      analysis.schema_types = this.detectSchemaTypes(document);
      
      // Structured data quality
      analysis.structured_data = this.assessStructuredDataQuality(
        analysis.json_ld,
        analysis.microdata,
        analysis.schema_types
      );
      
      analysis.schema_count = analysis.schema_types.length;
      
      // Schema optimization score
      analysis.schema_score = this.calculateSchemaScore(
        analysis.json_ld,
        analysis.microdata,
        analysis.structured_data
      );
      
    } catch (error) {
      console.error('Schema markup analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 8: Assess overall SEO
   */
  async assessOverallSEO(analyses) {
    const assessment = {
      category: 'Overall SEO Assessment',
      component_scores: {},
      seo_health: {},
      optimization_opportunities: {}
    };
    
    try {
      // Component scores
      assessment.component_scores = {
        title: analyses.title?.title_score || 0,
        meta: analyses.meta?.meta_score || 0,
        headers: analyses.headers?.header_seo_score || 0,
        keywords: analyses.keywords?.keyword_score || 0,
        links: analyses.links?.link_score || 0,
        content: analyses.content?.content_score || 0,
        schema: analyses.schema?.schema_score || 0
      };
      
      // Calculate weighted overall score
      assessment.overall_score = this.calculateWeightedSEOScore(assessment.component_scores);
      
      // SEO health assessment
      assessment.seo_health = this.assessSEOHealth(assessment.component_scores);
      
      // Optimization opportunities
      assessment.optimization_opportunities = this.identifyOptimizationOpportunities(assessment.component_scores);
      
      // SEO classification
      assessment.seo_classification = this.classifySEOQuality(assessment.overall_score);
      
      // Priority improvements
      assessment.priority_improvements = this.identifyPriorityImprovements(assessment.component_scores);
      
    } catch (error) {
      console.error('Overall SEO assessment failed:', error);
      assessment.error = error.message;
    }
    
    return assessment;
  }

  /**
   * Assess title optimization
   */
  assessTitleOptimization(title) {
    const optimization = {
      length_optimal: false,
      has_keywords: false,
      readability: 0,
      uniqueness: 0
    };
    
    // Length optimization
    optimization.length_optimal = title.length >= 30 && title.length <= this.options.maxTitleLength;
    
    // Keyword presence (simplified check)
    optimization.has_keywords = this.seoPatterns.title_keywords.test(title);
    
    // Readability (simplified - based on word count and complexity)
    const words = title.split(/\s+/).filter(word => word.length > 0);
    optimization.readability = Math.min(100, words.length >= 3 && words.length <= 10 ? 100 : 70);
    
    // Uniqueness (check for generic phrases)
    const genericPhrases = /\b(home|page|welcome|untitled|default)\b/gi;
    optimization.uniqueness = genericPhrases.test(title) ? 30 : 90;
    
    return optimization;
  }

  /**
   * Analyze keyword placement in title
   */
  analyzeKeywordPlacement(title, content) {
    const placement = {
      keywords_in_title: 0,
      title_keyword_ratio: 0,
      keyword_prominence: 0
    };
    
    const titleWords = title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const contentWords = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Count how many title words appear in content
    titleWords.forEach(word => {
      const wordCount = (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      if (wordCount > 0) {
        placement.keywords_in_title++;
      }
    });
    
    if (titleWords.length > 0) {
      placement.title_keyword_ratio = Math.round((placement.keywords_in_title / titleWords.length) * 100);
    }
    
    // Keyword prominence (position of keywords in title)
    if (titleWords.length > 0) {
      const firstWordInContent = contentWords.includes(titleWords[0]);
      placement.keyword_prominence = firstWordInContent ? 100 : 70;
    }
    
    return placement;
  }

  /**
   * Assess title quality
   */
  assessTitleQuality(title) {
    const quality = {
      emotional_impact: 0,
      action_oriented: false,
      specific: true,
      compelling: false
    };
    
    // Emotional impact (power words)
    const powerWords = (title.match(this.seoPatterns.power_words) || []).length;
    quality.emotional_impact = Math.min(100, powerWords * 30);
    
    // Action oriented
    quality.action_oriented = this.seoPatterns.action_words.test(title);
    
    // Specific (not too generic)
    const genericWords = /\b(things|stuff|information|data|content)\b/gi;
    quality.specific = !genericWords.test(title);
    
    // Compelling (combination of factors)
    quality.compelling = quality.emotional_impact > 30 || quality.action_oriented;
    
    return quality;
  }

  /**
   * Calculate title score
   */
  calculateTitleScore(optimization, placement, quality) {
    let score = 60; // Base score
    
    // Optimization factors
    if (optimization.length_optimal) score += 15;
    if (optimization.has_keywords) score += 10;
    score += Math.min(10, optimization.readability * 0.1);
    score += Math.min(5, optimization.uniqueness * 0.05);
    
    // Placement factors
    score += Math.min(10, placement.title_keyword_ratio * 0.1);
    
    // Quality factors
    if (quality.action_oriented) score += 5;
    if (quality.compelling) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess meta description optimization
   */
  assessMetaOptimization(meta) {
    const optimization = {
      length_optimal: false,
      has_description: meta.length > 0,
      compelling: false,
      unique: true
    };
    
    optimization.length_optimal = meta.length >= 120 && meta.length <= this.options.maxMetaLength;
    optimization.compelling = this.seoPatterns.action_words.test(meta) || 
                             this.seoPatterns.power_words.test(meta);
    
    // Check for generic content
    const genericPhrases = /\b(lorem ipsum|default|sample|test|placeholder)\b/gi;
    optimization.unique = !genericPhrases.test(meta);
    
    return optimization;
  }

  /**
   * Analyze meta keywords
   */
  analyzeMetaKeywords(meta, content) {
    const analysis = {
      keyword_presence: 0,
      keyword_relevance: 0,
      keyword_density: 0
    };
    
    if (meta.length === 0) return analysis;
    
    const metaWords = meta.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const contentWords = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Check keyword presence in content
    let relevantKeywords = 0;
    metaWords.forEach(word => {
      if (contentWords.includes(word)) {
        relevantKeywords++;
      }
    });
    
    if (metaWords.length > 0) {
      analysis.keyword_presence = relevantKeywords;
      analysis.keyword_relevance = Math.round((relevantKeywords / metaWords.length) * 100);
    }
    
    return analysis;
  }

  /**
   * Analyze call to action in meta
   */
  analyzeCallToAction(meta) {
    const cta = {
      has_cta: false,
      cta_strength: 0,
      action_words: 0
    };
    
    const ctaPattern = /\b(learn|discover|find|get|try|start|download|read|see|explore|join|sign up)\b/gi;
    const ctaMatches = meta.match(ctaPattern) || [];
    
    cta.has_cta = ctaMatches.length > 0;
    cta.action_words = ctaMatches.length;
    cta.cta_strength = Math.min(100, ctaMatches.length * 25);
    
    return cta;
  }

  /**
   * Calculate meta description score
   */
  calculateMetaScore(optimization, keywords, cta) {
    let score = 50; // Base score
    
    if (optimization.has_description) score += 20;
    if (optimization.length_optimal) score += 15;
    if (optimization.compelling) score += 10;
    if (optimization.unique) score += 10;
    
    score += Math.min(10, keywords.keyword_relevance * 0.1);
    
    if (cta.has_cta) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze header hierarchy for SEO
   */
  analyzeHeaderHierarchy(headers) {
    const hierarchy = {
      h1_count: 0,
      h1_present: false,
      logical_structure: true,
      header_distribution: {}
    };
    
    const headerCounts = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    
    headers.forEach(header => {
      const tag = header.tagName.toLowerCase();
      headerCounts[tag]++;
    });
    
    hierarchy.h1_count = headerCounts.h1;
    hierarchy.h1_present = headerCounts.h1 > 0;
    hierarchy.header_distribution = headerCounts;
    
    // Check logical structure (simplified)
    if (headerCounts.h1 > 1) hierarchy.logical_structure = false;
    if (headerCounts.h3 > 0 && headerCounts.h2 === 0) hierarchy.logical_structure = false;
    
    return hierarchy;
  }

  /**
   * Analyze header keywords
   */
  analyzeHeaderKeywords(headers) {
    const analysis = {
      headers_with_keywords: 0,
      keyword_distribution: 0,
      h1_keywords: false
    };
    
    if (headers.length === 0) return analysis;
    
    let headersWithKeywords = 0;
    
    headers.forEach((header, index) => {
      const text = header.textContent.toLowerCase();
      const hasKeywords = this.seoPatterns.title_keywords.test(text) ||
                         this.seoPatterns.action_words.test(text);
      
      if (hasKeywords) {
        headersWithKeywords++;
        
        // Check if H1 has keywords
        if (header.tagName.toLowerCase() === 'h1') {
          analysis.h1_keywords = true;
        }
      }
    });
    
    analysis.headers_with_keywords = headersWithKeywords;
    analysis.keyword_distribution = Math.round((headersWithKeywords / headers.length) * 100);
    
    return analysis;
  }

  /**
   * Assess header SEO optimization
   */
  assessHeaderSEO(headers) {
    const seo = {
      descriptive_headers: 0,
      length_appropriate: 0,
      hierarchy_score: 0
    };
    
    headers.forEach(header => {
      const text = header.textContent.trim();
      
      // Descriptive (not generic)
      if (text.length > 10 && !text.toLowerCase().includes('header')) {
        seo.descriptive_headers++;
      }
      
      // Appropriate length
      if (text.length >= 10 && text.length <= 70) {
        seo.length_appropriate++;
      }
    });
    
    if (headers.length > 0) {
      seo.hierarchy_score = Math.round(
        ((seo.descriptive_headers + seo.length_appropriate) / (headers.length * 2)) * 100
      );
    }
    
    return seo;
  }

  /**
   * Calculate header SEO score
   */
  calculateHeaderScore(hierarchy, keywords, seo) {
    let score = 60; // Base score
    
    // Hierarchy factors
    if (hierarchy.h1_present) score += 15;
    if (hierarchy.h1_count === 1) score += 10;
    if (hierarchy.logical_structure) score += 10;
    
    // Keyword factors
    if (keywords.h1_keywords) score += 10;
    score += Math.min(10, keywords.keyword_distribution * 0.1);
    
    // SEO factors
    score += Math.min(5, seo.hierarchy_score * 0.05);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract primary keywords (simplified approach)
   */
  extractPrimaryKeywords(content, title) {
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const wordCounts = {};
    
    // Count word frequency
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Get top keywords by frequency
    const sortedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count >= 3)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    // Include title words as potential keywords
    const titleWords = title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    return [...new Set([...titleWords, ...sortedWords])];
  }

  /**
   * Calculate keyword density
   */
  calculateKeywordDensity(content, keywords) {
    const density = {
      primary_density: 0,
      keyword_densities: {},
      total_words: 0
    };
    
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    density.total_words = words.length;
    
    if (keywords.length > 0 && words.length > 0) {
      const primaryKeyword = keywords[0];
      const primaryCount = (content.toLowerCase().match(new RegExp(`\\b${primaryKeyword}\\b`, 'g')) || []).length;
      density.primary_density = Math.round((primaryCount / words.length) * 100 * 100) / 100;
      
      // Calculate density for all keywords
      keywords.forEach(keyword => {
        const count = (content.toLowerCase().match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        density.keyword_densities[keyword] = Math.round((count / words.length) * 100 * 100) / 100;
      });
    }
    
    return density;
  }

  /**
   * Analyze keyword distribution
   */
  analyzeKeywordDistribution(content, keywords) {
    const distribution = {
      even_distribution: false,
      keyword_spread: 0,
      first_paragraph: false,
      last_paragraph: false
    };
    
    if (keywords.length === 0) return distribution;
    
    const primaryKeyword = keywords[0];
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 0) {
      // Check first and last paragraphs
      distribution.first_paragraph = paragraphs[0].toLowerCase().includes(primaryKeyword);
      distribution.last_paragraph = paragraphs[paragraphs.length - 1].toLowerCase().includes(primaryKeyword);
      
      // Check distribution across paragraphs
      let paragraphsWithKeyword = 0;
      paragraphs.forEach(paragraph => {
        if (paragraph.toLowerCase().includes(primaryKeyword)) {
          paragraphsWithKeyword++;
        }
      });
      
      distribution.keyword_spread = Math.round((paragraphsWithKeyword / paragraphs.length) * 100);
      distribution.even_distribution = distribution.keyword_spread >= 30 && distribution.keyword_spread <= 70;
    }
    
    return distribution;
  }

  /**
   * Analyze semantic keywords
   */
  analyzeSemanticKeywords(content) {
    const analysis = {
      related_terms: 0,
      topic_coverage: 0,
      semantic_richness: 0
    };
    
    // Simple semantic analysis based on word variety
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 4);
    const uniqueWords = new Set(words);
    
    analysis.related_terms = uniqueWords.size;
    analysis.semantic_richness = words.length > 0 ? Math.round((uniqueWords.size / words.length) * 100) : 0;
    analysis.topic_coverage = Math.min(100, uniqueWords.size / 10);
    
    return analysis;
  }

  /**
   * Analyze long-tail keywords
   */
  analyzeLongTailKeywords(content) {
    const analysis = {
      long_tail_count: 0,
      three_word_phrases: 0,
      four_word_phrases: 0
    };
    
    // Extract 3-word phrases
    const threeWordMatches = content.match(/\b\w+\s+\w+\s+\w+\b/g) || [];
    analysis.three_word_phrases = threeWordMatches.length;
    
    // Extract 4-word phrases
    const fourWordMatches = content.match(/\b\w+\s+\w+\s+\w+\s+\w+\b/g) || [];
    analysis.four_word_phrases = fourWordMatches.length;
    
    analysis.long_tail_count = analysis.three_word_phrases + analysis.four_word_phrases;
    
    return analysis;
  }

  /**
   * Calculate keyword optimization score
   */
  calculateKeywordScore(density, distribution, semantic) {
    let score = 60; // Base score
    
    // Density factors
    if (density.primary_density >= 1 && density.primary_density <= this.options.maxKeywordDensity) {
      score += 20;
    } else if (density.primary_density > this.options.maxKeywordDensity) {
      score -= 10; // Penalty for over-optimization
    }
    
    // Distribution factors
    if (distribution.even_distribution) score += 15;
    if (distribution.first_paragraph) score += 5;
    if (distribution.last_paragraph) score += 5;
    
    // Semantic factors
    score += Math.min(10, semantic.semantic_richness * 0.1);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Categorize links into internal and external
   */
  categorizeLinks(links) {
    const internal = [];
    const external = [];
    
    const currentDomain = window.location ? window.location.hostname : '';
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        if (href.startsWith('http') && !href.includes(currentDomain)) {
          external.push(link);
        } else if (!href.startsWith('mailto:') && !href.startsWith('tel:')) {
          internal.push(link);
        }
      }
    });
    
    return { internal, external };
  }

  /**
   * Analyze internal links
   */
  analyzeInternalLinks(links) {
    const analysis = {
      total_internal: links.length,
      descriptive_anchors: 0,
      deep_links: 0,
      contextual_links: 0
    };
    
    links.forEach(link => {
      const anchorText = link.textContent.trim();
      const href = link.getAttribute('href');
      
      // Descriptive anchors (not generic)
      if (anchorText.length > 3 && !['click here', 'read more', 'here', 'more'].includes(anchorText.toLowerCase())) {
        analysis.descriptive_anchors++;
      }
      
      // Deep links (not homepage)
      if (href && !href.match(/^\/?$|^\/home|^\/index/)) {
        analysis.deep_links++;
      }
      
      // Contextual links (in content, not navigation)
      const parent = link.closest('nav, header, footer, aside');
      if (!parent) {
        analysis.contextual_links++;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze external links
   */
  analyzeExternalLinks(links) {
    const analysis = {
      total_external: links.length,
      authoritative_domains: 0,
      nofollow_links: 0,
      relevant_links: 0
    };
    
    const authoritativeDomains = ['.edu', '.gov', '.org'];
    
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const rel = link.getAttribute('rel') || '';
      
      // Authoritative domains
      if (authoritativeDomains.some(domain => href.includes(domain))) {
        analysis.authoritative_domains++;
      }
      
      // Nofollow links
      if (rel.includes('nofollow')) {
        analysis.nofollow_links++;
      }
      
      // Relevant links (based on anchor text relevance)
      const anchorText = link.textContent.trim();
      if (anchorText.length > 5) {
        analysis.relevant_links++;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze anchor text
   */
  analyzeAnchorText(links) {
    const analysis = {
      keyword_rich_anchors: 0,
      generic_anchors: 0,
      branded_anchors: 0,
      exact_match_anchors: 0
    };
    
    const genericAnchors = ['click here', 'read more', 'here', 'more', 'link', 'this'];
    
    links.forEach(link => {
      const anchorText = link.textContent.trim().toLowerCase();
      
      if (genericAnchors.includes(anchorText)) {
        analysis.generic_anchors++;
      } else if (anchorText.includes('brand') || anchorText.includes('company')) {
        analysis.branded_anchors++;
      } else if (anchorText.length > 3) {
        analysis.keyword_rich_anchors++;
      }
    });
    
    return analysis;
  }

  /**
   * Assess link quality
   */
  assessLinkQuality(internal, external) {
    const quality = {
      internal_link_ratio: 0,
      external_link_ratio: 0,
      link_balance: false,
      quality_score: 0
    };
    
    const totalLinks = internal.length + external.length;
    
    if (totalLinks > 0) {
      quality.internal_link_ratio = Math.round((internal.length / totalLinks) * 100);
      quality.external_link_ratio = Math.round((external.length / totalLinks) * 100);
      
      // Good balance: 70-85% internal, 15-30% external
      quality.link_balance = quality.internal_link_ratio >= 70 && quality.internal_link_ratio <= 85;
    }
    
    // Quality score based on various factors
    let score = 60;
    if (internal.length >= this.options.minInternalLinks) score += 20;
    if (quality.link_balance) score += 15;
    if (external.length > 0 && external.length <= 5) score += 5;
    
    quality.quality_score = score;
    
    return quality;
  }

  /**
   * Calculate link optimization score
   */
  calculateLinkScore(internal, external, anchors, quality) {
    let score = 60; // Base score
    
    // Internal link factors
    if (internal.total_internal >= this.options.minInternalLinks) score += 15;
    score += Math.min(10, (internal.descriptive_anchors / Math.max(1, internal.total_internal)) * 10);
    
    // External link factors
    if (external.total_external > 0) score += 5;
    score += Math.min(5, external.authoritative_domains * 2);
    
    // Anchor text factors
    score += Math.min(10, (anchors.keyword_rich_anchors / Math.max(1, internal.total_internal + external.total_external)) * 10);
    
    // Quality factors
    score += Math.min(10, quality.quality_score * 0.1);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate content metrics for SEO
   */
  calculateContentMetrics(content) {
    const metrics = {
      word_count: 0,
      character_count: content.length,
      reading_time: 0,
      content_depth: 0
    };
    
    const words = content.split(/\s+/).filter(word => word.length > 0);
    metrics.word_count = words.length;
    metrics.reading_time = Math.ceil(words.length / 250); // Average reading speed
    
    // Content depth based on word count
    if (metrics.word_count >= this.options.idealWordCount) {
      metrics.content_depth = 100;
    } else if (metrics.word_count >= this.options.minWordCount) {
      metrics.content_depth = Math.round((metrics.word_count / this.options.idealWordCount) * 100);
    } else {
      metrics.content_depth = Math.round((metrics.word_count / this.options.minWordCount) * 50);
    }
    
    return metrics;
  }

  /**
   * Analyze content depth for SEO
   */
  analyzeContentDepth(content, document) {
    const depth = {
      topic_coverage: 0,
      supporting_elements: 0,
      content_structure: 0
    };
    
    // Topic coverage based on unique words
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const uniqueWords = new Set(words);
    depth.topic_coverage = Math.min(100, (uniqueWords.size / words.length) * 100);
    
    // Supporting elements
    const lists = document.querySelectorAll('ul, ol').length;
    const images = document.querySelectorAll('img').length;
    const videos = document.querySelectorAll('video, iframe').length;
    depth.supporting_elements = Math.min(100, (lists + images + videos) * 10);
    
    // Content structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const paragraphs = document.querySelectorAll('p').length;
    depth.content_structure = Math.min(100, (headings + paragraphs) * 2);
    
    return depth;
  }

  /**
   * Assess SEO content quality
   */
  assessSEOContentQuality(content, document) {
    const quality = {
      readability: 0,
      engagement: 0,
      informativeness: 0
    };
    
    // Basic readability (sentence length)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? 
      content.split(/\s+/).length / sentences.length : 0;
    quality.readability = avgSentenceLength <= 20 ? 90 : Math.max(50, 90 - ((avgSentenceLength - 20) * 2));
    
    // Engagement indicators
    const questions = (content.match(/\?/g) || []).length;
    const ctaWords = (content.match(this.seoPatterns.action_words) || []).length;
    quality.engagement = Math.min(100, (questions + ctaWords) * 5);
    
    // Informativeness (based on content depth)
    const infoWords = (content.match(/\b(data|study|research|analysis|report|statistics)\b/gi) || []).length;
    quality.informativeness = Math.min(100, infoWords * 10);
    
    return quality;
  }

  /**
   * Calculate content optimization score
   */
  calculateContentScore(metrics, depth, quality) {
    let score = 60; // Base score
    
    // Length factors
    if (metrics.word_count >= this.options.minWordCount) score += 15;
    if (metrics.word_count >= this.options.idealWordCount) score += 10;
    
    // Depth factors
    score += Math.min(10, depth.content_depth * 0.1);
    score += Math.min(5, depth.supporting_elements * 0.05);
    
    // Quality factors
    score += Math.min(10, quality.readability * 0.1);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze JSON-LD structured data
   */
  analyzeJSONLD(document) {
    const analysis = {
      json_ld_scripts: 0,
      schema_types: [],
      valid_structure: true
    };
    
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    analysis.json_ld_scripts = jsonLdScripts.length;
    
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type']) {
          analysis.schema_types.push(data['@type']);
        }
      } catch (error) {
        analysis.valid_structure = false;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze microdata
   */
  analyzeMicrodata(document) {
    const analysis = {
      itemscope_elements: 0,
      itemtype_elements: 0,
      itemprop_elements: 0
    };
    
    analysis.itemscope_elements = document.querySelectorAll('[itemscope]').length;
    analysis.itemtype_elements = document.querySelectorAll('[itemtype]').length;
    analysis.itemprop_elements = document.querySelectorAll('[itemprop]').length;
    
    return analysis;
  }

  /**
   * Detect schema types
   */
  detectSchemaTypes(document) {
    const types = [];
    
    // Check JSON-LD
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type']) {
          types.push(data['@type']);
        }
      } catch (error) {
        // Invalid JSON-LD
      }
    });
    
    // Check microdata
    const itemTypes = document.querySelectorAll('[itemtype]');
    itemTypes.forEach(element => {
      const itemType = element.getAttribute('itemtype');
      if (itemType) {
        const schemaType = itemType.split('/').pop();
        types.push(schemaType);
      }
    });
    
    return [...new Set(types)];
  }

  /**
   * Assess structured data quality
   */
  assessStructuredDataQuality(jsonLd, microdata, types) {
    const quality = {
      implementation_method: 'none',
      completeness: 0,
      relevance: 0
    };
    
    if (jsonLd.json_ld_scripts > 0) {
      quality.implementation_method = 'json-ld';
      quality.completeness = jsonLd.valid_structure ? 90 : 50;
    } else if (microdata.itemscope_elements > 0) {
      quality.implementation_method = 'microdata';
      quality.completeness = 70;
    }
    
    // Relevance based on schema types
    const relevantTypes = ['Article', 'BlogPosting', 'Product', 'Organization', 'WebPage'];
    const relevantCount = types.filter(type => relevantTypes.includes(type)).length;
    quality.relevance = Math.min(100, relevantCount * 30);
    
    return quality;
  }

  /**
   * Calculate schema markup score
   */
  calculateSchemaScore(jsonLd, microdata, structured) {
    let score = 50; // Base score
    
    // Implementation bonus
    if (jsonLd.json_ld_scripts > 0) score += 25;
    else if (microdata.itemscope_elements > 0) score += 15;
    
    // Quality factors
    score += Math.min(15, structured.completeness * 0.15);
    score += Math.min(10, structured.relevance * 0.1);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate weighted SEO score
   */
  calculateWeightedSEOScore(scores) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(this.seoWeights).forEach(([component, weight]) => {
      if (scores[component] !== undefined) {
        weightedSum += scores[component] * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Assess SEO health
   */
  assessSEOHealth(scores) {
    const health = {
      critical_issues: [],
      warnings: [],
      strengths: [],
      overall_health: 'poor'
    };
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 40) {
        health.critical_issues.push({
          component,
          score,
          severity: 'critical'
        });
      } else if (score < 70) {
        health.warnings.push({
          component,
          score,
          severity: 'warning'
        });
      } else {
        health.strengths.push({
          component,
          score,
          severity: 'strength'
        });
      }
    });
    
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    if (avgScore >= 80) health.overall_health = 'excellent';
    else if (avgScore >= 70) health.overall_health = 'good';
    else if (avgScore >= 60) health.overall_health = 'fair';
    
    return health;
  }

  /**
   * Identify optimization opportunities
   */
  identifyOptimizationOpportunities(scores) {
    const opportunities = [];
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 80) {
        const improvement = 80 - score;
        opportunities.push({
          component,
          current_score: score,
          potential_improvement: improvement,
          priority: score < 50 ? 'high' : score < 70 ? 'medium' : 'low',
          impact: this.seoWeights[component] || 5
        });
      }
    });
    
    return opportunities.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Classify SEO quality
   */
  classifySEOQuality(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very_poor';
  }

  /**
   * Identify priority improvements
   */
  identifyPriorityImprovements(scores) {
    const improvements = [];
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 70) {
        improvements.push({
          component,
          score,
          priority: score < 40 ? 'critical' : score < 60 ? 'high' : 'medium',
          weight: this.seoWeights[component] || 5,
          actions: this.getSEOImprovementActions(component, score)
        });
      }
    });
    
    return improvements.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get SEO improvement actions
   */
  getSEOImprovementActions(component, score) {
    const actions = {
      title: [
        'Optimize title length (30-60 characters)',
        'Include primary keyword in title',
        'Make title more compelling and unique'
      ],
      meta: [
        'Write compelling meta description (120-160 characters)',
        'Include target keywords naturally',
        'Add call-to-action in meta description'
      ],
      headers: [
        'Add H1 tag with primary keyword',
        'Create logical heading hierarchy',
        'Use descriptive heading text'
      ],
      keywords: [
        'Optimize keyword density (1-3%)',
        'Distribute keywords naturally throughout content',
        'Add semantic and long-tail keywords'
      ],
      links: [
        'Add more internal links to relevant pages',
        'Use descriptive anchor text',
        'Include authoritative external links'
      ],
      content: [
        'Increase content length (minimum 300 words)',
        'Improve content depth and quality',
        'Add supporting elements (lists, images)'
      ],
      schema: [
        'Add JSON-LD structured data',
        'Implement relevant Schema.org markup',
        'Validate structured data implementation'
      ]
    };
    
    return actions[component] || ['Review and optimize SEO elements'];
  }

  /**
   * Generate SEO insights
   */
  generateSEOInsights(assessment) {
    const insights = [];
    
    if (assessment.overall_score >= 85) {
      insights.push({
        type: 'positive',
        message: 'Excellent SEO optimization with strong technical foundation',
        impact: 'high'
      });
    }
    
    if (assessment.seo_health.critical_issues.length > 0) {
      insights.push({
        type: 'critical',
        message: `${assessment.seo_health.critical_issues.length} critical SEO issues require immediate attention`,
        impact: 'high'
      });
    }
    
    if (assessment.component_scores.schema < 50) {
      insights.push({
        type: 'improvement',
        message: 'Adding structured data markup would significantly improve SEO',
        impact: 'medium'
      });
    }
    
    return insights;
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(assessment) {
    const recommendations = [];
    
    assessment.priority_improvements.forEach(improvement => {
      recommendations.push({
        category: improvement.component,
        priority: improvement.priority,
        current_score: improvement.score,
        target_score: Math.min(100, improvement.score + 20),
        actions: improvement.actions,
        expected_impact: improvement.weight > 15 ? 'high' : improvement.weight > 10 ? 'medium' : 'low'
      });
    });
    
    return recommendations;
  }

  /**
   * Identify technical SEO issues
   */
  identifyTechnicalIssues({ title, meta, headers, schema }) {
    const issues = [];
    
    if (!title.title_text) {
      issues.push({
        type: 'missing_title',
        severity: 'critical',
        message: 'Missing title tag',
        impact: 'Very high impact on SEO rankings'
      });
    }
    
    if (!meta.meta_text) {
      issues.push({
        type: 'missing_meta_description',
        severity: 'high',
        message: 'Missing meta description',
        impact: 'High impact on click-through rates'
      });
    }
    
    if (!headers.header_hierarchy.h1_present) {
      issues.push({
        type: 'missing_h1',
        severity: 'high',
        message: 'Missing H1 heading',
        impact: 'Important for content structure and SEO'
      });
    }
    
    if (schema.schema_count === 0) {
      issues.push({
        type: 'missing_schema',
        severity: 'medium',
        message: 'No structured data markup found',
        impact: 'Missed opportunity for rich snippets'
      });
    }
    
    return issues;
  }

  /**
   * Handle detection errors
   */
  handleDetectionError(error) {
    return {
      success: false,
      error: error.message,
      detector: this.detectorType,
      version: this.version,
      timestamp: new Date().toISOString(),
      fallback_data: {
        seo_score: 0,
        seo_metrics: {
          title_length: 0,
          meta_length: 0,
          word_count: 0,
          header_count: 0,
          internal_links: 0,
          external_links: 0,
          keyword_density: 0,
          schema_types: 0
        }
      }
    };
  }
}

export default ContentSEODetector;
