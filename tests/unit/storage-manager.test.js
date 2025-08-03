// Unit tests for Storage Manager
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { 
  StorageManager,
  FileStorage,
  MemoryStorage,
  CacheManager,
  DataCompression,
  BackupManager
} from '../../src/storage/storage-manager.js';

// Mock fs module
jest.mock('fs/promises');

describe('Storage Manager', () => {
  let storageManager;
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(process.cwd(), 'test-storage');
    storageManager = new StorageManager({
      baseDir: tempDir,
      enableCompression: true,
      enableBackups: true,
      cacheSize: 100
    });

    // Reset fs mocks
    jest.clearAllMocks();
    fs.mkdir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.readFile.mockResolvedValue('{}');
    fs.access.mockResolvedValue();
    fs.unlink.mockResolvedValue();
    fs.readdir.mockResolvedValue([]);
  });

  afterEach(async () => {
    await storageManager.cleanup();
  });

  describe('File Storage', () => {
    test('should save data to file', async () => {
      const data = { test: 'data', timestamp: Date.now() };
      const key = 'test-key';

      await storageManager.save(key, data);

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`${key}.json`),
        expect.stringContaining(JSON.stringify(data)),
        'utf8'
      );
    });

    test('should load data from file', async () => {
      const testData = { test: 'data', value: 123 };
      fs.readFile.mockResolvedValueOnce(JSON.stringify(testData));

      const result = await storageManager.load('test-key');

      expect(result).toEqual(testData);
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('test-key.json'),
        'utf8'
      );
    });

    test('should handle file not found gracefully', async () => {
      fs.readFile.mockRejectedValueOnce(new Error('ENOENT: no such file'));

      const result = await storageManager.load('nonexistent-key');

      expect(result).toBeNull();
    });

    test('should delete files correctly', async () => {
      await storageManager.delete('test-key');

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-key.json')
      );
    });

    test('should check if data exists', async () => {
      fs.access.mockResolvedValueOnce();

      const exists = await storageManager.exists('test-key');

      expect(exists).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(
        expect.stringContaining('test-key.json')
      );
    });
  });

  describe('Memory Storage', () => {
    test('should store and retrieve data in memory', async () => {
      const memoryStorage = new MemoryStorage({ maxSize: 10 });
      const data = { test: 'memory-data' };

      await memoryStorage.set('memory-key', data);
      const result = await memoryStorage.get('memory-key');

      expect(result).toEqual(data);
    });

    test('should respect memory limits', async () => {
      const memoryStorage = new MemoryStorage({ maxSize: 2 });

      await memoryStorage.set('key1', { data: 'first' });
      await memoryStorage.set('key2', { data: 'second' });
      await memoryStorage.set('key3', { data: 'third' }); // Should evict oldest

      const result1 = await memoryStorage.get('key1');
      const result3 = await memoryStorage.get('key3');

      expect(result1).toBeNull(); // Should be evicted
      expect(result3).toEqual({ data: 'third' });
    });

    test('should implement LRU eviction', async () => {
      const memoryStorage = new MemoryStorage({ maxSize: 2 });

      await memoryStorage.set('key1', { data: 'first' });
      await memoryStorage.set('key2', { data: 'second' });
      
      // Access key1 to make it recently used
      await memoryStorage.get('key1');
      
      // Add key3, should evict key2 (least recently used)
      await memoryStorage.set('key3', { data: 'third' });

      const result1 = await memoryStorage.get('key1');
      const result2 = await memoryStorage.get('key2');
      const result3 = await memoryStorage.get('key3');

      expect(result1).toEqual({ data: 'first' });
      expect(result2).toBeNull(); // Should be evicted
      expect(result3).toEqual({ data: 'third' });
    });
  });

  describe('Cache Manager', () => {
    test('should cache frequently accessed data', async () => {
      const cacheManager = new CacheManager({
        maxSize: 100,
        ttl: 60000 // 1 minute
      });

      const data = { cached: 'data' };
      await cacheManager.set('cache-key', data);

      const result = await cacheManager.get('cache-key');
      expect(result).toEqual(data);
    });

    test('should expire cached data after TTL', async () => {
      const cacheManager = new CacheManager({
        maxSize: 100,
        ttl: 100 // 100ms
      });

      await cacheManager.set('expire-key', { data: 'expires' });

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const result = await cacheManager.get('expire-key');
      expect(result).toBeNull();
    });

    test('should update access time on cache hit', async () => {
      const cacheManager = new CacheManager({
        maxSize: 2,
        ttl: 60000
      });

      await cacheManager.set('key1', { data: 'first' });
      await cacheManager.set('key2', { data: 'second' });

      // Access key1 to update its access time
      await cacheManager.get('key1');

      // Add key3, should evict key2 (least recently accessed)
      await cacheManager.set('key3', { data: 'third' });

      const result1 = await cacheManager.get('key1');
      const result2 = await cacheManager.get('key2');

      expect(result1).toEqual({ data: 'first' });
      expect(result2).toBeNull();
    });

    test('should provide cache statistics', async () => {
      const cacheManager = new CacheManager({ maxSize: 100 });

      await cacheManager.set('key1', { data: 'test' });
      await cacheManager.get('key1'); // Hit
      await cacheManager.get('key2'); // Miss

      const stats = cacheManager.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.size).toBe(1);
    });
  });

  describe('Data Compression', () => {
    test('should compress and decompress data', async () => {
      const compression = new DataCompression();
      const originalData = { 
        test: 'data'.repeat(1000), // Large string for compression
        array: Array(100).fill('item'),
        nested: { deep: { data: 'value' } }
      };

      const compressed = await compression.compress(originalData);
      const decompressed = await compression.decompress(compressed);

      expect(decompressed).toEqual(originalData);
      expect(compressed.length).toBeLessThan(JSON.stringify(originalData).length);
    });

    test('should handle compression errors gracefully', async () => {
      const compression = new DataCompression();
      
      // Test with invalid data
      const result = await compression.decompress('invalid-compressed-data');
      
      expect(result).toBeNull();
    });

    test('should provide compression statistics', async () => {
      const compression = new DataCompression();
      const data = { test: 'data'.repeat(100) };

      const compressed = await compression.compress(data);
      const stats = compression.getCompressionStats();

      expect(stats.originalSize).toBeGreaterThan(0);
      expect(stats.compressedSize).toBeGreaterThan(0);
      expect(stats.compressionRatio).toBeGreaterThan(0);
      expect(stats.compressionRatio).toBeLessThan(1);
    });
  });

  describe('Backup Manager', () => {
    test('should create data backups', async () => {
      const backupManager = new BackupManager({
        backupDir: path.join(tempDir, 'backups'),
        maxBackups: 5,
        compressionEnabled: true
      });

      const data = { important: 'data', timestamp: Date.now() };
      const backupId = await backupManager.createBackup('test-data', data);

      expect(backupId).toBeTruthy();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(backupId),
        expect.any(String),
        'utf8'
      );
    });

    test('should restore data from backup', async () => {
      const backupManager = new BackupManager({
        backupDir: path.join(tempDir, 'backups')
      });

      const originalData = { restored: 'data' };
      fs.readFile.mockResolvedValueOnce(JSON.stringify(originalData));

      const restoredData = await backupManager.restoreBackup('backup-id');

      expect(restoredData).toEqual(originalData);
    });

    test('should list available backups', async () => {
      const backupManager = new BackupManager({
        backupDir: path.join(tempDir, 'backups')
      });

      fs.readdir.mockResolvedValueOnce([
        'backup-1.json',
        'backup-2.json',
        'other-file.txt'
      ]);

      const backups = await backupManager.listBackups();

      expect(backups).toHaveLength(2);
      expect(backups).toContain('backup-1');
      expect(backups).toContain('backup-2');
    });

    test('should clean old backups', async () => {
      const backupManager = new BackupManager({
        backupDir: path.join(tempDir, 'backups'),
        maxBackups: 2
      });

      fs.readdir.mockResolvedValueOnce([
        'backup-1.json',
        'backup-2.json',
        'backup-3.json'
      ]);

      await backupManager.cleanOldBackups();

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('backup-1.json')
      );
    });
  });

  describe('Data validation and integrity', () => {
    test('should validate data before saving', async () => {
      const schema = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      };

      storageManager.setValidationSchema('user', schema);

      const validData = { id: 1, name: 'John' };
      const invalidData = { name: 'John' }; // Missing id

      await expect(storageManager.save('user:1', validData))
        .resolves.not.toThrow();

      await expect(storageManager.save('user:2', invalidData))
        .rejects.toThrow(/validation/i);
    });

    test('should calculate and verify data checksums', async () => {
      const data = { test: 'data', value: 123 };
      
      await storageManager.save('checksum-test', data, { verifyIntegrity: true });

      // Mock file read with checksum
      const dataWithChecksum = {
        data: data,
        checksum: 'mock-checksum',
        timestamp: Date.now()
      };
      fs.readFile.mockResolvedValueOnce(JSON.stringify(dataWithChecksum));

      const result = await storageManager.load('checksum-test', { verifyIntegrity: true });

      expect(result).toEqual(data);
    });

    test('should detect data corruption', async () => {
      const corruptedData = {
        data: { test: 'data' },
        checksum: 'invalid-checksum',
        timestamp: Date.now()
      };
      fs.readFile.mockResolvedValueOnce(JSON.stringify(corruptedData));

      await expect(storageManager.load('corrupted-test', { verifyIntegrity: true }))
        .rejects.toThrow(/corruption/i);
    });
  });

  describe('Storage optimization', () => {
    test('should optimize storage by cleaning up old data', async () => {
      fs.readdir.mockResolvedValueOnce([
        'old-data-1.json',
        'old-data-2.json',
        'recent-data.json'
      ]);

      const oldStats = { mtime: new Date(Date.now() - 86400000 * 8) }; // 8 days old
      const recentStats = { mtime: new Date(Date.now() - 3600000) }; // 1 hour old

      fs.stat = jest.fn()
        .mockResolvedValueOnce(oldStats)
        .mockResolvedValueOnce(oldStats)
        .mockResolvedValueOnce(recentStats);

      await storageManager.cleanup({ maxAge: 86400000 * 7 }); // 7 days

      expect(fs.unlink).toHaveBeenCalledTimes(2); // Remove 2 old files
    });

    test('should defragment storage to reclaim space', async () => {
      const usageStats = await storageManager.getStorageUsage();
      
      await storageManager.defragment();

      const newUsageStats = await storageManager.getStorageUsage();

      expect(newUsageStats.totalSize).toBeLessThanOrEqual(usageStats.totalSize);
    });

    test('should report storage statistics', async () => {
      fs.readdir.mockResolvedValueOnce(['file1.json', 'file2.json']);
      fs.stat = jest.fn()
        .mockResolvedValue({ size: 1000, mtime: new Date() });

      const stats = await storageManager.getStorageUsage();

      expect(stats.totalFiles).toBe(2);
      expect(stats.totalSize).toBe(2000);
      expect(stats.averageFileSize).toBe(1000);
    });
  });

  describe('Concurrent access handling', () => {
    test('should handle concurrent reads safely', async () => {
      const testData = { concurrent: 'data' };
      fs.readFile.mockResolvedValue(JSON.stringify(testData));

      const promises = Array(10).fill().map(() => 
        storageManager.load('concurrent-key')
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual(testData);
      });
    });

    test('should handle concurrent writes safely', async () => {
      const promises = Array(5).fill().map((_, i) => 
        storageManager.save(`concurrent-write-${i}`, { index: i })
      );

      await Promise.all(promises);

      expect(fs.writeFile).toHaveBeenCalledTimes(5);
    });

    test('should implement file locking for critical operations', async () => {
      const lockManager = storageManager.getLockManager();

      const lock = await lockManager.acquire('test-lock');
      expect(lock).toBeTruthy();

      // Try to acquire same lock (should wait or fail)
      const secondLock = lockManager.tryAcquire('test-lock');
      expect(secondLock).toBe(false);

      await lockManager.release(lock);

      // Should be able to acquire after release
      const thirdLock = await lockManager.acquire('test-lock');
      expect(thirdLock).toBeTruthy();
      await lockManager.release(thirdLock);
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle disk space issues', async () => {
      fs.writeFile.mockRejectedValueOnce(new Error('ENOSPC: no space left on device'));

      await expect(storageManager.save('test-key', { data: 'test' }))
        .rejects.toThrow(/space/i);
    });

    test('should handle permission errors', async () => {
      fs.mkdir.mockRejectedValueOnce(new Error('EACCES: permission denied'));

      await expect(storageManager.save('test-key', { data: 'test' }))
        .rejects.toThrow(/permission/i);
    });

    test('should handle malformed JSON gracefully', async () => {
      fs.readFile.mockResolvedValueOnce('invalid json {');

      const result = await storageManager.load('malformed-key');

      expect(result).toBeNull();
    });

    test('should implement circuit breaker for storage failures', async () => {
      // Simulate repeated failures
      fs.writeFile.mockRejectedValue(new Error('Storage failure'));

      for (let i = 0; i < 5; i++) {
        try {
          await storageManager.save(`fail-${i}`, { data: 'test' });
        } catch (error) {
          // Expected failures
        }
      }

      // Circuit breaker should be open now
      const circuitState = storageManager.getCircuitBreakerState();
      expect(circuitState.state).toBe('open');
    });
  });
});
