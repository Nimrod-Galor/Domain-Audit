/**
 * Debug Full E-commerce Analysis
 */

import { EcommerceAnalyzer } from './src/analyzers/ecommerce/ecommerce-analyzer.js';
import { DOMProcessor } from './src/dom/dom-processor.js';

const shopifyHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Premium Headphones | AudioTech Store</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Premium Wireless Headphones",
          "description": "High-quality wireless headphones with active noise cancellation",
          "brand": { "@type": "Brand", "name": "AudioTech" },
          "offers": {
            "@type": "Offer",
            "price": "199.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "AudioTech Store" }
          }
        }
        </script>
      </head>
      <body>
        <div class="shopify-section product-section">
          <div class="container">
            <div class="product-details">
              <h1>Premium Wireless Headphones</h1>
              <div class="price">$199.99</div>
              <div class="stock-status">✅ In Stock</div>
              
              <form class="product-form" action="/cart/add" method="post">
                <button type="submit" class="shopify-payment-button add-to-cart">
                  🛒 Add to Cart
                </button>
              </form>
            </div>
          </div>
          
          <div class="shopping-cart mini-cart">
            <div class="cart-header">
              <span class="cart-icon">🛒</span>
              <span class="cart-count">0 items</span>
            </div>
          </div>
          
          <div class="checkout-security">
            <div class="payment-methods">
              <img src="visa.png" alt="Visa" class="payment-logo">
              <img src="paypal.png" alt="PayPal" class="payment-logo">
            </div>
          </div>
        </div>
      </body>
    </html>
`;

async function debugFullAnalysis() {
  console.log('🔍 Debug Full E-commerce Analysis\n');
  
  const analyzer = new EcommerceAnalyzer();
  const domProcessor = new DOMProcessor();
  
  try {
    const dom = await domProcessor.createDOM(shopifyHTML, 'https://audiotech.myshopify.com/products/premium-headphones');
    console.log('✅ DOM created successfully');
    
    const result = await analyzer.analyzeEcommerce(
      dom, 
      { title: 'Premium Headphones | AudioTech Store' }, 
      'https://audiotech.myshopify.com/products/premium-headphones'
    );
    
    console.log('\n📊 Analysis Result:');
    console.log('Type:', result.type);
    console.log('Analysis Time:', result.analysisTime + 'ms');
    console.log('Error:', result.error || 'None');
    
    if (result.product) {
      console.log('\n📦 Product Analysis:');
      console.log('  Schemas found:', result.product.schemas?.length || 0);
      console.log('  Product page features:', Object.keys(result.product.productPage || {}).length);
    }
    
    if (result.optimization) {
      console.log('\n📈 Optimization:');
      console.log('  Overall score:', result.optimization.overall);
      console.log('  Grade:', result.optimization.grade);
    }
    
    console.log('\n💡 Recommendations:', result.recommendations?.length || 0);
    
    if (result.error) {
      console.error('\n❌ Error details:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    console.error('Stack:', error.stack);
  }
}

debugFullAnalysis();
