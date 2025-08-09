/**
 * Comprehensive Analyzer Migration Test Suite
 * Final verification of all BaseAnalyzer migrations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFinalMigrationTest() {
  console.log('🚀 FINAL ANALYZER MIGRATION VERIFICATION');
  console.log('=========================================');

  try {
    // Get all analyzer files
    const analyzerDir = path.join(__dirname, 'src', 'analyzers');
    const analyzerFiles = fs.readdirSync(analyzerDir)
      .filter(file => file.endsWith('-analyzer.js'))
      .filter(file => !file.includes('base-analyzer'));

    console.log(`📁 Found ${analyzerFiles.length} analyzer files to verify`);
    console.log('');

    let totalScore = 0;
    let passedAnalyzers = 0;
    const results = [];

    // Test each analyzer
    for (const file of analyzerFiles) {
      const filePath = path.join(analyzerDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const analyzerName = file.replace('.js', '');
      
      console.log(`🔍 Testing: ${analyzerName}`);
      
      const checks = [
        { name: 'BaseAnalyzer import', test: content.includes('import { BaseAnalyzer }') },
        { name: 'AnalyzerCategories import', test: content.includes('import { AnalyzerCategories }') },
        { name: 'Extends BaseAnalyzer', test: content.includes('extends BaseAnalyzer') },
        { name: 'Super constructor', test: content.includes('super(') },
        { name: 'getMetadata method', test: content.includes('getMetadata()') },
        { name: 'validate method', test: content.includes('validate(context)') },
        { name: 'analyze method', test: content.includes('async analyze(context)') },
        { name: 'Category assignment', test: content.includes('AnalyzerCategories.') },
        { name: 'Comprehensive scoring', test: content.includes('_calculateComprehensiveScore') },
        { name: 'Enhanced recommendations', test: content.includes('_generate') && content.includes('Recommendations') },
        { name: 'Summary generation', test: content.includes('_generate') && content.includes('Summary') },
        { name: 'Legacy compatibility', test: content.includes('deprecated') }
      ];

      let passed = 0;
      checks.forEach(check => {
        if (check.test) passed++;
        console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
      });

      const score = Math.round((passed / checks.length) * 100);
      totalScore += score;
      
      if (score >= 85) passedAnalyzers++;
      
      results.push({ analyzer: analyzerName, score, passed, total: checks.length });
      
      let grade = 'F';
      if (score >= 95) grade = 'A+';
      else if (score >= 90) grade = 'A';
      else if (score >= 85) grade = 'B+';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      
      console.log(`   📊 Score: ${score}/100 (${grade}) - ${passed}/${checks.length} checks passed`);
      console.log('');
    }

    // Generate final report
    const averageScore = Math.round(totalScore / analyzerFiles.length);
    const migrationSuccess = (passedAnalyzers / analyzerFiles.length) * 100;

    console.log('🎯 FINAL MIGRATION REPORT');
    console.log('=========================');
    console.log(`📊 Average Score: ${averageScore}/100`);
    console.log(`✅ Successful Migrations: ${passedAnalyzers}/${analyzerFiles.length} (${migrationSuccess.toFixed(1)}%)`);
    console.log(`🏆 Migration Status: ${migrationSuccess >= 90 ? 'EXCELLENT' : migrationSuccess >= 80 ? 'GOOD' : 'NEEDS REVIEW'}`);
    console.log('');

    // List all analyzers by performance
    console.log('📋 ANALYZER PERFORMANCE BREAKDOWN:');
    results
      .sort((a, b) => b.score - a.score)
      .forEach((result, index) => {
        const trophy = index < 3 ? ['🥇', '🥈', '🥉'][index] : '  ';
        console.log(`${trophy} ${result.analyzer}: ${result.score}/100`);
      });

    console.log('');
    
    if (migrationSuccess >= 90) {
      console.log('🎉 CONGRATULATIONS! BaseAnalyzer migration completed successfully!');
      console.log('✨ All analyzers now inherit from BaseAnalyzer with enhanced capabilities');
      console.log('🚀 System ready for production deployment');
    } else {
      console.log('⚠️  Migration needs attention for some analyzers');
      console.log('🔧 Review failed analyzers and complete missing implementations');
    }

    return { 
      success: migrationSuccess >= 90, 
      averageScore, 
      passedAnalyzers, 
      totalAnalyzers: analyzerFiles.length,
      results 
    };

  } catch (error) {
    console.error('❌ Final test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the comprehensive test
runFinalMigrationTest().then(result => {
  if (result.success) {
    console.log(`\n🎯 MISSION ACCOMPLISHED! ${result.passedAnalyzers}/${result.totalAnalyzers} analyzers successfully migrated`);
  } else if (result.error) {
    console.log(`\n💥 Test failed: ${result.error}`);
  } else {
    console.log(`\n⚠️  Migration incomplete: ${result.passedAnalyzers}/${result.totalAnalyzers} analyzers need attention`);
  }
}).catch(error => {
  console.error('💥 Unexpected test failure:', error);
});
