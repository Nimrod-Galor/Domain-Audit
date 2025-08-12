/**
 * Structured Data Detector - GPT-5 Style Pure Detection
 * 
 * Detects and extracts all structured data from the DOM
 * No business logic - pure detection and extraction
 */

export class StructuredDataDetector {
  constructor(options = {}) {
    this.options = {
      detectJSONLD: options.detectJSONLD !== false,
      detectMicrodata: options.detectMicrodata !== false,
      detectRDFa: options.detectRDFa !== false,
      validateSyntax: options.validateSyntax !== false,
      extractTypes: options.extractTypes !== false,
      ...options
    };
  }

  /**
   * Detect all structured data formats
   * @param {Document} document - DOM document
   * @returns {Object} Structured data detection results
   */
  async detect(document) {
    try {
      const results = {
        success: true,
        jsonLd: this.options.detectJSONLD ? this._detectJSONLD(document) : null,
        microdata: this.options.detectMicrodata ? this._detectMicrodata(document) : null,
        rdfa: this.options.detectRDFa ? this._detectRDFa(document) : null,
        openGraph: this._detectOpenGraphStructuredData(document),
        statistics: {}
      };

      // Calculate statistics
      results.statistics = this._calculateStatistics(results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detect JSON-LD structured data
   * @param {Document} document - DOM document
   * @returns {Object} JSON-LD data
   * @private
   */
  _detectJSONLD(document) {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    
    const jsonLdData = {
      count: scripts.length,
      valid: 0,
      invalid: 0,
      data: [],
      errors: [],
      types: new Set()
    };

    scripts.forEach((script, index) => {
      const content = script.textContent.trim();
      
      try {
        const parsed = JSON.parse(content);
        
        const item = {
          index: index + 1,
          valid: true,
          content: parsed,
          rawContent: content,
          types: this._extractTypes(parsed),
          size: content.length
        };

        jsonLdData.data.push(item);
        jsonLdData.valid++;
        
        // Collect types
        item.types.forEach(type => jsonLdData.types.add(type));

      } catch (error) {
        const item = {
          index: index + 1,
          valid: false,
          error: error.message,
          rawContent: content,
          size: content.length
        };

        jsonLdData.data.push(item);
        jsonLdData.invalid++;
        jsonLdData.errors.push(`Script ${index + 1}: ${error.message}`);
      }
    });

    // Convert Set to Array for serialization
    jsonLdData.types = Array.from(jsonLdData.types);

    return jsonLdData;
  }

  /**
   * Detect Microdata structured data
   * @param {Document} document - DOM document
   * @returns {Object} Microdata data
   * @private
   */
  _detectMicrodata(document) {
    const itemScopes = Array.from(document.querySelectorAll('[itemscope]'));
    
    const microdataData = {
      count: itemScopes.length,
      items: [],
      types: new Set(),
      properties: new Set()
    };

    itemScopes.forEach((element, index) => {
      const item = {
        index: index + 1,
        type: element.getAttribute('itemtype'),
        id: element.getAttribute('itemid'),
        properties: this._extractMicrodataProperties(element),
        element: element.tagName.toLowerCase(),
        hasNesting: element.querySelector('[itemscope]') !== null
      };

      microdataData.items.push(item);

      // Collect types and properties
      if (item.type) {
        microdataData.types.add(item.type);
      }
      
      Object.keys(item.properties).forEach(prop => {
        microdataData.properties.add(prop);
      });
    });

    // Convert Sets to Arrays
    microdataData.types = Array.from(microdataData.types);
    microdataData.properties = Array.from(microdataData.properties);

    return microdataData;
  }

  /**
   * Detect RDFa structured data
   * @param {Document} document - DOM document
   * @returns {Object} RDFa data
   * @private
   */
  _detectRDFa(document) {
    const rdfa1Elements = Array.from(document.querySelectorAll('[typeof], [property], [rel], [rev]'));
    const rdfa2Elements = Array.from(document.querySelectorAll('[vocab], [prefix]'));
    
    const rdfaData = {
      version: this._detectRDFaVersion(document),
      count: rdfa1Elements.length,
      elements: [],
      types: new Set(),
      properties: new Set(),
      vocabularies: new Set()
    };

    rdfa1Elements.forEach((element, index) => {
      const item = {
        index: index + 1,
        tagName: element.tagName.toLowerCase(),
        typeof: element.getAttribute('typeof'),
        property: element.getAttribute('property'),
        rel: element.getAttribute('rel'),
        rev: element.getAttribute('rev'),
        resource: element.getAttribute('resource'),
        href: element.getAttribute('href'),
        content: element.getAttribute('content'),
        datatype: element.getAttribute('datatype'),
        textContent: element.textContent.trim().substring(0, 100) // Limit for storage
      };

      rdfaData.elements.push(item);

      // Collect types and properties
      if (item.typeof) {
        rdfaData.types.add(item.typeof);
      }
      if (item.property) {
        rdfaData.properties.add(item.property);
      }
    });

    // Detect vocabularies
    const vocabElements = document.querySelectorAll('[vocab]');
    vocabElements.forEach(element => {
      const vocab = element.getAttribute('vocab');
      if (vocab) {
        rdfaData.vocabularies.add(vocab);
      }
    });

    // Convert Sets to Arrays
    rdfaData.types = Array.from(rdfaData.types);
    rdfaData.properties = Array.from(rdfaData.properties);
    rdfaData.vocabularies = Array.from(rdfaData.vocabularies);

    return rdfaData;
  }

  /**
   * Detect Open Graph as structured data
   * @param {Document} document - DOM document
   * @returns {Object} Open Graph structured data
   * @private
   */
  _detectOpenGraphStructuredData(document) {
    const ogTags = Array.from(document.querySelectorAll('meta[property^="og:"]'));
    
    const ogData = {
      count: ogTags.length,
      present: ogTags.length > 0,
      properties: {},
      isComplete: false,
      types: new Set()
    };

    // Essential OG properties
    const essentialProps = ['og:title', 'og:type', 'og:image', 'og:url'];
    let essentialCount = 0;

    ogTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      
      if (property && content) {
        ogData.properties[property] = content;
        
        if (essentialProps.includes(property)) {
          essentialCount++;
        }
        
        if (property === 'og:type') {
          ogData.types.add(content);
        }
      }
    });

    ogData.isComplete = essentialCount === essentialProps.length;
    ogData.types = Array.from(ogData.types);

    return ogData;
  }

  // Helper methods

  /**
   * Extract types from JSON-LD data
   * @param {Object|Array} data - Parsed JSON-LD data
   * @returns {Array} Array of types
   * @private
   */
  _extractTypes(data) {
    const types = [];
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        types.push(...this._extractTypes(item));
      });
    } else if (typeof data === 'object' && data !== null) {
      if (data['@type']) {
        if (Array.isArray(data['@type'])) {
          types.push(...data['@type']);
        } else {
          types.push(data['@type']);
        }
      }
      
      // Check nested objects
      Object.values(data).forEach(value => {
        if (typeof value === 'object' && value !== null) {
          types.push(...this._extractTypes(value));
        }
      });
    }
    
    return [...new Set(types)]; // Remove duplicates
  }

  /**
   * Extract microdata properties from element
   * @param {Element} element - Element with itemscope
   * @returns {Object} Properties and their values
   * @private
   */
  _extractMicrodataProperties(element) {
    const properties = {};
    const propElements = element.querySelectorAll('[itemprop]');
    
    propElements.forEach(propElement => {
      const propName = propElement.getAttribute('itemprop');
      const propValue = this._getMicrodataValue(propElement);
      
      if (propName && propValue !== null) {
        if (properties[propName]) {
          // Multiple values for same property
          if (!Array.isArray(properties[propName])) {
            properties[propName] = [properties[propName]];
          }
          properties[propName].push(propValue);
        } else {
          properties[propName] = propValue;
        }
      }
    });
    
    return properties;
  }

  /**
   * Get microdata value from element
   * @param {Element} element - Element with itemprop
   * @returns {string|null} Property value
   * @private
   */
  _getMicrodataValue(element) {
    const tagName = element.tagName.toLowerCase();
    
    // Special cases for different elements
    switch (tagName) {
      case 'meta':
        return element.getAttribute('content');
      case 'img':
      case 'audio':
      case 'video':
      case 'embed':
      case 'iframe':
      case 'source':
        return element.getAttribute('src');
      case 'a':
      case 'area':
      case 'link':
        return element.getAttribute('href');
      case 'object':
        return element.getAttribute('data');
      case 'time':
        return element.getAttribute('datetime') || element.textContent.trim();
      default:
        return element.textContent.trim();
    }
  }

  /**
   * Detect RDFa version
   * @param {Document} document - DOM document
   * @returns {string} RDFa version
   * @private
   */
  _detectRDFaVersion(document) {
    const html = document.documentElement;
    const version = html.getAttribute('version');
    const vocab = html.getAttribute('vocab');
    const prefix = html.getAttribute('prefix');
    
    if (vocab || prefix) {
      return 'RDFa 1.1';
    } else if (version && version.includes('RDFa')) {
      return version;
    } else if (document.querySelector('[typeof], [property]')) {
      return 'RDFa 1.0';
    }
    
    return 'None';
  }

  /**
   * Validate JSON-LD syntax (basic validation)
   * @param {string} jsonString - JSON-LD string
   * @returns {Object} Validation result
   * @private
   */
  _validateJSONLD(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      
      const validation = {
        valid: true,
        hasContext: !!parsed['@context'],
        hasType: !!parsed['@type'],
        hasId: !!parsed['@id'],
        warnings: []
      };

      // Check for common issues
      if (!validation.hasContext) {
        validation.warnings.push('Missing @context');
      }
      
      if (!validation.hasType) {
        validation.warnings.push('Missing @type');
      }
      
      return validation;

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        warnings: []
      };
    }
  }

  /**
   * Analyze schema.org types
   * @param {Array} types - Array of type strings
   * @returns {Object} Schema.org analysis
   * @private
   */
  _analyzeSchemaTypes(types) {
    const schemaOrgPattern = /schema\.org\/(\w+)/;
    const schemaTypes = [];
    const nonSchemaTypes = [];
    
    types.forEach(type => {
      if (type.includes('schema.org') || schemaOrgPattern.test(type)) {
        const match = type.match(schemaOrgPattern);
        schemaTypes.push(match ? match[1] : type);
      } else {
        nonSchemaTypes.push(type);
      }
    });

    return {
      schemaOrgTypes: schemaTypes,
      nonSchemaTypes: nonSchemaTypes,
      schemaOrgCount: schemaTypes.length,
      totalTypes: types.length
    };
  }

  /**
   * Check for structured data best practices
   * @param {Object} results - Detection results
   * @returns {Array} Array of recommendations
   * @private
   */
  _checkBestPractices(results) {
    const recommendations = [];
    
    // Check for JSON-LD (preferred format)
    if (!results.jsonLd || results.jsonLd.count === 0) {
      recommendations.push('Consider adding JSON-LD structured data (Google\'s preferred format)');
    }
    
    // Check for multiple formats (potential conflict)
    const formatCount = [
      results.jsonLd?.count || 0,
      results.microdata?.count || 0,
      results.rdfa?.count || 0
    ].filter(count => count > 0).length;
    
    if (formatCount > 1) {
      recommendations.push('Multiple structured data formats detected - consider consolidating to JSON-LD');
    }
    
    // Check for invalid JSON-LD
    if (results.jsonLd && results.jsonLd.invalid > 0) {
      recommendations.push(`${results.jsonLd.invalid} invalid JSON-LD script(s) found - fix syntax errors`);
    }
    
    // Check for essential schema types
    const hasOrganization = this._hasSchemaType(results, 'Organization');
    const hasWebsite = this._hasSchemaType(results, 'WebSite');
    const hasWebPage = this._hasSchemaType(results, 'WebPage');
    
    if (!hasOrganization) {
      recommendations.push('Consider adding Organization schema for business information');
    }
    
    if (!hasWebsite) {
      recommendations.push('Consider adding WebSite schema for site-wide information');
    }
    
    if (!hasWebPage) {
      recommendations.push('Consider adding WebPage schema for page-specific information');
    }
    
    return recommendations;
  }

  /**
   * Check if specific schema type exists
   * @param {Object} results - Detection results
   * @param {string} schemaType - Schema type to check
   * @returns {boolean} True if type exists
   * @private
   */
  _hasSchemaType(results, schemaType) {
    const allTypes = [
      ...(results.jsonLd?.types || []),
      ...(results.microdata?.types || []),
      ...(results.rdfa?.types || [])
    ];
    
    return allTypes.some(type => 
      type === schemaType || 
      type.includes(`/${schemaType}`) ||
      type.includes(`:${schemaType}`)
    );
  }

  /**
   * Calculate overall statistics
   * @param {Object} results - Detection results
   * @returns {Object} Statistics
   * @private
   */
  _calculateStatistics(results) {
    const stats = {
      totalItems: 0,
      formats: {
        jsonLd: results.jsonLd?.count || 0,
        microdata: results.microdata?.count || 0,
        rdfa: results.rdfa?.count || 0,
        openGraph: results.openGraph?.present ? 1 : 0
      },
      types: {
        total: 0,
        unique: [],
        schemaOrg: 0
      },
      quality: {
        validJsonLd: results.jsonLd?.valid || 0,
        invalidJsonLd: results.jsonLd?.invalid || 0,
        completeness: 0
      }
    };

    // Calculate totals
    stats.totalItems = Object.values(stats.formats).reduce((sum, count) => sum + count, 0);

    // Collect all types
    const allTypes = [
      ...(results.jsonLd?.types || []),
      ...(results.microdata?.types || []),
      ...(results.rdfa?.types || []),
      ...(results.openGraph?.types || [])
    ];

    stats.types.unique = [...new Set(allTypes)];
    stats.types.total = stats.types.unique.length;
    stats.types.schemaOrg = stats.types.unique.filter(type => 
      type.includes('schema.org') || type.includes('Schema')
    ).length;

    // Calculate quality metrics
    const totalJsonLd = (results.jsonLd?.valid || 0) + (results.jsonLd?.invalid || 0);
    if (totalJsonLd > 0) {
      stats.quality.completeness = Math.round((results.jsonLd.valid / totalJsonLd) * 100);
    } else {
      stats.quality.completeness = stats.totalItems > 0 ? 80 : 0; // Assume other formats are valid
    }

    return stats;
  }

  /**
   * Get schema recommendations based on detected content
   * @param {Document} document - DOM document
   * @returns {Array} Array of schema recommendations
   * @private
   */
  _getSchemaRecommendations(document) {
    const recommendations = [];
    
    // Check for common content types
    const hasArticle = document.querySelector('article, .article, .post, .blog-post');
    const hasEvents = document.querySelector('.event, .events, [data-event]');
    const hasProducts = document.querySelector('.product, .products, [data-product]');
    const hasReviews = document.querySelector('.review, .reviews, .rating');
    const hasContact = document.querySelector('.contact, .address, [itemprop="address"]');
    const hasBreadcrumbs = document.querySelector('.breadcrumb, .breadcrumbs, [role="breadcrumb"]');
    
    if (hasArticle) {
      recommendations.push('Article schema for blog posts or articles');
    }
    
    if (hasEvents) {
      recommendations.push('Event schema for events and activities');
    }
    
    if (hasProducts) {
      recommendations.push('Product schema for e-commerce items');
    }
    
    if (hasReviews) {
      recommendations.push('Review schema for ratings and reviews');
    }
    
    if (hasContact) {
      recommendations.push('LocalBusiness schema for contact information');
    }
    
    if (hasBreadcrumbs) {
      recommendations.push('BreadcrumbList schema for navigation');
    }
    
    return recommendations;
  }
}

export default StructuredDataDetector;
