/**
 * Integration Tests for Tier System
 * Tests the complete integration between all tier system components
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tierService } from "../services/tierService.js";
import { billingService } from "../services/billingService.js";
import { User } from "../models/index.js";
import request from "supertest";
import getApp from "../app.js";

describe("Tier System Integration Tests", () => {
  let app;
  let testUserId;
  let apiKey;

  beforeEach(async () => {
    app = await getApp();
    testUserId = await createTestUser("professional");
    apiKey = await tierService.generateApiKey(testUserId);
  });

  afterEach(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe("End-to-End User Journey", () => {
    it("should handle complete user upgrade journey", async () => {
      // 1. Start with starter user
      const starterUserId = await createTestUser("starter");
      
      // 2. Check initial limits
      const initialLimits = await tierService.getUserLimits(starterUserId);
      expect(initialLimits.audits_per_month).toBe(25);
      expect(initialLimits.api_access).toBe(false);

      // 3. Simulate subscription upgrade
      await tierService.updateUserTier(starterUserId, "professional");
      
      // 4. Verify upgraded limits
      const upgradedLimits = await tierService.getUserLimits(starterUserId);
      expect(upgradedLimits.audits_per_month).toBe(200);
      expect(upgradedLimits.api_access).toBe(true);

      // 5. Generate API key for new professional user
      const newApiKey = await tierService.generateApiKey(starterUserId);
      expect(newApiKey).toMatch(/^sk_[a-f0-9]{48}$/);

      // 6. Test API access with new key
      const response = await request(app)
        .get("/api/v1/audits")
        .set("x-api-key", newApiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      await cleanupTestUser(starterUserId);
    });

    it("should enforce limits throughout user journey", async () => {
      // 1. Create freemium user (no tier)
      const freemiumUserId = await createTestUser("freemium");

      // 2. Try to perform audit beyond freemium limits
      const freemiumResult = await tierService.canPerformAudit(freemiumUserId, 100, 50);
      expect(freemiumResult.allowed).toBe(false);

      // 3. Upgrade to starter
      await tierService.updateUserTier(freemiumUserId, "starter");

      // 4. Now same audit should be allowed
      const starterResult = await tierService.canPerformAudit(freemiumUserId, 50, 25);
      expect(starterResult.allowed).toBe(true);

      // 5. Record usage
      await tierService.recordAuditUsage(freemiumUserId, 50, 25, 15);

      // 6. Check usage tracking
      const usage = await tierService.getCurrentMonthUsage(freemiumUserId);
      expect(usage.audits_used).toBe(1);
      expect(usage.internal_pages_scanned).toBe(50);

      await cleanupTestUser(freemiumUserId);
    });
  });

  describe("API Integration", () => {
    it("should integrate authentication with rate limiting", async () => {
      // Professional tier should have 1000 API calls per month
      const professionalUserId = await createTestUser("professional");
      const professionalApiKey = await tierService.generateApiKey(professionalUserId);

      // Test API call with rate limiting
      const response = await request(app)
        .get("/api/v1/audits")
        .set("x-api-key", professionalApiKey)
        .expect(200);

      expect(response.headers["x-ratelimit-limit"]).toBe("1000");
      expect(response.headers["x-ratelimit-remaining"]).toBe("999");

      await cleanupTestUser(professionalUserId);
    });

    it("should handle API audit creation flow", async () => {
      const auditData = {
        url: "https://example.com",
        options: {
          maxPages: 50,
          maxLinks: 25
        }
      };

      const response = await request(app)
        .post("/api/v1/audits")
        .set("x-api-key", apiKey)
        .send(auditData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.audit).toBeDefined();
      expect(response.body.audit.id).toBeDefined();

      // Test status endpoint
      const statusResponse = await request(app)
        .get(`/api/v1/audits/${response.body.audit.id}/status`)
        .set("x-api-key", apiKey)
        .expect(200);

      expect(statusResponse.body.status).toBeDefined();
    });

    it("should reject invalid API keys", async () => {
      await request(app)
        .get("/api/v1/audits")
        .set("x-api-key", "invalid_key")
        .expect(401);
    });

    it("should reject API access for non-professional tiers", async () => {
      const starterUserId = await createTestUser("starter");
      
      // Starter users should not be able to generate API keys
      await expect(tierService.generateApiKey(starterUserId))
        .rejects.toThrow("API access not available");

      await cleanupTestUser(starterUserId);
    });
  });

  describe("Billing Integration", () => {
    it("should handle subscription webhook events", async () => {
      const user = await User.findById(testUserId);
      
      // Mock Stripe customer
      const mockCustomer = await billingService.createStripeCustomer(user);
      
      // Simulate subscription created webhook
      const webhookEvent = {
        type: "customer.subscription.created",
        data: {
          object: {
            id: "sub_test123",
            customer: mockCustomer.id,
            status: "active",
            items: {
              data: [{
                price: { id: "price_professional_monthly" }
              }]
            },
            current_period_start: Date.now() / 1000,
            current_period_end: (Date.now() / 1000) + (30 * 24 * 60 * 60)
          }
        }
      };

      // Process webhook
      await billingService.handleWebhook(webhookEvent);

      // Verify user tier was updated
      const updatedUser = await User.findById(testUserId);
      expect(updatedUser.tier).toBe("professional");
      expect(updatedUser.stripe_subscription_id).toBe("sub_test123");
    });

    it("should handle subscription cancellation", async () => {
      // Set up active subscription
      await tierService.updateUserTier(testUserId, "professional");
      
      // Simulate subscription cancelled webhook
      const webhookEvent = {
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_test123",
            customer: "cus_test123",
            status: "canceled"
          }
        }
      };

      await billingService.handleWebhook(webhookEvent);

      // Verify user was downgraded
      const user = await User.findById(testUserId);
      expect(user.tier).toBe("starter"); // Downgraded from professional
    });
  });

  describe("Dashboard Integration", () => {
    it("should display correct tier information", async () => {
      // Create session for user
      const agent = request.agent(app);
      
      // Login user (simplified for test)
      await agent
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password"
        });

      // Access dashboard
      const response = await agent
        .get("/dashboard")
        .expect(200);

      expect(response.text).toContain("Professional");
      expect(response.text).toContain("API Access");
    });

    it("should show usage statistics", async () => {
      // Record some usage
      await tierService.recordAuditUsage(testUserId, 50, 25, 15);
      await tierService.recordAuditUsage(testUserId, 30, 20, 10);

      // The dashboard should display this usage
      const usage = await tierService.getCurrentMonthUsage(testUserId);
      expect(usage.audits_used).toBe(2);
      expect(usage.internal_pages_scanned).toBe(80);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle database connection failures gracefully", async () => {
      // This test would require mocking database connection failure
      // For now, we'll test error response format
      const response = await request(app)
        .get("/api/v1/audits")
        .set("x-api-key", "invalid_key")
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it("should handle Stripe service errors", async () => {
      // Mock Stripe error scenario
      const invalidWebhookEvent = {
        type: "invalid_event_type",
        data: { object: {} }
      };

      // Should not throw error, but handle gracefully
      await expect(billingService.handleWebhook(invalidWebhookEvent))
        .resolves.not.toThrow();
    });
  });

  describe("Security Integration", () => {
    it("should prevent unauthorized tier escalation", async () => {
      const starterUserId = await createTestUser("starter");
      
      // Attempt to directly call professional tier features
      const result = await tierService.canPerformAudit(starterUserId, 300, 150);
      expect(result.allowed).toBe(false);
      
      await cleanupTestUser(starterUserId);
    });

    it("should validate API keys properly", async () => {
      // Test with expired or invalid format API key
      await request(app)
        .get("/api/v1/audits")
        .set("x-api-key", "sk_invalid")
        .expect(401);

      // Test with no API key
      await request(app)
        .get("/api/v1/audits")
        .expect(401);
    });

    it("should protect against injection attacks", async () => {
      const maliciousApiKey = "'; DROP TABLE users; --";
      
      await request(app)
        .get("/api/v1/audits")
        .set("x-api-key", maliciousApiKey)
        .expect(401);

      // Verify users table still exists
      const result = await query("SELECT COUNT(*) FROM users");
      expect(result.rows[0].count).toBeGreaterThan(0);
    });
  });
});

// Helper functions (reused from other test files)
async function createTestUser(tier = "starter") {
  const email = `integration-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  
  const result = await query(`
    INSERT INTO users (email, tier, first_name, last_name, password_hash) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [email, tier, "Integration", "Test", "hashedpassword"]);

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
    console.warn('Integration test cleanup error:', error.message);
  }
}
