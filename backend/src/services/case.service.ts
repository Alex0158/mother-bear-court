import prisma from '../config/database';
import { Errors } from '../utils/errors';
import logger from '../config/logger';
import { aiService } from './ai.service';
import { sessionService } from './session.service';
import { pairingService } from './pairing.service';
import { ValidationUtils } from '../utils/validation';

export interface QuickCaseDto {
  plaintiff_statement: string;
  defendant_statement: string;
  evidence_urls?: string[];
}

export interface CreateCaseDto {
  pairing_id: string;
  title?: string;
  plaintiff_statement: string;
  defendant_statement?: string;
  evidence_urls?: string[];
}

export class CaseService {
  /**
   * 創建快速體驗案件
   */
  async createQuickCase(data: QuickCaseDto, sessionId: string) {
    // 0. 驗證Session ID格式
    if (!sessionId || !sessionId.startsWith('guest_')) {
      throw Errors.INVALID_SESSION_ID();
    }

    // 1. 驗證Session是否存在且未過期
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      throw Errors.SESSION_EXPIRED();
    }

    // 2-4. 使用統一驗證工具
    const plaintiffStatement = ValidationUtils.validateStatement(
      data.plaintiff_statement,
      '原告陳述'
    );
    const defendantStatement = ValidationUtils.validateStatement(
      data.defendant_statement,
      '被告陳述'
    );

    if (data.evidence_urls) {
      ValidationUtils.validateEvidenceUrls(data.evidence_urls);
    }

    // 5. AI自動判斷案件類型（帶錯誤處理）
    let caseType: string;
    try {
      caseType = await aiService.detectCaseType(
        data.plaintiff_statement,
        data.defendant_statement
      );
    } catch (error) {
      logger.error('Failed to detect case type', { error, sessionId });
      caseType = '其他衝突'; // 默認類型
    }

    // 6. 創建臨時配對（用於快速體驗）
    const tempPairing = await pairingService.createTempPairing(sessionId);

    // 7. 生成案件標題（帶錯誤處理）
    let title: string;
    try {
      title = this.generateTitle(data.plaintiff_statement);
    } catch (error) {
      logger.warn('Failed to generate title', { error });
      title = '案件-' + new Date().toLocaleDateString(); // 默認標題
    }

    // 8-10. 使用事務確保數據一致性
    const case_ = await prisma.$transaction(async (tx: any) => {
      // 8. 創建案件記錄
      const newCase = await tx.case.create({
        data: {
          pairing_id: tempPairing.id,
          title,
          type: caseType,
          plaintiff_id: null, // 快速體驗模式，無真實用戶
          defendant_id: null, // 快速體驗模式，無真實用戶
          plaintiff_statement: plaintiffStatement,
          defendant_statement: defendantStatement,
          status: 'submitted',
          mode: 'quick', // 標記為快速體驗模式
          session_id: sessionId, // 關聯Session ID
          submitted_at: new Date(),
        },
      });

      // 9. 保存證據（如有，在事務中處理）
      if (data.evidence_urls && data.evidence_urls.length > 0) {
        await tx.evidence.createMany({
          data: data.evidence_urls.map(url => ({
            case_id: newCase.id,
            file_url: url,
            file_type: 'image',
            file_size: 0, // 快速體驗模式，無法獲取文件大小
            user_id: null, // 快速體驗模式，無真實用戶
          })),
        });
      }

      // 10. 更新Session，關聯案件ID
      await tx.quickSession.update({
        where: { id: sessionId },
        data: { case_id: newCase.id },
      });

      return newCase;
    }).catch((error: any) => {
      logger.error('Failed to create case in transaction', { error, sessionId });
      throw Errors.INTERNAL_ERROR('案件創建失敗，請稍後再試');
    });

    // 11. 異步觸發AI判決生成（不阻塞響應）
    // 注意：判決生成在controller層處理，避免循環依賴
    // 這裡只返回案件，判決生成由controller異步觸發

    return case_;
  }

  /**
   * 創建案件（完整模式）
   */
  async createCase(userId: string, data: CreateCaseDto) {
    // 1. 驗證配對關係
    const pairing = await prisma.pairing.findUnique({
      where: { id: data.pairing_id },
      include: {
        user1: true,
        user2: true,
      },
    });

    if (!pairing) {
      throw Errors.NOT_FOUND('配對不存在');
    }

    if (pairing.status !== 'active') {
      throw Errors.VALIDATION_ERROR('配對關係未激活');
    }

    // 2. 驗證用戶是否屬於此配對
    if (pairing.user1_id !== userId && pairing.user2_id !== userId) {
      throw Errors.FORBIDDEN('無權限訪問此配對');
    }

    // 3. 驗證陳述長度（使用統一驗證工具）
    const plaintiffStatement = ValidationUtils.validateStatement(
      data.plaintiff_statement,
      '原告陳述'
    );

    // 4. AI自動判斷案件類型
    let caseType: string;
    try {
      caseType = await aiService.detectCaseType(
        data.plaintiff_statement,
        data.defendant_statement || ''
      );
    } catch (error) {
      logger.error('Failed to detect case type', { error });
      caseType = '其他衝突';
    }

    // 5. 生成標題
    const title = data.title || this.generateTitle(data.plaintiff_statement);

    // 6. 確定原告和被告
    const plaintiffId = pairing.user1_id === userId ? pairing.user1_id : pairing.user2_id;
    const defendantId = pairing.user1_id === userId ? pairing.user2_id : pairing.user1_id;

    // 7. 創建案件
    const case_ = await prisma.case.create({
      data: {
        pairing_id: data.pairing_id,
        title,
        type: caseType,
        plaintiff_id: plaintiffId,
        defendant_id: defendantId,
        plaintiff_statement: plaintiffStatement,
        defendant_statement: data.defendant_statement
          ? ValidationUtils.validateStatement(data.defendant_statement, '被告陳述')
          : null,
        status: 'submitted',
        mode: 'remote',
        submitted_at: new Date(),
      },
    });

    // 8. 保存證據
    if (data.evidence_urls && data.evidence_urls.length > 0) {
      for (const url of data.evidence_urls) {
        await prisma.evidence.create({
          data: {
            case_id: case_.id,
            file_url: url,
            file_type: 'image',
            file_size: 0,
            user_id: plaintiffId,
          },
        });
      }
    }

    // 9. 異步觸發AI判決生成（在controller層處理）

    return case_;
  }

  /**
   * 獲取案件列表（完整模式）
   */
  async getCaseList(
    userId: string,
    params: {
      status?: string;
      type?: string;
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      search?: string;
    } = {}
  ) {
    const {
      status,
      type,
      page = 1,
      page_size = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
      search,
    } = params;

    const where: any = {
      OR: [
        { plaintiff_id: userId },
        { defendant_id: userId },
      ],
      mode: 'remote', // 只返回完整模式的案件
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { plaintiff_statement: { contains: search, mode: 'insensitive' } },
        { defendant_statement: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          judgment: {
            select: {
              id: true,
              summary: true,
              responsibility_ratio: true,
            },
          },
        },
        orderBy: {
          [sort_by]: sort_order,
        },
        skip: (page - 1) * page_size,
        take: page_size,
      }),
      prisma.case.count({ where }),
    ]);

    return {
      cases,
      pagination: {
        page,
        page_size,
        total,
        total_pages: Math.ceil(total / page_size),
      },
    };
  }

  /**
   * 提交案件（將狀態從draft改為submitted）
   */
  async submitCase(caseId: string, userId: string) {
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!case_) {
      throw Errors.NOT_FOUND('案件不存在');
    }

    // 驗證用戶權限
    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限提交此案件');
    }

    // 驗證案件狀態
    if (case_.status !== 'draft') {
      throw Errors.CASE_NOT_EDITABLE('案件狀態不允許提交');
    }

    // 更新狀態
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'submitted',
        submitted_at: new Date(),
      },
    });

    // 異步觸發AI判決生成
    const { judgmentService } = await import('./judgment.service');
    judgmentService.generateJudgment(caseId).catch(err => {
      logger.error('Failed to generate judgment after submission', { caseId, error: err });
    });

    return updatedCase;
  }

  /**
   * 更新案件（僅draft狀態可更新）
   */
  async updateCase(caseId: string, userId: string, data: Partial<CreateCaseDto>) {
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!case_) {
      throw Errors.NOT_FOUND('案件不存在');
    }

    // 驗證用戶權限
    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限更新此案件');
    }

    // 驗證案件狀態（僅draft狀態可更新）
    if (case_.status !== 'draft') {
      throw Errors.CASE_NOT_EDITABLE('案件狀態不允許更新');
    }

    // 驗證更新數據
    const updateData: any = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.plaintiff_statement !== undefined) {
      updateData.plaintiff_statement = ValidationUtils.validateStatement(
        data.plaintiff_statement,
        '原告陳述'
      );
      // 更新案件類型（如果陳述改變）
      const caseType = await aiService.detectCaseType(
        data.plaintiff_statement,
        data.defendant_statement || case_.defendant_statement || ''
      );
      updateData.type = caseType;
    }

    if (data.defendant_statement !== undefined) {
      updateData.defendant_statement = data.defendant_statement
        ? ValidationUtils.validateStatement(data.defendant_statement, '被告陳述')
        : null;
      // 更新案件類型（如果陳述改變）
      if (data.plaintiff_statement === undefined) {
        const caseType = await aiService.detectCaseType(
          case_.plaintiff_statement,
          data.defendant_statement || ''
        );
        updateData.type = caseType;
      }
    }

    updateData.updated_at = new Date();

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: updateData,
    });

    return updatedCase;
  }

  /**
   * 獲取案件詳情（優化查詢，避免N+1問題）
   */
  async getCaseById(caseId: string, userId?: string, sessionId?: string) {
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        evidences: {
          orderBy: { created_at: 'desc' },
        },
        judgment: {
          include: {
            reconciliation_plans: {
              orderBy: { created_at: 'desc' },
            },
          },
        },
        pairing: {
          include: {
            user1: {
              select: {
                id: true,
                nickname: true,
                avatar_url: true,
              },
            },
            user2: {
              select: {
                id: true,
                nickname: true,
                avatar_url: true,
              },
            },
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
        throw Errors.FORBIDDEN('無權限訪問此案件');
      }
      return case_;
    }

    // 完整模式：驗證用戶權限
    if (!userId) {
      throw Errors.UNAUTHORIZED('需要認證');
    }

    if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
      throw Errors.FORBIDDEN('無權限訪問此案件');
    }

    return case_;
  }

  /**
   * 通過Session ID獲取案件（快速體驗模式，優化查詢）
   */
  async getCaseBySessionId(sessionId: string) {
    const case_ = await prisma.case.findFirst({
      where: {
        session_id: sessionId,
        mode: 'quick',
      },
      include: {
        evidences: {
          orderBy: { created_at: 'desc' },
        },
        judgment: {
          include: {
            reconciliation_plans: {
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return case_;
  }

  /**
   * 生成案件標題
   */
  private generateTitle(statement: string): string {
    // 簡單標題生成：取前30個字符
    const title = statement.substring(0, 30).trim();
    return title.length < 5 ? '案件-' + new Date().toLocaleDateString() : title;
  }
}

export const caseService = new CaseService();

// 注意：為了避免循環依賴，判決生成在caseService外部觸發
// 在controller層處理判決生成的異步調用

