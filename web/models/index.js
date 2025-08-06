/**
 * Models Index
 * Central export point for all models
 */

export { User } from './User.js';
export { Audit } from './Audit.js';

// Re-export database utilities for convenience
export { 
  initializeDatabase, 
  testConnection,
  query,
  transaction 
} from './database.js';
