/**
 * Index Controller
 * Handles homepage and general application routes
 */

/**
 * Display the landing page
 */
export const getHomePage = (req, res) => {
  res.render('index', {
    title: 'SiteScope - Website Audit Tool',
    user: req.session.user || null,
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
    user: req.session.user || null
  });
};

/**
 * Display the pricing page
 */
export const getPricingPage = (req, res) => {
  res.render('pricing', {
    title: 'Pricing - SiteScope',
    user: req.session.user || null,
    plans: [
      {
        name: 'Free Tier',
        price: 0,
        period: 'month',
        description: 'Perfect for getting started',
        features: [
          '3 website audits per month',
          'Basic performance metrics',
          'Simple reports',
          'Email support'
        ],
        limitations: [
          'Limited to 10 external links per audit',
          'Basic reporting only'
        ],
        ctaText: 'Get Started Free',
        ctaClass: 'btn-outline-primary',
        popular: false
      },
      {
        name: 'Professional',
        price: 15,
        period: 'month',
        description: 'For serious website optimization',
        features: [
          '50 website audits per month',
          'Unlimited external link checking',
          'Advanced performance metrics',
          'Detailed SEO analysis',
          'PDF report exports',
          'Priority email support',
          'Historical data tracking'
        ],
        limitations: [],
        ctaText: 'Start Professional',
        ctaClass: 'btn-primary',
        popular: true
      },
      {
        name: 'Business',
        price: 35,
        period: 'month',
        description: 'For agencies and large websites',
        features: [
          '200 website audits per month',
          'Unlimited external link checking',
          'Batch processing',
          'API access',
          'White-label reports',
          'Custom branding',
          'Priority phone support',
          'Team collaboration tools'
        ],
        limitations: [],
        ctaText: 'Contact Sales',
        ctaClass: 'btn-dark',
        popular: false
      }
    ]
  });
};

/**
 * Display the contact page
 */
export const getContactPage = (req, res) => {
  res.render('contact', {
    title: 'Contact - SiteScope',
    user: req.session.user || null
  });
};
