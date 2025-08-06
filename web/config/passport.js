/**
 * Passport Configuration
 * Authentication strategies for social login integration
 */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';

/**
 * Serialize user for session storage
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

/**
 * Local Strategy (Email/Password)
 * This integrates with our existing User.verifyPassword method
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.verifyPassword(email, password);
    
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

/**
 * Google OAuth Strategy
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Check if user already exists
      let user = await User.findByEmail(email);
      
      if (user) {
        // Update last login
        await User.updateLastLogin(user.id);
        return done(null, user);
      }
      
      // Create new user from Google profile
      user = await User.createFromOAuth({
        email: email,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        provider: 'google',
        providerId: profile.id,
        profilePhoto: profile.photos[0]?.value,
        emailVerified: true // Google emails are verified
      });
      
      console.log('✅ New user created via Google OAuth:', email);
      return done(null, user);
      
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error);
    }
  }));
} else {
  console.log('⚠️ Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

/**
 * Initialize Passport middleware
 */
export function initializePassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  
  console.log('🔐 Passport authentication strategies initialized');
  
  // Log which strategies are available
  const strategies = ['local'];
  if (process.env.GOOGLE_CLIENT_ID) strategies.push('google');
  
  console.log('📋 Available auth strategies:', strategies.join(', '));
}

export default passport;
