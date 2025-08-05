/**
 * API Authentication & Rate Limiting Middleware
 * Handles API key authentication and rate limiting for Professional/Enterprise tiers
 */

import { query } from "../models/database.js";
import { tierService } from "../services/tierService.js";

/**
 * API Authentication Middleware
 * Validates API keys for Professional and Enterprise tier users
 */
export const apiAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ 
      error: "API key required",
      message: "Please provide an API key in the x-api-key header or api_key query parameter"
    });
  }

  try {
    const result = await query(`
      SELECT u.*, ul.* FROM users u
      LEFT JOIN user_limits ul ON u.id = ul.user_id
      WHERE u.api_key = $1 AND u.tier IN ('professional', 'enterprise')
    `, [apiKey]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: "Invalid API key",
        message: "API key not found or user does not have API access"
      });
    }

    // Attach user data to request
    req.user = result.rows[0];
    req.userId = result.rows[0].id;
    
    next();
  } catch (error) {
    console.error('API Authentication error:', error);
    res.status(500).json({ 
      error: "Authentication error",
      message: "Internal server error during authentication"
    });
  }
};

/**
 * Rate Limiting Middleware
 * Enforces API call limits based on user tier
 */
export const rateLimiter = async (req, res, next) => {
  const userId = req.user.id;
  const currentMonth = new Date().toISOString().substring(0, 7);

  try {
    const usage = await tierService.getCurrentMonthUsage(userId);
    const limits = await tierService.getUserTierLimits(userId);

    // Check API rate limits based on tier
    let apiLimit = 0;
    if (limits.tier === "professional") {
      apiLimit = parseInt(process.env.API_RATE_LIMIT_PROFESSIONAL) || 1000;
    } else if (limits.tier === "enterprise") {
      apiLimit = parseInt(process.env.API_RATE_LIMIT_ENTERPRISE) || 10000;
    }

    if (usage.api_calls_used >= apiLimit) {
      return res.status(429).json({ 
        error: "API rate limit exceeded",
        message: `Monthly API limit of ${apiLimit} calls exceeded. Usage resets on the 1st of each month.`,
        usage: {
          used: usage.api_calls_used,
          limit: apiLimit,
          reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
        }
      });
    }

    // Record API call
    await query(`
      INSERT INTO usage_tracking (user_id, month_year, api_calls_used)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, month_year)
      DO UPDATE SET 
        api_calls_used = usage_tracking.api_calls_used + 1,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, currentMonth]);

    // Add usage info to response headers
    res.set({
      'X-RateLimit-Limit': apiLimit.toString(),
      'X-RateLimit-Remaining': (apiLimit - usage.api_calls_used - 1).toString(),
      'X-RateLimit-Reset': new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime().toString()
    });

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    res.status(500).json({ 
      error: "Rate limiting error",
      message: "Internal server error during rate limit check"
    });
  }
};

/**
 * API Error Handler
 * Standardizes API error responses
 */
export const apiErrorHandler = (error, req, res, next) => {
  console.error('API Error:', error);

  // Default error response
  let statusCode = 500;
  let message = "Internal server error";

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = "Invalid request data";
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = "Unauthorized access";
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = "Forbidden access";
  }

  res.status(statusCode).json({
    error: error.name || "ServerError",
    message: message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};
