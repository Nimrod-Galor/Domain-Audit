#!/usr/bin/env node
/**
 * Simple debug script to test PDF generation with better error handling
 */
import { downloadPDFReport } from './web/controllers/auditController.js';

console.log('🔍 Testing PDF controller directly...');

// Mock request and response objects
const mockReq = {
    params: { domain: 'httpbin.org' },
    session: { user: null }
};

const mockRes = {
    setHeader: (name, value) => console.log(`Header: ${name} = ${value}`),
    send: (data) => {
        console.log(`✅ PDF Response: ${data.length} bytes`);
        process.exit(0);
    },
    status: (code) => {
        console.log(`Status: ${code}`);
        return mockRes;
    },
    render: (template, data) => {
        console.log(`❌ Error page rendered: ${template}`);
        console.log('Error data:', data);
        process.exit(1);
    }
};

try {
    await downloadPDFReport(mockReq, mockRes);
} catch (error) {
    console.error('❌ Direct test failed:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
}
