/**
 * Health Check and Monitoring Routes
 * Provides endpoints for system health monitoring
 */

import express from 'express';
import { healthCheckHandler, metricsHandler } from '../lib/monitoring.js';

const router = express.Router();

/**
 * Health check endpoint
 * Returns system health status
 */
router.get('/health', healthCheckHandler);

/**
 * Detailed health check endpoint
 * Returns comprehensive system health information
 */
router.get('/health/detailed', healthCheckHandler);

/**
 * System metrics endpoint
 * Returns system metrics and statistics
 */
router.get('/metrics', metricsHandler);

/**
 * Simple ping endpoint
 * Basic availability check
 */
router.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default router;
