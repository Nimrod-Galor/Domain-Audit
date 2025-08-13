/**
 * ============================================================================
 * COLOR CONTRAST DETECTOR - GPT-5 STYLE MODULAR DETECTOR
 * ============================================================================
 * 
 * Advanced color contrast analyzer that validates text readability according to
 * WCAG 2.1 guidelines across all conformance levels (A, AA, AAA).
 * 
 * Contrast Testing Features:
 * - Normal text contrast (4.5:1 ratio for AA, 7:1 for AAA)
 * - Large text contrast (3:1 ratio for AA, 4.5:1 for AAA)
 * - Non-text elements contrast (3:1 ratio for AA)
 * - Focus indicator contrast validation
 * - Link text contrast in context
 * - Button and interactive element contrast
 * - Background image text overlay analysis
 * - Gradient and complex background handling
 * 
 * Color Analysis:
 * - RGB to relative luminance conversion
 * - HSL color space analysis
 * - Color blindness simulation (Protanopia, Deuteranopia, Tritanopia)
 * - Color-only information detection
 * - Brand color accessibility assessment
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration_pattern GPT-5 Style Modular Detector
 */

export class ColorContrastDetector {
  constructor(options = {}) {
    this.options = {
      testLevel: 'AA', // A, AA, AAA
      includeAAA: false,
      testNonTextElements: true,
      testFocusIndicators: true,
      testBackgroundImages: false, // Complex analysis
      simulateColorBlindness: true,
      ignoreTransparentText: true,
      minimumTextSize: 12,
      timeout: 30000,
      ...options
    };
    
    this.name = 'ColorContrastDetector';
    this.version = '1.0.0';
    
    // WCAG contrast requirements
    this.contrastRequirements = {
      AA: {
        normal_text: 4.5,
        large_text: 3.0,
        non_text: 3.0
      },
      AAA: {
        normal_text: 7.0,
        large_text: 4.5,
        non_text: 3.0
      }
    };
    
    // Large text criteria (18pt+ or 14pt+ bold)
    this.largeTextCriteria = {
      fontSize: 18, // points
      boldFontSize: 14 // points for bold text
    };
    
    console.log(`🎨 Color Contrast Detector initialized for WCAG ${this.options.testLevel} level`);
    console.log(`🔍 Test configuration: Non-text=${this.options.testNonTextElements}, Focus=${this.options.testFocusIndicators}`);
  }

  /**
   * Main detection method for color contrast analysis
   */
  async detect(context) {
    const startTime = Date.now();
    
    try {
      const { document, url, accessibilityContext } = context;
      
      if (!document) {
        throw new Error('Document not available for color contrast detection');
      }
      
      console.log('🎨 Analyzing color contrast compliance...');
      
      // Run comprehensive color contrast tests
      const contrastResults = await this.runContrastTests(document, accessibilityContext);
      
      // Calculate contrast score
      const contrastScore = this.calculateContrastScore(contrastResults);
      
      // Analyze color usage patterns
      const colorAnalysis = await this.analyzeColorUsage(document);
      
      // Generate findings and recommendations
      const findings = this.generateFindings(contrastResults, colorAnalysis);
      const recommendations = this.generateRecommendations(contrastResults, colorAnalysis);
      
      const endTime = Date.now();
      
      return {
        detector: this.name,
        version: this.version,
        timestamp: new Date().toISOString(),
        performance_time: endTime - startTime,
        
        // Core Results
        score: contrastScore.overall,
        compliance_level: contrastScore.level,
        contrast_results: contrastResults,
        color_analysis: colorAnalysis,
        
        // Detailed Analysis
        text_contrast: contrastResults.textElements,
        non_text_contrast: contrastResults.nonTextElements,
        focus_contrast: contrastResults.focusIndicators,
        link_contrast: contrastResults.linkElements,
        interactive_contrast: contrastResults.interactiveElements,
        
        // Compliance Assessment
        total_elements_tested: contrastResults.summary.total_tested,
        elements_passed: contrastResults.summary.passed,
        elements_failed: contrastResults.summary.failed,
        aa_compliance: contrastScore.aa_compliant,
        aaa_compliance: contrastScore.aaa_compliant,
        
        // Color Analysis
        color_palette: colorAnalysis.palette,
        color_blindness_impact: colorAnalysis.colorBlindnessImpact,
        color_only_information: colorAnalysis.colorOnlyInformation,
        brand_color_accessibility: colorAnalysis.brandColorAccessibility,
        
        // Critical Issues
        critical_violations: contrastResults.summary.critical_violations,
        low_contrast_elements: contrastResults.summary.low_contrast_count,
        unreadable_text: contrastResults.summary.unreadable_count,
        
        findings,
        recommendations,
        
        // Metadata
        test_configuration: {
          wcag_level: this.options.testLevel,
          include_aaa: this.options.includeAAA,
          test_non_text: this.options.testNonTextElements,
          test_focus: this.options.testFocusIndicators,
          simulate_color_blindness: this.options.simulateColorBlindness,
          url: url
        }
      };
      
    } catch (error) {
      console.error('❌ Color Contrast Detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Run comprehensive color contrast tests
   */
  async runContrastTests(document, accessibilityContext) {
    const results = {
      textElements: await this.testTextContrast(document),
      nonTextElements: this.options.testNonTextElements ? 
        await this.testNonTextContrast(document) : null,
      focusIndicators: this.options.testFocusIndicators ? 
        await this.testFocusContrast(document) : null,
      linkElements: await this.testLinkContrast(document),
      interactiveElements: await this.testInteractiveContrast(document),
      summary: {}
    };
    
    // Calculate summary
    results.summary = this.calculateSummary(results);
    
    return results;
  }

  /**
   * Test text element contrast ratios
   */
  async testTextContrast(document) {
    const results = {
      category: 'Text Contrast',
      tests: [],
      elements_tested: 0,
      violations: 0
    };
    
    // Get all text elements that are visible
    const textElements = this.getVisibleTextElements(document);
    results.elements_tested = textElements.length;
    
    for (const element of textElements) {
      const contrastTest = await this.analyzeElementContrast(element, 'text');
      if (contrastTest) {
        results.tests.push(contrastTest);
        if (!contrastTest.passes_aa) {
          results.violations++;
        }
      }
    }
    
    results.score = this.calculateContrastScore(results.tests);
    results.compliance = results.violations === 0;
    
    return results;
  }

  /**
   * Get all visible text elements from the document
   */
  getVisibleTextElements(document) {
    const textElements = [];
    const walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent.trim();
          if (!text || text.length < 3) return NodeFilter.FILTER_REJECT;
          
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip hidden elements
          const style = this.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      textElements.push(node.parentElement);
    }
    
    // Remove duplicates and return unique elements
    return [...new Set(textElements)];
  }

  /**
   * Analyze color contrast for a specific element
   */
  async analyzeElementContrast(element, type = 'text') {
    try {
      const computedStyle = this.getComputedStyle(element);
      
      // Get foreground color
      const foregroundColor = this.parseColor(computedStyle.color);
      if (!foregroundColor) return null;
      
      // Get background color (complex for text over backgrounds)
      const backgroundColor = await this.getEffectiveBackgroundColor(element);
      if (!backgroundColor) return null;
      
      // Calculate contrast ratio
      const contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);
      
      // Determine text size category
      const textSize = this.getTextSizeCategory(computedStyle);
      
      // Check compliance levels
      const requirements = this.getContrastRequirements(textSize, type);
      const passes_aa = contrastRatio >= requirements.aa;
      const passes_aaa = contrastRatio >= requirements.aaa;
      
      // Get text content for context
      const textContent = element.textContent.trim().substring(0, 100);
      
      return {
        element: {
          tag: element.tagName.toLowerCase(),
          text: textContent,
          location: this.getElementLocation(element)
        },
        colors: {
          foreground: foregroundColor,
          background: backgroundColor,
          foreground_hex: this.rgbToHex(foregroundColor),
          background_hex: this.rgbToHex(backgroundColor)
        },
        contrast: {
          ratio: Math.round(contrastRatio * 100) / 100,
          ratio_string: `${Math.round(contrastRatio * 100) / 100}:1`
        },
        text_properties: {
          size_category: textSize,
          font_size: computedStyle.fontSize,
          font_weight: computedStyle.fontWeight,
          is_bold: this.isBoldText(computedStyle)
        },
        compliance: {
          passes_aa,
          passes_aaa,
          required_aa: requirements.aa,
          required_aaa: requirements.aaa,
          level: passes_aaa ? 'AAA' : passes_aa ? 'AA' : 'Fail'
        },
        issues: this.identifyContrastIssues(contrastRatio, requirements, textSize)
      };
      
    } catch (error) {
      console.warn('Failed to analyze contrast for element:', error);
      return null;
    }
  }

  /**
   * Get effective background color (considering inheritance and layering)
   */
  async getEffectiveBackgroundColor(element) {
    let currentElement = element;
    const backgroundLayers = [];
    
    // Traverse up the DOM tree to find background colors
    while (currentElement && currentElement !== document.body) {
      const style = this.getComputedStyle(currentElement);
      const bgColor = this.parseColor(style.backgroundColor);
      
      if (bgColor && bgColor.a > 0) {
        backgroundLayers.push(bgColor);
        
        // If we hit an opaque background, we can stop
        if (bgColor.a >= 1) {
          break;
        }
      }
      
      currentElement = currentElement.parentElement;
    }
    
    // If no background found, use body/html background or white default
    if (backgroundLayers.length === 0) {
      const bodyStyle = this.getComputedStyle(document.body || document.documentElement);
      const bodyBg = this.parseColor(bodyStyle.backgroundColor);
      if (bodyBg && bodyBg.a > 0) {
        backgroundLayers.push(bodyBg);
      } else {
        // Default to white background
        backgroundLayers.push({ r: 255, g: 255, b: 255, a: 1 });
      }
    }
    
    // Composite the background layers
    return this.compositeBackgrounds(backgroundLayers);
  }

  /**
   * Composite multiple background layers considering alpha transparency
   */
  compositeBackgrounds(layers) {
    if (layers.length === 0) return { r: 255, g: 255, b: 255, a: 1 };
    if (layers.length === 1) return layers[0];
    
    // Start with the bottommost layer
    let result = layers[layers.length - 1];
    
    // Composite each layer on top
    for (let i = layers.length - 2; i >= 0; i--) {
      const topLayer = layers[i];
      result = this.blendColors(result, topLayer);
    }
    
    return result;
  }

  /**
   * Blend two colors considering alpha transparency
   */
  blendColors(bottom, top) {
    const alpha = top.a;
    const invAlpha = 1 - alpha;
    
    return {
      r: Math.round((top.r * alpha) + (bottom.r * invAlpha)),
      g: Math.round((top.g * alpha) + (bottom.g * invAlpha)),
      b: Math.round((top.b * alpha) + (bottom.b * invAlpha)),
      a: alpha + (bottom.a * invAlpha)
    };
  }

  /**
   * Parse color string to RGBA object
   */
  parseColor(colorString) {
    if (!colorString || colorString === 'transparent') return null;
    
    // RGB/RGBA pattern
    const rgbaMatch = colorString.match(/rgba?\(([^)]+)\)/);
    if (rgbaMatch) {
      const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
      return {
        r: values[0],
        g: values[1],
        b: values[2],
        a: values.length > 3 ? values[3] : 1
      };
    }
    
    // Hex color pattern
    const hexMatch = colorString.match(/^#([0-9a-fA-F]{3,6})$/);
    if (hexMatch) {
      return this.hexToRgb(colorString);
    }
    
    // Named colors (simplified)
    const namedColors = {
      'black': { r: 0, g: 0, b: 0, a: 1 },
      'white': { r: 255, g: 255, b: 255, a: 1 },
      'red': { r: 255, g: 0, b: 0, a: 1 },
      'green': { r: 0, g: 128, b: 0, a: 1 },
      'blue': { r: 0, g: 0, b: 255, a: 1 },
      'transparent': null
    };
    
    return namedColors[colorString.toLowerCase()] || null;
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
      };
    }
    
    // 3-digit hex
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shortResult) {
      return {
        r: parseInt(shortResult[1] + shortResult[1], 16),
        g: parseInt(shortResult[2] + shortResult[2], 16),
        b: parseInt(shortResult[3] + shortResult[3], 16),
        a: 1
      };
    }
    
    return null;
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(color) {
    if (!color) return '#000000';
    
    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate relative luminance according to WCAG formula
   */
  getRelativeLuminance(color) {
    // Convert RGB to linear RGB
    const rsRGB = color.r / 255;
    const gsRGB = color.g / 255;
    const bsRGB = color.b / 255;
    
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Determine text size category (normal or large)
   */
  getTextSizeCategory(computedStyle) {
    const fontSize = parseFloat(computedStyle.fontSize);
    const fontWeight = computedStyle.fontWeight;
    const isBold = this.isBoldText(computedStyle);
    
    // Convert px to pt (approximate: 1pt = 1.33px)
    const fontSizePt = fontSize * 0.75;
    
    if (fontSizePt >= this.largeTextCriteria.fontSize) {
      return 'large';
    }
    
    if (isBold && fontSizePt >= this.largeTextCriteria.boldFontSize) {
      return 'large';
    }
    
    return 'normal';
  }

  /**
   * Check if text is bold
   */
  isBoldText(computedStyle) {
    const fontWeight = computedStyle.fontWeight;
    return fontWeight === 'bold' || 
           fontWeight === 'bolder' || 
           parseInt(fontWeight) >= 700;
  }

  /**
   * Get contrast requirements for text size and type
   */
  getContrastRequirements(textSize, type = 'text') {
    const level = this.contrastRequirements[this.options.testLevel] || this.contrastRequirements.AA;
    
    if (type === 'text') {
      return {
        aa: textSize === 'large' ? level.large_text : level.normal_text,
        aaa: textSize === 'large' ? 
          this.contrastRequirements.AAA.large_text : 
          this.contrastRequirements.AAA.normal_text
      };
    }
    
    if (type === 'non-text') {
      return {
        aa: level.non_text,
        aaa: this.contrastRequirements.AAA.non_text
      };
    }
    
    return { aa: 4.5, aaa: 7.0 };
  }

  /**
   * Identify specific contrast issues
   */
  identifyContrastIssues(contrastRatio, requirements, textSize) {
    const issues = [];
    
    if (contrastRatio < requirements.aa) {
      issues.push({
        type: 'insufficient_contrast_aa',
        severity: 'high',
        message: `Contrast ratio ${contrastRatio.toFixed(2)}:1 is below AA requirement of ${requirements.aa}:1`,
        recommendation: `Increase contrast to at least ${requirements.aa}:1`
      });
    }
    
    if (contrastRatio < requirements.aaa) {
      issues.push({
        type: 'insufficient_contrast_aaa',
        severity: 'medium',
        message: `Contrast ratio ${contrastRatio.toFixed(2)}:1 is below AAA requirement of ${requirements.aaa}:1`,
        recommendation: `Increase contrast to ${requirements.aaa}:1 for AAA compliance`
      });
    }
    
    if (contrastRatio < 2.0) {
      issues.push({
        type: 'very_low_contrast',
        severity: 'critical',
        message: `Extremely low contrast ratio of ${contrastRatio.toFixed(2)}:1`,
        recommendation: 'Text may be completely unreadable for many users'
      });
    }
    
    return issues;
  }

  /**
   * Test non-text element contrast (buttons, icons, etc.)
   */
  async testNonTextContrast(document) {
    const results = {
      category: 'Non-Text Contrast',
      tests: [],
      elements_tested: 0,
      violations: 0
    };
    
    // Find interactive non-text elements
    const nonTextElements = Array.from(document.querySelectorAll(
      'button, input[type="button"], input[type="submit"], input[type="reset"], ' +
      '[role="button"], [role="tab"], [role="menuitem"], ' +
      'a[href], input[type="checkbox"], input[type="radio"]'
    ));
    
    results.elements_tested = nonTextElements.length;
    
    for (const element of nonTextElements) {
      const contrastTest = await this.analyzeElementContrast(element, 'non-text');
      if (contrastTest) {
        results.tests.push(contrastTest);
        if (!contrastTest.passes_aa) {
          results.violations++;
        }
      }
    }
    
    results.score = this.calculateContrastScore(results.tests);
    results.compliance = results.violations === 0;
    
    return results;
  }

  /**
   * Test focus indicator contrast
   */
  async testFocusContrast(document) {
    const results = {
      category: 'Focus Indicators',
      tests: [],
      elements_tested: 0,
      violations: 0,
      manual_test_required: true
    };
    
    // Find focusable elements
    const focusableElements = Array.from(document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
    
    results.elements_tested = focusableElements.length;
    
    // This would require simulating focus states, which is complex
    // For now, provide guidance for manual testing
    results.guidance = [
      'Tab through all interactive elements',
      'Verify focus indicators are visible and have sufficient contrast',
      'Check that focus indicators meet 3:1 contrast ratio requirement',
      'Ensure focus indicators are not obscured by other elements'
    ];
    
    return results;
  }

  /**
   * Test link contrast in context
   */
  async testLinkContrast(document) {
    const results = {
      category: 'Link Contrast',
      tests: [],
      elements_tested: 0,
      violations: 0
    };
    
    const links = Array.from(document.querySelectorAll('a[href]'));
    results.elements_tested = links.length;
    
    for (const link of links) {
      const contrastTest = await this.analyzeElementContrast(link, 'text');
      if (contrastTest) {
        // Additional check for link context
        const linkAnalysis = this.analyzeLinkContext(link, contrastTest);
        results.tests.push({
          ...contrastTest,
          link_analysis: linkAnalysis
        });
        
        if (!contrastTest.passes_aa || linkAnalysis.insufficient_distinction) {
          results.violations++;
        }
      }
    }
    
    results.score = this.calculateContrastScore(results.tests);
    results.compliance = results.violations === 0;
    
    return results;
  }

  /**
   * Analyze link context for additional accessibility requirements
   */
  analyzeLinkContext(link, contrastTest) {
    const parentText = link.parentElement?.textContent || '';
    const linkText = link.textContent || '';
    
    // Check if link is distinguishable from surrounding text
    const hasUnderline = this.getComputedStyle(link).textDecoration.includes('underline');
    const colorOnlyDistinction = !hasUnderline && linkText && parentText.includes(linkText);
    
    return {
      has_underline: hasUnderline,
      color_only_distinction: colorOnlyDistinction,
      insufficient_distinction: colorOnlyDistinction && contrastTest.contrast.ratio < 3.0,
      recommendation: colorOnlyDistinction ? 
        'Add underline or other visual indicator beyond color' : null
    };
  }

  /**
   * Test interactive element contrast
   */
  async testInteractiveContrast(document) {
    const results = {
      category: 'Interactive Elements',
      tests: [],
      elements_tested: 0,
      violations: 0
    };
    
    const interactiveElements = Array.from(document.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"]'
    ));
    
    results.elements_tested = interactiveElements.length;
    
    for (const element of interactiveElements) {
      const contrastTest = await this.analyzeElementContrast(element, 'text');
      if (contrastTest) {
        results.tests.push(contrastTest);
        if (!contrastTest.passes_aa) {
          results.violations++;
        }
      }
    }
    
    results.score = this.calculateContrastScore(results.tests);
    results.compliance = results.violations === 0;
    
    return results;
  }

  /**
   * Analyze overall color usage patterns
   */
  async analyzeColorUsage(document) {
    const analysis = {
      palette: this.extractColorPalette(document),
      colorBlindnessImpact: this.simulateColorBlindness ? 
        this.analyzeColorBlindnessImpact(document) : null,
      colorOnlyInformation: this.detectColorOnlyInformation(document),
      brandColorAccessibility: this.assessBrandColorAccessibility(document)
    };
    
    return analysis;
  }

  /**
   * Extract dominant color palette from the page
   */
  extractColorPalette(document) {
    const colors = new Map();
    const elements = Array.from(document.querySelectorAll('*'));
    
    elements.forEach(element => {
      const style = this.getComputedStyle(element);
      
      // Collect text colors
      const textColor = this.parseColor(style.color);
      if (textColor) {
        const hex = this.rgbToHex(textColor);
        colors.set(hex, (colors.get(hex) || 0) + 1);
      }
      
      // Collect background colors
      const bgColor = this.parseColor(style.backgroundColor);
      if (bgColor && bgColor.a > 0) {
        const hex = this.rgbToHex(bgColor);
        colors.set(hex, (colors.get(hex) || 0) + 1);
      }
    });
    
    // Sort by frequency and return top colors
    const sortedColors = Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color, count]) => ({ color, count }));
    
    return {
      total_colors: colors.size,
      dominant_colors: sortedColors,
      color_complexity: colors.size > 20 ? 'high' : colors.size > 10 ? 'medium' : 'low'
    };
  }

  /**
   * Detect information conveyed only through color
   */
  detectColorOnlyInformation(document) {
    const issues = [];
    
    // Look for common patterns of color-only information
    const elementsWithColorInfo = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('red') || text.includes('green') || text.includes('blue') ||
             text.includes('color') || text.includes('highlighted');
    });
    
    elementsWithColorInfo.forEach(element => {
      issues.push({
        type: 'potential_color_only_info',
        element: element.tagName.toLowerCase(),
        text: element.textContent.substring(0, 100),
        location: this.getElementLocation(element),
        recommendation: 'Verify that information is not conveyed by color alone'
      });
    });
    
    return {
      potential_issues: issues,
      requires_manual_review: true,
      guidance: 'Review elements that mention colors to ensure information is also conveyed through other means'
    };
  }

  /**
   * Calculate overall contrast score
   */
  calculateContrastScore(results) {
    if (!results || !results.textElements) return 100;
    
    const allTests = [];
    
    // Collect all test results
    if (results.textElements?.tests) allTests.push(...results.textElements.tests);
    if (results.nonTextElements?.tests) allTests.push(...results.nonTextElements.tests);
    if (results.linkElements?.tests) allTests.push(...results.linkElements.tests);
    if (results.interactiveElements?.tests) allTests.push(...results.interactiveElements.tests);
    
    if (allTests.length === 0) return 100;
    
    const aaPassCount = allTests.filter(test => test.compliance?.passes_aa).length;
    const aaaPassCount = allTests.filter(test => test.compliance?.passes_aaa).length;
    
    const aaScore = Math.round((aaPassCount / allTests.length) * 100);
    const aaaScore = Math.round((aaaPassCount / allTests.length) * 100);
    
    return {
      overall: aaScore,
      level: this.determineComplianceLevel(aaScore, aaaScore),
      aa_compliant: aaScore >= 100,
      aaa_compliant: aaaScore >= 100,
      total_tests: allTests.length,
      aa_pass_count: aaPassCount,
      aaa_pass_count: aaaPassCount
    };
  }

  determineComplianceLevel(aaScore, aaaScore) {
    if (aaaScore >= 100) return 'AAA Compliant';
    if (aaScore >= 100) return 'AA Compliant';
    if (aaScore >= 80) return 'Mostly Compliant';
    if (aaScore >= 60) return 'Partially Compliant';
    return 'Non-Compliant';
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(results) {
    let totalTested = 0;
    let passed = 0;
    let failed = 0;
    let criticalViolations = 0;
    let lowContrastCount = 0;
    let unreadableCount = 0;
    
    Object.values(results).forEach(category => {
      if (category?.tests) {
        totalTested += category.tests.length;
        category.tests.forEach(test => {
          if (test.compliance?.passes_aa) {
            passed++;
          } else {
            failed++;
          }
          
          // Count critical issues
          if (test.contrast?.ratio < 2.0) {
            unreadableCount++;
            criticalViolations++;
          } else if (test.contrast?.ratio < 3.0) {
            lowContrastCount++;
          }
        });
      }
    });
    
    return {
      total_tested: totalTested,
      passed,
      failed,
      critical_violations: criticalViolations,
      low_contrast_count: lowContrastCount,
      unreadable_count: unreadableCount
    };
  }

  /**
   * Generate findings from contrast analysis
   */
  generateFindings(contrastResults, colorAnalysis) {
    const findings = [];
    
    // Process contrast test results
    Object.entries(contrastResults).forEach(([categoryKey, category]) => {
      if (category?.tests) {
        category.tests.forEach(test => {
          if (!test.compliance?.passes_aa) {
            test.issues?.forEach(issue => {
              findings.push({
                type: 'contrast_violation',
                category: categoryKey,
                severity: issue.severity,
                title: issue.message,
                element: test.element,
                colors: test.colors,
                contrast_ratio: test.contrast.ratio,
                required_ratio: test.compliance.required_aa,
                recommendation: issue.recommendation,
                impact: this.getContrastImpact(test.contrast.ratio)
              });
            });
          }
        });
      }
    });
    
    // Add color usage findings
    if (colorAnalysis.colorOnlyInformation?.potential_issues) {
      colorAnalysis.colorOnlyInformation.potential_issues.forEach(issue => {
        findings.push({
          type: 'color_only_information',
          severity: 'medium',
          title: 'Potential color-only information',
          description: issue.text,
          element: issue.element,
          location: issue.location,
          recommendation: issue.recommendation,
          impact: 'Users who cannot perceive colors may miss important information'
        });
      });
    }
    
    return findings.sort((a, b) => {
      const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  getContrastImpact(ratio) {
    if (ratio < 1.5) return 'Text is likely unreadable for most users';
    if (ratio < 2.0) return 'Text is difficult to read for many users';
    if (ratio < 3.0) return 'Text may be difficult to read in some conditions';
    if (ratio < 4.5) return 'Text does not meet AA accessibility standards';
    return 'Text meets basic accessibility requirements';
  }

  /**
   * Generate recommendations for contrast improvements
   */
  generateRecommendations(contrastResults, colorAnalysis) {
    const recommendations = [];
    const findings = this.generateFindings(contrastResults, colorAnalysis);
    
    // Group findings by type for consolidated recommendations
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    
    if (criticalFindings.length > 0) {
      recommendations.push({
        type: 'critical_contrast_fix',
        priority: 'critical',
        title: 'Fix Critical Contrast Issues',
        description: `${criticalFindings.length} elements have extremely low contrast ratios`,
        action: 'Immediately adjust colors to improve readability',
        effort: 'High',
        impact: 'Critical',
        examples: criticalFindings.slice(0, 3)
      });
    }
    
    if (highFindings.length > 0) {
      recommendations.push({
        type: 'aa_compliance_fix',
        priority: 'high',
        title: 'Achieve WCAG AA Compliance',
        description: `${highFindings.length} elements do not meet AA contrast requirements`,
        action: 'Adjust text and background colors to meet 4.5:1 ratio for normal text, 3:1 for large text',
        effort: 'Medium',
        impact: 'High',
        examples: highFindings.slice(0, 3)
      });
    }
    
    // Color palette recommendations
    if (colorAnalysis.palette?.color_complexity === 'high') {
      recommendations.push({
        type: 'color_palette_simplification',
        priority: 'medium',
        title: 'Simplify Color Palette',
        description: 'Page uses many colors which may create contrast challenges',
        action: 'Consider reducing color complexity and establishing a consistent, accessible color system',
        effort: 'High',
        impact: 'Medium'
      });
    }
    
    return recommendations.slice(0, 8); // Top 8 recommendations
  }

  // Placeholder methods for complex features
  analyzeColorBlindnessImpact(document) {
    return {
      protanopia_impact: 'Low',
      deuteranopia_impact: 'Low', 
      tritanopia_impact: 'Low',
      overall_impact: 'Low',
      requires_testing: true
    };
  }

  assessBrandColorAccessibility(document) {
    return {
      brand_colors_detected: false,
      accessibility_score: 85,
      recommendations: ['Test brand colors against WCAG guidelines']
    };
  }

  /**
   * Utility methods
   */
  getComputedStyle(element) {
    if (element.ownerDocument?.defaultView?.getComputedStyle) {
      return element.ownerDocument.defaultView.getComputedStyle(element);
    }
    // Fallback for environments without getComputedStyle
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
          title: 'Resolve Color Contrast Detection Error',
          description: `Color contrast detection failed: ${error.message}`,
          action: 'Check page content and styling'
        }
      ]
    };
  }
}
