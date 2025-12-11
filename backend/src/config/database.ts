import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { env } from './env';
import logger from './logger';

// 解析 DATABASE_URL 以進行診斷
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      hasPassword: !!parsed.password,
      username: parsed.username,
    };
  } catch (error) {
    return null;
  }
}

// 創建 Prisma Client，配置連接池和超時
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  // 連接池配置
  // 注意：這些配置通過 DATABASE_URL 的查詢參數設置
});

// 連接數據庫並運行遷移
async function initializeDatabase() {
  try {
    // 診斷 DATABASE_URL 配置
    const dbInfo = parseDatabaseUrl(env.DATABASE_URL);
    if (dbInfo) {
      logger.info('數據庫連接信息', {
        hostname: dbInfo.hostname,
        port: dbInfo.port || '5432 (默認)',
        database: dbInfo.pathname,
        username: dbInfo.username,
        hasPassword: dbInfo.hasPassword,
      });
    } else {
      logger.warn('無法解析 DATABASE_URL，請檢查格式');
    }

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
        // 如果遷移失敗，記錄詳細錯誤但繼續嘗試連接
        const errorMessage = migrationError.message || migrationError.toString();
        const errorOutput = migrationError.stdout?.toString() || migrationError.stderr?.toString() || '';
        
        logger.warn('數據庫遷移失敗，嘗試直接連接', { 
          error: errorMessage,
          output: errorOutput.substring(0, 500), // 限制輸出長度
        });
        
        // 檢查是否是連接問題
        if (errorMessage.includes('P1001') || errorMessage.includes("Can't reach database server")) {
          logger.error('無法連接到數據庫服務器，請檢查：', {
            suggestions: [
              '1. 確認 Supabase 項目是否處於活動狀態',
              '2. 檢查 Supabase 的 IP 白名單設置（應允許所有 IP 或添加 Railway IP）',
              '3. 驗證 DATABASE_URL 是否正確（特別是密碼中的特殊字符需要 URL 編碼）',
              '4. 確認 Supabase 數據庫沒有暫停',
            ],
          });
        }
        // 不退出，繼續嘗試連接（可能表已經存在）
      }
    }

    // 連接數據庫（帶重試機制）
    let retries = 3;
    let lastError: any = null;
    
    while (retries > 0) {
      try {
        // 設置連接超時（10秒）
        await Promise.race([
          prisma.$connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('連接超時（10秒）')), 10000)
          ),
        ]);
        
        // 測試連接：執行一個簡單查詢
        await prisma.$queryRaw`SELECT 1`;
        
        logger.info('數據庫連接成功並驗證通過');
        return; // 連接成功，退出函數
      } catch (connectError: any) {
        lastError = connectError;
        retries--;
        
        // 詳細錯誤信息
        const errorCode = connectError.code || connectError.errorCode || 'UNKNOWN';
        const errorName = connectError.name || 'UnknownError';
        const errorMessage = connectError.message || connectError.toString();
        
        if (retries > 0) {
          logger.warn(`數據庫連接失敗，${retries} 次重試機會`, { 
            errorCode,
            errorName,
            error: errorMessage.substring(0, 200),
          });
          await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒後重試
        } else {
          // 最後一次失敗，提供詳細診斷
          logger.error('數據庫連接失敗，已用盡所有重試機會', { 
            errorCode,
            errorName,
            error: errorMessage,
          });
          
          // 根據錯誤類型提供建議
          if (errorCode === 'P1001' || errorMessage.includes("Can't reach database server")) {
            logger.error('連接診斷建議：', {
              problem: '無法到達數據庫服務器',
              possibleCauses: [
                'Supabase 項目可能已暫停或限制連接',
                'IP 白名單設置可能阻止了 Railway 的 IP',
                '網絡路由問題（Railway 到 Supabase）',
                'DATABASE_URL 配置錯誤',
              ],
              solutions: [
                '1. 登錄 Supabase Dashboard，檢查項目狀態',
                '2. 在 Supabase Settings > Database > Connection Pooling 中檢查 IP 限制',
                '3. 確認 DATABASE_URL 中的密碼已正確 URL 編碼（@ 應為 %40）',
                '4. 嘗試使用 Supabase 的 Connection Pooling URL（如果可用）',
                '5. 檢查 Supabase 項目的使用配額是否已超限',
              ],
            });
          } else if (errorCode === 'P1000' || errorMessage.includes('Authentication failed')) {
            logger.error('認證失敗，請檢查：', {
              problem: '數據庫認證失敗',
              solutions: [
                '1. 驗證 DATABASE_URL 中的用戶名和密碼是否正確',
                '2. 確認密碼中的特殊字符已正確 URL 編碼',
                '3. 檢查 Supabase 數據庫用戶權限',
              ],
            });
          }
        }
      }
    }
    
    // 所有重試都失敗
    logger.warn('應用將繼續運行，但數據庫功能可能不可用');
    logger.warn('請檢查 Railway 環境變量中的 DATABASE_URL 配置');
  } catch (error) {
    logger.error('數據庫初始化過程中發生未預期的錯誤', { error });
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

