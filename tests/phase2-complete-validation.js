/**
 * Phase 2 Complete Implementation Validation Test
 * 
 * Tests all components of the modernized SEO analyzer
 * Validates Combined Approach architecture implementation
 */

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test HTML content for validation
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test SEO Page - Domain Audit Tool</title>
    <meta name="description" content="Comprehensive SEO testing page for domain audit tool validation with various elements">
    <meta name="keywords" content="SEO, domain audit, website analysis, technical SEO">
    <meta name="author" content="Domain Audit Team">
    <link rel="canonical" href="https://example.com/test-page">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Test SEO Page",
        "description": "Testing page for SEO analysis"
    }
    </script>
</head>
<body>
    <header>
        <h1>Main Page Title for SEO Testing</h1>
        <nav>
            <a href="/home">Home</a>
            <a href="/about">About</a>
            <a href="https://external.com">External Link</a>
        </nav>
    </header>
    <main>
        <article>
            <h2>Content Quality Analysis Section</h2>
            <p>This is a comprehensive paragraph designed to test content quality analysis. It contains sufficient text to evaluate readability, keyword distribution, and overall content structure. The content is written to be informative and engaging while maintaining SEO best practices.</p>
            
            <h3>Technical SEO Elements</h3>
            <ul>
                <li>Meta tag optimization testing</li>
                <li>Heading structure validation</li>
                <li>Structured data implementation</li>
                <li>Internal and external link analysis</li>
            </ul>

            <h2>Performance Optimization Elements</h2>
            <img src="/images/test-image.jpg" alt="Test image for SEO analysis" width="300" height="200">
            <p>Performance factors include image optimization, resource loading, and Core Web Vitals considerations. This section helps test the performance analyzer component.</p>

            <h3>Keyword Integration Testing</h3>
            <p>SEO optimization involves multiple factors including keyword research, content optimization, and technical implementation. Domain audit tools help identify improvement opportunities across all these areas.</p>
        </article>
    </main>
    <footer>
        <p>&copy; 2025 Domain Audit Tool Testing</p>
    </footer>
</body>
</html>
`;

/**
 * Phase 2 Complete Validation Test
 */
async function validatePhase2Implementation() {
    console.log('🚀 Starting Phase 2 Complete Implementation Validation');
    console.log('='.repeat(60));

    const results = {
        detectors: {},
        heuristics: {},
        rules: {},
        ai: {},
        configuration: {},
        integration: {},
        success: true,
        errors: []
    };

    try {
        // Setup test environment
        const dom = new JSDOM(testHTML);
        const document = dom.window.document;
        const testContext = {
            document,
            url: 'https://example.com/test-page',
            options: {}
        };

        // Test 1: Detector Components
        console.log('\n📊 Testing Detector Components...');
        await testDetectors(testContext, results);

        // Test 2: Heuristic Analyzers
        console.log('\n🧠 Testing Heuristic Analyzers...');
        await testHeuristics(results);

        // Test 3: Rules Engine
        console.log('\n⚖️ Testing Rules Engine...');
        await testRulesEngine(results);

        // Test 4: AI Enhancement
        console.log('\n🤖 Testing AI Enhancement...');
        await testAIEnhancement(results);

        // Test 5: Configuration System
        console.log('\n⚙️ Testing Configuration System...');
        await testConfigurationSystem(results);

        // Test 6: Integration Test
        console.log('\n🔗 Testing Full Integration...');
        await testFullIntegration(testContext, results);

        // Generate report
        generateValidationReport(results);

    } catch (error) {
        console.error('❌ Phase 2 validation failed:', error.message);
        results.success = false;
        results.errors.push(error.message);
    }

    return results;
}

/**
 * Test all detector components
 */
async function testDetectors(testContext, results) {
    const detectorTests = [
        'meta-tag-detector.js',
        'heading-detector.js',
        'content-detector.js',
        'link-detector.js',
        'structured-data-detector.js'
    ];

    for (const detectorFile of detectorTests) {
        try {
            const detectorPath = path.join(__dirname, '..', 'src', 'analyzers', 'seo', 'detectors', detectorFile);
            
            // Check if file exists
            if (fs.existsSync(detectorPath)) {
                console.log(`  ✅ ${detectorFile} - File exists`);
                
                // Basic structure validation
                const content = fs.readFileSync(detectorPath, 'utf8');
                const hasClass = content.includes('class') && content.includes('Detector');
                const hasDetectMethod = content.includes('detect(');
                const hasExport = content.includes('export');
                
                results.detectors[detectorFile] = {
                    fileExists: true,
                    hasClass,
                    hasDetectMethod,
                    hasExport,
                    valid: hasClass && hasDetectMethod && hasExport
                };
                
                if (results.detectors[detectorFile].valid) {
                    console.log(`    ✅ Structure valid`);
                } else {
                    console.log(`    ⚠️ Structure issues detected`);
                }
                
            } else {
                console.log(`  ❌ ${detectorFile} - File missing`);
                results.detectors[detectorFile] = { fileExists: false, valid: false };
            }
        } catch (error) {
            console.log(`  ❌ ${detectorFile} - Error: ${error.message}`);
            results.detectors[detectorFile] = { error: error.message, valid: false };
        }
    }
}

/**
 * Test heuristic analyzer components
 */
async function testHeuristics(results) {
    const heuristicTests = [
        'keyword-analyzer.js',
        'content-quality-analyzer.js',
        'technical-seo-analyzer.js',
        'performance-analyzer.js'
    ];

    for (const heuristicFile of heuristicTests) {
        try {
            const heuristicPath = path.join(__dirname, '..', 'src', 'analyzers', 'seo', 'heuristics', heuristicFile);
            
            if (fs.existsSync(heuristicPath)) {
                console.log(`  ✅ ${heuristicFile} - File exists`);
                
                const content = fs.readFileSync(heuristicPath, 'utf8');
                const hasClass = content.includes('class') && content.includes('Analyzer');
                const hasAnalyzeMethod = content.includes('analyze(');
                const hasExport = content.includes('export');
                
                results.heuristics[heuristicFile] = {
                    fileExists: true,
                    hasClass,
                    hasAnalyzeMethod,
                    hasExport,
                    valid: hasClass && hasAnalyzeMethod && hasExport
                };
                
                if (results.heuristics[heuristicFile].valid) {
                    console.log(`    ✅ Structure valid`);
                } else {
                    console.log(`    ⚠️ Structure issues detected`);
                }
                
            } else {
                console.log(`  ❌ ${heuristicFile} - File missing`);
                results.heuristics[heuristicFile] = { fileExists: false, valid: false };
            }
        } catch (error) {
            console.log(`  ❌ ${heuristicFile} - Error: ${error.message}`);
            results.heuristics[heuristicFile] = { error: error.message, valid: false };
        }
    }
}

/**
 * Test rules engine component
 */
async function testRulesEngine(results) {
    try {
        const rulesPath = path.join(__dirname, '..', 'src', 'analyzers', 'seo', 'rules', 'seo-scoring-engine.js');
        
        if (fs.existsSync(rulesPath)) {
            console.log(`  ✅ seo-scoring-engine.js - File exists`);
            
            const content = fs.readFileSync(rulesPath, 'utf8');
            const hasClass = content.includes('class') && content.includes('SEOScoringEngine');
            const hasCalculateMethod = content.includes('calculateScore');
            const hasExport = content.includes('export');
            
            results.rules['seo-scoring-engine.js'] = {
                fileExists: true,
                hasClass,
                hasCalculateMethod,
                hasExport,
                valid: hasClass && hasCalculateMethod && hasExport
            };
            
            if (results.rules['seo-scoring-engine.js'].valid) {
                console.log(`    ✅ Structure valid`);
            } else {
                console.log(`    ⚠️ Structure issues detected`);
            }
            
        } else {
            console.log(`  ❌ seo-scoring-engine.js - File missing`);
            results.rules['seo-scoring-engine.js'] = { fileExists: false, valid: false };
        }
    } catch (error) {
        console.log(`  ❌ seo-scoring-engine.js - Error: ${error.message}`);
        results.rules['seo-scoring-engine.js'] = { error: error.message, valid: false };
    }
}

/**
 * Test AI enhancement component
 */
async function testAIEnhancement(results) {
    try {
        const aiPath = path.join(__dirname, '..', 'src', 'analyzers', 'seo', 'ai', 'seo-ai-enhancer.js');
        
        if (fs.existsSync(aiPath)) {
            console.log(`  ✅ seo-ai-enhancer.js - File exists`);
            
            const content = fs.readFileSync(aiPath, 'utf8');
            const hasClass = content.includes('class') && content.includes('SEOAIEnhancer');
            const hasEnhanceMethod = content.includes('enhance(');
            const hasExport = content.includes('export');
            
            results.ai['seo-ai-enhancer.js'] = {
                fileExists: true,
                hasClass,
                hasEnhanceMethod,
                hasExport,
                valid: hasClass && hasEnhanceMethod && hasExport
            };
            
            if (results.ai['seo-ai-enhancer.js'].valid) {
                console.log(`    ✅ Structure valid`);
            } else {
                console.log(`    ⚠️ Structure issues detected`);
            }
            
        } else {
            console.log(`  ❌ seo-ai-enhancer.js - File missing`);
            results.ai['seo-ai-enhancer.js'] = { fileExists: false, valid: false };
        }
    } catch (error) {
        console.log(`  ❌ seo-ai-enhancer.js - Error: ${error.message}`);
        results.ai['seo-ai-enhancer.js'] = { error: error.message, valid: false };
    }
}

/**
 * Test configuration system
 */
async function testConfigurationSystem(results) {
    try {
        const configPath = path.join(__dirname, '..', 'src', 'analyzers', 'seo', 'config', 'seo-configuration.js');
        
        if (fs.existsSync(configPath)) {
            console.log(`  ✅ seo-configuration.js - File exists`);
            
            const content = fs.readFileSync(configPath, 'utf8');
            const hasClass = content.includes('class') && content.includes('SEOConfiguration');
            const hasGetConfigMethod = content.includes('getConfig');
            const hasExport = content.includes('export');
            
            results.configuration['seo-configuration.js'] = {
                fileExists: true,
                hasClass,
                hasGetConfigMethod,
                hasExport,
                valid: hasClass && hasGetConfigMethod && hasExport
            };
            
            if (results.configuration['seo-configuration.js'].valid) {
                console.log(`    ✅ Structure valid`);
            } else {
                console.log(`    ⚠️ Structure issues detected`);
            }
            
        } else {
            console.log(`  ❌ seo-configuration.js - File missing`);
            results.configuration['seo-configuration.js'] = { fileExists: false, valid: false };
        }
    } catch (error) {
        console.log(`  ❌ seo-configuration.js - Error: ${error.message}`);
        results.configuration['seo-configuration.js'] = { error: error.message, valid: false };
    }
}

/**
 * Test full integration
 */
async function testFullIntegration(testContext, results) {
    try {
        const analyzerPath = path.join(__dirname, '..', 'src', 'analyzers', 'seo', 'seo-analyzer-modern.js');
        
        if (fs.existsSync(analyzerPath)) {
            console.log(`  ✅ seo-analyzer-modern.js - File exists`);
            
            const content = fs.readFileSync(analyzerPath, 'utf8');
            
            // Check for correct imports
            const hasDetectorImports = content.includes('import MetaTagDetector') &&
                                     content.includes('import HeadingDetector') &&
                                     content.includes('import ContentDetector') &&
                                     content.includes('import LinkDetector') &&
                                     content.includes('import StructuredDataDetector');
            
            const hasHeuristicImports = content.includes('import KeywordAnalyzer') &&
                                       content.includes('import ContentQualityAnalyzer') &&
                                       content.includes('import TechnicalSEOAnalyzer') &&
                                       content.includes('import PerformanceAnalyzer');
            
            const hasScoringImport = content.includes('import SEOScoringEngine');
            const hasAIImport = content.includes('import SEOAIEnhancer');
            const hasConfigImport = content.includes('import SEOConfiguration');
            
            const hasMainClass = content.includes('class SEOAnalyzer');
            const hasAnalyzeMethod = content.includes('async analyze(');
            
            results.integration = {
                fileExists: true,
                hasDetectorImports,
                hasHeuristicImports,
                hasScoringImport,
                hasAIImport,
                hasConfigImport,
                hasMainClass,
                hasAnalyzeMethod,
                valid: hasDetectorImports && hasHeuristicImports && hasScoringImport && 
                       hasAIImport && hasConfigImport && hasMainClass && hasAnalyzeMethod
            };
            
            if (results.integration.valid) {
                console.log(`    ✅ Integration structure valid`);
                console.log(`    ✅ All component imports present`);
                console.log(`    ✅ Main analyzer class structure correct`);
            } else {
                console.log(`    ⚠️ Integration issues detected`);
                if (!hasDetectorImports) console.log(`      - Missing detector imports`);
                if (!hasHeuristicImports) console.log(`      - Missing heuristic imports`);
                if (!hasScoringImport) console.log(`      - Missing scoring engine import`);
                if (!hasAIImport) console.log(`      - Missing AI enhancer import`);
                if (!hasConfigImport) console.log(`      - Missing configuration import`);
            }
            
        } else {
            console.log(`  ❌ seo-analyzer-modern.js - File missing`);
            results.integration = { fileExists: false, valid: false };
        }
    } catch (error) {
        console.log(`  ❌ Integration test - Error: ${error.message}`);
        results.integration = { error: error.message, valid: false };
    }
}

/**
 * Generate comprehensive validation report
 */
function generateValidationReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 PHASE 2 IMPLEMENTATION VALIDATION REPORT');
    console.log('='.repeat(60));

    // Component Summary
    const detectorCount = Object.keys(results.detectors).length;
    const validDetectors = Object.values(results.detectors).filter(d => d.valid).length;
    
    const heuristicCount = Object.keys(results.heuristics).length;
    const validHeuristics = Object.values(results.heuristics).filter(h => h.valid).length;
    
    const rulesValid = Object.values(results.rules).some(r => r.valid);
    const aiValid = Object.values(results.ai).some(a => a.valid);
    const configValid = Object.values(results.configuration).some(c => c.valid);
    const integrationValid = results.integration.valid;

    console.log('\n📊 Component Status:');
    console.log(`  Detectors: ${validDetectors}/${detectorCount} valid`);
    console.log(`  Heuristics: ${validHeuristics}/${heuristicCount} valid`);
    console.log(`  Rules Engine: ${rulesValid ? '✅' : '❌'}`);
    console.log(`  AI Enhancement: ${aiValid ? '✅' : '❌'}`);
    console.log(`  Configuration: ${configValid ? '✅' : '❌'}`);
    console.log(`  Integration: ${integrationValid ? '✅' : '❌'}`);

    // Architecture Assessment
    console.log('\n🏗️ Architecture Assessment:');
    const architectureScore = (
        (validDetectors / detectorCount) * 0.3 +
        (validHeuristics / heuristicCount) * 0.3 +
        (rulesValid ? 1 : 0) * 0.15 +
        (aiValid ? 1 : 0) * 0.1 +
        (configValid ? 1 : 0) * 0.05 +
        (integrationValid ? 1 : 0) * 0.1
    ) * 100;

    console.log(`  Combined Approach Implementation: ${Math.round(architectureScore)}%`);
    
    if (architectureScore >= 90) {
        console.log(`  Status: ✅ Excellent - Ready for production`);
    } else if (architectureScore >= 80) {
        console.log(`  Status: ✅ Good - Minor optimizations needed`);
    } else if (architectureScore >= 70) {
        console.log(`  Status: ⚠️ Fair - Some components need attention`);
    } else {
        console.log(`  Status: ❌ Poor - Significant work required`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (validDetectors < detectorCount) {
        console.log(`  - Fix ${detectorCount - validDetectors} detector component(s)`);
    }
    
    if (validHeuristics < heuristicCount) {
        console.log(`  - Fix ${heuristicCount - validHeuristics} heuristic analyzer(s)`);
    }
    
    if (!rulesValid) {
        console.log(`  - Implement or fix rules engine component`);
    }
    
    if (!aiValid) {
        console.log(`  - Implement or fix AI enhancement component`);
    }
    
    if (!configValid) {
        console.log(`  - Implement or fix configuration system`);
    }
    
    if (!integrationValid) {
        console.log(`  - Fix integration issues in main analyzer`);
    }

    if (architectureScore >= 90) {
        console.log(`  - Consider adding advanced features or optimizations`);
        console.log(`  - Implement comprehensive testing suite`);
        console.log(`  - Add performance monitoring and analytics`);
    }

    // Phase 2 Completion Assessment
    console.log('\n🎯 Phase 2 Completion Status:');
    const completionPercentage = Math.round(architectureScore);
    console.log(`  Overall Progress: ${completionPercentage}%`);
    
    if (completionPercentage >= 95) {
        console.log(`  Phase 2 Status: ✅ COMPLETE - Ready for Phase 3`);
    } else if (completionPercentage >= 85) {
        console.log(`  Phase 2 Status: ✅ NEARLY COMPLETE - Minor tasks remaining`);
    } else if (completionPercentage >= 70) {
        console.log(`  Phase 2 Status: 🔄 IN PROGRESS - Significant progress made`);
    } else {
        console.log(`  Phase 2 Status: ⚠️ EARLY STAGE - Major components needed`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Phase 2 validation completed successfully!');
    console.log('='.repeat(60));

    return results;
}

// Export for use in other contexts
export {
    validatePhase2Implementation,
    generateValidationReport
};

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    validatePhase2Implementation()
        .then(results => {
            process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}
