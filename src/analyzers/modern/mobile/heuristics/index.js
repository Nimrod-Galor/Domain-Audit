/**
 * Mobile Analyzer Heuristics - Claude AI Style Advanced Analysis
 * 
 * Sophisticated pattern analysis and mobile UX evaluation components
 */

// Import all heuristic modules
export { MobileUXAnalyzer } from './mobile-ux-analyzer.js';
export { ResponsivenessAnalyzer } from './responsiveness-analyzer.js';
export { MobileAccessibilityAnalyzer } from './mobile-accessibility-analyzer.js';
export { MobileSEOAnalyzer } from './mobile-seo-analyzer.js';
export { CrossDeviceAnalyzer } from './cross-device-analyzer.js';
export { MobileSecurityAnalyzer } from './mobile-security-analyzer.js';

// Heuristic registry for dynamic loading
export const MOBILE_HEURISTICS = {
  ux: 'MobileUXAnalyzer',
  responsiveness: 'ResponsivenessAnalyzer',
  accessibility: 'MobileAccessibilityAnalyzer',
  seo: 'MobileSEOAnalyzer',
  crossDevice: 'CrossDeviceAnalyzer',
  security: 'MobileSecurityAnalyzer'
};

// Analysis patterns and heuristic rules
export const MOBILE_HEURISTIC_PATTERNS = {
  UX_PATTERNS: {
    THUMB_ZONE_NAVIGATION: 'bottom-navigation-accessible',
    SWIPE_GESTURES: 'swipe-friendly-interface',
    TOUCH_FEEDBACK: 'visual-touch-feedback',
    LOADING_STATES: 'progressive-loading',
    ERROR_HANDLING: 'graceful-error-states'
  },

  ACCESSIBILITY_PATTERNS: {
    TOUCH_TARGET_SIZE: 'minimum-44px-targets',
    FOCUS_MANAGEMENT: 'keyboard-navigation',
    SCREEN_READER: 'semantic-markup',
    COLOR_CONTRAST: 'wcag-mobile-contrast',
    ZOOM_SUPPORT: 'scalable-content'
  },

  PERFORMANCE_PATTERNS: {
    RESOURCE_OPTIMIZATION: 'mobile-first-loading',
    NETWORK_EFFICIENCY: 'minimal-requests',
    BATTERY_CONSERVATION: 'cpu-efficient-operations',
    CACHE_STRATEGY: 'offline-first-approach'
  },

  RESPONSIVE_PATTERNS: {
    MOBILE_FIRST: 'progressive-enhancement',
    FLUID_LAYOUT: 'flexible-grid-system',
    ADAPTIVE_CONTENT: 'context-aware-display',
    BREAKPOINT_STRATEGY: 'content-based-breakpoints'
  }
};

// Heuristic evaluation criteria
export const EVALUATION_CRITERIA = {
  UX_QUALITY: {
    EXCELLENT: { min: 90, factors: ['intuitive', 'responsive', 'accessible', 'performant'] },
    GOOD: { min: 75, factors: ['functional', 'usable', 'mostly-accessible'] },
    FAIR: { min: 60, factors: ['basic-functionality', 'some-issues'] },
    POOR: { min: 0, factors: ['major-issues', 'poor-usability'] }
  },

  ACCESSIBILITY_COMPLIANCE: {
    AAA: { min: 95, standards: ['WCAG-AAA', 'mobile-accessibility'] },
    AA: { min: 80, standards: ['WCAG-AA', 'basic-mobile-access'] },
    A: { min: 60, standards: ['WCAG-A', 'minimal-compliance'] },
    NON_COMPLIANT: { min: 0, standards: ['no-standards'] }
  },

  PERFORMANCE_RATING: {
    FAST: { min: 85, metrics: ['fcp < 1.8s', 'lcp < 2.5s', 'cls < 0.1'] },
    MODERATE: { min: 65, metrics: ['fcp < 3s', 'lcp < 4s', 'cls < 0.25'] },
    SLOW: { min: 0, metrics: ['poor-core-vitals'] }
  }
};
