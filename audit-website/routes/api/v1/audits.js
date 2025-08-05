/**
 * API v1 Audit Routes
 * RESTful API endpoints for audit management
 */

import express from "express";
import { apiAuth, rateLimiter, apiErrorHandler } from "../../../middleware/apiAuth.js";
import { auditExecutor } from "../../../lib/audit-executor.js";
import { tierService } from "../../../services/tierService.js";
import { query } from "../../../models/database.js";

const router = express.Router();

/**
 * POST /api/v1/audits
 * Create a new audit via API
 */
router.post("/audits", apiAuth, rateLimiter, async (req, res) => {
  const { url, type = "full", webhook_url = null, options = {} } = req.body;

  // Validate required fields
  if (!url) {
    return res.status(400).json({ 
      error: "ValidationError",
      message: "URL is required",
      details: "Please provide a valid URL to audit"
    });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({
      error: "ValidationError", 
      message: "Invalid URL format",
      details: "Please provide a valid HTTP/HTTPS URL"
    });
  }

  try {
    const userId = req.user.id;
    const limits = await tierService.getUserTierLimits(userId);

    // Check if user can perform audit
    const requestedPages = options.max_pages || limits.max_internal_pages;
    const requestedExternalLinks = options.max_external_links || limits.max_external_links;
    
    const canAudit = await tierService.canPerformAudit(userId, requestedPages, requestedExternalLinks);
    if (!canAudit.allowed) {
      return res.status(429).json({ 
        error: "QuotaExceeded",
        message: canAudit.reason,
        limits: {
          audits_per_month: limits.audits_per_month,
          max_internal_pages: limits.max_internal_pages,
          max_external_links: limits.max_external_links
        }
      });
    }

    // Generate unique session ID for this audit
    const sessionId = Date.now() + "-api-" + Math.random().toString(36).substr(2, 9);

    // Start audit asynchronously
    const auditPromise = auditExecutor.executeAudit(
      url, 
      Math.min(requestedPages, limits.max_internal_pages), 
      false, // not simple report for API users
      sessionId, 
      {
        isRegistered: true,
        userId: userId,
        maxExternalLinks: Math.min(requestedExternalLinks, limits.max_external_links),
        apiCall: true,
        tier: limits.tier
      }
    );

    // Handle audit completion
    auditPromise
      .then(async (result) => {
        try {
          // Record usage after successful audit
          await tierService.recordAuditUsage(
            userId,
            result.stateData?.visited?.length || 0,
            Object.keys(result.stateData?.externalLinks || {}).length
          );

          // Update audit record with API flag
          await query(`
            UPDATE audits SET 
              audit_type = 'api',
              user_id = $1,
              user_tier = $2
            WHERE session_id = $3
          `, [userId, limits.tier, sessionId]);

          // Send webhook notification if provided
          if (webhook_url) {
            try {
              const webhookResponse = await fetch(webhook_url, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "User-Agent": "SiteScope-API/1.0"
                },
                body: JSON.stringify({
                  event: "audit.completed",
                  session_id: sessionId,
                  status: "completed",
                  url: url,
                  score: result.stateData?.overallScore || null,
                  pages_analyzed: result.stateData?.visited?.length || 0,
                  external_links_checked: Object.keys(result.stateData?.externalLinks || {}).length,
                  completed_at: new Date().toISOString(),
                  result_url: `${req.protocol}://${req.get('host')}/api/v1/audits/${sessionId}/result`
                }),
                timeout: 10000 // 10 second timeout
              });

              if (!webhookResponse.ok) {
                console.warn(`Webhook delivery failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
              }
            } catch (webhookError) {
              console.error("Webhook delivery error:", webhookError.message);
            }
          }
        } catch (error) {
          console.error("Post-audit processing error:", error);
        }
      })
      .catch((error) => {
        console.error("Audit execution error:", error);
        
        // Update audit record with error status
        query(`
          UPDATE audits SET 
            status = 'failed',
            error_message = $1
          WHERE session_id = $2
        `, [error.message, sessionId]).catch(console.error);
      });

    // Return immediate response with session info
    res.status(202).json({
      session_id: sessionId,
      status: "started",
      url: url,
      type: type,
      estimated_duration: "5-15 minutes",
      webhook_url: webhook_url || null,
      endpoints: {
        status: `${req.protocol}://${req.get('host')}/api/v1/audits/${sessionId}/status`,
        result: `${req.protocol}://${req.get('host')}/api/v1/audits/${sessionId}/result`
      },
      limits_applied: {
        max_internal_pages: Math.min(requestedPages, limits.max_internal_pages),
        max_external_links: Math.min(requestedExternalLinks, limits.max_external_links)
      }
    });

  } catch (error) {
    console.error("API audit creation error:", error);
    res.status(500).json({ 
      error: "ServerError",
      message: "Failed to start audit",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/v1/audits/:sessionId/status
 * Get audit status and progress
 */
router.get("/audits/:sessionId/status", apiAuth, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await query(`
      SELECT 
        session_id,
        status,
        progress,
        url,
        created_at,
        updated_at,
        error_message
      FROM audits 
      WHERE session_id = $1 AND user_id = $2
    `, [sessionId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "NotFound",
        message: "Audit not found",
        details: "The audit session was not found or you don't have access to it"
      });
    }

    const audit = result.rows[0];
    
    res.json({
      session_id: audit.session_id,
      status: audit.status,
      progress: audit.progress || 0,
      url: audit.url,
      created_at: audit.created_at,
      updated_at: audit.updated_at,
      error_message: audit.error_message || null,
      result_available: audit.status === 'completed',
      result_url: audit.status === 'completed' 
        ? `${req.protocol}://${req.get('host')}/api/v1/audits/${sessionId}/result`
        : null
    });

  } catch (error) {
    console.error("API status check error:", error);
    res.status(500).json({ 
      error: "ServerError",
      message: "Failed to get audit status"
    });
  }
});

/**
 * GET /api/v1/audits/:sessionId/result
 * Get completed audit results
 */
router.get("/audits/:sessionId/result", apiAuth, async (req, res) => {
  const { sessionId } = req.params;
  const { format = 'json' } = req.query;

  try {
    const result = await query(`
      SELECT * FROM audits 
      WHERE session_id = $1 AND user_id = $2 AND status = 'completed'
    `, [sessionId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "NotFound",
        message: "Audit not found or not completed",
        details: "The audit session was not found, not completed, or you don't have access to it"
      });
    }

    const audit = result.rows[0];
    let reportData;

    try {
      reportData = typeof audit.report_data === 'string' 
        ? JSON.parse(audit.report_data) 
        : audit.report_data;
    } catch (parseError) {
      console.error("Failed to parse audit report data:", parseError);
      return res.status(500).json({
        error: "DataError",
        message: "Failed to parse audit results"
      });
    }

    // Return structured API response
    const apiResponse = {
      session_id: audit.session_id,
      status: "completed",
      url: audit.url,
      score: audit.score || null,
      audit_type: audit.audit_type || 'api',
      user_tier: audit.user_tier,
      pages_analyzed: audit.pages_limit_applied || 0,
      external_links_checked: audit.external_links_limit_applied || 0,
      created_at: audit.created_at,
      completed_at: audit.updated_at,
      report_data: {
        summary: {
          overall_score: reportData?.overallScore || audit.score,
          pages_scanned: reportData?.visited?.length || 0,
          issues_found: reportData?.issueCount || 0,
          performance_score: reportData?.performanceScore || null,
          seo_score: reportData?.seoScore || null,
          accessibility_score: reportData?.accessibilityScore || null
        },
        pages: reportData?.visited || [],
        external_links: reportData?.externalLinks || {},
        issues: reportData?.issues || [],
        recommendations: reportData?.recommendations || [],
        technical_details: {
          scan_depth: reportData?.scanDepth || 0,
          scan_duration: reportData?.scanDuration || null,
          user_agent: reportData?.userAgent || null
        }
      }
    };

    // Handle different response formats
    if (format === 'summary') {
      res.json({
        session_id: apiResponse.session_id,
        status: apiResponse.status,
        url: apiResponse.url,
        score: apiResponse.score,
        summary: apiResponse.report_data.summary,
        completed_at: apiResponse.completed_at
      });
    } else {
      res.json(apiResponse);
    }

  } catch (error) {
    console.error("API result retrieval error:", error);
    res.status(500).json({ 
      error: "ServerError",
      message: "Failed to get audit results"
    });
  }
});

/**
 * GET /api/v1/audits
 * List user's audits with pagination
 */
router.get("/audits", apiAuth, async (req, res) => {
  const { limit = 20, offset = 0, status = null } = req.query;
  const userId = req.user.id;

  try {
    let whereClause = "WHERE user_id = $1 AND audit_type = 'api'";
    let params = [userId];

    if (status) {
      whereClause += " AND status = $2";
      params.push(status);
    }

    const result = await query(`
      SELECT 
        session_id,
        url,
        status,
        score,
        user_tier,
        created_at,
        updated_at
      FROM audits 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), parseInt(offset)]);

    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM audits 
      ${whereClause}
    `, params);

    res.json({
      audits: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < parseInt(countResult.rows[0].total)
      }
    });

  } catch (error) {
    console.error("API audit list error:", error);
    res.status(500).json({ 
      error: "ServerError",
      message: "Failed to retrieve audit list"
    });
  }
});

// Error handling middleware
router.use(apiErrorHandler);

export default router;
