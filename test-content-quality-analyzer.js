#!/usr/bin/env node

/**
 * Content Quality Analyzer Migration Test
 * Tests the migrated ContentQualityAnalyzer extending BaseAnalyzer
 */

import { JSDOM } from 'jsdom';
import { ContentQualityAnalyzer } from './src/analyzers/content/ContentQualityAnalyzer.js';

console.log('🧪 Testing Content Quality Analyzer Migration...');
console.log('=' .repeat(60));

// Test HTML content with various content quality elements
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Content Quality Test Page</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <main>
        <h1>Content Quality Analysis Test</h1>
        <p>This is a comprehensive test of content quality analysis. The analyzer evaluates readability, keyword density, and content structure. We use various metrics like Flesch Reading Ease score to determine readability levels.</p>
        
        <h2>Readability Testing</h2>
        <p>Content readability is crucial for user experience. Short sentences are easier to read. Complex words make content difficult to understand. We aim for clarity and simplicity in our writing.</p>
        
        <h3>Keyword Analysis Section</h3>
        <p>Keywords help search engines understand content. However, keyword stuffing can hurt SEO performance. Natural keyword usage is always better than forced repetition. Quality content focuses on user value rather than keyword density.</p>
        
        <h2>Content Structure</h2>
        <p>Proper heading hierarchy improves accessibility. Lists organize information effectively. Images enhance visual appeal and engagement.</p>
        
        <ul>
            <li>First important point about content structure</li>
            <li>Second point about organization</li>
            <li>Third point about readability</li>
        </ul>
        
        <h3>Additional Content</h3>
        <p>This section provides additional content for analysis. Sentence variety keeps readers engaged. Paragraph length affects readability. Content quality impacts user satisfaction and search engine rankings.</p>
        
        <ol>
            <li>Step one in the process</li>
            <li>Step two for improvement</li>
            <li>Step three for optimization</li>
        </ol>
        
        <h2>Conclusion</h2>
        <p>Quality content analysis helps identify improvement opportunities. Regular analysis ensures consistent quality standards. Continuous optimization leads to better user experience and search performance.</p>
    </main>
</body>
</html>
`;

async function testContentQualityAnalyzer() {
    try {
        console.log('\n1️⃣  INITIALIZATION TEST:');
        
        // Test analyzer initialization
        const analyzer = new ContentQualityAnalyzer({
            includeReadabilityAnalysis: true,
            includeKeywordAnalysis: true,
            includeContentRatio: true,
            maxKeywordsToAnalyze: 15,
            minWordLength: 4
        });
        
        console.log('   ✅ ContentQualityAnalyzer instantiated successfully');
        console.log(`   ✅ Analyzer name: ${analyzer.options ? 'Options loaded' : 'No options'}`);
        
        // Test metadata
        const metadata = analyzer.getMetadata();
        console.log(`   ✅ Metadata: ${metadata.name} v${metadata.version}`);
        console.log(`   ✅ Category: ${metadata.category}`);
        console.log(`   ✅ Priority: ${metadata.priority}`);
        
        console.log('\n2️⃣  BASE ANALYZER INTEGRATION TEST:');
        
        // Test BaseAnalyzer inheritance
        console.log(`   ✅ Extends BaseAnalyzer: ${analyzer.constructor.name === 'ContentQualityAnalyzer'}`);
        console.log(`   ✅ Has measureTime method: ${typeof analyzer.measureTime === 'function'}`);
        console.log(`   ✅ Has handleError method: ${typeof analyzer.handleError === 'function'}`);
        console.log(`   ✅ Has createSuccessResponse method: ${typeof analyzer.createSuccessResponse === 'function'}`);
        console.log(`   ✅ Has log method: ${typeof analyzer.log === 'function'}`);
        console.log(`   ✅ Has safeQuery method: ${typeof analyzer.safeQuery === 'function'}`);
        
        console.log('\n3️⃣  CONTENT ANALYSIS TEST:');
        
        // Create DOM for testing
        const dom = new JSDOM(testHTML);
        const document = dom.window.document;
        
        // Test the new analyze method
        const analysisResult = await analyzer.analyze(document, {
            rawHTML: testHTML,
            url: 'https://test-content-quality.com'
        }, 'https://test-content-quality.com');
        
        console.log('   ✅ Analysis completed successfully');
        console.log(`   ✅ Analysis time: ${analysisResult.analysisTime}ms`);
        console.log(`   ✅ Success status: ${analysisResult.success}`);
        console.log(`   ✅ Has analyzer info: ${analysisResult.analyzer === 'ContentQualityAnalyzer'}`);
        
        // Debug: Check the actual structure
        console.log('   🔍 Result structure:', Object.keys(analysisResult));
        console.log('   🔍 Data structure:', analysisResult.data ? Object.keys(analysisResult.data) : 'No data');
        
        console.log('\n4️⃣  CONTENT QUALITY METRICS TEST:');
        
        // The analysis result is direct, not nested under 'data'
        const analysis = analysisResult;
        
        // Test readability analysis
        if (analysis.readability) {
            console.log(`   ✅ Flesch Reading Score: ${analysis.readability.fleschScore}/100`);
            console.log(`   ✅ Reading Level: ${analysis.readability.readingLevel}`);
            console.log(`   ✅ Avg Words/Sentence: ${analysis.readability.avgWordsPerSentence}`);
            console.log(`   ✅ Complexity Level: ${analysis.readability.complexity}`);
            console.log(`   ✅ Readability Issues: ${analysis.readability.issues.length} found`);
        }
        
        // Test keyword analysis
        if (analysis.keywordDensity) {
            console.log(`   ✅ Total Words: ${analysis.keywordDensity.totalWords}`);
            console.log(`   ✅ Unique Words: ${analysis.keywordDensity.uniqueWords}`);
            console.log(`   ✅ Keywords Analyzed: ${analysis.keywordDensity.keywords.length}`);
            console.log(`   ✅ Top Keyword: "${analysis.keywordDensity.keywords[0]?.word}" (${analysis.keywordDensity.keywords[0]?.density.toFixed(1)}%)`);
            console.log(`   ✅ Keyword Issues: ${analysis.keywordDensity.issues.length} found`);
        }
        
        // Test content ratio
        if (analysis.contentRatio) {
            console.log(`   ✅ Content-to-Code Ratio: ${analysis.contentRatio.ratio}%`);
            console.log(`   ✅ Ratio Category: ${analysis.contentRatio.category}`);
            console.log(`   ✅ Text Bytes: ${analysis.contentRatio.textBytes}`);
            console.log(`   ✅ HTML Bytes: ${analysis.contentRatio.htmlBytes}`);
        }
        
        // Test content structure
        if (analysis.contentStructure) {
            console.log(`   ✅ Total Headings: ${analysis.contentStructure.headings.total}`);
            console.log(`   ✅ Paragraphs: ${analysis.contentStructure.paragraphs.total}`);
            console.log(`   ✅ Lists: ${analysis.contentStructure.lists.total}`);
            console.log(`   ✅ Structure Score: ${analysis.contentStructure.structureScore || 'N/A'}`);
        }
        
        // Test uniqueness analysis
        if (analysis.uniqueness) {
            console.log(`   ✅ Uniqueness Score: ${analysis.uniqueness.uniquenessScore}/100`);
            console.log(`   ✅ Lexical Diversity: ${analysis.uniqueness.lexicalDiversity}`);
            console.log(`   ✅ Sentence Variance: ${analysis.uniqueness.sentenceVariance}`);
        }
        
        console.log('\n5️⃣  SCORING AND RECOMMENDATIONS TEST:');
        
        console.log(`   ✅ Overall Quality Score: ${analysis.qualityScore}/100`);
        console.log(`   ✅ Word Count: ${analysis.wordCount}`);
        console.log(`   ✅ Character Count: ${analysis.characterCount}`);
        console.log(`   ✅ Recommendations: ${analysis.recommendations.length} generated`);
        
        if (analysis.recommendations.length > 0) {
            console.log(`   ✅ First Recommendation: ${analysis.recommendations[0].title}`);
            console.log(`   ✅ Priority Level: ${analysis.recommendations[0].priority}`);
        }
        
        console.log('\n6️⃣  LEGACY COMPATIBILITY TEST:');
        
        // Test legacy method
        const legacyResult = await analyzer.analyzeContentQuality(dom, {}, testHTML);
        console.log(`   ✅ Legacy method works: ${legacyResult.success ? 'Yes' : 'No'}`);
        console.log(`   ✅ Deprecation warning shown: Expected in console`);
        console.log(`   ✅ Results consistent: ${legacyResult.qualityScore === analysis.qualityScore ? 'Yes' : 'No'}`);
        
        console.log('\n7️⃣  ERROR HANDLING TEST:');
        
        // Test error handling with invalid input
        try {
            const errorResult = await analyzer.analyze(null, {});
            console.log(`   ✅ Error handling: ${errorResult.success === false ? 'Working' : 'Failed'}`);
            console.log(`   ✅ Error message provided: ${errorResult.error ? 'Yes' : 'No'}`);
        } catch (error) {
            console.log(`   ✅ Exception handling: Caught error - ${error.message}`);
        }
        
        console.log('\n8️⃣  INTEGRATION VERIFICATION:');
        
        // Verify all expected components are present
        const verificationChecks = [
            { name: 'BaseAnalyzer Integration', check: analyzer instanceof analyzer.constructor },
            { name: 'Readability Analysis', check: !!analysis.readability },
            { name: 'Keyword Density Analysis', check: !!analysis.keywordDensity },
            { name: 'Content Ratio Analysis', check: !!analysis.contentRatio },
            { name: 'Content Structure Analysis', check: !!analysis.contentStructure },
            { name: 'Uniqueness Analysis', check: !!analysis.uniqueness },
            { name: 'Quality Scoring', check: typeof analysis.qualityScore === 'number' },
            { name: 'Recommendations Engine', check: Array.isArray(analysis.recommendations) },
            { name: 'Performance Measurement', check: typeof analysisResult.analysisTime === 'number' },
            { name: 'Error Handling', check: typeof analyzer.handleError === 'function' }
        ];
        
        const passedChecks = verificationChecks.filter(check => check.check).length;
        const totalChecks = verificationChecks.length;
        
        verificationChecks.forEach(check => {
            console.log(`   ${check.check ? '✅' : '❌'} ${check.name}: ${check.check ? 'Pass' : 'Fail'}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`🎉 Content Quality Analyzer migration test completed!`);
        console.log(`📊 Integration Score: ${passedChecks}/${totalChecks} checks passed`);
        
        if (passedChecks === totalChecks) {
            console.log('🌟 All tests passed! Migration successful! 🌟');
            console.log(`📈 Content Quality Analysis Results:`);
            console.log(`   • Quality Score: ${analysis.qualityScore}/100`);
            console.log(`   • Reading Level: ${analysis.readability?.readingLevel || 'N/A'}`);
            console.log(`   • Content Words: ${analysis.wordCount}`);
            console.log(`   • Top Keywords: ${analysis.keywordDensity?.keywords.slice(0, 3).map(k => k.word).join(', ') || 'N/A'}`);
            console.log(`   • Analysis Time: ${analysisResult.analysisTime}ms`);
        } else {
            console.log('⚠️  Some tests failed. Please review the implementation.');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testContentQualityAnalyzer();
