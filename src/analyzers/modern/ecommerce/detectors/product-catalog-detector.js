/**
 * ============================================================================
 * PRODUCT CATALOG DETECTOR - GPT-5 STYLE DETECTOR
 * ============================================================================
 * 
 * Advanced product catalog analysis and optimization detection
 * Part of E-commerce Analyzer Combined Approach (13th Implementation)
 * 
 * Detection Capabilities:
 * - Product listing and catalog structure analysis
 * - Product detail page optimization detection
 * - Product schema markup validation
 * - Product image and media analysis
 * - Product information completeness assessment
 * - Product categorization and navigation analysis
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ProductCatalogDetector {
  constructor(options = {}) {
    this.options = {
      // Detection Configuration
      enableProductListing: options.enableProductListing !== false,
      enableProductDetails: options.enableProductDetails !== false,
      enableSchemaValidation: options.enableSchemaValidation !== false,
      enableImageAnalysis: options.enableImageAnalysis !== false,
      enableCategoryAnalysis: options.enableCategoryAnalysis !== false,
      
      // Analysis Parameters
      detectionDepth: options.detectionDepth || 'comprehensive',
      productCountThreshold: options.productCountThreshold || 1,
      imageQualityThreshold: options.imageQualityThreshold || 300, // minimum width/height
      
      // Optimization Scoring
      completenessWeights: options.completenessWeights || {
        title: 0.2,
        description: 0.2,
        price: 0.2,
        images: 0.15,
        schema: 0.1,
        reviews: 0.1,
        availability: 0.05
      },
      
      ...options
    };

    this.detectorType = 'product_catalog_detector';
    this.version = '1.0.0';
    
    // Product element patterns
    this.productPatterns = {
      // Product containers
      containers: [
        '.product', '.item', '.product-item', '.product-card',
        '.product-tile', '.product-box', '[data-product]',
        '[itemtype*="Product"]', '.woocommerce-product',
        '.product-listing-item', '.catalog-item'
      ],
      
      // Product titles
      titles: [
        '.product-title', '.product-name', '.item-title',
        'h1[class*="product"]', 'h2[class*="product"]',
        '[itemprop="name"]', '.product-info h1', '.product-info h2'
      ],
      
      // Product descriptions
      descriptions: [
        '.product-description', '.product-desc', '.description',
        '.product-details', '.product-info', '.product-summary',
        '[itemprop="description"]', '.product-content'
      ],
      
      // Product prices
      prices: [
        '.price', '.cost', '.amount', '.product-price',
        '.regular-price', '.sale-price', '.special-price',
        '[itemprop="price"]', '[data-price]', '.price-current'
      ],
      
      // Product images
      images: [
        '.product-image', '.product-photo', '.item-image',
        '.product-img', 'img[class*="product"]',
        '[itemprop="image"]', '.product-gallery img'
      ],
      
      // Product availability
      availability: [
        '.availability', '.stock', '.in-stock', '.out-of-stock',
        '[itemprop="availability"]', '.product-availability',
        '.inventory-status'
      ],
      
      // Product reviews
      reviews: [
        '.reviews', '.rating', '.stars', '.product-reviews',
        '[itemprop="review"]', '[itemprop="aggregateRating"]',
        '.review-count', '.rating-count'
      ],
      
      // Product categories
      categories: [
        '.breadcrumb', '.breadcrumbs', '.category',
        '.product-category', '.taxonomy', 'nav[class*="breadcrumb"]'
      ]
    };

    // Schema.org Product types
    this.productSchemaTypes = [
      'Product',
      'ProductModel',
      'SomeProducts',
      'ProductGroup',
      'Vehicle',
      'IndividualProduct'
    ];

    // Product information completeness criteria
    this.completenessCriteria = {
      essential: ['title', 'price'],
      important: ['description', 'images', 'availability'],
      optional: ['reviews', 'schema', 'categories', 'specifications']
    };

    // Product quality indicators
    this.qualityIndicators = {
      images: {
        minCount: 1,
        preferredCount: 3,
        minDimensions: { width: 300, height: 300 },
        preferredDimensions: { width: 800, height: 800 },
        formats: ['jpg', 'jpeg', 'png', 'webp']
      },
      
      description: {
        minLength: 50,
        preferredLength: 200,
        keyElements: ['features', 'benefits', 'specifications', 'usage']
      },
      
      pricing: {
        elements: ['regular_price', 'sale_price', 'currency', 'tax_info'],
        displayFormats: ['decimal', 'currency_symbol', 'formatted']
      }
    };
    
    console.log('📦 Product Catalog Detector initialized (GPT-5 Style)');
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata and capabilities
   */
  getMetadata() {
    return {
      name: 'ProductCatalogDetector',
      type: this.detectorType,
      version: this.version,
      description: 'Advanced product catalog analysis and optimization detection',
      
      capabilities: [
        'product_listing_analysis',
        'product_detail_optimization',
        'schema_markup_validation',
        'product_image_analysis',
        'information_completeness_assessment',
        'category_navigation_analysis'
      ],
      
      detectionPatterns: {
        productContainers: this.productPatterns.containers.length,
        productElements: Object.keys(this.productPatterns).length,
        schemaTypes: this.productSchemaTypes.length
      },
      
      configuration: {
        detectionDepth: this.options.detectionDepth,
        productCountThreshold: this.options.productCountThreshold,
        imageQualityThreshold: this.options.imageQualityThreshold
      },
      
      approach: 'GPT-5 Style Comprehensive Product Analysis'
    };
  }

  /**
   * Main detection method using GPT-5 style analysis
   * @param {Object} context - Analysis context containing DOM, URL, and page data
   * @returns {Promise<Object>} Product catalog detection results
   */
  async detect(context) {
    const startTime = Date.now();
    
    try {
      if (!context) {
        throw new Error('Context is required for product catalog detection');
      }

      console.log('📦 Starting GPT-5 style product catalog detection...');

      // Core Product Catalog Detection
      const results = {
        success: true,
        timestamp: new Date().toISOString(),
        
        // Product Listing Analysis
        productListing: this.options.enableProductListing ?
          await this._analyzeProductListing(context) : null,
        
        // Product Details Analysis
        productDetails: this.options.enableProductDetails ?
          await this._analyzeProductDetails(context) : null,
        
        // Schema Markup Validation
        schemaValidation: this.options.enableSchemaValidation ?
          await this._validateProductSchema(context) : null,
        
        // Product Image Analysis
        imageAnalysis: this.options.enableImageAnalysis ?
          await this._analyzeProductImages(context) : null,
        
        // Category and Navigation Analysis
        categoryAnalysis: this.options.enableCategoryAnalysis ?
          await this._analyzeCategoryNavigation(context) : null,
        
        // Completeness Assessment
        completenessAssessment: await this._assessProductCompleteness(context),
        
        // Quality Metrics
        qualityMetrics: await this._calculateQualityMetrics(context),
        
        executionTime: Date.now() - startTime
      };

      // Generate summary
      results.summary = this._generateProductCatalogSummary(results);
      
      console.log(`✅ Product catalog detection completed in ${results.executionTime}ms`);
      console.log(`📦 Products detected: ${results.summary?.productCount || 0}`);
      console.log(`📊 Catalog quality: ${results.summary?.qualityScore || 0}/100`);
      
      return results;

    } catch (error) {
      console.error('❌ Product catalog detection failed:', error);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze product listing structure and optimization
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Product listing analysis results
   */
  async _analyzeProductListing(context) {
    const analysis = {
      productCount: 0,
      listingStructure: {},
      displayOptimization: {},
      navigationFeatures: {}
    };

    try {
      const { document } = context;
      
      if (!document) {
        throw new Error('Document is required for product listing analysis');
      }

      // Detect product containers
      const productContainers = this._findProductContainers(document);
      analysis.productCount = productContainers.length;
      
      // Analyze listing structure
      analysis.listingStructure = this._analyzeListingStructure(document, productContainers);
      
      // Evaluate display optimization
      analysis.displayOptimization = this._evaluateDisplayOptimization(document, productContainers);
      
      // Check navigation features
      analysis.navigationFeatures = this._analyzeNavigationFeatures(document);

    } catch (error) {
      console.error('Product listing analysis failed:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Analyze individual product details and optimization
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Product details analysis results
   */
  async _analyzeProductDetails(context) {
    const analysis = {
      detailPages: [],
      informationCompleteness: {},
      optimizationFeatures: {},
      userExperience: {}
    };

    try {
      const { document } = context;
      
      // Check if this is a product detail page
      const isProductPage = this._isProductDetailPage(document);
      
      if (isProductPage) {
        // Analyze the product detail page
        const productDetails = this._analyzeProductDetailPage(document);
        analysis.detailPages.push(productDetails);
        
        // Assess information completeness
        analysis.informationCompleteness = this._assessInformationCompleteness(document);
        
        // Evaluate optimization features
        analysis.optimizationFeatures = this._evaluateOptimizationFeatures(document);
        
        // Analyze user experience elements
        analysis.userExperience = this._analyzeUserExperienceElements(document);
      }

    } catch (error) {
      console.error('Product details analysis failed:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Validate product schema markup
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Schema validation results
   */
  async _validateProductSchema(context) {
    const validation = {
      hasProductSchema: false,
      schemaTypes: [],
      schemaCompleteness: {},
      validationErrors: []
    };

    try {
      const { document } = context;
      
      // Find all schema.org markup
      const schemaElements = this._findProductSchemaElements(document);
      
      if (schemaElements.length > 0) {
        validation.hasProductSchema = true;
        
        // Analyze each schema element
        schemaElements.forEach(element => {
          const schemaAnalysis = this._analyzeSchemaElement(element);
          validation.schemaTypes.push(schemaAnalysis.type);
          
          // Merge completeness data
          Object.assign(validation.schemaCompleteness, schemaAnalysis.completeness);
          
          // Add validation errors
          validation.validationErrors.push(...schemaAnalysis.errors);
        });
      }

    } catch (error) {
      console.error('Product schema validation failed:', error);
      validation.error = error.message;
    }

    return validation;
  }

  /**
   * Analyze product images and media
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Image analysis results
   */
  async _analyzeProductImages(context) {
    const analysis = {
      imageCount: 0,
      imageQuality: {},
      imageOptimization: {},
      mediaFeatures: {}
    };

    try {
      const { document } = context;
      
      // Find product images
      const productImages = this._findProductImages(document);
      analysis.imageCount = productImages.length;
      
      if (productImages.length > 0) {
        // Analyze image quality
        analysis.imageQuality = this._analyzeImageQuality(productImages);
        
        // Check image optimization
        analysis.imageOptimization = this._checkImageOptimization(productImages);
        
        // Analyze media features
        analysis.mediaFeatures = this._analyzeMediaFeatures(document, productImages);
      }

    } catch (error) {
      console.error('Product image analysis failed:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Analyze category and navigation structure
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Category analysis results
   */
  async _analyzeCategoryNavigation(context) {
    const analysis = {
      categoryStructure: {},
      breadcrumbs: {},
      filteringOptions: {},
      sortingOptions: {}
    };

    try {
      const { document } = context;
      
      // Analyze category structure
      analysis.categoryStructure = this._analyzeCategoryStructure(document);
      
      // Check breadcrumb navigation
      analysis.breadcrumbs = this._analyzeBreadcrumbs(document);
      
      // Evaluate filtering options
      analysis.filteringOptions = this._analyzeFilteringOptions(document);
      
      // Check sorting options
      analysis.sortingOptions = this._analyzeSortingOptions(document);

    } catch (error) {
      console.error('Category navigation analysis failed:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  // ============================================================================
  // HELPER METHODS - PRODUCT DETECTION
  // ============================================================================

  _findProductContainers(document) {
    const containers = new Set();
    
    this.productPatterns.containers.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => containers.add(element));
      } catch (e) {
        // Invalid selector, skip
      }
    });
    
    return Array.from(containers);
  }

  _analyzeListingStructure(document, productContainers) {
    const structure = {
      layoutType: 'unknown',
      itemsPerRow: 0,
      hasGrid: false,
      hasList: false,
      responsiveDesign: false
    };

    try {
      if (productContainers.length === 0) return structure;

      // Detect layout type
      const gridIndicators = document.querySelectorAll('.grid, .row, .product-grid, [class*="col-"]');
      const listIndicators = document.querySelectorAll('.list, .product-list, [class*="list"]');

      if (gridIndicators.length > 0) {
        structure.hasGrid = true;
        structure.layoutType = 'grid';
      }
      
      if (listIndicators.length > 0) {
        structure.hasList = true;
        if (structure.layoutType === 'grid') {
          structure.layoutType = 'flexible';
        } else {
          structure.layoutType = 'list';
        }
      }

      // Estimate items per row (simplified)
      const container = productContainers[0]?.parentElement;
      if (container) {
        const containerWidth = container.getBoundingClientRect?.()?.width || 1200;
        const itemWidth = productContainers[0]?.getBoundingClientRect?.()?.width || 200;
        structure.itemsPerRow = Math.floor(containerWidth / itemWidth);
      }

      // Check for responsive design indicators
      const responsiveIndicators = document.querySelectorAll(
        '[class*="responsive"], [class*="mobile"], [class*="tablet"], [class*="desktop"]'
      );
      structure.responsiveDesign = responsiveIndicators.length > 0;

    } catch (error) {
      console.error('Listing structure analysis failed:', error);
    }

    return structure;
  }

  _evaluateDisplayOptimization(document, productContainers) {
    const optimization = {
      hasProductImages: false,
      hasPriceDisplay: false,
      hasProductTitles: false,
      hasQuickActions: false,
      optimizationScore: 0
    };

    try {
      if (productContainers.length === 0) return optimization;

      let optimizedContainers = 0;

      productContainers.forEach(container => {
        let containerScore = 0;

        // Check for images
        if (container.querySelector('img')) {
          containerScore += 25;
          optimization.hasProductImages = true;
        }

        // Check for price display
        const priceElements = this.productPatterns.prices.some(selector => 
          container.querySelector(selector)
        );
        if (priceElements) {
          containerScore += 25;
          optimization.hasPriceDisplay = true;
        }

        // Check for titles
        const titleElements = this.productPatterns.titles.some(selector => 
          container.querySelector(selector)
        );
        if (titleElements) {
          containerScore += 25;
          optimization.hasProductTitles = true;
        }

        // Check for quick actions (add to cart, quick view, etc.)
        const quickActions = container.querySelectorAll(
          'button, .btn, [class*="add"], [class*="cart"], [class*="quick"]'
        );
        if (quickActions.length > 0) {
          containerScore += 25;
          optimization.hasQuickActions = true;
        }

        if (containerScore >= 75) optimizedContainers++;
      });

      optimization.optimizationScore = productContainers.length > 0 ? 
        Math.round((optimizedContainers / productContainers.length) * 100) : 0;

    } catch (error) {
      console.error('Display optimization evaluation failed:', error);
    }

    return optimization;
  }

  _analyzeNavigationFeatures(document) {
    const navigation = {
      hasPagination: false,
      hasLoadMore: false,
      hasInfiniteScroll: false,
      hasFilters: false,
      hasSorting: false
    };

    try {
      // Check for pagination
      const paginationElements = document.querySelectorAll(
        '.pagination, .pager, [class*="page"], .nav-links'
      );
      navigation.hasPagination = paginationElements.length > 0;

      // Check for load more button
      const loadMoreElements = document.querySelectorAll(
        '[class*="load"], [class*="more"], .load-more-button'
      );
      navigation.hasLoadMore = loadMoreElements.length > 0;

      // Check for infinite scroll indicators
      const infiniteScrollElements = document.querySelectorAll(
        '[data-infinite], [class*="infinite"], .infinite-scroll'
      );
      navigation.hasInfiniteScroll = infiniteScrollElements.length > 0;

      // Check for filters
      const filterElements = document.querySelectorAll(
        '.filter, .filters, [class*="filter"], .sidebar'
      );
      navigation.hasFilters = filterElements.length > 0;

      // Check for sorting
      const sortElements = document.querySelectorAll(
        '.sort, [class*="sort"], select[name*="sort"], .orderby'
      );
      navigation.hasSorting = sortElements.length > 0;

    } catch (error) {
      console.error('Navigation features analysis failed:', error);
    }

    return navigation;
  }

  _isProductDetailPage(document) {
    try {
      // Check for product detail page indicators
      const detailIndicators = [
        'body[class*="product"]',
        'body[class*="single"]',
        '.product-detail',
        '.product-page',
        '[itemtype*="Product"]'
      ];

      return detailIndicators.some(selector => {
        try {
          return document.querySelector(selector) !== null;
        } catch (e) {
          return false;
        }
      });

    } catch (error) {
      return false;
    }
  }

  _analyzeProductDetailPage(document) {
    const details = {
      hasMainImage: false,
      hasImageGallery: false,
      hasDescription: false,
      hasSpecifications: false,
      hasReviews: false,
      hasRelatedProducts: false
    };

    try {
      // Check for main product image
      const mainImageSelectors = [
        '.product-image-main', '.main-image', '.featured-image',
        '.product-photo img', '.hero-image'
      ];
      details.hasMainImage = mainImageSelectors.some(selector => 
        document.querySelector(selector)
      );

      // Check for image gallery
      const gallerySelectors = [
        '.product-gallery', '.image-gallery', '.thumbnails',
        '.product-images', '.gallery'
      ];
      details.hasImageGallery = gallerySelectors.some(selector => 
        document.querySelector(selector)
      );

      // Check for product description
      details.hasDescription = this.productPatterns.descriptions.some(selector => 
        document.querySelector(selector)
      );

      // Check for specifications
      const specSelectors = [
        '.specifications', '.specs', '.product-specs',
        '.details', '.attributes', '.product-attributes'
      ];
      details.hasSpecifications = specSelectors.some(selector => 
        document.querySelector(selector)
      );

      // Check for reviews
      details.hasReviews = this.productPatterns.reviews.some(selector => 
        document.querySelector(selector)
      );

      // Check for related products
      const relatedSelectors = [
        '.related-products', '.similar-products', '.recommended',
        '.you-may-like', '.cross-sell', '.upsell'
      ];
      details.hasRelatedProducts = relatedSelectors.some(selector => 
        document.querySelector(selector)
      );

    } catch (error) {
      console.error('Product detail page analysis failed:', error);
    }

    return details;
  }

  _findProductSchemaElements(document) {
    const schemaElements = [];

    try {
      // Find JSON-LD schema
      const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLdElements.forEach(element => {
        try {
          const data = JSON.parse(element.textContent);
          if (this._isProductSchema(data)) {
            schemaElements.push({ type: 'json-ld', element, data });
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      });

      // Find Microdata schema
      this.productSchemaTypes.forEach(schemaType => {
        const microdataElements = document.querySelectorAll(`[itemtype*="${schemaType}"]`);
        microdataElements.forEach(element => {
          schemaElements.push({ type: 'microdata', element, schemaType });
        });
      });

    } catch (error) {
      console.error('Schema element detection failed:', error);
    }

    return schemaElements;
  }

  _isProductSchema(data) {
    if (!data) return false;
    
    const type = data['@type'] || data.type;
    return this.productSchemaTypes.some(productType => 
      type === productType || (Array.isArray(type) && type.includes(productType))
    );
  }

  _analyzeSchemaElement(schemaElement) {
    const analysis = {
      type: schemaElement.schemaType || 'unknown',
      completeness: {},
      errors: []
    };

    try {
      if (schemaElement.type === 'json-ld' && schemaElement.data) {
        analysis.completeness = this._analyzeJsonLdCompleteness(schemaElement.data);
      } else if (schemaElement.type === 'microdata') {
        analysis.completeness = this._analyzeMicrodataCompleteness(schemaElement.element);
      }

    } catch (error) {
      analysis.errors.push(`Schema analysis failed: ${error.message}`);
    }

    return analysis;
  }

  _analyzeJsonLdCompleteness(data) {
    const completeness = {
      hasName: !!data.name,
      hasDescription: !!data.description,
      hasPrice: !!(data.offers && data.offers.price),
      hasImage: !!data.image,
      hasAvailability: !!(data.offers && data.offers.availability),
      hasBrand: !!data.brand,
      hasReviews: !!(data.review || data.aggregateRating)
    };

    completeness.score = Object.values(completeness).filter(Boolean).length / 
                        Object.keys(completeness).length * 100;

    return completeness;
  }

  _findProductImages(document) {
    const images = new Set();
    
    this.productPatterns.images.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.tagName === 'IMG' || element.tagName === 'img') {
            images.add(element);
          } else {
            // Look for img elements inside the container
            const imgElements = element.querySelectorAll('img');
            imgElements.forEach(img => images.add(img));
          }
        });
      } catch (e) {
        // Invalid selector, skip
      }
    });
    
    return Array.from(images);
  }

  _analyzeImageQuality(images) {
    const quality = {
      totalImages: images.length,
      highQualityImages: 0,
      averageDimensions: { width: 0, height: 0 },
      hasAltText: 0,
      qualityScore: 0
    };

    try {
      let totalWidth = 0;
      let totalHeight = 0;

      images.forEach(img => {
        // Check dimensions
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;
        
        totalWidth += width;
        totalHeight += height;

        if (width >= this.options.imageQualityThreshold && 
            height >= this.options.imageQualityThreshold) {
          quality.highQualityImages++;
        }

        // Check alt text
        if (img.alt && img.alt.trim().length > 0) {
          quality.hasAltText++;
        }
      });

      if (images.length > 0) {
        quality.averageDimensions.width = Math.round(totalWidth / images.length);
        quality.averageDimensions.height = Math.round(totalHeight / images.length);
        
        quality.qualityScore = Math.round(
          ((quality.highQualityImages / images.length) * 60) +
          ((quality.hasAltText / images.length) * 40)
        );
      }

    } catch (error) {
      console.error('Image quality analysis failed:', error);
    }

    return quality;
  }

  // ============================================================================
  // HELPER METHODS - ASSESSMENT AND METRICS
  // ============================================================================

  async _assessProductCompleteness(context) {
    const assessment = {
      overallCompleteness: 0,
      elementCompleteness: {},
      missingElements: [],
      recommendations: []
    };

    try {
      const { document } = context;
      
      // Check each completeness criterion
      Object.entries(this.completenessCriteria).forEach(([priority, elements]) => {
        elements.forEach(element => {
          const elementPresent = this._checkElementPresence(document, element);
          assessment.elementCompleteness[element] = {
            present: elementPresent,
            priority
          };
          
          if (!elementPresent) {
            assessment.missingElements.push(element);
          }
        });
      });

      // Calculate overall completeness score
      const weights = this.options.completenessWeights;
      let totalScore = 0;
      let totalWeight = 0;

      Object.entries(assessment.elementCompleteness).forEach(([element, data]) => {
        const weight = weights[element] || 0.05;
        totalScore += data.present ? weight : 0;
        totalWeight += weight;
      });

      assessment.overallCompleteness = totalWeight > 0 ? 
        Math.round((totalScore / totalWeight) * 100) : 0;

      // Generate recommendations
      assessment.recommendations = this._generateCompletenessRecommendations(assessment);

    } catch (error) {
      console.error('Product completeness assessment failed:', error);
      assessment.error = error.message;
    }

    return assessment;
  }

  _checkElementPresence(document, elementType) {
    try {
      const patterns = this.productPatterns[elementType] || [];
      return patterns.some(selector => {
        try {
          return document.querySelector(selector) !== null;
        } catch (e) {
          return false;
        }
      });
    } catch (error) {
      return false;
    }
  }

  async _calculateQualityMetrics(context) {
    const metrics = {
      overall: 0,
      breakdown: {
        information: 0,
        images: 0,
        schema: 0,
        navigation: 0,
        userExperience: 0
      }
    };

    try {
      // Information quality (based on completeness)
      const completeness = await this._assessProductCompleteness(context);
      metrics.breakdown.information = completeness.overallCompleteness || 0;

      // Image quality
      const imageAnalysis = await this._analyzeProductImages(context);
      metrics.breakdown.images = imageAnalysis.imageQuality?.qualityScore || 0;

      // Schema quality
      const schemaValidation = await this._validateProductSchema(context);
      metrics.breakdown.schema = schemaValidation.schemaCompleteness?.score || 0;

      // Navigation quality (simplified)
      const categoryAnalysis = await this._analyzeCategoryNavigation(context);
      metrics.breakdown.navigation = this._calculateNavigationScore(categoryAnalysis);

      // User experience quality (simplified)
      metrics.breakdown.userExperience = this._calculateUserExperienceScore(context);

      // Calculate overall quality
      const scores = Object.values(metrics.breakdown).filter(score => score > 0);
      metrics.overall = scores.length > 0 ? 
        Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

    } catch (error) {
      console.error('Quality metrics calculation failed:', error);
      metrics.error = error.message;
    }

    return metrics;
  }

  _calculateNavigationScore(categoryAnalysis) {
    let score = 0;
    
    if (categoryAnalysis.breadcrumbs?.present) score += 25;
    if (categoryAnalysis.filteringOptions?.available) score += 25;
    if (categoryAnalysis.sortingOptions?.available) score += 25;
    if (categoryAnalysis.categoryStructure?.organized) score += 25;
    
    return score;
  }

  _calculateUserExperienceScore(context) {
    // Simplified UX scoring
    let score = 50; // Base score
    
    try {
      const { document } = context;
      
      // Check for responsive design indicators
      const responsiveElements = document.querySelectorAll(
        '[class*="responsive"], [class*="mobile"]'
      );
      if (responsiveElements.length > 0) score += 20;
      
      // Check for interactive elements
      const interactiveElements = document.querySelectorAll(
        'button, .btn, [role="button"]'
      );
      if (interactiveElements.length > 5) score += 15;
      
      // Check for accessibility features
      const accessibilityFeatures = document.querySelectorAll(
        '[aria-label], [alt], [role]'
      );
      if (accessibilityFeatures.length > 10) score += 15;
      
    } catch (error) {
      console.error('UX score calculation failed:', error);
    }
    
    return Math.min(score, 100);
  }

  _generateProductCatalogSummary(results) {
    const summary = {
      productCount: 0,
      hasProductListing: false,
      hasProductDetails: false,
      hasProductSchema: false,
      qualityScore: 0,
      optimizationLevel: 'Poor'
    };

    try {
      // Product count
      summary.productCount = results.productListing?.productCount || 0;
      
      // Feature detection
      summary.hasProductListing = summary.productCount > 0;
      summary.hasProductDetails = results.productDetails?.detailPages?.length > 0;
      summary.hasProductSchema = results.schemaValidation?.hasProductSchema || false;
      
      // Quality score
      summary.qualityScore = results.qualityMetrics?.overall || 0;
      
      // Optimization level
      if (summary.qualityScore >= 90) summary.optimizationLevel = 'Excellent';
      else if (summary.qualityScore >= 75) summary.optimizationLevel = 'Good';
      else if (summary.qualityScore >= 60) summary.optimizationLevel = 'Fair';
      else if (summary.qualityScore >= 40) summary.optimizationLevel = 'Poor';
      else summary.optimizationLevel = 'Very Poor';

    } catch (error) {
      console.error('Summary generation failed:', error);
    }

    return summary;
  }

  _generateCompletenessRecommendations(assessment) {
    const recommendations = [];

    try {
      assessment.missingElements.forEach(element => {
        const priority = assessment.elementCompleteness[element]?.priority || 'optional';
        
        switch (element) {
          case 'title':
            recommendations.push({
              type: 'critical',
              message: 'Add clear product titles to improve SEO and user experience'
            });
            break;
          case 'description':
            recommendations.push({
              type: 'high',
              message: 'Include detailed product descriptions to help customers make informed decisions'
            });
            break;
          case 'price':
            recommendations.push({
              type: 'critical',
              message: 'Display product prices prominently to improve conversion rates'
            });
            break;
          case 'images':
            recommendations.push({
              type: 'high',
              message: 'Add high-quality product images to showcase products effectively'
            });
            break;
          case 'schema':
            recommendations.push({
              type: 'medium',
              message: 'Implement product schema markup to improve search engine visibility'
            });
            break;
        }
      });

    } catch (error) {
      console.error('Recommendations generation failed:', error);
    }

    return recommendations;
  }
}

export default ProductCatalogDetector;
