import { JSDOM } from 'jsdom';
import('./src/analyzers/business-intelligence/location/location-analyzer.js').then(async module => {
  const { LocationAnalyzer } = module;
  
  // Create mock document with business location content
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Business - Location & Hours</title>
    </head>
    <body>
      <div class="address">
        123 Main Street, Suite 100<br>
        New York, NY 10001<br>
        United States
      </div>
      <div class="hours">
        Monday - Friday: 9:00 AM - 6:00 PM<br>
        Saturday: 10:00 AM - 4:00 PM<br>
        Sunday: Closed
      </div>
      <div class="service-area">
        We serve the greater New York metropolitan area,
        including Manhattan, Brooklyn, Queens, and surrounding areas.
      </div>
      <p>Local business established in 1995, proudly serving the community.</p>
    </body>
    </html>
  `);

  console.log('🔧 Testing LocationAnalyzer...');
  
  const analyzer = new LocationAnalyzer();
  const result = await analyzer.analyze({
    document: dom.window.document,
    url: 'https://example.com',
    pageData: {}
  });
  
  console.log('✅ LocationAnalyzer Result Structure:');
  console.log('- success:', result.success);
  console.log('- analyzer:', result.analyzer);
  console.log('- data keys:', result.data ? Object.keys(result.data) : 'undefined');
  console.log('- data.physicalLocation:', result.data?.physicalLocation ? 'present' : 'missing');
  console.log('- data.businessHours:', result.data?.businessHours ? 'present' : 'missing');
  console.log('- data.localPresence:', result.data?.localPresence ? 'present' : 'missing');
  console.log('- data.businessType:', result.data?.businessType);
  
  console.log('\n📊 Full Result:');
  console.log(JSON.stringify(result, null, 2));
  
}).catch(error => {
  console.error('❌ Error testing LocationAnalyzer:', error.message);
  console.error(error.stack);
});
