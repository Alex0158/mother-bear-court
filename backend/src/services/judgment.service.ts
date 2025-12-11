import prisma from '../config/database';
import { Errors } from '../utils/errors';
import logger from '../config/logger';
import { aiService } from './ai.service';
import { sessionService } from './session.service';
import { lockService } from '../utils/lock';
import { isResponsibilityRatio } from '../types/ai.types';

export class JudgmentService {
  /**
   * 生成判決（帶並發控制和事務處理）
   */
  async generateJudgment(caseId: string) {
    const lockKey = `judgment:lock:${caseId}`;

    // 使用分布式鎖防止並發生成
    return await lockService.withLock(
      lockKey,
      async () => {
        // 1. 檢查是否已有判決（雙重檢查）
        const existing = await prisma.judgment.findUnique({
          where: { case_id: caseId },
        });

        if (existing) {
          logger.debug('Judgment already exists', { caseId, judgmentId: existing.id });
          return existing;
        }

        // 2. 獲取案件信息
        const case_ = await prisma.case.findUnique({
          where: { id: caseId },
        });

        if (!case_) {
          throw Errors.NOT_FOUND('案件不存在');
        }

        if (case_.status !== 'submitted') {
          throw Errors.CASE_NOT_READY();
        }

        // 3. 調用AI服務生成判決
        let judgmentContent: string;
        let responsibilityRatio: { plaintiff: number; defendant: number };
        let summary: string;

        try {
          const response = await aiService.generateJudgment(
            case_.type,
            case_.plaintiff_statement,
            case_.defendant_statement || ''
          );

          judgmentContent = response.content;
          responsibilityRatio = response.responsibilityRatio;
          summary = response.summary;
        } catch (error) {
          logger.error('AI service error', { caseId, error });
          throw Errors.AI_SERVICE_ERROR('AI服務暫時不可用');
        }

        // 4-6. 使用事務確保數據一致性
        const judgment = await prisma.$transaction(async (tx: any) => {
          // 再次檢查（防止在生成過程中其他進程已創建）
          const existing2 = await tx.judgment.findUnique({
            where: { case_id: caseId },
          });
          if (existing2) {
            return existing2;
          }

          // 4. 驗證並保存判決
          if (!isResponsibilityRatio(responsibilityRatio)) {
            throw Errors.VALIDATION_ERROR('無效的責任分比例格式');
          }

          const newJudgment = await tx.judgment.create({
            data: {
              case_id: caseId,
              judgment_content: judgmentContent,
              summary,
              responsibility_ratio: responsibilityRatio,
              ai_model: 'gpt-3.5-turbo',
              prompt_version: 'v1.0',
            },
          });

          // 5. 更新案件狀態
          await tx.case.update({
            where: { id: caseId },
            data: {
              status: 'completed',
              completed_at: new Date(),
            },
          });

          return newJudgment;
        });

        // 6. 快速體驗模式：標記Session為已完成（異步，不阻塞）
        if (case_.mode === 'quick' && case_.session_id) {
          sessionService.markSessionCompleted(case_.session_id).catch(err => {
            logger.warn('Failed to mark session completed', {
              sessionId: case_.session_id,
              error: err,
            });
          });
        }

        logger.info('Judgment generated', { caseId, judgmentId: judgment.id });

        return judgment;
      },
      120 // 鎖定時間：120秒（足夠AI生成判決）
    );
  }

  /**
   * 獲取判決詳情（優化查詢）
   */
  async getJudgmentByCaseId(caseId: string, userId?: string, sessionId?: string) {
    // 1. 獲取案件（驗證權限，優化查詢）
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        pairing: {
          select: {
            user1_id: true,
            user2_id: true,
          },
        },
      },
    });

    if (!case_) {
      throw Errors.NOT_FOUND('案件不存在');
    }

    // 快速體驗模式：驗證Session ID
    if (case_.mode === 'quick') {
      if (!sessionId || case_.session_id !== sessionId) {
        throw Errors.FORBIDDEN('無權限訪問此判決');
      }
    } else {
      // 完整模式：驗證用戶權限
      if (!userId) {
        throw Errors.UNAUTHORIZED('需要認證');
      }

      if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
        throw Errors.FORBIDDEN('無權限訪問此判決');
      }
    }

    // 2. 獲取判決（包含關聯數據）
    const judgment = await prisma.judgment.findUnique({
      where: { case_id: caseId },
      include: {
        reconciliation_plans: {
          orderBy: { created_at: 'desc' },
          take: 10, // 限制返回數量
        },
      },
    });

    if (!judgment) {
      // 如果判決尚未生成，返回null（前端可以顯示"生成中"）
      return null;
    }

    return judgment;
  }

  /**
   * 接受/拒絕判決（僅完整模式）
   */
  async acceptJudgment(
    judgmentId: string,
    userId: string,
    accepted: boolean,
    rating?: number
  ) {
    const judgment = await prisma.judgment.findUnique({
      where: { id: judgmentId },
      include: {
        case: true,
      },
    });

    if (!judgment) {
      throw Errors.NOT_FOUND('判決不存在');
    }

    // 驗證用戶權限
    if (judgment.case.plaintiff_id !== userId && judgment.case.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限操作此判決');
    }

    // 確定是user1還是user2
    const isUser1 = judgment.case.plaintiff_id === userId;

    // 更新判決
    const updatedJudgment = await prisma.judgment.update({
      where: { id: judgmentId },
      data: {
        ...(isUser1
          ? {
              user1_acceptance: accepted,
              user1_rating: rating,
            }
          : {
              user2_acceptance: accepted,
              user2_rating: rating,
            }),
      },
    });

    return updatedJudgment;
  }
}

export const judgmentService = new JudgmentService();

