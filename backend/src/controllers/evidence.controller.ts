import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { Errors } from '../utils/errors';
import { fileService, upload } from '../services/file.service';
import logger from '../config/logger';

export class EvidenceController {
  /**
   * 上傳證據（支持快速體驗和完整模式）
   */
  uploadEvidence = [
    upload.array('files', 3),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const caseId = req.params.id;
        const files = req.files as Express.Multer.File[];
        const userId = (req as any).user?.id;
        const sessionId = (req.query.session_id as string) || 
                          (req.headers['x-session-id'] as string);

        if (!files || files.length === 0) {
          throw Errors.VALIDATION_ERROR('請選擇要上傳的文件');
        }

        // 驗證案件是否存在
        const case_ = await prisma.case.findUnique({
          where: { id: caseId },
        });

        if (!case_) {
          throw Errors.NOT_FOUND('案件不存在');
        }

        // 驗證權限
        if (case_.mode === 'quick') {
          // 快速體驗模式：驗證Session ID
          if (!sessionId || case_.session_id !== sessionId) {
            throw Errors.FORBIDDEN('無權限上傳證據');
          }
        } else {
          // 完整模式：驗證用戶權限
          if (!userId) {
            throw Errors.UNAUTHORIZED('需要認證');
          }
          if (case_.plaintiff_id !== userId && case_.defendant_id !== userId) {
            throw Errors.FORBIDDEN('無權限上傳證據');
          }
        }

        // 驗證案件狀態
        if (case_.status !== 'draft' && case_.status !== 'submitted') {
          throw Errors.CASE_NOT_EDITABLE('案件狀態不允許上傳證據');
        }

        // 檢查現有證據數量
        const existingEvidences = await prisma.evidence.count({
          where: { case_id: caseId },
        });

        if (existingEvidences + files.length > 3) {
          throw Errors.TOO_MANY_FILES('每個案件最多只能上傳3張圖片');
        }

        // 驗證並保存文件
        const evidences = [];
        for (const file of files) {
          fileService.validateFile(file);
          
          const evidence = await prisma.evidence.create({
            data: {
              case_id: caseId,
              user_id: userId || null,
              file_url: fileService.getFileUrl(file.filename),
              file_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
              file_size: file.size,
            },
          });

          evidences.push(evidence);
        }

        logger.info('Evidence uploaded', { caseId, count: evidences.length });

        res.json({
          success: true,
          data: { evidences },
          message: '證據上傳成功',
        });
      } catch (error) {
        next(error);
      }
    },
  ];
}

export const evidenceController = new EvidenceController();

