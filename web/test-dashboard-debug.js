/**
 * Debug script to test dashboard rendering
 */
import express from 'express';
import { getDashboard } from './controllers/dashboardController.js';

const app = express();

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Test route
app.get('/test', async (req, res) => {
  // Simulate logged-in user
  req.session = {
    user: { id: 2, email: 'galor_nimrod@hotmail.com' }
  };
  
  try {
    await getDashboard(req, res);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Start server
app.listen(3001, () => {
  console.log('Debug server running on http://localhost:3001/test');
});
