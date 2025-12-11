/**
 * 性能監控中間件
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface PerformanceMetrics {
  method: string;
  url: string;
  duration: number;
  statusCode: number;
  timestamp: string;
}

/**
 * 性能監控中間件
 */
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const startMemory = process.memoryUsage();

  // 響應完成時記錄性能指標
  res.on('finish', () => {
    const duration = Date.now() - start;
    const endMemory = process.memoryUsage();
    const memoryDelta = {
      heapUsed: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024, // MB
      rss: (endMemory.rss - startMemory.rss) / 1024 / 1024, // MB
    };

    const metrics: PerformanceMetrics = {
      method: req.method,
      url: req.url,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
    };

    // 記錄慢請求（超過1秒）
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        ...metrics,
        memory: memoryDelta,
        requestId: (req as any).requestId,
      });
    } else {
      logger.debug('Request completed', {
        ...metrics,
        requestId: (req as any).requestId,
      });
    }

    // 記錄錯誤請求的性能指標
    if (res.statusCode >= 400) {
      logger.warn('Request error', {
        ...metrics,
        requestId: (req as any).requestId,
      });
    }
  });

  next();
};

/**
 * 獲取性能統計（用於健康檢查）
 */
export const getPerformanceStats = () => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();

  return {
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024), // MB
    },
    uptime: Math.round(uptime), // seconds
    nodeVersion: process.version,
  };
};

