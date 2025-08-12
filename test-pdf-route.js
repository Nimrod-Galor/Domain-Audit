#!/usr/bin/env node
/**
 * Test script to check PDF route functionality
 */
import express from 'express';
import request from 'supertest';
import { downloadPDFReport } from './web/controllers/auditController.js';

async function testPDFRoute() {
    console.log('🧪 Testing PDF route...');
    
    try {
        // Create a minimal Express app for testing
        const app = express();
        
        // Mock session middleware
        app.use((req, res, next) => {
            req.session = { user: null };
            next();
        });
        
        // Add the PDF route
        app.get('/audit/pdf/:domain', (req, res, next) => {
            // Decode the domain parameter like the real middleware does
            req.params.domain = decodeURIComponent(req.params.domain);
            downloadPDFReport(req, res).catch(next);
        });
        
        // Error handler
        app.use((error, req, res, next) => {
            console.error('Route error:', error);
            res.status(500).json({ error: error.message });
        });
        
        console.log('1. Testing PDF route with sample domain...');
        
        // Test the route
        const response = await request(app)
            .get('/audit/pdf/example.com')
            .expect((res) => {
                console.log('Response status:', res.status);
                console.log('Response headers:', res.headers);
                if (res.status !== 200 && res.body) {
                    console.log('Response body:', res.body);
                }
            });
        
        if (response.status === 200) {
            console.log(`✅ PDF route working! Generated ${response.body.length} bytes`);
        } else {
            console.log(`❌ PDF route failed with status ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ PDF route test failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 10).join('\n')
        });
    }
}

// Run the test
testPDFRoute();
