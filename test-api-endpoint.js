// Simple test to verify the audit API endpoint
console.log('🌐 Testing audit API endpoint...');

const testUrl = 'http://localhost:3000/api/v1/audits';

fetch(testUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    domain: 'example.com',
    auditType: 'comprehensive'
  })
}).then(response => response.json())
  .then(data => {
    console.log('📊 API Response:', data);
    if (data.success) {
      console.log('✅ Audit submitted successfully');
      console.log('🔗 Job ID:', data.jobId);
      
      // Check the audit result after a delay
      setTimeout(() => {
        fetch(`${testUrl}/${data.jobId}`)
          .then(response => response.json())
          .then(result => {
            console.log('📈 Audit Result:');
            console.log('- Overall Score:', result?.report_data?.summary?.overall_score);
            console.log('- Has Recommendations:', result?.report_data?.recommendations ? 'Yes' : 'No');
          })
          .catch(error => console.error('❌ Error fetching result:', error));
      }, 10000); // Wait 10 seconds
    }
  })
  .catch(error => {
    console.error('❌ API Test failed:', error);
  });

// Keep the script running for a bit
setTimeout(() => {
  console.log('✅ Test completed');
  process.exit(0);
}, 15000);
