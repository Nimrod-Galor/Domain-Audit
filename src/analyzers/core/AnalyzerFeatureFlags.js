/**
 * Analyzer Feature Flags
 * 
 * Manages feature flags for analyzers in the combined approach
 */
export class AnalyzerFeatureFlags {
  constructor(initialFlags = {}) {
    this.flags = {
      // Default feature flags
      enableAdvancedHeuristics: true,
      enableAIEnhancement: true,
      enablePerformanceOptimization: true,
      enableDetailedLogging: false,
      enableExperimentalFeatures: false,
      
      // Override with provided flags
      ...initialFlags
    };
  }

  /**
   * Check if a feature is enabled
   * @param {string} flagName - Feature flag name
   * @returns {boolean} True if enabled
   */
  isEnabled(flagName) {
    return this.flags[flagName] === true;
  }

  /**
   * Enable a feature
   * @param {string} flagName - Feature flag name
   */
  enable(flagName) {
    this.flags[flagName] = true;
  }

  /**
   * Disable a feature
   * @param {string} flagName - Feature flag name
   */
  disable(flagName) {
    this.flags[flagName] = false;
  }

  /**
   * Toggle a feature
   * @param {string} flagName - Feature flag name
   */
  toggle(flagName) {
    this.flags[flagName] = !this.flags[flagName];
  }

  /**
   * Set multiple flags
   * @param {Object} flags - Object with flag names and values
   */
  setFlags(flags) {
    this.flags = {
      ...this.flags,
      ...flags
    };
  }

  /**
   * Get all flags
   * @returns {Object} All feature flags
   */
  getFlags() {
    return { ...this.flags };
  }

  /**
   * Get enabled flags
   * @returns {Array} Array of enabled flag names
   */
  getEnabledFlags() {
    return Object.entries(this.flags)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => name);
  }

  /**
   * Reset to default flags
   */
  reset() {
    this.flags = {
      enableAdvancedHeuristics: true,
      enableAIEnhancement: true,
      enablePerformanceOptimization: true,
      enableDetailedLogging: false,
      enableExperimentalFeatures: false
    };
  }
}
