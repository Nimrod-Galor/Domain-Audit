const { 
  validateURL,
  sanitizeURL,
  sanitizeHTML,
  sanitizeInput 
} = require('../../audit-website/lib/validators');

describe('XSS Prevention Security Tests', () => {
  
  describe('HTML Sanitization', () => {
    test('should sanitize malicious HTML content', () => {
      // Basic XSS attack vectors
      expect(sanitizeHTML('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      
      expect(sanitizeHTML('<img src="x" onerror="alert(1)">'))
        .toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
      
      expect(sanitizeHTML('<a href="javascript:alert(1)">click</a>'))
        .toBe('&lt;a href=&quot;javascript:alert(1)&quot;&gt;click&lt;&#x2F;a&gt;');
      
      // SQL injection attempts in HTML context
      expect(sanitizeHTML("'; DROP TABLE users; --"))
        .toBe('&#x27;; DROP TABLE users; --');
    });
    
    test('should handle special characters safely', () => {
      expect(sanitizeHTML('&<>"\'/')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
    });
    
    test('should preserve safe content structure', () => {
      const safeText = 'Hello World 123';
      expect(sanitizeHTML(safeText)).toBe(safeText);
      
      const textWithSpaces = 'This is normal text with spaces';
      expect(sanitizeHTML(textWithSpaces)).toBe(textWithSpaces);
    });
  });
  
  describe('URL Validation for XSS Protection', () => {
    test('should block javascript URLs', () => {
      expect(validateURL('javascript:alert(1)')).toBe(false);
      expect(validateURL('JAVASCRIPT:alert(1)')).toBe(false);
      expect(validateURL('data:text/html,<script>alert(1)</script>')).toBe(false);
    });
    
    test('should block malicious protocol schemes', () => {
      expect(validateURL('vbscript:msgbox(1)')).toBe(false);
      expect(validateURL('file:///etc/passwd')).toBe(false);
      expect(validateURL('ftp://malicious.com/payload')).toBe(false);
    });
    
    test('should allow safe URLs', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://test.example.com/path')).toBe(true);
      expect(validateURL('https://secure-site.org/page?param=value')).toBe(true);
    });
    
    test('should block SSRF attempts', () => {
      expect(validateURL('http://localhost:8080')).toBe(false);
      expect(validateURL('https://127.0.0.1/admin')).toBe(false);
      expect(validateURL('http://192.168.1.1/router')).toBe(false);
      expect(validateURL('http://10.0.0.1/internal')).toBe(false);
      expect(validateURL('http://172.16.0.1/service')).toBe(false);
      expect(validateURL('http://169.254.169.254/metadata')).toBe(false); // AWS metadata
    });
  });
  
  describe('Input Sanitization', () => {
    test('should remove SQL injection patterns', () => {
      expect(sanitizeInput("'; DROP TABLE users; --")).toBe(' DROP TABLE users; ');
      expect(sanitizeInput('1 OR 1=1')).toBe('1 OR 1=1');
      expect(sanitizeInput('admin\\\'--')).toBe('admin--');
      expect(sanitizeInput('/* comment */ SELECT')).toBe(' SELECT');
    });
    
    test('should handle various input types safely', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('  normal text  ')).toBe('normal text');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
      expect(sanitizeInput(123)).toBe(123); // Non-string input
    });
    
    test('should preserve legitimate content', () => {
      const validInput = 'This is a normal user input with numbers 123';
      expect(sanitizeInput(validInput)).toBe(validInput);
      
      const emailInput = 'user.name+tag@example.com';
      expect(sanitizeInput(emailInput)).toBe('user.name+tag@example.com');
    });
  });
  
  describe('URL Sanitization', () => {
    test('should add HTTPS protocol when missing', () => {
      expect(sanitizeURL('example.com')).toBe('https://example.com');
      expect(sanitizeURL('www.test.com')).toBe('https://www.test.com');
    });
    
    test('should preserve existing protocols', () => {
      expect(sanitizeURL('http://example.com')).toBe('http://example.com');
      expect(sanitizeURL('https://secure.com')).toBe('https://secure.com');
    });
    
    test('should handle edge cases', () => {
      expect(sanitizeURL('')).toBe('');
      expect(sanitizeURL('  ')).toBe('https://');
      expect(sanitizeURL(null)).toBe('');
      expect(sanitizeURL(undefined)).toBe('');
    });
  });
});
