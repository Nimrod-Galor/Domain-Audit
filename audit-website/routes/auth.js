const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
// const { createUser, findUserByEmail } = require('../models/database');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  res.render('auth/login', {
    title: 'Login',
    user: null,
    error: null
  });
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  res.render('auth/register', {
    title: 'Sign Up',
    user: null,
    error: null
  });
});

// Process login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Implement user authentication
    // const user = await findUserByEmail(email);
    // if (!user || !bcrypt.compareSync(password, user.password)) {
    //   return res.render('auth/login', {
    //     title: 'Login',
    //     user: null,
    //     error: 'Invalid email or password'
    //   });
    // }
    
    // Mock authentication for now
    if (email === 'demo@example.com' && password === 'demo123') {
      req.session.user = {
        id: 1,
        email: email,
        name: 'Demo User',
        plan: 'free'
      };
      return res.redirect('/dashboard');
    }
    
    res.render('auth/login', {
      title: 'Login',
      user: null,
      error: 'Invalid email or password'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      user: null,
      error: 'An error occurred. Please try again.'
    });
  }
});

// Process registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'All fields are required'
      });
    }
    
    if (password.length < 6) {
      return res.render('auth/register', {
        title: 'Sign Up',
        user: null,
        error: 'Password must be at least 6 characters'
      });
    }
    
    // TODO: Implement user creation
    // const hashedPassword = bcrypt.hashSync(password, 10);
    // const user = await createUser({ name, email, password: hashedPassword });
    
    // Mock registration for now
    req.session.user = {
      id: Date.now(),
      email: email,
      name: name,
      plan: 'free'
    };
    
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Sign Up',
      user: null,
      error: 'An error occurred. Please try again.'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// Dashboard (protected route)
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  
  // TODO: Fetch user's audit history
  const mockAudits = [
    {
      id: 1,
      url: 'https://example.com',
      date: new Date('2025-08-01'),
      score: 85
    },
    {
      id: 2,
      url: 'https://test.com',
      date: new Date('2025-08-02'),
      score: 92
    }
  ];
  
  res.render('auth/dashboard', {
    title: 'Dashboard',
    user: req.session.user,
    audits: mockAudits
  });
});

module.exports = router;
