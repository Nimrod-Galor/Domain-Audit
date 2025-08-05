import express from 'express';
import {
  getAuditForm,
  processAudit,
  getAuditProgress,
  getAuditResults,
  getSimpleReport,
  getFullReport,
  getAuditHistory,
  getHistoricalSimpleReport,
  getHistoricalFullReport,
  getUserAudits,
  validateAuditRequest,
  validateDomainParam
} from '../controllers/auditController.js';
import { requireAuth } from '../controllers/authController.js';

const router = express.Router();

// Main audit routes
router.get('/', getAuditForm);
router.post('/analyze', validateAuditRequest, processAudit);
router.get('/progress/:sessionId', getAuditProgress);
router.get('/results/:sessionId', getAuditResults);

// Report routes
router.get('/simple/:domain', validateDomainParam, getSimpleReport);
router.get('/full/:domain', validateDomainParam, getFullReport);

// Protected user audit routes
router.get('/my-audits', requireAuth, getUserAudits);

// Protected history routes
router.get('/history/:domain', requireAuth, validateDomainParam, getAuditHistory);
router.get('/history/:domain/:auditId/simple', requireAuth, validateDomainParam, getHistoricalSimpleReport);
router.get('/history/:domain/:auditId/full', requireAuth, validateDomainParam, getHistoricalFullReport);

export default router;
