/**
 * UX Validation Helpers
 * 
 * Utility functions for validating UX analysis inputs, outputs, and data integrity.
 * Provides comprehensive validation for all UX analyzer components.
 */

export class UXValidationHelpers {
  constructor() {
    this.validationRules = this._initializeValidationRules();
    this.errorMessages = this._initializeErrorMessages();
  }

  /**
   * Initialize validation rules for different data types
   */
  _initializeValidationRules() {
    return {
      // Score validation rules
      score: {
        min: 0,
        max: 100,
        type: 'number',
        precision: 2
      },

      // Confidence validation rules
      confidence: {
        min: 0,
        max: 1,
        type: 'number',
        precision: 3
      },

      // URL validation pattern
      url: {
        pattern: /^https?:\/\/.+/,
        maxLength: 2048
      },

      // Required detection fields
      detection: {
        requiredFields: ['elements', 'analysis', 'metadata'],
        elementFields: ['count', 'types', 'attributes'],
        analysisFields: ['score', 'findings', 'recommendations']
      },

      // Required heuristic fields
      heuristic: {
        requiredFields: ['score', 'metrics', 'findings', 'recommendations'],
        scoreFields: ['overall', 'subcategories'],
        metricFields: ['name', 'value', 'unit', 'benchmark']
      },

      // Weight validation
      weights: {
        sum: 1.0,
        tolerance: 0.01,
        min: 0,
        max: 1
      }
    };
  }

  /**
   * Initialize error messages
   */
  _initializeErrorMessages() {
    return {
      invalidScore: 'Score must be a number between 0 and 100',
      invalidConfidence: 'Confidence must be a number between 0 and 1',
      invalidUrl: 'URL must be a valid HTTP/HTTPS URL',
      missingRequiredField: 'Required field is missing',
      invalidWeightSum: 'Weights must sum to approximately 1.0',
      invalidDataType: 'Invalid data type for field',
      exceedsMaxLength: 'Value exceeds maximum allowed length',
      belowMinValue: 'Value is below minimum threshold',
      aboveMaxValue: 'Value exceeds maximum threshold'
    };
  }

  /**
   * Validate a score value
   * @param {number} score - Score to validate
   * @param {string} context - Context for error messages
   * @returns {Object} Validation result
   */
  validateScore(score, context = 'score') {
    const rules = this.validationRules.score;
    
    if (typeof score !== 'number') {
      return this._createValidationError('invalidDataType', context, { expected: 'number', received: typeof score });
    }

    if (isNaN(score)) {
      return this._createValidationError('invalidScore', context, { value: score });
    }

    if (score < rules.min) {
      return this._createValidationError('belowMinValue', context, { value: score, min: rules.min });
    }

    if (score > rules.max) {
      return this._createValidationError('aboveMaxValue', context, { value: score, max: rules.max });
    }

    return this._createValidationSuccess(score);
  }

  /**
   * Validate confidence value
   * @param {number} confidence - Confidence to validate
   * @param {string} context - Context for error messages
   * @returns {Object} Validation result
   */
  validateConfidence(confidence, context = 'confidence') {
    const rules = this.validationRules.confidence;
    
    if (typeof confidence !== 'number') {
      return this._createValidationError('invalidDataType', context, { expected: 'number', received: typeof confidence });
    }

    if (isNaN(confidence)) {
      return this._createValidationError('invalidConfidence', context, { value: confidence });
    }

    if (confidence < rules.min || confidence > rules.max) {
      return this._createValidationError('invalidConfidence', context, { value: confidence, range: `${rules.min}-${rules.max}` });
    }

    return this._createValidationSuccess(confidence);
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @param {string} context - Context for error messages
   * @returns {Object} Validation result
   */
  validateUrl(url, context = 'url') {
    const rules = this.validationRules.url;
    
    if (typeof url !== 'string') {
      return this._createValidationError('invalidDataType', context, { expected: 'string', received: typeof url });
    }

    if (url.length > rules.maxLength) {
      return this._createValidationError('exceedsMaxLength', context, { length: url.length, max: rules.maxLength });
    }

    if (!rules.pattern.test(url)) {
      return this._createValidationError('invalidUrl', context, { value: url });
    }

    return this._createValidationSuccess(url);
  }

  /**
   * Validate detection results structure
   * @param {Object} detection - Detection results to validate
   * @param {string} detectorName - Name of the detector
   * @returns {Object} Validation result
   */
  validateDetection(detection, detectorName = 'unknown') {
    const rules = this.validationRules.detection;
    const context = `${detectorName} detection`;

    // Check if detection is an object
    if (typeof detection !== 'object' || detection === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof detection });
    }

    // Validate required top-level fields
    const missingFields = rules.requiredFields.filter(field => !(field in detection));
    if (missingFields.length > 0) {
      return this._createValidationError('missingRequiredField', context, { fields: missingFields });
    }

    // Validate elements structure
    const elementsValidation = this._validateDetectionElements(detection.elements, `${context}.elements`);
    if (!elementsValidation.valid) {
      return elementsValidation;
    }

    // Validate analysis structure
    const analysisValidation = this._validateDetectionAnalysis(detection.analysis, `${context}.analysis`);
    if (!analysisValidation.valid) {
      return analysisValidation;
    }

    return this._createValidationSuccess(detection);
  }

  /**
   * Validate heuristic analysis results
   * @param {Object} heuristic - Heuristic results to validate
   * @param {string} heuristicName - Name of the heuristic
   * @returns {Object} Validation result
   */
  validateHeuristic(heuristic, heuristicName = 'unknown') {
    const rules = this.validationRules.heuristic;
    const context = `${heuristicName} heuristic`;

    if (typeof heuristic !== 'object' || heuristic === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof heuristic });
    }

    // Validate required fields
    const missingFields = rules.requiredFields.filter(field => !(field in heuristic));
    if (missingFields.length > 0) {
      return this._createValidationError('missingRequiredField', context, { fields: missingFields });
    }

    // Validate score
    const scoreValidation = this.validateScore(heuristic.score, `${context}.score`);
    if (!scoreValidation.valid) {
      return scoreValidation;
    }

    // Validate metrics structure
    if (heuristic.metrics && Array.isArray(heuristic.metrics)) {
      for (let i = 0; i < heuristic.metrics.length; i++) {
        const metricValidation = this._validateMetric(heuristic.metrics[i], `${context}.metrics[${i}]`);
        if (!metricValidation.valid) {
          return metricValidation;
        }
      }
    }

    return this._createValidationSuccess(heuristic);
  }

  /**
   * Validate weight configuration
   * @param {Object} weights - Weight configuration to validate
   * @param {string} category - Weight category name
   * @returns {Object} Validation result
   */
  validateWeights(weights, category = 'unknown') {
    const rules = this.validationRules.weights;
    const context = `${category} weights`;

    if (typeof weights !== 'object' || weights === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof weights });
    }

    const weightValues = Object.values(weights);
    
    // Validate individual weight values
    for (const [key, weight] of Object.entries(weights)) {
      if (typeof weight !== 'number' || isNaN(weight)) {
        return this._createValidationError('invalidDataType', `${context}.${key}`, { expected: 'number', received: typeof weight });
      }

      if (weight < rules.min || weight > rules.max) {
        return this._createValidationError('invalidDataType', `${context}.${key}`, { value: weight, range: `${rules.min}-${rules.max}` });
      }
    }

    // Validate sum
    const sum = weightValues.reduce((acc, weight) => acc + weight, 0);
    if (Math.abs(sum - rules.sum) > rules.tolerance) {
      return this._createValidationError('invalidWeightSum', context, { sum, expected: rules.sum, tolerance: rules.tolerance });
    }

    return this._createValidationSuccess(weights);
  }

  /**
   * Validate complete UX analysis results
   * @param {Object} results - Complete UX analysis results
   * @returns {Object} Validation result
   */
  validateUXResults(results) {
    const context = 'UX analysis results';

    if (typeof results !== 'object' || results === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof results });
    }

    const validations = [];

    // Validate overall score
    if ('overallScore' in results) {
      validations.push(this.validateScore(results.overallScore, 'overallScore'));
    }

    // Validate overall confidence
    if ('confidence' in results) {
      validations.push(this.validateConfidence(results.confidence, 'confidence'));
    }

    // Validate URL
    if ('url' in results) {
      validations.push(this.validateUrl(results.url, 'url'));
    }

    // Validate heuristic results
    const heuristicAreas = ['usability', 'conversionPath', 'cognitiveLoad', 'trust'];
    heuristicAreas.forEach(area => {
      if (results[area]) {
        validations.push(this.validateHeuristic(results[area], area));
      }
    });

    // Check for any validation failures
    const failures = validations.filter(v => !v.valid);
    if (failures.length > 0) {
      return {
        valid: false,
        errors: failures.map(f => f.error),
        context,
        timestamp: new Date().toISOString()
      };
    }

    return this._createValidationSuccess(results);
  }

  /**
   * Validate batch of analysis results
   * @param {Array} resultsBatch - Array of analysis results
   * @returns {Object} Batch validation result
   */
  validateBatch(resultsBatch) {
    if (!Array.isArray(resultsBatch)) {
      return this._createValidationError('invalidDataType', 'results batch', { expected: 'array', received: typeof resultsBatch });
    }

    const validations = resultsBatch.map((result, index) => ({
      index,
      validation: this.validateUXResults(result)
    }));

    const failures = validations.filter(v => !v.validation.valid);
    
    return {
      valid: failures.length === 0,
      totalItems: resultsBatch.length,
      validItems: resultsBatch.length - failures.length,
      invalidItems: failures.length,
      failures: failures.map(f => ({ index: f.index, errors: f.validation.errors })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sanitize input data for analysis
   * @param {*} data - Data to sanitize
   * @param {string} type - Expected data type
   * @returns {*} Sanitized data
   */
  sanitizeInput(data, type = 'auto') {
    if (type === 'auto') {
      type = this._detectDataType(data);
    }

    switch (type) {
      case 'score':
        return this._sanitizeScore(data);
      case 'confidence':
        return this._sanitizeConfidence(data);
      case 'url':
        return this._sanitizeUrl(data);
      case 'string':
        return this._sanitizeString(data);
      case 'number':
        return this._sanitizeNumber(data);
      default:
        return data;
    }
  }

  // Private helper methods

  /**
   * Validate detection elements structure
   */
  _validateDetectionElements(elements, context) {
    if (typeof elements !== 'object' || elements === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof elements });
    }

    // Check for count field
    if ('count' in elements && typeof elements.count !== 'number') {
      return this._createValidationError('invalidDataType', `${context}.count`, { expected: 'number', received: typeof elements.count });
    }

    return this._createValidationSuccess(elements);
  }

  /**
   * Validate detection analysis structure
   */
  _validateDetectionAnalysis(analysis, context) {
    if (typeof analysis !== 'object' || analysis === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof analysis });
    }

    return this._createValidationSuccess(analysis);
  }

  /**
   * Validate individual metric
   */
  _validateMetric(metric, context) {
    if (typeof metric !== 'object' || metric === null) {
      return this._createValidationError('invalidDataType', context, { expected: 'object', received: typeof metric });
    }

    if ('value' in metric && typeof metric.value !== 'number') {
      return this._createValidationError('invalidDataType', `${context}.value`, { expected: 'number', received: typeof metric.value });
    }

    return this._createValidationSuccess(metric);
  }

  /**
   * Create validation error result
   */
  _createValidationError(type, context, details = {}) {
    return {
      valid: false,
      error: {
        type,
        message: this.errorMessages[type] || 'Unknown validation error',
        context,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Create validation success result
   */
  _createValidationSuccess(data) {
    return {
      valid: true,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect data type automatically
   */
  _detectDataType(data) {
    if (typeof data === 'number') {
      if (data >= 0 && data <= 100) return 'score';
      if (data >= 0 && data <= 1) return 'confidence';
      return 'number';
    }
    if (typeof data === 'string' && data.startsWith('http')) return 'url';
    if (typeof data === 'string') return 'string';
    return 'unknown';
  }

  /**
   * Sanitization methods
   */
  _sanitizeScore(data) {
    const num = parseFloat(data);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
  }

  _sanitizeConfidence(data) {
    const num = parseFloat(data);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(1, num));
  }

  _sanitizeUrl(data) {
    if (typeof data !== 'string') return '';
    return data.trim().slice(0, 2048);
  }

  _sanitizeString(data) {
    if (typeof data !== 'string') return String(data || '');
    return data.trim();
  }

  _sanitizeNumber(data) {
    const num = parseFloat(data);
    return isNaN(num) ? 0 : num;
  }
}
