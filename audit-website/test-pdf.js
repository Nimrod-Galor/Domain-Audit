/**
 * PDF Service Test
 * Tests the PDF generation functionality
 */
import pdfService from './services/pdfService.js';
import fs from 'fs/promises';
import path from 'path';

async function testPDFGeneration() {
    try {
        console.log('🧪 Testing PDF generation...');
        
        // Test data similar to what an audit would produce
        const testAuditData = {
            domain: 'example.com',
            grade: 'B',
            score: 85,
            totalPages: 15,
            totalLinks: 45,
            internalLinks: 30,
            externalLinks: 15,
            brokenLinks: 2,
            emails: ['contact@example.com', 'info@example.com'],
            phoneNumbers: ['+1-555-0123'],
            pages: [
                { url: 'https://example.com/', title: 'Home Page', status: 200, links: ['https://example.com/about'] },
                { url: 'https://example.com/about', title: 'About Us', status: 200, links: ['https://example.com/contact'] },
                { url: 'https://example.com/contact', title: 'Contact', status: 200, links: [] }
            ],
            timestamp: new Date().toISOString()
        };
        
        // Generate PDF
        const pdfBuffer = await pdfService.generatePDFFromData(testAuditData, {
            includeDetailed: true,
            brandColor: '#007bff'
        });
        
        // Save test PDF
        const testFilePath = path.join(process.cwd(), 'test-audit-report.pdf');
        await fs.writeFile(testFilePath, pdfBuffer);
        
        console.log('✅ PDF generated successfully!');
        console.log(`📄 Test PDF saved to: ${testFilePath}`);
        console.log(`📊 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        
        // Cleanup
        await pdfService.cleanup();
        
        return true;
        
    } catch (error) {
        console.error('❌ PDF test failed:', error);
        await pdfService.cleanup();
        return false;
    }
}

// Run the test
testPDFGeneration()
    .then(success => {
        console.log(success ? '🎉 All tests passed!' : '❌ Tests failed!');
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
