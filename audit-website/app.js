import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import database initialization
import { initializeDatabase } from './models/database.js';

// Import Passport configuration
import { initializePassport } from './config/passport.js';

// Import logging system
import logger from './lib/logger.js';
import { requestLogger, errorLogger, notFoundLogger, rateLimitLogger } from './lib/middleware/logging.js';

// Import routes
import indexRouter from './routes/index.js';
import auditRouter from './routes/audit.js';
import authRouter from './routes/auth.js';
import notificationRouter from './routes/notifications.js';
import billingRouter from './routes/billing.js';
import dashboardRouter from './routes/dashboard.js';
import apiRouter from './routes/api/index.js';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Session configuration - using memory store for now (PostgreSQL session store can be added later)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport after session middleware
initializePassport(app);

// Rate limiting for audit endpoint
const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased limit for development/testing
  message: 'Too many audit requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    res.status(429).json({
      error: 'Too many audit requests, please try again later.'
    });
  }
});

// Routes
app.use('/', indexRouter);
app.use('/audit', auditLimiter, rateLimitLogger, auditRouter);
app.use('/auth', authRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api', apiRouter);  // API routes
app.use('/billing', billingRouter);
app.use('/dashboard', dashboardRouter);

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Unhandled application error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.session?.user || null,
    status: 500
  });
});

// 404 handler with logging
app.use(notFoundLogger);
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    user: req.session?.user || null
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      logger.info('SiteScope Audit Server started', {
        port: PORT,
        nodeEnv: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      console.log(`🚀 SiteScope Audit Server running on port ${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} in your browser`);
      console.log(`💾 Database: PostgreSQL (${process.env.DATABASE_URL ? 'Connected' : 'Waiting for connection string'})`);
    });
    
    return app; // Return app instance for testing
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Export app for testing
let appInstance;

async function getApp() {
  if (!appInstance) {
    appInstance = await startServer();
  }
  return appInstance;
}

export default getApp;

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
