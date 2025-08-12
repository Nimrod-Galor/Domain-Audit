/**
 * Interaction Detector - GPT-5 Style Modular Component
 * 
 * Detects and catalogs interactive elements on the page for UX analysis.
 * Pure detection logic without business rules.
 */
export class InteractionDetector {
  constructor(options = {}) {
    this.options = {
      detectButtons: options.detectButtons !== false,
      detectLinks: options.detectLinks !== false,
      detectInputs: options.detectInputs !== false,
      detectHovers: options.detectHovers !== false,
      detectClicks: options.detectClicks !== false,
      analyzeAccessibility: options.analyzeAccessibility !== false,
      ...options
    };
  }

  /**
   * Detect interactive elements in the document
   * @param {Document} document - DOM document
   * @returns {Object} Detection results
   */
  detect(document) {
    const elements = {
      buttons: this.options.detectButtons ? this._detectButtons(document) : [],
      links: this.options.detectLinks ? this._detectLinks(document) : [],
      inputs: this.options.detectInputs ? this._detectInputs(document) : [],
      interactive: this.options.detectClicks ? this._detectClickableElements(document) : [],
      hovers: this.options.detectHovers ? this._detectHoverElements(document) : []
    };

    const analysis = {
      totalInteractiveElements: this._countTotalElements(elements),
      accessibilityFeatures: this.options.analyzeAccessibility ? this._analyzeAccessibility(document) : {},
      interactionPatterns: this._analyzeInteractionPatterns(elements),
      touchOptimization: this._analyzeTouchOptimization(elements)
    };

    return {
      elements,
      analysis,
      metadata: {
        detectTime: Date.now(),
        detectorOptions: this.options
      }
    };
  }

  /**
   * Detect button elements
   */
  _detectButtons(document) {
    const buttons = [];
    
    // Standard button elements
    const buttonElements = document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"]');
    
    buttonElements.forEach((btn, index) => {
      buttons.push({
        id: `btn_${index}`,
        type: this._getButtonType(btn),
        text: this._getElementText(btn),
        visible: this._isElementVisible(btn),
        accessible: this._isElementAccessible(btn),
        size: this._getElementSize(btn),
        position: this._getElementPosition(btn),
        styling: this._getElementStyling(btn),
        attributes: this._getRelevantAttributes(btn)
      });
    });

    // Button-like elements (divs, spans with click handlers)
    const clickableElements = document.querySelectorAll('[onclick], [role="button"], .btn, .button');
    
    clickableElements.forEach((el, index) => {
      if (!el.matches('button, input[type="button"], input[type="submit"], input[type="reset"]')) {
        buttons.push({
          id: `btn_like_${index}`,
          type: 'button-like',
          text: this._getElementText(el),
          visible: this._isElementVisible(el),
          accessible: this._isElementAccessible(el),
          size: this._getElementSize(el),
          position: this._getElementPosition(el),
          styling: this._getElementStyling(el),
          attributes: this._getRelevantAttributes(el)
        });
      }
    });

    return buttons;
  }

  /**
   * Detect link elements
   */
  _detectLinks(document) {
    const links = [];
    const linkElements = document.querySelectorAll('a[href]');
    
    linkElements.forEach((link, index) => {
      links.push({
        id: `link_${index}`,
        href: link.getAttribute('href') || '',
        text: this._getElementText(link),
        type: this._getLinkType(link),
        target: link.getAttribute('target') || '',
        visible: this._isElementVisible(link),
        accessible: this._isElementAccessible(link),
        position: this._getElementPosition(link),
        context: this._getLinkContext(link),
        attributes: this._getRelevantAttributes(link)
      });
    });

    return links;
  }

  /**
   * Detect input elements
   */
  _detectInputs(document) {
    const inputs = [];
    const inputElements = document.querySelectorAll('input, textarea, select');
    
    inputElements.forEach((input, index) => {
      inputs.push({
        id: `input_${index}`,
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || '',
        placeholder: input.placeholder || '',
        label: this._getInputLabel(input),
        required: input.required,
        visible: this._isElementVisible(input),
        accessible: this._isElementAccessible(input),
        validation: this._getInputValidation(input),
        size: this._getElementSize(input),
        attributes: this._getRelevantAttributes(input)
      });
    });

    return inputs;
  }

  /**
   * Detect clickable elements
   */
  _detectClickableElements(document) {
    const clickable = [];
    const clickableSelectors = [
      '[onclick]',
      '[role="button"]',
      '[tabindex]',
      '.clickable',
      '.click',
      '[data-click]',
      '[data-action]'
    ];
    
    const elements = document.querySelectorAll(clickableSelectors.join(','));
    
    elements.forEach((el, index) => {
      clickable.push({
        id: `clickable_${index}`,
        tagName: el.tagName.toLowerCase(),
        text: this._getElementText(el),
        role: el.getAttribute('role') || '',
        tabindex: el.getAttribute('tabindex') || '',
        visible: this._isElementVisible(el),
        accessible: this._isElementAccessible(el),
        attributes: this._getRelevantAttributes(el)
      });
    });

    return clickable;
  }

  /**
   * Detect hover-enabled elements
   */
  _detectHoverElements(document) {
    const hoverable = [];
    const hoverSelectors = [
      '[title]',
      '.hover',
      '.tooltip',
      '[data-tooltip]',
      '.dropdown',
      '.menu-item'
    ];
    
    const elements = document.querySelectorAll(hoverSelectors.join(','));
    
    elements.forEach((el, index) => {
      hoverable.push({
        id: `hover_${index}`,
        tagName: el.tagName.toLowerCase(),
        text: this._getElementText(el),
        title: el.getAttribute('title') || '',
        tooltip: el.getAttribute('data-tooltip') || '',
        visible: this._isElementVisible(el),
        attributes: this._getRelevantAttributes(el)
      });
    });

    return hoverable;
  }

  /**
   * Analyze accessibility features
   */
  _analyzeAccessibility(document) {
    return {
      ariaLabels: document.querySelectorAll('[aria-label]').length,
      ariaDescriptions: document.querySelectorAll('[aria-describedby]').length,
      ariaRoles: document.querySelectorAll('[role]').length,
      tabindexElements: document.querySelectorAll('[tabindex]').length,
      altTexts: document.querySelectorAll('img[alt]').length,
      landmarks: document.querySelectorAll('main, nav, aside, footer, header, section').length,
      skipLinks: document.querySelectorAll('a[href^="#"]:first-child').length,
      focusableElements: document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').length
    };
  }

  /**
   * Analyze interaction patterns
   */
  _analyzeInteractionPatterns(elements) {
    return {
      buttonToLinkRatio: this._calculateRatio(elements.buttons.length, elements.links.length),
      interactionDensity: this._calculateInteractionDensity(elements),
      primaryActions: this._identifyPrimaryActions(elements.buttons),
      secondaryActions: this._identifySecondaryActions(elements.buttons),
      navigationElements: this._countNavigationElements(elements.links),
      formElements: this._countFormElements(elements.inputs)
    };
  }

  /**
   * Analyze touch optimization
   */
  _analyzeTouchOptimization(elements) {
    const touchOptimized = {
      buttons: 0,
      links: 0,
      inputs: 0
    };

    // Check button sizes for touch-friendliness (minimum 44px)
    elements.buttons.forEach(btn => {
      if (btn.size && (btn.size.width >= 44 && btn.size.height >= 44)) {
        touchOptimized.buttons++;
      }
    });

    // Check link touch targets
    elements.links.forEach(link => {
      if (this._isTouchFriendly(link)) {
        touchOptimized.links++;
      }
    });

    // Check input touch optimization
    elements.inputs.forEach(input => {
      if (this._isInputTouchOptimized(input)) {
        touchOptimized.inputs++;
      }
    });

    return {
      touchOptimized,
      totalElements: elements.buttons.length + elements.links.length + elements.inputs.length,
      touchOptimizationScore: this._calculateTouchScore(touchOptimized, elements)
    };
  }

  // Helper methods
  _getButtonType(btn) {
    if (btn.type) return btn.type;
    if (btn.tagName.toLowerCase() === 'button') return 'button';
    return 'unknown';
  }

  _getElementText(el) {
    return el.textContent?.trim() || el.value || el.alt || '';
  }

  _isElementVisible(el) {
    if (!el.offsetParent && el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    const style = window.getComputedStyle ? window.getComputedStyle(el) : el.style;
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  _isElementAccessible(el) {
    const hasAriaLabel = el.getAttribute('aria-label');
    const hasAriaDescribedBy = el.getAttribute('aria-describedby');
    const hasTitle = el.getAttribute('title');
    const hasText = this._getElementText(el);
    
    return !!(hasAriaLabel || hasAriaDescribedBy || hasTitle || hasText);
  }

  _getElementSize(el) {
    try {
      const rect = el.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    } catch (e) {
      return { width: 0, height: 0 };
    }
  }

  _getElementPosition(el) {
    try {
      const rect = el.getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        left: Math.round(rect.left)
      };
    } catch (e) {
      return { top: 0, left: 0 };
    }
  }

  _getElementStyling(el) {
    const style = window.getComputedStyle ? window.getComputedStyle(el) : el.style;
    return {
      backgroundColor: style.backgroundColor || '',
      color: style.color || '',
      fontSize: style.fontSize || '',
      padding: style.padding || '',
      margin: style.margin || '',
      border: style.border || ''
    };
  }

  _getRelevantAttributes(el) {
    const relevantAttrs = ['id', 'class', 'data-*', 'aria-*', 'role', 'tabindex'];
    const attributes = {};
    
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (relevantAttrs.some(pattern => 
        pattern.includes('*') ? attr.name.startsWith(pattern.replace('*', '')) : attr.name === pattern
      )) {
        attributes[attr.name] = attr.value;
      }
    }
    
    return attributes;
  }

  _getLinkType(link) {
    const href = link.getAttribute('href') || '';
    
    if (href.startsWith('#')) return 'anchor';
    if (href.startsWith('mailto:')) return 'email';
    if (href.startsWith('tel:')) return 'phone';
    if (href.startsWith('http')) return 'external';
    if (href.startsWith('/') || href.includes(window.location.hostname)) return 'internal';
    
    return 'unknown';
  }

  _getLinkContext(link) {
    const parent = link.parentElement;
    return {
      parentTag: parent?.tagName.toLowerCase() || '',
      parentClass: parent?.className || '',
      isInNavigation: !!link.closest('nav, .nav, .navigation, .menu'),
      isInFooter: !!link.closest('footer'),
      isInMain: !!link.closest('main, .main, .content')
    };
  }

  _getInputLabel(input) {
    // Check for associated label
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent?.trim() || '';
    }
    
    // Check for wrapping label
    const parentLabel = input.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.trim() || '';
    }
    
    // Check for aria-label
    return input.getAttribute('aria-label') || '';
  }

  _getInputValidation(input) {
    return {
      required: input.required,
      pattern: input.pattern || '',
      min: input.min || '',
      max: input.max || '',
      minLength: input.minLength || 0,
      maxLength: input.maxLength || 0
    };
  }

  _countTotalElements(elements) {
    return Object.values(elements).reduce((total, array) => total + array.length, 0);
  }

  _calculateRatio(a, b) {
    if (b === 0) return a > 0 ? Infinity : 0;
    return Number((a / b).toFixed(2));
  }

  _calculateInteractionDensity(elements) {
    const total = this._countTotalElements(elements);
    // Approximate page size - would be better with actual viewport data
    const estimatedPageArea = 1000; // placeholder
    return Number((total / estimatedPageArea).toFixed(4));
  }

  _identifyPrimaryActions(buttons) {
    return buttons.filter(btn => 
      btn.type === 'submit' || 
      btn.text.toLowerCase().includes('buy') ||
      btn.text.toLowerCase().includes('purchase') ||
      btn.text.toLowerCase().includes('subscribe') ||
      btn.text.toLowerCase().includes('sign up')
    );
  }

  _identifySecondaryActions(buttons) {
    return buttons.filter(btn => 
      btn.type === 'button' &&
      !this._identifyPrimaryActions([btn]).length
    );
  }

  _countNavigationElements(links) {
    return links.filter(link => link.context.isInNavigation).length;
  }

  _countFormElements(inputs) {
    return inputs.filter(input => 
      input.type !== 'hidden' && input.type !== 'button'
    ).length;
  }

  _isTouchFriendly(link) {
    // Check if link has adequate touch target size
    return link.size && link.size.width >= 44 && link.size.height >= 44;
  }

  _isInputTouchOptimized(input) {
    // Check for mobile-optimized input types
    const mobileTypes = ['tel', 'email', 'url', 'number', 'date', 'time'];
    return mobileTypes.includes(input.type) || 
           (input.size && input.size.height >= 44);
  }

  _calculateTouchScore(touchOptimized, elements) {
    const totalOptimized = touchOptimized.buttons + touchOptimized.links + touchOptimized.inputs;
    const totalElements = elements.buttons.length + elements.links.length + elements.inputs.length;
    
    return totalElements > 0 ? Math.round((totalOptimized / totalElements) * 100) : 0;
  }
}
