import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { Errors } from '../utils/errors';

export class UserController {
  /**
   * 獲取用戶資料
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar_url: true,
          gender: true,
          age: true,
          relationship_status: true,
          language: true,
          timezone: true,
          notification_enabled: true,
          privacy_level: true,
          created_at: true,
          last_login_at: true,
          email_verified: true,
        },
      });

      if (!user) {
        throw Errors.NOT_FOUND('用戶不存在');
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用戶資料
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const updateData = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          updated_at: new Date(),
        },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar_url: true,
          gender: true,
          age: true,
          relationship_status: true,
          language: true,
          timezone: true,
          notification_enabled: true,
          privacy_level: true,
          created_at: true,
          last_login_at: true,
          email_verified: true,
        },
      });

      res.json({
        success: true,
        data: { user },
        message: '資料更新成功',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

