/**
 * ============================================================================
 * CTA DETECTOR - UX CONVERSION ANALYSIS
 * ============================================================================
 * 
 * Detects and analyzes call-to-action elements for conversion optimization.
 * Evaluates CTA placement, design, messaging, accessibility, and effectiveness.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis
 */

import { CTA_ACTION_PATTERNS, UX_STANDARDS } from '../config/ux-standards.js';
import { UXAnalysisValidator } from '../core/contracts.js';

/**
 * Call-to-Action Detection and Analysis
 */
export class CTADetector {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 5000,
      includeHidden: config.includeHidden || false,
      analyzeColors: config.analyzeColors !== false,
      testInteractions: config.testInteractions !== false,
      minimumConfidence: config.minimumConfidence || 50,
      ...config
    };
    
    this.standards = UX_STANDARDS.ctas;
    this.results = this._initializeResults();
  }

  /**
   * Main detection and analysis method
   * @param {Object} page - Playwright page object
   * @returns {Promise<Object>} CTA analysis results
   */
  async analyze(page) {
    try {
      // Detect potential CTA elements
      await this._detectCTAElements(page);
      
      // Analyze each CTA
      for (const cta of this.results.elements) {
        await this._analyzeCTA(page, cta);
      }
      
      // Classify CTAs by type and priority
      this._classifyCTAs();
      
      // Analyze overall CTA strategy
      this._analyzeCTAStrategy();
      
      // Calculate scores and generate recommendations
      this._calculateScores();
      this._generateRecommendations();
      
      return this.results;
      
    } catch (error) {
      this.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return this.results;
    }
  }

  /**
   * Initialize results structure
   * @private
   */
  _initializeResults() {
    return {
      detected: false,
      elements: [],
      
      // CTA categories
      categories: {
        primary: [],
        secondary: [],
        navigation: [],
        social: [],
        download: [],
        contact: [],
        other: []
      },
      
      // Analysis summary
      analysis: {
        totalCTAs: 0,
        aboveFoldCTAs: 0,
        primaryCTAs: 0,
        hasActionWords: 0,
        contrastCompliant: 0,
        mobileOptimized: 0,
        accessibilityCompliant: 0
      },
      
      // Strategy insights
      strategy: {
        ctaHierarchy: 'unclear',
        conversionFocus: 'unclear',
        placementStrategy: 'unclear',
        messagingConsistency: 0,
        visualHierarchy: 0
      },
      
      // Conversion insights
      conversion: {
        highValueCTAs: [],
        improvementOpportunities: [],
        missingCTAs: [],
        competitiveAnalysis: {}
      },
      
      scores: {
        placement: 0,
        design: 0,
        messaging: 0,
        accessibility: 0,
        overall: 0
      },
      
      recommendations: [],
      errors: [],
      warnings: []
    };
  }

  /**
   * Detect potential CTA elements
   * @private
   */
  async _detectCTAElements(page) {
    try {
      // Define CTA selectors
      const ctaSelectors = [
        'button',
        'input[type="submit"]',
        'input[type="button"]',
        'a[class*="btn"]',
        'a[class*="button"]',
        'a[class*="cta"]',
        'a[class*="call-to-action"]',
        '.btn',
        '.button',
        '.cta',
        '.call-to-action',
        '[data-cta]',
        '[data-action]',
        'a[href*="contact"]',
        'a[href*="signup"]',
        'a[href*="download"]',
        'a[href*="buy"]',
        'a[href*="purchase"]',
        'a[href*="order"]'
      ];

      const potentialCTAs = [];

      // Collect elements from all selectors
      for (const selector of ctaSelectors) {
        try {
          const elements = await page.$$(selector);
          
          for (const element of elements) {
            const ctaData = await this._analyzeCTAElement(page, element);
            if (ctaData && this._isValidCTA(ctaData)) {
              potentialCTAs.push(ctaData);
            }
          }
        } catch (error) {
          this.results.warnings.push(`Selector ${selector} failed: ${error.message}`);
        }
      }

      // Additional detection by text content
      await this._detectCTAsByText(page, potentialCTAs);
      
      // Remove duplicates and sort by confidence
      this.results.elements = this._deduplicateCTAs(potentialCTAs);
      this.results.detected = this.results.elements.length > 0;
      this.results.analysis.totalCTAs = this.results.elements.length;
      
    } catch (error) {
      this.results.errors.push({
        message: `CTA detection failed: ${error.message}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Analyze individual CTA element
   * @private
   */
  async _analyzeCTAElement(page, element) {
    try {
      const boundingBox = await element.boundingBox();
      const isVisible = await element.isVisible();
      
      if (!isVisible || !boundingBox) {
        return null;
      }

      // Get element attributes and computed styles
      const elementData = await page.evaluate(el => {
        const styles = window.getComputedStyle(el);
        
        return {
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim() || '',
          href: el.href || '',
          type: el.type || '',
          className: el.className || '',
          id: el.id || '',
          'aria-label': el.getAttribute('aria-label') || '',
          role: el.getAttribute('role') || '',
          disabled: el.disabled || false,
          
          // Computed styles
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          padding: styles.padding,
          margin: styles.margin,
          border: styles.border,
          borderRadius: styles.borderRadius,
          textTransform: styles.textTransform,
          textDecoration: styles.textDecoration,
          display: styles.display,
          position: styles.position,
          zIndex: styles.zIndex
        };
      }, element);

      // Calculate confidence that this is a CTA
      const confidence = this._calculateCTAConfidence(elementData);
      
      if (confidence < this.config.minimumConfidence) {
        return null;
      }

      // Get placement information
      const placement = await this._getCTAPlacement(page, element, boundingBox);
      
      // Analyze CTA design
      const design = this._analyzeCTADesign(elementData, boundingBox);
      
      // Analyze messaging
      const messaging = this._analyzeCTAMessaging(elementData);
      
      return {
        element,
        boundingBox,
        attributes: elementData,
        confidence,
        placement,
        design,
        messaging,
        category: 'unknown', // Will be determined later
        priority: 'unknown',
        score: 0
      };

    } catch (error) {
      this.results.warnings.push(`Failed to analyze CTA element: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate CTA confidence score
   * @private
   */
  _calculateCTAConfidence(elementData) {
    let confidence = 0;

    // Tag-based scoring
    if (elementData.tagName === 'button') confidence += 30;
    if (elementData.type === 'submit') confidence += 25;
    if (elementData.type === 'button') confidence += 20;

    // Class-based scoring
    const className = elementData.className.toLowerCase();
    if (className.includes('btn') || className.includes('button')) confidence += 25;
    if (className.includes('cta') || className.includes('call-to-action')) confidence += 30;
    if (className.includes('primary') || className.includes('main')) confidence += 15;

    // Text-based scoring
    const text = elementData.text.toLowerCase();
    const actionWords = [...CTA_ACTION_PATTERNS.primary, ...CTA_ACTION_PATTERNS.secondary];
    
    for (const word of actionWords) {
      if (text.includes(word)) {
        if (CTA_ACTION_PATTERNS.primary.includes(word)) {
          confidence += 20;
        } else {
          confidence += 15;
        }
        break; // Only count one action word
      }
    }

    // URL-based scoring for links
    if (elementData.href) {
      const href = elementData.href.toLowerCase();
      if (href.includes('contact') || href.includes('signup') || 
          href.includes('download') || href.includes('buy')) {
        confidence += 15;
      }
    }

    // Design-based scoring
    if (elementData.backgroundColor && elementData.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      confidence += 10;
    }
    if (elementData.padding && !elementData.padding.includes('0px')) {
      confidence += 5;
    }

    // Role-based scoring
    if (elementData.role === 'button') confidence += 15;

    return Math.min(confidence, 100);
  }

  /**
   * Detect CTAs by text content analysis
   * @private
   */
  async _detectCTAsByText(page, existingCTAs) {
    try {
      const textBasedCTAs = await page.$$eval('a, span, div', elements => {
        const actionWords = [
          'get started', 'start free', 'try free', 'sign up', 'register',
          'join now', 'get access', 'download', 'install', 'buy now',
          'purchase', 'order now', 'add to cart', 'checkout', 'subscribe',
          'learn more', 'read more', 'discover', 'explore', 'contact us'
        ];

        return elements
          .map((el, index) => {
            const text = el.textContent?.trim().toLowerCase() || '';
            const rect = el.getBoundingClientRect();
            
            // Check if text contains action words
            const hasActionWord = actionWords.some(word => text.includes(word));
            
            // Check if element looks like a CTA
            const styles = window.getComputedStyle(el);
            const hasCtaStyles = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                               styles.border !== '0px none rgb(0, 0, 0)' ||
                               styles.padding !== '0px';
            
            if (hasActionWord && hasCtaStyles && rect.width > 0 && rect.height > 0) {
              return {
                index,
                text: el.textContent?.trim() || '',
                tagName: el.tagName.toLowerCase(),
                className: el.className || '',
                confidence: hasActionWord ? 60 : 40
              };
            }
            
            return null;
          })
          .filter(Boolean);
      });

      // Add qualified text-based CTAs
      for (const ctaInfo of textBasedCTAs) {
        const elements = await page.$$(`${ctaInfo.tagName}`);
        if (elements[ctaInfo.index]) {
          const ctaData = await this._analyzeCTAElement(page, elements[ctaInfo.index]);
          if (ctaData && !this._isDuplicateCTA(ctaData, existingCTAs)) {
            ctaData.confidence = Math.max(ctaData.confidence, ctaInfo.confidence);
            existingCTAs.push(ctaData);
          }
        }
      }
    } catch (error) {
      this.results.warnings.push(`Text-based CTA detection failed: ${error.message}`);
    }
  }

  /**
   * Check if CTA is duplicate
   * @private
   */
  _isDuplicateCTA(ctaData, existingCTAs) {
    return existingCTAs.some(existing => {
      const box1 = ctaData.boundingBox;
      const box2 = existing.boundingBox;
      
      if (!box1 || !box2) return false;
      
      // Check if same position and size (within 5px tolerance)
      return Math.abs(box1.x - box2.x) < 5 && 
             Math.abs(box1.y - box2.y) < 5 &&
             Math.abs(box1.width - box2.width) < 10 &&
             Math.abs(box1.height - box2.height) < 10;
    });
  }

  /**
   * Remove duplicate CTAs and sort by confidence
   * @private
   */
  _deduplicateCTAs(ctas) {
    const unique = [];
    
    for (const cta of ctas) {
      if (!this._isDuplicateCTA(cta, unique)) {
        unique.push(cta);
      }
    }
    
    return unique.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get CTA placement information
   * @private
   */
  async _getCTAPlacement(page, element, boundingBox) {
    const viewport = await page.viewportSize();
    
    const placement = {
      position: {
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height
      },
      viewport: {
        width: viewport.width,
        height: viewport.height
      },
      location: {
        isAboveFold: boundingBox.y + boundingBox.height < viewport.height,
        isInHeader: boundingBox.y < viewport.height * 0.2,
        isInFooter: boundingBox.y > viewport.height * 0.8,
        isCentered: Math.abs((boundingBox.x + boundingBox.width/2) - viewport.width/2) < viewport.width * 0.1,
        isRightAligned: boundingBox.x > viewport.width * 0.7,
        isLeftAligned: boundingBox.x < viewport.width * 0.3
      },
      context: await this._getCTAContext(page, element)
    };

    return placement;
  }

  /**
   * Get CTA context information
   * @private
   */
  async _getCTAContext(page, element) {
    try {
      return await page.evaluate(el => {
        const context = {
          nearbyHeadings: [],
          containerType: 'unknown',
          siblingCTAs: 0,
          isInForm: false,
          isInNav: false,
          isInModal: false
        };

        // Check if in form
        context.isInForm = Boolean(el.closest('form'));
        
        // Check if in navigation
        context.isInNav = Boolean(el.closest('nav, .nav, .navigation, header, .header'));
        
        // Check if in modal
        context.isInModal = Boolean(el.closest('.modal, .popup, .dialog, .overlay'));
        
        // Get nearby headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const elRect = el.getBoundingClientRect();
        
        headings.forEach(heading => {
          const headingRect = heading.getBoundingClientRect();
          const distance = Math.abs(headingRect.bottom - elRect.top);
          
          if (distance < 150) { // Within 150px
            context.nearbyHeadings.push({
              text: heading.textContent.trim(),
              tag: heading.tagName.toLowerCase(),
              distance
            });
          }
        });

        // Sort headings by distance
        context.nearbyHeadings.sort((a, b) => a.distance - b.distance);

        // Count sibling CTAs
        const parent = el.parentElement;
        if (parent) {
          const siblings = parent.children;
          for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling !== el && 
                (sibling.tagName === 'BUTTON' || 
                 sibling.tagName === 'A' && sibling.className.includes('btn'))) {
              context.siblingCTAs++;
            }
          }
        }

        // Determine container type
        const containerEl = el.closest('section, article, aside, main, div[class*="hero"], div[class*="banner"]');
        if (containerEl) {
          const containerClass = containerEl.className.toLowerCase();
          if (containerClass.includes('hero')) context.containerType = 'hero';
          else if (containerClass.includes('banner')) context.containerType = 'banner';
          else if (containerEl.tagName === 'SECTION') context.containerType = 'section';
          else if (containerEl.tagName === 'ARTICLE') context.containerType = 'article';
        }

        return context;
      }, element);
    } catch {
      return {
        nearbyHeadings: [],
        containerType: 'unknown',
        siblingCTAs: 0,
        isInForm: false,
        isInNav: false,
        isInModal: false
      };
    }
  }

  /**
   * Analyze CTA design
   * @private
   */
  _analyzeCTADesign(elementData, boundingBox) {
    const design = {
      size: {
        width: boundingBox.width,
        height: boundingBox.height,
        isTouchFriendly: boundingBox.width >= 44 && boundingBox.height >= 44
      },
      colors: {
        backgroundColor: elementData.backgroundColor,
        textColor: elementData.color,
        hasContrast: false,
        contrastRatio: 0
      },
      typography: {
        fontSize: elementData.fontSize,
        fontWeight: elementData.fontWeight,
        textTransform: elementData.textTransform,
        isReadable: false
      },
      visual: {
        hasPadding: !elementData.padding.includes('0px'),
        hasBorder: elementData.border !== '0px none rgb(0, 0, 0)',
        hasBackground: elementData.backgroundColor !== 'rgba(0, 0, 0, 0)',
        borderRadius: elementData.borderRadius,
        visualWeight: 0
      }
    };

    // Calculate contrast ratio (simplified)
    design.colors.contrastRatio = this._calculateContrastRatio(
      elementData.backgroundColor,
      elementData.color
    );
    design.colors.hasContrast = design.colors.contrastRatio >= this.standards.minimumContrastRatio;

    // Typography analysis
    const fontSize = parseInt(elementData.fontSize) || 14;
    design.typography.isReadable = fontSize >= 14;

    // Calculate visual weight
    design.visual.visualWeight = this._calculateVisualWeight(elementData, boundingBox);

    return design;
  }

  /**
   * Calculate simplified contrast ratio
   * @private
   */
  _calculateContrastRatio(backgroundColor, textColor) {
    // This is a simplified calculation
    // In production, you'd want a more accurate color contrast calculation
    
    const getBrightness = (color) => {
      if (!color || color === 'rgba(0, 0, 0, 0)') return 128;
      
      // Extract RGB values (simplified)
      const match = color.match(/\d+/g);
      if (!match || match.length < 3) return 128;
      
      const [r, g, b] = match.map(Number);
      return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const bgBrightness = getBrightness(backgroundColor);
    const textBrightness = getBrightness(textColor);
    
    const lighter = Math.max(bgBrightness, textBrightness);
    const darker = Math.min(bgBrightness, textBrightness);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate visual weight of CTA
   * @private
   */
  _calculateVisualWeight(elementData, boundingBox) {
    let weight = 0;

    // Size weight
    weight += Math.min(boundingBox.width * boundingBox.height / 1000, 50);

    // Color weight
    if (elementData.backgroundColor !== 'rgba(0, 0, 0, 0)') weight += 20;

    // Border weight
    if (elementData.border !== '0px none rgb(0, 0, 0)') weight += 10;

    // Font weight
    const fontWeight = parseInt(elementData.fontWeight) || 400;
    if (fontWeight >= 600) weight += 15;

    // Padding weight
    if (!elementData.padding.includes('0px')) weight += 10;

    return Math.min(weight, 100);
  }

  /**
   * Analyze CTA messaging
   * @private
   */
  _analyzeCTAMessaging(elementData) {
    const text = elementData.text.toLowerCase();
    const ariaLabel = elementData['aria-label'].toLowerCase();
    const fullText = (text + ' ' + ariaLabel).trim();

    const messaging = {
      text: elementData.text,
      wordCount: elementData.text.split(/\s+/).length,
      hasActionWord: false,
      actionType: 'none',
      urgency: 'none',
      clarity: 0,
      persuasion: 0,
      isPersonalized: false,
      hasValueProposition: false
    };

    // Check for action words
    for (const [category, words] of Object.entries(CTA_ACTION_PATTERNS)) {
      for (const word of words) {
        if (fullText.includes(word)) {
          messaging.hasActionWord = true;
          messaging.actionType = category;
          break;
        }
      }
      if (messaging.hasActionWord) break;
    }

    // Check for urgency indicators
    const urgencyWords = ['now', 'today', 'limited', 'hurry', 'fast', 'quick', 'instant', 'immediate'];
    if (urgencyWords.some(word => fullText.includes(word))) {
      messaging.urgency = 'high';
    }

    // Check for personalization
    const personalWords = ['your', 'my', 'personal', 'custom'];
    messaging.isPersonalized = personalWords.some(word => fullText.includes(word));

    // Check for value proposition
    const valueWords = ['free', 'save', 'discount', 'bonus', 'exclusive', 'premium', 'best'];
    messaging.hasValueProposition = valueWords.some(word => fullText.includes(word));

    // Calculate clarity score
    messaging.clarity = this._calculateMessageClarity(elementData.text);

    // Calculate persuasion score
    messaging.persuasion = this._calculatePersuasionScore(messaging);

    return messaging;
  }

  /**
   * Calculate message clarity score
   * @private
   */
  _calculateMessageClarity(text) {
    let clarity = 50; // Base score

    // Length considerations
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 1 && wordCount <= 3) clarity += 30;
    else if (wordCount <= 5) clarity += 20;
    else if (wordCount > 7) clarity -= 20;

    // Avoid generic terms
    const genericTerms = ['click here', 'read more', 'learn more', 'submit'];
    if (genericTerms.some(term => text.toLowerCase().includes(term))) {
      clarity -= 15;
    }

    // Specific action bonus
    const specificActions = ['download', 'subscribe', 'buy', 'contact', 'join', 'start'];
    if (specificActions.some(action => text.toLowerCase().includes(action))) {
      clarity += 15;
    }

    return Math.max(0, Math.min(100, clarity));
  }

  /**
   * Calculate persuasion score
   * @private
   */
  _calculatePersuasionScore(messaging) {
    let persuasion = 0;

    if (messaging.hasActionWord) persuasion += 25;
    if (messaging.urgency === 'high') persuasion += 20;
    if (messaging.hasValueProposition) persuasion += 20;
    if (messaging.isPersonalized) persuasion += 15;
    if (messaging.clarity > 70) persuasion += 20;

    return Math.min(100, persuasion);
  }

  /**
   * Check if element is valid CTA
   * @private
   */
  _isValidCTA(ctaData) {
    if (!ctaData || !ctaData.boundingBox) return false;
    
    // Must have reasonable confidence
    if (ctaData.confidence < this.config.minimumConfidence) return false;
    
    // Must have visible size
    const box = ctaData.boundingBox;
    if (box.width < 20 || box.height < 15) return false;
    
    // Must have some text content or meaningful aria-label
    const hasText = ctaData.attributes.text.length > 0 || 
                   ctaData.attributes['aria-label'].length > 0;
    
    return hasText;
  }

  /**
   * Analyze individual CTA
   * @private
   */
  async _analyzeCTA(page, cta) {
    try {
      // Calculate individual scores
      cta.scores = {
        placement: this._scorePlacement(cta.placement),
        design: this._scoreDesign(cta.design),
        messaging: this._scoreMessaging(cta.messaging),
        accessibility: this._scoreAccessibility(cta),
        overall: 0
      };

      // Calculate overall score
      cta.scores.overall = Math.round(
        (cta.scores.placement * 0.25) +
        (cta.scores.design * 0.25) +
        (cta.scores.messaging * 0.3) +
        (cta.scores.accessibility * 0.2)
      );

      cta.score = cta.scores.overall;

    } catch (error) {
      this.results.warnings.push(`CTA analysis failed: ${error.message}`);
      cta.score = 0;
    }
  }

  /**
   * Score CTA placement
   * @private
   */
  _scorePlacement(placement) {
    let score = 40; // Base score

    if (placement.location.isAboveFold) score += 30;
    if (placement.location.isInHeader) score += 15;
    if (placement.context.containerType === 'hero') score += 15;
    
    // Penalty for too many sibling CTAs
    if (placement.context.siblingCTAs > 2) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score CTA design
   * @private
   */
  _scoreDesign(design) {
    let score = 30; // Base score

    if (design.size.isTouchFriendly) score += 20;
    if (design.colors.hasContrast) score += 20;
    if (design.visual.hasBackground) score += 10;
    if (design.visual.hasPadding) score += 10;
    if (design.typography.isReadable) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score CTA messaging
   * @private
   */
  _scoreMessaging(messaging) {
    let score = 20; // Base score

    if (messaging.hasActionWord) score += 30;
    score += messaging.clarity * 0.2; // Up to 20 points
    score += messaging.persuasion * 0.3; // Up to 30 points

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score CTA accessibility
   * @private
   */
  _scoreAccessibility(cta) {
    let score = 40; // Base score

    const attrs = cta.attributes;
    
    if (attrs['aria-label'] || attrs.text) score += 20;
    if (cta.design.colors.hasContrast) score += 20;
    if (cta.design.size.isTouchFriendly) score += 20;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Classify CTAs by type and priority
   * @private
   */
  _classifyCTAs() {
    this.results.elements.forEach(cta => {
      cta.category = this._determineCTACategory(cta);
      cta.priority = this._determineCTAPriority(cta);
      
      this.results.categories[cta.category].push(cta);
    });
  }

  /**
   * Determine CTA category
   * @private
   */
  _determineCTACategory(cta) {
    const text = cta.attributes.text.toLowerCase();
    const href = cta.attributes.href.toLowerCase();
    const context = cta.placement.context;

    // Primary action CTAs
    if (CTA_ACTION_PATTERNS.primary.some(word => text.includes(word))) {
      return 'primary';
    }

    // Secondary action CTAs
    if (CTA_ACTION_PATTERNS.secondary.some(word => text.includes(word))) {
      return 'secondary';
    }

    // Navigation CTAs
    if (context.isInNav || CTA_ACTION_PATTERNS.navigation.some(word => text.includes(word))) {
      return 'navigation';
    }

    // Download CTAs
    if (text.includes('download') || href.includes('download')) {
      return 'download';
    }

    // Contact CTAs
    if (text.includes('contact') || href.includes('contact')) {
      return 'contact';
    }

    // Social CTAs
    if (text.includes('share') || text.includes('follow') || 
        href.includes('social') || href.includes('facebook') || 
        href.includes('twitter') || href.includes('linkedin')) {
      return 'social';
    }

    return 'other';
  }

  /**
   * Determine CTA priority
   * @private
   */
  _determineCTAPriority(cta) {
    let priorityScore = 0;

    // Visual weight
    priorityScore += cta.design.visual.visualWeight * 0.3;

    // Placement importance
    if (cta.placement.location.isAboveFold) priorityScore += 30;
    if (cta.placement.location.isInHeader) priorityScore += 20;
    if (cta.placement.context.containerType === 'hero') priorityScore += 25;

    // Message persuasion
    priorityScore += cta.messaging.persuasion * 0.25;

    // Category-based priority
    if (cta.category === 'primary') priorityScore += 25;
    else if (cta.category === 'secondary') priorityScore += 15;
    else if (cta.category === 'navigation') priorityScore -= 10;

    if (priorityScore >= 70) return 'high';
    if (priorityScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Analyze overall CTA strategy
   * @private
   */
  _analyzeCTAStrategy() {
    const strategy = this.results.strategy;
    
    // Analyze CTA hierarchy
    const primaryCTAs = this.results.categories.primary.length;
    const secondaryCTAs = this.results.categories.secondary.length;
    
    if (primaryCTAs === 1 && secondaryCTAs <= 2) {
      strategy.ctaHierarchy = 'clear';
    } else if (primaryCTAs <= 2 && secondaryCTAs <= 3) {
      strategy.ctaHierarchy = 'good';
    } else if (primaryCTAs > 3) {
      strategy.ctaHierarchy = 'confusing';
    } else {
      strategy.ctaHierarchy = 'unclear';
    }

    // Analyze conversion focus
    if (primaryCTAs > 0) {
      const primaryTypes = this.results.categories.primary.map(cta => cta.messaging.actionType);
      const uniqueTypes = [...new Set(primaryTypes)];
      
      if (uniqueTypes.length === 1) {
        strategy.conversionFocus = 'focused';
      } else if (uniqueTypes.length <= 2) {
        strategy.conversionFocus = 'somewhat focused';
      } else {
        strategy.conversionFocus = 'scattered';
      }
    }

    // Analyze placement strategy
    const aboveFoldCTAs = this.results.elements.filter(cta => 
      cta.placement.location.isAboveFold).length;
    
    if (aboveFoldCTAs >= 1 && aboveFoldCTAs <= 3) {
      strategy.placementStrategy = 'strategic';
    } else if (aboveFoldCTAs === 0) {
      strategy.placementStrategy = 'hidden';
    } else {
      strategy.placementStrategy = 'overwhelming';
    }

    // Calculate messaging consistency
    const messages = this.results.elements.map(cta => cta.messaging.actionType);
    const uniqueMessages = [...new Set(messages)];
    strategy.messagingConsistency = Math.round(
      (1 - (uniqueMessages.length - 1) / Math.max(messages.length, 1)) * 100
    );

    // Calculate visual hierarchy
    const visualWeights = this.results.elements.map(cta => cta.design.visual.visualWeight);
    const weightVariance = this._calculateVariance(visualWeights);
    strategy.visualHierarchy = Math.max(0, 100 - weightVariance);
  }

  /**
   * Calculate variance for visual hierarchy
   * @private
   */
  _calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    
    return variance;
  }

  /**
   * Calculate scores
   * @private
   */
  _calculateScores() {
    if (this.results.elements.length === 0) {
      this.results.scores = {
        placement: 0,
        design: 0,
        messaging: 0,
        accessibility: 0,
        overall: 0
      };
      return;
    }

    // Calculate average scores
    const elements = this.results.elements;
    
    this.results.scores.placement = Math.round(
      elements.reduce((sum, cta) => sum + cta.scores.placement, 0) / elements.length
    );
    
    this.results.scores.design = Math.round(
      elements.reduce((sum, cta) => sum + cta.scores.design, 0) / elements.length
    );
    
    this.results.scores.messaging = Math.round(
      elements.reduce((sum, cta) => sum + cta.scores.messaging, 0) / elements.length
    );
    
    this.results.scores.accessibility = Math.round(
      elements.reduce((sum, cta) => sum + cta.scores.accessibility, 0) / elements.length
    );
    
    this.results.scores.overall = Math.round(
      (this.results.scores.placement * 0.25) +
      (this.results.scores.design * 0.25) +
      (this.results.scores.messaging * 0.3) +
      (this.results.scores.accessibility * 0.2)
    );

    // Update analysis summary
    this._updateAnalysisSummary();
  }

  /**
   * Update analysis summary
   * @private
   */
  _updateAnalysisSummary() {
    const analysis = this.results.analysis;
    
    analysis.totalCTAs = this.results.elements.length;
    analysis.aboveFoldCTAs = this.results.elements.filter(cta => 
      cta.placement.location.isAboveFold).length;
    analysis.primaryCTAs = this.results.categories.primary.length;
    analysis.hasActionWords = this.results.elements.filter(cta => 
      cta.messaging.hasActionWord).length;
    analysis.contrastCompliant = this.results.elements.filter(cta => 
      cta.design.colors.hasContrast).length;
    analysis.mobileOptimized = this.results.elements.filter(cta => 
      cta.design.size.isTouchFriendly).length;
    analysis.accessibilityCompliant = this.results.elements.filter(cta => 
      cta.scores.accessibility >= 70).length;
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations() {
    if (this.results.elements.length === 0) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'Missing CTAs',
        title: 'Add Call-to-Action Elements',
        description: 'No CTAs detected - add primary conversion elements',
        details: 'Every page should have at least one clear call-to-action to guide users toward desired actions.',
        effort: 'medium'
      });
      return;
    }

    // Strategy-based recommendations
    this._addStrategyRecommendations();

    // Score-based recommendations
    if (this.results.scores.placement < 70) {
      this._addPlacementRecommendations();
    }

    if (this.results.scores.design < 70) {
      this._addDesignRecommendations();
    }

    if (this.results.scores.messaging < 70) {
      this._addMessagingRecommendations();
    }

    if (this.results.scores.accessibility < 70) {
      this._addAccessibilityRecommendations();
    }
  }

  /**
   * Add strategy recommendations
   * @private
   */
  _addStrategyRecommendations() {
    const strategy = this.results.strategy;

    if (strategy.ctaHierarchy === 'confusing') {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'CTA Strategy',
        title: 'Clarify CTA Hierarchy',
        description: 'Too many primary CTAs create confusion',
        details: 'Limit primary CTAs to 1-2 per page and use visual hierarchy to guide user attention.',
        effort: 'medium'
      });
    }

    if (strategy.conversionFocus === 'scattered') {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'CTA Strategy',
        title: 'Focus Conversion Strategy',
        description: 'CTAs have conflicting goals and messages',
        details: 'Align all CTAs toward a primary conversion goal for better user experience and higher conversion rates.',
        effort: 'medium'
      });
    }

    if (strategy.placementStrategy === 'hidden') {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'CTA Placement',
        title: 'Add Above-Fold CTAs',
        description: 'No CTAs visible above the fold',
        details: 'Users should see at least one clear CTA without scrolling to understand what action they can take.',
        effort: 'low'
      });
    }
  }

  /**
   * Add placement recommendations
   * @private
   */
  _addPlacementRecommendations() {
    this.results.recommendations.push({
      priority: 'medium',
      impact: 'medium',
      category: 'CTA Placement',
      title: 'Improve CTA Placement',
      description: 'CTAs could be positioned more strategically',
      details: 'Consider moving important CTAs above the fold and ensuring they\'re in logical locations within the user journey.',
      effort: 'medium'
    });
  }

  /**
   * Add design recommendations
   * @private
   */
  _addDesignRecommendations() {
    const poorContrast = this.results.elements.filter(cta => 
      !cta.design.colors.hasContrast).length;

    if (poorContrast > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'CTA Design',
        title: 'Improve Color Contrast',
        description: `${poorContrast} CTA(s) don't meet contrast requirements`,
        details: 'Ensure CTAs have sufficient color contrast (4.5:1 minimum) for accessibility and visibility.',
        effort: 'low'
      });
    }

    const notTouchFriendly = this.results.elements.filter(cta => 
      !cta.design.size.isTouchFriendly).length;

    if (notTouchFriendly > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'CTA Design',
        title: 'Increase CTA Size',
        description: `${notTouchFriendly} CTA(s) are too small for mobile users`,
        details: 'CTAs should be at least 44x44 pixels for comfortable touch interaction on mobile devices.',
        effort: 'low'
      });
    }
  }

  /**
   * Add messaging recommendations
   * @private
   */
  _addMessagingRecommendations() {
    const noActionWords = this.results.elements.filter(cta => 
      !cta.messaging.hasActionWord).length;

    if (noActionWords > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'CTA Messaging',
        title: 'Use Action-Oriented Language',
        description: `${noActionWords} CTA(s) lack clear action words`,
        details: 'Use specific action verbs like "Download", "Subscribe", "Get Started" instead of generic terms like "Click Here".',
        effort: 'low'
      });
    }

    const lowClarity = this.results.elements.filter(cta => 
      cta.messaging.clarity < 60).length;

    if (lowClarity > 0) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'medium',
        category: 'CTA Messaging',
        title: 'Improve Message Clarity',
        description: `${lowClarity} CTA(s) have unclear messaging`,
        details: 'Make CTA text more specific and descriptive of the action users will take.',
        effort: 'low'
      });
    }
  }

  /**
   * Add accessibility recommendations
   * @private
   */
  _addAccessibilityRecommendations() {
    this.results.recommendations.push({
      priority: 'medium',
      impact: 'medium',
      category: 'CTA Accessibility',
      title: 'Improve CTA Accessibility',
      description: 'CTAs need better accessibility compliance',
      details: 'Ensure all CTAs have proper labels, sufficient contrast, and are keyboard accessible.',
      effort: 'medium'
    });
  }
}

export default CTADetector;
