/**
 * Test the PDF route after fixing validation
 */

console.log('🔍 Testing PDF route after validation fix...\n');

const testPDFRoute = async (domain) => {
  try {
    console.log(`Testing PDF route for domain: ${domain}`);
    
    const response = await fetch(`http://localhost:3000/audit/pdf/${domain}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      console.log(`✅ PDF route successful! Content-Length: ${contentLength} bytes`);
      
      // Just read a small portion to verify it's PDF
      const buffer = await response.arrayBuffer();
      const firstBytes = new Uint8Array(buffer.slice(0, 10));
      const pdfHeader = Array.from(firstBytes).map(b => String.fromCharCode(b)).join('');
      console.log(`PDF header check: "${pdfHeader}" (should start with "%PDF")`);
      
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ PDF route failed: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
};

// Test with the previously failing domain
testPDFRoute('httpbin.org').then(success => {
  console.log(`\n${success ? '🎉' : '💥'} Overall result: ${success ? 'SUCCESS' : 'FAILED'}`);
});
