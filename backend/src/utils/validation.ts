/**
 * 統一驗證工具類
 */

import Joi from 'joi';
import { Errors } from './errors';

export class ValidationUtils {
  /**
   * 驗證陳述內容
   */
  static validateStatement(
    statement: string,
    fieldName: string = '陳述'
  ): string {
    if (!statement || typeof statement !== 'string') {
      throw Errors.VALIDATION_ERROR(`${fieldName}不能為空`);
    }

    const trimmed = statement.trim();

    if (trimmed.length < 50) {
      throw Errors.VALIDATION_ERROR(`${fieldName}長度必須至少50字`);
    }

    if (trimmed.length > 2000) {
      throw Errors.VALIDATION_ERROR(`${fieldName}長度不能超過2000字`);
    }

    return trimmed;
  }

  /**
   * 驗證證據URL列表
   */
  static validateEvidenceUrls(urls: string[]): void {
    if (!Array.isArray(urls)) {
      throw Errors.VALIDATION_ERROR('證據URL必須是數組');
    }

    if (urls.length > 3) {
      throw Errors.TOO_MANY_FILES('最多只能上傳3張圖片');
    }

    urls.forEach((url, index) => {
      if (!url || typeof url !== 'string') {
        throw Errors.VALIDATION_ERROR(`證據URL[${index}]格式錯誤`);
      }

      try {
        new URL(url);
      } catch {
        throw Errors.VALIDATION_ERROR(`證據URL[${index}]格式無效`);
      }
    });
  }

  /**
   * 驗證UUID格式
   */
  static validateUUID(id: string, fieldName: string = 'ID'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      throw Errors.VALIDATION_ERROR(`${fieldName}格式無效`);
    }
  }

  /**
   * 驗證郵箱格式
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      throw Errors.INVALID_EMAIL('郵箱格式錯誤');
    }
  }

  /**
   * 驗證密碼強度
   */
  static validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw Errors.WEAK_PASSWORD('密碼不能為空');
    }

    if (password.length < 8) {
      throw Errors.WEAK_PASSWORD('密碼長度至少8位');
    }

    if (!/[a-zA-Z]/.test(password)) {
      throw Errors.WEAK_PASSWORD('密碼必須包含字母');
    }

    if (!/[0-9]/.test(password)) {
      throw Errors.WEAK_PASSWORD('密碼必須包含數字');
    }
  }

  /**
   * 驗證責任分比例
   */
  static validateResponsibilityRatio(ratio: {
    plaintiff: number;
    defendant: number;
  }): void {
    if (
      typeof ratio.plaintiff !== 'number' ||
      typeof ratio.defendant !== 'number'
    ) {
      throw Errors.VALIDATION_ERROR('責任分比例必須是數字');
    }

    if (ratio.plaintiff < 0 || ratio.defendant < 0) {
      throw Errors.VALIDATION_ERROR('責任分比例不能為負數');
    }

    const total = ratio.plaintiff + ratio.defendant;
    if (Math.abs(total - 100) > 0.01) {
      throw Errors.VALIDATION_ERROR('責任分比例總和必須為100%');
    }
  }
}

// Joi Validation Schemas
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Auth Schemas
export const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(50).optional(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const sendVerificationCodeSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const verifyEmailSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const confirmResetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

// Case Schemas
export const quickCaseSchema = {
  body: Joi.object({
    plaintiffStatement: Joi.string().min(50).max(2000).required(),
    defendantStatement: Joi.string().min(50).max(2000).required(),
    evidenceUrls: Joi.array().items(Joi.string().uri()).max(3).optional(),
  }),
};

export const createCaseSchema = {
  body: Joi.object({
    plaintiffStatement: Joi.string().min(50).max(2000).required(),
    defendantStatement: Joi.string().min(50).max(2000).required(),
    evidenceUrls: Joi.array().items(Joi.string().uri()).max(3).optional(),
    pairingId: Joi.string().pattern(uuidPattern).optional(),
  }),
};

export const uuidParamSchema = {
  params: Joi.object({
    id: Joi.string().pattern(uuidPattern).required(),
  }),
};

// Execution Schemas
export const confirmExecutionSchema = {
  body: Joi.object({
    planId: Joi.string().pattern(uuidPattern).required(),
  }),
};

export const checkinSchema = {
  body: Joi.object({
    planId: Joi.string().pattern(uuidPattern).required(),
    status: Joi.string().valid('completed', 'in_progress', 'failed').required(),
    notes: Joi.string().max(500).optional(),
  }),
};

// Pairing Schemas
export const createPairingSchema = {
  body: Joi.object({
    partnerEmail: Joi.string().email().optional(),
  }),
};

export const joinPairingSchema = {
  body: Joi.object({
    pairingCode: Joi.string().length(6).required(),
  }),
};

// Reconciliation Schemas
export const generateReconciliationPlansSchema = {
  body: Joi.object({
    judgmentId: Joi.string().pattern(uuidPattern).required(),
  }),
};

export const selectPlanSchema = {
  body: Joi.object({
    planId: Joi.string().pattern(uuidPattern).required(),
  }),
};
