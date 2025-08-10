import { BaseAnalyzer } from '../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../core/AnalyzerInterface.js';

/**
 * Page Type Classification and Content Analysis
 * Automatically classifies web pages into semantic categories based on content patterns
 * 
 * @fileoverview Intelligent page classification for better audit organization
 * @version 1.0.0
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @date 2025-08-08
 */

/**
 * Page classification patterns and scoring weights
 */
export const PAGE_CLASSIFICATION = {
  // Content patterns for different page types
  PATTERNS: {
    HOMEPAGE: {
      url: [/^\/$/, /^\/home/, /^\/index/, /^\/main/],
      title: [/home/i, /welcome/i, /main/i],
      content: [/welcome/i, /about us/i, /our services/i, /get started/i],
      structure: ['hero', 'navigation', 'features', 'testimonials'],
      weight: 1.0
    },
    
    PRODUCT: {
      url: [/\/product/, /\/item/, /\/shop/, /\/buy/],
      title: [/product/i, /item/i, /shop/i, /buy/i],
      content: [/price/i, /add to cart/i, /buy now/i, /purchase/i, /order/i],
      meta: ['product', 'ecommerce', 'price', 'sku'],
      structure: ['price', 'cart', 'reviews', 'specifications'],
      weight: 0.9
    },
    
    ARTICLE: {
      url: [/\/article/, /\/post/, /\/blog/, /\/news/, /\/\d{4}\/\d{2}/],
      title: [/article/i, /post/i, /blog/i, /news/i],
      content: [/published/i, /author/i, /read more/i, /share/i],
      meta: ['article', 'news', 'blog', 'published'],
      structure: ['article', 'author', 'date', 'social-share'],
      weight: 0.8
    },
    
    CATEGORY: {
      url: [/\/category/, /\/section/, /\/archive/, /\/tag/],
      title: [/category/i, /archive/i, /section/i],
      content: [/browse/i, /filter/i, /sort/i, /showing/i, /results/i],
      structure: ['pagination', 'filters', 'listing', 'breadcrumbs'],
      weight: 0.7
    },
    
    CONTACT: {
      url: [/\/contact/, /\/support/, /\/help/],
      title: [/contact/i, /support/i, /help/i, /get in touch/i],
      content: [/contact us/i, /phone/i, /email/i, /address/i, /form/i],
      structure: ['form', 'contact-info', 'map'],
      weight: 0.9
    },
    
    ABOUT: {
      url: [/\/about/, /\/company/, /\/team/, /\/mission/],
      title: [/about/i, /company/i, /team/i, /mission/i, /who we are/i],
      content: [/about us/i, /our story/i, /mission/i, /vision/i, /team/i],
      structure: ['team', 'history', 'mission'],
      weight: 0.8
    },
    
    SEARCH: {
      url: [/\/search/, /\/find/, /\/results/],
      title: [/search/i, /results/i, /find/i],
      content: [/search results/i, /no results/i, /showing/i, /found/i],
      structure: ['search-form', 'results', 'pagination'],
      weight: 0.9
    },
    
    LOGIN: {
      url: [/\/login/, /\/signin/, /\/auth/, /\/account/],
      title: [/login/i, /sign in/i, /account/i, /authentication/i],
      content: [/username/i, /password/i, /login/i, /sign in/i, /forgot password/i],
      structure: ['login-form', 'registration-link'],
      weight: 1.0
    },
    
    REGISTRATION: {
      url: [/\/register/, /\/signup/, /\/join/],
      title: [/register/i, /sign up/i, /join/i, /create account/i],
      content: [/register/i, /sign up/i, /create account/i, /join us/i],
      structure: ['registration-form', 'terms'],
      weight: 1.0
    },
    
    CHECKOUT: {
      url: [/\/checkout/, /\/cart/, /\/order/, /\/payment/],
      title: [/checkout/i, /cart/i, /order/i, /payment/i],
      content: [/checkout/i, /total/i, /payment/i, /billing/i, /shipping/i],
      structure: ['cart-items', 'payment-form', 'shipping'],
      weight: 1.0
    },
    
    DOCUMENTATION: {
      url: [/\/docs/, /\/documentation/, /\/api/, /\/guide/],
      title: [/documentation/i, /docs/i, /api/i, /guide/i, /manual/i],
      content: [/documentation/i, /api/i, /reference/i, /guide/i, /tutorial/i],
      structure: ['code-blocks', 'navigation', 'examples'],
      weight: 0.8
    },
    
    FAQ: {
      url: [/\/faq/, /\/questions/, /\/help/],
      title: [/faq/i, /frequently asked/i, /questions/i],
      content: [/frequently asked/i, /questions/i, /answer/i, /q:/i, /a:/i],
      structure: ['questions', 'answers', 'search'],
      weight: 0.9
    },
    
    PRIVACY: {
      url: [/\/privacy/, /\/policy/, /\/terms/],
      title: [/privacy/i, /policy/i, /terms/i, /legal/i],
      content: [/privacy policy/i, /terms of service/i, /legal/i, /cookies/i],
      weight: 0.95
    },
    
    ERROR: {
      url: [/\/404/, /\/error/, /\/not-found/],
      title: [/404/i, /error/i, /not found/i, /page not found/i],
      content: [/404/i, /error/i, /not found/i, /page not found/i, /broken/i],
      weight: 1.0
    },
    
    LANDING: {
      url: [/\/landing/, /\/lp/, /\/promo/, /\/campaign/],
      title: [/landing/i, /promo/i, /special offer/i, /campaign/i],
      content: [/special offer/i, /limited time/i, /call to action/i, /sign up now/i],
      structure: ['hero', 'cta', 'benefits', 'testimonials'],
      weight: 0.8
    }
  },

  // Content structure indicators
  STRUCTURE_INDICATORS: {
    'hero': ['hero', 'banner', 'jumbotron', 'main-banner'],
    'navigation': ['nav', 'menu', 'navbar', 'navigation'],
    'article': ['article', 'post', 'content', 'main-content'],
    'form': ['form', 'contact-form', 'input', 'textarea'],
    'cart': ['cart', 'shopping-cart', 'basket'],
    'pagination': ['pagination', 'pager', 'page-numbers'],
    'breadcrumbs': ['breadcrumb', 'breadcrumbs', 'path'],
    'social-share': ['share', 'social', 'social-share']
  },

  // Semantic indicators in microdata/JSON-LD
  SCHEMA_TYPES: {
    'Article': 'ARTICLE',
    'NewsArticle': 'ARTICLE',
    'BlogPosting': 'ARTICLE',
    'Product': 'PRODUCT',
    'Organization': 'ABOUT',
    'ContactPage': 'CONTACT',
    'SearchResultsPage': 'SEARCH',
    'WebPage': 'GENERIC',
    'FAQPage': 'FAQ'
  }
};

/**
 * Page Type Classifier Class
 */
export class PageTypeClassifier extends BaseAnalyzer {
  constructor(options = {}) {
    super('PageTypeClassifier', {
      enableContentAnalysis: options.enableContentAnalysis !== false,
      enableStructureAnalysis: options.enableStructureAnalysis !== false,
      enableSemanticAnalysis: options.enableSemanticAnalysis !== false,
      confidenceThreshold: options.confidenceThreshold || 0.6,
      ...options,
    });
  }

  getMetadata() {
    return {
      name: 'PageTypeClassifier',
      version: '1.0.0',
      description: 'Automatically classifies web pages into semantic categories based on content patterns',
      category: AnalyzerCategories.CLASSIFICATION,
      priority: 'medium'
    };
  }

  /**
   * Perform comprehensive page classification analysis
   * @param {Document} document - DOM document
   * Main analysis method - supports both modern and legacy calling formats
   * @param {Object|Document} contextOrDocument - Analysis context object or legacy document
   * @param {Object|string} [pageDataOrUrl] - Legacy page data object or URL string
   * @param {string} [url] - Legacy page URL
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(contextOrDocument, pageDataOrUrl, url) {
    const {result, time} = await this.measureTime(async () => {
      try {
        this.log('info', 'Starting page classification analysis...');
        
        // Handle both modern and legacy calling formats
        let context;
        if (contextOrDocument && typeof contextOrDocument === 'object' && contextOrDocument.document) {
          // Modern format: analyze({document, url, pageData})
          context = contextOrDocument;
        } else if (contextOrDocument && contextOrDocument.nodeType === 9) {
          // Legacy format: analyze(document, pageDataOrUrl, url)
          let actualUrl;
          if (typeof pageDataOrUrl === 'string') {
            actualUrl = pageDataOrUrl;
          } else {
            actualUrl = url || '';
          }
          context = {
            document: contextOrDocument,
            url: actualUrl,
            pageData: (typeof pageDataOrUrl === 'object') ? pageDataOrUrl : {}
          };
        } else {
          throw new Error('Invalid context provided for page classification');
        }

        const { document, url: actualUrl = '', pageData = {} } = context;

        const classification = {
          // Primary classification
          primaryType: null,
          confidence: 0,
          
          // All detected types with scores
          detectedTypes: [],
          
          // Analysis components
          urlAnalysis: this._analyzeURL(actualUrl),
          titleAnalysis: this._analyzeTitle(document),
          contentAnalysis: this.options.enableContentAnalysis ? this._analyzeContent(document) : null,
          structureAnalysis: this.options.enableStructureAnalysis ? this._analyzeStructure(document) : null,
          semanticAnalysis: this.options.enableSemanticAnalysis ? this._analyzeSemanticMarkup(document) : null,
          
          // Additional insights
          pageCharacteristics: this._analyzePageCharacteristics(document),
          contentMetrics: this._analyzeContentMetrics(document),
          
          // Recommendations
          recommendations: []
        };

        // Calculate scores for each page type
        const typeScores = this._calculateTypeScores(classification);
        
        // Sort types by score
        classification.detectedTypes = Object.entries(typeScores)
          .map(([type, score]) => ({ type, score, confidence: score }))
          .sort((a, b) => b.score - a.score);

        // Set primary type
        if (classification.detectedTypes.length > 0) {
          const primaryMatch = classification.detectedTypes[0];
          if (primaryMatch.confidence >= this.options.confidenceThreshold) {
            classification.primaryType = primaryMatch.type;
            classification.confidence = primaryMatch.confidence;
          }
        }

        // Generate recommendations
        classification.recommendations = this._generateClassificationRecommendations(classification);
        
        this.log('info', `Page classification completed. Primary type: ${classification.primaryType || 'unclassified'} with confidence: ${Math.round(classification.confidence * 100)}%`);
        
        return classification;
      } catch (error) {
        this.log('error', `Page classification error: ${error.message}`);
        throw error;
      }
    });

    // Handle any errors and return standardized format
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: result.message,
        primaryType: null,
        confidence: 0,
        detectedTypes: [],
        recommendations: ['Fix classification errors to improve page analysis'],
        timestamp: new Date().toISOString(),
        executionTime: time
      };
    }
    
    return {
      success: true,
      primaryType: result.primaryType,
      confidence: result.confidence,
      detectedTypes: result.detectedTypes,
      urlAnalysis: result.urlAnalysis,
      titleAnalysis: result.titleAnalysis,
      contentAnalysis: result.contentAnalysis,
      structureAnalysis: result.structureAnalysis,
      semanticAnalysis: result.semanticAnalysis,
      recommendations: result.recommendations,
      timestamp: new Date().toISOString(),
      executionTime: time
    };
  }



  /**
   * Analyze URL patterns
   * @private
   */
  _analyzeURL(url) {
    const analysis = {
      matches: {},
      indicators: []
    };

    Object.entries(PAGE_CLASSIFICATION.PATTERNS).forEach(([type, config]) => {
      if (config.url) {
        const matches = config.url.filter(pattern => pattern.test(url));
        if (matches.length > 0) {
          analysis.matches[type] = matches.length;
          analysis.indicators.push({
            type,
            source: 'url',
            patterns: matches.map(m => m.toString()),
            weight: config.weight
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Analyze page title
   * @private
   */
  _analyzeTitle(document) {
    const title = document.title || '';
    const analysis = {
      title,
      matches: {},
      indicators: []
    };

    Object.entries(PAGE_CLASSIFICATION.PATTERNS).forEach(([type, config]) => {
      if (config.title) {
        const matches = config.title.filter(pattern => pattern.test(title));
        if (matches.length > 0) {
          analysis.matches[type] = matches.length;
          analysis.indicators.push({
            type,
            source: 'title',
            patterns: matches.map(m => m.toString()),
            weight: config.weight
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Analyze page content
   * @private
   */
  _analyzeContent(document) {
    const bodyText = document.body ? document.body.textContent.toLowerCase() : '';
    const headings = Array.from(this.safeQuery(document, 'h1, h2, h3')).map(h => h.textContent.toLowerCase());
    const combinedText = bodyText + ' ' + headings.join(' ');
    
    const analysis = {
      textLength: bodyText.length,
      headings: headings.length,
      matches: {},
      indicators: []
    };

    Object.entries(PAGE_CLASSIFICATION.PATTERNS).forEach(([type, config]) => {
      if (config.content) {
        const matches = config.content.filter(pattern => pattern.test(combinedText));
        if (matches.length > 0) {
          analysis.matches[type] = matches.length;
          analysis.indicators.push({
            type,
            source: 'content',
            patterns: matches.map(m => m.toString()),
            weight: config.weight || 0.8
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Analyze page structure and elements
   * @private
   */
  _analyzeStructure(document) {
    const analysis = {
      elements: {},
      matches: {},
      indicators: []
    };

    // Detect structural elements
    Object.entries(PAGE_CLASSIFICATION.STRUCTURE_INDICATORS).forEach(([structure, selectors]) => {
      const elements = selectors.reduce((count, selector) => {
        return count + Array.from(this.safeQuery(document, `[class*="${selector}"], [id*="${selector}"], ${selector}`)).length;
      }, 0);
      
      if (elements > 0) {
        analysis.elements[structure] = elements;
      }
    });

    // Match structures to page types
    Object.entries(PAGE_CLASSIFICATION.PATTERNS).forEach(([type, config]) => {
      if (config.structure) {
        const structureMatches = config.structure.filter(struct => analysis.elements[struct]);
        if (structureMatches.length > 0) {
          analysis.matches[type] = structureMatches.length;
          analysis.indicators.push({
            type,
            source: 'structure',
            structures: structureMatches,
            weight: config.weight || 0.7
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Analyze semantic markup (Schema.org, Open Graph, etc.)
   * @private
   */
  _analyzeSemanticMarkup(document) {
    const analysis = {
      schemaTypes: [],
      openGraph: {},
      microdata: {},
      jsonLd: [],
      matches: {},
      indicators: []
    };

    // JSON-LD Schema.org
    const jsonLdScripts = Array.from(this.safeQuery(document, 'script[type="application/ld+json"]'));
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type']) {
          analysis.schemaTypes.push(data['@type']);
          analysis.jsonLd.push(data);
        }
      } catch (e) {
        // Invalid JSON-LD
      }
    });

    // Microdata
    const microdataElements = Array.from(this.safeQuery(document, '[itemtype]'));
    microdataElements.forEach(element => {
      const itemType = element.getAttribute('itemtype');
      if (itemType) {
        const schemaType = itemType.split('/').pop();
        analysis.schemaTypes.push(schemaType);
      }
    });

    // Open Graph
    const ogElements = Array.from(this.safeQuery(document, 'meta[property^="og:"]'));
    ogElements.forEach(meta => {
      const property = meta.getAttribute('property').replace('og:', '');
      analysis.openGraph[property] = meta.getAttribute('content');
    });

    // Map schema types to page types
    analysis.schemaTypes.forEach(schemaType => {
      if (PAGE_CLASSIFICATION.SCHEMA_TYPES[schemaType]) {
        const pageType = PAGE_CLASSIFICATION.SCHEMA_TYPES[schemaType];
        analysis.matches[pageType] = (analysis.matches[pageType] || 0) + 1;
        analysis.indicators.push({
          type: pageType,
          source: 'semantic',
          schemaType,
          weight: 0.9
        });
      }
    });

    return analysis;
  }

  /**
   * Analyze general page characteristics
   * @private
   */
  _analyzePageCharacteristics(document) {
    const characteristics = {
      hasForm: Array.from(this.safeQuery(document, 'form')).length > 0,
      hasTable: Array.from(this.safeQuery(document, 'table')).length > 0,
      hasVideo: Array.from(this.safeQuery(document, 'video, iframe[src*="youtube"], iframe[src*="vimeo"]')).length > 0,
      hasImages: Array.from(this.safeQuery(document, 'img')).length,
      hasNavigation: Array.from(this.safeQuery(document, 'nav, [role="navigation"]')).length > 0,
      hasSearch: Array.from(this.safeQuery(document, 'input[type="search"], [role="search"]')).length > 0,
      hasBreadcrumbs: Array.from(this.safeQuery(document, '[class*="breadcrumb"]')).length > 0,
      hasPagination: Array.from(this.safeQuery(document, '[class*="pagination"], [class*="pager"]')).length > 0,
      hasSocialShare: Array.from(this.safeQuery(document, '[class*="share"], [class*="social"]')).length > 0,
      hasComments: Array.from(this.safeQuery(document, '[class*="comment"]')).length > 0,
      hasRating: Array.from(this.safeQuery(document, '[class*="rating"], [class*="star"]')).length > 0,
      hasCart: Array.from(this.safeQuery(document, '[class*="cart"], [class*="basket"]')).length > 0,
      hasPrice: /\$[\d,]+|\£[\d,]+|€[\d,]+|₹[\d,]+/.test(document.body ? document.body.textContent : '')
    };

    return characteristics;
  }

  /**
   * Analyze content metrics
   * @private
   */
  _analyzeContentMetrics(document) {
    const bodyText = document.body ? document.body.textContent : '';
    const words = bodyText.trim().split(/\s+/).length;
    
    return {
      wordCount: words,
      headingCount: Array.from(this.safeQuery(document, 'h1, h2, h3, h4, h5, h6')).length,
      paragraphCount: Array.from(this.safeQuery(document, 'p')).length,
      linkCount: Array.from(this.safeQuery(document, 'a')).length,
      imageCount: Array.from(this.safeQuery(document, 'img')).length,
      listCount: Array.from(this.safeQuery(document, 'ul, ol')).length,
      readingTime: Math.ceil(words / 200), // Assuming 200 words per minute
      contentToCodeRatio: this._calculateContentToCodeRatio(document)
    };
  }

  /**
   * Calculate content-to-code ratio
   * @private
   */
  _calculateContentToCodeRatio(document) {
    const textContent = document.body ? document.body.textContent.length : 0;
    const htmlContent = document.documentElement.outerHTML.length;
    
    return htmlContent > 0 ? Math.round((textContent / htmlContent) * 100) : 0;
  }

  /**
   * Calculate scores for each page type
   * @private
   */
  _calculateTypeScores(classification) {
    const scores = {};
    
    // Initialize scores
    Object.keys(PAGE_CLASSIFICATION.PATTERNS).forEach(type => {
      scores[type] = 0;
    });

    // Add scores from URL analysis
    if (classification.urlAnalysis.indicators) {
      classification.urlAnalysis.indicators.forEach(indicator => {
        scores[indicator.type] += indicator.weight * 0.3; // URL weight: 30%
      });
    }

    // Add scores from title analysis
    if (classification.titleAnalysis.indicators) {
      classification.titleAnalysis.indicators.forEach(indicator => {
        scores[indicator.type] += indicator.weight * 0.25; // Title weight: 25%
      });
    }

    // Add scores from content analysis
    if (classification.contentAnalysis && classification.contentAnalysis.indicators) {
      classification.contentAnalysis.indicators.forEach(indicator => {
        scores[indicator.type] += indicator.weight * 0.2; // Content weight: 20%
      });
    }

    // Add scores from structure analysis
    if (classification.structureAnalysis && classification.structureAnalysis.indicators) {
      classification.structureAnalysis.indicators.forEach(indicator => {
        scores[indicator.type] += indicator.weight * 0.15; // Structure weight: 15%
      });
    }

    // Add scores from semantic analysis
    if (classification.semanticAnalysis && classification.semanticAnalysis.indicators) {
      classification.semanticAnalysis.indicators.forEach(indicator => {
        scores[indicator.type] += indicator.weight * 0.1; // Semantic weight: 10%
      });
    }

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      Object.keys(scores).forEach(type => {
        scores[type] = scores[type] / maxScore;
      });
    }

    return scores;
  }

  /**
   * Generate recommendations based on classification
   * @private
   */
  _generateClassificationRecommendations(classification) {
    const recommendations = [];
    
    // Low confidence warning
    if (classification.confidence < this.options.confidenceThreshold) {
      recommendations.push({
        category: 'classification',
        priority: 'medium',
        title: 'Improve Page Type Clarity',
        description: `Page type classification confidence is low (${Math.round(classification.confidence * 100)}%)`,
        action: 'Add semantic markup, improve URL structure, or clarify page content'
      });
    }

    // Missing semantic markup
    if (!classification.semanticAnalysis || classification.semanticAnalysis.schemaTypes.length === 0) {
      recommendations.push({
        category: 'seo',
        priority: 'medium',
        title: 'Add Structured Data',
        description: 'No Schema.org markup detected',
        action: 'Add JSON-LD structured data to help search engines understand page content'
      });
    }

    // Page-specific recommendations
    if (classification.primaryType) {
      const typeRecommendations = this._getTypeSpecificRecommendations(
        classification.primaryType,
        classification.pageCharacteristics
      );
      recommendations.push(...typeRecommendations);
    }

    return recommendations;
  }

  /**
   * Get recommendations specific to page type
   * @private
   */
  _getTypeSpecificRecommendations(pageType, characteristics) {
    const recommendations = [];

    switch (pageType) {
      case 'PRODUCT':
        if (!characteristics.hasPrice) {
          recommendations.push({
            category: 'ecommerce',
            priority: 'high',
            title: 'Add Product Pricing',
            description: 'Product page without visible pricing',
            action: 'Display clear pricing information for better user experience'
          });
        }
        if (!characteristics.hasCart) {
          recommendations.push({
            category: 'ecommerce',
            priority: 'high',
            title: 'Add Shopping Cart Functionality',
            description: 'Product page without add-to-cart button',
            action: 'Include shopping cart functionality for product purchases'
          });
        }
        break;

      case 'ARTICLE':
        if (!characteristics.hasSocialShare) {
          recommendations.push({
            category: 'content',
            priority: 'medium',
            title: 'Add Social Sharing',
            description: 'Article without social sharing buttons',
            action: 'Include social media sharing options to increase engagement'
          });
        }
        break;

      case 'CONTACT':
        if (!characteristics.hasForm) {
          recommendations.push({
            category: 'ux',
            priority: 'high',
            title: 'Add Contact Form',
            description: 'Contact page without contact form',
            action: 'Include a contact form for easy communication'
          });
        }
        break;

      case 'CATEGORY':
        if (!characteristics.hasPagination) {
          recommendations.push({
            category: 'ux',
            priority: 'medium',
            title: 'Add Pagination',
            description: 'Category page without pagination',
            action: 'Include pagination for better content navigation'
          });
        }
        break;
    }

    return recommendations;
  }

  /**
   * Get human-readable page type name
   * @param {string} type - Page type code
   * @returns {string} Human-readable name
   */
  getPageTypeName(type) {
    const names = {
      'HOMEPAGE': 'Homepage',
      'PRODUCT': 'Product Page',
      'ARTICLE': 'Article/Blog Post',
      'CATEGORY': 'Category/Listing Page',
      'CONTACT': 'Contact Page',
      'ABOUT': 'About Page',
      'SEARCH': 'Search Results',
      'LOGIN': 'Login Page',
      'REGISTRATION': 'Registration Page',
      'CHECKOUT': 'Checkout Page',
      'DOCUMENTATION': 'Documentation',
      'FAQ': 'FAQ Page',
      'PRIVACY': 'Privacy/Legal Page',
      'ERROR': 'Error Page',
      'LANDING': 'Landing Page'
    };

    return names[type] || 'Unknown Page Type';
  }

  /**
   * Analyze page classification trends across multiple pages
   * @param {Array} classifications - Array of page classifications
   * @returns {Object} Site-wide classification analysis
   */
  analyzeSiteStructure(classifications) {
    const analysis = {
      totalPages: classifications.length,
      pageTypes: {},
      confidence: {
        high: 0,
        medium: 0,
        low: 0
      },
      recommendations: []
    };

    // Count page types and confidence levels
    classifications.forEach(classification => {
      const type = classification.primaryType || 'UNKNOWN';
      analysis.pageTypes[type] = (analysis.pageTypes[type] || 0) + 1;

      if (classification.confidence >= 0.8) {
        analysis.confidence.high++;
      } else if (classification.confidence >= 0.5) {
        analysis.confidence.medium++;
      } else {
        analysis.confidence.low++;
      }
    });

    // Generate site-wide recommendations
    if (analysis.confidence.low > analysis.totalPages * 0.3) {
      analysis.recommendations.push({
        category: 'site-structure',
        priority: 'high',
        title: 'Improve Site Structure Clarity',
        description: `${analysis.confidence.low} pages have unclear classification`,
        action: 'Review URL structure, page titles, and content organization'
      });
    }

    return analysis;
  }
}
