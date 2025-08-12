#!/usr/bin/env node
/**
 * Debug script to test PDF route functionality
 */
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadPDFReport } from './web/controllers/auditController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugPDFRoute() {
    console.log('🔍 Debugging PDF route...');
    
    const app = express();
    
    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Session middleware (minimal)
    app.use(session({
        secret: 'debug-secret',
        resave: false,
        saveUninitialized: false
    }));
    
    // View engine for error rendering
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'web', 'views'));
    
    // Add error handler with detailed logging
    app.use((error, req, res, next) => {
        console.error('❌ Route error details:');
        console.error('- Message:', error.message);
        console.error('- Stack:', error.stack);
        if (error.cause) {
            console.error('- Cause:', error.cause);
        }
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    });
    
    // Debug route
    app.get('/debug-pdf/:domain', async (req, res, next) => {
        console.log('🧪 Testing PDF route for domain:', req.params.domain);
        
        try {
            // Mock session
            req.session = { user: null };
            
            // Call the actual PDF controller
            await downloadPDFReport(req, res);
            
        } catch (error) {
            console.error('❌ PDF route error:', error);
            next(error);
        }
    });
    
    const PORT = 3001; // Use different port to avoid conflicts
    app.listen(PORT, () => {
        console.log(`🚀 Debug server running on port ${PORT}`);
        console.log('📋 Testing PDF route...');
        
        // Test the route
        setTimeout(async () => {
            try {
                const response = await fetch(`http://localhost:${PORT}/debug-pdf/google.com`);
                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (response.status === 200) {
                    const contentLength = response.headers.get('content-length');
                    console.log(`✅ PDF generation successful! Size: ${contentLength} bytes`);
                } else {
                    const text = await response.text();
                    console.log('❌ PDF generation failed:', text);
                }
            } catch (error) {
                console.error('❌ Test request failed:', error.message);
            } finally {
                process.exit(0);
            }
        }, 1000);
    });
}

debugPDFRoute();
