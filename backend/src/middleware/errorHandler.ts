import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 記錄錯誤
  logger.error('Error occurred', {
    request_id: (req as any).requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
    sessionId: (req as any).sessionId,
  });
  
  // 處理自定義錯誤
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || {},
      },
    });
    return;
  }
  
  // 處理未知錯誤
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' 
        ? '服務器內部錯誤' 
        : err.message,
    },
  });
};

