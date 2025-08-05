import express from 'express';
import { 
  getHomePage, 
  getAboutPage, 
  getPricingPage, 
  getContactPage 
} from '../controllers/indexController.js';

const router = express.Router();

// Routes
router.get('/', getHomePage);
router.get('/about', getAboutPage);
router.get('/pricing', getPricingPage);
router.get('/contact', getContactPage);

export default router;
