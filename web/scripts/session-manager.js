#!/usr/bin/env node

/**
 * CLI Tool for Session Management
 * This script provides utilities for managing user sessions in development
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the sessions database
const sessionsDbPath = path.join(__dirname, '..', 'data', 'sessions.db');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHelp() {
  console.log(colorize('\n🔧 Session Management CLI', 'cyan'));
  console.log(colorize('=============================', 'cyan'));
  console.log('\nAvailable commands:');
  console.log(colorize('  clear-all', 'green') + '    - Clear all sessions');
  console.log(colorize('  list', 'green') + '         - List all active sessions');
  console.log(colorize('  clear <id>', 'green') + '   - Clear specific session by ID');
  console.log(colorize('  help', 'green') + '         - Show this help message');
  console.log('\nExamples:');
  console.log('  npm run session clear-all');
  console.log('  npm run session list');
  console.log('  npm run session clear abc123\n');
}

function ensureDataDirectory() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(colorize('✓ Created data directory', 'green'));
  }
}

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(sessionsDbPath)) {
      console.log(colorize('ℹ No sessions database found. This is normal for a fresh installation.', 'yellow'));
      resolve(null);
      return;
    }

    const db = new sqlite3.Database(sessionsDbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

async function listSessions() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      console.log(colorize('No sessions found.', 'yellow'));
      return;
    }

    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM sessions', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        if (rows.length === 0) {
          console.log(colorize('No active sessions found.', 'yellow'));
        } else {
          console.log(colorize(`\n📋 Found ${rows.length} active session(s):`, 'blue'));
          console.log(colorize('================================', 'blue'));
          
          rows.forEach((row, index) => {
            const sessionData = JSON.parse(row.sess);
            const hasUser = sessionData.user ? 'Logged in' : 'Anonymous';
            const auditCount = sessionData.audits || 0;
            
            console.log(`\n${colorize(`Session ${index + 1}:`, 'cyan')}`);
            console.log(`  ID: ${colorize(row.sid, 'white')}`);
            console.log(`  Status: ${colorize(hasUser, hasUser === 'Logged in' ? 'green' : 'yellow')}`);
            console.log(`  Audits: ${colorize(auditCount, 'white')}`);
            console.log(`  Expires: ${colorize(new Date(row.expired).toLocaleString(), 'white')}`);
            
            if (sessionData.user) {
              console.log(`  User: ${colorize(sessionData.user.email, 'green')}`);
            }
          });
        }
        
        db.close();
        resolve();
      });
    });
  } catch (error) {
    console.error(colorize('Error listing sessions:', 'red'), error.message);
  }
}

async function clearAllSessions() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      console.log(colorize('No sessions to clear.', 'yellow'));
      return;
    }

    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sessions', function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(colorize(`✓ Cleared ${this.changes} session(s)`, 'green'));
        db.close();
        resolve();
      });
    });
  } catch (error) {
    console.error(colorize('Error clearing sessions:', 'red'), error.message);
  }
}

async function clearSpecificSession(sessionId) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      console.log(colorize('No sessions found.', 'yellow'));
      return;
    }

    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sessions WHERE sid = ?', [sessionId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          console.log(colorize(`Session ${sessionId} not found.`, 'yellow'));
        } else {
          console.log(colorize(`✓ Cleared session ${sessionId}`, 'green'));
        }
        
        db.close();
        resolve();
      });
    });
  } catch (error) {
    console.error(colorize('Error clearing session:', 'red'), error.message);
  }
}

// Main CLI logic
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  ensureDataDirectory();

  switch (command) {
    case 'clear-all':
      console.log(colorize('🗑️  Clearing all sessions...', 'yellow'));
      await clearAllSessions();
      break;
      
    case 'list':
      await listSessions();
      break;
      
    case 'clear':
      const sessionId = args[1];
      if (!sessionId) {
        console.log(colorize('Error: Please provide a session ID', 'red'));
        console.log('Usage: npm run session clear <session-id>');
        process.exit(1);
      }
      console.log(colorize(`🗑️  Clearing session ${sessionId}...`, 'yellow'));
      await clearSpecificSession(sessionId);
      break;
      
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
      
    default:
      if (!command) {
        printHelp();
      } else {
        console.log(colorize(`Unknown command: ${command}`, 'red'));
        printHelp();
        process.exit(1);
      }
  }
}

// Run the CLI
main().catch(error => {
  console.error(colorize('CLI Error:', 'red'), error.message);
  process.exit(1);
});
