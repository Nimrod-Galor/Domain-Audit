import express from 'express';
import passport from 'passport';
import {
  getLoginPage,
  getRegisterPage,
  processLogin,
  processRegister,
  processLogout,
  getDashboard,
  requireAuth,
  requireGuest,
  requireEmailVerification,
  verifyEmail,
  resendVerification,
  getVerificationPage
} from '../controllers/authController.js';

const router = express.Router();

// Authentication routes
router.get('/login', requireGuest, getLoginPage);
router.get('/register', requireGuest, getRegisterPage);
router.post('/login', processLogin);
router.post('/register', processRegister);
router.post('/logout', processLogout);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/verification-pending', getVerificationPage);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    // Check if email is verified for Google users too
    if (!req.user.email_verified) {
      return res.redirect(`/auth/verification-pending?email=${encodeURIComponent(req.user.email)}`);
    }
    
    // Successful authentication, set session
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`.trim(),
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      plan: req.user.plan,
      emailVerified: req.user.email_verified,
      createdAt: req.user.created_at,
      profilePhoto: req.user.profile_photo
    };
    res.redirect('/auth/dashboard');
  }
);

// Protected routes
router.get('/dashboard', requireEmailVerification, getDashboard);

export default router;
