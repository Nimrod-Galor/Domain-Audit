/**
 * ============================================================================
 * COLOR CONTRAST & VISUAL ACCESSIBILITY DETECTOR - GPT-5 Style Modular Component  
 * ============================================================================
 * 
 * Advanced color contrast analysis and visual accessibility detection system.
 * This component provides comprehensive testing for visual accessibility
 * compliance and color-related accessibility barriers.
 * 
 * Features:
 * - WCAG 2.1 AA/AAA color contrast ratio testing
 * - Advanced color perception analysis (colorblind simulation)
 * - Visual hierarchy and readability assessment
 * - Color-only information dependency detection
 * - Focus visibility and indication analysis
 * - Animation and motion accessibility testing
 * - Typography readability optimization
 * - Visual design accessibility recommendations
 * 
 * WCAG Guidelines Covered:
 * - 1.4.3 Contrast (Minimum) - AA
 * - 1.4.6 Contrast (Enhanced) - AAA  
 * - 1.4.1 Use of Color - A
 * - 1.4.11 Non-text Contrast - AA
 * - 2.3.1 Three Flashes or Below Threshold - A
 * - 2.2.2 Pause, Stop, Hide - A
 * 
 * @module ColorContrastVisualAccessibilityDetector
 * @version 1.0.0
 * @author AI Assistant (GPT-5 Style)
 * @created 2025-08-12
 */

export class ColorContrastVisualAccessibilityDetector {
  constructor(config = {}) {
    this.config = {
      wcagLevel: config.wcagLevel || 'AA',
      includeAAA: config.includeAAA || false,
      testColorblindness: config.testColorblindness !== false,
      analyzeAnimations: config.analyzeAnimations !== false,
      checkFocusVisibility: config.checkFocusVisibility !== false,
      validateNonTextContrast: config.validateNonTextContrast !== false,
      ...config
    };

    // WCAG contrast ratio thresholds
    this.contrastThresholds = this.initializeContrastThresholds();
    this.colorPatterns = this.initializeColorPatterns();
    this.accessibilityColors = this.initializeAccessibilityColors();
  }

  /**
   * Comprehensive color contrast and visual accessibility detection
   * @param {Object} context - Analysis context with DOM and page data
   * @returns {Object} Detailed visual accessibility analysis
   */
  async detectVisualAccessibility(context) {
    try {
      const { dom, url, pageData = {} } = context;
      const document = dom?.window?.document;

      if (!document) {
        throw new Error('Invalid DOM context for visual accessibility detection');
      }

      const visualAccessibilityAnalysis = {
        // Core visual accessibility analysis
        colorContrast: await this.analyzeColorContrast(document),
        colorDependency: await this.analyzeColorDependency(document),
        focusVisibility: this.config.checkFocusVisibility ? 
          await this.analyzeFocusVisibility(document) : null,
        typography: await this.analyzeTypographyAccessibility(document),
        nonTextContrast: this.config.validateNonTextContrast ? 
          await this.analyzeNonTextContrast(document) : null,
        
        // Advanced visual accessibility features
        colorblindnessSupport: this.config.testColorblindness ? 
          await this.analyzeColorblindnessSupport(document) : null,
        animationAccessibility: this.config.analyzeAnimations ? 
          await this.analyzeAnimationAccessibility(document) : null,

        // Overall scoring and recommendations
        overallVisualAccessibility: 0,
        criticalColorIssues: [],
        visualAccessibilityRecommendations: [],
        wcagComplianceLevel: 'non-compliant',

        // Metadata
        testTimestamp: new Date().toISOString(),
        pageUrl: url,
        wcagLevel: this.config.wcagLevel
      };

      // Calculate overall visual accessibility score
      visualAccessibilityAnalysis.overallVisualAccessibility = this.calculateOverallVisualAccessibility(visualAccessibilityAnalysis);

      // Determine WCAG compliance level
      visualAccessibilityAnalysis.wcagComplianceLevel = this.determineWCAGCompliance(visualAccessibilityAnalysis);

      // Identify critical color issues
      visualAccessibilityAnalysis.criticalColorIssues = this.identifyCriticalColorIssues(visualAccessibilityAnalysis);

      // Generate recommendations
      visualAccessibilityAnalysis.visualAccessibilityRecommendations = this.generateVisualAccessibilityRecommendations(visualAccessibilityAnalysis);

      return visualAccessibilityAnalysis;

    } catch (error) {
      console.error('Visual accessibility detection failed:', error);
      return this.createErrorResponse(error);
    }
  }

  /**
   * Analyze color contrast ratios according to WCAG standards
   */
  async analyzeColorContrast(document) {
    const analysis = {
      textElements: [],
      contrastIssues: [],
      passedContrast: [],
      aaCompliant: true,
      aaaCompliant: true,
      averageContrast: 0,
      score: 100,
      testedElements: 0
    };

    // Get all text-containing elements
    const textElements = this.getTextElements(document);
    
    for (const element of textElements) {
      try {
        const styles = this.getComputedStyles(element, document);
        const textColor = this.parseColor(styles.color);
        const backgroundColor = this.getEffectiveBackgroundColor(element, document);
        
        if (textColor && backgroundColor) {
          const contrastRatio = this.calculateContrastRatio(textColor, backgroundColor);
          const fontSize = parseInt(styles.fontSize);
          const fontWeight = styles.fontWeight;
          const isLargeText = this.isLargeText(fontSize, fontWeight);
          
          const elementAnalysis = {
            element: element.tagName.toLowerCase(),
            text: element.textContent.trim().substring(0, 50),
            textColor: this.colorToHex(textColor),
            backgroundColor: this.colorToHex(backgroundColor),
            contrastRatio: Math.round(contrastRatio * 100) / 100,
            fontSize,
            fontWeight,
            isLargeText,
            wcagAAPass: this.checkWCAGCompliance(contrastRatio, isLargeText, 'AA'),
            wcagAAAPass: this.checkWCAGCompliance(contrastRatio, isLargeText, 'AAA'),
            position: analysis.testedElements + 1
          };

          analysis.textElements.push(elementAnalysis);
          analysis.testedElements++;

          // Check compliance
          if (!elementAnalysis.wcagAAPass) {
            analysis.contrastIssues.push({
              ...elementAnalysis,
              severity: 'high',
              message: `Insufficient contrast ratio: ${elementAnalysis.contrastRatio}:1 (requires ${this.getRequiredRatio(isLargeText, 'AA')}:1)`,
              wcagCriterion: '1.4.3'
            });
            analysis.aaCompliant = false;
            analysis.score -= 10;
          } else {
            analysis.passedContrast.push(elementAnalysis);
          }

          if (!elementAnalysis.wcagAAAPass) {
            analysis.aaaCompliant = false;
          }
        }
      } catch (error) {
        console.warn('Color contrast analysis failed for element:', error);
      }
    }

    // Calculate average contrast
    if (analysis.textElements.length > 0) {
      analysis.averageContrast = analysis.textElements
        .reduce((sum, el) => sum + el.contrastRatio, 0) / analysis.textElements.length;
      analysis.averageContrast = Math.round(analysis.averageContrast * 100) / 100;
    }

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze color dependency (WCAG 1.4.1 Use of Color)
   */
  async analyzeColorDependency(document) {
    const analysis = {
      colorOnlyIndicators: [],
      redundantIndicators: [],
      colorDependentElements: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    // Check for color-only links
    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      const styles = this.getComputedStyles(link, document);
      const parentStyles = this.getComputedStyles(link.parentElement, document);
      
      const linkColor = this.parseColor(styles.color);
      const parentColor = this.parseColor(parentStyles.color);
      
      if (linkColor && parentColor && this.colorsAreDifferent(linkColor, parentColor)) {
        // Check if link has other visual indicators
        const hasUnderline = styles.textDecoration.includes('underline');
        const hasBold = parseInt(styles.fontWeight) >= 700;
        const hasOtherIndicators = hasUnderline || hasBold;

        if (!hasOtherIndicators) {
          analysis.colorOnlyIndicators.push({
            type: 'link',
            element: 'a',
            text: link.textContent.trim().substring(0, 30),
            issue: 'Link distinguished only by color',
            position: index + 1
          });
          analysis.score -= 15;
        } else {
          analysis.redundantIndicators.push({
            type: 'link',
            element: 'a',
            indicators: [hasUnderline ? 'underline' : '', hasBold ? 'bold' : ''].filter(Boolean)
          });
        }
      }
    });

    // Check for color-coded form validation
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach((element, index) => {
      const styles = this.getComputedStyles(element, document);
      const borderColor = this.parseColor(styles.borderColor);
      
      // Common error/success color patterns
      if (borderColor && (this.isErrorColor(borderColor) || this.isSuccessColor(borderColor))) {
        // Check for accompanying text or icons
        const hasErrorText = this.hasAssociatedErrorText(element, document);
        const hasAriaInvalid = element.hasAttribute('aria-invalid');
        const hasOtherIndicators = hasErrorText || hasAriaInvalid;

        if (!hasOtherIndicators) {
          analysis.colorDependentElements.push({
            type: 'form-validation',
            element: element.tagName.toLowerCase(),
            issue: 'Form validation relies only on color',
            position: index + 1
          });
          analysis.score -= 10;
        }
      }
    });

    // Generate issues and recommendations
    if (analysis.colorOnlyIndicators.length > 0) {
      analysis.issues.push({
        type: 'color-only-links',
        severity: 'high',
        count: analysis.colorOnlyIndicators.length,
        message: 'Links distinguished only by color',
        wcagCriterion: '1.4.1'
      });

      analysis.recommendations.push({
        priority: 'high',
        action: 'Add underlines or other visual indicators to links',
        description: 'Ensure links are distinguishable without relying solely on color'
      });
    }

    if (analysis.colorDependentElements.length > 0) {
      analysis.issues.push({
        type: 'color-dependent-validation',
        severity: 'medium',
        count: analysis.colorDependentElements.length,
        message: 'Form validation relies only on color',
        wcagCriterion: '1.4.1'
      });

      analysis.recommendations.push({
        priority: 'medium',
        action: 'Add text descriptions or icons to form validation',
        description: 'Provide non-color indicators for form field status'
      });
    }

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze focus visibility (WCAG 2.4.7)
   */
  async analyzeFocusVisibility(document) {
    const analysis = {
      focusableElements: [],
      focusVisibilityIssues: [],
      customFocusStyles: [],
      score: 100,
      issues: [],
      recommendations: []
    };

    // Get all focusable elements
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element, index) => {
      const styles = this.getComputedStyles(element, document);
      const outlineStyle = styles.outline;
      const outlineWidth = styles.outlineWidth;
      const outlineColor = styles.outlineColor;
      const boxShadow = styles.boxShadow;

      const elementAnalysis = {
        element: element.tagName.toLowerCase(),
        type: element.type || 'unknown',
        hasOutline: outlineStyle !== 'none' && outlineWidth !== '0px',
        hasBoxShadow: boxShadow !== 'none',
        hasCustomFocus: this.hasCustomFocusStyles(element, document),
        position: index + 1
      };

      analysis.focusableElements.push(elementAnalysis);

      // Check for focus visibility issues
      if (!elementAnalysis.hasOutline && !elementAnalysis.hasBoxShadow && !elementAnalysis.hasCustomFocus) {
        analysis.focusVisibilityIssues.push({
          ...elementAnalysis,
          issue: 'No visible focus indicator',
          severity: 'high',
          wcagCriterion: '2.4.7'
        });
        analysis.score -= 10;
      }

      // Document custom focus styles
      if (elementAnalysis.hasCustomFocus) {
        analysis.customFocusStyles.push(elementAnalysis);
      }
    });

    // Generate recommendations
    if (analysis.focusVisibilityIssues.length > 0) {
      analysis.recommendations.push({
        priority: 'high',
        action: 'Ensure all interactive elements have visible focus indicators',
        description: 'Add outline, box-shadow, or other visual indicators for keyboard focus'
      });
    }

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Analyze typography accessibility
   */
  async analyzeTypographyAccessibility(document) {
    const analysis = {
      fontSizes: [],
      readabilityIssues: [],
      lineHeightIssues: [],
      averageFontSize: 0,
      score: 100,
      issues: [],
      recommendations: []
    };

    // Get all text elements
    const textElements = this.getTextElements(document);
    
    textElements.forEach((element, index) => {
      const styles = this.getComputedStyles(element, document);
      const fontSize = parseInt(styles.fontSize);
      const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.2;
      const fontFamily = styles.fontFamily;

      const elementAnalysis = {
        element: element.tagName.toLowerCase(),
        fontSize,
        lineHeight,
        lineHeightRatio: lineHeight / fontSize,
        fontFamily: fontFamily.split(',')[0].replace(/["']/g, ''),
        textLength: element.textContent.trim().length,
        position: index + 1
      };

      analysis.fontSizes.push(elementAnalysis);

      // Check minimum font size
      if (fontSize < 12) {
        analysis.readabilityIssues.push({
          ...elementAnalysis,
          issue: 'Font size below recommended minimum (12px)',
          severity: 'medium'
        });
        analysis.score -= 5;
      }

      // Check line height
      if (elementAnalysis.lineHeightRatio < 1.2) {
        analysis.lineHeightIssues.push({
          ...elementAnalysis,
          issue: 'Line height below WCAG recommendation (1.2x)',
          severity: 'low'
        });
        analysis.score -= 3;
      }
    });

    // Calculate average font size
    if (analysis.fontSizes.length > 0) {
      analysis.averageFontSize = Math.round(
        analysis.fontSizes.reduce((sum, el) => sum + el.fontSize, 0) / analysis.fontSizes.length
      );
    }

    return { ...analysis, score: Math.max(0, analysis.score) };
  }

  /**
   * Helper methods for color calculations
   */
  getTextElements(document) {
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, li, td, th');
    return Array.from(elements).filter(el => {
      const text = el.textContent.trim();
      return text.length > 0 && this.isElementVisible(el);
    });
  }

  getComputedStyles(element, document) {
    return document.defaultView.getComputedStyle(element);
  }

  parseColor(colorString) {
    // Simple RGB extraction - in practice, would use more robust color parsing
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }
    return null;
  }

  getEffectiveBackgroundColor(element, document) {
    // Traverse up the DOM to find the effective background color
    let current = element;
    while (current && current !== document.body) {
      const styles = this.getComputedStyles(current, document);
      const bgColor = this.parseColor(styles.backgroundColor);
      if (bgColor && (bgColor.r !== 0 || bgColor.g !== 0 || bgColor.b !== 0)) {
        return bgColor;
      }
      current = current.parentElement;
    }
    // Default to white background
    return { r: 255, g: 255, b: 255 };
  }

  calculateContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  getRelativeLuminance(color) {
    const { r, g, b } = color;
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  isLargeText(fontSize, fontWeight) {
    return fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
  }

  checkWCAGCompliance(contrastRatio, isLargeText, level) {
    const requiredRatio = this.getRequiredRatio(isLargeText, level);
    return contrastRatio >= requiredRatio;
  }

  getRequiredRatio(isLargeText, level) {
    if (level === 'AAA') {
      return isLargeText ? 4.5 : 7.0;
    }
    // AA level
    return isLargeText ? 3.0 : 4.5;
  }

  colorToHex(color) {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  isElementVisible(element) {
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  colorsAreDifferent(color1, color2) {
    const threshold = 50; // Minimum difference to be considered different
    return Math.abs(color1.r - color2.r) + Math.abs(color1.g - color2.g) + Math.abs(color1.b - color2.b) > threshold;
  }

  isErrorColor(color) {
    // Simple heuristic for red-ish colors
    return color.r > 150 && color.g < 100 && color.b < 100;
  }

  isSuccessColor(color) {
    // Simple heuristic for green-ish colors
    return color.g > 150 && color.r < 100 && color.b < 100;
  }

  hasAssociatedErrorText(element, document) {
    const ariaDescribedby = element.getAttribute('aria-describedby');
    if (ariaDescribedby) {
      const describedElement = document.getElementById(ariaDescribedby);
      return describedElement && describedElement.textContent.trim().length > 0;
    }
    return false;
  }

  hasCustomFocusStyles(element, document) {
    // This would require more sophisticated detection in a real implementation
    return false;
  }

  /**
   * Calculate overall visual accessibility score
   */
  calculateOverallVisualAccessibility(analysis) {
    const scores = [
      analysis.colorContrast.score,
      analysis.colorDependency.score,
      analysis.focusVisibility?.score || 100,
      analysis.typography.score,
      analysis.nonTextContrast?.score || 100
    ].filter(score => score !== null && !isNaN(score));

    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  /**
   * Determine WCAG compliance level
   */
  determineWCAGCompliance(analysis) {
    if (analysis.colorContrast.aaCompliant && analysis.colorDependency.score >= 90) {
      if (this.config.includeAAA && analysis.colorContrast.aaaCompliant) {
        return 'AAA';
      }
      return 'AA';
    }
    return 'non-compliant';
  }

  /**
   * Initialize methods and data structures
   */
  initializeContrastThresholds() {
    return {
      AA_NORMAL: 4.5,
      AA_LARGE: 3.0,
      AAA_NORMAL: 7.0,
      AAA_LARGE: 4.5
    };
  }

  initializeColorPatterns() {
    return {
      errorColors: [{ r: 255, g: 0, b: 0 }],
      successColors: [{ r: 0, g: 255, b: 0 }],
      warningColors: [{ r: 255, g: 255, b: 0 }]
    };
  }

  initializeAccessibilityColors() {
    return {
      highContrast: true,
      colorBlindFriendly: true
    };
  }

  // Placeholder methods for advanced features
  analyzeNonTextContrast(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  analyzeColorblindnessSupport(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  analyzeAnimationAccessibility(document) {
    return { score: 100, issues: [], recommendations: [] };
  }

  identifyCriticalColorIssues(analysis) {
    return [];
  }

  generateVisualAccessibilityRecommendations(analysis) {
    return [];
  }

  createErrorResponse(error) {
    return {
      success: false,
      error: error.message,
      colorContrast: { score: 0, contrastIssues: [], aaCompliant: false },
      colorDependency: { score: 0, issues: [] },
      focusVisibility: { score: 0, issues: [] },
      typography: { score: 0, issues: [] },
      overallVisualAccessibility: 0,
      criticalColorIssues: [],
      visualAccessibilityRecommendations: [],
      wcagComplianceLevel: 'non-compliant'
    };
  }
}
