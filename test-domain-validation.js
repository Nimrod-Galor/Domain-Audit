#!/usr/bin/env node
/**
 * Test domain validation logic
 */

function testDomainValidation(domain) {
    console.log(`Testing domain: "${domain}"`);
    
    try {
        // Allow domain with or without protocol
        const urlToTest = domain.startsWith('http') ? domain : `https://${domain}`;
        console.log(`  URL to test: "${urlToTest}"`);
        
        const url = new URL(urlToTest);
        console.log(`  ✅ Valid URL created:`, {
            protocol: url.protocol,
            hostname: url.hostname,
            href: url.href
        });
        return true;
    } catch (error) {
        console.log(`  ❌ URL creation failed:`, error.message);
        return false;
    }
}

// Test different domains
const testDomains = [
    'httpbin.org',
    'google.com',
    'example.com',
    'https://example.com',
    'http://httpbin.org',
    'invalid-domain',
    'localhost',
    'test.local',
    '192.168.1.1',
    'https://google.com'
];

console.log('🔍 Testing domain validation logic...\n');

testDomains.forEach(domain => {
    const isValid = testDomainValidation(domain);
    console.log(`  Result: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);
});
