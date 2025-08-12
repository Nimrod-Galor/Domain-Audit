/**
 * UX Performance Monitor
 * 
 * Monitors and tracks performance metrics for UX analysis operations.
 * Provides insights into analysis speed, resource usage, and optimization opportunities.
 */

export class UXPerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableDetailedMetrics: options.enableDetailedMetrics || false,
      enableMemoryTracking: options.enableMemoryTracking || false,
      enableComponentBreakdown: options.enableComponentBreakdown || false,
      sampleRate: options.sampleRate || 1.0, // Sample rate for performance tracking
      maxHistorySize: options.maxHistorySize || 1000,
      ...options
    };

    this.metrics = {
      sessions: new Map(),
      operations: new Map(),
      components: new Map(),
      aggregated: {
        totalAnalyses: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        memoryUsage: [],
        errors: 0
      }
    };

    this.activeTimers = new Map();
    this.performanceHistory = [];
    this.thresholds = this._initializePerformanceThresholds();
  }

  /**
   * Initialize performance thresholds for different operations
   */
  _initializePerformanceThresholds() {
    return {
      // Analysis operation thresholds (in milliseconds)
      operations: {
        fullAnalysis: { warning: 5000, critical: 10000 },
        heuristicAnalysis: { warning: 2000, critical: 4000 },
        detectionAnalysis: { warning: 1000, critical: 2000 },
        scoring: { warning: 500, critical: 1000 },
        aiEnhancement: { warning: 3000, critical: 6000 }
      },

      // Component-specific thresholds
      components: {
        detectors: { warning: 500, critical: 1000 },
        heuristics: { warning: 800, critical: 1500 },
        scoring: { warning: 200, critical: 500 },
        validation: { warning: 100, critical: 300 }
      },

      // Memory usage thresholds (in MB)
      memory: {
        warning: 100,
        critical: 200
      },

      // Concurrent operation limits
      concurrency: {
        maxConcurrentAnalyses: 5,
        maxConcurrentDetections: 10
      }
    };
  }

  /**
   * Start performance monitoring for an operation
   * @param {string} operationType - Type of operation being monitored
   * @param {string} identifier - Unique identifier for this operation instance
   * @param {Object} metadata - Additional metadata about the operation
   * @returns {string} Session ID for tracking
   */
  startOperation(operationType, identifier = null, metadata = {}) {
    const sessionId = identifier || this._generateSessionId(operationType);
    const startTime = performance.now();
    
    const session = {
      sessionId,
      operationType,
      startTime,
      startMemory: this._getMemoryUsage(),
      metadata: {
        url: metadata.url,
        userAgent: metadata.userAgent,
        timestamp: new Date().toISOString(),
        ...metadata
      },
      components: new Map(),
      completed: false,
      error: null
    };

    this.metrics.sessions.set(sessionId, session);
    this.activeTimers.set(sessionId, startTime);

    if (this.options.enableDetailedMetrics) {
      this._logOperation('start', sessionId, session);
    }

    return sessionId;
  }

  /**
   * Record timing for a component within an operation
   * @param {string} sessionId - Session ID from startOperation
   * @param {string} componentName - Name of the component being timed
   * @param {Function} operation - Function to execute and time
   * @returns {Promise<*>} Result of the operation
   */
  async timeComponent(sessionId, componentName, operation) {
    const session = this.metrics.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const componentStart = performance.now();
    let result, error = null;

    try {
      result = await operation();
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const componentEnd = performance.now();
      const duration = componentEnd - componentStart;

      session.components.set(componentName, {
        name: componentName,
        duration,
        startTime: componentStart,
        endTime: componentEnd,
        error: error ? error.message : null,
        memoryUsage: this._getMemoryUsage()
      });

      this._recordComponentMetrics(componentName, duration, error);

      if (this.options.enableComponentBreakdown) {
        this._logComponent(sessionId, componentName, duration, error);
      }
    }

    return result;
  }

  /**
   * End performance monitoring for an operation
   * @param {string} sessionId - Session ID from startOperation
   * @param {Object} results - Results of the operation (optional)
   * @param {Error} error - Error that occurred (optional)
   * @returns {Object} Performance summary
   */
  endOperation(sessionId, results = null, error = null) {
    const session = this.metrics.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const endTime = performance.now();
    const totalDuration = endTime - session.startTime;
    const endMemory = this._getMemoryUsage();

    // Update session
    session.endTime = endTime;
    session.totalDuration = totalDuration;
    session.endMemory = endMemory;
    session.memoryDelta = endMemory - session.startMemory;
    session.completed = true;
    session.error = error ? error.message : null;
    session.results = results;

    // Clean up active timer
    this.activeTimers.delete(sessionId);

    // Record aggregated metrics
    this._recordOperationMetrics(session);

    // Add to performance history
    this._addToHistory(session);

    // Check for performance issues
    const performanceIssues = this._analyzePerformance(session);

    if (this.options.enableDetailedMetrics) {
      this._logOperation('end', sessionId, session);
    }

    return this._createPerformanceSummary(session, performanceIssues);
  }

  /**
   * Get current performance metrics
   * @returns {Object} Current performance state
   */
  getCurrentMetrics() {
    return {
      active: {
        sessions: this.activeTimers.size,
        operations: Array.from(this.metrics.sessions.values())
          .filter(s => !s.completed)
          .map(s => ({
            sessionId: s.sessionId,
            operationType: s.operationType,
            duration: performance.now() - s.startTime,
            url: s.metadata.url
          }))
      },
      aggregated: { ...this.metrics.aggregated },
      memory: {
        current: this._getMemoryUsage(),
        history: this.metrics.aggregated.memoryUsage.slice(-10)
      },
      thresholds: this.thresholds,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get performance summary for a specific operation type
   * @param {string} operationType - Type of operation to analyze
   * @param {number} timeRange - Time range in milliseconds (default: 1 hour)
   * @returns {Object} Performance summary
   */
  getOperationSummary(operationType, timeRange = 3600000) {
    const cutoffTime = Date.now() - timeRange;
    const recentSessions = this.performanceHistory.filter(session => 
      session.operationType === operationType &&
      new Date(session.metadata.timestamp).getTime() > cutoffTime
    );

    if (recentSessions.length === 0) {
      return { operationType, sessionCount: 0, message: 'No recent data available' };
    }

    const durations = recentSessions.map(s => s.totalDuration);
    const memoryDeltas = recentSessions.map(s => s.memoryDelta || 0);

    return {
      operationType,
      sessionCount: recentSessions.length,
      timing: {
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        median: this._calculateMedian(durations),
        p95: this._calculatePercentile(durations, 95)
      },
      memory: {
        averageDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
        maxDelta: Math.max(...memoryDeltas),
        minDelta: Math.min(...memoryDeltas)
      },
      errors: recentSessions.filter(s => s.error).length,
      successRate: (recentSessions.filter(s => !s.error).length / recentSessions.length) * 100,
      timeRange: `${timeRange / 1000}s`
    };
  }

  /**
   * Get component performance breakdown
   * @param {string} componentName - Name of component to analyze (optional)
   * @returns {Object} Component performance data
   */
  getComponentBreakdown(componentName = null) {
    const componentMetrics = componentName 
      ? new Map([[componentName, this.metrics.components.get(componentName)]])
      : this.metrics.components;

    const breakdown = {};

    for (const [name, metrics] of componentMetrics) {
      if (metrics && metrics.durations.length > 0) {
        breakdown[name] = {
          calls: metrics.calls,
          errors: metrics.errors,
          timing: {
            average: metrics.totalDuration / metrics.calls,
            min: Math.min(...metrics.durations),
            max: Math.max(...metrics.durations),
            total: metrics.totalDuration
          },
          errorRate: (metrics.errors / metrics.calls) * 100
        };
      }
    }

    return breakdown;
  }

  /**
   * Check if system is under performance stress
   * @returns {Object} Stress analysis
   */
  analyzeSystemStress() {
    const current = this.getCurrentMetrics();
    const recentErrors = this.performanceHistory
      .filter(s => s.error && Date.now() - new Date(s.metadata.timestamp).getTime() < 300000) // 5 minutes
      .length;

    const stress = {
      level: 'normal',
      factors: [],
      recommendations: []
    };

    // Check concurrent operations
    if (current.active.sessions > this.thresholds.concurrency.maxConcurrentAnalyses) {
      stress.level = 'high';
      stress.factors.push('High concurrent operations');
      stress.recommendations.push('Consider queuing or limiting concurrent analyses');
    }

    // Check memory usage
    if (current.memory.current > this.thresholds.memory.critical) {
      stress.level = 'critical';
      stress.factors.push('Critical memory usage');
      stress.recommendations.push('Immediate memory cleanup required');
    } else if (current.memory.current > this.thresholds.memory.warning) {
      stress.level = stress.level === 'normal' ? 'moderate' : stress.level;
      stress.factors.push('Elevated memory usage');
      stress.recommendations.push('Consider memory optimization');
    }

    // Check error rate
    if (recentErrors > 5) {
      stress.level = 'high';
      stress.factors.push('High error rate');
      stress.recommendations.push('Investigate error patterns');
    }

    return stress;
  }

  /**
   * Generate performance optimization recommendations
   * @returns {Array} Array of optimization recommendations
   */
  generateOptimizationRecommendations() {
    const recommendations = [];
    const componentBreakdown = this.getComponentBreakdown();
    const currentMetrics = this.getCurrentMetrics();

    // Analyze slow components
    Object.entries(componentBreakdown).forEach(([componentName, metrics]) => {
      const threshold = this.thresholds.components[componentName] || this.thresholds.components.default;
      
      if (metrics.timing.average > threshold?.warning) {
        recommendations.push({
          type: 'performance',
          priority: metrics.timing.average > threshold.critical ? 'high' : 'medium',
          component: componentName,
          issue: 'Slow component execution',
          recommendation: `Optimize ${componentName} - average time ${metrics.timing.average.toFixed(2)}ms`,
          data: metrics
        });
      }
    });

    // Memory recommendations
    if (currentMetrics.memory.current > this.thresholds.memory.warning) {
      recommendations.push({
        type: 'memory',
        priority: currentMetrics.memory.current > this.thresholds.memory.critical ? 'critical' : 'medium',
        issue: 'High memory usage',
        recommendation: 'Implement memory cleanup and optimize data structures',
        currentUsage: currentMetrics.memory.current
      });
    }

    // Concurrency recommendations
    if (currentMetrics.active.sessions > 3) {
      recommendations.push({
        type: 'concurrency',
        priority: 'low',
        issue: 'Multiple concurrent operations',
        recommendation: 'Consider implementing operation queuing for better resource management',
        activeOperations: currentMetrics.active.sessions
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Clear performance history and reset metrics
   * @param {boolean} keepAggregated - Whether to keep aggregated metrics
   */
  clearMetrics(keepAggregated = true) {
    this.metrics.sessions.clear();
    this.metrics.components.clear();
    this.performanceHistory = [];
    this.activeTimers.clear();

    if (!keepAggregated) {
      this.metrics.aggregated = {
        totalAnalyses: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        memoryUsage: [],
        errors: 0
      };
    }
  }

  // Private helper methods

  /**
   * Generate unique session ID
   */
  _generateSessionId(operationType) {
    return `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current memory usage (simplified)
   */
  _getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0; // Fallback for environments without memory API
  }

  /**
   * Record metrics for operation completion
   */
  _recordOperationMetrics(session) {
    const duration = session.totalDuration;
    
    this.metrics.aggregated.totalAnalyses++;
    this.metrics.aggregated.totalTime += duration;
    this.metrics.aggregated.averageTime = this.metrics.aggregated.totalTime / this.metrics.aggregated.totalAnalyses;
    this.metrics.aggregated.minTime = Math.min(this.metrics.aggregated.minTime, duration);
    this.metrics.aggregated.maxTime = Math.max(this.metrics.aggregated.maxTime, duration);
    
    if (session.error) {
      this.metrics.aggregated.errors++;
    }

    if (this.options.enableMemoryTracking && session.endMemory) {
      this.metrics.aggregated.memoryUsage.push({
        timestamp: session.metadata.timestamp,
        usage: session.endMemory,
        delta: session.memoryDelta
      });

      // Keep only recent memory data
      if (this.metrics.aggregated.memoryUsage.length > this.options.maxHistorySize) {
        this.metrics.aggregated.memoryUsage = this.metrics.aggregated.memoryUsage.slice(-this.options.maxHistorySize);
      }
    }
  }

  /**
   * Record metrics for component execution
   */
  _recordComponentMetrics(componentName, duration, error) {
    if (!this.metrics.components.has(componentName)) {
      this.metrics.components.set(componentName, {
        calls: 0,
        errors: 0,
        totalDuration: 0,
        durations: []
      });
    }

    const metrics = this.metrics.components.get(componentName);
    metrics.calls++;
    metrics.totalDuration += duration;
    metrics.durations.push(duration);
    
    if (error) {
      metrics.errors++;
    }

    // Keep only recent durations
    if (metrics.durations.length > 100) {
      metrics.durations = metrics.durations.slice(-100);
    }
  }

  /**
   * Add session to performance history
   */
  _addToHistory(session) {
    this.performanceHistory.push({
      sessionId: session.sessionId,
      operationType: session.operationType,
      totalDuration: session.totalDuration,
      memoryDelta: session.memoryDelta,
      error: session.error,
      metadata: session.metadata
    });

    // Maintain history size limit
    if (this.performanceHistory.length > this.options.maxHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-this.options.maxHistorySize);
    }
  }

  /**
   * Analyze performance for issues
   */
  _analyzePerformance(session) {
    const issues = [];
    const duration = session.totalDuration;
    const operationThreshold = this.thresholds.operations[session.operationType];

    if (operationThreshold) {
      if (duration > operationThreshold.critical) {
        issues.push({
          severity: 'critical',
          type: 'slow_operation',
          message: `Operation took ${duration.toFixed(2)}ms (critical threshold: ${operationThreshold.critical}ms)`
        });
      } else if (duration > operationThreshold.warning) {
        issues.push({
          severity: 'warning',
          type: 'slow_operation',
          message: `Operation took ${duration.toFixed(2)}ms (warning threshold: ${operationThreshold.warning}ms)`
        });
      }
    }

    if (session.memoryDelta && session.memoryDelta > this.thresholds.memory.warning) {
      issues.push({
        severity: session.memoryDelta > this.thresholds.memory.critical ? 'critical' : 'warning',
        type: 'memory_usage',
        message: `High memory delta: ${session.memoryDelta}MB`
      });
    }

    return issues;
  }

  /**
   * Create performance summary
   */
  _createPerformanceSummary(session, issues) {
    return {
      sessionId: session.sessionId,
      operationType: session.operationType,
      duration: session.totalDuration,
      memoryDelta: session.memoryDelta,
      componentCount: session.components.size,
      issues,
      success: !session.error,
      timestamp: session.metadata.timestamp
    };
  }

  /**
   * Calculate median of array
   */
  _calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate percentile
   */
  _calculatePercentile(arr, percentile) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Log operation (placeholder for actual logging)
   */
  _logOperation(type, sessionId, session) {
    if (this.options.enableDetailedMetrics) {
      console.log(`[UX Performance] ${type.toUpperCase()} - ${session.operationType} (${sessionId})`);
    }
  }

  /**
   * Log component (placeholder for actual logging)
   */
  _logComponent(sessionId, componentName, duration, error) {
    if (this.options.enableComponentBreakdown) {
      const status = error ? 'ERROR' : 'SUCCESS';
      console.log(`[UX Performance] Component ${componentName} - ${duration.toFixed(2)}ms (${status})`);
    }
  }
}
