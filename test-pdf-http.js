/**
 * Test the PDF route using Node.js http module
 */

import http from 'http';

console.log('🔍 Testing PDF route with Node.js http module...\n');

const testPDFRoute = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/audit/pdf/httpbin.org',
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    };

    console.log(`Making request to: http://localhost:3000/audit/pdf/httpbin.org`);

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('Headers:', res.headers);

      let data = Buffer.alloc(0);
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ PDF route successful! Content-Length: ${data.length} bytes`);
          
          // Check if it's a PDF
          const pdfHeader = data.slice(0, 4).toString();
          console.log(`PDF header check: "${pdfHeader}" (should be "%PDF")`);
          
          resolve(true);
        } else {
          console.log(`❌ PDF route failed: ${data.toString()}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Request failed: ${err.message}`);
      reject(err);
    });

    req.end();
  });
};

// Test the PDF route
testPDFRoute()
  .then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Overall result: ${success ? 'SUCCESS' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.log(`💥 Test failed with error: ${error.message}`);
    process.exit(1);
  });
