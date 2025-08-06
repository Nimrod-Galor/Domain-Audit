import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getHomePage, 
  getAboutPage, 
  getPricingPage, 
  getContactPage 
} from '../controllers/indexController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Routes
router.get('/', getHomePage);
router.get('/about', getAboutPage);
router.get('/pricing', getPricingPage);
router.get('/contact', getContactPage);

// API Documentation route
router.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/api-docs.html'));
});

export default router;
