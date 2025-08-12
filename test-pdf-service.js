#!/usr/bin/env node
/**
 * Simple test script to check PDF service functionality
 */
import pdfService from './web/services/pdfService.js';

async function testPDFService() {
    console.log('🧪 Testing PDF Service...');
    
    try {
        // Check if service can initialize
        console.log('1. Testing PDF service initialization...');
        await pdfService.initialize();
        console.log('✅ PDF service initialized successfully');
        
        // Test simple PDF generation
        console.log('2. Testing PDF generation...');
        const testData = {
            domain: 'example.com',
            summary: {
                score: 85,
                grade: 'B',
                totalPages: 10,
                totalInternalLinks: 15,
                totalExternalLinks: 5,
                brokenLinks: 0
            },
            detailed: {
                mailtoLinks: ['test@example.com'],
                telLinks: ['+1234567890']
            },
            timestamp: new Date().toISOString()
        };
        
        const pdfBuffer = await pdfService.generatePDFFromData(testData, {
            includeDetailed: true,
            brandColor: '#007bff'
        });
        
        console.log(`✅ PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
        
        // Test status check
        console.log('3. Testing service status...');
        const status = pdfService.getStatus();
        console.log('✅ Service status:', status);
        
        // Cleanup
        console.log('4. Cleaning up...');
        await pdfService.cleanup();
        console.log('✅ Cleanup completed');
        
        console.log('\n🎉 All PDF service tests passed!');
        
    } catch (error) {
        console.error('❌ PDF service test failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 5).join('\n')
        });
        
        // Try to cleanup even if there was an error
        try {
            await pdfService.cleanup();
        } catch (cleanupError) {
            console.error('❌ Cleanup failed:', cleanupError.message);
        }
        
        process.exit(1);
    }
}

// Run the test
testPDFService();
