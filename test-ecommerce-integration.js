#!/usr/bin/env node

/**
 * Test E-commerce Integration
 * Tests the complete e-commerce analysis integration
 */

import { runCrawl } from './lib/crawler.js';

async function testEcommerceIntegration() {
    console.log('🔍 Testing E-commerce Integration...\n');
    
    // Test with a known e-commerce site
    const testUrl = 'https://store.nike.com';
    
    try {
        console.log(`🌐 Auditing: ${testUrl}`);
        const results = await runCrawl(testUrl, 5, true); // Limit to 5 pages, force new audit
        
        console.log('\n📊 Analysis Results:');
        console.log('===================');
        
        // Check if e-commerce analysis is present
        if (results.enhanced?.ecommerceAnalysis) {
            const ecomAnalysis = results.enhanced.ecommerceAnalysis;
            
            console.log(`✅ E-commerce analysis detected!`);
            console.log(`📦 Platform Type: ${ecomAnalysis.type}`);
            console.log(`🎯 Confidence: ${ecomAnalysis.confidence}`);
            
            if (ecomAnalysis.optimization) {
                console.log(`⭐ Overall Score: ${ecomAnalysis.optimization.overall}/100`);
                
                // Show sub-scores
                Object.entries(ecomAnalysis.optimization).forEach(([key, score]) => {
                    if (key !== 'overall' && typeof score === 'number') {
                        console.log(`   ${key}: ${score}/100`);
                    }
                });
            }
            
            if (ecomAnalysis.features) {
                console.log(`🔧 Features detected: ${Object.keys(ecomAnalysis.features).length} categories`);
            }
            
            if (ecomAnalysis.recommendations) {
                console.log(`💡 Recommendations: ${ecomAnalysis.recommendations.length} suggestions`);
            }
            
            console.log('\n🎉 E-commerce integration test PASSED!');
            
        } else {
            console.log('❌ E-commerce analysis NOT found in results');
            console.log('Available enhanced results:', Object.keys(results.enhanced || {}));
        }
        
    } catch (error) {
        console.error('❌ Error during e-commerce integration test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testEcommerceIntegration().catch(console.error);
