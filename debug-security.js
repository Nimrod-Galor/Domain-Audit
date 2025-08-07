import { validationSchemas } from './web/lib/enterprise-security.js';

const dangerousInputs = [
  '<script>alert(1)</script>', // XSS attempt
  '<img src=x onerror=alert(1)>', // XSS via image
  "'; DROP TABLE users; --", // SQL injection
  "1' OR '1'='1", // SQL injection
  'admin/*comment*/password', // SQL comment injection
  'UNION SELECT * FROM passwords', // SQL union attack
  'INSERT INTO users VALUES', // SQL insertion
  'DELETE FROM users WHERE', // SQL deletion
  'UPDATE users SET password' // SQL update
];

console.log('=== Testing Each Dangerous Input ===');
dangerousInputs.forEach((input, index) => {
  try {
    const result = validationSchemas.userInput.validate(input);
    console.log(`${index + 1}. Input: "${input}"`);
    console.log(`   Error: ${result.error ? 'BLOCKED ✅' : 'PASSED ⚠️ (SHOULD BE BLOCKED)'}`);
    if (!result.error) {
      console.log('   ⚠️  THIS IS THE FAILING CASE!');
    }
    console.log('');
  } catch (e) {
    console.log(`${index + 1}. Error testing: "${input}" - ${e.message}`);
  }
});
