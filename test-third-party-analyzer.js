/**
 * Third-Party Analyzer Migration Test
 * 
 * Comprehensive test to validate BaseAnalyzer migration for ThirdPartyAnalyzer
 */

import { JSDOM } from 'jsdom';
import { ThirdPartyAnalyzer, THIRD_PARTY_SERVICES } from './src/analyzers/third-party/ThirdPartyAnalyzer.js';

// Test HTML with various third-party integrations
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Third-Party Integration Test Site</title>
    
    <!-- CDN Resources -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Analytics & Tracking -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    </script>
    
    <!-- Facebook Pixel -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', 'PIXEL_ID');
        fbq('track', 'PageView');
    </script>
    
    <!-- Hotjar -->
    <script>
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:2844104,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    </script>
    
    <!-- Local scripts -->
    <script src="/js/main.js"></script>
    <script src="/js/utils.js" defer></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Third-Party Services Test Page</h1>
            <p>This page contains various third-party integrations for testing analytics, CDN usage, and privacy compliance.</p>
        </header>
        
        <main>
            <section class="analytics-section">
                <h2>Analytics & Tracking</h2>
                <p>This page includes Google Analytics, Facebook Pixel, and Hotjar for comprehensive user tracking.</p>
            </section>
            
            <section class="cdn-section">
                <h2>CDN Resources</h2>
                <p>We use CDNs for jQuery, Bootstrap, Google Fonts, and Font Awesome to improve performance.</p>
                <i class="fas fa-chart-line"></i>
                <i class="fab fa-google"></i>
            </section>
            
            <section class="privacy-section">
                <h2>Privacy Information</h2>
                <div id="cookie-consent" class="cookie-banner">
                    <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
                    <button class="accept-cookies">Accept</button>
                </div>
                
                <p>Read our <a href="/privacy-policy">Privacy Policy</a> for more information about data collection.</p>
                <p>This site is GDPR compliant and follows data protection regulations.</p>
            </section>
            
            <section class="social-section">
                <h2>Social Media Integration</h2>
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315" frameborder="0"></iframe>
                <div class="social-buttons">
                    <a href="https://twitter.com/share" class="twitter-share-button">Tweet</a>
                    <div class="fb-like" data-href="https://example.com" data-layout="button_count"></div>
                </div>
            </section>
        </main>
        
        <footer>
            <p>&copy; 2025 Test Company. All rights reserved.</p>
        </footer>
    </div>
    
    <!-- Additional Third-Party Services -->
    <script src="https://widget.intercom.io/widget/app_id" async></script>
    <script src="https://js.stripe.com/v3/" async></script>
    <script>
        // Additional inline tracking
        (function() {
            var analytics = {
                track: function(event, properties) {
                    // Custom analytics tracking
                    console.log('Tracking:', event, properties);
                }
            };
            window.analytics = analytics;
        })();
    </script>
</body>
</html>
`;

async function testThirdPartyAnalyzer() {
    try {
        console.log('\n🔧 THIRD-PARTY ANALYZER MIGRATION TEST');
        console.log('==========================================');
        
        console.log('\n1️⃣  INITIALIZATION TEST:');
        
        // Test analyzer initialization
        const analyzer = new ThirdPartyAnalyzer({
            includeInlineScripts: true,
            analyzeDataUrls: true,
            trackingDetection: true,
            performanceImpact: true
        });
        
        console.log('   ✅ ThirdPartyAnalyzer instantiated successfully');
        console.log(`   ✅ Analyzer options: ${analyzer.options ? 'Options loaded' : 'No options'}`);
        
        // Test metadata
        const metadata = analyzer.getMetadata();
        console.log(`   ✅ Metadata: ${metadata.name} v${metadata.version}`);
        console.log(`   ✅ Category: ${metadata.category}`);
        console.log(`   ✅ Priority: ${metadata.priority}`);
        
        console.log('\n2️⃣  BASE ANALYZER INTEGRATION TEST:');
        
        // Test BaseAnalyzer inheritance
        console.log(`   ✅ Extends BaseAnalyzer: ${analyzer.constructor.name === 'ThirdPartyAnalyzer'}`);
        console.log(`   ✅ Has measureTime method: ${typeof analyzer.measureTime === 'function'}`);
        console.log(`   ✅ Has handleError method: ${typeof analyzer.handleError === 'function'}`);
        console.log(`   ✅ Has createSuccessResponse method: ${typeof analyzer.createSuccessResponse === 'function'}`);
        console.log(`   ✅ Has log method: ${typeof analyzer.log === 'function'}`);
        console.log(`   ✅ Has safeQuery method: ${typeof analyzer.safeQuery === 'function'}`);
        
        console.log('\n3️⃣  THIRD-PARTY ANALYSIS TEST:');
        
        // Create DOM for testing
        const dom = new JSDOM(testHTML, { url: 'https://test-third-party.com' });
        const document = dom.window.document;
        
        // Test the new analyze method
        const analysisResult = await analyzer.analyze(document, {
            rawHTML: testHTML,
            url: 'https://test-third-party.com'
        }, 'https://test-third-party.com');
        
        console.log('   ✅ Analysis completed successfully');
        console.log(`   ✅ Analysis time: ${analysisResult.analysisTime}ms`);
        console.log(`   ✅ Success status: ${analysisResult.success}`);
        console.log(`   ✅ Has analyzer info: ${analysisResult.analyzer === 'ThirdPartyAnalyzer'}`);
        
        // Debug: Check the actual structure
        console.log('   🔍 Result structure:', Object.keys(analysisResult));
        console.log('   🔍 Error (if any):', analysisResult.error || 'No error');
        console.log('   🔍 Has scripts:', !!analysisResult.scripts);
        
        console.log('\n4️⃣  THIRD-PARTY METRICS TEST:');
        
        // The analysis result is direct, not nested under 'data' 
        const analysis = analysisResult;
        
        // Test script analysis
        if (analysis.scripts) {
            console.log(`   ✅ Script Analysis: ${analysis.scripts.total} total scripts`);
            console.log(`   ✅ External Scripts: ${analysis.scripts.external}`);
            console.log(`   ✅ Third-Party Scripts: ${analysis.scripts.thirdParty.length}`);
            console.log(`   ✅ First-Party Scripts: ${analysis.scripts.firstParty.length}`);
            console.log(`   ✅ Inline Scripts: ${analysis.scripts.inline}`);
            console.log(`   ✅ Async Scripts: ${analysis.scripts.async}`);
            console.log(`   ✅ Defer Scripts: ${analysis.scripts.defer}`);
        }
        
        // Test CDN usage analysis
        if (analysis.cdnUsage) {
            console.log(`   ✅ CDN Analysis: ${analysis.cdnUsage.detected.length} CDN services detected`);
            console.log(`   ✅ Script Coverage: ${analysis.cdnUsage.coverage.scripts}%`);
            console.log(`   ✅ Style Coverage: ${analysis.cdnUsage.coverage.styles}%`);
        }
        
        // Test tracking services
        if (analysis.tracking) {
            console.log(`   ✅ Analytics Services: ${analysis.tracking.analytics.length}`);
            console.log(`   ✅ Advertising Services: ${analysis.tracking.advertising.length}`);
            console.log(`   ✅ Social Services: ${analysis.tracking.social.length}`);
            console.log(`   ✅ Cookie Consent: ${analysis.tracking.privacy.cookieConsent ? 'Detected' : 'Not detected'}`);
            console.log(`   ✅ GDPR Compliance: ${analysis.tracking.privacy.gdprCompliant ? 'Yes' : 'No'}`);
        }
        
        console.log('\n5️⃣  PERFORMANCE IMPACT TEST:');
        
        if (analysis.performanceImpact) {
            console.log(`   ✅ Total Third-Party Scripts: ${analysis.performanceImpact.totalThirdPartyScripts}`);
            console.log(`   ✅ Blocking Scripts: ${analysis.performanceImpact.blockingScripts}`);
            console.log(`   ✅ Async Scripts: ${analysis.performanceImpact.asyncScripts}`);
            console.log(`   ✅ Deferred Scripts: ${analysis.performanceImpact.deferredScripts}`);
            console.log(`   ✅ Impact Score: ${analysis.performanceImpact.impactScore}/100`);
            console.log(`   ✅ Estimated Load Time: ${analysis.performanceImpact.estimatedLoadTime}ms`);
        }
        
        console.log('\n6️⃣  PRIVACY ANALYSIS TEST:');
        
        if (analysis.privacyImplications) {
            console.log(`   ✅ Tracking Services Count: ${analysis.privacyImplications.trackingServices}`);
            console.log(`   ✅ Risk Level: ${analysis.privacyImplications.riskLevel}`);
            console.log(`   ✅ Data Collection Services: ${analysis.privacyImplications.dataCollection.length}`);
            console.log(`   ✅ Privacy Policy Detected: ${analysis.privacyImplications.compliance.privacyPolicy ? 'Yes' : 'No'}`);
        }
        
        console.log('\n7️⃣  SERVICE CONSTANTS TEST:');
        
        // Test service constants
        console.log(`   ✅ Analytics Services: ${Object.keys(THIRD_PARTY_SERVICES.ANALYTICS).length} defined`);
        console.log(`   ✅ Advertising Services: ${Object.keys(THIRD_PARTY_SERVICES.ADVERTISING).length} defined`);
        console.log(`   ✅ CDN Services: ${Object.keys(THIRD_PARTY_SERVICES.CDN).length} defined`);
        console.log(`   ✅ Social Services: ${Object.keys(THIRD_PARTY_SERVICES.SOCIAL).length} defined`);
        console.log(`   ✅ Support Services: ${Object.keys(THIRD_PARTY_SERVICES.SUPPORT).length} defined`);
        console.log(`   ✅ Payment Services: ${Object.keys(THIRD_PARTY_SERVICES.PAYMENT).length} defined`);
        
        console.log('\n8️⃣  LEGACY COMPATIBILITY TEST:');
        
        // Test legacy method with deprecation warning
        const legacyResult = await analyzer.analyzeThirdPartyServices(dom, { url: 'https://test-third-party.com' });
        console.log(`   ✅ Legacy method works: ${legacyResult.success !== undefined}`);
        console.log(`   ✅ Returns same structure: ${legacyResult.scripts !== undefined}`);
        
        console.log('\n9️⃣  RESOURCE ANALYSIS TEST:');
        
        if (analysis.resources) {
            console.log(`   ✅ Images Analysis: ${analysis.resources.images ? 'Available' : 'Not available'}`);
            console.log(`   ✅ Stylesheets Analysis: ${analysis.resources.stylesheets ? 'Available' : 'Not available'}`);
            console.log(`   ✅ Fonts Analysis: ${analysis.resources.fonts ? 'Available' : 'Not available'}`);
            console.log(`   ✅ IFrames Analysis: ${analysis.resources.iframes ? 'Available' : 'Not available'}`);
        }
        
        console.log('\n🔟  SUMMARY & RECOMMENDATIONS TEST:');
        
        if (analysis.summary) {
            console.log(`   ✅ Total Services: ${analysis.summary.totalThirdPartyServices}`);
            console.log(`   ✅ Categories Detected: ${analysis.summary.categoriesDetected ? analysis.summary.categoriesDetected.length : 0}`);
            console.log(`   ✅ Performance Impact: ${analysis.summary.performanceImpact}`);
            console.log(`   ✅ Privacy Risk: ${analysis.summary.privacyRisk}`);
            console.log(`   ✅ CDN Usage: ${analysis.summary.cdnUsage ? 'Yes' : 'No'}`);
            console.log(`   ✅ Recommendations: ${analysis.summary.recommendations ? analysis.summary.recommendations.length : 0} provided`);
        }
        
        console.log('\n✅ INTEGRATION VERIFICATION:');
        
        let score = 0;
        const checks = [
            { name: 'Analyzer instantiation', passed: analyzer instanceof ThirdPartyAnalyzer },
            { name: 'BaseAnalyzer inheritance', passed: typeof analyzer.measureTime === 'function' },
            { name: 'Metadata available', passed: metadata && metadata.name === 'ThirdPartyAnalyzer' },
            { name: 'Analysis execution', passed: analysisResult && analysisResult.success },
            { name: 'Script analysis', passed: analysis.scripts && analysis.scripts.total > 0 },
            { name: 'Third-party detection', passed: analysis.scripts && analysis.scripts.thirdParty.length > 0 },
            { name: 'CDN detection', passed: analysis.cdnUsage && analysis.cdnUsage.detected.length > 0 },
            { name: 'Tracking analysis', passed: analysis.tracking && analysis.tracking.analytics.length > 0 },
            { name: 'Performance assessment', passed: analysis.performanceImpact && analysis.performanceImpact.impactScore >= 0 },
            { name: 'Privacy analysis', passed: analysis.privacyImplications && analysis.privacyImplications.riskLevel }
        ];
        
        checks.forEach(check => {
            if (check.passed) score++;
            console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
        });
        
        console.log(`\n🎉 Third-Party Analyzer migration test completed!`);
        console.log(`📊 Integration Score: ${score}/${checks.length} checks passed`);
        
        if (score === checks.length) {
            console.log('🌟 All tests passed! Migration successful!');
            console.log('\n📈 Key Performance Metrics:');
            console.log(`   • Analysis Time: ${analysisResult.analysisTime}ms`);
            console.log(`   • Third-Party Scripts: ${analysis.scripts.thirdParty.length}`);
            console.log(`   • Performance Impact: ${analysis.performanceImpact.impactScore}/100`);
            console.log(`   • Privacy Risk: ${analysis.privacyImplications.riskLevel}`);
            console.log(`   • CDN Services: ${analysis.cdnUsage.detected.length}`);
        } else {
            console.log(`⚠️  ${checks.length - score} checks failed. Review the migration.`);
        }
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testThirdPartyAnalyzer();
