import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { env } from './env';
import logger from './logger';

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// 連接數據庫並運行遷移
async function initializeDatabase() {
  try {
    // 先運行數據庫遷移（如果需要的話）
    if (process.env.RUN_MIGRATIONS !== 'false') {
      try {
        logger.info('正在運行數據庫遷移...');
        execSync('npx prisma db push --accept-data-loss', { 
          stdio: 'pipe',
          env: { ...process.env },
          cwd: process.cwd(),
          timeout: 30000 // 30秒超時
        });
        logger.info('數據庫遷移完成');
      } catch (migrationError: any) {
        // 如果遷移失敗，記錄警告但繼續嘗試連接
        const errorMessage = migrationError.message || migrationError.toString();
        logger.warn('數據庫遷移失敗，嘗試直接連接', { error: errorMessage });
        // 不退出，繼續嘗試連接（可能表已經存在）
      }
    }

    // 連接數據庫（帶重試機制）
    let retries = 3;
    let lastError: any = null;
    
    while (retries > 0) {
      try {
        await prisma.$connect();
        logger.info('數據庫連接成功');
        return; // 連接成功，退出函數
      } catch (connectError: any) {
        lastError = connectError;
        retries--;
        if (retries > 0) {
          logger.warn(`數據庫連接失敗，${retries} 次重試機會`, { error: connectError.message });
          await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒後重試
        }
      }
    }
    
    // 所有重試都失敗
    logger.error('數據庫連接失敗，已用盡所有重試機會', { error: lastError });
    // 不立即退出，讓應用繼續運行（可能只是暫時的網絡問題）
    // Railway 會自動重啟，我們給它機會恢復
    logger.warn('應用將繼續運行，但數據庫功能可能不可用');
  } catch (error) {
    logger.error('數據庫初始化過程中發生未預期的錯誤', { error });
    // 不退出，讓應用繼續運行
    logger.warn('應用將繼續運行，但數據庫功能可能不可用');
  }
}

initializeDatabase();

// 優雅關閉
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('數據庫連接已關閉');
});

export default prisma;

