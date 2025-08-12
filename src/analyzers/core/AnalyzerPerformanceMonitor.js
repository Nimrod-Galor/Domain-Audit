/**
 * Analyzer Performance Monitor
 * 
 * Tracks performance metrics for analyzers in the combined approach
 */
export class AnalyzerPerformanceMonitor {
  constructor(analyzerName) {
    this.analyzerName = analyzerName;
    this.operations = new Map();
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalTime: 0,
      averageTime: 0,
      operationHistory: []
    };
  }

  /**
   * Start tracking an operation
   * @param {string} operationType - Type of operation (analysis, ai_enhancement, etc.)
   */
  startOperation(operationType) {
    const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.operations.set(operationId, {
      type: operationType,
      startTime: Date.now(),
      status: 'running'
    });
    return operationId;
  }

  /**
   * End tracking an operation
   * @param {string} operationId - Operation ID from startOperation
   * @param {number} [duration] - Duration in milliseconds (calculated if not provided)
   * @param {Error} [error] - Error if operation failed
   */
  endOperation(operationId, duration = null, error = null) {
    const operation = this.operations.get(operationId);
    if (!operation) return;

    const actualDuration = duration || (Date.now() - operation.startTime);
    const success = !error;

    // Update operation
    operation.endTime = Date.now();
    operation.duration = actualDuration;
    operation.status = success ? 'completed' : 'failed';
    operation.error = error?.message;

    // Update metrics
    this.metrics.totalOperations++;
    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }
    
    this.metrics.totalTime += actualDuration;
    this.metrics.averageTime = this.metrics.totalTime / this.metrics.totalOperations;

    // Add to history
    this.metrics.operationHistory.push({
      type: operation.type,
      duration: actualDuration,
      success,
      timestamp: new Date().toISOString(),
      error: error?.message
    });

    // Keep only last 100 operations in history
    if (this.metrics.operationHistory.length > 100) {
      this.metrics.operationHistory = this.metrics.operationHistory.slice(-100);
    }

    // Clean up active operation
    this.operations.delete(operationId);
  }

  /**
   * Get current metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      analyzer: this.analyzerName,
      timestamp: new Date().toISOString(),
      metrics: {
        ...this.metrics,
        successRate: this.metrics.totalOperations > 0 
          ? (this.metrics.successfulOperations / this.metrics.totalOperations) * 100 
          : 0,
        activeOperations: this.operations.size
      },
      recentOperations: this.metrics.operationHistory.slice(-10) // Last 10 operations
    };
  }

  /**
   * Get start time for an operation type
   * @param {string} operationType - Type of operation
   * @returns {number} Start time or current time if not found
   */
  getStartTime(operationType) {
    for (const [id, operation] of this.operations) {
      if (operation.type === operationType) {
        return operation.startTime;
      }
    }
    return Date.now();
  }

  /**
   * Reset metrics
   */
  reset() {
    this.operations.clear();
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalTime: 0,
      averageTime: 0,
      operationHistory: []
    };
  }
}
