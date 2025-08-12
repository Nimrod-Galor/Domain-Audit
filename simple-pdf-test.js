/**
 * Simple HTTP test without importing any app modules
 */

import http from 'http';
import fs from 'fs';

console.log('🔍 Testing PDF route with simple HTTP client...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/audit/pdf/httpbin.org',
  method: 'GET',
  headers: {
    'Accept': 'application/pdf',
    'User-Agent': 'TestClient/1.0'
  }
};

console.log('Making request to PDF route...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('Headers:', res.headers);

  let data = Buffer.alloc(0);
  res.on('data', (chunk) => {
    data = Buffer.concat([data, chunk]);
  });

  res.on('end', () => {
    console.log(`\nReceived ${data.length} bytes`);
    
    if (data.length > 0) {
      // Save response
      fs.writeFileSync('pdf-response.bin', data);
      
      // Check first bytes
      const firstBytes = data.slice(0, 20);
      console.log('First 20 bytes as hex:', firstBytes.toString('hex'));
      console.log('First 20 bytes as string:', firstBytes.toString('utf8').replace(/[^\x20-\x7E]/g, '.'));
      
      // Check if it's a PDF
      const pdfHeader = data.slice(0, 4).toString('utf8');
      console.log(`PDF header: "${pdfHeader}"`);
      
      if (pdfHeader === '%PDF') {
        console.log('✅ Response is a valid PDF!');
        fs.renameSync('pdf-response.bin', 'pdf-response.pdf');
        console.log('💾 Saved as pdf-response.pdf - this should open in Adobe Acrobat');
      } else {
        console.log('❌ Response is not a PDF');
        // Check if it's HTML (error page)
        const content = data.toString('utf8', 0, Math.min(1000, data.length));
        if (content.includes('<html') || content.includes('<!DOCTYPE')) {
          console.log('📄 Response is HTML (likely error page):');
          console.log(content);
        }
      }
    } else {
      console.log('❌ No data received');
    }
  });
});

req.on('error', (err) => {
  console.log(`❌ Request failed: ${err.message}`);
});

req.setTimeout(30000, () => {
  req.destroy();
  console.log('❌ Request timeout');
});

req.end();
