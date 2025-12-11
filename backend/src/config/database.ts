import { PrismaClient } from '@prisma/client';
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
          cwd: process.cwd()
        });
        logger.info('數據庫遷移完成');
      } catch (migrationError: any) {
        // 如果遷移失敗，記錄警告但繼續嘗試連接
        const errorMessage = migrationError.message || migrationError.toString();
        logger.warn('數據庫遷移失敗，嘗試直接連接', { error: errorMessage });
      }
    }

    // 連接數據庫
    await prisma.$connect();
    logger.info('數據庫連接成功');
  } catch (error) {
    logger.error('數據庫連接失敗', { error });
    process.exit(1);
  }
}

initializeDatabase();

// 優雅關閉
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('數據庫連接已關閉');
});

export default prisma;

