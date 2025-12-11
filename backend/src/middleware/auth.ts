import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserPayload } from '../utils/jwt';
import { Errors } from '../utils/errors';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      sessionId?: string;
    }
  }
}

/**
 * JWT認證中間件（必需認證）
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. 從Header獲取Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Errors.UNAUTHORIZED('未提供認證Token');
    }
    
    const token = authHeader.substring(7);
    
    // 2. 驗證Token
    const decoded = verifyToken(token);
    
    // 3. 檢查用戶是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, is_active: true },
    });
    
    if (!user || !user.is_active) {
      throw Errors.UNAUTHORIZED('用戶不存在或未激活');
    }
    
    // 4. 將用戶信息附加到請求對象
    req.user = {
      id: user.id,
      email: user.email,
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 可選認證中間件（快速體驗模式）
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, is_active: true },
        });
        
        if (user && user.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
          };
        }
      } catch (error) {
        // 認證失敗不影響請求繼續
      }
    }
    next();
  } catch (error) {
    // 認證失敗不影響請求繼續
    next();
  }
};

/**
 * Session驗證中間件（快速體驗模式）
 */
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = (req.query.session_id as string) || 
                      (req.headers['x-session-id'] as string);
    
    if (!sessionId) {
      throw Errors.SESSION_ID_REQUIRED();
    }
    
    // 驗證Session ID格式
    if (!sessionId.startsWith('guest_')) {
      throw Errors.INVALID_SESSION_ID();
    }
    
    // 驗證Session是否存在且未過期
    const session = await prisma.quickSession.findUnique({
      where: { id: sessionId },
    });
    
    if (!session) {
      throw Errors.SESSION_EXPIRED();
    }
    
    // 檢查是否過期
    if (session.expires_at < new Date()) {
      throw Errors.SESSION_EXPIRED();
    }
    
    // 更新最後訪問時間
    await prisma.quickSession.update({
      where: { id: sessionId },
      data: { last_accessed_at: new Date() },
    }).catch(() => {
      // 更新失敗不影響請求
    });
    
    // 將Session ID附加到請求對象
    req.sessionId = sessionId;
    
    next();
  } catch (error) {
    next(error);
  }
};

