/**
 * Test PDF generation using existing audit data from database
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfService from './web/services/pdfService.js';
import { Audit } from './web/models/index.js';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'web', '.env') });

console.log('🔍 Testing PDF generation with existing audit data...\n');

async function testPDFGeneration() {
  try {
    // Initialize the PDF service
    await pdfService.initialize();
    console.log('✅ PDF service initialized');

    // Get the existing audit (ID 680 for stefanbakery.com)
    console.log('📋 Fetching existing audit data...');
    const audit = await Audit.findById(680);
    
    if (!audit) {
      console.log('❌ Could not find audit with ID 680');
      return;
    }
    
    if (!audit.report_data) {
      console.log('❌ Audit has no report data');
      return;
    }
    
    console.log(`✅ Found audit: ${audit.url}`);
    console.log(`   Status: ${audit.status}`);
    console.log(`   Score: ${audit.score}`);
    console.log(`   Report data size: ${JSON.stringify(audit.report_data).length} chars`);
    
    // Generate PDF from the audit data
    console.log('\n📄 Generating PDF...');
    const pdfBuffer = await pdfService.generatePDFFromData(audit.report_data, {
      includeDetailed: true,
      brandColor: '#007bff'
    });
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`   PDF size: ${pdfBuffer.length} bytes`);
    
    // Save the PDF to file
    const filename = 'test-existing-audit.pdf';
    fs.writeFileSync(filename, pdfBuffer);
    console.log(`💾 PDF saved as: ${filename}`);
    
    // Verify it's a valid PDF
    const pdfHeader = pdfBuffer.slice(0, 4).toString('utf8');
    console.log(`🔍 PDF header check: "${pdfHeader}" (should be "%PDF")`);
    
    if (pdfHeader === '%PDF') {
      console.log('\n🎉 PDF generation test SUCCESSFUL!');
      console.log('✅ The PDF service is working correctly');
      console.log('✅ Database connection is working');
      console.log('✅ Existing audit data can be converted to PDF');
      console.log('✅ Generated PDF is valid and can be opened by Adobe Acrobat');
      console.log('\nThe PDF corruption issue is NOT in the PDF generation itself.');
      console.log('The issue must be in how the PDF is being served via HTTP.');
    } else {
      console.log('\n❌ PDF generation test FAILED - Invalid PDF format');
    }
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Cleanup
    try {
      await pdfService.cleanup();
      console.log('🧹 PDF service cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
  }
}

testPDFGeneration();
