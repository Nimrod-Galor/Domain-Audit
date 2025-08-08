/**
 * ALLBIRDS E-COMMERCE ANALYSIS TEST
 * Direct analysis of the Allbirds audit to validate our e-commerce integration
 */

import { promises as fs } from 'fs';
import { CompressedPageDataManager } from './src/storage/compressed-page-data-manager.js';
import path from 'path';

async function analyzeAllbirdsAudit() {
  console.log('🔍 ANALYZING ALLBIRDS E-COMMERCE AUDIT DATA');
  console.log('='.repeat(50));
  
  const auditDir = 'c:\\Users\\Nimrod\\Documents\\javascript\\domain audit\\audits\\allbirds.com\\audit-2025-08-08-11-55-16';
  const pageDataDir = path.join(auditDir, 'page-data');
  
  try {
    // Initialize page data manager
    const pageDataManager = new CompressedPageDataManager(pageDataDir);
    
    // Load page data for the Allbirds homepage
    const url = 'https://allbirds.com';
    const pageData = await pageDataManager.get(url);
    
    console.log('📊 PAGE DATA LOADING RESULT:');
    console.log('   URL:', url);
    console.log('   Page data type:', typeof pageData);
    console.log('   Page data null?:', pageData === null);
    console.log('   Page data undefined?:', pageData === undefined);
    
    if (!pageData) {
      console.log('\n❌ NO PAGE DATA FOUND');
      console.log('Let me check what files exist in the page-data directory...');
      
      // List files in page data directory
      const files = await fs.readdir(pageDataDir);
      console.log('Files in page-data:', files);
      
      if (files.length > 0) {
        console.log('Trying to load the first file directly...');
        const firstFile = files[0];
        console.log('First file:', firstFile);
        
        // Try to decode the filename (it's base64 encoded)
        try {
          const decodedUrl = Buffer.from(firstFile.replace('.json.gz', ''), 'base64').toString();
          console.log('Decoded URL:', decodedUrl);
          
          const directPageData = await pageDataManager.get(decodedUrl);
          if (directPageData) {
            console.log('✅ Successfully loaded data for:', decodedUrl);
            console.log('Data keys:', Object.keys(directPageData));
            
            // Use this data instead
            analyzeEcommerceData(directPageData, decodedUrl);
            return;
          }
        } catch (decodeError) {
          console.log('Failed to decode filename:', decodeError.message);
        }
      }
      
      console.log('❌ Unable to load any page data');
      return;
    }
    
    console.log('   Data keys:', Object.keys(pageData));
    analyzeEcommerceData(pageData, url);
    
  } catch (error) {
    console.error('❌ Error analyzing audit data:', error);
    console.error('Stack trace:', error.stack);
  }
}

function analyzeEcommerceData(pageData, url) {
  console.log('\n📊 ANALYZING PAGE DATA');
  console.log('   URL:', url);
  console.log('   Data keys:', Object.keys(pageData));
  
  // Check for e-commerce data
  if (pageData.ecommerce) {
    console.log('\n🛍️  E-COMMERCE DATA FOUND!');
    console.log('='.repeat(30));
    
    const ecommerce = pageData.ecommerce;
    
    // Platform detection
    if (ecommerce.platform) {
      console.log('🏢 PLATFORM DETECTION:');
      console.log(`   Platform: ${ecommerce.platform.name || 'Unknown'}`);
      console.log(`   Confidence: ${Math.round((ecommerce.platform.confidence || 0) * 100)}%`);
      console.log(`   Version: ${ecommerce.platform.version || 'Unknown'}`);
      
      if (ecommerce.platform.technologies) {
        const tech = ecommerce.platform.technologies;
        if (tech.payments && tech.payments.length > 0) {
          console.log(`   Payment Methods: ${tech.payments.join(', ')}`);
        }
        if (tech.analytics && tech.analytics.length > 0) {
          console.log(`   Analytics: ${tech.analytics.join(', ')}`);
        }
        if (tech.frameworks && tech.frameworks.length > 0) {
          console.log(`   Frameworks: ${tech.frameworks.join(', ')}`);
        }
      }
    }
    
    // Overall scores
    console.log('\n📊 OVERALL SCORES:');
    console.log(`   Total Score: ${ecommerce.totalScore || 0}/100`);
    
    if (ecommerce.functionality) {
      console.log(`   Functionality: ${ecommerce.functionality.score || 0}/100`);
    }
    if (ecommerce.userExperience) {
      console.log(`   User Experience: ${ecommerce.userExperience.score || 0}/100`);
    }
    if (ecommerce.technical) {
      console.log(`   Technical: ${ecommerce.technical.score || 0}/100`);
    }
    
    // Feature analysis
    console.log('\n🎯 FEATURE ANALYSIS:');
    const features = [
      'cart', 'checkout', 'productSchema', 'payments', 'reviews', 
      'search', 'recommendations', 'wishlist', 'seo', 'mobile'
    ];
    
    let detectedFeatures = 0;
    let totalFeatures = features.length;
    
    for (const feature of features) {
      if (ecommerce[feature]) {
        const featureData = ecommerce[feature];
        const detected = featureData.detected ? '✅' : '❌';
        const score = featureData.score ? `(${featureData.score}/100)` : '';
        console.log(`   ${detected} ${feature}: ${score}`);
        
        if (featureData.detected) {
          detectedFeatures++;
        }
        
        // Show specific details for key features
        if (featureData.detected && featureData.details) {
          if (feature === 'cart' && featureData.details.cartElements) {
            console.log(`      Cart elements: ${featureData.details.cartElements.length}`);
          }
          if (feature === 'productSchema' && featureData.details.products) {
            console.log(`      Product schemas: ${featureData.details.products.length}`);
          }
          if (feature === 'payments' && featureData.details.methods) {
            console.log(`      Payment methods: ${featureData.details.methods.join(', ')}`);
          }
        }
      }
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`   Features detected: ${detectedFeatures}/${totalFeatures} (${Math.round((detectedFeatures/totalFeatures)*100)}%)`);
    
    // Validation
    const isShopify = ecommerce.platform?.name?.toLowerCase().includes('shopify');
    const hasCart = ecommerce.cart?.detected;
    const hasProducts = ecommerce.productSchema?.detected;
    const hasPayments = ecommerce.payments?.detected;
    
    console.log('\n✅ VALIDATION RESULTS:');
    console.log(`   Shopify detected: ${isShopify ? '✅' : '❌'}`);
    console.log(`   Cart functionality: ${hasCart ? '✅' : '❌'}`);
    console.log(`   Product schemas: ${hasProducts ? '✅' : '❌'}`);
    console.log(`   Payment integration: ${hasPayments ? '✅' : '❌'}`);
    
    const overallSuccess = isShopify && hasCart && hasProducts && (detectedFeatures >= 5);
    console.log(`   Overall success: ${overallSuccess ? '🎉 YES!' : '⚠️  Partial'}`);
    
    if (overallSuccess) {
      console.log('\n🎉 E-COMMERCE INTEGRATION WORKING PERFECTLY!');
      console.log('✅ Platform detection successful');
      console.log('✅ Feature detection working');
      console.log('✅ Scoring system functional');
      console.log('✅ Data structure complete');
    }
    
  } else {
    console.log('\n❌ NO E-COMMERCE DATA FOUND');
    console.log('Available data sections:', Object.keys(pageData));
  }
}

// Run the analysis
analyzeAllbirdsAudit();
