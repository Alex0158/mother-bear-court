/**
 * Session API（快速體驗模式）
 */

import request from '../request';
import type { ApiResponse } from '@/types/common';
import type { Session } from '@/types/session';

/**
 * 創建Session
 */
export const createSession = async (): Promise<Session> => {
  const response = await request.get<ApiResponse<{ session_id: string; expires_at: string }>>(
    '/sessions/create'
  );
  const data = (response.data as ApiResponse<{ session_id: string; expires_at: string }>).data;
  return {
    session_id: data.session_id,
    expires_at: data.expires_at,
  };
};

