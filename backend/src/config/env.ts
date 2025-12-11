// 動態導入dotenv以避免類型錯誤
try {
  require('dotenv').config();
} catch {
  // dotenv可能未安裝，忽略
}

interface EnvConfig {
  // 服務器配置
  PORT: number;
  NODE_ENV: string;
  
  // 數據庫配置
  DATABASE_URL: string;
  
  // JWT配置
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // OpenAI配置
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_MAX_TOKENS: number;
  OPENAI_DAILY_LIMIT: number;
  
  // 郵件配置
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  
  // 文件存儲配置
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  
  // 前端URL
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
}

function getEnvConfig(): EnvConfig {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `
缺少必需的環境變量: ${missingVars.join(', ')}

請檢查以下配置：
1. DATABASE_URL - 數據庫連接字符串
2. JWT_SECRET - JWT密鑰（建議使用強隨機字符串）
3. OPENAI_API_KEY - OpenAI API密鑰

請參考 .env.example 文件配置環境變量。
    `.trim();
    throw new Error(errorMessage);
  }

  // 驗證環境變量格式
  validateEnvVars();

  return {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    DATABASE_URL: process.env.DATABASE_URL!,
    
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
    OPENAI_DAILY_LIMIT: parseInt(process.env.OPENAI_DAILY_LIMIT || '1000', 10),
    
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),
  };
}

/**
 * 驗證環境變量格式
 */
function validateEnvVars(): void {
  // 驗證DATABASE_URL格式
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('警告: DATABASE_URL格式可能不正確，應以postgresql://開頭');
  }

  // 驗證JWT_SECRET強度
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('警告: JWT_SECRET長度建議至少32字符，當前長度:', process.env.JWT_SECRET.length);
  }

  // 驗證OPENAI_API_KEY格式
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.warn('警告: OPENAI_API_KEY格式可能不正確，應以sk-開頭');
  }

  // 驗證端口範圍
  const port = parseInt(process.env.PORT || '3000', 10);
  if (port < 1 || port > 65535) {
    throw new Error(`無效的端口號: ${port}，應在1-65535之間`);
  }

  // 驗證OpenAI配置
  const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10);
  if (maxTokens < 1 || maxTokens > 4000) {
    console.warn('警告: OPENAI_MAX_TOKENS應在1-4000之間，當前值:', maxTokens);
  }

  const dailyLimit = parseInt(process.env.OPENAI_DAILY_LIMIT || '1000', 10);
  if (dailyLimit < 1) {
    console.warn('警告: OPENAI_DAILY_LIMIT應大於0，當前值:', dailyLimit);
  }
}

export const env = getEnvConfig();

