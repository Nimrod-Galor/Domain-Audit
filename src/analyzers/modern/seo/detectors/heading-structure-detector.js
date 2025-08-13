/**
 * ============================================================================
 * HEADING STRUCTURE DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced heading structure analysis for SEO optimization
 * Part of the Combined Approach SEO Analyzer (8th Implementation)
 * 
 * Features:
 * - Complete heading hierarchy analysis (H1-H6)
 * - Semantic structure validation
 * - Keyword optimization in headings
 * - Accessibility compliance checking
 * - Content organization assessment
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Detector Component
 */

export class HeadingStructureDetector {
  constructor(config = {}) {
    this.config = {
      includeKeywordAnalysis: config.includeKeywordAnalysis !== false,
      includeAccessibility: config.includeAccessibility !== false,
      includeSemanticAnalysis: config.includeSemanticAnalysis !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      maxHeadingLength: config.maxHeadingLength || 70,
      minHeadingLength: config.minHeadingLength || 10,
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'heading_structure';
    
    // Heading validation rules
    this.validationRules = {
      h1: {
        maxCount: 1,
        minLength: 20,
        maxLength: 60,
        shouldContainKeywords: true,
        required: true
      },
      h2: {
        minCount: 1,
        maxCount: 10,
        minLength: 15,
        maxLength: 70,
        shouldContainKeywords: true
      },
      h3: {
        maxCount: 20,
        minLength: 10,
        maxLength: 70
      },
      structure: {
        maxDepth: 6,
        requiresHierarchy: true,
        allowSkipping: false
      }
    };

    // Keyword importance weights
    this.keywordWeights = {
      h1: 1.0,
      h2: 0.8,
      h3: 0.6,
      h4: 0.4,
      h5: 0.3,
      h6: 0.2
    };

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'HeadingStructureDetector',
      version: this.version,
      type: this.detectorType,
      description: 'GPT-5 style heading structure analysis for SEO optimization',
      capabilities: [
        'heading_hierarchy_analysis',
        'semantic_structure_validation',
        'keyword_optimization_analysis',
        'accessibility_compliance_checking',
        'content_organization_assessment',
        'seo_heading_optimization'
      ],
      validationRules: this.validationRules,
      keywordSupport: this.config.includeKeywordAnalysis,
      accessibilitySupport: this.config.includeAccessibility,
      performance: 'High',
      accuracy: 'Comprehensive'
    };
  }

  /**
   * Analyze document heading structure
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Heading structure analysis results
   */
  async analyze(context) {
    try {
      const { document, url = '', pageData = {} } = context;
      
      if (!document) {
        throw new Error('Document is required for heading structure analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(document);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Detect all headings
      const headingElements = this._detectAllHeadings(document);

      // Phase 2: Analyze hierarchy structure
      const hierarchyAnalysis = this._analyzeHierarchy(headingElements);

      // Phase 3: Content and keyword analysis
      const contentAnalysis = this._analyzeHeadingContent(headingElements, pageData);

      // Phase 4: SEO optimization analysis
      const seoAnalysis = this._analyzeSEOOptimization(headingElements, hierarchyAnalysis);

      // Phase 5: Accessibility analysis
      const accessibilityAnalysis = this._analyzeAccessibility(headingElements, hierarchyAnalysis);

      // Phase 6: Validation and scoring
      const validation = this._validateHeadingStructure(headingElements, hierarchyAnalysis, contentAnalysis);

      // Compile results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core data
        headings: headingElements,
        hierarchy: hierarchyAnalysis,
        content: contentAnalysis,
        seo: seoAnalysis,
        accessibility: accessibilityAnalysis,
        validation,
        
        // Summary metrics
        summary: {
          totalHeadings: headingElements.all.length,
          headingDistribution: headingElements.distribution,
          hierarchyScore: hierarchyAnalysis.score,
          contentScore: contentAnalysis.score,
          seoScore: seoAnalysis.score,
          accessibilityScore: accessibilityAnalysis.score,
          overallScore: validation.overallScore,
          optimizationLevel: this._getOptimizationLevel(validation.overallScore)
        },

        // Performance data
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Heading structure detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Detect all heading elements in the document
   * @param {Document} document - DOM document
   * @returns {Object} All heading elements organized by level
   */
  _detectAllHeadings(document) {
    const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headingsByLevel = {};
    const allHeadings = [];
    const distribution = {};

    // Initialize structures
    headingTags.forEach(tag => {
      headingsByLevel[tag] = [];
      distribution[tag] = 0;
    });

    // Collect all headings
    headingTags.forEach(tag => {
      const elements = Array.from(document.querySelectorAll(tag));
      
      elements.forEach((element, index) => {
        const headingData = {
          tag,
          level: parseInt(tag.substring(1)),
          element,
          text: element.textContent.trim(),
          innerHTML: element.innerHTML,
          length: element.textContent.trim().length,
          position: allHeadings.length,
          indexInLevel: index,
          attributes: this._getElementAttributes(element),
          computedStyle: this._getComputedStyle(element),
          accessibility: this._getAccessibilityInfo(element)
        };

        headingsByLevel[tag].push(headingData);
        allHeadings.push(headingData);
        distribution[tag]++;
      });
    });

    // Sort all headings by document order
    allHeadings.sort((a, b) => {
      const aRect = a.element.getBoundingClientRect();
      const bRect = b.element.getBoundingClientRect();
      
      if (aRect.top !== bRect.top) {
        return aRect.top - bRect.top;
      }
      return aRect.left - bRect.left;
    });

    // Update positions after sorting
    allHeadings.forEach((heading, index) => {
      heading.documentOrder = index;
    });

    return {
      all: allHeadings,
      byLevel: headingsByLevel,
      distribution,
      counts: {
        total: allHeadings.length,
        h1: distribution.h1,
        h2: distribution.h2,
        h3: distribution.h3,
        h4: distribution.h4,
        h5: distribution.h5,
        h6: distribution.h6
      }
    };
  }

  /**
   * Analyze heading hierarchy structure
   * @param {Object} headingElements - All heading elements
   * @returns {Object} Hierarchy analysis results
   */
  _analyzeHierarchy(headingElements) {
    const { all, counts } = headingElements;
    
    if (all.length === 0) {
      return {
        score: 0,
        grade: 'F',
        issues: ['No headings found'],
        recommendations: ['Add proper heading structure'],
        structure: [],
        isValid: false,
        depth: 0,
        skipLevels: [],
        missingLevels: []
      };
    }

    const issues = [];
    const recommendations = [];
    let score = 100;

    // Check H1 presence and uniqueness
    if (counts.h1 === 0) {
      issues.push('No H1 heading found');
      recommendations.push('Add exactly one H1 heading to the page');
      score -= 30;
    } else if (counts.h1 > 1) {
      issues.push(`Multiple H1 headings found (${counts.h1})`);
      recommendations.push('Use only one H1 heading per page');
      score -= 20;
    }

    // Check hierarchy logic
    const hierarchyIssues = this._validateHierarchyLogic(all);
    issues.push(...hierarchyIssues.issues);
    recommendations.push(...hierarchyIssues.recommendations);
    score -= hierarchyIssues.penalty;

    // Analyze hierarchy structure
    const structure = this._buildHierarchyStructure(all);
    const depth = this._calculateHierarchyDepth(structure);
    const skipLevels = this._findSkippedLevels(all);
    const missingLevels = this._findMissingLevels(all);

    // Check for appropriate depth
    if (depth > 4) {
      issues.push('Heading hierarchy too deep');
      recommendations.push('Simplify heading structure (maximum 4 levels recommended)');
      score -= 10;
    }

    // Check for skipped levels
    if (skipLevels.length > 0) {
      issues.push(`Heading levels skipped: ${skipLevels.join(', ')}`);
      recommendations.push('Use consecutive heading levels without skipping');
      score -= skipLevels.length * 5;
    }

    // Check for logical content organization
    const organizationScore = this._analyzeContentOrganization(structure);
    score = (score + organizationScore) / 2;

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      structure,
      isValid: issues.length === 0,
      depth,
      skipLevels,
      missingLevels,
      organizationScore,
      analysis: {
        hasH1: counts.h1 > 0,
        h1Count: counts.h1,
        totalHeadings: all.length,
        averageLength: all.reduce((sum, h) => sum + h.length, 0) / all.length,
        longestHeading: Math.max(...all.map(h => h.length)),
        shortestHeading: Math.min(...all.map(h => h.length))
      }
    };
  }

  /**
   * Analyze heading content and keywords
   * @param {Object} headingElements - All heading elements
   * @param {Object} pageData - Additional page data
   * @returns {Object} Content analysis results
   */
  _analyzeHeadingContent(headingElements, pageData = {}) {
    const { all } = headingElements;
    
    if (all.length === 0) {
      return {
        score: 0,
        grade: 'F',
        issues: ['No headings to analyze'],
        recommendations: ['Add headings to improve content structure'],
        keywords: {},
        optimization: {}
      };
    }

    const issues = [];
    const recommendations = [];
    let score = 100;

    // Analyze individual headings
    const headingAnalysis = all.map(heading => this._analyzeIndividualHeading(heading, pageData));

    // Extract and analyze keywords
    const keywordAnalysis = this._analyzeHeadingKeywords(all, pageData);
    
    // Check content length optimization
    const lengthAnalysis = this._analyzeLengthOptimization(all);
    
    // Check content uniqueness
    const uniquenessAnalysis = this._analyzeContentUniqueness(all);

    // Calculate scores
    const avgHeadingScore = headingAnalysis.reduce((sum, h) => sum + h.score, 0) / headingAnalysis.length;
    score = (score + avgHeadingScore + keywordAnalysis.score + lengthAnalysis.score + uniquenessAnalysis.score) / 5;

    // Compile issues and recommendations
    issues.push(...lengthAnalysis.issues, ...uniquenessAnalysis.issues, ...keywordAnalysis.issues);
    recommendations.push(...lengthAnalysis.recommendations, ...uniquenessAnalysis.recommendations, ...keywordAnalysis.recommendations);

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      headings: headingAnalysis,
      keywords: keywordAnalysis,
      length: lengthAnalysis,
      uniqueness: uniquenessAnalysis,
      optimization: {
        keywordDensity: keywordAnalysis.density,
        averageLength: lengthAnalysis.average,
        uniquenessRatio: uniquenessAnalysis.ratio,
        optimizationOpportunities: this._identifyOptimizationOpportunities(headingAnalysis, keywordAnalysis)
      }
    };
  }

  /**
   * Analyze SEO optimization aspects
   * @param {Object} headingElements - All heading elements
   * @param {Object} hierarchyAnalysis - Hierarchy analysis results
   * @returns {Object} SEO analysis results
   */
  _analyzeSEOOptimization(headingElements, hierarchyAnalysis) {
    const { all, counts } = headingElements;
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    const optimizations = [];

    // H1 SEO optimization
    const h1Analysis = this._analyzeH1SEO(headingElements.byLevel.h1);
    score = (score + h1Analysis.score) / 2;
    issues.push(...h1Analysis.issues);
    recommendations.push(...h1Analysis.recommendations);

    // H2 distribution and optimization
    const h2Analysis = this._analyzeH2SEO(headingElements.byLevel.h2);
    score = (score + h2Analysis.score) / 2;
    issues.push(...h2Analysis.issues);
    recommendations.push(...h2Analysis.recommendations);

    // Keyword distribution analysis
    const keywordDistribution = this._analyzeKeywordDistribution(all);
    score = (score + keywordDistribution.score) / 2;
    issues.push(...keywordDistribution.issues);
    recommendations.push(...keywordDistribution.recommendations);

    // Content flow and readability
    const readabilityAnalysis = this._analyzeReadability(all);
    score = (score + readabilityAnalysis.score) / 2;

    // Identify SEO opportunities
    if (counts.h1 === 1 && counts.h2 >= 2) {
      optimizations.push('Good heading structure foundation');
    }
    if (all.some(h => h.length >= 40 && h.length <= 60)) {
      optimizations.push('Some headings have optimal length');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      optimizations,
      h1: h1Analysis,
      h2: h2Analysis,
      keywords: keywordDistribution,
      readability: readabilityAnalysis,
      opportunities: this._identifySEOOpportunities(all, hierarchyAnalysis)
    };
  }

  /**
   * Analyze accessibility aspects
   * @param {Object} headingElements - All heading elements
   * @param {Object} hierarchyAnalysis - Hierarchy analysis results
   * @returns {Object} Accessibility analysis results
   */
  _analyzeAccessibility(headingElements, hierarchyAnalysis) {
    const { all } = headingElements;
    
    let score = 100;
    const issues = [];
    const recommendations = [];

    // Check logical heading sequence
    if (!hierarchyAnalysis.isValid) {
      issues.push('Heading hierarchy violates accessibility guidelines');
      recommendations.push('Ensure logical heading sequence for screen readers');
      score -= 20;
    }

    // Check for empty headings
    const emptyHeadings = all.filter(h => h.length === 0);
    if (emptyHeadings.length > 0) {
      issues.push(`${emptyHeadings.length} empty heading(s) found`);
      recommendations.push('Remove or add content to empty headings');
      score -= emptyHeadings.length * 10;
    }

    // Check for very long headings
    const longHeadings = all.filter(h => h.length > 120);
    if (longHeadings.length > 0) {
      issues.push(`${longHeadings.length} heading(s) too long for screen readers`);
      recommendations.push('Shorten very long headings for better accessibility');
      score -= longHeadings.length * 5;
    }

    // Check for proper HTML structure
    const structureIssues = this._checkHTMLStructure(all);
    issues.push(...structureIssues.issues);
    recommendations.push(...structureIssues.recommendations);
    score -= structureIssues.penalty;

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      emptyHeadings: emptyHeadings.length,
      longHeadings: longHeadings.length,
      structuralCompliance: structureIssues.compliant,
      wcagCompliance: this._checkWCAGCompliance(all, hierarchyAnalysis)
    };
  }

  /**
   * Validate overall heading structure
   * @param {Object} headingElements - All heading elements
   * @param {Object} hierarchyAnalysis - Hierarchy analysis
   * @param {Object} contentAnalysis - Content analysis
   * @returns {Object} Validation results
   */
  _validateHeadingStructure(headingElements, hierarchyAnalysis, contentAnalysis) {
    const scores = [
      hierarchyAnalysis.score,
      contentAnalysis.score
    ];

    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const grade = this._calculateGrade(overallScore);

    // Critical issues
    const criticalIssues = [];
    if (headingElements.counts.h1 === 0) {
      criticalIssues.push('Missing H1 heading');
    }
    if (headingElements.counts.h1 > 1) {
      criticalIssues.push('Multiple H1 headings');
    }
    if (headingElements.all.length === 0) {
      criticalIssues.push('No headings found');
    }

    return {
      overallScore,
      grade,
      criticalIssues,
      passesValidation: criticalIssues.length === 0 && overallScore >= 70,
      improvementAreas: this._identifyImprovementAreas(hierarchyAnalysis, contentAnalysis),
      recommendations: this._generateValidationRecommendations(headingElements, hierarchyAnalysis, contentAnalysis)
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _getElementAttributes(element) {
    const attributes = {};
    for (let attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  _getComputedStyle(element) {
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const computed = window.getComputedStyle(element);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color,
        display: computed.display
      };
    }
    return {};
  }

  _getAccessibilityInfo(element) {
    return {
      hasId: !!element.id,
      hasClass: !!element.className,
      isVisible: element.offsetWidth > 0 && element.offsetHeight > 0,
      tabIndex: element.tabIndex,
      ariaLevel: element.getAttribute('aria-level'),
      role: element.getAttribute('role')
    };
  }

  _validateHierarchyLogic(headings) {
    const issues = [];
    const recommendations = [];
    let penalty = 0;

    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const current = headings[i];
      const levelDiff = current.level - prev.level;

      if (levelDiff > 1) {
        issues.push(`Heading level skipped from H${prev.level} to H${current.level}`);
        recommendations.push('Use consecutive heading levels');
        penalty += 5;
      }
    }

    return { issues, recommendations, penalty };
  }

  _buildHierarchyStructure(headings) {
    // Build a tree structure representing the heading hierarchy
    const structure = [];
    const stack = [];

    headings.forEach(heading => {
      const node = {
        ...heading,
        children: []
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        structure.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return structure;
  }

  _calculateHierarchyDepth(structure) {
    if (structure.length === 0) return 0;
    
    const getDepth = (node) => {
      if (node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    };

    return Math.max(...structure.map(getDepth));
  }

  _findSkippedLevels(headings) {
    const skipped = [];
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const current = headings[i];
      const diff = current.level - prev.level;
      
      if (diff > 1) {
        for (let level = prev.level + 1; level < current.level; level++) {
          if (!skipped.includes(level)) {
            skipped.push(level);
          }
        }
      }
    }
    return skipped;
  }

  _findMissingLevels(headings) {
    const presentLevels = new Set(headings.map(h => h.level));
    const missing = [];
    
    if (presentLevels.size > 0) {
      const maxLevel = Math.max(...presentLevels);
      for (let level = 1; level <= maxLevel; level++) {
        if (!presentLevels.has(level)) {
          missing.push(level);
        }
      }
    }
    
    return missing;
  }

  _analyzeContentOrganization(structure) {
    // Analyze if content is logically organized
    let score = 100;
    
    // Check if H1 comes first
    if (structure.length > 0 && structure[0].level !== 1) {
      score -= 20;
    }
    
    // Check for balanced distribution
    const flatHeadings = this._flattenStructure(structure);
    const levelCounts = {};
    flatHeadings.forEach(h => {
      levelCounts[h.level] = (levelCounts[h.level] || 0) + 1;
    });
    
    // Penalize if too many H2s without H3s
    if (levelCounts[2] > 5 && (levelCounts[3] || 0) === 0) {
      score -= 10;
    }
    
    return score;
  }

  _flattenStructure(structure) {
    const flat = [];
    const traverse = (nodes) => {
      nodes.forEach(node => {
        flat.push(node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(structure);
    return flat;
  }

  _analyzeIndividualHeading(heading, pageData) {
    let score = 100;
    const issues = [];
    
    // Length check
    if (heading.length < this.config.minHeadingLength) {
      score -= 20;
      issues.push('Heading too short');
    } else if (heading.length > this.config.maxHeadingLength) {
      score -= 10;
      issues.push('Heading too long');
    }
    
    // Empty check
    if (heading.length === 0) {
      score = 0;
      issues.push('Empty heading');
    }
    
    return {
      score,
      issues,
      text: heading.text,
      level: heading.level,
      length: heading.length
    };
  }

  _analyzeHeadingKeywords(headings, pageData) {
    // Placeholder for keyword analysis
    return {
      score: 75,
      issues: [],
      recommendations: [],
      density: 0.15,
      distribution: {}
    };
  }

  _analyzeLengthOptimization(headings) {
    const lengths = headings.map(h => h.length);
    const average = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (average < 20) {
      score -= 20;
      issues.push('Headings are too short on average');
      recommendations.push('Make headings more descriptive');
    } else if (average > 80) {
      score -= 10;
      issues.push('Headings are too long on average');
      recommendations.push('Make headings more concise');
    }
    
    return { score, issues, recommendations, average };
  }

  _analyzeContentUniqueness(headings) {
    const texts = headings.map(h => h.text.toLowerCase());
    const unique = new Set(texts);
    const ratio = unique.size / texts.length;
    
    let score = ratio * 100;
    const issues = [];
    const recommendations = [];
    
    if (ratio < 0.9) {
      issues.push('Some headings have duplicate content');
      recommendations.push('Make each heading unique');
    }
    
    return { score, issues, recommendations, ratio };
  }

  _identifyOptimizationOpportunities(headingAnalysis, keywordAnalysis) {
    const opportunities = [];
    
    headingAnalysis.forEach(heading => {
      if (heading.score < 80) {
        opportunities.push(`Optimize ${heading.level} heading: "${heading.text.substring(0, 50)}..."`);
      }
    });
    
    return opportunities;
  }

  _analyzeH1SEO(h1Headings) {
    if (h1Headings.length === 0) {
      return {
        score: 0,
        issues: ['No H1 heading found'],
        recommendations: ['Add exactly one H1 heading']
      };
    }
    
    if (h1Headings.length > 1) {
      return {
        score: 50,
        issues: [`Multiple H1 headings found (${h1Headings.length})`],
        recommendations: ['Use only one H1 heading per page']
      };
    }
    
    const h1 = h1Headings[0];
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (h1.length < 20) {
      score -= 30;
      issues.push('H1 is too short');
      recommendations.push('Make H1 more descriptive (20-60 characters)');
    } else if (h1.length > 60) {
      score -= 15;
      issues.push('H1 is too long');
      recommendations.push('Shorten H1 (20-60 characters optimal)');
    }
    
    return { score, issues, recommendations };
  }

  _analyzeH2SEO(h2Headings) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (h2Headings.length === 0) {
      score -= 20;
      issues.push('No H2 headings found');
      recommendations.push('Add H2 headings to structure content');
    } else if (h2Headings.length > 10) {
      score -= 10;
      issues.push('Too many H2 headings');
      recommendations.push('Consider using H3 headings to break up content');
    }
    
    return { score, issues, recommendations };
  }

  _analyzeKeywordDistribution(headings) {
    // Placeholder for keyword distribution analysis
    return {
      score: 75,
      issues: [],
      recommendations: []
    };
  }

  _analyzeReadability(headings) {
    // Placeholder for readability analysis
    return {
      score: 80
    };
  }

  _identifySEOOpportunities(headings, hierarchyAnalysis) {
    const opportunities = [];
    
    if (hierarchyAnalysis.score < 90) {
      opportunities.push('Improve heading hierarchy structure');
    }
    
    const longHeadings = headings.filter(h => h.length > 70);
    if (longHeadings.length > 0) {
      opportunities.push('Shorten overly long headings');
    }
    
    return opportunities;
  }

  _checkHTMLStructure(headings) {
    const issues = [];
    const recommendations = [];
    let penalty = 0;
    
    // Check for proper HTML tag usage
    headings.forEach(heading => {
      if (heading.innerHTML !== heading.text) {
        // Check for potentially problematic HTML
        if (heading.innerHTML.includes('<')) {
          issues.push(`H${heading.level} contains HTML content`);
          recommendations.push('Keep heading content simple and text-based');
          penalty += 2;
        }
      }
    });
    
    return {
      issues,
      recommendations,
      penalty,
      compliant: issues.length === 0
    };
  }

  _checkWCAGCompliance(headings, hierarchyAnalysis) {
    const compliance = {
      level: 'AA',
      passes: true,
      issues: []
    };
    
    if (!hierarchyAnalysis.isValid) {
      compliance.passes = false;
      compliance.issues.push('Heading hierarchy not logical');
    }
    
    const emptyHeadings = headings.filter(h => h.length === 0);
    if (emptyHeadings.length > 0) {
      compliance.passes = false;
      compliance.issues.push('Empty headings found');
    }
    
    return compliance;
  }

  _identifyImprovementAreas(hierarchyAnalysis, contentAnalysis) {
    const areas = [];
    
    if (hierarchyAnalysis.score < 80) {
      areas.push('hierarchy_structure');
    }
    
    if (contentAnalysis.score < 80) {
      areas.push('content_optimization');
    }
    
    return areas;
  }

  _generateValidationRecommendations(headingElements, hierarchyAnalysis, contentAnalysis) {
    const recommendations = [];
    
    if (headingElements.counts.h1 === 0) {
      recommendations.push('Add exactly one H1 heading to establish page topic');
    }
    
    if (headingElements.counts.h2 < 2 && headingElements.all.length > 3) {
      recommendations.push('Use more H2 headings to structure content');
    }
    
    if (hierarchyAnalysis.skipLevels.length > 0) {
      recommendations.push('Use consecutive heading levels without skipping');
    }
    
    return recommendations;
  }

  _calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  _getOptimizationLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  _generateCacheKey(document) {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headingText = headings.map(h => h.textContent.trim()).join('');
    return btoa(headingText).slice(0, 20);
  }
}

export default HeadingStructureDetector;
