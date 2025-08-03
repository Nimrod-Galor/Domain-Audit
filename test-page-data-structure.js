// Test to verify page-data folder structure
import fs from 'fs';
import path from 'path';
import { ChunkedPageDataManager } from './src/storage/page-data-manager.js';

const testDir = './test-audit-dir';
const pageDataPath = path.join(testDir, 'page-data');

// Clean up any existing test directory
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true });
}

// Create test audit directory
fs.mkdirSync(testDir, { recursive: true });

console.log('🧪 Testing ChunkedPageDataManager directory structure...');

// Test correct usage (should create page-data inside testDir)
const manager = new ChunkedPageDataManager(testDir);

// Check if page-data folder exists in the right place
if (fs.existsSync(pageDataPath)) {
  console.log('✅ page-data folder created correctly at:', pageDataPath);
  
  // Check if there's no nested page-data folder
  const nestedPageData = path.join(pageDataPath, 'page-data');
  if (!fs.existsSync(nestedPageData)) {
    console.log('✅ No nested page-data folder found');
  } else {
    console.log('❌ Found nested page-data folder at:', nestedPageData);
  }
} else {
  console.log('❌ page-data folder not created');
}

// Test saving some data
manager.set('https://example.com/', { title: 'Test Page', links: ['link1', 'link2'] });

// Check if data file was created
const dataFiles = fs.readdirSync(pageDataPath);
if (dataFiles.length > 0) {
  console.log('✅ Data file created successfully:', dataFiles[0]);
} else {
  console.log('❌ No data files created');
}

// Clean up
fs.rmSync(testDir, { recursive: true });
console.log('🧹 Test cleanup completed');
