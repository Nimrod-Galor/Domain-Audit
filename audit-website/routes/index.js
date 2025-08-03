const express = require('express');
const router = express.Router();

// Landing page
router.get('/', (req, res) => {
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
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About SiteScope',
    user: req.session.user || null
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us',
    user: req.session.user || null
  });
});

module.exports = router;
