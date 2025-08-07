import { configureCSRFProtection } from './lib/enterprise-security.js';

console.log('Testing CSRF configuration...');
try {
  const csrfConfig = configureCSRFProtection();
  console.log('CSRF Config:', Object.keys(csrfConfig));
  console.log('csrfProtection type:', typeof csrfConfig.csrfProtection);
  console.log('generateCSRFToken type:', typeof csrfConfig.generateCSRFToken);
  console.log('csrfMiddleware type:', typeof csrfConfig.csrfMiddleware);
} catch (error) {
  console.error('Error:', error.message);
}
