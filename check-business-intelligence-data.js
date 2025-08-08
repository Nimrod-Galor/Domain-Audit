/**
 * ============================================================================
 * BUSINESS INTELLIGENCE DATA CHECKER
 * ============================================================================
 *
 * Script to check if Business Intelligence analysis is included in audit data
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Path to the latest Google audit
const auditPath = 'audits/google.com/audit-2025-08-08-12-54-18/page-data/aHR0cHM6Ly9nb29nbGUuY29t.json.gz';

console.log('🔍 Checking Business Intelligence integration in audit data...\n');

try {
  // Read and decompress the page data
  const compressedData = fs.readFileSync(auditPath);
  const decompressedData = zlib.gunzipSync(compressedData);
  const pageData = JSON.parse(decompressedData.toString());
  
  console.log('📄 Page data loaded successfully');
  console.log('🌐 URL:', pageData.url || 'Unknown');
  
  // Check for Business Intelligence data
  if (pageData.enhanced && pageData.enhanced.businessIntelligence) {
    console.log('\n✅ SUCCESS: Business Intelligence analysis found!');
    console.log('🏢 Business Intelligence Data:');
    
    const biData = pageData.enhanced.businessIntelligence;
    
    // Check for errors first
    if (biData.error) {
      console.log(`\n⚠️ Analysis Error: ${biData.error}`);
    }
    
    // Display the raw data for debugging
    console.log('\n🔍 Raw Business Intelligence Data:');
    console.log(JSON.stringify(biData, null, 2));
    
    // Display key metrics
    if (biData.score !== undefined) {
      console.log(`\n📊 Overall Score: ${biData.score}/100`);
    }
    if (biData.grade) {
      console.log(`   🎯 Grade: ${biData.grade}`);
    }
    if (biData.businessType) {
      console.log(`   🏷️ Business Type: ${biData.businessType}`);
    }
    
    // Check main analysis categories
    const categories = [
      'trustSignals',
      'contactInformation', 
      'aboutPageQuality',
      'customerSupport',
      'businessCredibility',
      'locationData'
    ];
    
    console.log('\n📋 Analysis Categories:');
    categories.forEach(category => {
      if (biData[category]) {
        const score = biData[category].score || 'N/A';
        console.log(`   ✅ ${category}: ${score}/100`);
      } else {
        console.log(`   ❌ ${category}: Missing`);
      }
    });
    
    // Check recommendations
    if (biData.recommendations && Array.isArray(biData.recommendations)) {
      console.log(`\n💡 Recommendations: ${biData.recommendations.length} items`);
      if (biData.recommendations.length > 0) {
        console.log(`   First recommendation: ${biData.recommendations[0].title || biData.recommendations[0]}`);
      }
    }
    
    // Check strengths
    if (biData.strengths && Array.isArray(biData.strengths)) {
      console.log(`💪 Strengths: ${biData.strengths.length} identified`);
    }
    
  } else {
    console.log('\n❌ ISSUE: Business Intelligence analysis not found');
    console.log('🔍 Checking enhanced data structure...');
    
    if (pageData.enhanced) {
      console.log('✅ Enhanced data exists');
      console.log('📊 Available enhanced features:');
      Object.keys(pageData.enhanced).forEach(key => {
        if (pageData.enhanced[key] !== null) {
          console.log(`   ✅ ${key}`);
        } else {
          console.log(`   ❌ ${key}: null`);
        }
      });
    } else {
      console.log('❌ No enhanced data found');
    }
  }
  
  console.log('\n🔧 Integration Status Summary:');
  console.log(`   Main Page Data: ${pageData ? '✅' : '❌'}`);
  console.log(`   Enhanced Data: ${pageData.enhanced ? '✅' : '❌'}`);
  console.log(`   Business Intelligence: ${pageData.enhanced?.businessIntelligence ? '✅' : '❌'}`);
  
} catch (error) {
  console.error('❌ Error reading audit data:', error.message);
  console.error('🔍 Make sure the audit completed successfully and the file exists.');
}
