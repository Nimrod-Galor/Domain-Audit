#!/usr/bin/env node
/**
 * Simple server starter script for debugging
 */
import { fileURLToPath } from 'url';
import path from 'path';

// Dynamic import the app
const { default: getApp } = await import('./web/app.js');

console.log('🚀 Starting server manually...');

try {
    const app = await getApp();
    console.log('✅ App initialized successfully');
    
    // The app should already have a server running from getApp()
    // Just need to handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        if (app.server) {
            app.server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
    
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}
