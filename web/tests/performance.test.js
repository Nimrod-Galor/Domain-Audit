/**
 * Performance Testing Suite for Tier System
 * Tests system performance under various load conditions
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { tierService } from "../services/tierService.js";
import { query } from "../models/database.js";

describe("Performance Tests", () => {
  const PERFORMANCE_THRESHOLD_MS = 200; // 200ms response time target
  const CONCURRENT_USERS = 50;
  const LOAD_TEST_DURATION = 30000; // 30 seconds

  describe("Database Performance", () => {
    it("should handle tier validation under load", async () => {
      const startTime = Date.now();
      const promises = [];

      // Simulate 50 concurrent tier validations
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(tierService.canPerformAudit(null, 25, 10));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / CONCURRENT_USERS;

      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it("should handle usage tracking queries efficiently", async () => {
      const testUserId = await createTestUser("professional");
      
      const startTime = Date.now();
      const promises = [];

      // Simulate 50 concurrent usage queries
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(tierService.getCurrentMonthUsage(testUserId));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / CONCURRENT_USERS;

      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      
      await cleanupTestUser(testUserId);
    });

    it("should maintain performance with large usage data", async () => {
      const testUserId = await createTestUser("enterprise");
      
      // Insert large amount of usage data
      const currentMonth = new Date().toISOString().substring(0, 7);
      await query(`
        INSERT INTO usage_tracking (user_id, month_year, audits_used, internal_pages_scanned, external_links_checked)
        VALUES ($1, $2, 1000, 50000, 25000)
      `, [testUserId, currentMonth]);

      const startTime = Date.now();
      const usage = await tierService.getCurrentMonthUsage(testUserId);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(usage.audits_used).toBe(1000);
      
      await cleanupTestUser(testUserId);
    });
  });

  describe("API Performance", () => {
    it("should handle API authentication efficiently", async () => {
      const testUserId = await createTestUser("professional");
      const apiKey = await tierService.generateApiKey(testUserId);

      const startTime = Date.now();
      const promises = [];

      // Simulate 50 concurrent API authentications
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(
          query(`
            SELECT u.*, ul.* FROM users u
            LEFT JOIN user_limits ul ON u.id = ul.user_id
            WHERE u.api_key = $1 AND u.tier IN ('professional', 'enterprise')
          `, [apiKey])
        );
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / CONCURRENT_USERS;

      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      
      await cleanupTestUser(testUserId);
    });

    it("should handle rate limiting checks efficiently", async () => {
      const testUserId = await createTestUser("professional");
      
      const startTime = Date.now();
      const promises = [];

      // Simulate 50 concurrent rate limit checks
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(tierService.checkApiRateLimit(testUserId));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / CONCURRENT_USERS;

      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      
      await cleanupTestUser(testUserId);
    });
  });

  describe("Memory Usage", () => {
    it("should not cause memory leaks during extended usage", async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate extended usage
      for (let i = 0; i < 1000; i++) {
        await tierService.canPerformAudit(null, 25, 10);
        
        // Force garbage collection every 100 iterations
        if (i % 100 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be less than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe("Stress Testing", () => {
    it("should handle database connection pool under stress", async () => {
      const promises = [];
      const STRESS_OPERATIONS = 200;

      // Create stress test with database operations
      for (let i = 0; i < STRESS_OPERATIONS; i++) {
        promises.push(
          query('SELECT COUNT(*) FROM tier_definitions')
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All operations should complete successfully
      expect(results.length).toBe(STRESS_OPERATIONS);
      results.forEach(result => {
        expect(result.rows).toBeDefined();
      });

      // Average time per operation should be reasonable
      const avgTime = (endTime - startTime) / STRESS_OPERATIONS;
      expect(avgTime).toBeLessThan(100); // 100ms per operation max
    });

    it("should handle concurrent user operations", async () => {
      const userIds = [];
      
      // Create multiple test users
      for (let i = 0; i < 10; i++) {
        userIds.push(await createTestUser("starter"));
      }

      const promises = [];

      // Simulate concurrent operations for each user
      userIds.forEach(userId => {
        promises.push(tierService.recordAuditUsage(userId, 25, 10, 5));
        promises.push(tierService.getCurrentMonthUsage(userId));
        promises.push(tierService.canPerformAudit(userId, 30, 15));
      });

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();

      // All operations should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max

      // Cleanup
      for (const userId of userIds) {
        await cleanupTestUser(userId);
      }
    });
  });
});

// Helper functions
async function createTestUser(tier = "starter") {
  const email = `perf-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  
  const result = await query(`
    INSERT INTO users (email, tier, first_name, last_name, password_hash) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [email, tier, "Perf", "Test", "hashedpassword"]);

  const userId = result.rows[0].id;
  await tierService.updateUserLimits(userId, tier);
  return userId;
}

async function cleanupTestUser(userId) {
  try {
    await query('DELETE FROM usage_tracking WHERE user_id = $1', [userId]);
    await query('DELETE FROM user_limits WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);
  } catch (error) {
    console.warn('Performance test cleanup error:', error.message);
  }
}
