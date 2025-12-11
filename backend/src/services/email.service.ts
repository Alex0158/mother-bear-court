import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      logger.warn('郵件服務未配置，將跳過郵件發送');
    }
  }

  /**
   * 發送驗證碼郵件
   */
  async sendVerificationCode(
    email: string,
    code: string,
    type: 'register' | 'reset_password' | 'verify_email'
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn('郵件服務未配置，跳過發送', { email, code, type });
      return;
    }

    const subjectMap = {
      register: '歡迎註冊熊媽媽法庭 - 請驗證您的郵箱',
      reset_password: '重置密碼 - 熊媽媽法庭',
      verify_email: '驗證郵箱 - 熊媽媽法庭',
    };

    const contentMap = {
      register: `您的驗證碼是：${code}，有效期5分鐘。`,
      reset_password: `您的重置密碼驗證碼是：${code}，有效期5分鐘。`,
      verify_email: `您的驗證碼是：${code}，有效期5分鐘。`,
    };

    try {
      await this.transporter.sendMail({
        from: `"熊媽媽法庭" <${env.SMTP_USER}>`,
        to: email,
        subject: subjectMap[type],
        text: contentMap[type],
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subjectMap[type]}</h2>
            <p style="font-size: 16px; color: #666;">${contentMap[type]}</p>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">
              如果您沒有請求此驗證碼，請忽略此郵件。
            </p>
          </div>
        `,
      });

      logger.info('Verification email sent', { email, type });
    } catch (error) {
      logger.error('Failed to send verification email', { email, type, error });
      throw error;
    }
  }

  /**
   * 發送配對通知郵件
   */
  async sendPairingNotification(userId1: string, userId2: string): Promise<void> {
    // TODO: 實現配對通知郵件
    logger.info('Pairing notification', { userId1, userId2 });
  }

  /**
   * 發送判決通知郵件
   */
  async sendJudgmentNotification(userId: string, caseId: string): Promise<void> {
    // TODO: 實現判決通知郵件
    logger.info('Judgment notification', { userId, caseId });
  }
}

export const emailService = new EmailService();

