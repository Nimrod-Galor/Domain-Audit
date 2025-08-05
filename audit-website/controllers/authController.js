/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */
import { User, Audit } from '../models/index.js';

/**
 * Display login page
 */
export const getLoginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/auth/dashboard');
  }
  
  res.render('auth/login', {
    title: 'Login',
    user: null
  });
};

/**
 * Display registration page
 */
export const getRegisterPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/auth/dashboard');
  }
  
  res.render('auth/register', {
    title: 'Sign Up',
    user: null,
    error: null
  });
};

/**
 * Process user login
 */
export const processLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Login',
        user: null,
        error: 'Email and password are required'
      });
    }
    
    // Verify user credentials
    const user = await User.verifyPassword(email, password);
    
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        user: null,
        error: 'Invalid email or password'
      });
    }
    
    // Update last login timestamp
    await User.updateLastLogin(user.id);
    
    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      plan: user.plan,
      emailVerified: user.email_verified,
      createdAt: user.created_at
    };
    
    console.log('✅ User logged in:', email);
    
    // Create verification notification for unverified users
    if (!user.email_verified) {
      try {
        const { createNotification } = await import('./notificationController.js');
        
        // Check if verification notification already exists
        const { Notification } = await import('../models/Notification.js');
        const existingNotifications = await Notification.getUnreadByUserId(user.id);
        const hasVerificationNotification = existingNotifications.some(
          notification => notification.title.includes('Email Verification Required')
        );
        
        if (!hasVerificationNotification) {
          await createNotification(
            user.id,
            'alert',
            'Email Verification Required',
            `Please verify your email address (${email}) to unlock all features and ensure account security. Check your inbox for the verification link.`
          );
          console.log(`🔔 Email verification notification created for logged-in user: ${email}`);
        }
      } catch (notificationError) {
        console.error('❌ Error creating verification notification:', notificationError.message);
        // Don't fail login if notification fails
      }
    }
    
    return res.redirect('/auth/dashboard');
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      user: null,
      error: 'An error occurred. Please try again.'
    });
  }
};

/**
 * Process user registration
 */
export const processRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'All fields are required'
      });
    }
    
    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'Passwords do not match'
      });
    }
    
    if (password.length < 8) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'Password must be at least 8 characters'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'Please enter a valid email address'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'An account with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      plan: 'free'
    });
    
    // Don't auto-login for email/password users - they need to verify email first
    console.log('✅ User registered:', email);
    res.redirect(`/auth/verification-pending?email=${encodeURIComponent(email)}`);
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.message.includes('email already exists')) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: error.message
      });
    }
    
    res.render('auth/register', {
      title: 'Sign Up',
      user: null,
      error: 'An error occurred. Please try again.'
    });
  }
};

/**
 * Process user logout
 */
export const processLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/auth/dashboard');
    }
    res.redirect('/');
  });
};

/**
 * Display user dashboard
 */
export const getDashboard = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  
  try {
    const userId = req.session.user.id;
    
    // Get user's recent audits
    const auditResults = await Audit.getUserAudits(userId, {
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
    
    // Get user statistics
    const userStats = await User.getStats(userId);
    const auditStats = await Audit.getStats(userId, 30);
    
    // Format audits for display
    const formattedAudits = auditResults.audits.map(audit => ({
      id: audit.id,
      url: `https://${audit.domain}`,
      domain: audit.domain,
      date: audit.created_at,
      score: audit.score,
      status: audit.status,
      type: audit.audit_type,
      completedAt: audit.completed_at
    }));
    
    res.render('auth/dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      audits: formattedAudits,
      pagination: auditResults.pagination,
      stats: {
        totalAudits: auditStats.totalAudits,
        completedAudits: auditStats.completedAudits,
        averageScore: auditStats.averageScore,
        thisMonth: auditStats.totalAudits // Using total from last 30 days
      }
    });
    
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    
    // Fall back to empty data if database fails
    res.render('auth/dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      audits: [],
      pagination: { page: 1, totalPages: 0, hasNext: false, hasPrev: false },
      stats: {
        totalAudits: 0,
        completedAudits: 0,
        averageScore: 0,
        thisMonth: 0
      },
      error: 'Unable to load dashboard data. Please try again later.'
    });
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.render('auth/verification-result', {
        title: 'Email Verification',
        user: null,
        success: false,
        message: 'Invalid verification link'
      });
    }

    // Verify the token
    const user = await User.verifyEmailToken(token);
    
    if (!user) {
      return res.render('auth/verification-result', {
        title: 'Email Verification',
        user: null,
        success: false,
        message: 'Invalid or expired verification link. Please request a new verification email.'
      });
    }

    // Send welcome email
    try {
      const emailService = await import('../services/emailService.js');
      await emailService.default.sendWelcomeEmail(user.email, user.first_name);
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError.message);
      // Don't fail verification if welcome email fails
    }

    // Clean up email verification notifications
    try {
      const userNotifications = await Notification.getUnreadByUserId(user.id);
      const verificationNotifications = userNotifications.filter(
        notification => notification.title.includes('Email Verification Required')
      );
      
      // Mark verification notifications as read since email is now verified
      for (const notification of verificationNotifications) {
        await Notification.markAsRead(notification.id);
      }
      
      if (verificationNotifications.length > 0) {
        console.log(`🔔 Marked ${verificationNotifications.length} email verification notifications as read for user: ${user.email}`);
      }
    } catch (notificationError) {
      console.error('❌ Error cleaning up verification notifications:', notificationError.message);
      // Don't fail verification if notification cleanup fails
    }

    // Update session if user is logged in
    if (req.session.user && req.session.user.id === user.id) {
      req.session.user.emailVerified = true;
    }

    res.render('auth/verification-result', {
      title: 'Email Verification',
      user: req.session.user,
      success: true,
      message: 'Your email has been verified successfully! You now have full access to all features.',
      userInfo: user
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.render('auth/verification-result', {
      title: 'Email Verification',
      user: req.session.user,
      success: false,
      message: 'An error occurred during verification. Please try again.'
    });
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req, res) => {
  try {
    console.log('🔄 Resend verification request received');
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ No email provided');
      return res.json({ success: false, message: 'Email is required' });
    }

    console.log(`🔄 Attempting to resend verification for: ${email}`);

    // Find user first to give better error messages
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log('❌ User not found');
      return res.json({ 
        success: false, 
        message: 'No account found with this email address' 
      });
    }

    if (user.email_verified) {
      console.log('❌ Email already verified');
      return res.json({ 
        success: false, 
        message: 'This email address is already verified' 
      });
    }

    console.log('✅ User found and unverified, generating token...');

    // Generate new token and resend email
    const token = await User.generateVerificationToken(user.id);
    
    if (!token) {
      console.log('❌ Failed to generate token');
      return res.json({ 
        success: false, 
        message: 'Failed to generate verification token. Please try again.' 
      });
    }

    console.log('✅ Token generated, sending email...');

    // Send verification email
    const emailService = await import('../services/emailService.js');
    const emailSent = await emailService.default.sendVerificationEmail(
      email, 
      user.first_name, 
      token
    );

    if (emailSent) {
      console.log('✅ Verification email sent successfully');
      res.json({ 
        success: true, 
        message: 'Verification email sent! Please check your inbox.' 
      });
    } else {
      console.log('❌ Failed to send email');
      res.json({ 
        success: false, 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.json({ 
      success: false, 
      message: `Error: ${error.message}` 
    });
  }
};

/**
 * Display verification pending page
 */
export const getVerificationPage = (req, res) => {
  const email = req.query.email || (req.session.user ? req.session.user.email : '');
  
  res.render('auth/verification-pending', {
    title: 'Email Verification Required',
    user: req.session.user,
    email: email
  });
};

/**
 * Middleware to check if user is authenticated (redirects to login for web requests)
 */
export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  req.user = req.session.user;
  next();
};

/**
 * Middleware to protect API routes (returns JSON error instead of redirect)
 */
export const requireAuthAPI = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      success: false 
    });
  }
  req.user = req.session.user;
  next();
};

/**
 * Middleware to check if user is not authenticated (for login/register pages)
 */
export const requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/auth/dashboard');
  }
  next();
};
