/**
 * Comprehensive Tier System Testing Suite
 * Tests all aspects of the tier system implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { tierService } from "../services/tierService.js";
import { billingService } from "../services/billingService.js";
import { query, testConnection } from "../models/database.js";
import { User } from "../models/index.js";

describe("Tier System Implementation Tests", () => {

  // Test database connection
  describe("Database Connection", () => {
    it("should connect to database successfully", async () => {
      const connection = await testConnection();
      expect(connection).toBe(true);
    });
  });

  describe("TierService", () => {
    let testUserId;

    beforeEach(async () => {
      // Create test user for each test
      testUserId = await createTestUser("starter");
    });

    afterEach(async () => {
      // Cleanup test data
      if (testUserId) {
        await cleanupTestUser(testUserId);
      }
    });

    describe("Tier Limits Enforcement", () => {
      it("should enforce freemium limits correctly", async () => {
        const result = await tierService.canPerformAudit(null, 50, 20);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("limit");
      });

      it("should allow starter tier within limits", async () => {
        const result = await tierService.canPerformAudit(testUserId, 25, 10);
        expect(result.allowed).toBe(true);
      });

      it("should block starter tier when exceeding limits", async () => {
        const result = await tierService.canPerformAudit(testUserId, 100, 50);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain("pages");
      });

      it("should allow professional tier with higher limits", async () => {
        const proUserId = await createTestUser("professional");
        const result = await tierService.canPerformAudit(proUserId, 200, 100);
        expect(result.allowed).toBe(true);
        await cleanupTestUser(proUserId);
      });

      it("should allow enterprise tier unlimited audits", async () => {
        const entUserId = await createTestUser("enterprise");
        const result = await tierService.canPerformAudit(entUserId, 1000, 500);
        expect(result.allowed).toBe(true);
        await cleanupTestUser(entUserId);
      });
    });

    describe("Usage Tracking", () => {
      it("should track audit usage correctly", async () => {
        await tierService.recordAuditUsage(testUserId, 50, 25, 15);

        const usage = await tierService.getCurrentMonthUsage(testUserId);
        expect(usage.audits_used).toBe(1);
        expect(usage.internal_pages_scanned).toBe(50);
        expect(usage.external_links_checked).toBe(25);
      });

      it("should calculate monthly usage accurately", async () => {
        // Record multiple audits
        await tierService.recordAuditUsage(testUserId, 20, 10, 5);
        await tierService.recordAuditUsage(testUserId, 30, 15, 8);

        const usage = await tierService.getCurrentMonthUsage(testUserId);
        expect(usage.audits_used).toBe(2);
        expect(usage.internal_pages_scanned).toBe(50);
        expect(usage.external_links_checked).toBe(25);
      });

      it("should reset usage tracking for new month", async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthKey = lastMonth.toISOString().substring(0, 7);

        // Record usage for last month
        await query(`
          INSERT INTO usage_tracking (user_id, month_year, audits_used, internal_pages_scanned)
          VALUES ($1, $2, 5, 100)
        `, [testUserId, monthKey]);

        // Current month should be separate
        const currentUsage = await tierService.getCurrentMonthUsage(testUserId);
        expect(currentUsage.audits_used).toBe(0);
      });
    });

    describe("API Access", () => {
      it("should deny API access for freemium/starter tiers", async () => {
        const hasAccess = await tierService.hasApiAccess(testUserId);
        expect(hasAccess).toBe(false);
      });

      it("should allow API access for professional tier", async () => {
        const proUserId = await createTestUser("professional");
        const hasAccess = await tierService.hasApiAccess(proUserId);
        expect(hasAccess).toBe(true);
        await cleanupTestUser(proUserId);
      });

      it("should generate API keys for eligible users", async () => {
        const proUserId = await createTestUser("professional");
        const apiKey = await tierService.generateApiKey(proUserId);
        
        expect(apiKey).toMatch(/^sk_[a-f0-9]{48}$/);
        
        // Verify key is stored
        const result = await query('SELECT api_key FROM users WHERE id = $1', [proUserId]);
        expect(result.rows[0].api_key).toBe(apiKey);
        
        await cleanupTestUser(proUserId);
      });
    });

    describe("Tier Validation", () => {
      it("should validate user tier correctly", async () => {
        const isValid = await tierService.validateUserTier(testUserId, "starter");
        expect(isValid).toBe(true);
      });

      it("should reject invalid tier validation", async () => {
        const isValid = await tierService.validateUserTier(testUserId, "enterprise");
        expect(isValid).toBe(false);
      });

      it("should update user tier successfully", async () => {
        await tierService.updateUserTier(testUserId, "professional");
        
        const user = await User.findById(testUserId);
        expect(user.tier).toBe("professional");
      });
    });
  });

  describe("BillingService", () => {
    let testUserId;
    let mockStripeCustomer;

    beforeEach(async () => {
      testUserId = await createTestUser("starter");
      
      // Mock Stripe customer
      mockStripeCustomer = {
        id: "cus_test123",
        email: "test@example.com",
        created: Date.now() / 1000
      };

      // Mock Stripe methods
      vi.spyOn(billingService.stripe.customers, 'create').mockResolvedValue(mockStripeCustomer);
    });

    afterEach(async () => {
      if (testUserId) {
        await cleanupTestUser(testUserId);
      }
      vi.restoreAllMocks();
    });

    describe("Customer Management", () => {
      it("should create Stripe customer successfully", async () => {
        const user = await User.findById(testUserId);
        const customer = await billingService.createStripeCustomer(user);
        
        expect(customer.email).toBe(user.email);
        expect(customer.id).toBe(mockStripeCustomer.id);
      });

      it("should handle existing Stripe customer", async () => {
        // Set existing stripe_customer_id
        await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', 
          [mockStripeCustomer.id, testUserId]);

        const user = await User.findById(testUserId);
        const customer = await billingService.getOrCreateStripeCustomer(user);
        
        expect(customer.id).toBe(mockStripeCustomer.id);
      });
    });

    describe("Subscription Management", () => {
      it("should create subscription correctly", async () => {
        const mockSubscription = {
          id: "sub_test123",
          status: "active",
          current_period_start: Date.now() / 1000,
          current_period_end: (Date.now() / 1000) + (30 * 24 * 60 * 60),
          items: {
            data: [{ price: { id: "price_professional_monthly" } }]
          }
        };

        vi.spyOn(billingService.stripe.subscriptions, 'create').mockResolvedValue(mockSubscription);

        const user = await User.findById(testUserId);
        const subscription = await billingService.createSubscription(
          mockStripeCustomer.id, 
          "price_professional_monthly"
        );

        expect(subscription.status).toBe("active");
      });

      it("should handle subscription updates", async () => {
        const mockUpdatedSubscription = {
          id: "sub_test123",
          status: "active",
          items: {
            data: [{ price: { id: "price_enterprise_monthly" } }]
          }
        };

        vi.spyOn(billingService.stripe.subscriptions, 'update').mockResolvedValue(mockUpdatedSubscription);

        const updated = await billingService.updateSubscription("sub_test123", {
          items: [{ price: "price_enterprise_monthly" }]
        });

        expect(updated.id).toBe("sub_test123");
      });
    });

    describe("Webhook Handling", () => {
      it("should handle subscription created webhook", async () => {
        const event = createMockWebhookEvent("customer.subscription.created", {
          id: "sub_test123",
          customer: mockStripeCustomer.id,
          status: "active",
          items: {
            data: [{ price: { id: "price_professional_monthly" } }]
          }
        });

        await expect(billingService.handleWebhook(event)).resolves.not.toThrow();
      });

      it("should handle subscription updated webhook", async () => {
        const event = createMockWebhookEvent("customer.subscription.updated", {
          id: "sub_test123",
          customer: mockStripeCustomer.id,
          status: "active"
        });

        await expect(billingService.handleWebhook(event)).resolves.not.toThrow();
      });

      it("should handle invoice payment succeeded webhook", async () => {
        const event = createMockWebhookEvent("invoice.payment_succeeded", {
          customer: mockStripeCustomer.id,
          subscription: "sub_test123",
          amount_paid: 2999
        });

        await expect(billingService.handleWebhook(event)).resolves.not.toThrow();
      });
    });
  });

  describe("Database Integrity", () => {
    it("should maintain referential integrity between users and limits", async () => {
      const userId = await createTestUser("professional");
      
      // Check that user_limits record exists
      const limitsResult = await query('SELECT * FROM user_limits WHERE user_id = $1', [userId]);
      expect(limitsResult.rows.length).toBe(1);
      expect(limitsResult.rows[0].tier).toBe("professional");
      
      await cleanupTestUser(userId);
    });

    it("should handle cascade deletes correctly", async () => {
      const userId = await createTestUser("starter");
      
      // Delete user
      await query('DELETE FROM users WHERE id = $1', [userId]);
      
      // Check that related records are deleted
      const limitsResult = await query('SELECT * FROM user_limits WHERE user_id = $1', [userId]);
      expect(limitsResult.rows.length).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid user ID gracefully", async () => {
      const result = await tierService.canPerformAudit(999999, 50, 25);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("user");
    });

    it("should handle Stripe API errors", async () => {
      vi.spyOn(billingService.stripe.customers, 'create').mockRejectedValue(
        new Error("Stripe API Error")
      );

      const user = await User.findById(await createTestUser("starter"));
      
      await expect(billingService.createStripeCustomer(user))
        .rejects.toThrow("Stripe API Error");
    });
  });
});

// Test Helper Functions
async function createTestUser(tier = "starter") {
  const email = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  
  const result = await query(`
    INSERT INTO users (email, tier, first_name, last_name, password_hash) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [email, tier, "Test", "User", "hashedpassword"]);

  const userId = result.rows[0].id;

  // Create user limits
  await tierService.updateUserLimits(userId, tier);

  return userId;
}

async function cleanupTestUser(userId) {
  try {
    // Delete from all related tables
    await query('DELETE FROM usage_tracking WHERE user_id = $1', [userId]);
    await query('DELETE FROM user_limits WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);
  } catch (error) {
    console.warn('Cleanup error:', error.message);
  }
}

function createMockWebhookEvent(type, data) {
  return {
    id: `evt_test_${Date.now()}`,
    type: type,
    data: {
      object: data
    },
    created: Date.now() / 1000,
    livemode: false
  };
}

export { createTestUser, cleanupTestUser, createMockWebhookEvent };
