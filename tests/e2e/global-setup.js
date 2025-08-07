/**
 * Playwright Global Setup
 * Runs once before all E2E tests
 */

import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load E2E environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.e2e') });

async function globalSetup() {
  console.log('🚀 Starting E2E test global setup...');

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for application to be ready
    console.log('⏳ Waiting for application to be ready...');
    const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
    
    // Try to connect to the application
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await page.goto(`${baseURL}/health/ping`, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        });
        
        if (response && response.ok()) {
          console.log('✅ Application is ready');
          break;
        }
      } catch (error) {
        console.log(`⏳ Waiting for application... (${retries} retries left)`);
        retries--;
        if (retries === 0) {
          throw new Error('Application failed to start within timeout period');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Set up test data
    console.log('📝 Setting up test data...');
    
    // Create test users if they don't exist
    try {
      await page.goto(`${baseURL}/api/test/setup`, {
        waitUntil: 'networkidle'
      });
      console.log('✅ Test data setup completed');
    } catch (error) {
      console.log('⚠️ Test data setup failed, continuing anyway:', error.message);
    }

    // Verify critical pages are accessible
    console.log('🔍 Verifying critical pages...');
    const criticalPages = ['/', '/login', '/register'];
    
    for (const pagePath of criticalPages) {
      try {
        const response = await page.goto(`${baseURL}${pagePath}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });
        
        if (!response || !response.ok()) {
          console.warn(`⚠️ Page ${pagePath} returned status: ${response?.status()}`);
        } else {
          console.log(`✅ Page ${pagePath} is accessible`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not verify page ${pagePath}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ E2E test global setup completed');
}

export default globalSetup;
