/**
 * Jest測試環境設置
 */

// 設置測試環境變量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mother_bear_court_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.OPENAI_API_KEY = 'test-openai-api-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';

// 抑制控制台輸出（測試時）
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

