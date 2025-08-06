const { 
  validatePassword,
  sanitizeHTML,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken 
} = require('../../audit-website/lib/validators');

const {
  hashPassword,
  comparePassword,
  generateJWTToken,
  verifyJWTToken,
  sessionManager,
  mfaManager
} = require('../../audit-website/lib/security');

describe('Enhanced Authentication Security Tests', () => {
  
  describe('Password Security', () => {
    test('should enforce strong password requirements', () => {
      // Test minimum length
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('weak123')).toBe(false);
      
      // Test missing uppercase
      expect(validatePassword('weakpass123!')).toBe(false);
      
      // Test missing lowercase
      expect(validatePassword('WEAKPASS123!')).toBe(false);
      
      // Test missing numbers
      expect(validatePassword('WeakPass!')).toBe(false);
      
      // Test missing special characters
      expect(validatePassword('WeakPass123')).toBe(false);
      
      // Test valid strong password
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('MySecure#Pass1')).toBe(true);
    });
    
    test('should hash and verify passwords securely', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
      
      // Should verify correct password
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
      
      // Should reject incorrect password
      const isInvalid = await comparePassword('WrongPass123!', hash);
      expect(isInvalid).toBe(false);
    });
  });
  
  describe('JWT Token Security', () => {
    test('should generate and verify JWT tokens', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      const role = 'user';
      
      const token = generateJWTToken(userId, email, role);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = verifyJWTToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
    });
    
    test('should reject invalid JWT tokens', () => {
      expect(verifyJWTToken('invalid.token.here')).toBeNull();
      expect(verifyJWTToken('')).toBeNull();
      expect(verifyJWTToken(null)).toBeNull();
    });
  });
  
  describe('Session Management', () => {
    test('should create and manage sessions securely', () => {
      const userId = 'user123';
      const userData = { email: 'test@example.com' };
      
      const { sessionId, csrfToken } = sessionManager.createSession(userId, userData);
      
      expect(sessionId).toBeDefined();
      expect(csrfToken).toBeDefined();
      expect(sessionId.length).toBe(64); // 32 bytes hex = 64 chars
      
      const session = sessionManager.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.email).toBe(userData.email);
    });
    
    test('should validate CSRF tokens correctly', () => {
      const userId = 'user123';
      const { sessionId, csrfToken } = sessionManager.createSession(userId);
      
      // Valid CSRF token should pass
      expect(sessionManager.validateCSRF(sessionId, csrfToken)).toBe(true);
      
      // Invalid CSRF token should fail
      expect(sessionManager.validateCSRF(sessionId, 'invalid-token')).toBe(false);
      
      // Non-existent session should fail
      expect(sessionManager.validateCSRF('invalid-session', csrfToken)).toBe(false);
    });
  });
  
  describe('Multi-Factor Authentication', () => {
    test('should generate and verify MFA codes', () => {
      const userId = 'user123';
      const { challengeId, code } = mfaManager.createMFAChallenge(userId);
      
      expect(challengeId).toBeDefined();
      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
      
      // Correct code should verify
      const result = mfaManager.verifyMFACode(challengeId, code);
      expect(result.success).toBe(true);
      expect(result.userId).toBe(userId);
    });
    
    test('should reject invalid MFA codes', () => {
      const userId = 'user123';
      const { challengeId } = mfaManager.createMFAChallenge(userId);
      
      // Wrong code should fail
      const result = mfaManager.verifyMFACode(challengeId, '999999');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
