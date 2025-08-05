/**
 * Dashboard Routes
 * Handles user dashboard and settings routes
 */
import express from 'express';
import { getDashboard, getDashboardData, getSettings } from '../controllers/dashboardController.js';

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

export default router;
