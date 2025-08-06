const { verifyJWTToken, sessionManager, rateLimiter } = require('../lib/security');

/**
 * JWT Authentication Middleware
 */
function authenticateJWT(req, res, next) {
  const token = req.cookies.authToken || 
                req.headers['authorization']?.replace('Bearer ', '') ||
                req.headers['x-auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Session-based Authentication Middleware
 */
function authenticateSession(req, res, next) {
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({ error: 'No session found' });
  }
  
  const session = sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  req.session = session;
  req.user = { userId: session.userId };
  next();
}

/**
 * Rate Limiting Middleware
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress
  } = options;
  
  const limiter = new (require('../lib/security').RateLimiter)(windowMs, maxRequests);
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    
    if (!limiter.isAllowed(key)) {
      return res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add rate limit info to response headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', limiter.getRemainingRequests(key));
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());
    
    next();
  };
}

/**
 * Role-based Authorization Middleware
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

/**
 * Multi-factor Authentication Middleware
 */
function requireMFA(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has completed MFA for this session
  const session = req.session;
  if (session && session.mfaVerified) {
    return next();
  }
  
  // Check for MFA token in headers
  const mfaToken = req.headers['x-mfa-token'];
  if (!mfaToken) {
    return res.status(403).json({ 
      error: 'MFA required',
      action: 'mfa_challenge_required'
    });
  }
  
  // Verify MFA token (this would integrate with your MFA system)
  // For now, we'll mark it as verified and continue
  if (session) {
    session.mfaVerified = true;
  }
  
  next();
}

/**
 * Input Validation and Sanitization Middleware
 */
function validateInput(validationRules) {
  return (req, res, next) => {
    const { sanitizeInput } = require('../lib/validators');
    const errors = [];
    
    // Validate and sanitize request body
    if (req.body && validationRules.body) {
      for (const [field, rules] of Object.entries(validationRules.body)) {
        const value = req.body[field];
        
        if (rules.required && (!value || value.trim() === '')) {
          errors.push(`${field} is required`);
          continue;
        }
        
        if (value) {
          // Sanitize input
          req.body[field] = sanitizeInput(value);
          
          // Apply validation rules
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
          }
          
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must be no more than ${rules.maxLength} characters`);
          }
          
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
          }
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
  };
}

module.exports = {
  authenticateJWT,
  authenticateSession,
  rateLimit,
  requireRole,
  requireMFA,
  validateInput
};
