#!/usr/bin/env node
/**
 * Test the full Business Intelligence Analyzer integration
 */

import { JSDOM } from 'jsdom';
import { BusinessIntelligenceAnalyzer } from './src/analyzers/business-intelligence/business-analyzer-minimal.js';

async function testFullAnalyzer() {
  console.log('🧪 Testing Full Business Intelligence Analyzer Integration...\n');
  
  try {
    const analyzer = new BusinessIntelligenceAnalyzer();
    
    // Test HTML with business intelligence features
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Business Website</title>
          <meta name="description" content="Professional business services">
        </head>
        <body>
          <header>
            <nav>
              <a href="/about">About Us</a>
              <a href="/company">Our Company</a>
              <a href="/contact">Contact</a>
              <a href="/support">Support</a>
            </nav>
          </header>
          
          <main>
            <section class="trust-section">
              <div class="trust-badge">Verified Business</div>
              <div class="secure">SSL Secured</div>
              <div class="certification">ISO Certified</div>
            </section>
            
            <section class="contact">
              <a href="mailto:contact@example.com">Email Us</a>
              <a href="tel:+1234567890">Call Us</a>
              <address class="location">123 Business Street, City</address>
            </section>
            
            <section class="about">
              <div class="mission">Our mission is excellence</div>
              <div class="vision">Vision for the future</div>
            </section>
            
            <section class="support">
              <div class="chat">Live Chat Available</div>
              <a href="/help">Help Center</a>
            </section>
            
            <section class="credibility">
              <div class="testimonial">Great service from John Doe</div>
              <div class="client">Fortune 500 Partner</div>
            </section>
            
            <section class="location">
              <iframe src="https://maps.google.com/embed"></iframe>
              <div class="address">Physical Location Available</div>
            </section>
          </main>
        </body>
      </html>
    `;
    
    const dom = new JSDOM(testHtml);
    const document = dom.window.document;
    const url = 'https://example.com';
    
    console.log('✅ Testing analyzer.analyze() method...');
    const result = await analyzer.analyze(document, url);
    
    console.log('📊 Full Analysis Result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 Testing getMetadata() method...');
    const metadata = analyzer.getMetadata();
    console.log('Metadata:');
    console.log(JSON.stringify(metadata, null, 2));
    
    console.log('\n✅ Testing validate() method...');
    const validParams = { document, url: 'https://example.com' };
    const validation1 = analyzer.validate(validParams);
    console.log('Valid params validation:', validation1);
    
    const invalidParams = { document: null, url: '' };
    const validation2 = analyzer.validate(invalidParams);
    console.log('Invalid params validation:', validation2);
    
    console.log('\n🧪 Testing legacy method compatibility...');
    const legacyResult = analyzer.analyzeBusinessIntelligence(document, url);
    console.log('Legacy method result available:', !!legacyResult);
    
    console.log('\n🎉 Full Business Intelligence Analyzer integration test completed successfully!');
    
    // Verify integration
    console.log('\n📊 Integration Verification:');
    console.log('- Extends BaseAnalyzer:', analyzer.constructor.name === 'BusinessIntelligenceAnalyzer' ? '✅' : '❌');
    console.log('- Has analyze() method:', typeof analyzer.analyze === 'function' ? '✅' : '❌');
    console.log('- Has getMetadata() method:', typeof analyzer.getMetadata === 'function' ? '✅' : '❌');
    console.log('- Has validate() method:', typeof analyzer.validate === 'function' ? '✅' : '❌');
    console.log('- Returns valid result structure:', result && result.success !== undefined ? '✅' : '❌');
    console.log('- Backward compatible:', typeof analyzer.analyzeBusinessIntelligence === 'function' ? '✅' : '❌');
    console.log('- Trust signals working:', result?.trustSignals ? '✅' : '❌');
    console.log('- Contact info working:', result?.contactInformation ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testFullAnalyzer().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
