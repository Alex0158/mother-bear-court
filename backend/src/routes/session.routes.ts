import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/v1/sessions/quick
 * @desc    創建Session（快速體驗模式）
 * @access  Public
 */
router.post('/quick', generalLimiter, sessionController.createSession.bind(sessionController));

export default router;

