import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/v1/user/profile
 * @desc    獲取用戶資料
 * @access  Private
 */
router.get(
  '/profile',
  generalLimiter,
  authenticate,
  userController.getProfile.bind(userController)
);

/**
 * @route   PUT /api/v1/user/profile
 * @desc    更新用戶資料
 * @access  Private
 */
router.put(
  '/profile',
  generalLimiter,
  authenticate,
  userController.updateProfile.bind(userController)
);

export default router;

