#!/usr/bin/env node

/**
 * Test Enhanced Extractors Integration
 * Tests the enhanced extractors with e-commerce analysis
 */

import { EnhancedExtractorsIntegration } from './src/extractors/enhanced-extractors-integration.js';
import * as cheerio from 'cheerio';

async function testEnhancedExtractors() {
    console.log('🔍 Testing Enhanced Extractors E-commerce Integration...\n');
    
    // Create enhanced extractors instance with e-commerce enabled
    const extractors = new EnhancedExtractorsIntegration({
        enableSocialMediaAnalysis: true,
        enableEcommerceAnalysis: true
    });
    
    // Test with a more realistic e-commerce HTML page
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
                
                <div class="product-card" data-product-id="67890">
                    <img src="/images/nike-react.jpg" alt="Nike React">
                    <h2>Nike React Infinity</h2>
                    <div class="price-container">
                        <span class="price">$160.00</span>
                    </div>
                    <button class="add-to-cart" data-product-id="67890">Add to Cart</button>
                </div>
            </div>
            
            <div class="shopping-features">
                <div class="feature">
                    <h3>Free Shipping</h3>
                    <p>On orders over $50</p>
                </div>
                <div class="feature">
                    <h3>Easy Returns</h3>
                    <p>30-day return policy</p>
                </div>
            </div>
        </main>
        
        <footer>
            <div class="footer-links">
                <a href="/shipping">Shipping Info</a>
                <a href="/returns">Returns</a>
                <a href="/size-guide">Size Guide</a>
                <a href="/customer-service">Customer Service</a>
            </div>
            <p>© 2024 Nike Inc. All rights reserved.</p>
        </footer>
        
        <script>
            // E-commerce tracking
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Shopping cart functionality
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.dataset.productId;
                    addToCart(productId);
                });
            });
            
            function addToCart(productId) {
                // Add to cart logic
                console.log('Added product to cart:', productId);
            }
        </script>
    </body>
    </html>
    `;
    
    const testUrl = 'https://store.nike.com';
    
    try {
        console.log(`🌐 Testing URL: ${testUrl}`);
        console.log('🔧 Extracting enhanced analysis...');
        
        // Parse HTML with Cheerio
        const dom = cheerio.load(testHtml);
        
        const results = await extractors.extractAllEnhancedData(
            dom, 
            {}, // pageData
            100, // responseTime
            testHtml.length, // pageSize
            testHtml, // rawHTML
            testUrl // url
        );
        
        console.log('\n📊 Enhanced Analysis Results:');
        console.log('=============================');
        
        // Check all available analyses
        Object.keys(results).forEach(key => {
            console.log(`✅ ${key}: Available`);
        });
        
        // Check e-commerce analysis specifically
        if (results.ecommerceAnalysis) {
            const ecomAnalysis = results.ecommerceAnalysis;
            
            console.log('\n🛒 E-commerce Analysis Details:');
            console.log('==============================');
            console.log('Full ecommerce object:', JSON.stringify(ecomAnalysis, null, 2));
            console.log(`📦 Platform Type: ${ecomAnalysis.type}`);
            console.log(`🎯 Confidence: ${ecomAnalysis.confidence}`);
            
            if (ecomAnalysis.optimization) {
                console.log(`⭐ Overall Score: ${ecomAnalysis.optimization.overall}/100`);
                
                // Show optimization breakdown
                Object.entries(ecomAnalysis.optimization).forEach(([key, score]) => {
                    if (key !== 'overall' && typeof score === 'number') {
                        console.log(`   ${key}: ${score}/100`);
                    }
                });
            }
            
            if (ecomAnalysis.features) {
                console.log(`🔧 Features detected: ${Object.keys(ecomAnalysis.features).length} categories`);
                Object.entries(ecomAnalysis.features).forEach(([category, features]) => {
                    if (Array.isArray(features) && features.length > 0) {
                        console.log(`   ${category}: ${features.length} features`);
                    }
                });
            }
            
            if (ecomAnalysis.recommendations) {
                console.log(`💡 Recommendations: ${ecomAnalysis.recommendations.length} suggestions`);
                ecomAnalysis.recommendations.forEach((rec, index) => {
                    console.log(`   ${index + 1}. [${rec.priority}] ${rec.title}`);
                });
            }
            
            console.log('\n🎉 E-commerce analysis test PASSED!');
            
        } else {
            console.log('❌ E-commerce analysis NOT found in results');
            console.log('Available analyses:', Object.keys(results));
        }
        
    } catch (error) {
        console.error('❌ Error during enhanced extractors test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testEnhancedExtractors().catch(console.error);
