/**
 * Test PDF download and examine the file contents
 */

import http from 'http';
import fs from 'fs';

console.log('🔍 Testing PDF download and examining file contents...\n');

const downloadPDF = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/audit/pdf/httpbin.org',
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    console.log(`Making request to: http://localhost:3000/audit/pdf/httpbin.org`);

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response Headers:');
      Object.entries(res.headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });

      let data = Buffer.alloc(0);
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });

      res.on('end', () => {
        console.log(`\nReceived ${data.length} bytes`);
        
        if (data.length > 0) {
          // Check first few bytes
          const firstBytes = data.slice(0, 20);
          console.log('First 20 bytes as hex:', firstBytes.toString('hex'));
          console.log('First 20 bytes as string:', firstBytes.toString().replace(/[^\x20-\x7E]/g, '.'));
          
          // Check if it's a PDF
          const pdfHeader = data.slice(0, 4).toString();
          console.log(`PDF header check: "${pdfHeader}" (should be "%PDF")`);
          
          // Save to file for inspection
          const filename = 'test-download.pdf';
          fs.writeFileSync(filename, data);
          console.log(`Saved to ${filename} for inspection`);
          
          // Check if it's HTML error page
          const content = data.toString('utf8', 0, Math.min(500, data.length));
          if (content.includes('<html') || content.includes('<!DOCTYPE')) {
            console.log('\n❌ Response appears to be HTML (error page):');
            console.log(content);
          }
          
          resolve({
            success: res.statusCode === 200 && pdfHeader === '%PDF',
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            size: data.length,
            isPDF: pdfHeader === '%PDF'
          });
        } else {
          console.log('❌ No data received');
          resolve({ success: false, statusCode: res.statusCode, size: 0 });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Request failed: ${err.message}`);
      reject(err);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

// Test the PDF download
downloadPDF()
  .then(result => {
    console.log(`\n${result.success ? '🎉' : '💥'} Overall result:`, result);
    if (!result.success) {
      console.log('\n🔧 Possible issues:');
      console.log('- Server not running or not accessible');
      console.log('- PDF route returning error page instead of PDF');
      console.log('- PDF generation failing');
      console.log('- Domain validation still failing');
    }
  })
  .catch(error => {
    console.log(`💥 Test failed with error: ${error.message}`);
  });
