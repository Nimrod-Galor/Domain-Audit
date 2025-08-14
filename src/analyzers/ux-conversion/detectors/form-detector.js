/**
 * ============================================================================
 * FORM DETECTOR - UX CONVERSION ANALYSIS
 * ============================================================================
 * 
 * Detects and analyzes forms for conversion optimization. Evaluates form
 * design, field types, validation, user experience, and conversion potential.
 * 
 * @version 2.0.0
 * @author Development Team
 * @phase Advanced UX & Conversion Analysis
 */

import { FORM_FIELD_PATTERNS, UX_STANDARDS } from '../config/ux-standards.js';
import { UXAnalysisValidator } from '../core/contracts.js';

/**
 * Form Detection and Analysis
 */
export class FormDetector {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 5000,
      analyzeHiddenForms: config.analyzeHiddenForms || false,
      testValidation: config.testValidation !== false,
      checkAccessibility: config.checkAccessibility !== false,
      skipSystemForms: config.skipSystemForms !== false,
      ...config
    };
    
    this.standards = UX_STANDARDS.forms;
    this.results = this._initializeResults();
  }

  /**
   * Main detection and analysis method
   * @param {Object} page - Playwright page object
   * @returns {Promise<Object>} Form analysis results
   */
  async analyze(page) {
    try {
      // Detect all forms
      await this._detectForms(page);
      
      // Analyze each form
      for (const form of this.results.elements) {
        await this._analyzeForm(page, form);
      }
      
      // Classify forms by purpose
      this._classifyForms();
      
      // Calculate scores and generate recommendations
      this._calculateScores();
      this._generateRecommendations();
      
      return this.results;
      
    } catch (error) {
      this.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return this.results;
    }
  }

  /**
   * Initialize results structure
   * @private
   */
  _initializeResults() {
    return {
      detected: false,
      elements: [],
      
      // Form categories
      categories: {
        contact: [],
        lead: [],
        newsletter: [],
        search: [],
        authentication: [],
        ecommerce: [],
        other: []
      },
      
      // Analysis summary
      analysis: {
        totalForms: 0,
        averageFieldCount: 0,
        conversionOptimized: 0,
        mobileOptimized: 0,
        accessibilityCompliant: 0,
        hasValidation: 0
      },
      
      // Conversion insights
      conversion: {
        potentialLeadForms: 0,
        fieldReduction: [],
        improvementOpportunities: [],
        industryBenchmarks: {}
      },
      
      scores: {
        design: 0,
        usability: 0,
        conversion: 0,
        accessibility: 0,
        overall: 0
      },
      
      recommendations: [],
      errors: [],
      warnings: []
    };
  }

  /**
   * Detect all forms on the page
   * @private
   */
  async _detectForms(page) {
    try {
      const forms = await page.$$('form');
      
      for (const form of forms) {
        const formData = await this._analyzeFormElement(page, form);
        
        if (this._isValidForm(formData)) {
          this.results.elements.push(formData);
        }
      }

      this.results.detected = this.results.elements.length > 0;
      this.results.analysis.totalForms = this.results.elements.length;
      
    } catch (error) {
      this.results.errors.push({
        message: `Form detection failed: ${error.message}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Analyze individual form element
   * @private
   */
  async _analyzeFormElement(page, formElement) {
    try {
      const boundingBox = await formElement.boundingBox();
      const isVisible = await formElement.isVisible();
      
      // Get form attributes and properties
      const formData = await page.evaluate(form => {
        return {
          action: form.action || '',
          method: form.method || 'get',
          name: form.name || '',
          id: form.id || '',
          className: form.className || '',
          noValidate: form.noValidate,
          autocomplete: form.autocomplete,
          target: form.target || ''
        };
      }, formElement);

      // Analyze form fields
      const fields = await this._analyzeFormFields(page, formElement);
      
      // Get form context
      const context = await this._getFormContext(page, formElement);
      
      // Calculate form metrics
      const metrics = this._calculateFormMetrics(fields);
      
      return {
        element: formElement,
        boundingBox,
        isVisible,
        attributes: formData,
        fields,
        context,
        metrics,
        purpose: 'unknown', // Will be determined later
        conversionScore: 0,
        usabilityScore: 0,
        accessibilityScore: 0
      };

    } catch (error) {
      this.results.warnings.push(`Failed to analyze form: ${error.message}`);
      return null;
    }
  }

  /**
   * Analyze form fields
   * @private
   */
  async _analyzeFormFields(page, formElement) {
    try {
      const fieldElements = await formElement.$$('input, select, textarea');
      const fields = [];

      for (const fieldElement of fieldElements) {
        const fieldData = await this._analyzeField(page, fieldElement);
        if (fieldData) {
          fields.push(fieldData);
        }
      }

      return fields;
    } catch (error) {
      this.results.warnings.push(`Field analysis failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze individual form field
   * @private
   */
  async _analyzeField(page, fieldElement) {
    try {
      const fieldData = await page.evaluate(field => {
        return {
          tagName: field.tagName.toLowerCase(),
          type: field.type || '',
          name: field.name || '',
          id: field.id || '',
          className: field.className || '',
          placeholder: field.placeholder || '',
          required: field.required,
          disabled: field.disabled,
          readonly: field.readOnly,
          value: field.value || '',
          autocomplete: field.autocomplete || '',
          'aria-label': field.getAttribute('aria-label') || '',
          'aria-required': field.getAttribute('aria-required') || '',
          'aria-invalid': field.getAttribute('aria-invalid') || '',
          maxLength: field.maxLength || -1,
          minLength: field.minLength || -1,
          pattern: field.pattern || '',
          min: field.min || '',
          max: field.max || '',
          step: field.step || ''
        };
      }, fieldElement);

      // Get associated label
      const label = await this._getFieldLabel(page, fieldElement, fieldData);
      
      // Get field validation
      const validation = await this._getFieldValidation(page, fieldElement);
      
      // Calculate field score
      const score = this._calculateFieldScore(fieldData, label, validation);
      
      // Classify field type
      const classification = this._classifyField(fieldData, label);

      return {
        element: fieldElement,
        attributes: fieldData,
        label,
        validation,
        classification,
        score,
        boundingBox: await fieldElement.boundingBox(),
        isVisible: await fieldElement.isVisible()
      };

    } catch (error) {
      this.results.warnings.push(`Field analysis failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get field label information
   * @private
   */
  async _getFieldLabel(page, fieldElement, fieldData) {
    try {
      return await page.evaluate((field, data) => {
        let labelText = '';
        let labelElement = null;

        // Method 1: Direct label element
        if (data.id) {
          labelElement = document.querySelector(`label[for="${data.id}"]`);
          if (labelElement) {
            labelText = labelElement.textContent.trim();
          }
        }

        // Method 2: Wrapped in label
        if (!labelText) {
          labelElement = field.closest('label');
          if (labelElement) {
            labelText = labelElement.textContent.trim();
          }
        }

        // Method 3: aria-label
        if (!labelText && data['aria-label']) {
          labelText = data['aria-label'];
        }

        // Method 4: placeholder as fallback
        if (!labelText && data.placeholder) {
          labelText = data.placeholder;
        }

        // Method 5: nearby text
        if (!labelText) {
          const parent = field.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children);
            const fieldIndex = siblings.indexOf(field);
            
            // Check previous sibling
            if (fieldIndex > 0) {
              const prevSibling = siblings[fieldIndex - 1];
              if (prevSibling.tagName.toLowerCase() === 'label' || 
                  prevSibling.textContent.trim().length < 50) {
                labelText = prevSibling.textContent.trim();
              }
            }
          }
        }

        return {
          text: labelText,
          hasLabel: Boolean(labelElement),
          method: labelElement ? 'label' : (data['aria-label'] ? 'aria-label' : 'inferred')
        };
      }, fieldElement, fieldData);
    } catch {
      return { text: '', hasLabel: false, method: 'none' };
    }
  }

  /**
   * Get field validation information
   * @private
   */
  async _getFieldValidation(page, fieldElement) {
    try {
      return await page.evaluate(field => {
        const validation = {
          hasValidation: false,
          validationTypes: [],
          hasClientSideValidation: false,
          hasServerSideValidation: false,
          errorMessage: '',
          validationOnBlur: false,
          validationOnSubmit: false
        };

        // Check HTML5 validation
        if (field.required) {
          validation.hasValidation = true;
          validation.validationTypes.push('required');
        }

        if (field.pattern) {
          validation.hasValidation = true;
          validation.validationTypes.push('pattern');
        }

        if (field.type === 'email') {
          validation.hasValidation = true;
          validation.validationTypes.push('email');
        }

        if (field.minLength > 0 || field.maxLength > 0) {
          validation.hasValidation = true;
          validation.validationTypes.push('length');
        }

        if (field.min || field.max) {
          validation.hasValidation = true;
          validation.validationTypes.push('range');
        }

        // Check for validation classes or attributes
        const className = field.className.toLowerCase();
        const hasValidationClass = className.includes('valid') || 
                                 className.includes('invalid') || 
                                 className.includes('error');

        if (hasValidationClass) {
          validation.hasClientSideValidation = true;
        }

        // Check for error message containers
        const errorContainer = field.parentElement.querySelector(
          '.error, .invalid, .validation-error, [data-error]'
        );
        
        if (errorContainer) {
          validation.errorMessage = errorContainer.textContent.trim();
        }

        return validation;
      }, fieldElement);
    } catch {
      return {
        hasValidation: false,
        validationTypes: [],
        hasClientSideValidation: false,
        hasServerSideValidation: false,
        errorMessage: '',
        validationOnBlur: false,
        validationOnSubmit: false
      };
    }
  }

  /**
   * Calculate field score
   * @private
   */
  _calculateFieldScore(fieldData, label, validation) {
    let score = 50; // Base score

    // Label scoring
    if (label.hasLabel) score += 20;
    else if (label.text) score += 10;

    // Type appropriateness
    if (this._isAppropriateFieldType(fieldData)) score += 15;

    // Validation scoring
    if (validation.hasValidation) score += 10;
    if (validation.validationTypes.length > 1) score += 5;

    // Accessibility scoring
    if (fieldData['aria-label'] || fieldData['aria-required']) score += 5;

    // Required field handling
    if (fieldData.required && !label.text.includes('*')) score -= 5;

    // Placeholder usage
    if (fieldData.placeholder && fieldData.placeholder.length > 0) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Check if field type is appropriate
   * @private
   */
  _isAppropriateFieldType(fieldData) {
    const name = fieldData.name.toLowerCase();
    const placeholder = fieldData.placeholder.toLowerCase();
    const type = fieldData.type.toLowerCase();

    // Email field checks
    if ((name.includes('email') || placeholder.includes('email')) && type === 'email') {
      return true;
    }

    // Phone field checks
    if ((name.includes('phone') || name.includes('tel') || placeholder.includes('phone')) && 
        (type === 'tel' || type === 'phone')) {
      return true;
    }

    // Password field checks
    if (name.includes('password') && type === 'password') {
      return true;
    }

    // Number field checks
    if ((name.includes('number') || name.includes('age') || name.includes('quantity')) && 
        type === 'number') {
      return true;
    }

    // Default for text fields
    if (type === 'text' || type === '') {
      return true;
    }

    return false;
  }

  /**
   * Classify field by purpose
   * @private
   */
  _classifyField(fieldData, label) {
    const text = (fieldData.name + ' ' + fieldData.placeholder + ' ' + label.text).toLowerCase();
    
    // Contact information
    if (text.includes('email') || text.includes('mail')) return 'email';
    if (text.includes('phone') || text.includes('tel')) return 'phone';
    if (text.includes('name') && !text.includes('company')) return 'name';
    if (text.includes('first') && text.includes('name')) return 'first_name';
    if (text.includes('last') && text.includes('name')) return 'last_name';
    
    // Business information
    if (text.includes('company') || text.includes('organization')) return 'company';
    if (text.includes('title') || text.includes('position')) return 'job_title';
    
    // Authentication
    if (text.includes('password')) return 'password';
    if (text.includes('username') || text.includes('user')) return 'username';
    
    // Messages
    if (text.includes('message') || text.includes('comment')) return 'message';
    if (text.includes('subject')) return 'subject';
    
    // Location
    if (text.includes('address')) return 'address';
    if (text.includes('city')) return 'city';
    if (text.includes('state') || text.includes('province')) return 'state';
    if (text.includes('zip') || text.includes('postal')) return 'postal_code';
    if (text.includes('country')) return 'country';
    
    // Ecommerce
    if (text.includes('quantity')) return 'quantity';
    if (text.includes('price') || text.includes('amount')) return 'price';
    if (text.includes('card') || text.includes('credit')) return 'credit_card';
    
    // Other
    if (fieldData.type === 'hidden') return 'hidden';
    if (fieldData.type === 'submit') return 'submit';
    if (fieldData.type === 'checkbox') return 'checkbox';
    if (fieldData.type === 'radio') return 'radio';
    
    return 'other';
  }

  /**
   * Get form context information
   * @private
   */
  async _getFormContext(page, formElement) {
    try {
      return await page.evaluate(form => {
        const context = {
          pageTitle: document.title,
          nearbyHeadings: [],
          containerClasses: [],
          submitButtons: [],
          isModal: false,
          isPopup: false
        };

        // Get nearby headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const formRect = form.getBoundingClientRect();
        
        headings.forEach(heading => {
          const headingRect = heading.getBoundingClientRect();
          const distance = Math.abs(headingRect.bottom - formRect.top);
          
          if (distance < 200) { // Within 200px
            context.nearbyHeadings.push({
              text: heading.textContent.trim(),
              tag: heading.tagName.toLowerCase(),
              distance
            });
          }
        });

        // Sort headings by distance
        context.nearbyHeadings.sort((a, b) => a.distance - b.distance);

        // Get container information
        let parent = form.parentElement;
        while (parent && parent !== document.body) {
          if (parent.className) {
            context.containerClasses.push(parent.className);
          }
          
          // Check for modal/popup indicators
          const className = parent.className.toLowerCase();
          if (className.includes('modal') || className.includes('popup') || 
              className.includes('overlay') || className.includes('dialog')) {
            context.isModal = true;
          }
          
          parent = parent.parentElement;
        }

        // Get submit buttons
        const submitButtons = form.querySelectorAll(
          'input[type="submit"], button[type="submit"], button:not([type])'
        );
        
        submitButtons.forEach(button => {
          context.submitButtons.push({
            text: button.textContent.trim() || button.value || 'Submit',
            type: button.type || 'button',
            className: button.className
          });
        });

        return context;
      }, formElement);
    } catch {
      return {
        pageTitle: '',
        nearbyHeadings: [],
        containerClasses: [],
        submitButtons: [],
        isModal: false,
        isPopup: false
      };
    }
  }

  /**
   * Calculate form metrics
   * @private
   */
  _calculateFormMetrics(fields) {
    const metrics = {
      totalFields: fields.length,
      requiredFields: 0,
      optionalFields: 0,
      fieldTypes: {},
      hasEmail: false,
      hasPhone: false,
      hasMessage: false,
      averageFieldScore: 0,
      conversionFriendly: false
    };

    let totalScore = 0;

    fields.forEach(field => {
      if (field.attributes.required) {
        metrics.requiredFields++;
      } else {
        metrics.optionalFields++;
      }

      const type = field.classification;
      metrics.fieldTypes[type] = (metrics.fieldTypes[type] || 0) + 1;

      if (type === 'email') metrics.hasEmail = true;
      if (type === 'phone') metrics.hasPhone = true;
      if (type === 'message') metrics.hasMessage = true;

      totalScore += field.score;
    });

    if (fields.length > 0) {
      metrics.averageFieldScore = totalScore / fields.length;
    }

    // Check conversion friendliness
    metrics.conversionFriendly = this._isConversionFriendly(metrics);

    return metrics;
  }

  /**
   * Check if form is conversion-friendly
   * @private
   */
  _isConversionFriendly(metrics) {
    // Too many fields reduces conversion
    if (metrics.totalFields > this.standards.optimalFieldCount.max) {
      return false;
    }

    // Too many required fields
    if (metrics.requiredFields > this.standards.requiredFieldThreshold) {
      return false;
    }

    // Good field score average
    if (metrics.averageFieldScore < 70) {
      return false;
    }

    return true;
  }

  /**
   * Check if form is valid for analysis
   * @private
   */
  _isValidForm(formData) {
    if (!formData || !formData.isVisible) {
      return false;
    }

    // Skip system forms if configured
    if (this.config.skipSystemForms) {
      const action = formData.attributes.action.toLowerCase();
      if (action.includes('login') || action.includes('search') || 
          action.includes('admin') || action.includes('wp-')) {
        return false;
      }
    }

    // Must have at least one meaningful field
    const meaningfulFields = formData.fields.filter(field => 
      field.attributes.type !== 'hidden' && 
      field.attributes.type !== 'submit' &&
      field.classification !== 'hidden'
    );

    return meaningfulFields.length > 0;
  }

  /**
   * Classify forms by purpose
   * @private
   */
  _classifyForms() {
    this.results.elements.forEach(form => {
      form.purpose = this._determineFormPurpose(form);
      this.results.categories[form.purpose].push(form);
    });
  }

  /**
   * Determine form purpose
   * @private
   */
  _determineFormPurpose(form) {
    const context = form.context;
    const fields = form.fields;
    const attributes = form.attributes;

    // Check headings and context
    const contextText = (
      context.pageTitle + ' ' +
      context.nearbyHeadings.map(h => h.text).join(' ') + ' ' +
      context.submitButtons.map(b => b.text).join(' ') + ' ' +
      attributes.action + ' ' +
      attributes.className + ' ' +
      attributes.id
    ).toLowerCase();

    // Newsletter signup
    if (contextText.includes('newsletter') || contextText.includes('subscribe') ||
        contextText.includes('signup') || contextText.includes('sign up')) {
      if (fields.length <= 2 && form.metrics.hasEmail) {
        return 'newsletter';
      }
    }

    // Contact form
    if (contextText.includes('contact') || contextText.includes('get in touch') ||
        contextText.includes('reach out') || form.metrics.hasMessage) {
      return 'contact';
    }

    // Lead generation
    if (contextText.includes('quote') || contextText.includes('demo') ||
        contextText.includes('consultation') || contextText.includes('download') ||
        contextText.includes('whitepaper') || contextText.includes('ebook')) {
      return 'lead';
    }

    // Authentication
    if (contextText.includes('login') || contextText.includes('sign in') ||
        contextText.includes('register') || contextText.includes('signup')) {
      return 'authentication';
    }

    // Search
    if (contextText.includes('search') || fields.some(f => f.classification === 'search')) {
      return 'search';
    }

    // Ecommerce
    if (fields.some(f => ['quantity', 'price', 'credit_card'].includes(f.classification)) ||
        contextText.includes('checkout') || contextText.includes('order') ||
        contextText.includes('cart') || contextText.includes('purchase')) {
      return 'ecommerce';
    }

    return 'other';
  }

  /**
   * Calculate scores
   * @private
   */
  _calculateScores() {
    if (this.results.elements.length === 0) {
      this.results.scores = {
        design: 0,
        usability: 0,
        conversion: 0,
        accessibility: 0,
        overall: 0
      };
      return;
    }

    this._calculateDesignScore();
    this._calculateUsabilityScore();
    this._calculateConversionScore();
    this._calculateAccessibilityScore();
    this._calculateOverallScore();
    this._updateAnalysisSummary();
  }

  /**
   * Calculate design score
   * @private
   */
  _calculateDesignScore() {
    let totalScore = 0;
    let count = 0;

    this.results.elements.forEach(form => {
      let formScore = 60; // Base score

      // Field organization
      if (form.metrics.totalFields <= this.standards.optimalFieldCount.max) {
        formScore += 20;
      } else if (form.metrics.totalFields <= this.standards.optimalFieldCount.max + 3) {
        formScore += 10;
      }

      // Required field ratio
      const requiredRatio = form.metrics.requiredFields / form.metrics.totalFields;
      if (requiredRatio <= 0.6) formScore += 10;

      // Submit button quality
      const hasGoodSubmitButton = form.context.submitButtons.some(btn => 
        btn.text.length > 3 && !btn.text.toLowerCase().includes('submit')
      );
      if (hasGoodSubmitButton) formScore += 10;

      totalScore += Math.min(formScore, 100);
      count++;
    });

    this.results.scores.design = count > 0 ? Math.round(totalScore / count) : 0;
  }

  /**
   * Calculate usability score
   * @private
   */
  _calculateUsabilityScore() {
    let totalScore = 0;
    let count = 0;

    this.results.elements.forEach(form => {
      let formScore = form.metrics.averageFieldScore;

      // Label coverage
      const labeledFields = form.fields.filter(f => f.label.hasLabel).length;
      const labelCoverage = labeledFields / form.fields.length;
      
      if (labelCoverage >= this.standards.minimumLabelCoverage) {
        formScore += 10;
      }

      // Validation presence
      const validatedFields = form.fields.filter(f => f.validation.hasValidation).length;
      if (validatedFields > 0) formScore += 10;

      // Mobile optimization
      const mobileOptimized = form.fields.every(f => {
        const box = f.boundingBox;
        return box && box.height >= this.standards.mobileTargetSize.height;
      });
      if (mobileOptimized) formScore += 15;

      totalScore += Math.min(formScore, 100);
      count++;
    });

    this.results.scores.usability = count > 0 ? Math.round(totalScore / count) : 0;
  }

  /**
   * Calculate conversion score
   * @private
   */
  _calculateConversionScore() {
    let totalScore = 0;
    let count = 0;

    this.results.elements.forEach(form => {
      let formScore = 50; // Base score

      // Conversion-friendly metrics
      if (form.metrics.conversionFriendly) formScore += 30;

      // Purpose-specific scoring
      if (['contact', 'lead', 'newsletter'].includes(form.purpose)) {
        formScore += 10;
      }

      // Field optimization
      if (form.metrics.totalFields <= this.standards.optimalFieldCount.target) {
        formScore += 10;
      }

      totalScore += Math.min(formScore, 100);
      count++;
    });

    this.results.scores.conversion = count > 0 ? Math.round(totalScore / count) : 0;
  }

  /**
   * Calculate accessibility score
   * @private
   */
  _calculateAccessibilityScore() {
    let totalScore = 0;
    let count = 0;

    this.results.elements.forEach(form => {
      let formScore = 40; // Base score

      // Label accessibility
      const properLabels = form.fields.filter(f => 
        f.label.hasLabel || f.attributes['aria-label']
      ).length;
      const labelScore = (properLabels / form.fields.length) * 30;
      formScore += labelScore;

      // Required field indication
      const requiredFields = form.fields.filter(f => f.attributes.required);
      const properlyIndicatedRequired = requiredFields.filter(f => 
        f.label.text.includes('*') || f.attributes['aria-required']
      ).length;
      
      if (requiredFields.length > 0) {
        const requiredScore = (properlyIndicatedRequired / requiredFields.length) * 20;
        formScore += requiredScore;
      } else {
        formScore += 20; // No required fields is also good
      }

      // Keyboard navigation
      const keyboardAccessible = form.fields.every(f => 
        !f.attributes.disabled && f.attributes.tagName !== 'hidden'
      );
      if (keyboardAccessible) formScore += 10;

      totalScore += Math.min(formScore, 100);
      count++;
    });

    this.results.scores.accessibility = count > 0 ? Math.round(totalScore / count) : 0;
  }

  /**
   * Calculate overall score
   * @private
   */
  _calculateOverallScore() {
    const weights = {
      design: 0.2,
      usability: 0.3,
      conversion: 0.3,
      accessibility: 0.2
    };

    this.results.scores.overall = Math.round(
      this.results.scores.design * weights.design +
      this.results.scores.usability * weights.usability +
      this.results.scores.conversion * weights.conversion +
      this.results.scores.accessibility * weights.accessibility
    );
  }

  /**
   * Update analysis summary
   * @private
   */
  _updateAnalysisSummary() {
    const analysis = this.results.analysis;
    
    analysis.totalForms = this.results.elements.length;
    
    if (analysis.totalForms > 0) {
      const totalFields = this.results.elements.reduce((sum, form) => 
        sum + form.metrics.totalFields, 0);
      analysis.averageFieldCount = Math.round(totalFields / analysis.totalForms);
      
      analysis.conversionOptimized = this.results.elements.filter(form => 
        form.metrics.conversionFriendly).length;
      
      analysis.mobileOptimized = this.results.elements.filter(form => {
        return form.fields.every(f => {
          const box = f.boundingBox;
          return box && box.height >= this.standards.mobileTargetSize.height;
        });
      }).length;
      
      analysis.accessibilityCompliant = this.results.elements.filter(form => {
        const labeledFields = form.fields.filter(f => 
          f.label.hasLabel || f.attributes['aria-label']).length;
        return labeledFields / form.fields.length >= this.standards.minimumLabelCoverage;
      }).length;
      
      analysis.hasValidation = this.results.elements.filter(form => {
        return form.fields.some(f => f.validation.hasValidation);
      }).length;
    }
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations() {
    if (this.results.elements.length === 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Missing Functionality',
        title: 'Consider Adding Forms',
        description: 'No forms detected - consider adding lead generation or contact forms',
        details: 'Forms are essential for capturing leads and enabling user interaction. Consider adding at least a contact form or newsletter signup.',
        effort: 'medium'
      });
      return;
    }

    // Score-based recommendations
    if (this.results.scores.conversion < 70) {
      this._addConversionRecommendations();
    }

    if (this.results.scores.usability < 70) {
      this._addUsabilityRecommendations();
    }

    if (this.results.scores.accessibility < 70) {
      this._addAccessibilityRecommendations();
    }

    if (this.results.scores.design < 70) {
      this._addDesignRecommendations();
    }

    // Form-specific recommendations
    this._addFormSpecificRecommendations();
  }

  /**
   * Add conversion recommendations
   * @private
   */
  _addConversionRecommendations() {
    const longForms = this.results.elements.filter(form => 
      form.metrics.totalFields > this.standards.optimalFieldCount.max);

    if (longForms.length > 0) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'high',
        category: 'Form Conversion',
        title: 'Reduce Form Length',
        description: `${longForms.length} form(s) have too many fields, reducing conversion rates`,
        details: `Forms with more than ${this.standards.optimalFieldCount.max} fields significantly reduce conversion. Consider removing non-essential fields or implementing multi-step forms.`,
        effort: 'medium'
      });
    }

    const highRequiredForms = this.results.elements.filter(form => 
      form.metrics.requiredFields > this.standards.requiredFieldThreshold);

    if (highRequiredForms.length > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'Form Conversion',
        title: 'Reduce Required Fields',
        description: `${highRequiredForms.length} form(s) have too many required fields`,
        details: `Limit required fields to essential information only. Optional fields can be collected later in the customer journey.`,
        effort: 'low'
      });
    }
  }

  /**
   * Add usability recommendations
   * @private
   */
  _addUsabilityRecommendations() {
    const poorLabelCoverage = this.results.elements.filter(form => {
      const labeledFields = form.fields.filter(f => f.label.hasLabel).length;
      return labeledFields / form.fields.length < this.standards.minimumLabelCoverage;
    });

    if (poorLabelCoverage.length > 0) {
      this.results.recommendations.push({
        priority: 'high',
        impact: 'medium',
        category: 'Form Usability',
        title: 'Improve Field Labels',
        description: `${poorLabelCoverage.length} form(s) have insufficient field labeling`,
        details: `All form fields should have clear, descriptive labels. This improves usability and accessibility.`,
        effort: 'low'
      });
    }

    const noValidation = this.results.elements.filter(form => 
      !form.fields.some(f => f.validation.hasValidation));

    if (noValidation.length > 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'medium',
        category: 'Form Usability',
        title: 'Add Form Validation',
        description: `${noValidation.length} form(s) lack proper validation`,
        details: 'Implement client-side validation to provide immediate feedback and reduce form submission errors.',
        effort: 'medium'
      });
    }
  }

  /**
   * Add accessibility recommendations
   * @private
   */
  _addAccessibilityRecommendations() {
    this.results.recommendations.push({
      priority: 'medium',
      impact: 'medium',
      category: 'Form Accessibility',
      title: 'Improve Form Accessibility',
      description: 'Forms need better accessibility compliance',
      details: 'Ensure all form fields have proper labels, required fields are indicated, and forms are keyboard accessible.',
      effort: 'medium'
    });
  }

  /**
   * Add design recommendations
   * @private
   */
  _addDesignRecommendations() {
    this.results.recommendations.push({
      priority: 'low',
      impact: 'medium',
      category: 'Form Design',
      title: 'Improve Form Design',
      description: 'Forms could benefit from better visual design and organization',
      details: 'Consider improving form layout, field grouping, and submit button design for better user experience.',
      effort: 'medium'
    });
  }

  /**
   * Add form-specific recommendations
   * @private
   */
  _addFormSpecificRecommendations() {
    // Check for missing newsletter signup
    if (this.results.categories.newsletter.length === 0) {
      this.results.recommendations.push({
        priority: 'low',
        impact: 'medium',
        category: 'Missing Opportunity',
        title: 'Add Newsletter Signup',
        description: 'No newsletter signup form detected',
        details: 'Newsletter signups are a low-friction way to capture leads and maintain engagement with visitors.',
        effort: 'low'
      });
    }

    // Check for missing contact form
    if (this.results.categories.contact.length === 0 && 
        this.results.categories.lead.length === 0) {
      this.results.recommendations.push({
        priority: 'medium',
        impact: 'high',
        category: 'Missing Opportunity',
        title: 'Add Contact Form',
        description: 'No contact or lead generation form detected',
        details: 'Contact forms are essential for lead generation and customer communication. Consider adding a prominent contact form.',
        effort: 'medium'
      });
    }
  }
}

export default FormDetector;
