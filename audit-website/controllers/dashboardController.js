/**
 * Dashboard Controller
 * Handles user dashboard and related functionality
 */
import tierService from '../services/tierService.js';
import { Audit } from '../models/index.js';

/**
 * Display user dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const userId = req.session.user.id;

    // Get user tier information
    const userLimits = await tierService.getUserTierLimits(userId);

    // Get usage statistics
    const usageStats = await getUserUsageStats(userId);

    // Get recent audits
    const recentAudits = await getRecentAudits(userId);

    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user,
      userLimits,
      usageStats,
      recentAudits
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', {
      title: 'Dashboard Error',
      user: req.session.user || null,
      error: 'Unable to load dashboard. Please try again.'
    });
  }
};

/**
 * Get user usage statistics
 */
async function getUserUsageStats(userId) {
  try {
    // Try to get stats from tier service first
    if (tierService.getUserUsageStats) {
      return await tierService.getUserUsageStats(userId);
    }

    // Fallback to manual calculation
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Get audits for current month
    const audits = await Audit.getUserAudits(userId, {
      page: 1,
      limit: 1000,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });

    const currentMonthAudits = audits.audits.filter(audit => {
      return audit.created_at.startsWith(currentMonth);
    });

    const completedAudits = currentMonthAudits.filter(audit => audit.status === 'completed');

    // Calculate statistics
    const totalPagesScanned = completedAudits.reduce((sum, audit) => {
      return sum + (audit.pages_scanned || 0);
    }, 0);

    const totalScore = completedAudits.reduce((sum, audit) => {
      return sum + (audit.score || 0);
    }, 0);

    const averageScore = completedAudits.length > 0 ? Math.round(totalScore / completedAudits.length) : 0;

    // Estimate issues found (simple calculation)
    const issuesFound = completedAudits.reduce((sum, audit) => {
      const score = audit.score || 0;
      // Estimate issues based on score (100 - score = rough issue indicator)
      return sum + Math.max(0, Math.round((100 - score) / 10));
    }, 0);

    return {
      auditsThisMonth: currentMonthAudits.length,
      totalPagesScanned,
      averageScore,
      issuesFound,
      completedAudits: completedAudits.length,
      failedAudits: currentMonthAudits.filter(audit => audit.status === 'failed').length
    };

  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {
      auditsThisMonth: 0,
      totalPagesScanned: 0,
      averageScore: 0,
      issuesFound: 0,
      completedAudits: 0,
      failedAudits: 0
    };
  }
}

/**
 * Get recent audits for user
 */
async function getRecentAudits(userId) {
  try {
    const result = await Audit.getUserAudits(userId, {
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });

    return result.audits || [];

  } catch (error) {
    console.error('Error getting recent audits:', error);
    return [];
  }
}

/**
 * API endpoint to get dashboard data
 */
export const getDashboardData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    const [userLimits, usageStats, recentAudits] = await Promise.all([
      tierService.getUserTierLimits(userId),
      getUserUsageStats(userId),
      getRecentAudits(userId)
    ]);

    res.json({
      userLimits,
      usageStats,
      recentAudits: recentAudits.slice(0, 5) // Only return 5 most recent
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Unable to fetch dashboard data' });
  }
};

/**
 * Get user settings page
 */
export const getSettings = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const userId = req.session.user.id;
    const userLimits = await tierService.getUserTierLimits(userId);

    res.render('dashboard/settings', {
      title: 'Settings',
      user: req.session.user,
      userLimits
    });

  } catch (error) {
    console.error('Settings error:', error);
    res.render('error', {
      title: 'Settings Error',
      user: req.session.user || null,
      error: 'Unable to load settings. Please try again.'
    });
  }
};

export default {
  getDashboard,
  getDashboardData,
  getSettings
};
