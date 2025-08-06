import { query } from './models/database.js';

async function checkUsers() {
  try {
    const result = await query('SELECT id, email, password_hash FROM users ORDER BY id');
    console.log('=== USERS IN DATABASE ===');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
