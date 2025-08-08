/**
 * Debug E-commerce Detection
 */

import { EcommerceAnalyzer } from './src/analyzers/ecommerce/ecommerce-analyzer.js';
import { DOMProcessor } from './src/dom/dom-processor.js';

const shopifyHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Premium Headphones | AudioTech Store</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <div class="shopify-section product-section">
          <div class="container">
            <form class="product-form" action="/cart/add" method="post">
              <button type="submit" class="shopify-payment-button add-to-cart">
                🛒 Add to Cart
              </button>
            </form>
          </div>
          
          <div class="shopping-cart mini-cart">
            <div class="cart-header">
              <span class="cart-icon">🛒</span>
              <span class="cart-count">0 items</span>
            </div>
          </div>
        </div>
      </body>
    </html>
`;

async function debugDetection() {
  const analyzer = new EcommerceAnalyzer();
  const domProcessor = new DOMProcessor();
  
  console.log('🔍 Debug E-commerce Detection\n');
  
  const dom = await domProcessor.createDOM(shopifyHTML, 'https://audiotech.myshopify.com/products/premium-headphones');
  const document = dom.window.document;
  
  console.log('📄 Document created successfully:', !!document);
  console.log('🌐 URL:', document.URL);
  console.log('📋 Title:', document.title);
  
  // Test selectors manually
  const testSelectors = [
    '.shopify',
    '.shopify-section', 
    '.add-to-cart',
    '.shopping-cart',
    '.product-price',
    '.checkout',
    '/cart',
    '/checkout'
  ];
  
  console.log('\n🔍 Testing selectors:');
  testSelectors.forEach(selector => {
    if (selector.startsWith('.')) {
      const found = document.querySelector(selector);
      console.log(`  ${selector}: ${found ? '✅ Found' : '❌ Not found'}`);
    } else {
      const urlMatch = document.URL.includes(selector);
      const htmlMatch = document.documentElement.innerHTML.includes(selector);
      console.log(`  ${selector}: URL=${urlMatch ? '✅' : '❌'}, HTML=${htmlMatch ? '✅' : '❌'}`);
    }
  });
  
  console.log('\n📋 Full HTML:');
  console.log(document.documentElement.innerHTML.substring(0, 500) + '...');
  
  // Test the actual detection method
  const detectionResult = analyzer._detectEcommerceType(document, document.URL);
  console.log(`\n🏷️ Detection result: ${detectionResult}`);
}

debugDetection().catch(console.error);
