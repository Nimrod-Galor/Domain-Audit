// Test for ChunkedPageDataManager directory structure
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { ChunkedPageDataManager } from '../../legacy/page-data-manager.js';

describe('ChunkedPageDataManager Directory Structure', () => {
  const testAuditDir = './test-audit-temp';
  let pageDataManager;

  beforeEach(() => {
    // Clean up any existing test directory
    if (fs.existsSync(testAuditDir)) {
      fs.rmSync(testAuditDir, { recursive: true });
    }
    
    // Create test audit directory
    fs.mkdirSync(testAuditDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testAuditDir)) {
      fs.rmSync(testAuditDir, { recursive: true });
    }
  });

  test('should create page-data folder in correct location', () => {
    pageDataManager = new ChunkedPageDataManager(testAuditDir);
    
    const expectedPageDataPath = path.join(testAuditDir, 'page-data');
    
    // Check if page-data folder exists in the right place
    expect(fs.existsSync(expectedPageDataPath)).toBe(true);
    
    // Check that it's a directory
    expect(fs.statSync(expectedPageDataPath).isDirectory()).toBe(true);
  });

  test('should NOT create nested page-data folders', () => {
    pageDataManager = new ChunkedPageDataManager(testAuditDir);
    
    const pageDataPath = path.join(testAuditDir, 'page-data');
    const nestedPageDataPath = path.join(pageDataPath, 'page-data');
    
    // Verify page-data exists
    expect(fs.existsSync(pageDataPath)).toBe(true);
    
    // Verify nested page-data does NOT exist
    expect(fs.existsSync(nestedPageDataPath)).toBe(false);
  });

  test('should correctly store and retrieve page data', () => {
    pageDataManager = new ChunkedPageDataManager(testAuditDir);
    
    const testUrl = 'https://example.com/test-page';
    const testData = {
      title: 'Test Page',
      links: ['link1', 'link2'],
      content: 'Test content'
    };
    
    // Store data
    pageDataManager.set(testUrl, testData);
    
    // Verify file was created in correct location
    const pageDataPath = path.join(testAuditDir, 'page-data');
    const dataFiles = fs.readdirSync(pageDataPath);
    
    expect(dataFiles.length).toBe(1);
    expect(dataFiles[0]).toMatch(/\.json$/);
    
    // Verify data can be retrieved
    const retrievedData = pageDataManager.get(testUrl);
    expect(retrievedData).toEqual(testData);
  });

  test('should handle multiple page data files correctly', () => {
    pageDataManager = new ChunkedPageDataManager(testAuditDir);
    
    const testPages = [
      { url: 'https://example.com/page1', data: { title: 'Page 1' } },
      { url: 'https://example.com/page2', data: { title: 'Page 2' } },
      { url: 'https://example.com/page3', data: { title: 'Page 3' } }
    ];
    
    // Store multiple pages
    testPages.forEach(page => {
      pageDataManager.set(page.url, page.data);
    });
    
    // Verify all files were created
    const pageDataPath = path.join(testAuditDir, 'page-data');
    const dataFiles = fs.readdirSync(pageDataPath);
    
    expect(dataFiles.length).toBe(3);
    
    // Verify all data can be retrieved
    testPages.forEach(page => {
      const retrievedData = pageDataManager.get(page.url);
      expect(retrievedData).toEqual(page.data);
    });
  });
});
