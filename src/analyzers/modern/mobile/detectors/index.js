/**
 * Mobile Analyzer Detectors - GPT-5 Style Modular Architecture
 * 
 * Core detection components for mobile analysis with specialized pattern recognition
 */

// Import all detector modules
export { ResponsiveDesignDetector } from './responsive-design-detector.js';
export { MobileFeaturesDetector } from './mobile-features-detector.js';
export { TouchOptimizationDetector } from './touch-optimization-detector.js';
export { MobileNavigationDetector } from './mobile-navigation-detector.js';
export { ViewportDetector } from './viewport-detector.js';
export { PWADetector } from './pwa-detector.js';
export { MobilePerformanceDetector } from './mobile-performance-detector.js';

// Detector registry for dynamic loading
export const MOBILE_DETECTORS = {
  responsive: 'ResponsiveDesignDetector',
  features: 'MobileFeaturesDetector',
  touch: 'TouchOptimizationDetector',
  navigation: 'MobileNavigationDetector',
  viewport: 'ViewportDetector',
  pwa: 'PWADetector',
  performance: 'MobilePerformanceDetector'
};

// Detection patterns and constants
export const MOBILE_PATTERNS = {
  RESPONSIVE_INDICATORS: [
    '[class*="responsive"]',
    '[class*="mobile"]',
    '[class*="tablet"]',
    '[class*="desktop"]',
    '[class*="fluid"]',
    '[class*="adaptive"]'
  ],
  
  MOBILE_META_TAGS: [
    'viewport',
    'apple-mobile-web-app-capable',
    'apple-mobile-web-app-status-bar-style',
    'apple-mobile-web-app-title',
    'mobile-web-app-capable',
    'theme-color',
    'msapplication-TileColor'
  ],
  
  TOUCH_INDICATORS: [
    '[onclick]',
    '[ontouchstart]',
    '[ontouchend]',
    '[ontouchmove]',
    '[class*="touch"]',
    '[class*="tap"]',
    'button',
    'a[href]',
    'input[type="button"]',
    'input[type="submit"]'
  ],
  
  PWA_INDICATORS: [
    'link[rel="manifest"]',
    'script[src*="service-worker"]',
    'script[src*="sw.js"]',
    'meta[name="theme-color"]',
    'link[rel="apple-touch-icon"]'
  ]
};
