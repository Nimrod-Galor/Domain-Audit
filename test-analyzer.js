import { EcommerceAnalyzer } from './src/analyzers/ecommerce/ecommerce-analyzer.js';
import { JSDOM } from 'jsdom';

const analyzer = new EcommerceAnalyzer();
const html = `
  <html>
    <body class="shopify">
      <div class="product-title">Test Product</div>
      <div class="price">$29.99</div>
      <div class="add-to-cart">Add to Cart</div>
      <div class="shopping-cart">Cart</div>
      <div class="checkout">Checkout</div>
      <form class="payment-form">
        <input type="text" name="card-number">
      </form>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Test Product"
      }
      </script>
    </body>
  </html>
`;
const dom = new JSDOM(html);
const context = { document: dom.window.document, url: 'https://store.myshopify.com/products/test' };

const result = await analyzer.analyze(context);
console.log('Security structure:', JSON.stringify(result.security, null, 2));
console.log('Checkout structure:', JSON.stringify(result.checkout, null, 2));
