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
 */

export class ProductSchemaAnalyzer {
  constructor(options = {}) {
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
   * Analyze product schema and product page optimization
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Product analysis results
   */
  analyze(document, url) {
    const schemas = this._extractProductSchemas(document);
    const validation = this._validateProductSchemas(schemas);
    const optimization = this._analyzeOptimization(document, schemas);
    const productPage = this._analyzeProductPage(document);

    return {
      schemas,
      validation,
      optimization,
      productPage,
      score: this._calculateProductScore(validation, optimization, productPage),
    };
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
}
