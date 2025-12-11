import prisma from '../config/database';
import { Errors } from '../utils/errors';
import logger from '../config/logger';
import { aiService, ReconciliationPlan } from './ai.service';
import { isReconciliationPlanContent } from '../types/ai.types';

export interface PlanPreferences {
  difficulty?: 'easy' | 'medium' | 'hard';
  duration?: number;
  types?: ('activity' | 'communication' | 'intimacy')[];
}

export class ReconciliationService {
  /**
   * 生成和好方案
   */
  async generatePlans(judgmentId: string, preferences?: PlanPreferences) {
    // 1. 獲取判決信息（優化查詢，一次性獲取所有需要的数据）
    const judgment = await prisma.judgment.findUnique({
      where: { id: judgmentId },
      include: {
        case: {
          include: {
            pairing: {
              select: {
                user1_id: true,
                user2_id: true,
              },
            },
          },
        },
      },
    });

    if (!judgment) {
      throw Errors.NOT_FOUND('判決不存在');
    }

    // 2. 檢查是否已有方案
    const existingPlans = await prisma.reconciliationPlan.findMany({
      where: { judgment_id: judgmentId },
    });

    if (existingPlans.length > 0) {
      return existingPlans;
    }

    // 3. 調用AI生成方案
    let plans: ReconciliationPlan[];
    try {
      plans = await aiService.generateReconciliationPlans(
        judgment.case.type,
        judgment.responsibility_ratio as { plaintiff: number; defendant: number },
        judgment.summary || ''
      );
    } catch (error) {
      logger.error('Failed to generate reconciliation plans', { judgmentId, error });
      throw Errors.AI_SERVICE_ERROR('和好方案生成失敗');
    }

    // 4. 過濾方案（根據偏好）
    let filteredPlans = plans;
    if (preferences) {
      if (preferences.difficulty) {
        filteredPlans = filteredPlans.filter(
          plan => plan.difficulty_level === preferences.difficulty
        );
      }
      if (preferences.types && preferences.types.length > 0) {
        filteredPlans = filteredPlans.filter(
          plan => preferences.types!.includes(plan.plan_type)
        );
      }
    }

    // 5. 驗證並保存方案（使用事務批量創建）
    const savedPlans = await prisma.$transaction(
      filteredPlans.map(plan => {
        // 驗證方案內容
        if (!isReconciliationPlanContent(plan)) {
          throw Errors.VALIDATION_ERROR('無效的和好方案格式');
        }

        return prisma.reconciliationPlan.create({
          data: {
            judgment_id: judgmentId,
            plan_content: JSON.stringify(plan), // 將完整方案內容存儲為JSON
            plan_type: plan.plan_type,
            difficulty_level: plan.difficulty_level || 'medium',
            estimated_duration: plan.estimated_duration || 7,
            time_cost: plan.time_cost,
            money_cost: plan.money_cost,
            emotion_cost: plan.emotion_cost,
            skill_requirement: plan.skill_requirement,
          },
        });
      })
    );

    logger.info('Reconciliation plans generated', { judgmentId, count: savedPlans.length });

    return savedPlans;
  }

  /**
   * 獲取和好方案列表
   */
  async getPlansByJudgmentId(judgmentId: string, filters?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    type?: 'activity' | 'communication' | 'intimacy';
  }) {
    const where: any = { judgment_id: judgmentId };

    if (filters) {
      if (filters.difficulty) {
        where.difficulty_level = filters.difficulty;
      }
      if (filters.type) {
        where.plan_type = filters.type;
      }
    }

    const plans = await prisma.reconciliationPlan.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return plans;
  }

  /**
   * 選擇和好方案
   */
  async selectPlan(planId: string, userId: string) {
    const plan = await prisma.reconciliationPlan.findUnique({
      where: { id: planId },
      include: {
        judgment: {
          include: {
            case: true,
          },
        },
      },
    });

    if (!plan) {
      throw Errors.NOT_FOUND('和好方案不存在');
    }

    // 驗證用戶權限
    const case_ = plan.judgment.case;
    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限選擇此方案');
    }

    // 確定是user1還是user2
    const isUser1 = case_.plaintiff_id === userId;

    // 更新方案選擇狀態
    const updatedPlan = await prisma.reconciliationPlan.update({
      where: { id: planId },
      data: {
        ...(isUser1
          ? { user1_selected: true }
          : { user2_selected: true }),
      },
    });

    return updatedPlan;
  }
}

export const reconciliationService = new ReconciliationService();

