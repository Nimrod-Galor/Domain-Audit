/**
 * Technical Extractor Module - Comprehensive Technical Analysis
 * 
 * This module handles all technical aspects of web page analysis including:
 * - Technical infrastructure analysis (viewport, charset, resources)
 * - Architecture analysis (URL structure, depth, parameters)
 * - Accessibility analysis (alt text, form labels, heading structure)
 * - Mobile friendliness analysis (responsive design, touch icons)
 * - Security analysis (HTTPS, security headers, CSP)
 * 
 * Features:
 * - Performance-optimized analysis with caching
 * - Configurable analysis depth and limits
 * - Comprehensive scoring algorithms
 * - Node.js and browser environment compatibility
 * - Integration with Performance Manager for caching
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

/**
 * Technical Extractor Class
 * Handles comprehensive technical analysis of web pages
 */
export class TechnicalExtractor {
  /**
   * Create a TechnicalExtractor instance
   * @param {Object} performanceManager - Performance manager for caching
   * @param {Object} options - Configuration options
   */
  constructor(performanceManager = null, options = {}) {
    this.performanceManager = performanceManager;
    this.config = {
      // Analysis limits for performance
      maxImageAnalysis: options.maxImageAnalysis || 50,
      maxInputAnalysis: options.maxInputAnalysis || 50,
      maxPathSegments: options.maxPathSegments || 10,
      
      // Cache settings
      enableCaching: options.enableCaching !== false,
      cachePrefix: options.cachePrefix || 'tech_',
      
      // Analysis depth
      detailedAnalysis: options.detailedAnalysis !== false,
      securityAnalysis: options.securityAnalysis !== false,
      accessibilityAnalysis: options.accessibilityAnalysis !== false,
      
      ...options
    };
  }

  /**
   * Extract all technical data from a page (main entry point)
   * @param {Document} document - DOM document
   * @param {Object} headers - Response headers
   * @param {string} pageUrl - Current page URL
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Complete technical analysis
   */
  async extractTechnicalData(document, headers = {}, pageUrl = '', options = {}) {
    const analysisOptions = { ...this.config, ...options };
    const cacheKey = this._getCacheKey('complete_technical', document, pageUrl);
    
    // Check cache first
    if (this.config.enableCaching && this.performanceManager) {
      const cached = this.performanceManager.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const analysisPromises = [];
    
    // Core technical infrastructure
    analysisPromises.push(
      Promise.resolve().then(() => ({
        infrastructure: this.extractTechnicalInfrastructure(document, headers)
      }))
    );
    
    // Architecture analysis
    if (pageUrl) {
      analysisPromises.push(
        Promise.resolve().then(() => ({
          architecture: this.extractArchitectureData(pageUrl, document)
        }))
      );
    }
    
    // Accessibility analysis
    if (analysisOptions.accessibilityAnalysis) {
      analysisPromises.push(
        Promise.resolve().then(() => ({
          accessibility: this.extractAccessibilityData(document)
        }))
      );
    }
    
    // Mobile friendliness analysis
    analysisPromises.push(
      Promise.resolve().then(() => ({
        mobile: this.extractMobileFriendlinessData(document, headers)
      }))
    );
    
    // Security analysis
    if (analysisOptions.securityAnalysis && pageUrl) {
      analysisPromises.push(
        Promise.resolve().then(() => ({
          security: this.extractSecurityData(headers, pageUrl, document)
        }))
      );
    }
    
    // Execute all analyses in parallel
    const results = await Promise.all(analysisPromises);
    
    // Combine results
    const technicalData = results.reduce((acc, result) => ({ ...acc, ...result }), {});
    
    // Add overall technical score
    technicalData.overallTechnicalScore = this._calculateOverallTechnicalScore(technicalData);
    
    // Add metadata
    technicalData.analysisMetadata = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      analysisOptions: analysisOptions,
      cacheKey
    };
    
    // Cache the result
    if (this.config.enableCaching && this.performanceManager) {
      this.performanceManager.cache.set(cacheKey, technicalData);
    }
    
    return technicalData;
  }

  /**
   * Extract technical infrastructure data (optimized version)
   * @param {Document} document - DOM document
   * @param {Object} headers - Response headers
   * @returns {Object} Technical infrastructure data
   */
  extractTechnicalInfrastructure(document, headers = {}) {
    const head = document.head;
    
    // Fast viewport and charset detection
    const viewport = head?.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const charset = head?.querySelector('meta[charset]')?.getAttribute('charset') || 
                    head?.querySelector('meta[http-equiv="content-type"]')?.getAttribute('content') || '';
    
    // Count resources efficiently
    const cssLinks = head ? head.getElementsByTagName('link').length : 0;
    const scripts = document.getElementsByTagName('script');
    const inlineStyles = document.getElementsByTagName('style').length;
    
    // Count external vs inline scripts
    let externalJS = 0;
    let inlineJS = 0;
    
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src) {
        externalJS++;
      } else if (scripts[i].textContent.trim()) {
        inlineJS++;
      }
    }
    
    // Additional technical metadata
    const generator = head?.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
    const framework = this._detectFramework(document, headers);
    
    return {
      viewport: {
        content: viewport,
        isResponsive: this._isResponsiveViewport(viewport)
      },
      charset: {
        value: charset,
        isUTF8: charset.toLowerCase().includes('utf-8')
      },
      resources: {
        externalCSS: cssLinks,
        externalJS: externalJS,
        inlineCSS: inlineStyles,
        inlineJS: inlineJS,
        totalResources: cssLinks + externalJS + inlineStyles
      },
      navigation: {
        hasNav: !!document.querySelector('nav'),
        hasBreadcrumbs: !!document.querySelector('[aria-label*="breadcrumb"], .breadcrumb'),
        hasSkipLinks: !!document.querySelector('a[href*="#main"], a[href*="#content"]')
      },
      serverInfo: {
        httpVersion: headers['http-version'] || '1.1',
        server: headers['server'] || '',
        poweredBy: headers['x-powered-by'] || '',
        generator: generator,
        framework: framework
      },
      technicalScore: this._calculateTechnicalInfrastructureScore({
        viewport, charset, cssLinks, externalJS, generator
      })
    };
  }

  /**
   * Extract architecture data with comprehensive URL analysis
   * @param {string} pageUrl - Current page URL
   * @param {Document} document - DOM document
   * @returns {Object} Architecture data
   */
  extractArchitectureData(pageUrl, document) {
    const url = new URL(pageUrl);
    const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
    
    // Analyze URL parameters
    const params = new URLSearchParams(url.search);
    const parameterAnalysis = this._analyzeParameters(params);
    
    // Analyze URL structure
    const urlStructure = this._analyzeUrlStructure(url, pathSegments);
    
    // Analyze internal link structure
    const linkStructure = this._analyzeLinkStructure(document);
    
    return {
      url: {
        depth: pathSegments.length,
        length: pageUrl.length,
        structure: urlStructure,
        fileExtension: this._getFileExtension(url.pathname),
        isHomepage: url.pathname === '/' || url.pathname === '',
        hasTrailingSlash: url.pathname.endsWith('/') && url.pathname !== '/',
        hasSpecialCharacters: /[^a-zA-Z0-9\/\-_.]/.test(url.pathname)
      },
      parameters: {
        count: params.size,
        hasParameters: url.search.length > 0,
        analysis: parameterAnalysis
      },
      pathSegments: pathSegments.slice(0, this.config.maxPathSegments),
      linkStructure: linkStructure,
      architectureScore: this._calculateArchitectureScore({
        depth: pathSegments.length,
        urlLength: pageUrl.length,
        parameterCount: params.size,
        linkStructure
      })
    };
  }

  /**
   * Extract comprehensive accessibility data
   * @param {Document} document - DOM document
   * @returns {Object} Accessibility analysis
   */
  extractAccessibilityData(document) {
    const body = document.body;
    if (!body) {
      return {
        images: { total: 0, withAlt: 0, missingAlt: 0 },
        forms: { total: 0, withLabels: 0, missingLabels: 0 },
        headings: { h1Count: 0, structure: [] },
        accessibilityScore: 0
      };
    }
    
    // Image accessibility analysis
    const imageAnalysis = this._analyzeImageAccessibility(body);
    
    // Form accessibility analysis
    const formAnalysis = this._analyzeFormAccessibility(body);
    
    // Heading structure analysis
    const headingAnalysis = this._analyzeHeadingStructure(body);
    
    // ARIA analysis
    const ariaAnalysis = this._analyzeAriaUsage(body);
    
    // Focus management analysis
    const focusAnalysis = this._analyzeFocusManagement(body);
    
    const accessibilityScore = this._calculateAccessibilityScore({
      imageAnalysis,
      formAnalysis,
      headingAnalysis,
      ariaAnalysis,
      focusAnalysis
    });
    
    return {
      images: imageAnalysis,
      forms: formAnalysis,
      headings: headingAnalysis,
      aria: ariaAnalysis,
      focus: focusAnalysis,
      accessibilityScore,
      recommendations: this._generateAccessibilityRecommendations({
        imageAnalysis,
        formAnalysis,
        headingAnalysis,
        ariaAnalysis
      })
    };
  }

  /**
   * Extract mobile friendliness data
   * @param {Document} document - DOM document
   * @param {Object} headers - Response headers
   * @returns {Object} Mobile friendliness analysis
   */
  extractMobileFriendlinessData(document, headers = {}) {
    const viewport = document.head?.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    
    // Viewport analysis
    const viewportAnalysis = this._analyzeViewport(viewport);
    
    // Touch and mobile features
    const mobileFeatures = this._analyzeMobileFeatures(document);
    
    // Responsive design indicators
    const responsiveIndicators = this._analyzeResponsiveDesign(document);
    
    const mobileScore = this._calculateMobileScore({
      viewportAnalysis,
      mobileFeatures,
      responsiveIndicators
    });
    
    return {
      viewport: viewportAnalysis,
      mobileFeatures,
      responsive: responsiveIndicators,
      mobileScore,
      recommendations: this._generateMobileRecommendations({
        viewportAnalysis,
        mobileFeatures,
        responsiveIndicators
      })
    };
  }

  /**
   * Extract security data and analysis
   * @param {Object} headers - Response headers
   * @param {string} pageUrl - Current page URL
   * @param {Document} document - DOM document
   * @returns {Object} Security analysis
   */
  extractSecurityData(headers = {}, pageUrl = '', document = null) {
    const url = new URL(pageUrl);
    const isHTTPS = url.protocol === 'https:';
    
    // Security headers analysis
    const securityHeaders = this._analyzeSecurityHeaders(headers);
    
    // Content security analysis
    const contentSecurity = this._analyzeContentSecurity(document, headers);
    
    // HTTPS and transport security
    const transportSecurity = this._analyzeTransportSecurity(headers, isHTTPS);
    
    const securityScore = this._calculateSecurityScore({
      isHTTPS,
      securityHeaders,
      contentSecurity,
      transportSecurity
    });
    
    return {
      https: {
        enabled: isHTTPS,
        secure: isHTTPS
      },
      headers: securityHeaders,
      content: contentSecurity,
      transport: transportSecurity,
      securityScore,
      recommendations: this._generateSecurityRecommendations({
        isHTTPS,
        securityHeaders,
        contentSecurity
      })
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate cache key for analysis results
   * @private
   */
  _getCacheKey(type, document, url = '') {
    if (!this.performanceManager) return null;
    
    const htmlSnippet = document.documentElement?.outerHTML?.substring(0, 1000) || '';
    return `${this.config.cachePrefix}${type}_${url}_${this._hashString(htmlSnippet)}`;
  }

  /**
   * Simple string hashing for cache keys
   * @private
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if viewport is responsive
   * @private
   */
  _isResponsiveViewport(viewport) {
    return viewport.includes('width=device-width') || 
           viewport.includes('initial-scale') ||
           viewport.includes('responsive');
  }

  /**
   * Detect framework or CMS
   * @private
   */
  _detectFramework(document, headers) {
    const frameworks = [];
    
    // Check generator meta tag
    const generator = document.head?.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
    if (generator) frameworks.push(generator);
    
    // Check powered-by header
    const poweredBy = headers['x-powered-by'] || '';
    if (poweredBy) frameworks.push(poweredBy);
    
    // Check common framework indicators
    const body = document.body?.innerHTML || '';
    if (body.includes('wp-content')) frameworks.push('WordPress');
    if (body.includes('drupal')) frameworks.push('Drupal');
    if (body.includes('_next')) frameworks.push('Next.js');
    if (body.includes('react')) frameworks.push('React');
    if (body.includes('vue')) frameworks.push('Vue.js');
    if (body.includes('angular')) frameworks.push('Angular');
    
    return frameworks.length > 0 ? frameworks.join(', ') : 'Unknown';
  }

  /**
   * Count inline scripts accurately
   * @private
   */
  _countInlineScripts(document) {
    const scripts = document.getElementsByTagName('script');
    let inlineCount = 0;
    
    for (let i = 0; i < scripts.length; i++) {
      if (!scripts[i].src && scripts[i].textContent.trim()) {
        inlineCount++;
      }
    }
    
    return inlineCount;
  }

  /**
   * Get file extension from pathname
   * @private
   */
  _getFileExtension(pathname) {
    const lastDot = pathname.lastIndexOf('.');
    const lastSlash = pathname.lastIndexOf('/');
    
    if (lastDot > lastSlash && lastDot !== -1) {
      return pathname.substring(lastDot + 1);
    }
    return '';
  }

  /**
   * Analyze URL parameters
   * @private
   */
  _analyzeParameters(params) {
    const paramTypes = {
      tracking: 0,
      utm: 0,
      session: 0,
      other: 0
    };
    
    for (const [key] of params) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith('utm_')) {
        paramTypes.utm++;
      } else if (lowerKey.includes('track') || lowerKey.includes('campaign')) {
        paramTypes.tracking++;
      } else if (lowerKey.includes('session') || lowerKey.includes('token')) {
        paramTypes.session++;
      } else {
        paramTypes.other++;
      }
    }
    
    return paramTypes;
  }

  /**
   * Analyze URL structure
   * @private
   */
  _analyzeUrlStructure(url, pathSegments) {
    return {
      domain: url.hostname,
      subdomain: url.hostname.split('.').length > 2 ? url.hostname.split('.')[0] : '',
      path: url.pathname,
      segments: pathSegments,
      hasQuery: url.search.length > 0,
      hasFragment: url.hash.length > 0,
      isClean: !url.search && !url.hash && !pathSegments.some(s => s.includes('.')),
      followsRESTPattern: this._checkRESTPattern(pathSegments)
    };
  }

  /**
   * Check if URL follows REST pattern
   * @private
   */
  _checkRESTPattern(segments) {
    if (segments.length < 2) return false;
    
    // Common REST patterns: /resource/id, /api/v1/resource
    const restPatterns = [
      /^api$/i,
      /^v\d+$/i,
      /^\d+$/,
      /^[a-z]+s$/i // plural resources
    ];
    
    return segments.some(segment => 
      restPatterns.some(pattern => pattern.test(segment))
    );
  }

  /**
   * Analyze link structure on the page
   * @private
   */
  _analyzeLinkStructure(document) {
    const links = document.getElementsByTagName('a');
    const analysis = {
      total: links.length,
      internal: 0,
      external: 0,
      email: 0,
      phone: 0,
      nofollow: 0,
      newWindow: 0
    };
    
    for (let i = 0; i < Math.min(links.length, 100); i++) { // Limit for performance
      const link = links[i];
      const href = link.getAttribute('href') || '';
      const target = link.getAttribute('target') || '';
      const rel = link.getAttribute('rel') || '';
      
      if (href.startsWith('mailto:')) {
        analysis.email++;
      } else if (href.startsWith('tel:')) {
        analysis.phone++;
      } else if (href.startsWith('http')) {
        // In Node.js environment, we can't access window.location
        // So we'll assume external if it starts with http/https
        analysis.external++;
      } else if (href.startsWith('/') || href.startsWith('#') || !href.startsWith('http')) {
        analysis.internal++;
      }
      
      if (rel.includes('nofollow')) analysis.nofollow++;
      if (target === '_blank') analysis.newWindow++;
    }
    
    return analysis;
  }

  /**
   * Analyze image accessibility
   * @private
   */
  _analyzeImageAccessibility(body) {
    const images = body.getElementsByTagName('img');
    const analysis = {
      total: images.length,
      withAlt: 0,
      missingAlt: 0,
      emptyAlt: 0,
      decorative: 0,
      informative: 0
    };
    
    for (let i = 0; i < Math.min(images.length, this.config.maxImageAnalysis); i++) {
      const img = images[i];
      const alt = img.getAttribute('alt');
      
      if (alt !== null) {
        analysis.withAlt++;
        if (alt === '') {
          analysis.emptyAlt++;
          analysis.decorative++;
        } else {
          analysis.informative++;
        }
      } else {
        analysis.missingAlt++;
      }
    }
    
    return analysis;
  }

  /**
   * Analyze form accessibility
   * @private
   */
  _analyzeFormAccessibility(body) {
    const forms = body.getElementsByTagName('form');
    const inputs = body.querySelectorAll('input, textarea, select');
    
    const analysis = {
      total: forms.length,
      inputs: inputs.length,
      withLabels: 0,
      missingLabels: 0,
      withFieldsets: 0,
      withRequiredIndicators: 0
    };
    
    // Analyze form inputs
    for (let i = 0; i < Math.min(inputs.length, this.config.maxInputAnalysis); i++) {
      const input = inputs[i];
      const id = input.getAttribute('id');
      const hasLabel = id && body.querySelector(`label[for="${id}"]`) ||
                       input.closest('label') ||
                       input.getAttribute('aria-label') ||
                       input.getAttribute('aria-labelledby');
      
      if (hasLabel) {
        analysis.withLabels++;
      } else {
        analysis.missingLabels++;
      }
      
      if (input.hasAttribute('required') || input.getAttribute('aria-required')) {
        analysis.withRequiredIndicators++;
      }
    }
    
    // Analyze fieldsets
    for (let i = 0; i < forms.length; i++) {
      if (forms[i].querySelector('fieldset')) {
        analysis.withFieldsets++;
      }
    }
    
    return analysis;
  }

  /**
   * Analyze heading structure
   * @private
   */
  _analyzeHeadingStructure(body) {
    const headings = body.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const structure = [];
    let properOrder = true;
    let lastLevel = 0;
    
    const counts = {
      h1: body.getElementsByTagName('h1').length,
      h2: body.getElementsByTagName('h2').length,
      h3: body.getElementsByTagName('h3').length,
      h4: body.getElementsByTagName('h4').length,
      h5: body.getElementsByTagName('h5').length,
      h6: body.getElementsByTagName('h6').length
    };
    
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent.trim().substring(0, 100);
      
      structure.push({
        level,
        text,
        position: i + 1
      });
      
      // Check proper heading order (shouldn't skip levels)
      if (level > lastLevel + 1) {
        properOrder = false;
      }
      lastLevel = level;
    }
    
    return {
      total: headings.length,
      counts,
      structure: structure.slice(0, 20), // Limit for performance
      properOrder,
      hasH1: counts.h1 > 0,
      multipleH1: counts.h1 > 1
    };
  }

  /**
   * Analyze ARIA usage
   * @private
   */
  _analyzeAriaUsage(body) {
    const ariaElements = body.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    const landmarks = body.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]');
    
    return {
      total: ariaElements.length,
      landmarks: landmarks.length,
      hasMainLandmark: !!body.querySelector('[role="main"], main'),
      hasNavLandmark: !!body.querySelector('[role="navigation"], nav'),
      hasSkipLinks: !!body.querySelector('a[href*="#main"], a[href*="#content"]'),
      ariaLabels: body.querySelectorAll('[aria-label]').length,
      ariaDescriptions: body.querySelectorAll('[aria-describedby]').length
    };
  }

  /**
   * Analyze focus management
   * @private
   */
  _analyzeFocusManagement(body) {
    const focusableElements = body.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    const customTabindex = body.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
    
    return {
      focusableElements: focusableElements.length,
      customTabindex: customTabindex.length,
      skipLinks: body.querySelectorAll('a[href*="#main"], a[href*="#content"]').length,
      focusVisible: !!body.querySelector(':focus-visible, .focus-visible')
    };
  }

  /**
   * Analyze viewport configuration
   * @private
   */
  _analyzeViewport(viewport) {
    const analysis = {
      content: viewport,
      isResponsive: this._isResponsiveViewport(viewport),
      hasDeviceWidth: viewport.includes('width=device-width'),
      hasInitialScale: viewport.includes('initial-scale'),
      hasUserScalable: viewport.includes('user-scalable'),
      userScalableDisabled: viewport.includes('user-scalable=no') || viewport.includes('user-scalable=0')
    };
    
    // Parse viewport values
    const viewportPairs = viewport.split(',').map(pair => pair.trim());
    analysis.parsed = {};
    
    viewportPairs.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        analysis.parsed[key] = value;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze mobile features
   * @private
   */
  _analyzeMobileFeatures(document) {
    const head = document.head;
    
    return {
      hasTouchIcons: !!head?.querySelector('link[rel*="apple-touch-icon"], link[rel*="icon"]'),
      hasManifest: !!head?.querySelector('link[rel="manifest"]'),
      hasThemeColor: !!head?.querySelector('meta[name="theme-color"]'),
      hasAppleMobileCapable: !!head?.querySelector('meta[name="apple-mobile-web-app-capable"]'),
      hasStatusBarStyle: !!head?.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]'),
      touchIconCount: head?.querySelectorAll('link[rel*="apple-touch-icon"]').length || 0
    };
  }

  /**
   * Analyze responsive design indicators
   * @private
   */
  _analyzeResponsiveDesign(document) {
    const styles = document.getElementsByTagName('style');
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    
    let hasMediaQueries = false;
    let hasFlexbox = false;
    let hasGrid = false;
    
    // Check inline styles for responsive patterns
    for (let i = 0; i < styles.length; i++) {
      const css = styles[i].textContent;
      if (css.includes('@media')) hasMediaQueries = true;
      if (css.includes('display:flex') || css.includes('display: flex')) hasFlexbox = true;
      if (css.includes('display:grid') || css.includes('display: grid')) hasGrid = true;
    }
    
    return {
      hasMediaQueries,
      hasFlexbox,
      hasGrid,
      hasResponsiveImages: !!document.querySelector('img[srcset], picture'),
      hasBootstrap: !!document.querySelector('[class*="col-"], [class*="container"]'),
      externalStylesheets: links.length
    };
  }

  /**
   * Analyze security headers
   * @private
   */
  _analyzeSecurityHeaders(headers) {
    const securityHeaders = {
      hsts: headers['strict-transport-security'] || '',
      csp: headers['content-security-policy'] || '',
      xfo: headers['x-frame-options'] || '',
      xcto: headers['x-content-type-options'] || '',
      referrer: headers['referrer-policy'] || '',
      permissions: headers['permissions-policy'] || headers['feature-policy'] || '',
      xssProtection: headers['x-xss-protection'] || '',
      expectCT: headers['expect-ct'] || '',
      server: headers['server'] || '',
      poweredBy: headers['x-powered-by'] || '',
      aspNetVersion: headers['x-aspnet-version'] || '',
      phpVersion: headers['x-powered-by']?.includes('PHP') ? headers['x-powered-by'] : '',
      technology: this._detectServerTechnology(headers)
    };
    
    const analysis = {
      headers: securityHeaders,
      hasHSTS: !!securityHeaders.hsts,
      hasCSP: !!securityHeaders.csp,
      hasXFO: !!securityHeaders.xfo,
      hasXCTO: !!securityHeaders.xcto,
      hasReferrerPolicy: !!securityHeaders.referrer,
      hasPermissionsPolicy: !!securityHeaders.permissions,
      hasXSSProtection: !!securityHeaders.xssProtection,
      hasExpectCT: !!securityHeaders.expectCT,
      serverInfo: {
        server: securityHeaders.server,
        technology: securityHeaders.technology,
        poweredBy: securityHeaders.poweredBy,
        hasServerHeader: !!securityHeaders.server,
        hidesTechnology: !securityHeaders.server && !securityHeaders.poweredBy
      },
      total: Object.values(securityHeaders).filter(v => v !== '').length
    };
    
    // Analyze CSP if present
    if (securityHeaders.csp) {
      analysis.cspAnalysis = this._analyzeCSP(securityHeaders.csp);
    }
    
    // Analyze HSTS if present
    if (securityHeaders.hsts) {
      analysis.hstsAnalysis = this._analyzeHSTS(securityHeaders.hsts);
    }
    
    return analysis;
  }

  /**
   * Analyze Content Security Policy
   * @private
   */
  _analyzeCSP(csp) {
    const directives = csp.split(';').map(d => d.trim()).filter(d => d);
    const analysis = {
      directives: directives.length,
      hasDefaultSrc: csp.includes('default-src'),
      hasScriptSrc: csp.includes('script-src'),
      hasStyleSrc: csp.includes('style-src'),
      hasUnsafeInline: csp.includes("'unsafe-inline'"),
      hasUnsafeEval: csp.includes("'unsafe-eval'"),
      hasNonce: csp.includes('nonce-'),
      hasHash: csp.includes('sha256-') || csp.includes('sha384-') || csp.includes('sha512-')
    };
    
    return analysis;
  }

  /**
   * Analyze content security
   * @private
   */
  _analyzeContentSecurity(document, headers) {
    if (!document) return { mixedContent: false, suspiciousContent: false };
    
    const analysis = {
      mixedContent: false,
      suspiciousContent: false,
      externalScripts: 0,
      inlineScripts: 0,
      externalStyles: 0
    };
    
    // Check for mixed content (HTTP resources on HTTPS page)
    const resources = document.querySelectorAll('[src], [href]');
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      const src = resource.getAttribute('src') || resource.getAttribute('href') || '';
      
      if (src.startsWith('http://')) {
        analysis.mixedContent = true;
        break;
      }
    }
    
    // Count script and style resources
    analysis.externalScripts = document.querySelectorAll('script[src]').length;
    analysis.inlineScripts = document.querySelectorAll('script:not([src])').length;
    analysis.externalStyles = document.querySelectorAll('link[rel="stylesheet"]').length;
    
    return analysis;
  }

  /**
   * Analyze transport security
   * @private
   */
  _analyzeTransportSecurity(headers, isHTTPS) {
    const hsts = headers['strict-transport-security'] || '';
    
    const analysis = {
      isHTTPS,
      hasHSTS: !!hsts,
      hstsMaxAge: 0,
      hstsIncludeSubdomains: false,
      hstsPreload: false
    };
    
    if (hsts) {
      // Parse HSTS header
      const maxAgeMatch = hsts.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        analysis.hstsMaxAge = parseInt(maxAgeMatch[1]);
      }
      
      analysis.hstsIncludeSubdomains = hsts.includes('includeSubDomains');
      analysis.hstsPreload = hsts.includes('preload');
    }
    
    return analysis;
  }

  // ============================================================================
  // SCORING METHODS
  // ============================================================================

  /**
   * Calculate technical infrastructure score
   * @private
   */
  _calculateTechnicalInfrastructureScore({ viewport, charset, cssLinks, externalJS, generator }) {
    let score = 0;
    
    // Viewport (25 points)
    if (this._isResponsiveViewport(viewport)) score += 25;
    
    // Charset (15 points)
    if (charset.toLowerCase().includes('utf-8')) score += 15;
    
    // Resource optimization (30 points)
    const totalResources = cssLinks + externalJS;
    if (totalResources <= 5) score += 30;
    else if (totalResources <= 10) score += 20;
    else if (totalResources <= 20) score += 10;
    
    // Modern practices (20 points)
    if (generator) score += 10; // CMS/framework detected
    if (viewport.includes('initial-scale=1')) score += 10;
    
    // Performance indicators (10 points)
    if (externalJS <= 3) score += 5; // Limited JS files
    if (cssLinks <= 2) score += 5; // Limited CSS files
    
    return Math.min(score, 100);
  }

  /**
   * Calculate architecture score
   * @private
   */
  _calculateArchitectureScore({ depth, urlLength, parameterCount, linkStructure }) {
    let score = 100;
    
    // URL depth penalty
    if (depth > 5) score -= 20;
    else if (depth > 3) score -= 10;
    
    // URL length penalty
    if (urlLength > 100) score -= 15;
    else if (urlLength > 75) score -= 10;
    
    // Parameter count penalty
    if (parameterCount > 5) score -= 15;
    else if (parameterCount > 3) score -= 10;
    
    // Link structure bonus
    if (linkStructure.internal > linkStructure.external) score += 10;
    if (linkStructure.nofollow / linkStructure.total < 0.3) score += 10;
    
    return Math.max(score, 0);
  }

  /**
   * Calculate accessibility score
   * @private
   */
  _calculateAccessibilityScore({ imageAnalysis, formAnalysis, headingAnalysis, ariaAnalysis }) {
    let score = 0;
    
    // Image accessibility (25 points)
    if (imageAnalysis.total > 0) {
      score += (imageAnalysis.withAlt / imageAnalysis.total) * 25;
    } else {
      score += 25; // No images = perfect score
    }
    
    // Form accessibility (25 points)
    if (formAnalysis.inputs > 0) {
      score += (formAnalysis.withLabels / formAnalysis.inputs) * 25;
    } else {
      score += 25; // No forms = perfect score
    }
    
    // Heading structure (25 points)
    if (headingAnalysis.hasH1) score += 10;
    if (!headingAnalysis.multipleH1) score += 5;
    if (headingAnalysis.properOrder) score += 10;
    
    // ARIA usage (25 points)
    if (ariaAnalysis.hasMainLandmark) score += 10;
    if (ariaAnalysis.hasNavLandmark) score += 5;
    if (ariaAnalysis.hasSkipLinks) score += 10;
    
    return Math.round(Math.min(score, 100));
  }

  /**
   * Calculate mobile score
   * @private
   */
  _calculateMobileScore({ viewportAnalysis, mobileFeatures, responsiveIndicators }) {
    let score = 0;
    
    // Viewport (40 points)
    if (viewportAnalysis.isResponsive) score += 30;
    if (viewportAnalysis.hasDeviceWidth) score += 10;
    
    // Mobile features (30 points)
    if (mobileFeatures.hasTouchIcons) score += 10;
    if (mobileFeatures.hasManifest) score += 10;
    if (mobileFeatures.hasThemeColor) score += 10;
    
    // Responsive design (30 points)
    if (responsiveIndicators.hasMediaQueries) score += 15;
    if (responsiveIndicators.hasFlexbox || responsiveIndicators.hasGrid) score += 10;
    if (responsiveIndicators.hasResponsiveImages) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate security score
   * @private
   */
  _calculateSecurityScore({ isHTTPS, securityHeaders, contentSecurity, transportSecurity }) {
    let score = 0;
    
    // HTTPS (40 points)
    if (isHTTPS) score += 40;
    
    // Security headers (40 points)
    if (securityHeaders.hasHSTS) score += 10;
    if (securityHeaders.hasCSP) score += 15;
    if (securityHeaders.hasXFO) score += 5;
    if (securityHeaders.hasXCTO) score += 5;
    if (securityHeaders.hasReferrerPolicy) score += 5;
    
    // Content security (20 points)
    if (!contentSecurity.mixedContent) score += 10;
    if (contentSecurity.inlineScripts === 0) score += 5;
    if (contentSecurity.externalScripts <= 3) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate overall technical score
   * @private
   */
  _calculateOverallTechnicalScore(technicalData) {
    const scores = [];
    
    if (technicalData.infrastructure) {
      scores.push({ score: technicalData.infrastructure.technicalScore, weight: 0.25 });
    }
    
    if (technicalData.architecture) {
      scores.push({ score: technicalData.architecture.architectureScore, weight: 0.20 });
    }
    
    if (technicalData.accessibility) {
      scores.push({ score: technicalData.accessibility.accessibilityScore, weight: 0.25 });
    }
    
    if (technicalData.mobile) {
      scores.push({ score: technicalData.mobile.mobileScore, weight: 0.15 });
    }
    
    if (technicalData.security) {
      scores.push({ score: technicalData.security.securityScore, weight: 0.15 });
    }
    
    // Calculate weighted average
    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  // ============================================================================
  // RECOMMENDATION METHODS
  // ============================================================================

  /**
   * Generate accessibility recommendations
   * @private
   */
  _generateAccessibilityRecommendations({ imageAnalysis, formAnalysis, headingAnalysis, ariaAnalysis }) {
    const recommendations = [];
    
    if (imageAnalysis.missingAlt > 0) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing alt text',
        description: `${imageAnalysis.missingAlt} images are missing alt text`,
        solution: 'Add descriptive alt text to all images, or empty alt="" for decorative images'
      });
    }
    
    if (formAnalysis.missingLabels > 0) {
      recommendations.push({
        priority: 'high',
        issue: 'Form inputs without labels',
        description: `${formAnalysis.missingLabels} form inputs are missing labels`,
        solution: 'Associate labels with form inputs using for/id attributes or aria-label'
      });
    }
    
    if (!headingAnalysis.hasH1) {
      recommendations.push({
        priority: 'medium',
        issue: 'Missing H1 heading',
        description: 'Page is missing a main H1 heading',
        solution: 'Add a descriptive H1 heading to the page'
      });
    }
    
    if (headingAnalysis.multipleH1) {
      recommendations.push({
        priority: 'medium',
        issue: 'Multiple H1 headings',
        description: 'Page has multiple H1 headings',
        solution: 'Use only one H1 heading per page'
      });
    }
    
    if (!ariaAnalysis.hasMainLandmark) {
      recommendations.push({
        priority: 'medium',
        issue: 'Missing main landmark',
        description: 'Page is missing a main landmark',
        solution: 'Add a <main> element or role="main" to identify the main content'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate mobile recommendations
   * @private
   */
  _generateMobileRecommendations({ viewportAnalysis, mobileFeatures, responsiveIndicators }) {
    const recommendations = [];
    
    if (!viewportAnalysis.isResponsive) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing responsive viewport',
        description: 'Page lacks proper viewport configuration for mobile devices',
        solution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the head'
      });
    }
    
    if (!mobileFeatures.hasTouchIcons) {
      recommendations.push({
        priority: 'medium',
        issue: 'Missing touch icons',
        description: 'No touch icons found for mobile devices',
        solution: 'Add apple-touch-icon and favicon for better mobile experience'
      });
    }
    
    if (!responsiveIndicators.hasMediaQueries) {
      recommendations.push({
        priority: 'high',
        issue: 'No responsive CSS',
        description: 'No media queries detected for responsive design',
        solution: 'Implement responsive CSS with media queries for different screen sizes'
      });
    }
    
    if (!mobileFeatures.hasThemeColor) {
      recommendations.push({
        priority: 'low',
        issue: 'Missing theme color',
        description: 'No theme color specified for mobile browsers',
        solution: 'Add <meta name="theme-color" content="#color"> for better mobile integration'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate security recommendations
   * @private
   */
  _generateSecurityRecommendations({ isHTTPS, securityHeaders, contentSecurity }) {
    const recommendations = [];
    
    if (!isHTTPS) {
      recommendations.push({
        priority: 'critical',
        issue: 'Not using HTTPS',
        description: 'Website is not served over HTTPS',
        solution: 'Implement SSL/TLS certificate and redirect HTTP to HTTPS'
      });
    }
    
    if (!securityHeaders.hasHSTS) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing HSTS header',
        description: 'No HTTP Strict Transport Security header found',
        solution: 'Add Strict-Transport-Security header to enforce HTTPS'
      });
    }
    
    if (!securityHeaders.hasCSP) {
      recommendations.push({
        priority: 'high',
        issue: 'Missing Content Security Policy',
        description: 'No CSP header found to prevent XSS attacks',
        solution: 'Implement Content-Security-Policy header to restrict resource loading'
      });
    }
    
    if (contentSecurity.mixedContent) {
      recommendations.push({
        priority: 'high',
        issue: 'Mixed content detected',
        description: 'HTTP resources loaded on HTTPS page',
        solution: 'Ensure all resources (images, scripts, styles) are loaded over HTTPS'
      });
    }
    
    if (!securityHeaders.hasXFO) {
      recommendations.push({
        priority: 'medium',
        issue: 'Missing X-Frame-Options',
        description: 'No X-Frame-Options header to prevent clickjacking',
        solution: 'Add X-Frame-Options: DENY or SAMEORIGIN header'
      });
    }
    
    return recommendations;
  }

  /**
   * Detect server technology from headers
   * @private
   */
  _detectServerTechnology(headers) {
    const server = (headers['server'] || '').toLowerCase();
    const poweredBy = (headers['x-powered-by'] || '').toLowerCase();
    const generator = (headers['x-generator'] || '').toLowerCase();
    
    const technologies = [];
    
    // Web servers
    if (server.includes('apache')) technologies.push('Apache');
    if (server.includes('nginx')) technologies.push('Nginx');
    if (server.includes('iis')) technologies.push('IIS');
    if (server.includes('cloudflare')) technologies.push('Cloudflare');
    if (server.includes('cloudfront')) technologies.push('CloudFront');
    
    // Frameworks and languages
    if (poweredBy.includes('php')) technologies.push('PHP');
    if (poweredBy.includes('asp.net')) technologies.push('ASP.NET');
    if (poweredBy.includes('express')) technologies.push('Express.js');
    if (poweredBy.includes('next.js')) technologies.push('Next.js');
    
    // CMS detection
    if (generator.includes('wordpress')) technologies.push('WordPress');
    if (generator.includes('drupal')) technologies.push('Drupal');
    if (generator.includes('joomla')) technologies.push('Joomla');
    
    return {
      detected: technologies,
      server: server,
      poweredBy: poweredBy,
      count: technologies.length
    };
  }

  /**
   * Analyze HSTS header
   * @private
   */
  _analyzeHSTS(hstsHeader) {
    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) : 0;
    
    return {
      maxAge: maxAge,
      includeSubDomains: hstsHeader.includes('includeSubDomains'),
      preload: hstsHeader.includes('preload'),
      isValid: maxAge > 0,
      isLongTerm: maxAge >= 31536000, // 1 year
      score: (maxAge > 0 ? 1 : 0) + 
             (hstsHeader.includes('includeSubDomains') ? 1 : 0) + 
             (hstsHeader.includes('preload') ? 1 : 0)
    };
  }
}

// ============================================================================
// BACKWARDS COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Legacy function for basic technical data extraction (optimized)
 * @param {Document} document - DOM document
 * @param {Object} headers - Response headers
 * @returns {Object} Basic technical data
 */
export function extractTechnicalDataOptimized(document, headers = {}) {
  const extractor = new TechnicalExtractor();
  return extractor.extractTechnicalInfrastructure(document, headers);
}

/**
 * Legacy function for architecture data extraction
 * @param {string} pageUrl - Current page URL
 * @param {Document} document - DOM document
 * @returns {Object} Architecture data
 */
export function extractArchitectureDataOptimized(pageUrl, document) {
  const extractor = new TechnicalExtractor();
  return extractor.extractArchitectureData(pageUrl, document);
}

/**
 * Legacy function for accessibility data extraction
 * @param {Document} document - DOM document
 * @returns {Object} Accessibility data
 */
export function extractAccessibilityDataOptimized(document) {
  const extractor = new TechnicalExtractor();
  return extractor.extractAccessibilityData(document);
}

/**
 * Legacy function for mobile friendliness data extraction
 * @param {Document} document - DOM document
 * @param {Object} headers - Response headers
 * @returns {Object} Mobile friendliness data
 */
export function extractMobileFriendlinessDataOptimized(document, headers = {}) {
  const extractor = new TechnicalExtractor();
  return extractor.extractMobileFriendlinessData(document, headers);
}

/**
 * Legacy function for security data extraction
 * @param {Object} headers - Response headers
 * @param {string} pageUrl - Current page URL
 * @param {Document} document - DOM document
 * @returns {Object} Security data
 */
export function extractSecurityDataOptimized(headers = {}, pageUrl = '', document = null) {
  const extractor = new TechnicalExtractor();
  return extractor.extractSecurityData(headers, pageUrl, document);
}

// Default export
export default TechnicalExtractor;
