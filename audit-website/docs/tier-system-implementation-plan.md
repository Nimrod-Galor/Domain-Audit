# SiteScope Audit - Tier System Implementation Plan

## 📋 **Overview**

This document provides a detailed, step-by-step implementation plan to transform the current audit tool into a multi-tier SaaS platform. The plan covers database changes, backend updates, frontend modifications, and deployment strategies.

---

## 🗂️ **Phase 1: Database & Schema Changes** (Week 1-2)

### **1.1 User Management Tables**

#### **Update `users` table:**

```sql
-- Add tier-related columns to existing users table
ALTER TABLE users ADD COLUMN tier VARCHAR(20) DEFAULT 'starter';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN subscription_start_date DATETIME NULL;
ALTER TABLE users ADD COLUMN subscription_end_date DATETIME NULL;
ALTER TABLE users ADD COLUMN billing_cycle VARCHAR(10) DEFAULT 'monthly'; -- 'monthly' or 'annual'
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN trial_start_date DATETIME NULL;
ALTER TABLE users ADD COLUMN trial_end_date DATETIME NULL;
ALTER TABLE users ADD COLUMN last_billing_date DATETIME NULL;
ALTER TABLE users ADD COLUMN next_billing_date DATETIME NULL;
ALTER TABLE users ADD COLUMN failed_payment_count INT DEFAULT 0;
```

#### **Create `user_limits` table:**

```sql
CREATE TABLE user_limits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  tier VARCHAR(20) NOT NULL,
  audits_per_month INT DEFAULT -1, -- -1 = unlimited
  max_internal_pages INT DEFAULT 25,
  max_external_links INT DEFAULT 10,
  max_domains INT DEFAULT 1,
  api_access BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  scheduled_audits BOOLEAN DEFAULT FALSE,
  team_members INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **Create `usage_tracking` table:**

```sql
CREATE TABLE usage_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  month_year VARCHAR(7), -- Format: 2025-08
  audits_used INT DEFAULT 0,
  internal_pages_scanned INT DEFAULT 0,
  external_links_checked INT DEFAULT 0,
  api_calls_used INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_month (user_id, month_year)
);
```

#### **Create `subscriptions` table:**

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due, trialing
  billing_cycle VARCHAR(10) DEFAULT 'monthly',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_subscription_id VARCHAR(100) UNIQUE,
  current_period_start DATETIME,
  current_period_end DATETIME,
  trial_start DATETIME NULL,
  trial_end DATETIME NULL,
  canceled_at DATETIME NULL,
  ended_at DATETIME NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **1.2 Audit System Updates**

#### **Update `audits` table:**

```sql
-- Add tier-related audit tracking
ALTER TABLE audits ADD COLUMN user_tier VARCHAR(20) DEFAULT 'freemium';
ALTER TABLE audits ADD COLUMN pages_limit_applied INT DEFAULT 0;
ALTER TABLE audits ADD COLUMN external_links_limit_applied INT DEFAULT 0;
ALTER TABLE audits ADD COLUMN is_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE audits ADD COLUMN parent_scheduled_audit_id INT NULL;
ALTER TABLE audits ADD COLUMN audit_type VARCHAR(20) DEFAULT 'manual'; -- manual, scheduled, api
```

#### **Create `scheduled_audits` table:**

```sql
CREATE TABLE scheduled_audits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  domain VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
  next_run_date DATETIME NOT NULL,
  last_run_date DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  slack_webhook_url VARCHAR(500) NULL,
  audit_config JSON NULL, -- Store audit parameters
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **1.3 Billing & Payments**

#### **Create `invoices` table:**

```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  subscription_id INT,
  stripe_invoice_id VARCHAR(100) UNIQUE,
  amount_due DECIMAL(10,2),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20), -- draft, open, paid, void, uncollectible
  invoice_date DATETIME,
  due_date DATETIME,
  paid_date DATETIME NULL,
  invoice_pdf_url VARCHAR(500) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);
```

#### **Create `tier_definitions` table:**

```sql
CREATE TABLE tier_definitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tier_name VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_annual DECIMAL(10,2) DEFAULT 0,
  audits_per_month INT DEFAULT -1,
  max_internal_pages INT DEFAULT 25,
  max_external_links INT DEFAULT 10,
  max_domains INT DEFAULT 1,
  api_access BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  scheduled_audits BOOLEAN DEFAULT FALSE,
  team_members INT DEFAULT 1,
  priority_support BOOLEAN DEFAULT FALSE,
  data_retention_days INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Insert default tier data:**

```sql
INSERT INTO tier_definitions (tier_name, display_name, price_monthly, price_annual, audits_per_month, max_internal_pages, max_external_links, max_domains, api_access, white_label, scheduled_audits, team_members, priority_support, data_retention_days) VALUES
('freemium', 'Freemium', 0, 0, 30, 25, 10, 1, FALSE, FALSE, FALSE, 1, FALSE, 7),
('starter', 'Starter', 0, 0, 3, 100, 50, 1, FALSE, FALSE, FALSE, 1, FALSE, 30),
('professional', 'Professional', 39, 29, -1, 1000, 200, 1, TRUE, TRUE, TRUE, 1, TRUE, 365),
('enterprise', 'Enterprise', 99, 79, -1, -1, -1, -1, TRUE, TRUE, TRUE, 10, TRUE, 730);
```

---

## 🔧 **Phase 2: Backend Service Layer** (Week 3-4)

### **2.1 User Tier Management Service**

#### **Create `services/tierService.js`:**

```javascript
// File: audit-website/services/tierService.js
import { query } from "../config/database.js";

export class TierService {
  // Get user's current tier and limits
  async getUserTierLimits(userId) {
    const result = await query(
      `
      SELECT u.tier, td.*, ul.*
      FROM users u
      LEFT JOIN tier_definitions td ON u.tier = td.tier_name
      LEFT JOIN user_limits ul ON u.id = ul.user_id
      WHERE u.id = ?
    `,
      [userId]
    );

    return result[0] || this.getDefaultLimits("freemium");
  }

  // Check if user can perform an audit
  async canPerformAudit(
    userId,
    requestedPages = 25,
    requestedExternalLinks = 10
  ) {
    const limits = await this.getUserTierLimits(userId);
    const usage = await this.getCurrentMonthUsage(userId);

    // Check monthly audit limit
    if (
      limits.audits_per_month !== -1 &&
      usage.audits_used >= limits.audits_per_month
    ) {
      return { allowed: false, reason: "Monthly audit limit exceeded" };
    }

    // Check page limits
    if (
      limits.max_internal_pages !== -1 &&
      requestedPages > limits.max_internal_pages
    ) {
      return {
        allowed: false,
        reason: `Page limit exceeded. Max: ${limits.max_internal_pages}`,
      };
    }

    // Check external link limits
    if (
      limits.max_external_links !== -1 &&
      requestedExternalLinks > limits.max_external_links
    ) {
      return {
        allowed: false,
        reason: `External link limit exceeded. Max: ${limits.max_external_links}`,
      };
    }

    return { allowed: true };
  }

  // Record audit usage
  async recordAuditUsage(userId, pagesScanned, externalLinksChecked) {
    const currentMonth = new Date().toISOString().substring(0, 7);

    await query(
      `
      INSERT INTO usage_tracking (user_id, month_year, audits_used, internal_pages_scanned, external_links_checked)
      VALUES (?, ?, 1, ?, ?)
      ON DUPLICATE KEY UPDATE
        audits_used = audits_used + 1,
        internal_pages_scanned = internal_pages_scanned + VALUES(internal_pages_scanned),
        external_links_checked = external_links_checked + VALUES(external_links_checked)
    `,
      [userId, currentMonth, pagesScanned, externalLinksChecked]
    );
  }

  // Get current month usage
  async getCurrentMonthUsage(userId) {
    const currentMonth = new Date().toISOString().substring(0, 7);

    const result = await query(
      `
      SELECT * FROM usage_tracking 
      WHERE user_id = ? AND month_year = ?
    `,
      [userId, currentMonth]
    );

    return (
      result[0] || {
        audits_used: 0,
        internal_pages_scanned: 0,
        external_links_checked: 0,
        api_calls_used: 0,
      }
    );
  }

  // Upgrade user tier
  async upgradeUserTier(userId, newTier, subscriptionData = null) {
    await query(
      `
      UPDATE users SET 
        tier = ?,
        subscription_status = 'active',
        subscription_start_date = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `,
      [newTier, userId]
    );

    if (subscriptionData) {
      await this.createSubscription(userId, newTier, subscriptionData);
    }

    await this.updateUserLimits(userId, newTier);
  }

  // Create subscription record
  async createSubscription(userId, tier, subscriptionData) {
    await query(
      `
      INSERT INTO subscriptions (
        user_id, tier, status, billing_cycle, amount, currency,
        stripe_subscription_id, current_period_start, current_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userId,
        tier,
        subscriptionData.status,
        subscriptionData.billing_cycle,
        subscriptionData.amount,
        subscriptionData.currency,
        subscriptionData.stripe_subscription_id,
        subscriptionData.current_period_start,
        subscriptionData.current_period_end,
      ]
    );
  }

  // Update user limits based on tier
  async updateUserLimits(userId, tier) {
    const tierDef = await query(
      `
      SELECT * FROM tier_definitions WHERE tier_name = ?
    `,
      [tier]
    );

    if (tierDef.length === 0) return;

    const limits = tierDef[0];

    await query(
      `
      INSERT INTO user_limits (
        user_id, tier, audits_per_month, max_internal_pages, 
        max_external_links, max_domains, api_access, white_label,
        scheduled_audits, team_members
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tier = VALUES(tier),
        audits_per_month = VALUES(audits_per_month),
        max_internal_pages = VALUES(max_internal_pages),
        max_external_links = VALUES(max_external_links),
        max_domains = VALUES(max_domains),
        api_access = VALUES(api_access),
        white_label = VALUES(white_label),
        scheduled_audits = VALUES(scheduled_audits),
        team_members = VALUES(team_members)
    `,
      [
        userId,
        tier,
        limits.audits_per_month,
        limits.max_internal_pages,
        limits.max_external_links,
        limits.max_domains,
        limits.api_access,
        limits.white_label,
        limits.scheduled_audits,
        limits.team_members,
      ]
    );
  }
}

export const tierService = new TierService();
```

### **2.2 Billing Integration Service**

#### **Create `services/billingService.js`:**

```javascript
// File: audit-website/services/billingService.js
import Stripe from "stripe";
import { query } from "../config/database.js";
import { tierService } from "./tierService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class BillingService {
  // Create Stripe customer
  async createStripeCustomer(user) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name,
      metadata: {
        userId: user.id.toString(),
      },
    });

    await query(
      `
      UPDATE users SET stripe_customer_id = ? WHERE id = ?
    `,
      [customer.id, user.id]
    );

    return customer;
  }

  // Create subscription
  async createSubscription(userId, tier, billingCycle = "monthly") {
    const user = await this.getUser(userId);

    if (!user.stripe_customer_id) {
      await this.createStripeCustomer(user);
    }

    const priceId = await this.getPriceId(tier, billingCycle);

    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: priceId }],
      trial_period_days: tier === "professional" ? 14 : 7,
      metadata: {
        userId: userId.toString(),
        tier: tier,
      },
    });

    await tierService.createSubscription(userId, tier, {
      status: subscription.status,
      billing_cycle: billingCycle,
      amount: subscription.items.data[0].price.unit_amount / 100,
      currency: subscription.currency.toUpperCase(),
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });

    return subscription;
  }

  // Handle Stripe webhooks
  async handleWebhook(event) {
    switch (event.type) {
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  // Get price ID for tier and billing cycle
  async getPriceId(tier, billingCycle) {
    const priceMap = {
      professional: {
        monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
        annual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID,
      },
      enterprise: {
        monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
        annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
      },
    };

    return priceMap[tier]?.[billingCycle];
  }

  async getUser(userId) {
    const result = await query("SELECT * FROM users WHERE id = ?", [userId]);
    return result[0];
  }
}

export const billingService = new BillingService();
```

### **2.3 Update Audit Controller**

#### **Modify `controllers/auditController.js`:**

```javascript
// Add to the top of auditController.js
import { tierService } from "../services/tierService.js";

// Update the submitAuditForm function
export const submitAuditForm = async (req, res) => {
  try {
    const { url, reportType } = auditValidationSchema.parse(req.body);
    const userId = req.session?.user?.id || null;
    const userTier = userId
      ? (await tierService.getUserTierLimits(userId)).tier
      : "freemium";

    // Determine maxPages based on user tier and request
    let maxPages = reportType === "quick" ? 10 : 50;

    // Apply tier-based limits
    const tierLimits = await tierService.getUserTierLimits(userId);
    maxPages = Math.min(maxPages, tierLimits.max_internal_pages);

    // Check if user can perform audit
    const canAudit = await tierService.canPerformAudit(
      userId,
      maxPages,
      tierLimits.max_external_links
    );
    if (!canAudit.allowed) {
      return res.render("audit/form", {
        title: "Website Audit",
        user: req.session.user || null,
        error: canAudit.reason,
        url: url,
        upgradeRequired: true,
        currentTier: userTier,
      });
    }

    // Rest of the existing audit logic...
    // But add usage tracking at the end

    // Record usage after successful audit
    if (userId) {
      setTimeout(async () => {
        const session = activeSessions.get(sessionId);
        if (session?.status === "completed") {
          await tierService.recordAuditUsage(
            userId,
            session.pagesAnalyzed || maxPages,
            session.externalLinksChecked || tierLimits.max_external_links
          );
        }
      }, 30000); // Record after 30 seconds
    }
  } catch (error) {
    // Error handling
  }
};
```

---

## 🎨 **Phase 3: Frontend Updates** (Week 5-6)

### **3.1 Pricing Page**

#### **Create `views/pricing.ejs`:**

```html
<!-- File: audit-website/views/pricing.ejs -->
<%- include('partials/header', { title: 'Pricing Plans - SiteScope', user: user
}) %>

<section class="py-5 bg-light">
  <div class="container">
    <div class="row justify-content-center text-center mb-5">
      <div class="col-lg-8">
        <h1 class="display-4 fw-bold mb-3">Choose Your Plan</h1>
        <p class="lead text-muted">
          Scale your website auditing with plans designed for every need
        </p>

        <!-- Billing Toggle -->
        <div class="d-flex justify-content-center align-items-center mt-4">
          <span class="me-3">Monthly</span>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="billingToggle"
            />
            <label class="form-check-label" for="billingToggle"></label>
          </div>
          <span class="ms-3"
            >Annual <span class="badge bg-success">Save 26%</span></span
          >
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <!-- Freemium Tier -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center p-4">
            <h5 class="card-title">Freemium</h5>
            <div class="display-6 fw-bold mb-3">Free</div>
            <p class="text-muted mb-4">Perfect for trying out our service</p>

            <ul class="list-unstyled mb-4">
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>1 audit per day
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>25 internal pages
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>10 external links
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Basic report
              </li>
              <li class="mb-2">
                <i class="fas fa-times text-danger me-2"></i>No history
              </li>
            </ul>

            <button
              class="btn btn-outline-primary w-100"
              onclick="startFreeTrial('freemium')"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>

      <!-- Starter Tier -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center p-4">
            <h5 class="card-title">Starter</h5>
            <div class="display-6 fw-bold mb-3">Free</div>
            <p class="text-muted mb-4">Build habits and prove ROI</p>

            <ul class="list-unstyled mb-4">
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>3 audits per month
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>100 internal pages
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>50 external links
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Full reports
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>30-day history
              </li>
            </ul>

            <button
              class="btn btn-outline-primary w-100"
              onclick="startFreeTrial('starter')"
            >
              Register for Free
            </button>
          </div>
        </div>
      </div>

      <!-- Professional Tier -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100 border-primary shadow-lg position-relative">
          <div
            class="badge bg-primary position-absolute top-0 start-50 translate-middle px-3 py-2"
          >
            Most Popular
          </div>
          <div class="card-body text-center p-4">
            <h5 class="card-title">Professional</h5>
            <div class="display-6 fw-bold mb-3">
              <span class="monthly-price">$39</span>
              <span class="annual-price d-none">$29</span>
              <small class="text-muted fs-6">/month</small>
            </div>
            <p class="text-muted mb-4">Perfect for agencies and consultants</p>

            <ul class="list-unstyled mb-4">
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Unlimited audits
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>1,000 internal
                pages
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>200 external links
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Scheduled audits
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>API access
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>White-label
                reports
              </li>
            </ul>

            <button
              class="btn btn-primary w-100"
              onclick="subscribeToPlan('professional')"
            >
              Start 14-day Trial
            </button>
          </div>
        </div>
      </div>

      <!-- Enterprise Tier -->
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center p-4">
            <h5 class="card-title">Enterprise</h5>
            <div class="display-6 fw-bold mb-3">
              <span class="monthly-price">$99</span>
              <span class="annual-price d-none">$79</span>
              <small class="text-muted fs-6">/month</small>
            </div>
            <p class="text-muted mb-4">Scale your audit operations</p>

            <ul class="list-unstyled mb-4">
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Everything in Pro
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Unlimited pages &
                links
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>10 team members
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Priority support
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Custom
                integrations
              </li>
              <li class="mb-2">
                <i class="fas fa-check text-success me-2"></i>Dedicated manager
              </li>
            </ul>

            <button
              class="btn btn-dark w-100"
              onclick="subscribeToPlan('enterprise')"
            >
              Start 7-day Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  document
    .getElementById("billingToggle")
    .addEventListener("change", function () {
      const isAnnual = this.checked;
      const monthlyPrices = document.querySelectorAll(".monthly-price");
      const annualPrices = document.querySelectorAll(".annual-price");

      monthlyPrices.forEach((price) => {
        price.classList.toggle("d-none", isAnnual);
      });

      annualPrices.forEach((price) => {
        price.classList.toggle("d-none", !isAnnual);
      });
    });

  function subscribeToPlan(tier) {
    const billingCycle = document.getElementById("billingToggle").checked
      ? "annual"
      : "monthly";
    window.location.href = `/billing/subscribe?tier=${tier}&billing=${billingCycle}`;
  }

  function startFreeTrial(tier) {
    if (tier === "freemium") {
      window.location.href = "/audit";
    } else {
      window.location.href = "/auth/register";
    }
  }
</script>

<%- include('partials/footer') %>
```

### **3.2 Billing Routes**

#### **Create `routes/billing.js`:**

```javascript
// File: audit-website/routes/billing.js
import express from "express";
import { billingService } from "../services/billingService.js";
import { tierService } from "../services/tierService.js";

const router = express.Router();

// Subscription page
router.get("/subscribe", async (req, res) => {
  const { tier, billing = "monthly" } = req.query;

  if (!req.session.user) {
    req.session.redirectTo = req.originalUrl;
    return res.redirect("/auth/login");
  }

  try {
    const subscription = await billingService.createSubscription(
      req.session.user.id,
      tier,
      billing
    );

    res.redirect(`/billing/success?session_id=${subscription.id}`);
  } catch (error) {
    res.render("billing/error", {
      title: "Subscription Error",
      user: req.session.user,
      error: error.message,
    });
  }
});

// Billing portal
router.get("/portal", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  try {
    const user = req.session.user;
    const portalSession = await billingService.createPortalSession(
      user.stripe_customer_id
    );
    res.redirect(portalSession.url);
  } catch (error) {
    res.redirect("/dashboard?error=billing_error");
  }
});

// Webhook endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      await billingService.handleWebhook(event);
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
```

### **3.3 Dashboard Updates**

#### **Create `views/dashboard/index.ejs`:**

```html
<!-- File: audit-website/views/dashboard/index.ejs -->
<%- include('../partials/header', { title: 'Dashboard - SiteScope', user: user
}) %>

<div class="container-fluid">
  <div class="row">
    <!-- Sidebar -->
    <div class="col-md-3 col-lg-2 sidebar bg-light">
      <div class="position-sticky pt-3">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link active" href="/dashboard">
              <i class="fas fa-tachometer-alt"></i> Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/dashboard/audits">
              <i class="fas fa-search"></i> My Audits
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/dashboard/scheduled">
              <i class="fas fa-clock"></i> Scheduled Audits
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/dashboard/billing">
              <i class="fas fa-credit-card"></i> Billing
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/dashboard/api">
              <i class="fas fa-code"></i> API Access
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main content -->
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
      >
        <h1 class="h2">Dashboard</h1>
        <div class="btn-toolbar mb-2 mb-md-0">
          <div class="btn-group me-2">
            <a href="/audit" class="btn btn-sm btn-primary">New Audit</a>
          </div>
        </div>
      </div>

      <!-- Usage Statistics -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h5 class="card-title">Audits This Month</h5>
                  <h2 class="mb-0">
                    <%= usage.audits_used %> / <%= limits.audits_per_month ===
                    -1 ? '∞' : limits.audits_per_month %>
                  </h2>
                </div>
                <div class="fs-1">
                  <i class="fas fa-search"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h5 class="card-title">Pages Scanned</h5>
                  <h2 class="mb-0"><%= usage.internal_pages_scanned %></h2>
                </div>
                <div class="fs-1">
                  <i class="fas fa-file-alt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h5 class="card-title">External Links</h5>
                  <h2 class="mb-0"><%= usage.external_links_checked %></h2>
                </div>
                <div class="fs-1">
                  <i class="fas fa-external-link-alt"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h5 class="card-title">Current Tier</h5>
                  <h2 class="mb-0">
                    <%= user.tier.charAt(0).toUpperCase() + user.tier.slice(1)
                    %>
                  </h2>
                </div>
                <div class="fs-1">
                  <i class="fas fa-star"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Audits -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Recent Audits</h5>
              <a href="/dashboard/audits" class="btn btn-sm btn-outline-primary"
                >View All</a
              >
            </div>
            <div class="card-body">
              <% if (recentAudits && recentAudits.length > 0) { %>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <% recentAudits.forEach(audit => { %>
                    <tr>
                      <td><%= audit.url %></td>
                      <td>
                        <span
                          class="badge bg-<%= audit.status === 'completed' ? 'success' : audit.status === 'failed' ? 'danger' : 'warning' %>"
                        >
                          <%= audit.status %>
                        </span>
                      </td>
                      <td>
                        <% if (audit.score) { %>
                        <span
                          class="badge bg-<%= audit.score >= 80 ? 'success' : audit.score >= 60 ? 'warning' : 'danger' %>"
                        >
                          <%= audit.score %>/100
                        </span>
                        <% } else { %> - <% } %>
                      </td>
                      <td>
                        <%= new Date(audit.created_at).toLocaleDateString() %>
                      </td>
                      <td>
                        <% if (audit.status === 'completed') { %>
                        <a
                          href="/audit/results/<%= audit.session_id %>"
                          class="btn btn-sm btn-outline-primary"
                          >View</a
                        >
                        <% } %>
                      </td>
                    </tr>
                    <% }); %>
                  </tbody>
                </table>
              </div>
              <% } else { %>
              <div class="text-center py-4">
                <p class="text-muted">
                  No audits yet. <a href="/audit">Start your first audit</a>
                </p>
              </div>
              <% } %>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

<%- include('../partials/footer') %>
```

---

## 🚀 **Phase 4: API & Advanced Features** (Week 7-8)

### **4.1 API Authentication & Rate Limiting**

#### **Create `middleware/apiAuth.js`:**

```javascript
// File: audit-website/middleware/apiAuth.js
import { query } from "../config/database.js";
import { tierService } from "../services/tierService.js";

export const apiAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const result = await query(
      `
      SELECT u.*, ul.* FROM users u
      LEFT JOIN user_limits ul ON u.id = ul.user_id
      WHERE u.api_key = ? AND u.tier IN ('professional', 'enterprise')
    `,
      [apiKey]
    );

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.user = result[0];
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication error" });
  }
};

export const rateLimiter = async (req, res, next) => {
  const userId = req.user.id;
  const currentMonth = new Date().toISOString().substring(0, 7);

  try {
    const usage = await tierService.getCurrentMonthUsage(userId);
    const limits = await tierService.getUserTierLimits(userId);

    // Check API rate limits
    if (limits.tier === "professional" && usage.api_calls_used >= 1000) {
      return res.status(429).json({ error: "API rate limit exceeded" });
    }

    if (limits.tier === "enterprise" && usage.api_calls_used >= 10000) {
      return res.status(429).json({ error: "API rate limit exceeded" });
    }

    // Record API call
    await query(
      `
      UPDATE usage_tracking SET api_calls_used = api_calls_used + 1
      WHERE user_id = ? AND month_year = ?
    `,
      [userId, currentMonth]
    );

    next();
  } catch (error) {
    res.status(500).json({ error: "Rate limiting error" });
  }
};
```

### **4.2 API Routes**

#### **Create `routes/api/v1/audits.js`:**

```javascript
// File: audit-website/routes/api/v1/audits.js
import express from "express";
import { apiAuth, rateLimiter } from "../../../middleware/apiAuth.js";
import { auditExecutor } from "../../../lib/audit-executor.js";
import { tierService } from "../../../services/tierService.js";

const router = express.Router();

// Create audit via API
router.post("/audits", apiAuth, rateLimiter, async (req, res) => {
  const { url, type = "full", webhook_url = null } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const userId = req.user.id;
    const limits = await tierService.getUserTierLimits(userId);

    // Check if user can perform audit
    const canAudit = await tierService.canPerformAudit(userId);
    if (!canAudit.allowed) {
      return res.status(429).json({ error: canAudit.reason });
    }

    // Generate session ID
    const sessionId =
      Date.now() + "-api-" + Math.random().toString(36).substr(2, 9);

    // Start audit asynchronously
    auditExecutor
      .executeAudit(url, limits.max_internal_pages, false, sessionId, {
        isRegistered: true,
        maxExternalLinks: limits.max_external_links,
      })
      .then(async (result) => {
        // Record usage
        await tierService.recordAuditUsage(
          userId,
          result.stateData?.visited?.length || 0,
          Object.keys(result.stateData?.externalLinks || {}).length
        );

        // Send webhook if provided
        if (webhook_url) {
          try {
            await fetch(webhook_url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionId,
                status: "completed",
                url: url,
                report_data: result.stateData,
              }),
            });
          } catch (webhookError) {
            console.error("Webhook error:", webhookError);
          }
        }
      })
      .catch(console.error);

    res.json({
      session_id: sessionId,
      status: "started",
      url: url,
      estimated_duration: "5-15 minutes",
      status_url: `/api/v1/audits/${sessionId}/status`,
      result_url: `/api/v1/audits/${sessionId}/result`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to start audit" });
  }
});

// Get audit status
router.get("/audits/:sessionId/status", apiAuth, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await query(
      `
      SELECT status, progress, created_at, updated_at 
      FROM audits WHERE session_id = ? AND user_id = ?
    `,
      [sessionId, req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Audit not found" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to get audit status" });
  }
});

// Get audit results
router.get("/audits/:sessionId/result", apiAuth, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await query(
      `
      SELECT * FROM audits 
      WHERE session_id = ? AND user_id = ? AND status = 'completed'
    `,
      [sessionId, req.user.id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Audit not found or not completed" });
    }

    res.json({
      session_id: sessionId,
      status: "completed",
      url: result[0].url,
      report_data: result[0].report_data,
      score: result[0].score,
      created_at: result[0].created_at,
      completed_at: result[0].updated_at,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get audit results" });
  }
});

export default router;
```

---

## 🔐 **Phase 5: Security & Performance** (Week 9)

### **5.1 Environment Configuration**

#### **Update `.env.example`:**

```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sitescope_audit

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_...
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# Session Secret
SESSION_SECRET=your-super-secret-session-key

# API Configuration
API_RATE_LIMIT_PROFESSIONAL=1000
API_RATE_LIMIT_ENTERPRISE=10000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Redis (for session storage and caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### **5.2 Database Migration Script**

#### **Create `scripts/migrate-to-tier-system.js`:**

```javascript
// File: audit-website/scripts/migrate-to-tier-system.js
import { query } from "../config/database.js";
import { tierService } from "../services/tierService.js";

async function migrateDatabaseToTierSystem() {
  console.log("🚀 Starting tier system migration...");

  try {
    // 1. Update existing users to starter tier
    await query(`
      UPDATE users SET tier = 'starter' 
      WHERE tier IS NULL OR tier = ''
    `);

    // 2. Create user limits for existing users
    const existingUsers = await query(`
      SELECT id, tier FROM users WHERE id NOT IN (
        SELECT user_id FROM user_limits
      )
    `);

    for (const user of existingUsers) {
      await tierService.updateUserLimits(user.id, user.tier || "starter");
    }

    // 3. Migrate existing audit data
    await query(`
      UPDATE audits SET user_tier = 'starter' 
      WHERE user_tier IS NULL AND user_id IS NOT NULL
    `);

    await query(`
      UPDATE audits SET user_tier = 'freemium' 
      WHERE user_tier IS NULL AND user_id IS NULL
    `);

    console.log("✅ Migration completed successfully!");
    console.log(`📊 Updated ${existingUsers.length} users`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabaseToTierSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrateDatabaseToTierSystem };
```

---

## 📊 **Phase 6: Testing & Deployment** (Week 10)

### **6.1 Testing Strategy**

#### **Create `tests/tier-system.test.js`:**

```javascript
// File: audit-website/tests/tier-system.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { tierService } from "../services/tierService.js";
import { billingService } from "../services/billingService.js";

describe("Tier System", () => {
  describe("TierService", () => {
    it("should enforce freemium limits", async () => {
      const result = await tierService.canPerformAudit(null, 50, 20);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("limit exceeded");
    });

    it("should allow professional tier unlimited audits", async () => {
      const userId = await createTestUser("professional");
      const result = await tierService.canPerformAudit(userId, 500, 100);
      expect(result.allowed).toBe(true);
    });

    it("should track usage correctly", async () => {
      const userId = await createTestUser("starter");
      await tierService.recordAuditUsage(userId, 50, 25);

      const usage = await tierService.getCurrentMonthUsage(userId);
      expect(usage.audits_used).toBe(1);
      expect(usage.internal_pages_scanned).toBe(50);
    });
  });

  describe("BillingService", () => {
    it("should create Stripe customer", async () => {
      const user = await createTestUser("starter");
      const customer = await billingService.createStripeCustomer(user);
      expect(customer.email).toBe(user.email);
    });

    it("should handle subscription webhooks", async () => {
      const event = createMockWebhookEvent("customer.subscription.updated");
      await expect(billingService.handleWebhook(event)).resolves.not.toThrow();
    });
  });
});

// Test helpers
async function createTestUser(tier = "starter") {
  const userId = await query(
    `
    INSERT INTO users (email, tier, full_name) 
    VALUES (?, ?, ?)
  `,
    [`test-${Date.now()}@example.com`, tier, "Test User"]
  );

  await tierService.updateUserLimits(userId, tier);
  return { id: userId, tier, email: `test-${Date.now()}@example.com` };
}
```

### **6.2 Deployment Checklist**

#### **Create `docs/deployment-checklist.md`:**

```markdown
# Tier System Deployment Checklist

## Pre-Deployment

- [ ] Database backup created
- [ ] Environment variables configured
- [ ] Stripe products and prices created
- [ ] SSL certificates updated
- [ ] CDN configuration updated

## Database Migration

- [ ] Run migration script in staging
- [ ] Verify data integrity
- [ ] Test rollback procedure
- [ ] Run migration in production

## Stripe Configuration

- [ ] Create products in Stripe dashboard
- [ ] Configure webhook endpoints
- [ ] Test payment flows in test mode
- [ ] Switch to live mode

## Feature Testing

- [ ] Test all tier limitations
- [ ] Verify billing workflows
- [ ] Test API authentication
- [ ] Check dashboard functionality
- [ ] Validate email notifications

## Performance Monitoring

- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Monitor database performance
- [ ] Track key metrics

## Post-Deployment

- [ ] Monitor for errors
- [ ] Check conversion funnels
- [ ] Validate user experience
- [ ] Update documentation
```

---

## 🎯 **Implementation Timeline & Milestones**

### **Week 1-2: Foundation**

- ✅ Database schema design and implementation
- ✅ Core tier service development
- ✅ User migration strategy

### **Week 3-4: Backend Services**

- ✅ Billing integration with Stripe
- ✅ Usage tracking and limits enforcement
- ✅ Audit controller updates

### **Week 5-6: Frontend Development**

- ✅ Pricing page design and implementation
- ✅ Dashboard creation
- ✅ User experience flows

### **Week 7-8: Advanced Features**

- ✅ API authentication and rate limiting
- ✅ Scheduled audits system
- ✅ White-label functionality

### **Week 9: Security & Testing**

- ✅ Security audit and hardening
- ✅ Performance optimization
- ✅ Comprehensive testing

### **Week 10: Deployment**

- ✅ Staging deployment and testing
- ✅ Production deployment
- ✅ Monitoring and optimization

---

## 📈 **Success Metrics & KPIs**

### **Technical Metrics**

- Database migration success rate: 100%
- API response time: <200ms
- Payment processing uptime: 99.9%
- System availability: 99.95%

### **Business Metrics**

- Free-to-paid conversion rate: >5%
- Monthly churn rate: <5%
- Average revenue per user: $45+
- Customer satisfaction score: >4.5/5

### **Growth Metrics**

- Monthly new user growth: 20%
- API adoption rate: 30% of paid users
- Feature utilization rates by tier
- Support ticket volume and resolution time

---

## 🔧 **Phase 7: Administrator Dashboard** (Week 11-12)

### **7.1 Admin User Management**

#### **Update `users` table for admin roles:**

```sql
-- Add admin-related columns
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN admin_permissions JSON NULL;
ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL;
ALTER TABLE users ADD COLUMN login_count INT DEFAULT 0;

-- Create admin roles
INSERT INTO users (email, full_name, role, is_admin, admin_permissions, password_hash) VALUES
('admin@sitescope.com', 'System Administrator', 'super_admin', TRUE, '["users", "billing", "audits", "analytics", "system"]', '$2b$12$...');
```

#### **Create `admin_activity_log` table:**

```sql
CREATE TABLE admin_activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id INT,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'user', 'subscription', 'audit', 'system'
  target_id VARCHAR(100),
  details JSON NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_activity (admin_user_id, created_at),
  INDEX idx_target (target_type, target_id)
);
```

#### **Create `system_settings` table:**

```sql
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', FALSE),
('max_concurrent_audits', '50', 'number', 'Maximum concurrent audits allowed', FALSE),
('default_audit_timeout', '900', 'number', 'Default audit timeout in seconds', FALSE),
('email_notifications_enabled', 'true', 'boolean', 'Enable system email notifications', FALSE),
('new_user_registration', 'true', 'boolean', 'Allow new user registrations', TRUE),
('freemium_daily_limit', '1', 'number', 'Daily audit limit for freemium users', TRUE);
```

### **7.2 Admin Authentication & Middleware**

#### **Create `middleware/adminAuth.js`:**

```javascript
// File: audit-website/middleware/adminAuth.js
import { query } from "../config/database.js";

export const requireAdmin = (requiredPermissions = []) => {
  return async (req, res, next) => {
    if (!req.session.user || !req.session.user.is_admin) {
      return res.status(403).render("errors/403", {
        title: "Access Denied",
        message: "Administrator access required",
      });
    }

    // Check specific permissions if required
    if (requiredPermissions.length > 0) {
      const userPermissions = req.session.user.admin_permissions || [];
      const hasPermission = requiredPermissions.some(
        (perm) =>
          userPermissions.includes(perm) || userPermissions.includes("*")
      );

      if (!hasPermission) {
        return res.status(403).render("errors/403", {
          title: "Insufficient Permissions",
          message: "You do not have permission to access this resource",
        });
      }
    }

    next();
  };
};

export const logAdminActivity = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log successful admin actions
    if (req.session.user?.is_admin && res.statusCode < 400) {
      setTimeout(async () => {
        try {
          await query(
            `
            INSERT INTO admin_activity_log (
              admin_user_id, action, target_type, target_id, 
              details, ip_address, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
            [
              req.session.user.id,
              `${req.method} ${req.route?.path || req.path}`,
              req.params.type || "system",
              req.params.id || null,
              JSON.stringify({ body: req.body, query: req.query }),
              req.ip,
              req.headers["user-agent"],
            ]
          );
        } catch (error) {
          console.error("Failed to log admin activity:", error);
        }
      }, 0);
    }

    originalSend.call(this, data);
  };

  next();
};
```

### **7.3 Admin Services**

#### **Create `services/adminService.js`:**

```javascript
// File: audit-website/services/adminService.js
import { query } from "../config/database.js";

export class AdminService {
  // Dashboard Analytics
  async getDashboardStats() {
    const stats = await Promise.all([
      // Total users by tier
      query(`
        SELECT tier, COUNT(*) as count 
        FROM users 
        WHERE tier IS NOT NULL 
        GROUP BY tier
      `),

      // Revenue metrics
      query(`
        SELECT 
          SUM(amount) as total_revenue,
          COUNT(*) as total_subscriptions,
          AVG(amount) as avg_revenue
        FROM subscriptions 
        WHERE status = 'active'
      `),

      // Usage metrics
      query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as audits_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM audits 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),

      // System health
      query(`
        SELECT 
          COUNT(*) as total_audits,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_audits,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_audits,
          AVG(TIMESTAMPDIFF(SECOND, created_at, updated_at)) as avg_duration
        FROM audits 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `),
    ]);

    return {
      usersByTier: stats[0],
      revenue: stats[1][0] || {
        total_revenue: 0,
        total_subscriptions: 0,
        avg_revenue: 0,
      },
      dailyUsage: stats[2],
      systemHealth: stats[3][0] || {
        total_audits: 0,
        completed_audits: 0,
        failed_audits: 0,
        avg_duration: 0,
      },
    };
  }

  // User Management
  async getAllUsers(page = 1, limit = 50, filters = {}) {
    let whereClause = "WHERE 1=1";
    let params = [];

    if (filters.tier) {
      whereClause += " AND tier = ?";
      params.push(filters.tier);
    }

    if (filters.status) {
      whereClause += " AND subscription_status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      whereClause += " AND (email LIKE ? OR full_name LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const offset = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      query(
        `
        SELECT u.*, ul.audits_per_month, ul.max_internal_pages,
               s.status as subscription_status, s.amount as subscription_amount
        FROM users u
        LEFT JOIN user_limits ul ON u.id = ul.user_id
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [...params, limit, offset]
      ),

      query(
        `
        SELECT COUNT(*) as total 
        FROM users u 
        ${whereClause}
      `,
        params
      ),
    ]);

    return {
      users,
      totalCount: totalCount[0].total,
      totalPages: Math.ceil(totalCount[0].total / limit),
      currentPage: page,
    };
  }

  // Subscription Management
  async updateUserTier(userId, newTier, adminId) {
    await query(
      `
      UPDATE users SET tier = ?, updated_at = NOW() 
      WHERE id = ?
    `,
      [newTier, userId]
    );

    // Log the action
    await query(
      `
      INSERT INTO admin_activity_log (
        admin_user_id, action, target_type, target_id, details
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        adminId,
        "UPDATE_USER_TIER",
        "user",
        userId,
        JSON.stringify({ old_tier: null, new_tier: newTier }),
      ]
    );

    return true;
  }

  // System Settings
  async getSystemSettings() {
    const settings = await query(`
      SELECT setting_key, setting_value, setting_type, description, is_public 
      FROM system_settings 
      ORDER BY setting_key
    `);

    return settings.reduce((acc, setting) => {
      let value = setting.setting_value;

      // Parse value based on type
      switch (setting.setting_type) {
        case "boolean":
          value = value === "true";
          break;
        case "number":
          value = parseFloat(value);
          break;
        case "json":
          value = JSON.parse(value);
          break;
      }

      acc[setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        isPublic: setting.is_public,
      };

      return acc;
    }, {});
  }

  async updateSystemSetting(key, value, adminId) {
    await query(
      `
      UPDATE system_settings 
      SET setting_value = ?, updated_by = ?, updated_at = NOW() 
      WHERE setting_key = ?
    `,
      [value.toString(), adminId, key]
    );

    return true;
  }

  // Audit Management
  async getAuditStats(days = 30) {
    const stats = await query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_audits,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
        AVG(CASE WHEN status = 'completed' THEN 
          TIMESTAMPDIFF(SECOND, created_at, updated_at) 
        END) as avg_duration
      FROM audits 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      [days]
    );

    return stats;
  }

  // Revenue Analytics
  async getRevenueStats(period = "monthly") {
    let dateFormat = "%Y-%m";
    let interval = "MONTH";

    if (period === "daily") {
      dateFormat = "%Y-%m-%d";
      interval = "DAY";
    } else if (period === "yearly") {
      dateFormat = "%Y";
      interval = "YEAR";
    }

    const stats = await query(
      `
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as new_subscriptions,
        SUM(amount) as revenue,
        AVG(amount) as avg_revenue
      FROM subscriptions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 ${interval})
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY period DESC
    `,
      [dateFormat, dateFormat]
    );

    return stats;
  }
}

export const adminService = new AdminService();
```

### **7.4 Admin Routes**

#### **Create `routes/admin.js`:**

```javascript
// File: audit-website/routes/admin.js
import express from "express";
import { requireAdmin, logAdminActivity } from "../middleware/adminAuth.js";
import { adminService } from "../services/adminService.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(requireAdmin());
router.use(logAdminActivity);

// Admin Dashboard
router.get("/", async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      stats,
      layout: "admin",
    });
  } catch (error) {
    res.status(500).render("errors/500", { error: error.message });
  }
});

// User Management
router.get("/users", requireAdmin(["users"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = {
      tier: req.query.tier,
      status: req.query.status,
      search: req.query.search,
    };

    const userdata = await adminService.getAllUsers(page, 50, filters);

    res.render("admin/users", {
      title: "User Management",
      user: req.session.user,
      ...userdata,
      filters,
      layout: "admin",
    });
  } catch (error) {
    res.status(500).render("errors/500", { error: error.message });
  }
});

// Update User Tier
router.post("/users/:id/tier", requireAdmin(["users"]), async (req, res) => {
  try {
    const { tier } = req.body;
    await adminService.updateUserTier(req.params.id, tier, req.session.user.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
router.get("/analytics", requireAdmin(["analytics"]), async (req, res) => {
  try {
    const period = req.query.period || "monthly";
    const [auditStats, revenueStats] = await Promise.all([
      adminService.getAuditStats(30),
      adminService.getRevenueStats(period),
    ]);

    res.render("admin/analytics", {
      title: "Analytics",
      user: req.session.user,
      auditStats,
      revenueStats,
      period,
      layout: "admin",
    });
  } catch (error) {
    res.status(500).render("errors/500", { error: error.message });
  }
});

// System Settings
router.get("/settings", requireAdmin(["system"]), async (req, res) => {
  try {
    const settings = await adminService.getSystemSettings();

    res.render("admin/settings", {
      title: "System Settings",
      user: req.session.user,
      settings,
      layout: "admin",
    });
  } catch (error) {
    res.status(500).render("errors/500", { error: error.message });
  }
});

// Update System Setting
router.post("/settings/:key", requireAdmin(["system"]), async (req, res) => {
  try {
    const { value } = req.body;
    await adminService.updateSystemSetting(
      req.params.key,
      value,
      req.session.user.id
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity Log
router.get("/activity", requireAdmin(["system"]), async (req, res) => {
  try {
    const activities = await query(`
      SELECT al.*, u.email as admin_email 
      FROM admin_activity_log al
      LEFT JOIN users u ON al.admin_user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.render("admin/activity", {
      title: "Activity Log",
      user: req.session.user,
      activities,
      layout: "admin",
    });
  } catch (error) {
    res.status(500).render("errors/500", { error: error.message });
  }
});

export default router;
```

### **7.5 Admin Dashboard Views**

#### **Create `views/layouts/admin.ejs`:**

```html
<!-- File: audit-website/views/layouts/admin.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %> - SiteScope Admin</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.css"
      rel="stylesheet"
    />
    <style>
      .admin-sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 100;
        width: 240px;
        background: #2c3e50;
        transition: all 0.3s;
      }
      .admin-sidebar .nav-link {
        color: #bdc3c7;
        border-radius: 0;
        margin: 2px 0;
      }
      .admin-sidebar .nav-link:hover,
      .admin-sidebar .nav-link.active {
        color: #fff;
        background: #34495e;
      }
      .admin-content {
        margin-left: 240px;
        padding: 20px;
      }
      .stats-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
      }
      .chart-container {
        position: relative;
        height: 400px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <!-- Admin Sidebar -->
    <nav class="admin-sidebar">
      <div class="p-3">
        <h4 class="text-white mb-4">
          <i class="fas fa-tachometer-alt"></i> SiteScope Admin
        </h4>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a
              class="nav-link <%= title.includes('Dashboard') ? 'active' : '' %>"
              href="/admin"
            >
              <i class="fas fa-home"></i> Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link <%= title.includes('User') ? 'active' : '' %>"
              href="/admin/users"
            >
              <i class="fas fa-users"></i> Users
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link <%= title.includes('Analytics') ? 'active' : '' %>"
              href="/admin/analytics"
            >
              <i class="fas fa-chart-bar"></i> Analytics
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/admin/subscriptions">
              <i class="fas fa-credit-card"></i> Subscriptions
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/admin/audits">
              <i class="fas fa-search"></i> Audits
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link <%= title.includes('Settings') ? 'active' : '' %>"
              href="/admin/settings"
            >
              <i class="fas fa-cogs"></i> Settings
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link <%= title.includes('Activity') ? 'active' : '' %>"
              href="/admin/activity"
            >
              <i class="fas fa-history"></i> Activity Log
            </a>
          </li>
          <li class="nav-item mt-3">
            <a class="nav-link" href="/dashboard">
              <i class="fas fa-external-link-alt"></i> User Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/auth/logout">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="admin-content"><%- body %></div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      // Global admin utilities
      function updateUserTier(userId, newTier) {
        fetch(`/admin/users/${userId}/tier`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: newTier }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              location.reload();
            } else {
              alert("Error updating user tier");
            }
          });
      }

      function updateSystemSetting(key, value) {
        fetch(`/admin/settings/${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showNotification("Setting updated successfully", "success");
            } else {
              showNotification("Error updating setting", "error");
            }
          });
      }

      function showNotification(message, type) {
        // Simple notification system
        const alert = document.createElement("div");
        alert.className = `alert alert-${
          type === "success" ? "success" : "danger"
        } position-fixed`;
        alert.style.cssText = "top: 20px; right: 20px; z-index: 9999;";
        alert.textContent = message;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 3000);
      }
    </script>
  </body>
</html>
```

#### **Create `views/admin/dashboard.ejs`:**

```html
<!-- File: audit-website/views/admin/dashboard.ejs -->
<div class="d-flex justify-content-between align-items-center mb-4">
  <h1>Admin Dashboard</h1>
  <div class="d-flex gap-2">
    <span class="badge bg-success">System Online</span>
    <span class="badge bg-info">
      <i class="fas fa-clock"></i>
      <%= new Date().toLocaleString() %>
    </span>
  </div>
</div>

<!-- Key Metrics Row -->
<div class="row mb-4">
  <div class="col-md-3 mb-3">
    <div class="card stats-card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1">
            <h5>Total Users</h5>
            <h2>
              <%= stats.usersByTier.reduce((sum, tier) => sum + tier.count, 0)
              %>
            </h2>
          </div>
          <i class="fas fa-users fa-2x opacity-50"></i>
        </div>
      </div>
    </div>
  </div>

  <div class="col-md-3 mb-3">
    <div class="card stats-card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1">
            <h5>Monthly Revenue</h5>
            <h2>$<%= (stats.revenue.total_revenue || 0).toLocaleString() %></h2>
          </div>
          <i class="fas fa-dollar-sign fa-2x opacity-50"></i>
        </div>
      </div>
    </div>
  </div>

  <div class="col-md-3 mb-3">
    <div class="card stats-card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1">
            <h5>Audits Today</h5>
            <h2><%= stats.systemHealth.total_audits %></h2>
          </div>
          <i class="fas fa-search fa-2x opacity-50"></i>
        </div>
      </div>
    </div>
  </div>

  <div class="col-md-3 mb-3">
    <div class="card stats-card">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <div class="flex-grow-1">
            <h5>Success Rate</h5>
            <h2>
              <%= stats.systemHealth.total_audits > 0 ?
              Math.round((stats.systemHealth.completed_audits /
              stats.systemHealth.total_audits) * 100) : 0 %>%
            </h2>
          </div>
          <i class="fas fa-check-circle fa-2x opacity-50"></i>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Charts Row -->
<div class="row">
  <div class="col-md-6">
    <div class="card">
      <div class="card-header">
        <h5>Users by Tier</h5>
      </div>
      <div class="card-body">
        <canvas id="tierChart"></canvas>
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card">
      <div class="card-header">
        <h5>Daily Usage (Last 30 Days)</h5>
      </div>
      <div class="card-body">
        <canvas id="usageChart"></canvas>
      </div>
    </div>
  </div>
</div>

<script>
  // Tier Distribution Chart
  const tierCtx = document.getElementById('tierChart').getContext('2d');
  new Chart(tierCtx, {
      type: 'doughnut',
      data: {
          labels: [<%= stats.usersByTier.map(t => `'${t.tier}'`).join(',') %>],
          datasets: [{
              data: [<%= stats.usersByTier.map(t => t.count).join(',') %>],
              backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c']
          }]
      },
      options: {
          responsive: true,
          plugins: {
              legend: { position: 'bottom' }
          }
      }
  });

  // Usage Chart
  const usageCtx = document.getElementById('usageChart').getContext('2d');
  new Chart(usageCtx, {
      type: 'line',
      data: {
          labels: [<%= stats.dailyUsage.map(d => `'${d.date}'`).join(',') %>],
          datasets: [{
              label: 'Audits',
              data: [<%= stats.dailyUsage.map(d => d.audits_count).join(',') %>],
              borderColor: '#3498db',
              tension: 0.1
          }, {
              label: 'Unique Users',
              data: [<%= stats.dailyUsage.map(d => d.unique_users).join(',') %>],
              borderColor: '#2ecc71',
              tension: 0.1
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: { beginAtZero: true }
          }
      }
  });
</script>
```

### **7.6 Integration with Main App**

#### **Update `app.js` to include admin routes:**

```javascript
// Add to audit-website/app.js after other route imports
import adminRoutes from "./routes/admin.js";

// Add admin routes (after authentication middleware)
app.use("/admin", adminRoutes);
```

---

_This implementation plan transforms your audit tool from a simple service into a scalable SaaS platform with clear monetization strategy and growth potential. Each phase builds upon the previous one, ensuring a smooth transition while maintaining service quality._
