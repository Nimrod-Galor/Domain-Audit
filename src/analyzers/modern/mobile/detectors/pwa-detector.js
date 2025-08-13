/**
 * PWA (Progressive Web App) Detector - GPT-5 Style Modular Component
 * 
 * Detects PWA features, capabilities, and implementation patterns for app-like mobile experiences
 */

export class PWADetector {
  constructor(config = {}) {
    this.config = {
      analyzeManifest: config.analyzeManifest !== false,
      analyzeServiceWorker: config.analyzeServiceWorker !== false,
      analyzeOfflineCapabilities: config.analyzeOfflineCapabilities !== false,
      analyzeAppFeatures: config.analyzeAppFeatures !== false,
      checkInstallability: config.checkInstallability !== false,
      ...config
    };
  }

  /**
   * Analyze Progressive Web App implementation
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} PWA analysis
   */
  async analyze(document, url) {
    const results = {
      manifest: {},
      serviceWorker: {},
      offlineCapabilities: {},
      appFeatures: {},
      installability: {},
      pwaScore: 0,
      pwaGrade: 'F',
      features: [],
      recommendations: []
    };

    try {
      // Analyze web app manifest
      if (this.config.analyzeManifest) {
        results.manifest = this.analyzeManifest(document);
      }

      // Analyze service worker implementation
      if (this.config.analyzeServiceWorker) {
        results.serviceWorker = this.analyzeServiceWorker(document);
      }

      // Analyze offline capabilities
      if (this.config.analyzeOfflineCapabilities) {
        results.offlineCapabilities = this.analyzeOfflineCapabilities(document);
      }

      // Analyze app-like features
      if (this.config.analyzeAppFeatures) {
        results.appFeatures = this.analyzeAppFeatures(document);
      }

      // Check installability criteria
      if (this.config.checkInstallability) {
        results.installability = this.analyzeInstallability(results);
      }

      // Calculate PWA scores and generate insights
      results.pwaScore = this.calculatePWAScore(results);
      results.pwaGrade = this.calculatePWAGrade(results.pwaScore);
      results.features = this.identifyPWAFeatures(results);
      results.recommendations = this.generatePWARecommendations(results);

    } catch (error) {
      results.error = error.message;
      results.pwaScore = 0;
    }

    return results;
  }

  /**
   * Analyze web app manifest
   * @param {Object} document - DOM document
   * @returns {Object} Manifest analysis
   * @private
   */
  analyzeManifest(document) {
    const manifest = {
      exists: false,
      href: null,
      valid: false,
      properties: {},
      completeness: 0,
      score: 0,
      issues: [],
      strengths: []
    };

    try {
      // Check for manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]');
      
      if (manifestLink) {
        manifest.exists = true;
        manifest.href = manifestLink.getAttribute('href');
        manifest.strengths.push('manifest-declared');

        // Note: We can't fetch and parse the manifest file in this context
        // but we can check for common manifest-related elements
        
        // Check for manifest-related meta tags that might indicate manifest content
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
          manifest.properties.themeColor = themeColor.getAttribute('content');
          manifest.strengths.push('theme-color-set');
        }

        const appCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        if (appCapable) {
          manifest.properties.appCapable = appCapable.getAttribute('content');
          manifest.strengths.push('app-capable-set');
        }

        const statusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (statusBarStyle) {
          manifest.properties.statusBarStyle = statusBarStyle.getAttribute('content');
        }

        const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (appTitle) {
          manifest.properties.appTitle = appTitle.getAttribute('content');
        }

        // Estimate completeness based on related elements
        const relatedElements = [
          'meta[name="theme-color"]',
          'meta[name="apple-mobile-web-app-capable"]',
          'meta[name="apple-mobile-web-app-status-bar-style"]',
          'meta[name="apple-mobile-web-app-title"]',
          'link[rel="apple-touch-icon"]'
        ];

        const foundElements = relatedElements.filter(selector => 
          document.querySelector(selector) !== null
        ).length;

        manifest.completeness = (foundElements / relatedElements.length) * 100;
        manifest.valid = manifest.completeness > 60; // Estimate validity

        // Calculate manifest score
        manifest.score = 40; // Base score for having manifest
        if (manifest.valid) manifest.score += 30;
        if (manifest.properties.themeColor) manifest.score += 15;
        if (manifest.properties.appCapable === 'yes') manifest.score += 15;

      } else {
        manifest.issues.push('no-manifest-declared');
        manifest.score = 0;
      }

    } catch (error) {
      manifest.error = error.message;
    }

    return manifest;
  }

  /**
   * Analyze service worker implementation
   * @param {Object} document - DOM document
   * @returns {Object} Service worker analysis
   * @private
   */
  analyzeServiceWorker(document) {
    const serviceWorker = {
      detected: false,
      registrationMethod: 'none',
      registrationScope: null,
      swFile: null,
      cacheStrategy: 'unknown',
      features: [],
      score: 0,
      implementation: 'none'
    };

    try {
      // Analyze scripts for service worker registration
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      // Check for service worker registration patterns
      if (/navigator\.serviceWorker\.register/i.test(scriptContent)) {
        serviceWorker.detected = true;
        serviceWorker.registrationMethod = 'javascript';
        serviceWorker.features.push('service-worker-registration');

        // Try to extract service worker file name
        const swFileMatch = scriptContent.match(/register\s*\(\s*['"`]([^'"`]+)['"`]/i);
        if (swFileMatch) {
          serviceWorker.swFile = swFileMatch[1];
        }

        // Try to extract scope
        const scopeMatch = scriptContent.match(/scope\s*:\s*['"`]([^'"`]+)['"`]/i);
        if (scopeMatch) {
          serviceWorker.registrationScope = scopeMatch[1];
        }

        // Check for cache strategies
        if (/cache\.put|cache\.add|cache\.match/i.test(scriptContent)) {
          serviceWorker.cacheStrategy = 'cache-api';
          serviceWorker.features.push('cache-api-usage');
        }

        if (/workbox/i.test(scriptContent)) {
          serviceWorker.cacheStrategy = 'workbox';
          serviceWorker.features.push('workbox-implementation');
        }

        // Check for background sync
        if (/background.?sync|sync\.register/i.test(scriptContent)) {
          serviceWorker.features.push('background-sync');
        }

        // Check for push notifications
        if (/push|notification/i.test(scriptContent)) {
          serviceWorker.features.push('push-notifications');
        }

        // Determine implementation quality
        if (serviceWorker.features.length >= 3) {
          serviceWorker.implementation = 'advanced';
        } else if (serviceWorker.features.length >= 2) {
          serviceWorker.implementation = 'intermediate';
        } else {
          serviceWorker.implementation = 'basic';
        }

        // Calculate service worker score
        serviceWorker.score = 50; // Base score for having service worker
        if (serviceWorker.cacheStrategy !== 'unknown') serviceWorker.score += 25;
        if (serviceWorker.features.length > 1) serviceWorker.score += 25;

      } else {
        serviceWorker.score = 0;
      }

    } catch (error) {
      serviceWorker.error = error.message;
    }

    return serviceWorker;
  }

  /**
   * Analyze offline capabilities
   * @param {Object} document - DOM document
   * @returns {Object} Offline capabilities analysis
   * @private
   */
  analyzeOfflineCapabilities(document) {
    const offline = {
      serviceWorker: false,
      appCache: false,
      localStorage: false,
      indexedDB: false,
      cacheAPI: false,
      offlinePage: false,
      capabilities: [],
      score: 0,
      level: 'none'
    };

    try {
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      // Check for service worker (already analyzed but included here for completeness)
      if (/navigator\.serviceWorker/i.test(scriptContent)) {
        offline.serviceWorker = true;
        offline.capabilities.push('service-worker');
      }

      // Check for Cache API usage
      if (/caches\.|cache\.put|cache\.match/i.test(scriptContent)) {
        offline.cacheAPI = true;
        offline.capabilities.push('cache-api');
      }

      // Check for localStorage usage
      if (/localStorage\.|sessionStorage\./i.test(scriptContent)) {
        offline.localStorage = true;
        offline.capabilities.push('local-storage');
      }

      // Check for IndexedDB usage
      if (/indexedDB|IDBDatabase|IDBObjectStore/i.test(scriptContent)) {
        offline.indexedDB = true;
        offline.capabilities.push('indexed-db');
      }

      // Check for App Cache (deprecated but still check)
      const htmlElement = document.querySelector('html');
      if (htmlElement?.hasAttribute('manifest')) {
        offline.appCache = true;
        offline.capabilities.push('app-cache');
      }

      // Check for offline page indicators
      if (/offline\.html|offline\.htm|offline.?page/i.test(scriptContent)) {
        offline.offlinePage = true;
        offline.capabilities.push('offline-page');
      }

      // Determine offline capability level
      if (offline.serviceWorker && offline.cacheAPI) {
        offline.level = 'advanced';
      } else if (offline.serviceWorker || offline.capabilities.length >= 2) {
        offline.level = 'intermediate';
      } else if (offline.capabilities.length > 0) {
        offline.level = 'basic';
      } else {
        offline.level = 'none';
      }

      // Calculate offline score
      offline.score = Math.min(100, offline.capabilities.length * 20);

    } catch (error) {
      offline.error = error.message;
    }

    return offline;
  }

  /**
   * Analyze app-like features
   * @param {Object} document - DOM document
   * @returns {Object} App features analysis
   * @private
   */
  analyzeAppFeatures(document) {
    const appFeatures = {
      fullscreen: false,
      homeScreenAddable: false,
      splashScreen: false,
      appShell: false,
      pushNotifications: false,
      backgroundSync: false,
      shareAPI: false,
      installPrompt: false,
      features: [],
      score: 0,
      appLikeness: 'none'
    };

    try {
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      // Check for fullscreen API usage
      if (/requestFullscreen|webkitRequestFullscreen/i.test(scriptContent)) {
        appFeatures.fullscreen = true;
        appFeatures.features.push('fullscreen-api');
      }

      // Check for install prompt handling
      if (/beforeinstallprompt|prompt\.show/i.test(scriptContent)) {
        appFeatures.installPrompt = true;
        appFeatures.features.push('install-prompt');
      }

      // Check for push notification support
      if (/PushManager|serviceWorkerRegistration\.pushManager/i.test(scriptContent)) {
        appFeatures.pushNotifications = true;
        appFeatures.features.push('push-notifications');
      }

      // Check for background sync
      if (/background.?sync|sync\.register/i.test(scriptContent)) {
        appFeatures.backgroundSync = true;
        appFeatures.features.push('background-sync');
      }

      // Check for Web Share API
      if (/navigator\.share|Web Share API/i.test(scriptContent)) {
        appFeatures.shareAPI = true;
        appFeatures.features.push('share-api');
      }

      // Check for home screen addable indicators
      const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (appleCapable?.getAttribute('content') === 'yes') {
        appFeatures.homeScreenAddable = true;
        appFeatures.features.push('home-screen-addable');
      }

      // Check for splash screen elements
      const appleLaunchImage = document.querySelectorAll('link[rel="apple-touch-startup-image"]');
      if (appleLaunchImage.length > 0) {
        appFeatures.splashScreen = true;
        appFeatures.features.push('splash-screen');
      }

      // Check for app shell pattern (basic heuristic)
      const appShellIndicators = [
        'app-shell',
        'shell',
        'skeleton',
        'loading-skeleton'
      ];
      
      const hasAppShell = appShellIndicators.some(indicator =>
        scriptContent.toLowerCase().includes(indicator) ||
        document.querySelector(`.${indicator}`) !== null
      );
      
      if (hasAppShell) {
        appFeatures.appShell = true;
        appFeatures.features.push('app-shell');
      }

      // Determine app-likeness level
      if (appFeatures.features.length >= 5) {
        appFeatures.appLikeness = 'high';
      } else if (appFeatures.features.length >= 3) {
        appFeatures.appLikeness = 'medium';
      } else if (appFeatures.features.length >= 1) {
        appFeatures.appLikeness = 'low';
      } else {
        appFeatures.appLikeness = 'none';
      }

      // Calculate app features score
      appFeatures.score = Math.min(100, appFeatures.features.length * 15);

    } catch (error) {
      appFeatures.error = error.message;
    }

    return appFeatures;
  }

  /**
   * Analyze PWA installability criteria
   * @param {Object} results - Analysis results from other methods
   * @returns {Object} Installability analysis
   * @private
   */
  analyzeInstallability(results) {
    const installability = {
      meetsCriteria: false,
      criteria: {
        hasManifest: false,
        hasServiceWorker: false,
        hasHTTPS: false,
        hasIcons: false,
        hasName: false,
        hasStartUrl: false
      },
      score: 0,
      missing: [],
      status: 'not-installable'
    };

    try {
      // Check manifest criteria
      installability.criteria.hasManifest = results.manifest?.exists || false;
      
      // Check service worker criteria
      installability.criteria.hasServiceWorker = results.serviceWorker?.detected || false;

      // Check HTTPS (assume HTTPS if not explicitly HTTP)
      // Note: In real implementation, this would check the actual URL protocol
      installability.criteria.hasHTTPS = true; // Placeholder

      // Check for icons (from manifest analysis)
      installability.criteria.hasIcons = results.manifest?.properties?.themeColor ? true : false;

      // Check for app name/title
      installability.criteria.hasName = results.manifest?.properties?.appTitle ? true : false;

      // Check for start URL (assume present if manifest exists)
      installability.criteria.hasStartUrl = results.manifest?.exists || false;

      // Identify missing criteria
      Object.entries(installability.criteria).forEach(([criterion, met]) => {
        if (!met) {
          installability.missing.push(criterion.replace(/([A-Z])/g, '-$1').toLowerCase());
        }
      });

      // Calculate installability score
      const metCriteria = Object.values(installability.criteria).filter(Boolean).length;
      const totalCriteria = Object.keys(installability.criteria).length;
      installability.score = (metCriteria / totalCriteria) * 100;

      // Determine installability status
      if (installability.score >= 100) {
        installability.status = 'fully-installable';
        installability.meetsCriteria = true;
      } else if (installability.score >= 80) {
        installability.status = 'mostly-installable';
      } else if (installability.score >= 50) {
        installability.status = 'partially-installable';
      } else {
        installability.status = 'not-installable';
      }

    } catch (error) {
      installability.error = error.message;
    }

    return installability;
  }

  /**
   * Calculate overall PWA score
   * @param {Object} results - Analysis results
   * @returns {number} PWA score (0-100)
   * @private
   */
  calculatePWAScore(results) {
    let score = 0;
    let weights = 0;

    // Manifest (25%)
    if (results.manifest && !results.manifest.error) {
      score += (results.manifest.score || 0) * 0.25;
      weights += 0.25;
    }

    // Service Worker (30%)
    if (results.serviceWorker && !results.serviceWorker.error) {
      score += (results.serviceWorker.score || 0) * 0.3;
      weights += 0.3;
    }

    // Offline Capabilities (20%)
    if (results.offlineCapabilities && !results.offlineCapabilities.error) {
      score += (results.offlineCapabilities.score || 0) * 0.2;
      weights += 0.2;
    }

    // App Features (15%)
    if (results.appFeatures && !results.appFeatures.error) {
      score += (results.appFeatures.score || 0) * 0.15;
      weights += 0.15;
    }

    // Installability (10%)
    if (results.installability && !results.installability.error) {
      score += (results.installability.score || 0) * 0.1;
      weights += 0.1;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Calculate PWA grade from score
   * @param {number} score - PWA score (0-100)
   * @returns {string} PWA grade
   * @private
   */
  calculatePWAGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Identify PWA features present
   * @param {Object} results - Analysis results
   * @returns {Array} List of PWA features
   * @private
   */
  identifyPWAFeatures(results) {
    const features = [];

    if (results.manifest?.exists) features.push('web-app-manifest');
    if (results.serviceWorker?.detected) features.push('service-worker');
    if (results.offlineCapabilities?.level !== 'none') features.push('offline-support');
    if (results.appFeatures?.installPrompt) features.push('install-prompt');
    if (results.appFeatures?.pushNotifications) features.push('push-notifications');
    if (results.appFeatures?.homeScreenAddable) features.push('home-screen-addable');
    if (results.appFeatures?.backgroundSync) features.push('background-sync');
    if (results.appFeatures?.shareAPI) features.push('web-share-api');

    return features;
  }

  /**
   * Generate PWA recommendations
   * @param {Object} results - Analysis results
   * @returns {Array} List of recommendations
   * @private
   */
  generatePWARecommendations(results) {
    const recommendations = [];

    if (!results.manifest?.exists) {
      recommendations.push({
        type: 'web-app-manifest',
        priority: 'high',
        message: 'Add a web app manifest to enable PWA installation and improved mobile experience',
        impact: 'installability'
      });
    }

    if (!results.serviceWorker?.detected) {
      recommendations.push({
        type: 'service-worker',
        priority: 'high',
        message: 'Implement a service worker for offline functionality and improved performance',
        impact: 'offline-experience'
      });
    }

    if (results.serviceWorker?.detected && results.serviceWorker.implementation === 'basic') {
      recommendations.push({
        type: 'service-worker-enhancement',
        priority: 'medium',
        message: 'Enhance service worker with caching strategies and background sync',
        impact: 'user-experience'
      });
    }

    if (results.offlineCapabilities?.level === 'none' || results.offlineCapabilities?.level === 'basic') {
      recommendations.push({
        type: 'offline-capabilities',
        priority: 'medium',
        message: 'Implement offline capabilities for better user experience when network is unavailable',
        impact: 'reliability'
      });
    }

    if (!results.appFeatures?.installPrompt) {
      recommendations.push({
        type: 'install-prompt',
        priority: 'low',
        message: 'Add install prompt handling to encourage PWA installation',
        impact: 'user-engagement'
      });
    }

    return recommendations;
  }
}

export default PWADetector;
