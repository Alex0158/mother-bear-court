import prisma from '../config/database';
import { generateInviteCode } from '../utils/session';
import { Errors } from '../utils/errors';
import logger from '../config/logger';

export class PairingService {
  /**
   * 創建配對（完整模式）
   */
  async createPairing(userId: string) {
    // 1. 檢查是否已有配對
    const existingPairing = await prisma.pairing.findFirst({
      where: {
        OR: [
          { user1_id: userId, status: { in: ['pending', 'active'] } },
          { user2_id: userId, status: { in: ['pending', 'active'] } },
        ],
      },
    });

    if (existingPairing) {
      throw Errors.ALREADY_PAIRED();
    }

    // 2. 生成唯一邀請碼（6位字母數字）
    let inviteCode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      inviteCode = generateInviteCode();
      const existing = await prisma.pairing.findUnique({
        where: { invite_code: inviteCode },
      });

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw Errors.INTERNAL_ERROR('無法生成唯一邀請碼');
    }

    // 3. 創建配對記錄（24小時過期）
    const pairing = await prisma.pairing.create({
      data: {
        user1_id: userId,
        invite_code: inviteCode!,
        status: 'pending',
        pairing_type: 'normal',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    logger.info('Pairing created', { pairingId: pairing.id, userId });

    return pairing;
  }

  /**
   * 加入配對（完整模式）
   */
  async joinPairing(userId: string, inviteCode: string) {
    // 1. 查找配對記錄
    const pairing = await prisma.pairing.findUnique({
      where: { invite_code: inviteCode },
      include: {
        user1: true,
        user2: true,
      },
    });

    if (!pairing) {
      throw Errors.INVALID_CODE('邀請碼無效');
    }

    // 2. 檢查是否過期
    if (pairing.expires_at && pairing.expires_at < new Date()) {
      throw Errors.CODE_EXPIRED('邀請碼已過期');
    }

    // 3. 檢查是否已使用
    if (pairing.status !== 'pending') {
      throw Errors.INVALID_CODE('邀請碼已使用');
    }

    // 4. 檢查是否自己配對
    if (pairing.user1_id === userId) {
      throw Errors.VALIDATION_ERROR('不能與自己配對');
    }

    // 5. 更新配對記錄
    const updatedPairing = await prisma.pairing.update({
      where: { id: pairing.id },
      data: {
        user2_id: userId,
        status: 'active',
        confirmed_at: new Date(),
      },
    });

    logger.info('Pairing joined', { pairingId: pairing.id, userId });

    return updatedPairing;
  }

  /**
   * 獲取配對狀態
   */
  async getPairingStatus(userId: string) {
    const pairing = await prisma.pairing.findFirst({
      where: {
        OR: [
          { user1_id: userId },
          { user2_id: userId },
        ],
        status: { in: ['pending', 'active'] },
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return pairing;
  }

  /**
   * 創建臨時配對（快速體驗模式）
   */
  async createTempPairing(sessionId: string) {
    // 檢查是否已有臨時配對
    const existingPairing = await prisma.pairing.findFirst({
      where: {
        session_id: sessionId,
        pairing_type: 'quick',
      },
    });

    if (existingPairing) {
      return existingPairing;
    }

    // 創建臨時配對
    const tempPairing = await prisma.pairing.create({
      data: {
        user1_id: null,
        user2_id: null,
        invite_code: null,
        status: 'temp',
        pairing_type: 'quick',
        session_id: sessionId,
        expires_at: null, // 快速體驗模式不過期
      },
    });

    return tempPairing;
  }

  /**
   * 通過Session ID獲取配對（快速體驗模式）
   */
  async getPairingBySessionId(sessionId: string) {
    const pairing = await prisma.pairing.findFirst({
      where: {
        session_id: sessionId,
        pairing_type: 'quick',
      },
    });

    return pairing;
  }
}

export const pairingService = new PairingService();

