/**
 * UX Analysis Standards and Benchmarks
 * 
 * Defines industry standards, benchmarks, and reference values for UX analysis.
 * Based on Nielsen's usability principles, WCAG guidelines, and conversion optimization best practices.
 */

export class UXStandards {
  constructor() {
    this.standards = {
      usability: this._getUsabilityStandards(),
      accessibility: this._getAccessibilityStandards(),
      conversion: this._getConversionStandards(),
      cognitive: this._getCognitiveStandards(),
      trust: this._getTrustStandards(),
      performance: this._getPerformanceStandards()
    };

    this.benchmarks = {
      industryAverages: this._getIndustryBenchmarks(),
      bestPractices: this._getBestPracticeBenchmarks(),
      regulatory: this._getRegulatoryRequirements()
    };

    this.thresholds = this._getQualityThresholds();
  }

  /**
   * Get usability standards based on Nielsen's heuristics
   */
  _getUsabilityStandards() {
    return {
      visibility: {
        systemStatus: {
          required: ['loading indicators', 'progress bars', 'feedback messages'],
          responseTime: { max: 1000, unit: 'ms' }, // 1 second rule
          statusUpdates: { frequency: 'real-time', contexts: ['forms', 'uploads', 'processing'] }
        },
        currentLocation: {
          breadcrumbs: { required: true, maxDepth: 5 },
          activeStates: { required: true, contexts: ['navigation', 'tabs', 'steps'] },
          pageTitle: { required: true, descriptive: true }
        }
      },
      
      userControl: {
        navigation: {
          backButton: { required: true, contexts: ['multi-step processes'] },
          undoActions: { required: true, contexts: ['data entry', 'destructive actions'] },
          exitOptions: { required: true, contexts: ['modals', 'overlays', 'flows'] }
        },
        customization: {
          preferences: { recommended: true, contexts: ['frequent users'] },
          shortcuts: { recommended: true, contexts: ['power users'] }
        }
      },
      
      consistency: {
        interaction: {
          buttonStyles: { consistent: true, contexts: ['primary', 'secondary', 'destructive'] },
          linkBehavior: { predictable: true, external: 'indicated' },
          formPatterns: { standardized: true }
        },
        visual: {
          typography: { hierarchy: 'clear', contrast: 'sufficient' },
          colorScheme: { semantic: true, accessible: true },
          spacing: { systematic: true, responsive: true }
        }
      },
      
      errorPrevention: {
        validation: {
          realTime: { recommended: true, contexts: ['forms', 'passwords'] },
          clear: { required: true, actionable: true },
          positive: { tone: 'helpful', not: 'accusatory' }
        },
        confirmation: {
          destructiveActions: { required: true },
          dataLoss: { prevention: 'automatic', warning: 'clear' }
        }
      }
    };
  }

  /**
   * Get accessibility standards (WCAG 2.1 AA)
   */
  _getAccessibilityStandards() {
    return {
      wcag: {
        level: 'AA',
        version: '2.1',
        guidelines: {
          perceivable: {
            colorContrast: { minimum: 4.5, large: 3.0 },
            altText: { required: true, descriptive: true },
            captions: { required: true, contexts: ['video', 'audio'] }
          },
          operable: {
            keyboardAccess: { fullSupport: true },
            focusManagement: { visible: true, logical: true },
            timeouts: { generous: true, extendable: true }
          },
          understandable: {
            language: { specified: true, clear: true },
            instructions: { clear: true, examples: 'provided' },
            errorIdentification: { specific: true, suggestions: 'provided' }
          },
          robust: {
            markup: { valid: true, semantic: true },
            compatibility: { assistiveTech: 'full' }
          }
        }
      },
      
      assistiveTechnology: {
        screenReaders: { support: 'full', tested: ['NVDA', 'JAWS', 'VoiceOver'] },
        keyboardNavigation: { support: 'complete', skipLinks: 'provided' },
        zoomSupport: { level: '200%', layout: 'maintained' }
      }
    };
  }

  /**
   * Get conversion optimization standards
   */
  _getConversionStandards() {
    return {
      callToAction: {
        visibility: { prominent: true, contrast: 'high' },
        text: { actionOriented: true, specific: true, urgent: false },
        placement: { foldVisibility: '80%', logical: true },
        design: { buttonLike: true, clickable: 'obvious' }
      },
      
      forms: {
        length: { optimal: '3-5 fields', maximum: '10 fields' },
        validation: { realTime: true, helpful: true },
        completion: { progress: 'shown', autosave: 'recommended' },
        design: { singleColumn: true, mobile: 'optimized' }
      },
      
      trustSignals: {
        security: { ssl: 'required', badges: 'visible', privacy: 'clear' },
        social: { testimonials: 'authentic', reviews: 'verified', counts: 'accurate' },
        contact: { multiple: 'methods', response: 'guaranteed' }
      },
      
      frictionReduction: {
        steps: { minimum: 'viable', progress: 'clear' },
        choices: { limited: '7±2 rule', organized: 'logically' },
        loading: { fast: '<3s', progress: 'shown' }
      }
    };
  }

  /**
   * Get cognitive load standards
   */
  _getCognitiveStandards() {
    return {
      millerRule: {
        choices: { maximum: 9, optimal: '5-7' },
        menuItems: { maximum: 9, categories: 'grouped' },
        formFields: { perPage: 7, grouping: 'logical' }
      },
      
      informationHierarchy: {
        headings: { levels: '3 maximum', semantic: true },
        scanability: { bulletsPoints: true, whitespace: 'generous' },
        priority: { primary: 'obvious', secondary: 'clear' }
      },
      
      cognitiveProcessing: {
        readingLevel: { maximum: 'grade 8', technical: 'explained' },
        sentenceLength: { maximum: '20 words', average: '15 words' },
        paragraphLength: { maximum: '4 sentences' }
      },
      
      decisionSupport: {
        comparisons: { structured: true, criteria: 'clear' },
        recommendations: { provided: true, explained: true },
        defaults: { sensible: true, common: 'selected' }
      }
    };
  }

  /**
   * Get trust and credibility standards
   */
  _getTrustStandards() {
    return {
      credibilitySignals: {
        aboutUs: { detailed: true, team: 'shown', history: 'provided' },
        contact: { multiple: 'channels', physical: 'address', response: 'time' },
        testimonials: { authentic: true, specific: true, recent: true }
      },
      
      transparency: {
        pricing: { clear: true, hidden: 'none', comparison: 'easy' },
        policies: { accessible: true, plain: 'language', updated: 'recently' },
        terms: { fair: true, readable: true, highlighted: 'key points' }
      },
      
      security: {
        ssl: { required: true, visible: 'indicator' },
        privacy: { policy: 'detailed', collection: 'explained', usage: 'specified' },
        payments: { encrypted: true, options: 'multiple', secure: 'badges' }
      },
      
      socialProof: {
        reviews: { authentic: true, balanced: true, recent: true },
        usage: { metrics: 'accurate', context: 'provided' },
        endorsements: { credible: true, relevant: true, verified: true }
      }
    };
  }

  /**
   * Get performance standards that affect UX
   */
  _getPerformanceStandards() {
    return {
      loading: {
        initial: { target: '2s', maximum: '3s' },
        subsequent: { target: '1s', maximum: '2s' },
        perception: { feedback: '100ms', smooth: '60fps' }
      },
      
      responsiveness: {
        breakpoints: ['320px', '768px', '1024px', '1440px'],
        touch: { targets: '44px minimum', spacing: '8px minimum' },
        interaction: { feedback: 'immediate', completion: 'clear' }
      }
    };
  }

  /**
   * Get industry benchmark data
   */
  _getIndustryBenchmarks() {
    return {
      conversionRates: {
        ecommerce: { average: '2.86%', good: '5%', excellent: '10%' },
        saas: { average: '7%', good: '15%', excellent: '25%' },
        leadGeneration: { average: '2.35%', good: '5%', excellent: '11%' }
      },
      
      usabilityMetrics: {
        taskCompletion: { average: '78%', good: '85%', excellent: '95%' },
        errorRate: { average: '10%', good: '5%', excellent: '2%' },
        satisfaction: { average: '3.2/5', good: '4.0/5', excellent: '4.5/5' }
      },
      
      engagementMetrics: {
        bounceRate: { average: '47%', good: '35%', excellent: '25%' },
        timeOnPage: { average: '2:17', good: '4:00', excellent: '6:00' },
        pagesPerSession: { average: '2.17', good: '3.5', excellent: '5.0' }
      }
    };
  }

  /**
   * Get best practice benchmarks
   */
  _getBestPracticeBenchmarks() {
    return {
      accessibility: {
        wcagAA: { required: '100%', target: '100%' },
        keyboardAccess: { required: '100%', target: '100%' },
        screenReader: { required: '95%', target: '100%' }
      },
      
      mobileOptimization: {
        responsive: { required: '100%', target: '100%' },
        touchTargets: { required: '95%', target: '100%' },
        performance: { required: 'good', target: 'excellent' }
      },
      
      conversionOptimization: {
        ctaVisibility: { required: '90%', target: '95%' },
        formUsability: { required: '85%', target: '95%' },
        trustSignals: { required: '75%', target: '90%' }
      }
    };
  }

  /**
   * Get regulatory requirements
   */
  _getRegulatoryRequirements() {
    return {
      ada: {
        compliance: 'WCAG 2.1 AA',
        required: true,
        domains: ['government', 'education', 'healthcare', 'finance']
      },
      
      gdpr: {
        consent: { explicit: true, granular: true, withdrawable: true },
        privacy: { policy: 'detailed', rights: 'explained', contact: 'provided' }
      },
      
      ccpa: {
        privacy: { notice: 'prominent', rights: 'explained', optOut: 'easy' }
      }
    };
  }

  /**
   * Get quality thresholds for scoring
   */
  _getQualityThresholds() {
    return {
      scores: {
        excellent: { min: 85, max: 100, grade: 'A' },
        good: { min: 70, max: 84, grade: 'B' },
        average: { min: 55, max: 69, grade: 'C' },
        poor: { min: 40, max: 54, grade: 'D' },
        critical: { min: 0, max: 39, grade: 'F' }
      },
      
      confidence: {
        high: { min: 0.8, max: 1.0 },
        medium: { min: 0.6, max: 0.79 },
        low: { min: 0.4, max: 0.59 },
        unreliable: { min: 0.0, max: 0.39 }
      },
      
      priority: {
        critical: { score: '<40', impact: 'high', effort: 'any' },
        high: { score: '<55', impact: 'high', effort: 'low' },
        medium: { score: '<70', impact: 'medium', effort: 'low' },
        low: { score: '>=70', impact: 'any', effort: 'low' }
      }
    };
  }

  /**
   * Get standard for specific area
   * @param {string} area - The area to get standards for
   * @returns {Object} Standards for the specified area
   */
  getStandard(area) {
    return this.standards[area] || null;
  }

  /**
   * Get benchmark for specific metric
   * @param {string} category - Benchmark category
   * @param {string} metric - Specific metric
   * @returns {Object} Benchmark data
   */
  getBenchmark(category, metric) {
    return this.benchmarks.industryAverages[category]?.[metric] || null;
  }

  /**
   * Get quality threshold for score
   * @param {number} score - Score to evaluate
   * @returns {Object} Quality threshold information
   */
  getQualityThreshold(score) {
    for (const [level, threshold] of Object.entries(this.thresholds.scores)) {
      if (score >= threshold.min && score <= threshold.max) {
        return { level, ...threshold };
      }
    }
    return null;
  }

  /**
   * Check if score meets standard
   * @param {number} score - Score to check
   * @param {string} standard - Standard level (excellent, good, average, poor, critical)
   * @returns {boolean} Whether score meets standard
   */
  meetsStandard(score, standard = 'good') {
    const threshold = this.thresholds.scores[standard];
    return threshold ? score >= threshold.min : false;
  }

  /**
   * Get all standards as a comprehensive reference
   * @returns {Object} Complete standards reference
   */
  getAllStandards() {
    return {
      standards: this.standards,
      benchmarks: this.benchmarks,
      thresholds: this.thresholds,
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}
