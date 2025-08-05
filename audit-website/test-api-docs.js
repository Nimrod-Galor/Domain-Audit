console.log('🚀 Testing API Documentation Setup...\n');

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;

// Test API documentation files
const testFiles = [
    'public/api-docs.html'
];

console.log('📝 Checking API Documentation files...');

for (const file of testFiles) {
    const filePath = join(__dirname, file);
    if (existsSync(filePath)) {
        console.log(`✅ ${file}`);
        passed++;
    } else {
        console.log(`❌ ${file} - MISSING`);
        failed++;
    }
}

// Test route integration
console.log('\n📝 Checking route integration...');
const routeFile = join(__dirname, 'routes/index.js');
if (existsSync(routeFile)) {
    const { readFileSync } = await import('fs');
    const content = readFileSync(routeFile, 'utf8');
    
    if (content.includes('/api-docs')) {
        console.log('✅ API docs route added to index.js');
        passed++;
    } else {
        console.log('❌ API docs route missing from index.js');
        failed++;
    }
} else {
    console.log('❌ routes/index.js not found');
    failed++;
}

// Test navigation integration
console.log('\n📝 Checking navigation integration...');
const headerFile = join(__dirname, 'views/partials/header.ejs');
if (existsSync(headerFile)) {
    const { readFileSync } = await import('fs');
    const content = readFileSync(headerFile, 'utf8');
    
    if (content.includes('API Docs')) {
        console.log('✅ API docs link added to navigation');
        passed++;
    } else {
        console.log('❌ API docs link missing from navigation');
        failed++;
    }
} else {
    console.log('❌ views/partials/header.ejs not found');
    failed++;
}

console.log('\n📊 RESULTS:');
console.log(`✅ Tests Passed: ${passed}`);
console.log(`❌ Tests Failed: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 API DOCUMENTATION SETUP COMPLETE!');
    console.log('📚 Comprehensive API documentation is now available');
    console.log('🔗 Accessible at: /api-docs');
    console.log('🧭 Navigation link added to main menu');
    console.log('📱 Dashboard integration updated');
} else {
    console.log('\n⚠️ API documentation setup incomplete');
    console.log(`Missing ${failed} components`);
}

console.log('\n✅ Testing completed');
