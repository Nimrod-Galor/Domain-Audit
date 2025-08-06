const { sessionManager } = require('../lib/security');
const { generateCSRFToken } = require('../lib/validators');

/**
 * CSRF Protection Middleware
 */
function csrfProtection(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS requests (they should be safe)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get session ID from cookie or header
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(403).json({ error: 'No session found' });
  }
  
  // Get CSRF token from header or body
  const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  if (!csrfToken) {
    return res.status(403).json({ error: 'CSRF token required' });
  }
  
  // Validate CSRF token
  if (!sessionManager.validateCSRF(sessionId, csrfToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

/**
 * Generate CSRF token for new sessions
 */
function generateCSRF(req, res, next) {
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  
  if (sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (session) {
      res.locals.csrfToken = session.csrfToken;
    }
  }
  
  // If no session or token, generate a new one
  if (!res.locals.csrfToken) {
    res.locals.csrfToken = generateCSRFToken();
  }
  
  next();
}

/**
 * Add CSRF token to response headers
 */
function addCSRFToResponse(req, res, next) {
  if (res.locals.csrfToken) {
    res.setHeader('X-CSRF-Token', res.locals.csrfToken);
  }
  next();
}

module.exports = {
  csrfProtection,
  generateCSRF,
  addCSRFToResponse
};
