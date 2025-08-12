/**
 * Debug the exact URL creation issue
 */

console.log('🔍 Testing URL creation manually...\n');

const domain = 'httpbin.org';
console.log(`Original domain: "${domain}"`);

// Test 1: Direct creation (should fail)
try {
  const url1 = new URL(domain);
  console.log('✅ Direct URL creation worked:', url1.href);
} catch (error) {
  console.log('❌ Direct URL creation failed:', error.message);
}

// Test 2: With https prefix (should work)
const urlToTest = domain.startsWith('http') ? domain : `https://${domain}`;
console.log(`\nURL with prefix: "${urlToTest}"`);

try {
  const url2 = new URL(urlToTest);
  console.log('✅ Prefixed URL creation worked:', url2.href);
} catch (error) {
  console.log('❌ Prefixed URL creation failed:', error.message);
}

// Test 3: Let's see exactly what startsWith('http') returns
console.log(`\nDoes "${domain}" start with "http"?`, domain.startsWith('http'));
console.log(`Length of domain: ${domain.length}`);
console.log(`Characters in domain:`, [...domain]);

// Test 4: Test the exact logic from the schema
console.log('\n🔍 Testing exact schema logic...');
try {
  const urlToTest = domain.startsWith('http') ? domain : `https://${domain}`;
  console.log(`Testing URL: "${urlToTest}"`);
  const url = new URL(urlToTest);
  console.log('✅ Schema logic URL creation worked:', url.href);
} catch (error) {
  console.log('❌ Schema logic URL creation failed:', error.message);
}
