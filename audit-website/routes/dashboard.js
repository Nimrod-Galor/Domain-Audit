/**
 * Dashboard Routes
 * Handles user dashboard and settings routes
 */
import express from 'express';
import { getUpgradeRequired, getDashboard, getDashboardData, getSettings, getApiPage, generateApiKey, regenerateApiKey, revokeApiKey } from '../controllers/dashboardController.js';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Dashboard routes
router.get('/', requireAuth, getDashboard);
router.get('/data', requireAuth, getDashboardData);
router.get('/settings', requireAuth, getSettings);
router.get('/upgrade-required', getUpgradeRequired); // No auth required for upgrade page

// API management routes
router.get('/api', requireAuth, getApiPage);
router.post('/api/generate', requireAuth, generateApiKey);
router.post('/api/regenerate', requireAuth, regenerateApiKey);
router.post('/api/revoke', requireAuth, revokeApiKey);

export default router;
