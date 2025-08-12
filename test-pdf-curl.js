/**
 * Test the PDF route using a simple HTTP get and save what we actually receive
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

console.log('🔍 Testing PDF route using curl and saving response...\n');

async function testPDFRoute() {
  try {
    console.log('Making request to PDF route...');
    
    // Use curl to download and save the response
    const curlCommand = `curl -L -o "pdf-route-response.bin" -w "%{http_code}|%{content_type}|%{size_download}" "http://localhost:3000/audit/pdf/httpbin.org"`;
    
    const { stdout, stderr } = await execAsync(curlCommand);
    console.log('Curl output:', stdout);
    
    if (stderr) {
      console.log('Curl stderr:', stderr);
    }
    
    // Parse the curl response info
    const [statusCode, contentType, size] = stdout.trim().split('|');
    console.log(`\nResponse Info:`);
    console.log(`- Status Code: ${statusCode}`);
    console.log(`- Content-Type: ${contentType}`);
    console.log(`- Size: ${size} bytes`);
    
    // Check what we actually received
    if (fs.existsSync('pdf-route-response.bin')) {
      const responseData = fs.readFileSync('pdf-route-response.bin');
      console.log(`\nActual response size: ${responseData.length} bytes`);
      
      // Check first bytes
      const firstBytes = responseData.slice(0, 20);
      console.log('First 20 bytes as string:', firstBytes.toString('utf8').replace(/[^\x20-\x7E]/g, '.'));
      console.log('First 20 bytes as hex:', firstBytes.toString('hex'));
      
      // Check if it's a PDF
      const pdfHeader = responseData.slice(0, 4).toString('utf8');
      console.log(`PDF header: "${pdfHeader}"`);
      
      if (pdfHeader === '%PDF') {
        console.log('✅ Response is a valid PDF!');
        // Rename to .pdf for testing
        fs.renameSync('pdf-route-response.bin', 'pdf-route-response.pdf');
        console.log('💾 Saved as pdf-route-response.pdf');
      } else {
        console.log('❌ Response is not a PDF');
        // Check if it's HTML (error page)
        const content = responseData.toString('utf8', 0, Math.min(500, responseData.length));
        if (content.includes('<html') || content.includes('<!DOCTYPE')) {
          console.log('📄 Response appears to be HTML (error page):');
          console.log(content);
        } else {
          console.log('📄 Response content preview:');
          console.log(content);
        }
      }
    } else {
      console.log('❌ No response file created');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPDFRoute();
