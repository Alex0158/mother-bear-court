import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { generalLimiter } from './middleware/rateLimiter';
import { responseFormatter } from './middleware/responseFormatter';
import { requestId } from './middleware/requestId';
import { performanceMonitor } from './middleware/performance';

// 導入路由
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import userRoutes from './routes/user.routes';
import pairingRoutes from './routes/pairing.routes';
import caseRoutes from './routes/case.routes';
import judgmentRoutes from './routes/judgment.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import executionRoutes from './routes/execution.routes';

const app: Application = express();

// 安全中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS配置
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允許的來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));

// 壓縮響應
app.use(compression());

// 解析JSON請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求ID（必須在日誌之前）
app.use(requestId);

// 性能監控（必須在日誌之前）
app.use(performanceMonitor);

// 請求日誌
app.use(requestLogger);

// 響應格式化
app.use(responseFormatter);

// 通用限流
app.use(generalLimiter);

// 健康檢查路由（不限制流，用於監控）
app.use('/', healthRoutes);

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/pairing', pairingRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/judgments', judgmentRoutes);
app.use('/api/v1', reconciliationRoutes);
app.use('/api/v1/execution', executionRoutes);

// 404處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在',
    },
  });
});

// 錯誤處理（必須在最後）
app.use(errorHandler);

export default app;

