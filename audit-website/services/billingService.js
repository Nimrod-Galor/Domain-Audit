/**
 * Billing Service
 * Handles Stripe integration for subscription management and payments
 */

import Stripe from 'stripe';
import { query } from '../models/database.js';
import { tierService } from './tierService.js';

// Initialize Stripe (will be null in development if no secret key)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not found. Billing features will be disabled.');
}

export class BillingService {
  
  /**
   * Check if Stripe is configured
   * @returns {boolean} True if Stripe is available
   */
  isStripeConfigured() {
    return stripe !== null;
  }

  /**
   * Create Stripe customer
   * @param {Object} user - User object with id, email, first_name, last_name
   * @returns {Promise<Object|null>} Stripe customer object or null
   */
  async createStripeCustomer(user) {
    if (!this.isStripeConfigured()) {
      console.warn('⚠️ Stripe not configured, skipping customer creation');
      return null;
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        metadata: {
          userId: user.id.toString(),
          system: 'sitescope-audit'
        }
      });

      // Update user with Stripe customer ID
      await query(`
        UPDATE users SET stripe_customer_id = $1 WHERE id = $2
      `, [customer.id, user.id]);

      console.log(`✅ Stripe customer created: ${customer.id} for user ${user.email}`);
      return customer;
    } catch (error) {
      console.error('❌ Error creating Stripe customer:', error.message);
      return null;
    }
  }

  /**
   * Create checkout session for subscription
   * @param {number} userId - User ID
   * @param {string} tier - Tier name (professional, enterprise)
   * @param {string} billingCycle - Billing cycle (monthly, annual)
   * @returns {Promise<Object|null>} Checkout session or null
   */
  async createCheckoutSession(userId, tier, billingCycle = 'monthly') {
    if (!this.isStripeConfigured()) {
      console.warn('⚠️ Stripe not configured, cannot create checkout session');
      return null;
    }

    try {
      // Get user
      const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      const user = userResult.rows[0];

      // Ensure user has Stripe customer ID
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await this.createStripeCustomer(user);
        customerId = customer?.id;
      }

      if (!customerId) {
        throw new Error('Failed to create Stripe customer');
      }

      // Get price ID from environment
      const priceId = this.getPriceId(tier, billingCycle);
      if (!priceId) {
        throw new Error(`Price ID not configured for ${tier} ${billingCycle}`);
      }

      // Determine trial period
      const trialPeriodDays = tier === 'professional' ? 14 : 7;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: trialPeriodDays,
          metadata: {
            userId: userId.toString(),
            tier: tier,
            billing_cycle: billingCycle
          }
        },
        success_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/pricing?cancelled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required'
      });

      console.log(`✅ Checkout session created: ${session.id} for user ${userId}`);
      return session;
    } catch (error) {
      console.error('❌ Error creating checkout session:', error.message);
      return null;
    }
  }

  /**
   * Create billing portal session
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object|null>} Portal session or null
   */
  async createPortalSession(customerId) {
    if (!this.isStripeConfigured()) {
      console.warn('⚠️ Stripe not configured, cannot create portal session');
      return null;
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/dashboard/billing`,
      });

      return session;
    } catch (error) {
      console.error('❌ Error creating portal session:', error.message);
      return null;
    }
  }

  /**
   * Handle Stripe webhooks
   * @param {Object} event - Stripe webhook event
   * @returns {Promise<boolean>} Success status
   */
  async handleWebhook(event) {
    try {
      console.log(`📨 Processing webhook: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        
        default:
          console.log(`🔄 Unhandled webhook type: ${event.type}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error handling webhook ${event.type}:`, error.message);
      return false;
    }
  }

  /**
   * Handle checkout session completed
   * @param {Object} session - Checkout session object
   */
  async handleCheckoutCompleted(session) {
    try {
      const userId = parseInt(session.metadata?.userId);
      if (!userId) {
        console.warn('⚠️ No userId in checkout session metadata');
        return;
      }

      console.log(`💳 Checkout completed for user ${userId}`);

      // Get the subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await this.handleSubscriptionUpdated(subscription);

    } catch (error) {
      console.error('❌ Error handling checkout completed:', error.message);
    }
  }

  /**
   * Handle subscription created/updated
   * @param {Object} subscription - Stripe subscription object
   */
  async handleSubscriptionUpdated(subscription) {
    try {
      const userId = parseInt(subscription.metadata?.userId);
      if (!userId) {
        console.warn('⚠️ No userId in subscription metadata');
        return;
      }

      const tier = subscription.metadata?.tier || 'professional';
      const billingCycle = subscription.metadata?.billing_cycle || 'monthly';

      // Update user tier and subscription info
      await query(`
        UPDATE users SET 
          tier = $1,
          subscription_status = $2,
          stripe_subscription_id = $3,
          subscription_start_date = $4,
          subscription_end_date = $5,
          trial_start_date = $6,
          trial_end_date = $7,
          billing_cycle = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        tier,
        subscription.status,
        subscription.id,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        billingCycle,
        userId
      ]);

      // Create/update subscription record
      await query(`
        INSERT INTO subscriptions (
          user_id, tier, status, billing_cycle, amount, currency,
          stripe_subscription_id, current_period_start, current_period_end,
          trial_start, trial_end, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (stripe_subscription_id) DO UPDATE SET
          status = EXCLUDED.status,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          trial_start = EXCLUDED.trial_start,
          trial_end = EXCLUDED.trial_end,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId,
        tier,
        subscription.status,
        billingCycle,
        subscription.items.data[0].price.unit_amount / 100,
        subscription.currency.toUpperCase(),
        subscription.id,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        JSON.stringify(subscription.metadata)
      ]);

      // Update user limits based on new tier
      await tierService.updateUserLimits(userId, tier);

      // Generate API key for professional/enterprise users
      if (['professional', 'enterprise'].includes(tier)) {
        const user = await query('SELECT api_key FROM users WHERE id = $1', [userId]);
        if (!user.rows[0]?.api_key) {
          await tierService.generateApiKey(userId);
        }
      }

      console.log(`✅ Subscription updated for user ${userId}: ${tier} (${subscription.status})`);
    } catch (error) {
      console.error('❌ Error handling subscription updated:', error.message);
    }
  }

  /**
   * Handle subscription deleted/cancelled
   * @param {Object} subscription - Stripe subscription object
   */
  async handleSubscriptionDeleted(subscription) {
    try {
      const userId = parseInt(subscription.metadata?.userId);
      if (!userId) {
        console.warn('⚠️ No userId in subscription metadata');
        return;
      }

      // Downgrade user to starter tier
      await query(`
        UPDATE users SET 
          tier = 'starter',
          subscription_status = 'cancelled',
          subscription_end_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);

      // Update subscription record
      await query(`
        UPDATE subscriptions SET 
          status = 'cancelled',
          canceled_at = CURRENT_TIMESTAMP,
          ended_at = CURRENT_TIMESTAMP
        WHERE stripe_subscription_id = $1
      `, [subscription.id]);

      // Update user limits to starter tier
      await tierService.updateUserLimits(userId, 'starter');

      // Remove API key
      await query('UPDATE users SET api_key = NULL WHERE id = $1', [userId]);

      console.log(`✅ Subscription cancelled for user ${userId}, downgraded to starter`);
    } catch (error) {
      console.error('❌ Error handling subscription deleted:', error.message);
    }
  }

  /**
   * Handle successful payment
   * @param {Object} invoice - Stripe invoice object
   */
  async handlePaymentSucceeded(invoice) {
    try {
      // Create invoice record
      await query(`
        INSERT INTO invoices (
          stripe_invoice_id, amount_due, amount_paid, currency, status,
          invoice_date, due_date, paid_date, invoice_pdf_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (stripe_invoice_id) DO UPDATE SET
          amount_paid = EXCLUDED.amount_paid,
          status = EXCLUDED.status,
          paid_date = EXCLUDED.paid_date
      `, [
        invoice.id,
        invoice.amount_due / 100,
        invoice.amount_paid / 100,
        invoice.currency.toUpperCase(),
        invoice.status,
        new Date(invoice.created * 1000),
        new Date(invoice.due_date * 1000),
        new Date(),
        invoice.invoice_pdf
      ]);

      // Reset failed payment count
      if (invoice.customer) {
        await query(`
          UPDATE users SET failed_payment_count = 0 
          WHERE stripe_customer_id = $1
        `, [invoice.customer]);
      }

      console.log(`💰 Payment succeeded: ${invoice.id}`);
    } catch (error) {
      console.error('❌ Error handling payment succeeded:', error.message);
    }
  }

  /**
   * Handle failed payment
   * @param {Object} invoice - Stripe invoice object
   */
  async handlePaymentFailed(invoice) {
    try {
      // Update invoice record
      await query(`
        INSERT INTO invoices (
          stripe_invoice_id, amount_due, amount_paid, currency, status,
          invoice_date, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (stripe_invoice_id) DO UPDATE SET
          status = EXCLUDED.status
      `, [
        invoice.id,
        invoice.amount_due / 100,
        invoice.amount_paid / 100,
        invoice.currency.toUpperCase(),
        invoice.status,
        new Date(invoice.created * 1000),
        new Date(invoice.due_date * 1000)
      ]);

      // Increment failed payment count
      if (invoice.customer) {
        await query(`
          UPDATE users SET 
            failed_payment_count = failed_payment_count + 1,
            subscription_status = 'past_due'
          WHERE stripe_customer_id = $1
        `, [invoice.customer]);
      }

      console.log(`💸 Payment failed: ${invoice.id}`);
    } catch (error) {
      console.error('❌ Error handling payment failed:', error.message);
    }
  }

  /**
   * Get price ID for tier and billing cycle
   * @param {string} tier - Tier name
   * @param {string} billingCycle - Billing cycle (monthly, annual)
   * @returns {string|null} Stripe price ID
   */
  getPriceId(tier, billingCycle) {
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

    return priceMap[tier]?.[billingCycle] || null;
  }

  /**
   * Get user's subscription info
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Subscription info or null
   */
  async getUserSubscription(userId) {
    try {
      const result = await query(`
        SELECT s.*, u.stripe_customer_id, u.subscription_status 
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = $1 AND s.status IN ('active', 'trialing', 'past_due')
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [userId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting user subscription:', error.message);
      return null;
    }
  }

  /**
   * Cancel subscription
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async cancelSubscription(userId) {
    if (!this.isStripeConfigured()) {
      console.warn('⚠️ Stripe not configured, cannot cancel subscription');
      return false;
    }

    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        console.warn(`⚠️ No active subscription found for user ${userId}`);
        return false;
      }

      // Cancel at period end (don't cancel immediately)
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      });

      console.log(`✅ Subscription marked for cancellation: ${subscription.stripe_subscription_id}`);
      return true;
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService;
