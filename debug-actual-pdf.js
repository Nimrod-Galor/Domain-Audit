/**
 * Debug the actual PDF file that was generated
 */

import fs from 'fs';

try {
  const pdfData = fs.readFileSync('test-existing-audit.pdf');
  
  console.log('PDF file size:', pdfData.length, 'bytes');
  console.log('First 20 bytes as array:', Array.from(pdfData.slice(0, 20)));
  console.log('First 20 bytes as string:', pdfData.slice(0, 20).toString('utf8'));
  console.log('First 20 bytes as hex:', pdfData.slice(0, 20).toString('hex'));
  
  // Check specifically for PDF header
  const header = pdfData.slice(0, 4);
  console.log('PDF header bytes:', Array.from(header));
  console.log('PDF header as string:', header.toString('utf8'));
  console.log('PDF header as ASCII:', Array.from(header).map(b => String.fromCharCode(b)).join(''));
  
  // Check if PDF can be opened
  console.log('\nPDF Header Analysis:');
  if (header.toString('utf8') === '%PDF') {
    console.log('✅ Valid PDF header detected');
  } else {
    console.log('❌ Invalid PDF header');
    console.log('Expected: %PDF');
    console.log('Got:', header.toString('utf8'));
  }
  
} catch (error) {
  console.error('Error reading PDF file:', error.message);
}
