/**
 * @jest-environment node
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  extractMainDomain,
  isInternalLink,
  normalizeUrl,
  recordFunctionalLink,
  addToStats,
  recordBadRequest,
  recordExternalLink,
  logFailedUrl,
  isFunctionalLink,
  isNonFetchableLink
} from '../../src/utils/core-utils.js';

describe('Core Utils', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'core-utils-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  describe('extractMainDomain', () => {
    test('should extract domain from URL', () => {
      expect(extractMainDomain('https://www.example.com/path')).toBe('example.com');
      expect(extractMainDomain('http://subdomain.example.co.uk')).toBe('example.co.uk');
      expect(extractMainDomain('https://example.org/page?query=value')).toBe('example.org');
    });

    test('should handle URLs without protocol', () => {
      expect(extractMainDomain('www.example.com')).toBe('example.com');
      expect(extractMainDomain('example.com')).toBe('example.com');
    });

    test('should handle complex TLDs', () => {
      expect(extractMainDomain('https://site.co.uk')).toBe('site.co.uk');
      expect(extractMainDomain('https://www.site.com.au')).toBe('site.com.au');
    });

    test('should handle edge cases', () => {
      expect(extractMainDomain('')).toBe('');
      expect(extractMainDomain('not-a-url')).toBe('not-a-url');
      expect(extractMainDomain('localhost')).toBe('localhost');
    });
  });

  describe('isInternalLink', () => {
    test('should identify internal links', () => {
      expect(isInternalLink('https://example.com/page', 'example.com')).toBe(true);
      expect(isInternalLink('/relative/path', 'example.com')).toBe(true);
      expect(isInternalLink('#anchor', 'example.com')).toBe(true);
      expect(isInternalLink('?query=value', 'example.com')).toBe(true);
    });

    test('should identify external links', () => {
      expect(isInternalLink('https://other.com/page', 'example.com')).toBe(false);
      expect(isInternalLink('http://external.org', 'example.com')).toBe(false);
      expect(isInternalLink('ftp://files.example.com', 'example.com')).toBe(false);
    });

    test('should handle subdomain correctly', () => {
      expect(isInternalLink('https://sub.example.com/page', 'example.com')).toBe(true);
      expect(isInternalLink('https://www.example.com/page', 'example.com')).toBe(true);
    });

    test('should be case insensitive', () => {
      expect(isInternalLink('https://EXAMPLE.COM/page', 'example.com')).toBe(true);
      expect(isInternalLink('https://example.com/page', 'EXAMPLE.COM')).toBe(true);
    });
  });

  describe('isNonFetchableLink', () => {
    test('should identify non-fetchable protocols', () => {
      expect(isNonFetchableLink('javascript:void(0)')).toBe(true);
      expect(isNonFetchableLink('ftp://files.example.com')).toBe(true);
      expect(isNonFetchableLink('file:///local/file.txt')).toBe(true);
    });

    test('should allow fetchable protocols', () => {
      expect(isNonFetchableLink('https://example.com')).toBe(false);
      expect(isNonFetchableLink('http://example.com')).toBe(false);
      expect(isNonFetchableLink('mailto:test@example.com')).toBe(false);
      expect(isNonFetchableLink('tel:+1234567890')).toBe(false);
    });

    test('should handle case variations', () => {
      expect(isNonFetchableLink('JAVASCRIPT:void(0)')).toBe(true);
      expect(isNonFetchableLink('FTP://files.example.com')).toBe(true);
    });
  });

  describe('isFunctionalLink', () => {
    test('should identify functional links', () => {
      expect(isFunctionalLink('mailto:test@example.com')).toBe(true);
      expect(isFunctionalLink('tel:+1234567890')).toBe(true);
      expect(isFunctionalLink('TEL:+1234567890')).toBe(true);
      expect(isFunctionalLink('MAILTO:test@example.com')).toBe(true);
    });

    test('should identify non-functional links', () => {
      expect(isFunctionalLink('https://example.com')).toBe(false);
      expect(isFunctionalLink('http://example.com')).toBe(false);
      expect(isFunctionalLink('/relative/path')).toBe(false);
      expect(isFunctionalLink('#anchor')).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(isFunctionalLink('MAILTO:test@example.com')).toBe(true);
      expect(isFunctionalLink('TEL:+1234567890')).toBe(true);
    });
  });

  describe('normalizeUrl', () => {
    test('should remove trailing slash', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
    });

    test('should keep URLs without trailing slash', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/path')).toBe('https://example.com/path');
    });

    test('should handle root path correctly', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
    });
  });

  describe('recordFunctionalLink', () => {
    test('should record mailto links', () => {
      const mailtoLinks = {};
      const telLinks = {};
      recordFunctionalLink('mailto:test@example.com', 'https://example.com/contact', undefined, mailtoLinks, telLinks);
      
      expect(mailtoLinks['mailto:test@example.com']).toBeDefined();
      expect(mailtoLinks['mailto:test@example.com'].sources.has('https://example.com/contact')).toBe(true);
    });

    test('should record tel links', () => {
      const mailtoLinks = {};
      const telLinks = {};
      recordFunctionalLink('tel:+1234567890', 'https://example.com/contact', undefined, mailtoLinks, telLinks);
      
      expect(telLinks['tel:+1234567890']).toBeDefined();
      expect(telLinks['tel:+1234567890'].sources.has('https://example.com/contact')).toBe(true);
    });

    test('should handle multiple sources for same link', () => {
      const mailtoLinks = {};
      const telLinks = {};
      recordFunctionalLink('mailto:test@example.com', 'https://example.com/contact', undefined, mailtoLinks, telLinks);
      recordFunctionalLink('mailto:test@example.com', 'https://example.com/about', undefined, mailtoLinks, telLinks);

      const entry = mailtoLinks['mailto:test@example.com'];
      expect(entry.sources.size).toBe(2);
      expect(entry.sources.has('https://example.com/contact')).toBe(true);
      expect(entry.sources.has('https://example.com/about')).toBe(true);
    });

    test('should be case insensitive', () => {
      const mailtoLinks = {};
      const telLinks = {};
      recordFunctionalLink('MAILTO:test@example.com', 'https://example.com/contact', undefined, mailtoLinks, telLinks);
      
      expect(mailtoLinks['mailto:test@example.com']).toBeDefined();
    });
  });

  describe('addToStats', () => {
    test('should add new link to stats', () => {
      const stats = {};
      addToStats('https://example.com/page', 'Link Text', 'https://example.com', stats);
      
      expect(stats['https://example.com/page']).toBeDefined();
      const entry = stats['https://example.com/page'];
      expect(entry.count).toBe(1);
      expect(entry.anchors.has('Link Text')).toBe(true);
      expect(entry.sources.has('https://example.com')).toBe(true);
    });

    test('should increment count for existing link', () => {
      const stats = {};
      addToStats('https://example.com/page', 'Link Text', 'https://example.com', stats);
      addToStats('https://example.com/page', 'Another Text', 'https://example.com/other', stats);
      
      const entry = stats['https://example.com/page'];
      expect(entry.count).toBe(2);
      expect(entry.anchors.size).toBe(2);
      expect(entry.sources.size).toBe(2);
    });

    test('should handle duplicate anchors and sources', () => {
      const stats = {};
      addToStats('https://example.com/page', 'Link Text', 'https://example.com', stats);
      addToStats('https://example.com/page', 'Link Text', 'https://example.com', stats);
      
      const entry = stats['https://example.com/page'];
      expect(entry.count).toBe(2);
      expect(entry.anchors.size).toBe(1); // Same anchor text
      expect(entry.sources.size).toBe(1); // Same source
    });
  });

  describe('recordBadRequest', () => {
    test('should record bad request', () => {
      const badRequests = {};
      recordBadRequest('https://example.com/broken', 404, 'https://example.com', badRequests);
      
      expect(badRequests['https://example.com/broken']).toBeDefined();
      const entry = badRequests['https://example.com/broken'];
      expect(entry.status).toBe(404);
      expect(entry.sources.has('https://example.com')).toBe(true);
    });

    test('should handle multiple sources for same bad request', () => {
      const badRequests = {};
      recordBadRequest('https://example.com/broken', 404, 'https://example.com/page1', badRequests);
      recordBadRequest('https://example.com/broken', 404, 'https://example.com/page2', badRequests);
      
      const entry = badRequests['https://example.com/broken'];
      expect(entry.sources.size).toBe(2);
    });
  });

  describe('recordExternalLink', () => {
    test('should record external link with basic data', () => {
      const externalLinks = {};
      recordExternalLink('https://google.com', 200, 'https://example.com', externalLinks);
      
      expect(externalLinks['https://google.com']).toBeDefined();
      const entry = externalLinks['https://google.com'];
      expect(entry.status).toBe(200);
      expect(entry.sources.has('https://example.com')).toBe(true);
    });

    test('should record external link with additional data', () => {
      const externalLinks = {};
      const additionalData = {
        headers: { 'content-type': 'text/html' },
        redirectChain: ['https://google.com', 'https://www.google.com']
      };
      recordExternalLink('https://google.com', 200, 'https://example.com', externalLinks, additionalData);
      
      const entry = externalLinks['https://google.com'];
      expect(entry.status).toBe(200);
      expect(entry.headers['content-type']).toBe('text/html');
      expect(entry.redirectChain).toBeDefined();
    });

    test('should update existing external link', () => {
      const externalLinks = {};
      recordExternalLink('https://google.com', 200, 'https://example.com/page1', externalLinks);
      recordExternalLink('https://google.com', 301, 'https://example.com/page2', externalLinks);
      
      const entry = externalLinks['https://google.com'];
      expect(entry.status).toBe(301); // Should update status
      expect(entry.sources.size).toBe(2);
    });
  });

  describe('logFailedUrl', () => {
    test('should create log file and write entry', () => {
      logFailedUrl(tempDir, 'https://example.com/broken', 'Test error message');
      
      const logFile = path.join(tempDir, 'failed-urls.log');
      expect(fs.existsSync(logFile)).toBe(true);
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('https://example.com/broken');
      expect(content).toContain('Test error message');
    });

    test('should append to existing log file', () => {
      logFailedUrl(tempDir, 'https://example.com/broken1', 'Error 1');
      logFailedUrl(tempDir, 'https://example.com/broken2', 'Error 2');
      
      const logFile = path.join(tempDir, 'failed-urls.log');
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('broken1');
      expect(content).toContain('broken2');
      expect(content).toContain('Error 1');
      expect(content).toContain('Error 2');
    });

    test('should create directory if it does not exist', () => {
      const subDir = path.join(tempDir, 'logs');
      
      expect(fs.existsSync(subDir)).toBe(false);
      logFailedUrl(subDir, 'https://example.com/broken', 'Test error');
      
      expect(fs.existsSync(subDir)).toBe(true);
      const logFile = path.join(subDir, 'failed-urls.log');
      expect(fs.existsSync(logFile)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty strings', () => {
      expect(extractMainDomain('')).toBe('');
      expect(normalizeUrl('')).toBe('');
      expect(isInternalLink('', 'example.com')).toBe(false);
    });

    test('should handle null/undefined values', () => {
      expect(() => extractMainDomain(null)).not.toThrow();
      expect(() => isInternalLink(null, 'example.com')).not.toThrow();
      expect(() => normalizeUrl(null)).not.toThrow();
    });

    test('should handle malformed URLs', () => {
      expect(extractMainDomain('not-a-url')).toBe('not-a-url');
      expect(isInternalLink('malformed::url', 'example.com')).toBe(false);
    });
  });
});
