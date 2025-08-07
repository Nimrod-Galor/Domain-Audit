/**
 * Index Controller
 * Handles homepage and general application routes
 */
import tierService from '../services/tierService.js';

/**
 * Display the landing page
 */
export const getHomePage = (req, res) => {
  res.render('index', {
    title: 'SiteScope - Website Audit Tool',
    user: req.session?.user || null,
    features: [
      {
        icon: 'fas fa-tachometer-alt',
        title: 'Performance Analysis',
        description: 'Get detailed performance metrics and optimization recommendations'
      },
      {
        icon: 'fas fa-search',
        title: 'SEO Audit',
        description: 'Comprehensive SEO analysis to improve your search rankings'
      },
      {
        icon: 'fas fa-mobile-alt',
        title: 'Mobile Optimization',
        description: 'Ensure your site works perfectly on all devices'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Security Check',
        description: 'Identify potential security vulnerabilities'
      }
    ],
    pricing: [
      {
        name: 'Free',
        price: '$0',
        features: ['3 audits/month', 'Basic reports', 'Email support'],
        highlight: false
      },
      {
        name: 'Professional',
        price: '$15',
        features: ['50 audits/month', 'Advanced reports', 'PDF exports', 'Priority support'],
        highlight: true
      },
      {
        name: 'Business',
        price: '$35',
        features: ['200 audits/month', 'Batch processing', 'API access', 'White-label reports'],
        highlight: false
      }
    ]
  });
};

/**
 * Display the about page
 */
export const getAboutPage = (req, res) => {
  res.render('about', {
    title: 'About - SiteScope',
    user: req.session?.user || null
  });
};

/**
 * Display the pricing page
 */
export const getPricingPage = async (req, res) => {
  try {
    // Get user's current tier if logged in
    let currentTier = null;
    if (req.session?.user?.id) {
      const userLimits = await tierService.getUserTierLimits(req.session.user.id);
      currentTier = userLimits.tierName;
    }

    res.render('pricing', {
      title: 'Pricing - Choose Your Plan',
      user: req.session?.user || null,
      currentTier: currentTier || 'none'
    });
  } catch (error) {
    console.error('Error loading pricing page:', error);
    res.render('pricing', {
      title: 'Pricing - Choose Your Plan',
      user: req.session?.user || null,
      currentTier: 'none'
    });
  }
};

/**
 * Display the contact page
 */
export const getContactPage = (req, res) => {
  res.render('contact', {
    title: 'Contact - SiteScope',
    user: req.session?.user || null
  });
};
