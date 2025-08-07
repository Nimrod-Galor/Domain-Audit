import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// JWT Secret (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for authenticated user
 */
function generateJWTToken(userId, email, role = 'user') {
  const payload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
function verifyJWTToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate secure session ID
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate secure CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token with timing attack protection
 */
function validateCSRFToken(sessionToken, requestToken) {
  if (!sessionToken || !requestToken) {
    return false;
  }
  
  if (sessionToken.length !== requestToken.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(sessionToken),
      Buffer.from(requestToken)
    );
  } catch (error) {
    return false;
  }
}

/**
 * CSRF Protection middleware
 */
function csrfProtection(req, res, next) {
  // Ensure session exists
  if (!req.session) {
    return res.status(403).json({
      error: 'No session found'
    });
  }
  
  // Generate token if it doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Skip validation for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get token from various sources
  const requestToken = req.headers['x-csrf-token'] || 
                      req.body._token || 
                      req.query._token;
  
  // Validate token
  if (!validateCSRFToken(req.session.csrfToken, requestToken)) {
    return res.status(403).json({
      error: 'Invalid CSRF token'
    });
  }
  
  next();
}

/**
 * Generate CSRF token for forms
 */
function generateCSRF() {
  return generateCSRFToken();
}

/**
 * Add CSRF token to response locals for templates
 */
function addCSRFToResponse(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

/**
 * Session management
 */
class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.maxSessions = 1000; // Prevent memory leaks
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }
  
  createSession(userId, userData = {}) {
    const sessionId = generateSessionId();
    const session = {
      userId,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      csrfToken: crypto.randomBytes(32).toString('hex'),
      ...userData
    };
    
    // Clean old sessions if we're at the limit
    if (this.sessions.size >= this.maxSessions) {
      this.cleanExpiredSessions();
    }
    
    this.sessions.set(sessionId, session);
    return { sessionId, csrfToken: session.csrfToken };
  }
  
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if session has expired
    if (Date.now() - session.lastAccessed > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    // Update last accessed time
    session.lastAccessed = Date.now();
    return session;
  }
  
  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastAccessed = Date.now();
      return true;
    }
    return false;
  }
  
  destroySession(sessionId) {
    return this.sessions.delete(sessionId);
  }
  
  cleanExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessed > this.sessionTimeout) {
        this.sessions.delete(sessionId);
      }
    }
  }
  
  validateCSRF(sessionId, requestToken) {
    const session = this.getSession(sessionId);
    if (!session || !requestToken) {
      return false;
    }
    
    // Use crypto.timingSafeEqual to prevent timing attacks
    if (session.csrfToken.length !== requestToken.length) {
      return false;
    }
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(session.csrfToken),
        Buffer.from(requestToken)
      );
    } catch (error) {
      return false;
    }
  }
}

/**
 * Rate limiting for API endpoints
 */
class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get or create request history for this identifier
    let requestHistory = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    requestHistory = requestHistory.filter(timestamp => timestamp > windowStart);
    
    // Check if under the limit
    if (requestHistory.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    requestHistory.push(now);
    this.requests.set(identifier, requestHistory);
    
    return true;
  }
  
  reset(identifier) {
    this.requests.delete(identifier);
  }
  
  resetAll() {
    this.requests.clear();
  }
  
  getRemainingRequests(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requestHistory = this.requests.get(identifier) || [];
    const validRequests = requestHistory.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
  
  // Additional methods for testing compatibility
  checkLimit(identifier) {
    return this.isAllowed(identifier);
  }
  
  isRateLimited(identifier) {
    return !this.isAllowed(identifier);
  }
}

/**
 * Multi-factor authentication helper
 */
class MFAManager {
  constructor() {
    this.pendingMFA = new Map();
  }
  
  generateMFACode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  createMFAChallenge(userId, method = 'email') {
    const code = this.generateMFACode();
    const challenge = {
      userId,
      code,
      method,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: 3,
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
    
    const challengeId = crypto.randomBytes(16).toString('hex');
    this.pendingMFA.set(challengeId, challenge);
    
    return { challengeId, code };
  }
  
  verifyMFACode(challengeId, inputCode) {
    const challenge = this.pendingMFA.get(challengeId);
    
    if (!challenge) {
      return { success: false, error: 'Invalid challenge' };
    }
    
    if (Date.now() > challenge.expiresAt) {
      this.pendingMFA.delete(challengeId);
      return { success: false, error: 'Challenge expired' };
    }
    
    if (challenge.attempts >= challenge.maxAttempts) {
      this.pendingMFA.delete(challengeId);
      return { success: false, error: 'Too many attempts' };
    }
    
    challenge.attempts++;
    
    if (challenge.code === inputCode) {
      this.pendingMFA.delete(challengeId);
      return { success: true, userId: challenge.userId };
    }
    
    return { success: false, error: 'Invalid code', attemptsRemaining: challenge.maxAttempts - challenge.attempts };
  }
}

// Create singleton instances
const sessionManager = new SessionManager();
const rateLimiter = new RateLimiter();
const mfaManager = new MFAManager();

export {
  generateJWTToken,
  verifyJWTToken,
  hashPassword,
  comparePassword,
  generateSessionId,
  generateCSRFToken,
  validateCSRFToken,
  csrfProtection,
  generateCSRF,
  addCSRFToResponse,
  SessionManager,
  RateLimiter,
  MFAManager,
  sessionManager,
  rateLimiter,
  mfaManager
};
