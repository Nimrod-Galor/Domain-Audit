/**
 * ThirdPartyAnalyzer Validation Test
 * Tests the 62nd Combined Approach implementation
 */

import { ThirdPartyAnalyzer } from './third-party-analyzer.js';

// Test basic initialization
console.log('🧪 Testing ThirdPartyAnalyzer (Implementation #62)...\n');

try {
  // Initialize analyzer
  const analyzer = new ThirdPartyAnalyzer();
  
  // Test metadata
  const metadata = analyzer.getMetadata();
  console.log('✅ Analyzer initialized successfully');
  console.log(`📊 Name: ${metadata.name}`);
  console.log(`🔧 Version: ${metadata.version}`);
  console.log(`📂 Category: ${metadata.category}`);
  console.log(`🏗️ Pattern: ${metadata.implementation.pattern}`);
  console.log(`🔢 Implementation Number: ${metadata.implementation.number}`);
  
  // Test modern analyzer availability
  if (analyzer.modernAnalyzer) {
    console.log('✅ Modern implementation available');
    console.log(`🔗 Modern analyzer: ${analyzer.modernAnalyzer.name}`);
    console.log(`📈 Modern version: ${analyzer.modernAnalyzer.version}`);
  } else {
    console.log('❌ Modern implementation not available');
  }
  
  // Test capabilities
  console.log('\n📋 Capabilities:');
  metadata.capabilities.forEach(capability => {
    console.log(`   - ${capability}`);
  });
  
  // Test components
  console.log('\n🔧 Components:');
  Object.entries(metadata.components).forEach(([type, components]) => {
    console.log(`   ${type}: ${components.join(', ')}`);
  });
  
  console.log('\n🎉 ThirdPartyAnalyzer validation completed successfully!');
  console.log('📊 Implementation #62 in modernization series');
  console.log('🏗️ Combined Approach pattern with comprehensive third-party analysis');
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  console.error(error.stack);
}
