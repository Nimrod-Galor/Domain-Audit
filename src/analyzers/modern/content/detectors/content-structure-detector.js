/**
 * ============================================================================
 * CONTENT STRUCTURE DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced content structure and hierarchy detection and analysis
 * Part of Content Analyzer Combined Approach (21st Implementation)
 * 
 * Capabilities:
 * - Content hierarchy analysis (H1-H6 structure)
 * - Content block identification and segmentation
 * - Navigation structure assessment
 * - Content organization evaluation
 * - Semantic HTML structure validation
 * - Content flow and readability assessment
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ContentStructureDetector {
  constructor(options = {}) {
    this.options = {
      // Structure Analysis Configuration
      enableHierarchyAnalysis: options.enableHierarchyAnalysis !== false,
      enableBlockAnalysis: options.enableBlockAnalysis !== false,
      enableNavigationAnalysis: options.enableNavigationAnalysis !== false,
      enableSemanticAnalysis: options.enableSemanticAnalysis !== false,
      enableFlowAnalysis: options.enableFlowAnalysis !== false,
      
      // Structure Quality Thresholds
      minContentBlocks: options.minContentBlocks || 3,
      maxHierarchyDepth: options.maxHierarchyDepth || 6,
      idealParagraphLength: options.idealParagraphLength || 150,
      maxParagraphLength: options.maxParagraphLength || 300,
      
      // Content Structure Requirements
      requireH1: options.requireH1 !== false,
      requireLogicalHeadingOrder: options.requireLogicalHeadingOrder !== false,
      requireContentSections: options.requireContentSections !== false,
      
      ...options
    };

    this.detectorType = 'content_structure';
    this.version = '1.0.0';
    
    // Structure patterns and validation rules
    this.structurePatterns = {
      heading: /^h[1-6]$/i,
      content_block: /^(article|section|div|main|aside)$/i,
      navigation: /^(nav|ul|ol|menu)$/i,
      semantic: /^(header|main|footer|article|section|aside|nav)$/i,
      list: /^(ul|ol|dl)$/i
    };
    
    // Content flow indicators
    this.flowIndicators = {
      transition_words: /\b(however|therefore|furthermore|moreover|consequently|meanwhile|additionally|similarly|conversely|nonetheless)\b/gi,
      connective_phrases: /\b(in addition|for example|on the other hand|as a result|in conclusion|to summarize)\b/gi,
      logical_sequences: /\b(first|second|third|finally|next|then|subsequently|previously)\b/gi
    };

    console.log('🏗️ Content Structure Detector initialized');
    console.log(`📋 Structure Analysis: ${this.options.enableHierarchyAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`🧱 Block Analysis: ${this.options.enableBlockAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`🧭 Navigation Analysis: ${this.options.enableNavigationAnalysis ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Main detection method for content structure analysis
   */
  async detect(context, configuration) {
    const startTime = Date.now();
    
    try {
      console.log('🏗️ Analyzing content structure...');
      
      const { document } = context;
      if (!document) {
        throw new Error('Document is required for content structure analysis');
      }

      // Phase 1: Content Hierarchy Analysis
      const hierarchyAnalysis = await this.analyzeContentHierarchy(document);
      
      // Phase 2: Content Block Analysis
      const blockAnalysis = await this.analyzeContentBlocks(document);
      
      // Phase 3: Navigation Structure Analysis
      const navigationAnalysis = await this.analyzeNavigationStructure(document);
      
      // Phase 4: Semantic Structure Analysis
      const semanticAnalysis = await this.analyzeSemanticStructure(document);
      
      // Phase 5: Content Flow Analysis
      const flowAnalysis = await this.analyzeContentFlow(document);
      
      // Phase 6: Structure Quality Assessment
      const qualityAssessment = await this.assessStructureQuality({
        hierarchy: hierarchyAnalysis,
        blocks: blockAnalysis,
        navigation: navigationAnalysis,
        semantic: semanticAnalysis,
        flow: flowAnalysis
      });
      
      const endTime = Date.now();
      
      return {
        detector: this.detectorType,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Structure Analysis Results
        hierarchy_analysis: hierarchyAnalysis,
        block_analysis: blockAnalysis,
        navigation_analysis: navigationAnalysis,
        semantic_analysis: semanticAnalysis,
        flow_analysis: flowAnalysis,
        
        // Quality Assessment
        quality_assessment: qualityAssessment,
        
        // Overall Structure Score
        hierarchy_score: qualityAssessment.overall_score,
        
        // Structure Metrics
        structure_metrics: {
          total_headings: hierarchyAnalysis.heading_count,
          content_blocks: blockAnalysis.total_blocks,
          navigation_elements: navigationAnalysis.navigation_count,
          semantic_elements: semanticAnalysis.semantic_count,
          flow_indicators: flowAnalysis.total_indicators,
          structure_depth: hierarchyAnalysis.max_depth,
          organization_score: qualityAssessment.organization_score
        },
        
        // Structure Insights
        structure_insights: this.generateStructureInsights(qualityAssessment),
        
        // Optimization Recommendations
        optimization_recommendations: this.generateOptimizationRecommendations(qualityAssessment),
        
        // Validation Results
        validation_results: this.validateStructureCompliance({
          hierarchy: hierarchyAnalysis,
          blocks: blockAnalysis,
          semantic: semanticAnalysis
        })
      };
      
    } catch (error) {
      console.error('❌ Content structure detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Phase 1: Analyze content hierarchy (headings structure)
   */
  async analyzeContentHierarchy(document) {
    const analysis = {
      category: 'Content Hierarchy',
      heading_structure: {},
      hierarchy_issues: [],
      hierarchy_metrics: {}
    };
    
    try {
      // Find all headings
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      analysis.heading_count = headings.length;
      analysis.heading_structure = this.mapHeadingStructure(headings);
      analysis.hierarchy_issues = this.identifyHierarchyIssues(headings);
      analysis.hierarchy_metrics = this.calculateHierarchyMetrics(headings);
      
      // Calculate hierarchy quality score
      analysis.hierarchy_quality_score = this.calculateHierarchyScore(
        analysis.heading_structure,
        analysis.hierarchy_issues,
        analysis.hierarchy_metrics
      );
      
    } catch (error) {
      console.error('Hierarchy analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 2: Analyze content blocks and sections
   */
  async analyzeContentBlocks(document) {
    const analysis = {
      category: 'Content Blocks',
      content_sections: [],
      block_types: {},
      block_metrics: {}
    };
    
    try {
      // Identify content blocks
      const contentBlocks = document.querySelectorAll('article, section, div, main, aside, header, footer');
      
      analysis.total_blocks = contentBlocks.length;
      analysis.content_sections = this.identifyContentSections(contentBlocks);
      analysis.block_types = this.categorizeBlockTypes(contentBlocks);
      analysis.block_metrics = this.calculateBlockMetrics(contentBlocks);
      
      // Analyze content distribution
      analysis.content_distribution = this.analyzeContentDistribution(contentBlocks);
      
      // Calculate block organization score
      analysis.block_organization_score = this.calculateBlockOrganizationScore(
        analysis.content_sections,
        analysis.block_types,
        analysis.content_distribution
      );
      
    } catch (error) {
      console.error('Block analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 3: Analyze navigation structure
   */
  async analyzeNavigationStructure(document) {
    const analysis = {
      category: 'Navigation Structure',
      navigation_elements: [],
      navigation_types: {},
      accessibility_features: {}
    };
    
    try {
      // Find navigation elements
      const navElements = document.querySelectorAll('nav, [role="navigation"], .nav, .navigation, .menu');
      
      analysis.navigation_count = navElements.length;
      analysis.navigation_elements = this.analyzeNavigationElements(navElements);
      analysis.navigation_types = this.categorizeNavigationTypes(navElements);
      analysis.accessibility_features = this.assessNavigationAccessibility(navElements);
      
      // Analyze navigation usability
      analysis.usability_assessment = this.assessNavigationUsability(navElements);
      
      // Calculate navigation score
      analysis.navigation_score = this.calculateNavigationScore(
        analysis.navigation_elements,
        analysis.accessibility_features,
        analysis.usability_assessment
      );
      
    } catch (error) {
      console.error('Navigation analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 4: Analyze semantic HTML structure
   */
  async analyzeSemanticStructure(document) {
    const analysis = {
      category: 'Semantic Structure',
      semantic_elements: {},
      semantic_compliance: {},
      html5_features: {}
    };
    
    try {
      // Find semantic HTML5 elements
      const semanticElements = document.querySelectorAll('header, main, footer, article, section, aside, nav, figure, figcaption');
      
      analysis.semantic_count = semanticElements.length;
      analysis.semantic_elements = this.catalogSemanticElements(semanticElements);
      analysis.semantic_compliance = this.assessSemanticCompliance(document);
      analysis.html5_features = this.identifyHTML5Features(document);
      
      // Analyze document outline
      analysis.document_outline = this.generateDocumentOutline(document);
      
      // Calculate semantic score
      analysis.semantic_score = this.calculateSemanticScore(
        analysis.semantic_elements,
        analysis.semantic_compliance,
        analysis.document_outline
      );
      
    } catch (error) {
      console.error('Semantic analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 5: Analyze content flow and readability structure
   */
  async analyzeContentFlow(document) {
    const analysis = {
      category: 'Content Flow',
      flow_indicators: {},
      content_rhythm: {},
      readability_structure: {}
    };
    
    try {
      // Analyze text flow indicators
      const textContent = document.body ? document.body.textContent || '' : '';
      
      analysis.flow_indicators = this.detectFlowIndicators(textContent);
      analysis.content_rhythm = this.analyzeContentRhythm(document);
      analysis.readability_structure = this.assessReadabilityStructure(document);
      
      // Analyze paragraph structure
      analysis.paragraph_analysis = this.analyzeParagraphStructure(document);
      
      // Calculate flow score
      analysis.flow_score = this.calculateFlowScore(
        analysis.flow_indicators,
        analysis.content_rhythm,
        analysis.paragraph_analysis
      );
      
      analysis.total_indicators = Object.values(analysis.flow_indicators)
        .reduce((sum, indicators) => sum + (indicators.count || 0), 0);
      
    } catch (error) {
      console.error('Flow analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 6: Assess overall structure quality
   */
  async assessStructureQuality(analyses) {
    const assessment = {
      category: 'Structure Quality Assessment',
      component_scores: {},
      overall_metrics: {},
      quality_indicators: {}
    };
    
    try {
      // Calculate component scores
      assessment.component_scores = {
        hierarchy: analyses.hierarchy?.hierarchy_quality_score || 0,
        blocks: analyses.blocks?.block_organization_score || 0,
        navigation: analyses.navigation?.navigation_score || 0,
        semantic: analyses.semantic?.semantic_score || 0,
        flow: analyses.flow?.flow_score || 0
      };
      
      // Calculate overall score
      const scores = Object.values(assessment.component_scores).filter(score => score > 0);
      assessment.overall_score = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
      
      // Generate quality indicators
      assessment.quality_indicators = this.generateQualityIndicators(assessment.component_scores);
      
      // Calculate organization score
      assessment.organization_score = this.calculateOrganizationScore(analyses);
      
      // Identify improvement areas
      assessment.improvement_areas = this.identifyImprovementAreas(assessment.component_scores);
      
    } catch (error) {
      console.error('Quality assessment failed:', error);
      assessment.error = error.message;
    }
    
    return assessment;
  }

  /**
   * Map heading structure and hierarchy
   */
  mapHeadingStructure(headings) {
    const structure = {
      levels: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      hierarchy: [],
      max_depth: 0
    };
    
    headings.forEach((heading, index) => {
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent.trim();
      const depth = parseInt(level.charAt(1));
      
      structure.levels[level]++;
      structure.hierarchy.push({
        index,
        level,
        depth,
        text: text.substring(0, 100),
        length: text.length
      });
      
      structure.max_depth = Math.max(structure.max_depth, depth);
    });
    
    return structure;
  }

  /**
   * Identify hierarchy issues
   */
  identifyHierarchyIssues(headings) {
    const issues = [];
    let previousLevel = 0;
    
    // Check for H1 presence
    const h1Count = Array.from(headings).filter(h => h.tagName.toLowerCase() === 'h1').length;
    if (h1Count === 0) {
      issues.push({ type: 'missing_h1', severity: 'high', message: 'No H1 heading found' });
    } else if (h1Count > 1) {
      issues.push({ type: 'multiple_h1', severity: 'medium', message: 'Multiple H1 headings found' });
    }
    
    // Check heading order
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (index > 0 && currentLevel > previousLevel + 1) {
        issues.push({
          type: 'skipped_level',
          severity: 'medium',
          message: `Heading level skipped from H${previousLevel} to H${currentLevel}`,
          element: heading.tagName,
          index
        });
      }
      
      previousLevel = currentLevel;
    });
    
    return issues;
  }

  /**
   * Calculate hierarchy metrics
   */
  calculateHierarchyMetrics(headings) {
    const metrics = {
      total_headings: headings.length,
      heading_density: 0,
      average_heading_length: 0,
      heading_distribution: {}
    };
    
    if (headings.length > 0) {
      const totalTextLength = Array.from(headings)
        .reduce((sum, h) => sum + h.textContent.length, 0);
      
      metrics.average_heading_length = Math.round(totalTextLength / headings.length);
      
      // Calculate heading distribution
      Array.from(headings).forEach(heading => {
        const level = heading.tagName.toLowerCase();
        metrics.heading_distribution[level] = (metrics.heading_distribution[level] || 0) + 1;
      });
    }
    
    return metrics;
  }

  /**
   * Calculate hierarchy score
   */
  calculateHierarchyScore(structure, issues, metrics) {
    let score = 100;
    
    // Deduct for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
    
    // Bonus for proper structure
    if (structure.levels.h1 === 1) score += 10;
    if (structure.max_depth <= 4) score += 5;
    if (metrics.total_headings >= 3) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify content sections
   */
  identifyContentSections(blocks) {
    const sections = [];
    
    blocks.forEach((block, index) => {
      const tagName = block.tagName.toLowerCase();
      const className = block.className || '';
      const id = block.id || '';
      const textLength = block.textContent ? block.textContent.length : 0;
      
      sections.push({
        index,
        tag: tagName,
        class: className,
        id,
        text_length: textLength,
        has_headings: block.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
        nested_blocks: block.querySelectorAll('article, section, div').length
      });
    });
    
    return sections;
  }

  /**
   * Categorize block types
   */
  categorizeBlockTypes(blocks) {
    const types = {
      semantic: 0,
      structural: 0,
      container: 0,
      content: 0
    };
    
    blocks.forEach(block => {
      const tagName = block.tagName.toLowerCase();
      
      if (['article', 'section', 'aside', 'main'].includes(tagName)) {
        types.semantic++;
      } else if (['header', 'footer', 'nav'].includes(tagName)) {
        types.structural++;
      } else if (tagName === 'div') {
        if (block.textContent && block.textContent.trim().length > 50) {
          types.content++;
        } else {
          types.container++;
        }
      }
    });
    
    return types;
  }

  /**
   * Calculate block metrics
   */
  calculateBlockMetrics(blocks) {
    const metrics = {
      total_blocks: blocks.length,
      average_content_length: 0,
      blocks_with_headings: 0,
      nested_depth: 0
    };
    
    if (blocks.length > 0) {
      let totalLength = 0;
      let maxDepth = 0;
      
      blocks.forEach(block => {
        const textLength = block.textContent ? block.textContent.length : 0;
        totalLength += textLength;
        
        if (block.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0) {
          metrics.blocks_with_headings++;
        }
        
        // Calculate nesting depth
        let depth = 0;
        let parent = block.parentElement;
        while (parent && parent !== document.body) {
          if (this.structurePatterns.content_block.test(parent.tagName)) {
            depth++;
          }
          parent = parent.parentElement;
        }
        maxDepth = Math.max(maxDepth, depth);
      });
      
      metrics.average_content_length = Math.round(totalLength / blocks.length);
      metrics.nested_depth = maxDepth;
    }
    
    return metrics;
  }

  /**
   * Analyze content distribution
   */
  analyzeContentDistribution(blocks) {
    const distribution = {
      content_heavy_blocks: 0,
      light_content_blocks: 0,
      empty_blocks: 0,
      balanced_distribution: false
    };
    
    blocks.forEach(block => {
      const textLength = block.textContent ? block.textContent.trim().length : 0;
      
      if (textLength === 0) {
        distribution.empty_blocks++;
      } else if (textLength < 100) {
        distribution.light_content_blocks++;
      } else {
        distribution.content_heavy_blocks++;
      }
    });
    
    // Check for balanced distribution
    const totalBlocks = blocks.length;
    if (totalBlocks > 0) {
      const contentRatio = distribution.content_heavy_blocks / totalBlocks;
      distribution.balanced_distribution = contentRatio >= 0.4 && contentRatio <= 0.8;
    }
    
    return distribution;
  }

  /**
   * Calculate block organization score
   */
  calculateBlockOrganizationScore(sections, types, distribution) {
    let score = 75; // Base score
    
    // Bonus for semantic structure
    if (types.semantic > 0) score += 15;
    if (types.structural > 0) score += 10;
    
    // Penalty for too many containers
    if (types.container > types.content * 2) score -= 10;
    
    // Bonus for balanced content distribution
    if (distribution.balanced_distribution) score += 10;
    
    // Penalty for empty blocks
    score -= distribution.empty_blocks * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze navigation elements
   */
  analyzeNavigationElements(navElements) {
    const elements = [];
    
    navElements.forEach((nav, index) => {
      const links = nav.querySelectorAll('a');
      const lists = nav.querySelectorAll('ul, ol');
      
      elements.push({
        index,
        tag: nav.tagName.toLowerCase(),
        link_count: links.length,
        list_count: lists.length,
        has_aria_label: nav.hasAttribute('aria-label'),
        has_role: nav.hasAttribute('role'),
        position: this.determineNavigationPosition(nav)
      });
    });
    
    return elements;
  }

  /**
   * Determine navigation position
   */
  determineNavigationPosition(nav) {
    const rect = nav.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    if (rect.top < viewportHeight * 0.2) {
      return 'header';
    } else if (rect.bottom > viewportHeight * 0.8) {
      return 'footer';
    } else {
      return 'content';
    }
  }

  /**
   * Categorize navigation types
   */
  categorizeNavigationTypes(navElements) {
    const types = {
      primary: 0,
      secondary: 0,
      breadcrumb: 0,
      footer: 0,
      sidebar: 0
    };
    
    navElements.forEach(nav => {
      const className = nav.className.toLowerCase();
      const id = nav.id.toLowerCase();
      const text = nav.textContent.toLowerCase();
      
      if (className.includes('breadcrumb') || id.includes('breadcrumb') || text.includes('home')) {
        types.breadcrumb++;
      } else if (className.includes('primary') || className.includes('main')) {
        types.primary++;
      } else if (className.includes('footer') || this.determineNavigationPosition(nav) === 'footer') {
        types.footer++;
      } else if (className.includes('sidebar') || className.includes('side')) {
        types.sidebar++;
      } else {
        types.secondary++;
      }
    });
    
    return types;
  }

  /**
   * Assess navigation accessibility
   */
  assessNavigationAccessibility(navElements) {
    const features = {
      has_aria_labels: 0,
      has_roles: 0,
      has_skip_links: 0,
      keyboard_accessible: 0,
      semantic_markup: 0
    };
    
    navElements.forEach(nav => {
      if (nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby')) {
        features.has_aria_labels++;
      }
      
      if (nav.hasAttribute('role')) {
        features.has_roles++;
      }
      
      if (nav.tagName.toLowerCase() === 'nav') {
        features.semantic_markup++;
      }
      
      // Check for skip links
      const skipLink = nav.querySelector('a[href^="#"]');
      if (skipLink && skipLink.textContent.toLowerCase().includes('skip')) {
        features.has_skip_links++;
      }
    });
    
    return features;
  }

  /**
   * Assess navigation usability
   */
  assessNavigationUsability(navElements) {
    const assessment = {
      total_links: 0,
      average_links_per_nav: 0,
      descriptive_link_text: 0,
      consistent_structure: true
    };
    
    if (navElements.length > 0) {
      let totalLinks = 0;
      let descriptiveLinks = 0;
      
      navElements.forEach(nav => {
        const links = nav.querySelectorAll('a');
        totalLinks += links.length;
        
        links.forEach(link => {
          const text = link.textContent.trim();
          if (text.length > 2 && !['click', 'here', 'more', 'link'].includes(text.toLowerCase())) {
            descriptiveLinks++;
          }
        });
      });
      
      assessment.total_links = totalLinks;
      assessment.average_links_per_nav = Math.round(totalLinks / navElements.length);
      assessment.descriptive_link_text = totalLinks > 0 ? 
        Math.round((descriptiveLinks / totalLinks) * 100) : 0;
    }
    
    return assessment;
  }

  /**
   * Calculate navigation score
   */
  calculateNavigationScore(elements, accessibility, usability) {
    let score = 70; // Base score
    
    // Bonus for accessibility features
    score += accessibility.has_aria_labels * 5;
    score += accessibility.semantic_markup * 5;
    score += accessibility.has_skip_links * 5;
    
    // Bonus for usability
    if (usability.descriptive_link_text > 80) score += 10;
    if (usability.average_links_per_nav >= 3 && usability.average_links_per_nav <= 7) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Catalog semantic elements
   */
  catalogSemanticElements(elements) {
    const catalog = {
      structural: { header: 0, main: 0, footer: 0 },
      sectioning: { article: 0, section: 0, aside: 0, nav: 0 },
      content: { figure: 0, figcaption: 0 }
    };
    
    elements.forEach(element => {
      const tag = element.tagName.toLowerCase();
      
      if (catalog.structural[tag] !== undefined) {
        catalog.structural[tag]++;
      } else if (catalog.sectioning[tag] !== undefined) {
        catalog.sectioning[tag]++;
      } else if (catalog.content[tag] !== undefined) {
        catalog.content[tag]++;
      }
    });
    
    return catalog;
  }

  /**
   * Assess semantic compliance
   */
  assessSemanticCompliance(document) {
    const compliance = {
      has_main: document.querySelector('main') !== null,
      has_header: document.querySelector('header') !== null,
      has_footer: document.querySelector('footer') !== null,
      proper_sectioning: true,
      landmark_roles: 0
    };
    
    // Check for landmark roles
    const landmarks = document.querySelectorAll('[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"]');
    compliance.landmark_roles = landmarks.length;
    
    // Check sectioning
    const articles = document.querySelectorAll('article');
    articles.forEach(article => {
      if (!article.querySelector('h1, h2, h3, h4, h5, h6')) {
        compliance.proper_sectioning = false;
      }
    });
    
    return compliance;
  }

  /**
   * Identify HTML5 features
   */
  identifyHTML5Features(document) {
    const features = {
      semantic_elements: 0,
      form_elements: 0,
      media_elements: 0,
      interactive_elements: 0
    };
    
    // Semantic elements
    const semanticTags = ['header', 'main', 'footer', 'article', 'section', 'aside', 'nav', 'figure'];
    semanticTags.forEach(tag => {
      if (document.querySelector(tag)) {
        features.semantic_elements++;
      }
    });
    
    // Form elements
    const formInputs = document.querySelectorAll('input[type="email"], input[type="url"], input[type="tel"], input[type="date"]');
    features.form_elements = formInputs.length;
    
    // Media elements
    const mediaElements = document.querySelectorAll('video, audio, canvas, svg');
    features.media_elements = mediaElements.length;
    
    // Interactive elements
    const interactiveElements = document.querySelectorAll('details, summary, progress, meter');
    features.interactive_elements = interactiveElements.length;
    
    return features;
  }

  /**
   * Generate document outline
   */
  generateDocumentOutline(document) {
    const outline = {
      structure: [],
      depth: 0,
      completeness: 0
    };
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      
      outline.structure.push({
        level,
        text: text.substring(0, 60),
        index,
        parent_section: this.findParentSection(heading)
      });
      
      outline.depth = Math.max(outline.depth, level);
      previousLevel = level;
    });
    
    outline.completeness = headings.length > 0 ? Math.min(100, headings.length * 20) : 0;
    
    return outline;
  }

  /**
   * Find parent section of a heading
   */
  findParentSection(heading) {
    let parent = heading.parentElement;
    
    while (parent && parent !== document.body) {
      if (['article', 'section', 'main', 'aside'].includes(parent.tagName.toLowerCase())) {
        return parent.tagName.toLowerCase();
      }
      parent = parent.parentElement;
    }
    
    return 'body';
  }

  /**
   * Calculate semantic score
   */
  calculateSemanticScore(elements, compliance, outline) {
    let score = 60; // Base score
    
    // Bonus for semantic elements
    const totalSemantic = Object.values(elements.structural).reduce((a, b) => a + b, 0) +
                         Object.values(elements.sectioning).reduce((a, b) => a + b, 0);
    score += Math.min(25, totalSemantic * 3);
    
    // Bonus for compliance
    if (compliance.has_main) score += 5;
    if (compliance.has_header) score += 3;
    if (compliance.has_footer) score += 3;
    if (compliance.proper_sectioning) score += 5;
    
    // Bonus for document outline
    score += Math.min(10, outline.completeness / 10);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect flow indicators in text
   */
  detectFlowIndicators(text) {
    const indicators = {};
    
    Object.entries(this.flowIndicators).forEach(([type, pattern]) => {
      const matches = text.match(pattern) || [];
      indicators[type] = {
        count: matches.length,
        examples: matches.slice(0, 5)
      };
    });
    
    return indicators;
  }

  /**
   * Analyze content rhythm
   */
  analyzeContentRhythm(document) {
    const rhythm = {
      paragraph_count: 0,
      average_paragraph_length: 0,
      sentence_variety: 0,
      reading_flow: 0
    };
    
    const paragraphs = document.querySelectorAll('p');
    rhythm.paragraph_count = paragraphs.length;
    
    if (paragraphs.length > 0) {
      let totalLength = 0;
      let sentenceLengths = [];
      
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        totalLength += text.length;
        
        // Simple sentence detection
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        sentences.forEach(sentence => {
          sentenceLengths.push(sentence.trim().length);
        });
      });
      
      rhythm.average_paragraph_length = Math.round(totalLength / paragraphs.length);
      
      // Calculate sentence variety (coefficient of variation)
      if (sentenceLengths.length > 1) {
        const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
        const variance = sentenceLengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / sentenceLengths.length;
        const stdDev = Math.sqrt(variance);
        rhythm.sentence_variety = Math.round((stdDev / mean) * 100);
      }
    }
    
    return rhythm;
  }

  /**
   * Assess readability structure
   */
  assessReadabilityStructure(document) {
    const structure = {
      has_lists: document.querySelectorAll('ul, ol').length > 0,
      has_quotes: document.querySelectorAll('blockquote, q').length > 0,
      has_emphasis: document.querySelectorAll('strong, b, em, i').length > 0,
      has_code: document.querySelectorAll('code, pre').length > 0,
      paragraph_breaks: true // Assumed for now
    };
    
    structure.readability_features = Object.values(structure).filter(Boolean).length;
    
    return structure;
  }

  /**
   * Analyze paragraph structure
   */
  analyzeParagraphStructure(document) {
    const analysis = {
      total_paragraphs: 0,
      short_paragraphs: 0,
      medium_paragraphs: 0,
      long_paragraphs: 0,
      very_long_paragraphs: 0,
      average_length: 0
    };
    
    const paragraphs = document.querySelectorAll('p');
    analysis.total_paragraphs = paragraphs.length;
    
    if (paragraphs.length > 0) {
      let totalLength = 0;
      
      paragraphs.forEach(p => {
        const length = p.textContent.trim().length;
        totalLength += length;
        
        if (length < 50) {
          analysis.short_paragraphs++;
        } else if (length < 150) {
          analysis.medium_paragraphs++;
        } else if (length < 300) {
          analysis.long_paragraphs++;
        } else {
          analysis.very_long_paragraphs++;
        }
      });
      
      analysis.average_length = Math.round(totalLength / paragraphs.length);
    }
    
    return analysis;
  }

  /**
   * Calculate flow score
   */
  calculateFlowScore(indicators, rhythm, paragraphs) {
    let score = 70; // Base score
    
    // Bonus for flow indicators
    const totalIndicators = Object.values(indicators).reduce((sum, ind) => sum + ind.count, 0);
    score += Math.min(15, totalIndicators * 2);
    
    // Bonus for good paragraph structure
    if (paragraphs.average_length >= 50 && paragraphs.average_length <= 200) {
      score += 10;
    }
    
    // Bonus for sentence variety
    if (rhythm.sentence_variety >= 20 && rhythm.sentence_variety <= 50) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate quality indicators
   */
  generateQualityIndicators(scores) {
    const indicators = {
      strengths: [],
      weaknesses: [],
      overall_health: 'good'
    };
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score >= 80) {
        indicators.strengths.push({
          component,
          score,
          status: 'excellent'
        });
      } else if (score < 60) {
        indicators.weaknesses.push({
          component,
          score,
          status: 'needs_improvement'
        });
      }
    });
    
    const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    if (averageScore >= 80) {
      indicators.overall_health = 'excellent';
    } else if (averageScore >= 70) {
      indicators.overall_health = 'good';
    } else if (averageScore >= 60) {
      indicators.overall_health = 'fair';
    } else {
      indicators.overall_health = 'poor';
    }
    
    return indicators;
  }

  /**
   * Calculate organization score
   */
  calculateOrganizationScore(analyses) {
    const scores = [
      analyses.hierarchy?.hierarchy_quality_score || 0,
      analyses.blocks?.block_organization_score || 0,
      analyses.semantic?.semantic_score || 0
    ].filter(score => score > 0);
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  /**
   * Identify improvement areas
   */
  identifyImprovementAreas(scores) {
    const areas = [];
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 70) {
        areas.push({
          component,
          score,
          priority: score < 50 ? 'high' : 'medium',
          suggestions: this.getImprovementSuggestions(component, score)
        });
      }
    });
    
    return areas.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get improvement suggestions for component
   */
  getImprovementSuggestions(component, score) {
    const suggestions = {
      hierarchy: [
        'Add proper H1 heading',
        'Follow logical heading order',
        'Include more descriptive headings'
      ],
      blocks: [
        'Use semantic HTML elements',
        'Organize content into logical sections',
        'Balance content distribution'
      ],
      navigation: [
        'Add ARIA labels to navigation',
        'Use semantic nav elements',
        'Improve link descriptions'
      ],
      semantic: [
        'Use HTML5 semantic elements',
        'Add proper document structure',
        'Include landmark roles'
      ],
      flow: [
        'Add transition words between sections',
        'Improve paragraph structure',
        'Balance sentence lengths'
      ]
    };
    
    return suggestions[component] || ['Review content structure and organization'];
  }

  /**
   * Generate structure insights
   */
  generateStructureInsights(assessment) {
    const insights = [];
    
    if (assessment.overall_score >= 85) {
      insights.push({
        type: 'positive',
        message: 'Excellent content structure with clear hierarchy and organization',
        impact: 'high'
      });
    } else if (assessment.overall_score < 60) {
      insights.push({
        type: 'improvement',
        message: 'Content structure needs significant improvement for better user experience',
        impact: 'high'
      });
    }
    
    assessment.improvement_areas.forEach(area => {
      if (area.priority === 'high') {
        insights.push({
          type: 'critical',
          message: `${area.component} structure requires immediate attention`,
          impact: 'high'
        });
      }
    });
    
    return insights;
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(assessment) {
    const recommendations = [];
    
    assessment.improvement_areas.forEach(area => {
      recommendations.push({
        category: area.component,
        priority: area.priority,
        score: area.score,
        suggestions: area.suggestions
      });
    });
    
    return recommendations;
  }

  /**
   * Validate structure compliance
   */
  validateStructureCompliance({ hierarchy, blocks, semantic }) {
    const validation = {
      html5_compliance: true,
      accessibility_compliance: true,
      seo_compliance: true,
      issues: []
    };
    
    // Check HTML5 compliance
    if (!semantic.semantic_compliance.has_main) {
      validation.html5_compliance = false;
      validation.issues.push({
        type: 'html5',
        message: 'Missing main element',
        severity: 'medium'
      });
    }
    
    // Check accessibility compliance
    if (hierarchy.hierarchy_issues.some(issue => issue.type === 'missing_h1')) {
      validation.accessibility_compliance = false;
      validation.issues.push({
        type: 'accessibility',
        message: 'Missing H1 heading affects screen reader navigation',
        severity: 'high'
      });
    }
    
    // Check SEO compliance
    if (hierarchy.hierarchy_metrics.total_headings < 2) {
      validation.seo_compliance = false;
      validation.issues.push({
        type: 'seo',
        message: 'Insufficient heading structure for SEO',
        severity: 'medium'
      });
    }
    
    return validation;
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
        hierarchy_score: 0,
        structure_metrics: {
          total_headings: 0,
          content_blocks: 0,
          navigation_elements: 0,
          semantic_elements: 0,
          flow_indicators: 0,
          structure_depth: 0,
          organization_score: 0
        }
      }
    };
  }
}

export default ContentStructureDetector;
