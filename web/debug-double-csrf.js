import { doubleCsrf } from 'csrf-csrf';

console.log('Testing doubleCsrf structure...');
try {
  const result = doubleCsrf({
    getSecret: () => 'test-secret',
    cookieName: 'test-csrf',
    cookieOptions: { httpOnly: true }
  });
  
  console.log('doubleCsrf result keys:', Object.keys(result));
  console.log('generateToken:', typeof result.generateToken);
  console.log('doubleCsrfProtection:', typeof result.doubleCsrfProtection);
} catch (error) {
  console.error('Error:', error.message);
}
