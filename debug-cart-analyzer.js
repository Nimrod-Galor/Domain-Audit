/**
 * Debug CartAnalyzer analysis step by step
 */

import { JSDOM } from 'jsdom';
import { CartAnalyzer } from './src/analyzers/ecommerce/checkout/cart-analyzer.js';

const testHTML = `
<!DOCTYPE html>
<html>
<head><title>Cart Test</title></head>
<body>
    <div class="shopping-cart">
        <h2>Cart</h2>
        <button class="add-to-cart">Add to Cart</button>
        <input type="number" name="quantity" value="1">
    </div>
</body>
</html>
`;

async function debugCartAnalyzer() {
    console.log('🔍 DEBUGGING CART ANALYZER');
    console.log('='.repeat(40));
    
    try {
        const dom = new JSDOM(testHTML);
        const document = dom.window.document;
        
        const cartAnalyzer = new CartAnalyzer();
        console.log('✅ CartAnalyzer created');
        
        // Test validation
        const context = { document, url: 'test.com' };
        const isValid = cartAnalyzer.validate(context);
        console.log(`✅ Validation: ${isValid}`);
        
        // Test analysis
        console.log('\n🔍 Running analysis...');
        const result = await cartAnalyzer.analyze(context);
        console.log('✅ Analysis result type:', typeof result);
        console.log('✅ Analysis result keys:', Object.keys(result || {}));
        
        if (result) {
            console.log('Result structure:');
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log('❌ Analysis returned null/undefined');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugCartAnalyzer();
