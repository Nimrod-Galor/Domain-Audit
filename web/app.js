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
import healthRouter from './routes/health.js';
import adminRouter from './routes/admin.js';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Set environment variable to prevent server termination during audits
process.env.SKIP_HTML_REPORT = 'true';

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'test' ? 0 : 3000);

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

// Routes
app.use('/', indexRouter);
app.use('/audit', rateLimitLogger, auditRouter);
app.use('/auth', authRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api', apiRouter);  // API routes
app.use('/billing', billingRouter);
app.use('/dashboard', dashboardRouter);
app.use('/admin', adminRouter);  // Admin routes
app.use('/health', healthRouter);  // Health check routes

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
    
    // In test environment, don't start the server automatically
    if (process.env.NODE_ENV === 'test') {
      return app;
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info('SiteScope Audit Server started', {
        port: PORT,
        nodeEnv: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      console.log(`🚀 SiteScope Audit Server running on port ${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} in your browser`);
      console.log(`💾 Database: PostgreSQL (${process.env.DATABASE_URL ? 'Connected' : 'Waiting for connection string'})`);
      console.log(`✅ All systems initialized successfully - Server ready to accept requests!`);
    });
    
    app.server = server; // Store server reference
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
// Convert Windows path to file URL for comparison
const currentFileUrl = import.meta.url;
const mainFileUrl = new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href;

if (currentFileUrl === mainFileUrl) {
  startServer();
}
