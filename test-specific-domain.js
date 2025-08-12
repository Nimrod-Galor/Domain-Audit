/**
 * Test the specific domain validation issue with httpbin.org
 */

import { z } from 'zod';

// Domain validation schema (copied from auditController.js)
const domainParamSchema = z.object({
  domain: z.string()
    .min(1, { message: 'Domain is required' })
    .refine(domain => {
      try {
        // Allow domain with or without protocol
        const urlToTest = (domain.startsWith('http://') || domain.startsWith('https://')) 
          ? domain 
          : `https://${domain}`;
        console.log(`Testing domain: "${domain}"`);
        console.log(`URL to test: "${urlToTest}"`);
        new URL(urlToTest);
        console.log('✅ URL validation passed');
        return true;
      } catch (error) {
        console.log(`❌ URL validation failed: ${error.message}`);
        return false;
      }
    }, { message: 'Invalid domain format' })
});

// Test the exact failing case
console.log('🔍 Testing domain validation with httpbin.org...\n');

try {
  const result = domainParamSchema.parse({ domain: 'httpbin.org' });
  console.log('✅ VALIDATION PASSED:', result);
} catch (error) {
  console.log('❌ VALIDATION FAILED:', error.message);
  if (error.errors) {
    console.log('Detailed errors:', error.errors);
  }
}
