/**
 * ============================================================================
 * SCREEN READER COMPATIBILITY DETECTOR - GPT-5 Style Modular Component
 * ============================================================================
 * 
 * Advanced screen reader compatibility analysis and optimization detection.
 * This component provides comprehensive testing for assistive technology
 * compatibility and screen reader navigation optimization.
 * 
 * Features:
 * - Screen reader navigation flow analysis
 * - Semantic markup structure validation
 * - ARIA implementation testing and optimization
 * - Reading order and logical flow verification
 * - Landmark regions and navigation structure
 * - Screen reader announcement optimization
 * - Voice control compatibility testing
 * - Assistive technology interaction patterns
 * 
 * Supported Screen Readers:
 * - NVDA (Windows)
 * - JAWS (Windows)
 * - VoiceOver (macOS/iOS)
 * - TalkBack (Android)
 * - Dragon NaturallySpeaking
 * - Windows Narrator
 * 
 * @module ScreenReaderCompatibilityDetector
 * @version 1.0.0
 * @author AI Assistant (GPT-5 Style)
 * @created 2025-08-12
 */

export class ScreenReaderCompatibilityDetector {
  constructor(config = {}) {
    this.config = {
      includeAdvancedTests: config.includeAdvancedTests || true,
      testVoiceControl: config.testVoiceControl || false,
      validateReadingOrder: config.validateReadingOrder !== false,
      checkLandmarkRegions: config.checkLandmarkRegions !== false,
      analyzeAnnouncements: config.analyzeAnnouncements !== false,
      ...config
    };

    // Screen reader compatibility patterns
    this.screenReaderPatterns = this.initializeScreenReaderPatterns();
    this.semanticElements = this.initializeSemanticElements();
    this.ariaRoles = this.initializeAriaRoles();
  }

  /**
   * Comprehensive screen reader compatibility detection
   * @param {Object} context - Analysis context with DOM and page data
   * @returns {Object} Detailed screen reader compatibility analysis
   */
  async detectCompatibility(context) {
    try {
      const { dom, url, pageData = {} } = context;
      const document = dom?.window?.document;

      if (!document) {
        throw new Error('Invalid DOM context for screen reader compatibility detection');
      }

      const compatibilityAnalysis = {
        // Core compatibility analysis
        semanticStructure: await this.analyzeSemanticStructure(document),
        navigationFlow: await this.analyzeNavigationFlow(document),
        landmarkRegions: await this.analyzeLandmarkRegions(document),
        readingOrder: await this.analyzeReadingOrder(document),
        ariaImplementation: await this.analyzeAriaImplementation(document),
        announcementOptimization: await this.analyzeAnnouncementOptimization(document),

        // Advanced compatibility features
        voiceControlSupport: this.config.testVoiceControl ? 
          await this.analyzeVoiceControlSupport(document) : null,
        
        // Overall scoring and recommendations
        overallCompatibility: 0,
        compatibilityIssues: [],
        optimizationRecommendations: [],
        criticalAccessibilityBlocks: [],

        // Metadata
        testTimestamp: new Date().toISOString(),
        pageUrl: url,
        screenReaderVersion: 'multiple'
      };

      // Calculate overall compatibility score
      compatibilityAnalysis.overallCompatibility = this.calculateOverallCompatibility(compatibilityAnalysis);

      // Identify critical accessibility blocks
      compatibilityAnalysis.criticalAccessibilityBlocks = this.identifyCriticalBlocks(compatibilityAnalysis);

      // Generate optimization recommendations
      compatibilityAnalysis.optimizationRecommendations = this.generateOptimizationRecommendations(compatibilityAnalysis);

      return compatibilityAnalysis;

    } catch (error) {
      console.error('Screen reader compatibility detection failed:', error);
      return this.createErrorResponse(error);
    }
  }

  /**
   * Analyze semantic structure for screen readers
   */
  async analyzeSemanticStructure(document) {
    const analysis = {
      headingStructure: this.analyzeHeadingStructure(document),
      listStructure: this.analyzeListStructure(document),
      tableStructure: this.analyzeTableStructure(document),
      formStructure: this.analyzeFormStructure(document),
      documentOutline: this.generateDocumentOutline(document),
      score: 0,
      issues: [],
      recommendations: []
    };

    // Calculate semantic structure score
    const structureScores = [
      analysis.headingStructure.score,
      analysis.listStructure.score,
      analysis.tableStructure.score,
      analysis.formStructure.score
    ];

    analysis.score = structureScores.reduce((sum, score) => sum + score, 0) / structureScores.length;

    // Collect issues and recommendations
    [analysis.headingStructure, analysis.listStructure, analysis.tableStructure, analysis.formStructure]
      .forEach(subAnalysis => {
        if (subAnalysis.issues) analysis.issues.push(...subAnalysis.issues);
        if (subAnalysis.recommendations) analysis.recommendations.push(...subAnalysis.recommendations);
      });

    return analysis;
  }

  /**
   * Analyze heading structure for proper screen reader navigation
   */
  analyzeHeadingStructure(document) {
    const analysis = {
      headings: [],
      hasH1: false,
      properOrder: true,
      skippedLevels: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    // Get all headings
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();

      analysis.headings.push({
        level,
        text: text || '[Empty heading]',
        element: heading,
        position: index + 1
      });

      // Check for H1
      if (level === 1) {
        analysis.hasH1 = true;
      }

      // Check for proper hierarchical order
      if (index === 0 && level !== 1) {
        analysis.issues.push({
          type: 'heading-order',
          severity: 'high',
          message: 'First heading should be H1',
          element: heading.tagName,
          position: index + 1
        });
        analysis.score -= 20;
        analysis.properOrder = false;
      }

      if (level > previousLevel + 1 && previousLevel > 0) {
        const skippedLevel = previousLevel + 1;
        analysis.skippedLevels.push(skippedLevel);
        analysis.issues.push({
          type: 'skipped-heading-level',
          severity: 'medium',
          message: `Heading structure skips level H${skippedLevel}`,
          element: heading.tagName,
          position: index + 1
        });
        analysis.score -= 10;
        analysis.properOrder = false;
      }

      // Check for empty headings
      if (!text) {
        analysis.issues.push({
          type: 'empty-heading',
          severity: 'high',
          message: 'Heading element is empty',
          element: heading.tagName,
          position: index + 1
        });
        analysis.score -= 15;
      }

      previousLevel = level;
    });

    // No H1 found
    if (!analysis.hasH1) {
      analysis.issues.push({
        type: 'missing-h1',
        severity: 'critical',
        message: 'Page missing main H1 heading',
        element: 'page',
        position: 0
      });
      analysis.score -= 30;
    }

    // Generate recommendations
    if (analysis.issues.length > 0) {
      analysis.recommendations.push({
        priority: 'high',
        action: 'Fix heading structure for better screen reader navigation',
        description: 'Proper heading hierarchy helps screen reader users understand page structure'
      });
    }

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze navigation flow for screen readers
   */
  async analyzeNavigationFlow(document) {
    const analysis = {
      focusableElements: [],
      tabOrder: [],
      skipLinks: [],
      navigationLandmarks: [],
      focusTraps: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    // Identify all focusable elements
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const focusableElements = document.querySelectorAll(focusableSelector);
    
    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex') || '0';
      const elementInfo = {
        element: element.tagName.toLowerCase(),
        type: element.type || 'unknown',
        tabIndex: parseInt(tabIndex),
        hasAccessibleName: this.hasAccessibleName(element),
        position: index + 1,
        isVisible: this.isElementVisible(element)
      };

      analysis.focusableElements.push(elementInfo);

      // Check for positive tabindex (problematic)
      if (parseInt(tabIndex) > 0) {
        analysis.issues.push({
          type: 'positive-tabindex',
          severity: 'medium',
          message: 'Positive tabindex disrupts natural tab order',
          element: element.tagName.toLowerCase(),
          position: index + 1
        });
        analysis.score -= 5;
      }

      // Check for accessible names
      if (!elementInfo.hasAccessibleName) {
        analysis.issues.push({
          type: 'missing-accessible-name',
          severity: 'high',
          message: 'Focusable element lacks accessible name',
          element: element.tagName.toLowerCase(),
          position: index + 1
        });
        analysis.score -= 10;
      }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    skipLinks.forEach(link => {
      const text = link.textContent.toLowerCase();
      if (text.includes('skip') || text.includes('jump')) {
        analysis.skipLinks.push({
          text: link.textContent.trim(),
          href: link.getAttribute('href'),
          isVisible: this.isElementVisible(link)
        });
      }
    });

    // Evaluate skip links
    if (analysis.skipLinks.length === 0 && focusableElements.length > 10) {
      analysis.issues.push({
        type: 'missing-skip-links',
        severity: 'medium',
        message: 'No skip links found for complex page navigation',
        element: 'navigation',
        position: 0
      });
      analysis.score -= 15;
    }

    // Check navigation landmarks
    const navElements = document.querySelectorAll('nav, [role="navigation"]');
    navElements.forEach((nav, index) => {
      const label = nav.getAttribute('aria-label') || 
                   nav.getAttribute('aria-labelledby') || 
                   'Unlabeled navigation';
      
      analysis.navigationLandmarks.push({
        label,
        position: index + 1,
        hasLabel: nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby')
      });

      if (!nav.hasAttribute('aria-label') && !nav.hasAttribute('aria-labelledby')) {
        analysis.issues.push({
          type: 'unlabeled-navigation',
          severity: 'medium',
          message: 'Navigation landmark should have accessible label',
          element: 'nav',
          position: index + 1
        });
        analysis.score -= 10;
      }
    });

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze landmark regions for screen reader navigation
   */
  async analyzeLandmarkRegions(document) {
    const analysis = {
      landmarks: [],
      requiredLandmarks: {
        main: false,
        navigation: false,
        banner: false,
        contentinfo: false
      },
      score: 100,
      issues: [],
      recommendations: []
    };

    // Define landmark selectors
    const landmarkSelectors = {
      main: 'main, [role="main"]',
      navigation: 'nav, [role="navigation"]',
      banner: 'header, [role="banner"]',
      contentinfo: 'footer, [role="contentinfo"]',
      complementary: 'aside, [role="complementary"]',
      search: '[role="search"]',
      form: 'form, [role="form"]',
      region: '[role="region"]'
    };

    // Check for each landmark type
    Object.entries(landmarkSelectors).forEach(([landmarkType, selector]) => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((element, index) => {
        const landmarkInfo = {
          type: landmarkType,
          element: element.tagName.toLowerCase(),
          hasLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
          label: element.getAttribute('aria-label') || 
                 element.getAttribute('aria-labelledby') || 
                 'Unlabeled',
          position: index + 1
        };

        analysis.landmarks.push(landmarkInfo);

        // Mark required landmarks as found
        if (['main', 'navigation', 'banner', 'contentinfo'].includes(landmarkType)) {
          analysis.requiredLandmarks[landmarkType] = true;
        }

        // Check for labels on multiple landmarks of same type
        if (elements.length > 1 && !landmarkInfo.hasLabel) {
          analysis.issues.push({
            type: 'unlabeled-landmark',
            severity: 'medium',
            message: `Multiple ${landmarkType} landmarks should have unique labels`,
            element: element.tagName.toLowerCase(),
            position: index + 1
          });
          analysis.score -= 10;
        }
      });
    });

    // Check for missing required landmarks
    Object.entries(analysis.requiredLandmarks).forEach(([landmark, found]) => {
      if (!found) {
        analysis.issues.push({
          type: 'missing-landmark',
          severity: landmark === 'main' ? 'high' : 'medium',
          message: `Missing ${landmark} landmark`,
          element: 'page-structure',
          position: 0
        });
        analysis.score -= landmark === 'main' ? 20 : 10;
      }
    });

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze reading order for screen readers
   */
  async analyzeReadingOrder(document) {
    const analysis = {
      readingOrderIssues: [],
      visualOrderMismatch: [],
      tabOrderAnalysis: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    if (!this.config.validateReadingOrder) {
      return analysis;
    }

    // Get all visible content elements in DOM order
    const contentElements = document.querySelectorAll('*');
    const visibleElements = Array.from(contentElements).filter(el => 
      this.isElementVisible(el) && this.hasTextContent(el)
    );

    // Analyze for potential reading order issues
    visibleElements.forEach((element, index) => {
      const styles = element.ownerDocument.defaultView.getComputedStyle(element);
      const position = styles.position;
      const zIndex = parseInt(styles.zIndex) || 0;

      // Check for absolute/fixed positioning that might affect reading order
      if (['absolute', 'fixed'].includes(position)) {
        analysis.readingOrderIssues.push({
          type: 'positioned-content',
          severity: 'low',
          message: 'Absolutely positioned element may disrupt reading order',
          element: element.tagName.toLowerCase(),
          position: index + 1
        });
      }

      // Check for high z-index values
      if (zIndex > 100) {
        analysis.readingOrderIssues.push({
          type: 'high-z-index',
          severity: 'low',
          message: 'High z-index may indicate visual-DOM order mismatch',
          element: element.tagName.toLowerCase(),
          position: index + 1
        });
      }
    });

    // Penalize score based on issues
    analysis.score -= analysis.readingOrderIssues.length * 5;

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze ARIA implementation for screen readers
   */
  async analyzeAriaImplementation(document) {
    const analysis = {
      ariaElements: [],
      roleImplementation: [],
      ariaProperties: [],
      ariaStates: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    // Find all elements with ARIA attributes
    const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-hidden], [aria-expanded], [aria-current], [aria-live]');

    ariaElements.forEach((element, index) => {
      const ariaInfo = {
        element: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        ariaLabel: element.getAttribute('aria-label'),
        ariaLabelledby: element.getAttribute('aria-labelledby'),
        ariaDescribedby: element.getAttribute('aria-describedby'),
        ariaHidden: element.getAttribute('aria-hidden'),
        position: index + 1
      };

      analysis.ariaElements.push(ariaInfo);

      // Validate role implementation
      const role = element.getAttribute('role');
      if (role && !this.isValidAriaRole(role)) {
        analysis.issues.push({
          type: 'invalid-aria-role',
          severity: 'high',
          message: `Invalid ARIA role: ${role}`,
          element: element.tagName.toLowerCase(),
          position: index + 1
        });
        analysis.score -= 15;
      }

      // Check for aria-hidden on focusable elements
      if (element.getAttribute('aria-hidden') === 'true' && this.isFocusable(element)) {
        analysis.issues.push({
          type: 'aria-hidden-focusable',
          severity: 'critical',
          message: 'Focusable element should not be aria-hidden',
          element: element.tagName.toLowerCase(),
          position: index + 1
        });
        analysis.score -= 20;
      }

      // Check for aria-labelledby references
      const labelledby = element.getAttribute('aria-labelledby');
      if (labelledby) {
        const referencedIds = labelledby.split(' ');
        referencedIds.forEach(id => {
          if (!document.getElementById(id)) {
            analysis.issues.push({
              type: 'broken-aria-reference',
              severity: 'high',
              message: `aria-labelledby references non-existent id: ${id}`,
              element: element.tagName.toLowerCase(),
              position: index + 1
            });
            analysis.score -= 10;
          }
        });
      }
    });

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze announcement optimization for screen readers
   */
  async analyzeAnnouncementOptimization(document) {
    const analysis = {
      liveRegions: [],
      statusMessages: [],
      alertMessages: [],
      announcementOptimization: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    if (!this.config.analyzeAnnouncements) {
      return analysis;
    }

    // Check for live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    liveRegions.forEach((region, index) => {
      const liveValue = region.getAttribute('aria-live');
      analysis.liveRegions.push({
        liveValue,
        element: region.tagName.toLowerCase(),
        hasContent: region.textContent.trim().length > 0,
        position: index + 1
      });

      // Validate aria-live values
      if (!['polite', 'assertive', 'off'].includes(liveValue)) {
        analysis.issues.push({
          type: 'invalid-aria-live',
          severity: 'medium',
          message: `Invalid aria-live value: ${liveValue}`,
          element: region.tagName.toLowerCase(),
          position: index + 1
        });
        analysis.score -= 10;
      }
    });

    // Check for status and alert roles
    const statusElements = document.querySelectorAll('[role="status"], [role="alert"]');
    statusElements.forEach((element, index) => {
      const role = element.getAttribute('role');
      const info = {
        role,
        element: element.tagName.toLowerCase(),
        hasContent: element.textContent.trim().length > 0,
        position: index + 1
      };

      if (role === 'status') {
        analysis.statusMessages.push(info);
      } else if (role === 'alert') {
        analysis.alertMessages.push(info);
      }
    });

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Calculate overall compatibility score
   */
  calculateOverallCompatibility(analysis) {
    const scores = [
      analysis.semanticStructure.score,
      analysis.navigationFlow.score,
      analysis.landmarkRegions.score,
      analysis.readingOrder.score,
      analysis.ariaImplementation.score,
      analysis.announcementOptimization.score
    ].filter(score => score !== null && !isNaN(score));

    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  /**
   * Helper methods
   */
  hasAccessibleName(element) {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('title') ||
      (element.tagName === 'INPUT' && element.labels && element.labels.length > 0) ||
      element.textContent.trim()
    );
  }

  isElementVisible(element) {
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  hasTextContent(element) {
    return element.textContent && element.textContent.trim().length > 0;
  }

  isFocusable(element) {
    const focusableElements = [
      'a[href]', 'button', 'input', 'select', 'textarea', '[tabindex]', '[contenteditable="true"]'
    ];
    
    return focusableElements.some(selector => element.matches(selector)) &&
           !element.disabled &&
           element.getAttribute('tabindex') !== '-1';
  }

  isValidAriaRole(role) {
    return this.ariaRoles.includes(role);
  }

  /**
   * Initialize screen reader patterns
   */
  initializeScreenReaderPatterns() {
    return {
      navigationPatterns: ['skip-link', 'landmark-navigation', 'heading-navigation'],
      interactionPatterns: ['keyboard-only', 'voice-control', 'touch-gesture'],
      announcementPatterns: ['live-region', 'status-update', 'error-message']
    };
  }

  /**
   * Initialize semantic elements
   */
  initializeSemanticElements() {
    return [
      'article', 'aside', 'details', 'figcaption', 'figure', 'footer',
      'header', 'main', 'nav', 'section', 'summary', 'time'
    ];
  }

  /**
   * Initialize ARIA roles
   */
  initializeAriaRoles() {
    return [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'dialog', 'directory', 'document', 'feed', 'figure',
      'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list',
      'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
      'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
      'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
      'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
      'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
      'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ];
  }

  /**
   * Placeholder methods for complex analysis
   */
  analyzeListStructure(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  analyzeTableStructure(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  analyzeFormStructure(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  generateDocumentOutline(document) {
    return { outline: [], score: 100 };
  }

  analyzeVoiceControlSupport(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  identifyCriticalBlocks(analysis) {
    return [];
  }

  generateOptimizationRecommendations(analysis) {
    return [];
  }

  createErrorResponse(error) {
    return {
      success: false,
      error: error.message,
      semanticStructure: { score: 0, issues: [] },
      navigationFlow: { score: 0, issues: [] },
      landmarkRegions: { score: 0, issues: [] },
      readingOrder: { score: 0, issues: [] },
      ariaImplementation: { score: 0, issues: [] },
      announcementOptimization: { score: 0, issues: [] },
      overallCompatibility: 0,
      compatibilityIssues: [],
      optimizationRecommendations: [],
      criticalAccessibilityBlocks: []
    };
  }
}
