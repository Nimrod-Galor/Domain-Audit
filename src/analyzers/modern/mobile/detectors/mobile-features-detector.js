/**
 * Mobile Features Detector - GPT-5 Style Modular Component
 * 
 * Detects mobile-specific features, capabilities, and optimization patterns
 */

export class MobileFeaturesDetector {
  constructor(config = {}) {
    this.config = {
      analyzeMetaTags: config.analyzeMetaTags !== false,
      analyzeAppIcons: config.analyzeAppIcons !== false,
      analyzeMobileAPI: config.analyzeMobileAPI !== false,
      analyzeHardwareAccess: config.analyzeHardwareAccess !== false,
      analyzeOfflineCapabilities: config.analyzeOfflineCapabilities !== false,
      ...config
    };
  }

  /**
   * Analyze mobile-specific features and capabilities
   * @param {Object} document - DOM document or Cheerio instance
   * @param {string} url - Page URL
   * @returns {Object} Mobile features analysis
   */
  async analyze(document, url) {
    const results = {
      metaTags: {},
      appIcons: {},
      mobileAPI: {},
      hardwareAccess: {},
      offlineCapabilities: {},
      mobileFriendliness: {},
      score: 0,
      optimizations: [],
      issues: []
    };

    try {
      // Analyze mobile meta tags
      if (this.config.analyzeMetaTags) {
        results.metaTags = this.analyzeMetaTags(document);
      }

      // Analyze app icons and branding
      if (this.config.analyzeAppIcons) {
        results.appIcons = this.analyzeAppIcons(document);
      }

      // Analyze mobile API usage
      if (this.config.analyzeMobileAPI) {
        results.mobileAPI = this.analyzeMobileAPI(document);
      }

      // Analyze hardware access features
      if (this.config.analyzeHardwareAccess) {
        results.hardwareAccess = this.analyzeHardwareAccess(document);
      }

      // Analyze offline capabilities
      if (this.config.analyzeOfflineCapabilities) {
        results.offlineCapabilities = this.analyzeOfflineCapabilities(document);
      }

      // Analyze general mobile-friendliness
      results.mobileFriendliness = this.analyzeMobileFriendliness(document);

      // Calculate overall mobile features score
      results.score = this.calculateMobileFeaturesScore(results);
      results.optimizations = this.identifyOptimizations(results);
      results.issues = this.identifyIssues(results);

    } catch (error) {
      results.error = error.message;
      results.score = 0;
    }

    return results;
  }

  /**
   * Analyze mobile-specific meta tags
   * @param {Object} document - DOM document
   * @returns {Object} Meta tags analysis
   * @private
   */
  analyzeMetaTags(document) {
    const metaTags = {
      viewport: null,
      appleWebApp: {},
      webApp: {},
      theme: {},
      microsoft: {},
      score: 0,
      essential: [],
      missing: []
    };

    try {
      // Essential mobile meta tags
      const essentialTags = [
        'viewport',
        'theme-color',
        'apple-mobile-web-app-capable',
        'apple-mobile-web-app-status-bar-style'
      ];

      // Analyze viewport meta tag
      const viewportTag = document.querySelector('meta[name="viewport"]');
      if (viewportTag) {
        metaTags.viewport = {
          content: viewportTag.getAttribute('content') || '',
          isResponsive: this.isViewportResponsive(viewportTag.getAttribute('content')),
          hasDeviceWidth: viewportTag.getAttribute('content')?.includes('width=device-width'),
          hasInitialScale: viewportTag.getAttribute('content')?.includes('initial-scale=1')
        };
        metaTags.essential.push('viewport');
      } else {
        metaTags.missing.push('viewport');
      }

      // Analyze Apple Web App meta tags
      const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (appleCapable) {
        metaTags.appleWebApp.capable = appleCapable.getAttribute('content');
        metaTags.essential.push('apple-mobile-web-app-capable');
      } else {
        metaTags.missing.push('apple-mobile-web-app-capable');
      }

      const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleStatusBar) {
        metaTags.appleWebApp.statusBarStyle = appleStatusBar.getAttribute('content');
        metaTags.essential.push('apple-mobile-web-app-status-bar-style');
      }

      const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (appleTitle) {
        metaTags.appleWebApp.title = appleTitle.getAttribute('content');
      }

      // Analyze Web App meta tags
      const webAppCapable = document.querySelector('meta[name="mobile-web-app-capable"]');
      if (webAppCapable) {
        metaTags.webApp.capable = webAppCapable.getAttribute('content');
      }

      // Analyze theme colors
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) {
        metaTags.theme.color = themeColor.getAttribute('content');
        metaTags.essential.push('theme-color');
      } else {
        metaTags.missing.push('theme-color');
      }

      const msThemeColor = document.querySelector('meta[name="msapplication-TileColor"]');
      if (msThemeColor) {
        metaTags.microsoft.tileColor = msThemeColor.getAttribute('content');
      }

      // Calculate meta tags score
      metaTags.score = (metaTags.essential.length / essentialTags.length) * 100;

    } catch (error) {
      metaTags.error = error.message;
    }

    return metaTags;
  }

  /**
   * Analyze app icons and mobile branding
   * @param {Object} document - DOM document
   * @returns {Object} App icons analysis
   * @private
   */
  analyzeAppIcons(document) {
    const icons = {
      appleTouchIcon: [],
      favicon: [],
      manifest: null,
      msApplicationIcons: [],
      standardSizes: {
        '57x57': false,
        '72x72': false,
        '114x114': false,
        '144x144': false,
        '180x180': false,
        '192x192': false,
        '512x512': false
      },
      score: 0,
      coverage: 0
    };

    try {
      // Analyze Apple Touch Icons
      const appleTouchIcons = document.querySelectorAll('link[rel*="apple-touch-icon"]');
      appleTouchIcons.forEach(icon => {
        const sizes = icon.getAttribute('sizes') || 'default';
        const href = icon.getAttribute('href') || '';
        
        icons.appleTouchIcon.push({
          sizes,
          href,
          rel: icon.getAttribute('rel')
        });

        // Check for standard sizes
        if (sizes && icons.standardSizes.hasOwnProperty(sizes)) {
          icons.standardSizes[sizes] = true;
        }
      });

      // Analyze standard favicons
      const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
      faviconLinks.forEach(icon => {
        if (!icon.getAttribute('rel')?.includes('apple')) {
          const sizes = icon.getAttribute('sizes') || 'default';
          const href = icon.getAttribute('href') || '';
          const type = icon.getAttribute('type') || '';
          
          icons.favicon.push({
            sizes,
            href,
            type,
            rel: icon.getAttribute('rel')
          });
        }
      });

      // Check for web app manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        icons.manifest = manifestLink.getAttribute('href');
      }

      // Analyze Microsoft application icons
      const msIcons = document.querySelectorAll('meta[name*="msapplication"]');
      msIcons.forEach(meta => {
        if (meta.getAttribute('name')?.includes('icon') || 
            meta.getAttribute('name')?.includes('TileImage')) {
          icons.msApplicationIcons.push({
            name: meta.getAttribute('name'),
            content: meta.getAttribute('content')
          });
        }
      });

      // Calculate coverage and score
      const standardSizesCount = Object.values(icons.standardSizes).filter(Boolean).length;
      icons.coverage = (standardSizesCount / Object.keys(icons.standardSizes).length) * 100;
      
      icons.score = 0;
      if (icons.appleTouchIcon.length > 0) icons.score += 40;
      if (icons.favicon.length > 0) icons.score += 20;
      if (icons.manifest) icons.score += 30;
      if (standardSizesCount >= 3) icons.score += 10;

    } catch (error) {
      icons.error = error.message;
    }

    return icons;
  }

  /**
   * Analyze mobile API usage and features
   * @param {Object} document - DOM document
   * @returns {Object} Mobile API analysis
   * @private
   */
  analyzeMobileAPI(document) {
    const mobileAPI = {
      geolocation: false,
      deviceMotion: false,
      deviceOrientation: false,
      camera: false,
      notifications: false,
      vibration: false,
      battery: false,
      networkInformation: false,
      shareAPI: false,
      paymentRequest: false,
      detected: [],
      score: 0
    };

    try {
      // Analyze script content for mobile APIs
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      // Check for various mobile APIs
      const apiPatterns = {
        geolocation: /navigator\.geolocation|getCurrentPosition|watchPosition/i,
        deviceMotion: /DeviceMotionEvent|accelerometer/i,
        deviceOrientation: /DeviceOrientationEvent|orientation/i,
        camera: /getUserMedia|navigator\.camera|ImageCapture/i,
        notifications: /Notification|ServiceWorkerRegistration\.showNotification/i,
        vibration: /navigator\.vibrate|vibration/i,
        battery: /navigator\.battery|BatteryManager/i,
        networkInformation: /navigator\.connection|NetworkInformation/i,
        shareAPI: /navigator\.share|Web Share API/i,
        paymentRequest: /PaymentRequest|payment/i
      };

      Object.entries(apiPatterns).forEach(([api, pattern]) => {
        if (pattern.test(scriptContent)) {
          mobileAPI[api] = true;
          mobileAPI.detected.push(api);
        }
      });

      // Calculate mobile API score
      mobileAPI.score = Math.min(100, mobileAPI.detected.length * 15);

    } catch (error) {
      mobileAPI.error = error.message;
    }

    return mobileAPI;
  }

  /**
   * Analyze hardware access features
   * @param {Object} document - DOM document
   * @returns {Object} Hardware access analysis
   * @private
   */
  analyzeHardwareAccess(document) {
    const hardware = {
      touchEvents: false,
      pointerEvents: false,
      gestureEvents: false,
      mediaCapture: false,
      fileAccess: false,
      fullscreen: false,
      screenOrientation: false,
      wakeLock: false,
      detected: [],
      score: 0
    };

    try {
      // Check for touch event handlers
      const touchElements = document.querySelectorAll(
        '[ontouchstart], [ontouchend], [ontouchmove], [ontouchcancel]'
      );
      if (touchElements.length > 0) {
        hardware.touchEvents = true;
        hardware.detected.push('touch-events');
      }

      // Check for pointer events
      const pointerElements = document.querySelectorAll(
        '[onpointerdown], [onpointerup], [onpointermove]'
      );
      if (pointerElements.length > 0) {
        hardware.pointerEvents = true;
        hardware.detected.push('pointer-events');
      }

      // Analyze script content for hardware APIs
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      const hardwarePatterns = {
        gestureEvents: /gesturestart|gesturechange|gestureend/i,
        mediaCapture: /MediaRecorder|getUserMedia/i,
        fileAccess: /FileReader|File API|input\[type=["']file["']\]/i,
        fullscreen: /requestFullscreen|webkitRequestFullscreen/i,
        screenOrientation: /screen\.orientation|orientationchange/i,
        wakeLock: /navigator\.wakeLock|WakeLock/i
      };

      Object.entries(hardwarePatterns).forEach(([feature, pattern]) => {
        if (pattern.test(scriptContent)) {
          hardware[feature] = true;
          hardware.detected.push(feature);
        }
      });

      // Check for file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length > 0) {
        hardware.fileAccess = true;
        if (!hardware.detected.includes('file-access')) {
          hardware.detected.push('file-access');
        }
      }

      // Calculate hardware access score
      hardware.score = Math.min(100, hardware.detected.length * 12);

    } catch (error) {
      hardware.error = error.message;
    }

    return hardware;
  }

  /**
   * Analyze offline capabilities and caching
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
      webSQL: false,
      cacheAPI: false,
      offlineIndicators: [],
      score: 0
    };

    try {
      // Check for service worker registration
      const scripts = document.querySelectorAll('script');
      const scriptContent = Array.from(scripts)
        .map(script => script.textContent || script.innerHTML || '')
        .join(' ');

      // Service Worker patterns
      if (/serviceWorker\.register|navigator\.serviceWorker/i.test(scriptContent)) {
        offline.serviceWorker = true;
        offline.offlineIndicators.push('service-worker');
      }

      // App Cache (deprecated but still check)
      const htmlElement = document.querySelector('html');
      if (htmlElement?.hasAttribute('manifest')) {
        offline.appCache = true;
        offline.offlineIndicators.push('app-cache');
      }

      // Local Storage usage
      if (/localStorage\.|sessionStorage\./i.test(scriptContent)) {
        offline.localStorage = true;
        offline.offlineIndicators.push('local-storage');
      }

      // IndexedDB usage
      if (/indexedDB|IDBDatabase|IDBObjectStore/i.test(scriptContent)) {
        offline.indexedDB = true;
        offline.offlineIndicators.push('indexed-db');
      }

      // Web SQL (deprecated)
      if (/openDatabase|webkitDatabase/i.test(scriptContent)) {
        offline.webSQL = true;
        offline.offlineIndicators.push('web-sql');
      }

      // Cache API
      if (/caches\.|Cache API|cache\.put|cache\.match/i.test(scriptContent)) {
        offline.cacheAPI = true;
        offline.offlineIndicators.push('cache-api');
      }

      // Calculate offline capabilities score
      offline.score = 0;
      if (offline.serviceWorker) offline.score += 50;
      if (offline.cacheAPI) offline.score += 30;
      if (offline.localStorage) offline.score += 10;
      if (offline.indexedDB) offline.score += 10;

    } catch (error) {
      offline.error = error.message;
    }

    return offline;
  }

  /**
   * Analyze general mobile-friendliness indicators
   * @param {Object} document - DOM document
   * @returns {Object} Mobile-friendliness analysis
   * @private
   */
  analyzeMobileFriendliness(document) {
    const friendliness = {
      hasViewport: false,
      hasResponsiveImages: false,
      hasFlashContent: false,
      hasFixedWidth: false,
      hasSmallText: false,
      hasTouchTargets: false,
      mobileOptimized: false,
      score: 0,
      issues: [],
      strengths: []
    };

    try {
      // Check for viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        friendliness.hasViewport = true;
        friendliness.strengths.push('viewport-configured');
      } else {
        friendliness.issues.push('missing-viewport');
      }

      // Check for responsive images
      const responsiveImages = document.querySelectorAll('img[srcset], img[sizes], picture');
      if (responsiveImages.length > 0) {
        friendliness.hasResponsiveImages = true;
        friendliness.strengths.push('responsive-images');
      }

      // Check for Flash content (negative indicator)
      const flashElements = document.querySelectorAll('object[type*="flash"], embed[type*="flash"]');
      if (flashElements.length > 0) {
        friendliness.hasFlashContent = true;
        friendliness.issues.push('flash-content-detected');
      }

      // Check for fixed-width layouts
      const fixedWidthElements = document.querySelectorAll('[style*="width:"][style*="px"]');
      if (fixedWidthElements.length > 10) {
        friendliness.hasFixedWidth = true;
        friendliness.issues.push('fixed-width-layout');
      }

      // Check for touch-friendly targets
      const touchTargets = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
      if (touchTargets.length > 0) {
        friendliness.hasTouchTargets = true;
        friendliness.strengths.push('touch-targets-present');
      }

      // Calculate mobile-friendliness score
      let score = 0;
      if (friendliness.hasViewport) score += 30;
      if (friendliness.hasResponsiveImages) score += 20;
      if (friendliness.hasTouchTargets) score += 20;
      if (!friendliness.hasFlashContent) score += 15;
      if (!friendliness.hasFixedWidth) score += 15;

      friendliness.score = score;
      friendliness.mobileOptimized = score >= 70;

    } catch (error) {
      friendliness.error = error.message;
    }

    return friendliness;
  }

  /**
   * Check if viewport meta tag is responsive
   * @param {string} content - Viewport content attribute
   * @returns {boolean} Whether viewport is responsive
   * @private
   */
  isViewportResponsive(content) {
    if (!content) return false;
    
    const hasDeviceWidth = content.includes('width=device-width');
    const hasInitialScale = content.includes('initial-scale=1');
    const noUserScalable = content.includes('user-scalable=no');
    
    return hasDeviceWidth && hasInitialScale && !noUserScalable;
  }

  /**
   * Calculate overall mobile features score
   * @param {Object} results - Analysis results
   * @returns {number} Overall score (0-100)
   * @private
   */
  calculateMobileFeaturesScore(results) {
    let score = 0;
    let weights = 0;

    // Meta tags (25%)
    if (results.metaTags && !results.metaTags.error) {
      score += (results.metaTags.score || 0) * 0.25;
      weights += 0.25;
    }

    // App icons (20%)
    if (results.appIcons && !results.appIcons.error) {
      score += (results.appIcons.score || 0) * 0.2;
      weights += 0.2;
    }

    // Mobile API (15%)
    if (results.mobileAPI && !results.mobileAPI.error) {
      score += (results.mobileAPI.score || 0) * 0.15;
      weights += 0.15;
    }

    // Hardware access (15%)
    if (results.hardwareAccess && !results.hardwareAccess.error) {
      score += (results.hardwareAccess.score || 0) * 0.15;
      weights += 0.15;
    }

    // Offline capabilities (10%)
    if (results.offlineCapabilities && !results.offlineCapabilities.error) {
      score += (results.offlineCapabilities.score || 0) * 0.1;
      weights += 0.1;
    }

    // Mobile-friendliness (15%)
    if (results.mobileFriendliness && !results.mobileFriendliness.error) {
      score += (results.mobileFriendliness.score || 0) * 0.15;
      weights += 0.15;
    }

    return weights > 0 ? Math.round(score / weights) : 0;
  }

  /**
   * Identify mobile optimizations
   * @param {Object} results - Analysis results
   * @returns {Array} List of optimizations
   * @private
   */
  identifyOptimizations(results) {
    const optimizations = [];

    if (results.metaTags?.viewport?.isResponsive) {
      optimizations.push('responsive-viewport');
    }

    if (results.appIcons?.appleTouchIcon.length > 0) {
      optimizations.push('apple-touch-icons');
    }

    if (results.mobileAPI?.detected.length > 0) {
      optimizations.push('mobile-api-integration');
    }

    if (results.offlineCapabilities?.serviceWorker) {
      optimizations.push('service-worker-implemented');
    }

    if (results.hardwareAccess?.touchEvents) {
      optimizations.push('touch-optimized');
    }

    return optimizations;
  }

  /**
   * Identify mobile issues
   * @param {Object} results - Analysis results
   * @returns {Array} List of issues
   * @private
   */
  identifyIssues(results) {
    const issues = [];

    if (results.metaTags?.missing.includes('viewport')) {
      issues.push('missing-viewport-meta');
    }

    if (results.metaTags?.missing.includes('theme-color')) {
      issues.push('missing-theme-color');
    }

    if (!results.appIcons?.appleTouchIcon.length) {
      issues.push('missing-app-icons');
    }

    if (results.mobileFriendliness?.hasFlashContent) {
      issues.push('flash-content-present');
    }

    if (results.mobileFriendliness?.hasFixedWidth) {
      issues.push('fixed-width-layout');
    }

    if (!results.offlineCapabilities?.serviceWorker) {
      issues.push('no-offline-support');
    }

    return issues;
  }
}

export default MobileFeaturesDetector;
