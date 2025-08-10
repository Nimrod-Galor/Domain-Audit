/**
 * ============================================================================
 * PRODUCT SCHEMA ANALYZER
 * ============================================================================
 *
 * Analyzes product schema markup and product page optimization including:
 * - JSON-LD Product schema validation
 * - Microdata product markup
 * - Product information completeness
 * - Price and availability validation
 * - Product image optimization
 *
 * @author Nimrod Galor
 * @version 1.0.0
 * @extends BaseAnalyzer
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class ProductSchemaAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('ProductSchemaAnalyzer');
    
    this.category = AnalyzerCategories.ECOMMERCE;
    this.options = options;
    this.requiredProductFields = [
      "name",
      "description",
      "price",
      "availability",
      "brand",
    ];
    this.optionalProductFields = [
      "sku",
      "gtin",
      "mpn",
      "condition",
      "category",
      "image",
      "review",
      "aggregateRating",
    ];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: 'ProductSchemaAnalyzer',
      version: '1.0.0',
      category: AnalyzerCategories.ECOMMERCE,
      description: 'Analyzes product schema markup and product page optimization',
      author: 'Nimrod Galor',
      capabilities: [
        'JSON-LD Product schema validation',
        'Microdata product markup analysis',
        'Product information completeness check',
        'Price and availability validation',
        'Product image optimization',
        'E-commerce SEO optimization'
      ]
    };
  }

  /**
   * Validate the context before analysis
   * @param {Object} context - Analysis context
   * @returns {boolean} Whether the context is valid
   */
  validate(context) {
    return context && 
           ((context.dom && context.dom.window && context.dom.window.document) ||
            (context.document));
  }

  /**
   * Analyze product schema and product page optimization
   * @param {Object} context - Analysis context containing document, url, etc.
   * @returns {Object} Product analysis results
   */
  async analyze(context) {
    try {
      this.log('Starting product schema analysis');
      
      // Validate context
      if (!this.validate(context)) {
        throw new Error('Invalid context provided for product schema analysis');
      }

      const { document = context.document || context.dom?.window?.document, url = context.url || '' } = context;

      const schemas = this._extractProductSchemas(document);
      const validation = this._validateProductSchemas(schemas);
      const optimization = this._analyzeOptimization(document, schemas);
      const productPage = this._analyzeProductPage(document);

      const result = {
        schemas,
        validation,
        optimization,
        productPage,
        score: this._calculateProductScore(validation, optimization, productPage),
      };

      // BaseAnalyzer integration: comprehensive scoring and summary
      const comprehensiveScore = this._calculateComprehensiveScore(result);
      const recommendations = this._generateProductSchemaRecommendations(result);
      const summary = this._generateProductSchemaSummary(result);
      
      this.log('Product schema analysis completed successfully');
      
      return {
        ...result,
        score: comprehensiveScore,
        recommendations: [...(result.recommendations || []), ...recommendations],
        summary,
        metadata: this.getMetadata()
      };
    } catch (error) {
      return this.handleError('Product schema analysis failed', error, {
        schemas: [],
        validation: null,
        optimization: null,
        productPage: null,
        score: 0,
        recommendations: []
      });
    }
  }

  /**
   * Analyze schema markup specifically
   * @param {Document} document - DOM document
   * @returns {Object} Schema analysis results
   */
  analyzeSchema(document) {
    const schemas = this._extractProductSchemas(document);
    const validation = this._validateProductSchemas(schemas);

    return {
      schemas,
      validation,
      score: this._calculateSchemaScore(validation),
    };
  }

  /**
   * Extract product schemas from document
   */
  _extractProductSchemas(document) {
    const jsonLdScripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );

    const productSchemas = [];

    jsonLdScripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent);
        const products = this._findProductsInSchema(data);
        
        products.forEach(product => {
          productSchemas.push({
            type: 'JSON-LD',
            index: index,
            data: product,
            source: 'script',
          });
        });
      } catch (error) {
        // Invalid JSON-LD, skip
      }
    });

    // Also check for microdata
    const microdataProducts = this._extractMicrodataProducts(document);
    productSchemas.push(...microdataProducts);

    return productSchemas;
  }

  /**
   * Find products in schema data (handles arrays and nested objects)
   */
  _findProductsInSchema(data) {
    const products = [];

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item['@type'] === 'Product') {
          products.push(item);
        } else if (item['@graph']) {
          products.push(...this._findProductsInSchema(item['@graph']));
        }
      });
    } else if (data['@type'] === 'Product') {
      products.push(data);
    } else if (data['@graph']) {
      products.push(...this._findProductsInSchema(data['@graph']));
    }

    return products;
  }

  /**
   * Extract microdata product information
   */
  _extractMicrodataProducts(document) {
    const microdataProducts = [];
    const productElements = document.querySelectorAll('[itemtype*="Product"]');

    productElements.forEach((element, index) => {
      const product = this._extractMicrodataFromElement(element);
      if (Object.keys(product).length > 0) {
        microdataProducts.push({
          type: 'Microdata',
          index: index,
          data: product,
          source: 'microdata',
        });
      }
    });

    return microdataProducts;
  }

  /**
   * Extract microdata properties from element
   */
  _extractMicrodataFromElement(element) {
    const product = {};
    const propertyElements = element.querySelectorAll('[itemprop]');

    propertyElements.forEach(propElement => {
      const propName = propElement.getAttribute('itemprop');
      let propValue = propElement.getAttribute('content') || 
                     propElement.textContent.trim();

      // Handle special cases
      if (propElement.tagName === 'META') {
        propValue = propElement.getAttribute('content');
      } else if (propElement.tagName === 'IMG') {
        propValue = propElement.src;
      } else if (propElement.tagName === 'A') {
        propValue = propElement.href;
      }

      product[propName] = propValue;
    });

    return product;
  }

  /**
   * Validate product schemas
   */
  _validateProductSchemas(schemas) {
    const validation = {
      hasProductSchema: schemas.length > 0,
      validSchemas: 0,
      totalSchemas: schemas.length,
      missingFields: [],
      errors: [],
      warnings: [],
    };

    schemas.forEach((schema, index) => {
      const product = schema.data;
      let isValid = true;

      // Validate required fields
      this.requiredProductFields.forEach((field) => {
        if (!product[field]) {
          validation.missingFields.push(
            `Schema ${index + 1} (${schema.type}): Missing ${field}`
          );
          isValid = false;
        }
      });

      // Validate price format
      if (product.offers) {
        const offerValidation = this._validateOffers(product.offers, index + 1, schema.type);
        validation.errors.push(...offerValidation.errors);
        validation.warnings.push(...offerValidation.warnings);
        if (offerValidation.errors.length > 0) {
          isValid = false;
        }
      } else if (product.price) {
        // Direct price property (microdata style)
        if (!this._isValidPrice(product.price)) {
          validation.errors.push(
            `Schema ${index + 1} (${schema.type}): Invalid price format`
          );
          isValid = false;
        }
      }

      // Validate image URLs
      if (product.image) {
        const imageValidation = this._validateImages(product.image, index + 1, schema.type);
        validation.warnings.push(...imageValidation.warnings);
      }

      // Validate brand
      if (product.brand && typeof product.brand === 'object' && !product.brand.name) {
        validation.warnings.push(
          `Schema ${index + 1} (${schema.type}): Brand object missing name property`
        );
      }

      if (isValid) {
        validation.validSchemas++;
      }
    });

    return validation;
  }

  /**
   * Validate offers in product schema
   */
  _validateOffers(offers, schemaIndex, schemaType) {
    const validation = { errors: [], warnings: [] };
    const offerArray = Array.isArray(offers) ? offers : [offers];

    offerArray.forEach((offer, offerIndex) => {
      if (!offer.price && !offer.lowPrice && !offer.highPrice) {
        validation.errors.push(
          `Schema ${schemaIndex} (${schemaType}), Offer ${offerIndex + 1}: Missing price`
        );
      }

      if (!offer.priceCurrency) {
        validation.errors.push(
          `Schema ${schemaIndex} (${schemaType}), Offer ${offerIndex + 1}: Missing priceCurrency`
        );
      }

      if (!offer.availability) {
        validation.warnings.push(
          `Schema ${schemaIndex} (${schemaType}), Offer ${offerIndex + 1}: Missing availability`
        );
      }

      // Validate price format
      if (offer.price && !this._isValidPrice(offer.price)) {
        validation.errors.push(
          `Schema ${schemaIndex} (${schemaType}), Offer ${offerIndex + 1}: Invalid price format`
        );
      }

      // Validate availability values
      if (offer.availability && !this._isValidAvailability(offer.availability)) {
        validation.warnings.push(
          `Schema ${schemaIndex} (${schemaType}), Offer ${offerIndex + 1}: Non-standard availability value`
        );
      }
    });

    return validation;
  }

  /**
   * Validate product images
   */
  _validateImages(images, schemaIndex, schemaType) {
    const validation = { warnings: [] };
    const imageArray = Array.isArray(images) ? images : [images];

    imageArray.forEach((image, imageIndex) => {
      const imageUrl = typeof image === 'string' ? image : image.url;
      
      if (!this._isValidUrl(imageUrl)) {
        validation.warnings.push(
          `Schema ${schemaIndex} (${schemaType}), Image ${imageIndex + 1}: Invalid image URL`
        );
      }
    });

    return validation;
  }

  /**
   * Analyze product page optimization
   */
  _analyzeProductPage(document) {
    return {
      hasProductTitle: this._hasProductTitle(document),
      hasProductDescription: this._hasProductDescription(document),
      hasProductImages: this._hasProductImages(document),
      hasPrice: this._hasPrice(document),
      hasAddToCart: this._hasAddToCart(document),
      hasReviews: this._hasReviews(document),
      hasAvailability: this._hasAvailability(document),
      hasBreadcrumbs: this._hasBreadcrumbs(document),
      hasRelatedProducts: this._hasRelatedProducts(document),
    };
  }

  /**
   * Analyze schema optimization opportunities
   */
  _analyzeOptimization(document, schemas) {
    return {
      schemaCompleteness: this._calculateSchemaCompleteness(schemas),
      hasReviewSchema: this._hasReviewSchema(schemas),
      hasAggregateRating: this._hasAggregateRating(schemas),
      hasOffers: this._hasOffers(schemas),
      hasAvailability: this._hasAvailabilityInSchema(schemas),
      hasImages: this._hasImagesInSchema(schemas),
      hasBrand: this._hasBrandInSchema(schemas),
    };
  }

  /**
   * Calculate product analysis score
   */
  _calculateProductScore(validation, optimization, productPage) {
    let score = 0;

    // Schema validation score (40%)
    if (validation.hasProductSchema) {
      const schemaScore = validation.totalSchemas > 0 
        ? (validation.validSchemas / validation.totalSchemas) * 100
        : 0;
      score += schemaScore * 0.4;
    }

    // Product page optimization score (35%)
    const pageFeatures = Object.values(productPage).filter(Boolean).length;
    const totalPageFeatures = Object.keys(productPage).length;
    const pageScore = (pageFeatures / totalPageFeatures) * 100;
    score += pageScore * 0.35;

    // Schema optimization score (25%)
    const optimizationFeatures = Object.values(optimization).filter(Boolean).length;
    const totalOptimizationFeatures = Object.keys(optimization).length;
    const optimizationScore = (optimizationFeatures / totalOptimizationFeatures) * 100;
    score += optimizationScore * 0.25;

    return Math.round(score);
  }

  /**
   * Calculate schema-specific score
   */
  _calculateSchemaScore(validation) {
    if (!validation.hasProductSchema) return 0;

    const validationScore = validation.totalSchemas > 0 
      ? (validation.validSchemas / validation.totalSchemas) * 100
      : 0;

    // Penalty for missing fields
    const penaltyPerMissingField = 10;
    const missingFieldPenalty = Math.min(validation.missingFields.length * penaltyPerMissingField, 50);

    return Math.max(0, Math.round(validationScore - missingFieldPenalty));
  }

  // Helper methods for validation
  _isValidPrice(price) {
    return /^\d+(\.\d{2})?$/.test(price.toString());
  }

  _isValidAvailability(availability) {
    const validValues = [
      'InStock',
      'OutOfStock',
      'PreOrder',
      'Discontinued',
      'LimitedAvailability'
    ];
    return validValues.some(value => availability.includes(value));
  }

  _isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Helper methods for product page analysis
  _hasProductTitle(document) {
    return document.querySelector('h1, .product-title, .product-name') !== null;
  }

  _hasProductDescription(document) {
    const selectors = ['.product-description', '.description', '.product-details'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasProductImages(document) {
    const selectors = ['.product-image', '.product-photo', '[alt*="product"]'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasPrice(document) {
    const selectors = ['.price', '.product-price', '[data-price]'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasAddToCart(document) {
    const selectors = ['.add-to-cart', '.buy-now', 'button[type="submit"]'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasReviews(document) {
    const selectors = ['.reviews', '.review', '.customer-reviews'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasAvailability(document) {
    const text = document.body.textContent.toLowerCase();
    return /in stock|out of stock|available|unavailable/.test(text);
  }

  _hasBreadcrumbs(document) {
    const selectors = ['.breadcrumb', '.breadcrumbs', 'nav[aria-label="breadcrumb"]'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  _hasRelatedProducts(document) {
    const selectors = ['.related-products', '.recommended', '.you-may-like'];
    return selectors.some(selector => document.querySelector(selector) !== null);
  }

  // Helper methods for schema optimization analysis
  _calculateSchemaCompleteness(schemas) {
    if (schemas.length === 0) return 0;

    let totalFields = 0;
    let presentFields = 0;

    schemas.forEach(schema => {
      const product = schema.data;
      const allFields = [...this.requiredProductFields, ...this.optionalProductFields];
      
      allFields.forEach(field => {
        totalFields++;
        if (product[field]) {
          presentFields++;
        }
      });
    });

    return totalFields > 0 ? Math.round((presentFields / totalFields) * 100) : 0;
  }

  _hasReviewSchema(schemas) {
    return schemas.some(schema => schema.data.review);
  }

  _hasAggregateRating(schemas) {
    return schemas.some(schema => schema.data.aggregateRating);
  }

  _hasOffers(schemas) {
    return schemas.some(schema => schema.data.offers);
  }

  _hasAvailabilityInSchema(schemas) {
    return schemas.some(schema => {
      const product = schema.data;
      return product.availability || (product.offers && product.offers.availability);
    });
  }

  _hasImagesInSchema(schemas) {
    return schemas.some(schema => schema.data.image);
  }

  _hasBrandInSchema(schemas) {
    return schemas.some(schema => schema.data.brand);
  }

  /**
   * Calculate comprehensive product schema score for BaseAnalyzer integration
   * @param {Object} analysis - Product schema analysis results
   * @returns {number} Comprehensive score (0-100)
   */
  _calculateComprehensiveScore(analysis) {
    try {
      const weights = {
        schemas: 0.40,          // 40% - Schema presence and validity
        validation: 0.30,       // 30% - Schema validation quality
        optimization: 0.20,     // 20% - E-commerce optimization
        productPage: 0.10       // 10% - Product page elements
      };

      let totalScore = 0;
      let totalWeight = 0;

      // Schema presence score
      if (analysis.schemas) {
        const schemaCount = analysis.schemas.length;
        const schemaScore = Math.min(100, schemaCount > 0 ? 80 + (schemaCount * 10) : 0);
        totalScore += schemaScore * weights.schemas;
        totalWeight += weights.schemas;
      }

      // Validation score
      if (analysis.validation) {
        const validation = analysis.validation;
        let validationScore = 50; // Base score

        if (validation.valid) validationScore += 30;
        if (validation.errors?.length === 0) validationScore += 10;
        if (validation.warnings?.length === 0) validationScore += 10;

        totalScore += Math.min(100, validationScore) * weights.validation;
        totalWeight += weights.validation;
      }

      // Optimization score
      if (analysis.optimization) {
        const optimization = analysis.optimization;
        let optScore = 0;

        if (optimization.hasReviews) optScore += 20;
        if (optimization.hasRatings) optScore += 20;
        if (optimization.hasOffers) optScore += 20;
        if (optimization.hasAvailability) optScore += 20;
        if (optimization.hasImages) optScore += 20;

        totalScore += optScore * weights.optimization;
        totalWeight += weights.optimization;
      }

      // Product page score
      if (analysis.productPage) {
        const page = analysis.productPage;
        let pageScore = 0;

        if (page.hasTitle) pageScore += 25;
        if (page.hasDescription) pageScore += 25;
        if (page.hasImages) pageScore += 25;
        if (page.hasPrice) pageScore += 25;

        totalScore += pageScore * weights.productPage;
        totalWeight += weights.productPage;
      }

      return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    } catch (error) {
      this.log('Error calculating comprehensive score:', error.message);
      return 0;
    }
  }

  /**
   * Generate comprehensive product schema recommendations
   * @param {Object} analysis - Product schema analysis results
   * @returns {Array} Enhanced recommendations
   */
  _generateProductSchemaRecommendations(analysis) {
    const recommendations = [];

    try {
      // Schema implementation recommendations
      if (!analysis.schemas || analysis.schemas.length === 0) {
        recommendations.push({
          category: 'schema-markup',
          priority: 'high',
          title: 'Implement Product Schema Markup',
          description: 'No product schema markup detected',
          impact: 'Rich snippets in search results and improved e-commerce SEO',
          actionItems: [
            'Add JSON-LD Product schema to product pages',
            'Include required fields: name, description, price, availability, brand',
            'Add optional fields: SKU, GTIN, reviews, ratings, images',
            'Validate schema using Google Rich Results Test',
            'Monitor schema performance in Search Console'
          ]
        });
      } else if (analysis.validation && !analysis.validation.valid) {
        recommendations.push({
          category: 'schema-validation',
          priority: 'high',
          title: 'Fix Product Schema Validation Errors',
          description: `${analysis.validation.errors?.length || 0} validation errors found`,
          impact: 'Schema recognition and rich snippet eligibility',
          actionItems: [
            'Review and fix schema validation errors',
            'Ensure all required Product fields are present',
            'Validate price and availability formats',
            'Check image URLs and formats',
            'Test with Google Rich Results Test tool'
          ]
        });
      }

      // E-commerce optimization recommendations
      if (analysis.optimization) {
        const opt = analysis.optimization;
        
        if (!opt.hasReviews) {
          recommendations.push({
            category: 'reviews',
            priority: 'medium',
            title: 'Add Product Review Schema',
            description: 'No review schema found for products',
            impact: 'Star ratings in search results and customer trust',
            actionItems: [
              'Implement review collection system',
              'Add Review schema markup to product pages',
              'Include aggregateRating with review count',
              'Display reviews prominently on product pages',
              'Encourage customer reviews through email campaigns'
            ]
          });
        }

        if (!opt.hasOffers) {
          recommendations.push({
            category: 'offers',
            priority: 'medium',
            title: 'Add Offer Schema Information',
            description: 'Missing offer details in product schema',
            impact: 'Price display in search results',
            actionItems: [
              'Add Offer schema with price and currency',
              'Include availability status (InStock, OutOfStock)',
              'Specify price validation period',
              'Add shipping and return policy information',
              'Include seller information where applicable'
            ]
          });
        }

        if (!opt.hasImages) {
          recommendations.push({
            category: 'images',
            priority: 'medium',
            title: 'Optimize Product Image Schema',
            description: 'Product images not properly marked up in schema',
            impact: 'Image display in search results and shopping features',
            actionItems: [
              'Add high-quality product images to schema',
              'Include multiple image views and angles',
              'Ensure images meet Google guidelines (minimum 300x300px)',
              'Add descriptive alt text for accessibility',
              'Optimize image file sizes for performance'
            ]
          });
        }
      }

      // Product page optimization
      if (analysis.productPage) {
        const page = analysis.productPage;
        
        if (!page.hasDescription) {
          recommendations.push({
            category: 'content',
            priority: 'medium',
            title: 'Enhance Product Descriptions',
            description: 'Product descriptions need improvement',
            impact: 'User engagement and conversion rates',
            actionItems: [
              'Write detailed, unique product descriptions',
              'Include key features and benefits',
              'Use bullet points for easy scanning',
              'Include size, material, and care instructions',
              'Optimize descriptions for target keywords'
            ]
          });
        }

        if (!page.hasPrice) {
          recommendations.push({
            category: 'pricing',
            priority: 'high',
            title: 'Display Clear Pricing Information',
            description: 'Product pricing not clearly displayed',
            impact: 'User experience and conversion rates',
            actionItems: [
              'Display prices prominently on product pages',
              'Include currency and tax information',
              'Show original and sale prices when applicable',
              'Add price comparison or savings calculations',
              'Ensure pricing is consistent across schema and display'
            ]
          });
        }
      }

      return recommendations;
    } catch (error) {
      this.log('Error generating product schema recommendations:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive product schema summary
   * @param {Object} analysis - Product schema analysis results
   * @returns {Object} Product schema summary
   */
  _generateProductSchemaSummary(analysis) {
    try {
      const summary = {
        schemaCount: 0,
        schemaValid: false,
        hasReviews: false,
        hasOffers: false,
        optimizationLevel: 'Poor',
        keyFindings: []
      };

      // Count schemas
      if (analysis.schemas) {
        summary.schemaCount = analysis.schemas.length;
        summary.keyFindings.push(`${analysis.schemas.length} product schema(s) found`);
      }

      // Check validation
      if (analysis.validation?.valid) {
        summary.schemaValid = true;
        summary.keyFindings.push('Product schema validation passed');
      } else if (analysis.validation?.errors?.length > 0) {
        summary.keyFindings.push(`${analysis.validation.errors.length} schema validation errors`);
      }

      // Check optimization features
      if (analysis.optimization) {
        if (analysis.optimization.hasReviews) {
          summary.hasReviews = true;
          summary.keyFindings.push('Product reviews included in schema');
        }
        
        if (analysis.optimization.hasOffers) {
          summary.hasOffers = true;
          summary.keyFindings.push('Offer information included in schema');
        }
      }

      // Determine optimization level
      const score = this._calculateComprehensiveScore(analysis);
      if (score >= 90) summary.optimizationLevel = 'Excellent';
      else if (score >= 80) summary.optimizationLevel = 'Good';
      else if (score >= 70) summary.optimizationLevel = 'Fair';
      else if (score >= 60) summary.optimizationLevel = 'Poor';
      else summary.optimizationLevel = 'Very Poor';

      // Additional findings
      if (summary.schemaCount === 0) {
        summary.keyFindings.push('No product schema markup detected');
      }
      
      if (analysis.productPage?.hasPrice) {
        summary.keyFindings.push('Pricing information displayed');
      }

      return summary;
    } catch (error) {
      this.log('Error generating product schema summary:', error.message);
      return {
        schemaCount: 0,
        schemaValid: false,
        hasReviews: false,
        hasOffers: false,
        optimizationLevel: 'Unknown',
        keyFindings: ['Analysis error occurred']
      };
    }
  }

}
