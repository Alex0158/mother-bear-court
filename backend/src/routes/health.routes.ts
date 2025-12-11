/**
 * 健康檢查路由
 */

import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

const router = Router();

/**
 * @route   GET /health
 * @desc    健康檢查端點
 * @access  Public
 */
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const checks: Record<string, { status: string; message?: string; responseTime?: number }> = {};

  try {
    // 檢查數據庫連接
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;
    
    checks.database = {
      status: 'healthy',
      responseTime: dbResponseTime,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  // 檢查環境變量
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  checks.environment = {
    status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
    message: missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}` : undefined,
  };

  // 計算總響應時間
  const totalResponseTime = Date.now() - startTime;

  // 判斷整體健康狀態
  const isHealthy = Object.values(checks).every(check => check.status === 'healthy');

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks,
    responseTime: totalResponseTime,
    version: process.env.npm_package_version || '1.0.0',
  };

  if (isHealthy) {
    logger.info('Health check passed', { responseTime: totalResponseTime });
    res.status(200).json(response);
  } else {
    logger.warn('Health check failed', { checks });
    res.status(503).json(response);
  }
});

/**
 * @route   GET /health/ready
 * @desc    就緒檢查（用於Kubernetes等）
 * @access  Public
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // 只檢查數據庫連接
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route   GET /health/live
 * @desc    存活檢查（用於Kubernetes等）
 * @access  Public
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

export default router;



