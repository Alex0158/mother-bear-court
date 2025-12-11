import cron from 'node-cron';
import { sessionService } from '../services/session.service';
import { aiService } from '../services/ai.service';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * 清理過期Session（每小時執行一次）
 */
export const cleanupExpiredSessions = cron.schedule('0 * * * *', async () => {
  try {
    const count = await sessionService.cleanupExpiredSessions();
    logger.info('Expired sessions cleaned up', { count });
  } catch (error) {
    logger.error('Failed to cleanup expired sessions', { error });
  }
});

/**
 * 清理過期驗證碼（每小時執行一次）
 */
export const cleanupExpiredVerifications = cron.schedule('0 * * * *', async () => {
  try {
    const result = await prisma.emailVerification.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { used: true, created_at: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });
    logger.info('Expired verifications cleaned up', { count: result.count });
  } catch (error) {
    logger.error('Failed to cleanup expired verifications', { error });
  }
});

/**
 * 重置AI服務每日調用計數（每天0點執行）
 */
export const resetAIDailyCount = cron.schedule('0 0 * * *', () => {
  try {
    aiService.resetDailyCallCount();
    logger.info('AI service daily call count reset');
  } catch (error) {
    logger.error('Failed to reset AI daily count', { error });
  }
});

/**
 * 啟動所有定時任務
 */
export const startJobs = () => {
  cleanupExpiredSessions.start();
  cleanupExpiredVerifications.start();
  resetAIDailyCount.start();
  logger.info('Scheduled jobs started');
};

/**
 * 停止所有定時任務
 */
export const stopJobs = () => {
  cleanupExpiredSessions.stop();
  cleanupExpiredVerifications.stop();
  resetAIDailyCount.stop();
  logger.info('Scheduled jobs stopped');
};

