#!/usr/bin/env node

/**
 * Test E-commerce Analyzer Directly
 * Tests the core e-commerce analyzer module
 */

import { EcommerceAnalyzer } from './src/analyzers/ecommerce/ecommerce-analyzer.js';
import * as cheerio from 'cheerio';

async function testEcommerceAnalyzer() {
    console.log('🔍 Testing E-commerce Analyzer Directly...\n');
    
    // Test with comprehensive e-commerce HTML
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Nike Store - Premium Athletic Footwear</title>
        <meta charset="utf-8">
        <meta name="description" content="Shop the latest Nike shoes, clothing and accessories">
    </head>
    <body>
        <header>
            <nav>
                <a href="/cart" class="cart-link">Cart (2)</a>
                <a href="/account">My Account</a>
            </nav>
        </header>
        
        <main>
            <div class="product-grid">
                <div class="product-card" data-product-id="12345">
                    <img src="/images/nike-air-max.jpg" alt="Nike Air Max">
                    <h2>Nike Air Max 90</h2>
                    <div class="price-container">
                        <span class="price">$120.00</span>
                        <span class="original-price">$150.00</span>
                    </div>
                    <button class="add-to-cart" data-product-id="12345">Add to Cart</button>
                    <div class="product-rating">
                        <span class="stars">★★★★☆</span>
                        <span class="review-count">(247 reviews)</span>
                    </div>
                </div>
            </div>
        </main>
        
        <footer>
            <p>© 2024 Nike Inc.</p>
        </footer>
        
        <script>
            function addToCart(productId) {
                console.log('Added product to cart:', productId);
            }
        </script>
    </body>
    </html>
    `;
    
    const testUrl = 'https://store.nike.com';
    
    try {
        console.log(`🌐 Testing URL: ${testUrl}`);
        console.log('🔧 Running e-commerce analysis...');
        
        // Parse HTML with Cheerio
        const dom = cheerio.load(testHtml);
        
        // Test the analyzer directly
        const analyzer = new EcommerceAnalyzer();
        const context = {
          document: dom.window.document,
          url: testUrl,
          pageData: {}
        };
        const analysis = await analyzer.analyze(context);
        
        console.log('\n📊 E-commerce Analysis Results:');
        console.log('===============================');
        console.log('Analysis success:', analysis.success);
        if (analysis.success) {
          console.log('Full analysis:', JSON.stringify(analysis.data, null, 2));
        } else {
          console.log('Error:', analysis.error);
        }
        
        if (analysis.success && analysis.data && Object.keys(analysis.data).length > 0) {
            console.log('\n✅ E-commerce analyzer is working!');
            
            if (analysis.data.type) {
                console.log(`📦 Platform Type: ${analysis.data.type}`);
            }
            
            if (analysis.data.confidence) {
                console.log(`🎯 Confidence: ${analysis.data.confidence}`);
            }
            
            if (analysis.data.optimization) {
                console.log(`⭐ Overall Score: ${analysis.optimization.overall}/100`);
            }
            
            if (analysis.features) {
                console.log(`🔧 Features: ${Object.keys(analysis.features).length} categories`);
            }
            
            if (analysis.recommendations) {
                console.log(`💡 Recommendations: ${analysis.recommendations.length} suggestions`);
            }
        } else {
            console.log('❌ E-commerce analyzer returned empty or null result');
        }
        
    } catch (error) {
        console.error('❌ Error during e-commerce analyzer test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testEcommerceAnalyzer().catch(console.error);
