/**
 * Main API Router
 * Handles API versioning and global API middleware
 */

import express from "express";
import cors from "cors";
import v1Routes from "./v1/index.js";

const router = express.Router();

// API-specific CORS configuration
const apiCorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins for API (can be restricted in production)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

// Apply CORS for API routes
router.use(cors(apiCorsOptions));

// API request logging middleware
router.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log API request
  console.log(`[API] ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// JSON parsing middleware with error handling
router.use(express.json({
  limit: '10mb',
  type: 'application/json'
}));

// Handle JSON parsing errors
router.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: "InvalidJSON",
      message: "Request body contains invalid JSON"
    });
  }
  next();
});

// API root endpoint
router.get("/", (req, res) => {
  res.json({
    name: "SiteScope Audit API",
    description: "RESTful API for website auditing and analysis",
    versions: {
      v1: {
        status: "stable",
        endpoint: `${req.protocol}://${req.get('host')}/api/v1`,
        documentation: `${req.protocol}://${req.get('host')}/api/v1/docs`
      }
    },
    support: {
      email: "api-support@sitescope.com",
      documentation: `${req.protocol}://${req.get('host')}/docs/api`
    }
  });
});

// Mount v1 routes
router.use("/v1", v1Routes);

// Handle 404 for API routes
router.use("*", (req, res) => {
  res.status(404).json({
    error: "NotFound",
    message: "API endpoint not found",
    available_versions: ["v1"],
    documentation: `${req.protocol}://${req.get('host')}/api/v1`
  });
});

// Global API error handler
router.use((error, req, res, next) => {
  console.error('[API Error]:', error);
  
  res.status(error.status || 500).json({
    error: error.name || "ServerError",
    message: error.message || "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

export default router;
