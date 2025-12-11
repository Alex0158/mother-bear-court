import { Request, Response, NextFunction } from 'express';
import { caseService } from '../services/case.service';
import { judgmentService } from '../services/judgment.service';
import logger from '../config/logger';

export class CaseController {
  /**
   * 創建案件（快速體驗模式）
   */
  async createQuickCase(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = (req.headers['x-session-id'] as string) || 
                        (req.query.session_id as string);

      if (!sessionId) {
        // 如果沒有Session ID，自動創建一個
        const { sessionService } = await import('../services/session.service');
        const session = await sessionService.createSession();
        req.headers['x-session-id'] = session.session_id;
      }

      const finalSessionId = sessionId || req.headers['x-session-id'] as string;
      const case_ = await caseService.createQuickCase(req.body, finalSessionId);

      // 異步觸發判決生成
      judgmentService.generateJudgment(case_.id).catch(err => {
        logger.error('Failed to generate judgment', { caseId: case_.id, error: err });
      });

      res.status(201).json({
        success: true,
        data: {
          case: {
            id: case_.id,
            status: case_.status,
            mode: case_.mode,
            created_at: case_.created_at,
          },
          session_id: finalSessionId,
        },
        message: '案件已提交，AI正在分析中...',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 創建案件（完整模式）
   */
  async createCase(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.id;
      const case_ = await caseService.createCase(userId, req.body);

      // 異步觸發判決生成
      judgmentService.generateJudgment(case_.id).catch(err => {
        logger.error('Failed to generate judgment', { caseId: case_.id, error: err });
      });

      res.status(201).json({
        success: true,
        data: { case: case_ },
        message: '案件已提交',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 獲取案件詳情
   */
  async getCaseById(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.params.id;
      const userId = (req as any).user?.id;
      const sessionId = (req.query.session_id as string) || 
                        (req.headers['x-session-id'] as string);

      const case_ = await caseService.getCaseById(caseId, userId, sessionId);

      res.json({
        success: true,
        data: { case: case_ },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 通過Session ID獲取案件（快速體驗模式）
   */
  async getCaseBySessionId(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = (req.query.session_id as string) || 
                        (req.headers['x-session-id'] as string);

      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const case_ = await caseService.getCaseBySessionId(sessionId);

      if (!case_) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '案件不存在',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { case: case_ },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const caseController = new CaseController();

