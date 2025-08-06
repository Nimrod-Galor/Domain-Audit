import { jest } from '@jest/globals';
import { performance, PerformanceObserver } from 'perf_hooks';
import { TestHelpers } from '../../helpers/TestHelpers.js';
import { AuditFactory } from '../../factories/AuditFactory.js';

describe('Performance Test Suite', () => {
  let performanceMetrics = {};

  beforeAll(() => {
    // Set up performance observer
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        performanceMetrics[entry.name] = {
          duration: entry.duration,
          startTime: entry.startTime,
          entryType: entry.entryType
        };
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'mark'] });
  });

  afterEach(() => {
    // Clear performance metrics
    performanceMetrics = {};
    performance.clearMarks();
    performance.clearMeasures();
  });

  describe('Audit Engine Performance', () => {
    test('should process single page audit within time limit', async () => {
      const auditData = AuditFactory.createSimpleAudit();
      
      performance.mark('audit-start');
      
      const result = await TestHelpers.runAuditEngine(auditData);
      
      performance.mark('audit-end');
      performance.measure('single-page-audit', 'audit-start', 'audit-end');

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(performanceMetrics['single-page-audit'].duration).toBeLessThan(10000); // 10 seconds
    });

    test('should process medium website (25 pages) efficiently', async () => {
      const auditData = AuditFactory.createMediumAudit({ maxPages: 25 });
      
      performance.mark('medium-audit-start');
      
      const result = await TestHelpers.runAuditEngine(auditData);
      
      performance.mark('medium-audit-end');
      performance.measure('medium-audit', 'medium-audit-start', 'medium-audit-end');

      expect(result.pagesProcessed).toBe(25);
      expect(performanceMetrics['medium-audit'].duration).toBeLessThan(60000); // 60 seconds
    });

    test('should handle large website (100 pages) within reasonable time', async () => {
      const auditData = AuditFactory.createLargeAudit({ maxPages: 100 });
      
      performance.mark('large-audit-start');
      
      const result = await TestHelpers.runAuditEngine(auditData);
      
      performance.mark('large-audit-end');
      performance.measure('large-audit', 'large-audit-start', 'large-audit-end');

      expect(result.pagesProcessed).toBe(100);
      expect(performanceMetrics['large-audit'].duration).toBeLessThan(300000); // 5 minutes
    });

    test('should maintain consistent performance across multiple audits', async () => {
      const auditData = AuditFactory.createSimpleAudit();
      const durations = [];

      for (let i = 0; i < 10; i++) {
        performance.mark(`audit-${i}-start`);
        
        await TestHelpers.runAuditEngine(auditData);
        
        performance.mark(`audit-${i}-end`);
        performance.measure(`audit-${i}`, `audit-${i}-start`, `audit-${i}-end`);
        
        durations.push(performanceMetrics[`audit-${i}`].duration);
      }

      // Check consistency - no single audit should take more than 2x the average
      const averageDuration = durations.reduce((a, b) => a + b) / durations.length;
      const maxAcceptableDuration = averageDuration * 2;

      durations.forEach((duration, index) => {
        expect(duration).toBeLessThan(maxAcceptableDuration);
      });

      // Standard deviation should be reasonable
      const variance = durations.reduce((sum, duration) => {
        return sum + Math.pow(duration - averageDuration, 2);
      }, 0) / durations.length;
      
      const standardDeviation = Math.sqrt(variance);
      expect(standardDeviation).toBeLessThan(averageDuration * 0.3); // 30% of average
    });

    test('should process concurrent audits efficiently', async () => {
      const concurrentAudits = 5;
      const auditData = AuditFactory.createSimpleAudit();
      
      performance.mark('concurrent-audits-start');
      
      const promises = Array(concurrentAudits).fill().map((_, i) => 
        TestHelpers.runAuditEngine(auditData)
      );
      
      const results = await Promise.all(promises);
      
      performance.mark('concurrent-audits-end');
      performance.measure('concurrent-audits', 'concurrent-audits-start', 'concurrent-audits-end');

      expect(results).toHaveLength(concurrentAudits);
      expect(results.every(r => r.status === 'completed')).toBe(true);
      
      // Concurrent processing should be faster than sequential
      const concurrentTime = performanceMetrics['concurrent-audits'].duration;
      const estimatedSequentialTime = concurrentAudits * 8000; // 8 seconds per audit
      
      expect(concurrentTime).toBeLessThan(estimatedSequentialTime * 0.8); // At least 20% faster
    });
  });

  describe('Database Performance', () => {
    beforeEach(async () => {
      await TestHelpers.setupTestDatabase();
      await TestHelpers.clearDatabase();
    });

    test('should perform user queries efficiently', async () => {
      // Create test users
      const users = await Promise.all(
        Array(1000).fill().map((_, i) => 
          TestHelpers.createTestUser({
            email: `user${i}@example.com`,
            tier_id: (i % 3) + 1
          })
        )
      );

      performance.mark('user-query-start');
      
      // Query users by tier
      const proUsers = await TestHelpers.getUsersByTier(2);
      
      performance.mark('user-query-end');
      performance.measure('user-query', 'user-query-start', 'user-query-end');

      expect(proUsers.length).toBeGreaterThan(0);
      expect(performanceMetrics['user-query'].duration).toBeLessThan(100); // 100ms
    });

    test('should handle large audit history queries efficiently', async () => {
      const user = await TestHelpers.createTestUser();
      
      // Create large number of audits
      await Promise.all(
        Array(500).fill().map((_, i) => 
          TestHelpers.createAudit({
            user_id: user.id,
            url: `https://example${i}.com`,
            status: 'completed',
            created_at: new Date(Date.now() - i * 86400000) // Different dates
          })
        )
      );

      performance.mark('audit-history-start');
      
      const audits = await TestHelpers.getUserAudits(user.id, { limit: 50, offset: 0 });
      
      performance.mark('audit-history-end');
      performance.measure('audit-history', 'audit-history-start', 'audit-history-end');

      expect(audits).toHaveLength(50);
      expect(performanceMetrics['audit-history'].duration).toBeLessThan(200); // 200ms
    });

    test('should efficiently aggregate audit statistics', async () => {
      const user = await TestHelpers.createTestUser();
      
      // Create audits with various statuses
      const auditPromises = [];
      const statuses = ['completed', 'failed', 'pending', 'running'];
      
      for (let i = 0; i < 200; i++) {
        auditPromises.push(
          TestHelpers.createAudit({
            user_id: user.id,
            url: `https://example${i}.com`,
            status: statuses[i % statuses.length],
            created_at: new Date(Date.now() - i * 3600000) // Different hours
          })
        );
      }
      
      await Promise.all(auditPromises);

      performance.mark('audit-stats-start');
      
      const stats = await TestHelpers.getAuditStatistics(user.id);
      
      performance.mark('audit-stats-end');
      performance.measure('audit-stats', 'audit-stats-start', 'audit-stats-end');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats.total).toBe(200);
      expect(performanceMetrics['audit-stats'].duration).toBeLessThan(150); // 150ms
    });

    test('should handle complex join queries efficiently', async () => {
      // Create users with audits and notifications
      const users = await Promise.all(
        Array(100).fill().map((_, i) => 
          TestHelpers.createTestUser({ email: `user${i}@example.com` })
        )
      );

      // Create audits and notifications for each user
      for (const user of users) {
        await Promise.all([
          TestHelpers.createAudit({ user_id: user.id, status: 'completed' }),
          TestHelpers.createNotification({ user_id: user.id, read: false })
        ]);
      }

      performance.mark('complex-query-start');
      
      // Complex query: Users with their latest audit and unread notification count
      const results = await TestHelpers.getUsersWithAuditData();
      
      performance.mark('complex-query-end');
      performance.measure('complex-query', 'complex-query-start', 'complex-query-end');

      expect(results).toHaveLength(100);
      expect(performanceMetrics['complex-query'].duration).toBeLessThan(500); // 500ms
    });
  });

  describe('API Performance', () => {
    test('should handle API request load efficiently', async () => {
      const user = await TestHelpers.createTestUser();
      const token = TestHelpers.generateAuthToken(user);
      
      performance.mark('api-load-start');
      
      // Simulate 50 concurrent API requests
      const promises = Array(50).fill().map(() => 
        TestHelpers.makeAPIRequest('/api/audits', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(promises);
      
      performance.mark('api-load-end');
      performance.measure('api-load', 'api-load-start', 'api-load-end');

      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(performanceMetrics['api-load'].duration).toBeLessThan(5000); // 5 seconds
    });

    test('should maintain response times under load', async () => {
      const user = await TestHelpers.createTestUser();
      const token = TestHelpers.generateAuthToken(user);
      
      const responseTimes = [];
      
      // Make 20 sequential requests and measure each
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        
        const response = await TestHelpers.makeAPIRequest('/api/user/profile', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        expect(response.status).toBe(200);
      }

      // All responses should be under 500ms
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(500);
      });

      // Average should be under 200ms
      const average = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      expect(average).toBeLessThan(200);
    });

    test('should handle audit creation API efficiently', async () => {
      const user = await TestHelpers.createTestUser();
      const token = TestHelpers.generateAuthToken(user);
      
      performance.mark('audit-creation-start');
      
      const response = await TestHelpers.makeAPIRequest('/api/audit', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com',
          type: 'comprehensive'
        })
      });
      
      performance.mark('audit-creation-end');
      performance.measure('audit-creation', 'audit-creation-start', 'audit-creation-end');

      expect(response.status).toBe(201);
      expect(performanceMetrics['audit-creation'].duration).toBeLessThan(1000); // 1 second
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory during audit processing', async () => {
      const initialMemory = process.memoryUsage();
      
      // Process multiple audits
      for (let i = 0; i < 10; i++) {
        const auditData = AuditFactory.createSimpleAudit();
        await TestHelpers.runAuditEngine(auditData);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should efficiently handle large HTML documents', async () => {
      const initialMemory = process.memoryUsage();
      
      // Create large HTML document (5MB)
      const largeHTML = '<div>' + 'Large content '.repeat(100000) + '</div>';
      const auditData = AuditFactory.createAuditWithHTML(largeHTML);
      
      const result = await TestHelpers.runAuditEngine(auditData);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      expect(result).toBeDefined();
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    test('should clean up resources after audit completion', async () => {
      let memorySnapshots = [];
      
      for (let i = 0; i < 5; i++) {
        const auditData = AuditFactory.createMediumAudit();
        await TestHelpers.runAuditEngine(auditData);
        
        if (global.gc) {
          global.gc();
        }
        
        memorySnapshots.push(process.memoryUsage().heapUsed);
      }
      
      // Memory usage should not continuously increase
      const firstSnapshot = memorySnapshots[0];
      const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
      const memoryGrowth = lastSnapshot - firstSnapshot;
      
      // Growth should be minimal (less than 20MB)
      expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024);
    });
  });

  describe('Stress Testing', () => {
    test('should handle system stress gracefully', async () => {
      const stressResults = {
        successful: 0,
        failed: 0,
        timeouts: 0
      };
      
      // Create 20 concurrent audit processes
      const stressPromises = Array(20).fill().map(async (_, i) => {
        try {
          const auditData = AuditFactory.createSimpleAudit();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 30000)
          );
          
          const auditPromise = TestHelpers.runAuditEngine(auditData);
          
          await Promise.race([auditPromise, timeoutPromise]);
          stressResults.successful++;
        } catch (error) {
          if (error.message === 'Timeout') {
            stressResults.timeouts++;
          } else {
            stressResults.failed++;
          }
        }
      });
      
      await Promise.allSettled(stressPromises);
      
      // At least 80% should succeed
      expect(stressResults.successful).toBeGreaterThanOrEqual(16);
      
      // No more than 10% should timeout
      expect(stressResults.timeouts).toBeLessThanOrEqual(2);
    });

    test('should maintain database performance under heavy load', async () => {
      const user = await TestHelpers.createTestUser();
      
      // Create heavy database load
      const loadPromises = Array(100).fill().map(async (_, i) => {
        await TestHelpers.createAudit({
          user_id: user.id,
          url: `https://stress-test-${i}.com`,
          status: 'completed'
        });
        
        return TestHelpers.getUserAudits(user.id, { limit: 10 });
      });
      
      performance.mark('db-stress-start');
      
      const results = await Promise.all(loadPromises);
      
      performance.mark('db-stress-end');
      performance.measure('db-stress', 'db-stress-start', 'db-stress-end');

      expect(results).toHaveLength(100);
      expect(performanceMetrics['db-stress'].duration).toBeLessThan(10000); // 10 seconds
    });
  });

  describe('Performance Monitoring', () => {
    test('should track key performance indicators', async () => {
      const kpis = await TestHelpers.collectPerformanceKPIs();
      
      expect(kpis).toHaveProperty('avgAuditProcessingTime');
      expect(kpis).toHaveProperty('avgDatabaseQueryTime');
      expect(kpis).toHaveProperty('avgAPIResponseTime');
      expect(kpis).toHaveProperty('memoryUtilization');
      expect(kpis).toHaveProperty('cpuUtilization');
      
      // Validate KPI thresholds
      expect(kpis.avgAuditProcessingTime).toBeLessThan(15000); // 15 seconds
      expect(kpis.avgDatabaseQueryTime).toBeLessThan(200);     // 200ms
      expect(kpis.avgAPIResponseTime).toBeLessThan(500);       // 500ms
      expect(kpis.memoryUtilization).toBeLessThan(80);         // 80%
      expect(kpis.cpuUtilization).toBeLessThan(70);            // 70%
    });

    test('should detect performance regressions', async () => {
      const baseline = await TestHelpers.getPerformanceBaseline();
      const current = await TestHelpers.measureCurrentPerformance();
      
      const regressionThreshold = 1.2; // 20% increase
      
      Object.keys(baseline).forEach(metric => {
        const regressionRatio = current[metric] / baseline[metric];
        
        if (regressionRatio > regressionThreshold) {
          console.warn(`Performance regression detected in ${metric}: ${regressionRatio.toFixed(2)}x slower`);
        }
        
        // Fail test if critical metrics regress significantly
        if (['auditProcessingTime', 'databaseQueryTime'].includes(metric)) {
          expect(regressionRatio).toBeLessThan(1.5); // Max 50% regression
        }
      });
    });
  });

  afterAll(async () => {
    // Generate performance report
    const report = {
      timestamp: new Date().toISOString(),
      metrics: performanceMetrics,
      summary: {
        totalTests: Object.keys(performanceMetrics).length,
        avgDuration: Object.values(performanceMetrics)
          .reduce((sum, metric) => sum + metric.duration, 0) / 
          Object.keys(performanceMetrics).length
      }
    };
    
    await TestHelpers.savePerformanceReport(report);
    console.log('Performance test report saved');
  });
});
