/**
 * Links Analyzers Module
 * 
 * Exports all link analysis related analyzers
 */

// Modern BaseAnalyzer implementations
export { ModernAdvancedLinkAnalyzer } from './ModernAdvancedLinkAnalyzer.js';

// Legacy analyzers
export { AdvancedLinkAnalyzer } from './AdvancedLinkAnalyzer.js';
export { LinkDepthAnalyzer } from './LinkDepthAnalyzer.js';
export { OrphanedPagesAnalyzer } from './OrphanedPagesAnalyzer.js';

// Default export for backward compatibility
export { ModernAdvancedLinkAnalyzer as default } from './ModernAdvancedLinkAnalyzer.js';
