/**
 * SIMPLE PAGE DATA TEST
 */
import { promises as fs } from 'fs';
import zlib from 'zlib';

console.log('🔍 SIMPLE PAGE DATA TEST');

try {
  const pageDataFile = 'c:\\Users\\Nimrod\\Documents\\javascript\\domain audit\\audits\\allbirds.com\\audit-2025-08-08-11-55-16\\page-data\\aHR0cHM6Ly9hbGxiaXJkcy5jb20.json.gz';
  
  console.log('Reading compressed file...');
  const compressedData = await fs.readFile(pageDataFile);
  console.log(`File size: ${compressedData.length} bytes`);
  
  console.log('Decompressing...');
  const decompressed = await new Promise((resolve, reject) => {
    zlib.gunzip(compressedData, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  
  console.log('Parsing JSON...');
  const pageData = JSON.parse(decompressed.toString());
  
  console.log('✅ Successfully loaded page data');
  console.log('Data keys:', Object.keys(pageData));
  
  if (pageData.ecommerce) {
    console.log('\n🛍️  E-COMMERCE DATA FOUND!');
    const ecommerce = pageData.ecommerce;
    
    console.log('E-commerce keys:', Object.keys(ecommerce));
    
    if (ecommerce.platform) {
      console.log(`Platform: ${ecommerce.platform.name}`);
      console.log(`Confidence: ${Math.round((ecommerce.platform.confidence || 0) * 100)}%`);
    }
    
    if (ecommerce.totalScore) {
      console.log(`Total Score: ${ecommerce.totalScore}/100`);
    }
    
    // Check key features
    const features = ['cart', 'checkout', 'productSchema', 'payments'];
    for (const feature of features) {
      if (ecommerce[feature]) {
        console.log(`${feature}: ${ecommerce[feature].detected ? '✅' : '❌'} (${ecommerce[feature].score || 0}/100)`);
      }
    }
  } else if (pageData.enhanced && pageData.enhanced.ecommerce) {
    console.log('\n🛍️  E-COMMERCE DATA FOUND IN ENHANCED SECTION!');
    const ecommerce = pageData.enhanced.ecommerce;
    
    console.log('E-commerce keys:', Object.keys(ecommerce));
    
    if (ecommerce.platform) {
      console.log(`Platform: ${ecommerce.platform.name}`);
      console.log(`Confidence: ${Math.round((ecommerce.platform.confidence || 0) * 100)}%`);
    }
    
    if (ecommerce.totalScore) {
      console.log(`Total Score: ${ecommerce.totalScore}/100`);
    }
    
    // Check key features
    const features = ['cart', 'checkout', 'productSchema', 'payments'];
    for (const feature of features) {
      if (ecommerce[feature]) {
        console.log(`${feature}: ${ecommerce[feature].detected ? '✅' : '❌'} (${ecommerce[feature].score || 0}/100)`);
      }
    }
  } else {
    console.log('❌ No e-commerce data found');
    console.log('Available sections:', Object.keys(pageData));
    
    // Check if enhanced section exists and what it contains
    if (pageData.enhanced) {
      console.log('\n🔍 Enhanced section found:');
      console.log('Enhanced keys:', Object.keys(pageData.enhanced));
      
      // Check the ecommerceAnalysis specifically
      if (pageData.enhanced.ecommerceAnalysis) {
        console.log('\n🛍️  E-COMMERCE ANALYSIS FOUND!');
        const ecommerce = pageData.enhanced.ecommerceAnalysis;
        
        console.log('E-commerce analysis keys:', Object.keys(ecommerce));
        console.log('E-commerce analysis value:', ecommerce);
        console.log('E-commerce analysis type:', typeof ecommerce);
        
        if (Object.keys(ecommerce).length === 0) {
          console.log('⚠️  E-commerce analysis is empty object');
        }
        
        if (ecommerce.platform) {
          console.log(`Platform: ${ecommerce.platform.name}`);
          console.log(`Confidence: ${Math.round((ecommerce.platform.confidence || 0) * 100)}%`);
        }
        
        if (ecommerce.totalScore) {
          console.log(`Total Score: ${ecommerce.totalScore}/100`);
        }
        
        // Check key features
        const features = ['cart', 'checkout', 'productSchema', 'payments'];
        for (const feature of features) {
          if (ecommerce[feature]) {
            console.log(`${feature}: ${ecommerce[feature].detected ? '✅' : '❌'} (${ecommerce[feature].score || 0}/100)`);
          }
        }
        
        console.log('\n🎉 E-COMMERCE INTEGRATION WORKING!');
      } else {
        console.log('❌ No ecommerceAnalysis in enhanced section');
      }
      
      // Check for any e-commerce related data
      const enhancedStr = JSON.stringify(pageData.enhanced).toLowerCase();
      if (enhancedStr.includes('shopify') || enhancedStr.includes('ecommerce') || enhancedStr.includes('cart')) {
        console.log('🛍️  E-commerce related content found in enhanced section');
      }
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
