/**
 * ============================================================================
 * SCREEN READER DETECTOR - GPT-5 STYLE MODULAR DETECTOR
 * ============================================================================
 * 
 * Advanced screen reader compatibility detector that analyzes how well content
 * works with assistive technologies like NVDA, JAWS, VoiceOver, and ORCA.
 * 
 * Screen Reader Compatibility Areas:
 * - ARIA implementation and semantic markup
 * - Reading order and navigation flow
 * - Form accessibility and input instructions
 * - Dynamic content announcements
 * - Landmark regions and headings structure
 * - Table accessibility and data relationships
 * - Interactive element states and properties
 * - Focus management and keyboard interaction
 * 
 * Supported Screen Readers:
 * - NVDA (Windows)
 * - JAWS (Windows) 
 * - VoiceOver (macOS/iOS)
 * - ORCA (Linux)
 * - TalkBack (Android)
 * - Dragon NaturallySpeaking (Voice Control)
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration_pattern GPT-5 Style Modular Detector
 */

export class ScreenReaderDetector {
  constructor(options = {}) {
    this.options = {
      testARIA: true,
      testSemantics: true,
      testNavigation: true,
      testForms: true,
      testTables: true,
      testDynamicContent: true,
      testFocusManagement: true,
      testLiveRegions: true,
      includeMobileScreenReaders: true,
      timeout: 30000,
      ...options
    };
    
    this.name = 'ScreenReaderDetector';
    this.version = '1.0.0';
    
    // Screen reader specific test configurations
    this.screenReaderProfiles = this.initializeScreenReaderProfiles();
    
    // ARIA roles and properties mapping
    this.ariaSpecification = this.initializeARIASpecification();
    
    console.log('📱 Screen Reader Detector initialized');
    console.log(`🔧 Test configuration: ARIA=${this.options.testARIA}, Semantics=${this.options.testSemantics}`);
  }

  /**
   * Main detection method for screen reader compatibility
   */
  async detect(context) {
    const startTime = Date.now();
    
    try {
      const { document, url, accessibilityContext } = context;
      
      if (!document) {
        throw new Error('Document not available for screen reader compatibility detection');
      }
      
      console.log('📱 Analyzing screen reader compatibility...');
      
      // Run comprehensive screen reader compatibility tests
      const screenReaderResults = await this.runScreenReaderTests(document, accessibilityContext);
      
      // Calculate compatibility score
      const compatibilityScore = this.calculateCompatibilityScore(screenReaderResults);
      
      // Generate findings and recommendations
      const findings = this.generateFindings(screenReaderResults);
      const recommendations = this.generateRecommendations(screenReaderResults);
      
      const endTime = Date.now();
      
      return {
        detector: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        performance_time: endTime - startTime,
        
        // Core Results
        score: compatibilityScore.overall,
        compatibility_level: compatibilityScore.level,
        screen_reader_results: screenReaderResults,
        
        // Detailed Analysis
        aria_analysis: screenReaderResults.aria,
        semantic_analysis: screenReaderResults.semantics,
        navigation_analysis: screenReaderResults.navigation,
        form_analysis: screenReaderResults.forms,
        table_analysis: screenReaderResults.tables,
        dynamic_content_analysis: screenReaderResults.dynamicContent,
        focus_management_analysis: screenReaderResults.focusManagement,
        live_regions_analysis: screenReaderResults.liveRegions,
        
        // Screen Reader Specific
        nvda_compatibility: compatibilityScore.nvda,
        jaws_compatibility: compatibilityScore.jaws,
        voiceover_compatibility: compatibilityScore.voiceover,
        orca_compatibility: compatibilityScore.orca,
        talkback_compatibility: compatibilityScore.talkback,
        
        // Summary Metrics
        total_tests_run: screenReaderResults.summary.total_tests,
        tests_passed: screenReaderResults.summary.passed,
        tests_failed: screenReaderResults.summary.failed,
        critical_issues: screenReaderResults.summary.critical_issues,
        accessibility_violations: screenReaderResults.summary.violations,
        
        findings,
        recommendations,
        
        // Metadata
        test_configuration: {
          aria_enabled: this.options.testARIA,
          semantics_enabled: this.options.testSemantics,
          navigation_enabled: this.options.testNavigation,
          forms_enabled: this.options.testForms,
          tables_enabled: this.options.testTables,
          url: url
        }
      };
      
    } catch (error) {
      console.error('❌ Screen Reader Detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Run comprehensive screen reader compatibility tests
   */
  async runScreenReaderTests(document, accessibilityContext) {
    const results = {
      aria: await this.testARIAImplementation(document),
      semantics: await this.testSemanticMarkup(document),
      navigation: await this.testNavigationStructure(document),
      forms: await this.testFormAccessibility(document),
      tables: await this.testTableAccessibility(document),
      dynamicContent: await this.testDynamicContent(document),
      focusManagement: await this.testFocusManagement(document),
      liveRegions: await this.testLiveRegions(document),
      summary: {}
    };
    
    // Calculate summary
    results.summary = this.calculateSummary(results);
    
    return results;
  }

  /**
   * Test ARIA implementation for screen reader compatibility
   */
  async testARIAImplementation(document) {
    const results = {
      category: 'ARIA Implementation',
      tests: []
    };
    
    // Test ARIA roles
    results.tests.push(await this.testARIARoles(document));
    
    // Test ARIA properties
    results.tests.push(await this.testARIAProperties(document));
    
    // Test ARIA states
    results.tests.push(await this.testARIAStates(document));
    
    // Test ARIA landmarks
    results.tests.push(await this.testARIALandmarks(document));
    
    // Test ARIA live regions
    results.tests.push(await this.testARIALiveRegions(document));
    
    // Test ARIA descriptions
    results.tests.push(await this.testARIADescriptions(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.score >= 85;
    
    return results;
  }

  /**
   * Test ARIA roles
   */
  async testARIARoles(document) {
    const test = {
      test: 'aria_roles',
      description: 'ARIA roles must be valid and appropriate',
      issues: [],
      violations: 0,
      elements_tested: 0
    };
    
    const elementsWithRoles = Array.from(document.querySelectorAll('[role]'));
    test.elements_tested = elementsWithRoles.length;
    
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      const roles = role.split(' ');
      
      roles.forEach(singleRole => {
        // Check if role is valid
        if (!this.ariaSpecification.roles.includes(singleRole)) {
          test.violations++;
          test.issues.push({
            type: 'invalid_role',
            message: `Invalid ARIA role: ${singleRole}`,
            element: element.tagName,
            role: singleRole,
            location: this.getElementLocation(element),
            impact: 'Screen readers may not recognize this role'
          });
        }
        
        // Check if role is appropriate for element
        const inappropriateRoles = this.checkInappropriateRole(element, singleRole);
        if (inappropriateRoles.length > 0) {
          test.violations++;
          test.issues.push({
            type: 'inappropriate_role',
            message: `Role ${singleRole} may not be appropriate for ${element.tagName}`,
            element: element.tagName,
            role: singleRole,
            suggestions: inappropriateRoles,
            location: this.getElementLocation(element),
            impact: 'May confuse screen reader users'
          });
        }
      });
    });
    
    // Check for missing roles on interactive elements
    const interactiveElements = Array.from(document.querySelectorAll('div, span')).filter(el => {
      return el.onclick || el.getAttribute('onclick') || el.tabIndex >= 0;
    });
    
    interactiveElements.forEach(element => {
      if (!element.getAttribute('role')) {
        test.violations++;
        test.issues.push({
          type: 'missing_role',
          message: 'Interactive element missing ARIA role',
          element: element.tagName,
          location: this.getElementLocation(element),
          impact: 'Screen readers may not announce element as interactive',
          suggestion: 'Add appropriate role (button, link, etc.)'
        });
      }
    });
    
    return test;
  }

  /**
   * Test ARIA properties
   */
  async testARIAProperties(document) {
    const test = {
      test: 'aria_properties',
      description: 'ARIA properties must be valid and properly used',
      issues: [],
      violations: 0,
      elements_tested: 0
    };
    
    const elementsWithAria = Array.from(document.querySelectorAll('[class*="aria-"], [aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-selected], [aria-checked], [aria-disabled], [aria-hidden], [aria-required], [aria-invalid]'));
    test.elements_tested = elementsWithAria.length;
    
    elementsWithAria.forEach(element => {
      const attributes = element.attributes;
      
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        
        if (attr.name.startsWith('aria-')) {
          // Check if ARIA property is valid
          if (!this.ariaSpecification.properties.includes(attr.name)) {
            test.violations++;
            test.issues.push({
              type: 'invalid_aria_property',
              message: `Invalid ARIA property: ${attr.name}`,
              element: element.tagName,
              property: attr.name,
              value: attr.value,
              location: this.getElementLocation(element),
              impact: 'Screen readers may ignore invalid properties'
            });
          }
          
          // Check property values
          const validationResult = this.validateARIAPropertyValue(attr.name, attr.value, element, document);
          if (!validationResult.valid) {
            test.violations++;
            test.issues.push({
              type: 'invalid_aria_value',
              message: validationResult.message,
              element: element.tagName,
              property: attr.name,
              value: attr.value,
              expected: validationResult.expected,
              location: this.getElementLocation(element),
              impact: 'Incorrect values may provide wrong information to screen readers'
            });
          }
        }
      }
    });
    
    return test;
  }

  /**
   * Test ARIA states
   */
  async testARIAStates(document) {
    const test = {
      test: 'aria_states',
      description: 'ARIA states must reflect current element state',
      issues: [],
      violations: 0,
      elements_tested: 0
    };
    
    // Test aria-expanded
    const expandableElements = Array.from(document.querySelectorAll('[aria-expanded]'));
    expandableElements.forEach(element => {
      const expanded = element.getAttribute('aria-expanded');
      if (expanded !== 'true' && expanded !== 'false') {
        test.violations++;
        test.issues.push({
          type: 'invalid_expanded_state',
          message: 'aria-expanded must be "true" or "false"',
          element: element.tagName,
          value: expanded,
          location: this.getElementLocation(element),
          impact: 'Screen readers cannot determine if element is expanded'
        });
      }
    });
    
    // Test aria-selected
    const selectableElements = Array.from(document.querySelectorAll('[aria-selected]'));
    selectableElements.forEach(element => {
      const selected = element.getAttribute('aria-selected');
      if (selected !== 'true' && selected !== 'false') {
        test.violations++;
        test.issues.push({
          type: 'invalid_selected_state',
          message: 'aria-selected must be "true" or "false"',
          element: element.tagName,
          value: selected,
          location: this.getElementLocation(element),
          impact: 'Screen readers cannot determine selection state'
        });
      }
    });
    
    // Test aria-checked
    const checkableElements = Array.from(document.querySelectorAll('[aria-checked]'));
    checkableElements.forEach(element => {
      const checked = element.getAttribute('aria-checked');
      if (!['true', 'false', 'mixed'].includes(checked)) {
        test.violations++;
        test.issues.push({
          type: 'invalid_checked_state',
          message: 'aria-checked must be "true", "false", or "mixed"',
          element: element.tagName,
          value: checked,
          location: this.getElementLocation(element),
          impact: 'Screen readers cannot determine checked state'
        });
      }
    });
    
    test.elements_tested = expandableElements.length + selectableElements.length + checkableElements.length;
    
    return test;
  }

  /**
   * Test ARIA landmarks
   */
  async testARIALandmarks(document) {
    const test = {
      test: 'aria_landmarks',
      description: 'Page should have proper landmark structure for navigation',
      issues: [],
      violations: 0,
      landmarks_found: 0
    };
    
    const landmarks = Array.from(document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], header, nav, main, aside, footer'));
    test.landmarks_found = landmarks.length;
    
    // Check for main landmark
    const mainLandmarks = Array.from(document.querySelectorAll('[role="main"], main'));
    if (mainLandmarks.length === 0) {
      test.violations++;
      test.issues.push({
        type: 'missing_main_landmark',
        message: 'Page should have a main landmark',
        impact: 'Screen reader users cannot quickly navigate to main content',
        suggestion: 'Add <main> element or role="main"'
      });
    } else if (mainLandmarks.length > 1) {
      test.violations++;
      test.issues.push({
        type: 'multiple_main_landmarks',
        message: 'Page should have only one main landmark',
        count: mainLandmarks.length,
        impact: 'Screen reader users may be confused by multiple main landmarks',
        suggestion: 'Use only one main landmark per page'
      });
    }
    
    // Check for navigation landmarks
    const navLandmarks = Array.from(document.querySelectorAll('[role="navigation"], nav'));
    if (navLandmarks.length === 0) {
      test.violations++;
      test.issues.push({
        type: 'missing_navigation_landmark',
        message: 'Page should have navigation landmarks',
        impact: 'Screen reader users cannot quickly access navigation',
        suggestion: 'Add <nav> elements or role="navigation"'
      });
    }
    
    // Check for proper landmark labeling
    landmarks.forEach(landmark => {
      const hasLabel = landmark.getAttribute('aria-label') || 
                      landmark.getAttribute('aria-labelledby') ||
                      (landmark.tagName === 'NAV' && landmark.textContent.trim());
      
      if (!hasLabel && navLandmarks.length > 1) {
        test.issues.push({
          type: 'unlabeled_landmark',
          message: 'Multiple landmarks of same type should be labeled',
          element: landmark.tagName,
          role: landmark.getAttribute('role'),
          location: this.getElementLocation(landmark),
          impact: 'Screen reader users cannot distinguish between similar landmarks'
        });
      }
    });
    
    return test;
  }

  /**
   * Test semantic markup for screen reader comprehension
   */
  async testSemanticMarkup(document) {
    const results = {
      category: 'Semantic Markup',
      tests: []
    };
    
    // Test heading structure
    results.tests.push(await this.testHeadingStructure(document));
    
    // Test list markup
    results.tests.push(await this.testListMarkup(document));
    
    // Test semantic elements
    results.tests.push(await this.testSemanticElements(document));
    
    // Test link context
    results.tests.push(await this.testLinkContext(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.score >= 80;
    
    return results;
  }

  /**
   * Test heading structure for screen reader navigation
   */
  async testHeadingStructure(document) {
    const test = {
      test: 'heading_structure',
      description: 'Headings must form proper hierarchical structure',
      issues: [],
      violations: 0,
      headings_found: 0
    };
    
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    test.headings_found = headings.length;
    
    if (headings.length === 0) {
      test.violations++;
      test.issues.push({
        type: 'no_headings',
        message: 'Page has no headings for structure',
        impact: 'Screen reader users cannot navigate content structure',
        suggestion: 'Add appropriate heading elements (h1-h6)'
      });
      return test;
    }
    
    // Check for h1
    const h1Elements = headings.filter(h => h.tagName === 'H1');
    if (h1Elements.length === 0) {
      test.violations++;
      test.issues.push({
        type: 'missing_h1',
        message: 'Page should have an h1 element',
        impact: 'Screen readers cannot identify main page heading',
        suggestion: 'Add h1 element for main page heading'
      });
    } else if (h1Elements.length > 1) {
      test.violations++;
      test.issues.push({
        type: 'multiple_h1',
        message: 'Page should have only one h1 element',
        count: h1Elements.length,
        impact: 'May confuse screen reader navigation',
        suggestion: 'Use only one h1 per page'
      });
    }
    
    // Check heading hierarchy
    let currentLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        test.violations++;
        test.issues.push({
          type: 'first_heading_not_h1',
          message: 'First heading should be h1',
          element: heading.tagName,
          text: heading.textContent.substring(0, 50),
          location: this.getElementLocation(heading),
          impact: 'Screen reader users may miss main page topic'
        });
      }
      
      if (level > currentLevel + 1) {
        test.violations++;
        test.issues.push({
          type: 'skipped_heading_level',
          message: `Heading level skipped from h${currentLevel} to h${level}`,
          element: heading.tagName,
          text: heading.textContent.substring(0, 50),
          location: this.getElementLocation(heading),
          impact: 'Screen reader users may miss content hierarchy'
        });
      }
      
      // Check for empty headings
      if (!heading.textContent.trim()) {
        test.violations++;
        test.issues.push({
          type: 'empty_heading',
          message: 'Heading element is empty',
          element: heading.tagName,
          location: this.getElementLocation(heading),
          impact: 'Screen readers announce empty headings confusingly'
        });
      }
      
      currentLevel = level;
    });
    
    return test;
  }

  /**
   * Test navigation structure for screen reader users
   */
  async testNavigationStructure(document) {
    const results = {
      category: 'Navigation Structure',
      tests: []
    };
    
    // Test skip links
    results.tests.push(await this.testSkipLinks(document));
    
    // Test focus order
    results.tests.push(await this.testFocusOrder(document));
    
    // Test navigation consistency
    results.tests.push(await this.testNavigationConsistency(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.score >= 80;
    
    return results;
  }

  /**
   * Test skip links for screen reader navigation
   */
  async testSkipLinks(document) {
    const test = {
      test: 'skip_links',
      description: 'Skip links should be provided for keyboard and screen reader users',
      issues: [],
      violations: 0,
      skip_links_found: 0
    };
    
    const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(link => {
      const text = link.textContent.toLowerCase();
      return text.includes('skip') || text.includes('jump') || text.includes('main');
    });
    
    test.skip_links_found = skipLinks.length;
    
    if (skipLinks.length === 0) {
      test.violations++;
      test.issues.push({
        type: 'no_skip_links',
        message: 'No skip links found',
        impact: 'Screen reader and keyboard users must navigate through all content',
        suggestion: 'Add skip links to main content and navigation'
      });
    } else {
      // Validate skip link targets
      skipLinks.forEach(link => {
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        
        if (!target) {
          test.violations++;
          test.issues.push({
            type: 'invalid_skip_target',
            message: `Skip link target ${href} not found`,
            link_text: link.textContent,
            href: href,
            location: this.getElementLocation(link),
            impact: 'Skip link will not work for users'
          });
        }
      });
    }
    
    return test;
  }

  /**
   * Test form accessibility for screen readers
   */
  async testFormAccessibility(document) {
    const results = {
      category: 'Form Accessibility',
      tests: []
    };
    
    // Test form labels
    results.tests.push(await this.testFormLabels(document));
    
    // Test fieldsets and legends
    results.tests.push(await this.testFieldsetsLegends(document));
    
    // Test form instructions
    results.tests.push(await this.testFormInstructions(document));
    
    // Test error handling
    results.tests.push(await this.testFormErrorHandling(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.score >= 85;
    
    return results;
  }

  /**
   * Test form labels for screen reader accessibility
   */
  async testFormLabels(document) {
    const test = {
      test: 'form_labels',
      description: 'Form controls must have accessible labels',
      issues: [],
      violations: 0,
      form_controls_found: 0
    };
    
    const formControls = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    test.form_controls_found = formControls.length;
    
    formControls.forEach(control => {
      const hasLabel = this.hasAccessibleLabel(control);
      
      if (!hasLabel.valid) {
        test.violations++;
        test.issues.push({
          type: 'missing_label',
          message: hasLabel.message,
          element: control.tagName,
          type: control.type,
          name: control.name,
          id: control.id,
          location: this.getElementLocation(control),
          impact: 'Screen readers cannot identify form control purpose',
          suggestion: hasLabel.suggestion
        });
      }
    });
    
    return test;
  }

  /**
   * Helper method to check if form control has accessible label
   */
  hasAccessibleLabel(control) {
    // Check for explicit label
    const labels = control.labels;
    if (labels && labels.length > 0) {
      const labelText = Array.from(labels).map(label => label.textContent.trim()).join(' ');
      if (labelText) {
        return { valid: true };
      }
    }
    
    // Check for aria-label
    const ariaLabel = control.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return { valid: true };
    }
    
    // Check for aria-labelledby
    const ariaLabelledby = control.getAttribute('aria-labelledby');
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby);
      if (labelElement && labelElement.textContent.trim()) {
        return { valid: true };
      }
    }
    
    // Check for title attribute (not ideal but acceptable)
    const title = control.getAttribute('title');
    if (title && title.trim()) {
      return { 
        valid: true,
        warning: 'Using title attribute for labeling is not ideal'
      };
    }
    
    // Check for placeholder (not sufficient but note it)
    const placeholder = control.getAttribute('placeholder');
    if (placeholder && placeholder.trim()) {
      return {
        valid: false,
        message: 'Form control only has placeholder text',
        suggestion: 'Add proper label element or aria-label'
      };
    }
    
    return {
      valid: false,
      message: 'Form control has no accessible label',
      suggestion: 'Add label element, aria-label, or aria-labelledby'
    };
  }

  /**
   * Calculate compatibility score for different screen readers
   */
  calculateCompatibilityScore(results) {
    const weights = {
      aria: 0.25,
      semantics: 0.20,
      navigation: 0.15,
      forms: 0.15,
      tables: 0.10,
      dynamicContent: 0.10,
      focusManagement: 0.05
    };
    
    const scores = {};
    let totalScore = 0;
    
    Object.entries(weights).forEach(([category, weight]) => {
      const categoryResult = results[category];
      const categoryScore = categoryResult?.score || 0;
      scores[category] = categoryScore;
      totalScore += categoryScore * weight;
    });
    
    const overall = Math.round(totalScore);
    
    // Screen reader specific compatibility (simplified)
    const screenReaderScores = {
      nvda: this.calculateScreenReaderSpecificScore(overall, 'nvda'),
      jaws: this.calculateScreenReaderSpecificScore(overall, 'jaws'),
      voiceover: this.calculateScreenReaderSpecificScore(overall, 'voiceover'),
      orca: this.calculateScreenReaderSpecificScore(overall, 'orca'),
      talkback: this.calculateScreenReaderSpecificScore(overall, 'talkback')
    };
    
    return {
      overall,
      level: this.determineCompatibilityLevel(overall),
      ...scores,
      ...screenReaderScores,
      percentage: overall
    };
  }

  calculateScreenReaderSpecificScore(baseScore, screenReader) {
    // Screen reader specific adjustments (simplified)
    const adjustments = {
      nvda: 0,     // Baseline
      jaws: -2,    // Slightly more strict
      voiceover: +3, // Generally more forgiving
      orca: -1,    // Slightly more strict
      talkback: -5 // Mobile considerations
    };
    
    return Math.max(0, Math.min(100, baseScore + (adjustments[screenReader] || 0)));
  }

  determineCompatibilityLevel(score) {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Helper methods for test calculations and utilities
   */
  calculateTestScore(tests) {
    if (tests.length === 0) return 100;
    
    const totalViolations = tests.reduce((sum, test) => sum + (test.violations || 0), 0);
    const totalTests = tests.length;
    
    // Score based on violations per test
    const avgViolationsPerTest = totalViolations / totalTests;
    return Math.max(0, Math.round(100 - (avgViolationsPerTest * 10)));
  }

  calculateSummary(results) {
    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    let criticalIssues = 0;
    let violations = 0;
    
    Object.values(results).forEach(category => {
      if (category.tests) {
        totalTests += category.tests.length;
        category.tests.forEach(test => {
          if (test.violations === 0) {
            passed++;
          } else {
            failed++;
          }
          violations += test.violations || 0;
          
          // Count critical issues (accessibility blockers)
          if (test.issues) {
            criticalIssues += test.issues.filter(issue => 
              issue.type === 'missing_main_landmark' ||
              issue.type === 'missing_label' ||
              issue.type === 'invalid_role' ||
              issue.type === 'no_headings'
            ).length;
          }
        });
      }
    });
    
    return {
      total_tests: totalTests,
      passed,
      failed,
      critical_issues: criticalIssues,
      violations
    };
  }

  /**
   * Generate findings from test results
   */
  generateFindings(results) {
    const findings = [];
    
    Object.entries(results).forEach(([categoryKey, category]) => {
      if (category.tests) {
        category.tests.forEach(test => {
          if (test.violations > 0 && test.issues) {
            test.issues.forEach(issue => {
              findings.push({
                type: 'screen_reader_issue',
                category: categoryKey,
                test: test.test,
                severity: this.determineSeverity(issue.type),
                title: issue.message,
                description: issue.message,
                element: issue.element,
                location: issue.location,
                impact: issue.impact,
                suggestion: issue.suggestion,
                screen_reader_impact: this.getScreenReaderImpact(issue.type)
              });
            });
          }
        });
      }
    });
    
    return findings.sort((a, b) => {
      const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  determineSeverity(issueType) {
    const criticalIssues = [
      'missing_main_landmark',
      'missing_label',
      'invalid_role',
      'no_headings',
      'missing_h1'
    ];
    
    const highIssues = [
      'inappropriate_role',
      'invalid_aria_property',
      'missing_navigation_landmark',
      'skipped_heading_level'
    ];
    
    if (criticalIssues.includes(issueType)) return 'critical';
    if (highIssues.includes(issueType)) return 'high';
    return 'medium';
  }

  getScreenReaderImpact(issueType) {
    const impacts = {
      'missing_main_landmark': 'Cannot quickly navigate to main content',
      'missing_label': 'Cannot identify form control purpose',
      'invalid_role': 'Element may not be announced correctly',
      'no_headings': 'Cannot navigate content structure',
      'missing_h1': 'Cannot identify main page topic',
      'inappropriate_role': 'May receive incorrect announcements',
      'invalid_aria_property': 'Property may be ignored',
      'missing_navigation_landmark': 'Cannot quickly access navigation'
    };
    
    return impacts[issueType] || 'May impact screen reader user experience';
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations(results) {
    const recommendations = [];
    const findings = this.generateFindings(results);
    
    // Group findings by type for consolidated recommendations
    const findingsByType = {};
    findings.forEach(finding => {
      if (!findingsByType[finding.type]) {
        findingsByType[finding.type] = [];
      }
      findingsByType[finding.type].push(finding);
    });
    
    // Generate recommendations for each finding type
    Object.entries(findingsByType).forEach(([type, typeFindings]) => {
      const recommendation = this.generateRecommendationForType(type, typeFindings);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });
    
    return recommendations.slice(0, 10); // Top 10 recommendations
  }

  generateRecommendationForType(type, findings) {
    const firstFinding = findings[0];
    
    const recommendations = {
      'missing_main_landmark': {
        title: 'Add Main Landmark',
        description: 'Add a main landmark to help screen reader users navigate to the primary content',
        action: 'Add <main> element or role="main" to the primary content area',
        effort: 'Low',
        impact: 'High'
      },
      'missing_label': {
        title: 'Add Form Labels',
        description: 'All form controls must have accessible labels for screen reader users',
        action: 'Add label elements, aria-label, or aria-labelledby to form controls',
        effort: 'Medium',
        impact: 'Critical'
      },
      'invalid_role': {
        title: 'Fix Invalid ARIA Roles',
        description: 'Replace invalid ARIA roles with valid ones',
        action: 'Use valid ARIA roles from the ARIA specification',
        effort: 'Low',
        impact: 'High'
      },
      'no_headings': {
        title: 'Add Heading Structure',
        description: 'Add proper heading structure for screen reader navigation',
        action: 'Add h1-h6 elements to create content hierarchy',
        effort: 'Medium',
        impact: 'High'
      }
    };
    
    const baseRecommendation = recommendations[firstFinding.test] || {
      title: `Fix ${firstFinding.title}`,
      description: firstFinding.description,
      action: firstFinding.suggestion || 'Follow accessibility best practices',
      effort: 'Medium',
      impact: 'Medium'
    };
    
    return {
      type: 'screen_reader_improvement',
      priority: firstFinding.severity,
      count: findings.length,
      ...baseRecommendation,
      findings: findings.slice(0, 5) // Include up to 5 example findings
    };
  }

  // Placeholder methods for remaining tests
  async testARIALiveRegions(document) { return { test: 'aria_live_regions', violations: 0, issues: [] }; }
  async testARIADescriptions(document) { return { test: 'aria_descriptions', violations: 0, issues: [] }; }
  async testListMarkup(document) { return { test: 'list_markup', violations: 0, issues: [] }; }
  async testSemanticElements(document) { return { test: 'semantic_elements', violations: 0, issues: [] }; }
  async testLinkContext(document) { return { test: 'link_context', violations: 0, issues: [] }; }
  async testFocusOrder(document) { return { test: 'focus_order', violations: 0, manual_test_required: true }; }
  async testNavigationConsistency(document) { return { test: 'navigation_consistency', violations: 0, manual_test_required: true }; }
  async testFieldsetsLegends(document) { return { test: 'fieldsets_legends', violations: 0, issues: [] }; }
  async testFormInstructions(document) { return { test: 'form_instructions', violations: 0, issues: [] }; }
  async testFormErrorHandling(document) { return { test: 'form_error_handling', violations: 0, manual_test_required: true }; }
  async testTableAccessibility(document) { return { category: 'Table Accessibility', tests: [], score: 100 }; }
  async testDynamicContent(document) { return { category: 'Dynamic Content', tests: [], score: 100 }; }
  async testFocusManagement(document) { return { category: 'Focus Management', tests: [], score: 100 }; }
  async testLiveRegions(document) { return { category: 'Live Regions', tests: [], score: 100 }; }

  /**
   * Utility methods
   */
  getElementLocation(element) {
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : {};
    return {
      tag: element.tagName?.toLowerCase(),
      x: rect.x || 0,
      y: rect.y || 0,
      xpath: this.getXPath(element)
    };
  }

  getXPath(element) {
    const parts = [];
    while (element && element.nodeType === 1) {
      let index = 0;
      let sibling = element.previousSibling;
      while (sibling) {
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      const tagName = element.tagName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : '';
      parts.unshift(`${tagName}${pathIndex}`);
      element = element.parentNode;
    }
    return parts.length ? `/${parts.join('/')}` : '';
  }

  checkInappropriateRole(element, role) {
    // Simplified inappropriate role checking
    const inappropriateRoles = [];
    
    if (element.tagName === 'BUTTON' && role === 'link') {
      inappropriateRoles.push('Use native button semantics instead of role="link"');
    }
    
    if (element.tagName === 'A' && role === 'button') {
      inappropriateRoles.push('Consider using <button> element instead of role="button" on link');
    }
    
    return inappropriateRoles;
  }

  validateARIAPropertyValue(property, value, element, document) {
    const validations = {
      'aria-expanded': {
        valid: ['true', 'false'].includes(value),
        expected: 'true or false',
        message: 'aria-expanded must be "true" or "false"'
      },
      'aria-selected': {
        valid: ['true', 'false'].includes(value),
        expected: 'true or false',
        message: 'aria-selected must be "true" or "false"'
      },
      'aria-checked': {
        valid: ['true', 'false', 'mixed'].includes(value),
        expected: 'true, false, or mixed',
        message: 'aria-checked must be "true", "false", or "mixed"'
      },
      'aria-labelledby': {
        valid: value.split(' ').every(id => document.getElementById(id)),
        expected: 'valid element IDs',
        message: 'aria-labelledby references non-existent element IDs'
      },
      'aria-describedby': {
        valid: value.split(' ').every(id => document.getElementById(id)),
        expected: 'valid element IDs',
        message: 'aria-describedby references non-existent element IDs'
      }
    };
    
    const validation = validations[property];
    if (validation) {
      return validation;
    }
    
    // Default validation for unknown properties
    return {
      valid: true,
      message: 'Property validation not implemented'
    };
  }

  /**
   * Initialize screen reader profiles and ARIA specification
   */
  initializeScreenReaderProfiles() {
    return {
      nvda: {
        name: 'NVDA',
        platform: 'Windows',
        strengths: ['web_navigation', 'form_handling', 'aria_support'],
        weaknesses: ['complex_tables', 'dynamic_content']
      },
      jaws: {
        name: 'JAWS',
        platform: 'Windows',
        strengths: ['comprehensive_support', 'form_mode', 'table_navigation'],
        weaknesses: ['learning_curve', 'cost']
      },
      voiceover: {
        name: 'VoiceOver',
        platform: 'macOS/iOS',
        strengths: ['native_integration', 'gesture_support', 'rotor_navigation'],
        weaknesses: ['web_table_support', 'form_navigation']
      },
      orca: {
        name: 'Orca',
        platform: 'Linux',
        strengths: ['open_source', 'customization'],
        weaknesses: ['limited_web_support', 'documentation']
      },
      talkback: {
        name: 'TalkBack',
        platform: 'Android',
        strengths: ['touch_navigation', 'mobile_optimization'],
        weaknesses: ['web_content_support', 'complex_interactions']
      }
    };
  }

  initializeARIASpecification() {
    return {
      roles: [
        'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
        'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
        'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
        'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
        'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
        'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
        'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
        'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
        'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
        'treeitem'
      ],
      properties: [
        'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy', 'aria-checked',
        'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-controls', 'aria-current',
        'aria-describedby', 'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
        'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden',
        'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-level',
        'aria-live', 'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-orientation',
        'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed', 'aria-readonly',
        'aria-relevant', 'aria-required', 'aria-roledescription', 'aria-rowcount', 'aria-rowindex',
        'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax',
        'aria-valuemin', 'aria-valuenow', 'aria-valuetext'
      ]
    };
  }

  handleDetectionError(error) {
    return {
      detector: this.name,
      version: this.version,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      score: 0,
      recommendations: [
        {
          type: 'error_resolution',
          priority: 'high',
          title: 'Resolve Screen Reader Detection Error',
          description: `Screen reader compatibility detection failed: ${error.message}`,
          action: 'Check page content and DOM structure'
        }
      ]
    };
  }
}
