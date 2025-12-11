import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 響應格式化中間件
 * 統一API響應格式，添加請求ID和時間戳
 */
export const responseFormatter = (req: Request, res: Response, next: NextFunction): void => {
  // 生成請求ID
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  // 保存原始的json方法
  const originalJson = res.json.bind(res);

  // 重寫json方法，統一響應格式
  res.json = function (data: any) {
    // 如果已經是格式化後的響應，直接返回
    if (data && typeof data === 'object' && 'success' in data) {
      // 添加meta信息
      if (!data.meta) {
        data.meta = {};
      }
      data.meta.request_id = requestId;
      data.meta.timestamp = new Date().toISOString();
      return originalJson(data);
    }

    // 格式化成功響應
    const formattedResponse = {
      success: true,
      data,
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
      },
    };

    return originalJson(formattedResponse);
  };

  next();
};

