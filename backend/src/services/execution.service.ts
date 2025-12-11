import prisma from '../config/database';
import { Errors } from '../utils/errors';
import logger from '../config/logger';

export interface CheckinDto {
  plan_id: string;
  notes?: string;
  photos?: string[];
}

export class ExecutionService {
  /**
   * 確認執行
   */
  async confirmExecution(userId: string, planId: string) {
    // 1. 驗證方案是否存在
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

    // 2. 驗證用戶權限
    const case_ = plan.judgment.case;
    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限執行此方案');
    }

    // 3. 檢查是否已有執行記錄
    const existing = await prisma.executionRecord.findFirst({
      where: {
        reconciliation_plan_id: planId,
        user_id: userId,
        action: 'confirm',
      },
    });

    if (existing) {
      return existing;
    }

    // 4. 創建執行記錄
    const execution = await prisma.executionRecord.create({
      data: {
        reconciliation_plan_id: planId,
        user_id: userId,
        action: 'confirm',
        status: 'in_progress',
      },
    });

    logger.info('Execution confirmed', { executionId: execution.id, userId, planId });

    return execution;
  }

  /**
   * 執行打卡
   */
  async checkin(userId: string, data: CheckinDto) {
    // 1. 驗證方案是否存在
    const plan = await prisma.reconciliationPlan.findUnique({
      where: { id: data.plan_id },
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

    // 2. 驗證用戶權限
    const case_ = plan.judgment.case;
    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限執行此方案');
    }

    // 3. 創建打卡記錄
    const execution = await prisma.executionRecord.create({
      data: {
        reconciliation_plan_id: data.plan_id,
        user_id: userId,
        action: 'checkin',
        status: 'in_progress',
        notes: data.notes,
        photos_urls: data.photos || [],
      },
    });

    logger.info('Execution checkin', { executionId: execution.id, userId, planId: data.plan_id });

    return execution;
  }

  /**
   * 獲取執行狀態
   */
  async getExecutionStatus(userId: string, planId: string) {
    // 1. 驗證方案是否存在
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

    // 2. 驗證用戶權限
    const case_ = plan.judgment.case;
    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限查看此執行狀態');
    }

    // 3. 獲取執行記錄
    const records = await prisma.executionRecord.findMany({
      where: {
        reconciliation_plan_id: planId,
        user_id: userId,
      },
      orderBy: { created_at: 'desc' },
    });

    // 4. 計算進度
    const progress = this.calculateProgress(plan, records);

    return {
      plan_id: planId,
      status: records.length > 0 ? records[0].status : 'pending',
      records,
      progress,
    };
  }

  /**
   * 計算執行進度
   */
  private calculateProgress(plan: any, records: any[]): number {
    if (records.length === 0) {
      return 0;
    }

    // 簡單進度計算：根據打卡次數和預計持續時間
    const checkinCount = records.filter(r => r.action === 'checkin').length;
    const estimatedDuration = plan.estimated_duration || 7;

    // 假設每天打卡一次，進度 = 打卡次數 / 預計天數 * 100
    const progress = Math.min(100, Math.round((checkinCount / estimatedDuration) * 100));

    return progress;
  }
}

export const executionService = new ExecutionService();

