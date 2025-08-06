/**
 * Database Connection and Query Helpers
 * PostgreSQL connection using pg client
 */
import { Client, Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection pool for better performance
let pool;

/**
 * Initialize database connection pool
 */
export const initializeDatabase = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection cannot be established
    acquireTimeoutMillis: 60000, // Wait up to 60 seconds for a connection from the pool
    statement_timeout: 30000, // Cancel any query taking longer than 30 seconds
    query_timeout: 30000, // Same as statement_timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Add connection validation
    allowExitOnIdle: false, // Keep the pool alive even when no connections are active
    // Enhanced error recovery
    application_name: 'sitescope_audit_server',
    // Connection validation settings
    idleInTransactionSessionTimeout: 30000,
  });

  // Handle pool errors with better recovery
  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client:', err.message);
    
    // If it's a connection-related error, don't crash the app
    if (err.message.includes('Connection terminated') || 
        err.message.includes('ECONNRESET') ||
        err.message.includes('ENOTFOUND') ||
        err.message.includes('timeout') ||
        err.code === 'EBADF' ||
        err.message.includes('write EBADF')) {
      console.warn('⚠️ Connection issue detected, pool will create new connections as needed');
    }
    
    // Don't exit the process, just log the error
  });

  pool.on('connect', (client) => {
    console.log('✅ New client connected to database pool');
    
    // Handle client-specific errors
    client.on('error', (err) => {
      console.warn('⚠️ Client connection error:', err.message);
    });
  });

  pool.on('acquire', () => {
    // Connection acquired from pool
  });

  pool.on('release', () => {
    // Connection released back to pool
  });

  console.log('✅ Database pool initialized');
  return pool;
};

/**
 * Get database connection pool
 */
export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

/**
 * Execute a query with parameters and automatic retry on connection errors
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise<Object>} Query result
 */
export const query = async (text, params = [], maxRetries = 2) => {
  const start = Date.now();
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check if pool is available and not ended
      if (!pool || pool.ended) {
        console.warn('⚠️ Database pool is not available, reinitializing...');
        initializeDatabase();
      }
      
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries (over 200ms)
      if (duration > 200) {
        console.warn(`🐌 Slow query (${duration}ms):`, text.substring(0, 100));
      }
      
      // If we had to retry, log success
      if (attempt > 0) {
        console.log(`✅ Query succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if this is a retryable error
      const isRetryable = error.message.includes('Connection terminated') ||
                         error.message.includes('ECONNRESET') ||
                         error.message.includes('ENOTFOUND') ||
                         error.message.includes('timeout') ||
                         error.message.includes('pool') ||
                         error.message.includes('ended') ||
                         error.code === 'ECONNRESET' ||
                         error.code === 'ETIMEDOUT' ||
                         error.code === 'EBADF' ||
                         error.message.includes('write EBADF');
      
      if (isRetryable && attempt < maxRetries) {
        console.warn(`⚠️ Retryable error on attempt ${attempt + 1}/${maxRetries + 1}: ${error.message}`);
        
        // Try to reinitialize pool if it's a pool-related error
        if (error.message.includes('pool') || error.message.includes('ended')) {
          try {
            console.log('🔄 Reinitializing database pool...');
            initializeDatabase();
          } catch (initError) {
            console.warn('⚠️ Failed to reinitialize pool:', initError.message);
          }
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Non-retryable error or max retries reached
      console.error('❌ Database query error:', {
        query: text.substring(0, 100),
        params: params?.length ? '[' + params.length + ' params]' : '[]',
        error: error.message,
        code: error.code,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1
      });
      
      throw error;
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
};

/**
 * Execute a transaction with retry on connection errors
 * @param {Function} callback - Function to execute within transaction
 * @param {number} maxRetries - Maximum number of retries (default: 1)
 * @returns {Promise<any>} Transaction result
 */
export const transaction = async (callback, maxRetries = 1) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let client;
    
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      // If we had to retry, log success
      if (attempt > 0) {
        console.log(`✅ Transaction succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Always try to rollback if we have a client
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.warn('⚠️ Rollback error:', rollbackError.message);
        }
      }
      
      // Check if this is a retryable error
      const isRetryable = error.message.includes('Connection terminated') ||
                         error.message.includes('ECONNRESET') ||
                         error.message.includes('timeout') ||
                         error.code === 'ECONNRESET' ||
                         error.code === 'ETIMEDOUT';
      
      if (isRetryable && attempt < maxRetries) {
        console.warn(`⚠️ Retryable transaction error on attempt ${attempt + 1}/${maxRetries + 1}: ${error.message}`);
        
        // Wait before retrying
        const delay = 1000 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error('❌ Transaction error:', {
        error: error.message,
        code: error.code,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1
      });
      
      throw error;
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          console.warn('⚠️ Error releasing client:', releaseError.message);
        }
      }
    }
  }
  
  throw lastError;
};

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection successful');
    console.log('📅 Server time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Close all database connections
 */
export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    console.log('✅ Database connections closed');
  }
};

/**
 * Check if a table exists
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} True if table exists
 */
export const tableExists = async (tableName) => {
  try {
    const result = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
};

// Graceful shutdown - DISABLED to prevent premature pool closure
// process.on('SIGTERM', closeDatabase);
// process.on('SIGINT', closeDatabase);
