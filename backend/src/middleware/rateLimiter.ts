import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// 通用限流（每分鐘100次）
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分鐘
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '請求過於頻繁，請稍後再試',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 認證接口限流（每5分鐘10次）
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分鐘
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '認證請求過於頻繁，請稍後再試',
    },
  },
  skipSuccessfulRequests: true, // 成功請求不計入限流
});

// 註冊接口限流（每小時5次）
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小時
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '註冊請求過於頻繁，請稍後再試',
    },
  },
});

// 驗證碼接口限流（每郵箱每5分鐘1次）
export const verificationCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分鐘
  max: 1,
  keyGenerator: (req: Request) => {
    return (req.body?.email || req.ip) as string;
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '驗證碼發送過於頻繁，請稍後再試',
    },
  },
});

// AI接口限流（每小時10次，根據用戶類型調整）
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小時
  max: 10,
  keyGenerator: (req: Request) => {
    // 根據用戶ID或IP限流
    const userId = (req as any).user?.id;
    return userId || req.ip;
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'AI服務請求過於頻繁，請稍後再試',
    },
  },
  skipSuccessfulRequests: false, // AI請求都計入限流
});

// 文件上傳限流（每分鐘5次）
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分鐘
  max: 5,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    return userId || sessionId || req.ip;
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '文件上傳過於頻繁，請稍後再試',
    },
  },
});

