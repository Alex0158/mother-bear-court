/**
 * 分布式鎖工具（使用數據庫實現簡單的鎖機制）
 * 生產環境建議使用Redis實現真正的分布式鎖
 */

import prisma from '../config/database';
import logger from '../config/logger';
import { Errors } from './errors';

interface LockEntry {
  key: string;
  expiresAt: Date;
}

/**
 * 簡單的內存鎖（單實例有效）
 * 多實例部署時需要Redis分布式鎖
 */
class SimpleLock {
  private locks: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 每分鐘清理過期鎖
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * 嘗試獲取鎖
   */
  async acquire(key: string, ttlSeconds: number = 60): Promise<boolean> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const existing = this.locks.get(key);

    // 如果鎖已存在且未過期，返回false
    if (existing && existing > Date.now()) {
      return false;
    }

    // 獲取鎖
    this.locks.set(key, expiresAt);
    return true;
  }

  /**
   * 釋放鎖
   */
  async release(key: string): Promise<void> {
    this.locks.delete(key);
  }

  /**
   * 清理過期鎖
   */
  private cleanup(): void {
    const now = Date.now();
    let count = 0;

    for (const [key, expiresAt] of this.locks.entries()) {
      if (expiresAt <= now) {
        this.locks.delete(key);
        count++;
      }
    }

    if (count > 0) {
      logger.debug('Lock cleanup', { count });
    }
  }

  /**
   * 清理所有資源
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.locks.clear();
  }
}

// 全局鎖實例
const simpleLock = new SimpleLock();

/**
 * 鎖服務
 */
export class LockService {
  private redis: any = null; // Redis客戶端（可選）

  constructor() {
    // 嘗試初始化Redis（如果可用）
    this.initRedis().catch(err => {
      logger.warn('Redis not available, using simple lock', { error: err.message });
    });
  }

  /**
   * 初始化Redis（可選）
   */
  private async initRedis(): Promise<void> {
    // 如果環境變量中有Redis配置，嘗試連接
    // 這裡預留接口，實際使用時需要安裝redis包
  }

  /**
   * 嘗試獲取鎖
   */
  async acquire(key: string, ttlSeconds: number = 60): Promise<boolean> {
    try {
      // 優先使用Redis分布式鎖
      if (this.redis) {
        const result = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
      }
    } catch (error) {
      logger.warn('Redis lock failed, falling back to simple lock', { key, error });
    }

    // 降級到簡單鎖
    return await simpleLock.acquire(key, ttlSeconds);
  }

  /**
   * 釋放鎖
   */
  async release(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
        return;
      }
    } catch (error) {
      logger.warn('Redis unlock failed', { key, error });
    }

    await simpleLock.release(key);
  }

  /**
   * 執行帶鎖的操作
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 60
  ): Promise<T> {
    const acquired = await this.acquire(key, ttlSeconds);
    
    if (!acquired) {
      throw Errors.CONFLICT('操作正在進行中，請稍後再試');
    }

    try {
      return await fn();
    } finally {
      await this.release(key);
    }
  }
}

export const lockService = new LockService();

