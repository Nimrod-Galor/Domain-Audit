/**
 * Billing Routes
 * Handles subscription management, checkout sessions, and billing operations
 */
import express from 'express';
import billingService from '../services/billingService.js';
import tierService from '../services/tierService.js';
import { User } from '../models/index.js';
import { auditLogger } from '../lib/logger.js';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

/**
 * Display billing dashboard
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user tier information
    const userLimits = await tierService.getUserTierLimits(userId);
    
    // Get current subscription
    let subscription = null;
    let upcomingInvoice = null;
    
    try {
      subscription = await billingService.getCurrentSubscription(userId);
      if (subscription) {
        upcomingInvoice = await billingService.getUpcomingInvoice(subscription.stripeSubscriptionId);
      }
    } catch (error) {
      console.error('❌ Error fetching subscription data:', error.message);
    }
    
    // Get usage statistics for current billing period
    const usageStats = await tierService.getUserUsageStats(userId);
    
    res.render('billing/dashboard', {
      title: 'Billing Dashboard',
      user: req.session.user,
      userLimits,
      subscription,
      upcomingInvoice,
      usageStats,
      currentTier: userLimits.tierName
    });
    
  } catch (error) {
    console.error('❌ Billing dashboard error:', error);
    res.render('error', {
      title: 'Error',
      user: req.session.user,
      error: 'Unable to load billing dashboard. Please try again.'
    });
  }
});

/**
 * Display upgrade plans page
 */
router.get('/upgrade', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userLimits = await tierService.getUserTierLimits(userId);
    
    // Get all available tier definitions
    const tiers = await tierService.getAllTiers();
    
    res.render('billing/upgrade', {
      title: 'Upgrade Your Plan',
      user: req.session.user,
      currentTier: userLimits.tierName,
      tiers: tiers.filter(tier => tier.name !== userLimits.tierName),
      userLimits
    });
    
  } catch (error) {
    console.error('❌ Upgrade page error:', error);
    res.render('error', {
      title: 'Error',
      user: req.session.user,
      error: 'Unable to load upgrade options. Please try again.'
    });
  }
});

/**
 * Create checkout session for subscription upgrade
 */
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { tierName } = req.body;
    
    if (!tierName) {
      return res.status(400).json({ error: 'Tier name is required' });
    }
    
    // Validate tier exists
    const tier = await tierService.getTierByName(tierName);
    if (!tier) {
      return res.status(400).json({ error: 'Invalid tier selected' });
    }
    
    // Get user's current tier
    const currentLimits = await tierService.getUserTierLimits(userId);
    
    // Prevent downgrade for now (can be enhanced later)
    if (tier.price <= currentLimits.price) {
      return res.status(400).json({ 
        error: 'Please contact support for downgrades or if you have questions about your current plan.' 
      });
    }
    
    // Create checkout session
    const session = await billingService.createCheckoutSession(userId, tierName, {
      successUrl: `${req.protocol}://${req.get('host')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${req.protocol}://${req.get('host')}/billing/upgrade`
    });
    
    // Log the upgrade attempt
    auditLogger.userAction('checkout_created', req.session.user, {
      targetTier: tierName,
      currentTier: currentLimits.tierName,
      sessionId: session.id
    });
    
    res.json({ checkoutUrl: session.url });
    
  } catch (error) {
    console.error('❌ Create checkout session error:', error);
    res.status(500).json({ 
      error: 'Unable to create checkout session. Please try again.' 
    });
  }
});

/**
 * Handle successful payment
 */
router.get('/success', requireAuth, async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.redirect('/billing/dashboard');
    }
    
    // Verify the session and get details
    const sessionDetails = await billingService.getCheckoutSession(session_id);
    
    if (!sessionDetails) {
      return res.render('billing/error', {
        title: 'Payment Error',
        user: req.session.user,
        error: 'Unable to verify payment session.'
      });
    }
    
    res.render('billing/success', {
      title: 'Payment Successful',
      user: req.session.user,
      sessionDetails
    });
    
  } catch (error) {
    console.error('❌ Payment success page error:', error);
    res.render('billing/error', {
      title: 'Error',
      user: req.session.user,
      error: 'An error occurred while processing your payment confirmation.'
    });
  }
});

/**
 * Handle subscription cancellation
 */
router.post('/cancel-subscription', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get current subscription
    const subscription = await billingService.getCurrentSubscription(userId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    // Cancel the subscription
    await billingService.cancelSubscription(subscription.stripeSubscriptionId);
    
    // Log the cancellation
    auditLogger.userAction('subscription_cancelled', req.session.user, {
      subscriptionId: subscription.stripeSubscriptionId,
      tierName: subscription.tierName
    });
    
    res.json({ success: true, message: 'Subscription cancelled successfully' });
    
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({ 
      error: 'Unable to cancel subscription. Please contact support.' 
    });
  }
});

/**
 * Download invoice
 */
router.get('/invoice/:invoiceId', requireAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.session.user.id;
    
    // Verify user owns this invoice
    const invoice = await billingService.getInvoiceById(invoiceId, userId);
    
    if (!invoice) {
      return res.status(404).render('error', {
        title: 'Invoice Not Found',
        user: req.session.user,
        error: 'The requested invoice was not found.'
      });
    }
    
    // Get invoice URL from Stripe
    const invoiceUrl = await billingService.getInvoiceUrl(invoice.stripeInvoiceId);
    
    if (!invoiceUrl) {
      return res.status(404).render('error', {
        title: 'Invoice Not Available',
        user: req.session.user,
        error: 'The invoice is not available for download at this time.'
      });
    }
    
    // Redirect to Stripe's hosted invoice
    res.redirect(invoiceUrl);
    
  } catch (error) {
    console.error('❌ Invoice download error:', error);
    res.status(500).render('error', {
      title: 'Error',
      user: req.session.user,
      error: 'Unable to download invoice. Please try again.'
    });
  }
});

/**
 * Stripe webhook endpoint
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return res.status(400).send('Missing signature');
    }
    
    // Handle the webhook
    await billingService.handleWebhook(req.body, signature);
    
    res.status(200).send('Webhook handled successfully');
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).send('Webhook error: ' + error.message);
  }
});

/**
 * Get billing history
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Get billing history
    const history = await billingService.getBillingHistory(userId, { page, limit });
    
    res.render('billing/history', {
      title: 'Billing History',
      user: req.session.user,
      history: history.invoices,
      pagination: history.pagination
    });
    
  } catch (error) {
    console.error('❌ Billing history error:', error);
    res.render('error', {
      title: 'Error',
      user: req.session.user,
      error: 'Unable to load billing history. Please try again.'
    });
  }
});

/**
 * Update payment method (redirect to Stripe Customer Portal)
 */
router.post('/update-payment-method', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Create customer portal session
    const portalSession = await billingService.createCustomerPortalSession(userId, {
      returnUrl: `${req.protocol}://${req.get('host')}/billing/dashboard`
    });
    
    res.json({ portalUrl: portalSession.url });
    
  } catch (error) {
    console.error('❌ Customer portal error:', error);
    res.status(500).json({ 
      error: 'Unable to access payment settings. Please try again.' 
    });
  }
});

/**
 * API endpoint to get user's tier information
 */
router.get('/api/tier-info', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userLimits = await tierService.getUserTierLimits(userId);
    const usageStats = await tierService.getUserUsageStats(userId);
    
    res.json({
      tierName: userLimits.tierName,
      limits: {
        auditsPerMonth: userLimits.auditsPerMonth,
        maxPagesPerAudit: userLimits.maxPagesPerAudit,
        maxExternalLinks: userLimits.maxExternalLinks,
        canAccessFullReports: userLimits.canAccessFullReports,
        canExportPDF: userLimits.canExportPDF,
        canScheduleAudits: userLimits.canScheduleAudits,
        hasAPIAccess: userLimits.hasAPIAccess
      },
      usage: usageStats
    });
    
  } catch (error) {
    console.error('❌ Tier info API error:', error);
    res.status(500).json({ error: 'Unable to fetch tier information' });
  }
});

export default router;
