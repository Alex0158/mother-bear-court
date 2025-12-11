/**
 * 緩存工具類
 * 支持Redis（生產環境）和內存緩存（開發環境）降級
 */

import logger from '../config/logger';

// 內存緩存（降級方案）
interface CacheEntry<T> {
  data: T;
  expires: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize = 1000; // 最大緩存條目數

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // 檢查是否過期
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    // 如果緩存已滿，刪除最舊的條目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理過期條目
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }
}

// 全局內存緩存實例
const memoryCache = new MemoryCache();

// 定期清理過期條目（每5分鐘）
setInterval(() => {
  const count = memoryCache.cleanup();
  if (count > 0) {
    logger.debug('Memory cache cleanup', { count });
  }
}, 5 * 60 * 1000);

/**
 * 緩存服務
 */
export class CacheService {
  private redis: any = null; // Redis客戶端（可選）

  constructor() {
    // 嘗試初始化Redis（如果可用）
    this.initRedis().catch(err => {
      logger.warn('Redis not available, using memory cache', { error: err.message });
    });
  }

  /**
   * 初始化Redis（可選）
   */
  private async initRedis(): Promise<void> {
    // 如果環境變量中有Redis配置，嘗試連接
    // 這裡預留接口，實際使用時需要安裝redis包
    // const redis = require('redis');
    // this.redis = redis.createClient({ url: process.env.REDIS_URL });
    // await this.redis.connect();
  }

  /**
   * 獲取緩存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // 優先使用Redis
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
        return null;
      }
    } catch (error) {
      logger.warn('Redis get failed, falling back to memory cache', { key, error });
    }

    // 降級到內存緩存
    return memoryCache.get<T>(key);
  }

  /**
   * 設置緩存
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      // 優先使用Redis
      if (this.redis) {
        await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
        return;
      }
    } catch (error) {
      logger.warn('Redis set failed, falling back to memory cache', { key, error });
    }

    // 降級到內存緩存
    memoryCache.set(key, value, ttlSeconds);
  }

  /**
   * 刪除緩存
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      }
    } catch (error) {
      logger.warn('Redis delete failed', { key, error });
    }

    memoryCache.delete(key);
  }

  /**
   * 生成緩存鍵
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * 生成哈希鍵（用於長字符串）
   */
  static generateHashKey(prefix: string, content: string): string {
    // 簡單的哈希函數（生產環境建議使用crypto）
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為32位整數
    }
    return `${prefix}:${Math.abs(hash)}`;
  }
}

export const cacheService = new CacheService();

