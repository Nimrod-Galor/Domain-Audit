/**
 * ============================================================================
 * STRUCTURED DATA DETECTOR - GPT-5 STYLE COMPONENT
 * ============================================================================
 * 
 * Advanced structured data detection and validation for SEO optimization
 * Part of the Combined Approach SEO Analyzer (8th Implementation)
 * 
 * Features:
 * - Schema.org structured data detection
 * - JSON-LD, Microdata, and RDFa support
 * - Rich snippets optimization analysis
 * - Knowledge Graph enhancement
 * - Local SEO structured data
 * 
 * @version 1.0.0
 * @author Development Team
 * @integration Combined Approach Pattern - Detector Component
 */

export class StructuredDataDetector {
  constructor(config = {}) {
    this.config = {
      includeJsonLd: config.includeJsonLd !== false,
      includeMicrodata: config.includeMicrodata !== false,
      includeRdfa: config.includeRdfa !== false,
      validateSchemas: config.validateSchemas !== false,
      analysisDepth: config.analysisDepth || 'comprehensive',
      ...config
    };

    this.version = '1.0.0';
    this.detectorType = 'structured_data';
    
    // Common Schema.org types
    this.schemaTypes = {
      // Core business types
      organization: ['Organization', 'LocalBusiness', 'Corporation', 'NGO'],
      person: ['Person'],
      place: ['Place', 'LocalBusiness', 'Restaurant', 'Store'],
      
      // Content types
      article: ['Article', 'NewsArticle', 'BlogPosting', 'ScholarlyArticle'],
      product: ['Product', 'SoftwareApplication', 'Book', 'Movie'],
      review: ['Review', 'AggregateRating'],
      
      // Event types
      event: ['Event', 'BusinessEvent', 'EducationEvent', 'SportsEvent'],
      
      // Technical types
      webpage: ['WebPage', 'WebSite', 'SearchAction'],
      breadcrumb: ['BreadcrumbList'],
      faq: ['FAQPage', 'Question'],
      
      // E-commerce types
      offer: ['Offer', 'AggregateOffer', 'PriceSpecification'],
      brand: ['Brand'],
      
      // Media types
      video: ['VideoObject', 'Clip'],
      image: ['ImageObject'],
      audio: ['AudioObject']
    };

    // Rich snippet opportunities
    this.richSnippetTypes = [
      'Article', 'Product', 'Review', 'Recipe', 'Event', 'Organization',
      'Person', 'LocalBusiness', 'FAQPage', 'HowTo', 'JobPosting'
    ];

    this.cache = new Map();
  }

  /**
   * Get detector metadata
   * @returns {Object} Detector metadata
   */
  getMetadata() {
    return {
      name: 'StructuredDataDetector',
      version: this.version,
      type: this.detectorType,
      description: 'GPT-5 style structured data detection and validation for SEO optimization',
      capabilities: [
        'schema_org_detection',
        'json_ld_analysis',
        'microdata_extraction',
        'rdfa_parsing',
        'rich_snippets_optimization',
        'knowledge_graph_enhancement',
        'local_seo_structured_data'
      ],
      supportedFormats: {
        jsonLd: this.config.includeJsonLd,
        microdata: this.config.includeMicrodata,
        rdfa: this.config.includeRdfa
      },
      schemaTypes: Object.keys(this.schemaTypes).length,
      richSnippetTypes: this.richSnippetTypes.length,
      performance: 'High',
      accuracy: 'Comprehensive'
    };
  }

  /**
   * Analyze document structured data
   * @param {Object} context - Analysis context
   * @returns {Promise<Object>} Structured data analysis results
   */
  async analyze(context) {
    try {
      const { document, url = '', pageData = {} } = context;
      
      if (!document) {
        throw new Error('Document is required for structured data analysis');
      }

      // Check cache
      const cacheKey = this._generateCacheKey(document);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const startTime = Date.now();

      // Phase 1: Detect JSON-LD structured data
      const jsonLdData = this._detectJsonLd(document);

      // Phase 2: Detect Microdata
      const microdataData = this._detectMicrodata(document);

      // Phase 3: Detect RDFa
      const rdfaData = this._detectRdfa(document);

      // Phase 4: Analyze schema types and coverage
      const schemaAnalysis = this._analyzeSchemas(jsonLdData, microdataData, rdfaData);

      // Phase 5: Rich snippets analysis
      const richSnippetsAnalysis = this._analyzeRichSnippets(schemaAnalysis, document);

      // Phase 6: Knowledge Graph optimization
      const knowledgeGraphAnalysis = this._analyzeKnowledgeGraph(schemaAnalysis, pageData);

      // Phase 7: Local SEO structured data
      const localSeoAnalysis = this._analyzeLocalSeo(schemaAnalysis, document);

      // Phase 8: Validation and scoring
      const validation = this._validateStructuredData(schemaAnalysis, richSnippetsAnalysis);

      // Compile results
      const results = {
        success: true,
        detectorType: this.detectorType,
        
        // Core structured data
        jsonLd: jsonLdData,
        microdata: microdataData,
        rdfa: rdfaData,
        schemas: schemaAnalysis,
        richSnippets: richSnippetsAnalysis,
        knowledgeGraph: knowledgeGraphAnalysis,
        localSeo: localSeoAnalysis,
        validation,
        
        // Summary metrics
        summary: {
          totalStructuredData: jsonLdData.count + microdataData.count + rdfaData.count,
          jsonLdCount: jsonLdData.count,
          microdataCount: microdataData.count,
          rdfaCount: rdfaData.count,
          schemaTypesFound: schemaAnalysis.uniqueTypes.length,
          richSnippetOpportunities: richSnippetsAnalysis.opportunities.length,
          validationScore: validation.score,
          knowledgeGraphScore: knowledgeGraphAnalysis.score,
          overallScore: validation.overallScore,
          optimizationLevel: this._getOptimizationLevel(validation.overallScore)
        },

        // Performance data
        performance: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          cacheUsed: false
        }
      };

      // Cache results
      this.cache.set(cacheKey, results);

      return results;

    } catch (error) {
      return {
        success: false,
        error: `Structured data detection failed: ${error.message}`,
        detectorType: this.detectorType
      };
    }
  }

  /**
   * Detect JSON-LD structured data
   * @param {Document} document - DOM document
   * @returns {Object} JSON-LD data analysis
   */
  _detectJsonLd(document) {
    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const validJsonLd = [];
    const invalidJsonLd = [];
    const errors = [];

    jsonLdScripts.forEach((script, index) => {
      try {
        const content = script.textContent.trim();
        if (content) {
          const data = JSON.parse(content);
          const analyzed = this._analyzeJsonLdObject(data, index);
          validJsonLd.push({
            element: script,
            index,
            content,
            data,
            analysis: analyzed
          });
        }
      } catch (error) {
        invalidJsonLd.push({
          element: script,
          index,
          content: script.textContent.trim(),
          error: error.message
        });
        errors.push(`JSON-LD ${index}: ${error.message}`);
      }
    });

    // Extract all schema types found
    const schemaTypes = new Set();
    const contexts = new Set();
    
    validJsonLd.forEach(item => {
      if (item.analysis.types) {
        item.analysis.types.forEach(type => schemaTypes.add(type));
      }
      if (item.analysis.context) {
        contexts.add(item.analysis.context);
      }
    });

    return {
      count: jsonLdScripts.length,
      valid: validJsonLd.length,
      invalid: invalidJsonLd.length,
      validJsonLd,
      invalidJsonLd,
      errors,
      schemaTypes: Array.from(schemaTypes),
      contexts: Array.from(contexts),
      
      quality: {
        validationRate: jsonLdScripts.length > 0 ? validJsonLd.length / jsonLdScripts.length : 1,
        hasStructuredData: validJsonLd.length > 0,
        multipleSchemas: validJsonLd.length > 1,
        errorRate: jsonLdScripts.length > 0 ? errors.length / jsonLdScripts.length : 0
      }
    };
  }

  /**
   * Detect Microdata structured data
   * @param {Document} document - DOM document
   * @returns {Object} Microdata analysis
   */
  _detectMicrodata(document) {
    const microdataElements = Array.from(document.querySelectorAll('[itemscope]'));
    const extractedData = [];

    microdataElements.forEach((element, index) => {
      const itemData = this._extractMicrodataItem(element, index);
      if (itemData) {
        extractedData.push(itemData);
      }
    });

    // Analyze microdata structure
    const itemTypes = new Set();
    const properties = new Set();
    
    extractedData.forEach(item => {
      if (item.itemType) {
        itemTypes.add(item.itemType);
      }
      if (item.properties) {
        Object.keys(item.properties).forEach(prop => properties.add(prop));
      }
    });

    return {
      count: microdataElements.length,
      extractedItems: extractedData.length,
      items: extractedData,
      itemTypes: Array.from(itemTypes),
      properties: Array.from(properties),
      
      quality: {
        hasValidItems: extractedData.length > 0,
        averagePropertiesPerItem: extractedData.length > 0 ? 
          extractedData.reduce((sum, item) => sum + Object.keys(item.properties || {}).length, 0) / extractedData.length : 0,
        nestedItemsCount: extractedData.filter(item => item.hasNestedItems).length
      }
    };
  }

  /**
   * Detect RDFa structured data
   * @param {Document} document - DOM document
   * @returns {Object} RDFa analysis
   */
  _detectRdfa(document) {
    const rdfaElements = Array.from(document.querySelectorAll('[typeof], [property], [resource], [about]'));
    const extractedData = [];

    // Group elements by subject (about/resource)
    const subjects = new Map();
    
    rdfaElements.forEach((element, index) => {
      const rdfaData = this._extractRdfaData(element, index);
      if (rdfaData) {
        const subject = rdfaData.about || rdfaData.resource || `_:blank${index}`;
        
        if (!subjects.has(subject)) {
          subjects.set(subject, {
            subject,
            typeof: rdfaData.typeof,
            properties: new Map(),
            elements: []
          });
        }
        
        const subjectData = subjects.get(subject);
        
        if (rdfaData.property && rdfaData.content) {
          subjectData.properties.set(rdfaData.property, rdfaData.content);
        }
        
        subjectData.elements.push(element);
        extractedData.push(rdfaData);
      }
    });

    // Convert subjects map to array
    const structuredSubjects = Array.from(subjects.values()).map(subject => ({
      ...subject,
      properties: Object.fromEntries(subject.properties),
      elementCount: subject.elements.length
    }));

    // Extract vocabularies and types
    const vocabularies = new Set();
    const types = new Set();
    const properties = new Set();
    
    extractedData.forEach(item => {
      if (item.vocab) vocabularies.add(item.vocab);
      if (item.typeof) types.add(item.typeof);
      if (item.property) properties.add(item.property);
    });

    return {
      count: rdfaElements.length,
      extractedProperties: extractedData.length,
      subjects: structuredSubjects,
      data: extractedData,
      vocabularies: Array.from(vocabularies),
      types: Array.from(types),
      properties: Array.from(properties),
      
      quality: {
        hasValidData: extractedData.length > 0,
        subjectCount: structuredSubjects.length,
        averagePropertiesPerSubject: structuredSubjects.length > 0 ?
          structuredSubjects.reduce((sum, subj) => sum + Object.keys(subj.properties).length, 0) / structuredSubjects.length : 0,
        vocabularyDiversity: vocabularies.size
      }
    };
  }

  /**
   * Analyze all detected schemas
   * @param {Object} jsonLdData - JSON-LD data
   * @param {Object} microdataData - Microdata
   * @param {Object} rdfaData - RDFa data
   * @returns {Object} Comprehensive schema analysis
   */
  _analyzeSchemas(jsonLdData, microdataData, rdfaData) {
    // Collect all schema types
    const allTypes = new Set([
      ...jsonLdData.schemaTypes,
      ...microdataData.itemTypes,
      ...rdfaData.types
    ]);

    // Categorize schema types
    const categorizedTypes = this._categorizeSchemaTypes(Array.from(allTypes));
    
    // Analyze schema coverage
    const coverage = this._analyzeSchemaoCoverage(Array.from(allTypes));
    
    // Check for schema completeness
    const completeness = this._analyzeSchemaCompleteness(jsonLdData, microdataData, rdfaData);
    
    // Identify missing essential schemas
    const missingSchemas = this._identifyMissingSchemas(Array.from(allTypes));

    let score = 100;
    const issues = [];
    const recommendations = [];

    // Score based on schema presence and quality
    if (allTypes.size === 0) {
      score = 0;
      issues.push('No structured data found');
      recommendations.push('Add basic Schema.org structured data');
    } else {
      // Bonus for having multiple types
      if (allTypes.size >= 3) score += 10;
      
      // Check for essential types
      const hasOrganization = this._hasSchemaType(allTypes, this.schemaTypes.organization);
      const hasWebpage = this._hasSchemaType(allTypes, this.schemaTypes.webpage);
      
      if (!hasOrganization) {
        score -= 15;
        recommendations.push('Add Organization schema');
      }
      
      if (!hasWebpage) {
        score -= 10;
        recommendations.push('Add WebPage schema');
      }
    }

    return {
      uniqueTypes: Array.from(allTypes),
      categorizedTypes,
      coverage,
      completeness,
      missingSchemas,
      
      score: Math.max(0, Math.min(100, score)),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      analysis: {
        totalSchemaTypes: allTypes.size,
        hasBasicSchemas: allTypes.size > 0,
        hasAdvancedSchemas: allTypes.size >= 3,
        schemaQuality: this._calculateSchemaQuality(jsonLdData, microdataData, rdfaData),
        implementationDiversity: this._calculateImplementationDiversity(jsonLdData, microdataData, rdfaData)
      }
    };
  }

  /**
   * Analyze rich snippets opportunities
   * @param {Object} schemaAnalysis - Schema analysis results
   * @param {Document} document - DOM document
   * @returns {Object} Rich snippets analysis
   */
  _analyzeRichSnippets(schemaAnalysis, document) {
    const { uniqueTypes } = schemaAnalysis;
    
    // Check for rich snippet eligible types
    const eligibleTypes = uniqueTypes.filter(type => 
      this.richSnippetTypes.some(richType => type.includes(richType))
    );
    
    // Identify opportunities for rich snippets
    const opportunities = this._identifyRichSnippetOpportunities(document, uniqueTypes);
    
    // Analyze current rich snippet implementation
    const implementation = this._analyzeRichSnippetImplementation(uniqueTypes);
    
    let score = 50; // Base score
    const issues = [];
    const recommendations = [];

    if (eligibleTypes.length === 0) {
      score = 30;
      issues.push('No rich snippet eligible schemas found');
      recommendations.push('Add schemas for rich snippets (Article, Product, Review, etc.)');
    } else {
      score += eligibleTypes.length * 15;
      
      // Check for high-value rich snippets
      const hasProduct = eligibleTypes.some(type => type.includes('Product'));
      const hasReview = eligibleTypes.some(type => type.includes('Review'));
      const hasArticle = eligibleTypes.some(type => type.includes('Article'));
      const hasFAQ = eligibleTypes.some(type => type.includes('FAQ'));
      
      if (hasProduct || hasReview) score += 20;
      if (hasArticle) score += 15;
      if (hasFAQ) score += 10;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      
      eligibleTypes,
      opportunities,
      implementation,
      
      analysis: {
        richSnippetPotential: eligibleTypes.length > 0,
        highValueSchemas: this._countHighValueSchemas(eligibleTypes),
        implementationQuality: implementation.quality,
        opportunityCount: opportunities.length
      }
    };
  }

  /**
   * Analyze Knowledge Graph optimization
   * @param {Object} schemaAnalysis - Schema analysis results
   * @param {Object} pageData - Additional page data
   * @returns {Object} Knowledge Graph analysis
   */
  _analyzeKnowledgeGraph(schemaAnalysis, pageData) {
    const { uniqueTypes } = schemaAnalysis;
    
    // Knowledge Graph relevant schemas
    const kgRelevantTypes = [
      'Organization', 'LocalBusiness', 'Person', 'Place',
      'Product', 'Brand', 'WebSite', 'SearchAction'
    ];
    
    const relevantSchemas = uniqueTypes.filter(type =>
      kgRelevantTypes.some(kgType => type.includes(kgType))
    );
    
    let score = 60; // Base score
    const issues = [];
    const recommendations = [];
    const optimizations = [];

    // Check for entity-defining schemas
    const hasOrganization = this._hasSchemaType(uniqueTypes, this.schemaTypes.organization);
    const hasPerson = this._hasSchemaType(uniqueTypes, this.schemaTypes.person);
    const hasWebsite = this._hasSchemaType(uniqueTypes, this.schemaTypes.webpage);
    
    if (hasOrganization || hasPerson) {
      score += 20;
      optimizations.push('Entity-defining schema present');
    } else {
      score -= 15;
      issues.push('Missing entity-defining schema');
      recommendations.push('Add Organization or Person schema');
    }
    
    if (hasWebsite) {
      score += 15;
      optimizations.push('Website schema supports site links');
    } else {
      recommendations.push('Add WebSite schema with SearchAction');
    }
    
    // Check for sameAs properties (brand authority)
    const hasSameAs = this._checkForSameAsProperties(schemaAnalysis);
    if (hasSameAs) {
      score += 10;
      optimizations.push('Entity connections via sameAs');
    } else {
      recommendations.push('Add sameAs properties for entity validation');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      optimizations,
      
      relevantSchemas,
      entityTypes: {
        hasOrganization,
        hasPerson,
        hasWebsite,
        hasSameAs
      },
      
      analysis: {
        knowledgeGraphReadiness: relevantSchemas.length >= 2,
        entityDefinition: hasOrganization || hasPerson,
        brandAuthority: hasSameAs,
        searchOptimization: hasWebsite
      }
    };
  }

  /**
   * Analyze local SEO structured data
   * @param {Object} schemaAnalysis - Schema analysis results
   * @param {Document} document - DOM document
   * @returns {Object} Local SEO analysis
   */
  _analyzeLocalSeo(schemaAnalysis, document) {
    const { uniqueTypes } = schemaAnalysis;
    
    // Local business relevant schemas
    const localBusinessTypes = [
      'LocalBusiness', 'Restaurant', 'Store', 'Organization',
      'Place', 'PostalAddress', 'GeoCoordinates', 'OpeningHours'
    ];
    
    const localSchemas = uniqueTypes.filter(type =>
      localBusinessTypes.some(localType => type.includes(localType))
    );
    
    // Check for local business indicators
    const hasLocalBusiness = localSchemas.length > 0;
    const hasAddress = this._hasSchemaType(uniqueTypes, ['PostalAddress']) || 
                     this._detectAddressInContent(document);
    const hasPhoneNumber = this._detectPhoneInContent(document);
    const hasOpeningHours = this._hasSchemaType(uniqueTypes, ['OpeningHours']);
    const hasGeoCoordinates = this._hasSchemaType(uniqueTypes, ['GeoCoordinates']);
    
    let score = 50; // Base score
    const issues = [];
    const recommendations = [];
    const opportunities = [];

    if (hasLocalBusiness) {
      score += 25;
      opportunities.push('Local business schema detected');
      
      if (hasAddress) score += 15;
      else recommendations.push('Add postal address schema');
      
      if (hasPhoneNumber) score += 10;
      else recommendations.push('Add telephone number');
      
      if (hasOpeningHours) score += 10;
      else recommendations.push('Add opening hours schema');
      
      if (hasGeoCoordinates) score += 15;
      else recommendations.push('Add geo coordinates for map integration');
      
    } else if (hasAddress || hasPhoneNumber) {
      score += 10;
      recommendations.push('Consider adding LocalBusiness schema');
    }

    return {
      score: Math.max(0, score),
      grade: this._calculateGrade(score),
      issues,
      recommendations,
      opportunities,
      
      localSchemas,
      features: {
        hasLocalBusiness,
        hasAddress,
        hasPhoneNumber,
        hasOpeningHours,
        hasGeoCoordinates
      },
      
      analysis: {
        localSeoReady: hasLocalBusiness && hasAddress,
        mapIntegrationReady: hasGeoCoordinates,
        businessInfoComplete: hasLocalBusiness && hasAddress && hasPhoneNumber && hasOpeningHours,
        localSearchOptimized: localSchemas.length >= 3
      }
    };
  }

  /**
   * Validate overall structured data implementation
   * @param {Object} schemaAnalysis - Schema analysis
   * @param {Object} richSnippetsAnalysis - Rich snippets analysis
   * @returns {Object} Validation results
   */
  _validateStructuredData(schemaAnalysis, richSnippetsAnalysis) {
    const scores = [
      schemaAnalysis.score,
      richSnippetsAnalysis.score
    ];

    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const grade = this._calculateGrade(overallScore);

    // Critical issues
    const criticalIssues = [];
    if (schemaAnalysis.uniqueTypes.length === 0) {
      criticalIssues.push('No structured data found');
    }
    if (richSnippetsAnalysis.eligibleTypes.length === 0) {
      criticalIssues.push('No rich snippet opportunities');
    }

    return {
      overallScore,
      grade,
      criticalIssues,
      passesValidation: criticalIssues.length === 0 && overallScore >= 70,
      improvementAreas: this._identifyStructuredDataImprovementAreas(schemaAnalysis, richSnippetsAnalysis),
      recommendations: this._generateStructuredDataRecommendations(schemaAnalysis, richSnippetsAnalysis)
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _analyzeJsonLdObject(data, index) {
    const analysis = {
      index,
      isArray: Array.isArray(data),
      types: [],
      context: null,
      properties: [],
      hasId: false,
      hasUrl: false,
      validation: { valid: true, errors: [] }
    };

    try {
      const items = Array.isArray(data) ? data : [data];
      
      items.forEach(item => {
        if (item['@context']) {
          analysis.context = item['@context'];
        }
        
        if (item['@type']) {
          const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          analysis.types.push(...types);
        }
        
        if (item['@id']) analysis.hasId = true;
        if (item.url) analysis.hasUrl = true;
        
        analysis.properties.push(...Object.keys(item).filter(key => !key.startsWith('@')));
      });
      
      // Remove duplicates
      analysis.types = [...new Set(analysis.types)];
      analysis.properties = [...new Set(analysis.properties)];
      
    } catch (error) {
      analysis.validation.valid = false;
      analysis.validation.errors.push(error.message);
    }

    return analysis;
  }

  _extractMicrodataItem(element, index) {
    const itemType = element.getAttribute('itemtype');
    const itemId = element.getAttribute('itemid');
    const properties = {};
    
    // Find all properties within this item scope
    const propertyElements = Array.from(element.querySelectorAll('[itemprop]'));
    
    propertyElements.forEach(propElement => {
      const propName = propElement.getAttribute('itemprop');
      let propValue = null;
      
      // Extract value based on element type
      if (propElement.hasAttribute('content')) {
        propValue = propElement.getAttribute('content');
      } else if (propElement.tagName.toLowerCase() === 'meta') {
        propValue = propElement.getAttribute('content');
      } else if (propElement.tagName.toLowerCase() === 'a') {
        propValue = propElement.href;
      } else if (propElement.tagName.toLowerCase() === 'img') {
        propValue = propElement.src;
      } else {
        propValue = propElement.textContent.trim();
      }
      
      if (propName && propValue) {
        if (properties[propName]) {
          // Handle multiple values
          if (Array.isArray(properties[propName])) {
            properties[propName].push(propValue);
          } else {
            properties[propName] = [properties[propName], propValue];
          }
        } else {
          properties[propName] = propValue;
        }
      }
    });
    
    // Check for nested items
    const nestedItems = Array.from(element.querySelectorAll('[itemscope]')).filter(nested => nested !== element);
    
    return {
      index,
      element,
      itemType,
      itemId,
      properties,
      hasNestedItems: nestedItems.length > 0,
      nestedItemsCount: nestedItems.length,
      propertyCount: Object.keys(properties).length
    };
  }

  _extractRdfaData(element, index) {
    const data = {
      index,
      element,
      typeof: element.getAttribute('typeof'),
      property: element.getAttribute('property'),
      resource: element.getAttribute('resource'),
      about: element.getAttribute('about'),
      content: element.getAttribute('content'),
      vocab: element.getAttribute('vocab'),
      prefix: element.getAttribute('prefix')
    };
    
    // If no content attribute, use text content for property
    if (data.property && !data.content) {
      data.content = element.textContent.trim();
    }
    
    // If no content and is a link, use href
    if (data.property && !data.content && element.tagName.toLowerCase() === 'a') {
      data.content = element.href;
    }
    
    return data;
  }

  _categorizeSchemaTypes(types) {
    const categories = {
      organization: [],
      person: [],
      place: [],
      article: [],
      product: [],
      review: [],
      event: [],
      webpage: [],
      breadcrumb: [],
      faq: [],
      offer: [],
      brand: [],
      video: [],
      image: [],
      audio: [],
      other: []
    };
    
    types.forEach(type => {
      let categorized = false;
      
      for (const [category, schemaTypes] of Object.entries(this.schemaTypes)) {
        if (schemaTypes.some(schemaType => type.includes(schemaType))) {
          categories[category].push(type);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categories.other.push(type);
      }
    });
    
    return categories;
  }

  _analyzeSchemaoCoverage(types) {
    const totalCategories = Object.keys(this.schemaTypes).length;
    const coveredCategories = Object.keys(this.schemaTypes).filter(category =>
      types.some(type => 
        this.schemaTypes[category].some(schemaType => type.includes(schemaType))
      )
    ).length;
    
    return {
      percentage: (coveredCategories / totalCategories) * 100,
      coveredCategories,
      totalCategories,
      score: (coveredCategories / totalCategories) * 100
    };
  }

  _analyzeSchemaCompleteness(jsonLdData, microdataData, rdfaData) {
    const hasJsonLd = jsonLdData.valid > 0;
    const hasMicrodata = microdataData.extractedItems > 0;
    const hasRdfa = rdfaData.extractedProperties > 0;
    
    const implementationCount = [hasJsonLd, hasMicrodata, hasRdfa].filter(Boolean).length;
    
    return {
      score: implementationCount * 33.33,
      implementations: implementationCount,
      hasJsonLd,
      hasMicrodata,
      hasRdfa,
      isComplete: implementationCount >= 1,
      isDiverse: implementationCount >= 2
    };
  }

  _identifyMissingSchemas(existingTypes) {
    const essential = ['Organization', 'WebPage', 'WebSite'];
    const recommended = ['Article', 'Person', 'BreadcrumbList'];
    
    const missingEssential = essential.filter(type =>
      !existingTypes.some(existing => existing.includes(type))
    );
    
    const missingRecommended = recommended.filter(type =>
      !existingTypes.some(existing => existing.includes(type))
    );
    
    return {
      essential: missingEssential,
      recommended: missingRecommended,
      total: missingEssential.length + missingRecommended.length
    };
  }

  _hasSchemaType(types, schemaTypes) {
    return types.some(type => 
      schemaTypes.some(schemaType => type.includes(schemaType))
    );
  }

  _calculateSchemaQuality(jsonLdData, microdataData, rdfaData) {
    let quality = 0;
    let factors = 0;
    
    if (jsonLdData.valid > 0) {
      quality += jsonLdData.quality.validationRate * 40;
      factors++;
    }
    
    if (microdataData.extractedItems > 0) {
      quality += Math.min(microdataData.quality.averagePropertiesPerItem * 10, 30);
      factors++;
    }
    
    if (rdfaData.extractedProperties > 0) {
      quality += Math.min(rdfaData.quality.vocabularyDiversity * 20, 30);
      factors++;
    }
    
    return factors > 0 ? quality / factors : 0;
  }

  _calculateImplementationDiversity(jsonLdData, microdataData, rdfaData) {
    const implementations = [
      jsonLdData.valid > 0,
      microdataData.extractedItems > 0,
      rdfaData.extractedProperties > 0
    ].filter(Boolean).length;
    
    return (implementations / 3) * 100;
  }

  _identifyRichSnippetOpportunities(document, existingTypes) {
    const opportunities = [];
    
    // Check for content that could benefit from rich snippets
    const hasReviews = document.querySelector('.review, .rating, [class*="star"]');
    const hasProducts = document.querySelector('.product, .price, [class*="product"]');
    const hasArticles = document.querySelector('article, .article, .post');
    const hasFAQs = document.querySelector('.faq, .question, [class*="faq"]');
    const hasEvents = document.querySelector('.event, [class*="event"]');
    
    if (hasReviews && !this._hasSchemaType(existingTypes, this.schemaTypes.review)) {
      opportunities.push({
        type: 'Review',
        reason: 'Review content detected without schema',
        priority: 'high',
        benefit: 'Star ratings in search results'
      });
    }
    
    if (hasProducts && !this._hasSchemaType(existingTypes, this.schemaTypes.product)) {
      opportunities.push({
        type: 'Product',
        reason: 'Product content detected without schema',
        priority: 'high',
        benefit: 'Product rich snippets with pricing'
      });
    }
    
    if (hasArticles && !this._hasSchemaType(existingTypes, this.schemaTypes.article)) {
      opportunities.push({
        type: 'Article',
        reason: 'Article content detected without schema',
        priority: 'medium',
        benefit: 'Enhanced article display in search'
      });
    }
    
    if (hasFAQs && !this._hasSchemaType(existingTypes, this.schemaTypes.faq)) {
      opportunities.push({
        type: 'FAQPage',
        reason: 'FAQ content detected without schema',
        priority: 'medium',
        benefit: 'Expandable FAQ results'
      });
    }
    
    if (hasEvents && !this._hasSchemaType(existingTypes, this.schemaTypes.event)) {
      opportunities.push({
        type: 'Event',
        reason: 'Event content detected without schema',
        priority: 'medium',
        benefit: 'Event rich snippets with dates'
      });
    }
    
    return opportunities;
  }

  _analyzeRichSnippetImplementation(types) {
    const richSnippetTypes = types.filter(type =>
      this.richSnippetTypes.some(richType => type.includes(richType))
    );
    
    return {
      count: richSnippetTypes.length,
      types: richSnippetTypes,
      quality: richSnippetTypes.length > 0 ? 85 : 0,
      hasHighValue: richSnippetTypes.some(type => 
        ['Product', 'Review', 'Recipe', 'Event'].some(valuable => type.includes(valuable))
      )
    };
  }

  _countHighValueSchemas(types) {
    const highValue = ['Product', 'Review', 'Recipe', 'Event', 'LocalBusiness', 'Organization'];
    return types.filter(type =>
      highValue.some(valuable => type.includes(valuable))
    ).length;
  }

  _checkForSameAsProperties(schemaAnalysis) {
    // This would require examining the actual JSON-LD content
    // For now, return a placeholder
    return false;
  }

  _detectAddressInContent(document) {
    // Simple address detection patterns
    const addressPatterns = [
      /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)/i,
      /\d{5}(?:-\d{4})?/, // ZIP codes
      /[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/ // City, State ZIP
    ];
    
    const bodyText = document.body ? document.body.textContent : '';
    return addressPatterns.some(pattern => pattern.test(bodyText));
  }

  _detectPhoneInContent(document) {
    // Simple phone number detection
    const phonePatterns = [
      /\(\d{3}\)\s*\d{3}-\d{4}/,
      /\d{3}-\d{3}-\d{4}/,
      /\d{3}\.\d{3}\.\d{4}/,
      /\+1[\s-]?\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}/
    ];
    
    const bodyText = document.body ? document.body.textContent : '';
    return phonePatterns.some(pattern => pattern.test(bodyText));
  }

  _identifyStructuredDataImprovementAreas(schemaAnalysis, richSnippetsAnalysis) {
    const areas = [];
    
    if (schemaAnalysis.uniqueTypes.length === 0) {
      areas.push('basic_structured_data');
    }
    
    if (richSnippetsAnalysis.eligibleTypes.length === 0) {
      areas.push('rich_snippets');
    }
    
    if (schemaAnalysis.score < 70) {
      areas.push('schema_completeness');
    }
    
    return areas;
  }

  _generateStructuredDataRecommendations(schemaAnalysis, richSnippetsAnalysis) {
    const recommendations = [];
    
    if (schemaAnalysis.uniqueTypes.length === 0) {
      recommendations.push('Add basic Schema.org structured data (Organization, WebPage)');
    }
    
    if (richSnippetsAnalysis.opportunities.length > 0) {
      recommendations.push('Implement rich snippet schemas for better search visibility');
    }
    
    if (!schemaAnalysis.analysis.hasBasicSchemas) {
      recommendations.push('Start with essential schemas: Organization and WebSite');
    }
    
    return recommendations;
  }

  _calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  _getOptimizationLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'critical';
  }

  _generateCacheKey(document) {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]').length;
    const microdataElements = document.querySelectorAll('[itemscope]').length;
    const rdfaElements = document.querySelectorAll('[typeof], [property]').length;
    return btoa(`${jsonLdScripts}_${microdataElements}_${rdfaElements}`).slice(0, 20);
  }
}

export default StructuredDataDetector;
