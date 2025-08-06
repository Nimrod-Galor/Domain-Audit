/**
 * API v1 Main Router
 * Handles API versioning and route organization
 */

import express from "express";
import auditRoutes from "./audits.js";

const router = express.Router();

// API Health Check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API Information
router.get("/", (req, res) => {
  res.json({
    name: "SiteScope Audit API",
    version: "1.0",
    description: "RESTful API for website auditing and analysis",
    documentation: `${req.protocol}://${req.get('host')}/api/v1/docs`,
    endpoints: {
      audits: `${req.protocol}://${req.get('host')}/api/v1/audits`,
      health: `${req.protocol}://${req.get('host')}/api/v1/health`
    },
    authentication: {
      type: "API Key",
      header: "x-api-key",
      query_param: "api_key",
      note: "API access requires Professional or Enterprise tier"
    },
    rate_limits: {
      professional: "1,000 calls/month",
      enterprise: "10,000 calls/month"
    }
  });
});

// Mount audit routes
router.use(auditRoutes);

export default router;
