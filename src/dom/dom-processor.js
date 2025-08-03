/**
 * DOM Processing Module - Comprehensive DOM Parsing and Analysis
 * 
 * This module handles all DOM-related operations including:
 * - JSDOM configuration and setup
 * - DOM parsing and element extraction
 * - Link analysis and processing
 * - Element traversal and         accessibilityIssues.push({
          type: 'accessibility',
          issue: 'Link without accessible text',
          href: href,
          position: this._getElementPosition(link, document)
        });ng utilities
 * - DOM cleanup and memory management
 * 
 * Features:
 * - Performance-optimized JSDOM configurations
 * - Efficient element traversal and analysis
 * - Link categorization and validation
 * - Memory-conscious DOM processing
 * - Batch processing for large documents
 * - Integration with Performance Manager for caching
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import * as cheerio from 'cheerio';

/**
 * DOM Processing Manager Class
 * Handles all DOM parsing, analysis, and utility operations with Cheerio
 */
export class DOMProcessor {
  /**
   * Create a DOMProcessor instance
   * @param {Object} performanceManager - Performance manager for caching
   * @param {Object} options - Configuration options
   */
  constructor(performanceManager = null, options = {}) {
    this.performanceManager = performanceManager;
    this.config = {
      // Cheerio Configuration (lightweight)
      decodeEntities: false,
      normalizeWhitespace: false,
      xmlMode: false,
      
      // Processing Limits
      maxElementsToProcess: options.maxElementsToProcess || 10000,
      maxLinkAnalysis: options.maxLinkAnalysis || 1000,
      batchSize: options.batchSize || 50,
      
      // Cache settings
      enableCaching: options.enableCaching !== false,
      cachePrefix: options.cachePrefix || 'dom_',
      
      // Memory management
      enableCleanup: options.enableCleanup !== false,
      cleanupThreshold: options.cleanupThreshold || 100,
      
      ...options
    };
    
    this.processedCount = 0;
    this.activeDOMs = new Set();
  }

  /**
   * Create optimized Cheerio instance from HTML
   * @param {string} html - HTML content
   * @param {string} url - Base URL for the document
   * @param {Object} options - Cheerio options
   * @returns {Promise<Object>} Cheerio instance and document-like interface
   */
  async createDOM(html, url = 'https://example.com', options = {}) {
    try {
      // Load HTML with Cheerio
      const $ = cheerio.load(html, {
        xmlMode: false,
        decodeEntities: false,
        normalizeWhitespace: false,
        withStartIndices: false,
        withEndIndices: false,
        ...options
      });
      
      // Create document-like interface for compatibility
      const document = {
        querySelector: (selector) => {
          const elements = $(selector);
          return elements.length > 0 ? this.cheerioToElement(elements.first(), $) : null;
        },
        querySelectorAll: (selector) => {
          const elements = $(selector);
          return Array.from({ length: elements.length }, (_, i) => 
            this.cheerioToElement(elements.eq(i), $)
          );
        },
        createElement: (tagName) => ({ tagName, textContent: '', innerHTML: '' }),
        documentElement: this.cheerioToElement($('html'), $) || { innerHTML: html },
        body: this.cheerioToElement($('body'), $) || { innerHTML: '' },
        head: this.cheerioToElement($('head'), $) || { innerHTML: '' },
        title: $('title').text() || '',
        URL: url
      };
      
      this.processedCount++;
      
      // Clean scripts and styles for performance unless explicitly requested
      if (!options.keepScripts) {
        $('script, style').remove();
      }
      
      return {
        $,
        document,
        window: { document },
        cleanup: () => {} // No cleanup needed for Cheerio
      };
      
    } catch (error) {
      console.error('Error creating DOM:', error.message);
      return {
        $: null,
        document: null,
        window: null,
        cleanup: () => {},
        error: error.message
      };
    }
  }

  /**
   * Convert Cheerio element to DOM-like element interface
   * @param {Object} cheerioElement - Cheerio element
   * @param {Object} $ - Cheerio instance
   * @returns {Object} DOM-like element
   */
  cheerioToElement(cheerioElement, $) {
    if (!cheerioElement || cheerioElement.length === 0) return null;
    
    const elem = cheerioElement.get(0);
    return {
      tagName: elem.name || elem.tagName,
      textContent: cheerioElement.text(),
      innerHTML: cheerioElement.html(),
      outerHTML: $.html(cheerioElement),
      getAttribute: (name) => cheerioElement.attr(name),
      hasAttribute: (name) => cheerioElement.attr(name) !== undefined,
      classList: {
        contains: (className) => cheerioElement.hasClass(className)
      },
      href: cheerioElement.attr('href'),
      src: cheerioElement.attr('src'),
      alt: cheerioElement.attr('alt'),
      title: cheerioElement.attr('title'),
      id: cheerioElement.attr('id'),
      className: cheerioElement.attr('class') || '',
      children: cheerioElement.children().toArray().map(child => 
        this.cheerioToElement($(child), $)
      ).filter(Boolean)
    };
  }

  /**
   * Clean specific elements from DOM for performance
   * @param {Document} document - DOM document
   * @param {Array<string>} tagNames - Tag names to remove
   */
  cleanDOMElements(document, tagNames = ['script', 'style']) {
    tagNames.forEach(tagName => {
      const elements = document.querySelectorAll(tagName);
      elements.forEach(element => {
        try {
          element.remove();
        } catch (e) {
          // Ignore removal errors
        }
      });
    });
  }

  /**
   * Extract comprehensive link analysis from document
   * @param {Document} document - DOM document
   * @param {string} pageUrl - Current page URL
   * @param {Object} options - Analysis options
   * @returns {Object} Detailed link analysis
   */
  extractLinkAnalysis(document, pageUrl, options = {}) {
    // Handle null or invalid document
    if (!document || !document.body) {
      return {
        totalLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        functionalLinks: 0,
        emailLinks: 0,
        phoneLinks: 0,
        linkDetails: [],
        linkRatios: { internal: 0, external: 0, totalValidLinks: 0 },
        targetBlank: 0,
        linksWithTitle: 0,
        duplicateLinks: [],
        brokenAnchors: [],
        linksByType: {
          navigation: 0,
          content: 0,
          footer: 0,
          sidebar: 0,
          header: 0
        },
        accessibilityIssues: []
      };
    }
    
    const cacheKey = this._getCacheKey('link_analysis', pageUrl, document);
    
    // Check cache first
    if (this.config.enableCaching && this.performanceManager) {
      const cached = this.performanceManager.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const body = document.body;
    if (!body) {
      return {
        totalLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        functionalLinks: 0,
        emailLinks: 0,
        phoneLinks: 0,
        linkDetails: [],
        linkRatios: { internal: 0, external: 0, totalValidLinks: 0 },
        targetBlank: 0,
        linksWithTitle: 0,
        duplicateLinks: [],
        brokenAnchors: []
      };
    }
    
    const allLinks = body.getElementsByTagName('a');
    const currentDomain = new URL(pageUrl).hostname;
    const maxLinks = Math.min(allLinks.length, this.config.maxLinkAnalysis);
    
    const linkAnalysis = {
      totalLinks: allLinks.length,
      internalLinks: 0,
      externalLinks: 0,
      functionalLinks: 0,
      emailLinks: 0,
      phoneLinks: 0,
      linkDetails: [],
      linkRatios: { internal: 0, external: 0, totalValidLinks: 0 },
      targetBlank: 0,
      linksWithTitle: 0,
      duplicateLinks: [],
      brokenAnchors: [],
      linksByType: {
        navigation: 0,
        content: 0,
        footer: 0,
        sidebar: 0,
        header: 0
      },
      relAttributes: {
        nofollow: 0,
        sponsored: 0,
        ugc: 0,
        noopener: 0,
        noreferrer: 0,
        external: 0,
        help: 0,
        license: 0,
        next: 0,
        prev: 0,
        bookmark: 0,
        tag: 0
      },
      accessibilityIssues: []
    };
    
    const linkTracker = new Map(); // href -> count
    const anchorTracker = new Set(); // Track fragment identifiers
    
    // Process links in batches for performance
    for (let i = 0; i < maxLinks; i++) {
      const link = allLinks[i];
      const href = link.getAttribute('href');
      const text = link.textContent?.trim() || '';
      const title = link.getAttribute('title') || '';
      const target = link.getAttribute('target') || '';
      const rel = link.getAttribute('rel') || '';
      
      if (!href) {
        linkAnalysis.brokenAnchors.push({
          element: 'a',
          issue: 'Missing href attribute',
          text: text.substring(0, 100),
          position: this._getElementPosition(link, document)
        });
        continue;
      }
      
      // Track duplicates
      linkTracker.set(href, (linkTracker.get(href) || 0) + 1);
      
      // Analyze link type and destination
      const linkInfo = this._analyzeLinkDestination(href, pageUrl, currentDomain);
      
      // Update counters
      if (linkInfo.type === 'internal') linkAnalysis.internalLinks++;
      else if (linkInfo.type === 'external') linkAnalysis.externalLinks++;
      else if (linkInfo.type === 'email') linkAnalysis.emailLinks++;
      else if (linkInfo.type === 'phone') linkAnalysis.phoneLinks++;
      else linkAnalysis.functionalLinks++;
      
      // Target blank analysis
      if (target === '_blank') {
        linkAnalysis.targetBlank++;
        // Check for security issues
        if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
          linkAnalysis.accessibilityIssues.push({
            type: 'security',
            issue: 'target="_blank" without rel="noopener"',
            href: href,
            text: text.substring(0, 50)
          });
        }
      }
      
      // Title attribute analysis
      if (title) linkAnalysis.linksWithTitle++;
      
      // Rel attribute analysis
      if (rel) {
        const relValues = rel.toLowerCase().split(/\s+/);
        relValues.forEach(relValue => {
          if (linkAnalysis.relAttributes.hasOwnProperty(relValue)) {
            linkAnalysis.relAttributes[relValue]++;
          }
        });
      }
      
      // Accessibility checks
      if (!text && !title && !link.querySelector('img[alt]')) {
        linkAnalysis.accessibilityIssues.push({
          type: 'accessibility',
          issue: 'Link without accessible text',
          href: href,
          position: this._getElementPosition(link)
        });
      }
      
      // Link position analysis
      const position = this._getElementPosition(link, document);
      linkAnalysis.linksByType[position.section]++;
      
      // Store detailed link info
      if (options.includeDetails && linkAnalysis.linkDetails.length < 100) {
        linkAnalysis.linkDetails.push({
          href,
          text: text.substring(0, 100),
          title,
          target,
          rel,
          type: linkInfo.type,
          isResolved: linkInfo.isResolved,
          position,
          hasAccessibleText: !!(text || title || link.querySelector('img[alt]'))
        });
      }
      
      // Track anchors for fragment validation
      if (href.startsWith('#')) {
        anchorTracker.add(href.substring(1));
      }
    }
    
    // Find duplicate links
    for (const [href, count] of linkTracker.entries()) {
      if (count > 1) {
        linkAnalysis.duplicateLinks.push({ href, count });
      }
    }
    
    // Validate internal anchors
    for (const anchorId of anchorTracker) {
      if (anchorId && !document.getElementById(anchorId)) {
        linkAnalysis.brokenAnchors.push({
          element: 'a',
          issue: `Fragment identifier not found: #${anchorId}`,
          anchor: anchorId
        });
      }
    }
    
    // Calculate ratios
    const totalValidLinks = linkAnalysis.internalLinks + linkAnalysis.externalLinks;
    linkAnalysis.linkRatios = {
      internal: totalValidLinks > 0 ? Math.round((linkAnalysis.internalLinks / totalValidLinks) * 1000) / 10 : 0,
      external: totalValidLinks > 0 ? Math.round((linkAnalysis.externalLinks / totalValidLinks) * 1000) / 10 : 0,
      totalValidLinks
    };
    
    // Cache the result
    if (this.config.enableCaching && this.performanceManager) {
      this.performanceManager.cache.set(cacheKey, linkAnalysis);
    }
    
    return linkAnalysis;
  }

  /**
   * Extract all elements of specific types from document
   * @param {Document} document - DOM document
   * @param {Array<string>} selectors - CSS selectors to extract
   * @param {Object} options - Extraction options
   * @returns {Object} Extracted elements data
   */
  extractElements(document, selectors = [], options = {}) {
    const results = {};
    const maxElements = options.maxElements || this.config.maxElementsToProcess;
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        const elementData = [];
        
        for (let i = 0; i < Math.min(elements.length, maxElements); i++) {
          const element = elements[i];
          elementData.push({
            tagName: element.tagName.toLowerCase(),
            text: element.textContent?.trim().substring(0, 200) || '',
            attributes: this._getElementAttributes(element),
            position: this._getElementPosition(element, document),
            hasContent: !!element.textContent?.trim(),
            childCount: element.children.length
          });
        }
        
        results[selector] = {
          total: elements.length,
          processed: elementData.length,
          elements: elementData
        };
      } catch (error) {
        results[selector] = {
          total: 0,
          processed: 0,
          elements: [],
          error: error.message
        };
      }
    });
    
    return results;
  }

  /**
   * Extract DOM statistics and metrics
   * @param {Document} document - DOM document
   * @returns {Object} DOM statistics
   */
  getDOMStats(document) {
    if (!document || !document.documentElement) {
      return {
        totalElements: 0,
        elementTypes: {},
        documentStructure: {},
        performance: { extractionTime: 0 }
      };
    }
    
    const startTime = Date.now();
    const elementTypes = {};
    const documentStructure = {
      hasDoctype: !!document.doctype,
      hasHtml: !!document.documentElement,
      hasHead: !!document.head,
      hasBody: !!document.body,
      lang: document.documentElement.getAttribute('lang') || '',
      dir: document.documentElement.getAttribute('dir') || 'ltr'
    };
    
    // Count elements by type
    const allElements = document.getElementsByTagName('*');
    let totalElements = allElements.length;
    
    // Limit processing for performance
    const maxCount = Math.min(totalElements, this.config.maxElementsToProcess);
    
    for (let i = 0; i < maxCount; i++) {
      const tagName = allElements[i].tagName.toLowerCase();
      elementTypes[tagName] = (elementTypes[tagName] || 0) + 1;
    }
    
    // Additional structural analysis
    const structuralElements = {
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      paragraphs: document.querySelectorAll('p').length,
      links: document.querySelectorAll('a').length,
      images: document.querySelectorAll('img').length,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      lists: document.querySelectorAll('ul, ol, dl').length,
      tables: document.querySelectorAll('table').length,
      iframes: document.querySelectorAll('iframe').length,
      scripts: document.querySelectorAll('script').length,
      styles: document.querySelectorAll('style, link[rel="stylesheet"]').length
    };
    
    const extractionTime = Date.now() - startTime;
    
    return {
      totalElements,
      processedElements: maxCount,
      elementTypes,
      documentStructure,
      structuralElements,
      performance: {
        extractionTime,
        elementsPerSecond: extractionTime > 0 ? Math.round(maxCount / (extractionTime / 1000)) : 0
      }
    };
  }

  /**
   * Extract and process forms from document
   * @param {Document} document - DOM document
   * @param {Object} options - Processing options
   * @returns {Object} Form analysis data
   */
  extractForms(document, options = {}) {
    const forms = document.querySelectorAll('form');
    const formData = {
      total: forms.length,
      forms: [],
      accessibilityIssues: [],
      securityIssues: [],
      usabilityIssues: []
    };
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const inputs = form.querySelectorAll('input, textarea, select');
      const labels = form.querySelectorAll('label');
      const fieldsets = form.querySelectorAll('fieldset');
      
      const formInfo = {
        id: form.getAttribute('id') || `form-${i}`,
        action: form.getAttribute('action') || '',
        method: form.getAttribute('method') || 'get',
        enctype: form.getAttribute('enctype') || '',
        autocomplete: form.getAttribute('autocomplete') || '',
        inputCount: inputs.length,
        labelCount: labels.length,
        fieldsetCount: fieldsets.length,
        hasSubmitButton: !!form.querySelector('input[type="submit"], button[type="submit"], button:not([type])'),
        inputs: []
      };
      
      // Analyze each input
      for (let j = 0; j < Math.min(inputs.length, 50); j++) { // Limit for performance
        const input = inputs[j];
        const inputInfo = this._analyzeFormInput(input, form);
        formInfo.inputs.push(inputInfo);
        
        // Check accessibility issues
        if (!inputInfo.hasLabel) {
          formData.accessibilityIssues.push({
            form: formInfo.id,
            input: inputInfo.id || inputInfo.name || `input-${j}`,
            issue: 'Input without associated label',
            type: inputInfo.type
          });
        }
      }
      
      // Security analysis
      if (formInfo.method.toLowerCase() === 'get' && this._hasPasswordField(form)) {
        formData.securityIssues.push({
          form: formInfo.id,
          issue: 'Password field in GET form',
          recommendation: 'Use POST method for sensitive data'
        });
      }
      
      if (formInfo.action.startsWith('http://')) {
        formData.securityIssues.push({
          form: formInfo.id,
          issue: 'Form submits to non-HTTPS URL',
          action: formInfo.action
        });
      }
      
      formData.forms.push(formInfo);
    }
    
    return formData;
  }

  /**
   * Clean up DOM instance and free memory
   * @param {Object} dom - JSDOM instance
   */
  cleanupDOM(dom) {
    if (!dom) return;
    
    try {
      // Remove from tracking
      this.activeDOMs.delete(dom);
      
      // Close the window
      if (dom.window) {
        dom.window.close();
      }
      
      // Manual cleanup of references
      if (dom.window?.document) {
        delete dom.window.document;
      }
      
    } catch (error) {
      console.warn('Error during DOM cleanup:', error.message);
    }
  }

  /**
   * Clean up all active DOMs (called periodically)
   */
  cleanupAllDOMs() {
    for (const dom of this.activeDOMs) {
      this.cleanupDOM(dom);
    }
    this.activeDOMs.clear();
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getProcessingStats() {
    return {
      processedCount: this.processedCount,
      activeDOMs: this.activeDOMs.size,
      config: this.config,
      memoryEstimate: this.activeDOMs.size * 1024 * 1024 // Rough estimate
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate cache key for DOM operations
   * @private
   */
  _getCacheKey(operation, url, document) {
    if (!this.performanceManager) return null;
    
    const htmlSnippet = document?.documentElement?.outerHTML?.substring(0, 500) || '';
    const hash = this._hashString(htmlSnippet + url);
    return `${this.config.cachePrefix}${operation}_${hash}`;
  }

  /**
   * Simple string hashing for cache keys
   * @private
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Analyze link destination and categorize
   * @private
   */
  _analyzeLinkDestination(href, pageUrl, currentDomain) {
    try {
      if (href.startsWith('mailto:')) {
        return { type: 'email', isResolved: true };
      }
      if (href.startsWith('tel:')) {
        return { type: 'phone', isResolved: true };
      }
      if (href.startsWith('#')) {
        return { type: 'anchor', isResolved: true };
      }
      if (href.startsWith('javascript:')) {
        return { type: 'javascript', isResolved: false };
      }
      
      const resolvedUrl = new URL(href, pageUrl);
      const isInternal = resolvedUrl.hostname === currentDomain;
      const isExternal = !isInternal && resolvedUrl.protocol.startsWith('http');
      
      if (isInternal) {
        return { type: 'internal', isResolved: true, url: resolvedUrl };
      } else if (isExternal) {
        return { type: 'external', isResolved: true, url: resolvedUrl };
      } else {
        return { type: 'other', isResolved: false };
      }
      
    } catch {
      // Handle relative URLs and functional links
      if (href.startsWith('/') || (!href.includes('://') && !href.startsWith('mailto:') && !href.startsWith('tel:'))) {
        return { type: 'internal', isResolved: false };
      } else {
        return { type: 'functional', isResolved: false };
      }
    }
  }

  /**
   * Get element position context
   * @private
   */
  _getElementPosition(element, document) {
    const rect = {
      section: 'content', // default
      isAboveFold: false,
      context: []
    };
    
    // Handle missing document parameter (fallback)
    const documentBody = document?.body || element?.ownerDocument?.body;
    if (!documentBody) {
      return rect;
    }
    
    // Determine section context
    let current = element;
    while (current && current !== documentBody) {
      const tagName = current.tagName?.toLowerCase();
      if (tagName === 'header' || current.getAttribute('role') === 'banner') {
        rect.section = 'header';
        break;
      } else if (tagName === 'nav' || current.getAttribute('role') === 'navigation') {
        rect.section = 'navigation';
        break;
      } else if (tagName === 'footer' || current.getAttribute('role') === 'contentinfo') {
        rect.section = 'footer';
        break;
      } else if (tagName === 'aside' || current.getAttribute('role') === 'complementary') {
        rect.section = 'sidebar';
        break;
      } else if (tagName === 'main' || current.getAttribute('role') === 'main') {
        rect.section = 'content';
        break;
      }
      
      if (tagName) {
        rect.context.unshift(tagName);
      }
      current = current.parentElement;
    }
    
    // Rough above-fold detection (assumes 800px viewport height)
    try {
      const elementRect = element.getBoundingClientRect?.();
      if (elementRect) {
        rect.isAboveFold = elementRect.top < 800;
      }
    } catch (e) {
      // getBoundingClientRect not available in JSDOM
    }
    
    return rect;
  }

  /**
   * Get element attributes as object
   * @private
   */
  _getElementAttributes(element) {
    const attributes = {};
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }

  /**
   * Analyze form input for accessibility and usability
   * @private
   */
  _analyzeFormInput(input, form) {
    const id = input.getAttribute('id') || '';
    const name = input.getAttribute('name') || '';
    const type = input.getAttribute('type') || 'text';
    const required = input.hasAttribute('required');
    const placeholder = input.getAttribute('placeholder') || '';
    const autocomplete = input.getAttribute('autocomplete') || '';
    
    // Check for associated label
    let hasLabel = false;
    let labelText = '';
    
    if (id) {
      const label = form.querySelector(`label[for="${id}"]`);
      if (label) {
        hasLabel = true;
        labelText = label.textContent?.trim() || '';
      }
    }
    
    // Check if wrapped in label
    if (!hasLabel) {
      const parentLabel = input.closest('label');
      if (parentLabel) {
        hasLabel = true;
        labelText = parentLabel.textContent?.trim() || '';
      }
    }
    
    // Check for aria-label
    if (!hasLabel) {
      const ariaLabel = input.getAttribute('aria-label');
      if (ariaLabel) {
        hasLabel = true;
        labelText = ariaLabel;
      }
    }
    
    return {
      id,
      name,
      type,
      required,
      placeholder,
      autocomplete,
      hasLabel,
      labelText: labelText.substring(0, 100),
      hasAriaLabel: !!input.getAttribute('aria-label'),
      hasAriaDescribedBy: !!input.getAttribute('aria-describedby'),
      isAccessible: hasLabel || !!placeholder
    };
  }

  /**
   * Check if form has password fields
   * @private
   */
  _hasPasswordField(form) {
    return !!form.querySelector('input[type="password"]');
  }
}

// ============================================================================
// NO-OP RESOURCE LOADER FOR PERFORMANCE
// ============================================================================

// ============================================================================
// STANDALONE UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick DOM creation for simple HTML parsing
 * @param {string} html - HTML content
 * @param {string} url - Base URL
 * @returns {Object} Simple DOM object
 */
export function createQuickDOM(html, url = 'https://example.com') {
  const processor = new DOMProcessor();
  return processor.createDOM(html, url, { 
    loadResources: false,
    keepScripts: false 
  });
}

/**
 * Extract links from HTML string without full DOM processing
 * @param {string} html - HTML content
 * @param {string} pageUrl - Base URL
 * @returns {Promise<Object>} Link analysis
 */
export async function quickLinkExtraction(html, pageUrl) {
  const processor = new DOMProcessor();
  const { document, cleanup } = await processor.createDOM(html, pageUrl);
  
  if (!document) {
    return {
      totalLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      error: 'Failed to parse HTML'
    };
  }
  
  const result = processor.extractLinkAnalysis(document, pageUrl);
  cleanup();
  
  return result;
}

/**
 * Get DOM statistics from HTML string
 * @param {string} html - HTML content
 * @returns {Promise<Object>} DOM statistics
 */
export async function getDOMStatistics(html) {
  const processor = new DOMProcessor();
  const { document, cleanup } = await processor.createDOM(html);
  
  if (!document) {
    return {
      totalElements: 0,
      error: 'Failed to parse HTML'
    };
  }
  
  const stats = processor.getDOMStats(document);
  cleanup();
  
  return stats;
}

// ============================================================================
// BACKWARDS COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Legacy function for optimized link analysis
 * @param {Document} document - DOM document
 * @param {string} pageUrl - Current page URL
 * @returns {Object} Link analysis data
 */
export function extractLinkAnalysisOptimized(document, pageUrl) {
  const processor = new DOMProcessor();
  return processor.extractLinkAnalysis(document, pageUrl);
}

/**
 * Legacy function for DOM statistics
 * @param {Document} document - DOM document
 * @returns {Object} DOM statistics
 */
export function getDOMStatsOptimized(document) {
  const processor = new DOMProcessor();
  return processor.getDOMStats(document);
}

/**
 * Legacy DOM creation function (now using Cheerio)
 * @param {string} html - HTML content
 * @param {string} url - Base URL
 * @returns {Promise<Object>} DOM instance
 */
export async function createOptimizedJSDOM(html, url = 'https://example.com') {
  const processor = new DOMProcessor();
  return processor.createDOM(html, url);
}

// Default export
export default DOMProcessor;
