/**
 * ============================================================================
 * E-COMMERCE PLATFORM DETECTOR - GPT-5 STYLE DETECTOR
 * ============================================================================
 * 
 * Advanced platform detection and technology stack analysis for e-commerce sites
 * Part of E-commerce Analyzer Combined Approach (13th Implementation)
 * 
 * Detection Capabilities:
 * - Platform identification (Shopify, WooCommerce, Magento, BigCommerce, etc.)
 * - Technology stack analysis (frameworks, libraries, payment gateways)
 * - Hosting environment detection (cloud platforms, CDNs)
 * - Theme and template identification
 * - Plugin and extension detection
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class EcommercePlatformDetector {
  constructor(options = {}) {
    this.options = {
      // Detection Configuration
      enableAdvancedDetection: options.enableAdvancedDetection !== false,
      enableTechnologyStack: options.enableTechnologyStack !== false,
      enableHostingDetection: options.enableHostingDetection !== false,
      enableThemeDetection: options.enableThemeDetection !== false,
      enablePluginDetection: options.enablePluginDetection !== false,
      
      // Analysis Depth
      detectionDepth: options.detectionDepth || 'comprehensive',
      confidenceThreshold: options.confidenceThreshold || 0.7,
      
      // Platform Priorities
      platformPriorities: options.platformPriorities || [
        'shopify', 'woocommerce', 'magento', 'bigcommerce', 'prestashop',
        'opencart', 'drupal_commerce', 'custom', 'unknown'
      ],
      
      ...options
    };

    this.detectorType = 'ecommerce_platform_detector';
    this.version = '1.0.0';
    
    // Platform detection signatures
    this.platformSignatures = {
      shopify: {
        domains: ['myshopify.com', 'shopifypreview.com'],
        selectors: [
          'meta[name="generator"][content*="Shopify"]',
          'script[src*="shopify"]',
          '.shopify-section',
          '.shopify-payment-button',
          '[data-shopify]'
        ],
        scripts: [
          'shopify.min.js',
          'checkout.shopifycs.com',
          'cdn.shopify.com'
        ],
        cookies: ['cart', '_shopify_s', '_shopify_y'],
        headers: ['X-Shopify-Stage', 'X-Shopify-Shop-Api-Call-Limit'],
        confidence: 0.95
      },
      
      woocommerce: {
        selectors: [
          'meta[name="generator"][content*="WooCommerce"]',
          'script[src*="woocommerce"]',
          '.woocommerce',
          '.wc-product',
          '.cart-contents',
          'form.woocommerce-cart-form'
        ],
        scripts: [
          'woocommerce.min.js',
          'wc-add-to-cart.min.js',
          'wc-cart-fragments.min.js'
        ],
        classes: ['woocommerce', 'wc-product', 'product-type-simple'],
        bodyClasses: ['woocommerce-page', 'woocommerce-cart'],
        confidence: 0.9
      },
      
      magento: {
        selectors: [
          'meta[name="generator"][content*="Magento"]',
          'script[src*="magento"]',
          '.page-product',
          '.checkout-cart',
          'body.catalog-product-view'
        ],
        scripts: [
          'mage/cookies.js',
          'magento.min.js',
          'requirejs/require.js'
        ],
        paths: ['/js/mage/', '/skin/frontend/', '/media/catalog/'],
        bodyClasses: ['catalog-product-view', 'checkout-cart-index'],
        confidence: 0.9
      },
      
      bigcommerce: {
        domains: ['bigcommerce.com', 'bcapp.dev'],
        selectors: [
          'meta[name="generator"][content*="BigCommerce"]',
          'script[src*="bigcommerce"]',
          '.productView',
          '.cart-item'
        ],
        scripts: [
          'bigcommerce.min.js',
          'bc-sf-filter.js'
        ],
        confidence: 0.9
      },
      
      prestashop: {
        selectors: [
          'meta[name="generator"][content*="PrestaShop"]',
          'script[src*="prestashop"]',
          '.prestashop',
          '#product'
        ],
        scripts: [
          'prestashop.min.js',
          'tools.js'
        ],
        paths: ['/themes/', '/modules/'],
        confidence: 0.85
      },
      
      opencart: {
        selectors: [
          'meta[name="generator"][content*="OpenCart"]',
          'script[src*="opencart"]',
          '#product',
          '.product-thumb'
        ],
        scripts: [
          'opencart.min.js',
          'common.js'
        ],
        confidence: 0.85
      },
      
      drupal_commerce: {
        selectors: [
          'meta[name="generator"][content*="Drupal"]',
          'script[src*="drupal"]',
          '.commerce-product',
          '.add-to-cart'
        ],
        scripts: [
          'drupal.min.js',
          'commerce.min.js'
        ],
        confidence: 0.8
      }
    };

    // Technology stack signatures
    this.technologySignatures = {
      frontend: {
        react: { selectors: ['[data-reactroot]', '[data-react-helmet]'], scripts: ['react.min.js'] },
        vue: { selectors: ['[data-v-]', '#app'], scripts: ['vue.min.js'] },
        angular: { selectors: ['[ng-app]', '[ng-controller]'], scripts: ['angular.min.js'] },
        jquery: { scripts: ['jquery.min.js', 'jquery-ui.min.js'] }
      },
      
      analytics: {
        google_analytics: { scripts: ['google-analytics.com/analytics.js', 'gtag/js'] },
        facebook_pixel: { scripts: ['connect.facebook.net/en_US/fbevents.js'] },
        hotjar: { scripts: ['static.hotjar.com/c/hotjar-'] },
        mixpanel: { scripts: ['cdn.mxpnl.com/libs/mixpanel'] }
      },
      
      payments: {
        stripe: { scripts: ['js.stripe.com/v3/', 'checkout.stripe.com'] },
        paypal: { scripts: ['paypal.com/sdk/js', 'paypalobjects.com'] },
        square: { scripts: ['js.squareup.com/v2/paymentform'] },
        braintree: { scripts: ['js.braintreegateway.com/web/'] }
      },
      
      hosting: {
        cloudflare: { headers: ['CF-RAY', 'Server: cloudflare'] },
        aws: { headers: ['X-Amz-Cf-Id', 'Server: AmazonS3'] },
        shopify_cdn: { scripts: ['cdn.shopify.com'] },
        fastly: { headers: ['Fastly-Debug-Digest'] }
      }
    };

    // Custom e-commerce indicators
    this.ecommerceIndicators = {
      cart: [
        '.cart', '.shopping-cart', '.basket', '[data-cart]',
        'button[name*="add-to-cart"]', 'input[name*="cart"]'
      ],
      product: [
        '.product', '.item', '[data-product]', '[itemtype*="Product"]',
        '.product-item', '.product-card', '.product-listing'
      ],
      checkout: [
        '.checkout', '.payment', '.billing', '.shipping',
        'form[action*="checkout"]', '.checkout-form'
      ],
      price: [
        '.price', '.cost', '.amount', '[data-price]',
        '.product-price', '.regular-price', '.sale-price'
      ]
    };
    
    console.log('🛒 E-commerce Platform Detector initialized (GPT-5 Style)');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'EcommercePlatformDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced platform detection and technology stack analysis for e-commerce sites',
      
      capabilities: [
        'platform_identification',
        'technology_stack_analysis',
        'hosting_environment_detection',
        'theme_template_identification',
        'plugin_extension_detection',
        'payment_gateway_detection'
      ],
      
      supportedPlatforms: Object.keys(this.platformSignatures),
      technologyCategories: Object.keys(this.technologySignatures),
      
      configuration: {
        detectionDepth: this.options.detectionDepth,
        confidenceThreshold: this.options.confidenceThreshold,
        enableAdvancedDetection: this.options.enableAdvancedDetection
      },
      
      approach: 'GPT-5 Style Advanced Pattern Detection'
    };
  }

  /**
   * Main detection method using GPT-5 style analysis
   * @param {Object} context - Analysis context containing DOM, URL, and page data
   * @returns {Promise<Object>} Platform detection results
   */
  async detect(context) {
    const startTime = Date.now();
    
    try {
      if (!context) {
        throw new Error('Context is required for platform detection');
      }

      console.log('🛒 Starting GPT-5 style e-commerce platform detection...');

      // Core Platform Detection
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Platform Analysis
        platform: await this._detectPlatform(context),
        
        // Technology Stack Analysis
        technologyStack: this.options.enableTechnologyStack ?
          await this._analyzeTechnologyStack(context) : null,
        
        // Hosting Environment
        hostingEnvironment: this.options.enableHostingDetection ?
          await this._detectHostingEnvironment(context) : null,
        
        // Theme and Template Detection
        themeDetection: this.options.enableThemeDetection ?
          await this._detectThemeAndTemplate(context) : null,
        
        // Plugin and Extension Detection
        pluginDetection: this.options.enablePluginDetection ?
          await this._detectPluginsAndExtensions(context) : null,
        
        // E-commerce Indicators
        ecommerceIndicators: await this._analyzeEcommerceIndicators(context),
        
        // Confidence Assessment
        confidence: {},
        
        executionTime: Date.now() - startTime
      };

      // Calculate overall confidence
      results.confidence = this._calculateOverallConfidence(results);
      
      console.log(`✅ Platform detection completed in ${results.executionTime}ms`);
      console.log(`🛒 Platform: ${results.platform.detected} (${Math.round(results.confidence.overall * 100)}% confidence)`);
      
      return results;

    } catch (error) {
      console.error('❌ Platform detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Detect e-commerce platform using signature matching
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Platform detection results
   */
  async _detectPlatform(context) {
    const detection = {
      detected: 'unknown',
      confidence: 0,
      evidence: [],
      alternatives: []
    };

    try {
      const { document, url = '', headers = {} } = context;
      
      if (!document) {
        throw new Error('Document is required for platform detection');
      }

      const platformScores = {};
      
      // Test each platform signature
      for (const [platform, signature] of Object.entries(this.platformSignatures)) {
        const score = await this._calculatePlatformScore(platform, signature, document, url, headers);
        platformScores[platform] = score;
        
        if (score.confidence > detection.confidence) {
          detection.detected = platform;
          detection.confidence = score.confidence;
          detection.evidence = score.evidence;
        }
      }

      // Find alternatives with high scores
      detection.alternatives = Object.entries(platformScores)
        .filter(([platform, score]) => 
          platform !== detection.detected && score.confidence > 0.3
        )
        .sort((a, b) => b[1].confidence - a[1].confidence)
        .slice(0, 3)
        .map(([platform, score]) => ({
          platform,
          confidence: score.confidence,
          evidence: score.evidence.slice(0, 3)
        }));

      // If no platform detected with high confidence, check for custom e-commerce
      if (detection.confidence < this.options.confidenceThreshold) {
        const customEcommerce = await this._detectCustomEcommerce(document, url);
        if (customEcommerce.isEcommerce) {
          detection.detected = 'custom';
          detection.confidence = customEcommerce.confidence;
          detection.evidence = customEcommerce.evidence;
        }
      }

    } catch (error) {
      console.error('Platform detection failed:', error);
      detection.error = error.message;
    }

    return detection;
  }

  /**
   * Calculate platform score based on signature matching
   * @param {string} platform - Platform name
   * @param {Object} signature - Platform signature
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @param {Object} headers - HTTP headers
   * @returns {Promise<Object>} Platform score and evidence
   */
  async _calculatePlatformScore(platform, signature, document, url, headers) {
    const score = {
      confidence: 0,
      evidence: [],
      factors: {
        domain: 0,
        selectors: 0,
        scripts: 0,
        classes: 0,
        headers: 0,
        paths: 0
      }
    };

    try {
      let totalFactors = 0;
      let matchedFactors = 0;

      // Domain matching
      if (signature.domains) {
        totalFactors++;
        const domainMatch = signature.domains.some(domain => url.includes(domain));
        if (domainMatch) {
          matchedFactors++;
          score.factors.domain = 1;
          score.evidence.push(`Domain match: ${url}`);
        }
      }

      // Selector matching
      if (signature.selectors) {
        totalFactors++;
        let selectorMatches = 0;
        signature.selectors.forEach(selector => {
          try {
            if (document.querySelector(selector)) {
              selectorMatches++;
              score.evidence.push(`Element found: ${selector}`);
            }
          } catch (e) {
            // Invalid selector, skip
          }
        });
        
        if (selectorMatches > 0) {
          matchedFactors++;
          score.factors.selectors = selectorMatches / signature.selectors.length;
        }
      }

      // Script matching
      if (signature.scripts) {
        totalFactors++;
        let scriptMatches = 0;
        const htmlContent = document.documentElement.innerHTML.toLowerCase();
        
        signature.scripts.forEach(scriptPattern => {
          if (htmlContent.includes(scriptPattern.toLowerCase())) {
            scriptMatches++;
            score.evidence.push(`Script found: ${scriptPattern}`);
          }
        });
        
        if (scriptMatches > 0) {
          matchedFactors++;
          score.factors.scripts = scriptMatches / signature.scripts.length;
        }
      }

      // Class matching
      if (signature.classes || signature.bodyClasses) {
        totalFactors++;
        let classMatches = 0;
        const allClasses = [...signature.classes || [], ...signature.bodyClasses || []];
        
        allClasses.forEach(className => {
          if (document.querySelector(`.${className}`) || 
              document.body.classList.contains(className)) {
            classMatches++;
            score.evidence.push(`Class found: ${className}`);
          }
        });
        
        if (classMatches > 0) {
          matchedFactors++;
          score.factors.classes = classMatches / allClasses.length;
        }
      }

      // Header matching
      if (signature.headers && headers) {
        totalFactors++;
        let headerMatches = 0;
        
        signature.headers.forEach(headerPattern => {
          const headerFound = Object.keys(headers).some(headerName =>
            headerName.toLowerCase().includes(headerPattern.toLowerCase()) ||
            (headers[headerName] && headers[headerName].includes(headerPattern))
          );
          
          if (headerFound) {
            headerMatches++;
            score.evidence.push(`Header found: ${headerPattern}`);
          }
        });
        
        if (headerMatches > 0) {
          matchedFactors++;
          score.factors.headers = headerMatches / signature.headers.length;
        }
      }

      // Path matching
      if (signature.paths) {
        totalFactors++;
        let pathMatches = 0;
        const htmlContent = document.documentElement.innerHTML.toLowerCase();
        
        signature.paths.forEach(path => {
          if (htmlContent.includes(path.toLowerCase())) {
            pathMatches++;
            score.evidence.push(`Path found: ${path}`);
          }
        });
        
        if (pathMatches > 0) {
          matchedFactors++;
          score.factors.paths = pathMatches / signature.paths.length;
        }
      }

      // Calculate overall confidence
      if (totalFactors > 0) {
        const baseConfidence = matchedFactors / totalFactors;
        
        // Apply platform-specific confidence multiplier
        score.confidence = Math.min(baseConfidence * (signature.confidence || 0.8), 1.0);
        
        // Boost confidence for strong matches
        if (score.factors.domain === 1) {
          score.confidence = Math.min(score.confidence * 1.2, 1.0);
        }
        
        if (score.factors.selectors > 0.5 && score.factors.scripts > 0.5) {
          score.confidence = Math.min(score.confidence * 1.1, 1.0);
        }
      }

    } catch (error) {
      console.error(`Error calculating score for ${platform}:`, error);
    }

    return score;
  }

  /**
   * Detect custom e-commerce implementation
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Promise<Object>} Custom e-commerce detection results
   */
  async _detectCustomEcommerce(document, url) {
    const detection = {
      isEcommerce: false,
      confidence: 0,
      evidence: [],
      indicators: {}
    };

    try {
      let indicatorCount = 0;
      let totalIndicators = 0;

      // Check each e-commerce indicator category
      for (const [category, selectors] of Object.entries(this.ecommerceIndicators)) {
        totalIndicators++;
        let categoryMatches = 0;

        selectors.forEach(selector => {
          try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              categoryMatches++;
              detection.evidence.push(`${category}: ${selector} (${elements.length} elements)`);
            }
          } catch (e) {
            // Invalid selector, skip
          }
        });

        if (categoryMatches > 0) {
          indicatorCount++;
          detection.indicators[category] = {
            matches: categoryMatches,
            total: selectors.length,
            confidence: categoryMatches / selectors.length
          };
        }
      }

      // Determine if this is an e-commerce site
      if (indicatorCount >= 3) { // At least 3 categories must match
        detection.isEcommerce = true;
        detection.confidence = (indicatorCount / totalIndicators) * 0.8; // Max 80% for custom
      }

    } catch (error) {
      console.error('Custom e-commerce detection failed:', error);
    }

    return detection;
  }

  /**
   * Analyze technology stack used by the e-commerce site
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Technology stack analysis results
   */
  async _analyzeTechnologyStack(context) {
    const analysis = {
      frontend: {},
      analytics: {},
      payments: {},
      hosting: {},
      other: {}
    };

    try {
      const { document, headers = {} } = context;
      const htmlContent = document.documentElement.innerHTML.toLowerCase();

      // Analyze each technology category
      for (const [category, technologies] of Object.entries(this.technologySignatures)) {
        for (const [tech, signature] of Object.entries(technologies)) {
          const detected = await this._detectTechnology(tech, signature, document, htmlContent, headers);
          if (detected.found) {
            analysis[category][tech] = detected;
          }
        }
      }

    } catch (error) {
      console.error('Technology stack analysis failed:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Detect specific technology based on signature
   * @param {string} techName - Technology name
   * @param {Object} signature - Technology signature
   * @param {Document} document - DOM document
   * @param {string} htmlContent - HTML content
   * @param {Object} headers - HTTP headers
   * @returns {Promise<Object>} Technology detection results
   */
  async _detectTechnology(techName, signature, document, htmlContent, headers) {
    const detection = {
      found: false,
      confidence: 0,
      evidence: []
    };

    try {
      let matches = 0;
      let totalChecks = 0;

      // Check selectors
      if (signature.selectors) {
        totalChecks++;
        let selectorMatches = 0;
        
        signature.selectors.forEach(selector => {
          try {
            if (document.querySelector(selector)) {
              selectorMatches++;
              detection.evidence.push(`Selector: ${selector}`);
            }
          } catch (e) {
            // Invalid selector, skip
          }
        });
        
        if (selectorMatches > 0) {
          matches++;
        }
      }

      // Check scripts
      if (signature.scripts) {
        totalChecks++;
        let scriptMatches = 0;
        
        signature.scripts.forEach(script => {
          if (htmlContent.includes(script.toLowerCase())) {
            scriptMatches++;
            detection.evidence.push(`Script: ${script}`);
          }
        });
        
        if (scriptMatches > 0) {
          matches++;
        }
      }

      // Check headers
      if (signature.headers) {
        totalChecks++;
        let headerMatches = 0;
        
        signature.headers.forEach(headerPattern => {
          const headerFound = Object.entries(headers).some(([name, value]) =>
            name.toLowerCase().includes(headerPattern.toLowerCase()) ||
            (value && value.includes(headerPattern))
          );
          
          if (headerFound) {
            headerMatches++;
            detection.evidence.push(`Header: ${headerPattern}`);
          }
        });
        
        if (headerMatches > 0) {
          matches++;
        }
      }

      // Calculate detection confidence
      if (totalChecks > 0 && matches > 0) {
        detection.found = true;
        detection.confidence = matches / totalChecks;
      }

    } catch (error) {
      console.error(`Technology detection failed for ${techName}:`, error);
    }

    return detection;
  }

  /**
   * Detect hosting environment and CDN usage
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Hosting environment detection results
   */
  async _detectHostingEnvironment(context) {
    const environment = {
      hosting: 'unknown',
      cdn: null,
      serverInfo: {},
      confidence: 0
    };

    try {
      const { headers = {}, url = '' } = context;

      // Check hosting signatures
      const hostingSignatures = this.technologySignatures.hosting;
      
      for (const [provider, signature] of Object.entries(hostingSignatures)) {
        const detected = await this._detectTechnology(provider, signature, null, '', headers);
        if (detected.found && detected.confidence > environment.confidence) {
          environment.hosting = provider;
          environment.confidence = detected.confidence;
          environment.serverInfo = detected.evidence;
        }
      }

      // Extract server information from headers
      if (headers.server) {
        environment.serverInfo.server = headers.server;
      }
      
      if (headers['x-powered-by']) {
        environment.serverInfo.poweredBy = headers['x-powered-by'];
      }

    } catch (error) {
      console.error('Hosting environment detection failed:', error);
      environment.error = error.message;
    }

    return environment;
  }

  /**
   * Detect theme and template information
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Theme detection results
   */
  async _detectThemeAndTemplate(context) {
    const themeInfo = {
      theme: 'unknown',
      template: 'unknown',
      customization: 'unknown',
      evidence: []
    };

    try {
      const { document } = context;
      const htmlContent = document.documentElement.innerHTML;

      // Look for theme-specific indicators
      const themePatterns = [
        { pattern: /theme[\/\-_]([^\/\s\?]+)/i, type: 'theme' },
        { pattern: /template[\/\-_]([^\/\s\?]+)/i, type: 'template' },
        { pattern: /wp-content\/themes\/([^\/]+)/i, type: 'wordpress_theme' },
        { pattern: /assets\/([^\/]+)\.css/i, type: 'asset_theme' }
      ];

      themePatterns.forEach(({ pattern, type }) => {
        const matches = htmlContent.match(pattern);
        if (matches && matches[1]) {
          themeInfo[type] = matches[1];
          themeInfo.evidence.push(`${type}: ${matches[1]}`);
        }
      });

    } catch (error) {
      console.error('Theme detection failed:', error);
      themeInfo.error = error.message;
    }

    return themeInfo;
  }

  /**
   * Detect plugins and extensions
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Plugin detection results
   */
  async _detectPluginsAndExtensions(context) {
    const plugins = {
      detected: [],
      count: 0,
      categories: {}
    };

    try {
      const { document } = context;
      const htmlContent = document.documentElement.innerHTML.toLowerCase();

      // Common e-commerce plugins and extensions
      const pluginPatterns = [
        { name: 'Google Analytics', pattern: 'google-analytics.com', category: 'analytics' },
        { name: 'Facebook Pixel', pattern: 'facebook.net/en_us/fbevents.js', category: 'analytics' },
        { name: 'Stripe', pattern: 'js.stripe.com', category: 'payment' },
        { name: 'PayPal', pattern: 'paypal.com/sdk', category: 'payment' },
        { name: 'Mailchimp', pattern: 'mailchimp.com', category: 'marketing' },
        { name: 'Klaviyo', pattern: 'klaviyo.com', category: 'marketing' },
        { name: 'Hotjar', pattern: 'hotjar.com', category: 'analytics' },
        { name: 'Zendesk', pattern: 'zendesk.com', category: 'support' },
        { name: 'Intercom', pattern: 'intercom.io', category: 'support' },
        { name: 'Yotpo', pattern: 'yotpo.com', category: 'reviews' }
      ];

      pluginPatterns.forEach(({ name, pattern, category }) => {
        if (htmlContent.includes(pattern)) {
          plugins.detected.push({ name, category });
          
          if (!plugins.categories[category]) {
            plugins.categories[category] = [];
          }
          plugins.categories[category].push(name);
        }
      });

      plugins.count = plugins.detected.length;

    } catch (error) {
      console.error('Plugin detection failed:', error);
      plugins.error = error.message;
    }

    return plugins;
  }

  /**
   * Analyze e-commerce indicators for confidence assessment
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} E-commerce indicators analysis
   */
  async _analyzeEcommerceIndicators(context) {
    const indicators = {
      hasCart: false,
      hasProducts: false,
      hasCheckout: false,
      hasPricing: false,
      strength: 'none',
      confidence: 0
    };

    try {
      const { document } = context;
      let indicatorCount = 0;

      // Check for cart indicators
      if (this._hasIndicators(document, this.ecommerceIndicators.cart)) {
        indicators.hasCart = true;
        indicatorCount++;
      }

      // Check for product indicators
      if (this._hasIndicators(document, this.ecommerceIndicators.product)) {
        indicators.hasProducts = true;
        indicatorCount++;
      }

      // Check for checkout indicators
      if (this._hasIndicators(document, this.ecommerceIndicators.checkout)) {
        indicators.hasCheckout = true;
        indicatorCount++;
      }

      // Check for pricing indicators
      if (this._hasIndicators(document, this.ecommerceIndicators.price)) {
        indicators.hasPricing = true;
        indicatorCount++;
      }

      // Calculate strength and confidence
      indicators.confidence = indicatorCount / 4;
      
      if (indicatorCount >= 3) indicators.strength = 'strong';
      else if (indicatorCount >= 2) indicators.strength = 'moderate';
      else if (indicatorCount >= 1) indicators.strength = 'weak';

    } catch (error) {
      console.error('E-commerce indicators analysis failed:', error);
      indicators.error = error.message;
    }

    return indicators;
  }

  /**
   * Check if document has any of the specified indicators
   * @param {Document} document - DOM document
   * @param {Array} selectors - Array of selectors to check
   * @returns {boolean} Whether any indicators were found
   */
  _hasIndicators(document, selectors) {
    return selectors.some(selector => {
      try {
        return document.querySelector(selector) !== null;
      } catch (e) {
        return false;
      }
    });
  }

  /**
   * Calculate overall detection confidence
   * @param {Object} results - Detection results
   * @returns {Object} Confidence assessment
   */
  _calculateOverallConfidence(results) {
    const confidence = {
      overall: 0,
      factors: {}
    };

    try {
      const weights = {
        platform: 0.4,
        ecommerceIndicators: 0.3,
        technologyStack: 0.2,
        hostingEnvironment: 0.1
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Platform confidence
      if (results.platform?.confidence) {
        confidence.factors.platform = results.platform.confidence;
        totalScore += results.platform.confidence * weights.platform;
        totalWeight += weights.platform;
      }

      // E-commerce indicators confidence
      if (results.ecommerceIndicators?.confidence) {
        confidence.factors.ecommerceIndicators = results.ecommerceIndicators.confidence;
        totalScore += results.ecommerceIndicators.confidence * weights.ecommerceIndicators;
        totalWeight += weights.ecommerceIndicators;
      }

      // Technology stack confidence (simplified)
      if (results.technologyStack) {
        const techCount = Object.values(results.technologyStack)
          .reduce((count, category) => count + Object.keys(category).length, 0);
        confidence.factors.technologyStack = Math.min(techCount / 10, 1); // Normalize to 0-1
        totalScore += confidence.factors.technologyStack * weights.technologyStack;
        totalWeight += weights.technologyStack;
      }

      // Hosting environment confidence
      if (results.hostingEnvironment?.confidence) {
        confidence.factors.hostingEnvironment = results.hostingEnvironment.confidence;
        totalScore += results.hostingEnvironment.confidence * weights.hostingEnvironment;
        totalWeight += weights.hostingEnvironment;
      }

      // Calculate overall confidence
      confidence.overall = totalWeight > 0 ? totalScore / totalWeight : 0;

    } catch (error) {
      console.error('Confidence calculation failed:', error);
    }

    return confidence;
  }
}

export default EcommercePlatformDetector;
