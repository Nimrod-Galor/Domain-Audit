/**
 * ============================================================================
 * E-COMMERCE CONSTANTS
 * ============================================================================
 *
 * Constants and standards for e-commerce analysis including:
 * - Platform detection patterns
 * - E-commerce best practices
 * - Schema markup standards
 * - Payment method standards
 * - Review system standards
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

export const ECOMMERCE_STANDARDS = {
  /**
   * E-commerce platform detection patterns
   */
  PLATFORMS: {
    shopify: {
      indicators: [
        '.shopify',
        'cdn.shopify.com',
        '/cart',
        '/checkout',
        'shopify-section',
        'shopify-payment-button'
      ],
      name: 'Shopify',
      type: 'hosted'
    },
    woocommerce: {
      indicators: [
        '.woocommerce',
        '.cart-contents',
        '.product',
        'wc-',
        'woocommerce-',
        'add-to-cart'
      ],
      name: 'WooCommerce',
      type: 'plugin'
    },
    magento: {
      indicators: [
        '.page-product',
        '.checkout-cart',
        'magento',
        'mage-',
        'catalog-product'
      ],
      name: 'Magento',
      type: 'platform'
    },
    bigcommerce: {
      indicators: [
        '.productView',
        '.cart-item',
        'bigcommerce',
        '.product-single'
      ],
      name: 'BigCommerce',
      type: 'hosted'
    },
    prestashop: {
      indicators: [
        'prestashop',
        '.product-container',
        '.shopping_cart'
      ],
      name: 'PrestaShop',
      type: 'platform'
    },
    opencart: {
      indicators: [
        'opencart',
        'route=product',
        'route=checkout'
      ],
      name: 'OpenCart',
      type: 'platform'
    },
    custom: {
      indicators: [
        '.add-to-cart',
        '.shopping-cart',
        '.product-price',
        '.checkout',
        '.buy-now'
      ],
      name: 'Custom',
      type: 'custom'
    }
  },

  /**
   * Product schema required fields
   */
  PRODUCT_SCHEMA: {
    required: [
      'name',
      'description',
      'price',
      'availability',
      'brand'
    ],
    recommended: [
      'sku',
      'gtin',
      'mpn',
      'condition',
      'category',
      'image',
      'review',
      'aggregateRating'
    ],
    optional: [
      'color',
      'size',
      'weight',
      'material',
      'manufacturer',
      'model',
      'productID'
    ]
  },

  /**
   * Review schema standards
   */
  REVIEW_SCHEMA: {
    types: ['Review', 'AggregateRating'],
    required: {
      Review: ['author', 'reviewRating', 'reviewBody'],
      AggregateRating: ['ratingValue', 'reviewCount']
    },
    recommended: {
      Review: ['datePublished', 'headline', 'itemReviewed'],
      AggregateRating: ['bestRating', 'worstRating']
    }
  },

  /**
   * Payment method standards
   */
  PAYMENT_METHODS: {
    creditCards: [
      'visa',
      'mastercard',
      'american-express',
      'discover',
      'diners-club',
      'jcb'
    ],
    digitalWallets: [
      'paypal',
      'apple-pay',
      'google-pay',
      'samsung-pay',
      'amazon-pay'
    ],
    buyNowPayLater: [
      'klarna',
      'afterpay',
      'sezzle',
      'affirm',
      'zip',
      'quadpay'
    ],
    cryptocurrencies: [
      'bitcoin',
      'ethereum',
      'litecoin',
      'bitcoin-cash'
    ],
    bankTransfers: [
      'ach',
      'wire-transfer',
      'sepa',
      'ideal'
    ]
  },

  /**
   * Security standards
   */
  SECURITY: {
    required: [
      'https',
      'ssl-certificate'
    ],
    recommended: [
      'pci-compliance',
      'security-badges',
      'trust-seals',
      'privacy-policy',
      'terms-of-service'
    ],
    trustBadges: [
      'verisign',
      'mcafee',
      'norton',
      'trustpilot',
      'bbb',
      'google-trusted-store'
    ]
  },

  /**
   * Conversion optimization standards
   */
  CONVERSION: {
    callToAction: {
      required: ['add-to-cart', 'buy-now'],
      recommended: ['wishlist', 'compare', 'quick-view']
    },
    productInfo: {
      required: ['title', 'price', 'description', 'images'],
      recommended: ['reviews', 'specifications', 'shipping-info']
    },
    trustSignals: [
      'money-back-guarantee',
      'free-shipping',
      'secure-checkout',
      'customer-reviews',
      'return-policy'
    ],
    urgencyIndicators: [
      'limited-time',
      'limited-stock',
      'sale-countdown',
      'recently-viewed'
    ]
  },

  /**
   * User experience standards
   */
  UX_STANDARDS: {
    navigation: {
      required: ['search', 'categories', 'cart-access'],
      recommended: ['breadcrumbs', 'filters', 'sorting']
    },
    productPages: {
      required: ['product-images', 'price', 'add-to-cart', 'description'],
      recommended: ['reviews', 'related-products', 'specifications', 'shipping-info']
    },
    checkout: {
      required: ['guest-checkout', 'secure-payment', 'order-summary'],
      recommended: ['progress-indicator', 'multiple-payment-methods', 'address-validation']
    }
  },

  /**
   * Mobile optimization standards
   */
  MOBILE: {
    required: [
      'responsive-design',
      'touch-friendly-buttons',
      'mobile-payment-options'
    ],
    recommended: [
      'mobile-specific-features',
      'one-handed-usage',
      'fast-loading'
    ]
  },

  /**
   * Accessibility standards
   */
  ACCESSIBILITY: {
    required: [
      'keyboard-navigation',
      'screen-reader-support',
      'alt-text-images'
    ],
    recommended: [
      'high-contrast-mode',
      'font-scaling',
      'focus-indicators'
    ]
  },

  /**
   * Performance standards
   */
  PERFORMANCE: {
    loadTime: {
      excellent: 2000, // 2 seconds
      good: 3000,      // 3 seconds
      fair: 5000,      // 5 seconds
      poor: 5001       // > 5 seconds
    },
    imageOptimization: {
      formats: ['webp', 'avif', 'jpeg', 'png'],
      sizes: ['thumbnail', 'medium', 'large'],
      lazyLoading: true
    }
  },

  /**
   * SEO standards for e-commerce
   */
  SEO: {
    productPages: {
      required: ['title-tag', 'meta-description', 'h1-tag', 'canonical-url'],
      recommended: ['breadcrumb-schema', 'product-schema', 'image-alt-text']
    },
    categoryPages: {
      required: ['title-tag', 'meta-description', 'h1-tag'],
      recommended: ['pagination-tags', 'filter-urls', 'category-schema']
    }
  },

  /**
   * Analytics and tracking standards
   */
  ANALYTICS: {
    required: [
      'google-analytics',
      'conversion-tracking'
    ],
    recommended: [
      'enhanced-ecommerce',
      'goal-tracking',
      'event-tracking',
      'facebook-pixel'
    ]
  },

  /**
   * Scoring weights for different aspects
   */
  SCORING_WEIGHTS: {
    productSchema: 0.25,
    checkout: 0.20,
    security: 0.20,
    reviews: 0.15,
    conversion: 0.15,
    performance: 0.05
  },

  /**
   * Benchmark scores
   */
  BENCHMARKS: {
    excellent: 90,
    good: 80,
    fair: 70,
    poor: 60,
    critical: 50
  },

  /**
   * Common e-commerce URL patterns
   */
  URL_PATTERNS: {
    product: [
      '/product/',
      '/p/',
      '/item/',
      '/products/',
      '/shop/'
    ],
    category: [
      '/category/',
      '/categories/',
      '/collection/',
      '/collections/',
      '/shop/'
    ],
    cart: [
      '/cart',
      '/basket',
      '/bag',
      '/shopping-cart'
    ],
    checkout: [
      '/checkout',
      '/order',
      '/payment',
      '/billing'
    ]
  },

  /**
   * Common e-commerce file extensions
   */
  FILE_EXTENSIONS: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'],
    scripts: ['.js', '.ts'],
    styles: ['.css', '.scss', '.sass'],
    data: ['.json', '.xml', '.csv']
  },

  /**
   * Error messages and recommendations
   */
  MESSAGES: {
    noEcommerce: 'No e-commerce indicators detected on this page.',
    platformDetected: 'E-commerce platform detected: {platform}',
    schemaIssues: 'Product schema markup has validation issues.',
    securityWarning: 'Payment security features need improvement.',
    conversionOptimization: 'Conversion optimization opportunities identified.'
  },

  /**
   * Regular expressions for detection
   */
  REGEX_PATTERNS: {
    price: /\$\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:USD|EUR|GBP|CAD|AUD)/i,
    sku: /SKU:\s*([A-Z0-9-]+)/i,
    productId: /Product\s*ID:\s*([A-Z0-9-]+)/i,
    availability: /(in\s*stock|out\s*of\s*stock|available|unavailable|sold\s*out)/i,
    shipping: /(free\s*shipping|shipping:\s*\$?\d+|delivery|expedited)/i,
    guarantee: /(money.?back|satisfaction|guarantee|warranty)/i
  }
};

/**
 * Helper functions for e-commerce analysis
 */
export const ECOMMERCE_HELPERS = {
  /**
   * Check if platform matches indicators
   */
  matchesPlatform(content, platform) {
    const indicators = ECOMMERCE_STANDARDS.PLATFORMS[platform]?.indicators || [];
    return indicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  },

  /**
   * Get platform by indicators
   */
  detectPlatform(content, url) {
    const platforms = Object.keys(ECOMMERCE_STANDARDS.PLATFORMS);
    
    for (const platform of platforms) {
      if (this.matchesPlatform(content + ' ' + url, platform)) {
        return ECOMMERCE_STANDARDS.PLATFORMS[platform];
      }
    }
    
    return null;
  },

  /**
   * Calculate score grade
   */
  getScoreGrade(score) {
    const benchmarks = ECOMMERCE_STANDARDS.BENCHMARKS;
    
    if (score >= benchmarks.excellent) return 'A';
    if (score >= benchmarks.good) return 'B';
    if (score >= benchmarks.fair) return 'C';
    if (score >= benchmarks.poor) return 'D';
    return 'F';
  },

  /**
   * Validate required fields
   */
  validateRequiredFields(data, type) {
    const required = ECOMMERCE_STANDARDS.PRODUCT_SCHEMA.required;
    const missing = [];
    
    required.forEach(field => {
      if (!data[field]) {
        missing.push(field);
      }
    });
    
    return {
      isValid: missing.length === 0,
      missing: missing
    };
  },

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};
