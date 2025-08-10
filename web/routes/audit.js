import express from 'express';
import {
  getAuditForm,
  processAudit,
  getAuditProgress,
  getAuditStatus,
  getAuditResults,
  getSimpleReport,
  getFullReport,
  getAuditHistory,
  getHistoricalSimpleReport,
  getHistoricalFullReport,
  getUserAudits,
  validateAuditRequest,
  validateDomainParam,
  downloadPDFReport,
  downloadHistoricalPDFReport
} from '../controllers/auditController.js';
import { requireEmailVerification } from '../controllers/authController.js';

const router = express.Router();

// Import rate limiter from app.js context (we'll get it from a shared module)
// For now, we'll create a simple rate limiter specifically for audit creation
import rateLimit from 'express-rate-limit';

const auditCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit audit creation requests
  message: 'Too many audit requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many audit requests, please try again later.'
    });
  }
});

// Main audit routes
router.get('/', getAuditForm);
router.post('/analyze', auditCreationLimiter, validateAuditRequest, processAudit); // Rate limit only audit creation
router.get('/progress/:sessionId', getAuditProgress);
router.get('/status/:sessionId', getAuditStatus);
router.get('/results/:sessionId', getAuditResults);

// Report routes
router.get('/simple/:domain', validateDomainParam, getSimpleReport);
router.get('/full/:domain', validateDomainParam, getFullReport);

// PDF download routes
router.get('/pdf/:domain', validateDomainParam, downloadPDFReport);

// Protected user audit routes
router.get('/my-audits', requireEmailVerification, getUserAudits);

// Protected history routes
router.get('/history/:domain', requireEmailVerification, validateDomainParam, getAuditHistory);
router.get('/history/:domain/:auditId/simple', requireEmailVerification, validateDomainParam, getHistoricalSimpleReport);
router.get('/history/:domain/:auditId/full', requireEmailVerification, validateDomainParam, getHistoricalFullReport);
router.get('/history/:domain/:auditId/pdf', requireEmailVerification, validateDomainParam, downloadHistoricalPDFReport);

export default router;
