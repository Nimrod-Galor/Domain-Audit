/**
 * PLATFORM DETECTOR MODULE
 * Detects e-commerce platforms and technologies
 */

/**
 * E-commerce Platform Detector
 * Identifies various e-commerce platforms, frameworks, and technologies
 */
export class PlatformDetector {
  constructor(options = {}) {
    this.options = {
      enableAdvancedDetection: options.enableAdvancedDetection !== false,
      detectCustomPlatforms: options.detectCustomPlatforms !== false,
      analyzeJavaScript: options.analyzeJavaScript !== false,
      ...options
    };

    // Platform detection patterns
    this.platformPatterns = {
      // Major E-commerce Platforms
      shopify: {
        indicators: [
          /shopify/i,
          /cdn\.shopify\.com/i,
          /shop\.app/i,
          /myshopify\.com/i,
          /Shopify\.theme/i,
          /shopify-section/i,
          /"platform":"shopify"/i,
          /shopify-analytics/i
        ],
        confidence: 0.9,
        version: this._extractShopifyVersion.bind(this)
      },
      woocommerce: {
        indicators: [
          /woocommerce/i,
          /wc-block/i,
          /wp-content.*woocommerce/i,
          /"woocommerce"/i,
          /woocommerce-page/i,
          /wc-setup/i,
          /woocommerce-cart/i
        ],
        confidence: 0.85,
        version: this._extractWooCommerceVersion.bind(this)
      },
      magento: {
        indicators: [
          /magento/i,
          /mage\/cookies/i,
          /var\/magento/i,
          /Mage\.Cookies/i,
          /magento_cache/i,
          /magestore/i,
          /"platform":"magento"/i
        ],
        confidence: 0.9,
        version: this._extractMagentoVersion.bind(this)
      },
      bigcommerce: {
        indicators: [
          /bigcommerce/i,
          /mybigcommerce\.com/i,
          /bc-sf-filter/i,
          /bigcommerce-api/i,
          /"platform":"bigcommerce"/i,
          /bc-original-price/i
        ],
        confidence: 0.9,
        version: this._extractBigCommerceVersion.bind(this)
      },
      squarespace: {
        indicators: [
          /squarespace/i,
          /squarespace-cdn/i,
          /sqs-block/i,
          /squarespace-commerce/i,
          /"platform":"squarespace"/i,
          /sqs-cart/i
        ],
        confidence: 0.85,
        version: this._extractSquarespaceVersion.bind(this)
      },
      wix: {
        indicators: [
          /wix\.com/i,
          /wixstatic\.com/i,
          /wix-stores/i,
          /wixsite\.com/i,
          /"platform":"wix"/i,
          /wix-ecommerce/i
        ],
        confidence: 0.8,
        version: this._extractWixVersion.bind(this)
      },
      prestashop: {
        indicators: [
          /prestashop/i,
          /ps_version/i,
          /prestashop-core/i,
          /"prestashop"/i,
          /ps-product/i,
          /prestashop-cart/i
        ],
        confidence: 0.85,
        version: this._extractPrestashopVersion.bind(this)
      },
      opencart: {
        indicators: [
          /opencart/i,
          /catalog\/view\/theme/i,
          /opencart-theme/i,
          /"opencart"/i,
          /oc-cart/i,
          /opencart-checkout/i
        ],
        confidence: 0.8,
        version: this._extractOpenCartVersion.bind(this)
      },

      // Headless/API-First Platforms
      commercejs: {
        indicators: [
          /commerce\.js/i,
          /commercejs/i,
          /chec\.io/i,
          /"platform":"commercejs"/i
        ],
        confidence: 0.9,
        version: this._extractCommerceJSVersion.bind(this)
      },
      saleor: {
        indicators: [
          /saleor/i,
          /saleor-api/i,
          /"platform":"saleor"/i,
          /saleor-storefront/i
        ],
        confidence: 0.9,
        version: this._extractSaleorVersion.bind(this)
      },

      // Custom/Framework-based
      nextjs: {
        indicators: [
          /_next\/static/i,
          /next\.js/i,
          /__NEXT_DATA__/i,
          /"framework":"next"/i
        ],
        confidence: 0.7,
        version: this._extractNextJSVersion.bind(this)
      },
      react: {
        indicators: [
          /react/i,
          /_react/i,
          /react-dom/i,
          /"react"/i
        ],
        confidence: 0.6,
        version: this._extractReactVersion.bind(this)
      },
      vue: {
        indicators: [
          /vue\.js/i,
          /vuejs/i,
          /__VUE__/i,
          /"vue"/i
        ],
        confidence: 0.6,
        version: this._extractVueVersion.bind(this)
      }
    };

    // Payment processor patterns
    this.paymentPatterns = {
      stripe: [/stripe/i, /js\.stripe\.com/i],
      paypal: [/paypal/i, /paypalobjects/i],
      square: [/squareup/i, /square\.com/i],
      braintree: [/braintree/i, /braintreegateway/i],
      adyen: [/adyen/i, /adyen\.com/i],
      klarna: [/klarna/i, /klarna\.com/i],
      afterpay: [/afterpay/i, /afterpay\.com/i]
    };

    // Analytics and tracking patterns
    this.analyticsPatterns = {
      googleAnalytics: [/google-analytics/i, /gtag/i, /ga\.js/i],
      googleTagManager: [/googletagmanager/i, /gtm\.js/i],
      facebookPixel: [/facebook.*pixel/i, /fbevents/i],
      hotjar: [/hotjar/i, /hj\.js/i],
      crazyegg: [/crazyegg/i, /ce\.js/i],
      mixpanel: [/mixpanel/i, /mixpanel\.com/i]
    };
  }

  /**
   * Detect e-commerce platform from DOM and content
   * @param {Object} dom - Cheerio DOM object
   * @param {string} url - Page URL
   * @param {string} html - Raw HTML content
   * @returns {Object} Platform detection results
   */
  detectPlatform(dom, url = '', html = '') {
    try {
      const detection = {
        platform: 'unknown',
        confidence: 0,
        version: null,
        indicators: [],
        technologies: {
          payments: [],
          analytics: [],
          frameworks: []
        },
        metadata: {
          detectionMethod: 'comprehensive',
          timestamp: new Date().toISOString(),
          url: url
        }
      };

      // Get combined text content for analysis
      const textContent = this._getAnalysisContent(dom, html);

      // Detect primary platform
      const platformResult = this._detectPrimaryPlatform(textContent, dom);
      if (platformResult.platform !== 'unknown') {
        detection.platform = platformResult.platform;
        detection.confidence = platformResult.confidence;
        detection.version = platformResult.version;
        detection.indicators = platformResult.indicators;
      }

      // Detect additional technologies
      detection.technologies.payments = this._detectPaymentProcessors(textContent);
      detection.technologies.analytics = this._detectAnalyticsTools(textContent);
      detection.technologies.frameworks = this._detectFrameworks(textContent);

      // Enhanced detection for custom platforms
      if (detection.platform === 'unknown' && this.options.enableAdvancedDetection) {
        const customDetection = this._detectCustomPlatform(dom, textContent);
        if (customDetection.platform !== 'unknown') {
          detection.platform = customDetection.platform;
          detection.confidence = customDetection.confidence;
          detection.indicators = customDetection.indicators;
        }
      }

      // Final confidence adjustment based on multiple indicators
      detection.confidence = this._adjustConfidenceScore(detection);

      return detection;

    } catch (error) {
      return {
        platform: 'unknown',
        confidence: 0,
        version: null,
        indicators: [],
        technologies: { payments: [], analytics: [], frameworks: [] },
        error: `Platform detection failed: ${error.message}`,
        metadata: {
          detectionMethod: 'error',
          timestamp: new Date().toISOString(),
          url: url
        }
      };
    }
  }

  /**
   * Get combined content for analysis
   */
  _getAnalysisContent(dom, html) {
    const scripts = dom('script').map((i, el) => dom(el).html()).get().join(' ');
    const links = dom('link[href]').map((i, el) => dom(el).attr('href')).get().join(' ');
    const metas = dom('meta[content]').map((i, el) => dom(el).attr('content')).get().join(' ');
    const classes = dom('[class]').map((i, el) => dom(el).attr('class')).get().join(' ');
    
    return `${html} ${scripts} ${links} ${metas} ${classes}`;
  }

  /**
   * Detect primary e-commerce platform
   */
  _detectPrimaryPlatform(content, dom) {
    let bestMatch = { platform: 'unknown', confidence: 0, version: null, indicators: [] };

    for (const [platform, config] of Object.entries(this.platformPatterns)) {
      const matches = [];
      let totalConfidence = 0;

      for (const pattern of config.indicators) {
        if (pattern.test(content)) {
          matches.push(pattern.source);
          totalConfidence += 0.1;
        }
      }

      if (matches.length > 0) {
        const confidence = Math.min(config.confidence * (matches.length / config.indicators.length), 1.0);
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            platform: platform,
            confidence: confidence,
            version: config.version ? config.version(content, dom) : null,
            indicators: matches
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Detect payment processors
   */
  _detectPaymentProcessors(content) {
    const detected = [];
    
    for (const [processor, patterns] of Object.entries(this.paymentPatterns)) {
      if (patterns.some(pattern => pattern.test(content))) {
        detected.push(processor);
      }
    }
    
    return detected;
  }

  /**
   * Detect analytics tools
   */
  _detectAnalyticsTools(content) {
    const detected = [];
    
    for (const [tool, patterns] of Object.entries(this.analyticsPatterns)) {
      if (patterns.some(pattern => pattern.test(content))) {
        detected.push(tool);
      }
    }
    
    return detected;
  }

  /**
   * Detect JavaScript frameworks
   */
  _detectFrameworks(content) {
    const frameworks = [];
    
    if (this.platformPatterns.nextjs.indicators.some(pattern => pattern.test(content))) {
      frameworks.push('nextjs');
    }
    if (this.platformPatterns.react.indicators.some(pattern => pattern.test(content))) {
      frameworks.push('react');
    }
    if (this.platformPatterns.vue.indicators.some(pattern => pattern.test(content))) {
      frameworks.push('vue');
    }
    
    return frameworks;
  }

  /**
   * Detect custom/unknown platforms
   */
  _detectCustomPlatform(dom, content) {
    // Look for common e-commerce indicators without specific platform signatures
    const genericIndicators = [
      /add.*to.*cart/i,
      /shopping.*cart/i,
      /checkout/i,
      /product.*price/i,
      /buy.*now/i,
      /add.*basket/i,
      /e-?commerce/i,
      /shop.*online/i
    ];

    const matches = genericIndicators.filter(pattern => pattern.test(content));
    
    if (matches.length >= 3) {
      return {
        platform: 'custom',
        confidence: 0.6,
        indicators: matches.map(m => m.source)
      };
    }

    return { platform: 'unknown', confidence: 0, indicators: [] };
  }

  /**
   * Adjust confidence score based on multiple factors
   */
  _adjustConfidenceScore(detection) {
    let confidence = detection.confidence;

    // Boost confidence if multiple technologies detected
    if (detection.technologies.payments.length > 0) confidence += 0.1;
    if (detection.technologies.analytics.length > 0) confidence += 0.05;
    if (detection.technologies.frameworks.length > 0) confidence += 0.05;

    // Boost confidence if multiple indicators found
    if (detection.indicators.length > 3) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Version extraction methods
  _extractShopifyVersion(content, dom) {
    const versionMatch = content.match(/shopify[^"]*version[^"]*["]([^"]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractWooCommerceVersion(content, dom) {
    const versionMatch = content.match(/woocommerce[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractMagentoVersion(content, dom) {
    const versionMatch = content.match(/magento[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractBigCommerceVersion(content, dom) {
    const versionMatch = content.match(/bigcommerce[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractSquarespaceVersion(content, dom) {
    const versionMatch = content.match(/squarespace[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractWixVersion(content, dom) {
    const versionMatch = content.match(/wix[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractPrestashopVersion(content, dom) {
    const versionMatch = content.match(/prestashop[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractOpenCartVersion(content, dom) {
    const versionMatch = content.match(/opencart[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractCommerceJSVersion(content, dom) {
    const versionMatch = content.match(/commerce\.js[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractSaleorVersion(content, dom) {
    const versionMatch = content.match(/saleor[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractNextJSVersion(content, dom) {
    const versionMatch = content.match(/next[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractReactVersion(content, dom) {
    const versionMatch = content.match(/react[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  _extractVueVersion(content, dom) {
    const versionMatch = content.match(/vue[^"]*["]([0-9.]+)/i);
    return versionMatch ? versionMatch[1] : 'unknown';
  }
}
