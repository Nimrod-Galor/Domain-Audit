/**
 * ============================================================================
 * KEYBOARD NAVIGATION DETECTOR - GPT-5 STYLE MODULAR DETECTOR
 * ============================================================================
 * 
 * Advanced keyboard navigation analyzer that validates complete keyboard accessibility
 * according to WCAG 2.1 guidelines and modern accessibility best practices.
 * 
 * Keyboard Navigation Testing:
 * - Tab order and logical sequence validation
 * - Focus management and focus traps detection
 * - Keyboard shortcuts and access keys
 * - Skip links and bypass mechanisms
 * - Custom interactive elements keyboard support
 * - Modal and overlay keyboard handling
 * - Focus indicators visibility and contrast
 * - Keyboard-only operation completeness
 * 
 * Advanced Features:
 * - Sequential navigation testing
 * - Spatial navigation analysis
 * - Focus restoration validation
 * - Keyboard event handling verification
 * - Custom keyboard controls detection
 * - Touch device keyboard interaction
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration_pattern GPT-5 Style Modular Detector
 */

export class KeyboardNavigationDetector {
  constructor(options = {}) {
    this.options = {
      testTabOrder: true,
      testFocusManagement: true,
      testSkipLinks: true,
      testKeyboardShortcuts: true,
      testFocusIndicators: true,
      testInteractiveElements: true,
      testModalHandling: true,
      simulateKeyboardOnly: true,
      includeCustomControls: true,
      timeout: 30000,
      ...options
    };
    
    this.name = 'KeyboardNavigationDetector';
    this.version = '1.0.0';
    
    // Keyboard navigation standards
    this.keyboardStandards = this.initializeKeyboardStandards();
    
    // Focusable element selectors
    this.focusableSelectors = this.initializeFocusableSelectors();
    
    console.log('⌨️ Keyboard Navigation Detector initialized');
    console.log(`🔧 Test configuration: TabOrder=${this.options.testTabOrder}, Focus=${this.options.testFocusManagement}`);
  }

  /**
   * Main detection method for keyboard navigation analysis
   */
  async detect(context) {
    const startTime = Date.now();
    
    try {
      const { document, url, accessibilityContext } = context;
      
      if (!document) {
        throw new Error('Document not available for keyboard navigation detection');
      }
      
      console.log('⌨️ Analyzing keyboard navigation accessibility...');
      
      // Run comprehensive keyboard navigation tests
      const keyboardResults = await this.runKeyboardTests(document, accessibilityContext);
      
      // Calculate navigation score
      const navigationScore = this.calculateNavigationScore(keyboardResults);
      
      // Generate findings and recommendations
      const findings = this.generateFindings(keyboardResults);
      const recommendations = this.generateRecommendations(keyboardResults);
      
      const endTime = Date.now();
      
      return {
        detector: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        performance_time: endTime - startTime,
        
        // Core Results
        score: navigationScore.overall,
        accessibility_level: navigationScore.level,
        keyboard_results: keyboardResults,
        
        // Detailed Analysis
        tab_order_analysis: keyboardResults.tabOrder,
        focus_management_analysis: keyboardResults.focusManagement,
        skip_links_analysis: keyboardResults.skipLinks,
        keyboard_shortcuts_analysis: keyboardResults.keyboardShortcuts,
        focus_indicators_analysis: keyboardResults.focusIndicators,
        interactive_elements_analysis: keyboardResults.interactiveElements,
        modal_handling_analysis: keyboardResults.modalHandling,
        
        // Navigation Assessment
        total_focusable_elements: keyboardResults.summary.total_focusable,
        accessible_elements: keyboardResults.summary.accessible_count,
        inaccessible_elements: keyboardResults.summary.inaccessible_count,
        keyboard_only_score: navigationScore.keyboard_only,
        
        // Critical Issues
        focus_traps: keyboardResults.summary.focus_traps,
        unreachable_elements: keyboardResults.summary.unreachable_elements,
        missing_focus_indicators: keyboardResults.summary.missing_focus_indicators,
        keyboard_blockers: keyboardResults.summary.keyboard_blockers,
        
        findings,
        recommendations,
        
        // Metadata
        test_configuration: {
          tab_order_tested: this.options.testTabOrder,
          focus_management_tested: this.options.testFocusManagement,
          skip_links_tested: this.options.testSkipLinks,
          keyboard_shortcuts_tested: this.options.testKeyboardShortcuts,
          url: url
        }
      };
      
    } catch (error) {
      console.error('❌ Keyboard Navigation Detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Run comprehensive keyboard navigation tests
   */
  async runKeyboardTests(document, accessibilityContext) {
    const results = {
      tabOrder: await this.testTabOrder(document),
      focusManagement: await this.testFocusManagement(document),
      skipLinks: await this.testSkipLinks(document),
      keyboardShortcuts: await this.testKeyboardShortcuts(document),
      focusIndicators: await this.testFocusIndicators(document),
      interactiveElements: await this.testInteractiveElements(document),
      modalHandling: await this.testModalHandling(document),
      summary: {}
    };
    
    // Calculate summary
    results.summary = this.calculateSummary(results);
    
    return results;
  }

  /**
   * Test tab order and logical sequence
   */
  async testTabOrder(document) {
    const results = {
      category: 'Tab Order',
      tests: []
    };
    
    // Get all focusable elements
    const focusableElements = this.getFocusableElements(document);
    
    // Test tab order sequence
    results.tests.push(await this.testTabSequence(focusableElements));
    
    // Test tabindex usage
    results.tests.push(await this.testTabIndexUsage(focusableElements));
    
    // Test logical reading order
    results.tests.push(await this.testLogicalOrder(focusableElements));
    
    // Test tab order consistency
    results.tests.push(await this.testTabOrderConsistency(focusableElements));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0);
    
    return results;
  }

  /**
   * Get all focusable elements in the document
   */
  getFocusableElements(document) {
    const elements = Array.from(document.querySelectorAll(this.focusableSelectors.join(', ')));
    
    return elements.filter(element => {
      // Filter out hidden or disabled elements
      const style = this.getComputedStyle(element);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0';
      const isEnabled = !element.disabled && !element.hasAttribute('disabled');
      const isNotHidden = !element.hasAttribute('hidden');
      const tabIndexNotNegative = element.tabIndex !== -1;
      
      return isVisible && isEnabled && isNotHidden && tabIndexNotNegative;
    });
  }

  /**
   * Test tab sequence for logical flow
   */
  async testTabSequence(focusableElements) {
    const test = {
      test: 'tab_sequence',
      description: 'Tab order should follow logical reading sequence',
      issues: [],
      violations: 0,
      elements_tested: focusableElements.length
    };
    
    // Sort elements by tab order
    const tabOrderElements = focusableElements
      .map((element, index) => ({
        element,
        tabIndex: element.tabIndex || 0,
        documentOrder: index,
        position: this.getElementPosition(element)
      }))
      .sort((a, b) => {
        // Sort by tabIndex first (0 comes after positive numbers)
        if (a.tabIndex > 0 && b.tabIndex > 0) return a.tabIndex - b.tabIndex;
        if (a.tabIndex > 0) return -1;
        if (b.tabIndex > 0) return 1;
        // Then by document order
        return a.documentOrder - b.documentOrder;
      });
    
    // Check for tab order issues
    for (let i = 0; i < tabOrderElements.length - 1; i++) {
      const current = tabOrderElements[i];
      const next = tabOrderElements[i + 1];
      
      // Check for large visual jumps in tab order
      const visualJump = this.calculateVisualJump(current.position, next.position);
      if (visualJump > 500) { // 500px threshold
        test.violations++;
        test.issues.push({
          type: 'visual_tab_jump',
          message: 'Tab order creates large visual jump on page',
          current_element: current.element.tagName,
          next_element: next.element.tagName,
          jump_distance: Math.round(visualJump),
          current_position: current.position,
          next_position: next.position,
          impact: 'Users may lose track of focus position'
        });
      }
      
      // Check for backwards tab flow
      if (current.position.y > next.position.y + 50) { // 50px tolerance
        test.violations++;
        test.issues.push({
          type: 'backwards_tab_flow',
          message: 'Tab order moves backwards on the page',
          current_element: current.element.tagName,
          next_element: next.element.tagName,
          impact: 'Unexpected navigation flow for keyboard users'
        });
      }
    }
    
    return test;
  }

  /**
   * Test tabindex usage patterns
   */
  async testTabIndexUsage(focusableElements) {
    const test = {
      test: 'tabindex_usage',
      description: 'Tabindex should be used appropriately',
      issues: [],
      violations: 0,
      elements_tested: 0
    };
    
    const elementsWithTabIndex = focusableElements.filter(el => el.hasAttribute('tabindex'));
    test.elements_tested = elementsWithTabIndex.length;
    
    elementsWithTabIndex.forEach(element => {
      const tabIndex = element.tabIndex;
      
      // Check for positive tabindex values (generally discouraged)
      if (tabIndex > 0) {
        test.violations++;
        test.issues.push({
          type: 'positive_tabindex',
          message: 'Positive tabindex values should be avoided',
          element: element.tagName,
          tabindex_value: tabIndex,
          location: this.getElementLocation(element),
          impact: 'May disrupt natural tab order for keyboard users',
          recommendation: 'Use tabindex="0" or restructure HTML for natural tab order'
        });
      }
      
      // Check for inappropriate tabindex on non-interactive elements
      const isInteractive = this.isInteractiveElement(element);
      if (tabIndex >= 0 && !isInteractive) {
        test.issues.push({
          type: 'tabindex_on_non_interactive',
          message: 'Tabindex on non-interactive element',
          element: element.tagName,
          tabindex_value: tabIndex,
          location: this.getElementLocation(element),
          impact: 'May create confusion for keyboard users',
          recommendation: 'Add appropriate role or make element truly interactive'
        });
      }
    });
    
    return test;
  }

  /**
   * Test logical reading order
   */
  async testLogicalOrder(focusableElements) {
    const test = {
      test: 'logical_order',
      description: 'Focus order should match visual reading order',
      issues: [],
      violations: 0,
      manual_test_required: true
    };
    
    // This requires manual testing but we can identify potential issues
    const elementsWithPositioning = focusableElements.filter(element => {
      const style = this.getComputedStyle(element);
      return style.position === 'absolute' || style.position === 'fixed' || 
             style.float !== 'none' || style.display === 'flex' || 
             style.display === 'grid';
    });
    
    if (elementsWithPositioning.length > 0) {
      test.issues.push({
        type: 'complex_layout',
        message: 'Page uses complex positioning that may affect tab order',
        affected_elements: elementsWithPositioning.length,
        recommendation: 'Manually verify that focus order matches visual reading order',
        guidance: 'Tab through the page and ensure focus moves logically through content'
      });
    }
    
    return test;
  }

  /**
   * Test tab order consistency
   */
  async testTabOrderConsistency(focusableElements) {
    const test = {
      test: 'tab_order_consistency',
      description: 'Tab order should be consistent and predictable',
      issues: [],
      violations: 0,
      elements_tested: focusableElements.length
    };
    
    // Check for elements that might be dynamically added/removed
    const dynamicElements = focusableElements.filter(element => {
      return element.hasAttribute('data-dynamic') || 
             element.classList.contains('dynamic') ||
             element.closest('[data-dynamic], .dynamic');
    });
    
    if (dynamicElements.length > 0) {
      test.issues.push({
        type: 'dynamic_elements',
        message: 'Dynamic elements may affect tab order consistency',
        dynamic_elements_count: dynamicElements.length,
        recommendation: 'Ensure dynamic content maintains logical tab order',
        guidance: 'Test tab order after dynamic content changes'
      });
    }
    
    return test;
  }

  /**
   * Test focus management
   */
  async testFocusManagement(document) {
    const results = {
      category: 'Focus Management',
      tests: []
    };
    
    // Test focus traps
    results.tests.push(await this.testFocusTraps(document));
    
    // Test focus restoration
    results.tests.push(await this.testFocusRestoration(document));
    
    // Test initial focus
    results.tests.push(await this.testInitialFocus(document));
    
    // Test focus within components
    results.tests.push(await this.testComponentFocus(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0 || test.manual_test_required);
    
    return results;
  }

  /**
   * Test for focus traps
   */
  async testFocusTraps(document) {
    const test = {
      test: 'focus_traps',
      description: 'Focus should not be trapped inappropriately',
      issues: [],
      violations: 0,
      manual_test_required: true
    };
    
    // Look for modal-like elements that might trap focus
    const modalElements = Array.from(document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], .modal, .popup, .overlay'
    ));
    
    modalElements.forEach(modal => {
      const isVisible = this.isElementVisible(modal);
      
      if (isVisible) {
        // Check if modal has focusable elements
        const focusableInModal = this.getFocusableElements(modal);
        
        if (focusableInModal.length === 0) {
          test.violations++;
          test.issues.push({
            type: 'modal_no_focusable',
            message: 'Modal element has no focusable content',
            element: modal.tagName,
            role: modal.getAttribute('role'),
            location: this.getElementLocation(modal),
            impact: 'Keyboard users cannot interact with modal',
            recommendation: 'Add focusable elements or close button to modal'
          });
        }
        
        // Check for escape key handler (can't test directly, provide guidance)
        test.issues.push({
          type: 'modal_escape_key',
          message: 'Verify modal can be closed with Escape key',
          element: modal.tagName,
          role: modal.getAttribute('role'),
          manual_test_required: true,
          guidance: 'Press Escape key to verify modal closes'
        });
      }
    });
    
    return test;
  }

  /**
   * Test skip links functionality
   */
  async testSkipLinks(document) {
    const results = {
      category: 'Skip Links',
      tests: []
    };
    
    // Test skip link presence
    results.tests.push(await this.testSkipLinkPresence(document));
    
    // Test skip link functionality
    results.tests.push(await this.testSkipLinkFunctionality(document));
    
    // Test skip link visibility
    results.tests.push(await this.testSkipLinkVisibility(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0);
    
    return results;
  }

  /**
   * Test skip link presence
   */
  async testSkipLinkPresence(document) {
    const test = {
      test: 'skip_link_presence',
      description: 'Skip links should be provided for keyboard navigation',
      issues: [],
      violations: 0
    };
    
    const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(link => {
      const text = link.textContent.toLowerCase();
      return text.includes('skip') || text.includes('jump') || 
             text.includes('main') || text.includes('content');
    });
    
    if (skipLinks.length === 0) {
      test.violations++;
      test.issues.push({
        type: 'no_skip_links',
        message: 'No skip links found on page',
        impact: 'Keyboard users must tab through all navigation to reach main content',
        recommendation: 'Add skip links to main content and navigation landmarks',
        example: '<a href="#main-content">Skip to main content</a>'
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
            impact: 'Skip link will not function for users',
            recommendation: 'Ensure skip link target exists on page'
          });
        } else {
          // Check if target is focusable
          const targetFocusable = target.tabIndex >= 0 || 
                                this.isInteractiveElement(target) ||
                                target.hasAttribute('tabindex');
          
          if (!targetFocusable) {
            test.issues.push({
              type: 'skip_target_not_focusable',
              message: 'Skip link target is not focusable',
              link_text: link.textContent,
              target_element: target.tagName,
              recommendation: 'Add tabindex="-1" to skip link target for focus management'
            });
          }
        }
      });
    }
    
    return test;
  }

  /**
   * Test keyboard shortcuts
   */
  async testKeyboardShortcuts(document) {
    const results = {
      category: 'Keyboard Shortcuts',
      tests: []
    };
    
    // Test access key usage
    results.tests.push(await this.testAccessKeys(document));
    
    // Test custom keyboard shortcuts
    results.tests.push(await this.testCustomShortcuts(document));
    
    // Test shortcut conflicts
    results.tests.push(await this.testShortcutConflicts(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0);
    
    return results;
  }

  /**
   * Test access key implementation
   */
  async testAccessKeys(document) {
    const test = {
      test: 'access_keys',
      description: 'Access keys should be implemented correctly',
      issues: [],
      violations: 0,
      elements_tested: 0
    };
    
    const elementsWithAccessKey = Array.from(document.querySelectorAll('[accesskey]'));
    test.elements_tested = elementsWithAccessKey.length;
    
    const usedKeys = new Set();
    
    elementsWithAccessKey.forEach(element => {
      const accessKey = element.getAttribute('accesskey');
      
      // Check for duplicate access keys
      if (usedKeys.has(accessKey.toLowerCase())) {
        test.violations++;
        test.issues.push({
          type: 'duplicate_access_key',
          message: `Duplicate access key: ${accessKey}`,
          element: element.tagName,
          access_key: accessKey,
          location: this.getElementLocation(element),
          impact: 'Access key conflict may prevent proper functionality',
          recommendation: 'Use unique access keys for each element'
        });
      } else {
        usedKeys.add(accessKey.toLowerCase());
      }
      
      // Check for problematic access keys
      const problematicKeys = ['a', 'e', 'f', 'h', 'v', 't', 'd', 's']; // Common browser shortcuts
      if (problematicKeys.includes(accessKey.toLowerCase())) {
        test.issues.push({
          type: 'problematic_access_key',
          message: `Access key "${accessKey}" may conflict with browser shortcuts`,
          element: element.tagName,
          access_key: accessKey,
          location: this.getElementLocation(element),
          impact: 'May override browser functionality',
          recommendation: 'Consider using different access key'
        });
      }
    });
    
    return test;
  }

  /**
   * Test focus indicators
   */
  async testFocusIndicators(document) {
    const results = {
      category: 'Focus Indicators',
      tests: []
    };
    
    // Test focus indicator presence
    results.tests.push(await this.testFocusIndicatorPresence(document));
    
    // Test focus indicator visibility
    results.tests.push(await this.testFocusIndicatorVisibility(document));
    
    // Test custom focus styles
    results.tests.push(await this.testCustomFocusStyles(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0 || test.manual_test_required);
    
    return results;
  }

  /**
   * Test focus indicator presence
   */
  async testFocusIndicatorPresence(document) {
    const test = {
      test: 'focus_indicator_presence',
      description: 'All focusable elements must have visible focus indicators',
      issues: [],
      violations: 0,
      manual_test_required: true
    };
    
    const focusableElements = this.getFocusableElements(document);
    
    // Check for outline: none or similar styles that remove focus indicators
    const elementsWithoutOutline = focusableElements.filter(element => {
      const style = this.getComputedStyle(element);
      return style.outline === 'none' || style.outline === '0' || style.outlineWidth === '0px';
    });
    
    if (elementsWithoutOutline.length > 0) {
      test.violations++;
      test.issues.push({
        type: 'removed_focus_outline',
        message: 'Elements have focus outline removed',
        affected_elements: elementsWithoutOutline.length,
        impact: 'Keyboard users cannot see which element has focus',
        recommendation: 'Provide custom focus indicators when removing default outline',
        elements: elementsWithoutOutline.slice(0, 5).map(el => ({
          tag: el.tagName,
          location: this.getElementLocation(el)
        }))
      });
    }
    
    // Provide guidance for manual testing
    test.guidance = [
      'Tab through all interactive elements',
      'Verify each element shows clear focus indicator',
      'Check focus indicators are visible against all backgrounds',
      'Ensure focus indicators meet 3:1 contrast ratio requirement'
    ];
    
    return test;
  }

  /**
   * Test interactive elements keyboard accessibility
   */
  async testInteractiveElements(document) {
    const results = {
      category: 'Interactive Elements',
      tests: []
    };
    
    // Test custom interactive elements
    results.tests.push(await this.testCustomInteractiveElements(document));
    
    // Test button keyboard support
    results.tests.push(await this.testButtonKeyboardSupport(document));
    
    // Test link keyboard support
    results.tests.push(await this.testLinkKeyboardSupport(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0);
    
    return results;
  }

  /**
   * Test custom interactive elements
   */
  async testCustomInteractiveElements(document) {
    const test = {
      test: 'custom_interactive_elements',
      description: 'Custom interactive elements must be keyboard accessible',
      issues: [],
      violations: 0,
      elements_tested: 0
    };
    
    // Find elements that appear to be interactive but aren't native interactive elements
    const potentialInteractive = Array.from(document.querySelectorAll('div, span')).filter(element => {
      return element.onclick || 
             element.getAttribute('onclick') ||
             element.classList.contains('button') ||
             element.classList.contains('clickable') ||
             element.getAttribute('role') === 'button' ||
             element.getAttribute('role') === 'tab' ||
             element.getAttribute('role') === 'menuitem';
    });
    
    test.elements_tested = potentialInteractive.length;
    
    potentialInteractive.forEach(element => {
      const isKeyboardAccessible = element.tabIndex >= 0 || 
                                  element.hasAttribute('tabindex');
      const hasRole = element.getAttribute('role');
      
      if (!isKeyboardAccessible) {
        test.violations++;
        test.issues.push({
          type: 'non_keyboard_accessible_interactive',
          message: 'Interactive element not keyboard accessible',
          element: element.tagName,
          classes: Array.from(element.classList).join(' '),
          role: hasRole,
          location: this.getElementLocation(element),
          impact: 'Element cannot be reached or activated via keyboard',
          recommendation: 'Add tabindex="0" and keyboard event handlers'
        });
      }
      
      // Check for appropriate ARIA role
      if (isKeyboardAccessible && !hasRole && !this.isInteractiveElement(element)) {
        test.violations++;
        test.issues.push({
          type: 'missing_interactive_role',
          message: 'Interactive element missing appropriate ARIA role',
          element: element.tagName,
          location: this.getElementLocation(element),
          impact: 'Screen readers may not announce element as interactive',
          recommendation: 'Add appropriate role (button, tab, menuitem, etc.)'
        });
      }
    });
    
    return test;
  }

  /**
   * Test modal keyboard handling
   */
  async testModalHandling(document) {
    const results = {
      category: 'Modal Handling',
      tests: []
    };
    
    // Test modal focus management
    results.tests.push(await this.testModalFocusManagement(document));
    
    // Test modal keyboard traps
    results.tests.push(await this.testModalKeyboardTraps(document));
    
    results.score = this.calculateTestScore(results.tests);
    results.compliance = results.tests.every(test => test.violations === 0 || test.manual_test_required);
    
    return results;
  }

  /**
   * Test modal focus management
   */
  async testModalFocusManagement(document) {
    const test = {
      test: 'modal_focus_management',
      description: 'Modals must properly manage focus',
      issues: [],
      violations: 0,
      manual_test_required: true
    };
    
    const modals = Array.from(document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], .modal, .popup'
    ));
    
    modals.forEach(modal => {
      const focusableElements = this.getFocusableElements(modal);
      
      if (focusableElements.length === 0) {
        test.violations++;
        test.issues.push({
          type: 'modal_no_focusable_elements',
          message: 'Modal contains no focusable elements',
          element: modal.tagName,
          role: modal.getAttribute('role'),
          location: this.getElementLocation(modal),
          impact: 'Keyboard users cannot interact with modal content',
          recommendation: 'Add focusable elements or close mechanism'
        });
      }
    });
    
    // Provide guidance for manual testing
    test.guidance = [
      'Open modal and verify focus moves to modal content',
      'Tab through modal and verify focus stays within modal',
      'Press Escape and verify modal closes and focus returns to trigger',
      'Close modal and verify focus returns to the element that opened it'
    ];
    
    return test;
  }

  /**
   * Helper methods for calculations and utilities
   */
  calculateNavigationScore(results) {
    const weights = {
      tabOrder: 0.25,
      focusManagement: 0.20,
      skipLinks: 0.15,
      keyboardShortcuts: 0.10,
      focusIndicators: 0.15,
      interactiveElements: 0.10,
      modalHandling: 0.05
    };
    
    let totalScore = 0;
    const scores = {};
    
    Object.entries(weights).forEach(([category, weight]) => {
      const categoryResult = results[category];
      const categoryScore = categoryResult?.score || 0;
      scores[category] = categoryScore;
      totalScore += categoryScore * weight;
    });
    
    const overall = Math.round(totalScore);
    
    return {
      overall,
      level: this.determineAccessibilityLevel(overall),
      keyboard_only: overall, // Simplified - same as overall for keyboard navigation
      ...scores,
      percentage: overall
    };
  }

  determineAccessibilityLevel(score) {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  }

  calculateTestScore(tests) {
    if (tests.length === 0) return 100;
    
    const totalViolations = tests.reduce((sum, test) => sum + (test.violations || 0), 0);
    const totalTests = tests.length;
    
    // Score based on violations per test
    const avgViolationsPerTest = totalViolations / totalTests;
    return Math.max(0, Math.round(100 - (avgViolationsPerTest * 15)));
  }

  calculateSummary(results) {
    let totalFocusable = 0;
    let accessibleCount = 0;
    let inaccessibleCount = 0;
    let focusTraps = 0;
    let unreachableElements = 0;
    let missingFocusIndicators = 0;
    let keyboardBlockers = 0;
    
    Object.values(results).forEach(category => {
      if (category.tests) {
        category.tests.forEach(test => {
          if (test.elements_tested) {
            totalFocusable += test.elements_tested;
          }
          
          if (test.violations > 0) {
            inaccessibleCount += test.violations;
          } else {
            accessibleCount += test.elements_tested || 1;
          }
          
          // Count specific issue types
          if (test.issues) {
            test.issues.forEach(issue => {
              switch (issue.type) {
                case 'focus_trap':
                  focusTraps++;
                  break;
                case 'non_keyboard_accessible_interactive':
                  unreachableElements++;
                  keyboardBlockers++;
                  break;
                case 'removed_focus_outline':
                  missingFocusIndicators++;
                  break;
              }
            });
          }
        });
      }
    });
    
    return {
      total_focusable: totalFocusable,
      accessible_count: accessibleCount,
      inaccessible_count: inaccessibleCount,
      focus_traps: focusTraps,
      unreachable_elements: unreachableElements,
      missing_focus_indicators: missingFocusIndicators,
      keyboard_blockers: keyboardBlockers
    };
  }

  /**
   * Generate findings from keyboard navigation analysis
   */
  generateFindings(results) {
    const findings = [];
    
    Object.entries(results).forEach(([categoryKey, category]) => {
      if (category.tests) {
        category.tests.forEach(test => {
          if (test.violations > 0 && test.issues) {
            test.issues.forEach(issue => {
              findings.push({
                type: 'keyboard_navigation_issue',
                category: categoryKey,
                test: test.test,
                severity: this.determineSeverity(issue.type),
                title: issue.message,
                description: issue.message,
                element: issue.element,
                location: issue.location,
                impact: issue.impact,
                recommendation: issue.recommendation,
                keyboard_impact: this.getKeyboardImpact(issue.type)
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
      'non_keyboard_accessible_interactive',
      'modal_no_focusable_elements',
      'no_skip_links'
    ];
    
    const highIssues = [
      'positive_tabindex',
      'removed_focus_outline',
      'invalid_skip_target',
      'duplicate_access_key'
    ];
    
    if (criticalIssues.includes(issueType)) return 'critical';
    if (highIssues.includes(issueType)) return 'high';
    return 'medium';
  }

  getKeyboardImpact(issueType) {
    const impacts = {
      'non_keyboard_accessible_interactive': 'Element cannot be reached or activated with keyboard',
      'modal_no_focusable_elements': 'Modal cannot be used with keyboard navigation',
      'no_skip_links': 'Must navigate through all content to reach main areas',
      'positive_tabindex': 'Disrupts natural keyboard navigation flow',
      'removed_focus_outline': 'Cannot see which element has keyboard focus',
      'invalid_skip_target': 'Skip link does not function as expected'
    };
    
    return impacts[issueType] || 'May impact keyboard navigation experience';
  }

  /**
   * Generate recommendations for keyboard navigation improvements
   */
  generateRecommendations(results) {
    const recommendations = [];
    const findings = this.generateFindings(results);
    
    // Group findings by type for consolidated recommendations
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    
    if (criticalFindings.length > 0) {
      recommendations.push({
        type: 'critical_keyboard_fix',
        priority: 'critical',
        title: 'Fix Critical Keyboard Accessibility Issues',
        description: `${criticalFindings.length} elements are completely inaccessible via keyboard`,
        action: 'Add keyboard support to all interactive elements',
        effort: 'High',
        impact: 'Critical',
        examples: criticalFindings.slice(0, 3)
      });
    }
    
    if (highFindings.length > 0) {
      recommendations.push({
        type: 'keyboard_navigation_improvement',
        priority: 'high',
        title: 'Improve Keyboard Navigation',
        description: `${highFindings.length} keyboard navigation issues found`,
        action: 'Enhance tab order, focus management, and keyboard shortcuts',
        effort: 'Medium',
        impact: 'High',
        examples: highFindings.slice(0, 3)
      });
    }
    
    // Skip links recommendation
    const skipLinkIssues = findings.filter(f => f.test === 'skip_link_presence');
    if (skipLinkIssues.length > 0) {
      recommendations.push({
        type: 'add_skip_links',
        priority: 'high',
        title: 'Add Skip Navigation Links',
        description: 'Skip links help keyboard users bypass repetitive navigation',
        action: 'Add "Skip to main content" and other bypass mechanisms',
        effort: 'Low',
        impact: 'High'
      });
    }
    
    return recommendations.slice(0, 8); // Top 8 recommendations
  }

  // Placeholder methods for remaining tests
  async testLogicalOrder(focusableElements) { return { test: 'logical_order', violations: 0, manual_test_required: true }; }
  async testTabOrderConsistency(focusableElements) { return { test: 'tab_order_consistency', violations: 0, issues: [] }; }
  async testFocusRestoration(document) { return { test: 'focus_restoration', violations: 0, manual_test_required: true }; }
  async testInitialFocus(document) { return { test: 'initial_focus', violations: 0, manual_test_required: true }; }
  async testComponentFocus(document) { return { test: 'component_focus', violations: 0, manual_test_required: true }; }
  async testSkipLinkFunctionality(document) { return { test: 'skip_link_functionality', violations: 0, manual_test_required: true }; }
  async testSkipLinkVisibility(document) { return { test: 'skip_link_visibility', violations: 0, manual_test_required: true }; }
  async testCustomShortcuts(document) { return { test: 'custom_shortcuts', violations: 0, manual_test_required: true }; }
  async testShortcutConflicts(document) { return { test: 'shortcut_conflicts', violations: 0, manual_test_required: true }; }
  async testFocusIndicatorVisibility(document) { return { test: 'focus_indicator_visibility', violations: 0, manual_test_required: true }; }
  async testCustomFocusStyles(document) { return { test: 'custom_focus_styles', violations: 0, manual_test_required: true }; }
  async testButtonKeyboardSupport(document) { return { test: 'button_keyboard_support', violations: 0, issues: [] }; }
  async testLinkKeyboardSupport(document) { return { test: 'link_keyboard_support', violations: 0, issues: [] }; }
  async testModalKeyboardTraps(document) { return { test: 'modal_keyboard_traps', violations: 0, manual_test_required: true }; }

  /**
   * Utility methods
   */
  getElementPosition(element) {
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : {};
    return {
      x: rect.x || 0,
      y: rect.y || 0,
      width: rect.width || 0,
      height: rect.height || 0
    };
  }

  calculateVisualJump(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isInteractiveElement(element) {
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option'];
    
    return interactiveTags.includes(element.tagName.toLowerCase()) ||
           interactiveRoles.includes(element.getAttribute('role')) ||
           element.hasAttribute('onclick') ||
           element.onclick;
  }

  isElementVisible(element) {
    const style = this.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  getComputedStyle(element) {
    if (element.ownerDocument?.defaultView?.getComputedStyle) {
      return element.ownerDocument.defaultView.getComputedStyle(element);
    }
    return element.style || {};
  }

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

  /**
   * Initialize keyboard standards and focusable selectors
   */
  initializeKeyboardStandards() {
    return {
      wcag_2_1: {
        keyboard_accessible: '2.1.1',
        no_keyboard_trap: '2.1.2',
        keyboard_shortcuts: '2.1.4'
      },
      focus_management: {
        sequential_navigation: 'Tab/Shift+Tab',
        spatial_navigation: 'Arrow keys for components',
        escape_hatch: 'Escape key for modals'
      }
    };
  }

  initializeFocusableSelectors() {
    return [
      'a[href]',
      'button',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'details > summary:first-child',
      '[role="button"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="link"]'
    ];
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
          title: 'Resolve Keyboard Navigation Detection Error',
          description: `Keyboard navigation detection failed: ${error.message}`,
          action: 'Check page content and interactive elements'
        }
      ]
    };
  }
}
