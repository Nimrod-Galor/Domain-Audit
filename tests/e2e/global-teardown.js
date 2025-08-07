/**
 * Playwright Global Teardown
 * Runs once after all E2E tests
 */

import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load E2E environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.e2e') });

async function globalTeardown() {
  console.log('🧹 Starting E2E test global teardown...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

    // Clean up test data
    console.log('🗑️ Cleaning up test data...');
    
    try {
      await page.goto(`${baseURL}/api/test/cleanup`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.log('⚠️ Test data cleanup failed:', error.message);
    }

    // Clear any test sessions
    try {
      await page.goto(`${baseURL}/api/test/clear-sessions`, {
        waitUntil: 'networkidle',
        timeout: 5000
      });
      console.log('✅ Test sessions cleared');
    } catch (error) {
      console.log('⚠️ Session cleanup failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Global teardown encountered errors:', error);
    // Don't throw - teardown errors shouldn't fail the test suite
  } finally {
    await browser.close();
  }

  console.log('✅ E2E test global teardown completed');
}

export default globalTeardown;
