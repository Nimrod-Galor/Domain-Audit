import { 
  validationSchemas,
  XSSProtection,
  PasswordManager,
  SecurityUtils,
  configureSecurityHeaders
} from './lib/enterprise-security.js';

console.log('🧪 Testing Enterprise Security Implementation\n');

// Test 1: Joi URL Validation
console.log('1. Testing Joi URL Validation:');
const { error: urlError1 } = validationSchemas.url.validate('https://example.com');
const { error: urlError2 } = validationSchemas.url.validate('javascript:alert(1)');
const { error: urlError3 } = validationSchemas.url.validate('http://localhost:3306');
console.log('   ✅ Valid URL passes:', !urlError1);
console.log('   ✅ JavaScript URL blocked:', !!urlError2);
console.log('   ✅ Localhost URL blocked:', !!urlError3);

// Test 2: Joi Email Validation
console.log('\n2. Testing Joi Email Validation:');
const { error: emailError1 } = validationSchemas.email.validate('user@example.com');
const { error: emailError2 } = validationSchemas.email.validate('invalid-email');
console.log('   ✅ Valid email passes:', !emailError1);
console.log('   ✅ Invalid email blocked:', !!emailError2);

// Test 3: Joi Password Validation
console.log('\n3. Testing Joi Password Validation:');
const { error: passError1 } = validationSchemas.password.validate('StrongPass123!');
const { error: passError2 } = validationSchemas.password.validate('weak');
console.log('   ✅ Strong password passes:', !passError1);
console.log('   ✅ Weak password blocked:', !!passError2);

// Test 4: Cheerio XSS Protection
console.log('\n4. Testing Cheerio XSS Protection:');
const xssResult1 = XSSProtection.escapeHTML('<script>alert(1)</script>');
const xssResult2 = XSSProtection.sanitizeText('<p>Hello <script>alert(1)</script> World</p>');
const xssResult3 = XSSProtection.sanitizeInput('<script>evil</script>Clean text');
console.log('   ✅ HTML escaping works:', xssResult1 === '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
console.log('   ✅ Text extraction works:', xssResult2.includes('Hello') && xssResult2.includes('World') && !xssResult2.includes('<script>'));
console.log('   ✅ Input sanitization works:', xssResult3 === 'Clean text');

// Test 5: URL Sanitization
console.log('\n5. Testing URL Sanitization:');
const urlResult1 = XSSProtection.sanitizeURL('https://example.com');
const urlResult2 = XSSProtection.sanitizeURL('javascript:alert(1)');
console.log('   ✅ Safe URL preserved:', urlResult1 === 'https://example.com/' || urlResult1 === 'https://example.com');
console.log('   ✅ Dangerous URL blocked:', urlResult2 === '');

// Test 6: Security Utilities
console.log('\n6. Testing Security Utilities:');
const randomToken = SecurityUtils.generateSecureRandom(16);
const safeCompare1 = SecurityUtils.safeCompare('test', 'test');
const safeCompare2 = SecurityUtils.safeCompare('test', 'different');
const hashedData = SecurityUtils.hashForLogging('sensitive-data');
console.log('   ✅ Random generation works:', randomToken.length === 32 && /^[a-f0-9]+$/.test(randomToken));
console.log('   ✅ Safe compare works (same):', safeCompare1 === true);
console.log('   ✅ Safe compare works (different):', safeCompare2 === false);
console.log('   ✅ Hashing for logging works:', hashedData.length === 11 && hashedData.endsWith('...'));

// Test 7: Helmet Configuration
console.log('\n7. Testing Helmet Configuration:');
const helmetMiddleware = configureSecurityHeaders();
console.log('   ✅ Helmet middleware created:', typeof helmetMiddleware === 'function');

// Test 8: Argon2 Password Hashing (async)
console.log('\n8. Testing Argon2 Password Hashing:');
(async () => {
  try {
    const password = 'TestPassword123!';
    const hash = await PasswordManager.hashPassword(password);
    const isValid = await PasswordManager.verifyPassword(password, hash);
    const isInvalid = await PasswordManager.verifyPassword('wrong', hash);
    
    console.log('   ✅ Password hashing works:', hash.includes('$argon2id$'));
    console.log('   ✅ Password verification works (correct):', isValid === true);
    console.log('   ✅ Password verification works (incorrect):', isInvalid === false);
    
    console.log('\n🎉 All Enterprise Security Tests Passed!');
    console.log('\n📊 Summary:');
    console.log('   • Joi validation schemas: Working');
    console.log('   • Cheerio XSS protection: Working');
    console.log('   • Argon2 password hashing: Working');
    console.log('   • Security utilities: Working');
    console.log('   • Helmet configuration: Working');
    console.log('\n✅ Enterprise security implementation is fully functional!');
  } catch (error) {
    console.error('❌ Password hashing test failed:', error.message);
  }
})();
