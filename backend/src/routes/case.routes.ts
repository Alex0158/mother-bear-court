import { Router } from 'express';
import { caseController } from '../controllers/case.controller';
import { evidenceController } from '../controllers/evidence.controller';
import { authenticate, optionalAuthenticate, validateSession } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { quickCaseSchema, createCaseSchema, uuidParamSchema } from '../utils/validation';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/v1/cases/quick
 * @desc    創建案件（快速體驗模式）
 * @access  Public (可選認證)
 */
router.post(
  '/quick',
  generalLimiter,
  optionalAuthenticate,
  validate(quickCaseSchema),
  caseController.createQuickCase.bind(caseController)
);

/**
 * @route   POST /api/v1/cases
 * @desc    創建案件（完整模式）
 * @access  Private
 */
router.post(
  '/',
  generalLimiter,
  authenticate,
  validate(createCaseSchema),
  caseController.createCase.bind(caseController)
);

/**
 * @route   GET /api/v1/cases/:id
 * @desc    獲取案件詳情
 * @access  Private/Public (快速體驗模式)
 */
router.get(
  '/:id',
  generalLimiter,
  optionalAuthenticate,
  validate(uuidParamSchema),
  caseController.getCaseById.bind(caseController)
);

/**
 * @route   GET /api/v1/cases/by-session
 * @desc    通過Session ID獲取案件（快速體驗模式）
 * @access  Public
 */
router.get(
  '/by-session',
  generalLimiter,
  validateSession,
  caseController.getCaseBySessionId.bind(caseController)
);

/**
 * @route   POST /api/v1/cases/:id/evidence
 * @desc    上傳證據
 * @access  Private/Public (快速體驗模式)
 */
router.post(
  '/:id/evidence',
  generalLimiter,
  optionalAuthenticate,
  validate(uuidParamSchema),
  evidenceController.uploadEvidence
);

export default router;

