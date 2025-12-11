import { PrismaClient } from '@prisma/client';
import { env } from './env';
import logger from './logger';

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// 連接數據庫
prisma.$connect()
  .then(() => {
    logger.info('數據庫連接成功');
  })
  .catch((error) => {
    logger.error('數據庫連接失敗', { error });
    process.exit(1);
  });

// 優雅關閉
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('數據庫連接已關閉');
});

export default prisma;

